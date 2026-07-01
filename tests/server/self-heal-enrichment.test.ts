/**
 * @jest-environment node
 *
 * Unit tests for the shared self-heal enrichment runner used by BOTH the public
 * /self-heal route and the batched hidden-community restore pass.
 *
 * The route test (community-self-heal-route.test.ts) already locks in the gating
 * via the HTTP layer; these tests target the runner's batch-specific additions:
 *   - the `restored` flag (is_hidden flipped false after a successful run)
 *   - recomputeVisibilityOnSkip: restoring a content-complete-but-hidden record
 *     for free (no enrichment) when a gate-1 skip occurs
 *   - structured skip reasons (machine-readable)
 *
 * enrichCommunityUnified, recomputeCommunityVisibility, and the DB are mocked so
 * no live web/API/DB calls are made.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockEnrich = jest.fn();
jest.mock('../../server/services/community-enrichment-orchestrator', () => ({
  enrichCommunityUnified: (...a: any[]) => mockEnrich(...a),
}));

const mockRecompute = jest.fn();
jest.mock('../../server/services/community-visibility', () => ({
  recomputeCommunityVisibility: (...a: any[]) => mockRecompute(...a),
}));

// DB mock: select().from().where().limit() resolves a queued row; update chain no-ops.
const selectQueue: any[][] = [];
const mockLimit = jest.fn(() => Promise.resolve(selectQueue.shift() ?? []));
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

jest.mock('../../shared/schema', () => ({
  communities: { id: { name: 'id' } },
}));
jest.mock('drizzle-orm', () => ({ eq: (...a: any[]) => a }));

import { runSelfHealEnrichment } from '../../server/services/self-heal-enrichment';

function row(overrides: Record<string, any> = {}) {
  return {
    id: 1,
    name: 'Sunrise Villa',
    description: '',
    photos: [],
    isHidden: true,
    enrichmentStatus: 'pending',
    enrichmentAttempts: 0,
    lastEnrichmentAttempt: null,
    ...overrides,
  };
}
function enrichResult(overrides: Record<string, any> = {}) {
  return {
    cached: false,
    contentSaved: true,
    photos: ['https://cdn.example.com/a.jpg'],
    summary: 'x'.repeat(120),
    phone: '555',
    officialWebsite: 'https://x.com',
    careTypes: [],
    ...overrides,
  };
}

beforeEach(() => {
  mockEnrich.mockReset();
  mockRecompute.mockReset();
  selectQueue.length = 0;
  mockLimit.mockClear();
  mockUpdate.mockClear();
  mockSet.mockClear();
});

describe('runSelfHealEnrichment', () => {
  it('reports restored=true when a hidden community is un-hidden after enrichment', async () => {
    selectQueue.push([row({ isHidden: true })]); // initial load
    selectQueue.push([{ isHidden: false }]); // post-enrichment visibility read
    mockEnrich.mockResolvedValue(enrichResult());

    const res = await runSelfHealEnrichment(1);
    expect(res.skipped).toBe(false);
    expect(res.foundData).toBe(true);
    expect(res.restored).toBe(true);
    expect(res.visible).toBe(true);
  });

  it('reports restored=false when the community stays hidden after enrichment', async () => {
    selectQueue.push([row({ isHidden: true })]);
    selectQueue.push([{ isHidden: true }]); // still hidden
    mockEnrich.mockResolvedValue(enrichResult({ contentSaved: false, cached: false }));

    const res = await runSelfHealEnrichment(1);
    expect(res.skipped).toBe(false);
    expect(res.foundData).toBe(false);
    expect(res.restored).toBe(false);
  });

  it('restores a content-complete-but-hidden record for free on skip (no enrichment)', async () => {
    selectQueue.push([
      row({ isHidden: true, photos: ['https://cdn.example.com/a.jpg'], description: 'y'.repeat(150) }),
    ]);
    mockRecompute.mockResolvedValue({ hidden: false });

    const res = await runSelfHealEnrichment(1, { recomputeVisibilityOnSkip: true });
    expect(res.skipped).toBe(true);
    expect(res.reason).toBe('already_has_content');
    expect(res.restored).toBe(true);
    expect(res.visible).toBe(true);
    expect(mockEnrich).not.toHaveBeenCalled();
    expect(mockRecompute).toHaveBeenCalledWith(1);
  });

  it('does NOT recompute on a content-complete skip when the option is off', async () => {
    selectQueue.push([
      row({ isHidden: true, photos: ['https://cdn.example.com/a.jpg'], description: 'y'.repeat(150) }),
    ]);
    const res = await runSelfHealEnrichment(1);
    expect(res.skipped).toBe(true);
    expect(res.reason).toBe('already_has_content');
    expect(mockRecompute).not.toHaveBeenCalled();
  });

  it('returns reason no_data_terminal for a terminal community', async () => {
    selectQueue.push([row({ enrichmentStatus: 'no_data' })]);
    const res = await runSelfHealEnrichment(1);
    expect(res).toMatchObject({ skipped: true, reason: 'no_data_terminal' });
    expect(mockEnrich).not.toHaveBeenCalled();
  });

  it('returns reason rate_limited with cooldown for a recent failed attempt', async () => {
    selectQueue.push([
      row({
        enrichmentStatus: 'failed',
        enrichmentAttempts: 2,
        lastEnrichmentAttempt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1d ago, under 7d
      }),
    ]);
    const res = await runSelfHealEnrichment(1);
    expect(res.skipped).toBe(true);
    expect(res.reason).toBe('rate_limited');
    expect(res.retryAfterHours).toBe(24 * 7);
    expect(res.consecutiveNoDataAttempts).toBe(2);
  });

  it('force=true bypasses the terminal gate and calls enrichment with forceRefresh', async () => {
    selectQueue.push([row({ enrichmentStatus: 'no_data', enrichmentAttempts: 9, isHidden: true })]);
    selectQueue.push([{ isHidden: false }]);
    mockEnrich.mockResolvedValue(enrichResult());

    const res = await runSelfHealEnrichment(1, { force: true });
    expect(res.skipped).toBe(false);
    expect(mockEnrich).toHaveBeenCalledWith(1, { forceRefresh: true });
  });

  it('preferFree forwards { preferFree: true } to the unified pipeline (free-first)', async () => {
    selectQueue.push([row({ isHidden: true })]);
    selectQueue.push([{ isHidden: false }]);
    mockEnrich.mockResolvedValue(enrichResult());

    const res = await runSelfHealEnrichment(1, { preferFree: true });
    expect(res.skipped).toBe(false);
    expect(mockEnrich).toHaveBeenCalledWith(1, { preferFree: true });
  });

  it('default (no options) calls enrichment single-arg — Perplexity-first path preserved', async () => {
    selectQueue.push([row({ isHidden: false })]);
    selectQueue.push([{ isHidden: false }]);
    mockEnrich.mockResolvedValue(enrichResult());

    await runSelfHealEnrichment(1);
    expect(mockEnrich).toHaveBeenCalledWith(1);
  });

  it('returns not_found for a missing community', async () => {
    selectQueue.push([]);
    const res = await runSelfHealEnrichment(1);
    expect(res).toEqual({ communityId: 1, skipped: true, reason: 'not_found' });
  });
});
