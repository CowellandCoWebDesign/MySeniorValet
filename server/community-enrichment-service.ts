import { db } from './db';
import { communities, enrichments } from '@shared/schema';
import { eq, isNull, sql, and, or } from 'drizzle-orm';
import { MultiAIOrchestrator } from './multi-ai-intelligence';
import { AnthropicAIService } from './ai-services';
import { OpenAI } from 'openai';

interface EnrichmentResult {
  communityId: number;
  description: string;
  careTypeExplanation: string;
  suggestedTags: string[];
  suggestedSubtype?: string;
  dataSource: string;
  confidence: number;
}

export class CommunityEnrichmentService {
  private multiAI: MultiAIOrchestrator;
  private anthropic: AnthropicAIService;
  private openai: OpenAI;

  constructor() {
    this.multiAI = new MultiAIOrchestrator();
    this.anthropic = new AnthropicAIService();
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  // Fix incomplete subtype tagging
  async fixSubtypeTagging() {
    console.log('🏷️ Starting subtype tagging cleanup...');
    
    // Find communities with missing or generic subtypes
    const communitiesNeedingTags = await db
      .select()
      .from(communities)
      .where(
        or(
          isNull(communities.communitySubtype),
          eq(communities.communitySubtype, 'traditional_assisted_living')
        )
      )
      .limit(100); // Process in batches

    console.log(`Found ${communitiesNeedingTags.length} communities needing subtype classification`);

    for (const community of communitiesNeedingTags) {
      try {
        const suggestedSubtype = await this.classifySubtype(community);
        
        if (suggestedSubtype && suggestedSubtype !== community.communitySubtype) {
          await db
            .update(communities)
            .set({ 
              communitySubtype: suggestedSubtype,
              updatedAt: new Date()
            })
            .where(eq(communities.id, community.id));
          
          console.log(`✅ Updated ${community.name} to subtype: ${suggestedSubtype}`);
        }
      } catch (error) {
        console.error(`Error classifying ${community.name}:`, error);
      }
    }
  }

  // Classify community subtype using AI
  private async classifySubtype(community: any): Promise<string | null> {
    const prompt = `Based on the following community information, classify it into ONE of these subtypes:
    - mobile_home_park (55+ mobile home communities)
    - active_adult_55plus (age-restricted active living)
    - memory_care_only (dedicated memory/dementia care)
    - licensed_board_and_care (small residential care homes)
    - traditional_assisted_living (standard assisted living)
    
    Community: ${community.name}
    Care Types: ${community.careTypes?.join(', ') || 'Not specified'}
    Description: ${community.description || 'None'}
    Address: ${community.address}, ${community.city}, ${community.state}
    
    Respond with just the subtype string, nothing else.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 50,
        temperature: 0.3
      });

      const subtype = response.choices[0]?.message?.content?.trim();
      
      // Validate the response
      const validSubtypes = ['mobile_home_park', 'active_adult_55plus', 'memory_care_only', 
                            'licensed_board_and_care', 'traditional_assisted_living'];
      
      return validSubtypes.includes(subtype || '') ? subtype : null;
    } catch (error) {
      console.error('AI classification error:', error);
      return null;
    }
  }

  // Enrich community with AI-generated summaries from public data
  async enrichCommunity(communityId: number): Promise<EnrichmentResult | null> {
    try {
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId));

      if (!community) {
        throw new Error(`Community ${communityId} not found`);
      }

      // Only enrich from verified public sources
      const publicData = {
        name: community.name,
        careTypes: community.careTypes,
        state: community.state,
        city: community.city,
        hudProperty: !!community.hudPropertyId,
        medicareProvider: !!community.cmsProviderId,
        licenseStatus: community.licenseStatus
      };

      // Generate AI summaries using public metadata only
      const description = await this.generateDescription(publicData);
      const careTypeExplanation = await this.generateCareTypeExplanation(publicData.careTypes || []);
      const suggestedTags = await this.suggestTags(publicData);

      const enrichmentData = {
        communityId,
        description,
        careTypeExplanation,
        suggestedTags,
        dataSource: 'ai_generated_from_public_metadata',
        confidence: 0.85
      };

      // Store in enrichments table
      await db.insert(enrichments).values({
        communityId,
        enrichmentType: 'ai_summary',
        data: enrichmentData,
        source: 'public_metadata_ai',
        confidence: 0.85,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return enrichmentData;
    } catch (error) {
      console.error(`Error enriching community ${communityId}:`, error);
      return null;
    }
  }

  // Generate description from public metadata
  private async generateDescription(publicData: any): Promise<string> {
    const prompt = `Create a brief, factual description for a senior living community based only on this public information:
    Name: ${publicData.name}
    Location: ${publicData.city}, ${publicData.state}
    Care Types: ${publicData.careTypes?.join(', ') || 'Not specified'}
    ${publicData.hudProperty ? 'This is a HUD-subsidized property.' : ''}
    ${publicData.medicareProvider ? 'This is a Medicare-certified provider.' : ''}
    
    Write 2-3 sentences that are factual and based only on the provided information. Do not make assumptions.`;

    const response = await this.anthropic.generateContent(prompt);
    return response || 'Community information pending verification.';
  }

  // Generate care type explanation
  private async generateCareTypeExplanation(careTypes: string[]): Promise<string> {
    if (!careTypes || careTypes.length === 0) {
      return 'Care types not specified. Contact community for details.';
    }

    const prompt = `Explain these senior care types in simple terms for families:
    ${careTypes.join(', ')}
    
    Write 2-3 sentences explaining what these care types mean. Use general knowledge only.`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
      temperature: 0.7
    });

    return response.choices[0]?.message?.content || 'Care type information available upon request.';
  }

  // Suggest tags based on public data
  private async suggestTags(publicData: any): Promise<string[]> {
    const tags: string[] = [];
    
    // Add factual tags based on data
    if (publicData.hudProperty) tags.push('HUD Property');
    if (publicData.medicareProvider) tags.push('Medicare Certified');
    if (publicData.licenseStatus === 'Active') tags.push('Licensed');
    
    // Add care type tags
    if (publicData.careTypes?.includes('Memory Care')) tags.push('Memory Care');
    if (publicData.careTypes?.includes('Assisted Living')) tags.push('Assisted Living');
    
    return tags;
  }

  // Batch enrichment for admin use
  async batchEnrichCommunities(limit: number = 50) {
    console.log(`🤖 Starting batch enrichment for up to ${limit} communities...`);
    
    // Find communities without enrichment
    const unenrichedCommunities = await db
      .select({ id: communities.id, name: communities.name })
      .from(communities)
      .leftJoin(enrichments, eq(communities.id, enrichments.communityId))
      .where(isNull(enrichments.id))
      .limit(limit);

    console.log(`Found ${unenrichedCommunities.length} communities to enrich`);

    let successCount = 0;
    for (const community of unenrichedCommunities) {
      try {
        await this.enrichCommunity(community.id);
        successCount++;
        console.log(`✅ Enriched: ${community.name}`);
        
        // Add delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Failed to enrich ${community.name}:`, error);
      }
    }

    console.log(`Batch enrichment complete: ${successCount}/${unenrichedCommunities.length} successful`);
    return { total: unenrichedCommunities.length, success: successCount };
  }
}

export const communityEnrichmentService = new CommunityEnrichmentService();