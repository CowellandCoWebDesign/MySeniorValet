import React from 'react';
import { MapPin, Home, Phone, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Community } from '@shared/schema';

interface RentalMapFallbackProps {
  communities: Community[];
  onCommunityClick: (communityId: number) => void;
  selectedCommunity?: Community | null;
  className?: string;
}

export default function RentalMapFallback({ 
  communities, 
  onCommunityClick, 
  selectedCommunity, 
  className = '' 
}: RentalMapFallbackProps) {
  
  // Filter communities with valid coordinates
  const validCommunities = communities.filter(community => 
    community.latitude && 
    community.longitude &&
    community.latitude !== "0" && 
    community.longitude !== "0"
  );

  return (
    <div className={`${className} bg-gray-50`}>
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold">Communities Map</h2>
              <p className="text-sm text-gray-600">
                {validCommunities.length} locations found
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-yellow-600 border-yellow-300">
            Map temporarily unavailable
          </Badge>
        </div>
      </div>

      {/* Communities List */}
      <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
        {validCommunities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No communities with location data found</p>
          </div>
        ) : (
          validCommunities.map((community) => (
            <div
              key={community.id}
              className={`
                bg-white rounded-lg border p-4 cursor-pointer transition-all
                ${selectedCommunity?.id === community.id 
                  ? 'border-blue-500 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }
              `}
              onClick={() => onCommunityClick(community.id)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Home className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {community.name}
                  </h3>
                  
                  <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">
                      {community.city}, {community.state}
                    </span>
                  </div>
                  
                  {/* Care Types */}
                  {community.careTypes && community.careTypes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {community.careTypes.slice(0, 2).map((type, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                      {community.careTypes.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{community.careTypes.length - 2} more
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {/* Pricing */}
                  {community.monthlyRent && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        ${Math.round(community.monthlyRent / 1000)}K+/month
                      </Badge>
                    </div>
                  )}
                </div>
                
                <div className="flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Map Status Message */}
      <div className="bg-yellow-50 border-t border-yellow-200 p-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
          <span className="text-yellow-800">
            Interactive map temporarily unavailable. Showing communities as list.
          </span>
        </div>
      </div>
    </div>
  );
}