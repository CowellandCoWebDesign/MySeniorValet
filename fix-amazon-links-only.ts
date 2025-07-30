/**
 * Amazon Link Fixer Script
 * Focuses only on fixing shortened/broken Amazon links
 * Skips AI summaries to avoid API cost issues
 */

import { Pool } from '@neondatabase/serverless';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';
import { checkAmazonAffiliateLinkHealth, fixAmazonLink, extractASIN } from './server/amazon-link-health-checker';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fixAmazonLinksOnly() {
  console.log('🔗 Starting Amazon Link Fixing...');
  console.log('📋 This will expand shortened links and fix broken ones\n');
  
  try {
    // Get all Amazon products
    const result = await pool.query(`
      SELECT 
        s.id, 
        s.product_id,
        s.name, 
        s.external_url,
        s.metadata
      FROM services s
      WHERE s.provider_id = 4
      ORDER BY s.id
    `);
    
    const products = result.rows;
    console.log(`Found ${products.length} Amazon products to check\n`);
    
    let healthyCount = 0;
    let fixedCount = 0;
    let failedCount = 0;
    const updates: Array<{
      id: number;
      external_url: string;
      metadata: any;
    }> = [];
    
    for (const product of products) {
      console.log(`\n📦 Processing: ${product.name}`);
      console.log(`   Current URL: ${product.external_url}`);
      
      // Check link health
      const linkHealth = checkAmazonAffiliateLinkHealth(product.external_url);
      console.log(`   Status: ${linkHealth.status} - ${linkHealth.message}`);
      
      if (linkHealth.status === 'healthy') {
        console.log('   ✅ Link is already healthy');
        healthyCount++;
        continue;
      }
      
      // Try to extract ASIN from shortened URL or product_id
      let asin = extractASIN(product.external_url);
      
      // If no ASIN in URL, try product_id field
      if (!asin && product.product_id) {
        asin = product.product_id;
        console.log(`   📌 Using product_id as ASIN: ${asin}`);
      }
      
      // Build proper Amazon URL
      let newUrl = product.external_url;
      if (asin) {
        // Build full product URL with ASIN
        newUrl = `https://www.amazon.com/dp/${asin}?tag=myseniorvalet-20`;
        console.log(`   ✅ Fixed URL: ${newUrl}`);
        fixedCount++;
      } else {
        // Fallback: just ensure affiliate tag is present
        if (product.external_url.includes('amazon.com')) {
          const urlObj = new URL(product.external_url);
          urlObj.searchParams.set('tag', 'myseniorvalet-20');
          newUrl = urlObj.toString();
          console.log(`   ⚠️ Added affiliate tag: ${newUrl}`);
          fixedCount++;
        } else {
          console.log(`   ❌ Could not fix URL - no ASIN found`);
          failedCount++;
          continue;
        }
      }
      
      // Prepare update
      const metadata = product.metadata || {};
      const updatedMetadata = {
        ...metadata,
        link_health_checked: new Date().toISOString(),
        link_health_status: 'healthy',
        link_fixed_at: new Date().toISOString()
      };
      
      updates.push({
        id: product.id,
        external_url: newUrl,
        metadata: updatedMetadata
      });
    }
    
    // Apply updates
    if (updates.length > 0) {
      console.log(`\n📝 Applying ${updates.length} link fixes...`);
      
      for (const update of updates) {
        await pool.query(`
          UPDATE services
          SET 
            external_url = $1,
            metadata = $2,
            updated_at = NOW()
          WHERE id = $3
        `, [
          update.external_url,
          JSON.stringify(update.metadata),
          update.id
        ]);
      }
      
      console.log('✅ All link fixes applied successfully!');
    }
    
    // Summary report
    console.log('\n' + '='.repeat(50));
    console.log('📊 LINK FIXING SUMMARY:');
    console.log('='.repeat(50));
    console.log(`Total products checked: ${products.length}`);
    console.log(`Already healthy links: ${healthyCount}`);
    console.log(`Links fixed: ${fixedCount}`);
    console.log(`Failed to fix: ${failedCount}`);
    console.log('='.repeat(50));
    console.log('✨ Amazon link fixing complete!');
    console.log('\n💡 Note: AI summaries skipped due to API quota issues.');
    console.log('   Once you have working API keys, we can generate summaries.');
    
  } catch (error) {
    console.error('❌ Error fixing links:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the link fixer
fixAmazonLinksOnly().catch(console.error);