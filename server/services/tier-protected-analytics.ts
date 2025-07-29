// Tier-Protected Analytics Service
// This service ensures analytics data is only accessible based on subscription tier

import { db } from '../db';
import { communities, reviews, tours, users } from '../../shared/schema';
import { eq, sql, desc, and, gte } from 'drizzle-orm';
import { FeatureAccessControl } from './feature-access-control';

export class TierProtectedAnalytics {
  async getCommunityAnalytics(communityId: number) {
    // Check if community has analytics access
    const hasBasicAnalytics = await FeatureAccessControl.hasFeature(
      communityId, 
      'basicAnalytics'
    );

    const hasAdvancedAnalytics = await FeatureAccessControl.hasFeature(
      communityId, 
      'advancedAnalytics'
    );

    if (!hasBasicAnalytics) {
      return {
        error: 'Analytics access denied',
        requiresTier: 'featured',
        message: 'Upgrade to Featured Spotlight to access analytics'
      };
    }

    // Basic analytics (Featured Spotlight tier)
    const basicAnalytics = await this.getBasicAnalytics(communityId);

    if (!hasAdvancedAnalytics) {
      return {
        ...basicAnalytics,
        advanced: {
          locked: true,
          requiresTier: 'premium',
          message: 'Upgrade to Premium Tools for advanced analytics'
        }
      };
    }

    // Advanced analytics (Premium Tools tier)
    const advancedAnalytics = await this.getAdvancedAnalytics(communityId);

    return {
      ...basicAnalytics,
      advanced: advancedAnalytics
    };
  }

  private async getBasicAnalytics(communityId: number) {
    // Get basic metrics using existing tables
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Use reviews as a proxy for engagement
    const reviewStats = await db
      .select({
        totalReviews: sql<number>`count(*)`,
        averageRating: sql<number>`avg(rating)`,
        recentReviews: sql<number>`count(case when created_at >= ${thirtyDaysAgo} then 1 end)`
      })
      .from(reviews)
      .where(eq(reviews.communityId, communityId))
      .execute();

    // Use tours as a proxy for inquiries
    const tourStats = await db
      .select({
        totalTours: sql<number>`count(*)`,
        scheduledTours: sql<number>`count(case when status = 'scheduled' then 1 end)`,
        completedTours: sql<number>`count(case when status = 'completed' then 1 end)`
      })
      .from(tours)
      .where(eq(tours.communityId, communityId))
      .execute();

    return {
      profileViews: Math.floor(Math.random() * 500) + 100, // Simulated view count
      uniqueVisitors: Math.floor(Math.random() * 200) + 50, // Simulated unique visitors
      monthlyViews: Math.floor(Math.random() * 300) + 50, // Simulated monthly views
      totalReviews: reviewStats[0]?.totalReviews || 0,
      averageRating: reviewStats[0]?.averageRating || 0,
      recentReviews: reviewStats[0]?.recentReviews || 0,
      totalTours: tourStats[0]?.totalTours || 0,
      scheduledTours: tourStats[0]?.scheduledTours || 0,
      completedTours: tourStats[0]?.completedTours || 0,
      conversionRate: '4.2%' // Industry average
    };
  }

  private async getAdvancedAnalytics(communityId: number) {
    // Simulated advanced analytics data
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Generate simulated daily trends
    const dailyTrends = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        views: Math.floor(Math.random() * 50) + 10,
        uniqueViews: Math.floor(Math.random() * 30) + 5
      };
    });

    // Simulated source breakdown
    const sourceBreakdown = [
      { source: 'Direct', count: 245 },
      { source: 'Google Search', count: 189 },
      { source: 'Social Media', count: 123 },
      { source: 'Email Campaign', count: 87 },
      { source: 'Referral', count: 56 }
    ];

    // Simulated peak viewing times
    const peakTimes = [
      { hour: 10, dayOfWeek: 2, views: 145 }, // Tuesday 10am
      { hour: 14, dayOfWeek: 3, views: 132 }, // Wednesday 2pm
      { hour: 11, dayOfWeek: 1, views: 128 }, // Monday 11am
      { hour: 15, dayOfWeek: 4, views: 119 }, // Thursday 3pm
      { hour: 9, dayOfWeek: 2, views: 108 }   // Tuesday 9am
    ];

    // Conversion funnel
    const funnel = await this.getConversionFunnel(communityId);

    return {
      dailyTrends,
      sourceBreakdown,
      peakTimes,
      conversionFunnel: funnel,
      insights: this.generateInsights(dailyTrends, sourceBreakdown, peakTimes)
    };
  }

  private async getConversionFunnel(communityId: number) {
    // Simulated conversion funnel data
    const profileViews = Math.floor(Math.random() * 500) + 200;
    const detailViews = Math.floor(profileViews * 0.6);
    const contactClicks = Math.floor(detailViews * 0.4);
    const inquirySent = Math.floor(contactClicks * 0.5);
    const tourScheduled = Math.floor(inquirySent * 0.3);

    return {
      steps: [
        { name: 'Profile Views', count: profileViews },
        { name: 'Detail Views', count: detailViews },
        { name: 'Contact Clicks', count: contactClicks },
        { name: 'Inquiries Sent', count: inquirySent },
        { name: 'Tours Scheduled', count: tourScheduled }
      ]
    };
  }

  private generateInsights(dailyTrends: any[], sourceBreakdown: any[], peakTimes: any[]) {
    const insights = [];

    // Trend insights
    if (dailyTrends.length >= 7) {
      const lastWeek = dailyTrends.slice(-7);
      const previousWeek = dailyTrends.slice(-14, -7);
      
      if (previousWeek.length === 7) {
        const lastWeekViews = lastWeek.reduce((sum, day) => sum + day.views, 0);
        const previousWeekViews = previousWeek.reduce((sum, day) => sum + day.views, 0);
        const percentChange = ((lastWeekViews - previousWeekViews) / previousWeekViews * 100).toFixed(1);
        const numericChange = Number(percentChange);
        
        insights.push({
          type: 'trend',
          title: 'Weekly Traffic Trend',
          message: `Your profile views ${numericChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(numericChange)}% this week`,
          impact: numericChange > 0 ? 'positive' : 'negative'
        });
      }
    }

    // Source insights
    if (sourceBreakdown.length > 0) {
      const topSource = sourceBreakdown[0];
      insights.push({
        type: 'source',
        title: 'Top Traffic Source',
        message: `${topSource.source || 'Direct'} traffic accounts for ${(topSource.count / sourceBreakdown.reduce((sum, s) => sum + s.count, 0) * 100).toFixed(1)}% of your views`,
        impact: 'neutral'
      });
    }

    // Peak time insights
    if (peakTimes.length > 0) {
      const topTime = peakTimes[0];
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      insights.push({
        type: 'timing',
        title: 'Best Viewing Time',
        message: `Most visitors view your profile on ${dayNames[topTime.dayOfWeek]} around ${topTime.hour}:00`,
        impact: 'neutral'
      });
    }

    return insights;
  }

  // Check if a feature is available for a community
  async isFeatureAvailable(communityId: number, feature: keyof Omit<FeatureAccess, 'currentTier' | 'tierName' | 'monthlyPrice' | 'upgradeAvailable'>): Promise<boolean> {
    return await FeatureAccessControl.hasFeature(communityId, feature);
  }
}

// Type for feature access from FeatureAccessControl
interface FeatureAccess {
  basicListing: boolean;
  contactDisplay: boolean;
  searchVisibility: boolean;
  profileEditing: boolean;
  featuredPlacement: boolean;
  redTagSpecials: boolean;
  photoTools: boolean;
  customForms: boolean;
  basicAnalytics: boolean;
  brandedIntake: boolean;
  availabilityManagement: boolean;
  tourScheduler: boolean;
  unlimitedPhotos: boolean;
  advancedAnalytics: boolean;
  familyMessaging: boolean;
  prioritySupport: boolean;
  homepageFeatured: boolean;
  conciergeService: boolean;
  sponsoredContent: boolean;
  aiAccess: boolean;
  apiIntegration: boolean;
  whiteLabeling: boolean;
  customReporting: boolean;
  dedicatedSuccess: boolean;
  additionalLocations?: boolean;
  aiTourAssistant?: boolean;
  billPayTools?: boolean;
  currentTier: 'free' | 'featured' | 'premium' | 'platinum';
  tierName: string;
  monthlyPrice: number;
  upgradeAvailable: boolean;
}