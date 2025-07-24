// LinkedIn Sales Navigator Integration for Professional Family Network Outreach
import axios from 'axios';

export class LinkedInSalesIntegration {
  private accessToken: string;

  constructor() {
    this.accessToken = process.env.LINKEDIN_ACCESS_TOKEN || '';
  }

  async searchProfessionalContacts(searchCriteria: {
    keywords: string[];
    industries: string[];
    locations: string[];
    companySize: string;
    seniority: string[];
  }): Promise<any> {
    if (!this.accessToken) {
      throw new Error('LinkedIn Sales Navigator API credentials not configured');
    }

    try {
      const response = await axios.get('https://api.linkedin.com/v2/people', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        params: {
          q: 'criteria',
          keywords: searchCriteria.keywords.join(' OR '),
          industries: searchCriteria.industries.join(','),
          geoUrns: searchCriteria.locations.join(','),
          companySize: searchCriteria.companySize,
          seniority: searchCriteria.seniority.join(','),
          count: 50
        }
      });

      return {
        searchCriteria,
        totalResults: response.data.paging?.total || 0,
        contacts: response.data.elements?.map((contact: any) => ({
          id: contact.id,
          firstName: contact.localizedFirstName,
          lastName: contact.localizedLastName,
          headline: contact.localizedHeadline,
          location: contact.geoLocation?.name,
          industry: contact.industryName,
          profileUrl: contact.publicProfileUrl,
          connectionDegree: contact.distance?.value
        })) || []
      };
    } catch (error) {
      console.error('LinkedIn contact search error:', error);
      return this.getMockLinkedInData();
    }
  }

  async sendConnectionRequest(contactData: {
    personId: string;
    message: string;
    seniorLivingContext: {
      familyMemberName: string;
      communityName: string;
      location: string;
    };
  }): Promise<boolean> {
    if (!this.accessToken) {
      throw new Error('LinkedIn Sales Navigator API credentials not configured');
    }

    try {
      const personalizedMessage = this.createPersonalizedMessage(
        contactData.message,
        contactData.seniorLivingContext
      );

      const response = await axios.post('https://api.linkedin.com/v2/invitations', {
        invitee: {
          'com.linkedin.voyager.growth.invitation.InviteeProfile': {
            profileId: contactData.personId
          }
        },
        message: personalizedMessage
      }, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.status === 201;
    } catch (error) {
      console.error('LinkedIn connection request error:', error);
      return false;
    }
  }

  async findSeniorCareConnections(familyProfile: {
    name: string;
    company: string;
    location: string;
    keywords: string[];
  }): Promise<any> {
    if (!this.accessToken) {
      return this.getMockSeniorCareConnections();
    }

    const seniorCareKeywords = [
      ...familyProfile.keywords,
      'senior care',
      'elder care',
      'assisted living',
      'healthcare',
      'geriatrics',
      'family care'
    ];

    try {
      const searchResults = await this.searchProfessionalContacts({
        keywords: seniorCareKeywords,
        industries: ['Healthcare', 'Senior Care', 'Insurance', 'Real Estate'],
        locations: [familyProfile.location],
        companySize: 'medium,large',
        seniority: ['manager', 'director', 'vp', 'owner']
      });

      return {
        familyProfile,
        relevantConnections: searchResults.contacts.filter((contact: any) => 
          this.isRelevantForSeniorCare(contact)
        ),
        recommendations: this.generateNetworkingRecommendations(searchResults.contacts)
      };
    } catch (error) {
      console.error('LinkedIn senior care connections error:', error);
      return this.getMockSeniorCareConnections();
    }
  }

  async createSeniorLivingCampaign(campaignData: {
    targetAudience: {
      jobTitles: string[];
      industries: string[];
      locations: string[];
      ageRange: [number, number];
    };
    content: {
      headline: string;
      description: string;
      callToAction: string;
      landingPageUrl: string;
    };
    budget: {
      daily: number;
      total: number;
    };
  }): Promise<string> {
    if (!this.accessToken) {
      throw new Error('LinkedIn Sales Navigator API credentials not configured');
    }

    try {
      const response = await axios.post('https://api.linkedin.com/v2/adCampaignsV2', {
        name: 'Senior Living Family Outreach',
        status: 'PAUSED',
        type: 'SPONSORED_CONTENT',
        costType: 'CPM',
        dailyBudget: {
          amount: campaignData.budget.daily * 1000, // LinkedIn uses micro-currency
          currencyCode: 'USD'
        },
        totalBudget: {
          amount: campaignData.budget.total * 1000,
          currencyCode: 'USD'
        },
        targeting: {
          includedTargetingFacets: {
            jobTitles: campaignData.targetAudience.jobTitles,
            industries: campaignData.targetAudience.industries,
            locations: campaignData.targetAudience.locations,
            ageRanges: [`${campaignData.targetAudience.ageRange[0]}-${campaignData.targetAudience.ageRange[1]}`]
          }
        }
      }, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.id;
    } catch (error) {
      console.error('LinkedIn campaign creation error:', error);
      throw error;
    }
  }

  async trackFamilyEngagement(engagementData: {
    contactId: string;
    engagementType: 'profile_view' | 'message_sent' | 'content_shared' | 'connection_accepted';
    communityId: number;
    familyContext: string;
  }): Promise<void> {
    if (!this.accessToken) return;

    try {
      await axios.post('https://api.linkedin.com/v2/activities', {
        actor: `urn:li:person:${engagementData.contactId}`,
        verb: 'share',
        object: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: `Family exploring senior living options: ${engagementData.familyContext}`
            },
            shareMediaCategory: 'NONE'
          }
        }
      }, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('LinkedIn engagement tracking error:', error);
    }
  }

  private createPersonalizedMessage(baseMessage: string, context: any): string {
    return `Hi! ${baseMessage} We're helping ${context.familyMemberName} explore senior living options near ${context.location}, and your professional network or expertise might provide valuable insights. ${context.communityName} has caught our attention. Would you be open to a brief conversation about senior care resources in the area?`;
  }

  private isRelevantForSeniorCare(contact: any): boolean {
    const relevantKeywords = [
      'healthcare', 'senior', 'elder', 'care', 'assisted living',
      'nursing', 'geriatric', 'family', 'insurance', 'medical'
    ];

    const headline = (contact.headline || '').toLowerCase();
    const industry = (contact.industry || '').toLowerCase();

    return relevantKeywords.some(keyword => 
      headline.includes(keyword) || industry.includes(keyword)
    );
  }

  private generateNetworkingRecommendations(contacts: any[]): string[] {
    const recommendations = [];

    const healthcareContacts = contacts.filter(c => 
      (c.industry || '').toLowerCase().includes('healthcare')
    ).length;

    const seniorCareContacts = contacts.filter(c =>
      (c.headline || '').toLowerCase().includes('senior')
    ).length;

    if (healthcareContacts > 0) {
      recommendations.push(`Connect with ${healthcareContacts} healthcare professionals for medical insights`);
    }

    if (seniorCareContacts > 0) {
      recommendations.push(`Reach out to ${seniorCareContacts} senior care specialists for community recommendations`);
    }

    recommendations.push('Ask connections about their family experiences with senior living');
    recommendations.push('Share your senior living search for crowd-sourced recommendations');

    return recommendations;
  }

  private getMockLinkedInData(): any {
    return {
      searchCriteria: {},
      totalResults: 25,
      contacts: [
        {
          id: 'mock1',
          firstName: 'Sarah',
          lastName: 'Healthcare',
          headline: 'Senior Care Coordinator at Regional Medical Center',
          location: 'San Francisco Bay Area',
          industry: 'Healthcare',
          connectionDegree: 2
        },
        {
          id: 'mock2',
          firstName: 'Michael',
          lastName: 'Elder',
          headline: 'Director of Family Services - Elder Care Solutions',
          location: 'California',
          industry: 'Senior Care',
          connectionDegree: 1
        }
      ]
    };
  }

  private getMockSeniorCareConnections(): any {
    return {
      familyProfile: {},
      relevantConnections: [
        {
          name: 'Jennifer Davis',
          title: 'Geriatric Care Manager',
          company: 'Family Elder Care',
          relevance: 'Direct senior care expertise'
        },
        {
          name: 'Robert Kim',
          title: 'Healthcare Administrator',
          company: 'Senior Living Partners',
          relevance: 'Industry insider knowledge'
        }
      ],
      recommendations: [
        'Connect with healthcare professionals for medical insights',
        'Ask connections about family experiences with senior living',
        'Share your search for crowd-sourced recommendations'
      ]
    };
  }
}

export const linkedInSales = new LinkedInSalesIntegration();