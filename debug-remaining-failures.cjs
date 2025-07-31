const axios = require('axios');

const baseURL = 'http://localhost:5000/api';

async function makeRequest(method, endpoint, data = null) {
  try {
    const response = await axios({
      method,
      url: `${baseURL}${endpoint}`,
      data,
      timeout: 10000
    });
    console.log(`✅ ${method} ${endpoint}`);
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return { success: true, data: response.data };
  } catch (error) {
    console.log(`❌ ${method} ${endpoint}`);
    console.log('Error:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

async function testRemainingFailures() {
  console.log('=== Testing Basic Search (GET /communities/search) ===');
  await makeRequest('GET', '/communities/search?q=memory%20care&limit=10');
  
  console.log('\n=== Testing Map Bounds Search (GET /communities/search-fixed) ===');
  // Try different parameter formats
  console.log('Format 1: bounds as string');
  await makeRequest('GET', '/communities/search-fixed?bounds=-118.3437,33.9522,-118.1437,34.0522&limit=50');
  
  console.log('\nFormat 2: individual parameters');
  await makeRequest('GET', '/communities/search-fixed?north=34.0522&south=33.9522&east=-118.1437&west=-118.3437&limit=50');
  
  console.log('\n=== Testing Map Clustering (GET /communities/clusters-fixed) ===');
  await makeRequest('GET', '/communities/clusters-fixed?north=34.0522&south=33.9522&east=-118.1437&west=-118.3437&zoom=10');
  
  console.log('\n=== Testing RAG Recommendations (POST /weaviate-enhanced/rag) ===');
  await makeRequest('POST', '/weaviate-enhanced/rag', {
    query: 'Looking for memory care facility',
    limit: 5
  });
}

testRemainingFailures().catch(console.error);