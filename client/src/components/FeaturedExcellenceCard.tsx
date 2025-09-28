import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Home, Heart, Activity, Users, Utensils, Car, Music, Book, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";

interface FeaturedExcellenceCardProps {
  community: {
    id: number;
    name: string;
    city: string;
    state: string;
    address?: string;
    careTypes?: string[];
    rating?: number;
    photos?: string[];
    description?: string;
    amenities?: string[];
    phone?: string;
    website?: string;
    priceRange?: { min: number; max: number };
    rentPerMonth?: number | string;
    totalUnits?: number;
    occupancyRate?: number;
    hudPropertyId?: string;
  };
  index?: number;
  compact?: boolean; // For horizontal sliders
}

export function FeaturedExcellenceCard({ community, index = 0, compact = false }: FeaturedExcellenceCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [enrichedPhotos, setEnrichedPhotos] = useState<string[]>(community.photos || []);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  
  // Default amenities if none provided
  const amenities = community.amenities && community.amenities.length > 0 
    ? community.amenities.slice(0, 3)
    : ["24-Hour Care", "Dining Services", "Activities"];
  
  // Fetch enriched photos for the community
  useEffect(() => {
    const fetchEnrichedPhotos = async () => {
      // Skip if we already have multiple photos
      if (enrichedPhotos.length > 1) return;
      
      // Fetch verification data which includes photos
      try {
        setIsLoadingPhotos(true);
        const response = await fetch(`/api/communities/${community.id}/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ forceRefresh: false })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch photos: ${response.status}`);
        }
        
        const verifyData = await response.json();
        
        // Extract photos from verification data
        const webPhotos = verifyData?.verificationResults?.webIntelligence?.images || [];
        if (webPhotos.length > 0) {
          // Filter out obvious logos and icons
          const filteredPhotos = webPhotos.filter((url: string) => {
            const urlLower = url.toLowerCase();
            // Skip if URL contains logo/icon indicators
            if (urlLower.includes('logo') || urlLower.includes('icon') || 
                urlLower.includes('badge') || urlLower.includes('button') ||
                urlLower.includes('sprite') || urlLower.includes('.svg')) {
              return false;
            }
            return true;
          });
          
          if (filteredPhotos.length > 0) {
            setEnrichedPhotos(filteredPhotos.slice(0, 10)); // Limit to 10 photos
          }
        }
      } catch (error) {
        console.error('Error fetching enriched photos:', error);
      } finally {
        setIsLoadingPhotos(false);
      }
    };
    
    // Only fetch if we have a community ID and limited photos
    if (community.id && (!enrichedPhotos || enrichedPhotos.length <= 1)) {
      fetchEnrichedPhotos();
    }
  }, [community.id]);
  
  // Auto-advance carousel
  useEffect(() => {
    if (enrichedPhotos.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentPhotoIndex(prev => (prev + 1) % enrichedPhotos.length);
    }, 5000); // Change photo every 5 seconds
    
    return () => clearInterval(interval);
  }, [enrichedPhotos.length]);
  
  const handlePreviousPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentPhotoIndex(prev => prev === 0 ? enrichedPhotos.length - 1 : prev - 1);
  };
  
  const handleNextPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentPhotoIndex(prev => (prev + 1) % enrichedPhotos.length);
  };

  // Generate "Why Featured" reasons based on community data
  const getWhyFeatured = () => {
    const reasons = [];
    
    if (community.rating && community.rating >= 4.5) {
      reasons.push("Exceptional ratings");
    }
    if (community.hudPropertyId) {
      reasons.push("HUD verified pricing");
    }
    if (community.careTypes && community.careTypes.length > 2) {
      reasons.push("Multiple care levels");
    }
    if (community.occupancyRate && community.occupancyRate > 85) {
      reasons.push("High satisfaction");
    }
    if (reasons.length === 0) {
      reasons.push("Premium location", "Quality care", "Great value");
    }
    
    return reasons.slice(0, 3);
  };

  // Get availability status
  const getAvailability = () => {
    if (!community.occupancyRate) return "Contact for availability";
    if (community.occupancyRate < 85) return "Available Now";
    if (community.occupancyRate < 95) return "Limited Spots";
    return "Waitlist";
  };

  // Get availability badge color
  const getAvailabilityColor = () => {
    const availability = getAvailability();
    if (availability === "Available Now") return "bg-green-600 text-white";
    if (availability === "Limited Spots") return "bg-orange-600 text-white";
    if (availability === "Waitlist") return "bg-red-600 text-white";
    return "bg-gray-600 text-white";
  };

  // Get amenity icon
  const getAmenityIcon = (amenity: string) => {
    const lowerAmenity = amenity.toLowerCase();
    if (lowerAmenity.includes("dining") || lowerAmenity.includes("meal")) {
      return <Utensils className="w-3 h-3 text-gray-600 flex-shrink-0" />;
    }
    if (lowerAmenity.includes("transport")) {
      return <Car className="w-3 h-3 text-gray-600 flex-shrink-0" />;
    }
    if (lowerAmenity.includes("activit") || lowerAmenity.includes("social")) {
      return <Users className="w-3 h-3 text-gray-600 flex-shrink-0" />;
    }
    if (lowerAmenity.includes("fitness") || lowerAmenity.includes("gym")) {
      return <Activity className="w-3 h-3 text-gray-600 flex-shrink-0" />;
    }
    if (lowerAmenity.includes("librar") || lowerAmenity.includes("education")) {
      return <Book className="w-3 h-3 text-gray-600 flex-shrink-0" />;
    }
    if (lowerAmenity.includes("music") || lowerAmenity.includes("entertain")) {
      return <Music className="w-3 h-3 text-gray-600 flex-shrink-0" />;
    }
    return <Home className="w-3 h-3 text-gray-600 flex-shrink-0" />;
  };

  // Calculate rating
  const rating = typeof community.rating === 'string' 
    ? parseFloat(community.rating) || 4.5 
    : community.rating || 4.5;

  return (
    <Card className={`relative overflow-hidden border hover:border-orange-300 dark:hover:border-orange-700 transition-all bg-white dark:bg-gray-800 ${compact ? 'w-80 flex-shrink-0' : ''}`}>
      {/* Hero Image with Carousel */}
      <div className={`relative ${compact ? 'h-36' : 'h-40'} overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900 dark:to-amber-900`}>
        {enrichedPhotos && enrichedPhotos.length > 0 ? (
          <>
            <img 
              src={enrichedPhotos[currentPhotoIndex]} 
              alt={`${community.name} - Photo ${currentPhotoIndex + 1}`}
              className="w-full h-full object-cover transition-opacity duration-500"
              onError={(e) => {
                // If image fails to load, remove it from the array
                const newPhotos = enrichedPhotos.filter((_, i) => i !== currentPhotoIndex);
                if (newPhotos.length > 0) {
                  setEnrichedPhotos(newPhotos);
                  setCurrentPhotoIndex(0);
                }
              }}
            />
            
            {/* Carousel Controls - Only show if multiple photos */}
            {enrichedPhotos.length > 1 && (
              <>
                {/* Previous Button */}
                <button
                  onClick={handlePreviousPhoto}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-all"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {/* Next Button */}
                <button
                  onClick={handleNextPhoto}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-all"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                
                {/* Photo Indicators */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {enrichedPhotos.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentPhotoIndex(idx);
                      }}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        idx === currentPhotoIndex 
                          ? 'bg-white w-3' 
                          : 'bg-white/50 hover:bg-white/70'
                      }`}
                      aria-label={`Go to photo ${idx + 1}`}
                    />
                  ))}
                </div>
                
                {/* Photo Count Badge */}
                <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-0.5 rounded-full text-xs">
                  {currentPhotoIndex + 1} / {enrichedPhotos.length}
                </div>
              </>
            )}
          </>
        ) : isLoadingPhotos ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Loading photos...</p>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <Home className="w-12 h-12 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Professional Photos Coming Soon</p>
            </div>
          </div>
        )}
        
        {/* Excellence Badge - moved below photo count when carousel is active */}
        {(!enrichedPhotos || enrichedPhotos.length <= 1) && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold px-2 py-1">
              <Star className="w-3 h-3 mr-1" />
              FEATURED
            </Badge>
          </div>
        )}
        {enrichedPhotos && enrichedPhotos.length > 1 && (
          <div className="absolute top-9 left-2">
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold px-2 py-1">
              <Star className="w-3 h-3 mr-1" />
              FEATURED
            </Badge>
          </div>
        )}
        
        {/* Premium/Excellence Badge */}
        <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 py-0.5 rounded text-xs font-bold">
          Premium Coastal Living
        </div>
        
        {/* Availability Badge */}
        <div className="absolute bottom-2 right-2">
          <Badge className={`text-xs font-medium px-2 py-1 ${getAvailabilityColor()}`}>
            {getAvailability()}
          </Badge>
        </div>
      </div>

      <CardContent className={compact ? 'p-2.5' : 'p-3'}>
        {/* Header with community info and rating */}
        <div className={`flex justify-between items-start ${compact ? 'mb-2' : 'mb-3'}`}>
          {/* Left: Community info */}
          <div className="flex-1 pr-3">
            <h3 className={`${compact ? 'text-sm' : 'text-base'} font-bold mb-1 leading-tight text-gray-900 dark:text-white`}>
              {community.name}
            </h3>
            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
              <MapPin className="w-3 h-3" />
              <span>{community.city}, {community.state}</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">📞 Call</span>
              <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">🌐 Website</span>
              <span className="text-green-600 dark:text-green-400 hover:underline cursor-pointer">📅 Tour</span>
            </div>
          </div>

          {/* Right: Rating */}
          <div className="text-right flex-shrink-0">
            <div className="flex items-center gap-0.5 justify-end mb-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-2.5 h-2.5 ${
                    i < Math.floor(rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="text-xs ml-1 text-gray-700 dark:text-gray-300">({!isNaN(rating) ? rating.toFixed(1) : '4.5'})</span>
            </div>
          </div>
        </div>

        {/* Compact Features Grid */}
        <div className={`grid grid-cols-2 ${compact ? 'gap-1.5 mb-2' : 'gap-2 mb-3'}`}>
          {/* Amenities */}
          <div className={`bg-gray-50 dark:bg-gray-700 rounded-md ${compact ? 'p-1.5' : 'p-2'}`}>
            <h4 className="text-xs font-semibold mb-1.5 text-gray-900 dark:text-gray-100">Amenities</h4>
            <div className="space-y-0.5">
              {amenities.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-1 text-xs">
                  {getAmenityIcon(amenity)}
                  <span className="text-gray-700 dark:text-gray-300 truncate">{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Why Featured */}
          <div className={`bg-amber-50 dark:bg-amber-950/30 rounded-md ${compact ? 'p-1.5' : 'p-2'}`}>
            <h4 className="text-xs font-semibold mb-1.5 text-amber-800 dark:text-amber-200">Why Featured</h4>
            <div className="space-y-0.5">
              {getWhyFeatured().map((reason, idx) => (
                <div key={idx} className="flex items-center gap-1 text-xs">
                  <Star className="w-2.5 h-2.5 text-amber-600 flex-shrink-0" />
                  <span className="text-amber-700 dark:text-amber-300 font-medium truncate">{reason}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Care Types as badges */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {community.careTypes?.slice(0, 3).map((careType, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs px-1.5 py-0.5">
                {careType}
              </Badge>
            ))}
            {community.careTypes && community.careTypes.length > 3 && (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                +{community.careTypes.length - 3}
              </Badge>
            )}
          </div>
        </div>

        {/* CTA Button */}
        <Link href={`/community/${community.id}`}>
          <Button className={`w-full ${compact ? 'h-7' : 'h-8'} text-xs bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white`}>
            <Star className="w-3 h-3 mr-1.5" />
            View Community Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}