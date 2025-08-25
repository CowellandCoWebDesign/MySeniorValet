#!/usr/bin/env node

import http from 'http';

// Test just the Hilltop Estates issue with detailed logging
async function testHilltopEstates() {
  console.log('🔍 Testing Hilltop Estates timeout issue...');
  
  const testData = {
    communityName: "Hilltop Estates - A Provincial Senior Living Community",
    city: "Redding", 
    state: "CA",
    address: "451 Hilltop Dr"
  };

  const startTime = Date.now();
  
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(testData);
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/communities/web-intelligence',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 30000 // Shorter timeout to identify issue faster
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
        console.log(`📦 Received ${chunk.length} bytes...`);
      });
      
      res.on('end', () => {
        const duration = Date.now() - startTime;
        console.log(`✅ Response received in ${duration}ms`);
        
        try {
          const result = JSON.parse(data);
          console.log('📊 Results:', {
            identityVerified: result.identityVerified,
            verified: result.verified,
            retryAttempt: result.retryAttempt,
            contentLength: result.content?.length || 0
          });
          resolve(result);
        } catch (e) {
          reject(new Error(`Invalid JSON: ${e.message}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(new Error(`Request failed: ${err.message}`));
    });

    req.on('timeout', () => {
      const duration = Date.now() - startTime;
      console.log(`⏱️ Timeout after ${duration}ms`);
      req.destroy();
      reject(new Error('Request timeout'));
    });

    console.log('🚀 Sending request...');
    req.write(postData);
    req.end();
  });
}

// Test performance with simpler communities
async function testPerformance() {
  console.log('\n🚀 Testing performance with simpler cases...');
  
  const simpleCases = [
    { name: "Sunrise Senior Living", city: "Fairfax", state: "VA" },
    { name: "Brookdale", city: "Dallas", state: "TX" },
    { name: "Atria", city: "Boston", state: "MA" }
  ];

  for (const testCase of simpleCases) {
    console.log(`\n🧪 Testing: ${testCase.name} in ${testCase.city}, ${testCase.state}`);
    const startTime = Date.now();
    
    try {
      const result = await makeRequest(testCase, 20000); // 20s timeout
      const duration = Date.now() - startTime;
      
      console.log(`   ✅ ${result.verified ? 'VERIFIED' : 'ALERT'} in ${duration}ms`);
      console.log(`   📊 Identity: ${result.identityVerified}, Retry: ${result.retryAttempt || 'none'}`);
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`   ❌ FAILED in ${duration}ms: ${error.message}`);
    }
  }
}

async function makeRequest(testData, timeout) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(testData);
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/communities/web-intelligence',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: timeout
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Invalid JSON: ${e.message}`));
        }
      });
    });

    req.on('error', (err) => reject(new Error(`Request failed: ${err.message}`)));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(postData);
    req.end();
  });
}

// Run focused tests
async function runFocusedTests() {
  try {
    await testHilltopEstates();
  } catch (error) {
    console.log(`❌ Hilltop Estates test failed: ${error.message}`);
  }
  
  await testPerformance();
  
  console.log(`\n💡 OPTIMIZATION RECOMMENDATIONS:`);
  console.log(`1. If Hilltop Estates times out, check retry logic efficiency`);
  console.log(`2. If other tests are slow, optimize initial search queries`);
  console.log(`3. Consider caching frequently requested communities`);
  console.log(`4. Review API timeout settings for user experience`);
}

runFocusedTests().catch(console.error);