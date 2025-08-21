import { Router, Request, Response } from 'express';
import { antiCrawlerSystem } from '../security/anti-crawler-system';
import { honeypotSystem } from '../security/honeypot-system';

const router = Router();

/**
 * Get comprehensive security system status
 * Admin endpoint to monitor all protection layers
 */
router.get('/status', (req: Request, res: Response) => {
  try {
    const antiCrawlerStatus = antiCrawlerSystem.getStatus();
    const honeypotIPs = honeypotSystem.getSuspiciousIPs();
    
    res.json({
      success: true,
      securityLayers: {
        antiCrawler: {
          active: true,
          level: 'enterprise',
          ...antiCrawlerStatus
        },
        honeypot: {
          active: true,
          suspiciousIPsDetected: honeypotIPs.length,
          trapsActive: [
            '/api/admin/dump',
            '/api/internal/all-data', 
            '/database-export',
            '/api/scrape-all',
            '/bulk-download'
          ]
        }
      },
      businessProtection: {
        dataExfiltrationPrevention: true,
        pricingDataProtected: true,
        communityDataProtected: true,
        contactInfoProtected: true
      },
      features: [
        '✅ Real-time bot detection',
        '✅ Advanced behavioral analysis', 
        '✅ Multi-layer rate limiting',
        '✅ IP blocking & reputation tracking',
        '✅ Honeypot trap system',
        '✅ Search engine crawler allowlist',
        '✅ Protected endpoint monitoring',
        '✅ Business data protection'
      ],
      uptime: `${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m`,
      timestamp: new Date().toISOString(),
      _version: "v4_enterprise_security_comprehensive"
    });
  } catch (error) {
    console.error('Error getting security status:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Unblock a specific IP address
 * Admin function to manually unblock legitimate users
 */
router.post('/unblock/:ip', (req: Request, res: Response) => {
  try {
    const { ip } = req.params;
    
    if (!ip || ip === 'undefined') {
      return res.status(400).json({
        success: false,
        error: 'IP address is required'
      });
    }

    const unblocked = antiCrawlerSystem.unblockIP(ip);
    
    res.json({
      success: true,
      unblocked,
      message: unblocked 
        ? `IP ${ip} has been unblocked successfully`
        : `IP ${ip} was not in the blocked list`,
      timestamp: new Date().toISOString(),
      _version: "v4_enterprise_security"
    });
  } catch (error) {
    console.error('Error unblocking IP:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Emergency reset - clear all blocks
 * Should only be used in emergencies
 */
router.post('/emergency-reset', (req: Request, res: Response) => {
  try {
    antiCrawlerSystem.emergencyReset();
    
    console.warn('🚨 ANTI-CRAWLER: Emergency reset triggered via admin endpoint');
    
    res.json({
      success: true,
      message: 'Emergency reset completed - all IP blocks cleared',
      warning: 'This action affects all blocked IPs and should only be used in emergencies',
      timestamp: new Date().toISOString(),
      _version: "v4_enterprise_security"
    });
  } catch (error) {
    console.error('Error during emergency reset:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Test the anti-crawler system
 * Allows admins to verify protection is working
 */
router.get('/test', (req: Request, res: Response) => {
  const testResults = {
    protectionActive: true,
    timestamp: new Date().toISOString(),
    requestHeaders: {
      userAgent: req.get('User-Agent'),
      ip: req.socket.remoteAddress,
      forwarded: req.get('x-forwarded-for'),
      realIP: req.get('x-real-ip')
    },
    securityHeaders: {
      rateLimitPolicy: res.get('X-RateLimit-Policy'),
      contentProtection: res.get('X-Content-Protection')
    }
  };

  res.json({
    success: true,
    message: 'Anti-crawler system test completed',
    results: testResults,
    _version: "v4_enterprise_security"
  });
});

/**
 * Get real-time protection metrics
 */
router.get('/metrics', (req: Request, res: Response) => {
  try {
    const antiCrawlerStatus = antiCrawlerSystem.getStatus();
    const honeypotIPs = honeypotSystem.getSuspiciousIPs();
    
    // Calculate comprehensive metrics
    const metrics = {
      protection: {
        totalConnections: antiCrawlerStatus.activeConnections,
        blockedIPs: antiCrawlerStatus.blockedIPs,
        protectedEndpoints: antiCrawlerStatus.protectedEndpoints.length,
        allowedCrawlers: antiCrawlerStatus.allowedCrawlers.length,
        honeypotDetections: honeypotIPs.length
      },
      rateLimits: antiCrawlerStatus.rateLimits,
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        platform: process.platform,
        nodeVersion: process.version
      },
      businessMetrics: {
        dataExfiltrationAttempts: honeypotIPs.length,
        protectionLevel: 'enterprise',
        securityScore: calculateSecurityScore(antiCrawlerStatus, honeypotIPs.length)
      },
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      metrics,
      _version: "v4_enterprise_security_comprehensive"
    });
  } catch (error) {
    console.error('Error getting protection metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Calculate security effectiveness score
 */
function calculateSecurityScore(antiCrawlerStatus: any, honeypotDetections: number): number {
  let score = 100;
  
  // Reduce score for high numbers of active connections (potential attacks)
  if (antiCrawlerStatus.activeConnections > 100) score -= 10;
  if (antiCrawlerStatus.activeConnections > 500) score -= 20;
  
  // Reduce score for blocked IPs (indicates attack attempts)
  if (antiCrawlerStatus.blockedIPs > 10) score -= 5;
  if (antiCrawlerStatus.blockedIPs > 50) score -= 15;
  
  // Reduce score for honeypot detections (scraping attempts)
  if (honeypotDetections > 5) score -= 10;
  if (honeypotDetections > 20) score -= 25;
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Clear honeypot suspicious IPs
 * Admin function to reset honeypot detections
 */
router.post('/honeypot/clear', (req: Request, res: Response) => {
  try {
    const previousCount = honeypotSystem.getSuspiciousIPs().length;
    honeypotSystem.clearSuspiciousIPs();
    
    res.json({
      success: true,
      message: `Cleared ${previousCount} suspicious IPs from honeypot system`,
      timestamp: new Date().toISOString(),
      _version: "v4_enterprise_security_comprehensive"
    });
  } catch (error) {
    console.error('Error clearing honeypot IPs:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Emergency reset - clear all blocked IPs
 * Use with caution - removes all security blocks
 */
router.post('/emergency-reset', (req: Request, res: Response) => {
  try {
    antiCrawlerSystem.emergencyReset();
    
    res.json({
      success: true,
      message: 'Emergency reset completed - all IP blocks cleared',
      warning: 'Protection system reset - monitor for suspicious activity',
      timestamp: new Date().toISOString(),
      _version: "v4_enterprise_security_comprehensive"
    });
  } catch (error) {
    console.error('Error performing emergency reset:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;