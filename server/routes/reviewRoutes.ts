import { type Express } from "express";
import { db } from "../db";
import { reviews, communities, users } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { isAuthenticated as requireAuth } from "../auth-middleware";
import { insertReviewSchema } from "@shared/schema";
import { z } from "zod";
import { PerplexityAIService } from "../perplexity-ai-service";

export function registerReviewRoutes(app: Express) {
  // Get reviews for a community
  app.get('/api/communities/:communityId/reviews', async (req, res) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const { limit = "20", offset = "0" } = req.query;

      const communityReviews = await db
        .select({
          id: reviews.id,
          communityId: reviews.communityId,
          userId: reviews.userId,
          rating: reviews.rating,
          title: reviews.title,
          content: reviews.reviewText,
          helpful: reviews.helpful,
          verified: reviews.verified,
          createdAt: reviews.createdAt
        })
        .from(reviews)
        .where(eq(reviews.communityId, communityId))
        .orderBy(desc(reviews.createdAt))
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string));

      res.json(communityReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  });

  // Create a review
  app.post('/api/reviews', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const validatedData = insertReviewSchema.parse(req.body);

      // Check if user has already reviewed this community
      const [existingReview] = await db
        .select()
        .from(reviews)
        .where(and(
          eq(reviews.userId, userId),
          eq(reviews.communityId, validatedData.communityId)
        ))
        .limit(1);

      if (existingReview) {
        return res.status(400).json({ message: 'You have already reviewed this community' });
      }

      const [newReview] = await db
        .insert(reviews)
        .values({
          ...validatedData,
          userId,
          verified: true,
          helpful: 0
        })
        .returning();

      // Update community rating and review count
      const allReviews = await db
        .select({ rating: reviews.rating })
        .from(reviews)
        .where(eq(reviews.communityId, validatedData.communityId));

      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

      await db
        .update(communities)
        .set({
          rating: avgRating.toFixed(1),
          reviewCount: allReviews.length,
          updatedAt: new Date()
        })
        .where(eq(communities.id, validatedData.communityId));

      res.status(201).json(newReview);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid review data', errors: error.errors });
      }
      console.error('Error creating review:', error);
      res.status(500).json({ message: 'Failed to create review' });
    }
  });

  // Update a review
  app.patch('/api/reviews/:reviewId', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const reviewId = parseInt(req.params.reviewId);
      const { rating, title, content } = req.body;

      // Verify review belongs to user
      const [review] = await db
        .select()
        .from(reviews)
        .where(eq(reviews.id, reviewId))
        .limit(1);

      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }

      if (review.userId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const updates: any = { updatedAt: new Date() };
      if (rating !== undefined) updates.rating = rating;
      if (title !== undefined) updates.title = title;
      if (content !== undefined) updates.content = content;

      const [updatedReview] = await db
        .update(reviews)
        .set(updates)
        .where(eq(reviews.id, reviewId))
        .returning();

      // Update community rating if rating changed
      if (rating !== undefined && rating !== review.rating) {
        const allReviews = await db
          .select({ rating: reviews.rating })
          .from(reviews)
          .where(eq(reviews.communityId, review.communityId));

        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        await db
          .update(communities)
          .set({
            rating: avgRating.toFixed(1),
            updatedAt: new Date()
          })
          .where(eq(communities.id, review.communityId));
      }

      res.json(updatedReview);
    } catch (error) {
      console.error('Error updating review:', error);
      res.status(500).json({ message: 'Failed to update review' });
    }
  });

  // Delete a review
  app.delete('/api/reviews/:reviewId', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const reviewId = parseInt(req.params.reviewId);

      // Get review details
      const [review] = await db
        .select()
        .from(reviews)
        .where(eq(reviews.id, reviewId))
        .limit(1);

      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }

      // Check permissions (user can delete own review, admin can delete any)
      if (review.userId !== userId && userRole !== 'admin' && userRole !== 'super_admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      await db
        .delete(reviews)
        .where(eq(reviews.id, reviewId));

      // Update community rating and count
      const remainingReviews = await db
        .select({ rating: reviews.rating })
        .from(reviews)
        .where(eq(reviews.communityId, review.communityId));

      if (remainingReviews.length > 0) {
        const avgRating = remainingReviews.reduce((sum, r) => sum + r.rating, 0) / remainingReviews.length;
        
        await db
          .update(communities)
          .set({
            rating: avgRating.toFixed(1),
            reviewCount: remainingReviews.length,
            updatedAt: new Date()
          })
          .where(eq(communities.id, review.communityId));
      } else {
        // No reviews left, reset rating
        await db
          .update(communities)
          .set({
            rating: null,
            reviewCount: 0,
            updatedAt: new Date()
          })
          .where(eq(communities.id, review.communityId));
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({ message: 'Failed to delete review' });
    }
  });

  // Mark review as helpful
  app.post('/api/reviews/:reviewId/helpful', async (req, res) => {
    try {
      const reviewId = parseInt(req.params.reviewId);

      const [review] = await db
        .select()
        .from(reviews)
        .where(eq(reviews.id, reviewId))
        .limit(1);

      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }

      const [updated] = await db
        .update(reviews)
        .set({
          helpful: (review.helpful || 0) + 1
        })
        .where(eq(reviews.id, reviewId))
        .returning();

      res.json({ helpful: updated.helpful });
    } catch (error) {
      console.error('Error marking review helpful:', error);
      res.status(500).json({ message: 'Failed to mark review as helpful' });
    }
  });

  // Get user's reviews
  app.get('/api/user/reviews', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const userReviews = await db
        .select({
          review: reviews,
          community: {
            id: communities.id,
            name: communities.name,
            city: communities.city,
            state: communities.state
          }
        })
        .from(reviews)
        .innerJoin(communities, eq(reviews.communityId, communities.id))
        .where(eq(reviews.userId, userId))
        .orderBy(desc(reviews.createdAt));

      res.json(userReviews);
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      res.status(500).json({ message: 'Failed to fetch user reviews' });
    }
  });

  // Report review (for inappropriate content)
  app.post('/api/reviews/:reviewId/report', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const reviewId = parseInt(req.params.reviewId);
      const { reason, details } = req.body;

      if (!reason) {
        return res.status(400).json({ message: 'Report reason is required' });
      }

      // TODO: Implement review reporting system
      // For now, just log and return success
      console.log(`Review ${reviewId} reported by user ${userId} for: ${reason}`);

      res.json({ success: true, message: 'Review reported successfully' });
    } catch (error) {
      console.error('Error reporting review:', error);
      res.status(500).json({ message: 'Failed to report review' });
    }
  });

  // Fetch external reviews using Perplexity AI
  app.post('/api/communities/:communityId/reviews/fetch-external', async (req, res) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const perplexity = new PerplexityAIService();

      if (!perplexity.isConfigured()) {
        return res.status(400).json({ 
          message: 'Perplexity AI is not configured',
          fallbackData: true 
        });
      }

      // Get community details
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);

      if (!community) {
        return res.status(404).json({ message: 'Community not found' });
      }

      // Search for reviews using Perplexity with enhanced prompt
      const searchQuery = `Find ALL reviews and ratings for "${community.name}" senior living community at ${community.address}, ${community.city}, ${community.state} ${community.zipCode}. Search Google, Yelp, Care.com, SeniorAdvisor, A Place for Mom, Facebook, and any other review sites. Include:
        1. Google Reviews: Overall rating (X out of 5 stars), total review count, and actual review quotes
        2. Yelp: Overall rating, review count, and specific review excerpts
        3. Care.com: Ratings and any available reviews
        4. SeniorAdvisor.com: Ratings and review content
        5. A Place for Mom: Ratings and reviews
        6. Facebook Reviews: Ratings and review text if available
        7. Any other review platforms with this community
        8. Direct links to each review page
        IMPORTANT: Include ALL reviews from any year, not just recent ones. Search thoroughly across all platforms. If a community has reviews from 2020, 2021, 2022, 2023, 2024, or 2025, include them all.`;
      
      const context = `${community.name} located at ${community.address}, ${community.city}, ${community.state} ${community.zipCode}`;
      
      console.log('Fetching external reviews for:', context);
      const result = await perplexity.searchRealTime(searchQuery, context);

      // Parse the response to extract review data
      const extractedData = {
        googleRating: extractGoogleRating(result.summary),
        yelpRating: extractYelpRating(result.summary),
        externalReviews: extractReviewSnippets(result.summary),
        sources: result.sources || [],
        lastUpdated: new Date().toISOString(),
        images: result.images || [],
        rawSummary: result.summary // Keep raw summary for debugging
      };

      // Update community with fresh review data
      const updateData: any = {
        lastExternalReviewFetch: new Date(),
        updatedAt: new Date()
      };

      // Update ratings if found
      if (extractedData.googleRating) {
        updateData.googleRating = extractedData.googleRating.rating;
        updateData.googleReviewCount = extractedData.googleRating.count;
      }

      if (extractedData.yelpRating) {
        updateData.yelpRating = extractedData.yelpRating.rating;
        updateData.yelpReviewCount = extractedData.yelpRating.count;
      }

      // Store extracted reviews in JSON fields
      if (extractedData.externalReviews.yelp?.length > 0) {
        updateData.yelpReviews = extractedData.externalReviews.yelp;
      }
      if (extractedData.externalReviews.carecom?.length > 0) {
        updateData.careComReviews = extractedData.externalReviews.carecom;
      }
      if (extractedData.externalReviews.seniorAdvisor?.length > 0) {
        updateData.seniorAdvisorReviews = extractedData.externalReviews.seniorAdvisor;
      }
      if (extractedData.externalReviews.aplaceformom?.length > 0) {
        updateData.aplaceformomReviews = extractedData.externalReviews.aplaceformom;
      }

      await db
        .update(communities)
        .set(updateData)
        .where(eq(communities.id, communityId));

      res.json({
        success: true,
        data: extractedData,
        message: 'External reviews fetched successfully',
        poweredBy: 'Perplexity AI',
        disclaimer: 'Reviews are sourced from third-party platforms and may not reflect current conditions'
      });
    } catch (error) {
      console.error('Error fetching external reviews:', error);
      res.status(500).json({ 
        message: 'Failed to fetch external reviews',
        error: error instanceof Error ? error.message : 'Unknown error',
        fallbackData: true 
      });
    }
  });
}

// Helper functions to extract review data from Perplexity response
function extractGoogleRating(text: string): { rating: string; count: number } | null {
  // Multiple patterns to catch different formats
  const patterns = [
    /Google.*?(\d+(?:\.\d+)?)\/5.*?(\d+)\s*reviews?/i,
    /Google Reviews?:?\s*(\d+(?:\.\d+)?)\/5.*?(\d+)/i,
    /(\d+(?:\.\d+)?)\/5\s*stars?.*?Google.*?(\d+)\s*reviews?/i,
    /Google.*?rated?\s*(\d+(?:\.\d+)?)\/5.*?based on\s*(\d+)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return {
        rating: match[1],
        count: parseInt(match[2])
      };
    }
  }
  return null;
}

function extractYelpRating(text: string): { rating: number; count: number } | null {
  const patterns = [
    /Yelp.*?(\d+(?:\.\d+)?)\/5.*?(\d+)\s*reviews?/i,
    /Yelp Reviews?:?\s*(\d+(?:\.\d+)?)\/5.*?(\d+)/i,
    /(\d+(?:\.\d+)?)\/5\s*stars?.*?Yelp.*?(\d+)\s*reviews?/i,
    /Yelp.*?rated?\s*(\d+(?:\.\d+)?)\/5.*?based on\s*(\d+)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return {
        rating: parseFloat(match[1]),
        count: parseInt(match[2])
      };
    }
  }
  return null;
}

function extractReviewSnippets(text: string): {
  yelp: any[];
  carecom: any[];
  seniorAdvisor: any[];
  aplaceformom: any[];
} {
  const reviews = {
    yelp: [] as any[],
    carecom: [] as any[],
    seniorAdvisor: [] as any[],
    aplaceformom: [] as any[]
  };

  // Extract quoted reviews - looking for text in quotes
  const quotedReviews = text.match(/[""'']([^""'']{20,500})[""'']/g) || [];
  
  quotedReviews.forEach(quote => {
    const cleanQuote = quote.replace(/[""'']/g, '').trim();
    
    // Try to determine source from context
    const context = text.substring(
      Math.max(0, text.indexOf(quote) - 100),
      Math.min(text.length, text.indexOf(quote) + quote.length + 100)
    );
    
    // Categorize by source mention in nearby text
    if (/yelp/i.test(context)) {
      reviews.yelp.push({
        text: cleanQuote,
        rating: extractRatingNearQuote(context),
        source: 'Yelp',
        date: extractDateFromContext(context) || new Date().toISOString()
      });
    } else if (/care\.com/i.test(context)) {
      reviews.carecom.push({
        text: cleanQuote,
        rating: extractRatingNearQuote(context),
        source: 'Care.com',
        date: extractDateFromContext(context) || new Date().toISOString()
      });
    } else if (/senioradvisor/i.test(context)) {
      reviews.seniorAdvisor.push({
        text: cleanQuote,
        rating: extractRatingNearQuote(context),
        source: 'SeniorAdvisor',
        date: extractDateFromContext(context) || new Date().toISOString()
      });
    } else if (/place\s+for\s+mom/i.test(context)) {
      reviews.aplaceformom.push({
        text: cleanQuote,
        rating: extractRatingNearQuote(context),
        source: 'A Place for Mom',
        date: extractDateFromContext(context) || new Date().toISOString()
      });
    } else if (/google/i.test(context)) {
      // Google reviews can be added to Yelp array for now
      reviews.yelp.push({
        text: cleanQuote,
        rating: extractRatingNearQuote(context),
        source: 'Google',
        date: extractDateFromContext(context) || new Date().toISOString()
      });
    }
  });

  return reviews;
}

function extractRatingNearQuote(context: string): number {
  const ratingMatch = context.match(/(\d+(?:\.\d+)?)\/5/);
  return ratingMatch ? parseFloat(ratingMatch[1]) : 4.0; // Default to 4.0 if no rating found
}

function extractDateFromContext(context: string): string | null {
  // Look for date patterns
  const datePatterns = [
    /(\d{1,2}\/\d{1,2}\/\d{2,4})/,
    /(\w+\s+\d{1,2},?\s+\d{4})/,
    /(\d{1,2}\s+\w+\s+ago)/,
    /(\d{4}-\d{2}-\d{2})/
  ];
  
  for (const pattern of datePatterns) {
    const match = context.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}