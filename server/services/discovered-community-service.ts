import { db } from "../db";
import { communities } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

/**
 * Clean Perplexity AI citation markers from data
 * Removes patterns like [1], [2][3], *(verify)*, etc.
 */
function cleanPerplexityCitations(text: string | undefined): string | undefined {
  if (!text) return text;
  return text
    .replace(/\s*\*\(verify\)\*/gi, '')  // Remove *(verify)*
    .replace(/\s*\[\d+\]/g, '')          // Remove [1], [2], etc.
    .replace(/\[\d+\]\[\d+\]/g, '')      // Remove [1][2] patterns
    .replace(/\s+/g, ' ')                // Normalize whitespace
    .trim();
}

/**
 * Clean all fields that might have citation markers
 */
function cleanDiscoveredCommunity(community: DiscoveredCommunity): DiscoveredCommunity {
  return {
    ...community,
    name: cleanPerplexityCitations(community.name) || community.name,
    address: cleanPerplexityCitations(community.address),
    city: cleanPerplexityCitations(community.city),
    state: cleanPerplexityCitations(community.state),
    zip: cleanPerplexityCitations(community.zip),
    website: cleanPerplexityCitations(community.website),
    phone: cleanPerplexityCitations(community.phone),
    email: cleanPerplexityCitations(community.email),
    fax: cleanPerplexityCitations(community.fax),
    description: cleanPerplexityCitations(community.description),
  };
}

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
      // Clean citation markers from all fields before saving
      const cleanedCommunity = cleanDiscoveredCommunity(community);
      
      // Check if community already exists (by name and city/state)
      if (cleanedCommunity.name && cleanedCommunity.city && cleanedCommunity.state) {
        const existing = await db
          .select()
          .from(communities)
          .where(
            and(
              eq(communities.name, cleanedCommunity.name),
              eq(communities.city, cleanedCommunity.city),
              eq(communities.state, cleanedCommunity.state)
            )
          )
          .limit(1);

        if (existing.length > 0) {
          console.log(`Community already exists: ${cleanedCommunity.name} in ${cleanedCommunity.city}, ${cleanedCommunity.state}`);
          return existing[0].id;
        }
      }

      // Insert new discovered community with all available contact information
      // CRITICAL FIX: Default careTypes to empty array to prevent NOT NULL constraint failure
      const { safeCommunitySlugs } = await import('../utils/generate-slug');
      const slugs = await safeCommunitySlugs({
        name: cleanedCommunity.name,
        city: cleanedCommunity.city || '',
        state: cleanedCommunity.state || '',
      });
      const result = await db
        .insert(communities)
        .values({
          name: cleanedCommunity.name,
          address: cleanedCommunity.address || `${cleanedCommunity.city}, ${cleanedCommunity.state}`,
          city: cleanedCommunity.city || '',
          state: cleanedCommunity.state || '',
          zipCode: cleanedCommunity.zip || '',
          country: cleanedCommunity.country || null,
          website: cleanedCommunity.website,
          phone: cleanedCommunity.phone,
          email: cleanedCommunity.email,
          fax: cleanedCommunity.fax,
          description: cleanedCommunity.description,
          careTypes: cleanedCommunity.careTypes ?? [], // CRITICAL: Must be array, NOT NULL in schema
          amenities: [],
          services: [],
          careServices: [],
          medicalRestrictions: [],
          photos: [],
          photoAttributions: [],
          latitude: cleanedCommunity.latitude ? String(cleanedCommunity.latitude) : null,
          longitude: cleanedCommunity.longitude ? String(cleanedCommunity.longitude) : null,
          county: cleanedCommunity.county,
          data_source: `ai_discovered_${cleanedCommunity.discoverySource}`,
          isActive: true,
          isVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...slugs,
        })
        .returning({ id: communities.id });

      console.log(`✅ Saved discovered community: ${cleanedCommunity.name} (ID: ${result[0].id})`);
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
        updatedAt: new Date()
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

      // Update operating hours if provided
      if (enrichedData.hoursOfOperation) {
        updateData.operatingHours = enrichedData.hoursOfOperation;
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