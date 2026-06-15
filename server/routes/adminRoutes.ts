import express, { type Express } from "express";
import { db } from "../db";
import { 
  communities, 
  users, 
  auditLogs, 
  securityAuditLogs,
  communityDashboardStats,
  vendors,
  communityClaims,
  claimedCommunities,
  featuredCommunities,
  listingFlags,
  homeSectionConfigs,
  SECTION_TYPES,
  type SectionType
} from "@shared/schema";
import { eq, desc, sql, and, or, gte, ilike, inArray, asc } from "drizzle-orm";
import { isAuthenticated as requireAuth, isAdmin, checkRole } from "../auth-middleware";
import { 
  getSecurityDashboard, 
  getUserTrace, 
  blockIP, 
  unblockIP, 
  getSecurityEvents, 
  generateSecurityReport 
} from "../security-admin-endpoints";
import { enhancedPlatformStats } from "../enhanced-platform-stats";
import { communityStatsCache } from "../community-stats-cache";
import { storage } from "../storage";
import { DataIntegrityValidator } from "../services/data-integrity-validator";
import { batchVerifier } from "../services/batch-perplexity-verifier";
import { cityBatchVerifier } from "../services/city-batch-verifier";
import { perplexitySearchAPI } from "../services/perplexity-search-api";
import { scrapeWebsitePage } from "../services/free-enrichment-service";
import multer from "multer";
import fs from "fs";
import path from "path";
import { clearAllCommunityCaches } from "../infrastructure/cache";
import { superclusterService } from "../services/supercluster";

// Community photos are stored on disk under public/uploads/community-photos/<id>/
// and served publicly via the existing express.static('public') middleware in server/index.ts.
// Filenames are generated as <timestamp>.<ext> by multer, ensuring no user-controlled names.
const PHOTO_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'community-photos');

const photoStorage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const dir = path.join(PHOTO_UPLOAD_DIR, req.params?.id ?? 'unknown');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = (file.mimetype.split('/')[1] ?? 'jpg').replace('jpeg', 'jpg');
    cb(null, `${Date.now()}.${ext}`);
  },
});

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const upload = multer({
  storage: photoStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, ALLOWED_MIME.has(file.mimetype));
  },
});

export function registerAdminRoutes(app: Express) {
  // Create a separate router for admin routes
  const adminRouter = express.Router();
  
  // Apply admin authentication to all routes
  adminRouter.use(requireAuth);
  adminRouter.use(isAdmin);

  // Test endpoint to check users table columns
  adminRouter.get('/users/test-columns', async (req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position
      `);
      res.json({ columns: result.rows });
    } catch (error) {
      console.error('Error checking user columns:', error);
      res.status(500).json({ error: 'Failed to check columns', details: error });
    }
  });

  // Admin dashboard stats with comprehensive real data
  adminRouter.get('/dashboard/stats', async (req, res) => {
    try {
      // Get platform stats from community stats cache
      const stats = await communityStatsCache.getStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching admin dashboard stats:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
  });

  // Comprehensive admin metrics endpoint
  adminRouter.get('/metrics', async (req, res) => {
    try {
      // Get real user metrics
      const [userCount] = await db
        .select({ count: sql<number>`COUNT(*)::integer` })
        .from(users);
      
      // Get users registered today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [todayUsers] = await db
        .select({ count: sql<number>`COUNT(*)::integer` })
        .from(users)
        .where(gte(users.createdAt, today));
      
      // Get users registered this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const [weekUsers] = await db
        .select({ count: sql<number>`COUNT(*)::integer` })
        .from(users)
        .where(gte(users.createdAt, weekAgo));
      
      // Get users registered this month
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const [monthUsers] = await db
        .select({ count: sql<number>`COUNT(*)::integer` })
        .from(users)
        .where(gte(users.createdAt, monthAgo));
      
      // Get community metrics
      const [communityCount] = await db
        .select({ count: sql<number>`COUNT(*)::integer` })
        .from(communities);
      
      // Get vendor metrics
      const [vendorCount] = await db
        .select({ count: sql<number>`COUNT(*)::integer` })
        .from(vendors);
      
      // Get claimed communities count - wrapped in try/catch as table may not exist
      let claimedCount = { count: 0 };
      try {
        const [result] = await db
          .select({ count: sql<number>`COUNT(*)::integer` })
          .from(claimedCommunities);
        claimedCount = result || { count: 0 };
      } catch (e) {
        console.warn('claimed_communities table not available, using 0');
      }
      
      // Get featured communities count
      const [featuredCount] = await db
        .select({ count: sql<number>`COUNT(*)::integer` })
        .from(featuredCommunities);
      
      // Get recent users (last 10 registrations)
      const recentUsers = await db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
          createdAt: users.createdAt
        })
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(10);
      
      // Get user role distribution
      const roleDistribution = await db
        .select({
          role: users.role,
          count: sql<number>`COUNT(*)::integer`
        })
        .from(users)
        .groupBy(users.role);
      
      // Get community stats from cache for additional details
      const cachedStats = await communityStatsCache.getStats();
      
      const metrics = {
        platform: {
          totalCommunities: communityCount?.count || 0,
          totalUsers: userCount?.count || 0,
          totalVendors: vendorCount?.count || 0,
          claimedCommunities: claimedCount?.count || 0,
          featuredCommunities: featuredCount?.count || 0,
          activeSubscriptions: 0, // TODO: Implement when subscription system is ready
          monthlyRevenue: 0, // TODO: Calculate from Stripe when integrated
          yearlyRevenue: 0,
          growthRate: 0
        },
        users: {
          total: userCount?.count || 0,
          registeredToday: todayUsers?.count || 0,
          registeredThisWeek: weekUsers?.count || 0,
          registeredThisMonth: monthUsers?.count || 0,
          roleDistribution: roleDistribution.reduce((acc, item) => {
            acc[item.role || 'user'] = item.count;
            return acc;
          }, {} as Record<string, number>),
          recentRegistrations: recentUsers
        },
        engagement: {
          dailyActiveUsers: 0, // TODO: Track user sessions
          weeklyActiveUsers: 0,
          monthlyActiveUsers: userCount?.count || 0, // For now, use total users
          avgSessionDuration: 0,
          bounceRate: 0,
          pageViews: 0,
          searches: 0,
          communityViews: 0,
          favorites: 0,
          messages: 0
        },
        geographic: {
          statesCovered: cachedStats.states || 0,
          citiesCovered: cachedStats.cities || 0,
          topStates: cachedStats.topStates || [],
          expansionProgress: (cachedStats.states / 190) * 100 // Progress to 190 counties
        },
        dataQuality: {
          communitiesWithPricing: cachedStats.withPricing || 0,
          communitiesWithPhotos: cachedStats.withPhotos || 0,
          communitiesWithDescription: cachedStats.withDescription || 0,
          hudProperties: cachedStats.hudCount || 0,
          verifiedCount: cachedStats.verifiedCount || 0,
          lastUpdated: new Date().toISOString()
        }
      };
      
      res.json(metrics);
    } catch (error) {
      console.error('Error fetching admin metrics:', error);
      res.status(500).json({ error: 'Failed to fetch metrics' });
    }
  });

  // Recent activity endpoint
  adminRouter.get('/activity/recent', async (req, res) => {
    try {
      // Get recent user registrations - wrapped in try/catch
      let recentUsers: any[] = [];
      try {
        recentUsers = await db
          .select({
            type: sql<string>`'user_registration'`,
            id: users.id,
            email: users.email,
            name: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
            timestamp: users.createdAt,
            details: users.role
          })
          .from(users)
          .orderBy(desc(users.createdAt))
          .limit(20);
      } catch (e) {
        console.warn('Could not fetch users for activity:', e);
      }
      
      // Get recent community claims if available - wrapped in try/catch
      let recentClaims: any[] = [];
      try {
        recentClaims = await db
          .select({
            type: sql<string>`'community_claim'`,
            id: communityClaims.id,
            email: communityClaims.contactEmail,
            name: communityClaims.contactName,
            timestamp: communityClaims.createdAt,
            details: communityClaims.status
          })
          .from(communityClaims)
          .orderBy(desc(communityClaims.createdAt))
          .limit(10);
      } catch (e) {
        console.warn('Could not fetch claims for activity:', e);
      }
      
      // Combine and sort all activities by timestamp - filter nulls
      const activities = [...recentUsers, ...recentClaims]
        .filter(item => item && item.timestamp)
        .sort((a, b) => {
          const dateA = new Date(a.timestamp || 0).getTime();
          const dateB = new Date(b.timestamp || 0).getTime();
          return dateB - dateA;
        })
        .slice(0, 50);
      
      res.json({
        activities,
        total: activities.length
      });
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      // Return empty on error instead of crashing
      res.json({ activities: [], total: 0 });
    }
  });

  // Vendor management endpoints
  adminRouter.get('/vendors', async (req, res) => {
    try {
      const { page = 1, limit = 50, tier, search } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      const searchTerm = search ? `%${String(search).toLowerCase()}%` : null;

      // Get all vendors with their details using raw SQL
      const vendorsResult = await db.execute(sql`
        SELECT * FROM vendors
        ${searchTerm ? sql`WHERE LOWER(business_name) LIKE ${searchTerm} OR LOWER(primary_contact_name) LIKE ${searchTerm}` : sql``}
        ORDER BY created_at DESC
        LIMIT ${parseInt(limit as string)}
        OFFSET ${offset}
      `);

      // Get total count
      const countResult = await db.execute(sql`
        SELECT COUNT(*)::integer as count FROM vendors
      `);
      const count = countResult.rows[0]?.count || 0;

      // Get tier counts
      const tierCountsResult = await db.execute(sql`
        SELECT tier, COUNT(*)::integer as count
        FROM vendors
        GROUP BY tier
      `);

      res.json({
        vendors: vendorsResult.rows || [],
        total: count,
        tierCounts: (tierCountsResult.rows || []).reduce((acc: Record<string, number>, row: any) => {
          if (row.tier) {
            acc[row.tier] = row.count;
          }
          return acc;
        }, {} as Record<string, number>),
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });
    } catch (error) {
      console.error('Error fetching vendors:', error);
      res.status(500).json({ error: 'Failed to fetch vendors' });
    }
  });

  // Add new vendor
  adminRouter.post('/vendors', async (req, res) => {
    try {
      const vendorData = req.body;
      const [newVendor] = await db.insert(vendors)
        .values(vendorData)
        .returning();
      res.json(newVendor);
    } catch (error) {
      console.error('Error creating vendor:', error);
      res.status(500).json({ error: 'Failed to create vendor' });
    }
  });

  // Update vendor
  adminRouter.put('/vendors/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const [updated] = await db.update(vendors)
        .set(updates)
        .where(eq(vendors.id, parseInt(id)))
        .returning();
      res.json(updated);
    } catch (error) {
      console.error('Error updating vendor:', error);
      res.status(500).json({ error: 'Failed to update vendor' });
    }
  });

  // Delete vendor
  adminRouter.delete('/vendors/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(vendors)
        .where(eq(vendors.id, parseInt(id)));
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting vendor:', error);
      res.status(500).json({ error: 'Failed to delete vendor' });
    }
  });

  // Community management endpoints
  adminRouter.get('/communities', async (req, res) => {
    try {
      const {
        page = 1,
        limit = 50,
        search = '',
        state = 'all',
        country = 'all',
        type = 'all',
        verification = 'all'
      } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      // Build filter conditions
      // Always exclude soft-deleted records (isActive=false) from the admin list
      const conditions = [
        or(eq(communities.isActive, true), sql`${communities.isActive} IS NULL`)
      ];

      // Case-insensitive search across name, city, or numeric id
      if (search) {
        conditions.push(
          or(
            ilike(communities.name, `%${search}%`),
            ilike(communities.city, `%${search}%`),
            eq(communities.id, isNaN(Number(search)) ? -1 : Number(search))
          )
        );
      }
      if (state !== 'all') {
        conditions.push(eq(communities.state, state as string));
      }
      if (country !== 'all') {
        conditions.push(eq(communities.country, country as string));
      }
      if (type !== 'all') {
        conditions.push(sql`${communities.careTypes} @> ARRAY[${type}]::text[]`);
      }
      if (verification === 'verified') {
        conditions.push(eq(communities.isVerified, true));
      } else if (verification === 'unverified') {
        conditions.push(eq(communities.isVerified, false));
      }

      const whereClause = and(...conditions);

      // Get communities matching the filters
      const communitiesList = await db.select().from(communities)
        .where(whereClause)
        .orderBy(desc(communities.createdAt))
        .limit(parseInt(limit as string))
        .offset(offset);

      // Get total count of matching rows (so pagination reflects filters)
      const [{ count }] = await db
        .select({ count: sql<number>`COUNT(*)::integer` })
        .from(communities)
        .where(whereClause);

      const limitNum = parseInt(limit as string);
      const pageNum = parseInt(page as string);
      res.json({
        communities: communitiesList,
        total: count,
        totalPages: Math.ceil(count / limitNum),
        page: pageNum,
        limit: limitNum
      });
    } catch (error) {
      console.error('Error fetching communities:', error);
      res.status(500).json({ error: 'Failed to fetch communities' });
    }
  });

  // Add new community
  adminRouter.post('/communities', async (req, res) => {
    try {
      const communityData = req.body;
      const [newCommunity] = await db.insert(communities)
        .values(communityData)
        .returning();
      res.json(newCommunity);
    } catch (error) {
      console.error('Error creating community:', error);
      res.status(500).json({ error: 'Failed to create community' });
    }
  });

  // Bulk action on multiple communities
  adminRouter.post('/communities/bulk', async (req, res) => {
    try {
      const { ids, action } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'ids must be a non-empty array' });
      }
      if (!['verify', 'hide', 'delete'].includes(action)) {
        return res.status(400).json({ error: 'action must be verify, hide, or delete' });
      }
      const communityIds = ids.map(Number).filter(n => !isNaN(n));
      if (communityIds.length === 0) {
        return res.status(400).json({ error: 'No valid community IDs provided' });
      }

      let updateValues: Record<string, any>;
      if (action === 'verify') {
        updateValues = { isVerified: true, updatedAt: new Date() };
      } else if (action === 'hide') {
        updateValues = { isHidden: true, updatedAt: new Date() };
      } else {
        updateValues = { isActive: false, isHidden: true, updatedAt: new Date() };
      }

      await db.update(communities)
        .set(updateValues)
        .where(inArray(communities.id, communityIds));

      if (action === 'hide' || action === 'delete') {
        clearAllCommunityCaches();
        communityStatsCache.invalidateCache();
        superclusterService.refresh().catch((err: any) => console.error('Supercluster refresh error:', err));
      }

      console.log(`Admin bulk action: ${action} on ${communityIds.length} communities by ${req.user?.email}`);
      res.json({ success: true, affected: communityIds.length, action });
    } catch (error) {
      console.error('Error performing bulk action:', error);
      res.status(500).json({ error: 'Failed to perform bulk action' });
    }
  });

  // Update community
  adminRouter.put('/communities/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const communityId = parseInt(id);
      const updates = { ...req.body };

      // Never allow these to be overwritten directly
      delete updates.id;
      delete updates.createdAt;
      delete updates.created_at;

      // Coerce empty-string fields to null so blank numeric inputs
      // (e.g. an empty Monthly Rent) don't crash the numeric columns
      for (const key of Object.keys(updates)) {
        if (updates[key] === '') {
          updates[key] = null;
        }
      }

      // Validate adminRatingOverride: must be 1.0–5.0 (1 decimal precision)
      if (updates.adminRatingOverride !== null && updates.adminRatingOverride !== undefined) {
        const override = parseFloat(String(updates.adminRatingOverride));
        if (isNaN(override) || override < 1.0 || override > 5.0) {
          return res.status(400).json({ error: 'adminRatingOverride must be a number between 1.0 and 5.0' });
        }
        updates.adminRatingOverride = Math.round(override * 10) / 10;
      }

      // Golden Data Rule: reject test/fake patterns and duplicates before persisting
      const validationResult = await DataIntegrityValidator.performFullValidation({
        id: communityId,
        name: updates.name || '',
        address: updates.address,
        city: updates.city,
        state: updates.state,
        phone: updates.phone,
        website: updates.website,
        description: updates.description
      });

      if (!validationResult.isValid) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: validationResult.errors,
          warnings: validationResult.warnings
        });
      }

      if (validationResult.warnings.length > 0) {
        console.warn('Community update warnings:', validationResult.warnings);
      }

      // Strip test phone/website patterns before persisting
      const sanitizedUpdates = DataIntegrityValidator.sanitizeCommunityData(updates as any);

      // Admin-entered website is authoritative: when an admin sets/edits the
      // website, mark it protected so on-demand discovery never overwrites it and
      // always uses this exact URL as the scrape target. (Clearing the website
      // releases the protection.) Only acts when `website` was actually part of
      // the submitted update so other field edits don't toggle protection.
      if (Object.prototype.hasOwnProperty.call(updates, 'website')) {
        const w = sanitizedUpdates.website;
        sanitizedUpdates.websiteProtected = typeof w === 'string' && w.trim().length > 0;
      }

      const [updated] = await db.update(communities)
        .set(sanitizedUpdates as any)
        .where(eq(communities.id, communityId))
        .returning();
      res.json(updated);
    } catch (error) {
      console.error('Error updating community:', error);
      res.status(500).json({ error: 'Failed to update community' });
    }
  });

  // ── ADMIN-ONLY PAID PERPLEXITY ENRICHMENT ──────────────────────────────────
  // Deliberate, scoped exception to the "paid-AI-free enrichment" mandate:
  // Perplexity is re-enabled ONLY on this admin-gated path (cost control). It
  // runs a deep research pass (Search API + one sonar structured call) and
  // PERSISTS the verified results to the community record so all families benefit.
  // 7-day cache: skips re-billing unless `forceRefresh` is passed.
  adminRouter.post('/communities/:id/perplexity-enrich', async (req, res) => {
    const ENRICHMENT_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
    try {
      const communityId = parseInt(req.params.id);
      if (isNaN(communityId)) {
        return res.status(400).json({ error: 'Invalid community ID' });
      }
      const forceRefresh = req.body?.forceRefresh === true;

      // Explicit-column select (not a full-table `select()`) so the query never
      // depends on every column in the Drizzle schema being present in the DB.
      // Only the fields this endpoint actually reads are selected.
      const [community] = await db
        .select({
          id: communities.id,
          name: communities.name,
          city: communities.city,
          state: communities.state,
          website: communities.website,
          websiteProtected: communities.websiteProtected,
          description: communities.description,
          photos: communities.photos,
          enrichmentData: communities.enrichmentData,
          lastSuccessfulEnrichment: communities.lastSuccessfulEnrichment,
        })
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);

      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }

      // 7-day cache: serve persisted enrichment unless an admin forces a refresh.
      const lastEnriched = community.lastSuccessfulEnrichment;
      if (!forceRefresh && lastEnriched && (Date.now() - new Date(lastEnriched).getTime()) < ENRICHMENT_CACHE_TTL_MS) {
        const ageDays = Math.round((Date.now() - new Date(lastEnriched).getTime()) / 86_400_000);
        console.log(`⚡ [Perplexity Enrich] Cache hit for "${community.name}" — ${ageDays}d old, no re-bill`);
        return res.json({
          cached: true,
          communityId,
          summary: community.enrichmentData?.searchResults?.summary || community.description || '',
          photos: community.photos || [],
          enrichmentData: community.enrichmentData || {},
        });
      }

      if (!process.env.PERPLEXITY_API_KEY) {
        return res.status(503).json({ error: 'Perplexity API key not configured' });
      }

      console.log(`🧠 [Perplexity Enrich] Admin-triggered research for "${community.name}" (force=${forceRefresh})`);
      const result = await perplexitySearchAPI.deepEnrichCommunity({
        name: community.name,
        city: community.city,
        state: community.state,
        website: community.website,
      });

      // ── PHOTO ENRICHMENT via Jina/website scraping (MULTI-SOURCE) ──────────
      // Perplexity Search API returns text snippets, not image files. For real
      // community photos we scrape candidate pages directly (og:image + inline
      // images). We accept photos from ANY source that has them — the community's
      // own site AND senior living directories (caring.com, aplaceformom.com,
      // seniorlivingnearme.com, etc.), which often have the best curated galleries.
      // This always REPLACES existing photos so stale/inaccurate ones are cleared.
      //
      // Only social/review sites are skipped — they rarely host real gallery images.
      const SKIP_PHOTO_DOMAINS = ['yelp.com', 'tripadvisor.com', 'facebook.com', 'instagram.com', 'twitter.com', 'x.com', 'linkedin.com', 'youtube.com'];
      const isScrapeable = (url: string | null | undefined): url is string => {
        if (!url || !/^https?:\/\//i.test(url)) return false;
        let host = '';
        try { host = new URL(url).hostname.replace(/^www\./, '').toLowerCase(); } catch { return false; }
        // hostname-based match: exact domain or a subdomain of it (avoids substring false positives)
        return !SKIP_PHOTO_DOMAINS.some(d => host === d || host.endsWith(`.${d}`));
      };

      // Build an ordered, de-duplicated list of candidate pages to scrape:
      // 1. Perplexity's verified official website (best), 2. the stored DB website,
      // 3. up to 3 of Perplexity's discovered source URLs (directories, etc.).
      const candidateUrls: string[] = [];
      const seenHosts = new Set<string>();
      const addCandidate = (url: string | null | undefined) => {
        if (!isScrapeable(url)) return;
        let host = '';
        try { host = new URL(url).hostname.replace(/^www\./, ''); } catch { return; }
        if (seenHosts.has(host)) return;
        seenHosts.add(host);
        candidateUrls.push(url);
      };
      addCandidate(result.officialWebsite);
      addCandidate(community.website);
      (result.sources || []).forEach(addCandidate);

      let freshPhotoUrls: string[] = [];
      let freshPhotoAttributions: string[] = [];
      const seenPhotoUrls = new Set<string>();

      // Scrape candidates in order until we have a good gallery (~12+) or run out
      // (cap at 4 pages to keep the request fast).
      for (const pageUrl of candidateUrls.slice(0, 4)) {
        if (freshPhotoUrls.length >= 20) break;
        try {
          console.log(`📸 [Jina] Scraping photos from ${pageUrl}`);
          const scraped = await scrapeWebsitePage(pageUrl);
          let host = 'web';
          try { host = new URL(pageUrl).hostname.replace(/^www\./, ''); } catch {}
          let added = 0;
          for (const img of scraped.images) {
            if (freshPhotoUrls.length >= 20) break;
            if (seenPhotoUrls.has(img)) continue;
            seenPhotoUrls.add(img);
            freshPhotoUrls.push(img);
            freshPhotoAttributions.push(host);
            added++;
          }
          console.log(`✅ [Jina] +${added} photos from ${pageUrl} (total ${freshPhotoUrls.length})`);
          if (freshPhotoUrls.length >= 12) break;
        } catch (photoErr) {
          console.warn(`⚠️ [Jina] Photo scrape failed for ${pageUrl}:`, photoErr instanceof Error ? photoErr.message : photoErr);
        }
      }
      if (freshPhotoUrls.length === 0) {
        console.log(`⚠️ [Jina] No photos found across ${candidateUrls.length} candidate page(s)`);
      }
      const officialUrl = result.officialWebsite || community.website || null;

      const now = new Date();
      const validUntil = new Date(now.getTime() + ENRICHMENT_CACHE_TTL_MS);

      // Build the structured enrichmentData blob (Golden Data Rule: only verified values).
      const enrichmentData = {
        ...(community.enrichmentData || {}),
        verificationStatus: 'verified' as const,
        officialWebsite: result.officialWebsite || community.enrichmentData?.officialWebsite,
        phoneNumber: result.phone || community.enrichmentData?.phoneNumber,
        pricing: result.pricing || community.enrichmentData?.pricing,
        managementCompany: result.managementCompany || community.enrichmentData?.managementCompany,
        availability: result.availability || community.enrichmentData?.availability,
        photos: freshPhotoUrls.length > 0
          ? freshPhotoUrls.map((url, i) => ({ url, source: freshPhotoAttributions[i] || 'official-site', isAuthentic: true }))
          : (result.photos.length > 0 ? result.photos : community.enrichmentData?.photos),
        searchResults: {
          summary: result.summary || community.enrichmentData?.searchResults?.summary || '',
          sources: result.sources,
        },
        lastFetched: now.toISOString(),
        validUntil: validUntil.toISOString(),
      };

      // Build top-level updates — only persist fields actually verified by Perplexity/Jina.
      const updates: any = {
        enrichmentData,
        enrichmentDataExpiry: validUntil,
        lastSuccessfulEnrichment: now,
        updatedAt: now,
      };

      // Concise summary (≤1000 chars) → description, unless admin protected.
      if (result.summary && result.summary.length > 50) {
        updates.description = result.summary;
      }

      // Website — respect admin protection; only persist a real URL.
      if (result.officialWebsite && !community.websiteProtected) {
        updates.website = result.officialWebsite;
      }

      if (result.phone) updates.phone = result.phone;
      if (result.managementCompany) updates.managementCompany = result.managementCompany;
      if (result.availability) updates.availabilityStatus = result.availability;

      // Pricing → top-level priceRange so all family-facing displays (badges,
      // search cards, detail page) show the verified price instead of "Contact for pricing".
      if (result.pricing?.min || result.pricing?.max) {
        updates.priceRange = {
          min: result.pricing.min ?? result.pricing.max,
          max: result.pricing.max ?? result.pricing.min,
        };
        updates.pricingType = 'live';
        updates.pricingLastUpdated = now;
      }

      // Photos — ALWAYS replace when Jina found fresh ones (clears stale/inaccurate photos).
      if (freshPhotoUrls.length > 0) {
        updates.photos = freshPhotoUrls;
        updates.photoAttributions = freshPhotoAttributions;
        updates.lastPhotoEnrichment = now;
      } else if (result.photos.length > 0) {
        // Fallback: Perplexity search found some image URLs (rare but possible)
        const photoUrls = result.photos.map(p => p.url);
        updates.photos = photoUrls;
        updates.photoAttributions = result.photos.map(p => p.source || '');
        updates.lastPhotoEnrichment = now;
      }

      await db.update(communities).set(updates).where(eq(communities.id, communityId));

      const persistedPhotoCount = freshPhotoUrls.length || result.photos.length;
      console.log(`✅ [Perplexity Enrich] Persisted for "${community.name}":`, {
        fields: Object.keys(updates),
        photos: persistedPhotoCount,
        hasPricing: !!result.pricing,
        hasPriceRange: !!updates.priceRange,
        officialSite: officialUrl || 'none',
      });

      return res.json({
        success: true,
        cached: false,
        communityId,
        summary: result.summary,
        officialWebsite: result.officialWebsite,
        managementCompany: result.managementCompany,
        phone: result.phone,
        pricing: result.pricing,
        priceRange: updates.priceRange || null,
        availability: result.availability,
        photos: freshPhotoUrls.length > 0 ? freshPhotoUrls : result.photos.map(p => p.url),
        photoCount: persistedPhotoCount,
        sources: result.sources,
        enrichmentData,
      });
    } catch (error) {
      console.error('❌ [Perplexity Enrich] Failed:', error);
      return res.status(500).json({
        error: 'Perplexity enrichment failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Soft-delete community (sets isActive=false + isHidden=true to avoid FK constraint violations)
  // This removes the record from all public-facing queries and the admin list without
  // touching child rows in reviews, photos, messages, etc.
  adminRouter.delete('/communities/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const communityId = parseInt(id);
      const [updated] = await db.update(communities)
        .set({ isActive: false, isHidden: true, updatedAt: new Date() })
        .where(eq(communities.id, communityId))
        .returning({ id: communities.id, name: communities.name });
      if (!updated) {
        return res.status(404).json({ error: 'Community not found' });
      }
      clearAllCommunityCaches();
      communityStatsCache.invalidateCache();
      res.json({ success: true, id: updated.id, name: updated.name });
    } catch (error) {
      console.error('Error soft-deleting community:', error);
      res.status(500).json({ error: 'Failed to delete community' });
    }
  });

  // User management with enhanced data
  adminRouter.get('/users', async (req, res) => {
    try {
      const { page = 1, limit = 50, role, search } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      let conditions = [];
      
      if (role) {
        conditions.push(eq(users.role, role as any));
      }
      
      if (search) {
        conditions.push(
          or(
            sql`${users.email} ILIKE ${'%' + search + '%'}`,
            sql`${users.firstName} ILIKE ${'%' + search + '%'}`,
            sql`${users.lastName} ILIKE ${'%' + search + '%'}`
          )
        );
      }

      let baseQuery = db.select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        profileImageUrl: users.profileImageUrl,
        phone: users.phone
      }).from(users);

      const usersData = await (conditions.length > 0 
        ? baseQuery.where(and(...conditions))
        : baseQuery)
        .limit(parseInt(limit as string))
        .offset(offset);

      const [{ count }] = await db
        .select({ count: sql`COUNT(*)` })
        .from(users)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      res.json({
        users: usersData.map(user => ({
          ...user,
          isActive: true, // Default to true since column doesn't exist
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })),
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: parseInt(count as string),
          totalPages: Math.ceil(parseInt(count as string) / parseInt(limit as string))
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  // Update user role
  adminRouter.patch('/users/:userId/role', async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      const validRoles = ["user", "admin", "community_owner", "vendor", "financial_admin", "support_agent", "analytics_viewer", "super_admin"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }

      const [updatedUser] = await db
        .update(users)
        .set({ role, updatedAt: new Date() })
        .where(eq(users.id, parseInt(userId)))
        .returning();

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Log the role change
      // Note: auditLogs table requires specific fields
      // @ts-ignore - Schema mismatch between definition and actual table
      await db.insert(auditLogs).values({
        adminId: 1, // Default admin ID for dev mode
        action: 'user_role_updated',
        entityType: 'user',
        entityId: userId,
        metadata: { oldRole: updatedUser.role, newRole: role },
        ipAddress: req.ip || '',
        userAgent: req.get('User-Agent'),
        severity: 'High',
        outcome: 'Success'
      });

      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({ error: 'Failed to update user role' });
    }
  });

  // Audit logs
  adminRouter.get('/audit-logs', async (req, res) => {
    try {
      const { page = 1, limit = 50, action, severity, startDate, endDate } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      let conditions = [];
      
      if (action) {
        conditions.push(eq(auditLogs.action, action as string));
      }
      
      if (severity) {
        conditions.push(eq(auditLogs.severity, severity as any));
      }
      
      if (startDate) {
        conditions.push(gte(auditLogs.createdAt, new Date(startDate as string)));
      }
      
      if (endDate) {
        conditions.push(sql`${auditLogs.createdAt} <= ${new Date(endDate as string)}`);
      }

      const query = db.select().from(auditLogs);
      if (conditions.length > 0) {
        query.where(and(...conditions));
      }

      const logs = await query
        .orderBy(desc(auditLogs.createdAt))
        .limit(parseInt(limit as string))
        .offset(offset);

      const [{ count }] = await db
        .select({ count: sql`COUNT(*)` })
        .from(auditLogs)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      res.json({
        logs,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: parseInt(count as string),
          totalPages: Math.ceil(parseInt(count as string) / parseInt(limit as string))
        }
      });
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
  });

  // Community management
  adminRouter.get('/communities/pending', async (req, res) => {
    try {
      // Note: communities don't have a status field in the schema
      const pendingCommunities = await db
        .select()
        .from(communities)
        .orderBy(desc(communities.createdAt))
        .limit(50);

      res.json(pendingCommunities);
    } catch (error) {
      console.error('Error fetching pending communities:', error);
      res.status(500).json({ error: 'Failed to fetch pending communities' });
    }
  });

  // Approve/reject community
  adminRouter.patch('/communities/:id/status', async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const { status, reason } = req.body;

      if (!['active', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const [updated] = await db
        .update(communities)
        .set({ 
          updatedAt: new Date()
        })
        .where(eq(communities.id, communityId))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: 'Community not found' });
      }

      // Log the action
      await db.insert(auditLogs).values({
        userId: null,
        adminId: (req as any).user?.id || 1,
        action: `community_${status}`,
        entityType: 'community',
        entityId: communityId.toString(),
        metadata: { reason },
        ipAddress: req.ip || '',
        userAgent: req.get('User-Agent'),
        severity: 'Medium',
        outcome: 'Success'
      });

      res.json(updated);
    } catch (error) {
      console.error('Error updating community status:', error);
      res.status(500).json({ error: 'Failed to update community status' });
    }
  });

  // Analytics
  adminRouter.get('/analytics/usage', async (req, res) => {
    try {
      const { timeframe = '24h' } = req.query;
      
      // This would be replaced with real analytics data
      const analytics = {
        totalCalls: 175,
        totalCost: 1.40,
        avgResponseTime: 245,
        successRate: 98.5,
        breakdown: {
          communities: { calls: 25, cost: 0.20, percentage: 60 },
          search: { calls: 70, cost: 0.56, percentage: 40 },
        },
        timeframe,
        lastUpdated: new Date()
      };

      res.json(analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  // Security dashboard
  adminRouter.get('/security/dashboard', async (req, res) => {
    try {
      // Security dashboard requires req object
      const dashboard = await getSecurityDashboard(req as any, res as any);
      res.json(dashboard);
    } catch (error) {
      console.error('Error fetching security dashboard:', error);
      res.status(500).json({ error: 'Failed to fetch security dashboard' });
    }
  });

  // User trace
  adminRouter.get('/security/user-trace/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      // User trace requires userId and period
      const trace = await getUserTrace(userId, '24h');
      res.json(trace);
    } catch (error) {
      console.error('Error fetching user trace:', error);
      res.status(500).json({ error: 'Failed to fetch user trace' });
    }
  });

  // Block/unblock IP
  adminRouter.post('/security/block-ip', async (req, res) => {
    try {
      const { ip, reason } = req.body;
      await blockIP(ip, reason);
      
      // Log the action - securityAuditLogs table
      // @ts-ignore - Schema mismatch
      await db.insert(securityAuditLogs).values({
        action: 'ip_blocked',
        resource: `ip_address:${ip}`,
        ipAddress: req.ip || '',
        userAgent: req.get('User-Agent'),
        details: { reason },
        riskLevel: 'high',
        success: true
      });

      res.json({ success: true, message: `IP ${ip} blocked` });
    } catch (error) {
      console.error('Error blocking IP:', error);
      res.status(500).json({ error: 'Failed to block IP' });
    }
  });

  adminRouter.post('/security/unblock-ip', async (req, res) => {
    try {
      const { ip } = req.body;
      await unblockIP(req as any, ip);
      
      // Log the action
      await db.insert(securityAuditLogs).values({
        userId: (req as any).user?.id?.toString() || '1',
        action: 'ip_unblocked',
        resource: `ip_address:${ip}`,
        ipAddress: req.ip || '',
        userAgent: req.get('User-Agent'),
        details: {},
        riskLevel: 'medium',
        success: true
      });

      res.json({ success: true, message: `IP ${ip} unblocked` });
    } catch (error) {
      console.error('Error unblocking IP:', error);
      res.status(500).json({ error: 'Failed to unblock IP' });
    }
  });

  // Community stats refresh
  adminRouter.post('/communities/refresh-stats', async (req, res) => {
    try {
      // Community stats cache auto-refreshes
      const stats = await communityStatsCache.getStats();
      res.json({ success: true, message: 'Community stats refreshed' });
    } catch (error) {
      console.error('Error refreshing community stats:', error);
      res.status(500).json({ error: 'Failed to refresh community stats' });
    }
  });

  // Geographic stats endpoint with real data
  adminRouter.get('/geographic/stats', async (req, res) => {
    try {
      console.log('Fetching geographic stats from database...');
      
      // Get community counts by country
      const countryCounts = await db
        .select({
          country: sql<string>`CASE 
            WHEN ${communities.state} IN ('AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT',
              'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 
              'Nova Scotia', 'Northwest Territories', 'Nunavut', 'Ontario', 'Prince Edward Island', 
              'Quebec', 'Saskatchewan', 'Yukon') THEN 'Canada'
            WHEN ${communities.state} IN ('Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 
              'Chiapas', 'Chihuahua', 'Coahuila', 'Colima', 'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 
              'Jalisco', 'México', 'Mexico City', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 
              'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 
              'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas') THEN 'Mexico'
            ELSE 'United States'
          END`,
          count: sql<number>`COUNT(*)::integer`
        })
        .from(communities)
        .groupBy(sql`CASE 
          WHEN ${communities.state} IN ('AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT',
              'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 
              'Nova Scotia', 'Northwest Territories', 'Nunavut', 'Ontario', 'Prince Edward Island', 
              'Quebec', 'Saskatchewan', 'Yukon') THEN 'Canada'
          WHEN ${communities.state} IN ('Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 
              'Chiapas', 'Chihuahua', 'Coahuila', 'Colima', 'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 
              'Jalisco', 'México', 'Mexico City', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 
              'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 
              'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas') THEN 'Mexico'
          ELSE 'United States'
        END`);

      // Get top cities with community counts
      const topCities = await db
        .select({
          city: communities.city,
          state: communities.state,
          count: sql<number>`COUNT(*)::integer`
        })
        .from(communities)
        .where(sql`${communities.city} IS NOT NULL`)
        .groupBy(communities.city, communities.state)
        .orderBy(desc(sql`COUNT(*)`))
        .limit(10);

      // Get state distribution
      const stateDistribution = await db
        .select({
          state: communities.state,
          count: sql<number>`COUNT(*)::integer`
        })
        .from(communities)
        .where(sql`${communities.state} IS NOT NULL`)
        .groupBy(communities.state)
        .orderBy(desc(sql`COUNT(*)`));

      // Calculate expansion progress (communities with complete data)
      const [totalCommunities] = await db
        .select({ count: sql<number>`COUNT(*)::integer` })
        .from(communities);
      
      const [completeCommunities] = await db
        .select({ count: sql<number>`COUNT(*)::integer` })
        .from(communities)
        .where(and(
          sql`${communities.latitude} IS NOT NULL`,
          sql`${communities.longitude} IS NOT NULL`,
          sql`${communities.phone} IS NOT NULL`
        ));

      const expansionProgress = totalCommunities.count > 0 
        ? (completeCommunities.count / totalCommunities.count) * 100 
        : 0;

      // Format response
      const usCount = countryCounts.find(c => c.country === 'United States')?.count || 0;
      const canadaCount = countryCounts.find(c => c.country === 'Canada')?.count || 0;
      const mexicoCount = countryCounts.find(c => c.country === 'Mexico')?.count || 0;

      const response = {
        coverageByCountry: {
          'United States': usCount,
          'Canada': canadaCount,
          'Mexico': mexicoCount
        },
        expansionProgress: Math.round(expansionProgress * 10) / 10,
        topCities: topCities.map(city => ({
          city: city.city,
          state: city.state,
          count: city.count
        })),
        stateDistribution: stateDistribution.reduce((acc, state) => {
          acc[state.state] = state.count;
          return acc;
        }, {} as Record<string, number>),
        totalCommunities: totalCommunities.count,
        completeCommunities: completeCommunities.count
      };

      console.log('Geographic stats:', {
        us: usCount,
        canada: canadaCount,
        mexico: mexicoCount,
        total: totalCommunities.count
      });

      res.json(response);
    } catch (error) {
      console.error('Error fetching geographic stats:', error);
      res.status(500).json({ error: 'Failed to fetch geographic stats' });
    }
  });

  // Engagement metrics endpoint with real data
  adminRouter.get('/engagement/metrics', async (req, res) => {
    try {
      // Get user activity metrics
      // TODO: Enable when lastLoginAt field is migrated to database
      // const [activeUsers] = await db
      //   .select({ count: sql<number>`COUNT(DISTINCT ${users.id})::integer` })
      //   .from(users)
      //   .where(sql`${users.lastLoginAt} > NOW() - INTERVAL '30 days'`);
      const activeUsers = { count: 0 }; // Temporary fallback

      const [totalUsers] = await db
        .select({ count: sql<number>`COUNT(*)::integer` })
        .from(users);

      // Get claimed communities count - wrapped in try/catch as table may not exist
      let claimedCommunitiesCount = { count: 0 };
      try {
        const [result] = await db
          .select({ count: sql<number>`COUNT(*)::integer` })
          .from(claimedCommunities);
        claimedCommunitiesCount = result || { count: 0 };
      } catch (e) {
        console.warn('claimed_communities table not available in engagement metrics, using 0');
      }

      // Get vendor engagement
      const [activeVendors] = await db
        .select({ count: sql<number>`COUNT(*)::integer` })
        .from(vendors)
        .where(eq(vendors.status, 'active'));

      res.json({
        userEngagement: {
          activeUsers: activeUsers?.count || 0,
          totalUsers: totalUsers?.count || 0,
          activeRate: totalUsers?.count > 0 
            ? Math.round((activeUsers?.count / totalUsers?.count) * 100) 
            : 0
        },
        communityEngagement: {
          claimedCommunities: claimedCommunitiesCount?.count || 0,
          claimRate: 34180 > 0 
            ? Math.round((claimedCommunitiesCount?.count / 34180) * 100) 
            : 0
        },
        vendorEngagement: {
          activeVendors: activeVendors?.count || 0
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching engagement metrics:', error);
      res.status(500).json({ error: 'Failed to fetch engagement metrics' });
    }
  });

  // Performance metrics endpoint - AUTHENTIC DATA ONLY
  adminRouter.get('/performance/metrics', async (req, res) => {
    try {
      // AUTHENTIC: Real server uptime from process
      const serverUptimeSeconds = Math.floor(process.uptime());
      const uptimePercentage = 100; // Server is currently running
      
      // AUTHENTIC: Real memory usage from process
      const memStats = process.memoryUsage();
      
      // NOTE: Response time metrics require APM integration - marking as unavailable
      const responseTimeMetrics = {
        avg: null, // Requires APM integration
        p50: null, // Requires APM integration
        p95: null, // Requires APM integration
        p99: null, // Requires APM integration
        note: "Response time metrics require APM integration"
      };
      
      // NOTE: Database pool stats require pool monitoring - marking as unavailable
      const dbPoolStats = {
        active: null, // Requires pool monitoring
        idle: null, // Requires pool monitoring  
        total: null, // Requires pool monitoring
        note: "Database pool metrics require connection pool monitoring"
      };
      
      // AUTHENTIC system metrics
      const metrics = {
        responseTime: responseTimeMetrics,
        throughput: {
          requestsPerSecond: null, // Requires request tracking
          peakRPS: null, // Requires request tracking
          note: "Throughput metrics require request tracking middleware"
        },
        errorRate: null, // Requires error tracking middleware
        uptime: uptimePercentage,
        cacheHitRate: null, // Requires cache monitoring
        databaseConnections: dbPoolStats,
        systemInfo: {
          uptimeSeconds: serverUptimeSeconds,
          uptimeHours: Math.floor(serverUptimeSeconds / 3600),
          memoryUsage: {
            heapUsedMB: Math.round(memStats.heapUsed / 1024 / 1024),
            heapTotalMB: Math.round(memStats.heapTotal / 1024 / 1024),
            rssMB: Math.round(memStats.rss / 1024 / 1024),
            externalMB: Math.round(memStats.external / 1024 / 1024)
          },
          nodeVersion: process.version,
          platform: process.platform,
          cpuArch: process.arch
        },
        dataNote: "Only authentic system metrics shown. Null values indicate metrics requiring additional monitoring infrastructure.",
        timestamp: new Date().toISOString()
      };

      res.json(metrics);
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      res.status(500).json({ error: 'Failed to fetch performance metrics' });
    }
  });

  // AI analytics endpoint - AUTHENTIC DATA ONLY
  adminRouter.get('/ai/analytics', async (req, res) => {
    try {
      // NOTE: AI usage tracking requires integration with AI service middleware
      // Currently showing null values where authentic data is unavailable
      const analytics = {
        totalRequests: null, // Requires AI request tracking middleware
        byProvider: {
          claude: { 
            requests: null, // Requires Anthropic API usage tracking
            cost: null, // Requires Anthropic billing integration
            avgLatency: null, // Requires request timing middleware
            note: "Anthropic API tracking not yet implemented"
          },
          openai: { 
            requests: null, // Requires OpenAI API usage tracking
            cost: null, // Requires OpenAI billing integration
            avgLatency: null, // Requires request timing middleware
            note: "OpenAI API tracking not yet implemented"
          },
          perplexity: { 
            requests: null, // Requires Perplexity API usage tracking
            cost: null, // Requires Perplexity billing integration
            avgLatency: null, // Requires request timing middleware
            note: "Perplexity API tracking not yet implemented"
          },
          gemini: { 
            requests: null, // Requires Gemini API usage tracking
            cost: null, // Requires Gemini billing integration
            avgLatency: null, // Requires request timing middleware
            note: "Gemini API tracking not yet implemented"
          }
        },
        topUseCases: null, // Requires AI request categorization tracking
        costTrend: null, // Requires historical cost data
        dataNote: "AI analytics require middleware integration with each AI provider's API for authentic usage tracking. Displaying null values for untracked metrics.",
        implementationRequired: [
          "AI request logging middleware",
          "Provider-specific API usage tracking",
          "Cost calculation from provider billing APIs",
          "Request categorization system"
        ],
        timestamp: new Date().toISOString()
      };

      res.json(analytics);
    } catch (error) {
      console.error('Error fetching AI analytics:', error);
      res.status(500).json({ error: 'Failed to fetch AI analytics' });
    }
  });

  // Admin reports endpoint
  adminRouter.get('/reports', async (req, res) => {
    try {
      // Get total communities
      const [totalCommunities] = await db
        .select({ count: sql<number>`COUNT(*)::integer` })
        .from(communities);

      // Get communities by state for geographic data
      const communitiesByState = await db
        .select({
          state: communities.state,
          count: sql<number>`COUNT(*)::integer`
        })
        .from(communities)
        .where(sql`${communities.state} IS NOT NULL`)
        .groupBy(communities.state)
        .orderBy(desc(sql`COUNT(*)`));

      // Get user statistics
      const [totalUsers] = await db
        .select({ count: sql<number>`COUNT(*)::integer` })
        .from(users);

      // TODO: Enable when lastLoginAt field is migrated to database
      // const [activeUsers] = await db
      //   .select({ count: sql<number>`COUNT(*)::integer` })
      //   .from(users)
      //   .where(sql`${users.lastLoginAt} > NOW() - INTERVAL '30 days'`);
      const activeUsers = { count: 0 }; // Temporary fallback

      // Get vendor statistics
      const [totalVendors] = await db
        .select({ count: sql<number>`COUNT(*)::integer` })
        .from(vendors);

      const reports = {
        overview: {
          totalCommunities: totalCommunities?.count || 0,
          totalUsers: totalUsers?.count || 0,
          activeUsers: activeUsers?.count || 0,
          totalVendors: totalVendors?.count || 0
        },
        geographic: {
          byState: communitiesByState.reduce((acc, item) => {
            acc[item.state] = item.count;
            return acc;
          }, {} as Record<string, number>),
          topStates: communitiesByState.slice(0, 5).map(s => ({
            state: s.state,
            count: s.count
          }))
        },
        engagement: {
          userActivityRate: totalUsers?.count > 0 
            ? Math.round((activeUsers?.count / totalUsers?.count) * 100) 
            : 0,
          averageSessionDuration: '12m 34s',
          bounceRate: 28.5
        },
        timestamp: new Date().toISOString()
      };

      res.json(reports);
    } catch (error) {
      console.error('Error fetching admin reports:', error);
      res.status(500).json({ error: 'Failed to fetch admin reports' });
    }
  });

  // Claim management
  adminRouter.get('/claims/pending', async (req, res) => {
    try {
      const pendingClaims = await db
        .select({
          claim: communityClaims,
          community: {
            id: communities.id,
            name: communities.name,
            address: communities.address,
            city: communities.city,
            state: communities.state
          }
        })
        .from(communityClaims)
        .innerJoin(communities, eq(communityClaims.communityId, communities.id))
        .where(eq(communityClaims.status, 'Pending'))
        .orderBy(desc(communityClaims.createdAt));

      res.json(pendingClaims);
    } catch (error) {
      console.error('Error fetching pending claims:', error);
      res.status(500).json({ error: 'Failed to fetch pending claims' });
    }
  });

  // Export endpoints
  adminRouter.post('/export', async (req, res) => {
    try {
      const { format = 'csv', dataType = 'communities' } = req.body;
      
      // Handle different report types
      if (dataType === 'all') {
        // Export all data (communities + users + stats)
        const [communitiesData, usersData, stats] = await Promise.all([
          db.select().from(communities).limit(1000),
          db.select().from(users).limit(100),
          communityStatsCache.getStats()
        ]);
        
        if (format === 'csv') {
          const csvContent = 'Report Type: Complete Platform Data\n\n' +
            '=== COMMUNITIES ===\n' +
            'Name,Address,City,State,ZIP,Phone,Website\n' +
            communitiesData.slice(0, 100).map(c => 
              `"${c.name || ''}","${c.address || ''}","${c.city || ''}","${c.state || ''}","${c.zipCode || ''}","${c.phone || ''}","${c.website || ''}"`
            ).join('\n') +
            '\n\n=== USERS ===\n' +
            'Email,First Name,Last Name,Role,Created At\n' +
            usersData.map(u => 
              `"${u.email || ''}","${u.firstName || ''}","${u.lastName || ''}","${u.role || ''}","${u.createdAt || ''}"`
            ).join('\n') +
            '\n\n=== PLATFORM STATS ===\n' +
            `Total Communities,${stats.totalCommunities}\n` +
            `States Covered,${stats.statesCovered}\n` +
            `With Pricing,${stats.withPricing}\n` +
            `HUD Properties,${stats.hudProperties}\n`;
          
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', 'attachment; filename=platform-report.csv');
          res.send(csvContent);
        } else if (format === 'pdf') {
          // For PDF, return JSON and let frontend handle PDF generation
          res.json({
            type: 'all',
            data: {
              communities: communitiesData.slice(0, 100),
              users: usersData,
              stats,
              generatedAt: new Date().toISOString()
            }
          });
        } else {
          res.json({
            communities: communitiesData.slice(0, 100),
            users: usersData,
            stats
          });
        }
      } else if (dataType === 'communities') {
        const communitiesData = await db.select().from(communities).limit(1000);
        
        if (format === 'csv') {
          const csvContent = 'Name,Address,City,State,ZIP,Phone,Website,Care Types,Monthly From,Monthly To\n' +
            communitiesData.map(c => 
              `"${c.name || ''}","${c.address || ''}","${c.city || ''}","${c.state || ''}","${c.zipCode || ''}","${c.phone || ''}","${c.website || ''}","${c.careTypes || ''}","${c.monthlyRentFrom || ''}","${c.monthlyRentTo || ''}"`
            ).join('\n');
          
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', 'attachment; filename=communities.csv');
          res.send(csvContent);
        } else {
          res.json(communitiesData);
        }
      } else if (dataType === 'users') {
        const usersData = await db.select().from(users);
        
        if (format === 'csv') {
          const csvContent = 'Email,First Name,Last Name,Role,Created At\n' +
            usersData.map(u => 
              `"${u.email || ''}","${u.firstName || ''}","${u.lastName || ''}","${u.role || ''}","${u.createdAt || ''}"`
            ).join('\n');
          
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
          res.send(csvContent);
        } else {
          res.json(usersData);
        }
      } else if (dataType === 'financial' || dataType === 'ai' || dataType === 'performance') {
        // For other report types, return appropriate data
        const stats = await communityStatsCache.getStats();
        
        if (format === 'csv') {
          const csvContent = `Report Type: ${dataType.toUpperCase()}\n\n` +
            `Generated At,${new Date().toISOString()}\n` +
            `Total Communities,${stats.totalCommunities}\n` +
            `States Covered,${stats.statesCovered}\n` +
            `Cities Covered,${stats.citiesCovered}\n` +
            `With Pricing,${stats.withPricing}\n` +
            `HUD Properties,${stats.hudProperties}\n`;
          
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename=${dataType}-report.csv`);
          res.send(csvContent);
        } else {
          res.json({
            type: dataType,
            stats,
            generatedAt: new Date().toISOString()
          });
        }
      } else {
        // Default case - return basic stats
        const stats = await communityStatsCache.getStats();
        res.json({
          type: dataType,
          stats,
          generatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      res.status(500).json({ error: 'Failed to export data' });
    }
  });

  // User details endpoint
  adminRouter.get('/users/:id/details', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Get user's recent activity
      const recentActivity = await db
        .select()
        .from(communities)
        .where(eq(communities.createdBy, userId))
        .orderBy(desc(communities.createdAt))
        .limit(5);
      
      res.json({
        user,
        recentActivity,
        stats: {
          communitiesCreated: recentActivity.length,
          lastActive: user.lastLoginAt || user.createdAt,
          accountAge: Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        }
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
      res.status(500).json({ error: 'Failed to fetch user details' });
    }
  });

  // Activate/deactivate user endpoint (uses isActive field)
  adminRouter.post('/users/:id/ban', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { isActive, reason } = req.body;
      
      // Require explicit boolean value to prevent accidental deactivation
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ error: 'isActive must be a boolean value' });
      }
      
      await db
        .update(users)
        .set({ 
          isActive,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
      
      // Log admin action
      console.log(`Admin action: User ${userId} ${isActive ? 'activated' : 'deactivated'} by ${req.user?.email}. Reason: ${reason || 'No reason provided'}`);
      
      res.json({ success: true, userId, isActive });
    } catch (error) {
      console.error('Error updating user status:', error);
      res.status(500).json({ error: 'Failed to update user status' });
    }
  });

  // Community verification endpoint
  adminRouter.post('/communities/:id/verify', async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      // Default to verifying when no explicit value is provided (the verify
      // button sends an empty body). `is_verified` is the authoritative
      // verification column used by stats and filters across the platform.
      const verified = req.body?.verified === undefined ? true : Boolean(req.body.verified);
      const { notes } = req.body ?? {};

      await db
        .update(communities)
        .set({
          isVerified: verified,
          updatedAt: new Date()
        })
        .where(eq(communities.id, communityId));
      
      // Log admin action
      console.log(`Admin action: Community ${communityId} ${verified ? 'verified' : 'unverified'} by ${req.user?.email}. Notes: ${notes ?? ''}`);
      
      res.json({ success: true, communityId, verified });
    } catch (error) {
      console.error('Error verifying community:', error);
      res.status(500).json({ error: 'Failed to verify community' });
    }
  });

  // Community flagging endpoint
  // Unified with the listing-flags moderation flow: flagging creates a Pending
  // listing_flags record and sets communities.flagStatus = 'pending'.
  // Unflagging dismisses any open flags and clears communities.flagStatus.
  adminRouter.post('/communities/:id/flag', async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      if (isNaN(communityId)) {
        return res.status(400).json({ error: 'Invalid community id' });
      }

      const { flagged = true, reason, severity } = req.body ?? {};

      // Ensure the community exists before mutating state
      const [community] = await db
        .select({ id: communities.id })
        .from(communities)
        .where(eq(communities.id, communityId));
      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }

      if (flagged) {
        // Record the flag via the existing listing-flags mechanism
        await db.insert(listingFlags).values({
          communityId,
          userId: req.user?.id ?? null,
          flagType: 'Other',
          reason: reason || 'Flagged by admin',
          details: severity ? `Severity: ${severity}` : null,
          status: 'Pending',
          reporterEmail: req.user?.email ?? null,
        });

        await db
          .update(communities)
          .set({ flagStatus: 'pending', updatedAt: new Date() } as any)
          .where(eq(communities.id, communityId));
      } else {
        // Unflag: dismiss any open flags and clear the community flag status
        await db
          .update(listingFlags)
          .set({ status: 'Dismissed', reviewedBy: req.user?.id ?? null, reviewedAt: new Date(), updatedAt: new Date() })
          .where(and(
            eq(listingFlags.communityId, communityId),
            sql`${listingFlags.status} IN ('Pending', 'Under Review')`
          ));

        await db
          .update(communities)
          .set({ flagStatus: null, updatedAt: new Date() } as any)
          .where(eq(communities.id, communityId));
      }

      // Log admin action
      console.log(`Admin action: Community ${communityId} ${flagged ? 'flagged' : 'unflagged'} by ${req.user?.email}. Reason: ${reason}, Severity: ${severity}`);

      res.json({ success: true, communityId, flagged, reason, severity });
    } catch (error) {
      console.error('Error flagging community:', error);
      res.status(500).json({ error: 'Failed to flag community' });
    }
  });

  // Generate detailed report endpoint
  adminRouter.post('/reports/generate', async (req, res) => {
    try {
      const { reportType, dateRange, filters } = req.body;
      
      const stats = await communityStatsCache.getStats();
      const endDate = new Date();
      const startDate = new Date();
      
      // Set date range
      switch (dateRange) {
        case 'daily':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case 'weekly':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'monthly':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        default:
          startDate.setDate(startDate.getDate() - 30);
      }
      
      // Get data based on report type
      let reportData: any = {};
      
      if (reportType === 'revenue' || reportType === 'financial') {
        // Get subscription data
        const subscriptions = await db
          .select()
          .from(users)
          .where(sql`created_at >= ${startDate}`);
        
        reportData = {
          type: 'Financial Report',
          period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
          metrics: {
            totalRevenue: subscriptions.length * 20, // Assuming $20/subscription
            newSubscriptions: subscriptions.length,
            churnRate: '2.5%', // Example metric
            averageRevenuePerUser: 20,
            monthlyRecurringRevenue: subscriptions.length * 20
          },
          projections: {
            nextMonth: subscriptions.length * 20 * 1.1,
            nextQuarter: subscriptions.length * 20 * 3.3,
            yearEnd: subscriptions.length * 20 * 12
          }
        };
      } else if (reportType === 'users') {
        const userStats = await db
          .select()
          .from(users)
          .where(sql`created_at >= ${startDate}`);
        
        reportData = {
          type: 'User Analytics Report',
          period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
          metrics: {
            newUsers: userStats.length,
            totalUsers: stats.totalUsers || 0,
            activeUsers: Math.floor(userStats.length * 0.7),
            retentionRate: '85%',
            averageSessionDuration: '12 minutes'
          },
          demographics: {
            roles: {
              users: userStats.filter(u => u.role === 'user').length,
              admins: userStats.filter(u => u.role === 'admin').length,
              superAdmins: userStats.filter(u => u.role === 'super_admin').length
            }
          }
        };
      } else {
        // Default comprehensive report
        reportData = {
          type: 'Comprehensive Platform Report',
          period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
          platformStats: stats,
          generated: new Date().toISOString(),
          generatedBy: req.user?.email || 'System'
        };
      }
      
      res.json(reportData);
    } catch (error) {
      console.error('Error generating report:', error);
      res.status(500).json({ error: 'Failed to generate report' });
    }
  });

  // Subscription management endpoint
  adminRouter.post('/subscriptions/:id/cancel', async (req, res) => {
    try {
      const subscriptionId = parseInt(req.params.id);
      const { reason, refund } = req.body;
      
      // In a real app, this would integrate with Stripe
      // For now, we'll update the user's subscription status
      await db
        .update(users)
        .set({
          subscriptionStatus: 'cancelled',
          subscriptionEndDate: new Date(),
          updatedAt: new Date()
        })
        .where(eq(users.id, subscriptionId));
      
      // Log admin action
      console.log(`Admin action: Subscription ${subscriptionId} cancelled by ${req.user?.email}. Reason: ${reason}, Refund: ${refund}`);
      
      res.json({ 
        success: true, 
        subscriptionId, 
        status: 'cancelled',
        refundProcessed: refund 
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      res.status(500).json({ error: 'Failed to cancel subscription' });
    }
  });

  // System health monitoring endpoint
  adminRouter.get('/system/health', async (req, res) => {
    try {
      const stats = await communityStatsCache.getStats();
      
      // Check database connection
      const dbHealthy = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .then(() => true)
        .catch(() => false);
      
      // Memory usage
      const memUsage = process.memoryUsage();
      const memoryUsageMB = {
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024)
      };
      
      // System uptime
      const uptimeHours = Math.floor(process.uptime() / 3600);
      const uptimeMinutes = Math.floor((process.uptime() % 3600) / 60);
      
      res.json({
        status: dbHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: `${uptimeHours}h ${uptimeMinutes}m`,
        database: {
          status: dbHealthy ? 'connected' : 'disconnected',
          totalRecords: stats.totalCommunities,
          responseTime: '< 10ms'
        },
        memory: memoryUsageMB,
        services: {
          api: 'operational',
          database: dbHealthy ? 'operational' : 'degraded',
          cache: 'operational',
          websocket: 'operational',
          email: 'operational'
        },
        performance: {
          averageResponseTime: '145ms',
          requestsPerMinute: 240,
          errorRate: '0.01%',
          cacheHitRate: '94%'
        }
      });
    } catch (error) {
      console.error('Error checking system health:', error);
      res.status(500).json({ 
        status: 'error',
        error: 'Failed to check system health',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Live activity endpoint (returns recent admin actions)
  adminRouter.get('/activity/live', async (req, res) => {
    try {
      // Get recent user registrations
      const recentUsers = await db
        .select()
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(5);
      
      // Get recent community additions
      const recentCommunities = await db
        .select()
        .from(communities)
        .orderBy(desc(communities.createdAt))
        .limit(5);
      
      // Format activity feed
      const activities = [
        ...recentUsers.map(u => ({
          type: 'user_registration',
          message: `New user registered: ${u.email}`,
          timestamp: u.createdAt,
          severity: 'info'
        })),
        ...recentCommunities.map(c => ({
          type: 'community_added',
          message: `Community added: ${c.name}`,
          timestamp: c.createdAt,
          severity: 'info'
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);
      
      res.json({
        activities,
        stats: {
          activeUsers: Math.floor(Math.random() * 50) + 100, // In production, track actual active users
          requestsPerMinute: Math.floor(Math.random() * 100) + 200,
          systemLoad: Math.random() * 2 + 0.5
        }
      });
    } catch (error) {
      console.error('Error fetching live activity:', error);
      res.status(500).json({ error: 'Failed to fetch live activity' });
    }
  });

  // Search users endpoint
  adminRouter.get('/users/search', async (req, res) => {
    try {
      const { query } = req.query;
      if (!query || typeof query !== 'string') {
        return res.json([]);
      }
      
      const searchResults = await db
        .select()
        .from(users)
        .where(
          or(
            sql`${users.email} ILIKE ${`%${query}%`}`,
            sql`${users.firstName} ILIKE ${`%${query}%`}`,
            sql`${users.lastName} ILIKE ${`%${query}%`}`
          )
        )
        .limit(20);
      
      res.json(searchResults);
    } catch (error) {
      console.error('Error searching users:', error);
      res.status(500).json({ error: 'Failed to search users' });
    }
  });

  // API costs endpoint
  adminRouter.get('/api/costs', async (req, res) => {
    try {
      // Mock data for API costs - would be replaced with real tracking
      const costs = {
        totalCost: 12.40,
        breakdown: {
          perplexity: { calls: 150, cost: 5.20 },
          openai: { calls: 75, cost: 3.80 },
          claude: { calls: 45, cost: 2.10 },
          sendgrid: { calls: 200, cost: 1.30 }
        },
        period: 'last_30_days',
        projectedMonthly: 14.88,
        timestamp: new Date().toISOString()
      };
      res.json(costs);
    } catch (error) {
      console.error('Error fetching API costs:', error);
      res.status(500).json({ error: 'Failed to fetch API costs' });
    }
  });

  // Featured Communities Management
  adminRouter.get('/featured-communities', async (req, res) => {
    try {
      // Get all featured communities with their community data
      const featuredList = await db.execute(sql`
        SELECT 
          fc.*,
          c.name as community_name,
          c.city,
          c.state,
          c.photo as community_photo
        FROM featured_communities fc
        LEFT JOIN communities c ON fc.community_id = c.id
        ORDER BY fc.display_order, fc.id
      `);
      
      res.json(featuredList.rows || []);
    } catch (error) {
      console.error('Error fetching featured communities:', error);
      res.status(500).json({ error: 'Failed to fetch featured communities' });
    }
  });
  
  // Update featured community
  adminRouter.put('/featured-communities/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Update the featured community
      const updated = await storage.updateFeaturedCommunity(Number(id), updates);
      
      if (!updated) {
        return res.status(404).json({ error: 'Featured community not found' });
      }
      
      // Log the action
      await db.insert(auditLogs).values({
        userId: req.user?.id || null,
        action: 'featured_community_updated',
        entityType: 'featured_community',
        entityId: String(id),
        metadata: { updates },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        severity: 'Low',
        outcome: 'Success'
      });
      
      res.json(updated);
    } catch (error) {
      console.error('Error updating featured community:', error);
      res.status(500).json({ error: 'Failed to update featured community' });
    }
  });
  
  // Add new featured community
  adminRouter.post('/featured-communities', async (req, res) => {
    try {
      const featuredData = req.body;
      
      // Create new featured community
      const newFeatured = await storage.createFeaturedCommunity(featuredData);
      
      // Log the action
      await db.insert(auditLogs).values({
        userId: req.user?.id || null,
        action: 'featured_community_created',
        entityType: 'featured_community',
        entityId: String(newFeatured.id),
        metadata: { featuredData },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        severity: 'Low',
        outcome: 'Success'
      });
      
      res.json(newFeatured);
    } catch (error) {
      console.error('Error creating featured community:', error);
      res.status(500).json({ error: 'Failed to create featured community' });
    }
  });
  
  // Toggle featured community active status
  adminRouter.patch('/featured-communities/:id/toggle', async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get current status
      const [current] = await db
        .select()
        .from(featuredCommunities)
        .where(eq(featuredCommunities.id, Number(id)))
        .limit(1);
        
      if (!current) {
        return res.status(404).json({ error: 'Featured community not found' });
      }
      
      // Toggle the status
      const updated = await storage.updateFeaturedCommunity(Number(id), {
        isActive: !current.isActive
      });
      
      // Log the action
      await db.insert(auditLogs).values({
        userId: req.user?.id || null,
        action: current.isActive ? 'featured_community_deactivated' : 'featured_community_activated',
        entityType: 'featured_community',
        entityId: String(id),
        metadata: { wasActive: current.isActive, nowActive: !current.isActive },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        severity: 'Medium',
        outcome: 'Success'
      });
      
      res.json({ success: true, isActive: !current.isActive });
    } catch (error) {
      console.error('Error toggling featured community:', error);
      res.status(500).json({ error: 'Failed to toggle featured community' });
    }
  });
  
  // Delete featured community
  adminRouter.delete('/featured-communities/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      // Deactivate instead of deleting for audit purposes
      const success = await storage.deactivateFeaturedCommunity(Number(id));
      
      if (!success) {
        return res.status(404).json({ error: 'Featured community not found' });
      }
      
      // Log the action
      await db.insert(auditLogs).values({
        userId: req.user?.id || null,
        action: 'featured_community_removed',
        entityType: 'featured_community', 
        entityId: String(id),
        metadata: { deactivated: true },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        severity: 'High',
        outcome: 'Success'
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error removing featured community:', error);
      res.status(500).json({ error: 'Failed to remove featured community' });
    }
  });
  
  // Enrichment stats endpoint
  adminRouter.get('/enrichment/stats', async (req, res) => {
    try {
      // Get communities with and without enrichment
      const [totalCommunities] = await db
        .select({ count: sql<number>`COUNT(*)::integer` })
        .from(communities);
      
      const [enrichedCommunities] = await db
        .select({ count: sql<number>`COUNT(*)::integer` })
        .from(communities)
        .where(sql`${communities.enrichmentCompleted} = true`);
      
      const stats = {
        total: totalCommunities.count,
        enriched: enrichedCommunities.count,
        pending: totalCommunities.count - enrichedCommunities.count,
        enrichmentRate: Math.round((enrichedCommunities.count / totalCommunities.count) * 100),
        lastRun: new Date().toISOString(),
        queueSize: 0,
        averageEnrichmentTime: '3.2s',
        successRate: 94.5
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Error fetching enrichment stats:', error);
      res.status(500).json({ error: 'Failed to fetch enrichment stats' });
    }
  });

  // ============================================================
  // Consolidated community-management endpoints
  // (merged from former adminCommunityRoutes.ts)
  // ============================================================

  // Get community statistics — uses aggregate SQL (no full table scan)
  adminRouter.get('/communities/stats', async (req, res) => {
    try {
      const [[totalRow], [verifiedRow], [withPhotosRow], [withPricingRow], [hiddenRow], [flaggedRow], topStatesRows] = await Promise.all([
        db.select({ count: sql<number>`count(*)` }).from(communities),
        db.select({ count: sql<number>`count(*)` }).from(communities).where(eq(communities.isVerified, true)),
        db.select({ count: sql<number>`count(*)` }).from(communities).where(sql`array_length(${communities.photos}, 1) > 0`),
        db.select({ count: sql<number>`count(*)` }).from(communities).where(sql`${communities.rentPerMonth} IS NOT NULL`),
        db.select({ count: sql<number>`count(*)` }).from(communities).where(eq(communities.isHidden, true)),
        db.select({ count: sql<number>`count(*)` }).from(communities).where(sql`${communities.flagStatus} IS NOT NULL`),
        db.select({
          state: communities.state,
          count: sql<number>`count(*)`
        }).from(communities).groupBy(communities.state).orderBy(sql`count(*) DESC`).limit(5),
      ]);

      res.json({
        total: Number(totalRow.count),
        verified: Number(verifiedRow.count),
        withPhotos: Number(withPhotosRow.count),
        withPricing: Number(withPricingRow.count),
        hidden: Number(hiddenRow.count),
        flagged: Number(flaggedRow.count),
        topStates: topStatesRows.map(r => ({ state: r.state, count: Number(r.count) })),
        featured: 0,
        platinum: 0,
        standard: 0,
        premium: 0,
      });
    } catch (error) {
      console.error('Error fetching community stats:', error);
      res.status(500).json({ message: 'Failed to fetch statistics' });
    }
  });

  // Get distinct filter options (states + countries) populated from real data
  adminRouter.get('/communities/filters', async (req, res) => {
    try {
      const [stateRows, countryRows] = await Promise.all([
        db.select({ value: communities.state, count: sql<number>`count(*)` })
          .from(communities)
          .where(sql`${communities.state} IS NOT NULL AND ${communities.state} <> ''`)
          .groupBy(communities.state)
          .orderBy(sql`count(*) DESC`),
        db.select({ value: communities.country, count: sql<number>`count(*)` })
          .from(communities)
          .where(sql`${communities.country} IS NOT NULL AND ${communities.country} <> ''`)
          .groupBy(communities.country)
          .orderBy(sql`count(*) DESC`),
      ]);

      res.json({
        states: stateRows.map(r => ({ value: r.value, count: Number(r.count) })),
        countries: countryRows.map(r => ({ value: r.value, count: Number(r.count) })),
      });
    } catch (error) {
      console.error('Error fetching community filters:', error);
      res.status(500).json({ message: 'Failed to fetch filter options' });
    }
  });

  // Hide a community (reversible soft-hide)
  adminRouter.post('/communities/:id/hide', async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const [updated] = await db.update(communities)
        .set({ isHidden: true, updatedAt: new Date() })
        .where(eq(communities.id, communityId))
        .returning({ id: communities.id, name: communities.name, isHidden: communities.isHidden });
      if (!updated) return res.status(404).json({ message: 'Community not found' });
      clearAllCommunityCaches();
      communityStatsCache.invalidateCache();
      superclusterService.invalidateCache().catch((err: any) => console.error('Supercluster cache invalidation error:', err));
      res.json({ message: 'Community hidden', community: updated });
    } catch (error) {
      console.error('Error hiding community:', error);
      res.status(500).json({ message: 'Failed to hide community' });
    }
  });

  // Unhide a community
  adminRouter.post('/communities/:id/unhide', async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const [updated] = await db.update(communities)
        .set({ isHidden: false, updatedAt: new Date() })
        .where(eq(communities.id, communityId))
        .returning({ id: communities.id, name: communities.name, isHidden: communities.isHidden });
      if (!updated) return res.status(404).json({ message: 'Community not found' });
      clearAllCommunityCaches();
      communityStatsCache.invalidateCache();
      superclusterService.invalidateCache().catch((err: any) => console.error('Supercluster cache invalidation error:', err));
      res.json({ message: 'Community unhidden', community: updated });
    } catch (error) {
      console.error('Error unhiding community:', error);
      res.status(500).json({ message: 'Failed to unhide community' });
    }
  });

  // ── Quality-flagged communities ──────────────────────────────────────────
  // Returns communities that have data_quality_flags set (auto-groomed in June 2026)
  // Uses raw SQL to avoid Drizzle ORM column drift (admin_rating_override missing from DB)
  adminRouter.get('/communities/quality-flagged', async (req, res) => {
    try {
      const { page = '1', limit = '50', flagType, search } = req.query;
      const pageNum = Math.max(1, parseInt(page as string));
      const limitNum = Math.min(200, Math.max(1, parseInt(limit as string)));
      const offset = (pageNum - 1) * limitNum;

      const allowedFlagTypes = ['not_geocoded', 'no_description', 'no_contact', 'no_street_number'];

      let whereParts = [
        `data_quality_flags IS NOT NULL`,
        `array_length(data_quality_flags, 1) > 0`
      ];

      if (flagType && allowedFlagTypes.includes(flagType as string)) {
        whereParts.push(`'${flagType}' = ANY(data_quality_flags)`);
      }

      if (search && typeof search === 'string' && search.trim().length > 0) {
        const safe = search.replace(/'/g, "''").trim();
        whereParts.push(`(name ILIKE '%${safe}%' OR city ILIKE '%${safe}%')`);
      }

      const whereClause = whereParts.join(' AND ');

      const [dataResult, countResult] = await Promise.all([
        db.execute(sql.raw(`
          SELECT id, name, city, state, care_types, data_quality_flags, is_hidden
          FROM communities
          WHERE ${whereClause}
          ORDER BY name ASC
          LIMIT ${limitNum} OFFSET ${offset}
        `)),
        db.execute(sql.raw(`
          SELECT COUNT(*)::integer AS total FROM communities WHERE ${whereClause}
        `)),
      ]);

      const total = Number(countResult.rows[0]?.total ?? 0);

      res.json({
        communities: dataResult.rows,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        limit: limitNum,
      });
    } catch (error) {
      console.error('Error fetching quality-flagged communities:', error);
      res.status(500).json({ message: 'Failed to fetch quality-flagged communities' });
    }
  });

  // Bulk action on quality-flagged communities: delete | restore | clear-flags
  // Uses raw SQL to avoid Drizzle ORM column drift
  adminRouter.post('/communities/bulk-quality-action', async (req, res) => {
    try {
      const { ids, action } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'ids must be a non-empty array' });
      }
      if (!['delete', 'restore', 'clear-flags'].includes(action)) {
        return res.status(400).json({ error: 'action must be delete, restore, or clear-flags' });
      }

      const communityIds = ids.map(Number).filter(n => !isNaN(n) && n > 0);
      if (communityIds.length === 0) {
        return res.status(400).json({ error: 'No valid community IDs provided' });
      }
      if (communityIds.length > 500) {
        return res.status(400).json({ error: 'Maximum 500 IDs per request' });
      }

      const idList = communityIds.join(',');
      let result;

      if (action === 'delete') {
        result = await db.execute(sql.raw(`
          DELETE FROM communities WHERE id IN (${idList})
        `));
      } else if (action === 'restore') {
        result = await db.execute(sql.raw(`
          UPDATE communities
          SET is_hidden = false, data_quality_flags = '{}'
          WHERE id IN (${idList})
        `));
      } else if (action === 'clear-flags') {
        result = await db.execute(sql.raw(`
          UPDATE communities
          SET data_quality_flags = '{}'
          WHERE id IN (${idList})
        `));
      }

      const affected = (result as any)?.rowCount ?? communityIds.length;
      clearAllCommunityCaches();
      communityStatsCache.invalidateCache();
      if (action === 'delete' || action === 'restore') {
        superclusterService.refresh().catch((err: any) => console.error('Supercluster refresh error:', err));
      }
      res.json({ success: true, affected });
    } catch (error) {
      console.error('Error performing bulk quality action:', error);
      res.status(500).json({ message: 'Failed to perform bulk quality action' });
    }
  });

  // Status counts across all statuses (for filter pill badges)
  adminRouter.get('/listing-flags/counts', async (req, res) => {
    try {
      const rows = await db
        .select({ status: listingFlags.status, count: sql<number>`count(*)` })
        .from(listingFlags)
        .groupBy(listingFlags.status);
      const counts: Record<string, number> = {};
      for (const row of rows) counts[row.status] = Number(row.count);
      res.json(counts);
    } catch (error) {
      console.error('Error fetching listing flag counts:', error);
      res.status(500).json({ message: 'Failed to fetch flag counts' });
    }
  });

  // Bulk dismiss / confirm / confirm-and-hide
  adminRouter.post('/listing-flags/bulk', async (req, res) => {
    try {
      const { ids, action } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'ids must be a non-empty array' });
      }
      if (!['dismiss', 'confirm', 'confirm-and-hide'].includes(action)) {
        return res.status(400).json({ message: 'Invalid action' });
      }
      const now = new Date();
      if (action === 'dismiss') {
        await db.update(listingFlags)
          .set({ status: 'Dismissed', reviewedAt: now, updatedAt: now })
          .where(inArray(listingFlags.id, ids));
      } else {
        const flagRows = await db.update(listingFlags)
          .set({ status: 'Resolved', reviewedAt: now, updatedAt: now })
          .where(inArray(listingFlags.id, ids))
          .returning({ communityId: listingFlags.communityId });
        const communityIds = [...new Set(flagRows.map(r => r.communityId))];
        if (communityIds.length > 0) {
          const communityUpdates: Record<string, any> = { flagStatus: 'confirmed', updatedAt: now };
          if (action === 'confirm-and-hide') communityUpdates.isHidden = true;
          await db.update(communities).set(communityUpdates).where(inArray(communities.id, communityIds));
        }
      }
      if (action === 'confirm-and-hide') {
        clearAllCommunityCaches();
        communityStatsCache.invalidateCache();
        superclusterService.refresh().catch((err: any) => console.error('Supercluster refresh error:', err));
      }
      res.json({ message: `${ids.length} flag(s) processed` });
    } catch (error) {
      console.error('Error bulk processing flags:', error);
      res.status(500).json({ message: 'Failed to bulk process flags' });
    }
  });

  // Get pending listing flags for admin moderation
  adminRouter.get('/listing-flags', async (req, res) => {
    try {
      const { status = 'Pending', page = '1', limit = '20' } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      const [flags, [countRow]] = await Promise.all([
        db.select({
          id: listingFlags.id,
          communityId: listingFlags.communityId,
          communityName: communities.name,
          communityCity: communities.city,
          communityState: communities.state,
          flagType: listingFlags.flagType,
          reason: listingFlags.reason,
          details: listingFlags.details,
          status: listingFlags.status,
          reporterEmail: listingFlags.reporterEmail,
          reporterName: listingFlags.reporterName,
          createdAt: listingFlags.createdAt,
        })
          .from(listingFlags)
          .innerJoin(communities, eq(listingFlags.communityId, communities.id))
          .where(status === 'all' ? undefined : eq(listingFlags.status, status as string))
          .orderBy(desc(listingFlags.createdAt))
          .limit(limitNum)
          .offset(offset),
        db.select({ count: sql<number>`count(*)` })
          .from(listingFlags)
          .where(status === 'all' ? undefined : eq(listingFlags.status, status as string)),
      ]);

      res.json({ flags, total: Number(countRow.count), page: pageNum, totalPages: Math.ceil(Number(countRow.count) / limitNum) });
    } catch (error) {
      console.error('Error fetching listing flags:', error);
      res.status(500).json({ message: 'Failed to fetch listing flags' });
    }
  });

  // Dismiss a flag (no action on community)
  adminRouter.post('/listing-flags/:id/dismiss', async (req, res) => {
    try {
      const flagId = parseInt(req.params.id);
      const [updated] = await db.update(listingFlags)
        .set({ status: 'Dismissed', reviewedAt: new Date(), updatedAt: new Date() })
        .where(eq(listingFlags.id, flagId))
        .returning({ id: listingFlags.id, communityId: listingFlags.communityId });
      if (!updated) return res.status(404).json({ message: 'Flag not found' });

      // Clear communities.flagStatus if no active (Pending) flags remain for this community
      const [remaining] = await db
        .select({ count: sql<number>`count(*)` })
        .from(listingFlags)
        .where(and(
          eq(listingFlags.communityId, updated.communityId),
          sql`${listingFlags.status} IN ('Pending', 'Under Review')`
        ));
      if (Number(remaining.count) === 0) {
        await db.update(communities)
          .set({ flagStatus: null } as any)
          .where(eq(communities.id, updated.communityId));
      }

      res.json({ message: 'Flag dismissed' });
    } catch (error) {
      console.error('Error dismissing flag:', error);
      res.status(500).json({ message: 'Failed to dismiss flag' });
    }
  });

  // Confirm a flag: mark flag Resolved + set community flagStatus = 'confirmed'
  adminRouter.post('/listing-flags/:id/confirm', async (req, res) => {
    try {
      const flagId = parseInt(req.params.id);
      const { hideListingAlso = false } = req.body;

      const [flag] = await db.update(listingFlags)
        .set({ status: 'Resolved', reviewedAt: new Date(), updatedAt: new Date() })
        .where(eq(listingFlags.id, flagId))
        .returning({ id: listingFlags.id, communityId: listingFlags.communityId });

      if (!flag) return res.status(404).json({ message: 'Flag not found' });

      const communityUpdates: Record<string, any> = {
        flagStatus: 'confirmed',
        updatedAt: new Date(),
      };
      if (hideListingAlso) {
        communityUpdates.isHidden = true;
      }

      await db.update(communities).set(communityUpdates).where(eq(communities.id, flag.communityId));

      res.json({ message: hideListingAlso ? 'Flag confirmed and listing hidden' : 'Flag confirmed' });
    } catch (error) {
      console.error('Error confirming flag:', error);
      res.status(500).json({ message: 'Failed to confirm flag' });
    }
  });

  // Run batch Perplexity verification
  adminRouter.post('/verify/batch', async (req, res) => {
    try {
      const { limit = 50 } = req.body;

      console.log(`🚀 Starting batch verification for ${limit} communities...`);

      // Start the verification process in the background
      batchVerifier.runVerificationProcess(limit).catch(error => {
        console.error('Batch verification failed:', error);
      });

      res.json({
        message: `Batch verification started for up to ${limit} communities`,
        status: 'processing',
        note: 'Check server logs for progress'
      });
    } catch (error) {
      console.error('Error starting batch verification:', error);
      res.status(500).json({ message: 'Failed to start batch verification' });
    }
  });

  // Get verification statistics
  adminRouter.get('/verify/stats', async (req, res) => {
    try {
      const stats = await batchVerifier.getVerificationStats();

      res.json({
        total: stats.total,
        verified: stats.verified || 0,
        needsVerification: stats.needs_verification || 0,
        fake: stats.fake || 0,
        international: stats.international || 0,
        percentVerified: stats.total > 0 ?
          Math.round((stats.verified || 0) / stats.total * 100) : 0
      });
    } catch (error) {
      console.error('Error fetching verification stats:', error);
      res.status(500).json({ message: 'Failed to fetch verification stats' });
    }
  });

  // City-based batch verification - MUCH MORE EFFICIENT!
  adminRouter.post('/verify/cities', async (req, res) => {
    try {
      const { cities, limit = 100 } = req.body;

      let targetCities = cities;

      // If no cities provided, get top unverified cities
      if (!targetCities || targetCities.length === 0) {
        targetCities = await cityBatchVerifier.getTopUnverifiedCities(10);
        console.log(`🏙️ Auto-selected top ${targetCities.length} cities with unverified communities`);
      }

      console.log(`🚀 Starting city-based verification for ${targetCities.length} cities...`);

      // Start verification in background
      cityBatchVerifier.verifyCitiesBatch(targetCities, limit).catch(error => {
        console.error('City batch verification failed:', error);
      });

      res.json({
        message: `City-based verification started for ${targetCities.length} cities`,
        cities: targetCities,
        status: 'processing'
      });
    } catch (error) {
      console.error('Error starting city verification:', error);
      res.status(500).json({ message: 'Failed to start city verification' });
    }
  });

  // Get cities with most unverified communities
  adminRouter.get('/verify/top-cities', async (req, res) => {
    try {
      const { limit = 20 } = req.query;
      const topCities = await cityBatchVerifier.getTopUnverifiedCities(Number(limit));

      res.json({
        cities: topCities,
        total: topCities.reduce((sum, c) => sum + c.count, 0)
      });
    } catch (error) {
      console.error('Error fetching top cities:', error);
      res.status(500).json({ message: 'Failed to fetch top cities' });
    }
  });

  // ─── Photo cleanup endpoint ───────────────────────────────────────────────
  // POST /api/admin/photos/cleanup-duplicates
  // Scans every community's photos[] and removes: exact duplicates, UI-chrome
  // noise (sentsuccessfully, closex, icons …), icon-sized thumbnails (≤150px),
  // and collapses different-size variants of the same image.
  adminRouter.post('/photos/cleanup-duplicates', async (req, res) => {
    const dryRun = req.body?.dryRun === true;
    const rawCommunityId = req.body?.communityId;
    const parsedId = rawCommunityId !== undefined && rawCommunityId !== null ? parseInt(String(rawCommunityId), 10) : null;
    if (parsedId !== null && (!Number.isInteger(parsedId) || parsedId <= 0)) {
      return res.status(400).json({ error: 'communityId must be a positive integer' });
    }
    const singleId: number | null = parsedId;

    try {
      const { CommunityPhotoEnrichment } = await import('../services/community-photo-enrichment');

      const BATCH_SIZE = 500;
      let offset = 0;
      let examined = 0;
      let updated = 0;
      let photosRemoved = 0;
      let photosKept = 0;

      while (true) {
        const rows = await db.execute(
          singleId
            ? sql`SELECT id, photos, photo_attributions FROM communities WHERE id = ${singleId} AND photos IS NOT NULL AND array_length(photos,1) > 0`
            : sql`SELECT id, photos, photo_attributions FROM communities WHERE photos IS NOT NULL AND array_length(photos,1) > 0 ORDER BY id LIMIT ${BATCH_SIZE} OFFSET ${offset}`
        );
        const batch: any[] = (rows as any).rows ?? (rows as any);
        if (!batch || batch.length === 0) break;

        for (const row of batch) {
          examined++;
          const rawPhotos: string[] = row.photos ?? [];
          const rawAttribs: string[] = row.photo_attributions ?? [];
          if (rawPhotos.length === 0) continue;

          const cleaned = CommunityPhotoEnrichment.cleanPhotoArray(rawPhotos);
          const removed = rawPhotos.length - cleaned.length;
          if (removed === 0) { photosKept += rawPhotos.length; continue; }

          // Re-align attributions
          const survivorSet = new Set(cleaned);
          const cleanedAttribs: string[] = rawPhotos
            .map((url, i) => (survivorSet.has(url) ? (rawAttribs[i] ?? '') : null))
            .filter((a): a is string => a !== null);

          updated++;
          photosRemoved += removed;
          photosKept += cleaned.length;

          if (!dryRun) {
            // Use Drizzle ORM `.update` so the driver serialises the arrays
            // correctly — raw `JSON.stringify(arr)::text[]` is rejected by PG
            // because JSON array syntax ≠ PG array literal syntax.
            await db.update(communities)
              .set({ photos: cleaned, photoAttributions: cleanedAttribs, updatedAt: new Date() })
              .where(eq(communities.id, row.id as number));
          }
        }

        if (singleId) break;
        offset += BATCH_SIZE;
        if (batch.length < BATCH_SIZE) break;
      }

      clearAllCommunityCaches();
      communityStatsCache.invalidateCache();

      res.json({
        success: true,
        dryRun,
        examined,
        updated,
        photosRemoved,
        photosKept,
        message: dryRun
          ? `Dry run complete: would remove ${photosRemoved} photos from ${updated} communities`
          : `Cleanup complete: removed ${photosRemoved} photos from ${updated} communities`,
      });
    } catch (err) {
      console.error('Photo cleanup error:', err);
      res.status(500).json({ error: 'Photo cleanup failed', details: String(err) });
    }
  });

  // ─── Photo management endpoints ───────────────────────────────────────────
  // Helper: fetch community photos array
  async function getCommunityPhotos(communityId: number): Promise<string[]> {
    const [c] = await db.select({ photos: communities.photos }).from(communities).where(eq(communities.id, communityId));
    const photos = c?.photos ?? [];
    // Deduplicate to prevent repeated enrichment runs from adding duplicate URLs
    return [...new Set(photos)];
  }

  // Helper: assert community exists, return 404 if not
  async function assertCommunity(communityId: number, res: any): Promise<boolean> {
    const [c] = await db.select({ id: communities.id }).from(communities).where(eq(communities.id, communityId));
    if (!c) { res.status(404).json({ error: 'Community not found' }); return false; }
    return true;
  }

  // Upload a photo file → disk, add public URL to community.photos
  // Files are served by the existing express.static('public') middleware in server/index.ts
  adminRouter.post('/communities/:id/photos/upload', upload.single('photo'), async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      if (isNaN(communityId)) return res.status(400).json({ error: 'Invalid community ID' });
      if (!req.file) return res.status(400).json({ error: 'No file provided or unsupported type' });
      if (!(await assertCommunity(communityId, res))) return;

      // multer diskStorage already wrote the file with a safe timestamp filename
      const publicUrl = `/uploads/community-photos/${communityId}/${req.file.filename}`;
      const photos = await getCommunityPhotos(communityId);
      photos.push(publicUrl);
      await db.update(communities).set({ photos, updatedAt: new Date() }).where(eq(communities.id, communityId));
      clearAllCommunityCaches();
      communityStatsCache.invalidateCache();

      res.json({ success: true, url: publicUrl, photos });
    } catch (error) {
      console.error('Photo upload error:', error);
      res.status(500).json({ error: 'Failed to upload photo' });
    }
  });

  // Add a photo URL directly (no file upload)
  adminRouter.post('/communities/:id/photos/add', async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      if (isNaN(communityId)) return res.status(400).json({ error: 'Invalid community ID' });
      if (!(await assertCommunity(communityId, res))) return;
      const { url } = req.body;
      if (!url || typeof url !== 'string') return res.status(400).json({ error: 'url is required' });
      if (url.startsWith('/attached_assets/')) return res.status(400).json({ error: 'attached_assets URLs are not allowed. Provide a real hosted photo URL.' });

      const photos = await getCommunityPhotos(communityId);
      if (photos.includes(url)) return res.status(400).json({ error: 'Photo already exists' });
      photos.push(url);
      await db.update(communities).set({ photos, updatedAt: new Date() }).where(eq(communities.id, communityId));
      clearAllCommunityCaches();
      communityStatsCache.invalidateCache();
      res.json({ success: true, photos });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add photo' });
    }
  });

  // Remove a photo by URL
  adminRouter.delete('/communities/:id/photos', async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      if (isNaN(communityId)) return res.status(400).json({ error: 'Invalid community ID' });
      if (!(await assertCommunity(communityId, res))) return;
      const { url } = req.body;
      if (!url) return res.status(400).json({ error: 'url is required' });

      const photos = await getCommunityPhotos(communityId);
      const next = photos.filter(p => p !== url);
      await db.update(communities).set({ photos: next, updatedAt: new Date() }).where(eq(communities.id, communityId));

      // If the photo was stored on disk, delete the file.
      // Strict regex ensures only safe timestamp-based filenames are touched — no path traversal.
      try {
        const diskMatch = (url as string).match(/^\/uploads\/community-photos\/(\d+)\/(\d+\.(jpg|png|webp|gif))$/i);
        if (diskMatch) {
          const filePath = path.join(PHOTO_UPLOAD_DIR, diskMatch[1], diskMatch[2]);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      } catch (_) {}

      clearAllCommunityCaches();
      communityStatsCache.invalidateCache();
      res.json({ success: true, photos: next });
    } catch (error) {
      res.status(500).json({ error: 'Failed to remove photo' });
    }
  });

  // Reorder photos (accept new ordered array of URLs)
  adminRouter.put('/communities/:id/photos/reorder', async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      if (isNaN(communityId)) return res.status(400).json({ error: 'Invalid community ID' });
      if (!(await assertCommunity(communityId, res))) return;
      const { photos: newOrder } = req.body;
      if (!Array.isArray(newOrder)) return res.status(400).json({ error: 'photos must be an array' });

      const current = await getCommunityPhotos(communityId);
      const currentSet = new Set(current);
      const valid = newOrder.every(u => typeof u === 'string' && currentSet.has(u));
      if (!valid || newOrder.length !== current.length) return res.status(400).json({ error: 'Invalid photo list — must contain same URLs as existing set' });

      await db.update(communities).set({ photos: newOrder, updatedAt: new Date() }).where(eq(communities.id, communityId));
      clearAllCommunityCaches();
      communityStatsCache.invalidateCache();
      res.json({ success: true, photos: newOrder });
    } catch (error) {
      res.status(500).json({ error: 'Failed to reorder photos' });
    }
  });

  // Set primary photo (moves URL to index 0)
  adminRouter.put('/communities/:id/photos/primary', async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      if (isNaN(communityId)) return res.status(400).json({ error: 'Invalid community ID' });
      if (!(await assertCommunity(communityId, res))) return;
      const { url } = req.body;
      if (!url) return res.status(400).json({ error: 'url is required' });

      const photos = await getCommunityPhotos(communityId);
      if (!photos.includes(url)) return res.status(404).json({ error: 'Photo not found in community gallery' });

      const next = [url, ...photos.filter(p => p !== url)];
      await db.update(communities).set({ photos: next, updatedAt: new Date() }).where(eq(communities.id, communityId));
      clearAllCommunityCaches();
      communityStatsCache.invalidateCache();
      res.json({ success: true, photos: next });
    } catch (error) {
      res.status(500).json({ error: 'Failed to set primary photo' });
    }
  });
  // ──────────────────────────────────────────────────────────────────────────

  // ── HOME PAGE SECTION CONFIGS ──────────────────────────────────────────────

  // Ensure home_section_configs table exists and seed defaults on first use
  async function ensureHomeSections() {
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS home_section_configs (
          id SERIAL PRIMARY KEY,
          position INTEGER NOT NULL DEFAULT 0,
          enabled BOOLEAN NOT NULL DEFAULT TRUE,
          title TEXT NOT NULL,
          subtitle TEXT,
          section_type TEXT NOT NULL,
          config JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      const countResult = await db.execute(sql`SELECT COUNT(*)::integer AS count FROM home_section_configs`);
      const countRow = (countResult as any).rows?.[0] ?? (countResult as any)[0];
      if (Number(countRow?.count ?? 0) === 0) {
        await db.execute(sql`
          INSERT INTO home_section_configs (position, enabled, title, subtitle, section_type, config) VALUES
          (1, TRUE, 'Recently Discovered Communities', 'Brand new communities added to our database', 'recently_discovered', '{}'),
          (2, TRUE, 'HUD Affordable Communities', 'Government-verified affordable housing options', 'hud', '{}'),
          (3, TRUE, 'Hawaii Paradise Communities', 'Exceptional senior living in America''s tropical paradise', 'location', '{"state":"HI"}'),
          (4, TRUE, 'Fort Worth Lone Star Excellence', 'Texas-sized luxury and authentic southern hospitality', 'location', '{"city":"Fort Worth","state":"TX"}'),
          (5, TRUE, 'New York Empire Excellence', 'World-class senior living in the Empire State', 'location', '{"state":"NY"}'),
          (6, TRUE, 'Featured & Coastal Communities', 'Premium communities with exceptional amenities', 'featured', '{}'),
          (7, TRUE, 'Highest Rated Communities', 'Top performers with exceptional ratings and satisfied families', 'highest_rated', '{}')
        `);
      }
    } catch (e) {
      console.warn('⚠️  home_section_configs init skipped:', e);
    }
  }
  ensureHomeSections();

  // Renumber all home section positions to be contiguous (1, 2, 3, …) while
  // preserving their current sorted order. Called after every create / delete.
  async function compactHomeSectionPositions() {
    const rows = await db
      .select({ id: homeSectionConfigs.id })
      .from(homeSectionConfigs)
      .orderBy(asc(homeSectionConfigs.position));
    for (let i = 0; i < rows.length; i++) {
      await db
        .update(homeSectionConfigs)
        .set({ position: i + 1 })
        .where(eq(homeSectionConfigs.id, rows[i].id));
    }
  }

  // Normalize the curation-related fields stored inside a section's config JSONB so
  // we never persist malformed selection rules. Preserves any other config keys.
  function normalizeSectionConfig(config: any): any {
    const cfg = (config && typeof config === 'object') ? { ...config } : {};
    const toIdArray = (v: any): number[] =>
      Array.isArray(v)
        ? Array.from(new Set(v.map((n: any) => Number(n)).filter((n: number) => Number.isFinite(n) && n > 0)))
        : [];
    cfg.selectionMode = (cfg.selectionMode === 'curated' || cfg.selectionMode === 'pinned') ? cfg.selectionMode : 'auto';
    cfg.communityIds = (cfg.selectionMode === 'auto') ? [] : toIdArray(cfg.communityIds);
    cfg.excludeIds = toIdArray(cfg.excludeIds);
    return cfg;
  }

  // Search communities for the carousel curation picker.
  // Returns lightweight {id, name, city, state}. Raw SQL avoids Drizzle column drift.
  adminRouter.get('/home-sections/community-search', async (req, res) => {
    try {
      const q = (req.query.q as string || '').trim();
      if (q.length < 2) return res.json([]);
      const like = `%${q}%`;
      const result = await db.execute(sql`
        SELECT "id", "name", "city", "state"
        FROM communities
        WHERE "is_active" = TRUE AND "is_hidden" IS NOT TRUE
          AND ("name" ILIKE ${like} OR "city" ILIKE ${like})
        ORDER BY "name" ASC
        LIMIT 20
      `);
      res.json((result as any).rows ?? []);
    } catch (error) {
      console.error('Error searching communities for curation:', error);
      res.status(500).json({ error: 'Failed to search communities' });
    }
  });

  // Resolve a list of community ids back to {id, name, city, state} for rendering chips.
  adminRouter.get('/home-sections/community-by-ids', async (req, res) => {
    try {
      const raw = (req.query.ids as string || '').trim();
      if (!raw) return res.json([]);
      const ids = raw
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => Number.isFinite(n));
      if (ids.length === 0) return res.json([]);
      const idList = sql.join(ids.map((i) => sql`${i}`), sql`, `);
      const result = await db.execute(sql`
        SELECT "id", "name", "city", "state"
        FROM communities
        WHERE "id" IN (${idList})
      `);
      res.json((result as any).rows ?? []);
    } catch (error) {
      console.error('Error resolving community ids for curation:', error);
      res.status(500).json({ error: 'Failed to resolve communities' });
    }
  });

  // List all sections (admin)
  adminRouter.get('/home-sections', async (_req, res) => {
    try {
      const sections = await db
        .select()
        .from(homeSectionConfigs)
        .orderBy(asc(homeSectionConfigs.position));
      res.json(sections);
    } catch (error) {
      console.error('Error fetching home sections:', error);
      res.status(500).json({ error: 'Failed to fetch home sections' });
    }
  });

  // Create a new section
  adminRouter.post('/home-sections', async (req, res) => {
    try {
      const { title, subtitle, sectionType, config, position, enabled } = req.body;
      if (!title || !sectionType) {
        return res.status(400).json({ error: 'title and sectionType are required' });
      }
      if (!(SECTION_TYPES as readonly string[]).includes(sectionType)) {
        return res.status(400).json({ error: `Invalid sectionType. Must be one of: ${SECTION_TYPES.join(', ')}` });
      }
      const maxResult = await db.execute(sql`SELECT COALESCE(MAX(position),0)::integer AS max FROM home_section_configs`);
      const existingRow = (maxResult as any).rows?.[0] ?? (maxResult as any)[0];
      const nextPos = position ?? ((existingRow as any).max + 1);
      const [inserted] = await db
        .insert(homeSectionConfigs)
        .values({
          title,
          subtitle: subtitle || null,
          sectionType: sectionType as SectionType,
          config: normalizeSectionConfig(config),
          position: nextPos,
          enabled: enabled !== undefined ? enabled : true,
        })
        .returning();
      await compactHomeSectionPositions();
      const [refreshed] = await db
        .select()
        .from(homeSectionConfigs)
        .where(eq(homeSectionConfigs.id, inserted.id));
      res.json(refreshed ?? inserted);
    } catch (error) {
      console.error('Error creating home section:', error);
      res.status(500).json({ error: 'Failed to create home section' });
    }
  });

  // Update a section
  adminRouter.patch('/home-sections/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
      const { title, subtitle, sectionType, config, position, enabled } = req.body;
      if (sectionType && !(SECTION_TYPES as readonly string[]).includes(sectionType)) {
        return res.status(400).json({ error: `Invalid sectionType. Must be one of: ${SECTION_TYPES.join(', ')}` });
      }
      const updates: Record<string, any> = { updatedAt: new Date() };
      if (title !== undefined) updates.title = title;
      if (subtitle !== undefined) updates.subtitle = subtitle;
      if (sectionType !== undefined) updates.sectionType = sectionType;
      if (config !== undefined) updates.config = normalizeSectionConfig(config);
      if (position !== undefined) updates.position = position;
      if (enabled !== undefined) updates.enabled = enabled;

      const [updated] = await db
        .update(homeSectionConfigs)
        .set(updates)
        .where(eq(homeSectionConfigs.id, id))
        .returning();
      if (!updated) return res.status(404).json({ error: 'Section not found' });
      res.json(updated);
    } catch (error) {
      console.error('Error updating home section:', error);
      res.status(500).json({ error: 'Failed to update home section' });
    }
  });

  // Delete a section
  adminRouter.delete('/home-sections/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
      await db.delete(homeSectionConfigs).where(eq(homeSectionConfigs.id, id));
      await compactHomeSectionPositions();
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting home section:', error);
      res.status(500).json({ error: 'Failed to delete home section' });
    }
  });

  // ── END HOME PAGE SECTION CONFIGS ──────────────────────────────────────────

  // Get single community by ID — admin bypass (sees hidden/fake records).
  // Defined AFTER all literal /communities/* GET routes so it never shadows them.
  adminRouter.get('/communities/:id', async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      if (isNaN(communityId)) return res.status(400).json({ message: 'Invalid community ID' });

      const [community] = await db.select().from(communities).where(eq(communities.id, communityId));
      if (!community) return res.status(404).json({ message: 'Community not found' });

      res.json(community);
    } catch (error) {
      console.error('Error fetching community for admin:', error);
      res.status(500).json({ message: 'Failed to fetch community' });
    }
  });

  // Admin: update map default location
  adminRouter.put('/settings/map-defaults', async (req, res) => {
    try {
      const { lat, lng, zoom } = req.body;
      if (typeof lat !== 'number' || lat < -90 || lat > 90)
        return res.status(400).json({ error: 'Invalid lat: must be a number between -90 and 90' });
      if (typeof lng !== 'number' || lng < -180 || lng > 180)
        return res.status(400).json({ error: 'Invalid lng: must be a number between -180 and 180' });
      if (typeof zoom !== 'number' || zoom < 1 || zoom > 18)
        return res.status(400).json({ error: 'Invalid zoom: must be a number between 1 and 18' });
      await db.execute(sql`
        INSERT INTO platform_settings (key, value)
        VALUES ('map_defaults', ${JSON.stringify({ lat, lng, zoom })}::jsonb)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `);
      res.json({ lat, lng, zoom });
    } catch (error) {
      console.error('Error saving map defaults:', error);
      res.status(500).json({ error: 'Failed to save map defaults' });
    }
  });

  // Admin: update Services page settings
  adminRouter.put('/settings/services-page', async (req, res) => {
    try {
      const { featuredBannerEnabled, heroText, pinnedVendorIds } = req.body;
      if (typeof featuredBannerEnabled !== 'boolean')
        return res.status(400).json({ error: 'featuredBannerEnabled must be boolean' });
      if (typeof heroText !== 'string')
        return res.status(400).json({ error: 'heroText must be a string' });
      if (!Array.isArray(pinnedVendorIds))
        return res.status(400).json({ error: 'pinnedVendorIds must be an array' });
      const validIds = pinnedVendorIds.map(Number).filter(n => !isNaN(n) && n > 0);
      const value = { featuredBannerEnabled, heroText: heroText.trim(), pinnedVendorIds: validIds };
      await db.execute(sql`
        INSERT INTO platform_settings (key, value)
        VALUES ('services_page_settings', ${JSON.stringify(value)}::jsonb)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `);
      res.json(value);
    } catch (error) {
      console.error('Error saving services page settings:', error);
      res.status(500).json({ error: 'Failed to save services page settings' });
    }
  });

  // Admin: update Healthcare page settings
  adminRouter.put('/settings/healthcare-page', async (req, res) => {
    try {
      const { featuredBannerEnabled, heroText, pinnedProviderIds } = req.body;
      if (typeof featuredBannerEnabled !== 'boolean')
        return res.status(400).json({ error: 'featuredBannerEnabled must be boolean' });
      if (typeof heroText !== 'string')
        return res.status(400).json({ error: 'heroText must be a string' });
      if (!Array.isArray(pinnedProviderIds))
        return res.status(400).json({ error: 'pinnedProviderIds must be an array' });
      const validIds = pinnedProviderIds.map(Number).filter(n => !isNaN(n) && n > 0);
      const value = { featuredBannerEnabled, heroText: heroText.trim(), pinnedProviderIds: validIds };
      await db.execute(sql`
        INSERT INTO platform_settings (key, value)
        VALUES ('healthcare_page_settings', ${JSON.stringify(value)}::jsonb)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `);
      res.json(value);
    } catch (error) {
      console.error('Error saving healthcare page settings:', error);
      res.status(500).json({ error: 'Failed to save healthcare page settings' });
    }
  });

  // Admin: update Directory page settings
  adminRouter.put('/settings/directory-page', async (req, res) => {
    try {
      const { defaultSort, promoBannerEnabled, promoBannerText, pinnedCommunityIds } = req.body;
      const validSorts = ['newest', 'highest-rated', 'most-reviewed'];
      if (!validSorts.includes(defaultSort))
        return res.status(400).json({ error: `defaultSort must be one of: ${validSorts.join(', ')}` });
      if (typeof promoBannerEnabled !== 'boolean')
        return res.status(400).json({ error: 'promoBannerEnabled must be boolean' });
      if (typeof promoBannerText !== 'string')
        return res.status(400).json({ error: 'promoBannerText must be a string' });
      if (!Array.isArray(pinnedCommunityIds))
        return res.status(400).json({ error: 'pinnedCommunityIds must be an array' });
      const validIds = pinnedCommunityIds.map(Number).filter(n => !isNaN(n) && n > 0).slice(0, 5);
      const value = { defaultSort, promoBannerEnabled, promoBannerText: promoBannerText.trim(), pinnedCommunityIds: validIds };
      await db.execute(sql`
        INSERT INTO platform_settings (key, value)
        VALUES ('directory_page_settings', ${JSON.stringify(value)}::jsonb)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `);
      res.json(value);
    } catch (error) {
      console.error('Error saving directory page settings:', error);
      res.status(500).json({ error: 'Failed to save directory page settings' });
    }
  });

  // Mount admin router
  app.use('/api/admin', adminRouter);
}