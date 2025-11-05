import { db } from '../db';
import { perplexityCache, communities } from '../../shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Sync all existing perplexity_cache data to communities table
 * This ensures cached photos and descriptions appear in community directory
 */
async function syncCacheToCommunities() {
  console.log('🔄 Starting sync of perplexity_cache to communities table...');
  
  try {
    // Get all cached data
    const cachedData = await db.select().from(perplexityCache);
    
    console.log(`📊 Found ${cachedData.length} cached entries to sync`);
    
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    for (const cached of cachedData) {
      try {
        // Extract numeric community ID from cacheKey (e.g., "community_12345" -> 12345)
        const communityIdNum = parseInt(cached.communityId.replace('community_', ''));
        
        if (isNaN(communityIdNum)) {
          console.warn(`⚠️ Skipping invalid community ID: ${cached.communityId}`);
          skipCount++;
          continue;
        }
        
        // Convert photo URLs from proxy format back to original URLs
        const photos = cached.photos as string[] || [];
        const originalPhotos = photos.map(url => {
          // If it's a proxied URL, extract the original
          if (typeof url === 'string' && url.includes('/api/image-proxy?url=')) {
            const encoded = url.replace('/api/image-proxy?url=', '');
            return decodeURIComponent(encoded);
          }
          return url;
        });
        
        const updates: any = {};
        let hasUpdates = false;
        
        // Only sync if we have photos or content
        if (originalPhotos.length > 0) {
          updates.photos = originalPhotos;
          hasUpdates = true;
        }
        
        // Sync Perplexity content to description
        if (cached.rawPerplexityContent && cached.rawPerplexityContent.length > 100) {
          // Take first 1000 chars for description field
          updates.description = cached.rawPerplexityContent.substring(0, 1000);
          hasUpdates = true;
        }
        
        if (hasUpdates) {
          updates.updatedAt = new Date();
          
          // Update the community record
          const result = await db
            .update(communities)
            .set(updates)
            .where(eq(communities.id, communityIdNum))
            .returning({ id: communities.id });
          
          if (result.length > 0) {
            console.log(`✅ Synced ${cached.communityName}: ${originalPhotos.length} photos${updates.description ? ' + description' : ''}`);
            successCount++;
          } else {
            console.log(`⚠️ No community found with ID ${communityIdNum} for ${cached.communityName}`);
            skipCount++;
          }
        } else {
          console.log(`⏭️ Skipping ${cached.communityName} - no data to sync`);
          skipCount++;
        }
      } catch (error) {
        console.error(`❌ Error syncing ${cached.communityName}:`, error);
        errorCount++;
      }
    }
    
    console.log('\n📊 Sync Complete:');
    console.log(`✅ Success: ${successCount} communities updated`);
    console.log(`⏭️ Skipped: ${skipCount} communities`);
    console.log(`❌ Errors: ${errorCount} communities`);
    
  } catch (error) {
    console.error('Fatal error during sync:', error);
    process.exit(1);
  }
}

// Run the sync
syncCacheToCommunities()
  .then(() => {
    console.log('✅ Sync completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  });