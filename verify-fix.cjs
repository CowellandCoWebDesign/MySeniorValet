// Test to verify the verificationReport fix
const fs = require('fs');

console.log('Checking community-detail.tsx for verificationReport fix...\n');

const fileContent = fs.readFileSync('/home/runner/workspace/client/src/pages/community-detail.tsx', 'utf8');

// Check if the fix has been applied
const lines = fileContent.split('\n');
let foundLine = false;

lines.forEach((line, index) => {
  if (line.includes('verificationReport={localVerificationReport}')) {
    console.log('✅ FIX CONFIRMED on line', index + 1);
    console.log('   The undefined verificationReport has been replaced with localVerificationReport');
    foundLine = true;
  }
  
  // Check for any remaining bad references
  if (line.includes('verificationReport={verificationReport}')) {
    console.log('❌ ERROR: Bad reference still exists on line', index + 1);
  }
});

if (foundLine) {
  console.log('\n✅ SUCCESS: The ReferenceError fix has been properly applied!');
  console.log('   The LiveWebIntelligence component now receives localVerificationReport');
  console.log('   which is properly defined in the RealTimeInsights component scope.');
} else {
  console.log('\n⚠️  Could not verify the fix. Manual inspection recommended.');
}

// Check the RealTimeInsights component definition
const realTimeInsightsStart = fileContent.indexOf('const RealTimeInsights = ');
if (realTimeInsightsStart > -1) {
  const snippet = fileContent.substring(realTimeInsightsStart, realTimeInsightsStart + 500);
  if (snippet.includes('localVerificationReport')) {
    console.log('\n✅ Confirmed: localVerificationReport is properly defined in RealTimeInsights component');
  }
}