/**
 * Yelp Fusion API Integration (5k calls/day free, then $0.008/call)
 * Enriches communities with Yelp ratings, reviews, and photos
 */

export async function yelpLookup(community) {
  if (!process.env.YELP_API_KEY) {
    console.warn('Yelp API key not configured');
    return null;
  }

  try {
    // Search for the business on Yelp
    const searchUrl = 'https://api.yelp.com/v3/businesses/search';
    const searchParams = new URLSearchParams({
      term: community.name,
      location: `${community.address}, ${community.city}, ${community.state}`,
      categories: 'seniorlivingfacilities,nursinghomes,assistedliving',
      limit: '5',
      radius: '1000' // 1km radius
    });

    const searchResponse = await fetch(`${searchUrl}?${searchParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.YELP_API_KEY}`,
        'Accept': 'application/json'
      }
    });

    if (!searchResponse.ok) {
      throw new Error(`Yelp search failed: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    const businesses = searchData.businesses || [];

    // Find best match
    let bestMatch = null;
    let bestScore = 0;

    for (const business of businesses) {
      const nameScore = calculateSimilarity(
        community.name.toLowerCase(),
        business.name.toLowerCase()
      );
      
      const addressScore = business.location?.address1
        ? calculateSimilarity(
            community.address.toLowerCase(),
            business.location.address1.toLowerCase()
          )
        : 0;

      const totalScore = nameScore + (addressScore * 0.4);
      
      if (totalScore > bestScore && totalScore > 0.5) {
        bestScore = totalScore;
        bestMatch = business;
      }
    }

    if (!bestMatch) {
      console.log(`No Yelp match found for ${community.name}`);
      return null;
    }

    // Get business details for more photos and reviews
    const detailsUrl = `https://api.yelp.com/v3/businesses/${bestMatch.id}`;
    const detailsResponse = await fetch(detailsUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.YELP_API_KEY}`,
        'Accept': 'application/json'
      }
    });

    let detailsData = bestMatch;
    if (detailsResponse.ok) {
      detailsData = await detailsResponse.json();
    }

    // Extract photos (remove Yelp default images)
    const photos = [];
    if (detailsData.photos && detailsData.photos.length > 0) {
      for (const photo of detailsData.photos.slice(0, 4)) {
        // Skip generic Yelp placeholder images
        if (!photo.includes('yelp.com/bphoto/placeholder')) {
          photos.push(photo);
        }
      }
    }

    // Get reviews for additional insights
    const reviewsUrl = `https://api.yelp.com/v3/businesses/${bestMatch.id}/reviews`;
    let reviews = [];
    
    try {
      const reviewsResponse = await fetch(reviewsUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.YELP_API_KEY}`,
          'Accept': 'application/json'
        }
      });

      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        reviews = reviewsData.reviews || [];
      }
    } catch (reviewError) {
      console.warn('Failed to fetch Yelp reviews:', reviewError.message);
    }

    // Determine cost (free for first 5k calls/day)
    const cost = searchData.total > 5000 ? 0.008 : 0;

    return {
      photos,
      rating: detailsData.rating || null,
      reviewCount: detailsData.review_count || 0,
      yelpId: bestMatch.id,
      yelpUrl: detailsData.url,
      phone: detailsData.display_phone || null,
      categories: detailsData.categories?.map(c => c.title) || [],
      reviews: reviews.slice(0, 3).map(review => ({
        rating: review.rating,
        text: review.text,
        author: review.user?.name || 'Anonymous',
        date: review.time_created
      })),
      matchScore: bestScore,
      cost
    };

  } catch (error) {
    console.error('Yelp lookup error:', error.message);
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