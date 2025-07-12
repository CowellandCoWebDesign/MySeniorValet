import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CommunityCard } from "@/components/community-card";
import { CommunityCardSkeleton } from "@/components/community-card-skeleton";
import { MapView } from "@/components/map-view";
import { Breadcrumb } from "@/components/breadcrumb";
import BottomNavigation from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { List, Map as MapIcon, Filter, X, Search as SearchIcon, MapPin, Star, AlertTriangle } from "lucide-react";
import type { Community, SearchCommunity } from "@shared/schema";

interface SearchFilters {
  location: string;
  careType: string;
  priceRange: string;
  availability: string;
  minRating: string;
  hasPhotos: boolean;
}

export default function Search() {
  const [location, setLocation] = useLocation();
  
  // Initialize filters from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const [filters, setFilters] = useState<SearchFilters>({
    location: urlParams.get('location') || '',
    careType: urlParams.get('careType') || 'all',
    priceRange: urlParams.get('priceRange') || 'all',
    availability: urlParams.get('availability') || 'all',
    minRating: urlParams.get('minRating') || 'all',
    hasPhotos: urlParams.get('hasPhotos') === 'true',
  });
  
  const [viewMode, setViewMode] = useState<'list' | 'map'>((urlParams.get('view') as 'list' | 'map') || 'list');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [sortBy, setSortBy] = useState(urlParams.get('sortBy') || 'relevance');
  
  // Search history and suggestions
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  
  // Bottom navigation state
  const [activeTab, setActiveTab] = useState('search');
  
  // Handle bottom navigation
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    switch (tab) {
      case 'search':
        // Already on search page
        break;
      case 'updates':
        setLocation('/updates');
        break;
      case 'saved':
        setLocation('/dashboard?tab=saved');
        break;
      case 'tours':
        setLocation('/dashboard?tab=tours');
        break;
      case 'inbox':
        setLocation('/dashboard?tab=inbox');
        break;
      default:
        break;
    }
  };

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Save search to history
  const saveSearchToHistory = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    const newHistory = [searchTerm, ...searchHistory.filter(item => item !== searchTerm)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  // Popular search suggestions
  const popularSearches = [
    'San Francisco', 'Sacramento', 'Oakland', 'San Jose', 'Fresno',
    'Assisted Living', 'Memory Care', 'Independent Living', 'Skilled Nursing',
    'Redding', 'Stockton', 'Modesto', 'Eureka', 'Chico'
  ];

  // Generate suggestions based on input
  const generateSuggestions = (input: string) => {
    if (!input.trim()) {
      setSearchSuggestions([...searchHistory.slice(0, 5), ...popularSearches.slice(0, 5)]);
      return;
    }
    
    const inputLower = input.toLowerCase();
    const historySuggestions = searchHistory.filter(item => 
      item.toLowerCase().includes(inputLower)
    );
    const popularSuggestions = popularSearches.filter(item => 
      item.toLowerCase().includes(inputLower)
    );
    
    setSearchSuggestions([...historySuggestions, ...popularSuggestions].slice(0, 8));
  };

  // Update URL and localStorage when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.location) params.set('location', filters.location);
    if (filters.careType !== 'all') params.set('careType', filters.careType);
    if (filters.priceRange !== 'all') params.set('priceRange', filters.priceRange);
    if (filters.availability !== 'all') params.set('availability', filters.availability);
    if (filters.minRating !== 'all') params.set('minRating', filters.minRating);
    if (filters.hasPhotos) params.set('hasPhotos', 'true');
    if (viewMode !== 'list') params.set('view', viewMode);
    if (sortBy !== 'relevance') params.set('sortBy', sortBy);
    
    const newUrl = params.toString() ? `/search?${params.toString()}` : '/search';
    window.history.replaceState({}, '', newUrl);
    
    // Save search state to localStorage for back navigation
    const searchState = {
      location: filters.location,
      careType: filters.careType,
      priceRange: filters.priceRange,
      availability: filters.availability,
      minRating: filters.minRating,
      hasPhotos: filters.hasPhotos,
      viewMode: viewMode,
      sortBy: sortBy
    };
    localStorage.setItem('searchState', JSON.stringify(searchState));
  }, [filters, viewMode, sortBy]);

  // Convert filters to API search params
  const searchParams: SearchCommunity = {
    location: filters.location || undefined,
    careType: filters.careType !== 'all' ? filters.careType : undefined,
    budget: filters.priceRange !== 'all' ? filters.priceRange : undefined,
    availability: filters.availability !== 'all' ? filters.availability : undefined,
    minRating: filters.minRating !== 'all' ? parseFloat(filters.minRating) : undefined,
    hasPhotos: filters.hasPhotos || undefined,
  };

  // Get all communities and filter them
  const { data: allCommunities, isLoading, error } = useQuery<Community[]>({
    queryKey: ['/api/communities'],
  });

  // Filter communities based on current filters
  const filteredCommunities = allCommunities?.filter((community) => {
    // Location filter
    if (filters.location && filters.location.trim()) {
      const searchTerm = filters.location.toLowerCase();
      const matchesLocation = 
        community.city.toLowerCase().includes(searchTerm) ||
        community.state.toLowerCase().includes(searchTerm) ||
        community.zipCode.includes(searchTerm) ||
        community.name.toLowerCase().includes(searchTerm);
      if (!matchesLocation) return false;
    }

    // Care type filter
    if (filters.careType !== 'all' && community.careTypes) {
      if (!community.careTypes.includes(filters.careType)) return false;
    }

    // Rating filter
    if (filters.minRating !== 'all') {
      const communityRating = community.googleRating;
      const rating = typeof communityRating === 'string' ? parseFloat(communityRating) : (communityRating || 0);
      if (rating < parseFloat(filters.minRating)) return false;
    }

    // Photos filter
    if (filters.hasPhotos && (!community.photos || !Array.isArray(community.photos) || community.photos.length === 0)) {
      return false;
    }

    return true;
  }) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { label: 'Search', href: '/search' },
            { label: filteredCommunities.length > 0 ? `${filteredCommunities.length} Communities` : 'Results', current: true }
          ]}
          className="mb-6"
        />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Your Perfect Senior Living Community</h1>
          <p className="text-lg text-gray-600 mb-6">
            Search through our database of verified senior living communities in Northern California.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
            <Input
              placeholder="Search by location, community name, or ZIP code..."
              value={filters.location}
              onChange={(e) => {
                const value = e.target.value;
                setFilters(prev => ({ ...prev, location: value }));
                generateSuggestions(value);
                setShowSuggestions(true);
              }}
              onFocus={() => {
                generateSuggestions(filters.location);
                setShowSuggestions(true);
              }}
              onBlur={() => {
                setTimeout(() => setShowSuggestions(false), 150);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  saveSearchToHistory(filters.location);
                  setShowSuggestions(false);
                }
              }}
              className="pl-10 h-12 text-lg"
            />
            
            {/* Search Suggestions Dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setFilters(prev => ({ ...prev, location: suggestion }));
                      saveSearchToHistory(suggestion);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      {searchHistory.includes(suggestion) ? (
                        <div className="w-4 h-4 text-gray-400">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      ) : (
                        <SearchIcon className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-gray-900">{suggestion}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Filter Buttons */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-gray-700 mr-2">Popular filters:</span>
            <Button
              variant={filters.careType === "Assisted Living" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters(prev => ({ 
                ...prev, 
                careType: prev.careType === "Assisted Living" ? "all" : "Assisted Living" 
              }))}
            >
              Assisted Living
            </Button>
            <Button
              variant={filters.careType === "Memory Care" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters(prev => ({ 
                ...prev, 
                careType: prev.careType === "Memory Care" ? "all" : "Memory Care" 
              }))}
            >
              Memory Care
            </Button>
            <Button
              variant={filters.minRating === "4" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters(prev => ({ 
                ...prev, 
                minRating: prev.minRating === "4" ? "all" : "4" 
              }))}
            >
              4+ Stars
            </Button>
            <Button
              variant={filters.hasPhotos ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, hasPhotos: !prev.hasPhotos }))}
            >
              With Photos
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 items-center">
            <Select value={filters.careType} onValueChange={(value) => setFilters(prev => ({ ...prev, careType: value }))}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Care Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Care Types</SelectItem>
                <SelectItem value="Independent Living">Independent Living</SelectItem>
                <SelectItem value="Assisted Living">Assisted Living</SelectItem>
                <SelectItem value="Memory Care">Memory Care</SelectItem>
                <SelectItem value="Skilled Nursing">Skilled Nursing</SelectItem>
                <SelectItem value="CCRC">CCRC</SelectItem>
                <SelectItem value="55+ Housing">55+ Housing</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.minRating} onValueChange={(value) => setFilters(prev => ({ ...prev, minRating: value }))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Rating</SelectItem>
                <SelectItem value="4">4+ Stars</SelectItem>
                <SelectItem value="3">3+ Stars</SelectItem>
                <SelectItem value="2">2+ Stars</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Switch
                id="has-photos"
                checked={filters.hasPhotos}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, hasPhotos: checked }))}
              />
              <label htmlFor="has-photos" className="text-sm font-medium text-gray-700">
                Has Photos
              </label>
            </div>

            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="mb-8 bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Advanced Filters</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={filters.priceRange} onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Budgets</SelectItem>
                  <SelectItem value="budget">Under $4,000</SelectItem>
                  <SelectItem value="mid">$4,000 - $6,000</SelectItem>
                  <SelectItem value="premium">$6,000 - $8,000</SelectItem>
                  <SelectItem value="luxury">$8,000+</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.availability} onValueChange={(value) => setFilters(prev => ({ ...prev, availability: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Availability</SelectItem>
                  <SelectItem value="Available Now">Available Now</SelectItem>
                  <SelectItem value="Waitlist">Waitlist</SelectItem>
                  <SelectItem value="Contact for Availability">Contact for Availability</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* View Controls & Results Count */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            {isLoading ? (
              <div className="text-gray-600">Loading communities...</div>
            ) : error ? (
              <div className="text-red-600">Error loading communities. Please try again.</div>
            ) : (
              <div className="text-gray-600">
                {filteredCommunities.length} of {allCommunities?.length || 0} communities found
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'list' ? "default" : "outline"}
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              List
            </Button>
            <Button
              variant={viewMode === 'map' ? "default" : "outline"}
              onClick={() => setViewMode('map')}
              className="flex items-center gap-2"
            >
              <MapIcon className="h-4 w-4" />
              Map
            </Button>
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="city">City</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Content */}
        {viewMode === 'list' ? (
          <div>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <CommunityCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12 max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to load communities</h3>
                <p className="text-gray-600 mb-6">
                  We're having trouble connecting to our servers. This usually resolves quickly.
                </p>
                <div className="space-y-3">
                  <Button 
                    onClick={() => window.location.reload()}
                    className="w-full"
                  >
                    Try Again
                  </Button>
                  <p className="text-xs text-gray-500">
                    If the problem persists, try refreshing the page or check your internet connection.
                  </p>
                </div>
              </div>
            ) : !filteredCommunities.length ? (
              <div className="text-center py-12 max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <SearchIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No communities found</h3>
                <p className="text-gray-600 mb-6">
                  Don't worry! Try these suggestions to find more communities:
                </p>
                <div className="space-y-3 text-left">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span className="text-sm text-blue-900">
                      Try expanding your search radius or searching nearby cities
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <Filter className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-green-900">
                      Remove some filters like price range or care type
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <Star className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    <span className="text-sm text-purple-900">
                      Lower the minimum rating requirement
                    </span>
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  <Button 
                    onClick={() => setFilters({
                      location: filters.location,
                      careType: 'all',
                      priceRange: 'all', 
                      availability: 'all',
                      minRating: 'all',
                      hasPhotos: false
                    })}
                    className="w-full"
                  >
                    Clear All Filters
                  </Button>
                  <p className="text-xs text-gray-500">
                    Popular searches: "San Francisco", "Sacramento", "Assisted Living"
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCommunities.map((community) => (
                  <CommunityCard key={community.id} community={community} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="h-[600px]">
              <MapView 
                communities={filteredCommunities} 
                onCommunitySelect={setSelectedCommunity}
                selectedCommunity={selectedCommunity}
              />
            </div>
          </div>
        )}
      </main>
      
      <Footer />
      
      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        updateCount={0}
      />
    </div>
  );
}