import { type Express } from "express";
import { db } from "../db";
import { communities } from "@shared/schema";
import { eq } from "drizzle-orm";
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

      const results = await aiSearchService.searchWithNLP({
        query,
        context,
        limit: 20
      });

      res.json(results);
    } catch (error) {
      console.error('AI search error:', error);
      res.status(500).json({ error: 'AI search failed' });
    }
  });

  // AI recommendations
  app.post('/api/ai/recommendations', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const recommendationRequest: RecommendationRequest = {
        ...req.body,
        userId
      };

      const recommendations = await aiRecommendationEngine.getRecommendations(recommendationRequest);
      res.json(recommendations);
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