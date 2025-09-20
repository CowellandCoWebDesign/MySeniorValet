import { db } from "../db";
import { communities } from "@shared/schema";
import { sql, desc } from "drizzle-orm";

// Global destinations for Discovery Mode - diverse set of locations
const GLOBAL_DESTINATIONS = {
  communities: [
    // Asia
    'Tokyo, Japan', 'Singapore', 'Seoul, South Korea', 'Bangkok, Thailand', 
    'Dubai, UAE', 'Mumbai, India', 'Hong Kong', 'Taipei, Taiwan',
    'Kuala Lumpur, Malaysia', 'Jakarta, Indonesia', 'Manila, Philippines',
    // Europe
    'Paris, France', 'London, UK', 'Rome, Italy', 'Barcelona, Spain',
    'Amsterdam, Netherlands', 'Berlin, Germany', 'Vienna, Austria', 
    'Prague, Czech Republic', 'Lisbon, Portugal', 'Copenhagen, Denmark',
    'Stockholm, Sweden', 'Dublin, Ireland', 'Athens, Greece',
    // Americas (non-US)
    'Toronto, Canada', 'Vancouver, Canada', 'Mexico City, Mexico', 
    'Buenos Aires, Argentina', 'São Paulo, Brazil', 'Lima, Peru',
    'Santiago, Chile', 'Bogotá, Colombia', 'Montreal, Canada',
    // Oceania
    'Sydney, Australia', 'Melbourne, Australia', 'Brisbane, Australia',
    'Auckland, New Zealand', 'Perth, Australia', 'Wellington, New Zealand',
    // Africa & Middle East
    'Cape Town, South Africa', 'Cairo, Egypt', 'Tel Aviv, Israel',
    'Johannesburg, South Africa', 'Casablanca, Morocco', 'Nairobi, Kenya'
  ],
  services: [
    // Service types with global cities
    'Lawyers in London', 'Restaurants in Paris', 'Hotels in Tokyo',
    'Pharmacies in Berlin', 'Banks in Singapore', 'Cafes in Rome',
    'Dentists in Sydney', 'Gyms in Dubai', 'Spas in Bangkok',
    'Hair salons in Seoul', 'Pet stores in Toronto', 'Bookstores in Amsterdam',
    'Florists in Vienna', 'Bakeries in Montreal', 'Car rentals in Mexico City',
    'Travel agencies in Buenos Aires', 'Art galleries in Barcelona',
    'Music stores in Stockholm', 'Clothing stores in Milan',
    'Electronics stores in Hong Kong', 'Jewelry stores in Dubai'
  ],
  healthcare: [
    'Hospitals in London', 'Clinics in Paris', 'Pharmacies in Tokyo',
    'Dental clinics in Sydney', 'Eye doctors in Toronto', 'Specialists in Singapore',
    'Emergency rooms in Berlin', 'Medical centers in Dubai', 'Health clinics in Rome',
    'Rehabilitation centers in Vienna', 'Mental health services in Amsterdam',
    'Pediatricians in Stockholm', 'Cardiologists in Tel Aviv', 'Surgery centers in Seoul'
  ],
  resources: [
    'Senior resources in UK', 'Care guides for France', 'Healthcare info in Japan',
    'Retirement planning in Canada', 'Elder care in Australia', 'Support groups in Germany',
    'Insurance guides for Spain', 'Legal resources in Italy', 'Financial planning in Singapore',
    'Government benefits in Netherlands', 'Care regulations in Sweden'
  ]
};

// Local/database suggestions for Database Search mode
const DATABASE_SUGGESTIONS = {
  communities: [
    'Memory care near me', 'Under $3000/month', 'Assisted living in Houston',
    'Pet-friendly communities', 'Communities with pools', '5-star rated facilities',
    'Near hospitals', 'Independent living', 'Skilled nursing facilities',
    'Veterans communities', 'Continuing care', 'Active senior living'
  ],
  services: [
    'Home care services', 'Medical equipment', 'Meal delivery',
    'Transportation services', 'Housekeeping', 'Personal care',
    'Physical therapy', 'Companion care', 'Emergency response',
    'Adult day care', 'Respite care', 'Hospice services'
  ],
  healthcare: [
    'Hospitals near me', 'Emergency rooms', 'Urgent care',
    'Primary care doctors', 'Specialists', 'Rehabilitation centers',
    'Dialysis centers', 'Cancer centers', 'Heart specialists',
    'Memory care specialists', 'Geriatric doctors', 'Pain management'
  ],
  resources: [
    'Medicare guides', 'Medicaid help', 'Care planning',
    'Legal documents', 'Financial planning', 'Insurance info',
    'Caregiver support', 'Senior benefits', 'Social activities',
    'Educational resources', 'Support groups', 'Crisis hotlines'
  ]
};

// Map-focused suggestions
const MAP_SUGGESTIONS = {
  communities: [
    'Within 10 miles', 'Near downtown', 'Along highway',
    'In my neighborhood', 'Near medical district', 'Waterfront communities',
    'Rural communities', 'Urban centers', 'Suburban areas',
    'Near family', 'Close to shopping', 'Near parks'
  ],
  services: [
    'Services nearby', 'Within walking distance', '24-hour services',
    'Emergency services', 'Mobile services', 'Home delivery',
    'On my route', 'Near work', 'In shopping centers',
    'Downtown services', 'Suburban providers', 'Rural services'
  ],
  healthcare: [
    'Closest hospital', 'Emergency care nearby', 'Walk-in clinics',
    'After-hours care', 'Weekend clinics', 'Specialists near me',
    'Medical districts', 'Healthcare corridors', 'Urgent care chains',
    'VA hospitals nearby', 'Teaching hospitals', 'Community clinics'
  ],
  resources: [
    'Local resources', 'Community centers', 'Senior centers nearby',
    'Libraries near me', 'Government offices', 'Support near me',
    'Churches nearby', 'Recreation centers', 'Educational centers',
    'Volunteer opportunities', 'Local programs', 'Neighborhood help'
  ]
};

// Dynamic placeholder texts
export const PLACEHOLDER_TEXTS = {
  discover: {
    communities: [
      "🌍 Try 'Senior Living in Paris' or 'Care Homes in Tokyo'...",
      "🌍 Explore 'Retirement in Sydney' or 'Elder Care in London'...",
      "🌍 Discover 'Care Facilities in Dubai' or 'Senior Homes in Rome'...",
      "🌍 Search 'Assisted Living in Berlin' or 'Nursing Homes in Toronto'...",
      "🌍 Find 'Senior Communities in Singapore' or 'Care Centers in Madrid'..."
    ],
    services: [
      "🌍 Try 'Restaurants in Tokyo' or 'Lawyers in London'...",
      "🌍 Search 'Hotels in Paris' or 'Pharmacies in Berlin'...",
      "🌍 Find 'Cafes in Rome' or 'Banks in Singapore'...",
      "🌍 Explore 'Shops in Dubai' or 'Clinics in Sydney'...",
      "🌍 Discover 'Services in Amsterdam' or 'Stores in Barcelona'..."
    ],
    healthcare: [
      "🌍 Try 'Hospitals in London' or 'Clinics in Tokyo'...",
      "🌍 Search 'Doctors in Paris' or 'Specialists in Sydney'...",
      "🌍 Find 'Emergency care in Dubai' or 'Medical centers in Berlin'...",
      "🌍 Explore 'Healthcare in Singapore' or 'Pharmacies in Rome'...",
      "🌍 Discover 'Health services in Toronto' or 'Clinics in Amsterdam'..."
    ],
    resources: [
      "🌍 Try 'Senior resources in UK' or 'Care guides for Japan'...",
      "🌍 Search 'Elder care in France' or 'Support in Australia'...",
      "🌍 Find 'Resources in Canada' or 'Guides for Germany'...",
      "🌍 Explore 'Senior help in Spain' or 'Care info in Italy'...",
      "🌍 Discover 'Support in Singapore' or 'Resources in Netherlands'..."
    ]
  },
  map: {
    communities: [
      "📍 Try 'Within 10 miles' or 'Near downtown'...",
      "📍 Search 'Along I-35' or 'Near medical district'...",
      "📍 Find 'In my neighborhood' or 'Close to family'...",
      "📍 Explore 'Waterfront communities' or 'Near shopping'...",
      "📍 Discover 'Urban centers' or 'Suburban areas'..."
    ],
    services: [
      "📍 Try 'Services nearby' or '24-hour services'...",
      "📍 Search 'Within walking distance' or 'Mobile services'...",
      "📍 Find 'Emergency services' or 'Home delivery'...",
      "📍 Explore 'Downtown services' or 'On my route'...",
      "📍 Discover 'Near work' or 'In shopping centers'..."
    ],
    healthcare: [
      "📍 Try 'Closest hospital' or 'Emergency care nearby'...",
      "📍 Search 'Walk-in clinics' or 'After-hours care'...",
      "📍 Find 'Specialists near me' or 'Medical districts'...",
      "📍 Explore 'Urgent care chains' or 'VA hospitals nearby'...",
      "📍 Discover 'Community clinics' or 'Teaching hospitals'..."
    ],
    resources: [
      "📍 Try 'Local resources' or 'Community centers'...",
      "📍 Search 'Senior centers nearby' or 'Libraries near me'...",
      "📍 Find 'Government offices' or 'Churches nearby'...",
      "📍 Explore 'Recreation centers' or 'Local programs'...",
      "📍 Discover 'Volunteer opportunities' or 'Neighborhood help'..."
    ]
  },
  list: {
    communities: [
      "🔍 Try 'Houston' or 'Under $3000/month'...",
      "🔍 Search 'Memory care' or 'Pet-friendly'...",
      "🔍 Find 'Assisted living' or '5-star rated'...",
      "🔍 Explore 'Near hospitals' or 'Veterans communities'...",
      "🔍 Discover 'Independent living' or 'Active seniors'..."
    ],
    services: [
      "🔍 Try 'Home care' or 'Medical equipment'...",
      "🔍 Search 'Meal delivery' or 'Transportation'...",
      "🔍 Find 'Physical therapy' or 'Companion care'...",
      "🔍 Explore 'Adult day care' or 'Respite care'...",
      "🔍 Discover 'Emergency response' or 'Hospice services'..."
    ],
    healthcare: [
      "🔍 Try 'Hospitals' or 'Emergency rooms'...",
      "🔍 Search 'Primary care' or 'Specialists'...",
      "🔍 Find 'Urgent care' or 'Rehabilitation'...",
      "🔍 Explore 'Cancer centers' or 'Heart specialists'...",
      "🔍 Discover 'Memory care' or 'Pain management'..."
    ],
    resources: [
      "🔍 Try 'Medicare guides' or 'Medicaid help'...",
      "🔍 Search 'Care planning' or 'Legal documents'...",
      "🔍 Find 'Financial planning' or 'Insurance info'...",
      "🔍 Explore 'Caregiver support' or 'Senior benefits'...",
      "🔍 Discover 'Support groups' or 'Crisis hotlines'..."
    ]
  }
};

// Helper function to get random items from array
function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Get dynamic suggestions based on mode and category
export async function getDynamicSuggestions(
  query: string, 
  category: 'communities' | 'services' | 'healthcare' | 'resources',
  viewMode: 'list' | 'map' | 'discover'
): Promise<string[]> {
  const searchTerm = query.toLowerCase();
  let suggestions: string[] = [];

  // Based on view mode, select appropriate suggestion pool
  switch (viewMode) {
    case 'discover':
      // Global Discovery Mode suggestions
      const globalSuggestions = GLOBAL_DESTINATIONS[category] || [];
      
      // If user is typing, filter suggestions
      if (searchTerm.length >= 2) {
        suggestions = globalSuggestions.filter(s => 
          s.toLowerCase().includes(searchTerm)
        );
      }
      
      // If not enough filtered results, add random global suggestions
      if (suggestions.length < 5) {
        const randomGlobal = getRandomItems(
          globalSuggestions.filter(s => !suggestions.includes(s)),
          5 - suggestions.length
        );
        suggestions.push(...randomGlobal);
      }
      break;

    case 'map':
      // Map-focused suggestions
      const mapSuggestions = MAP_SUGGESTIONS[category] || [];
      
      if (searchTerm.length >= 2) {
        suggestions = mapSuggestions.filter(s => 
          s.toLowerCase().includes(searchTerm)
        );
        
        // Also add some cities from database for map searches
        if (category === 'communities') {
          try {
            const citySuggestions = await db
              .selectDistinct({ city: communities.city, state: communities.state })
              .from(communities)
              .where(sql`LOWER(${communities.city}) LIKE ${searchTerm + '%'}`)
              .limit(3);
            
            suggestions.push(...citySuggestions.map(s => 
              `Near ${s.city}, ${s.state}`
            ));
          } catch (error) {
            console.error('Error fetching city suggestions:', error);
          }
        }
      } else {
        suggestions = getRandomItems(mapSuggestions, 5);
      }
      break;

    case 'list':
    default:
      // Database/list mode suggestions
      const dbSuggestions = DATABASE_SUGGESTIONS[category] || [];
      
      if (searchTerm.length >= 2) {
        // Filter static suggestions
        suggestions = dbSuggestions.filter(s => 
          s.toLowerCase().includes(searchTerm)
        );
        
        // Add real database results
        try {
          if (category === 'communities') {
            // Get real communities from database
            const communitySuggestions = await db
              .select({ 
                name: communities.name, 
                city: communities.city, 
                state: communities.state 
              })
              .from(communities)
              .where(sql`LOWER(${communities.name}) LIKE ${'%' + searchTerm + '%'} OR LOWER(${communities.city}) LIKE ${searchTerm + '%'}`)
              .limit(5);
            
            suggestions.push(...communitySuggestions.map(s => 
              `${s.name} - ${s.city}, ${s.state}`
            ));
          }
        } catch (error) {
          console.error('Error fetching database suggestions:', error);
        }
      } else {
        suggestions = getRandomItems(dbSuggestions, 5);
      }
      break;
  }

  // Always include Discovery Mode option if not already in Discovery Mode
  if (viewMode !== 'discover' && suggestions.length < 10) {
    suggestions.push('🌍 Try Discovery Mode for worldwide search');
  }

  // Return up to 8 suggestions
  return suggestions.slice(0, 8);
}

// Get random placeholder text
export function getRandomPlaceholder(
  category: 'communities' | 'services' | 'healthcare' | 'resources',
  viewMode: 'list' | 'map' | 'discover'
): string {
  const placeholders = PLACEHOLDER_TEXTS[viewMode]?.[category] || PLACEHOLDER_TEXTS.list.communities;
  return placeholders[Math.floor(Math.random() * placeholders.length)];
}