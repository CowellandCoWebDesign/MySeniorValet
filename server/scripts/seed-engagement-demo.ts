import { db } from "../db";
import { communityEngagementMetrics, scorecardConfigurations, userInteractions } from "../../shared/engagementSchemas";
import { communities } from "../../shared/schema";
import { eq } from "drizzle-orm";

// Demo engagement seeder for testing the scorecard functionality
export async function seedEngagementDemo() {
  console.log("🔥 Seeding demo engagement data...");
  
  try {
    // Seed default scorecard configurations for all tiers
    const configs = [
      {
        subscriptionTier: 'verified',
        scoringWeights: {
          trafficWeight: 0.25,
          interactionWeight: 0.25,
          contentWeight: 0.20,
          leadQualityWeight: 0.20,
          responseWeight: 0.10
        },
        features: {
          detailedMetrics: false,
          historicalTrends: false,
          competitorComparison: false,
          alertsEnabled: false,
          exportReports: false
        },
        customMetrics: []
      },
      {
        subscriptionTier: 'standard',
        scoringWeights: {
          trafficWeight: 0.25,
          interactionWeight: 0.25,
          contentWeight: 0.20,
          leadQualityWeight: 0.20,
          responseWeight: 0.10
        },
        features: {
          detailedMetrics: true,
          historicalTrends: false,
          competitorComparison: false,
          alertsEnabled: true,
          exportReports: false
        },
        customMetrics: []
      },
      {
        subscriptionTier: 'featured',
        scoringWeights: {
          trafficWeight: 0.25,
          interactionWeight: 0.25,
          contentWeight: 0.20,
          leadQualityWeight: 0.20,
          responseWeight: 0.10
        },
        features: {
          detailedMetrics: true,
          historicalTrends: true,
          competitorComparison: true,
          alertsEnabled: true,
          exportReports: true
        },
        customMetrics: []
      },
      {
        subscriptionTier: 'platinum',
        scoringWeights: {
          trafficWeight: 0.25,
          interactionWeight: 0.25,
          contentWeight: 0.20,
          leadQualityWeight: 0.20,
          responseWeight: 0.10
        },
        features: {
          detailedMetrics: true,
          historicalTrends: true,
          competitorComparison: true,
          alertsEnabled: true,
          exportReports: true
        },
        customMetrics: [
          {
            name: "Move-in Conversion Rate",
            description: "Percentage of tours that convert to move-ins",
            formula: "(moveIns / tourRequests) * 100",
            enabled: true
          }
        ]
      }
    ];

    // Insert scorecard configurations using SQL
    const configQueries = [
      `INSERT INTO scorecard_configurations (subscription_tier, scoring_weights, features, custom_metrics) 
       VALUES ('verified', '{"trafficWeight": 0.25, "interactionWeight": 0.25, "contentWeight": 0.20, "leadQualityWeight": 0.20, "responseWeight": 0.10}', 
               '{"detailedMetrics": false, "historicalTrends": false, "competitorComparison": false, "alertsEnabled": false, "exportReports": false}', 
               '[]') ON CONFLICT (subscription_tier) DO NOTHING`,
      `INSERT INTO scorecard_configurations (subscription_tier, scoring_weights, features, custom_metrics) 
       VALUES ('standard', '{"trafficWeight": 0.25, "interactionWeight": 0.25, "contentWeight": 0.20, "leadQualityWeight": 0.20, "responseWeight": 0.10}', 
               '{"detailedMetrics": true, "historicalTrends": false, "competitorComparison": false, "alertsEnabled": true, "exportReports": false}', 
               '[]') ON CONFLICT (subscription_tier) DO NOTHING`,
      `INSERT INTO scorecard_configurations (subscription_tier, scoring_weights, features, custom_metrics) 
       VALUES ('featured', '{"trafficWeight": 0.25, "interactionWeight": 0.25, "contentWeight": 0.20, "leadQualityWeight": 0.20, "responseWeight": 0.10}', 
               '{"detailedMetrics": true, "historicalTrends": true, "competitorComparison": true, "alertsEnabled": true, "exportReports": true}', 
               '[]') ON CONFLICT (subscription_tier) DO NOTHING`,
      `INSERT INTO scorecard_configurations (subscription_tier, scoring_weights, features, custom_metrics) 
       VALUES ('platinum', '{"trafficWeight": 0.25, "interactionWeight": 0.25, "contentWeight": 0.20, "leadQualityWeight": 0.20, "responseWeight": 0.10}', 
               '{"detailedMetrics": true, "historicalTrends": true, "competitorComparison": true, "alertsEnabled": true, "exportReports": true}', 
               '[{"name": "Move-in Conversion Rate", "description": "Percentage of tours that convert to move-ins", "formula": "(moveIns / tourRequests) * 100", "enabled": true}]') ON CONFLICT (subscription_tier) DO NOTHING`
    ];

    for (const query of configQueries) {
      await db.execute({ sql: query });
    }

    // Get a sample community for demo data
    const sampleCommunities = await db.select()
      .from(communities)
      .limit(5);

    if (sampleCommunities.length === 0) {
      console.log("❌ No communities found to seed engagement data");
      return;
    }

    // Create demo engagement metrics for the first community
    const demoCommunity = sampleCommunities[0];
    const currentDate = new Date();
    const lastMonth = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const demoMetrics = {
      communityId: demoCommunity.id,
      reportingPeriod: currentDate,
      periodType: 'monthly' as const,
      
      // Traffic metrics
      profileViews: Math.floor(Math.random() * 500) + 200,
      uniqueVisitors: Math.floor(Math.random() * 300) + 150,
      searchImpressions: Math.floor(Math.random() * 1000) + 500,
      
      // Interaction metrics
      phoneClicks: Math.floor(Math.random() * 50) + 20,
      emailClicks: Math.floor(Math.random() * 30) + 10,
      websiteClicks: Math.floor(Math.random() * 40) + 15,
      directionsClicks: Math.floor(Math.random() * 25) + 10,
      
      // Content metrics
      photoViews: Math.floor(Math.random() * 300) + 100,
      videoViews: Math.floor(Math.random() * 100) + 25,
      brochureDownloads: Math.floor(Math.random() * 20) + 5,
      
      // Lead quality metrics
      tourRequests: Math.floor(Math.random() * 15) + 5,
      contactFormSubmissions: Math.floor(Math.random() * 20) + 8,
      socialMediaEngagement: Math.floor(Math.random() * 50) + 15,
      
      // Response metrics
      averageResponseTime: Math.floor(Math.random() * 120) + 30, // 30-150 minutes
      responseRate: Math.random() * 0.4 + 0.6, // 60-100%
      
      // Quality metrics
      bounceRate: Math.random() * 0.3 + 0.2, // 20-50%
      avgSessionDuration: Math.floor(Math.random() * 300) + 120, // 2-7 minutes
      conversionRate: Math.random() * 0.1 + 0.05, // 5-15%
      
      // Calculated engagement score (will be overridden by service)
      engagementScore: "75", // Will be calculated by service
      trendDirection: 'stable' as const,
      previousPeriodComparison: "0",
      lastCalculated: currentDate,
      dataQuality: 0.85
    };

    await db.insert(communityEngagementMetrics)
      .values(demoMetrics)
      .onConflictDoNothing();

    // Create some user interactions for demo
    const interactionTypes = ['view', 'click', 'contact', 'tour_request', 'phone_call'];
    for (let i = 0; i < 10; i++) {
      await db.insert(userInteractions)
        .values({
          communityId: demoCommunity.id,
          userId: `demo-user-${i}`,
          sessionId: `session-${Math.random().toString(36).substr(2, 9)}`,
          interactionType: interactionTypes[Math.floor(Math.random() * interactionTypes.length)] as any,
          page: '/community/' + demoCommunity.id,
          duration: Math.floor(Math.random() * 300) + 30,
          metadata: {
            source: 'organic_search',
            device: Math.random() > 0.5 ? 'desktop' : 'mobile'
          },
          timestamp: new Date(currentDate.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        })
        .onConflictDoNothing();
    }

    console.log(`✅ Demo engagement data seeded for community: ${demoCommunity.name} (ID: ${demoCommunity.id})`);
    console.log("✅ Scorecard configurations created for all subscription tiers");
    
  } catch (error) {
    console.error("❌ Error seeding engagement demo data:", error);
  }
}

// Run the seeder
seedEngagementDemo().then(() => {
  console.log("Demo seeding complete!");
  process.exit(0);
}).catch(error => {
  console.error("Demo seeding failed:", error);
  process.exit(1);
});