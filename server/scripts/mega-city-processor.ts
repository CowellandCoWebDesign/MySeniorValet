import { db } from '../db';
import { communities } from '../../shared/schema';
import { PerplexityAIService } from '../perplexity-ai-service';
import { eq, and, sql } from 'drizzle-orm';

// Mega processor for top US metros
class MegaCityProcessor {
  private perplexity: PerplexityAIService;
  private totalAdded = 0;
  
  constructor() {
    this.perplexity = new PerplexityAIService();
  }

  async processTopMetros() {
    console.log(`\n🚀 MEGA CITY PROCESSOR - TOP US METROS`);
    console.log(`==========================================\n`);
    
    // Top 20 US metros by population
    const topMetros = [
      { city: 'Los Angeles', state: 'CA' },
      { city: 'Chicago', state: 'IL' },
      { city: 'Philadelphia', state: 'PA' },
      { city: 'Miami', state: 'FL' },
      { city: 'Boston', state: 'MA' },
      { city: 'San Francisco', state: 'CA' },
      { city: 'Washington', state: 'DC' },
      { city: 'Detroit', state: 'MI' },
      { city: 'Minneapolis', state: 'MN' },
      { city: 'San Diego', state: 'CA' },
      { city: 'Tampa', state: 'FL' },
      { city: 'Orlando', state: 'FL' },
      { city: 'Charlotte', state: 'NC' },
      { city: 'Portland', state: 'OR' },
      { city: 'Sacramento', state: 'CA' },
      { city: 'Pittsburgh', state: 'PA' },
      { city: 'Cincinnati', state: 'OH' },
      { city: 'Kansas City', state: 'MO' },
      { city: 'Columbus', state: 'OH' },
      { city: 'Indianapolis', state: 'IN' }
    ];
    
    for (const metro of topMetros) {
      await this.processCity(metro.city, metro.state);
      await new Promise(r => setTimeout(r, 2000)); // Rate limit
    }
    
    console.log(`\n✅ MEGA PROCESSING COMPLETE!`);
    console.log(`   Total Added: ${this.totalAdded}`);
  }

  private async processCity(city: string, state: string): Promise<void> {
    console.log(`\n📍 Processing ${city}, ${state}...`);
    
    try {
      // Get existing count
      const existing = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(communities)
        .where(
          and(
            eq(communities.city, city),
            eq(communities.state, state)
          )
        );
      
      const currentCount = Number(existing[0]?.count || 0);
      console.log(`   Current: ${currentCount} facilities`);
      
      // Discover new facilities
      const query = `List ALL senior living facilities in ${city}, ${state}. Include assisted living, memory care, nursing homes, independent living, retirement communities. Give me a comprehensive list of facility names.`;
      
      const result = await this.perplexity.searchRealTime(query);
      const text = result.summary || '';
      
      // Parse facilities
      const facilities: string[] = [];
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
          facilities.push(cleaned);
        }
      }
      
      const uniqueFacilities = [...new Set(facilities)];
      console.log(`   Discovered: ${uniqueFacilities.length} facilities`);
      
      // Check which are new
      let added = 0;
      for (const name of uniqueFacilities.slice(0, 10)) { // Process up to 10 per city
        const exists = await db
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
        
        if (exists.length === 0) {
          // Get details and add
          const details = await this.enrichFacility(name, city, state);
          if (details) {
            await db.insert(communities).values(details);
            added++;
          }
        }
        
        await new Promise(r => setTimeout(r, 1000)); // Rate limit
      }
      
      if (added > 0) {
        this.totalAdded += added;
        console.log(`   ✅ Added: ${added} new facilities`);
      } else {
        console.log(`   ⏭️ Already complete`);
      }
      
    } catch (error) {
      console.error(`   ❌ Error:`, error);
    }
  }

  private async enrichFacility(name: string, city: string, state: string): Promise<any | null> {
    const query = `Find the exact address for "${name}" senior living facility in ${city}, ${state}.`;
    
    try {
      const result = await this.perplexity.searchRealTime(query);
      const text = result.summary || '';
      
      // Extract address
      const addressMatch = text.match(/(\d+\s+[A-Za-z0-9\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Way|Lane|Ln)\.?)/i);
      if (!addressMatch) return null;
      
      // Extract phone
      let phone = 'Call for details';
      const phoneMatch = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
      if (phoneMatch) {
        const digits = phoneMatch[0].replace(/\D/g, '');
        if (digits.length === 10) {
          phone = `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}`;
        }
      }
      
      return {
        name: name,
        slug: `${name}-${city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        address: addressMatch[1].trim(),
        city: city,
        state: state,
        zip_code: 'Contact for details',
        phone: phone,
        care_type: 'Assisted Living',
        care_types: ['Assisted Living'],
        description: `${name} is a senior living community in ${city}, ${state}.`,
        verified: false,
        is_active: true,
        metadata: {
          source: 'mega_city_processor',
          date: new Date().toISOString()
        }
      };
    } catch (error) {
      return null;
    }
  }
}

// Run it
async function main() {
  const processor = new MegaCityProcessor();
  await processor.processTopMetros();
  process.exit(0);
}

main();