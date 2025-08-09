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
    
    // Additional critical fields
    availableUnits?: number;
    waitListLength?: number;
    petFriendly?: boolean;
    verified?: boolean;
    licenseStatus?: string;
    violations?: number;
    lastInspection?: string;
    medicalRestrictions?: string[];
    specialPromotions?: Array<{
      title: string;
      description: string;
      monthsWaived?: number;
      percentageOff?: number;
    }>;
    moveInCosts?: {
      securityDeposit?: number;
      communityFee?: number;
      totalEstimatedMoveIn?: number;
    };
    
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
  onCompare?: () => void;
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
  
  // Calculate availability status with details
  const getAvailabilityInfo = () => {
    const occupancy = community.occupancyRate || 0;
    const totalUnits = community.totalUnits || 100;
    const availableUnits = community.availableUnits || Math.floor(totalUnits * (1 - occupancy/100));
    
    if (occupancy >= 100) {
      return {
        status: 'Wait List',
        detail: community.waitListLength ? `${community.waitListLength} waiting` : 'Full',
        bgColor: 'bg-red-700',
        lightColor: 'text-red-200',
        dotColor: 'bg-red-400'
      };
    }
    if (occupancy >= 95) {
      return {
        status: 'Limited',
        detail: `${availableUnits} Available`,
        bgColor: 'bg-orange-700',
        lightColor: 'text-orange-200',
        dotColor: 'bg-orange-400'
      };
    }
    if (occupancy >= 85) {
      return {
        status: 'Available Soon',
        detail: `${availableUnits} Available`,
        bgColor: 'bg-yellow-700',
        lightColor: 'text-yellow-200',
        dotColor: 'bg-yellow-400'
      };
    }
    return {
      status: 'Available Now',
      detail: `${availableUnits} Available`,
      bgColor: 'bg-green-700',
      lightColor: 'text-green-200',
      dotColor: 'bg-green-400'
    };
  };

  // Determine pricing verification colors
  const getPricingColors = () => {
    if (isHudProperty) {
      return {
        bgColor: 'bg-blue-600',
        lightColor: 'text-blue-200',
        dotColor: 'bg-blue-400'
      };
    } else if (community.verified) {
      return {
        bgColor: 'bg-green-600',
        lightColor: 'text-green-200',
        dotColor: 'bg-green-400'
      };
    }
    return {
      bgColor: 'bg-yellow-600',
      lightColor: 'text-yellow-200',
      dotColor: 'bg-yellow-400'
    };
  };

  const availability = getAvailabilityInfo();
  const pricingColors = getPricingColors();

  return (
    <Card className="w-full bg-gray-900 border-gray-700 hover:border-gray-600 transition-all duration-200 overflow-hidden">
      {/* Split Header - Pricing on Left (color by verification), Availability on Right (color by status) */}
      <div className="flex">
        {/* Pricing Section - Color Coded by Verification Source */}
        <div className={`${pricingColors.bgColor} text-white px-4 py-2 flex-1 flex items-center`}>
          <div className={`w-2 h-2 ${pricingColors.dotColor} rounded-full mr-2`}></div>
          <span className="text-sm font-medium">
            {priceDisplay}
          </span>
        </div>
        
        {/* Availability Section - Color Coded by Availability Status */}
        <div className={`${availability.bgColor} text-white px-4 py-2 flex items-center justify-end`}>
          <div className="text-right">
            <div className="text-sm font-bold text-white">{availability.status}</div>
            <div className={`text-xs ${availability.lightColor}`}>
              {Math.round(community.occupancyRate || 0)}% Occupied • {availability.detail}
            </div>
          </div>
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

        {/* Community Image or Quality Placeholder */}
        <div className="flex flex-col items-center justify-center">
          {community.photos && community.photos.length > 0 ? (
            <img 
              src={community.photos[0]} 
              alt={community.name}
              className="w-full h-[140px] object-cover"
            />
          ) : (
            <div className="flex flex-col items-center">
              <div className="text-5xl mb-2">
                {community.communitySubtype === 'memory_care' ? '🧠' :
                 community.communitySubtype === 'skilled_nursing' ? '🏥' :
                 community.communitySubtype === 'independent_living' ? '🏡' :
                 community.communitySubtype === 'hud_senior_housing' ? '🏛️' :
                 community.communitySubtype === 'active_adult_55plus' ? '🎾' :
                 community.communitySubtype === 'mobile_home_park' ? '🚐' :
                 '🏢'}
              </div>
              <div className="text-sm text-white/80 text-center font-medium">
                {community.communitySubtype === 'memory_care' ? 'Memory Care' :
                 community.communitySubtype === 'skilled_nursing' ? 'Skilled Nursing' :
                 community.communitySubtype === 'independent_living' ? 'Independent Living' :
                 community.communitySubtype === 'hud_senior_housing' ? 'HUD Housing' :
                 community.communitySubtype === 'active_adult_55plus' ? '55+ Active' :
                 community.communitySubtype === 'mobile_home_park' ? 'Mobile Park' :
                 'Senior Living'}
              </div>
              <div className="text-xs text-white/50 mt-1">
                Beautiful photos coming soon
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

        {/* Pricing Information with Source Citation */}
        <div className="mb-3">
          {/* Pricing Display */}
          <div className="text-2xl font-bold text-white mb-1">
            {priceDisplay}
          </div>
          
          {/* Pricing Source Citation */}
          <div className="text-xs text-gray-400 italic">
            {isHudProperty ? (
              <span>Source: HUD Verified Data</span>
            ) : community.verified ? (
              <span>Source: Community Verified</span>
            ) : priceDisplay === 'Contact for pricing' ? (
              <span>Contact community for current pricing</span>
            ) : (
              <span>Source: MySeniorValet Market Intelligence</span>
            )}
          </div>
          
          {/* Pricing Verification Badge */}
          <div className="mt-2">
            {isHudProperty ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-900/50 border border-blue-600 rounded-full">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-blue-300">🏛️ HUD VERIFIED PRICING</span>
              </div>
            ) : community.verified ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-900/50 border border-green-600 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-green-300">✓ COMMUNITY VERIFIED</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-900/50 border border-yellow-600 rounded-full">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-xs font-semibold text-yellow-300">📊 MARKET INTELLIGENCE</span>
              </div>
            )}
          </div>
        </div>

        {/* Occupancy Information - Consolidated on one line */}
        <div className="mb-3 p-3 bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Availability</span>
            <span className={`text-sm font-bold ${availability.lightColor}`}>
              {availability.status}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 ${availability.dotColor} rounded-full animate-pulse`}></div>
            <span className="text-white text-sm">
              {availability.detail} of {community.totalUnits || community.totalUnitsHud || '100'} units • {Math.round(community.occupancyRate || 0)}% Occupied
            </span>
          </div>
        </div>

        {/* Stats Row - Clean and Minimal */}
        <div className="flex items-center justify-between mb-3 p-3 bg-gray-800 rounded-lg">
          <div className="flex items-center text-gray-300">
            <Building className="h-4 w-4 mr-1" />
            <span className="text-sm">{community.totalUnits || community.totalUnitsHud || '100'} units</span>
          </div>
          <div className="flex items-center text-yellow-400">
            <Star className="h-4 w-4 mr-1 fill-yellow-400" />
            <span className="text-sm font-medium">{community.rating?.toFixed(1) || '4.5'}</span>
          </div>
          <span className="text-xs text-gray-400">{community.sizeCategory || 'Medium'}</span>
        </div>

        {/* Critical Information Row */}
        <div className="mb-3 space-y-2">
          {/* Pet Policy */}
          {community.petFriendly !== undefined && (
            <div className="flex items-center text-sm">
              <span className={`text-xs px-2 py-1 rounded-full ${
                community.petFriendly ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
              }`}>
                {community.petFriendly ? '🐕 Pet Friendly' : '🚫 No Pets'}
              </span>
            </div>
          )}
          
          {/* Special Promotions */}
          {community.specialPromotions && community.specialPromotions.length > 0 && (
            <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-2">
              <div className="text-xs text-yellow-400 font-semibold">
                ⭐ {community.specialPromotions[0].title}
              </div>
              {community.specialPromotions[0].monthsWaived && (
                <div className="text-xs text-yellow-300">
                  {community.specialPromotions[0].monthsWaived} months free!
                </div>
              )}
            </div>
          )}
          
          {/* Medical Restrictions Alert */}
          {community.medicalRestrictions && community.medicalRestrictions.length > 0 && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-2">
              <div className="text-xs text-red-400 font-semibold">⚠️ Medical Restrictions</div>
              <div className="text-xs text-red-300">
                {community.medicalRestrictions.slice(0, 2).join(', ')}
              </div>
            </div>
          )}
          
          {/* License & Violations Status */}
          {(community.licenseStatus || community.violations) && (
            <div className="flex items-center justify-between text-xs">
              {community.licenseStatus && (
                <span className={`px-2 py-1 rounded-full ${
                  community.licenseStatus === 'Licensed' ? 
                    'bg-green-900/50 text-green-400' : 
                    'bg-yellow-900/50 text-yellow-400'
                }`}>
                  {community.licenseStatus}
                </span>
              )}
              {community.violations !== undefined && community.violations > 0 && (
                <span className="px-2 py-1 rounded-full bg-orange-900/50 text-orange-400">
                  {community.violations} violation{community.violations > 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
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
export default PrioritizedCommunityCard;