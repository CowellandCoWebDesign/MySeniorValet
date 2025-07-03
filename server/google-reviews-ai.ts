import OpenAI from "openai";
import { db } from './db';
import { communities } from '../shared/schema';
import { eq } from 'drizzle-orm';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface GoogleReview {
  author: string;
  rating: number;
  text: string;
  date: string;
  relativeTime: string;
}

interface AIReviewAnalysis {
  summary: string;
  amenitiesDiscovered: string[];
  servicesDiscovered: string[];
  strengths: string[];
  concerns: string[];
  averageSentiment: number; // 1-5 scale
}

export class GoogleReviewsAI {
  
  async enrichCommunityWithReviews(communityId: number): Promise<{
    reviews: GoogleReview[];
    analysis: AIReviewAnalysis;
    success: boolean;
    error?: string;
  }> {
    try {
      // Get community details
      const [community] = await db.select().from(communities).where(eq(communities.id, communityId));
      if (!community) {
        return { reviews: [], analysis: this.getEmptyAnalysis(), success: false, error: 'Community not found' };
      }

      // Search for the place on Google
      const searchQuery = `${community.name} ${community.address}`;
      const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${GOOGLE_API_KEY}`;
      
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      
      if (!searchData.results || searchData.results.length === 0) {
        return { reviews: [], analysis: this.getEmptyAnalysis(), success: false, error: 'Place not found on Google' };
      }

      const place = searchData.results[0];
      
      // Get detailed place information with reviews
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,reviews,rating,user_ratings_total&key=${GOOGLE_API_KEY}`;
      
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();
      
      if (!detailsData.result || !detailsData.result.reviews) {
        return { reviews: [], analysis: this.getEmptyAnalysis(), success: false, error: 'No reviews found' };
      }

      // Process reviews
      const reviews: GoogleReview[] = detailsData.result.reviews.map((review: any) => ({
        author: review.author_name,
        rating: review.rating,
        text: review.text,
        date: new Date(review.time * 1000).toLocaleDateString(),
        relativeTime: review.relative_time_description
      }));

      // Analyze reviews with AI
      const analysis = await this.analyzeReviewsWithAI(reviews, community.name);

      // Update community with discovered amenities and services
      await this.updateCommunityFromAnalysis(communityId, analysis);

      return {
        reviews,
        analysis,
        success: true
      };

    } catch (error) {
      console.error(`Error enriching reviews for community ${communityId}:`, error);
      return { 
        reviews: [], 
        analysis: this.getEmptyAnalysis(), 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private async analyzeReviewsWithAI(reviews: GoogleReview[], communityName: string): Promise<AIReviewAnalysis> {
    try {
      const reviewTexts = reviews.map(r => `${r.rating}/5 stars: ${r.text}`).join('\n\n');
      
      const prompt = `Analyze these Google reviews for ${communityName}, a senior living community. Extract specific information:

REVIEWS:
${reviewTexts}

Please provide a JSON response with:
{
  "summary": "2-3 sentence summary of what residents/families say about this community",
  "amenitiesDiscovered": ["specific amenities mentioned in reviews like 'Swimming Pool', 'Library', 'Garden'"],
  "servicesDiscovered": ["services mentioned like 'Physical Therapy', 'Medication Management', 'Transportation'"],
  "strengths": ["top 3-4 positive aspects mentioned"],
  "concerns": ["any concerns or areas for improvement mentioned"],
  "averageSentiment": 3.5
}

Focus on concrete details mentioned in reviews, not generic statements.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert at analyzing senior living community reviews to extract factual information about amenities, services, and resident experiences. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        summary: analysis.summary || "Analysis pending",
        amenitiesDiscovered: analysis.amenitiesDiscovered || [],
        servicesDiscovered: analysis.servicesDiscovered || [],
        strengths: analysis.strengths || [],
        concerns: analysis.concerns || [],
        averageSentiment: analysis.averageSentiment || 3.0
      };

    } catch (error) {
      console.error('Error analyzing reviews with AI:', error);
      return this.getEmptyAnalysis();
    }
  }

  private async updateCommunityFromAnalysis(communityId: number, analysis: AIReviewAnalysis): Promise<void> {
    try {
      // Get current community data
      const [community] = await db.select().from(communities).where(eq(communities.id, communityId));
      if (!community) return;

      // Merge discovered amenities and services with existing ones
      const currentAmenities = community.amenities || [];
      const currentServices = community.services || [];
      
      const newAmenities = Array.from(new Set([...currentAmenities, ...analysis.amenitiesDiscovered]));
      const newServices = Array.from(new Set([...currentServices, ...analysis.servicesDiscovered]));

      // Create proper review snippets format for database
      const reviewSnippets = analysis.strengths.slice(0, 3).map((strength, index) => ({
        text: strength,
        rating: 5, // Strengths are generally positive
        author: "Community Highlights",
        date: new Date().toLocaleDateString(),
        isPositive: true
      }));

      // Update community with AI-discovered information
      await db
        .update(communities)
        .set({
          amenities: newAmenities,
          services: newServices,
          googleReviewSnippets: reviewSnippets,
        })
        .where(eq(communities.id, communityId));

      console.log(`Updated community ${communityId} with AI-discovered amenities and services`);
      
    } catch (error) {
      console.error(`Error updating community from analysis:`, error);
    }
  }

  private getEmptyAnalysis(): AIReviewAnalysis {
    return {
      summary: "Review analysis pending",
      amenitiesDiscovered: [],
      servicesDiscovered: [],
      strengths: [],
      concerns: [],
      averageSentiment: 3.0
    };
  }
}

export const googleReviewsAI = new GoogleReviewsAI();