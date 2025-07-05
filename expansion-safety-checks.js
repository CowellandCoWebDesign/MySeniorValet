
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
      throw new Error(`COST LIMIT EXCEEDED: ${costCheck.reason}`);
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
