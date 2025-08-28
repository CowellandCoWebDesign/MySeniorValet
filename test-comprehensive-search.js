#!/usr/bin/env node

/**
 * Comprehensive NLP Search System Test Suite
 * Based on MS MARCO, TREC, and Zillow testing standards
 */

import axios from 'axios';
import assert from 'assert';

const BASE_URL = 'http://localhost:5000';
const TEST_TIMEOUT = 10000; // 10 seconds max per test

class ComprehensiveSearchTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  async runTest(testName, testFunction) {
    console.log(`\n🧪 Testing: ${testName}`);
    try {
      const startTime = Date.now();
      await testFunction();
      const duration = Date.now() - startTime;
      console.log(`✅ PASSED: ${testName} (${duration}ms)`);
      this.results.passed++;
    } catch (error) {
      console.log(`❌ FAILED: ${testName}`);
      console.log(`   Error: ${error.message}`);
      this.results.failed++;
      this.results.errors.push({ test: testName, error: error.message });
    }
  }

  async searchAPI(query, limit = 10) {
    const response = await axios.post(`${BASE_URL}/api/search/comprehensive`, {
      query,
      limit
    }, { timeout: TEST_TIMEOUT });
    return response.data;
  }

  async nlpAskAPI(question) {
    const response = await axios.post(`${BASE_URL}/api/nlp/ask`, {
      question,
      includeRecommendations: true
    }, { timeout: TEST_TIMEOUT });
    return response.data;
  }

  async nlpSearchAPI(query) {
    const response = await axios.post(`${BASE_URL}/api/nlp/search`, {
      query
    }, { timeout: TEST_TIMEOUT });
    return response.data;
  }

  // CRITICAL TEST 1: Sacramento Memory Care (Previously Broken)
  async testSacramentoMemoryCare() {
    const result = await this.searchAPI("Sacramento memory care", 5);
    
    assert(result.success, "Search request should succeed");
    assert(result.totalResults > 0, `Should return results, got ${result.totalResults}`);
    assert(result.searchMetadata.intentScores, "Should include intent scores");
    assert(result.searchMetadata.intentScores.location > 0.2, "Should detect location intent");
    assert(result.searchMetadata.intentScores.careType > 0.3, "Should detect care type intent");
    
    // Verify actual results contain memory care
    const hasMemoryCare = result.communities.some(c => 
      c.careTypes && c.careTypes.some(ct => 
        ct.toLowerCase().includes('memory care')
      )
    );
    assert(hasMemoryCare, "Results should contain communities with Memory Care");
  }

  // CRITICAL TEST 2: Price Filtering (Previously Broken)
  async testPriceFilteringUnder4000() {
    const result = await this.searchAPI("under $4000", 10);
    
    assert(result.success, "Price search should succeed");
    assert(result.totalResults > 0, `Should return results, got ${result.totalResults}`);
    assert(result.searchMetadata.intentScores?.price > 0.5, "Should detect price intent strongly");
    
    // Verify all results are actually under $4000
    const validPrices = result.communities.filter(c => c.rentPerMonth).every(c => {
      const price = parseFloat(c.rentPerMonth.replace(/[$,]/g, ''));
      return !isNaN(price) && price < 4000;
    });
    assert(validPrices, "All results with prices should be under $4000");
  }

  // CRITICAL TEST 3: Multi-Intent Detection
  async testMultiIntentDetection() {
    const testCases = [
      {
        query: "Sacramento memory care",
        expectedIntents: { location: 0.2, careType: 0.3 },
        expectedDominant: "careType"
      },
      {
        query: "Sacramento under $5000", 
        expectedIntents: { location: 0.2, price: 0.3 },
        expectedDominant: "price"
      },
      {
        query: "Atria assisted living",
        expectedIntents: { company: 0.4, careType: 0.3 },
        expectedDominant: "company"
      }
    ];

    for (const testCase of testCases) {
      const result = await this.searchAPI(testCase.query, 5);
      assert(result.success, `Search for "${testCase.query}" should succeed`);
      
      const scores = result.searchMetadata.intentScores;
      assert(scores, "Should include intent scores");
      
      for (const [intent, minScore] of Object.entries(testCase.expectedIntents)) {
        assert(scores[intent] >= minScore, 
          `${intent} score should be >= ${minScore}, got ${scores[intent]} for "${testCase.query}"`);
      }
    }
  }

  // CRITICAL TEST 4: Learn Tab NLP Endpoints
  async testLearnTabEndpoints() {
    // Test Q&A endpoint
    const qaResult = await this.nlpAskAPI("What is memory care?");
    assert(qaResult.question, "Should return the question");
    assert(qaResult.answer, "Should return an answer");
    assert(qaResult.answer.length > 20, "Answer should be substantial");
    assert(qaResult.confidence > 0.5, "Should have reasonable confidence");

    // Test NLP search endpoint
    const searchResult = await this.nlpSearchAPI("memory care communities");
    assert(searchResult.results, "Should return results array");
    assert(searchResult.results.length > 0, "Should return some results");
  }

  // CRITICAL TEST 5: Edge Cases and Error Handling
  async testEdgeCases() {
    const edgeCases = [
      { query: "", expectedBehavior: "handle empty query" },
      { query: "   ", expectedBehavior: "handle whitespace" },
      { query: "xyz123abc", expectedBehavior: "handle invalid location" },
      { query: "under $0", expectedBehavior: "handle zero price" },
      { query: "under $abc", expectedBehavior: "handle invalid price format" }
    ];

    for (const testCase of edgeCases) {
      try {
        const result = await this.searchAPI(testCase.query, 5);
        assert(result.success !== undefined, `Should handle "${testCase.query}" gracefully`);
        console.log(`   ✓ Edge case "${testCase.query}": ${result.success ? 'Success' : 'Handled error'}`);
      } catch (error) {
        // Edge cases should not crash the system
        assert(false, `Edge case "${testCase.query}" should not crash: ${error.message}`);
      }
    }
  }

  // PERFORMANCE TEST 6: Response Times
  async testPerformance() {
    const performanceTests = [
      { query: "Sacramento", maxTime: 1000 },
      { query: "memory care", maxTime: 800 },
      { query: "under $5000", maxTime: 1200 },
      { query: "Sacramento memory care under $5000", maxTime: 1500 }
    ];

    for (const test of performanceTests) {
      const startTime = Date.now();
      const result = await this.searchAPI(test.query, 10);
      const duration = Date.now() - startTime;
      
      assert(result.success, `Performance test query "${test.query}" should succeed`);
      assert(duration < test.maxTime, 
        `Query "${test.query}" took ${duration}ms, should be under ${test.maxTime}ms`);
      
      console.log(`   ⚡ "${test.query}": ${duration}ms (target: <${test.maxTime}ms)`);
    }
  }

  // DATA INTEGRITY TEST 7: PostgreSQL Casting Validation
  async testDatabaseIntegrity() {
    // Test price queries with various formats
    const priceTests = [
      "under $3999.99",
      "under $4000.00", 
      "under $4000.01",
      "over $7000",
      "$3000 to $6000"
    ];

    for (const priceQuery of priceTests) {
      const result = await this.searchAPI(priceQuery, 5);
      assert(result.success, `Price query "${priceQuery}" should not cause database errors`);
      
      // If we get results, verify they have valid price data
      if (result.communities && result.communities.length > 0) {
        const hasValidPrices = result.communities.every(c => {
          if (!c.rentPerMonth) return true; // No price is OK
          const price = parseFloat(c.rentPerMonth.replace(/[$,]/g, ''));
          return !isNaN(price) && price >= 0 && price < 100000; // Sanity check
        });
        assert(hasValidPrices, `All returned prices should be valid for "${priceQuery}"`);
      }
    }
  }

  // COMPREHENSIVE TEST RUNNER
  async runAllTests() {
    console.log("🚀 Starting Comprehensive NLP Search System Test Suite");
    console.log("📊 Based on MS MARCO, TREC, and Zillow testing standards\n");

    await this.runTest("CRITICAL: Sacramento Memory Care Search", 
      () => this.testSacramentoMemoryCare());

    await this.runTest("CRITICAL: Price Filtering Under $4000", 
      () => this.testPriceFilteringUnder4000());

    await this.runTest("CRITICAL: Multi-Intent Detection", 
      () => this.testMultiIntentDetection());

    await this.runTest("CRITICAL: Learn Tab NLP Endpoints", 
      () => this.testLearnTabEndpoints());

    await this.runTest("CRITICAL: Edge Cases and Error Handling", 
      () => this.testEdgeCases());

    await this.runTest("Performance Benchmarks", 
      () => this.testPerformance());

    await this.runTest("Database Integrity (PostgreSQL Casting)", 
      () => this.testDatabaseIntegrity());

    this.printResults();
  }

  printResults() {
    console.log("\n" + "=".repeat(60));
    console.log("📊 COMPREHENSIVE TEST RESULTS");
    console.log("=".repeat(60));
    
    const total = this.results.passed + this.results.failed;
    const passRate = ((this.results.passed / total) * 100).toFixed(1);
    
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Pass Rate: ${passRate}%`);
    
    if (this.results.failed > 0) {
      console.log("\n🚨 FAILED TESTS:");
      this.results.errors.forEach(error => {
        console.log(`   ❌ ${error.test}: ${error.error}`);
      });
    }

    console.log("\n" + "=".repeat(60));
    
    // Determine if system is functional based on industry standards
    const isFunctional = this.evaluateSystemFunctionality(passRate);
    
    if (isFunctional) {
      console.log("🎉 SYSTEM STATUS: FUNCTIONAL");
      console.log("✅ Meets industry testing standards for NLP search systems");
    } else {
      console.log("🚨 SYSTEM STATUS: NOT FUNCTIONAL");
      console.log("❌ Does not meet minimum requirements for production deployment");
    }
    
    console.log("=".repeat(60));
  }

  evaluateSystemFunctionality(passRate) {
    // Based on research: Industry standards require 90%+ pass rate for critical functionality
    const criticalTestsPassed = this.results.passed >= 5; // At least 5 critical tests must pass
    const overallPassRate = passRate >= 90;
    const noCriticalFailures = !this.results.errors.some(error => 
      error.test.includes("CRITICAL")
    );

    return criticalTestsPassed && overallPassRate && noCriticalFailures;
  }
}

// Execute the test suite
async function main() {
  const tester = new ComprehensiveSearchTester();
  
  try {
    await tester.runAllTests();
  } catch (error) {
    console.error("\n🚨 CRITICAL ERROR: Test suite failed to complete");
    console.error(error.message);
    process.exit(1);
  }
  
  // Exit with proper code based on results
  process.exit(tester.results.failed > 0 ? 1 : 0);
}

main();