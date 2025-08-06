import React, { useState, useCallback, useEffect } from 'react';
import { NavigationHeader } from '@/components/NavigationHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import Map from '@/components/Map';
import { EnhancedCommunityCard } from '@/components/EnhancedCommunityCard';
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
  Target
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

  // Check URL parameters to auto-switch to perfect match tab
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    if (mode === 'perfect-match') {
      setActiveTab('match');
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

  // Handle AI-powered search
  const handleAISearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    
    setIsAnalyzing(true);
    try {
      await aiSearchMutation.mutateAsync({ query: searchQuery, type: searchType });
    } finally {
      setIsAnalyzing(false);
    }
  }, [searchQuery, searchType]);

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

  const searchResults = useQuery<{
    communities?: any[];
    services?: any[];
    vendors?: any[];
    resources?: any[];
    searchInterpretation?: string;
    appliedFilters?: any;
    aiInsights?: any;
  }>({
    queryKey: ['ai-search-results'],
    enabled: false
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white text-sm font-semibold mb-4">
            <Brain className="w-4 h-4 mr-2" />
            AI-Powered Intelligence
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Find Your Perfect Senior Living Match
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Our multi-AI system analyzes thousands of communities to find your perfect match,
            providing transparent insights and personalized recommendations
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Smart Search
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

          {/* Smart Search Tab */}
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
                VA Resources
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-6 h-6 text-purple-600" />
                  {searchType === 'housing' && 'AI-Powered Housing Search'}
                  {searchType === 'services' && 'Find Care Services Near You'}
                  {searchType === 'marketplace' && 'Discover Marketplace Solutions'}
                  {searchType === 'resources' && 'Explore VA Resources'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      placeholder={
                        searchType === 'housing' ? "Ask me anything: 'Memory care near Sacramento under $4000 with good reviews'" :
                        searchType === 'services' ? "Search for: 'Home care agencies in San Francisco'" :
                        searchType === 'marketplace' ? "Find: 'Medical equipment rental near me'" :
                        "Explore: 'VA medical centers in California'"
                      }
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAISearch()}
                      className="pl-12 pr-32 py-6 text-lg"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Button 
                      onClick={handleAISearch}
                      disabled={isAnalyzing || !searchQuery.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          AI Search
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Search Examples */}
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Try:</span>
                    {[
                      "Pet-friendly assisted living with pool",
                      "Memory care near me under $5000",
                      "5-star communities with available rooms",
                      "Veterans discount senior living"
                    ].map((example) => (
                      <Badge
                        key={example}
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setSearchQuery(example)}
                      >
                        {example}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* AI Search Interpretation */}
                {searchResults.data?.searchInterpretation && (
                  <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Bot className="w-5 h-5 text-purple-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-purple-900 dark:text-purple-100">
                          AI Understanding:
                        </p>
                        <p className="text-purple-700 dark:text-purple-300 mt-1">
                          {searchResults.data.searchInterpretation}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dynamic Results Display */}
            {(searchResults.data?.communities || searchResults.data?.services || searchResults.data?.vendors || searchResults.data?.resources) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Interactive Map - Only show for housing */}
                {searchType === 'housing' && searchResults.data?.communities && (
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
                      {searchType === 'housing' && `${searchResults.data.communities?.length || 0} AI-Verified Communities`}
                      {searchType === 'services' && `${searchResults.data.services?.length || 0} Care Services Found`}
                      {searchType === 'marketplace' && `${searchResults.data.vendors?.length || 0} Marketplace Vendors`}
                      {searchType === 'resources' && `VA Resources Available`}
                    </h3>
                  </div>
                  
                  {/* Housing Results */}
                  {searchType === 'housing' && searchResults.data.communities?.map((community: any) => (
                    <div key={community.id} className="relative">
                      <EnhancedCommunityCard
                        community={community}
                        variant="standard"
                        index={0}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute top-4 right-4"
                        onClick={() => {
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
                    <Card key={vendor.id} className="p-4">
                      <h4 className="font-semibold text-lg">{vendor.name}</h4>
                      <p className="text-gray-600 dark:text-gray-400">{vendor.category}</p>
                      <p className="text-sm mt-2">{vendor.description}</p>
                      {vendor.price && <p className="font-semibold mt-2">${vendor.price}</p>}
                    </Card>
                  ))}

                  {/* VA Resources Results */}
                  {searchType === 'resources' && searchResults.data.resources?.map((resource: any, idx: number) => (
                    <Card key={idx} className="p-4">
                      <h4 className="font-semibold text-lg">{resource.name}</h4>
                      <p className="text-gray-600 dark:text-gray-400">Type: {resource.type}</p>
                      <p className="text-sm mt-2">{resource.count} locations available</p>
                    </Card>
                  ))}
                </div>
              </div>
            )}
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
                          className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
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
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={matchProfile.careNeeds.includes(need.name)}
                              onChange={() => {}}
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

                  {/* Budget Range - Enhanced with care level indicators */}
                  <div>
                    <label className="text-sm font-medium mb-3 block flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      Monthly Budget Range
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
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

                  {/* Location - Enhanced */}
                  <div>
                    <label className="text-sm font-medium mb-3 block flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      Preferred Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Enter city, state or ZIP code (e.g., Sacramento, CA or 95814)"
                        value={matchProfile.location}
                        onChange={(e) => setMatchProfile({ ...matchProfile, location: e.target.value })}
                        className="pl-10"
                      />
                    </div>
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
                  <div className="space-y-4">
                    {aiRecommendationsMutation.data.recommendations?.map((rec: any, index: number) => (
                      <div key={rec.community.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-lg">{rec.community.name}</h4>
                            <p className="text-gray-600 dark:text-gray-400">
                              {rec.community.city}, {rec.community.state}
                            </p>
                          </div>
                          <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                            {rec.matchScore}% Match
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Why it's a great match:</p>
                          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            {rec.matchReasons?.map((reason: string, idx: number) => (
                              <li key={idx}>{reason}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                          <p className="text-sm">
                            <span className="font-medium">AI Insight:</span> {rec.aiInsights}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
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
            Powered by Multi-AI Transparency System (Claude + Gemini + ChatGPT)
          </Badge>
        </div>
      </div>
    </div>
  );
}