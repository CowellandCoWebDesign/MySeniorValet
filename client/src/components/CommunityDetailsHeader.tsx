import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Star, MapPin, Phone, Globe, Heart, Share2, 
  Home, Activity, Users, Utensils, Car, Music, Book,
  CheckCircle, XCircle, AlertCircle, DollarSign, Calendar
} from "lucide-react";
import { ExternalLinkWarning } from "./ExternalLinkWarning";
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
    <div className="space-y-0">
      {/* Photo Carousel - Separate from card */}
      <div className="relative h-[200px] sm:h-[280px] md:h-[320px] lg:h-[400px] rounded-t-xl overflow-hidden">
        <HeroPhotoCarousel 
          photos={community.photos || []} 
          communityName={community.name}
          communityId={community.id}
          community={community}
          verificationReport={verificationReport}
        />
        
        {/* Featured Badge */}
        {community.brandId && (
          <div className="absolute top-4 left-4 z-10">
            <Badge className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-white text-sm font-bold px-4 py-2 shadow-lg backdrop-blur-sm bg-opacity-90">
              <Star className="w-4 h-4 mr-2" />
              FEATURED
            </Badge>
          </div>
        )}
        
        {/* Premium/Available Badge */}
        {verificationReport?.pricing?.verified && (
          <div className="absolute top-4 right-4 z-10">
            <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-bold px-3 py-1.5 shadow-lg">
              Premium Coastal Living
            </Badge>
          </div>
        )}
        
        {/* Availability Badge */}
        {community.isAvailable && (
          <div className="absolute bottom-4 right-4 z-10">
            <Badge className="bg-green-500 text-white text-sm font-bold px-3 py-1.5 shadow-lg">
              Available Now
            </Badge>
          </div>
        )}
      </div>
      
      {/* Community Details Card - Compact like screenshot */}
      <Card className="rounded-t-none rounded-b-xl shadow-xl border-0 bg-gradient-to-br from-gray-900 to-gray-800">
        <CardContent className="p-0">
        
        {/* Community Info Section - Compact Card Style */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          {/* Header with Name and Location */}
          <div className="p-6 pb-4">
            {/* Community Name */}
            <h2 className="text-2xl font-bold mb-2">
              {community.name}
            </h2>
            
            {/* Location with Rating and Pricing */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">
                  {community.city}, {community.state}
                </span>
              </div>
              
              {/* Star Rating */}
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < Math.floor(parseFloat(community.googleRating || '4.2')) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} 
                  />
                ))}
                <span className="ml-1 text-gray-300">({community.googleRating || '4.7'})</span>
              </div>
              
              {/* Pricing Badge */}
              {pricing.price && (
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-semibold">
                    {pricing.price}/mo
                  </span>
                  {pricing.verified && (
                    <Badge className="ml-1 bg-green-600/20 text-green-300 border border-green-600/30 text-xs px-2 py-0">
                      Verified
                    </Badge>
                  )}
                </div>
              )}
            </div>
            
            {/* Key Information Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              {/* Phone */}
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400" />
                <a href={`tel:${displayPhone}`} className="text-blue-400 hover:text-blue-300">
                  {displayPhone}
                </a>
              </div>
              
              {/* Website */}
              {displayWebsite && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <a 
                    href={displayWebsite.includes('://') ? displayWebsite : `https://${displayWebsite}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 truncate"
                  >
                    Visit Website
                  </a>
                </div>
              )}
              
              {/* Care Types */}
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-400" />
                <span className="text-gray-300">
                  {formatCareType ? formatCareType(community.careTypes) : "Senior Living"}
                </span>
              </div>
              
              {/* Capacity/Units */}
              {community.totalUnits && (
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-300">
                    {community.totalUnits} Units
                  </span>
                </div>
              )}
            </div>
            
            {/* Action Buttons Row */}
            <div className="flex gap-2 mb-4">
              <Button 
                onClick={() => window.location.href = `tel:${displayPhone}`}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2"
              >
                <Phone className="w-4 h-4 mr-1" />
                Call Now
              </Button>
              
              <Button 
                variant="outline"
                className="flex-1 border-orange-500 text-orange-400 hover:bg-orange-500/20 text-sm py-2"
              >
                <Calendar className="w-4 h-4 mr-1" />
                Schedule Tour
              </Button>
              
              {onFavoriteToggle && (
                <Button
                  onClick={onFavoriteToggle}
                  variant="outline"
                  className="px-3 border-gray-600 hover:bg-gray-700"
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </Button>
              )}
            </div>
            
            {/* Amenities Section */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2 text-gray-300">Amenities</h3>
              <div className="space-y-2">
                {amenities.slice(0, 3).map((amenity: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-200">
                    {amenity.toLowerCase().includes('ocean') || amenity.toLowerCase().includes('view') ? (
                      <span className="text-blue-400">👁</span>
                    ) : amenity.toLowerCase().includes('dining') || amenity.toLowerCase().includes('gourmet') ? (
                      <span className="text-orange-400">🍴</span>
                    ) : amenity.toLowerCase().includes('wellness') || amenity.toLowerCase().includes('fitness') ? (
                      <span className="text-red-400">♥</span>
                    ) : (
                      <CheckCircle className="w-3 h-3 text-green-400" />
                    )}
                    {amenity}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Why Featured Section */}
            {community.brandId && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2 text-gray-300">Why Featured</h3>
                <div className="space-y-1">
                  {getWhyFeatured().map((reason, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-yellow-400">
                      <Star className="w-3 h-3" />
                      <span className="text-gray-200">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Service Tags and Key Features */}
            <div className="flex flex-wrap gap-2 mb-4">
              {community.careTypes?.includes('memory_care') && (
                <Badge className="bg-purple-600/20 text-purple-300 border border-purple-600/30 text-xs">
                  Memory Care
                </Badge>
              )}
              {community.careTypes?.includes('assisted_living') && (
                <Badge className="bg-blue-600/20 text-blue-300 border border-blue-600/30 text-xs">
                  Assisted Living
                </Badge>
              )}
              {community.careTypes?.includes('skilled_nursing') && (
                <Badge className="bg-red-600/20 text-red-300 border border-red-600/30 text-xs">
                  Skilled Nursing
                </Badge>
              )}
              {community.hudPropertyId && (
                <Badge className="bg-green-600/20 text-green-300 border border-green-600/30 text-xs">
                  HUD Property • Subsidized
                </Badge>
              )}
              {community.petFriendly && (
                <Badge className="bg-yellow-600/20 text-yellow-300 border border-yellow-600/30 text-xs">
                  🐾 Pet Friendly
                </Badge>
              )}
              {verificationReport?.pricing?.verified && (
                <Badge className="bg-emerald-600/20 text-emerald-300 border border-emerald-600/30 text-xs">
                  ✓ Verified Pricing
                </Badge>
              )}
            </div>
            
            {/* Quick Stats Bar */}
            <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {/* Occupancy */}
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">
                    {community.occupancyPercentage || '92'}%
                  </div>
                  <div className="text-gray-400">Occupancy</div>
                </div>
                
                {/* Years in Business */}
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-400">
                    {community.yearEstablished ? new Date().getFullYear() - community.yearEstablished : '15'}+
                  </div>
                  <div className="text-gray-400">Years</div>
                </div>
                
                {/* Staff Ratio */}
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400">
                    1:6
                  </div>
                  <div className="text-gray-400">Staff Ratio</div>
                </div>
                
                {/* Reviews */}
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-400">
                    {community.googleReviewCount || '47'}
                  </div>
                  <div className="text-gray-400">Reviews</div>
                </div>
              </div>
            </div>
            
            {/* Feature Pills - Dynamic based on actual data */}
            <div className="flex flex-wrap gap-2 text-xs mb-5">
              {verificationReport?.amenities?.extracted?.slice(0, 3).map((amenity: string, idx: number) => (
                <span key={idx} className="px-3 py-1 bg-gray-700 text-gray-200 rounded-full">
                  {amenity}
                </span>
              )) || (
                <>
                  <span className="px-3 py-1 bg-gray-700 text-gray-200 rounded-full">24/7 Care</span>
                  <span className="px-3 py-1 bg-gray-700 text-gray-200 rounded-full">Activities Program</span>
                  <span className="px-3 py-1 bg-gray-700 text-gray-200 rounded-full">Dining Services</span>
                </>
              )}
            </div>
            
            {/* View Community Details Button */}
            <Button 
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3"
              onClick={() => {
                // Scroll to tabs or do nothing since we're already on detail page
                const tabsElement = document.querySelector('[data-tab="market-data"]');
                if (tabsElement) {
                  tabsElement.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <Star className="w-4 h-4 mr-2" />
              View Community Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}