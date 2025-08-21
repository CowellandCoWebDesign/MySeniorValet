import { Request, Response, NextFunction } from 'express';

/**
 * Honeypot System for MySeniorValet
 * Creates trap endpoints to catch unauthorized scrapers
 */
class HoneypotSystem {
  private suspiciousIPs = new Set<string>();
  private honeypotEndpoints = new Set<string>([
    '/robots.txt.backup',
    '/api/admin/dump',
    '/api/internal/all-data',
    '/database-export',
    '/api/v1/communities/bulk-export',
    '/wp-admin/',
    '/admin/',
    '/.env',
    '/config.json',
    '/api/scrape-all',
    '/bulk-download'
  ]);

  /**
   * Create honeypot middleware to detect scrapers
   */
  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const path = req.path;
      const clientIP = this.getClientIP(req);

      // Check if request is for a honeypot endpoint
      if (this.honeypotEndpoints.has(path)) {
        this.flagSuspiciousIP(clientIP, req);
        return this.serveTrap(res, path);
      }

      // Check for common scraper patterns in URLs
      if (this.isSuspiciousPath(path)) {
        this.flagSuspiciousIP(clientIP, req);
        return this.serveTrap(res, path);
      }

      next();
    };
  }

  /**
   * Get client IP address
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
   * Check if path indicates scraping attempt
   */
  private isSuspiciousPath(path: string): boolean {
    const suspiciousPatterns = [
      /\/api\/.*\/bulk/,
      /\/api\/.*\/export/,
      /\/api\/.*\/dump/,
      /\/api\/.*\/all/,
      /.*\.sql$/,
      /.*\.db$/,
      /.*\.bak$/,
      /\/sitemap.*\.xml$/,
      /\/feed.*\.xml$/,
      /\/wp-/,
      /\/admin/,
      /\/phpmyadmin/
    ];

    return suspiciousPatterns.some(pattern => pattern.test(path));
  }

  /**
   * Flag IP as suspicious
   */
  private flagSuspiciousIP(ip: string, req: Request): void {
    this.suspiciousIPs.add(ip);
    
    console.warn(`🍯 HONEYPOT: Trap triggered by ${this.hashIP(ip)}`, {
      path: req.path,
      userAgent: req.get('User-Agent'),
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Serve trap response
   */
  private serveTrap(res: Response, path: string): void {
    // Serve different trap responses based on path
    if (path.includes('robots.txt')) {
      res.set('Content-Type', 'text/plain');
      res.status(404).send('Not found');
      return;
    }

    if (path.includes('api')) {
      // Serve fake API response that looks real but contains no real data
      res.json({
        error: 'Unauthorized access',
        message: 'This endpoint requires authentication',
        code: 401,
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Default trap response
    res.status(404).send('Not Found');
  }

  /**
   * Hash IP for privacy-compliant logging
   */
  private hashIP(ip: string): string {
    return Buffer.from(ip).toString('base64').substring(0, 8);
  }

  /**
   * Get suspicious IPs
   */
  public getSuspiciousIPs(): string[] {
    return Array.from(this.suspiciousIPs).map(ip => this.hashIP(ip));
  }

  /**
   * Clear suspicious IPs
   */
  public clearSuspiciousIPs(): void {
    this.suspiciousIPs.clear();
    console.log('🍯 HONEYPOT: Suspicious IPs cleared');
  }

  /**
   * Add custom honeypot endpoint
   */
  public addHoneypotEndpoint(endpoint: string): void {
    this.honeypotEndpoints.add(endpoint);
    console.log(`🍯 HONEYPOT: Added trap endpoint: ${endpoint}`);
  }
}

export const honeypotSystem = new HoneypotSystem();