/**
 * Automated Testing Suite for Perplexity Live Web Intelligence
 * Tests community details page search quality and matching functionality
 */

import { SimplifiedPerplexityService } from '../server/simplified-perplexity-service';
import { db } from '../server/db';
import { communities } from '../shared/schema';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
  communityName: string;
  communityId: string;
  location: string;
  foundExactMatch: boolean;
  hasOfficialWebsite: boolean;
  hasPhotos: boolean;
  hasPricing: boolean;
  hasContactInfo: boolean;
  sourcesCount: number;
  testPassed: boolean;
  errors: string[];
  timestamp: Date;
}

class PerplexityIntelligenceTestSuite {
  private service: SimplifiedPerplexityService;
  private results: TestResult[] = [];
  private testCommunities: any[] = [];

  constructor() {
    this.service = new SimplifiedPerplexityService();
  }

  /**
   * Select diverse test communities from different states and types
   */
  async selectTestCommunities(): Promise<void> {
    console.log('🎯 Selecting diverse test communities...\n');

    // Get a diverse sample: HUD properties, different states, with/without pricing
    const testSample = await db.select()
      .from(communities)
      .limit(20);

    // Specifically test some known challenging cases
    const specificTests = [
      { state: 'CA', city: 'Los Angeles' },
      { state: 'TX', city: 'Houston' },
      { state: 'FL', city: 'Miami' },
      { state: 'NY', city: 'New York' },
      { state: 'AZ', city: 'Phoenix' }
    ];

    for (const test of specificTests) {
      const community = await db.select()
        .from(communities)
        .where(eq(communities.state, test.state))
        .limit(1);
      
      if (community[0]) {
        testSample.push(community[0]);
      }
    }

    this.testCommunities = testSample.slice(0, 10); // Test 10 communities
    console.log(`Selected ${this.testCommunities.length} communities for testing\n`);
  }

  /**
   * Test a single community's intelligence gathering
   */
  async testCommunity(community: any): Promise<TestResult> {
    console.log(`\n📍 Testing: ${community.name} (${community.city}, ${community.state})`);
    console.log('─'.repeat(60));

    const result: TestResult = {
      communityName: community.name,
      communityId: community.id,
      location: `${community.city}, ${community.state}`,
      foundExactMatch: false,
      hasOfficialWebsite: false,
      hasPhotos: false,
      hasPricing: false,
      hasContactInfo: false,
      sourcesCount: 0,
      testPassed: false,
      errors: [],
      timestamp: new Date()
    };

    try {
      // Test intelligence gathering
      const intelligence = await this.service.getCommunityIntelligence(
        community.name,
        `${community.city}, ${community.state}`
      );

      // Evaluate results
      result.foundExactMatch = intelligence.found;
      result.hasOfficialWebsite = !!intelligence.officialWebsite;
      result.hasPhotos = (intelligence.photos?.length ?? 0) > 0;
      result.hasPricing = !!(
        intelligence.pricing?.assistedLiving ||
        intelligence.pricing?.memoryCare ||
        intelligence.pricing?.independentLiving
      );
      result.hasContactInfo = !!(intelligence.phone || intelligence.address);
      result.sourcesCount = intelligence.sources?.length || 0;

      // Display findings
      console.log('✅ Found exact match:', result.foundExactMatch ? 'Yes' : 'No');
      console.log('🌐 Official website:', result.hasOfficialWebsite ? intelligence.officialWebsite : 'Not found');
      console.log('📸 Photos found:', result.hasPhotos ? `${intelligence.photos?.length} photos` : 'None');
      console.log('💰 Pricing info:', result.hasPricing ? 'Available' : 'Not found');
      console.log('📞 Contact info:', result.hasContactInfo ? 'Available' : 'Not found');
      console.log('📚 Sources:', `${result.sourcesCount} sources`);

      // Test quality metrics
      const qualityScore = this.calculateQualityScore(result);
      console.log(`\n🎯 Quality Score: ${qualityScore}%`);

      result.testPassed = qualityScore >= 40; // Pass if at least 40% quality

      if (!result.testPassed) {
        result.errors.push(`Quality score too low: ${qualityScore}%`);
      }

      // Check for specific issues
      if (result.foundExactMatch && !result.hasOfficialWebsite) {
        console.warn('⚠️  Found community but no website - may need better search');
      }

      if (result.hasOfficialWebsite && !result.hasPhotos) {
        console.warn('⚠️  Has website but no photos extracted - photo extraction may need improvement');
      }

    } catch (error) {
      console.error('❌ Error testing community:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      result.testPassed = false;
    }

    this.results.push(result);
    return result;
  }

  /**
   * Calculate quality score based on data completeness
   */
  calculateQualityScore(result: TestResult): number {
    let score = 0;
    const weights = {
      foundExactMatch: 40,
      hasOfficialWebsite: 20,
      hasPhotos: 15,
      hasPricing: 15,
      hasContactInfo: 10
    };

    if (result.foundExactMatch) score += weights.foundExactMatch;
    if (result.hasOfficialWebsite) score += weights.hasOfficialWebsite;
    if (result.hasPhotos) score += weights.hasPhotos;
    if (result.hasPricing) score += weights.hasPricing;
    if (result.hasContactInfo) score += weights.hasContactInfo;

    return score;
  }

  /**
   * Run the complete test suite
   */
  async runTests(): Promise<void> {
    console.log('🚀 Starting Perplexity Intelligence Test Suite');
    console.log('=' .repeat(60));
    console.log('Testing live web search quality and matching functionality\n');

    await this.selectTestCommunities();

    // Test each community
    for (const community of this.testCommunities) {
      await this.testCommunity(community);
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Generate summary report
    this.generateReport();
  }

  /**
   * Generate test report
   */
  generateReport(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));

    const passed = this.results.filter(r => r.testPassed).length;
    const failed = this.results.filter(r => !r.testPassed).length;
    const passRate = ((passed / this.results.length) * 100).toFixed(1);

    console.log(`\n✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Pass Rate: ${passRate}%\n`);

    // Metrics breakdown
    const metrics = {
      exactMatches: this.results.filter(r => r.foundExactMatch).length,
      withWebsites: this.results.filter(r => r.hasOfficialWebsite).length,
      withPhotos: this.results.filter(r => r.hasPhotos).length,
      withPricing: this.results.filter(r => r.hasPricing).length,
      withContact: this.results.filter(r => r.hasContactInfo).length
    };

    console.log('📊 Data Quality Metrics:');
    console.log(`   Exact Matches: ${metrics.exactMatches}/${this.results.length} (${((metrics.exactMatches/this.results.length)*100).toFixed(1)}%)`);
    console.log(`   With Websites: ${metrics.withWebsites}/${this.results.length} (${((metrics.withWebsites/this.results.length)*100).toFixed(1)}%)`);
    console.log(`   With Photos: ${metrics.withPhotos}/${this.results.length} (${((metrics.withPhotos/this.results.length)*100).toFixed(1)}%)`);
    console.log(`   With Pricing: ${metrics.withPricing}/${this.results.length} (${((metrics.withPricing/this.results.length)*100).toFixed(1)}%)`);
    console.log(`   With Contact: ${metrics.withContact}/${this.results.length} (${((metrics.withContact/this.results.length)*100).toFixed(1)}%)`);

    // Failed tests details
    if (failed > 0) {
      console.log('\n⚠️  Failed Tests:');
      this.results.filter(r => !r.testPassed).forEach(r => {
        console.log(`   - ${r.communityName} (${r.location}): ${r.errors.join(', ')}`);
      });
    }

    // Save detailed report
    this.saveDetailedReport();
  }

  /**
   * Save detailed report to file
   */
  saveDetailedReport(): void {
    const reportPath = path.join(process.cwd(), 'PERPLEXITY_TEST_REPORT.json');
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.results.length,
        passed: this.results.filter(r => r.testPassed).length,
        failed: this.results.filter(r => !r.testPassed).length,
        passRate: ((this.results.filter(r => r.testPassed).length / this.results.length) * 100).toFixed(1) + '%'
      },
      results: this.results
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Detailed report saved to: ${reportPath}`);
  }
}

export { PerplexityIntelligenceTestSuite };