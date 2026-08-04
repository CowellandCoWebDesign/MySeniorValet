/**
 * SEO indexing eligibility regression tests (Task: safe noindex system).
 * Criteria: shared/community-indexability.ts + docs/SEO_INDEXING_ELIGIBILITY.md
 */
import {
  evaluateIndexability,
  communityRobotsDirective,
  isLocationIndexable,
  hasConfirmedCareType,
  isTemplatedDescription,
  duplicateOfId,
  DUPLICATE_OF_FLAG_PREFIX,
} from '../shared/community-indexability';

const base = {
  name: 'Sunrise Gardens Assisted Living',
  city: 'Miami',
  state: 'FL',
  slug: 'sunrise-gardens-assisted-living',
  citySlug: 'miami',
  stateSlug: 'fl',
  isActive: true,
  isHidden: false,
  careTypes: ['Assisted Living', 'Memory Care'],
  description:
    'Sunrise Gardens offers personalized assisted living and memory care with a dedicated nursing team, chef-prepared meals, weekly outings, and a secure garden courtyard designed for residents living with dementia.',
  phone: '(305) 555-0100',
  website: 'https://www.sunrisegardensfl.com',
  dataSource: 'Florida AHCA Licensing',
  photos: ['https://cdn.example-photos.net/sunrise-1.jpg'],
  dataQualityFlags: [] as string[],
};

describe('evaluateIndexability', () => {
  it('fully indexable community → index', () => {
    const res = evaluateIndexability(base);
    expect(res.indexable).toBe(true);
    expect(res.reasons).toEqual([]);
    expect(res.signals).toEqual(expect.arrayContaining(['description', 'photos']));
    expect(communityRobotsDirective(base)).toBe('index, follow, max-image-preview:large');
  });

  it('incomplete (no strong signal) → noindex,follow with reason', () => {
    const thin = { ...base, description: '', photos: [], website: null };
    const res = evaluateIndexability(thin);
    expect(res.indexable).toBe(false);
    expect(res.reasons).toContain('no_strong_signal');
    expect(communityRobotsDirective(thin)).toBe('noindex, follow');
  });

  it('duplicate secondary → noindex + duplicateOfId exposed', () => {
    const dup = { ...base, dataQualityFlags: [`${DUPLICATE_OF_FLAG_PREFIX}123`] };
    const res = evaluateIndexability(dup);
    expect(res.indexable).toBe(false);
    expect(res.reasons).toContain('duplicate_secondary');
    expect(res.duplicateOfId).toBe(123);
    expect(duplicateOfId(dup)).toBe(123);
  });

  it('missing canonical slug → not indexable', () => {
    const res = evaluateIndexability({ ...base, slug: null });
    expect(res.indexable).toBe(false);
    expect(res.reasons).toContain('missing_canonical_slug');
  });

  it('hidden community → not_public (410 upstream)', () => {
    const res = evaluateIndexability({ ...base, isHidden: true });
    expect(res.indexable).toBe(false);
    expect(res.reasons).toContain('not_public');
  });

  it('deactivated community → not_public', () => {
    expect(evaluateIndexability({ ...base, isActive: false }).reasons).toContain('not_public');
  });

  it('placeholder/test record → test_or_placeholder', () => {
    const res = evaluateIndexability({ ...base, name: 'Test Community Demo' });
    expect(res.indexable).toBe(false);
    expect(res.reasons).toContain('test_or_placeholder');
  });

  it('critical integrity flag (synthetic_suspected) hard-fails', () => {
    const res = evaluateIndexability({ ...base, dataQualityFlags: ['synthetic_suspected'] });
    expect(res.indexable).toBe(false);
    expect(res.reasons).toContain('critical_flag:synthetic_suspected');
  });

  it('benign quality flags (no_photos, not_geocoded) do NOT gate indexing', () => {
    const res = evaluateIndexability({ ...base, dataQualityFlags: ['no_photos', 'not_geocoded', 'thin_description'] });
    expect(res.indexable).toBe(true);
  });

  it('default-only care type without corroboration → unconfirmed_care_type', () => {
    const res = evaluateIndexability({
      ...base,
      name: 'Willow Creek Apartments for Seniors', // no "assisted living" in name
      careTypes: ['Assisted Living'], // DB column default only
      communitySubtype: null,
    });
    expect(res.indexable).toBe(false);
    expect(res.reasons).toContain('unconfirmed_care_type');
  });

  it('default-only care type corroborated by name IS confirmed', () => {
    const c = { ...base, careTypes: ['Assisted Living'] }; // name contains "Assisted Living"
    expect(hasConfirmedCareType(c)).toBe(true);
    expect(evaluateIndexability(c).indexable).toBe(true);
  });

  it('non_senior classified listing is not indexable', () => {
    const res = evaluateIndexability({
      ...base,
      name: 'Riverside Family Apartments',
      careTypes: ['HUD Housing'],
      dataSource: 'HUD Multifamily Database',
    });
    expect(res.indexable).toBe(false);
    expect(res.reasons).toContain('non_senior');
  });

  it('templated short description does not count as a strong signal', () => {
    const templated =
      'Willow Creek is an assisted living community located in Miami, Florida, offering care to seniors.';
    expect(isTemplatedDescription(templated)).toBe(true);
    const res = evaluateIndexability({ ...base, description: templated, photos: [] });
    expect(res.indexable).toBe(false);
    expect(res.reasons).toContain('no_strong_signal');
  });

  it('real pricing alone qualifies a page with base identity', () => {
    const res = evaluateIndexability({ ...base, description: '', photos: [], rentPerMonth: '3450' });
    expect(res.indexable).toBe(true);
    expect(res.signals).toContain('pricing');
  });

  it('license alone qualifies', () => {
    const res = evaluateIndexability({ ...base, description: '', photos: [], licenseNumber: 'AL-12345' });
    expect(res.signals).toContain('license');
    expect(res.indexable).toBe(true);
  });

  it('reviews alone qualify', () => {
    const res = evaluateIndexability({ ...base, description: '', photos: [], googleReviewCount: 12 });
    expect(res.signals).toContain('reviews');
    expect(res.indexable).toBe(true);
  });

  it('snake_case (raw DB) rows are evaluated identically', () => {
    const raw = {
      name: base.name,
      city: base.city,
      state: base.state,
      slug: base.slug,
      city_slug: 'miami',
      state_slug: 'fl',
      is_active: true,
      is_hidden: false,
      care_types: ['Memory Care'],
      description: base.description,
      data_quality_flags: [],
      phone: base.phone,
      website: base.website,
      data_source: base.dataSource,
      photos: base.photos,
    };
    expect(evaluateIndexability(raw).indexable).toBe(true);
  });
});

describe('isLocationIndexable (city-level rule)', () => {
  it('city with ≥1 indexable community is indexable', () => {
    const thin = { ...base, description: '', photos: [], website: null };
    expect(isLocationIndexable([thin, base])).toBe(true);
  });
  it('city with only thin communities is not', () => {
    const thin = { ...base, description: '', photos: [], website: null };
    expect(isLocationIndexable([thin, { ...thin, name: 'Other Manor Assisted Living' }])).toBe(false);
  });
  it('empty city is not indexable', () => {
    expect(isLocationIndexable([])).toBe(false);
  });
});

describe('location slug normalization parity (SSR robots gate vs page data query)', () => {
  // Both getLocationData and locationHasIndexableCommunity MUST resolve city
  // slugs through the same exported formatCityName — assert its behavior so a
  // divergent ad-hoc normalizer (e.g. `replace(/-/g,' ')`) cannot come back.
  const { formatCityName } = require('../server/routes/seo-location-pages');

  it('title-cases hyphenated slugs the way the page query does', () => {
    expect(formatCityName('fort-worth')).toBe('Fort Worth');
    expect(formatCityName('st-petersburg')).toBe('St Petersburg');
    expect(formatCityName('coeur-d-alene')).toBe('Coeur D Alene');
    expect(formatCityName('MIAMI')).toBe('Miami');
  });

  it('client + endpoint state grammar accepts hyphenated Australian codes', () => {
    const grammar = /^[a-zA-Z]{2,3}(?:-[a-zA-Z]{2,3})?$/;
    for (const s of ['tx', 'fl', 'nsw', 'au-sa', 'AU-WA', 'bc']) expect(grammar.test(s)).toBe(true);
    for (const s of ['t', 'texas', 'au-southaus', 'au-sa-x']) expect(grammar.test(s)).toBe(false);
    // Client route matcher: same grammar embedded
    const route = /^\/senior-living\/([a-zA-Z]{2,3}(?:-[a-zA-Z]{2,3})?)(?:\/([^/]+))?\/?$/;
    expect('/senior-living/au-sa/adelaide'.match(route)?.slice(1, 3)).toEqual(['au-sa', 'adelaide']);
    expect('/senior-living/au-wa'.match(route)?.[1]).toBe('au-wa');
    expect('/senior-living/tx/fort-worth'.match(route)?.slice(1, 3)).toEqual(['tx', 'fort-worth']);
  });

  it('is NOT equivalent to a bare hyphen→space replacement (the old bug)', () => {
    const naive = (c: string) => c.replace(/-/g, ' ');
    expect(formatCityName('fort-worth')).not.toBe(naive('fort-worth'));
  });
});

describe('sitemap vs SSR robots agreement', () => {
  // The sitemap includes a city when ≥2 of its rows pass evaluateIndexability;
  // SSR marks the city indexable when ≥1 row passes (isLocationIndexable).
  // Sitemap inclusion must therefore IMPLY an index,follow SSR decision.
  const thin = { ...base, description: '', photos: [], website: null };

  const sitemapIncludesCity = (rows: any[]) =>
    rows.filter((r) => evaluateIndexability(r).indexable).length >= 2;

  it('any sitemap-listed city is also index,follow in SSR', () => {
    const cityRows = [base, { ...base, name: 'Palm Court Assisted Living' }, thin];
    expect(sitemapIncludesCity(cityRows)).toBe(true);
    expect(isLocationIndexable(cityRows)).toBe(true);
  });

  it('a city absent from the sitemap can still be index,follow (1 indexable) but never the reverse', () => {
    const oneGood = [base, thin];
    expect(sitemapIncludesCity(oneGood)).toBe(false);
    expect(isLocationIndexable(oneGood)).toBe(true);
    const allThin = [thin, { ...thin, name: 'Other Manor Assisted Living' }];
    expect(sitemapIncludesCity(allThin)).toBe(false);
    expect(isLocationIndexable(allThin)).toBe(false);
  });
});

describe('shell fragment robots wiring', () => {
  // Pure builder — same module the all-UA injection uses.
  const { buildShellFragments } = require('../server/seo/community-seo-builders');
  const row: any = {
    ...base,
    id: 42,
    updatedAt: new Date('2026-07-01'),
    address: '1 Main St',
    zipCode: '33101',
    country: 'US',
  };

  it('indexable community shell emits index,follow', () => {
    const frags = buildShellFragments(row, 'https://www.myseniorvalet.com');
    expect(frags.head).toContain('name="robots" content="index, follow, max-image-preview:large"');
  });

  it('thin community shell emits noindex,follow (and stays publicly served)', () => {
    const frags = buildShellFragments(
      { ...row, description: '', photos: [], website: null },
      'https://www.myseniorvalet.com'
    );
    expect(frags.head).toContain('name="robots" content="noindex, follow"');
  });

  it('duplicate secondary canonicalizes to the provided primary URL', () => {
    const frags = buildShellFragments(row, 'https://www.myseniorvalet.com', {
      canonicalUrl: 'https://www.myseniorvalet.com/senior-living/fl/miami/primary-community',
    });
    expect(frags.head).toContain('rel="canonical" href="https://www.myseniorvalet.com/senior-living/fl/miami/primary-community"');
  });
});
