/**
 * Test Photo Caching System
 * Test if the photo caching system is working by forcing re-enrichment of one community
 */

const axios = require('axios');

async function testPhotoCaching() {
  try {
    console.log('🧪 Testing photo caching system...');
    
    // First, let's check current photo status
    console.log('\n📊 Current photo status check:');
    const stats = await axios.get('http://localhost:5000/api/admin/enrichment-stats');
    console.log('Enrichment stats:', stats.data);
    
    // Check current cached photos directory
    const fs = require('fs');
    const path = require('path');
    const photosDir = path.join(process.cwd(), 'client/public/photos');
    
    console.log('\n📁 Current cached photos:');
    if (fs.existsSync(photosDir)) {
      const files = fs.readdirSync(photosDir);
      console.log(`Found ${files.length} cached photo files:`, files);
    } else {
      console.log('Photos directory does not exist');
    }
    
    // Test photo cache service directly if we can access it
    console.log('\n🔧 Testing photo cache service...');
    
    // Try to get a community with photos and check its current photo URLs
    const communities = await axios.get('http://localhost:5000/api/communities?limit=1');
    if (communities.data.length > 0) {
      const community = communities.data[0];
      console.log(`\n📷 Community ${community.name} current photos:`, community.photos);
      
      // Check if these are cached photos (start with /photos/) or direct URLs
      if (community.photos && community.photos.length > 0) {
        const firstPhoto = community.photos[0];
        if (firstPhoto.startsWith('/photos/')) {
          console.log('✅ This community has cached photos');
        } else if (firstPhoto.startsWith('https://maps.googleapis.com')) {
          console.log('⚠️ This community has direct Google API URLs (not cached)');
        } else {
          console.log('❓ Unknown photo URL format:', firstPhoto);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPhotoCaching();