#!/usr/bin/env node

import fetch from 'node-fetch';
import fs from 'fs';

const BASE_URL = 'http://localhost:5173';

// Extract all routes from App.tsx
const routes = [
  '/',
  '/canada',
  '/search',
  '/map',
  '/map-search',
  '/ai-search',
  '/semantic-search',
  '/ai-intelligence',
  '/community/1',
  '/communities/1', 
  '/red-tag-example/test-community',
  '/hospital/test-hospital',
  '/claim/1',
  '/community-claim',
  '/admin',
  '/admin-creative',
  '/admin-unified',
  '/admin-portal',
  '/super-admin',
  '/super-admin-analytics',
  '/admin/service-listings',
  '/admin/services-management',
  '/admin/amazon-products',
  '/admin/perplexity-test',
  '/admin/multi-ai-test',
  '/admin/communities',
  '/admin/reports',
  '/admin/marketing-hub',
  '/admin/availability-heatmap',
  '/ai-search-comparison',
  '/ai-search-intelligence',
  '/expansion-monitor',
  '/api-costs',
  '/dashboard',
  '/personalized-dashboard',
  '/tour-tracker',
  '/tours',
  '/messaging',
  '/messages',
  '/notification-preferences',
  '/support',
  '/veterans',
  '/affordable-housing',
  '/family-collaboration',
  '/family-connect',
  '/login',
  '/signup',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/terms-of-service',
  '/privacy-policy',
  '/cookie-policy',
  '/legal-document-history',
  '/disclaimer',
  '/accessibility',
  '/mission',
  '/team',
  '/testimonials',
  '/help',
  '/care-guide',
  '/community-portal',
  '/my-communities',
  '/community-dashboard/1',
  '/tenant-portal',
  '/ai-support',
  '/all-in-one-planner',
  '/costs',
  '/real-data-pricing',
  '/services',
  '/senior-services',
  '/senior-resources',
  '/vendor-marketplace',
  '/vendor-marketplace-tiers',
  '/florals',
  '/moving',
  '/transportation',
  '/move-in-essentials',
  '/amazon-supplies',
  '/vendor/1',
  '/community-payment-program',
  '/community-subscription-checkout',
  '/resident-onboarding',
  '/quiz',
  '/test-debug',
  '/test-map-views',
  '/auth-debug',
  '/weaviate-test',
  '/data-quality',
  '/database-test',
  '/integrations',
  '/integration-dashboard',
  '/subscriptions',
  '/ai-demo',
  '/ai-map-showcase',
  '/vendor-signup',
  '/vendor/signup',
  '/vendor-welcome',
  '/vendor/dashboard',
  '/vendor-mobile-payment/test',
  '/community-mobile-payment/standard',
  '/test-tier-access',
  '/financial-dashboard',
  '/enhanced-financial-dashboard',
  '/payment-monitoring',
  '/payment/success',
  '/payment/cancel',
  '/payment-test-dashboard',
  '/payment-diagnostics',
  '/admin-dashboard',
  '/payment-recovery',
  '/community-onboarding/1',
  '/vendor-onboarding/1',
  '/vendor-onboarding-wizard/1',
  '/vendor-tier-test',
  '/community-creator',
  '/community-creator-portal',
  '/availability-heatmap',
  '/payment-demo'
];

async function testRoute(path) {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'GET',
      redirect: 'manual',
      headers: {
        'User-Agent': 'Route-Tester/1.0'
      }
    });
    
    // Check if the response is HTML (page exists) or redirect
    const contentType = response.headers.get('content-type');
    const isHTML = contentType && contentType.includes('text/html');
    
    if (response.status === 200 && isHTML) {
      return { path, status: response.status, result: '✅ OK' };
    } else if (response.status === 302 || response.status === 301) {
      const location = response.headers.get('location');
      return { path, status: response.status, result: `⚠️ Redirect to ${location}` };
    } else if (response.status === 404) {
      return { path, status: response.status, result: '❌ NOT FOUND' };
    } else {
      return { path, status: response.status, result: `⚠️ Status ${response.status}` };
    }
  } catch (error) {
    return { path, status: 'ERROR', result: `❌ Error: ${error.message}` };
  }
}

async function testAllRoutes() {
  console.log('\n🔍 Testing all application routes...\n');
  console.log('Base URL:', BASE_URL);
  console.log('Total routes to test:', routes.length);
  console.log('-'.repeat(80));
  
  const results = [];
  const broken = [];
  const working = [];
  const redirects = [];
  
  for (const route of routes) {
    const result = await testRoute(route);
    results.push(result);
    
    if (result.result.includes('✅')) {
      working.push(route);
    } else if (result.result.includes('❌')) {
      broken.push(route);
    } else if (result.result.includes('⚠️')) {
      redirects.push(route);
    }
    
    console.log(`${result.result.padEnd(20)} ${route.padEnd(45)} [${result.status}]`);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 SUMMARY REPORT\n');
  console.log(`✅ Working routes: ${working.length}/${routes.length}`);
  console.log(`❌ Broken routes: ${broken.length}/${routes.length}`);
  console.log(`⚠️ Redirects/Other: ${redirects.length}/${routes.length}`);
  
  if (broken.length > 0) {
    console.log('\n❌ BROKEN ROUTES (Need Fixing):');
    broken.forEach(route => console.log(`   - ${route}`));
  }
  
  if (redirects.length > 0) {
    console.log('\n⚠️ ROUTES WITH REDIRECTS OR WARNINGS:');
    redirects.forEach(route => {
      const result = results.find(r => r.path === route);
      console.log(`   - ${route} ${result.result}`);
    });
  }
  
  // Save results to file
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    totalRoutes: routes.length,
    working: working.length,
    broken: broken.length,
    redirects: redirects.length,
    details: results,
    brokenRoutes: broken,
    workingRoutes: working,
    redirectRoutes: redirects
  };
  
  fs.writeFileSync('route-test-results.json', JSON.stringify(report, null, 2));
  console.log('\n📝 Full report saved to route-test-results.json');
}

// Run the tests
testAllRoutes().catch(console.error);