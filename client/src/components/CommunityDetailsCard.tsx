import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Star, Home, Shield, Award, TrendingUp, Sparkles, Building, Users, Dumbbell, UtensilsCrossed, Wifi, Car } from "lucide-react";

interface CommunityDetailsCardProps {
  community: {
    id: number;
    name: string;
    city: string;
    state: string;
    address?: string | null;
    phone?: string | null;
    rating?: number | null;
    reviewCount?: number | null;
    careTypes?: string[] | null;
    rentPerMonth?: number | string | null;
    monthlyRentRangeStart?: number | null;
    monthlyRentRangeEnd?: number | null;
    priceRange?: { min: number; max: number } | null;
    hudPropertyId?: string | null;
    amenities?: string[] | null;
    communitySubtype?: string | null;
    pricingType?: string | null;
    livePricing?: {
      independentLiving?: { min: number; max: number };
      assistedLiving?: { min: number; max: number };
      memoryCare?: { min: number; max: number };
    } | null;
    transparencyScore?: number | null;
  };
}

export function CommunityDetailsCard({ community }: CommunityDetailsCardProps) {
  // Get the primary care type
  const primaryCareType = community.careTypes?.[0] || "Senior Living";
  
  // Format price display
  const getPrice = () => {
    // HUD verified pricing
    if (community.rentPerMonth) {
      return `$${Number(community.rentPerMonth).toLocaleString()}`;
    }
    
    // Live pricing
    if (community.livePricing?.assistedLiving) {
      const { min } = community.livePricing.assistedLiving;
      return `$${Math.round(min).toLocaleString()}`;
    }
    
    // Price range
    if (community.priceRange?.min) {
      return `$${Number(community.priceRange.min).toLocaleString()}`;
    }
    
    // Monthly rent range
    if (community.monthlyRentRangeStart) {
      return `$${Number(community.monthlyRentRangeStart).toLocaleString()}`;
    }
    
    return "Contact";
  };
  
  // Get price source label
  const getPriceLabel = () => {
    if (community.hudPropertyId) return "HUD Verified";
    if (community.pricingType === 'live') return "Live Pricing";
    return "Market Estimate";
  };
  
  // Top amenities to highlight (max 4-6)
  const getTopAmenities = () => {
    const amenityIcons: Record<string, React.ReactNode> = {
      'fitness': <Dumbbell className="h-4 w-4" />,
      'gym': <Dumbbell className="h-4 w-4" />,
      'dining': <UtensilsCrossed className="h-4 w-4" />,
      'restaurant': <UtensilsCrossed className="h-4 w-4" />,
      'wifi': <Wifi className="h-4 w-4" />,
      'internet': <Wifi className="h-4 w-4" />,
      'parking': <Car className="h-4 w-4" />,
      'transportation': <Car className="h-4 w-4" />,
      'pool': <Sparkles className="h-4 w-4" />,
      'activities': <Users className="h-4 w-4" />,
    };
    
    if (!community.amenities || community.amenities.length === 0) {
      return [];
    }
    
    // Prioritize key amenities
    const priorityAmenities = community.amenities
      .filter(a => {
        const lower = a.toLowerCase();
        return Object.keys(amenityIcons).some(key => lower.includes(key));
      })
      .slice(0, 4)
      .map(amenity => {
        const lower = amenity.toLowerCase();
        const iconKey = Object.keys(amenityIcons).find(key => lower.includes(key));
        return {
          name: amenity,
          icon: iconKey ? amenityIcons[iconKey] : <Building className="h-4 w-4" />
        };
      });
    
    // Fill remaining slots with other amenities if needed
    if (priorityAmenities.length < 4) {
      const otherAmenities = community.amenities
        .filter(a => !priorityAmenities.find(p => p.name === a))
        .slice(0, 4 - priorityAmenities.length)
        .map(amenity => ({
          name: amenity,
          icon: <Building className="h-4 w-4" />
        }));
      return [...priorityAmenities, ...otherAmenities];
    }
    
    return priorityAmenities;
  };
  
  const topAmenities = getTopAmenities();
  const displayPrice = getPrice();
  const priceLabel = getPriceLabel();
  
  return (
    <Card className="w-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-xl">
      <CardContent className="p-6">
        {/* Header Section */}
        <div className="space-y-4">
          {/* Name and Location */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {community.name}
            </h2>
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <MapPin className="h-4 w-4 mr-2 text-blue-500" />
              <span>{community.address || `${community.city}, ${community.state}`}</span>
            </div>
          </div>
          
          {/* Contact Button */}
          {community.phone && (
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
              onClick={() => window.location.href = `tel:${community.phone}`}
            >
              <Phone className="h-4 w-4 mr-2" />
              {community.phone}
            </Button>
          )}
          
          {/* Price Section */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
            <div className="text-sm opacity-90 mb-1">Monthly Starting From</div>
            <div className="text-3xl font-bold mb-2">{displayPrice}</div>
            <div className="text-xs opacity-75">{priceLabel}</div>
          </div>
          
          {/* Rating and Care Type */}
          <div className="flex items-center justify-between">
            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full">
                <Star className="h-5 w-5 text-yellow-500 fill-current mr-1" />
                <span className="font-bold text-gray-900 dark:text-white">
                  {community.rating ? community.rating.toFixed(1) : "N/A"}
                </span>
              </div>
              {community.reviewCount && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({community.reviewCount} reviews)
                </span>
              )}
            </div>
            
            {/* Care Type Badge */}
            <Badge className="bg-blue-500 text-white px-3 py-1 text-sm font-semibold">
              {primaryCareType}
            </Badge>
          </div>
          
          {/* Top Amenities Section */}
          {topAmenities.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex items-center mb-3">
                <Home className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Top Amenities</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {topAmenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                    {amenity.icon}
                    <span>{amenity.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Why Featured Section */}
          {(community.hudPropertyId || community.pricingType === 'live' || community.transparencyScore) && (
            <div className="border-t pt-4">
              <div className="flex items-center mb-3">
                <Star className="h-5 w-5 text-yellow-500 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Why Featured</h3>
              </div>
              <div className="space-y-2">
                {community.hudPropertyId && (
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">HUD Verified Pricing</span>
                  </div>
                )}
                {community.pricingType === 'live' && (
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Live Market Pricing</span>
                  </div>
                )}
                {community.transparencyScore && community.transparencyScore >= 80 && (
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">High Transparency Score</span>
                  </div>
                )}
                {community.rating && community.rating >= 4.5 && (
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Top Rated Community</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}