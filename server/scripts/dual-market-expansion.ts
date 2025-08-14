#!/usr/bin/env tsx
/**
 * Dual Market Expansion & Enrichment Strategy
 * 1. EXPANSION: Find and add commercial chains from city searches
 * 2. ENRICHMENT: Enhance existing government-sourced communities
 * 
 * Business Logic: Commercial chains = paying customers with marketing budgets
 */

import { PerplexityAIService } from "../perplexity-ai-service";
import { db } from "../db";
import { communities } from "@shared/schema";
import { eq, and, sql, isNull, or, not } from "drizzle-orm";
import * as fs from 'fs';
import * as path from 'path';

interface CommercialChain {
  name: string;
  address?: string;
  city: string;
  state: string;
  pricing?: string;
  careTypes: string[];
  phone?: string;
  website?: string;
  chainAffiliation?: string;
  description?: string;
  source: 'city_search';
}

interface EnrichmentResult {
  communityId: number;
  name: string;
  updates: {
    description?: string;
    pricing?: { min: number; max: number } | null;
    careTypes?: string[];
    amenities?: string[];
    phone?: string;
    website?: string;
  };
  quality: number;
}

// Major US cities to search for commercial chains
const TARGET_CITIES = [
  { city: 'San Francisco', state: 'CA' },
  { city: 'Los Angeles', state: 'CA' },
  { city: 'San Diego', state: 'CA' },
  { city: 'Seattle', state: 'WA' },
  { city: 'Portland', state: 'OR' },
  { city: 'Phoenix', state: 'AZ' },
  { city: 'Denver', state: 'CO' },
  { city: 'Austin', state: 'TX' },
  { city: 'Houston', state: 'TX' },
  { city: 'Dallas', state: 'TX' },
  { city: 'Chicago', state: 'IL' },
  { city: 'Boston', state: 'MA' },
  { city: 'New York', state: 'NY' },
  { city: 'Miami', state: 'FL' },
  { city: 'Atlanta', state: 'GA' }
];

// Known commercial chains to prioritize
const COMMERCIAL_CHAINS = [
  'Brookdale', 'Sunrise', 'Aegis Living', 'Atria', 'Holiday Retirement',
  'Five Star', 'Capital Senior Living', 'Silverado', 'Belmont Village',
  'Watermark', 'MBK Senior Living', 'Discovery Senior Living',
  'Integral Senior Living', 'Senior Lifestyle', 'Enlivant'
];

class DualMarketExpander {
  private perplexityService: PerplexityAIService;
  private newChainsFound: CommercialChain[] = [];
  private enrichedCommunities: EnrichmentResult[] = [];
  private logFile: string;

  constructor() {
    this.perplexityService = new PerplexityAIService();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.logFile = path.join(process.cwd(), `dual-market-expansion-${timestamp}.json`);
  }

  /**
   * TRACK 1: Find commercial chains from city searches
   */
  async findCommercialChains(limit: number = 5): Promise<CommercialChain[]> {
    console.log('\n🏢 TRACK 1: EXPANSION - Finding Commercial Chains');
    console.log('='.repeat(70));
    
    const chains: CommercialChain[] = [];
    const citiesToSearch = TARGET_CITIES.slice(0, limit);
    
    for (const location of citiesToSearch) {
      console.log(`\n📍 Searching ${location.city}, ${location.state}...`);
      
      const query = `list all ${COMMERCIAL_CHAINS.join(', ')} senior living communities in ${location.city} ${location.state} 2025. Include Brookdale, Sunrise, Aegis Living, Atria and other major chains. For each provide: exact name, street address, monthly pricing ranges, types of care (assisted living, memory care, independent living), phone numbers, websites`;
      
      const result = await this.perplexityService.searchRealTime(query);
      const extracted = this.extractCommercialChains(result.summary || '', location.city, location.state);
      
      console.log(`  Found ${extracted.length} commercial facilities`);
      extracted.slice(0, 3).forEach(c => {
        console.log(`    ✓ ${c.name}${c.chainAffiliation ? ` (${c.chainAffiliation})` : ''}`);
      });
      
      chains.push(...extracted);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    this.newChainsFound = chains;
    console.log(`\n🎯 Total commercial chains found: ${chains.length}`);
    return chains;
  }

  /**
   * TRACK 2: Enrich existing database communities
   */
  async enrichExistingCommunities(limit: number = 10): Promise<EnrichmentResult[]> {
    console.log('\n💎 TRACK 2: ENRICHMENT - Enhancing Existing Communities');
    console.log('='.repeat(70));
    
    // Get communities that need enrichment (prioritize non-HUD with empty descriptions)
    const communitiesToEnrich = await db
      .select()
      .from(communities)
      .where(
        sql`${communities.description} IS NULL OR ${communities.description} = '' OR ${communities.description} NOT LIKE '%HUD Section 202%'`
      )
      .limit(limit);
    
    console.log(`Found ${communitiesToEnrich.length} communities needing enrichment`);
    
    const results: EnrichmentResult[] = [];
    
    for (let i = 0; i < communitiesToEnrich.length; i++) {
      const community = communitiesToEnrich[i];
      console.log(`\n🔍 [${i + 1}/${limit}] Enriching: ${community.name}`);
      console.log(`   Location: ${community.city}, ${community.state}`);
      
      const query = `"${community.name}" senior living in ${community.city}, ${community.state} - current 2025 pricing, monthly costs, care services (assisted living, memory care, skilled nursing), amenities, features, contact info, ${community.address ? `address ${community.address}` : ''}`;
      
      const searchResult = await this.perplexityService.searchRealTime(query);
      const enrichment = this.extractEnrichmentData(searchResult.summary || '', community);
      
      results.push(enrichment);
      
      console.log(`   Quality: ${enrichment.quality}%`);
      if (enrichment.updates.pricing) {
        console.log(`   💰 Pricing: $${enrichment.updates.pricing.min}-$${enrichment.updates.pricing.max}`);
      }
      
      // Save immediately to database
      if (enrichment.quality >= 60) {
        await this.saveEnrichment(enrichment);
        console.log(`   ✅ Saved to database`);
      }
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    this.enrichedCommunities = results;
    return results;
  }

  /**
   * Extract commercial chains from city search results
   */
  private extractCommercialChains(text: string, city: string, state: string): CommercialChain[] {
    const chains: CommercialChain[] = [];
    const lines = text.split('\n');
    
    lines.forEach(line => {
      // Check if line mentions a known chain
      const chainFound = COMMERCIAL_CHAINS.find(chain => 
        line.toLowerCase().includes(chain.toLowerCase())
      );
      
      if (chainFound) {
        // Extract the facility name more carefully
        let facilityName = '';
        
        // Pattern 1: **Name** format
        const boldMatch = line.match(/\*\*([^*]+)\*\*/);
        if (boldMatch) {
          facilityName = boldMatch[1].trim();
        } else {
          // Pattern 2: Chain name with location
          const locationMatch = line.match(new RegExp(`(${chainFound}[^,\\.\\(]*?)(?:[,\\.]|\\(|$)`, 'i'));
          if (locationMatch) {
            facilityName = locationMatch[1].trim();
          }
        }
        
        // Skip if name is too long (likely a sentence) or empty
        if (facilityName && facilityName.length < 60 && !facilityName.includes(' is ') && !facilityName.includes(' are ')) {
          // Extract pricing
          const priceMatches = line.match(/\$[\d,]+/g);
          const pricing = priceMatches ? priceMatches[0] : undefined;
          
          // Extract care types
          const careTypes: string[] = [];
          if (line.toLowerCase().includes('assisted living')) careTypes.push('Assisted Living');
          if (line.toLowerCase().includes('memory care')) careTypes.push('Memory Care');
          if (line.toLowerCase().includes('independent living')) careTypes.push('Independent Living');
          
          // Extract phone
          const phoneMatch = line.match(/\d{3}[-.]?\d{3}[-.]?\d{4}/);
          
          chains.push({
            name: facilityName,
            city,
            state,
            pricing,
            careTypes: careTypes.length > 0 ? careTypes : ['Assisted Living'],
            phone: phoneMatch ? phoneMatch[0] : undefined,
            chainAffiliation: chainFound,
            source: 'city_search',
            description: `Part of ${chainFound} senior living network in ${city}, ${state}`
          });
        }
      }
    });
    
    return chains;
  }

  /**
   * Extract enrichment data from search results
   */
  private extractEnrichmentData(text: string, community: any): EnrichmentResult {
    const updates: EnrichmentResult['updates'] = {};
    let quality = 0;
    
    // Check if community is mentioned
    const nameMentioned = text.toLowerCase().includes(community.name.toLowerCase().split(' ')[0]);
    if (nameMentioned) quality += 40;
    
    // Extract pricing
    const priceMatches = text.match(/\$[\d,]+/g);
    if (priceMatches && priceMatches.length > 0) {
      const prices = priceMatches.map(p => parseInt(p.replace(/\D/g, '')));
      updates.pricing = {
        min: Math.min(...prices),
        max: Math.max(...prices)
      };
      quality += 20;
    }
    
    // Extract care types
    const careTypes: string[] = [];
    if (text.toLowerCase().includes('assisted living')) careTypes.push('Assisted Living');
    if (text.toLowerCase().includes('memory care')) careTypes.push('Memory Care');
    if (text.toLowerCase().includes('independent living')) careTypes.push('Independent Living');
    if (text.toLowerCase().includes('skilled nursing')) careTypes.push('Skilled Nursing');
    if (careTypes.length > 0) {
      updates.careTypes = careTypes;
      quality += 20;
    }
    
    // Extract amenities
    const amenities: string[] = [];
    const amenityKeywords = ['dining', 'transportation', 'activities', 'fitness', 'laundry', 'housekeeping', 'pool', 'library'];
    amenityKeywords.forEach(amenity => {
      if (text.toLowerCase().includes(amenity)) amenities.push(amenity);
    });
    if (amenities.length > 0) {
      updates.amenities = amenities;
      quality += 20;
    }
    
    // Generate description if we have good data
    if (quality >= 60) {
      updates.description = this.generateDescription(community, updates);
    }
    
    return {
      communityId: community.id,
      name: community.name,
      updates,
      quality
    };
  }

  /**
   * Generate enhanced description
   */
  private generateDescription(community: any, updates: EnrichmentResult['updates']): string {
    let desc = `${community.name} is a senior living community in ${community.city}, ${community.state}`;
    
    if (updates.careTypes && updates.careTypes.length > 0) {
      desc += ` offering ${updates.careTypes.join(', ')}`;
    }
    
    if (updates.pricing) {
      desc += `. Monthly costs range from $${updates.pricing.min.toLocaleString()} to $${updates.pricing.max.toLocaleString()}`;
    }
    
    if (updates.amenities && updates.amenities.length > 0) {
      desc += `. Community amenities include ${updates.amenities.join(', ')}`;
    }
    
    desc += '.';
    return desc;
  }

  /**
   * Save enrichment to database
   */
  private async saveEnrichment(enrichment: EnrichmentResult): Promise<void> {
    const updateData: any = {
      ai_enrichment_date: new Date(),
      ai_enrichment_version: 'dual_market_v1'
    };
    
    if (enrichment.updates.description) {
      updateData.description = enrichment.updates.description;
    }
    
    if (enrichment.updates.pricing) {
      updateData.price_range_min = enrichment.updates.pricing.min;
      updateData.price_range_max = enrichment.updates.pricing.max;
    }
    
    if (enrichment.updates.careTypes && enrichment.updates.careTypes.length > 0) {
      updateData.care_type = enrichment.updates.careTypes[0]; // Primary care type
    }
    
    await db
      .update(communities)
      .set(updateData)
      .where(eq(communities.id, enrichment.communityId));
  }

  /**
   * Add new commercial chains to database
   */
  async addNewChains(): Promise<number> {
    console.log('\n💾 Adding new commercial chains to database...');
    
    let added = 0;
    for (const chain of this.newChainsFound) {
      // Check if already exists
      const existing = await db
        .select()
        .from(communities)
        .where(
          and(
            eq(communities.name, chain.name),
            eq(communities.city, chain.city),
            eq(communities.state, chain.state)
          )
        )
        .limit(1);
      
      if (existing.length === 0) {
        // Add new community as UNCLAIMED (no subscription_tier until they register)
        await db.insert(communities).values({
          name: chain.name,
          city: chain.city,
          state: chain.state,
          zip_code: '00000', // Placeholder until we get real zip
          address: chain.address || '',
          description: chain.description,
          phone: chain.phone,
          care_type: chain.careTypes[0] || 'Assisted Living',
          ai_enrichment_date: new Date(),
          ai_enrichment_version: 'dual_market_v1',
          status: 'Active',
          listing_type: 'Premium', // Commercial chains likely to be premium
          is_claimed: false, // Explicitly mark as unclaimed
          // NO subscription_tier - stays NULL until claimed
        });
        added++;
        console.log(`  ✅ Added: ${chain.name} (${chain.city}, ${chain.state})`);
      }
    }
    
    return added;
  }

  /**
   * Generate summary report
   */
  generateReport(): void {
    const report = {
      timestamp: new Date().toISOString(),
      expansion: {
        commercialChainsFound: this.newChainsFound.length,
        byChain: COMMERCIAL_CHAINS.map(chain => ({
          chain,
          count: this.newChainsFound.filter(c => c.chainAffiliation === chain).length
        })).filter(c => c.count > 0),
        topCities: TARGET_CITIES.slice(0, 5).map(loc => ({
          city: `${loc.city}, ${loc.state}`,
          count: this.newChainsFound.filter(c => c.city === loc.city).length
        }))
      },
      enrichment: {
        communitiesEnriched: this.enrichedCommunities.length,
        averageQuality: this.enrichedCommunities.reduce((sum, r) => sum + r.quality, 0) / this.enrichedCommunities.length,
        withPricing: this.enrichedCommunities.filter(r => r.updates.pricing).length,
        highQuality: this.enrichedCommunities.filter(r => r.quality >= 80).length
      },
      businessValue: {
        potentialPayingCustomers: this.newChainsFound.filter(c => c.chainAffiliation).length,
        marketCoverage: 'Both government-sourced AND commercial chains',
        expansionOpportunity: `${COMMERCIAL_CHAINS.length} major chains identified for targeting`
      }
    };
    
    // Save report
    fs.writeFileSync(this.logFile, JSON.stringify(report, null, 2));
    
    console.log('\n' + '='.repeat(70));
    console.log('📊 DUAL MARKET EXPANSION REPORT');
    console.log('='.repeat(70));
    console.log('\n🏢 EXPANSION (Commercial Chains):');
    console.log(`  • Chains found: ${report.expansion.commercialChainsFound}`);
    console.log(`  • Potential paying customers: ${report.businessValue.potentialPayingCustomers}`);
    
    if (report.expansion.byChain.length > 0) {
      console.log('\n  By Chain:');
      report.expansion.byChain.forEach(c => {
        console.log(`    - ${c.chain}: ${c.count}`);
      });
    }
    
    console.log('\n💎 ENRICHMENT (Existing Communities):');
    console.log(`  • Communities enriched: ${report.enrichment.communitiesEnriched}`);
    console.log(`  • Average quality: ${Math.round(report.enrichment.averageQuality)}%`);
    console.log(`  • With pricing: ${report.enrichment.withPricing}`);
    
    console.log('\n💼 BUSINESS VALUE:');
    console.log(`  • Market coverage: ${report.businessValue.marketCoverage}`);
    console.log(`  • Expansion opportunity: ${report.businessValue.expansionOpportunity}`);
    
    console.log(`\n📄 Full report saved to: ${this.logFile}`);
  }
}

// Main execution
async function runDualMarketExpansion() {
  console.log('🚀 Starting Dual Market Expansion & Enrichment');
  console.log('Business Strategy: Capture BOTH government-sourced AND commercial chains');
  console.log('Commercial chains = Paying customers with marketing budgets');
  
  const expander = new DualMarketExpander();
  
  try {
    // Track 1: Find commercial chains (expansion)
    await expander.findCommercialChains(3); // Start with 3 cities
    
    // Track 2: Enrich existing communities
    await expander.enrichExistingCommunities(10); // Enrich 10 communities
    
    // Add new chains to database
    const added = await expander.addNewChains();
    console.log(`\n✅ Added ${added} new commercial chains to database`);
    
    // Generate report
    expander.generateReport();
    
    console.log('\n✅ Dual market expansion completed successfully!');
    console.log('🎯 You now have BOTH:');
    console.log('   1. Government-sourced communities (HUD, Section 202, etc.)');
    console.log('   2. Commercial chains (Brookdale, Sunrise, etc.) - PAYING CUSTOMERS');
    
  } catch (error) {
    console.error('❌ Error during expansion:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Run if executed directly
runDualMarketExpansion();

export { DualMarketExpander };