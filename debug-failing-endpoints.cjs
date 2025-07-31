const axios = require('axios');

async function testEndpoint(name, url) {
  try {
    console.log(`\n=== Testing ${name} ===`);
    console.log(`URL: ${url}`);
    const response = await axios.get(url);
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2).substring(0, 500));
    return response.data;
  } catch (error) {
    console.log('ERROR:', error.response?.status || error.message);
    console.log('Error data:', error.response?.data);
    return null;
  }
}

async function main() {
  const BASE_URL = 'http://localhost:5000/api';
  
  // Test the endpoints that are failing
  const searchResult = await testEndpoint('Basic Search', `${BASE_URL}/communities/search?query=senior&location=California&limit=5`);
  console.log('Has communities property?', searchResult && searchResult.communities ? 'YES' : 'NO');
  
  const marketResult = await testEndpoint('Market Overview', `${BASE_URL}/market/overview`);
  console.log('Has marketTrends property?', marketResult && marketResult.marketTrends ? 'YES' : 'NO');
  
  await testEndpoint('Service Providers', `${BASE_URL}/services/providers`);
  
  await testEndpoint('Similar Communities', `${BASE_URL}/communities/264/similar`);
}

main();