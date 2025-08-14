#!/usr/bin/env tsx
/**
 * Quick Chain Addition Script
 * Simple, fast, effective - just add known chains directly
 */

import { db } from "../db";
import { communities } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

// Major chains with estimated locations
const CHAINS_TO_ADD = [
  // Top 10 largest chains
  { name: 'Brookdale Senior Living', city: 'Nashville', state: 'TN', locations: 700 },
  { name: 'Sunrise Senior Living', city: 'McLean', state: 'VA', locations: 320 },
  { name: 'Holiday Retirement', city: 'Chicago', state: 'IL', locations: 260 },
  { name: 'Five Star Senior Living', city: 'Newton', state: 'MA', locations: 280 },
  { name: 'Atria Senior Living', city: 'Louisville', state: 'KY', locations: 200 },
  { name: 'Capital Senior Living', city: 'Dallas', state: 'TX', locations: 129 },
  { name: 'Enlivant', city: 'Chicago', state: 'IL', locations: 225 },
  { name: 'Life Care Services', city: 'Des Moines', state: 'IA', locations: 140 },
  { name: 'Discovery Senior Living', city: 'Bonita Springs', state: 'FL', locations: 250 },
  { name: 'Integral Senior Living', city: 'Carlsbad', state: 'CA', locations: 120 },
  
  // Regional chains
  { name: 'Aegis Living', city: 'Redmond', state: 'WA', locations: 35 },
  { name: 'Belmont Village', city: 'Houston', state: 'TX', locations: 30 },
  { name: 'Watermark Retirement Communities', city: 'Tucson', state: 'AZ', locations: 60 },
  { name: 'MBK Senior Living', city: 'Irvine', state: 'CA', locations: 120 },
  { name: 'Silverado', city: 'Irvine', state: 'CA', locations: 20 },
  { name: 'Benchmark Senior Living', city: 'Waltham', state: 'MA', locations: 60 },
  { name: 'Senior Lifestyle', city: 'Chicago', state: 'IL', locations: 150 },
  { name: 'Assisted Living Concepts', city: 'Menomonee Falls', state: 'WI', locations: 200 },
  { name: 'Emeritus Senior Living', city: 'Seattle', state: 'WA', locations: 480 },
  { name: 'Kindred Healthcare', city: 'Louisville', state: 'KY', locations: 100 }
];

async function addChains() {
  console.log('🚀 Quick Chain Addition - Direct & Simple');
  console.log('Adding major commercial chains as unclaimed communities\n');
  
  let added = 0;
  let skipped = 0;
  
  for (const chain of CHAINS_TO_ADD) {
    // Check if already exists
    const existing = await db
      .select()
      .from(communities) 
      .where(
        and(
          sql`LOWER(${communities.name}) = LOWER(${chain.name})`,
          eq(communities.city, chain.city),
          eq(communities.state, chain.state)
        )
      )
      .limit(1);
    
    if (existing.length > 0) {
      console.log(`⚠️  Skipped: ${chain.name} (already exists)`);
      skipped++;
      continue;
    }
    
    // Add the chain headquarters as a community
    try {
      await db.insert(communities).values({
        name: chain.name,
        address: `Corporate Office`,
        city: chain.city,
        state: chain.state,
        zip_code: '00000',
        phone: '000-000-0000',
        care_type: 'Assisted Living',
        care_types: ['Assisted Living', 'Memory Care', 'Independent Living'],
        description: `${chain.name} is a senior living provider with approximately ${chain.locations} communities across multiple states.`,
        status: 'Active',
        listing_type: 'Premium',
        is_claimed: false,
        // NO subscription_tier - stays NULL (unclaimed)
      });
      
      console.log(`✅ Added: ${chain.name} - ${chain.city}, ${chain.state}`);
      added++;
      
    } catch (error: any) {
      console.error(`❌ Error adding ${chain.name}:`, error.message);
    }
  }
  
  console.log(`\n✨ Complete! Added ${added} chains, skipped ${skipped} duplicates`);
  console.log('All added as UNCLAIMED - they must register to claim their listing');
}

// Run it
addChains().catch(console.error);