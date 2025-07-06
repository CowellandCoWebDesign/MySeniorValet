/**
 * CENTRALIZED API SERVICE
 * Single point of control for all external API calls with comprehensive cost protection
 */

import { apiCostProtection } from './api-cost-protection';
import { emergencyApiDisable } from './emergency-api-disable';
import { dataProtectionService } from './data-protection';

interface ApiCallMetrics {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  estimatedCost: number;
  estimatedCalls: number;
  actualCost: number;
  actualCalls: number;
  success: boolean;
  timestamp: Date;
  source: string;
}

interface ApiServiceConfig {
  maxDailyCost: number;
  maxDailyCalls: number;
  enableLogging: boolean;
  enableCircuitBreaker: boolean;
  circuitBreakerThreshold: number;
}

export class CentralizedApiService {
  private metrics: ApiCallMetrics[] = [];
  private config: ApiServiceConfig = {
    maxDailyCost: 50,
    maxDailyCalls: 1000,
    enableLogging: true,
    enableCircuitBreaker: true,
    circuitBreakerThreshold: 5 // failures before circuit breaks
  };
  private circuitBreakerState: { [key: string]: { failures: number; lastFailure: Date } } = {};

  /**
   * MASTER API CALL HANDLER - All external API calls must go through this
   */
  async makeApiCall<T>(
    config: {
      url: string;
      method: 'GET' | 'POST' | 'PUT' | 'DELETE';
      headers?: Record<string, string>;
      data?: any;
      estimatedCost: number;
      estimatedCalls: number;
      source: string;
      apiProvider: string;
    }
  ): Promise<{ success: boolean; data?: T; error?: string; costIncurred: number }> {
    
    // 1. EMERGENCY API DISABLE CHECK
    emergencyApiDisable.checkApiAccess(config.apiProvider);
    
    // 2. COST PROTECTION CHECK
    const protection = await apiCostProtection.checkBeforeOperation(
      config.estimatedCalls, 
      config.estimatedCost
    );
    
    if (!protection.allowed) {
      this.logApiCall({
        endpoint: config.url,
        method: config.method,
        estimatedCost: config.estimatedCost,
        estimatedCalls: config.estimatedCalls,
        actualCost: 0,
        actualCalls: 0,
        success: false,
        timestamp: new Date(),
        source: config.source
      });
      
      throw new Error(`API call blocked: ${protection.reason}`);
    }
    
    // 3. CIRCUIT BREAKER CHECK
    if (this.isCircuitBroken(config.apiProvider)) {
      throw new Error(`Circuit breaker open for ${config.apiProvider}`);
    }
    
    let actualCost = 0;
    let actualCalls = 0;
    
    try {
      // 4. MAKE THE API CALL
      const response = await fetch(config.url, {
        method: config.method,
        headers: config.headers,
        body: config.data ? JSON.stringify(config.data) : undefined
      });
      
      actualCalls = 1;
      actualCost = config.estimatedCost;
      
      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // 5. RECORD USAGE
      await apiCostProtection.recordUsage(actualCalls, actualCost, config.source);
      
      // 6. LOG SUCCESS
      this.logApiCall({
        endpoint: config.url,
        method: config.method,
        estimatedCost: config.estimatedCost,
        estimatedCalls: config.estimatedCalls,
        actualCost,
        actualCalls,
        success: true,
        timestamp: new Date(),
        source: config.source
      });
      
      // 7. RESET CIRCUIT BREAKER ON SUCCESS
      this.resetCircuitBreaker(config.apiProvider);
      
      return { success: true, data, costIncurred: actualCost };
      
    } catch (error) {
      // 8. HANDLE FAILURE
      this.recordFailure(config.apiProvider);
      
      // 9. RECORD FAILED USAGE
      await apiCostProtection.recordUsage(actualCalls, actualCost, config.source);
      
      // 10. LOG FAILURE
      this.logApiCall({
        endpoint: config.url,
        method: config.method,
        estimatedCost: config.estimatedCost,
        estimatedCalls: config.estimatedCalls,
        actualCost,
        actualCalls,
        success: false,
        timestamp: new Date(),
        source: config.source
      });
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        costIncurred: actualCost
      };
    }
  }

  /**
   * BATCH API CALL HANDLER - For bulk operations with additional protections
   */
  async makeBatchApiCalls<T>(
    configs: Array<{
      url: string;
      method: 'GET' | 'POST' | 'PUT' | 'DELETE';
      headers?: Record<string, string>;
      data?: any;
      estimatedCost: number;
      estimatedCalls: number;
      source: string;
      apiProvider: string;
    }>,
    options: {
      maxConcurrent: number;
      delayBetweenCalls: number;
      maxTotalCost: number;
      stopOnError: boolean;
    }
  ): Promise<Array<{ success: boolean; data?: T; error?: string; costIncurred: number }>> {
    
    // 1. VALIDATE BATCH SIZE
    const totalEstimatedCost = configs.reduce((sum, config) => sum + config.estimatedCost, 0);
    const totalEstimatedCalls = configs.reduce((sum, config) => sum + config.estimatedCalls, 0);
    
    if (totalEstimatedCost > options.maxTotalCost) {
      throw new Error(`Batch operation exceeds cost limit: $${totalEstimatedCost} > $${options.maxTotalCost}`);
    }
    
    // 2. CHECK BATCH PROTECTION
    const protection = await apiCostProtection.checkBeforeOperation(
      totalEstimatedCalls, 
      totalEstimatedCost
    );
    
    if (!protection.allowed) {
      throw new Error(`Batch operation blocked: ${protection.reason}`);
    }
    
    // 3. EXECUTE BATCH WITH CONCURRENCY CONTROL
    const results = [];
    const executing = [];
    
    for (const config of configs) {
      // Wait for delay between calls
      if (results.length > 0) {
        await new Promise(resolve => setTimeout(resolve, options.delayBetweenCalls));
      }
      
      // Control concurrency
      if (executing.length >= options.maxConcurrent) {
        await Promise.race(executing);
      }
      
      const promise = this.makeApiCall<T>(config);
      executing.push(promise);
      
      try {
        const result = await promise;
        results.push(result);
        
        // Remove from executing array
        const index = executing.indexOf(promise);
        if (index > -1) {
          executing.splice(index, 1);
        }
        
        // Stop on error if requested
        if (options.stopOnError && !result.success) {
          console.warn(`Batch operation stopping on error: ${result.error}`);
          break;
        }
        
      } catch (error) {
        results.push({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error',
          costIncurred: 0
        });
        
        if (options.stopOnError) {
          break;
        }
      }
    }
    
    // Wait for any remaining calls
    await Promise.all(executing);
    
    return results;
  }

  /**
   * Circuit breaker implementation
   */
  private isCircuitBroken(apiProvider: string): boolean {
    if (!this.config.enableCircuitBreaker) return false;
    
    const circuit = this.circuitBreakerState[apiProvider];
    if (!circuit) return false;
    
    const timeSinceLastFailure = Date.now() - circuit.lastFailure.getTime();
    const cooldownPeriod = 5 * 60 * 1000; // 5 minutes
    
    // Reset circuit if cooldown period has passed
    if (timeSinceLastFailure > cooldownPeriod) {
      delete this.circuitBreakerState[apiProvider];
      return false;
    }
    
    return circuit.failures >= this.config.circuitBreakerThreshold;
  }

  private recordFailure(apiProvider: string): void {
    if (!this.circuitBreakerState[apiProvider]) {
      this.circuitBreakerState[apiProvider] = { failures: 0, lastFailure: new Date() };
    }
    
    this.circuitBreakerState[apiProvider].failures++;
    this.circuitBreakerState[apiProvider].lastFailure = new Date();
  }

  private resetCircuitBreaker(apiProvider: string): void {
    delete this.circuitBreakerState[apiProvider];
  }

  /**
   * Log API call metrics
   */
  private logApiCall(metrics: ApiCallMetrics): void {
    if (!this.config.enableLogging) return;
    
    this.metrics.push(metrics);
    
    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
    
    // Log to console for monitoring
    console.log(`[API] ${metrics.method} ${metrics.endpoint} - Success: ${metrics.success}, Cost: $${metrics.actualCost}, Calls: ${metrics.actualCalls}`);
  }

  /**
   * Get API usage statistics
   */
  getApiStatistics(): {
    totalCalls: number;
    totalCost: number;
    successRate: number;
    topEndpoints: Array<{ endpoint: string; calls: number; cost: number }>;
    circuitBreakerStatus: { [key: string]: { failures: number; lastFailure: Date } };
  } {
    const totalCalls = this.metrics.reduce((sum, m) => sum + m.actualCalls, 0);
    const totalCost = this.metrics.reduce((sum, m) => sum + m.actualCost, 0);
    const successfulCalls = this.metrics.filter(m => m.success).length;
    const successRate = this.metrics.length > 0 ? (successfulCalls / this.metrics.length) * 100 : 0;
    
    // Group by endpoint
    const endpointStats = this.metrics.reduce((acc, m) => {
      if (!acc[m.endpoint]) {
        acc[m.endpoint] = { endpoint: m.endpoint, calls: 0, cost: 0 };
      }
      acc[m.endpoint].calls += m.actualCalls;
      acc[m.endpoint].cost += m.actualCost;
      return acc;
    }, {} as Record<string, { endpoint: string; calls: number; cost: number }>);
    
    const topEndpoints = Object.values(endpointStats)
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 10);
    
    return {
      totalCalls,
      totalCost,
      successRate,
      topEndpoints,
      circuitBreakerStatus: this.circuitBreakerState
    };
  }
}

export const centralizedApiService = new CentralizedApiService();