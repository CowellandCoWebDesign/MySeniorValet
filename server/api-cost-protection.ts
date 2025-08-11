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
}

export interface ApiLimits {
  maxDailyCost: number;
  maxDailyCalls: number;
  maxCostPerOperation: number;
  maxCallsPerOperation: number;
  emergencyStopCost: number;
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
      emergencyStopCost: 75.00       // Emergency stop at $75
    };

    this.usage = {
      totalCalls: 0,
      totalCost: 0,
      dailyCalls: 0,
      dailyCost: 0,
      lastReset: new Date(),
      quotaExceeded: false,
      emergencyStop: false
    };

    this.logFile = 'server/logs/api-usage.log';
    this.checkDailyReset();
  }

  /**
   * CRITICAL: Check if operation is allowed before making any API calls
   */
  async checkBeforeOperation(estimatedCalls: number, estimatedCost: number): Promise<{
    allowed: boolean;
    reason?: string;
    currentUsage: ApiUsageTracker;
  }> {
    this.checkDailyReset();

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
  async recordUsage(actualCalls: number, actualCost: number, operation: string): Promise<void> {
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