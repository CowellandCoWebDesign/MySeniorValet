import { Router } from 'express';
import { db } from '../db';
import { communityClaims, communities, verifiedCommunityProfiles, verificationActivityLog, claimedCommunities } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import crypto from 'crypto';
import { isAuthenticated, checkRole } from '../auth-middleware';
import {
  approveOperatorClaim,
  removeOperatorClaimVerification,
} from '../services/operator-claim-lifecycle';
import { requireAuthenticatedOperatorUserId } from '../services/operator-claim-identity';

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

router.post('/claims/initiate', isAuthenticated, async (req: any, res) => {
  try {
    const claimerUserId = requireAuthenticatedOperatorUserId(req);
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
        claimerUserId,
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
router.post('/claims/verify-email', isAuthenticated, (_req, res) => {
  return res.status(501).json({
    success: false,
    error: 'Email verification is not available until a real verification-code flow is configured',
  });
});

// Upload verification documents
router.post('/claims/upload-documents', isAuthenticated, async (req: any, res) => {
  try {
    const { claimId, documents } = req.body;
    if (!Number.isInteger(Number(claimId)) || !Array.isArray(documents)) {
      return res.status(400).json({ success: false, error: 'Invalid claim documents' });
    }
    
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
    const requesterId = requireAuthenticatedOperatorUserId(req);
    const requesterRole = req.user?.role || req.session?.user?.role;
    if (
      claim.claimerUserId !== requesterId &&
      requesterRole !== 'admin' &&
      requesterRole !== 'super_admin'
    ) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    if (!['Pending', 'Under Review'].includes(claim.status || '')) {
      return res.status(409).json({ success: false, error: 'Claim is not accepting documents' });
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
        documentTypes: documents.map((d: any) => String(d?.type || 'unknown'))
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
router.get('/claims/status/:claimId', isAuthenticated, async (req: any, res) => {
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
    const requesterId = requireAuthenticatedOperatorUserId(req);
    const requesterRole = req.session?.user?.role || req.user?.role;
    if (
      claim.claim.claimerUserId !== requesterId &&
      requesterRole !== 'admin' &&
      requesterRole !== 'super_admin'
    ) {
      return res.status(403).json({ success: false, error: 'Access denied' });
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
router.patch(
  '/claims/:id/approve',
  isAuthenticated,
  checkRole('admin'),
  async (req: any, res) => {
  try {
    const claimId = parseInt(req.params.id);
    const { claim, reviewedAt } = await approveOperatorClaim(
      claimId,
      requireAuthenticatedOperatorUserId(req),
    );
    
    // Log the activity
    await db.insert(verificationActivityLog).values({
      claimId,
      communityId: claim.communityId,
      action: 'verified',
      performedBy: String(requireAuthenticatedOperatorUserId(req)),
      performedByRole: 'admin',
      details: {
        reviewNotes: req.body.reviewNotes,
        reviewedAt: reviewedAt.toISOString(),
        evidence: 'approved_operator_claim'
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
router.patch(
  '/claims/:id/reject',
  isAuthenticated,
  checkRole('admin'),
  async (req: any, res) => {
  try {
    const claimId = parseInt(req.params.id);
    const { rejectionReason, reviewNotes } = req.body;
    
    const { claim } = await removeOperatorClaimVerification({
      claimId,
      reviewerId: requireAuthenticatedOperatorUserId(req),
      status: 'Rejected',
      reason: rejectionReason,
    });
    
    await db.insert(verificationActivityLog).values({
      claimId,
      communityId: claim.communityId,
      action: 'rejected',
      performedBy: String(requireAuthenticatedOperatorUserId(req)),
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

router.patch(
  '/claims/:id/:action(revoke|suspend)',
  isAuthenticated,
  checkRole('admin'),
  async (req: any, res) => {
    try {
      const claimId = parseInt(req.params.id, 10);
      const reason = String(req.body.reason || '').trim();
      if (!reason) return res.status(400).json({ success: false, error: 'Reason is required' });
      const status = req.params.action === 'revoke' ? 'Revoked' : 'Suspended';
      const { claim } = await removeOperatorClaimVerification({
        claimId,
        reviewerId: requireAuthenticatedOperatorUserId(req),
        status,
        reason,
      });
      await db.insert(verificationActivityLog).values({
        claimId,
        communityId: claim.communityId,
        action: status.toLowerCase(),
        performedBy: String(requireAuthenticatedOperatorUserId(req)),
        performedByRole: 'admin',
        details: { reason },
      });
      return res.json({ success: true, message: `Claim ${status.toLowerCase()}` });
    } catch (error) {
      console.error(`Error ${req.params.action}ing claim:`, error);
      return res.status(500).json({ success: false, error: `Failed to ${req.params.action} claim` });
    }
  },
);

// Get all pending claims (admin)
router.get('/claims/pending', isAuthenticated, checkRole('admin'), async (req, res) => {
  try {
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