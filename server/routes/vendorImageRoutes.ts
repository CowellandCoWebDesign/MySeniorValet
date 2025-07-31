import { Router } from 'express';
import { db } from '../db';
import { marketplaceVendors } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { generateThematicImage } from '../services/imageGeneration';

const router = Router();

// Generate thematic image for a specific vendor
router.post('/api/marketplace/vendors/:vendorId/generate-image', async (req, res) => {
  try {
    const vendorId = parseInt(req.params.vendorId);
    
    // Get vendor details
    const vendor = await db
      .select()
      .from(marketplaceVendors)
      .where(eq(marketplaceVendors.id, vendorId))
      .limit(1);
    
    if (!vendor.length) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    const vendorData = vendor[0];
    
    // Generate thematic image
    const imageUrl = await generateThematicImage(vendorData.name);
    
    if (!imageUrl) {
      return res.status(500).json({ error: 'Failed to generate image' });
    }
    
    // Update vendor with new image URL
    await db
      .update(marketplaceVendors)
      .set({ logoUrl: imageUrl })
      .where(eq(marketplaceVendors.id, vendorId));
    
    res.json({ 
      success: true, 
      imageUrl,
      vendorName: vendorData.name 
    });
  } catch (error) {
    console.error('Error generating vendor image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate thematic images for all vendors without images
router.post('/api/marketplace/vendors/generate-all-images', async (req, res) => {
  try {
    // Get all vendors
    const vendors = await db.select().from(marketplaceVendors);
    
    const results: {
      success: Array<{ vendorId: number; vendorName: string; imageUrl: string }>;
      failed: Array<{ vendorId: number; vendorName: string; reason: string }>;
      total: number;
    } = {
      success: [],
      failed: [],
      total: vendors.length
    };
    
    // Process vendors in batches
    for (const vendor of vendors) {
      try {
        console.log(`Generating image for ${vendor.name}...`);
        const imageUrl = await generateThematicImage(vendor.name);
        
        if (imageUrl) {
          await db
            .update(marketplaceVendors)
            .set({ logoUrl: imageUrl })
            .where(eq(marketplaceVendors.id, vendor.id));
          
          results.success.push({
            vendorId: vendor.id,
            vendorName: vendor.name,
            imageUrl
          });
        } else {
          results.failed.push({
            vendorId: vendor.id,
            vendorName: vendor.name,
            reason: 'No image generated'
          });
        }
      } catch (error) {
        console.error(`Failed to generate image for ${vendor.name}:`, error);
        results.failed.push({
          vendorId: vendor.id,
          vendorName: vendor.name,
          reason: error instanceof Error ? error.message : 'Unknown error'
        });
      }
      
      // Small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    res.json(results);
  } catch (error) {
    console.error('Error generating vendor images:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as vendorImageRoutes };