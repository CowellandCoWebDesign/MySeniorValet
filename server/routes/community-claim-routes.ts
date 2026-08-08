import { Router } from 'express';
import { db } from '../db';
import { communities, communityClaims, claimedCommunities } from '@shared/schema';
import { eq, and, or } from 'drizzle-orm';
import { communityClaimService } from '../community-claim-service';
import { removeOperatorClaimVerification } from '../services/operator-claim-lifecycle';
import { isAuthenticated, checkRole } from '../auth-middleware';
import { requireAuthenticatedOperatorUserId } from '../services/operator-claim-identity';

const router = Router();

// Get claim status for a community
router.get('/status/:communityId', async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    const status = await communityClaimService.getClaimStatus(communityId);
    
    res.json(status);
  } catch (error: any) {
    console.error('Error getting claim status:', error);
    res.status(500).json({ error: 'Failed to get claim status' });
  }
});

// Submit a new claim
router.post('/submit', isAuthenticated, async (req, res) => {
  try {
    const claimerUserId = requireAuthenticatedOperatorUserId(req as any);
    const {
      communityId,
      claimerName,
      claimerEmail,
      claimerPhone,
      position,
      companyName,
      businessLicenseNumber,
      reasonForClaim
    } = req.body;

    // Validate required fields
    if (!communityId || !claimerName || !claimerEmail || !position || !reasonForClaim) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await communityClaimService.submitClaim({
      communityId,
      claimerUserId,
      claimerName,
      claimerEmail,
      claimerPhone,
      position,
      companyName,
      businessLicenseNumber,
      reasonForClaim
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error submitting claim:', error);
    res.status(500).json({ error: error.message || 'Failed to submit claim' });
  }
});

// Admin: Get pending claims
router.get('/pending', isAuthenticated, checkRole('admin'), async (req, res) => {
  try {
    const pendingClaims = await db
      .select({
        claim: communityClaims,
        community: communities
      })
      .from(communityClaims)
      .leftJoin(communities, eq(communityClaims.communityId, communities.id))
      .where(eq(communityClaims.status, 'Pending'))
      .orderBy(communityClaims.createdAt);

    res.json(pendingClaims);
  } catch (error: any) {
    console.error('Error fetching pending claims:', error);
    res.status(500).json({ error: 'Failed to fetch pending claims' });
  }
});

// Admin: Approve claim
router.post('/approve/:claimId', isAuthenticated, checkRole('admin'), async (req, res) => {
  try {
    const claimId = parseInt(req.params.claimId);
    await communityClaimService.approveClaim(
      claimId,
      String(requireAuthenticatedOperatorUserId(req as any)),
    );
    
    res.json({ success: true, message: 'Claim approved successfully' });
  } catch (error: any) {
    console.error('Error approving claim:', error);
    res.status(500).json({ error: error.message || 'Failed to approve claim' });
  }
});

// Admin: Reject claim
router.post('/reject/:claimId', isAuthenticated, checkRole('admin'), async (req, res) => {
  try {
    const claimId = parseInt(req.params.claimId);
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    await removeOperatorClaimVerification({
      claimId,
      reviewerId: requireAuthenticatedOperatorUserId(req as any),
      status: 'Rejected',
      reason: rejectionReason,
    });

    res.json({ success: true, message: 'Claim rejected' });
  } catch (error) {
    console.error('Error rejecting claim:', error);
    res.status(500).json({ error: 'Failed to reject claim' });
  }
});

// Get claimed communities for a user
router.get('/my-communities', isAuthenticated, async (req, res) => {
  try {
    const ownerId = requireAuthenticatedOperatorUserId(req as any);
    const userClaimedCommunities = await db
      .select({
        claimed: claimedCommunities,
        community: communities
      })
      .from(claimedCommunities)
      .leftJoin(communities, eq(claimedCommunities.communityId, communities.id))
      .where(eq(claimedCommunities.ownerId, ownerId));

    res.json(userClaimedCommunities);
  } catch (error) {
    console.error('Error fetching claimed communities:', error);
    res.status(500).json({ error: 'Failed to fetch claimed communities' });
  }
});

export default router;