import {
  evaluateCommunityProfileRefresh,
  hasCommunitySpecificSubstance,
  isBoilerplateOrFailureDescription,
} from '../shared/community-profile-refresh';
import {
  isGenericTemplateDescription,
  shouldUpgradeDescription,
} from '../server/utils/description-quality';

const NOW = new Date('2026-08-05T12:00:00.000Z');
const richDescription =
  'Sunrise Villa in La Jolla provides assisted living and memory care in studio and one-bedroom suites. Residents can enjoy chef-prepared dining, daily fitness and social activities, landscaped gardens, scheduled transportation, housekeeping, and medication support from an on-site care team.';

function completeProfile(overrides: Record<string, any> = {}) {
  return {
    name: 'Sunrise Villa',
    city: 'La Jolla',
    description: richDescription,
    amenities: ['Landscaped gardens'],
    services: ['Scheduled transportation'],
    phone: '555-123-4567',
    website: 'https://sunrise.example',
    priceRange: { min: 3000, max: 5000 },
    availabilityStatus: 'available',
    lastSuccessfulEnrichment: '2026-07-15T00:00:00.000Z',
    ...overrides,
  };
}

describe('community profile refresh eligibility', () => {
  it('treats an overview below 200 characters as independently refreshable', () => {
    const result = evaluateCommunityProfileRefresh(
      completeProfile({ description: 'Sunrise Villa offers assisted living in La Jolla.' }),
      NOW,
    );
    expect(result.reasons).toContain('short_description');
  });

  it('recognizes known boilerplate and failure prose', () => {
    const description =
      'Contact the community for details. Information for this community was not found online.'.padEnd(240, ' ');
    expect(isBoilerplateOrFailureDescription(description)).toBe(true);
    expect(evaluateCommunityProfileRefresh(completeProfile({ description }), NOW).reasons)
      .toContain('boilerplate_description');
  });

  it('flags long text that lacks community-specific senior-living substance', () => {
    const description =
      'Sunrise Villa is a wonderful destination with a welcoming atmosphere and an excellent reputation. '.repeat(3);
    expect(hasCommunitySpecificSubstance(description, 'Sunrise Villa', 'La Jolla')).toBe(false);
    expect(evaluateCommunityProfileRefresh(completeProfile({ description }), NOW).reasons)
      .toContain('generic_description');
  });

  it('flags photos-compatible profiles with no amenities or services', () => {
    const result = evaluateCommunityProfileRefresh(
      completeProfile({ amenities: [], services: [] }),
      NOW,
    );
    expect(result.reasons).toContain('missing_amenities_services');
  });

  it('flags enrichment older than 180 days and leaves a current complete profile ineligible', () => {
    expect(
      evaluateCommunityProfileRefresh(
        completeProfile({ lastSuccessfulEnrichment: '2025-11-08T00:00:00.000Z' }),
        NOW,
      ).reasons,
    ).toContain('stale_enrichment');
    expect(evaluateCommunityProfileRefresh(completeProfile(), NOW)).toEqual({
      eligible: false,
      reasons: [],
    });
  });
});

describe('family refresh description quality', () => {
  it('does not accept short or boilerplate copy as a description repair', () => {
    expect(shouldUpgradeDescription('Short old overview', 'A somewhat longer but still thin overview.', false, true, { name: 'Sunrise Villa', city: 'La Jolla' }))
      .toBe(false);
    expect(
      shouldUpgradeDescription(
        'Short old overview',
        'Contact the community for details. '.repeat(10),
        false,
        true,
        { name: 'Sunrise Villa', city: 'La Jolla' },
      ),
    ).toBe(false);
  });

  it('accepts a substantive 200+ character repair but never downgrades stronger copy', () => {
    expect(shouldUpgradeDescription('Short old overview', richDescription, false, true, { name: 'Sunrise Villa', city: 'La Jolla' })).toBe(true);
    expect(
      shouldUpgradeDescription(`${richDescription} ${richDescription}`, richDescription, false, true, { name: 'Sunrise Villa', city: 'La Jolla' }),
    ).toBe(false);
  });

  it('rejects generic senior-living prose that does not identify this community', () => {
    const generic =
      'Residents receive assisted living support in comfortable apartments with dining, activities, transportation, housekeeping, and wellness services designed to support a convenient lifestyle. Additional care is available based on individual needs and preferences.';
    expect(
      shouldUpgradeDescription('Short old overview', generic, false, true, {
        name: 'Sunrise Villa',
        city: 'La Jolla',
      }),
    ).toBe(false);
  });

  it('keeps legacy generic-template detection in force', () => {
    expect(
      isGenericTemplateDescription(
        'Sunrise Villa is an assisted living community located in La Jolla, California.',
      ),
    ).toBe(true);
  });
});