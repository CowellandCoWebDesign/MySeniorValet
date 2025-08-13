import { type Express } from "express";
import { db } from "../db";
import { reviews, communities, users } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { isAuthenticated as requireAuth } from "../auth-middleware";
import { insertReviewSchema } from "@shared/schema";
import { z } from "zod";

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
          source: 'MySeniorValet',
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
}