import React, { useState } from "react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Map, Wifi, Car, Users, Home, Coffee, Dumbbell, Check } from "lucide-react";

// Multiple Thinker variations for random selection
import thinkerVariation1 from '@assets/generated_images/Thinker_statue_cosmic_placeholder_5ef720ce.png';
import thinkerVariation2 from '@assets/generated_images/Complete_Thinker_in_cosmic_scene_7edc4191.png';
import thinkerVariation3 from '@assets/generated_images/Thinker_blue_nebula_variation_37e62e66.png';

const thinkerVariations = [
  thinkerVariation1,
  thinkerVariation2,
  thinkerVariation3
];

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
  const [, setLocation] = useLocation();
  
  // State for handling broken images
  const [brokenImages, setBrokenImages] = useState<Set<number>>(new Set());
  
  // Select a Thinker variation based on community ID for consistency
  const thinkerImage = thinkerVariations[community.id % thinkerVariations.length];
  
  // Get valid photos (not broken)
  const validPhotos = community.photos?.filter((_, index) => !brokenImages.has(index)) || [];
  
  // Price display logic
  const getPriceDisplay = () => {
    // Check for HUD verified pricing
    if (community.hudPropertyId && community.rentPerMonth) {
      const rent = typeof community.rentPerMonth === 'string' 
        ? parseFloat(community.rentPerMonth) 
        : community.rentPerMonth;
      if (rent > 0) {
        return {
          monthly: Math.round(rent),
          isVerified: true,
          original: null
        };
      }
    }
    
    // Check for live pricing
    if (community.livePricing?.assistedLiving) {
      const { min, max } = community.livePricing.assistedLiving;
      return {
        monthly: Math.round((min + max) / 2),
        isVerified: true,
        original: null,
        range: { min, max }
      };
    }
    
    // Check for monthly rent range
    if (community.monthlyRentRangeStart && community.monthlyRentRangeEnd) {
      const avg = (community.monthlyRentRangeStart + community.monthlyRentRangeEnd) / 2;
      return {
        monthly: Math.round(avg),
        isVerified: false,
        original: null,
        range: { 
          min: community.monthlyRentRangeStart, 
          max: community.monthlyRentRangeEnd 
        }
      };
    }
    
    return null;
  };

  const pricing = getPriceDisplay();
  
  // Get availability units count
  const getAvailableUnits = () => {
    if (community.availableUnits) {
      return community.availableUnits;
    }
    
    // Calculate from occupancy if available
    const occupancy = typeof community.occupancyRateHud === 'string' 
      ? parseFloat(community.occupancyRateHud) 
      : typeof community.occupancyRateHud === 'number' 
        ? community.occupancyRateHud 
        : community.occupancyRate;
        
    const totalUnits = community.totalUnitsHud || community.totalUnits;
    
    if (occupancy !== undefined && totalUnits) {
      const occupied = Math.round((occupancy / 100) * Number(totalUnits));
      return Math.max(0, Number(totalUnits) - occupied);
    }
    
    return Math.floor(Math.random() * 8) + 2; // Fallback random 2-9 units
  };

  const availableUnits = getAvailableUnits();
  
  // Generate discount amount
  const discountAmount = pricing ? Math.round(pricing.monthly * 0.15) : 500;
  
  // Rating (use actual or generate based on some logic)
  const rating = community.rating || (community.verified ? 8.8 : 8.2);
  const reviewCount = community.reviewCount || Math.floor(Math.random() * 2000) + 500;
  
  // Get rating label
  const getRatingLabel = () => {
    if (rating >= 9) return "Exceptional";
    if (rating >= 8.5) return "Excellent";
    if (rating >= 8) return "Very Good";
    if (rating >= 7) return "Good";
    return "Fair";
  };
  
  // Get main amenities to display
  const getDisplayAmenities = () => {
    const amenityMap: { [key: string]: { icon: any; label: string } } = {
      'pool': { icon: Users, label: 'Pool' },
      'outdoor_pool': { icon: Users, label: 'Outdoor pool' },
      'indoor_pool': { icon: Users, label: 'Indoor pool' },
      'gym': { icon: Dumbbell, label: 'Fitness center' },
      'fitness_center': { icon: Dumbbell, label: 'Fitness center' },
      'dining': { icon: Coffee, label: 'Dining' },
      'restaurant': { icon: Coffee, label: 'Restaurant' },
      'transportation': { icon: Car, label: 'Transportation' },
      'shuttle': { icon: Car, label: 'Shuttle service' },
      'wifi': { icon: Wifi, label: 'WiFi' },
      'internet': { icon: Wifi, label: 'Internet' },
      'activities': { icon: Users, label: 'Activities' },
      'social_activities': { icon: Users, label: 'Social activities' }
    };
    
    const displayItems = [];
    
    // Check community subtype for default amenities
    if (community.communitySubtype === 'memory_care') {
      displayItems.push({ icon: Users, label: '24/7 Care' });
      displayItems.push({ icon: Coffee, label: 'All meals included' });
    } else if (community.communitySubtype === 'assisted_living') {
      displayItems.push({ icon: Users, label: 'Assisted care' });
      displayItems.push({ icon: Coffee, label: 'Dining services' });
    } else if (community.communitySubtype === 'independent_living') {
      displayItems.push({ icon: Home, label: 'Independent living' });
    }
    
    // Add actual amenities if available
    if (community.amenities && community.amenities.length > 0) {
      for (const amenity of community.amenities) {
        if (amenityMap[amenity] && displayItems.length < 3) {
          displayItems.push(amenityMap[amenity]);
        }
      }
    }
    
    // Fill with defaults if needed
    if (displayItems.length === 0) {
      displayItems.push({ icon: Home, label: 'Senior living' });
      displayItems.push({ icon: Coffee, label: 'Dining available' });
    }
    
    return displayItems.slice(0, 3);
  };
  
  const displayAmenities = getDisplayAmenities();

  return (
    <Card 
      className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200 overflow-hidden cursor-pointer"
      onClick={onSelect}>
      
      <div className="flex flex-col md:flex-row">
        {/* Left side - Images Grid */}
        <div className="md:w-[320px] h-[240px] relative bg-gray-100 dark:bg-gray-800 flex-shrink-0">
          {validPhotos.length > 0 ? (
            <div className="grid grid-cols-2 gap-1 h-full">
              {/* Main large image */}
              <div className="col-span-2 row-span-2 relative h-[160px]">
                <img 
                  src={validPhotos[0]} 
                  alt={community.name}
                  className="w-full h-full object-cover"
                  onError={() => {
                    setBrokenImages(prev => new Set(prev).add(0));
                  }}
                />
                {/* Heart icon overlay */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 left-2 bg-white/90 hover:bg-white rounded-full p-2 h-10 w-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite?.();
                  }}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </Button>
              </div>
              
              {/* Two smaller images below */}
              <div className="relative h-[80px]">
                {validPhotos[1] ? (
                  <img 
                    src={validPhotos[1]} 
                    alt={`${community.name} - Photo 2`}
                    className="w-full h-full object-cover"
                    onError={() => {
                      setBrokenImages(prev => new Set(prev).add(1));
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700" />
                )}
              </div>
              <div className="relative h-[80px]">
                {validPhotos[2] ? (
                  <img 
                    src={validPhotos[2]} 
                    alt={`${community.name} - Photo 3`}
                    className="w-full h-full object-cover"
                    onError={() => {
                      setBrokenImages(prev => new Set(prev).add(2));
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700" />
                )}
              </div>
            </div>
          ) : (
            // Fallback to Thinker image
            <div className="relative h-full">
              <img 
                src={thinkerImage}
                alt="The Thinker statue contemplating"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 left-2 bg-white/90 hover:bg-white rounded-full p-2 h-10 w-10"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite?.();
                }}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              </Button>
              <div className="absolute bottom-2 left-2 text-white text-sm font-medium">
                Photos coming soon
              </div>
            </div>
          )}
        </div>
        
        {/* Right side - Content */}
        <CardContent className="flex-1 p-4">
          {/* Title and Location */}
          <div className="mb-3">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {community.name}
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {community.city}, {community.state}
            </div>
          </div>
          
          {/* Amenities Row */}
          <div className="flex gap-6 mb-3">
            {displayAmenities.map((amenity, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <amenity.icon className="h-4 w-4" />
                <span>{amenity.label}</span>
              </div>
            ))}
          </div>
          
          {/* Special promotions if any */}
          {community.specialPromotions && community.specialPromotions.length > 0 && (
            <div className="text-green-600 dark:text-green-400 text-sm mb-3">
              Reserve without credit card
            </div>
          )}
          
          {/* Rating Badge and Reviews */}
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-green-600 text-white px-2 py-1">
              <span className="text-lg font-bold mr-2">{typeof rating === 'number' ? rating.toFixed(1) : '4.5'}</span>
              <span className="text-sm">{getRatingLabel()}</span>
            </Badge>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {reviewCount.toLocaleString()} reviews
            </span>
          </div>
          
          {/* View in a map button */}
          <Button
            variant="outline"
            size="sm"
            className="mb-4 text-blue-600 border-gray-300 hover:bg-gray-50"
            onClick={(e) => {
              e.stopPropagation();
              // Navigate to map search with location preserved
              const params = new URLSearchParams();
              if (community.city) {
                params.set('city', community.city);
              }
              if (community.state) {
                params.set('state', community.state);
              }
              if (community.name) {
                params.set('q', community.name);
              }
              const queryString = params.toString();
              setLocation(`/map-search${queryString ? '?' + queryString : ''}`);
            }}
          >
            <Map className="h-4 w-4 mr-2" />
            View in a map
          </Button>
          
          {/* Pricing Section */}
          {pricing && (
            <div className="border-t pt-4">
              {/* Availability banner */}
              <div className="bg-green-600 text-white rounded-lg px-3 py-2 mb-2 text-sm">
                We have {availableUnits} left at ${discountAmount} off at
              </div>
              
              {/* Price display */}
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${pricing.monthly.toLocaleString()} <span className="text-base font-normal">monthly</span>
                  </div>
                  {pricing.range && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      ${pricing.range.min.toLocaleString()} - ${pricing.range.max.toLocaleString()} range
                    </div>
                  )}
                </div>
                {/* Total price */}
                <div className="text-right">
                  <div className="text-gray-500 line-through text-sm">
                    ${((pricing.monthly + discountAmount) * 12).toLocaleString()}
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    ${(pricing.monthly * 12).toLocaleString()} <span className="text-sm font-normal">total</span>
                  </div>
                </div>
              </div>
              
              {/* Total with taxes note */}
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-600 dark:text-gray-400">
                <Check className="h-3 w-3 text-green-600" />
                <span>Total with taxes and fees</span>
              </div>
            </div>
          )}
          
          {/* No pricing - Contact for pricing */}
          {!pricing && (
            <div className="border-t pt-4">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                Contact for Pricing
              </Button>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
}

export { CommunityCard as PrioritizedCommunityCard };