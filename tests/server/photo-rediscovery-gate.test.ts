/**
 * Photo re-enrichment trap regression tests (Task: fix communities stuck with
 * zero photos).
 *
 * Covers:
 *  1. `communityNeedsPhotoRediscovery` — the pure photo-aware cache-gate
 *     detector: a community whose stored photos are ALL filtered at serve time
 *     is trapped and must bypass the no-expiry cache; a confirmed no-photos
 *     state (empty set + completed photo pass) is honest and stays cached.
 *  2. `sanitizeWebsiteUrl` — read-side sanitation of corrupted stored websites
 *     (markdown wrappers, missing protocol, citation markers, junk) so forced
 *     refresh / official-site scraping is never blocked by a corrupted value.
 */
import { describe, it, expect } from '@jest/globals';

// The orchestrator imports `../db` (eager Neon pool → throws without
// DATABASE_URL) and services that pull in cheerio (ESM-only). The functions
// under test are pure, so stub those modules.
jest.mock('../../server/db', () => ({ db: {}, pool: {} }));
jest.mock('cheerio', () => ({}));

import { communityNeedsPhotoRediscovery } from '../../server/services/community-enrichment-orchestrator';
import { sanitizeWebsiteUrl } from '../../server/utils/website-url';

describe('communityNeedsPhotoRediscovery (photo-aware cache gate)', () => {
  const base = {
    name: 'Hilltop Springs Senior Living',
    city: 'Redding',
    website: 'https://www.hilltopspringssl.com/',
  };

  it('flags the trap: stored photos all belong to a sibling facility (0 servable)', () => {
    // Real-world shape of the diagnosed trap: "Hilltop ESTATES" photos stored
    // on the "Hilltop SPRINGS" record — the sibling filter removes all of them.
    expect(
      communityNeedsPhotoRediscovery({
        ...base,
        photos: [
          'https://hilltopestatessl.seniorlivingnearme.com/photos/hilltop-estates-lobby.jpg',
          'https://hilltopestatessl.seniorlivingnearme.com/photos/hilltop-estates-dining.jpg',
        ],
        lastPhotoEnrichment: new Date('2025-09-01'),
      }),
    ).toBe(true);
  });

  it('does not flag a community with at least one servable photo', () => {
    expect(
      communityNeedsPhotoRediscovery({
        ...base,
        photos: ['https://www.hilltopspringssl.com/images/courtyard.jpg'],
        lastPhotoEnrichment: new Date('2025-09-01'),
      }),
    ).toBe(false);
  });

  it('treats an empty set WITH a completed photo pass as confirmed no-photos (not trapped)', () => {
    expect(
      communityNeedsPhotoRediscovery({
        ...base,
        photos: [],
        lastPhotoEnrichment: new Date('2025-09-01'),
      }),
    ).toBe(false);
  });

  it('flags an empty set that never had a photo pass', () => {
    expect(
      communityNeedsPhotoRediscovery({ ...base, photos: [], lastPhotoEnrichment: null }),
    ).toBe(true);
    expect(communityNeedsPhotoRediscovery({ ...base, photos: null })).toBe(true);
  });

  it('flags a set that is only stock/placeholder images', () => {
    expect(
      communityNeedsPhotoRediscovery({
        ...base,
        photos: ['https://via.placeholder.com/600x400', 'https://example.com/logo.svg'],
        lastPhotoEnrichment: new Date('2025-09-01'),
      }),
    ).toBe(true);
  });

  it('ignores blank/whitespace entries when deciding whether photos are stored', () => {
    expect(
      communityNeedsPhotoRediscovery({
        ...base,
        photos: ['', '   '],
        lastPhotoEnrichment: new Date('2025-09-01'),
      }),
    ).toBe(false); // equivalent to a confirmed-empty set
  });
});

describe('sanitizeWebsiteUrl (corrupted stored website read sanitation)', () => {
  it('strips markdown bold wrappers and adds the protocol (the Hilltop case)', () => {
    expect(sanitizeWebsiteUrl('**www.hilltopspringssl.com**')).toBe(
      'https://www.hilltopspringssl.com/',
    );
  });

  it('adds https:// to bare domains', () => {
    expect(sanitizeWebsiteUrl('oakdaleredding.com')).toBe('https://oakdaleredding.com/');
    expect(sanitizeWebsiteUrl('www.santamariapostacute.com')).toBe(
      'https://www.santamariapostacute.com/',
    );
  });

  it('strips AI citation markers and trailing punctuation', () => {
    expect(sanitizeWebsiteUrl('https://www.reddingseniorcenter.com[1].')).toBe(
      'https://www.reddingseniorcenter.com/',
    );
    expect(sanitizeWebsiteUrl('https://www.brookdaleliving.com,')).toBe(
      'https://www.brookdaleliving.com/',
    );
  });

  it('extracts the URL from a markdown link', () => {
    expect(sanitizeWebsiteUrl('[Visit site](https://example.com/about)')).toBe(
      'https://example.com/about',
    );
  });

  it('returns null for junk placeholder values', () => {
    for (const junk of ['No', 'Not', 'N/A', 'none', '-', '', null, undefined]) {
      expect(sanitizeWebsiteUrl(junk as any)).toBeNull();
    }
  });

  it('returns null for prose that is not a URL', () => {
    expect(
      sanitizeWebsiteUrl('Not available in the search results. Official website URL not found.'),
    ).toBeNull();
  });

  it('is idempotent (safe for repeated read-side application)', () => {
    const once = sanitizeWebsiteUrl('**www.hilltopspringssl.com**');
    expect(sanitizeWebsiteUrl(once)).toBe(once);
  });
});
