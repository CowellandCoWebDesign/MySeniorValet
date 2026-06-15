/**
 * @jest-environment node
 *
 * Tests for the three admin bulk-hide route handlers:
 *   POST /api/admin/communities/bulk
 *   POST /api/admin/communities/bulk-quality-action
 *   POST /api/admin/listing-flags/bulk
 *
 * Verifies that superclusterService.refresh() is called after hide/delete
 * operations and NOT called for actions that don't alter map visibility
 * (e.g. verify, clear-flags, dismiss, confirm).
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// --------------------------------------------------------------------------
// Mock every server module before the router is imported.
// jest.mock() calls are hoisted so they execute before any import statements.
// --------------------------------------------------------------------------

// Supercluster — the key assertion target
const mockRefresh = jest.fn().mockResolvedValue(undefined);
jest.mock('../../server/services/supercluster', () => ({
  superclusterService: { refresh: mockRefresh },
}));

// Caches
const mockInvalidateCache = jest.fn();
jest.mock('../../server/community-stats-cache', () => ({
  communityStatsCache: { invalidateCache: mockInvalidateCache },
}));

const mockClearAllCommunityCaches = jest.fn();
jest.mock('../../server/infrastructure/cache', () => ({
  clearAllCommunityCaches: mockClearAllCommunityCaches,
}));

// Auth middleware — pass every request through as an authenticated admin
jest.mock('../../server/auth-middleware', () => ({
  isAuthenticated: (_req: any, _res: any, next: any) => next(),
  isAdmin: (_req: any, _res: any, next: any) => next(),
  checkRole: () => (_req: any, _res: any, next: any) => next(),
}));

// DB — chainable mock whose .where() doubles as a Promise and exposes .returning()
const mockReturning = jest.fn();
const mockWhere = jest.fn();
const mockSet = jest.fn();
const mockUpdate = jest.fn();
const mockExecute = jest.fn();

function buildWhere(resolved: any) {
  // An object that is thenable (so `await .where()` works) AND has .returning()
  return {
    then: (res: any, rej: any) => Promise.resolve(resolved).then(res, rej),
    catch: (rej: any) => Promise.resolve(resolved).catch(rej),
    returning: mockReturning,
  };
}

mockReturning.mockResolvedValue([{ communityId: 1 }]);
mockWhere.mockImplementation(() => buildWhere([]));
mockSet.mockImplementation(() => ({ where: mockWhere }));
mockUpdate.mockReturnValue({ set: mockSet });
mockExecute.mockResolvedValue({ rowCount: 3 });

jest.mock('../../server/db', () => ({
  db: {
    update: (...args: any[]) => mockUpdate(...args),
    execute: (...args: any[]) => mockExecute(...args),
  },
}));

// Shared schema — Drizzle table objects; values are forwarded to mocked db only
jest.mock('../../shared/schema', () => {
  const t = (name: string) => ({ _: { name }, id: { name: 'id' } });
  return {
    communities: t('communities'),
    users: t('users'),
    auditLogs: t('auditLogs'),
    securityAuditLogs: t('securityAuditLogs'),
    communityDashboardStats: t('communityDashboardStats'),
    vendors: t('vendors'),
    communityClaims: t('communityClaims'),
    claimedCommunities: t('claimedCommunities'),
    featuredCommunities: t('featuredCommunities'),
    listingFlags: t('listingFlags'),
    homeSectionConfigs: t('homeSectionConfigs'),
    SECTION_TYPES: {},
  };
});

// drizzle-orm helpers — return their args unchanged (they're forwarded to mocked db)
jest.mock('drizzle-orm', () => ({
  eq: (...a: any[]) => a,
  desc: (...a: any[]) => a,
  asc: (...a: any[]) => a,
  and: (...a: any[]) => a,
  or: (...a: any[]) => a,
  gte: (...a: any[]) => a,
  lte: (...a: any[]) => a,
  ilike: (...a: any[]) => a,
  inArray: (...a: any[]) => a,
  isNotNull: (...a: any[]) => a,
  sql: Object.assign((...a: any[]) => a, { raw: (...a: any[]) => a }),
}));

// Remaining service imports
jest.mock('../../server/services/data-integrity-validator', () => ({
  DataIntegrityValidator: jest.fn(() => ({})),
}));
jest.mock('../../server/services/batch-perplexity-verifier', () => ({
  batchVerifier: {},
}));
jest.mock('../../server/services/city-batch-verifier', () => ({
  cityBatchVerifier: {},
}));
jest.mock('../../server/services/perplexity-search-api', () => ({
  perplexitySearchAPI: {},
}));
jest.mock('../../server/services/free-enrichment-service', () => ({
  scrapeWebsitePage: jest.fn(),
}));
jest.mock('../../server/security-admin-endpoints', () => ({
  getSecurityDashboard: jest.fn(),
  getUserTrace: jest.fn(),
  blockIP: jest.fn(),
  unblockIP: jest.fn(),
  getSecurityEvents: jest.fn(),
  generateSecurityReport: jest.fn(),
}));
jest.mock('../../server/enhanced-platform-stats', () => ({
  enhancedPlatformStats: jest.fn(),
}));
jest.mock('../../server/storage', () => ({ storage: {} }));
jest.mock('multer', () => {
  const m: any = () => ({ single: () => (_: any, __: any, next: any) => next() });
  m.diskStorage = () => ({});
  return m;
});

// --------------------------------------------------------------------------
// Now import the router under test
// --------------------------------------------------------------------------
import request from 'supertest';
import express from 'express';
import { registerAdminRoutes } from '../../server/routes/adminRoutes';

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function buildApp() {
  const app = express();
  app.use(express.json());
  registerAdminRoutes(app);
  return app;
}

/** Tick the event loop so fire-and-forget .catch() chains resolve */
const tick = () => new Promise<void>(r => setTimeout(r, 10));

function resetMocks() {
  mockRefresh.mockClear();
  mockInvalidateCache.mockClear();
  mockClearAllCommunityCaches.mockClear();
  mockUpdate.mockClear();
  mockSet.mockClear();
  mockWhere.mockClear();
  mockReturning.mockClear();
  mockExecute.mockClear();

  // Re-attach implementations after clearing
  mockReturning.mockResolvedValue([{ communityId: 1 }]);
  mockWhere.mockImplementation(() => buildWhere([]));
  mockSet.mockImplementation(() => ({ where: mockWhere }));
  mockUpdate.mockReturnValue({ set: mockSet });
  mockExecute.mockResolvedValue({ rowCount: 3 });
}

// --------------------------------------------------------------------------
// POST /api/admin/communities/bulk
// --------------------------------------------------------------------------
describe('POST /api/admin/communities/bulk', () => {
  let app: express.Express;

  beforeEach(() => {
    resetMocks();
    app = buildApp();
  });

  it('calls superclusterService.refresh() when action is "hide"', async () => {
    const res = await request(app)
      .post('/api/admin/communities/bulk')
      .send({ ids: [1, 2, 3], action: 'hide' });

    await tick();
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it('calls superclusterService.refresh() when action is "delete"', async () => {
    const res = await request(app)
      .post('/api/admin/communities/bulk')
      .send({ ids: [4, 5], action: 'delete' });

    await tick();
    expect(res.status).toBe(200);
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it('does NOT call superclusterService.refresh() when action is "verify"', async () => {
    const res = await request(app)
      .post('/api/admin/communities/bulk')
      .send({ ids: [6], action: 'verify' });

    await tick();
    expect(res.status).toBe(200);
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('clears community caches for hide and delete', async () => {
    await request(app)
      .post('/api/admin/communities/bulk')
      .send({ ids: [1], action: 'hide' });

    await tick();
    expect(mockClearAllCommunityCaches).toHaveBeenCalled();
    expect(mockInvalidateCache).toHaveBeenCalled();
  });

  it('returns 400 when ids is not an array', async () => {
    const res = await request(app)
      .post('/api/admin/communities/bulk')
      .send({ ids: 'not-an-array', action: 'hide' });

    expect(res.status).toBe(400);
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('returns 400 for an unknown action', async () => {
    const res = await request(app)
      .post('/api/admin/communities/bulk')
      .send({ ids: [1], action: 'publish' });

    expect(res.status).toBe(400);
    expect(mockRefresh).not.toHaveBeenCalled();
  });
});

// --------------------------------------------------------------------------
// POST /api/admin/communities/bulk-quality-action
// --------------------------------------------------------------------------
describe('POST /api/admin/communities/bulk-quality-action', () => {
  let app: express.Express;

  beforeEach(() => {
    resetMocks();
    app = buildApp();
  });

  it('calls superclusterService.refresh() when action is "delete"', async () => {
    const res = await request(app)
      .post('/api/admin/communities/bulk-quality-action')
      .send({ ids: [1, 2], action: 'delete' });

    await tick();
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it('calls superclusterService.refresh() when action is "restore"', async () => {
    const res = await request(app)
      .post('/api/admin/communities/bulk-quality-action')
      .send({ ids: [3], action: 'restore' });

    await tick();
    expect(res.status).toBe(200);
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it('does NOT call superclusterService.refresh() when action is "clear-flags"', async () => {
    const res = await request(app)
      .post('/api/admin/communities/bulk-quality-action')
      .send({ ids: [4, 5], action: 'clear-flags' });

    await tick();
    expect(res.status).toBe(200);
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('returns 400 when ids array is empty', async () => {
    const res = await request(app)
      .post('/api/admin/communities/bulk-quality-action')
      .send({ ids: [], action: 'delete' });

    expect(res.status).toBe(400);
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('returns 400 for an unknown action', async () => {
    const res = await request(app)
      .post('/api/admin/communities/bulk-quality-action')
      .send({ ids: [1], action: 'archive' });

    expect(res.status).toBe(400);
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('returns 400 when more than 500 IDs are provided', async () => {
    const ids = Array.from({ length: 501 }, (_, i) => i + 1);
    const res = await request(app)
      .post('/api/admin/communities/bulk-quality-action')
      .send({ ids, action: 'delete' });

    expect(res.status).toBe(400);
    expect(mockRefresh).not.toHaveBeenCalled();
  });
});

// --------------------------------------------------------------------------
// POST /api/admin/listing-flags/bulk
// --------------------------------------------------------------------------
describe('POST /api/admin/listing-flags/bulk', () => {
  let app: express.Express;

  beforeEach(() => {
    resetMocks();
    app = buildApp();
  });

  it('calls superclusterService.refresh() when action is "confirm-and-hide"', async () => {
    const res = await request(app)
      .post('/api/admin/listing-flags/bulk')
      .send({ ids: [10, 11], action: 'confirm-and-hide' });

    await tick();
    expect(res.status).toBe(200);
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it('does NOT call superclusterService.refresh() when action is "dismiss"', async () => {
    const res = await request(app)
      .post('/api/admin/listing-flags/bulk')
      .send({ ids: [12], action: 'dismiss' });

    await tick();
    expect(res.status).toBe(200);
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('does NOT call superclusterService.refresh() when action is "confirm"', async () => {
    const res = await request(app)
      .post('/api/admin/listing-flags/bulk')
      .send({ ids: [13], action: 'confirm' });

    await tick();
    expect(res.status).toBe(200);
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('clears caches for confirm-and-hide', async () => {
    await request(app)
      .post('/api/admin/listing-flags/bulk')
      .send({ ids: [14], action: 'confirm-and-hide' });

    await tick();
    expect(mockClearAllCommunityCaches).toHaveBeenCalled();
    expect(mockInvalidateCache).toHaveBeenCalled();
  });

  it('does not clear caches for dismiss', async () => {
    await request(app)
      .post('/api/admin/listing-flags/bulk')
      .send({ ids: [15], action: 'dismiss' });

    await tick();
    expect(mockClearAllCommunityCaches).not.toHaveBeenCalled();
    expect(mockInvalidateCache).not.toHaveBeenCalled();
  });

  it('returns 400 when ids is empty', async () => {
    const res = await request(app)
      .post('/api/admin/listing-flags/bulk')
      .send({ ids: [], action: 'dismiss' });

    expect(res.status).toBe(400);
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('returns 400 for an unknown action', async () => {
    const res = await request(app)
      .post('/api/admin/listing-flags/bulk')
      .send({ ids: [1], action: 'approve' });

    expect(res.status).toBe(400);
    expect(mockRefresh).not.toHaveBeenCalled();
  });
});
