import { resolveCommunityNavigation } from './community-navigation';

// ---------------------------------------------------------------------------
// Regression guard for Task #322: tapping a freshly found community must never
// open a broken page. handleCommunityClick (map-search.tsx) delegates its
// navigate-or-toast decision to resolveCommunityNavigation. A valid positive id
// must navigate to /communities/<id>; an id of 0 (a discovery result that
// failed to save server-side) must NOT navigate so we never link to
// /communities/0 — the user sees the "still saving" toast instead.
// ---------------------------------------------------------------------------

describe('resolveCommunityNavigation — handleCommunityClick guard (Task #322)', () => {
  it('navigates to /communities/<id> for a valid positive id', () => {
    const decision = resolveCommunityNavigation({ id: 42 });
    expect(decision.shouldNavigate).toBe(true);
    expect(decision.path).toBe('/communities/42');
  });

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

  it('accepts a numeric string id and builds the right path', () => {
    const decision = resolveCommunityNavigation({ id: '7' as unknown as number });
    expect(decision.shouldNavigate).toBe(true);
    expect(decision.path).toBe('/communities/7');
  });

  // Mirror of the real handler wiring: prove the decision drives navigation vs.
  // the "still saving" toast exactly as handleCommunityClick does.
  it('drives setLocation for a valid id and the toast for id 0', () => {
    const setLocation = jest.fn();
    const toast = jest.fn();

    const handleClick = (community: { id?: unknown }) => {
      const nav = resolveCommunityNavigation(community);
      if (nav.shouldNavigate && nav.path) {
        setLocation(nav.path);
      } else {
        toast({ title: 'Still saving this community' });
      }
    };

    handleClick({ id: 99 });
    expect(setLocation).toHaveBeenCalledWith('/communities/99');
    expect(toast).not.toHaveBeenCalled();

    setLocation.mockClear();
    handleClick({ id: 0 });
    expect(setLocation).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledTimes(1);
  });
});
