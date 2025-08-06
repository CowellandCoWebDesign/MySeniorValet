const API_BASE = 'http://localhost:5000/api';

async function debugPanamaCity() {
  console.log('🔍 Debugging Panama City Beach Issue\n');
  
  // 1. Check what Smart Search finds
  const searchResponse = await fetch(`${API_BASE}/ai/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'Panama City Beach',
      searchType: 'housing'
    })
  });
  
  const searchData = await searchResponse.json();
  const searchResults = searchData.communities || searchData.results || [];
  
  console.log('✅ Smart Search Results for "Panama City Beach":');
  console.log(`   Found: ${searchResults.length} communities`);
  if (searchResults.length > 0) {
    searchResults.slice(0, 3).forEach(c => {
      console.log(`   - ${c.name} in ${c.city}, ${c.state}`);
    });
  }
  
  // 2. Check what Perfect Match finds
  console.log('\n❌ Perfect Match Results for "Panama City Beach":');
  
  const recResponse = await fetch(`${API_BASE}/ai/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'Panama City Beach',
      careNeeds: [],
      budget: { min: 0, max: 10000 },
      preferences: [],
      urgency: 'planning'
    })
  });
  
  const recData = await recResponse.json();
  const recommendations = recData.recommendations || [];
  
  console.log(`   Found: ${recommendations.length} recommendations`);
  if (recommendations.length > 0) {
    recommendations.slice(0, 3).forEach(r => {
      console.log(`   - ${r.community.name} in ${r.community.city}, ${r.community.state}`);
    });
  }
  
  // 3. Try with state specified
  console.log('\n🔄 Perfect Match with "Panama City Beach, FL":');
  
  const flResponse = await fetch(`${API_BASE}/ai/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'Panama City Beach, FL',
      careNeeds: [],
      budget: { min: 0, max: 10000 },
      preferences: [],
      urgency: 'planning'
    })
  });
  
  const flData = await flResponse.json();
  const flRecommendations = flData.recommendations || [];
  
  console.log(`   Found: ${flRecommendations.length} recommendations`);
  if (flRecommendations.length > 0) {
    flRecommendations.slice(0, 3).forEach(r => {
      console.log(`   - ${r.community.name} in ${r.community.city}, ${r.community.state}`);
    });
  }
  
  console.log('\n📊 Analysis:');
  console.log('Smart Search correctly finds Panama City Beach communities.');
  console.log('Perfect Match is not filtering by location correctly.');
  console.log('The issue is in the /api/ai/recommendations endpoint.');
}

debugPanamaCity().catch(console.error);
