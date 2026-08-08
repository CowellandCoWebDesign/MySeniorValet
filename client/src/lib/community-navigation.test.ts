import { resolveCommunityNavigation } from './community-navigation';

// ---------------------------------------------------------------------------
// Regression guard: tapping a freshly found community must never open a broken
// page. handleCommunityClick (map-search.tsx) delegates its navigate-or-toast
// decision to resolveCommunityNavigation. A valid positive id must navigate; an
// id of 0 (a discovery result that failed to save server-side) must NOT
// navigate so we never link to a broken /communities/0 — the user sees the
// "still saving" toast instead.
//
// When location data is present we navigate to the clean SEO URL
// /senior-living/{state}/{city}/{slug} (Task #325) so result cards and map pins
// agree and the by-slug detail lookup resolves. We only fall back to the
// /communities/<id> route when SEO slug data is truly missing.
// ---------------------------------------------------------------------------

describe('resolveCommunityNavigation — handleCommunityClick guard', () => {
  it('does NOT navigate for id 0 (unsaved discovery result)', () => {
    const decision = resolveCommunityNavigation({ id: 0 });
    expect(decision.shouldNavigate).toBe(false);
    expect(decision.path).toBeNull();
  });

  it('does NOT navigate for a negative id', () => {
    const decision = resolveCommunityNavigation({ id: -1 });
    expect(decision.shouldNavigate).toBe(false);
    expect(decision.path).toBeNull();
  });

  it('does NOT navigate for a missing / undefined id', () => {
    expect(resolveCommunityNavigation({}).shouldNavigate).toBe(false);
    expect(resolveCommunityNavigation(undefined).shouldNavigate).toBe(false);
    expect(resolveCommunityNavigation(null).shouldNavigate).toBe(false);
  });

  it('does NOT navigate for a non-numeric id', () => {
    const decision = resolveCommunityNavigation({ id: 'not-a-number' });
    expect(decision.shouldNavigate).toBe(false);
    expect(decision.path).toBeNull();
  });

  it('falls back to /communities/<id> when SEO location data is missing', () => {
    const decision = resolveCommunityNavigation({ id: 42 });
    expect(decision.shouldNavigate).toBe(true);
    expect(decision.path).toBe('/communities/42');
  });

  it('accepts a numeric string id and falls back to the ID route', () => {
    const decision = resolveCommunityNavigation({ id: '7' as unknown as number });
    expect(decision.shouldNavigate).toBe(true);
    expect(decision.path).toBe('/communities/7');
  });

  it('builds the clean SEO URL when name/city/state are present', () => {
    const decision = resolveCommunityNavigation({
      id: 123,
      name: 'Sunrise Senior Living',
      city: 'San Francisco',
      state: 'California',
    });
    expect(decision.shouldNavigate).toBe(true);
    expect(decision.path).toBe('/senior-living/california/san-francisco/sunrise-senior-living');
  });

  it('prefers stored slug segments when provided', () => {
    const decision = resolveCommunityNavigation({
      id: 55,
      name: 'Maple Court',
      city: 'Portland',
      state: 'Oregon',
      slug: 'maple-court',
      citySlug: 'portland',
      stateSlug: 'or',
    });
    expect(decision.path).toBe('/senior-living/or/portland/maple-court');
  });

  it('never produces a fabricated name-<id> slug for a discovered community', () => {
    const decision = resolveCommunityNavigation({
      id: 9001,
      name: 'Golden Years Home',
      city: 'Austin',
      state: 'Texas',
    });
    expect(decision.path).toBe('/senior-living/texas/austin/golden-years-home');
    expect(decision.path).not.toContain('-9001');
  });

  // Mirror of the real handler wiring: prove the decision drives navigation vs.
  // the "still saving" toast exactly as handleCommunityClick does.
  it('drives setLocation for a valid community and the toast for id 0', () => {
    const setLocation = jest.fn();
    const toast = jest.fn();

    const handleClick = (community: any) => {
      const nav = resolveCommunityNavigation(community);
      if (nav.shouldNavigate && nav.path) {
        setLocation(nav.path);
      } else {
        toast({ title: 'Still saving this community' });
      }
    };

    handleClick({ id: 99, name: 'Oak Villa', city: 'Reno', state: 'Nevada' });
    expect(setLocation).toHaveBeenCalledWith('/senior-living/nevada/reno/oak-villa');
    expect(toast).not.toHaveBeenCalled();

    setLocation.mockClear();
    handleClick({ id: 0 });
    expect(setLocation).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledTimes(1);
  });
});
