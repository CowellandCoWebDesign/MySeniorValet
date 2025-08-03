import { type Express } from "express";
import Stripe from 'stripe';
import sgMail from '@sendgrid/mail';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil'
});

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export function registerTestRoutes(app: Express) {
  // Test actual Stripe charge
  app.post('/api/test/stripe-charge', async (req, res) => {
    try {
      const { amount = 100 } = req.body;
      
      console.log(`\n=== STRIPE CHARGE TEST ===`);
      console.log(`Testing charge: $${amount/100}`);
      
      // Use legacy Charges API with test token for simplicity
      const charge = await stripe.charges.create({
        amount: amount,
        currency: 'usd',
        description: `MySeniorValet Test - $${amount/100}`,
        source: 'tok_visa',  // Stripe test token
        metadata: { test: 'true' }
      });

      console.log(`✅ STRIPE SUCCESS: Charge ${charge.id} - Status: ${charge.status}`);

      // Send email notification
      await sgMail.send({
        to: 'William.cowell01@gmail.com',
        from: 'hello@myseniorvalet.com',
        subject: `✅ MySeniorValet Stripe Test Success - $${amount/100}`,
        html: `
          <h2>Stripe Payment Test Successful!</h2>
          <p><strong>Charge ID:</strong> ${charge.id}</p>
          <p><strong>Amount:</strong> $${amount/100}</p>
          <p><strong>Status:</strong> ${charge.status}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        `
      });

      res.json({
        success: true,
        chargeId: charge.id,
        amount: amount,
        status: charge.status,
        message: 'Stripe charge processed and super admin notified'
      });

    } catch (error: any) {
      console.error('❌ STRIPE FAILED:', error.message);
      
      // Send error email
      try {
        await sgMail.send({
          to: 'William.cowell01@gmail.com',
          from: 'hello@myseniorvalet.com',
          subject: `❌ MySeniorValet Stripe Test Failed`,
          html: `<h2>Stripe Test Failed</h2><p>Error: ${error.message}</p>`
        });
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
      }

      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  // Test email only
  app.post('/api/test/email', async (req, res) => {
    try {
      console.log('\n=== EMAIL TEST ===');
      
      await sgMail.send({
        to: 'William.cowell01@gmail.com',
        from: 'hello@myseniorvalet.com',
        subject: 'MySeniorValet System Test',
        html: `
          <h2>Email System Test</h2>
          <p>This confirms MySeniorValet email notifications are working correctly.</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        `
      });

      console.log('✅ EMAIL SUCCESS: Super admin notification sent');

      res.json({
        success: true,
        message: 'Email sent to William.cowell01@gmail.com'
      });

    } catch (error: any) {
      console.error('❌ EMAIL FAILED:', error.message);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
}