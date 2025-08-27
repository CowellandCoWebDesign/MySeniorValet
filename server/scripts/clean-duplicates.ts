#!/usr/bin/env tsx
import { DuplicateDetectionService } from '../services/duplicate-detection-service';
import { db } from '../db';
import { communities } from '../../shared/schema';
import { sql } from 'drizzle-orm';

interface CleanupOptions {
  autoMerge?: boolean;
  threshold?: number;
  limit?: number;
  dryRun?: boolean;
}

async function cleanDuplicates(options: CleanupOptions = {}) {
  const { 
    autoMerge = false, 
    threshold = 95, 
    limit = 100,
    dryRun = true 
  } = options;

  console.log('🧹 MySeniorValet Duplicate Cleanup Tool');
  console.log('='.repeat(50));
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes will be made)' : '⚠️  LIVE MODE'}`);
  console.log(`Threshold: ${threshold}% similarity`);
  console.log(`Limit: ${limit} groups`);
  console.log('');
  
  const service = new DuplicateDetectionService();
  
  // Get current stats
  console.log('📊 Current Database Status:');
  const [{ count: totalBefore }] = await db
    .select({ count: sql<string>`COUNT(*)` })
    .from(communities);
  console.log(`  Total communities: ${parseInt(totalBefore).toLocaleString()}`);
  
  // Find duplicates
  console.log(`\n🔍 Finding duplicates at ${threshold}% similarity...`);
  const groups = await service.findDuplicates(threshold);
  
  console.log(`  Found ${groups.length} duplicate groups`);
  const totalDuplicates = groups.reduce((sum, g) => sum + g.duplicates.length, 0);
  console.log(`  Total duplicates: ${totalDuplicates}`);
  
  // Filter for auto-merge candidates
  const autoMergeCandidates = groups.filter(g => 
    g.duplicates.length === 1 && g.duplicates[0].similarity >= threshold
  ).slice(0, limit);
  
  console.log(`\n🎯 Auto-merge candidates: ${autoMergeCandidates.length}`);
  
  if (autoMergeCandidates.length === 0) {
    console.log('  No suitable candidates found for auto-merge');
    return;
  }
  
  // Process merges
  if (autoMerge) {
    console.log('\n📝 Processing merges...');
    let successCount = 0;
    let failCount = 0;
    let enhancedFields = new Set<string>();
    
    for (const group of autoMergeCandidates) {
      try {
        const duplicate = group.duplicates[0];
        
        if (dryRun) {
          console.log(`  [DRY RUN] Would merge: "${duplicate.name}" into "${group.primaryName}"`);
          successCount++;
        } else {
          // Determine which one has better data
          const result = await service.mergeDuplicates(
            group.primaryId,
            [duplicate.id]
          );
          
          result.mergedFields.forEach(field => enhancedFields.add(field));
          console.log(`  ✅ Merged: "${duplicate.name}" into "${group.primaryName}"`);
          if (result.mergedFields.length > 0) {
            console.log(`     Enhanced fields: ${result.mergedFields.join(', ')}`);
          }
          successCount++;
        }
      } catch (error) {
        console.error(`  ❌ Failed to merge group ${group.primaryId}:`, error);
        failCount++;
      }
    }
    
    console.log(`\n📊 Merge Results:`);
    console.log(`  Successful merges: ${successCount}`);
    console.log(`  Failed merges: ${failCount}`);
    
    if (!dryRun && enhancedFields.size > 0) {
      console.log(`  Enhanced fields across all merges: ${Array.from(enhancedFields).join(', ')}`);
    }
    
    // Get final count
    if (!dryRun) {
      const [{ count: totalAfter }] = await db
        .select({ count: sql<string>`COUNT(*)` })
        .from(communities);
      const reduction = parseInt(totalBefore) - parseInt(totalAfter);
      
      console.log(`\n✨ Final Database Status:`);
      console.log(`  Before: ${parseInt(totalBefore).toLocaleString()} communities`);
      console.log(`  After: ${parseInt(totalAfter).toLocaleString()} communities`);
      console.log(`  Removed: ${reduction.toLocaleString()} duplicates`);
    }
  } else {
    // Just show what would be merged
    console.log('\n📋 Preview of duplicates to merge:');
    autoMergeCandidates.slice(0, 10).forEach((group, idx) => {
      const duplicate = group.duplicates[0];
      console.log(`  ${idx + 1}. "${group.primaryName}" <- "${duplicate.name}" (${duplicate.similarity}% match)`);
      console.log(`     Location: ${group.primaryLocation}`);
    });
    
    console.log(`\n💡 To perform the merge, run with --auto-merge flag`);
  }
  
  console.log('\n✅ Cleanup process complete');
}

// Parse command line arguments
const args = process.argv.slice(2);
const options: CleanupOptions = {
  autoMerge: args.includes('--auto-merge'),
  dryRun: !args.includes('--live'),
  threshold: 95,
  limit: 100
};

// Parse threshold if provided
const thresholdIdx = args.indexOf('--threshold');
if (thresholdIdx !== -1 && args[thresholdIdx + 1]) {
  options.threshold = parseInt(args[thresholdIdx + 1]);
}

// Parse limit if provided
const limitIdx = args.indexOf('--limit');
if (limitIdx !== -1 && args[limitIdx + 1]) {
  options.limit = parseInt(args[limitIdx + 1]);
}

// Show help
if (args.includes('--help')) {
  console.log(`
MySeniorValet Duplicate Cleanup Tool

Usage: tsx clean-duplicates.ts [options]

Options:
  --auto-merge      Automatically merge duplicates
  --live           Perform actual database changes (default is dry run)
  --threshold <n>  Set similarity threshold (default: 95)
  --limit <n>      Maximum number of groups to process (default: 100)
  --help           Show this help message

Examples:
  # Preview duplicates without making changes
  tsx clean-duplicates.ts

  # Auto-merge duplicates in dry run mode
  tsx clean-duplicates.ts --auto-merge

  # Perform actual merge of top 50 duplicates
  tsx clean-duplicates.ts --auto-merge --live --limit 50

  # Use 90% similarity threshold
  tsx clean-duplicates.ts --threshold 90 --auto-merge
`);
  process.exit(0);
}

cleanDuplicates(options)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });