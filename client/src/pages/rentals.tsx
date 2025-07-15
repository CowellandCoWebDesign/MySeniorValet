import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Filter } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import RentalMapbox from '@/components/RentalMapbox';
import type { Community } from '@shared/schema';

export default function RentalsClean() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);

  // Fetch communities data
  const { data: communities = [], isLoading, error } = useQuery({
    queryKey: ['/api/communities/search', { limit: 50 }],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Filter communities based on search
  const filteredCommunities = communities.filter((community: Community) => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      community.name?.toLowerCase().includes(searchLower) ||
      community.city?.toLowerCase().includes(searchLower) ||
      community.state?.toLowerCase().includes(searchLower) ||
      community.careTypes?.some(type => type.toLowerCase().includes(searchLower))
    );
  });

  // Handle community selection
  const handleCommunityClick = (communityId: number) => {
    const community = communities.find((c: Community) => c.id === communityId);
    setSelectedCommunity(community || null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading communities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading</h3>
            <p className="text-red-600 mb-4">{error.message}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-16">
      {/* Header */}
      <div className="sticky top-0 bg-white z-40 border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Senior Living Map</h1>
              <Badge variant="secondary" className="text-sm">
                {filteredCommunities.length} communities
              </Badge>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search communities, cities, or care types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Map Content */}
      <div className="relative h-[calc(100vh-140px)]">
        <RentalMapbox
          communities={filteredCommunities}
          onCommunityClick={handleCommunityClick}
          selectedCommunity={selectedCommunity}
          className="w-full h-full"
        />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}