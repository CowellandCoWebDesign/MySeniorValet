// Mailchimp Email Marketing Integration
import mailchimp from '@mailchimp/mailchimp_marketing';

export class MailchimpEmailMarketing {
  
  constructor() {
    if (process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_SERVER_PREFIX) {
      mailchimp.setConfig({
        apiKey: process.env.MAILCHIMP_API_KEY,
        server: process.env.MAILCHIMP_SERVER_PREFIX
      });
    }
  }

  async addToNurturingList(subscriber: {
    email: string;
    firstName: string;
    lastName: string;
    careLevel: string;
    interestedLocations: string[];
    budgetRange: string;
  }): Promise<string> {
    if (!process.env.MAILCHIMP_NURTURING_LIST_ID) throw new Error('Mailchimp not configured');

    try {
      const response = await mailchimp.lists.addListMember(process.env.MAILCHIMP_NURTURING_LIST_ID, {
        email_address: subscriber.email,
        status: 'subscribed',
        merge_fields: {
          FNAME: subscriber.firstName,
          LNAME: subscriber.lastName,
          CARELEVEL: subscriber.careLevel,
          LOCATIONS: subscriber.interestedLocations.join(', '),
          BUDGET: subscriber.budgetRange
        },
        tags: ['senior-living-prospect', 'myseniorvalet-lead']
      });

      return response.id;
    } catch (error) {
      console.error('Mailchimp subscription error:', error);
      throw error;
    }
  }

  async sendWelcomeSequence(email: string, personalization: {
    firstName: string;
    interestedCommunities: string[];
  }): Promise<void> {
    if (!process.env.MAILCHIMP_WELCOME_CAMPAIGN_ID) return;

    try {
      await mailchimp.campaigns.send(process.env.MAILCHIMP_WELCOME_CAMPAIGN_ID);
      
      // Add personalized tag for community interests
      if (personalization.interestedCommunities.length > 0) {
        const communityTags = personalization.interestedCommunities.map(community => 
          `interested-${community.toLowerCase().replace(/\s+/g, '-')}`
        );
        
        await mailchimp.lists.updateListMemberTags(
          process.env.MAILCHIMP_NURTURING_LIST_ID!,
          email,
          { tags: communityTags.map(tag => ({ name: tag, status: 'active' })) }
        );
      }
    } catch (error) {
      console.error('Mailchimp welcome sequence error:', error);
    }
  }

  async sendTourFollowUp(email: string, tourData: {
    communityName: string;
    tourDate: string;
    familyFeedback?: string;
  }): Promise<void> {
    try {
      const campaign = await mailchimp.campaigns.create({
        type: 'regular',
        recipients: {
          list_id: process.env.MAILCHIMP_NURTURING_LIST_ID!,
          segment_opts: {
            conditions: [{
              condition_type: 'EmailAddress',
              field: 'EMAIL',
              op: 'is',
              value: email
            }]
          }
        },
        settings: {
          subject_line: `How did your tour of ${tourData.communityName} go?`,
          preview_text: 'We hope your senior living tour was helpful!',
          title: `Tour Follow-up - ${tourData.communityName}`,
          from_name: 'MySeniorValet Team',
          reply_to: process.env.MAILCHIMP_REPLY_EMAIL || 'hello@myseniorvalet.com'
        }
      });

      await mailchimp.campaigns.setContent(campaign.id, {
        html: this.generateTourFollowUpHTML(tourData)
      });

      await mailchimp.campaigns.send(campaign.id);
    } catch (error) {
      console.error('Mailchimp tour follow-up error:', error);
    }
  }

  private generateTourFollowUpHTML(tourData: any): string {
    return `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2>How was your tour of ${tourData.communityName}?</h2>
        
        <p>Hi there!</p>
        
        <p>We hope your tour on ${tourData.tourDate} was informative and helpful in your senior living search.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Next Steps:</h3>
          <ul>
            <li>Compare pricing and amenities with other communities</li>
            <li>Schedule additional tours if needed</li>
            <li>Ask about availability and move-in timelines</li>
            <li>Review care services and medical support</li>
          </ul>
        </div>
        
        <p>Need help comparing communities or have questions? Reply to this email and our senior living experts will assist you.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://myseniorvalet.com/dashboard" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            View Your Tour Dashboard
          </a>
        </div>
        
        <p>Best regards,<br>The MySeniorValet Team</p>
      </div>
    `;
  }

  async segmentByEngagement(engagementData: {
    email: string;
    toursScheduled: number;
    communitiesViewed: number;
    timeOnSite: number;
    lastActivity: Date;
  }): Promise<void> {
    try {
      let segmentTags = [];
      
      if (engagementData.toursScheduled > 0) {
        segmentTags.push('tour-scheduled');
      }
      
      if (engagementData.communitiesViewed > 5) {
        segmentTags.push('high-research');
      }
      
      if (engagementData.timeOnSite > 300) { // 5+ minutes
        segmentTags.push('engaged-user');
      }
      
      const daysSinceLastActivity = (Date.now() - engagementData.lastActivity.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceLastActivity > 7) {
        segmentTags.push('needs-nurturing');
      }

      if (segmentTags.length > 0) {
        await mailchimp.lists.updateListMemberTags(
          process.env.MAILCHIMP_NURTURING_LIST_ID!,
          engagementData.email,
          { tags: segmentTags.map(tag => ({ name: tag, status: 'active' })) }
        );
      }
    } catch (error) {
      console.error('Mailchimp segmentation error:', error);
    }
  }
}

export const mailchimpMarketing = new MailchimpEmailMarketing();