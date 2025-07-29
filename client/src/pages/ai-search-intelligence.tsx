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
                        communities={searchResults.data.communities}
                        center={mapCenter}
                        zoom={mapZoom}
                        onLocationAnalysis={(analysis) => {
                          console.log('AI Location Analysis:', analysis);
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

          {/* Perfect Match Tab */}
          <TabsContent value="match" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-6 h-6 text-green-600" />
                  Build Your Perfect Match Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {/* Care Needs */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Care Needs</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['Independent Living', 'Assisted Living', 'Memory Care', 'Skilled Nursing'].map((need) => (
                        <label key={need} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={matchProfile.careNeeds.includes(need)}
                            onChange={(e) => {
                              const newNeeds = e.target.checked
                                ? [...matchProfile.careNeeds, need]
                                : matchProfile.careNeeds.filter(n => n !== need);
                              setMatchProfile({ ...matchProfile, careNeeds: newNeeds });
                            }}
                            className="rounded text-green-600"
                          />
                          <span className="text-sm">{need}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Budget Range */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Monthly Budget</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500">Minimum</label>
                        <Input
                          type="number"
                          placeholder="$0"
                          value={matchProfile.budget.min}
                          onChange={(e) => setMatchProfile({
                            ...matchProfile,
                            budget: { ...matchProfile.budget, min: parseInt(e.target.value) || 0 }
                          })}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Maximum</label>
                        <Input
                          type="number"
                          placeholder="$10,000"
                          value={matchProfile.budget.max}
                          onChange={(e) => setMatchProfile({
                            ...matchProfile,
                            budget: { ...matchProfile.budget, max: parseInt(e.target.value) || 10000 }
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Preferred Location</label>
                    <Input
                      placeholder="City, State or ZIP code"
                      value={matchProfile.location}
                      onChange={(e) => setMatchProfile({ ...matchProfile, location: e.target.value })}
                    />
                  </div>

                  {/* Preferences */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Important Features</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        'Pet Friendly', 'Pool/Spa', 'Fitness Center', 
                        'Transportation', 'Religious Services', 'Gardens',
                        'Private Rooms', 'Couples Housing', 'Veterans Programs'
                      ].map((pref) => (
                        <label key={pref} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={matchProfile.preferences.includes(pref)}
                            onChange={(e) => {
                              const newPrefs = e.target.checked
                                ? [...matchProfile.preferences, pref]
                                : matchProfile.preferences.filter(p => p !== pref);
                              setMatchProfile({ ...matchProfile, preferences: newPrefs });
                            }}
                            className="rounded text-green-600"
                          />
                          <span className="text-sm">{pref}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Urgency */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Timeline</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'immediate', label: 'Need Now', icon: Zap },
                        { value: 'soon', label: 'Within 3 Months', icon: Activity },
                        { value: 'planning', label: 'Planning Ahead', icon: TrendingUp }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setMatchProfile({ ...matchProfile, urgency: option.value as any })}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            matchProfile.urgency === option.value
                              ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <option.icon className={`w-6 h-6 mx-auto mb-2 ${
                            matchProfile.urgency === option.value ? 'text-green-600' : 'text-gray-400'
                          }`} />
                          <p className="text-sm font-medium">{option.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={handlePerfectMatch}
                    disabled={isAnalyzing || !matchProfile.location}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Finding Your Perfect Matches...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Find My Perfect Match
                      </>
                    )}
                  </Button>
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