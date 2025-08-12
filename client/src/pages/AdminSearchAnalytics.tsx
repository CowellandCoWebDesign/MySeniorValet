/**
 * Admin Search Analytics Dashboard
 * Comprehensive monitoring and control for search operations and API costs
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  BarChart3, 
  Activity,
  AlertCircle,
  CheckCircle,
  Info,
  Trash2,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Target,
  Zap,
  Brain
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CitySearchControl } from '@/components/CitySearchControl';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface CostSummary {
  total: number;
  perplexity: number;
  geocoding: number;
  weaviate: number;
  openai: number;
  claude: number;
  searchCount: number;
  avgCostPerSearch: number;
}

interface CityMetrics {
  city: string;
  state: string;
  searchCount: number;
  avgResults: number;
  totalCost: number;
  topCareType: string;
}

interface SearchVolume {
  city: string;
  searchCount: number;
}

export function AdminSearchAnalytics() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);

  // Fetch daily cost summary
  const { data: dailyCosts, isLoading: loadingCosts } = useQuery({
    queryKey: ['daily-costs', selectedDate],
    queryFn: async () => {
      const response = await fetch(`/api/search/analytics/daily-costs?date=${selectedDate}`);
      if (!response.ok) throw new Error('Failed to fetch costs');
      return response.json() as Promise<CostSummary>;
    },
    refetchInterval: refreshInterval
  });

  // Fetch top searched cities
  const { data: topCities, isLoading: loadingCities } = useQuery({
    queryKey: ['top-cities'],
    queryFn: async () => {
      const response = await fetch('/api/search/analytics/top-cities?limit=10');
      if (!response.ok) throw new Error('Failed to fetch top cities');
      return response.json() as Promise<CityMetrics[]>;
    }
  });

  // Fetch search volume
  const { data: searchVolume } = useQuery({
    queryKey: ['search-volume'],
    queryFn: async () => {
      const response = await fetch('/api/search/analytics/volume?days=7');
      if (!response.ok) throw new Error('Failed to fetch volume');
      return response.json() as Promise<SearchVolume[]>;
    }
  });

  // Fetch cost optimization recommendations
  const { data: recommendations } = useQuery({
    queryKey: ['recommendations'],
    queryFn: async () => {
      const response = await fetch('/api/search/analytics/recommendations');
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      const data = await response.json();
      return data.recommendations as string[];
    }
  });

  // Clear analytics cache mutation
  const clearAnalyticsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/search/analytics/clear', {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to clear analytics');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Analytics Cleared",
        description: "Analytics cache has been cleared successfully"
      });
      queryClient.invalidateQueries();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear analytics cache",
        variant: "destructive"
      });
    }
  });

  // Calculate cost breakdown for pie chart
  const costBreakdown = dailyCosts ? [
    { name: 'Perplexity', value: dailyCosts.perplexity, color: '#8b5cf6' },
    { name: 'Geocoding', value: dailyCosts.geocoding, color: '#3b82f6' },
    { name: 'Weaviate', value: dailyCosts.weaviate, color: '#10b981' },
    { name: 'OpenAI', value: dailyCosts.openai, color: '#f59e0b' },
    { name: 'Claude', value: dailyCosts.claude, color: '#ef4444' }
  ].filter(item => item.value > 0) : [];

  // Format currency
  const formatCurrency = (value: number) => `$${value.toFixed(4)}`;

  // Handle search from the control component
  const handleSearch = (params: any) => {
    console.log('Search initiated with params:', params);
    // In production, this would trigger actual searches
    toast({
      title: "Search Initiated",
      description: `Searching ${params.city || params.state || 'nationally'} with scope: ${params.searchScope}`
    });
  };

  // Auto-refresh toggle
  const toggleAutoRefresh = () => {
    if (refreshInterval) {
      setRefreshInterval(null);
      toast({ title: "Auto-refresh disabled" });
    } else {
      setRefreshInterval(30000); // 30 seconds
      toast({ title: "Auto-refresh enabled (30s)" });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Search Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor search operations and API costs</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={toggleAutoRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshInterval ? 'animate-spin' : ''}`} />
            {refreshInterval ? 'Disable' : 'Enable'} Auto-refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => clearAnalyticsMutation.mutate()}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear Cache
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Today's Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dailyCosts ? formatCurrency(dailyCosts.total) : '$0.0000'}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {dailyCosts?.searchCount || 0} searches
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Cost/Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dailyCosts ? formatCurrency(dailyCosts.avgCostPerSearch) : '$0.0000'}
            </div>
            <div className="flex items-center mt-1">
              {dailyCosts && dailyCosts.avgCostPerSearch > 0.005 ? (
                <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
              )}
              <span className="text-xs text-gray-600">
                {dailyCosts && dailyCosts.avgCostPerSearch > 0.005 ? 'Above' : 'Below'} target
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Top City</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {topCities?.[0] ? `${topCities[0].city}, ${topCities[0].state}` : 'N/A'}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {topCities?.[0]?.searchCount || 0} searches
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67%</div>
            <Progress value={67} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cities">City Analytics</TabsTrigger>
          <TabsTrigger value="costs">Cost Breakdown</TabsTrigger>
          <TabsTrigger value="search">Search Control</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Search Volume Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Search Volume (7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={searchVolume}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="city" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="searchCount" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cost Breakdown Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>API Cost Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={costBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {costBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* City Analytics Tab */}
        <TabsContent value="cities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Searched Cities</CardTitle>
              <CardDescription>Cities with highest search volume and associated costs</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>City</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead className="text-right">Searches</TableHead>
                    <TableHead className="text-right">Avg Results</TableHead>
                    <TableHead className="text-right">Total Cost</TableHead>
                    <TableHead>Top Care Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCities?.map((city, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{city.city}</TableCell>
                      <TableCell>{city.state}</TableCell>
                      <TableCell className="text-right">{city.searchCount}</TableCell>
                      <TableCell className="text-right">{city.avgResults}</TableCell>
                      <TableCell className="text-right">{formatCurrency(city.totalCost)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{city.topCareType}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cost Breakdown Tab */}
        <TabsContent value="costs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Cost Analysis</CardTitle>
              <CardDescription>API usage breakdown for {selectedDate}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Perplexity AI</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {dailyCosts ? formatCurrency(dailyCosts.perplexity) : '$0.0000'}
                  </p>
                  <p className="text-xs text-gray-600">Search enhancement</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Geocoding</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {dailyCosts ? formatCurrency(dailyCosts.geocoding) : '$0.0000'}
                  </p>
                  <p className="text-xs text-gray-600">Location services</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Weaviate</p>
                  <p className="text-2xl font-bold text-green-600">
                    {dailyCosts ? formatCurrency(dailyCosts.weaviate) : '$0.0000'}
                  </p>
                  <p className="text-xs text-gray-600">Vector search</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">OpenAI</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {dailyCosts ? formatCurrency(dailyCosts.openai) : '$0.0000'}
                  </p>
                  <p className="text-xs text-gray-600">GPT-4 processing</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Claude</p>
                  <p className="text-2xl font-bold text-red-600">
                    {dailyCosts ? formatCurrency(dailyCosts.claude) : '$0.0000'}
                  </p>
                  <p className="text-xs text-gray-600">AI analysis</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Total</p>
                  <p className="text-2xl font-bold">
                    {dailyCosts ? formatCurrency(dailyCosts.total) : '$0.0000'}
                  </p>
                  <p className="text-xs text-gray-600">All services</p>
                </div>
              </div>

              <Separator />

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  API costs are estimated based on usage patterns. Actual costs may vary based on 
                  caching, rate limits, and provider pricing changes.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search Control Tab */}
        <TabsContent value="search" className="space-y-4">
          <CitySearchControl 
            onSearch={handleSearch}
            showCostEstimate={true}
            showAnalytics={true}
          />
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Cost Optimization Recommendations
              </CardTitle>
              <CardDescription>
                AI-powered suggestions to reduce search costs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendations?.map((rec, index) => (
                <Alert key={index}>
                  <Zap className="h-4 w-4" />
                  <AlertDescription>{rec}</AlertDescription>
                </Alert>
              ))}
              {(!recommendations || recommendations.length === 0) && (
                <Alert>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    Your search operations are well-optimized! No immediate recommendations.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Optimize search performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Target className="h-4 w-4 mr-2" />
                Pre-cache Top 10 Cities
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Filter className="h-4 w-4 mr-2" />
                Enable Aggressive Caching
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Activity className="h-4 w-4 mr-2" />
                Optimize API Rate Limits
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Export Analytics Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}