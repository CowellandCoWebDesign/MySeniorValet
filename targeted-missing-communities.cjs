const axios = require('axios');

// Targeted addition of specific communities that were missed due to filtering bug
async function addMissingCommunities() {
  console.log('🎯 TARGETED ADDITION: Adding specific communities missed by restrictive filtering...');
  
  const baseUrl = 'http://localhost:5000';
  
  // Specific communities we know exist but are missing
  const missingCommunities = [
    {
      name: "Especially You Assisted Living",
      address: "12 Henderson St, Eureka, CA 95501",
      city: "Eureka",
      state: "CA",
      county: "Humboldt",
      zipCode: "95501",
      description: "Assisted living facility in Eureka, Humboldt County. Rating: 5.0/5 with 7 reviews.",
      careTypes: ["Assisted Living"],
      googleRating: 5.0,
      googleReviewCount: 7
    },
    {
      name: "Alder Bay Assisted Living", 
      address: "1355 Myrtle Avenue, Eureka, CA 95501",
      city: "Eureka",
      state: "CA", 
      county: "Humboldt",
      zipCode: "95501",
      description: "Assisted living facility in Eureka, Humboldt County. Rating: 4.0/5 with 5 reviews.",
      careTypes: ["Assisted Living"],
      googleRating: 4.0,
      googleReviewCount: 5
    },
    {
      name: "Silvercrest Residence",
      address: "2141 Tydd St, Eureka, CA 95501", 
      city: "Eureka",
      state: "CA",
      county: "Humboldt", 
      zipCode: "95501",
      description: "Senior living residence in Eureka, Humboldt County. Rating: 4.6/5 with 8 reviews.",
      careTypes: ["Independent Living", "Assisted Living"],
      googleRating: 4.6,
      googleReviewCount: 8
    },
    {
      name: "Frye's Care Home",
      address: "2240 Fern St, Eureka, CA 95503",
      city: "Eureka", 
      state: "CA",
      county: "Humboldt",
      zipCode: "95503", 
      description: "Memory care and assisted living facility in Eureka, Humboldt County. Rating: 3.5/5 with 8 reviews.",
      careTypes: ["Memory Care", "Assisted Living"],
      googleRating: 3.5,
      googleReviewCount: 8
    },
    {
      name: "Humboldt House Lodge Assisted Living",
      address: "4041 F St, Eureka, CA 95503",
      city: "Eureka",
      state: "CA", 
      county: "Humboldt",
      zipCode: "95503",
      description: "Assisted living facility in Eureka, Humboldt County.",
      careTypes: ["Assisted Living"],
      googleRating: null,
      googleReviewCount: 0
    },
    {
      name: "Eureka Central Residence", 
      address: "333 E St, Eureka, CA 95501",
      city: "Eureka",
      state: "CA",
      county: "Humboldt", 
      zipCode: "95501",
      description: "Senior living residence in downtown Eureka, Humboldt County. Rating: 3.6/5 with 5 reviews.",
      careTypes: ["Independent Living"],
      googleRating: 3.6,
      googleReviewCount: 5
    }
  ];
  
  let addedCount = 0;
  let duplicateCount = 0;
  
  for (const community of missingCommunities) {
    try {
      console.log(`\n🔍 Processing: ${community.name}...`);
      
      // Check if community already exists
      const checkResponse = await axios.get(`${baseUrl}/api/communities`, {
        params: { city: community.city },
        timeout: 10000
      });
      
      const existingCommunities = checkResponse.data || [];
      const alreadyExists = existingCommunities.some(existing => 
        existing.name.toLowerCase().includes(community.name.toLowerCase().substring(0, 10)) ||
        community.name.toLowerCase().includes(existing.name.toLowerCase().substring(0, 10))
      );
      
      if (alreadyExists) {
        console.log(`  ⚠️ Already exists: ${community.name}`);
        duplicateCount++;
        continue;
      }
      
      // Add the community directly via admin endpoint
      const addResponse = await axios.post(`${baseUrl}/api/admin/communities`, {
        name: community.name,
        address: community.address,
        city: community.city,
        state: community.state,
        zipCode: community.zipCode,
        phone: null,
        website: null,
        description: community.description,
        careTypes: community.careTypes,
        amenities: [],
        pricing: null,
        availability: 'Contact for Availability',
        photos: [],
        reviews: [],
        isVerified: true,
        googleRating: community.googleRating,
        googleReviewCount: community.googleReviewCount,
        verificationDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (addResponse.status === 200 || addResponse.status === 201) {
        console.log(`  ✅ Successfully added: ${community.name}`);
        addedCount++;
      } else {
        console.log(`  ❌ Failed to add: ${community.name} (Status: ${addResponse.status})`);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`  ❌ Error adding ${community.name}:`, error.message);
    }
  }
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`✅ Communities added: ${addedCount}`);
  console.log(`⚠️ Already existed: ${duplicateCount}`);
  console.log(`📈 Total processed: ${missingCommunities.length}`);
  
  // Get final count
  try {
    const finalResponse = await axios.get(`${baseUrl}/api/communities`, {
      timeout: 15000
    });
    console.log(`📊 Total communities in database: ${finalResponse.data.length}`);
    
    // Check Eureka specifically
    const eurekaResponse = await axios.get(`${baseUrl}/api/communities?city=Eureka`, {
      timeout: 10000
    });
    console.log(`📍 Total Eureka communities: ${eurekaResponse.data.length}`);
    
  } catch (error) {
    console.error('Error getting final count:', error.message);
  }
}

addMissingCommunities().catch(console.error);