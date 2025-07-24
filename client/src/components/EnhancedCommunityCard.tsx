import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Home, DollarSign, Users, Building, MapPin } from "lucide-react";
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
      lastVerified: string;
    };
  };
  index?: number;
  variant?: 'standard' | 'featured' | 'coastal' | 'trending' | 'list' | 'horizontal';
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

  // Determine variant styling
  const variantStyles = {
    standard: 'border-gray-200',
    featured: 'border-purple-300 shadow-purple-100',
    coastal: 'border-blue-300 shadow-blue-100',
    trending: 'border-green-300 shadow-green-100',
    horizontal: 'border-gray-200',
    list: 'border-gray-200'
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect();
    }
  };

  const cardContent = (
    <Card 
      className={`overflow-hidden flex-shrink-0 w-56 h-[30rem] animate-float ${variantStyles[variant]} hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${onSelect ? 'cursor-pointer' : ''}`}
      onClick={onSelect ? handleCardClick : undefined}
    >
        <div className="relative">
          {/* Placeholder Image */}
          <div className="aspect-[4/3] bg-gray-200 flex items-center justify-center">
            <Home className="w-12 h-12 text-gray-400" />
          </div>

          {/* Heart Icon */}
          <div className="absolute top-2 right-2 z-10">
            <div className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/90 cursor-pointer">
              <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
            </div>
          </div>

          {/* Availability Status Badge - Top Left */}
          <Badge className={`absolute top-2 left-2 ${availabilityBgColor} text-white text-xs px-2 py-1 font-medium z-10`}>
            {community.displayAvailability?.availabilityStatus || community.availabilityStatus || 'Contact for Info'}
          </Badge>

          {/* Authentic Pricing Badge - Bottom Left */}
          <Badge className={`absolute bottom-2 left-2 ${hasAuthenticPricing ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-blue-600 to-purple-600'} text-white text-xs px-2 py-1 font-medium z-10`}>
            <DollarSign className="w-3 h-3 mr-1" />
            {hasAuthenticPricing ? 'HUD Verified' : 'Market Est.'}
          </Badge>

          {/* Data Quality Badge - Bottom Right */}
          {isHudProperty && (
            <Badge className="absolute bottom-2 right-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs px-2 py-1 font-medium z-10">
              🏛️ HUD
            </Badge>
          )}
        </div>

        <CardContent className="p-3">
          {/* Community Name */}
          <div className="text-sm font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {community.name}
          </div>

          {/* Location */}
          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mb-2">
            <MapPin className="w-3 h-3 mr-1" />
            <span className="line-clamp-1">
              {community.city}, {community.state}
              {community.zipCode && <span className="ml-1">({community.zipCode})</span>}
            </span>
          </div>

          {/* Authentic Pricing Display */}
          <div className="mb-2">
            <div className={`text-lg font-bold ${hasAuthenticPricing ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
              {displayPrice}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {community.displayPricing?.priceLabel || 'Market-based estimate'}
            </div>
          </div>

          {/* Occupancy and Units Info */}
          {hasOccupancyData && (
            <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mb-2">
              <Users className="w-3 h-3 mr-1" />
              <span>{community.displayAvailability?.occupancyDisplay}</span>
              {community.displayAvailability?.unitsDisplay && (
                <span className="ml-1">• {community.displayAvailability.unitsDisplay}</span>
              )}
            </div>
          )}

          {/* Care Types */}
          {community.careTypes && community.careTypes.length > 0 && (
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
              {community.careTypes.slice(0, 2).join(', ')}
              {community.careTypes.length > 2 && ` +${community.careTypes.length - 2} more`}
            </div>
          )}

          {/* Transparency Badges */}
          <div className="flex flex-wrap gap-1 mb-2">
            {community.transparencyBadges?.slice(0, 2).map((badge) => (
              <Badge 
                key={badge.id} 
                className={`${badge.color} text-white text-xs px-2 py-1 font-medium`}
                title={badge.description}
              >
                {badge.name}
              </Badge>
            ))}
          </div>

          {/* Data Quality Indicator */}
          {community.dataQuality && (
            <div className="flex items-center justify-between text-xs mt-2">
              <div className={`flex items-center ${community.dataQuality.isAuthentic ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                <div className={`w-2 h-2 rounded-full mr-1 ${community.dataQuality.isAuthentic ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                <span>{community.dataQuality.lastVerified}</span>
              </div>
              <div className="text-gray-500 dark:text-gray-400">
                Score: {community.dataQuality.qualityScore}/100
              </div>
            </div>
          )}
        </CardContent>
    </Card>
  );

  // Return with Link wrapper if no onSelect provided, otherwise return card directly
  const cardWithEnhancedStyling = (
    <Card 
      className={`overflow-hidden flex-shrink-0 w-64 h-[32rem] group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] ${variantStyles[variant]} ${onSelect ? 'cursor-pointer' : ''} bg-white dark:bg-gray-800 border-2 hover:border-blue-300`}
      onClick={onSelect ? handleCardClick : undefined}
    >
        <div className="relative">
          {/* Enhanced Image Container */}
          <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center relative overflow-hidden">
            <Home className="w-14 h-14 text-gray-400 dark:text-gray-500 group-hover:scale-110 transition-transform duration-300" />

            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>

          {/* Enhanced Heart Icon */}
          <div className="absolute top-3 right-3 z-10">
            <div className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/95 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200 group">
              <Heart className="w-5 h-5 text-gray-600 hover:text-red-500 group-hover:scale-110 transition-all duration-200" />
            </div>
          </div>

          {/* Enhanced Availability Status Badge */}
          <Badge className={`absolute top-3 left-3 ${availabilityBgColor} text-white text-xs px-3 py-1.5 font-semibold z-10 shadow-lg`}>
            {community.displayAvailability?.availabilityStatus || community.availabilityStatus || 'Contact for Info'}
          </Badge>

          {/* Enhanced Pricing Badge */}
          <Badge className={`absolute bottom-3 left-3 ${hasAuthenticPricing ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-blue-600 to-purple-600'} text-white text-xs px-3 py-1.5 font-semibold z-10 shadow-lg`}>
            <DollarSign className="w-3 h-3 mr-1" />
            {hasAuthenticPricing ? 'HUD Verified' : 'Market Est.'}
          </Badge>

          {/* Enhanced Data Quality Badge */}
          {isHudProperty && (
            <Badge className="absolute bottom-3 right-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs px-3 py-1.5 font-semibold z-10 shadow-lg">
              🏛️ Official
            </Badge>
          )}
        </div>

        <CardContent className="p-4 h-full flex flex-col">
          {/* Enhanced Community Name */}
          <div className="text-base font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors duration-200">
            {community.name}
          </div>

          {/* Enhanced Location */}
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
            <MapPin className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
            <span className="line-clamp-1">
              {community.city}, {community.state}
              {community.zipCode && <span className="ml-1 text-gray-500">({community.zipCode})</span>}
            </span>
          </div>

          {/* Enhanced Pricing Display */}
          <div className="mb-3">
            <div className={`text-xl font-bold ${hasAuthenticPricing ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'} mb-1`}>
              {displayPrice}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {community.displayPricing?.priceLabel || 'Market-based estimate'}
            </div>
          </div>

          {/* Enhanced Occupancy Info */}
          {hasOccupancyData && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2">
              <Users className="w-4 h-4 mr-2 text-green-500" />
              <span className="text-xs">
                {community.displayAvailability?.occupancyDisplay}
                {community.displayAvailability?.unitsDisplay && (
                  <span className="ml-2">• {community.displayAvailability.unitsDisplay}</span>
                )}
              </span>
            </div>
          )}

          {/* Enhanced Care Types */}
          {community.careTypes && community.careTypes.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {community.careTypes.slice(0, 2).map((type) => (
                  <Badge key={type} variant="secondary" className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                    {type}
                  </Badge>
                ))}
                {community.careTypes.length > 2 && (
                  <Badge variant="secondary" className="text-xs bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    +{community.careTypes.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Enhanced Transparency Badges */}
          {community.transparencyBadges && community.transparencyBadges.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {community.transparencyBadges.slice(0, 2).map((badge) => (
                <Badge 
                  key={badge.id} 
                  className={`${badge.color} text-white text-xs px-2 py-1 font-medium shadow-sm`}
                  title={badge.description}
                >
                  {badge.icon} {badge.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Enhanced Data Quality Indicator */}
          <div className="mt-auto">
            {community.dataQuality && (
              <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className={`flex items-center ${community.dataQuality.isAuthentic ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${community.dataQuality.isAuthentic ? 'bg-green-500' : 'bg-orange-500'} shadow-sm`}></div>
                  <span className="font-medium">{community.dataQuality.lastVerified}</span>
                </div>
                <div className="text-gray-500 dark:text-gray-400 font-medium">
                  {community.dataQuality.qualityScore}/100
                </div>
              </div>
            )}
          </div>
        </CardContent>
    </Card>
  );

  const isListView = variant === 'list' || variant === 'horizontal';

  // Horizontal layout for list view
  if (variant === 'horizontal') {
    const horizontalCard = (
      <Card 
        className={`overflow-hidden flex flex-row h-32 group hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01] ${variantStyles[variant]} ${onSelect ? 'cursor-pointer' : ''} bg-white dark:bg-gray-800 border hover:border-blue-300`}
        onClick={onSelect ? handleCardClick : undefined}
      >
        {/* Image Section */}
        <div className="w-48 flex-shrink-0 relative">
          <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center relative overflow-hidden h-full">
            <Home className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            
            {/* Badges overlay */}
            <Badge className={`absolute top-2 left-2 ${availabilityBgColor} text-white text-xs px-2 py-1 font-medium z-10`}>
              {community.displayAvailability?.availabilityStatus || community.availabilityStatus || 'Available'}
            </Badge>
            
            {isHudProperty && (
              <Badge className="absolute bottom-2 right-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs px-2 py-1 font-medium z-10">
                🏛️ HUD
              </Badge>
            )}
          </div>
        </div>

        {/* Content Section */}
        <CardContent className="flex-1 p-4 flex flex-col justify-between">
          <div>
            {/* Community Name */}
            <div className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors duration-200">
              {community.name}
            </div>

            {/* Location */}
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
              <MapPin className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
              <span className="line-clamp-1">
                {community.city}, {community.state}
                {community.zipCode && <span className="ml-1 text-gray-500">({community.zipCode})</span>}
              </span>
            </div>

            {/* Care Types */}
            {community.careTypes && community.careTypes.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {community.careTypes.slice(0, 2).map((type) => (
                  <Badge key={type} variant="secondary" className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    {type}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Section */}
          <div className="flex items-center justify-between">
            {/* Pricing */}
            <div className={`text-lg font-bold ${hasAuthenticPricing ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
              {displayPrice}
            </div>

            {/* Heart Icon */}
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer">
              <Heart className="w-4 h-4 text-gray-600 dark:text-gray-400 hover:text-red-500" />
            </div>
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

  return onSelect ? cardWithEnhancedStyling : (
    <Link href={`/community/${community.id}`}>
      {cardWithEnhancedStyling}
    </Link>
  );
}