import { db } from '../db';
import { communities } from '../../shared/schema';
import { PerplexityAIService } from '../perplexity-ai-service';
import { eq, and, sql } from 'drizzle-orm';

// Simple continuous processor
async function processSimple() {
  const perplexity = new PerplexityAIService();
  
  // Cities with known gaps
  const targetCities = [
    { city: 'Atlanta', state: 'GA', expected: 167 },
    { city: 'New York', state: 'NY', expected: 161 },
    { city: 'Grand Forks', state: 'ND', expected: 149 },
    { city: 'Casper', state: 'WY', expected: 148 },
    { city: 'Fargo', state: 'ND', expected: 145 },
    { city: 'Bismarck', state: 'ND', expected: 122 },
    { city: 'Dallas', state: 'TX', expected: 131 },
    { city: 'Houston', state: 'TX', expected: 152 },
    { city: 'Cheyenne', state: 'WY', expected: 69 },
    { city: 'Sioux Falls', state: 'SD', expected: 100 },
    { city: 'Billings', state: 'MT', expected: 51 },
    { city: 'Anchorage', state: 'AK', expected: 99 },
    { city: 'Honolulu', state: 'HI', expected: 91 }
  ];
  
  console.log('🔄 SIMPLE CONTINUOUS PROCESSOR');
  console.log('================================\n');
  
  for (const target of targetCities) {
    // Check current count
    const result = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(communities)
      .where(
        and(
          eq(communities.city, target.city),
          eq(communities.state, target.state)
        )
      );
    
    const current = Number(result[0]?.count || 0);
    const needed = target.expected - current;
    
    if (needed > 0) {
      console.log(`📍 ${target.city}, ${target.state}: Has ${current}, needs ${needed} more`);
      
      // Discover facilities
      const query = `List ${needed} more senior living facilities in ${target.city}, ${target.state} that I haven't mentioned yet. Include facility names only.`;
      
      try {
        const searchResult = await perplexity.searchRealTime(query);
        const text = searchResult.summary || '';
        
        // Parse names
        const names: string[] = [];
        const lines = text.split('\n');
        
        for (const line of lines) {
          const cleaned = line
            .replace(/^\d+[\.)]\s*/, '')
            .replace(/^[-•*]\s*/, '')
            .replace(/\*\*/g, '')
            .trim();
          
          if (cleaned && cleaned.length > 3 && cleaned.length < 100) {
            names.push(cleaned);
          }
        }
        
        // Process each facility
        let added = 0;
        for (const name of names.slice(0, 5)) { // Process up to 5 at a time
          // Check if exists
          const exists = await db
            .select()
            .from(communities)
            .where(
              and(
                sql`LOWER(${communities.name}) = LOWER(${name})`,
                eq(communities.city, target.city),
                eq(communities.state, target.state)
              )
            )
            .limit(1);
          
          if (exists.length === 0) {
            // Get address
            const detailQuery = `What is the street address for "${name}" in ${target.city}, ${target.state}?`;
            const detailResult = await perplexity.searchRealTime(detailQuery);
            const detailText = detailResult.summary || '';
            
            // Extract address
            const addressMatch = detailText.match(/(\d+\s+[A-Za-z0-9\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Way)\.?)/i);
            
            if (addressMatch) {
              await db.insert(communities).values({
                name: name,
                slug: `${name}-${target.city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                address: addressMatch[1].trim(),
                city: target.city,
                state: target.state,
                zip_code: 'Contact for details',
                phone: 'Call for details',
                care_type: 'Assisted Living',
                care_types: ['Assisted Living'],
                description: `${name} is a senior care facility in ${target.city}, ${target.state}.`,
                verified: false,
                is_active: true,
                metadata: {
                  source: 'simple_processor',
                  date: new Date().toISOString()
                }
              });
              
              added++;
              console.log(`   ✅ Added: ${name}`);
            }
          }
          
          await new Promise(r => setTimeout(r, 1500)); // Rate limit
        }
        
        if (added > 0) {
          console.log(`   Total added: ${added}\n`);
        }
        
      } catch (error) {
        console.error(`   Error: ${error}\n`);
      }
      
      await new Promise(r => setTimeout(r, 3000)); // Pause between cities
    }
  }
  
  console.log('✅ Processing cycle complete');
}

// Run once
async function main() {
  await processSimple();
  console.log('\n✅ Processing complete\n');
  process.exit(0);
}

main();