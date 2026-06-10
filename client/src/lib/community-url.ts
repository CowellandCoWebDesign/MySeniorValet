export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getCommunitySlug(name: string): string {
  return slugify(name) || 'community';
}

export function getCommunityUrl(community: {
  id: number;
  name: string;
  city: string;
  state: string;
  slug?: string | null;
  citySlug?: string | null;
  stateSlug?: string | null;
}): string {
  const stateSegment = community.stateSlug || slugify(community.state);
  const citySegment = community.citySlug || slugify(community.city);
  const nameSegment = community.slug || getCommunitySlug(community.name);
  return `/senior-living/${stateSegment}/${citySegment}/${nameSegment}`;
}
