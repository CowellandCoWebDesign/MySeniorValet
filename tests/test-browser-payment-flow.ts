#!/usr/bin/env tsx

import sgMail from '@sendgrid/mail';
import { db } from '../server/db';
import { subscriptions } from '../shared/schema';
import { eq } from 'drizzle-orm';

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

async function testBrowserPaymentFlow() {
  console.log('🌐 BROWSER PAYMENT FLOW TEST\n');
  console.log('This test verifies the complete user journey from clicking upgrade to seeing success.\n');
  
  // Check current subscription status
  console.log('📊 Checking current subscription status...');
  
  const existingSubscriptions = await db
    .select()
    .from(subscriptions)
    .limit(5);
  
  console.log(`✅ Found ${existingSubscriptions.length} existing subscriptions in database\n`);
  
  // Create browser test instructions
  const browserTestSteps = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 40px; text-align: center;">
        <h1 style="margin: 0;">Browser Payment Flow Test Guide</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Complete manual testing instructions</p>
      </div>
      
      <div style="padding: 40px; background: #f9fafb;">
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          
          <h2 style="color: #1f2937; margin-bottom: 30px;">🧪 Test Instructions</h2>
          
          <div style="background: #eff6ff; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #1e40af; margin-top: 0;">Step 1: Test Community Upgrade</h3>
            <ol style="line-height: 2; color: #1e40af;">
              <li>Open browser to: <code style="background: #dbeafe; padding: 2px 6px; border-radius: 4px;">https://7a9daf58-f7c7-49c7-b4de-a709c13987b5-00-3l1b8tvcpa4bp.janeway.replit.dev/community/264</code></li>
              <li>Click the "Upgrade" button</li>
              <li>Select "Featured" tier ($249/month)</li>
              <li>You'll be redirected to Stripe Checkout</li>
              <li>Use test card: <strong>4242 4242 4242 4242</strong></li>
              <li>Any future date for expiry, any CVC</li>
              <li>Complete the payment</li>
              <li>You'll return to: <code>/community/264?subscription=success</code></li>
              <li>✨ Success modal should appear with confetti!</li>
            </ol>
          </div>
          
          <div style="background: #f0fdf4; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #059669; margin-top: 0;">Step 2: Test Vendor Upgrade</h3>
            <ol style="line-height: 2; color: #047857;">
              <li>Navigate to: <code style="background: #d1fae5; padding: 2px 6px; border-radius: 4px;">/vendor-marketplace</code></li>
              <li>Click "Join as Vendor"</li>
              <li>Select "National Partner" tier ($499/month)</li>
              <li>Stripe Checkout will load</li>
              <li>Use same test card: <strong>4242 4242 4242 4242</strong></li>
              <li>Complete payment</li>
              <li>Return to vendor dashboard with success message</li>
              <li>🎉 Confetti celebration!</li>
            </ol>
          </div>
          
          <div style="background: #fef3c7; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #92400e; margin-top: 0;">What to Verify</h3>
            <ul style="line-height: 2; color: #78350f;">
              <li>✅ Stripe Checkout loads correctly</li>
              <li>✅ Payment processes successfully</li>
              <li>✅ Correct redirect with success parameter</li>
              <li>✅ Success modal displays with tier info</li>
              <li>✅ Confetti animation plays</li>
              <li>✅ Email notification received</li>
              <li>✅ Tier features unlocked in dashboard</li>
            </ul>
          </div>
          
          <div style="background: #fce7f3; padding: 25px; border-radius: 8px;">
            <h3 style="color: #be185d; margin-top: 0;">Test Card Numbers</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; border: 1px solid #fbb6ce;"><strong>4242 4242 4242 4242</strong></td>
                <td style="padding: 10px; border: 1px solid #fbb6ce;">Successful payment</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #fbb6ce;"><strong>4000 0000 0000 0002</strong></td>
                <td style="padding: 10px; border: 1px solid #fbb6ce;">Card declined</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #fbb6ce;"><strong>4000 0000 0000 9995</strong></td>
                <td style="padding: 10px; border: 1px solid #fbb6ce;">Insufficient funds</td>
              </tr>
            </table>
          </div>
          
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #6b7280;">
          <p>After testing, check your email at <strong>william.cowell01@gmail.com</strong></p>
          <p>You should receive payment confirmations and welcome emails</p>
        </div>
      </div>
    </div>
  `;
  
  // Send browser test instructions
  try {
    await sgMail.send({
      to: 'william.cowell01@gmail.com',
      from: 'hello@myseniorvalet.com',
      subject: '🌐 Browser Payment Flow Test - Manual Testing Guide',
      html: browserTestSteps
    });
    
    console.log('✅ Browser test instructions sent to william.cowell01@gmail.com\n');
  } catch (error: any) {
    console.error('❌ Failed to send email:', error.message);
  }
  
  // Display test URLs
  console.log('🔗 TEST URLS:\n');
  console.log('Community Test:');
  console.log('  https://7a9daf58-f7c7-49c7-b4de-a709c13987b5-00-3l1b8tvcpa4bp.janeway.replit.dev/community/264');
  console.log('  → Click "Upgrade" → Select "Featured" ($249)\n');
  
  console.log('Vendor Test:');
  console.log('  https://7a9daf58-f7c7-49c7-b4de-a709c13987b5-00-3l1b8tvcpa4bp.janeway.replit.dev/vendor-marketplace');
  console.log('  → Click "Join as Vendor" → Select "National Partner" ($499)\n');
  
  console.log('💳 TEST CARD: 4242 4242 4242 4242');
  console.log('📅 Expiry: Any future date');
  console.log('🔢 CVC: Any 3 digits\n');
  
  console.log('✅ WHAT TO EXPECT:');
  console.log('  1. Stripe Checkout page loads');
  console.log('  2. Enter test card details');
  console.log('  3. Payment processes');
  console.log('  4. Redirect back with ?subscription=success');
  console.log('  5. Success modal with confetti');
  console.log('  6. Email notifications sent');
  console.log('  7. Tier features unlocked\n');
  
  console.log('📧 Check william.cowell01@gmail.com for:');
  console.log('  • Browser test instructions');
  console.log('  • Payment confirmations');
  console.log('  • Welcome emails\n');
  
  console.log('🎉 Ready for browser testing!');
}

testBrowserPaymentFlow().catch(console.error);