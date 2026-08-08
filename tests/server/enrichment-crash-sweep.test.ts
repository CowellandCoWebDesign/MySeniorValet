/**
 * @jest-environment node
 *
 * Integration test for sweepStaleInProgressEnrichments (crash-recovery
 * protection #1 from the enrichment resilience work).
 *
 * Runs against the REAL dev database (the sweep is a single raw-SQL UPDATE on
 * purpose — communities has known Drizzle column drift — so mocking db.execute
 * would only assert the SQL text, not its semantics). Temp rows are inserted
 * with a unique test marker and removed in afterAll.
 *
 * Semantics locked in:
 *   - stale (>5 min) in_progress rows with attempts=0 → status 'failed' AND
 *     last_enrichment_attempt cleared (next visit re-enriches immediately)
 *   - stale in_progress rows with attempts>0 → status 'failed' but the
 *     timestamp is KEPT (24h→7d→30d self-heal backoff stays intact)
 *   - attempts are NEVER incremented (a crash is not a "no data" run)
 *   - fresh (<5 min) in_progress rows are untouched (a live run is not swept)
 *   - in_progress rows with NULL last_enrichment_attempt are swept
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

// The orchestrator module pulls in the whole enrichment pipeline; stub the
// heavy service imports so loading it for the sweep needs no network SDKs.
jest.mock('../../server/services/free-enrichment-service', () => ({
  enrichCommunityFree: jest.fn(),
  scrapeWebsitePage: jest.fn(),
  searchDuckDuckGo: jest.fn(),
  textReferencesCommunity: jest.fn(() => false),
}));
jest.mock('../../server/services/perplexity-search-api', () => ({
  perplexitySearchAPI: { deepEnrichCommunity: jest.fn() },
  isSeniorLivingDirectoryHost: jest.fn(() => false),
}));
jest.mock('../../server/services/community-photo-enrichment', () => ({
  CommunityPhotoEnrichment: {
    filterPhotosForCommunity: (p: string[]) => p,
    isStockOrPlaceholderPhoto: () => false,
    photoBelongsToDifferentCommunity: () => false,
    cleanPhotoArray: (p: string[]) => p,
  },
}));
jest.mock('../../server/nominatim-geocoding', () => ({
  geocodeWithNominatim: jest.fn(),
}));

import { db, pool } from '../../server/db';
import { sql } from 'drizzle-orm';
import { sweepStaleInProgressEnrichments } from '../../server/services/community-enrichment-orchestrator';

const MARKER = `ZZ_SWEEP_TEST_${Date.now()}`;

interface Seed {
  key: string;
  status: string;
  attempts: number;
  /** minutes ago; null = NULL last_enrichment_attempt */
  lastAttemptMinAgo: number | null;
}

const seeds: Seed[] = [
  // stale + never genuinely failed → swept, timestamp cleared
  { key: 'stale-attempts0', status: 'in_progress', attempts: 0, lastAttemptMinAgo: 10 },
  // stale + prior real failures → swept, timestamp KEPT (backoff intact)
  { key: 'stale-attempts2', status: 'in_progress', attempts: 2, lastAttemptMinAgo: 10 },
  // fresh in-flight run → untouched
  { key: 'fresh-attempts1', status: 'in_progress', attempts: 1, lastAttemptMinAgo: 1 },
  // stranded with NULL timestamp → swept
  { key: 'null-ts-attempts0', status: 'in_progress', attempts: 0, lastAttemptMinAgo: null },
];

const ids = new Map<string, number>();

async function fetchRow(id: number) {
  const res: any = await db.execute(sql`
    SELECT enrichment_status, enrichment_attempts, last_enrichment_attempt
    FROM communities WHERE id = ${id}
  `);
  return (res.rows ?? res)[0];
}

beforeAll(async () => {
  for (const s of seeds) {
    const res: any = await db.execute(sql`
      INSERT INTO communities
        (name, address, city, state, zip_code, care_types, is_hidden,
         enrichment_status, enrichment_attempts, last_enrichment_attempt)
      VALUES
        (${`${MARKER} ${s.key}`}, '1 Test St', 'Testville', 'ZZ', '00000',
         ARRAY[]::text[], true,
         ${s.status}, ${s.attempts},
         CASE WHEN ${s.lastAttemptMinAgo}::int IS NULL THEN NULL
              ELSE NOW() - (${s.lastAttemptMinAgo}::int * INTERVAL '1 minute') END)
      RETURNING id
    `);
    ids.set(s.key, (res.rows ?? res)[0].id);
  }
}, 60000);

afterAll(async () => {
  await db.execute(sql`DELETE FROM communities WHERE name LIKE ${`${MARKER}%`}`);
  await pool.end();
}, 60000);

describe('sweepStaleInProgressEnrichments', () => {
  it('sweeps stranded rows per the documented semantics', async () => {
    const swept = await sweepStaleInProgressEnrichments(5);
    // Other stranded rows may exist in the dev DB; we own at least 3 of them.
    expect(swept).toBeGreaterThanOrEqual(3);

    // attempts=0, stale → failed + timestamp CLEARED (immediate re-enrich)
    const a0 = await fetchRow(ids.get('stale-attempts0')!);
    expect(a0.enrichment_status).toBe('failed');
    expect(a0.last_enrichment_attempt).toBeNull();
    expect(Number(a0.enrichment_attempts)).toBe(0); // never incremented

    // attempts>0, stale → failed + timestamp KEPT (backoff intact)
    const a2 = await fetchRow(ids.get('stale-attempts2')!);
    expect(a2.enrichment_status).toBe('failed');
    expect(a2.last_enrichment_attempt).not.toBeNull();
    expect(Number(a2.enrichment_attempts)).toBe(2); // never incremented

    // fresh (<5 min) → untouched: still in_progress, timestamp kept
    const fresh = await fetchRow(ids.get('fresh-attempts1')!);
    expect(fresh.enrichment_status).toBe('in_progress');
    expect(fresh.last_enrichment_attempt).not.toBeNull();
    expect(Number(fresh.enrichment_attempts)).toBe(1);

    // NULL timestamp → swept (it cannot be "fresh")
    const nul = await fetchRow(ids.get('null-ts-attempts0')!);
    expect(nul.enrichment_status).toBe('failed');
    expect(nul.last_enrichment_attempt).toBeNull();
  }, 60000);

  it('is idempotent: a second sweep leaves already-swept rows failed', async () => {
    await sweepStaleInProgressEnrichments(5);
    const a2 = await fetchRow(ids.get('stale-attempts2')!);
    expect(a2.enrichment_status).toBe('failed');
    expect(a2.last_enrichment_attempt).not.toBeNull();
    expect(Number(a2.enrichment_attempts)).toBe(2);
  }, 60000);
});
