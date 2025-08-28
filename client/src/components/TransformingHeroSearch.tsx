import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapIcon, List, Sparkles, Brain, Building, X, MapPin, DollarSign, Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Toggle } from '@/components/ui/toggle';
import { useDebounce } from '@/hooks/use-debounce';
import { PrioritizedCommunityCard } from '@/components/PrioritizedCommunityCard';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';

interface SearchResult {
  id: number;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  careTypes?: string[];
  priceRange?: { min: number; max: number };
  rating?: number;
  reviewCount?: number;
  photos?: string[];
  hudPropertyId?: string;
  rentPerMonth?: number | string;
  availableUnits?: number;
  communitySubtype?: string;
  phone?: string;
  website?: string;
  description?: string;
  totalUnits?: number;
  occupancyRate?: number;
}

interface TransformingHeroSearchProps {
  initialHeroContent?: React.ReactNode;
}

export function TransformingHeroSearch({ initialHeroContent }: TransformingHeroSearchProps) {
  const [query, setQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [showListView, setShowListView] = useState(true); // Default to list view
  const [, setLocation] = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 500);

  // Fetch search results
  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['/api/search/unified', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        return { results: [], metadata: null };
      }

      const response = await fetch('/api/search/unified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: debouncedQuery,
          includeHospitals: true,
          includeServices: true,
          limit: 50
        })
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      
      // Filter and transform results to match community card format
      const communities = data.results
        .filter((r: any) => r.type === 'community')
        .map((r: any) => ({
          id: r.id,
          name: r.name,
          address: r.address,
          city: r.city,
          state: r.state,
          careTypes: r.careTypes || [],
          priceRange: r.priceRange,
          rating: r.rating,
          reviewCount: r.reviewCount,
          photos: r.photos || [],
          hudPropertyId: r.hudPropertyId,
          rentPerMonth: r.price || r.rentPerMonth,
          availableUnits: r.availableUnits,
          communitySubtype: r.communitySubtype,
          phone: r.phone,
          website: r.website,
          description: r.description,
          totalUnits: r.totalUnits,
          occupancyRate: r.occupancyRate
        }));

      return { 
        results: communities, 
        metadata: data.metadata,
        aiInsights: data.aiInsights
      };
    },
    enabled: !!debouncedQuery && debouncedQuery.length >= 2
  });

  // Handle search submission
  const handleSearch = () => {
    if (query && query.length >= 2) {
      setIsSearchActive(true);
      
      if (!showListView) {
        // Navigate to map search if map view is selected
        setLocation(`/map-search?q=${encodeURIComponent(query)}`);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setIsSearchActive(false);
  };

  const toggleView = (isListView: boolean) => {
    setShowListView(isListView);
    
    if (!isListView && query) {
      // Switch to map view - navigate to map search
      setLocation(`/map-search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="relative min-h-[600px] w-full">
      {/* Hero Content - Animated Away on Search */}
      <AnimatePresence>
        {!isSearchActive && (
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute inset-0 flex flex-col items-center justify-center px-4"
          >
            {initialHeroContent}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Bar - Animates to Top */}
      <motion.div
        ref={searchRef}
        initial={false}
        animate={{
          y: isSearchActive ? 0 : 200,
          position: isSearchActive ? 'fixed' : 'absolute',
          top: isSearchActive ? 80 : '50%',
          left: '50%',
          x: '-50%',
          width: '100%',
          maxWidth: isSearchActive ? '100%' : '896px',
          zIndex: isSearchActive ? 50 : 10
        }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        className={`${isSearchActive ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' : ''} px-4 py-3`}
      >
        <div className={`max-w-7xl mx-auto ${isSearchActive ? 'flex items-center gap-4' : ''}`}>
          {/* Search Input */}
          <div className="relative flex-1 max-w-4xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search communities by location, care type, or budget..."
              className={`pl-12 pr-32 ${isSearchActive ? 'py-3' : 'py-6'} text-lg bg-white border-2 border-purple-200 focus:border-purple-500 rounded-xl`}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-2">
              {/* View Toggle */}
              {isSearchActive && (
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <Button
                    size="sm"
                    variant={showListView ? 'default' : 'ghost'}
                    onClick={() => toggleView(true)}
                    className="px-3 py-1"
                  >
                    <List className="w-4 h-4 mr-1" />
                    List
                  </Button>
                  <Button
                    size="sm"
                    variant={!showListView ? 'default' : 'ghost'}
                    onClick={() => toggleView(false)}
                    className="px-3 py-1"
                  >
                    <MapIcon className="w-4 h-4 mr-1" />
                    Map
                  </Button>
                </div>
              )}
              
              {/* Search/Clear Button */}
              {isSearchActive ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearSearch}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              ) : (
                <Button
                  onClick={handleSearch}
                  disabled={!query || query.length < 2}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6"
                >
                  Search
                </Button>
              )}
              
              {/* AI Badge */}
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hidden sm:flex">
                <Sparkles className="w-3 h-3 mr-1" />
                AI
              </Badge>
            </div>
          </div>

          {/* Search Metadata */}
          {isSearchActive && searchResults?.metadata && (
            <div className="hidden lg:flex items-center gap-3 text-sm text-gray-600">
              <span className="font-semibold">{searchResults.metadata.totalResults}</span> results
              <span className="text-gray-400">•</span>
              <span>{(searchResults.metadata.searchTime / 1000).toFixed(1)}s</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Results Container */}
      <AnimatePresence>
        {isSearchActive && showListView && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="pt-24 px-4 pb-8"
          >
            <div className="max-w-7xl mx-auto">
              {/* AI Insights */}
              {searchResults?.aiInsights?.summary && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200"
                >
                  <div className="flex items-start gap-3">
                    <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-gray-700">{searchResults.aiInsights.summary}</p>
                      {searchResults.aiInsights.recommendations && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {searchResults.aiInsights.recommendations.map((rec: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {rec}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full" />
                  <span className="ml-3 text-gray-600">Searching communities...</span>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="text-center py-12">
                  <p className="text-red-600">Search failed. Please try again.</p>
                </div>
              )}

              {/* Results Grid */}
              {!isLoading && searchResults?.results && (
                <>
                  {/* Results Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Search Results
                      {searchResults.results.length > 0 && (
                        <span className="ml-2 text-lg text-gray-500">
                          ({searchResults.results.length})
                        </span>
                      )}
                    </h2>
                    
                    {/* Sort/Filter Options */}
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <DollarSign className="w-4 h-4 mr-1" />
                        Price
                      </Button>
                      <Button variant="outline" size="sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        Distance
                      </Button>
                      <Button variant="outline" size="sm">
                        <Heart className="w-4 h-4 mr-1" />
                        Rating
                      </Button>
                    </div>
                  </div>

                  {/* Results List */}
                  <div className="space-y-4">
                    {searchResults.results.length > 0 ? (
                      searchResults.results.map((community: SearchResult) => (
                        <motion.div
                          key={community.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <PrioritizedCommunityCard
                            community={community}
                            variant="list"
                            onSelect={() => window.location.href = `/community/${community.id}`}
                          />
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No communities found matching your search.</p>
                        <p className="text-gray-500 text-sm mt-2">Try adjusting your search criteria.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}