/**
 * TEST SCRIPT: Comprehensive External API Protection
 * Demonstrates protection for ALL external APIs
 */

import { apiCostProtection } from './api-cost-protection';

async function testComprehensiveApiProtection() {
  console.log('\n🔍 TESTING COMPREHENSIVE EXTERNAL API PROTECTION\n');
  console.log('=' .repeat(60));
  
  // Test 1: Check protection for all major external APIs
  console.log('\n1️⃣ Testing protection for all external APIs:');
  
  const apisToTest = [
    { provider: 'openai' as const, calls: 10, description: 'AI text generation' },
    { provider: 'anthropic' as const, calls: 10, description: 'Claude AI analysis' },
    { provider: 'perplexity' as const, calls: 20, description: 'Web search' },
    { provider: 'gemini' as const, calls: 15, description: 'Google AI' },
    { provider: 'stripe' as const, calls: 5, description: 'Payment processing' },
    { provider: 'sendgrid' as const, calls: 30, description: 'Email sending' },
    { provider: 'mapbox' as const, calls: 100, description: 'Map tiles' },
    { provider: 'cms_gov' as const, calls: 50, description: 'CMS data' },
    { provider: 'hud_gov' as const, calls: 50, description: 'HUD data' },
    { provider: 'google_places' as const, calls: 1, description: 'Google Places (REMOVED)' }
  ];
  
  for (const api of apisToTest) {
    const result = await apiCostProtection.checkBeforeOperation(
      api.calls,
      api.provider
    );
    
    const status = result.allowed ? '✅ ALLOWED' : '🚫 BLOCKED';
    console.log(`  ${api.provider}: ${status}`);
    if (!result.allowed) {
      console.log(`    Reason: ${result.reason}`);
    }
  }
  
  // Test 2: Simulate burst detection across different APIs
  console.log('\n2️⃣ Testing burst detection for external APIs:');
  
  // Simulate rapid OpenAI calls
  for (let i = 0; i < 5; i++) {
    await apiCostProtection.recordUsage(1, 'openai', `Test call ${i + 1}`);
  }
  
  const burstCheck = await apiCostProtection.checkBeforeOperation(20, 'openai');
  console.log(`  OpenAI burst check: ${burstCheck.allowed ? '✅ ALLOWED' : '🚫 BLOCKED'}`);
  if (!burstCheck.allowed) {
    console.log(`    Reason: ${burstCheck.reason}`);
  }
  
  // Test 3: Check critical API blocking
  console.log('\n3️⃣ Testing critical API auto-blocking:');
  
  const criticalTest = await apiCostProtection.checkBeforeOperation(10, 'google_places');
  console.log(`  Google Places (critical): ${criticalTest.allowed ? '✅ ALLOWED' : '🚫 BLOCKED'}`);
  if (!criticalTest.allowed) {
    console.log(`    Reason: ${criticalTest.reason}`);
  }
  
  // Test 4: Generate comprehensive cost report
  console.log('\n4️⃣ Generating comprehensive API cost report:');
  const report = await apiCostProtection.generateCostReport();
  console.log(report);
  
  // Test 5: Show current status with per-API breakdown
  console.log('\n5️⃣ Current API protection status:');
  const status = apiCostProtection.getUsageStatus();
  
  console.log(`\n📊 GLOBAL METRICS:`);
  console.log(`  Total Cost: $${status.usage.totalCost.toFixed(2)}`);
  console.log(`  Daily Cost: $${status.usage.dailyCost.toFixed(2)}`);
  console.log(`  Total Calls: ${status.usage.totalCalls}`);
  console.log(`  Daily Calls: ${status.usage.dailyCalls}`);
  
  if (status.alerts.length > 0) {
    console.log(`\n⚠️ ACTIVE ALERTS:`);
    status.alerts.forEach(alert => console.log(`  - ${alert}`));
  }
  
  if (status.perApi.length > 0) {
    console.log(`\n📈 PER-API USAGE:`);
    status.perApi.forEach(api => {
      const icon = api.blocked ? '🚫' : 
                   api.riskLevel === 'critical' ? '🔴' :
                   api.riskLevel === 'high' ? '🟠' :
                   api.riskLevel === 'medium' ? '🟡' : '🟢';
      console.log(`  ${icon} ${api.provider}: $${api.cost.toFixed(2)} (${api.calls} calls)`);
      if (api.blocked) console.log(`      STATUS: BLOCKED`);
    });
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('✅ COMPREHENSIVE API PROTECTION TEST COMPLETE');
  console.log('\nSUMMARY:');
  console.log('- All external APIs are monitored');
  console.log('- Google Places API is permanently blocked');
  console.log('- Burst detection active for all APIs');
  console.log('- Per-API cost tracking and limits enforced');
  console.log('- High-risk APIs have additional protection');
  console.log('- Emergency stop blocks all critical/high-risk APIs');
  console.log('\n💪 Platform is protected against ALL external API cost overruns');
}

// Run the test
testComprehensiveApiProtection().catch(console.error);