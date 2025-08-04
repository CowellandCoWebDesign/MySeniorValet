/**
 * Mapbox Static Images API (50k requests/month free)
 * Generates static map images of community locations
 */

export async function mapboxStaticPhoto(community) {
  if (!process.env.MAPBOX_TOKEN) {
    console.warn('Mapbox token not configured');
    return null;
  }

  try {
    // Get coordinates if available, otherwise geocode
    let coordinates = null;
    
    if (community.latitude && community.longitude) {
      coordinates = { lat: community.latitude, lng: community.longitude };
    } else {
      coordinates = await geocodeAddress(`${community.address}, ${community.city}, ${community.state}`);
    }

    if (!coordinates) {
      console.log(`Could not geocode address for ${community.name}`);
      return null;
    }

    // Generate static map image URL
    const mapboxUrl = constructMapboxStaticUrl(
      coordinates.lng,
      coordinates.lat,
      community.name
    );

    // Verify the image is accessible
    const response = await fetch(mapboxUrl, { method: 'HEAD' });
    
    if (response.ok) {
      console.log(`Generated Mapbox static image for ${community.name}`);
      return mapboxUrl;
    } else {
      throw new Error(`Mapbox image not accessible: ${response.status}`);
    }

  } catch (error) {
    console.error('Mapbox static photo error:', error.message);
    return null;
  }
}

/**
 * Construct Mapbox Static Images API URL
 */
function constructMapboxStaticUrl(lng, lat, communityName) {
  const accessToken = process.env.MAPBOX_TOKEN;
  
  // Style: satellite streets for better community visibility
  const style = 'mapbox/satellite-streets-v12';
  
  // Add a pin marker for the community
  const marker = `pin-l-hospital+ff0000(${lng},${lat})`;
  
  // Image dimensions and zoom level
  const width = 800;
  const height = 600;
  const zoom = 16; // Close zoom to show building details
  
  // Construct URL
  const staticUrl = `https://api.mapbox.com/styles/v1/${style}/static/${marker}/${lng},${lat},${zoom}/${width}x${height}?access_token=${accessToken}`;
  
  return staticUrl;
}

/**
 * Simple geocoding using Nominatim (free)
 */
async function geocodeAddress(address) {
  try {
    const encodedAddress = encodeURIComponent(address);
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;
    
    const response = await fetch(geocodeUrl, {
      headers: {
        'User-Agent': 'MySeniorValet-SeniorLiving/1.0'
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