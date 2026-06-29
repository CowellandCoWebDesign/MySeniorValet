export interface CommunityNavigationDecision {
  shouldNavigate: boolean;
  path: string | null;
}

/**
 * Decide where a community-card click should take the user.
 *
 * Discovered communities are persisted server-side and come back with a real
 * positive database id. We only navigate to /communities/<id> when the id is a
 * finite positive number, so a result that failed to save (id 0, NaN, or
 * missing) never produces a broken /communities/0 link for families.
 *
 * This is the decision logic behind `handleCommunityClick` in map-search.tsx.
 */
export function resolveCommunityNavigation(
  community: { id?: unknown } | null | undefined
): CommunityNavigationDecision {
  const communityId = Number(community?.id);
  if (Number.isFinite(communityId) && communityId > 0) {
    return { shouldNavigate: true, path: '/communities/' + communityId };
  }
  return { shouldNavigate: false, path: null };
}
