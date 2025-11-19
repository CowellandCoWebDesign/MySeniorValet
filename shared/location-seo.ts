// Shared location SEO configuration and utilities
// This module is used by both client and server for consistent SEO generation

export interface LocationInfo {
  city: string;
  state: string;
  stateAbbr: string;
  slug: string;
  country?: 'US' | 'CA';
  priority?: number;
}

// Major locations for SEO targeting
export const MAJOR_LOCATIONS: LocationInfo[] = [
  // Texas
  { city: 'Fort Worth', state: 'Texas', stateAbbr: 'TX', slug: 'fort-worth-tx', country: 'US', priority: 0.9 },
  { city: 'Dallas', state: 'Texas', stateAbbr: 'TX', slug: 'dallas-tx', country: 'US', priority: 0.9 },
  { city: 'Houston', state: 'Texas', stateAbbr: 'TX', slug: 'houston-tx', country: 'US', priority: 0.9 },
  { city: 'Austin', state: 'Texas', stateAbbr: 'TX', slug: 'austin-tx', country: 'US', priority: 0.9 },
  { city: 'San Antonio', state: 'Texas', stateAbbr: 'TX', slug: 'san-antonio-tx', country: 'US', priority: 0.85 },
  { city: 'Plano', state: 'Texas', stateAbbr: 'TX', slug: 'plano-tx', country: 'US', priority: 0.8 },
  { city: 'Arlington', state: 'Texas', stateAbbr: 'TX', slug: 'arlington-tx', country: 'US', priority: 0.8 },
  
  // California
  { city: 'Los Angeles', state: 'California', stateAbbr: 'CA', slug: 'los-angeles-ca', country: 'US', priority: 0.95 },
  { city: 'San Francisco', state: 'California', stateAbbr: 'CA', slug: 'san-francisco-ca', country: 'US', priority: 0.9 },
  { city: 'San Diego', state: 'California', stateAbbr: 'CA', slug: 'san-diego-ca', country: 'US', priority: 0.85 },
  { city: 'Sacramento', state: 'California', stateAbbr: 'CA', slug: 'sacramento-ca', country: 'US', priority: 0.8 },
  { city: 'San Jose', state: 'California', stateAbbr: 'CA', slug: 'san-jose-ca', country: 'US', priority: 0.85 },
  { city: 'Redding', state: 'California', stateAbbr: 'CA', slug: 'redding-ca', country: 'US', priority: 0.7 },
  
  // Canada
  { city: 'Toronto', state: 'Ontario', stateAbbr: 'ON', slug: 'toronto-on', country: 'CA', priority: 0.95 },
  { city: 'Vancouver', state: 'British Columbia', stateAbbr: 'BC', slug: 'vancouver-bc', country: 'CA', priority: 0.9 },
  { city: 'Montreal', state: 'Quebec', stateAbbr: 'QC', slug: 'montreal-qc', country: 'CA', priority: 0.88 },
  { city: 'Calgary', state: 'Alberta', stateAbbr: 'AB', slug: 'calgary-ab', country: 'CA', priority: 0.85 },
  { city: 'Ottawa', state: 'Ontario', stateAbbr: 'ON', slug: 'ottawa-on', country: 'CA', priority: 0.83 },
  { city: 'Edmonton', state: 'Alberta', stateAbbr: 'AB', slug: 'edmonton-ab', country: 'CA', priority: 0.8 },
  
  // Florida
  { city: 'Miami', state: 'Florida', stateAbbr: 'FL', slug: 'miami-fl', country: 'US', priority: 0.9 },
  { city: 'Orlando', state: 'Florida', stateAbbr: 'FL', slug: 'orlando-fl', country: 'US', priority: 0.85 },
  { city: 'Tampa', state: 'Florida', stateAbbr: 'FL', slug: 'tampa-fl', country: 'US', priority: 0.85 },
  { city: 'Jacksonville', state: 'Florida', stateAbbr: 'FL', slug: 'jacksonville-fl', country: 'US', priority: 0.8 },
  { city: 'Panama City Beach', state: 'Florida', stateAbbr: 'FL', slug: 'panama-city-beach-fl', country: 'US', priority: 0.75 },
  
  // New York
  { city: 'New York', state: 'New York', stateAbbr: 'NY', slug: 'new-york-ny', country: 'US', priority: 0.95 },
  { city: 'Brooklyn', state: 'New York', stateAbbr: 'NY', slug: 'brooklyn-ny', country: 'US', priority: 0.85 },
  { city: 'Buffalo', state: 'New York', stateAbbr: 'NY', slug: 'buffalo-ny', country: 'US', priority: 0.75 },
  
  // Other major US cities
  { city: 'Phoenix', state: 'Arizona', stateAbbr: 'AZ', slug: 'phoenix-az', country: 'US', priority: 0.88 },
  { city: 'Chicago', state: 'Illinois', stateAbbr: 'IL', slug: 'chicago-il', country: 'US', priority: 0.92 },
  { city: 'Philadelphia', state: 'Pennsylvania', stateAbbr: 'PA', slug: 'philadelphia-pa', country: 'US', priority: 0.88 },
  { city: 'Seattle', state: 'Washington', stateAbbr: 'WA', slug: 'seattle-wa', country: 'US', priority: 0.85 },
  { city: 'Boston', state: 'Massachusetts', stateAbbr: 'MA', slug: 'boston-ma', country: 'US', priority: 0.85 },
  { city: 'Denver', state: 'Colorado', stateAbbr: 'CO', slug: 'denver-co', country: 'US', priority: 0.8 },
  { city: 'Atlanta', state: 'Georgia', stateAbbr: 'GA', slug: 'atlanta-ga', country: 'US', priority: 0.85 },
  { city: 'Portland', state: 'Oregon', stateAbbr: 'OR', slug: 'portland-or', country: 'US', priority: 0.8 },
];

// Generate SEO title for a location (under 60 chars)
export function generateLocationTitle(location: LocationInfo, pageType = 'search'): string {
  const locationStr = `${location.city}, ${location.stateAbbr}`;
  
  let serviceType = 'Senior Living';
  switch (pageType) {
    case 'assisted':
      serviceType = 'Assisted Living';
      break;
    case 'memory':
      serviceType = 'Memory Care';
      break;
    case 'nursing':
      serviceType = 'Nursing Homes';
      break;
    case 'independent':
      serviceType = 'Independent Living';
      break;
  }
  
  const title = `${serviceType} in ${locationStr} | MySeniorValet`;
  
  // Ensure title is under 60 characters
  if (title.length > 60) {
    // Shorten the brand name for long city names
    return `${serviceType} ${locationStr} | MSV`;
  }
  
  return title;
}

// Generate SEO description for a location
export function generateLocationDescription(location: LocationInfo): string {
  return `Find multiple senior living communities in ${location.city}, ${location.state} with transparent pricing. Compare assisted living, memory care, nursing homes with real availability, verified HUD rates, no hidden fees or referral markups.`;
}

// Generate SEO keywords for a location
export function generateLocationKeywords(location: LocationInfo): string[] {
  return [
    `senior living ${location.city.toLowerCase()}`,
    `assisted living ${location.city.toLowerCase()} ${location.stateAbbr.toLowerCase()}`,
    `memory care ${location.city.toLowerCase()}`,
    `nursing homes ${location.city.toLowerCase()}`,
    `retirement homes ${location.city.toLowerCase()}`,
    `${location.city.toLowerCase()} senior care`,
    `${location.state.toLowerCase()} senior living`,
    `senior communities ${location.city.toLowerCase()}`,
    `alzheimer care ${location.city.toLowerCase()}`,
    `dementia care ${location.city.toLowerCase()}`
  ];
}

// Generate canonical URL for a location
export function generateLocationCanonicalUrl(location: LocationInfo): string {
  return `https://www.myseniorvalet.com/ai-search-intelligence?location=${location.slug}&tab=simplified`;
}

// Find location from search query
export function findLocationFromQuery(query: string): LocationInfo | null {
  const normalizedQuery = query.toLowerCase();
  
  // Check each location for a match
  for (const location of MAJOR_LOCATIONS) {
    const cityMatch = normalizedQuery.includes(location.city.toLowerCase());
    const stateMatch = normalizedQuery.includes(location.state.toLowerCase()) || 
                       normalizedQuery.includes(location.stateAbbr.toLowerCase());
    
    if (cityMatch || (stateMatch && normalizedQuery.includes(location.city.toLowerCase().split(' ')[0]))) {
      return location;
    }
  }
  
  return null;
}

// Find location by slug
export function findLocationBySlug(slug: string): LocationInfo | null {
  return MAJOR_LOCATIONS.find(loc => loc.slug === slug) || null;
}