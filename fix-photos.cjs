const { Pool } = require('@neondatabase/serverless');
const ws = require('ws');

// Enable WebSocket for Neon serverless
const neonConfig = require('@neondatabase/serverless').neonConfig;
neonConfig.webSocketConstructor = ws;

async function fixPhotoDuplication() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log('🔍 Finding communities with potential photo duplicates...');
    
    // Get communities with many photos (likely duplicates)
    const result = await pool.query(`
      SELECT id, name, photos, array_length(photos, 1) as photo_count
      FROM communities 
      WHERE array_length(photos, 1) > 10
      ORDER BY photo_count DESC
    `);
    
    console.log(`Found ${result.rows.length} communities with high photo counts`);
    
    for (const community of result.rows) {
      console.log(`\n📷 Processing ${community.name} (${community.photo_count} photos)...`);
      
      const photos = community.photos;
      const uniquePhotos = [];
      const seenReferences = new Set();
      
      for (const photo of photos) {
        // Extract photoreference parameter from Google Places photo URL
        const match = photo.match(/photoreference=([^&]+)/);
        const reference = match ? match[1] : photo;
        
        if (!seenReferences.has(reference)) {
          seenReferences.add(reference);
          uniquePhotos.push(photo);
        }
      }
      
      const duplicatesRemoved = photos.length - uniquePhotos.length;
      
      if (duplicatesRemoved > 0) {
        // Update the community with deduplicated photos
        await pool.query(
          'UPDATE communities SET photos = $1 WHERE id = $2',
          [uniquePhotos, community.id]
        );
        
        console.log(`✅ Removed ${duplicatesRemoved} duplicate photos from ${community.name}`);
        console.log(`   Photos: ${photos.length} → ${uniquePhotos.length}`);
      } else {
        console.log(`   No duplicates found`);
      }
    }
    
    console.log('\n🎉 Photo deduplication complete!');
    
  } catch (error) {
    console.error('❌ Error fixing photos:', error);
  } finally {
    await pool.end();
  }
}

fixPhotoDuplication();