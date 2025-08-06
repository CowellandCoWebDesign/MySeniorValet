// Debug the actual database query for Panama City Beach
const API_BASE = 'http://localhost:5000/api';

async function testLocationQuery() {
  console.log('🔍 Testing Location Query Logic\n');
  
  // Test direct database query endpoint if available
  const locations = ['Panama City Beach', 'Panama City Beach, FL', 'Los Angeles', 'FL'];
  
  for (const location of locations) {
    console.log(`\nTesting: "${location}"`);
    
    // Call Perfect Match with minimal params to focus on location
    const response = await fetch(`${API_BASE}/ai/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location,
        careNeeds: [],
        budget: { min: 0, max: 0 },
        preferences: [],
        urgency: ''
      })
    });
    
    const data = await response.json();
    const recommendations = data.recommendations || [];
    
    console.log(`  Results: ${recommendations.length}`);
    if (recommendations.length > 0) {
      // Check location distribution
      const states = {};
      recommendations.forEach(r => {
        const state = r.community.state;
        states[state] = (states[state] || 0) + 1;
      });
      
      console.log('  State distribution:');
      Object.entries(states).forEach(([state, count]) => {
        console.log(`    ${state}: ${count}`);
      });
      
      // Show first 3 results
      console.log('  First 3 results:');
      recommendations.slice(0, 3).forEach(r => {
        console.log(`    - ${r.community.city}, ${r.community.state}`);
      });
    }
  }
}

testLocationQuery().catch(console.error);
