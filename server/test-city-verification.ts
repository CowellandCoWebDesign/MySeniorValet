/**
 * Test script to demonstrate city-based verification efficiency
 */

import { db } from './db';
import { communities } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

// Communities found in Houston from our Perplexity search
const houstonVerifiedCommunities = [
  { name: 'Silverado Hermann Park', address: 'Near Museum District', verified: true },
  { name: 'Seven Acres Jewish Senior Care Services', address: 'Southwest Houston', verified: true },
  { name: 'The Buckingham', address: 'Houston', verified: true },
  { name: 'Cypress Assisted Living', address: 'Cypress', verified: true },
  { name: 'StoneCreek of Copperfield', address: 'Longenbaugh Dr', phone: '(281) 247-6240', verified: true },
  { name: 'Holly Hall Retirement Community', address: 'Heart of Houston', verified: true },
  { name: 'Parkway Place', address: 'West Houston', verified: true },
  { name: 'The Tradition-Woodway', address: 'Houston', verified: true },
  { name: 'Brookdale Cypress Station', address: 'Houston', verified: true },
  { name: 'The Heritage of Clear Lake', address: 'Clear Lake', verified: true },
  { name: 'Pegasus Landing of Tanglewood', address: 'Tanglewood', verified: true },
  { name: 'Village of Meyerland', address: 'Meyerland', verified: true },
  { name: 'Clearwater at The Heights', address: 'The Heights', verified: true },
  { name: 'Brookdale Galleria', address: 'Houston', verified: true },
  { name: 'Casa Azul Skilled Nursing And Rehabilitation', address: 'Katy', verified: true },
  { name: 'Champions Healthcare at Willowbrook', address: 'Houston', verified: true },
  { name: 'Continuing Care at Eagles Trace', address: 'Houston', verified: true },
  { name: 'Texas Institute for Clinically Complex Care', address: '10851 Crescent Moon Dr', phone: '281-324-0572', verified: true },
  { name: 'La Hacienda Rehabilitation & Health Care Center', address: '3730 W. Orem Drive', verified: true },
  { name: 'Legend Oaks Healthcare and Rehabilitation - North', address: '12921 Misty Willow Dr', verified: true },
  { name: 'Legend Oaks Healthcare and Rehabilitation - West Houston', address: '7107 Queenston Blvd', verified: true },
  { name: 'Legend Oaks Healthcare and Rehabilitation Center', address: '15880 Wallisville Road', verified: true }
];

async function demonstrateCityVerification() {
  console.log('🎯 City-Based Verification Demonstration');
  console.log('=========================================\n');
  
  // Get unverified Houston communities
  const houstonUnverified = await db.select()
    .from(communities)
    .where(
      and(
        eq(communities.city, 'Houston'),
        eq(communities.state, 'TX'),
        eq(communities.is_verified, false)
      )
    );
  
  console.log(`📍 Houston, TX Status:`);
  console.log(`   Unverified communities: ${houstonUnverified.length}`);
  console.log(`   Communities found via Perplexity: ${houstonVerifiedCommunities.length}`);
  console.log(`   Efficiency gain: ${houstonUnverified.length}x (${houstonUnverified.length} searches → 1 search)\n`);
  
  let matchedCount = 0;
  let correctedCount = 0;
  
  // Match and update communities
  for (const dbCommunity of houstonUnverified.slice(0, 10)) { // Demo with first 10
    const match = houstonVerifiedCommunities.find(vc => {
      const dbNameLower = dbCommunity.name.toLowerCase();
      const vcNameLower = vc.name.toLowerCase();
      return dbNameLower.includes(vcNameLower.split(' ')[0]) || 
             vcNameLower.includes(dbNameLower.split(' ')[0]);
    });
    
    if (match) {
      console.log(`   ✅ Matched: ${dbCommunity.name}`);
      if (match.address && match.address !== dbCommunity.address) {
        console.log(`      📝 Address correction needed`);
        correctedCount++;
      }
      matchedCount++;
    } else {
      console.log(`   ❓ No match: ${dbCommunity.name} (needs review)`);
    }
  }
  
  console.log(`\n📊 Demo Results:`);
  console.log(`   Matched: ${matchedCount}/10`);
  console.log(`   Corrections needed: ${correctedCount}`);
  console.log(`   Efficiency: 1 search instead of ${houstonUnverified.length} searches`);
  console.log(`   Time saved: ~${(houstonUnverified.length * 3 - 3)} seconds`);
  console.log(`   API calls saved: ${houstonUnverified.length - 1}`);
}

// Run the demonstration
demonstrateCityVerification().catch(console.error);