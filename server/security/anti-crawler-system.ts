import { Request, Response, NextFunction } from 'express';
import { LRUCache } from 'lru-cache';

interface CrawlerSignature {
  userAgent?: string;
  ipPattern?: RegExp;
  behaviorPattern?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface RequestMetrics {
  count: number;
  firstSeen: number;
  lastSeen: number;
  paths: Set<string>;
  userAgents: Set<string>;
  suspicious: boolean;
  blocked: boolean;
}

class EnterpriseAntiCrawlerSystem {
  private requestCache = new LRUCache<string, RequestMetrics>({
    max: 10000,
    ttl: 1000 * 60 * 60 // 1 hour
  });

  private blockedIPs = new Set<string>();
  private allowedCrawlers = new Set<string>([
    'googlebot',
    'bingbot',
    'slurp', // Yahoo
    'duckduckbot',
    'facebookexternalhit',
    'twitterbot',
    'linkedinbot'
  ]);

  private suspiciousCrawlers: CrawlerSignature[] = [
    {
      userAgent: 'scrapy',
      riskLevel: 'critical'
    },
    {
      userAgent: 'curl',
      riskLevel: 'high'
    },
    {
      userAgent: 'wget',
      riskLevel: 'high'
    },
    {
      userAgent: 'python-requests',
      riskLevel: 'high'
    },
    {
      userAgent: 'node-fetch',
      riskLevel: 'high'
    },
    {
      userAgent: 'axios',
      riskLevel: 'medium'
    },
    {
      userAgent: 'postman',
      riskLevel: 'medium'
    },
    {
      behaviorPattern: 'rapid_sequential',
      riskLevel: 'high'
    },
    {
      behaviorPattern: 'systematic_enumeration',
      riskLevel: 'critical'
    }
  ];

  private protectedEndpoints = new Set<string>([
    '/api/communities',
    '/api/search',
    '/api/directory',
    '/api/mapping',
    '/api/weaviate',
    '/api/platform/stats'
  ]);

  // Rate limiting thresholds
  private readonly RATE_LIMITS = {
    standard: { requests: 100, window: 60 * 1000 }, // 100 requests per minute
    suspicious: { requests: 20, window: 60 * 1000 }, // 20 requests per minute
    api: { requests: 1000, window: 60 * 60 * 1000 }, // 1000 requests per hour
    search: { requests: 50, window: 60 * 1000 } // 50 search requests per minute
  };

  /**
   * Main middleware for anti-crawler protection
   */
  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const clientIP = this.getClientIP(req);
      const userAgent = req.get('User-Agent') || '';
      const path = req.path;

      // Check if IP is already blocked
      if (this.blockedIPs.has(clientIP)) {
        return this.blockRequest(res, 'IP_BLOCKED', clientIP);
      }

      // Allow legitimate search engine crawlers
      if (this.isAllowedCrawler(userAgent)) {
        return next();
      }

      // Get or create request metrics
      const metrics = this.getOrCreateMetrics(clientIP);
      this.updateMetrics(metrics, req);

      // Check for suspicious behavior
      const suspiciousLevel = this.analyzeSuspiciousBehavior(metrics, req);
      
      if (suspiciousLevel === 'critical') {
        this.blockedIPs.add(clientIP);
        return this.blockRequest(res, 'CRITICAL_THREAT', clientIP);
      }

      // Apply rate limiting based on suspicion level
      const rateLimitResult = this.applyRateLimit(metrics, req, suspiciousLevel);
      if (!rateLimitResult.allowed) {
        if (suspiciousLevel === 'high') {
          this.blockedIPs.add(clientIP);
        }
        return this.blockRequest(res, 'RATE_LIMIT_EXCEEDED', clientIP, rateLimitResult.resetTime);
      }

      // Add security headers
      this.addSecurityHeaders(res);

      // Log suspicious activity
      if (suspiciousLevel !== 'low') {
        this.logSuspiciousActivity(req, suspiciousLevel, metrics);
      }

      next();
    };
  }

  /**
   * Get client IP address with proxy support
   */
  private getClientIP(req: Request): string {
    const forwarded = req.get('x-forwarded-for');
    const realIP = req.get('x-real-ip');
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    if (realIP) {
      return realIP;
    }
    
    return req.socket.remoteAddress || 'unknown';
  }

  /**
   * Check if the user agent is an allowed crawler
   */
  private isAllowedCrawler(userAgent: string): boolean {
    const lowerUA = userAgent.toLowerCase();
    return Array.from(this.allowedCrawlers).some(crawler => 
      lowerUA.includes(crawler.toLowerCase())
    );
  }

  /**
   * Get or create metrics for an IP
   */
  private getOrCreateMetrics(ip: string): RequestMetrics {
    let metrics = this.requestCache.get(ip);
    
    if (!metrics) {
      metrics = {
        count: 0,
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        paths: new Set(),
        userAgents: new Set(),
        suspicious: false,
        blocked: false
      };
      this.requestCache.set(ip, metrics);
    }
    
    return metrics;
  }

  /**
   * Update request metrics
   */
  private updateMetrics(metrics: RequestMetrics, req: Request): void {
    metrics.count++;
    metrics.lastSeen = Date.now();
    metrics.paths.add(req.path);
    metrics.userAgents.add(req.get('User-Agent') || '');
  }

  /**
   * Analyze suspicious behavior patterns
   */
  private analyzeSuspiciousBehavior(metrics: RequestMetrics, req: Request): 'low' | 'medium' | 'high' | 'critical' {
    const userAgent = req.get('User-Agent') || '';
    const path = req.path;
    const now = Date.now();

    // Check for known suspicious user agents
    for (const signature of this.suspiciousCrawlers) {
      if (signature.userAgent && userAgent.toLowerCase().includes(signature.userAgent.toLowerCase())) {
        return signature.riskLevel;
      }
    }

    // Behavioral analysis
    const requestRate = metrics.count / ((now - metrics.firstSeen) / 1000); // requests per second
    const uniquePaths = metrics.paths.size;
    const uniqueUserAgents = metrics.userAgents.size;

    // Critical: Very high request rate
    if (requestRate > 10) {
      return 'critical';
    }

    // Critical: Systematic enumeration (many unique paths, few user agents)
    if (uniquePaths > 50 && uniqueUserAgents <= 2) {
      return 'critical';
    }

    // High: Rapid sequential requests
    if (requestRate > 5) {
      return 'high';
    }

    // High: Accessing protected endpoints frequently
    if (this.protectedEndpoints.has(path) && metrics.count > 20) {
      return 'high';
    }

    // Medium: Multiple user agents from same IP (possible rotation)
    if (uniqueUserAgents > 5) {
      return 'medium';
    }

    // Medium: High number of unique paths
    if (uniquePaths > 20) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Apply rate limiting based on behavior
   */
  private applyRateLimit(metrics: RequestMetrics, req: Request, suspicionLevel: string): { allowed: boolean; resetTime?: number } {
    const now = Date.now();
    const windowStart = now - this.RATE_LIMITS.standard.window;

    // Count recent requests
    const recentRequests = this.countRecentRequests(req.socket.remoteAddress || '', windowStart);

    let limit: number;
    switch (suspicionLevel) {
      case 'critical':
        return { allowed: false };
      case 'high':
        limit = this.RATE_LIMITS.suspicious.requests;
        break;
      case 'medium':
        limit = Math.floor(this.RATE_LIMITS.standard.requests * 0.7);
        break;
      default:
        // Check if it's an API or search endpoint
        if (req.path.startsWith('/api/search')) {
          limit = this.RATE_LIMITS.search.requests;
        } else if (req.path.startsWith('/api/')) {
          limit = this.RATE_LIMITS.api.requests;
        } else {
          limit = this.RATE_LIMITS.standard.requests;
        }
    }

    if (recentRequests >= limit) {
      return { 
        allowed: false, 
        resetTime: windowStart + this.RATE_LIMITS.standard.window 
      };
    }

    return { allowed: true };
  }

  /**
   * Count recent requests for rate limiting
   */
  private countRecentRequests(ip: string, since: number): number {
    const metrics = this.requestCache.get(ip);
    if (!metrics || metrics.firstSeen > since) {
      return metrics?.count || 0;
    }
    
    // Approximate recent requests based on total count and time window
    const totalTime = Date.now() - metrics.firstSeen;
    const recentTime = Date.now() - since;
    return Math.ceil((metrics.count * recentTime) / totalTime);
  }

  /**
   * Block suspicious request
   */
  private blockRequest(res: Response, reason: string, ip: string, resetTime?: number): void {
    const blockInfo = {
      blocked: true,
      reason,
      ip: this.hashIP(ip),
      timestamp: new Date().toISOString(),
      resetTime
    };

    console.warn(`🚫 ANTI-CRAWLER: Blocked request from ${this.hashIP(ip)} - ${reason}`);

    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Your request has been blocked due to suspicious activity',
      retryAfter: resetTime ? Math.ceil((resetTime - Date.now()) / 1000) : 3600,
      support: 'If you believe this is an error, contact admin@myseniorvalet.com'
    });
  }

  /**
   * Add security headers to response
   */
  private addSecurityHeaders(res: Response): void {
    res.setHeader('X-RateLimit-Policy', 'MySeniorValet-AntiCrawler-v1');
    res.setHeader('X-Content-Protection', 'active');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  }

  /**
   * Log suspicious activity
   */
  private logSuspiciousActivity(req: Request, level: string, metrics: RequestMetrics): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      ip: this.hashIP(this.getClientIP(req)),
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method,
      requestCount: metrics.count,
      uniquePaths: metrics.paths.size,
      uniqueUserAgents: metrics.userAgents.size,
      referer: req.get('Referer')
    };

    console.warn(`🔍 ANTI-CRAWLER: Suspicious activity detected:`, logEntry);
  }

  /**
   * Hash IP for privacy-compliant logging
   */
  private hashIP(ip: string): string {
    // Simple hash for privacy - in production use crypto
    return Buffer.from(ip).toString('base64').substring(0, 8);
  }

  /**
   * Get current system status
   */
  public getStatus() {
    return {
      activeConnections: this.requestCache.size,
      blockedIPs: this.blockedIPs.size,
      protectedEndpoints: Array.from(this.protectedEndpoints),
      rateLimits: this.RATE_LIMITS,
      allowedCrawlers: Array.from(this.allowedCrawlers)
    };
  }

  /**
   * Manually unblock an IP (admin function)
   */
  public unblockIP(ip: string): boolean {
    if (this.blockedIPs.has(ip)) {
      this.blockedIPs.delete(ip);
      this.requestCache.delete(ip);
      console.log(`✅ ANTI-CRAWLER: IP ${this.hashIP(ip)} unblocked`);
      return true;
    }
    return false;
  }

  /**
   * Clear all blocked IPs (emergency reset)
   */
  public emergencyReset(): void {
    this.blockedIPs.clear();
    this.requestCache.clear();
    console.log(`🚨 ANTI-CRAWLER: Emergency reset performed - all blocks cleared`);
  }
}

export const antiCrawlerSystem = new EnterpriseAntiCrawlerSystem();