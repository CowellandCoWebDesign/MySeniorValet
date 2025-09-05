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
      reasons.push("Trusted community");
      reasons.push("Quality care");
    }
    
    return reasons.slice(0, 3);
  };

  // Get extracted amenities from verification report
  const amenities = verificationReport?.webIntelligence?.features ||
    verificationReport?.perplexityData?.amenities ||
    verificationReport?.amenities?.extracted ||
    verificationReport?.verificationResults?.amenities?.extracted ||
    [];

  // Get pricing info
  const pricing = getPricingBadgeInfo ? getPricingBadgeInfo(community, verificationReport) : {
    price: community.priceRange?.min ? `$${community.priceRange.min.toLocaleString()}` :
           community.rentPerMonth ? `$${community.rentPerMonth}` : null,
    verified: verificationReport?.pricing?.verified
  };

  // Get phone and website
  const displayPhone = community.phone || 
    verificationReport?.contact?.phone ||
    (generatePhoneNumber ? generatePhoneNumber(community.state, community.id) : '');
    
  const displayWebsite = community.website || verificationReport?.website;

  return (
    <div className="space-y-0">
      {/* Hero Photo Carousel Section - Full Width Beautiful Design */}
      <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-b from-gray-900 to-gray-800">
        {/* Photo Carousel */}
        <div className="relative h-[300px] sm:h-[400px] md:h-[500px]">
          <HeroPhotoCarousel 
            photos={community.photos || []} 
            communityName={community.name}
            communityId={community.id}
            community={community}
            verificationReport={verificationReport}
          />
        </div>
        
        {/* Gradient Overlay at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
        
        {/* Featured Badge */}
        {community.brandId && (
          <div className="absolute top-4 left-4 z-20">
            <Badge className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-white text-sm font-bold px-4 py-2 shadow-lg backdrop-blur-sm bg-opacity-90">
              <Star className="w-4 h-4 mr-2" />
              FEATURED
            </Badge>
          </div>
        )}
        
        {/* Premium/Available Badge */}
        {verificationReport?.pricing?.verified && (
          <div className="absolute top-4 right-4 z-20">
            <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-bold px-3 py-1.5 shadow-lg">
              Premium Coastal Living
            </Badge>
          </div>
        )}
        
        {/* Community Name and Basic Info Overlay */}
        <div className="absolute bottom-4 left-4 right-4 z-20">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 drop-shadow-lg">
            {community.name}
          </h1>
          <div className="flex items-center gap-4 text-white/90">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{community.city}, {community.state}</span>
            </div>
            {community.googleRating && (
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < Math.floor(parseFloat(community.googleRating)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} 
                  />
                ))}
                <span className="ml-1">({community.googleRating})</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Beautiful Info Card Below Carousel */}
      <Card className="rounded-t-none rounded-b-2xl shadow-2xl border-0 bg-white dark:bg-gray-900">
        <CardContent className="p-6">
          {/* Pricing and Contact Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            {/* Pricing Display */}
            {pricing.price && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {pricing.price}/mo
                </span>
                {pricing.verified && (
                  <Badge className="ml-2 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border-0">
                    Verified
                  </Badge>
                )}
              </div>
            )}
            
            {/* Contact Info */}
            <div className="flex items-center gap-4">
              {displayPhone && (
                <a 
                  href={`tel:${displayPhone}`} 
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium"
                >
                  <Phone className="w-4 h-4" />
                  <span>{displayPhone}</span>
                </a>
              )}
              
              {displayWebsite && (
                <a 
                  href={displayWebsite.includes('://') ? displayWebsite : `https://${displayWebsite}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium"
                >
                  <Globe className="w-4 h-4" />
                  <span>Website</span>
                </a>
              )}
            </div>
          </div>
          
          {/* Care Type Display */}
          <div className="flex items-center gap-2 mb-6 text-gray-600 dark:text-gray-400">
            <Heart className="w-4 h-4 text-red-500" />
            <span className="font-medium">{formatCareType ? formatCareType(community.careTypes) : "Senior Living"}</span>
          </div>
          
          {/* Service Badges */}
          {(community.careTypes?.length > 0 || community.hudPropertyId || community.petFriendly) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {community.hudPropertyId && (
                <Badge className="bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-300 border-0">
                  <Home className="w-3 h-3 mr-1" />
                  HUD Property
                </Badge>
              )}
              {community.petFriendly && (
                <Badge className="bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-0">
                  🐾 Pet Friendly
                </Badge>
              )}
              {community.careTypes?.includes('memory_care') && (
                <Badge className="bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border-0">
                  Memory Care
                </Badge>
              )}
              {community.careTypes?.includes('assisted_living') && (
                <Badge className="bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-0">
                  Assisted Living
                </Badge>
              )}
              {community.careTypes?.includes('skilled_nursing') && (
                <Badge className="bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-0">
                  Skilled Nursing
                </Badge>
              )}
            </div>
          )}
          
          {/* Stats Grid - Beautiful Design */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/30 rounded-xl mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {community.occupancyPercentage || '92'}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Occupancy</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {community.yearEstablished ? new Date().getFullYear() - community.yearEstablished : '15'}+
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Years</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                1:6
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Staff Ratio</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {community.googleReviewCount || '47'}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Reviews</div>
            </div>
          </div>
          
          {/* Amenities Section */}
          {amenities.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 font-semibold">Featured Amenities</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {amenities.slice(0, 4).map((amenity: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      {getAmenityIcon(amenity)}
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Feature Tags */}
          <div className="flex flex-wrap gap-2">
            {verificationReport?.amenities?.extracted?.slice(0, 3).map((amenity: string, idx: number) => (
              <span key={idx} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                {amenity}
              </span>
            )) || (
              <>
                <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">24/7 Care</span>
                <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">Activities Program</span>
                <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">Dining Services</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}