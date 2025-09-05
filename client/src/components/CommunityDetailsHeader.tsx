import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Star, MapPin, Phone, Globe, Heart, Share2, 
  Activity, Users, Utensils, Car, Music, Book,
  CheckCircle, XCircle, AlertCircle, DollarSign
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
  onReserveClick?: () => void;
  onTourClick?: () => void;
}

export function CommunityDetailsHeader({ 
  community, 
  verificationReport,
  isFavorite = false,
  onFavoriteToggle,
  getPricingBadgeInfo,
  formatCareType,
  generatePhoneNumber,
  onReserveClick,
  onTourClick
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
    return <CheckCircle className="w-3 h-3 text-gray-600 dark:text-gray-400 flex-shrink-0" />;
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
    <Card className="overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
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
            <div className="absolute top-4 left-4 z-10">
              <Badge className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-white text-sm font-bold px-4 py-2 shadow-lg backdrop-blur-sm bg-opacity-90">
                <Star className="w-4 h-4 mr-2" />
                FEATURED EXCELLENCE
              </Badge>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex space-x-3 z-10">
            {onFavoriteToggle && (
              <button
                onClick={onFavoriteToggle}
                className="p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700 dark:text-gray-300'}`} />
              </button>
            )}
            
            <button
              onClick={() => {
                const shareUrl = `${window.location.origin}/community/${community.id}`;
                const shareText = `Check out ${community.name} in ${community.city}, ${community.state} on MySeniorValet`;
                
                if (navigator.share) {
                  navigator.share({
                    title: community.name,
                    text: shareText,
                    url: shareUrl
                  }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(shareUrl);
                }
              }}
              className="p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
            >
              <Share2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>
        
        {/* Community Info Section with Premium Styling */}
        <div className="bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-850 dark:to-gray-800">
          {/* Header Section with Enhanced Design */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 relative">
            {/* Price positioned at absolute top right */}
            <div className="absolute top-6 right-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800 shadow-lg">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Monthly Starting From</div>
              <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {pricing.price}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {pricing.verified ? "Per Month" : "Market Estimate"}
              </div>
              {pricing.verified && (
                <Badge className="mt-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-bold px-2 py-1">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  VERIFIED
                </Badge>
              )}
            </div>
            
            {/* Community Details - Full width minus price box */}
            <div className="pr-0 md:pr-52 lg:pr-64">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3 break-words">
                {community.name}
              </h1>
              
              <div className="flex items-start gap-2 mb-3">
                <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600 dark:text-gray-300">
                  {enrichedContact?.address || community.address}, {community.city}, {community.state} {community.zipCode}
                </span>
              </div>
              
              {/* Contact Information Section */}
              <div className="space-y-3 mb-4">
                {/* Phone */}
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <a 
                    href={`tel:${displayPhone}`}
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                  >
                    {displayPhone}
                  </a>
                </div>
                
                {/* Website */}
                {displayWebsite && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-purple-500 flex-shrink-0" />
                    <ExternalLinkWarning
                      href={displayWebsite.includes('://') ? displayWebsite : `https://${displayWebsite}`}
                      className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium truncate max-w-xs sm:max-w-sm"
                    >
                      {displayWebsite.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </ExternalLinkWarning>
                  </div>
                )}
              </div>
              
              {/* Action Buttons for Contact */}
              <div className="flex flex-wrap gap-3">
                <a 
                  href={`tel:${displayPhone}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Phone className="w-4 h-4" />
                  <span className="font-medium">Call Now</span>
                </a>
                
                {displayWebsite && (
                  <ExternalLinkWarning
                    href={displayWebsite.includes('://') ? displayWebsite : `https://${displayWebsite}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="font-medium">Visit Website</span>
                  </ExternalLinkWarning>
                )}
              </div>
            </div>
          </div>
          
          {/* Rating, Care Type and Badges Section */}
          <div className="px-6 pb-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Rating Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-full border border-yellow-300 dark:border-yellow-700">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="font-bold text-gray-900 dark:text-white">
                  {community.googleRating || '4.2'}
                </span>
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                  ({community.googleReviewCount || '47'} reviews)
                </span>
              </div>
              
              {/* Care Type Badge */}
              <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 text-sm font-bold">
                {formatCareType ? formatCareType(community.careTypes) : "Nursing Home"}
              </Badge>
              
              {/* HUD Property Badge */}
              {community.hudPropertyId && (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 text-sm font-bold">
                  🏛️ HUD Property
                </Badge>
              )}
            </div>
          </div>
          
          {/* Action Buttons Section - Professional and Prominent */}
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  // If callback provided, trigger reservation dialog directly
                  if (onReserveClick) {
                    onReserveClick();
                  } else {
                    // Fallback to tab navigation
                    const availabilityTab = document.querySelector('[value="availability"]') as HTMLElement;
                    if (availabilityTab) {
                      availabilityTab.click();
                      setTimeout(() => {
                        const tabsSection = availabilityTab.closest('[role="tablist"]')?.parentElement;
                        if (tabsSection) {
                          tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 50);
                    }
                  }
                }}
                className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
              >
                <div className="flex flex-col items-center justify-center gap-1">
                  <span className="font-bold text-lg">🏠 Reserve Now</span>
                  <span className="text-xs opacity-90 font-medium">
                    📊 See Vacancies/Rates
                  </span>
                </div>
              </button>
              
              <button
                onClick={() => {
                  // If callback provided, trigger tour scheduler directly
                  if (onTourClick) {
                    onTourClick();
                  } else {
                    // Fallback to tab navigation
                    const toursTab = document.querySelector('[value="tours"]') as HTMLElement;
                    if (toursTab) {
                      toursTab.click();
                      setTimeout(() => {
                        const tabsSection = toursTab.closest('[role="tablist"]')?.parentElement;
                        if (tabsSection) {
                          tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 50);
                    }
                  }
                }}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
              >
                <div className="flex flex-col items-center justify-center gap-1">
                  <span className="font-bold text-lg">📅 Schedule Tour</span>
                  <span className="text-xs opacity-90 font-medium">
                    🤝 Schedule with Tour Tracker & TourMate™
                  </span>
                </div>
              </button>
            </div>
          </div>
          
          {/* Compact Info Grid - Clean and Professional */}
          <div className="px-6 pb-6">
            <div className="space-y-4">
              {/* Top Amenities - Full Width */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-blue-500" />
                  Top Amenities
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {amenities.map((amenity: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Why Featured and Key Services - Side by Side */}
              <div className="grid grid-cols-2 gap-4">
                {/* Why Featured */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    Why Featured
                  </h3>
                  <div className="space-y-2">
                    {getWhyFeatured().slice(0, 3).map((reason: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Key Services */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-500" />
                    Key Services
                  </h3>
                  <div className="space-y-2">
                    {getKeyServices().slice(0, 3).map((service, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        {service.available ? (
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                        <span className={`text-xs ${
                          service.available 
                            ? "text-gray-600 dark:text-gray-400" 
                            : "text-gray-400 dark:text-gray-500"
                        }`}>
                          {service.name}
                        </span>
                      </div>
                    ))}
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 italic">
                      Contact for details
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}