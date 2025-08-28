/**
 * Weaviate Vector Database Service
 * Provides semantic search, AI recommendations, and intelligent community discovery
 */

import weaviate, { WeaviateClient, ApiKey } from 'weaviate-ts-client';
import { db } from '../db';
import { communities } from '../../shared/schema';
import { eq, sql } from 'drizzle-orm';

export interface CommunityVector {
  id: string;
  name: string;
  description: string;
  careTypes: string[];
  city: string;
  state: string;
  amenities: string[];
  pricing?: string;
  latitude?: number;
  longitude?: number;
  properties?: Record<string, any>;
}

export interface SemanticSearchResult {
  community: CommunityVector;
  score: number;
  explanation: string;
}

export interface RecommendationContext {
  userId?: string;
  preferences?: {
    careTypes?: string[];
    location?: { city?: string; state?: string; radius?: number };
    amenities?: string[];
    priceRange?: { min?: number; max?: number };
    specialNeeds?: string[];
  };
  searchHistory?: string[];
  viewHistory?: string[];
}

class WeaviateService {
  private client: WeaviateClient | null = null;
  private isInitialized = false;
  private readonly className = 'SeniorCommunity';

  constructor() {
    this.initializeClient();
  }

  private async initializeClient() {
    try {
      if (!process.env.WEAVIATE_REST_ENDPOINT || !process.env.WEAVIATE_API_KEY) {
        console.log('⚠️ Weaviate credentials not found, semantic search disabled');
        return;
      }

      this.client = weaviate.client({
        scheme: 'https',
        host: process.env.WEAVIATE_REST_ENDPOINT.replace('https://', '').replace('http://', ''),
        apiKey: new ApiKey(process.env.WEAVIATE_API_KEY),
        headers: {
          'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY || '', // For vectorization
        },
      });

      // Test connection
      await this.client.misc.liveChecker().do();
      console.log('✅ Weaviate connected successfully');

      // Initialize schema
      await this.initializeSchema();
      this.isInitialized = true;

    } catch (error) {
      console.error('❌ Weaviate initialization failed:', error);
      this.client = null;
    }
  }

  private async initializeSchema() {
    if (!this.client) return;

    try {
      // Check if class exists
      const existingClasses = await this.client.schema.getter().do();
      const classExists = existingClasses.classes?.some(c => c.class === this.className);

      if (!classExists) {
        // Create the SeniorCommunity class
        const classDefinition = {
          class: this.className,
          description: 'Senior living communities with semantic search capabilities',
          vectorizer: 'text2vec-openai',
          moduleConfig: {
            'text2vec-openai': {
              model: 'text-embedding-3-small',
              type: 'text',
            },
          },
          vectorIndexConfig: {
            distance: 'cosine',
            type: 'hnsw',
            hnsw: {
              maxConnections: 64,
              efConstruction: 256,
              ef: 128,
              dynamicEfMin: 100,
              dynamicEfMax: 500,
              dynamicEfFactor: 8,
              vectorCacheMaxObjects: 1000000,
              flatSearchCutoff: 40000,
              skip: false,
              cleanupIntervalSeconds: 300
            }
          },
          properties: [
            {
              name: 'communityId',
              dataType: ['string'],
              description: 'Unique identifier for the community',
            },
            {
              name: 'name',
              dataType: ['text'],
              description: 'Name of the senior community',
            },
            {
              name: 'description',
              dataType: ['text'],
              description: 'Detailed description of the community and its features',
            },
            {
              name: 'careTypes',
              dataType: ['text[]'],
              description: 'Types of care provided (independent living, assisted living, memory care, etc.)',
            },
            {
              name: 'city',
              dataType: ['string'],
              description: 'City where the community is located',
            },
            {
              name: 'state',
              dataType: ['string'],
              description: 'State where the community is located',
            },
            {
              name: 'amenities',
              dataType: ['text[]'],
              description: 'Available amenities and features',
            },
            {
              name: 'specialties',
              dataType: ['text[]'],
              description: 'Special programs, medical specialties, or unique features',
            },
            {
              name: 'priceRange',
              dataType: ['string'],
              description: 'Pricing information or range',
            },
            {
              name: 'latitude',
              dataType: ['number'],
              description: 'Geographic latitude',
            },
            {
              name: 'longitude',
              dataType: ['number'],
              description: 'Geographic longitude',
            },
            {
              name: 'overallRating',
              dataType: ['number'],
              description: 'Average rating from reviews',
            },
            {
              name: 'reviewSummary',
              dataType: ['text'],
              description: 'AI-generated summary of reviews and highlights',
            },
          ],
        };

        await this.client.schema.classCreator().withClass(classDefinition).do();
        console.log('✅ Weaviate schema created for senior communities');
      }
    } catch (error) {
      console.error('❌ Schema initialization failed:', error);
    }
  }

  /**
   * Index all communities in Weaviate for semantic search
   */
  async indexCommunities(limit: number = 1000, offset: number = 0): Promise<number> {
    if (!this.client || !this.isInitialized) {
      console.log('⚠️ Weaviate not initialized, skipping indexing');
      return 0;
    }

    try {
      console.log(`🔄 Indexing communities (offset: ${offset}, limit: ${limit})`);

      // Fetch communities from database
      const communitiesData = await db
        .select()
        .from(communities)
        .limit(limit)
        .offset(offset);

      if (communitiesData.length === 0) {
        console.log('✅ No more communities to index');
        return 0;
      }

      // Batch insert into Weaviate
      const batcher = this.client.batch.objectsBatcher();

      for (const community of communitiesData) {
        const description = this.generateCommunityDescription(community);
        const amenities = this.extractAmenities(community);
        const specialties = this.extractSpecialties(community);

        const weaviateObject = {
          class: this.className,
          properties: {
            communityId: community.id.toString(),
            name: community.name || '',
            description,
            careTypes: community.careTypes || [],
            city: community.city || '',
            state: community.state || '',
            amenities,
            specialties,
            priceRange: this.formatPriceRange(community),
            latitude: community.latitude || 0,
            longitude: community.longitude || 0,
            overallRating: (community as any).overallRating || 0,
            reviewSummary: (community as any).reviewSummary || '',
          },
        };

        batcher.withObject(weaviateObject);
      }

      await batcher.do();
      console.log(`✅ Indexed ${communitiesData.length} communities in Weaviate`);
      return communitiesData.length;

    } catch (error) {
      console.error('❌ Community indexing failed:', error);
      return 0;
    }
  }

  /**
   * Semantic search for communities based on natural language query
   */
  async semanticSearch(
    query: string,
    limit: number = 10,
    context?: RecommendationContext
  ): Promise<SemanticSearchResult[]> {
    if (!this.client || !this.isInitialized) {
      return [];
    }

    try {
      console.log(`🔍 Semantic search: "${query}"`);

      let whereFilter: any = {};

      // Apply context filters
      if (context?.preferences) {
        const filters: any[] = [];

        if (context.preferences.careTypes?.length) {
          filters.push({
            path: ['careTypes'],
            operator: 'ContainsAny',
            valueTextArray: context.preferences.careTypes,
          });
        }

        if (context.preferences.location?.state) {
          filters.push({
            path: ['state'],
            operator: 'Equal',
            valueText: context.preferences.location.state,
          });
        }

        if (context.preferences.location?.city) {
          filters.push({
            path: ['city'],
            operator: 'Equal',
            valueText: context.preferences.location.city,
          });
        }

        if (filters.length > 0) {
          whereFilter = filters.length === 1 ? filters[0] : {
            operator: 'And',
            operands: filters,
          };
        }
      }

      const searchBuilder = this.client.graphql
        .get()
        .withClassName(this.className)
        .withFields('communityId name description careTypes city state amenities specialties priceRange latitude longitude overallRating reviewSummary')
        .withNearText({ concepts: [query] })
        .withLimit(typeof limit === 'number' ? limit : parseInt(String(limit)) || 50)
;

      if (Object.keys(whereFilter).length > 0) {
        searchBuilder.withWhere(whereFilter);
      }

      const result = await searchBuilder.do();

      const communities = result.data?.Get?.[this.className] || [];

      return communities.map((item: any) => ({
        community: {
          id: item.communityId,
          name: item.name,
          description: item.description,
          careTypes: item.careTypes || [],
          city: item.city,
          state: item.state,
          amenities: item.amenities || [],
          pricing: item.priceRange,
          latitude: item.latitude,
          longitude: item.longitude,
          properties: {
            overallRating: item.overallRating,
            reviewSummary: item.reviewSummary,
            specialties: item.specialties,
          },
        },
        score: 0.85, // Default score since _additional is not available
        explanation: this.generateSearchExplanation(query, item),
      }));

    } catch (error) {
      console.error('❌ Semantic search failed:', error);
      return [];
    }
  }

  /**
   * Get personalized recommendations based on user context
   */
  async getPersonalizedRecommendations(
    context: RecommendationContext,
    limit: number = 5
  ): Promise<SemanticSearchResult[]> {
    if (!this.client || !this.isInitialized) {
      return [];
    }

    try {
      // Build recommendation query from context
      const queryParts: string[] = [];

      if (context.preferences?.careTypes?.length) {
        queryParts.push(`${context.preferences.careTypes.join(' or ')} care`);
      }

      if (context.preferences?.amenities?.length) {
        queryParts.push(`with ${context.preferences.amenities.join(', ')}`);
      }

      if (context.preferences?.specialNeeds?.length) {
        queryParts.push(`specialized in ${context.preferences.specialNeeds.join(', ')}`);
      }

      if (context.preferences?.location?.city && context.preferences?.location?.state) {
        queryParts.push(`near ${context.preferences.location.city}, ${context.preferences.location.state}`);
      }

      const query = queryParts.length > 0 
        ? queryParts.join(' ')
        : 'high quality senior living community';

      console.log(`🎯 Personalized recommendations: "${query}"`);

      return await this.semanticSearch(query, limit, context);

    } catch (error) {
      console.error('❌ Personalized recommendations failed:', error);
      return [];
    }
  }

  /**
   * Find similar communities to a given community
   */
  async findSimilarCommunities(
    communityId: string,
    limit: number = 5
  ): Promise<SemanticSearchResult[]> {
    if (!this.client || !this.isInitialized) {
      return [];
    }

    try {
      console.log(`🔗 Finding similar communities to ID: ${communityId}`);

      // First get the target community's vector
      const targetCommunity = await this.client.graphql
        .get()
        .withClassName(this.className)
        .withFields('communityId name description careTypes amenities')
        .withWhere({
          path: ['communityId'],
          operator: 'Equal',
          valueText: communityId,
        })
        .withLimit(1)
        .do();

      const target = targetCommunity.data?.Get?.[this.className]?.[0];
      if (!target) {
        return [];
      }

      // Use the target's description and features for similarity search
      const searchQuery = `${target.description} ${target.careTypes?.join(' ')} ${target.amenities?.join(' ')}`;

      const result = await this.client.graphql
        .get()
        .withClassName(this.className)
        .withFields('communityId name description careTypes city state amenities specialties priceRange latitude longitude overallRating reviewSummary')
        .withNearText({ concepts: [searchQuery] })
        .withLimit(limit + 1) // +1 to exclude the original

        .withWhere({
          path: ['communityId'],
          operator: 'NotEqual',
          valueText: communityId,
        })
        .do();

      const communities = result.data?.Get?.[this.className] || [];

      return communities.map((item: any) => ({
        community: {
          id: item.communityId,
          name: item.name,
          description: item.description,
          careTypes: item.careTypes || [],
          city: item.city,
          state: item.state,
          amenities: item.amenities || [],
          pricing: item.priceRange,
          latitude: item.latitude,
          longitude: item.longitude,
          properties: {
            overallRating: item.overallRating,
            reviewSummary: item.reviewSummary,
            specialties: item.specialties,
          },
        },
        score: 0.85, // Default score since _additional is not available
        explanation: `Similar to ${target.name} in care types and amenities`,
      }));

    } catch (error) {
      console.error('❌ Similar communities search failed:', error);
      return [];
    }
  }

  /**
   * Helper methods
   */
  private generateCommunityDescription(community: any): string {
    const parts: string[] = [];

    if (community.name) {
      parts.push(community.name);
    }

    if (community.description) {
      parts.push(community.description);
    }

    if (community.careTypes?.length) {
      parts.push(`Provides ${community.careTypes.join(', ')} services`);
    }

    if (community.city && community.state) {
      parts.push(`Located in ${community.city}, ${community.state}`);
    }

    return parts.join('. ');
  }

  private extractAmenities(community: any): string[] {
    const amenities: string[] = [];

    // Extract from various fields that might contain amenity information
    if (community.amenities) {
      amenities.push(...community.amenities);
    }

    if (community.features) {
      amenities.push(...community.features);
    }

    // Add inferred amenities based on care types
    if (community.careTypes?.includes('memory_care')) {
      amenities.push('Memory Care Unit', 'Specialized Staff', 'Secure Environment');
    }

    if (community.careTypes?.includes('assisted_living')) {
      amenities.push('24/7 Care', 'Medication Management', 'Personal Care Services');
    }

    return [...new Set(amenities)]; // Remove duplicates
  }

  private extractSpecialties(community: any): string[] {
    const specialties: string[] = [];

    if (community.specialPrograms) {
      specialties.push(...community.specialPrograms);
    }

    if (community.medicalServices) {
      specialties.push(...community.medicalServices);
    }

    // Infer specialties from care types
    if (community.careTypes?.includes('memory_care')) {
      specialties.push('Alzheimer\'s Care', 'Dementia Support', 'Cognitive Therapy');
    }

    if (community.hudPropertyType === 'low_income') {
      specialties.push('Affordable Housing', 'HUD Certified', 'Income-Based Pricing');
    }

    return [...new Set(specialties)];
  }

  private formatPriceRange(community: any): string {
    if (community.avgCost && community.avgCost > 0) {
      return `$${community.avgCost}/month`;
    }

    if (community.hudMinRent && community.hudMaxRent) {
      return `$${community.hudMinRent}-${community.hudMaxRent}/month`;
    }

    if (community.priceRange) {
      return community.priceRange;
    }

    return 'Contact for pricing';
  }

  private generateSearchExplanation(query: string, result: any): string {
    const reasons: string[] = [];

    if (result.name && query.toLowerCase().includes(result.name.toLowerCase())) {
      reasons.push('name match');
    }

    if (result.careTypes?.some((type: string) => 
      query.toLowerCase().includes(type.toLowerCase().replace('_', ' ')))) {
      reasons.push('care type match');
    }

    if (result.amenities?.some((amenity: string) => 
      query.toLowerCase().includes(amenity.toLowerCase()))) {
      reasons.push('amenity match');
    }

    if (result.city && query.toLowerCase().includes(result.city.toLowerCase())) {
      reasons.push('location match');
    }

    return reasons.length > 0 
      ? `Relevant due to: ${reasons.join(', ')}`
      : 'Semantic similarity match';
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      await this.client.misc.liveChecker().do();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      hasClient: !!this.client,
      className: this.className,
    };
  }
}

// Export singleton instance
export const weaviateService = new WeaviateService();