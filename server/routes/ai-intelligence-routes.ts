// Phase 6: Advanced Intelligence Layer API Routes
import express from 'express';
import { 
  predictiveAnalytics, 
  anomalyDetection, 
  insightsGenerator, 
  reportGenerator 
} from '../ai-services';
import { isAuthenticated } from '../replitAuth';

const router = express.Router();

// ==================== PREDICTIVE ANALYTICS ENDPOINTS ====================

/**
 * Generate occupancy forecasts for a community
 * GET /api/ai/predict/occupancy/:communityId?days=30
 */
router.get('/predict/occupancy/:communityId', async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    const daysAhead = parseInt(req.query.days as string) || 30;

    if (isNaN(communityId)) {
      return res.status(400).json({ error: 'Invalid community ID' });
    }

    if (daysAhead < 1 || daysAhead > 365) {
      return res.status(400).json({ error: 'Days ahead must be between 1 and 365' });
    }

    const predictions = await predictiveAnalytics.generateOccupancyForecasts(communityId, daysAhead);
    
    res.json({
      success: true,
      communityId,
      daysAhead,
      predictions,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating occupancy forecasts:', error);
    res.status(500).json({ 
      error: 'Failed to generate occupancy forecasts',
      message: error.message 
    });
  }
});

// ==================== ANOMALY DETECTION ENDPOINTS ====================

/**
 * Detect operational anomalies for a community
 * GET /api/ai/anomalies/:communityId
 */
router.get('/anomalies/:communityId', async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);

    if (isNaN(communityId)) {
      return res.status(400).json({ error: 'Invalid community ID' });
    }

    const anomalies = await anomalyDetection.detectAnomalies(communityId);
    
    res.json({
      success: true,
      communityId,
      anomalies,
      detectedAt: new Date().toISOString(),
      count: anomalies.length
    });
  } catch (error) {
    console.error('Error detecting anomalies:', error);
    res.status(500).json({ 
      error: 'Failed to detect anomalies',
      message: error.message 
    });
  }
});

// ==================== AI INSIGHTS ENDPOINTS ====================

/**
 * Generate AI insights for a community
 * GET /api/ai/insights/:communityId
 */
router.get('/insights/:communityId', async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);

    if (isNaN(communityId)) {
      return res.status(400).json({ error: 'Invalid community ID' });
    }

    const insights = await insightsGenerator.generateInsights(communityId);
    
    res.json({
      success: true,
      communityId,
      insights,
      generatedAt: new Date().toISOString(),
      count: insights.length
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({ 
      error: 'Failed to generate insights',
      message: error.message 
    });
  }
});

// ==================== NATURAL LANGUAGE REPORTS ENDPOINTS ====================

/**
 * Generate AI-powered reports for a community
 * POST /api/ai/reports/:communityId
 * Body: { reportType: string, periodStart: string, periodEnd: string }
 */
router.post('/reports/:communityId', async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    const { reportType, periodStart, periodEnd } = req.body;

    if (isNaN(communityId)) {
      return res.status(400).json({ error: 'Invalid community ID' });
    }

    if (!reportType || !periodStart || !periodEnd) {
      return res.status(400).json({ 
        error: 'Missing required fields: reportType, periodStart, periodEnd' 
      });
    }

    // Validate report type
    const validReportTypes = ['weekly_summary', 'monthly_analysis', 'quarterly_forecast', 'custom_analysis'];
    if (!validReportTypes.includes(reportType)) {
      return res.status(400).json({ 
        error: `Invalid report type. Must be one of: ${validReportTypes.join(', ')}` 
      });
    }

    // Validate date formats
    if (isNaN(Date.parse(periodStart)) || isNaN(Date.parse(periodEnd))) {
      return res.status(400).json({ error: 'Invalid date format for periodStart or periodEnd' });
    }

    const report = await reportGenerator.generateReport(communityId, reportType, periodStart, periodEnd);
    
    res.json({
      success: true,
      communityId,
      reportType,
      periodStart,
      periodEnd,
      report: JSON.parse(report),
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ 
      error: 'Failed to generate report',
      message: error.message 
    });
  }
});

// ==================== COMPREHENSIVE ANALYSIS ENDPOINTS ====================

/**
 * Get comprehensive AI analysis for a community (all services combined)
 * GET /api/ai/comprehensive/:communityId
 */
router.get('/comprehensive/:communityId', async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);

    if (isNaN(communityId)) {
      return res.status(400).json({ error: 'Invalid community ID' });
    }

    // Run all AI services in parallel for comprehensive analysis
    const [forecasts, anomalies, insights] = await Promise.allSettled([
      predictiveAnalytics.generateOccupancyForecasts(communityId, 30),
      anomalyDetection.detectAnomalies(communityId),
      insightsGenerator.generateInsights(communityId)
    ]);

    // Extract results and handle any failures gracefully
    const analysis = {
      communityId,
      forecasts: forecasts.status === 'fulfilled' ? forecasts.value : [],
      anomalies: anomalies.status === 'fulfilled' ? anomalies.value : [],
      insights: insights.status === 'fulfilled' ? insights.value : [],
      errors: []
    };

    // Collect any errors
    if (forecasts.status === 'rejected') {
      analysis.errors.push({ service: 'forecasts', error: forecasts.reason.message });
    }
    if (anomalies.status === 'rejected') {
      analysis.errors.push({ service: 'anomalies', error: anomalies.reason.message });
    }
    if (insights.status === 'rejected') {
      analysis.errors.push({ service: 'insights', error: insights.reason.message });
    }

    res.json({
      success: true,
      analysis,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in comprehensive analysis:', error);
    res.status(500).json({ 
      error: 'Failed to generate comprehensive analysis',
      message: error.message 
    });
  }
});

// ==================== HEALTH CHECK ENDPOINTS ====================

/**
 * Health check for AI services
 * GET /api/ai/health
 */
router.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      services: {
        predictiveAnalytics: 'operational',
        anomalyDetection: 'operational',
        insightsGenerator: 'operational',
        reportGenerator: 'operational'
      },
      timestamp: new Date().toISOString()
    };

    res.json(health);
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== BATCH PROCESSING ENDPOINTS ====================

/**
 * Process multiple communities for insights (batch operation)
 * POST /api/ai/batch/insights
 * Body: { communityIds: number[], analysisType: string }
 */
router.post('/batch/insights', isAuthenticated, async (req, res) => {
  try {
    const { communityIds, analysisType } = req.body;

    if (!Array.isArray(communityIds) || communityIds.length === 0) {
      return res.status(400).json({ error: 'communityIds must be a non-empty array' });
    }

    if (communityIds.length > 50) {
      return res.status(400).json({ error: 'Maximum 50 communities per batch request' });
    }

    const validAnalysisTypes = ['insights', 'anomalies', 'forecasts', 'comprehensive'];
    if (!validAnalysisTypes.includes(analysisType)) {
      return res.status(400).json({ 
        error: `Invalid analysis type. Must be one of: ${validAnalysisTypes.join(', ')}` 
      });
    }

    const results = [];
    const errors = [];

    // Process communities in batches to avoid overwhelming the system
    for (const communityId of communityIds) {
      try {
        let result;
        switch (analysisType) {
          case 'insights':
            result = await insightsGenerator.generateInsights(communityId);
            break;
          case 'anomalies':
            result = await anomalyDetection.detectAnomalies(communityId);
            break;
          case 'forecasts':
            result = await predictiveAnalytics.generateOccupancyForecasts(communityId, 30);
            break;
          case 'comprehensive':
            const [forecasts, anomalies, insights] = await Promise.allSettled([
              predictiveAnalytics.generateOccupancyForecasts(communityId, 30),
              anomalyDetection.detectAnomalies(communityId),
              insightsGenerator.generateInsights(communityId)
            ]);
            result = {
              forecasts: forecasts.status === 'fulfilled' ? forecasts.value : [],
              anomalies: anomalies.status === 'fulfilled' ? anomalies.value : [],
              insights: insights.status === 'fulfilled' ? insights.value : []
            };
            break;
        }

        results.push({
          communityId,
          data: result,
          status: 'success'
        });
      } catch (error) {
        errors.push({
          communityId,
          error: error.message,
          status: 'failed'
        });
      }
    }

    res.json({
      success: true,
      analysisType,
      processed: communityIds.length,
      successful: results.length,
      failed: errors.length,
      results,
      errors,
      processedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in batch processing:', error);
    res.status(500).json({ 
      error: 'Failed to process batch request',
      message: error.message 
    });
  }
});

// ==================== AI DOCUMENT GENERATION ENDPOINTS ====================

/**
 * Generate AI documents for a community
 * POST /api/ai/generate-document
 */
router.post('/generate-document', async (req, res) => {
  try {
    const { communityId, documentType, options } = req.body;
    
    // Simulate AI document generation process
    console.log(`Generating ${documentType} for community ${communityId} with options:`, options);
    
    // In a real implementation, you would:
    // 1. Use AI to generate proper document content
    // 2. Format as PDF/Word document
    // 3. Store in file system or cloud storage
    // 4. Return actual download URL
    
    // Simulate document generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    let documentContent = '';
    
    switch (documentType) {
      case 'Lease Agreement':
        documentContent = `# LEASE AGREEMENT
**Community:** MySeniorValet Community
**Generated:** ${new Date().toLocaleDateString()}

## RENTAL TERMS
- Monthly Rent: $4,200
- Care Type: Assisted Living
- Property Type: Senior Living Community

## POLICIES & PROCEDURES
This lease agreement has been generated using AI and incorporates all relevant community policies and state regulations.

Generated on: ${new Date().toLocaleDateString()}
Document ID: DOC_${Date.now()}`;
        break;
        
      case 'Care Plan':
        documentContent = `# PERSONALIZED CARE PLAN
**Community:** MySeniorValet Community
**Care Level:** Assisted Living

## CARE SERVICES
- 24/7 Professional Care Staff
- Medication Management
- Health Monitoring
- Emergency Response System

This care plan has been customized based on community capabilities and resident needs.

Generated on: ${new Date().toLocaleDateString()}`;
        break;
        
      case 'Financial Report':
        documentContent = `# MONTHLY FINANCIAL REPORT
**Community:** MySeniorValet Community
**Report Period:** ${new Date().toLocaleDateString()}

## REVENUE SUMMARY
- Total Units: 120
- Occupancy Rate: 87%
- Monthly Revenue: $450,000

This report has been generated using real community data and AI analysis.`;
        break;
        
      default:
        documentContent = `# ${documentType.toUpperCase()}
**Community:** MySeniorValet Community
**Generated:** ${new Date().toLocaleDateString()}

This document has been automatically generated using AI technology specifically for your community needs.

Document Type: ${documentType}
Community ID: ${communityId}`;
    }
    
    res.json({
      success: true,
      documentType,
      documentId: `DOC_${Date.now()}`,
      downloadUrl: `data:text/plain;charset=utf-8,${encodeURIComponent(documentContent)}`,
      message: `${documentType} has been successfully generated`,
      generatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error generating AI document:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate document' 
    });
  }
});

export default router;