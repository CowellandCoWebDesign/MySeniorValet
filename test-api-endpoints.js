import fetch from 'node-fetch';

const BASE_URL = 'https://7a9daf58-f7c7-49c7-b4de-a709c13987b5-00-3l1b8tvcpa4bp.janeway.replit.dev';

const apiEndpoints = [
  '/api/auth/quick-user',
  '/api/user/favorites',
  '/api/platform/stats/formatted',
  '/api/communities/count',
  '/api/communities/trending',
  '/api/communities/hud-count',
  '/api/marketplace/categories',
  '/api/marketplace/vendors',
  '/api/hospitals/featured',
  '/api/va-resources/facilities',
  '/api/care-services/analytics',
  '/api/market/overview',
  '/api/auth/user',
  '/api/auth/check',
  '/api/weaviate/search',
  '/api/search/communities',
  '/api/admin/stats',
  '/api/dev/version',
  '/api/geo/cluster',
  '/api/geo/nearby'
];

async function testEndpoint(endpoint) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'API-Tester/1.0'
      }
    });
    
    const contentType = response.headers.get('content-type');
    const isJSON = contentType && contentType.includes('application/json');
    
    if (response.status >= 200 && response.status < 300) {
      return { endpoint, status: response.status, result: '✅ OK' };
    } else if (response.status === 401) {
      return { endpoint, status: response.status, result: '🔐 Auth Required' };
    } else if (response.status === 404) {
      return { endpoint, status: response.status, result: '❌ NOT FOUND' };
    } else if (response.status === 500) {
      let errorMsg = '❌ SERVER ERROR';
      if (isJSON) {
        try {
          const body = await response.json();
          if (body.message) errorMsg += `: ${body.message}`;
        } catch {}
      }
      return { endpoint, status: response.status, result: errorMsg };
    } else {
      return { endpoint, status: response.status, result: `⚠️ Status ${response.status}` };
    }
  } catch (error) {
    return { endpoint, status: 'ERROR', result: `❌ Error: ${error.message}` };
  }
}

async function testAllEndpoints() {
  console.log('\n🔍 Testing all API endpoints...\n');
  console.log('-'.repeat(80));
  
  const results = [];
  const broken = [];
  const authRequired = [];
  const working = [];
  
  for (const endpoint of apiEndpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    if (result.result.includes('✅')) {
      working.push(endpoint);
    } else if (result.result.includes('❌')) {
      broken.push(endpoint);
    } else if (result.result.includes('🔐')) {
      authRequired.push(endpoint);
    }
    
    console.log(`${result.result.padEnd(35)} ${endpoint.padEnd(40)} [${result.status}]`);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 API ENDPOINT SUMMARY\n');
  console.log(`✅ Working endpoints: ${working.length}/${apiEndpoints.length}`);
  console.log(`❌ Broken endpoints: ${broken.length}/${apiEndpoints.length}`);
  console.log(`🔐 Auth required: ${authRequired.length}/${apiEndpoints.length}`);
  
  if (broken.length > 0) {
    console.log('\n❌ BROKEN ENDPOINTS (Need Fixing):');
    broken.forEach(endpoint => {
      const result = results.find(r => r.endpoint === endpoint);
      console.log(`   - ${endpoint} : ${result.result}`);
    });
  }
}

testAllEndpoints().catch(console.error);
