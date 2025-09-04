import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { TrendingUp, TrendingDown, Minus, MapPin, Building2, DollarSign, Search, Loader2, AlertCircle, BarChart3, Globe, Users, Brain, X, Clock, Lightbulb, Home, Building, CheckCircle, Star, FileText } from 'lucide-react';
import { Link } from 'wouter';
import { useSEO } from '@/hooks/useSEO';
import { CompetitiveAnalysisLoader } from '@/components/CompetitiveAnalysisLoader';
import { Header } from '@/components/header';
import heroThinkerImage from '@assets/generated_images/Thinker_leftmost_boundary_observing_7dcdb3aa.png';

interface MarketAnalysis {
  location: string;
  locationType: 'city' | 'state' | 'region' | 'country';
  
  // Executive Summary
  executiveSummary?: {
    marketPosition: string;
    totalCommunities: number;
    dataConfidence: 'High' | 'Medium' | 'Developing';
    aiIntelligence: string;
    recommendation: string;
  };
  
  // Pricing Intelligence
  pricingIntelligence?: {
    averageMonthlyRent: number;
    marketRange: {
      min: number;
      max: number;
      median: number;
    };
    nationalComparison: {
      percentage: number;
      interpretation: string;
    };
    trend: string;
    priceDrivers: string[];
  };
  
  // Strategic Insights
  strategicInsights?: Array<{
    type: string;
    insight: string;
    confidence: string;
  }>;
  
  // Market Intelligence
  marketIntelligence?: {
    summary: string;
    keyFindings: string[];
    marketOpportunities: string[];
  };
  
  // Top Communities
  topCommunities?: Array<{
    name: string;
    location: string;
    price: string;
    verified: boolean;
  }>;
  
  // Data Attribution
  dataAttribution?: {
    lastUpdated: string;
    sources: string[];
    verifiedCommunities: number;
    aiDiscoveredCommunities: number;
    dataQuality: string;
  };
  
  // Legacy fields for backward compatibility
  averageMonthlyRent: number;
  priceRange: {
    min: number;
    max: number;
  };
  comparedToNational: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  insights: string[];
  detailedSummary?: string;
  communityMentions?: string[];
  matchedCommunities?: Array<{
    id: string;
    name: string;
    city: string;
    state_province: string;
    type: string;
  }>;
  lastUpdated: string;
  sources: string[];
}

export default function CompetitiveAnalysis() {
  useSEO({
    title: 'Senior Living Market Analysis - Compare Pricing Across Regions',
    description: 'Real-time competitive analysis of senior living costs across cities, states, and countries. Compare pricing trends and make informed decisions.',
    keywords: 'senior living pricing, market analysis, cost comparison, assisted living prices, memory care costs'
  });

  const [searchLocation, setSearchLocation] = useState('');
  const [locationType, setLocationType] = useState<'city' | 'state' | 'region' | 'country'>('city');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  
  // Popular locations for quick access
  const popularLocations = {
    city: ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ', 'Toronto, ON', 'Vancouver, BC', 'Mexico City'],
    state: ['California', 'Texas', 'Florida', 'New York', 'Pennsylvania', 'Ontario', 'Quebec', 'British Columbia'],
    region: ['Northeast US', 'Southeast US', 'Midwest US', 'Southwest US', 'Pacific Northwest', 'Eastern Canada', 'Western Canada', 'Central Mexico'],
    country: ['United States', 'Canada', 'Mexico']
  };

  // Fetch market analysis
  const analysisMutation = useMutation<MarketAnalysis, Error, { location: string; type: string }>({
    mutationFn: async (params: { location: string; type: string }) => {
      console.log('Sending analysis request:', params);
      try {
        const response = await apiRequest('POST', '/api/competitive-analysis', params);
        console.log('Response received:', response);
        return response as MarketAnalysis;
      } catch (error) {
        console.error('API request failed:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Analysis successful:', data.location);
      setSelectedLocation(data.location);
      queryClient.invalidateQueries({ queryKey: ['/api/competitive-analysis'] });
    },
    onError: (error) => {
      console.error('Analysis mutation error:', error);
      alert(`Failed to fetch market analysis: ${error.message || 'Please try again'}`);
    }
  });

  // Fetch recent analyses
  const { data: recentAnalyses } = useQuery({
    queryKey: ['/api/competitive-analysis/recent'],
    enabled: false // Only fetch when user requests it
  });

  const handleAnalysis = () => {
    if (searchLocation) {
      analysisMutation.mutate({ location: searchLocation, type: locationType });
    }
  };

  const handleQuickSelect = (location: string) => {
    console.log('Quick select clicked:', location, 'Type:', locationType);
    setSearchLocation(location);
    analysisMutation.mutate({ location, type: locationType });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-emerald-50/20 dark:from-gray-900 dark:via-blue-900/30 dark:to-emerald-900/20">
      <Header />
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Header with enhanced styling and Thinker image */}
      <div className="relative h-96 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white overflow-hidden">
        {/* Thinker Background Image with better visibility and proper z-index */}
        <img 
          src={heroThinkerImage}
          alt="The Thinker contemplating market analysis"
          className="absolute inset-0 w-full h-full object-cover opacity-40 dark:opacity-50 z-0"
        />
        {/* Enhanced gradient overlay with reduced opacity for better image visibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/60 via-teal-600/60 to-cyan-600/60 dark:from-emerald-600/50 dark:via-teal-600/50 dark:to-cyan-600/50 z-10" />
        
        <div className="relative py-20 z-20">
          <div className="max-w-7xl mx-auto px-4">
            <Link href="/">
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/20 mb-6 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
              >
                ← Back to Home
              </Button>
            </Link>
            
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold flex items-center gap-4 animate-fadeIn">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <TrendingUp className="w-10 h-10 md:w-12 md:h-12" />
                </div>
                <span className="bg-gradient-to-r from-white to-white/90 bg-clip-text">
                  Competitive Market Analysis
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/95 max-w-3xl leading-relaxed animate-fadeIn animation-delay-200">
                Real-time pricing analysis powered by AI. Compare senior living costs across cities, states, regions, and countries to understand market dynamics and find the best value.
              </p>
              
              <div className="flex flex-wrap gap-3 animate-fadeIn animation-delay-300">
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2 text-sm hover:bg-white/30 transition-all duration-300 hover:scale-105">
                  <Brain className="w-4 h-4 mr-2" />
                  Perplexity AI Powered
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2 text-sm hover:bg-white/30 transition-all duration-300 hover:scale-105">
                  <Globe className="w-4 h-4 mr-2" />
                  Live Web Search
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2 text-sm hover:bg-white/30 transition-all duration-300 hover:scale-105">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Real-Time Data
                </Badge>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave decoration at bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12" viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 48h1440V0c-120 28-240 48-360 48S840 28 720 28 480 48 360 48 120 28 0 28v20z" 
                  fill="currentColor" className="text-gray-50 dark:text-gray-900" />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Search Section with enhanced styling */}
        <Card className="mb-10 shadow-xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm animate-fadeInUp">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-800/50 rounded-lg">
                <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              Select Location for Analysis
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Choose a city, state, region, or country to analyze senior living pricing with real-time AI data
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="space-y-6">
              {/* Location Type Selector with improved styling */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={locationType} onValueChange={(value: any) => setLocationType(value)}>
                  <SelectTrigger className="w-full sm:w-48 h-12 border-2 hover:border-emerald-400 transition-colors duration-300">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="city" className="py-3">
                      <span className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        City
                      </span>
                    </SelectItem>
                    <SelectItem value="state" className="py-3">
                      <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        State/Province
                      </span>
                    </SelectItem>
                    <SelectItem value="region" className="py-3">
                      <span className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Region
                      </span>
                    </SelectItem>
                    <SelectItem value="country" className="py-3">
                      <span className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Country
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex-1 flex gap-3">
                  <Input
                    placeholder={`Enter ${locationType} name...`}
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAnalysis()}
                    className="h-12 border-2 hover:border-emerald-400 focus:border-emerald-500 transition-colors duration-300 text-lg"
                  />
                  <Button 
                    onClick={handleAnalysis}
                    disabled={!searchLocation || analysisMutation.isPending}
                    className="h-12 px-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    {analysisMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Search className="w-5 h-5" />
                    )}
                    <span className="ml-2 font-semibold">Analyze</span>
                  </Button>
                </div>
              </div>

              {/* Popular Locations with enhanced styling */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400">★</span>
                  Popular {locationType === 'state' ? 'states/provinces' : locationType === 'city' ? 'cities' : locationType === 'region' ? 'regions' : 'countries'}:
                </p>
                <div className="flex flex-wrap gap-2">
                  {popularLocations[locationType].map((location) => (
                    <Button
                      key={location}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickSelect(location)}
                      className="hover:bg-emerald-100 hover:border-emerald-400 dark:hover:bg-emerald-900/30 dark:hover:border-emerald-600 transition-all duration-300 hover:scale-105 hover:shadow-md"
                    >
                      <MapPin className="w-3 h-3 mr-1.5" />
                      {location}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading state with engaging Valet Gentleman */}
        {analysisMutation.isPending && (
          <Card className="mb-10 shadow-xl border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 animate-fadeInUp">
            <CardContent className="p-0">
              <CompetitiveAnalysisLoader location={searchLocation || 'the market'} />
            </CardContent>
          </Card>
        )}

        {/* Error state */}
        {analysisMutation.isError && (
          <Card className="mb-10 shadow-xl border-2 border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 animate-fadeInUp">
            <CardContent className="py-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                  <X className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    Analysis Failed
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400 max-w-md mx-auto">
                    {analysisMutation.error?.message || 'Unable to fetch market data. Please try again.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Prompt to search if no data */}
        {!analysisMutation.data && !analysisMutation.isPending && !analysisMutation.isError && (
          <Card className="mb-10 shadow-xl border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 animate-fadeInUp">
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    Start Your Market Analysis
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Enter a location above or select from popular cities to get real-time senior living pricing data
                  </p>
                </div>
                <div className="pt-4">
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Try searching for "Phoenix, AZ" or click a popular location button above
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Results with enhanced styling */}
        {analysisMutation.isSuccess && analysisMutation.data && (
          <Card className="mb-10 shadow-2xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm animate-fadeInUp animation-delay-200 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-6">
              <CardTitle className="flex items-center justify-between text-xl">
                <span className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <MapPin className="w-6 h-6" />
                  </div>
                  {analysisMutation.data.location}
                </span>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  Updated: {analysisMutation.data.lastUpdated ? new Date(analysisMutation.data.lastUpdated).toLocaleDateString() : 'Today'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Average Pricing with enhanced styling */}
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Average Monthly Cost</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      ${analysisMutation.data.averageMonthlyRent ? analysisMutation.data.averageMonthlyRent.toLocaleString() : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                      Range: ${analysisMutation.data.priceRange?.min ? analysisMutation.data.priceRange.min.toLocaleString() : 'N/A'} - 
                      ${analysisMutation.data.priceRange?.max ? analysisMutation.data.priceRange.max.toLocaleString() : 'N/A'}
                    </p>
                  </div>

                  {/* Comparison to National Average with enhanced styling */}
                  <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-inner">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                      Compared to National Average
                    </p>
                    <div className="flex items-center gap-3">
                      {analysisMutation.data.comparedToNational && analysisMutation.data.comparedToNational > 0 ? (
                        <>
                          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-red-600 dark:text-red-400" />
                          </div>
                          <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {analysisMutation.data.comparedToNational}% Higher
                          </span>
                        </>
                      ) : analysisMutation.data.comparedToNational && analysisMutation.data.comparedToNational < 0 ? (
                        <>
                          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <TrendingDown className="w-6 h-6 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {Math.abs(analysisMutation.data.comparedToNational)}% Lower
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <Minus className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                          </div>
                          <span className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                            At National Average
                          </span>
                        </>
                      )}
                    </div>
                    
                    {/* Trend Indicator with enhanced styling */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Badge 
                        variant="outline"
                        className={`px-4 py-2 text-sm font-medium ${
                          analysisMutation.data.trend === 'increasing' 
                            ? 'border-orange-400 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                            : analysisMutation.data.trend === 'decreasing'
                            ? 'border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'border-gray-400 bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {analysisMutation.data.trend === 'increasing' && (
                          <span className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Prices Trending Up
                          </span>
                        )}
                        {analysisMutation.data.trend === 'decreasing' && (
                          <span className="flex items-center gap-2">
                            <TrendingDown className="w-4 h-4" />
                            Prices Trending Down
                          </span>
                        )}
                        {analysisMutation.data.trend === 'stable' && (
                          <span className="flex items-center gap-2">
                            <Minus className="w-4 h-4" />
                            Prices Stable
                          </span>
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Quick Facts Placeholder */}
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        <Lightbulb className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      Quick Facts
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Analysis powered by real-time web data
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {analysisMutation.data.insights && analysisMutation.data.insights[0] ? 
                            analysisMutation.data.insights[0] : 
                            'Comprehensive market data available'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Communities in Our Database - SHOWN FIRST */}
        {analysisMutation.isSuccess && analysisMutation.data && analysisMutation.data.matchedCommunities && analysisMutation.data.matchedCommunities.length > 0 && (
          <Card className="mt-6 shadow-xl border-0 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 animate-fadeInUp animation-delay-50">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-800/50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                Available Communities in Our Database
                <Badge className="ml-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                  {analysisMutation.data.matchedCommunities.length} Found
                </Badge>
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                These mentioned communities have detailed pages you can explore
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysisMutation.data.matchedCommunities.map((community, index) => (
                  <Link key={index} href={`/community/${community.id}`}>
                    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-emerald-200 dark:border-emerald-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-lg transition-all cursor-pointer transform hover:scale-[1.02]">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                          <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{community.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {community.city}, {community.state_province}
                          </p>
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {community.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Communities Mentioned */}
        {analysisMutation.isSuccess && analysisMutation.data && analysisMutation.data.communityMentions && analysisMutation.data.communityMentions.length > 0 && (
          <Card className="mt-8 shadow-xl border-0 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 animate-fadeInUp animation-delay-100">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
                  <Building className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                All Communities Mentioned
                <Badge className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                  {analysisMutation.data.communityMentions.length} Total
                </Badge>
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Complete list of senior living communities referenced in the market research
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {analysisMutation.data.communityMentions.map((communityName: string, index: number) => {
                  const isMatched = analysisMutation.data.matchedCommunities?.some(
                    mc => mc.name.toLowerCase() === communityName.toLowerCase()
                  );
                  return (
                    <div key={index} className="flex items-center gap-3 p-4 bg-white/70 dark:bg-gray-900/50 rounded-lg border border-blue-200/50 dark:border-blue-700/50 hover:bg-white dark:hover:bg-gray-900/70 transition-colors">
                      <Home className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{communityName}</span>
                      {isMatched && (
                        <span className="ml-auto" title="Available in our database">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed Market Summary */}
        {analysisMutation.isSuccess && analysisMutation.data && analysisMutation.data.detailedSummary && (
            <Card className="mt-8 shadow-xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm animate-fadeInUp animation-delay-200">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-t-lg">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-800/50 rounded-lg">
                    <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  Complete Market Analysis (Unfiltered)
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Comprehensive AI-powered market research from real-time web data
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {analysisMutation.data.detailedSummary.split('\n').map((paragraph, index) => {
                        // Highlight community names
                        const highlightedParagraph = paragraph.replace(
                          /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Living|Care|Community|Manor|Village|Residence|Center|Home|Place|House|Terrace|Gardens?|Lodge|Park|Estates?|Court|Heights|Oaks|Pines|Springs|Hills|Valley|Creek|Ridge|Point|Plaza|Square|Tower|Arms|Haven|Crossing|Landing|Station|Walk|Way|Trail|Grove|Meadows?|Fields?|Woods?|Forest|Lake|River|Bay|Beach|Shore|Coast|Harbor|Port|Vista|View|Pointe))\b/g,
                          '<span class="bg-yellow-200 dark:bg-yellow-900/50 px-1 rounded font-semibold">$1</span>'
                        );
                        
                        // Format bullet points
                        if (paragraph.trim().startsWith('-') || paragraph.trim().startsWith('•')) {
                          return (
                            <div key={index} className="flex items-start gap-3 mb-3">
                              <span className="text-purple-500 mt-1">▸</span>
                              <span dangerouslySetInnerHTML={{ __html: highlightedParagraph.replace(/^[-•]\s*/, '') }} />
                            </div>
                          );
                        }
                        // Format headers (lines ending with colon)
                        if (paragraph.trim().endsWith(':') && paragraph.trim().length < 50) {
                          return (
                            <h4 key={index} className="font-semibold text-purple-700 dark:text-purple-400 mt-4 mb-2" dangerouslySetInnerHTML={{ __html: highlightedParagraph }} />
                          );
                        }
                        // Regular paragraphs
                        if (paragraph.trim()) {
                          return (
                            <p key={index} className="mb-3" dangerouslySetInnerHTML={{ __html: highlightedParagraph }} />
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                  
                  {/* AI Market Insights Section */}
                  {analysisMutation.data.insights && analysisMutation.data.insights.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        Key Market Insights
                      </h3>
                      <ul className="space-y-3">
                        {analysisMutation.data.insights.map((insight, index) => (
                          <li key={index} className="flex items-start gap-3 p-3 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                            <span className="text-purple-500 mt-1 text-xl">✓</span>
                            <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Data Sources Section */}
                  {analysisMutation.data.sources && analysisMutation.data.sources.length > 0 && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        Verified Data Sources:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {analysisMutation.data.sources.map((source, index) => (
                          <Badge key={index} variant="secondary" className="text-xs px-3 py-1 bg-white/80 dark:bg-gray-800/80 shadow-sm border border-blue-200 dark:border-blue-800">
                            {source}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <p className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>
                        This analysis is based on current web data and may vary from actual costs. 
                        Always verify pricing directly with communities for the most accurate information.
                      </span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
        )}

        {/* Loading State with enhanced styling */}
        {analysisMutation.isPending && (
          <Card className="mb-10 shadow-xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm animate-fadeInUp">
            <CardContent className="py-16">
              <div className="text-center space-y-6">
                <div className="relative inline-flex">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="absolute inset-0 w-20 h-20 bg-emerald-200 dark:bg-emerald-800/30 rounded-full animate-ping opacity-30" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Analyzing Market Data...
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                    Our AI is searching live web data to provide you with the most current pricing information and market insights.
                  </p>
                </div>
                <div className="flex justify-center gap-2">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-cyan-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State with enhanced styling */}
        {analysisMutation.isError && (
          <Card className="mb-10 shadow-xl border-2 border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10 animate-fadeInUp">
            <CardContent className="py-12">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-semibold text-red-600 dark:text-red-400">
                    Analysis Error
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Unable to fetch market data. Please try again or select a different location.
                  </p>
                </div>
                <Button 
                  onClick={() => analysisMutation.reset()}
                  variant="outline"
                  className="border-red-300 hover:bg-red-100 dark:hover:bg-red-900/20"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* How It Works with enhanced styling */}
        <Card className="shadow-xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm animate-fadeInUp animation-delay-400">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-800/50 rounded-lg">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              How Market Analysis Works
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="group text-center hover:scale-105 transition-transform duration-300">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-shadow duration-300">
                    <Brain className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    1
                  </div>
                </div>
                <h3 className="font-semibold mb-2 text-lg">AI-Powered Search</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Perplexity AI searches live web data for current pricing information
                </p>
              </div>
              
              <div className="group text-center hover:scale-105 transition-transform duration-300">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900/30 dark:to-teal-800/30 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-shadow duration-300">
                    <BarChart3 className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-teal-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    2
                  </div>
                </div>
                <h3 className="font-semibold mb-2 text-lg">Data Analysis</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Compares pricing across multiple sources and calculates averages
                </p>
              </div>
              
              <div className="group text-center hover:scale-105 transition-transform duration-300">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-shadow duration-300">
                    <TrendingUp className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    3
                  </div>
                </div>
                <h3 className="font-semibold mb-2 text-lg">Market Insights</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Provides trends and comparisons to help you make informed decisions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}