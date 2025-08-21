/**
 * Enterprise Security Configuration for MySeniorValet
 * Comprehensive protection against data scrapers and unauthorized access
 */

export interface SecurityConfig {
  antiCrawler: {
    enabled: boolean;
    strictMode: boolean;
    rateLimits: {
      standard: { requests: number; window: number };
      suspicious: { requests: number; window: number };
      api: { requests: number; window: number };
      search: { requests: number; window: number };
    };
    protectedEndpoints: string[];
    allowedCrawlers: string[];
    suspiciousPatterns: string[];
    blockingThresholds: {
      requestRate: number; // requests per second
      pathDiversity: number; // unique paths threshold
      userAgentRotation: number; // max unique UAs per IP
    };
  };
  monitoring: {
    logSuspiciousActivity: boolean;
    alertThreshold: number;
    notificationEmail: string;
  };
  businessProtection: {
    preventDataExfiltration: boolean;
    protectPricingData: boolean;
    protectCommunityData: boolean;
    protectContactInfo: boolean;
  };
}

export const SECURITY_CONFIG: SecurityConfig = {
  antiCrawler: {
    enabled: true,
    strictMode: true, // Enhanced protection for MySeniorValet's valuable data
    
    rateLimits: {
      // Standard users - generous limits for legitimate browsing
      standard: { 
        requests: 120, // Increased for family research sessions
        window: 60 * 1000 // 1 minute
      },
      
      // Suspicious users - restricted access
      suspicious: { 
        requests: 15, // Very limited for suspected crawlers
        window: 60 * 1000 // 1 minute
      },
      
      // API endpoints - higher limits for legitimate integrations
      api: { 
        requests: 500, // Reduced from 1000 to prevent abuse
        window: 60 * 60 * 1000 // 1 hour
      },
      
      // Search endpoints - moderate limits to prevent scraping
      search: { 
        requests: 30, // Reasonable for genuine users
        window: 60 * 1000 // 1 minute
      }
    },

    // Critical endpoints that need extra protection
    protectedEndpoints: [
      '/api/communities',
      '/api/search',
      '/api/directory',
      '/api/mapping',
      '/api/weaviate',
      '/api/platform/stats',
      '/api/authentic-pricing',
      '/api/vendor',
      '/api/tours',
      '/api/reviews'
    ],

    // Legitimate search engine crawlers (allowed)
    allowedCrawlers: [
      'googlebot',
      'bingbot',
      'slurp', // Yahoo
      'duckduckbot',
      'facebookexternalhit',
      'twitterbot',
      'linkedinbot',
      'pinterest',
      'applebot'
    ],

    // Patterns that indicate scraping/crawling tools
    suspiciousPatterns: [
      'scrapy',
      'selenium',
      'webdriver',
      'crawler',
      'spider',
      'scraper',
      'bot',
      'curl',
      'wget',
      'python-requests',
      'node-fetch',
      'axios',
      'postman',
      'httpie',
      'insomnia',
      'beautifulsoup',
      'mechanize',
      'headless'
    ],

    // Behavioral thresholds for blocking
    blockingThresholds: {
      requestRate: 5, // Block if >5 requests per second sustained
      pathDiversity: 25, // Block if accessing >25 unique paths rapidly
      userAgentRotation: 3 // Block if >3 different user agents from same IP
    }
  },

  monitoring: {
    logSuspiciousActivity: true,
    alertThreshold: 10, // Alert after 10 blocked attempts
    notificationEmail: 'admin@myseniorvalet.com'
  },

  businessProtection: {
    preventDataExfiltration: true,
    protectPricingData: true, // Critical: Protect HUD pricing data
    protectCommunityData: true, // Critical: Protect community details
    protectContactInfo: true // Critical: Protect phone numbers, emails
  }
};

/**
 * Security messages for different block reasons
 */
export const SECURITY_MESSAGES = {
  IP_BLOCKED: {
    message: 'Access temporarily restricted due to suspicious activity',
    support: 'Contact admin@myseniorvalet.com if this is an error'
  },
  
  RATE_LIMIT_EXCEEDED: {
    message: 'Request limit exceeded. Please slow down your browsing',
    support: 'For legitimate high-volume usage, contact admin@myseniorvalet.com'
  },
  
  CRITICAL_THREAT: {
    message: 'Unauthorized access attempt detected and blocked',
    support: 'This incident has been logged. Contact admin@myseniorvalet.com'
  },

  SUSPICIOUS_BEHAVIOR: {
    message: 'Unusual browsing pattern detected. Access temporarily limited',
    support: 'Normal browsing will restore access. Contact admin@myseniorvalet.com'
  }
};

/**
 * Get current security configuration
 */
export function getSecurityConfig(): SecurityConfig {
  return SECURITY_CONFIG;
}

/**
 * Check if endpoint needs extra protection
 */
export function isProtectedEndpoint(path: string): boolean {
  return SECURITY_CONFIG.antiCrawler.protectedEndpoints.some(endpoint => 
    path.startsWith(endpoint)
  );
}

/**
 * Check if user agent appears to be a legitimate crawler
 */
export function isAllowedCrawler(userAgent: string): boolean {
  const lowerUA = userAgent.toLowerCase();
  return SECURITY_CONFIG.antiCrawler.allowedCrawlers.some(crawler =>
    lowerUA.includes(crawler.toLowerCase())
  );
}

/**
 * Check if user agent contains suspicious patterns
 */
export function containsSuspiciousPattern(userAgent: string): boolean {
  const lowerUA = userAgent.toLowerCase();
  return SECURITY_CONFIG.antiCrawler.suspiciousPatterns.some(pattern =>
    lowerUA.includes(pattern.toLowerCase())
  );
}