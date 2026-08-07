/** @jest-environment node */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockEnrich = jest.fn();
jest.mock('../../server/services/community-enrichment-orchestrator', () => {
  class EnrichmentPersistError extends Error {}
  return {
    enrichCommunityUnified: (...args: any[]) => mockEnrich(...args),
    EnrichmentPersistError,
  };
});

const mockLimit = jest.fn();
const mockSelectWhere = jest.fn(() => ({ limit: mockLimit }));
const mockFrom = jest.fn(() => ({ where: mockSelectWhere }));
const mockSelect = jest.fn(() => ({ from: mockFrom }));
const mockUpdateWhere = jest.fn(() => Promise.resolve());
const mockReturning = jest.fn(() => Promise.resolve([{ id: 1 }]));
const mockSet = jest.fn(() => ({
  where: (...args: any[]) => {
    mockUpdateWhere(...args);
    return { returning: (...returningArgs: any[]) => mockReturning(...returningArgs) };
  },
}));
const mockUpdate = jest.fn(() => ({ set: mockSet }));
jest.mock('../../server/db', () => ({
  db: {
    select: (...args: any[]) => mockSelect(...args),
    update: (...args: any[]) => mockUpdate(...args),
  },
}));

jest.mock('../../shared/schema', () => {
  const column = (name: string) => ({ name });
  const communities = new Proxy({ id: column('id') }, {
    get: (target, prop: string) => (target as any)[prop] || column(prop),
  });
  const table = (name: string) => ({ _: { name }, id: column('id') });
  return {
    communities,
    reviews: table('reviews'),
    communityClaims: table('communityClaims'),
    claimedCommunities: table('claimedCommunities'),
    pendingCommunities: table('pendingCommunities'),
    auditLogs: table('auditLogs'),
    featuredCommunities: table('featuredCommunities'),
    searchHistory: table('searchHistory'),
    analyticsEvents: table('analyticsEvents'),
    vendors: table('vendors'),
    insertCommunitySchema: { parse: (value: any) => value },
    insertListingFlagSchema: { parse: (value: any) => value },
  };
});

jest.mock('drizzle-orm', () => ({
  eq: (...args: any[]) => args, and: (...args: any[]) => args, or: (...args: any[]) => args,
  desc: (...args: any[]) => args, inArray: (...args: any[]) => args,
  sql: Object.assign((...args: any[]) => args, { raw: (...args: any[]) => args }),
  between: (...args: any[]) => args, gte: (...args: any[]) => args,
  lte: (...args: any[]) => args, isNotNull: (...args: any[]) => args,
  isNull: (...args: any[]) => args, not: (...args: any[]) => args,
}));
jest.mock('../../server/auth-middleware', () => ({
  isAuthenticated: (_req: any, _res: any, next: any) => next(),
  isAdmin: (_req: any, _res: any, next: any) => next(),
  checkRole: () => (_req: any, _res: any, next: any) => next(),
}));
jest.mock('../../server/services/community-identity', () => ({
  isIdentitySuspectFlagged: (flags: string[]) => (flags || []).includes('identity_suspect'),
}));
jest.mock('../../server/services/community-photo-enrichment', () => ({
  CommunityPhotoEnrichment: {
    isStockOrPlaceholderPhoto: () => false,
    filterPhotosForCommunity: (photos: string[]) => photos || [],
  },
}));
jest.mock('../../server/utils/generate-slug', () => ({ generateCommunitySlug: () => 'slug', generateSlug: () => 'slug' }));
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
jest.mock('../../server/utils/photo-urls', () => ({ normalizePhotoUrls: (value: any) => value }));
const mockConsumeRateLimit = jest.fn();
jest.mock('../../server/services/profile-refresh-rate-limit', () => ({
  consumeProfileRefreshRateLimit: (...args: any[]) => mockConsumeRateLimit(...args),
}));

import express from 'express';
import request from 'supertest';
import { registerCommunityRoutes } from '../../server/routes/communityRoutes';

const richDescription =
  'Sunrise Villa in La Jolla provides assisted living and memory care in studio apartments. Residents enjoy chef-prepared dining, daily activities, landscaped gardens, transportation, housekeeping, and medication support from an on-site care team.';

function community(overrides: Record<string, any> = {}) {
  return {
    id: 1, name: 'Sunrise Villa', city: 'La Jolla', description: 'Short overview',
    amenities: [], services: [], phone: '555-1234', website: 'https://sunrise.example',
    priceRange: null, availabilityStatus: null, lastSuccessfulEnrichment: new Date('2025-11-08'),
    enrichmentStatus: 'completed', lastEnrichmentAttempt: null, dataQualityFlags: [],
    isHidden: false, isActive: true,
    ...overrides,
  };
}

describe('POST /api/communities/:id/profile-refresh', () => {
  let app: express.Express;
  beforeEach(() => {
    jest.clearAllMocks();
    mockLimit.mockResolvedValue([community()]);
    mockUpdateWhere.mockResolvedValue(undefined as never);
    mockReturning.mockResolvedValue([{ id: 1 }] as never);
    mockConsumeRateLimit.mockResolvedValue({ allowed: true, remaining: 4, retryAfterSeconds: 0 } as never);
    mockEnrich.mockResolvedValue({
      contentSaved: true,
      improvedSections: ['overview', 'amenities'],
    });
    app = express();
    app.use(express.json());
    registerCommunityRoutes(app);
  });

  it('runs the unified family-safe mode and reports improved sections', async () => {
    const response = await request(app).post('/api/communities/1/profile-refresh').send({});
    expect(response.status).toBe(200);
    expect(mockEnrich).toHaveBeenCalledWith(1, { familyRefresh: true });
    expect(response.body).toMatchObject({
      success: true,
      skipped: false,
      updated: true,
      improvedSections: ['overview', 'amenities'],
    });
    expect(mockSet.mock.calls[0][0]).toMatchObject({ enrichmentStatus: 'in_progress' });
  });

  it.each([
    { isHidden: true },
    { isActive: false },
    { isActive: null },
  ])('rejects hidden or inactive records before rate limiting or enrichment: %s', async (visibility) => {
    mockLimit.mockResolvedValue([community(visibility)]);
    const response = await request(app).post('/api/communities/1/profile-refresh').send({});
    expect(response.status).toBe(404);
    expect(mockConsumeRateLimit).not.toHaveBeenCalled();
    expect(mockEnrich).not.toHaveBeenCalled();
  });

  it('enforces a caller-level cost guard', async () => {
    mockConsumeRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 60,
    });
    const response = await request(app).post('/api/communities/1/profile-refresh').send({});
    expect(response.status).toBe(429);
    expect(mockEnrich).not.toHaveBeenCalled();
  });

  it('does not enrich when another process wins the atomic claim', async () => {
    mockReturning.mockResolvedValue([] as never);
    const response = await request(app).post('/api/communities/1/profile-refresh').send({});
    expect(response.body).toMatchObject({ skipped: true, reason: 'enrichment in progress' });
    expect(mockEnrich).not.toHaveBeenCalled();
  });

  it('skips a complete, current profile without spending on enrichment', async () => {
    mockLimit.mockResolvedValue([community({
      description: richDescription,
      amenities: ['Garden'],
      services: ['Transportation'],
      priceRange: { min: 3000, max: 5000 },
      availabilityStatus: 'available',
      lastSuccessfulEnrichment: new Date(),
    })]);
    const response = await request(app).post('/api/communities/1/profile-refresh').send({});
    expect(response.body).toMatchObject({ skipped: true, reason: 'profile is already complete' });
    expect(mockEnrich).not.toHaveBeenCalled();
  });

  it.each([
    [{ enrichmentStatus: 'no_data' }, 'no data found (terminal)'],
    [{ dataQualityFlags: ['identity_suspect'] }, 'identity suspect (awaiting admin review)'],
    [{ lastEnrichmentAttempt: new Date(Date.now() - 2 * 60 * 60 * 1000) }, 'rate limited'],
    [{ enrichmentStatus: 'in_progress' }, 'enrichment in progress'],
  ])('honors terminal and cooldown gates: %s', async (overrides, reason) => {
    mockLimit.mockResolvedValue([community(overrides)]);
    const response = await request(app).post('/api/communities/1/profile-refresh').send({});
    expect(response.body).toMatchObject({ skipped: true, reason });
    expect(mockEnrich).not.toHaveBeenCalled();
  });

  it('reports an honest no-new-data result', async () => {
    mockEnrich.mockResolvedValue({ contentSaved: false, improvedSections: [] });
    const response = await request(app).post('/api/communities/1/profile-refresh').send({});
    expect(response.body).toMatchObject({ success: true, updated: false, improvedSections: [] });
  });
});