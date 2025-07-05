#!/usr/bin/env node

/**
 * ACCELERATED NORTHERN CALIFORNIA EXPANSION
 * Systematically discovers communities across all remaining counties
 */

const { spawn } = require('child_process');
const fs = require('fs');

// Target counties for rapid expansion
const targetCounties = [
  'Shasta County',
  'Butte County', 
  'Sutter County',
  'Yuba County',
  'Placer County',
  'El Dorado County',
  'Nevada County',
  'Yolo County',
  'Solano County',
  'Lake County',
  'Mendocino County',
  'Del Norte County',
  'Siskiyou County',
  'Lassen County'
];

async function runExpansion() {
  console.log('🚀 ACCELERATED NORTHERN CALIFORNIA EXPANSION');
  console.log(`📊 Targeting ${targetCounties.length} counties for systematic discovery\n`);

  const results = {
    totalCounties: targetCounties.length,
    completed: 0,
    totalDiscovered: 0,
    totalAdded: 0,
    startTime: new Date(),
    counties: {}
  };

  for (const county of targetCounties) {
    console.log(`\n🎯 Processing ${county} (${results.completed + 1}/${targetCounties.length})`);
    
    try {
      const countyResult = await processCounty(county);
      results.counties[county] = countyResult;
      results.totalDiscovered += countyResult.discovered || 0;
      results.totalAdded += countyResult.added || 0;
      results.completed++;
      
      console.log(`✅ ${county}: ${countyResult.discovered || 0} discovered, ${countyResult.added || 0} added`);
      
      // Brief pause between counties
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ Failed to process ${county}:`, error.message);
      results.counties[county] = { error: error.message };
    }
  }

  // Final summary
  const endTime = new Date();
  const duration = Math.round((endTime - results.startTime) / 1000 / 60);
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 EXPANSION COMPLETE!');
  console.log('='.repeat(60));
  console.log(`📊 Counties Processed: ${results.completed}/${results.totalCounties}`);
  console.log(`🔍 Total Discovered: ${results.totalDiscovered}`);
  console.log(`✅ Total Added: ${results.totalAdded}`);
  console.log(`⏱️  Duration: ${duration} minutes`);
  console.log(`📈 Success Rate: ${Math.round((results.totalAdded / results.totalDiscovered) * 100)}%`);
  
  // Save results
  fs.writeFileSync('expansion-results.json', JSON.stringify(results, null, 2));
  console.log('\n📁 Results saved to expansion-results.json');
}

async function processCounty(county) {
  return new Promise((resolve, reject) => {
    const script = `
      const { regionalExpansionEngine } = require('./server/regional-expansion.ts');
      
      (async () => {
        try {
          const result = await regionalExpansionEngine.researchCountySystematically('${county}');
          console.log(JSON.stringify(result));
        } catch (error) {
          console.error('Error:', error.message);
          process.exit(1);
        }
      })();
    `;
    
    const child = spawn('node', ['-e', script], { stdio: 'pipe' });
    
    let output = '';
    let errorOutput = '';
    
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output.trim());
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse result: ${error.message}`));
        }
      } else {
        reject(new Error(`Process failed with code ${code}: ${errorOutput}`));
      }
    });
    
    // 10 minute timeout per county
    setTimeout(() => {
      child.kill();
      reject(new Error('County processing timed out'));
    }, 10 * 60 * 1000);
  });
}

// Run the expansion
runExpansion().catch(console.error);