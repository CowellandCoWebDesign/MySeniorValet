/**
 * Foursquare Places API Integration (950 calls/day free)
 * Searches for senior living communities and enriches with photos/data
 */

export async function foursquareLookup(community) {
  if (!process.env.FOURSQUARE_API_KEY) {
    console.warn('Foursquare API key not configured');
    return null;
  }

  try {
    const query = `${community.name} ${community.city} ${community.state}`;
    const searchUrl = `https://api.foursquare.com/v3/places/search`;
    
    const searchParams = new URLSearchParams({
      query: community.name,
      near: `${community.city}, ${community.state}`,
      categories: '19014,19015,19016', // Healthcare, Senior Living categories
      limit: '5'
    });

    const searchResponse = await fetch(`${searchUrl}?${searchParams}`, {
      method: 'GET',
      headers: {
        'Authorization': process.env.FOURSQUARE_API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!searchResponse.ok) {
      throw new Error(`Foursquare search failed: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    const places = searchData.results || [];

    // Find best match based on name similarity and location
    let bestMatch = null;
    let bestScore = 0;

    for (const place of places) {
      const nameScore = calculateSimilarity(
        community.name.toLowerCase(),
        place.name.toLowerCase()
      );
      
      // Bonus for address match
      const addressScore = place.location?.formatted_address
        ? calculateSimilarity(
            community.address.toLowerCase(),
            place.location.formatted_address.toLowerCase()
          )
        : 0;

      const totalScore = nameScore + (addressScore * 0.3);
      
      if (totalScore > bestScore && totalScore > 0.6) {
        bestScore = totalScore;
        bestMatch = place;
      }
    }

    if (!bestMatch) {
      console.log(`No Foursquare match found for ${community.name}`);
      return null;
    }

    // Get place details including photos
    const detailsUrl = `https://api.foursquare.com/v3/places/${bestMatch.fsq_id}`;
    const detailsResponse = await fetch(detailsUrl, {
      method: 'GET',
      headers: {
        'Authorization': process.env.FOURSQUARE_API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!detailsResponse.ok) {
      console.warn(`Foursquare details failed: ${detailsResponse.status}`);
      return { photos: [], rating: null };
    }

    const detailsData = await detailsResponse.json();
    
    // Extract photos
    const photos = [];
    if (detailsData.photos && detailsData.photos.length > 0) {
      for (const photo of detailsData.photos.slice(0, 3)) {
        // Foursquare photo URL construction
        const photoUrl = `${photo.prefix}800x600${photo.suffix}`;
        photos.push(photoUrl);
      }
    }

    return {
      photos,
      rating: detailsData.rating || null,
      foursquareId: bestMatch.fsq_id,
      phone: detailsData.tel || null,
      website: detailsData.website || null,
      categories: detailsData.categories?.map(c => c.name) || [],
      matchScore: bestScore
    };

  } catch (error) {
    console.error('Foursquare lookup error:', error.message);
    return null;
  }
}

/**
 * Calculate string similarity (0-1 scale)
 */
function calculateSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  return (longer.length - editDistance(longer, shorter)) / longer.length;
}

/**
 * Calculate edit distance between two strings
 */
function editDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}