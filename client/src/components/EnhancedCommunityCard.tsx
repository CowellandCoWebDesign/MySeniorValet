import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Home, DollarSign, Users, Building, MapPin, Star, Zap, Shield, CheckCircle, Award, Sparkles, Phone } from "lucide-react";
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
    rentPerMonth?: number | string; // HUD communities use this field
    occupancyRateHud?: string | number;
    totalUnitsHud?: string | number;

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
  variant?: 'standard' | 'featured' | 'coastal' | 'trending' | 'list' | 'horizontal' | 'default' | 'highest-rated' | 'verified' | 'hud';
  onSelect?: () => void;
}

export function EnhancedCommunityCard({ community, index = 0, variant = 'standard', onSelect }: CommunityCardProps) {
  const isHudProperty = community.hudPropertyId || community.dataQuality?.isAuthentic || community.rentPerMonth;
  const hasAuthenticPricing = community.displayPricing?.priceLabel?.includes('HUD Official') || 
    (community.hudPropertyId && community.rentPerMonth) || 
    (isHudProperty && community.rentPerMonth);
  const hasOccupancyData = community.displayAvailability?.occupancyDisplay;

  // Get authentic pricing display - check HUD rentPerMonth first
  const displayPrice = community.displayPricing?.displayPrice || 
    (community.rentPerMonth ? `$${Number(community.rentPerMonth).toLocaleString()}/month` :
     community.monthlyRentRangeStart ? `$${community.monthlyRentRangeStart.toLocaleString()}/month` :
     community.priceRange?.min ? `$${community.priceRange.min.toLocaleString()}/month` : 
     'Contact for Pricing');

  // Simple list variant for search results
  if (variant === 'list') {
    return (
      <Card 
        className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-300 dark:hover:border-blue-600"
        onClick={onSelect}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              {/* Name and Location */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                {community.name}
              </h3>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                <span>{community.city}, {community.state} {community.zipCode || ''}</span>
              </div>

              {/* Key Information Row */}
              <div className="flex flex-wrap items-center gap-3 text-sm mb-2">
                {community.rating && (
                  <div className="flex items-center">
                    <Star className="h-3 w-3 text-yellow-400 mr-1" />
                    <span className="font-medium">{community.rating.toFixed(1)}</span>
                  </div>
                )}
                
                {community.totalUnits && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Building className="h-3 w-3 mr-1" />
                    <span>{community.totalUnits} units</span>
                  </div>
                )}
                
                {community.careTypes && community.careTypes.length > 0 && (
                  <span className="text-gray-600 dark:text-gray-400">
                    • {community.careTypes[0]}
                  </span>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5">
                {isHudProperty && (
                  <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-300">
                    <Shield className="h-3 w-3 mr-1" />
                    HUD Verified
                  </Badge>
                )}
                
                {community.dataQuality?.qualityScore && community.dataQuality.qualityScore >= 80 && (
                  <Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
                
                {community.transparencyBadges && community.transparencyBadges.length > 0 && (
                  <Badge className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    <Award className="h-3 w-3 mr-1" />
                    {community.transparencyBadges.length} Badges
                  </Badge>
                )}
                
                {displayPrice === 'Contact for Pricing' && community.sizeCategory && (
                  <Badge className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                    {community.sizeCategory}
                  </Badge>
                )}
              </div>
            </div>

            {/* Pricing Column */}
            <div className="text-right">
              {displayPrice === 'Contact for Pricing' ? (
                <div className="flex flex-col items-end">
                  <Phone className="h-5 w-5 text-gray-400 mb-1" />
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Call for pricing
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-end">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {displayPrice}
                  </div>
                  {hasAuthenticPricing && (
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                      Official
                    </span>
                  )}
                </div>
              )}
              
              {/* Availability Status */}
              {community.displayAvailability?.availabilityStatus && (
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  {community.displayAvailability.availabilityStatus}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Enhanced horizontal layout for map list
  if (variant === 'horizontal') {
    return (
      <Card 
        className="group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white via-blue-50/20 to-purple-50/20 dark:from-gray-800 dark:via-gray-800 dark:to-gray-700 border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-600 overflow-hidden"
        onClick={onSelect}
      >
        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row">
            {/* Image Section */}
            <div className="relative lg:w-80 h-48 lg:h-auto bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center overflow-hidden">
              {community.photos && community.photos.length > 0 ? (
                <img 
                  src={community.photos[0]} 
                  alt={community.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="text-center">
                  <Home className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No photo available</p>
                </div>
              )}
              
              {/* Live Data Badge */}
              {isHudProperty && (
                <div className="absolute top-3 left-3">
                  <Badge className="bg-green-600 hover:bg-green-700 text-white border-0 shadow-lg">
                    <Zap className="h-3 w-3 mr-1" />
                    LIVE DATA
                  </Badge>
                </div>
              )}
              
              {/* Heart/Favorite Button */}
              <div className="absolute top-3 right-3">
                <div className="w-10 h-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 transition-colors cursor-pointer">
                  <Heart className="h-5 w-5 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors" />
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 p-6 lg:p-8">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                    <div className="flex-1 mb-4 lg:mb-0 lg:pr-6">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {community.name}
                      </h3>
                      <div className="flex items-center text-gray-600 dark:text-gray-400 mb-3">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="text-sm">{community.address || `${community.city}, ${community.state}`}</span>
                      </div>
                      
                      {/* Care Types */}
                      {community.careTypes && community.careTypes.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {community.careTypes.slice(0, 3).map((type, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {type}
                            </Badge>
                          ))}
                          {community.careTypes.length > 3 && (
                            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                              +{community.careTypes.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Pricing Section */}
                    <div className="lg:w-64 lg:pl-6 lg:border-l border-gray-200 dark:border-gray-700">
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
                        <div className="text-center">
                          {displayPrice === 'Contact for Pricing' ? (
                            <>
                              <div className="mb-2">
                                <Phone className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto" />
                              </div>
                              <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                Call for Pricing
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Personalized quotes available</p>
                            </>
                          ) : (
                            <>
                              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                {displayPrice}
                              </div>
                              {hasAuthenticPricing ? (
                                <div className="flex items-center justify-center">
                                  <Badge className="bg-green-600 hover:bg-green-700 text-white border-0 text-xs">
                                    <Zap className="h-3 w-3 mr-1" />
                                    Official HUD Pricing
                                  </Badge>
                                </div>
                              ) : (
                                <p className="text-xs text-gray-600 dark:text-gray-400">Estimated pricing</p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Occupancy Info or Alternative Info */}
                      {hasOccupancyData ? (
                        <div className="mt-3 text-center">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {community.displayAvailability?.occupancyDisplay}
                          </div>
                          {community.displayAvailability?.unitsDisplay && (
                            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {community.displayAvailability.unitsDisplay}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="mt-3 space-y-2">
                          {community.transparencyScore && (
                            <div className="text-center">
                              <div className="text-xs text-gray-600 dark:text-gray-400">Transparency Score</div>
                              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{community.transparencyScore}%</div>
                            </div>
                          )}
                          {!community.transparencyScore && community.zipCode && (
                            <div className="text-center">
                              <div className="text-xs text-gray-600 dark:text-gray-400">Zip Code</div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{community.zipCode}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {community.rating && (
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="font-medium">{community.rating.toFixed(1)}</span>
                        {community.reviewCount && (
                          <span className="ml-1">({community.reviewCount} reviews)</span>
                        )}
                      </div>
                    )}
                    
                    {community.totalUnits && (
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-1" />
                        <span>{community.totalUnits} units</span>
                      </div>
                    )}
                    
                    {community.occupancyRate && (
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{Math.round(community.occupancyRate)}% occupied</span>
                      </div>
                    )}
                  </div>

                  {/* Additional Badges Row */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {/* Transparency Badges */}
                    {community.transparencyBadges && community.transparencyBadges.length > 0 && (
                      <>
                        {community.transparencyBadges.slice(0, 3).map((badge, idx) => (
                          <Badge 
                            key={idx} 
                            className={`text-xs ${badge.color === 'gold' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border border-yellow-300' : 
                                                  badge.color === 'silver' ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-300' :
                                                  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}
                          >
                            <span className="mr-1">{badge.icon}</span>
                            {badge.name}
                          </Badge>
                        ))}
                      </>
                    )}
                    
                    {/* Quality Indicators */}
                    {community.dataQuality?.qualityScore && community.dataQuality.qualityScore >= 80 && (
                      <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified Data
                      </Badge>
                    )}
                    
                    {/* HUD Property */}
                    {community.hudPropertyId && (
                      <Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        <Shield className="h-3 w-3 mr-1" />
                        HUD Certified
                      </Badge>
                    )}
                    
                    {/* High Senior Percentage */}
                    {community.seniorPercentage && community.seniorPercentage >= 70 && (
                      <Badge className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        <Award className="h-3 w-3 mr-1" />
                        {Math.round(community.seniorPercentage)}% Senior
                      </Badge>
                    )}
                    
                    {/* Community Size */}
                    {community.sizeCategory && (
                      <Badge className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                        <Sparkles className="h-3 w-3 mr-1" />
                        {community.sizeCategory} Community
                      </Badge>
                    )}
                  </div>

                  {/* Description */}
                  {community.description && (
                    <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2 mb-4">
                      {community.description}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link 
                    href={`/communities/${community.id}`}
                    className="flex-1 min-w-32"
                  >
                    <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
                      View Details
                    </button>
                  </Link>
                  <button className="flex-1 min-w-32 border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 hover:text-white dark:hover:bg-blue-400 dark:hover:text-white transition-all duration-200">
                    Schedule Tour
                  </button>
                  <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors">
                    Call Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get availability color for other variants
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

  // Standard card layout for featured, coastal, hud, and other variants
  const cardClass = variant === 'featured' || variant === 'coastal' || variant === 'hud'
    ? "overflow-hidden flex-shrink-0 w-56 h-[30rem] animate-float dark:bg-gray-700"
    : "group hover:shadow-lg transition-all duration-200";

  if (variant === 'featured' || variant === 'coastal' || variant === 'hud') {
    return (
      <Link href={`/community/${community.id}`}>
        <Card className={cardClass} style={{animationDelay: `${index * 0.2}s`}}>
          <div className="relative">
            <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center">
              {community.photos && community.photos.length > 0 ? (
                <img 
                  src={community.photos[0]} 
                  alt={community.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <div className="text-2xl mb-2">📷</div>
                  <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Photos Coming Soon</div>
                  <div className="text-xs text-blue-600 dark:text-blue-300">Verifying authentic images</div>
                </div>
              )}
            </div>
            
            {/* Heart Icon */}
            <div className="absolute top-3 right-3">
              <div className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-gray-600" />
              </div>
            </div>
            
            {/* Only show verified occupancy data if available */}
            {community.occupancyRateHud && (
              <Badge className="absolute top-3 left-3 bg-gray-600 text-white text-xs px-2 py-1 font-medium">
                {Math.round(100 - parseFloat(community.occupancyRateHud))}% Occupancy
              </Badge>
            )}
            
            {/* Price Badge */}
            <Badge className="absolute bottom-3 left-3 bg-gray-900 text-white text-xs px-2 py-1 font-medium">
              {community.priceRange?.min ? `$${(community.priceRange.min / 1000).toFixed(1)}K+` : displayPrice}
              {!isHudProperty && (
                <span className="text-xs text-gray-300 ml-1 font-normal">est.</span>
              )}
            </Badge>
            
            {/* Only show HUD badge if it's a HUD property */}
            {community.hudPropertyId && (
              <Badge className="absolute bottom-3 right-3 bg-blue-600 text-white text-xs px-2 py-1 font-medium">
                HUD Property
              </Badge>
            )}
            {/* Only show coastal view for actually coastal communities */}
            {variant === 'coastal' && (
              <Badge className="absolute bottom-3 right-3 bg-blue-600 text-white text-xs px-2 py-1 font-medium">
                🌊 Coastal Area
              </Badge>
            )}
          </div>
          
          <CardContent className="p-3">
            {/* HUD Badge - Moved to top of text area */}
            {variant === 'hud' && (
              <Badge className="bg-green-600 text-white text-xs px-2 py-1 font-medium mb-2">
                🏛️ HUD Official
              </Badge>
            )}
            {/* Real Occupancy Data if available */}
            {(community.occupancyRateHud || community.totalUnitsHud) && (
              <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 font-medium mb-2">
                {community.occupancyRateHud && (
                  <span className="mr-2">
                    {Math.round(parseFloat(community.occupancyRateHud))}% occupied
                  </span>
                )}
                {community.totalUnitsHud && (
                  <span>• {community.totalUnitsHud} units</span>
                )}
              </div>
            )}
            
            {/* Name - Enhanced for HUD variant, moved before price */}
            <div className={`${variant === 'hud' ? 'text-base font-bold bg-green-50 dark:bg-green-900/20 rounded px-2 py-1' : 'text-sm font-medium'} text-gray-900 dark:text-gray-100 mb-2 ${variant === 'hud' ? 'line-clamp-2' : 'line-clamp-1'}`}>
              {community.name}
            </div>
            
            {/* Price */}
            <div className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {variant === 'hud' ? (
                <>
                  <div className="text-sm text-green-600 dark:text-green-400 font-medium">HUD Rate: {displayPrice}</div>
                </>
              ) : (
                <>
                  <span className="text-sm">Starting at</span> {displayPrice}
                  {!isHudProperty && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1 font-normal">est.</span>
                  )}
                </>
              )}
            </div>
            
            {/* Care Type */}
            <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
              {community.careTypes && community.careTypes.length > 0 ? 
                community.careTypes[0] : 
                'Senior Living'
              }{community.hudPropertyId && ' • HUD Property'}
            </div>
            
            {/* Address - Simplified for HUD cards */}
            <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">
              {variant === 'hud' ? 
                `${community.city}, ${community.state}` :
                `${community.address || community.city}, ${community.state} ${community.zipCode || ''}`
              }
            </div>
            
            {/* Only show actual regional info for coastal areas */}
            {variant === 'coastal' && (
              <div className="mb-2">
                <Badge className="bg-cyan-600/90 text-white text-xs px-2 py-1 font-medium">
                  Coastal Region
                </Badge>
              </div>
            )}
            {/* Only show government source badge for HUD properties */}
            {community.hudPropertyId && (
              <div className="mb-2">
                <Badge className="bg-green-600/90 text-white text-xs px-2 py-1 font-medium">
                  Government Source
                </Badge>
              </div>
            )}
            
            {/* Enhanced Features Row */}
            <div className="space-y-1 text-xs">
              {/* Rating and Live Data Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  {community.rating && (
                    <>
                      <Star className="h-3 w-3 text-yellow-400 mr-1" />
                      <span>{typeof community.rating === 'number' ? community.rating.toFixed(1) : parseFloat(community.rating).toFixed(1)}</span>
                    </>
                  )}
                </div>
                {isHudProperty && (
                  <div className="text-green-600 dark:text-green-400 font-medium">
                    ✓ Live Data
                  </div>
                )}
              </div>
              
              {/* HUD-specific details */}
              {variant === 'hud' && (
                <>
                  {/* Occupancy Rate */}
                  {community.occupancyRate && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Occupancy:</span>
                      <span className="text-gray-900 dark:text-white font-medium">{Math.round(community.occupancyRate)}%</span>
                    </div>
                  )}
                  
                  {/* Total Units */}
                  {community.totalUnits && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Units:</span>
                      <span className="text-gray-900 dark:text-white font-medium">{community.totalUnits} total</span>
                    </div>
                  )}
                  
                  {/* Size Category */}
                  {community.sizeCategory && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Size:</span>
                      <span className="text-gray-900 dark:text-white font-medium capitalize">{community.sizeCategory}</span>
                    </div>
                  )}
                  
                  {/* Senior Percentage */}
                  {community.seniorPercentage && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Seniors:</span>
                      <span className="text-gray-900 dark:text-white font-medium">{Math.round(community.seniorPercentage)}%</span>
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* View Details Button */}
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
              <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2 px-3 rounded-lg font-semibold text-xs transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
                View Full Details →
              </button>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Standard fallback for other variants
  return (
    <Card className={cardClass}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center">
            {community.photos && community.photos.length > 0 ? (
              <img 
                src={community.photos[0]} 
                alt={community.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Home className="h-8 w-8 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-1 mb-1">
              {community.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {community.city}, {community.state}
            </p>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {displayPrice}
            </div>
          </div>
          {isHudProperty && (
            <Badge className="bg-green-600 text-white">
              <Zap className="h-3 w-3 mr-1" />
              LIVE
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}