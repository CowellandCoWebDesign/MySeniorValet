import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'wouter';
import { NavigationHeader } from '@/components/NavigationHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import Map from '@/components/Map';
import { EnhancedCommunityCard } from '@/components/EnhancedCommunityCard';
import { SimplifiedCommunityCard } from '@/components/SimplifiedCommunityCard';
import { AutocompleteSearch } from '@/components/AutocompleteSearch';
import { 
  Brain, 
  MapPin, 
  Search, 
  TrendingUp, 
  Shield, 
  DollarSign,
  Heart,
  Sparkles,
  ChevronRight,
  Loader2,
  Bot,
  Home,
  Star,
  Users,
  Activity,
  CheckCircle,
  AlertCircle,
  Info,
  Zap,
  Building2,
  BarChart3,
  Target,
  Calendar,
  Clock,
  TrendingDown,
  Filter,
  Eye
} from 'lucide-react';

interface AISearchResult {
  communities: any[];
  searchInterpretation: string;
  appliedFilters: any;
  aiInsights: {
    topRecommendations: any[];
    priceAnalysis: string;
    locationInsights: string;
    careTypeMatch: string;
  };
  transparencyReport?: any;
}

interface PerfectMatchProfile {
  careNeeds: string[];
  budget: { min: number; max: number };
  location: string;
  preferences: string[];
  urgency: 'immediate' | 'soon' | 'planning';
}

// Helper function to get city coordinates
const getCityCoordinates = (city: string, state: string): [number, number] | null => {
  const cityKey = city.toLowerCase().trim();
  const stateKey = state.toLowerCase().trim();
  
  // Major US cities with coordinates
  const cityCoords: { [key: string]: [number, number] } = {
    'new york': [40.7128, -74.0060],
    'brooklyn': [40.6782, -73.9442],
    'queens': [40.7282, -73.7949],
    'bronx': [40.8448, -73.8648],
    'manhattan': [40.7831, -73.9712],
    'los angeles': [34.0522, -118.2437],
    'chicago': [41.8781, -87.6298],
    'houston': [29.7604, -95.3698],
    'phoenix': [33.4484, -112.0740],
    'philadelphia': [39.9526, -75.1652],
    'san antonio': [29.4241, -98.4936],
    'san diego': [32.7157, -117.1611],
    'dallas': [32.7767, -96.7970],
    'san jose': [37.3382, -121.8863],
    'austin': [30.2672, -97.7431],
    'jacksonville': [30.3322, -81.6557],
    'fort worth': [32.7555, -97.3308],
    'columbus': [39.9612, -82.9988],
    'indianapolis': [39.7684, -86.1581],
    'charlotte': [35.2271, -80.8431],
    'san francisco': [37.7749, -122.4194],
    'seattle': [47.6062, -122.3321],
    'denver': [39.7392, -104.9903],
    'washington': [38.9072, -77.0369],
    'boston': [42.3601, -71.0589],
    'nashville': [36.1627, -86.7816],
    'detroit': [42.3314, -83.0458],
    'memphis': [35.1495, -90.0490],
    'portland': [45.5152, -122.6784],
    'las vegas': [36.1699, -115.1398],
    'louisville': [38.2527, -85.7585],
    'baltimore': [39.2904, -76.6122],
    'milwaukee': [43.0389, -87.9065],
    'albuquerque': [35.0844, -106.6504],
    'tucson': [32.2226, -110.9747],
    'fresno': [36.7378, -119.7871],
    'mesa': [33.4152, -111.8315],
    'sacramento': [38.5816, -121.4944],
    'atlanta': [33.7490, -84.3880],
    'miami': [25.7617, -80.1918],
    'orlando': [28.5383, -81.3792],
    'tampa': [27.9506, -82.4572],
    'pittsburgh': [40.4406, -79.9959],
    'cincinnati': [39.1031, -84.5120],
    'kansas city': [39.0997, -94.5786],
    'minneapolis': [44.9778, -93.2650],
    'st louis': [38.6270, -90.1994],
    'cleveland': [41.4993, -81.6944],
    'salt lake city': [40.7608, -111.8910],
    'richmond': [37.5407, -77.4360],
    'buffalo': [42.8864, -78.8784],
    'birmingham': [33.5186, -86.8104],
    'rochester': [43.1566, -77.6088],
    'des moines': [41.5868, -93.6250],
    'providence': [41.8240, -71.4128],
    'spokane': [47.6588, -117.4260],
    'omaha': [41.2565, -95.9345],
    'anchorage': [61.2181, -149.9003],
    'honolulu': [21.3099, -157.8581]
  };
  
  // Try exact city match
  if (cityCoords[cityKey]) {
    return cityCoords[cityKey];
  }
  
  // Try partial match
  for (const [key, coords] of Object.entries(cityCoords)) {
    if (cityKey.includes(key) || key.includes(cityKey)) {
      return coords;
    }
  }
  
  // State center coordinates as fallback
  const stateCoords: { [key: string]: [number, number] } = {
    'ny': [42.1657, -74.9481],
    'new york': [42.1657, -74.9481],
    'ca': [36.7783, -119.4179],
    'california': [36.7783, -119.4179],
    'tx': [31.9686, -99.9018],
    'texas': [31.9686, -99.9018],
    'fl': [27.6648, -81.5158],
    'florida': [27.6648, -81.5158]
  };
  
  if (stateCoords[stateKey]) {
    return stateCoords[stateKey];
  }
  
  return null;
};

export default function AISearchIntelligence() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCommunities, setSelectedCommunities] = useState<any[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194]);
  const [mapZoom, setMapZoom] = useState(10);
  const [activeTab, setActiveTab] = useState('search');
  const [searchType, setSearchType] = useState<'housing' | 'services' | 'marketplace' | 'resources'>('housing');
  
  // Perfect Match Profile State
  const [matchProfile, setMatchProfile] = useState<PerfectMatchProfile>({
    careNeeds: [],
    budget: { min: 0, max: 10000 },
    location: '',
    preferences: [],
    urgency: 'planning'
  });

  // Simplified Search Filters State
  const [simplifiedFilters, setSimplifiedFilters] = useState({
    location: '',
    typeOfLiving: [] as string[],
    amenities: [] as string[],
    unitType: [] as string[],
    distance: 50,
    priceRange: [500, 8000] as [number, number],
    immediateAvailability: false
  });

  // Check URL parameters to auto-switch to perfect match tab or simplified search
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    if (mode === 'perfect-match') {
      setActiveTab('match');
    } else if (mode === 'simplified') {
      setActiveTab('simplified');
    }
  }, []);

  // AI Search Mutation
  const aiSearchMutation = useMutation({
    mutationFn: async ({ query, type }: { query: string; type: string }) => {
      const response = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query, 
          searchType: type,
          context: { userLocation: matchProfile.location } 
        })
      });
      if (!response.ok) throw new Error('AI search failed');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['ai-search-results'], data);
      
      // Update map center based on search results
      const communities = data.communities || data.results || [];
      if (communities.length > 0) {
        // Get the first community with valid coordinates
        const firstCommunity = communities.find((c: any) => c.latitude && c.longitude);
        
        if (firstCommunity) {
          // Center map on first result
          setMapCenter([firstCommunity.latitude, firstCommunity.longitude]);
          setMapZoom(12); // Zoom in to city level
          console.log('🗺️ Relocating map to:', firstCommunity.city, firstCommunity.state);
        } else {
          // Try to determine location from city/state
          const locationCommunity = communities[0];
          if (locationCommunity?.city && locationCommunity?.state) {
            // Use geocoding estimates for major cities
            const cityCoords = getCityCoordinates(locationCommunity.city, locationCommunity.state);
            if (cityCoords) {
              setMapCenter(cityCoords);
              setMapZoom(11);
              console.log('🗺️ Relocating map to estimated location:', locationCommunity.city, locationCommunity.state);
            }
          }
        }
      }
    }
  });

  // AI Recommendations Mutation
  const aiRecommendationsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: matchProfile.preferences,
          budget: matchProfile.budget,
          location: matchProfile.location,
          careNeeds: matchProfile.careNeeds,
          urgency: matchProfile.urgency
        })
      });
      if (!response.ok) throw new Error('AI recommendations failed');
      return response.json();
    }
  });

  // AI Comparison Mutation
  const aiComparisonMutation = useMutation({
    mutationFn: async (communityIds: number[]) => {
      const response = await fetch('/api/ai/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ communityIds })
      });
      if (!response.ok) throw new Error('AI comparison failed');
      return response.json();
    }
  });

  // Simplified Search Mutation with Fallback Logic
  const simplifiedSearchMutation = useMutation({
    mutationFn: async (filters: typeof simplifiedFilters) => {
      // Primary search with all filters
      const primarySearchParams = new URLSearchParams({
        location: filters.location,
        careType: filters.typeOfLiving.join(',') || 'All Types',
        priceMin: filters.priceRange[0].toString(),
        priceMax: filters.priceRange[1].toString(),
        limit: '50',
        offset: '0'
      });

      let response = await fetch(`/api/communities/search/unified?${primarySearchParams}`);
      if (!response.ok) throw new Error('Simplified search failed');
      let data = await response.json();

      // If no results and filters are restrictive, try fallback searches
      if (!data.results || data.results.length === 0) {
        console.log('🔍 No results with full filters, trying fallback searches...');
        
        // Fallback 1: Remove price restrictions
        if (filters.priceRange[0] > 500 || filters.priceRange[1] < 8000) {
          const fallbackParams1 = new URLSearchParams({
            location: filters.location,
            careType: filters.typeOfLiving.join(',') || 'All Types',
            priceMin: '0',
            priceMax: '15000',
            limit: '25',
            offset: '0'
          });
          
          response = await fetch(`/api/communities/search/unified?${fallbackParams1}`);
          if (response.ok) {
            const fallbackData = await response.json();
            if (fallbackData.results && fallbackData.results.length > 0) {
              return {
                ...fallbackData,
                fallbackReason: 'Expanded price range to show more options',
                originalFilters: filters
              };
            }
          }
        }

        // Fallback 2: Expand care types if specific types were selected
        if (filters.typeOfLiving.length > 0 && filters.typeOfLiving.length < 4) {
          const fallbackParams2 = new URLSearchParams({
            location: filters.location,
            careType: 'All Types',
            priceMin: filters.priceRange[0].toString(),
            priceMax: filters.priceRange[1].toString(),
            limit: '25',
            offset: '0'
          });
          
          response = await fetch(`/api/communities/search/unified?${fallbackParams2}`);
          if (response.ok) {
            const fallbackData = await response.json();
            if (fallbackData.results && fallbackData.results.length > 0) {
              return {
                ...fallbackData,
                fallbackReason: 'Expanded care types to include all senior living options',
                originalFilters: filters
              };
            }
          }
        }

        // Fallback 3: Location only (remove all other filters)
        if (filters.location) {
          const fallbackParams3 = new URLSearchParams({
            location: filters.location,
            careType: 'All Types',
            priceMin: '0',
            priceMax: '15000',
            limit: '25',
            offset: '0'
          });
          
          response = await fetch(`/api/communities/search/unified?${fallbackParams3}`);
          if (response.ok) {
            const fallbackData = await response.json();
            if (fallbackData.results && fallbackData.results.length > 0) {
              return {
                ...fallbackData,
                fallbackReason: 'Showing all communities in your area - adjust filters to narrow results',
                originalFilters: filters
              };
            }
          }
        }

        // Fallback 4: National search with care type only
        if (filters.typeOfLiving.length > 0) {
          const fallbackParams4 = new URLSearchParams({
            location: '',
            careType: filters.typeOfLiving.join(','),
            priceMin: '0',
            priceMax: '15000',
            limit: '20',
            offset: '0'
          });
          
          response = await fetch(`/api/communities/search/unified?${fallbackParams4}`);
          if (response.ok) {
            const fallbackData = await response.json();
            if (fallbackData.results && fallbackData.results.length > 0) {
              return {
                ...fallbackData,
                fallbackReason: 'Showing national results for your selected care types',
                originalFilters: filters
              };
            }
          }
        }
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['simplified-search-results'], data);
      
      // Update map center based on first result
      if (data.results && data.results.length > 0) {
        const firstResult = data.results[0];
        if (firstResult.latitude && firstResult.longitude) {
          setMapCenter([parseFloat(firstResult.latitude), parseFloat(firstResult.longitude)]);
          setMapZoom(10);
        }
      }
    }
  });

  // Handle AI-powered search
  const handleAISearch = useCallback(async (query?: string) => {
    const searchText = query || searchQuery;
    if (!searchText.trim()) return;
    
    setIsAnalyzing(true);
    try {
      await aiSearchMutation.mutateAsync({ query: searchText, type: searchType });
    } finally {
      setIsAnalyzing(false);
    }
  }, [searchQuery, searchType, aiSearchMutation]);

  // Handle Perfect Match analysis
  const handlePerfectMatch = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      await aiRecommendationsMutation.mutateAsync();
    } finally {
      setIsAnalyzing(false);
    }
  }, [matchProfile]);

  // Handle community comparison
  const handleCompareommunities = useCallback(async () => {
    if (selectedCommunities.length < 2) return;
    
    setShowComparison(true);
    const communityIds = selectedCommunities.map(c => c.id);
    await aiComparisonMutation.mutateAsync(communityIds);
  }, [selectedCommunities]);

  // Use mutation data directly for search results
  const searchResults = {
    data: aiSearchMutation.data || null,
    isLoading: aiSearchMutation.isPending,
    error: aiSearchMutation.error
  };

  return (
    <div className="min-h-screen relative">
      {/* Cosmic background image - same as hero page */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(https://cdn.pixabay.com/photo/2016/11/29/05/45/astronomy-1867616_1280.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/50 dark:bg-black/70" />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <NavigationHeader />
        
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white text-sm font-semibold mb-4">
              <Brain className="w-4 h-4 mr-2" />
              AI-Powered Intelligence
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
              Find Your Perfect Senior Living Match
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto drop-shadow">
              Our multi-AI system analyzes thousands of communities to find your perfect match,
              providing transparent insights and personalized recommendations
            </p>
          </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-3xl mx-auto">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              AI Search
            </TabsTrigger>
            <TabsTrigger value="simplified" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Simplified
            </TabsTrigger>
            <TabsTrigger value="match" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Perfect Match
            </TabsTrigger>
            <TabsTrigger value="compare" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              AI Compare
            </TabsTrigger>
          </TabsList>

          {/* Intelligent Search Tab */}
          <TabsContent value="search" className="space-y-6">
            {/* Search Type Filter */}
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant={searchType === 'housing' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchType('housing')}
                className="flex items-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                Housing Communities
              </Button>
              <Button
                variant={searchType === 'services' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchType('services')}
                className="flex items-center gap-2"
              >
                <Heart className="w-4 h-4" />
                Care Services
              </Button>
              <Button
                variant={searchType === 'marketplace' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchType('marketplace')}
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Marketplace Vendors
              </Button>
              <Button
                variant={searchType === 'resources' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchType('resources')}
                className="flex items-center gap-2"
              >
                <Activity className="w-4 h-4" />
                Resources
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-6 h-6 text-purple-600" />
                  {searchType === 'housing' && 'AI-Powered Housing Search'}
                  {searchType === 'services' && 'Find Care Services Near You'}
                  {searchType === 'marketplace' && 'Discover Marketplace Solutions'}
                  {searchType === 'resources' && 'Explore Healthcare Resources'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Use AutocompleteSearch component for predictive text */}
                  <AutocompleteSearch
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onSubmit={(value) => {
                      setSearchQuery(value); // Update state
                      handleAISearch(value); // Execute search immediately with value
                    }}
                    placeholder={
                      searchType === 'housing' ? "Search cities, communities, or care types..." :
                      searchType === 'services' ? "Search for care services..." :
                      searchType === 'marketplace' ? "Search for vendors..." :
                      "Search for healthcare resources, VA facilities, hospitals..."
                    }
                    isLoading={isAnalyzing}
                  />
                </div>

                {/* Enhanced AI Search Interpretation */}
                {searchResults.data?.searchInterpretation && (
                  <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Bot className="w-5 h-5 text-purple-600 mt-0.5" />
                      <div className="w-full">
                        <p className="font-medium text-purple-900 dark:text-purple-100">
                          AI Understanding:
                        </p>
                        <p className="text-purple-700 dark:text-purple-300 mt-1">
                          {searchResults.data.searchInterpretation}
                        </p>
                        
                        {/* Comparative Analysis */}
                        {searchResults.data.comparativeAnalysis && (
                          <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800">
                            <p className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                              Comparative Analysis:
                            </p>
                            {searchResults.data.comparativeAnalysis.priceComparison && (
                              <div className="mb-3">
                                <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                                  Price Comparison:
                                </span>
                                <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                                  {searchResults.data.comparativeAnalysis.priceComparison}
                                </p>
                              </div>
                            )}
                            {searchResults.data.comparativeAnalysis.valueLeaders?.length > 0 && (
                              <div className="mb-3">
                                <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                                  Best Value Communities:
                                </span>
                                <ul className="text-sm text-purple-700 dark:text-purple-300 mt-1 list-disc list-inside">
                                  {searchResults.data.comparativeAnalysis.valueLeaders.map((leader: string, idx: number) => (
                                    <li key={idx}>{leader}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {searchResults.data.comparativeAnalysis.hudAffordable?.length > 0 && (
                              <div className="mb-3">
                                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                                  HUD-Verified Affordable Housing:
                                </span>
                                <ul className="text-sm text-green-700 dark:text-green-300 mt-1 list-disc list-inside">
                                  {searchResults.data.comparativeAnalysis.hudAffordable.map((hud: string, idx: number) => (
                                    <li key={idx}>{hud}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Location Insights */}
                        {searchResults.data.locationInsights && typeof searchResults.data.locationInsights === 'object' && (
                          <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800">
                            <p className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                              Location Insights:
                            </p>
                            {searchResults.data.locationInsights.bestNeighborhoods?.length > 0 && (
                              <div className="mb-2">
                                <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                                  Best Neighborhoods:
                                </span>
                                <ul className="text-sm text-purple-700 dark:text-purple-300 mt-1 list-disc list-inside">
                                  {searchResults.data.locationInsights.bestNeighborhoods.map((neighborhood: string, idx: number) => (
                                    <li key={idx}>{neighborhood}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {searchResults.data.locationInsights.accessibility && (
                              <div className="mb-2">
                                <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                                  Accessibility:
                                </span>
                                <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                                  {searchResults.data.locationInsights.accessibility}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top AI Recommendations */}
            {searchResults.data?.topRecommendations && searchResults.data.topRecommendations.length > 0 && (
              <Card className="border-2 border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-purple-600" />
                    AI Top Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {searchResults.data.topRecommendations.map((rec: any, idx: number) => (
                      <div key={idx} className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                          {rec.name}
                        </h4>
                        {rec.strengths && rec.strengths.length > 0 && (
                          <div className="mb-2">
                            <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                              Strengths:
                            </span>
                            <ul className="text-sm text-purple-700 dark:text-purple-300 mt-1 list-disc list-inside">
                              {rec.strengths.map((strength: string, sIdx: number) => (
                                <li key={sIdx}>{strength}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {rec.idealFor && (
                          <div className="mb-2">
                            <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                              Ideal For:
                            </span>
                            <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                              {rec.idealFor}
                            </p>
                          </div>
                        )}
                        {rec.considerations && rec.considerations.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                              Considerations:
                            </span>
                            <ul className="text-sm text-orange-700 dark:text-orange-300 mt-1 list-disc list-inside">
                              {rec.considerations.map((consideration: string, cIdx: number) => (
                                <li key={cIdx}>{consideration}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Dynamic Results Display */}
            {(searchResults.data?.communities || searchResults.data?.results || searchResults.data?.services || searchResults.data?.vendors || searchResults.data?.resources || searchResults.data?.searchInterpretation) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Interactive Map - Only show for housing */}
                {searchType === 'housing' && (
                  <Card className="h-[600px]">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        AI Map Intelligence
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[calc(100%-5rem)] p-0">
                      <Map
                        center={mapCenter}
                        zoom={mapZoom}
                        searchFilters={{
                          careType: matchProfile.careNeeds[0],
                          budget: `${matchProfile.budget.min}-${matchProfile.budget.max}`
                        }}
                        onBoundsChange={(bounds: any) => {
                          console.log('Map bounds changed:', bounds);
                        }}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Search Results */}
                <div className={`space-y-4 max-h-[600px] overflow-y-auto ${searchType !== 'housing' ? 'col-span-2' : ''}`}>
                  <div className="sticky top-0 bg-white dark:bg-gray-900 z-10 pb-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-600" />
                      {searchType === 'housing' && `${searchResults.data?.communities?.length || searchResults.data?.results?.length || 0} AI-Verified Communities`}
                      {searchType === 'services' && `${searchResults.data?.services?.length || 0} Care Services Found`}
                      {searchType === 'marketplace' && `${searchResults.data?.vendors?.length || 0} Marketplace Vendors`}
                      {searchType === 'resources' && `${searchResults.data?.resources?.length || 0} Healthcare Resources Available`}
                    </h3>
                  </div>
                  
                  {/* No Exact Match - Show Suggestions */}
                  {searchType === 'housing' && searchResults.data.noExactMatch && searchResults.data.suggestions && (
                    <Card className="border-2 border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/20">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3 mb-4">
                          <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                              {searchResults.data.suggestions.message}
                            </h4>
                            <ul className="space-y-1">
                              {searchResults.data.suggestions.tips.map((tip: string, idx: number) => (
                                <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                  <ChevronRight className="w-3 h-3 text-gray-400 mt-0.5" />
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* Housing Results - Enhanced Display */}
                  {searchType === 'housing' && (searchResults.data?.communities || searchResults.data?.results || []).map((community: any, idx: number) => (
                    <div key={community.id} className="relative group">
                      <EnhancedCommunityCard
                        community={community}
                        variant="list"
                        index={idx}
                        onSelect={() => {
                          // Navigate to community detail page
                          window.location.href = `/community/${community.id}`;
                        }}
                      />
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newSelected = selectedCommunities.find(c => c.id === community.id)
                              ? selectedCommunities.filter(c => c.id !== community.id)
                              : [...selectedCommunities, community];
                            setSelectedCommunities(newSelected);
                          }}
                        >
                          {selectedCommunities.find(c => c.id === community.id) ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                              Selected
                            </>
                          ) : (
                            <>
                              <Target className="w-4 h-4 mr-1" />
                              Compare
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Care Services Results */}
                  {searchType === 'services' && searchResults.data.services?.map((service: any) => (
                    <Card key={service.id} className="p-4">
                      <h4 className="font-semibold text-lg">{service.name}</h4>
                      <p className="text-gray-600 dark:text-gray-400">{service.serviceType}</p>
                      <p className="text-sm">{service.address}, {service.city}, {service.state}</p>
                      {service.phone && <p className="text-sm mt-2">📞 {service.phone}</p>}
                      {service.rating && (
                        <div className="flex items-center gap-1 mt-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm">{service.rating}</span>
                        </div>
                      )}
                    </Card>
                  ))}

                  {/* Marketplace Vendors Results */}
                  {searchType === 'marketplace' && searchResults.data.vendors?.map((vendor: any) => (
                    <Card key={vendor.id} className="p-4 hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-lg">{vendor.name}</h4>
                          {vendor.featured && (
                            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                              Featured
                            </Badge>
                          )}
                        </div>
                        {vendor.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm">{vendor.rating} ({vendor.reviewCount || 0} reviews)</span>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {vendor.category} • {vendor.yearsInBusiness ? `${vendor.yearsInBusiness} years in business` : 'New vendor'}
                      </p>
                      <p className="text-sm mt-2">{vendor.description}</p>
                      {vendor.city && vendor.state && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          📍 {vendor.city}, {vendor.state}
                        </p>
                      )}
                      {vendor.website && (
                        <a href={vendor.website} target="_blank" rel="noopener noreferrer" 
                           className="text-blue-600 dark:text-blue-400 text-sm mt-2 inline-block hover:underline">
                          Visit Website →
                        </a>
                      )}
                      <div className="mt-3">
                        <Badge variant="outline" className="text-xs">
                          {vendor.subscriptionTier === 'national' ? 'National Partner' :
                           vendor.subscriptionTier === 'featured' ? 'Featured Vendor' : 'Basic Listing'}
                        </Badge>
                      </div>
                    </Card>
                  ))}

                  {/* Healthcare Resources Results */}
                  {searchType === 'resources' && searchResults.data.resources?.map((resourceGroup: any, idx: number) => (
                    <Card key={idx} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-lg flex items-center gap-2">
                            {resourceGroup.type === 'VA Medical Center' && <Activity className="w-5 h-5 text-blue-600" />}
                            {resourceGroup.type === 'Hospital' && <Building2 className="w-5 h-5 text-red-600" />}
                            {resourceGroup.type === 'Health Clinic' && <Heart className="w-5 h-5 text-green-600" />}
                            {resourceGroup.type === 'HUD Resource' && <Home className="w-5 h-5 text-purple-600" />}
                            {resourceGroup.name}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400">
                            {resourceGroup.count} {resourceGroup.count === 1 ? 'location' : 'locations'} available
                          </p>
                        </div>
                        <Badge variant="outline">
                          {resourceGroup.type}
                        </Badge>
                      </div>
                      
                      {/* Show first few items from this resource group */}
                      {resourceGroup.items && resourceGroup.items.slice(0, 3).map((item: any, itemIdx: number) => (
                        <div key={itemIdx} className="border-t pt-2 mt-2">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {item.city}, {item.state}
                            {item.phone && ` • ${item.phone}`}
                          </p>
                          {item.isVeteranFriendly && (
                            <Badge className="mt-1 text-xs" variant="secondary">
                              Veteran Friendly
                            </Badge>
                          )}
                        </div>
                      ))}
                      
                      {resourceGroup.items && resourceGroup.items.length > 3 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          +{resourceGroup.items.length - 3} more locations
                        </p>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Simplified Search Tab - New Layout Matching Screenshot */}
          <TabsContent value="simplified" className="space-y-4">
            {/* Header Section with Badges */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4">
              <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">Senior Living Research</h2>
                  <span className="text-2xl font-bold text-blue-600">Simplified</span>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Shield className="w-5 h-5 text-gray-600" />
                    <div className="text-sm">
                      <div className="font-semibold">Privacy</div>
                      <div className="text-xs text-gray-500">We Don't Sell Your Personal Information To Facilities</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Eye className="w-5 h-5 text-gray-600" />
                    <div className="text-sm">
                      <div className="font-semibold">Transparency</div>
                      <div className="text-xs text-gray-500">Each Listing Has A Starting Price, Average Price, And Current Availability</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-5 h-5 text-gray-600" />
                    <div className="text-sm">
                      <div className="font-semibold">Convenience</div>
                      <div className="text-xs text-gray-500">Have Questions? Direct Message The Facility Right From Their Listing</div>
                    </div>
                  </div>
                  
                  <Button className="bg-blue-600 text-white hover:bg-blue-700">
                    <Users className="w-4 h-4 mr-2" />
                    Create A Profile
                  </Button>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by Zip code, City, Location"
                  value={simplifiedFilters.location}
                  onChange={(e) => setSimplifiedFilters({
                    ...simplifiedFilters,
                    location: e.target.value
                  })}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      simplifiedSearchMutation.mutate(simplifiedFilters);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-3 text-lg border-2 border-gray-200 rounded-lg focus:border-blue-500"
                />
              </div>
            </div>

            {/* Horizontal Filter Bar */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4">
              <div className="flex flex-wrap items-center gap-4">
                {/* Type of Living */}
                <div className="flex flex-col">
                  <label className="text-xs font-semibold mb-1">Type of Living</label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={simplifiedFilters.typeOfLiving.includes('independent-living') ? 'default' : 'outline'}
                      onClick={() => {
                        const newTypes = simplifiedFilters.typeOfLiving.includes('independent-living')
                          ? simplifiedFilters.typeOfLiving.filter(t => t !== 'independent-living')
                          : [...simplifiedFilters.typeOfLiving, 'independent-living'];
                        setSimplifiedFilters({ ...simplifiedFilters, typeOfLiving: newTypes });
                      }}
                      className="h-12 px-3"
                    >
                      <Home className="w-4 h-4 mr-1" />
                      <div className="text-left">
                        <div className="text-xs">Independent Living</div>
                        <div className="text-[10px] opacity-75">55+</div>
                      </div>
                    </Button>
                    
                    <Button
                      size="sm"
                      variant={simplifiedFilters.typeOfLiving.includes('assisted-living') ? 'default' : 'outline'}
                      onClick={() => {
                        const newTypes = simplifiedFilters.typeOfLiving.includes('assisted-living')
                          ? simplifiedFilters.typeOfLiving.filter(t => t !== 'assisted-living')
                          : [...simplifiedFilters.typeOfLiving, 'assisted-living'];
                        setSimplifiedFilters({ ...simplifiedFilters, typeOfLiving: newTypes });
                      }}
                      className="h-12 px-3"
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      <div className="text-left">
                        <div className="text-xs">Assisted Living</div>
                        <div className="text-[10px] opacity-75">Memory Care</div>
                      </div>
                    </Button>
                    
                    <Button
                      size="sm"
                      variant={simplifiedFilters.typeOfLiving.includes('skilled-nursing') ? 'default' : 'outline'}
                      onClick={() => {
                        const newTypes = simplifiedFilters.typeOfLiving.includes('skilled-nursing')
                          ? simplifiedFilters.typeOfLiving.filter(t => t !== 'skilled-nursing')
                          : [...simplifiedFilters.typeOfLiving, 'skilled-nursing'];
                        setSimplifiedFilters({ ...simplifiedFilters, typeOfLiving: newTypes });
                      }}
                      className="h-12 px-3"
                    >
                      <Building2 className="w-4 h-4 mr-1" />
                      <div className="text-left">
                        <div className="text-xs">Nursing Home</div>
                      </div>
                    </Button>
                    
                    <Button size="sm" variant="outline" className="h-12 px-3">
                      <ChevronRight className="w-4 h-4 mr-1" />
                      More
                    </Button>
                  </div>
                </div>

                {/* Amenities/Care Services */}
                <div className="flex flex-col">
                  <label className="text-xs font-semibold mb-1">Amenities/Care Services</label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={simplifiedFilters.amenities.includes('medical') ? 'default' : 'outline'}
                      onClick={() => {
                        const newAmenities = simplifiedFilters.amenities.includes('medical')
                          ? simplifiedFilters.amenities.filter(a => a !== 'medical')
                          : [...simplifiedFilters.amenities, 'medical'];
                        setSimplifiedFilters({ ...simplifiedFilters, amenities: newAmenities });
                      }}
                      className="h-12 px-3"
                    >
                      <Activity className="w-4 h-4 mr-1" />
                      <div className="text-xs">Medication<br/>Management</div>
                    </Button>
                    
                    <Button
                      size="sm"
                      variant={simplifiedFilters.amenities.includes('dining') ? 'default' : 'outline'}
                      onClick={() => {
                        const newAmenities = simplifiedFilters.amenities.includes('dining')
                          ? simplifiedFilters.amenities.filter(a => a !== 'dining')
                          : [...simplifiedFilters.amenities, 'dining'];
                        setSimplifiedFilters({ ...simplifiedFilters, amenities: newAmenities });
                      }}
                      className="h-12 px-3"
                    >
                      <Home className="w-4 h-4 mr-1" />
                      <div className="text-xs">Daily Meal<br/>Preparation</div>
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-12 px-3"
                    >
                      <ChevronRight className="w-4 h-4 mr-1" />
                      More
                    </Button>
                  </div>
                </div>

                {/* Unit/Room Type */}
                <div className="flex flex-col">
                  <label className="text-xs font-semibold mb-1">Unit/Room Type</label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={simplifiedFilters.unitType.includes('studio') ? 'default' : 'outline'}
                      onClick={() => {
                        const newUnits = simplifiedFilters.unitType.includes('studio')
                          ? simplifiedFilters.unitType.filter(u => u !== 'studio')
                          : [...simplifiedFilters.unitType, 'studio'];
                        setSimplifiedFilters({ ...simplifiedFilters, unitType: newUnits });
                      }}
                      className="h-12 px-3"
                    >
                      <Home className="w-4 h-4 mr-1" />
                      Studio
                    </Button>
                    
                    <Button
                      size="sm"
                      variant={simplifiedFilters.unitType.includes('1-bedroom') ? 'default' : 'outline'}
                      onClick={() => {
                        const newUnits = simplifiedFilters.unitType.includes('1-bedroom')
                          ? simplifiedFilters.unitType.filter(u => u !== '1-bedroom')
                          : [...simplifiedFilters.unitType, 'studio', '1-bedroom'];
                        setSimplifiedFilters({ ...simplifiedFilters, unitType: newUnits });
                      }}
                      className="h-12 px-3"
                    >
                      <Building2 className="w-4 h-4 mr-1" />
                      <div className="text-xs">1 Bed</div>
                    </Button>
                    
                    <Button
                      size="sm"
                      variant={simplifiedFilters.unitType.includes('2-bedroom') ? 'default' : 'outline'}
                      onClick={() => {
                        const newUnits = simplifiedFilters.unitType.includes('2-bedroom')
                          ? simplifiedFilters.unitType.filter(u => u !== '2-bedroom')
                          : [...simplifiedFilters.unitType, '2-bedroom'];
                        setSimplifiedFilters({ ...simplifiedFilters, unitType: newUnits });
                      }}
                      className="h-12 px-3 bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <Home className="w-4 h-4 mr-1" />
                      2 Bed
                    </Button>
                    
                    <Button size="sm" variant="outline" className="h-12 px-3">
                      <ChevronRight className="w-4 h-4 mr-1" />
                      More
                    </Button>
                  </div>
                </div>

                {/* Distance Slider */}
                <div className="flex flex-col flex-1 min-w-[150px]">
                  <label className="text-xs font-semibold mb-1">Distance</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">0</span>
                    <Slider
                      value={[simplifiedFilters.distance]}
                      onValueChange={(value) => setSimplifiedFilters({
                        ...simplifiedFilters,
                        distance: value[0]
                      })}
                      min={0}
                      max={50}
                      step={5}
                      className="flex-1"
                    />
                    <span className="text-xs">50 Miles</span>
                  </div>
                  <div className="text-xs text-center mt-1 text-gray-500">{simplifiedFilters.distance} mi</div>
                </div>

                {/* Price Slider */}
                <div className="flex flex-col flex-1 min-w-[200px]">
                  <label className="text-xs font-semibold mb-1">Price</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">$500</span>
                    <Slider
                      value={simplifiedFilters.priceRange}
                      onValueChange={(value) => setSimplifiedFilters({
                        ...simplifiedFilters,
                        priceRange: value as [number, number]
                      })}
                      min={500}
                      max={8000}
                      step={100}
                      className="flex-1"
                    />
                    <span className="text-xs">$8000</span>
                  </div>
                  <div className="text-xs text-center mt-1 text-gray-500">
                    ${simplifiedFilters.priceRange[0]} - ${simplifiedFilters.priceRange[1]}
                  </div>
                </div>

                {/* Immediate Availability */}
                <div className="flex flex-col">
                  <label className="text-xs font-semibold mb-1">Immediate Availability</label>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        simplifiedSearchMutation.mutate(simplifiedFilters);
                      }}
                      className="bg-blue-600 text-white hover:bg-blue-700 h-12"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Apply
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSimplifiedFilters({
                          location: '',
                          typeOfLiving: [],
                          amenities: [],
                          unitType: [],
                          priceRange: [500, 8000],
                          distance: 25,
                          immediateAvailability: false
                        });
                      }}
                      className="h-12 text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Reset Filter
                    </Button>
                  </div>
                </div>

                {/* View All Button */}
                <Button variant="ghost" className="h-12">
                  <ChevronRight className="w-4 h-4 mr-1" />
                  View all
                </Button>
              </div>
            </div>

            {/* Map and List Layout */}
            <div className="flex gap-4 h-[600px]">
              {/* Map Section - Left Side */}
              <div className="flex-1 bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden">
                <Map
                  communities={simplifiedSearchMutation.data?.results || []}
                  center={mapCenter}
                  zoom={mapZoom}
                  onMarkerClick={(community) => {
                    // Scroll to community in list
                    const element = document.getElementById(`community-${community.id}`);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  className="h-full w-full"
                />
              </div>

              {/* List Section - Right Side */}
              <div className="w-[400px] bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-y-auto">
                {simplifiedSearchMutation.isPending ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : simplifiedSearchMutation.data?.results && simplifiedSearchMutation.data.results.length > 0 ? (
                  <div className="space-y-3 p-4">
                    {simplifiedSearchMutation.data.results.map((community: any) => (
                      <div
                        key={community.id}
                        id={`community-${community.id}`}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => window.location.href = `/community/${community.id}`}
                      >
                        <div className="flex gap-3">
                          {/* Community Image */}
                          <div className="w-24 h-24 flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                            {community.photos && community.photos.length > 0 ? (
                              <img 
                                src={community.photos[0]} 
                                alt={community.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Building2 className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Community Details */}
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm mb-1">{community.name}</h3>
                            
                            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Average Price:</span>
                                <Badge variant="outline" className="text-xs">
                                  {community.basePrice ? `$${community.basePrice.toLocaleString()}/Month` : 'Contact for pricing'}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Starting Price:</span>
                                <span>{community.minPrice ? `$${community.minPrice.toLocaleString()}/Month` : 'Contact'}</span>
                              </div>

                              {/* Services */}
                              <div className="flex gap-1 mt-2">
                                {community.assistedLiving && <Badge className="text-[10px] px-1 py-0">Assisted Living</Badge>}
                                {community.memoryCare && <Badge className="text-[10px] px-1 py-0">Memory Care</Badge>}
                                {community.independentLiving && <Badge className="text-[10px] px-1 py-0">Independent</Badge>}
                              </div>

                              {/* Availability */}
                              <div className="flex items-center gap-1 mt-2">
                                <span className="font-medium">Availability:</span>
                                <Badge 
                                  variant={community.hasAvailability ? 'default' : 'secondary'}
                                  className="text-[10px]"
                                >
                                  {community.hasAvailability ? 'Yes' : 'Contact'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <MapPin className="w-12 h-12 text-gray-400 mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No Results Found</h3>
                    <p className="text-sm text-gray-500">
                      Try adjusting your filters or search in a different location
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Perfect Match Tab - Enhanced */}
          <TabsContent value="match" className="space-y-6">
            <Card className="border-2 border-green-200 dark:border-green-800">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Target className="w-6 h-6 text-green-600" />
                  Build Your Perfect Match Profile
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Let our AI analyze your needs and find the ideal communities that match your unique requirements
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-6">
                  {/* Care Needs - Enhanced with descriptions */}
                  <div>
                    <label className="text-sm font-medium mb-3 block flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      What Level of Care Do You Need?
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        {
                          name: 'Stay at Home',
                          description: '🏠 Home care services & support ($500-$4,000/mo)',
                          icon: <Heart className="w-4 h-4 text-pink-600" />,
                          popular: true
                        },
                        {
                          name: 'HUD Housing',
                          description: 'Government-subsidized senior housing ($0-$500/mo)',
                          icon: <Building2 className="w-4 h-4 text-indigo-600" />
                        },
                        {
                          name: '55+ Mobile Home',
                          description: 'Affordable mobile home communities ($500-$1,500/mo)',
                          icon: <Home className="w-4 h-4 text-cyan-600" />
                        },
                        {
                          name: 'Active Adult 55+',
                          description: 'Age-restricted communities with amenities ($1,500-$3,000/mo)',
                          icon: <Users className="w-4 h-4 text-teal-600" />
                        },
                        {
                          name: 'Independent Living',
                          description: 'Active lifestyle with minimal assistance ($2,000-$5,000/mo)',
                          icon: <Home className="w-4 h-4 text-green-600" />
                        },
                        {
                          name: 'Assisted Living',
                          description: 'Help with daily activities ($3,000-$7,000/mo)',
                          icon: <Heart className="w-4 h-4 text-blue-600" />
                        },
                        {
                          name: 'Memory Care',
                          description: 'Specialized dementia care ($4,000-$10,000/mo)',
                          icon: <Brain className="w-4 h-4 text-purple-600" />
                        },
                        {
                          name: 'Skilled Nursing',
                          description: '24/7 medical care ($6,000-$12,000+/mo)',
                          icon: <Activity className="w-4 h-4 text-red-600" />
                        }
                      ].map((need) => (
                        <div 
                          key={need.name} 
                          className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md relative ${
                            matchProfile.careNeeds.includes(need.name) 
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                          onClick={() => {
                            const newNeeds = matchProfile.careNeeds.includes(need.name)
                              ? matchProfile.careNeeds.filter(n => n !== need.name)
                              : [...matchProfile.careNeeds, need.name];
                            setMatchProfile({ ...matchProfile, careNeeds: newNeeds });
                          }}
                        >
                          {need.popular && (
                            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-xs font-bold text-white px-2 py-1 rounded-full shadow-lg">
                              Most Popular! 🌟
                            </div>
                          )}
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={matchProfile.careNeeds.includes(need.name)}
                              onChange={(e) => {
                                const newCareNeeds = e.target.checked
                                  ? [...matchProfile.careNeeds, need.name]
                                  : matchProfile.careNeeds.filter(n => n !== need.name);
                                setMatchProfile({ ...matchProfile, careNeeds: newCareNeeds });
                              }}
                              className="mt-1 rounded text-green-600"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 font-medium">
                                {need.icon}
                                {need.name}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {need.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Budget Range - Enhanced with slider and care level indicators */}
                  <div>
                    <label className="text-sm font-medium mb-3 block flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      Monthly Budget Range
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <div className="mb-4">
                        <Slider
                          value={[matchProfile.budget.min, matchProfile.budget.max]}
                          onValueChange={(values) => setMatchProfile({
                            ...matchProfile,
                            budget: { min: values[0], max: values[1] }
                          })}
                          max={15000}
                          min={0}
                          step={100}
                          className="mb-6"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">Minimum</label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                              type="number"
                              placeholder="0"
                              value={matchProfile.budget.min}
                              onChange={(e) => setMatchProfile({
                                ...matchProfile,
                                budget: { ...matchProfile.budget, min: parseInt(e.target.value) || 0 }
                              })}
                              className="pl-8"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">Maximum</label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                              type="number"
                              placeholder="12000"
                              value={matchProfile.budget.max}
                              onChange={(e) => setMatchProfile({
                                ...matchProfile,
                                budget: { ...matchProfile.budget, max: parseInt(e.target.value) || 12000 }
                              })}
                              className="pl-8"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                        Budget: <span className="font-bold text-green-600">
                          ${matchProfile.budget.min.toLocaleString()} - ${matchProfile.budget.max.toLocaleString()}
                        </span> per month
                      </div>
                      {/* Budget guide for care levels */}
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                          {matchProfile.budget.max <= 500 && '💰 HUD Housing range'}
                          {matchProfile.budget.max > 500 && matchProfile.budget.max <= 1500 && '🏡 Mobile Home range'}
                          {matchProfile.budget.max > 1500 && matchProfile.budget.max <= 3000 && '🏘️ Active Adult range'}
                          {matchProfile.budget.max > 3000 && matchProfile.budget.max <= 5000 && '🏠 Independent Living range'}
                          {matchProfile.budget.max > 5000 && matchProfile.budget.max <= 7000 && '💙 Assisted Living range'}
                          {matchProfile.budget.max > 7000 && matchProfile.budget.max <= 10000 && '🧠 Memory Care range'}
                          {matchProfile.budget.max > 10000 && '🏥 Skilled Nursing range'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Location - Enhanced with Autocomplete */}
                  <div>
                    <label className="text-sm font-medium mb-3 block flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      Preferred Location
                    </label>
                    <AutocompleteSearch
                      value={matchProfile.location}
                      onChange={(value) => setMatchProfile({ ...matchProfile, location: value })}
                      onSubmit={(value) => {
                        setMatchProfile({ ...matchProfile, location: value });
                        // Optionally trigger map update when location is selected
                        const coords = getCityCoordinates(value.split(',')[0].trim(), value.split(',')[1]?.trim() || '');
                        if (coords) {
                          setMapCenter(coords);
                          setMapZoom(11);
                        }
                      }}
                      placeholder="Start typing a city, state, or community name..."
                      isLoading={false}
                    />
                  </div>

                  {/* Preferences - Enhanced */}
                  <div>
                    <label className="text-sm font-medium mb-3 block flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      Important Features & Amenities
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        'Pet Friendly 🐕', 'Pool/Spa 🏊', 'Fitness Center 💪', 
                        'Transportation 🚌', 'Religious Services 🙏', 'Gardens 🌷',
                        'Private Rooms 🏠', 'Couples Housing 💑', 'Veterans Programs 🎖️'
                      ].map((pref) => {
                        const prefName = pref.split(' ')[0] + ' ' + (pref.split(' ')[1] || '').replace(/[^a-zA-Z]/g, '');
                        return (
                          <label key={pref} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors">
                            <input
                              type="checkbox"
                              checked={matchProfile.preferences.includes(prefName.trim())}
                              onChange={(e) => {
                                const newPrefs = e.target.checked
                                  ? [...matchProfile.preferences, prefName.trim()]
                                  : matchProfile.preferences.filter(p => p !== prefName.trim());
                                setMatchProfile({ ...matchProfile, preferences: newPrefs });
                              }}
                              className="rounded text-green-600"
                            />
                            <span className="text-sm">{pref}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Urgency - Enhanced */}
                  <div>
                    <label className="text-sm font-medium mb-3 block flex items-center gap-2">
                      <Zap className="w-4 h-4 text-orange-500" />
                      When Do You Need Care?
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'immediate', label: 'ASAP', sublabel: 'Urgent need', icon: AlertCircle, color: 'red' },
                        { value: 'soon', label: '1-3 Months', sublabel: 'Coming soon', icon: Info, color: 'yellow' },
                        { value: 'planning', label: 'Planning Ahead', sublabel: 'No rush', icon: CheckCircle, color: 'green' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setMatchProfile({ ...matchProfile, urgency: option.value as any })}
                          className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                            matchProfile.urgency === option.value
                              ? `border-${option.color}-500 bg-${option.color}-50 dark:bg-${option.color}-900/20`
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <option.icon className={`w-6 h-6 mx-auto mb-2 text-${option.color}-600`} />
                          <p className="text-sm font-medium">{option.label}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{option.sublabel}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Find Match Button - Enhanced */}
                  <div className="pt-4 border-t">
                    <Button 
                      onClick={handlePerfectMatch}
                      disabled={isAnalyzing || matchProfile.careNeeds.length === 0 || !matchProfile.location}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                      size="lg"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          AI Analyzing Your Perfect Match...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Find My Perfect Match
                        </>
                      )}
                    </Button>
                    {(matchProfile.careNeeds.length === 0 || !matchProfile.location) && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                        Please select at least one care type and enter a location
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Perfect Match Results */}
            {aiRecommendationsMutation.data && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-6 h-6 text-red-500" />
                    Your Perfect Matches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {aiRecommendationsMutation.data.recommendations && aiRecommendationsMutation.data.recommendations.length > 0 ? (
                    <div className="space-y-4">
                      {aiRecommendationsMutation.data.recommendations.map((rec: any, index: number) => (
                        <div key={rec.community?.id || index} className="p-4 border rounded-lg hover:shadow-lg transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-lg">{rec.community?.name}</h4>
                              <p className="text-gray-600 dark:text-gray-400">
                                {rec.community?.city}, {rec.community?.state}
                              </p>
                              {rec.community?.phone && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  📞 {rec.community.phone}
                                </p>
                              )}
                            </div>
                            <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                              {rec.matchScore}% Match
                            </Badge>
                          </div>
                          
                          {rec.matchReasons && rec.matchReasons.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Why it's a great match:</p>
                              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                {rec.matchReasons.map((reason: string, idx: number) => (
                                  <li key={idx}>{reason}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Pricing Information */}
                          {rec.community?.displayPricing && (
                            <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded">
                              <p className="text-sm">
                                <span className="font-medium">Pricing:</span> {rec.community.displayPricing.displayPrice}
                              </p>
                            </div>
                          )}

                          {/* AI Insights or Additional Info */}
                          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                            <p className="text-sm">
                              <span className="font-medium">AI Insight:</span> {
                                rec.aiInsights || 
                                `This community offers ${rec.community?.amenities?.length || 0} amenities and is ${
                                  rec.community?.communitySubtype === 'mobile_home_park' ? 'a mobile home park' :
                                  rec.community?.communitySubtype === 'active_adult' ? 'an active adult community' :
                                  'a senior living community'
                                } with ${rec.community?.transparencyScore || 70}% transparency score.`
                              }
                            </p>
                          </div>

                          {/* View Details Button */}
                          <div className="mt-4">
                            <Link to={`/community/${rec.community?.id}`}>
                              <Button variant="outline" size="sm" className="w-full">
                                View Community Details →
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        No exact matches found for your criteria.
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        Try adjusting your location, budget, or care type preferences.
                      </p>
                      {aiRecommendationsMutation.data.insights && (
                        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded text-left">
                          <p className="text-sm">
                            <span className="font-medium">Search Tip:</span> {aiRecommendationsMutation.data.insights.locationInsights}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* AI Compare Tab */}
          <TabsContent value="compare" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                    AI-Powered Comparison
                  </span>
                  {selectedCommunities.length > 0 && (
                    <Badge>{selectedCommunities.length} Selected</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCommunities.length < 2 ? (
                  <div className="text-center py-12">
                    <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Select at least 2 communities to compare
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Use the search tab to find communities and click "Compare" on each one
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedCommunities.map((community) => (
                        <div key={community.id} className="p-4 border rounded-lg">
                          <h4 className="font-semibold">{community.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {community.city}, {community.state}
                          </p>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="mt-2"
                            onClick={() => setSelectedCommunities(
                              selectedCommunities.filter(c => c.id !== community.id)
                            )}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>

                    <Button 
                      onClick={handleCompareommunities}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Generate AI Comparison Report
                    </Button>
                  </div>
                )}

                {/* Comparison Results */}
                {aiComparisonMutation.data && showComparison && (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-semibold">AI Comparison Analysis</h3>
                    
                    {/* Comparison metrics, charts, and insights would go here */}
                    <div className="grid gap-4">
                      {aiComparisonMutation.data.comparison?.categories?.map((category: any) => (
                        <Card key={category.name}>
                          <CardHeader>
                            <CardTitle className="text-base">{category.name}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {category.comparisons?.map((comp: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center">
                                  <span className="text-sm">{comp.metric}</span>
                                  <div className="flex gap-2">
                                    {comp.values?.map((val: any, vidx: number) => (
                                      <Badge key={vidx} variant={val.best ? "default" : "outline"}>
                                        {val.value}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                      <CardContent className="pt-6">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Bot className="w-5 h-5" />
                          AI Recommendation
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300">
                          {aiComparisonMutation.data.aiRecommendation}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* AI Transparency Badge */}
        <div className="mt-8 text-center">
          <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2">
            <Shield className="w-4 h-4 mr-2" />
            Powered by Multi-AI Intelligence (Claude + Perplexity + ChatGPT-4o)
          </Badge>
        </div>
      </div>
      </div>
    </div>
  );
}