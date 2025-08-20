import Fuse, { IFuseOptions, FuseResult } from 'fuse.js';

// Enhanced fuzzy search configuration for senior living communities
export interface SearchableItem {
  id: number | string;
  name: string;
  city?: string;
  state?: string;
  address?: string;
  careTypes?: string[];
  type?: 'community' | 'vendor' | 'healthcare' | 'resource';
  businessName?: string;
  businessType?: string;
  category?: string;
  description?: string;
}

// Optimal Fuse.js configuration for senior living search
export const createFuseInstance = <T extends SearchableItem>(items: T[], customKeys?: string[]) => {
  const defaultKeys = [
    { name: 'name', weight: 2.0 },           // Highest priority for name matches
    { name: 'businessName', weight: 2.0 },   // For vendors
    { name: 'city', weight: 1.5 },           // City is very important
    { name: 'state', weight: 1.0 },          // State matters
    { name: 'address', weight: 0.8 },        // Address for specific searches
    { name: 'careTypes', weight: 0.7 },      // Care type matching
    { name: 'businessType', weight: 0.7 },   // Business type for vendors
    { name: 'category', weight: 0.7 },       // Category for resources
    { name: 'description', weight: 0.5 }     // Description as fallback
  ];

  const options: IFuseOptions<T> = {
    keys: customKeys || defaultKeys,
    threshold: 0.5,              // Increased to 0.5 to allow for typos like "hemmot" -> "hemet"
    ignoreLocation: true,        // Don't care where in string match occurs
    ignoreFieldNorm: false,      // Consider field length in scoring
    minMatchCharLength: 2,       // Min 2 chars to trigger search
    includeScore: true,          // Include relevance score
    useExtendedSearch: false,    // Disable for better fuzzy matching
    findAllMatches: true,        // Find all matching patterns
    shouldSort: true,            // Sort by best match
    fieldNormWeight: 1           // How much field length affects score
  };

  return new Fuse(items, options);
};

// Intelligently parse search queries for location-based searches
export const parseSearchQuery = (query: string) => {
  if (!query) return { searchTerm: '', city: '', state: '' };

  // Remove extra spaces and normalize
  const normalized = query.trim().toLowerCase();

  // Check for state abbreviations at the end (e.g., "Dallas, TX" or "hemmot CA")
  const stateMatch = normalized.match(/[\s,]+([a-z]{2})$/i);
  if (stateMatch) {
    const state = stateMatch[1].toUpperCase();
    const cityPart = normalized.replace(/[\s,]+[a-z]{2}$/i, '').trim();
    return {
      searchTerm: normalized,
      city: cityPart,
      state
    };
  }

  // Check for full state names (e.g., "Austin, Texas")
  const stateNames = [
    'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado', 'connecticut',
    'delaware', 'florida', 'georgia', 'hawaii', 'idaho', 'illinois', 'indiana', 'iowa',
    'kansas', 'kentucky', 'louisiana', 'maine', 'maryland', 'massachusetts', 'michigan',
    'minnesota', 'mississippi', 'missouri', 'montana', 'nebraska', 'nevada', 'new hampshire',
    'new jersey', 'new mexico', 'new york', 'north carolina', 'north dakota', 'ohio',
    'oklahoma', 'oregon', 'pennsylvania', 'rhode island', 'south carolina', 'south dakota',
    'tennessee', 'texas', 'utah', 'vermont', 'virginia', 'washington', 'west virginia',
    'wisconsin', 'wyoming'
  ];

  for (const stateName of stateNames) {
    if (normalized.endsWith(`, ${stateName}`)) {
      const cityPart = normalized.replace(`, ${stateName}`, '').trim();
      return {
        searchTerm: normalized,
        city: cityPart,
        state: stateName
      };
    }
  }

  // If no clear city/state pattern, treat as general search
  return {
    searchTerm: normalized,
    city: '',
    state: ''
  };
};

// Score and rank results with location bias
export const rankSearchResults = <T extends SearchableItem>(
  results: FuseResult<T>[],
  query: string,
  userLocation?: { lat: number; lng: number }
): T[] => {
  const { city, state } = parseSearchQuery(query);

  return results
    .map(result => {
      let finalScore = result.score || 0;
      const item = result.item;

      // Boost exact city matches
      if (city && item.city?.toLowerCase() === city.toLowerCase()) {
        finalScore *= 0.5; // Lower score is better in Fuse.js
      }

      // Boost exact state matches
      if (state && item.state?.toLowerCase() === state.toLowerCase()) {
        finalScore *= 0.7;
      }

      // Boost if search term appears in name exactly
      if (item.name?.toLowerCase().includes(query.toLowerCase())) {
        finalScore *= 0.6;
      }

      return { ...result, score: finalScore };
    })
    .sort((a, b) => (a.score || 0) - (b.score || 0)) // Lower score is better
    .map(result => result.item);
};

// Debounce function for search input
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Highlight matching text in search results
export const highlightMatches = (text: string, query: string): string => {
  if (!text || !query) return text;
  
  const regex = new RegExp(`(${query.split(' ').join('|')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
};

// Export default search function for easy use
export const fuzzySearch = <T extends SearchableItem>(
  items: T[],
  query: string,
  limit: number = 20
): T[] => {
  if (!query || query.length < 1) return items.slice(0, limit) as T[];
  
  const fuse = createFuseInstance(items);
  const results = fuse.search(query, { limit: limit * 2 }); // Get extra to account for filtering
  
  return rankSearchResults(results, query).slice(0, limit) as T[];
};