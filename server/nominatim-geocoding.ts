/**
 * Nominatim (OpenStreetMap) Geocoding Service
 * Free geocoding API that covers all cities worldwide
 * No API key required - respects rate limits
 */

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  type: string;
  importance: number;
  boundingbox: string[];
  place_id: number;
  osm_id: number;
}

// Cache geocoding results to minimize API calls
const geocodeCache = new Map<string, { lat: number; lng: number }>();

/**
 * Geocode a location using OpenStreetMap's Nominatim API
 * This provides comprehensive coverage for all cities in US, Mexico, and Canada
 */
export async function geocodeWithNominatim(location: string): Promise<{ lat: number; lng: number } | null> {
  try {
    // Check cache first
    const cacheKey = location.toLowerCase().trim();
    if (geocodeCache.has(cacheKey)) {
      console.log(`📍 Geocoding cache hit for: ${location}`);
      return geocodeCache.get(cacheKey)!;
    }

    // Build query - add country hints for better results
    let query = location;
    const normalized = location.toLowerCase();
    
    // If no country specified, add US as default for better results
    if (!normalized.includes('usa') && !normalized.includes('united states') && 
        !normalized.includes('canada') && !normalized.includes('mexico')) {
      // Check if it looks like a US state abbreviation
      const hasStateCode = /\b[A-Z]{2}\b/.test(location);
      if (hasStateCode || normalized.includes(', ')) {
        query = `${location}, USA`;
      }
    }

    // Nominatim API endpoint (free, no key required)
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.append('q', query);
    url.searchParams.append('format', 'json');
    url.searchParams.append('limit', '1');
    url.searchParams.append('countrycodes', 'us,ca,mx'); // Limit to North America
    
    console.log(`🔍 Geocoding via Nominatim: ${query}`);
    
    // Make request with proper headers (required by Nominatim)
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'MySeniorValet/1.0 (https://myseniorvalet.com)',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`Nominatim API error: ${response.status}`);
      return null;
    }

    const data: NominatimResult[] = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      const coordinates = {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      };
      
      // Cache the result
      geocodeCache.set(cacheKey, coordinates);
      
      console.log(`✅ Geocoded successfully: ${location} -> ${coordinates.lat}, ${coordinates.lng}`);
      console.log(`   Display name: ${result.display_name}`);
      
      return coordinates;
    }
    
    console.log(`❌ No results found for: ${location}`);
    return null;
  } catch (error) {
    console.error('Nominatim geocoding error:', error);
    return null;
  }
}

/**
 * Search for city suggestions using Nominatim
 * Returns multiple suggestions for autocomplete
 */
export async function searchCitySuggestions(query: string, limit: number = 5): Promise<Array<{
  name: string;
  lat: number;
  lng: number;
  displayName: string;
}>> {
  try {
    // Don't search for very short queries
    if (query.length < 2) return [];

    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.append('q', query);
    url.searchParams.append('format', 'json');
    url.searchParams.append('limit', limit.toString());
    url.searchParams.append('countrycodes', 'us,ca,mx'); // North America only
    url.searchParams.append('featuretype', 'city'); // Cities only
    
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'MySeniorValet/1.0',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) return [];

    const data: NominatimResult[] = await response.json();
    
    return data.map(result => {
      // Parse display name to get clean city, state format
      const parts = result.display_name.split(',');
      let name = parts[0].trim();
      
      // Add state/province if available
      if (parts.length > 1) {
        const statePart = parts.find(p => 
          p.trim().length === 2 || // State code
          p.trim().includes('Province') ||
          ['California', 'Texas', 'Florida', 'New York', 'Oregon'].some(s => p.includes(s))
        );
        if (statePart) {
          name = `${parts[0].trim()}, ${statePart.trim()}`;
        }
      }
      
      return {
        name,
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        displayName: result.display_name
      };
    });
  } catch (error) {
    console.error('Error fetching city suggestions:', error);
    return [];
  }
}

/**
 * Clear the geocoding cache (useful for testing)
 */
export function clearGeocodeCache() {
  geocodeCache.clear();
  console.log('🗑️ Geocoding cache cleared');
}

// Export a unified geocoding function that uses local data first, then Nominatim
export async function geocodeAnyLocation(location: string): Promise<{ lat: number; lng: number } | null> {
  // First try our local geocoding data (fast, no API call)
  const { geocodeLocation } = await import('./geocoding-data');
  const localResult = geocodeLocation(location);
  
  if (localResult) {
    console.log(`📍 Found in local database: ${location}`);
    return localResult;
  }
  
  // Fall back to Nominatim for comprehensive coverage
  console.log(`🌍 Searching globally for: ${location}`);
  return geocodeWithNominatim(location);
}