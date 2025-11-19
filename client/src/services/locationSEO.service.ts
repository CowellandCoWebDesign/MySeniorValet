// Service for managing location-based SEO and content
// This service uses shared location data and extends it with client-specific functionality

import {
  LocationInfo as SharedLocationInfo,
  MAJOR_LOCATIONS as SHARED_LOCATIONS,
  generateLocationTitle,
  generateLocationDescription,
  generateLocationKeywords,
  generateLocationCanonicalUrl,
  findLocationFromQuery,
  findLocationBySlug
} from '@shared/location-seo';

// Extended LocationInfo with additional client-side fields
export interface LocationInfo extends SharedLocationInfo {
  communityCount?: number;
  priceRange?: {
    min: number;
    max: number;
  };
  neighborhoods?: string[];
  popularSearches?: string[];
}

// Re-export shared locations with type compatibility
export const MAJOR_LOCATIONS: LocationInfo[] = SHARED_LOCATIONS;

export class LocationSEOService {
  // Parse location from URL parameters or slug
  static parseLocationFromUrl(searchParams: URLSearchParams | string): LocationInfo | null {
    const params = typeof searchParams === 'string' 
      ? new URLSearchParams(searchParams)
      : searchParams;
    
    const locationParam = params.get('location');
    if (!locationParam) return null;
    
    return findLocationBySlug(locationParam) as LocationInfo;
  }
  
  // Generate SEO-optimized title (under 60 characters)
  static generateTitle(location: LocationInfo, pageType = 'search'): string {
    return generateLocationTitle(location, pageType);
  }
  
  // Generate meta description for location pages
  static generateDescription(location: LocationInfo): string {
    return generateLocationDescription(location);
  }
  
  // Generate keywords for SEO
  static generateKeywords(location: LocationInfo): string[] {
    return generateLocationKeywords(location);
  }
  
  // Generate canonical URL for the location page
  static generateCanonicalUrl(location: LocationInfo): string {
    return generateLocationCanonicalUrl(location);
  }
  
  // Find location based on search query
  static findLocation(query: string): LocationInfo | null {
    return findLocationFromQuery(query) as LocationInfo;
  }
  
  // Get location by slug
  static getLocationBySlug(slug: string): LocationInfo | null {
    return findLocationBySlug(slug) as LocationInfo;
  }
  
  // Get all locations for a specific state/province
  static getLocationsByState(stateAbbr: string): LocationInfo[] {
    return MAJOR_LOCATIONS.filter(loc => 
      loc.stateAbbr.toLowerCase() === stateAbbr.toLowerCase()
    );
  }
  
  // Get top locations by priority
  static getTopLocations(limit = 10): LocationInfo[] {
    return [...MAJOR_LOCATIONS]
      .sort((a, b) => (b.priority || 0.5) - (a.priority || 0.5))
      .slice(0, limit);
  }
  
  // Generate location-specific content
  static generateLocationContent(location: LocationInfo): {
    title: string;
    description: string;
    keywords: string[];
    content: string;
  } {
    const title = this.generateTitle(location);
    const description = this.generateDescription(location);
    const keywords = this.generateKeywords(location);
    
    const content = `
      <h1>${title}</h1>
      <p>${description}</p>
      
      <h2>Senior Living Options in ${location.city}, ${location.state}</h2>
      <p>Explore comprehensive senior care options in ${location.city}, including:</p>
      <ul>
        <li>Assisted Living Communities - Support with daily activities</li>
        <li>Memory Care Facilities - Specialized Alzheimer's and dementia care</li>
        <li>Nursing Homes - 24/7 skilled nursing care</li>
        <li>Independent Living - Active senior communities</li>
        <li>Continuing Care Retirement Communities (CCRC)</li>
      </ul>
      
      <h2>Why Choose MySeniorValet for ${location.city} Senior Living?</h2>
      <ul>
        <li>Transparent pricing with no hidden fees</li>
        <li>Verified HUD rates for qualifying properties</li>
        <li>Real-time availability updates</li>
        <li>Comprehensive community profiles</li>
        <li>No referral fees or markups</li>
      </ul>
    `;
    
    return {
      title,
      description,
      keywords,
      content
    };
  }
  
  // Check if a location is valid
  static isValidLocation(slug: string): boolean {
    return MAJOR_LOCATIONS.some(loc => loc.slug === slug);
  }
  
  // Get nearby locations (simple implementation)
  static getNearbyLocations(location: LocationInfo, limit = 5): LocationInfo[] {
    // Get other locations in the same state
    const sameState = this.getLocationsByState(location.stateAbbr)
      .filter(loc => loc.slug !== location.slug);
    
    // If not enough in same state, add locations from high-priority areas
    if (sameState.length < limit) {
      const additional = this.getTopLocations(limit - sameState.length)
        .filter(loc => loc.slug !== location.slug && 
                       !sameState.some(s => s.slug === loc.slug));
      return [...sameState, ...additional].slice(0, limit);
    }
    
    return sameState.slice(0, limit);
  }
}