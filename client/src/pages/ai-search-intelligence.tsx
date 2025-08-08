import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, MapPin, Star, Heart, Users, Shield, Eye, CheckCircle,
  Clock, Brain, MessageSquare, Sparkles, Home, ChevronRight,
  Calculator, Zap, Filter, Building, Building2, Car, Wifi, 
  Activity, Utensils, Pill, Music, Book, MoreHorizontal,
  FileText, Calendar, Target, ChevronLeft, ChevronDown,
  Trophy, Lightbulb, TrendingUp, AlertCircle, HeartHandshake,
  Bed, Hospital, TreePine, X, SlidersHorizontal, CheckCircle2,
  XCircle, Loader2, HelpCircle, Navigation, ChevronUp
} from 'lucide-react';
import { EnhancedCommunityCard } from '@/components/EnhancedCommunityCard';
// import AISummary from '@/components/AISummary';
import { AutocompleteSearch } from '@/components/AutocompleteSearch';
// import { DualRangeSlider } from '@/components/ui/dual-range-slider';
// import DynamicMap from '@/components/DynamicMap';
import { useLocation } from 'wouter';
import { Alert, AlertDescription } from '@/components/ui/alert';
// import { HospitalCard } from '@/components/HospitalCard';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
// import type { Community } from '@/types/community';

interface Community {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  website?: string;
  priceRange?: string;
  availability?: string;
  rating?: number;
  reviewCount?: number;
  careTypes?: string[];
  photos?: string[];
  description?: string;
}

// Import types from existing file
interface SimplifiedFilters {
  location: string;
  typeOfLiving: string[];
  amenities: string[];
  unitType: string[];
  priceRange: [number, number];
  distance: number;
  immediateAvailability: boolean;
}

const defaultSimplifiedFilters: SimplifiedFilters = {
  location: '',
  typeOfLiving: [],
  amenities: [],
  unitType: [],
  priceRange: [500, 8000],
  distance: 25,
  immediateAvailability: false
};

export default function AISearchIntelligenceRestructured() {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('perfect-match');
  const [simplifiedFilters, setSimplifiedFilters] = useState<SimplifiedFilters>(defaultSimplifiedFilters);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const simplifiedSearchRef = useRef<HTMLDivElement>(null);

  // Query and mutation hooks
  const simplifiedSearchMutation = useMutation({
    mutationFn: async (filters: SimplifiedFilters) => {
      const response = await fetch('/api/communities/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      });
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['ai-search-results'], data);
    }
  });

  const searchResults = useQuery({
    queryKey: ['ai-search-results'],
    queryFn: async () => null,
    enabled: false
  });

  const handleSimplifiedSearch = () => {
    simplifiedSearchMutation.mutate(simplifiedFilters);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            AI Search Intelligence
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Powered by ChatGPT-5 + Claude + Perplexity Multi-AI Orchestration
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="perfect-match">
              <Brain className="w-4 h-4 mr-2" />
              Perfect Match™ AI
            </TabsTrigger>
            <TabsTrigger value="map-search">
              <MapPin className="w-4 h-4 mr-2" />
              Map Search
            </TabsTrigger>
            <TabsTrigger value="healthcare">
              <Hospital className="w-4 h-4 mr-2" />
              Healthcare Finder
            </TabsTrigger>
          </TabsList>

          <TabsContent value="perfect-match" className="space-y-6">
            {/* Three-Row Filter Layout */}
            <div className="space-y-4">
              {/* Row 1 - Search Bar */}
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4">
                <AutocompleteSearch
                  value={simplifiedFilters.location}
                  onChange={(value) => setSimplifiedFilters({
                    ...simplifiedFilters,
                    location: value
                  })}
                  onSubmit={(value) => {
                    const trimmedValue = value.trim();
                    setSimplifiedFilters(prev => ({
                      ...prev,
                      location: trimmedValue
                    }));
                    setTimeout(() => {
                      simplifiedSearchMutation.mutate({
                        ...simplifiedFilters,
                        location: trimmedValue
                      });
                    }, 50);
                  }}
                  placeholder="Search by city, state, or zip code..."
                />
              </div>

              {/* Row 2 - Complete Care Spectrum */}
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 block">
                  Type of Living - Complete Care Spectrum
                </label>
                <div className="flex gap-3 items-center overflow-x-auto pb-2">
                  {/* HUD - Government Subsidized */}
                  <Button
                    variant={simplifiedFilters.typeOfLiving.includes('hud-sponsored') ? 'default' : 'outline'}
                    onClick={() => {
                      const newTypes = simplifiedFilters.typeOfLiving.includes('hud-sponsored')
                        ? simplifiedFilters.typeOfLiving.filter(t => t !== 'hud-sponsored')
                        : [...simplifiedFilters.typeOfLiving, 'hud-sponsored'];
                      setSimplifiedFilters({ ...simplifiedFilters, typeOfLiving: newTypes });
                    }}
                    className={`h-[100px] px-5 flex-shrink-0 min-w-[90px] ${
                      simplifiedFilters.typeOfLiving.includes('hud-sponsored')
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-white dark:bg-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">🏛️</div>
                      <div className="text-xs font-bold">HUD</div>
                      <div className="text-[11px] opacity-80">$0-500</div>
                      <div className="text-[10px] opacity-60">5,936</div>
                    </div>
                  </Button>

                  {/* VA Housing - Veterans */}
                  <Button
                    variant={simplifiedFilters.typeOfLiving.includes('va-housing') ? 'default' : 'outline'}
                    onClick={() => {
                      const newTypes = simplifiedFilters.typeOfLiving.includes('va-housing')
                        ? simplifiedFilters.typeOfLiving.filter(t => t !== 'va-housing')
                        : [...simplifiedFilters.typeOfLiving, 'va-housing'];
                      setSimplifiedFilters({ ...simplifiedFilters, typeOfLiving: newTypes });
                    }}
                    className={`h-[100px] px-5 flex-shrink-0 min-w-[90px] ${
                      simplifiedFilters.typeOfLiving.includes('va-housing')
                        ? 'bg-blue-800 text-white hover:bg-blue-900'
                        : 'bg-white dark:bg-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">🎖️</div>
                      <div className="text-xs font-bold">VA</div>
                      <div className="text-[11px] opacity-80">Veterans</div>
                      <div className="text-[10px] opacity-60">432</div>
                    </div>
                  </Button>

                  {/* Mobile Parks */}
                  <Button
                    variant={simplifiedFilters.typeOfLiving.includes('mobile-parks') ? 'default' : 'outline'}
                    onClick={() => {
                      const newTypes = simplifiedFilters.typeOfLiving.includes('mobile-parks')
                        ? simplifiedFilters.typeOfLiving.filter(t => t !== 'mobile-parks')
                        : [...simplifiedFilters.typeOfLiving, 'mobile-parks'];
                      setSimplifiedFilters({ ...simplifiedFilters, typeOfLiving: newTypes });
                    }}
                    className={`h-[100px] px-5 flex-shrink-0 min-w-[90px] ${
                      simplifiedFilters.typeOfLiving.includes('mobile-parks')
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-white dark:bg-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">🚐</div>
                      <div className="text-xs font-bold">Mobile</div>
                      <div className="text-[11px] opacity-80">$300-800</div>
                      <div className="text-[10px] opacity-60">2,421</div>
                    </div>
                  </Button>

                  {/* 55+ Active Adult */}
                  <Button
                    variant={simplifiedFilters.typeOfLiving.includes('55-plus') ? 'default' : 'outline'}
                    onClick={() => {
                      const newTypes = simplifiedFilters.typeOfLiving.includes('55-plus')
                        ? simplifiedFilters.typeOfLiving.filter(t => t !== '55-plus')
                        : [...simplifiedFilters.typeOfLiving, '55-plus'];
                      setSimplifiedFilters({ ...simplifiedFilters, typeOfLiving: newTypes });
                    }}
                    className={`h-[100px] px-5 flex-shrink-0 min-w-[90px] ${
                      simplifiedFilters.typeOfLiving.includes('55-plus')
                        ? 'bg-teal-600 text-white hover:bg-teal-700'
                        : 'bg-white dark:bg-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">🏌️</div>
                      <div className="text-xs font-bold">55+</div>
                      <div className="text-[11px] opacity-80">$800-1.5k</div>
                      <div className="text-[10px] opacity-60">4,567</div>
                    </div>
                  </Button>

                  {/* Independent Living */}
                  <Button
                    variant={simplifiedFilters.typeOfLiving.includes('independent-living') ? 'default' : 'outline'}
                    onClick={() => {
                      const newTypes = simplifiedFilters.typeOfLiving.includes('independent-living')
                        ? simplifiedFilters.typeOfLiving.filter(t => t !== 'independent-living')
                        : [...simplifiedFilters.typeOfLiving, 'independent-living'];
                      setSimplifiedFilters({ ...simplifiedFilters, typeOfLiving: newTypes });
                    }}
                    className={`h-[100px] px-5 flex-shrink-0 min-w-[90px] ${
                      simplifiedFilters.typeOfLiving.includes('independent-living')
                        ? 'bg-orange-600 text-white hover:bg-orange-700'
                        : 'bg-white dark:bg-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">🏘️</div>
                      <div className="text-xs font-bold">IL</div>
                      <div className="text-[11px] opacity-80">$1.5-3.5k</div>
                      <div className="text-[10px] opacity-60">8,745</div>
                    </div>
                  </Button>

                  {/* Board & Care */}
                  <Button
                    variant={simplifiedFilters.typeOfLiving.includes('board-care') ? 'default' : 'outline'}
                    onClick={() => {
                      const newTypes = simplifiedFilters.typeOfLiving.includes('board-care')
                        ? simplifiedFilters.typeOfLiving.filter(t => t !== 'board-care')
                        : [...simplifiedFilters.typeOfLiving, 'board-care'];
                      setSimplifiedFilters({ ...simplifiedFilters, typeOfLiving: newTypes });
                    }}
                    className={`h-[100px] px-5 flex-shrink-0 min-w-[90px] ${
                      simplifiedFilters.typeOfLiving.includes('board-care')
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                        : 'bg-white dark:bg-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">🏠</div>
                      <div className="text-xs font-bold">B&C</div>
                      <div className="text-[11px] opacity-80">$2-4k</div>
                      <div className="text-[10px] opacity-60">856</div>
                    </div>
                  </Button>

                  {/* Assisted Living */}
                  <Button
                    variant={simplifiedFilters.typeOfLiving.includes('assisted-living') ? 'default' : 'outline'}
                    onClick={() => {
                      const newTypes = simplifiedFilters.typeOfLiving.includes('assisted-living')
                        ? simplifiedFilters.typeOfLiving.filter(t => t !== 'assisted-living')
                        : [...simplifiedFilters.typeOfLiving, 'assisted-living'];
                      setSimplifiedFilters({ ...simplifiedFilters, typeOfLiving: newTypes });
                    }}
                    className={`h-[100px] px-5 flex-shrink-0 min-w-[90px] ${
                      simplifiedFilters.typeOfLiving.includes('assisted-living')
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-white dark:bg-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">🤝</div>
                      <div className="text-xs font-bold">AL</div>
                      <div className="text-[11px] opacity-80">$3-6k</div>
                      <div className="text-[10px] opacity-60">7,934</div>
                    </div>
                  </Button>

                  {/* Memory Care */}
                  <Button
                    variant={simplifiedFilters.typeOfLiving.includes('memory-care') ? 'default' : 'outline'}
                    onClick={() => {
                      const newTypes = simplifiedFilters.typeOfLiving.includes('memory-care')
                        ? simplifiedFilters.typeOfLiving.filter(t => t !== 'memory-care')
                        : [...simplifiedFilters.typeOfLiving, 'memory-care'];
                      setSimplifiedFilters({ ...simplifiedFilters, typeOfLiving: newTypes });
                    }}
                    className={`h-[100px] px-5 flex-shrink-0 min-w-[90px] ${
                      simplifiedFilters.typeOfLiving.includes('memory-care')
                        ? 'bg-pink-600 text-white hover:bg-pink-700'
                        : 'bg-white dark:bg-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">🧠</div>
                      <div className="text-xs font-bold">MC</div>
                      <div className="text-[11px] opacity-80">$4-7.5k</div>
                      <div className="text-[10px] opacity-60">3,245</div>
                    </div>
                  </Button>

                  {/* CCRC */}
                  <Button
                    variant={simplifiedFilters.typeOfLiving.includes('ccrc') ? 'default' : 'outline'}
                    onClick={() => {
                      const newTypes = simplifiedFilters.typeOfLiving.includes('ccrc')
                        ? simplifiedFilters.typeOfLiving.filter(t => t !== 'ccrc')
                        : [...simplifiedFilters.typeOfLiving, 'ccrc'];
                      setSimplifiedFilters({ ...simplifiedFilters, typeOfLiving: newTypes });
                    }}
                    className={`h-[100px] px-5 flex-shrink-0 min-w-[90px] ${
                      simplifiedFilters.typeOfLiving.includes('ccrc')
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-white dark:bg-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">🏢</div>
                      <div className="text-xs font-bold">CCRC</div>
                      <div className="text-[11px] opacity-80">Varies</div>
                      <div className="text-[10px] opacity-60">1,432</div>
                    </div>
                  </Button>

                  {/* Skilled Nursing */}
                  <Button
                    variant={simplifiedFilters.typeOfLiving.includes('skilled-nursing') ? 'default' : 'outline'}
                    onClick={() => {
                      const newTypes = simplifiedFilters.typeOfLiving.includes('skilled-nursing')
                        ? simplifiedFilters.typeOfLiving.filter(t => t !== 'skilled-nursing')
                        : [...simplifiedFilters.typeOfLiving, 'skilled-nursing'];
                      setSimplifiedFilters({ ...simplifiedFilters, typeOfLiving: newTypes });
                    }}
                    className={`h-[100px] px-5 flex-shrink-0 min-w-[90px] ${
                      simplifiedFilters.typeOfLiving.includes('skilled-nursing')
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-white dark:bg-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">🏥</div>
                      <div className="text-xs font-bold">SN</div>
                      <div className="text-[11px] opacity-80">$6-12k</div>
                      <div className="text-[10px] opacity-60">2,156</div>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Row 3 - Distance, Price, and Availability Filters */}
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
                <div className="flex gap-8 items-start">
                  {/* Distance */}
                  <div className="flex-1">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">
                      Distance
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-5 py-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>0</span>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                          {simplifiedFilters.distance} Miles
                        </span>
                        <span>50 Miles</span>
                      </div>
                      <Slider
                        value={[simplifiedFilters.distance]}
                        onValueChange={(value) => setSimplifiedFilters({
                          ...simplifiedFilters,
                          distance: value[0]
                        })}
                        min={0}
                        max={50}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between mt-3">
                        <span className="text-xs text-gray-500">min</span>
                        <span className="text-xs text-gray-500">max</span>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex-1">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">
                      Price Range
                      <Switch
                        checked={true}
                        className="ml-3 data-[state=checked]:bg-blue-600"
                      />
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-5 py-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>$500</span>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                          ${simplifiedFilters.priceRange[0]} - ${simplifiedFilters.priceRange[1]}
                        </span>
                        <span>$8000</span>
                      </div>
                      <Slider
                        value={simplifiedFilters.priceRange}
                        onValueChange={(value) => setSimplifiedFilters({
                          ...simplifiedFilters,
                          priceRange: value as [number, number]
                        })}
                        min={500}
                        max={8000}
                        step={100}
                        className="w-full"
                      />
                      <div className="flex justify-between mt-3">
                        <span className="text-xs text-gray-500">min</span>
                        <span className="text-xs text-gray-500">max</span>
                      </div>
                    </div>
                  </div>

                  {/* Immediate Availability & Actions */}
                  <div className="flex-shrink-0">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">
                      Immediate Availability
                    </label>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-3 border border-gray-200 dark:border-gray-700">
                        <Switch
                          checked={simplifiedFilters.immediateAvailability}
                          onCheckedChange={(checked) => setSimplifiedFilters({
                            ...simplifiedFilters,
                            immediateAvailability: checked
                          })}
                          className="data-[state=checked]:bg-green-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Only Available Units
                        </span>
                      </div>
                      
                      <Button
                        onClick={handleSimplifiedSearch}
                        className="bg-blue-600 text-white hover:bg-blue-700 h-12 px-8"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">Apply Filters</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSimplifiedFilters(defaultSimplifiedFilters);
                        }}
                        className="h-12 px-8 bg-red-600 text-white border-red-600 hover:bg-red-700"
                      >
                        <XCircle className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">Reset All</span>
                      </Button>
                      
                      <button 
                        onClick={() => setShowAllAmenities(!showAllAmenities)}
                        className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                        <span>View all options</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Results */}
            {simplifiedSearchMutation.isPending && (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Searching across 34,180 communities...</p>
              </div>
            )}

            {searchResults.data && (
              <div className="space-y-6">
                {/* AI Summary */}
                {searchResults.data.aiSummary && (
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-4 mb-4">
                    <p className="text-gray-700 dark:text-gray-300">{searchResults.data.aiSummary}</p>
                  </div>
                )}

                {/* Community Results */}
                {searchResults.data.communities && searchResults.data.communities.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {searchResults.data.communities.map((community: Community) => (
                      <EnhancedCommunityCard
                        key={community.id}
                        community={community}
                        variant="grid"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Map Search Tab */}
          <TabsContent value="map-search" className="h-[600px]">
            <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Map view will be displayed here</p>
            </div>
          </TabsContent>

          {/* Healthcare Tab */}
          <TabsContent value="healthcare" className="space-y-6">
            <div className="text-center py-8">
              <Hospital className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h2 className="text-2xl font-bold mb-2">Healthcare Facility Finder</h2>
              <p className="text-gray-600">Find hospitals and medical centers near senior communities</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}