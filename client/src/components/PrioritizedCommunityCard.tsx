import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Building, MapPin, Star, Phone, MessageCircle, Share2, Home, Info, Sparkles, DollarSign, Activity, Bed, Users } from "lucide-react";
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
  
  // State for handling broken images
  const [imageError, setImageError] = useState(false);
  
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
  
  // PERFORMANCE FIX: Disabled individual market pricing API calls
  // This was causing N+1 query problem with 20+ simultaneous API calls
  // Market pricing should be included in initial search results instead
  /*
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
  */

  const priceDisplay = getPriceDisplay();
  
  // Calculate availability status with details - Golden Data Rule: only real data
  const getAvailabilityInfo = () => {
    // Only use real occupancy data if it exists from HUD or verified sources
    const hasRealOccupancyData = community.occupancyRateHud && 
      (typeof community.occupancyRateHud === 'number' || 
       (typeof community.occupancyRateHud === 'string' && community.occupancyRateHud !== ''));
    
    if (!hasRealOccupancyData) {
      // No real data available - show unconfirmed
      return {
        status: 'Unconfirmed',
        detail: '',
        bgColor: 'bg-gray-700',
        lightColor: 'text-gray-300',
        dotColor: 'bg-gray-400'
      };
    }
    
    const occupancy = typeof community.occupancyRateHud === 'string' 
      ? parseFloat(community.occupancyRateHud) 
      : typeof community.occupancyRateHud === 'number' 
        ? community.occupancyRateHud 
        : undefined;
    
    const totalUnits = community.totalUnitsHud || community.totalUnits;
    const availableUnits = community.availableUnits;
    
    if (occupancy !== undefined && !totalUnits) {
      // Have occupancy rate but no unit count
      return {
        status: `${Math.round(occupancy)}% Occupied`,
        detail: '',
        bgColor: occupancy >= 95 ? 'bg-orange-700' : occupancy >= 85 ? 'bg-yellow-700' : 'bg-green-700',
        lightColor: occupancy >= 95 ? 'text-orange-200' : occupancy >= 85 ? 'text-yellow-200' : 'text-green-200',
        dotColor: occupancy >= 95 ? 'bg-orange-400' : occupancy >= 85 ? 'bg-yellow-400' : 'bg-green-400'
      };
    }
    
    if (occupancy !== undefined && occupancy >= 100) {
      return {
        status: 'Wait List',
        detail: community.waitListLength ? `${community.waitListLength} waiting` : 'Full',
        bgColor: 'bg-red-700',
        lightColor: 'text-red-200',
        dotColor: 'bg-red-400'
      };
    }
    if (occupancy !== undefined && occupancy >= 95) {
      return {
        status: 'Limited Availability',
        detail: availableUnits ? `${availableUnits} Available` : '',
        bgColor: 'bg-orange-700',
        lightColor: 'text-orange-200',
        dotColor: 'bg-orange-400'
      };
    }
    if (occupancy !== undefined && occupancy >= 85) {
      return {
        status: 'Available Soon',
        detail: availableUnits ? `${availableUnits} Available` : '',
        bgColor: 'bg-yellow-700',
        lightColor: 'text-yellow-200',
        dotColor: 'bg-yellow-400'
      };
    }
    if (occupancy !== undefined) {
      return {
        status: 'Available Now',
        detail: availableUnits ? `${availableUnits} Available` : '',
        bgColor: 'bg-green-700',
        lightColor: 'text-green-200',
        dotColor: 'bg-green-400'
      };
    }
    
    // No occupancy data available
    return {
      status: 'Unconfirmed',
      detail: '',
      bgColor: 'bg-gray-700',
      lightColor: 'text-gray-300',
      dotColor: 'bg-gray-400'
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
      {/* Split Header - Availability on Left, Prominent Pricing on Right */}
      <div className="flex">
        {/* Availability Section - Color Coded by Availability Status */}
        <div className={`${availability.bgColor} text-white px-4 py-3 flex-1 flex items-center`}>
          <div className="text-left">
            <div className="text-sm font-bold text-white">{availability.status}</div>
            <div className={`text-xs ${availability.lightColor}`}>
              {availability.detail}
            </div>
          </div>
        </div>
        
        {/* Pricing Section - Made More Prominent */}
        <div className="bg-gray-800 text-white px-4 py-3 min-w-[140px] flex items-center justify-end">
          <div className="text-right">
            {priceDisplay ? (
              <>
                <div className="text-2xl font-bold text-green-400">
                  {priceDisplay}
                </div>
                <div className="text-xs text-gray-400">
                  {isHudProperty ? 'HUD Verified' : community.verified ? 'Verified' : 'per month'}
                </div>
              </>
            ) : (
              <>
                <div className="text-lg font-medium text-gray-500">
                  Contact
                </div>
                <div className="text-xs text-gray-400">
                  for pricing
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Card Content - Purple Gradient */}
      <div className="relative bg-gradient-to-br from-purple-600 to-purple-800 text-white min-h-[140px] flex items-center justify-center overflow-hidden">
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

        {/* Community Image or Quality Placeholder - Full Container */}
        {community.photos && community.photos.length > 0 && community.photos[0] && community.photos[0].trim() !== '' && !imageError ? (
          <img 
            src={community.photos[0]} 
            alt={community.name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => {
              // Set state to show placeholder instead
              setImageError(true);
            }}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
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
              Photos coming soon
            </div>
          </div>
        )}
      </div>

      {/* Bottom Section - Dark Theme */}
      <CardContent className="p-4 bg-gray-900 text-white">
        {/* City and State at the Top */}
        <div className="text-sm text-gray-400 mb-2 font-semibold">
          {community.city}, {community.state}
        </div>
        
        {/* Community Name and Contact Info */}
        <div className="mb-3">
          <h3 className="text-xl font-bold text-white mb-1">
            {community.name}
          </h3>
          <div className="flex items-center text-sm text-gray-400 mb-1">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{community.address || `${community.city}, ${community.state}`}</span>
          </div>
          {community.phone && (
            <div className="flex items-center text-sm text-gray-400 mb-1">
              <Phone className="h-4 w-4 mr-1" />
              <a href={`tel:${community.phone}`} className="hover:text-white transition-colors">
                {community.phone}
              </a>
            </div>
          )}
          <div className="mt-1">
            <Badge className="bg-blue-600 text-white text-xs px-2 py-0.5">
              {community.careLevel || community.careTypes?.[0] || 'Assisted Living'}
            </Badge>
          </div>
        </div>



        {/* Key Services and Live Intelligence Side by Side */}
        <div className="flex gap-3 mb-3">
          {/* Key Services Section - Left Side */}
          <div className="bg-gray-800 rounded-lg p-3 flex-1">
            <div className="text-sm text-gray-400 mb-2">Key Services:</div>
            <div className="space-y-1">
              {/* Check if amenities data confirms each service */}
              <div className="flex items-center text-sm text-white">
                {(community.amenities?.includes('24_7_staff') || 
                  community.amenities?.includes('nursing_staff') ||
                  community.amenities?.includes('medical_staff')) ? (
                  <span className="text-green-400 mr-2">✓</span>
                ) : (
                  <span className="text-gray-600 mr-2">○</span>
                )}
                <span>24/7 Medical Staff</span>
              </div>
              
              <div className="flex items-center text-sm text-white">
                {(community.amenities?.includes('medication_management') || 
                  community.amenities?.includes('medication_assistance')) ? (
                  <span className="text-green-400 mr-2">✓</span>
                ) : (
                  <span className="text-gray-600 mr-2">○</span>
                )}
                <span>Medication Management</span>
              </div>
              
              <div className="flex items-center text-sm text-white">
                {(community.amenities?.includes('housekeeping') || 
                  community.amenities?.includes('cleaning') ||
                  community.amenities?.includes('housekeeping_included')) ? (
                  <span className="text-green-400 mr-2">✓</span>
                ) : (
                  <span className="text-gray-600 mr-2">○</span>
                )}
                <span>Housekeeping Included</span>
              </div>
              
              <div className="flex items-center text-sm text-white">
                {(community.amenities?.includes('transportation') || 
                  community.amenities?.includes('shuttle') ||
                  community.amenities?.includes('transportation_services')) ? (
                  <span className="text-green-400 mr-2">✓</span>
                ) : (
                  <span className="text-gray-600 mr-2">○</span>
                )}
                <span>Transportation Included</span>
              </div>
            </div>
            {(!community.amenities || community.amenities.length === 0) && (
              <div className="text-xs text-gray-500 mt-2">
                Contact for service details
              </div>
            )}
          </div>

          {/* Quick Info - Right Side */}
          <div className="bg-gray-800 rounded-lg p-3 flex-1">
            {/* Header */}
            <div className="flex items-center mb-2">
              <Info className="w-4 h-4 mr-1 text-blue-400" />
              <span className="text-xs font-semibold text-gray-300">Quick Info</span>
            </div>
            
            {/* Key Details */}
            <div className="space-y-2">
              {/* Community Type */}
              <div className="flex items-center text-xs">
                <Home className="w-3 h-3 mr-2 text-gray-400" />
                <span className="text-gray-300">
                  {community.communitySubtype === 'memory_care' ? 'Memory Care' :
                   community.communitySubtype === 'skilled_nursing' ? 'Skilled Nursing' :
                   community.communitySubtype === 'independent_living' ? 'Independent Living' :
                   community.communitySubtype === 'assisted_living' ? 'Assisted Living' :
                   community.communitySubtype === 'hud_senior_housing' ? 'HUD Senior Housing' :
                   community.communitySubtype === 'active_adult_55plus' ? '55+ Active Adult' :
                   community.communitySubtype === 'mobile_home_park' ? 'Mobile Home Park' :
                   'Senior Living'}
                </span>
              </div>
              
              {/* Units/Capacity if available */}
              {(community.totalUnits || community.totalUnitsHud) && (
                <div className="flex items-center text-xs">
                  <Bed className="w-3 h-3 mr-2 text-gray-400" />
                  <span className="text-gray-300">
                    {community.totalUnitsHud || community.totalUnits} Total Units
                  </span>
                </div>
              )}
              
              {/* Pets Policy */}
              <div className="flex items-center text-xs">
                <Users className="w-3 h-3 mr-2 text-gray-400" />
                <span className="text-gray-300">
                  {community.petFriendly ? '✓ Pets Welcome' :
                   community.petFriendly === false ? 'No Pets' :
                   'Pet Policy Unknown'}
                </span>
              </div>
              
              {/* AI Verified Badge */}
              <div className="flex items-center text-xs mt-2 pt-2 border-t border-gray-700">
                <Sparkles className="w-3 h-3 mr-1 text-purple-400" />
                <span className="text-purple-400 text-[11px]">AI-Verified Information</span>
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