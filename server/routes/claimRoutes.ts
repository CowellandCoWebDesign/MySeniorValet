import { type Express } from "express";
import { db } from "../db";
import { communityClaims, claimedCommunities, communities, users } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { isAuthenticated as requireAuth, checkRole } from "../auth-middleware";
import { z } from "zod";
import { internalNotifications } from "../services/internal-notifications";

const createClaimSchema = z.object({
  communityId: z.number(),
  businessName: z.string().min(1),
  contactName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  ownershipProof: z.string(),
  operatorType: z.enum(['Owner', 'Regional Manager', 'Administrator', 'Other']),
  otherOperatorType: z.string().optional(),
  subscriptionPlan: z.enum(['basic', 'premium', 'enterprise'])
});

export function registerClaimRoutes(app: Express) {
  // Submit community claim
  app.post('/api/claims', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const validatedData = createClaimSchema.parse(req.body);

      // Check if community is already claimed
      const [existingClaim] = await db
        .select()
        .from(claimedCommunities)
        .where(eq(claimedCommunities.communityId, validatedData.communityId))
        .limit(1);

      if (existingClaim) {
        return res.status(400).json({ message: 'Community is already claimed' });
      }

      // Check if user has pending claim for this community
      const [pendingClaim] = await db
        .select()
        .from(communityClaims)
        .where(and(
          eq(communityClaims.communityId, validatedData.communityId),
          eq(communityClaims.userId, userId),
          eq(communityClaims.status, 'Pending')
        ))
        .limit(1);

      if (pendingClaim) {
        return res.status(400).json({ message: 'You already have a pending claim for this community' });
      }

      const [newClaim] = await db
        .insert(communityClaims)
        .values({
          ...validatedData,
          userId,
          status: 'Pending'
        })
        .returning();

      // Get community details for notification
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, validatedData.communityId))
        .limit(1);

      // Send internal notification
      try {
        await internalNotifications.notifyCommunityClaimSubmitted({
          claimId: newClaim.id,
          communityId: validatedData.communityId,
          communityName: community?.name || 'Unknown Community',
          businessName: validatedData.businessName,
          contactName: validatedData.contactName,
          email: validatedData.email,
          phone: validatedData.phone,
          operatorType: validatedData.operatorType,
          subscriptionPlan: validatedData.subscriptionPlan
        });
      } catch (notificationError) {
        console.error('Error sending internal claim notification:', notificationError);
        // Don't fail the claim submission if internal notification fails
      }

      res.status(201).json(newClaim);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid data', errors: error.errors });
      }
      console.error('Error submitting claim:', error);
      res.status(500).json({ message: 'Failed to submit claim' });
    }
  });

  // Get user's claims
  app.get('/api/claims/my', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const userClaims = await db
        .select({
          claim: communityClaims,
          community: {
            id: communities.id,
            name: communities.name,
            address: communities.address,
            city: communities.city,
            state: communities.state
          }
        })
        .from(communityClaims)
        .innerJoin(communities, eq(communityClaims.communityId, communities.id))
        .where(eq(communityClaims.userId, userId))
        .orderBy(desc(communityClaims.createdAt));

      res.json(userClaims);
    } catch (error) {
      console.error('Error fetching user claims:', error);
      res.status(500).json({ message: 'Failed to fetch claims' });
    }
  });

  // Approve claim (admin only)
  app.patch('/api/claims/:claimId/approve', requireAuth, checkRole(['admin', 'super_admin']), async (req: any, res) => {
    try {
      const claimId = parseInt(req.params.claimId);
      const adminId = req.user?.id;

      // Get claim details
      const [claim] = await db
        .select()
        .from(communityClaims)
        .where(eq(communityClaims.id, claimId))
        .limit(1);

      if (!claim) {
        return res.status(404).json({ message: 'Claim not found' });
      }

      if (claim.status !== 'Pending') {
        return res.status(400).json({ message: 'Claim has already been processed' });
      }

      // Start transaction
      await db.transaction(async (tx) => {
        // Update claim status
        await tx
          .update(communityClaims)
          .set({
            status: 'Approved',
            reviewedBy: adminId,
            reviewedAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(communityClaims.id, claimId));

        // Create claimed community record
        await tx
          .insert(claimedCommunities)
          .values({
            communityId: claim.communityId,
            userId: claim.userId,
            businessName: claim.businessName,
            contactName: claim.contactName,
            email: claim.email,
            phone: claim.phone,
            operatorType: claim.operatorType,
            otherOperatorType: claim.otherOperatorType,
            subscriptionPlan: claim.subscriptionPlan,
            claimApprovedAt: new Date()
          });

        // Update community status
        await tx
          .update(communities)
          .set({
            claimedBy: claim.userId,
            claimedAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(communities.id, claim.communityId));
      });

      // Get community details for notification
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, claim.communityId))
        .limit(1);

      // Send internal notification
      try {
        await internalNotifications.notifyCommunityClaimApproved({
          claimId: claimId,
          communityId: claim.communityId,
          communityName: community?.name || 'Unknown Community',
          businessName: claim.businessName,
          contactName: claim.contactName,
          email: claim.email,
          operatorType: claim.operatorType,
          subscriptionPlan: claim.subscriptionPlan,
          approvedBy: req.user?.email || 'admin'
        });
      } catch (notificationError) {
        console.error('Error sending internal claim approval notification:', notificationError);
        // Don't fail the approval if internal notification fails
      }

      res.json({ success: true, message: 'Claim approved successfully' });
    } catch (error) {
      console.error('Error approving claim:', error);
      res.status(500).json({ message: 'Failed to approve claim' });
    }
  });

  // Reject claim (admin only)
  app.patch('/api/claims/:claimId/reject', requireAuth, checkRole(['admin', 'super_admin']), async (req: any, res) => {
    try {
      const claimId = parseInt(req.params.claimId);
      const adminId = req.user?.id;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({ message: 'Rejection reason is required' });
      }

      const [claim] = await db
        .select()
        .from(communityClaims)
        .where(eq(communityClaims.id, claimId))
        .limit(1);

      if (!claim) {
        return res.status(404).json({ message: 'Claim not found' });
      }

      if (claim.status !== 'Pending') {
        return res.status(400).json({ message: 'Claim has already been processed' });
      }

      await db
        .update(communityClaims)
        .set({
          status: 'Rejected',
          reviewedBy: adminId,
          reviewedAt: new Date(),
          rejectionReason: reason,
          updatedAt: new Date()
        })
        .where(eq(communityClaims.id, claimId));

      // Get community details for notification
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, claim.communityId))
        .limit(1);

      // Send internal notification
      try {
        await internalNotifications.notifyCommunityClaimRejected({
          claimId: claimId,
          communityId: claim.communityId,
          communityName: community?.name || 'Unknown Community',
          businessName: claim.businessName,
          contactName: claim.contactName,
          email: claim.email,
          rejectionReason: reason,
          rejectedBy: req.user?.email || 'admin'
        });
      } catch (notificationError) {
        console.error('Error sending internal claim rejection notification:', notificationError);
        // Don't fail the rejection if internal notification fails
      }

      res.json({ success: true, message: 'Claim rejected' });
    } catch (error) {
      console.error('Error rejecting claim:', error);
      res.status(500).json({ message: 'Failed to reject claim' });
    }
  });

  // Get claimed community details
  app.get('/api/claims/community/:communityId', async (req, res) => {
    try {
      const communityId = parseInt(req.params.communityId);

      const [claimedCommunity] = await db
        .select()
        .from(claimedCommunities)
        .where(eq(claimedCommunities.communityId, communityId))
        .limit(1);

      if (!claimedCommunity) {
        return res.status(404).json({ message: 'Community is not claimed' });
      }

      res.json(claimedCommunity);
    } catch (error) {
      console.error('Error fetching claimed community:', error);
      res.status(500).json({ message: 'Failed to fetch claimed community details' });
    }
  });

  // Update claimed community subscription
  app.patch('/api/claims/community/:communityId/subscription', requireAuth, async (req: any, res) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const userId = req.user?.id;
      const { subscriptionPlan } = req.body;

      const validPlans = ['basic', 'premium', 'enterprise'];
      if (!validPlans.includes(subscriptionPlan)) {
        return res.status(400).json({ message: 'Invalid subscription plan' });
      }

      const [claimedCommunity] = await db
        .select()
        .from(claimedCommunities)
        .where(eq(claimedCommunities.communityId, communityId))
        .limit(1);

      if (!claimedCommunity) {
        return res.status(404).json({ message: 'Community is not claimed' });
      }

      if (claimedCommunity.userId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const [updated] = await db
        .update(claimedCommunities)
        .set({
          subscriptionPlan,
          subscriptionUpdatedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(claimedCommunities.communityId, communityId))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error('Error updating subscription:', error);
      res.status(500).json({ message: 'Failed to update subscription' });
    }
  });

  // Get claim statistics (admin only)
  app.get('/api/claims/stats', requireAuth, checkRole(['admin', 'super_admin']), async (req, res) => {
    try {
      const pendingCount = await db
        .select({ count: eq(communityClaims.status, 'Pending') })
        .from(communityClaims);

      const approvedCount = await db
        .select({ count: eq(communityClaims.status, 'Approved') })
        .from(communityClaims);

      const rejectedCount = await db
        .select({ count: eq(communityClaims.status, 'Rejected') })
        .from(communityClaims);

      const totalClaimed = await db
        .select({ count: eq(claimedCommunities.id, claimedCommunities.id) })
        .from(claimedCommunities);

      res.json({
        pending: pendingCount.length,
        approved: approvedCount.length,
        rejected: rejectedCount.length,
        totalClaimed: totalClaimed.length
      });
    } catch (error) {
      console.error('Error fetching claim stats:', error);
      res.status(500).json({ message: 'Failed to fetch claim statistics' });
    }
  });
}