import { Router } from 'express';
import { anthropicAI } from '../anthropic-ai-service';
import { storage } from '../storage';
import { requireSimpleAuth } from '../simple-auth';
import { Request, Response } from 'express';

// Extend Express Request type to include user
declare module 'express' {
  interface Request {
    user?: any;
  }
}
import { z } from 'zod';

const router = Router();

// AI Chat endpoint
const aiChatSchema = z.object({
  message: z.string().min(1).max(1000),
  context: z.object({
    location: z.string().optional(),
    currentPage: z.string().optional(),
    searchHistory: z.array(z.string()).optional()
  }).optional()
});

router.post('/api/ai/chat', async (req, res) => {
  try {
    const validatedData = aiChatSchema.parse(req.body);
    
    // Get user context if authenticated
    const userId = req.user?.id;
    const context = {
      ...validatedData.context,
      userId: userId || undefined
    };

    const response = await anthropicAI.processAssistantRequest({
      message: validatedData.message,
      context
    });

    res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid request data', details: error.errors });
    } else {
      console.error('AI chat error:', error);
      res.status(500).json({ error: 'Failed to process AI request' });
    }
  }
});

// Community advice endpoint
const communityAdviceSchema = z.object({
  query: z.string().min(1).max(1000),
  communityIds: z.array(z.number()).optional()
});

router.post('/api/ai/advice', async (req, res) => {
  try {
    const validatedData = communityAdviceSchema.parse(req.body);
    
    let communities = [];
    if (validatedData.communityIds && validatedData.communityIds.length > 0) {
      communities = await storage.getCommunitiesByIds(validatedData.communityIds);
    }

    const advice = await anthropicAI.getSeniorLivingAdvice(
      validatedData.query,
      communities
    );

    res.json({ advice });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid request data', details: error.errors });
    } else {
      console.error('AI advice error:', error);
      res.status(500).json({ error: 'Failed to get AI advice' });
    }
  }
});

// Community fit analysis endpoint (requires auth)
const fitAnalysisSchema = z.object({
  communityId: z.number(),
  userNeeds: z.string().min(1).max(500)
});

router.post('/api/ai/analyze-fit', requireSimpleAuth, async (req, res) => {
  try {
    const validatedData = fitAnalysisSchema.parse(req.body);
    
    const community = await storage.getCommunity(validatedData.communityId);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    const analysis = await anthropicAI.analyzeCommunityFit(
      community,
      validatedData.userNeeds
    );

    // Save analysis to user's search history if authenticated
    if (req.user?.id) {
      // TODO: Implement search history tracking
    }

    res.json(analysis);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid request data', details: error.errors });
    } else {
      console.error('Fit analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze community fit' });
    }
  }
});

// Quick help suggestions
router.get('/api/ai/quick-help', (req, res) => {
  const suggestions = [
    {
      id: 'search',
      title: 'How to search effectively',
      icon: 'search',
      prompt: 'How do I search for senior living communities near me?'
    },
    {
      id: 'pricing',
      title: 'Understanding pricing',
      icon: 'dollar-sign',
      prompt: 'How does MySeniorValet show pricing information?'
    },
    {
      id: 'care-types',
      title: 'Care level differences',
      icon: 'heart',
      prompt: 'What\'s the difference between assisted living and memory care?'
    },
    {
      id: 'save-favorites',
      title: 'Saving communities',
      icon: 'bookmark',
      prompt: 'How do I save and compare my favorite communities?'
    },
    {
      id: 'family-sharing',
      title: 'Share with family',
      icon: 'users',
      prompt: 'How can I share communities with my family members?'
    }
  ];

  res.json({ suggestions });
});

export { router as default };