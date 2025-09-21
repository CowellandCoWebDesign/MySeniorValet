import { type Express } from "express";
import { db } from "../db";
import { reviews, communities, users } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { isAuthenticated as requireAuth } from "../auth-middleware";
import { insertReviewSchema } from "@shared/schema";
import { z } from "zod";
import { GrokReviewService } from "../grok-review-service";

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

  // Fetch inspection data using Grok AI
  app.post('/api/communities/:communityId/inspections/fetch', async (req, res) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const grok = new GrokReviewService();

      if (!grok.isConfigured()) {
        return res.status(400).json({ 
          message: 'Grok AI is not configured',
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

      // Search for inspection data using Grok
      const searchQuery = `Search for government inspection reports, health violations, compliance records, and regulatory findings for "${community.name}" senior living facility located at ${community.address}, ${community.city}, ${community.state} ${community.zipCode}. Include:
        1. Medicare.gov Nursing Home Compare data and star ratings if available
        2. State health department inspection reports and citations
        3. CMS (Centers for Medicare & Medicaid Services) inspection results
        4. Recent health violations or deficiencies
        5. Fire safety inspection results
        6. Any regulatory actions, fines, or penalties
        7. Complaint investigation results
        8. Staffing violations or concerns
        9. Quality measure scores
        10. Infection control citations (especially COVID-19 related)
        Include dates, severity levels, and whether violations were corrected. Search state databases, Medicare.gov, and any public records available.`;
      
      const context = `${community.name} senior living facility at ${community.address}, ${community.city}, ${community.state}`;
      
      console.log('Fetching inspection data for:', community.name);
      const result = await grok.fetchInspectionData(
        community.name,
        community.address,
        community.city,
        community.state,
        community.zipCode
      );

      // Inspection data is already parsed by Grok service
      const inspectionData = result.inspectionData;
      
      // Return the structured inspection data
      res.json({
        success: true,
        inspectionData,
        citations: result.citations || [],
        lastUpdated: new Date().toISOString(),
        poweredBy: 'Grok AI'
      });

    } catch (error) {
      console.error('Error fetching inspection data:', error);
      res.status(500).json({ 
        message: 'Failed to fetch inspection data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Fetch external reviews using Grok AI with Comparison in Perspective
  app.post('/api/communities/:communityId/reviews/fetch-external', async (req, res) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const grok = new GrokReviewService();

      if (!grok.isConfigured()) {
        return res.status(400).json({ 
          message: 'Grok AI is not configured',
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

      // Search for reviews using Grok with Comparison in Perspective
      const searchQuery = `Find ALL reviews and ratings for "${community.name}" senior living community at ${community.address}, ${community.city}, ${community.state} ${community.zipCode}. 

**CRITICAL: I need the actual review text/quotes, not just summaries. Please provide reviews in this exact format:**

**Google Reviews:**
- Rating: X.X/5 (Y total reviews)
- Review 1: "EXACT QUOTE FROM ACTUAL REVIEW" - Reviewer Name - Date
- Review 2: "EXACT QUOTE FROM ACTUAL REVIEW" - Reviewer Name - Date
- URL: [Google Maps/Reviews link]

**Yelp Reviews:**
- Rating: X.X/5 (Y total reviews)  
- Review 1: "EXACT QUOTE FROM ACTUAL REVIEW" - Reviewer Name - Date
- Review 2: "EXACT QUOTE FROM ACTUAL REVIEW" - Reviewer Name - Date
- URL: [Yelp business page link]

**Care.com Reviews:**
- Rating: X.X/5 (Y total reviews)
- Review 1: "EXACT QUOTE FROM ACTUAL REVIEW" - Reviewer Name - Date
- URL: [Care.com profile link]

**SeniorAdvisor.com Reviews:**
- Rating: X.X/5 (Y total reviews)
- Review 1: "EXACT QUOTE FROM ACTUAL REVIEW" - Reviewer Name - Date
- URL: [SeniorAdvisor profile link]

**A Place for Mom Reviews:**
- Rating: X.X/5 (Y total reviews)
- Review 1: "EXACT QUOTE FROM ACTUAL REVIEW" - Reviewer Name - Date
- URL: [A Place for Mom profile link]

**Facebook Reviews:**
- Rating: X.X/5 (Y total reviews)
- Review 1: "EXACT QUOTE FROM ACTUAL REVIEW" - Reviewer Name - Date
- URL: [Facebook page link]

**Other Review Sites:**
- Platform: [Name]
- Rating: X.X/5 (Y total reviews)
- Review 1: "EXACT QUOTE FROM ACTUAL REVIEW" - Reviewer Name - Date

REQUIREMENTS:
1. Search Google Reviews, Yelp, Care.com, SeniorAdvisor, A Place for Mom, Facebook, and ANY other review platforms
2. Include ACTUAL REVIEW TEXT in quotes, not paraphrases or summaries
3. Include reviewer names and dates when available
4. Include direct URLs to each review platform
5. Find reviews from ALL years (2020-2025), not just recent ones
6. If no reviews exist on a platform, clearly state "No reviews found"
7. Search thoroughly - many senior living communities have reviews but they may be under slightly different names or addresses`;
      
      const context = `${community.name} located at ${community.address}, ${community.city}, ${community.state} ${community.zipCode}`;
      
      console.log('Fetching external reviews for:', community.name);
      const result = await grok.fetchReviewsWithPerspective(
        community.name,
        community.address,
        community.city,
        community.state,
        community.zipCode
      );

      // Use Grok's structured response with comparative perspective
      const extractedData = {
        googleRating: extractGoogleRating(result.summary),
        yelpRating: extractYelpRating(result.summary),
        externalReviews: result.reviews || [],
        sources: result.sources || [],
        lastUpdated: result.lastUpdated,
        images: [],
        rawSummary: result.summary,
        perspectiveAnalysis: result.perspectiveAnalysis,
        comparativeInsights: result.comparativeInsights
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

      // Group reviews by source/platform
      const reviewsByPlatform = extractedData.externalReviews.reduce((acc: any, review: any) => {
        const platform = review.platform || review.source || 'Unknown';
        if (!acc[platform]) acc[platform] = [];
        acc[platform].push(review);
        return acc;
      }, {});

      // Store extracted reviews in JSON fields by platform
      if (reviewsByPlatform['Yelp']?.length > 0) {
        updateData.yelpReviews = reviewsByPlatform['Yelp'];
      }
      if (reviewsByPlatform['Care.com']?.length > 0) {
        updateData.careComReviews = reviewsByPlatform['Care.com'];
      }
      if (reviewsByPlatform['SeniorAdvisor']?.length > 0) {
        updateData.seniorAdvisorReviews = reviewsByPlatform['SeniorAdvisor'];
      }
      if (reviewsByPlatform['A Place for Mom']?.length > 0) {
        updateData.aplaceformomReviews = reviewsByPlatform['A Place for Mom'];
      }

      await db
        .update(communities)
        .set(updateData)
        .where(eq(communities.id, communityId));

      res.json({
        success: true,
        data: extractedData,
        message: 'External reviews fetched successfully with comparative perspective',
        poweredBy: 'Grok AI - Comparison in Perspective',
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

// Helper functions to extract review data from Grok response
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

  console.log('🔍 Starting review extraction from text length:', text.length);
  console.log('📝 First 500 chars of text:', text.substring(0, 500));
  
  // Extract platform-specific ratings and counts
  const platformRatings = extractPlatformRatings(text);
  console.log('📊 Platform ratings found:', platformRatings);
  
  // Extract URLs for each platform
  const urls = extractReviewUrls(text);
  console.log('🔗 URLs found:', urls);
  
  // Enhanced patterns to match the new structured format
  const structuredPatterns = [
    // Pattern for: "Review 1: "EXACT QUOTE" - Reviewer Name - Date"
    /(?:Review\s+\d+|Review):\s*[""]([^""]{15,500})[""](?:\s*-\s*([^-\n]+?)(?:\s*-\s*([^-\n]+?))?)?/gi,
    
    // Pattern for bullet point reviews: "- "EXACT QUOTE" - Reviewer Name - Date"
    /-\s*[""]([^""]{15,500})[""](?:\s*-\s*([^-\n]+?)(?:\s*-\s*([^-\n]+?))?)?/gi,
    
    // Pattern for numbered reviews: "1. "EXACT QUOTE" - Reviewer Name - Date"
    /\d+\.\s*[""]([^""]{15,500})[""](?:\s*-\s*([^-\n]+?)(?:\s*-\s*([^-\n]+?))?)?/gi,
    
    // Pattern for quotes with context: "Quote content" followed by attribution
    /[""]([^""]{15,500})[""](?:\s*(?:-|by|from|–)\s*([^-\n,]{3,50}?)(?:\s*[-,–]\s*([^-\n]{3,30}?))?)?/gi,
    
    // Fallback patterns for less structured content
    /(?:said|wrote|commented|reviewed):\s*[""]([^""]{15,500})[""](?:\s*-?\s*([^-\n]{3,50}?))?/gi,
    
    // Single quotes
    /(?:Review\s+\d+|Review):\s*['']([^'']{15,500})[''](?:\s*-\s*([^-\n]+?)(?:\s*-\s*([^-\n]+?))?)?/gi,
    /-\s*['']([^'']{15,500})[''](?:\s*-\s*([^-\n]+?)(?:\s*-\s*([^-\n]+?))?)?/gi,
    
    // Generic quoted content with minimum length
    /[""]([^""]{20,500})[""](?:\s*-\s*([^-\n]{3,50}?))?/gi,
    /['']([^'']{20,500})[''](?:\s*-\s*([^-\n]{3,50}?))?/gi,
    
    // Standard quotes
    /"([^"]{20,500})"(?:\s*-\s*([^-\n]{3,50}?))?/gi,
    /'([^']{20,500})'(?:\s*-\s*([^-\n]{3,50}?))?/gi
  ];

  // Extract all potential review matches
  const allMatches: Array<{ text: string; author?: string; date?: string; originalMatch: string; source?: string }> = [];
  
  structuredPatterns.forEach((pattern, index) => {
    let match;
    pattern.lastIndex = 0; // Reset regex
    
    while ((match = pattern.exec(text)) !== null) {
      const reviewText = match[1]?.trim();
      const author = match[2]?.trim();
      const date = match[3]?.trim();
      
      if (reviewText && reviewText.length >= 15) {
        // Skip obvious non-reviews (instructions, metadata, etc.)
        if (isValidReview(reviewText)) {
          allMatches.push({
            text: reviewText,
            author: author || 'Anonymous',
            date: date || new Date().toISOString(),
            originalMatch: match[0],
            source: detectSourceFromContext(text, match.index!)
          });
        }
      }
    }
    console.log(`📝 Pattern ${index + 1} found ${allMatches.length} total matches so far`);
  });

  console.log(`🎯 Total valid review matches found: ${allMatches.length}`);

  // Deduplicate reviews based on content similarity
  const uniqueReviews = deduplicateReviews(allMatches);
  console.log(`✨ Unique reviews after deduplication: ${uniqueReviews.length}`);

  // Categorize reviews by source
  uniqueReviews.forEach((review, index) => {
    const contextSource = review.source || detectSourceFromFullText(text || '', review.text);
    console.log(`📍 Review ${index + 1} detected source: ${contextSource} | Text: ${review.text.substring(0, 100)}...`);
    
    const reviewObj = {
      text: review.text,
      rating: extractRatingFromReviewContext(text, review.text) || getDefaultRatingForSource(contextSource, platformRatings),
      source: contextSource,
      author: review.author,
      date: parseDate(review.date),
      url: getUrlForSource(contextSource, urls),
      verified: true,
      helpful: 0
    };

    switch (contextSource) {
      case 'Google':
      case 'Yelp':
        reviews.yelp.push({ ...reviewObj, source: contextSource });
        break;
      case 'Care.com':
        reviews.carecom.push(reviewObj);
        break;
      case 'SeniorAdvisor':
      case 'Assisted Living Center':
        reviews.seniorAdvisor.push(reviewObj);
        break;
      case 'A Place for Mom':
        reviews.aplaceformom.push(reviewObj);
        break;
      default:
        // Default to Yelp for unclassified reviews
        reviews.yelp.push({ ...reviewObj, source: 'External Review' });
    }
  });

  // Add platform summaries for platforms with ratings but no extracted reviews
  addPlatformSummaries(reviews, platformRatings, urls);
  
  console.log('📋 Final review counts:', {
    yelp: reviews.yelp.length,
    carecom: reviews.carecom.length,
    seniorAdvisor: reviews.seniorAdvisor.length,
    aplaceformom: reviews.aplaceformom.length
  });

  return reviews;
}

// Helper function to validate if a text snippet is actually a review
function isValidReview(text: string): boolean {
  // Skip if text is too short
  if (text.length < 15) return false;
  
  // Skip obvious non-reviews (instructions, metadata, etc.)
  const invalidPatterns = [
    /^(Review|Comment|Feedback|Find|Search|Include|Important|Critical|Requirements|Please provide|Look for|Based on|According to)/i,
    /^\s*(1\.|2\.|3\.|4\.|5\.|6\.|7\.|8\.|9\.|10\.)/,
    /^(Rating|URL|Platform|Source|Date|Overall|Total|Number of)/i,
    /^(No reviews|Reviews not found|Unable to find|Could not locate)/i,
    /^(X\.X\/5|EXACT QUOTE|Reviewer Name)/i,
    /^[\-\*\+\•]/,
    /^\s*\[/,
    /^https?:\/\//,
    /^www\./,
    /^\d+\s+(reviews?|ratings?|stars?)/i
  ];
  
  for (const pattern of invalidPatterns) {
    if (pattern.test(text)) {
      console.log(`🚫 Filtered out invalid text: ${text.substring(0, 50)}...`);
      return false;
    }
  }
  
  // Check if it contains review-like content
  const reviewIndicators = [
    /\b(staff|care|service|room|food|facility|activities|family|recommend|love|hate|excellent|terrible|clean|dirty|friendly|helpful)\b/i,
    /\b(mom|dad|parent|grandmother|grandfather|senior|elderly|resident|visitor)\b/i,
    /\b(quality|experience|stay|lived|visit|moved|place|home|community)\b/i,
    /\b(would|could|should|very|really|quite|extremely|highly)\b/i
  ];
  
  const hasReviewContent = reviewIndicators.some(pattern => pattern.test(text));
  
  if (!hasReviewContent) {
    console.log(`🤔 Text may not be review content: ${text.substring(0, 50)}...`);
  }
  
  return hasReviewContent;
}

// Helper function to detect source from immediate context around a match
function detectSourceFromContext(fullText: string, matchIndex: number): string {
  const contextSize = 300;
  const start = Math.max(0, matchIndex - contextSize);
  const end = Math.min(fullText.length, matchIndex + contextSize);
  const context = fullText.substring(start, end).toLowerCase();
  
  console.log(`🔍 Context for source detection: ${context.substring(0, 100)}...`);
  
  // Check for platform mentions in order of specificity
  if (/\*\*google\s+reviews?\*\*|google\s+reviews?:|google:\s*\d+/i.test(context)) return 'Google';
  if (/\*\*yelp\s+reviews?\*\*|yelp\s+reviews?:|yelp:\s*\d+/i.test(context)) return 'Yelp';
  if (/\*\*care\.com\s+reviews?\*\*|care\.com\s+reviews?:|care\.com:\s*\d+/i.test(context)) return 'Care.com';
  if (/\*\*senioradvisor\s+reviews?\*\*|senioradvisor\.com|senior\s*advisor/i.test(context)) return 'SeniorAdvisor';
  if (/\*\*a\s+place\s+for\s+mom\s+reviews?\*\*|place\s+for\s+mom|aplaceformom/i.test(context)) return 'A Place for Mom';
  if (/\*\*facebook\s+reviews?\*\*|facebook\s+reviews?:|facebook:\s*\d+/i.test(context)) return 'Facebook';
  if (/assisted\s+living\s+center/i.test(context)) return 'Assisted Living Center';
  
  return 'Unknown';
}

// Helper function to deduplicate reviews based on content similarity
function deduplicateReviews(reviews: Array<{ text: string; author?: string; date?: string; originalMatch: string; source?: string }>): Array<{ text: string; author?: string; date?: string; originalMatch: string; source?: string }> {
  const unique: Array<{ text: string; author?: string; date?: string; originalMatch: string; source?: string }> = [];
  
  for (const review of reviews) {
    const isDuplicate = unique.some(existing => {
      // Check for exact text match
      if (existing.text === review.text) return true;
      
      // Check for high similarity (80% match)
      const similarity = calculateTextSimilarity(existing.text, review.text);
      return similarity > 0.8;
    });
    
    if (!isDuplicate) {
      unique.push(review);
    } else {
      console.log(`🔄 Removing duplicate review: ${review.text.substring(0, 50)}...`);
    }
  }
  
  return unique;
}

// Helper function to detect source from full text search
function detectSourceFromFullText(fullText: string, reviewText: string): string {
  const textIndex = fullText.indexOf(reviewText);
  if (textIndex === -1) return 'Unknown';
  
  // Look in a larger context around the review
  const contextSize = 500;
  const start = Math.max(0, textIndex - contextSize);
  const end = Math.min(fullText.length, textIndex + reviewText.length + contextSize);
  const context = fullText.substring(start, end).toLowerCase();
  
  // Platform detection with section headers
  const sections = fullText.split(/\*\*([^*]+)\*\*/);
  let currentSection = 'Unknown';
  
  for (let i = 0; i < sections.length; i += 2) {
    const content = sections[i] || '';
    const nextHeader = sections[i + 1] || '';
    
    if (content.includes(reviewText)) {
      if (/google\s+reviews?/i.test(nextHeader)) currentSection = 'Google';
      else if (/yelp\s+reviews?/i.test(nextHeader)) currentSection = 'Yelp';
      else if (/care\.com\s+reviews?/i.test(nextHeader)) currentSection = 'Care.com';
      else if (/senioradvisor\s+reviews?/i.test(nextHeader)) currentSection = 'SeniorAdvisor';
      else if (/place\s+for\s+mom\s+reviews?/i.test(nextHeader)) currentSection = 'A Place for Mom';
      else if (/facebook\s+reviews?/i.test(nextHeader)) currentSection = 'Facebook';
      break;
    }
  }
  
  return currentSection;
}

// Helper function to extract rating from review context
function extractRatingFromReviewContext(fullText: string, reviewText: string): number | null {
  const textIndex = fullText.indexOf(reviewText);
  if (textIndex === -1) return null;
  
  // Look for rating in nearby context
  const contextSize = 200;
  const start = Math.max(0, textIndex - contextSize);
  const end = Math.min(fullText.length, textIndex + reviewText.length + contextSize);
  const context = fullText.substring(start, end);
  
  return extractRatingNearQuote(context);
}

// Helper function to get default rating for a source
function getDefaultRatingForSource(source: string, platformRatings: Record<string, { rating: number; count: number; source: string }>): number {
  const sourceMap: Record<string, string> = {
    'Google': 'google',
    'Yelp': 'yelp',
    'Care.com': 'carecom',
    'SeniorAdvisor': 'seniorAdvisor',
    'A Place for Mom': 'aplaceformom',
    'Assisted Living Center': 'assistedLiving'
  };
  
  const key = sourceMap[source];
  if (key && platformRatings[key]) {
    return platformRatings[key].rating;
  }
  
  return 4.0; // Default rating
}

// Helper function to parse dates properly
function parseDate(dateStr: string): string {
  if (!dateStr || dateStr === 'Anonymous') return new Date().toISOString();
  
  // If it's already an ISO string, return it
  if (/^\d{4}-\d{2}-\d{2}T/.test(dateStr)) return dateStr;
  
  // If it contains "ago", convert it
  if (/ago/i.test(dateStr)) {
    return convertRelativeDate(dateStr);
  }
  
  // Try to parse the date
  try {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  } catch (e) {
    // Fall back to current date
  }
  
  return new Date().toISOString();
}

// Helper function to get URL for source
function getUrlForSource(source: string, urls: Record<string, string | undefined>): string | undefined {
  const sourceMap: Record<string, string> = {
    'Google': 'google',
    'Yelp': 'yelp',
    'Care.com': 'carecom',
    'SeniorAdvisor': 'seniorAdvisor',
    'A Place for Mom': 'aplaceformom',
    'Facebook': 'facebook'
  };
  
  const key = sourceMap[source];
  return key ? urls[key] : undefined;
}

// Helper function to add platform summaries
function addPlatformSummaries(
  reviews: { yelp: any[]; carecom: any[]; seniorAdvisor: any[]; aplaceformom: any[] },
  platformRatings: Record<string, { rating: number; count: number; source: string }>,
  urls: Record<string, string | undefined>
): void {
  Object.entries(platformRatings).forEach(([platform, data]) => {
    if (data && data.count > 0) {
      const platformReviews = {
        'yelp': reviews.yelp,
        'google': reviews.yelp, // Google reviews go in yelp array
        'carecom': reviews.carecom,
        'seniorAdvisor': reviews.seniorAdvisor,
        'aplaceformom': reviews.aplaceformom,
        'assistedLiving': reviews.seniorAdvisor
      };
      
      const targetArray = platformReviews[platform as keyof typeof platformReviews];
      if (targetArray && targetArray.length === 0) {
        // Add a summary entry if no individual reviews were found
        targetArray.push({
          text: `Based on ${data.count} reviews on ${data.source}`,
          rating: data.rating,
          source: data.source,
          date: new Date().toISOString(),
          isSummary: true,
          totalReviews: data.count,
          url: urls[platform as keyof typeof urls],
          verified: true,
          helpful: 0
        });
        console.log(`📝 Added summary for ${data.source}: ${data.rating}/5 (${data.count} reviews)`);
      }
    }
  });
}

// Helper function to calculate text similarity
function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);
  
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
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

// Helper function to parse inspection data from Perplexity response
function parseInspectionData(summary: string): any {
  const inspectionData: any = {
    summary: '',
    violations: [],
    inspections: [],
    starRating: null,
    lastInspectionDate: null
  };

  // Clean markdown formatting from the summary
  const cleanedSummary = summary
    .replace(/\*\*/g, '') // Remove bold markdown
    .replace(/\*/g, '')   // Remove italic markdown
    .replace(/##/g, '')   // Remove headers
    .replace(/\n\n+/g, ' ') // Replace multiple newlines with space
    .trim();

  // Extract overall summary
  const summaryMatch = cleanedSummary.match(/(?:Overall|Summary|Inspection findings?)[\s:]+([^.]+\.)/i);
  if (summaryMatch) {
    inspectionData.summary = summaryMatch[1].trim();
  } else {
    // Use first few sentences as summary
    const sentences = cleanedSummary.split('.').slice(0, 3).join('.').trim();
    inspectionData.summary = sentences || 'Inspection data available. Click to view details.';
  }

  // Extract violations
  const violationPatterns = [
    /(?:violation|deficiency|citation|non-compliance)[s]?:?\s*([^.]+)/gi,
    /(?:failed|cited for|found to have)\s+([^.]+)/gi,
    /(?:Level [A-Z]|Severity [A-Z]|Class [IVX]+)\s+(?:violation|deficiency)[s]?:?\s*([^.]+)/gi
  ];

  violationPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(cleanedSummary)) !== null) {
      const violationText = match[1].trim();
      
      // Extract date if present
      const dateMatch = violationText.match(/\(([^)]+)\)/);
      const date = dateMatch ? dateMatch[1] : 'Date not specified';
      
      // Determine severity
      let severity = 'Standard';
      if (/immediate jeopardy|severe|critical/i.test(violationText)) {
        severity = 'Severe';
      } else if (/moderate|significant/i.test(violationText)) {
        severity = 'Moderate';
      }
      
      inspectionData.violations.push({
        type: severity + ' Violation',
        description: violationText.replace(/\([^)]+\)/, '').trim(),
        date: date,
        status: /corrected|resolved|fixed/i.test(violationText) ? 'Resolved' : 'Pending'
      });
    }
  });

  // Extract inspection history
  const inspectionPatterns = [
    /(?:inspection|survey|audit)\s+(?:on|conducted|performed)?\s*([^.]+)/gi,
    /(?:Medicare|State|Health Department|CMS)\s+inspection[s]?:?\s*([^.]+)/gi,
    /(?:passed|failed|completed)\s+(?:inspection|survey)\s+([^.]+)/gi
  ];

  inspectionPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(cleanedSummary)) !== null) {
      const inspectionText = match[1].trim();
      
      // Extract date
      const dateMatch = inspectionText.match(/(?:on\s+)?(\d{1,2}\/\d{1,2}\/\d{2,4}|\w+\s+\d{1,2},?\s+\d{4}|\d{4})/);
      const date = dateMatch ? dateMatch[1] : 'Date not specified';
      
      // Determine result
      let result = 'Completed';
      if (/passed|no violations|compliant/i.test(inspectionText)) {
        result = 'Passed';
      } else if (/failed|violations found|deficiencies/i.test(inspectionText)) {
        result = 'Failed';
      }
      
      // Determine type
      let type = 'State Inspection';
      if (/Medicare|CMS/i.test(inspectionText)) {
        type = 'Medicare/CMS Inspection';
      } else if (/fire|safety/i.test(inspectionText)) {
        type = 'Fire Safety Inspection';
      } else if (/health department/i.test(inspectionText)) {
        type = 'Health Department Inspection';
      }
      
      inspectionData.inspections.push({
        type: type,
        date: date,
        result: result,
        findings: inspectionText.substring(0, 200)
      });
    }
  });

  // Extract star rating if available
  const starMatch = cleanedSummary.match(/(\d+(?:\.\d+)?)\s*(?:out of\s*)?5\s*stars?|(\d+(?:\.\d+)?)\s*star\s+rating/i);
  if (starMatch) {
    inspectionData.starRating = parseFloat(starMatch[1] || starMatch[2]);
  }

  // Remove duplicates
  inspectionData.violations = inspectionData.violations.slice(0, 5); // Limit to 5 most relevant
  inspectionData.inspections = inspectionData.inspections.slice(0, 5); // Limit to 5 most recent

  return inspectionData;
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