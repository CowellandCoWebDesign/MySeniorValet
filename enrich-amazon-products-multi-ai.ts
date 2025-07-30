/**
 * Amazon Product Enrichment Script - Multi-AI Version
 * Uses DeepSeek and Claude for AI summaries instead of OpenAI
 */

import { Pool } from '@neondatabase/serverless';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';
import { checkAmazonAffiliateLinkHealth, fixAmazonLink } from './server/amazon-link-health-checker';
import { deepSeekService } from './server/deepseek-ai-service';
import { Anthropic } from '@anthropic-ai/sdk';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Initialize Claude
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Choose which AI to use
const AI_PROVIDER: 'deepseek' | 'claude' | 'alternate' = 'deepseek';

async function generateProductSummaryWithDeepSeek(productName: string, category: string, description?: string) {
  const prompt = `Create a helpful product summary for seniors and caregivers.

Product: ${productName}
Category: ${category}
${description ? `Type: ${description}` : ''}

Instructions:
- Write a clear, concise summary (2-3 sentences) focused on seniors
- Highlight accessibility, simplicity, ease of use, comfort, or safety
- Use friendly, supportive language
- Focus on how this helps with daily living
- DO NOT mention prices, ratings, reviews, or availability
- DO NOT use phrases like "best seller", "as seen on Amazon", or "5 stars"
- Create ORIGINAL content, not copied from any source

Respond with JSON in this format:
{
  "summary": "A helpful 2-3 sentence description",
  "highlights": ["Key feature 1", "Key feature 2", "Key feature 3"],
  "seniorBenefits": ["Benefit for seniors 1", "Benefit for seniors 2", "Benefit for seniors 3"]
}`;

  const response = await deepSeekService.generateCompletion([
    { role: 'user', content: prompt }
  ], {
    temperature: 0.7,
    max_tokens: 500
  });

  return JSON.parse(response);
}

async function generateProductSummaryWithClaude(productName: string, category: string, description?: string) {
  const prompt = `Create a helpful product summary for seniors and caregivers.

Product: ${productName}
Category: ${category}
${description ? `Type: ${description}` : ''}

Instructions:
- Write a clear, concise summary (2-3 sentences) focused on seniors
- Highlight accessibility, simplicity, ease of use, comfort, or safety
- Use friendly, supportive language
- Focus on how this helps with daily living
- DO NOT mention prices, ratings, reviews, or availability
- DO NOT use phrases like "best seller", "as seen on Amazon", or "5 stars"
- Create ORIGINAL content, not copied from any source

Respond with JSON in this format:
{
  "summary": "A helpful 2-3 sentence description",
  "highlights": ["Key feature 1", "Key feature 2", "Key feature 3"],
  "seniorBenefits": ["Benefit for seniors 1", "Benefit for seniors 2", "Benefit for seniors 3"]
}`;

  const response = await anthropic.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 500,
    temperature: 0.7,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  const content = response.content[0].type === 'text' ? response.content[0].text : '';
  return JSON.parse(content);
}

async function generateAISummaryMultiProvider(product: any) {
  const productName = product.name;
  const category = product.category_name || 'Senior Living Essential';
  const description = product.description;

  try {
    if (AI_PROVIDER === 'deepseek') {
      // Use DeepSeek AI
      const result = await generateProductSummaryWithDeepSeek(productName, category, description);
      return {
        success: true,
        summary: result.summary,
        seniorBenefits: result.seniorBenefits || result.senior_benefits || [],
        highlights: result.highlights || []
      };
    } else if (AI_PROVIDER === 'claude') {
      // Use Claude AI
      const result = await generateProductSummaryWithClaude(productName, category, description);
      return {
        success: true,
        summary: result.summary,
        seniorBenefits: result.seniorBenefits || result.senior_benefits || [],
        highlights: result.highlights || []
      };
    } else {
      // Alternate between DeepSeek and Claude
      const useDeepSeek = product.id % 2 === 0;
      const result = useDeepSeek 
        ? await generateProductSummaryWithDeepSeek(productName, category, description)
        : await generateProductSummaryWithClaude(productName, category, description);
      
      return {
        success: true,
        summary: result.summary,
        seniorBenefits: result.seniorBenefits || result.senior_benefits || [],
        highlights: result.highlights || [],
        aiProvider: useDeepSeek ? 'deepseek' : 'claude'
      };
    }
  } catch (error) {
    console.error(`Error with ${AI_PROVIDER}:`, error.message);
    // Try fallback to other AI
    if (AI_PROVIDER === 'deepseek') {
      try {
        const result = await generateProductSummaryWithClaude(productName, category, description);
        return {
          success: true,
          summary: result.summary,
          seniorBenefits: result.seniorBenefits || result.senior_benefits || [],
          highlights: result.highlights || [],
          aiProvider: 'claude'
        };
      } catch (fallbackError) {
        return { success: false, error: fallbackError.message };
      }
    }
    return { success: false, error: error.message };
  }
}

async function enrichAmazonProducts() {
  console.log('🚀 Starting Amazon Product Enrichment with Multi-AI Support...');
  console.log(`📋 Using AI Provider: ${AI_PROVIDER}`);
  console.log('🔗 Fixing shortened links and generating AI summaries...\n');
  
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
      
      // 1. Check and fix link health
      const linkHealth = checkAmazonAffiliateLinkHealth(product.external_url);
      console.log(`   Link Status: ${linkHealth.status} - ${linkHealth.message}`);
      
      let newUrl = product.external_url;
      
      // Always try to fix shortened or invalid links
      if (linkHealth.status === 'shortened' || linkHealth.status === 'invalid') {
        const fixedUrl = fixAmazonLink(product.external_url);
        if (fixedUrl && fixedUrl !== product.external_url) {
          newUrl = fixedUrl;
          console.log(`   ✅ Fixed URL: ${newUrl}`);
          fixedCount++;
        } else {
          console.log(`   ⚠️ Could not fix URL, keeping original`);
        }
      } else if (linkHealth.status === 'healthy') {
        healthyCount++;
      }
      
      // 2. Generate AI summary if needed
      let aiSummary: string | null = null;
      let seniorBenefits: string[] = [];
      
      const metadata = product.metadata || {};
      const hasAISummary = metadata.ai_summary && metadata.senior_benefits;
      
      if (!hasAISummary || product.external_url !== newUrl) {
        console.log(`   🤖 Generating AI summary with ${AI_PROVIDER}...`);
        
        try {
          const aiResult = await generateAISummaryMultiProvider(product);
          
          if (aiResult.success) {
            aiSummary = aiResult.summary;
            seniorBenefits = aiResult.seniorBenefits;
            console.log(`   ✅ AI summary generated successfully${aiResult.aiProvider ? ` (${aiResult.aiProvider})` : ''}`);
            summaryCount++;
          } else {
            console.log(`   ⚠️ Failed to generate AI summary: ${aiResult.error}`);
          }
        } catch (error) {
          console.log(`   ❌ Error generating AI summary: ${error.message}`);
        }
      } else {
        console.log('   ✓ AI summary already exists');
      }
      
      // 3. Prepare update if needed
      if (newUrl !== product.external_url || (!hasAISummary && aiSummary)) {
        const updatedMetadata = {
          ...metadata,
          link_health_checked: new Date().toISOString(),
          link_health_status: newUrl !== product.external_url ? 'healthy' : linkHealth.status
        };
        
        if (aiSummary) {
          updatedMetadata.ai_summary = aiSummary;
          updatedMetadata.senior_benefits = seniorBenefits;
          updatedMetadata.ai_generated_at = new Date().toISOString();
          updatedMetadata.ai_provider = AI_PROVIDER;
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
    console.log(`AI Provider used: ${AI_PROVIDER}`);
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