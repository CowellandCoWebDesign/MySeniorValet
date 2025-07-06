/**
 * REAL API COST TRACKER
 * Tracks actual Google Places API costs and integrates with protection system
 */

import fs from 'fs/promises';
import path from 'path';

interface RealApiCall {
  timestamp: Date;
  endpoint: string;
  cost: number;
  calls: number;
  operation: string;
  success: boolean;
  response?: any;
}

interface DailyUsage {
  date: string;
  totalCalls: number;
  totalCost: number;
  operations: {
    textSearch: { calls: number; cost: number };
    placeDetails: { calls: number; cost: number };
    placePhotos: { calls: number; cost: number };
  };
}

export class RealApiCostTracker {
  private logFile: string;
  private usageFile: string;
  private currentDailyUsage: DailyUsage;

  constructor() {
    this.logFile = path.join(process.cwd(), 'server/logs/real-api-costs.log');
    this.usageFile = path.join(process.cwd(), 'server/logs/daily-usage.json');
    this.currentDailyUsage = this.initializeDailyUsage();
    this.ensureLogDirectory();
  }

  private initializeDailyUsage(): DailyUsage {
    return {
      date: new Date().toISOString().split('T')[0],
      totalCalls: 0,
      totalCost: 0,
      operations: {
        textSearch: { calls: 0, cost: 0 },
        placeDetails: { calls: 0, cost: 0 },
        placePhotos: { calls: 0, cost: 0 }
      }
    };
  }

  private async ensureLogDirectory(): Promise<void> {
    const logDir = path.dirname(this.logFile);
    try {
      await fs.mkdir(logDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create log directory:', error);
    }
  }

  /**
   * Track a real Google Places API call
   */
  async trackApiCall(
    endpoint: 'textSearch' | 'placeDetails' | 'placePhotos',
    calls: number,
    cost: number,
    operation: string,
    success: boolean,
    response?: any
  ): Promise<void> {
    const apiCall: RealApiCall = {
      timestamp: new Date(),
      endpoint,
      cost,
      calls,
      operation,
      success,
      response: response ? { status: response.status, results_count: response.results?.length || 0 } : undefined
    };

    // Update daily usage
    this.currentDailyUsage.totalCalls += calls;
    this.currentDailyUsage.totalCost += cost;
    this.currentDailyUsage.operations[endpoint].calls += calls;
    this.currentDailyUsage.operations[endpoint].cost += cost;

    // Log the call
    await this.logApiCall(apiCall);
    
    // Save daily usage
    await this.saveDailyUsage();

    // Log critical costs
    if (cost > 1.0) {
      console.warn(`🚨 HIGH COST API CALL: ${endpoint} cost $${cost.toFixed(2)} for ${operation}`);
    }
  }

  private async logApiCall(apiCall: RealApiCall): Promise<void> {
    const logEntry = {
      timestamp: apiCall.timestamp.toISOString(),
      endpoint: apiCall.endpoint,
      cost: apiCall.cost,
      calls: apiCall.calls,
      operation: apiCall.operation,
      success: apiCall.success,
      response: apiCall.response
    };

    try {
      await fs.appendFile(this.logFile, JSON.stringify(logEntry) + '\n');
    } catch (error) {
      console.error('Failed to log API call:', error);
    }
  }

  private async saveDailyUsage(): Promise<void> {
    try {
      await fs.writeFile(this.usageFile, JSON.stringify(this.currentDailyUsage, null, 2));
    } catch (error) {
      console.error('Failed to save daily usage:', error);
    }
  }

  /**
   * Get current daily usage
   */
  async getDailyUsage(): Promise<DailyUsage> {
    try {
      const data = await fs.readFile(this.usageFile, 'utf8');
      const usage = JSON.parse(data);
      
      // Check if it's a new day
      const today = new Date().toISOString().split('T')[0];
      if (usage.date !== today) {
        this.currentDailyUsage = this.initializeDailyUsage();
        await this.saveDailyUsage();
        return this.currentDailyUsage;
      }
      
      this.currentDailyUsage = usage;
      return usage;
    } catch (error) {
      // File doesn't exist or is corrupted, return current usage
      return this.currentDailyUsage;
    }
  }

  /**
   * Get real-time API cost analytics
   */
  async getRealUsageAnalytics(): Promise<{
    today: DailyUsage;
    totalCost: number;
    totalCalls: number;
    breakdown: {
      textSearch: { calls: number; cost: number; percentage: number };
      placeDetails: { calls: number; cost: number; percentage: number };
      placePhotos: { calls: number; cost: number; percentage: number };
    };
    lastUpdated: Date;
  }> {
    const dailyUsage = await this.getDailyUsage();
    
    const breakdown = {
      textSearch: {
        calls: dailyUsage.operations.textSearch.calls,
        cost: dailyUsage.operations.textSearch.cost,
        percentage: dailyUsage.totalCalls > 0 ? (dailyUsage.operations.textSearch.calls / dailyUsage.totalCalls) * 100 : 0
      },
      placeDetails: {
        calls: dailyUsage.operations.placeDetails.calls,
        cost: dailyUsage.operations.placeDetails.cost,
        percentage: dailyUsage.totalCalls > 0 ? (dailyUsage.operations.placeDetails.calls / dailyUsage.totalCalls) * 100 : 0
      },
      placePhotos: {
        calls: dailyUsage.operations.placePhotos.calls,
        cost: dailyUsage.operations.placePhotos.cost,
        percentage: dailyUsage.totalCalls > 0 ? (dailyUsage.operations.placePhotos.calls / dailyUsage.totalCalls) * 100 : 0
      }
    };

    return {
      today: dailyUsage,
      totalCost: dailyUsage.totalCost,
      totalCalls: dailyUsage.totalCalls,
      breakdown,
      lastUpdated: new Date()
    };
  }

  /**
   * Get recent API call logs
   */
  async getRecentApiCalls(hours: number = 24): Promise<RealApiCall[]> {
    try {
      const data = await fs.readFile(this.logFile, 'utf8');
      const lines = data.trim().split('\n').filter(line => line.trim());
      
      const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
      
      return lines
        .map(line => {
          try {
            const parsed = JSON.parse(line);
            return {
              timestamp: new Date(parsed.timestamp),
              endpoint: parsed.endpoint,
              cost: parsed.cost,
              calls: parsed.calls,
              operation: parsed.operation,
              success: parsed.success,
              response: parsed.response
            } as RealApiCall;
          } catch {
            return null;
          }
        })
        .filter((call): call is RealApiCall => call !== null && call.timestamp >= cutoffTime)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      console.error('Failed to read API call logs:', error);
      return [];
    }
  }

  /**
   * Reset daily usage (for testing or new day)
   */
  async resetDailyUsage(): Promise<void> {
    this.currentDailyUsage = this.initializeDailyUsage();
    await this.saveDailyUsage();
  }
}

export const realApiCostTracker = new RealApiCostTracker();