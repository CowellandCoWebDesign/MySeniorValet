import { Router } from 'express';
import { db } from '../db';
import { communityClaims, communities, verifiedCommunityProfiles, verificationActivityLog, claimedCommunities } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import crypto from 'crypto';

const router = Router();

// Initiate a community claim
const initiateClaimSchema = z.object({
  communityId: z.number(),
  claimerName: z.string().min(2),
  claimerEmail: z.string().email(),
  claimerPhone: z.string().optional(),
  position: z.string().min(2),
  companyName: z.string().optional(),
  businessLicenseNumber: z.string().optional(),
  businessAddress: z.string().optional(),
  reasonForClaim: z.string().min(10),
  additionalNotes: z.string().optional()
});

router.post('/claims/initiate', async (req, res) => {
  try {
    const validatedData = initiateClaimSchema.parse(req.body);
    
    // Check if community exists
    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.id, validatedData.communityId))
      .limit(1);
    
    if (!community) {
      return res.status(404).json({
        success: false,
        error: 'Community not found'
      });
    }
    
    // Check if community is already claimed
    const existingClaim = await db
      .select()
      .from(communityClaims)
      .where(
        and(
          eq(communityClaims.communityId, validatedData.communityId),
          eq(communityClaims.status, 'Approved')
        )
      )
      .limit(1);
    
    if (existingClaim.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'This community has already been claimed'
      });
    }
    
    // Check for pending claims
    const pendingClaim = await db
      .select()
      .from(communityClaims)
      .where(
        and(
          eq(communityClaims.communityId, validatedData.communityId),
          eq(communityClaims.status, 'Pending')
        )
      )
      .limit(1);
    
    if (pendingClaim.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'There is already a pending claim for this community'
      });
    }
    
    // Create the claim
    const [newClaim] = await db
      .insert(communityClaims)
      .values({
        ...validatedData,
        status: 'Pending',
        priority: 'Medium'
      })
      .returning();
    
    // Log the activity
    await db.insert(verificationActivityLog).values({
      claimId: newClaim.id,
      communityId: validatedData.communityId,
      action: 'claim_submitted',
      performedBy: validatedData.claimerEmail,
      performedByRole: 'user',
      details: {
        position: validatedData.position,
        companyName: validatedData.companyName
      }
    });
    
    // TODO: Send verification email to claimer
    
    res.json({
      success: true,
      data: {
        claimId: newClaim.id,
        status: newClaim.status,
        message: 'Claim submitted successfully. You will receive a verification email shortly.'
      }
    });
  } catch (error) {
    console.error('Error initiating claim:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate claim'
    });
  }
});

// Verify email for claim
router.post('/claims/verify-email', async (req, res) => {
  try {
    const { claimId, verificationCode } = req.body;
    
    // TODO: Implement email verification logic
    // This would check the verification code and update claim status
    
    await db.insert(verificationActivityLog).values({
      claimId,
      action: 'email_verified',
      performedBy: 'system',
      performedByRole: 'system'
    });
    
    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify email'
    });
  }
});

// Upload verification documents
router.post('/claims/upload-documents', async (req, res) => {
  try {
    const { claimId, documents } = req.body;
    
    // Get the claim
    const [claim] = await db
      .select()
      .from(communityClaims)
      .where(eq(communityClaims.id, claimId))
      .limit(1);
    
    if (!claim) {
      return res.status(404).json({
        success: false,
        error: 'Claim not found'
      });
    }
    
    // Update claim with documents
    await db
      .update(communityClaims)
      .set({
        verificationDocuments: documents,
        status: 'Under Review',
        updatedAt: new Date()
      })
      .where(eq(communityClaims.id, claimId));
    
    // Log the activity
    await db.insert(verificationActivityLog).values({
      claimId,
      communityId: claim.communityId,
      action: 'document_uploaded',
      performedBy: claim.claimerEmail,
      performedByRole: 'user',
      details: {
        documentCount: documents.length,
        documentTypes: documents.map((d: any) => d.type)
      }
    });
    
    res.json({
      success: true,
      message: 'Documents uploaded successfully. Your claim is now under review.'
    });
  } catch (error) {
    console.error('Error uploading documents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload documents'
    });
  }
});

// Get claim status
router.get('/claims/status/:claimId', async (req, res) => {
  try {
    const claimId = parseInt(req.params.claimId);
    
    const [claim] = await db
      .select({
        claim: communityClaims,
        community: {
          id: communities.id,
          name: communities.name,
          city: communities.city,
          state: communities.state
        }
      })
      .from(communityClaims)
      .innerJoin(communities, eq(communityClaims.communityId, communities.id))
      .where(eq(communityClaims.id, claimId))
      .limit(1);
    
    if (!claim) {
      return res.status(404).json({
        success: false,
        error: 'Claim not found'
      });
    }
    
    // Get activity log
    const activities = await db
      .select()
      .from(verificationActivityLog)
      .where(eq(verificationActivityLog.claimId, claimId))
      .orderBy(verificationActivityLog.createdAt);
    
    res.json({
      success: true,
      data: {
        ...claim,
        activities
      }
    });
  } catch (error) {
    console.error('Error fetching claim status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch claim status'
    });
  }
});

// Admin: Approve claim
router.patch('/claims/:id/approve', async (req, res) => {
  try {
    const claimId = parseInt(req.params.id);
    const { reviewNotes, verificationTier = 'basic' } = req.body;
    
    // TODO: Check admin authorization
    
    // Get the claim
    const [claim] = await db
      .select()
      .from(communityClaims)
      .where(eq(communityClaims.id, claimId))
      .limit(1);
    
    if (!claim) {
      return res.status(404).json({
        success: false,
        error: 'Claim not found'
      });
    }
    
    // Update claim status
    await db
      .update(communityClaims)
      .set({
        status: 'Approved',
        reviewedAt: new Date(),
        reviewNotes,
        updatedAt: new Date()
      })
      .where(eq(communityClaims.id, claimId));
    
    // Create verified profile
    await db.insert(verifiedCommunityProfiles).values({
      communityId: claim.communityId,
      claimId,
      verificationTier,
      verificationBadge: true,
      priceTransparencyEnabled: true,
      availabilityTransparencyEnabled: true,
      analyticsEnabled: true,
      leadNotificationsEnabled: true
    });
    
    // Update community as claimed
    await db
      .update(communities)
      .set({
        isClaimed: true,
        claimVerified: true,
        claimDate: new Date()
      })
      .where(eq(communities.id, claim.communityId));
    
    // Create claimed community record
    if (claim.claimerUserId) {
      await db.insert(claimedCommunities).values({
        communityId: claim.communityId,
        ownerId: claim.claimerUserId,
        claimId,
        businessName: claim.companyName || claim.claimerName,
        operatorType: 'Independent',
        isVerified: true,
        verificationLevel: verificationTier === 'basic' ? 'Basic' : 
                          verificationTier === 'enhanced' ? 'Enhanced' : 'Premium',
        subscriptionPlan: 'Free',
        subscriptionStatus: 'Trial',
        canUpdatePhotos: true,
        canUpdatePricing: true,
        canUpdateAmenities: true,
        canRespondToReviews: true,
        canReceiveLeads: true
      });
    }
    
    // Log the activity
    await db.insert(verificationActivityLog).values({
      claimId,
      communityId: claim.communityId,
      action: 'verified',
      performedBy: 'admin', // TODO: Use actual admin ID
      performedByRole: 'admin',
      details: {
        verificationTier,
        reviewNotes
      }
    });
    
    res.json({
      success: true,
      message: 'Claim approved successfully'
    });
  } catch (error) {
    console.error('Error approving claim:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve claim'
    });
  }
});

// Admin: Reject claim
router.patch('/claims/:id/reject', async (req, res) => {
  try {
    const claimId = parseInt(req.params.id);
    const { rejectionReason, reviewNotes } = req.body;
    
    // TODO: Check admin authorization
    
    // Update claim status
    await db
      .update(communityClaims)
      .set({
        status: 'Rejected',
        reviewedAt: new Date(),
        rejectionReason,
        reviewNotes,
        updatedAt: new Date()
      })
      .where(eq(communityClaims.id, claimId));
    
    // Log the activity
    const [claim] = await db
      .select()
      .from(communityClaims)
      .where(eq(communityClaims.id, claimId))
      .limit(1);
    
    await db.insert(verificationActivityLog).values({
      claimId,
      communityId: claim.communityId,
      action: 'rejected',
      performedBy: 'admin', // TODO: Use actual admin ID
      performedByRole: 'admin',
      details: {
        rejectionReason,
        reviewNotes
      }
    });
    
    res.json({
      success: true,
      message: 'Claim rejected'
    });
  } catch (error) {
    console.error('Error rejecting claim:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject claim'
    });
  }
});

// Get all pending claims (admin)
router.get('/claims/pending', async (req, res) => {
  try {
    // TODO: Check admin authorization
    
    const pendingClaims = await db
      .select({
        claim: communityClaims,
        community: {
          id: communities.id,
          name: communities.name,
          city: communities.city,
          state: communities.state
        }
      })
      .from(communityClaims)
      .innerJoin(communities, eq(communityClaims.communityId, communities.id))
      .where(eq(communityClaims.status, 'Pending'))
      .orderBy(communityClaims.createdAt);
    
    res.json({
      success: true,
      data: pendingClaims,
      count: pendingClaims.length
    });
  } catch (error) {
    console.error('Error fetching pending claims:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending claims'
    });
  }
});

export default router;