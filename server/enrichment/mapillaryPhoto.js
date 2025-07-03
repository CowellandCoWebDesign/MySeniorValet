/**
 * Mapillary Street-Level Photos (Unlimited Free)
 * Gets street-level photos near senior living communities
 */

export async function mapillaryPhoto(community) {
  if (!process.env.MAPILLARY_TOKEN) {
    console.warn('Mapillary token not configured');
    return [];
  }

  try {
    // First, get coordinates if we don't have them
    let coordinates = null;
    
    if (community.latitude && community.longitude) {
      coordinates = { lat: community.latitude, lng: community.longitude };
    } else {
      // Geocode the address
      coordinates = await geocodeAddress(`${community.address}, ${community.city}, ${community.state}`);
    }

    if (!coordinates) {
      console.log(`Could not geocode address for ${community.name}`);
      return [];
    }

    // Search for images near the community (within 100m radius)
    const searchUrl = 'https://graph.mapillary.com/images';
    const searchParams = new URLSearchParams({
      access_token: process.env.MAPILLARY_TOKEN,
      bbox: createBoundingBox(coordinates.lat, coordinates.lng, 100), // 100m radius
      limit: '10',
      fields: 'id,thumb_1024_url,thumb_2048_url,computed_geometry'
    });

    const response = await fetch(`${searchUrl}?${searchParams}`);

    if (!response.ok) {
      throw new Error(`Mapillary API failed: ${response.status}`);
    }

    const data = await response.json();
    const images = data.data || [];

    // Filter and process images
    const photos = [];
    
    for (const image of images.slice(0, 6)) { // Get up to 6 photos
      if (image.thumb_2048_url) {
        photos.push(image.thumb_2048_url);
      } else if (image.thumb_1024_url) {
        photos.push(image.thumb_1024_url);
      }
    }

    console.log(`Found ${photos.length} Mapillary photos for ${community.name}`);
    return photos;

  } catch (error) {
    console.error('Mapillary photo lookup error:', error.message);
    return [];
  }
}

/**
 * Create bounding box around coordinates (in meters)
 */
function createBoundingBox(lat, lng, radiusMeters) {
  // Rough conversion: 1 degree ≈ 111,000 meters
  const latDelta = radiusMeters / 111000;
  const lngDelta = radiusMeters / (111000 * Math.cos(lat * Math.PI / 180));

  const minLat = lat - latDelta;
  const maxLat = lat + latDelta;
  const minLng = lng - lngDelta;
  const maxLng = lng + lngDelta;

  return `${minLng},${minLat},${maxLng},${maxLat}`;
}

/**
 * Simple geocoding using a free service
 */
async function geocodeAddress(address) {
  try {
    // Using Nominatim (OpenStreetMap) - free geocoding
    const encodedAddress = encodeURIComponent(address);
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;
    
    const response = await fetch(geocodeUrl, {
      headers: {
        'User-Agent': 'TrueView-SeniorLiving/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`);
    }

    const results = await response.json();
    
    if (results && results.length > 0) {
      const result = results[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error.message);
    return null;
  }
}