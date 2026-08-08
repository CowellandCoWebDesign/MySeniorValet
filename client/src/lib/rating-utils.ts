/**
 * Rating utility — Golden Data Rule compliant helpers.
 *
 * Priority order (highest wins):
 *   1. adminRatingOverride  — admin-entered verified external rating (e.g. state inspection)
 *   2. community.rating     — calculated from real approved user reviews
 *   3. null                 — no verified rating data; show "Not yet rated"
 *
 * NEVER add fallback numbers here. If all sources are absent, return null.
 */

export interface RatingSource {
  adminRatingOverride?: string | number | null;
  rating?: string | number | null;
  reviewCount?: number | null;
}

/**
 * Returns the effective numeric rating (1–5 scale) for a community,
 * or null if no real rating data exists.
 */
export function getEffectiveRating(community: RatingSource): number | null {
  const override =
    community.adminRatingOverride != null
      ? parseFloat(String(community.adminRatingOverride))
      : NaN;

  if (!isNaN(override) && override > 0) return override;

  const calculated =
    community.rating != null
      ? parseFloat(String(community.rating))
      : NaN;

  if (!isNaN(calculated) && calculated > 0) return calculated;

  return null;
}

/**
 * Returns a human-readable label for a 1–5 star rating.
 * Returns "Not yet rated" when rating is null.
 */
export function getRatingLabel(rating: number | null): string {
  if (rating === null) return "Not yet rated";
  if (rating >= 4.5) return "Exceptional";
  if (rating >= 4.0) return "Excellent";
  if (rating >= 3.5) return "Very Good";
  if (rating >= 3.0) return "Good";
  return "Fair";
}

/**
 * Returns true if the rating came from an admin override rather than
 * user-submitted reviews — used to show source attribution.
 */
export function isAdminOverrideActive(community: RatingSource): boolean {
  const override =
    community.adminRatingOverride != null
      ? parseFloat(String(community.adminRatingOverride))
      : NaN;
  return !isNaN(override) && override > 0;
}
