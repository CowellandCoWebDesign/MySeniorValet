import { db } from '../db';
import { communities } from '@shared/schema';
import { sql, eq, and, or, ne } from 'drizzle-orm';

interface DuplicateGroup {
  primaryId: number;
  primaryName: string;
  primaryLocation: string;
  duplicates: Array<{
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    similarity: number;
    dataCompleteness: number;
    lastUpdated: Date | null;
  }>;
  totalCount: number;
}

interface MergeResult {
  keptId: number;
  mergedIds: number[];
  mergedFields: string[];
  totalMerged: number;
}

export class DuplicateDetectionService {
  // Calculate similarity between two strings using Levenshtein distance
  private calculateSimilarity(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;
    
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    
    if (s1 === s2) return 100;
    
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) return 100;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return Math.round(((longer.length - editDistance) / longer.length) * 100);
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const costs = [];
    for (let i = 0; i <= str2.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= str1.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (str1.charAt(j - 1) !== str2.charAt(i - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[str1.length] = lastValue;
    }
    return costs[str1.length];
  }

  // Normalize name for better matching (remove common suffixes, articles, etc.)
  private normalizeName(name: string): string {
    if (!name) return '';
    
    return name
      .toLowerCase()
      .replace(/\b(the|a|an)\b/g, '') // Remove articles
      .replace(/\b(senior|living|care|center|centre|home|homes|facility|community|residence|manor|place|court|house|village|estates?|gardens?|heights?|park|plaza|towers?)\b/gi, '') // Remove common suffixes
      .replace(/\b(assisted|memory|skilled|nursing|independent|retirement)\b/gi, '') // Remove care type words
      .replace(/[^a-z0-9]/g, '') // Remove special characters
      .trim();
  }

  // Calculate data completeness score (0-100)
  private calculateCompleteness(community: any): number {
    const fields = [
      'name', 'address', 'city', 'state', 'zipCode',
      'phone', 'email', 'website', 'description',
      'pricing_type', 'priceRange', 'rentPerMonth',
      'careTypes', 'amenities', 'photos'
    ];
    
    let filledFields = 0;
    fields.forEach(field => {
      const value = community[field];
      if (value && (Array.isArray(value) ? value.length > 0 : true)) {
        filledFields++;
      }
    });
    
    return Math.round((filledFields / fields.length) * 100);
  }

  // Find all duplicate communities
  async findDuplicates(similarityThreshold: number = 85): Promise<DuplicateGroup[]> {
    console.log(`🔍 Starting duplicate detection with ${similarityThreshold}% similarity threshold...`);
    
    // Get all communities
    const allCommunities = await db
      .select()
      .from(communities)
      .orderBy(communities.state, communities.city, communities.name);
    
    console.log(`📊 Analyzing ${allCommunities.length} communities for duplicates...`);
    
    const duplicateGroups = new Map<number, DuplicateGroup>();
    const processedIds = new Set<number>();
    
    for (let i = 0; i < allCommunities.length; i++) {
      const community1 = allCommunities[i];
      
      if (processedIds.has(community1.id)) continue;
      
      const normalizedName1 = this.normalizeName(community1.name);
      const duplicatesForCurrent = [];
      
      // Check against remaining communities in same city/state
      for (let j = i + 1; j < allCommunities.length; j++) {
        const community2 = allCommunities[j];
        
        if (processedIds.has(community2.id)) continue;
        
        // Must be in same city and state
        if (community1.city !== community2.city || community1.state !== community2.state) {
          continue;
        }
        
        const normalizedName2 = this.normalizeName(community2.name);
        
        // Check name similarity
        const nameSimilarity = this.calculateSimilarity(normalizedName1, normalizedName2);
        
        // Also check if addresses are very similar
        const addressSimilarity = community1.address && community2.address
          ? this.calculateSimilarity(community1.address, community2.address)
          : 0;
        
        // Consider it a duplicate if names are very similar OR addresses match
        if (nameSimilarity >= similarityThreshold || addressSimilarity >= 90) {
          duplicatesForCurrent.push({
            id: community2.id,
            name: community2.name,
            address: community2.address || '',
            city: community2.city || '',
            state: community2.state || '',
            similarity: Math.max(nameSimilarity, addressSimilarity),
            dataCompleteness: this.calculateCompleteness(community2),
            lastUpdated: community2.updatedAt
          });
          processedIds.add(community2.id);
        }
      }
      
      // If duplicates found, create a group
      if (duplicatesForCurrent.length > 0) {
        processedIds.add(community1.id);
        duplicateGroups.set(community1.id, {
          primaryId: community1.id,
          primaryName: community1.name,
          primaryLocation: `${community1.city}, ${community1.state}`,
          duplicates: duplicatesForCurrent,
          totalCount: duplicatesForCurrent.length + 1
        });
      }
    }
    
    const groups = Array.from(duplicateGroups.values())
      .sort((a, b) => b.totalCount - a.totalCount);
    
    console.log(`✅ Found ${groups.length} duplicate groups containing ${groups.reduce((sum, g) => sum + g.duplicates.length, 0)} duplicate communities`);
    
    return groups;
  }

  // Merge duplicate communities
  async mergeDuplicates(primaryId: number, duplicateIds: number[]): Promise<MergeResult> {
    console.log(`🔄 Merging ${duplicateIds.length} duplicates into community ${primaryId}...`);
    
    // Get all communities involved
    const [primary] = await db
      .select()
      .from(communities)
      .where(eq(communities.id, primaryId));
    
    if (!primary) {
      throw new Error(`Primary community ${primaryId} not found`);
    }
    
    const duplicates = await db
      .select()
      .from(communities)
      .where(sql`${communities.id} IN ${duplicateIds}`);
    
    const mergedFields: string[] = [];
    let mergedData: any = { ...primary };
    
    // Merge strategy: Keep best data from all duplicates
    for (const duplicate of duplicates) {
      // Merge pricing (keep most specific)
      if (!mergedData.rentPerMonth && duplicate.rentPerMonth) {
        mergedData.rentPerMonth = duplicate.rentPerMonth;
        mergedFields.push('rentPerMonth');
      }
      
      if (!mergedData.priceRange && duplicate.priceRange) {
        mergedData.priceRange = duplicate.priceRange;
        mergedFields.push('priceRange');
      }
      
      // Merge contact info (fill gaps)
      if (!mergedData.phone && duplicate.phone) {
        mergedData.phone = duplicate.phone;
        mergedFields.push('phone');
      }
      
      if (!mergedData.email && duplicate.email) {
        mergedData.email = duplicate.email;
        mergedFields.push('email');
      }
      
      if (!mergedData.website && duplicate.website) {
        mergedData.website = duplicate.website;
        mergedFields.push('website');
      }
      
      // Merge arrays (combine unique values)
      if (duplicate.careTypes && duplicate.careTypes.length > 0) {
        mergedData.careTypes = [...new Set([...(mergedData.careTypes || []), ...duplicate.careTypes])];
        mergedFields.push('careTypes');
      }
      
      if (duplicate.amenities && duplicate.amenities.length > 0) {
        mergedData.amenities = [...new Set([...(mergedData.amenities || []), ...duplicate.amenities])];
        mergedFields.push('amenities');
      }
      
      // Keep longer description
      if (duplicate.description && (!mergedData.description || duplicate.description.length > mergedData.description.length)) {
        mergedData.description = duplicate.description;
        mergedFields.push('description');
      }
      
      // Keep HUD info if present
      if (duplicate.hudPropertyId && !mergedData.hudPropertyId) {
        mergedData.hudPropertyId = duplicate.hudPropertyId;
        mergedFields.push('hudPropertyId');
      }
    }
    
    // Update primary with merged data
    await db
      .update(communities)
      .set({
        ...mergedData,
        updatedAt: new Date(),
        dataQualityScore: this.calculateCompleteness(mergedData)
      })
      .where(eq(communities.id, primaryId));
    
    // Delete duplicates
    await db
      .delete(communities)
      .where(sql`${communities.id} IN ${duplicateIds}`);
    
    console.log(`✅ Successfully merged ${duplicateIds.length} duplicates into community ${primaryId}`);
    console.log(`   Enhanced fields: ${mergedFields.join(', ')}`);
    
    return {
      keptId: primaryId,
      mergedIds: duplicateIds,
      mergedFields: [...new Set(mergedFields)],
      totalMerged: duplicateIds.length
    };
  }

  // Get duplicate statistics
  async getDuplicateStats(): Promise<{
    totalCommunities: number;
    estimatedDuplicates: number;
    duplicateGroups: number;
    percentageDuplicated: number;
    topDuplicatedStates: Array<{ state: string; count: number }>;
  }> {
    const groups = await this.findDuplicates(85);
    const totalDuplicates = groups.reduce((sum, g) => sum + g.duplicates.length, 0);
    
    // Count duplicates by state
    const stateCount = new Map<string, number>();
    groups.forEach(group => {
      const state = group.primaryLocation.split(', ')[1];
      stateCount.set(state, (stateCount.get(state) || 0) + group.duplicates.length);
    });
    
    const topStates = Array.from(stateCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([state, count]) => ({ state, count }));
    
    const [{ count: totalCommunities }] = await db
      .select({ count: sql<string>`COUNT(*)` })
      .from(communities);
    
    return {
      totalCommunities: parseInt(totalCommunities),
      estimatedDuplicates: totalDuplicates,
      duplicateGroups: groups.length,
      percentageDuplicated: Math.round((totalDuplicates / parseInt(totalCommunities)) * 100 * 100) / 100,
      topDuplicatedStates: topStates
    };
  }

  // Auto-merge obvious duplicates (very high confidence)
  async autoMergeObviousDuplicates(): Promise<{ merged: number; groups: number }> {
    console.log('🤖 Starting automatic merge of obvious duplicates (95%+ similarity)...');
    
    const groups = await this.findDuplicates(95);
    let totalMerged = 0;
    let groupsMerged = 0;
    
    for (const group of groups) {
      // Only auto-merge if it's a clear duplicate (single duplicate with very high similarity)
      if (group.duplicates.length === 1 && group.duplicates[0].similarity >= 95) {
        try {
          // Choose the one with better data as primary
          const primaryCompleteness = this.calculateCompleteness(
            await db.select().from(communities).where(eq(communities.id, group.primaryId)).then(r => r[0])
          );
          
          if (group.duplicates[0].dataCompleteness > primaryCompleteness) {
            // Swap - use the more complete one as primary
            await this.mergeDuplicates(group.duplicates[0].id, [group.primaryId]);
          } else {
            await this.mergeDuplicates(group.primaryId, [group.duplicates[0].id]);
          }
          
          totalMerged++;
          groupsMerged++;
        } catch (error) {
          console.error(`Failed to merge group ${group.primaryId}:`, error);
        }
      }
    }
    
    console.log(`✅ Auto-merged ${totalMerged} obvious duplicates from ${groupsMerged} groups`);
    return { merged: totalMerged, groups: groupsMerged };
  }
}