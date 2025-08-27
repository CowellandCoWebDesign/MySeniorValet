import { db } from "../db";
import { communities } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

export interface DiscoveredCommunity {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  website?: string;
  phone?: string;
  discoverySource: string;
}

export class DiscoveredCommunityService {
  /**
   * Save a discovered community to the database
   * This ensures we NEVER lose a community once we've found it
   */
  async saveDiscoveredCommunity(community: DiscoveredCommunity): Promise<number> {
    try {
      // Check if community already exists (by name and city/state)
      if (community.name && community.city && community.state) {
        const existing = await db
          .select()
          .from(communities)
          .where(
            and(
              eq(communities.name, community.name),
              eq(communities.city, community.city),
              eq(communities.state, community.state)
            )
          )
          .limit(1);

        if (existing.length > 0) {
          console.log(`Community already exists: ${community.name} in ${community.city}, ${community.state}`);
          return existing[0].id;
        }
      }

      // Insert new discovered community with minimal required fields
      const result = await db
        .insert(communities)
        .values({
          name: community.name,
          address: community.address || `${community.city}, ${community.state}`,
          city: community.city || '',
          state: community.state || '',
          zip: community.zip || '',
          country: community.country || 'United States',
          website: community.website,
          phone: community.phone,
          data_source: `ai_discovered_${community.discoverySource}`,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning({ id: communities.id });

      console.log(`✅ Saved discovered community: ${community.name} (ID: ${result[0].id})`);
      return result[0].id;
    } catch (error) {
      console.error('Error saving discovered community:', error);
      // Don't throw - we don't want discovery failures to break the user experience
      return 0;
    }
  }

  /**
   * Save multiple discovered communities in batch
   */
  async saveDiscoveredCommunities(communities: DiscoveredCommunity[]): Promise<number[]> {
    const savedIds: number[] = [];
    
    for (const community of communities) {
      const id = await this.saveDiscoveredCommunity(community);
      if (id > 0) {
        savedIds.push(id);
      }
    }
    
    return savedIds;
  }

  /**
   * Update a discovered community with enriched data
   */
  async enrichDiscoveredCommunity(
    communityId: number, 
    enrichedData: Partial<DiscoveredCommunity>
  ): Promise<boolean> {
    try {
      await db
        .update(communities)
        .set({
          address: enrichedData.address,
          website: enrichedData.website,
          phone: enrichedData.phone,
          updated_at: new Date()
        })
        .where(eq(communities.id, communityId));

      console.log(`✅ Enriched community ID ${communityId} with new data`);
      return true;
    } catch (error) {
      console.error('Error enriching community:', error);
      return false;
    }
  }

  /**
   * Get statistics about discovered communities
   */
  async getDiscoveredStats() {
    const stats = await db.execute(sql`
      SELECT 
        COUNT(*) as total_discovered,
        COUNT(CASE WHEN data_source LIKE 'ai_discovered_%' THEN 1 END) as ai_discovered,
        COUNT(CASE WHEN data_source = 'discovered_community' THEN 1 END) as manually_discovered,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as discovered_this_week,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as discovered_today
      FROM communities
      WHERE data_source LIKE '%discovered%'
    `);

    return stats.rows[0];
  }
}

export const discoveredCommunityService = new DiscoveredCommunityService();