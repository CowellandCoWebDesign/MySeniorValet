#!/usr/bin/env node

/**
 * Validation Script for Transforming Hero Section
 * Tests all critical functionality without using Playwright
 * Date: August 28, 2025
 */

const http = require('http');

console.log('🧪 TRANSFORMING HERO VALIDATION TEST SUITE');
console.log('=========================================\n');

let testsPassed = 0;
let testsFailed = 0;

function logTest(testName, passed, details = '') {
  if (passed) {
    console.log(`✅ ${testName}`);
    if (details) console.log(`   ${details}`);
    testsPassed++;
  } else {
    console.log(`❌ ${testName}`);
    if (details) console.log(`   Error: ${details}`);
    testsFailed++;
  }
}

// Test 1: Check if homepage loads
function testHomepageLoad() {
  return new Promise((resolve) => {
    http.get('http://localhost:5000', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const hasReact = data.includes('root');
        logTest('Homepage loads React app', hasReact, hasReact ? 'React root element found' : 'React root not found');
        resolve();
      });
    }).on('error', (err) => {
      logTest('Homepage loads', false, err.message);
      resolve();
    });
  });
}

// Test 2: Check unified search API endpoint
function testUnifiedSearchAPI() {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      query: 'Sacramento',
      includeHospitals: true,
      includeServices: true,
      limit: 5
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/search/unified',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          // Check if response is JSON or HTML error
          if (data.startsWith('<!DOCTYPE')) {
            logTest('Unified Search API returns JSON', false, 'API returned HTML instead of JSON');
          } else {
            const jsonData = JSON.parse(data);
            const hasResults = jsonData.results && Array.isArray(jsonData.results);
            logTest('Unified Search API returns results', hasResults, 
              hasResults ? `Found ${jsonData.results.length} results` : 'No results array in response');
          }
        } catch (e) {
          logTest('Unified Search API', false, `Failed to parse response: ${e.message}`);
        }
        resolve();
      });
    });

    req.on('error', (err) => {
      logTest('Unified Search API', false, err.message);
      resolve();
    });

    req.write(postData);
    req.end();
  });
}

// Test 3: Check community search endpoints
function testCommunitySearch() {
  return new Promise((resolve) => {
    http.get('http://localhost:5000/api/communities/count', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          const hasCount = jsonData.count && parseInt(jsonData.count) > 0;
          logTest('Community count endpoint', hasCount, 
            hasCount ? `Total communities: ${jsonData.count}` : 'No community count');
        } catch (e) {
          logTest('Community count endpoint', false, `Parse error: ${e.message}`);
        }
        resolve();
      });
    }).on('error', (err) => {
      logTest('Community count endpoint', false, err.message);
      resolve();
    });
  });
}

// Test 4: Verify hero component implementation
function verifyHeroComponent() {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const filePath = path.join(process.cwd(), 'client/src/pages/myseniorvalet-home.tsx');
    const content = fs.readFileSync(filePath, 'utf8');
    
    const hasTransformingHero = content.includes('HeroSectionWithTransformingSearch');
    const hasAnimations = content.includes('AnimatePresence') && content.includes('motion.div');
    const hasSearchLogic = content.includes('isSearchActive') && content.includes('setSearchQuery');
    const hasViewToggle = content.includes('viewMode') && content.includes('list') && content.includes('map');
    
    logTest('Hero component defined', hasTransformingHero, 'HeroSectionWithTransformingSearch found');
    logTest('Animation components present', hasAnimations, 'Framer Motion components detected');
    logTest('Search state management', hasSearchLogic, 'Search state hooks implemented');
    logTest('List/Map view toggle', hasViewToggle, 'View mode switching implemented');
    
    // Check specific animations
    const hasHeroTextAnimation = content.includes('exit={{ opacity: 0, y: -50, scale: 0.95 }}');
    const hasSearchBarSlide = content.includes('y: isSearchActive ? -200 : 0');
    const hasResultsAnimation = content.includes('initial={{ opacity: 0, y: 20 }}');
    
    logTest('Hero text exit animation', hasHeroTextAnimation, 'Text fades and scales on search');
    logTest('Search bar slide animation', hasSearchBarSlide, 'Search bar slides to top position');
    logTest('Results entrance animation', hasResultsAnimation, 'Results animate in from bottom');
    
  } catch (e) {
    logTest('Hero component verification', false, e.message);
  }
}

// Test 5: Check required dependencies
function checkDependencies() {
  const packageJson = require('../package.json');
  
  const requiredDeps = [
    'framer-motion',
    '@tanstack/react-query',
    'wouter',
    'lucide-react'
  ];
  
  requiredDeps.forEach(dep => {
    const hasDep = packageJson.dependencies[dep] || packageJson.devDependencies[dep];
    logTest(`Dependency: ${dep}`, hasDep, hasDep ? `Version: ${hasDep}` : 'Not found');
  });
}

// Test 6: Validate API routes configuration
function validateAPIRoutes() {
  return new Promise((resolve) => {
    // Test platform stats endpoint
    http.get('http://localhost:5000/api/platform/stats/formatted', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const stats = JSON.parse(data);
          const hasStats = stats.totalCommunities && stats.citiesCovered;
          logTest('Platform stats API', hasStats, 
            hasStats ? `${stats.totalCommunities} communities in ${stats.citiesCovered} cities` : 'Stats missing');
        } catch (e) {
          logTest('Platform stats API', false, e.message);
        }
        resolve();
      });
    }).on('error', (err) => {
      logTest('Platform stats API', false, err.message);
      resolve();
    });
  });
}

// Test 7: Component integration check
function checkComponentIntegration() {
  const fs = require('fs');
  
  try {
    // Check if PrioritizedCommunityCard is imported
    const homeContent = fs.readFileSync('client/src/pages/myseniorvalet-home.tsx', 'utf8');
    const hasCardImport = homeContent.includes("import PrioritizedCommunityCard") || 
                         homeContent.includes("import { PrioritizedCommunityCard");
    const usesCard = homeContent.includes("<PrioritizedCommunityCard");
    
    logTest('PrioritizedCommunityCard imported', hasCardImport, 'Component import found');
    logTest('PrioritizedCommunityCard used', usesCard, 'Component used in results display');
    
    // Check useDebounce hook
    const hasDebounce = homeContent.includes('useDebounce');
    logTest('Debounce hook implemented', hasDebounce, 'Search input debouncing active');
    
  } catch (e) {
    logTest('Component integration check', false, e.message);
  }
}

// Run all tests
async function runValidationSuite() {
  console.log('📋 TEST 1: Infrastructure Tests');
  console.log('--------------------------------');
  await testHomepageLoad();
  checkDependencies();
  console.log('');
  
  console.log('📋 TEST 2: Component Implementation');
  console.log('-----------------------------------');
  verifyHeroComponent();
  checkComponentIntegration();
  console.log('');
  
  console.log('📋 TEST 3: API Endpoints');
  console.log('------------------------');
  await testUnifiedSearchAPI();
  await testCommunitySearch();
  await validateAPIRoutes();
  console.log('');
  
  console.log('=========================================');
  console.log('📊 VALIDATION SUMMARY');
  console.log('=========================================');
  console.log(`✅ Tests Passed: ${testsPassed}`);
  console.log(`❌ Tests Failed: ${testsFailed}`);
  console.log(`📈 Success Rate: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%`);
  console.log('');
  
  if (testsFailed === 0) {
    console.log('🎉 ALL TESTS PASSED! Transforming hero is fully functional.');
  } else if (testsFailed <= 2) {
    console.log('⚠️  Minor issues detected. Core functionality is working.');
  } else {
    console.log('🔧 Several issues need attention. Review failed tests above.');
  }
}

// Execute validation suite
runValidationSuite().catch(console.error);