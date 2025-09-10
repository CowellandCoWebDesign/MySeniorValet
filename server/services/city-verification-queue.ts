/**
 * City Verification Queue System
 * Manages systematic city-by-city verification of communities using Perplexity AI
 */

import { db } from '../db';
import { eq, and, or, isNull, sql, desc, asc } from 'drizzle-orm';
import { communities } from '../../shared/schema';
import { SimplifiedPerplexityService } from '../simplified-perplexity-service';
import { apiCircuitBreaker } from '../infrastructure/api-circuit-breaker';

interface CityVerificationTarget {
  state: string;
  city: string;
  communityCount: number;
  unverifiedCount: number;
  priority: number;
  reason: string;
}

interface VerificationResult {
  city: string;
  state: string;
  totalCommunities: number;
  successfulVerifications: number;
  failedVerifications: number;
  skipped: number;
  errors: string[];
  startTime: Date;
  endTime: Date;
  duration: number;
}

export class CityVerificationQueue {
  private perplexityService: SimplifiedPerplexityService;
  private isProcessing: boolean = false;
  private currentCity: string | null = null;
  
  constructor() {
    this.perplexityService = new SimplifiedPerplexityService();
  }
  
  /**
   * Get priority cities for verification based on multiple factors
   */
  async getPriorityCities(limit: number = 10): Promise<CityVerificationTarget[]> {
    console.log('🎯 Identifying priority cities for verification...');
    
    // Get cities with most unverified communities
    const citiesData = await db
      .select({
        state: communities.state,
        city: communities.city,
        totalCount: sql<number>`COUNT(*)`,
        unverifiedCount: sql<number>`COUNT(CASE WHEN verification_status IS NULL OR verification_status = '' THEN 1 END)`,
      })
      .from(communities)
      .where(and(
        sql`${communities.city} IS NOT NULL`,
        sql`${communities.state} IS NOT NULL`,
        sql`${communities.state} NOT IN ('ON', 'QC', 'BC', 'AB', 'SK', 'NS', 'MB', 'NB', 'NL', 'PE', 'NT', 'YT', 'NU')` // Exclude Canadian provinces
      ))
      .groupBy(communities.state, communities.city)
      .having(sql`COUNT(CASE WHEN verification_status IS NULL OR verification_status = '' THEN 1 END) > 0`)
      .orderBy(desc(sql`COUNT(*)`))
      .limit(limit * 2); // Get more to apply priority scoring
    
    // Score and prioritize cities
    const prioritizedCities: CityVerificationTarget[] = citiesData.map(city => {
      let priority = 100;
      let reasons: string[] = [];
      
      // High population metro areas get priority
      const majorMetros = ['Phoenix', 'Houston', 'Chicago', 'Los Angeles', 'Miami', 'Atlanta', 'Dallas', 'Seattle', 'Boston', 'Denver'];
      if (majorMetros.includes(city.city)) {
        priority += 50;
        reasons.push('Major metro area');
      }
      
      // States with high senior populations
      const seniorStates = ['FL', 'AZ', 'CA', 'TX', 'PA', 'OH', 'NC', 'SC'];
      if (seniorStates.includes(city.state)) {
        priority += 30;
        reasons.push('High senior population state');
      }
      
      // More communities = higher priority
      priority += Math.min(city.totalCount, 100); // Cap at 100 points for size
      if (city.totalCount > 50) {
        reasons.push(`${city.totalCount} communities`);
      }
      
      // Higher percentage unverified = higher priority
      const unverifiedPercentage = (city.unverifiedCount / city.totalCount) * 100;
      if (unverifiedPercentage > 80) {
        priority += 40;
        reasons.push(`${Math.round(unverifiedPercentage)}% unverified`);
      }
      
      return {
        state: city.state,
        city: city.city,
        communityCount: city.totalCount,
        unverifiedCount: city.unverifiedCount,
        priority,
        reason: reasons.join(', ') || 'Standard verification'
      };
    });
    
    // Sort by priority and return top cities
    return prioritizedCities
      .sort((a, b) => b.priority - a.priority)
      .slice(0, limit);
  }
  
  /**
   * Verify all communities in a specific city
   */
  async verifyCity(city: string, state: string): Promise<VerificationResult> {
    const startTime = new Date();
    const result: VerificationResult = {
      city,
      state,
      totalCommunities: 0,
      successfulVerifications: 0,
      failedVerifications: 0,
      skipped: 0,
      errors: [],
      startTime,
      endTime: new Date(),
      duration: 0
    };
    
    console.log(`\n📍 Starting verification for ${city}, ${state}`);
    this.currentCity = `${city}, ${state}`;
    
    try {
      // Get all communities in this city
      const cityCommun        ities = await db
        .select()
        .from(communities)
        .where(and(
          eq(communities.city, city),
          eq(communities.state, state)
        ));
      
      result.totalCommunities = cityCommunities.length;
      console.log(`  Found ${cityCommunities.length} communities to verify`);
      
      // Process each community
      for (const community of cityCommunities) {
        // Skip if already verified
        if (community.verification_status === 'verified') {
          result.skipped++;
          continue;
        }
        
        try {
          console.log(`  🔍 Verifying: ${community.name}`);
          
          // Use circuit breaker for resilient API calls
          const verificationData = await apiCircuitBreaker.verifyCommunitySafe(
            community.name,
            `${community.city}, ${community.state}`
          );
          
          // Update community with verification results
          if (verificationData.found) {
            await db
              .update(communities)
              .set({
                verification_status: 'verified',
                website: verificationData.officialWebsite || community.website,
                phone: verificationData.phone || community.phone,
                address: verificationData.address || community.address,
                assisted_living_pricing: verificationData.pricing?.assistedLiving || community.assisted_living_pricing,
                memory_care_pricing: verificationData.pricing?.memoryCare || community.memory_care_pricing,
                independent_living_pricing: verificationData.pricing?.independentLiving || community.independent_living_pricing,
                updated_at: new Date()
              })
              .where(eq(communities.id, community.id));
            
            result.successfulVerifications++;
            console.log(`    ✅ Verified successfully (via ${verificationData.verifiedBy})`);
          } else {
            // Mark as attempted but not found
            await db
              .update(communities)
              .set({
                verification_status: 'not_found',
                updated_at: new Date()
              })
              .where(eq(communities.id, community.id));
            
            result.failedVerifications++;
            console.log(`    ⚠️ Could not verify - marked as not found`);
          }
          
          // Small delay to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error: any) {
          result.failedVerifications++;
          result.errors.push(`${community.name}: ${error.message}`);
          console.error(`    ❌ Error verifying ${community.name}:`, error.message);
        }
      }
      
    } catch (error: any) {
      console.error(`Fatal error processing ${city}:`, error);
      result.errors.push(`Fatal: ${error.message}`);
    }
    
    result.endTime = new Date();
    result.duration = (result.endTime.getTime() - startTime.getTime()) / 1000; // seconds
    
    console.log(`\n✅ Completed ${city}, ${state}:`);
    console.log(`  - Total: ${result.totalCommunities}`);
    console.log(`  - Verified: ${result.successfulVerifications}`);
    console.log(`  - Failed: ${result.failedVerifications}`);
    console.log(`  - Skipped: ${result.skipped}`);
    console.log(`  - Duration: ${result.duration.toFixed(1)}s`);
    
    this.currentCity = null;
    return result;
  }
  
  /**
   * Process next city in the queue
   */
  async processNextCity(): Promise<VerificationResult | null> {
    if (this.isProcessing) {
      console.log('⏳ Already processing a city, skipping...');
      return null;
    }
    
    this.isProcessing = true;
    
    try {
      const priorityCities = await this.getPriorityCities(1);
      
      if (priorityCities.length === 0) {
        console.log('🎉 No more cities to verify!');
        return null;
      }
      
      const nextCity = priorityCities[0];
      console.log(`\n🚀 Processing next priority city: ${nextCity.city}, ${nextCity.state}`);
      console.log(`   Priority Score: ${nextCity.priority}`);
      console.log(`   Reason: ${nextCity.reason}`);
      
      const result = await this.verifyCity(nextCity.city, nextCity.state);
      return result;
      
    } finally {
      this.isProcessing = false;
    }
  }
  
  /**
   * Get current verification progress
   */
  async getProgress(): Promise<{
    totalCities: number;
    verifiedCities: number;
    totalCommunities: number;
    verifiedCommunities: number;
    percentageComplete: number;
    currentlyProcessing: string | null;
    estimatedCompletion: string;
  }> {
    const stats = await db
      .select({
        totalCities: sql<number>`COUNT(DISTINCT city || ',' || state)`,
        verifiedCities: sql<number>`COUNT(DISTINCT CASE WHEN verification_status = 'verified' THEN city || ',' || state END)`,
        totalCommunities: sql<number>`COUNT(*)`,
        verifiedCommunities: sql<number>`COUNT(CASE WHEN verification_status = 'verified' THEN 1 END)`
      })
      .from(communities)
      .where(sql`${communities.state} NOT IN ('ON', 'QC', 'BC', 'AB', 'SK', 'NS', 'MB', 'NB', 'NL', 'PE', 'NT', 'YT', 'NU')`); // US only
    
    const stat = stats[0];
    const percentageComplete = (stat.verifiedCommunities / stat.totalCommunities) * 100;
    
    // Estimate completion based on current rate (500 communities/week)
    const remainingCommunities = stat.totalCommunities - stat.verifiedCommunities;
    const weeksRemaining = Math.ceil(remainingCommunities / 500);
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + (weeksRemaining * 7));
    
    return {
      totalCities: stat.totalCities,
      verifiedCities: stat.verifiedCities,
      totalCommunities: stat.totalCommunities,
      verifiedCommunities: stat.verifiedCommunities,
      percentageComplete: Math.round(percentageComplete * 100) / 100,
      currentlyProcessing: this.currentCity,
      estimatedCompletion: estimatedDate.toLocaleDateString()
    };
  }
  
  /**
   * Start automated verification process
   */
  async startAutomatedVerification(citiesPerDay: number = 5) {
    console.log(`🤖 Starting automated verification (${citiesPerDay} cities/day)`);
    
    let processedToday = 0;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    while (processedToday < citiesPerDay) {
      const result = await this.processNextCity();
      
      if (!result) {
        console.log('✅ All cities verified or no cities available');
        break;
      }
      
      processedToday++;
      
      // Wait 2 minutes between cities to avoid overwhelming the API
      if (processedToday < citiesPerDay) {
        console.log(`⏰ Waiting 2 minutes before next city (${processedToday}/${citiesPerDay} completed today)...`);
        await new Promise(resolve => setTimeout(resolve, 120000));
      }
    }
    
    console.log(`📊 Daily verification complete: ${processedToday} cities processed`);
    
    // Get and display progress
    const progress = await this.getProgress();
    console.log('\n📈 Overall Progress:');
    console.log(`  Cities: ${progress.verifiedCities}/${progress.totalCities} (${Math.round(progress.verifiedCities/progress.totalCities * 100)}%)`);
    console.log(`  Communities: ${progress.verifiedCommunities}/${progress.totalCommunities} (${progress.percentageComplete}%)`);
    console.log(`  Estimated Completion: ${progress.estimatedCompletion}`);
  }
}

// Export singleton instance
export const cityVerificationQueue = new CityVerificationQueue();