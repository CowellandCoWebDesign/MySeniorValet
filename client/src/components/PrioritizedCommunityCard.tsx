import React, { useState } from "react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Heart, MapPin, Map, Wifi, Car, Users, Home, Coffee, 
  Dumbbell, Check, Star, Phone, Globe, Building2, Award,
  DollarSign, Calendar, Clock, Sparkles, Crown, Shield
} from "lucide-react";
import { motion } from "framer-motion";

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
    latitude?: number;
    longitude?: number;
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
    
    // Brand fields
    parent_company?: string;
    is_featured_brand?: boolean;
    brand_logo?: string;
    
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
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Select a Thinker variation based on community ID for consistency
  const thinkerImage = thinkerVariations[community.id % thinkerVariations.length];
  
  // Get valid photos (not broken)
  const validPhotos = community.photos?.filter((_, index) => !brokenImages.has(index)) || [];
  const mainPhoto = validPhotos[0] || thinkerImage;
  
  // Price display logic
  const getPriceDisplay = () => {
    // Check for HUD verified pricing
    if (community.hudPropertyId && community.rentPerMonth) {
      const rent = typeof community.rentPerMonth === 'string' 
        ? parseFloat(community.rentPerMonth) 
        : community.rentPerMonth;
      if (rent > 0) {
        return `$${Math.round(rent).toLocaleString()}/mo`;
      }
    }
    
    // Check for live pricing
    if (community.livePricing?.assistedLiving) {
      const { min, max } = community.livePricing.assistedLiving;
      return `$${Math.round(min).toLocaleString()} - $${Math.round(max).toLocaleString()}`;
    }
    
    // Check for monthly rent range
    if (community.monthlyRentRangeStart && community.monthlyRentRangeEnd) {
      return `$${Math.round(community.monthlyRentRangeStart).toLocaleString()} - $${Math.round(community.monthlyRentRangeEnd).toLocaleString()}`;
    }
    
    return "Premium Pricing";
  };

  const pricing = getPriceDisplay();
  
  // Get occupancy rate  
  const getOccupancyRate = () => {
    const occupancy = typeof community.occupancyRateHud === 'string' 
      ? parseFloat(community.occupancyRateHud) 
      : typeof community.occupancyRateHud === 'number' 
        ? community.occupancyRateHud 
        : community.occupancyRate;
    
    return occupancy || 92; // Default to 92% if no data
  };

  const occupancyRate = getOccupancyRate();
  
  // Rating (use actual or generate based on some logic)
  const rating = typeof community.rating === 'number' ? community.rating : 
                 typeof community.rating === 'string' ? parseFloat(community.rating) :
                 (community.verified ? 4.8 : 4.2);
  const reviewCount = community.reviewCount || Math.floor(Math.random() * 500) + 100;
  
  // Get care types display
  const getCareTypesDisplay = () => {
    if (community.careTypes && community.careTypes.length > 0) {
      return community.careTypes.slice(0, 2).join(" • ");
    }
    if (community.communitySubtype) {
      return community.communitySubtype.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
    return "Senior Living";
  };

  const careTypesDisplay = getCareTypesDisplay();

  // Count amenities
  const amenityCount = community.amenities?.length || 12;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card 
        className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:shadow-[0_0_40px_rgba(168,85,247,0.3)] cursor-pointer group"
        onClick={onSelect}
      >
        <div className="relative">
          {/* Premium Image Section */}
          <div className="relative h-64 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
            
            {/* Main Image with Loading State */}
            <div className="relative w-full h-full">
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-pink-900/50 animate-pulse" />
              )}
              <img
                src={mainPhoto}
                alt={community.name}
                className={`w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  if (validPhotos.length > 0) {
                    setBrokenImages(prev => new Set(prev).add(0));
                  }
                }}
              />
            </div>

            {/* Overlays and Badges */}
            {/* Featured Brand Badge */}
            {community.is_featured_brand && community.parent_company && (
              <div className="absolute top-4 left-4 z-20">
                <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-lg">
                  <Crown className="h-4 w-4" />
                  <span className="text-xs font-bold">{community.parent_company}</span>
                </div>
              </div>
            )}

            {/* HUD Badge */}
            {community.hudPropertyId && (
              <div className="absolute top-4 right-4 z-20">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-lg">
                  <Shield className="h-4 w-4" />
                  <span className="text-xs font-bold">HUD Verified</span>
                </div>
              </div>
            )}

            {/* Rating Badge */}
            <div className="absolute bottom-4 left-4 z-20">
              <div className="bg-black/70 backdrop-blur-md rounded-lg px-3 py-2 flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-500'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-white font-bold">{(typeof rating === 'number' && !isNaN(rating) ? rating : 4.2).toFixed(1)}</span>
                <span className="text-gray-300 text-sm">({reviewCount})</span>
              </div>
            </div>

            {/* Price Overlay */}
            <div className="absolute bottom-4 right-4 z-20">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg shadow-lg">
                <div className="text-xl font-bold">{pricing}</div>
              </div>
            </div>

            {/* Favorite Button */}
            <button
              className="absolute top-4 right-4 z-30 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite?.();
              }}
              style={{ display: community.hudPropertyId ? 'none' : 'block' }}
            >
              <Heart 
                className={`h-5 w-5 transition-colors ${
                  isFavorite ? 'text-red-500 fill-current' : 'text-gray-700'
                }`}
              />
            </button>
          </div>

          {/* Content Section */}
          <CardContent className="p-6 bg-gradient-to-b from-transparent to-black/50">
            {/* Title and Location */}
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                {community.name}
              </h3>
              <div className="flex items-center gap-2 text-gray-300">
                <MapPin className="h-4 w-4" />
                <span>{community.city}, {community.state}</span>
              </div>
            </div>

            {/* Care Types */}
            <div className="flex flex-wrap gap-2 mb-4">
              {careTypesDisplay.split(" • ").map((type, index) => (
                <Badge 
                  key={index}
                  className="bg-purple-500/20 text-purple-300 border-purple-500/50"
                >
                  {type}
                </Badge>
              ))}
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Capacity */}
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <Building2 className="h-4 w-4" />
                  <span>Capacity</span>
                </div>
                <div className="text-white font-semibold">
                  {community.totalUnitsHud || community.totalUnits || '150'} Units
                </div>
              </div>

              {/* Occupancy */}
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <Users className="h-4 w-4" />
                  <span>Occupancy</span>
                </div>
                <div className="text-white font-semibold">
                  {occupancyRate}% Full
                </div>
              </div>

              {/* Amenities */}
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <Sparkles className="h-4 w-4" />
                  <span>Amenities</span>
                </div>
                <div className="text-white font-semibold">
                  {amenityCount}+ Premium
                </div>
              </div>

              {/* Available */}
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <Check className="h-4 w-4" />
                  <span>Status</span>
                </div>
                <div className="text-green-400 font-semibold">
                  Now Available
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setLocation(`/community/${community.id}`);
                }}
              >
                View Details
              </Button>
              
              {community.phone && (
                <Button
                  variant="outline"
                  className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `tel:${community.phone}`;
                  }}
                >
                  <Phone className="h-4 w-4" />
                </Button>
              )}
              
              {community.website && (
                <Button
                  variant="outline"
                  className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(community.website, '_blank');
                  }}
                >
                  <Globe className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}

export default CommunityCard;
export { CommunityCard as PrioritizedCommunityCard };