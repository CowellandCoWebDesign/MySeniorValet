import { db } from '../db';
import { communities } from '@shared/schema';
import { eq, and, sql, inArray, desc, isNotNull, isNull } from 'drizzle-orm';

export interface DuplicateGroup {
  name: string;
  city: string;
  state: string;
  duplicates: Array<{
    id: number;
    name: string;
    address: string | null;
    phone: string | null;
    website: string | null;
    rating: number | null;
    reviewCount: number | null;
    photos: string[] | null;
    createdAt: Date;
    hasHudData: boolean;
    hasPhotos: boolean;
    hasDescription: boolean;
    dataCompleteness: number;
  }>;
  recommendedKeepId: number;
  recommendedRemoveIds: number[];
}

export class DuplicateManager {
  /**
   * Find all duplicate communities in the database
   */
  static async findAllDuplicates(): Promise<DuplicateGroup[]> {
    console.log('🔍 Searching for duplicate communities...');
    
    // Find duplicate groups
    const duplicateGroups = await db.execute(sql`
      SELECT LOWER(name) as name_lower, LOWER(city) as city_lower, LOWER(state) as state_lower, COUNT(*) as count
      FROM communities
      GROUP BY LOWER(name), LOWER(city), LOWER(state)
      HAVING COUNT(*) > 1
      ORDER BY COUNT(*) DESC
    `);
    
    const groups: DuplicateGroup[] = [];
    
    for (const group of duplicateGroups.rows) {
      const namePattern = String(group.name_lower);
      const cityPattern = String(group.city_lower);
      const statePattern = String(group.state_lower);
      
      // Get all duplicates for this group
      const duplicates = await db
        .select({
          id: communities.id,
          name: communities.name,
          address: communities.address,
          city: communities.city,
          state: communities.state,
          phone: communities.phone,
          website: communities.website,
          rating: communities.rating,
          reviewCount: communities.reviewCount,
          photos: communities.photos,
          createdAt: communities.createdAt,
          hudPropertyId: communities.hudPropertyId,
          description: communities.description,
          rentPerMonth: communities.rentPerMonth,
          monthlyRentRangeStart: communities.monthlyRentRangeStart
        })
        .from(communities)
        .where(
          sql`LOWER(name) = ${namePattern} AND LOWER(city) = ${cityPattern} AND LOWER(state) = ${statePattern}`
        );
      
      // Calculate data completeness for each duplicate
      const duplicatesWithScores = duplicates.map(dup => {
        let score = 0;
        const hasHudData = !!dup.hudPropertyId;
        const hasPhotos = dup.photos && dup.photos.length > 0;
        const hasDescription = !!dup.description && dup.description.length > 100;
        const hasPricing = !!(dup.rentPerMonth || dup.monthlyRentRangeStart);
        
        // Scoring system - prioritize records with more data
        if (hasHudData) score += 100;  // HUD data is most valuable
        if (hasPhotos) score += 50;
        if (hasDescription) score += 30;
        if (dup.website) score += 20;
        if (dup.phone) score += 20;
        if (dup.address && dup.address.length > 10) score += 20;
        if (dup.rating) score += 15;
        if (dup.reviewCount && dup.reviewCount > 0) score += 15;
        if (hasPricing) score += 25;
        
        // Prefer older records (they've been in the system longer)
        const ageBonus = Math.min(30, Math.floor((Date.now() - new Date(dup.createdAt).getTime()) / (1000 * 60 * 60 * 24)));
        score += ageBonus;
        
        return {
          id: dup.id,
          name: dup.name,
          address: dup.address,
          phone: dup.phone,
          website: dup.website,
          rating: dup.rating ? Number(dup.rating) : null,
          reviewCount: dup.reviewCount,
          photos: dup.photos,
          createdAt: dup.createdAt,
          hasHudData,
          hasPhotos,
          hasDescription,
          dataCompleteness: score
        };
      });
      
      // Sort by data completeness score
      duplicatesWithScores.sort((a, b) => b.dataCompleteness - a.dataCompleteness);
      
      // Recommend keeping the one with the most complete data
      const recommendedKeepId = duplicatesWithScores[0].id;
      const recommendedRemoveIds = duplicatesWithScores.slice(1).map(d => d.id);
      
      groups.push({
        name: duplicates[0].name,
        city: duplicates[0].city,
        state: duplicates[0].state,
        duplicates: duplicatesWithScores,
        recommendedKeepId,
        recommendedRemoveIds
      });
    }
    
    console.log(`✅ Found ${groups.length} duplicate groups with ${groups.reduce((sum, g) => sum + g.duplicates.length, 0)} total records`);
    return groups;
  }
  
  /**
   * Merge data from duplicates into the keeper record
   */
  static async mergeDuplicates(keepId: number, removeIds: number[]): Promise<void> {
    console.log(`🔀 Merging ${removeIds.length} duplicates into community ${keepId}`);
    
    // Get all records
    const [keeper] = await db.select().from(communities).where(eq(communities.id, keepId));
    const duplicatesToRemove = await db.select().from(communities).where(inArray(communities.id, removeIds));
    
    if (!keeper) {
      throw new Error(`Keeper community ${keepId} not found`);
    }
    
    // Merge data into keeper (preserve existing data, only add missing fields)
    const updates: any = {};
    
    for (const dup of duplicatesToRemove) {
      // Merge photos (combine unique photos)
      if (dup.photos && dup.photos.length > 0) {
        const existingPhotos = keeper.photos || [];
        const newPhotos = dup.photos.filter(p => !existingPhotos.includes(p));
        if (newPhotos.length > 0) {
          updates.photos = [...existingPhotos, ...newPhotos];
        }
      }
      
      // Take better data if keeper is missing it
      if (!keeper.website && dup.website) updates.website = dup.website;
      if (!keeper.phone && dup.phone) updates.phone = dup.phone;
      if (!keeper.description && dup.description) updates.description = dup.description;
      if (!keeper.hudPropertyId && dup.hudPropertyId) updates.hudPropertyId = dup.hudPropertyId;
      if (!keeper.rating && dup.rating) updates.rating = dup.rating;
      if (!keeper.reviewCount && dup.reviewCount) updates.reviewCount = dup.reviewCount;
      if (!keeper.rentPerMonth && dup.rentPerMonth) updates.rentPerMonth = dup.rentPerMonth;
      
      // Merge care types (combine unique)
      if (dup.careTypes && dup.careTypes.length > 0) {
        const existingTypes = keeper.careTypes || [];
        const newTypes = dup.careTypes.filter(t => !existingTypes.includes(t));
        if (newTypes.length > 0) {
          updates.careTypes = [...existingTypes, ...newTypes];
        }
      }
    }
    
    // Update keeper if there are changes
    if (Object.keys(updates).length > 0) {
      await db.update(communities)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(communities.id, keepId));
      console.log(`✅ Updated community ${keepId} with merged data`);
    }
    
    // Delete duplicates
    await db.delete(communities).where(inArray(communities.id, removeIds));
    console.log(`🗑️ Removed ${removeIds.length} duplicate records`);
  }
  
  /**
   * Generate a detailed report of duplicates
   */
  static async generateReport(): Promise<string> {
    const duplicates = await this.findAllDuplicates();
    
    let report = '# Duplicate Communities Report\n\n';
    report += `Generated: ${new Date().toLocaleString()}\n\n`;
    report += `## Summary\n`;
    report += `- Total duplicate groups: ${duplicates.length}\n`;
    report += `- Total duplicate records: ${duplicates.reduce((sum, g) => sum + g.duplicates.length, 0)}\n`;
    report += `- Records to remove: ${duplicates.reduce((sum, g) => sum + g.recommendedRemoveIds.length, 0)}\n\n`;
    
    report += `## Top 10 Duplicate Groups\n\n`;
    
    for (const group of duplicates.slice(0, 10)) {
      report += `### ${group.name} - ${group.city}, ${group.state}\n`;
      report += `Duplicates: ${group.duplicates.length}\n`;
      report += `Recommended to keep: ID ${group.recommendedKeepId} (Score: ${group.duplicates[0].dataCompleteness})\n`;
      report += `\nDetails:\n`;
      
      for (const dup of group.duplicates) {
        report += `- ID: ${dup.id} | Score: ${dup.dataCompleteness}`;
        report += ` | HUD: ${dup.hasHudData ? '✅' : '❌'}`;
        report += ` | Photos: ${dup.hasPhotos ? '✅' : '❌'}`;
        report += ` | Desc: ${dup.hasDescription ? '✅' : '❌'}`;
        report += '\n';
      }
      report += '\n';
    }
    
    return report;
  }
  
  /**
   * Safe cleanup - removes only exact duplicates with no unique data
   */
  static async safeCleanup(): Promise<number> {
    console.log('🧹 Starting safe duplicate cleanup...');
    
    const duplicates = await this.findAllDuplicates();
    let removedCount = 0;
    
    for (const group of duplicates) {
      // Only remove if there's a clear winner (score difference > 50)
      if (group.duplicates.length === 2) {
        const scoreDiff = group.duplicates[0].dataCompleteness - group.duplicates[1].dataCompleteness;
        if (scoreDiff > 50) {
          // Safe to remove the lower-scoring duplicate
          await this.mergeDuplicates(group.recommendedKeepId, [group.duplicates[1].id]);
          removedCount++;
        }
      }
    }
    
    console.log(`✅ Safe cleanup complete. Removed ${removedCount} clear duplicates.`);
    return removedCount;
  }
}