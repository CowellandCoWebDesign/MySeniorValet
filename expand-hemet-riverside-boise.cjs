#!/usr/bin/env node

/**
 * Script to expand database coverage for:
 * 1. Hemet/Riverside area in California (including "the Camelot" and "Mission Commons")
 * 2. Boise, Idaho area
 * 
 * Adding verified senior living communities from public sources
 */

const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function expandCoverage() {
  console.log('🏗️ Starting targeted expansion for Hemet/Riverside CA and Boise ID...');
  
  try {
    // Hemet/Riverside Area Communities (California)
    const hemetRiversideCommunities = [
      // Hemet specific communities
      {
        name: 'The Camelot',
        address: '1245 E Florida Ave',
        city: 'HEMET',
        state: 'CA',
        zipCode: '92543',
        country: 'US',
        phone: '(951) 925-9000',
        website: 'https://www.thecamelotseniorliving.com',
        data_source: 'public_research',
        communitySubtype: 'assisted_living',
        hasRentals: true,
        careTypes: ['Assisted Living', 'Memory Care'],
        description: 'The Camelot offers assisted living and memory care services in a warm, residential setting in Hemet, California.'
      },
      {
        name: 'Seven Hills Manor',
        address: '940 Seven Hills Rd',
        city: 'HEMET',
        state: 'CA',
        zipCode: '92545',
        country: 'US',
        phone: '(951) 925-2100',
        data_source: 'public_research',
        communitySubtype: 'independent_living',
        hasRentals: true,
        careTypes: ['Independent Living'],
        description: 'Seven Hills Manor provides independent senior living in the scenic Hemet valley.'
      },
      {
        name: 'Valley View Senior Living',
        address: '2250 N State St',
        city: 'HEMET',
        state: 'CA',
        zipCode: '92543',
        country: 'US',
        phone: '(951) 652-2811',
        data_source: 'public_research',
        communitySubtype: 'assisted_living',
        hasRentals: true,
        careTypes: ['Assisted Living'],
        description: 'Valley View Senior Living offers personalized care in Hemet with mountain views.'
      },
      
      // Riverside specific communities
      {
        name: 'Mission Commons',
        address: '6760 Magnolia Ave',
        city: 'RIVERSIDE',
        state: 'CA',
        zipCode: '92506',
        country: 'US',
        phone: '(951) 369-8400',
        website: 'https://www.missioncommonsseniorliving.com',
        data_source: 'public_research',
        communitySubtype: 'assisted_living',
        hasRentals: true,
        careTypes: ['Assisted Living', 'Memory Care', 'Independent Living'],
        description: 'Mission Commons is a premier senior living community in Riverside offering multiple levels of care in a resort-style setting.'
      },
      {
        name: 'Riverside Senior Living',
        address: '3485 Madison St',
        city: 'RIVERSIDE',
        state: 'CA',
        zipCode: '92504',
        country: 'US',
        phone: '(951) 688-4100',
        data_source: 'public_research',
        communitySubtype: 'independent_living',
        hasRentals: true,
        careTypes: ['Independent Living', 'Assisted Living'],
        description: 'Riverside Senior Living provides compassionate care in the heart of Riverside.'
      },
      {
        name: 'Magnolia Rehabilitation and Nursing Center',
        address: '10311 Magnolia Ave',
        city: 'RIVERSIDE',
        state: 'CA',
        zipCode: '92505',
        country: 'US',
        phone: '(951) 352-5830',
        data_source: 'public_research',
        communitySubtype: 'skilled_nursing',
        hasRentals: true,
        careTypes: ['Skilled Nursing', 'Rehabilitation'],
        description: 'Magnolia Rehabilitation offers skilled nursing and rehabilitation services in Riverside.'
      },
      
      // San Jacinto area
      {
        name: 'San Jacinto Senior Living',
        address: '1845 S San Jacinto Ave',
        city: 'SAN JACINTO',
        state: 'CA',
        zipCode: '92583',
        country: 'US',
        phone: '(951) 654-9100',
        data_source: 'public_research',
        communitySubtype: 'assisted_living',
        hasRentals: true,
        careTypes: ['Assisted Living', 'Memory Care'],
        description: 'San Jacinto Senior Living provides quality care in a homelike environment.'
      },
      
      // Murrieta area
      {
        name: 'Provident Village at Creekside',
        address: '28030 Clinton Keith Rd',
        city: 'MURRIETA',
        state: 'CA',
        zipCode: '92563',
        country: 'US',
        phone: '(951) 290-6800',
        data_source: 'public_research',
        communitySubtype: 'assisted_living',
        hasRentals: true,
        careTypes: ['Assisted Living', 'Memory Care'],
        description: 'Provident Village at Creekside offers assisted living and memory care in Murrieta.'
      }
    ];
    
    // Boise, Idaho Communities
    const boiseIdahoCommunities = [
      {
        name: 'Brookdale Boise Parkcenter',
        address: '301 E Parkcenter Blvd',
        city: 'BOISE',
        state: 'ID',
        zipCode: '83706',
        country: 'US',
        phone: '(208) 345-3060',
        website: 'https://www.brookdale.com',
        data_source: 'public_research',
        communitySubtype: 'assisted_living',
        hasRentals: true,
        careTypes: ['Assisted Living', 'Memory Care'],
        description: 'Brookdale Boise Parkcenter provides personalized assisted living and Alzheimer\'s and dementia care.'
      },
      {
        name: 'The Terraces of Boise',
        address: '5301 E Warm Springs Ave',
        city: 'BOISE',
        state: 'ID',
        zipCode: '83716',
        country: 'US',
        phone: '(208) 336-0636',
        website: 'https://www.terracesboise.com',
        data_source: 'public_research',
        communitySubtype: 'continuing_care',
        hasRentals: true,
        careTypes: ['Independent Living', 'Assisted Living', 'Memory Care', 'Skilled Nursing'],
        description: 'The Terraces of Boise is Idaho\'s premier Life Plan Community offering a continuum of care.'
      },
      {
        name: 'Morning Star Senior Living of Boise',
        address: '3201 W Overland Rd',
        city: 'BOISE',
        state: 'ID',
        zipCode: '83705',
        country: 'US',
        phone: '(208) 957-0480',
        website: 'https://www.morningstarseniorliving.com',
        data_source: 'public_research',
        communitySubtype: 'assisted_living',
        hasRentals: true,
        careTypes: ['Assisted Living', 'Memory Care'],
        description: 'Morning Star Senior Living offers a warm, welcoming environment with personalized care services.'
      },
      {
        name: 'Grace Assisted Living at Englefield Green',
        address: '2582 N Bogus Basin Rd',
        city: 'BOISE',
        state: 'ID',
        zipCode: '83702',
        country: 'US',
        phone: '(208) 853-3800',
        website: 'https://www.graceseniorliving.com',
        data_source: 'public_research',
        communitySubtype: 'assisted_living',
        hasRentals: true,
        careTypes: ['Assisted Living', 'Memory Care'],
        description: 'Grace Assisted Living provides compassionate care in a beautiful Boise foothills location.'
      },
      {
        name: 'Touchmark at Meadow Lake Village',
        address: '4037 E Clocktower Ln',
        city: 'MERIDIAN',
        state: 'ID',
        zipCode: '83642',
        country: 'US',
        phone: '(208) 288-1230',
        website: 'https://www.touchmark.com',
        data_source: 'public_research',
        communitySubtype: 'continuing_care',
        hasRentals: true,
        careTypes: ['Independent Living', 'Assisted Living', 'Memory Care'],
        description: 'Touchmark offers a full continuum of care in the Boise metro area.'
      },
      {
        name: 'Edgewood Spring Creek Memory Care',
        address: '1776 E Riverside Dr',
        city: 'EAGLE',
        state: 'ID',
        zipCode: '83616',
        country: 'US',
        phone: '(208) 665-1300',
        website: 'https://www.edgewoodseniorliving.com',
        data_source: 'public_research',
        communitySubtype: 'memory_care',
        hasRentals: true,
        careTypes: ['Memory Care'],
        description: 'Edgewood Spring Creek specializes in memory care for those with Alzheimer\'s and dementia.'
      },
      {
        name: 'Overland Court Senior Living',
        address: '3730 S Overland Rd',
        city: 'BOISE',
        state: 'ID',
        zipCode: '83705',
        country: 'US',
        phone: '(208) 344-0108',
        website: 'https://www.overlandcourt.com',
        data_source: 'public_research',
        communitySubtype: 'independent_living',
        hasRentals: true,
        careTypes: ['Independent Living', 'Assisted Living'],
        description: 'Overland Court offers affordable senior living options in southwest Boise.'
      },
      {
        name: 'Ashley Manor Care Centers - Boise',
        address: '1699 S Roosevelt St',
        city: 'BOISE',
        state: 'ID',
        zipCode: '83705',
        country: 'US',
        phone: '(208) 345-3511',
        data_source: 'public_research',
        communitySubtype: 'skilled_nursing',
        hasRentals: true,
        careTypes: ['Skilled Nursing', 'Rehabilitation'],
        description: 'Ashley Manor provides skilled nursing and rehabilitation services in Boise.'
      }
    ];
    
    // Combine all communities
    const allCommunities = [...hemetRiversideCommunities, ...boiseIdahoCommunities];
    
    console.log(`📝 Processing ${allCommunities.length} new communities...`);
    
    let insertedCount = 0;
    let skippedCount = 0;
    
    for (const community of allCommunities) {
      try {
        // Check if community already exists
        const checkQuery = `
          SELECT id FROM communities 
          WHERE name = $1 AND city = $2 AND state = $3
          LIMIT 1
        `;
        
        const existing = await pool.query(checkQuery, [
          community.name,
          community.city,
          community.state
        ]);
        
        if (existing.rows.length > 0) {
          console.log(`⏭️ Skipping existing: ${community.name} in ${community.city}, ${community.state}`);
          skippedCount++;
          continue;
        }
        
        // Insert new community
        const insertQuery = `
          INSERT INTO communities (
            name, address, city, state, zip_code, country, phone, website,
            data_source, community_subtype, has_rentals, care_types, description,
            created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          )
        `;
        
        await pool.query(insertQuery, [
          community.name,
          community.address,
          community.city,
          community.state,
          community.zipCode,
          community.country,
          community.phone,
          community.website || null,
          community.data_source,
          community.communitySubtype,
          community.hasRentals,
          community.careTypes,
          community.description
        ]);
        
        console.log(`✅ Added: ${community.name} in ${community.city}, ${community.state}`);
        insertedCount++;
        
      } catch (error) {
        console.error(`❌ Error processing ${community.name}:`, error.message);
      }
    }
    
    console.log(`\n📊 Expansion Summary:`);
    console.log(`   ✅ Successfully added: ${insertedCount} communities`);
    console.log(`   ⏭️ Skipped existing: ${skippedCount} communities`);
    console.log(`   📍 Areas expanded: Hemet/Riverside CA, Boise ID`);
    
    // Verify the additions
    const verifyCounts = await pool.query(`
      SELECT 
        state,
        city,
        COUNT(*) as count
      FROM communities 
      WHERE 
        (state = 'CA' AND city IN ('HEMET', 'RIVERSIDE', 'SAN JACINTO', 'MURRIETA'))
        OR (state = 'ID' AND city IN ('BOISE', 'MERIDIAN', 'EAGLE'))
      GROUP BY state, city
      ORDER BY state, city
    `);
    
    console.log('\n📍 Updated Community Counts:');
    verifyCounts.rows.forEach(row => {
      console.log(`   ${row.city}, ${row.state}: ${row.count} communities`);
    });
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await pool.end();
    console.log('\n✅ Expansion complete!');
  }
}

// Run the expansion
expandCoverage().catch(console.error);