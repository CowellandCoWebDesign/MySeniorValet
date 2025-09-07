/**
 * Batch Perplexity Verification Service
 * Systematically verifies and corrects community data at scale
 */

import { db } from '../db';
import { communities } from '@shared/schema';
import { eq, sql, and, or, isNull } from 'drizzle-orm';
import { perplexityService } from '../perplexity-ai-service';

interface VerificationResult {
  id: number;
  name: string;
  exists: boolean;
  confidence: number;
  correctAddress?: string;
  correctCity?: string;
  correctState?: string;
  correctZipCode?: string;
  correctPhone?: string;
  website?: string;
  aiNotes?: string;
}

export class BatchPerplexityVerifier {
  private readonly BATCH_SIZE = 10; // Process 10 at a time to avoid rate limits
  private readonly DELAY_BETWEEN_BATCHES = 5000; // 5 seconds between batches
  
  /**
   * Main verification process - runs continuously until all flagged communities are verified
   */
  async runVerificationProcess(limit: number = 100): Promise<void> {
    console.log('🚀 Starting batch Perplexity verification process...');
    
    let processed = 0;
    let verified = 0;
    let corrected = 0;
    let markedFake = 0;
    
    while (processed < limit) {
      // Get next batch of unverified communities
      const batch = await this.getNextBatch();
      
      if (batch.length === 0) {
        console.log('✅ No more communities to verify!');
        break;
      }
      
      console.log(`\n📦 Processing batch of ${batch.length} communities...`);
      
      // Process each community in the batch
      for (const community of batch) {
        try {
          const result = await this.verifyCommunity(community);
          
          if (result.exists) {
            verified++;
            
            // Check if any data needs correction
            const needsCorrection = 
              (result.correctAddress && result.correctAddress !== community.address) ||
              (result.correctCity && result.correctCity !== community.city) ||
              (result.correctPhone && result.correctPhone !== community.phone);
            
            if (needsCorrection) {
              await this.updateCommunity(result);
              corrected++;
              console.log(`✅ Verified & Corrected: ${result.name}`);
            } else {
              // Just mark as verified
              await db.update(communities)
                .set({ 
                  is_verified: true,
                  updated_at: new Date()
                })
                .where(eq(communities.id, result.id));
              console.log(`✅ Verified: ${result.name}`);
            }
          } else {
            // Mark as fake
            await db.update(communities)
              .set({ 
                is_verified: false,
                ai_notes: result.aiNotes || 'Could not verify existence via Perplexity search',
                updated_at: new Date()
              })
              .where(eq(communities.id, result.id));
            markedFake++;
            console.log(`❌ Marked as fake: ${result.name}`);
          }
          
          processed++;
          
        } catch (error) {
          console.error(`Error processing ${community.name}:`, error);
          // Mark as needs manual review
          await db.update(communities)
            .set({ 
              is_verified: false,
              ai_notes: `Error during verification: ${(error as Error).message}`,
              updated_at: new Date()
            })
            .where(eq(communities.id, community.id));
        }
        
        // Small delay between individual verifications
        await this.delay(1000);
      }
      
      // Delay between batches
      console.log(`⏳ Waiting ${this.DELAY_BETWEEN_BATCHES/1000} seconds before next batch...`);
      await this.delay(this.DELAY_BETWEEN_BATCHES);
    }
    
    // Final report
    console.log('\n📊 Verification Process Complete!');
    console.log(`   Total Processed: ${processed}`);
    console.log(`   Verified: ${verified}`);
    console.log(`   Corrected: ${corrected}`);
    console.log(`   Marked as Fake: ${markedFake}`);
  }
  
  /**
   * Get next batch of communities to verify
   */
  private async getNextBatch(): Promise<any[]> {
    return await db.select()
      .from(communities)
      .where(
        and(
          eq(communities.is_verified, false),
          sql`${communities.state} NOT IN (
            'NSW', 'VIC', 'TAS', 'QLD', 'WA', 'SA', 'ACT', 'NT',
            'BC', 'ON', 'QC', 'AB', 'SK', 'MB', 'NS', 'NL', 'PE', 'YT', 'NU', 'NB'
          )` // Skip international for now
        )
      )
      .limit(this.BATCH_SIZE);
  }
  
  /**
   * Verify a single community using Perplexity
   */
  private async verifyCommunity(community: any): Promise<VerificationResult> {
    console.log(`🔍 Verifying: ${community.name} in ${community.city}, ${community.state}`);
    
    // Build intelligent search query
    const searchQuery = `"${community.name}" senior living assisted living ${community.city} ${community.state} address phone website 2025`;
    
    try {
      const searchResults = await perplexityService.searchRealTime(searchQuery);
      const text = searchResults.summary || '';
      const sources = searchResults.sources || [];
      
      // Check if community exists based on search results
      const nameFound = text.toLowerCase().includes(community.name.toLowerCase());
      const cityFound = text.toLowerCase().includes(community.city.toLowerCase());
      
      // If name isn't found at all, it's likely fake
      if (!nameFound) {
        return {
          id: community.id,
          name: community.name,
          exists: false,
          confidence: 0,
          aiNotes: 'No results found for this community name'
        };
      }
      
      // Extract corrected information
      const extractedInfo = this.extractCommunityInfo(text, sources, community);
      
      // Determine if it exists based on confidence
      const exists = extractedInfo.confidence > 50;
      
      return {
        id: community.id,
        name: community.name,
        exists,
        confidence: extractedInfo.confidence,
        correctAddress: extractedInfo.address,
        correctCity: extractedInfo.city || community.city,
        correctState: extractedInfo.state || community.state,
        correctZipCode: extractedInfo.zipCode,
        correctPhone: extractedInfo.phone,
        website: extractedInfo.website,
        aiNotes: extractedInfo.notes
      };
      
    } catch (error) {
      console.error('Perplexity search failed:', error);
      throw error;
    }
  }
  
  /**
   * Extract community information from Perplexity search results
   */
  private extractCommunityInfo(text: string, sources: string[], community: any): any {
    let confidence = 0;
    const info: any = {};
    
    // Look for address patterns
    const addressPatterns = [
      /(?:address|located at|location):\s*([^,]+),\s*([^,]+),\s*([A-Z]{2})\s*(\d{5})?/i,
      /(\d+\s+[^,]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Place|Pl|Parkway|Pkwy))[,\s]+([^,]+)[,\s]+([A-Z]{2})\s*(\d{5})?/i
    ];
    
    for (const pattern of addressPatterns) {
      const match = text.match(pattern);
      if (match) {
        info.address = match[1].trim();
        info.city = match[2].trim();
        info.state = match[3];
        info.zipCode = match[4];
        confidence += 30;
        break;
      }
    }
    
    // Look for phone number
    const phoneMatch = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) {
      info.phone = phoneMatch[0];
      confidence += 20;
    }
    
    // Look for website
    const websiteMatch = text.match(/(?:website|site|visit):\s*(https?:\/\/[^\s]+)/i);
    if (websiteMatch) {
      info.website = websiteMatch[1];
      confidence += 30;
    } else {
      // Check sources for official website
      for (const source of sources) {
        if (!source.includes('aplaceformom') && 
            !source.includes('caring.com') && 
            !source.includes('seniorly')) {
          info.website = source;
          confidence += 20;
          break;
        }
      }
    }
    
    // If community name appears multiple times, increase confidence
    const nameCount = (text.match(new RegExp(community.name, 'gi')) || []).length;
    if (nameCount > 2) confidence += 20;
    
    // Build notes
    const notes = [];
    if (sources.length > 0) notes.push(`Found in ${sources.length} sources`);
    if (info.website) notes.push('Official website found');
    if (!info.address && text.length > 100) notes.push('Community mentioned but no clear address found');
    
    info.confidence = Math.min(confidence, 100);
    info.notes = notes.join('; ');
    
    return info;
  }
  
  /**
   * Update community with corrected information
   */
  private async updateCommunity(result: VerificationResult): Promise<void> {
    const updates: any = {
      is_verified: true,
      updated_at: new Date()
    };
    
    if (result.correctAddress) updates.address = result.correctAddress;
    if (result.correctCity) updates.city = result.correctCity;
    if (result.correctState) updates.state = result.correctState;
    if (result.correctZipCode) updates.zip_code = result.correctZipCode;
    if (result.correctPhone) updates.phone = result.correctPhone;
    if (result.website) updates.website = result.website;
    if (result.aiNotes) updates.ai_notes = result.aiNotes;
    
    await db.update(communities)
      .set(updates)
      .where(eq(communities.id, result.id));
  }
  
  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Get verification statistics
   */
  async getVerificationStats(): Promise<any> {
    const stats = await db.select({
      total: sql<number>`COUNT(*)`,
      verified: sql<number>`SUM(CASE WHEN is_verified = true THEN 1 ELSE 0 END)`,
      needs_verification: sql<number>`SUM(CASE WHEN is_verified = false THEN 1 ELSE 0 END)`,
      fake: sql<number>`SUM(CASE WHEN ai_notes LIKE '%fake%' THEN 1 ELSE 0 END)`,
      international: sql<number>`SUM(CASE WHEN state IN ('NSW', 'VIC', 'TAS', 'QLD', 'WA', 'SA', 'ACT', 'NT', 'BC', 'ON', 'QC', 'AB', 'SK', 'MB', 'NS', 'NL', 'PE', 'YT', 'NU', 'NB') THEN 1 ELSE 0 END)`
    })
    .from(communities);
    
    return stats[0];
  }
}

// Export singleton instance
export const batchVerifier = new BatchPerplexityVerifier();