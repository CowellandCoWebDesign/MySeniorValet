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
  email?: string;
  fax?: string;
  contactPerson?: string;
  hoursOfOperation?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  description?: string;
  careTypes?: string[];
  latitude?: number;
  longitude?: number;
  county?: string;
  discoverySource: string;
  rawData?: any; // Store the complete raw discovery data for later enrichment
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

      // Insert new discovered community with all available contact information
      const result = await db
        .insert(communities)
        .values({
          name: community.name,
          address: community.address || `${community.city}, ${community.state}`,
          city: community.city || '',
          state: community.state || '',
          zipCode: community.zip || '',
          country: community.country || 'United States',
          website: community.website,
          phone: community.phone,
          email: community.email,
          fax: community.fax,
          description: community.description,
          careTypes: community.careTypes,
          latitude: community.latitude,
          longitude: community.longitude,
          county: community.county,
          data_source: `ai_discovered_${community.discoverySource}`,
          // Store raw discovery data and social media in json fields
          metadata: {
            contactPerson: community.contactPerson,
            hoursOfOperation: community.hoursOfOperation,
            socialMedia: community.socialMedia,
            rawDiscoveryData: community.rawData,
            discoveredAt: new Date().toISOString()
          },
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
      const updateData: any = {
        updated_at: new Date()
      };

      // Add all available contact fields
      if (enrichedData.address) updateData.address = enrichedData.address;
      if (enrichedData.website) updateData.website = enrichedData.website;
      if (enrichedData.phone) updateData.phone = enrichedData.phone;
      if (enrichedData.email) updateData.email = enrichedData.email;
      if (enrichedData.fax) updateData.fax = enrichedData.fax;
      if (enrichedData.description) updateData.description = enrichedData.description;
      if (enrichedData.careTypes) updateData.careTypes = enrichedData.careTypes;
      if (enrichedData.latitude) updateData.latitude = enrichedData.latitude;
      if (enrichedData.longitude) updateData.longitude = enrichedData.longitude;
      if (enrichedData.county) updateData.county = enrichedData.county;
      if (enrichedData.city) updateData.city = enrichedData.city;
      if (enrichedData.state) updateData.state = enrichedData.state;
      if (enrichedData.zip) updateData.zipCode = enrichedData.zip;

      // Merge metadata
      if (enrichedData.contactPerson || enrichedData.hoursOfOperation || enrichedData.socialMedia) {
        const existing = await db.select().from(communities).where(eq(communities.id, communityId)).limit(1);
        if (existing[0]) {
          updateData.metadata = {
            ...(existing[0].metadata || {}),
            contactPerson: enrichedData.contactPerson || existing[0].metadata?.contactPerson,
            hoursOfOperation: enrichedData.hoursOfOperation || existing[0].metadata?.hoursOfOperation,
            socialMedia: enrichedData.socialMedia || existing[0].metadata?.socialMedia,
            enrichedAt: new Date().toISOString()
          };
        }
      }

      await db
        .update(communities)
        .set(updateData)
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