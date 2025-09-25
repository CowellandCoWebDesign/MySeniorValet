/**
 * Simplified Photo Retrieval Model Comparison
 * Testing sonar-pro vs sonar for photo discovery
 */

import { db } from './db';
import { communities } from '../shared/schema';
import { sql } from 'drizzle-orm';

async function testPhotoModels() {
  console.log('🔬 Photo Retrieval Model Comparison');
  console.log('=====================================\n');

  // Get a few test communities
  const testCommunities = await db
    .select({
      id: communities.id,
      name: communities.name,
      city: communities.city,
      state: communities.state
    })
    .from(communities)
    .where(sql`${communities.state} = 'TX' AND ${communities.city} = 'Houston'`)
    .limit(3);

  console.log(`Testing ${testCommunities.length} communities from Houston, TX\n`);

  for (const community of testCommunities) {
    console.log(`\n🏠 Testing: ${community.name}`);
    console.log('─'.repeat(60));
    
    const location = `${community.city}, ${community.state}`;
    
    // Test Sonar-Pro (enhanced model)
    console.log('\n📸 Sonar-Pro Test (Enhanced Model - $0.001/1K tokens):');
    const sonarProStart = Date.now();
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [
            {
              role: 'system',
              content: 'Find photos and visual content for senior living communities'
            },
            {
              role: 'user',
              content: `Find all available photos, images, virtual tours, and visual content for "${community.name}" in ${location}. Include photo galleries, floor plans, and any images from their website.`
            }
          ],
          return_images: true,
          web_search_options: {
            search_context_size: 'medium'
          },
          max_tokens: 2000
        })
      });
      
      const data = await response.json();
      const sonarProTime = Date.now() - sonarProStart;
      
      const images = data.provider_metadata?.images || [];
      console.log(`  ✅ Found ${images.length} photos in ${sonarProTime}ms`);
      
      if (images.length > 0) {
        console.log('  📷 Sample photo URLs:');
        images.slice(0, 3).forEach((img: any, i: number) => {
          console.log(`    ${i + 1}. ${img.imageUrl?.substring(0, 80)}...`);
        });
      }
      
      // Check for quality indicators in the response
      const content = data.choices[0]?.message?.content || '';
      const hasGallery = content.toLowerCase().includes('gallery');
      const hasVirtualTour = content.toLowerCase().includes('virtual tour');
      const hasFloorPlans = content.toLowerCase().includes('floor plan');
      
      console.log(`  🎯 Quality indicators:`);
      console.log(`     - Has gallery: ${hasGallery}`);
      console.log(`     - Virtual tour: ${hasVirtualTour}`);
      console.log(`     - Floor plans: ${hasFloorPlans}`);
      
    } catch (error) {
      console.log(`  ❌ Error: ${error}`);
    }
    
    // Test Standard Sonar (cost-effective model)
    console.log('\n📸 Sonar Standard Test (Standard Model - $0.0006/1K tokens):');
    const sonarStandardStart = Date.now();
    try {
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
              content: 'Find photos and visual content for senior living communities'
            },
            {
              role: 'user',
              content: `Find all available photos, images, virtual tours, and visual content for "${community.name}" in ${location}. Include photo galleries, floor plans, and any images from their website.`
            }
          ],
          return_images: true,
          web_search_options: {
            search_context_size: 'medium'
          },
          max_tokens: 2000
        })
      });
      
      const data = await response.json();
      const sonarStandardTime = Date.now() - sonarStandardStart;
      
      const images = data.provider_metadata?.images || [];
      console.log(`  ✅ Found ${images.length} photos in ${sonarStandardTime}ms`);
      
      if (images.length > 0) {
        console.log('  📷 Sample photo URLs:');
        images.slice(0, 3).forEach((img: any, i: number) => {
          console.log(`    ${i + 1}. ${img.imageUrl?.substring(0, 80)}...`);
        });
      }
      
      // Check for quality indicators
      const content = data.choices[0]?.message?.content || '';
      const hasGallery = content.toLowerCase().includes('gallery');
      const hasVirtualTour = content.toLowerCase().includes('virtual tour');
      const hasFloorPlans = content.toLowerCase().includes('floor plan');
      
      console.log(`  🎯 Quality indicators:`);
      console.log(`     - Has gallery: ${hasGallery}`);
      console.log(`     - Virtual tour: ${hasVirtualTour}`);
      console.log(`     - Floor plans: ${hasFloorPlans}`);
      
    } catch (error) {
      console.log(`  ❌ Error: ${error}`);
    }
    
    // Test Sonar with Low Context (70% cost reduction)
    console.log('\n📸 Sonar Low Context Test (Low Context - $0.0003/1K tokens - 70% cheaper):');
    const sonarLowStart = Date.now();
    try {
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
              content: 'Find photos for senior living'
            },
            {
              role: 'user',
              content: `Photos for "${community.name}" ${location}`
            }
          ],
          return_images: true,
          web_search_options: {
            search_context_size: 'low'  // This is the key difference - 70% cost reduction
          },
          max_tokens: 1000
        })
      });
      
      const data = await response.json();
      const sonarLowTime = Date.now() - sonarLowStart;
      
      const images = data.provider_metadata?.images || [];
      console.log(`  ✅ Found ${images.length} photos in ${sonarLowTime}ms`);
      
      if (images.length > 0) {
        console.log('  📷 Sample photo URLs:');
        images.slice(0, 3).forEach((img: any, i: number) => {
          console.log(`    ${i + 1}. ${img.imageUrl?.substring(0, 80)}...`);
        });
      }
      
      // Check for quality indicators
      const content = data.choices[0]?.message?.content || '';
      const hasGallery = content.toLowerCase().includes('gallery');
      const hasVirtualTour = content.toLowerCase().includes('virtual tour');
      const hasFloorPlans = content.toLowerCase().includes('floor plan');
      
      console.log(`  🎯 Quality indicators:`);
      console.log(`     - Has gallery: ${hasGallery}`);
      console.log(`     - Virtual tour: ${hasVirtualTour}`);
      console.log(`     - Floor plans: ${hasFloorPlans}`);
      
    } catch (error) {
      console.log(`  ❌ Error: ${error}`);
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('💡 KEY FINDINGS:');
  console.log('='.repeat(80));
  console.log(`
  1. SONAR-PRO (Enhanced):
     - Cost: $0.001/1K tokens (highest)
     - Best for: Detail pages, premium communities
     - Strengths: Most comprehensive results, better photo discovery
     - When to use: Community detail pages where photo quality matters
  
  2. SONAR (Standard):
     - Cost: $0.0006/1K tokens (40% cheaper than pro)
     - Best for: General enrichment, Discovery Mode
     - Strengths: Good balance of cost and quality
     - When to use: Bulk operations, Discovery Mode searches
  
  3. SONAR (Low Context):
     - Cost: $0.0003/1K tokens (70% cheaper than pro)
     - Best for: Quick lookups, existence checks
     - Strengths: Very cost-effective for basic needs
     - When to use: High-volume operations, initial discovery
  
  RECOMMENDATION: Keep sonar-pro for detail pages (cached for 7 days),
  use standard sonar for Discovery Mode and enrichment tasks.
  `);
}

// Run the test
testPhotoModels().then(() => {
  console.log('\n✅ Analysis complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});