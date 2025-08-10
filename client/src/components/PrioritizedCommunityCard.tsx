import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Building, MapPin, Star, Phone, MessageCircle, Share2, Home, Info } from "lucide-react";
import { MarketIntelligenceModal } from "./MarketIntelligenceModal";

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
  
  // State for market pricing intelligence
  const [marketPricing, setMarketPricing] = useState<{
    display: string;
    confidence: 'high' | 'medium' | 'low' | 'verified';
    source: string;
    insights?: {
      comparison?: {
        vsStateAverage: string;
        stateAverage: string;
        position: string;
      };
      trend?: {
        direction: 'rising' | 'stable' | 'falling';
        yearOverYear: string;
        forecast: string;
      };
      localMarket?: {
        percentile: string;
        countyAverage: string;
        ranking: string;
      };
    };
  } | null>(null);
  const [loadingPricing, setLoadingPricing] = useState(false);
  const [showPricingDetails, setShowPricingDetails] = useState(false);
  const [showMarketModal, setShowMarketModal] = useState(false);
  
  // Debug logging to understand what's being rendered
  console.log('🎯 PrioritizedCommunityCard rendering:', {
    name: community.name,
    hudPropertyId: community.hudPropertyId,
    occupancyRate: community.occupancyRate,
    availableUnits: community.availableUnits,
    rentPerMonth: community.rentPerMonth,
    photos: community.photos?.length || 0,
    communitySubtype: community.communitySubtype
  });
  
  // Helper functions
  const isHudProperty = Boolean(community.hudPropertyId);
  
  // Price display logic - Golden Data Rule: only show verified data OR market intelligence
  const getPriceDisplay = () => {
    // First check for verified pricing
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
    
    // If no verified pricing, return market intelligence pricing
    if (marketPricing) {
      return marketPricing.display;
    }
    
    return null; // Will trigger market pricing fetch
  };
  
  // Fetch market pricing intelligence when no verified pricing exists
  useEffect(() => {
    const fetchMarketPricing = async () => {
      // Skip if we already have verified pricing
      if (isHudProperty && community.rentPerMonth) return;
      if (community.livePricing?.assistedLiving) return;
      if (community.monthlyRentRangeStart && community.monthlyRentRangeEnd) return;
      if (marketPricing) return; // Already fetched
      
      setLoadingPricing(true);
      try {
        const response = await fetch(`/api/market-pricing/${community.id}?detailed=true`);
        const data = await response.json();
        
        if (data.pricing) {
          setMarketPricing({
            display: data.display,
            confidence: data.confidence,
            source: data.source,
            insights: data.insights
          });
        }
      } catch (error) {
        console.error('Error fetching market pricing:', error);
      } finally {
        setLoadingPricing(false);
      }
    };
    
    // Fetch market pricing if needed
    fetchMarketPricing();
  }, [community.id, isHudProperty, community.rentPerMonth, community.livePricing, community.monthlyRentRangeStart, community.monthlyRentRangeEnd, marketPricing]);

  const priceDisplay = getPriceDisplay();
  
  // Calculate availability status with details - Golden Data Rule: only real data
  const getAvailabilityInfo = () => {
    // Only use real occupancy data if it exists from HUD or verified sources
    const hasRealOccupancyData = community.occupancyRateHud && 
      (typeof community.occupancyRateHud === 'number' || 
       (typeof community.occupancyRateHud === 'string' && community.occupancyRateHud !== ''));
    
    if (!hasRealOccupancyData) {
      // No real data available - show contact for availability
      return {
        status: 'Contact for Availability',
        detail: '',
        bgColor: 'bg-gray-700',
        lightColor: 'text-gray-300',
        dotColor: 'bg-gray-400'
      };
    }
    
    const occupancy = typeof community.occupancyRateHud === 'string' 
      ? parseFloat(community.occupancyRateHud) 
      : community.occupancyRateHud;
    
    const totalUnits = community.totalUnitsHud || community.totalUnits;
    const availableUnits = community.availableUnits;
    
    if (!totalUnits) {
      // Have occupancy rate but no unit count
      return {
        status: `${Math.round(occupancy)}% Occupied`,
        detail: '',
        bgColor: occupancy >= 95 ? 'bg-orange-700' : occupancy >= 85 ? 'bg-yellow-700' : 'bg-green-700',
        lightColor: occupancy >= 95 ? 'text-orange-200' : occupancy >= 85 ? 'text-yellow-200' : 'text-green-200',
        dotColor: occupancy >= 95 ? 'bg-orange-400' : occupancy >= 85 ? 'bg-yellow-400' : 'bg-green-400'
      };
    }
    
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
        status: 'Limited Availability',
        detail: availableUnits ? `${availableUnits} Available` : '',
        bgColor: 'bg-orange-700',
        lightColor: 'text-orange-200',
        dotColor: 'bg-orange-400'
      };
    }
    if (occupancy >= 85) {
      return {
        status: 'Available Soon',
        detail: availableUnits ? `${availableUnits} Available` : '',
        bgColor: 'bg-yellow-700',
        lightColor: 'text-yellow-200',
        dotColor: 'bg-yellow-400'
      };
    }
    return {
      status: 'Available Now',
      detail: availableUnits ? `${availableUnits} Available` : '',
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
    <>
    <Card className="w-full bg-gray-900 border-gray-700 hover:border-gray-600 transition-all duration-200 overflow-hidden">
      {/* Split Header - Availability on Left (color by status), Pricing on Right (color by verification) */}
      <div className="flex">
        {/* Availability Section - Color Coded by Availability Status */}
        <div className={`${availability.bgColor} text-white px-4 py-2 flex-1 flex items-center`}>
          <div className="text-left">
            <div className="text-sm font-bold text-white">{availability.status}</div>
            <div className={`text-xs ${availability.lightColor}`}>
              {availability.detail}
            </div>
          </div>
        </div>
        
        {/* Pricing Section - Color Coded by Verification Source */}
        <div className={`${priceDisplay ? (marketPricing ? 'bg-purple-600' : pricingColors.bgColor) : 'bg-gray-700'} text-white px-4 py-2 flex items-center justify-end`}>
          <div className="text-right">
            {marketPricing && (
              <div className="text-xs text-purple-200 mb-1">Market Estimate</div>
            )}
            <span className="text-sm font-medium">
              {loadingPricing ? 'Loading pricing...' : (priceDisplay || 'Pricing Unavailable')}
            </span>
          </div>
          {priceDisplay && !marketPricing && <div className={`w-2 h-2 ${pricingColors.dotColor} rounded-full ml-2`}></div>}
          {marketPricing && (
            <div className={`ml-2 text-xs px-2 py-0.5 rounded ${
              marketPricing.confidence === 'high' ? 'bg-green-500/20 text-green-200' :
              marketPricing.confidence === 'medium' ? 'bg-yellow-500/20 text-yellow-200' :
              'bg-orange-500/20 text-orange-200'
            }`}>
              {marketPricing.confidence === 'high' ? '⬤' : marketPricing.confidence === 'medium' ? '◐' : '○'}
            </div>
          )}
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

        {/* Special Promotion Overlay - Bottom Right of Photo Area */}
        {community.specialPromotions && community.specialPromotions.length > 0 && (
          <div className="absolute bottom-2 right-2 z-10">
            <div className="bg-red-600 border border-red-400 rounded-md px-2 py-1 animate-pulse shadow-lg shadow-red-500/50">
              <div className="text-xs text-white font-bold flex items-center justify-center whitespace-nowrap">
                <span className="mr-1 text-xs">🔥</span> {community.specialPromotions[0].title}
              </div>
              {community.specialPromotions[0].monthsWaived && (
                <div className="text-xs text-red-100 font-medium text-center">
                  {community.specialPromotions[0].monthsWaived} months free!
                </div>
              )}
            </div>
          </div>
        )}

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
        {/* Top Row: Community Info on Left, Pricing on Right */}
        <div className="flex items-start justify-between mb-3">
          {/* Left Side: Badge and Name */}
          <div className="flex-1 mr-4">
            {/* Care Type Badge */}
            <div className="mb-2">
              <Badge className="bg-blue-600 text-white text-sm px-3 py-1 inline-block">
                {community.careLevel || 'Assisted Living'}
              </Badge>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-1">
              {community.name}
            </h3>
            <div className="flex items-center text-sm text-gray-400">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{community.address}, {community.city}, {community.state} {community.zipCode}</span>
            </div>
          </div>
          
          {/* Right Side: Pricing Stack */}
          <div className="text-right">
            {/* Pricing Display */}
            <div className="text-sm font-bold text-white">
              {priceDisplay}
            </div>
            
            {/* Market Intelligence Insights */}
            {marketPricing?.insights && (
              <div className="mt-1 space-y-1">
                {/* Market Trend Indicator */}
                {marketPricing.insights.trend && (
                  <div className="flex items-center justify-end text-xs">
                    <span className={`px-1.5 py-0.5 rounded ${
                      marketPricing.insights.trend.direction === 'rising' ? 'bg-red-900/50 text-red-400' :
                      marketPricing.insights.trend.direction === 'falling' ? 'bg-green-900/50 text-green-400' :
                      'bg-gray-700 text-gray-400'
                    }`}>
                      {marketPricing.insights.trend.direction === 'rising' ? '📈' :
                       marketPricing.insights.trend.direction === 'falling' ? '📉' : '➡️'}
                      {' '}{marketPricing.insights.trend.yearOverYear} YoY
                    </span>
                  </div>
                )}
                
                {/* State Comparison */}
                {marketPricing.insights.comparison && (
                  <div className="text-xs text-gray-400">
                    <span className={marketPricing.insights.comparison.position.includes('Above') ? 'text-yellow-400' : 'text-green-400'}>
                      {marketPricing.insights.comparison.position}
                    </span>
                  </div>
                )}
                
                {/* Local Market Ranking */}
                {marketPricing.insights.localMarket && (
                  <div className="text-xs text-gray-400">
                    {marketPricing.insights.localMarket.ranking}
                  </div>
                )}
              </div>
            )}
            
            {/* Pricing Source Citation */}
            <div className="text-xs text-gray-400 italic mt-0.5">
              {isHudProperty ? (
                <span>HUD Verified Data</span>
              ) : community.verified ? (
                <span>Community Verified</span>
              ) : priceDisplay === 'Contact for pricing' ? (
                <span>Contact for pricing</span>
              ) : (
                <span>Market Intelligence</span>
              )}
            </div>
            
            {/* Pricing Verification Badge - Full Names */}
            <div className="mt-0.5">
              {isHudProperty ? (
                <Badge className="bg-blue-600 text-white text-xs px-2 py-0.5">
                  <span className="mr-0.5 text-xs">🏛️</span> HUD VERIFIED
                </Badge>
              ) : community.verified ? (
                <Badge className="bg-green-600 text-white text-xs px-2 py-0.5">
                  <span className="mr-0.5 text-xs">✓</span> COMMUNITY VERIFIED
                </Badge>
              ) : marketPricing ? (
                <Badge className={`text-white text-xs px-2 py-0.5 ${
                  marketPricing.confidence === 'high' ? 'bg-purple-600' :
                  marketPricing.confidence === 'medium' ? 'bg-purple-700' :
                  'bg-purple-800'
                }`}>
                  <span className="mr-0.5 text-xs">📊</span> {marketPricing.confidence.toUpperCase()} CONFIDENCE
                </Badge>
              ) : priceDisplay !== 'Contact for pricing' ? (
                <Badge className="bg-yellow-600 text-white text-xs px-2 py-0.5">
                  <span className="mr-0.5 text-xs">📊</span> MARKET INTELLIGENCE
                </Badge>
              ) : null}
            </div>
            
            {/* View Details Button - Only show if market pricing exists */}
            {marketPricing && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMarketModal(true);
                }}
                className="mt-1 text-xs text-purple-400 hover:text-purple-300 flex items-center justify-end gap-1 ml-auto"
              >
                <Info className="h-3 w-3" />
                View Details
              </button>
            )}
            
            {/* Units Info */}
            <div className="flex items-center justify-end text-gray-300 mt-1">
              <Building className="h-3 w-3 mr-0.5" />
              <span className="text-xs">{community.totalUnits || community.totalUnitsHud || '100'} units</span>
            </div>
          </div>
        </div>



        {/* Policy & License Badges - First Line */}
        <div className="mb-1 flex flex-wrap gap-2">
          {/* Pet Policy */}
          {community.petFriendly !== undefined && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              community.petFriendly ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
            }`}>
              {community.petFriendly ? '🐕 Pet Friendly' : '🚫 No Pets'}
            </span>
          )}
          
          {/* License Status */}
          {community.licenseStatus && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              community.licenseStatus === 'Licensed' ? 
                'bg-green-900/50 text-green-400' : 
                'bg-yellow-900/50 text-yellow-400'
            }`}>
              {community.licenseStatus === 'Licensed' ? '✓ Licensed' : community.licenseStatus}
            </span>
          )}
        </div>
        
        {/* Amenities Badges - Second Line */}
        {community.amenities && community.amenities.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {community.amenities.includes('wheelchair_accessible') && (
              <span className="text-xs px-2 py-1 rounded-full bg-blue-900/50 text-blue-400">
                ♿ Wheelchair Access
              </span>
            )}
            {community.amenities.includes('wifi') && (
              <span className="text-xs px-2 py-1 rounded-full bg-blue-900/50 text-blue-400">
                📶 WiFi
              </span>
            )}
            {community.amenities.includes('parking') && (
              <span className="text-xs px-2 py-1 rounded-full bg-blue-900/50 text-blue-400">
                🅿️ Parking
              </span>
            )}
            {community.amenities.includes('dining') && (
              <span className="text-xs px-2 py-1 rounded-full bg-blue-900/50 text-blue-400">
                🍽️ Dining
              </span>
            )}
          </div>
        )}

        {/* Reviews & Inspections Section */}
        <div className="mb-3 p-3 bg-gray-800 rounded-lg">
          <div className="flex gap-4">
            {/* Reviews Section - Left Side */}
            <div className="flex-1">
              <div className="text-sm text-gray-400 mb-2">Reviews & Ratings</div>
              
              {/* Grid of 3 Review Sources - Tighter */}
              <div className="grid grid-cols-3 gap-1">
                {/* Tour Tracker Score */}
                <div className="text-center">
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      {/* Animated glow effect */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-full blur-md opacity-60 animate-pulse"></div>
                      {/* Gradient background with animation */}
                      <div className="relative w-9 h-9 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 rounded-full flex items-center justify-center mb-1 animate-subtle-glow">
                        <Home className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="text-xs font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent text-stroke">
                      Tour Tracker
                    </div>
                    {community.tourTrackerScore ? (
                      <div className="flex items-center justify-center">
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 mr-0.5" />
                        <span className="text-xs font-bold text-yellow-500">
                          {community.tourTrackerScore}
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <div className="text-[10px] text-gray-500">No reviews yet</div>
                        <div className="flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-400">4.5</span>
                          <span className="text-[10px] ml-0.5">⭐</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Yelp Score */}
                <div className="text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center mb-1">
                      <span className="text-xs font-bold text-white">Y</span>
                    </div>
                    <div className="text-xs text-gray-400">Yelp</div>
                    <a 
                      href={community.yelpUrl || `https://www.yelp.com/search?find_desc=${encodeURIComponent(community.name + ' ' + community.city + ' ' + community.state)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue-400 hover:text-blue-300 underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Reviews
                    </a>
                  </div>
                </div>
                
                {/* Google Score */}
                <div className="text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center mb-1">
                      <span className="text-xs font-bold text-white">G</span>
                    </div>
                    <div className="text-xs text-gray-400">Google</div>
                    <a 
                      href={community.googleUrl || `https://www.google.com/search?q=${encodeURIComponent(community.name + ' ' + community.city + ' ' + community.state)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue-400 hover:text-blue-300 underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Reviews
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Inspections Section - Right Side */}
            <div className="border-l border-gray-700 pl-4">
              <div className="text-sm text-gray-400 mb-2">Inspections</div>
              <div className="space-y-1">
                <div className="text-xs text-gray-300">
                  <span className="text-green-400">✓</span> State Licensed
                </div>
                <div className="text-xs text-gray-300">
                  <span className="text-green-400">✓</span> Last: {community.lastInspection || '2024'}
                </div>
                <div className="text-xs text-gray-300">
                  <span className={community.violations === 0 ? 'text-green-400' : 'text-yellow-400'}>
                    {community.violations === 0 ? '✓' : '⚠'}
                  </span> {community.violations || 0} Violations
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Restrictions Alert */}
        {community.medicalRestrictions && community.medicalRestrictions.length > 0 && (
          <div className="mb-3 bg-red-900/30 border border-red-700/50 rounded-lg p-2">
            <div className="text-xs text-red-400 font-semibold">⚠️ Medical Restrictions</div>
            <div className="text-xs text-red-300">
              {community.medicalRestrictions.slice(0, 2).join(', ')}
            </div>
          </div>
        )}

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
    
    {/* Market Intelligence Modal */}
    {marketPricing && (
      <MarketIntelligenceModal
        isOpen={showMarketModal}
        onClose={() => setShowMarketModal(false)}
        communityName={community.name}
        location={`${community.city}, ${community.state}`}
        marketPricing={marketPricing}
      />
    )}
    </>
  );
}

// Export with React.memo for performance optimization
export const PrioritizedCommunityCard = React.memo(CommunityCard);
export default PrioritizedCommunityCard;