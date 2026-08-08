/**
 * @jest-environment node
 *
 * Unit tests for crash-recovery protection #3: a failing FINAL db.update in
 * the unified enrichment pipeline must surface `EnrichmentPersistError` and
 * must NEVER resolve with contentSaved=true — the client must keep its honest
 * placeholder instead of displaying phantom "completed" data the DB rejected.
 *
 * The pipeline's DB module and network services are mocked; a control case
 * with a working DB proves the same run WOULD have returned contentSaved=true,
 * so the failure case genuinely exercises the persist block.
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// --------------------------------------------------------------------------
// Mocks (hoisted above imports).
// --------------------------------------------------------------------------

// DB — select().from().where().limit() resolves a community row;
// update().set().where() behavior is configurable per test.
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
    execute: jest.fn(() => Promise.resolve({ rows: [] })),
  },
}));

// Perplexity (Stage 1) — fails so the pipeline falls back to free scraping.
jest.mock('../../server/services/perplexity-search-api', () => ({
  perplexitySearchAPI: {
    deepEnrichCommunity: jest.fn(() => Promise.reject(new Error('mock: no perplexity'))),
  },
  isSeniorLivingDirectoryHost: () => false,
}));

// Free enrichment (Stage 2) — returns a meaningful description + phone so the
// run has real content to persist (contentWasSaved=true path).
const LONG_DESCRIPTION =
  'Sunrise Test Manor is a warm assisted living community in Testville offering ' +
  'personalized care plans, chef-prepared meals, daily activities, and a dedicated ' +
  'memory care neighborhood with 24/7 licensed nursing staff on site for residents.';
jest.mock('../../server/services/free-enrichment-service', () => ({
  enrichCommunityFree: jest.fn(() =>
    Promise.resolve({
      about: LONG_DESCRIPTION,
      sourceUrl: null,
      website: null,
      phone: '(555) 010-2030',
      photos: [],
      careTypes: [],
      amenities: [],
      pricingContext: '',
      sourceType: 'scrape',
    }),
  ),
  scrapeWebsitePage: jest.fn(() => Promise.resolve({ images: [], text: '' })),
  searchDuckDuckGo: jest.fn(() => Promise.resolve({ website: null, results: [] })),
  textReferencesCommunity: jest.fn(() => false),
}));

// Photo pipeline statics — pass-through, no photos discovered.
jest.mock('../../server/services/community-photo-enrichment', () => ({
  CommunityPhotoEnrichment: {
    filterPhotosForCommunity: (p: string[]) => p,
    isStockOrPlaceholderPhoto: () => false,
    photoBelongsToDifferentCommunity: () => false,
    cleanPhotoArray: (p: string[]) => p,
  },
}));

jest.mock('../../server/nominatim-geocoding', () => ({
  geocodeWithNominatim: jest.fn(() => Promise.resolve(null)),
}));

// Prose parser — no structured facts (keeps the run focused on the persist block).
jest.mock('../../server/services/perplexity-prose-parser', () => ({
  parsePerplexityProse: () => ({
    capacity: null,
    unitTypes: [],
    pricingEntries: [],
    availability: null,
    phone: null,
    website: null,
    priceRange: null,
  }),
  normalizeAvailabilityStatus: () => null,
}));

// Visibility recompute (dynamic import after a successful persist) — stubbed.
jest.mock('../../server/services/community-visibility', () => ({
  recomputeCommunityVisibility: jest.fn(() => Promise.resolve(null)),
}));

import {
  enrichCommunityUnified,
  EnrichmentPersistError,
} from '../../server/services/community-enrichment-orchestrator';

// --------------------------------------------------------------------------

const baseCommunity = () => ({
  id: 4242,
  name: 'Sunrise Test Manor',
  address: '1 Test St',
  city: 'Testville',
  state: 'ZZ',
  description: null, // sparse → no cache hit, description upgrade fires
  phone: null,
  website: null,
  websiteProtected: false,
  photos: [],
  photoAttributions: [],
  enrichmentStatus: 'in_progress',
  enrichmentData: {},
  lastSuccessfulEnrichment: null,
  lastPhotoEnrichment: new Date('2026-01-01'), // honest no-photos state, no trap
  totalUnits: null,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockLimit.mockResolvedValue([baseCommunity()]);
});

describe('final persist failure → EnrichmentPersistError', () => {
  it('control: with a working DB the same run resolves contentSaved=true', async () => {
    mockUpdateWhere.mockResolvedValue(undefined as any);
    const result = await enrichCommunityUnified(4242);
    expect(result.contentSaved).toBe(true);
    expect(result.summary).toBe(LONG_DESCRIPTION);
    // At least the early persist + final persist ran.
    expect(mockUpdate).toHaveBeenCalled();
  });

  it('throws EnrichmentPersistError when the final db.update is rejected — never resolves contentSaved=true', async () => {
    // Every update write fails (early persist is non-fatal by design; the
    // final write must surface the typed error).
    mockUpdateWhere.mockRejectedValue(new Error('23514 check constraint violation'));

    let resolved: any = null;
    let thrown: any = null;
    try {
      resolved = await enrichCommunityUnified(4242);
    } catch (e) {
      thrown = e;
    }

    // The run must reject — it must NOT resolve (and especially not with
    // contentSaved=true) when the DB never accepted the data.
    expect(resolved).toBeNull();
    expect(thrown).toBeInstanceOf(EnrichmentPersistError);
    expect(thrown.name).toBe('EnrichmentPersistError');
    expect(String(thrown.message)).toContain('4242');
    // The original DB error is preserved for logging/diagnosis.
    expect(String((thrown as EnrichmentPersistError).cause)).toContain('23514');
  });

  it("attempts to revert enrichment_status to 'failed' (never phantom 'completed') on persist failure", async () => {
    mockUpdateWhere.mockRejectedValue(new Error('write rejected'));
    await expect(enrichCommunityUnified(4242)).rejects.toThrow(EnrichmentPersistError);

    // The final write legitimately ATTEMPTS status 'completed' — but it was
    // rejected. The invariant: after the rejection there is a best-effort
    // revert, so the LAST status write must be 'failed', never 'completed'.
    const statusWrites = mockSet.mock.calls
      .map((c: any[]) => c[0]?.enrichmentStatus)
      .filter((s: any) => s !== undefined);
    expect(statusWrites.length).toBeGreaterThan(0);
    expect(statusWrites[statusWrites.length - 1]).toBe('failed');
  });
});
