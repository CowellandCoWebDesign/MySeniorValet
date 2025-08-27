#!/usr/bin/env tsx

/**
 * Automated Quality Test for Community Information
 * Tests 10 random communities to verify data quality and Perplexity enrichment
 * Using sonar-pro model for enhanced search capabilities
 */

import { config } from 'dotenv';
import { pool } from './server/db';
import { SimplifiedPerplexityService } from './server/simplified-perplexity-service';
import * as fs from 'fs';

config();

interface TestResult {
  communityName: string;
  communityId: number;
  location: string;
  dataQuality: {
    hasBasicInfo: boolean;
    hasPricing: boolean;
    hasContact: boolean;
    hasWebsite: boolean;
    hasCareTypes: boolean;
    hasDescription: boolean;
    hasAmenities: boolean;
    perplexityEnriched: boolean;
    citationCount: number;
  };
  perplexityData: any;
  errors: string[];
  score: number;
}

class CommunityQualityTester {
  private perplexityService: SimplifiedPerplexityService;
  private results: TestResult[] = [];
  
  constructor() {
    this.perplexityService = new SimplifiedPerplexityService();
  }

  async selectRandomCommunities(count: number = 10) {
    const query = `
      SELECT 
        c.id,
        c.name,
        c.address,
        c.city,
        c.state,
        c.zip_code,
        c.phone,
        c.website,
        c.description,
        c.pricing_details,
        c.live_pricing,
        c.care_types,
        c.amenities,
        c.latitude,
        c.longitude,
        c.country
      FROM communities c
      WHERE c.name IS NOT NULL 
        AND c.city IS NOT NULL
        AND c.state IS NOT NULL
      ORDER BY RANDOM()
      LIMIT $1
    `;
    
    const result = await pool.query(query, [count]);
    return result.rows;
  }

  async testCommunity(community: any): Promise<TestResult> {
    console.log(`\n🔍 Testing: ${community.name} in ${community.city}, ${community.state}`);
    
    const result: TestResult = {
      communityName: community.name,
      communityId: community.id,
      location: `${community.city}, ${community.state}`,
      dataQuality: {
        hasBasicInfo: !!(community.name && community.address && community.city && community.state),
        hasPricing: !!(community.pricing_details || community.live_pricing),
        hasContact: !!community.phone,
        hasWebsite: !!community.website,
        hasCareTypes: !!community.care_types,
        hasDescription: !!community.description,
        hasAmenities: !!community.amenities,
        perplexityEnriched: false,
        citationCount: 0
      },
      perplexityData: null,
      errors: [],
      score: 0
    };

    // Test Perplexity enrichment with sonar-pro
    try {
      console.log('  📡 Fetching real-time intelligence with Perplexity sonar-pro...');
      
      const location = `${community.city}, ${community.state}`;
      const perplexityData = await this.perplexityService.findExactCommunity(community.name, location);
      
      if (perplexityData && perplexityData.found) {
        result.perplexityData = {
          name: perplexityData.name,
          website: perplexityData.officialWebsite,
          phone: perplexityData.phone,
          pricing: perplexityData.pricing,
          careLevels: perplexityData.careLevels,
          description: perplexityData.description?.substring(0, 500) + '...',
          citations: perplexityData.sources,
          model: 'sonar-pro'
        };
        result.dataQuality.perplexityEnriched = true;
        result.dataQuality.citationCount = perplexityData.sources?.length || 0;
        
        console.log(`  ✅ Perplexity returned ${result.dataQuality.citationCount} citations`);
        
        // Check if Perplexity found pricing info
        if (perplexityData.pricing) {
          console.log('  💰 Pricing information found in Perplexity response');
          if (perplexityData.pricing.assistedLiving) {
            console.log(`     - Assisted Living: ${perplexityData.pricing.assistedLiving}`);
          }
          if (perplexityData.pricing.memoryCare) {
            console.log(`     - Memory Care: ${perplexityData.pricing.memoryCare}`);
          }
        }
        
        // Check if found contact info
        if (perplexityData.phone) {
          console.log(`  📞 Contact information found: ${perplexityData.phone}`);
        }
        
        // Check if found website
        if (perplexityData.officialWebsite) {
          console.log(`  🌐 Official website found: ${perplexityData.officialWebsite}`);
        }
      } else {
        console.log('  ⚠️ Community not found by Perplexity - checking nearby options');
      }
    } catch (error: any) {
      console.error(`  ❌ Perplexity error: ${error.message}`);
      result.errors.push(`Perplexity enrichment failed: ${error.message}`);
    }

    // Calculate quality score
    result.score = this.calculateQualityScore(result.dataQuality);
    console.log(`  📊 Quality Score: ${result.score}%`);
    
    return result;
  }

  calculateQualityScore(quality: TestResult['dataQuality']): number {
    const weights = {
      hasBasicInfo: 20,
      hasPricing: 15,
      hasContact: 15,
      hasWebsite: 10,
      hasCareTypes: 10,
      hasDescription: 10,
      hasAmenities: 5,
      perplexityEnriched: 10,
      citationCount: 5 // 1 point per citation up to 5
    };
    
    let score = 0;
    score += quality.hasBasicInfo ? weights.hasBasicInfo : 0;
    score += quality.hasPricing ? weights.hasPricing : 0;
    score += quality.hasContact ? weights.hasContact : 0;
    score += quality.hasWebsite ? weights.hasWebsite : 0;
    score += quality.hasCareTypes ? weights.hasCareTypes : 0;
    score += quality.hasDescription ? weights.hasDescription : 0;
    score += quality.hasAmenities ? weights.hasAmenities : 0;
    score += quality.perplexityEnriched ? weights.perplexityEnriched : 0;
    score += Math.min(quality.citationCount, 5); // Max 5 points for citations
    
    return score;
  }

  async runTests() {
    console.log('🚀 MySeniorValet Community Quality Test');
    console.log('=====================================');
    console.log(`📅 Date: ${new Date().toISOString()}`);
    console.log(`🤖 AI Model: Perplexity sonar-pro (Enhanced)`);
    console.log('');
    
    try {
      // Select random communities
      const communities = await this.selectRandomCommunities(10);
      console.log(`✅ Selected ${communities.length} random communities for testing\n`);
      
      // Test each community
      for (const community of communities) {
        const result = await this.testCommunity(community);
        this.results.push(result);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Generate report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Test failed:', error);
    } finally {
      await pool.end();
    }
  }

  generateReport() {
    console.log('\n\n📊 QUALITY TEST REPORT');
    console.log('======================\n');
    
    // Summary statistics
    const avgScore = this.results.reduce((sum, r) => sum + r.score, 0) / this.results.length;
    const withPricing = this.results.filter(r => r.dataQuality.hasPricing).length;
    const withContact = this.results.filter(r => r.dataQuality.hasContact).length;
    const withWebsite = this.results.filter(r => r.dataQuality.hasWebsite).length;
    const perplexityEnriched = this.results.filter(r => r.dataQuality.perplexityEnriched).length;
    const avgCitations = this.results.reduce((sum, r) => sum + r.dataQuality.citationCount, 0) / this.results.length;
    
    console.log('📈 SUMMARY STATISTICS:');
    console.log(`  • Average Quality Score: ${avgScore.toFixed(1)}%`);
    console.log(`  • Communities with Pricing: ${withPricing}/10 (${withPricing * 10}%)`);
    console.log(`  • Communities with Contact: ${withContact}/10 (${withContact * 10}%)`);
    console.log(`  • Communities with Website: ${withWebsite}/10 (${withWebsite * 10}%)`);
    console.log(`  • Perplexity Enriched: ${perplexityEnriched}/10 (${perplexityEnriched * 10}%)`);
    console.log(`  • Average Citations: ${avgCitations.toFixed(1)} per community`);
    console.log('');
    
    // Individual results
    console.log('📝 DETAILED RESULTS:\n');
    this.results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.communityName} (${result.location})`);
      console.log(`   Score: ${result.score}%`);
      console.log(`   ✓ Basic Info: ${result.dataQuality.hasBasicInfo ? 'Yes' : 'No'}`);
      console.log(`   ✓ Pricing: ${result.dataQuality.hasPricing ? 'Yes' : 'No'}`);
      console.log(`   ✓ Contact: ${result.dataQuality.hasContact ? 'Yes' : 'No'}`);
      console.log(`   ✓ Website: ${result.dataQuality.hasWebsite ? 'Yes' : 'No'}`);
      console.log(`   ✓ Care Types: ${result.dataQuality.hasCareTypes ? 'Yes' : 'No'}`);
      console.log(`   ✓ Perplexity Enhanced: ${result.dataQuality.perplexityEnriched ? `Yes (${result.dataQuality.citationCount} citations)` : 'No'}`);
      if (result.errors.length > 0) {
        console.log(`   ⚠️ Errors: ${result.errors.join(', ')}`);
      }
      console.log('');
    });
    
    // Save detailed report to file
    const reportData = {
      testDate: new Date().toISOString(),
      aiModel: 'Perplexity sonar-pro',
      summary: {
        totalTested: this.results.length,
        averageQualityScore: avgScore,
        withPricing,
        withContact,
        withWebsite,
        perplexityEnriched,
        averageCitations: avgCitations
      },
      communities: this.results
    };
    
    const fileName = `COMMUNITY_QUALITY_TEST_${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(fileName, JSON.stringify(reportData, null, 2));
    console.log(`\n💾 Detailed report saved to: ${fileName}`);
    
    // Quality assessment
    console.log('\n🎯 QUALITY ASSESSMENT:');
    if (avgScore >= 70) {
      console.log('✅ EXCELLENT: Data quality meets high standards');
    } else if (avgScore >= 50) {
      console.log('⚠️ GOOD: Data quality is acceptable but could be improved');
    } else {
      console.log('❌ NEEDS IMPROVEMENT: Data quality below acceptable threshold');
    }
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (withPricing < 5) {
      console.log('  • Priority: Enhance pricing data collection');
    }
    if (withContact < 7) {
      console.log('  • Priority: Improve contact information gathering');
    }
    if (perplexityEnriched < 8) {
      console.log('  • Check Perplexity API connectivity and rate limits');
    }
    if (avgCitations < 3) {
      console.log('  • Consider expanding search queries for more comprehensive results');
    }
  }
}

// Run the test
async function main() {
  const tester = new CommunityQualityTester();
  await tester.runTests();
}

main().catch(console.error);