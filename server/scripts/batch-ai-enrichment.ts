#!/usr/bin/env tsx
/**
 * Strategic Batch AI Enrichment Script
 * Enriches 5,000 communities across major cities with optimized API usage
 * Distribution: 70% US (3,500), 15% Canada (750), 15% Mexico (750)
 * Strategy: City-wide searches first, then individual enrichment
 * Run with: npm run enrich-communities
 */

import { db } from "../db";
import { communities } from "@shared/schema";
import { eq, or, isNull, sql, asc, desc, and, inArray } from "drizzle-orm";
import { multiAIVerificationService } from "../multi-ai-verification-service";
import { PerplexityAIService } from "../perplexity-ai-service";

const BATCH_SIZE = 10; // Process 10 communities at a time
const DELAY_MS = 2000; // 2 second delay between batches to avoid API rate limits
const CITY_DELAY_MS = 5000; // 5 second delay between city searches

// Strategic distribution
const TARGET_US = 3500;      // 70% of 5000
const TARGET_CANADA = 750;   // 15% of 5000
const TARGET_MEXICO = 750;   // 15% of 5000

// Major cities by country
const MAJOR_US_CITIES = [
  { city: 'New York', state: 'NY', target: 300 },
  { city: 'Los Angeles', state: 'CA', target: 250 },
  { city: 'Chicago', state: 'IL', target: 200 },
  { city: 'Houston', state: 'TX', target: 200 },
  { city: 'Phoenix', state: 'AZ', target: 150 },
  { city: 'Philadelphia', state: 'PA', target: 150 },
  { city: 'San Antonio', state: 'TX', target: 150 },
  { city: 'San Diego', state: 'CA', target: 150 },
  { city: 'Dallas', state: 'TX', target: 150 },
  { city: 'San Jose', state: 'CA', target: 100 },
  { city: 'Austin', state: 'TX', target: 100 },
  { city: 'Jacksonville', state: 'FL', target: 100 },
  { city: 'Fort Worth', state: 'TX', target: 100 },
  { city: 'Columbus', state: 'OH', target: 100 },
  { city: 'San Francisco', state: 'CA', target: 100 },
  { city: 'Charlotte', state: 'NC', target: 100 },
  { city: 'Indianapolis', state: 'IN', target: 100 },
  { city: 'Seattle', state: 'WA', target: 100 },
  { city: 'Denver', state: 'CO', target: 100 },
  { city: 'Boston', state: 'MA', target: 100 },
  { city: 'Miami', state: 'FL', target: 100 },
  { city: 'Atlanta', state: 'GA', target: 100 },
  { city: 'Las Vegas', state: 'NV', target: 100 },
  { city: 'Portland', state: 'OR', target: 100 },
  { city: 'Detroit', state: 'MI', target: 100 },
  { city: 'Memphis', state: 'TN', target: 50 },
  { city: 'Nashville', state: 'TN', target: 50 },
  { city: 'Baltimore', state: 'MD', target: 50 },
  { city: 'Milwaukee', state: 'WI', target: 50 },
  { city: 'Albuquerque', state: 'NM', target: 50 }
];

const MAJOR_CANADIAN_CITIES = [
  { city: 'Toronto', state: 'ON', target: 200 },
  { city: 'Montreal', state: 'QC', target: 150 },
  { city: 'Vancouver', state: 'BC', target: 100 },
  { city: 'Calgary', state: 'AB', target: 75 },
  { city: 'Edmonton', state: 'AB', target: 50 },
  { city: 'Ottawa', state: 'ON', target: 50 },
  { city: 'Winnipeg', state: 'MB', target: 50 },
  { city: 'Quebec City', state: 'QC', target: 25 },
  { city: 'Hamilton', state: 'ON', target: 25 },
  { city: 'Kitchener', state: 'ON', target: 25 }
];

const MAJOR_MEXICAN_CITIES = [
  { city: 'Mexico City', state: 'CDMX', target: 200 },
  { city: 'Guadalajara', state: 'JAL', target: 150 },
  { city: 'Monterrey', state: 'NL', target: 100 },
  { city: 'Puebla', state: 'PUE', target: 75 },
  { city: 'Tijuana', state: 'BC', target: 50 },
  { city: 'León', state: 'GTO', target: 50 },
  { city: 'Juárez', state: 'CHIH', target: 50 },
  { city: 'Zapopan', state: 'JAL', target: 25 },
  { city: 'Querétaro', state: 'QRO', target: 25 },
  { city: 'San Luis Potosí', state: 'SLP', target: 25 }
];

// Cache for city-wide search results
const cityCache = new Map<string, any>();

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Perform city-wide search to gather bulk information
 * This reduces API calls by getting general information about all communities in a city
 */
async function performCityWideSearch(city: string, state: string, country: string = 'US') {
  const cacheKey = `${city}-${state}-${country}`;
  
  // Check if we already have city data
  if (cityCache.has(cacheKey)) {
    console.log(`📦 Using cached data for ${city}, ${state}`);
    return cityCache.get(cacheKey);
  }
  
  console.log(`🔍 Performing city-wide search for ${city}, ${state} (${country})`);
  
  try {
    const perplexityService = new PerplexityAIService();
    
    // Craft comprehensive city-wide query
    const query = `Senior living communities in ${city}, ${state} ${country === 'Canada' ? 'Canada' : country === 'Mexico' ? 'Mexico' : ''}: comprehensive list with pricing ranges, care types, amenities, contact information, and descriptions. Include assisted living, independent living, memory care, nursing homes, HUD housing, and continuing care retirement communities.`;
    
    const response = await perplexityService.search(query);
    
    // Cache the response
    cityCache.set(cacheKey, response);
    
    console.log(`✅ City-wide search complete for ${city}, ${state}`);
    return response;
  } catch (error) {
    console.error(`❌ City-wide search failed for ${city}, ${state}:`, error);
    return null;
  }
}

/**
 * Extract relevant information from city-wide search for a specific community
 */
function extractCommunityInfoFromCityData(communityName: string, cityData: any): any {
  if (!cityData || !cityData.answer) return null;
  
  const answer = cityData.answer.toLowerCase();
  const nameLower = communityName.toLowerCase();
  
  // Try to find mentions of this specific community
  const nameIndex = answer.indexOf(nameLower);
  if (nameIndex === -1) return null;
  
  // Extract context around the community name (500 chars before and after)
  const contextStart = Math.max(0, nameIndex - 500);
  const contextEnd = Math.min(answer.length, nameIndex + nameLower.length + 500);
  const context = cityData.answer.substring(contextStart, contextEnd);
  
  return {
    context,
    sources: cityData.sources || []
  };
}

async function enrichCommunity(community: any, cityData: any = null) {
  try {
    console.log(`🔄 Enriching: ${community.name} (ID: ${community.id})`);
    
    // Initialize search data
    const searchData = {
      name: community.name,
      city: community.city,
      state: community.state,
      careTypes: community.careTypes || [],
      communityType: community.communityType || 'Senior Living'
    };
    
    // Try to get AI enrichment
    const verificationReport = await multiAIVerificationService.verifyRealTimeData(
      community.id,
      community.name,
      searchData,
      {
        city: community.city,
        state: community.state,
        zipCode: community.zip,
        address: community.address,
        careTypes: community.careTypes || [],
        communityType: community.communityType,
        communitySubtype: community.communitySubtype,
        rating: community.rating,
        bedCount: community.bedCount,
        yearEstablished: community.yearEstablished,
        description: community.description,
        ownershipType: community.ownershipType,
        certifications: community.certifications || [],
        hudPropertyId: community.hudPropertyId
      }
    );
    
    // Extract and save enriched data
    const updateData: any = {};
    
    // Extract enriched description from AI insights
    if (verificationReport.aiInsights) {
      const aiDescription = [];
      
      if (verificationReport.aiInsights.claude?.overview) {
        aiDescription.push(verificationReport.aiInsights.claude.overview);
      }
      if (verificationReport.aiInsights.chatgpt?.overview) {
        aiDescription.push(verificationReport.aiInsights.chatgpt.overview);
      }
      if (verificationReport.aiInsights.perplexity?.overview) {
        aiDescription.push(verificationReport.aiInsights.perplexity.overview);
      }
      
      const combinedDescription = aiDescription
        .filter(desc => desc && desc.length > 0)
        .join('\n\n')
        .substring(0, 2000);
      
      if (combinedDescription && combinedDescription.length > 100) {
        updateData.description = combinedDescription;
      }
    }
    
    // Extract pricing if available
    if (verificationReport.pricing?.verified) {
      if (verificationReport.pricing.monthlyFrom) {
        updateData.price_range_min = verificationReport.pricing.monthlyFrom;
      }
      if (verificationReport.pricing.monthlyTo) {
        updateData.price_range_max = verificationReport.pricing.monthlyTo;
      }
    }
    
    // Extract care types if available
    if (verificationReport.careTypes?.length > 0) {
      updateData.careTypes = verificationReport.careTypes;
    }
    
    // Extract amenities if available
    if (verificationReport.amenities?.length > 0) {
      updateData.amenities = verificationReport.amenities;
    }
    
    // Save if we have enriched data
    if (Object.keys(updateData).length > 0) {
      updateData.ai_enrichment_date = new Date();
      updateData.ai_enrichment_version = 'batch-v2.0';
      
      await db
        .update(communities)
        .set(updateData)
        .where(eq(communities.id, community.id));
      
      console.log(`✅ Enriched: ${community.name} (${Object.keys(updateData).length} fields updated)`);
      return true;
    } else {
      console.log(`⚠️ No enrichment data for: ${community.name}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error enriching ${community.name}:`, error);
    return false;
  }
}

async function processCityBatch(cityInfo: any, country: string = 'US') {
  const { city, state, target } = cityInfo;
  
  console.log(`\n🏙️ Processing ${city}, ${state} (Target: ${target} communities)`);
  console.log('─'.repeat(60));
  
  // First, perform city-wide search to gather bulk information
  const cityData = await performCityWideSearch(city, state, country);
  
  // Get communities in this city that need enrichment
  const cityCommunitiesToEnrich = await db
    .select()
    .from(communities)
    .where(
      and(
        eq(communities.city, city),
        eq(communities.state, state),
        or(
          isNull(communities.description),
          sql`${communities.description} = ''`,
          sql`LENGTH(${communities.description}) < 300`
        )
      )
    )
    .orderBy(
      desc(communities.rating),
      asc(sql`LENGTH(COALESCE(${communities.description}, ''))`),
      desc(communities.reviewCount)
    )
    .limit(target);
  
  console.log(`📊 Found ${cityCommunitiesToEnrich.length} communities to enrich in ${city}`);
  
  let citySuccessCount = 0;
  let cityErrorCount = 0;
  
  // Process communities in this city
  for (let i = 0; i < cityCommunitiesToEnrich.length; i += BATCH_SIZE) {
    const batch = cityCommunitiesToEnrich.slice(i, i + BATCH_SIZE);
    
    // Process batch in parallel, passing city data to each
    const results = await Promise.all(
      batch.map(community => enrichCommunity(community, cityData))
    );
    
    // Count successes
    results.forEach(success => {
      if (success) citySuccessCount++;
      else cityErrorCount++;
    });
    
    // Small delay between batches
    if (i + BATCH_SIZE < cityCommunitiesToEnrich.length) {
      await sleep(DELAY_MS);
    }
  }
  
  console.log(`✅ ${city}: Enriched ${citySuccessCount}, Failed ${cityErrorCount}`);
  
  return { success: citySuccessCount, error: cityErrorCount };
}

async function main() {
  console.log('🚀 Starting Strategic Batch AI Enrichment Process');
  console.log('================================================');
  console.log('📊 Distribution: 70% US (3,500) | 15% Canada (750) | 15% Mexico (750)');
  console.log('🎯 Strategy: City-wide searches first, then individual enrichment');
  console.log('');
  
  try {
    let totalSuccessCount = 0;
    let totalErrorCount = 0;
    
    // Process US cities (70% - 3,500 communities)
    console.log('\n🇺🇸 PROCESSING US MAJOR CITIES (Target: 3,500 communities)');
    console.log('═'.repeat(60));
    
    for (const cityInfo of MAJOR_US_CITIES) {
      const result = await processCityBatch(cityInfo, 'US');
      totalSuccessCount += result.success;
      totalErrorCount += result.error;
      
      // Delay between cities to avoid overloading APIs
      await sleep(CITY_DELAY_MS);
    }
    
    console.log('\n📊 US Progress: ' + totalSuccessCount + ' enriched, ' + totalErrorCount + ' failed');
    
    // Process Canadian cities (15% - 750 communities)
    console.log('\n🇨🇦 PROCESSING CANADIAN MAJOR CITIES (Target: 750 communities)');
    console.log('═'.repeat(60));
    
    for (const cityInfo of MAJOR_CANADIAN_CITIES) {
      const result = await processCityBatch(cityInfo, 'Canada');
      totalSuccessCount += result.success;
      totalErrorCount += result.error;
      
      // Delay between cities
      await sleep(CITY_DELAY_MS);
    }
    
    console.log('\n📊 Canada Progress: ' + totalSuccessCount + ' total enriched');
    
    // Process Mexican cities (15% - 750 communities)
    console.log('\n🇲🇽 PROCESSING MEXICAN MAJOR CITIES (Target: 750 communities)');
    console.log('═'.repeat(60));
    
    for (const cityInfo of MAJOR_MEXICAN_CITIES) {
      const result = await processCityBatch(cityInfo, 'Mexico');
      totalSuccessCount += result.success;
      totalErrorCount += result.error;
      
      // Delay between cities
      await sleep(CITY_DELAY_MS);
    }
    
    // Final report
    console.log('\n' + '='.repeat(50));
    console.log('🎉 STRATEGIC BATCH ENRICHMENT COMPLETE');
    console.log('='.repeat(50));
    console.log(`✅ Successfully enriched: ${totalSuccessCount} communities`);
    console.log(`❌ Failed to enrich: ${totalErrorCount} communities`);
    console.log(`📊 Success rate: ${Math.round((totalSuccessCount / (totalSuccessCount + totalErrorCount)) * 100)}%`);
    console.log(`📍 Cities processed: ${MAJOR_US_CITIES.length + MAJOR_CANADIAN_CITIES.length + MAJOR_MEXICAN_CITIES.length}`);
    
    // Check overall data quality
    const [stats] = await db
      .select({
        total: sql`COUNT(*)`,
        withDescription: sql`COUNT(CASE WHEN LENGTH(${communities.description}) > 100 THEN 1 END)`,
        comprehensive: sql`COUNT(CASE WHEN LENGTH(${communities.description}) > 600 THEN 1 END)`
      })
      .from(communities);
    
    console.log('\n📊 OVERALL DATA QUALITY:');
    console.log(`Total communities: ${stats.total}`);
    console.log(`With descriptions: ${stats.withDescription} (${Math.round((Number(stats.withDescription) / Number(stats.total)) * 100)}%)`);
    console.log(`Comprehensive: ${stats.comprehensive} (${Math.round((Number(stats.comprehensive) / Number(stats.total)) * 100)}%)`);
    
  } catch (error) {
    console.error('❌ Fatal error in batch enrichment:', error);
    process.exit(1);
  }
}

// Run if executed directly
// Use import.meta.url for ES module check
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  main()
    .then(() => {
      console.log('\n✨ Script completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

export { enrichCommunity, main as batchEnrich };