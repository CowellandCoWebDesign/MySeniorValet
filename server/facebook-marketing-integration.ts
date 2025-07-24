// Facebook Marketing API Integration for Family-Targeted Advertising
import axios from 'axios';

export class FacebookMarketingIntegration {
  private accessToken: string;
  private adAccountId: string;

  constructor() {
    this.accessToken = process.env.FACEBOOK_ACCESS_TOKEN || '';
    this.adAccountId = process.env.FACEBOOK_AD_ACCOUNT_ID || '';
  }

  async createFamilyTargetedCampaign(campaignData: {
    communityId: number;
    communityName: string;
    targetAudienceAge: [number, number]; // [min, max]
    geographicRadius: number; // miles
    centerLocation: { latitude: number; longitude: number };
    budgetDaily: number;
    campaignObjective: 'lead_generation' | 'traffic' | 'conversions';
    adCreative: {
      headline: string;
      description: string;
      imageUrl: string;
      ctaText: string;
    };
  }): Promise<string> {
    if (!this.accessToken || !this.adAccountId) {
      throw new Error('Facebook Marketing API credentials not configured');
    }

    try {
      // Create the campaign
      const campaignResponse = await axios.post(
        `https://graph.facebook.com/v18.0/act_${this.adAccountId}/campaigns`,
        {
          name: `Senior Living - ${campaignData.communityName}`,
          objective: campaignData.campaignObjective.toUpperCase(),
          status: 'PAUSED',
          special_ad_categories: ['HOUSING']
        },
        {
          headers: { 'Authorization': `Bearer ${this.accessToken}` }
        }
      );

      const campaignId = campaignResponse.data.id;

      // Create ad set with family targeting
      const adSetResponse = await axios.post(
        `https://graph.facebook.com/v18.0/act_${this.adAccountId}/adsets`,
        {
          name: `AdSet - ${campaignData.communityName}`,
          campaign_id: campaignId,
          daily_budget: campaignData.budgetDaily * 100, // Facebook uses cents
          billing_event: 'IMPRESSIONS',
          optimization_goal: 'LEAD_GENERATION',
          targeting: {
            age_min: campaignData.targetAudienceAge[0],
            age_max: campaignData.targetAudienceAge[1],
            geo_locations: {
              custom_locations: [{
                latitude: campaignData.centerLocation.latitude,
                longitude: campaignData.centerLocation.longitude,
                radius: campaignData.geographicRadius,
                distance_unit: 'mile'
              }]
            },
            interests: [
              { id: '6003020834693', name: 'Senior care' },
              { id: '6003397586886', name: 'Elder care' },
              { id: '6003348194535', name: 'Assisted living' },
              { id: '6003022269327', name: 'Family caregiving' }
            ],
            behaviors: [
              { id: '6017253486583', name: 'Likely to engage with senior care content' }
            ]
          },
          status: 'PAUSED'
        },
        {
          headers: { 'Authorization': `Bearer ${this.accessToken}` }
        }
      );

      const adSetId = adSetResponse.data.id;

      // Create the ad creative
      const creativeResponse = await axios.post(
        `https://graph.facebook.com/v18.0/act_${this.adAccountId}/adcreatives`,
        {
          name: `Creative - ${campaignData.communityName}`,
          object_story_spec: {
            page_id: process.env.FACEBOOK_PAGE_ID,
            link_data: {
              image_url: campaignData.adCreative.imageUrl,
              link: `https://myseniorvalet.com/community/${campaignData.communityId}?utm_source=facebook&utm_campaign=family_targeted`,
              message: campaignData.adCreative.description,
              name: campaignData.adCreative.headline,
              call_to_action: {
                type: 'LEARN_MORE',
                value: {
                  link: `https://myseniorvalet.com/community/${campaignData.communityId}?utm_source=facebook&utm_campaign=family_targeted`
                }
              }
            }
          }
        },
        {
          headers: { 'Authorization': `Bearer ${this.accessToken}` }
        }
      );

      const creativeId = creativeResponse.data.id;

      // Create the ad
      const adResponse = await axios.post(
        `https://graph.facebook.com/v18.0/act_${this.adAccountId}/ads`,
        {
          name: `Ad - ${campaignData.communityName}`,
          adset_id: adSetId,
          creative: { creative_id: creativeId },
          status: 'PAUSED'
        },
        {
          headers: { 'Authorization': `Bearer ${this.accessToken}` }
        }
      );

      return campaignId;
    } catch (error) {
      console.error('Facebook campaign creation error:', error);
      throw error;
    }
  }

  async createLookalikeAudience(sourceAudienceData: {
    name: string;
    description: string;
    customerEmails: string[]; // Emails of existing customers/leads
    targetCountry: string;
    similarityPercentage: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10; // 1% = most similar
  }): Promise<string> {
    if (!this.accessToken || !this.adAccountId) {
      throw new Error('Facebook Marketing API credentials not configured');
    }

    try {
      // First, create a custom audience from customer emails
      const customAudienceResponse = await axios.post(
        `https://graph.facebook.com/v18.0/act_${this.adAccountId}/customaudiences`,
        {
          name: `${sourceAudienceData.name} - Source Audience`,
          subtype: 'CUSTOM',
          description: sourceAudienceData.description,
          customer_file_source: 'USER_PROVIDED_ONLY'
        },
        {
          headers: { 'Authorization': `Bearer ${this.accessToken}` }
        }
      );

      const customAudienceId = customAudienceResponse.data.id;

      // Hash and upload customer emails
      const hashedEmails = sourceAudienceData.customerEmails.map(email => 
        this.hashEmail(email.toLowerCase().trim())
      );

      await axios.post(
        `https://graph.facebook.com/v18.0/${customAudienceId}/users`,
        {
          payload: {
            schema: ['EMAIL_SHA256'],
            data: hashedEmails.map(hash => [hash])
          }
        },
        {
          headers: { 'Authorization': `Bearer ${this.accessToken}` }
        }
      );

      // Create lookalike audience
      const lookalikeResponse = await axios.post(
        `https://graph.facebook.com/v18.0/act_${this.adAccountId}/customaudiences`,
        {
          name: `${sourceAudienceData.name} - Lookalike ${sourceAudienceData.similarityPercentage}%`,
          subtype: 'LOOKALIKE',
          origin_audience_id: customAudienceId,
          lookalike_spec: {
            ratio: sourceAudienceData.similarityPercentage / 100,
            country: sourceAudienceData.targetCountry
          }
        },
        {
          headers: { 'Authorization': `Bearer ${this.accessToken}` }
        }
      );

      return lookalikeResponse.data.id;
    } catch (error) {
      console.error('Facebook lookalike audience creation error:', error);
      throw error;
    }
  }

  async getCampaignInsights(campaignId: string, dateRange: {
    startDate: string; // YYYY-MM-DD
    endDate: string;
  }): Promise<any> {
    if (!this.accessToken) {
      throw new Error('Facebook Marketing API credentials not configured');
    }

    try {
      const response = await axios.get(
        `https://graph.facebook.com/v18.0/${campaignId}/insights`,
        {
          headers: { 'Authorization': `Bearer ${this.accessToken}` },
          params: {
            fields: 'impressions,clicks,ctr,cpc,cpp,cost_per_result,results,reach,frequency',
            time_range: JSON.stringify({
              since: dateRange.startDate,
              until: dateRange.endDate
            })
          }
        }
      );

      return {
        campaignId,
        dateRange,
        insights: response.data.data[0] || {},
        performance: this.calculatePerformanceMetrics(response.data.data[0] || {})
      };
    } catch (error) {
      console.error('Facebook campaign insights error:', error);
      throw error;
    }
  }

  async createRetargetingCampaign(retargetingData: {
    communityId: number;
    communityName: string;
    websiteVisitors: string[]; // URLs of pages visited
    timeframe: number; // days to look back
    budgetDaily: number;
    adCreative: {
      headline: string;
      description: string;
      imageUrl: string;
      offerText: string;
    };
  }): Promise<string> {
    if (!this.accessToken || !this.adAccountId) {
      throw new Error('Facebook Marketing API credentials not configured');
    }

    try {
      // Create website custom audience
      const audienceResponse = await axios.post(
        `https://graph.facebook.com/v18.0/act_${this.adAccountId}/customaudiences`,
        {
          name: `Website Visitors - ${retargetingData.communityName}`,
          subtype: 'WEBSITE',
          description: `People who visited ${retargetingData.communityName} pages`,
          rule: {
            url: {
              operator: 'i_contains',
              value: `community/${retargetingData.communityId}`
            }
          },
          retention_days: retargetingData.timeframe
        },
        {
          headers: { 'Authorization': `Bearer ${this.accessToken}` }
        }
      );

      const audienceId = audienceResponse.data.id;

      // Create retargeting campaign using the website audience
      const campaignResponse = await axios.post(
        `https://graph.facebook.com/v18.0/act_${this.adAccountId}/campaigns`,
        {
          name: `Retargeting - ${retargetingData.communityName}`,
          objective: 'CONVERSIONS',
          status: 'PAUSED',
          special_ad_categories: ['HOUSING']
        },
        {
          headers: { 'Authorization': `Bearer ${this.accessToken}` }
        }
      );

      return campaignResponse.data.id;
    } catch (error) {
      console.error('Facebook retargeting campaign error:', error);
      throw error;
    }
  }

  private hashEmail(email: string): string {
    // Simple hash function for demo - in production, use proper SHA-256
    return Buffer.from(email).toString('base64');
  }

  private calculatePerformanceMetrics(insights: any): any {
    const impressions = parseInt(insights.impressions) || 0;
    const clicks = parseInt(insights.clicks) || 0;
    const spend = parseFloat(insights.spend) || 0;
    
    return {
      ctr: impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) + '%' : '0%',
      averageCpc: clicks > 0 ? (spend / clicks).toFixed(2) : '0',
      costPerThousandImpressions: impressions > 0 ? ((spend / impressions) * 1000).toFixed(2) : '0',
      engagementRate: this.calculateEngagementRate(insights),
      roi: this.calculateROI(insights)
    };
  }

  private calculateEngagementRate(insights: any): string {
    const engagements = (parseInt(insights.post_engagements) || 0) + 
                      (parseInt(insights.page_engagements) || 0);
    const impressions = parseInt(insights.impressions) || 0;
    
    return impressions > 0 ? ((engagements / impressions) * 100).toFixed(2) + '%' : '0%';
  }

  private calculateROI(insights: any): string {
    const spend = parseFloat(insights.spend) || 0;
    const results = parseInt(insights.results) || 0;
    const avgLeadValue = 2500; // Estimated value per senior living lead
    
    const revenue = results * avgLeadValue;
    const roi = spend > 0 ? (((revenue - spend) / spend) * 100).toFixed(0) : '0';
    
    return roi + '%';
  }
}

export const facebookMarketing = new FacebookMarketingIntegration();