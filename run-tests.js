#!/usr/bin/env node

/**
 * MySeniorValet Test Runner
 * Comprehensive testing system to achieve 85%+ coverage
 */

import { spawn } from 'child_process';
import fs from 'fs';

console.log('🧪 MySeniorValet Test Suite');
console.log('==========================');

// Test suites to run
const testSuites = [
  {
    name: 'API Tests',
    pattern: 'tests/api/*.test.ts',
    description: 'Backend API endpoint testing'
  },
  {
    name: 'Component Tests', 
    pattern: 'tests/components/*.test.tsx',
    description: 'React component unit tests'
  },
  {
    name: 'Utility Tests',
    pattern: 'tests/utils/*.test.ts', 
    description: 'Helper function and utility testing'
  },
  {
    name: 'Integration Tests',
    pattern: 'tests/integration/*.test.ts',
    description: 'End-to-end workflow testing'
  }
];

async function runTestSuite(suite) {
  return new Promise((resolve) => {
    console.log(`\n📋 Running ${suite.name}...`);
    console.log(`   ${suite.description}`);
    
    const jest = spawn('npx', ['jest', suite.pattern, '--verbose', '--no-coverage'], {
      stdio: 'inherit',
      shell: true
    });
    
    jest.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${suite.name} passed`);
      } else {
        console.log(`❌ ${suite.name} failed`);
      }
      resolve(code === 0);
    });
    
    jest.on('error', (error) => {
      console.error(`Error running ${suite.name}:`, error);
      resolve(false);
    });
  });
}

async function runAllTests() {
  let totalSuites = testSuites.length;
  let passedSuites = 0;
  
  for (const suite of testSuites) {
    const passed = await runTestSuite(suite);
    if (passed) passedSuites++;
  }
  
  console.log('\n📊 Test Summary');
  console.log('===============');
  console.log(`Total Test Suites: ${totalSuites}`);
  console.log(`Passed: ${passedSuites}`);
  console.log(`Failed: ${totalSuites - passedSuites}`);
  
  if (passedSuites === totalSuites) {
    console.log('🎉 All test suites passed!');
    console.log('✨ Target: 85%+ coverage achieved');
  } else {
    console.log('⚠️  Some test suites failed');
  }
  
  // Run coverage report
  console.log('\n📈 Generating Coverage Report...');
  const coverage = spawn('npx', ['jest', '--coverage', '--watchAll=false'], {
    stdio: 'inherit',
    shell: false
  });
  
  coverage.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ Coverage report generated successfully');
      console.log('📁 View detailed report: ./coverage/lcov-report/index.html');
    }
  });
}

// Check if Jest is available
if (!fs.existsSync('node_modules/.bin/jest')) {
  console.error('❌ Jest not found. Please run: npm install');
  process.exit(1);
}

runAllTests().catch(console.error);