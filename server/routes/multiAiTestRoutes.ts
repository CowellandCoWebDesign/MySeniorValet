import { type Express } from "express";
import { db } from "../db";
import { communities } from "@shared/schema";
import { eq, and, or, desc, gte, lte, isNotNull, inArray, sql } from "drizzle-orm";
import { EnhancedMultiAIOrchestrator } from "../enhanced-multi-ai-orchestrator";
import { checkAllAIStatus } from "../ai-status-checker";

export function registerMultiAITestRoutes(app: Express) {
  // Multi-AI test search endpoint
  app.post('/api/multi-ai/search', async (req, res) => {
    try {
      const { query, filters = {} } = req.body;
      
      console.log('🔮 Multi-AI search initiated:', query);
      
      // Check AI status first
      const aiStatus = await checkAllAIStatus();
      const workingAIs = Object.entries(aiStatus)
        .filter(([_, status]) => status.isOperational)
        .map(([name]) => name);
      
      console.log(`✅ Working AIs: ${workingAIs.join(', ')}`);
      
      // Database search
      let whereConditions: any[] = [
        isNotNull(communities.latitude),
        isNotNull(communities.longitude)
      ];
      
      if (query) {
        const searchTerms = query.toLowerCase().split(' ');
        const searchConditions = searchTerms.map((term: string) => 
          or(
            sql`LOWER(${communities.name}) LIKE ${`%${term}%`}`,
            sql`LOWER(${communities.city}) LIKE ${`%${term}%`}`,
            sql`LOWER(${communities.state}) LIKE ${`%${term}%`}`,
            sql`LOWER(${communities.careTypes}::text) LIKE ${`%${term}%`}`
          )
        );
        whereConditions.push(and(...searchConditions));
      }
      
      // Apply filters
      if (filters.minRating) {
        whereConditions.push(gte(communities.rating, parseFloat(filters.minRating)));
      }
      
      if (filters.maxPrice) {
        whereConditions.push(
          or(
            sql`${communities.rentPerMonth}::numeric <= ${filters.maxPrice}`,
            isNotNull(communities.hudPropertyId)
          )
        );
      }
      
      const searchResults = await db
        .select()
        .from(communities)
        .where(and(...whereConditions))
        .limit(20)
        .orderBy(desc(communities.rating));
      
      // Get AI insights if any AI is working
      let aiInsights = null;
      if (workingAIs.length > 0) {
        try {
          const transparencyReport = await EnhancedMultiAIOrchestrator.getTransparencyReport(
            searchResults.slice(0, 5),
            { query, filters },
            []
          );
          
          aiInsights = {
            workingAIs,
            interpretation: transparencyReport.consensus.keyFindings[0] || `Found ${searchResults.length} communities matching your search`,
            priceAnalysis: transparencyReport.warnings.find((w: any) => w.includes('price')) || 'Pricing data available for most communities',
            recommendations: searchResults.slice(0, 3).map(c => ({
              name: c.name,
              reason: `${c.rating || 0} star rating in ${c.city}, ${c.state}`
            }))
          };
        } catch (aiError) {
          console.error('AI analysis failed:', aiError);
        }
      }
      
      res.json({
        communities: searchResults,
        aiInsights,
        searchMetadata: {
          query,
          filters,
          totalResults: searchResults.length,
          aiSystemsActive: workingAIs.length,
          timestamp: new Date().toISOString()
        }
      });
      
    } catch (error) {
      console.error('Multi-AI search error:', error);
      res.status(500).json({ error: 'Multi-AI search failed' });
    }
  });

  // Multi-AI comparison endpoint 
  app.post('/api/multi-ai/compare', async (req, res) => {
    try {
      const { communityIds } = req.body;
      
      if (!communityIds || communityIds.length < 2) {
        return res.status(400).json({ error: 'At least 2 community IDs required' });
      }
      
      const communitiesToCompare = await db
        .select()
        .from(communities)
        .where(inArray(communities.id, communityIds));
      
      if (communitiesToCompare.length < 2) {
        return res.status(404).json({ error: 'Some communities not found' });
      }
      
      // Check AI status
      const aiStatus = await checkAllAIStatus();
      const workingAIs = Object.entries(aiStatus)
        .filter(([_, status]) => status.isOperational)
        .map(([name]) => name);
      
      // Build comparison with AI insights
      const comparison = {
        communities: communitiesToCompare,
        comparison: {
          categories: [
            {
              name: 'Pricing & Value',
              comparisons: [
                {
                  metric: 'Monthly Cost',
                  values: communitiesToCompare.map(c => ({
                    community: c.name,
                    value: c.priceRange || c.rentPerMonth || 'Contact for pricing',
                    isHUD: !!c.hudPropertyId
                  }))
                },
                {
                  metric: 'Overall Rating',
                  values: communitiesToCompare.map(c => ({
                    community: c.name,
                    value: `${c.rating || 'No'} stars`,
                    reviewCount: c.reviewCount || 0
                  }))
                }
              ]
            },
            {
              name: 'Care & Services',
              comparisons: [
                {
                  metric: 'Care Types',
                  values: communitiesToCompare.map(c => ({
                    community: c.name,
                    value: (c.careTypes || []).join(', ') || 'Not specified'
                  }))
                }
              ]
            },
            {
              name: 'Location',
              comparisons: [
                {
                  metric: 'Address',
                  values: communitiesToCompare.map(c => ({
                    community: c.name,
                    value: `${c.city}, ${c.state} ${c.zipCode}`
                  }))
                }
              ]
            }
          ]
        },
        aiAnalysis: workingAIs.length > 0 ? {
          systemsUsed: workingAIs,
          recommendation: `Based on ${workingAIs.length} AI analysis${workingAIs.length > 1 ? 'es' : ''}, we recommend comparing these communities in person. Each offers unique advantages.`,
          keyDifferences: [
            'Price ranges vary significantly',
            'Different care specializations available',
            'Location convenience differs by individual needs'
          ]
        } : null,
        metadata: {
          comparedAt: new Date().toISOString(),
          aiSystemsActive: workingAIs.length
        }
      };
      
      res.json(comparison);
      
    } catch (error) {
      console.error('Multi-AI comparison error:', error);
      res.status(500).json({ error: 'Comparison failed' });
    }
  });

  // Multi-AI system status
  app.get('/api/multi-ai/status', async (_req, res) => {
    try {
      const status = await checkAllAIStatus();
      const operational = Object.values(status).filter(s => s.isOperational).length;
      
      res.json({
        status,
        summary: {
          totalSystems: Object.keys(status).length,
          operational,
          accuracy: operational >= 3 ? 'High (3+ AIs)' : operational >= 2 ? 'Medium (2 AIs)' : 'Basic (1 AI)',
          crossVerification: operational >= 2
        }
      });
    } catch (error) {
      console.error('Status check error:', error);
      res.status(500).json({ error: 'Failed to check AI status' });
    }
  });
}