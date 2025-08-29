/**
 * ADVANCED SEARCH INTELLIGENCE SERVICE
 * Next-generation search capabilities for MySeniorValet
 */

import { db } from '../db';
import { communities } from '@shared/schema';
import { sql, ilike, and, or, gte, lte, inArray } from 'drizzle-orm';

export interface SearchIntent {
  type: 'location' | 'care_level' | 'lifestyle' | 'budget' | 'medical' | 'family' | 'comparative';
  confidence: number;
  entities: string[];
  suggestions: string[];
}

export interface AdvancedSearchOptions {
  includeSemanticMatching?: boolean;
  includeLifestyleInference?: boolean;
  includePredictiveRecommendations?: boolean;
  userContext?: {
    previousSearches?: string[];
    locationHistory?: string[];
    carePreferences?: string[];
  };
}

export class AdvancedSearchIntelligence {
  
  /**
   * Analyze search intent using NLP and pattern recognition
   */
  async analyzeSearchIntent(query: string): Promise<SearchIntent> {
    const normalizedQuery = query.toLowerCase().trim();
    const words = normalizedQuery.split(/\s+/);
    
    // Intent classification patterns
    const intentPatterns = {
      location: {
        patterns: ['near', 'in', 'close to', 'around', 'city', 'state', 'area'],
        entities: this.extractLocationEntities(words),
        confidence: this.calculateLocationConfidence(normalizedQuery)
      },
      care_level: {
        patterns: ['memory', 'assisted', 'independent', 'nursing', 'care', 'alzheimer', 'dementia'],
        entities: this.extractCareEntities(words),
        confidence: this.calculateCareConfidence(normalizedQuery)
      },
      lifestyle: {
        patterns: ['active', 'luxury', 'golf', 'pet', 'garden', 'social', 'quiet', 'amenities'],
        entities: this.extractLifestyleEntities(words),
        confidence: this.calculateLifestyleConfidence(normalizedQuery)
      },
      budget: {
        patterns: ['under', 'budget', 'affordable', 'cheap', 'expensive', 'luxury', '$'],
        entities: this.extractBudgetEntities(normalizedQuery),
        confidence: this.calculateBudgetConfidence(normalizedQuery)
      },
      medical: {
        patterns: ['hospital', 'doctor', 'medical', 'health', 'therapy', 'rehab'],
        entities: this.extractMedicalEntities(words),
        confidence: this.calculateMedicalConfidence(normalizedQuery)
      },
      family: {
        patterns: ['family', 'visit', 'close to family', 'grandchildren', 'children'],
        entities: this.extractFamilyEntities(words),
        confidence: this.calculateFamilyConfidence(normalizedQuery)
      },
      comparative: {
        patterns: ['like', 'similar', 'compared to', 'better than', 'same as'],
        entities: this.extractComparativeEntities(words),
        confidence: this.calculateComparativeConfidence(normalizedQuery)
      }
    };
    
    // Find highest confidence intent
    let bestIntent: SearchIntent = {
      type: 'location',
      confidence: 0,
      entities: [],
      suggestions: []
    };
    
    for (const [type, pattern] of Object.entries(intentPatterns)) {
      if (pattern.confidence > bestIntent.confidence) {
        bestIntent = {
          type: type as SearchIntent['type'],
          confidence: pattern.confidence,
          entities: pattern.entities,
          suggestions: await this.generateIntentSuggestions(type as SearchIntent['type'], pattern.entities)
        };
      }
    }
    
    return bestIntent;
  }
  
  /**
   * Perform semantic search with lifestyle matching
   */
  async semanticSearch(query: string, options: AdvancedSearchOptions = {}) {
    const intent = await this.analyzeSearchIntent(query);
    
    let baseQuery = db.select().from(communities);
    const conditions = [];
    
    // Apply intent-based filtering
    switch (intent.type) {
      case 'lifestyle':
        conditions.push(...this.buildLifestyleConditions(intent.entities));
        break;
      case 'care_level':
        conditions.push(...this.buildCareConditions(intent.entities));
        break;
      case 'location':
        conditions.push(...this.buildLocationConditions(intent.entities));
        break;
      case 'budget':
        conditions.push(...this.buildBudgetConditions(intent.entities));
        break;
      case 'medical':
        conditions.push(...this.buildMedicalConditions(intent.entities));
        break;
    }
    
    if (conditions.length > 0) {
      baseQuery = baseQuery.where(and(...conditions));
    }
    
    const results = await baseQuery.limit(50);
    
    return {
      communities: results,
      intent,
      semanticMatches: options.includeSemanticMatching ? 
        await this.findSemanticMatches(query) : [],
      recommendations: options.includePredictiveRecommendations ? 
        await this.generatePredictiveRecommendations(intent, options.userContext) : []
    };
  }
  
  /**
   * Generate personalized search recommendations
   */
  async generateSearchRecommendations(userContext?: {
    previousSearches?: string[];
    locationHistory?: string[];
    carePreferences?: string[];
  }) {
    const recommendations = [];
    
    // Analyze user patterns
    if (userContext?.previousSearches?.length) {
      const commonIntents = await this.analyzeSearchPatterns(userContext.previousSearches);
      recommendations.push(...this.generatePatternBasedSuggestions(commonIntents));
    }
    
    // Location-based recommendations
    if (userContext?.locationHistory?.length) {
      recommendations.push(...await this.generateLocationBasedSuggestions(userContext.locationHistory));
    }
    
    // Care progression recommendations
    if (userContext?.carePreferences?.length) {
      recommendations.push(...await this.generateCareProgressionSuggestions(userContext.carePreferences));
    }
    
    // Trending searches
    recommendations.push(...await this.getTrendingSearches());
    
    return recommendations.slice(0, 10);
  }
  
  // Helper methods for entity extraction
  private extractLocationEntities(words: string[]): string[] {
    const locationWords = [];
    const stateAbbreviations = ['CA', 'FL', 'TX', 'NY', 'PA', 'OH', 'IL', 'MI', 'NC', 'GA'];
    
    words.forEach(word => {
      if (word.length > 2 && /^[A-Za-z]+$/.test(word)) {
        locationWords.push(word);
      }
      if (stateAbbreviations.includes(word.toUpperCase())) {
        locationWords.push(word.toUpperCase());
      }
    });
    
    return locationWords;
  }
  
  private extractCareEntities(words: string[]): string[] {
    const careKeywords = ['memory', 'assisted', 'independent', 'nursing', 'alzheimer', 'dementia', 'skilled'];
    return words.filter(word => careKeywords.some(keyword => word.includes(keyword)));
  }
  
  private extractLifestyleEntities(words: string[]): string[] {
    const lifestyleKeywords = ['golf', 'pool', 'garden', 'pet', 'active', 'social', 'quiet', 'luxury'];
    return words.filter(word => lifestyleKeywords.some(keyword => word.includes(keyword)));
  }
  
  private extractBudgetEntities(query: string): string[] {
    const budgetMatches = [];
    const priceMatch = query.match(/\$[\d,]+/g);
    if (priceMatch) budgetMatches.push(...priceMatch);
    
    const rangeMatch = query.match(/under \$?(\d+)/i);
    if (rangeMatch) budgetMatches.push(`under_${rangeMatch[1]}`);
    
    if (query.includes('budget') || query.includes('affordable')) budgetMatches.push('budget');
    if (query.includes('luxury') || query.includes('premium')) budgetMatches.push('luxury');
    
    return budgetMatches;
  }
  
  private extractMedicalEntities(words: string[]): string[] {
    const medicalKeywords = ['hospital', 'doctor', 'medical', 'health', 'therapy', 'rehabilitation'];
    return words.filter(word => medicalKeywords.some(keyword => word.includes(keyword)));
  }
  
  private extractFamilyEntities(words: string[]): string[] {
    const familyKeywords = ['family', 'children', 'grandchildren', 'visit', 'nearby'];
    return words.filter(word => familyKeywords.some(keyword => word.includes(keyword)));
  }
  
  private extractComparativeEntities(words: string[]): string[] {
    const comparativeKeywords = ['like', 'similar', 'compared', 'better', 'same'];
    return words.filter(word => comparativeKeywords.some(keyword => word.includes(keyword)));
  }
  
  // Confidence calculation methods
  private calculateLocationConfidence(query: string): number {
    let confidence = 0;
    if (/\b(in|near|around|close to)\b/i.test(query)) confidence += 0.4;
    if (/\b[A-Z][a-z]+,?\s+[A-Z]{2}\b/.test(query)) confidence += 0.5; // City, State pattern
    if (/\b(city|town|area|region|county)\b/i.test(query)) confidence += 0.3;
    return Math.min(confidence, 1.0);
  }
  
  private calculateCareConfidence(query: string): number {
    let confidence = 0;
    const careTerms = ['memory', 'assisted', 'independent', 'nursing', 'alzheimer', 'dementia'];
    careTerms.forEach(term => {
      if (query.includes(term)) confidence += 0.3;
    });
    return Math.min(confidence, 1.0);
  }
  
  private calculateLifestyleConfidence(query: string): number {
    let confidence = 0;
    const lifestyleTerms = ['golf', 'pool', 'garden', 'pet', 'active', 'social', 'quiet', 'luxury', 'amenities'];
    lifestyleTerms.forEach(term => {
      if (query.includes(term)) confidence += 0.25;
    });
    return Math.min(confidence, 1.0);
  }
  
  private calculateBudgetConfidence(query: string): number {
    let confidence = 0;
    if (/\$[\d,]+/.test(query)) confidence += 0.6;
    if (/\b(under|budget|affordable|cheap|expensive|luxury)\b/i.test(query)) confidence += 0.4;
    return Math.min(confidence, 1.0);
  }
  
  private calculateMedicalConfidence(query: string): number {
    let confidence = 0;
    const medicalTerms = ['hospital', 'doctor', 'medical', 'health', 'therapy'];
    medicalTerms.forEach(term => {
      if (query.includes(term)) confidence += 0.3;
    });
    return Math.min(confidence, 1.0);
  }
  
  private calculateFamilyConfidence(query: string): number {
    let confidence = 0;
    const familyTerms = ['family', 'children', 'grandchildren', 'visit'];
    familyTerms.forEach(term => {
      if (query.includes(term)) confidence += 0.35;
    });
    return Math.min(confidence, 1.0);
  }
  
  private calculateComparativeConfidence(query: string): number {
    let confidence = 0;
    if (/\b(like|similar to|compared to|better than|same as)\b/i.test(query)) confidence += 0.5;
    return Math.min(confidence, 1.0);
  }
  
  // Condition builders
  private buildLifestyleConditions(entities: string[]) {
    const conditions = [];
    entities.forEach(entity => {
      if (entity.includes('golf')) {
        conditions.push(ilike(communities.amenities, '%golf%'));
      }
      if (entity.includes('pet')) {
        conditions.push(ilike(communities.amenities, '%pet%'));
      }
      if (entity.includes('pool')) {
        conditions.push(or(
          ilike(communities.amenities, '%pool%'),
          ilike(communities.amenities, '%swimming%')
        ));
      }
    });
    return conditions;
  }
  
  private buildCareConditions(entities: string[]) {
    const conditions = [];
    entities.forEach(entity => {
      if (entity.includes('memory') || entity.includes('alzheimer') || entity.includes('dementia')) {
        conditions.push(ilike(communities.careTypes, '%memory%'));
      }
      if (entity.includes('assisted')) {
        conditions.push(ilike(communities.careTypes, '%assisted%'));
      }
      if (entity.includes('independent')) {
        conditions.push(ilike(communities.careTypes, '%independent%'));
      }
    });
    return conditions;
  }
  
  private buildLocationConditions(entities: string[]) {
    const conditions = [];
    entities.forEach(entity => {
      conditions.push(or(
        ilike(communities.city, `%${entity}%`),
        ilike(communities.state, `%${entity}%`)
      ));
    });
    return conditions;
  }
  
  private buildBudgetConditions(entities: string[]) {
    const conditions = [];
    entities.forEach(entity => {
      if (entity.startsWith('under_')) {
        const amount = parseInt(entity.split('_')[1]);
        conditions.push(lte(communities.rentPerMonth, amount));
      }
      if (entity === 'luxury') {
        conditions.push(gte(communities.rentPerMonth, 5000));
      }
      if (entity === 'budget') {
        conditions.push(lte(communities.rentPerMonth, 3000));
      }
    });
    return conditions;
  }
  
  private buildMedicalConditions(entities: string[]) {
    const conditions = [];
    entities.forEach(entity => {
      if (entity.includes('hospital')) {
        conditions.push(ilike(communities.amenities, '%medical%'));
      }
    });
    return conditions;
  }
  
  // Advanced helper methods
  private async generateIntentSuggestions(type: string, entities: string[]): Promise<string[]> {
    const suggestions = [];
    
    switch (type) {
      case 'location':
        suggestions.push(`Best senior living in ${entities[0] || 'your area'}`);
        suggestions.push(`Memory care near ${entities[0] || 'you'}`);
        break;
      case 'care_level':
        suggestions.push(`${entities[0] || 'Memory'} care facilities with high ratings`);
        suggestions.push(`Affordable ${entities[0] || 'assisted'} living options`);
        break;
      case 'lifestyle':
        suggestions.push(`Senior communities with ${entities[0] || 'amenities'}`);
        suggestions.push(`Active adult communities for ${entities[0] || 'lifestyle'} lovers`);
        break;
    }
    
    return suggestions;
  }
  
  private async findSemanticMatches(query: string): Promise<any[]> {
    // Implement semantic matching logic here
    return [];
  }
  
  private async generatePredictiveRecommendations(intent: SearchIntent, userContext?: any): Promise<string[]> {
    // Implement predictive recommendation logic here
    return [];
  }
  
  private async analyzeSearchPatterns(searches: string[]): Promise<string[]> {
    // Analyze user search patterns
    return [];
  }
  
  private generatePatternBasedSuggestions(intents: string[]): string[] {
    // Generate suggestions based on user patterns
    return [];
  }
  
  private async generateLocationBasedSuggestions(locations: string[]): Promise<string[]> {
    // Generate location-based suggestions
    return [];
  }
  
  private async generateCareProgressionSuggestions(preferences: string[]): Promise<string[]> {
    // Suggest care progression options
    return [];
  }
  
  private async getTrendingSearches(): Promise<string[]> {
    return [
      'Memory care near me',
      'Luxury senior living with golf',
      'Pet-friendly assisted living',
      'Senior communities with pools',
      'Active adult 55+ communities'
    ];
  }
}

export const advancedSearchIntelligence = new AdvancedSearchIntelligence();