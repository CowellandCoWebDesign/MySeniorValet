// MySeniorValet Comprehensive Email Template System
// All email templates centralized for consistency and easy management

export interface EmailTemplate {
  subject: string;
  html: (data: any) => string;
  text?: (data: any) => string;
}

// Brand colors and styling constants
const BRAND_PRIMARY = '#1e40af';
const BRAND_SECONDARY = '#f59e0b';
const BRAND_SUCCESS = '#10b981';
const BRAND_DANGER = '#ef4444';

// Base template wrapper
const baseTemplate = (content: string, footerMessage?: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MySeniorValet</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f3f4f6; padding: 20px 0;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" width="600" style="background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${BRAND_PRIMARY} 0%, #3730a3 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">MySeniorValet</h1>
              <p style="color: #e0e7ff; margin: 5px 0 0 0; font-size: 14px;">Your Trusted Senior Living Partner</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                ${footerMessage || 'Questions? Contact us at <a href="mailto:support@myseniorvalet.com" style="color: ' + BRAND_PRIMARY + ';">support@myseniorvalet.com</a>'}
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 10px 0;">
                © 2025 MySeniorValet. All rights reserved.<br>
                <a href="https://myseniorvalet.com/privacy" style="color: #9ca3af;">Privacy Policy</a> | 
                <a href="https://myseniorvalet.com/terms" style="color: #9ca3af;">Terms of Service</a> | 
                <a href="https://myseniorvalet.com/unsubscribe" style="color: #9ca3af;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// Button component
const buttonHTML = (text: string, url: string, color: string = BRAND_PRIMARY) => `
  <table cellpadding="0" cellspacing="0" style="margin: 30px auto;">
    <tr>
      <td style="background-color: ${color}; border-radius: 6px; text-align: center;">
        <a href="${url}" style="display: inline-block; padding: 14px 32px; color: white; text-decoration: none; font-weight: 600; font-size: 16px;">
          ${text}
        </a>
      </td>
    </tr>
  </table>
`;

// ============= USER ACCOUNT TEMPLATES =============

export const welcomeEmail: EmailTemplate = {
  subject: 'Welcome to MySeniorValet - Your Journey Starts Here! 🎉',
  html: (data: { name: string; email: string }) => baseTemplate(`
    <h2 style="color: ${BRAND_PRIMARY}; margin: 0 0 20px 0;">Welcome aboard, ${data.name}! 🏡</h2>
    
    <p style="color: #374151; line-height: 1.6; font-size: 16px;">
      We're thrilled to have you join MySeniorValet, where finding the perfect senior living community is made simple, transparent, and stress-free.
    </p>
    
    <div style="background-color: #f0f9ff; border-left: 4px solid ${BRAND_PRIMARY}; padding: 20px; margin: 30px 0;">
      <h3 style="color: ${BRAND_PRIMARY}; margin: 0 0 15px 0;">What you can do with MySeniorValet:</h3>
      <ul style="color: #374151; line-height: 1.8; margin: 0; padding-left: 20px;">
        <li><strong>34,180+ Communities:</strong> Search verified senior living options nationwide</li>
        <li><strong>Transparent Pricing:</strong> See real HUD-verified pricing and market rates</li>
        <li><strong>Tour Tracker™:</strong> Schedule and track your community visits</li>
        <li><strong>Family Collaboration:</strong> Share and compare communities with loved ones</li>
        <li><strong>AI Recommendations:</strong> Get personalized matches based on your needs</li>
        <li><strong>Senior Resources:</strong> Access 32+ government and support programs</li>
      </ul>
    </div>
    
    ${buttonHTML('Start Your Search', 'https://myseniorvalet.com/search')}
    
    <div style="background-color: #fef3c7; border-radius: 6px; padding: 20px; margin: 30px 0;">
      <h4 style="color: #92400e; margin: 0 0 10px 0;">💡 Quick Start Tips:</h4>
      <ol style="color: #92400e; line-height: 1.6; margin: 0; padding-left: 20px;">
        <li>Complete your profile for better recommendations</li>
        <li>Set your budget and care level preferences</li>
        <li>Save your favorite communities to compare</li>
        <li>Invite family members to collaborate</li>
      </ol>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
      Your account is ready! Sign in with:<br>
      <strong>Email:</strong> ${data.email}
    </p>
  `)
};

export const passwordResetEmail: EmailTemplate = {
  subject: 'Reset Your MySeniorValet Password',
  html: (data: { name: string; resetLink: string }) => baseTemplate(`
    <h2 style="color: ${BRAND_PRIMARY}; margin: 0 0 20px 0;">Password Reset Request</h2>
    
    <p style="color: #374151; line-height: 1.6; font-size: 16px;">
      Hi ${data.name},
    </p>
    
    <p style="color: #374151; line-height: 1.6; font-size: 16px;">
      We received a request to reset your MySeniorValet password. Click the button below to create a new password:
    </p>
    
    ${buttonHTML('Reset My Password', data.resetLink, BRAND_DANGER)}
    
    <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 15px; margin: 20px 0;">
      <p style="color: #991b1b; font-size: 14px; margin: 0;">
        <strong>⚠️ Security Notice:</strong><br>
        This link will expire in 1 hour. If you didn't request this reset, please ignore this email or contact support immediately.
      </p>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
      For security reasons, this link can only be used once. If you need to reset your password again, please request a new reset link.
    </p>
  `)
};

// ============= COMMUNITY TEMPLATES =============

export const communitySignupEmail: EmailTemplate = {
  subject: 'Welcome to MySeniorValet Community Partnership! 🏢',
  html: (data: { communityName: string; tier: string; contactName: string; price: string }) => baseTemplate(`
    <h2 style="color: ${BRAND_PRIMARY}; margin: 0 0 20px 0;">Welcome ${data.communityName}!</h2>
    
    <p style="color: #374151; line-height: 1.6; font-size: 16px;">
      Dear ${data.contactName},
    </p>
    
    <p style="color: #374151; line-height: 1.6; font-size: 16px;">
      Congratulations on joining MySeniorValet as a <strong>${data.tier}</strong> community partner! 
      Your community is now part of the most transparent senior living marketplace.
    </p>
    
    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 8px; padding: 25px; margin: 30px 0;">
      <h3 style="color: ${BRAND_PRIMARY}; margin: 0 0 15px 0;">Your ${data.tier} Subscription Includes:</h3>
      ${data.tier === 'Platinum' ? `
        <ul style="color: #374151; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>Premium placement in search results</li>
          <li>Unlimited photo galleries (50+ photos)</li>
          <li>Virtual tour integration</li>
          <li>Real-time availability updates</li>
          <li>Advanced analytics dashboard</li>
          <li>Priority customer support</li>
          <li>Tour Tracker™ integration</li>
          <li>Direct messaging with families</li>
        </ul>
      ` : data.tier === 'Featured' ? `
        <ul style="color: #374151; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>Featured badge in listings</li>
          <li>Up to 25 photos</li>
          <li>Monthly analytics reports</li>
          <li>Tour scheduling system</li>
          <li>Promotional offers display</li>
          <li>Email support</li>
        </ul>
      ` : data.tier === 'Standard' ? `
        <ul style="color: #374151; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>Basic listing with up to 10 photos</li>
          <li>Contact information display</li>
          <li>Basic analytics</li>
          <li>Tour request notifications</li>
        </ul>
      ` : `
        <ul style="color: #374151; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>Basic community information</li>
          <li>Contact details</li>
          <li>Limited to 3 photos</li>
        </ul>
      `}
    </div>
    
    <div style="background-color: #ecfdf5; border: 1px solid ${BRAND_SUCCESS}; border-radius: 6px; padding: 20px; margin: 20px 0;">
      <p style="color: #065f46; font-size: 16px; margin: 0;">
        <strong>💳 Subscription Details:</strong><br>
        Plan: ${data.tier} - ${data.price}/month<br>
        Billing: Monthly on the same date<br>
        Status: <span style="color: ${BRAND_SUCCESS};">Active</span>
      </p>
    </div>
    
    ${buttonHTML('Access Your Dashboard', 'https://myseniorvalet.com/community-dashboard')}
    
    <div style="background-color: #fef3c7; border-radius: 6px; padding: 20px; margin: 30px 0;">
      <h4 style="color: #92400e; margin: 0 0 10px 0;">📋 Next Steps:</h4>
      <ol style="color: #92400e; line-height: 1.6; margin: 0; padding-left: 20px;">
        <li>Complete your community profile</li>
        <li>Upload high-quality photos</li>
        <li>Set your pricing and availability</li>
        <li>Enable Tour Tracker™ for visit scheduling</li>
        <li>Review your first weekly analytics report</li>
      </ol>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; text-align: center;">
      Your dedicated onboarding specialist will contact you within 24 hours.<br>
      Questions? Call us at <strong>1-888-SENIOR-V</strong>
    </p>
  `, 'Community onboarding team: <a href="mailto:communities@myseniorvalet.com">communities@myseniorvalet.com</a>')
};

// ============= VENDOR TEMPLATES =============

export const vendorSignupEmail: EmailTemplate = {
  subject: 'Welcome to MySeniorValet Vendor Marketplace! 🛍️',
  html: (data: { vendorName: string; tier: string; contactName: string; coverage: string; price: string }) => baseTemplate(`
    <h2 style="color: ${BRAND_PRIMARY}; margin: 0 0 20px 0;">Welcome to the Marketplace, ${data.vendorName}!</h2>
    
    <p style="color: #374151; line-height: 1.6; font-size: 16px;">
      Dear ${data.contactName},
    </p>
    
    <p style="color: #374151; line-height: 1.6; font-size: 16px;">
      Thank you for joining MySeniorValet's Vendor Marketplace as a <strong>${data.tier}</strong> partner! 
      You're now connected to thousands of families seeking quality senior services.
    </p>
    
    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%); border-radius: 8px; padding: 25px; margin: 30px 0;">
      <h3 style="color: #92400e; margin: 0 0 15px 0;">Your ${data.tier} Benefits:</h3>
      ${data.tier === 'National Partner' ? `
        <ul style="color: #451a03; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>Nationwide exposure (all 50 states)</li>
          <li>Premium placement in vendor directory</li>
          <li>Featured vendor badge</li>
          <li>Unlimited service listings</li>
          <li>Advanced lead generation tools</li>
          <li>Monthly performance reports</li>
          <li>Priority support & account manager</li>
          <li>Co-marketing opportunities</li>
        </ul>
      ` : data.tier === 'Featured' ? `
        <ul style="color: #451a03; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>Coverage: ${data.coverage}</li>
          <li>Featured badge in listings</li>
          <li>Up to 10 service offerings</li>
          <li>Lead capture forms</li>
          <li>Quarterly analytics reports</li>
          <li>Email support</li>
        </ul>
      ` : `
        <ul style="color: #451a03; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>Single state coverage: ${data.coverage}</li>
          <li>Basic vendor listing</li>
          <li>Up to 3 services</li>
          <li>Contact form</li>
          <li>Basic analytics</li>
        </ul>
      `}
    </div>
    
    <div style="background-color: #f0fdf4; border: 1px solid ${BRAND_SUCCESS}; border-radius: 6px; padding: 20px; margin: 20px 0;">
      <p style="color: #065f46; font-size: 16px; margin: 0;">
        <strong>💳 Subscription Details:</strong><br>
        Plan: ${data.tier} - ${data.price}/month<br>
        Coverage: ${data.coverage}<br>
        Status: <span style="color: ${BRAND_SUCCESS};">Active</span>
      </p>
    </div>
    
    ${buttonHTML('Set Up Your Vendor Profile', 'https://myseniorvalet.com/vendor-dashboard', BRAND_SECONDARY)}
    
    <div style="background-color: #ede9fe; border-radius: 6px; padding: 20px; margin: 30px 0;">
      <h4 style="color: #4c1d95; margin: 0 0 10px 0;">🚀 Quick Start Guide:</h4>
      <ol style="color: #4c1d95; line-height: 1.6; margin: 0; padding-left: 20px;">
        <li>Complete your vendor profile with logo and description</li>
        <li>Add your service offerings and pricing</li>
        <li>Set your service areas within ${data.coverage}</li>
        <li>Upload certificates and credentials</li>
        <li>Enable instant quote requests</li>
      </ol>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; text-align: center;">
      Vendor support team: <strong>vendors@myseniorvalet.com</strong><br>
      Phone: <strong>1-888-VENDOR-M</strong>
    </p>
  `, 'Vendor support: <a href="mailto:vendors@myseniorvalet.com">vendors@myseniorvalet.com</a>')
};

// ============= PAYMENT TEMPLATES =============

export const paymentConfirmationEmail: EmailTemplate = {
  subject: 'Payment Confirmation - MySeniorValet',
  html: (data: { name: string; amount: string; plan: string; invoiceNumber: string; date: string }) => baseTemplate(`
    <h2 style="color: ${BRAND_SUCCESS}; margin: 0 0 20px 0;">✅ Payment Successful</h2>
    
    <p style="color: #374151; line-height: 1.6; font-size: 16px;">
      Hi ${data.name},
    </p>
    
    <p style="color: #374151; line-height: 1.6; font-size: 16px;">
      Thank you for your payment. Your subscription has been successfully processed.
    </p>
    
    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 25px; margin: 30px 0;">
      <h3 style="color: #374151; margin: 0 0 20px 0; text-align: center;">Payment Details</h3>
      
      <table width="100%" style="border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Invoice #</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #374151;">${data.invoiceNumber}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Date</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #374151;">${data.date}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Plan</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #374151;">${data.plan}</td>
        </tr>
        <tr>
          <td style="padding: 15px 0 10px 0; color: #374151; font-size: 18px; font-weight: 600;">Total Paid</td>
          <td style="padding: 15px 0 10px 0; text-align: right; font-size: 24px; font-weight: 700; color: ${BRAND_SUCCESS};">${data.amount}</td>
        </tr>
      </table>
    </div>
    
    ${buttonHTML('Download Invoice', `https://myseniorvalet.com/invoices/${data.invoiceNumber}`)}
    
    <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
      This receipt has been emailed to you for your records.<br>
      Billing questions? Contact <a href="mailto:billing@myseniorvalet.com" style="color: ${BRAND_PRIMARY};">billing@myseniorvalet.com</a>
    </p>
  `)
};

export const subscriptionRenewalReminderEmail: EmailTemplate = {
  subject: 'Subscription Renewal Reminder - MySeniorValet',
  html: (data: { name: string; plan: string; renewalDate: string; amount: string }) => baseTemplate(`
    <h2 style="color: ${BRAND_PRIMARY}; margin: 0 0 20px 0;">Subscription Renewal Notice</h2>
    
    <p style="color: #374151; line-height: 1.6; font-size: 16px;">
      Hi ${data.name},
    </p>
    
    <p style="color: #374151; line-height: 1.6; font-size: 16px;">
      This is a friendly reminder that your <strong>${data.plan}</strong> subscription will automatically renew on <strong>${data.renewalDate}</strong>.
    </p>
    
    <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
      <p style="color: #92400e; font-size: 14px; margin: 0 0 10px 0;">Next Billing Amount:</p>
      <p style="color: #92400e; font-size: 32px; font-weight: 700; margin: 0;">${data.amount}</p>
      <p style="color: #92400e; font-size: 14px; margin: 10px 0 0 0;">Renewal Date: ${data.renewalDate}</p>
    </div>
    
    <p style="color: #374151; line-height: 1.6; font-size: 16px;">
      No action is needed if you wish to continue enjoying your ${data.plan} benefits. 
      Your payment method on file will be charged automatically.
    </p>
    
    <div style="display: flex; gap: 10px; justify-content: center; margin: 30px 0;">
      ${buttonHTML('Manage Subscription', 'https://myseniorvalet.com/account/subscription')}
    </div>
    
    <p style="color: #6b7280; font-size: 14px; text-align: center;">
      Need to update your payment method or cancel?<br>
      Visit your account settings or contact support.
    </p>
  `)
};

// ============= TOUR TEMPLATES =============

export const tourScheduledEmail: EmailTemplate = {
  subject: 'Tour Confirmed - {communityName}',
  html: (data: { userName: string; communityName: string; tourDate: string; tourTime: string; address: string; contactPerson: string; contactPhone: string }) => baseTemplate(`
    <h2 style="color: ${BRAND_PRIMARY}; margin: 0 0 20px 0;">🗓️ Your Tour is Confirmed!</h2>
    
    <p style="color: #374151; line-height: 1.6; font-size: 16px;">
      Hi ${data.userName},
    </p>
    
    <p style="color: #374151; line-height: 1.6; font-size: 16px;">
      Great news! Your tour at <strong>${data.communityName}</strong> has been confirmed.
    </p>
    
    <div style="background: linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 100%); border-radius: 8px; padding: 25px; margin: 30px 0;">
      <h3 style="color: #1e293b; margin: 0 0 20px 0; text-align: center;">Tour Details</h3>
      
      <div style="background-color: white; border-radius: 6px; padding: 20px;">
        <p style="margin: 0 0 15px 0; color: #374151;">
          📍 <strong>Community:</strong> ${data.communityName}
        </p>
        <p style="margin: 0 0 15px 0; color: #374151;">
          📅 <strong>Date:</strong> ${data.tourDate}
        </p>
        <p style="margin: 0 0 15px 0; color: #374151;">
          ⏰ <strong>Time:</strong> ${data.tourTime}
        </p>
        <p style="margin: 0 0 15px 0; color: #374151;">
          📍 <strong>Address:</strong><br>${data.address}
        </p>
        <p style="margin: 0; color: #374151;">
          👤 <strong>Your Contact:</strong> ${data.contactPerson}<br>
          📞 <strong>Phone:</strong> ${data.contactPhone}
        </p>
      </div>
    </div>
    
    ${buttonHTML('Add to Calendar', `https://myseniorvalet.com/tours/calendar-event/${data.communityName}`, BRAND_PRIMARY)}
    
    <div style="background-color: #f0f9ff; border-left: 4px solid ${BRAND_PRIMARY}; padding: 20px; margin: 30px 0;">
      <h4 style="color: ${BRAND_PRIMARY}; margin: 0 0 10px 0;">💡 Tour Preparation Tips:</h4>
      <ul style="color: #374151; line-height: 1.6; margin: 0; padding-left: 20px;">
        <li>Bring your list of questions</li>
        <li>Take photos (if permitted)</li>
        <li>Ask about current availability and waitlists</li>
        <li>Request a meal sample if available</li>
        <li>Meet current residents and staff</li>
        <li>Review the contract and pricing details</li>
      </ul>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; text-align: center;">
      Need to reschedule? <a href="https://myseniorvalet.com/tours/manage" style="color: ${BRAND_PRIMARY};">Manage your tours here</a><br>
      We'll send you a reminder 24 hours before your tour.
    </p>
  `)
};

export const tourReminderEmail: EmailTemplate = {
  subject: 'Tour Reminder - {communityName} Tomorrow',
  html: (data: { userName: string; communityName: string; tourDate: string; tourTime: string; address: string }) => baseTemplate(`
    <h2 style="color: ${BRAND_SECONDARY}; margin: 0 0 20px 0;">⏰ Tour Reminder: Tomorrow!</h2>
    
    <p style="color: #374151; line-height: 1.6; font-size: 16px;">
      Hi ${data.userName},
    </p>
    
    <p style="color: #374151; line-height: 1.6; font-size: 16px;">
      Just a friendly reminder about your tour tomorrow at <strong>${data.communityName}</strong>.
    </p>
    
    <div style="background-color: #fef3c7; border: 2px solid ${BRAND_SECONDARY}; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
      <p style="color: #92400e; font-size: 18px; margin: 0;">
        📅 <strong>${data.tourDate}</strong><br>
        ⏰ <strong>${data.tourTime}</strong>
      </p>
    </div>
    
    <div style="background-color: #f9fafb; border-radius: 6px; padding: 20px; margin: 20px 0;">
      <p style="color: #374151; margin: 0;">
        📍 <strong>Location:</strong><br>
        ${data.address}
      </p>
    </div>
    
    ${buttonHTML('Get Directions', `https://maps.google.com/?q=${encodeURIComponent(data.address)}`, BRAND_PRIMARY)}
    
    <div style="background-color: #ecfdf5; border-radius: 6px; padding: 15px; margin: 20px 0;">
      <p style="color: #065f46; font-size: 14px; margin: 0;">
        <strong>✅ Don't forget to bring:</strong> Photo ID, insurance cards, list of medications, and your questions!
      </p>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; text-align: center;">
      Can't make it? Please <a href="https://myseniorvalet.com/tours/reschedule" style="color: ${BRAND_PRIMARY};">reschedule here</a> or call the community directly.
    </p>
  `)
};

// ============= ENGAGEMENT TEMPLATES =============

export const weeklyDigestEmail: EmailTemplate = {
  subject: 'Your Weekly MySeniorValet Update 📊',
  html: (data: { 
    userName: string; 
    newCommunities: number; 
    savedCommunities: any[]; 
    upcomingTours: any[];
    recommendedCommunities: any[];
  }) => baseTemplate(`
    <h2 style="color: ${BRAND_PRIMARY}; margin: 0 0 20px 0;">Your Weekly Update</h2>
    
    <p style="color: #374151; line-height: 1.6; font-size: 16px;">
      Hi ${data.userName},
    </p>
    
    <p style="color: #374151; line-height: 1.6; font-size: 16px;">
      Here's what's new on MySeniorValet this week:
    </p>
    
    <!-- Stats Overview -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 30px 0;">
      <div style="background-color: #e0f2fe; border-radius: 8px; padding: 20px; text-align: center;">
        <p style="color: #0369a1; font-size: 32px; font-weight: 700; margin: 0;">${data.newCommunities}</p>
        <p style="color: #0369a1; font-size: 14px; margin: 5px 0 0 0;">New Communities Added</p>
      </div>
      <div style="background-color: #fce7f3; border-radius: 8px; padding: 20px; text-align: center;">
        <p style="color: #be185d; font-size: 32px; font-weight: 700; margin: 0;">${data.savedCommunities.length}</p>
        <p style="color: #be185d; font-size: 14px; margin: 5px 0 0 0;">Your Saved Communities</p>
      </div>
    </div>
    
    ${data.upcomingTours.length > 0 ? `
      <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin: 30px 0;">
        <h3 style="color: #065f46; margin: 0 0 15px 0;">📅 Upcoming Tours</h3>
        ${data.upcomingTours.map(tour => `
          <div style="background-color: white; border-radius: 6px; padding: 15px; margin-bottom: 10px;">
            <p style="color: #374151; margin: 0;">
              <strong>${tour.communityName}</strong><br>
              ${tour.date} at ${tour.time}
            </p>
          </div>
        `).join('')}
      </div>
    ` : ''}
    
    ${data.recommendedCommunities.length > 0 ? `
      <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 30px 0;">
        <h3 style="color: #92400e; margin: 0 0 15px 0;">🎯 Recommended for You</h3>
        ${data.recommendedCommunities.slice(0, 3).map(community => `
          <div style="background-color: white; border-radius: 6px; padding: 15px; margin-bottom: 10px;">
            <p style="color: #374151; margin: 0;">
              <strong>${community.name}</strong><br>
              ${community.city}, ${community.state} • ${community.pricing}
            </p>
          </div>
        `).join('')}
      </div>
    ` : ''}
    
    ${buttonHTML('View All Updates', 'https://myseniorvalet.com/dashboard')}
    
    <p style="color: #6b7280; font-size: 14px; text-align: center;">
      Want to change your email preferences? <a href="https://myseniorvalet.com/settings/notifications" style="color: ${BRAND_PRIMARY};">Update settings</a>
    </p>
  `)
};

export const inquiryReceivedEmail: EmailTemplate = {
  subject: 'We Received Your Inquiry - {communityName}',
  html: (data: { userName: string; communityName: string; inquiryType: string; message: string }) => baseTemplate(`
    <h2 style="color: ${BRAND_PRIMARY}; margin: 0 0 20px 0;">Inquiry Received ✅</h2>
    
    <p style="color: #374151; line-height: 1.6; font-size: 16px;">
      Hi ${data.userName},
    </p>
    
    <p style="color: #374151; line-height: 1.6; font-size: 16px;">
      Thank you for your interest in <strong>${data.communityName}</strong>. We've forwarded your inquiry to the community, and they'll be in touch soon.
    </p>
    
    <div style="background-color: #f9fafb; border-left: 4px solid ${BRAND_PRIMARY}; padding: 20px; margin: 30px 0;">
      <h3 style="color: #374151; margin: 0 0 10px 0;">Your Inquiry Details:</h3>
      <p style="color: #6b7280; margin: 0 0 10px 0;">
        <strong>Community:</strong> ${data.communityName}<br>
        <strong>Inquiry Type:</strong> ${data.inquiryType}<br>
        <strong>Submitted:</strong> ${new Date().toLocaleDateString()}
      </p>
      ${data.message ? `
        <p style="color: #6b7280; margin: 10px 0 0 0;">
          <strong>Your Message:</strong><br>
          <em>"${data.message}"</em>
        </p>
      ` : ''}
    </div>
    
    <div style="background-color: #e0f2fe; border-radius: 6px; padding: 20px; margin: 20px 0;">
      <p style="color: #0369a1; font-size: 14px; margin: 0;">
        <strong>What happens next?</strong><br>
        The community typically responds within 24-48 hours. They may contact you via phone or email to discuss availability, pricing, and schedule a tour.
      </p>
    </div>
    
    ${buttonHTML('Track Your Inquiries', 'https://myseniorvalet.com/inquiries')}
    
    <p style="color: #6b7280; font-size: 14px; text-align: center;">
      Haven't heard back in 48 hours? <a href="mailto:support@myseniorvalet.com" style="color: ${BRAND_PRIMARY};">Let us know</a>
    </p>
  `)
};

// ============= REVIEW TEMPLATES =============

export const reviewRequestEmail: EmailTemplate = {
  subject: 'How was your tour at {communityName}?',
  html: (data: { userName: string; communityName: string; tourDate: string }) => baseTemplate(`
    <h2 style="color: ${BRAND_PRIMARY}; margin: 0 0 20px 0;">Share Your Experience 🌟</h2>
    
    <p style="color: #374151; line-height: 1.6; font-size: 16px;">
      Hi ${data.userName},
    </p>
    
    <p style="color: #374151; line-height: 1.6; font-size: 16px;">
      We hope your tour at <strong>${data.communityName}</strong> on ${data.tourDate} went well! 
      Your feedback helps other families make informed decisions.
    </p>
    
    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%); border-radius: 8px; padding: 25px; margin: 30px 0; text-align: center;">
      <p style="color: #92400e; font-size: 18px; margin: 0 0 20px 0;">
        How would you rate your tour experience?
      </p>
      <div style="font-size: 36px; margin: 20px 0;">
        ⭐ ⭐ ⭐ ⭐ ⭐
      </div>
      ${buttonHTML('Write a Review', `https://myseniorvalet.com/reviews/new?community=${encodeURIComponent(data.communityName)}`, BRAND_SECONDARY)}
    </div>
    
    <div style="background-color: #f0f9ff; border-radius: 6px; padding: 20px; margin: 20px 0;">
      <h4 style="color: ${BRAND_PRIMARY}; margin: 0 0 10px 0;">Your review helps families understand:</h4>
      <ul style="color: #374151; line-height: 1.6; margin: 0; padding-left: 20px;">
        <li>Staff friendliness and professionalism</li>
        <li>Cleanliness and maintenance</li>
        <li>Quality of amenities and activities</li>
        <li>Value for money</li>
        <li>Overall atmosphere and feel</li>
      </ul>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; text-align: center;">
      Your honest feedback makes a difference. Thank you for being part of the MySeniorValet community!
    </p>
  `)
};

// ============= ADMIN NOTIFICATIONS =============

export const newCommunitySignupNotification: EmailTemplate = {
  subject: '🎉 New Community Signup - {communityName}',
  html: (data: { communityName: string; tier: string; contactName: string; email: string; phone: string; location: string }) => baseTemplate(`
    <h2 style="color: ${BRAND_SUCCESS}; margin: 0 0 20px 0;">New Community Partnership! 🎉</h2>
    
    <div style="background-color: #ecfdf5; border: 2px solid ${BRAND_SUCCESS}; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="color: #065f46; margin: 0 0 15px 0;">Community Details:</h3>
      <table width="100%" style="border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #374151;"><strong>Community:</strong></td>
          <td style="padding: 8px 0; color: #374151;">${data.communityName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #374151;"><strong>Tier:</strong></td>
          <td style="padding: 8px 0; color: #374151;">${data.tier}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #374151;"><strong>Location:</strong></td>
          <td style="padding: 8px 0; color: #374151;">${data.location}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #374151;"><strong>Contact:</strong></td>
          <td style="padding: 8px 0; color: #374151;">${data.contactName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #374151;"><strong>Email:</strong></td>
          <td style="padding: 8px 0; color: #374151;">${data.email}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #374151;"><strong>Phone:</strong></td>
          <td style="padding: 8px 0; color: #374151;">${data.phone}</td>
        </tr>
      </table>
    </div>
    
    <div style="background-color: #fef3c7; border-radius: 6px; padding: 15px; margin: 20px 0;">
      <p style="color: #92400e; font-size: 14px; margin: 0;">
        <strong>⚡ Action Required:</strong> Contact within 24 hours for onboarding
      </p>
    </div>
    
    ${buttonHTML('View in Admin Dashboard', 'https://myseniorvalet.com/admin/communities/new')}
  `, 'Admin notification - Do not reply to this email')
};

// Export all templates
export const emailTemplates = {
  // User Account
  welcome: welcomeEmail,
  passwordReset: passwordResetEmail,
  
  // Community
  communitySignup: communitySignupEmail,
  
  // Vendor
  vendorSignup: vendorSignupEmail,
  
  // Payments
  paymentConfirmation: paymentConfirmationEmail,
  subscriptionRenewalReminder: subscriptionRenewalReminderEmail,
  
  // Tours
  tourScheduled: tourScheduledEmail,
  tourReminder: tourReminderEmail,
  
  // Engagement
  weeklyDigest: weeklyDigestEmail,
  inquiryReceived: inquiryReceivedEmail,
  
  // Reviews
  reviewRequest: reviewRequestEmail,
  
  // Admin
  newCommunitySignupNotification: newCommunitySignupNotification
};

// Helper function to send email using template
export async function sendTemplatedEmail(
  templateName: keyof typeof emailTemplates,
  to: string | string[],
  data: any,
  options?: {
    cc?: string | string[];
    bcc?: string | string[];
    from?: string;
    replyTo?: string;
  }
): Promise<boolean> {
  const template = emailTemplates[templateName];
  if (!template) {
    console.error(`Email template '${templateName}' not found`);
    return false;
  }
  
  // Replace placeholders in subject
  let subject = template.subject;
  Object.keys(data).forEach(key => {
    subject = subject.replace(`{${key}}`, data[key]);
  });
  
  // Import EmailService to send
  const { EmailService } = await import('../services/email');
  
  return EmailService.sendEmail({
    to,
    subject,
    html: template.html(data),
    text: template.text ? template.text(data) : undefined,
    ...options
  });
}