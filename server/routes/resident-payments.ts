import express, { type Express } from "express";
import Stripe from "stripe";
import { db } from "../db";
import { eq, and, desc } from "drizzle-orm";
import { residents, paymentMethods, residentPayments } from "@shared/schema";
import { isAuthenticated } from "../auth-middleware";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-07-30.basil",
});

const CONVENIENCE_FEE = 1.99; // $1.99 processing fee

export function registerResidentPaymentRoutes(app: Express) {
  // Get resident profile
  app.get("/api/resident/:residentId", isAuthenticated, async (req, res) => {
    try {
      const residentId = parseInt(req.params.residentId);
      const userId = (req.user as any)?.claims?.sub;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const [resident] = await db.select()
        .from(residents)
        .where(eq(residents.id, residentId))
        .limit(1);

      if (!resident) {
        return res.status(404).json({ message: "Resident not found" });
      }

      // Verify resident belongs to logged-in user (fail closed if userId is missing)
      if (!resident.userId || resident.userId.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Forbidden" });
      }

      res.json(resident);
    } catch (error: any) {
      console.error('Error fetching resident:', error);
      res.status(500).json({ message: "Error fetching resident", error: error.message });
    }
  });

  // Get resident payment methods
  app.get("/api/resident/:residentId/payment-methods", isAuthenticated, async (req, res) => {
    try {
      const residentId = parseInt(req.params.residentId);
      const userId = (req.user as any)?.claims?.sub;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Verify resident belongs to logged-in user
      const [resident] = await db.select()
        .from(residents)
        .where(eq(residents.id, residentId))
        .limit(1);

      if (!resident || !resident.userId || resident.userId.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const methods = await db.select()
        .from(paymentMethods)
        .where(and(
          eq(paymentMethods.residentId, residentId),
          eq(paymentMethods.status, 'active')
        ))
        .orderBy(desc(paymentMethods.isDefault));

      res.json(methods);
    } catch (error: any) {
      console.error('Error fetching payment methods:', error);
      res.status(500).json({ message: "Error fetching payment methods", error: error.message });
    }
  });

  // Create payment intent for rent payment with convenience fee
  app.post("/api/resident/payment/create-intent", isAuthenticated, async (req, res) => {
    try {
      const { residentId, amount, paymentType, paymentMethodId, description } = req.body;
      const userId = (req.user as any)?.claims?.sub;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const [resident] = await db.select()
        .from(residents)
        .where(eq(residents.id, residentId))
        .limit(1);

      if (!resident) {
        return res.status(404).json({ message: "Resident not found" });
      }

      // Verify resident belongs to logged-in user (fail closed if userId is missing)
      if (!resident.userId || resident.userId.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Calculate total with convenience fee
      const baseAmount = parseFloat(amount);
      const totalAmount = baseAmount + CONVENIENCE_FEE;

      // Look up the payment method to get Stripe payment method ID
      if (!paymentMethodId) {
        return res.status(400).json({ message: "Payment method required" });
      }

      const [paymentMethodRecord] = await db.select()
        .from(paymentMethods)
        .where(and(
          eq(paymentMethods.id, parseInt(paymentMethodId)),
          eq(paymentMethods.residentId, residentId)
        ))
        .limit(1);

      if (!paymentMethodRecord) {
        return res.status(404).json({ message: "Payment method not found" });
      }

      const stripePaymentMethodId = paymentMethodRecord.stripePaymentMethodId;

      // Create Payment Intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100), // Convert to cents
        currency: 'usd',
        payment_method: stripePaymentMethodId,
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never'
        },
        metadata: {
          residentId: residentId.toString(),
          communityId: resident.communityId.toString(),
          paymentType: paymentType || 'rent',
          baseAmount: baseAmount.toString(),
          convenienceFee: CONVENIENCE_FEE.toString(),
        },
        description: description || `${paymentType || 'Rent'} payment for ${resident.firstName} ${resident.lastName}`,
      });

      // Create payment record
      const receiptNumber = `RCP-${Date.now()}-${residentId}`;
      
      const [payment] = await db.insert(residentPayments)
        .values({
          residentId,
          communityId: resident.communityId,
          paymentMethodId: parseInt(paymentMethodId),
          stripePaymentIntentId: paymentIntent.id,
          stripeChargeId: paymentIntent.latest_charge as string,
          amount: baseAmount.toString(),
          convenienceFee: CONVENIENCE_FEE.toString(),
          totalAmount: totalAmount.toString(),
          paymentType: paymentType || 'rent',
          paymentMethod: paymentMethodRecord.type === 'us_bank_account' ? 'ach' : 'card',
          status: paymentIntent.status === 'succeeded' ? 'succeeded' : 'processing',
          receiptNumber,
          notes: description,
        })
        .returning();

      res.json({
        success: true,
        paymentIntent,
        payment,
        convenienceFee: CONVENIENCE_FEE,
        totalAmount
      });
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({ 
        message: "Error processing payment", 
        error: error.message 
      });
    }
  });

  // Add payment method for resident
  app.post("/api/resident/payment-method/add", isAuthenticated, async (req, res) => {
    try {
      const { residentId, paymentMethodId, setAsDefault } = req.body;
      const userId = (req.user as any)?.claims?.sub;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const [resident] = await db.select()
        .from(residents)
        .where(eq(residents.id, residentId))
        .limit(1);

      if (!resident) {
        return res.status(404).json({ message: "Resident not found" });
      }

      // Verify resident belongs to logged-in user (fail closed if userId is missing)
      if (!resident.userId || resident.userId.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Retrieve payment method from Stripe
      const stripePaymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

      // If setting as default, unset other defaults
      if (setAsDefault) {
        await db.update(paymentMethods)
          .set({ isDefault: false })
          .where(eq(paymentMethods.residentId, residentId));
      }

      // Store payment method
      const paymentMethodData: any = {
        residentId,
        stripePaymentMethodId: paymentMethodId,
        type: stripePaymentMethod.type,
        isDefault: setAsDefault || false,
        status: 'active',
      };

      // Add card-specific details
      if (stripePaymentMethod.type === 'card' && stripePaymentMethod.card) {
        paymentMethodData.cardBrand = stripePaymentMethod.card.brand;
        paymentMethodData.cardLast4 = stripePaymentMethod.card.last4;
        paymentMethodData.cardExpMonth = stripePaymentMethod.card.exp_month;
        paymentMethodData.cardExpYear = stripePaymentMethod.card.exp_year;
      }

      // Add ACH-specific details
      if (stripePaymentMethod.type === 'us_bank_account' && stripePaymentMethod.us_bank_account) {
        paymentMethodData.bankName = stripePaymentMethod.us_bank_account.bank_name;
        paymentMethodData.accountLast4 = stripePaymentMethod.us_bank_account.last4;
        paymentMethodData.accountType = stripePaymentMethod.us_bank_account.account_type;
        paymentMethodData.achVerificationStatus = 'verified'; // Stripe handles verification
      }

      const [savedMethod] = await db.insert(paymentMethods)
        .values(paymentMethodData)
        .returning();

      res.json({ success: true, paymentMethod: savedMethod });
    } catch (error: any) {
      console.error('Error adding payment method:', error);
      res.status(500).json({ 
        message: "Error adding payment method", 
        error: error.message 
      });
    }
  });

  // Get payment history for resident
  app.get("/api/resident/:residentId/payments", isAuthenticated, async (req, res) => {
    try {
      const residentId = parseInt(req.params.residentId);
      const userId = (req.user as any)?.claims?.sub;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Verify resident belongs to logged-in user
      const [resident] = await db.select()
        .from(residents)
        .where(eq(residents.id, residentId))
        .limit(1);

      if (!resident || !resident.userId || resident.userId.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const payments = await db.select()
        .from(residentPayments)
        .where(eq(residentPayments.residentId, residentId))
        .orderBy(desc(residentPayments.createdAt))
        .limit(50);

      res.json(payments);
    } catch (error: any) {
      console.error('Error fetching payment history:', error);
      res.status(500).json({ message: "Error fetching payment history", error: error.message });
    }
  });

  // Get payment history for community (admin view)
  app.get("/api/community/:communityId/resident-payments", isAuthenticated, async (req, res) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const userId = (req.user as any)?.claims?.sub;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // TODO: Add community ownership verification
      
      const payments = await db.select()
        .from(residentPayments)
        .where(eq(residentPayments.communityId, communityId))
        .orderBy(desc(residentPayments.createdAt))
        .limit(100);

      res.json(payments);
    } catch (error: any) {
      console.error('Error fetching community payments:', error);
      res.status(500).json({ message: "Error fetching payments", error: error.message });
    }
  });

  // Create Setup Intent for adding payment method
  app.post("/api/resident/setup-intent", isAuthenticated, async (req, res) => {
    try {
      const { residentId, paymentMethodType } = req.body;
      const userId = (req.user as any)?.claims?.sub;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const [resident] = await db.select()
        .from(residents)
        .where(eq(residents.id, residentId))
        .limit(1);

      if (!resident) {
        return res.status(404).json({ message: "Resident not found" });
      }

      // Verify resident belongs to logged-in user (fail closed if userId is missing)
      if (!resident.userId || resident.userId.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const setupIntent = await stripe.setupIntents.create({
        payment_method_types: paymentMethodType === 'ach' ? ['us_bank_account'] : ['card'],
        metadata: {
          residentId: residentId.toString(),
          communityId: resident.communityId.toString(),
        },
        ...(paymentMethodType === 'ach' && {
          payment_method_options: {
            us_bank_account: {
              financial_connections: {
                permissions: ['payment_method'],
              },
              verification_method: 'instant',
            },
          },
        }),
      });

      res.json({ clientSecret: setupIntent.client_secret });
    } catch (error: any) {
      console.error('Error creating setup intent:', error);
      res.status(500).json({ 
        message: "Error creating setup intent", 
        error: error.message 
      });
    }
  });
}
