import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { TrendingUp, TrendingDown, Minus, MapPin, Building2, DollarSign, Search, Loader2, AlertCircle, BarChart3, Globe, Users, Brain } from 'lucide-react';
import { Link } from 'wouter';
import { useSEO } from '@/hooks/useSEO';

interface MarketAnalysis {
  location: string;
  locationType: 'city' | 'state' | 'region' | 'country';
  averageMonthlyRent: number;
  priceRange: {
    min: number;
    max: number;
  };
  comparedToNational: number; // percentage difference
  trend: 'increasing' | 'decreasing' | 'stable';
  insights: string[];
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
  const analysisMutation = useMutation({
    mutationFn: async (params: { location: string; type: string }) => {
      const response = await apiRequest('POST', '/api/competitive-analysis', params);
      return response;
    },
    onSuccess: (data) => {
      setSelectedLocation(data.location);
      queryClient.invalidateQueries({ queryKey: ['/api/competitive-analysis'] });
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
    setSearchLocation(location);
    analysisMutation.mutate({ location, type: locationType });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-white/20 mb-4">
              ← Back to Home
            </Button>
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center gap-3">
            <TrendingUp className="w-10 h-10" />
            Competitive Market Analysis
          </h1>
          <p className="text-xl text-white/90 max-w-3xl">
            Real-time pricing analysis powered by AI. Compare senior living costs across cities, states, regions, and countries to understand market dynamics and find the best value.
          </p>
          
          <div className="flex flex-wrap gap-2 mt-6">
            <Badge className="bg-white/20 text-white border-white/30">
              <Brain className="w-3 h-3 mr-1" />
              Perplexity AI Powered
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30">
              <Globe className="w-3 h-3 mr-1" />
              Live Web Search
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30">
              <BarChart3 className="w-3 h-3 mr-1" />
              Real-Time Data
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Location for Analysis</CardTitle>
            <CardDescription>
              Choose a city, state, region, or country to analyze senior living pricing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Location Type Selector */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={locationType} onValueChange={(value: any) => setLocationType(value)}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="city">City</SelectItem>
                    <SelectItem value="state">State/Province</SelectItem>
                    <SelectItem value="region">Region</SelectItem>
                    <SelectItem value="country">Country</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder={`Enter ${locationType} name...`}
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAnalysis()}
                  />
                  <Button 
                    onClick={handleAnalysis}
                    disabled={!searchLocation || analysisMutation.isPending}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  >
                    {analysisMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    <span className="ml-2">Analyze</span>
                  </Button>
                </div>
              </div>

              {/* Popular Locations */}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Popular {locationType === 'state' ? 'states/provinces' : locationType}:
                </p>
                <div className="flex flex-wrap gap-2">
                  {popularLocations[locationType].map((location) => (
                    <Button
                      key={location}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickSelect(location)}
                      className="hover:bg-emerald-50 hover:border-emerald-300 dark:hover:bg-emerald-900/20"
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      {location}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysisMutation.isSuccess && analysisMutation.data && (
          <Card className="mb-8 border-2 border-emerald-200 dark:border-emerald-800">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {analysisMutation.data.location}
                </span>
                <Badge variant="outline" className="text-xs">
                  Updated: {new Date(analysisMutation.data.lastUpdated).toLocaleDateString()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Average Pricing */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Average Monthly Cost</p>
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      ${analysisMutation.data.averageMonthlyRent.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Range: ${analysisMutation.data.priceRange.min.toLocaleString()} - ${analysisMutation.data.priceRange.max.toLocaleString()}
                    </p>
                  </div>

                  {/* Comparison to National Average */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Compared to National Average
                    </p>
                    <div className="flex items-center gap-2">
                      {analysisMutation.data.comparedToNational > 0 ? (
                        <>
                          <TrendingUp className="w-5 h-5 text-red-500" />
                          <span className="text-xl font-bold text-red-600 dark:text-red-400">
                            {analysisMutation.data.comparedToNational}% Higher
                          </span>
                        </>
                      ) : analysisMutation.data.comparedToNational < 0 ? (
                        <>
                          <TrendingDown className="w-5 h-5 text-green-500" />
                          <span className="text-xl font-bold text-green-600 dark:text-green-400">
                            {Math.abs(analysisMutation.data.comparedToNational)}% Lower
                          </span>
                        </>
                      ) : (
                        <>
                          <Minus className="w-5 h-5 text-gray-500" />
                          <span className="text-xl font-bold text-gray-600 dark:text-gray-400">
                            At National Average
                          </span>
                        </>
                      )}
                    </div>
                    
                    {/* Trend Indicator */}
                    <div className="mt-3 pt-3 border-t">
                      <Badge 
                        variant="outline"
                        className={
                          analysisMutation.data.trend === 'increasing' 
                            ? 'border-orange-300 text-orange-700 dark:text-orange-400'
                            : analysisMutation.data.trend === 'decreasing'
                            ? 'border-blue-300 text-blue-700 dark:text-blue-400'
                            : 'border-gray-300 text-gray-700 dark:text-gray-400'
                        }
                      >
                        {analysisMutation.data.trend === 'increasing' && '📈 Prices Trending Up'}
                        {analysisMutation.data.trend === 'decreasing' && '📉 Prices Trending Down'}
                        {analysisMutation.data.trend === 'stable' && '➡️ Prices Stable'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Market Insights */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    AI Market Insights
                  </h3>
                  <ul className="space-y-2">
                    {analysisMutation.data.insights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-emerald-500 mt-1">•</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{insight}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Data Sources */}
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Data Sources:</p>
                    <div className="flex flex-wrap gap-1">
                      {analysisMutation.data.sources.map((source, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {analysisMutation.isPending && (
          <Card className="mb-8">
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin mx-auto text-emerald-600" />
                <p className="text-lg font-medium">Analyzing Market Data...</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  Our AI is searching live web data to provide you with the most current pricing information and market insights.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {analysisMutation.isError && (
          <Card className="mb-8 border-red-200 dark:border-red-800">
            <CardContent className="py-8">
              <div className="text-center space-y-4">
                <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
                <p className="text-lg font-medium">Analysis Error</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Unable to fetch market data. Please try again or select a different location.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle>How Market Analysis Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Brain className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-semibold mb-2">AI-Powered Search</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Perplexity AI searches live web data for current pricing information
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="font-semibold mb-2">Data Analysis</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Compares pricing across multiple sources and calculates averages
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <h3 className="font-semibold mb-2">Market Insights</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
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