// EMERGENCY FREEZE: Script disabled due to $600 in Google API charges
exit 1;
const axios = require('axios');

// Add the specific communities we found in Eureka that were missed
async function addMissingEurekaCommunities() {
  console.log('🔧 Adding missing Eureka communities through API...');
  
  const baseUrl = 'http://localhost:5000';
  
  // Communities we discovered that were missing
  const missingCommunities = [
    {
      name: "Especially You Assisted Living",
      address: "12 Henderson St, Eureka, CA 95501",
      city: "Eureka",
      state: "CA",
      zipCode: "95501",
      phone: null,
      website: null,
      description: "Senior living facility in Eureka, Humboldt County, CA. Google Places rating: 5/5 with 7 reviews.",
      careTypes: ["Assisted Living"],
      amenities: [],
      pricing: null,
      availability: "Contact for Availability",
      photos: [],
      reviews: [],
      isVerified: true,
      googleRating: 5,
      googleReviewCount: 7
    },
    {
      name: "Alder Bay Assisted Living",
      address: "1355 Myrtle Avenue, Eureka, CA 95501",
      city: "Eureka",
      state: "CA",
      zipCode: "95501",
      phone: null,
      website: null,
      description: "Senior living facility in Eureka, Humboldt County, CA. Google Places rating: 4/5 with 5 reviews.",
      careTypes: ["Assisted Living"],
      amenities: [],
      pricing: null,
      availability: "Contact for Availability",
      photos: [],
      reviews: [],
      isVerified: true,
      googleRating: 4,
      googleReviewCount: 5
    },
    {
      name: "Silvercrest Residence",
      address: "2141 Tydd St, Eureka, CA 95501",
      city: "Eureka",
      state: "CA",
      zipCode: "95501",
      phone: null,
      website: null,
      description: "Senior living facility in Eureka, Humboldt County, CA. Google Places rating: 4.6/5 with 8 reviews.",
      careTypes: ["Assisted Living"],
      amenities: [],
      pricing: null,
      availability: "Contact for Availability",
      photos: [],
      reviews: [],
      isVerified: true,
      googleRating: 4.6,
      googleReviewCount: 8
    },
    {
      name: "Humboldt House Lodge Assisted Living",
      address: "4041 F St, Eureka, CA 95503",
      city: "Eureka",
      state: "CA",
      zipCode: "95503",
      phone: null,
      website: null,
      description: "Senior living facility in Eureka, Humboldt County, CA.",
      careTypes: ["Assisted Living"],
      amenities: [],
      pricing: null,
      availability: "Contact for Availability",
      photos: [],
      reviews: [],
      isVerified: true,
      googleRating: null,
      googleReviewCount: 0
    },
    {
      name: "Frye's Care Home",
      address: "2240 Fern St, Eureka, CA 95503",
      city: "Eureka",
      state: "CA",
      zipCode: "95503",
      phone: null,
      website: null,
      description: "Senior living facility in Eureka, Humboldt County, CA. Google Places rating: 3.5/5 with 8 reviews.",
      careTypes: ["Memory Care", "Assisted Living"],
      amenities: [],
      pricing: null,
      availability: "Contact for Availability",
      photos: [],
      reviews: [],
      isVerified: true,
      googleRating: 3.5,
      googleReviewCount: 8
    }
  ];
  
  let addedCount = 0;
  
  for (const community of missingCommunities) {
    try {
      console.log(`Adding: ${community.name}...`);
      
      // Check if it already exists
      const searchResponse = await axios.get(`${baseUrl}/api/communities`, {
        params: { city: community.city, limit: 100 },
        timeout: 10000
      });
      
      const existingCommunity = searchResponse.data.find(c => 
        c.name.toLowerCase() === community.name.toLowerCase()
      );
      
      if (existingCommunity) {
        console.log(`  ⚠️ Already exists: ${community.name}`);
        continue;
      }
      
      // Add the community via admin API
      const response = await axios.post(`${baseUrl}/api/admin/communities`, community, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 201) {
        console.log(`  ✅ Added: ${community.name}`);
        addedCount++;
      } else {
        console.log(`  ❌ Failed to add: ${community.name} (Status: ${response.status})`);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`  ❌ Error adding ${community.name}:`, error.message);
    }
  }
  
  console.log(`\n📊 SUMMARY: Added ${addedCount} new communities to Eureka`);
  
  // Get updated count
  try {
    const response = await axios.get(`${baseUrl}/api/communities`, {
      params: { city: 'Eureka' },
      timeout: 10000
    });
    console.log(`Total Eureka communities now: ${response.data.length}`);
  } catch (error) {
    console.error('Error getting updated count:', error.message);
  }
}

addMissingEurekaCommunities().catch(console.error);