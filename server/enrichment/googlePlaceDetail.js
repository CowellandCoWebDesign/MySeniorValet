/**
 * Google Places API Integration ($0.017/call)
 * Used only when < 3 photos from other sources
 */

export async function googlePlaceDetail(community) {
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    console.warn('Google Places API key not configured');
    return null;
  }

  try {
    // First, search for the place
    const textSearchUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
    const searchParams = new URLSearchParams({
      query: `${community.name} ${community.address} ${community.city} ${community.state}`,
      key: process.env.GOOGLE_PLACES_API_KEY,
      type: 'health'
    });

    const searchResponse = await fetch(`${textSearchUrl}?${searchParams}`);

    if (!searchResponse.ok) {
      throw new Error(`Google Places search failed: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    
    if (searchData.status !== 'OK' || !searchData.results?.length) {
      console.log(`No Google Places results for ${community.name}`);
      return null;
    }

    // Find best match
    let bestMatch = null;
    let bestScore = 0;

    for (const place of searchData.results.slice(0, 3)) {
      const nameScore = calculateSimilarity(
        community.name.toLowerCase(),
        place.name.toLowerCase()
      );
      
      const addressScore = place.formatted_address
        ? calculateSimilarity(
            community.address.toLowerCase(),
            place.formatted_address.toLowerCase()
          )
        : 0;

      const totalScore = nameScore + (addressScore * 0.3);
      
      if (totalScore > bestScore && totalScore > 0.6) {
        bestScore = totalScore;
        bestMatch = place;
      }
    }

    if (!bestMatch) {
      console.log(`No good Google Places match for ${community.name}`);
      return null;
    }

    // Get place details including photos
    const detailsUrl = 'https://maps.googleapis.com/maps/api/place/details/json';
    const detailsParams = new URLSearchParams({
      place_id: bestMatch.place_id,
      fields: 'photos,rating,reviews,formatted_phone_number,website,opening_hours',
      key: process.env.GOOGLE_PLACES_API_KEY
    });

    const detailsResponse = await fetch(`${detailsUrl}?${detailsParams}`);

    if (!detailsResponse.ok) {
      throw new Error(`Google Places details failed: ${detailsResponse.status}`);
    }

    const detailsData = await detailsResponse.json();
    
    if (detailsData.status !== 'OK') {
      throw new Error(`Google Places details error: ${detailsData.status}`);
    }

    const place = detailsData.result;
    
    // Extract photos using Google Places Photo API
    const photos = [];
    if (place.photos && place.photos.length > 0) {
      for (const photo of place.photos.slice(0, 4)) {
        const photoUrl = constructGooglePhotoUrl(photo.photo_reference);
        photos.push(photoUrl);
      }
    }

    // Process reviews
    const reviews = [];
    if (place.reviews && place.reviews.length > 0) {
      for (const review of place.reviews.slice(0, 3)) {
        reviews.push({
          rating: review.rating,
          text: review.text,
          author: review.author_name,
          date: new Date(review.time * 1000).toISOString(),
          relativeTime: review.relative_time_description
        });
      }
    }

    return {
      photos,
      rating: place.rating || null,
      googlePlaceId: bestMatch.place_id,
      phone: place.formatted_phone_number || null,
      website: place.website || null,
      reviews,
      openingHours: place.opening_hours?.weekday_text || [],
      matchScore: bestScore
    };

  } catch (error) {
    console.error('Google Places lookup error:', error.message);
    return null;
  }
}

/**
 * Construct Google Places Photo API URL
 */
function constructGooglePhotoUrl(photoReference, maxWidth = 800) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${apiKey}`;
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