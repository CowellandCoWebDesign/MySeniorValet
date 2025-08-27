// Test the parsing fix for communities with photos and data
import axios from 'axios';

const API_URL = 'http://localhost:5000';

async function testCommunityWithPhotos() {
  console.log('\n🧪 TESTING PARSING FIX: Communities with photos should be marked as found');
  console.log('='.repeat(70));

  try {
    // Test with a well-known community that should have photos
    const communityName = 'Atria Senior Living';
    const location = 'San Francisco, CA';
    
    console.log(`\n📍 Testing community: "${communityName}" in "${location}"`);
    console.log('→ Making request to LiveWebIntelligence endpoint...');
    
    const response = await axios.post(`${API_URL}/api/competitive-intelligence/live-web`, {
      communityName,
      location
    });

    const data = response.data;
    console.log('\n📊 Response Analysis:');
    console.log(`  • Found: ${data.found ? '✅ YES' : '❌ NO'}`);
    console.log(`  • Has photos: ${data.photos && data.photos.length > 0 ? `✅ YES (${data.photos.length} photos)` : '❌ NO'}`);
    console.log(`  • Has website: ${data.officialWebsite ? '✅ YES' : '❌ NO'}`);
    console.log(`  • Has phone: ${data.phone ? '✅ YES' : '❌ NO'}`);
    
    if (data.photos && data.photos.length > 0) {
      console.log('\n📸 Sample photos found:');
      data.photos.slice(0, 3).forEach((photo, i) => {
        console.log(`  ${i + 1}. ${photo.substring(0, 80)}...`);
      });
    }

    // Verify the fix worked
    if (data.photos && data.photos.length > 0 && !data.found) {
      console.log('\n❌ ERROR: Community has photos but marked as not found!');
      console.log('The parsing fix did not work correctly.');
      return false;
    } else if (data.photos && data.photos.length > 0 && data.found) {
      console.log('\n✅ SUCCESS: Community with photos correctly marked as found!');
      console.log('The parsing fix is working correctly.');
      return true;
    } else if (!data.photos || data.photos.length === 0) {
      console.log('\n⚠️ WARNING: No photos found for this community');
      console.log('This might be a different issue - try another community');
      return null;
    }

  } catch (error) {
    console.error('\n❌ Error testing community:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

// Run test
async function runTests() {
  console.log('🚀 Starting parsing fix validation...');
  console.log('Testing Perplexity parsing logic after fix');
  
  const result = await testCommunityWithPhotos();
  
  console.log('\n' + '='.repeat(70));
  if (result === true) {
    console.log('🎉 PARSING FIX VALIDATED: Communities with photos are correctly marked as found!');
  } else if (result === false) {
    console.log('⚠️ PARSING FIX NEEDS MORE WORK: Issue still exists');
  } else {
    console.log('ℹ️ TEST INCONCLUSIVE: Try testing with a different community');
  }
  console.log('='.repeat(70) + '\n');
}

// Wait for server to be ready then run
setTimeout(() => {
  runTests().catch(console.error);
}, 2000);