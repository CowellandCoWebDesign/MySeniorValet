import { db } from '../db';
import { marketplaceVendors, communities } from '@shared/schema';
import { like, or, and, isNotNull } from 'drizzle-orm';

async function cleanupExpiredAmazonLinks() {
  console.log('🧹 Starting cleanup of expired Amazon affiliate links...');
  
  try {
    // Find all vendors with Amazon affiliate links
    const amazonVendors = await db
      .select()
      .from(marketplaceVendors)
      .where(
        or(
          like(marketplaceVendors.externalUrl, '%amazon.com%'),
          like(marketplaceVendors.externalUrl, '%amzn.to%'),
          like(marketplaceVendors.affiliateLink, '%amazon.com%'),
          like(marketplaceVendors.affiliateLink, '%amzn.to%')
        )
      );
    
    console.log(`Found ${amazonVendors.length} vendors with Amazon links`);
    
    // Clear expired Amazon affiliate links
    const result = await db
      .update(marketplaceVendors)
      .set({
        affiliateLink: null,
        externalUrl: null
      })
      .where(
        or(
          like(marketplaceVendors.externalUrl, '%amazon.com%'),
          like(marketplaceVendors.externalUrl, '%amzn.to%'),
          like(marketplaceVendors.affiliateLink, '%amazon.com%'),
          like(marketplaceVendors.affiliateLink, '%amzn.to%')
        )
      );
    
    console.log('✅ Cleared Amazon affiliate links from marketplace vendors');
    
    // Also check communities table for any Amazon links in website field
    const communitiesWithAmazon = await db
      .select({
        id: communities.id,
        name: communities.name,
        website: communities.website
      })
      .from(communities)
      .where(
        and(
          isNotNull(communities.website),
          or(
            like(communities.website, '%amazon.com%'),
            like(communities.website, '%amzn.to%')
          )
        )
      );
    
    if (communitiesWithAmazon.length > 0) {
      console.log(`Found ${communitiesWithAmazon.length} communities with Amazon links in website field`);
      
      // Clear Amazon links from communities
      await db
        .update(communities)
        .set({ website: null })
        .where(
          or(
            like(communities.website, '%amazon.com%'),
            like(communities.website, '%amzn.to%')
          )
        );
      
      console.log('✅ Cleared Amazon links from communities website field');
    }
    
    console.log('🎉 Cleanup complete! All expired Amazon affiliate links have been removed.');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

// Run the cleanup
cleanupExpiredAmazonLinks()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });