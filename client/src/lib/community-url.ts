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
}): string {
  const state = slugify(community.state);
  const city = slugify(community.city);
  const name = getCommunitySlug(community.name);
  return `/senior-living/${state}/${city}/${name}`;
}
