import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Shield, AlertTriangle, DollarSign, MapPin, Heart, Share, Users, Calendar, CheckCircle, ExternalLink, Clock, Home, Wifi, Car, Utensils, Activity, Phone, Camera, Video, UserCheck, Stethoscope, Bed, ShowerHead, ChevronDown, ChevronUp, ImageIcon, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import type { Community } from "@shared/schema";
import { PhotoCarousel } from "@/components/photo-carousel";

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
    
    // Remove duplicates and return
    return Array.from(new Set(allPhotos));
  };

  const allPhotos = getAllPhotos();
  const hasPhotos = allPhotos.length > 0;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      {/* ENHANCED PHOTO CAROUSEL */}
      {hasPhotos ? (
        <div className="relative">
          <PhotoCarousel 
            photos={allPhotos} 
            communityName={community.name}
            className="h-48"
          />
          
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
        <div className="relative h-48 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Photos coming soon</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* LEFT COLUMN: AMENITIES & FEATURES */}
          <div className="space-y-4">
            {/* TOP AMENITIES */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">Top Amenities</span>
                </div>
                {community.amenities && community.amenities.length > 4 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection('amenities')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {expandedSections.amenities ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-1" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-1" />
                        Show All ({community.amenities.length})
                      </>
                    )}
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {topAmenities.slice(0, expandedSections.amenities ? undefined : 4).map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-white rounded px-2 py-1">
                    {amenity.icon}
                    <span className="text-sm text-blue-900">{amenity.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: AVAILABILITY & SPECIAL OFFERS */}
          <div className="space-y-4">
            {/* AVAILABILITY STATUS - Priority Display */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-bold text-green-900">Current Availability</span>
              </div>
              <div className="text-lg font-semibold text-green-800">{community.availabilityStatus}</div>
              {community.availableUnits && (
                <div className="text-sm text-green-700">{community.availableUnits} units currently available</div>
              )}
            </div>

            {/* SPECIAL OFFERS */}
            {specialOffers.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge className="bg-red-600 text-white">
                    {specialOffers.length} Special Offer{specialOffers.length > 1 ? 's' : ''}
                  </Badge>
                </div>
                {specialOffers.slice(0, 2).map((offer: any, index: number) => (
                  <div key={index} className="mb-2 last:mb-0">
                    <div className="font-semibold text-red-900">{offer.title}</div>
                    <div className="text-sm text-red-700">Save ${offer.savings?.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CARE LEVELS & SERVICES - Full Width */}
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

        {/* PRICING SECTION - After Amenities and Availability */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-blue-900 text-lg">Typical Monthly Cost</span>
            </div>
            <Badge className="bg-orange-500 text-white text-xs">
              Pending Verification
            </Badge>
          </div>
          
          {pricing ? (
            <div>
              <div className="text-3xl font-bold text-blue-900 mb-1">
                {pricing.range}
              </div>
              <div className="text-sm text-blue-700 mb-2">per month (typical range)</div>
              <div className="bg-white border border-blue-200 rounded p-2">
                <div className="text-xs text-blue-600">
                  <div className="font-medium mb-1">Typical move-in costs vary by facility</div>
                  <div>• Contact for current pricing and fees</div>
                </div>
              </div>
              <div className="text-xs text-orange-600 mt-2">
                Exact pricing and current specials pending community verification
              </div>
            </div>
          ) : (
            <div>
              <div className="text-xl font-semibold text-blue-900 mb-2">Contact for Current Pricing</div>
              <div className="bg-white border border-blue-200 rounded p-2">
                <div className="text-xs text-blue-600">
                  <div>• Move-in costs vary by facility</div>
                </div>
              </div>
            </div>
          )}
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
        <div className="flex space-x-3">
          <Link href={`/community/${community.id}`} className="flex-1">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 py-3 text-lg font-semibold">
              View Full Details & More Reviews
            </Button>
          </Link>
          {community.phone && (
            <Button variant="outline" className="px-6 py-3 border-2">
              <Phone className="h-4 w-4 mr-2" />
              Call Now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}