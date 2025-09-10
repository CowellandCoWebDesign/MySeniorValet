/**
 * Quick San Francisco Community Expansion
 * Adds top-rated authentic communities found in discovery
 */

const { Pool } = require('@neondatabase/serverless');
const ws = require('ws');

// Configure WebSocket for Neon
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  webSocketConstructor: ws
});

// Top-rated communities found in discovery
const topCommunities = [
  {
    name: "Coterie Cathedral Hill",
    address: "1333 Jones St, San Francisco, CA 94109",
    rating: 4.9,
    zipCode: "94109"
  },
  {
    name: "Rhoda Goldman Plaza - San Francisco Assisted Living & Memory Care", 
    address: "2165 Post St, San Francisco, CA 94115",
    rating: 4.8,
    zipCode: "94115"
  },
  {
    name: "AlmaVia of San Francisco",
    address: "1515 Laguna St, San Francisco, CA 94115", 
    rating: 4.7,
    zipCode: "94115"
  },
  {
    name: "The Carlisle",
    address: "1450 Post St, San Francisco, CA 94109",
    rating: 4.7,
    zipCode: "94109"
  },
  {
    name: "Sunset Gardens",
    address: "2626 Kirkham St, San Francisco, CA 94122",
    rating: 4.7,
    zipCode: "94122"
  },
  {
    name: "Notre Dame Senior Plaza",
    address: "2301 Laguna St, San Francisco, CA 94115",
    rating: 4.7,
    zipCode: "94115"
  },
  {
    name: "Sagebrook Senior Living",
    address: "1601 Laguna St, San Francisco, CA 94115",
    rating: 4.6,
    zipCode: "94115"
  },
  {
    name: "The Sequoias San Francisco",
    address: "1400 Geary Blvd, San Francisco, CA 94109",
    rating: 4.6,
    zipCode: "94109"
  },
  {
    name: "Serra Highlands Senior Living",
    address: "888 Corbett Ave, San Francisco, CA 94131",
    rating: 4.6,
    zipCode: "94131"
  },
  {
    name: "Providence Place",
    address: "400 Duboce Ave, San Francisco, CA 94117",
    rating: 4.6,
    zipCode: "94117"
  },
  {
    name: "Bethany Center",
    address: "1270 Fulton St, San Francisco, CA 94117",
    rating: 4.6,
    zipCode: "94117"
  },
  {
    name: "Peninsula Del Rey",
    address: "111 Lake Merced Blvd, San Francisco, CA 94132",
    rating: 4.5,
    zipCode: "94132"
  },
  {
    name: "San Francisco Towers",
    address: "1661 Pine St, San Francisco, CA 94109",
    rating: 4.5,
    zipCode: "94109"
  },
  {
    name: "Mission Villa Senior Living",
    address: "3520 Mission St, San Francisco, CA 94110",
    rating: 4.5,
    zipCode: "94110"
  },
  {
    name: "Mission Terrace Senior Housing",
    address: "490 Geneva Ave, San Francisco, CA 94112",
    rating: 4.5,
    zipCode: "94112"
  }
];

async function addTopSFCommunities() {
  console.log('🏙️ Adding top-rated San Francisco senior living communities...');
  
  let added = 0;
  let skipped = 0;
  
  for (const community of topCommunities) {
    try {
      // Check if community already exists
      const existing = await pool.query(
        'SELECT id FROM communities WHERE name = $1',
        [community.name]
      );
      
      if (existing.rows.length > 0) {
        console.log(`   ⏭️  Already exists: ${community.name}`);
        skipped++;
        continue;
      }
      
      // Insert new community
      await pool.query(`
        INSERT INTO communities (
          name, address, city, state, "zipCode", 
          "googleRating", "careTypes", "dataSource", 
          verified, county, region, "availabilityStatus"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
        )
      `, [
        community.name,
        community.address,
        'San Francisco',
        'CA',
        community.zipCode,
        community.rating,
        JSON.stringify(['Senior Living', 'Assisted Living']),
        'Google Places Discovery',
        true,
        'San Francisco County',
        'Bay Area',
        'Contact for Availability'
      ]);
      
      added++;
      console.log(`   ✅ Added: ${community.name} (${community.rating}★) - ${community.zipCode}`);
      
    } catch (error) {
      console.error(`❌ Error adding ${community.name}:`, error.message);
    }
  }
  
  console.log(`\n🎯 Results: ${added} added, ${skipped} already existed`);
  
  // Check final count
  const finalResult = await pool.query(`
    SELECT COUNT(*) as count 
    FROM communities 
    WHERE LOWER(city) = 'san francisco'
  `);
  
  console.log(`📊 San Francisco now has ${finalResult.rows[0].count} total communities`);
  
  return { added, skipped, total: finalResult.rows[0].count };
}

// Run the addition
if (require.main === module) {
  addTopSFCommunities()
    .then(results => {
      console.log('\n🎉 San Francisco expansion complete!', results);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Expansion failed:', error);
      process.exit(1);
    });
}

module.exports = { addTopSFCommunities };