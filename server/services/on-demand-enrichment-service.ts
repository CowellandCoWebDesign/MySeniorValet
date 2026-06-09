import { db } from "../db";
import { communities } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import * as cheerio from "cheerio";
import { lookup } from "dns/promises";
import { isIP } from "net";

interface EnrichmentResult {
  success: boolean;
  fieldsUpdated: string[];
  protectedFieldsSkipped: string[];
  error?: string;
}

interface ScrapedData {
  description?: string;
  photos: string[];
  phone?: string;
  email?: string;
  amenities: string[];
  careTypes: string[];
  rating?: number;
}

/**
 * On-Demand Enrichment Service — FREE / zero-cost mode.
 *
 * This service enriches communities using ONLY direct website scraping.
 * It makes NO calls to paid AI services (no OpenAI/ChatGPT, no Claude/Anthropic,
 * no Perplexity). When a community has no scrapable website (or nothing useful
 * is found), fields are left empty so the UI can show "Contact for details"
 * instead of fabricating content. This keeps the platform compliant with the
 * Golden Data Rule (no synthetic/invented data) at $0 cost.
 *
 * A clean hook (`researchHook`) is left in place so a cheap real-research
 * provider can be added later without restructuring the pipeline.
 */
export class OnDemandEnrichmentService {
  private readonly VERIFICATION_THRESHOLD = 2; // Fields protected after 2 verifications

  // Safe cache durations per legal research (DMCA compliant)
  private readonly PHOTO_CACHE_HOURS = 24; // 24 hours for photos (DMCA safe harbor)
  private readonly PRICING_CACHE_DAYS = 7; // 7 days for pricing information
  private readonly MIN_REFRESH_HOURS = 24; // Minimum time between any enrichments

  // Care-type keywords detected from page text (free, deterministic)
  private readonly CARE_TYPE_KEYWORDS: Array<{ label: string; patterns: RegExp }> = [
    { label: "Independent Living", patterns: /independent living/i },
    { label: "Assisted Living", patterns: /assisted living/i },
    { label: "Memory Care", patterns: /memory care|alzheimer|dementia care/i },
    { label: "Skilled Nursing", patterns: /skilled nursing|nursing home|long[- ]term care/i },
    { label: "Respite Care", patterns: /respite care/i },
    { label: "Continuing Care", patterns: /continuing care|ccrc|life plan community/i },
    { label: "Rehabilitation", patterns: /rehabilitation|rehab services|short[- ]term rehab/i },
  ];

  // Amenity keywords detected from page text (free, deterministic)
  private readonly AMENITY_KEYWORDS: Array<{ label: string; patterns: RegExp }> = [
    { label: "Dining Services", patterns: /dining|restaurant[- ]style|chef[- ]prepared|meals? (?:included|provided)/i },
    { label: "Fitness Center", patterns: /fitness center|gym|exercise (?:room|classes)/i },
    { label: "Transportation", patterns: /transportation|scheduled transport|shuttle/i },
    { label: "Housekeeping", patterns: /housekeeping|laundry service/i },
    { label: "Pet Friendly", patterns: /pet[- ]friendly|pets? welcome/i },
    { label: "Salon/Spa", patterns: /salon|spa services|beauty (?:salon|shop)/i },
    { label: "Library", patterns: /\blibrary\b/i },
    { label: "Garden/Courtyard", patterns: /garden|courtyard|outdoor (?:space|patio)/i },
    { label: "Swimming Pool", patterns: /swimming pool|indoor pool|heated pool/i },
    { label: "24/7 Staff", patterns: /24[\/-]?7|24[- ]hour (?:staff|care|support)|round[- ]the[- ]clock/i },
    { label: "Social Activities", patterns: /social activities|activity calendar|recreational programs/i },
    { label: "Medication Management", patterns: /medication management|medication assistance/i },
  ];

  /**
   * Check if a community needs enrichment based on view/search triggers
   */
  async shouldEnrichCommunity(communityId: number): Promise<boolean> {
    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.id, communityId));

    if (!community) return false;

    // Free mode only works when there is a website to scrape.
    if (!community.website || community.website.length < 5) return false;

    // Never enrich if recently enriched (within minimum refresh window)
    if (community.lastSuccessfulEnrichment) {
      const hoursSinceEnrichment =
        (Date.now() - new Date(community.lastSuccessfulEnrichment).getTime()) / (1000 * 60 * 60);
      if (hoursSinceEnrichment < this.MIN_REFRESH_HOURS) {
        return false;
      }
    }

    // Enrich if never enriched or previously failed
    if (
      community.enrichmentStatus === "pending" ||
      community.enrichmentStatus === "failed" ||
      !community.enrichmentCompleted
    ) {
      return true;
    }

    // Otherwise refresh dynamic content (photos) based on safe cache duration.
    // The free scraper does not manage promotions, so only photo staleness can
    // trigger a refresh — gating on promotions would cause endless re-scraping.
    const shouldUpdatePhotos =
      !community.lastPhotoUpdate || this.isOlderThanHours(community.lastPhotoUpdate, this.PHOTO_CACHE_HOURS);

    return shouldUpdatePhotos;
  }

  /**
   * Trigger enrichment when a community is viewed
   */
  async onCommunityView(communityId: number): Promise<void> {
    try {
      await db
        .update(communities)
        .set({
          viewCount: sql`COALESCE(view_count, 0) + 1`,
          lastViewedAt: new Date(),
          popularityScore: sql`COALESCE(popularity_score, 0) + 1`,
        })
        .where(eq(communities.id, communityId));

      const shouldEnrich = await this.shouldEnrichCommunity(communityId);
      if (shouldEnrich) {
        // Enrich asynchronously without blocking the view
        this.enrichCommunity(communityId).catch((error) => {
          console.error(`Failed to enrich community ${communityId}:`, error);
        });
      }
    } catch (error) {
      console.error(`Error processing community view for ${communityId}:`, error);
    }
  }

  /**
   * Enrich a community using FREE website scraping only (no paid AI).
   */
  async enrichCommunity(communityId: number): Promise<EnrichmentResult> {
    const result: EnrichmentResult = {
      success: false,
      fieldsUpdated: [],
      protectedFieldsSkipped: [],
    };

    try {
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId));

      if (!community) {
        result.error = "Community not found";
        return result;
      }

      await db
        .update(communities)
        .set({
          enrichmentStatus: "in_progress",
          lastEnrichmentAttempt: new Date(),
          enrichmentAttempts: sql`COALESCE(enrichment_attempts, 0) + 1`,
        })
        .where(eq(communities.id, communityId));

      // FREE website scrape (single fetch, parsed with cheerio)
      let scraped: ScrapedData = { photos: [], amenities: [], careTypes: [] };
      if (community.website && !community.websiteProtected) {
        scraped = await this.scrapeWebsiteFree(community.website, community.name || "Community");
        console.log(
          `🌐 Free scrape for ${community.name}: ` +
            `${scraped.description ? `desc(${scraped.description.length})` : "no-desc"}, ` +
            `${scraped.photos.length} photos, ${scraped.careTypes.length} care types, ` +
            `${scraped.amenities.length} amenities from ${community.website}`,
        );
      }

      const updates: any = {};

      // Photos — dynamic field, always refresh when found
      if (scraped.photos.length > 0) {
        updates.photos = scraped.photos.slice(0, 12);
        updates.lastPhotoUpdate = new Date();
        result.fieldsUpdated.push("photos");
      }

      // Description — only set authentic scraped text; never invent.
      // Only fill when the current description is empty or a short auto stub
      // (e.g. "City, ST - assisted living"); never clobber richer existing text.
      const existingDesc = community.description?.trim() || "";
      const isStub = existingDesc.length < 100;
      if (scraped.description && scraped.description.length >= 80 && isStub) {
        updates.description = scraped.description;
        result.fieldsUpdated.push("description");
      }

      // Phone — protected-field aware
      if (scraped.phone && !community.phoneProtected) {
        updates.phone = scraped.phone;
        updates.phoneVerificationCount = sql`COALESCE(phone_verification_count, 0) + 1`;
        if ((community.phoneVerificationCount || 0) + 1 >= this.VERIFICATION_THRESHOLD) {
          updates.phoneProtected = true;
        }
        result.fieldsUpdated.push("phone");
      } else if (scraped.phone && community.phoneProtected) {
        result.protectedFieldsSkipped.push("phone");
      }

      // Email — protected-field aware
      if (scraped.email && !community.emailProtected) {
        updates.email = scraped.email;
        updates.emailVerificationCount = sql`COALESCE(email_verification_count, 0) + 1`;
        if ((community.emailVerificationCount || 0) + 1 >= this.VERIFICATION_THRESHOLD) {
          updates.emailProtected = true;
        }
        result.fieldsUpdated.push("email");
      } else if (scraped.email && community.emailProtected) {
        result.protectedFieldsSkipped.push("email");
      }

      // Care types — fill only when currently empty (don't overwrite curated data)
      if (scraped.careTypes.length > 0 && (!community.careTypes || community.careTypes.length === 0)) {
        updates.careTypes = scraped.careTypes;
        result.fieldsUpdated.push("careTypes");
      }

      // Amenities — fill only when currently empty
      if (scraped.amenities.length > 0 && (!community.amenities || community.amenities.length === 0)) {
        updates.amenities = scraped.amenities;
        result.fieldsUpdated.push("amenities");
      }

      // Rating from structured data (only if we don't already have one)
      if (scraped.rating && !community.rating) {
        updates.rating = scraped.rating.toString();
        result.fieldsUpdated.push("rating");
      }

      // Mark as completed so we don't retry endlessly; record success time.
      updates.enrichmentStatus = "completed";
      updates.lastSuccessfulEnrichment = new Date();
      updates.enrichmentCompleted = true;

      await db.update(communities).set(updates).where(eq(communities.id, communityId));

      result.success = true;
      console.log(`✅ Free enrichment completed for community ${communityId}:`, {
        fieldsUpdated: result.fieldsUpdated,
        protectedFieldsSkipped: result.protectedFieldsSkipped,
      });
    } catch (error) {
      result.error = error instanceof Error ? error.message : "Unknown error";
      console.error(`❌ Free enrichment failed for community ${communityId}:`, error);
      await db
        .update(communities)
        .set({ enrichmentStatus: "failed", lastEnrichmentAttempt: new Date() })
        .where(eq(communities.id, communityId));
    }

    return result;
  }

  /**
   * FREE deep website scraper. Single fetch, parsed with cheerio.
   * Pulls description, photos, phone, email, care types, amenities, and rating
   * from meta tags, JSON-LD structured data, and visible page content.
   */
  private async scrapeWebsiteFree(rawUrl: string, communityName: string): Promise<ScrapedData> {
    const out: ScrapedData = { photos: [], amenities: [], careTypes: [] };

    const url = this.normalizeUrl(rawUrl);
    if (!url) return out;

    let html = "";
    let finalUrl = url;
    try {
      // Manual redirect handling so every hop is re-validated against the SSRF
      // guard (prevents redirect-to-internal-network / metadata pivots).
      let current = url;
      for (let hop = 0; hop < 4; hop++) {
        if (!(await this.isSafePublicUrl(current))) {
          console.log(`🚫 ${communityName}: blocked unsafe/non-public URL ${current}`);
          return out;
        }
        const response = await fetch(current, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (compatible; MySeniorValetBot/1.0; +https://myseniorvalet.com/about)",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          },
          redirect: "manual",
          signal: AbortSignal.timeout(12000),
        });

        if ([301, 302, 303, 307, 308].includes(response.status)) {
          const location = response.headers.get("location");
          if (!location) break;
          current = new URL(location, current).toString();
          continue;
        }

        if (!response.ok) {
          console.log(`⚠️ ${communityName}: site returned HTTP ${response.status} for ${current}`);
          return out;
        }

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("html")) return out;

        const contentLength = parseInt(response.headers.get("content-length") || "0", 10);
        if (contentLength > 5_000_000) return out; // skip oversized responses

        html = (await response.text()).slice(0, 5_000_000);
        finalUrl = current;
        break;
      }
    } catch (error: any) {
      console.log(`⚠️ ${communityName}: could not fetch ${url} — ${error?.message || error}`);
      return out;
    }

    if (!html || html.length < 200) return out;

    const $ = cheerio.load(html);
    const baseUrl = new URL(finalUrl);

    // --- JSON-LD structured data (richest, most authentic source) ---
    const jsonLd = this.extractJsonLd($);

    // --- Description ---
    // Priority: structured data (JSON-LD) → site-owner meta → og → body prose.
    // Curated sources first because body text on SPA/brand sites is often
    // navigation/footer boilerplate. Anything boilerplate is rejected so we
    // never persist junk (Golden Data Rule).
    const metaDesc = $('meta[name="description"]').attr("content")?.trim();
    const ogDesc = $('meta[property="og:description"]').attr("content")?.trim();
    const ldDesc = typeof jsonLd?.description === "string" ? jsonLd.description.trim() : undefined;
    const bodyDesc = this.extractBodyDescription($);

    for (const candidate of [ldDesc, metaDesc, ogDesc, bodyDesc]) {
      if (!candidate) continue;
      const cleaned = this.cleanText(candidate);
      if (cleaned.length >= 60 && !this.isBoilerplate(cleaned)) {
        out.description = cleaned.slice(0, 1800);
        break;
      }
    }

    // --- Photos: og:image, JSON-LD image, and content <img> tags ---
    const photoSet = new Set<string>();
    const ogImage = $('meta[property="og:image"]').attr("content");
    if (ogImage && this.looksLikeContentImage(ogImage, "")) {
      const abs = this.absoluteUrl(ogImage, baseUrl);
      if (abs) photoSet.add(abs);
    }
    this.collectJsonLdImages(jsonLd).forEach((img) => {
      if (!this.looksLikeContentImage(img, "")) return;
      const abs = this.absoluteUrl(img, baseUrl);
      if (abs) photoSet.add(abs);
    });
    $("img").each((_, el) => {
      if (photoSet.size >= 12) return;
      const src = $(el).attr("src") || $(el).attr("data-src") || $(el).attr("data-lazy-src");
      if (!src) return;
      if (!this.looksLikeContentImage(src, $(el).attr("alt") || "")) return;
      const abs = this.absoluteUrl(src, baseUrl);
      if (abs) photoSet.add(abs);
    });
    out.photos = Array.from(photoSet).slice(0, 12);

    // --- Phone ---
    const ldPhone = typeof jsonLd?.telephone === "string" ? jsonLd.telephone : undefined;
    const telHref = $('a[href^="tel:"]').first().attr("href")?.replace(/^tel:/i, "").trim();
    const phone = ldPhone || telHref || this.findPhoneInText($("body").text());
    if (phone) out.phone = this.cleanPhone(phone);

    // --- Email ---
    const ldEmail = typeof jsonLd?.email === "string" ? jsonLd.email : undefined;
    const mailHref = $('a[href^="mailto:"]').first().attr("href")?.replace(/^mailto:/i, "").split("?")[0].trim();
    const email = (ldEmail || mailHref || this.findEmailInText($("body").text()) || "").toLowerCase();
    if (email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) && !this.isGenericEmail(email)) {
      out.email = email;
    }

    // --- Care types & amenities (keyword detection over page text) ---
    const pageText = `${$("title").text()} ${$("body").text()}`;
    out.careTypes = this.CARE_TYPE_KEYWORDS.filter((k) => k.patterns.test(pageText)).map((k) => k.label);
    out.amenities = this.AMENITY_KEYWORDS.filter((k) => k.patterns.test(pageText)).map((k) => k.label);

    // --- Rating from JSON-LD aggregateRating ---
    const ratingVal = this.extractJsonLdRating(jsonLd);
    if (ratingVal && ratingVal >= 1 && ratingVal <= 5) out.rating = Math.round(ratingVal * 10) / 10;

    return out;
  }

  /**
   * Placeholder hook for a future cheap real-research provider. Currently a
   * no-op so the pipeline stays 100% free. Wire a low-cost source here later.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async researchHook(_community: any): Promise<Partial<ScrapedData> | null> {
    return null;
  }

  // ---- HTML extraction helpers ----

  private extractJsonLd($: cheerio.CheerioAPI): any | null {
    let best: any = null;
    $('script[type="application/ld+json"]').each((_, el) => {
      const raw = $(el).contents().text();
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        const nodes = Array.isArray(parsed) ? parsed : parsed["@graph"] ? parsed["@graph"] : [parsed];
        for (const node of nodes) {
          if (!node || typeof node !== "object") continue;
          const type = ([] as string[]).concat(node["@type"] || []).join(" ").toLowerCase();
          if (/organization|localbusiness|place|residence|lodging|healthcare/.test(type)) {
            best = best ? { ...best, ...node } : node;
          } else if (!best && (node.description || node.telephone)) {
            best = node;
          }
        }
      } catch {
        // ignore malformed JSON-LD
      }
    });
    return best;
  }

  private collectJsonLdImages(jsonLd: any): string[] {
    if (!jsonLd?.image) return [];
    const img = jsonLd.image;
    if (typeof img === "string") return [img];
    if (Array.isArray(img)) return img.map((i) => (typeof i === "string" ? i : i?.url)).filter(Boolean);
    if (typeof img === "object" && img.url) return [img.url];
    return [];
  }

  private extractJsonLdRating(jsonLd: any): number | null {
    const agg = jsonLd?.aggregateRating;
    if (!agg) return null;
    const v = typeof agg === "object" ? agg.ratingValue : agg;
    const n = typeof v === "string" ? parseFloat(v) : v;
    return typeof n === "number" && !isNaN(n) ? n : null;
  }

  private extractBodyDescription($: cheerio.CheerioAPI): string | undefined {
    // Remove noise before reading paragraphs
    $("script, style, nav, header, footer, noscript, form, aside").remove();

    const paragraphs: string[] = [];
    $("main p, article p, section p, .content p, p").each((_, el) => {
      const t = $(el).text().replace(/\s+/g, " ").trim();
      if (t.length >= 60 && !/cookie|privacy policy|terms of (use|service)|all rights reserved/i.test(t)) {
        paragraphs.push(t);
      }
    });

    if (paragraphs.length === 0) return undefined;

    // Join the first few substantial paragraphs into a coherent summary.
    let combined = "";
    for (const p of paragraphs) {
      if (combined.length >= 600) break;
      combined += (combined ? " " : "") + p;
    }
    return combined.length >= 80 ? combined : undefined;
  }

  private looksLikeContentImage(src: string, alt: string): boolean {
    const s = src.toLowerCase();
    if (s.startsWith("data:")) return false;
    if (/\.svg(\?|$)/.test(s)) return false;
    if (/logo|icon|sprite|favicon|pixel|tracking|spacer|placeholder|avatar|badge|\bad[s]?\b/.test(s))
      return false;
    // Reject generic/site-wide graphics that brand SPAs reuse across every page
    // (e.g. social-share images, maps, defaults) — these are misleading if saved
    // as a community photo. Better to show "Contact for details".
    if (
      /road[-_]?map|(^|[-_/])map[-_.]|sitemap|default|(^|[-_/])share[-_.]|social|opengraph|og[-_]?image|screenshot|fallback|missing|no[-_]?image|blank|generic|banner[-_]?default|hero[-_]?default/.test(
        s,
      )
    )
      return false;
    if (/logo|icon/i.test(alt)) return false;
    // Prefer obvious image files or sized assets
    return /\.(jpe?g|png|webp)(\?|$)/.test(s) || /\/(images?|photos?|gallery|uploads|media|wp-content)\//.test(s);
  }

  private normalizeUrl(raw: string): string | null {
    if (!raw) return null;
    let u = raw.trim();
    if (!/^https?:\/\//i.test(u)) u = "https://" + u;
    try {
      const parsed = new URL(u);
      if (!parsed.hostname.includes(".")) return null;
      return parsed.toString();
    } catch {
      return null;
    }
  }

  /**
   * SSRF guard. Only allow http(s) on standard ports to PUBLIC hosts. Resolves
   * the hostname via DNS and rejects if any resolved address is loopback,
   * private, link-local (incl. 169.254.169.254 metadata), or otherwise internal.
   */
  private async isSafePublicUrl(rawUrl: string): Promise<boolean> {
    let parsed: URL;
    try {
      parsed = new URL(rawUrl);
    } catch {
      return false;
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;

    // Restrict to default web ports.
    const port = parsed.port ? parseInt(parsed.port, 10) : parsed.protocol === "https:" ? 443 : 80;
    if (port !== 80 && port !== 443) return false;

    const host = parsed.hostname.toLowerCase();
    if (!host || host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) {
      return false;
    }

    // If the host is a literal IP, validate it directly.
    if (isIP(host)) return !this.isPrivateIp(host);

    // Otherwise resolve DNS and ensure every address is public.
    try {
      const addresses = await lookup(host, { all: true });
      if (!addresses.length) return false;
      return addresses.every((a) => !this.isPrivateIp(a.address));
    } catch {
      return false;
    }
  }

  /** Returns true for loopback/private/link-local/reserved IPs (IPv4 + IPv6). */
  private isPrivateIp(ip: string): boolean {
    const v = isIP(ip);
    if (v === 4) {
      const p = ip.split(".").map((n) => parseInt(n, 10));
      if (p.length !== 4 || p.some((n) => isNaN(n) || n < 0 || n > 255)) return true;
      const [a, b] = p;
      if (a === 0 || a === 10 || a === 127) return true; // this-network, private, loopback
      if (a === 169 && b === 254) return true; // link-local incl. cloud metadata
      if (a === 172 && b >= 16 && b <= 31) return true; // private
      if (a === 192 && b === 168) return true; // private
      if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
      if (a === 192 && b === 0) return true; // 192.0.0.0/24 + 192.0.2.0/24 reserved
      if (a === 198 && (b === 18 || b === 19)) return true; // benchmarking
      if (a >= 224) return true; // multicast + reserved + broadcast
      return false;
    }
    if (v === 6) {
      const lower = ip.toLowerCase();
      if (lower === "::1" || lower === "::") return true; // loopback / unspecified
      // IPv4-mapped (::ffff:a.b.c.d) — validate the embedded IPv4
      const mapped = lower.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
      if (mapped) return this.isPrivateIp(mapped[1]);
      if (lower.startsWith("fe8") || lower.startsWith("fe9") || lower.startsWith("fea") || lower.startsWith("feb"))
        return true; // link-local fe80::/10
      if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // unique-local fc00::/7
      if (lower.startsWith("ff")) return true; // multicast
      return false;
    }
    // Unrecognized format — treat as unsafe.
    return true;
  }

  private absoluteUrl(src: string, base: URL): string | null {
    try {
      return new URL(src, base).toString();
    } catch {
      return null;
    }
  }

  private cleanText(t: string): string {
    return t
      .replace(/\s+/g, " ")
      .replace(/\[\d+\]/g, "") // strip citation markers
      .trim();
  }

  private cleanPhone(p: string): string {
    return p.replace(/[^\d+()\-.\s]/g, "").replace(/\s+/g, " ").trim();
  }

  private findPhoneInText(text: string): string | undefined {
    const m = text.match(/(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    return m ? m[0] : undefined;
  }

  private findEmailInText(text: string): string | undefined {
    const m = text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
    return m ? m[0] : undefined;
  }

  /** Reject role-based / site-wide emails that aren't a community contact. */
  private isGenericEmail(email: string): boolean {
    const local = email.split("@")[0];
    return /^(accessibility|privacy|legal|careers?|jobs|webmaster|postmaster|hostmaster|noreply|no-reply|donotreply|do-not-reply|abuse|media|press|marketing|unsubscribe|newsletter|compliance|investor|corporate)$/i.test(
      local,
    );
  }

  /** Detect navigation/footer/error boilerplate so it's never saved as a description. */
  private isBoilerplate(text: string): boolean {
    const t = text.toLowerCase();
    const signals = [
      "let's get where you want to go",
      "caregiver's guide",
      "stop by the home page",
      "skip to main content",
      "skip to content",
      "javascript is disabled",
      "enable javascript",
      "please enable javascript",
      "you need to enable javascript",
      "all rights reserved",
      "privacy policy",
      "terms of use",
      "terms of service",
      "cookie policy",
      "we use cookies",
      "page not found",
      "404",
      "loading...",
      "your browser is out of date",
      "equal housing",
    ];
    if (signals.some((s) => t.includes(s))) return true;
    // Mostly-link/menu text: very few sentence terminators relative to length.
    const sentences = (text.match(/[.!?]/g) || []).length;
    if (text.length > 200 && sentences < 1) return true;
    return false;
  }

  /**
   * Batch enrich high-priority communities (run periodically). FREE only.
   */
  async enrichHighPriorityCommunities(limit: number = 10): Promise<void> {
    try {
      const communitiesToEnrich = await db
        .select()
        .from(communities)
        .where(sql`
          (enrichment_status = 'pending' OR enrichment_status = 'failed' OR
           last_successful_enrichment < NOW() - INTERVAL '7 days')
          AND view_count > 0
          AND website IS NOT NULL AND length(website) > 5
        `)
        .orderBy(sql`popularity_score DESC, view_count DESC`)
        .limit(limit);

      console.log(`🔄 Starting free batch enrichment for ${communitiesToEnrich.length} communities`);

      for (const community of communitiesToEnrich) {
        await this.enrichCommunity(community.id);
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      console.log(`✅ Free batch enrichment completed for ${communitiesToEnrich.length} communities`);
    } catch (error) {
      console.error("❌ Batch enrichment failed:", error);
    }
  }

  /**
   * Force refresh dynamic content (photos) for a community — FREE only.
   */
  async refreshDynamicContent(communityId: number): Promise<EnrichmentResult> {
    const result: EnrichmentResult = {
      success: false,
      fieldsUpdated: [],
      protectedFieldsSkipped: [],
    };

    try {
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId));

      if (!community || !community.website) {
        result.error = "Community not found or no website";
        return result;
      }

      const scraped = await this.scrapeWebsiteFree(community.website, community.name || "Community");
      const updates: any = {};

      if (scraped.photos.length > 0) {
        updates.photos = scraped.photos.slice(0, 12);
        updates.lastPhotoUpdate = new Date();
        result.fieldsUpdated.push("photos");
      }

      if (Object.keys(updates).length > 0) {
        await db.update(communities).set(updates).where(eq(communities.id, communityId));
      }

      result.success = true;
    } catch (error) {
      result.error = error instanceof Error ? error.message : "Unknown error";
    }

    return result;
  }

  private isOlderThanDays(date: Date | string | null, days: number): boolean {
    if (!date) return true;
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const daysSince = (Date.now() - dateObj.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince > days;
  }

  private isOlderThanHours(date: Date | string | null, hours: number): boolean {
    if (!date) return true;
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const hoursSince = (Date.now() - dateObj.getTime()) / (1000 * 60 * 60);
    return hoursSince > hours;
  }
}

// Export singleton instance
export const onDemandEnrichmentService = new OnDemandEnrichmentService();
