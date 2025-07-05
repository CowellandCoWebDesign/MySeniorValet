#!/usr/bin/env node

/**
 * CONTINUE NORTHERN CALIFORNIA EXPANSION
 * Focus on high-priority remaining counties
 */

const { spawn } = require('child_process');

// High-priority counties to target next
const priorityCounties = [
  'Butte County',     // Chico area - large population
  'Placer County',    // Auburn, Roseville - growing area  
  'Shasta County',    // Redding area - significant population
  'El Dorado County', // South Lake Tahoe area
  'Nevada County',    // Grass Valley, Nevada City
  'Yolo County'       // Davis area - near UC Davis
];

async function runExpansion() {
  console.log('🚀 CONTINUING NORTHERN CALIFORNIA EXPANSION');
  console.log(`🎯 Targeting ${priorityCounties.length} high-priority counties\n`);

  let totalAdded = 0;
  let totalDiscovered = 0;

  for (const county of priorityCounties) {
    console.log(`\n📍 Processing ${county}...`);
    
    try {
      // Use the Google Places integration directly for faster processing
      const result = await processCountyFast(county);
      totalAdded += result.added || 0;
      totalDiscovered += result.discovered || 0;
      
      console.log(`✅ ${county}: ${result.discovered || 0} discovered, ${result.added || 0} added`);
      
      // Brief pause between counties to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 3000));
      
    } catch (error) {
      console.error(`❌ ${county} failed: ${error.message}`);
    }
  }

  console.log(`\n🎉 EXPANSION COMPLETE!`);
  console.log(`📊 Total: ${totalDiscovered} discovered, ${totalAdded} added`);
}

async function processCountyFast(county) {
  return new Promise((resolve, reject) => {
    // Use curl to hit our API endpoint directly
    const command = `curl -X POST http://localhost:5000/api/admin/expand-county -H "Content-Type: application/json" -d '{"county":"${county}"}'`;
    
    const child = spawn('bash', ['-c', command], { stdio: 'pipe' });
    
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
          // Fallback if JSON parsing fails
          resolve({ discovered: 0, added: 0, error: 'Parse error' });
        }
      } else {
        reject(new Error(`Request failed: ${errorOutput}`));
      }
    });
    
    // 5 minute timeout per county
    setTimeout(() => {
      child.kill();
      reject(new Error('County processing timed out'));
    }, 5 * 60 * 1000);
  });
}

// Run the expansion
runExpansion().catch(console.error);