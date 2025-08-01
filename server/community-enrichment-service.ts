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
    // Check for HUD property first
    if (community.hudPropertyId) {
      return 'hud_senior_housing';
    }

    // Check for VA housing
    if (community.name?.toLowerCase().includes('veteran') || 
        community.name?.toLowerCase().includes('va ') ||
        community.description?.toLowerCase().includes('veteran')) {
      return 'va_housing';
    }

    const prompt = `Based on the following community information, classify it into ONE of these subtypes:
    - hud_senior_housing (HUD-sponsored properties)
    - senior_mobile_park (55+ mobile home parks, manufactured homes)
    - active_adult_55plus (age-restricted active adult communities)
    - independent_living (independent living with meals/activities, no care)
    - assisted_living (provides help with daily activities)
    - memory_care (dedicated memory/dementia care)
    - skilled_nursing (SNF, nursing home with medical care)
    - board_and_care (small residential care homes <16 beds)
    - va_housing (veteran housing)
    - unlicensed_senior_housing (no license, nonprofit/religious)
    
    Rules:
    - If it mentions "mobile home", "manufactured", "lot rent" → senior_mobile_park
    - If it mentions "55+", "active adult", "age-restricted" without care → active_adult_55plus
    - If it provides meals and activities but no personal care → independent_living
    - If it helps with ADLs (bathing, dressing, medication) → assisted_living
    - If it specializes in memory/dementia care → memory_care
    - If it has skilled nursing, rehab, or medical staff → skilled_nursing
    - If it's a small home (<16 beds) with license → board_and_care
    - If no license mentioned and nonprofit/religious → unlicensed_senior_housing
    
    Community: ${community.name}
    Care Types: ${community.careTypes?.join(', ') || 'Not specified'}
    Description: ${community.description || 'None'}
    Address: ${community.address}, ${community.city}, ${community.state}
    License: ${community.licenseNumber ? 'Has license' : 'No license'}
    
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
      const validSubtypes = [
        'hud_senior_housing', 'senior_mobile_park', 'active_adult_55plus',
        'independent_living', 'assisted_living', 'memory_care',
        'skilled_nursing', 'board_and_care', 'va_housing',
        'unlicensed_senior_housing'
      ];
      
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