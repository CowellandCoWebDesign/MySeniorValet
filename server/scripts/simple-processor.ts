import { db } from '../db';
import { communities } from '../../shared/schema';
import { PerplexityAIService } from '../perplexity-ai-service';
import { eq, and, sql } from 'drizzle-orm';

// Simple, direct processor - no fancy features, just get facilities into database
class SimpleProcessor {
  private perplexity: PerplexityAIService;
  private processedCount = 0;
  private skippedCount = 0;
  
  constructor() {
    this.perplexity = new PerplexityAIService();
  }

  async processCity(city: string, state: string) {
    console.log(`\n🎯 SIMPLE PROCESSOR FOR ${city}, ${state}`);
    console.log(`==================================`);
    
    // Get a list of facilities
    const facilities = await this.discoverFacilities(city, state);
    console.log(`📋 Found ${facilities.length} facilities to process\n`);
    
    // Process each one
    for (let i = 0; i < facilities.length; i++) {
      const name = facilities[i];
      
      // Check if exists
      const exists = await this.checkExists(name, city, state);
      if (exists) {
        this.skippedCount++;
        console.log(`[${i+1}/${facilities.length}] ⏭️ ${name} (exists)`);
        continue;
      }
      
      // Get details and add
      console.log(`[${i+1}/${facilities.length}] 📍 Processing ${name}...`);
      const added = await this.processOne(name, city, state);
      if (added) {
        this.processedCount++;
        console.log(`   ✅ Added`);
      } else {
        console.log(`   ❌ Failed`);
      }
      
      // Rate limit
      await new Promise(r => setTimeout(r, 1500));
    }
    
    console.log(`\n✅ COMPLETE!`);
    console.log(`   Added: ${this.processedCount}`);
    console.log(`   Skipped: ${this.skippedCount}`);
  }

  private async discoverFacilities(city: string, state: string): Promise<string[]> {
    const query = `List ALL senior living, assisted living, nursing home, and memory care facilities in ${city}, ${state}.
    Give me just the facility names, one per line. Include ALL facilities you know about.`;
    
    try {
      const result = await this.perplexity.searchRealTime(query);
      const text = result.summary || '';
      
      // Parse names
      const names: string[] = [];
      const lines = text.split('\n');
      
      for (const line of lines) {
        const cleaned = line
          .replace(/^\d+[\.)]\s*/, '')
          .replace(/^[-•*]\s*/, '')
          .replace(/\*\*/g, '')
          .trim();
        
        if (cleaned && 
            cleaned.length > 3 && 
            cleaned.length < 100 &&
            !cleaned.match(/^(here|these|the following|list of)/i)) {
          names.push(cleaned);
        }
      }
      
      return [...new Set(names)]; // unique only
    } catch (error) {
      console.error('Discovery error:', error);
      return [];
    }
  }

  private async checkExists(name: string, city: string, state: string): Promise<boolean> {
    const existing = await db
      .select()
      .from(communities)
      .where(
        and(
          sql`LOWER(${communities.name}) = LOWER(${name})`,
          eq(communities.city, city),
          eq(communities.state, state)
        )
      )
      .limit(1);
    
    return existing.length > 0;
  }

  private async processOne(name: string, city: string, state: string): Promise<boolean> {
    const query = `Find the exact address and phone number for "${name}" in ${city}, ${state}.
    This is a real senior living facility. Provide the actual street address and phone.`;
    
    try {
      const result = await this.perplexity.searchRealTime(query);
      const text = result.summary || '';
      
      // Extract address
      const addressMatch = text.match(/(\d+\s+[A-Za-z0-9\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Way|Lane|Ln|Court|Ct)\.?)/i);
      if (!addressMatch) return false;
      
      // Extract phone (optional)
      let phone = 'Call for details';
      const phoneMatch = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
      if (phoneMatch) {
        const digits = phoneMatch[0].replace(/\D/g, '');
        if (digits.length === 10) {
          phone = `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}`;
        }
      }
      
      // Extract ZIP (optional)
      const zipMatch = text.match(/\b(\d{5})\b/);
      const zip = zipMatch ? zipMatch[1] : 'Contact for details';
      
      // Determine care type
      let careType = 'Assisted Living';
      if (text.match(/memory care/i)) careType = 'Memory Care';
      else if (text.match(/nursing home/i)) careType = 'Nursing Home';
      else if (text.match(/independent living/i)) careType = 'Independent Living';
      
      // Add to database
      await db.insert(communities).values({
        name,
        slug: `${name}-${city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        address: addressMatch[1].trim(),
        city,
        state,
        zip_code: zip,
        phone,
        care_type: careType,
        care_types: [careType],
        description: `${name} is a ${careType} community in ${city}, ${state}.`,
        verified: false,
        is_active: true,
        metadata: {
          source: 'simple_processor',
          date: new Date().toISOString()
        }
      });
      
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Run it
async function main() {
  const [city, state] = process.argv.slice(2);
  
  if (!city || !state) {
    console.log('Usage: tsx simple-processor.ts "City" "ST"');
    process.exit(1);
  }
  
  const processor = new SimpleProcessor();
  await processor.processCity(city, state);
  process.exit(0);
}

main();