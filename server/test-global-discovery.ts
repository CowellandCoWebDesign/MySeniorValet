#!/usr/bin/env node

/**
 * Automated Testing Suite for Global Discovery Engine
 * Tests international search capabilities with real-world queries
 */

import fetch from 'node-fetch';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

interface TestResult {
  country: string;
  query: string;
  passed: boolean;
  details: {
    totalResults: number;
    discoveredResults: number;
    databaseResults: number;
    hasAuthenticSources: boolean;
    sampleFacilities: string[];
    errors?: string[];
  };
  aiComparison?: {
    perplexity: boolean;
    claude: boolean;
    chatgpt: boolean;
  };
}

class GlobalDiscoveryTester {
  private baseUrl = 'http://localhost:5000';
  private testResults: TestResult[] = [];
  
  async runAllTests(): Promise<void> {
    console.log(`${colors.bright}${colors.cyan}🚀 GLOBAL DISCOVERY ENGINE - AUTOMATED TESTING SUITE${colors.reset}`);
    console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
    
    // Test different countries
    const testCases = [
      { country: 'Australia', queries: ['Sydney Australia', 'Melbourne senior living', 'Brisbane aged care'] },
      { country: 'Scotland', queries: ['Edinburgh senior homes', 'Glasgow care homes', 'Scotland retirement'] },
      { country: 'China', queries: ['Beijing senior care', 'Shanghai nursing homes', 'China elder care'] },
      { country: 'Russia', queries: ['Moscow senior living', 'St Petersburg aged care', 'Russia retirement'] },
      { country: 'Japan', queries: ['Tokyo senior facilities', 'Osaka elder care', 'Japan nursing homes'] },
      { country: 'Germany', queries: ['Berlin senior living', 'Munich aged care', 'Germany retirement'] },
      { country: 'France', queries: ['Paris senior homes', 'Lyon retirement', 'France elder care'] },
      { country: 'Brazil', queries: ['São Paulo senior care', 'Rio de Janeiro aged care', 'Brazil retirement'] },
    ];
    
    for (const testCase of testCases) {
      await this.testCountry(testCase.country, testCase.queries);
    }
    
    // Test AI provider comparison
    await this.testAIComparison();
    
    // Generate final report
    this.generateReport();
  }
  
  async testCountry(country: string, queries: string[]): Promise<void> {
    console.log(`${colors.bright}${colors.blue}🌍 Testing ${country}...${colors.reset}`);
    
    for (const query of queries) {
      const result = await this.testQuery(country, query);
      this.testResults.push(result);
      
      // Display immediate feedback
      if (result.passed) {
        console.log(`  ${colors.green}✅ ${query}: PASSED${colors.reset}`);
        console.log(`     Found ${result.details.discoveredResults} authentic facilities`);
        if (result.details.sampleFacilities.length > 0) {
          console.log(`     Examples: ${result.details.sampleFacilities.slice(0, 2).join(', ')}`);
        }
      } else {
        console.log(`  ${colors.red}❌ ${query}: FAILED${colors.reset}`);
        if (result.details.errors) {
          console.log(`     Errors: ${result.details.errors.join(', ')}`);
        }
      }
    }
    console.log('');
  }
  
  async testQuery(country: string, query: string): Promise<TestResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/global-discovery/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, searchType: 'location' }),
      });
      
      const data = await response.json();
      
      // Analyze results
      const results = data.results || [];
      const discoveredResults = results.filter((r: any) => 
        r.data_source === 'AI Discovery' || r.isDiscovered
      );
      const databaseResults = results.filter((r: any) => 
        r.data_source !== 'AI Discovery' && !r.isDiscovered
      );
      
      // Check for US contamination
      const usResults = results.filter((r: any) => 
        r.country === 'US' || r.state?.length === 2 // US state codes
      );
      
      // Determine if test passed
      const passed = 
        data.success === true &&
        discoveredResults.length > 0 &&
        usResults.length === 0; // No US results for international queries
      
      return {
        country,
        query,
        passed,
        details: {
          totalResults: results.length,
          discoveredResults: discoveredResults.length,
          databaseResults: databaseResults.length,
          hasAuthenticSources: data.citations?.length > 0,
          sampleFacilities: results.slice(0, 3).map((r: any) => r.name),
          errors: !passed ? [`Found ${usResults.length} US results`] : undefined,
        },
      };
    } catch (error) {
      return {
        country,
        query,
        passed: false,
        details: {
          totalResults: 0,
          discoveredResults: 0,
          databaseResults: 0,
          hasAuthenticSources: false,
          sampleFacilities: [],
          errors: [`API Error: ${error.message}`],
        },
      };
    }
  }
  
  async testAIComparison(): Promise<void> {
    console.log(`${colors.bright}${colors.magenta}🤖 Testing AI Provider Comparison...${colors.reset}`);
    
    try {
      const response = await fetch(`${this.baseUrl}/api/global-discovery/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'senior living facilities in London, UK' }),
      });
      
      const data = await response.json();
      
      const perplexityWorks = data.providers?.perplexity && !data.providers.perplexity.error;
      const claudeWorks = data.providers?.claude && !data.providers.claude.error;
      const chatgptWorks = data.providers?.chatgpt && !data.providers.chatgpt.error;
      
      console.log(`  ${perplexityWorks ? colors.green + '✅' : colors.red + '❌'} Perplexity${colors.reset}`);
      console.log(`  ${claudeWorks ? colors.green + '✅' : colors.red + '❌'} Claude${colors.reset}`);
      console.log(`  ${chatgptWorks ? colors.green + '✅' : colors.red + '❌'} ChatGPT${colors.reset}`);
      
      if (perplexityWorks && data.providers.perplexity.sources) {
        console.log(`  ${colors.cyan}📚 Sources: ${data.providers.perplexity.sources.length} citations${colors.reset}`);
      }
    } catch (error) {
      console.log(`  ${colors.red}❌ AI Comparison test failed: ${error.message}${colors.reset}`);
    }
    console.log('');
  }
  
  generateReport(): void {
    console.log(`${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}📊 FINAL TEST REPORT${colors.reset}`);
    console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
    
    // Group results by country
    const countrySummary = new Map<string, { passed: number; failed: number }>();
    
    for (const result of this.testResults) {
      if (!countrySummary.has(result.country)) {
        countrySummary.set(result.country, { passed: 0, failed: 0 });
      }
      const summary = countrySummary.get(result.country)!;
      if (result.passed) {
        summary.passed++;
      } else {
        summary.failed++;
      }
    }
    
    // Display country-by-country summary
    console.log(`${colors.bright}Country Results:${colors.reset}`);
    let totalPassed = 0;
    let totalFailed = 0;
    
    for (const [country, summary] of countrySummary) {
      const status = summary.failed === 0 ? colors.green + '✅' : colors.yellow + '⚠️';
      console.log(`  ${status} ${country}: ${summary.passed}/${summary.passed + summary.failed} tests passed${colors.reset}`);
      totalPassed += summary.passed;
      totalFailed += summary.failed;
    }
    
    // Calculate statistics
    const totalTests = this.testResults.length;
    const successRate = ((totalPassed / totalTests) * 100).toFixed(1);
    const totalDiscovered = this.testResults.reduce((sum, r) => sum + r.details.discoveredResults, 0);
    const avgDiscoveredPerQuery = (totalDiscovered / totalTests).toFixed(1);
    
    console.log(`\n${colors.bright}Test Statistics:${colors.reset}`);
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  Passed: ${colors.green}${totalPassed}${colors.reset}`);
    console.log(`  Failed: ${colors.red}${totalFailed}${colors.reset}`);
    console.log(`  Success Rate: ${successRate}%`);
    console.log(`  Total Facilities Discovered: ${totalDiscovered}`);
    console.log(`  Avg Facilities per Query: ${avgDiscoveredPerQuery}`);
    
    // Final verdict
    console.log(`\n${colors.bright}Final Verdict:${colors.reset}`);
    if (totalFailed === 0) {
      console.log(`  ${colors.green}${colors.bright}🎉 ALL TESTS PASSED! Global Discovery Engine is working perfectly!${colors.reset}`);
    } else if (successRate >= 80) {
      console.log(`  ${colors.yellow}${colors.bright}✅ MOSTLY PASSING - ${successRate}% success rate${colors.reset}`);
    } else {
      console.log(`  ${colors.red}${colors.bright}⚠️ NEEDS ATTENTION - Only ${successRate}% tests passing${colors.reset}`);
    }
    
    console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}✨ Testing Complete - ${new Date().toLocaleString()}${colors.reset}`);
    console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
  }
}

// Run the tests
async function main() {
  const tester = new GlobalDiscoveryTester();
  await tester.runAllTests();
}

main().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});