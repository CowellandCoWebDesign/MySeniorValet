/**
 * City-Based Batch Verification Service
 * Searches for all communities in a city at once for efficient verification
 */

import { db } from '../db';
import { communities } from '@shared/schema';
import { eq, sql, and, inArray } from 'drizzle-orm';
import { perplexityService } from '../perplexity-ai-service';

interface CityVerificationResult {
  city: string;
  state: string;
  communitiesFound: Array<{
    name: string;
    address?: string;
    phone?: string;
    website?: string;
  }>;
  searchSummary: string;
}

export class CityBatchVerifier {
  
  /**
   * Verify all communities in specific cities
   */
  async verifyCitiesBatch(targetCities: Array<{city: string, state: string}>, limit: number = 100): Promise<void> {
    console.log(`🚀 Starting city-based batch verification for ${targetCities.length} cities...`);
    
    let totalProcessed = 0;
    let totalVerified = 0;
    let totalCorrected = 0;
    
    for (const target of targetCities) {
      if (totalProcessed >= limit) break;
      
      console.log(`\n📍 Processing ${target.city}, ${target.state}...`);
      
      try {
        // Step 1: Get all unverified communities in this city
        const cityCommunitiesData = await db.select()
          .from(communities)
          .where(
            and(
              eq(communities.city, target.city),
              eq(communities.state, target.state),
              eq(communities.is_verified, false)
            )
          );
        
        if (cityCommunitiesData.length === 0) {
          console.log(`  No unverified communities in ${target.city}, ${target.state}`);
          continue;
        }
        
        console.log(`  Found ${cityCommunitiesData.length} unverified communities`);
        
        // Step 2: Search Perplexity for ALL senior living in this city
        const searchQuery = `list all senior living communities assisted living memory care nursing homes in ${target.city} ${target.state} with addresses phone numbers websites 2025`;
        
        const searchResults = await perplexityService.searchRealTime(searchQuery);
        const verificationResult = this.extractCityCommunitiesInfo(searchResults, target.city, target.state);
        
        // Step 3: Match our database communities with Perplexity results
        for (const dbCommunity of cityCommunitiesData) {
          if (totalProcessed >= limit) break;
          
          const match = this.findBestMatch(dbCommunity, verificationResult.communitiesFound);
          
          if (match) {
            // Community exists - update with correct info
            const updates: any = {
              is_verified: true,
              updated_at: new Date()
            };
            
            if (match.address && match.address !== dbCommunity.address) {
              updates.address = match.address;
              totalCorrected++;
            }
            if (match.phone && match.phone !== dbCommunity.phone) {
              updates.phone = match.phone;
              totalCorrected++;
            }
            if (match.website && !dbCommunity.website) {
              updates.website = match.website;
            }
            
            await db.update(communities)
              .set(updates)
              .where(eq(communities.id, dbCommunity.id));
            
            console.log(`  ✅ Verified: ${dbCommunity.name}`);
            totalVerified++;
          } else {
            // No match found - likely fake or needs manual review
            await db.update(communities)
              .set({
                ai_notes: `Not found in Perplexity search for ${target.city} communities`,
                updated_at: new Date()
              })
              .where(eq(communities.id, dbCommunity.id));
            
            console.log(`  ❓ Not found: ${dbCommunity.name}`);
          }
          
          totalProcessed++;
        }
        
        // Delay between cities
        await this.delay(3000);
        
      } catch (error) {
        console.error(`Error processing ${target.city}, ${target.state}:`, error);
      }
    }
    
    console.log('\n📊 City Batch Verification Complete!');
    console.log(`   Total Processed: ${totalProcessed}`);
    console.log(`   Verified: ${totalVerified}`);
    console.log(`   Corrected: ${totalCorrected}`);
  }
  
  /**
   * Extract community information from city search results
   */
  private extractCityCommunitiesInfo(searchResults: any, city: string, state: string): CityVerificationResult {
    const text = searchResults.summary || '';
    const communities: Array<{name: string, address?: string, phone?: string, website?: string}> = [];
    
    // Try to extract structured community listings
    // Look for patterns like "1. Community Name - Address, Phone"
    const listingPatterns = [
      /(?:\d+\.\s*)?([A-Z][^-\n]+?)\s*[-–]\s*([^,\n]+),?\s*(?:Phone:|Tel:?)?\s*(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})?/gm,
      /(?:•\s*)?([A-Z][^:,\n]+?)(?:\s*at\s*|\s*-\s*)([^,\n]+),?\s*(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})?/gm,
      /([A-Z][^,\n]{10,50})\s*(?:located at|at)?\s*(\d+[^,\n]+),?\s*([^,\n]*phone[^,\n]*)?/gmi
    ];
    
    for (const pattern of listingPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const name = match[1]?.trim();
        const address = match[2]?.trim();
        const phone = match[3]?.trim();
        
        if (name && !name.includes('©') && name.length > 5) {
          communities.push({
            name: this.cleanName(name),
            address: address || undefined,
            phone: this.cleanPhone(phone) || undefined
          });
        }
      }
    }
    
    // Also try to extract from sources if they're directory listings
    const sources = searchResults.sources || [];
    for (const source of sources) {
      if (source.includes('seniorliving') || source.includes('aplaceformom') || source.includes('caring.com')) {
        // These directories often have the community name in the URL
        const urlMatch = source.match(/\/([^\/]+?)-\d+$/);
        if (urlMatch) {
          const name = urlMatch[1].replace(/-/g, ' ');
          communities.push({ name: this.titleCase(name), website: source });
        }
      }
    }
    
    return {
      city,
      state,
      communitiesFound: communities,
      searchSummary: text.substring(0, 500)
    };
  }
  
  /**
   * Find best match between database community and search results
   */
  private findBestMatch(dbCommunity: any, foundCommunities: Array<{name: string, address?: string, phone?: string, website?: string}>): any {
    const dbNameLower = dbCommunity.name.toLowerCase();
    
    for (const found of foundCommunities) {
      const foundNameLower = found.name.toLowerCase();
      
      // Exact match
      if (dbNameLower === foundNameLower) {
        return found;
      }
      
      // Partial match (one contains the other)
      if (dbNameLower.includes(foundNameLower) || foundNameLower.includes(dbNameLower)) {
        return found;
      }
      
      // Key words match
      const dbWords = dbNameLower.split(/\s+/);
      const foundWords = foundNameLower.split(/\s+/);
      const commonWords = dbWords.filter(word => foundWords.includes(word) && word.length > 3);
      
      if (commonWords.length >= 2) {
        return found;
      }
    }
    
    return null;
  }
  
  /**
   * Get cities with most unverified communities
   */
  async getTopUnverifiedCities(limit: number = 10): Promise<Array<{city: string, state: string, count: number}>> {
    const result = await db.select({
      city: communities.city,
      state: communities.state,
      count: sql<number>`COUNT(*)`
    })
    .from(communities)
    .where(
      and(
        eq(communities.is_verified, false),
        sql`${communities.state} NOT IN ('NSW', 'VIC', 'QLD', 'BC', 'ON', 'QC')` // Skip international
      )
    )
    .groupBy(communities.city, communities.state)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(limit);
    
    return result.map(r => ({
      city: r.city,
      state: r.state,
      count: Number(r.count)
    }));
  }
  
  /**
   * Utility functions
   */
  private cleanName(name: string): string {
    return name
      .replace(/^\d+\.\s*/, '')
      .replace(/[•·]\s*/, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  private cleanPhone(phone: string | undefined): string | undefined {
    if (!phone) return undefined;
    const cleaned = phone.replace(/[^\d]/g, '');
    if (cleaned.length === 10) {
      return `${cleaned.slice(0,3)}-${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
    }
    return phone;
  }
  
  private titleCase(str: string): string {
    return str.replace(/\w\S*/g, txt => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const cityBatchVerifier = new CityBatchVerifier();