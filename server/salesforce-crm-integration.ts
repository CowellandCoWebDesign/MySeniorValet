// Salesforce CRM Integration for Lead Management
import jsforce from 'jsforce';

export class SalesforceCRMIntegration {
  private conn: any;

  constructor() {
    if (process.env.SALESFORCE_USERNAME && process.env.SALESFORCE_PASSWORD && process.env.SALESFORCE_TOKEN) {
      this.conn = new jsforce.Connection({
        loginUrl: process.env.SALESFORCE_LOGIN_URL || 'https://login.salesforce.com'
      });
    }
  }

  async createLead(leadData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
    interestedCommunities: string[];
    careLevel: string;
    budget: string;
    timeline: string;
    source: string;
  }): Promise<string> {
    if (!this.conn) throw new Error('Salesforce not configured');

    await this.conn.login(process.env.SALESFORCE_USERNAME, process.env.SALESFORCE_PASSWORD + process.env.SALESFORCE_TOKEN);

    const lead = await this.conn.sobject('Lead').create({
      FirstName: leadData.firstName,
      LastName: leadData.lastName,
      Email: leadData.email,
      Phone: leadData.phone,
      Company: leadData.company,
      LeadSource: leadData.source,
      Senior_Care_Level__c: leadData.careLevel,
      Budget_Range__c: leadData.budget,
      Decision_Timeline__c: leadData.timeline,
      Interested_Communities__c: leadData.interestedCommunities.join('; '),
      Status: 'New'
    });

    return lead.id;
  }

  async updateLeadActivity(leadId: string, activity: {
    type: 'tour_scheduled' | 'tour_completed' | 'application_started' | 'moved_in';
    details: any;
  }): Promise<void> {
    if (!this.conn) return;

    await this.conn.sobject('Task').create({
      WhoId: leadId,
      Subject: this.getActivitySubject(activity.type),
      Description: JSON.stringify(activity.details),
      ActivityDate: new Date().toISOString().split('T')[0],
      Status: 'Completed'
    });

    // Update lead status based on activity
    const statusMap = {
      'tour_scheduled': 'Qualified',
      'tour_completed': 'Working',
      'application_started': 'Nurturing',
      'moved_in': 'Converted'
    };

    await this.conn.sobject('Lead').update({
      Id: leadId,
      Status: statusMap[activity.type]
    });
  }

  private getActivitySubject(type: string): string {
    const subjects = {
      'tour_scheduled': 'Senior Living Tour Scheduled',
      'tour_completed': 'Community Tour Completed',
      'application_started': 'Application Process Started',
      'moved_in': 'Successfully Moved Into Community'
    };
    return subjects[type] || 'Senior Living Activity';
  }

  async createOpportunity(communityId: number, leadId: string, opportunityData: {
    name: string;
    stage: string;
    amount: number;
    closeDate: string;
  }): Promise<string> {
    if (!this.conn) throw new Error('Salesforce not configured');

    const opportunity = await this.conn.sobject('Opportunity').create({
      Name: opportunityData.name,
      StageName: opportunityData.stage,
      Amount: opportunityData.amount,
      CloseDate: opportunityData.closeDate,
      Lead__c: leadId,
      Community_ID__c: communityId.toString()
    });

    return opportunity.id;
  }
}

export const salesforceCRM = new SalesforceCRMIntegration();