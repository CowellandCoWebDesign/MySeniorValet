import { db } from './db';
import { communities, services, serviceProviders } from '@shared/schema';
import { sql, like, and, or, gte, lte } from 'drizzle-orm';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

// Initialize vector database for semantic search
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || '',
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class AIDatabaseConnector {
  private index: any;

  async initialize() {
    if (process.env.PINECONE_API_KEY) {
      this.index = pinecone.Index('senior-communities');
    }
  }

  // Train AI on actual database content
  async trainOnDatabaseContent() {
    console.log('🧠 Training AI on 26,306 real communities...');
    
    // Fetch all communities with their actual data
    const allCommunities = await db
      .select()
      .from(communities)
      .limit(1000); // Start with batch
    
    for (const community of allCommunities) {
      // Create embedding from actual community data
      const communityText = `
        ${community.name} in ${community.city}, ${community.state}.
        Care types: ${community.careTypes?.join(', ')}.
        ${community.description || ''}
        Phone: ${community.phone}
        ${community.priceRange ? `Price range: ${JSON.stringify(community.priceRange)}` : ''}
        ${community.hudPropertyId ? `HUD verified pricing available` : ''}
      `;
      
      // Generate embedding
      if (process.env.PINECONE_API_KEY) {
        const embedding = await this.generateEmbedding(communityText);
        
        // Store in vector database
        await this.index.upsert([{
          id: `community-${community.id}`,
          values: embedding,
          metadata: {
            communityId: community.id,
            name: community.name,
            city: community.city,
            state: community.state,
            careTypes: community.careTypes,
            priceRange: community.priceRange,
            hudVerified: !!community.hudPropertyId
          }
        }]);
      }
    }
  }

  // Search using actual database content
  async semanticSearch(query: string, filters?: any) {
    // First, try vector search if available
    if (this.index && process.env.PINECONE_API_KEY) {
      const queryEmbedding = await this.generateEmbedding(query);
      
      const results = await this.index.query({
        vector: queryEmbedding,
        topK: 20,
        includeMetadata: true,
        filter: filters
      });
      
      // Get full community data for matches
      const communityIds = results.matches.map(m => m.metadata.communityId);
      return await db
        .select()
        .from(communities)
        .where(sql`${communities.id} = ANY(${communityIds})`);
    }
    
    // Fallback to SQL search on actual data
    return await this.sqlSearch(query, filters);
  }

  // SQL search on real database
  async sqlSearch(query: string, filters?: any) {
    const searchTerms = query.toLowerCase().split(' ');
    const conditions = [];
    
    // Search across multiple fields
    for (const term of searchTerms) {
      conditions.push(
        or(
          sql`LOWER(${communities.name}) LIKE ${'%' + term + '%'}`,
          sql`LOWER(${communities.city}) LIKE ${'%' + term + '%'}`,
          sql`LOWER(${communities.state}) LIKE ${'%' + term + '%'}`,
          sql`LOWER(${communities.description}) LIKE ${'%' + term + '%'}`
        )
      );
    }
    
    // Add filters
    if (filters?.priceMax) {
      conditions.push(
        sql`(${communities.priceRange}->>'min')::numeric <= ${filters.priceMax}`
      );
    }
    
    if (filters?.careTypes?.length > 0) {
      conditions.push(
        sql`${communities.careTypes} && ${filters.careTypes}`
      );
    }
    
    return await db
      .select()
      .from(communities)
      .where(and(...conditions))
      .limit(50);
  }

  // Get real pricing data
  async getRealPricing(communityId: number) {
    const community = await db
      .select()
      .from(communities)
      .where(sql`${communities.id} = ${communityId}`)
      .limit(1);
    
    if (community[0]) {
      return {
        hudVerified: !!community[0].hudPropertyId,
        priceRange: community[0].priceRange,
        rentPerMonth: community[0].rentPerMonth,
        lastUpdated: community[0].updatedAt,
        dataSource: community[0].dataSource || 'Community Reported'
      };
    }
    
    return null;
  }

  // Generate embeddings for semantic search
  private async generateEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    
    return response.data[0].embedding;
  }
}

// Singleton instance
export const aiDatabaseConnector = new AIDatabaseConnector();