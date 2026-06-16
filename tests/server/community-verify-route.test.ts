/**
 * @jest-environment node
 *
 * Smoke test for the public Refresh endpoint:
 *   POST /api/communities/:id/verify
 *
 * Verifies that the route delegates to the single unified enrichment pipeline
 * (`enrichCommunityUnified`) and maps its result to the verification-report
 * response shape the frontend expects — for both the cached and freshly
 * enriched paths — plus the 400 / 404 guards.
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

// DB — chainable select().from().where().limit() resolving to a community row.
const mockLimit = jest.fn();
const mockWhere = jest.fn(() => ({ limit: mockLimit }));
const mockFrom = jest.fn(() => ({ where: mockWhere }));
const mockSelect = jest.fn(() => ({ from: mockFrom }));
jest.mock('../../server/db', () => ({
  db: { select: (...a: any[]) => mockSelect(...a) },
}));

// Shared schema — table + insert-schema stubs (none are exercised by /verify).
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

// Auth — let every request through.
jest.mock('../../server/auth-middleware', () => ({
  isAuthenticated: (_req: any, _res: any, next: any) => next(),
  isAdmin: (_req: any, _res: any, next: any) => next(),
  checkRole: () => (_req: any, _res: any, next: any) => next(),
}));

// Remaining service imports — stubbed; not exercised by /verify.
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

function baseResult(overrides: Record<string, any> = {}) {
  return {
    communityId: 1,
    communityName: 'Sunrise Villa',
    cached: false,
    lastUpdated: '2026-06-16T00:00:00.000Z',
    verificationStatus: 'verified',
    confidence: 88,
    summary: 'A lovely assisted living community.',
    officialWebsite: 'https://sunrisevilla.com',
    phone: '555-123-4567',
    pricingContext: '$3,000–$4,500/mo',
    pricing: { min: 3000, max: 4500 },
    managementCompany: 'Sunrise Group',
    availability: 'Available',
    photos: ['https://cdn.example.com/a.jpg', 'https://cdn.example.com/b.jpg'],
    photoAttributions: ['sunrisevilla.com', 'caring.com'],
    careTypes: ['assisted living'],
    amenities: ['pool'],
    sources: ['https://sunrisevilla.com'],
    enrichmentData: { foo: 'bar' },
    ...overrides,
  };
}

describe('POST /api/communities/:id/verify', () => {
  let app: express.Express;

  beforeEach(() => {
    mockEnrich.mockReset();
    mockLimit.mockReset();
    mockLimit.mockResolvedValue([{ id: 1, name: 'Sunrise Villa' }]);
    app = buildApp();
  });

  it('returns 400 for a non-numeric community id', async () => {
    const res = await request(app).post('/api/communities/abc/verify').send({});
    expect(res.status).toBe(400);
    expect(mockEnrich).not.toHaveBeenCalled();
  });

  it('returns 404 when the community does not exist', async () => {
    mockLimit.mockResolvedValue([]);
    const res = await request(app).post('/api/communities/999/verify').send({});
    expect(res.status).toBe(404);
    expect(mockEnrich).not.toHaveBeenCalled();
  });

  it('delegates to the unified pipeline and maps a fresh result', async () => {
    mockEnrich.mockResolvedValue(baseResult());
    const res = await request(app)
      .post('/api/communities/1/verify')
      .send({ forceRefresh: true });

    expect(res.status).toBe(200);
    // Delegated to the single pipeline with the parsed options.
    expect(mockEnrich).toHaveBeenCalledWith(1, { forceRefresh: true, websiteUrl: undefined });

    // Mapped into the verification-report shape the frontend reads.
    expect(res.body.communityId).toBe(1);
    expect(res.body.cached).toBeUndefined();
    expect(res.body.verificationResults.webIntelligence.images).toEqual([
      'https://cdn.example.com/a.jpg',
      'https://cdn.example.com/b.jpg',
    ]);
    expect(res.body.verificationResults.webIntelligence.imageAttributions).toEqual([
      'sunrisevilla.com',
      'caring.com',
    ]);
    expect(res.body.contactInfo).toEqual({
      phone: '555-123-4567',
      website: 'https://sunrisevilla.com',
    });
    expect(res.body.pricing).toBe('$3,000–$4,500/mo');
    expect(res.body.consensus.confidenceScore).toBe(88);
  });

  it('returns the cached shape without re-running enrichment', async () => {
    mockEnrich.mockResolvedValue(baseResult({ cached: true, pricingContext: '' }));
    const res = await request(app).post('/api/communities/1/verify').send({});

    expect(res.status).toBe(200);
    expect(res.body.cached).toBe(true);
    expect(res.body.consensus.transparencyNotes).toBe('Served from cached enrichment data');
    expect(res.body.contactInfo.phone).toBe('555-123-4567');
  });
});
