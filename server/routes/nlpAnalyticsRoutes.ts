/**
 * NLP Analytics Routes
 * Dashboard and insights for the self-learning KRAKEN system
 */

import { Router } from 'express';
import { nlpAnalytics } from '../services/nlp-analytics';

const router = Router();

/**
 * Get analytics dashboard data
 * GET /api/nlp/analytics/dashboard
 */
router.get('/dashboard', async (req, res) => {
  try {
    const dashboard = await nlpAnalytics.getAnalyticsDashboard();
    res.json({
      success: true,
      data: dashboard,
      krakenStatus: 'FULLY_AWAKENED',
      _version: 'kraken_v1_' + Date.now()
    });
  } catch (error) {
    console.error('Analytics dashboard error:', error);
    res.status(500).json({
      error: 'Failed to load analytics',
      krakenStatus: 'TEMPORARILY_SLEEPING',
      _version: 'kraken_v1'
    });
  }
});

/**
 * Track user interaction
 * POST /api/nlp/analytics/interaction
 */
router.post('/interaction', async (req, res) => {
  try {
    const { query, resultId, interactionType } = req.body;
    const userId = (req.session as any)?.userId || 'anonymous';
    
    await nlpAnalytics.trackInteraction(query, resultId, interactionType, userId);
    
    res.json({
      success: true,
      message: 'Interaction tracked - KRAKEN learns!',
      _version: 'kraken_v1'
    });
  } catch (error) {
    console.error('Interaction tracking error:', error);
    res.status(500).json({
      error: 'Failed to track interaction',
      _version: 'kraken_v1'
    });
  }
});

/**
 * Get personalized suggestions
 * GET /api/nlp/analytics/personalized
 */
router.get('/personalized', async (req, res) => {
  try {
    const userId = (req.session as any)?.userId || req.query.userId || 'anonymous';
    const suggestions = nlpAnalytics.getPersonalizedSuggestions(userId as string);
    
    res.json({
      success: true,
      suggestions,
      userId,
      krakenIntelligence: 'PERSONALIZED',
      _version: 'kraken_v1'
    });
  } catch (error) {
    console.error('Personalization error:', error);
    res.status(500).json({
      error: 'Failed to get personalized suggestions',
      _version: 'kraken_v1'
    });
  }
});

/**
 * Export learning data for model training
 * GET /api/nlp/analytics/export
 */
router.get('/export', async (req, res) => {
  try {
    const learningData = await nlpAnalytics.exportLearningData();
    
    res.json({
      success: true,
      data: learningData,
      krakenKnowledge: 'EXPORTED',
      _version: 'kraken_v1_' + Date.now()
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      error: 'Failed to export learning data',
      _version: 'kraken_v1'
    });
  }
});

export default router;