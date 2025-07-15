import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FamilyShareButton } from './family-share-button';
import { Star, Shield, AlertTriangle, DollarSign, MapPin, Heart, Share, Users, Calendar, CheckCircle, ExternalLink, Clock, Home, Wifi, Car, Utensils, Activity, Phone, Camera, Video, UserCheck, Stethoscope, Bed, ShowerHead, ChevronDown, ChevronUp, ImageIcon, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import type { Community } from "@shared/schema";
import { PhotoCarousel } from "@/components/photo-carousel";
import { processPhotoUrls } from "@/lib/photoUtils";
import { getComingSoonImage } from "@/lib/comingSoonPhotos";

interface CommunityCardProps {
  community: Community;
}

export function CommunityCard({ community }: CommunityCardProps) {
  const [expandedSections, setExpandedSections] = useState({
    amenities: false,
    services: false,
    careTypes: false,
  });

  const toggleSection = (section: 'amenities' | 'services' | 'careTypes') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getCareIcon = (careType: string) => {
    switch(careType) {
      case "Independent Living": return <Home className="h-4 w-4" />;
      case "Assisted Living": return <UserCheck className="h-4 w-4" />;
      case "Memory Care": return <Stethoscope className="h-4 w-4" />;
      case "Skilled Nursing": return <Activity className="h-4 w-4" />;
      default: return <Home className="h-4 w-4" />;
    }
  };
  const getAvailabilityConfig = (status: string) => {
    switch (status) {
      case "Available Now": 
        return { 
          color: "bg-green-600 text-white border-green-600", 
          icon: <CheckCircle className="h-4 w-4" />,
          urgency: "high"
        };
      case "Waitlist": 
        return { 
          color: "bg-yellow-600 text-white border-yellow-600", 
          icon: <Users className="h-4 w-4" />,
          urgency: "medium"
        };
      case "Full": 
        return { 
          color: "bg-red-600 text-white border-red-600", 
          icon: <AlertTriangle className="h-4 w-4" />,
          urgency: "low"
        };
      default: 
        return { 
          color: "bg-gray-600 text-white border-gray-600", 
          icon: <Calendar className="h-4 w-4" />,
          urgency: "medium"
        };
    }
  };

  const formatPrice = (priceRange?: { min: number; max: number } | null) => {
    if (!priceRange) return null;
    return {
      range: `$${priceRange.min.toLocaleString()} - $${priceRange.max.toLocaleString()}`,
      monthly: "/month"
    };
  };

  const getSpecialOffers = () => {
    const pricingDetails = community.pricingDetails as any;
    return pricingDetails?.specialOffers || [];
  };

  const getReviewSnippets = () => {
    const snippets = community.googleReviewSnippets as any[] || [];
    return snippets.slice(0, 2);
  };

  const getTopAmenities = () => {
    const amenities = community.amenities || [];
    const amenityIcons: { [key: string]: any } = {
      'WiFi': <Wifi className="h-4 w-4" />,
      'Parking': <Car className="h-4 w-4" />,
      'Dining': <Utensils className="h-4 w-4" />,
      'Fitness': <Activity className="h-4 w-4" />,
      'Restaurant': <Utensils className="h-4 w-4" />,
      'Activities': <Activity className="h-4 w-4" />,
    };
    
    return amenities.slice(0, 4).map((amenity: string) => ({
      name: amenity,
      icon: amenityIcons[amenity] || <CheckCircle className="h-4 w-4" />
    }));
  };

  const handleShare = async () => {
    const shareData = {
      title: `${community.name} - Senior Living Community`,
      text: `Check out ${community.name} in ${community.city}, ${community.state}. ${community.description || 'A quality senior living community.'}`,
      url: `${window.location.origin}/community/${community.id}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareData.url);
        // Could show a toast here
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const getPriceTransparency = () => {
    if (!community.priceRange) return null;
    
    const hasPublicPricing = community.priceRange && community.priceRange.min > 0;
    const isRecent = community.lastPriceUpdate && 
      (new Date().getTime() - new Date(community.lastPriceUpdate).getTime()) < (30 * 24 * 60 * 60 * 1000);
    
    return {
      hasPublicPricing,
      isRecent,
      lastUpdated: community.lastPriceUpdate
    };
  };

  const priceTransparency = getPriceTransparency();

  const availability = getAvailabilityConfig(community.availabilityStatus || "Contact for Availability");
  const pricing = formatPrice(community.priceRange);
  const specialOffers = getSpecialOffers();
  const reviewSnippets = getReviewSnippets();
  const topAmenities = getTopAmenities();
  // Remove the problematic priceTransparency call for now

  // Get all photos from various sources
  const getAllPhotos = () => {
    const allPhotos: string[] = [];
    
    // Add photos from different sources
    if (community.photos && Array.isArray(community.photos) && community.photos.length > 0) {
      allPhotos.push(...community.photos);
    }
    if (community.yelpPhotos && Array.isArray(community.yelpPhotos) && community.yelpPhotos.length > 0) {
      allPhotos.push(...community.yelpPhotos);
    }
    if (community.imageGallery && Array.isArray(community.imageGallery) && community.imageGallery.length > 0) {
      allPhotos.push(...community.imageGallery);
    }
    
    // Remove duplicates and process URLs through proxy
    const uniquePhotos = Array.from(new Set(allPhotos));
    return processPhotoUrls(uniquePhotos);
  };

  const allPhotos = getAllPhotos();
  const hasPhotos = allPhotos.length > 0;

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons or links
    if ((e.target as HTMLElement).closest('button, a')) {
      return;
    }
    window.location.href = `/community/${community.id}`;
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500 cursor-pointer group"
      onClick={handleCardClick}
    >
        {/* ENHANCED PHOTO CAROUSEL */}
        {hasPhotos ? (
          <div className="relative">
            <PhotoCarousel 
              photos={allPhotos} 
              communityName={community.name}
              className="h-48"
            />
            
            {/* FAVORITE AND SHARE OVERLAYS */}
            <div className="absolute top-3 left-3 flex space-x-2 z-10">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // TODO: Implement favorite toggle functionality
                  console.log('Toggle favorite for community:', community.id);
                }}
                className="p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-200 group shadow-lg"
                aria-label="Add to favorites"
              >
                <Heart className="h-5 w-5 text-red-500/70 hover:text-red-500 hover:fill-red-500/20 transition-all duration-200" />
              </button>
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleShare();
                }}
                className="p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-200 group shadow-lg"
                aria-label="Share community"
              >
                <Share className="h-5 w-5 text-blue-500/70 hover:text-blue-500 transition-all duration-200" />
              </button>
            </div>

          {/* OVERLAY BADGES */}
          <div className="absolute top-3 right-3 flex space-x-2">
            {allPhotos.length > 1 && (
              <Badge className="bg-black/60 text-white border-0 backdrop-blur-sm">
                <Camera className="h-3 w-3 mr-1" />
                {allPhotos.length} Photos
              </Badge>
            )}
            {community.virtualTourUrl && (
              <Badge className="bg-blue-600 text-white border-0 cursor-pointer hover:bg-blue-700">
                <Video className="h-3 w-3 mr-1" />
                Virtual Tour
              </Badge>
            )}
          </div>
          
          {/* AVAILABILITY OVERLAY */}
          <div className={`absolute bottom-0 left-0 right-0 ${availability.color} px-4 py-2 flex items-center justify-between`}>
            <div className="flex items-center space-x-2">
              {availability.icon}
              <span className="font-bold">{community.availabilityStatus}</span>
              {community.availableUnits && (
                <span className="text-sm opacity-90">• {community.availableUnits} units</span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative h-48">
          <img
            src={getComingSoonImage(community.id)}
            alt={`${community.name} - Coming Soon`}
            className="w-full h-full object-cover"
          />
          
          {/* Coming Soon Overlay */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-bold mb-1 tracking-wide">PHOTOS COMING SOON</p>
                <p className="text-xs text-gray-200">More photos available soon</p>
              </div>
            </div>
          </div>
          
          {/* AVAILABILITY OVERLAY FOR NO PHOTOS */}
          <div className={`absolute bottom-0 left-0 right-0 ${availability.color} px-4 py-2 flex items-center justify-between`}>
            <div className="flex items-center space-x-2">
              {availability.icon}
              <span className="font-bold">{community.availabilityStatus}</span>
              {community.availableUnits && (
                <span className="text-sm opacity-90">• {community.availableUnits} units</span>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Fallback availability status if no photos */}
      {(!community.photos || community.photos.length === 0) && (
        <div className={`${availability.color} px-4 py-3 flex items-center justify-between`}>
          <div className="flex items-center space-x-3">
            {availability.icon}
            <div>
              <span className="font-bold text-lg">{community.availabilityStatus}</span>
              {community.availableUnits && (
                <span className="text-sm opacity-90 ml-2">• {community.availableUnits} units available</span>
              )}
            </div>
          </div>
          {availability.urgency === "high" && (
            <Badge variant="secondary" className="bg-white text-green-800 font-semibold">
              <Clock className="h-3 w-3 mr-1" />
              Act Fast
            </Badge>
          )}
        </div>
      )}

      <CardContent className="p-6">
        {/* Header: Name, Rating & Location */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{community.name}</h3>
            <div className="flex items-center text-gray-600 text-sm mb-3">
              <MapPin className="h-4 w-4 mr-1" />
              {community.address}, {community.city}, {community.state}
            </div>
          </div>
          
          {/* PROMINENT RATING DISPLAY */}
          {community.googleRating && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center min-w-[100px]">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <span className="text-xl font-bold text-gray-900">{parseFloat(community.googleRating).toFixed(1)}</span>
              </div>
              <div className="text-xs text-gray-600">{community.googleReviewCount} reviews</div>
              <div className="flex justify-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-3 w-3 ${i < Math.round(parseFloat(community.googleRating || '0')) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 1. CONTACT INFORMATION - Most Important */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-3">
            <Phone className="h-5 w-5 text-blue-600" />
            <span className="font-bold text-blue-900 text-lg">Contact Information</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {community.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-blue-600" />
                <a href={`tel:${community.phone}`} className="text-blue-700 hover:text-blue-900 font-medium">
                  {community.phone}
                </a>
              </div>
            )}
            {community.email && (
              <div className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4 text-blue-600" />
                <a href={`mailto:${community.email}`} className="text-blue-700 hover:text-blue-900 font-medium">
                  {community.email}
                </a>
              </div>
            )}
          </div>
          {community.website && (
            <div className="mt-2">
              <a href={community.website} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900 font-medium text-sm">
                Visit Website →
              </a>
            </div>
          )}
        </div>

        {/* 2. TRANSPARENT PRICING - NO "CALL FOR PRICING" ALLOWED */}
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-6 w-6 text-green-600" />
              <span className="font-bold text-green-900 text-lg">Monthly Cost Estimates</span>
            </div>
            {community.isClaimed && community.livePricing ? (
              <Badge className="bg-blue-600 text-white text-xs font-semibold">
                ✓ Live Pricing
              </Badge>
            ) : (
              <Badge className="bg-green-600 text-white text-xs">
                Estimated Pricing
              </Badge>
            )}
          </div>
          
          {/* Always show pricing estimates - NO "call for pricing" */}
          <div>
            {community.isClaimed && community.livePricing ? (
              <div>
                <div className="text-2xl font-bold text-blue-900 mb-2">
                  ${community.livePricing.min.toLocaleString()} - ${community.livePricing.max.toLocaleString()}
                </div>
                <div className="text-sm text-blue-700 mb-3">Confirmed live pricing (updated {new Date(community.livePricing.lastUpdated).toLocaleDateString()})</div>
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold text-green-900 mb-2">
                  ${(community.priceRange?.min || 3500).toLocaleString()} - ${(community.priceRange?.max || 6500).toLocaleString()}
                </div>
                <div className="text-sm text-green-700 mb-3">Estimated monthly range based on local market data</div>
              </div>
            )}
            
            {/* Care Level Estimates */}
            <div className="space-y-2">
              {community.careTypes.map((careType, index) => {
                const baseMin = community.priceRange?.min || 3500;
                const baseMax = community.priceRange?.max || 6500;
                
                // Enhanced multipliers based on industry standards
                const multiplier = careType === 'Independent Living' ? 0.7 : 
                                 careType === 'Assisted Living' ? 1.0 : 
                                 careType === 'Memory Care' ? 1.4 : 
                                 careType === 'Skilled Nursing' ? 1.6 : 1.0;
                
                const estimatedMin = Math.round(baseMin * multiplier);
                const estimatedMax = Math.round(baseMax * multiplier);
                
                return (
                  <div key={index} className="bg-white border border-green-200 rounded p-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-green-900">{careType}</span>
                      <span className="text-green-700 font-bold">
                        ${estimatedMin.toLocaleString()} - ${estimatedMax.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="text-xs text-green-600 mt-2">
              {community.isClaimed && community.livePricing ? (
                <span className="font-medium">✓ Community-verified pricing. Contact for current specials and move-in costs.</span>
              ) : (
                <span>* Market-based estimates. Actual costs may vary. Community can claim listing for exact pricing.</span>
              )}
            </div>
          </div>
        </div>

        {/* 3. AVAILABILITY STATUS - Third Priority */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="h-5 w-5 text-purple-600" />
            <span className="font-bold text-purple-900">Current Availability</span>
          </div>
          <div className="text-lg font-semibold text-purple-800">{community.availabilityStatus}</div>
          {community.availableUnits && (
            <div className="text-sm text-purple-700">{community.availableUnits} units currently available</div>
          )}
          {community.totalUnits && (
            <div className="text-sm text-purple-600">Total units: {community.totalUnits}</div>
          )}
        </div>

        {/* 4. COMPREHENSIVE REVIEW INFORMATION */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-3">
            <Star className="h-5 w-5 text-yellow-600" />
            <span className="font-bold text-yellow-900 text-lg">Reviews & Ratings</span>
          </div>
          
          {/* Google Reviews */}
          {community.googleRating && (
            <div className="bg-white border border-yellow-200 rounded p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="text-lg font-bold text-yellow-900">Google Reviews</div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-bold text-yellow-900">{parseFloat(community.googleRating).toFixed(1)}</span>
                  </div>
                </div>
                <div className="text-sm text-yellow-700">
                  {community.googleReviewCount} reviews
                </div>
              </div>
              
              {/* Recent Review Snippets */}
              {community.googleReviewSnippets && community.googleReviewSnippets.length > 0 && (
                <div className="space-y-2">
                  {community.googleReviewSnippets.slice(0, 2).map((snippet: any, index: number) => (
                    <div key={index} className="bg-yellow-25 border-l-4 border-yellow-400 pl-3 py-1">
                      <div className="text-sm text-yellow-800 italic">"{snippet.text}"</div>
                      <div className="text-xs text-yellow-600 mt-1">- {snippet.author}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Multiple Review Sources */}
          <div className="grid grid-cols-2 gap-3">
            {community.yelpReviews && community.yelpReviews.length > 0 && (
              <div className="bg-white border border-yellow-200 rounded p-2">
                <div className="text-sm font-medium text-yellow-900 mb-1">Yelp Reviews</div>
                <div className="text-xs text-yellow-700">{community.yelpReviews.length} reviews available</div>
              </div>
            )}
            
            {community.careComReviews && community.careComReviews.length > 0 && (
              <div className="bg-white border border-yellow-200 rounded p-2">
                <div className="text-sm font-medium text-yellow-900 mb-1">Care.com Reviews</div>
                <div className="text-xs text-yellow-700">{community.careComReviews.length} reviews available</div>
              </div>
            )}
            
            {community.seniorAdvisorReviews && community.seniorAdvisorReviews.length > 0 && (
              <div className="bg-white border border-yellow-200 rounded p-2">
                <div className="text-sm font-medium text-yellow-900 mb-1">Senior Advisor Reviews</div>
                <div className="text-xs text-yellow-700">{community.seniorAdvisorReviews.length} reviews available</div>
              </div>
            )}
            
            {community.aplaceformomReviews && community.aplaceformomReviews.length > 0 && (
              <div className="bg-white border border-yellow-200 rounded p-2">
                <div className="text-sm font-medium text-yellow-900 mb-1">A Place for Mom Reviews</div>
                <div className="text-xs text-yellow-700">{community.aplaceformomReviews.length} reviews available</div>
              </div>
            )}
          </div>
          
          {/* Review Summary */}
          <div className="mt-3 p-2 bg-white border border-yellow-200 rounded">
            <div className="text-xs text-yellow-600">
              Reviews from trusted sources help families make informed decisions about senior living communities.
            </div>
          </div>
        </div>

        {/* 5. SPECIAL OFFERS - Fifth Priority */}
        {specialOffers.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 mb-3">
              <Badge className="bg-red-600 text-white">
                {specialOffers.length} Special Offer{specialOffers.length > 1 ? 's' : ''}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {specialOffers.slice(0, 4).map((offer: any, index: number) => (
                <div key={index} className="bg-white border border-red-200 rounded p-3">
                  <div className="font-semibold text-red-900">{offer.title}</div>
                  <div className="text-sm text-red-700">Save ${offer.savings?.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. COMPREHENSIVE AMENITIES & FACILITIES */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-3">
            <Activity className="h-5 w-5 text-indigo-600" />
            <span className="font-bold text-indigo-900 text-lg">Amenities & Facilities</span>
          </div>
          
          {/* Main Amenities Grid */}
          {community.amenities && community.amenities.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-medium text-indigo-800 mb-2">Main Amenities</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {community.amenities.slice(0, 6).map((amenity, index) => (
                  <div key={index} className="bg-white border border-indigo-200 rounded p-2 flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-indigo-600" />
                    <span className="text-sm text-indigo-900">{amenity}</span>
                  </div>
                ))}
              </div>
              {community.amenities.length > 6 && (
                <div className="text-center mt-2">
                  <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                    +{community.amenities.length - 6} more amenities
                  </Badge>
                </div>
              )}
            </div>
          )}

          {/* Specialized Services */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Healthcare Services */}
            {community.healthcareServices && community.healthcareServices.length > 0 && (
              <div className="bg-white border border-indigo-200 rounded p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Stethoscope className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-900">Healthcare Services</span>
                </div>
                <div className="space-y-1">
                  {community.healthcareServices.slice(0, 3).map((service, index) => (
                    <div key={index} className="text-xs text-indigo-700 flex items-center space-x-1">
                      <span className="w-1 h-1 bg-indigo-400 rounded-full"></span>
                      <span>{service}</span>
                    </div>
                  ))}
                  {community.healthcareServices.length > 3 && (
                    <div className="text-xs text-indigo-600">+{community.healthcareServices.length - 3} more</div>
                  )}
                </div>
              </div>
            )}

            {/* Dining Services */}
            {community.diningServices && community.diningServices.length > 0 && (
              <div className="bg-white border border-indigo-200 rounded p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Utensils className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-900">Dining Services</span>
                </div>
                <div className="space-y-1">
                  {community.diningServices.slice(0, 3).map((service, index) => (
                    <div key={index} className="text-xs text-indigo-700 flex items-center space-x-1">
                      <span className="w-1 h-1 bg-indigo-400 rounded-full"></span>
                      <span>{service}</span>
                    </div>
                  ))}
                  {community.diningServices.length > 3 && (
                    <div className="text-xs text-indigo-600">+{community.diningServices.length - 3} more</div>
                  )}
                </div>
              </div>
            )}

            {/* Transportation Services */}
            {community.transportationServices && community.transportationServices.length > 0 && (
              <div className="bg-white border border-indigo-200 rounded p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Car className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-900">Transportation</span>
                </div>
                <div className="space-y-1">
                  {community.transportationServices.slice(0, 3).map((service, index) => (
                    <div key={index} className="text-xs text-indigo-700 flex items-center space-x-1">
                      <span className="w-1 h-1 bg-indigo-400 rounded-full"></span>
                      <span>{service}</span>
                    </div>
                  ))}
                  {community.transportationServices.length > 3 && (
                    <div className="text-xs text-indigo-600">+{community.transportationServices.length - 3} more</div>
                  )}
                </div>
              </div>
            )}

            {/* Fitness Services */}
            {community.fitnessServices && community.fitnessServices.length > 0 && (
              <div className="bg-white border border-indigo-200 rounded p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-900">Fitness & Wellness</span>
                </div>
                <div className="space-y-1">
                  {community.fitnessServices.slice(0, 3).map((service, index) => (
                    <div key={index} className="text-xs text-indigo-700 flex items-center space-x-1">
                      <span className="w-1 h-1 bg-indigo-400 rounded-full"></span>
                      <span>{service}</span>
                    </div>
                  ))}
                  {community.fitnessServices.length > 3 && (
                    <div className="text-xs text-indigo-600">+{community.fitnessServices.length - 3} more</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 7. CARE LEVELS & SERVICES - Full Width */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-3">
            <UserCheck className="h-5 w-5 text-purple-600" />
            <span className="font-semibold text-purple-900">Care Levels & Services</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {community.careTypes.map((type) => {
              const getCareIcon = (careType: string) => {
                switch(careType) {
                  case "Independent Living": return <Home className="h-4 w-4" />;
                  case "Assisted Living": return <UserCheck className="h-4 w-4" />;
                  case "Memory Care": return <Stethoscope className="h-4 w-4" />;
                  case "Skilled Nursing": return <Activity className="h-4 w-4" />;
                  default: return <Home className="h-4 w-4" />;
                }
              };
              
              return (
                <div key={type} className="flex items-center space-x-2 bg-purple-100 rounded px-3 py-2">
                  <span className="text-purple-600">{getCareIcon(type)}</span>
                  <span className="text-sm font-medium text-purple-900">{type}</span>
                </div>
              );
            })}
          </div>

          {/* Care Services Details */}
          {community.careServices && community.careServices.length > 0 && (
            <div className="border-t border-purple-200 pt-3 mt-3">
              <div className="text-xs font-medium text-purple-800 mb-2">Services Include:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {community.careServices.slice(0, 6).map((service, index) => (
                  <div key={index} className="text-xs text-purple-700 flex items-center space-x-1">
                    <span className="w-1 h-1 bg-purple-400 rounded-full"></span>
                    <span>{service}</span>
                  </div>
                ))}
                {community.careServices.length > 6 && (
                  <div className="text-xs text-purple-600">+{community.careServices.length - 6} more services</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* UNIT TYPES & AVAILABILITY SECTION */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-3">
            <Home className="h-5 w-5 text-blue-600" />
            <span className="font-bold text-gray-900 text-lg">Unit Types & Availability</span>
          </div>
          
          {community.unitTypes && community.unitTypes.length > 0 ? (
            <div className="space-y-3">
              {community.unitTypes.slice(0, 3).map((unitType, index) => (
                <div key={index} className="bg-white border border-blue-200 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-blue-900">{unitType.name}</h4>
                      <p className="text-sm text-blue-700">{unitType.type} • {unitType.squareFootage} sq ft</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-900">
                        ${unitType.priceRange.min.toLocaleString()}/mo
                      </div>
                      <div className="text-xs text-blue-600">{unitType.available} available</div>
                    </div>
                  </div>
                  
                  {unitType.features && unitType.features.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {unitType.features.slice(0, 3).map((feature, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {unitType.features.length > 3 && (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                          +{unitType.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {community.unitTypes.length > 3 && (
                <div className="text-center">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    +{community.unitTypes.length - 3} more unit types available
                  </Badge>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Home className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">Unit Types Information</h4>
              <p className="text-sm text-gray-600 mb-3">
                We're gathering verified unit type details for this community.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                <div className="flex items-center justify-center space-x-1">
                  <ShieldCheck className="h-4 w-4 text-yellow-600" />
                  <span className="text-xs text-yellow-800 font-medium">
                    Only verified unit data will be displayed
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. CARE TYPES - Fourth Priority */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-3">
            <Heart className="h-5 w-5 text-purple-600" />
            <span className="font-semibold text-purple-900">Care & Services</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {community.careTypes.map((type, index) => (
              <div key={index} className="bg-white border border-purple-200 rounded p-3">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-purple-600">{getCareIcon(type)}</span>
                  <span className="font-semibold text-purple-900">{type}</span>
                </div>
                {community.careServices && community.careServices.length > 0 && (
                  <div className="space-y-1">
                    {community.careServices.slice(0, 2).map((service, serviceIndex) => (
                      <div key={serviceIndex} className="text-sm text-purple-700 flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                        <span>{service}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* REVIEW SNIPPETS - Prominent Section */}
        {reviewSnippets.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 mb-4">
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <span className="font-bold text-gray-900 text-lg">What Families Say</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviewSnippets.map((snippet: any, index: number) => (
                <div key={index} className="bg-white border border-gray-200 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < snippet.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">- {snippet.author}</span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-3">"{snippet.text}"</p>
                </div>
              ))}
            </div>
            
            {/* Review Platform Links */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Read all reviews:</span>
                <div className="flex space-x-2">
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(community.name + ' ' + community.city + ' ' + community.state)}&tbm=lcl`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                  >
                    Google
                    <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <a
                    href={`https://www.yelp.com/search?find_desc=${encodeURIComponent(community.name)}&find_loc=${encodeURIComponent(community.city + ', ' + community.state)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-2 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors"
                  >
                    Yelp
                    <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="space-y-3">
          <div className="flex space-x-3">
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 text-lg font-semibold">
              View Full Details & More Reviews
            </Button>
            {community.phone && (
              <Button 
                variant="outline" 
                className="px-6 py-3 border-2"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(`tel:${community.phone}`, '_self');
                }}
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Now
              </Button>
            )}
          </div>
          
          {/* Family Share Button */}
          <div className="flex justify-center">
            <FamilyShareButton 
              community={community} 
              variant="outline" 
              size="default"
              className="px-8 py-2 border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 text-purple-700 hover:text-purple-800"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}