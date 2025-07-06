/**
 * COMPREHENSIVE API REQUEST LOGGER
 * Logs all external API calls for monitoring and cost analysis
 */

import fs from 'fs/promises';
import path from 'path';

interface ApiLogEntry {
  timestamp: Date;
  endpoint: string;
  method: string;
  source: string;
  estimatedCost: number;
  actualCost: number;
  success: boolean;
  responseTime: number;
  statusCode?: number;
  errorMessage?: string;
  requestId: string;
}

export class ApiRequestLogger {
  private logDirectory = 'server/logs';
  private logFile = 'api-requests.log';
  private logPath: string;

  constructor() {
    this.logPath = path.join(this.logDirectory, this.logFile);
    this.ensureLogDirectory();
  }

  private async ensureLogDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.logDirectory, { recursive: true });
    } catch (error) {
      console.error('Failed to create log directory:', error);
    }
  }

  /**
   * Log an API request
   */
  async logApiRequest(entry: Omit<ApiLogEntry, 'timestamp' | 'requestId'>): Promise<void> {
    const logEntry: ApiLogEntry = {
      ...entry,
      timestamp: new Date(),
      requestId: this.generateRequestId()
    };

    const logLine = JSON.stringify(logEntry) + '\n';

    try {
      await fs.appendFile(this.logPath, logLine);
      
      // Also log to console for real-time monitoring
      const costColor = entry.actualCost > 0.10 ? '\x1b[31m' : '\x1b[32m'; // Red if expensive, green if cheap
      const statusColor = entry.success ? '\x1b[32m' : '\x1b[31m';
      
      console.log(
        `[API LOG] ${statusColor}${entry.success ? '✓' : '✗'}\x1b[0m ` +
        `${entry.method} ${entry.endpoint} ` +
        `${costColor}$${entry.actualCost.toFixed(3)}\x1b[0m ` +
        `(${entry.responseTime}ms) ` +
        `[${entry.source}]`
      );
      
    } catch (error) {
      console.error('Failed to write API log:', error);
    }
  }

  /**
   * Get API logs from the last N hours
   */
  async getRecentLogs(hours: number = 24): Promise<ApiLogEntry[]> {
    try {
      const logContent = await fs.readFile(this.logPath, 'utf-8');
      const lines = logContent.trim().split('\n').filter(line => line);
      
      const cutoffTime = new Date(Date.now() - (hours * 60 * 60 * 1000));
      
      return lines
        .map(line => {
          try {
            return JSON.parse(line) as ApiLogEntry;
          } catch {
            return null;
          }
        })
        .filter((entry): entry is ApiLogEntry => 
          entry !== null && new Date(entry.timestamp) > cutoffTime
        )
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
    } catch (error) {
      console.warn('Failed to read API logs:', error);
      return [];
    }
  }

  /**
   * Generate analytics from recent logs
   */
  async getAnalytics(hours: number = 24): Promise<{
    totalRequests: number;
    totalCost: number;
    successRate: number;
    averageResponseTime: number;
    costByEndpoint: Record<string, number>;
    requestsBySource: Record<string, number>;
    errorsByEndpoint: Record<string, number>;
    topExpensiveRequests: ApiLogEntry[];
  }> {
    const logs = await this.getRecentLogs(hours);
    
    const analytics = {
      totalRequests: logs.length,
      totalCost: logs.reduce((sum, log) => sum + log.actualCost, 0),
      successRate: logs.length > 0 ? (logs.filter(log => log.success).length / logs.length) * 100 : 0,
      averageResponseTime: logs.length > 0 ? logs.reduce((sum, log) => sum + log.responseTime, 0) / logs.length : 0,
      costByEndpoint: {} as Record<string, number>,
      requestsBySource: {} as Record<string, number>,
      errorsByEndpoint: {} as Record<string, number>,
      topExpensiveRequests: logs
        .filter(log => log.actualCost > 0)
        .sort((a, b) => b.actualCost - a.actualCost)
        .slice(0, 10)
    };

    // Group by endpoint
    logs.forEach(log => {
      const endpoint = log.endpoint;
      analytics.costByEndpoint[endpoint] = (analytics.costByEndpoint[endpoint] || 0) + log.actualCost;
      analytics.requestsBySource[log.source] = (analytics.requestsBySource[log.source] || 0) + 1;
      
      if (!log.success) {
        analytics.errorsByEndpoint[endpoint] = (analytics.errorsByEndpoint[endpoint] || 0) + 1;
      }
    });

    return analytics;
  }

  /**
   * Clean up old log entries
   */
  async cleanupOldLogs(daysToKeep: number = 30): Promise<void> {
    try {
      const logs = await this.getRecentLogs(daysToKeep * 24);
      const filteredContent = logs.map(log => JSON.stringify(log)).join('\n') + '\n';
      
      await fs.writeFile(this.logPath, filteredContent);
      console.log(`Cleaned up API logs, kept ${logs.length} entries from last ${daysToKeep} days`);
      
    } catch (error) {
      console.error('Failed to cleanup old logs:', error);
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const apiRequestLogger = new ApiRequestLogger();