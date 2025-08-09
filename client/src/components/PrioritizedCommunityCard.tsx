import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Building, MapPin, Star, Phone, MessageCircle, Share2 } from "lucide-react";

interface CommunityCardProps {
  community: {
    id: number;
    name: string;
    city: string;
    state: string;
    address?: string;
    careTypes?: string[];
    priceRange?: { min: number; max: number };
    rating?: number;
    reviewCount?: number;
    photos?: string[];
    description?: string;
    totalUnits?: number;
    availabilityStatus?: string;
    monthlyRentRangeStart?: number;
    monthlyRentRangeEnd?: number;
    hudPropertyId?: string;
    priceTier?: string;
    sizeCategory?: string;
    occupancyRate?: number;
    zipCode?: string;
    seniorPercentage?: number;
    rentPerMonth?: number | string;
    occupancyRateHud?: string | number;
    totalUnitsHud?: string | number;
    communitySubtype?: string;
    amenities?: string[];
    phone?: string;
    website?: string;
    email?: string;
    careLevel?: string;
    
    // Pricing properties
    livePricing?: {
      independentLiving?: { min: number; max: number };
      assistedLiving?: { min: number; max: number };
      memoryCare?: { min: number; max: number };
    };
    pricingType?: 'live' | 'market' | 'contact';
  };
  variant?: 'grid' | 'list';
  onSelect?: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
}

function CommunityCard({ 
  community, 
  variant = 'list',
  onSelect,
  onToggleFavorite,
  isFavorite = false 
}: CommunityCardProps) {
  
  // Helper functions
  const isHudProperty = Boolean(community.hudPropertyId);
  
  // Price display logic
  const getPriceDisplay = () => {
    if (isHudProperty && community.rentPerMonth) {
      const rent = typeof community.rentPerMonth === 'string' 
        ? parseInt(community.rentPerMonth.replace(/[^0-9]/g, '')) 
        : community.rentPerMonth;
      return rent > 0 ? `$${rent.toLocaleString()}/mo` : null;
    }
    
    if (community.livePricing?.assistedLiving) {
      const { min, max } = community.livePricing.assistedLiving;
      return `$${min.toLocaleString()} - $${max.toLocaleString()}/mo`;
    }
    
    if (community.monthlyRentRangeStart && community.monthlyRentRangeEnd) {
      return `$${community.monthlyRentRangeStart.toLocaleString()} - $${community.monthlyRentRangeEnd.toLocaleString()}/mo`;
    }
    
    return '$3,500/mo'; // Default for demo
  };

  const priceDisplay = getPriceDisplay();

  return (
    <Card className="w-full bg-gray-900 border-gray-700 hover:border-gray-600 transition-all duration-200 overflow-hidden">
      {/* Pricing Header - Green */}
      <div className="bg-green-700 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
          <span className="text-sm font-medium">
            {priceDisplay}
          </span>
          <div className="ml-4 text-xs text-green-200">
            Community Verified
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-green-100">Available Now</div>
          <div className="text-xs text-green-200">Move in today</div>
        </div>
      </div>

      {/* Main Card Content - Purple Gradient */}
      <div className="relative bg-gradient-to-br from-purple-600 to-purple-800 text-white min-h-[140px] flex items-center justify-center">
        {/* Share and Favorite buttons */}
        <div className="absolute top-3 right-3 flex gap-2 z-20">
          <Button
            size="sm"
            variant="ghost"
            className="bg-black/60 hover:bg-black/80 text-white p-2 h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.();
            }}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="bg-black/60 hover:bg-black/80 text-white p-2 h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Community Image or "Photos Coming Soon" */}
        <div className="flex flex-col items-center justify-center">
          {community.photos && community.photos.length > 0 ? (
            <img 
              src={community.photos[0]} 
              alt={community.name}
              className="w-20 h-20 rounded-lg object-cover"
            />
          ) : (
            <div className="flex flex-col items-center">
              <Building className="h-12 w-12 text-white/60 mb-2" />
              <div className="text-xs text-white/80 text-center leading-tight">
                Photos<br />Coming Soon
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section - Dark Theme */}
      <CardContent className="p-4 bg-gray-900 text-white">
        {/* Care Type Badge */}
        <div className="flex items-center justify-between mb-3">
          <Badge className="bg-blue-600 text-white text-sm px-3 py-1">
            {community.careLevel || 'Assisted Living'}
          </Badge>
        </div>

        {/* Community Name and Location */}
        <div className="mb-3">
          <h3 className="text-xl font-bold text-white mb-1">
            {community.name}
          </h3>
          <div className="flex items-center text-sm text-gray-400">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{community.city}, {community.state}</span>
          </div>
        </div>

        {/* Stats Row - Clean and Minimal */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-800 rounded-lg">
          <div className="flex items-center text-gray-300">
            <Building className="h-4 w-4 mr-1" />
            <span className="text-sm">{community.totalUnits || community.totalUnitsHud || '100'}</span>
          </div>
          <div className="flex items-center text-yellow-400">
            <Star className="h-4 w-4 mr-1 fill-yellow-400" />
            <span className="text-sm font-medium">{community.rating?.toFixed(1) || '4.5'}</span>
          </div>
          <span className="text-xs text-gray-400">Medium</span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {/* Call Button */}
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              if (community.phone) {
                window.open(`tel:${community.phone}`, '_self');
              }
            }}
          >
            <Phone className="h-4 w-4" />
            Call
          </Button>

          {/* Message Button */}
          <Button 
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700 font-semibold py-2 rounded-lg flex items-center justify-center gap-2"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
            }}
          >
            <MessageCircle className="h-4 w-4" />
            Message
          </Button>
        </div>

        {/* View Full Details */}
        <div className="mt-3 text-center">
          <button 
            className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onSelect?.();
            }}
          >
            View Full Details →
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

// Export with React.memo for performance optimization
export const PrioritizedCommunityCard = React.memo(CommunityCard);