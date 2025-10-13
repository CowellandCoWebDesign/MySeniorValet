// Test targeted discovery for Shasta County only
const axios = require('axios');

async function discoverShastaCounty() {
  console.log('🔍 Running targeted Shasta County discovery...');
  
  try {
    const response = await axios.post('http://localhost:5000/api/admin/county-research', {
      county: 'Shasta',
      state: 'CA',
      cities: ['Redding', 'Anderson', 'Cottonwood', 'Palo Cedro', 'Shasta Lake', 'Bella Vista', 'Mountain Gate'],
      searchTerms: [
        'senior living',
        'assisted living', 
        'retirement community',
        'memory care',
        'senior apartments',
        'senior housing',
        'nursing home',
        'elder care',
        'senior care',
        'skilled nursing',
        'assisted care',
        'independent living'
      ]
    });
    
    console.log('✅ Discovery response:', response.data);
    
    // Check database after discovery
    const checkResponse = await axios.get('http://localhost:5000/api/communities/search?location=Redding,CA&distance=25');
    console.log(`📊 Communities found after discovery: ${checkResponse.data.length}`);
    
    return response.data;
    
  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else {
      console.error('❌ Request Error:', error.message);
    }
  }
}

discoverShastaCounty();