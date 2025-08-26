// Test script for improved website search functionality
import fetch from 'node-fetch';

async function testWebsiteSearch() {
  console.log('🧪 Testing improved website search functionality...\n');
  
  // Test communities - mix of ones likely to have official websites
  const testCommunities = [
    {
      name: "Superior Residences of Panama City Beach",
      city: "Panama City Beach",
      state: "Florida"
    },
    {
      name: "Brookdale Senior Living",
      city: "Chicago",
      state: "Illinois"
    },
    {
      name: "Sunrise Senior Living",
      city: "McLean",
      state: "Virginia"
    },
    {
      name: "Atria Senior Living",
      city: "Louisville",
      state: "Kentucky"
    },
    {
      name: "The Arbors Assisted Living",
      city: "Shelton",
      state: "Connecticut"
    }
  ];

  for (const community of testCommunities) {
    console.log(`\n📍 Testing: ${community.name} in ${community.city}, ${community.state}`);
    console.log('─'.repeat(60));
    
    try {
      const response = await fetch('http://localhost:5000/api/communities/web-intelligence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          communityName: community.name,
          city: community.city,
          state: community.state
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        // Check if we found an official website
        const officialWebsiteMatch = data.content?.match(/\*\*Official Website:\*\* (https?:\/\/[^\s\n]+)/);
        
        if (officialWebsiteMatch) {
          console.log(`✅ OFFICIAL WEBSITE FOUND: ${officialWebsiteMatch[1]}`);
        } else {
          console.log('⚠️ No official website detected in response');
        }
        
        // Display sources found
        console.log(`\n📚 Sources found (${data.citations?.length || 0}):`);
        if (data.citations && data.citations.length > 0) {
          data.citations.slice(0, 5).forEach((source, i) => {
            // Check if this looks like an official website
            const isLikelyOfficial = source.toLowerCase().includes(community.name.toLowerCase().split(' ')[0]);
            const marker = isLikelyOfficial ? '🌟' : '  ';
            console.log(`${marker} ${i + 1}. ${source}`);
          });
        }
        
        // Display verification status
        console.log(`\n🔍 Verification: ${data.verified ? 'VERIFIED ✓' : 'NOT VERIFIED'}`);
        if (data.identityVerified) {
          console.log(`   Identity Match: ${data.nameMatch || 'Unknown'}`);
        }
        
        // Check content quality
        const hasPhotos = data.images && data.images.length > 0;
        const hasPricing = data.pricing && Object.keys(data.pricing).length > 0;
        console.log(`\n📊 Content Quality:`);
        console.log(`   Photos: ${hasPhotos ? `✓ (${data.images.length} found)` : '✗'}`);
        console.log(`   Pricing: ${hasPricing ? '✓' : '✗'}`);
        
      } else {
        console.log(`❌ Error: ${data.error || 'Unknown error'}`);
      }
      
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 Test complete!\n');
}

// Run the test
testWebsiteSearch().catch(console.error);