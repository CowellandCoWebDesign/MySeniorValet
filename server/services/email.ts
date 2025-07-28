import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export interface EmailOptions {
  to: string | string[];
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

      // Add template or content
      if (options.templateId) {
        msg.templateId = options.templateId;
        msg.dynamicTemplateData = options.dynamicTemplateData;
      } else {
        if (options.text) msg.text = options.text;
        if (options.html) msg.html = options.html;
      }

      await sgMail.send(msg);
      console.log(`Email sent successfully to ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
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

  // Send tour confirmation email
  static async sendTourConfirmation(email: string, communityName: string, tourDate: Date): Promise<boolean> {
    const formattedDate = tourDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });

    return this.sendEmail({
      to: email,
      subject: `Tour Confirmed: ${communityName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e40af;">Your Tour is Confirmed!</h1>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">${communityName}</h2>
            <p><strong>Date & Time:</strong> ${formattedDate}</p>
          </div>
          
          <h3>What to expect:</h3>
          <ul>
            <li>Meet with community staff and tour the facilities</li>
            <li>View available rooms and common areas</li>
            <li>Learn about services, amenities, and activities</li>
            <li>Discuss pricing and availability</li>
            <li>Ask any questions you have</li>
          </ul>
          
          <h3>Before your visit:</h3>
          <ul>
            <li>Prepare a list of questions</li>
            <li>Bring any necessary documentation</li>
            <li>Consider bringing family members</li>
          </ul>
          
          <div style="margin: 30px 0;">
            <a href="https://myseniorvalet.com/tours" style="background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Your Tours</a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Need to reschedule? Contact us at support@myseniorvalet.com
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
}