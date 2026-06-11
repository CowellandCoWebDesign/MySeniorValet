/**
 * Shared community classification helpers.
 * Used by both server-side filters and client-side display logic.
 *
 * "Clearly fake" = name+address only listings with NO supporting data:
 *   isVerified = false  (also accepted as is_verified for raw DB rows)
 *   AND phone is blank/null
 *   AND website is blank/null
 *   AND description is blank/null
 *   AND dataSource / data_source is blank/null or is the default placeholder
 *
 * These ~112 listings (out of ~33k) are hidden from public views.
 * Real-but-unverified listings (which have at least one of: dataSource,
 * phone, website) remain fully visible with NO warning badge.
 *
 * Field-name note: Drizzle ORM returns camelCase keys (dataSource, isVerified)
 * while raw DB rows and some legacy objects use snake_case (data_source,
 * is_verified). Both variants are accepted throughout this module.
 */

export interface CommunityLike {
  /** camelCase (Drizzle) */
  isVerified?: boolean;
  /** snake_case (raw DB / legacy) */
  is_verified?: boolean;
  phone?: string | null;
  website?: string | null;
  description?: string | null;
  /** camelCase (Drizzle) */
  dataSource?: string | null;
  /** snake_case (raw DB / legacy) */
  data_source?: string | null;
  /** camelCase (Drizzle) */
  isHidden?: boolean;
  /** snake_case (raw DB / legacy) */
  is_hidden?: boolean;
  flagStatus?: string | null;
  flag_status?: string | null;
}

const DEFAULT_DATA_SOURCES = new Set([
  "",
  "government database",
  "placeholder",
  "unknown",
]);

function isDefaultDataSource(src: string | null | undefined): boolean {
  if (!src) return true;
  return DEFAULT_DATA_SOURCES.has(src.trim().toLowerCase());
}

/**
 * Returns true when a community has NO supporting data beyond name + address,
 * making it a "clearly fake / empty" listing that should be hidden from public views.
 *
 * Accepts both camelCase (Drizzle) and snake_case (raw DB) field names.
 */
export function isClearlyFake(community: CommunityLike): boolean {
  // Accept both camelCase and snake_case verified flag
  const verified = community.isVerified ?? community.is_verified;
  if (verified) return false;

  const hasPhone = Boolean(community.phone?.trim());
  const hasWebsite = Boolean(community.website?.trim());
  const hasDescription = Boolean(community.description?.trim());

  // Accept both camelCase and snake_case data_source
  const src = community.dataSource ?? community.data_source;
  const hasDataSource = !isDefaultDataSource(src);

  return !hasPhone && !hasWebsite && !hasDescription && !hasDataSource;
}

/**
 * Returns true when the community should be hidden from public views.
 * This covers both manually-hidden records and clearly-fake auto-detection.
 *
 * Accepts both camelCase (Drizzle) and snake_case (raw DB) field names.
 */
export function isPubliclyHidden(community: CommunityLike): boolean {
  const hidden = community.isHidden ?? community.is_hidden;
  if (hidden) return true;
  return isClearlyFake(community);
}
