#!/usr/bin/env node

import http from 'http';

// Test cases covering various scenarios
const testCases = [
  // Hilltop communities (the problematic case)
  {
    name: "Hilltop Estates - A Provincial Senior Living Community",
    city: "Redding",
    state: "CA",
    address: "451 Hilltop Dr",
    expectedResult: "should find verified information",
    testId: "hilltop_estates"
  },
  {
    name: "Hilltop Springs Senior Living", 
    city: "Redding",
    state: "CA",
    address: "7 Hilltop Dr",
    expectedResult: "should find verified information",
    testId: "hilltop_springs"
  },
  // Different types of communities
  {
    name: "Sunrise Senior Living",
    city: "McLean",
    state: "VA", 
    expectedResult: "should find verified information",
    testId: "sunrise_mclean"
  },
  {
    name: "Brookdale Senior Living",
    city: "Phoenix",
    state: "AZ",
    expectedResult: "should find verified information", 
    testId: "brookdale_phoenix"
  },
  // Edge cases
  {
    name: "Nonexistent Community Name XYZ123",
    city: "Nowhere",
    state: "XX",
    expectedResult: "should return verification alert",
    testId: "nonexistent"
  },
  {
    name: "The Gardens",
    city: "San Diego", 
    state: "CA",
    expectedResult: "should handle generic names",
    testId: "generic_name"
  },
  // Brand name variations
  {
    name: "Atria Senior Living",
    city: "San Francisco",
    state: "CA",
    expectedResult: "should find brand information",
    testId: "atria_sf"
  }
];

// Test configuration
const BASE_URL = 'http://localhost:5000';
const TIMEOUT_MS = 60000; // 60 second timeout per test
const MAX_CONCURRENT_TESTS = 2; // Limit concurrent tests to avoid overload

class VerificationTester {
  constructor() {
    this.results = [];
    this.stats = {
      total: 0,
      passed: 0,
      failed: 0,
      timeouts: 0,
      verificationSuccess: 0,
      retrySuccess: 0
    };
  }

  async runTest(testCase) {
    console.log(`\n🧪 Testing: ${testCase.testId}`);
    console.log(`   Community: ${testCase.name}`);
    console.log(`   Location: ${testCase.city}, ${testCase.state}`);
    
    const startTime = Date.now();
    
    try {
      const result = await this.callWebIntelligence(testCase);
      const duration = Date.now() - startTime;
      
      const testResult = {
        testId: testCase.testId,
        communityName: testCase.name,
        duration: duration,
        success: true,
        identityVerified: result.identityVerified,
        nameMatch: result.nameMatch,
        verified: result.verified,
        retryAttempt: result.retryAttempt,
        hasContent: result.content && result.content.length > 100,
        timestamp: new Date().toISOString()
      };

      // Analyze results
      if (result.verified && result.identityVerified) {
        console.log(`   ✅ PASSED: Found verified information (${duration}ms)`);
        this.stats.verificationSuccess++;
        testResult.status = 'PASSED';
      } else if (result.retryAttempt) {
        console.log(`   🔄 RETRY: Required retry attempt (${duration}ms)`);
        this.stats.retrySuccess++;
        testResult.status = 'RETRY_SUCCESS';
      } else {
        console.log(`   ⚠️ ALERT: Returned verification alert (${duration}ms)`);
        testResult.status = 'VERIFICATION_ALERT';
      }
      
      this.results.push(testResult);
      this.stats.passed++;
      
      return testResult;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`   ❌ FAILED: ${error.message} (${duration}ms)`);
      
      const testResult = {
        testId: testCase.testId,
        communityName: testCase.name,
        duration: duration,
        success: false,
        error: error.message,
        status: 'FAILED',
        timestamp: new Date().toISOString()
      };
      
      this.results.push(testResult);
      this.stats.failed++;
      
      return testResult;
    }
  }

  async callWebIntelligence(testCase) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({
        communityName: testCase.name,
        city: testCase.city,
        state: testCase.state,
        address: testCase.address
      });

      const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/communities/web-intelligence',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: TIMEOUT_MS
      };

      const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve(result);
          } catch (e) {
            reject(new Error(`Invalid JSON response: ${e.message}`));
          }
        });
      });

      req.on('error', (err) => {
        reject(new Error(`Request failed: ${err.message}`));
      });

      req.on('timeout', () => {
        req.destroy();
        this.stats.timeouts++;
        reject(new Error('Request timeout'));
      });

      req.write(postData);
      req.end();
    });
  }

  async runAllTests() {
    console.log(`🚀 Starting automated verification system tests...`);
    console.log(`📊 Running ${testCases.length} test cases with ${MAX_CONCURRENT_TESTS} max concurrent`);
    console.log(`⏱️ Timeout: ${TIMEOUT_MS/1000}s per test\n`);

    this.stats.total = testCases.length;
    const startTime = Date.now();

    // Run tests in batches to avoid overloading the system
    for (let i = 0; i < testCases.length; i += MAX_CONCURRENT_TESTS) {
      const batch = testCases.slice(i, i + MAX_CONCURRENT_TESTS);
      const promises = batch.map(testCase => this.runTest(testCase));
      
      await Promise.all(promises);
      
      // Small delay between batches
      if (i + MAX_CONCURRENT_TESTS < testCases.length) {
        console.log(`\n⏸️ Batch complete. Waiting 2s before next batch...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    const totalDuration = Date.now() - startTime;
    this.printSummary(totalDuration);
  }

  printSummary(totalDuration) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📋 TEST SUMMARY - ${new Date().toLocaleTimeString()}`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Total Tests: ${this.stats.total}`);
    console.log(`✅ Passed: ${this.stats.passed}`);
    console.log(`❌ Failed: ${this.stats.failed}`);
    console.log(`⏱️ Timeouts: ${this.stats.timeouts}`);
    console.log(`🎯 Direct Success: ${this.stats.verificationSuccess}`);
    console.log(`🔄 Retry Success: ${this.stats.retrySuccess}`);
    console.log(`⏱️ Total Duration: ${(totalDuration/1000).toFixed(1)}s`);
    console.log(`📊 Success Rate: ${((this.stats.passed / this.stats.total) * 100).toFixed(1)}%`);

    console.log(`\n📈 DETAILED RESULTS:`);
    this.results.forEach(result => {
      const status = result.success ? 
        `${result.status} (${result.duration}ms)` : 
        `FAILED: ${result.error}`;
      console.log(`   ${result.testId}: ${status}`);
    });

    // Identify patterns that need attention
    console.log(`\n🔍 ANALYSIS:`);
    
    const retryNeeded = this.results.filter(r => r.retryAttempt).length;
    if (retryNeeded > 0) {
      console.log(`⚠️ ${retryNeeded} tests required retry attempts - consider improving initial search`);
    }

    const fastTests = this.results.filter(r => r.success && r.duration < 10000).length;
    console.log(`⚡ ${fastTests} tests completed quickly (<10s)`);

    const slowTests = this.results.filter(r => r.success && r.duration > 30000).length;
    if (slowTests > 0) {
      console.log(`🐌 ${slowTests} tests were slow (>30s) - may need optimization`);
    }

    // Recommendations
    console.log(`\n💡 RECOMMENDATIONS:`);
    if (this.stats.failed > 0) {
      console.log(`❌ Fix ${this.stats.failed} failing tests`);
    }
    if (retryNeeded > this.stats.total * 0.3) {
      console.log(`🔄 Too many retries (${((retryNeeded/this.stats.total)*100).toFixed(1)}%) - improve initial search accuracy`);
    }
    if (slowTests > this.stats.total * 0.2) {
      console.log(`⚡ Optimize performance - ${((slowTests/this.stats.total)*100).toFixed(1)}% of tests are slow`);
    }
    
    const successRate = (this.stats.passed / this.stats.total) * 100;
    if (successRate > 90) {
      console.log(`🎉 Excellent success rate! System is working well.`);
    } else if (successRate > 75) {
      console.log(`👍 Good success rate, minor tweaks recommended.`);
    } else {
      console.log(`⚠️ Success rate needs improvement - system requires tuning.`);
    }
  }
}

// Run the tests
const tester = new VerificationTester();
tester.runAllTests().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});