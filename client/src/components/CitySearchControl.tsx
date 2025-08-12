/**
 * City-Specific Search Control Component
 * Provides granular search controls with cost tracking and analytics
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  Filter,
  AlertCircle,
  ChevronRight,
  Building2,
  Users,
  BarChart3,
  Target,
  Info
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CitySearchControlProps {
  onSearch: (params: SearchParams) => void;
  className?: string;
  showCostEstimate?: boolean;
  showAnalytics?: boolean;
}

interface SearchParams {
  city?: string;
  state?: string;
  careTypes?: string[];
  priceRange?: [number, number];
  searchScope: 'city' | 'state' | 'national';
  radius?: number;
  includeNearby?: boolean;
}

interface CostEstimate {
  estimatedCost: number;
  apiCalls: number;
  cacheHitRate: number;
  recommendation?: string;
}

const US_STATES = [
  { code: 'CA', name: 'California' },
  { code: 'TX', name: 'Texas' },
  { code: 'FL', name: 'Florida' },
  { code: 'NY', name: 'New York' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'IL', name: 'Illinois' },
  { code: 'OH', name: 'Ohio' },
  { code: 'GA', name: 'Georgia' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'MI', name: 'Michigan' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'WA', name: 'Washington' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'CO', name: 'Colorado' },
  { code: 'NJ', name: 'New Jersey' }
];

const MAJOR_CITIES = {
  'CA': ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento', 'San Jose'],
  'TX': ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth'],
  'FL': ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale'],
  'NY': ['New York City', 'Buffalo', 'Rochester', 'Albany', 'Syracuse'],
  'IL': ['Chicago', 'Aurora', 'Rockford', 'Joliet', 'Naperville'],
  'AZ': ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale']
};

const CARE_TYPES = [
  { value: 'assisted_living', label: 'Assisted Living' },
  { value: 'memory_care', label: 'Memory Care' },
  { value: 'independent_living', label: 'Independent Living' },
  { value: 'skilled_nursing', label: 'Skilled Nursing' },
  { value: 'continuing_care', label: 'CCRC' },
  { value: 'adult_day_care', label: 'Adult Day Care' }
];

export function CitySearchControl({ 
  onSearch, 
  className = '',
  showCostEstimate = true,
  showAnalytics = true
}: CitySearchControlProps) {
  const { toast } = useToast();
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [customCity, setCustomCity] = useState<string>('');
  const [selectedCareTypes, setSelectedCareTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [searchScope, setSearchScope] = useState<'city' | 'state' | 'national'>('city');
  const [searchRadius, setSearchRadius] = useState<number>(10);
  const [includeNearby, setIncludeNearby] = useState<boolean>(false);

  // Fetch cost estimate for current search parameters
  const { data: costEstimate } = useQuery({
    queryKey: ['cost-estimate', searchScope, selectedState, selectedCity, selectedCareTypes],
    queryFn: async () => {
      const params = new URLSearchParams({
        scope: searchScope,
        state: selectedState,
        city: selectedCity || customCity,
        careTypes: selectedCareTypes.join(',')
      });
      
      const response = await fetch(`/api/search/cost-estimate?${params}`);
      if (!response.ok) throw new Error('Failed to fetch cost estimate');
      return response.json() as Promise<CostEstimate>;
    },
    enabled: showCostEstimate && (!!selectedState || searchScope === 'national')
  });

  // Fetch search analytics for the selected city
  const { data: cityAnalytics } = useQuery({
    queryKey: ['city-analytics', selectedState, selectedCity],
    queryFn: async () => {
      const response = await fetch(`/api/search/analytics/city?state=${selectedState}&city=${selectedCity}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
    enabled: showAnalytics && !!selectedState && !!selectedCity
  });

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setSelectedCity(''); // Reset city when state changes
    setCustomCity('');
  };

  const handleCityChange = (city: string) => {
    if (city === 'custom') {
      setSelectedCity('');
    } else {
      setSelectedCity(city);
      setCustomCity('');
    }
  };

  const handleSearch = () => {
    const params: SearchParams = {
      state: selectedState,
      city: selectedCity || customCity,
      careTypes: selectedCareTypes,
      priceRange,
      searchScope,
      radius: includeNearby ? searchRadius : undefined,
      includeNearby
    };

    // Validate required fields based on scope
    if (searchScope === 'city' && !params.city) {
      toast({
        title: "City Required",
        description: "Please select or enter a city for city-specific search",
        variant: "destructive"
      });
      return;
    }

    if (searchScope === 'state' && !params.state) {
      toast({
        title: "State Required",
        description: "Please select a state for state-wide search",
        variant: "destructive"
      });
      return;
    }

    onSearch(params);

    // Show cost notification if available
    if (costEstimate) {
      toast({
        title: "Search Initiated",
        description: `Estimated cost: $${costEstimate.estimatedCost.toFixed(4)} | API calls: ${costEstimate.apiCalls}`
      });
    }
  };

  const toggleCareType = (careType: string) => {
    setSelectedCareTypes(prev =>
      prev.includes(careType)
        ? prev.filter(t => t !== careType)
        : [...prev, careType]
    );
  };

  const availableCities = selectedState ? MAJOR_CITIES[selectedState as keyof typeof MAJOR_CITIES] || [] : [];

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            City-Specific Search Controls
          </CardTitle>
          <CardDescription>
            Search with granular control to manage API costs and improve targeting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="location" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="filters">Filters</TabsTrigger>
              <TabsTrigger value="scope">Scope</TabsTrigger>
            </TabsList>

            <TabsContent value="location" className="space-y-4">
              {/* State Selection */}
              <div>
                <Label>State</Label>
                <Select value={selectedState} onValueChange={handleStateChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map(state => (
                      <SelectItem key={state.code} value={state.code}>
                        {state.name} ({state.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City Selection */}
              {selectedState && (
                <div>
                  <Label>City</Label>
                  {availableCities.length > 0 ? (
                    <Select value={selectedCity} onValueChange={handleCityChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a city" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCities.map(city => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                        <Separator className="my-2" />
                        <SelectItem value="custom">Enter custom city...</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      placeholder="Enter city name"
                      value={customCity}
                      onChange={(e) => setCustomCity(e.target.value)}
                    />
                  )}
                </div>
              )}

              {/* Custom City Input */}
              {selectedCity === '' && selectedState && availableCities.length > 0 && (
                <div>
                  <Label>Custom City</Label>
                  <Input
                    placeholder="Enter city name"
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                  />
                </div>
              )}

              {/* Include Nearby Communities */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-nearby"
                  checked={includeNearby}
                  onCheckedChange={(checked) => setIncludeNearby(checked as boolean)}
                />
                <Label htmlFor="include-nearby" className="text-sm font-normal">
                  Include nearby communities
                </Label>
              </div>

              {/* Search Radius */}
              {includeNearby && (
                <div>
                  <Label>Search Radius: {searchRadius} miles</Label>
                  <Slider
                    value={[searchRadius]}
                    onValueChange={(value) => setSearchRadius(value[0])}
                    min={5}
                    max={50}
                    step={5}
                    className="mt-2"
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="filters" className="space-y-4">
              {/* Care Types */}
              <div>
                <Label>Care Types</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {CARE_TYPES.map(type => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={type.value}
                        checked={selectedCareTypes.includes(type.value)}
                        onCheckedChange={() => toggleCareType(type.value)}
                      />
                      <Label
                        htmlFor={type.value}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <Label>Monthly Price Range</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                    className="w-24"
                  />
                  <span className="text-gray-500">to</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000])}
                    className="w-24"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="scope" className="space-y-4">
              {/* Search Scope */}
              <div>
                <Label>Search Scope</Label>
                <div className="grid grid-cols-1 gap-3 mt-2">
                  <div
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      searchScope === 'city' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => setSearchScope('city')}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">City-Specific</h4>
                        <p className="text-sm text-gray-600">Lowest cost, targeted results</p>
                      </div>
                      <Badge variant="outline">~$0.003/search</Badge>
                    </div>
                  </div>
                  <div
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      searchScope === 'state' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => setSearchScope('state')}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">State-Wide</h4>
                        <p className="text-sm text-gray-600">Broader coverage, moderate cost</p>
                      </div>
                      <Badge variant="outline">~$0.008/search</Badge>
                    </div>
                  </div>
                  <div
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      searchScope === 'national' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => setSearchScope('national')}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">National</h4>
                        <p className="text-sm text-gray-600">Complete coverage, highest cost</p>
                      </div>
                      <Badge variant="outline">~$0.015/search</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Cost Estimate Display */}
          {showCostEstimate && costEstimate && (
            <Alert className="mt-4">
              <DollarSign className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>Estimated cost: ${costEstimate.estimatedCost.toFixed(4)}</span>
                  <span className="text-sm text-gray-600">
                    {costEstimate.apiCalls} API calls | {(costEstimate.cacheHitRate * 100).toFixed(0)}% cached
                  </span>
                </div>
                {costEstimate.recommendation && (
                  <p className="text-sm text-blue-600 mt-1">{costEstimate.recommendation}</p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* City Analytics Display */}
          {showAnalytics && cityAnalytics && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics for {selectedCity}, {selectedState}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <div className="text-gray-600">Search Volume</div>
                  <div className="font-medium">{cityAnalytics.searchCount} searches</div>
                </div>
                <div>
                  <div className="text-gray-600">Avg Results</div>
                  <div className="font-medium">{cityAnalytics.avgResults} communities</div>
                </div>
                <div>
                  <div className="text-gray-600">Total Cost</div>
                  <div className="font-medium">${cityAnalytics.totalCost.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-gray-600">Popular Care</div>
                  <div className="font-medium">{cityAnalytics.topCareType}</div>
                </div>
              </div>
            </div>
          )}

          {/* Search Button */}
          <div className="flex justify-end mt-6">
            <Button onClick={handleSearch} className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search Communities
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Search Shortcuts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Search Shortcuts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedState('CA');
                setSelectedCity('Los Angeles');
                setSearchScope('city');
              }}
            >
              Los Angeles, CA
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedState('TX');
                setSelectedCity('Houston');
                setSearchScope('city');
              }}
            >
              Houston, TX
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedState('FL');
                setSelectedCity('Miami');
                setSearchScope('city');
              }}
            >
              Miami, FL
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedState('AZ');
                setSelectedCity('Phoenix');
                setSearchScope('city');
              }}
            >
              Phoenix, AZ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}