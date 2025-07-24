// HubSpot Marketing Integration for Lead Nurturing
import { Client } from '@hubspot/api-client';

export class HubSpotMarketingIntegration {
  private hubspotClient: any;

  constructor() {
    if (process.env.HUBSPOT_API_KEY) {
      this.hubspotClient = new Client({ apiKey: process.env.HUBSPOT_API_KEY });
    }
  }

  async createContact(contactData: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    careLevel: string;
    interestedCommunities: string[];
    leadSource: string;
  }): Promise<string> {
    if (!this.hubspotClient) throw new Error('HubSpot not configured');

    const properties = {
      email: contactData.email,
      firstname: contactData.firstName,
      lastname: contactData.lastName,
      phone: contactData.phone,
      senior_care_level: contactData.careLevel,
      interested_communities: contactData.interestedCommunities.join('; '),
      hs_lead_status: 'NEW',
      lead_source: contactData.leadSource
    };

    const response = await this.hubspotClient.crm.contacts.basicApi.create({
      properties
    });

    return response.id;
  }

  async enrollInWorkflow(contactId: string, workflowType: 'new_lead_nurture' | 'tour_follow_up' | 'post_move_in'): Promise<void> {
    if (!this.hubspotClient) return;

    const workflowIds = {
      'new_lead_nurture': process.env.HUBSPOT_NEW_LEAD_WORKFLOW_ID,
      'tour_follow_up': process.env.HUBSPOT_TOUR_FOLLOWUP_WORKFLOW_ID,
      'post_move_in': process.env.HUBSPOT_POST_MOVEIN_WORKFLOW_ID
    };

    const workflowId = workflowIds[workflowType];
    if (!workflowId) return;

    await this.hubspotClient.automation.workflows.enrollmentsApi.enroll(
      parseInt(workflowId),
      { contactIds: [contactId] }
    );
  }

  async sendPersonalizedEmail(contactId: string, emailTemplate: {
    templateId: string;
    subject: string;
    personalizations: Record<string, string>;
  }): Promise<void> {
    if (!this.hubspotClient) return;

    await this.hubspotClient.marketing.transactional.singleSendApi.sendEmail({
      emailId: parseInt(emailTemplate.templateId),
      message: {
        to: contactId,
        from: process.env.HUBSPOT_FROM_EMAIL || 'hello@myseniorvalet.com',
        subject: emailTemplate.subject
      },
      contactProperties: emailTemplate.personalizations
    });
  }

  async trackWebsiteActivity(contactId: string, activity: {
    pageUrl: string;
    communityId?: number;
    timeOnPage: number;
    source: string;
  }): Promise<void> {
    if (!this.hubspotClient) return;

    await this.hubspotClient.events.send({
      events: [{
        eventName: 'senior_living_page_view',
        occurredAt: new Date().toISOString(),
        properties: {
          page_url: activity.pageUrl,
          community_id: activity.communityId?.toString(),
          time_on_page: activity.timeOnPage,
          source: activity.source
        }
      }]
    });
  }

  async createDeal(dealData: {
    dealName: string;
    amount: number;
    dealStage: string;
    communityId: number;
    contactId: string;
    expectedCloseDate: string;
  }): Promise<string> {
    if (!this.hubspotClient) throw new Error('HubSpot not configured');

    const properties = {
      dealname: dealData.dealName,
      amount: dealData.amount.toString(),
      dealstage: dealData.dealStage,
      community_id: dealData.communityId.toString(),
      closedate: dealData.expectedCloseDate
    };

    const deal = await this.hubspotClient.crm.deals.basicApi.create({
      properties,
      associations: [{
        to: { id: dealData.contactId },
        types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }] // Contact to Deal
      }]
    });

    return deal.id;
  }
}

export const hubspotMarketing = new HubSpotMarketingIntegration();