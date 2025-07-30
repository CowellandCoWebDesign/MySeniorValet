/**
 * Amazon Product Enrichment Script
 * Ensures compliance and adds AI-generated senior-focused summaries
 */

import { Pool } from '@neondatabase/serverless';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';
import { checkAmazonAffiliateLinkHealth } from './server/amazon-link-health-checker';
import { generateSeniorProductSummary } from './server/amazon-ai-summary-generator';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function enrichAmazonProducts() {
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
        s.metadata,
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
    const updates: Array<{
      id: number;
      external_url: string;
      metadata: any;
      description: string;
    }> = [];
    
    for (const product of products) {
      console.log(`\n📦 Processing: ${product.name}`);
      
      // 1. Check link health
      const linkHealth = checkAmazonAffiliateLinkHealth(product.external_url);
      console.log(`   Link Status: ${linkHealth.status} - ${linkHealth.message}`);
      
      let newUrl = product.external_url;
      if (linkHealth.fixedUrl && linkHealth.fixedUrl !== product.external_url) {
        newUrl = linkHealth.fixedUrl;
        console.log(`   ✅ Fixed URL: ${newUrl}`);
        fixedCount++;
      } else if (linkHealth.status === 'healthy') {
        healthyCount++;
      }
      
      // 2. Generate AI summary if needed
      let aiSummary: string | null = null;
      let seniorBenefits: string[] = [];
      
      const metadata = product.metadata || {};
      const hasAISummary = metadata.ai_summary && metadata.senior_benefits;
      
      if (!hasAISummary || product.external_url !== newUrl) {
        console.log('   🤖 Generating AI summary...');
        
        try {
          const aiResult = await generateSeniorProductSummary({
            productName: product.name,
            category: product.category_name || 'Senior Living Essential',
            generalDescription: product.description
          });
          
          if (aiResult.isCompliant) {
            aiSummary = aiResult.summary;
            seniorBenefits = aiResult.seniorBenefits;
            console.log('   ✅ AI summary generated successfully');
            summaryCount++;
          } else {
            console.log('   ⚠️ Failed to generate AI summary - compliance issues:', aiResult.violations);
          }
        } catch (error) {
          console.log('   ❌ Error generating AI summary:', error.message);
        }
      } else {
        console.log('   ✓ AI summary already exists');
      }
      
      // 3. Prepare update if needed
      if (newUrl !== product.external_url || (!hasAISummary && aiSummary)) {
        const updatedMetadata = {
          ...metadata,
          link_health_checked: new Date().toISOString(),
          link_health_status: linkHealth.status
        };
        
        if (aiSummary) {
          updatedMetadata.ai_summary = aiSummary;
          updatedMetadata.senior_benefits = seniorBenefits;
          updatedMetadata.ai_generated_at = new Date().toISOString();
        }
        
        updates.push({
          id: product.id,
          external_url: newUrl,
          metadata: updatedMetadata,
          description: aiSummary || product.description
        });
      }
    }
    
    // 4. Apply updates
    if (updates.length > 0) {
      console.log(`\n📝 Applying ${updates.length} updates...`);
      
      for (const update of updates) {
        await pool.query(`
          UPDATE services
          SET 
            external_url = $1,
            metadata = $2,
            description = $3,
            updated_at = NOW()
          WHERE id = $4
        `, [
          update.external_url,
          JSON.stringify(update.metadata),
          update.description,
          update.id
        ]);
      }
      
      console.log('✅ All updates applied successfully!');
    }
    
    // 5. Summary report
    console.log('\n' + '='.repeat(50));
    console.log('📊 ENRICHMENT SUMMARY:');
    console.log('='.repeat(50));
    console.log(`Total products processed: ${products.length}`);
    console.log(`Already healthy links: ${healthyCount}`);
    console.log(`Links fixed: ${fixedCount}`);
    console.log(`AI summaries generated: ${summaryCount}`);
    console.log(`Total updates applied: ${updates.length}`);
    console.log('='.repeat(50));
    console.log('✨ Amazon product enrichment complete!');
    
  } catch (error) {
    console.error('❌ Error enriching products:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the enrichment
enrichAmazonProducts().catch(console.error);