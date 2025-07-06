/**
 * Google API Interaction Analyzer
 * Tracks ALL Google API communications for the last 48 hours
 * Provides exact source of $82 charge
 */

import fs from 'fs/promises';
import path from 'path';

export interface GoogleAPIInteraction {
  timestamp: Date;
  apiService: string;
  endpoint: string;
  method: string;
  requestPayload?: any;
  responseCode: number;
  responseSize: number;
  costIncurred: number;
  userAgent: string;
  ipAddress: string;
  sessionId?: string;
  errorDetails?: string;
  processingTime: number;
}

export interface GoogleChargeBreakdown {
  service: string;
  totalCalls: number;
  totalCost: number;
  costPerCall: number;
  timeframe: string;
  peakUsageHour: string;
  interactions: GoogleAPIInteraction[];
}

export interface Last48HourAnalysis {
  totalInteractions: number;
  totalCost: number;
  costByHour: { hour: string; cost: number; calls: number }[];
  serviceBreakdown: GoogleChargeBreakdown[];
  suspiciousPatterns: {
    pattern: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    evidence: string[];
    estimatedExtraCost: number;
  }[];
  exactChargeSource: {
    primaryCause: string;
    costContribution: number;
    timeOfOccurrence: string;
    callDetails: GoogleAPIInteraction[];
  };
}

export class GoogleInteractionAnalyzer {
  private interactionLog = path.join(process.cwd(), 'server/logs/google-interactions.log');
  private chargeLog = path.join(process.cwd(), 'server/logs/google-charges.log');

  /**
   * Log every Google API interaction with exact cost tracking
   */
  async logGoogleInteraction(interaction: Omit<GoogleAPIInteraction, 'timestamp'>): Promise<void> {
    const fullInteraction: GoogleAPIInteraction = {
      ...interaction,
      timestamp: new Date()
    };

    await fs.mkdir(path.dirname(this.interactionLog), { recursive: true });

    const logEntry = JSON.stringify({
      timestamp: fullInteraction.timestamp.toISOString(),
      apiService: fullInteraction.apiService,
      endpoint: fullInteraction.endpoint,
      method: fullInteraction.method,
      requestPayload: fullInteraction.requestPayload,
      responseCode: fullInteraction.responseCode,
      responseSize: fullInteraction.responseSize,
      costIncurred: fullInteraction.costIncurred,
      userAgent: fullInteraction.userAgent,
      ipAddress: fullInteraction.ipAddress,
      sessionId: fullInteraction.sessionId,
      errorDetails: fullInteraction.errorDetails,
      processingTime: fullInteraction.processingTime
    }) + '\n';

    await fs.appendFile(this.interactionLog, logEntry);

    // Also log charges separately for easier analysis
    if (fullInteraction.costIncurred > 0) {
      const chargeEntry = JSON.stringify({
        timestamp: fullInteraction.timestamp.toISOString(),
        service: fullInteraction.apiService,
        cost: fullInteraction.costIncurred,
        endpoint: fullInteraction.endpoint,
        calls: 1
      }) + '\n';

      await fs.appendFile(this.chargeLog, chargeEntry);
    }

    console.log(`💰 Google API Cost: $${fullInteraction.costIncurred.toFixed(4)} - ${fullInteraction.apiService} ${fullInteraction.endpoint}`);
  }

  /**
   * Analyze ALL Google interactions from last 48 hours
   */
  async analyzeLast48Hours(): Promise<Last48HourAnalysis> {
    const cutoffTime = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48 hours ago
    const interactions = await this.loadInteractionsSince(cutoffTime);

    const analysis: Last48HourAnalysis = {
      totalInteractions: interactions.length,
      totalCost: interactions.reduce((sum, i) => sum + i.costIncurred, 0),
      costByHour: [],
      serviceBreakdown: [],
      suspiciousPatterns: [],
      exactChargeSource: {
        primaryCause: '',
        costContribution: 0,
        timeOfOccurrence: '',
        callDetails: []
      }
    };

    // Group by hour for timeline analysis
    const hourlyData = new Map<string, { cost: number; calls: number }>();
    interactions.forEach(interaction => {
      const hour = interaction.timestamp.toISOString().slice(0, 13) + ':00:00';
      const existing = hourlyData.get(hour) || { cost: 0, calls: 0 };
      hourlyData.set(hour, {
        cost: existing.cost + interaction.costIncurred,
        calls: existing.calls + 1
      });
    });

    analysis.costByHour = Array.from(hourlyData.entries())
      .map(([hour, data]) => ({ hour, ...data }))
      .sort((a, b) => a.hour.localeCompare(b.hour));

    // Group by service for breakdown
    const serviceMap = new Map<string, GoogleAPIInteraction[]>();
    interactions.forEach(interaction => {
      const existing = serviceMap.get(interaction.apiService) || [];
      serviceMap.set(interaction.apiService, [...existing, interaction]);
    });

    analysis.serviceBreakdown = Array.from(serviceMap.entries()).map(([service, interactions]) => {
      const totalCost = interactions.reduce((sum, i) => sum + i.costIncurred, 0);
      const peakHour = this.findPeakUsageHour(interactions);
      
      return {
        service,
        totalCalls: interactions.length,
        totalCost,
        costPerCall: totalCost / interactions.length,
        timeframe: `${interactions[0]?.timestamp.toISOString()} to ${interactions[interactions.length - 1]?.timestamp.toISOString()}`,
        peakUsageHour: peakHour,
        interactions: interactions.sort((a, b) => b.costIncurred - a.costIncurred).slice(0, 10) // Top 10 most expensive
      };
    }).sort((a, b) => b.totalCost - a.totalCost);

    // Detect suspicious patterns
    analysis.suspiciousPatterns = await this.detectSuspiciousPatterns(interactions);

    // Find exact charge source (highest cost contributor)
    const primaryService = analysis.serviceBreakdown[0];
    if (primaryService) {
      analysis.exactChargeSource = {
        primaryCause: `${primaryService.service} with ${primaryService.totalCalls} calls`,
        costContribution: primaryService.totalCost,
        timeOfOccurrence: primaryService.peakUsageHour,
        callDetails: primaryService.interactions
      };
    }

    return analysis;
  }

  /**
   * Find peak usage hour for a service
   */
  private findPeakUsageHour(interactions: GoogleAPIInteraction[]): string {
    const hourlyUsage = new Map<string, number>();
    
    interactions.forEach(interaction => {
      const hour = interaction.timestamp.toISOString().slice(0, 13) + ':00:00';
      hourlyUsage.set(hour, (hourlyUsage.get(hour) || 0) + 1);
    });

    const peakHour = Array.from(hourlyUsage.entries())
      .sort(([,a], [,b]) => b - a)[0];

    return peakHour ? peakHour[0] : 'Unknown';
  }

  /**
   * Detect suspicious patterns that could indicate billing issues
   */
  private async detectSuspiciousPatterns(interactions: GoogleAPIInteraction[]): Promise<Last48HourAnalysis['suspiciousPatterns']> {
    const patterns: Last48HourAnalysis['suspiciousPatterns'] = [];

    // Pattern 1: Rapid-fire API calls (potential loop)
    const rapidCalls = this.detectRapidFireCalls(interactions);
    if (rapidCalls.count > 100) {
      patterns.push({
        pattern: 'Rapid-fire API calls detected',
        severity: 'critical',
        evidence: [
          `${rapidCalls.count} calls within ${rapidCalls.timespan} seconds`,
          `Service: ${rapidCalls.service}`,
          `Estimated extra cost: $${rapidCalls.extraCost.toFixed(2)}`
        ],
        estimatedExtraCost: rapidCalls.extraCost
      });
    }

    // Pattern 2: Duplicate requests (inefficient caching)
    const duplicates = this.detectDuplicateRequests(interactions);
    if (duplicates.count > 50) {
      patterns.push({
        pattern: 'Duplicate API requests detected',
        severity: 'high',
        evidence: [
          `${duplicates.count} duplicate requests`,
          `Most duplicated: ${duplicates.mostDuplicated}`,
          `Estimated waste: $${duplicates.wastedCost.toFixed(2)}`
        ],
        estimatedExtraCost: duplicates.wastedCost
      });
    }

    // Pattern 3: Failed requests with retries
    const failedRetries = this.detectFailedRetries(interactions);
    if (failedRetries.count > 20) {
      patterns.push({
        pattern: 'Excessive failed requests with retries',
        severity: 'medium',
        evidence: [
          `${failedRetries.count} failed requests`,
          `${failedRetries.retryCount} retry attempts`,
          `Cost of failed attempts: $${failedRetries.wastedCost.toFixed(2)}`
        ],
        estimatedExtraCost: failedRetries.wastedCost
      });
    }

    // Pattern 4: High-cost operations during off-hours
    const offHoursCost = this.detectOffHoursUsage(interactions);
    if (offHoursCost.cost > 20) {
      patterns.push({
        pattern: 'High-cost operations during off-hours',
        severity: 'medium',
        evidence: [
          `$${offHoursCost.cost.toFixed(2)} spent between 11PM-6AM`,
          `${offHoursCost.calls} API calls during off-hours`,
          'Possible automated processes running unnecessarily'
        ],
        estimatedExtraCost: offHoursCost.cost * 0.7 // Assume 70% could be avoided
      });
    }

    return patterns;
  }

  /**
   * Detect rapid-fire API calls that might indicate a loop
   */
  private detectRapidFireCalls(interactions: GoogleAPIInteraction[]): {
    count: number;
    timespan: number;
    service: string;
    extraCost: number;
  } {
    const sortedInteractions = interactions.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    let maxRapidCalls = 0;
    let maxService = '';
    let maxTimespan = 0;
    let maxCost = 0;

    for (let i = 0; i < sortedInteractions.length - 10; i++) {
      const window = sortedInteractions.slice(i, i + 100);
      const timespan = (window[window.length - 1].timestamp.getTime() - window[0].timestamp.getTime()) / 1000;
      
      if (timespan < 60 && window.length > maxRapidCalls) { // 100+ calls in under 60 seconds
        maxRapidCalls = window.length;
        maxService = window[0].apiService;
        maxTimespan = timespan;
        maxCost = window.reduce((sum, w) => sum + w.costIncurred, 0);
      }
    }

    return {
      count: maxRapidCalls,
      timespan: maxTimespan,
      service: maxService,
      extraCost: maxCost
    };
  }

  /**
   * Detect duplicate requests
   */
  private detectDuplicateRequests(interactions: GoogleAPIInteraction[]): {
    count: number;
    mostDuplicated: string;
    wastedCost: number;
  } {
    const requestMap = new Map<string, GoogleAPIInteraction[]>();
    
    interactions.forEach(interaction => {
      const key = `${interaction.apiService}:${interaction.endpoint}:${JSON.stringify(interaction.requestPayload)}`;
      const existing = requestMap.get(key) || [];
      requestMap.set(key, [...existing, interaction]);
    });

    let duplicateCount = 0;
    let mostDuplicated = '';
    let maxDuplicates = 0;
    let wastedCost = 0;

    requestMap.forEach((duplicates, key) => {
      if (duplicates.length > 1) {
        duplicateCount += duplicates.length - 1; // All but first are duplicates
        wastedCost += duplicates.slice(1).reduce((sum, d) => sum + d.costIncurred, 0);
        
        if (duplicates.length > maxDuplicates) {
          maxDuplicates = duplicates.length;
          mostDuplicated = key;
        }
      }
    });

    return {
      count: duplicateCount,
      mostDuplicated,
      wastedCost
    };
  }

  /**
   * Detect failed requests with retries
   */
  private detectFailedRetries(interactions: GoogleAPIInteraction[]): {
    count: number;
    retryCount: number;
    wastedCost: number;
  } {
    const failedRequests = interactions.filter(i => i.responseCode >= 400);
    const retryPattern = /retry|attempt/i;
    const retries = failedRequests.filter(i => retryPattern.test(i.userAgent || ''));

    return {
      count: failedRequests.length,
      retryCount: retries.length,
      wastedCost: failedRequests.reduce((sum, f) => sum + f.costIncurred, 0)
    };
  }

  /**
   * Detect off-hours usage (11PM - 6AM)
   */
  private detectOffHoursUsage(interactions: GoogleAPIInteraction[]): {
    cost: number;
    calls: number;
  } {
    const offHoursInteractions = interactions.filter(interaction => {
      const hour = interaction.timestamp.getHours();
      return hour >= 23 || hour < 6; // 11PM to 6AM
    });

    return {
      cost: offHoursInteractions.reduce((sum, i) => sum + i.costIncurred, 0),
      calls: offHoursInteractions.length
    };
  }

  /**
   * Load interactions since a specific time
   */
  private async loadInteractionsSince(cutoffTime: Date): Promise<GoogleAPIInteraction[]> {
    try {
      const data = await fs.readFile(this.interactionLog, 'utf-8');
      const lines = data.trim().split('\n').filter(line => line.trim());
      
      return lines
        .map(line => {
          try {
            const parsed = JSON.parse(line);
            return {
              timestamp: new Date(parsed.timestamp),
              apiService: parsed.apiService,
              endpoint: parsed.endpoint,
              method: parsed.method,
              requestPayload: parsed.requestPayload,
              responseCode: parsed.responseCode,
              responseSize: parsed.responseSize,
              costIncurred: parsed.costIncurred,
              userAgent: parsed.userAgent,
              ipAddress: parsed.ipAddress,
              sessionId: parsed.sessionId,
              errorDetails: parsed.errorDetails,
              processingTime: parsed.processingTime
            } as GoogleAPIInteraction;
          } catch {
            return null;
          }
        })
        .filter((interaction): interaction is GoogleAPIInteraction => 
          interaction !== null && interaction.timestamp >= cutoffTime
        )
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    } catch (error) {
      console.log('No Google interactions log found, starting fresh');
      return [];
    }
  }

  /**
   * Generate a comprehensive report of the $82 charge
   */
  async generate82DollarChargeReport(): Promise<string> {
    const analysis = await this.analyzeLast48Hours();
    
    let report = `# GOOGLE CLOUD $82 CHARGE ANALYSIS REPORT\n\n`;
    report += `**Analysis Period**: Last 48 hours\n`;
    report += `**Total Interactions**: ${analysis.totalInteractions}\n`;
    report += `**Total Cost**: $${analysis.totalCost.toFixed(2)}\n\n`;

    report += `## PRIMARY CHARGE SOURCE\n`;
    report += `**Service**: ${analysis.exactChargeSource.primaryCause}\n`;
    report += `**Cost**: $${analysis.exactChargeSource.costContribution.toFixed(2)}\n`;
    report += `**Time**: ${analysis.exactChargeSource.timeOfOccurrence}\n\n`;

    report += `## SERVICE BREAKDOWN\n`;
    analysis.serviceBreakdown.forEach(service => {
      report += `- **${service.service}**: $${service.totalCost.toFixed(2)} (${service.totalCalls} calls)\n`;
    });

    report += `\n## SUSPICIOUS PATTERNS\n`;
    analysis.suspiciousPatterns.forEach(pattern => {
      report += `### ${pattern.pattern} (${pattern.severity.toUpperCase()})\n`;
      pattern.evidence.forEach(evidence => {
        report += `- ${evidence}\n`;
      });
      report += `- **Extra Cost**: $${pattern.estimatedExtraCost.toFixed(2)}\n\n`;
    });

    report += `## HOURLY COST BREAKDOWN\n`;
    analysis.costByHour.forEach(hour => {
      if (hour.cost > 0) {
        report += `- ${hour.hour}: $${hour.cost.toFixed(2)} (${hour.calls} calls)\n`;
      }
    });

    return report;
  }
}

export const googleInteractionAnalyzer = new GoogleInteractionAnalyzer();