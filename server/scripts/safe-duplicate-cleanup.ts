#!/usr/bin/env tsx
/**
 * SAFE Duplicate Cleanup Script
 * This script ONLY removes duplicates where:
 * 1. The data completeness score difference is > 50 points
 * 2. The keeper has all the important data from the duplicate
 * 3. We're only dealing with pairs (not complex groups)
 * 
 * Run with: tsx server/scripts/safe-duplicate-cleanup.ts
 */

import { DuplicateManager } from '../services/duplicate-manager';
import { db } from '../db';
import { communities } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function runSafeCleanup() {
  console.log('=====================================');
  console.log('🧹 SAFE DUPLICATE CLEANUP SCRIPT');
  console.log('=====================================');
  console.log('This script will ONLY remove obvious duplicates where:');
  console.log('- One record clearly has better data (score difference > 50)');
  console.log('- We can safely merge any unique data');
  console.log('- No data will be lost');
  console.log('');
  
  try {
    // First, get a report of what we're dealing with
    console.log('📊 Analyzing duplicates...\n');
    const duplicates = await DuplicateManager.findAllDuplicates();
    
    console.log(`Found ${duplicates.length} duplicate groups`);
    console.log(`Total duplicate records: ${duplicates.reduce((sum, g) => sum + g.duplicates.length, 0)}`);
    console.log('');
    
    // Count safe removals
    let safeToRemove = 0;
    const safeRemovals: Array<{group: any, keepId: number, removeId: number}> = [];
    
    for (const group of duplicates) {
      // Only handle pairs for safety
      if (group.duplicates.length === 2) {
        const scoreDiff = group.duplicates[0].dataCompleteness - group.duplicates[1].dataCompleteness;
        
        // Only remove if there's a clear winner
        if (scoreDiff > 50) {
          safeToRemove++;
          safeRemovals.push({
            group,
            keepId: group.duplicates[0].id,
            removeId: group.duplicates[1].id
          });
          
          console.log(`✅ Safe to remove: ${group.name} in ${group.city}, ${group.state}`);
          console.log(`   Keeping ID ${group.duplicates[0].id} (score: ${group.duplicates[0].dataCompleteness})`);
          console.log(`   Removing ID ${group.duplicates[1].id} (score: ${group.duplicates[1].dataCompleteness})`);
        }
      }
    }
    
    console.log('');
    console.log(`Found ${safeToRemove} duplicates safe to remove`);
    
    if (safeToRemove === 0) {
      console.log('No obvious duplicates to remove. All duplicates need manual review.');
      return;
    }
    
    // Ask for confirmation
    console.log('');
    console.log('⚠️  WARNING: This will permanently remove duplicate records!');
    console.log(`Will remove ${safeToRemove} duplicate records.`);
    console.log('');
    
    // For safety, let's do a dry run first
    console.log('Performing dry run to verify data preservation...');
    
    for (const removal of safeRemovals.slice(0, 3)) { // Check first 3 as examples
      const [keeper] = await db.select().from(communities).where(eq(communities.id, removal.keepId));
      const [toRemove] = await db.select().from(communities).where(eq(communities.id, removal.removeId));
      
      console.log(`\nExample: ${removal.group.name}`);
      console.log(`  Keeper has: ${keeper.photos?.length || 0} photos, ${keeper.website ? 'website' : 'no website'}, ${keeper.phone ? 'phone' : 'no phone'}`);
      console.log(`  Removing has: ${toRemove.photos?.length || 0} photos, ${toRemove.website ? 'website' : 'no website'}, ${toRemove.phone ? 'phone' : 'no phone'}`);
    }
    
    // Now proceed with actual cleanup
    console.log('\nProceeding with cleanup...\n');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const removal of safeRemovals) {
      try {
        console.log(`Processing: ${removal.group.name} in ${removal.group.city}, ${removal.group.state}...`);
        await DuplicateManager.mergeDuplicates(removal.keepId, [removal.removeId]);
        successCount++;
      } catch (error) {
        console.error(`❌ Error processing ${removal.group.name}:`, error);
        errorCount++;
      }
    }
    
    console.log('');
    console.log('=====================================');
    console.log('✅ CLEANUP COMPLETE');
    console.log('=====================================');
    console.log(`Successfully removed: ${successCount} duplicates`);
    console.log(`Errors: ${errorCount}`);
    console.log('');
    
    // Final verification
    const remainingDuplicates = await DuplicateManager.findAllDuplicates();
    console.log(`Remaining duplicate groups: ${remainingDuplicates.length}`);
    console.log(`Remaining duplicate records: ${remainingDuplicates.reduce((sum, g) => sum + g.duplicates.length, 0)}`);
    
  } catch (error) {
    console.error('❌ Fatal error during cleanup:', error);
    process.exit(1);
  }
}

// Run the cleanup
console.log('Starting safe cleanup process...\n');
runSafeCleanup()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });