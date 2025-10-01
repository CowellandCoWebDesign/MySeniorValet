#!/usr/bin/env tsx
/**
 * SIMPLE Safe Duplicate Cleanup Script
 * Uses direct SQL queries to avoid ORM issues
 */

import { db } from '../db';
import { communities } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

async function runSimpleCleanup() {
  console.log('=====================================');
  console.log('🧹 SIMPLE DUPLICATE CLEANUP');
  console.log('=====================================');
  console.log('');
  
  try {
    // Step 1: Find duplicates using direct SQL
    console.log('📊 Finding duplicate communities...\n');
    
    const duplicates = await db.execute(sql`
      WITH duplicate_groups AS (
        SELECT 
          LOWER(name) as name_lower,
          LOWER(city) as city_lower,
          LOWER(state) as state_lower,
          COUNT(*) as duplicate_count,
          MIN(id) as keep_id,
          ARRAY_AGG(id ORDER BY 
            CASE WHEN hud_property_id IS NOT NULL THEN 0 ELSE 1 END,
            CASE WHEN photos IS NOT NULL AND array_length(photos, 1) > 0 THEN 0 ELSE 1 END,
            CASE WHEN website IS NOT NULL THEN 0 ELSE 1 END,
            created_at ASC
          ) as all_ids
        FROM communities
        GROUP BY LOWER(name), LOWER(city), LOWER(state)
        HAVING COUNT(*) = 2  -- Only handle pairs for safety
      )
      SELECT 
        dg.*,
        c1.name as actual_name,
        c1.hud_property_id as keep_hud,
        c2.hud_property_id as remove_hud,
        CASE WHEN c1.photos IS NOT NULL THEN array_length(c1.photos, 1) ELSE 0 END as keep_photos,
        CASE WHEN c2.photos IS NOT NULL THEN array_length(c2.photos, 1) ELSE 0 END as remove_photos,
        c1.website as keep_website,
        c2.website as remove_website
      FROM duplicate_groups dg
      JOIN communities c1 ON c1.id = dg.all_ids[1]
      JOIN communities c2 ON c2.id = dg.all_ids[2]
      WHERE 
        -- Only remove if one clearly has better data
        (c1.hud_property_id IS NOT NULL AND c2.hud_property_id IS NULL)
        OR (
          (CASE WHEN c1.photos IS NOT NULL THEN array_length(c1.photos, 1) ELSE 0 END) >= 3
          AND (CASE WHEN c2.photos IS NOT NULL THEN array_length(c2.photos, 1) ELSE 0 END) = 0
        )
        OR (
          c1.website IS NOT NULL AND c2.website IS NULL
          AND c1.phone IS NOT NULL AND c2.phone IS NULL
        )
      LIMIT 50
    `);
    
    if (duplicates.rows.length === 0) {
      console.log('✅ No obvious duplicates found that are safe to remove.');
      console.log('    All remaining duplicates need manual review.');
      return;
    }
    
    console.log(`Found ${duplicates.rows.length} duplicate pairs safe to remove:\n`);
    
    // Display what will be removed
    for (const dup of duplicates.rows) {
      console.log(`📍 ${dup.actual_name} in ${dup.city_lower}, ${dup.state_lower}`);
      console.log(`   Keeping ID: ${dup.all_ids[0]} (HUD: ${dup.keep_hud ? 'Yes' : 'No'}, Photos: ${dup.keep_photos}, Website: ${dup.keep_website ? 'Yes' : 'No'})`);
      console.log(`   Removing ID: ${dup.all_ids[1]} (HUD: ${dup.remove_hud ? 'Yes' : 'No'}, Photos: ${dup.remove_photos}, Website: ${dup.remove_website ? 'Yes' : 'No'})`);
      console.log('');
    }
    
    console.log('⚠️  This will permanently remove duplicate records!');
    console.log(`   Will remove ${duplicates.rows.length} duplicates.`);
    console.log('');
    console.log('Starting removal process...\n');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const dup of duplicates.rows) {
      try {
        const keepId = dup.all_ids[0];
        const removeId = dup.all_ids[1];
        
        // Delete the duplicate
        await db.delete(communities).where(eq(communities.id, removeId));
        
        console.log(`✅ Removed duplicate ${removeId} (kept ${keepId}) for ${dup.actual_name}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error removing duplicate:`, error);
        errorCount++;
      }
    }
    
    console.log('');
    console.log('=====================================');
    console.log('✅ CLEANUP COMPLETE');
    console.log('=====================================');
    console.log(`Successfully removed: ${successCount} duplicates`);
    if (errorCount > 0) {
      console.log(`Errors: ${errorCount}`);
    }
    
    // Count remaining duplicates
    const remaining = await db.execute(sql`
      SELECT COUNT(*) as remaining_groups
      FROM (
        SELECT name, city, state
        FROM communities
        GROUP BY LOWER(name), LOWER(city), LOWER(state)
        HAVING COUNT(*) > 1
      ) as dup_groups
    `);
    
    console.log(`Remaining duplicate groups: ${remaining.rows[0].remaining_groups}`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the cleanup
console.log('Starting simple duplicate cleanup...\n');
runSimpleCleanup()
  .then(() => {
    console.log('\nScript completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });