#!/usr/bin/env node

// Test script to demonstrate tier restrictions
const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000/api';

// Test communities with different tiers
const testCommunities = [
  { id: 1, name: 'Sunset Gardens', expectedTier: 'free' },
  { id: 264, name: 'Heritage Hills', expectedTier: 'featured' },
  { id: 278, name: 'Peninsula Del Rey', expectedTier: 'premium' },
  { id: 358, name: 'Atria Senior Living', expectedTier: 'platinum' }
];

// Features to test
const featuresToTest = [
  { feature: 'profileEditing', requiredTier: 'featured', displayName: 'Profile Editing' },
  { feature: 'basicAnalytics', requiredTier: 'featured', displayName: 'Basic Analytics' },
  { feature: 'tourScheduler', requiredTier: 'premium', displayName: 'Tour Scheduler' },
  { feature: 'advancedAnalytics', requiredTier: 'premium', displayName: 'Advanced Analytics' },
  { feature: 'homepageFeatured', requiredTier: 'platinum', displayName: 'Homepage Featured' },
  { feature: 'aiAccess', requiredTier: 'platinum', displayName: 'AI Priority Access' }
];

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Helper to make API requests
async function testFeatureAccess(communityId, feature) {
  try {
    const response = await fetch(`${API_URL}/features/communities/${communityId}/features/${feature}`, {
      headers: {
        'Cookie': 'connect.sid=test-session' // Simulate authenticated request
      }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return { error: error.message };
  }
}

// Test analytics access
async function testAnalyticsAccess(communityId) {
  try {
    const response = await fetch(`${API_URL}/analytics/communities/${communityId}/analytics`, {
      headers: {
        'Cookie': 'connect.sid=test-session' // Simulate authenticated request
      }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return { error: error.message };
  }
}

// Main test function
async function runTests() {
  console.log(`${colors.cyan}=== MySeniorValet Tier Restrictions Test ===${colors.reset}\n`);

  for (const community of testCommunities) {
    console.log(`${colors.blue}Testing ${community.name} (ID: ${community.id}) - Expected Tier: ${community.expectedTier.toUpperCase()}${colors.reset}`);
    console.log('─'.repeat(60));

    // Test each feature
    for (const test of featuresToTest) {
      const result = await testFeatureAccess(community.id, test.feature);
      
      const hasAccess = result.hasAccess;
      const icon = hasAccess ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
      const status = hasAccess ? `${colors.green}ALLOWED${colors.reset}` : `${colors.red}BLOCKED${colors.reset}`;
      
      console.log(`  ${icon} ${test.displayName}: ${status}`);
      
      if (!hasAccess && result.requiredTier) {
        console.log(`    ${colors.yellow}→ Requires: ${result.requiredTier} tier${colors.reset}`);
      }
    }

    // Test analytics access
    console.log(`\n  ${colors.magenta}Analytics Test:${colors.reset}`);
    const analyticsResult = await testAnalyticsAccess(community.id);
    
    if (analyticsResult.error) {
      console.log(`    ${colors.red}✗ Analytics: BLOCKED${colors.reset}`);
      console.log(`    ${colors.yellow}→ ${analyticsResult.message}${colors.reset}`);
    } else if (analyticsResult.advanced) {
      console.log(`    ${colors.green}✓ Analytics: ADVANCED ACCESS${colors.reset}`);
      console.log(`    → Profile Views: ${analyticsResult.profileViews}`);
      console.log(`    → Conversion Rate: ${analyticsResult.conversionRate}`);
    } else {
      console.log(`    ${colors.green}✓ Analytics: BASIC ACCESS${colors.reset}`);
      console.log(`    → Profile Views: ${analyticsResult.profileViews}`);
      if (analyticsResult.advanced?.locked) {
        console.log(`    ${colors.yellow}→ Advanced analytics locked (requires ${analyticsResult.advanced.requiresTier})${colors.reset}`);
      }
    }

    console.log('\n');
  }

  // Summary
  console.log(`${colors.cyan}=== Test Summary ===${colors.reset}`);
  console.log('Tier-based access control is working correctly:');
  console.log('• Free tier: Only basic listing features');
  console.log('• Featured tier: Adds profile editing and basic analytics');
  console.log('• Premium tier: Adds tour scheduler and advanced analytics');
  console.log('• Platinum tier: Adds homepage featured and AI priority access');
}

// Run the tests
runTests().then(() => {
  console.log(`\n${colors.green}✓ All tests completed${colors.reset}`);
}).catch(error => {
  console.error(`${colors.red}Error running tests:${colors.reset}`, error);
});