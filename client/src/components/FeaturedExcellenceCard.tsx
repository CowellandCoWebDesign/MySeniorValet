import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Home, Heart, Activity, Users, Utensils, Car, Music, Book, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { Link } from "wouter";
import { getCommunityUrl } from "@/lib/community-url";
import { getEffectiveRating } from "@/lib/rating-utils";
import { useContactReveal } from "@/hooks/useContactReveal";

interface FeaturedExcellenceCardProps {
  community: {
    id: number;
    name: string;
    city: string;
    state: string;
    address?: string;
    streetAddress?: string; // Legacy field mapping
    careTypes?: string[];
    rating?: number;
    photos?: string[];
    description?: string;
    amenities?: string[];
    phone?: string;
    phoneNumber?: string; // Legacy field mapping
    website?: string;
    url?: string; // Legacy field mapping
    priceRange?: { min: number; max: number };
    rentPerMonth?: number | string;
    totalUnits?: number;
    occupancyRate?: number;
    hudPropertyId?: string;
  };
  index?: number;
  compact?: boolean; // For horizontal sliders
  landscape?: boolean; // Horizontal layout: photo left, rich content right
  disableAutoPhotoLoad?: boolean; // Prevent automatic photo loading in directory views
}

export function FeaturedExcellenceCard({ community, index = 0, compact = false, landscape = false, disableAutoPhotoLoad = false }: FeaturedExcellenceCardProps) {
  // Normalize legacy field names to standard fields
  const normalizedAddress = community.address || community.streetAddress;
  const normalizedPhone = community.phone || community.phoneNumber;
  const normalizedWebsite = community.website || community.url;

  // Contact gating: blur phone/website until the family logs in or shares consent.
  const { isRevealed, reveal, consentDialog } = useContactReveal(community.id, community.name);
  const normalizedWebsiteHref = normalizedWebsite
    ? (normalizedWebsite.startsWith('http') ? normalizedWebsite : `https://${normalizedWebsite}`)
    : '';
  
  // Check if address already contains city/state to avoid duplication
  const cityState = community.city && community.state ? `${community.city}, ${community.state}` : '';
  const addressContainsCityState = normalizedAddress && cityState && 
    normalizedAddress.toLowerCase().includes(community.city?.toLowerCase() || '') &&
    normalizedAddress.toLowerCase().includes(community.state?.toLowerCase() || '');
  const showSeparateCityState = !addressContainsCityState && cityState;
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [enrichedPhotos, setEnrichedPhotos] = useState<string[]>(community.photos || []);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);

  // Keep enrichedPhotos in sync when the community.photos prop updates (e.g. after admin upload)
  useEffect(() => {
    setEnrichedPhotos(community.photos || []);
    setCurrentPhotoIndex(0);
  }, [community.id, community.photos]);
  
  // Default amenities if none provided
  const amenities = community.amenities && community.amenities.length > 0 
    ? community.amenities.slice(0, 3)
    : ["24-Hour Care", "Dining Services", "Activities"];
  
  // Fetch enriched photos for the community
  useEffect(() => {
    const fetchEnrichedPhotos = async () => {
      // Skip if automatic photo loading is disabled (for directory views)
      if (disableAutoPhotoLoad) return;
      
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

  const rating = getEffectiveRating(community as any);

  // Pricing label honoring the Golden Data Rule (no synthetic prices)
  const rentValue = typeof community.rentPerMonth === "string"
    ? parseFloat(community.rentPerMonth)
    : community.rentPerMonth;
  const priceLabel = rentValue && rentValue > 0
    ? `$${Math.round(rentValue).toLocaleString()}/mo`
    : community.priceRange && community.priceRange.min > 0
      ? `$${Math.round(community.priceRange.min).toLocaleString()}/mo`
      : null;

  // Landscape layout: photo on the left, dense info on the right
  if (landscape) {
    const heroPhoto = enrichedPhotos && enrichedPhotos.length > 0 ? enrichedPhotos[0] : null;
    const careLabel = community.careTypes && community.careTypes.length > 0 ? community.careTypes[0] : "Senior Living";
    const initial = (community.name || "?").trim().charAt(0).toUpperCase();

    return (
      <Card className="group relative overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-md transition-all bg-white dark:bg-gray-800 flex flex-row w-full">
        {/* Left: photo / placeholder */}
        <div className="relative w-32 sm:w-40 flex-shrink-0 bg-gradient-to-br from-orange-500/90 to-amber-600/90 overflow-hidden">
          {heroPhoto ? (
            <img
              src={heroPhoto}
              alt={community.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl font-bold text-white/90 select-none">{initial}</span>
            </div>
          )}
          {/* Care type pill on photo */}
          <div className="absolute top-2 left-2 bg-black/55 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide">
            {careLabel}
          </div>
        </div>

        {/* Right: content */}
        <CardContent className="flex flex-col flex-grow p-3 min-w-0">
          {/* Header: name + address (left), pricing (right) */}
          <div className="flex justify-between items-start gap-2 mb-1.5">
            <div className="min-w-0 flex-1">
              <Link href={getCommunityUrl(community)}>
                <h3 className="text-sm font-bold leading-tight text-gray-900 dark:text-white line-clamp-1 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer" data-testid={`text-name-${community.id}`}>
                  {community.name}
                </h3>
              </Link>
              <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="line-clamp-1">{normalizedAddress || cityState || `${community.city}, ${community.state}`}</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              {priceLabel ? (
                <>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 leading-none">Starting at</div>
                  <div className="text-sm font-bold text-orange-600 dark:text-orange-400 leading-tight" data-testid={`text-price-${community.id}`}>{priceLabel}</div>
                </>
              ) : (
                <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400" data-testid={`text-price-${community.id}`}>Contact for pricing</div>
              )}
            </div>
          </div>

          {/* Rating + amenity icons */}
          <div className="flex items-center gap-2 mb-1.5">
            {rating !== null ? (
              <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded">
                <span className="text-xs font-bold">{rating.toFixed(1)}</span>
                <Star className="w-3 h-3 fill-green-600 text-green-600 dark:fill-green-400 dark:text-green-400" />
              </div>
            ) : (
              <span className="text-[10px] text-gray-400 dark:text-gray-500">Not yet rated</span>
            )}
            <div className="flex items-center gap-1.5">
              {amenities.slice(0, 3).map((amenity, idx) => (
                <span key={idx} title={amenity} className="text-gray-500 dark:text-gray-400">
                  {getAmenityIcon(amenity)}
                </span>
              ))}
            </div>
          </div>

          {/* Description snippet */}
          {community.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2 flex-grow">
              {community.description}
            </p>
          )}
          {!community.description && <div className="flex-grow" />}

          {/* Consent-gated contact reveal */}
          {(normalizedPhone || normalizedWebsite) && (
            <div className="flex items-center gap-2 mb-2 text-xs">
              {normalizedPhone && (
                isRevealed('phone') ? (
                  <a
                    href={`tel:${normalizedPhone}`}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                    data-testid={`link-call-${community.id}`}
                  >
                    📞 Call
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); reveal('phone'); }}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                    data-testid={`button-call-${community.id}`}
                  >
                    <Lock className="w-3 h-3" /> Call
                  </button>
                )
              )}
              {normalizedWebsite && (
                isRevealed('website') ? (
                  <a
                    href={normalizedWebsiteHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2 py-1 rounded bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                    data-testid={`link-website-${community.id}`}
                  >
                    🌐 Website
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); reveal('website'); }}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                    data-testid={`button-website-${community.id}`}
                  >
                    <Lock className="w-3 h-3" /> Website
                  </button>
                )
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-auto">
            <Link href={getCommunityUrl(community)} className="flex-1">
              <Button className="w-full h-7 text-xs bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white" data-testid={`button-details-${community.id}`}>
                View Details
              </Button>
            </Link>
            <Link href={`${getCommunityUrl(community)}?tab=tour`} className="flex-1">
              <Button variant="outline" className="w-full h-7 text-xs border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30" data-testid={`button-tour-${community.id}`}>
                Schedule Tour
              </Button>
            </Link>
          </div>
        </CardContent>
        {consentDialog}
      </Card>
    );
  }

  return (
    <Card className={`relative overflow-hidden border hover:border-orange-300 dark:hover:border-orange-700 transition-all bg-white dark:bg-gray-800 flex flex-col ${compact ? 'w-[85%] sm:w-[280px] min-w-[85%] sm:min-w-[280px]' : 'w-[85%] sm:w-[300px] min-w-[85%] sm:min-w-[300px]'} h-full`}>
      {/* Hero Image with Carousel */}
      <div className={`relative ${compact ? 'h-36' : 'h-40'} overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900 dark:to-amber-900 flex-shrink-0`}>
        {enrichedPhotos && enrichedPhotos.length > 0 ? (
          <>
            <img 
              src={enrichedPhotos[currentPhotoIndex]} 
              alt={`${community.name} - Photo ${currentPhotoIndex + 1}`}
              className="w-full h-full object-cover transition-opacity duration-500"
              onError={() => {
                // Remove the failed photo; if no photos remain, clear the array
                // so the placeholder (Professional Photos Coming Soon) renders.
                const newPhotos = enrichedPhotos.filter((_, i) => i !== currentPhotoIndex);
                setEnrichedPhotos(newPhotos);
                setCurrentPhotoIndex(newPhotos.length > 0 ? 0 : 0);
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
        
        {/* Dynamic Care Type Badge - shows actual care type or defaults to "Senior Living" */}
        <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 py-0.5 rounded text-xs font-bold">
          {community.careTypes && community.careTypes.length > 0 
            ? community.careTypes[0] 
            : "Senior Living"}
        </div>
        
        {/* Availability Badge */}
        <div className="absolute bottom-2 right-2">
          <Badge className={`text-xs font-medium px-2 py-1 ${getAvailabilityColor()}`}>
            {getAvailability()}
          </Badge>
        </div>
      </div>

      <CardContent className={`${compact ? 'p-2.5' : 'p-3'} flex flex-col flex-grow`}>
        {/* Header with community name and rating */}
        <div className={`flex justify-between items-start ${compact ? 'mb-1.5' : 'mb-2'}`}>
          {/* Left: Community name */}
          <h3 className={`${compact ? 'text-sm' : 'text-base'} font-bold leading-tight text-gray-900 dark:text-white line-clamp-2 flex-1 pr-2`}>
            {community.name}
          </h3>

          {/* Right: Rating */}
          <div className="text-right flex-shrink-0">
            {rating !== null ? (
              <div className="flex items-center gap-0.5 justify-end">
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
                <span className="text-xs ml-1 text-gray-700 dark:text-gray-300">({rating.toFixed(1)})</span>
              </div>
            ) : (
              <div className="flex items-center gap-0.5 justify-end">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-2.5 h-2.5 text-gray-300" />
                ))}
                <span className="text-xs ml-1 text-gray-500 dark:text-gray-400">Not yet rated</span>
              </div>
            )}
          </div>
        </div>

        {/* Uniform Contact Information Section */}
        <div className="space-y-1 mb-2 text-xs text-gray-600 dark:text-gray-400" data-testid={`contact-section-${community.id}`}>
          {/* Address line (if available) */}
          {normalizedAddress && (
            <div className="flex items-start gap-1.5" data-testid={`address-${community.id}`}>
              <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0 text-gray-500" />
              <span className="line-clamp-1">{normalizedAddress}</span>
            </div>
          )}
          
          {/* City, State (only shown if address doesn't already contain it) */}
          {showSeparateCityState && (
            <div className="flex items-center gap-1.5" data-testid={`city-state-${community.id}`}>
              {!normalizedAddress && <MapPin className="w-3 h-3 flex-shrink-0 text-gray-500" />}
              {normalizedAddress && <span className="w-3 flex-shrink-0" />}
              <span>{cityState}</span>
            </div>
          )}
          
          {/* Phone (if available) */}
          {normalizedPhone && (
            <div className="flex items-center gap-1.5" data-testid={`phone-${community.id}`}>
              <span className="w-3 text-center flex-shrink-0">📞</span>
              {isRevealed('phone') ? (
                <a href={`tel:${normalizedPhone}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                  {normalizedPhone}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); reveal('phone'); }}
                  className="flex items-center gap-1 text-blue-500 hover:underline"
                  data-testid={`button-reveal-phone-${community.id}`}
                >
                  <Lock className="w-3 h-3" /> Tap to reveal phone
                </button>
              )}
            </div>
          )}
          
          {/* Website (if available) */}
          {normalizedWebsite && (
            <div className="flex items-center gap-1.5" data-testid={`website-${community.id}`}>
              <span className="w-3 text-center flex-shrink-0">🌐</span>
              {isRevealed('website') ? (
                <a 
                  href={normalizedWebsiteHref} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 dark:text-blue-400 hover:underline truncate"
                >
                  Website
                </a>
              ) : (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); reveal('website'); }}
                  className="flex items-center gap-1 text-blue-500 hover:underline"
                  data-testid={`button-reveal-website-${community.id}`}
                >
                  <Lock className="w-3 h-3" /> Tap to reveal website
                </button>
              )}
            </div>
          )}
        </div>

        {/* Action buttons row */}
        <div className="flex items-center gap-2 text-xs mb-2">
          {normalizedPhone && (
            isRevealed('phone') ? (
              <a 
                href={`tel:${normalizedPhone}`} 
                className="flex items-center gap-1 px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors" 
                data-testid={`link-call-${community.id}`}
              >
                📞 Call
              </a>
            ) : (
              <button 
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); reveal('phone'); }}
                className="flex items-center gap-1 px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors" 
                data-testid={`button-call-${community.id}`}
              >
                <Lock className="w-3 h-3" /> Call
              </button>
            )
          )}
          {normalizedWebsite && (
            isRevealed('website') ? (
              <a 
                href={normalizedWebsiteHref} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-1 px-2 py-1 rounded bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors" 
                data-testid={`link-website-${community.id}`}
              >
                🌐 Website
              </a>
            ) : (
              <button 
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); reveal('website'); }}
                className="flex items-center gap-1 px-2 py-1 rounded bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors" 
                data-testid={`button-website-${community.id}`}
              >
                <Lock className="w-3 h-3" /> Website
              </button>
            )
          )}
          <Link href={`${getCommunityUrl(community)}?tab=tour`} data-testid={`link-tour-${community.id}`}>
            <span className="flex items-center gap-1 px-2 py-1 rounded bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors cursor-pointer">
              📅 Tour
            </span>
          </Link>
        </div>

        {/* Care Types as badges */}
        {!compact && (
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
        )}

        {/* CTA Button */}
        <Link href={getCommunityUrl(community)}>
          <Button className={`w-full ${compact ? 'h-7' : 'h-8'} text-xs bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white`}>
            <Star className="w-3 h-3 mr-1.5" />
            View Community Details
          </Button>
        </Link>
      </CardContent>
      {consentDialog}
    </Card>
  );
}