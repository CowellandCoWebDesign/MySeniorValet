// Service for managing location-based SEO and content
export interface LocationInfo {
  city: string;
  state: string;
  stateAbbr: string;
  slug: string;
  communityCount?: number;
  priceRange?: {
    min: number;
    max: number;
  };
  neighborhoods?: string[];
  popularSearches?: string[];
}

// Major cities and areas for SEO optimization
export const MAJOR_LOCATIONS: LocationInfo[] = [
  // Top US Cities by Population
  { city: "New York", state: "New York", stateAbbr: "NY", slug: "new-york-ny" },
  { city: "Los Angeles", state: "California", stateAbbr: "CA", slug: "los-angeles-ca" },
  { city: "Chicago", state: "Illinois", stateAbbr: "IL", slug: "chicago-il" },
  { city: "Houston", state: "Texas", stateAbbr: "TX", slug: "houston-tx" },
  { city: "Phoenix", state: "Arizona", stateAbbr: "AZ", slug: "phoenix-az" },
  { city: "Philadelphia", state: "Pennsylvania", stateAbbr: "PA", slug: "philadelphia-pa" },
  { city: "San Antonio", state: "Texas", stateAbbr: "TX", slug: "san-antonio-tx" },
  { city: "San Diego", state: "California", stateAbbr: "CA", slug: "san-diego-ca" },
  { city: "Dallas", state: "Texas", stateAbbr: "TX", slug: "dallas-tx" },
  { city: "Fort Worth", state: "Texas", stateAbbr: "TX", slug: "fort-worth-tx" },
  { city: "San Jose", state: "California", stateAbbr: "CA", slug: "san-jose-ca" },
  { city: "Austin", state: "Texas", stateAbbr: "TX", slug: "austin-tx" },
  { city: "Jacksonville", state: "Florida", stateAbbr: "FL", slug: "jacksonville-fl" },
  { city: "Columbus", state: "Ohio", stateAbbr: "OH", slug: "columbus-oh" },
  { city: "Charlotte", state: "North Carolina", stateAbbr: "NC", slug: "charlotte-nc" },
  { city: "San Francisco", state: "California", stateAbbr: "CA", slug: "san-francisco-ca" },
  { city: "Indianapolis", state: "Indiana", stateAbbr: "IN", slug: "indianapolis-in" },
  { city: "Seattle", state: "Washington", stateAbbr: "WA", slug: "seattle-wa" },
  { city: "Denver", state: "Colorado", stateAbbr: "CO", slug: "denver-co" },
  { city: "Washington", state: "District of Columbia", stateAbbr: "DC", slug: "washington-dc" },
  { city: "Boston", state: "Massachusetts", stateAbbr: "MA", slug: "boston-ma" },
  { city: "Nashville", state: "Tennessee", stateAbbr: "TN", slug: "nashville-tn" },
  { city: "Baltimore", state: "Maryland", stateAbbr: "MD", slug: "baltimore-md" },
  { city: "Oklahoma City", state: "Oklahoma", stateAbbr: "OK", slug: "oklahoma-city-ok" },
  { city: "Louisville", state: "Kentucky", stateAbbr: "KY", slug: "louisville-ky" },
  { city: "Portland", state: "Oregon", stateAbbr: "OR", slug: "portland-or" },
  { city: "Las Vegas", state: "Nevada", stateAbbr: "NV", slug: "las-vegas-nv" },
  { city: "Milwaukee", state: "Wisconsin", stateAbbr: "WI", slug: "milwaukee-wi" },
  { city: "Albuquerque", state: "New Mexico", stateAbbr: "NM", slug: "albuquerque-nm" },
  { city: "Tucson", state: "Arizona", stateAbbr: "AZ", slug: "tucson-az" },
  { city: "Fresno", state: "California", stateAbbr: "CA", slug: "fresno-ca" },
  { city: "Sacramento", state: "California", stateAbbr: "CA", slug: "sacramento-ca" },
  { city: "Mesa", state: "Arizona", stateAbbr: "AZ", slug: "mesa-az" },
  { city: "Kansas City", state: "Missouri", stateAbbr: "MO", slug: "kansas-city-mo" },
  { city: "Atlanta", state: "Georgia", stateAbbr: "GA", slug: "atlanta-ga" },
  { city: "Miami", state: "Florida", stateAbbr: "FL", slug: "miami-fl" },
  { city: "Orlando", state: "Florida", stateAbbr: "FL", slug: "orlando-fl" },
  { city: "Tampa", state: "Florida", stateAbbr: "FL", slug: "tampa-fl" },
  { city: "Minneapolis", state: "Minnesota", stateAbbr: "MN", slug: "minneapolis-mn" },
  { city: "Cleveland", state: "Ohio", stateAbbr: "OH", slug: "cleveland-oh" },
  { city: "Detroit", state: "Michigan", stateAbbr: "MI", slug: "detroit-mi" },
  { city: "St. Louis", state: "Missouri", stateAbbr: "MO", slug: "st-louis-mo" },
  { city: "Pittsburgh", state: "Pennsylvania", stateAbbr: "PA", slug: "pittsburgh-pa" },
  { city: "Cincinnati", state: "Ohio", stateAbbr: "OH", slug: "cincinnati-oh" },
  { city: "Salt Lake City", state: "Utah", stateAbbr: "UT", slug: "salt-lake-city-ut" },
  { city: "Raleigh", state: "North Carolina", stateAbbr: "NC", slug: "raleigh-nc" },
  { city: "Virginia Beach", state: "Virginia", stateAbbr: "VA", slug: "virginia-beach-va" },
  { city: "Buffalo", state: "New York", stateAbbr: "NY", slug: "buffalo-ny" },
  { city: "Birmingham", state: "Alabama", stateAbbr: "AL", slug: "birmingham-al" },
  { city: "Rochester", state: "New York", stateAbbr: "NY", slug: "rochester-ny" },
  
  // Canadian Cities
  { city: "Toronto", state: "Ontario", stateAbbr: "ON", slug: "toronto-on" },
  { city: "Montreal", state: "Quebec", stateAbbr: "QC", slug: "montreal-qc" },
  { city: "Vancouver", state: "British Columbia", stateAbbr: "BC", slug: "vancouver-bc" },
  { city: "Calgary", state: "Alberta", stateAbbr: "AB", slug: "calgary-ab" },
  { city: "Edmonton", state: "Alberta", stateAbbr: "AB", slug: "edmonton-ab" },
  { city: "Ottawa", state: "Ontario", stateAbbr: "ON", slug: "ottawa-on" },
  { city: "Winnipeg", state: "Manitoba", stateAbbr: "MB", slug: "winnipeg-mb" },
  { city: "Quebec City", state: "Quebec", stateAbbr: "QC", slug: "quebec-city-qc" },
  { city: "Hamilton", state: "Ontario", stateAbbr: "ON", slug: "hamilton-on" },
  { city: "Victoria", state: "British Columbia", stateAbbr: "BC", slug: "victoria-bc" },
];

export class LocationSEOService {
  // Parse location from URL parameters or slug
  static parseLocationFromUrl(searchParams: URLSearchParams | string): LocationInfo | null {
    if (typeof searchParams === 'string') {
      // Handle slug format (e.g., "fort-worth-tx")
      const location = MAJOR_LOCATIONS.find(loc => loc.slug === searchParams);
      return location || null;
    }
    
    const locationParam = searchParams.get('location');
    const cityParam = searchParams.get('city');
    const stateParam = searchParams.get('state');
    
    if (locationParam) {
      // Try to find in major locations
      const location = MAJOR_LOCATIONS.find(loc => 
        loc.slug === locationParam || 
        loc.city.toLowerCase() === locationParam.toLowerCase()
      );
      if (location) return location;
      
      // Parse custom location format
      const parts = locationParam.split('-');
      if (parts.length >= 2) {
        const stateAbbr = parts[parts.length - 1].toUpperCase();
        const city = parts.slice(0, -1).join(' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        return {
          city,
          state: this.getStateName(stateAbbr),
          stateAbbr,
          slug: locationParam
        };
      }
    }
    
    if (cityParam && stateParam) {
      return {
        city: cityParam,
        state: this.getStateName(stateParam),
        stateAbbr: stateParam.toUpperCase(),
        slug: `${cityParam.toLowerCase().replace(/\s+/g, '-')}-${stateParam.toLowerCase()}`
      };
    }
    
    return null;
  }
  
  // Generate SEO title for location (max 60 chars)
  static generateTitle(location: LocationInfo, pageType: string = 'search'): string {
    const baseTitle = 'MySeniorValet';
    const locationStr = `${location.city}, ${location.stateAbbr}`;
    
    const titles: Record<string, string> = {
      search: `Senior Living in ${locationStr} | ${baseTitle}`,
      assisted: `Assisted Living ${locationStr} | ${baseTitle}`,
      memory: `Memory Care in ${locationStr} | ${baseTitle}`,
      nursing: `Nursing Homes ${locationStr} | ${baseTitle}`,
      independent: `Independent Living ${locationStr} | ${baseTitle}`,
    };
    
    let title = titles[pageType] || titles.search;
    
    // Ensure title is under 60 characters
    if (title.length > 60) {
      // Shorten by removing "in" and using abbreviations
      title = `${pageType === 'search' ? 'Senior Living' : this.getShortCareType(pageType)} ${locationStr} | MSV`;
    }
    
    return title;
  }
  
  // Generate meta description for location
  static generateDescription(location: LocationInfo): string {
    const count = location.communityCount || 'multiple';
    const priceRange = location.priceRange 
      ? `from $${location.priceRange.min.toLocaleString()} to $${location.priceRange.max.toLocaleString()}/month` 
      : 'with transparent pricing';
    
    return `Find ${count} senior living communities in ${location.city}, ${location.state} ${priceRange}. Compare assisted living, memory care, nursing homes. Real availability, verified rates, no hidden fees.`;
  }
  
  // Generate keywords for location
  static generateKeywords(location: LocationInfo): string[] {
    const baseKeywords = [
      `senior living ${location.city}`,
      `assisted living ${location.city} ${location.stateAbbr}`,
      `memory care ${location.city}`,
      `nursing homes ${location.city}`,
      `retirement homes ${location.city}`,
      `${location.city} senior care`,
      `${location.city} elderly care`,
      `${location.state} senior living`,
    ];
    
    if (location.neighborhoods && location.neighborhoods.length > 0) {
      location.neighborhoods.slice(0, 3).forEach(neighborhood => {
        baseKeywords.push(`${neighborhood} senior living`);
      });
    }
    
    return baseKeywords;
  }
  
  // Generate location-specific content for display
  static generateLocationContent(location: LocationInfo): {
    headline: string;
    subheadline: string;
    highlights: string[];
  } {
    const count = location.communityCount || 'multiple';
    const priceText = location.priceRange 
      ? `Average monthly costs range from $${location.priceRange.min.toLocaleString()} to $${location.priceRange.max.toLocaleString()}`
      : 'Transparent pricing with no hidden fees';
    
    return {
      headline: `Senior Living in ${location.city}, ${location.state}`,
      subheadline: `Discover ${count} verified senior living communities in the ${location.city} area`,
      highlights: [
        priceText,
        `Real-time availability across ${location.neighborhoods?.length || 'all'} neighborhoods`,
        'Direct facility messaging with no referral markups',
        'Compare assisted living, memory care, and nursing homes',
        'HUD-approved and Medicare-certified options available'
      ]
    };
  }
  
  // Helper function to get state name from abbreviation
  private static getStateName(abbr: string): string {
    const stateMap: Record<string, string> = {
      'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
      'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
      'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
      'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
      'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
      'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
      'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
      'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
      'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
      'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
      'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
      'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
      'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'District of Columbia',
      // Canadian Provinces
      'AB': 'Alberta', 'BC': 'British Columbia', 'MB': 'Manitoba',
      'NB': 'New Brunswick', 'NL': 'Newfoundland', 'NS': 'Nova Scotia',
      'ON': 'Ontario', 'PE': 'Prince Edward Island', 'QC': 'Quebec', 'SK': 'Saskatchewan',
    };
    
    return stateMap[abbr.toUpperCase()] || abbr;
  }
  
  private static getShortCareType(type: string): string {
    const shortTypes: Record<string, string> = {
      assisted: 'Assisted Living',
      memory: 'Memory Care',
      nursing: 'Nursing Homes',
      independent: 'Indep. Living',
    };
    
    return shortTypes[type] || 'Senior Living';
  }
  
  // Generate canonical URL for location
  static generateCanonicalUrl(location: LocationInfo, baseUrl: string = 'https://www.myseniorvalet.com'): string {
    return `${baseUrl}/location/${location.slug}`;
  }
  
  // Check if a location string matches any major location
  static findLocation(searchTerm: string): LocationInfo | null {
    const normalizedSearch = searchTerm.toLowerCase().trim();
    
    // Try exact match on city name
    let location = MAJOR_LOCATIONS.find(loc => 
      loc.city.toLowerCase() === normalizedSearch
    );
    
    if (location) return location;
    
    // Try city + state format
    location = MAJOR_LOCATIONS.find(loc => {
      const cityState = `${loc.city}, ${loc.stateAbbr}`.toLowerCase();
      const cityStateFull = `${loc.city}, ${loc.state}`.toLowerCase();
      return cityState === normalizedSearch || cityStateFull === normalizedSearch;
    });
    
    if (location) return location;
    
    // Try partial match
    location = MAJOR_LOCATIONS.find(loc => 
      normalizedSearch.includes(loc.city.toLowerCase())
    );
    
    return location || null;
  }
}