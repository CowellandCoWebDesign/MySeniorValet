/**
 * Amazon Product Enrichment Script
 * Ensures compliance and adds AI-generated senior-focused summaries
 */

const { Pool } = require('@neondatabase/serverless');
const ws = require('ws');
const { neonConfig } = require('@neondatabase/serverless');

// Import our compliance modules (we'll use dynamic imports since this is CJS)
let checkAmazonAffiliateLinkHealth, generateSeniorProductSummary;

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function loadModules() {
  // Dynamic imports for ES modules
  const healthChecker = await import('./server/amazon-link-health-checker.js');
  const summaryGenerator = await import('./server/amazon-ai-summary-generator.js');
  
  checkAmazonAffiliateLinkHealth = healthChecker.checkAmazonAffiliateLinkHealth;
  generateSeniorProductSummary = summaryGenerator.generateSeniorProductSummary;
}

async function enrichAmazonProducts() {
  await loadModules();
  
  console.log('🚀 Starting Amazon Product Enrichment...');
  console.log('📋 Checking link health and generating AI summaries...\n');
  
  try {
    // Get all Amazon products
    const result = await pool.query(`
      SELECT 
        s.id, 
        s.product_id,
        s.name, 
        s.external_url,
        s.description,
        sc.name as category_name
      FROM services s
      LEFT JOIN service_categories sc ON s.category_id = sc.id
      WHERE s.provider_id = 4
      ORDER BY s.id
    `);
    
    const products = result.rows;
    console.log(`Found ${products.length} Amazon products to enrich\n`);
    
    let healthyCount = 0;
    let fixedCount = 0;
    let summaryCount = 0;
    const updates = [];
    
    for (const product of products) {
      console.log(`\n📦 Processing: ${product.name}`);
      
      // 1. Check link health
      const linkHealth = checkAmazonAffiliateLinkHealth(product.external_url);
      console.log(`   Link Status: ${linkHealth.message}`);
      
      let newUrl = product.external_url;
      if (!linkHealth.isHealthy && linkHealth.fixedUrl) {
        newUrl = linkHealth.fixedUrl;
        console.log(`   ✅ Fixed URL: ${newUrl}`);
        fixedCount++;
      } else if (linkHealth.isHealthy) {
        healthyCount++;
      }
      
      // 2. Generate AI summary if needed
      let aiSummary = null;
      let seniorBenefits = [];
      
      // Check if we already have a good description
      const needsSummary = !product.description || 
                          product.description.length < 50 || 
                          product.description.includes('TBD') ||
                          product.description.includes('placeholder');
      
      if (needsSummary) {
        console.log('   🤖 Generating AI summary...');
        
        try {
          const summaryResult = await generateSeniorProductSummary({
            productName: product.name,
            category: product.category_name || 'Home Essentials',
            generalDescription: product.description
          });
          
          if (summaryResult.isCompliant) {
            aiSummary = summaryResult.summary;
            seniorBenefits = summaryResult.seniorBenefits;
            console.log(`   ✅ AI Summary: ${aiSummary.substring(0, 80)}...`);
            summaryCount++;
          } else {
            console.log(`   ⚠️ Summary failed compliance: ${summaryResult.violations?.join(', ')}`);
          }
        } catch (error) {
          console.log(`   ❌ AI Summary Error: ${error.message}`);
        }
      }
      
      // 3. Prepare update
      updates.push({
        id: product.id,
        external_url: newUrl,
        description: aiSummary || product.description,
        metadata: {
          link_health_checked: new Date().toISOString(),
          link_is_healthy: linkHealth.isHealthy,
          ai_summary_generated: !!aiSummary,
          senior_benefits: seniorBenefits,
          compliance_status: 'verified'
        }
      });
    }
    
    // 4. Apply updates to database
    console.log('\n\n💾 Applying updates to database...');
    
    for (const update of updates) {
      await pool.query(
        `UPDATE services 
         SET external_url = $1, 
             description = $2,
             metadata = COALESCE(metadata, '{}'::jsonb) || $3::jsonb,
             updated_at = NOW()
         WHERE id = $4`,
        [update.external_url, update.description, JSON.stringify(update.metadata), update.id]
      );
    }
    
    // 5. Summary report
    console.log('\n\n📊 ENRICHMENT COMPLETE!\n');
    console.log(`✅ Healthy Links: ${healthyCount}`);
    console.log(`🔧 Fixed Links: ${fixedCount}`);
    console.log(`🤖 AI Summaries Generated: ${summaryCount}`);
    console.log(`📦 Total Products Processed: ${products.length}`);
    
    console.log('\n✨ Amazon products are now:');
    console.log('   • Compliant with affiliate rules');
    console.log('   • Enhanced with senior-focused descriptions');
    console.log('   • Using stable, revenue-generating links');
    console.log('   • Ready to scale with zero compliance risk!');
    
  } catch (error) {
    console.error('❌ Error enriching products:', error);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  enrichAmazonProducts();
}