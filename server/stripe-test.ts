import Stripe from 'stripe';
import { sendEmail } from './sendgrid-service';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil'
});

// Test function to create actual charges using test card
export async function testStripeCharge(amount: number, description: string) {
  try {
    console.log(`Testing Stripe charge: $${amount/100} - ${description}`);
    
    // Create a payment intent with test card
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents
      currency: 'usd',
      description: description,
      payment_method_types: ['card'],
      metadata: {
        test_charge: 'true',
        description: description
      }
    });

    console.log(`Payment Intent created: ${paymentIntent.id}`);
    console.log(`Status: ${paymentIntent.status}`);
    console.log(`Amount: $${paymentIntent.amount / 100}`);
    
    // Create a payment method with test card
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: '4242424242424242',
        exp_month: 12,
        exp_year: 2030,
        cvc: '123'
      }
    });

    // Confirm payment with the created payment method
    const confirmedPayment = await stripe.paymentIntents.confirm(paymentIntent.id, {
      payment_method: paymentMethod.id
    });

    console.log(`Payment confirmed: ${confirmedPayment.status}`);
    
    // Send notification to super admin
    await sendNotificationToSuperAdmin({
      type: 'payment_success',
      title: 'Test Payment Successful',
      message: `Test payment of $${amount/100} processed successfully`,
      paymentId: confirmedPayment.id,
      amount: amount
    });

    return {
      success: true,
      paymentId: confirmedPayment.id,
      status: confirmedPayment.status,
      amount: confirmedPayment.amount,
      description: description
    };

  } catch (error: any) {
    console.error('Stripe test charge failed:', error.message);
    
    // Send error notification to super admin
    await sendNotificationToSuperAdmin({
      type: 'payment_error',
      title: 'Test Payment Failed',
      message: `Test payment failed: ${error.message}`,
      error: error.message,
      amount: amount
    });

    return {
      success: false,
      error: error.message,
      amount: amount,
      description: description
    };
  }
}

// Function to send notifications to super admin
async function sendNotificationToSuperAdmin(data: any) {
  try {
    const subject = data.type === 'payment_success' ? 
      `✅ MySeniorValet Payment Success - $${data.amount/100}` :
      `❌ MySeniorValet Payment Error - $${data.amount/100}`;

    const htmlContent = data.type === 'payment_success' ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Payment Processed Successfully</h2>
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Payment ID:</strong> ${data.paymentId}</p>
          <p><strong>Amount:</strong> $${data.amount/100} USD</p>
          <p><strong>Description:</strong> ${data.message}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p>This payment has been successfully processed through Stripe's test environment.</p>
        <p style="color: #6b7280; font-size: 12px;">MySeniorValet Payment System</p>
      </div>
    ` : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Payment Processing Error</h2>
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Error:</strong> ${data.error}</p>
          <p><strong>Amount:</strong> $${data.amount/100} USD</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p>Please review the payment system configuration.</p>
        <p style="color: #6b7280; font-size: 12px;">MySeniorValet Payment System</p>
      </div>
    `;

    const result = await sendEmail({
      to: 'William.cowell01@gmail.com',
      from: 'hello@myseniorvalet.com',
      subject: subject,
      html: htmlContent,
      text: data.message
    });

    console.log(`Super admin notification sent: ${result ? 'Success' : 'Failed'}`);
    return result;

  } catch (error) {
    console.error('Failed to send super admin notification:', error);
    return false;
  }
}

export { sendNotificationToSuperAdmin };