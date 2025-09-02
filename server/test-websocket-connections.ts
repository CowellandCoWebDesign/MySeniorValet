#!/usr/bin/env tsx

import WebSocket from 'ws';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Test configuration
const testConfigs = [
  {
    name: 'Dashboard WebSocket',
    url: 'ws://localhost:5000/ws/dashboard/1',
    testMessage: { type: 'ping' },
    expectedResponse: 'pong'
  },
  {
    name: 'Family Collaboration WebSocket',
    url: 'ws://localhost:5000/ws/family/1',
    testMessage: { type: 'join', familyId: 1 },
    expectedResponse: 'joined'
  },
  {
    name: 'Enterprise WebSocket',
    url: 'ws://localhost:5000/ws/enterprise',
    testMessage: { type: 'subscribe', channels: ['analytics', 'alerts'] },
    expectedResponse: 'subscribed'
  }
];

async function testWebSocketConnection(config: typeof testConfigs[0]): Promise<boolean> {
  return new Promise((resolve) => {
    console.log(`\n${colors.cyan}Testing ${config.name}...${colors.reset}`);
    console.log(`URL: ${config.url}`);
    
    const ws = new WebSocket(config.url);
    let testPassed = false;
    
    // Set timeout
    const timeout = setTimeout(() => {
      console.log(`${colors.red}❌ Timeout - No response received${colors.reset}`);
      ws.close();
      resolve(false);
    }, 5000);
    
    ws.on('open', () => {
      console.log(`${colors.green}✅ Connection established${colors.reset}`);
      
      // Send test message
      if (config.testMessage) {
        console.log(`Sending test message:`, config.testMessage);
        ws.send(JSON.stringify(config.testMessage));
      }
    });
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log(`${colors.blue}Received:${colors.reset}`, message);
        
        // Check for expected response
        if (message.type === config.expectedResponse || 
            message.type === 'connected' || 
            message.type === 'pong') {
          console.log(`${colors.green}✅ Expected response received${colors.reset}`);
          testPassed = true;
        }
        
        clearTimeout(timeout);
        ws.close();
      } catch (error) {
        console.log(`${colors.red}Error parsing message:${colors.reset}`, error);
      }
    });
    
    ws.on('error', (error) => {
      console.log(`${colors.red}❌ Connection error:${colors.reset}`, error.message);
      clearTimeout(timeout);
      resolve(false);
    });
    
    ws.on('close', () => {
      console.log(`${colors.yellow}Connection closed${colors.reset}`);
      clearTimeout(timeout);
      resolve(testPassed);
    });
  });
}

async function runAllTests() {
  console.log(`${colors.cyan}========================================`);
  console.log(`     WebSocket Connection Tests`);
  console.log(`========================================${colors.reset}`);
  
  const results: { name: string; passed: boolean }[] = [];
  
  for (const config of testConfigs) {
    const passed = await testWebSocketConnection(config);
    results.push({ name: config.name, passed });
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log(`\n${colors.cyan}========================================`);
  console.log(`              Test Summary`);
  console.log(`========================================${colors.reset}`);
  
  let allPassed = true;
  results.forEach(result => {
    const status = result.passed ? 
      `${colors.green}✅ PASSED${colors.reset}` : 
      `${colors.red}❌ FAILED${colors.reset}`;
    console.log(`${result.name}: ${status}`);
    if (!result.passed) allPassed = false;
  });
  
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  if (allPassed) {
    console.log(`${colors.green}🎉 All WebSocket connections are working!${colors.reset}`);
  } else {
    console.log(`${colors.red}⚠️ Some WebSocket connections failed. Check the server logs.${colors.reset}`);
  }
  
  process.exit(allPassed ? 0 : 1);
}

// Run tests
runAllTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});