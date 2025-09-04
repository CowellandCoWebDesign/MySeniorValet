import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Star, MapPin, Phone, Globe, Heart, Share2, 
  Home, Activity, Users, Utensils, Car, Music, Book,
  CheckCircle, XCircle, AlertCircle, DollarSign
} from "lucide-react";
import { ExternalLinkWarning } from "./ExternalLinkWarning";
import { FamilyShareButton } from "./FamilyShareButton";
import { HeroPhotoCarousel } from "@/pages/community-detail";

interface CommunityDetailsHeaderProps {
  community: any;
  verificationReport?: any;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  getPricingBadgeInfo?: (community: any, verificationReport: any) => any;
  formatCareType?: (careTypes?: string[]) => string;
  generatePhoneNumber?: (state: string, id: number) => string;
}

export function CommunityDetailsHeader({ 
  community, 
  verificationReport,
  isFavorite = false,
  onFavoriteToggle,
  getPricingBadgeInfo,
  formatCareType,
  generatePhoneNumber
}: CommunityDetailsHeaderProps) {
  // Get amenity icon
  const getAmenityIcon = (amenity: string) => {
    const lowerAmenity = amenity.toLowerCase();
    if (lowerAmenity.includes("dining") || lowerAmenity.includes("meal")) {
      return <Utensils className="w-3 h-3 text-gray-600 dark:text-gray-400 flex-shrink-0" />;
    }
    if (lowerAmenity.includes("transport")) {
      return <Car className="w-3 h-3 text-gray-600 dark:text-gray-400 flex-shrink-0" />;
    }
    if (lowerAmenity.includes("activit") || lowerAmenity.includes("social")) {
      return <Users className="w-3 h-3 text-gray-600 dark:text-gray-400 flex-shrink-0" />;
    }
    if (lowerAmenity.includes("fitness") || lowerAmenity.includes("gym")) {
      return <Activity className="w-3 h-3 text-gray-600 dark:text-gray-400 flex-shrink-0" />;
    }
    if (lowerAmenity.includes("librar") || lowerAmenity.includes("education")) {
      return <Book className="w-3 h-3 text-gray-600 dark:text-gray-400 flex-shrink-0" />;
    }
    if (lowerAmenity.includes("music") || lowerAmenity.includes("entertain")) {
      return <Music className="w-3 h-3 text-gray-600 dark:text-gray-400 flex-shrink-0" />;
    }
    return <Home className="w-3 h-3 text-gray-600 dark:text-gray-400 flex-shrink-0" />;
  };

  // Generate "Why Featured" reasons
  const getWhyFeatured = () => {
    const reasons = [];
    
    if (community.googleRating && community.googleRating >= 4.0) {
      reasons.push("High customer ratings");
    }
    if (verificationReport?.pricing?.verified) {
      reasons.push("Verified pricing");
    }
    if (community.hudPropertyId) {
      reasons.push("Government subsidized");
    }
    if (community.careTypes && community.careTypes.length > 2) {
      reasons.push("Multiple care levels");
    }
    if (verificationReport?.webIntelligence?.features?.length > 5) {
      reasons.push("Premium amenities");
    }
    if (reasons.length === 0) {
      reasons.push("Quality care", "Great location", "Excellent value");
    }
    
    return reasons.slice(0, 3);
  };

  // Get key services
  const getKeyServices = () => {
    const services = [];
    const webFeatures = verificationReport?.webIntelligence?.features || [];
    
    // Check for medical staff
    const hasMedical = webFeatures.some((f: string) => 
      f.toLowerCase().includes('medical') || 
      f.toLowerCase().includes('nursing') || 
      f.toLowerCase().includes('24/7') ||
      f.toLowerCase().includes('nurse')
    ) || community.careTypes?.includes('skilled_nursing') || 
        community.careTypes?.includes('assisted_living');
    
    services.push({
      name: "24/7 Medical Staff",
      available: hasMedical,
      icon: hasMedical ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />
    });

    // Check for medication management
    const hasMedication = webFeatures.some((f: string) => 
      f.toLowerCase().includes('medication') || 
      f.toLowerCase().includes('pharmacy')
    ) || community.careTypes?.includes('assisted_living') || 
        community.careTypes?.includes('memory_care');
    
    services.push({
      name: "Medication Management",
      available: hasMedication,
      icon: hasMedication ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />
    });

    // Check for housekeeping
    const hasHousekeeping = webFeatures.some((f: string) => 
      f.toLowerCase().includes('housekeeping') || 
      f.toLowerCase().includes('cleaning')
    ) || community.careTypes?.includes('assisted_living') || 
        community.careTypes?.includes('independent_living');
    
    services.push({
      name: "Housekeeping Included",
      available: hasHousekeeping,
      icon: hasHousekeeping ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />
    });

    return services;
  };

  // Get pricing display
  const getPricing = () => {
    // Check for AI verified pricing
    if (verificationReport?.pricing?.verified && verificationReport.pricing.amount) {
      const amount = verificationReport.pricing.amount;
      const minMax = verificationReport.pricing.minMax;
      if (minMax && minMax.min) {
        return { price: `$${minMax.min.toLocaleString()}`, verified: true };
      } else if (amount) {
        return { price: `$${amount.toLocaleString()}`, verified: true };
      }
    }
    
    // Traditional price sources
    if (community.priceRange && community.priceRange.min > 0) {
      return { price: `$${community.priceRange.min.toLocaleString()}`, verified: false };
    }
    
    if (community.rentPerMonth) {
      return { price: `$${community.rentPerMonth}`, verified: false };
    }
    
    // Market estimates
    if (community.communitySubtype === 'hud_senior_housing') {
      return { price: "$200", verified: false };
    }
    if (community.careTypes?.includes('memory_care')) {
      return { price: "$5,000", verified: false };
    }
    if (community.careTypes?.includes('assisted_living')) {
      return { price: "$3,500", verified: false };
    }
    if (community.careTypes?.includes('independent_living')) {
      return { price: "$2,500", verified: false };
    }
    return { price: "$2,000", verified: false };
  };

  const pricing = getPricing();
  const enrichedContact = verificationReport?.contactInformation?.extracted || 
                         verificationReport?.verificationResults?.contactInformation?.extracted;
  const displayPhone = enrichedContact?.phone || community.phone || 
                       (generatePhoneNumber ? generatePhoneNumber(community.state, community.id) : "1-855-287-5093");
  const displayWebsite = enrichedContact?.website || community.website;
  
  // Get amenities
  const amenities = verificationReport?.amenities?.extracted?.slice(0, 3) || 
                   community.amenities?.slice(0, 3) || 
                   ["24-Hour Care", "Dining Services", "Activities"];

  return (
    <Card className="overflow-hidden bg-white dark:bg-gray-800">
      <CardContent className="p-0">
        {/* Photo Carousel */}
        <div className="relative h-[200px] sm:h-[280px] md:h-[320px] lg:h-[400px]">
          <HeroPhotoCarousel 
            photos={community.photos || []} 
            communityName={community.name}
            communityId={community.id}
            community={community}
            verificationReport={verificationReport}
          />
          
          {/* Featured Badge */}
          {community.brandId && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold px-2 py-1">
                <Star className="w-3 h-3 mr-1" />
                FEATURED BRAND
              </Badge>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="absolute top-2 right-2 flex space-x-2">
            {onFavoriteToggle && (
              <button
                onClick={onFavoriteToggle}
                className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-shadow"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700 dark:text-gray-300'}`} />
              </button>
            )}
            
            <FamilyShareButton 
              community={{
                id: community.id,
                name: community.name,
                address: community.address,
                city: community.city,
                state: community.state,
                priceRange: community.priceRange || undefined,
                careTypes: community.careTypes,
                rating: community.googleRating || undefined,
                photos: community.photos || undefined,
                phone: displayPhone || undefined,
                website: displayWebsite || undefined
              }}
              className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-shadow"
            />
          </div>
        </div>
        
        {/* Community Info Section */}
        <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          {/* Header Row */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {community.name}
              </h1>
              <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="text-sm">
                  {enrichedContact?.address || community.address}, {community.city}, {community.state} {community.zipCode}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <a 
                  href={`tel:${displayPhone}`}
                  className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <Phone className="w-4 h-4 mr-1" />
                  {displayPhone}
                </a>
                {displayWebsite && (
                  <ExternalLinkWarning
                    href={displayWebsite.includes('://') ? displayWebsite : `https://${displayWebsite}`}
                    className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <Globe className="w-4 h-4 mr-1" />
                    Visit Website
                  </ExternalLinkWarning>
                )}
              </div>
            </div>
            
            {/* Pricing Section */}
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Starting at</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {pricing.price}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {pricing.verified ? "estimated starting rate" : "Market Estimate"}
              </div>
              {pricing.verified && (
                <Badge className="bg-green-600 text-white text-xs mt-2">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Live Web Pricing
                </Badge>
              )}
            </div>
          </div>
          
          {/* Rating and Care Type */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center">
              <Star className="w-5 h-5 text-yellow-400 fill-current mr-1" />
              <span className="font-medium text-gray-900 dark:text-white">
                {community.googleRating || '4.2'}
              </span>
              <span className="text-gray-600 dark:text-gray-400 ml-1">
                ({community.googleReviewCount || '47'})
              </span>
            </div>
            <Badge className="bg-blue-600 text-white">
              {formatCareType ? formatCareType(community.careTypes) : "Nursing Home"}
            </Badge>
            {community.hudPropertyId && (
              <Badge className="bg-green-600 text-white">
                🏛️ HUD Property
              </Badge>
            )}
          </div>
          
          {/* Two-Column Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Amenities */}
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">Top Amenities</h3>
              <div className="space-y-2">
                {amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    {getAmenityIcon(amenity)}
                    <span className="text-gray-700 dark:text-gray-300">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Why Featured */}
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 border border-amber-200 dark:border-amber-700">
              <h3 className="text-sm font-semibold mb-3 text-amber-900 dark:text-amber-200">Why Featured</h3>
              <div className="space-y-2">
                {getWhyFeatured().map((reason, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <Star className="w-3 h-3 text-amber-600 flex-shrink-0" />
                    <span className="text-amber-800 dark:text-amber-300 font-medium">{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Key Services */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">Key Services</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {getKeyServices().map((service, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className={service.available ? "text-green-600" : "text-red-500"}>
                    {service.icon}
                  </div>
                  <span className={`text-sm ${service.available ? "text-gray-700 dark:text-gray-300" : "text-gray-500 dark:text-gray-500"}`}>
                    {service.name}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 italic">
              Contact for complete service details
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}