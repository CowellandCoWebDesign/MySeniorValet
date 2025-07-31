import { db } from './server/db';
import { marketplaceVendors } from './shared/schema';
import { generateThematicImage } from './server/services/imageGeneration';
import { eq } from 'drizzle-orm';

async function generateAllVendorImages() {
  console.log('Starting vendor image generation...');
  
  try {
    // Get all vendors
    const vendors = await db.select().from(marketplaceVendors);
    console.log(`Found ${vendors.length} vendors to process`);
    
    const results = {
      success: 0,
      failed: 0,
      skipped: 0
    };
    
    for (const vendor of vendors) {
      try {
        // Always regenerate to replace actual logos with thematic images
        console.log(`Current logo URL for ${vendor.name}: ${vendor.logoUrl}`);
        
        console.log(`Generating image for ${vendor.name}...`);
        const imageUrl = await generateThematicImage(vendor.name);
        
        if (imageUrl) {
          // Update vendor with new image
          await db
            .update(marketplaceVendors)
            .set({ logoUrl: imageUrl })
            .where(eq(marketplaceVendors.id, vendor.id));
          
          console.log(`✅ Successfully generated image for ${vendor.name}`);
          results.success++;
        } else {
          console.log(`❌ Failed to generate image for ${vendor.name}`);
          results.failed++;
        }
      } catch (error) {
        console.error(`Error processing ${vendor.name}:`, error);
        results.failed++;
      }
      
      // Rate limit - wait 2 seconds between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n=== Image Generation Complete ===');
    console.log(`✅ Success: ${results.success}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`⏭️  Skipped: ${results.skipped}`);
    console.log(`📊 Total: ${vendors.length}`);
    
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
generateAllVendorImages()
  .then(() => {
    console.log('\nAll done! Vendor images have been generated.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });