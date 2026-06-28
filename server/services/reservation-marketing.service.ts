import sgMail from '@sendgrid/mail';
import { db } from '../db';
import { communities } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface ReservationRequest {
  communityId: number;
  communityName: string;
  communityAddress: string;
  communityPhone?: string;
  communityEmail?: string;
  
  // User Information
  userName: string;
  userEmail: string;
  userPhone?: string;
  
  // Reservation Details
  unitType?: string;
  moveInDate?: string;
  careNeeds?: string;
  budget?: string;
  additionalNotes?: string;
  
  // System Info
  requestType: 'reservation' | 'waitlist';
  depositAmount: number;
  paymentTerms: string;
}

export class ReservationMarketingService {
  private readonly DEPOSIT_AMOUNT = 500;
  private readonly PAYMENT_TERMS = "Pay at time of arrival";
  
  /**
   * Process a reservation request and send marketing emails
   */
  async processReservationRequest(request: ReservationRequest) {
    try {
      // Check if SendGrid is configured
      if (!process.env.SENDGRID_API_KEY) {
        console.warn('⚠️ SendGrid API key not configured - emails will not be sent');
        return { success: true, message: 'Reservation request processed (email disabled)' };
      }
      
      // Ensure deposit amount and payment terms are correct
      request.depositAmount = this.DEPOSIT_AMOUNT;
      request.paymentTerms = this.PAYMENT_TERMS;
      
      console.log(`📧 Processing reservation emails for ${request.communityName}`);
      console.log(`   Community Email: ${request.communityEmail || 'Not provided'}`);
      console.log(`   User Email: ${request.userEmail}`);
      
      // Send emails to all recipients
      const emailPromises = [];
      const emailTargets = [];
      
      // 1. Email to Community
      if (request.communityEmail) {
        console.log(`   ✉️ Sending to community: ${request.communityEmail}`);
        emailPromises.push(this.sendCommunityEmail(request));
        emailTargets.push(`community (${request.communityEmail})`);
      } else {
        console.log(`   ⚠️ No community email available for ${request.communityName}`);
      }
      
      // 2. Email to Admin
      console.log(`   ✉️ Sending to admin: CowellandCoWebDesign@gmail.com`);
      emailPromises.push(this.sendAdminEmail(request));
      emailTargets.push('CowellandCoWebDesign@gmail.com');
      
      // 3. Email to Hello (Marketing)
      console.log(`   ✉️ Sending to marketing: CowellandCoWebDesign@gmail.com`);
      emailPromises.push(this.sendMarketingEmail(request));
      emailTargets.push('CowellandCoWebDesign@gmail.com');
      
      // 4. Confirmation to User
      console.log(`   ✉️ Sending confirmation to user: ${request.userEmail}`);
      emailPromises.push(this.sendUserConfirmation(request));
      emailTargets.push(`user (${request.userEmail})`);
      
      // Send all emails in parallel
      const results = await Promise.allSettled(emailPromises);
      
      // Check results
      const failedEmails = results.filter(r => r.status === 'rejected');
      if (failedEmails.length > 0) {
        console.error(`❌ Failed to send ${failedEmails.length} emails:`, failedEmails);
        failedEmails.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`   Failed to send to ${emailTargets[index]}:`, result.reason);
          }
        });
      }
      
      console.log(`✅ Successfully sent ${results.filter(r => r.status === 'fulfilled').length}/${results.length} reservation emails for ${request.communityName}`);
      return { success: true, message: 'Reservation request processed successfully' };
      
    } catch (error) {
      console.error('❌ Error processing reservation:', error);
      return { success: false, error: 'Failed to process reservation request' };
    }
  }
  
  /**
   * Send email to community showing the value of MySeniorValet
   */
  private async sendCommunityEmail(request: ReservationRequest) {
    const msg = {
      to: request.communityEmail!,
      from: 'hello@myseniorvalet.com',
      replyTo: 'CowellandCoWebDesign@gmail.com',
      bcc: ['CowellandCoWebDesign@gmail.com', 'CowellandCoWebDesign@gmail.com'],
      subject: `🎯 New Qualified Lead from MySeniorValet - ${request.userName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white; }
            .content { padding: 40px; background: #f8f9fa; }
            .lead-card { background: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 30px; }
            .highlight { background: #10b981; color: white; padding: 3px 8px; border-radius: 4px; font-weight: bold; }
            .info-row { display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .info-label { font-weight: 600; color: #6b7280; width: 150px; }
            .info-value { color: #111827; flex: 1; }
            .cta-button { display: inline-block; background: #3b82f6; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .value-prop { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; }
            .footer { background: #1f2937; color: white; padding: 30px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏆 New Qualified Lead from MySeniorValet</h1>
            <p style="font-size: 20px;">A family is ready to ${request.requestType === 'reservation' ? 'reserve a unit' : 'join your waitlist'} at ${request.communityName}</p>
          </div>
          
          <div class="content">
            <div class="lead-card">
              <h2 style="color: #1f2937; margin-top: 0;">Lead Details</h2>
              
              <div class="info-row">
                <div class="info-label">Name:</div>
                <div class="info-value"><strong>${request.userName}</strong></div>
              </div>
              
              <div class="info-row">
                <div class="info-label">Email:</div>
                <div class="info-value"><a href="mailto:${request.userEmail}">${request.userEmail}</a></div>
              </div>
              
              ${request.userPhone ? `
              <div class="info-row">
                <div class="info-label">Phone:</div>
                <div class="info-value"><a href="tel:${request.userPhone}">${request.userPhone}</a></div>
              </div>
              ` : ''}
              
              ${request.moveInDate ? `
              <div class="info-row">
                <div class="info-label">Desired Move-In:</div>
                <div class="info-value"><span class="highlight">${request.moveInDate}</span></div>
              </div>
              ` : ''}
              
              ${(request as any).lengthOfStay ? `
              <div class="info-row">
                <div class="info-label">Length of Stay:</div>
                <div class="info-value"><span class="highlight">${this.formatLengthOfStay((request as any).lengthOfStay)}</span></div>
              </div>
              ` : ''}
              
              ${request.unitType ? `
              <div class="info-row">
                <div class="info-label">Unit Type:</div>
                <div class="info-value">${request.unitType}</div>
              </div>
              ` : ''}
              
              ${request.budget ? `
              <div class="info-row">
                <div class="info-label">Budget Range:</div>
                <div class="info-value">${request.budget}</div>
              </div>
              ` : ''}
              
              ${request.careNeeds ? `
              <div class="info-row">
                <div class="info-label">Care Needs:</div>
                <div class="info-value">${request.careNeeds}</div>
              </div>
              ` : ''}
              
              ${request.additionalNotes ? `
              <div class="info-row">
                <div class="info-label">Additional Notes:</div>
                <div class="info-value">${request.additionalNotes}</div>
              </div>
              ` : ''}
              
              <div style="background: #ecfdf5; border: 2px solid #10b981; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <h3 style="color: #059669; margin-top: 0;">💰 Reservation Terms</h3>
                <p><strong>Deposit Amount:</strong> $${request.depositAmount}</p>
                <p><strong>Payment Terms:</strong> ${request.paymentTerms}</p>
                <p style="color: #059669; font-weight: bold;">✅ This family is registered on MySeniorValet and ready to move forward!</p>
              </div>
            </div>
            
            <div class="value-prop">
              <h3 style="margin-top: 0;">🚀 Why This Lead is Different</h3>
              <ul>
                <li><strong>Pre-qualified:</strong> Family has already researched and chosen your community</li>
                <li><strong>Ready to commit:</strong> Willing to place a $500 deposit</li>
                <li><strong>Transparent process:</strong> All information verified through our platform</li>
                <li><strong>High intent:</strong> Registered users show 3x higher conversion rates</li>
              </ul>
            </div>
            
            <div style="text-align: center;">
              <h2 style="color: #1f2937;">Ready to Convert This Lead?</h2>
              <p>Contact ${request.userName} immediately while they're actively looking!</p>
              <a href="mailto:${request.userEmail}" class="cta-button">Contact Family Now →</a>
            </div>
            
            <div style="background: #eff6ff; border: 2px solid #3b82f6; padding: 20px; border-radius: 8px; margin-top: 30px;">
              <h3 style="color: #1e40af; margin-top: 0;">📈 Maximize Your MySeniorValet Presence</h3>
              <p>Communities with claimed profiles receive <strong>5x more qualified leads</strong>.</p>
              <ul>
                <li>✅ Upload real photos and virtual tours</li>
                <li>✅ Keep pricing and availability current</li>
                <li>✅ Respond to inquiries within 1 hour</li>
                <li>✅ Showcase your unique amenities and care services</li>
              </ul>
              <p style="text-align: center;">
                <a href="https://myseniorvalet.com/claim-community/${request.communityId}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px;">
                  👑 Claim Your Community Profile
                </a>
              </p>
              <p style="text-align: center; margin-top: 10px;">
                <a href="https://myseniorvalet.com/community-portal" style="color: #3b82f6; font-weight: bold;">
                  Or access your Community Portal →
                </a>
              </p>
            </div>
          </div>
          
          <div class="footer">
            <h3>MySeniorValet - The Trusted Platform for Senior Living</h3>
            <p>Connecting families with authentic community information</p>
            <p style="margin-top: 20px; font-size: 12px;">
              This lead was generated through MySeniorValet.com<br>
              Questions? Contact us at CowellandCoWebDesign@gmail.com
            </p>
          </div>
        </body>
        </html>
      `,
      text: `New Qualified Lead from MySeniorValet

${request.userName} is interested in ${request.requestType === 'reservation' ? 'reserving a unit' : 'joining the waitlist'} at ${request.communityName}.

Contact Information:
- Name: ${request.userName}
- Email: ${request.userEmail}
${request.userPhone ? `- Phone: ${request.userPhone}` : ''}

Reservation Details:
- Deposit: $${request.depositAmount}
- Payment: ${request.paymentTerms}
${request.moveInDate ? `- Move-in Date: ${request.moveInDate}` : ''}
${(request as any).lengthOfStay ? `- Length of Stay: ${this.formatLengthOfStay((request as any).lengthOfStay)}` : ''}
${request.unitType ? `- Unit Type: ${request.unitType}` : ''}
${request.budget ? `- Budget: ${request.budget}` : ''}

This is a pre-qualified lead from MySeniorValet.com. The family has registered on our platform and is ready to move forward.

Contact them immediately to convert this opportunity!
`
    };
    
    return sgMail.send(msg);
  }
  
  /**
   * Send notification to admin
   */
  private async sendAdminEmail(request: ReservationRequest) {
    const msg = {
      to: 'CowellandCoWebDesign@gmail.com',
      from: 'hello@myseniorvalet.com',
      replyTo: 'CowellandCoWebDesign@gmail.com',
      subject: `[LEAD] ${request.requestType} request for ${request.communityName}`,
      html: `
        <h2>New ${request.requestType} Request</h2>
        <p><strong>Community:</strong> ${request.communityName}</p>
        <p><strong>Address:</strong> ${request.communityAddress}</p>
        <p><strong>Community Contact:</strong> ${request.communityEmail || 'Not available'}</p>
        <hr>
        <p><strong>User:</strong> ${request.userName}</p>
        <p><strong>Email:</strong> ${request.userEmail}</p>
        <p><strong>Phone:</strong> ${request.userPhone || 'Not provided'}</p>
        <hr>
        <p><strong>Move-in Date:</strong> ${request.moveInDate || 'Flexible'}</p>
        <p><strong>Length of Stay:</strong> ${(request as any).lengthOfStay ? this.formatLengthOfStay((request as any).lengthOfStay) : 'Not specified'}</p>
        <p><strong>Unit Type:</strong> ${request.unitType || 'Any available'}</p>
        <p><strong>Budget:</strong> ${request.budget || 'Not specified'}</p>
        <p><strong>Care Needs:</strong> ${request.careNeeds || 'Not specified'}</p>
        <p><strong>Notes:</strong> ${request.additionalNotes || 'None'}</p>
        <hr>
        <p><strong>Deposit:</strong> $${request.depositAmount} (${request.paymentTerms})</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      `,
      text: `New ${request.requestType} request for ${request.communityName} from ${request.userName} (${request.userEmail})`
    };
    
    return sgMail.send(msg);
  }
  
  /**
   * Send to marketing team
   */
  private async sendMarketingEmail(request: ReservationRequest) {
    const msg = {
      to: 'CowellandCoWebDesign@gmail.com',
      from: 'hello@myseniorvalet.com',
      replyTo: 'CowellandCoWebDesign@gmail.com',
      subject: `🎯 Platform Engagement: ${request.communityName} Lead`,
      html: `
        <h2>Platform Engagement Metrics</h2>
        <p>A new lead has been generated through MySeniorValet showing platform value!</p>
        <hr>
        <h3>Community Engagement</h3>
        <p><strong>Community:</strong> ${request.communityName}</p>
        <p><strong>Has Email:</strong> ${request.communityEmail ? '✅ Yes' : '❌ No'}</p>
        <p><strong>Lead Type:</strong> ${request.requestType}</p>
        <hr>
        <h3>User Engagement</h3>
        <p><strong>User:</strong> ${request.userName}</p>
        <p><strong>Ready to pay deposit:</strong> ✅ Yes ($${request.depositAmount})</p>
        <p><strong>Move-in timeline:</strong> ${request.moveInDate || 'Not specified'}</p>
        <hr>
        <h3>Marketing Opportunity</h3>
        <ul>
          <li>Follow up with community about claiming their profile</li>
          <li>Use this as a success story for community outreach</li>
          <li>Track conversion rate for platform metrics</li>
        </ul>
      `,
      text: `New lead for ${request.communityName} from ${request.userName}. Great opportunity to showcase platform value!`
    };
    
    return sgMail.send(msg);
  }
  
  /**
   * Send confirmation to user
   */
  private async sendUserConfirmation(request: ReservationRequest) {
    const msg = {
      to: request.userEmail,
      from: 'hello@myseniorvalet.com',
      replyTo: 'CowellandCoWebDesign@gmail.com',
      bcc: ['CowellandCoWebDesign@gmail.com', 'CowellandCoWebDesign@gmail.com'],
      subject: `Reservation Request Confirmed - ${request.communityName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white; }
            .content { padding: 40px; background: #f8f9fa; }
            .confirmation-box { background: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .success-badge { background: #10b981; color: white; padding: 10px 20px; border-radius: 50px; display: inline-block; font-weight: bold; margin: 20px 0; }
            .next-steps { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; }
            .footer { background: #1f2937; color: white; padding: 30px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>✅ Reservation Request Received!</h1>
            <p style="font-size: 18px;">We've sent your information to ${request.communityName}</p>
          </div>
          
          <div class="content">
            <div class="confirmation-box">
              <div style="text-align: center;">
                <div class="success-badge">Request Successfully Submitted</div>
              </div>
              
              <h2>What Happens Next?</h2>
              
              <div class="next-steps">
                <h3 style="margin-top: 0;">📞 Step 1: Community Contact</h3>
                <p>${request.communityName} will contact you within 24-48 hours to discuss availability and schedule a tour.</p>
              </div>
              
              <div class="next-steps">
                <h3 style="margin-top: 0;">🏠 Step 2: Tour & Assessment</h3>
                <p>Visit the community to see the facilities, meet staff, and discuss care needs.</p>
              </div>
              
              <div class="next-steps">
                <h3 style="margin-top: 0;">💳 Step 3: Deposit & Move-In</h3>
                <p><strong>Deposit:</strong> $${request.depositAmount}<br>
                <strong>Payment:</strong> ${request.paymentTerms}<br>
                No payment required until you're ready to move in!</p>
              </div>
              
              <h2>Your Request Details</h2>
              <table style="width: 100%; margin: 20px 0;">
                <tr><td style="padding: 10px 0;"><strong>Community:</strong></td><td>${request.communityName}</td></tr>
                <tr><td style="padding: 10px 0;"><strong>Address:</strong></td><td>${request.communityAddress}</td></tr>
                ${request.moveInDate ? `<tr><td style="padding: 10px 0;"><strong>Move-In Date:</strong></td><td>${request.moveInDate}</td></tr>` : ''}
                ${request.unitType ? `<tr><td style="padding: 10px 0;"><strong>Unit Type:</strong></td><td>${request.unitType}</td></tr>` : ''}
                ${request.budget ? `<tr><td style="padding: 10px 0;"><strong>Budget:</strong></td><td>${request.budget}</td></tr>` : ''}
              </table>
              
              <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #92400e; margin-top: 0;">💡 Helpful Tips</h3>
                <ul style="margin: 0;">
                  <li>Prepare a list of questions for your tour</li>
                  <li>Ask about all fees and what's included</li>
                  <li>Tour multiple communities for comparison</li>
                  <li>Bring a family member or friend for support</li>
                </ul>
              </div>
              
              <div style="background: #e0e7ff; border: 2px solid #4f46e5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #312e81; margin-top: 0;">🔧 Your Family Tools & Resources</h3>
                <p style="color: #312e81; margin: 10px 0;">Access all your senior living planning tools in one place:</p>
                
                <div style="margin: 20px 0;">
                  <a href="https://myseniorvalet.com/tour-tracker" 
                     style="display: block; background: #4f46e5; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; text-align: center; margin-bottom: 10px;">
                    📍 Tour Tracker™ - Schedule & Manage Tours
                  </a>
                  
                  <a href="https://myseniorvalet.com/family-collaboration-center" 
                     style="display: block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; text-align: center; margin-bottom: 10px;">
                    👨‍👩‍👧‍👦 Family Collaboration Center
                  </a>
                  
                  <a href="https://myseniorvalet.com/dashboard" 
                     style="display: block; background: #059669; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; text-align: center;">
                    🏠 Your Personal Dashboard
                  </a>
                </div>
                
                <ul style="margin: 10px 0 0 20px; color: #312e81; font-size: 14px;">
                  <li>Track all your reservations and inquiries</li>
                  <li>Share research with family members</li>
                  <li>Compare communities side-by-side</li>
                  <li>Access benefits and resources</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <h3>MySeniorValet</h3>
            <p>The trusted platform for authentic senior living community information</p>
            <p style="margin-top: 20px;">Need help? Contact us at CowellandCoWebDesign@gmail.com</p>
          </div>
        </body>
        </html>
      `,
      text: `Your reservation request for ${request.communityName} has been confirmed!

The community will contact you within 24-48 hours.

Your deposit of $${request.depositAmount} will be due ${request.paymentTerms.toLowerCase()}.

Thank you for using MySeniorValet!`
    };
    
    return sgMail.send(msg);
  }
  
  /**
   * Format length of stay for display
   */
  private formatLengthOfStay(lengthOfStay: string): string {
    const formats: Record<string, string> = {
      '2-weeks': '2 Week Trial',
      '1-month': '1 Month Trial',
      '3-months': '3 Months (Standard)',
      '6-months': '6 Months',
      '1-year': '1 Year',
      'permanent': 'Permanent Residency',
      'flexible': 'Flexible/To Be Discussed'
    };
    
    return formats[lengthOfStay] || lengthOfStay;
  }
}

// Export a singleton instance
export const reservationMarketingService = new ReservationMarketingService();