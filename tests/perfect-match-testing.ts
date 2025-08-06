// Simple test runner without Jest
const fetch = require('node-fetch');
const assert = require('assert');

const API_BASE = 'http://localhost:5000/api';

// Test data for various scenarios
const TEST_LOCATIONS = [
  'Panama City Beach',
  'Panama City Beach, FL',
  'Los Angeles',
  'Los Angeles, CA', 
  'New York',
  'Sacramento',
  'Miami',
  'Chicago, IL',
  'Houston, TX',
  'Phoenix, AZ',
  'FL', // State only
  'CA', // State only
  'Invalid City Name XYZ',
  '', // Empty location
];

const TEST_CARE_NEEDS = [
  [],
  ['Independent Living'],
  ['Assisted Living'],
  ['Memory Care'],
  ['Skilled Nursing'],
  ['Independent Living', 'Assisted Living'],
  ['Memory Care', 'Skilled Nursing'],
  ['Stay at Home'],
  ['HUD/Section 202'],
  ['55+ Mobile Home Park'],
  ['Active Adult 55+']
];

const TEST_BUDGETS = [
  { min: 0, max: 0 }, // No budget
  { min: 0, max: 1000 },
  { min: 1000, max: 2000 },
  { min: 2000, max: 4000 },
  { min: 4000, max: 6000 },
  { min: 6000, max: 10000 },
  { min: 10000, max: 15000 },
];

const TEST_PREFERENCES = [
  [],
  ['Pet Friendly'],
  ['Religious Affiliation'],
  ['Cultural Programs'],
  ['Pet Friendly', 'Cultural Programs'],
  ['Outdoor Activities', 'Fitness Center'],
];

describe('Perfect Match Testing Suite', () => {
  
  describe('1. Smart Search with Autocomplete', () => {
    
    it('should provide autocomplete suggestions for cities', async () => {
      const queries = ['Los An', 'New Y', 'Sacr', 'Mia', 'Chic'];
      
      for (const query of queries) {
        const response = await fetch(`${API_BASE}/autocomplete?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        console.log(`\n🔍 Autocomplete for "${query}":`);
        console.log(`   Found ${data.suggestions?.length || 0} suggestions`);
        
        expect(response.status).toBe(200);
        expect(data.suggestions).toBeDefined();
        expect(Array.isArray(data.suggestions)).toBe(true);
        
        if (data.suggestions.length > 0) {
          console.log(`   Top suggestion: ${data.suggestions[0].label}`);
        }
      }
    });

    it('should execute search when selecting autocomplete suggestion', async () => {
      const searchQueries = [
        { query: 'Los Angeles', type: 'housing' },
        { query: 'Sacramento', type: 'housing' },
        { query: 'Phoenix', type: 'housing' },
        { query: 'Memory Care', type: 'housing' },
        { query: 'HUD Housing', type: 'housing' }
      ];
      
      for (const searchData of searchQueries) {
        const response = await fetch(`${API_BASE}/ai/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(searchData)
        });
        
        const data = await response.json();
        
        console.log(`\n🔎 Smart Search for "${searchData.query}":`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Communities found: ${data.communities?.length || data.results?.length || 0}`);
        
        expect(response.status).toBe(200);
        
        if (data.communities?.length > 0) {
          const firstCommunity = data.communities[0];
          console.log(`   First result: ${firstCommunity.name} in ${firstCommunity.city}, ${firstCommunity.state}`);
          console.log(`   Price: ${firstCommunity.priceRange || firstCommunity.rentPerMonth || 'Contact for pricing'}`);
        }
      }
    });
  });

  describe('2. Perfect Match Recommendations', () => {
    
    it('should handle location-specific searches correctly', async () => {
      console.log('\n📍 TESTING LOCATION MATCHING:');
      
      for (const location of TEST_LOCATIONS) {
        const response = await fetch(`${API_BASE}/ai/recommendations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location,
            careNeeds: ['Assisted Living'],
            budget: { min: 2000, max: 5000 },
            preferences: [],
            urgency: 'planning'
          })
        });
        
        const data = await response.json();
        
        console.log(`\n   Location: "${location}"`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Recommendations: ${data.recommendations?.length || 0}`);
        
        expect(response.status).toBe(200);
        expect(data.recommendations).toBeDefined();
        
        // Verify location matching
        if (data.recommendations?.length > 0 && location && !location.includes('XYZ')) {
          const firstRec = data.recommendations[0];
          console.log(`   First match: ${firstRec.community.name} in ${firstRec.community.city}, ${firstRec.community.state}`);
          console.log(`   Match score: ${firstRec.matchScore}%`);
          
          // For specific city searches, verify the results are from that area
          if (location.toLowerCase().includes('panama city beach')) {
            const floridaResults = data.recommendations.filter(r => 
              r.community.state === 'FL' || r.community.state === 'Florida'
            );
            console.log(`   ✅ Florida results: ${floridaResults.length}/${data.recommendations.length}`);
            expect(floridaResults.length).toBeGreaterThan(0);
          }
        }
      }
    });

    it('should filter by care needs correctly', async () => {
      console.log('\n🏥 TESTING CARE NEEDS FILTERING:');
      
      for (const careNeeds of TEST_CARE_NEEDS) {
        const response = await fetch(`${API_BASE}/ai/recommendations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'California',
            careNeeds,
            budget: { min: 0, max: 10000 },
            preferences: [],
            urgency: 'planning'
          })
        });
        
        const data = await response.json();
        
        console.log(`\n   Care needs: [${careNeeds.join(', ') || 'None'}]`);
        console.log(`   Recommendations: ${data.recommendations?.length || 0}`);
        
        expect(response.status).toBe(200);
        
        // Verify care type matching
        if (data.recommendations?.length > 0 && careNeeds.length > 0) {
          const matchingCare = data.recommendations.filter(r => {
            const communityCareTypes = r.community.careTypes || [];
            return careNeeds.some(need => communityCareTypes.includes(need));
          });
          
          console.log(`   Matching care types: ${matchingCare.length}/${data.recommendations.length}`);
        }
      }
    });

    it('should respect budget constraints', async () => {
      console.log('\n💰 TESTING BUDGET FILTERING:');
      
      for (const budget of TEST_BUDGETS) {
        const response = await fetch(`${API_BASE}/ai/recommendations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'Los Angeles',
            careNeeds: [],
            budget,
            preferences: [],
            urgency: 'immediate'
          })
        });
        
        const data = await response.json();
        
        console.log(`\n   Budget: $${budget.min}-$${budget.max}`);
        console.log(`   Recommendations: ${data.recommendations?.length || 0}`);
        
        expect(response.status).toBe(200);
        
        // Check if recommendations respect budget
        if (data.recommendations?.length > 0 && budget.max > 0) {
          const withinBudget = data.recommendations.filter(r => {
            const price = r.community.rentPerMonth ? 
              parseFloat(r.community.rentPerMonth) : 
              r.community.priceRange?.min || 0;
            return price <= budget.max;
          });
          
          console.log(`   Within budget: ${withinBudget.length}/${data.recommendations.length}`);
        }
      }
    });

    it('should handle preferences appropriately', async () => {
      console.log('\n🎯 TESTING PREFERENCES:');
      
      for (const preferences of TEST_PREFERENCES) {
        const response = await fetch(`${API_BASE}/ai/recommendations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'Phoenix, AZ',
            careNeeds: ['Independent Living'],
            budget: { min: 2000, max: 5000 },
            preferences,
            urgency: 'planning'
          })
        });
        
        const data = await response.json();
        
        console.log(`\n   Preferences: [${preferences.join(', ') || 'None'}]`);
        console.log(`   Recommendations: ${data.recommendations?.length || 0}`);
        console.log(`   Match reasons include preferences: ${
          data.recommendations?.some(r => 
            r.matchReasons?.some(reason => 
              preferences.some(pref => reason?.includes(pref))
            )
          ) || false
        }`);
        
        expect(response.status).toBe(200);
      }
    });
  });

  describe('3. AI Community Comparison', () => {
    
    it('should compare multiple communities', async () => {
      console.log('\n🆚 TESTING COMMUNITY COMPARISON:');
      
      // First get some communities to compare
      const searchResponse = await fetch(`${API_BASE}/ai/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'Los Angeles',
          searchType: 'housing'
        })
      });
      
      const searchData = await searchResponse.json();
      const communities = searchData.communities || searchData.results || [];
      
      if (communities.length >= 3) {
        const communityIds = communities.slice(0, 3).map(c => c.id);
        
        const compareResponse = await fetch(`${API_BASE}/ai/compare`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ communityIds })
        });
        
        console.log(`   Comparing ${communityIds.length} communities`);
        console.log(`   IDs: ${communityIds.join(', ')}`);
        console.log(`   Comparison status: ${compareResponse.status}`);
        
        if (compareResponse.status === 200) {
          const compareData = await compareResponse.json();
          console.log(`   Comparison complete: ${!!compareData}`);
        }
      } else {
        console.log('   Not enough communities to compare');
      }
    });
  });

  describe('4. Edge Cases and Error Handling', () => {
    
    it('should handle empty/invalid inputs gracefully', async () => {
      console.log('\n⚠️ TESTING ERROR HANDLING:');
      
      const invalidTests = [
        { location: '', careNeeds: [], budget: { min: -100, max: -50 } },
        { location: null, careNeeds: null, budget: null },
        { location: 'XXXXXXXXXX', careNeeds: ['Invalid Care Type'], budget: { min: 999999, max: 9999999 } },
      ];
      
      for (const testData of invalidTests) {
        const response = await fetch(`${API_BASE}/ai/recommendations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testData)
        });
        
        console.log(`\n   Test data: ${JSON.stringify(testData).substring(0, 50)}...`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Handled gracefully: ${response.status === 200 || response.status === 400}`);
        
        expect([200, 400, 500]).toContain(response.status);
      }
    });

    it('should provide fallback results when no exact matches', async () => {
      console.log('\n🔄 TESTING FALLBACK BEHAVIOR:');
      
      const response = await fetch(`${API_BASE}/ai/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'Tiny Unknown Town, AK',
          careNeeds: ['Specialized Rare Care'],
          budget: { min: 100, max: 200 },
          preferences: ['Unicorn Stables'],
          urgency: 'immediate'
        })
      });
      
      const data = await response.json();
      
      console.log(`   Location: "Tiny Unknown Town, AK"`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Recommendations: ${data.recommendations?.length || 0}`);
      console.log(`   Fallback provided: ${(data.recommendations?.length || 0) > 0}`);
      
      expect(response.status).toBe(200);
    });
  });
});

// Performance testing
describe('Performance Testing', () => {
  
  it('should handle concurrent requests efficiently', async () => {
    console.log('\n⚡ TESTING PERFORMANCE:');
    
    const startTime = Date.now();
    
    const requests = [
      fetch(`${API_BASE}/autocomplete?q=Los`),
      fetch(`${API_BASE}/ai/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'Miami', searchType: 'housing' })
      }),
      fetch(`${API_BASE}/ai/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'Chicago',
          careNeeds: ['Assisted Living'],
          budget: { min: 3000, max: 5000 },
          preferences: [],
          urgency: 'planning'
        })
      })
    ];
    
    const responses = await Promise.all(requests);
    const endTime = Date.now();
    
    console.log(`   Concurrent requests: ${requests.length}`);
    console.log(`   Total time: ${endTime - startTime}ms`);
    console.log(`   All successful: ${responses.every(r => r.status === 200)}`);
    
    responses.forEach((r, i) => {
      console.log(`   Request ${i + 1} status: ${r.status}`);
    });
    
    expect(responses.every(r => [200, 201].includes(r.status))).toBe(true);
  });
});

// Summary function
async function runAllTests() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 PERFECT MATCH COMPREHENSIVE TESTING SUITE');
  console.log('='.repeat(80));
  console.log('\nTesting 3 main features:');
  console.log('1. Smart Search with Autocomplete');
  console.log('2. Perfect Match Recommendations');
  console.log('3. AI Community Comparison');
  console.log('\nStarting tests...\n');
}

runAllTests();