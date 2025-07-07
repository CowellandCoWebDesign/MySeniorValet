/**
 * Test Photo Migration System
 * Migrate existing direct Google Places URLs to cached photo system
 */

const axios = require('axios');

async function testPhotoMigration() {
  try {
    console.log('🔄 Testing photo migration system...');
    
    // Check current status before migration
    console.log('\n📊 Status before migration:');
    
    // Check photos directory
    const fs = require('fs');
    const photosDir = 'client/public/photos';
    
    if (fs.existsSync(photosDir)) {
      const files = fs.readdirSync(photosDir);
      console.log(`Found ${files.length} cached photos currently`);
    } else {
      console.log('No photos directory found');
    }
    
    // Test migration on just one community first
    console.log('\n🧪 Starting photo migration...');
    
    const response = await axios.post('http://localhost:5000/api/admin/migrate-photos', {}, {
      timeout: 60000 // 60 second timeout
    });
    
    console.log('\n✅ Migration completed:');
    console.log(`- Migrated: ${response.data.migrated} communities`);
    console.log(`- Errors: ${response.data.errors}`);
    console.log(`- Message: ${response.data.message}`);
    
    // Check photos directory after migration
    console.log('\n📊 Status after migration:');
    if (fs.existsSync(photosDir)) {
      const files = fs.readdirSync(photosDir);
      console.log(`Found ${files.length} cached photos after migration:`, files.slice(0, 5));
    }
    
    // Test a community to see if it now has cached photos
    const communities = await axios.get('http://localhost:5000/api/communities?limit=1');
    if (communities.data.length > 0) {
      const community = communities.data[0];
      console.log(`\n📷 Community ${community.name} photos after migration:`, community.photos);
      
      if (community.photos && community.photos.length > 0) {
        const firstPhoto = community.photos[0];
        if (firstPhoto.startsWith('/photos/')) {
          console.log('✅ SUCCESS: Community now has cached photos!');
        } else if (firstPhoto.startsWith('https://maps.googleapis.com')) {
          console.log('⚠️ Still has direct Google API URLs (migration may have failed)');
        } else {
          console.log('❓ Unknown photo URL format:', firstPhoto);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Migration test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testPhotoMigration();