// Utility to generate SEO-friendly slugs for communities

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

export function generateCommunitySlug(community: {
  name: string;
  id: number;
}): string {
  const baseSlug = generateSlug(community.name);
  return baseSlug || `community-${community.id}`;
}

/**
 * Compute slug, citySlug, and stateSlug from raw strings.
 * Does NOT verify uniqueness — use safeCommunitySlugs() before inserts.
 */
export function computeCommunitySlugs(community: {
  name: string;
  city: string;
  state: string;
}): { slug: string; citySlug: string; stateSlug: string } {
  return {
    slug: generateSlug(community.name) || 'community',
    citySlug: generateSlug(community.city) || 'unknown-city',
    stateSlug: generateSlug(community.state) || 'unknown-state',
  };
}

/**
 * Like computeCommunitySlugs() but guarantees the (stateSlug, citySlug, slug)
 * triplet is unique in the communities table.  Appends -2, -3, … until a free
 * slot is found.
 *
 * @param community  name/city/state of the community being inserted or updated
 * @param excludeId  when updating an existing row, pass its id so we don't
 *                   count the row itself as a collision
 */
export async function safeCommunitySlugs(
  community: { name: string; city: string; state: string },
  excludeId?: number,
): Promise<{ slug: string; citySlug: string; stateSlug: string }> {
  // Lazy imports to avoid circular-dependency issues at module load time
  const { db } = await import('../db');
  const { communities } = await import('../../shared/schema');
  const { eq, and, ne } = await import('drizzle-orm');

  const { citySlug, stateSlug, slug: baseSlug } = computeCommunitySlugs(community);

  for (let attempt = 1; ; attempt++) {
    const slug = attempt === 1 ? baseSlug : `${baseSlug}-${attempt}`;

    const conditions: ReturnType<typeof eq>[] = [
      eq(communities.stateSlug, stateSlug),
      eq(communities.citySlug, citySlug),
      eq(communities.slug, slug),
    ];
    if (excludeId !== undefined) {
      conditions.push(ne(communities.id, excludeId) as ReturnType<typeof eq>);
    }

    const [existing] = await db
      .select({ id: communities.id })
      .from(communities)
      .where(and(...conditions))
      .limit(1);

    if (!existing) {
      return { slug, citySlug, stateSlug };
    }
  }
}
