import { getCommunityUrl } from './community-url';

export interface CommunityNavigationDecision {
  shouldNavigate: boolean;
  path: string | null;
}

interface NavigableCommunity {
  id?: unknown;
  name?: unknown;
  city?: unknown;
  state?: unknown;
  slug?: unknown;
  citySlug?: unknown;
  stateSlug?: unknown;
}

const asString = (value: unknown): string =>
  typeof value === 'string' ? value : '';

/**
 * Decide where a community-card or map-pin click should take the user.
 *
 * Discovered communities are persisted server-side and come back with a real
 * positive database id. We only navigate when we have a valid positive id, so a
 * result that failed to save (id 0, NaN, or missing) never produces a broken
 * link for families — the caller shows a "still saving" toast instead.
 *
 * When location data is available we build the clean, keyword-rich SEO URL
 * (`/senior-living/{state}/{city}/{slug}`) so both click paths agree and resolve
 * through the by-slug lookup. We only fall back to the `/communities/<id>` route
 * when the SEO slug segments are truly missing.
 *
 * This is the decision logic behind `handleCommunityClick` in map-search.tsx.
 */
export function resolveCommunityNavigation(
  community: NavigableCommunity | null | undefined
): CommunityNavigationDecision {
  const communityId = Number(community?.id);
  if (!Number.isFinite(communityId) || communityId <= 0) {
    return { shouldNavigate: false, path: null };
  }

  const name = asString(community?.name).trim();
  const city = asString(community?.city).trim();
  const state = asString(community?.state).trim();
  const slug = asString(community?.slug).trim();
  const citySlug = asString(community?.citySlug).trim();
  const stateSlug = asString(community?.stateSlug).trim();

  // Prefer the clean SEO URL when we have enough location data to build a
  // resolvable /senior-living/{state}/{city}/{slug} link.
  if (name && city && state) {
    return {
      shouldNavigate: true,
      path: getCommunityUrl({
        id: communityId,
        name,
        city,
        state,
        slug: slug || undefined,
        citySlug: citySlug || undefined,
        stateSlug: stateSlug || undefined,
      }),
    };
  }

  // Fall back to the ID route only when SEO slug data is truly missing.
  return { shouldNavigate: true, path: '/communities/' + communityId };
}
