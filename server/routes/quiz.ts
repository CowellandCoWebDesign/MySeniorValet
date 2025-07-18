import { Router } from 'express';
import { db } from '../db';
import { communities } from '@shared/schema';
import { eq, and, gte, lte, like, or } from 'drizzle-orm';

const router = Router();

interface QuizAnswers {
  careLevel?: string;
  budget?: number;
  location?: string;
  amenities?: string[];
  lifestyle?: string;
  priorities?: string[];
}

interface MatchedCommunity {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  careTypes: string[];
  rating: number;
  reviewCount: number;
  phone: string;
  website: string;
  priceRange: { min: number; max: number };
  photos: string[];
  description: string;
  matchScore: number;
  matchReasons: string[];
}

// Quiz matching endpoint
router.post('/quiz-matches', async (req, res) => {
  try {
    const answers: QuizAnswers = req.body;
    console.log('Quiz answers received:', answers);

    // Build search conditions based on quiz answers
    const conditions: any[] = [];
    
    // Care level matching
    if (answers.careLevel) {
      const careTypeMap: Record<string, string> = {
        'independent': 'Independent Living',
        'assisted': 'Assisted Living',
        'memory': 'Memory Care',
        'skilled': 'Skilled Nursing'
      };
      
      const careType = careTypeMap[answers.careLevel];
      if (careType) {
        conditions.push(like(communities.careTypes, `%${careType}%`));
      }
    }

    // Budget matching (if provided)
    if (answers.budget && typeof answers.budget === 'number') {
      const budgetMin = answers.budget - 1000; // $1000 buffer
      const budgetMax = answers.budget + 1000;
      
      // Match communities within budget range
      conditions.push(
        and(
          gte(communities.priceRangeMin, budgetMin),
          lte(communities.priceRangeMax, budgetMax)
        )
      );
    }

    // Location matching
    if (answers.location) {
      const locationConditions = [
        like(communities.city, `%${answers.location}%`),
        like(communities.state, `%${answers.location}%`),
        like(communities.zipCode, `%${answers.location}%`)
      ];
      conditions.push(or(...locationConditions));
    }

    // Base query - limit to 20 results for performance
    let query = db.select().from(communities).limit(20);
    
    // Apply conditions if any
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const matchedCommunities = await query;

    // Calculate match scores and reasons
    const enrichedResults: MatchedCommunity[] = matchedCommunities.map(community => {
      let matchScore = 70; // Base score
      const matchReasons: string[] = [];

      // Care level matching
      if (answers.careLevel) {
        const careTypeMap: Record<string, string> = {
          'independent': 'Independent Living',
          'assisted': 'Assisted Living',
          'memory': 'Memory Care',
          'skilled': 'Skilled Nursing'
        };
        
        const requiredCareType = careTypeMap[answers.careLevel];
        if (requiredCareType && community.careTypes?.includes(requiredCareType)) {
          matchScore += 15;
          matchReasons.push(`Offers ${requiredCareType}`);
        }
      }

      // Budget matching
      if (answers.budget && community.priceRangeMin && community.priceRangeMax) {
        const communityAvg = (community.priceRangeMin + community.priceRangeMax) / 2;
        const budgetDiff = Math.abs(communityAvg - answers.budget);
        
        if (budgetDiff <= 500) {
          matchScore += 10;
          matchReasons.push('Within your budget range');
        } else if (budgetDiff <= 1000) {
          matchScore += 5;
          matchReasons.push('Close to your budget');
        }
      }

      // Location matching
      if (answers.location) {
        const locationLower = answers.location.toLowerCase();
        const cityMatch = community.city?.toLowerCase().includes(locationLower);
        const stateMatch = community.state?.toLowerCase().includes(locationLower);
        
        if (cityMatch || stateMatch) {
          matchScore += 10;
          matchReasons.push(`Located in ${community.city}, ${community.state}`);
        }
      }

      // Lifestyle preferences
      if (answers.lifestyle) {
        const lifestyleBonus = calculateLifestyleMatch(answers.lifestyle, community);
        matchScore += lifestyleBonus.score;
        if (lifestyleBonus.reason) {
          matchReasons.push(lifestyleBonus.reason);
        }
      }

      // Amenity preferences
      if (answers.amenities && answers.amenities.length > 0) {
        const amenityMatches = calculateAmenityMatches(answers.amenities, community);
        matchScore += amenityMatches.score;
        matchReasons.push(...amenityMatches.reasons);
      }

      // Rating bonus
      if (community.rating && community.rating >= 4.5) {
        matchScore += 5;
        matchReasons.push('Highly rated community');
      }

      // Cap match score at 100
      matchScore = Math.min(matchScore, 100);

      return {
        id: community.id,
        name: community.name,
        address: community.address || '',
        city: community.city || '',
        state: community.state || '',
        zipCode: community.zipCode || '',
        careTypes: community.careTypes ? community.careTypes.split(',') : [],
        rating: community.rating || 0,
        reviewCount: community.reviewCount || 0,
        phone: community.phone || '',
        website: community.website || '',
        priceRange: {
          min: community.priceRangeMin || 0,
          max: community.priceRangeMax || 0
        },
        photos: community.photos ? community.photos.split(',') : [],
        description: community.description || '',
        matchScore,
        matchReasons
      };
    });

    // Sort by match score (highest first)
    enrichedResults.sort((a, b) => b.matchScore - a.matchScore);

    console.log(`Found ${enrichedResults.length} matching communities`);
    res.json(enrichedResults);

  } catch (error) {
    console.error('Error in quiz matching:', error);
    res.status(500).json({ error: 'Failed to find matching communities' });
  }
});

// Helper function to calculate lifestyle match
function calculateLifestyleMatch(lifestyle: string, community: any): { score: number; reason?: string } {
  const amenities = community.amenities || '';
  const description = community.description || '';
  const combinedText = `${amenities} ${description}`.toLowerCase();

  switch (lifestyle) {
    case 'active':
      if (combinedText.includes('fitness') || combinedText.includes('gym') || combinedText.includes('activities')) {
        return { score: 8, reason: 'Active lifestyle amenities available' };
      }
      break;
    case 'quiet':
      if (combinedText.includes('peaceful') || combinedText.includes('quiet') || combinedText.includes('serene')) {
        return { score: 8, reason: 'Quiet and peaceful environment' };
      }
      break;
    case 'urban':
      if (combinedText.includes('urban') || combinedText.includes('downtown') || combinedText.includes('city')) {
        return { score: 8, reason: 'Urban location with city conveniences' };
      }
      break;
    case 'luxury':
      if (combinedText.includes('luxury') || combinedText.includes('premium') || combinedText.includes('upscale')) {
        return { score: 8, reason: 'Luxury amenities and services' };
      }
      break;
  }

  return { score: 0 };
}

// Helper function to calculate amenity matches
function calculateAmenityMatches(amenities: string[], community: any): { score: number; reasons: string[] } {
  const communityAmenities = (community.amenities || '').toLowerCase();
  const description = (community.description || '').toLowerCase();
  const combinedText = `${communityAmenities} ${description}`;

  let score = 0;
  const reasons: string[] = [];

  const amenityMap: Record<string, string[]> = {
    'fitness': ['fitness', 'gym', 'exercise', 'workout'],
    'dining': ['dining', 'restaurant', 'chef', 'meals'],
    'gardens': ['garden', 'outdoor', 'landscape', 'patio'],
    'transportation': ['transportation', 'shuttle', 'bus', 'transport'],
    'activities': ['activities', 'social', 'events', 'programs'],
    'pets': ['pet', 'dog', 'cat', 'animal']
  };

  amenities.forEach(amenity => {
    const keywords = amenityMap[amenity] || [amenity];
    const found = keywords.some(keyword => combinedText.includes(keyword));
    
    if (found) {
      score += 3;
      reasons.push(`${amenity.charAt(0).toUpperCase() + amenity.slice(1)} available`);
    }
  });

  return { score, reasons };
}

export { router as quizRouter };