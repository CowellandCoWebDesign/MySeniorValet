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
        
        {/* Community Info Section - Clean Professional Style */}
        <div className="bg-gradient-to-b from-slate-900 via-gray-900 to-slate-900">
          <div className="p-6">
            {/* Community Name - Prominent */}
            <h1 className="text-3xl font-bold text-white mb-3">
              {community.name}
            </h1>
            
            {/* Location and Rating Row */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {/* Location */}
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">
                  {community.city}, {community.state}
                </span>
              </div>
              
              {/* Star Rating */}
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < Math.floor(parseFloat(community.googleRating || '4.2')) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} 
                  />
                ))}
                <span className="ml-1 text-gray-300">({community.googleRating || '4.7'})</span>
              </div>
              
              {/* Pricing - Prominent Display */}
              {pricing.price && (
                <div className="ml-auto">
                  <span className="text-2xl font-bold text-green-400">
                    {pricing.price}/mo
                  </span>
                  {pricing.verified && (
                    <Badge className="ml-2 bg-green-500/20 text-green-300 border-0 text-xs">
                      Verified
                    </Badge>
                  )}
                </div>
              )}
            </div>
            
            {/* Contact Information Row */}
            <div className="flex flex-wrap items-center gap-6 mb-6 text-sm">
              <a 
                href={`tel:${displayPhone}`} 
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>{displayPhone}</span>
              </a>
              
              {displayWebsite && (
                <a 
                  href={displayWebsite.includes('://') ? displayWebsite : `https://${displayWebsite}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span>Visit Website</span>
                </a>
              )}
              
              <div className="flex items-center gap-2 text-gray-400">
                <Heart className="w-4 h-4 text-red-400" />
                <span>{formatCareType ? formatCareType(community.careTypes) : "Senior Living"}</span>
              </div>
            </div>
            
            {/* Action Buttons - Clean Design */}
            <div className="flex gap-3 mb-6">
              <Button 
                onClick={() => window.location.href = `tel:${displayPhone}`}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 transition-all"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Now
              </Button>
              
              <Button 
                variant="outline"
                className="flex-1 border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white font-semibold py-3 transition-all"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Tour
              </Button>
              
              {onFavoriteToggle && (
                <Button
                  onClick={onFavoriteToggle}
                  variant="outline"
                  className="px-4 border-gray-600 hover:bg-gray-700 py-3 transition-all"
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </Button>
              )}
            </div>
            
            {/* Amenities Section - Clean Grid */}
            {amenities.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-3 font-semibold">Amenities</h3>
                <div className="grid grid-cols-1 gap-2">
                  {amenities.slice(0, 3).map((amenity: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 text-sm">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        {amenity.toLowerCase().includes('pet') ? (
                          <span className="text-xs">🐾</span>
                        ) : amenity.toLowerCase().includes('dining') || amenity.toLowerCase().includes('meal') ? (
                          <span className="text-xs">🍴</span>
                        ) : amenity.toLowerCase().includes('wellness') || amenity.toLowerCase().includes('fitness') ? (
                          <span className="text-xs">💪</span>
                        ) : (
                          <CheckCircle className="w-3 h-3 text-blue-400" />
                        )}
                      </div>
                      <span className="text-gray-300">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Service Badges - Minimal and Clean */}
            {(community.careTypes?.length > 0 || community.hudPropertyId || community.petFriendly) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {community.careTypes?.includes('memory_care') && (
                  <span className="px-3 py-1 bg-purple-500/10 text-purple-300 rounded-full text-xs font-medium">
                    Memory Care
                  </span>
                )}
                {community.careTypes?.includes('assisted_living') && (
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-300 rounded-full text-xs font-medium">
                    Assisted Living
                  </span>
                )}
                {community.careTypes?.includes('skilled_nursing') && (
                  <span className="px-3 py-1 bg-red-500/10 text-red-300 rounded-full text-xs font-medium">
                    Skilled Nursing
                  </span>
                )}
                {community.hudPropertyId && (
                  <span className="px-3 py-1 bg-green-500/10 text-green-300 rounded-full text-xs font-medium">
                    HUD Property
                  </span>
                )}
                {community.petFriendly && (
                  <span className="px-3 py-1 bg-yellow-500/10 text-yellow-300 rounded-full text-xs font-medium">
                    🐾 Pet Friendly
                  </span>
                )}
              </div>
            )}
            
            {/* Quick Stats Bar - Professional Grid */}
            <div className="bg-gray-800/40 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {community.occupancyPercentage || '92'}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Occupancy</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {community.yearEstablished ? new Date().getFullYear() - community.yearEstablished : '15'}+
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Years</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    1:6
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Staff Ratio</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {community.googleReviewCount || '47'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Reviews</div>
                </div>
              </div>
            </div>
            
            {/* Feature Tags - Clean Pills */}
            <div className="flex flex-wrap gap-2">
              {verificationReport?.amenities?.extracted?.slice(0, 3).map((amenity: string, idx: number) => (
                <span key={idx} className="px-3 py-1.5 bg-gray-700/50 text-gray-300 rounded-full text-xs">
                  {amenity}
                </span>
              )) || (
                <>
                  <span className="px-3 py-1.5 bg-gray-700/50 text-gray-300 rounded-full text-xs">24/7 Care</span>
                  <span className="px-3 py-1.5 bg-gray-700/50 text-gray-300 rounded-full text-xs">Activities Program</span>
                  <span className="px-3 py-1.5 bg-gray-700/50 text-gray-300 rounded-full text-xs">Dining Services</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}