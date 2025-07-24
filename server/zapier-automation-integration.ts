// Zapier Integration for Workflow Automation
import axios from 'axios';

export class ZapierAutomationIntegration {
  
  async triggerLeadCapture(leadData: {
    name: string;
    email: string;
    phone: string;
    interestedCommunities: string[];
    source: string;
  }): Promise<void> {
    if (!process.env.ZAPIER_LEAD_WEBHOOK_URL) return;

    try {
      await axios.post(process.env.ZAPIER_LEAD_WEBHOOK_URL, {
        timestamp: new Date().toISOString(),
        lead_name: leadData.name,
        lead_email: leadData.email,
        lead_phone: leadData.phone,
        interested_communities: leadData.interestedCommunities.join(', '),
        lead_source: leadData.source,
        platform: 'MySeniorValet'
      });
    } catch (error) {
      console.error('Zapier lead capture error:', error);
    }
  }

  async triggerTourScheduled(tourData: {
    familyName: string;
    communityName: string;
    tourDate: string;
    tourTime: string;
    contactEmail: string;
    communityPhone: string;
  }): Promise<void> {
    if (!process.env.ZAPIER_TOUR_WEBHOOK_URL) return;

    try {
      await axios.post(process.env.ZAPIER_TOUR_WEBHOOK_URL, {
        timestamp: new Date().toISOString(),
        family_name: tourData.familyName,
        community_name: tourData.communityName,
        tour_date: tourData.tourDate,
        tour_time: tourData.tourTime,
        contact_email: tourData.contactEmail,
        community_phone: tourData.communityPhone,
        platform: 'MySeniorValet'
      });
    } catch (error) {
      console.error('Zapier tour scheduling error:', error);
    }
  }

  async triggerApplicationStarted(applicationData: {
    applicantName: string;
    communityName: string;
    applicationId: string;
    monthlyRate: number;
    moveInDate: string;
  }): Promise<void> {
    if (!process.env.ZAPIER_APPLICATION_WEBHOOK_URL) return;

    try {
      await axios.post(process.env.ZAPIER_APPLICATION_WEBHOOK_URL, {
        timestamp: new Date().toISOString(),
        applicant_name: applicationData.applicantName,
        community_name: applicationData.communityName,
        application_id: applicationData.applicationId,
        monthly_rate: applicationData.monthlyRate,
        move_in_date: applicationData.moveInDate,
        platform: 'MySeniorValet'
      });
    } catch (error) {
      console.error('Zapier application webhook error:', error);
    }
  }

  async triggerFamilyCollaboration(collaborationData: {
    familyMembers: string[];
    communityName: string;
    collaborationType: 'tour_planning' | 'decision_making' | 'move_coordination';
    roomId: string;
  }): Promise<void> {
    if (!process.env.ZAPIER_COLLABORATION_WEBHOOK_URL) return;

    try {
      await axios.post(process.env.ZAPIER_COLLABORATION_WEBHOOK_URL, {
        timestamp: new Date().toISOString(),
        family_members: collaborationData.familyMembers.join(', '),
        community_name: collaborationData.communityName,
        collaboration_type: collaborationData.collaborationType,
        room_id: collaborationData.roomId,
        platform: 'MySeniorValet'
      });
    } catch (error) {
      console.error('Zapier collaboration webhook error:', error);
    }
  }

  async triggerPaymentProcessed(paymentData: {
    customerName: string;
    amount: number;
    serviceType: 'family_collaboration' | 'priority_placement' | 'concierge_service';
    transactionId: string;
  }): Promise<void> {
    if (!process.env.ZAPIER_PAYMENT_WEBHOOK_URL) return;

    try {
      await axios.post(process.env.ZAPIER_PAYMENT_WEBHOOK_URL, {
        timestamp: new Date().toISOString(),
        customer_name: paymentData.customerName,
        amount: paymentData.amount,
        service_type: paymentData.serviceType,
        transaction_id: paymentData.transactionId,
        platform: 'MySeniorValet'
      });
    } catch (error) {
      console.error('Zapier payment webhook error:', error);
    }
  }
}

export const zapierAutomation = new ZapierAutomationIntegration();