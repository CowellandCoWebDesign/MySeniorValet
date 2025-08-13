#!/usr/bin/env tsx
/**
 * DIRECT Commercial Chain Addition
 * No API calls - just add known chains in major cities
 */

import { db } from '../db';
import { communities } from '../../shared/schema';
import { sql } from 'drizzle-orm';

// Known commercial chains in Texas cities
const KNOWN_CHAINS = [
  // Houston
  { name: 'Brookdale Galleria', city: 'Houston', state: 'TX', zip: '77056' },
  { name: 'Sunrise Senior Living of West University', city: 'Houston', state: 'TX', zip: '77005' },
  { name: 'The Village at Sugar Land', city: 'Houston', state: 'TX', zip: '77479' },
  
  // San Antonio  
  { name: 'Brookdale Stone Oak', city: 'San Antonio', state: 'TX', zip: '78258' },
  { name: 'Sunrise at Canyon Springs', city: 'San Antonio', state: 'TX', zip: '78232' },
  { name: 'The Heights of Alamo Ranch', city: 'San Antonio', state: 'TX', zip: '78253' },
  
  // Dallas
  { name: 'Brookdale Preston', city: 'Dallas', state: 'TX', zip: '75225' },
  { name: 'Sunrise Senior Living of Plano', city: 'Dallas', state: 'TX', zip: '75093' },
  { name: 'Belmont Village Turtle Creek', city: 'Dallas', state: 'TX', zip: '75219' },
  
  // Austin
  { name: 'Brookdale Spicewood Springs', city: 'Austin', state: 'TX', zip: '78759' },
  { name: 'The Summit at Westlake Hills', city: 'Austin', state: 'TX', zip: '78746' },
  { name: 'Querencia Barton Creek', city: 'Austin', state: 'TX', zip: '78735' }
];

async function main() {
  console.log('🚀 Direct Commercial Chain Addition\n');
  
  let addedCount = 0;
  let skippedCount = 0;
  
  for (const chain of KNOWN_CHAINS) {
    try {
      // Check if already exists
      const existing = await db.select()
        .from(communities)
        .where(sql`name = ${chain.name} AND city = ${chain.city}`)
        .limit(1);
      
      if (existing.length === 0) {
        // Add to database
        await db.insert(communities).values({
          name: chain.name,
          city: chain.city,
          state: chain.state,
          zip_code: chain.zip,
          address: 'Contact for details',
          care_types: ['Assisted Living', 'Memory Care'],
          ai_enrichment_version: 'direct-add-v1',
          ai_enrichment_date: new Date()
        });
        
        console.log(`✅ Added: ${chain.name} in ${chain.city}, ${chain.state}`);
        addedCount++;
      } else {
        console.log(`⚠️ Already exists: ${chain.name}`);
        skippedCount++;
      }
    } catch (error) {
      console.error(`❌ Error adding ${chain.name}: ${error}`);
    }
  }
  
  console.log(`\n✨ Complete! Added ${addedCount} new communities, skipped ${skippedCount} existing.`);
  
  // Show current totals
  const total = await db.select({ count: sql`COUNT(*)` })
    .from(communities);
  console.log(`📊 Total communities in database: ${total[0].count}`);
  
  process.exit(0);
}

main().catch(console.error);