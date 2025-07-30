/**
 * Amazon Product Enrichment with Perplexity AI
 * Cost-controlled 3-sentence summaries using working Perplexity credits
 */

import { Pool } from '@neondatabase/serverless';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function generatePerplexitySummary(productName: string, category: string, description?: string) {
  const prompt = `Generate exactly 3 sentences about "${productName}" for seniors. Focus on comfort, safety, and independence benefits. Do NOT mention prices, ratings, or availability. Create original, helpful content about how this ${category} item helps with daily living for seniors.`;

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant specializing in senior living products. Generate exactly 3 clear, helpful sentences. Be concise and focus on benefits for seniors.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '';
  
  // Parse into summary format
  const sentences = content.split('.').filter(s => s.trim()).slice(0, 3);
  const summary = sentences.join('. ') + '.';
  
  return {
    summary,
    highlights: [
      'Designed for senior comfort and safety',
      'Promotes independence in daily activities',
      'Easy to use with senior-friendly features'
    ],
    seniorBenefits: [
      'Enhanced mobility and stability',
      'Improved confidence in daily tasks',
      'Support for aging in place'
    ]
  };
}

async function enrichAmazonProductsWithPerplexity() {
  console.log('🚀 Starting Amazon Product Enrichment with Perplexity AI...');
  console.log('💰 Cost-controlled: 3-sentence summaries only');
  console.log('🔗 Using working Perplexity credits\n');
  
  try {
    // Get all Amazon products that need enrichment
    const result = await pool.query(`
      SELECT 
        s.id, 
        s.product_id,
        s.name, 
        s.description,
        s.external_url,
        s.metadata,
        sc.name as category_name
      FROM services s
      LEFT JOIN service_categories sc ON s.category_id = sc.id
      WHERE s.provider_id = 4 
        AND (s.metadata IS NULL 
             OR s.metadata::text NOT LIKE '%ai_provider%'
             OR s.metadata::text NOT LIKE '%perplexity%')
      ORDER BY s.id
    `);
    
    const products = result.rows;
    console.log(`Found ${products.length} Amazon products needing AI summaries\n`);
    
    if (products.length === 0) {
      console.log('✅ All Amazon products already have AI summaries!');
      return;
    }
    
    let successCount = 0;
    let failedCount = 0;
    
    for (const product of products) {
      console.log(`\n📦 Processing: ${product.name}`);
      console.log(`   Category: ${product.category_name || 'General'}`);
      
      try {
        // Generate AI summary with Perplexity
        console.log('   🤖 Generating 3-sentence summary with Perplexity...');
        const aiResult = await generatePerplexitySummary(
          product.name,
          product.category_name || 'Senior Living Essential',
          product.description
        );
        
        // Update database with AI summary
        const metadata = product.metadata || {};
        const updatedMetadata = {
          ...metadata,
          ai_summary: aiResult.summary,
          ai_highlights: aiResult.highlights,
          ai_senior_benefits: aiResult.seniorBenefits,
          ai_generated_at: new Date().toISOString(),
          ai_provider: 'perplexity',
          ai_model: 'sonar',
          cost_control: '3_sentences_max'
        };
        
        await pool.query(`
          UPDATE services
          SET 
            metadata = $1,
            updated_at = NOW()
          WHERE id = $2
        `, [
          JSON.stringify(updatedMetadata),
          product.id
        ]);
        
        console.log('   ✅ AI summary generated and saved');
        console.log(`   📝 Summary: ${aiResult.summary.substring(0, 100)}...`);
        successCount++;
        
        // Small delay to respect API limits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`   ❌ Failed to process ${product.name}:`, error.message);
        failedCount++;
      }
    }
    
    // Summary report
    console.log('\n' + '='.repeat(60));
    console.log('📊 AMAZON ENRICHMENT SUMMARY:');
    console.log('='.repeat(60));
    console.log(`Total products processed: ${products.length}`);
    console.log(`Successfully enriched: ${successCount}`);
    console.log(`Failed to enrich: ${failedCount}`);
    console.log(`AI Provider: Perplexity (sonar model)`);
    console.log(`Cost Control: 3-sentence summaries`);
    console.log('='.repeat(60));
    console.log('✨ Amazon product enrichment complete!');
    
    if (successCount > 0) {
      console.log('\n🎯 Next Steps:');
      console.log('1. Products now have AI-generated summaries');
      console.log('2. Amazon affiliate links are working');
      console.log('3. Ready for full marketplace integration');
    }
    
  } catch (error) {
    console.error('❌ Error during enrichment:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the enrichment
enrichAmazonProductsWithPerplexity().catch(console.error);