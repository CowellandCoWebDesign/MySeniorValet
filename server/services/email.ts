import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export interface EmailOptions {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  replyTo?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
}

// Default sender email
const DEFAULT_FROM_EMAIL = 'noreply@myseniorvalet.com';
const DEFAULT_FROM_NAME = 'MySeniorValet';

export class EmailService {
  static async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!SENDGRID_API_KEY) {
      console.error('SendGrid API key not configured');
      return false;
    }

    try {
      const msg: any = {
        to: options.to,
        from: {
          email: options.from || DEFAULT_FROM_EMAIL,
          name: DEFAULT_FROM_NAME
        },
        subject: options.subject,
        replyTo: options.replyTo
      };
      
      // Add cc and bcc if provided
      if (options.cc) {
        msg.cc = options.cc;
        console.log(`Adding CC recipients: ${Array.isArray(options.cc) ? options.cc.join(', ') : options.cc}`);
      }
      if (options.bcc) {
        msg.bcc = options.bcc;
        console.log(`Adding BCC recipients: ${Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc}`);
      }

      // Add template or content
      if (options.templateId) {
        msg.templateId = options.templateId;
        msg.dynamicTemplateData = options.dynamicTemplateData;
      } else {
        if (options.text) msg.text = options.text;
        if (options.html) msg.html = options.html;
      }

      console.log(`Attempting to send email:
        To: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}
        CC: ${options.cc ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc) : 'none'}
        Subject: ${options.subject}`);

      const response = await sgMail.send(msg);
      console.log(`✅ Email sent successfully! Response status: ${response[0].statusCode}`);
      console.log(`   To: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);
      console.log(`   Subject: ${options.subject}`);
      return true;
    } catch (error: any) {
      console.error('❌ Error sending email:', error.message || error);
      if (error.response) {
        console.error('SendGrid error details:', {
          status: error.code,
          message: error.message,
          response: error.response.body,
          from: options.from || DEFAULT_FROM_EMAIL
        });
        console.error('💡 SOLUTION: You need to verify the sender email in SendGrid');
        console.error('   1. Go to https://app.sendgrid.com/settings/sender_auth');
        console.error('   2. Add and verify: noreply@myseniorvalet.com');
        console.error('   3. OR use a different verified email as the sender');
      }
      return false;
    }
  }

  // Send welcome email to new users
  static async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: 'Welcome to MySeniorValet - Your Senior Living Journey Starts Here',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e40af;">Welcome to MySeniorValet, ${name}!</h1>
          <p>Thank you for joining MySeniorValet, your trusted partner in finding the perfect senior living community.</p>
          
          <h2>What you can do with MySeniorValet:</h2>
          <ul>
            <li>Search from 26,306+ verified communities nationwide</li>
            <li>Compare pricing and amenities transparently</li>
            <li>Schedule tours and track your visits</li>
            <li>Collaborate with family members on decisions</li>
            <li>Access AI-powered recommendations</li>
          </ul>
          
          <p>Get started by exploring communities in your area or using our AI assistant for personalized recommendations.</p>
          
          <div style="margin: 30px 0;">
            <a href="https://myseniorvalet.com" style="background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Start Exploring</a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If you have any questions, our team is here to help at support@myseniorvalet.com
          </p>
        </div>
      `
    });
  }



  // Send review request after tour
  static async sendReviewRequest(email: string, communityName: string, communityId: number): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: `How was your tour at ${communityName}?`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e40af;">Share Your Experience</h1>
          
          <p>Thank you for touring ${communityName}. Your feedback helps other families make informed decisions.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Quick Review</h3>
            <p>How would you rate your experience?</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="https://myseniorvalet.com/communities/${communityId}/review?rating=5" style="font-size: 24px; text-decoration: none; margin: 0 5px;">⭐⭐⭐⭐⭐</a>
            </div>
          </div>
          
          <p>Your review will help other families:</p>
          <ul>
            <li>Understand what to expect</li>
            <li>Learn about the community's strengths</li>
            <li>Make better-informed decisions</li>
          </ul>
          
          <div style="margin: 30px 0;">
            <a href="https://myseniorvalet.com/communities/${communityId}/review" style="background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Write a Review</a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Your privacy is important to us. Reviews can be posted anonymously if preferred.
          </p>
        </div>
      `
    });
  }

  // Send notification emails
  static async sendNotification(email: string, subject: string, message: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e40af;">MySeniorValet Notification</h1>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${message}
          </div>
          <p style="color: #666; font-size: 14px;">
            This is an automated notification from MySeniorValet. 
            If you have questions, contact us at support@myseniorvalet.com
          </p>
        </div>
      `
    });
  }

  // Send tour confirmation email
  static async sendTourConfirmation(
    email: string, 
    communityName: string, 
    tourDate: Date,
    details: {
      tourType: string;
      attendeeCount: number;
      specialRequests?: string;
      communityAddress: string;
      communityPhone: string;
      contactName: string;
    }
  ): Promise<boolean> {
    const formattedDate = tourDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = tourDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    return this.sendEmail({
      to: email,
      cc: ['hello@myseniorvalet.com'], // Always CC for tour tracking
      subject: `Tour Confirmed - ${communityName} - ${formattedDate}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1e40af; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0;">Tour Confirmation</h1>
          </div>
          
          <div style="padding: 30px;">
            <p>Dear ${details.contactName},</p>
            
            <p>Your tour has been successfully scheduled! We look forward to meeting you.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #1e40af; margin-top: 0;">Tour Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0;"><strong>Community:</strong></td>
                  <td>${communityName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Date:</strong></td>
                  <td>${formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Time:</strong></td>
                  <td>${formattedTime}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Tour Type:</strong></td>
                  <td>${details.tourType.replace('_', ' ').charAt(0).toUpperCase() + details.tourType.slice(1).replace('_', ' ')}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Number of Attendees:</strong></td>
                  <td>${details.attendeeCount}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Address:</strong></td>
                  <td>${details.communityAddress}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Phone:</strong></td>
                  <td>${details.communityPhone}</td>
                </tr>
                ${details.specialRequests ? `
                <tr>
                  <td style="padding: 8px 0; vertical-align: top;"><strong>Special Requests:</strong></td>
                  <td>${details.specialRequests}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #92400e; margin-top: 0;">What to Bring & Ask</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>List of questions about care services and pricing</li>
                <li>Insurance information (if applicable)</li>
                <li>List of current medications</li>
                <li>Any specific care needs or preferences</li>
              </ul>
              
              <h4 style="color: #92400e;">Suggested Questions:</h4>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>What is included in the base monthly rate?</li>
                <li>What additional services are available and at what cost?</li>
                <li>What is the staff-to-resident ratio?</li>
                <li>Can I see a sample menu and activity calendar?</li>
                <li>What is the move-in process and timeline?</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'https://myseniorvalet.com'}/communities/${communityName.toLowerCase().replace(/\s+/g, '-')}" 
                 style="background-color: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Community Profile
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #666; font-size: 14px;">
              <strong>Need to reschedule or cancel?</strong><br>
              Please contact the community directly at ${details.communityPhone} or reply to this email.
            </p>
            
            <p style="color: #666; font-size: 14px;">
              We'll send you a reminder 24 hours before your tour.
            </p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 14px; color: #666;">
            <p style="margin: 5px 0;">MySeniorValet - Clarity in Senior Living</p>
            <p style="margin: 5px 0;">Questions? Email us at support@myseniorvalet.com</p>
          </div>
        </div>
      `
    });
  }
}