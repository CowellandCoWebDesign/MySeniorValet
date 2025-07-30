import { type Express } from "express";
import { db } from "../db";
import { communities, users, communitySubscriptions, paymentTransactions, services, stripeProducts } from "@shared/schema";
import { sql, desc, count, eq } from "drizzle-orm";

export function registerDeveloperRoutes(app: Express) {
  // Get system health status
  app.get('/api/dev/system-health', async (req, res) => {
    try {
      const health = {
        database: 'operational',
        authentication: 'operational',
        payments: 'operational',
        email: 'operational',
        ai: {
          claude: 'operational',
          perplexity: 'operational',
          openai: 'degraded'
        },
        mapping: 'operational',
        timestamp: new Date().toISOString()
      };

      // Test database connection
      try {
        await db.select({ count: count() }).from(communities);
      } catch (error) {
        health.database = 'down';
      }

      res.json(health);
    } catch (error) {
      console.error('System health check error:', error);
      res.status(500).json({ error: 'Health check failed' });
    }
  });

  // Get feature availability status
  app.get('/api/dev/feature-status', async (req, res) => {
    try {
      const features = [
        // Free Tier
        { name: "Basic Listings", tier: "Free", status: "working", completionRate: 100 },
        { name: "Search & Discovery", tier: "Free", status: "working", completionRate: 100 },
        { name: "Contact Display", tier: "Free", status: "working", completionRate: 100 },
        { name: "Photo Upload (5)", tier: "Free", status: "working", completionRate: 100 },
        
        // Featured Tier
        { name: "Featured Badge", tier: "Featured", status: "working", completionRate: 100 },
        { name: "Priority Placement", tier: "Featured", status: "working", completionRate: 100 },
        { name: "Unlimited Photos", tier: "Featured", status: "working", completionRate: 100 },
        { name: "Basic Analytics", tier: "Featured", status: "working", completionRate: 100 },
        
        // Premium Tier - BROKEN
        { name: "Tour Scheduler", tier: "Premium", status: "broken", completionRate: 0, targetDate: "Q1 2025" },
        { name: "Availability Mgmt", tier: "Premium", status: "broken", completionRate: 0, targetDate: "Q1 2025" },
        { name: "Family Messaging", tier: "Premium", status: "broken", completionRate: 0, targetDate: "Q2 2025" },
        { name: "Advanced Analytics", tier: "Premium", status: "partial", completionRate: 30, targetDate: "Q2 2025" },
        
        // Enterprise Tier - NOT BUILT
        { name: "API Integration", tier: "Enterprise", status: "planned", completionRate: 0, targetDate: "Q3 2025" },
        { name: "White Labeling", tier: "Enterprise", status: "planned", completionRate: 0, targetDate: "Q4 2025" },
        { name: "HIPAA Forms", tier: "Enterprise", status: "planned", completionRate: 0, targetDate: "2026" },
        { name: "Dedicated Manager", tier: "Enterprise", status: "planned", completionRate: 0, targetDate: "2026" }
      ];

      res.json(features);
    } catch (error) {
      console.error('Feature status error:', error);
      res.status(500).json({ error: 'Failed to get feature status' });
    }
  });

  // Get database statistics
  app.get('/api/dev/database-stats', async (req, res) => {
    try {
      const [communityCount] = await db
        .select({ count: count() })
        .from(communities);

      const [userCount] = await db
        .select({ count: count() })
        .from(users);

      const [careServiceCount] = await db
        .select({ count: count() })
        .from(services);

      const [subscriptionCount] = await db
        .select({ count: count() })
        .from(communitySubscriptions)
        .where(eq(communitySubscriptions.status, 'active'));

      const [transactionCount] = await db
        .select({ count: count() })
        .from(paymentTransactions);

      res.json({
        communities: communityCount.count,
        users: userCount.count,
        careServices: careServiceCount.count,
        activeSubscriptions: subscriptionCount.count,
        transactions: transactionCount.count,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Database stats error:', error);
      res.status(500).json({ error: 'Failed to get database stats' });
    }
  });

  // Get recent errors/issues
  app.get('/api/dev/recent-issues', async (req, res) => {
    try {
      // This would normally fetch from an error logging table
      const issues = [
        {
          type: 'pricing',
          severity: 'critical',
          message: 'Multiple conflicting pricing structures found in codebase',
          details: 'Free, Standard ($79), Featured ($149), Platinum ($249) vs Free, Enhanced ($299), Premium ($599), Enterprise ($1299)',
          timestamp: new Date().toISOString()
        },
        {
          type: 'feature',
          severity: 'high',
          message: 'Non-functional features advertised as available',
          details: 'Tour Scheduler, API Integration, White Labeling, HIPAA Forms do not exist',
          timestamp: new Date().toISOString()
        },
        {
          type: 'ai',
          severity: 'medium',
          message: 'OpenAI quota exceeded',
          details: 'OpenAI service returning quota errors, only 2/3 AI providers operational',
          timestamp: new Date().toISOString()
        },
        {
          type: 'legal',
          severity: 'high',
          message: 'HIPAA compliance advertised but not implemented',
          details: 'Platform advertises HIPAA compliance features that do not exist',
          timestamp: new Date().toISOString()
        }
      ];

      res.json(issues);
    } catch (error) {
      console.error('Recent issues error:', error);
      res.status(500).json({ error: 'Failed to get recent issues' });
    }
  });

  // Get launch readiness score
  app.get('/api/dev/launch-readiness', async (req, res) => {
    try {
      const readiness = {
        coreFeatures: {
          total: 4,
          working: 4,
          percentage: 100
        },
        premiumFeatures: {
          total: 12,
          working: 4,
          percentage: 33
        },
        criticalIssues: 4,
        overallScore: 50,
        recommendation: 'Launch as FREE platform with optional $149 Featured tier',
        blockers: [
          'Fix pricing structure conflicts',
          'Remove non-existent feature advertising',
          'Resolve OpenAI quota issues',
          'Remove HIPAA compliance claims'
        ]
      };

      res.json(readiness);
    } catch (error) {
      console.error('Launch readiness error:', error);
      res.status(500).json({ error: 'Failed to calculate launch readiness' });
    }
  });
}