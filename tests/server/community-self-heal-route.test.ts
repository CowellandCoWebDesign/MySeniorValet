/**
 * @jest-environment node
 *
 * Smoke tests for the public self-heal enrichment endpoint:
 *   POST /api/communities/:id/self-heal
 *
 * Locks in the gating logic that was previously only verified by hand:
 *   - invalid id            → 400 (no pipeline call)
 *   - missing community      → 404 (no pipeline call)
 *   - content-complete       → skipped, no pipeline call (Gate 1)
 *   - in-flight de-dup       → skipped (Gate 2: in_progress OR <10 min)
 *   - terminal no_data       → skipped (Gate 3)
 *   - 24h escalating backoff → skipped with retryAfterHours (Gate 4)
 *   - sparse community       → runs enrichCommunityUnified, status → completed
 *   - no-content run         → status → failed, attempts incremented
 *
 * enrichCommunityUnified is mocked so no live web/API calls are made. The admin
 * route /api/admin/communities/:id/perplexity-enrich lives in a different router
 * and is confirmed NOT registered by registerCommunityRoutes.
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// --------------------------------------------------------------------------
// Mock every module the router imports BEFORE importing the router.
// jest.mock() calls are hoisted above the imports.
// --------------------------------------------------------------------------

// The single enrichment pipeline — the key delegation target.
const mockEnrich = jest.fn();
jest.mock('../../server/services/community-enrichment-orchestrator', () => ({
  enrichCommunityUnified: (...a: any[]) => mockEnrich(...a),
}));

// DB — two chains:
//   select().from().where().limit()  → resolves a community row
//   update().set().where()           → resolves (status writes)
const mockLimit = jest.fn();
const mockSelectWhere = jest.fn(() => ({ limit: mockLimit }));
const mockFrom = jest.fn(() => ({ where: mockSelectWhere }));
const mockSelect = jest.fn(() => ({ from: mockFrom }));

const mockUpdateWhere = jest.fn(() => Promise.resolve());
const mockSet = jest.fn(() => ({ where: mockUpdateWhere }));
const mockUpdate = jest.fn(() => ({ set: mockSet }));

jest.mock('../../server/db', () => ({
  db: {
    select: (...a: any[]) => mockSelect(...a),
    update: (...a: any[]) => mockUpdate(...a),
  },
}));

// Shared schema — table + insert-schema stubs (none exercised by /self-heal).
jest.mock('../../shared/schema', () => {
  const t = (name: string) => ({ _: { name }, id: { name: 'id' } });
  return {
    communities: t('communities'),
    reviews: t('reviews'),
    communityClaims: t('communityClaims'),
    claimedCommunities: t('claimedCommunities'),
    pendingCommunities: t('pendingCommunities'),
    auditLogs: t('auditLogs'),
    featuredCommunities: t('featuredCommunities'),
    searchHistory: t('searchHistory'),
    analyticsEvents: t('analyticsEvents'),
    vendors: t('vendors'),
    insertCommunitySchema: { parse: (x: any) => x },
    insertListingFlagSchema: { parse: (x: any) => x },
  };
});

// drizzle-orm helpers — pass args through unchanged.
jest.mock('drizzle-orm', () => ({
  eq: (...a: any[]) => a,
  and: (...a: any[]) => a,
  or: (...a: any[]) => a,
  desc: (...a: any[]) => a,
  inArray: (...a: any[]) => a,
  sql: Object.assign((...a: any[]) => a, { raw: (...a: any[]) => a }),
  between: (...a: any[]) => a,
  gte: (...a: any[]) => a,
  lte: (...a: any[]) => a,
  isNotNull: (...a: any[]) => a,
  isNull: (...a: any[]) => a,
  not: (...a: any[]) => a,
}));

// Auth — let every request through (self-heal is public anyway).
jest.mock('../../server/auth-middleware', () => ({
  isAuthenticated: (_req: any, _res: any, next: any) => next(),
  isAdmin: (_req: any, _res: any, next: any) => next(),
  checkRole: () => (_req: any, _res: any, next: any) => next(),
}));

// Remaining service imports — stubbed; not exercised by /self-heal.
jest.mock('../../shared/community-classification', () => ({
  isClearlyFake: () => false,
}));
jest.mock('../../server/utils/generate-slug', () => ({
  generateCommunitySlug: () => 'slug',
  generateSlug: () => 'slug',
}));
jest.mock('../../server/storage', () => ({ storage: {} }));
jest.mock('../../server/enhanced-search-service', () => ({ enhancedSearchService: {} }));
jest.mock('../../server/data-quality-enhancement', () => ({ dataQualityEnhancement: {} }));
jest.mock('../../server/care-type-classifier', () => ({ careTypeClassifier: {} }));
jest.mock('../../server/pricing-transparency-badges', () => ({ pricingTransparencyService: {} }));
jest.mock('../../server/intelligent-pricing-service', () => ({ intelligentPricingService: {} }));
jest.mock('../../server/nationwide-pricing-research', () => ({ nationwidePricingResearch: {} }));
jest.mock('../../server/intelligent-pricing-system', () => ({ eliminateCallForPricing: () => ({}) }));
jest.mock('../../server/real-data-analyzer', () => ({ realDataAnalyzer: {} }));
jest.mock('../../server/services/internal-notifications', () => ({ internalNotifications: {} }));
jest.mock('../../server/utils/photo-urls', () => ({ normalizePhotoUrls: (x: any) => x }));
jest.mock('../../server/services/community-photo-enrichment', () => ({ CommunityPhotoEnrichment: {} }));

// --------------------------------------------------------------------------
// Now import the router under test.
// --------------------------------------------------------------------------
import request from 'supertest';
import express from 'express';
import { registerCommunityRoutes } from '../../server/routes/communityRoutes';

function buildApp() {
  const app = express();
  app.use(express.json());
  registerCommunityRoutes(app);
  return app;
}

// A "sparse" community row that passes every gate and triggers enrichment.
function communityRow(overrides: Record<string, any> = {}) {
  return {
    id: 1,
    name: 'Sunrise Villa',
    description: '',
    photos: [],
    enrichmentStatus: 'pending',
    enrichmentAttempts: 0,
    lastEnrichmentAttempt: null,
    ...overrides,
  };
}

// A successful pipeline result (real content persisted this run).
function enrichResult(overrides: Record<string, any> = {}) {
  return {
    cached: false,
    contentSaved: true,
    photos: ['https://cdn.example.com/a.jpg'],
    summary: 'A lovely assisted living community with great staff and amenities.',
    phone: '555-123-4567',
    officialWebsite: 'https://sunrisevilla.com',
    careTypes: ['assisted living'],
    ...overrides,
  };
}

const MIN = 60 * 1000;
const HOUR = 60 * MIN;

describe('POST /api/communities/:id/self-heal', () => {
  let app: express.Express;

  beforeEach(() => {
    mockEnrich.mockReset();
    mockLimit.mockReset();
    mockSelect.mockClear();
    mockUpdate.mockClear();
    mockSet.mockClear();
    mockUpdateWhere.mockClear();
    mockUpdateWhere.mockResolvedValue(undefined as never);
    mockLimit.mockResolvedValue([communityRow()]);
    app = buildApp();
  });

  // ── Input guards ─────────────────────────────────────────────────────────

  it('returns 400 for a non-numeric community id', async () => {
    const res = await request(app).post('/api/communities/abc/self-heal').send({});
    expect(res.status).toBe(400);
    expect(mockEnrich).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('returns 400 for a non-integer-looking id (e.g. "1abc")', async () => {
    const res = await request(app).post('/api/communities/1abc/self-heal').send({});
    expect(res.status).toBe(400);
    expect(mockEnrich).not.toHaveBeenCalled();
  });

  it('returns 404 when the community does not exist', async () => {
    mockLimit.mockResolvedValue([]);
    const res = await request(app).post('/api/communities/999/self-heal').send({});
    expect(res.status).toBe(404);
    expect(mockEnrich).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  // ── Gate 1: content-complete ───────────────────────────────────────────────

  it('skips a content-complete community (photos + long description) without enriching', async () => {
    mockLimit.mockResolvedValue([
      communityRow({
        photos: ['https://cdn.example.com/a.jpg'],
        description: 'x'.repeat(150),
      }),
    ]);
    const res = await request(app).post('/api/communities/1/self-heal').send({});
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ skipped: true, reason: 'already has content' });
    expect(mockEnrich).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('does NOT treat photos-without-description as content-complete', async () => {
    // photos present but description < 100 chars → should still enrich.
    mockLimit.mockResolvedValue([
      communityRow({ photos: ['https://cdn.example.com/a.jpg'], description: 'short' }),
    ]);
    mockEnrich.mockResolvedValue(enrichResult());
    const res = await request(app).post('/api/communities/1/self-heal').send({});
    expect(res.status).toBe(200);
    expect(res.body.skipped).toBe(false);
    expect(mockEnrich).toHaveBeenCalledWith(1);
  });

  // ── Gate 2: in-flight de-dup ───────────────────────────────────────────────

  it('skips when enrichmentStatus is in_progress', async () => {
    mockLimit.mockResolvedValue([communityRow({ enrichmentStatus: 'in_progress' })]);
    const res = await request(app).post('/api/communities/1/self-heal').send({});
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ skipped: true, reason: 'enrichment in progress' });
    expect(mockEnrich).not.toHaveBeenCalled();
  });

  it('skips a second call within the 10-minute window', async () => {
    mockLimit.mockResolvedValue([
      communityRow({ lastEnrichmentAttempt: new Date(Date.now() - 5 * MIN) }),
    ]);
    const res = await request(app).post('/api/communities/1/self-heal').send({});
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ skipped: true, reason: 'enrichment in progress' });
    expect(mockEnrich).not.toHaveBeenCalled();
  });

  // ── Gate 3: terminal no_data ───────────────────────────────────────────────

  it('skips forever when enrichmentStatus is no_data (terminal)', async () => {
    mockLimit.mockResolvedValue([communityRow({ enrichmentStatus: 'no_data' })]);
    const res = await request(app).post('/api/communities/1/self-heal').send({});
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ skipped: true, reason: 'no data found (terminal)' });
    expect(mockEnrich).not.toHaveBeenCalled();
  });

  // ── Gate 4: escalating backoff rate limit ──────────────────────────────────

  it('honors the 24h cooldown for a recent failed attempt', async () => {
    mockLimit.mockResolvedValue([
      communityRow({
        enrichmentStatus: 'failed',
        enrichmentAttempts: 0,
        lastEnrichmentAttempt: new Date(Date.now() - 1 * HOUR), // 1h ago: past 10m, under 24h
      }),
    ]);
    const res = await request(app).post('/api/communities/1/self-heal').send({});
    expect(res.status).toBe(200);
    expect(res.body.skipped).toBe(true);
    expect(res.body.reason).toBe('rate limited');
    expect(res.body.retryAfterHours).toBe(24);
    expect(mockEnrich).not.toHaveBeenCalled();
  });

  it('escalates the cooldown to 7d after two consecutive no-data runs', async () => {
    mockLimit.mockResolvedValue([
      communityRow({
        enrichmentStatus: 'failed',
        enrichmentAttempts: 2,
        lastEnrichmentAttempt: new Date(Date.now() - 2 * 24 * HOUR), // 2d ago: under 7d
      }),
    ]);
    const res = await request(app).post('/api/communities/1/self-heal').send({});
    expect(res.status).toBe(200);
    expect(res.body.reason).toBe('rate limited');
    expect(res.body.retryAfterHours).toBe(24 * 7);
    expect(res.body.consecutiveNoDataAttempts).toBe(2);
    expect(mockEnrich).not.toHaveBeenCalled();
  });

  it('allows a retry once the 24h cooldown has elapsed', async () => {
    mockLimit.mockResolvedValue([
      communityRow({
        enrichmentStatus: 'failed',
        enrichmentAttempts: 0,
        lastEnrichmentAttempt: new Date(Date.now() - 25 * HOUR), // past 24h
      }),
    ]);
    mockEnrich.mockResolvedValue(enrichResult());
    const res = await request(app).post('/api/communities/1/self-heal').send({});
    expect(res.status).toBe(200);
    expect(res.body.skipped).toBe(false);
    expect(mockEnrich).toHaveBeenCalledWith(1);
  });

  // ── Happy path: sparse community triggers enrichment ───────────────────────

  it('runs the unified pipeline for a sparse community and marks it completed', async () => {
    mockEnrich.mockResolvedValue(enrichResult());
    const res = await request(app).post('/api/communities/1/self-heal').send({});

    expect(res.status).toBe(200);
    expect(mockEnrich).toHaveBeenCalledWith(1);
    expect(res.body.success).toBe(true);
    expect(res.body.skipped).toBe(false);
    expect(res.body.foundData).toBe(true);
    expect(res.body.community).toEqual({
      id: 1,
      photos: ['https://cdn.example.com/a.jpg'],
      description: 'A lovely assisted living community with great staff and amenities.',
      phone: '555-123-4567',
      website: 'https://sunrisevilla.com',
      careTypes: ['assisted living'],
    });

    // First update marks in_progress; a later update marks completed + resets attempts.
    expect(mockUpdate).toHaveBeenCalled();
    const setCalls = mockSet.mock.calls.map((c: any[]) => c[0]);
    expect(setCalls[0]).toMatchObject({ enrichmentStatus: 'in_progress' });
    const completed = setCalls.find((s: any) => s.enrichmentStatus === 'completed');
    expect(completed).toMatchObject({ enrichmentStatus: 'completed', enrichmentAttempts: 0 });
  });

  it('treats a cache hit as found data (status → completed)', async () => {
    mockEnrich.mockResolvedValue(enrichResult({ cached: true, contentSaved: false }));
    const res = await request(app).post('/api/communities/1/self-heal').send({});
    expect(res.status).toBe(200);
    expect(res.body.foundData).toBe(true);
    const setCalls = mockSet.mock.calls.map((c: any[]) => c[0]);
    expect(setCalls.some((s: any) => s.enrichmentStatus === 'completed')).toBe(true);
  });

  // ── No-content run escalates backoff ───────────────────────────────────────

  it('marks status failed and increments attempts when no content is found', async () => {
    mockLimit.mockResolvedValue([communityRow({ enrichmentAttempts: 0 })]);
    mockEnrich.mockResolvedValue(
      enrichResult({ cached: false, contentSaved: false, photos: [], summary: '' }),
    );
    const res = await request(app).post('/api/communities/1/self-heal').send({});
    expect(res.status).toBe(200);
    expect(res.body.foundData).toBe(false);
    const setCalls = mockSet.mock.calls.map((c: any[]) => c[0]);
    const failed = setCalls.find((s: any) => s.enrichmentStatus === 'failed');
    expect(failed).toMatchObject({ enrichmentStatus: 'failed', enrichmentAttempts: 1 });
  });

  it('marks status no_data (terminal) on the final consecutive no-content run', async () => {
    // attempts already at terminal-1 (3); one more no-content run hits 4 → no_data.
    mockLimit.mockResolvedValue([
      communityRow({
        enrichmentStatus: 'failed',
        enrichmentAttempts: 3,
        lastEnrichmentAttempt: new Date(Date.now() - 40 * 24 * HOUR), // past 30d cooldown
      }),
    ]);
    mockEnrich.mockResolvedValue(
      enrichResult({ cached: false, contentSaved: false, photos: [], summary: '' }),
    );
    const res = await request(app).post('/api/communities/1/self-heal').send({});
    expect(res.status).toBe(200);
    expect(res.body.foundData).toBe(false);
    const setCalls = mockSet.mock.calls.map((c: any[]) => c[0]);
    const terminal = setCalls.find((s: any) => s.enrichmentStatus === 'no_data');
    expect(terminal).toMatchObject({ enrichmentStatus: 'no_data', enrichmentAttempts: 4 });
  });

  // ── Pipeline error is transient (does not escalate backoff) ────────────────

  it('returns 500 and marks status failed (not no_data) when the pipeline throws', async () => {
    mockEnrich.mockRejectedValue(new Error('network down'));
    const res = await request(app).post('/api/communities/1/self-heal').send({});
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Self-heal enrichment failed');
    const setCalls = mockSet.mock.calls.map((c: any[]) => c[0]);
    // No attempts increment on a thrown (transient) error.
    expect(setCalls.some((s: any) => s.enrichmentStatus === 'no_data')).toBe(false);
    expect(setCalls.some((s: any) => 'enrichmentAttempts' in s)).toBe(false);
    expect(setCalls.some((s: any) => s.enrichmentStatus === 'failed')).toBe(true);
  });

  // ── Admin route is untouched ───────────────────────────────────────────────

  it('does NOT register the admin perplexity-enrich route', async () => {
    const res = await request(app)
      .post('/api/admin/communities/1/perplexity-enrich')
      .send({});
    // registerCommunityRoutes owns only the public routes; the admin route lives
    // in a separate router and must NOT be reachable here.
    expect(res.status).toBe(404);
    expect(mockEnrich).not.toHaveBeenCalled();
  });
});
