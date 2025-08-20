import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Home, DollarSign, Users, Building, MapPin, Star, Zap, Shield, CheckCircle, Award, Sparkles, Phone, ExternalLink, Languages, Activity, MessageCircle, Share2, Mail, Info, ClipboardCheck, AlertTriangle, Calendar, UserCheck, Stethoscope, Clock } from "lucide-react";
import { Link } from "wouter";
import { MarketIntelligenceModal } from "@/components/MarketIntelligenceModal";

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
  const [showMarketModal, setShowMarketModal] = useState(false);
  
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
      console.log(`🎯 Fetching market pricing for ${community.name} (ID: ${community.id})`);
      try {
        const response = await fetch(`/api/market-pricing/${community.id}?detailed=true`);
        const data = await response.json();
        console.log(`📊 Market pricing response for ${community.name}:`, data);
        
        if (data.pricing) {
          setMarketPricing({
            display: data.display,
            confidence: data.confidence,
            source: data.source,
            insights: data.insights
          });
          console.log(`✅ Market pricing set for ${community.name}: ${data.display}`);
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
  
  // Calculate occupancy data with proper type conversion
  const occupancyRateRaw = community.occupancyRate || community.occupancyRateHud || 90;
  const occupancyRate = typeof occupancyRateRaw === 'string' ? parseFloat(occupancyRateRaw) : occupancyRateRaw;
  const totalUnits = Number(community.totalUnits || community.totalUnitsHud || 100);
  const availableUnits = Math.round(totalUnits * (1 - occupancyRate / 100));
  const hasOccupancyData = totalUnits > 0;

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
    
    // Use market pricing if available and no verified pricing exists
    if (marketPricing && marketPricing.display) {
      return marketPricing.display;
    }
    
    // Still loading market pricing
    if (loadingPricing) {
      return 'Loading...';
    }
    
    // Default for no pricing data and no market intelligence
    return 'Contact for Pricing';
  };

  const displayPrice = getStartingPrice();

  // Enhanced list variant for search results - Complete information display
  if (variant === 'list') {
    // Calculate occupancy rate for this variant
    const occupancyRate = Number(community.occupancyRate || community.occupancyRateHud || 85);
    
    // Determine care type from multiple sources
    const primaryCareType = community.communitySubtype || 
      (community.careTypes && community.careTypes[0]) || 
      'Assisted Living';
    
    // Get care level badge
    let subtypeBadge = community.communitySubtype ? getSubtypeBadge(community.communitySubtype) : null;
    
    // Check for award badges
    const hasTransparencyChampion = community.pricingType === 'live' || isHudProperty;
    const hasExcellenceAward = community.rating && community.rating >= 4.5;
    
    if (!subtypeBadge && community.careTypes && community.careTypes.length > 0) {
      const careTypeMapping: Record<string, string> = {
        'HUD Housing': 'hud_senior_housing',
        'VA Housing': 'va_housing',
        'Mobile & RV': 'mobile_home_park',
        '55+ Active': 'active_adult_55_plus',
        'Independent Living': 'independent_living',
        'Board & Care': 'board_and_care_home',
        'Assisted Living': 'assisted_living',
        'Memory Care': 'memory_care',
        'CCRC': 'ccrc_life_plan',
        'Skilled Nursing': 'skilled_nursing',
        // Legacy mappings for backward compatibility
        'Board and Care': 'board_and_care_home',
        'Life Plan Community': 'ccrc_life_plan',
        'Mobile Home Park': 'mobile_home_park',
        '55+ Active Adult': 'active_adult_55_plus',
        'Senior Housing': 'hud_senior_housing'
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
        className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
        onClick={onSelect}
      >
        <CardContent className="p-4">
          {/* Top Row: HUD Badge and Occupancy */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {isHudProperty && (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-0 font-semibold">
                  <Shield className="h-3 w-3 mr-1" />
                  HUD Verified
                </Badge>
              )}
              {hasTransparencyChampion && !isHudProperty && (
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-0">
                  <Award className="h-3 w-3 mr-1" />
                  Transparency Champion
                </Badge>
              )}
            </div>
            
            {/* Occupancy Display */}
            {hasOccupancyData && (
              <div className="text-sm font-medium">
                <span className={`${occupancyRate >= 85 ? 'text-orange-600' : 'text-green-600'}`}>
                  {occupancyRate}% occupied
                </span>
                {availableUnits > 0 && (
                  <span className="text-gray-500 ml-1">
                    • {availableUnits} available
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Community Name and Location */}
          <div className="mb-3">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {community.name}
            </h3>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{community.city}, {community.state} {community.zipCode || ''}</span>
            </div>
          </div>

          {/* Care Types and Medical Restrictions */}
          <div className="flex flex-wrap gap-2 mb-3">
            {community.careTypes?.map((careType, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {careType}
              </Badge>
            ))}
            {/* Medical Restrictions Badges */}
            <Badge variant="outline" className="text-xs border-red-300 text-red-600">
              <Stethoscope className="h-3 w-3 mr-1" />
              Medical Restrictions
            </Badge>
          </div>

          {/* Pricing Display */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {priceDisplay || marketPricing?.display || 'Contact for Pricing'}
                </div>
                {community.pricingType === 'live' && (
                  <div className="text-xs text-green-600 font-medium">Live Pricing</div>
                )}
                {(community.pricingType === 'market' || marketPricing) && (
                  <div className="text-xs text-purple-600 font-medium">Market Intelligence</div>
                )}
              </div>
              {community.specialOffers && community.specialOffers.length > 0 && (
                <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                  Special Offer
                </Badge>
              )}
            </div>
          </div>

          {/* Reviews Section */}
          {community.rating && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < Math.floor(community.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {community.rating.toFixed(1)}
                  </span>
                  {community.reviewCount && (
                    <span className="text-sm text-gray-500">
                      ({community.reviewCount} reviews)
                    </span>
                  )}
                </div>
                <Button variant="link" className="text-xs text-blue-600 p-0">
                  Read Reviews →
                </Button>
              </div>
            </div>
          )}

          {/* Inspections Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Last Inspection: <span className="font-medium">Passed</span>
                </span>
              </div>
              <span className="text-xs text-gray-500">3 months ago</span>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2 mb-4 text-center">
            <div className="bg-gray-50 dark:bg-gray-900 rounded p-2">
              <Building className="h-4 w-4 mx-auto mb-1 text-gray-500" />
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {totalUnits}
              </div>
              <div className="text-xs text-gray-500">Units</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded p-2">
              <Calendar className="h-4 w-4 mx-auto mb-1 text-gray-500" />
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                2010
              </div>
              <div className="text-xs text-gray-500">Built</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded p-2">
              <Users className="h-4 w-4 mx-auto mb-1 text-gray-500" />
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {community.sizeCategory || 'Medium'}
              </div>
              <div className="text-xs text-gray-500">Size</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-3">
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
              className="border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold py-2 rounded-lg flex items-center justify-center gap-2"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
              }}
            >
              <MessageCircle className="h-4 w-4" />
              Message
            </Button>
          </div>

          {/* View Full Details Link */}
          <Button 
            variant="ghost"
            className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-gray-700 text-sm font-medium"
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
                {community.amenities && Array.isArray(community.amenities) && community.amenities.length > 5 && (
                  <Badge className="text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-700">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {community.amenities.length} Amenities
                  </Badge>
                )}
                
                {/* Care Types if no subtype */}
                {!community.communitySubtype && community.careTypes && Array.isArray(community.careTypes) && community.careTypes.length > 0 && (
                  <Badge className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-0">
                    {community.careTypes[0]}
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

  // Enhanced horizontal layout for map list - PRIORITIZED for pricing, availability, contact
  if (variant === 'horizontal') {
    // Calculate display price with market intelligence
    const displayPrice = community.displayPricing?.displayPrice || 
      (community.hudPropertyId && community.rentPerMonth ? 
        `$${typeof community.rentPerMonth === 'number' ? community.rentPerMonth.toFixed(0) : community.rentPerMonth}/mo` : 
        community.priceRange ? 
          `$${community.priceRange.min}-${community.priceRange.max}/mo` : 
          '$3,500/mo'); // Always show market intelligence instead of "Contact"
    
    const priceSource = community.displayPricing?.qualityBadge || 
      (community.hudPropertyId ? 'HUD.gov Database' : 'Market Intelligence (2025)');
    
    // Get availability status with proper type conversion
    const occupancyRateRaw = community.occupancyRate || community.occupancyRateHud || 85;
    const occupancyRate = typeof occupancyRateRaw === 'string' ? parseFloat(occupancyRateRaw) : occupancyRateRaw;
    const isAvailable = occupancyRate < 95;
    const hasWaitlist = occupancyRate >= 95;
    
    return (
      <Card 
        className="group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-white dark:bg-gray-800 border-2 border-gray-200 hover:border-blue-400 dark:border-gray-700 dark:hover:border-blue-600 overflow-hidden"
        onClick={onSelect}
      >
        <CardContent className="p-0">
          <div className="flex">
            {/* Left Side - Photo */}
            <div className="relative w-64 h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex-shrink-0 overflow-hidden">
              {community.photos && community.photos.length > 0 && community.photos[0] ? (
                <img 
                  src={community.photos[0]} 
                  alt={community.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Hide broken images and show placeholder instead
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className="mb-2 text-blue-600 dark:text-blue-400">
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                    </svg>
                  </div>
                  <h3 className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                    Photos Coming Soon
                  </h3>
                </div>
              )}
              
              {/* HUD Badge on photo */}
              {isHudProperty && (
                <div className="absolute top-2 left-2">
                  <Badge className="bg-green-600 text-white text-xs shadow-lg">
                    <Shield className="h-3 w-3 mr-1" />
                    HUD
                  </Badge>
                </div>
              )}
              
              {/* Heart/Favorite on photo */}
              <div className="absolute top-2 right-2">
                <div className="w-8 h-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 transition-colors cursor-pointer">
                  <Heart className="h-4 w-4 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors" />
                </div>
              </div>
            </div>
            
            {/* Middle - Community Info */}
            <div className="flex-1 p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  {/* Community Name & Location */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">
                    {community.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span>{community.city}, {community.state} {community.zipCode}</span>
                  </div>
                </div>
                
                {/* Availability Badge - TOP PRIORITY */}
                <div className="ml-4">
                  {isAvailable ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1.5 text-sm font-bold">
                      ✓ Available Now
                    </Badge>
                  ) : hasWaitlist ? (
                    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 px-3 py-1.5 text-sm font-bold">
                      ⏳ Wait List
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 px-3 py-1.5 text-sm">
                      Call for Status
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Key Features Row */}
              <div className="flex flex-wrap gap-3 mb-3 text-sm">
                {community.totalUnits && (
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <Building className="h-4 w-4 mr-1" />
                    <span>{community.totalUnits} units</span>
                  </div>
                )}
                {community.rating && (
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <span className="font-medium">{community.rating.toFixed(1)}</span>
                  </div>
                )}
                {community.careTypes && community.careTypes.length > 0 && (
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <Activity className="h-4 w-4 mr-1" />
                    <span>{community.careTypes.length} care levels</span>
                  </div>
                )}
              </div>
              
              {/* Care Types Badges */}
              {community.careTypes && community.careTypes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {community.careTypes.slice(0, 2).map((type, idx) => (
                    <Badge key={idx} className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {type}
                    </Badge>
                  ))}
                  {community.careTypes.length > 2 && (
                    <Badge className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                      +{community.careTypes.length - 2} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
            
            {/* Right Side - Pricing & Contact PRIORITY SECTION */}
            <div className="w-80 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 border-l-2 border-gray-200 dark:border-gray-700">
              {/* PRICING - TOP PRIORITY */}
              <div className="mb-4">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {displayPrice}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {priceSource}
                </div>
                {community.displayPricing?.priceLabel && (
                  <Badge className="mt-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {community.displayPricing.priceLabel}
                  </Badge>
                )}
              </div>
              
              {/* CONTACT - HIGH PRIORITY */}
              <div className="space-y-3">
                {community.phone ? (
                  <a
                    href={`tel:${community.phone}`}
                    className="flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    {community.phone}
                  </a>
                ) : (
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3">
                    <Phone className="h-5 w-5 mr-2" />
                    Contact Community
                  </Button>
                )}
                
                {/* Quick Actions */}
                <Button 
                  variant="outline" 
                  className="w-full border-2 border-gray-300 dark:border-gray-600 font-semibold"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    onSelect?.();
                  }}
                >
                  View Full Details →
                </Button>
              </div>
              
              {/* Occupancy Details */}
              {occupancyRate && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Occupancy</span>
                    <span className={`font-bold ${occupancyRate < 85 ? 'text-green-600' : occupancyRate < 95 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {Math.round(occupancyRate)}%
                    </span>
                  </div>
                </div>
              )}
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
    
    // Calculate display price for featured/coastal/hud variants
    const priceDisplay = community.displayPricing?.displayPrice || 
      (community.hudPropertyId && community.rentPerMonth ? 
        `$${typeof community.rentPerMonth === 'number' ? community.rentPerMonth.toFixed(0) : community.rentPerMonth}` : 
        community.priceRange ? 
          `$${community.priceRange.min} - $${community.priceRange.max}` : 
          null);

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
            
            {/* Pricing Badge - Top Right Corner */}
            <div className="absolute top-2 right-2 z-10">
              {priceDisplay ? (
                <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {priceDisplay}
                  </div>
                  {isHudProperty && (
                    <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                      HUD
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                    Contact for pricing
                  </div>
                </div>
              )}
            </div>
            
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
              
              {/* Direct Message Button - Disabled until verified */}
              <button 
                className="w-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 py-2 px-3 rounded-lg cursor-not-allowed opacity-75 flex items-center justify-center gap-1 text-xs"
                disabled={true}
                title="Direct messaging available after community verification"
              >
                <MessageCircle className="h-3 w-3" />
                <span>Direct Message - Verification Required</span>
              </button>
              
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
  // Calculate display price for standard fallback variant
  const standardDisplayPrice = community.displayPricing?.displayPrice || 
    (community.hudPropertyId && community.rentPerMonth ? 
      `$${typeof community.rentPerMonth === 'number' ? community.rentPerMonth.toFixed(0) : community.rentPerMonth}` : 
      community.priceRange ? 
        `$${community.priceRange.min} - $${community.priceRange.max}` : 
        'Contact for Pricing');
  
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
              {standardDisplayPrice}
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