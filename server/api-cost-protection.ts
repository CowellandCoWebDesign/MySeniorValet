/**
 * API COST PROTECTION SYSTEM
 * COMPREHENSIVE PROTECTION FOR ALL EXTERNAL APIS
 * 
 * Protected APIs:
 * - OpenAI (GPT-4, DALL-E, Whisper)
 * - Anthropic (Claude)
 * - Perplexity (Sonar models)
 * - Google Gemini
 * - Stripe Payment Processing
 * - SendGrid Email
 * - Government APIs (CMS, HUD, State databases)
 * - Any future external API
 */

export type ApiProvider = 
  | 'openai' 
  | 'anthropic' 
  | 'perplexity' 
  | 'gemini'
  | 'stripe' 
  | 'sendgrid' 
  | 'cms_gov'
  | 'hud_gov'
  | 'state_gov'
  | 'google_places' // Removed but kept for reference
  | 'yelp'
  | 'mapbox'
  | 'unknown';

export interface ApiUsageTracker {
  totalCalls: number;
  totalCost: number;
  dailyCalls: number;
  dailyCost: number;
  lastReset: Date;
  quotaExceeded: boolean;
  emergencyStop: boolean;
  // Burst detection fields
  recentCalls: { timestamp: Date; count: number; cost: number; provider: ApiProvider }[];
  burstDetected: boolean;
  suspiciousPattern: boolean;
  // Per-API tracking
  apiUsage: Map<ApiProvider, {
    calls: number;
    cost: number;
    lastCall: Date;
    blocked: boolean;
  }>;
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
  private apiCostModels: Map<ApiProvider, {
    costPerCall: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    maxCallsPerMinute: number;
    description: string;
  }>;

  constructor() {
    this.limits = {
      maxDailyCost: 50.00,           // $50/day maximum
      maxDailyCalls: 1000,           // 1000 calls/day maximum  
      maxCostPerOperation: 5.00,     // $5 per single operation
      maxCallsPerOperation: 50,      // 50 calls per operation
      emergencyStopCost: 75.00,      // Emergency stop at $75
      // Burst protection
      maxCallsPerMinute: 60,         // 60 calls/minute maximum
      maxCallsPerHour: 500,          // 500 calls/hour maximum
      maxCostPerMinute: 5.00,        // $5/minute maximum (rapid spend detection)
      burstThreshold: 20             // 20 calls within 10 seconds triggers alert
    };

    // Initialize API cost models for ALL external APIs
    this.apiCostModels = new Map([
      ['openai', { 
        costPerCall: 0.03, // GPT-4 average
        riskLevel: 'high',
        maxCallsPerMinute: 30,
        description: 'OpenAI GPT-4, DALL-E, Whisper'
      }],
      ['anthropic', { 
        costPerCall: 0.024, // Claude 3 average
        riskLevel: 'high',
        maxCallsPerMinute: 30,
        description: 'Anthropic Claude models'
      }],
      ['perplexity', { 
        costPerCall: 0.002, // Sonar models
        riskLevel: 'medium',
        maxCallsPerMinute: 40,
        description: 'Perplexity search API'
      }],
      ['gemini', { 
        costPerCall: 0.001, // Gemini Pro
        riskLevel: 'medium',
        maxCallsPerMinute: 40,
        description: 'Google Gemini AI'
      }],
      ['stripe', { 
        costPerCall: 0.0, // Transaction fees, not per-call
        riskLevel: 'low',
        maxCallsPerMinute: 20,
        description: 'Stripe payment processing'
      }],
      ['sendgrid', { 
        costPerCall: 0.001, // Email sending
        riskLevel: 'low',
        maxCallsPerMinute: 50,
        description: 'SendGrid email service'
      }],
      ['google_places', { 
        costPerCall: 0.032, // Text search (REMOVED FROM PLATFORM)
        riskLevel: 'critical',
        maxCallsPerMinute: 1, // Effectively disabled
        description: 'Google Places API - REMOVED'
      }],
      ['mapbox', { 
        costPerCall: 0.001, // Map tiles
        riskLevel: 'low',
        maxCallsPerMinute: 100,
        description: 'Mapbox mapping service'
      }],
      ['cms_gov', { 
        costPerCall: 0.0, // Free government API
        riskLevel: 'low',
        maxCallsPerMinute: 60,
        description: 'CMS government data'
      }],
      ['hud_gov', { 
        costPerCall: 0.0, // Free government API
        riskLevel: 'low',
        maxCallsPerMinute: 60,
        description: 'HUD government data'
      }],
      ['state_gov', { 
        costPerCall: 0.0, // Free government API
        riskLevel: 'low',
        maxCallsPerMinute: 60,
        description: 'State government databases'
      }],
      ['yelp', { 
        costPerCall: 0.0, // Free tier
        riskLevel: 'low',
        maxCallsPerMinute: 30,
        description: 'Yelp Fusion API'
      }],
      ['unknown', { 
        costPerCall: 0.05, // Assume high cost for safety
        riskLevel: 'critical',
        maxCallsPerMinute: 10,
        description: 'Unknown external API'
      }]
    ]);

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
      suspiciousPattern: false,
      apiUsage: new Map()
    };

    // Initialize per-API tracking
    for (const [provider] of this.apiCostModels) {
      this.usage.apiUsage.set(provider, {
        calls: 0,
        cost: 0,
        lastCall: new Date(),
        blocked: provider === 'google_places' // Pre-block removed APIs
      });
    }

    this.logFile = 'server/logs/api-usage.log';
    this.checkDailyReset();
  }

  /**
   * CRITICAL: Check if operation is allowed before making any API calls
   * @param estimatedCalls - Number of API calls expected
   * @param estimatedCostOverride - Optional cost override (if not provided, uses model)
   * @param apiProvider - The external API being called
   */
  async checkBeforeOperation(
    estimatedCalls: number, 
    apiProvider: ApiProvider = 'unknown',
    estimatedCostOverride?: number
  ): Promise<{
    allowed: boolean;
    reason?: string;
    currentUsage: ApiUsageTracker;
  }> {
    this.checkDailyReset();
    const now = new Date();
    
    // Get API-specific configuration
    const apiConfig = this.apiCostModels.get(apiProvider) || this.apiCostModels.get('unknown')!;
    const estimatedCost = estimatedCostOverride ?? (estimatedCalls * apiConfig.costPerCall);
    
    // Check if this specific API is blocked
    const apiTracker = this.usage.apiUsage.get(apiProvider);
    if (apiTracker?.blocked) {
      await this.logCriticalAlert(`BLOCKED API CALL ATTEMPT: ${apiProvider}`, estimatedCalls);
      return {
        allowed: false,
        reason: `API ${apiProvider} is permanently blocked (${apiConfig.description})`,
        currentUsage: this.usage
      };
    }
    
    // Special handling for high-risk APIs
    if (apiConfig.riskLevel === 'critical' && estimatedCalls > 5) {
      await this.logCriticalAlert(`HIGH RISK API: ${apiProvider}`, estimatedCalls);
      
      // Send immediate alert for critical APIs
      try {
        const { InternalNotificationService } = await import('./services/internal-notifications');
        await InternalNotificationService.sendAdminAlert(
          `Critical API Access Attempt: ${apiProvider}`,
          `ALERT: Attempted to use ${apiProvider} (${apiConfig.description}) with ${estimatedCalls} calls. ` +
          `Risk level: CRITICAL. Estimated cost: $${estimatedCost.toFixed(2)}`,
          'critical'
        );
      } catch (error) {
        console.error('Failed to send critical API alert:', error);
      }
      
      return {
        allowed: false,
        reason: `Critical risk API ${apiProvider} blocked for safety`,
        currentUsage: this.usage
      };
    }

    // BURST DETECTION - COMPREHENSIVE FOR ALL EXTERNAL APIS
    // Clean up old entries (older than 1 hour)
    this.usage.recentCalls = this.usage.recentCalls.filter(
      call => (now.getTime() - call.timestamp.getTime()) < 3600000
    );

    // Check API-specific burst pattern
    const tenSecondsAgo = new Date(now.getTime() - 10000);
    const recentApiCalls = this.usage.recentCalls.filter(
      call => call.timestamp > tenSecondsAgo && call.provider === apiProvider
    ).reduce((sum, call) => sum + call.count, 0);
    
    // Total burst across all APIs
    const totalRecentBurst = this.usage.recentCalls.filter(
      call => call.timestamp > tenSecondsAgo
    ).reduce((sum, call) => sum + call.count, 0);

    // Check API-specific burst threshold
    if (recentApiCalls + estimatedCalls > Math.min(this.limits.burstThreshold, apiConfig.maxCallsPerMinute / 6)) {
      this.usage.burstDetected = true;
      await this.logCriticalAlert(`API BURST DETECTED - ${apiProvider}: ${recentApiCalls + estimatedCalls} calls`, recentApiCalls);
      
      // Send immediate notification
      try {
        const { InternalNotificationService } = await import('./services/internal-notifications');
        await InternalNotificationService.sendAdminAlert(
          `${apiProvider.toUpperCase()} API Burst Detected`,
          `CRITICAL: ${apiProvider} (${apiConfig.description}) detected ${recentApiCalls + estimatedCalls} calls in 10 seconds. ` +
          `Cost impact: $${(estimatedCost).toFixed(2)}. Emergency stop activated.`,
          'critical'
        );
      } catch (error) {
        console.error('Failed to send burst alert:', error);
      }
      
      return {
        allowed: false,
        reason: `${apiProvider} BURST: ${recentApiCalls + estimatedCalls} calls in 10 seconds`,
        currentUsage: this.usage
      };
    }

    // Check total burst across all APIs
    if (totalRecentBurst + estimatedCalls > this.limits.burstThreshold) {
      this.usage.burstDetected = true;
      await this.logCriticalAlert(`TOTAL BURST DETECTED: ${totalRecentBurst + estimatedCalls} calls across all APIs`, totalRecentBurst);
      
      return {
        allowed: false,
        reason: `TOTAL BURST: ${totalRecentBurst + estimatedCalls} calls in 10 seconds (max ${this.limits.burstThreshold})`,
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

    // API-specific rate limiting
    const apiMinuteCalls = this.usage.recentCalls.filter(
      call => call.timestamp > oneMinuteAgo && call.provider === apiProvider
    ).reduce((sum, call) => sum + call.count, 0);

    if (apiMinuteCalls + estimatedCalls > apiConfig.maxCallsPerMinute) {
      await this.logCriticalAlert(`API RATE LIMIT: ${apiProvider}`, apiMinuteCalls + estimatedCalls);
      return {
        allowed: false,
        reason: `${apiProvider} rate limit: ${apiMinuteCalls + estimatedCalls} calls/minute exceeds ${apiConfig.maxCallsPerMinute}`,
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
   * @param actualCalls - Number of API calls made
   * @param apiProvider - The external API that was called
   * @param operation - Description of the operation
   * @param actualCostOverride - Optional cost override (if not provided, uses model)
   */
  async recordUsage(
    actualCalls: number, 
    apiProvider: ApiProvider = 'unknown',
    operation: string,
    actualCostOverride?: number
  ): Promise<void> {
    const now = new Date();
    
    // Get API configuration and calculate cost
    const apiConfig = this.apiCostModels.get(apiProvider) || this.apiCostModels.get('unknown')!;
    const actualCost = actualCostOverride ?? (actualCalls * apiConfig.costPerCall);
    
    // Track in recent calls for burst detection
    this.usage.recentCalls.push({
      timestamp: now,
      count: actualCalls,
      cost: actualCost,
      provider: apiProvider
    });
    
    // Keep only last hour of data
    this.usage.recentCalls = this.usage.recentCalls.filter(
      call => (now.getTime() - call.timestamp.getTime()) < 3600000
    );
    
    // Update global usage
    this.usage.totalCalls += actualCalls;
    this.usage.totalCost += actualCost;
    this.usage.dailyCalls += actualCalls;
    this.usage.dailyCost += actualCost;
    
    // Update per-API usage
    const apiTracker = this.usage.apiUsage.get(apiProvider);
    if (apiTracker) {
      apiTracker.calls += actualCalls;
      apiTracker.cost += actualCost;
      apiTracker.lastCall = now;
      
      // Auto-block APIs that exceed thresholds
      if (apiConfig.riskLevel === 'critical' && apiTracker.cost > 10.00) {
        apiTracker.blocked = true;
        await this.logCriticalAlert(`AUTO-BLOCKED ${apiProvider}: Total cost exceeded $10`, apiTracker.cost);
        
        // Send notification about auto-block
        try {
          const { InternalNotificationService } = await import('./services/internal-notifications');
          await InternalNotificationService.sendAdminAlert(
            `API Auto-Blocked: ${apiProvider}`,
            `SECURITY: ${apiProvider} (${apiConfig.description}) has been automatically blocked after spending $${apiTracker.cost.toFixed(2)}. ` +
            `Manual review required to re-enable.`,
            'critical'
          );
        } catch (error) {
          console.error('Failed to send auto-block alert:', error);
        }
      }
    }

    await this.logUsage(`${apiProvider}: ${operation}`, actualCalls, actualCost);

    // Check if we've exceeded limits after the fact
    if (this.usage.dailyCost > this.limits.maxDailyCost || 
        this.usage.totalCost > this.limits.emergencyStopCost) {
      this.usage.quotaExceeded = true;
      await this.logCriticalAlert(`QUOTA EXCEEDED: ${apiProvider}`, this.usage.dailyCost);
      
      // Send immediate notification with API details
      try {
        const { InternalNotificationService } = await import('./services/internal-notifications');
        
        // Generate API usage breakdown
        const apiBreakdown = Array.from(this.usage.apiUsage.entries())
          .filter(([_, tracker]) => tracker.calls > 0)
          .map(([provider, tracker]) => `${provider}: $${tracker.cost.toFixed(2)} (${tracker.calls} calls)`)
          .join('\n');
        
        await InternalNotificationService.sendAdminAlert(
          'API Quota Exceeded - All APIs Blocked',
          `CRITICAL: Total API usage exceeded limits.\n` +
          `Daily cost: $${this.usage.dailyCost.toFixed(2)}\n` +
          `Total cost: $${this.usage.totalCost.toFixed(2)}\n\n` +
          `API Breakdown:\n${apiBreakdown}\n\n` +
          `All API operations blocked until manual reset.`,
          'critical'
        );
      } catch (error) {
        console.error('Failed to send quota alert:', error);
      }
    }
    
    // Log warnings for high-cost operations
    if (actualCost > 1.00) {
      console.warn(`⚠️ High cost ${apiProvider} call: $${actualCost.toFixed(2)} for ${operation}`);
    }
    
    // Detect suspicious patterns
    if (apiConfig.riskLevel === 'high' && actualCalls > 10) {
      this.usage.suspiciousPattern = true;
      console.warn(`🚨 Suspicious pattern: ${actualCalls} calls to high-risk API ${apiProvider}`);
    }
  }

  /**
   * Get comprehensive usage status with per-API breakdown
   */
  getUsageStatus(): {
    usage: ApiUsageTracker;
    limits: ApiLimits;
    remaining: {
      dailyCost: number;
      dailyCalls: number;
    };
    warnings: string[];
    perApi: Array<{
      provider: ApiProvider;
      description: string;
      calls: number;
      cost: number;
      riskLevel: string;
      blocked: boolean;
      lastCall?: Date;
    }>;
    alerts: string[];
  } {
    this.checkDailyReset();
    
    const remaining = {
      dailyCost: Math.max(0, this.limits.maxDailyCost - this.usage.dailyCost),
      dailyCalls: Math.max(0, this.limits.maxDailyCalls - this.usage.dailyCalls)
    };

    const warnings = [];
    if (remaining.dailyCost < 10) warnings.push(`Only $${remaining.dailyCost.toFixed(2)} remaining today`);
    if (remaining.dailyCalls < 100) warnings.push(`Only ${remaining.dailyCalls} calls remaining today`);
    if (this.usage.totalCost > 60) warnings.push(`Total cost $${this.usage.totalCost.toFixed(2)} approaching emergency stop`);
    
    const alerts: string[] = [];
    if (this.usage.emergencyStop) alerts.push('EMERGENCY STOP ACTIVE');
    if (this.usage.quotaExceeded) alerts.push('QUOTA EXCEEDED');
    if (this.usage.burstDetected) alerts.push('BURST DETECTED');
    if (this.usage.suspiciousPattern) alerts.push('SUSPICIOUS PATTERN');
    
    const perApi = Array.from(this.usage.apiUsage.entries())
      .map(([provider, tracker]) => {
        const config = this.apiCostModels.get(provider)!;
        return {
          provider,
          description: config.description,
          calls: tracker.calls,
          cost: tracker.cost,
          riskLevel: config.riskLevel,
          blocked: tracker.blocked,
          lastCall: tracker.lastCall
        };
      })
      .filter(api => api.calls > 0 || api.blocked)
      .sort((a, b) => b.cost - a.cost);

    return {
      usage: this.usage,
      limits: this.limits,
      remaining,
      warnings,
      perApi,
      alerts
    };
  }
  
  /**
   * Block a specific API provider
   */
  blockApi(provider: ApiProvider, reason: string) {
    const tracker = this.usage.apiUsage.get(provider);
    if (tracker) {
      tracker.blocked = true;
      console.log(`🚫 API BLOCKED: ${provider} - ${reason}`);
      this.logCriticalAlert(`MANUALLY BLOCKED: ${provider}`, 0).catch(console.error);
    }
  }

  /**
   * Unblock a specific API provider (use with extreme caution)
   */
  unblockApi(provider: ApiProvider) {
    const tracker = this.usage.apiUsage.get(provider);
    if (tracker) {
      tracker.blocked = false;
      console.log(`✅ API UNBLOCKED: ${provider}`);
    }
  }

  /**
   * Generate comprehensive cost report
   */
  async generateCostReport(): Promise<string> {
    const status = this.getUsageStatus();
    const now = new Date();
    
    let report = `\n=== COMPREHENSIVE API COST REPORT - ${now.toISOString()} ===\n\n`;
    report += `GLOBAL STATUS:\n`;
    report += `  Total Cost: $${status.usage.totalCost.toFixed(2)}\n`;
    report += `  Daily Cost: $${status.usage.dailyCost.toFixed(2)} / $${this.limits.maxDailyCost}\n`;
    report += `  Total Calls: ${status.usage.totalCalls}\n`;
    report += `  Daily Calls: ${status.usage.dailyCalls} / ${this.limits.maxDailyCalls}\n`;
    
    if (status.alerts.length > 0) {
      report += `\n⚠️ ACTIVE ALERTS: ${status.alerts.join(', ')}\n`;
    }
    
    report += `\nEXTERNAL API BREAKDOWN:\n`;
    for (const api of status.perApi) {
      const statusIcon = api.blocked ? '🚫' : 
                         api.riskLevel === 'critical' ? '🔴' :
                         api.riskLevel === 'high' ? '🟠' :
                         api.riskLevel === 'medium' ? '🟡' : '🟢';
      
      report += `  ${statusIcon} ${api.provider.toUpperCase()}: $${api.cost.toFixed(2)} (${api.calls} calls)\n`;
      report += `      ${api.description}\n`;
      report += `      Risk Level: ${api.riskLevel.toUpperCase()}\n`;
      if (api.blocked) report += `      ⚠️ STATUS: BLOCKED\n`;
      if (api.lastCall) report += `      Last Call: ${api.lastCall.toISOString()}\n`;
    }
    
    report += `\nPROTECTION LIMITS:\n`;
    report += `  Daily: $${this.limits.maxDailyCost} / ${this.limits.maxDailyCalls} calls\n`;
    report += `  Per Operation: $${this.limits.maxCostPerOperation} / ${this.limits.maxCallsPerOperation} calls\n`;
    report += `  Emergency Stop: $${this.limits.emergencyStopCost}\n`;
    report += `  Burst Protection: ${this.limits.burstThreshold} calls/10sec\n`;
    report += `  Per-Minute Limit: ${this.limits.maxCallsPerMinute} calls\n`;
    
    if (status.warnings.length > 0) {
      report += `\n⚠️ WARNINGS:\n`;
      status.warnings.forEach(w => report += `  - ${w}\n`);
    }
    
    report += `\n=== END REPORT ===\n`;
    
    return report;
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
   * Manual emergency stop - blocks all high-risk APIs
   */
  async triggerEmergencyStop(reason: string): Promise<void> {
    this.usage.emergencyStop = true;
    this.usage.quotaExceeded = true;
    
    // Auto-block all critical and high-risk APIs
    let blockedApis: string[] = [];
    for (const [provider, config] of this.apiCostModels) {
      if (config.riskLevel === 'critical' || config.riskLevel === 'high') {
        this.blockApi(provider, 'Emergency stop');
        blockedApis.push(provider);
      }
    }
    
    await this.logCriticalAlert(`MANUAL EMERGENCY STOP: ${reason}`, this.usage.totalCost);
    
    // Send comprehensive notification
    try {
      const report = await this.generateCostReport();
      const { InternalNotificationService } = await import('./services/internal-notifications');
      await InternalNotificationService.sendAdminAlert(
        'EMERGENCY STOP ACTIVATED - ALL HIGH-RISK APIS BLOCKED',
        `CRITICAL: Emergency stop manually triggered.\n` +
        `Reason: ${reason}\n` +
        `Total Cost at Stop: $${this.usage.totalCost.toFixed(2)}\n` +
        `Blocked APIs: ${blockedApis.join(', ')}\n\n` +
        `${report}`,
        'critical'
      );
    } catch (error) {
      console.error('Failed to send emergency stop alert:', error);
    }
  }

  /**
   * Reset emergency stop (admin only - critical APIs remain blocked)
   */
  async resetEmergencyStop(): Promise<void> {
    this.usage.emergencyStop = false;
    this.usage.burstDetected = false;
    this.usage.suspiciousPattern = false;
    
    // Don't auto-unblock critical risk APIs
    console.log('⚠️ Emergency stop reset - Quotas re-enabled');
    console.log('⚠️ Critical risk APIs remain blocked - manual unblock required');
    
    await this.logUsage('EMERGENCY_STOP_RESET', 0, 0);
  }
}

// Singleton instance for comprehensive external API protection
export const apiCostProtection = new ApiCostProtection();