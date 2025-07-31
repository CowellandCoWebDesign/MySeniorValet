/**
 * Enhanced Weaviate Vector Database Service for MySeniorValet
 * Implements 2025 best practices for AI-native senior living discovery
 * 
 * Features:
 * - Modern client with automatic gRPC optimization
 * - Hybrid search (semantic + keyword)
 * - RAG for natural language recommendations
 * - Advanced personalization
 * - Multi-modal search capabilities
 * - Real-time community scoring
 */

import weaviate, { WeaviateClient, ApiKey } from 'weaviate-ts-client';
import { db } from './db';
import { communities, users } from '../shared/schema';
import { eq, sql, and, or, inArray } from 'drizzle-orm';

export interface EnhancedCommunityVector {
  id: string;
  name: string;
  description: string;
  careTypes: string[];
  specialties: string[];
  amenities: string[];
  city: string;
  state: string;
  location: {
    latitude: number;
    longitude: number;
  };
  pricing: {
    min: number;
    max: number;
    currency: string;
  };
  qualityMetrics: {
    inspectionScore: number;
    familyRating: number;
    staffRatio: number;
    certifications: string[];
  };
  availability: {
    status: 'available' | 'waitlist' | 'full';
    unitsAvailable: number;
    nextAvailability?: Date;
  };
  multimedia: {
    photos: string[];
    virtualTourUrl?: string;
    videoTour?: string;
  };
  characteristics: string[]; // For semantic search: "pet-friendly", "garden-focused", "tech-savvy"
}

export interface PersonalizationProfile {
  userId: string;
  preferences: {
    careTypes: string[];
    priceRange: { min: number; max: number };
    location: {
      city?: string;
      state?: string;
      radius?: number; // miles
      coordinates?: { lat: number; lng: number };
    };
    mustHave: string[]; // amenities
    dealBreakers: string[];
    specialNeeds: string[];
    lifestyle: string[]; // "active", "quiet", "social", "independent"
  };
  searchHistory: Array<{
    query: string;
    timestamp: Date;
    clickedResults: string[];
  }>;
  interactions: Array<{
    communityId: string;
    action: 'view' | 'favorite' | 'tour_request' | 'call' | 'share';
    timestamp: Date;
    duration?: number;
  }>;
  familyContext: {
    relationshipToCare: string;
    decisionMakers: number;
    timeframe: 'immediate' | '1-3months' | '3-6months' | '6months+';
    currentSituation: string;
  };
}

export interface SemanticSearchOptions {
  query: string;
  limit?: number;
  minScore?: number;
  userProfile?: PersonalizationProfile;
  filters?: {
    careTypes?: string[];
    priceRange?: { min?: number; max?: number };
    location?: {
      city?: string;
      state?: string;
      radius?: number;
      coordinates?: { lat: number; lng: number };
    };
    availability?: 'available' | 'waitlist' | 'any';
    qualityMin?: number;
  };
  searchType?: 'semantic' | 'hybrid' | 'keyword';
  alpha?: number; // For hybrid search balance (0.0 = keyword only, 1.0 = semantic only)
}

export interface EnhancedSearchResult {
  community: EnhancedCommunityVector;
  score: number;
  relevanceFactors: {
    semanticMatch: number;
    keywordMatch: number;
    personalizationBoost: number;
    qualityScore: number;
    availabilityBonus: number;
  };
  explanation: string;
  personalizedInsights: string[];
  nextActions: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    reason: string;
  }>;
}

export interface RAGResponse {
  answer: string;
  confidence: number;
  sources: Array<{
    communityId: string;
    communityName: string;
    relevantInfo: string;
  }>;
  followUpQuestions: string[];
  recommendations: EnhancedSearchResult[];
}

class EnhancedWeaviateService {
  private client: WeaviateClient | null = null;
  private isInitialized = false;
  private readonly className = 'SeniorCommunityV2';
  private readonly userProfileClass = 'UserProfile';

  constructor() {
    this.initializeClient();
  }

  private async initializeClient() {
    try {
      if (!process.env.WEAVIATE_REST_ENDPOINT || !process.env.WEAVIATE_API_KEY) {
        console.log('⚠️ Weaviate credentials not found, enhanced AI search disabled');
        return;
      }

      // Use modern client configuration for optimal performance
      this.client = weaviate.client({
        scheme: 'https',
        host: process.env.WEAVIATE_REST_ENDPOINT.replace('https://', '').replace('http://', ''),
        apiKey: new ApiKey(process.env.WEAVIATE_API_KEY),
        headers: {
          'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY || '',
          'X-Anthropic-Api-Key': process.env.ANTHROPIC_API_KEY || '',
        },
      });

      // Test connection with retry logic
      await this.testConnection();
      
      // Initialize enhanced schemas
      await this.initializeEnhancedSchemas();
      this.isInitialized = true;

      console.log('🚀 Enhanced Weaviate service initialized with AI-native capabilities');

    } catch (error) {
      console.error('❌ Enhanced Weaviate initialization failed:', error);
      this.client = null;
    }
  }

  private async testConnection(retries = 3): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        await this.client!.misc.liveChecker().do();
        console.log('✅ Weaviate connection verified');
        return;
      } catch (error) {
        if (i === retries - 1) throw error;
        console.log(`🔄 Retrying Weaviate connection (${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  private async initializeEnhancedSchemas() {
    if (!this.client) return;

    try {
      const existingClasses = await this.client.schema.getter().do();
      const classNames = existingClasses.classes?.map(c => c.class) || [];

      // Enhanced Community Schema
      if (!classNames.includes(this.className)) {
        await this.createEnhancedCommunitySchema();
      }

      // User Profile Schema for Personalization
      if (!classNames.includes(this.userProfileClass)) {
        await this.createUserProfileSchema();
      }

      console.log('✅ Enhanced schemas initialized');

    } catch (error) {
      console.error('❌ Schema initialization failed:', error);
    }
  }

  private async createEnhancedCommunitySchema() {
    const schema = {
      class: this.className,
      description: 'Enhanced senior living communities with AI-native search and personalization',
      vectorizer: 'text2vec-openai',
      moduleConfig: {
        'text2vec-openai': {
          model: 'text-embedding-3-large', // Higher accuracy
          type: 'text',
          dimensions: 3072
        },
        'generative-openai': {
          model: 'gpt-4o'
        }
      },
      properties: [
        // Core Identity
        { name: 'communityId', dataType: ['string'], description: 'Unique community identifier' },
        { name: 'name', dataType: ['text'], description: 'Community name' },
        { name: 'description', dataType: ['text'], description: 'Comprehensive community description' },
        
        // Care & Services
        { name: 'careTypes', dataType: ['text[]'], description: 'Types of care provided' },
        { name: 'specialties', dataType: ['text[]'], description: 'Medical and care specialties' },
        { name: 'amenities', dataType: ['text[]'], description: 'Available amenities and features' },
        { name: 'characteristics', dataType: ['text[]'], description: 'Community personality traits' },
        
        // Location
        { name: 'city', dataType: ['text'], description: 'City location' },
        { name: 'state', dataType: ['text'], description: 'State location' },
        { name: 'locationCoordinates', dataType: ['geoCoordinates'], description: 'GPS coordinates' },
        
        // Pricing
        { name: 'priceMin', dataType: ['number'], description: 'Minimum monthly cost' },
        { name: 'priceMax', dataType: ['number'], description: 'Maximum monthly cost' },
        { name: 'pricingTiers', dataType: ['text[]'], description: 'Available pricing tiers' },
        
        // Quality Metrics
        { name: 'inspectionScore', dataType: ['number'], description: 'Government inspection score' },
        { name: 'familyRating', dataType: ['number'], description: 'Family satisfaction rating' },
        { name: 'staffRatio', dataType: ['number'], description: 'Staff to resident ratio' },
        { name: 'certifications', dataType: ['text[]'], description: 'Quality certifications' },
        
        // Availability
        { name: 'availabilityStatus', dataType: ['text'], description: 'Current availability status' },
        { name: 'unitsAvailable', dataType: ['number'], description: 'Number of available units' },
        { name: 'waitlistLength', dataType: ['number'], description: 'Current waitlist length' },
        
        // Media & Virtual Content
        { name: 'photoGallery', dataType: ['text[]'], description: 'Photo URLs' },
        { name: 'virtualTourUrl', dataType: ['text'], description: 'Virtual tour link' },
        { name: 'videoTourUrl', dataType: ['text'], description: 'Video tour link' },
        
        // Enriched Content for AI
        { name: 'aiGeneratedSummary', dataType: ['text'], description: 'AI-generated community summary' },
        { name: 'familyTestimonials', dataType: ['text[]'], description: 'Family testimonials' },
        { name: 'staffBios', dataType: ['text[]'], description: 'Key staff information' },
        
        // Temporal Data
        { name: 'lastUpdated', dataType: ['date'], description: 'Last data update timestamp' },
        { name: 'seasonalPrograms', dataType: ['text[]'], description: 'Seasonal activities and programs' }
      ]
    };

    await this.client!.schema.classCreator().withClass(schema).do();
    console.log('✅ Enhanced community schema created');
  }

  private async createUserProfileSchema() {
    const schema = {
      class: this.userProfileClass,
      description: 'User profiles for personalized senior living recommendations',
      vectorizer: 'text2vec-openai',
      moduleConfig: {
        'text2vec-openai': {
          model: 'text-embedding-3-small',
          type: 'text'
        }
      },
      properties: [
        { name: 'userId', dataType: ['string'], description: 'User identifier' },
        { name: 'preferences', dataType: ['object'], description: 'User preferences and requirements' },
        { name: 'searchHistory', dataType: ['object[]'], description: 'Historical search patterns' },
        { name: 'interactions', dataType: ['object[]'], description: 'Community interactions' },
        { name: 'familyContext', dataType: ['object'], description: 'Family decision context' },
        { name: 'preferenceVector', dataType: ['text'], description: 'Vectorized preferences for similarity matching' }
      ]
    };

    await this.client!.schema.classCreator().withClass(schema).do();
    console.log('✅ User profile schema created');
  }

  /**
   * Enhanced semantic search with hybrid capabilities
   */
  async enhancedSemanticSearch(options: SemanticSearchOptions): Promise<EnhancedSearchResult[]> {
    if (!this.isInitialized || !this.client) {
      console.warn('Weaviate not initialized, falling back to basic search');
      return this.fallbackSearch(options);
    }

    try {
      const {
        query,
        limit = 10,
        minScore = 0.7,
        userProfile,
        filters,
        searchType = 'hybrid',
        alpha = 0.75
      } = options;

      let searchBuilder = this.client.graphql.get()
        .withClassName(this.className)
        .withFields(`
          communityId
          name
          description
          careTypes
          specialties
          amenities
          characteristics
          city
          state
          priceMin
          priceMax
          inspectionScore
          familyRating
          availabilityStatus
          unitsAvailable
          aiGeneratedSummary
          _additional {
            score
            explainScore
          }
        `);

      // Apply search type
      if (searchType === 'semantic') {
        searchBuilder = searchBuilder.withNearText({ concepts: [query] });
      } else if (searchType === 'hybrid') {
        searchBuilder = searchBuilder.withHybrid({
          query: query,
          alpha: alpha
        });
      } else if (searchType === 'keyword') {
        searchBuilder = searchBuilder.withBm25({ query: query });
      }

      // Apply filters
      if (filters) {
        const whereConditions = this.buildWhereConditions(filters);
        if (whereConditions) {
          searchBuilder = searchBuilder.withWhere(whereConditions);
        }
      }

      // Apply geo-filtering if location specified
      if (filters?.location?.coordinates && filters?.location?.radius) {
        searchBuilder = searchBuilder.withNearObject({
          distance: filters.location.radius * 1609.34, // Convert miles to meters
          latitude: filters.location.coordinates.lat,
          longitude: filters.location.coordinates.lng
        });
      }

      const result = await searchBuilder.withLimit(limit).do();

      // Process and enhance results
      const enhancedResults = await this.processSearchResults(
        result.data.Get[this.className] || [],
        userProfile,
        query
      );

      return enhancedResults.filter(r => r.score >= minScore);

    } catch (error) {
      console.error('Enhanced search failed:', error);
      return this.fallbackSearch(options);
    }
  }

  /**
   * RAG-powered natural language community recommendations
   */
  async generateRAGRecommendations(
    query: string,
    userProfile?: PersonalizationProfile,
    limit: number = 5
  ): Promise<RAGResponse> {
    if (!this.isInitialized || !this.client) {
      throw new Error('Weaviate not initialized for RAG operations');
    }

    try {
      // First, get relevant communities
      const searchResults = await this.enhancedSemanticSearch({
        query,
        limit: limit * 2, // Get more to have better context
        userProfile,
        searchType: 'hybrid'
      });

      // Generate contextual prompt
      const context = searchResults.slice(0, limit).map(result => 
        `Community: ${result.community.name}
         Location: ${result.community.city}, ${result.community.state}
         Care Types: ${result.community.careTypes.join(', ')}
         Description: ${result.community.description}
         Price Range: $${result.community.pricing.min} - $${result.community.pricing.max}
         Rating: ${result.community.qualityMetrics.familyRating}/5
         Availability: ${result.community.availability.status}`
      ).join('\n\n');

      const userContext = userProfile ? this.buildUserContext(userProfile) : '';

      // Use Weaviate's generative module for RAG
      const ragQuery = `
        Based on the following senior living communities and user context, provide personalized recommendations for: "${query}"

        ${userContext}

        Communities:
        ${context}

        Please provide:
        1. A comprehensive answer addressing the user's needs
        2. Specific recommendations with reasoning
        3. Important considerations for this family
        4. Suggested next steps
      `;

      const ragResult = await this.client.graphql.get()
        .withClassName(this.className)
        .withFields('communityId name description')
        .withNearText({ concepts: [query] })
        .withLimit(limit)
        .withGenerate({
          singlePrompt: ragQuery
        })
        .do();

      const generatedText = ragResult.data.Get[this.className]?.[0]?._additional?.generate?.singleResult || '';

      return {
        answer: generatedText,
        confidence: 0.85, // Could be calculated based on search scores
        sources: searchResults.slice(0, limit).map(r => ({
          communityId: r.community.id,
          communityName: r.community.name,
          relevantInfo: r.explanation
        })),
        followUpQuestions: this.generateFollowUpQuestions(query, userProfile),
        recommendations: searchResults.slice(0, limit)
      };

    } catch (error) {
      console.error('RAG generation failed:', error);
      throw error;
    }
  }

  /**
   * Update user personalization profile
   */
  async updateUserProfile(profile: PersonalizationProfile): Promise<void> {
    if (!this.isInitialized || !this.client) return;

    try {
      // Create vectorized representation of preferences
      const preferenceText = [
        ...profile.preferences.careTypes,
        ...profile.preferences.mustHave,
        ...profile.preferences.lifestyle,
        profile.familyContext.currentSituation
      ].join(' ');

      const profileData = {
        userId: profile.userId,
        preferences: profile.preferences,
        searchHistory: profile.searchHistory,
        interactions: profile.interactions,
        familyContext: profile.familyContext,
        preferenceVector: preferenceText
      };

      // Check if profile exists
      const existingProfile = await this.client.graphql.get()
        .withClassName(this.userProfileClass)
        .withFields('userId')
        .withWhere({
          path: ['userId'],
          operator: 'Equal',
          valueText: profile.userId
        })
        .do();

      if (existingProfile.data.Get[this.userProfileClass]?.length > 0) {
        // Update existing profile
        await this.client.data.updater()
          .withClassName(this.userProfileClass)
          .withProperties(profileData)
          .withWhere({
            path: ['userId'],
            operator: 'Equal',
            valueText: profile.userId
          })
          .do();
      } else {
        // Create new profile
        await this.client.data.creator()
          .withClassName(this.userProfileClass)
          .withProperties(profileData)
          .do();
      }

      console.log(`✅ User profile updated for ${profile.userId}`);

    } catch (error) {
      console.error('Failed to update user profile:', error);
    }
  }

  /**
   * Get personalized community recommendations
   */
  async getPersonalizedRecommendations(
    userId: string,
    limit: number = 10
  ): Promise<EnhancedSearchResult[]> {
    if (!this.isInitialized || !this.client) return [];

    try {
      // Get user profile
      const profileResult = await this.client.graphql.get()
        .withClassName(this.userProfileClass)
        .withFields('preferences searchHistory interactions familyContext preferenceVector')
        .withWhere({
          path: ['userId'],
          operator: 'Equal',
          valueText: userId
        })
        .do();

      const userProfile = profileResult.data.Get[this.userProfileClass]?.[0];
      if (!userProfile) {
        console.warn(`No profile found for user ${userId}`);
        return [];
      }

      // Use preference vector for similarity search
      const recommendationQuery = userProfile.preferenceVector || 'senior living assisted living';

      return await this.enhancedSemanticSearch({
        query: recommendationQuery,
        limit,
        userProfile: userProfile as PersonalizationProfile,
        searchType: 'hybrid',
        alpha: 0.8 // Favor semantic matching for personalization
      });

    } catch (error) {
      console.error('Personalized recommendations failed:', error);
      return [];
    }
  }

  // Private helper methods

  private buildWhereConditions(filters: SemanticSearchOptions['filters']) {
    const conditions: any[] = [];

    if (filters?.careTypes?.length) {
      conditions.push({
        path: ['careTypes'],
        operator: 'ContainsAny',
        valueTextArray: filters.careTypes
      });
    }

    if (filters?.priceRange?.min !== undefined) {
      conditions.push({
        path: ['priceMin'],
        operator: 'GreaterThanEqual',
        valueNumber: filters.priceRange.min
      });
    }

    if (filters?.priceRange?.max !== undefined) {
      conditions.push({
        path: ['priceMax'],
        operator: 'LessThanEqual',
        valueNumber: filters.priceRange.max
      });
    }

    if (filters?.availability && filters.availability !== 'any') {
      conditions.push({
        path: ['availabilityStatus'],
        operator: 'Equal',
        valueText: filters.availability
      });
    }

    if (filters?.qualityMin !== undefined) {
      conditions.push({
        path: ['inspectionScore'],
        operator: 'GreaterThanEqual',
        valueNumber: filters.qualityMin
      });
    }

    if (conditions.length === 0) return null;
    if (conditions.length === 1) return conditions[0];

    return {
      operator: 'And',
      operands: conditions
    };
  }

  private async processSearchResults(
    rawResults: any[],
    userProfile?: PersonalizationProfile,
    originalQuery?: string
  ): Promise<EnhancedSearchResult[]> {
    return rawResults.map(result => {
      const baseScore = result._additional?.score || 0;
      const personalizationBoost = userProfile ? this.calculatePersonalizationBoost(result, userProfile) : 0;
      const qualityScore = result.inspectionScore / 100;
      const availabilityBonus = result.availabilityStatus === 'available' ? 0.1 : 0;

      const finalScore = Math.min(1.0, baseScore + personalizationBoost + availabilityBonus);

      return {
        community: {
          id: result.communityId,
          name: result.name,
          description: result.description,
          careTypes: result.careTypes || [],
          specialties: result.specialties || [],
          amenities: result.amenities || [],
          city: result.city,
          state: result.state,
          location: {
            latitude: 0, // Would come from locationCoordinates
            longitude: 0
          },
          pricing: {
            min: result.priceMin || 0,
            max: result.priceMax || 0,
            currency: 'USD'
          },
          qualityMetrics: {
            inspectionScore: result.inspectionScore || 0,
            familyRating: result.familyRating || 0,
            staffRatio: 0, // Would come from data
            certifications: result.certifications || []
          },
          availability: {
            status: result.availabilityStatus as any || 'unknown',
            unitsAvailable: result.unitsAvailable || 0
          },
          multimedia: {
            photos: result.photoGallery || [],
            virtualTourUrl: result.virtualTourUrl
          },
          characteristics: result.characteristics || []
        },
        score: finalScore,
        relevanceFactors: {
          semanticMatch: baseScore,
          keywordMatch: 0, // Would be calculated for hybrid search
          personalizationBoost,
          qualityScore,
          availabilityBonus
        },
        explanation: this.generateExplanation(result, userProfile, originalQuery),
        personalizedInsights: this.generatePersonalizedInsights(result, userProfile),
        nextActions: this.generateNextActions(result, userProfile)
      };
    });
  }

  private calculatePersonalizationBoost(result: any, userProfile: PersonalizationProfile): number {
    let boost = 0;

    // Care type preference match
    const userCareTypes = userProfile.preferences.careTypes;
    const communityTypes = result.careTypes || [];
    const careMatch = userCareTypes.filter(type => 
      communityTypes.some((ct: string) => ct.toLowerCase().includes(type.toLowerCase()))
    ).length / Math.max(userCareTypes.length, 1);
    boost += careMatch * 0.2;

    // Price range match
    const userMin = userProfile.preferences.priceRange.min;
    const userMax = userProfile.preferences.priceRange.max;
    const commMin = result.priceMin || 0;
    const commMax = result.priceMax || 999999;
    
    if (commMin >= userMin && commMax <= userMax) {
      boost += 0.15; // Perfect price match
    } else if (!(commMax < userMin || commMin > userMax)) {
      boost += 0.1; // Partial price overlap
    }

    // Location preference
    if (userProfile.preferences.location.city && 
        result.city?.toLowerCase() === userProfile.preferences.location.city.toLowerCase()) {
      boost += 0.1;
    }

    return Math.min(0.3, boost); // Cap at 30% boost
  }

  private generateExplanation(result: any, userProfile?: PersonalizationProfile, query?: string): string {
    const factors = [];
    
    if (query) {
      factors.push(`Matches "${query}" based on community features and services`);
    }
    
    if (userProfile) {
      const matchingCareTypes = userProfile.preferences.careTypes.filter(type =>
        result.careTypes?.some((ct: string) => ct.toLowerCase().includes(type.toLowerCase()))
      );
      if (matchingCareTypes.length > 0) {
        factors.push(`Provides ${matchingCareTypes.join(', ')} care you're seeking`);
      }
      
      if (result.city === userProfile.preferences.location.city) {
        factors.push(`Located in your preferred city of ${result.city}`);
      }
    }
    
    if (result.inspectionScore > 85) {
      factors.push(`High quality with ${result.inspectionScore}% inspection score`);
    }
    
    if (result.availabilityStatus === 'available') {
      factors.push('Currently has availability');
    }

    return factors.length > 0 ? factors.join('. ') + '.' : 'Recommended based on community features.';
  }

  private generatePersonalizedInsights(result: any, userProfile?: PersonalizationProfile): string[] {
    if (!userProfile) return [];

    const insights = [];

    if (userProfile.familyContext.timeframe === 'immediate' && result.availabilityStatus === 'available') {
      insights.push('Available immediately - perfect for your urgent timeline');
    }

    if (userProfile.preferences.mustHave.length > 0) {
      const availableAmenities = result.amenities || [];
      const matchingAmenities = userProfile.preferences.mustHave.filter(amenity =>
        availableAmenities.some((a: string) => a.toLowerCase().includes(amenity.toLowerCase()))
      );
      if (matchingAmenities.length > 0) {
        insights.push(`Has ${matchingAmenities.length} of your must-have amenities`);
      }
    }

    if (result.familyRating > 4.5) {
      insights.push('Highly rated by families like yours');
    }

    return insights;
  }

  private generateNextActions(result: any, userProfile?: PersonalizationProfile): Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    reason: string;
  }> {
    const actions = [];

    if (result.availabilityStatus === 'available') {
      actions.push({
        action: 'Schedule a tour',
        priority: 'high' as const,
        reason: 'Currently has availability and meets your criteria'
      });
    }

    if (result.virtualTourUrl) {
      actions.push({
        action: 'Take virtual tour',
        priority: 'medium' as const,
        reason: 'Get a better feel for the community before visiting'
      });
    }

    actions.push({
      action: 'Request pricing details',
      priority: 'medium' as const,
      reason: 'Get current pricing and available financial assistance'
    });

    if (userProfile?.familyContext.decisionMakers > 1) {
      actions.push({
        action: 'Share with family',
        priority: 'medium' as const,
        reason: 'Include other family members in the decision process'
      });
    }

    return actions;
  }

  private buildUserContext(userProfile: PersonalizationProfile): string {
    return `
User Context:
- Looking for: ${userProfile.preferences.careTypes.join(', ')}
- Budget: $${userProfile.preferences.priceRange.min} - $${userProfile.preferences.priceRange.max}
- Location: ${userProfile.preferences.location.city || 'Flexible'}, ${userProfile.preferences.location.state || 'Flexible'}
- Must-have amenities: ${userProfile.preferences.mustHave.join(', ') || 'None specified'}
- Timeline: ${userProfile.familyContext.timeframe}
- Relationship: ${userProfile.familyContext.relationshipToCare}
    `.trim();
  }

  private generateFollowUpQuestions(query: string, userProfile?: PersonalizationProfile): string[] {
    const questions = [
      'Would you like to schedule tours at any of these communities?',
      'What specific amenities are most important to you?',
      'Do you have questions about the care levels offered?'
    ];

    if (userProfile?.familyContext.timeframe === 'immediate') {
      questions.unshift('Which communities have immediate availability?');
    }

    if (userProfile?.preferences.location.radius) {
      questions.push('Would you consider communities slightly outside your preferred area?');
    }

    return questions;
  }

  private async fallbackSearch(options: SemanticSearchOptions): Promise<EnhancedSearchResult[]> {
    // Fallback to database search when Weaviate is unavailable
    console.log('Using fallback database search');
    
    try {
      let query = db.select().from(communities);
      
      // Apply basic filters
      if (options.filters?.careTypes?.length) {
        query = query.where(
          or(...options.filters.careTypes.map(type => 
            sql`${communities.careTypes} @> ${JSON.stringify([type])}`
          ))
        );
      }

      if (options.filters?.location?.city) {
        query = query.where(eq(communities.city, options.filters.location.city));
      }

      if (options.filters?.location?.state) {
        query = query.where(eq(communities.state, options.filters.location.state));
      }

      const results = await query.limit(options.limit || 10);

      return results.map(community => ({
        community: {
          id: community.id.toString(),
          name: community.name,
          description: community.description || '',
          careTypes: community.careTypes || [],
          specialties: [],
          amenities: community.amenities || [],
          city: community.city,
          state: community.state,
          location: {
            latitude: community.latitude || 0,
            longitude: community.longitude || 0
          },
          pricing: {
            min: 0,
            max: 0,
            currency: 'USD'
          },
          qualityMetrics: {
            inspectionScore: 0,
            familyRating: 0,
            staffRatio: 0,
            certifications: []
          },
          availability: {
            status: 'unknown' as const,
            unitsAvailable: 0
          },
          multimedia: {
            photos: []
          },
          characteristics: []
        },
        score: 0.5,
        relevanceFactors: {
          semanticMatch: 0,
          keywordMatch: 0.5,
          personalizationBoost: 0,
          qualityScore: 0,
          availabilityBonus: 0
        },
        explanation: 'Found via database search',
        personalizedInsights: [],
        nextActions: []
      }));

    } catch (error) {
      console.error('Fallback search failed:', error);
      return [];
    }
  }

  /**
   * Sync communities from database to Weaviate
   */
  async syncCommunitiesToVector(): Promise<void> {
    if (!this.isInitialized || !this.client) {
      console.log('Weaviate not available for sync');
      return;
    }

    try {
      console.log('🔄 Starting community vector sync...');

      // Get all communities from database
      const dbCommunities = await db.select().from(communities).limit(1000);
      
      let syncCount = 0;
      const batchSize = 100;

      for (let i = 0; i < dbCommunities.length; i += batchSize) {
        const batch = dbCommunities.slice(i, i + batchSize);
        
        const batchImport = this.client.batch.objectsBatcher();

        for (const community of batch) {
          // Convert database community to vector format
          const vectorData = {
            communityId: community.id.toString(),
            name: community.name,
            description: community.description || `${community.name} senior living community in ${community.city}, ${community.state}`,
            careTypes: community.careTypes || [],
            specialties: [],
            amenities: community.amenities || [],
            characteristics: this.extractCharacteristics(community),
            city: community.city,
            state: community.state,
            locationCoordinates: community.latitude && community.longitude ? {
              latitude: community.latitude,
              longitude: community.longitude
            } : null,
            priceMin: 0,
            priceMax: 0,
            inspectionScore: 0,
            familyRating: 0,
            availabilityStatus: 'unknown',
            unitsAvailable: 0,
            waitlistLength: 0,
            photoGallery: [],
            aiGeneratedSummary: this.generateAISummary(community),
            lastUpdated: new Date().toISOString()
          };

          batchImport.withObject({
            class: this.className,
            properties: vectorData
          });
        }

        await batchImport.do();
        syncCount += batch.length;
        
        console.log(`✅ Synced ${syncCount}/${dbCommunities.length} communities`);
      }

      console.log(`🎉 Vector sync complete: ${syncCount} communities synced`);

    } catch (error) {
      console.error('❌ Vector sync failed:', error);
    }
  }

  private extractCharacteristics(community: any): string[] {
    const characteristics = [];
    
    if (community.name?.toLowerCase().includes('garden')) {
      characteristics.push('garden-focused');
    }
    if (community.amenities?.some((a: string) => a.toLowerCase().includes('pet'))) {
      characteristics.push('pet-friendly');
    }
    if (community.amenities?.some((a: string) => a.toLowerCase().includes('technology'))) {
      characteristics.push('tech-savvy');
    }
    
    return characteristics;
  }

  private generateAISummary(community: any): string {
    return `${community.name} is a senior living community located in ${community.city}, ${community.state}. ` +
           `It offers ${(community.careTypes || []).join(', ')} services and features ${(community.amenities || []).slice(0, 3).join(', ')}.`;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ 
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: Record<string, any>;
  }> {
    const details: Record<string, any> = {
      initialized: this.isInitialized,
      client: !!this.client,
      timestamp: new Date().toISOString()
    };

    if (!this.client) {
      return { status: 'unhealthy', details };
    }

    try {
      await this.client.misc.liveChecker().do();
      details.connection = 'success';
      
      // Check if our schemas exist
      const schemas = await this.client.schema.getter().do();
      const classNames = schemas.classes?.map(c => c.class) || [];
      details.schemas = {
        community: classNames.includes(this.className),
        userProfile: classNames.includes(this.userProfileClass)
      };

      const allSchemasExist = details.schemas.community && details.schemas.userProfile;
      
      return {
        status: allSchemasExist ? 'healthy' : 'degraded',
        details
      };

    } catch (error) {
      details.error = error.message;
      return { status: 'unhealthy', details };
    }
  }
}

// Export singleton instance
export const enhancedWeaviateService = new EnhancedWeaviateService();