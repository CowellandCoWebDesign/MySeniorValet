import { type Express } from "express";
import { isAuthenticated, isAdmin } from "../auth-middleware";
import { 
  FAMILY_TIER,
  PROFESSIONAL_TIERS,
  COMMUNITY_TIERS,
  ENTERPRISE_TIERS,
  VENDOR_TIERS,
  API_TIERS,
  type KrakenTier 
} from "../services/kraken-tier-system";
import { db } from "../db";
import { users, communities, vendors } from "@shared/schema";
import { eq } from "drizzle-orm";

export function registerKrakenTierRoutes(app: Express) {
  
  // Get all tiers for public display
  app.get("/api/kraken/tiers", async (req, res) => {
    try {
      const allTiers = {
        family: FAMILY_TIER,
        professional: PROFESSIONAL_TIERS,
        community: COMMUNITY_TIERS,
        enterprise: ENTERPRISE_TIERS,
        vendor: VENDOR_TIERS,
        api: API_TIERS
      };
      
      res.json(allTiers);
    } catch (error) {
      console.error("Error fetching Kraken tiers:", error);
      res.status(500).json({ error: "Failed to fetch pricing tiers" });
    }
  });
  
  // Get tier details by ID
  app.get("/api/kraken/tiers/:tierId", async (req, res) => {
    try {
      const tierId = req.params.tierId;
      
      // Search through all tier arrays
      const allTiers = [
        FAMILY_TIER,
        ...PROFESSIONAL_TIERS,
        ...COMMUNITY_TIERS,
        ...ENTERPRISE_TIERS,
        ...VENDOR_TIERS,
        ...API_TIERS
      ];
      
      const tier = allTiers.find(t => t.id === tierId);
      
      if (!tier) {
        return res.status(404).json({ error: "Tier not found" });
      }
      
      res.json(tier);
    } catch (error) {
      console.error("Error fetching tier details:", error);
      res.status(500).json({ error: "Failed to fetch tier details" });
    }
  });
  
  // Calculate revenue projection
  app.get("/api/kraken/revenue/projection", isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Get counts from database
      const communityCount = await db.select().from(communities);
      const vendorCount = await db.select().from(vendors);
      
      // Calculate revenue projections
      const projections = {
        monthly: {
          communities: {
            essential: 100 * 99, // 100 communities at $99
            premium: 500 * 299, // 500 communities at $299
            enterprise: 50 * 599 // 50 communities at $599
          },
          professionals: {
            essential: 200 * 79, // 200 professionals at $79
            premium: 300 * 149, // 300 professionals at $149
            enterprise: 100 * 249 // 100 professionals at $249
          },
          healthcare: {
            systems: 50 * 2499, // 50 healthcare systems at $2,499
            insurance: 20 * 4999 // 20 insurance companies at $4,999
          },
          vendors: {
            basic: 100 * 199, // 100 vendors at $199
            professional: 50 * 499, // 50 vendors at $499
            enterprise: 20 * 999 // 20 vendors at $999
          },
          api: {
            starter: 50 * 299, // 50 API users at $299
            professional: 20 * 999, // 20 API users at $999
            enterprise: 10 * 2999 // 10 API users at $2,999
          }
        },
        annual: {
          totalMRR: 0,
          totalARR: 0,
          growthRate: 0.15 // 15% monthly growth projected
        }
      };
      
      // Calculate totals
      const monthlyTotal = Object.values(projections.monthly).reduce((total, category) => {
        return total + Object.values(category as any).reduce((sum: number, val: any) => sum + val, 0);
      }, 0);
      
      projections.annual.totalMRR = monthlyTotal;
      projections.annual.totalARR = monthlyTotal * 12;
      
      // Add current platform metrics
      const metrics = {
        currentMetrics: {
          totalCommunities: communityCount.length,
          totalVendors: vendorCount.length,
          potentialRevenue: {
            communities: communityCount.length * 299, // Assuming premium tier
            vendors: vendorCount.length * 499 // Assuming professional tier
          }
        },
        projections,
        summary: {
          year1Target: 7500000, // $7.5M ARR
          year2Target: 25000000, // $25M ARR
          year3Target: 50000000 // $50M ARR
        }
      };
      
      res.json(metrics);
    } catch (error) {
      console.error("Error calculating revenue projections:", error);
      res.status(500).json({ error: "Failed to calculate revenue projections" });
    }
  });
  
  // Check tier eligibility for current user
  app.get("/api/kraken/eligibility", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      // Get user data
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Determine eligible tiers based on user type
      const eligibleTiers = [];
      
      // Everyone gets family tier
      eligibleTiers.push(FAMILY_TIER);
      
      // Check if user is a professional
      if (user.userType === 'professional' || user.userType === 'advisor') {
        eligibleTiers.push(...PROFESSIONAL_TIERS);
      }
      
      // Check if user represents a community
      if (user.userType === 'community' || user.userType === 'facility') {
        eligibleTiers.push(...COMMUNITY_TIERS);
      }
      
      // Check if user is enterprise
      if (user.userType === 'enterprise' || user.userType === 'healthcare') {
        eligibleTiers.push(...ENTERPRISE_TIERS);
      }
      
      // Check if user is a vendor
      if (user.userType === 'vendor' || user.userType === 'service_provider') {
        eligibleTiers.push(...VENDOR_TIERS);
      }
      
      // API access for technical users
      if (user.userType === 'developer' || user.userType === 'partner') {
        eligibleTiers.push(...API_TIERS);
      }
      
      res.json({
        currentTier: user.subscriptionTier || 'family_free',
        eligibleTiers,
        recommendations: getRecommendedTier(user)
      });
    } catch (error) {
      console.error("Error checking tier eligibility:", error);
      res.status(500).json({ error: "Failed to check eligibility" });
    }
  });
}

// Helper function to recommend tier based on user profile
function getRecommendedTier(user: any): KrakenTier | null {
  // Logic to recommend best tier based on user's needs
  if (user.userType === 'community') {
    // For communities, recommend based on size
    return COMMUNITY_TIERS[1]; // Premium tier as default recommendation
  }
  
  if (user.userType === 'professional') {
    return PROFESSIONAL_TIERS[1]; // Premium tier for professionals
  }
  
  if (user.userType === 'healthcare' || user.userType === 'enterprise') {
    return ENTERPRISE_TIERS[0]; // Healthcare system tier
  }
  
  if (user.userType === 'vendor') {
    return VENDOR_TIERS[1]; // Professional vendor tier
  }
  
  return null;
}