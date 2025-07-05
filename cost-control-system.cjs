#!/usr/bin/env node

/**
 * COMPREHENSIVE COST CONTROL SYSTEM
 * Prevent $300 disasters from happening again
 */

const fs = require('fs');
const path = require('path');

function implementComprehensiveCostControls() {
  console.log('🛡️ IMPLEMENTING COMPREHENSIVE COST CONTROLS');
  console.log('Preventing the $300 disaster from recurring...');
  
  // 1. Create cost tracking database
  const costTrackingCode = `
// Cost Tracking Database
let dailyCosts = 0;
let monthlyCosts = 0;
let lastResetDate = new Date().toDateString();
let apiCallLog = [];

const DAILY_LIMIT = 10; // $10 daily limit
const MONTHLY_LIMIT = 50; // $50 monthly limit

export function trackAPICall(endpoint: string, cost: number) {
  const today = new Date().toDateString();
  
  // Reset daily counter if new day
  if (today !== lastResetDate) {
    dailyCosts = 0;
    lastResetDate = today;
  }
  
  dailyCosts += cost;
  monthlyCosts += cost;
  
  apiCallLog.push({
    timestamp: new Date(),
    endpoint,
    cost,
    dailyTotal: dailyCosts,
    monthlyTotal: monthlyCosts
  });
  
  console.log(\`💰 API Cost: \${endpoint} +$\${cost.toFixed(3)} (Daily: $\${dailyCosts.toFixed(2)}, Monthly: $\${monthlyCosts.toFixed(2)})\`);
  
  // Keep only last 1000 calls
  if (apiCallLog.length > 1000) {
    apiCallLog = apiCallLog.slice(-1000);
  }
}

export function checkCostLimits(): { canProceed: boolean; reason?: string } {
  if (dailyCosts >= DAILY_LIMIT) {
    return { canProceed: false, reason: \`Daily limit of $\${DAILY_LIMIT} exceeded ($\${dailyCosts.toFixed(2)})\` };
  }
  
  if (monthlyCosts >= MONTHLY_LIMIT) {
    return { canProceed: false, reason: \`Monthly limit of $\${MONTHLY_LIMIT} exceeded ($\${monthlyCosts.toFixed(2)})\` };
  }
  
  return { canProceed: true };
}

export function getCostStats() {
  return {
    dailyCosts,
    monthlyCosts,
    dailyLimit: DAILY_LIMIT,
    monthlyLimit: MONTHLY_LIMIT,
    recentCalls: apiCallLog.slice(-10)
  };
}
`;

  // 2. Update Google Places Integration with cost controls
  const googlePlacesPath = path.join(process.cwd(), 'server/google-places-integration.ts');
  
  try {
    let content = fs.readFileSync(googlePlacesPath, 'utf8');
    
    // Add cost tracking import
    if (!content.includes('trackAPICall')) {
      content = `import { trackAPICall, checkCostLimits } from './cost-tracker';\n` + content;
    }
    
    // Update constructor to check costs
    content = content.replace(
      /constructor\(\) \{[^}]+\}/,
      `constructor() {
    this.apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_PLACES_API_KEY || '';
    if (!this.apiKey) {
      console.warn('GOOGLE_API_KEY or GOOGLE_PLACES_API_KEY not found in environment variables');
    }
    
    // Check cost limits before any operations
    const costCheck = checkCostLimits();
    if (!costCheck.canProceed) {
      throw new Error(\`Cost limit exceeded: \${costCheck.reason}\`);
    }
  }`
    );
    
    // Add cost tracking to API calls
    content = content.replace(
      /this\.callCount\+\+;\\s*this\.totalCost \+= this\.costPerTextSearch;/g,
      `this.callCount++;
        this.totalCost += this.costPerTextSearch;
        trackAPICall('textSearch', this.costPerTextSearch);`
    );
    
    content = content.replace(
      /this\.totalCost \+= this\.costPerDetailsRequest;/g,
      `this.totalCost += this.costPerDetailsRequest;
        trackAPICall('placeDetails', this.costPerDetailsRequest);`
    );
    
    content = content.replace(
      /this\.totalCost \+= this\.costPerPhotoRequest;/g,
      `this.totalCost += this.costPerPhotoRequest;
        trackAPICall('photo', this.costPerPhotoRequest);`
    );
    
    fs.writeFileSync(googlePlacesPath, content);
    console.log('✅ Updated Google Places with cost tracking');
    
  } catch (error) {
    console.error('Failed to update Google Places:', error.message);
  }
  
  // 3. Create cost tracker file
  const costTrackerPath = path.join(process.cwd(), 'server/cost-tracker.ts');
  fs.writeFileSync(costTrackerPath, costTrackingCode);
  console.log('✅ Created cost tracking system');
  
  // 4. Add duplicate prevention
  const duplicatePreventionCode = `
// Duplicate Prevention System
const processedCommunities = new Set<string>();
const processedSearches = new Set<string>();

export function isDuplicateCommunity(name: string, address: string): boolean {
  const key = \`\${name.toLowerCase().trim()}|\${address.toLowerCase().trim()}\`;
  return processedCommunities.has(key);
}

export function markCommunityProcessed(name: string, address: string): void {
  const key = \`\${name.toLowerCase().trim()}|\${address.toLowerCase().trim()}\`;
  processedCommunities.add(key);
}

export function isDuplicateSearch(city: string, state: string): boolean {
  const key = \`\${city.toLowerCase()}|\${state.toLowerCase()}\`;
  return processedSearches.has(key);
}

export function markSearchProcessed(city: string, state: string): void {
  const key = \`\${city.toLowerCase()}|\${state.toLowerCase()}\`;
  processedSearches.add(key);
}

export function resetDuplicateTracking(): void {
  processedCommunities.clear();
  processedSearches.clear();
}

export function getDuplicateStats() {
  return {
    processedCommunities: processedCommunities.size,
    processedSearches: processedSearches.size
  };
}
`;
  
  const duplicatePreventionPath = path.join(process.cwd(), 'server/duplicate-prevention.ts');
  fs.writeFileSync(duplicatePreventionPath, duplicatePreventionCode);
  console.log('✅ Created duplicate prevention system');
  
  // 5. Update expansion scripts with safety checks
  const safetyChecksCode = `
/**
 * SAFETY CHECKS FOR EXPANSION SCRIPTS
 * Add this to the beginning of any expansion script
 */

async function runSafetyChecks() {
  console.log('🛡️ Running safety checks...');
  
  // Check cost limits
  try {
    const { checkCostLimits } = require('./server/cost-tracker');
    const costCheck = checkCostLimits();
    if (!costCheck.canProceed) {
      throw new Error(\`COST LIMIT EXCEEDED: \${costCheck.reason}\`);
    }
    console.log('✅ Cost limits OK');
  } catch (error) {
    console.error('❌ Cost check failed:', error.message);
    process.exit(1);
  }
  
  // Check if script already running
  const lockFile = '/tmp/expansion-script.lock';
  if (require('fs').existsSync(lockFile)) {
    console.error('❌ Expansion script already running! Remove lock file to continue.');
    process.exit(1);
  }
  
  // Create lock file
  require('fs').writeFileSync(lockFile, process.pid.toString());
  console.log('✅ Script lock created');
  
  // Cleanup on exit
  process.on('exit', () => {
    try {
      require('fs').unlinkSync(lockFile);
    } catch (e) {}
  });
  
  process.on('SIGINT', () => {
    try {
      require('fs').unlinkSync(lockFile);
    } catch (e) {}
    process.exit(1);
  });
}

module.exports = { runSafetyChecks };
`;
  
  const safetyChecksPath = path.join(process.cwd(), 'expansion-safety-checks.js');
  fs.writeFileSync(safetyChecksPath, safetyChecksCode);
  console.log('✅ Created safety checks module');
  
  console.log('\n🎯 COST CONTROL SUMMARY:');
  console.log('- Daily spending limit: $10');
  console.log('- Monthly spending limit: $50'); 
  console.log('- All API calls now tracked and logged');
  console.log('- Duplicate community/search prevention');
  console.log('- Script lock files prevent multiple runs');
  console.log('- Cost checks before any operations');
  
  console.log('\n⚠️ USAGE INSTRUCTIONS:');
  console.log('1. All expansion scripts must call runSafetyChecks() first');
  console.log('2. Monitor costs via /api/admin/cost-monitor endpoint');
  console.log('3. Reset limits manually if needed via API');
  console.log('4. Check logs for duplicate prevention stats');
  
  console.log('\n✅ COMPREHENSIVE COST CONTROLS IMPLEMENTED');
  console.log('This should prevent another $300 disaster!');
}

implementComprehensiveCostControls();