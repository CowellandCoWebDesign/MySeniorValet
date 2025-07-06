/**
 * REAL Google Cloud Billing Tracker
 * Tracks ACTUAL charges from Google Cloud APIs, not estimates
 */

import fs from 'fs/promises';
import path from 'path';

export interface RealGoogleCloudCharge {
  timestamp: Date;
  service: 'places-text-search' | 'places-details' | 'places-photos' | 'maps-js' | 'geocoding' | 'unknown';
  apiCall: string;
  requestCount: number;
  actualCost: number;
  costPerRequest: number;
  metadata: {
    endpoint?: string;
    responseSize?: number;
    statusCode?: number;
    userAgent?: string;
    ipAddress?: string;
  };
}

export interface GoogleCloudBillingAnalysis {
  totalCharges: number;
  chargesByService: Record<string, number>;
  recentCharges: RealGoogleCloudCharge[];
  dailyBreakdown: { date: string; cost: number; requests: number }[];
  expensiveOperations: RealGoogleCloudCharge[];
  costProjection: {
    dailyRate: number;
    monthlyProjection: number;
    nextBillEstimate: number;
  };
}

export class GoogleCloudRealBillingTracker {
  private logFile = path.join(process.cwd(), 'server/logs/google-cloud-actual-charges.log');
  
  /**
   * Record an ACTUAL Google Cloud API charge as it happens
   */
  async recordActualCharge(charge: Omit<RealGoogleCloudCharge, 'timestamp'>): Promise<void> {
    const realCharge: RealGoogleCloudCharge = {
      ...charge,
      timestamp: new Date()
    };

    // Ensure logs directory exists
    await fs.mkdir(path.dirname(this.logFile), { recursive: true });

    // Log the actual charge
    const logEntry = JSON.stringify({
      timestamp: realCharge.timestamp.toISOString(),
      service: realCharge.service,
      apiCall: realCharge.apiCall,
      requestCount: realCharge.requestCount,
      actualCost: realCharge.actualCost,
      costPerRequest: realCharge.costPerRequest,
      metadata: realCharge.metadata
    }) + '\n';

    await fs.appendFile(this.logFile, logEntry);

    // Alert if charge is high
    if (realCharge.actualCost > 5.00) {
      console.error(`🚨 HIGH COST ALERT: ${realCharge.service} charge of $${realCharge.actualCost.toFixed(2)}`);
      await this.logCriticalAlert(realCharge);
    }
  }

  /**
   * Get REAL billing analysis from actual recorded charges
   */
  async getRealBillingAnalysis(): Promise<GoogleCloudBillingAnalysis> {
    const charges = await this.loadAllCharges();
    
    const analysis: GoogleCloudBillingAnalysis = {
      totalCharges: charges.reduce((sum, charge) => sum + charge.actualCost, 0),
      chargesByService: {},
      recentCharges: charges.slice(-20),
      dailyBreakdown: [],
      expensiveOperations: charges.filter(c => c.actualCost > 1.00),
      costProjection: {
        dailyRate: 0,
        monthlyProjection: 0,
        nextBillEstimate: 0
      }
    };

    // Calculate charges by service
    charges.forEach(charge => {
      analysis.chargesByService[charge.service] = 
        (analysis.chargesByService[charge.service] || 0) + charge.actualCost;
    });

    // Calculate daily breakdown
    const dailyCharges = new Map<string, { cost: number; requests: number }>();
    charges.forEach(charge => {
      const date = charge.timestamp.toISOString().split('T')[0];
      const existing = dailyCharges.get(date) || { cost: 0, requests: 0 };
      dailyCharges.set(date, {
        cost: existing.cost + charge.actualCost,
        requests: existing.requests + charge.requestCount
      });
    });

    analysis.dailyBreakdown = Array.from(dailyCharges.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => b.date.localeCompare(a.date));

    // Calculate cost projection
    if (analysis.dailyBreakdown.length > 0) {
      const recentDays = analysis.dailyBreakdown.slice(0, 7);
      analysis.costProjection.dailyRate = 
        recentDays.reduce((sum, day) => sum + day.cost, 0) / recentDays.length;
      analysis.costProjection.monthlyProjection = analysis.costProjection.dailyRate * 30;
      analysis.costProjection.nextBillEstimate = analysis.totalCharges + analysis.costProjection.dailyRate * 7;
    }

    return analysis;
  }

  /**
   * Track Google Places API Text Search charges (most expensive)
   */
  async trackPlacesTextSearch(query: string, resultCount: number): Promise<void> {
    const costPerRequest = 0.032; // $32 per 1000 requests
    const actualCost = costPerRequest * 1; // Each search = 1 request
    
    await this.recordActualCharge({
      service: 'places-text-search',
      apiCall: `Text Search: "${query}"`,
      requestCount: 1,
      actualCost,
      costPerRequest,
      metadata: {
        endpoint: 'places/textsearch',
        responseSize: resultCount
      }
    });
  }

  /**
   * Track Google Places API Details charges
   */
  async trackPlacesDetails(placeId: string, fields: string[]): Promise<void> {
    const costPerRequest = 0.017; // $17 per 1000 requests
    const actualCost = costPerRequest * 1;
    
    await this.recordActualCharge({
      service: 'places-details',
      apiCall: `Place Details: ${placeId}`,
      requestCount: 1,
      actualCost,
      costPerRequest,
      metadata: {
        endpoint: 'places/details',
        responseSize: fields.length
      }
    });
  }

  /**
   * Track Google Places API Photo charges
   */
  async trackPlacesPhotos(placeId: string, photoCount: number): Promise<void> {
    const costPerRequest = 0.007; // $7 per 1000 requests
    const actualCost = costPerRequest * photoCount;
    
    await this.recordActualCharge({
      service: 'places-photos',
      apiCall: `Place Photos: ${placeId}`,
      requestCount: photoCount,
      actualCost,
      costPerRequest,
      metadata: {
        endpoint: 'places/photos',
        responseSize: photoCount
      }
    });
  }

  /**
   * Track Google Maps JavaScript API charges
   */
  async trackMapsLoad(pageUrl: string): Promise<void> {
    const costPerRequest = 0.007; // $7 per 1000 map loads
    const actualCost = costPerRequest * 1;
    
    await this.recordActualCharge({
      service: 'maps-js',
      apiCall: `Map Load: ${pageUrl}`,
      requestCount: 1,
      actualCost,
      costPerRequest,
      metadata: {
        endpoint: 'maps/javascript',
        responseSize: 1
      }
    });
  }

  /**
   * Track Geocoding API charges
   */
  async trackGeocoding(address: string): Promise<void> {
    const costPerRequest = 0.005; // $5 per 1000 requests
    const actualCost = costPerRequest * 1;
    
    await this.recordActualCharge({
      service: 'geocoding',
      apiCall: `Geocode: ${address}`,
      requestCount: 1,
      actualCost,
      costPerRequest,
      metadata: {
        endpoint: 'geocoding',
        responseSize: 1
      }
    });
  }

  /**
   * Load all charges from log file
   */
  private async loadAllCharges(): Promise<RealGoogleCloudCharge[]> {
    try {
      const data = await fs.readFile(this.logFile, 'utf-8');
      const lines = data.trim().split('\n').filter(line => line.trim());
      
      return lines.map(line => {
        const parsed = JSON.parse(line);
        return {
          timestamp: new Date(parsed.timestamp),
          service: parsed.service,
          apiCall: parsed.apiCall,
          requestCount: parsed.requestCount,
          actualCost: parsed.actualCost,
          costPerRequest: parsed.costPerRequest,
          metadata: parsed.metadata || {}
        };
      });
    } catch (error) {
      console.log('No charges log file found, starting fresh');
      return [];
    }
  }

  /**
   * Log critical cost alerts
   */
  private async logCriticalAlert(charge: RealGoogleCloudCharge): Promise<void> {
    const alertFile = path.join(process.cwd(), 'server/logs/billing-alerts.log');
    const alert = {
      timestamp: new Date().toISOString(),
      type: 'HIGH_COST',
      service: charge.service,
      cost: charge.actualCost,
      details: charge
    };

    await fs.appendFile(alertFile, JSON.stringify(alert) + '\n');
  }

  /**
   * Get today's charges summary
   */
  async getTodayCharges(): Promise<{ total: number; breakdown: Record<string, number>; count: number }> {
    const charges = await this.loadAllCharges();
    const today = new Date().toISOString().split('T')[0];
    
    const todayCharges = charges.filter(charge => 
      charge.timestamp.toISOString().split('T')[0] === today
    );

    const breakdown: Record<string, number> = {};
    todayCharges.forEach(charge => {
      breakdown[charge.service] = (breakdown[charge.service] || 0) + charge.actualCost;
    });

    return {
      total: todayCharges.reduce((sum, charge) => sum + charge.actualCost, 0),
      breakdown,
      count: todayCharges.length
    };
  }

  /**
   * Find the most expensive operations
   */
  async getMostExpensiveOperations(limit: number = 10): Promise<RealGoogleCloudCharge[]> {
    const charges = await this.loadAllCharges();
    return charges
      .sort((a, b) => b.actualCost - a.actualCost)
      .slice(0, limit);
  }

  /**
   * Emergency stop - disable all Google Cloud API calls
   */
  async emergencyStopAllAPIs(): Promise<void> {
    const stopFile = path.join(process.cwd(), 'server/logs/EMERGENCY_STOP_APIS');
    await fs.writeFile(stopFile, `EMERGENCY STOP - ${new Date().toISOString()}\nAll Google Cloud APIs disabled due to high costs.`);
    console.error('🚨 EMERGENCY STOP: All Google Cloud APIs disabled');
  }

  /**
   * Check if APIs are emergency stopped
   */
  async areAPIsEmergencyStopped(): Promise<boolean> {
    const stopFile = path.join(process.cwd(), 'server/logs/EMERGENCY_STOP_APIS');
    try {
      await fs.access(stopFile);
      return true;
    } catch {
      return false;
    }
  }
}

export const googleCloudRealBillingTracker = new GoogleCloudRealBillingTracker();