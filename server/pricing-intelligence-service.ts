import { db } from './db';
import { communities, pricingHistory, pricingAlerts } from '../shared/schema';
import { eq, and, desc, gte, sql } from 'drizzle-orm';
import { PerplexityAIService } from './perplexity-ai-service';

interface PricingData {
  basePrice?: number;
  independentLiving?: { min: number; max: number };
  assistedLiving?: { min: number; max: number };
  memoryCare?: { min: number; max: number };
  skilledNursing?: { min: number; max: number };
  confidence: number;
  source: string;
  lastUpdated: Date;
  trend?: 'increasing' | 'stable' | 'decreasing';
  percentChange?: number;
}

export class PricingIntelligenceService {
  private perplexity: PerplexityAIService;

  constructor() {
    this.perplexity = new PerplexityAIService();
  }

  /**
   * Extract pricing by care level from content
   */
  private extractCareLevelPricing(content: string): Partial<PricingData> {
    const result: Partial<PricingData> = {};
    
    // Patterns for different care levels
    const careLevelPatterns = [
      {
        level: 'independentLiving',
        patterns: [
          /independent\s+living[:\s]+\$?([\d,]+)\s*[-–]\s*\$?([\d,]+)/gi,
          /IL[:\s]+\$?([\d,]+)\s*[-–]\s*\$?([\d,]+)/gi,
        ]
      },
      {
        level: 'assistedLiving',
        patterns: [
          /assisted\s+living[:\s]+\$?([\d,]+)\s*[-–]\s*\$?([\d,]+)/gi,
          /AL[:\s]+\$?([\d,]+)\s*[-–]\s*\$?([\d,]+)/gi,
        ]
      },
      {
        level: 'memoryCare',
        patterns: [
          /memory\s+care[:\s]+\$?([\d,]+)\s*[-–]\s*\$?([\d,]+)/gi,
          /dementia\s+care[:\s]+\$?([\d,]+)\s*[-–]\s*\$?([\d,]+)/gi,
          /MC[:\s]+\$?([\d,]+)\s*[-–]\s*\$?([\d,]+)/gi,
        ]
      },
      {
        level: 'skilledNursing',
        patterns: [
          /skilled\s+nursing[:\s]+\$?([\d,]+)\s*[-–]\s*\$?([\d,]+)/gi,
          /nursing\s+home[:\s]+\$?([\d,]+)\s*[-–]\s*\$?([\d,]+)/gi,
          /SNF[:\s]+\$?([\d,]+)\s*[-–]\s*\$?([\d,]+)/gi,
        ]
      }
    ];

    for (const { level, patterns } of careLevelPatterns) {
      for (const pattern of patterns) {
        const match = pattern.exec(content);
        if (match) {
          const min = parseInt(match[1].replace(/,/g, ''));
          const max = parseInt(match[2].replace(/,/g, ''));
          if (!isNaN(min) && !isNaN(max)) {
            (result as any)[level] = { min, max };
            break;
          }
        }
      }
    }

    return result;
  }

  /**
   * Calculate confidence score based on data quality
   */
  private calculateConfidence(data: Partial<PricingData>, source: string): number {
    let confidence = 0;
    
    // Base confidence from source
    const sourceConfidence: Record<string, number> = {
      'official_website': 95,
      'aplaceformom.com': 85,
      'caring.com': 85,
      'seniorliving.org': 80,
      'senioradvisor.com': 80,
      'industry_report': 70,
      'estimate': 50
    };

    confidence = sourceConfidence[source] || 60;

    // Adjust based on data completeness
    let dataPoints = 0;
    if (data.independentLiving) dataPoints++;
    if (data.assistedLiving) dataPoints++;
    if (data.memoryCare) dataPoints++;
    if (data.skilledNursing) dataPoints++;

    // More care levels = higher confidence
    confidence += Math.min(dataPoints * 5, 20);

    // Cap at 100
    return Math.min(confidence, 100);
  }

  /**
   * Get enhanced pricing intelligence for a community
   */
  async getEnhancedPricing(
    communityId: number,
    communityName: string,
    city: string,
    state: string
  ): Promise<PricingData> {
    try {
      // First check for recent cached pricing
      const recentPricing = await this.getRecentPricing(communityId);
      
      // If we have pricing from the last 24 hours with high confidence, use it
      if (recentPricing && recentPricing.confidence >= 80) {
        const hoursSinceUpdate = (Date.now() - new Date(recentPricing.recordedAt).getTime()) / (1000 * 60 * 60);
        if (hoursSinceUpdate < 24) {
          return {
            basePrice: recentPricing.basePrice || undefined,
            independentLiving: recentPricing.independentLiving as any,
            assistedLiving: recentPricing.assistedLiving as any,
            memoryCare: recentPricing.memoryCare as any,
            skilledNursing: recentPricing.skilledNursing as any,
            confidence: recentPricing.confidence,
            source: recentPricing.source,
            lastUpdated: new Date(recentPricing.recordedAt),
            trend: await this.calculateTrend(communityId),
            percentChange: await this.calculatePercentChange(communityId)
          };
        }
      }

      // Otherwise fetch fresh pricing data
      const query = `"${communityName}" ${city} ${state} current pricing rates monthly costs by care level assisted living memory care independent living skilled nursing 2025`;
      
      const response = await this.perplexity.searchRealTime(query);
      
      // Extract care level pricing
      const careLevelPricing = this.extractCareLevelPricing(response.summary);
      
      // Determine source
      const source = response.sources?.[0]?.includes('.com') 
        ? response.sources[0].split('/')[2].replace('www.', '')
        : 'perplexity_search';
      
      // Calculate confidence
      const confidence = this.calculateConfidence(careLevelPricing, source);
      
      // Calculate base price (average of available prices)
      let basePrice: number | undefined;
      const prices: number[] = [];
      
      if (careLevelPricing.independentLiving) {
        prices.push((careLevelPricing.independentLiving.min + careLevelPricing.independentLiving.max) / 2);
      }
      if (careLevelPricing.assistedLiving) {
        prices.push((careLevelPricing.assistedLiving.min + careLevelPricing.assistedLiving.max) / 2);
      }
      if (careLevelPricing.memoryCare) {
        prices.push((careLevelPricing.memoryCare.min + careLevelPricing.memoryCare.max) / 2);
      }
      if (careLevelPricing.skilledNursing) {
        prices.push((careLevelPricing.skilledNursing.min + careLevelPricing.skilledNursing.max) / 2);
      }
      
      if (prices.length > 0) {
        basePrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
      }

      // Store in pricing history
      await this.storePricingHistory(communityId, {
        ...careLevelPricing,
        basePrice,
        confidence,
        source
      });

      return {
        basePrice,
        ...careLevelPricing,
        confidence,
        source,
        lastUpdated: new Date(),
        trend: await this.calculateTrend(communityId),
        percentChange: await this.calculatePercentChange(communityId)
      };
    } catch (error) {
      console.error('Error getting enhanced pricing:', error);
      // Return estimated pricing with low confidence
      return {
        basePrice: 4500,
        assistedLiving: { min: 3500, max: 5500 },
        confidence: 30,
        source: 'estimate',
        lastUpdated: new Date(),
        trend: 'stable'
      };
    }
  }

  /**
   * Store pricing in history for trend analysis
   */
  private async storePricingHistory(
    communityId: number,
    pricing: Partial<PricingData>
  ): Promise<void> {
    try {
      await db.insert(pricingHistory).values({
        communityId,
        basePrice: pricing.basePrice,
        independentLiving: pricing.independentLiving,
        assistedLiving: pricing.assistedLiving,
        memoryCare: pricing.memoryCare,
        skilledNursing: pricing.skilledNursing,
        confidence: pricing.confidence || 50,
        source: pricing.source || 'unknown',
        recordedAt: new Date()
      });
    } catch (error) {
      console.error('Error storing pricing history:', error);
    }
  }

  /**
   * Get recent pricing history
   */
  private async getRecentPricing(communityId: number): Promise<any> {
    try {
      const [recent] = await db
        .select()
        .from(pricingHistory)
        .where(eq(pricingHistory.communityId, communityId))
        .orderBy(desc(pricingHistory.recordedAt))
        .limit(1);
      
      return recent;
    } catch (error) {
      console.error('Error fetching recent pricing:', error);
      return null;
    }
  }

  /**
   * Calculate pricing trend over time
   */
  private async calculateTrend(communityId: number): Promise<'increasing' | 'stable' | 'decreasing'> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const history = await db
        .select()
        .from(pricingHistory)
        .where(
          and(
            eq(pricingHistory.communityId, communityId),
            gte(pricingHistory.recordedAt, thirtyDaysAgo)
          )
        )
        .orderBy(pricingHistory.recordedAt);
      
      if (history.length < 2) return 'stable';
      
      // Compare first and last prices
      const firstPrice = history[0].basePrice || 0;
      const lastPrice = history[history.length - 1].basePrice || 0;
      
      const percentChange = ((lastPrice - firstPrice) / firstPrice) * 100;
      
      if (percentChange > 5) return 'increasing';
      if (percentChange < -5) return 'decreasing';
      return 'stable';
    } catch (error) {
      console.error('Error calculating trend:', error);
      return 'stable';
    }
  }

  /**
   * Calculate percent change in pricing
   */
  private async calculatePercentChange(communityId: number): Promise<number> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const history = await db
        .select()
        .from(pricingHistory)
        .where(
          and(
            eq(pricingHistory.communityId, communityId),
            gte(pricingHistory.recordedAt, thirtyDaysAgo)
          )
        )
        .orderBy(pricingHistory.recordedAt);
      
      if (history.length < 2) return 0;
      
      const firstPrice = history[0].basePrice || 0;
      const lastPrice = history[history.length - 1].basePrice || 0;
      
      if (firstPrice === 0) return 0;
      
      return Math.round(((lastPrice - firstPrice) / firstPrice) * 100);
    } catch (error) {
      console.error('Error calculating percent change:', error);
      return 0;
    }
  }

  /**
   * Check for pricing changes and trigger alerts
   */
  async checkPricingAlerts(userId: number): Promise<void> {
    try {
      // Get user's active pricing alerts
      const alerts = await db
        .select()
        .from(pricingAlerts)
        .where(
          and(
            eq(pricingAlerts.userId, userId),
            eq(pricingAlerts.isActive, true)
          )
        );
      
      for (const alert of alerts) {
        // Get current pricing
        const [community] = await db
          .select()
          .from(communities)
          .where(eq(communities.id, alert.communityId))
          .limit(1);
        
        if (!community) continue;
        
        const pricing = await this.getEnhancedPricing(
          community.id,
          community.name,
          community.city,
          community.state
        );
        
        // Check if price meets alert criteria
        let shouldAlert = false;
        
        if (alert.alertType === 'price_drop' && pricing.percentChange && pricing.percentChange < -5) {
          shouldAlert = true;
        } else if (alert.alertType === 'price_increase' && pricing.percentChange && pricing.percentChange > 5) {
          shouldAlert = true;
        } else if (alert.alertType === 'threshold' && alert.threshold && pricing.basePrice) {
          if (pricing.basePrice <= alert.threshold) {
            shouldAlert = true;
          }
        }
        
        if (shouldAlert) {
          // Update alert as triggered
          await db
            .update(pricingAlerts)
            .set({
              lastTriggered: new Date(),
              triggerCount: sql`${pricingAlerts.triggerCount} + 1`
            })
            .where(eq(pricingAlerts.id, alert.id));
          
          // TODO: Send notification to user
          console.log(`Price alert triggered for user ${userId} on community ${community.name}`);
        }
      }
    } catch (error) {
      console.error('Error checking pricing alerts:', error);
    }
  }
}