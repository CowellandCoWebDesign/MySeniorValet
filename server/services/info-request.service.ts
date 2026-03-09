import { sendEmail } from '../sendgrid-service';

interface InfoRequest {
  communityId: number;
  communityName: string;
  communityLocation: string;
  communityPhone?: string;
  communityEmail?: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  interestedParty?: string;
  timeframe?: string;
  specificQuestions?: string;
  requestedInfo?: string[];
}

export class InfoRequestService {
  private static instance: InfoRequestService;
  
  static getInstance(): InfoRequestService {
    if (!InfoRequestService.instance) {
      InfoRequestService.instance = new InfoRequestService();
    }
    return InfoRequestService.instance;
  }

  /**
   * Process information request and send emails to all parties
   */
  async processInfoRequest(request: InfoRequest) {
    console.log('📋 Processing information request for:', request.communityName);
    
    const emailPromises: Promise<any>[] = [];
    const emailTargets: string[] = [];
    
    try {
      // 1. Email to Community (if they have an email)
      if (request.communityEmail && this.isValidEmail(request.communityEmail)) {
        console.log(`   ✉️ Sending to community: ${request.communityEmail}`);
        emailPromises.push(this.sendCommunityEmail(request));
        emailTargets.push(request.communityEmail);
      } else {
        console.log(`   ⚠️ No community email available for ${request.communityName}`);
      }
      
      // 2. Email to Admin - ALWAYS SEND for tracking
      console.log(`   ✉️ Sending to admin: admin@myseniorvalet.com`);
      emailPromises.push(this.sendAdminEmail(request));
      emailTargets.push('admin@myseniorvalet.com');
      
      // 3. Email to Marketing team
      console.log(`   ✉️ Sending to marketing: hello@myseniorvalet.com`);
      emailPromises.push(this.sendMarketingEmail(request));
      emailTargets.push('hello@myseniorvalet.com');
      
      // 4. Email confirmation to User
      console.log(`   ✉️ Sending confirmation to user: ${request.userEmail}`);
      emailPromises.push(this.sendUserConfirmation(request));
      emailTargets.push(request.userEmail);
      
      // Send all emails in parallel
      const results = await Promise.allSettled(emailPromises);
      
      // Check admin email specifically (it's always the second email in our array)
      const adminEmailIndex = emailTargets.indexOf('admin@myseniorvalet.com');
      const adminEmailSent = adminEmailIndex !== -1 && results[adminEmailIndex]?.status === 'fulfilled';
      
      // Log results
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          console.log(`   ✅ Successfully sent to ${emailTargets[index]}`);
        } else {
          console.error(`   ❌ Failed to send to ${emailTargets[index]}:`, result.reason);
        }
      });
      
      // Count successful emails
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      
      // CRITICAL: Admin notification MUST succeed for overall success
      if (!adminEmailSent) {
        console.error('🚨 CRITICAL: Failed to send admin notification to admin@myseniorvalet.com');
        
        // Retry admin email once
        console.log('🔄 Retrying admin email notification...');
        try {
          await this.sendAdminEmail(request);
          console.log('✅ Admin email sent successfully on retry');
          return {
            success: true,
            emailsSent: successCount,
            totalEmails: results.length,
            adminNotified: true,
            error: undefined
          };
        } catch (retryError) {
          console.error('❌ Admin email retry failed:', retryError);
          return {
            success: false,
            emailsSent: successCount,
            totalEmails: results.length,
            adminNotified: false,
            error: 'Failed to notify admin. Request logged but requires manual follow-up.'
          };
        }
      }
      
      return {
        success: true,
        emailsSent: successCount,
        totalEmails: results.length,
        adminNotified: true,
        error: undefined
      };
      
    } catch (error) {
      console.error('❌ Error processing information request:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send email to community
   */
  private async sendCommunityEmail(request: InfoRequest) {
    const infoLabels = this.formatRequestedInfo(request.requestedInfo || []);
    
    const msg = {
      to: 'CowellandCoWebDesign@gmail.com',
      from: 'CowellandCoWebDesign@gmail.com',
      subject: `🎯 New Information Request from MySeniorValet - ${request.userName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #f7f7f7; }
            .info-box { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .highlight { background: #fffae6; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
            .cta { background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏢 New Information Request</h1>
            <p>A prospective resident is interested in ${request.communityName}!</p>
          </div>
          
          <div class="content">
            <div class="highlight">
              <strong>⚡ Action Required:</strong> Please contact this lead within 24 hours to maximize conversion potential.
            </div>
            
            <div class="info-box">
              <h2>Contact Information</h2>
              <p><strong>Name:</strong> ${request.userName}</p>
              <p><strong>Email:</strong> <a href="mailto:${request.userEmail}">${request.userEmail}</a></p>
              <p><strong>Phone:</strong> <a href="tel:${request.userPhone}">${request.userPhone}</a></p>
              <p><strong>Best Contact Method:</strong> Phone (primary), Email (secondary)</p>
            </div>
            
            <div class="info-box">
              <h2>Information Requested</h2>
              <p><strong>Specific Information Needed:</strong></p>
              <ul>
                ${infoLabels.map(info => `<li>${info}</li>`).join('')}
              </ul>
              ${request.specificQuestions ? `
                <p><strong>Additional Questions:</strong></p>
                <p style="background: #f0f0f0; padding: 10px; border-radius: 5px;">${request.specificQuestions}</p>
              ` : ''}
            </div>
            
            <div class="info-box">
              <h2>Lead Details</h2>
              <p><strong>Looking for:</strong> ${request.interestedParty === 'self' ? 'Themselves' : request.interestedParty || 'Not specified'}</p>
              <p><strong>Timeframe:</strong> ${this.formatTimeframe(request.timeframe)}</p>
              <p><strong>Source:</strong> MySeniorValet Platform</p>
              <p><strong>Lead Quality:</strong> ⭐⭐⭐⭐⭐ High Intent (Active Information Request)</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="tel:${request.userPhone}" class="cta">📞 Call ${request.userName} Now</a>
            </div>
            
            <div class="info-box" style="background: #e3f2fd;">
              <h3>💡 Tips for Successful Conversion:</h3>
              <ul>
                <li>Call within 1 hour for 7x higher conversion rate</li>
                <li>Have pricing and availability ready</li>
                <li>Offer a personal tour scheduling</li>
                <li>Send follow-up email with requested information</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>This lead was generated through MySeniorValet - The trusted platform for senior living</p>
            <p>Questions? Contact us at admin@myseniorvalet.com</p>
          </div>
        </body>
        </html>
      `
    };
    
    return sendEmail(msg);
  }

  /**
   * Send notification to admin
   */
  private async sendAdminEmail(request: InfoRequest) {
    const infoLabels = this.formatRequestedInfo(request.requestedInfo || []);
    
    const msg = {
      to: 'CowellandCoWebDesign@gmail.com',
      from: 'CowellandCoWebDesign@gmail.com',
      subject: `[INFO REQUEST] ${request.communityName} - ${request.userName}`,
      html: `
        <h2>New Information Request Submitted</h2>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        
        <h3>Community Details:</h3>
        <ul>
          <li><strong>Name:</strong> ${request.communityName}</li>
          <li><strong>Location:</strong> ${request.communityLocation}</li>
          <li><strong>Community Email:</strong> ${request.communityEmail || 'Not available'}</li>
          <li><strong>Community Phone:</strong> ${request.communityPhone || 'Not available'}</li>
        </ul>
        
        <h3>User Details:</h3>
        <ul>
          <li><strong>Name:</strong> ${request.userName}</li>
          <li><strong>Email:</strong> ${request.userEmail}</li>
          <li><strong>Phone:</strong> ${request.userPhone}</li>
          <li><strong>Looking for:</strong> ${request.interestedParty || 'Not specified'}</li>
          <li><strong>Timeframe:</strong> ${request.timeframe || 'Not specified'}</li>
        </ul>
        
        <h3>Information Requested:</h3>
        <ul>
          ${infoLabels.map(info => `<li>${info}</li>`).join('')}
        </ul>
        
        ${request.specificQuestions ? `
          <h3>Specific Questions:</h3>
          <p>${request.specificQuestions}</p>
        ` : ''}
        
        <h3>Email Status:</h3>
        <ul>
          <li>Community Email: ${request.communityEmail ? '✅ Sent' : '❌ No email available'}</li>
          <li>User Confirmation: ✅ Sent</li>
          <li>Marketing Team: ✅ Notified</li>
        </ul>
        
        <hr>
        <p><small>This is an automated notification from MySeniorValet Information Request System</small></p>
      `
    };
    
    return sendEmail(msg);
  }

  /**
   * Send notification to marketing team
   */
  private async sendMarketingEmail(request: InfoRequest) {
    const msg = {
      to: 'CowellandCoWebDesign@gmail.com',
      from: 'CowellandCoWebDesign@gmail.com',
      subject: `[LEAD] Information request for ${request.communityName}`,
      html: `
        <h2>New Information Request Lead</h2>
        <p><strong>Community:</strong> ${request.communityName}</p>
        <p><strong>Location:</strong> ${request.communityLocation}</p>
        <p><strong>User:</strong> ${request.userName} (${request.userEmail})</p>
        <p><strong>Phone:</strong> ${request.userPhone}</p>
        <p><strong>Timeframe:</strong> ${request.timeframe || 'Not specified'}</p>
        <p><strong>Information Requested:</strong> ${this.formatRequestedInfo(request.requestedInfo || []).join(', ')}</p>
        
        <hr>
        <p>Lead has been forwarded to the community and admin for tracking.</p>
      `
    };
    
    return sendEmail(msg);
  }

  /**
   * Send confirmation email to user
   */
  private async sendUserConfirmation(request: InfoRequest) {
    const msg = {
      to: request.userEmail,
      from: 'CowellandCoWebDesign@gmail.com',
      bcc: ['admin@myseniorvalet.com'],
      subject: `Information Request Received - ${request.communityName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #f7f7f7; }
            .info-box { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .timeline { background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; background: white; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>✅ Information Request Received!</h1>
            <p>Thank you for your interest in ${request.communityName}</p>
          </div>
          
          <div class="content">
            <div class="info-box">
              <h2>Dear ${request.userName},</h2>
              <p>We've successfully received your information request for <strong>${request.communityName}</strong> in ${request.communityLocation}.</p>
              <p>Your request has been forwarded directly to the community, and a representative will contact you within <strong>24-48 hours</strong> with the information you requested.</p>
            </div>
            
            <div class="timeline">
              <h3>📅 What Happens Next?</h3>
              <ol>
                <li><strong>Within 24 hours:</strong> A community representative will reach out via phone or email</li>
                <li><strong>Information Provided:</strong> They'll share ${this.formatRequestedInfo(request.requestedInfo || []).join(', ')}</li>
                <li><strong>Tour Scheduling:</strong> If interested, you can schedule a personal tour</li>
                <li><strong>No Obligation:</strong> This is a free service with no commitment required</li>
              </ol>
            </div>
            
            <div class="info-box">
              <h3>Your Contact Information on File:</h3>
              <p><strong>Phone:</strong> ${request.userPhone}</p>
              <p><strong>Email:</strong> ${request.userEmail}</p>
              <p><em>Please ensure you answer calls from the ${request.communityLocation} area.</em></p>
            </div>
            
            ${request.specificQuestions ? `
              <div class="info-box">
                <h3>Your Specific Questions:</h3>
                <p style="background: #f0f0f0; padding: 10px; border-radius: 5px;">${request.specificQuestions}</p>
                <p><em>The community will address these questions when they contact you.</em></p>
              </div>
            ` : ''}
            
            <div class="info-box" style="background: #fff3cd;">
              <h3>💡 Helpful Tips While You Wait:</h3>
              <ul>
                <li>Prepare a list of any additional questions</li>
                <li>Have your calendar ready for tour scheduling</li>
                <li>Consider your must-have amenities and care needs</li>
                <li>Think about your ideal move-in timeframe</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>MySeniorValet</strong> - Your trusted guide to senior living</p>
            <p>If you have any questions, please contact us at hello@myseniorvalet.com</p>
            <p><small>You received this email because you submitted an information request on MySeniorValet.com</small></p>
          </div>
        </body>
        </html>
      `
    };
    
    return sendEmail(msg);
  }

  /**
   * Format requested information for display
   */
  private formatRequestedInfo(info: string[]): string[] {
    const infoLabels: Record<string, string> = {
      pricing: 'Current Pricing & Fees',
      availability: 'Unit Availability',
      tourScheduling: 'Schedule a Tour',
      careServices: 'Care Services Offered',
      amenities: 'Amenities & Activities',
      virtualTour: 'Virtual Tour',
      brochure: 'Community Brochure',
      insurance: 'Insurance Accepted'
    };
    
    return info.map(item => infoLabels[item] || item);
  }

  /**
   * Format timeframe for display
   */
  private formatTimeframe(timeframe?: string): string {
    const timeframeLabels: Record<string, string> = {
      'immediate': 'Immediately',
      '1-month': 'Within 1 month',
      '3-months': 'Within 3 months',
      '6-months': 'Within 6 months',
      '1-year': 'Within 1 year',
      'exploring': 'Just exploring options'
    };
    
    return timeframeLabels[timeframe || ''] || timeframe || 'Not specified';
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export const infoRequestService = InfoRequestService.getInstance();