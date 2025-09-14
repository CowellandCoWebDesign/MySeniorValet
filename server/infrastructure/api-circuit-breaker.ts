/**
 * API Circuit Breaker Implementation
 * 
 * Provides resilience for external API calls with automatic fallback
 * and recovery mechanisms for Perplexity and Claude
 */

import CircuitBreaker from 'opossum';
import pRetry from 'p-retry';

interface CircuitBreakerOptions {
  timeout?: number;
  errorThresholdPercentage?: number;
  resetTimeout?: number;
  volumeThreshold?: number;
  name: string;
}

interface CommunityVerificationResult {
  found: boolean;
  name: string;
  officialWebsite?: string;
  phone?: string;
  address?: string;
  pricing?: any;
  sources: string[];
  verifiedBy: 'perplexity' | 'claude' | 'cache' | 'fallback';
}

export class APICircuitBreaker {
  private breakers: Map<string, CircuitBreaker>;
  private metrics: Map<string, {
    calls: number;
    failures: number;
    successes: number;
    lastFailure?: Date;
    lastSuccess?: Date;
  }>;
  
  constructor() {
    this.breakers = new Map();
    this.metrics = new Map();
    this.initializeBreakers();
  }
  
  private initializeBreakers() {
    // Perplexity AI Circuit Breaker (Primary)
    const perplexityBreaker = new CircuitBreaker(
      async (communityName: string, location: string) => {
        return await this.callPerplexityWithRetry(communityName, location);
      },
      {
        timeout: 30000, // 30 seconds
        errorThresholdPercentage: 50, // Open after 50% failures
        resetTimeout: 30000, // Try again after 30 seconds
        volumeThreshold: 10, // Minimum 10 requests before opening
        name: 'PerplexityAI'
      }
    );
    
    this.breakers.set('perplexity', perplexityBreaker);
    
    // Claude AI Circuit Breaker (Secondary)
    const claudeBreaker = new CircuitBreaker(
      async (communityName: string, location: string) => {
        return await this.callClaudeWithRetry(communityName, location);
      },
      {
        timeout: 25000,
        errorThresholdPercentage: 60,
        resetTimeout: 20000,
        volumeThreshold: 5,
        name: 'ClaudeAI'
      }
    );
    
    this.breakers.set('claude', claudeBreaker);
    
    // Setup monitoring for all breakers
    this.setupMonitoring();
  }
  
  private setupMonitoring() {
    for (const [name, breaker] of this.breakers) {
      // Initialize metrics
      this.metrics.set(name, {
        calls: 0,
        failures: 0,
        successes: 0
      });
      
      // Monitor circuit events
      breaker.on('open', () => {
        console.log(`🔴 Circuit breaker OPEN for ${name} - Service unavailable`);
        this.logMetric(name, 'circuit_open');
        this.notifyAdmins(`${name} circuit breaker opened - switching to fallback`, 'error');
      });
      
      breaker.on('halfOpen', () => {
        console.log(`🟡 Circuit breaker HALF-OPEN for ${name} - Testing recovery`);
        this.logMetric(name, 'circuit_half_open');
      });
      
      breaker.on('close', () => {
        console.log(`🟢 Circuit breaker CLOSED for ${name} - Service recovered`);
        this.logMetric(name, 'circuit_closed');
        this.notifyAdmins(`${name} service recovered - circuit closed`, 'info');
      });
      
      breaker.on('success', () => {
        const metric = this.metrics.get(name)!;
        metric.successes++;
        metric.lastSuccess = new Date();
        metric.calls++;
      });
      
      breaker.on('failure', () => {
        const metric = this.metrics.get(name)!;
        metric.failures++;
        metric.lastFailure = new Date();
        metric.calls++;
      });
      
      breaker.on('timeout', () => {
        console.log(`⏱️ Timeout for ${name} - Request took too long`);
        this.logMetric(name, 'timeout');
      });
      
      breaker.on('reject', () => {
        console.log(`🚫 Request rejected by ${name} circuit breaker`);
        this.logMetric(name, 'rejected');
      });
    }
  }
  
  /**
   * Main verification method with automatic fallback chain
   */
  async verifyCommunitySafe(
    communityName: string, 
    location: string
  ): Promise<CommunityVerificationResult> {
    console.log(`\n🔍 Starting resilient verification for: ${communityName} in ${location}`);
    
    // Try primary (Perplexity)
    try {
      const perplexityBreaker = this.breakers.get('perplexity')!;
      const result = await perplexityBreaker.fire(communityName, location);
      console.log(`✅ Perplexity verification successful`);
      return { ...result, verifiedBy: 'perplexity' };
    } catch (perplexityError: any) {
      console.log(`⚠️ Perplexity failed: ${perplexityError.message}`);
      
      // Try secondary (Claude)
      try {
        const claudeBreaker = this.breakers.get('claude')!;
        const result = await claudeBreaker.fire(communityName, location);
        console.log(`✅ Claude verification successful (fallback)`);
        return { ...result, verifiedBy: 'claude' };
      } catch (claudeError: any) {
        console.log(`❌ All AI services failed: ${claudeError.message}`);
        
        // Return cached or degraded response
        return this.getCachedOrDegradedResponse(communityName, location);
      }
    }
  }
  
  /**
   * Perplexity API call with retry logic
   */
  private async callPerplexityWithRetry(
    communityName: string, 
    location: string
  ): Promise<CommunityVerificationResult> {
    return await pRetry(
      async () => {
        // Import the existing Perplexity service
        const { SimplifiedPerplexityService } = await import('../simplified-perplexity-service');
        const service = new SimplifiedPerplexityService();
        const result = await service.getCommunityIntelligence(communityName, location);
        
        if (!result.found) {
          throw new Error('Community not found');
        }
        
        return result as CommunityVerificationResult;
      },
      {
        retries: 3,
        factor: 2, // Exponential backoff factor
        minTimeout: 1000, // Start with 1 second
        maxTimeout: 10000, // Max 10 seconds between retries
        onFailedAttempt: (error) => {
          console.log(`  Retry ${error.attemptNumber}/3 for Perplexity...`);
        }
      }
    );
  }
  
  /**
   * Claude API call with retry logic (placeholder - implement when Claude is integrated)
   */
  private async callClaudeWithRetry(
    communityName: string, 
    location: string
  ): Promise<CommunityVerificationResult> {
    return await pRetry(
      async () => {
        // TODO: Implement Claude API call
        // For now, throw to simulate unavailability
        throw new Error('Claude integration not yet implemented');
      },
      {
        retries: 2,
        factor: 2,
        minTimeout: 1000,
        maxTimeout: 5000
      }
    );
  }
  
  /**
   * Get cached or degraded response when all services fail
   */
  private async getCachedOrDegradedResponse(
    communityName: string,
    location: string
  ): Promise<CommunityVerificationResult> {
    // TODO: Check Redis cache for previous successful verification
    
    // Return degraded response
    return {
      found: false,
      name: communityName,
      sources: [],
      verifiedBy: 'fallback' as const,
      officialWebsite: undefined,
      phone: undefined,
      address: `${location} (Unable to verify - all services temporarily unavailable)`,
      pricing: {
        details: 'Contact for pricing - verification services temporarily unavailable'
      }
    };
  }
  
  /**
   * Get circuit breaker health status
   */
  getHealthStatus() {
    const status: any = {};
    
    for (const [name, breaker] of this.breakers) {
      const metric = this.metrics.get(name)!;
      const stats = breaker.stats;
      
      status[name] = {
        state: breaker.opened ? 'OPEN' : breaker.halfOpen ? 'HALF_OPEN' : 'CLOSED',
        enabled: breaker.enabled,
        metrics: {
          totalCalls: metric.calls,
          successes: metric.successes,
          failures: metric.failures,
          successRate: metric.calls > 0 
            ? ((metric.successes / metric.calls) * 100).toFixed(2) + '%'
            : 'N/A',
          lastSuccess: metric.lastSuccess?.toISOString() || 'Never',
          lastFailure: metric.lastFailure?.toISOString() || 'Never'
        },
        stats: {
          requestVolume: stats.requestVolume,
          errorPercentage: stats.errorPercentage,
          latencyMean: stats.latencyTimes ? stats.latencyTimes.mean : 0
        }
      };
    }
    
    return status;
  }
  
  /**
   * Force reset a specific circuit breaker
   */
  resetCircuit(serviceName: string) {
    const breaker = this.breakers.get(serviceName);
    if (breaker) {
      breaker.close();
      console.log(`🔄 Manually reset ${serviceName} circuit breaker`);
    }
  }
  
  /**
   * Disable/Enable a specific service
   */
  toggleService(serviceName: string, enabled: boolean) {
    const breaker = this.breakers.get(serviceName);
    if (breaker) {
      if (enabled) {
        breaker.enable();
        console.log(`✅ Enabled ${serviceName} service`);
      } else {
        breaker.disable();
        console.log(`🚫 Disabled ${serviceName} service`);
      }
    }
  }
  
  private logMetric(service: string, event: string) {
    // TODO: Send to monitoring service (Datadog, CloudWatch, etc.)
    const timestamp = new Date().toISOString();
    console.log(`📊 [${timestamp}] ${service}: ${event}`);
  }
  
  private notifyAdmins(message: string, level: 'info' | 'warning' | 'error') {
    // TODO: Integrate with notification system
    console.log(`📧 Admin notification (${level}): ${message}`);
  }
}

// Export singleton instance
export const apiCircuitBreaker = new APICircuitBreaker();