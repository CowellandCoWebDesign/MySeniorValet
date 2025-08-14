#!/usr/bin/env tsx
/**
 * Improved Dual Market Expansion & Enrichment Strategy
 * Version 2.0 - Fixed extraction accuracy and deduplication
 * 
 * IMPROVEMENTS:
 * - Better chain name extraction (no more sentence fragments)
 * - Address validation before adding
 * - Deduplication logic
 * - Prioritized enrichment (paying customers first)
 * - Larger batch processing (50 communities)
 * - Unclaimed status for new chains
 */

import { PerplexityAIService } from "../perplexity-ai-service";
import { db } from "../db";
import { communities } from "@shared/schema";
import { eq, and, sql, isNull, or, not, inArray, desc } from "drizzle-orm";
import * as fs from 'fs';
import * as path from 'path';

interface CommercialChain {
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  pricing?: string;
  careTypes: string[];
  phone?: string;
  website?: string;
  chainAffiliation?: string;
  description?: string;
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
    address?: string;
    zip_code?: string;
  };
  quality: number;
}

// Known commercial chains - expanded list
const COMMERCIAL_CHAINS = [
  'Brookdale', 'Sunrise Senior Living', 'Aegis Living', 'Atria', 
  'Holiday Retirement', 'Five Star Senior Living', 'Capital Senior Living', 
  'Silverado', 'Belmont Village', 'Watermark Retirement', 'MBK Senior Living', 
  'Discovery Senior Living', 'Integral Senior Living', 'Senior Lifestyle', 
  'Enlivant', 'Life Care Services', 'Erickson Living', 'Presbyterian Homes',
  'Brightview Senior Living', 'Oakmont Senior Living', 'Meridian Senior Living',
  'Allegro Senior Living', 'American Senior Communities', 'Heritage Communities',
  'Pacifica Senior Living', 'Pegasus Senior Living', 'Leisure Care',
  'Benchmark Senior Living', 'LCS Communities', 'Kisco Senior Living',
  'Senior Living Management', 'Senior Resource Group', 'Chelsea Senior Living',
  'Signature HealthCARE', 'Sonida Senior Living', 'The Arbor Company'
];

// Major US metro areas for better coverage
const TARGET_METROS = [
  // Top 15 metros by senior population
  { city: 'San Francisco', state: 'CA' },
  { city: 'Los Angeles', state: 'CA' },
  { city: 'San Diego', state: 'CA' },
  { city: 'Phoenix', state: 'AZ' },
  { city: 'Las Vegas', state: 'NV' },
  { city: 'Seattle', state: 'WA' },
  { city: 'Portland', state: 'OR' },
  { city: 'Denver', state: 'CO' },
  { city: 'Dallas', state: 'TX' },
  { city: 'Houston', state: 'TX' },
  { city: 'Austin', state: 'TX' },
  { city: 'San Antonio', state: 'TX' },
  { city: 'Chicago', state: 'IL' },
  { city: 'Minneapolis', state: 'MN' },
  { city: 'Detroit', state: 'MI' },
  { city: 'Boston', state: 'MA' },
  { city: 'New York', state: 'NY' },
  { city: 'Philadelphia', state: 'PA' },
  { city: 'Washington', state: 'DC' },
  { city: 'Miami', state: 'FL' },
  { city: 'Tampa', state: 'FL' },
  { city: 'Orlando', state: 'FL' },
  { city: 'Atlanta', state: 'GA' },
  { city: 'Charlotte', state: 'NC' },
  { city: 'Nashville', state: 'TN' }
];

class ImprovedDualMarketExpander {
  private perplexityService: PerplexityAIService;
  private newChainsFound: CommercialChain[] = [];
  private enrichedCommunities: EnrichmentResult[] = [];
  private logFile: string;
  private duplicatesSkipped: number = 0;
  private invalidSkipped: number = 0;

  constructor() {
    this.perplexityService = new PerplexityAIService();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.logFile = path.join(process.cwd(), `improved-expansion-${timestamp}.json`);
  }

  /**
   * TRACK 1: Find commercial chains with better accuracy
   */
  async findCommercialChains(limit: number = 10): Promise<CommercialChain[]> {
    console.log('\n🏢 TRACK 1: IMPROVED EXPANSION - Finding Commercial Chains');
    console.log('='.repeat(70));
    
    const chains: CommercialChain[] = [];
    const metresToSearch = TARGET_METROS.slice(0, limit);
    
    for (const location of metresToSearch) {
      console.log(`\n📍 Searching ${location.city}, ${location.state}...`);
      
      // More specific query to get actual addresses
      const query = `list senior living communities operated by ${COMMERCIAL_CHAINS.slice(0, 10).join(', ')} in ${location.city} ${location.state} 2025. 
        For each facility provide:
        1. Full facility name (not just brand name)
        2. Complete street address with zip code
        3. Phone number
        4. Monthly pricing ranges for 2025
        5. Types of care offered
        Only include facilities with actual street addresses. Format as structured list.`;
      
      const result = await this.perplexityService.searchRealTime(query);
      const extracted = await this.extractImprovedChains(result.summary || '', location.city, location.state);
      
      console.log(`  Found ${extracted.length} valid facilities`);
      
      // Check for duplicates before adding
      for (const chain of extracted) {
        const isDuplicate = await this.checkDuplicate(chain);
        if (!isDuplicate && this.isValidChain(chain)) {
          chains.push(chain);
          console.log(`    ✓ ${chain.name} - ${chain.address}`);
        } else if (isDuplicate) {
          this.duplicatesSkipped++;
        } else {
          this.invalidSkipped++;
        }
      }
      
      // Rate limit protection
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    this.newChainsFound = chains;
    console.log(`\n🎯 Total new chains found: ${chains.length}`);
    console.log(`   Duplicates skipped: ${this.duplicatesSkipped}`);
    console.log(`   Invalid entries skipped: ${this.invalidSkipped}`);
    
    return chains;
  }

  /**
   * TRACK 2: Prioritized enrichment (paying customers first)
   */
  async enrichExistingCommunities(limit: number = 50): Promise<EnrichmentResult[]> {
    console.log('\n💎 TRACK 2: PRIORITIZED ENRICHMENT');
    console.log('='.repeat(70));
    
    // Prioritize: 1) Paid tiers, 2) Claimed, 3) High-value markets
    const communitiesToEnrich = await db
      .select()
      .from(communities)
      .where(
        and(
          or(
            isNull(communities.description),
            sql`${communities.description} = ''`,
            sql`${communities.price_range_min} IS NULL`
          )
        )
      )
      .orderBy(
        desc(communities.subscription_tier), // Paid first
        desc(communities.is_claimed),        // Claimed second
        desc(communities.city)                // Major cities third
      )
      .limit(limit);
    
    console.log(`Found ${communitiesToEnrich.length} communities to enrich (prioritized)`);
    
    const results: EnrichmentResult[] = [];
    const batchSize = 5;
    
    for (let i = 0; i < communitiesToEnrich.length; i += batchSize) {
      const batch = communitiesToEnrich.slice(i, Math.min(i + batchSize, communitiesToEnrich.length));
      console.log(`\n📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(communitiesToEnrich.length/batchSize)}`);
      
      const batchResults = await Promise.all(
        batch.map(community => this.enrichSingleCommunity(community))
      );
      
      for (const enrichment of batchResults) {
        if (enrichment.quality >= 50) { // Lower threshold for more results
          results.push(enrichment);
          await this.saveEnrichment(enrichment);
          console.log(`  ✅ ${enrichment.name}: Quality ${enrichment.quality}%${enrichment.updates.pricing ? ` | $${enrichment.updates.pricing.min}-${enrichment.updates.pricing.max}` : ''}`);
        }
      }
      
      // Rate limit between batches
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    this.enrichedCommunities = results;
    console.log(`\n✨ Successfully enriched: ${results.length}/${communitiesToEnrich.length}`);
    
    return results;
  }

  /**
   * Improved extraction with validation
   */
  private async extractImprovedChains(text: string, city: string, state: string): Promise<CommercialChain[]> {
    const chains: CommercialChain[] = [];
    const lines = text.split('\n');
    
    let currentChain: Partial<CommercialChain> | null = null;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      // Look for facility names (usually start with number or bullet)
      if (/^[\d\-\*•]\s*/.test(trimmedLine) || this.containsChainName(trimmedLine)) {
        // Save previous chain if valid
        if (currentChain && this.isValidPartialChain(currentChain)) {
          chains.push(this.completeChainData(currentChain, city, state));
        }
        
        // Start new chain
        currentChain = {
          city,
          state,
          careTypes: []
        };
        
        // Extract facility name
        const nameMatch = trimmedLine.match(/^[\d\-\*•]?\s*([^:,\(]+)/);
        if (nameMatch) {
          currentChain.name = this.cleanFacilityName(nameMatch[1]);
          currentChain.chainAffiliation = this.detectChainAffiliation(currentChain.name);
        }
      }
      
      // Extract address
      if (currentChain && /\d+\s+\w+\s+(street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|way|lane|ln|court|ct)/i.test(trimmedLine)) {
        const addressMatch = trimmedLine.match(/(\d+\s+[^,]+)/);
        if (addressMatch && !currentChain.address) {
          currentChain.address = addressMatch[1].trim();
        }
        
        // Extract zip code
        const zipMatch = trimmedLine.match(/\b(\d{5})\b/);
        if (zipMatch) {
          currentChain.zip_code = zipMatch[1];
        }
      }
      
      // Extract phone
      if (currentChain && /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(trimmedLine)) {
        const phoneMatch = trimmedLine.match(/(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/);
        if (phoneMatch && !currentChain.phone) {
          currentChain.phone = phoneMatch[1].replace(/[-.\s]/g, '-');
        }
      }
      
      // Extract pricing
      if (currentChain && /\$[\d,]+/.test(trimmedLine)) {
        const priceMatches = trimmedLine.match(/\$[\d,]+/g);
        if (priceMatches && !currentChain.pricing) {
          currentChain.pricing = priceMatches.join(' - ');
        }
      }
      
      // Extract care types
      if (currentChain) {
        if (/assisted living/i.test(trimmedLine) && !currentChain.careTypes?.includes('Assisted Living')) {
          currentChain.careTypes?.push('Assisted Living');
        }
        if (/memory care/i.test(trimmedLine) && !currentChain.careTypes?.includes('Memory Care')) {
          currentChain.careTypes?.push('Memory Care');
        }
        if (/independent living/i.test(trimmedLine) && !currentChain.careTypes?.includes('Independent Living')) {
          currentChain.careTypes?.push('Independent Living');
        }
      }
    }
    
    // Don't forget the last chain
    if (currentChain && this.isValidPartialChain(currentChain)) {
      chains.push(this.completeChainData(currentChain, city, state));
    }
    
    return chains;
  }

  /**
   * Check if line contains a known chain name
   */
  private containsChainName(text: string): boolean {
    return COMMERCIAL_CHAINS.some(chain => 
      text.toLowerCase().includes(chain.toLowerCase())
    );
  }

  /**
   * Clean facility name
   */
  private cleanFacilityName(name: string): string {
    return name
      .replace(/^[\d\-\*•]\s*/, '') // Remove bullets/numbers
      .replace(/\s+/g, ' ')          // Normalize spaces
      .replace(/[:\(\[].*$/, '')     // Remove trailing info
      .trim();
  }

  /**
   * Detect chain affiliation from name
   */
  private detectChainAffiliation(name: string): string | undefined {
    return COMMERCIAL_CHAINS.find(chain => 
      name.toLowerCase().includes(chain.toLowerCase())
    );
  }

  /**
   * Validate partial chain data
   */
  private isValidPartialChain(chain: Partial<CommercialChain>): boolean {
    return !!(
      chain.name && 
      chain.name.length > 5 && 
      chain.name.length < 100 &&
      !chain.name.includes(' is ') &&
      !chain.name.includes(' are ') &&
      !chain.name.includes(' has ') &&
      !chain.name.includes(' have ')
    );
  }

  /**
   * Complete chain data with defaults
   */
  private completeChainData(partial: Partial<CommercialChain>, city: string, state: string): CommercialChain {
    return {
      name: partial.name || '',
      address: partial.address || '',
      city: partial.city || city,
      state: partial.state || state,
      zip_code: partial.zip_code || '00000',
      careTypes: partial.careTypes?.length ? partial.careTypes : ['Assisted Living'],
      phone: partial.phone,
      pricing: partial.pricing,
      chainAffiliation: partial.chainAffiliation,
      description: `${partial.chainAffiliation || 'Senior living'} community in ${city}, ${state}`,
      website: partial.website
    };
  }

  /**
   * Validate complete chain data
   */
  private isValidChain(chain: CommercialChain): boolean {
    // Must have name and either address or zip code
    return !!(
      chain.name &&
      chain.city &&
      chain.state &&
      (chain.address || chain.zip_code !== '00000')
    );
  }

  /**
   * Check for duplicate in database
   */
  private async checkDuplicate(chain: CommercialChain): Promise<boolean> {
    const existing = await db
      .select()
      .from(communities)
      .where(
        and(
          sql`LOWER(${communities.name}) = LOWER(${chain.name})`,
          eq(communities.city, chain.city),
          eq(communities.state, chain.state)
        )
      )
      .limit(1);
    
    return existing.length > 0;
  }

  /**
   * Enrich single community
   */
  private async enrichSingleCommunity(community: any): Promise<EnrichmentResult> {
    const query = `"${community.name}" senior living facility in ${community.city}, ${community.state}
      Current 2025 information needed:
      - Full street address with zip code
      - Monthly pricing ranges (be specific)
      - Types of care offered
      - Phone number and website
      - Key amenities and features
      ${community.address ? `Located at or near: ${community.address}` : ''}`;
    
    try {
      const result = await this.perplexityService.searchRealTime(query);
      return this.extractEnrichmentData(result.summary || '', community);
    } catch (error) {
      console.error(`  ⚠️ Error enriching ${community.name}:`, error);
      return {
        communityId: community.id,
        name: community.name,
        updates: {},
        quality: 0
      };
    }
  }

  /**
   * Extract enrichment data with quality scoring
   */
  private extractEnrichmentData(text: string, community: any): EnrichmentResult {
    const updates: EnrichmentResult['updates'] = {};
    let quality = 0;
    
    // Check if community is specifically mentioned
    const nameParts = community.name.toLowerCase().split(' ').filter(p => p.length > 3);
    const nameMatches = nameParts.filter(part => text.toLowerCase().includes(part)).length;
    quality += Math.min(40, nameMatches * 10);
    
    // Extract and validate address
    if (!community.address || community.address === '') {
      const addressMatch = text.match(/(\d+\s+[A-Z][a-z]+\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Way|Lane|Ln|Court|Ct)\.?)/i);
      if (addressMatch) {
        updates.address = addressMatch[1].trim();
        quality += 10;
      }
    }
    
    // Extract zip code
    if (!community.zip_code || community.zip_code === '00000') {
      const zipMatch = text.match(/\b(\d{5})(?:-\d{4})?\b/);
      if (zipMatch) {
        updates.zip_code = zipMatch[1];
        quality += 10;
      }
    }
    
    // Extract pricing with validation
    const priceMatches = text.match(/\$[\d,]+/g);
    if (priceMatches && priceMatches.length > 0) {
      const prices = priceMatches
        .map(p => parseInt(p.replace(/\D/g, '')))
        .filter(p => p > 500 && p < 20000); // Reasonable monthly range
      
      if (prices.length > 0) {
        updates.pricing = {
          min: Math.min(...prices),
          max: Math.max(...prices)
        };
        quality += 20;
      }
    }
    
    // Extract care types
    const careTypes: string[] = [];
    const careTypeMap = {
      'assisted living': 'Assisted Living',
      'memory care': 'Memory Care',
      'independent living': 'Independent Living',
      'skilled nursing': 'Skilled Nursing',
      'alzheimer': 'Memory Care',
      'dementia': 'Memory Care',
      'retirement': 'Independent Living'
    };
    
    for (const [keyword, careType] of Object.entries(careTypeMap)) {
      if (text.toLowerCase().includes(keyword) && !careTypes.includes(careType)) {
        careTypes.push(careType);
      }
    }
    
    if (careTypes.length > 0) {
      updates.careTypes = careTypes;
      quality += 10;
    }
    
    // Extract phone
    if (!community.phone) {
      const phoneMatch = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
      if (phoneMatch) {
        updates.phone = phoneMatch[0].replace(/[^\d]/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
        quality += 5;
      }
    }
    
    // Extract amenities
    const amenityKeywords = [
      'dining', 'restaurant', 'meals',
      'transportation', 'shuttle',
      'activities', 'recreation', 'social',
      'fitness', 'gym', 'exercise',
      'housekeeping', 'laundry',
      'pool', 'spa',
      'library', 'computer',
      'salon', 'barber',
      'pet', 'garden'
    ];
    
    const foundAmenities = amenityKeywords.filter(amenity => 
      text.toLowerCase().includes(amenity)
    );
    
    if (foundAmenities.length > 0) {
      updates.amenities = foundAmenities;
      quality += 5;
    }
    
    // Generate description if we have good data
    if (quality >= 50) {
      updates.description = this.generateDescription(community, updates);
    }
    
    return {
      communityId: community.id,
      name: community.name,
      updates,
      quality: Math.min(100, quality)
    };
  }

  /**
   * Generate community description
   */
  private generateDescription(community: any, updates: EnrichmentResult['updates']): string {
    let desc = `${community.name} is a senior living community in ${community.city}, ${community.state}`;
    
    if (updates.careTypes && updates.careTypes.length > 0) {
      desc += ` offering ${updates.careTypes.join(', ')}`;
    }
    
    if (updates.pricing) {
      desc += `. Monthly costs typically range from $${updates.pricing.min.toLocaleString()} to $${updates.pricing.max.toLocaleString()}`;
    }
    
    if (updates.amenities && updates.amenities.length > 0) {
      desc += `. Community amenities include ${updates.amenities.slice(0, 5).join(', ')}`;
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
      ai_enrichment_version: 'improved_v2'
    };
    
    if (enrichment.updates.description) {
      updateData.description = enrichment.updates.description;
    }
    
    if (enrichment.updates.pricing) {
      updateData.price_range_min = enrichment.updates.pricing.min;
      updateData.price_range_max = enrichment.updates.pricing.max;
    }
    
    if (enrichment.updates.careTypes && enrichment.updates.careTypes.length > 0) {
      updateData.care_type = enrichment.updates.careTypes[0];
      updateData.care_types = enrichment.updates.careTypes; // Store all types
    }
    
    if (enrichment.updates.phone) {
      updateData.phone = enrichment.updates.phone;
    }
    
    if (enrichment.updates.address) {
      updateData.address = enrichment.updates.address;
    }
    
    if (enrichment.updates.zip_code) {
      updateData.zip_code = enrichment.updates.zip_code;
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
    let skipped = 0;
    
    for (const chain of this.newChainsFound) {
      try {
        await db.insert(communities).values({
          name: chain.name,
          city: chain.city,
          state: chain.state,
          zip_code: chain.zip_code,
          address: chain.address,
          description: chain.description,
          phone: chain.phone,
          care_type: chain.careTypes[0] || 'Assisted Living',
          care_types: chain.careTypes,
          ai_enrichment_date: new Date(),
          ai_enrichment_version: 'improved_v2',
          status: 'Active',
          listing_type: 'Premium',
          is_claimed: false, // Unclaimed by default
          // NO subscription_tier - stays NULL until claimed
        });
        
        added++;
        console.log(`  ✅ Added: ${chain.name} (${chain.address || chain.city})`);
      } catch (error: any) {
        if (error.message?.includes('duplicate')) {
          skipped++;
        } else {
          console.error(`  ❌ Error adding ${chain.name}:`, error.message);
        }
      }
    }
    
    console.log(`\n📊 Results: ${added} added, ${skipped} skipped (duplicates)`);
    return added;
  }

  /**
   * Generate comprehensive report
   */
  generateReport(): void {
    const report = {
      timestamp: new Date().toISOString(),
      version: 'improved_v2',
      expansion: {
        commercialChainsFound: this.newChainsFound.length,
        duplicatesSkipped: this.duplicatesSkipped,
        invalidSkipped: this.invalidSkipped,
        byChain: COMMERCIAL_CHAINS.map(chain => ({
          chain,
          count: this.newChainsFound.filter(c => c.chainAffiliation === chain).length
        })).filter(c => c.count > 0),
        citiesCovered: [...new Set(this.newChainsFound.map(c => `${c.city}, ${c.state}`))].length,
        withAddresses: this.newChainsFound.filter(c => c.address).length,
        withZipCodes: this.newChainsFound.filter(c => c.zip_code !== '00000').length
      },
      enrichment: {
        communitiesProcessed: this.enrichedCommunities.length,
        averageQuality: this.enrichedCommunities.length > 0 
          ? Math.round(this.enrichedCommunities.reduce((sum, r) => sum + r.quality, 0) / this.enrichedCommunities.length)
          : 0,
        withPricing: this.enrichedCommunities.filter(r => r.updates.pricing).length,
        withAddresses: this.enrichedCommunities.filter(r => r.updates.address).length,
        withPhones: this.enrichedCommunities.filter(r => r.updates.phone).length,
        highQuality: this.enrichedCommunities.filter(r => r.quality >= 80).length
      },
      businessValue: {
        potentialRevenue: this.newChainsFound.length * 149, // Assuming standard tier
        marketExpansion: `${this.newChainsFound.length} new potential customers`,
        dataQuality: 'Improved with address validation and deduplication'
      }
    };
    
    // Save report
    fs.writeFileSync(this.logFile, JSON.stringify(report, null, 2));
    
    console.log('\n' + '='.repeat(70));
    console.log('📊 IMPROVED EXPANSION REPORT');
    console.log('='.repeat(70));
    console.log('\n🏢 EXPANSION:');
    console.log(`  • New chains found: ${report.expansion.commercialChainsFound}`);
    console.log(`  • Duplicates avoided: ${report.expansion.duplicatesSkipped}`);
    console.log(`  • Invalid skipped: ${report.expansion.invalidSkipped}`);
    console.log(`  • Cities covered: ${report.expansion.citiesCovered}`);
    console.log(`  • With addresses: ${report.expansion.withAddresses}`);
    
    console.log('\n💎 ENRICHMENT:');
    console.log(`  • Communities enriched: ${report.enrichment.communitiesProcessed}`);
    console.log(`  • Average quality: ${report.enrichment.averageQuality}%`);
    console.log(`  • With pricing: ${report.enrichment.withPricing}`);
    console.log(`  • With addresses: ${report.enrichment.withAddresses}`);
    
    console.log('\n💼 BUSINESS IMPACT:');
    console.log(`  • Potential MRR: $${report.businessValue.potentialRevenue.toLocaleString()}/month`);
    console.log(`  • Market expansion: ${report.businessValue.marketExpansion}`);
    
    console.log(`\n📄 Full report: ${this.logFile}`);
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting Improved Dual Market Expansion v2.0');
  console.log('Timestamp:', new Date().toISOString());
  
  const expander = new ImprovedDualMarketExpander();
  
  try {
    // PHASE 1: Find new commercial chains (10 metros)
    console.log('\n══════════════════════════════════════');
    console.log('PHASE 1: COMMERCIAL CHAIN DISCOVERY');
    console.log('══════════════════════════════════════');
    
    await expander.findCommercialChains(10);
    const added = await expander.addNewChains();
    
    // PHASE 2: Enrich existing communities (50 prioritized)
    console.log('\n══════════════════════════════════════');
    console.log('PHASE 2: PRIORITIZED ENRICHMENT');
    console.log('══════════════════════════════════════');
    
    await expander.enrichExistingCommunities(50);
    
    // Generate final report
    expander.generateReport();
    
    console.log('\n✅ Improved expansion complete!');
    
  } catch (error) {
    console.error('\n❌ Error during expansion:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { ImprovedDualMarketExpander };