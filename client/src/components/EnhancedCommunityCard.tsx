import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Home, DollarSign, Users, Building, MapPin, Star, Zap, Shield, CheckCircle, Award, Sparkles, Phone, ExternalLink, Languages, Activity } from "lucide-react";
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
    
    // Pricing properties
    livePricing?: {
      independentLiving?: { min: number; max: number };
      assistedLiving?: { min: number; max: number };
      memoryCare?: { min: number; max: number };
    };
    pricingType?: 'live' | 'market' | 'contact';
    pricingDetails?: {
      basePrice?: number;
      monthlyFees?: {
        baseRent: number;
        careLevel?: number;
      };
      specialOffers?: Array<{ title: string; description?: string }>;
      moveinSpecials?: string[];
    };
    lotRent?: number;
    specialOffers?: Array<{ title: string; description?: string }>;

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

function CommunityCard({ community, index = 0, variant = 'standard', onSelect }: CommunityCardProps) {
  // Only properties with actual HUD property IDs are HUD properties
  const isHudProperty = !!community.hudPropertyId;
  const hasAuthenticPricing = !!(community.hudPropertyId && community.rentPerMonth) || 
    !!(community as any).pricingDetails?.basePrice;
  const hasOccupancyData = false; // No occupancy data in current schema

  // Get regional theme based on location
  const getRegionalTheme = () => {
    const state = community.state?.toUpperCase();
    const city = community.city?.toLowerCase();
    
    // Mexican communities
    if (state === 'MX' || city?.includes('mexico') || city?.includes('guadalajara') || city?.includes('puerto vallarta')) {
      return {
        name: 'mexican',
        gradient: 'from-green-50 via-white to-red-50 dark:from-green-900/20 dark:via-gray-800 dark:to-red-900/20',
        borderColor: 'border-green-500 hover:border-red-500',
        badge: '🇲🇽',
        accentColor: 'text-green-600 dark:text-green-400',
        headerGradient: 'from-green-500 to-red-500'
      };
    }
    
    // Canadian communities
    if (['AB', 'BC', 'ON', 'QC', 'NS', 'NB', 'MB', 'SK', 'PE', 'NL', 'NT', 'YT', 'NU'].includes(state || '')) {
      return {
        name: 'canadian',
        gradient: 'from-red-50 via-white to-red-50 dark:from-red-900/20 dark:via-gray-800 dark:to-red-900/20',
        borderColor: 'border-red-500 hover:border-red-600',
        badge: '🍁',
        accentColor: 'text-red-600 dark:text-red-400',
        headerGradient: 'from-red-500 to-red-600',
        provinceBadge: state
      };
    }
    
    // New York communities
    if (state === 'NY') {
      return {
        name: 'newyork',
        gradient: 'from-purple-50 via-indigo-50 to-purple-50 dark:from-purple-900/20 dark:via-gray-800 dark:to-indigo-900/20',
        borderColor: 'border-purple-500 hover:border-indigo-500',
        badge: '🗽',
        accentColor: 'text-purple-600 dark:text-purple-400',
        headerGradient: 'from-purple-500 to-indigo-500'
      };
    }
    
    // Florida communities
    if (state === 'FL') {
      return {
        name: 'florida',
        gradient: 'from-orange-50 via-yellow-50 to-orange-50 dark:from-orange-900/20 dark:via-gray-800 dark:to-yellow-900/20',
        borderColor: 'border-orange-500 hover:border-yellow-500',
        badge: '🌴',
        accentColor: 'text-orange-600 dark:text-orange-400',
        headerGradient: 'from-orange-400 to-yellow-400'
      };
    }
    
    // Texas communities
    if (state === 'TX') {
      return {
        name: 'texas',
        gradient: 'from-amber-50 via-red-50 to-blue-50 dark:from-amber-900/20 dark:via-gray-800 dark:to-blue-900/20',
        borderColor: 'border-amber-500 hover:border-blue-500',
        badge: '⭐',
        accentColor: 'text-amber-600 dark:text-amber-400',
        headerGradient: 'from-amber-500 to-blue-500'
      };
    }
    
    // Hawaii communities
    if (state === 'HI') {
      return {
        name: 'hawaii',
        gradient: 'from-cyan-50 via-blue-50 to-teal-50 dark:from-cyan-900/20 dark:via-gray-800 dark:to-teal-900/20',
        borderColor: 'border-cyan-500 hover:border-teal-500',
        badge: '🌺',
        accentColor: 'text-cyan-600 dark:text-cyan-400',
        headerGradient: 'from-cyan-400 to-teal-400'
      };
    }
    
    // Arizona communities
    if (state === 'AZ') {
      return {
        name: 'arizona',
        gradient: 'from-red-50 via-orange-50 to-yellow-50 dark:from-red-900/20 dark:via-gray-800 dark:to-yellow-900/20',
        borderColor: 'border-red-500 hover:border-orange-500',
        badge: '🌵',
        accentColor: 'text-red-600 dark:text-red-400',
        headerGradient: 'from-red-400 to-orange-400'
      };
    }
    
    // Default theme
    return {
      name: 'default',
      gradient: 'from-white to-blue-50/20 dark:from-gray-800 dark:to-gray-700/30',
      borderColor: 'border-gray-200 hover:border-blue-300 dark:border-gray-700 dark:hover:border-blue-600',
      badge: '',
      accentColor: 'text-blue-600 dark:text-blue-400',
      headerGradient: 'from-blue-400 to-purple-400'
    };
  };

  const regionalTheme = getRegionalTheme();

  // Community subtype badge mapping with comprehensive descriptions
  const getSubtypeBadge = (subtype?: string) => {
    const subtypeMap: Record<string, { emoji: string; label: string; color: string; description?: string }> = {
      'hud_senior_housing': { emoji: '🏛️', label: 'HUD Senior Housing', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', description: 'Government-subsidized affordable housing' },
      'mobile_home_park': { emoji: '🚐', label: 'Mobile & RV Community', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', description: 'Mobile homes, RV parks, manufactured homes' },
      'active_adult_55_plus': { emoji: '🏌️', label: '55+ Active Adult', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', description: 'Age-restricted independent community' },
      'independent_living': { emoji: '🏢', label: 'Independent Living', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200', description: 'Maintenance-free senior apartments' },
      'assisted_living': { emoji: '🤝', label: 'Assisted Living', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', description: 'Personal care and daily assistance' },
      'memory_care': { emoji: '🧠', label: 'Memory Care', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200', description: 'Specialized dementia and Alzheimer\'s care' },
      'board_and_care_home': { emoji: '🏘️', label: 'Board & Care', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', description: 'Small residential care homes' },
      'skilled_nursing': { emoji: '🏥', label: 'Skilled Nursing', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', description: '24/7 medical care and rehabilitation' },
      'ccrc_life_plan': { emoji: '♾️', label: 'CCRC Life Plan', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200', description: 'All care levels on one campus' },
      'va_housing': { emoji: '🎖️', label: 'Veterans Housing', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', description: 'Housing for military veterans' },
      'unlicensed_housing': { emoji: '🏘️', label: 'Residential Care', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200', description: 'Unlicensed senior housing' },
      'manufactured_home_community': { emoji: '🏘️', label: 'Manufactured Homes', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200', description: 'Permanent manufactured home community' },
      'rv_retirement_park': { emoji: '🚐', label: 'RV Lifestyle', color: 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200', description: '55+ RV resort and retirement parks' },
      'senior_cooperative': { emoji: '🤝', label: 'Senior Co-op', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200', description: 'Resident-owned cooperative housing' }
    };
    
    if (!subtype) return null;
    return subtypeMap[subtype] || null;
  };

  // Get authentic pricing display - check HUD rentPerMonth first
  // For cards, only show starting price to save space
  const getStartingPrice = () => {
    // HUD verified pricing takes priority
    if (community.rentPerMonth) {
      return `$${Number(community.rentPerMonth).toLocaleString()}/mo`;
    }
    
    // Check pricing details for base price
    if ((community as any).pricingDetails?.basePrice) {
      return `$${Number((community as any).pricingDetails.basePrice).toLocaleString()}/mo`;
    }
    
    // Check monthly fees from pricing details
    if ((community as any).pricingDetails?.monthlyFees?.baseRent) {
      return `$${Number((community as any).pricingDetails.monthlyFees.baseRent).toLocaleString()}/mo`;
    }
    
    // Check price range
    if (community.priceRange?.min) {
      const min = Number(community.priceRange.min).toLocaleString();
      const max = community.priceRange.max ? Number(community.priceRange.max).toLocaleString() : null;
      if (max) {
        return `$${min} - $${max}/mo`;
      }
      return `Starting at $${min}/mo`;
    }
    
    // Default for no pricing data
    return 'Contact for Pricing';
  };

  const displayPrice = getStartingPrice();

  // Enhanced list variant for search results - Complete information display
  if (variant === 'list') {
    // Determine care type from multiple sources
    const primaryCareType = community.communitySubtype || 
      (community.careTypes && community.careTypes[0]) || 
      'Assisted Living';
    
    // Get care level badge
    let subtypeBadge = community.communitySubtype ? getSubtypeBadge(community.communitySubtype) : null;
    
    if (!subtypeBadge && community.careTypes && community.careTypes.length > 0) {
      const careTypeMapping: Record<string, string> = {
        'Assisted Living': 'assisted_living',
        'Memory Care': 'memory_care', 
        'Independent Living': 'independent_living',
        'Skilled Nursing': 'skilled_nursing',
        'Board and Care': 'board_and_care_home',
        'CCRC': 'ccrc_life_plan',
        'Life Plan Community': 'ccrc_life_plan',
        'Mobile Home Park': 'mobile_home_park',
        '55+ Active Adult': 'active_adult_55_plus',
        'Senior Housing': 'hud_senior_housing',
        'HUD Housing': 'hud_senior_housing'
      };
      
      const mappedSubtype = careTypeMapping[community.careTypes[0]];
      if (mappedSubtype) {
        subtypeBadge = getSubtypeBadge(mappedSubtype);
      }
    }
    
    // Determine quality tier
    const getTierInfo = () => {
      if (community.priceTier === 'featured') return { label: '🏆 Featured', color: 'text-blue-600' };
      if (community.rating && community.rating >= 4.5) return { label: '⭐ Top Rated', color: 'text-yellow-600' };
      if (community.priceTier === 'platinum') return { label: '💎 Premium', color: 'text-purple-600' };
      return null;
    };
    
    const tierInfo = getTierInfo();
    
    // Format price display with live market intelligence data
    const formatPriceDisplay = () => {
      // HUD Properties with verified pricing
      if (isHudProperty && community.rentPerMonth) {
        return `$${Math.round(Number(community.rentPerMonth)).toLocaleString()}/mo`;
      }
      
      // Live pricing from claimed communities
      if (community.livePricing && community.pricingType === 'live') {
        const careTypes = community.careTypes || [];
        if (careTypes.includes('Independent Living') && community.livePricing.independentLiving) {
          const { min, max } = community.livePricing.independentLiving;
          return min === max 
            ? `$${Math.round(min).toLocaleString()}/mo` 
            : `$${Math.round(min).toLocaleString()} - $${Math.round(max).toLocaleString()}/mo`;
        }
        if (careTypes.includes('Assisted Living') && community.livePricing.assistedLiving) {
          const { min, max } = community.livePricing.assistedLiving;
          return min === max 
            ? `$${Math.round(min).toLocaleString()}/mo` 
            : `$${Math.round(min).toLocaleString()} - $${Math.round(max).toLocaleString()}/mo`;
        }
        if (careTypes.includes('Memory Care') && community.livePricing.memoryCare) {
          const { min, max } = community.livePricing.memoryCare;
          return min === max 
            ? `$${Math.round(min).toLocaleString()}/mo` 
            : `$${Math.round(min).toLocaleString()} - $${Math.round(max).toLocaleString()}/mo`;
        }
      }
      
      // Pricing details with monthly fees breakdown
      if (community.pricingDetails?.monthlyFees?.baseRent) {
        const baseRent = community.pricingDetails.monthlyFees.baseRent;
        const careLevel = community.pricingDetails.monthlyFees.careLevel || 0;
        const total = baseRent + careLevel;
        return `$${Math.round(total).toLocaleString()}/mo`;
      }
      
      // Standard price range
      if (community.priceRange?.min && community.priceRange?.max) {
        if (community.priceRange.min === community.priceRange.max) {
          return `$${Math.round(community.priceRange.min).toLocaleString()}/mo`;
        }
        return `$${Math.round(community.priceRange.min).toLocaleString()} - $${Math.round(community.priceRange.max).toLocaleString()}/mo`;
      }
      
      // Mobile home communities
      if (community.lotRent) {
        return `Lot: $${Math.round(Number(community.lotRent)).toLocaleString()}/mo`;
      }
      
      return null;
    };
    
    const priceDisplay = formatPriceDisplay();
    
    return (
      <Card 
        className={`group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border-2 ${regionalTheme.borderColor} bg-gradient-to-br ${regionalTheme.gradient}`}
        onClick={onSelect}
      >
        {/* Photo header with badges - Matching screenshot style */}
        <div className={`relative h-56 bg-gradient-to-br ${regionalTheme.headerGradient} overflow-hidden`}>
          {/* Regional badge overlays */}
          {regionalTheme.name === 'canadian' && regionalTheme.provinceBadge && (
            <div className="absolute top-3 left-3 z-10">
              <Badge className="bg-red-600 text-white px-3 py-1.5 text-xs font-bold shadow-md">
                🍁 {regionalTheme.provinceBadge}
              </Badge>
            </div>
          )}
          {regionalTheme.name === 'mexican' && (
            <div className="absolute top-3 left-3 z-10">
              <Badge className="bg-gradient-to-r from-green-600 via-white to-red-600 text-green-900 px-3 py-1.5 text-xs font-bold shadow-md">
                🇲🇽 Mexico
              </Badge>
            </div>
          )}
          {regionalTheme.name === 'newyork' && (
            <div className="absolute top-3 left-3 z-10">
              <Badge className="bg-purple-600 text-white px-3 py-1.5 text-xs font-bold shadow-md">
                🗽 New York
              </Badge>
            </div>
          )}
          
          {/* Photo or placeholder - exactly matching screenshot */}
          {community.photos && community.photos.length > 0 && community.photos[0] ? (
            <img 
              src={community.photos[0]} 
              alt={community.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
              <div className={`mb-3 ${regionalTheme.accentColor}`}>
                <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
                Photos Coming Soon
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Verifying authentic images
              </p>
            </div>
          )}
        </div>
        
        <CardContent className="p-5">
          {/* Name and location */}
          <div className="mb-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
              {community.name}
            </h3>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
              {primaryCareType && (
                <span className="font-medium">{primaryCareType}</span>
              )}
              <span className="mx-1">•</span>
              <span>{community.city}, {community.state} {community.zipCode || ''}</span>
            </div>
          </div>
          
          {/* Key Stats Row - Like the screenshots */}
          <div className="flex items-center gap-4 mb-3 text-sm">
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Building className="h-4 w-4 mr-1" />
              <span>{community.totalUnits || community.totalUnitsHud || 'N/A'} units</span>
            </div>
            {community.rating && community.rating > 0 ? (
              <div className="flex items-center text-yellow-600">
                <Star className="h-4 w-4 mr-1 fill-yellow-500" />
                <span>{community.rating.toFixed(1)}</span>
              </div>
            ) : (
              <div className="flex items-center text-gray-500">
                <Star className="h-4 w-4 mr-1" />
                <span>No rating</span>
              </div>
            )}
            {community.displayAvailability?.occupancyDisplay ? (
              <div className={`flex items-center ${community.displayAvailability?.availabilityColor === 'red' ? 'text-red-600' : 'text-green-600'}`}>
                <Activity className="h-4 w-4 mr-1" />
                <span className="font-semibold">{community.displayAvailability.occupancyDisplay} Full</span>
              </div>
            ) : community.occupancyRate || community.occupancyRateHud ? (
              <div className={`flex items-center ${Number(community.occupancyRate || community.occupancyRateHud) > 90 ? 'text-red-600' : 'text-green-600'}`}>
                <Activity className="h-4 w-4 mr-1" />
                <span className="font-semibold">{Math.round(Number(community.occupancyRate || community.occupancyRateHud))}% Full</span>
              </div>
            ) : (
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                <span>Check avail.</span>
              </div>
            )}
          </div>
          
          {/* ID and Status Row */}
          <div className="flex items-center gap-4 mb-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <span className="text-gray-500">ID: {community.id || community.hudPropertyId || Math.floor(Math.random() * 100000)}</span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>{community.priceTier === 'standard' ? 'Standard' : community.priceTier === 'featured' ? 'Featured' : 'Pending'}</span>
            </div>
            <div className="flex items-center">
              <Activity className="h-4 w-4 mr-1" />
              <span>Pending</span>
            </div>
          </div>
          
          {/* Pricing display - Beautiful like the screenshots with Live Market Intelligence */}
          <div className={`rounded-lg p-3 mb-3 ${
            regionalTheme.name === 'mexican' ? 'bg-green-50 dark:bg-green-900/20' :
            regionalTheme.name === 'canadian' ? 'bg-red-50 dark:bg-red-900/20' :
            regionalTheme.name === 'newyork' ? 'bg-purple-50 dark:bg-purple-900/20' :
            'bg-orange-50 dark:bg-orange-900/20'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className={`text-2xl font-bold ${regionalTheme.accentColor}`}>
                  {priceDisplay || 'Contact for pricing'}
                </div>
                {priceDisplay && (
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {isHudProperty ? '✓ HUD Verified' : 
                     community.pricingType === 'live' ? '🔴 Live Pricing' : 
                     '📊 Market Intelligence'}
                  </div>
                )}
                
                {/* Special Offers */}
                {community.pricingDetails?.specialOffers && community.pricingDetails.specialOffers.length > 0 && (
                  <div className="text-xs text-red-600 dark:text-red-400 font-semibold mt-1 animate-pulse">
                    💰 {community.pricingDetails.specialOffers[0].title}
                  </div>
                )}
                
                {/* Move-in Specials */}
                {community.pricingDetails?.moveinSpecials && community.pricingDetails.moveinSpecials.length > 0 && (
                  <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold mt-1">
                    🎁 {community.pricingDetails.moveinSpecials[0]}
                  </div>
                )}
              </div>
              
              {/* Market Intelligence Badge */}
              <Badge className={`
                ${isHudProperty ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : ''}
                ${community.pricingType === 'live' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : ''}
                ${!isHudProperty && community.pricingType !== 'live' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' : ''}
              `}>
                {isHudProperty ? 'HUD' : 
                 community.pricingType === 'live' ? 'LIVE' : 
                 'EST'}
              </Badge>
            </div>
          </div>
          
          {/* Tier badges with full descriptions */}
          <div className="flex flex-wrap gap-2 mb-3">
            {tierInfo && (
              <Badge className={`${tierInfo.color} text-xs px-2 py-1 font-semibold`}>
                {tierInfo.label}
              </Badge>
            )}
            {subtypeBadge && (
              <div className="w-full">
                <Badge className={`${subtypeBadge.color} text-xs px-2 py-1 inline-flex items-center`}>
                  {subtypeBadge.emoji} {subtypeBadge.label}
                </Badge>
                {subtypeBadge.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 ml-2">
                    {subtypeBadge.description}
                  </p>
                )}
              </div>
            )}
          </div>
          
          {/* Special Features section with comprehensive care type info */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 mb-3">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Special Features:</h4>
            <div className="space-y-1">
              {(community.careTypes && community.careTypes.length > 0) && (
                <div className="flex flex-col text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-start">
                    <span className="mr-1">❈</span>
                    <span className="font-semibold">{community.careTypes.length} care levels available:</span>
                  </div>
                  {community.careTypes.includes('Senior Mobile Park') && (
                    <div className="ml-4 text-xs mt-1">
                      <span className="text-blue-600 dark:text-blue-400">• Mobile homes, RV parks, manufactured homes, 55+ mobile communities</span>
                    </div>
                  )}
                  {community.careTypes.includes('Memory Care') && (
                    <div className="ml-4 text-xs mt-1">
                      <span className="text-purple-600 dark:text-purple-400">• Specialized dementia & Alzheimer's care</span>
                    </div>
                  )}
                  {community.careTypes.includes('Assisted Living') && (
                    <div className="ml-4 text-xs mt-1">
                      <span className="text-orange-600 dark:text-orange-400">• Personal care & daily assistance</span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-start text-xs text-gray-600 dark:text-gray-400">
                <span className="mr-1">🏠</span>
                <span>Full amenity list available</span>
              </div>
              {isHudProperty && (
                <div className="flex items-start text-xs text-gray-600 dark:text-gray-400">
                  <span className="mr-1">✓</span>
                  <span>Government subsidized with income-based rent</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Call for availability button */}
          <div className="flex items-center justify-center mb-3">
            {community.phone ? (
              <a 
                href={`tel:${community.phone}`}
                className="flex items-center text-green-600 hover:text-green-700 font-semibold text-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <Phone className="h-4 w-4 mr-1" />
                Call for availability
              </a>
            ) : (
              <span className="text-gray-500 text-sm">Contact for availability</span>
            )}
          </div>
          
          {/* Rating display if available */}
          {community.rating && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${
                      i < Math.floor(community.rating || 0) 
                        ? 'text-yellow-400 fill-yellow-400' 
                        : 'text-gray-300'
                    }`} 
                  />
                ))}
              </div>
              <span className="text-sm font-medium">({community.rating.toFixed(1)})</span>
            </div>
          )}
          
          {/* Two-column layout for Amenities and Details */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Amenities Column */}
            <div>
              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Amenities</h4>
              <div className="space-y-1.5">
                {community.amenities && community.amenities.length > 0 ? (
                  community.amenities.slice(0, 3).map((amenity: string, idx: number) => (
                    <div key={idx} className="flex items-start text-xs text-gray-600 dark:text-gray-400">
                      <span className="mr-1 text-green-500">✓</span>
                      <span>{amenity}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                    Contact for amenities
                  </div>
                )}
              </div>
            </div>
            
            {/* Details Column */}
            <div>
              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Details</h4>
              <div className="space-y-1.5">
                {isHudProperty ? (
                  <>
                    <div className="flex items-start text-xs text-green-600 dark:text-green-400">
                      <span className="mr-1">◈</span>
                      <span>Income-based rent</span>
                    </div>
                    <div className="flex items-start text-xs text-green-600 dark:text-green-400">
                      <span className="mr-1">◈</span>
                      <span>Section 8 accepted</span>
                    </div>
                    <div className="flex items-start text-xs text-green-600 dark:text-green-400">
                      <span className="mr-1">◈</span>
                      <span>Government subsidized</span>
                    </div>
                  </>
                ) : (
                  <>
                    {community.careTypes?.slice(0, 3).map((care: string, idx: number) => {
                      // Enhanced care type descriptions
                      const getCareTypeDescription = (careType: string) => {
                        const descriptions: Record<string, string> = {
                          'Senior Mobile Park': 'Mobile & RV Communities',
                          'Mobile Home Park': 'Mobile & RV Communities',
                          'RV Park': 'RV Lifestyle & Retirement',
                          'Manufactured Homes': 'Manufactured Home Communities',
                          'Skilled Nursing': '24/7 Medical Care',
                          'Memory Care': 'Dementia & Alzheimer\'s',
                          'Assisted Living': 'Personal Care Support',
                          'Independent Living': 'Maintenance-Free Living',
                          '55+ Housing': '55+ Active Adult',
                          '55+ Active Adult': 'Age-Restricted Community',
                          'Continuing Care': 'CCRC - All Care Levels',
                          'Board and Care': 'Small Residential Care',
                          'Veterans Housing': 'VA Senior Housing',
                          'HUD Housing': 'Subsidized Senior Housing'
                        };
                        return descriptions[careType] || careType;
                      };
                      
                      return (
                        <div key={idx} className="flex items-start text-xs text-gray-600 dark:text-gray-400">
                          <span className="mr-1">•</span>
                          <span className="font-medium">{getCareTypeDescription(care)}</span>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Special offer badges - Only show if community has actual special offers */}
          {community.specialOffers && community.specialOffers.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {community.specialOffers.map((offer, idx) => (
                <Badge key={idx} className="bg-yellow-400 text-yellow-900 text-xs px-3 py-1 font-bold">
                  {offer.title}
                </Badge>
              ))}
            </div>
          )}
          
          {/* HUD verification badge if applicable */}
          {isHudProperty && (
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs px-3 py-1 font-semibold">
                🏛️ HUD Verified Property
              </Badge>
            </div>
          )}
          

          
          {/* Action Button - professional CTA */}
          <Button 
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg shadow-md transform transition-all hover:shadow-lg"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onSelect?.();
            }}
          >
            View Full Details →
          </Button>
        </CardContent>
      </Card>
    );
  }

  // OLD VERSION OF LIST VARIANT (KEPT FOR REFERENCE)
  if (false) {
    // Get care level badge info at the start
    const subtypeBadge = community.communitySubtype ? getSubtypeBadge(community.communitySubtype) : null;
    
    return (
      <Card 
        className="group cursor-pointer hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50/20 dark:from-gray-800 dark:to-gray-700/30 hover:from-blue-50/30 hover:to-purple-50/30 dark:hover:from-gray-700 dark:hover:to-gray-600 border-2 border-gray-200 hover:border-blue-300 dark:border-gray-700 dark:hover:border-blue-600 transform hover:-translate-y-0.5"
        onClick={onSelect}
      >
        <CardContent className="p-4">
          {/* Care Level Badge - PROMINENT AT TOP */}
          {subtypeBadge && (
            <div className="mb-3">
              <Badge className={`inline-flex items-center px-3 py-1.5 text-sm font-semibold ${subtypeBadge?.color || ''} border-0 shadow-sm`}>
                <span className="mr-1.5 text-lg">{subtypeBadge?.emoji || ''}</span>
                {subtypeBadge?.label || ''}
              </Badge>
            </div>
          )}
          
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              {/* Name and Location */}
              <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1 flex items-center gap-2">
                {community.name}
                {isHudProperty && (
                  <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-0">
                    <Shield className="h-3 w-3 mr-0.5" />
                    HUD
                  </Badge>
                )}
              </h3>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0 text-blue-500" />
                <span className="font-medium">{community.city}, {community.state} {community.zipCode || ''}</span>
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

              {/* Reviews and Care Type Info */}
              <div className="flex flex-wrap items-center gap-3 text-sm mb-2">
                {/* Google Reviews */}
                {community.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {community.rating?.toFixed(1) || '0.0'}
                    </span>
                    {community.reviewCount && (
                      <span className="text-gray-500 dark:text-gray-400">
                        ({community.reviewCount} reviews)
                      </span>
                    )}
                  </div>
                )}
                
                {/* Total Units if available */}
                {(community.totalUnits || community.totalUnitsHud) && (
                  <span className="text-gray-600 dark:text-gray-400">
                    • {community.totalUnits || community.totalUnitsHud} units
                  </span>
                )}
                
                {/* Senior Population if available */}
                {community.seniorPercentage && (
                  <span className="text-gray-600 dark:text-gray-400">
                    • {Math.round(community.seniorPercentage ?? 0)}% senior residents
                  </span>
                )}
              </div>

              {/* Additional Badges - Only show amenities since care level is at top */}
              <div className="flex flex-wrap gap-1.5">
                {/* Amenities Badge */}
                {community.amenities && community.amenities.length > 5 && (
                  <Badge className="text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-700">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {community.amenities?.length || 0} Amenities
                  </Badge>
                )}
                
                {/* Care Types if no subtype */}
                {!community.communitySubtype && community.careTypes && community.careTypes.length > 0 && (
                  <Badge className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-0">
                    {community.careTypes?.[0] || ''}
                  </Badge>
                )}
              </div>
            </div>

            {/* Enhanced Pricing Column */}
            <div className="text-right min-w-[120px]">
              {displayPrice === 'Contact for Pricing' ? (
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
                  <Phone className="h-5 w-5 text-gray-500 dark:text-gray-400 mb-1 ml-auto" />
                  <div className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Contact for
                  </div>
                  <div className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                    pricing
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg px-3 py-2 border border-blue-200 dark:border-blue-700">
                  <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {displayPrice}
                  </div>
                  {community.hudPropertyId && community.rentPerMonth && (
                    <span className="text-xs text-green-600 dark:text-green-400 font-semibold flex items-center justify-end gap-1">
                      <Shield className="h-3 w-3" />
                      HUD Verified
                    </span>
                  )}
                  {!community.hudPropertyId && (community as any).pricingDetails?.basePrice && (
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center justify-end gap-1">
                      <Zap className="h-3 w-3" />
                      Live Pricing
                    </span>
                  )}
                  {!community.hudPropertyId && !(community as any).pricingDetails?.basePrice && displayPrice !== 'Contact for Pricing' && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Est. Range
                    </span>
                  )}
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
            <div className={`relative lg:w-80 h-48 lg:h-auto bg-gradient-to-br ${regionalTheme.headerGradient} flex items-center justify-center overflow-hidden`}>
              {community.photos && community.photos.length > 0 && community.photos[0] ? (
                <img 
                  src={community.photos[0]} 
                  alt={community.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                  <div className={`mb-3 ${regionalTheme.accentColor}`}>
                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                    Photos Coming Soon
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Verifying authentic images
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

  // Mobile-optimized card layout
  const cardClass = variant === 'featured' || variant === 'coastal' || variant === 'hud'
    ? "flex-shrink-0 w-56 h-auto dark:bg-gray-700 will-change-transform"
    : "group hover:shadow-lg transition-all duration-200 will-change-transform";

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
            
            {/* Location Type Badge - Top Left */}
            {locationBadge && (
              <Badge className={`absolute top-3 left-3 ${locationBadge.color} text-white text-xs px-2 py-1 font-medium`}>
                {locationBadge.emoji} {locationBadge.label}
              </Badge>
            )}
            
            {/* Heart Icon */}
            <div className="absolute top-3 right-3">
              <div className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-gray-600" />
              </div>
            </div>
            
            {/* Price Badge - Bottom Left */}
            {displayPrice !== 'Contact for Pricing' && (
              <Badge className="absolute bottom-3 left-3 bg-gray-900 text-white text-sm px-3 py-1.5 font-semibold">
                {displayPrice}
              </Badge>
            )}
            
            {/* HUD Badge - Bottom Right ONLY for actual HUD properties */}
            {community.hudPropertyId && (
              <Badge className="absolute bottom-3 right-3 bg-green-600 text-white text-xs px-2 py-1 font-medium">
                🏛️ HUD Official
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
          
          <CardContent className="p-3 flex flex-col flex-1 overflow-y-auto">
            {/* Header Section */}
            <div className="mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 text-sm mb-1">
                {community.name}
              </h3>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {community.careTypes && community.careTypes.length > 0 ? community.careTypes[0] : 'Senior Living'}
              </div>
              <div className="text-xs text-gray-700 dark:text-gray-300">
                {community.city}, {community.state} {community.zipCode || ''}
              </div>
            </div>
            
            {/* Key Metrics Grid - Always show 6 items */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-2 text-xs bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Building className="h-3 w-3 mr-1 text-gray-500" />
                <span>{community.totalUnits || community.totalUnitsHud || 'N/A'} units</span>
              </div>
              
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Star className="h-3 w-3 mr-1 text-yellow-400" />
                <span>{community.rating ? (typeof community.rating === 'number' ? community.rating.toFixed(1) : parseFloat(community.rating).toFixed(1)) : 'No rating'}</span>
              </div>
              
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Shield className="h-3 w-3 mr-1 text-gray-500" />
                <span>ID: {community.id}</span>
              </div>
              
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Users className="h-3 w-3 mr-1 text-gray-500" />
                <span>{community.occupancyRate ? `${Math.round(Number(community.occupancyRate))}% full` : 'Check avail.'}</span>
              </div>
              
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Home className="h-3 w-3 mr-1 text-gray-500" />
                <span className="capitalize">{community.sizeCategory || 'Standard'}</span>
              </div>
              
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <CheckCircle className="h-3 w-3 mr-1 text-gray-500" />
                <span>{community.dataQuality?.qualityScore ? `${Math.round(community.dataQuality.qualityScore)}% verified` : 'Pending'}</span>
              </div>
            </div>
            
            {/* Status & Verification Badges */}
            <div className="flex flex-wrap gap-1 mb-2">
              {/* Status Badge */}
              {index % 4 === 0 && (
                <Badge className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                  🏆 Featured
                </Badge>
              )}
              {index % 4 === 1 && (
                <Badge className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  ⭐ Top Rated
                </Badge>
              )}
              {index % 4 === 2 && (
                <Badge className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  💎 Premium
                </Badge>
              )}
              {index % 4 === 3 && (
                <Badge className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                  ✨ Popular
                </Badge>
              )}
              
              {/* Verified Badge */}
              {community.dataQuality?.qualityScore && community.dataQuality.qualityScore >= 80 && (
                <Badge className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  ✓ Verified
                </Badge>
              )}
              
              {/* Community subtype badge */}
              {community.communitySubtype && (
                <Badge className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  {community.communitySubtype}
                </Badge>
              )}
            </div>
            
            {/* Special Features Section - Always show something */}
            <div className="space-y-1 text-xs mb-2 border-t dark:border-gray-700 pt-2">
              <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">Special Features:</div>
              
              {/* Show HUD if available */}
              {community.hudPropertyId ? (
                <div className="text-green-600 dark:text-green-400 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  HUD Official Pricing Available
                </div>
              ) : null}
              
              {/* Show care types */}
              <div className="text-gray-600 dark:text-gray-400">
                <Sparkles className="h-3 w-3 inline mr-1" />
                {community.careTypes && community.careTypes.length > 1 
                  ? `${community.careTypes.length} care levels available`
                  : 'Specialized senior care'}
              </div>
              
              {/* Show amenities or default message */}
              <div className="text-gray-600 dark:text-gray-400">
                <Home className="h-3 w-3 inline mr-1" />
                {community.amenities && community.amenities.length > 0
                  ? `${community.amenities.length} amenities available`
                  : 'Full amenity list available'}
              </div>
              
              {/* Island life for Hawaii */}
              {community.state === 'HI' && (
                <div className="text-blue-600 dark:text-blue-400">
                  <Sparkles className="h-3 w-3 inline mr-1" />
                  Island senior living lifestyle
                </div>
              )}
            </div>
            
            {/* Contact Section */}
            <div className="mt-auto space-y-2">
              {/* Always show contact status */}
              <div className="text-xs text-gray-700 dark:text-gray-300 bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded">
                <Phone className="h-3 w-3 inline mr-1" />
                <span className="font-medium">
                  {displayPrice === 'Contact for Pricing' 
                    ? 'Call for availability'
                    : community.phone || 'Contact available'}
                </span>
              </div>
              
              {/* View Details Button */}
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
    <Card className={`${cardClass} bg-gradient-to-br ${regionalTheme.gradient} border-2 ${regionalTheme.borderColor}`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <div className={`w-20 h-20 bg-gradient-to-br ${regionalTheme.headerGradient} rounded-lg flex items-center justify-center overflow-hidden`}>
            {community.photos && community.photos.length > 0 && community.photos[0] ? (
              <img 
                src={community.photos[0]} 
                alt={community.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="flex flex-col items-center justify-center">
                <div className={`${regionalTheme.accentColor}`}>
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                  </svg>
                </div>
                <div className="text-[10px] font-medium text-gray-700 dark:text-gray-300 mt-1">
                  Photos Soon
                </div>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-1 mb-1">
              {community.name}
              {regionalTheme.badge && <span className="ml-1">{regionalTheme.badge}</span>}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {community.city}, {community.state}
            </p>
            <div className={`text-lg font-bold ${regionalTheme.accentColor}`}>
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

// Export with React.memo for mobile performance optimization
export const EnhancedCommunityCard = React.memo(CommunityCard);