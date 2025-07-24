import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Home, DollarSign, Users, Building, MapPin, Star, Zap } from "lucide-react";
import { Link } from "wouter";

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

    // Enhanced HUD data from extractor
    displayPricing?: {
      displayPrice: string;
      priceLabel: string;
      qualityBadge: string;
      showContactButton: boolean;
    };
    displayAvailability?: {
      availabilityStatus: string;
      occupancyDisplay?: string;
      availabilityColor: string;
      unitsDisplay?: string;
    };
    transparencyBadges?: Array<{
      id: string;
      name: string;
      description: string;
      icon: string;
      color: string;
      type: string;
      rarity: string;
      points: number;
    }>;
    transparencyScore?: number;
    dataQuality?: {
      isAuthentic: boolean;
      source: string;
      qualityScore: number;
      lastVerified: string;
    };
  };
  index?: number;
  variant?: 'standard' | 'featured' | 'coastal' | 'trending' | 'list' | 'horizontal' | 'default';
  onSelect?: () => void;
}

export function EnhancedCommunityCard({ community, index = 0, variant = 'standard', onSelect }: CommunityCardProps) {
  const isHudProperty = community.hudPropertyId || community.dataQuality?.isAuthentic;
  const hasAuthenticPricing = community.displayPricing?.priceLabel?.includes('HUD Official');
  const hasOccupancyData = community.displayAvailability?.occupancyDisplay;

  // Get authentic pricing display
  const displayPrice = community.displayPricing?.displayPrice || 
    (community.monthlyRentRangeStart ? `$${community.monthlyRentRangeStart.toLocaleString()}/month` :
     community.priceRange?.min ? `$${community.priceRange.min.toLocaleString()}/month` : 
     'Contact for Pricing');

  // Get availability color
  const availabilityColor = community.displayAvailability?.availabilityColor || 'gray';
  const availabilityBgColor = {
    green: 'bg-green-600',
    yellow: 'bg-orange-600', 
    red: 'bg-red-600',
    gray: 'bg-blue-600'
  }[availabilityColor];

  const handleCardClick = () => {
    if (onSelect) {
      onSelect();
    }
  };

  // Horizontal layout for list view
  if (variant === 'horizontal' || variant === 'list') {
    const horizontalCard = (
      <Card 
        className={`overflow-hidden flex flex-row h-36 group hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] ${onSelect ? 'cursor-pointer' : ''} bg-white dark:bg-gray-800 border-0 shadow-lg hover:border-blue-300 rounded-2xl`}
        onClick={onSelect ? handleCardClick : undefined}
      >
        {/* Enhanced Image Section */}
        <div className="w-52 flex-shrink-0 relative">
          <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 flex items-center justify-center relative overflow-hidden h-full rounded-l-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <Home className="w-10 h-10 text-gray-400 dark:text-gray-500 opacity-60" />
            
            {/* Live Data Indicator */}
            {isHudProperty && (
              <div className="absolute top-3 left-3 flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                <div className="w-2 h-2 bg-green-200 rounded-full animate-pulse" />
                LIVE DATA
              </div>
            )}
            
            {/* Availability Badge */}
            <Badge className={`absolute bottom-3 left-3 ${availabilityBgColor} text-white text-xs px-3 py-1.5 font-semibold rounded-full shadow-lg backdrop-blur-sm`}>
              {community.displayAvailability?.availabilityStatus || community.availabilityStatus || 'Available'}
            </Badge>
          </div>
        </div>

        {/* Enhanced Content Section */}
        <CardContent className="flex-1 p-6 flex flex-col justify-between">
          <div className="space-y-3">
            {/* Community Name with Rating */}
            <div className="flex items-start justify-between">
              <div className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors duration-200 flex-1 mr-3">
                {community.name}
              </div>
              <div className="w-10 h-10 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer group transition-all duration-300">
                <Heart className="w-5 h-5 text-gray-600 dark:text-gray-400 hover:text-red-500 group-hover:scale-110 transition-all duration-200" />
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
              <span className="line-clamp-1">
                {community.city}, {community.state}
                {community.zipCode && <span className="ml-1 text-gray-500">({community.zipCode})</span>}
              </span>
            </div>

            {/* Care Types */}
            {community.careTypes && community.careTypes.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {community.careTypes.slice(0, 3).map((type) => (
                  <Badge key={type} variant="secondary" className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 rounded-full">
                    {type}
                  </Badge>
                ))}
                {community.careTypes.length > 3 && (
                  <Badge variant="secondary" className="text-xs bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                    +{community.careTypes.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Bottom Section - Pricing and Info */}
          <div className="flex items-end justify-between pt-4">
            <div className="space-y-1">
              <div className={`text-2xl font-bold ${hasAuthenticPricing ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                {displayPrice}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {community.displayPricing?.priceLabel || 'Estimate - Call for current pricing'}
              </div>
            </div>

            {/* Occupancy Info */}
            {hasOccupancyData && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2">
                <Users className="w-4 h-4 mr-2 text-green-500" />
                <span className="text-xs">
                  {community.displayAvailability?.occupancyDisplay}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );

    return onSelect ? horizontalCard : (
      <Link href={`/community/${community.id}`}>
        {horizontalCard}
      </Link>
    );
  }

  // Standard vertical card layout
  const cardContent = (
    <Card 
      className={`overflow-hidden flex-shrink-0 w-72 h-[36rem] bg-white dark:bg-gray-800 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 ${onSelect ? 'cursor-pointer' : ''} rounded-2xl group`}
      onClick={onSelect ? handleCardClick : undefined}
    >
      <div className="relative">
        {/* Enhanced Photo Background with Gradient Overlay */}
        <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <Home className="w-16 h-16 text-gray-400 dark:text-gray-500 opacity-60 group-hover:scale-110 transition-transform duration-300" />
          
          {/* Live Data Indicator */}
          {isHudProperty && (
            <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-green-500 text-white px-3 py-2 rounded-full text-sm font-semibold shadow-lg">
              <div className="w-2.5 h-2.5 bg-green-200 rounded-full animate-pulse" />
              LIVE DATA
            </div>
          )}

          {/* Premium Heart Icon */}
          <div className="absolute top-4 right-4 z-10">
            <div className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white shadow-lg transition-all duration-300 hover:scale-110 cursor-pointer group">
              <Heart className="w-5 h-5 text-gray-600 hover:text-red-500 group-hover:scale-110 transition-all duration-300" />
            </div>
          </div>

          {/* Enhanced Availability Status Badge */}
          <Badge className={`absolute bottom-4 left-4 ${availabilityBgColor} text-white text-sm px-4 py-2 font-semibold rounded-full shadow-lg backdrop-blur-sm`}>
            {community.displayAvailability?.availabilityStatus || community.availabilityStatus || 'Contact for Info'}
          </Badge>

          {/* Pricing Quality Badge */}
          <Badge className={`absolute bottom-4 right-4 ${hasAuthenticPricing ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-blue-600 to-purple-600'} text-white text-sm px-3 py-2 font-semibold rounded-full shadow-lg`}>
            <DollarSign className="w-4 h-4 mr-1" />
            {hasAuthenticPricing ? 'Verified' : 'Estimate'}
          </Badge>
        </div>
      </div>

      <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
        {/* Enhanced Community Name */}
        <div className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors duration-200">
          {community.name}
        </div>

        {/* Enhanced Location */}
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <MapPin className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
          <span className="line-clamp-1">
            {community.city}, {community.state}
            {community.zipCode && <span className="ml-1 text-gray-500">({community.zipCode})</span>}
          </span>
        </div>

        {/* Enhanced Pricing Display */}
        <div className="space-y-2">
          <div className={`text-2xl font-bold ${hasAuthenticPricing ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
            {displayPrice}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {community.displayPricing?.priceLabel || 'Estimate - Call for current pricing'}
          </div>
        </div>

        {/* Enhanced Occupancy and Units */}
        {hasOccupancyData && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3">
            <Users className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
            <div className="space-y-1">
              <span className="font-medium">{community.displayAvailability?.occupancyDisplay}</span>
              {community.displayAvailability?.unitsDisplay && (
                <div className="text-xs text-gray-500 dark:text-gray-400">{community.displayAvailability.unitsDisplay}</div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Care Types */}
        {community.careTypes && community.careTypes.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 font-medium">
              <Building className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0" />
              Care Services
            </div>
            <div className="flex flex-wrap gap-2">
              {community.careTypes.slice(0, 3).map((type) => (
                <Badge key={type} variant="secondary" className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 rounded-full px-3 py-1">
                  {type}
                </Badge>
              ))}
              {community.careTypes.length > 3 && (
                <Badge variant="secondary" className="text-xs bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full px-3 py-1">
                  +{community.careTypes.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Transparency Badges */}
        {community.transparencyBadges && community.transparencyBadges.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 font-medium">
              <Zap className="w-4 h-4 mr-2 text-yellow-500 flex-shrink-0" />
              Achievements
            </div>
            <div className="flex flex-wrap gap-2">
              {community.transparencyBadges.slice(0, 2).map((badge) => (
                <Badge 
                  key={badge.id} 
                  className={`${badge.color} text-white text-xs px-3 py-1.5 font-medium rounded-full shadow-sm`}
                  title={badge.description}
                >
                  {badge.icon} {badge.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Data Quality Indicator */}
        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
          {community.dataQuality && (
            <div className="flex items-center justify-between text-sm">
              <div className={`flex items-center ${community.dataQuality.isAuthentic ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                <div className={`w-3 h-3 rounded-full mr-2 ${community.dataQuality.isAuthentic ? 'bg-green-500' : 'bg-orange-500'} shadow-sm`}></div>
                <span className="font-medium">{community.dataQuality.lastVerified}</span>
              </div>
              <div className="text-gray-500 dark:text-gray-400 font-medium">
                Quality: {community.dataQuality.qualityScore}/100
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return onSelect ? cardContent : (
    <Link href={`/community/${community.id}`}>
      {cardContent}
    </Link>
  );
}