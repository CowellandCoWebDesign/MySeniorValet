import { type Express } from 'express';
import { db } from '../db';
import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { eq } from 'drizzle-orm';
import { communities } from '../../shared/schema';

// Zod schemas for validation
const CommunityFormDataSchema = z.object({
  name: z.string().min(1, 'Community name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Valid email is required'),
  website: z.string().optional(),
  description: z.string().optional(),
  careTypes: z.array(z.string()).min(1, 'At least one care type must be selected'),
  amenities: z.array(z.string()),
  subscriptionTier: z.enum(['verified', 'standard', 'featured', 'platinum'])
});

export function registerCommunityOnboardingRoutes(app: Express) {
  // Create new community from onboarding flow
  app.post('/api/communities/onboarding/create', async (req, res) => {
    try {
      const { stepId, formData } = req.body;
      
      if (stepId !== 'complete') {
        return res.status(400).json({
          success: false,
          message: 'Invalid step ID'
        });
      }

      // Validate form data
      const validatedData = CommunityFormDataSchema.parse(formData);
      
      // Generate slug from name
      const slug = validatedData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      // Create community record
      const communityData = {
        name: validatedData.name,
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        zip_code: validatedData.zipCode,
        phone: validatedData.phone,
        email: validatedData.email,
        website: validatedData.website || null,
        description: validatedData.description || null,
        care_types: validatedData.careTypes,
        amenities: validatedData.amenities,
        subscription_tier: validatedData.subscriptionTier,
        billing_status: validatedData.subscriptionTier === 'verified' ? 'active' : 'pending',
        slug: slug,
        data_source_note: 'Community Creator Onboarding',
        subtype: 'Senior Living Community',
        community_type: validatedData.careTypes.includes('Independent Living') ? 'Independent Living' : 
                       validatedData.careTypes.includes('Assisted Living') ? 'Assisted Living' :
                       validatedData.careTypes.includes('Memory Care') ? 'Memory Care' :
                       'Senior Living',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      const result = await db.insert(communities).values(communityData).returning({ id: communities.id });
      const communityId = result[0].id;

      res.json({
        success: true,
        message: 'Community created successfully',
        communityId: communityId.toString(),
        subscriptionTier: validatedData.subscriptionTier,
        requiresPayment: validatedData.subscriptionTier !== 'verified'
      });

    } catch (error) {
      console.error('Error creating community:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create community',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  });

  // Update community onboarding step progress
  app.post('/api/communities/onboarding/progress/:communityId', async (req, res) => {
    try {
      const { communityId } = req.params;
      const { stepId, completed, formData } = req.body;

      // For now, just return success since we're handling complete creation in one step
      res.json({
        success: true,
        message: 'Progress updated',
        communityId,
        stepId,
        completed
      });

    } catch (error) {
      console.error('Error updating onboarding progress:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update progress'
      });
    }
  });

  // Get community onboarding status
  app.get('/api/communities/onboarding/status/:communityId', async (req, res) => {
    try {
      const { communityId } = req.params;

      // Check if community exists and get its current status
      const community = await db
        .select({
          id: communities.id,
          name: communities.name,
          subscription_tier: communities.subscription_tier,
          billing_status: communities.billing_status,
          is_active: communities.is_active
        })
        .from(communities)
        .where(eq(communities.id, parseInt(communityId)))
        .limit(1);

      if (community.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Community not found'
        });
      }

      const communityData = community[0];

      res.json({
        success: true,
        community: {
          id: communityData.id,
          name: communityData.name,
          subscriptionTier: communityData.subscription_tier,
          billingStatus: communityData.billing_status,
          isActive: communityData.is_active,
          onboardingComplete: true // Since we create complete records
        }
      });

    } catch (error) {
      console.error('Error getting onboarding status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get onboarding status'
      });
    }
  });
}