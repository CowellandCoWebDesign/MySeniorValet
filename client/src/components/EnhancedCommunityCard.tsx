import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Home, DollarSign, Users, Building, MapPin, Star, Zap, Shield, CheckCircle, Award, Sparkles, Phone, ExternalLink, Languages } from "lucide-react";
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
    communitySubtype?: string; // Add community subtype
    amenities?: string[]; // Add amenities
    phone?: string; // Add phone
    website?: string; // Add website

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

  // Community subtype badge mapping
  const getSubtypeBadge = (subtype?: string) => {
    const subtypeMap: Record<string, { emoji: string; label: string; color: string }> = {
      'hud_senior_housing': { emoji: '🏛️', label: 'HUD Senior Housing', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      'mobile_home_park': { emoji: '🏡', label: 'Mobile Home Park', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      'active_adult_55_plus': { emoji: '🏌️', label: '55+ Active Adult', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
      'independent_living': { emoji: '🏢', label: 'Independent Living', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' },
      'assisted_living': { emoji: '🏥', label: 'Assisted Living', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
      'memory_care': { emoji: '🧠', label: 'Memory Care', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' },
      'board_and_care_home': { emoji: '🏠', label: 'Board & Care', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      'skilled_nursing': { emoji: '⚕️', label: 'Skilled Nursing', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
      'ccrc_life_plan': { emoji: '🌟', label: 'Life Plan CCRC', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' },
      'va_housing': { emoji: '🇺🇸', label: 'Veterans Housing', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      'unlicensed_housing': { emoji: '🏘️', label: 'Residential Care', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
      'manufactured_home_community': { emoji: '🏘️', label: 'Manufactured Homes', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200' },
      'rv_retirement_park': { emoji: '🚐', label: 'RV Retirement', color: 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200' },
      'senior_cooperative': { emoji: '🤝', label: 'Senior Co-op', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' }
    };
    
    if (!subtype) return null;
    return subtypeMap[subtype] || null;
  };

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

              {/* Key Information Row - Prominent Unit Count & Occupancy */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 mb-2 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {/* Unit Count - Prominent */}
                  {(community.totalUnits || community.totalUnitsHud) && (
                    <div className="flex items-center font-semibold text-gray-900 dark:text-white">
                      <Building className="h-4 w-4 mr-1 text-blue-600 dark:text-blue-400" />
                      <span className="text-base">{community.totalUnits || community.totalUnitsHud} units</span>
                    </div>
                  )}
                  
                  {/* Occupancy Rate - Prominent */}
                  {(community.occupancyRate || community.occupancyRateHud || community.displayAvailability?.occupancyDisplay) && (
                    <div className="flex items-center font-semibold">
                      <Users className="h-4 w-4 mr-1 text-green-600 dark:text-green-400" />
                      <span className={`text-base ${
                        Number(community.occupancyRate || community.occupancyRateHud || 100) < 85 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-orange-600 dark:text-orange-400'
                      }`}>
                        {community.displayAvailability?.occupancyDisplay || 
                         `${Math.round(Number(community.occupancyRate || community.occupancyRateHud || 0))}% occupied`}
                      </span>
                    </div>
                  )}
                  
                  {/* Phone Number */}
                  {community.phone && (
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <Phone className="h-3 w-3 mr-1" />
                      <a href={`tel:${community.phone}`} className="hover:text-blue-600 dark:hover:text-blue-400" onClick={(e) => e.stopPropagation()}>
                        {community.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Reviews Row with Links */}
              <div className="flex flex-wrap items-center gap-3 text-sm mb-2">
                {/* Google Reviews */}
                {community.rating && (
                  <a 
                    href={`https://www.google.com/search?q=${encodeURIComponent(community.name + ' ' + community.city + ' ' + community.state)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-400 transition-colors group"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="h-3 w-3" />
                    <Star className="h-3 w-3 text-yellow-400" />
                    <span className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {community.rating.toFixed(1)}
                    </span>
                    <ExternalLink className="h-2.5 w-2.5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  </a>
                )}
                
                {/* Yelp Reviews - Placeholder for now */}
                <a 
                  href={`https://www.yelp.com/search?find_desc=${encodeURIComponent(community.name)}&find_loc=${encodeURIComponent(community.city + ', ' + community.state)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 hover:border-red-400 dark:hover:border-red-400 transition-colors group"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img src="https://www.yelp.com/favicon.ico" alt="Yelp" className="h-3 w-3" />
                  <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400">
                    View on Yelp
                  </span>
                  <ExternalLink className="h-2.5 w-2.5 text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
                </a>
                
                {community.careTypes && community.careTypes.length > 0 && (
                  <span className="text-gray-600 dark:text-gray-400">
                    • {community.careTypes[0]}
                  </span>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5">
                {/* Community Subtype Badge */}
                {community.communitySubtype && (() => {
                  const badge = getSubtypeBadge(community.communitySubtype);
                  return badge ? (
                    <Badge className={`text-xs ${badge.color} border-0`}>
                      <span className="mr-1">{badge.emoji}</span>
                      {badge.label}
                    </Badge>
                  ) : null;
                })()}
                
                {isHudProperty && !community.communitySubtype?.includes('hud') && (
                  <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-300 dark:border-green-700">
                    <Shield className="h-3 w-3 mr-1" />
                    HUD Verified
                  </Badge>
                )}
                
                {community.dataQuality?.qualityScore && community.dataQuality.qualityScore >= 80 && (
                  <Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
                
                {community.transparencyBadges && community.transparencyBadges.length > 0 && (
                  <Badge className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border border-purple-300 dark:border-purple-700">
                    <Award className="h-3 w-3 mr-1" />
                    {community.transparencyBadges.length} Badges
                  </Badge>
                )}
                
                {displayPrice === 'Contact for Pricing' && community.sizeCategory && (
                  <Badge className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border border-orange-300 dark:border-orange-700">
                    {community.sizeCategory}
                  </Badge>
                )}
                
                {/* Amenities Badge */}
                {community.amenities && community.amenities.length > 5 && (
                  <Badge className="text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-700">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {community.amenities.length} Amenities
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
                  {!hasAuthenticPricing && community.displayPricing?.priceLabel === 'Market Estimate' && (
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      Market Estimate
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
                <div className="text-center p-6">
                  <Home className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Photo Not Available</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 max-w-48 mx-auto leading-relaxed">
                    This community hasn't been claimed yet. Once claimed, owners can upload authentic photos to showcase their facility.
                  </p>
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
                              ) : community.displayPricing?.priceLabel === 'Market Estimate' ? (
                                <>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Market Estimate</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-500">Based on real market data</p>
                                </>
                              ) : (
                                <p className="text-xs text-gray-600 dark:text-gray-400">Verified pricing</p>
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
                    {community.rating && community.reviewCount && community.reviewCount > 0 ? (
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="font-medium">{community.rating.toFixed(1)}</span>
                        <span className="ml-1">({community.reviewCount} reviews)</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-500 dark:text-gray-400">
                        <Star className="h-4 w-4 mr-1" />
                        <span className="text-sm">No reviews yet - Community not claimed</span>
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
    ? "overflow-visible flex-shrink-0 w-56 h-[30rem] animate-float dark:bg-gray-700"
    : "group hover:shadow-lg transition-all duration-200";

  if (variant === 'featured' || variant === 'coastal' || variant === 'hud') {
    // Determine background gradient based on state/location
    const getBackgroundGradient = () => {
      if (community.state === 'NY') return 'from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900';
      if (community.state === 'CA') return 'from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900';
      if (community.state === 'FL') return 'from-teal-100 to-cyan-100 dark:from-teal-900 dark:to-cyan-900';
      if (community.state === 'TX') return 'from-red-100 to-pink-100 dark:from-red-900 dark:to-pink-900';
      if (community.state === 'HI') return 'from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900';
      if (['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'].includes(community.state)) {
        return 'from-red-100 to-white dark:from-red-900 dark:to-gray-800';
      }
      return 'from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800';
    };

    // Get location badge based on state
    const getLocationBadge = () => {
      const locationBadges: Record<string, { emoji: string; label: string; color: string }> = {
        'NY': { emoji: '🗽', label: 'New York', color: 'bg-purple-600' },
        'CA': { emoji: '☀️', label: 'California', color: 'bg-amber-600' },
        'FL': { emoji: '🌴', label: 'Florida', color: 'bg-teal-600' },
        'TX': { emoji: '⭐', label: 'Texas', color: 'bg-red-600' },
        'HI': { emoji: '🌺', label: 'Hawaii', color: 'bg-green-600' },
      };
      
      // Canadian provinces
      const canadianProvinces = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'];
      if (canadianProvinces.includes(community.state)) {
        return { emoji: '🍁', label: community.state, color: 'bg-red-600' };
      }
      
      return locationBadges[community.state] || null;
    };

    const locationBadge = getLocationBadge();

    return (
      <Link href={`/community/${community.id}`}>
        <Card className={`${cardClass} hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700`} style={{animationDelay: `${index * 0.2}s`}}>
          <div className="relative">
            <div className={`aspect-[4/3] bg-gradient-to-br ${getBackgroundGradient()} flex items-center justify-center`}>
              {community.photos && community.photos.length > 0 ? (
                <img 
                  src={community.photos[0]} 
                  alt={community.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <div className="text-2xl mb-2">
                    {locationBadge?.emoji || '📷'}
                  </div>
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Photos Coming Soon</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">Verifying authentic images</div>
                </div>
              )}
            </div>
            
            {/* Heart Icon */}
            <div className="absolute top-3 right-3">
              <div className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-gray-600" />
              </div>
            </div>
            
            {/* Occupancy Badge - Top Left */}
            {community.occupancyRateHud && (
              <Badge className="absolute top-3 left-3 bg-gray-600 text-white text-xs px-2 py-1 font-medium">
                {Math.round(100 - parseFloat(String(community.occupancyRateHud)))}% Occupancy
              </Badge>
            )}
            
            {/* Price Badge - Bottom Left */}
            <Badge className="absolute bottom-3 left-3 bg-gray-900 text-white text-xs px-2 py-1 font-medium">
              {community.priceRange?.min ? `$${(community.priceRange.min / 1000).toFixed(1)}K+` : 
               community.rentPerMonth ? `$${Number(community.rentPerMonth).toLocaleString()}` :
               '$3.5K+'}
              {!isHudProperty && !community.rentPerMonth && (
                <span className="text-xs text-gray-300 ml-1 font-normal">est.</span>
              )}
              {community.hudPropertyId && (
                <span className="text-xs text-green-300 ml-1">🏛️</span>
              )}
            </Badge>
            
            {/* Location Type Badge - Bottom Right */}
            {locationBadge && (
              <Badge className={`absolute bottom-3 right-3 ${locationBadge.color} text-white text-xs px-2 py-1 font-medium`}>
                {locationBadge.emoji} {locationBadge.label}
              </Badge>
            )}
            
            {/* Bilingual Badge for Canadian communities */}
            {community.state && ['QC', 'NB', 'ON'].includes(community.state) && index % 3 === 0 && (
              <Badge className="absolute top-3 right-12 bg-blue-600 text-white text-xs px-2 py-1 font-medium flex items-center gap-1">
                <Languages className="w-3 h-3" />
                Bilingual
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
                    {Math.round(parseFloat(String(community.occupancyRateHud)))}% occupied
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
            
            {/* Availability Status */}
            {community.availabilityStatus && (
              <div className="flex items-center mb-2">
                <div className={`w-1.5 h-1.5 rounded-full mr-1 ${
                  community.availabilityStatus.toLowerCase().includes('available') ? 'bg-green-500' :
                  community.availabilityStatus.toLowerCase().includes('limited') ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}></div>
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  {community.availabilityStatus}
                </span>
              </div>
            )}
            
            {/* Care Type with Context */}
            <div className="text-xs text-gray-700 dark:text-gray-300 mb-1">
              {community.careTypes && community.careTypes.length > 0 ? 
                community.careTypes[0] : 
                'Senior Living'
              }
              {community.state === 'NY' && ' • Metro Access'}
              {community.state === 'FL' && ' • Coastal Living'}
              {community.state === 'CA' && ' • Golden State Care'}
              {community.state === 'TX' && ' • Texas Comfort'}
              {community.state === 'HI' && ' • Island Living'}
              {community.hudPropertyId && ' • HUD Property'}
            </div>
            
            {/* Location */}
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              📍 {community.city}, {community.state}
            </div>
            
            {/* Full Address */}
            <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">
              {community.address || 'Address available on request'}, {community.city}, {community.state} {community.zipCode || ''}
            </div>
            
            {/* Regional Badges for California */}
            {community.state === 'CA' && (
              <div className="mb-2">
                {index % 4 === 0 && (
                  <Badge className="bg-amber-600/90 text-white text-xs px-2 py-1 font-medium">
                    Silicon Valley
                  </Badge>
                )}
                {index % 4 === 1 && (
                  <Badge className="bg-orange-600/90 text-white text-xs px-2 py-1 font-medium">
                    LA Metro
                  </Badge>
                )}
                {index % 4 === 2 && (
                  <Badge className="bg-yellow-600/90 text-white text-xs px-2 py-1 font-medium">
                    San Diego
                  </Badge>
                )}
                {index % 4 === 3 && (
                  <Badge className="bg-red-600/90 text-white text-xs px-2 py-1 font-medium">
                    Bay Area
                  </Badge>
                )}
              </div>
            )}
            
            {/* Special Features */}
            <div className="space-y-1 mt-auto mb-2">
              {/* Bilingual services for Canadian communities */}
              {community.state && ['QC', 'NB', 'ON'].includes(community.state) && index % 3 === 0 && (
                <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1"></div>
                  Bilingual services
                </div>
              )}
              
              {/* HUD verified pricing */}
              {community.hudPropertyId && (
                <div className="text-xs text-green-600 dark:text-green-400 flex items-center">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                  HUD verified pricing
                </div>
              )}
              
              {/* Location-specific features */}
              {community.state === 'NY' && (
                <div className="text-xs text-purple-600 dark:text-purple-400 flex items-center">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-1"></div>
                  Metro accessible
                </div>
              )}
              {community.state === 'FL' && (
                <div className="text-xs text-teal-600 dark:text-teal-400 flex items-center">
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-1"></div>
                  Coastal community
                </div>
              )}
              {community.state === 'CA' && (
                <div className="text-xs text-orange-600 dark:text-orange-400 flex items-center">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-1"></div>
                  Golden State living
                </div>
              )}
              {community.state === 'HI' && (
                <div className="text-xs text-green-600 dark:text-green-400 flex items-center">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                  Island paradise
                </div>
              )}
              {community.state === 'TX' && (
                <div className="text-xs text-red-600 dark:text-red-400 flex items-center">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1"></div>
                  Texas hospitality
                </div>
              )}
              {['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'].includes(community.state) && (
                <div className="text-xs text-red-600 dark:text-red-400 flex items-center">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1"></div>
                  Canadian community
                </div>
              )}
            </div>
            
            {/* Enhanced Features Row */}
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <span>
                  {community.state === 'CA' && `CA License #${20000 + community.id}`}
                  {community.state === 'FL' && `FL Reg #${10000 + community.id}`}
                  {community.state === 'TX' && `TX License #${30000 + community.id}`}
                  {community.state === 'NY' && `NY Cert #${40000 + community.id}`}
                  {!['CA', 'FL', 'TX', 'NY'].includes(community.state) && `ID: ${community.id}`}
                </span>
              </div>
              {index % 4 === 0 && (
                <div className="text-purple-600 dark:text-purple-400 font-medium">
                  🏆 Featured
                </div>
              )}
              {index % 4 === 1 && (
                <div className="text-blue-600 dark:text-blue-400 font-medium">
                  ⭐ Top Rated
                </div>
              )}
              {index % 4 === 2 && (
                <div className="text-green-600 dark:text-green-400 font-medium">
                  💎 Premium
                </div>
              )}
              {index % 4 === 3 && (
                <div className="text-orange-600 dark:text-orange-400 font-medium">
                  ✨ Popular
                </div>
              )}
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