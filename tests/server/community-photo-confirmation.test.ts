import { describe, it, expect } from '@jest/globals';

// The orchestrator (and the photo-enrichment service) import `../db`, which
// eagerly builds a Neon connection pool and throws without DATABASE_URL. The
// functions under test are pure, so we stub the db module to keep these as
// fast, isolated unit tests with no open DB handles.
jest.mock('../../server/db', () => ({ db: {}, pool: {} }));

// free-enrichment-service eagerly imports cheerio (an ESM-only package ts-jest
// can't parse). The function under test (textReferencesCommunity) never touches
// cheerio at call time, so a stub keeps the import graph parseable.
jest.mock('cheerio', () => ({}));

import {
  hostMatchesOfficial,
  isSeniorLivingDirectoryHost,
} from '../../server/services/perplexity-search-api';
import { textReferencesCommunity } from '../../server/services/free-enrichment-service';
import { CommunityPhotoEnrichment } from '../../server/services/community-photo-enrichment';
import {
  decideForcedRefreshPhotos,
  normalizeImageKey,
} from '../../server/services/community-enrichment-orchestrator';

// ---------------------------------------------------------------------------
// hostMatchesOfficial — the "authentic" anchor of the trust filter
// ---------------------------------------------------------------------------
describe('hostMatchesOfficial', () => {
  const OFFICIAL = 'sunriseseniorliving.com';

  it('matches an exact host', () => {
    expect(hostMatchesOfficial('sunriseseniorliving.com', OFFICIAL)).toBe(true);
  });

  it('ignores a leading www. on either side', () => {
    expect(hostMatchesOfficial('www.sunriseseniorliving.com', OFFICIAL)).toBe(true);
    expect(hostMatchesOfficial('sunriseseniorliving.com', `www.${OFFICIAL}`)).toBe(true);
  });

  it('matches a subdomain of the official host', () => {
    expect(hostMatchesOfficial('photos.sunriseseniorliving.com', OFFICIAL)).toBe(true);
    expect(hostMatchesOfficial('cdn.assets.sunriseseniorliving.com', OFFICIAL)).toBe(true);
  });

  it('rejects a look-alike suffix host (no dot boundary)', () => {
    // "notsunriseseniorliving.com" ends with the official string but NOT with
    // ".sunriseseniorliving.com", so it must not be treated as authentic.
    expect(hostMatchesOfficial('notsunriseseniorliving.com', OFFICIAL)).toBe(false);
    expect(hostMatchesOfficial('fakesunriseseniorliving.com', OFFICIAL)).toBe(false);
  });

  it('rejects a look-alike where the official host is a left-prefix', () => {
    // Classic homograph trick: official host appears, but the registrable domain
    // is attacker-controlled (.evil.com).
    expect(hostMatchesOfficial('sunriseseniorliving.com.evil.com', OFFICIAL)).toBe(false);
  });

  it('rejects a completely different host', () => {
    expect(hostMatchesOfficial('brookdale.com', OFFICIAL)).toBe(false);
  });

  it('returns false when there is no official host to anchor to', () => {
    expect(hostMatchesOfficial('sunriseseniorliving.com', undefined)).toBe(false);
    expect(hostMatchesOfficial('sunriseseniorliving.com', '')).toBe(false);
  });

  it('returns false when the candidate host is empty', () => {
    expect(hostMatchesOfficial('', OFFICIAL)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isSeniorLivingDirectoryHost — the directory allowlist used by corroboration
// ---------------------------------------------------------------------------
describe('isSeniorLivingDirectoryHost', () => {
  it('accepts a recognized directory host', () => {
    expect(isSeniorLivingDirectoryHost('caring.com')).toBe(true);
    expect(isSeniorLivingDirectoryHost('aplaceformom.com')).toBe(true);
  });

  it('accepts www. and subdomains of a recognized directory', () => {
    expect(isSeniorLivingDirectoryHost('www.caring.com')).toBe(true);
    expect(isSeniorLivingDirectoryHost('listings.caring.com')).toBe(true);
  });

  it('rejects a look-alike host (substring is not enough)', () => {
    expect(isSeniorLivingDirectoryHost('fake-caring.com')).toBe(false);
    expect(isSeniorLivingDirectoryHost('caring.com.evil.tld')).toBe(false);
  });

  it('rejects an unrelated host and empty input', () => {
    expect(isSeniorLivingDirectoryHost('example.com')).toBe(false);
    expect(isSeniorLivingDirectoryHost('')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Trust filter — corroboration via name + city (textReferencesCommunity)
// ---------------------------------------------------------------------------
describe('trust filter — name+city corroboration', () => {
  it('keeps a candidate corroborated by distinctive name tokens', () => {
    const text = 'Welcome to River Commons, a wonderful place.';
    expect(textReferencesCommunity(text, 'River Commons', 'Springfield')).toBe(true);
  });

  it('keeps a candidate when name varies slightly but city is required and present', () => {
    const text = 'River Commons Senior Living — located in Springfield, IL.';
    expect(
      textReferencesCommunity(text, 'River Commons', 'Springfield', { requireCity: true }),
    ).toBe(true);
  });

  it('drops on no signal (text references neither the name nor the city)', () => {
    const text = 'Best pizza in town, fresh dough daily.';
    expect(
      textReferencesCommunity(text, 'River Commons', 'Springfield', { requireCity: true }),
    ).toBe(false);
  });

  it('drops when the city is required but missing (wrong-location guard)', () => {
    // Name matches, but the listing is for the SAME-named community in another
    // city — requireCity must reject it.
    const text = 'River Commons in Chicago offers assisted living.';
    expect(
      textReferencesCommunity(text, 'River Commons', 'Springfield', { requireCity: true }),
    ).toBe(false);
  });

  it('does not require city for the official site (requireCity off)', () => {
    const text = 'River Commons — our community homepage.';
    expect(textReferencesCommunity(text, 'River Commons', 'Springfield')).toBe(true);
  });

  it('falls back to verbatim full-name match for entirely generic names', () => {
    // "Senior Living Center" tokenizes to nothing distinctive, so the full name
    // must appear verbatim.
    expect(
      textReferencesCommunity('the senior living center near you', 'Senior Living Center', 'Reno'),
    ).toBe(true);
    expect(
      textReferencesCommunity('assisted living options nearby', 'Senior Living Center', 'Reno'),
    ).toBe(false);
  });

  it('returns false for empty text', () => {
    expect(textReferencesCommunity('', 'River Commons', 'Springfield')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Trust filter — sibling-location mismatch (photoBelongsToDifferentCommunity)
// ---------------------------------------------------------------------------
describe('trust filter — sibling / wrong-facility photo discrimination', () => {
  it('drops a photo whose filename names a DIFFERENT facility', () => {
    const url =
      'https://www.caring.com/img/Willow-Springs-Alzheimers-Special-Care-Center-Dining.jpg';
    expect(
      CommunityPhotoEnrichment.photoBelongsToDifferentCommunity(
        url,
        'Quartz Hill Care Center',
        'Quartz Hill',
        'https://quartzhillcare.com',
      ),
    ).toBe(true);
  });

  it('keeps a photo whose filename references THIS community', () => {
    const url =
      'https://www.caring.com/img/Quartz-Hill-Care-Center-Exterior.jpg';
    expect(
      CommunityPhotoEnrichment.photoBelongsToDifferentCommunity(
        url,
        'Quartz Hill Care Center',
        'Quartz Hill',
        'https://quartzhillcare.com',
      ),
    ).toBe(false);
  });

  it('distinguishes siblings sharing a core token but different suffix', () => {
    // "Hilltop Springs" must reject a "Hilltop Estates" photo even though both
    // share the "hilltop" core token.
    const url =
      'https://seniorlivingnearme.com/img/Hilltop-Estates-Assisted-Living-Garden.jpg';
    expect(
      CommunityPhotoEnrichment.photoBelongsToDifferentCommunity(
        url,
        'Hilltop Springs',
        'Riverside',
        'https://hilltopspringssl.com',
      ),
    ).toBe(true);
  });

  it('does not let a shared city rescue a foreign-named sibling photo', () => {
    // Same city (Hilltop) but the filename carries a foreign distinctive token
    // ("estates") — the city coincidence must NOT rescue it.
    const url =
      'https://caring.com/img/Hilltop-Estates-Memory-Care-Lobby.jpg';
    expect(
      CommunityPhotoEnrichment.photoBelongsToDifferentCommunity(
        url,
        'Hilltop Springs',
        'Hilltop',
        'https://hilltopspringssl.com',
      ),
    ).toBe(true);
  });

  it('keeps a photo hosted on the community OWN domain (own-domain guard)', () => {
    const url =
      'https://stellarcaresd.com/img/Alzheimers-Memory-Care-Center-Event.jpg';
    expect(
      CommunityPhotoEnrichment.photoBelongsToDifferentCommunity(
        url,
        'Stellar Care',
        'San Diego',
        'https://stellarcaresd.com',
      ),
    ).toBe(false);
  });

  it('keeps ambiguous filenames (numeric id, no facility name)', () => {
    const url = 'https://caring.com/img/community-12345-photo.jpg';
    expect(
      CommunityPhotoEnrichment.photoBelongsToDifferentCommunity(
        url,
        'Quartz Hill Care Center',
        'Quartz Hill',
        'https://quartzhillcare.com',
      ),
    ).toBe(false);
  });

  it('filterPhotosForCommunity drops mismatches and keeps matches', () => {
    const photos = [
      'https://caring.com/img/Willow-Springs-Alzheimers-Special-Care-Center-Dining.jpg',
      'https://caring.com/img/Quartz-Hill-Care-Center-Patio.jpg',
      'https://caring.com/img/photo-9981.jpg',
    ];
    const kept = CommunityPhotoEnrichment.filterPhotosForCommunity(
      photos,
      'Quartz Hill Care Center',
      'Quartz Hill',
      'https://quartzhillcare.com',
    );
    expect(kept).not.toContain(photos[0]);
    expect(kept).toContain(photos[1]);
    expect(kept).toContain(photos[2]);
  });
});

// ---------------------------------------------------------------------------
// normalizeImageKey — dedup key used by the forced-refresh merge
// ---------------------------------------------------------------------------
describe('normalizeImageKey', () => {
  it('collapses query/hash and www, lowercases host+path', () => {
    expect(normalizeImageKey('https://www.Example.com/Photos/A.JPG?v=2#frag')).toBe(
      'www.example.com/photos/a.jpg',
    );
  });

  it('treats two links to the same host+path as equal keys', () => {
    const a = normalizeImageKey('https://cdn.example.com/p/1.jpg?size=large');
    const b = normalizeImageKey('https://cdn.example.com/p/1.jpg?size=small');
    expect(a).toBe(b);
  });

  it('falls back to a lowercased raw string for unparseable input', () => {
    expect(normalizeImageKey('NOT A URL')).toBe('not a url');
  });
});

// ---------------------------------------------------------------------------
// Forced-refresh decision (decideForcedRefreshPhotos)
// ---------------------------------------------------------------------------
describe('decideForcedRefreshPhotos', () => {
  const base = {
    confirmedDbPairs: [] as Array<{ url: string; attr: string }>,
    discoveredPhotos: [] as string[],
    discoveredPhotoAttributions: [] as string[],
    discoveryRan: false,
    rawDbPhotoCount: 0,
    cleanDbPhotos: [] as string[],
    cleanDbAttributions: [] as string[],
  };

  it('clears to [] only when discovery ran AND merged set is empty AND DB had photos', () => {
    const result = decideForcedRefreshPhotos({
      ...base,
      discoveryRan: true,
      rawDbPhotoCount: 3,
      cleanDbPhotos: ['https://wrong.com/a.jpg'],
      cleanDbAttributions: ['https://wrong.com'],
    });
    expect(result.clearPhotos).toBe(true);
    expect(result.photos).toEqual([]);
    expect(result.photoAttributions).toEqual([]);
  });

  it('preserves confirmed DB photos and merges freshly-confirmed discovery', () => {
    const result = decideForcedRefreshPhotos({
      ...base,
      confirmedDbPairs: [
        { url: 'https://official.com/hero.jpg', attr: 'https://official.com' },
      ],
      discoveredPhotos: ['https://caring.com/new.jpg'],
      discoveredPhotoAttributions: ['https://caring.com'],
      discoveryRan: true,
      rawDbPhotoCount: 1,
    });
    expect(result.clearPhotos).toBe(false);
    expect(result.photos).toEqual([
      'https://official.com/hero.jpg',
      'https://caring.com/new.jpg',
    ]);
    expect(result.photoAttributions).toEqual([
      'https://official.com',
      'https://caring.com',
    ]);
  });

  it('keeps a confirmed photo even when discovery found nothing (no clear)', () => {
    const result = decideForcedRefreshPhotos({
      ...base,
      confirmedDbPairs: [
        { url: 'https://official.com/hero.jpg', attr: 'https://official.com' },
      ],
      discoveryRan: true,
      rawDbPhotoCount: 2,
    });
    expect(result.clearPhotos).toBe(false);
    expect(result.photos).toEqual(['https://official.com/hero.jpg']);
  });

  it('NEVER clears on a transient discovery failure — preserves DB photos', () => {
    const result = decideForcedRefreshPhotos({
      ...base,
      discoveryRan: false, // scrape threw; discovery did not complete
      rawDbPhotoCount: 2,
      cleanDbPhotos: ['https://stored.com/a.jpg', 'https://stored.com/b.jpg'],
      cleanDbAttributions: ['https://stored.com', 'https://stored.com'],
    });
    expect(result.clearPhotos).toBe(false);
    expect(result.photos).toEqual([
      'https://stored.com/a.jpg',
      'https://stored.com/b.jpg',
    ]);
    expect(result.photoAttributions).toEqual([
      'https://stored.com',
      'https://stored.com',
    ]);
  });

  it('does not clear when DB had no photos to begin with', () => {
    const result = decideForcedRefreshPhotos({
      ...base,
      discoveryRan: true,
      rawDbPhotoCount: 0,
      cleanDbPhotos: [],
      cleanDbAttributions: [],
    });
    expect(result.clearPhotos).toBe(false);
    expect(result.photos).toEqual([]);
  });

  it('dedupes overlapping confirmed DB and discovered photos by normalized key', () => {
    const result = decideForcedRefreshPhotos({
      ...base,
      confirmedDbPairs: [
        { url: 'https://official.com/p/1.jpg', attr: 'https://official.com' },
      ],
      discoveredPhotos: ['https://official.com/p/1.jpg?size=large'],
      discoveredPhotoAttributions: ['https://caring.com'],
      discoveryRan: true,
      rawDbPhotoCount: 1,
    });
    expect(result.photos).toEqual(['https://official.com/p/1.jpg']);
    // First (confirmed DB) attribution wins on a key collision.
    expect(result.photoAttributions).toEqual(['https://official.com']);
  });
});
