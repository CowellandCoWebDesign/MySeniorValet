import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CommunityCard } from "@/components/community-card";
import { MapView } from "@/components/map-view";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { List, Map as MapIcon, Filter, X, Search as SearchIcon } from "lucide-react";
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
  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    careType: 'all',
    priceRange: 'all',
    availability: 'all',
    minRating: 'all',
    hasPhotos: false,
  });
  
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [sortBy, setSortBy] = useState('relevance');

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
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Your Perfect Senior Living Community</h1>
          <p className="text-lg text-gray-600 mb-6">
            Search through our database of verified senior living communities in Northern California.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by location, community name, or ZIP code..."
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>

        {/* Quick Filters */}
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
                  <Skeleton key={i} className="h-80 rounded-lg" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-600 text-lg font-semibold mb-2">Something went wrong</div>
                <p className="text-gray-600">Please try refreshing the page or adjusting your search criteria.</p>
              </div>
            ) : !filteredCommunities.length ? (
              <div className="text-center py-12">
                <div className="text-gray-600 text-lg font-semibold mb-2">No communities found</div>
                <p className="text-gray-500">Try adjusting your search criteria or removing some filters.</p>
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
    </div>
  );
}