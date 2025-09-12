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
    /Google.*?rated?\s*(\d+(?:\.\d+)?)\/5.*?based on\s*(\d+)/i,
    /Google:?\s*(\d+(?:\.\d+)?)\/5\s*(?:\(|stars?,?\s*)?(\d+)\s*(?:reviews?|ratings?)/i,
    /Google\s+(?:Reviews?|Rating)?:?\s*(\d+(?:\.\d+)?)\s*(?:out of\s*)?5\s*(?:stars?)?.*?(\d+)\s*(?:reviews?|ratings?)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return {
        rating: match[1],
        count: parseInt(match[2]) || 0
      };
    }
  }
  
  // Try to find Google rating without count
  const ratingOnlyPatterns = [
    /Google:?\s*(\d+(?:\.\d+)?)\/5/i,
    /Google\s+(?:Reviews?|Rating)?:?\s*(\d+(?:\.\d+)?)\s*(?:out of\s*)?5/i
  ];
  
  for (const pattern of ratingOnlyPatterns) {
    const match = text.match(pattern);
    if (match) {
      return {
        rating: match[1],
        count: 0
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
    /Yelp.*?rated?\s*(\d+(?:\.\d+)?)\/5.*?based on\s*(\d+)/i,
    /Yelp:?\s*(\d+(?:\.\d+)?)\/5\s*(?:\(|stars?,?\s*)?(\d+)\s*(?:reviews?|ratings?)/i,
    /Yelp\s+(?:Reviews?|Rating)?:?\s*(\d+(?:\.\d+)?)\s*(?:out of\s*)?5\s*(?:stars?)?.*?(\d+)\s*(?:reviews?|ratings?)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return {
        rating: parseFloat(match[1]),
        count: parseInt(match[2]) || 0
      };
    }
  }
  
  // Try to find Yelp rating without count
  const ratingOnlyPatterns = [
    /Yelp:?\s*(\d+(?:\.\d+)?)\/5/i,
    /Yelp\s+(?:Reviews?|Rating)?:?\s*(\d+(?:\.\d+)?)\s*(?:out of\s*)?5/i
  ];
  
  for (const pattern of ratingOnlyPatterns) {
    const match = text.match(pattern);
    if (match) {
      return {
        rating: parseFloat(match[1]),
        count: 0
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

  // First, extract platform-specific ratings and counts
  const platformRatings = extractPlatformRatings(text);
  
  // Extract URLs for each platform
  const urls = extractReviewUrls(text);
  
  // Extract quoted reviews - looking for text in quotes
  const quotedReviews = text.match(/[""'']([^""'']{20,500})[""'']/g) || [];
  
  // Also look for review patterns without quotes (e.g., "Review: ..." or "- ...")
  const reviewPatterns = [
    /(?:Review|Comment|Feedback)\s*[:\-]\s*([^\n]{20,500})/gi,
    /^\s*[-•]\s*([^\n]{20,500})$/gm,
    /"([^"]{20,500})"/g,
    /'([^']{20,500})'/g
  ];
  
  const allReviews = [...quotedReviews];
  reviewPatterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    allReviews.push(...matches);
  });
  
  // Deduplicate reviews
  const uniqueReviews = Array.from(new Set(allReviews));
  
  uniqueReviews.forEach(quote => {
    const cleanQuote = quote.replace(/[""'']/g, '').replace(/^[\s\-•:]+/, '').trim();
    
    // Skip if it's not actually a review (e.g., instructions, metadata)
    if (/^(Review|Comment|Feedback|Find|Search|Include|Important)/i.test(cleanQuote)) {
      return;
    }
    
    // Try to determine source from context
    const quoteIndex = text.indexOf(quote);
    const context = text.substring(
      Math.max(0, quoteIndex - 200),
      Math.min(text.length, quoteIndex + quote.length + 200)
    );
    
    // Categorize by source mention in nearby text
    if (/yelp/i.test(context)) {
      reviews.yelp.push({
        text: cleanQuote,
        rating: extractRatingNearQuote(context) || platformRatings.yelp?.rating || 4.0,
        source: 'Yelp',
        date: extractDateFromContext(context) || new Date().toISOString(),
        url: urls.yelp
      });
    } else if (/care\.com|care dot com/i.test(context)) {
      reviews.carecom.push({
        text: cleanQuote,
        rating: extractRatingNearQuote(context) || platformRatings.carecom?.rating || 4.0,
        source: 'Care.com',
        date: extractDateFromContext(context) || new Date().toISOString(),
        url: urls.carecom
      });
    } else if (/senior\s*advisor/i.test(context)) {
      reviews.seniorAdvisor.push({
        text: cleanQuote,
        rating: extractRatingNearQuote(context) || platformRatings.seniorAdvisor?.rating || 4.0,
        source: 'SeniorAdvisor',
        date: extractDateFromContext(context) || new Date().toISOString(),
        url: urls.seniorAdvisor
      });
    } else if (/(?:a\s+)?place\s+for\s+mom|APFM/i.test(context)) {
      reviews.aplaceformom.push({
        text: cleanQuote,
        rating: extractRatingNearQuote(context) || platformRatings.aplaceformom?.rating || 4.0,
        source: 'A Place for Mom',
        date: extractDateFromContext(context) || new Date().toISOString(),
        url: urls.aplaceformom
      });
    } else if (/google/i.test(context)) {
      reviews.yelp.push({
        text: cleanQuote,
        rating: extractRatingNearQuote(context) || platformRatings.google?.rating || 4.0,
        source: 'Google',
        date: extractDateFromContext(context) || new Date().toISOString(),
        url: urls.google
      });
    } else if (/facebook/i.test(context)) {
      reviews.yelp.push({
        text: cleanQuote,
        rating: extractRatingNearQuote(context) || 4.0,
        source: 'Facebook',
        date: extractDateFromContext(context) || new Date().toISOString(),
        url: urls.facebook
      });
    } else if (/assisted\s*living\s*center/i.test(context)) {
      reviews.seniorAdvisor.push({
        text: cleanQuote,
        rating: extractRatingNearQuote(context) || 4.0,
        source: 'Assisted Living Center',
        date: extractDateFromContext(context) || new Date().toISOString()
      });
    }
  });
  
  // Add platform ratings as summary if we found them but no individual reviews
  Object.entries(platformRatings).forEach(([platform, data]) => {
    if (data && data.count > 0) {
      const platformReviews = {
        'yelp': reviews.yelp,
        'google': reviews.yelp, // Google reviews go in yelp array
        'carecom': reviews.carecom,
        'seniorAdvisor': reviews.seniorAdvisor,
        'aplaceformom': reviews.aplaceformom
      };
      
      const targetArray = platformReviews[platform as keyof typeof platformReviews];
      if (targetArray && targetArray.length === 0) {
        // Add a summary entry if no individual reviews were found
        targetArray.push({
          text: `Based on ${data.count} reviews`,
          rating: data.rating,
          source: data.source,
          date: new Date().toISOString(),
          isSummary: true,
          totalReviews: data.count,
          url: urls[platform as keyof typeof urls]
        });
      }
    }
  });

  return reviews;
}

// New helper function to extract platform-specific ratings
function extractPlatformRatings(text: string): Record<string, { rating: number; count: number; source: string }> {
  const ratings: Record<string, { rating: number; count: number; source: string }> = {};
  
  // Pattern for platform ratings: "Platform: X.X/5, Y reviews" or "Platform: X.X/5 (Y reviews)"
  const platformPatterns = [
    { name: 'seniorAdvisor', pattern: /Senior\s*Advisor:?\s*(\d+(?:\.\d+)?)\/5(?:\s*(?:stars?)?[,\s]+(\d+)\s*reviews?)?/i, source: 'SeniorAdvisor' },
    { name: 'aplaceformom', pattern: /(?:A\s+)?Place\s+for\s+Mom:?\s*(\d+(?:\.\d+)?)\/5(?:\s*(?:stars?)?[,\s]+(\d+)\s*reviews?)?/i, source: 'A Place for Mom' },
    { name: 'carecom', pattern: /Care\.com:?\s*(\d+(?:\.\d+)?)\/5(?:\s*(?:stars?)?[,\s]+(\d+)\s*reviews?)?/i, source: 'Care.com' },
    { name: 'yelp', pattern: /Yelp:?\s*(\d+(?:\.\d+)?)\/5(?:\s*(?:stars?)?[,\s]+(\d+)\s*reviews?)?/i, source: 'Yelp' },
    { name: 'google', pattern: /Google:?\s*(\d+(?:\.\d+)?)\/5(?:\s*(?:stars?)?[,\s]+(\d+)\s*reviews?)?/i, source: 'Google' },
    { name: 'assistedLiving', pattern: /Assisted\s+Living\s+Center:?\s*(\d+(?:\.\d+)?)\/5(?:\s*(?:stars?)?[,\s]+(\d+)\s*reviews?)?/i, source: 'Assisted Living Center' }
  ];
  
  platformPatterns.forEach(({ name, pattern, source }) => {
    const match = text.match(pattern);
    if (match) {
      ratings[name] = {
        rating: parseFloat(match[1]),
        count: match[2] ? parseInt(match[2]) : 0,
        source
      };
    }
  });
  
  return ratings;
}

// New helper function to extract review URLs
function extractReviewUrls(text: string): Record<string, string | undefined> {
  const urls: Record<string, string | undefined> = {};
  
  // Extract all URLs from the text
  const urlPattern = /https?:\/\/[^\s<>"]+/gi;
  const allUrls = text.match(urlPattern) || [];
  
  allUrls.forEach(url => {
    const cleanUrl = url.replace(/[\.,;\)\]\}]+$/, ''); // Remove trailing punctuation
    
    if (/yelp\.com/i.test(cleanUrl)) {
      urls.yelp = cleanUrl;
    } else if (/care\.com/i.test(cleanUrl)) {
      urls.carecom = cleanUrl;
    } else if (/senioradvisor\.com/i.test(cleanUrl)) {
      urls.seniorAdvisor = cleanUrl;
    } else if (/aplaceformom\.com/i.test(cleanUrl)) {
      urls.aplaceformom = cleanUrl;
    } else if (/google\.com\/maps/i.test(cleanUrl)) {
      urls.google = cleanUrl;
    } else if (/facebook\.com/i.test(cleanUrl)) {
      urls.facebook = cleanUrl;
    }
  });
  
  return urls;
}

function extractRatingNearQuote(context: string): number | null {
  // Look for various rating patterns
  const patterns = [
    /(\d+(?:\.\d+)?)\/5/,
    /(\d+(?:\.\d+)?)\s*(?:out of\s*)?5\s*stars?/i,
    /(\d+(?:\.\d+)?)\s*stars?/i,
    /rated?\s*(\d+(?:\.\d+)?)/i
  ];
  
  for (const pattern of patterns) {
    const match = context.match(pattern);
    if (match) {
      const rating = parseFloat(match[1]);
      if (rating >= 1 && rating <= 5) {
        return rating;
      }
    }
  }
  
  return null;
}

function extractDateFromContext(context: string): string | null {
  // Look for date patterns
  const datePatterns = [
    /(\d{1,2}\/\d{1,2}\/\d{2,4})/,
    /(\w+\s+\d{1,2},?\s+\d{4})/,
    /(\d{1,2}\s+\w+\s+ago)/,
    /(\d{4}-\d{2}-\d{2})/,
    /(\w+\s+\d{4})/,  // Month Year
    /(\d{1,2}\s+(?:days?|weeks?|months?|years?)\s+ago)/i
  ];
  
  for (const pattern of datePatterns) {
    const match = context.match(pattern);
    if (match) {
      // Try to convert relative dates to actual dates
      const dateStr = match[1];
      if (/ago/i.test(dateStr)) {
        return convertRelativeDate(dateStr);
      }
      return dateStr;
    }
  }
  return null;
}

// Helper to convert relative dates like "2 months ago" to actual dates
function convertRelativeDate(relativeStr: string): string {
  const now = new Date();
  const match = relativeStr.match(/(\d+)\s+(days?|weeks?|months?|years?)\s+ago/i);
  
  if (match) {
    const amount = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    if (unit.startsWith('day')) {
      now.setDate(now.getDate() - amount);
    } else if (unit.startsWith('week')) {
      now.setDate(now.getDate() - (amount * 7));
    } else if (unit.startsWith('month')) {
      now.setMonth(now.getMonth() - amount);
    } else if (unit.startsWith('year')) {
      now.setFullYear(now.getFullYear() - amount);
    }
  }
  
  return now.toISOString();
}