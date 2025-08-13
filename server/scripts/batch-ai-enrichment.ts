#!/usr/bin/env tsx
/**
 * Batch AI Enrichment Script
 * Enriches top communities with AI-generated comprehensive descriptions
 * Run with: npm run enrich-communities
 */

import { db } from "../db";
import { communities } from "@shared/schema";
import { eq, or, isNull, sql, asc, desc } from "drizzle-orm";
import { multiAIVerificationService } from "../multi-ai-verification-service";
import { PerplexityAIService } from "../perplexity-ai-service";

const BATCH_SIZE = 10; // Process 10 communities at a time
const DELAY_MS = 2000; // 2 second delay between batches to avoid API rate limits
const MAX_COMMUNITIES = 5000; // Maximum communities to process

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function enrichCommunity(community: any) {
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

async function main() {
  console.log('🚀 Starting Batch AI Enrichment Process');
  console.log('=====================================');
  
  try {
    // Get communities that need enrichment
    // Priority: 1) No description, 2) Very short description, 3) High rating communities
    const communitiesToEnrich = await db
      .select()
      .from(communities)
      .where(
        or(
          isNull(communities.description),
          sql`${communities.description} = ''`,
          sql`LENGTH(${communities.description}) < 300`
        )
      )
      .orderBy(
        desc(communities.rating),
        asc(sql`LENGTH(COALESCE(${communities.description}, ''))`),
        desc(communities.reviewCount)
      )
      .limit(MAX_COMMUNITIES);
    
    console.log(`📊 Found ${communitiesToEnrich.length} communities to enrich`);
    console.log('');
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process in batches
    for (let i = 0; i < communitiesToEnrich.length; i += BATCH_SIZE) {
      const batch = communitiesToEnrich.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(communitiesToEnrich.length / BATCH_SIZE);
      
      console.log(`\n📦 Processing batch ${batchNumber}/${totalBatches}`);
      console.log('─'.repeat(50));
      
      // Process batch in parallel
      const results = await Promise.all(
        batch.map(community => enrichCommunity(community))
      );
      
      // Count successes
      results.forEach(success => {
        if (success) successCount++;
        else errorCount++;
      });
      
      // Progress update
      const totalProcessed = i + batch.length;
      const percentComplete = Math.round((totalProcessed / communitiesToEnrich.length) * 100);
      console.log(`\n📈 Progress: ${totalProcessed}/${communitiesToEnrich.length} (${percentComplete}%)`);
      console.log(`✅ Success: ${successCount} | ❌ Errors: ${errorCount}`);
      
      // Delay between batches to avoid rate limits
      if (i + BATCH_SIZE < communitiesToEnrich.length) {
        console.log(`⏳ Waiting ${DELAY_MS / 1000} seconds before next batch...`);
        await sleep(DELAY_MS);
      }
    }
    
    // Final report
    console.log('\n' + '='.repeat(50));
    console.log('🎉 BATCH ENRICHMENT COMPLETE');
    console.log('='.repeat(50));
    console.log(`✅ Successfully enriched: ${successCount} communities`);
    console.log(`❌ Failed to enrich: ${errorCount} communities`);
    console.log(`📊 Success rate: ${Math.round((successCount / (successCount + errorCount)) * 100)}%`);
    
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
if (require.main === module) {
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