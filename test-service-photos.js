
const fetch = require('node-fetch');

// Test 4 different types of services
const testServices = [
  {
    serviceName: "Olive Garden",
    city: "Orlando", 
    state: "FL",
    serviceType: "restaurant"
  },
  {
    serviceName: "CVS Pharmacy", 
    city: "Miami",
    state: "FL", 
    serviceType: "pharmacy"
  },
  {
    serviceName: "Two Men and a Truck",
    city: "Atlanta",
    state: "GA",
    serviceType: "moving"
  },
  {
    serviceName: "Marriott Hotel",
    city: "San Francisco", 
    state: "CA",
    serviceType: "hotel"
  }
];

async function testServicePhotos() {
  console.log('🧪 Testing photo extraction for 4 different service types...\n');
  
  for (const service of testServices) {
    console.log(`\n📍 Testing: ${service.serviceName} in ${service.city}, ${service.state}`);
    console.log(`   Type: ${service.serviceType}`);
    console.log('   ⏳ Fetching photos...');
    
    try {
      const response = await fetch('http://localhost:5000/api/service-intelligence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceName: service.serviceName,
          city: service.city,
          state: service.state,
          serviceType: service.serviceType
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Response received`);
        console.log(`   📸 Photos found: ${data.photos ? data.photos.length : 0}`);
        
        if (data.photos && data.photos.length > 0) {
          console.log('   📋 Photo URLs:');
          data.photos.slice(0, 5).forEach((photo, idx) => {
            // Extract just the domain from proxy URLs
            let displayUrl = photo;
            if (photo.includes('image-proxy?url=')) {
              try {
                const decodedUrl = decodeURIComponent(photo.split('url=')[1]);
                const domain = new URL(decodedUrl).hostname;
                displayUrl = `${domain}/...`;
              } catch (e) {
                displayUrl = photo.substring(0, 60) + '...';
              }
            }
            console.log(`     ${idx + 1}. ${displayUrl}`);
          });
          if (data.photos.length > 5) {
            console.log(`     ... and ${data.photos.length - 5} more`);
          }
        } else {
          console.log('   ❌ No photos found');
        }
        
        // Show contact info found
        if (data.contactInfo) {
          console.log(`   📞 Phone: ${data.contactInfo.phone || 'Not found'}`);
          console.log(`   🌐 Website: ${data.contactInfo.website || 'Not found'}`);
        }
        
        // Show sources
        if (data.citations && data.citations.length > 0) {
          console.log(`   📚 Sources: ${data.citations.length} found`);
        }
        
      } else {
        console.log(`   ❌ Request failed: ${response.status}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('   ' + '─'.repeat(50));
  }
  
  console.log('\n🏁 Test completed!');
}

testServicePhotos();
