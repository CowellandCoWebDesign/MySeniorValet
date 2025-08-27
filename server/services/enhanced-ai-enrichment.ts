/**
 * Enhanced AI Enrichment Service with Fuzzy Matching
 * ====================================================
 * Implements intelligent matching strategies to improve AI enrichment success rates
 * after data standardization initiative
 * 
 * Features:
 * - Fuzzy name matching with similarity scoring
 * - Alias mapping for common senior living chains
 * - Multiple search strategies (name, address, parent company)
 * - Smart fallback mechanisms
 * 
 * Created: August 27, 2025
 */

import { SimplifiedPerplexityService } from '../simplified-perplexity-service';

interface AliasMapping {
  database: string[];
  marketing: string[];
  parentCompany?: string;
}

interface SearchStrategy {
  type: 'exact' | 'fuzzy' | 'address' | 'parent' | 'alias';
  query: string;
  confidence: number;
}

import type { Community } from "@shared/schema";

export class EnhancedAIEnrichmentService {
  private perplexityService: SimplifiedPerplexityService;
  
  /**
   * Comprehensive alias mappings for major senior living chains
   * Maps various naming conventions to find communities
   */
  private static readonly CHAIN_ALIASES: Record<string, AliasMapping> = {
    'atria': {
      database: ['Atria', 'Atria Senior Living', 'Atria Retirement'],
      marketing: ['Atria Senior Living', 'Atria Senior Living Solutions', 'Atria Retirement & Assisted Living'],
      parentCompany: 'Atria Senior Living'
    },
    'brookdale': {
      database: ['Brookdale', 'Brookdale Senior Living', 'Brookdale Living'],
      marketing: ['Brookdale Senior Living', 'Brookdale Senior Living Solutions', 'Brookdale Memory Care'],
      parentCompany: 'Brookdale Senior Living Inc.'
    },
    'sunrise': {
      database: ['Sunrise', 'Sunrise Senior Living', 'Sunrise Assisted Living'],
      marketing: ['Sunrise Senior Living', 'Sunrise of', 'Sunrise at'],
      parentCompany: 'Sunrise Senior Living'
    },
    'holiday': {
      database: ['Holiday', 'Holiday Retirement', 'Holiday Senior Living'],
      marketing: ['Holiday Retirement', 'Holiday by Atria', 'Holiday Senior Living'],
      parentCompany: 'Atria Senior Living' // Holiday is owned by Atria
    },
    'assisted_living_concepts': {
      database: ['Assisted Living Concepts', 'ALC', 'Assisted Living'],
      marketing: ['Assisted Living Concepts', 'ALC Senior Living'],
      parentCompany: 'Assisted Living Concepts Inc.'
    },
    'five_star': {
      database: ['Five Star', 'Five Star Senior Living', '5 Star'],
      marketing: ['Five Star Senior Living', 'Five Star Quality Care'],
      parentCompany: 'Five Star Senior Living'
    },
    'capital_senior': {
      database: ['Capital Senior', 'Capital Senior Living', 'Capital'],
      marketing: ['Capital Senior Living', 'Capital Senior Housing'],
      parentCompany: 'Capital Senior Living Corporation'
    },
    'oakmont': {
      database: ['Oakmont', 'Oakmont Senior Living', 'Oakmont Management'],
      marketing: ['Oakmont Senior Living', 'Oakmont Management Group'],
      parentCompany: 'Oakmont Management Group'
    },
    'brightview': {
      database: ['Brightview', 'BrightView Senior Living', 'Bright View'],
      marketing: ['Brightview Senior Living', 'Brightview', 'BRIGHTVIEW'],
      parentCompany: 'Brightview Senior Living'
    },
    'watermark': {
      database: ['Watermark', 'Watermark Retirement', 'The Watermark'],
      marketing: ['Watermark Retirement Communities', 'The Watermark at'],
      parentCompany: 'Watermark Retirement Communities'
    }
  };

  constructor() {
    this.perplexityService = new SimplifiedPerplexityService();
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    
    if (s1 === s2) return 1.0;
    
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) return 0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Levenshtein distance calculation
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Find chain alias for a community name
   */
  private findChainAlias(communityName: string): AliasMapping | null {
    const lowerName = communityName.toLowerCase();
    
    for (const [chain, mapping] of Object.entries(EnhancedAIEnrichmentService.CHAIN_ALIASES)) {
      // Check if any database name pattern matches
      for (const dbName of mapping.database) {
        if (lowerName.includes(dbName.toLowerCase())) {
          return mapping;
        }
      }
    }
    
    return null;
  }

  /**
   * Generate multiple search strategies for a community
   */
  private generateSearchStrategies(
    communityName: string, 
    city: string, 
    state: string,
    address?: string
  ): SearchStrategy[] {
    const strategies: SearchStrategy[] = [];
    const location = `${city}, ${state}`;
    
    // 1. Exact name search
    strategies.push({
      type: 'exact',
      query: `"${communityName}" senior living ${location}`,
      confidence: 1.0
    });
    
    // 2. Check for chain aliases
    const chainAlias = this.findChainAlias(communityName);
    if (chainAlias) {
      // Try marketing variations
      for (const marketingName of chainAlias.marketing) {
        const locationIdentifier = communityName.replace(/^(Atria|Brookdale|Sunrise|Holiday|Oakmont|Brightview|Watermark|Five Star|Capital)[\s-]*/, '');
        
        if (locationIdentifier && locationIdentifier !== communityName) {
          // Try "Chain Name at Location" format
          strategies.push({
            type: 'alias',
            query: `"${marketingName} at ${locationIdentifier}" ${location}`,
            confidence: 0.9
          });
          
          // Try "Chain Name of Location" format
          strategies.push({
            type: 'alias',
            query: `"${marketingName} of ${locationIdentifier}" ${location}`,
            confidence: 0.9
          });
        }
        
        // Try parent company search
        if (chainAlias.parentCompany) {
          strategies.push({
            type: 'parent',
            query: `${chainAlias.parentCompany} "${locationIdentifier}" ${location}`,
            confidence: 0.8
          });
        }
      }
    }
    
    // 3. Remove generic suffixes and search
    const genericSuffixes = ['Senior Living', 'Assisted Living', 'Memory Care', 'Retirement', 'Community', 'Communities'];
    let simplifiedName = communityName;
    
    for (const suffix of genericSuffixes) {
      simplifiedName = simplifiedName.replace(new RegExp(`\\s*${suffix}\\s*$`, 'i'), '').trim();
    }
    
    if (simplifiedName !== communityName) {
      strategies.push({
        type: 'fuzzy',
        query: `"${simplifiedName}" senior living ${location}`,
        confidence: 0.85
      });
    }
    
    // 4. Address-based search if available
    if (address) {
      strategies.push({
        type: 'address',
        query: `senior living community at "${address}" ${location}`,
        confidence: 0.95
      });
    }
    
    // 5. Location + care type search (fallback)
    strategies.push({
      type: 'fuzzy',
      query: `senior living communities assisted living memory care "${city}" ${state}`,
      confidence: 0.5
    });
    
    return strategies;
  }

  /**
   * Find communities using fuzzy matching
   */
  findFuzzyMatches(searchQuery: string, allCommunities: Community[]): Community[] {
    const query = searchQuery.toLowerCase().trim();
    const matches: Array<{ community: Community; similarity: number }> = [];
    
    // Check for chain aliases
    const chainVariations = this.getChainVariations(query);
    
    for (const community of allCommunities) {
      const communityNameLower = community.name.toLowerCase();
      
      // Exact match
      if (communityNameLower === query) {
        matches.push({ community, similarity: 100 });
        continue;
      }
      
      // Contains query
      if (communityNameLower.includes(query) || query.includes(communityNameLower)) {
        matches.push({ community, similarity: 85 });
        continue;
      }
      
      // Check chain variations
      for (const variation of chainVariations) {
        if (communityNameLower.includes(variation.toLowerCase())) {
          matches.push({ community, similarity: 80 });
          break;
        }
      }
      
      // Word-level fuzzy matching for brand names
      const queryWords = query.split(/\s+/);
      const communityWords = communityNameLower.split(/\s+/);
      
      for (const qWord of queryWords) {
        for (const cWord of communityWords) {
          const wordSimilarity = this.calculateSimilarity(qWord, cWord);
          
          // Lower threshold for short words (likely brand abbreviations or typos)
          const threshold = qWord.length <= 6 ? 0.65 : 0.75;
          
          if (wordSimilarity >= threshold) {
            matches.push({ community, similarity: wordSimilarity * 100 });
            break;
          }
        }
      }
      
      // Full name fuzzy matching with lower threshold
      const fullSimilarity = this.calculateSimilarity(query, communityNameLower);
      if (fullSimilarity >= 0.40) { // 40% threshold for full name matching
        matches.push({ community, similarity: fullSimilarity * 100 });
      }
    }
    
    // Deduplicate by community ID and keep highest similarity
    const dedupedMatches = new Map<number, { community: Community; similarity: number }>();
    for (const match of matches) {
      const existing = dedupedMatches.get(match.community.id);
      if (!existing || existing.similarity < match.similarity) {
        dedupedMatches.set(match.community.id, match);
      }
    }
    
    // Sort by similarity and return top matches
    return Array.from(dedupedMatches.values())
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 20) // Return top 20 matches
      .map(m => m.community);
  }

  /**
   * Get chain variations for a search query
   */
  private getChainVariations(query: string): string[] {
    const variations: string[] = [];
    
    // Check each chain alias using the static CHAIN_ALIASES
    for (const [_, alias] of Object.entries(EnhancedAIEnrichmentService.CHAIN_ALIASES)) {
      for (const marketingName of alias.marketing) {
        if (query.includes(marketingName.toLowerCase())) {
          // Add all variations of this chain
          variations.push(...alias.marketing);
          variations.push(...alias.database); // Use database array instead of undefined variations
          if (alias.parentCompany) {
            variations.push(alias.parentCompany);
          }
          break;
        }
      }
    }
    
    return variations;
  }

  /**
   * Enhanced community search with multiple strategies
   */
  async findCommunityWithStrategies(
    communityId: number,
    communityName: string,
    city: string,
    state: string,
    address?: string
  ): Promise<any> {
    console.log(`🔍 Enhanced AI Enrichment for: ${communityName} in ${city}, ${state}`);
    
    const strategies = this.generateSearchStrategies(communityName, city, state, address);
    console.log(`📋 Generated ${strategies.length} search strategies`);
    
    // Try each strategy in order of confidence
    for (const strategy of strategies.sort((a, b) => b.confidence - a.confidence)) {
      console.log(`  🎯 Trying ${strategy.type} strategy (confidence: ${strategy.confidence}): ${strategy.query.substring(0, 50)}...`);
      
      try {
        const result = await this.perplexityService.findExactCommunity(
          strategy.query,
          `${city}, ${state}`
        );
        
        if (result.found) {
          // Validate the result matches our community
          const nameMatch = this.validateCommunityMatch(communityName, result.name || '');
          
          // Lower threshold for alias and parent company searches
          const threshold = strategy.type === 'alias' || strategy.type === 'parent' ? 0.4 : 0.5;
          
          if (nameMatch > threshold) { // Dynamic similarity threshold
            console.log(`  ✅ Found match with ${Math.round(nameMatch * 100)}% name similarity`);
            return {
              ...result,
              searchStrategy: strategy.type,
              confidence: strategy.confidence * nameMatch,
              originalQuery: communityName
            };
          } else {
            console.log(`  ⚠️ Found result but name similarity too low: ${Math.round(nameMatch * 100)}% (threshold: ${Math.round(threshold * 100)}%)`);
          }
        }
      } catch (error) {
        console.log(`  ❌ Strategy failed: ${error.message}`);
      }
    }
    
    console.log(`  📭 No matches found after trying all strategies`);
    return {
      found: false,
      searchAttempts: strategies.length,
      notes: 'Unable to find community with any search strategy'
    };
  }

  /**
   * Validate if a found community matches the requested one
   */
  private validateCommunityMatch(requested: string, found: string): number {
    // Direct similarity check
    const directSimilarity = this.calculateSimilarity(requested, found);
    
    // Check if it's a valid chain variation
    const requestedChain = this.findChainAlias(requested);
    const foundChain = this.findChainAlias(found);
    
    if (requestedChain && foundChain && requestedChain === foundChain) {
      // Same chain, check location part
      const requestedLocation = this.extractLocationFromName(requested);
      const foundLocation = this.extractLocationFromName(found);
      
      if (requestedLocation && foundLocation) {
        const locationSimilarity = this.calculateSimilarity(requestedLocation, foundLocation);
        return Math.max(directSimilarity, locationSimilarity * 0.9); // 90% weight for location match within same chain
      }
    }
    
    return directSimilarity;
  }

  /**
   * Extract location identifier from community name
   */
  private extractLocationFromName(name: string): string {
    // Remove common chain prefixes
    const chains = ['Atria', 'Brookdale', 'Sunrise', 'Holiday', 'Oakmont', 'Brightview', 'Watermark', 'Five Star', 'Capital'];
    let location = name;
    
    for (const chain of chains) {
      location = location.replace(new RegExp(`^${chain}\\s*(Senior Living)?\\s*(of|at)?\\s*`, 'i'), '').trim();
    }
    
    // Remove generic suffixes
    const suffixes = ['Senior Living', 'Assisted Living', 'Memory Care', 'Retirement', 'Community'];
    for (const suffix of suffixes) {
      location = location.replace(new RegExp(`\\s*${suffix}\\s*$`, 'i'), '').trim();
    }
    
    return location;
  }

  /**
   * Get enrichment summary
   */
  getEnrichmentSummary(result: any): string {
    if (!result.found) {
      return `❌ Community not found (tried ${result.searchAttempts || 1} strategies)`;
    }
    
    const items = [];
    if (result.phone) items.push('📞 Phone');
    if (result.officialWebsite) items.push('🌐 Website');
    if (result.pricing) items.push('💰 Pricing');
    if (result.photos?.length) items.push(`📸 ${result.photos.length} Photos`);
    if (result.amenities?.length) items.push(`✨ ${result.amenities.length} Amenities`);
    
    return `✅ Found via ${result.searchStrategy} (${Math.round((result.confidence || 0) * 100)}% confidence): ${items.join(', ')}`;
  }
}

export default EnhancedAIEnrichmentService;