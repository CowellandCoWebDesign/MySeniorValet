import { Router } from 'express';
import { db } from '../db';
import { verifiedCommunityProfiles, communities, communityClaims } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Get verified profile for a community
router.get('/communities/:id/verified-profile', async (req, res) => {
  try {
    const communityId = parseInt(req.params.id);
    
    const [profile] = await db
      .select({
        profile: verifiedCommunityProfiles,
        community: {
          id: communities.id,
          name: communities.name,
          city: communities.city,
          state: communities.state
        }
      })
      .from(verifiedCommunityProfiles)
      .innerJoin(communities, eq(verifiedCommunityProfiles.communityId, communities.id))
      .where(eq(verifiedCommunityProfiles.communityId, communityId))
      .limit(1);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Verified profile not found'
      });
    }
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching verified profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch verified profile'
    });
  }
});

// Update verified profile (for community owners)
const updateProfileSchema = z.object({
  businessHours: z.record(z.object({
    open: z.string(),
    close: z.string(),
    closed: z.boolean().optional()
  })).optional(),
  responseTimeHours: z.number().optional(),
  responseRatePercent: z.number().optional(),
  virtualTourUrl: z.string().url().optional(),
  bookingUrl: z.string().url().optional(),
  calendarLink: z.string().url().optional(),
  tourSchedulingEnabled: z.boolean().optional(),
  instantTourBooking: z.boolean().optional(),
  acceptsMedicare: z.boolean().optional(),
  acceptsMedicaid: z.boolean().optional(),
  acceptsVaBenefits: z.boolean().optional(),
  acceptsPrivateInsurance: z.boolean().optional(),
  insurancePartners: z.array(z.string()).optional(),
  paymentOptions: z.array(z.string()).optional(),
  priceTransparencyEnabled: z.boolean().optional(),
  availabilityTransparencyEnabled: z.boolean().optional(),
  staffRatiosPublic: z.boolean().optional(),
  inspectionReportsPublic: z.boolean().optional(),
  specialOffers: z.array(z.object({
    title: z.string(),
    description: z.string(),
    validUntil: z.string().optional(),
    terms: z.string().optional()
  })).optional(),
  featuredAmenities: z.array(z.string()).optional(),
  awardsCertifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    year: z.number(),
    imageUrl: z.string().optional()
  })).optional(),
  promotionalVideoUrl: z.string().url().optional()
});

router.patch('/communities/:id/verified-profile', async (req, res) => {
  try {
    const communityId = parseInt(req.params.id);
    const validatedData = updateProfileSchema.parse(req.body);
    
    // TODO: Check if user is authorized to update this profile
    
    const [updatedProfile] = await db
      .update(verifiedCommunityProfiles)
      .set({
        ...validatedData,
        lastUpdatedBy: 'community_owner', // TODO: Use actual user ID
        lastUpdatedAt: new Date()
      })
      .where(eq(verifiedCommunityProfiles.communityId, communityId))
      .returning();
    
    res.json({
      success: true,
      data: updatedProfile,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating verified profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

// Enable/disable transparency features
router.patch('/communities/:id/transparency-settings', async (req, res) => {
  try {
    const communityId = parseInt(req.params.id);
    const { 
      priceTransparency,
      availabilityTransparency,
      staffRatios,
      inspectionReports 
    } = req.body;
    
    // TODO: Check if user is authorized
    
    const updates: any = {};
    if (priceTransparency !== undefined) updates.priceTransparencyEnabled = priceTransparency;
    if (availabilityTransparency !== undefined) updates.availabilityTransparencyEnabled = availabilityTransparency;
    if (staffRatios !== undefined) updates.staffRatiosPublic = staffRatios;
    if (inspectionReports !== undefined) updates.inspectionReportsPublic = inspectionReports;
    
    const [updatedProfile] = await db
      .update(verifiedCommunityProfiles)
      .set({
        ...updates,
        lastUpdatedAt: new Date()
      })
      .where(eq(verifiedCommunityProfiles.communityId, communityId))
      .returning();
    
    res.json({
      success: true,
      data: updatedProfile,
      message: 'Transparency settings updated'
    });
  } catch (error) {
    console.error('Error updating transparency settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update transparency settings'
    });
  }
});

// Get verification badge status
router.get('/communities/:id/verification-badge', async (req, res) => {
  try {
    const communityId = parseInt(req.params.id);
    
    const [profile] = await db
      .select({
        hasProfile: verifiedCommunityProfiles.id,
        verificationBadge: verifiedCommunityProfiles.verificationBadge,
        verificationTier: verifiedCommunityProfiles.verificationTier,
        verificationExpires: verifiedCommunityProfiles.verificationExpires
      })
      .from(verifiedCommunityProfiles)
      .where(eq(verifiedCommunityProfiles.communityId, communityId))
      .limit(1);
    
    if (!profile) {
      return res.json({
        success: true,
        data: {
          hasVerification: false,
          badge: false,
          tier: null,
          expires: null
        }
      });
    }
    
    // Check if verification is still valid
    const isExpired = profile.verificationExpires && 
                     new Date(profile.verificationExpires) < new Date();
    
    res.json({
      success: true,
      data: {
        hasVerification: true,
        badge: profile.verificationBadge && !isExpired,
        tier: profile.verificationTier,
        expires: profile.verificationExpires,
        isExpired
      }
    });
  } catch (error) {
    console.error('Error fetching verification badge:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch verification status'
    });
  }
});

// Upgrade verification tier (for payment flow)
router.post('/communities/:id/upgrade-tier', async (req, res) => {
  try {
    const communityId = parseInt(req.params.id);
    const { tier, duration = 365 } = req.body; // duration in days
    
    // TODO: Verify payment has been made
    
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + duration);
    
    const [updatedProfile] = await db
      .update(verifiedCommunityProfiles)
      .set({
        verificationTier: tier,
        verificationExpires: expirationDate.toISOString().split('T')[0],
        lastUpdatedAt: new Date()
      })
      .where(eq(verifiedCommunityProfiles.communityId, communityId))
      .returning();
    
    // Enable more features based on tier
    if (tier === 'premium' || tier === 'platinum') {
      await db
        .update(verifiedCommunityProfiles)
        .set({
          competitorInsightsEnabled: true,
          priceTransparencyEnabled: true,
          availabilityTransparencyEnabled: true
        })
        .where(eq(verifiedCommunityProfiles.communityId, communityId));
    }
    
    res.json({
      success: true,
      data: updatedProfile,
      message: `Successfully upgraded to ${tier} tier`
    });
  } catch (error) {
    console.error('Error upgrading tier:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upgrade tier'
    });
  }
});

// Get all verified communities (with badges)
router.get('/communities/verified', async (req, res) => {
  try {
    const { tier, state, city } = req.query;
    
    let query = db
      .select({
        community: communities,
        profile: verifiedCommunityProfiles
      })
      .from(verifiedCommunityProfiles)
      .innerJoin(communities, eq(verifiedCommunityProfiles.communityId, communities.id))
      .where(eq(verifiedCommunityProfiles.verificationBadge, true));
    
    const results = await query;
    
    // Filter by tier if specified
    let filtered = results;
    if (tier) {
      filtered = filtered.filter(r => r.profile.verificationTier === tier);
    }
    
    // Filter by location if specified
    if (state) {
      filtered = filtered.filter(r => r.community.state === state);
    }
    if (city) {
      filtered = filtered.filter(r => r.community.city === city);
    }
    
    res.json({
      success: true,
      data: filtered,
      count: filtered.length
    });
  } catch (error) {
    console.error('Error fetching verified communities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch verified communities'
    });
  }
});

export default router;