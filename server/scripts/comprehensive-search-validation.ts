#!/usr/bin/env tsx
/**
 * COMPREHENSIVE SEARCH VALIDATION TESTING
 * Automated validation of all search coverage areas for MySeniorValet
 */

import { db } from '../db';
import { communities } from '@shared/schema';
import { sql, ilike, or } from 'drizzle-orm';

interface ValidationResult {
  testName: string;
  passed: boolean;
  details: any;
  issues?: string[];
  coverage?: number;
}

class SearchValidationTester {
  private results: ValidationResult[] = [];

  async runAllTests(): Promise<ValidationResult[]> {
    console.log('🧪 STARTING COMPREHENSIVE SEARCH VALIDATION TESTING');
    console.log('=' .repeat(60));

    await this.testDatabaseCoverage();
    await this.testLocationCoverage();
    await this.testCommunityNameMatching();
    await this.testStateAndCountryCoverage();
    await this.testCityMatching();
    await this.testCareTypeMatching();
    await this.testCompanyNameMatching();
    await this.testInternationalCoverage();
    await this.testTextPredictionAPI();
    await this.testSearchAPI();
    await this.testDataQuality();

    this.generateReport();
    return this.results;
  }

  private async testDatabaseCoverage(): Promise<void> {
    console.log('\n📊 Testing Database Coverage...');
    
    const stats = await db.select({
      total: sql<number>`COUNT(*)::int`,
      withNames: sql<number>`COUNT(*) FILTER (WHERE name IS NOT NULL AND name != '')::int`,
      withCities: sql<number>`COUNT(*) FILTER (WHERE city IS NOT NULL AND city != '')::int`,
      withStates: sql<number>`COUNT(*) FILTER (WHERE state IS NOT NULL AND state != '')::int`,
      withCountries: sql<number>`COUNT(*) FILTER (WHERE country IS NOT NULL AND country != '')::int`,
      withCareTypes: sql<number>`COUNT(*) FILTER (WHERE care_types IS NOT NULL AND array_length(care_types, 1) > 0)::int`,
      withPricing: sql<number>`COUNT(*) FILTER (WHERE rent_per_month IS NOT NULL)::int`
    }).from(communities);

    const result = stats[0];
    const coverage = {
      names: (result.withNames / result.total) * 100,
      cities: (result.withCities / result.total) * 100,
      states: (result.withStates / result.total) * 100,
      countries: (result.withCountries / result.total) * 100,
      careTypes: (result.withCareTypes / result.total) * 100,
      pricing: (result.withPricing / result.total) * 100
    };

    this.results.push({
      testName: 'Database Coverage',
      passed: result.total > 30000 && coverage.names > 95,
      details: {
        totalCommunities: result.total,
        coverage: coverage
      },
      coverage: coverage.names
    });
  }

  private async testLocationCoverage(): Promise<void> {
    console.log('🗺️ Testing Location Coverage...');

    const locationStats = await db.select({
      uniqueCountries: sql<number>`COUNT(DISTINCT country)::int`,
      uniqueStates: sql<number>`COUNT(DISTINCT state)::int`,
      uniqueCities: sql<number>`COUNT(DISTINCT city)::int`
    }).from(communities);

    const topCountries = await db.select({
      country: communities.country,
      count: sql<number>`COUNT(*)::int`
    }).from(communities)
      .where(sql`country IS NOT NULL AND country != ''`)
      .groupBy(communities.country)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(10);

    const topStates = await db.select({
      state: communities.state,
      count: sql<number>`COUNT(*)::int`
    }).from(communities)
      .where(sql`state IS NOT NULL AND state != ''`)
      .groupBy(communities.state)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(15);

    this.results.push({
      testName: 'Location Coverage',
      passed: locationStats[0].uniqueCountries >= 5 && locationStats[0].uniqueStates >= 50,
      details: {
        stats: locationStats[0],
        topCountries: topCountries,
        topStates: topStates
      },
      coverage: (locationStats[0].uniqueStates / 50) * 100
    });
  }

  private async testCommunityNameMatching(): Promise<void> {
    console.log('🏘️ Testing Community Name Matching...');

    const testQueries = ['Atria', 'Brookdale', 'Sunrise', 'Assisted', 'Memory'];
    const issues = [];

    for (const query of testQueries) {
      const matches = await db.select({
        id: communities.id,
        name: communities.name
      }).from(communities)
        .where(ilike(communities.name, `%${query}%`))
        .limit(5);

      if (matches.length === 0) {
        issues.push(`No matches found for "${query}"`);
      }
    }

    // Test exact community name matching
    const sampleCommunity = await db.select({
      name: communities.name
    }).from(communities)
      .where(sql`name IS NOT NULL AND name != ''`)
      .limit(1);

    if (sampleCommunity.length > 0) {
      const exactMatch = await db.select().from(communities)
        .where(ilike(communities.name, sampleCommunity[0].name))
        .limit(1);
      
      if (exactMatch.length === 0) {
        issues.push('Exact name matching failed');
      }
    }

    this.results.push({
      testName: 'Community Name Matching',
      passed: issues.length === 0,
      details: { testQueries, sampleTests: testQueries.length },
      issues: issues
    });
  }

  private async testStateAndCountryCoverage(): Promise<void> {
    console.log('🌎 Testing State and Country Coverage...');

    const majorStates = ['CA', 'FL', 'TX', 'NY', 'PA', 'OH', 'IL', 'MI', 'NC', 'GA'];
    const expectedCountries = ['US', 'CA', 'AU', 'Mexico', 'Japan'];
    const issues = [];

    // Test major US states
    for (const state of majorStates) {
      const count = await db.select({
        count: sql<number>`COUNT(*)::int`
      }).from(communities)
        .where(ilike(communities.state, state));

      if (count[0].count === 0) {
        issues.push(`No communities found in state: ${state}`);
      }
    }

    // Test international countries
    for (const country of expectedCountries) {
      const count = await db.select({
        count: sql<number>`COUNT(*)::int`
      }).from(communities)
        .where(ilike(communities.country, country));

      if (count[0].count === 0) {
        issues.push(`No communities found in country: ${country}`);
      }
    }

    this.results.push({
      testName: 'State and Country Coverage',
      passed: issues.length === 0,
      details: {
        testedStates: majorStates.length,
        testedCountries: expectedCountries.length
      },
      issues: issues
    });
  }

  private async testCityMatching(): Promise<void> {
    console.log('🏙️ Testing City Matching...');

    const majorCities = ['Los Angeles', 'New York', 'Chicago', 'Houston', 'Phoenix', 'Toronto', 'Sydney', 'Sacramento'];
    const issues = [];
    let successfulMatches = 0;

    for (const city of majorCities) {
      const matches = await db.select({
        city: communities.city,
        state: communities.state,
        count: sql<number>`COUNT(*)::int`
      }).from(communities)
        .where(ilike(communities.city, `%${city}%`))
        .groupBy(communities.city, communities.state)
        .limit(5);

      if (matches.length > 0) {
        successfulMatches++;
      } else {
        issues.push(`No matches found for city: ${city}`);
      }
    }

    this.results.push({
      testName: 'City Matching',
      passed: successfulMatches >= 4, // At least 50% of major cities should have matches
      details: {
        totalCities: majorCities.length,
        successfulMatches: successfulMatches,
        coverage: (successfulMatches / majorCities.length) * 100
      },
      issues: issues
    });
  }

  private async testCareTypeMatching(): Promise<void> {
    console.log('🏥 Testing Care Type Matching...');

    const careTypes = ['Memory Care', 'Assisted Living', 'Independent Living', 'Nursing Home', 'Senior Housing'];
    const issues = [];
    let successfulMatches = 0;

    for (const careType of careTypes) {
      const matches = await db.select({
        id: communities.id,
        careTypes: communities.careTypes
      }).from(communities)
        .where(sql`array_to_string(care_types, ', ') ILIKE '%${careType}%'`)
        .limit(5);

      if (matches.length > 0 || partialMatches.length > 0) {
        successfulMatches++;
      } else {
        issues.push(`No matches found for care type: ${careType}`);
      }
    }

    this.results.push({
      testName: 'Care Type Matching',
      passed: successfulMatches >= 3,
      details: {
        totalCareTypes: careTypes.length,
        successfulMatches: successfulMatches
      },
      issues: issues
    });
  }

  private async testCompanyNameMatching(): Promise<void> {
    console.log('🏢 Testing Company Name Matching...');

    const companies = ['Atria', 'Brookdale', 'Sunrise', 'Brightview', 'Belmont Village'];
    const issues = [];
    let successfulMatches = 0;

    for (const company of companies) {
      const matches = await db.select({
        id: communities.id,
        name: communities.name
      }).from(communities)
        .where(ilike(communities.name, `%${company}%`))
        .limit(10);

      if (matches.length > 0) {
        successfulMatches++;
      } else {
        issues.push(`No communities found for company: ${company}`);
      }
    }

    this.results.push({
      testName: 'Company Name Matching',
      passed: successfulMatches >= 2, // At least some major companies should be present
      details: {
        totalCompanies: companies.length,
        successfulMatches: successfulMatches
      },
      issues: issues
    });
  }

  private async testInternationalCoverage(): Promise<void> {
    console.log('🌍 Testing International Coverage...');

    const internationalTests = [
      { country: 'CA', minExpected: 1000 },
      { country: 'AU', minExpected: 100 },
      { country: 'Mexico', minExpected: 50 },
      { country: 'Japan', minExpected: 10 }
    ];

    const issues = [];

    for (const test of internationalTests) {
      const count = await db.select({
        count: sql<number>`COUNT(*)::int`
      }).from(communities)
        .where(ilike(communities.country, test.country));

      if (count[0].count < test.minExpected) {
        issues.push(`${test.country}: ${count[0].count} communities (expected >= ${test.minExpected})`);
      }
    }

    this.results.push({
      testName: 'International Coverage',
      passed: issues.length === 0,
      details: { internationalTests },
      issues: issues
    });
  }

  private async testTextPredictionAPI(): Promise<void> {
    console.log('💭 Testing Text Prediction API...');

    const testQueries = ['San', 'memory', 'Canada', 'Atria', 'assisted'];
    const issues = [];

    for (const query of testQueries) {
      try {
        const response = await fetch(`http://localhost:5000/api/search/suggestions?q=${query}`);
        if (!response.ok) {
          issues.push(`API error for "${query}": ${response.status}`);
          continue;
        }

        const data = await response.json();
        if (!data.suggestions || !Array.isArray(data.suggestions)) {
          issues.push(`Invalid response format for "${query}"`);
          continue;
        }

        if (data.suggestions.length === 0) {
          issues.push(`No suggestions returned for "${query}"`);
        }
      } catch (error) {
        issues.push(`API call failed for "${query}": ${error.message}`);
      }
    }

    this.results.push({
      testName: 'Text Prediction API',
      passed: issues.length === 0,
      details: { testQueries },
      issues: issues
    });
  }

  private async testSearchAPI(): Promise<void> {
    console.log('🔍 Testing Search API...');

    const testQueries = ['memory care', 'Sacramento', 'assisted living under $5000'];
    const issues = [];

    for (const query of testQueries) {
      try {
        const response = await fetch(`http://localhost:5000/api/search/comprehensive?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
          issues.push(`Search API error for "${query}": ${response.status}`);
          continue;
        }

        const data = await response.json();
        if (!data.communities || !Array.isArray(data.communities)) {
          issues.push(`Invalid search response format for "${query}"`);
          continue;
        }

        if (data.communities.length === 0) {
          issues.push(`No search results for "${query}"`);
        }
      } catch (error) {
        issues.push(`Search API call failed for "${query}": ${error.message}`);
      }
    }

    this.results.push({
      testName: 'Search API',
      passed: issues.length === 0,
      details: { testQueries },
      issues: issues
    });
  }

  private async testDataQuality(): Promise<void> {
    console.log('🔎 Testing Data Quality...');

    const qualityChecks = await db.select({
      totalRecords: sql<number>`COUNT(*)::int`,
      missingNames: sql<number>`COUNT(*) FILTER (WHERE name IS NULL OR name = '')::int`,
      missingCities: sql<number>`COUNT(*) FILTER (WHERE city IS NULL OR city = '')::int`,
      missingStates: sql<number>`COUNT(*) FILTER (WHERE state IS NULL OR state = '')::int`,
      duplicateNames: sql<number>`COUNT(*) - COUNT(DISTINCT name)::int`,
      invalidCoordinates: sql<number>`COUNT(*) FILTER (WHERE latitude IS NULL OR longitude IS NULL OR latitude::float = 0 OR longitude::float = 0)::int`
    }).from(communities);

    const result = qualityChecks[0];
    const issues = [];

    if (result.missingNames > result.totalRecords * 0.05) {
      issues.push(`High missing names: ${result.missingNames} (${((result.missingNames / result.totalRecords) * 100).toFixed(1)}%)`);
    }

    if (result.missingCities > result.totalRecords * 0.02) {
      issues.push(`High missing cities: ${result.missingCities} (${((result.missingCities / result.totalRecords) * 100).toFixed(1)}%)`);
    }

    this.results.push({
      testName: 'Data Quality',
      passed: issues.length === 0,
      details: result,
      issues: issues
    });
  }

  private generateReport(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📋 COMPREHENSIVE SEARCH VALIDATION REPORT');
    console.log('='.repeat(60));

    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const passRate = (passed / total) * 100;

    console.log(`\n🎯 OVERALL RESULTS: ${passed}/${total} tests passed (${passRate.toFixed(1)}%)`);

    this.results.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`\n${status} ${result.testName}`);
      
      if (result.coverage !== undefined) {
        console.log(`   Coverage: ${result.coverage.toFixed(1)}%`);
      }
      
      if (result.issues && result.issues.length > 0) {
        console.log('   Issues:');
        result.issues.forEach(issue => console.log(`   - ${issue}`));
      }
      
      if (result.details) {
        console.log(`   Details: ${JSON.stringify(result.details, null, 2).slice(0, 200)}...`);
      }
    });

    console.log('\n' + '='.repeat(60));
    
    if (passRate >= 80) {
      console.log('🎉 EXCELLENT: Search system is highly functional');
    } else if (passRate >= 60) {
      console.log('⚠️  GOOD: Search system is functional with some issues');
    } else {
      console.log('🚨 NEEDS ATTENTION: Search system has significant issues');
    }
  }
}

// Run the validation
const tester = new SearchValidationTester();
tester.runAllTests().catch(console.error);

export { SearchValidationTester };