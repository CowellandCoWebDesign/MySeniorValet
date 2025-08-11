import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('✅ Email Notification System activated with SendGrid');
} else {
  console.log('⚠️ SendGrid API key not configured - email notifications disabled');
}

// Email template types
export enum EmailTemplateType {
  WELCOME = 'welcome',
  COMMUNITY_MATCH = 'community_match',
  PRICE_ALERT = 'price_alert',
  VENDOR_WELCOME = 'vendor_welcome',
  VENDOR_STATUS = 'vendor_status',
  FAMILY_INVITATION = 'family_invitation',
  REPORT_READY = 'report_ready',
  CONTACT_FORM = 'contact_form',
  ADMIN_ALERT = 'admin_alert'
}

// Admin notification emails
const ADMIN_EMAILS = {
  primary: 'William.cowell01@gmail.com',
  backup: 'CowellandCoWebDesign@gmail.com',
  public: 'hello@myseniorvalet.com'
};

interface BaseEmailData {
  to: string;
  cc?: string[];
  bcc?: string[];
}

interface WelcomeEmailData extends BaseEmailData {
  userName: string;
  userEmail: string;
}

interface CommunityMatchEmailData extends BaseEmailData {
  userName: string;
  matches: Array<{
    name: string;
    city: string;
    state: string;
    priceRange?: string;
    careTypes: string[];
  }>;
  searchCriteria: {
    location: string;
    careLevel: string;
    budget?: string;
  };
}

interface PriceAlertEmailData extends BaseEmailData {
  userName: string;
  community: {
    name: string;
    city: string;
    state: string;
    oldPrice?: string;
    newPrice: string;
    changeType: 'increased' | 'decreased' | 'new';
  };
}

interface ContactFormEmailData extends BaseEmailData {
  fromName: string;
  fromEmail: string;
  subject: string;
  message: string;
  communityName?: string;
}

class NotificationService {
  private isEnabled: boolean = false;

  constructor() {
    this.isEnabled = !!process.env.SENDGRID_API_KEY;
  }

  // Send welcome email to new users
  async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    if (!this.isEnabled) {
      console.log('📧 Email disabled - would send welcome email to:', data.userEmail);
      return false;
    }

    const msg = {
      to: data.to,
      from: 'hello@myseniorvalet.com',
      subject: 'Welcome to MySeniorValet - Your Trusted Senior Living Guide',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 15px 15px 0 0; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-radius: 0 0 15px 15px; }
            .button { display: inline-block; background: #7c3aed; color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; margin: 25px 0; font-weight: 600; }
            .feature-box { background: #f9fafb; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #7c3aed; }
            .feature-box h3 { margin-top: 0; color: #7c3aed; }
            .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
            .mission { background: #fef3c7; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #f59e0b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to MySeniorValet!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">The trusted platform for authentic senior living information</p>
            </div>
            
            <div class="content">
              <h2>Hi ${data.userName},</h2>
              
              <p>Welcome to MySeniorValet! We're honored to be part of your senior living journey.</p>
              
              <div class="mission">
                <p><strong>Our Mission:</strong> Helping families make informed decisions with verified data and transparent pricing.</p>
              </div>
              
              <h3>Your Free PLATINUM Features Include:</h3>
              
              <div class="feature-box">
                <h3>🔍 AI-Powered Matching</h3>
                <p>Our intelligent assistant analyzes your needs across 10 care levels to find perfect matches in seconds.</p>
              </div>
              
              <div class="feature-box">
                <h3>💰 Transparent Pricing</h3>
                <p>Access verified HUD pricing and market intelligence for over 34,000 communities nationwide.</p>
              </div>
              
              <div class="feature-box">
                <h3>📊 Complete Care Spectrum</h3>
                <p>From Independent Living to Hospice Care - understand all 10 levels of senior care at a glance.</p>
              </div>
              
              <div class="feature-box">
                <h3>🏥 Hospital & VA Resources</h3>
                <p>Find nearby hospitals, VA facilities, and emergency services integrated with your search.</p>
              </div>
              
              <div style="text-align: center;">
                <a href="https://myseniorvalet.com/ai-assistant" class="button">Start Your AI-Powered Search</a>
              </div>
              
              <h3>Quick Start Guide:</h3>
              <ol>
                <li><strong>Try our AI Assistant:</strong> Get personalized recommendations in under 30 seconds</li>
                <li><strong>Explore the Map:</strong> View communities, hospitals, and resources in your area</li>
                <li><strong>Save Favorites:</strong> Build your shortlist of preferred communities</li>
                <li><strong>Compare Options:</strong> Use our side-by-side comparison tools</li>
              </ol>
              
              <p>Need help? We're here for you:</p>
              <ul>
                <li>Email: hello@myseniorvalet.com</li>
                <li>Visit our Help Center for guides and tutorials</li>
              </ul>
              
              <p>Thank you for trusting MySeniorValet. Together, we're bringing clarity to senior living.</p>
              
              <p>Warm regards,<br>
              <strong>The MySeniorValet Team</strong></p>
            </div>
            
            <div class="footer">
              <p>© 2025 MySeniorValet. All rights reserved.</p>
              <p>Empowering families with transparent senior living information.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await sgMail.send(msg);
      console.log('✅ Welcome email sent to:', data.userEmail);
      return true;
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      return false;
    }
  }

  // Send community match alerts
  async sendCommunityMatchEmail(data: CommunityMatchEmailData): Promise<boolean> {
    if (!this.isEnabled) {
      console.log('📧 Email disabled - would send match alert to:', data.to);
      return false;
    }

    const matchList = data.matches.slice(0, 5).map(match => `
      <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 3px solid #7c3aed;">
        <h4 style="margin: 0 0 5px 0; color: #1f2937;">${match.name}</h4>
        <p style="margin: 5px 0; color: #6b7280;">📍 ${match.city}, ${match.state}</p>
        <p style="margin: 5px 0; color: #6b7280;">🏥 ${match.careTypes.join(', ')}</p>
        ${match.priceRange ? `<p style="margin: 5px 0; color: #059669; font-weight: 600;">💰 ${match.priceRange}</p>` : ''}
      </div>
    `).join('');

    const msg = {
      to: data.to,
      from: 'alerts@myseniorvalet.com',
      subject: `🎯 New Communities Match Your Search - ${data.searchCriteria.location}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 15px 15px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 15px 15px; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
            .search-criteria { background: #eff6ff; padding: 15px; border-radius: 8px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎯 New Matches Found!</h1>
              <p>We found communities that match your criteria</p>
            </div>
            
            <div class="content">
              <p>Hi ${data.userName},</p>
              
              <p>Great news! We've found <strong>${data.matches.length} communities</strong> that match your search criteria.</p>
              
              <div class="search-criteria">
                <h3>Your Search Criteria:</h3>
                <ul style="margin: 5px 0;">
                  <li>📍 Location: ${data.searchCriteria.location}</li>
                  <li>🏥 Care Level: ${data.searchCriteria.careLevel}</li>
                  ${data.searchCriteria.budget ? `<li>💰 Budget: ${data.searchCriteria.budget}</li>` : ''}
                </ul>
              </div>
              
              <h3>Top Matching Communities:</h3>
              ${matchList}
              
              <div style="text-align: center;">
                <a href="https://myseniorvalet.com/search" class="button">View All Matches</a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                💡 <strong>Tip:</strong> Save your favorite communities to compare them side-by-side and share with family members.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await sgMail.send(msg);
      console.log('✅ Match alert email sent to:', data.to);
      return true;
    } catch (error) {
      console.error('❌ Failed to send match alert:', error);
      return false;
    }
  }

  // Send price change alerts
  async sendPriceAlertEmail(data: PriceAlertEmailData): Promise<boolean> {
    if (!this.isEnabled) {
      console.log('📧 Email disabled - would send price alert to:', data.to);
      return false;
    }

    const changeIcon = data.community.changeType === 'decreased' ? '📉' : 
                       data.community.changeType === 'increased' ? '📈' : '🆕';
    const changeColor = data.community.changeType === 'decreased' ? '#059669' : 
                        data.community.changeType === 'increased' ? '#dc2626' : '#3b82f6';

    const msg = {
      to: data.to,
      from: 'alerts@myseniorvalet.com',
      subject: `${changeIcon} Price Update: ${data.community.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body>
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>${changeIcon} Price Update Alert</h2>
            <p>Hi ${data.userName},</p>
            <p>We've detected a price change for a community you're watching:</p>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid ${changeColor};">
              <h3>${data.community.name}</h3>
              <p>📍 ${data.community.city}, ${data.community.state}</p>
              ${data.community.oldPrice ? 
                `<p>Previous: ${data.community.oldPrice}</p>` : ''}
              <p style="font-size: 18px; color: ${changeColor}; font-weight: bold;">
                New Price: ${data.community.newPrice}
              </p>
            </div>
            
            <a href="https://myseniorvalet.com" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px;">
              View Community Details
            </a>
          </div>
        </body>
        </html>
      `
    };

    try {
      await sgMail.send(msg);
      console.log('✅ Price alert sent to:', data.to);
      return true;
    } catch (error) {
      console.error('❌ Failed to send price alert:', error);
      return false;
    }
  }

  // Send contact form submissions to admin
  async sendContactFormEmail(data: ContactFormEmailData): Promise<boolean> {
    if (!this.isEnabled) {
      console.log('📧 Email disabled - would send contact form to admin');
      return false;
    }

    const msg = {
      to: ADMIN_EMAILS.public,
      cc: [ADMIN_EMAILS.primary],
      from: 'noreply@myseniorvalet.com',
      replyTo: data.fromEmail,
      subject: `Contact Form: ${data.subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body>
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>New Contact Form Submission</h2>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <p><strong>From:</strong> ${data.fromName}</p>
              <p><strong>Email:</strong> ${data.fromEmail}</p>
              ${data.communityName ? `<p><strong>Community:</strong> ${data.communityName}</p>` : ''}
              <p><strong>Subject:</strong> ${data.subject}</p>
              
              <div style="background: white; padding: 15px; border-radius: 5px; margin-top: 15px;">
                <p><strong>Message:</strong></p>
                <p>${data.message.replace(/\n/g, '<br>')}</p>
              </div>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              Reply directly to this email to respond to ${data.fromName}.
            </p>
          </div>
        </body>
        </html>
      `
    };

    try {
      await sgMail.send(msg);
      console.log('✅ Contact form sent to admin');
      return true;
    } catch (error) {
      console.error('❌ Failed to send contact form:', error);
      return false;
    }
  }

  // Send admin alerts for critical events
  async sendAdminAlert(subject: string, message: string, priority: 'low' | 'medium' | 'high' = 'medium'): Promise<boolean> {
    if (!this.isEnabled) {
      console.log('📧 Email disabled - would send admin alert:', subject);
      return false;
    }

    const priorityColors = {
      low: '#3b82f6',
      medium: '#f59e0b',
      high: '#dc2626'
    };

    const msg = {
      to: ADMIN_EMAILS.primary,
      cc: priority === 'high' ? [ADMIN_EMAILS.backup] : undefined,
      from: 'alerts@myseniorvalet.com',
      subject: `[${priority.toUpperCase()}] ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body>
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: ${priorityColors[priority]}; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
              <h2 style="margin: 0;">⚠️ System Alert - ${priority.toUpperCase()} Priority</h2>
            </div>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px;">
              <h3>${subject}</h3>
              <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                ${message.replace(/\n/g, '<br>')}
              </div>
              <p style="color: #6b7280; font-size: 14px;">
                Timestamp: ${new Date().toISOString()}
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await sgMail.send(msg);
      console.log('✅ Admin alert sent:', subject);
      return true;
    } catch (error) {
      console.error('❌ Failed to send admin alert:', error);
      return false;
    }
  }

  // Test email functionality
  async sendTestEmail(to: string = ADMIN_EMAILS.primary): Promise<boolean> {
    if (!this.isEnabled) {
      console.log('📧 Email disabled - cannot send test email');
      return false;
    }

    const msg = {
      to,
      from: 'noreply@myseniorvalet.com',
      subject: '✅ MySeniorValet Email System Test',
      html: `
        <!DOCTYPE html>
        <html>
        <body>
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>✅ Email System Test Successful!</h2>
            <p>This confirms that the MySeniorValet email notification system is working correctly.</p>
            
            <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
              <p><strong>System Status:</strong></p>
              <ul>
                <li>✅ SendGrid API connected</li>
                <li>✅ Email templates configured</li>
                <li>✅ Notification service active</li>
                <li>✅ Admin emails configured</li>
              </ul>
            </div>
            
            <p>Available notification types:</p>
            <ul>
              <li>Welcome emails for new users</li>
              <li>Community match alerts</li>
              <li>Price change notifications</li>
              <li>Vendor onboarding emails</li>
              <li>Contact form submissions</li>
              <li>Admin system alerts</li>
            </ul>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Test performed at: ${new Date().toLocaleString()}
            </p>
          </div>
        </body>
        </html>
      `
    };

    try {
      await sgMail.send(msg);
      console.log('✅ Test email sent successfully to:', to);
      return true;
    } catch (error) {
      console.error('❌ Failed to send test email:', error);
      return false;
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Export for vendor emails compatibility
export { sendVendorWelcomeEmail, sendVendorStatusChangeEmail } from './vendorEmails';