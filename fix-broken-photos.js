import { db } from './server/db.js';
import { communities } from './shared/schema.js';
import { eq, isNotNull } from 'drizzle-orm';

async function fixBrokenPhotos() {
  console.log('🔍 Finding communities with broken photos...');
  
  // Get community 285 specifically
  const community = await db.select().from(communities).where(eq(communities.id, 285));
  
  if (community.length > 0) {
    console.log(`Found community: ${community[0].name}`);
    console.log(`Current photos: ${JSON.stringify(community[0].photos)}`);
    
    // Validate each photo URL
    const validPhotos = [];
    const invalidPhotos = [];
    
    if (community[0].photos && Array.isArray(community[0].photos)) {
      for (const photo of community[0].photos) {
        try {
          const response = await fetch(photo, { method: 'HEAD', timeout: 5000 });
          if (response.ok) {
            validPhotos.push(photo);
            console.log(`✅ Valid: ${photo}`);
          } else {
            invalidPhotos.push(photo);
            console.log(`❌ Invalid (${response.status}): ${photo}`);
          }
        } catch (error) {
          invalidPhotos.push(photo);
          console.log(`❌ Invalid (error): ${photo}`);
        }
      }
      
      console.log(`\nValidation complete:`);
      console.log(`  Valid photos: ${validPhotos.length}`);
      console.log(`  Invalid photos: ${invalidPhotos.length}`);
      
      if (invalidPhotos.length > 0) {
        console.log('\n🧹 Removing invalid photos...');
        await db.update(communities)
          .set({ photos: validPhotos.length > 0 ? validPhotos : null })
          .where(eq(communities.id, 285));
        console.log('✅ Photos cleaned successfully!');
      }
    }
  }
}

fixBrokenPhotos().catch(console.error);
