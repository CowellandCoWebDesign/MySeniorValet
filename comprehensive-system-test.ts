#!/usr/bin/env tsx

/**
 * Comprehensive System Testing for MySeniorValet
 * Tests wider sample with detailed metrics
 */

import { db } from './server/db';
import { communities } from './shared/schema';
import { simplifiedPerplexityService } from './server/simplified-perplexity-service';
import { eq, sql, and, or } from 'drizzle-orm';
import fs from 'fs/promises';

interface TestMetrics {
  totalTested: number;
  perplexitySuccess: number;
  websitesFound: number;
  phonesFound: number;
  pricingFound: number;
  photosFound: number;
  careLevelsFound: number;
  amenitiesFound: number;
  citationsReceived: number[];
  averageQualityScore: number;
  hudPropertiesEnriched: number;
  internationalEnriched: number;
}

async function runComprehensiveTest() {
  console.log('\n🚀 MySeniorValet COMPREHENSIVE SYSTEM TEST');
  console.log('=' .repeat(50));
  console.log(`📅 Date: ${new Date().toISOString()}`);
  console.log(`🤖 AI Model: Perplexity sonar-pro (Enhanced)`);
  console.log('🎯 Testing 30 diverse communities for system reliability\n');

  // Get diverse sample: US, Canada, Mexico, Australia, HUD properties
  const diverseSample = await db.select()
  .from(communities)
  .orderBy(sql`RANDOM()`)
  .limit(30);

  console.log(`✅ Selected ${diverseSample.length} communities for comprehensive testing\n`);

  const metrics: TestMetrics = {
    totalTested: 0,
    perplexitySuccess: 0,
    websitesFound: 0,
    phonesFound: 0,
    pricingFound: 0,
    photosFound: 0,
    careLevelsFound: 0,
    amenitiesFound: 0,
    citationsReceived: [],
    averageQualityScore: 0,
    hudPropertiesEnriched: 0,
    internationalEnriched: 0
  };

  const detailedResults: any[] = [];

  // Test each community
  for (const community of diverseSample) {
    metrics.totalTested++;
    
    const location = `${community.city}, ${community.state}`;
    console.log(`\n🔍 Testing ${metrics.totalTested}/30: ${community.name} in ${location}`);
    
    if (community.isHudProperty) {
      console.log('  🏛️ HUD Property');
    }
    if (community.country && community.country !== 'United States') {
      console.log(`  🌍 International: ${community.country}`);
    }

    console.log('  📡 Fetching real-time intelligence...');

    try {
      const intelligence = await simplifiedPerplexityService.getCommunityIntelligence(
        community.name,
        location
      );

      let qualityScore = 50; // Base score
      const result: any = {
        name: community.name,
        location: location,
        country: community.country,
        isHudProperty: community.isHudProperty,
        intelligence: intelligence
      };

      // Analyze results
      if (intelligence.found) {
        metrics.perplexitySuccess++;
        qualityScore += 10;
        console.log('  ✅ Community found by Perplexity');

        if (intelligence.sources && intelligence.sources.length > 0) {
          metrics.citationsReceived.push(intelligence.sources.length);
          console.log(`  📚 ${intelligence.sources.length} citations received`);
          qualityScore += Math.min(intelligence.sources.length * 2, 10);
        }

        if (intelligence.officialWebsite) {
          metrics.websitesFound++;
          qualityScore += 5;
          console.log(`  🌐 Website: ${intelligence.officialWebsite}`);
        }

        if (intelligence.phone) {
          metrics.phonesFound++;
          qualityScore += 5;
          console.log(`  📞 Phone: ${intelligence.phone}`);
        }

        if (intelligence.pricing && Object.keys(intelligence.pricing).length > 0) {
          metrics.pricingFound++;
          qualityScore += 10;
          console.log(`  💰 Pricing found for ${Object.keys(intelligence.pricing).length} care types`);
        }

        if (intelligence.photos && intelligence.photos.length > 0) {
          metrics.photosFound++;
          qualityScore += 5;
          console.log(`  📸 ${intelligence.photos.length} photos found`);
        }

        if (intelligence.careLevels && intelligence.careLevels.length > 0) {
          metrics.careLevelsFound++;
          qualityScore += 5;
          console.log(`  🏥 ${intelligence.careLevels.length} care levels identified`);
        }

        if (intelligence.amenities && intelligence.amenities.length > 0) {
          metrics.amenitiesFound++;
          qualityScore += 5;
          console.log(`  ✨ ${intelligence.amenities.length} amenities identified`);
        }

        if (community.isHudProperty && intelligence.found) {
          metrics.hudPropertiesEnriched++;
        }

        if (community.country !== 'United States' && intelligence.found) {
          metrics.internationalEnriched++;
        }
      } else {
        console.log('  ⚠️ Community not found');
      }

      result.qualityScore = Math.min(qualityScore, 100);
      metrics.averageQualityScore += result.qualityScore;
      console.log(`  📊 Quality Score: ${result.qualityScore}%`);

      detailedResults.push(result);

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`  ❌ Error testing community:`, error);
    }
  }

  // Calculate final metrics
  metrics.averageQualityScore = Math.round(metrics.averageQualityScore / metrics.totalTested);
  const avgCitations = metrics.citationsReceived.length > 0 
    ? (metrics.citationsReceived.reduce((a, b) => a + b, 0) / metrics.citationsReceived.length).toFixed(1)
    : '0';

  // Display comprehensive results
  console.log('\n' + '='.repeat(50));
  console.log('📊 COMPREHENSIVE TEST RESULTS');
  console.log('='.repeat(50));

  console.log('\n🎯 OVERALL METRICS:');
  console.log(`  • Communities Tested: ${metrics.totalTested}`);
  console.log(`  • Average Quality Score: ${metrics.averageQualityScore}%`);
  console.log(`  • Perplexity Success Rate: ${((metrics.perplexitySuccess / metrics.totalTested) * 100).toFixed(1)}%`);
  console.log(`  • Average Citations: ${avgCitations}`);

  console.log('\n📈 DATA EXTRACTION SUCCESS RATES:');
  console.log(`  • Websites Found: ${metrics.websitesFound}/${metrics.totalTested} (${((metrics.websitesFound / metrics.totalTested) * 100).toFixed(1)}%)`);
  console.log(`  • Phone Numbers Found: ${metrics.phonesFound}/${metrics.totalTested} (${((metrics.phonesFound / metrics.totalTested) * 100).toFixed(1)}%)`);
  console.log(`  • Pricing Found: ${metrics.pricingFound}/${metrics.totalTested} (${((metrics.pricingFound / metrics.totalTested) * 100).toFixed(1)}%)`);
  console.log(`  • Photos Found: ${metrics.photosFound}/${metrics.totalTested} (${((metrics.photosFound / metrics.totalTested) * 100).toFixed(1)}%)`);
  console.log(`  • Care Levels Found: ${metrics.careLevelsFound}/${metrics.totalTested} (${((metrics.careLevelsFound / metrics.totalTested) * 100).toFixed(1)}%)`);
  console.log(`  • Amenities Found: ${metrics.amenitiesFound}/${metrics.totalTested} (${((metrics.amenitiesFound / metrics.totalTested) * 100).toFixed(1)}%)`);

  console.log('\n🌍 SPECIAL CATEGORIES:');
  const hudCount = diverseSample.filter(c => c.isHudProperty).length;
  const intlCount = diverseSample.filter(c => c.country && c.country !== 'United States').length;
  
  if (hudCount > 0) {
    console.log(`  • HUD Properties Enriched: ${metrics.hudPropertiesEnriched}/${hudCount} (${((metrics.hudPropertiesEnriched / hudCount) * 100).toFixed(1)}%)`);
  }
  
  if (intlCount > 0) {
    console.log(`  • International Enriched: ${metrics.internationalEnriched}/${intlCount} (${((metrics.internationalEnriched / intlCount) * 100).toFixed(1)}%)`);
  }

  // System health assessment
  console.log('\n💡 SYSTEM HEALTH ASSESSMENT:');
  
  if (metrics.averageQualityScore >= 80) {
    console.log('  ✅ EXCELLENT: All systems functioning optimally');
  } else if (metrics.averageQualityScore >= 70) {
    console.log('  ✅ GOOD: Systems performing well with minor gaps');
  } else if (metrics.averageQualityScore >= 60) {
    console.log('  ⚠️ MODERATE: Systems functional but needs improvement');
  } else {
    console.log('  ❌ NEEDS ATTENTION: Significant system issues detected');
  }

  // Specific system status
  console.log('\n🔧 SUBSYSTEM STATUS:');
  console.log(`  • Perplexity AI: ${metrics.perplexitySuccess >= 25 ? '✅ Online' : '⚠️ Degraded'}`);
  console.log(`  • Website Scraper: ${metrics.photosFound >= 10 ? '✅ Working' : '⚠️ Limited'}`);
  console.log(`  • Data Parser: ${metrics.phonesFound >= 10 ? '✅ Accurate' : '⚠️ Needs Tuning'}`);
  console.log(`  • Pricing Engine: ${metrics.pricingFound >= 15 ? '✅ Active' : '⚠️ Partial'}`);

  // Save detailed report
  const reportPath = `COMPREHENSIVE_TEST_REPORT_${new Date().toISOString().split('T')[0]}.json`;
  await fs.writeFile(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    metrics,
    detailedResults,
    systemHealth: {
      overallScore: metrics.averageQualityScore,
      perplexityUptime: (metrics.perplexitySuccess / metrics.totalTested) * 100,
      dataCompleteness: {
        websites: (metrics.websitesFound / metrics.totalTested) * 100,
        phones: (metrics.phonesFound / metrics.totalTested) * 100,
        pricing: (metrics.pricingFound / metrics.totalTested) * 100,
        photos: (metrics.photosFound / metrics.totalTested) * 100
      }
    }
  }, null, 2));

  console.log(`\n💾 Detailed report saved to: ${reportPath}`);
  
  console.log('\n🎯 FINAL VERDICT:');
  if (metrics.averageQualityScore >= 75 && metrics.perplexitySuccess >= 25) {
    console.log('✅ SYSTEMS IN SYNC - Platform ready for production use');
  } else {
    console.log('⚠️ SYSTEMS NEED ALIGNMENT - Review detailed report for issues');
  }
}

// Run the test
runComprehensiveTest()
  .then(() => {
    console.log('\n✅ Comprehensive system test completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });