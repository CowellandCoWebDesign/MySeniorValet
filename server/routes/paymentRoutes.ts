import { type Express } from "express";
import express from "express";
import { db } from "../db";
import { users, paymentTransactions, vendors, communities } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { isAuthenticated as requireAuth } from "../replitAuth";
import { stripeSubscriptionService } from "../stripe-subscription-service";
import { testStripeCharge } from "../stripe-test";
import { notifySuperAdmin } from "../sendgrid-service";
import Stripe from "stripe";

// Import stripe payment service
import { stripePaymentService } from "../stripe-payment-service";

// Get stripe instance for direct API calls
const stripe = stripePaymentService.getStripe();

export function registerPaymentRoutes(app: Express) {
  // Community Onboarding Routes
  app.post('/api/communities/onboarding/create', async (req, res) => {
    try {
      const { stepId, formData } = req.body;
      
      // Create a new community record
      const [community] = await db.insert(communities).values({
        name: formData.name || 'New Community',
        address: formData.address || '',
        city: formData.city || '',
        state: formData.state || '',
        zipCode: formData.zipCode || '',
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        description: formData.description,
        startingPrice: formData.startingPrice ? parseInt(formData.startingPrice) : null,
        maxPrice: formData.maxPrice ? parseInt(formData.maxPrice) : null,
        amenities: formData.amenities || [],
        healthcareServices: formData.healthcareServices || [],
        subscriptionTier: 'platinum' as const,
        billingStatus: 'active' as const,
        careTypes: ['Senior Living'],
        latitude: 0,
        longitude: 0,
        capacity: 0
      }).returning();
      
      res.json({ success: true, communityId: community.id });
    } catch (error) {
      console.error('Error creating community onboarding:', error);
      res.status(500).json({ error: 'Failed to save onboarding data' });
    }
  });
  
  app.post('/api/communities/:communityId/onboarding', async (req, res) => {
    try {
      const { communityId } = req.params;
      const { stepId, formData } = req.body;
      
      // Sanitize form data to handle empty strings for numeric fields
      const sanitizedData: any = {};
      
      for (const [key, value] of Object.entries(formData)) {
        // Handle numeric fields that might be empty strings
        if (['startingPrice', 'maxPrice', 'capacity'].includes(key)) {
          sanitizedData[key] = value === '' || value === null || value === undefined 
            ? null 
            : parseInt(value as string);
        } else {
          sanitizedData[key] = value;
        }
      }
      
      // Update existing community
      await db.update(communities)
        .set({
          ...sanitizedData,
          updatedAt: new Date()
        })
        .where(eq(communities.id, parseInt(communityId)));
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating community onboarding:', error);
      res.status(500).json({ error: 'Failed to update onboarding data' });
    }
  });
  
  app.post('/api/communities/:communityId/complete-onboarding', async (req, res) => {
    try {
      const { communityId } = req.params;
      
      await db.update(communities)
        .set({
          updatedAt: new Date()
        })
        .where(eq(communities.id, parseInt(communityId)));
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      res.status(500).json({ error: 'Failed to complete onboarding' });
    }
  });
  
  // Vendor Onboarding Routes
  app.post('/api/vendors/onboarding/create', async (req, res) => {
    try {
      const { stepId, formData } = req.body;
      
      // Create a new vendor record
      const [vendor] = await db.insert(vendors).values({
        businessName: formData.businessName || 'New Vendor',
        businessType: formData.businessType || 'company',
        primaryContactName: formData.contactName || formData.businessName,
        primaryContactPhone: formData.phone,
        primaryContactEmail: formData.email,
        website: formData.website,
        description: formData.description,
        serviceRadius: formData.serviceRadius,
        serviceAreas: formData.serviceAreas || [],
        subscriptionTier: 'professional', // They selected a paid tier
        subscriptionStatus: 'active',
        subscriptionStartDate: new Date(),
        status: 'active'
      }).returning();
      
      res.json({ success: true, vendorId: vendor.id });
    } catch (error) {
      console.error('Error creating vendor onboarding:', error);
      res.status(500).json({ error: 'Failed to save onboarding data' });
    }
  });
  
  app.post('/api/vendors/:vendorId/onboarding', async (req, res) => {
    try {
      const { vendorId } = req.params;
      const { stepId, formData } = req.body;
      
      // Update existing vendor
      await db.update(vendors)
        .set({
          ...formData,
          updatedAt: new Date()
        })
        .where(eq(vendors.id, parseInt(vendorId)));
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating vendor onboarding:', error);
      res.status(500).json({ error: 'Failed to update onboarding data' });
    }
  });
  
  app.post('/api/vendors/:vendorId/complete-onboarding', async (req, res) => {
    try {
      const { vendorId } = req.params;
      
      await db.update(vendors)
        .set({
          updatedAt: new Date()
        })
        .where(eq(vendors.id, parseInt(vendorId)));
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error completing vendor onboarding:', error);
      res.status(500).json({ error: 'Failed to complete onboarding' });
    }
  });
  // Create payment intent for Payment Element
  app.post('/api/payments/create-payment-intent', async (req, res) => {
    try {
      const { productId, amount, customerId, metadata } = req.body;

      if (!amount || amount < 50) { // Stripe minimum is 50 cents
        return res.status(400).json({ error: 'Invalid amount' });
      }

      // Create payment intent
      const paymentIntent = await stripePaymentService.createPaymentIntent({
        amount,
        currency: 'usd',
        customer: customerId,
        metadata: {
          ...metadata,
          productId,
          platform: 'myseniorvalet',
          paymentType: productId?.includes('vendor') ? 'vendor_subscription' : 'community_subscription'
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({ 
        error: 'Failed to create payment intent',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Confirm payment completion
  app.post('/api/payments/confirm-payment', async (req, res) => {
    try {
      const { paymentIntentId, productId, vendorData, communityId } = req.body;

      if (!paymentIntentId) {
        return res.status(400).json({ error: 'Payment intent ID required' });
      }

      // Retrieve payment intent to verify status
      const paymentIntent = await stripePaymentService.retrievePaymentIntent(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        // Process the successful payment
        if (productId?.includes('vendor') && vendorData) {
          // Create vendor account and subscription
          console.log('Processing vendor subscription:', { productId, vendorData });
          
          // Create vendor in database
          const tierMap: Record<string, string> = {
            'basic-listing': 'basic',
            'featured-vendor': 'featured',
            'national-partner': 'national-partner'
          };
          
          const [newVendor] = await db.insert(vendors).values({
            businessName: vendorData.businessName,
            businessType: vendorData.businessType || 'company',
            primaryContactName: vendorData.contactName,
            primaryContactEmail: vendorData.email,
            primaryContactPhone: vendorData.phone,
            website: vendorData.website || null,
            description: vendorData.description,
            serviceAreas: vendorData.serviceAreas ? [vendorData.serviceAreas] : [],
            subscriptionTier: tierMap[productId] || 'basic',
            subscriptionStatus: 'active',
            subscriptionStartDate: new Date(),
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
          }).returning();
          
          // Return vendor ID in response
          res.json({ 
            success: true, 
            status: paymentIntent.status,
            message: 'Payment processed successfully',
            vendorId: newVendor.id
          });
          
          return; // Exit early after handling vendor
          
          // Send notification email
          await notifySuperAdmin(
            'New Vendor Signup',
            `A new vendor has signed up for ${productId}:\n\n` +
            `Business: ${vendorData.businessName}\n` +
            `Contact: ${vendorData.contactName}\n` +
            `Email: ${vendorData.email}\n` +
            `Phone: ${vendorData.phone}\n` +
            `Plan: ${productId}\n` +
            `Payment ID: ${paymentIntentId}`
          );
        } else if (communityId) {
          // Update community subscription
          console.log('Processing community subscription:', { productId, communityId });
          
          // Map product ID to subscription tier
          const tierMap: Record<string, 'standard' | 'featured' | 'platinum' | 'verified'> = {
            'standard': 'standard',
            'featured': 'featured',
            'platinum': 'platinum',
            'verified': 'verified'
          };
          
          const tier = tierMap[productId];
          if (!tier || tier === 'verified') {
            // Free tier should not go through payment confirmation
            return res.status(400).json({ 
              error: 'Invalid plan selected. Free tier does not require payment.',
              productId 
            });
          }
          
          // Update community in database
          await db.update(communities)
            .set({
              subscriptionTier: tier,
              stripeCustomerId: paymentIntent.customer as string,
              billingStatus: 'active',
              updatedAt: new Date()
            })
            .where(eq(communities.id, parseInt(communityId)));
          
          // Send notification email
          await notifySuperAdmin(
            'New Community Upgrade',
            `Community ID ${communityId} upgraded to ${productId}\n` +
            `Payment ID: ${paymentIntentId}`
          );
        }

        res.json({ 
          success: true, 
          status: paymentIntent.status,
          message: 'Payment processed successfully'
        });
      } else {
        res.status(400).json({ 
          error: 'Payment not completed',
          status: paymentIntent.status
        });
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      res.status(500).json({ 
        error: 'Failed to confirm payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Claim free tier (no payment required)
  app.post("/api/payments/claim-free-tier", async (req, res) => {
    try {
      const { communityId, isNewCommunity, ...claimData } = req.body;
      
      if (!communityId && !isNewCommunity) {
        return res.status(400).json({ error: "Community ID or new community flag required" });
      }
      
      let finalCommunityId = communityId;
      
      // If it's a new community, create it first
      if (isNewCommunity) {
        const { companyName, businessAddress, claimerEmail, claimerPhone } = claimData;
        
        if (!companyName || !businessAddress) {
          return res.status(400).json({ error: "Company name and address are required" });
        }
        
        // Extract city, state, zip from address (basic parsing)
        const addressParts = businessAddress.split(',').map((p: string) => p.trim());
        const city = addressParts[1] || 'Pending';
        const stateZip = addressParts[2] || 'Pending';
        const [state, zipCode] = stateZip.split(' ').filter(Boolean);
        
        // Create new community
        const [newCommunity] = await db.insert(communities)
          .values({
            name: companyName,
            address: addressParts[0] || businessAddress,
            city,
            state: state || 'Pending',
            zipCode: zipCode || '00000',
            phone: claimerPhone || null,
            email: claimerEmail || null,
            subscriptionTier: 'verified',
            billingStatus: 'active' as const,
            isValidated: true,
            isClaimed: true,
            // Default fields for new communities
            careTypes: ['assisted_living'],
            licensureType: 'unknown',
            mealPlansIncluded: [],
            recreationalActivities: [],
            specializedCare: [],
            medicareAccepted: false,
            medicaidAccepted: false,
            roomTypes: ['private'],
            financialAssistance: [],
            petPolicy: 'Not Allowed',
            transportationProvided: false,
            culturalSpecialties: [],
            amenities: [],
            languagesSpoken: ['English'],
            securityFeatures: [],
            smokingPolicy: 'No Smoking',
            alcoholPolicy: 'Not Allowed',
            visitingHours: '24/7',
            pricingModel: 'Contact for Pricing',
            availableUnits: 0
          })
          .returning({ id: communities.id });
          
        finalCommunityId = newCommunity.id;
        
        // Send notification
        await notifySuperAdmin(
          'New Community Created - Free Tier',
          `New community "${companyName}" created with ID ${finalCommunityId}\n` +
          `Contact: ${claimerEmail}\n` +
          `Phone: ${claimerPhone}`
        );
      } else {
        // Update existing community to verified tier
        await db.update(communities)
          .set({
            subscriptionTier: 'verified',
            billingStatus: 'active',
            updatedAt: new Date()
          })
          .where(eq(communities.id, parseInt(communityId)));
          
        // Send notification
        await notifySuperAdmin(
          'Free Tier Claimed',
          `Community ID ${communityId} claimed free tier`
        );
      }
      
      res.json({ 
        success: true,
        communityId: finalCommunityId,
        message: 'Free tier activated successfully'
      });
    } catch (error) {
      console.error('Error claiming free tier:', error);
      res.status(500).json({ 
        error: 'Failed to claim free tier',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Confirm payment for communities
  app.post("/api/payments/confirm-community-payment", async (req, res) => {
    try {
      const { paymentIntentId, communityId, tier } = req.body;
      
      if (!paymentIntentId || !communityId || !tier) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Free tier should not go through payment confirmation
      if (tier === 'verified') {
        return res.status(400).json({ 
          error: "Invalid request. Free tier does not require payment confirmation.", 
          tier
        });
      }

      // Verify payment status with Stripe
      const paymentIntent = await stripePaymentService.retrievePaymentIntent(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ 
          error: "Payment not completed", 
          status: paymentIntent.status,
          _version: "v4_streamlined_hero_1754286184480",
          _timestamp: Date.now()
        });
      }

      // Track the final community ID for notification
      let finalCommunityId = communityId;
      
      // Handle new communities
      if (communityId === 'new') {
        // For new communities, we'll create a placeholder record
        console.log('New community payment confirmed:', { tier, paymentIntentId });
        
        // Validate tier is paid tier
        if (!['standard', 'featured', 'platinum'].includes(tier)) {
          return res.status(400).json({ 
            error: `Invalid tier "${tier}". Only paid tiers are allowed for new communities.`
          });
        }
        
        // Create new community entry with minimal required fields
        // Fix array initialization to prevent map errors
        const [newCommunity] = await db
          .insert(communities)
          .values({
            name: 'MySeniorValet Test Island 🏝️',
            address: 'Pending',
            city: 'Pending',
            state: 'Pending',
            zipCode: '00000',
            subscriptionTier: tier as 'standard' | 'featured' | 'platinum',
            billingStatus: 'active' as const,
            stripeCustomerId: paymentIntent.customer as string || null,
            // Set non-nullable fields with defaults
            latitude: 0,
            longitude: 0,
            capacity: 0,
            // Use default values for arrays - Drizzle will handle the defaults
            careTypes: ['Pending Verification'],
            amenities: [],
            languagesSpoken: [],
            specialPrograms: [],
            insuranceAccepted: [],
            securityFeatures: [],
            roomTypes: [],
            roomAmenities: [],
            activitiesIncluded: [],
            utilitiesIncluded: [],
            // Set boolean defaults
            virtualTours: false,
            petFriendly: false,
            transportationServices: false,
            mealPlansIncluded: false,
            veteranPrograms: false,
            medicaidAccepted: false,
            medicareAccepted: false,
            privatePayAccepted: true,
            allInclusive: false,
            waitlistAvailable: false,
            // String defaults
            smokingPolicy: 'No Smoking',
            alcoholPolicy: 'Not Allowed',
            visitingHours: '24/7',
            pricingModel: 'Contact for Pricing',
            // Nullable fields
            phone: null,
            email: null,
            website: null,
            description: null,
            yearEstablished: null,
            minAge: null,
            maxAge: null,
            genderRestrictions: null,
            religiousAffiliation: null,
            emergencyResponseTime: null,
            staffingRatio: null,
            startingPrice: null,
            averagePrice: null,
            depositsRequired: null,
            applicationFee: null,
            availableUnits: 0,
            admissionRequirements: null,
            dischargePolicy: null
          })
          .returning({ id: communities.id });
          
        finalCommunityId = newCommunity.id.toString();
      } else {
        // Validate and parse existing communityId
        const parsedCommunityId = parseInt(communityId);
        if (isNaN(parsedCommunityId)) {
          console.error('Invalid communityId:', communityId);
          return res.status(400).json({ 
            error: "Invalid community ID", 
            details: `Community ID must be a valid number, received: ${communityId}`
          });
        }

        // Validate tier for existing communities
        if (!['standard', 'featured', 'platinum'].includes(tier)) {
          return res.status(400).json({ 
            error: `Invalid tier "${tier}". Only paid tiers can be processed through payment confirmation.`
          });
        }
        
        // Update existing community subscription in database
        await db
          .update(communities)
          .set({
            subscriptionTier: tier as 'standard' | 'featured' | 'platinum',
            billingStatus: 'active' as const,
            stripeCustomerId: paymentIntent.customer as string || null,
            updatedAt: new Date()
          })
          .where(eq(communities.id, parsedCommunityId));
      }

      // Send email notification to super admin
      const emailContent = `
        <h2>New Community Upgrade!</h2>
        <p><strong>Community ID:</strong> ${finalCommunityId}</p>
        <p><strong>Tier:</strong> ${tier}</p>
        <p><strong>Payment Intent:</strong> ${paymentIntentId}</p>
        <p><strong>Amount:</strong> $${(paymentIntent.amount / 100).toFixed(2)}</p>
        <p>Please verify the upgrade in the admin dashboard.</p>
      `;

      await notifySuperAdmin(
        'New Community Subscription Upgrade',
        emailContent
      );

      res.json({ 
        success: true, 
        message: "Community upgraded successfully",
        tier: tier
      });
    } catch (error) {
      console.error("Error confirming community payment:", error);
      res.status(500).json({ 
        error: "Failed to confirm payment",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Recovery endpoint for failed payment confirmations
  app.post('/api/payments/recover-failed-payment', async (req, res) => {
    try {
      const { paymentIntentId, communityId, tier, email } = req.body;
      
      // Verify super admin
      if (email !== 'william.cowell01@gmail.com') {
        return res.status(403).json({ error: 'Unauthorized' });
      }
      
      // Verify payment with Stripe
      const paymentIntent = await stripePaymentService.retrievePaymentIntent(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ 
          error: 'Payment not successful',
          status: paymentIntent.status 
        });
      }
      
      // Update community subscription
      await db.update(communities)
        .set({
          subscriptionTier: tier as 'standard' | 'featured' | 'platinum' | 'verified',
          billingStatus: 'active' as const,
          stripeCustomerId: paymentIntent.customer as string || null,
          updatedAt: new Date()
        })
        .where(eq(communities.id, parseInt(communityId)));
      
      // Log recovery
      console.log('Payment recovery successful:', {
        paymentIntentId,
        communityId,
        tier,
        recoveredBy: email
      });
      
      // Send notification
      await notifySuperAdmin(
        'Payment Recovery Completed',
        `Successfully recovered payment for Community ${communityId}\n` +
        `Tier: ${tier}\n` +
        `Payment Intent: ${paymentIntentId}`
      );
      
      res.json({ 
        success: true,
        message: 'Payment recovery successful',
        communityId,
        tier
      });
    } catch (error) {
      console.error('Payment recovery error:', error);
      res.status(500).json({ 
        error: 'Recovery failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Create checkout session for subscription
  app.post('/api/payments/create-session', async (req, res) => {
    try {
      const { productId, successUrl, cancelUrl } = req.body;

      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      // Use community ID 1 as default for now (this can be enhanced later)
      const communityId = 1;
      
      // For now, simulate successful session creation for testing
      // In production, this would use stripeSubscriptionService.createCheckoutSession
      if (productId.includes('vendor') || productId.includes('national-partner')) {
        // Simulate vendor payment flow
        res.json({ 
          sessionId: `cs_test_vendor_${Date.now()}`, 
          url: `https://checkout.stripe.com/test-vendor-${productId}`,
          productId: productId,
          isSimulated: true,
          _version: "v4_streamlined_hero_" + Date.now(),
          _timestamp: Date.now()
        });
        return;
      }
      
      const session = await stripeSubscriptionService.createCheckoutSession(
        communityId,
        productId,
        successUrl || `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/payment/success`,
        cancelUrl || `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/payment/cancel`
      );

      res.json({ 
        sessionId: session.id, 
        url: session.url,
        _version: "v4_streamlined_hero_" + Date.now(),
        _timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ 
        error: 'Failed to create checkout session',
        _version: "v4_streamlined_hero_" + Date.now(),
        _timestamp: Date.now()
      });
    }
  });

  // Create vendor checkout session
  app.post('/api/payments/create-vendor-checkout', async (req, res) => {
    try {
      const { productId, vendorData, successUrl, cancelUrl } = req.body;

      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      // Store vendor data temporarily (in production, save to database)
      console.log('Creating vendor checkout for:', vendorData);
      
      if (!stripeSubscriptionService) {
        console.error('stripeSubscriptionService is not initialized');
        return res.status(500).json({ 
          error: 'Payment service not available',
          _version: "v4_vendor_checkout_" + Date.now()
        });
      }
      
      // Ensure URLs have proper scheme
      const baseUrl = process.env.REPLIT_DEV_DOMAIN 
        ? (process.env.REPLIT_DEV_DOMAIN.startsWith('http') 
          ? process.env.REPLIT_DEV_DOMAIN 
          : `https://${process.env.REPLIT_DEV_DOMAIN}`)
        : 'http://localhost:5000';
      
      const session = await stripeSubscriptionService.createCheckoutSession(
        0, // Use 0 instead of null for vendor checkout
        productId,
        successUrl || `${baseUrl}/payment/success`,
        cancelUrl || `${baseUrl}/payment/cancel`
      );

      res.json({ 
        sessionId: session.id, 
        url: session.url,
        _version: "v4_vendor_checkout_" + Date.now()
      });
    } catch (error) {
      console.error('Error creating vendor checkout session:', error);
      res.status(500).json({ 
        error: 'Failed to create vendor checkout session',
        _version: "v4_vendor_checkout_" + Date.now()
      });
    }
  });

  // Create community checkout session  
  app.post('/api/payments/create-community-checkout', async (req, res) => {
    try {
      const { productId, communityId, successUrl, cancelUrl } = req.body;

      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      // Ensure URLs have proper scheme
      const baseUrl = process.env.REPLIT_DEV_DOMAIN 
        ? (process.env.REPLIT_DEV_DOMAIN.startsWith('http') 
          ? process.env.REPLIT_DEV_DOMAIN 
          : `https://${process.env.REPLIT_DEV_DOMAIN}`)
        : 'http://localhost:5000';
      
      console.log('Creating community checkout with:', {
        productId,
        communityId: communityId || 1,
        successUrl: successUrl || `${baseUrl}/payment/success`,
        cancelUrl: cancelUrl || `${baseUrl}/payment/cancel`,
        baseUrl
      });
      
      const session = await stripeSubscriptionService.createCheckoutSession(
        communityId || 1, // Default to community ID 1 if not specified
        productId,
        successUrl || `${baseUrl}/payment/success`,
        cancelUrl || `${baseUrl}/payment/cancel`,
        {
          type: 'community',
          communityId: communityId || 1
        }
      );

      res.json({ 
        sessionId: session.id, 
        url: session.url,
        _version: "v4_community_checkout_" + Date.now()
      });
    } catch (error) {
      console.error('Error creating community checkout session:', error);
      res.status(500).json({ 
        error: 'Failed to create community checkout session',
        _version: "v4_community_checkout_" + Date.now()
      });
    }
  });

  // Handle Stripe webhook - NOTE: Raw body middleware is applied in server/routes.ts
  app.post('/api/payments/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    // Debug logging
    console.log('📝 Webhook body type:', typeof req.body);
    console.log('📝 Is Buffer?', Buffer.isBuffer(req.body));
    console.log('📝 Body preview:', req.body instanceof Buffer ? 'Buffer data' : JSON.stringify(req.body).substring(0, 100));
    
    if (!sig) {
      console.error('Missing Stripe signature header');
      return res.status(400).json({ 
        error: 'Missing stripe signature',
        _version: "v4_webhook_" + Date.now()
      });
    }

    let event: Stripe.Event;

    try {
      // Ensure we have the webhook secret
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret';
      
      // If body is already parsed, convert back to string (not ideal but works in dev)
      let bodyData: string | Buffer;
      if (Buffer.isBuffer(req.body)) {
        bodyData = req.body;
      } else if (typeof req.body === 'object') {
        console.warn('⚠️ Webhook body was pre-parsed as JSON. Converting back to string.');
        bodyData = JSON.stringify(req.body);
      } else {
        bodyData = req.body;
      }
      
      // Construct event - req.body should be raw Buffer from middleware
      event = stripe.webhooks.constructEvent(
        bodyData,
        Array.isArray(sig) ? sig[0] : sig,
        webhookSecret
      );
      
      console.log(`✅ Webhook received: ${event.type} (${event.id})`);
    } catch (err: any) {
      console.error('⚠️ Webhook signature verification failed:', err.message);
      return res.status(400).json({ 
        error: `Webhook Error: ${err.message}`,
        _version: "v4_webhook_" + Date.now()
      });
    }

    // Important: Return 200 immediately before processing
    res.status(200).json({ received: true });

    // Process webhook asynchronously
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log(`💰 PaymentIntent ${paymentIntent.id} succeeded`);
          await handlePaymentIntentSucceeded(paymentIntent);
          break;

        case 'checkout.session.completed':
          const session = event.data.object as Stripe.Checkout.Session;
          console.log(`✅ Checkout session ${session.id} completed`);
          await handleCheckoutComplete(session);
          break;
        
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          const subscription = event.data.object as Stripe.Subscription;
          console.log(`📋 Subscription ${subscription.id} ${event.type.split('.')[2]}`);
          await handleSubscriptionUpdate(subscription);
          break;
        
        case 'customer.subscription.deleted':
          const deletedSubscription = event.data.object as Stripe.Subscription;
          console.log(`❌ Subscription ${deletedSubscription.id} deleted`);
          await handleSubscriptionCancelled(deletedSubscription);
          break;
        
        case 'invoice.payment_succeeded':
          const invoice = event.data.object as Stripe.Invoice;
          console.log(`✅ Invoice ${invoice.id} payment succeeded`);
          await handlePaymentSucceeded(invoice);
          break;
        
        case 'invoice.payment_failed':
          const failedInvoice = event.data.object as Stripe.Invoice;
          console.log(`❌ Invoice ${failedInvoice.id} payment failed`);
          await handlePaymentFailed(failedInvoice);
          break;

        default:
          console.log(`🔔 Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error(`❌ Error processing webhook ${event.type}:`, error);
      // Don't return error - we already sent 200
    }
  });

  // Get user's payment methods
  app.get('/api/payments/methods', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const [user] = await db
        .select({ stripeCustomerId: users.stripeCustomerId })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user?.stripeCustomerId) {
        return res.json({ paymentMethods: [] });
      }

      const paymentMethods = await stripePaymentService.listPaymentMethods(user.stripeCustomerId);
      res.json({ paymentMethods });
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      res.status(500).json({ message: 'Failed to fetch payment methods' });
    }
  });

  // Add payment method
  app.post('/api/payments/methods', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { paymentMethodId } = req.body;

      if (!paymentMethodId) {
        return res.status(400).json({ message: 'Payment method ID is required' });
      }

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      let customerId = user.stripeCustomerId;

      // Create Stripe customer if doesn't exist
      if (!customerId) {
        const stripe = stripePaymentService.getStripe();
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined,
          metadata: { userId: user.id.toString() }
        });
        
        customerId = customer.id;
        
        await db
          .update(users)
          .set({ stripeCustomerId: customerId })
          .where(eq(users.id, userId));
      }

      const paymentMethod = await stripePaymentService.attachPaymentMethod(
        paymentMethodId,
        customerId!
      );

      res.json({ paymentMethod });
    } catch (error) {
      console.error('Error adding payment method:', error);
      res.status(500).json({ message: 'Failed to add payment method' });
    }
  });

  // Remove payment method
  app.delete('/api/payments/methods/:paymentMethodId', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { paymentMethodId } = req.params;

      await stripePaymentService.detachPaymentMethod(paymentMethodId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error removing payment method:', error);
      res.status(500).json({ message: 'Failed to remove payment method' });
    }
  });

  // Get subscription status
  app.get('/api/payments/subscription', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const [user] = await db
        .select({ 
          stripeSubscriptionId: users.stripeSubscriptionId,
          stripeCustomerId: users.stripeCustomerId
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user?.stripeSubscriptionId) {
        return res.json({ subscription: null });
      }

      const subscription = await stripePaymentService.getSubscription(user.stripeSubscriptionId);
      res.json({ subscription });
    } catch (error) {
      console.error('Error fetching subscription:', error);
      res.status(500).json({ message: 'Failed to fetch subscription' });
    }
  });

  // Cancel subscription
  app.post('/api/payments/subscription/cancel', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const [user] = await db
        .select({ stripeSubscriptionId: users.stripeSubscriptionId })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user?.stripeSubscriptionId) {
        return res.status(400).json({ message: 'No active subscription' });
      }

      const subscription = await stripePaymentService.cancelSubscription(user.stripeSubscriptionId);
      
      // Update user record
      await db
        .update(users)
        .set({ 
          stripeSubscriptionId: null,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      res.json({ subscription });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      res.status(500).json({ message: 'Failed to cancel subscription' });
    }
  });

  // Get payment history
  app.get('/api/payments/history', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const paymentHistory = await db
        .select()
        .from(paymentTransactions)
        .where(eq(paymentTransactions.userId, userId))
        .orderBy(desc(paymentTransactions.createdAt))
        .limit(50);

      res.json(paymentHistory);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      res.status(500).json({ message: 'Failed to fetch payment history' });
    }
  });

  // Create payment intent
  app.post('/api/payment-intent/create', async (req, res) => {
    try {
      const { amount, currency = 'usd', metadata } = req.body;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: currency,
        automatic_payment_methods: { enabled: true },
        metadata: metadata || {}
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        _version: "v4_payment_intent_" + Date.now()
      });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({ 
        error: 'Failed to create payment intent',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Test payment intent confirmation
  app.get('/api/payment-intent/confirm-test', async (req, res) => {
    try {
      // Create a test payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 1000, // $10.00
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
        metadata: { test: 'true' }
      });

      res.json({
        message: 'Test payment intent created',
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status,
        _version: "v4_test_confirm_" + Date.now()
      });
    } catch (error) {
      console.error('Error in confirm test:', error);
      res.status(500).json({ 
        error: 'Failed to create test payment intent',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // List payment methods
  app.get('/api/payments/list-methods', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const [user] = await db
        .select({ stripeCustomerId: users.stripeCustomerId })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user?.stripeCustomerId) {
        return res.json({ paymentMethods: [] });
      }

      const paymentMethods = await stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: 'card'
      });

      res.json({ 
        paymentMethods: paymentMethods.data,
        _version: "v4_list_methods_" + Date.now()
      });
    } catch (error) {
      console.error('Error listing payment methods:', error);
      res.status(500).json({ 
        error: 'Failed to list payment methods',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}

// Helper functions for webhook handlers
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const metadata = paymentIntent.metadata;
    if (!metadata) return;

    // Log successful payment
    console.log('Processing successful payment:', {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      metadata
    });

    // Handle vendor or community payments based on metadata
    if (metadata.paymentType === 'vendor_subscription' && metadata.vendorData) {
      const vendorData = JSON.parse(metadata.vendorData);
      console.log('Creating vendor from payment intent:', vendorData);
      // Vendor creation logic here
    }

    // Send notification
    await notifySuperAdmin(
      'Payment Intent Succeeded',
      `Payment of $${(paymentIntent.amount / 100).toFixed(2)} completed\n` +
      `Payment ID: ${paymentIntent.id}\n` +
      `Type: ${metadata.paymentType || 'unknown'}`
    );
  } catch (error) {
    console.error('Error handling payment intent succeeded:', error);
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  try {
    // Handle both subscription and one-time payments
    const metadata = session.metadata || {};
    
    if (session.mode === 'subscription' && session.subscription) {
      // Handle subscription checkout
      if (metadata.type === 'vendor') {
        console.log('Vendor subscription checkout completed:', session.id);
        // Create vendor account logic
      } else if (metadata.communityId) {
        const communityId = parseInt(metadata.communityId);
        console.log('Community subscription checkout completed:', { communityId, sessionId: session.id });
        
        // Update community subscription
        await db.update(communities)
          .set({
            stripeCustomerId: session.customer as string,
            subscriptionTier: metadata.productId as any,
            billingStatus: 'active' as const,
            updatedAt: new Date()
          })
          .where(eq(communities.id, communityId));
      }
    }

    // Send notification
    await notifySuperAdmin(
      'Checkout Session Completed',
      `Checkout completed for ${session.mode} mode\n` +
      `Session ID: ${session.id}\n` +
      `Customer: ${session.customer_email || session.customer}\n` +
      `Amount: $${((session.amount_total || 0) / 100).toFixed(2)}`
    );
  } catch (error) {
    console.error('Error handling checkout complete:', error);
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  await db
    .update(users)
    .set({
      stripeSubscriptionId: subscription.id,
      updatedAt: new Date()
    })
    .where(eq(users.id, userId));
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  await db
    .update(users)
    .set({
      stripeSubscriptionId: null,
      updatedAt: new Date()
    })
    .where(eq(users.id, userId));
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!invoice.customer) return;

  // Record payment
  const customerId = invoice.customer as string;
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.stripeCustomerId, customerId))
    .limit(1);

  if (!user) return;

  await db
    .insert(paymentTransactions)
    .values({
      userId: user.id,
      amount: invoice.amount_paid / 100, // Convert from cents
      currency: invoice.currency,
      status: 'succeeded' as const,
      stripePaymentIntentId: typeof invoice.payment_intent === 'string' ? invoice.payment_intent : null,
      description: 'Subscription payment'
    });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.customer) return;

  const customerId = invoice.customer as string;
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.stripeCustomerId, customerId))
    .limit(1);

  if (!user) return;

  // Update subscription status
  await db
    .update(users)
    .set({
      subscriptionStatus: 'past_due',
      updatedAt: new Date()
    })
    .where(eq(users.id, user.id));

  // TODO: Send payment failed notification
}