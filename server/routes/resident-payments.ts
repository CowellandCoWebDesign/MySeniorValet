import express, { type Express } from "express";
import Stripe from "stripe";
import { db } from "../db";
import { eq, and, desc } from "drizzle-orm";
import { residents, paymentMethods, residentPayments, communities, paymentReceipts } from "@shared/schema";
import { isAuthenticated } from "../auth-middleware";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
});

const CONVENIENCE_FEE = 1.99; // $1.99 processing fee

// Helper function to generate receipt HTML
function generateReceiptHtml(data: {
  receiptNumber: string;
  residentName: string;
  communityName: string;
  paymentType: string;
  amount: number;
  convenienceFee: number;
  totalAmount: number;
  paymentDate: string;
  paymentMethod: string;
  lastFour: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Payment Receipt - ${data.receiptNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
        .receipt-title { font-size: 20px; margin-top: 10px; }
        .receipt-number { color: #666; margin-top: 5px; }
        .section { margin: 20px 0; padding: 15px; background: #f9fafb; border-radius: 8px; }
        .row { display: flex; justify-content: space-between; margin: 8px 0; }
        .label { color: #666; }
        .value { font-weight: bold; }
        .total { border-top: 2px solid #2563eb; padding-top: 10px; margin-top: 10px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">MySeniorValet</div>
        <div class="receipt-title">Payment Receipt</div>
        <div class="receipt-number">${data.receiptNumber}</div>
      </div>
      
      <div class="section">
        <h3>Payment Information</h3>
        <div class="row">
          <span class="label">Date:</span>
          <span class="value">${data.paymentDate}</span>
        </div>
        <div class="row">
          <span class="label">Resident:</span>
          <span class="value">${data.residentName}</span>
        </div>
        <div class="row">
          <span class="label">Community:</span>
          <span class="value">${data.communityName}</span>
        </div>
        <div class="row">
          <span class="label">Payment Type:</span>
          <span class="value">${data.paymentType.charAt(0).toUpperCase() + data.paymentType.slice(1)}</span>
        </div>
      </div>
      
      <div class="section">
        <h3>Payment Details</h3>
        <div class="row">
          <span class="label">Payment Method:</span>
          <span class="value">${data.paymentMethod} ending in ${data.lastFour}</span>
        </div>
        <div class="row">
          <span class="label">Amount:</span>
          <span class="value">$${data.amount.toFixed(2)}</span>
        </div>
        <div class="row">
          <span class="label">Processing Fee:</span>
          <span class="value">$${data.convenienceFee.toFixed(2)}</span>
        </div>
        <div class="row total">
          <span class="label"><strong>Total Paid:</strong></span>
          <span class="value"><strong>$${data.totalAmount.toFixed(2)}</strong></span>
        </div>
      </div>
      
      <div class="footer">
        <p>Thank you for your payment!</p>
        <p>This receipt serves as confirmation of your payment.</p>
        <p>MySeniorValet - Trusted Senior Living Platform</p>
      </div>
    </body>
    </html>
  `;
}

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

      // Get community's Stripe Connect account
      const [community] = await db.select()
        .from(communities)
        .where(eq(communities.id, resident.communityId))
        .limit(1);
      
      if (!community) {
        return res.status(404).json({ message: "Community not found" });
      }

      // Check if community has Stripe Connect account set up
      let paymentIntentOptions: any = {
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
      };

      // If community has Stripe Connect, route payment to them
      if (community.stripeConnectedAccountId && community.stripeOnboardingCompleted) {
        // Platform fee: MySeniorValet takes 2% of base amount
        const platformFee = Math.round(baseAmount * 0.02 * 100); // 2% platform fee in cents
        
        paymentIntentOptions = {
          ...paymentIntentOptions,
          // Route payment to community's connected account
          transfer_data: {
            destination: community.stripeConnectedAccountId,
            // Community receives base amount minus platform fee
            amount: Math.round((baseAmount - (baseAmount * 0.02)) * 100),
          },
          // Platform fee goes to MySeniorValet
          application_fee_amount: platformFee,
          // Connected account appears on customer's statement
          on_behalf_of: community.stripeConnectedAccountId,
          statement_descriptor_suffix: community.name.substring(0, 22), // Max 22 chars
        };
      }

      // Create Payment Intent
      const paymentIntent = await stripe.paymentIntents.create(paymentIntentOptions);

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

      // Generate receipt if payment succeeded
      if (paymentIntent.status === 'succeeded') {
        const receiptHtml = generateReceiptHtml({
          receiptNumber,
          residentName: `${resident.firstName} ${resident.lastName}`,
          communityName: `Community #${resident.communityId}`, // Will be updated when we fetch community name
          paymentType: paymentType || 'rent',
          amount: baseAmount,
          convenienceFee: CONVENIENCE_FEE,
          totalAmount,
          paymentDate: new Date().toLocaleDateString(),
          paymentMethod: paymentMethodRecord.type === 'us_bank_account' ? 'ACH Bank Transfer' : 'Credit/Debit Card',
          lastFour: paymentMethodRecord.cardLast4 || paymentMethodRecord.accountLast4 || '****',
        });

        await db.insert(paymentReceipts)
          .values({
            paymentId: payment.id,
            residentId,
            communityId: resident.communityId,
            receiptNumber,
            receiptHtml,
            emailedTo: resident.email,
            emailedAt: new Date(),
          });
      }

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

      // Verify community ownership
      const [community] = await db.select()
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);

      if (!community) {
        return res.status(404).json({ message: "Community not found" });
      }

      // Only allow access if user owns/manages this community
      if (!community.claimedBy || community.claimedBy.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Forbidden: You do not manage this community" });
      }
      
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

  // Get receipt for a payment
  app.get("/api/resident/payment/:paymentId/receipt", isAuthenticated, async (req, res) => {
    try {
      const paymentId = parseInt(req.params.paymentId);
      const userId = (req.user as any)?.claims?.sub;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get the payment and verify ownership
      const [payment] = await db.select()
        .from(residentPayments)
        .where(eq(residentPayments.id, paymentId))
        .limit(1);

      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      // Verify the payment belongs to a resident owned by the user
      const [resident] = await db.select()
        .from(residents)
        .where(eq(residents.id, payment.residentId))
        .limit(1);

      if (!resident || !resident.userId || resident.userId.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Get the receipt
      const [receipt] = await db.select()
        .from(paymentReceipts)
        .where(eq(paymentReceipts.paymentId, paymentId))
        .limit(1);

      if (!receipt) {
        return res.status(404).json({ message: "Receipt not found" });
      }

      res.json(receipt);
    } catch (error: any) {
      console.error('Error fetching receipt:', error);
      res.status(500).json({ message: "Error fetching receipt", error: error.message });
    }
  });

  // Download receipt as HTML
  app.get("/api/resident/payment/:paymentId/receipt/download", isAuthenticated, async (req, res) => {
    try {
      const paymentId = parseInt(req.params.paymentId);
      const userId = (req.user as any)?.claims?.sub;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get the payment and verify ownership
      const [payment] = await db.select()
        .from(residentPayments)
        .where(eq(residentPayments.id, paymentId))
        .limit(1);

      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      // Verify the payment belongs to a resident owned by the user
      const [resident] = await db.select()
        .from(residents)
        .where(eq(residents.id, payment.residentId))
        .limit(1);

      if (!resident || !resident.userId || resident.userId.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Get the receipt
      const [receipt] = await db.select()
        .from(paymentReceipts)
        .where(eq(paymentReceipts.paymentId, paymentId))
        .limit(1);

      if (!receipt) {
        return res.status(404).json({ message: "Receipt not found" });
      }

      // Set headers for HTML download
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="receipt-${receipt.receiptNumber}.html"`);
      res.send(receipt.receiptHtml);
    } catch (error: any) {
      console.error('Error downloading receipt:', error);
      res.status(500).json({ message: "Error downloading receipt", error: error.message });
    }
  });

  // Get all receipts for a resident
  app.get("/api/resident/:residentId/receipts", isAuthenticated, async (req, res) => {
    try {
      const residentId = parseInt(req.params.residentId);
      const userId = (req.user as any)?.claims?.sub;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Verify resident ownership
      const [resident] = await db.select()
        .from(residents)
        .where(eq(residents.id, residentId))
        .limit(1);

      if (!resident || !resident.userId || resident.userId.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const receipts = await db.select()
        .from(paymentReceipts)
        .where(eq(paymentReceipts.residentId, residentId))
        .orderBy(desc(paymentReceipts.createdAt))
        .limit(100);

      res.json(receipts);
    } catch (error: any) {
      console.error('Error fetching receipts:', error);
      res.status(500).json({ message: "Error fetching receipts", error: error.message });
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
