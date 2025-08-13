#!/usr/bin/env tsx
/**
 * SIMPLE Commercial Chain Expansion Script
 * Keep it simple - small batches that actually work
 */

import { db } from '../db';
import { communities } from '../../shared/schema';
import { eq, sql } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

if (!PERPLEXITY_API_KEY) {
  console.error('❌ PERPLEXITY_API_KEY not found in environment variables');
  process.exit(1);
}

// Keep it SIMPLE - just the biggest chains
const TARGET_CHAINS = [
  'Brookdale Senior Living',
  'Sunrise Senior Living', 
  'Aegis Living'
];

// Start with just a few cities
const TARGET_CITIES = [
  { city: 'Houston', state: 'TX' },
  { city: 'San Antonio', state: 'TX' },
  { city: 'Dallas', state: 'TX' }
];

async function searchForChain(chainName: string, city: string, state: string) {
  console.log(`  Searching for ${chainName} in ${city}, ${state}...`);
  
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant. Provide only factual information.'
          },
          {
            role: 'user',
            content: `Does ${chainName} have a senior living community location in ${city}, ${state}? If yes, provide the community name and address. Keep response brief.`
          }
        ],
        temperature: 0.1,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      console.error(`    API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    
    // Simple check - if response contains an address or "located at"
    if (content.includes('located at') || content.includes('address')) {
      console.log(`    ✅ Found ${chainName} location!`);
      return {
        name: `${chainName} ${city}`,
        city: city,
        state: state,
        address: 'Verification pending',
        chain_name: chainName
      };
    }
    
    console.log(`    ❌ No ${chainName} found in ${city}`);
    return null;
    
  } catch (error) {
    console.error(`    Error searching: ${error}`);
    return null;
  }
}

async function main() {
  console.log('🚀 SIMPLE Commercial Chain Expansion\n');
  
  let addedCount = 0;
  
  for (const location of TARGET_CITIES) {
    console.log(`\n📍 Processing ${location.city}, ${location.state}:`);
    
    for (const chain of TARGET_CHAINS) {
      const result = await searchForChain(chain, location.city, location.state);
      
      if (result) {
        try {
          // Check if already exists
          const existing = await db.select()
            .from(communities)
            .where(sql`name = ${result.name} AND city = ${result.city}`)
            .limit(1);
          
          if (existing.length === 0) {
            // Add to database with minimal fields
            await db.insert(communities).values({
              name: result.name,
              city: result.city,
              state: result.state,
              address: result.address,
              care_types: ['Assisted Living'],
              ai_enrichment_version: 'simple-expansion-v1',
              ai_enrichment_date: new Date()
            });
            
            console.log(`    ✨ Added ${result.name} to database`);
            addedCount++;
          } else {
            console.log(`    ⚠️ ${result.name} already exists`);
          }
        } catch (error) {
          console.error(`    Database error: ${error}`);
        }
      }
      
      // Be respectful with API rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log(`\n✅ Expansion complete! Added ${addedCount} new communities.`);
  process.exit(0);
}

main().catch(console.error);