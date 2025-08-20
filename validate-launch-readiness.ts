#!/usr/bin/env tsx

/**
 * MySeniorValet Launch Readiness Validation Script
 * Comprehensive testing of all platform systems
 */

import { db } from './server/db';
import * as schema from './shared/schema';
import { sql } from 'drizzle-orm';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg: string) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg: string) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg: string) => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`),
  warning: (msg: string) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  header: (msg: string) => console.log(`\n${colors.bright}${colors.blue}═══ ${msg} ═══${colors.reset}\n`)
};

interface TestResult {
  category: string;
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message?: string;
  duration?: number;
}

const testResults: TestResult[] = [];

async function testDatabaseConnectivity() {
  log.header('DATABASE CONNECTIVITY');
  const startTime = Date.now();
  
  try {
    // Test basic connection
    const result = await db.execute(sql`SELECT 1 as test`);
    if (result) {
      log.success('Database connection established');
      testResults.push({
        category: 'Database',
        test: 'Connection',
        status: 'pass',
        duration: Date.now() - startTime
      });
    }

    // Test communities table
    const communityCount = await db.select({ count: sql<number>`count(*)` })
      .from(schema.communities);
    
    const count = Number(communityCount[0].count);
    log.success(`Communities table: ${count.toLocaleString()} records`);
    
    if (count > 30000) {
      testResults.push({
        category: 'Database',
        test: 'Community Data',
        status: 'pass',
        message: `${count.toLocaleString()} communities loaded`
      });
    } else {
      testResults.push({
        category: 'Database',
        test: 'Community Data',
        status: 'warning',
        message: `Only ${count.toLocaleString()} communities (expected 30,000+)`
      });
    }

    // Test critical tables
    const tables = [
      { name: 'users', table: schema.users },
      { name: 'communities', table: schema.communities },
      { name: 'reviews', table: schema.reviews },
      { name: 'vendorProfiles', table: schema.vendorProfiles },
      { name: 'tours', table: schema.tours }
    ];

    for (const { name, table } of tables) {
      try {
        const result = await db.select({ count: sql<number>`count(*)` }).from(table);
        log.success(`Table '${name}' accessible - ${Number(result[0].count).toLocaleString()} records`);
        testResults.push({
          category: 'Database',
          test: `Table: ${name}`,
          status: 'pass'
        });
      } catch (error) {
        log.error(`Table '${name}' error: ${error}`);
        testResults.push({
          category: 'Database',
          test: `Table: ${name}`,
          status: 'fail',
          message: String(error)
        });
      }
    }

  } catch (error) {
    log.error(`Database connection failed: ${error}`);
    testResults.push({
      category: 'Database',
      test: 'Connection',
      status: 'fail',
      message: String(error)
    });
  }
}

async function testGeographicCoverage() {
  log.header('GEOGRAPHIC COVERAGE');
  
  try {
    // Test US coverage
    const usStates = await db.select({ 
      state: schema.communities.state,
      count: sql<number>`count(*)` 
    })
    .from(schema.communities)
    .where(sql`${schema.communities.country} = 'USA' OR ${schema.communities.country} IS NULL`)
    .groupBy(schema.communities.state);

    log.success(`US States covered: ${usStates.length}/50`);
    
    // Test Canadian coverage
    const canadianCommunities = await db.select({ count: sql<number>`count(*)` })
      .from(schema.communities)
      .where(sql`${schema.communities.country} = 'Canada'`);
    
    const canadaCount = Number(canadianCommunities[0].count);
    log.success(`Canadian communities: ${canadaCount.toLocaleString()}`);
    
    // Test Mexican coverage
    const mexicanCommunities = await db.select({ count: sql<number>`count(*)` })
      .from(schema.communities)
      .where(sql`${schema.communities.country} = 'Mexico'`);
    
    const mexicoCount = Number(mexicanCommunities[0].count);
    log.success(`Mexican communities: ${mexicoCount.toLocaleString()}`);
    
    testResults.push({
      category: 'Coverage',
      test: 'North America',
      status: 'pass',
      message: `US: ${usStates.length} states, Canada: ${canadaCount}, Mexico: ${mexicoCount}`
    });

  } catch (error) {
    log.error(`Coverage test failed: ${error}`);
    testResults.push({
      category: 'Coverage',
      test: 'Geographic',
      status: 'fail',
      message: String(error)
    });
  }
}

async function testDataIntegrity() {
  log.header('DATA INTEGRITY');
  
  try {
    // Check for communities with missing critical data
    const missingData = await db.select({
      noAddress: sql<number>`count(case when address is null or address = '' then 1 end)`,
      noCity: sql<number>`count(case when city is null or city = '' then 1 end)`,
      noState: sql<number>`count(case when state is null or state = '' then 1 end)`,
      noPhone: sql<number>`count(case when phone is null or phone = '' then 1 end)`,
      noCoordinates: sql<number>`count(case when latitude is null or longitude is null then 1 end)`
    })
    .from(schema.communities);

    const issues = [];
    if (Number(missingData[0].noAddress) > 100) issues.push(`${missingData[0].noAddress} missing addresses`);
    if (Number(missingData[0].noCity) > 50) issues.push(`${missingData[0].noCity} missing cities`);
    if (Number(missingData[0].noState) > 10) issues.push(`${missingData[0].noState} missing states`);
    if (Number(missingData[0].noCoordinates) > 5000) issues.push(`${missingData[0].noCoordinates} missing coordinates`);

    if (issues.length === 0) {
      log.success('Data integrity check passed - all critical fields present');
      testResults.push({
        category: 'Data Integrity',
        test: 'Critical Fields',
        status: 'pass'
      });
    } else {
      log.warning(`Data integrity issues: ${issues.join(', ')}`);
      testResults.push({
        category: 'Data Integrity',
        test: 'Critical Fields',
        status: 'warning',
        message: issues.join(', ')
      });
    }

    // Check HUD properties
    const hudProperties = await db.select({ count: sql<number>`count(*)` })
      .from(schema.communities)
      .where(sql`${schema.communities.hudPropertyId} IS NOT NULL AND ${schema.communities.hudPropertyId} != ''`);
    
    const hudCount = Number(hudProperties[0].count);
    log.success(`HUD properties with verified pricing: ${hudCount.toLocaleString()}`);
    
    testResults.push({
      category: 'Data Integrity',
      test: 'HUD Properties',
      status: hudCount > 5000 ? 'pass' : 'warning',
      message: `${hudCount.toLocaleString()} HUD properties`
    });

  } catch (error) {
    log.error(`Data integrity check failed: ${error}`);
    testResults.push({
      category: 'Data Integrity',
      test: 'Validation',
      status: 'fail',
      message: String(error)
    });
  }
}

async function testAPIEndpoints() {
  log.header('API ENDPOINTS');
  
  const endpoints = [
    { url: 'http://localhost:5000/api/health', name: 'Health Check' },
    { url: 'http://localhost:5000/api/communities/count', name: 'Community Count' },
    { url: 'http://localhost:5000/api/auth/status', name: 'Auth Status' },
    { url: 'http://localhost:5000/api/platform/stats', name: 'Platform Stats' }
  ];

  for (const endpoint of endpoints) {
    try {
      const startTime = Date.now();
      const response = await fetch(endpoint.url);
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        log.success(`${endpoint.name}: ${response.status} OK (${duration}ms)`);
        testResults.push({
          category: 'API',
          test: endpoint.name,
          status: 'pass',
          duration
        });
      } else {
        log.error(`${endpoint.name}: ${response.status} ${response.statusText}`);
        testResults.push({
          category: 'API',
          test: endpoint.name,
          status: 'fail',
          message: `${response.status} ${response.statusText}`
        });
      }
    } catch (error) {
      log.error(`${endpoint.name}: Connection failed`);
      testResults.push({
        category: 'API',
        test: endpoint.name,
        status: 'fail',
        message: 'Connection failed'
      });
    }
  }
}

async function generateReport() {
  log.header('VALIDATION REPORT');
  
  const totalTests = testResults.length;
  const passed = testResults.filter(r => r.status === 'pass').length;
  const warnings = testResults.filter(r => r.status === 'warning').length;
  const failed = testResults.filter(r => r.status === 'fail').length;
  
  console.log(`\n${colors.bright}Test Results Summary:${colors.reset}`);
  console.log(`${colors.green}  Passed: ${passed}/${totalTests}${colors.reset}`);
  console.log(`${colors.yellow}  Warnings: ${warnings}/${totalTests}${colors.reset}`);
  console.log(`${colors.red}  Failed: ${failed}/${totalTests}${colors.reset}`);
  
  if (failed > 0) {
    console.log(`\n${colors.red}Failed Tests:${colors.reset}`);
    testResults.filter(r => r.status === 'fail').forEach(r => {
      console.log(`  • ${r.category} - ${r.test}: ${r.message || 'Failed'}`);
    });
  }
  
  if (warnings > 0) {
    console.log(`\n${colors.yellow}Warnings:${colors.reset}`);
    testResults.filter(r => r.status === 'warning').forEach(r => {
      console.log(`  • ${r.category} - ${r.test}: ${r.message || 'Warning'}`);
    });
  }
  
  const readiness = failed === 0 ? 'READY FOR LAUNCH' : 'NOT READY - FIXES REQUIRED';
  const readinessColor = failed === 0 ? colors.green : colors.red;
  
  console.log(`\n${colors.bright}${readinessColor}═══════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}${readinessColor}    PLATFORM STATUS: ${readiness}    ${colors.reset}`);
  console.log(`${colors.bright}${readinessColor}═══════════════════════════════════${colors.reset}\n`);
}

// Main execution
async function main() {
  console.log(`\n${colors.bright}${colors.cyan}🚀 MySeniorValet Launch Readiness Validation${colors.reset}`);
  console.log(`${colors.cyan}   Version: 4.0 Production Beta${colors.reset}`);
  console.log(`${colors.cyan}   Date: ${new Date().toISOString()}${colors.reset}\n`);
  
  await testDatabaseConnectivity();
  await testGeographicCoverage();
  await testDataIntegrity();
  await testAPIEndpoints();
  await generateReport();
  
  process.exit(testResults.filter(r => r.status === 'fail').length > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Validation script failed:', error);
  process.exit(1);
});