/**
 * Photo utility functions for handling Google Places photos
 */

/**
 * Extract photo_reference from a Google Places photo URL
 */
export function extractPhotoReference(photoUrl: string): string | null {
  try {
    const url = new URL(photoUrl);
    return url.searchParams.get('photo_reference');
  } catch {
    return null;
  }
}

/**
 * Convert Google Places photo URL to use our proxy endpoint
 */
export function getProxiedPhotoUrl(photoUrl: string, maxwidth: number = 800): string {
  const photoReference = extractPhotoReference(photoUrl);
  
  if (!photoReference) {
    // If we can't extract photo reference, return original URL as fallback
    return photoUrl;
  }
  
  return `/api/images/photo-proxy?photo_reference=${encodeURIComponent(photoReference)}&maxwidth=${maxwidth}`;
}

/**
 * Process an array of photo URLs to use proxy endpoints
 */
export function processPhotoUrls(photos: string[], maxwidth: number = 800): string[] {
  return photos.map(photo => getProxiedPhotoUrl(photo, maxwidth));
}

/**
 * Check if a URL is a Google Places photo URL
 */
export function isGooglePlacesPhotoUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === 'maps.googleapis.com' && 
           urlObj.pathname === '/maps/api/place/photo';
  } catch {
    return false;
  }
}