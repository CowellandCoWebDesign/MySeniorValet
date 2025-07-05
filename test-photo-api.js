// Quick test to check API response structure for photos
import fetch from 'node-fetch';

async function testPhotoApi() {
  try {
    const response = await fetch('http://localhost:5000/api/communities');
    const communities = await response.json();
    
    // Find a community with photos
    const communityWithPhotos = communities.find(c => c.photos && c.photos.length > 0);
    
    if (communityWithPhotos) {
      console.log('Community with photos found:');
      console.log('Name:', communityWithPhotos.name);
      console.log('Photos count:', communityWithPhotos.photos.length);
      console.log('Photos type:', typeof communityWithPhotos.photos);
      console.log('Is array?', Array.isArray(communityWithPhotos.photos));
      console.log('First 2 photos:', communityWithPhotos.photos.slice(0, 2));
    } else {
      console.log('No communities with photos found in API response');
      console.log('First community structure:');
      console.log(JSON.stringify(communities[0], null, 2));
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testPhotoApi();