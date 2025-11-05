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
  // Add ID to ensure uniqueness if needed
  return baseSlug || `community-${community.id}`;
}