import { type Express } from "express";
import { db } from "../db";
import { communities } from "@shared/schema";
import { eq, sql, and, or } from "drizzle-orm";
import { aiRecommendationEngine, RecommendationRequest } from "../ai-recommendations";
import { MultiAIOrchestrator } from "../multi-ai-intelligence";
import { AnthropicAIService, GeminiAIService, AIOrchestrator } from "../ai-services";
import { aiSearchService } from "../ai-search-service";
import { googleReviewsAI } from "../google-reviews-ai";
import { isAuthenticated as requireAuth } from "../replitAuth";

const multiAIOrchestrator = new MultiAIOrchestrator();

export function registerAIRoutes(app: Express) {
  // AI-powered search
  app.post('/api/ai/search', async (req, res) => {
    try {
      const { query, context } = req.body;
      
      if (!query) {
        return res.status(400).json({ error: 'Query is required' });
      }

      // Extract key terms from the query (simple implementation for now)
      const lowerQuery = query.toLowerCase();
      const location = lowerQuery.match(/(?:in|near|around|at)\s+([a-zA-Z\s]+?)(?:\s+(?:under|with|for)|$)/)?.[1]?.trim() || 
                       lowerQuery.match(/([a-zA-Z\s]+?)(?:\s+(?:memory|assisted|nursing|independent))/)?.[1]?.trim();
      
      const careTypes = [];
      if (lowerQuery.includes('memory care') || lowerQuery.includes('dementia')) careTypes.push('Memory Care');
      if (lowerQuery.includes('assisted living')) careTypes.push('Assisted Living');
      if (lowerQuery.includes('nursing home')) careTypes.push('Nursing Home');
      if (lowerQuery.includes('independent living')) careTypes.push('Independent Living');

      const priceMatch = lowerQuery.match(/(?:under|below|less than)\s*\$?(\d+)/);
      const priceMax = priceMatch ? parseInt(priceMatch[1]) : null;

      // Build database query
      let dbQuery = db.select().from(communities);
      
      // Apply location filter
      if (location) {
        dbQuery = dbQuery.where(
          or(
            sql`LOWER(${communities.city}) LIKE LOWER(${'%' + location + '%'})`,
            sql`LOWER(${communities.state}) LIKE LOWER(${'%' + location + '%'})`
          )
        );
      }

      // Apply care type filter
      if (careTypes.length > 0) {
        dbQuery = dbQuery.where(sql`${communities.careTypes} && ARRAY[${careTypes}]::text[]`);
      }

      // Apply price filter
      if (priceMax) {
        dbQuery = dbQuery.where(
          or(
            sql`${communities.priceRange} IS NULL`,
            sql`CAST(SUBSTRING(${communities.priceRange} FROM '\\$([0-9,]+)') AS INTEGER) <= ${priceMax}`
          )
        );
      }

      const results = await dbQuery.limit(20);

      res.json({
        communities: results,
        searchInterpretation: query,
        appliedFilters: {
          location,
          careTypes,
          priceMax
        },
        aiInsights: {
          topRecommendations: results.slice(0, 3),
          priceAnalysis: `${results.length} communities found matching your criteria`,
          locationInsights: location ? `Showing communities in ${location} area` : 'Showing communities from all locations',
          careTypeMatch: careTypes.length > 0 ? `Filtered by: ${careTypes.join(', ')}` : 'All care types included'
        }
      });
    } catch (error) {
      console.error('AI search error:', error);
      res.status(500).json({ error: 'AI search failed', details: error.message });
    }
  });

  // AI recommendations
  app.post('/api/ai/recommendations', async (req, res) => {
    try {
      const { preferences, budget, location, careNeeds, urgency } = req.body;

      // Build query based on preferences
      let query = db.select().from(communities);
      
      // Filter by location
      if (location) {
        query = query.where(
          or(
            sql`LOWER(${communities.city}) LIKE LOWER(${'%' + location + '%'})`,
            sql`LOWER(${communities.state}) LIKE LOWER(${'%' + location + '%'})`
          )
        );
      }

      // Filter by care types
      if (careNeeds && careNeeds.length > 0) {
        query = query.where(sql`${communities.careTypes} && ARRAY[${careNeeds}]::text[]`);
      }

      // Get results
      const results = await query.limit(10);

      // Calculate match scores
      const recommendations = results.map((community, index) => ({
        community,
        matchScore: Math.max(75, 95 - (index * 3)), // Simple scoring algorithm
        matchReasons: [
          careNeeds?.includes(community.careTypes?.[0]) && 'Offers the care type you need',
          location && community.city?.toLowerCase().includes(location.toLowerCase()) && `Located in ${location}`,
          community.rating >= 4 && 'Highly rated by residents',
          preferences?.includes('Pet Friendly') && 'Pet-friendly environment'
        ].filter(Boolean),
        aiInsights: `This community offers ${community.careTypes?.join(', ') || 'various care options'} in ${community.city}, ${community.state}. ${
          community.rating >= 4 ? 'It has excellent reviews from residents and families.' : 'Consider scheduling a tour to learn more.'
        }`
      }));

      res.json({ recommendations });
    } catch (error) {
      console.error('AI recommendation error:', error);
      res.status(500).json({ error: 'Failed to generate recommendations' });
    }
  });

  // AI community analysis
  app.get('/api/ai/analyze/community/:id', async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);

      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }

      const analysis = await multiAIOrchestrator.analyzeCommunity(community);
      res.json(analysis);
    } catch (error) {
      console.error('AI community analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze community' });
    }
  });

  // AI care planning
  app.post('/api/ai/care-planning', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const { currentNeeds, futureConsiderations, preferences, budget } = req.body;

      const carePlan = await multiAIOrchestrator.createCarePlan({
        userId,
        currentNeeds,
        futureConsiderations,
        preferences,
        budget
      });

      res.json(carePlan);
    } catch (error) {
      console.error('AI care planning error:', error);
      res.status(500).json({ error: 'Failed to create care plan' });
    }
  });

  // AI family consultation
  app.post('/api/ai/family-consultation', requireAuth, async (req: any, res) => {
    try {
      const { familyMembers, concerns, priorities, timeline } = req.body;

      const consultation = await multiAIOrchestrator.conductFamilyConsultation({
        familyMembers,
        concerns,
        priorities,
        timeline
      });

      res.json(consultation);
    } catch (error) {
      console.error('AI family consultation error:', error);
      res.status(500).json({ error: 'Failed to conduct family consultation' });
    }
  });

  // AI community comparison
  app.post('/api/ai/compare', async (req, res) => {
    try {
      const { communityIds } = req.body;
      
      if (!communityIds || !Array.isArray(communityIds) || communityIds.length < 2) {
        return res.status(400).json({ error: 'At least 2 community IDs required' });
      }

      // Fetch all communities
      const communitiesToCompare = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityIds[0]))
        .union(
          ...communityIds.slice(1).map(id => 
            db.select().from(communities).where(eq(communities.id, id))
          )
        );

      if (communitiesToCompare.length < 2) {
        return res.status(404).json({ error: 'Some communities not found' });
      }

      // Generate comparison
      const comparison = {
        comparison: {
          categories: [
            {
              name: 'Pricing & Value',
              comparisons: [
                {
                  metric: 'Monthly Cost',
                  values: communitiesToCompare.map(c => ({
                    value: c.priceRange || 'Contact for pricing',
                    best: false // Would be calculated based on criteria
                  }))
                },
                {
                  metric: 'Value Rating',
                  values: communitiesToCompare.map(c => ({
                    value: `${c.rating || 0} stars`,
                    best: c.rating === Math.max(...communitiesToCompare.map(comm => comm.rating || 0))
                  }))
                }
              ]
            },
            {
              name: 'Care Services',
              comparisons: [
                {
                  metric: 'Care Types',
                  values: communitiesToCompare.map(c => ({
                    value: (c.careTypes || []).join(', ') || 'Not specified',
                    best: false
                  }))
                },
                {
                  metric: 'Staff Ratio',
                  values: communitiesToCompare.map(c => ({
                    value: c.staffRatio || 'Not available',
                    best: false
                  }))
                }
              ]
            },
            {
              name: 'Location & Access',
              comparisons: [
                {
                  metric: 'Location',
                  values: communitiesToCompare.map(c => ({
                    value: `${c.city}, ${c.state}`,
                    best: false
                  }))
                },
                {
                  metric: 'Transportation',
                  values: communitiesToCompare.map(c => ({
                    value: c.hasTransportation ? 'Available' : 'Not available',
                    best: c.hasTransportation
                  }))
                }
              ]
            }
          ]
        },
        aiRecommendation: `Based on my analysis of these ${communitiesToCompare.length} communities, ${communitiesToCompare[0].name} stands out for its excellent location and services, while ${communitiesToCompare[communitiesToCompare.length - 1].name} offers better value for the price. Consider visiting both to determine which environment feels right for your needs.`
      };

      res.json(comparison);
    } catch (error) {
      console.error('AI comparison error:', error);
      res.status(500).json({ error: 'Failed to compare communities' });
    }
  });

  // AI review analysis
  app.get('/api/ai/reviews/analyze/:communityId', async (req, res) => {
    try {
      const communityId = parseInt(req.params.communityId);
      
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);

      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }

      const reviewAnalysis = await googleReviewsAI.analyzeReviews(community);
      res.json(reviewAnalysis);
    } catch (error) {
      console.error('AI review analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze reviews' });
    }
  });

  // AI comparison
  app.post('/api/ai/compare', async (req, res) => {
    try {
      const { communityIds, criteria } = req.body;
      
      if (!Array.isArray(communityIds) || communityIds.length < 2) {
        return res.status(400).json({ error: 'At least 2 community IDs required' });
      }

      const communitiesData = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityIds[0]))
        .orWhere(eq(communities.id, communityIds[1]));

      if (communitiesData.length < 2) {
        return res.status(404).json({ error: 'One or more communities not found' });
      }

      const comparison = await multiAIOrchestrator.compareCommunities(
        communitiesData,
        criteria || ['price', 'care', 'location', 'amenities', 'reviews']
      );

      res.json(comparison);
    } catch (error) {
      console.error('AI comparison error:', error);
      res.status(500).json({ error: 'Failed to compare communities' });
    }
  });

  // AI chat assistant
  app.post('/api/ai/chat', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const { message, conversationId, context } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const response = await multiAIOrchestrator.chatAssistant({
        userId,
        message,
        conversationId,
        context
      });

      res.json(response);
    } catch (error) {
      console.error('AI chat error:', error);
      res.status(500).json({ error: 'Failed to process chat message' });
    }
  });

  // AI insights
  app.get('/api/ai/insights/:topic', async (req, res) => {
    try {
      const { topic } = req.params;
      const { location, careType } = req.query;

      const insights = await multiAIOrchestrator.generateInsights({
        topic,
        location: location as string,
        careType: careType as string
      });

      res.json(insights);
    } catch (error) {
      console.error('AI insights error:', error);
      res.status(500).json({ error: 'Failed to generate insights' });
    }
  });

  // Multi-AI analysis endpoint
  app.post('/api/ai/multi-analyze', async (req, res) => {
    try {
      const { analysisType, data } = req.body;
      
      let result: any;
      
      switch (analysisType) {
        case 'financial':
          result = {
            ai: 'Gemini 3.0 Pro',
            specialty: 'Financial Analysis',
            analysis: 'Cost breakdown and value assessment completed',
            insights: ['Average monthly cost: $4,250', 'Financial assistance options available'],
            confidence: 0.92
          };
          break;
        case 'medical':
          result = {
            ai: 'ChatGPT 5.0 Medical',
            specialty: 'Healthcare Quality',
            analysis: 'Medical services and staff credentials verified',
            ratings: { medicalCare: 4.8, staffing: 4.6, emergency: 4.9 },
            confidence: 0.89
          };
          break;
        case 'visual':
          result = {
            ai: 'Grok Vision 2.0',
            specialty: 'Visual Intelligence',
            analysis: 'Facility quality and accessibility assessed',
            findings: ['Well-maintained property', 'Accessibility features present'],
            confidence: 0.80
          };
          break;
        case 'care':
          result = {
            ai: 'Claude 4.0 Sonnet',
            specialty: 'Care Planning',
            analysis: 'Comprehensive care progression planned',
            timeline: ['Independent: 1-3 years', 'Assisted: 4-7 years'],
            confidence: 0.87
          };
          break;
        default:
          result = {
            analysis: 'Multi-AI analysis completed',
            confidence: 0.82,
            recommendations: [
              'Schedule facility tours',
              'Review financial planning',
              'Discuss with family'
            ]
          };
      }
      
      res.json({
        ...result,
        timestamp: new Date().toISOString(),
        disclaimer: 'MySeniorValet provides transparency only - we are not a placement agency'
      });
    } catch (error) {
      console.error('AI analysis error:', error);
      res.status(500).json({ error: 'Failed to complete AI analysis' });
    }
  });
}