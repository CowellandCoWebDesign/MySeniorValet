#!/usr/bin/env node

/**
 * Comprehensive Security Notification Test Script
 * This script simulates various security threats to test the email notification system.
 * Email notifications should be sent to admin@myseniorvalet.com for HIGH and CRITICAL threats.
 */

const http = require('http');

console.log('🔒 MySeniorValet Security Notification Test Suite');
console.log('====================================================');
console.log('📧 Email notifications will be sent to: admin@myseniorvalet.com');
console.log('⚠️  Testing HIGH and CRITICAL severity threats that trigger emails');
console.log('====================================================\n');

// Test configuration
const tests = [
  {
    name: 'SQL Injection Attack',
    severity: 'HIGH',
    method: 'POST',
    path: '/api/search',
    body: JSON.stringify({
      query: "SELECT * FROM users WHERE id='1' OR '1'='1'; DROP TABLE users;--"
    }),
    expectEmail: true
  },
  {
    name: 'XSS Attack',
    severity: 'HIGH',
    method: 'POST',
    path: '/api/communities/review',
    body: JSON.stringify({
      content: '<script>alert("XSS"); document.cookie</script><img src=x onerror=alert(1)>',
      rating: 5
    }),
    expectEmail: true
  },
  {
    name: 'Command Injection',
    severity: 'CRITICAL',
    method: 'POST',
    path: '/api/export',
    body: JSON.stringify({
      filename: 'report.pdf; rm -rf /; cat /etc/passwd'
    }),
    expectEmail: true
  },
  {
    name: 'Path Traversal',
    severity: 'HIGH',
    method: 'GET',
    path: '/api/files/../../../../etc/passwd',
    expectEmail: true
  },
  {
    name: 'Brute Force Login Attempts',
    severity: 'CRITICAL',
    method: 'POST',
    path: '/api/auth/login',
    body: JSON.stringify({
      email: 'attacker@hack.com',
      password: 'wrongpassword123'
    }),
    repeat: 10, // Simulate 10 failed attempts
    expectEmail: true
  },
  {
    name: 'Suspicious Bot User Agent',
    severity: 'MEDIUM',
    method: 'GET',
    path: '/api/communities',
    headers: {
      'User-Agent': 'SQLMap/1.6 (http://sqlmap.org) - Automated SQL injection tool'
    },
    expectEmail: false // Medium severity doesn't trigger email
  }
];

let emailCount = 0;

// Function to send a test request
function sendTestRequest(test, callback) {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: test.path,
    method: test.method,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': test.headers?.['User-Agent'] || 'Security Test Agent/1.0',
      ...test.headers
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      callback(null, res.statusCode, data);
    });
  });

  req.on('error', (error) => {
    callback(error);
  });

  if (test.body) {
    req.write(test.body);
  }
  req.end();
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting security threat simulations...\n');

  for (const test of tests) {
    const iterations = test.repeat || 1;
    
    console.log(`\n📍 Test: ${test.name}`);
    console.log(`   Severity: ${test.severity}`);
    console.log(`   Email Expected: ${test.expectEmail ? '✅ YES' : '❌ NO'}`);
    
    for (let i = 0; i < iterations; i++) {
      await new Promise((resolve) => {
        sendTestRequest(test, (error, statusCode, data) => {
          if (error) {
            console.log(`   ❌ Request ${i + 1}/${iterations} failed: ${error.message}`);
          } else {
            console.log(`   ✅ Request ${i + 1}/${iterations} sent (Status: ${statusCode})`);
          }
          
          if (test.expectEmail) {
            emailCount++;
          }
          
          setTimeout(resolve, 100); // Small delay between requests
        });
      });
    }
  }

  console.log('\n====================================================');
  console.log('📊 TEST SUMMARY');
  console.log('====================================================');
  console.log(`✅ All security threat simulations completed`);
  console.log(`📧 Expected email notifications: ${emailCount}`);
  console.log(`📬 Emails should be sent to: admin@myseniorvalet.com`);
  console.log('\n⚠️  IMPORTANT: Check admin@myseniorvalet.com inbox for:');
  console.log('   • HIGH severity threat alerts (yellow/orange)');
  console.log('   • CRITICAL severity threat alerts (red)');
  console.log('   • Each email contains threat details and required actions');
  console.log('\n✨ Security notification system test complete!');
}

// Check if server is running
http.get('http://localhost:5000/api/health', (res) => {
  if (res.statusCode === 200) {
    console.log('✅ Server is running, starting tests...\n');
    runTests();
  } else {
    console.error('❌ Server returned status:', res.statusCode);
    process.exit(1);
  }
}).on('error', (err) => {
  console.error('❌ Server is not running on localhost:5000');
  console.error('   Please start the server first with: npm run dev');
  process.exit(1);
});