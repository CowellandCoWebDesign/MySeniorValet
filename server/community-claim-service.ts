import { db } from './db';
import { communities, communityClaims, claimedCommunities, users, communitySubscriptions } from '@shared/schema';
import { eq, and, or, isNull } from 'drizzle-orm';
import { EmailService } from './services/email';

interface ClaimVerificationResult {
  isValid: boolean;
  verificationMethod: string;
  confidence: number;
  reason?: string;
}

export class CommunityClaimService {
  // Verify ownership claim
  async verifyClaim(claimId: number): Promise<ClaimVerificationResult> {
    const [claim] = await db
      .select()
      .from(communityClaims)
      .where(eq(communityClaims.id, claimId));

    if (!claim) {
      return { isValid: false, verificationMethod: 'none', confidence: 0, reason: 'Claim not found' };
    }

    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.id, claim.communityId));

    if (!community) {
      return { isValid: false, verificationMethod: 'none', confidence: 0, reason: 'Community not found' };
    }

    // Verification methods
    const verifications = await Promise.all([
      this.verifyEmailDomain(claim.claimerEmail, community.website),
      this.verifyPhoneMatch(claim.claimerPhone, community.phone),
      this.verifyHUDMatch(claim.claimerEmail, community.hudPropertyId),
      this.verifyLicenseMatch(claim.businessLicenseNumber, community.licenseNumber)
    ]);

    // Calculate confidence score
    const validVerifications = verifications.filter(v => v.isValid);
    const confidence = validVerifications.length / verifications.length;

    if (confidence >= 0.5) {
      return {
        isValid: true,
        verificationMethod: validVerifications.map(v => v.method).join(', '),
        confidence,
        reason: 'Multiple verification methods passed'
      };
    }

    // Manual review required
    return {
      isValid: false,
      verificationMethod: 'manual_review_required',
      confidence,
      reason: 'Insufficient automatic verification'
    };
  }

  // Verify email domain matches website
  private async verifyEmailDomain(email: string, website?: string | null): Promise<{isValid: boolean, method: string}> {
    if (!email || !website) {
      return { isValid: false, method: 'email_domain' };
    }

    try {
      const emailDomain = email.split('@')[1].toLowerCase();
      const websiteDomain = new URL(website).hostname.toLowerCase().replace('www.', '');
      
      return {
        isValid: emailDomain === websiteDomain || websiteDomain.includes(emailDomain),
        method: 'email_domain'
      };
    } catch {
      return { isValid: false, method: 'email_domain' };
    }
  }

  // Verify phone number match
  private async verifyPhoneMatch(claimPhone?: string | null, communityPhone?: string | null): Promise<{isValid: boolean, method: string}> {
    if (!claimPhone || !communityPhone) {
      return { isValid: false, method: 'phone_match' };
    }

    // Normalize phone numbers
    const normalize = (phone: string) => phone.replace(/\D/g, '');
    
    return {
      isValid: normalize(claimPhone) === normalize(communityPhone),
      method: 'phone_match'
    };
  }

  // Verify HUD property manager email
  private async verifyHUDMatch(email: string, hudPropertyId?: string | null): Promise<{isValid: boolean, method: string}> {
    if (!hudPropertyId) {
      return { isValid: false, method: 'hud_match' };
    }

    // In production, this would check against HUD's property manager database
    // For now, we'll approve government emails for HUD properties
    const isGovEmail = email.endsWith('.gov') || email.endsWith('.org');
    
    return {
      isValid: isGovEmail,
      method: 'hud_match'
    };
  }

  // Verify license number match
  private async verifyLicenseMatch(businessLicense?: string | null, communityLicense?: string | null): Promise<{isValid: boolean, method: string}> {
    if (!businessLicense || !communityLicense) {
      return { isValid: false, method: 'license_match' };
    }

    return {
      isValid: businessLicense.trim().toLowerCase() === communityLicense.trim().toLowerCase(),
      method: 'license_match'
    };
  }

  // Process approved claim
  async approveClaim(claimId: number, reviewerId: string) {
    const [claim] = await db
      .select()
      .from(communityClaims)
      .where(eq(communityClaims.id, claimId));

    if (!claim || claim.status !== 'Pending') {
      throw new Error('Invalid claim status');
    }

    // Start transaction
    await db.transaction(async (tx) => {
      // Update claim status
      await tx
        .update(communityClaims)
        .set({
          status: 'Approved',
          reviewedBy: parseInt(reviewerId),
          reviewedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(communityClaims.id, claimId));

      // Create claimed community record
      await tx.insert(claimedCommunities).values({
        communityId: claim.communityId,
        ownerId: claim.claimerUserId!,
        claimId: claimId,
        businessName: claim.companyName || claim.claimerName,
        operatorType: 'Independent', // Default, can be updated
        isVerified: true,
        verificationLevel: 'Basic',
        subscriptionPlan: 'Free',
        subscriptionStatus: 'Active',
        canUpdatePhotos: true,
        canUpdatePricing: true,
        canUpdateAmenities: true,
        canRespondToReviews: true,
        canReceiveLeads: true,
        claimedAt: new Date()
      });

      // Update community with claimed status
      await tx
        .update(communities)
        .set({
          isClaimed: true,
          claimedBy: claim.claimerUserId,
          updatedAt: new Date()
        })
        .where(eq(communities.id, claim.communityId));

      // Create free tier subscription
      await tx.insert(communitySubscriptions).values({
        communityId: claim.communityId,
        userId: claim.claimerUserId!,
        productId: 'basic-listing',
        status: 'active',
        currentPeriodStart: new Date(),
        metadata: {
          communityName: claim.claimerName,
          managerEmail: claim.claimerEmail,
          features: ['basic_listing', 'photo_upload_5', 'edit_description', 'reply_reviews']
        }
      });
    });

    // Send approval email
    await this.sendApprovalEmail(claim);
  }

  // Send claim approval email
  private async sendApprovalEmail(claim: any) {
    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.id, claim.communityId));

    const emailContent = {
      to: claim.claimerEmail,
      subject: `Your listing claim for ${community.name} has been approved!`,
      html: `
        <h2>Congratulations! Your community listing has been verified.</h2>
        <p>Hello ${claim.claimerName},</p>
        <p>Great news! Your ownership claim for <strong>${community.name}</strong> has been approved.</p>
        
        <h3>What's included in your FREE listing:</h3>
        <ul>
          <li>✓ Verified badge on your listing</li>
          <li>✓ Upload up to 5 photos</li>
          <li>✓ Edit your community description</li>
          <li>✓ Respond to reviews</li>
          <li>✓ Update contact information</li>
        </ul>
        
        <h3>Ready for more visibility?</h3>
        <p>Upgrade to our Featured Spotlight plan for just $149/month and get:</p>
        <ul>
          <li>★ Priority placement in search results</li>
          <li>★ Red tag promotional banners</li>
          <li>★ Upload up to 10 photos</li>
          <li>★ Custom intake forms</li>
          <li>★ Analytics dashboard</li>
        </ul>
        
        <div style="margin: 30px 0;">
          <a href="https://myseniorvalet.com/portal/community/${community.id}" 
             style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Access Your Portal
          </a>
        </div>
        
        <p>Questions? Reply to this email or call us at 1-800-SENIOR-V.</p>
        <p>Best regards,<br>The MySeniorValet Team</p>
      `,
      text: `Your listing claim for ${community.name} has been approved! Access your portal at https://myseniorvalet.com/portal/community/${community.id}`
    };

    await EmailService.sendEmail(emailContent);
  }

  // Get claim status for a community
  async getClaimStatus(communityId: number) {
    const [existingClaim] = await db
      .select()
      .from(communityClaims)
      .where(
        and(
          eq(communityClaims.communityId, communityId),
          or(
            eq(communityClaims.status, 'Pending'),
            eq(communityClaims.status, 'Under Review'),
            eq(communityClaims.status, 'Approved')
          )
        )
      )
      .orderBy(communityClaims.createdAt);

    const [claimedCommunity] = await db
      .select()
      .from(claimedCommunities)
      .where(eq(claimedCommunities.communityId, communityId));

    return {
      hasClaim: !!existingClaim,
      isClaimed: !!claimedCommunity,
      claimStatus: existingClaim?.status,
      claimedBy: claimedCommunity?.businessName,
      verificationLevel: claimedCommunity?.verificationLevel
    };
  }

  // Submit new claim
  async submitClaim(claimData: {
    communityId: number;
    claimerUserId?: number;
    claimerName: string;
    claimerEmail: string;
    claimerPhone?: string;
    position: string;
    companyName?: string;
    businessLicenseNumber?: string;
    reasonForClaim: string;
  }) {
    // Check if already claimed
    const claimStatus = await this.getClaimStatus(claimData.communityId);
    
    if (claimStatus.isClaimed) {
      throw new Error('This community has already been claimed');
    }
    
    if (claimStatus.hasClaim && claimStatus.claimStatus === 'Pending') {
      throw new Error('A claim is already pending for this community');
    }

    // Submit new claim
    const [newClaim] = await db.insert(communityClaims).values({
      ...claimData,
      status: 'Pending',
      priority: 'Medium',
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    // Auto-verify if possible
    const verification = await this.verifyClaim(newClaim.id);
    
    if (verification.isValid && verification.confidence >= 0.75) {
      // Auto-approve high confidence claims
      await this.approveClaim(newClaim.id, 'system');
      return { claimId: newClaim.id, status: 'auto-approved' };
    }

    // Send to manual review
    return { claimId: newClaim.id, status: 'pending-review' };
  }
}

export const communityClaimService = new CommunityClaimService();