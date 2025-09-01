import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service';

// Middleware to track analytics events
export async function trackAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    // Skip tracking for static assets and system endpoints
    if (
      req.path.startsWith('/api/health') ||
      req.path.startsWith('/api/metrics') ||
      req.path.includes('.') || // Skip files with extensions
      req.method === 'OPTIONS'
    ) {
      return next();
    }

    // Get or create session ID
    let sessionId = (req.session as any)?.analyticsSessionId;
    if (!sessionId) {
      sessionId = analyticsService.generateSessionId();
      if (req.session) {
        (req.session as any).analyticsSessionId = sessionId;
      }
    }

    // Extract user and community context
    const userId = (req as any).user?.id;
    let communityId: number | undefined;
    
    // Try to extract community ID from various sources
    if (req.params.communityId) {
      communityId = parseInt(req.params.communityId);
    } else if (req.query.communityId) {
      communityId = parseInt(req.query.communityId as string);
    } else if (req.body?.communityId) {
      communityId = parseInt(req.body.communityId);
    }

    // Create or update session
    if (req.path.startsWith('/api')) {
      await analyticsService.createOrUpdateSession({
        sessionId,
        userId,
        communityId,
        entryPage: req.path,
        utmSource: req.query.utm_source as string,
        utmMedium: req.query.utm_medium as string,
        utmCampaign: req.query.utm_campaign as string
      });
    }

    // Determine event type and category based on the endpoint
    let eventType = 'api_call';
    let eventCategory = 'api';
    let eventAction = req.method.toLowerCase();
    let eventLabel = req.path;

    // Special handling for specific endpoints
    if (req.path.includes('/communities')) {
      eventCategory = 'community';
      if (req.path.includes('/search')) {
        eventType = 'search';
        eventAction = 'search_communities';
      } else if (req.method === 'GET' && req.params.id) {
        eventType = 'page_view';
        eventAction = 'view_community';
      }
    } else if (req.path.includes('/tours')) {
      eventCategory = 'engagement';
      eventType = 'tour_interaction';
      if (req.method === 'POST') {
        eventAction = 'schedule_tour';
      } else if (req.method === 'PUT') {
        eventAction = 'update_tour';
      }
    } else if (req.path.includes('/messages')) {
      eventCategory = 'engagement';
      eventType = 'messaging';
      eventAction = req.method === 'POST' ? 'send_message' : 'read_messages';
    } else if (req.path.includes('/auth')) {
      eventCategory = 'authentication';
      if (req.path.includes('/login')) {
        eventType = 'login';
        eventAction = 'user_login';
      } else if (req.path.includes('/register')) {
        eventType = 'registration';
        eventAction = 'user_register';
      }
    } else if (req.path.includes('/analytics') || req.path.includes('/financial') || req.path.includes('/compliance')) {
      eventCategory = 'enterprise';
      eventType = 'dashboard_view';
      eventAction = 'view_enterprise_data';
    }

    // Track the event
    await analyticsService.trackEvent({
      communityId,
      userId,
      sessionId,
      eventType,
      eventCategory,
      eventAction,
      eventLabel,
      pageUrl: req.path,
      pageTitle: `API: ${req.path}`,
      customData: {
        method: req.method,
        query: req.query,
        userAgent: req.get('user-agent'),
        ip: req.ip,
        statusCode: res.statusCode
      },
      req
    });

    // Track special user actions
    if (req.body) {
      // Track phone clicks
      if (req.body.action === 'phone_click' && communityId) {
        await analyticsService.trackEvent({
          communityId,
          userId,
          sessionId,
          eventType: 'engagement',
          eventCategory: 'contact',
          eventAction: 'phone_click',
          eventLabel: 'Phone number clicked',
          req
        });
      }
      
      // Track website clicks
      if (req.body.action === 'website_click' && communityId) {
        await analyticsService.trackEvent({
          communityId,
          userId,
          sessionId,
          eventType: 'engagement',
          eventCategory: 'contact',
          eventAction: 'website_click',
          eventLabel: 'Website link clicked',
          req
        });
      }
      
      // Track directions requests
      if (req.body.action === 'directions_click' && communityId) {
        await analyticsService.trackEvent({
          communityId,
          userId,
          sessionId,
          eventType: 'engagement',
          eventCategory: 'contact',
          eventAction: 'directions_click',
          eventLabel: 'Directions requested',
          req
        });
      }
    }

    // Update metrics periodically (every 100 requests)
    if (Math.random() < 0.01 && communityId) {
      // Asynchronously update daily metrics
      analyticsService.updateDailyMetrics(communityId, new Date()).catch(err => {
        console.error('Error updating daily metrics:', err);
      });
    }

  } catch (error) {
    // Don't block the request if analytics fails
    console.error('Analytics tracking error:', error);
  }

  next();
}

// Specific middleware for tracking page views on the frontend
export async function trackPageView(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = (req.session as any)?.analyticsSessionId || analyticsService.generateSessionId();
    const userId = (req as any).user?.id;
    
    // Extract page info from headers or query
    const pageUrl = req.get('X-Page-URL') || req.query.pageUrl as string || req.path;
    const pageTitle = req.get('X-Page-Title') || req.query.pageTitle as string || 'Unknown Page';
    const communityId = req.query.communityId ? parseInt(req.query.communityId as string) : undefined;

    await analyticsService.trackEvent({
      communityId,
      userId,
      sessionId,
      eventType: 'page_view',
      eventCategory: 'navigation',
      eventAction: 'view_page',
      eventLabel: pageTitle,
      pageUrl,
      pageTitle,
      req
    });

    res.json({ tracked: true });
  } catch (error) {
    console.error('Page view tracking error:', error);
    res.status(500).json({ error: 'Failed to track page view' });
  }
}

// Endpoint to track custom events from the frontend
export async function trackCustomEvent(req: Request, res: Response) {
  try {
    const sessionId = (req.session as any)?.analyticsSessionId || analyticsService.generateSessionId();
    const userId = (req as any).user?.id;
    
    const {
      communityId,
      eventType,
      eventCategory,
      eventAction,
      eventLabel,
      eventValue,
      customData
    } = req.body;

    await analyticsService.trackEvent({
      communityId: communityId ? parseInt(communityId) : undefined,
      userId,
      sessionId,
      eventType: eventType || 'custom',
      eventCategory,
      eventAction,
      eventLabel,
      eventValue,
      customData,
      req
    });

    res.json({ tracked: true });
  } catch (error) {
    console.error('Custom event tracking error:', error);
    res.status(500).json({ error: 'Failed to track event' });
  }
}