import React, { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Star, MapPin, Phone, Globe, Heart, Share2, 
  Activity, Users, Utensils, Car, Music, Book,
  CheckCircle, XCircle, AlertCircle, DollarSign, MessageSquare,
  Flag, RefreshCw, TrendingUp, Info, ExternalLink, Loader2, Lock, Calendar
} from "lucide-react";
import { EnhancedPhotoCarousel } from "@/components/EnhancedPhotoCarousel";
import { MessagingInterface } from "./MessagingInterface";
import { useContactReveal } from "@/hooks/useContactReveal";
import { useAuth } from "@/hooks/useAuth";

interface CommunityDetailsHeaderProps {
  community: any;
  verificationReport?: any;
  isVerifying?: boolean;
  isFavorite?: boolean;
  isFavoriteMutating?: boolean;
  onFavoriteToggle?: () => void;
  getPricingBadgeInfo?: (community: any, verificationReport: any) => any;
  formatCareType?: (careTypes?: string[]) => string;
  generatePhoneNumber?: (state: string, id: number) => string;
  onReserveClick?: () => void;
  onTourClick?: () => void;
  onPhotoChange?: (index: number) => void;
  currentPhotoIndex?: number;
  onStartVerification?: () => void;
  onRefetch?: () => void;
  isRefetching?: boolean;
}

export function CommunityDetailsHeader({ 
  community, 
  verificationReport,
  isVerifying = false,
  isFavorite = false,
  isFavoriteMutating = false,
  onFavoriteToggle,
  getPricingBadgeInfo,
  formatCareType,
  generatePhoneNumber,
  onReserveClick,
  onTourClick,
  onPhotoChange,
  currentPhotoIndex,
  onStartVerification,
  onRefetch,
  isRefetching = false
}: CommunityDetailsHeaderProps) {
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const { isRevealed, reveal, consentDialog } = useContactReveal(community.id, community.name);
  // Admin-only: the Perplexity research/refresh button is hidden entirely for
  // non-admins and logged-out visitors (paid path, cost control).
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  
  // Determine if community needs data quality review
  const needsDataReview = () => {
    // Check various data quality indicators
    if (!community.isVerified) return true;
    if (!community.website || community.website === '') return true;
    if (!community.phone || community.phone === '') return true;
    if (!community.photos || community.photos.length === 0) return true;
    if (community.dataQualityScore && community.dataQualityScore < 70) return true;
    
    // Check if pricing is missing or outdated
    const hasPricing = community.priceRange?.min > 0 || 
                       community.rentPerMonth > 0 || 
                       verificationReport?.pricing?.verified;
    if (!hasPricing) return true;
    
    return false;
  };
  
  const [isFlagged, setIsFlagged] = useState(false);

  const handleFlagCommunity = useCallback(async () => {
    if (isFlagged) return;
    try {
      const response = await fetch(`/api/communities/${community.id}/flag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communityId: community.id,
          flagType: 'Incorrect Information',
          reason: 'User reported inaccurate or outdated information',
          details: `Flagged from community page: ${community.name}, ${community.city}, ${community.state}`,
        })
      });
      
      if (response.ok) {
        setIsFlagged(true);
      }
    } catch (error) {
      console.error('Failed to flag community:', error);
    }
  }, [isFlagged, community]);
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
    
    // Market estimates based on national averages
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
    
    // Dynamic fallback based on state/location averages
    const stateAverages: { [key: string]: number } = {
      'CA': 4500, 'NY': 5500, 'FL': 3800, 'TX': 3500, 
      'IL': 4000, 'PA': 3900, 'OH': 3600, 'MI': 3700,
      'NC': 3400, 'GA': 3500, 'VA': 4200, 'WA': 4800,
      'AZ': 3600, 'MA': 5200, 'NJ': 5000, 'CO': 4100
    };
    
    const stateAvg = stateAverages[community.state] || 3800;
    return { price: `$${stateAvg.toLocaleString()}`, verified: false };
  };

  const pricing = getPricing();
  const enrichedContact = verificationReport?.contactInformation?.extracted || 
                         verificationReport?.verificationResults?.contactInformation?.extracted;
  // Only display REAL phone numbers - Golden Data Rule
  const displayPhone = enrichedContact?.phone || community.phone || null;
  
  // Debug phone number sources
  console.log('🔍 Phone Number Sources:', {
    enrichedContactPhone: enrichedContact?.phone,
    communityPhone: community.phone,
    finalDisplayPhone: displayPhone,
    communityName: community.name
  });
  
  // Priority order for website: 1) Market data analysis 2) Contact extraction 3) Database
  const marketDataWebsite = verificationReport?.extractedCommunities?.find((c: any) => 
    c.name.toLowerCase().includes(community.name.toLowerCase()) ||
    community.name.toLowerCase().includes(c.name.toLowerCase())
  )?.officialWebsite;
  const displayWebsite = marketDataWebsite || enrichedContact?.website || community.website;
  
  // Get amenities from various sources
  const webIntel = verificationReport?.webIntelligence || verificationReport?.verificationResults?.webIntelligence;
  const extractedAmenities = webIntel?.amenities || verificationReport?.amenities?.extracted || community.amenities;
  
  const amenities = extractedAmenities?.length > 0 
    ? extractedAmenities.slice(0, 6) // Show up to 6 amenities
    : ["24-Hour Care", "Dining Services", "Activities", "Transportation", "Housekeeping", "Social Programs"];

  // Get combined photos from database and web intelligence
  const getCombinedPhotos = () => {
    const photos = [];
    
    // Add database photos first (if not stock)
    if (community.photos && community.photos.length > 0) {
      photos.push(...community.photos);
    }
    
    // Add web intelligence photos
    const webImages = webIntel?.images || [];
    if (webImages.length > 0) {
      const webPhotos = webImages.map((img: any) => {
        if (typeof img === 'string') {
          return { image_url: img };
        }
        return {
          image_url: img.image_url || img.url || img,
          origin_url: img.origin_url,
          width: img.width,
          height: img.height
        };
      });
      photos.push(...webPhotos);
    }
    
    return photos;
  };

  return (
    <>
      <Card className="overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <CardContent className="p-0">
        {/* Photo Carousel - natural height so the built-in thumbnail gallery is visible */}
        <div className="relative">
          <EnhancedPhotoCarousel 
            photos={getCombinedPhotos()} 
            communityName={community.name}
            communityId={community.id}
            community={community}
            verificationReport={verificationReport}
            isVerifying={isVerifying}
            className="w-full"
            currentPhotoIndex={currentPhotoIndex}
            onPhotoIndexChange={onPhotoChange}
            showSourceIndicator={true}
            onStartVerification={onStartVerification}
          />
        </div>
        
        {/* Photo Citations - NEW TRANSPARENCY FEATURE */}
        {(webIntel?.sources || verificationReport?.sources || verificationReport?.citations) && 
         (webIntel?.sources?.length > 0 || verificationReport?.sources?.length > 0 || verificationReport?.citations?.length > 0) && (
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <Info className="w-3 h-3" />
              <span>Photo sources:</span>
              <div className="flex flex-wrap gap-2">
                {(webIntel?.sources || verificationReport?.sources || verificationReport?.citations || [])
                  .slice(0, 3)
                  .map((source: string, idx: number) => {
                    // Extract domain from URL for display
                    let displayName = `Source ${idx + 1}`;
                    try {
                      const url = new URL(source);
                      displayName = url.hostname.replace('www.', '');
                    } catch {}
                    
                    return (
                      <a
                        key={idx}
                        href={source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3 inline mr-1" />
                        {displayName}
                      </a>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
        
        {/* Name + Action Buttons Row */}
        <div className="flex justify-between items-center gap-3 px-3 sm:px-6 py-2 border-b border-gray-200 dark:border-gray-700">
          {/* Community Name */}
          <h1 className="min-w-0 flex-1 text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent break-words leading-tight">
            {community.name}
          </h1>
          {/* Action Buttons */}
          <div className="flex flex-shrink-0 items-center space-x-2">
            {/* Re-fetch latest data — admin-only (paid Perplexity research) */}
            {onRefetch && isAdmin && (
              <button
                onClick={onRefetch}
                disabled={isRefetching}
                title="Re-fetch latest data"
                className={`p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transform transition-all duration-200 border border-gray-200 dark:border-gray-700 ${
                  isRefetching ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                }`}
              >
                {isRefetching ? (
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                ) : (
                  <RefreshCw className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                )}
              </button>
            )}

            {onFavoriteToggle && (
              <button
                onClick={onFavoriteToggle}
                disabled={isFavoriteMutating}
                className={`p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transform transition-all duration-200 border border-gray-200 dark:border-gray-700 ${
                  isFavoriteMutating ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                }`}
                data-testid="button-favorite-toggle"
              >
                {isFavoriteMutating ? (
                  <Loader2 className="w-5 h-5 animate-spin text-red-500" />
                ) : (
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700 dark:text-gray-300'}`} />
                )}
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
              className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 border border-gray-200 dark:border-gray-700"
            >
              <Share2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            
            {/* Flag for Review Button — always visible so users can report inaccurate info */}
            <button
              onClick={handleFlagCommunity}
              disabled={isFlagged}
              className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 border border-gray-200 dark:border-gray-700 disabled:opacity-60 disabled:cursor-default"
              title={isFlagged ? "Flagged for review — thank you!" : "Report incorrect information"}
            >
              <Flag className={`w-5 h-5 transition-colors ${isFlagged ? 'text-orange-500' : 'text-gray-500 hover:text-orange-500'}`} />
            </button>
          </div>
        </div>
        
        {/* Community Info Section with Premium Styling - SEPARATED FROM PHOTOS */}
        <div className="bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-850 dark:to-gray-800 mt-0 relative z-0">
          {/* Header Section with Enhanced Design */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 relative">
            
            {/* Community Details - Full width with better spacing */}
            <div>
              {/* Rating, Care Type and HUD Badges */}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                {community.googleRating && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-full border border-yellow-300 dark:border-yellow-700">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-bold text-gray-900 dark:text-white text-sm">
                      {community.googleRating}
                    </span>
                    {community.googleReviewCount > 0 && (
                      <span className="text-gray-600 dark:text-gray-400 text-xs">
                        ({community.googleReviewCount} reviews)
                      </span>
                    )}
                  </div>
                )}

                {community.flagStatus === 'confirmed' && (
                  <Badge className="bg-orange-100 text-orange-800 border border-orange-300 px-3 py-1.5 text-xs font-medium">
                    ⚠️ Listing Flagged
                  </Badge>
                )}
                {(isFlagged || community.flagStatus === 'pending') && (
                  <Badge variant="outline" className="border-yellow-400 text-yellow-700 dark:text-yellow-400 px-3 py-1.5 text-xs font-medium">
                    🔍 Under Review
                  </Badge>
                )}

                <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 text-xs font-bold">
                  {formatCareType ? formatCareType(community.careTypes) : "Nursing Home"}
                </Badge>

                {community.hudPropertyId && (
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 text-xs font-bold">
                    🏛️ HUD Property
                  </Badge>
                )}
              </div>
              
              <div className="flex items-start gap-2 mb-3">
                <span className="text-xl flex-shrink-0 mt-0.5">📌</span>
                <span className="text-gray-600 dark:text-gray-300">
                  {enrichedContact?.address || community.address}, {community.city}, {community.state} {community.zipCode}
                </span>
              </div>

              {/* Primary actions: Call & Website are gated; Tour is always open */}
              <div className="flex flex-wrap gap-2 mb-2">
                {displayPhone && (
                  isRevealed('phone') ? (
                    <Button
                      asChild
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <a href={`tel:${displayPhone}`} data-testid="link-call-community">
                        <Phone className="w-4 h-4 mr-2" />
                        {displayPhone}
                      </a>
                    </Button>
                  ) : (
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => reveal('phone')}
                      data-testid="button-reveal-phone"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Reveal Phone
                    </Button>
                  )
                )}

                {displayWebsite && (
                  isRevealed('website') ? (
                    <Button
                      asChild
                      variant="outline"
                      data-testid="button-visit-website"
                    >
                      <a
                        href={displayWebsite?.includes('://') ? displayWebsite : `https://${displayWebsite}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        Visit Website
                      </a>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => reveal('website')}
                      data-testid="button-reveal-website"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Reveal Website
                    </Button>
                  )
                )}

                {onTourClick && (
                  <Button
                    variant="outline"
                    onClick={onTourClick}
                    data-testid="button-schedule-tour"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Tour
                  </Button>
                )}
              </div>

            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    
    {/* Messaging Interface Modal */}
    <MessagingInterface
      isOpen={isMessagingOpen}
      onClose={() => setIsMessagingOpen(false)}
      communityId={community.id}
      communityName={community.name}
    />

    {consentDialog}
    </>
  );
}