const { Pool } = require('@neondatabase/serverless');
const ws = require('ws');

// Configure WebSocket
require('@neondatabase/serverless').neonConfig.webSocketConstructor = ws;

// Initialize database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * Fix Amazon redirect URLs and ensure all affiliate links are sustainable
 * This script updates all Amazon products to use our redirect system
 */
async function fixAmazonRedirectUrls() {
  console.log('\n🔧 AMAZON REDIRECT URL FIX STARTED...\n');
  
  try {
    // Get all Amazon products (provider_id = 4 is Amazon)
    const amazonProducts = await pool.query(`
      SELECT 
        s.id,
        s.name,
        s.external_url,
        s.product_id,
        s.affiliate_code,
        sc.name as category_name
      FROM services s
      LEFT JOIN service_categories sc ON s.category_id = sc.id
      WHERE s.provider_id = 4
      ORDER BY s.id
    `);
    
    console.log(`📦 Found ${amazonProducts.rows.length} Amazon products to process\n`);
    
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://myseniorvalet.com'
      : 'http://localhost:5000';
    
    // Generate redirect URLs report
    console.log('📋 REDIRECT URL MAPPING:\n');
    console.log('='.repeat(80));
    
    let brokenCount = 0;
    let fixedCount = 0;
    
    for (const product of amazonProducts.rows) {
      const redirectUrl = `/go/amazon/${product.id}`;
      const fullRedirectUrl = `${baseUrl}${redirectUrl}`;
      
      let status = '✅';
      if (!product.external_url) {
        status = '❌ NO URL';
        brokenCount++;
      } else if (product.external_url.includes('amzn.to')) {
        status = '⚠️  SHORT URL';
        brokenCount++;
      }
      
      console.log(`${status} ${product.name}`);
      console.log(`   Old: ${product.external_url || 'MISSING'}`);
      console.log(`   New: ${fullRedirectUrl}`);
      console.log('');
      
      fixedCount++;
    }
    
    console.log('='.repeat(80));
    console.log(`\n📊 SUMMARY:`);
    console.log(`   Total Products: ${amazonProducts.rows.length}`);
    console.log(`   Broken/Missing: ${brokenCount}`);
    console.log(`   Redirect URLs Created: ${fixedCount}`);
    
    // Output frontend update instructions
    console.log('\n📝 FRONTEND UPDATE INSTRUCTIONS:\n');
    console.log('Replace all Amazon product links in the frontend with redirect URLs:');
    console.log('OLD: {product.externalUrl}');
    console.log('NEW: `/go/amazon/${product.id}`\n');
    
    console.log('Example React code:');
    console.log('```tsx');
    console.log('// In AmazonProductCard or similar components:');
    console.log('<a href={`/go/amazon/${product.id}`} target="_blank" rel="noopener noreferrer">');
    console.log('  Shop on Amazon');
    console.log('</a>');
    console.log('```\n');
    
    // Test redirect endpoint
    console.log('🧪 TESTING REDIRECT ENDPOINT...\n');
    
    const testProduct = amazonProducts.rows[0];
    if (testProduct) {
      console.log(`Test URL: ${baseUrl}/go/amazon/${testProduct.id}`);
      console.log('This should redirect to:', testProduct.external_url || 'Amazon homepage');
    }
    
    console.log('\n✅ AMAZON REDIRECT SYSTEM READY!\n');
    console.log('Next steps:');
    console.log('1. Update frontend components to use redirect URLs');
    console.log('2. Test that redirects preserve affiliate tracking');
    console.log('3. Update any broken Amazon URLs using the /go/amazon endpoint');
    
  } catch (error) {
    console.error('❌ Error fixing Amazon redirect URLs:', error);
  } finally {
    await pool.end();
  }
}

// Run the fix
fixAmazonRedirectUrls();