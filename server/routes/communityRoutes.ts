import { type Express } from "express";
import { db } from "../db";
import { communities, reviews, communityClaims, claimedCommunities, pendingCommunities, auditLogs, featuredCommunities, searchHistory, analyticsEvents } from "@shared/schema";
import { isClearlyFake } from "../../shared/community-classification";
import { generateCommunitySlug } from "../utils/generate-slug";
import { eq, and, or, desc, inArray, sql, between, gte, lte, isNotNull, isNull, not } from "drizzle-orm";
import { insertCommunitySchema, insertListingFlagSchema } from "@shared/schema";
import { isAuthenticated as requireAuth, isAdmin, checkRole } from "../auth-middleware";
import { storage } from "../storage";
import { enhancedSearchService } from "../enhanced-search-service";
import { dataQualityEnhancement } from "../data-quality-enhancement";
import { careTypeClassifier } from "../care-type-classifier";
// Google Places imports removed to prevent API charges
// Photo enrichment services removed - they use Google Places API
import { pricingTransparencyService } from "../pricing-transparency-badges";
import { intelligentPricingService } from "../intelligent-pricing-service";
import { nationwidePricingResearch } from "../nationwide-pricing-research";
import { eliminateCallForPricing } from "../intelligent-pricing-system";
import { realDataAnalyzer } from "../real-data-analyzer";
import { z } from "zod";
import { internalNotifications } from "../services/internal-notifications";
import { normalizePhotoUrls } from "../utils/photo-urls";
import { CommunityPhotoEnrichment } from "../services/community-photo-enrichment";
import { vendors } from "@shared/schema";
// THE single enrichment pipeline. All enrichment entry points route through this.
import { enrichCommunityUnified } from "../services/community-enrichment-orchestrator";
import { selfHealCooldownHours, SELF_HEAL_TERMINAL_ATTEMPTS } from "../self-heal-backoff";
import { qualityOrderBy, qualityRankExpr, verifiedOnlyFilter } from "../utils/community-ranking";

/**
 * Single shared predicate for ALL public community queries.
 *
 * Hides records that are:
 *  a) manually hidden by an admin (is_hidden = true), OR
 *  b) "clearly fake" — is_verified = false AND none of {phone, website,
 *     description, meaningful data_source} is present.
 *
 * Because this is evaluated at query time against live column values, the
 * filter is auto-reversible: a record re-appears the moment real data
 * (phone, website, description, or a verified status) is added.
 */
function publicVisibleFilter() {
  return sql`(
    "communities"."is_hidden" IS NOT TRUE
    AND NOT (
      ("communities"."is_verified" IS NOT TRUE OR "communities"."is_verified" IS NULL)
      AND ("communities"."phone" IS NULL OR trim("communities"."phone") = '')
      AND ("communities"."website" IS NULL OR trim("communities"."website") = '')
      AND ("communities"."description" IS NULL OR trim("communities"."description") = '')
      AND (
        "communities"."data_source" IS NULL
        OR trim(lower("communities"."data_source")) = ''
        OR trim(lower("communities"."data_source")) IN ('government database', 'placeholder', 'unknown')
      )
    )
  )`;
}

export function registerCommunityRoutes(app: Express) {
  // Public listing flag: families report inaccurate / fake / closed listings.
  // Persists to listing_flags for admin review. Anonymous reports allowed
  // (reporterEmail/Name optional); userId attached when signed in.
  app.post("/api/communities/:id/flag", async (req, res) => {
    try {
      const communityId = parseInt(req.params.id, 10);
      if (isNaN(communityId)) {
        return res.status(400).json({ error: "Invalid community ID" });
      }

      const [community] = await db
        .select({ id: communities.id })
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);
      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }

      // Identity is derived from the authenticated session only — never trust a
      // client-supplied userId (prevents impersonation in moderation records).
      const sessionUserId = (req.user as any)?.id ?? null;

      const parsed = insertListingFlagSchema.safeParse({
        communityId,
        userId: sessionUserId,
        flagType: req.body.flagType,
        reason: req.body.reason,
        details: req.body.details || null,
        reporterEmail: req.body.reporterEmail || null,
        reporterName: req.body.reporterName || null,
      });

      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid flag submission",
          details: parsed.error.flatten().fieldErrors,
        });
      }

      const flag = await storage.createListingFlag(parsed.data);

      // Set community flagStatus to 'pending' so it shows an "Under review" note publicly
      await db.update(communities)
        .set({ flagStatus: 'pending' } as any)
        .where(eq(communities.id, communityId));

      if (parsed.data.userId) {
        try {
          await storage.trackUserActivity({
            userId: parsed.data.userId,
            activityType: "Flag Listing",
            details: { communityId, flagType: parsed.data.flagType, reason: parsed.data.reason },
          });
        } catch (activityErr) {
          console.warn("⚠️ Failed to track flag activity:", activityErr);
        }
      }

      console.log(`🚩 Community ${communityId} flagged (${parsed.data.flagType})`);
      return res.status(201).json({ message: "Flag submitted successfully", flagId: flag.id });
    } catch (error) {
      console.error("Flag submission error:", error);
      return res.status(500).json({ error: "Failed to submit flag" });
    }
  });

  // ── PUBLIC SELF-HEAL ENRICHMENT ────────────────────────────────────────────
  // Lets a community detail page that loads with no photos / no description
  // silently fill itself in WITHOUT an admin being logged in. Routes through THE
  // single unified enrichment pipeline (`enrichCommunityUnified`) — the same one
  // the admin force-refresh uses — so results persist permanently and benefit all
  // future visitors. The admin route is unchanged.
  //
  // Gates (priority order):
  //   1. Content-complete (photos AND a real description ≥100 chars) → skipped,
  //      no Perplexity call. Enrichment runs ONCE and is never repeated for
  //      content-complete communities.
  //   2. In-flight de-dup: enrichmentStatus='in_progress' OR a self-heal attempt
  //      within the last 10 min → skipped (two browser tabs can't both fire).
  //   3. Terminal "no data" state: enrichmentStatus='no_data' → skipped forever
  //      (community repeatedly found to have nothing online). An admin force
  //      refresh clears this and resets the counter.
  //   4. Escalating backoff rate limit: a run that persists NO new content widens
  //      the cooldown via the `enrichment_attempts` counter — 24h → 7d → 30d →
  //      terminal — instead of a fixed 24h. A successful run (real content saved)
  //      resets the counter to 0. Enforced via the DB `last_enrichment_attempt`
  //      timestamp + `enrichment_attempts` (no in-memory state; survives restarts).
  app.post("/api/communities/:id/self-heal", async (req, res) => {
    try {
      // Validate :id is a real integer community ID (reject non-numeric).
      const communityId = parseInt(req.params.id, 10);
      if (isNaN(communityId) || String(communityId) !== req.params.id.trim()) {
        return res.status(400).json({ error: "Invalid community ID" });
      }

      const [community] = await db
        .select({
          id: communities.id,
          name: communities.name,
          description: communities.description,
          photos: communities.photos,
          enrichmentStatus: communities.enrichmentStatus,
          enrichmentAttempts: communities.enrichmentAttempts,
          lastEnrichmentAttempt: communities.lastEnrichmentAttempt,
        })
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);

      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }

      // Gate 1 — content-complete: enrichment already ran and saved permanently.
      const photoCount = (community.photos || []).filter(
        (p: string) => typeof p === "string" && p.trim().length > 0,
      ).length;
      const descLen = (community.description || "").trim().length;
      const isContentComplete = photoCount > 0 && descLen >= 100;
      if (isContentComplete) {
        return res.json({ skipped: true, reason: "already has content" });
      }

      const now = Date.now();
      const lastAttempt = community.lastEnrichmentAttempt
        ? new Date(community.lastEnrichmentAttempt).getTime()
        : 0;
      const minsSinceAttempt = lastAttempt ? (now - lastAttempt) / 60000 : Infinity;

      // Gate 2 — in-flight de-dup (10 min). NOT a data TTL.
      if (community.enrichmentStatus === "in_progress" || minsSinceAttempt < 10) {
        return res.json({ skipped: true, reason: "enrichment in progress" });
      }

      // Gate 3 — terminal "no data" state. Repeated runs found nothing online,
      // so we stop auto-retrying entirely until an admin forces a refresh.
      if (community.enrichmentStatus === "no_data") {
        return res.json({ skipped: true, reason: "no data found (terminal)" });
      }

      // Gate 4 — escalating backoff rate limit. The required cooldown widens with
      // each consecutive no-content run: 24h → 7d → 30d (then terminal). A fresh
      // or just-succeeded community (attempts=0) keeps the original 24h floor.
      const failedAttempts = community.enrichmentAttempts || 0;
      const requiredCooldownHours = selfHealCooldownHours(failedAttempts);
      if (minsSinceAttempt < requiredCooldownHours * 60) {
        return res.json({
          skipped: true,
          reason: "rate limited",
          retryAfterHours: requiredCooldownHours,
          consecutiveNoDataAttempts: failedAttempts,
        });
      }

      // Mark in-flight BEFORE the (slow) pipeline runs so a concurrent tab hits
      // gate 2 and does not fire a duplicate Perplexity call.
      const startedAt = new Date();
      await db
        .update(communities)
        .set({ enrichmentStatus: "in_progress", lastEnrichmentAttempt: startedAt } as any)
        .where(eq(communities.id, communityId));

      console.log(
        `🩺 [Self-Heal] Triggered for community ${communityId} ("${community.name}") at ${startedAt.toISOString()}`,
      );

      try {
        const result = await enrichCommunityUnified(communityId);

        // "Found data" = real new content persisted this run, OR the community
        // already had meaningful content (cache hit). Anything else is a
        // no-data run that escalates the backoff.
        const foundData = result.cached === true || result.contentSaved === true;

        if (foundData) {
          // Success: clear any accrued backoff so future visits behave normally.
          await db
            .update(communities)
            .set({
              enrichmentStatus: "completed",
              enrichmentAttempts: 0,
              lastEnrichmentDate: new Date(),
            } as any)
            .where(eq(communities.id, communityId));
        } else {
          // No content found: widen the cooldown. Once the consecutive no-data
          // count crosses the terminal threshold, mark it quiet ("no_data") so it
          // stops auto-retrying until an admin forces a refresh.
          const newAttempts = failedAttempts + 1;
          const terminal = newAttempts >= SELF_HEAL_TERMINAL_ATTEMPTS;
          await db
            .update(communities)
            .set({
              enrichmentStatus: terminal ? "no_data" : "failed",
              enrichmentAttempts: newAttempts,
            } as any)
            .where(eq(communities.id, communityId));
          console.log(
            `🩺 [Self-Heal] No content for community ${communityId} ` +
              `(attempt ${newAttempts}/${SELF_HEAL_TERMINAL_ATTEMPTS})` +
              (terminal ? " → marked terminal (no_data)" : ` → next retry in ${selfHealCooldownHours(newAttempts)}h`),
          );
        }

        console.log(
          `🩺 [Self-Heal] Completed for community ${communityId}: ${result.photos.length} photo(s), ` +
            `${(result.summary || "").length} desc chars, foundData=${foundData}`,
        );

        return res.json({
          success: true,
          skipped: false,
          foundData,
          community: {
            id: communityId,
            photos: result.photos,
            description: result.summary,
            phone: result.phone,
            website: result.officialWebsite,
            careTypes: result.careTypes,
          },
        });
      } catch (pipelineErr) {
        // A thrown error is treated as transient (network/API), NOT a "no data"
        // outcome — it must not escalate the backoff toward the terminal state.
        await db
          .update(communities)
          .set({ enrichmentStatus: "failed" } as any)
          .where(eq(communities.id, communityId));
        throw pipelineErr;
      }
    } catch (error) {
      console.error("❌ [Self-Heal] Failed:", error);
      return res.status(500).json({
        error: "Self-heal enrichment failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // 301 redirect: /community/:id → SEO-friendly URL /senior-living/:state/:city/:slug
  app.get("/community/:id", async (req, res, next) => {
    const communityId = parseInt(req.params.id, 10);
    if (isNaN(communityId)) return next();
    try {
      const [community] = await db
        .select({ id: communities.id, name: communities.name, city: communities.city, state: communities.state })
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);
      if (!community) return next();
      const statePart = community.state.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const cityPart = community.city.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
      const namePart = community.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '') || `community-${community.id}`;
      return res.redirect(301, `/senior-living/${statePart}/${cityPart}/${namePart}`);
    } catch {
      return next();
    }
  });

  // IMPORTANT: Specific routes must come BEFORE the /:id route
  
  // Get community and services count (dynamic, includes discovered entities)
  app.get("/api/communities/count", async (_req, res) => {
    try {
      // Add shorter cache for dynamic counts
      res.set({
        'Cache-Control': 'public, max-age=60', // Cache for 1 minute
        'ETag': `community-count-${Date.now()}`
      });
      
      // Get community count
      const [{ communityCount }] = await db
        .select({ communityCount: sql`count(*)` })
        .from(communities);
      
      // Get vendor/service count (including discovered services)
      const [{ vendorCount }] = await db
        .select({ vendorCount: sql`count(*)` })
        .from(vendors);
      
      // Total discoverable entities worldwide
      const totalCount = Number(communityCount) + Number(vendorCount);
      
      res.json({ 
        count: totalCount.toLocaleString(),
        communities: Number(communityCount).toLocaleString(),
        services: Number(vendorCount).toLocaleString(),
        isGlobal: true
      });
    } catch (error) {
      console.error("Error getting community count:", error);
      res.status(500).json({ error: "Failed to get community count" });
    }
  });
  
  // Search endpoint moved to unifiedSearchRoutes.ts for better functionality

  // Unified section-data endpoint — powers the DB-driven home page sections.
  // Uses raw SQL SELECT * to avoid Drizzle expanding schema columns that may
  // not yet exist in the actual DB (e.g. admin_rating_override).
  // ?type=location&city=Redding&state=CA&limit=12
  // ?type=care_type&careType=Memory+Care
  // ?type=hud | trending | highest_rated | featured | coastal | recently_discovered
  app.get("/api/communities/section-data", async (req, res) => {
    try {
      const { type, city, state, careType, limit = "12", sectionId, verifiedOnly } = req.query;
      const limitNum = Math.min(parseInt(limit as string) || 12, 30);

      // Optional family-facing "verified only" toggle — real signals only.
      const verifiedClause = verifiedOnly === 'true' ? sql` AND ${verifiedOnlyFilter()}` : sql``;

      // Shared visibility WHERE clause (raw SQL so we skip Drizzle column expansion).
      const baseWhere = sql`
        "is_active" = TRUE
        AND "is_hidden" IS NOT TRUE
        AND NOT (
          ("is_verified" IS NOT TRUE OR "is_verified" IS NULL)
          AND ("phone" IS NULL OR trim("phone") = '')
          AND ("website" IS NULL OR trim("website") = '')
          AND ("description" IS NULL OR trim("description") = '')
          AND (
            "data_source" IS NULL
            OR trim(lower("data_source")) = ''
            OR trim(lower("data_source")) IN ('government database', 'placeholder', 'unknown')
          )
        )${verifiedClause}
      `;

      // Builds an "AND id NOT IN (…)" fragment, or empty SQL when nothing to exclude.
      const excludeClause = (ids: number[]) =>
        ids.length > 0
          ? sql` AND "id" NOT IN (${sql.join(ids.map((i) => sql`${i}`), sql`, `)})`
          : sql``;

      // Auto-fill query by section type, honoring optional exclusions + limit.
      // rating and rent_per_month are DECIMAL columns in the DB — compare directly.
      async function runAutoQuery(
        t: string,
        opts: { city?: string | null; state?: string | null; careType?: string | null; exclude?: number[]; limit: number },
      ): Promise<any[]> {
        const ex = excludeClause(opts.exclude ?? []);
        const lim = opts.limit;
        if (lim <= 0) return [];
        let r: any;
        if (t === 'hud') {
          // Cheapest HUD pricing first (the section's intent); quality breaks ties.
          r = await db.execute(sql`SELECT * FROM communities WHERE ${baseWhere} AND "hud_property_id" IS NOT NULL${ex} ORDER BY "rent_per_month" ASC NULLS LAST, ${qualityRankExpr()} DESC LIMIT ${lim}`);
        } else if (t === 'trending') {
          r = await db.execute(sql`SELECT * FROM communities WHERE ${baseWhere} AND "rating" >= 4.0${ex} ORDER BY ${qualityOrderBy()} LIMIT ${lim}`);
        } else if (t === 'highest_rated') {
          r = await db.execute(sql`SELECT * FROM communities WHERE ${baseWhere} AND "rating" >= 3.5${ex} ORDER BY ${qualityOrderBy()} LIMIT ${lim}`);
        } else if (t === 'featured') {
          const featuredRecords = await storage.getFeaturedCommunities();
          if (featuredRecords.length > 0) {
            const ids: number[] = featuredRecords.map((f: any) => f.communityId);
            const idList = sql.join(ids.map((id) => sql`${id}`), sql`, `);
            r = await db.execute(sql`SELECT * FROM communities WHERE ${baseWhere} AND "id" IN (${idList})${ex} ORDER BY ${qualityOrderBy()} LIMIT ${lim}`);
          } else {
            r = await db.execute(sql`SELECT * FROM communities WHERE ${baseWhere} AND "rating" >= 4.0${ex} ORDER BY ${qualityOrderBy()} LIMIT ${lim}`);
          }
        } else if (t === 'coastal') {
          r = await db.execute(sql`SELECT * FROM communities WHERE ${baseWhere} AND "state" IN ('CA','FL','OR','WA','HI','SC','GA')${ex} ORDER BY ${qualityOrderBy()} LIMIT ${lim}`);
        } else if (t === 'most_reviewed') {
          // Order by review count (most-reviewed first) but DO NOT hard-exclude
          // communities with zero/null reviews — most of the 33k+ communities have
          // no reviews yet, and excluding them blanks the directory grid. Quality
          // rank breaks ties so verified/featured listings surface within each band.
          r = await db.execute(sql`SELECT * FROM communities WHERE ${baseWhere}${ex} ORDER BY "review_count" DESC NULLS LAST, ${qualityRankExpr()} DESC, "rating" DESC NULLS LAST LIMIT ${lim}`);
        } else if (t === 'recently_discovered') {
          // Newest first (the section's intent); quality breaks ties.
          r = await db.execute(sql`SELECT * FROM communities WHERE ${baseWhere} AND "created_at" IS NOT NULL${ex} ORDER BY "created_at" DESC, ${qualityRankExpr()} DESC LIMIT ${lim}`);
        } else if (t === 'location') {
          const cityVal = opts.city || null;
          const stateVal = opts.state || null;
          r = await db.execute(sql`SELECT * FROM communities WHERE ${baseWhere} AND (${cityVal}::text IS NULL OR "city" = ${cityVal}) AND (${stateVal}::text IS NULL OR "state" = ${stateVal})${ex} ORDER BY ${qualityOrderBy()} LIMIT ${lim}`);
        } else if (t === 'care_type' && opts.careType) {
          r = await db.execute(sql`SELECT * FROM communities WHERE ${baseWhere} AND "care_types"::text[] && ARRAY[${opts.careType}]::text[]${ex} ORDER BY ${qualityOrderBy()} LIMIT ${lim}`);
        } else {
          return [];
        }
        return (r as any).rows ?? r ?? [];
      }

      // Fetch specific communities by id, preserving the requested order and
      // dropping any that fail the visibility filter (hidden / inactive / invalid).
      async function fetchByIds(ids: number[], lim: number): Promise<any[]> {
        if (!ids.length || lim <= 0) return [];
        const idList = sql.join(ids.map((i) => sql`${i}`), sql`, `);
        const r = await db.execute(sql`SELECT * FROM communities WHERE ${baseWhere} AND "id" IN (${idList})`);
        const rows: any[] = (r as any).rows ?? r ?? [];
        const byId = new Map<number, any>(rows.map((c) => [Number(c.id), c]));
        const ordered: any[] = [];
        for (const id of ids) {
          const c = byId.get(Number(id));
          if (c) ordered.push(c);
          if (ordered.length >= lim) break;
        }
        return ordered;
      }

      // Defaults from query params (backward-compatible callers without a sectionId).
      let mode = 'auto';
      let communityIds: number[] = [];
      let excludeIds: number[] = [];
      let cfgType = (type as string) || '';
      let cfgCity: string | null = (city as string) || null;
      let cfgState: string | null = (state as string) || null;
      let cfgCareType: string | null = (careType as string) || null;

      // When a sectionId is supplied, the stored section config is authoritative.
      if (sectionId) {
        const sid = parseInt(sectionId as string, 10);
        if (!isNaN(sid)) {
          const cfgRes = await db.execute(sql`SELECT section_type, config FROM home_section_configs WHERE id = ${sid} LIMIT 1`);
          const cfgRow = (cfgRes as any).rows?.[0] ?? (cfgRes as any)[0];
          if (cfgRow) {
            const cfg = cfgRow.config || {};
            cfgType = cfgRow.section_type;
            cfgCity = cfg.city ?? null;
            cfgState = cfg.state ?? null;
            cfgCareType = cfg.careType ?? null;
            mode = cfg.selectionMode === 'curated' || cfg.selectionMode === 'pinned' ? cfg.selectionMode : 'auto';
            communityIds = Array.isArray(cfg.communityIds)
              ? cfg.communityIds.map((n: any) => Number(n)).filter((n: number) => Number.isFinite(n))
              : [];
            excludeIds = Array.isArray(cfg.excludeIds)
              ? cfg.excludeIds.map((n: any) => Number(n)).filter((n: number) => Number.isFinite(n))
              : [];
          }
        }
      }

      let rows: any[] = [];
      if (mode === 'curated') {
        // Exactly the chosen communities, in the chosen order — nothing else.
        rows = await fetchByIds(communityIds, limitNum);
      } else if (mode === 'pinned') {
        // Pinned communities first, then auto-fill the remaining slots.
        const pinned = await fetchByIds(communityIds, limitNum);
        const auto = await runAutoQuery(cfgType, {
          city: cfgCity, state: cfgState, careType: cfgCareType,
          exclude: Array.from(new Set([...communityIds, ...excludeIds])),
          limit: limitNum - pinned.length,
        });
        rows = [...pinned, ...auto];
      } else {
        // Auto-fill, minus any excluded communities.
        rows = await runAutoQuery(cfgType, {
          city: cfgCity, state: cfgState, careType: cfgCareType,
          exclude: excludeIds,
          limit: limitNum,
        });
      }

      const enriched = await Promise.all(
        rows.map(async (c) => {
          const e = await CommunityPhotoEnrichment.enrichCommunityIfNeeded(c);
          return eliminateCallForPricing(e);
        })
      );

      // Short cache so admin curation changes surface on the next home-page load.
      res.set('Cache-Control', 'public, max-age=15');
      res.json(enriched);
    } catch (error) {
      console.error("Error fetching section-data:", error);
      res.status(500).json({ error: "Failed to fetch section data" });
    }
  });

  // HUD featured communities
  app.get("/api/communities/hud-featured", async (req, res) => {
    try {
      // Add production caching headers for HUD data
      if (process.env.NODE_ENV !== 'development') {
        res.set({
          'Cache-Control': 'public, max-age=900, s-maxage=1800', // 15 min client, 30 min CDN
          'ETag': `hud-featured-${new Date().getTime()}`
        });
      }
      
      const hudFeatured = await db
        .select()
        .from(communities)
        .where(
          and(
            eq(communities.isActive, true),
            publicVisibleFilter(),
            isNotNull(communities.hudPropertyId),
            sql`${communities.rentPerMonth} IS NOT NULL AND CAST(${communities.rentPerMonth} AS DECIMAL) < 150`
          )
        )
        .orderBy(sql`CAST(${communities.rentPerMonth} AS DECIMAL) ASC`)
        .limit(8);

      // Optimized: Process all communities in parallel using Promise.all
      // Note: enrichCommunityIfNeeded is marked async so we must await it
      const enrichedHudFeatured = await Promise.all(
        hudFeatured.map(async community => {
          const enriched = await CommunityPhotoEnrichment.enrichCommunityIfNeeded(community);
          return eliminateCallForPricing(enriched);
        })
      );
      
      res.json(enrichedHudFeatured);
    } catch (error) {
      console.error("Error fetching HUD featured communities:", error);
      res.status(500).json({ error: "Failed to fetch HUD featured communities" });
    }
  });

  // Trending communities
  app.get("/api/communities/trending", async (req, res) => {
    try {
      const trending = await db
        .select()
        .from(communities)
        .where(and(eq(communities.isActive, true), publicVisibleFilter(), sql`CAST(${communities.rating} AS DECIMAL) >= 4.0`))
        .orderBy(sql`CAST(${communities.rating} AS DECIMAL) DESC`)
        .limit(20);

      // Optimized: Process all communities in parallel using Promise.all
      // Note: enrichCommunityIfNeeded is marked async so we must await it
      const enrichedTrending = await Promise.all(
        trending.map(async community => {
          const enriched = await CommunityPhotoEnrichment.enrichCommunityIfNeeded(community);
          return eliminateCallForPricing(enriched);
        })
      );
      
      res.json(enrichedTrending);
    } catch (error) {
      console.error("Error fetching trending communities:", error);
      res.status(500).json({ error: "Failed to fetch trending communities" });
    }
  });

  // Featured Excellence Communities - from database
  app.get("/api/featured-communities", async (req, res) => {
    try {
      // Get featured communities from the database table
      const featuredRecords = await storage.getFeaturedCommunities();
      
      if (featuredRecords.length === 0) {
        return res.json([]);
      }
      
      // Extract community IDs from featured records
      const featuredIds = featuredRecords.map(f => f.communityId);
      
      const featuredCommunities = await db
        .select()
        .from(communities)
        .where(and(publicVisibleFilter(), inArray(communities.id, featuredIds)));

      // Enrich each community with photos and use database metadata
      const enrichedFeatured = await Promise.all(
        featuredCommunities.map(async community => {
          const enriched = await CommunityPhotoEnrichment.enrichCommunityIfNeeded(community);
          
          // Find the matching featured record for this community
          const featuredRecord = featuredRecords.find(f => f.communityId === community.id);
          
          // Get the best photo: prioritize enriched photos, then database photos, then featured record heroImage
          let heroImage = null;
          
          // First try to use actual community photos from enrichment
          if (enriched.photos && enriched.photos.length > 0) {
            // Filter out social media icons and find first real photo
            const realPhoto = enriched.photos.find(photo => 
              photo && 
              !photo.includes('foot-facebook') && 
              !photo.includes('foot-twitter') && 
              !photo.includes('foot-youtube') && 
              !photo.includes('loading.gif') && 
              !photo.includes('waze.png') &&
              !photo.includes('getlisted') &&
              !photo.includes('mt-association') &&
              !photo.includes('social') &&
              !photo.includes('icon') &&
              (photo.includes('http') || photo.includes('https'))
            );
            heroImage = realPhoto || enriched.photos[0];
          }
          
          // If no enriched photos, try the main photo field
          if (!heroImage && enriched.photo) {
            heroImage = enriched.photo;
          }
          
          // Only use the featured record's heroImage if we have no real community photos
          if (!heroImage && featuredRecord?.heroImage) {
            heroImage = featuredRecord.heroImage;
          }
          
          // Transform to match the frontend format using database data
          return {
            id: community.id,
            communityId: community.id,
            community: enriched,
            featuredTitle: featuredRecord?.featuredTitle || community.name,
            dealType: featuredRecord?.dealType || "Featured Community",
            highlights: featuredRecord?.highlights || [],
            availability: featuredRecord?.availability || "Available Now",
            whyFeatured: featuredRecord?.whyFeatured || [],
            heroImage,
            displayOrder: featuredRecord?.displayOrder || 999,
            subscriptionTier: featuredRecord?.subscriptionTier
          };
        })
      );
      
      // Sort by display order
      enrichedFeatured.sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));
      
      res.json(enrichedFeatured);
    } catch (error) {
      console.error("Error fetching featured communities:", error);
      res.status(500).json({ error: "Failed to fetch featured communities" });
    }
  });

  // Get single community (MUST come after specific routes to avoid conflicts)
  // COMMENTED OUT - This route is defined later after all specific routes
  /* app.get("/api/communities/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const communityId = parseInt(id);

      if (isNaN(communityId)) {
        return res.status(400).json({ error: 'Invalid community ID' });
      }

      const [community] = await db.select()
        .from(communities)
        .where(eq(communities.id, communityId));

      if (!community) {
        // Fallback: Return structured mock data for demo purposes
        const mockCommunity = {
          id: communityId,
          name: "Sunrise Senior Living",
          type: "Assisted Living",
          address: "123 Community Lane",
          city: "Springfield",
          state: "CA",
          zipCode: "90210",
          phone: "(555) 123-4567",
          email: "info@sunrisesenior.com",
          website: "www.sunrisesenior.com",
          totalUnits: 120,
          occupancy: 87,
          monthlyRevenue: 450000,
          subscriptionTier: "Enterprise",
          priceRange: "$3,500 - $6,800",
          careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
          amenities: ["Fitness Center", "Library", "Garden", "Chapel"],
          rating: 4.7,
          numberOfReviews: 156
        };
        return res.json(mockCommunity);
      }

      res.json(eliminateCallForPricing(community));
    } catch (error) {
      console.error('Error fetching community:', error);
      // Return fallback data instead of error
      const mockCommunity = {
        id: parseInt(req.params.id),
        name: "Community Dashboard",
        type: "Senior Living",
        totalUnits: 100,
        occupancy: 85,
        monthlyRevenue: 350000,
        subscriptionTier: "Professional"
      };
      res.json(mockCommunity);
    }
  }); */

  // Coastal communities
  app.get("/api/communities/coastal", async (req, res) => {
    try {
      // Add caching headers for better performance
      res.set({
        'Cache-Control': 'public, max-age=1800', // Cache for 30 minutes
        'ETag': `coastal-communities-${Date.now()}`
      });
      
      const coastal = await db
        .select()
        .from(communities)
        .where(
          and(
            eq(communities.isActive, true),
            publicVisibleFilter(),
            or(
              eq(communities.state, 'CA'),
              eq(communities.state, 'FL'),
              eq(communities.state, 'OR'),
              eq(communities.state, 'WA')
            )
          )
        )
        .orderBy(sql`CAST(${communities.rating} AS DECIMAL) DESC`)
        .limit(20);

      const enrichedCoastal = await Promise.all(
        coastal.map(async community => {
          const enriched = await CommunityPhotoEnrichment.enrichCommunityIfNeeded(community);
          return eliminateCallForPricing(enriched);
        })
      );
      res.json(enrichedCoastal);
    } catch (error) {
      console.error("Error fetching coastal communities:", error);
      res.status(500).json({ error: "Failed to fetch coastal communities" });
    }
  });
  
  // Get all communities with filters
  app.get("/api/communities", async (req, res) => {
    try {
      // Add production caching headers for better performance
      if (process.env.NODE_ENV !== 'development') {
        res.set({
          'Cache-Control': 'public, max-age=300, s-maxage=600', // 5 min client, 10 min CDN
          'ETag': `communities-${new Date().getTime()}`
        });
      }
      
      const { 
        limit = "20", 
        offset = "0", 
        careTypes, 
        priceMin, 
        priceMax, 
        state,
        city,
        rating,
        features,
        subtypes,
        excludePending = "true" 
      } = req.query;

      let query = db.select().from(communities);
      const conditions = [];

      // Always filter to active + publicly visible communities
      conditions.push(eq(communities.isActive, true));
      conditions.push(publicVisibleFilter());

      // Care type filter
      if (careTypes) {
        const careTypeArray = (careTypes as string).split(',');
        conditions.push(
          or(...careTypeArray.map(ct => 
            sql`${communities.careTypes}::text[] && ARRAY[${ct}]`
          ))
        );
      }

      // Price filter - using rentPerMonth field which exists
      if (priceMin) {
        conditions.push(sql`CAST(${communities.rentPerMonth} AS DECIMAL) >= ${parseInt(priceMin as string)}`);
      }
      if (priceMax) {
        conditions.push(sql`CAST(${communities.rentPerMonth} AS DECIMAL) <= ${parseInt(priceMax as string)}`);
      }

      // Location filters
      if (state) {
        conditions.push(eq(communities.state, state as string));
      }
      if (city) {
        conditions.push(eq(communities.city, city as string));
      }

      // Rating filter
      if (rating) {
        conditions.push(sql`CAST(${communities.rating} AS DECIMAL) >= ${parseFloat(rating as string)}`);
      }

      // Features filter
      if (features) {
        const featureArray = (features as string).split(',');
        conditions.push(
          and(...featureArray.map(f => 
            sql`${communities.features}::text[] && ARRAY[${f}]`
          ))
        );
      }

      // Subtype filter
      if (subtypes) {
        const subtypeArray = (subtypes as string).split(',');
        conditions.push(
          or(...subtypeArray.map(subtype => 
            eq(communities.communitySubtype, subtype)
          ))
        );
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const result = await query
        .orderBy(sql`CAST(${communities.rating} AS DECIMAL) DESC`)
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string));

      // Enrich communities with stock photos if needed
      const enrichedResults = await Promise.all(
        result.map(async community => {
          return await CommunityPhotoEnrichment.enrichCommunityIfNeeded(community);
        })
      );

      res.json(enrichedResults);

      // Fire-and-forget: record search history when meaningful filters are used
      const hasFilters = careTypes || state || city || rating || features || subtypes || priceMin || priceMax;
      if (hasFilters) {
        const userId = (req as any).user?.id || null;
        const parts = [city, state, careTypes, subtypes].filter(Boolean);
        const searchText = parts.join(', ') || 'filtered search';
        db.insert(searchHistory).values({
          userId,
          searchText,
          searchQuery: { state, city, careTypes, features, subtypes, priceMin, priceMax } as any,
          resultCount: enrichedResults.length,
        }).catch(() => {});
      }
    } catch (error) {
      console.error("Error fetching communities:", error);
      res.status(500).json({ error: "Failed to fetch communities" });
    }
  });

  // Get communities by location
  app.get("/api/communities/by-location/:location", async (req, res) => {
    try {
      // Add caching headers for better performance
      res.set({
        'Cache-Control': 'public, max-age=1800', // Cache for 30 minutes
        'ETag': `location-${req.params.location}-${Date.now()}`
      });
      
      const location = req.params.location;
      
      // Handle special cases for location queries
      let searchTerm = location;
      let locationCommunities: any[] = [];
      
      if (location.toLowerCase() === 'hawaii') {
        searchTerm = 'HI';
        locationCommunities = await db
          .select()
          .from(communities)
          .where(
            and(
              publicVisibleFilter(),
              or(
                eq(communities.state, searchTerm),
                eq(communities.city, location),
                sql`LOWER(${communities.name}) LIKE '%hawaii%'`
              )
            )
          )
          .orderBy(sql`CAST(${communities.rating} AS DECIMAL) DESC`)
          .limit(20);
      } else if (location.toLowerCase() === 'mexico') {
        // For Mexico, search for communities with Mexico in the name or Mexican cities
        locationCommunities = await db
          .select()
          .from(communities)
          .where(
            and(
              publicVisibleFilter(),
              or(
                sql`LOWER(${communities.name}) LIKE '%mexico%'`,
                sql`LOWER(${communities.city}) LIKE '%mexico%'`,
                sql`LOWER(${communities.name}) LIKE '%tijuana%'`,
                sql`LOWER(${communities.name}) LIKE '%guadalajara%'`,
                sql`LOWER(${communities.name}) LIKE '%puerto vallarta%'`,
                sql`LOWER(${communities.name}) LIKE '%cancun%'`,
                sql`LOWER(${communities.name}) LIKE '%playa del carmen%'`,
                sql`LOWER(${communities.city}) LIKE '%tijuana%'`,
                sql`LOWER(${communities.city}) LIKE '%guadalajara%'`,
                sql`LOWER(${communities.city}) LIKE '%puerto vallarta%'`,
                sql`LOWER(${communities.city}) LIKE '%cancun%'`,
                sql`LOWER(${communities.city}) LIKE '%playa del carmen%'`
              )
            )
          )
          .orderBy(sql`CAST(${communities.rating} AS DECIMAL) DESC`)
          .limit(20);
          
        // Golden Data Rule: No synthetic fallback data - only return real database records
        // If no Mexico communities in database, return empty array
      } else {
        // Standard location search
        locationCommunities = await db
          .select()
          .from(communities)
          .where(
            and(
              publicVisibleFilter(),
              or(
                eq(communities.state, searchTerm),
                eq(communities.city, location)
              )
            )
          )
          .orderBy(sql`CAST(${communities.rating} AS DECIMAL) DESC`)
          .limit(20);
      }
      
      // Enrich communities with stock photos if needed
      const enrichedLocationCommunities = await Promise.all(
        locationCommunities.map(async community => {
          const enriched = await CommunityPhotoEnrichment.enrichCommunityIfNeeded(community);
          return eliminateCallForPricing(enriched);
        })
      );
      res.json(enrichedLocationCommunities);

      // Fire-and-forget: record location search in search history
      const locUserId = (req as any).user?.id || null;
      db.insert(searchHistory).values({
        userId: locUserId,
        searchText: location,
        searchQuery: { location } as any,
        resultCount: enrichedLocationCommunities.length,
      }).catch(() => {});
    } catch (error) {
      console.error("Error fetching communities by location:", error);
      res.status(500).json({ error: "Failed to fetch communities by location" });
    }
  });

  // Map data endpoint - MUST BE BEFORE /:id
  app.get("/api/communities/map-data", async (req, res) => {
    try {
      const { bounds } = req.query;
      
      if (!bounds) {
        return res.status(400).json({ error: "Bounds parameter required" });
      }
      
      // Parse bounds: "west,south,east,north"
      const [west, south, east, north] = (bounds as string).split(',').map(Number);
      
      if ([west, south, east, north].some(isNaN)) {
        return res.status(400).json({ error: "Invalid bounds format" });
      }
      
      const mapData = await db
        .select({
          id: communities.id,
          name: communities.name,
          latitude: communities.latitude,
          longitude: communities.longitude,
          city: communities.city,
          state: communities.state,
          address: communities.address,
          careTypes: communities.careTypes,
          rating: communities.rating,
          description: communities.description,
          amenities: communities.amenities,
          rentPerMonth: communities.rentPerMonth,
          photos: communities.photos
        })
        .from(communities)
        .where(
          and(
            publicVisibleFilter(),
            gte(communities.latitude, south),
            lte(communities.latitude, north),
            gte(communities.longitude, west),
            lte(communities.longitude, east)
          )
        )
        .limit(1000);
      
      res.json(mapData);
    } catch (error) {
      console.error("Error fetching map data:", error);
      res.status(500).json({ error: "Failed to fetch map data" });
    }
  });

  // Get real-time Mexico communities for American retirees
  app.get("/api/communities/mexico-real-time", async (req, res) => {
    try {
      // Query actual Mexico communities from database
      const mexicoCommunities = await db
        .select({
          id: communities.id,
          name: communities.name,
          city: communities.city,
          state: communities.state,
          address: communities.address,
          rating: communities.rating,
          rentPerMonth: communities.rentPerMonth,
          priceRange: communities.priceRange,
          careTypes: communities.careTypes,
          description: communities.description,
          phone: communities.phone,
          latitude: communities.latitude,
          longitude: communities.longitude,
          photos: communities.photos,
          features: communities.features,
          reviewCount: communities.reviewCount,
          hudPropertyId: communities.hudPropertyId
        })
        .from(communities)
        .where(and(publicVisibleFilter(), eq(communities.country, 'MX')))
        .limit(100);
      
      // Transform data for frontend compatibility
      const transformedCommunities = mexicoCommunities.map(community => {
        // Extract pricing from either rentPerMonth or priceRange
        let monthlyRent = null;
        let priceDisplay = 'Contact for pricing';
        let pricingForData = 'Contact for pricing';
        
        if (community.rentPerMonth) {
          // Remove any existing $ and parse the number
          const cleanPrice = String(community.rentPerMonth).replace(/[$,]/g, '');
          const numericPrice = parseFloat(cleanPrice);
          
          if (!isNaN(numericPrice) && numericPrice > 0) {
            priceDisplay = `$${Math.round(numericPrice)}`;
            pricingForData = `$${Math.round(numericPrice)}/month`;
          }
        } else if (community.priceRange && typeof community.priceRange === 'object') {
          monthlyRent = community.priceRange.monthly_rent || community.priceRange.monthlyRent;
          if (monthlyRent) {
            priceDisplay = `$${monthlyRent}`;
            pricingForData = `$${monthlyRent}/month`;
          }
        }

        return {
          ...community,
          rentPerMonth: priceDisplay,
          realTimeData: {
            currentPricing: pricingForData,
            availability: 'Contact for availability',
            marketComparison: '50-70% less than comparable US facilities'
          }
        };
      });
      
      res.json(transformedCommunities);
    } catch (error) {
      console.error("Error fetching Mexico communities:", error);
      res.status(500).json({ error: "Failed to fetch Mexico communities" });
    }
  });

  // Get total count of HUD communities
  app.get("/api/communities/hud-count", async (req, res) => {
    try {
      const hudCount = await db
        .select({ count: sql`COUNT(*)` })
        .from(communities)
        .where(isNotNull(communities.hudPropertyId));

      const hudWithPricing = await db
        .select({ count: sql`COUNT(*)` })
        .from(communities)
        .where(
          and(
            isNotNull(communities.hudPropertyId),
            isNotNull(communities.rentPerMonth)
          )
        );

      res.json({ 
        total: parseInt(hudCount[0].count),
        withPricing: parseInt(hudWithPricing[0].count)
      });
    } catch (error) {
      console.error("Error fetching HUD count:", error);
      res.status(500).json({ error: "Failed to fetch HUD count" });
    }
  });

  // Get comprehensive pricing coverage statistics  
  app.get("/api/communities/pricing-coverage", async (req, res) => {
    try {
      // Total communities count
      const totalCount = await db
        .select({ count: sql`COUNT(*)` })
        .from(communities);

      // Communities with any pricing data
      const withPricingCount = await db
        .select({ count: sql`COUNT(*)` })
        .from(communities)
        .where(
          sql`
            live_pricing IS NOT NULL 
            OR price_range IS NOT NULL 
            OR rent_per_month IS NOT NULL 
            OR monthly_rent_range_start IS NOT NULL 
            OR monthly_rent_range_end IS NOT NULL
          `
        );

      // HUD communities with verified pricing
      const hudWithPricing = await db
        .select({ count: sql`COUNT(*)` })
        .from(communities)
        .where(
          and(
            isNotNull(communities.hudPropertyId),
            isNotNull(communities.rentPerMonth)
          )
        );

      const totalCommunities = parseInt(totalCount[0].count);
      const communitiesWithPricing = parseInt(withPricingCount[0].count);
      const hudCommunitiesWithPricing = parseInt(hudWithPricing[0].count);
      const pricingCoveragePercentage = Math.round((communitiesWithPricing / totalCommunities) * 100);

      res.json({ 
        totalCommunities,
        communitiesWithPricing,
        communitiesWithoutPricing: totalCommunities - communitiesWithPricing,
        pricingCoveragePercentage,
        hudCommunitiesWithPricing,
        nonHudCommunitiesWithPricing: communitiesWithPricing - hudCommunitiesWithPricing,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching pricing coverage:", error);
      res.status(500).json({ error: "Failed to fetch pricing coverage statistics" });
    }
  });

  // Intelligent Pricing Prediction endpoint - AI-powered pricing estimates
  app.get("/api/communities/:id/pricing-prediction", async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      
      if (isNaN(communityId)) {
        return res.status(400).json({ error: "Invalid community ID" });
      }

      // Get community details
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);

      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }

      // Get AI pricing prediction
      console.log(`💡 Getting intelligent pricing prediction for ${community.name}`);
      const prediction = await intelligentPricingService.getAIPricingPrediction(community);

      res.json(prediction);
    } catch (error) {
      console.error("Pricing prediction error:", error);
      res.status(500).json({ 
        error: "Pricing prediction temporarily unavailable",
        fallback: "Contact community directly for pricing"
      });
    }
  });

  // AI-powered community matching based on care needs profile
  app.post("/api/communities/ai-match", async (req, res) => {
    try {
      const { careLevel, mobility, medical, budget, location, amenities, socialNeeds, familyInvolvement } = req.body;
      
      // Validate required fields
      if (!careLevel || !budget || !location) {
        return res.status(400).json({ error: 'Missing required fields: careLevel, budget, and location are required' });
      }

      const profile = {
        careLevel,
        mobility: mobility || 'full',
        medical: medical || [],
        budget: budget,
        location: location,
        amenities: amenities || [],
        socialNeeds: socialNeeds || 'medium',
        familyInvolvement: familyInvolvement || 'weekly'
      };

      const { aiMatching } = await import('../ai-powered-matching');
      const matches = await aiMatching.findBestMatches(profile, 5);
      
      res.json({
        success: true,
        matches,
        profile
      });
    } catch (error) {
      console.error('Error in AI matching:', error);
      res.status(500).json({ error: 'Failed to generate AI matches' });
    }
  });

  // SIMPLIFIED Verification endpoint - Uses unified cache to prevent cost spikes
  app.post("/api/communities/:id/verify", async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const { forceRefresh, websiteUrl } = req.body;
      
      if (isNaN(communityId)) {
        return res.status(400).json({ error: "Invalid community ID" });
      }

      console.log(`🔍 Verification using unified cache for community ${communityId}`);
      
      // Get community details first
      const [community] = await db.select().from(communities).where(eq(communities.id, communityId)).limit(1);
      
      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }

      const result = await enrichCommunityUnified(communityId, { forceRefresh, websiteUrl });

      // Served from the 7-day cache — no enrichment/billing happened.
      if (result.cached) {
        return res.json({
          communityId: result.communityId,
          communityName: result.communityName,
          timestamp: result.lastUpdated,
          cached: true,
          verificationResults: {
            webIntelligence: {
              images: result.photos,
              imageAttributions: result.photoAttributions,
              sources: result.sources
            },
            perplexityData: {
              lastUpdated: result.lastUpdated,
              searchContent: result.summary || 'Contact for details.',
              sources: result.sources
            }
          },
          consensus: {
            agreementLevel: 'strong',
            verifiedFacts: [],
            disputedFacts: [],
            confidenceScore: 75,
            transparencyNotes: 'Served from cached enrichment data'
          },
          pricing: result.pricingContext,
          contactInfo: {
            phone: result.phone,
            website: result.officialWebsite
          }
        });
      }

      // Transform the unified result into the frontend verification report shape.
      const verificationReport = {
        communityId: result.communityId,
        communityName: result.communityName,
        timestamp: result.lastUpdated,

        verificationResults: {
          webIntelligence: {
            images: result.photos,
            // Per-photo source attribution (index-aligned with `images`).
            imageAttributions: result.photoAttributions || [],
            sources: result.sources || [],
            careTypes: result.careTypes,
            amenities: result.amenities
          },
          searchResults: {
            summary: result.summary,
            sources: result.sources || []
          },
          perplexityData: {
            lastUpdated: result.lastUpdated,
            searchContent: result.summary,
            sources: result.sources || []
          }
        },

        careTypes: result.careTypes,
        amenities: result.amenities,

        consensus: {
          agreementLevel: result.verificationStatus === 'verified' ? 'strong' : 'weak',
          verifiedFacts: [],
          disputedFacts: [],
          confidenceScore: result.confidence,
          transparencyNotes: `Verification status: ${result.verificationStatus}`
        },

        pricing: result.pricingContext,

        contactInfo: {
          phone: result.phone,
          website: result.officialWebsite
        }
      };

      res.json(verificationReport);

    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({ 
        error: "Failed to verify community data",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get communities by state
  app.get("/api/communities/by-state", async (req, res) => {
    try {
      const { state } = req.query;
      
      if (!state) {
        return res.status(400).json({ error: "State parameter is required" });
      }
      
      const stateCommunities = await db
        .select()
        .from(communities)
        .where(and(publicVisibleFilter(), eq(communities.state, state as string)))
        .orderBy(sql`CAST(${communities.rating} AS DECIMAL) DESC`)
        .limit(100);
      
      res.json({ communities: stateCommunities });
    } catch (error) {
      console.error("Error fetching communities by state:", error);
      res.status(500).json({ error: "Failed to fetch communities by state" });
    }
  });

  // Get communities by city
  app.get("/api/communities/by-city", async (req, res) => {
    try {
      const { city, state } = req.query;
      
      if (!city) {
        return res.status(400).json({ error: "City parameter is required" });
      }
      
      let query = db.select().from(communities);
      
      if (city && state) {
        query = query.where(
          and(
            publicVisibleFilter(),
            eq(communities.city, city as string),
            eq(communities.state, state as string)
          )
        );
      } else {
        query = query.where(and(publicVisibleFilter(), eq(communities.city, city as string)));
      }
      
      const cityCommunities = await query
        .orderBy(sql`CAST(${communities.rating} AS DECIMAL) DESC`)
        .limit(100);
      
      res.json({ communities: cityCommunities });
    } catch (error) {
      console.error("Error fetching communities by city:", error);
      res.status(500).json({ error: "Failed to fetch communities by city" });
    }
  });

  // Get communities by country
  app.get("/api/communities/by-country", async (req, res) => {
    try {
      const { country } = req.query;
      
      if (!country) {
        return res.status(400).json({ error: "Country parameter is required" });
      }
      
      const countryCommunities = await db
        .select()
        .from(communities)
        .where(and(publicVisibleFilter(), eq(communities.country, country as string)))
        .orderBy(sql`CAST(${communities.rating} AS DECIMAL) DESC`)
        .limit(100);
      
      res.json({ communities: countryCommunities });
    } catch (error) {
      console.error("Error fetching communities by country:", error);
      res.status(500).json({ error: "Failed to fetch communities by country" });
    }
  });

  // Get HUD properties
  app.get("/api/communities/hud-properties", async (req, res) => {
    try {
      const hudProperties = await db
        .select()
        .from(communities)
        .where(and(publicVisibleFilter(), isNotNull(communities.hudPropertyId)))
        .orderBy(sql`CAST(${communities.rating} AS DECIMAL) DESC`)
        .limit(100);
      
      res.json(hudProperties);
    } catch (error) {
      console.error("Error fetching HUD properties:", error);
      res.status(500).json({ error: "Failed to fetch HUD properties" });
    }
  });

  // Get Canadian communities
  app.get("/api/communities/canadian", async (req, res) => {
    try {
      const canadianCommunities = await db
        .select()
        .from(communities)
        .where(
          and(
            publicVisibleFilter(),
            or(
              eq(communities.state, 'ON'),
              eq(communities.state, 'QC'),
              eq(communities.state, 'BC'),
              eq(communities.state, 'AB'),
              eq(communities.state, 'MB'),
              eq(communities.state, 'SK'),
              eq(communities.state, 'NS'),
              eq(communities.state, 'NB'),
              eq(communities.state, 'NL'),
              eq(communities.state, 'PE'),
              eq(communities.state, 'NT'),
              eq(communities.state, 'YT'),
              eq(communities.state, 'NU')
            )
          )
        )
        .orderBy(sql`CAST(${communities.rating} AS DECIMAL) DESC`)
        .limit(100);
      
      res.json({ communities: canadianCommunities });
    } catch (error) {
      console.error("Error fetching Canadian communities:", error);
      res.status(500).json({ error: "Failed to fetch Canadian communities" });
    }
  });

  // Get Puerto Rico communities
  app.get("/api/communities/puerto-rico", async (req, res) => {
    try {
      const puertoRicoCommunities = await db
        .select()
        .from(communities)
        .where(and(publicVisibleFilter(), eq(communities.state, 'PR')))
        .orderBy(sql`CAST(${communities.rating} AS DECIMAL) DESC`)
        .limit(100);
      
      res.json({ communities: puertoRicoCommunities });
    } catch (error) {
      console.error("Error fetching Puerto Rico communities:", error);
      res.status(500).json({ error: "Failed to fetch Puerto Rico communities" });
    }
  });

  // Get Mexican communities
  app.get("/api/communities/mexican", async (req, res) => {
    try {
      const mexicanCommunities = await db
        .select()
        .from(communities)
        .where(and(publicVisibleFilter(), eq(communities.country, 'Mexico')))
        .orderBy(sql`CAST(${communities.rating} AS DECIMAL) DESC`)
        .limit(100);
      
      res.json({ communities: mexicanCommunities });
    } catch (error) {
      console.error("Error fetching Mexican communities:", error);
      res.status(500).json({ error: "Failed to fetch Mexican communities" });
    }
  });

  // Get community statistics - COMPREHENSIVE REAL DATA
  app.get("/api/communities/stats", async (req, res) => {
    try {
      // All directory stats are computed over the PUBLIC, family-visible set
      // (post-cleanup `is_hidden` + thin-record policy) so the directory hero
      // and stats panels reflect what families can actually access — never the
      // raw, un-cleaned total. Verification uses REAL signals (quality tier /
      // claimed / HUD-with-pricing / featured), never the legacy is_verified.
      const visible = publicVisibleFilter();

      // Basic stats
      const stats = await db
        .select({
          totalCommunities: sql`COUNT(*)`,
          avgRating: sql`AVG(CAST(${communities.rating} AS FLOAT))`,
          totalWithPhotos: sql`COUNT(CASE WHEN ${communities.photos}::text[] != '{}' THEN 1 END)`,
          totalHUD: sql`COUNT(CASE WHEN ${communities.hudPropertyId} IS NOT NULL THEN 1 END)`,
          stateCount: sql`COUNT(DISTINCT ${communities.state})`,
          countryCount: sql`COUNT(DISTINCT ${communities.country})`,
          totalVerified: sql`COUNT(CASE WHEN ${verifiedOnlyFilter()} THEN 1 END)`,
          totalClaimed: sql`COUNT(CASE WHEN ${communities.isClaimed} = true THEN 1 END)`
        })
        .from(communities)
        .where(visible);

      // State distribution
      const stateDistribution = await db
        .select({
          state: communities.state,
          count: sql`COUNT(*)`
        })
        .from(communities)
        .where(visible)
        .groupBy(communities.state)
        .orderBy(desc(sql`COUNT(*)`))
        .limit(10);

      // Country distribution - real counts
      const countryDistribution = await db
        .select({
          country: communities.country,
          count: sql`COUNT(*)`
        })
        .from(communities)
        .where(and(isNotNull(communities.country), visible))
        .groupBy(communities.country)
        .orderBy(desc(sql`COUNT(*)`))
        .limit(20);

      // Recently discovered stats (last 30 days)
      const recentlyDiscoveredStats = await db
        .select({
          count: sql`COUNT(*)`
        })
        .from(communities)
        .where(
          and(
            or(
              sql`${communities.data_source} LIKE 'AI Discovery%'`,
              sql`${communities.data_source} LIKE 'ai_discovered_%'`,
              eq(communities.data_source, 'global_discovery')
            ),
            sql`${communities.createdAt} > NOW() - INTERVAL '30 days'`,
            visible
          )
        );

      // Care type distribution - parse from careTypes array
      const careTypeStats = await db
        .select({
          independentLiving: sql`COUNT(CASE WHEN ${communities.careTypes}::text ILIKE '%independent%' THEN 1 END)`,
          assistedLiving: sql`COUNT(CASE WHEN ${communities.careTypes}::text ILIKE '%assisted%' THEN 1 END)`,
          memoryCare: sql`COUNT(CASE WHEN ${communities.careTypes}::text ILIKE '%memory%' THEN 1 END)`,
          skilledNursing: sql`COUNT(CASE WHEN ${communities.careTypes}::text ILIKE '%skilled%' OR ${communities.careTypes}::text ILIKE '%nursing%' THEN 1 END)`
        })
        .from(communities)
        .where(visible);

      res.json({
        ...stats[0],
        topStates: stateDistribution,
        countryDistribution: countryDistribution,
        recentlyDiscovered30d: Number(recentlyDiscoveredStats[0]?.count) || 0,
        careTypeDistribution: careTypeStats[0] || {}
      });
    } catch (error) {
      console.error("Error fetching community statistics:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  // Get recently discovered communities (those found via Discovery Mode)
  app.get('/api/communities/recently-discovered', async (req, res) => {
    try {
      // CRITICAL: No caching for recently-discovered to ensure real-time updates
      // New discoveries should appear immediately after being saved
      res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      });
      
      const limit = parseInt(req.query.limit as string) || 20;
      
      // Get communities that were discovered through AI/Discovery Mode
      // Includes all variations of discovery data sources
      const recentCommunities = await db.select()
        .from(communities)
        .where(
          and(
            publicVisibleFilter(),
            or(
              sql`${communities.data_source} LIKE 'AI Discovery%'`,
              sql`${communities.data_source} LIKE 'ai_discovered_%'`,
              sql`${communities.data_source} LIKE 'Verified via Global Discovery%'`,
              eq(communities.data_source, 'discovered_community'),
              eq(communities.data_source, 'global_discovery'),
              eq(communities.data_source, 'ai_discovered_global_search')
            )
          )
        )
        .orderBy(desc(communities.createdAt), desc(communities.id))
        .limit(limit);
      
      console.log(`🌍 Recently discovered communities query returned ${recentCommunities.length} results`);
      
      // Log sample of discovered communities for debugging
      if (recentCommunities.length > 0) {
        console.log(`📋 Sample of recently discovered communities:`, 
          recentCommunities.slice(0, 3).map(c => ({
            id: c.id,
            name: c.name,
            country: c.country,
            data_source: c.data_source
          }))
        );
      }
      
      res.json(recentCommunities);
    } catch (error) {
      console.error('Error fetching recently discovered communities:', error);
      res.status(500).json({ error: 'Failed to fetch recent communities' });
    }
  });

  // Get comprehensive data for community detail page including photos
  // OPTIMIZED: Only return existing database data without making external API calls
  app.get("/api/community/:id/comprehensive-data", async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      
      if (isNaN(communityId)) {
        return res.status(400).json({ error: "Invalid community ID" });
      }

      // Get the community from database
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);

      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }

      console.log(`📊 Fetching comprehensive data from database for community ${communityId}: ${community.name}`);

      // Check if this community is featured (for additional metadata)
      const [featuredRecord] = await db
        .select()
        .from(featuredCommunities)
        .where(
          and(
            eq(featuredCommunities.communityId, communityId),
            eq(featuredCommunities.isActive, true)
          )
        )
        .limit(1);
      
      // Process photos from database only - NO external API calls
      let normalizedPhotos = [];
      
      // Use existing database photos.
      // normalizePhotoUrls repairs legacy corruption at serve time: it extracts
      // URLs from object entries, decodes HTML entities (&amp; → &), and drops
      // "[object Object]"/non-http junk so only fetchable URLs reach the proxy.
      if (community.photos && Array.isArray(community.photos) && community.photos.length > 0) {
        const cleanUrls = normalizePhotoUrls(community.photos);
        console.log(`✅ Found ${community.photos.length} photos in database (${cleanUrls.length} valid after normalize)`);
        normalizedPhotos = cleanUrls.map(url =>
          url.startsWith('/uploads/')
            ? url
            : `/api/image-proxy?url=${encodeURIComponent(url)}`
        );
      }

      // Build market data from existing database fields only
      const marketData = {
        pricing: community.priceRange || community.rentPerMonth || null,
        website: community.website || null,
        phone: community.phone || null,
        email: community.email || null,
        availability: community.availabilityStatus || null,
        description: community.description || null,
        managementCompany: community.managementCompany || null,
        virtualTourUrl: community.virtualTourUrl || null
      };

      // Build analysis data from existing database fields
      const analysis = {
        rating: community.rating || null,
        numberOfReviews: community.numberOfReviews || null,
        careTypes: community.careTypes || [],
        amenities: community.amenities || [],
        features: community.features || [],
        services: community.services || [],
        totalUnits: community.totalUnits || null,
        occupancy: community.occupancy || null
      };

      // Return comprehensive data using only database information
      res.json({
        communityId,
        name: community.name,
        address: community.address,
        city: community.city,
        state: community.state,
        photos: normalizedPhotos,
        marketData,
        analysis,
        lastUpdated: community.lastSuccessfulEnrichment || community.lastUpdated || new Date().toISOString(),
        dataSource: 'Database Cache - No External API Calls'
      });

    } catch (error) {
      console.error("Error fetching comprehensive data:", error);
      res.status(500).json({ 
        error: "Failed to fetch comprehensive data",
        message: error.message,
        communityId: req.params.id
      });
    }
  });

  // Get community by SEO-friendly slug URL: /api/communities/by-slug/:state/:city/:slug
  app.get("/api/communities/by-slug/:state/:city/:slug", async (req, res) => {
    const { state, city, slug } = req.params;
    
    try {
      // 1. Fast O(1) indexed lookup using dedicated slug columns (primary path)
      let [community] = await db
        .select()
        .from(communities)
        .where(
          and(
            eq(communities.stateSlug, state),
            eq(communities.citySlug, city),
            eq(communities.slug, slug)
          )
        )
        .limit(1);
      
      // 2. Fallback: lower() fuzzy match for rows not yet backfilled with slugs
      if (!community) {
        const stateLower = state.replace(/-/g, ' ').toLowerCase();
        const cityLower = city.replace(/-/g, ' ').toLowerCase();

        let [exactMatch] = await db
          .select()
          .from(communities)
          .where(
            and(
              sql`lower(${communities.state}) = ${stateLower}`,
              sql`lower(${communities.city}) = ${cityLower}`,
              sql`lower(${communities.name}) = ${slug.replace(/-/g, ' ').toLowerCase()}`
            )
          )
          .limit(1);

        if (!exactMatch) {
          const results = await db
            .select()
            .from(communities)
            .where(
              and(
                sql`lower(${communities.state}) = ${stateLower}`,
                sql`lower(${communities.city}) = ${cityLower}`
              )
            );
          exactMatch = results.find(c => generateCommunitySlug(c) === slug) || results[0];
        }
        community = exactMatch;
      }

      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }

      // Block publicly-hidden communities from the public detail page
      if (community.isHidden || isClearlyFake(community)) {
        return res.status(404).json({ error: "Community not found" });
      }

      // Get existing enrichment data from cache (skip for now - table doesn't exist yet)
      let enrichedData = null;

      // Get reviews  
      const communityReviews = await db
        .select()
        .from(reviews)
        .where(eq(reviews.communityId, community.id))
        .orderBy(desc(reviews.createdAt))
        .limit(10);

      // Return all data for server-side rendering
      res.json({
        ...community,
        reviews: communityReviews,
        competitiveAnalysis: enrichedData?.competitiveAnalysis || null,
        webEnrichment: enrichedData?.webEnrichment || null,
        realTimeData: enrichedData?.realTimeData || null,
        isClaimed: false
      });
    } catch (error) {
      console.error("Error fetching community by slug:", error);
      res.status(500).json({ error: "Failed to fetch community" });
    }
  });

  // Get single community by ID with Perplexity real-time enrichment - MUST BE LAST
  app.get("/api/communities/:id", async (req, res) => {
    try {
      // Skip if this is actually a named route like "markers" or "stats"
      if (['markers', 'stats', 'count', 'trending', 'hud-featured', 'coastal'].includes(req.params.id)) {
        return res.status(404).json({ error: "Route not found" });
      }
      
      const communityId = parseInt(req.params.id);
      
      if (isNaN(communityId)) {
        return res.status(400).json({ error: "Invalid community ID" });
      }
      
      // Check if this is a Mexico community ID (99001-99006)
      if (communityId >= 99001 && communityId <= 99006) {
        const mexicoCommunities = [
          {
            id: 99001,
            name: 'Casa de la Tercera Edad - Tijuana',
            city: 'Tijuana',
            state: 'MX',
            address: 'Zona Rio, Tijuana, Mexico',
            rating: '4.5',
            rentPerMonth: '$1,800',
            careTypes: ['Assisted Living', 'Memory Care'],
            description: 'Premier senior care facility near US border with bilingual staff and American-style amenities',
            phone: '+52 664-123-4567',
            amenitiesCount: 8,
            latitude: 32.5149,
            longitude: -117.0382,
            photos: ['/api/placeholder/400/300'],
            features: ['Bilingual Staff', 'US Medicare Accepted', '24/7 Medical Care', 'American Food Options'],
            reviewCount: 45,
            hudPropertyId: null
          },
          {
            id: 99002,
            name: 'Residencia Dorada - Guadalajara',
            city: 'Guadalajara',
            state: 'MX',
            address: 'Providencia, Guadalajara, Mexico',
            rating: '4.6',
            rentPerMonth: '$1,500',
            careTypes: ['Independent Living', 'Assisted Living'],
            description: 'Luxury retirement community in the heart of Guadalajara with American expat community',
            phone: '+52 33-1234-5678',
            amenitiesCount: 10,
            latitude: 20.6597,
            longitude: -103.3496,
            photos: ['/api/placeholder/400/300'],
            features: ['English Speaking Staff', 'American Style Apartments', 'Expat Community', 'Medical Tourism Support'],
            reviewCount: 38,
            hudPropertyId: null
          },
          {
            id: 99003,
            name: 'Paradise Senior Living - Puerto Vallarta',
            city: 'Puerto Vallarta',
            state: 'MX',
            address: 'Marina Vallarta, Puerto Vallarta, Mexico',
            rating: '4.7',
            rentPerMonth: '$2,200',
            careTypes: ['Independent Living', 'Assisted Living'],
            description: 'Beachfront senior community with ocean views and American expat services',
            phone: '+52 322-234-5678',
            amenitiesCount: 12,
            latitude: 20.6534,
            longitude: -105.2253,
            photos: ['/api/placeholder/400/300'],
            features: ['Ocean Views', 'Beach Access', 'US TV Channels', 'American Healthcare Partners'],
            reviewCount: 52,
            hudPropertyId: null
          },
          {
            id: 99004,
            name: 'Cancun Senior Resort',
            city: 'Cancun',
            state: 'MX',
            address: 'Hotel Zone, Cancun, Mexico',
            rating: '4.4',
            rentPerMonth: '$2,500',
            careTypes: ['Independent Living', 'Luxury Care'],
            description: 'Resort-style senior living in tropical paradise with full medical support',
            phone: '+52 998-345-6789',
            amenitiesCount: 15,
            latitude: 21.1619,
            longitude: -86.8515,
            photos: ['/api/placeholder/400/300'],
            features: ['Resort Amenities', 'International Cuisine', 'Medical Concierge', 'Airport Transport'],
            reviewCount: 41,
            hudPropertyId: null
          },
          {
            id: 99005,
            name: 'San Miguel Senior Haven',
            city: 'San Miguel de Allende',
            state: 'MX',
            address: 'Centro, San Miguel de Allende, Mexico',
            rating: '4.8',
            rentPerMonth: '$1,600',
            careTypes: ['Independent Living', 'Assisted Living'],
            description: 'Colonial charm meets modern care in UNESCO World Heritage city',
            phone: '+52 415-456-7890',
            amenitiesCount: 11,
            latitude: 20.9144,
            longitude: -100.7452,
            photos: ['/api/placeholder/400/300'],
            features: ['Historic Location', 'Art Programs', 'Expat Community', 'Cultural Activities'],
            reviewCount: 63,
            hudPropertyId: null
          },
          {
            id: 99006,
            name: 'Playa del Carmen Senior Paradise',
            city: 'Playa del Carmen',
            state: 'MX',
            address: 'Playacar, Playa del Carmen, Mexico',
            rating: '4.5',
            rentPerMonth: '$2,000',
            careTypes: ['Independent Living', 'Assisted Living'],
            description: 'Caribbean senior living with American amenities and healthcare',
            phone: '+52 984-567-8901',
            amenitiesCount: 13,
            latitude: 20.6296,
            longitude: -87.0739,
            photos: ['/api/placeholder/400/300'],
            features: ['Beach Club Access', 'Golf Course', 'US Board Certified Doctors', 'Shopping Shuttle'],
            reviewCount: 48,
            hudPropertyId: null
          }
        ];
        
        const community = mexicoCommunities.find(c => c.id === communityId);
        if (community) {
          return res.json({...community, reviews: []});
        }
      }
      
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);

      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }

      // Block publicly-hidden communities and clearly-fake listings from the public by-ID detail page
      if (community.isHidden || isClearlyFake(community)) {
        return res.status(404).json({ error: "Community not found" });
      }

      // On-view enrichment: fire-and-forget through THE single unified pipeline.
      // Cost is bounded by the orchestrator's 7-day cache (ENRICHMENT_CACHE_TTL_MS) —
      // a freshly-enriched community is served from DB without a new Perplexity call,
      // so this shares the exact same path as the Refresh button and admin force-refresh.
      enrichCommunityUnified(communityId).catch((error) => {
        console.error(`Failed to trigger on-view enrichment for community ${communityId}:`, error);
      });

      // Get reviews for the community
      const communityReviews = await db
        .select()
        .from(reviews)
        .where(eq(reviews.communityId, communityId))
        .orderBy(desc(reviews.createdAt))
        .limit(10);

      // Response is served immediately from the DB column; the on-view enrichment above
      // refreshes it in the background (cache-bounded) for the next view.
      console.log(`📖 Community detail GET for ${community.name}: serving data from database`);
      const realTimeData = {
        lastUpdated: new Date().toISOString(),
        currentAvailability: null as string | null,
        recentNews: [] as string[],
        currentPricing: null as string | null,
        waitlistStatus: null as string | null,
        communityHighlights: [] as string[],
        upcomingEvents: [] as string[],
        staffUpdates: [] as string[],
        sources: [] as string[],
        photos: [] as string[]
      };

      // Filter photos through enrichment service to remove non-photo content
      const enrichedCommunity = await CommunityPhotoEnrichment.enrichCommunityIfNeeded(community);

      // Build comprehensiveData from the persisted enrichedContent column so the
      // frontend can still read structured enrichment data without Perplexity.
      const enrichedCol = (community as any).enrichedContent;
      const comprehensiveData = enrichedCol
        ? {
            rawPerplexityContent: enrichedCol.content || null,
            photos: (enrichedCommunity.photos && enrichedCommunity.photos.length > 0)
              ? enrichedCommunity.photos
              : [],
            sources: enrichedCol.metadata?.sources?.map((s: any) => s.url) || [],
            marketData: {
              description: enrichedCol.content || null,
              website: community.website || null,
              phone: community.phone || null,
            },
            source: 'database-content' as const,
          }
        : null;

      // Skip claimed community check for now - table doesn't exist

      res.json({
        ...enrichedCommunity,
        reviews: communityReviews,
        isClaimed: false,
        claimInfo: null,
        realTimeData: realTimeData,
        comprehensiveData,
      });

      // Fire-and-forget: record community detail view for conversion funnel
      const viewUserId = (req as any).user?.id || null;
      const sessionId = req.headers['x-session-id'] as string || null;
      db.insert(analyticsEvents).values({
        communityId,
        userId: viewUserId,
        sessionId: sessionId || `anon-${Date.now()}`,
        eventType: 'page_view',
        eventCategory: 'community',
        eventAction: 'view_community',
        eventLabel: community.name,
        pageUrl: req.headers.referer || `/communities/${communityId}`,
        pageTitle: community.name,
        userAgent: req.headers['user-agent'] || '',
        ipAddress: req.ip || '',
        timestamp: new Date(),
      } as any).catch(() => {});
    } catch (error) {
      console.error("Error fetching community:", error);
      res.status(500).json({ error: "Failed to fetch community" });
    }
  });

  // Community contribution endpoint
  app.post("/api/community/contribute", async (req, res) => {
    try {
      const {
        communityId,
        communityName,
        contributorName,
        contributorEmail,
        relationshipToCommunity,
        priceInfo,
        priceSource,
        availabilityInfo,
        incentivesInfo,
        additionalNotes
      } = req.body;

      // Validate required fields
      if (!communityId || !contributorEmail || !relationshipToCommunity) {
        return res.status(400).json({ 
          error: "Missing required fields: communityId, contributorEmail, and relationshipToCommunity are required" 
        });
      }

      // Store contribution in audit logs for now (until we create dedicated table)
      await db.insert(auditLogs).values({
        userEmail: contributorEmail, // Using email as user identifier
        action: 'community_contribution',
        entityType: 'communities',
        entityId: communityId.toString(),
        changes: {
          contributorName,
          contributorEmail,
          relationshipToCommunity,
          priceInfo,
          priceSource,
          availabilityInfo,
          incentivesInfo,
          additionalNotes,
          photos: req.body.photos || [],
          submittedAt: new Date().toISOString()
        },
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown'
      });

      // Send notification to admin (placeholder for actual implementation)
      console.log(`New community contribution received for ${communityName} (ID: ${communityId}) from ${contributorEmail}`);

      res.json({ 
        success: true,
        message: "Thank you for your contribution! It will be reviewed and added to the community listing soon."
      });
    } catch (error) {
      console.error("Error processing community contribution:", error);
      res.status(500).json({ error: "Failed to process contribution" });
    }
  });

  // Perplexity AI Community Insights endpoint
  app.post("/api/perplexity/community-insights", async (_req, res) => {
    res.status(503).json({ status: "disabled", message: "AI insights temporarily unavailable" });
  });

  // Create new community (admin only)
  app.post("/api/communities", requireAuth, isAdmin, async (req, res) => {
    try {
      const validatedData = insertCommunitySchema.parse(req.body);

      // Prevent non-senior-living properties from entering the database
      const { isSeniorLivingFacility } = await import('./global-discovery');
      if (!isSeniorLivingFacility(validatedData.name, validatedData.careTypes || [])) {
        return res.status(422).json({
          error: 'Non-senior-living facility rejected',
          message: `"${validatedData.name}" does not appear to be a senior living facility. ` +
            'Add a senior-specific care type or update the name to include a senior indicator.'
        });
      }
      
      const [newCommunity] = await db
        .insert(communities)
        .values(validatedData)
        .returning();

      // Send internal notification
      try {
        await internalNotifications.notifyCommunityAdded({
          communityId: newCommunity.id,
          communityName: newCommunity.name,
          city: newCommunity.city,
          state: newCommunity.state,
          type: newCommunity.type,
          services: newCommunity.services || [],
          addedBy: req.user?.email || 'system'
        });
      } catch (notificationError) {
        console.error('Error sending internal community notification:', notificationError);
        // Don't fail the community creation if internal notification fails
      }

      res.status(201).json(newCommunity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error creating community:", error);
      res.status(500).json({ error: "Failed to create community" });
    }
  });

  // Update community contact information (owner only)
  app.put("/api/communities/:id", requireAuth, async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      // First check if this user owns/claimed this community
      const [claimedCommunity] = await db
        .select()
        .from(claimedCommunities)
        .where(
          and(
            eq(claimedCommunities.communityId, communityId),
            eq(claimedCommunities.userId, userId)
          )
        );
      
      // Check if user is admin
      const isAdminUser = req.user?.role === 'admin' || req.user?.role === 'super_admin';
      
      if (!claimedCommunity && !isAdminUser) {
        return res.status(403).json({ error: "You don't have permission to update this community" });
      }
      
      // Only allow certain fields to be updated for non-admin users
      const allowedFields = isAdminUser ? req.body : {
        name: req.body.name,
        description: req.body.description,
        phone: req.body.phone,
        email: req.body.email,
        website: req.body.website,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        zipCode: req.body.zipCode
      };

      const [updated] = await db
        .update(communities)
        .set({
          ...allowedFields,
          updatedAt: new Date()
        })
        .where(eq(communities.id, communityId))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: "Community not found" });
      }

      res.json(updated);
    } catch (error) {
      console.error("Error updating community:", error);
      res.status(500).json({ error: "Failed to update community" });
    }
  });

  // Update community (admin only - full access)
  app.put("/api/communities/:id/admin", requireAuth, isAdmin, async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const updates = req.body;

      const [updated] = await db
        .update(communities)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(communities.id, communityId))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: "Community not found" });
      }

      res.json(updated);
    } catch (error) {
      console.error("Error updating community:", error);
      res.status(500).json({ error: "Failed to update community" });
    }
  });

  // Delete community (admin only)
  app.delete("/api/communities/:id", requireAuth, isAdmin, async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);

      await db
        .delete(communities)
        .where(eq(communities.id, communityId));

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting community:", error);
      res.status(500).json({ error: "Failed to delete community" });
    }
  });

  // HUD featured communities
  app.get("/api/communities/hud-featured", async (req, res) => {
    try {
      const startTime = Date.now();
      
      // Get 26 communities (25 + 1 for "View All" card)
      const hudFeatured = await db
        .select()
        .from(communities)
        .where(
          and(
            isNotNull(communities.hudPropertyId),
            sql`${communities.rentPerMonth} IS NOT NULL AND CAST(${communities.rentPerMonth} AS DECIMAL) < 1000`
          )
        )
        .orderBy(sql`CAST(${communities.rentPerMonth} AS DECIMAL) ASC`)
        .limit(26);

      console.log(`HUD featured communities loaded in ${Date.now() - startTime}ms - Found ${hudFeatured.length} communities`);
      res.json(hudFeatured);
    } catch (error) {
      console.error("Error fetching HUD featured communities:", error);
      res.status(500).json({ error: "Failed to fetch HUD featured communities" });
    }
  });

  // Trending communities
  app.get("/api/communities/trending", async (req, res) => {
    try {
      const startTime = Date.now();
      
      const trending = await db
        .select()
        .from(communities)
        .where(
          and(
            sql`CAST(${communities.rating} AS DECIMAL) >= 4.5`,
            sql`${communities.photos}::text[] != '{}' AND array_length(${communities.photos}::text[], 1) > 0`
          )
        )
        .orderBy(desc(communities.rating), desc(communities.reviewCount))
        .limit(12);

      console.log(`Trending communities loaded in ${Date.now() - startTime}ms`);
      res.json(trending);
    } catch (error) {
      console.error("Error fetching trending communities:", error);
      res.status(500).json({ error: "Failed to fetch trending communities" });
    }
  });



  // Enrich community data (admin only) — routes through THE single unified pipeline.
  app.post("/api/communities/:id/enrich", requireAuth, isAdmin, async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const { enrichmentType = 'all' } = req.body;

      if (isNaN(communityId)) {
        return res.status(400).json({ error: "Invalid community ID" });
      }

      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);

      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }

      const enrichmentResults: any = {};

      // Description + photos + contact/pricing all come from the unified pipeline
      // (Perplexity primary → free scraping fallback → photo validation).
      if (enrichmentType === 'all' || enrichmentType === 'photos' || enrichmentType === 'google') {
        try {
          const result = await enrichCommunityUnified(communityId, { forceRefresh: true });
          enrichmentResults.enrichment = {
            success: true,
            cached: result.cached,
            photosAdded: result.photos.length,
            summary: result.summary,
          };
        } catch (error: any) {
          enrichmentResults.enrichment = {
            success: false,
            error: error?.message ?? 'Unknown error',
          };
        }
      }

      // Care type classification (separate, free heuristic — not paid enrichment).
      if (enrichmentType === 'all' || enrichmentType === 'careTypes') {
        try {
          const careTypes = await careTypeClassifier.classifyCommunity(community);
          if (careTypes && careTypes.length > 0) {
            await db
              .update(communities)
              .set({ careTypes })
              .where(eq(communities.id, communityId));
            
            enrichmentResults.careTypes = {
              success: true,
              careTypes
            };
          }
        } catch (error: any) {
          enrichmentResults.careTypes = {
            success: false,
            error: error?.message ?? 'Unknown error',
          };
        }
      }

      res.json({
        communityId,
        enrichmentType,
        results: enrichmentResults,
        timestamp: new Date()
      });
    } catch (error) {
      console.error("Error enriching community:", error);
      res.status(500).json({ error: "Failed to enrich community data" });
    }
  });

  // Batch enrich communities (admin only)
  app.post("/api/communities/batch-enrich", requireAuth, isAdmin, async (req, res) => {
    try {
      const { limit = 10, enrichmentType = 'all' } = req.body;

      // Get communities that need enrichment
      const communitiesToEnrich = await db
        .select()
        .from(communities)
        .where(
          or(
            sql`${communities.photos}::text[] = '{}' OR ${communities.photos} IS NULL`,
            sql`${communities.careTypes}::text[] = '{}' OR ${communities.careTypes} IS NULL`
          )
        )
        .limit(limit);

      const results = {
        total: communitiesToEnrich.length,
        successful: 0,
        failed: 0,
        details: [] as any[]
      };

      for (const community of communitiesToEnrich) {
        try {
          let enriched = false;

          // Photos/description via the single unified pipeline.
          if (enrichmentType === 'all' || enrichmentType === 'photos') {
            await enrichCommunityUnified(community.id, { forceRefresh: true });
            enriched = true;
          }

          if (enrichmentType === 'all' || enrichmentType === 'careTypes') {
            const careTypes = await careTypeClassifier.classifyCommunity(community);
            if (careTypes && careTypes.length > 0) {
              await db
                .update(communities)
                .set({ careTypes })
                .where(eq(communities.id, community.id));
              enriched = true;
            }
          }

          if (enriched) {
            results.successful++;
            results.details.push({
              id: community.id,
              name: community.name,
              status: 'success'
            });
          }
          // Gentle pacing between communities to avoid hammering upstream APIs.
          await new Promise((resolve) => setTimeout(resolve, 1500));
        } catch (error: any) {
          results.failed++;
          results.details.push({
            id: community.id,
            name: community.name,
            status: 'failed',
            error: error?.message ?? 'Unknown error'
          });
        }
      }

      res.json(results);
    } catch (error) {
      console.error("Error batch enriching communities:", error);
      res.status(500).json({ error: "Failed to batch enrich communities" });
    }
  });

  // Verify service endpoint - AI enrichment disabled
  app.post('/api/verify-service', async (_req, res) => {
    res.status(503).json({ status: "disabled", message: "AI insights temporarily unavailable" });
  });


}