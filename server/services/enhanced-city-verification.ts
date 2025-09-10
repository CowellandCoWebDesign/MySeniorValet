/**
 * Enhanced City Verification Service
 * Uses Perplexity's web search to find ALL communities in a city at once
 */

import { db } from '../db';
import { eq, and, sql, inArray } from 'drizzle-orm';
import { communities } from '../../shared/schema';
import { SimplifiedPerplexityService } from '../simplified-perplexity-service';

interface BulkCommunityData {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  phone?: string;
  website?: string;
  careTypes?: string[];
  pricing?: {
    assistedLiving?: string;
    memoryCare?: string;
    independentLiving?: string;
  };
  capacity?: number;
  yearEstablished?: number;
  operator?: string;
  certifications?: string[];
}

export class EnhancedCityVerification {
  private perplexityService: SimplifiedPerplexityService;
  
  constructor() {
    this.perplexityService = new SimplifiedPerplexityService();
  }
  
  /**
   * Search for ALL communities in a city using a single comprehensive Perplexity search
   */
  async searchAllCommunitiesInCity(city: string, state: string): Promise<BulkCommunityData[]> {
    console.log(`\n🌐 ENHANCED BULK SEARCH: ${city}, ${state}`);
    console.log(`Using Perplexity's live web search to discover ALL communities...`);
    
    // Comprehensive search query
    const searchQuery = `
    Find ALL senior living communities in ${city}, ${state}. This is a comprehensive data collection request.
    
    Search ALL of these sources:
    1. Official state licensing databases for ${state}
    2. Medicare.gov Nursing Home Compare
    3. AHCA (American Health Care Association) member directories
    4. Leading Senior Living directories (A Place for Mom, Caring.com, SeniorAdvisor.com)
    5. Major chain websites (Brookdale, Sunrise, Atria, Holiday, Capital Senior, Enlivant, etc.)
    6. Local ${city} senior services websites
    7. ${city} Chamber of Commerce business directories
    8. Google Maps listings for "${city} ${state} senior living"
    
    Include ALL types:
    - Assisted Living Facilities
    - Memory Care Units
    - Independent Living Communities
    - Nursing Homes/Skilled Nursing
    - Continuing Care Retirement Communities (CCRCs)
    - 55+ Active Adult Communities
    - Adult Family Homes
    - Residential Care Homes
    
    For EACH community found, provide in a structured format:
    
    COMMUNITY NAME: [Exact name]
    ADDRESS: [Full street address]
    CITY: ${city}
    STATE: ${state}
    ZIP: [Zip code]
    PHONE: [Main phone number formatted XXX-XXX-XXXX]
    WEBSITE: [Official website URL with https://]
    CARE TYPES: [List all: Assisted Living, Memory Care, etc.]
    PRICING:
      - Assisted Living: $[amount]/month
      - Memory Care: $[amount]/month  
      - Independent Living: $[amount]/month
    CAPACITY: [Number of units/beds]
    YEAR ESTABLISHED: [Year opened]
    OPERATOR/OWNER: [Management company or owner]
    CERTIFICATIONS: [Medicare, Medicaid, other certifications]
    
    IMPORTANT: 
    - List EVERY community you can find, aim for completeness
    - Include small residential care homes AND large communities
    - Don't skip any - we need a complete inventory
    - If you find references to communities but limited details, still list them
    - Check multiple sources to ensure no community is missed
    
    Format the response as a numbered list for easy parsing.
    Expected: 50-200+ communities for major cities, 10-50 for smaller cities.`;
    
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [
            {
              role: 'system',
              content: `You are a comprehensive data collector for senior living communities. 
Your goal is to find EVERY SINGLE senior living community in the specified city.
Be thorough, check multiple sources, and provide complete listings.
Format each entry consistently for easy parsing.`
            },
            {
              role: 'user',
              content: searchQuery
            }
          ],
          temperature: 0.1,
          max_tokens: 4000, // Increased for comprehensive results
          stream: false,
          return_citations: true,
          search_domain_filter: [],
          top_k: 20, // Get more search results
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      const citations = data.citations || [];
      
      console.log(`📚 Sources consulted: ${citations.length}`);
      citations.forEach((cite: string, i: number) => {
        console.log(`  ${i + 1}. ${cite}`);
      });
      
      // Parse the response to extract community data
      const communities = this.parseCommunitiesFromResponse(content);
      
      console.log(`✅ Found ${communities.length} communities in ${city}, ${state}`);
      
      return communities;
      
    } catch (error) {
      console.error('Bulk search failed:', error);
      return [];
    }
  }
  
  /**
   * Parse structured community data from Perplexity response
   */
  private parseCommunitiesFromResponse(content: string): BulkCommunityData[] {
    const communities: BulkCommunityData[] = [];
    
    // Split by numbered entries or community blocks
    const blocks = content.split(/\d+\.\s+|\nCOMMUNITY NAME:/);
    
    for (const block of blocks) {
      if (!block.trim()) continue;
      
      const community: Partial<BulkCommunityData> = {};
      
      // Extract name
      const nameMatch = block.match(/(?:COMMUNITY NAME|^):\s*([^\n]+)/i) || 
                       block.match(/^([^:\n]+?)(?:\n|ADDRESS:|$)/);
      if (nameMatch) {
        community.name = nameMatch[1].trim();
      }
      
      // Extract address
      const addressMatch = block.match(/ADDRESS:\s*([^\n]+)/i);
      if (addressMatch) {
        community.address = addressMatch[1].trim();
      }
      
      // Extract city
      const cityMatch = block.match(/CITY:\s*([^\n]+)/i);
      if (cityMatch) {
        community.city = cityMatch[1].trim();
      }
      
      // Extract state
      const stateMatch = block.match(/STATE:\s*([^\n]+)/i);
      if (stateMatch) {
        community.state = stateMatch[1].trim();
      }
      
      // Extract zip
      const zipMatch = block.match(/ZIP(?:\s*CODE)?:\s*(\d{5}(?:-\d{4})?)/i);
      if (zipMatch) {
        community.zipCode = zipMatch[1];
      }
      
      // Extract phone
      const phoneMatch = block.match(/PHONE:\s*([\d-\(\)\s\.]+)/i);
      if (phoneMatch) {
        community.phone = phoneMatch[1].replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
      }
      
      // Extract website
      const websiteMatch = block.match(/WEBSITE:\s*(https?:\/\/[^\s\n]+)/i);
      if (websiteMatch) {
        community.website = websiteMatch[1];
      }
      
      // Extract care types
      const careTypesMatch = block.match(/CARE TYPES?:\s*([^\n]+)/i);
      if (careTypesMatch) {
        community.careTypes = careTypesMatch[1].split(/[,;]/).map(s => s.trim()).filter(Boolean);
      }
      
      // Extract pricing
      const pricingSection = block.match(/PRICING:[\s\S]*?(?=\n[A-Z]+:|$)/i);
      if (pricingSection) {
        const pricing: any = {};
        
        const alMatch = pricingSection[0].match(/Assisted Living:\s*\$?([\d,]+)/i);
        if (alMatch) pricing.assistedLiving = `$${alMatch[1]}`;
        
        const mcMatch = pricingSection[0].match(/Memory Care:\s*\$?([\d,]+)/i);
        if (mcMatch) pricing.memoryCare = `$${mcMatch[1]}`;
        
        const ilMatch = pricingSection[0].match(/Independent Living:\s*\$?([\d,]+)/i);
        if (ilMatch) pricing.independentLiving = `$${ilMatch[1]}`;
        
        if (Object.keys(pricing).length > 0) {
          community.pricing = pricing;
        }
      }
      
      // Extract capacity
      const capacityMatch = block.match(/CAPACITY:\s*(\d+)/i);
      if (capacityMatch) {
        community.capacity = parseInt(capacityMatch[1]);
      }
      
      // Extract year
      const yearMatch = block.match(/YEAR (?:ESTABLISHED|OPENED):\s*(\d{4})/i);
      if (yearMatch) {
        community.yearEstablished = parseInt(yearMatch[1]);
      }
      
      // Extract operator
      const operatorMatch = block.match(/(?:OPERATOR|OWNER|MANAGEMENT):\s*([^\n]+)/i);
      if (operatorMatch) {
        community.operator = operatorMatch[1].trim();
      }
      
      // Only add if we have at least a name
      if (community.name && community.name.length > 2) {
        communities.push(community as BulkCommunityData);
      }
    }
    
    // Also try to parse less structured formats
    if (communities.length === 0) {
      // Try line-by-line parsing for simple lists
      const lines = content.split('\n');
      for (const line of lines) {
        const simpleMatch = line.match(/^\d*\.?\s*(.+?)\s*[-–]\s*(.+)/);
        if (simpleMatch) {
          const [, name, rest] = simpleMatch;
          const addressMatch = rest.match(/(\d+.+?)(?:,|$)/);
          communities.push({
            name: name.trim(),
            address: addressMatch ? addressMatch[1].trim() : rest.trim(),
            city: '',
            state: ''
          });
        }
      }
    }
    
    return communities;
  }
  
  /**
   * Update database with bulk discovered communities
   */
  async updateDatabaseWithBulkResults(
    cityName: string, 
    stateName: string, 
    discoveredCommunities: BulkCommunityData[]
  ): Promise<{
    added: number;
    updated: number;
    skipped: number;
  }> {
    const stats = { added: 0, updated: 0, skipped: 0 };
    
    console.log(`\n📊 Processing ${discoveredCommunities.length} discovered communities...`);
    
    for (const discovered of discoveredCommunities) {
      try {
        // Check if community exists
        const existing = await db
          .select()
          .from(communities)
          .where(and(
            eq(communities.name, discovered.name),
            eq(communities.city, cityName),
            eq(communities.state, stateName)
          ))
          .limit(1);
        
        if (existing.length > 0) {
          // Update existing community with new data
          const updates: any = {
            isVerified: true,
            updated_at: new Date()
          };
          
          // Only update fields if we have better data
          if (discovered.address && !existing[0].address) {
            updates.address = discovered.address;
          }
          if (discovered.phone && !existing[0].phone) {
            updates.phone = discovered.phone;
          }
          if (discovered.website && !existing[0].website) {
            updates.website = discovered.website;
          }
          if (discovered.zipCode && !existing[0].zip) {
            updates.zip = discovered.zipCode;
          }
          if (discovered.pricing?.assistedLiving) {
            updates.assisted_living_pricing = discovered.pricing.assistedLiving;
          }
          if (discovered.pricing?.memoryCare) {
            updates.memory_care_pricing = discovered.pricing.memoryCare;
          }
          if (discovered.pricing?.independentLiving) {
            updates.independent_living_pricing = discovered.pricing.independentLiving;
          }
          
          await db
            .update(communities)
            .set(updates)
            .where(eq(communities.id, existing[0].id));
          
          stats.updated++;
          console.log(`  ✅ Updated: ${discovered.name}`);
          
        } else {
          // Add new community
          await db.insert(communities).values({
            name: discovered.name,
            address: discovered.address || '',
            city: cityName,
            state: stateName,
            zip: discovered.zipCode,
            phone: discovered.phone,
            website: discovered.website,
            care_level: discovered.careTypes?.join(', '),
            assisted_living_pricing: discovered.pricing?.assistedLiving,
            memory_care_pricing: discovered.pricing?.memoryCare,
            independent_living_pricing: discovered.pricing?.independentLiving,
            total_capacity: discovered.capacity?.toString(),
            year_established: discovered.yearEstablished,
            corporate_owner: discovered.operator,
            isVerified: true,
            ai_analysis_version: 'bulk_discovery_v1',
            latitude: 0,
            longitude: 0,
            created_at: new Date(),
            updated_at: new Date()
          });
          
          stats.added++;
          console.log(`  ➕ Added: ${discovered.name}`);
        }
        
      } catch (error: any) {
        console.error(`  ❌ Error processing ${discovered.name}:`, error.message);
        stats.skipped++;
      }
    }
    
    console.log(`\n📈 Bulk Update Complete:`);
    console.log(`  - Added: ${stats.added} new communities`);
    console.log(`  - Updated: ${stats.updated} existing communities`);
    console.log(`  - Skipped: ${stats.skipped} due to errors`);
    
    return stats;
  }
  
  /**
   * Main method to verify entire city at once
   */
  async verifyEntireCity(city: string, state: string) {
    console.log(`\n🚀 STARTING ENHANCED CITY VERIFICATION: ${city}, ${state}`);
    console.log(`This will search for ALL communities in the city using live web data...`);
    
    const startTime = Date.now();
    
    // Step 1: Search for all communities
    const discoveredCommunities = await this.searchAllCommunitiesInCity(city, state);
    
    if (discoveredCommunities.length === 0) {
      console.log(`⚠️ No communities found for ${city}, ${state}`);
      return {
        success: false,
        message: 'No communities discovered',
        stats: { added: 0, updated: 0, skipped: 0 }
      };
    }
    
    // Step 2: Update database with results
    const stats = await this.updateDatabaseWithBulkResults(city, state, discoveredCommunities);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    return {
      success: true,
      message: `Verified ${city}, ${state} in ${duration} seconds`,
      discoveredCount: discoveredCommunities.length,
      stats,
      duration
    };
  }
}

export const enhancedCityVerification = new EnhancedCityVerification();