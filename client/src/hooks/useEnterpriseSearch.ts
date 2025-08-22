import { useState, useCallback, useRef, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { debounce } from 'lodash';

export interface EnterpriseSearchParams {
  query?: string;
  location?: string;
  state?: string;
  city?: string;
  careTypes?: string[];
  bounds?: { west: number; south: number; east: number; north: number };
  radius?: { lat: number; lng: number; miles: number };
  priceRange?: { min?: number; max?: number };
  rating?: { min?: number };
  amenities?: string[];
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'rating' | 'price' | 'distance' | 'name' | 'capacity';
  sortOrder?: 'asc' | 'desc';
  includeHudOnly?: boolean;
  hasPhotos?: boolean;
}

export interface SearchResults {
  communities: any[];
  total: number;
  totalAvailable: number;
  facets?: any;
  searchMetadata?: any;
  suggestions?: string[];
  performance?: any;
}

export function useEnterpriseSearch() {
  const [results, setResults] = useState<SearchResults>({
    communities: [],
    total: 0,
    totalAvailable: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Main search function with comprehensive parameters
  const search = useCallback(async (params: EnterpriseSearchParams) => {
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setError(null);

    try {
      // Build query string
      const queryParams = new URLSearchParams();
      
      if (params.query) queryParams.append('q', params.query);
      if (params.location) queryParams.append('location', params.location);
      if (params.state) queryParams.append('state', params.state);
      if (params.city) queryParams.append('city', params.city);
      if (params.careTypes?.length) queryParams.append('careTypes', params.careTypes.join(','));
      if (params.bounds) queryParams.append('bounds', `${params.bounds.west},${params.bounds.south},${params.bounds.east},${params.bounds.north}`);
      if (params.radius) {
        queryParams.append('radius', params.radius.miles.toString());
        queryParams.append('lat', params.radius.lat.toString());
        queryParams.append('lng', params.radius.lng.toString());
      }
      if (params.priceRange?.min) queryParams.append('priceMin', params.priceRange.min.toString());
      if (params.priceRange?.max) queryParams.append('priceMax', params.priceRange.max.toString());
      if (params.rating?.min) queryParams.append('minRating', params.rating.min.toString());
      if (params.amenities?.length) queryParams.append('amenities', params.amenities.join(','));
      queryParams.append('limit', (params.limit || 1000).toString()); // Enterprise default
      queryParams.append('offset', (params.offset || 0).toString());
      queryParams.append('sortBy', params.sortBy || 'relevance');
      queryParams.append('sortOrder', params.sortOrder || 'desc');
      if (params.includeHudOnly) queryParams.append('hudOnly', 'true');
      if (params.hasPhotos) queryParams.append('hasPhotos', 'true');

      // Try enterprise endpoint first
      let endpoint = `/api/search/enterprise?${queryParams}`;
      
      console.log(`🚀 ENTERPRISE SEARCH: ${endpoint}`);
      
      let response;
      try {
        response = await apiRequest('GET', endpoint);
      } catch (err) {
        // Fallback to unified search if enterprise fails
        console.log('Enterprise search failed, trying unified search...');
        endpoint = `/api/communities/search/unified?${queryParams}`;
        response = await apiRequest('GET', endpoint);
      }

      if (!abortController.signal.aborted) {
        setResults(response);
        console.log(`✅ Found ${response.total} of ${response.totalAvailable} communities`);
        
        // Log performance metrics if available
        if (response.performance) {
          console.log(`⚡ Search completed in ${response.performance.totalTime}ms`);
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Search error:', err);
        setError(err.message || 'Search failed');
        
        // Fallback to basic search
        try {
          const fallbackParams = new URLSearchParams();
          if (params.query) fallbackParams.append('q', params.query);
          fallbackParams.append('limit', '500');
          
          const fallbackResponse = await apiRequest(
            'GET', 
            `/api/communities/search?${fallbackParams}`
          );
          
          if (!abortController.signal.aborted) {
            setResults(fallbackResponse);
            console.log('Fallback search succeeded');
          }
        } catch (fallbackErr) {
          console.error('Fallback search also failed:', fallbackErr);
        }
      }
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  // Debounced search for text input
  const debouncedSearch = useCallback(
    debounce((params: EnterpriseSearchParams) => {
      search(params);
    }, 300),
    [search]
  );

  // Quick search with just a query string
  const quickSearch = useCallback((query: string) => {
    return search({ query, limit: 1000 });
  }, [search]);

  // Location-based search
  const searchByLocation = useCallback((location: string, radius?: number) => {
    return search({ 
      location, 
      radius: radius ? { lat: 0, lng: 0, miles: radius } : undefined,
      limit: 1000 
    });
  }, [search]);

  // Map bounds search for viewport changes
  const searchByBounds = useCallback((bounds: EnterpriseSearchParams['bounds']) => {
    return search({ bounds, limit: 2000 });
  }, [search]);

  // Search similar communities
  const searchSimilar = useCallback(async (communityId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('GET', `/api/search/similar/${communityId}`);
      setResults(response);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to find similar communities');
      console.error('Similar search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get trending communities
  const getTrending = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('GET', '/api/search/trending');
      setResults(response);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to get trending communities');
      console.error('Trending search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // AI-powered natural language search
  const aiSearch = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('GET', `/api/search/ai?q=${encodeURIComponent(query)}`);
      setResults(response);
      return response;
    } catch (err: any) {
      // Fallback to regular search if AI fails
      console.log('AI search failed, using regular search');
      return quickSearch(query);
    } finally {
      setLoading(false);
    }
  }, [quickSearch]);

  // Clear results
  const clear = useCallback(() => {
    setResults({
      communities: [],
      total: 0,
      totalAvailable: 0
    });
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    results,
    loading,
    error,
    search,
    debouncedSearch,
    quickSearch,
    searchByLocation,
    searchByBounds,
    searchSimilar,
    getTrending,
    aiSearch,
    clear
  };
}