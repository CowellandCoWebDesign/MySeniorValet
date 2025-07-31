#!/usr/bin/env node

const axios = require('axios');

async function testEndpoint(name, url) {
  try {
    console.log(`\nTesting ${name}:`);
    console.log(`URL: ${url}`);
    const response = await axios.get(url);
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('Error:', error.response?.status || error.message);
    console.log('Error data:', error.response?.data);
  }
}

async function main() {
  const BASE_URL = 'http://localhost:5000/api';
  
  // Test the failing endpoints
  await testEndpoint('Platform Stats', `${BASE_URL}/platform/stats`);
  await testEndpoint('Market Overview', `${BASE_URL}/market/overview`);
  await testEndpoint('Basic Search', `${BASE_URL}/communities/search?query=senior&location=California&limit=10`);
  await testEndpoint('AI Claude Health', `${BASE_URL}/ai/health/claude`);
  await testEndpoint('Analytics Funnel', `${BASE_URL}/analytics/funnel?timeRange=30d`);
  await testEndpoint('Services List', `${BASE_URL}/services`);
}

main();