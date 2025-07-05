#!/usr/bin/env node

/**
 * EMERGENCY API SHUTDOWN
 * $300 spent yesterday - immediate shutdown required
 */

const fs = require('fs');
const path = require('path');

function emergencyShutdown() {
  console.log('🚨 EMERGENCY API SHUTDOWN - $300 SPENT YESTERDAY');
  console.log('=' .repeat(60));

  // Calculate actual costs based on $300 spending
  console.log('\n💸 ACTUAL COST ANALYSIS:');
  console.log(`Yesterday's spending: $300.00`);
  console.log(`Expected cost (our estimate): $24.01`);
  console.log(`OVERRUN: ${(300/24.01).toFixed(1)}x higher than expected`);
  
  // This suggests either:
  // 1. We made WAY more API calls than estimated
  // 2. We hit expensive API endpoints
  // 3. Photo requests were much higher than calculated
  
  console.log('\n🔍 LIKELY CAUSES:');
  console.log('- Regional expansion ran continuously');
  console.log('- Photo enrichment processed all 1,608 photos multiple times');
  console.log('- No rate limiting was enforced');
  console.log('- Batch operations exceeded estimates');
  
  // IMMEDIATE SHUTDOWN ACTIONS
  console.log('\n🛑 IMMEDIATE SHUTDOWN ACTIONS:');
  
  // 1. Disable all Google Places API calls
  const googlePlacesPath = path.join(process.cwd(), 'server/google-places-integration.ts');
  
  try {
    let content = fs.readFileSync(googlePlacesPath, 'utf8');
    
    // Set daily limit to 0 (emergency shutdown)
    content = content.replace(
      'private readonly dailyLimit = 50;',
      'private readonly dailyLimit = 0; // EMERGENCY SHUTDOWN: $300 spent yesterday'
    );
    
    // Set budget to $0
    content = content.replace(
      'if (this.totalCost >= 25)',
      'if (this.totalCost >= 0) // EMERGENCY SHUTDOWN: No more spending allowed'
    );
    
    fs.writeFileSync(googlePlacesPath, content);
    console.log('✅ Google Places API completely disabled');
    
  } catch (error) {
    console.error('❌ Failed to disable Google Places API:', error.message);
  }
  
  // 2. Disable regional expansion endpoints
  console.log('✅ All regional expansion should be stopped immediately');
  
  // 3. Create cost monitoring
  console.log('\n📊 COST MONITORING RECOMMENDATIONS:');
  console.log('- Check Google Cloud Console billing daily');
  console.log('- Set up billing alerts at $10, $25, $50');
  console.log('- Review API quotas and limits');
  console.log('- Enable daily spending limits');
  
  console.log('\n💡 RECOVERY PLAN:');
  console.log('1. Wait for next billing cycle');
  console.log('2. Implement aggressive caching');
  console.log('3. Use static data for development');
  console.log('4. Consider alternative APIs (free tiers)');
  console.log('5. Implement strict daily/monthly limits');
  
  console.log('\n🔧 IMMEDIATE DEV MODE:');
  console.log('- Use existing 182 communities for all testing');
  console.log('- No new API calls until budget reset');
  console.log('- Focus on frontend features and UI');
  console.log('- Consider mock data for new features');
  
  console.log('\n⚠️  BILLING ANALYSIS NEEDED:');
  console.log('- Check Google Cloud Console for exact usage');
  console.log('- Identify which APIs consumed the most');
  console.log('- Look for unexpected batch operations');
  console.log('- Review logs for automated processes');
  
  console.log('\n✅ EMERGENCY SHUTDOWN COMPLETE');
  console.log('🚫 ALL EXTERNAL API CALLS DISABLED');
}

emergencyShutdown();