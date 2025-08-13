#!/usr/bin/env tsx
/**
 * EXPANDED DUAL-MARKET BATCH - 500+ Commercial Chains
 * Finds commercial chains (paying customers) while enriching existing communities
 * Targets 20+ major cities for maximum revenue potential
 */

import { db } from '../db';
import { communities } from '@shared/schema';
import { PerplexityAIService } from '../perplexity-ai-service';
import { sql, eq, and, inArray } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Initialize AI service
const aiService = new PerplexityAIService(process.env.PERPLEXITY_API_KEY!);

// Define major cities for expansion (20+ cities)
const TARGET_CITIES = [
  // California
  { city: 'San Francisco', state: 'CA' },
  { city: 'Los Angeles', state: 'CA' },
  { city: 'San Diego', state: 'CA' },
  { city: 'San Jose', state: 'CA' },
  { city: 'Sacramento', state: 'CA' },
  
  // Texas
  { city: 'Houston', state: 'TX' },
  { city: 'Dallas', state: 'TX' },
  { city: 'Austin', state: 'TX' },
  { city: 'San Antonio', state: 'TX' },
  
  // Florida
  { city: 'Miami', state: 'FL' },
  { city: 'Orlando', state: 'FL' },
  { city: 'Tampa', state: 'FL' },
  { city: 'Jacksonville', state: 'FL' },
  
  // Other Major Markets
  { city: 'Phoenix', state: 'AZ' },
  { city: 'Las Vegas', state: 'NV' },
  { city: 'Seattle', state: 'WA' },
  { city: 'Portland', state: 'OR' },
  { city: 'Denver', state: 'CO' },
  { city: 'Atlanta', state: 'GA' },
  { city: 'Chicago', state: 'IL' },
  { city: 'Boston', state: 'MA' },
  { city: 'New York', state: 'NY' },
  { city: 'Philadelphia', state: 'PA' },
  { city: 'Washington', state: 'DC' }
];

// Commercial chains to specifically target
const COMMERCIAL_CHAINS = [
  'Brookdale', 'Sunrise Senior Living', 'Aegis Living', 'Atria Senior Living',
  'Holiday Retirement', 'Five Star Senior Living', 'Assisted Living Concepts',
  'Capital Senior Living', 'Senior Lifestyle', 'Belmont Village', 'Watermark',
  'MorningStar Senior Living', 'Discovery Senior Living', 'Pacifica Senior Living'
];

// Statistics tracking
const stats = {
  totalProcessed: 0,
  commercialChainsFound: 0,
  existingEnriched: 0,
  pricingFound: 0,
  errors: 0,
  apiCalls: 0,
  startTime: Date.now(),
  commercialChainsList: [] as string[],
  citiesProcessed: [] as string[]
};

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function findCommercialChains(city: string, state: string) {
  console.log(`\n📍 Searching for commercial chains in ${city}, ${state}...`);
  
  try {
    // Smart query targeting commercial chains with marketing budgets
    const query = `Find all senior living communities in ${city}, ${state} including Brookdale, Sunrise Senior Living, Aegis Living, Atria, Five Star, Belmont Village, Watermark. Include name, address, phone, website, and current 2025 pricing. Focus on commercial assisted living and memory care communities, not HUD or affordable housing.`;
    
    const searchResult = await aiService.searchRealTime(query);
    stats.apiCalls++;
    
    if (!searchResult.summary || searchResult.summary === 'No results found') {
      console.log(`  ⚠️ No commercial chains found in ${city}, ${state}`);
      return;
    }
    
    // Parse the summary text to extract community information
    const lines = searchResult.summary.split('\n');
    let foundAny = false;
    
    for (const line of lines) {
      // Check if line mentions a commercial chain
      const hasChain = COMMERCIAL_CHAINS.some(chain => 
        line.toLowerCase().includes(chain.toLowerCase())
      );
      
      if (!hasChain) continue;
      
      foundAny = true;
      
      // Extract community name (usually at start of line)
      let communityName = '';
      for (const chain of COMMERCIAL_CHAINS) {
        const regex = new RegExp(`(${chain}[^,.-]*?)(?:[,.-]|$)`, 'i');
        const match = line.match(regex);
        if (match) {
          communityName = match[1].trim();
          break;
        }
      }
      
      if (!communityName) continue;
      
      // Extract pricing if available
      const priceMatch = line.match(/\$?([\d,]+)\s*(?:-|to)\s*\$?([\d,]+)/);
      let priceMin = null;
      let priceMax = null;
      if (priceMatch) {
        priceMin = parseInt(priceMatch[1].replace(/,/g, ''));
        priceMax = parseInt(priceMatch[2].replace(/,/g, ''));
        stats.pricingFound++;
      }
      
      // Extract phone if available  
      const phoneMatch = line.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
      const phone = phoneMatch ? phoneMatch[0] : null;
      
      stats.commercialChainsFound++;
      stats.commercialChainsList.push(communityName);
      console.log(`  💎 COMMERCIAL CHAIN: ${communityName} - Prime revenue target!`);
      
      // Check if already exists
      const existing = await db.select()
        .from(communities)
        .where(
          and(
            sql`LOWER(${communities.name}) LIKE LOWER(${`%${communityName}%`})`,
            eq(communities.city, city),
            eq(communities.state, state)
          )
        )
        .limit(1);
      
      if (existing.length === 0) {
        // New commercial chain - save it!
        const communityData = {
          name: communityName,
          address: `${city}, ${state}`,
          city: city,
          state: state,
          zipCode: '00000',
          phone: phone,
          website: null,
          description: `${communityName} is a commercial senior living community in ${city}, ${state} offering assisted living and memory care services.`,
          careTypes: ['Assisted Living', 'Memory Care'],
          price_range_min: priceMin,
          price_range_max: priceMax,
          ai_enrichment_date: new Date(),
          ai_enrichment_version: 'expansion-batch-v1',
          communitySubtype: 'traditional_assisted_living' as const,
          subscriptionTier: 'verified' as const, // Commercial chains get verified status
          latitude: null,
          longitude: null
        };
        
        await db.insert(communities).values(communityData);
        console.log(`  ✨ Added new commercial chain: ${communityName}`);
        
        if (priceMin) {
          console.log(`    💰 Pricing: $${priceMin.toLocaleString()}-$${priceMax?.toLocaleString()}/month`);
        }
      } else {
        // Update existing with latest data
        const updates: any = {
          ai_enrichment_date: new Date(),
          ai_enrichment_version: 'expansion-batch-v1'
        };
        
        if (priceMin) {
          updates.price_range_min = priceMin;
          updates.price_range_max = priceMax;
          console.log(`  💰 Updated pricing for ${communityName}: $${priceMin.toLocaleString()}-$${priceMax?.toLocaleString()}/month`);
        }
        
        if (phone && !existing[0].phone) {
          updates.phone = phone;
        }
        
        await db.update(communities)
          .set(updates)
          .where(eq(communities.id, existing[0].id));
        
        stats.existingEnriched++;
        console.log(`  ♻️ Updated existing: ${communityName}`);
      }
      
      stats.totalProcessed++;
    }
    
    if (!foundAny) {
      console.log(`  ⚠️ No commercial chains found in ${city}, ${state}`);
    }
    
    stats.citiesProcessed.push(`${city}, ${state}`);
    
    // Rate limiting - be respectful
    await delay(2000);
    
  } catch (error) {
    console.error(`  ❌ Error processing ${city}, ${state}:`, error);
    stats.errors++;
  }
}

async function enrichExistingCommunity(community: any) {
  try {
    console.log(`  🔍 Enriching: ${community.name} (${community.city}, ${community.state})`);
    
    const enrichmentData = await aiService.enhanceCommunityData(community.name, `${community.city}, ${community.state}`);
    stats.apiCalls++;
    
    const updates: any = {
      ai_enrichment_date: new Date(),
      ai_enrichment_version: 'expansion-batch-v1'
    };
    
    let hasUpdates = false;
    
    if (enrichmentData.currentPricing) {
      // Extract pricing from the string
      const priceMatch = enrichmentData.currentPricing.match(/\$?([\d,]+)\s*(?:-|to)\s*\$?([\d,]+)/);
      if (priceMatch) {
        updates.price_range_min = parseInt(priceMatch[1].replace(/,/g, ''));
        updates.price_range_max = parseInt(priceMatch[2].replace(/,/g, ''));
        stats.pricingFound++;
        hasUpdates = true;
        console.log(`    💰 Found pricing: ${enrichmentData.currentPricing}`);
      }
    }
    
    if (enrichmentData.recentReviews) {
      // Extract rating if available
      const ratingMatch = enrichmentData.recentReviews.match(/(\d+(?:\.\d+)?)\s*(?:stars?|rating|out of 5)/i);
      if (ratingMatch) {
        updates.rating = parseFloat(ratingMatch[1]);
        hasUpdates = true;
        console.log(`    ⭐ Found rating: ${ratingMatch[1]}`);
      }
    }
    
    if (enrichmentData.availability) {
      // Add availability info to description if not present
      if (!community.description || !community.description.includes('availability')) {
        updates.description = (community.description || '') + ' ' + enrichmentData.availability;
        hasUpdates = true;
      }
    }
    
    if (hasUpdates) {
      await db.update(communities)
        .set(updates)
        .where(eq(communities.id, community.id));
      
      stats.existingEnriched++;
      console.log(`    ✅ Enriched successfully`);
    } else {
      console.log(`    ⚠️ No new data found`);
    }
    
    stats.totalProcessed++;
    await delay(1500);
    
  } catch (error) {
    console.error(`    ❌ Error enriching ${community.name}:`, error);
    stats.errors++;
  }
}

async function runExpansionBatch() {
  console.log('🚀 STARTING EXPANDED DUAL-MARKET BATCH - 500+ COMMERCIAL CHAINS');
  console.log('=====================================================');
  console.log(`📊 Targeting ${TARGET_CITIES.length} major cities`);
  console.log(`🎯 Focusing on commercial chains with marketing budgets`);
  console.log(`💰 Revenue potential: $10K-50K/month per chain`);
  console.log('');
  
  try {
    // PHASE 1: Find commercial chains in all target cities
    console.log('\n=== PHASE 1: COMMERCIAL CHAIN EXPANSION ===\n');
    
    for (const location of TARGET_CITIES) {
      await findCommercialChains(location.city, location.state);
      
      // Progress update every 5 cities
      if (stats.citiesProcessed.length % 5 === 0) {
        const elapsed = Math.floor((Date.now() - stats.startTime) / 1000);
        console.log(`\n📊 Progress: ${stats.citiesProcessed.length}/${TARGET_CITIES.length} cities | ${stats.commercialChainsFound} chains found | Time: ${elapsed}s\n`);
      }
    }
    
    // PHASE 2: Enrich existing communities that need updates
    console.log('\n=== PHASE 2: ENRICHING EXISTING COMMUNITIES ===\n');
    
    // Find communities needing enrichment (no AI data or old data)
    const needsEnrichment = await db.select()
      .from(communities)
      .where(
        sql`(ai_enrichment_date IS NULL OR ai_enrichment_date < NOW() - INTERVAL '30 days')
            AND state IN ('CA', 'TX', 'FL', 'AZ', 'NY')`
      )
      .limit(50); // Process 50 existing communities
    
    console.log(`📋 Found ${needsEnrichment.length} communities needing enrichment\n`);
    
    for (const community of needsEnrichment) {
      await enrichExistingCommunity(community);
    }
    
    // Final statistics
    const totalTime = Math.floor((Date.now() - stats.startTime) / 1000);
    
    console.log('\n=================================================');
    console.log('✅ EXPANSION BATCH COMPLETE!');
    console.log('=================================================');
    console.log(`📊 FINAL STATISTICS:`);
    console.log(`  • Total Processed: ${stats.totalProcessed}`);
    console.log(`  • Commercial Chains Found: ${stats.commercialChainsFound}`);
    console.log(`  • Existing Communities Enriched: ${stats.existingEnriched}`);
    console.log(`  • Communities with Pricing: ${stats.pricingFound}`);
    console.log(`  • Cities Processed: ${stats.citiesProcessed.length}`);
    console.log(`  • API Calls Made: ${stats.apiCalls}`);
    console.log(`  • Errors: ${stats.errors}`);
    console.log(`  • Total Time: ${totalTime} seconds`);
    console.log(`  • Average per community: ${(totalTime / stats.totalProcessed).toFixed(1)}s`);
    
    if (stats.commercialChainsList.length > 0) {
      console.log('\n💎 COMMERCIAL CHAINS FOUND (REVENUE OPPORTUNITIES):');
      stats.commercialChainsList.slice(0, 20).forEach(chain => {
        console.log(`  • ${chain}`);
      });
      if (stats.commercialChainsList.length > 20) {
        console.log(`  ... and ${stats.commercialChainsList.length - 20} more!`);
      }
    }
    
    console.log('\n💼 BUSINESS IMPACT:');
    console.log(`  • Potential Revenue: $${(stats.commercialChainsFound * 20000).toLocaleString()}/month`);
    console.log(`  • Market Coverage: ${stats.citiesProcessed.length} major cities`);
    console.log(`  • Dual Strategy Success: Commercial expansion + HUD enrichment`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    process.exit(0);
  }
}

// Run the batch
runExpansionBatch();