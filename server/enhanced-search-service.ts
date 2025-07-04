/**
 * Enhanced Search Service with ZIP Code Intelligence
 * Provides intelligent geographic search expansion and fallback mechanisms
 */

import { zipCodeService } from "./zip-code-mapping";
import { storage } from "./storage";
import type { Community, SearchCommunity } from "@shared/schema";

export interface SearchResult {
  communities: Community[];
  searchMetadata: {
    originalQuery: string;
    searchType: 'exact' | 'expanded' | 'fallback' | 'nearby';
    zipExpansion?: {
      originalZip: string;
      expandedZips: string[];
      expansionReason: string;
    };
    suggestions?: string[];
    totalResults: number;
    searchRadius?: number;
  };
}

export class EnhancedSearchService {
  /**
   * Intelligent search with ZIP code expansion and fallback mechanisms
   */
  async searchCommunities(params: SearchCommunity): Promise<SearchResult> {
    const { location, careType, budget, amenities, availability, distance, minRating } = params;
    
    console.log(`Enhanced search starting for: ${JSON.stringify(params)}`);
    
    if (!location) {
      // No location specified - return all communities
      const communities = await storage.searchCommunities(params);
      return {
        communities,
        searchMetadata: {
          originalQuery: 'All Communities',
          searchType: 'exact',
          totalResults: communities.length
        }
      };
    }

    // Check if this is a ZIP code that should be expanded
    if (this.isZipCode(location)) {
      const expandedZips = zipCodeService.expandZipSearch(location);
      
      if (expandedZips.length > 1) {
        // Perform expanded ZIP search
        console.log(`ZIP expansion: ${location} -> ${expandedZips.join(', ')}`);
        
        let allResults: Community[] = [];
        const seenIds = new Set<number>();
        
        // Search each expanded ZIP code
        for (const zip of expandedZips) {
          const zipParams = { ...params, location: zip };
          const zipResults = await storage.searchCommunities(zipParams);
          
          // Deduplicate by community ID
          for (const community of zipResults) {
            if (!seenIds.has(community.id)) {
              seenIds.add(community.id);
              allResults.push(community);
            }
          }
        }
        
        console.log(`Search returned ${allResults.length} communities`);
        
        if (allResults.length > 0) {
          const zipInfo = zipCodeService.getZipInfo(location);
          const expansionReason = zipInfo ? 
            `Expanded to include all ZIP codes in ${zipInfo.city}, ${zipInfo.county}` :
            `Expanded to include nearby ZIP codes in the same region`;
            
          return {
            communities: allResults,
            searchMetadata: {
              originalQuery: location,
              searchType: 'expanded',
              zipExpansion: {
                originalZip: location,
                expandedZips,
                expansionReason
              },
              totalResults: allResults.length
            }
          };
        }
      }
    }

    // First, try the original search (for non-ZIP or single ZIP searches)
    const originalResults = await storage.searchCommunities(params);
    
    if (originalResults.length > 0) {
      // Original search succeeded
      console.log(`Search returned ${originalResults.length} communities`);
      
      return {
        communities: originalResults,
        searchMetadata: {
          originalQuery: location,
          searchType: 'exact',
          totalResults: originalResults.length
        }
      };
    }

    // Original search returned no results - try intelligent fallbacks
    console.log(`No results for "${location}", trying intelligent fallbacks`);
    
    // Try ZIP code expansion if it's a ZIP code
    if (this.isZipCode(location)) {
      const fallbackResult = await this.tryZipCodeFallbacks(location, params);
      if (fallbackResult.communities.length > 0) {
        return fallbackResult;
      }
    }

    // Try city/county expansion
    const regionFallback = await this.tryRegionalFallbacks(location, params);
    if (regionFallback.communities.length > 0) {
      return regionFallback;
    }

    // No results found anywhere - return empty with suggestions
    const suggestions = await this.generateLocationSuggestions(location);
    
    return {
      communities: [],
      searchMetadata: {
        originalQuery: location,
        searchType: 'fallback',
        suggestions,
        totalResults: 0
      }
    };
  }

  /**
   * Analyze location for ZIP code expansion information
   */
  private analyzeLocationForZipExpansion(location: string): {
    expanded: boolean;
    expandedZips?: string[];
    expansionReason?: string;
  } {
    if (!this.isZipCode(location)) {
      return { expanded: false };
    }

    const expandedZips = zipCodeService.expandZipSearch(location);
    
    if (expandedZips.length > 1) {
      const zipInfo = zipCodeService.getZipInfo(location);
      const reason = zipInfo ? 
        `Expanded to include all ZIP codes in ${zipInfo.city}, ${zipInfo.county}` :
        `Expanded to include nearby ZIP codes in the same region`;
        
      return {
        expanded: true,
        expandedZips,
        expansionReason: reason
      };
    }

    return { expanded: false };
  }

  /**
   * Try ZIP code fallback searches
   */
  private async tryZipCodeFallbacks(zipCode: string, originalParams: SearchCommunity): Promise<SearchResult> {
    console.log(`Trying ZIP code fallbacks for: ${zipCode}`);
    
    // Try nearby ZIP codes in the same county
    const nearbyZips = zipCodeService.getNearestZips(zipCode);
    
    for (const nearbyZip of nearbyZips.slice(0, 3)) { // Try first 3 nearby ZIPs
      if (nearbyZip === zipCode) continue; // Skip the original ZIP
      
      const fallbackParams = { ...originalParams, location: nearbyZip };
      const results = await storage.searchCommunities(fallbackParams);
      
      if (results.length > 0) {
        const zipInfo = zipCodeService.getZipInfo(nearbyZip);
        const fallbackLocation = zipInfo ? `${zipInfo.city}, ${zipInfo.county}` : nearbyZip;
        
        return {
          communities: results,
          searchMetadata: {
            originalQuery: zipCode,
            searchType: 'nearby',
            totalResults: results.length,
            suggestions: [`Found ${results.length} communities near ${fallbackLocation}`]
          }
        };
      }
    }

    // Try county-wide search
    const county = zipCodeService.getCountyForZip(zipCode);
    if (county) {
      const countyZips = zipCodeService.getZipsByCounty(county);
      console.log(`Trying county-wide search for ${county}: ${countyZips.length} ZIP codes`);
      
      // Search all ZIP codes in the county
      for (const countyZip of countyZips.slice(0, 10)) { // Limit to first 10 to avoid too broad search
        const fallbackParams = { ...originalParams, location: countyZip };
        const results = await storage.searchCommunities(fallbackParams);
        
        if (results.length > 0) {
          return {
            communities: results,
            searchMetadata: {
              originalQuery: zipCode,
              searchType: 'nearby',
              totalResults: results.length,
              suggestions: [`Found ${results.length} communities in ${county}`]
            }
          };
        }
      }
    }

    return {
      communities: [],
      searchMetadata: {
        originalQuery: zipCode,
        searchType: 'fallback',
        totalResults: 0
      }
    };
  }

  /**
   * Try regional fallback searches (city, county, state)
   */
  private async tryRegionalFallbacks(location: string, originalParams: SearchCommunity): Promise<SearchResult> {
    console.log(`Trying regional fallbacks for: ${location}`);
    
    // If it looks like "City, State", try just the city
    if (location.includes(',')) {
      const cityPart = location.split(',')[0].trim();
      const fallbackParams = { ...originalParams, location: cityPart };
      const results = await storage.searchCommunities(fallbackParams);
      
      if (results.length > 0) {
        return {
          communities: results,
          searchMetadata: {
            originalQuery: location,
            searchType: 'nearby',
            totalResults: results.length,
            suggestions: [`Found ${results.length} communities in ${cityPart}`]
          }
        };
      }
    }

    // Try partial matches
    if (location.length > 3) {
      const partialLocation = location.substring(0, location.length - 1);
      const fallbackParams = { ...originalParams, location: partialLocation };
      const results = await storage.searchCommunities(fallbackParams);
      
      if (results.length > 0) {
        return {
          communities: results,
          searchMetadata: {
            originalQuery: location,
            searchType: 'nearby',
            totalResults: results.length,
            suggestions: [`Found ${results.length} communities near ${partialLocation}`]
          }
        };
      }
    }

    return {
      communities: [],
      searchMetadata: {
        originalQuery: location,
        searchType: 'fallback',
        totalResults: 0
      }
    };
  }

  /**
   * Generate location suggestions when no results are found
   */
  private async generateLocationSuggestions(location: string): Promise<string[]> {
    console.log(`Generating suggestions for: ${location}`);
    
    const suggestions: string[] = [];
    
    // If it's a ZIP code, suggest nearby cities
    if (this.isZipCode(location)) {
      const nearbyZips = zipCodeService.getNearestZips(location).slice(0, 3);
      for (const zip of nearbyZips) {
        const city = zipCodeService.getCityForZip(zip);
        if (city) {
          suggestions.push(`Try searching for "${city}"`);
        }
      }
    }

    // Suggest major cities in our coverage area
    const majorCities = [
      'San Francisco', 'Oakland', 'San Jose', 'Sacramento', 
      'Santa Rosa', 'Redding', 'Fremont', 'Palo Alto'
    ];
    
    // Find cities that start with the same letters
    const similarCities = majorCities.filter(city => 
      city.toLowerCase().startsWith(location.toLowerCase().substring(0, 2))
    );
    
    similarCities.forEach(city => {
      suggestions.push(`Try searching for "${city}"`);
    });

    // If no specific suggestions, provide general guidance
    if (suggestions.length === 0) {
      suggestions.push(
        'Try searching for a city name (e.g., "San Francisco")',
        'Try searching for a ZIP code (e.g., "94102")',
        'Try searching for a county (e.g., "Alameda County")'
      );
    }

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }

  /**
   * Check if a string is a ZIP code
   */
  private isZipCode(location: string): boolean {
    return /^\d{5}$/.test(location);
  }

  /**
   * Get comprehensive search statistics for debugging
   */
  async getSearchStatistics(): Promise<{
    totalCommunities: number;
    supportedZipCodes: number;
    supportedCounties: string[];
    searchCapabilities: {
      zipCodeExpansion: boolean;
      countyFallback: boolean;
      partialMatching: boolean;
      suggestionsEngine: boolean;
    };
  }> {
    const allCommunities = await storage.getAllCommunities();
    
    return {
      totalCommunities: allCommunities.length,
      supportedZipCodes: zipCodeService.getAllSupportedZips().length,
      supportedCounties: zipCodeService.getAllSupportedCounties(),
      searchCapabilities: {
        zipCodeExpansion: true,
        countyFallback: true,
        partialMatching: true,
        suggestionsEngine: true
      }
    };
  }
}

export const enhancedSearchService = new EnhancedSearchService();