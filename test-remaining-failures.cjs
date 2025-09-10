const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testEndpoint(name, method, url, data = null) {
  try {
    console.log(`\n=== Testing ${name} ===`);
    console.log(`${method} ${url}`);
    
    const config = { 
      method, 
      url,
      validateStatus: () => true // Don't throw on any status
    };
    
    if (data) {
      config.data = data;
      console.log('Body:', JSON.stringify(data));
    }
    
    const response = await axios(config);
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2).substring(0, 500));
    return response;
  } catch (error) {
    console.log('ERROR:', error.message);
    return null;
  }
}

async function main() {
  // Wait for server to stabilize
  await new Promise(r => setTimeout(r, 2000));
  
  // Test Basic Search
  await testEndpoint('Basic Search', 'GET', `${BASE_URL}/search?location=California&careType=All%20Types&limit=5`);
  
  // Test Map Bounds Search
  await testEndpoint('Map Bounds Search', 'GET', `${BASE_URL}/communities/search-fixed?north=34.0522&south=33.9522&east=-118.1437&west=-118.3437&limit=10`);
  
  // Test Map Clustering
  await testEndpoint('Map Clustering', 'GET', `${BASE_URL}/communities/clusters-fixed?north=34.0522&south=33.9522&east=-118.1437&west=-118.3437&zoom=10`);
  
  // Test RAG Recommendations (with proper body)
  await testEndpoint('RAG Recommendations', 'POST', `${BASE_URL}/weaviate-enhanced/rag`, {
    text: 'Looking for memory care near beaches in California',
    limit: 5
  });
  
  // Test User Registration
  const timestamp = Date.now();
  await testEndpoint('User Registration', 'POST', `${BASE_URL}/auth/quick-signup`, {
    email: `test_${timestamp}@example.com`,
    password: 'testpass123'
  });
  
  // Test User Login
  await testEndpoint('User Login', 'POST', `${BASE_URL}/auth/quick-login`, {
    email: 'demo@example.com',
    password: 'demo123'
  });
  
  // Test Similar Communities
  await testEndpoint('Similar Communities', 'GET', `${BASE_URL}/communities/264/similar`);
}

main();