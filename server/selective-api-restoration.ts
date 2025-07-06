/**
 * Selective API Restoration System
 * Safely restores essential functionality with strict cost controls
 */

export interface ApiServiceConfig {
  enabled: boolean;
  dailyLimit: number;
  dailyUsage: number;
  lastReset: Date;
  costPerCall: number;
  maxCostPerDay: number;
}

export interface RestoredServices {
  unsplashHeroImages: ApiServiceConfig;
  basicSearch: ApiServiceConfig;
  communityDetails: ApiServiceConfig;
  limitedEnrichment: ApiServiceConfig;
}

export class SelectiveApiRestoration {
  private services: RestoredServices;
  private logFile = 'server/logs/selective-api-usage.log';

  constructor() {
    this.services = {
      // Essential hero images for homepage (very limited)
      unsplashHeroImages: {
        enabled: true,
        dailyLimit: 5, // Only 5 hero image requests per day
        dailyUsage: 0,
        lastReset: new Date(),
        costPerCall: 0.01, // Unsplash is free but tracking anyway
        maxCostPerDay: 0.05
      },
      
      // Basic search functionality (essential)
      basicSearch: {
        enabled: true,
        dailyLimit: 100, // Reasonable search limit
        dailyUsage: 0,
        lastReset: new Date(),
        costPerCall: 0.001,
        maxCostPerDay: 0.10
      },
      
      // Community details for user experience
      communityDetails: {
        enabled: true,
        dailyLimit: 50, // Limited community detail requests
        dailyUsage: 0,
        lastReset: new Date(),
        costPerCall: 0.002,
        maxCostPerDay: 0.10
      },
      
      // Very limited enrichment for critical needs only
      limitedEnrichment: {
        enabled: false, // Disabled by default - must be manually enabled
        dailyLimit: 5,
        dailyUsage: 0,
        lastReset: new Date(),
        costPerCall: 0.007,
        maxCostPerDay: 0.035
      }
    };
  }

  /**
   * Check if a specific service operation is allowed
   */
  async checkServiceAccess(serviceName: keyof RestoredServices, operation: string): Promise<{
    allowed: boolean;
    reason?: string;
    remainingCalls: number;
    remainingBudget: number;
  }> {
    this.resetDailyCountersIfNeeded();
    
    const service = this.services[serviceName];
    
    if (!service.enabled) {
      return {
        allowed: false,
        reason: `${serviceName} is currently disabled`,
        remainingCalls: 0,
        remainingBudget: 0
      };
    }

    const remainingCalls = service.dailyLimit - service.dailyUsage;
    const remainingBudget = service.maxCostPerDay - (service.dailyUsage * service.costPerCall);

    if (remainingCalls <= 0) {
      return {
        allowed: false,
        reason: `Daily limit reached for ${serviceName}`,
        remainingCalls: 0,
        remainingBudget: remainingBudget
      };
    }

    if (remainingBudget < service.costPerCall) {
      return {
        allowed: false,
        reason: `Daily budget exceeded for ${serviceName}`,
        remainingCalls: remainingCalls,
        remainingBudget: 0
      };
    }

    return {
      allowed: true,
      remainingCalls: remainingCalls,
      remainingBudget: remainingBudget
    };
  }

  /**
   * Record usage for a service
   */
  async recordServiceUsage(serviceName: keyof RestoredServices, operation: string, actualCost: number = 0): Promise<void> {
    const service = this.services[serviceName];
    service.dailyUsage++;
    
    await this.logServiceUsage(serviceName, operation, actualCost);
  }

  /**
   * Get current service status
   */
  getServiceStatus(): RestoredServices {
    this.resetDailyCountersIfNeeded();
    return { ...this.services };
  }

  /**
   * Enable a specific service (admin only)
   */
  async enableService(serviceName: keyof RestoredServices, reason: string): Promise<void> {
    this.services[serviceName].enabled = true;
    await this.logServiceUsage(serviceName, `ENABLED: ${reason}`, 0);
  }

  /**
   * Disable a specific service
   */
  async disableService(serviceName: keyof RestoredServices, reason: string): Promise<void> {
    this.services[serviceName].enabled = false;
    await this.logServiceUsage(serviceName, `DISABLED: ${reason}`, 0);
  }

  /**
   * Reset daily counters if it's a new day
   */
  private resetDailyCountersIfNeeded(): void {
    const now = new Date();
    const services = Object.values(this.services);
    
    for (const service of services) {
      if (now.getDate() !== service.lastReset.getDate()) {
        service.dailyUsage = 0;
        service.lastReset = now;
      }
    }
  }

  /**
   * Log service usage for audit trail
   */
  private async logServiceUsage(serviceName: string, operation: string, cost: number): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      service: serviceName,
      operation,
      cost,
      remainingCalls: this.services[serviceName as keyof RestoredServices].dailyLimit - this.services[serviceName as keyof RestoredServices].dailyUsage
    };

    console.log(`📊 API SERVICE: ${serviceName} - ${operation} (Cost: $${cost.toFixed(4)}, Remaining: ${logEntry.remainingCalls})`);
    
    // In a real system, this would write to a log file
    // For now, we'll just use console logging
  }

  /**
   * Get total daily costs across all services
   */
  getTotalDailyCost(): number {
    return Object.values(this.services).reduce((total, service) => {
      return total + (service.dailyUsage * service.costPerCall);
    }, 0);
  }
}

export const selectiveApiRestoration = new SelectiveApiRestoration();