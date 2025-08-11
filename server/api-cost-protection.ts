/**
 * API COST PROTECTION SYSTEM
 * PERMANENT SAFEGUARDS AGAINST RUNAWAY API COSTS
 */

export interface ApiUsageTracker {
  totalCalls: number;
  totalCost: number;
  dailyCalls: number;
  dailyCost: number;
  lastReset: Date;
  quotaExceeded: boolean;
  emergencyStop: boolean;
  // New burst detection fields
  recentCalls: { timestamp: Date; count: number; cost: number }[];
  burstDetected: boolean;
  suspiciousPattern: boolean;
}

export interface ApiLimits {
  maxDailyCost: number;
  maxDailyCalls: number;
  maxCostPerOperation: number;
  maxCallsPerOperation: number;
  emergencyStopCost: number;
  // New burst protection limits
  maxCallsPerMinute: number;
  maxCallsPerHour: number;
  maxCostPerMinute: number;
  burstThreshold: number;  // Calls within 10 seconds
}

export class ApiCostProtection {
  private usage: ApiUsageTracker;
  private limits: ApiLimits;
  private logFile: string;

  constructor() {
    this.limits = {
      maxDailyCost: 50.00,           // $50/day maximum
      maxDailyCalls: 1000,           // 1000 calls/day maximum  
      maxCostPerOperation: 5.00,     // $5 per single operation
      maxCallsPerOperation: 50,      // 50 calls per operation
      emergencyStopCost: 75.00,      // Emergency stop at $75
      // New burst protection - CRITICAL for preventing Google API incidents
      maxCallsPerMinute: 60,         // 60 calls/minute maximum
      maxCallsPerHour: 500,          // 500 calls/hour maximum
      maxCostPerMinute: 5.00,        // $5/minute maximum (rapid spend detection)
      burstThreshold: 20             // 20 calls within 10 seconds triggers alert
    };

    this.usage = {
      totalCalls: 0,
      totalCost: 0,
      dailyCalls: 0,
      dailyCost: 0,
      lastReset: new Date(),
      quotaExceeded: false,
      emergencyStop: false,
      recentCalls: [],
      burstDetected: false,
      suspiciousPattern: false
    };

    this.logFile = 'server/logs/api-usage.log';
    this.checkDailyReset();
  }

  /**
   * CRITICAL: Check if operation is allowed before making any API calls
   */
  async checkBeforeOperation(estimatedCalls: number, estimatedCost: number, apiType?: string): Promise<{
    allowed: boolean;
    reason?: string;
    currentUsage: ApiUsageTracker;
  }> {
    this.checkDailyReset();
    const now = new Date();

    // BURST DETECTION - CRITICAL FOR PREVENTING GOOGLE API INCIDENTS
    // Clean up old entries (older than 1 hour)
    this.usage.recentCalls = this.usage.recentCalls.filter(
      call => (now.getTime() - call.timestamp.getTime()) < 3600000
    );

    // Check calls in last 10 seconds (burst detection)
    const tenSecondsAgo = new Date(now.getTime() - 10000);
    const recentBurstCalls = this.usage.recentCalls.filter(
      call => call.timestamp > tenSecondsAgo
    ).reduce((sum, call) => sum + call.count, 0);

    if (recentBurstCalls + estimatedCalls > this.limits.burstThreshold) {
      this.usage.burstDetected = true;
      await this.logCriticalAlert(`BURST DETECTED - ${recentBurstCalls + estimatedCalls} calls in 10 seconds`, recentBurstCalls);
      
      // Send immediate notification for burst detection
      try {
        const { InternalNotificationService } = await import('./services/internal-notifications');
        await InternalNotificationService.sendAdminAlert(
          'API Burst Detected - Potential Cost Overrun',
          `CRITICAL: Detected ${recentBurstCalls + estimatedCalls} API calls within 10 seconds. ` +
          `This pattern resembles the original Google API incident. Emergency stop activated.`,
          'critical'
        );
      } catch (error) {
        console.error('Failed to send burst alert:', error);
      }
      
      return {
        allowed: false,
        reason: `BURST DETECTED: ${recentBurstCalls + estimatedCalls} calls in 10 seconds (max ${this.limits.burstThreshold})`,
        currentUsage: this.usage
      };
    }

    // Check calls in last minute
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    const minuteCalls = this.usage.recentCalls.filter(
      call => call.timestamp > oneMinuteAgo
    ).reduce((sum, call) => sum + call.count, 0);

    if (minuteCalls + estimatedCalls > this.limits.maxCallsPerMinute) {
      await this.logCriticalAlert('MINUTE RATE LIMIT EXCEEDED', minuteCalls + estimatedCalls);
      return {
        allowed: false,
        reason: `Rate limit: ${minuteCalls + estimatedCalls} calls/minute exceeds ${this.limits.maxCallsPerMinute}`,
        currentUsage: this.usage
      };
    }

    // Check cost in last minute (rapid spend detection)
    const minuteCost = this.usage.recentCalls.filter(
      call => call.timestamp > oneMinuteAgo
    ).reduce((sum, call) => sum + call.cost, 0);

    if (minuteCost + estimatedCost > this.limits.maxCostPerMinute) {
      this.usage.suspiciousPattern = true;
      await this.logCriticalAlert('RAPID SPENDING DETECTED', minuteCost + estimatedCost);
      
      // Send immediate notification for rapid spending
      try {
        const { InternalNotificationService } = await import('./services/internal-notifications');
        await InternalNotificationService.sendAdminAlert(
          'Rapid API Spending Detected',
          `WARNING: $${(minuteCost + estimatedCost).toFixed(2)} spent in last minute. ` +
          `Maximum allowed: $${this.limits.maxCostPerMinute}/minute. Operation blocked.`,
          'high'
        );
      } catch (error) {
        console.error('Failed to send spending alert:', error);
      }
      
      return {
        allowed: false,
        reason: `Rapid spending: $${(minuteCost + estimatedCost).toFixed(2)}/minute exceeds $${this.limits.maxCostPerMinute}`,
        currentUsage: this.usage
      };
    }

    // Special protection for expensive APIs (Google Places, etc)
    if (apiType === 'google_places' && estimatedCost > 1.00) {
      await this.logCriticalAlert('GOOGLE PLACES API HIGH COST', estimatedCost);
      return {
        allowed: false,
        reason: `Google Places API blocked: Estimated cost $${estimatedCost} too high`,
        currentUsage: this.usage
      };
    }

    // EMERGENCY STOP - absolute maximum
    if (this.usage.totalCost >= this.limits.emergencyStopCost) {
      this.usage.emergencyStop = true;
      await this.logCriticalAlert('EMERGENCY STOP TRIGGERED', this.usage.totalCost);
      return {
        allowed: false,
        reason: `EMERGENCY STOP: Total cost $${this.usage.totalCost} exceeded $${this.limits.emergencyStopCost}`,
        currentUsage: this.usage
      };
    }

    // Daily cost limit
    if (this.usage.dailyCost + estimatedCost > this.limits.maxDailyCost) {
      await this.logCriticalAlert('DAILY COST LIMIT EXCEEDED', this.usage.dailyCost + estimatedCost);
      return {
        allowed: false,
        reason: `Daily cost limit exceeded: $${this.usage.dailyCost + estimatedCost} > $${this.limits.maxDailyCost}`,
        currentUsage: this.usage
      };
    }

    // Daily calls limit
    if (this.usage.dailyCalls + estimatedCalls > this.limits.maxDailyCalls) {
      await this.logCriticalAlert('DAILY CALLS LIMIT EXCEEDED', this.usage.dailyCalls + estimatedCalls);
      return {
        allowed: false,
        reason: `Daily calls limit exceeded: ${this.usage.dailyCalls + estimatedCalls} > ${this.limits.maxDailyCalls}`,
        currentUsage: this.usage
      };
    }

    // Per-operation limits
    if (estimatedCost > this.limits.maxCostPerOperation) {
      return {
        allowed: false,
        reason: `Operation cost too high: $${estimatedCost} > $${this.limits.maxCostPerOperation}`,
        currentUsage: this.usage
      };
    }

    if (estimatedCalls > this.limits.maxCallsPerOperation) {
      return {
        allowed: false,
        reason: `Operation calls too high: ${estimatedCalls} > ${this.limits.maxCallsPerOperation}`,
        currentUsage: this.usage
      };
    }

    return {
      allowed: true,
      currentUsage: this.usage
    };
  }

  /**
   * Record actual API usage after calls are made
   */
  async recordUsage(actualCalls: number, actualCost: number, operation: string, apiType?: string): Promise<void> {
    const now = new Date();
    
    // Track in recent calls for burst detection
    this.usage.recentCalls.push({
      timestamp: now,
      count: actualCalls,
      cost: actualCost
    });
    
    // Keep only last hour of data
    this.usage.recentCalls = this.usage.recentCalls.filter(
      call => (now.getTime() - call.timestamp.getTime()) < 3600000
    );
    
    this.usage.totalCalls += actualCalls;
    this.usage.totalCost += actualCost;
    this.usage.dailyCalls += actualCalls;
    this.usage.dailyCost += actualCost;

    await this.logUsage(operation, actualCalls, actualCost);

    // Check if we've exceeded limits after the fact
    if (this.usage.dailyCost > this.limits.maxDailyCost || 
        this.usage.totalCost > this.limits.emergencyStopCost) {
      this.usage.quotaExceeded = true;
      await this.logCriticalAlert('QUOTA EXCEEDED AFTER OPERATION', this.usage.dailyCost);
      
      // Send immediate notification
      try {
        const { InternalNotificationService } = await import('./services/internal-notifications');
        await InternalNotificationService.sendAdminAlert(
          'API Quota Exceeded',
          `CRITICAL: API usage exceeded limits. Daily cost: $${this.usage.dailyCost.toFixed(2)}, Total: $${this.usage.totalCost.toFixed(2)}. ` +
          `All API operations blocked until manual reset.`,
          'critical'
        );
      } catch (error) {
        console.error('Failed to send quota alert:', error);
      }
    }
    
    // Detect suspicious patterns
    if (apiType === 'google_places' && actualCost > 0.50) {
      console.warn(`⚠️ High cost Google Places API call: $${actualCost} for ${operation}`);
    }
  }

  /**
   * Get current usage status
   */
  getUsageStatus(): {
    usage: ApiUsageTracker;
    limits: ApiLimits;
    remaining: {
      dailyCost: number;
      dailyCalls: number;
    };
    warnings: string[];
  } {
    const remaining = {
      dailyCost: Math.max(0, this.limits.maxDailyCost - this.usage.dailyCost),
      dailyCalls: Math.max(0, this.limits.maxDailyCalls - this.usage.dailyCalls)
    };

    const warnings = [];
    if (remaining.dailyCost < 10) warnings.push(`Only $${remaining.dailyCost} remaining today`);
    if (remaining.dailyCalls < 100) warnings.push(`Only ${remaining.dailyCalls} calls remaining today`);
    if (this.usage.totalCost > 60) warnings.push(`Total cost $${this.usage.totalCost} approaching emergency stop`);

    return {
      usage: this.usage,
      limits: this.limits,
      remaining,
      warnings
    };
  }

  /**
   * Reset daily counters if it's a new day
   */
  private checkDailyReset(): void {
    const now = new Date();
    const lastReset = new Date(this.usage.lastReset);
    
    if (now.getDate() !== lastReset.getDate() || 
        now.getMonth() !== lastReset.getMonth() || 
        now.getFullYear() !== lastReset.getFullYear()) {
      
      this.usage.dailyCalls = 0;
      this.usage.dailyCost = 0;
      this.usage.quotaExceeded = false;
      this.usage.lastReset = now;
    }
  }

  /**
   * Log critical alerts to file and console
   */
  private async logCriticalAlert(alertType: string, value: number): Promise<void> {
    const alert = `🚨 CRITICAL: ${alertType} - Value: ${value} - Time: ${new Date().toISOString()}`;
    console.error(alert);
    
    try {
      const fs = await import('fs/promises');
      await fs.appendFile(this.logFile, alert + '\n');
    } catch (error) {
      console.error('Failed to log critical alert:', error);
    }
  }

  /**
   * Log normal API usage
   */
  private async logUsage(operation: string, calls: number, cost: number): Promise<void> {
    const logEntry = `${new Date().toISOString()} - ${operation}: ${calls} calls, $${cost.toFixed(4)} - Daily total: ${this.usage.dailyCalls} calls, $${this.usage.dailyCost.toFixed(2)}`;
    
    try {
      const fs = await import('fs/promises');
      await fs.appendFile(this.logFile, logEntry + '\n');
    } catch (error) {
      console.error('Failed to log usage:', error);
    }
  }

  /**
   * Manual emergency stop
   */
  async triggerEmergencyStop(reason: string): Promise<void> {
    this.usage.emergencyStop = true;
    this.usage.quotaExceeded = true;
    await this.logCriticalAlert(`MANUAL EMERGENCY STOP: ${reason}`, this.usage.totalCost);
  }

  /**
   * Reset emergency stop (admin only)
   */
  async resetEmergencyStop(): Promise<void> {
    this.usage.emergencyStop = false;
    await this.logUsage('EMERGENCY_STOP_RESET', 0, 0);
  }
}

export const apiCostProtection = new ApiCostProtection();