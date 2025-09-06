/**
 * Stock Photo Theme Options for MySeniorValet
 * NO STOCK PHOTOS - Only real photos from official sources
 */

export const STOCK_PHOTO_THEMES = {
  // NO DEFAULT PHOTOS - Only authentic community photos allowed
  no_defaults: {
    name: "Authentic Only",
    description: "No stock photos - only real photos from official sources",
    photos: [],
    colors: ["#4A90E2", "#7FD8B9", "#F5A623", "#FFFFFF"]
  }
};

// Get default photos for a community (returns empty array - no stock photos)
export function getDefaultPhotosForCommunity(
  careTypes?: string[],
  location?: string,
  priceRange?: string
): string[] {
  // NO STOCK PHOTOS - return empty array
  return [];
}

// Export current theme (always "no_defaults" now)
export const CURRENT_THEME = 'no_defaults';
export const DEFAULT_COMMUNITY_PHOTOS = STOCK_PHOTO_THEMES.no_defaults.photos;