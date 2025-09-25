/**
 * Photo Retrieval Analysis Tool
 * Compare photo success rates between different Perplexity models
 * To understand the true value of sonar-pro vs sonar for photo discovery
 */

import { PerplexityAIService } from './perplexity-ai-service';
import { SimplifiedPerplexityService } from './simplified-perplexity-service';
import { db } from './db';
import { communities } from '../shared/schema';
import { sql, desc } from 'drizzle-orm';
import * as fs from 'fs';

interface PhotoTestResult {
  communityId: number;
  communityName: string;
  location: string;
  sonarProPhotos: number;
  sonarStandardPhotos: number;
  sonarLowContextPhotos: number;
  sonarProQuality: string[];
  sonarStandardQuality: string[];
  sonarLowContextQuality: string[];
  executionTime: {
    sonarPro: number;
    sonarStandard: number;
    sonarLowContext: number;
  };
  costComparison: {
    sonarPro: string;
    sonarStandard: string;
    sonarLowContext: string;
  };
}

class PhotoRetrievalAnalyzer {
  private perplexityService: PerplexityAIService;
  private simplifiedService: SimplifiedPerplexityService;
  private results: PhotoTestResult[] = [];

  constructor() {
    this.perplexityService = new PerplexityAIService();
    this.simplifiedService = new SimplifiedPerplexityService();
  }

  /**
   * Test photo retrieval with sonar-pro model (current detail page approach)
   */
  async testSonarProRetrieval(communityName: string, location: string) {
    const startTime = Date.now();
    
    try {
      // Simulate the current 3-query approach used in detail pages
      const photosQuery = `"${communityName}" in ${location} - provide:
        1. All available photos and images of the facility
        2. Photo gallery URLs from their website
        3. Virtual tour links if available
        4. Any visual content available`;
      
      const result = await this.perplexityService.searchRealTime(
        photosQuery,
        `Finding photos and visual content for ${communityName}`
      );
      
      const executionTime = Date.now() - startTime;
      
      // Analyze photo quality
      const qualityIndicators = [];
      if (result.images && result.images.length > 0) {
        if (result.images.some(url => String(url).includes('gallery'))) qualityIndicators.push('Has gallery photos');
        if (result.images.some(url => String(url).includes('room') || String(url).includes('bedroom'))) qualityIndicators.push('Room photos');
        if (result.images.some(url => String(url).includes('dining'))) qualityIndicators.push('Dining photos');
        if (result.images.some(url => String(url).includes('exterior') || String(url).includes('building'))) qualityIndicators.push('Exterior photos');
        if (result.images.some(url => String(url).includes('activity') || String(url).includes('recreation'))) qualityIndicators.push('Activity photos');
      }
      
      return {
        photoCount: result.images?.length || 0,
        photos: result.images || [],
        qualityIndicators,
        executionTime,
        cost: 'High ($0.001/1K tokens)'
      };
    } catch (error) {
      console.error('Sonar-pro test failed:', error);
      return {
        photoCount: 0,
        photos: [],
        qualityIndicators: [],
        executionTime: Date.now() - startTime,
        cost: 'High ($0.001/1K tokens)'
      };
    }
  }

  /**
   * Test photo retrieval with standard sonar model
   */
  async testSonarStandardRetrieval(communityName: string, location: string) {
    const startTime = Date.now();
    
    try {
      // Use standard sonar model with medium context
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
              content: `Find all photos, images, and visual content for "${communityName}" in ${location}`
            }
          ],
          web_search_options: {
            search_context_size: 'medium'
          },
          return_images: true,
          max_tokens: 1500
        })
      });
      
      const data = await response.json();
      const executionTime = Date.now() - startTime;
      
      // Extract images from provider_metadata
      const images = data.provider_metadata?.images?.map((img: any) => img.imageUrl) || [];
      
      // Analyze quality
      const qualityIndicators = [];
      if (images.length > 0) {
        if (images.length >= 10) qualityIndicators.push('Rich photo collection');
        if (images.length >= 5) qualityIndicators.push('Good photo coverage');
        if (images.some((url: string) => url.includes(communityName.toLowerCase().replace(/\s+/g, '')))) {
          qualityIndicators.push('Community-specific photos');
        }
      }
      
      return {
        photoCount: images.length,
        photos: images,
        qualityIndicators,
        executionTime,
        cost: 'Medium ($0.0006/1K tokens)'
      };
    } catch (error) {
      console.error('Sonar standard test failed:', error);
      return {
        photoCount: 0,
        photos: [],
        qualityIndicators: [],
        executionTime: Date.now() - startTime,
        cost: 'Medium ($0.0006/1K tokens)'
      };
    }
  }

  /**
   * Test photo retrieval with sonar model and low context (current simplified approach)
   */
  async testSonarLowContextRetrieval(communityName: string, location: string) {
    const startTime = Date.now();
    
    try {
      // This is the current simplified service approach
      const result = await this.simplifiedService.queryCommunity(communityName, location);
      const executionTime = Date.now() - startTime;
      
      const qualityIndicators = [];
      if (result.photos && result.photos.length > 0) {
        qualityIndicators.push(`${result.photos.length} photos from website`);
        if (result.photos.length >= 5) qualityIndicators.push('Sufficient coverage');
      }
      
      return {
        photoCount: result.photos?.length || 0,
        photos: result.photos || [],
        qualityIndicators,
        executionTime,
        cost: 'Low ($0.0003/1K tokens with 70% reduction)'
      };
    } catch (error) {
      console.error('Sonar low context test failed:', error);
      return {
        photoCount: 0,
        photos: [],
        qualityIndicators: [],
        executionTime: Date.now() - startTime,
        cost: 'Low ($0.0003/1K tokens)'
      };
    }
  }

  /**
   * Run comprehensive photo retrieval analysis
   */
  async runAnalysis(sampleSize: number = 10) {
    console.log('🔬 Starting Photo Retrieval Analysis');
    console.log('=====================================\n');
    
    // Get sample communities with varying characteristics
    const sampleCommunities = await db
      .select({
        id: communities.id,
        name: communities.name,
        city: communities.city,
        state: communities.state,
        photos: communities.photos,
        website: communities.website
      })
      .from(communities)
      .where(sql`${communities.state} IN ('TX', 'CA', 'FL', 'NY', 'IL')`)
      .orderBy(desc(communities.rating))
      .limit(sampleSize);
    
    console.log(`📊 Testing ${sampleCommunities.length} communities across different models...\n`);
    
    for (const community of sampleCommunities) {
      console.log(`\n🏠 Testing: ${community.name} - ${community.city}, ${community.state}`);
      console.log('─'.repeat(60));
      
      const location = `${community.city}, ${community.state}`;
      
      // Test all three approaches
      console.log('  📸 Testing sonar-pro (enhanced)...');
      const sonarProResult = await this.testSonarProRetrieval(community.name, location);
      
      console.log('  📸 Testing sonar (standard)...');
      const sonarStandardResult = await this.testSonarStandardRetrieval(community.name, location);
      
      console.log('  📸 Testing sonar (low context)...');
      const sonarLowResult = await this.testSonarLowContextRetrieval(community.name, location);
      
      // Store results
      const testResult: PhotoTestResult = {
        communityId: community.id,
        communityName: community.name,
        location,
        sonarProPhotos: sonarProResult.photoCount,
        sonarStandardPhotos: sonarStandardResult.photoCount,
        sonarLowContextPhotos: sonarLowResult.photoCount,
        sonarProQuality: sonarProResult.qualityIndicators,
        sonarStandardQuality: sonarStandardResult.qualityIndicators,
        sonarLowContextQuality: sonarLowResult.qualityIndicators,
        executionTime: {
          sonarPro: sonarProResult.executionTime,
          sonarStandard: sonarStandardResult.executionTime,
          sonarLowContext: sonarLowResult.executionTime
        },
        costComparison: {
          sonarPro: sonarProResult.cost,
          sonarStandard: sonarStandardResult.cost,
          sonarLowContext: sonarLowResult.cost
        }
      };
      
      this.results.push(testResult);
      
      // Display immediate results
      console.log(`\n  📊 Results for ${community.name}:`);
      console.log(`  ├─ Sonar-Pro:      ${sonarProResult.photoCount} photos (${sonarProResult.executionTime}ms)`);
      console.log(`  ├─ Sonar Standard: ${sonarStandardResult.photoCount} photos (${sonarStandardResult.executionTime}ms)`);
      console.log(`  └─ Sonar Low:      ${sonarLowResult.photoCount} photos (${sonarLowResult.executionTime}ms)`);
      
      // Wait between tests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Generate summary report
    this.generateReport();
  }

  /**
   * Generate comprehensive analysis report
   */
  generateReport() {
    console.log('\n\n' + '='.repeat(80));
    console.log('📈 PHOTO RETRIEVAL ANALYSIS REPORT');
    console.log('='.repeat(80) + '\n');
    
    // Calculate averages
    const avgPhotos = {
      sonarPro: this.results.reduce((sum, r) => sum + r.sonarProPhotos, 0) / this.results.length,
      sonarStandard: this.results.reduce((sum, r) => sum + r.sonarStandardPhotos, 0) / this.results.length,
      sonarLow: this.results.reduce((sum, r) => sum + r.sonarLowContextPhotos, 0) / this.results.length
    };
    
    const avgTime = {
      sonarPro: this.results.reduce((sum, r) => sum + r.executionTime.sonarPro, 0) / this.results.length,
      sonarStandard: this.results.reduce((sum, r) => sum + r.executionTime.sonarStandard, 0) / this.results.length,
      sonarLow: this.results.reduce((sum, r) => sum + r.executionTime.sonarLowContext, 0) / this.results.length
    };
    
    // Success rates (communities with at least 1 photo)
    const successRates = {
      sonarPro: (this.results.filter(r => r.sonarProPhotos > 0).length / this.results.length) * 100,
      sonarStandard: (this.results.filter(r => r.sonarStandardPhotos > 0).length / this.results.length) * 100,
      sonarLow: (this.results.filter(r => r.sonarLowContextPhotos > 0).length / this.results.length) * 100
    };
    
    console.log('📊 AVERAGE PHOTOS RETRIEVED:');
    console.log(`  ├─ Sonar-Pro (Enhanced):  ${avgPhotos.sonarPro.toFixed(1)} photos/community`);
    console.log(`  ├─ Sonar (Standard):      ${avgPhotos.sonarStandard.toFixed(1)} photos/community`);
    console.log(`  └─ Sonar (Low Context):   ${avgPhotos.sonarLow.toFixed(1)} photos/community`);
    
    console.log('\n⏱️ AVERAGE EXECUTION TIME:');
    console.log(`  ├─ Sonar-Pro (Enhanced):  ${avgTime.sonarPro.toFixed(0)}ms`);
    console.log(`  ├─ Sonar (Standard):      ${avgTime.sonarStandard.toFixed(0)}ms`);
    console.log(`  └─ Sonar (Low Context):   ${avgTime.sonarLow.toFixed(0)}ms`);
    
    console.log('\n✅ SUCCESS RATES (Found Photos):');
    console.log(`  ├─ Sonar-Pro (Enhanced):  ${successRates.sonarPro.toFixed(0)}%`);
    console.log(`  ├─ Sonar (Standard):      ${successRates.sonarStandard.toFixed(0)}%`);
    console.log(`  └─ Sonar (Low Context):   ${successRates.sonarLow.toFixed(0)}%`);
    
    console.log('\n💰 COST COMPARISON (per 1000 tokens):');
    console.log(`  ├─ Sonar-Pro:     $0.001 (highest quality, most photos)`);
    console.log(`  ├─ Sonar Standard: $0.0006 (balanced cost/quality)`);
    console.log(`  └─ Sonar Low:     $0.0003 (70% cost reduction)`);
    
    // Quality analysis
    console.log('\n🎯 QUALITY INDICATORS:');
    const qualityStats = this.results.reduce((acc, r) => {
      acc.sonarPro += r.sonarProQuality.length;
      acc.sonarStandard += r.sonarStandardQuality.length;
      acc.sonarLow += r.sonarLowContextQuality.length;
      return acc;
    }, { sonarPro: 0, sonarStandard: 0, sonarLow: 0 });
    
    console.log(`  ├─ Sonar-Pro:     ${(qualityStats.sonarPro / this.results.length).toFixed(1)} quality indicators/community`);
    console.log(`  ├─ Sonar Standard: ${(qualityStats.sonarStandard / this.results.length).toFixed(1)} quality indicators/community`);
    console.log(`  └─ Sonar Low:     ${(qualityStats.sonarLow / this.results.length).toFixed(1)} quality indicators/community`);
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('  1. Sonar-Pro: Best for detail pages where photo quality is critical');
    console.log('  2. Sonar Standard: Good balance for enrichment tasks');
    console.log('  3. Sonar Low: Suitable for bulk operations and Discovery Mode');
    
    // Save detailed results to file
    const reportData = {
      summary: {
        averagePhotos: avgPhotos,
        averageTime: avgTime,
        successRates: successRates,
        qualityStats: qualityStats
      },
      detailedResults: this.results,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync(
      'photo-retrieval-analysis-report.json',
      JSON.stringify(reportData, null, 2)
    );
    
    console.log('\n📁 Detailed report saved to: photo-retrieval-analysis-report.json');
    console.log('='.repeat(80));
  }
}

// Run the analysis
async function main() {
  const analyzer = new PhotoRetrievalAnalyzer();
  
  // Test with 10 communities by default
  await analyzer.runAnalysis(10);
  
  process.exit(0);
}

// Run the analysis immediately
main().catch(console.error);

export { PhotoRetrievalAnalyzer };