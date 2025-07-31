import { generateThematicImage } from './server/services/imageGeneration';
import { db } from './server/db';
import { marketplaceVendors } from './shared/schema';
import { eq } from 'drizzle-orm';

async function testImprovedImageGeneration() {
  console.log('🎨 Testing AI-Enhanced Image Generation\n');
  
  // Test with a few key vendors
  const testVendors = ['Walmart', 'Uber', 'CVS Pharmacy'];
  
  for (const vendorName of testVendors) {
    console.log(`\n📸 Generating enhanced image for ${vendorName}...`);
    
    try {
      // Generate new image with enhanced prompt
      const imageUrl = await generateThematicImage(vendorName);
      
      if (imageUrl) {
        console.log(`✅ Successfully generated image for ${vendorName}`);
        console.log(`   Preview URL: ${imageUrl}\n`);
        
        // Update in database
        await db
          .update(marketplaceVendors)
          .set({ logoUrl: imageUrl })
          .where(eq(marketplaceVendors.name, vendorName));
        
        console.log(`   Image saved to database`);
      } else {
        console.log(`❌ Failed to generate image for ${vendorName}`);
      }
    } catch (error) {
      console.error(`Error with ${vendorName}:`, error);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n✨ Test complete! Check the vendor marketplace to see the improved images.');
}

// Run the test
testImprovedImageGeneration()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });