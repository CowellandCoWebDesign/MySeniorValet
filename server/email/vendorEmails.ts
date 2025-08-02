import sgMail from '@sendgrid/mail';

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

interface VendorSignupEmailData {
  businessName: string;
  contactName: string;
  email: string;
  planType: 'basic' | 'professional' | 'enterprise';
  monthlyAmount: number;
  subscriptionId: string;
}

interface VendorStatusChangeEmailData {
  businessName: string;
  contactName: string;
  email: string;
  newStatus: string;
  reason?: string;
}

export async function sendVendorWelcomeEmail(data: VendorSignupEmailData) {
  const { businessName, contactName, email, planType, monthlyAmount, subscriptionId } = data;
  
  const planFeatures = {
    basic: [
      'Basic listing on MySeniorValet',
      'Contact information display',
      'Service area coverage',
      'Monthly performance reports'
    ],
    professional: [
      'Featured listing with badge',
      'Priority placement in search',
      'Advanced analytics dashboard',
      'Lead notifications',
      'Customer review management'
    ],
    enterprise: [
      'Premium placement guarantee',
      'Dedicated account manager',
      'Custom branding options',
      'API access for integration',
      'Priority customer support'
    ]
  };

  const msg = {
    to: email,
    from: 'noreply@myseniorvalet.com',
    subject: `Welcome to MySeniorValet Partners - ${businessName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(to right, #7c3aed, #2563eb); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .features { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .features ul { padding-left: 20px; }
          .features li { margin: 10px 0; }
          .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to MySeniorValet Partners!</h1>
            <p>Your vendor account has been activated</p>
          </div>
          
          <div class="content">
            <p>Dear ${contactName},</p>
            
            <p>Thank you for joining MySeniorValet as a verified partner! We're excited to have <strong>${businessName}</strong> on our platform.</p>
            
            <h2>Your Subscription Details:</h2>
            <ul>
              <li><strong>Plan:</strong> ${planType.charAt(0).toUpperCase() + planType.slice(1)}</li>
              <li><strong>Monthly Fee:</strong> $${monthlyAmount}</li>
              <li><strong>Subscription ID:</strong> ${subscriptionId}</li>
              <li><strong>Status:</strong> Active</li>
            </ul>
            
            <div class="features">
              <h3>Your ${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan includes:</h3>
              <ul>
                ${planFeatures[planType].map(feature => `<li>${feature}</li>`).join('')}
              </ul>
            </div>
            
            <h2>Next Steps:</h2>
            <ol>
              <li>Complete your vendor profile in the dashboard</li>
              <li>Add your services and pricing</li>
              <li>Upload photos and certifications</li>
              <li>Set your service areas</li>
            </ol>
            
            <div style="text-align: center;">
              <a href="https://myseniorvalet.com/vendor/dashboard" class="button">Access Your Dashboard</a>
            </div>
            
            <p>If you have any questions, our vendor support team is here to help:</p>
            <ul>
              <li>Email: vendors@myseniorvalet.com</li>
              <li>Phone: 1-800-VENDORS (1-800-836-3677)</li>
            </ul>
            
            <p>We look forward to a successful partnership!</p>
            
            <p>Best regards,<br>
            The MySeniorValet Team</p>
          </div>
          
          <div class="footer">
            <p>© 2025 MySeniorValet. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await sgMail.send(msg);
    console.log(`Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}

export async function sendVendorPaymentReceiptEmail(data: VendorSignupEmailData & { paymentIntentId: string }) {
  const { businessName, contactName, email, monthlyAmount, paymentIntentId } = data;
  
  const msg = {
    to: email,
    from: 'noreply@myseniorvalet.com',
    subject: `Payment Receipt - MySeniorValet Partner Subscription`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f3f4f6; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
          .receipt { background: #f9fafb; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Receipt</h1>
            <p>MySeniorValet Partner Subscription</p>
          </div>
          
          <div class="content">
            <p>Dear ${contactName},</p>
            
            <p>This email confirms your payment for MySeniorValet Partner subscription.</p>
            
            <div class="receipt">
              <h3>Receipt Details:</h3>
              <table style="width: 100%;">
                <tr>
                  <td><strong>Business Name:</strong></td>
                  <td>${businessName}</td>
                </tr>
                <tr>
                  <td><strong>Amount Paid:</strong></td>
                  <td>$${monthlyAmount}</td>
                </tr>
                <tr>
                  <td><strong>Payment Date:</strong></td>
                  <td>${new Date().toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td><strong>Payment ID:</strong></td>
                  <td>${paymentIntentId}</td>
                </tr>
                <tr>
                  <td><strong>Billing Period:</strong></td>
                  <td>Monthly Subscription</td>
                </tr>
              </table>
            </div>
            
            <p>Your subscription will automatically renew each month. You can manage your subscription or download invoices from your vendor dashboard.</p>
            
            <p>Thank you for your business!</p>
            
            <p>Best regards,<br>
            The MySeniorValet Billing Team</p>
          </div>
          
          <div class="footer">
            <p>© 2025 MySeniorValet. All rights reserved.</p>
            <p>Keep this receipt for your records.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await sgMail.send(msg);
    console.log(`Payment receipt sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending payment receipt:', error);
    return false;
  }
}

export async function sendVendorStatusChangeEmail(data: VendorStatusChangeEmailData) {
  const { businessName, contactName, email, newStatus, reason } = data;
  
  const statusMessages = {
    active: 'Your vendor account has been activated and is now live on MySeniorValet.',
    suspended: 'Your vendor account has been temporarily suspended.',
    inactive: 'Your vendor account has been deactivated.',
    pending: 'Your vendor account is pending review by our team.'
  };

  const msg = {
    to: email,
    from: 'noreply@myseniorvalet.com',
    subject: `Account Status Update - ${businessName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f3f4f6; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
          .status-box { padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center; }
          .status-active { background: #d1fae5; color: #065f46; }
          .status-suspended { background: #fef3c7; color: #92400e; }
          .status-inactive { background: #fee2e2; color: #991b1b; }
          .status-pending { background: #dbeafe; color: #1e40af; }
          .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Account Status Update</h1>
          </div>
          
          <div class="content">
            <p>Dear ${contactName},</p>
            
            <p>We're writing to inform you about a change to your vendor account status.</p>
            
            <div class="status-box status-${newStatus}">
              <h2>New Status: ${newStatus.toUpperCase()}</h2>
              <p>${statusMessages[newStatus as keyof typeof statusMessages] || 'Your account status has been updated.'}</p>
            </div>
            
            ${reason ? `
            <h3>Reason for Status Change:</h3>
            <p>${reason}</p>
            ` : ''}
            
            <h3>What This Means:</h3>
            ${newStatus === 'active' ? `
              <ul>
                <li>Your listing is now visible to potential customers</li>
                <li>You can receive and respond to leads</li>
                <li>All dashboard features are available</li>
              </ul>
            ` : newStatus === 'suspended' ? `
              <ul>
                <li>Your listing is temporarily hidden from search results</li>
                <li>You can still access your dashboard</li>
                <li>Please contact support to resolve any issues</li>
              </ul>
            ` : newStatus === 'inactive' ? `
              <ul>
                <li>Your listing is no longer visible</li>
                <li>You won't receive new leads</li>
                <li>Contact support to reactivate your account</li>
              </ul>
            ` : `
              <ul>
                <li>Your account is being reviewed by our team</li>
                <li>We'll notify you once the review is complete</li>
                <li>This usually takes 1-2 business days</li>
              </ul>
            `}
            
            <p>If you have questions about this status change, please contact our vendor support team:</p>
            <ul>
              <li>Email: vendors@myseniorvalet.com</li>
              <li>Phone: 1-800-VENDORS (1-800-836-3677)</li>
            </ul>
            
            <p>Best regards,<br>
            The MySeniorValet Team</p>
          </div>
          
          <div class="footer">
            <p>© 2025 MySeniorValet. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await sgMail.send(msg);
    console.log(`Status change email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending status change email:', error);
    return false;
  }
}