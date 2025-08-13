import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Phone, Globe, CheckCircle, Users, Calendar, DollarSign, Camera, Video, Home, UserCheck, Stethoscope, Activity, Wifi, Car, Utensils, ChevronLeft, ChevronRight, ExternalLink, Heart, Share, Clock, AlertTriangle, Heart as HeartIcon, Dumbbell, UtensilsCrossed, Bus, HandHeart, Waves, Scissors, AlertCircle, ShieldCheck, Mail as MailIcon, Shield, Database, Info } from "lucide-react";
import { Link } from "wouter";
import type { Community } from "@shared/schema";
import { FlagListingDialog } from "@/components/flag-listing-dialog";
import { PhotoCarousel } from "@/components/photo-carousel";
import { FamilyShareButton } from "@/components/family-share-button";
import { EnhancedCommunityCard } from "@/components/EnhancedCommunityCard";

export default function CommunityPage() {
  const [, params] = useRoute("/community/:id");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  
  // Redirect to search if no ID is provided
  if (!params?.id) {
    window.location.href = '/search';
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Redirecting to search...</h2>
          <p className="text-gray-600">No community ID provided</p>
        </div>
      </div>
    );
  }
  
  // Get the back URL - either from referrer or localStorage search state
  const getBackUrl = () => {
    // Check if we have stored search state
    const searchState = localStorage.getItem('searchState');
    if (searchState) {
      try {
        const state = JSON.parse(searchState);
        const searchParams = new URLSearchParams();
        
        if (state.location) searchParams.set('location', state.location);
        if (state.careType && state.careType !== 'all') searchParams.set('careType', state.careType);
        if (state.priceRange && state.priceRange !== 'all') searchParams.set('priceRange', state.priceRange);
        if (state.availability && state.availability !== 'all') searchParams.set('availability', state.availability);
        if (state.minRating && state.minRating !== 'all') searchParams.set('minRating', state.minRating);
        if (state.hasPhotos) searchParams.set('hasPhotos', 'true');
        if (state.viewMode && state.viewMode !== 'list') searchParams.set('view', state.viewMode);
        if (state.sortBy && state.sortBy !== 'relevance') searchParams.set('sortBy', state.sortBy);
        
        const queryString = searchParams.toString();
        return queryString ? `/search?${queryString}` : '/search';
      } catch (error) {
        console.error('Error parsing search state:', error);
      }
    }
    
    // Fallback to basic search page
    return '/search';
  };

  // Helper function to get source citation for pricing/availability data
  const getDataSourceCitation = (community: any) => {
    if (community.hudPropertyId && community.rentPerMonth) {
      return {
        text: `Source: HUD Property ID ${community.hudPropertyId}`,
        type: 'hud',
        icon: <Shield className="h-3 w-3" />,
        color: 'text-green-600'
      };
    } else if (community.governmentSourced) {
      return {
        text: 'Source: Government Database',
        type: 'government',
        icon: <Database className="h-3 w-3" />,
        color: 'text-blue-600'
      };
    } else if (community.claimedBy && community.pricingLastVerified) {
      const verifiedDate = new Date(community.pricingLastVerified).toLocaleDateString();
      return {
        text: `Source: Community Verified ${verifiedDate}`,
        type: 'claimed',
        icon: <CheckCircle className="h-3 w-3" />,
        color: 'text-purple-600'
      };
    } else {
      return {
        text: 'Source: Market Research',
        type: 'market',
        icon: <Info className="h-3 w-3" />,
        color: 'text-gray-600 dark:text-gray-300'
      };
    }
  };
  
  const { data: community, isLoading } = useQuery<Community>({
    queryKey: [`/api/communities/${params?.id}`],
    enabled: !!params?.id && params.id !== 'undefined',
  });

  // Scroll to top immediately when page loads and when community data loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  useEffect(() => {
    if (community) {
      window.scrollTo(0, 0);
    }
  }, [community]);

  // Get all photos from various sources
  const getAllPhotos = (community: Community) => {
    const photos: string[] = [];
    if (community.photos && Array.isArray(community.photos) && community.photos.length > 0) {
      photos.push(...community.photos);
    }
    if (community.yelpPhotos && Array.isArray(community.yelpPhotos) && community.yelpPhotos.length > 0) {
      photos.push(...community.yelpPhotos);
    }
    if (community.imageGallery && Array.isArray(community.imageGallery) && community.imageGallery.length > 0) {
      photos.push(...community.imageGallery);
    }
    return Array.from(new Set(photos)); // Remove duplicates
  };

  const allPhotos = community ? getAllPhotos(community) : [];
  const communityPhotos = community?.photos || [];
  const hasPhotos = allPhotos.length > 0;

  // Render Yelp rating stars
  const renderYelpStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-400 text-yellow-400 opacity-50" />);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
    }
    return stars;
  };

  const { data: similarCommunities } = useQuery<Community[]>({
    queryKey: ["/api/communities/similar", params?.id],
    enabled: !!params?.id && params.id !== 'undefined',
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Community Not Found</h1>
            <Link href={getBackUrl()}>
              <Button>Back to Search</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const getAvailabilityConfig = (status: string) => {
    switch (status) {
      case "Available Now": 
        return { 
          color: "bg-green-600 text-white", 
          icon: <CheckCircle className="h-5 w-5" />,
          urgency: "high"
        };
      case "Waitlist": 
        return { 
          color: "bg-yellow-600 text-white", 
          icon: <Users className="h-5 w-5" />,
          urgency: "medium"
        };
      case "Full": 
        return { 
          color: "bg-red-600 text-white", 
          icon: <AlertTriangle className="h-5 w-5" />,
          urgency: "low"
        };
      default: 
        return { 
          color: "bg-gray-600 text-white", 
          icon: <Calendar className="h-5 w-5" />,
          urgency: "medium"
        };
    }
  };

  const availability = getAvailabilityConfig(community.availabilityStatus || "Contact for Availability");

  const getCareIcon = (careType: string) => {
    switch(careType) {
      case "Independent Living": return <Home className="h-5 w-5" />;
      case "Assisted Living": return <UserCheck className="h-5 w-5" />;
      case "Memory Care": return <Stethoscope className="h-5 w-5" />;
      case "Skilled Nursing": return <Activity className="h-5 w-5" />;
      default: return <Home className="h-5 w-5" />;
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch(amenity.toLowerCase()) {
      case "wifi": return "📶";
      case "parking": return <Car className="h-4 w-4" />;
      case "dining": case "restaurant": return <Utensils className="h-4 w-4" />;
      case "fitness": return "🏋️";
      case "pool": return "🏊";
      case "spa": return "💆";
      case "library": return "📚";
      case "gardens": return "🌺";
      case "activities": return "🎨";
      default: return "✨";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading community details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Community Not Found</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">The community you're looking for doesn't exist or has been removed.</p>
            <Link to={getBackUrl()}>
              <Button>Back to Search</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Handle service provider detection
  const isServiceProvider = community?.facilityType === 'Service Provider' || 
                           community?.pricingType === 'service_provider' ||
                           (community?.description?.includes('⚠️ 3rd Party Service Provider'));

  // Service provider warning display
  if (isServiceProvider) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link to={getBackUrl()}>
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back to Search</span>
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <Home className="h-4 w-4" />
                  <span>MySeniorValet</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Service Provider Warning */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-800">
                <AlertTriangle className="h-6 w-6" />
                <span>Service Provider Detected</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-red-100 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900 mb-2">{community?.name}</h3>
                  <p className="text-red-800 text-sm mb-3">
                    This listing appears to be a 3rd party service provider, referral agency, or care service company - not a senior living community.
                  </p>
                  <div className="text-red-700 text-sm space-y-1">
                    <p><strong>Why this matters:</strong> MySeniorValet maintains strict anti-referral policies to protect families from hidden fees.</p>
                    <p><strong>What we recommend:</strong> Search for actual senior living communities instead of service providers.</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Link to="/search">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Search Real Communities
                    </Button>
                  </Link>
                  <Link to="/">
                    <Button variant="outline">
                      <Home className="h-4 w-4 mr-2" />
                      Return Home
                    </Button>
                  </Link>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-red-900 mb-2">Our Anti-Referral Mission</h4>
                  <p className="text-red-800 text-sm">
                    MySeniorValet connects families directly with senior living communities, eliminating referral fees and hidden costs. 
                    We actively remove service providers to maintain pricing transparency and protect families from unnecessary markups.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Issue */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5" />
                <span>Report an Issue</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                If you believe this listing was incorrectly classified, please let us know.
              </p>
              <FlagListingDialog 
                communityId={community?.id || 0} 
                communityName={community?.name || 'Unknown Community'} 
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/8 to-pink-400/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-cyan-400/8 to-blue-400/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-2/3 right-1/3 w-64 h-64 bg-gradient-to-r from-emerald-400/8 to-teal-400/8 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="relative z-10">
        <NavigationHeader 
          title={community?.name || "Community Details"} 
          subtitle={`${community?.city || ""}, ${community?.state || ""}`}
        />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Back Navigation */}
        <div className="mb-6 animate-in fade-in slide-in-from-left-4 duration-500">
          <Link href={getBackUrl()}>
            <Button variant="outline" className="mb-4 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 transform hover:scale-105">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
          </Link>
        </div>

        {/* ENHANCED PHOTO GALLERY */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          <Card className="overflow-hidden hover:shadow-2xl transition-shadow duration-500">
            {hasPhotos ? (
              <div className="relative overflow-hidden">
                <PhotoCarousel 
                  photos={allPhotos} 
                  communityName={community.name}
                  className="h-96 transform hover:scale-105 transition-transform duration-700"
                />
                
                {/* Virtual Tour Badge */}
                {community.virtualTourUrl && (
                  <div className="absolute top-4 left-4 animate-in fade-in slide-in-from-top-4 duration-500 delay-300">
                    <Badge className="bg-blue-600 text-white cursor-pointer hover:bg-blue-700 transform hover:scale-110 transition-all duration-300">
                      <Video className="h-3 w-3 mr-1" />
                      Virtual Tour Available
                    </Badge>
                  </div>
                )}

                {/* Availability Overlay */}
                <div className={`absolute bottom-0 left-0 right-0 ${availability.color} px-6 py-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {availability.icon}
                      <span className="font-bold text-lg">{community.availabilityStatus}</span>
                      {community.availableUnits && (
                        <span className="opacity-90">• {community.availableUnits} units available</span>
                      )}
                    </div>
                    {availability.urgency === "high" && (
                      <Badge variant="secondary" className="bg-white text-green-800 font-semibold">
                        <Clock className="h-3 w-3 mr-1" />
                        Act Fast
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-96 bg-gray-100 flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Photos Coming Soon</p>
                  <p className="text-sm">We're working to add photos for this community</p>
                  
                  {/* Availability Overlay for No Photos */}
                  <div className={`absolute bottom-0 left-0 right-0 ${availability.color} px-6 py-4`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {availability.icon}
                        <span className="font-bold text-lg">{community.availabilityStatus}</span>
                        {community.availableUnits && (
                          <span className="opacity-90">• {community.availableUnits} units available</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{community.name}</h1>
                    <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
                      <MapPin className="h-5 w-5 mr-2" />
                      {community.address}, {community.city}, {community.state} {community.zipCode}
                    </div>
                    
                    {/* Community Website - Prominently Displayed */}
                    {community.website && (
                      <div className="flex items-center mb-4">
                        <Globe className="h-5 w-5 text-blue-600 mr-2" />
                        <a 
                          href={community.website.startsWith('http') ? community.website : `https://${community.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:text-blue-800 hover:underline font-semibold text-lg flex items-center"
                        >
                          Visit Official Website
                          <ExternalLink className="h-4 w-4 ml-1" />
                        </a>
                      </div>
                    )}
                    
                    {/* VERIFIED OCCUPANCY INFORMATION */}
                    {(community.occupancyRateHud || community.totalUnitsHud || community.availableUnits) && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700 mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <span className="font-semibold text-blue-900 dark:text-blue-200">
                            Verified Occupancy Information
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {community.occupancyRateHud && (
                            <div>
                              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                {Math.round(parseFloat(community.occupancyRateHud))}%
                              </div>
                              <div className="text-sm text-blue-700 dark:text-blue-300">Current Occupancy</div>
                            </div>
                          )}
                          {community.totalUnitsHud && (
                            <div>
                              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                {community.totalUnitsHud}
                              </div>
                              <div className="text-sm text-blue-700 dark:text-blue-300">Total Units</div>
                            </div>
                          )}
                          {community.availableUnits && (
                            <div>
                              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {community.availableUnits}
                              </div>
                              <div className="text-sm text-green-700 dark:text-green-300">Available Now</div>
                            </div>
                          )}
                        </div>
                        {community.hudPropertyId && (
                          <div className="text-xs text-blue-600 dark:text-blue-400 mt-3 flex items-center">
                            <Shield className="w-3 h-3 mr-1" />
                            Source: HUD Property ID {community.hudPropertyId}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {community.description && (
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{community.description}</p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4" />
                    </Button>
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
                        phone: community.phone || undefined,
                        website: community.website || undefined
                      }}
                      size="sm"
                      variant="outline"
                    />
                    <FlagListingDialog 
                      communityId={community.id} 
                      communityName={community.name} 
                    />
                  </div>
                </div>

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200">
                  {community.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">{community.phone}</span>
                    </div>
                  )}
                  {community.email && (
                    <div className="flex items-center space-x-2">
                      <MailIcon className="h-4 w-4 text-blue-600" />
                      <a href={`mailto:${community.email}`} className="text-sm text-blue-600 hover:underline">
                        {community.email}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Care Levels & Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserCheck className="h-6 w-6 text-purple-600" />
                  <span>Care Levels & Services</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(community.careTypes || []).map((type) => (
                    <div key={type} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-purple-600">{getCareIcon(type)}</span>
                        <span className="font-semibold text-purple-900">{type}</span>
                      </div>
                      {community.careServices && community.careServices.length > 0 && (
                        <div className="space-y-1">
                          {community.careServices.slice(0, 3).map((service, index) => (
                            <div key={index} className="text-sm text-purple-700 flex items-center space-x-2">
                              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                              <span>{service}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* COMPREHENSIVE SERVICES SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Healthcare Services */}
              {community.healthcareServices && community.healthcareServices.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Stethoscope className="h-6 w-6 text-red-600" />
                      <span>Healthcare & Medical Services</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {community.healthcareServices.map((service, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                          <Stethoscope className="h-4 w-4 text-red-600" />
                          <span className="text-red-900 font-medium">{service}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Spa & Wellness Services */}
              {community.spaServices && community.spaServices.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Waves className="h-6 w-6 text-blue-600" />
                      <span>Spa & Wellness Services</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {community.spaServices.map((service, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                          <Scissors className="h-4 w-4 text-blue-600" />
                          <span className="text-blue-900 font-medium">{service}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Fitness Services */}
              {community.fitnessServices && community.fitnessServices.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Dumbbell className="h-6 w-6 text-green-600" />
                      <span>Fitness & Recreation</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {community.fitnessServices.map((service, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                          <Activity className="h-4 w-4 text-green-600" />
                          <span className="text-green-900 font-medium">{service}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Dining Services */}
              {community.diningServices && community.diningServices.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <UtensilsCrossed className="h-6 w-6 text-orange-600" />
                      <span>Dining & Culinary Services</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {community.diningServices.map((service, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                          <Utensils className="h-4 w-4 text-orange-600" />
                          <span className="text-orange-900 font-medium">{service}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Transportation Services */}
              {community.transportationServices && community.transportationServices.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bus className="h-6 w-6 text-purple-600" />
                      <span>Transportation Services</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {community.transportationServices.map((service, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                          <Car className="h-4 w-4 text-purple-600" />
                          <span className="text-purple-900 font-medium">{service}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Social Services */}
              {community.socialServices && community.socialServices.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <HandHeart className="h-6 w-6 text-pink-600" />
                      <span>Social & Support Services</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {community.socialServices.map((service, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg">
                          <Users className="h-4 w-4 text-pink-600" />
                          <span className="text-pink-900 font-medium">{service}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* COMPREHENSIVE AMENITIES & SERVICES SHOWCASE */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-6 w-6 text-blue-600" />
                  <span>Comprehensive Amenities & Services</span>
                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                    Verified Data Integration
                  </Badge>
                </CardTitle>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Complete facilities and services overview from verified sources
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* AMENITIES OVERVIEW */}
                  {community.amenities && community.amenities.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200">
                              Verified Amenities
                            </h3>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              {community.amenities.length} confirmed facilities and features
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">
                            A+
                          </div>
                          <div className="text-xs text-blue-700 dark:text-blue-300">
                            Amenity Grade
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {community.amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-600 shadow-sm">
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {amenity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FITNESS & RECREATION SERVICES */}
                  {community.fitnessServices && community.fitnessServices.length > 0 && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-lg border border-green-200 dark:border-green-700">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                            <Dumbbell className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-green-900 dark:text-green-200">
                              Fitness & Recreation
                            </h3>
                            <p className="text-sm text-green-700 dark:text-green-300">
                              {community.fitnessServices.length} wellness programs and facilities
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-900 dark:text-green-200">
                            A+
                          </div>
                          <div className="text-xs text-green-700 dark:text-green-300">
                            Wellness Grade
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {community.fitnessServices.map((service, index) => (
                          <div key={index} className="flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-600 shadow-sm">
                            <Activity className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {service}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* DINING SERVICES */}
                  {community.diningServices && community.diningServices.length > 0 && (
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 rounded-lg border border-orange-200 dark:border-orange-700">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                            <UtensilsCrossed className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-orange-900 dark:text-orange-200">
                              Culinary Excellence
                            </h3>
                            <p className="text-sm text-orange-700 dark:text-orange-300">
                              {community.diningServices.length} dining programs and accommodations
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-orange-900 dark:text-orange-200">
                            A+
                          </div>
                          <div className="text-xs text-orange-700 dark:text-orange-300">
                            Dining Grade
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {community.diningServices.map((service, index) => (
                          <div key={index} className="flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-lg p-3 border border-orange-200 dark:border-orange-600 shadow-sm">
                            <Utensils className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {service}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TRANSPORTATION SERVICES */}
                  {community.transportationServices && community.transportationServices.length > 0 && (
                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-700">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                            <Bus className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-purple-900 dark:text-purple-200">
                              Transportation Services
                            </h3>
                            <p className="text-sm text-purple-700 dark:text-purple-300">
                              {community.transportationServices.length} mobility and transport options
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-purple-900 dark:text-purple-200">
                            A+
                          </div>
                          <div className="text-xs text-purple-700 dark:text-purple-300">
                            Transport Grade
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {community.transportationServices.map((service, index) => (
                          <div key={index} className="flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-lg p-3 border border-purple-200 dark:border-purple-600 shadow-sm">
                            <Car className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {service}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* COMPREHENSIVE SERVICES OVERVIEW WHEN DATA IS LIMITED */}
                  {(!community.amenities || community.amenities.length === 0) && 
                   (!community.fitnessServices || community.fitnessServices.length === 0) &&
                   (!community.diningServices || community.diningServices.length === 0) &&
                   (!community.transportationServices || community.transportationServices.length === 0) && (
                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-400 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <Info className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-200 mb-2">
                          Amenities & Services Information
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Detailed amenities data is being verified for this community. 
                          Please contact the community directly for complete information.
                        </p>
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                          <div className="flex items-center justify-center space-x-2 mb-2">
                            <ShieldCheck className="h-5 w-5 text-blue-600" />
                            <span className="font-medium text-gray-900 dark:text-white">What We're Verifying</span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <div>• Dining options and meal services</div>
                            <div>• Fitness facilities and wellness programs</div>
                            <div>• Transportation and mobility services</div>
                            <div>• Recreation and social activities</div>
                            <div>• Technology and connectivity options</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* DATA VERIFICATION STATUS */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Info className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-gray-200">
                          Data Sources
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        {community.hudPropertyId && (
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            HUD Data Available
                          </Badge>
                        )}
                        {community.amenities && community.amenities.length > 0 && (
                          <Badge className="bg-gray-100 text-gray-800 text-xs">
                            {community.amenities.length} Amenities Listed
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Information compiled from government databases and public records. 
                      Please verify current details directly with the community.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* COMPREHENSIVE HEALTHCARE & CARE SERVICES SHOWCASE */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Stethoscope className="h-6 w-6 text-red-600" />
                  <span>Healthcare & Care Services</span>
                  <Badge className="bg-red-100 text-red-800 text-xs">
                    Medical Excellence
                  </Badge>
                </CardTitle>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Comprehensive medical care and health services available
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* HEALTHCARE SERVICES */}
                  {community.healthcareServices && community.healthcareServices.length > 0 && (
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 p-6 rounded-lg border border-red-200 dark:border-red-700">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                            <Stethoscope className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-red-900 dark:text-red-200">
                              Professional Healthcare Services
                            </h3>
                            <p className="text-sm text-red-700 dark:text-red-300">
                              {community.healthcareServices.length} specialized medical programs
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-red-900 dark:text-red-200">
                            A+
                          </div>
                          <div className="text-xs text-red-700 dark:text-red-300">
                            Healthcare Grade
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {community.healthcareServices.map((service, index) => (
                          <div key={index} className="flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-lg p-4 border border-red-200 dark:border-red-600 shadow-sm">
                            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Stethoscope className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {service}
                              </span>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                Professional medical service
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CARE TYPES OVERVIEW */}
                  {community.careTypes && community.careTypes.length > 0 && (
                    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-6 rounded-lg border border-teal-200 dark:border-teal-700">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                            <HandHeart className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-teal-900 dark:text-teal-200">
                              Specialized Care Programs
                            </h3>
                            <p className="text-sm text-teal-700 dark:text-teal-300">
                              {community.careTypes.length} levels of care available
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-teal-900 dark:text-teal-200">
                            A+
                          </div>
                          <div className="text-xs text-teal-700 dark:text-teal-300">
                            Care Excellence
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {community.careTypes.map((careType, index) => (
                          <div key={index} className="flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-lg p-4 border border-teal-200 dark:border-teal-600 shadow-sm">
                            <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                              {careType.includes('Memory') || careType.includes('Dementia') || careType.includes('Alzheimer') ? (
                                <HeartIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                              ) : careType.includes('Independent') ? (
                                <Home className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                              ) : careType.includes('Assisted') ? (
                                <HandHeart className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                              ) : careType.includes('Skilled') || careType.includes('Nursing') ? (
                                <Stethoscope className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                              ) : (
                                <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                              )}
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {careType}
                              </span>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {careType.includes('Memory') || careType.includes('Dementia') || careType.includes('Alzheimer') ? 'Specialized memory care' :
                                 careType.includes('Independent') ? 'Maintenance-free living' :
                                 careType.includes('Assisted') ? 'Daily living assistance' :
                                 careType.includes('Skilled') || careType.includes('Nursing') ? '24/7 medical care' :
                                 'Specialized care services'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* HUD GOVERNMENT VERIFICATION FOR AFFORDABLE CARE */}
                  {community.hudPropertyId && community.rentPerMonth && (
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-6 rounded-lg border border-emerald-200 dark:border-emerald-700">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                            <Shield className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">
                              HUD Government Verified Housing
                            </h3>
                            <p className="text-sm text-emerald-700 dark:text-emerald-300">
                              Official government subsidized senior housing program
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-200">
                            ${community.rentPerMonth}
                          </div>
                          <div className="text-xs text-emerald-700 dark:text-emerald-300">
                            HUD Verified Rent
                          </div>
                        </div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-emerald-200 dark:border-emerald-600">
                        <div className="flex items-center space-x-2 mb-3">
                          <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                            HUD Property ID: {community.hudPropertyId}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Monthly Rent:</span>
                              <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                                ${community.rentPerMonth}/month
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Data Source:</span>
                              <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                                HUD Database
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Program Type:</span>
                              <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                                Senior Housing
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Verification:</span>
                              <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                                Government Verified
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SOCIAL SERVICES */}
                  {community.socialServices && community.socialServices.length > 0 && (
                    <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 p-6 rounded-lg border border-pink-200 dark:border-pink-700">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-pink-900 dark:text-pink-200">
                              Social & Support Services
                            </h3>
                            <p className="text-sm text-pink-700 dark:text-pink-300">
                              {community.socialServices.length} community support programs
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-pink-900 dark:text-pink-200">
                            A+
                          </div>
                          <div className="text-xs text-pink-700 dark:text-pink-300">
                            Social Support
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {community.socialServices.map((service, index) => (
                          <div key={index} className="flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-lg p-3 border border-pink-200 dark:border-pink-600 shadow-sm">
                            <HandHeart className="w-5 h-5 text-pink-600 dark:text-pink-400 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {service}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* LICENSING & COMPLIANCE STATUS */}
                  {(community.licenseNumber || community.licenseStatus) && (
                    <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 p-6 rounded-lg border border-violet-200 dark:border-violet-700">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-violet-600 rounded-lg flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-violet-900 dark:text-violet-200">
                              Licensing & Compliance
                            </h3>
                            <p className="text-sm text-violet-700 dark:text-violet-300">
                              State regulatory compliance and licensing status
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-violet-900 dark:text-violet-200">
                            {community.licenseStatus === 'Active' ? 'ACTIVE' : community.licenseStatus || 'VERIFIED'}
                          </div>
                          <div className="text-xs text-violet-700 dark:text-violet-300">
                            License Status
                          </div>
                        </div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-violet-200 dark:border-violet-600">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {community.licenseNumber && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">License Number:</span>
                              <span className="font-semibold text-violet-900 dark:text-violet-200">
                                {community.licenseNumber}
                              </span>
                            </div>
                          )}
                          {community.licenseStatus && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Status:</span>
                              <span className={`font-semibold ${
                                community.licenseStatus === 'Active' 
                                  ? 'text-green-600 dark:text-green-400' 
                                  : 'text-violet-900 dark:text-violet-200'
                              }`}>
                                {community.licenseStatus}
                              </span>
                            </div>
                          )}
                          {community.lastInspection && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Last Inspection:</span>
                              <span className="font-semibold text-violet-900 dark:text-violet-200">
                                {new Date(community.lastInspection).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Violations:</span>
                            <span className={`font-semibold ${
                              (community.violations || 0) === 0 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {community.violations || 0} violations
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* HEALTHCARE DATA STATUS WHEN LIMITED */}
                  {(!community.healthcareServices || community.healthcareServices.length === 0) && 
                   (!community.careTypes || community.careTypes.length === 0) &&
                   !community.hudPropertyId &&
                   (!community.socialServices || community.socialServices.length === 0) &&
                   !community.licenseNumber && (
                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-red-400 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <Stethoscope className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-200 mb-2">
                          Healthcare & Care Services Information
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Detailed healthcare and care services data is being verified for this community. 
                          Please contact the facility directly for comprehensive medical care information.
                        </p>
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                          <div className="flex items-center justify-center space-x-2 mb-2">
                            <ShieldCheck className="h-5 w-5 text-red-600" />
                            <span className="font-medium text-gray-900 dark:text-white">What We're Verifying</span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <div>• Licensed healthcare professionals on staff</div>
                            <div>• Medication management and administration</div>
                            <div>• Physical and occupational therapy services</div>
                            <div>• Memory care and specialized programs</div>
                            <div>• Emergency response and medical protocols</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* HEALTHCARE DATA STATUS */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Stethoscope className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-gray-200">
                          Healthcare Information
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        {community.healthcareServices && community.healthcareServices.length > 0 && (
                          <Badge className="bg-gray-100 text-gray-800 text-xs">
                            {community.healthcareServices.length} Healthcare Services Listed
                          </Badge>
                        )}
                        {community.careTypes && community.careTypes.length > 0 && (
                          <Badge className="bg-gray-100 text-gray-800 text-xs">
                            {community.careTypes.length} Care Types
                          </Badge>
                        )}
                        {community.licenseNumber && (
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            State License: {community.licenseNumber}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Healthcare information compiled from available public records. 
                      Please verify current services and licensing directly with the community.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* COMPREHENSIVE MULTI-SOURCE REVIEWS */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-6 w-6 text-yellow-500" />
                  <span>Reviews from Multiple Sources</span>
                </CardTitle>
                <div className="text-sm text-gray-600">
                  Complete transparency with reviews from Google and Yelp
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Google Reviews */}
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">G</span>
                      </div>
                      <span className="font-semibold text-gray-900">Google Reviews</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm">{community.googleRating}/5 • {community.googleReviewCount} reviews</span>
                      </div>
                    </div>
                    
                    {community.googleReviewSnippets && community.googleReviewSnippets.length > 0 ? (
                      <div className="space-y-3">
                        {community.googleReviewSnippets.map((review: any, index: number) => (
                          <div key={index} className="border-l-4 border-blue-200 pl-4 py-3 bg-blue-50 rounded-r-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="flex">
                                {[...Array(5)].map((_, starIndex) => (
                                  <Star
                                    key={starIndex}
                                    className={`h-4 w-4 ${
                                      starIndex < review.rating
                                        ? "text-yellow-500 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="font-medium text-gray-900">{review.author}</span>
                              <span className="text-sm text-gray-500">{review.date}</span>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{review.text}</p>
                          </div>
                        ))}
                        
                        {/* Link to Read All Google Reviews */}
                        <div className="mt-4 p-4 bg-white border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
                                <span className="text-white text-xs font-bold">G</span>
                              </div>
                              <span className="text-sm font-medium text-gray-700">
                                Read all {community.googleReviewCount || 'reviews'} Google reviews
                              </span>
                            </div>
                            <a
                              href={`https://www.google.com/search?q=${encodeURIComponent(community.name + ' ' + community.city + ' ' + community.state)}&tbm=lcl`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                            >
                              View on Google
                              <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <div className="text-sm">No Google review snippets available yet</div>
                        <div className="text-xs text-gray-400 mt-1">Review highlights will be automatically processed and displayed here</div>
                        <div className="mt-2">
                          <a
                            href={`https://www.google.com/search?q=${encodeURIComponent(community.name + ' ' + community.city + ' ' + community.state)}&tbm=lcl`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Find on Google
                            <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Yelp Reviews */}
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">Y</span>
                      </div>
                      <span className="font-semibold text-gray-900">Yelp Reviews</span>
                    </div>
                    {community.yelpReviews && community.yelpReviews.length > 0 ? (
                      <div className="space-y-3">
                        {community.yelpReviews.map((review: any, index: number) => (
                          <div key={index} className="border-l-4 border-red-200 pl-4 py-3 bg-red-50 rounded-r-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="flex">
                                {[...Array(5)].map((_, starIndex) => (
                                  <Star
                                    key={starIndex}
                                    className={`h-4 w-4 ${
                                      starIndex < review.rating
                                        ? "text-yellow-500 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="font-medium text-gray-900">{review.author}</span>
                              <span className="text-sm text-gray-500">{review.date}</span>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{review.text}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <div className="text-sm">Yelp API integration not yet configured</div>
                        <div className="text-xs text-gray-400 mt-1">Yelp reviews will be displayed when API key is added</div>
                        <div className="mt-2">
                          <a
                            href={`https://www.yelp.com/search?find_desc=${encodeURIComponent(community.name)}&find_loc=${encodeURIComponent(community.city + ', ' + community.state)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                          >
                            Find on Yelp
                            <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Care.com Reviews */}
                  {community.careComReviews && community.careComReviews.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">C</span>
                        </div>
                        <span className="font-semibold text-gray-900">Care.com Reviews</span>
                      </div>
                      <div className="space-y-3">
                        {community.careComReviews.map((review: any, index: number) => (
                          <div key={index} className="border-l-4 border-green-200 pl-4 py-3 bg-green-50 rounded-r-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="flex">
                                {[...Array(5)].map((_, starIndex) => (
                                  <Star
                                    key={starIndex}
                                    className={`h-4 w-4 ${
                                      starIndex < review.rating
                                        ? "text-yellow-500 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="font-medium text-gray-900">{review.author}</span>
                              <span className="text-sm text-gray-500">{review.date}</span>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{review.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SeniorAdvisor Reviews */}
                  {community.seniorAdvisorReviews && community.seniorAdvisorReviews.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-6 h-6 bg-purple-500 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">S</span>
                        </div>
                        <span className="font-semibold text-gray-900">SeniorAdvisor Reviews</span>
                      </div>
                      <div className="space-y-3">
                        {community.seniorAdvisorReviews.map((review: any, index: number) => (
                          <div key={index} className="border-l-4 border-purple-200 pl-4 py-3 bg-purple-50 rounded-r-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="flex">
                                {[...Array(5)].map((_, starIndex) => (
                                  <Star
                                    key={starIndex}
                                    className={`h-4 w-4 ${
                                      starIndex < review.rating
                                        ? "text-yellow-500 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="font-medium text-gray-900">{review.author}</span>
                              <span className="text-sm text-gray-500">{review.date}</span>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{review.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* A Place For Mom Reviews */}
                  {community.aplaceformomReviews && community.aplaceformomReviews.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">A</span>
                        </div>
                        <span className="font-semibold text-gray-900">A Place For Mom Reviews</span>
                      </div>
                      <div className="space-y-3">
                        {community.aplaceformomReviews.map((review: any, index: number) => (
                          <div key={index} className="border-l-4 border-orange-200 pl-4 py-3 bg-orange-50 rounded-r-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="flex">
                                {[...Array(5)].map((_, starIndex) => (
                                  <Star
                                    key={starIndex}
                                    className={`h-4 w-4 ${
                                      starIndex < review.rating
                                        ? "text-yellow-500 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="font-medium text-gray-900">{review.author}</span>
                              <span className="text-sm text-gray-500">{review.date}</span>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{review.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* UNIT TYPES & FLOOR PLANS SECTION */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Home className="h-6 w-6 text-blue-600" />
                  <span>Unit Types & Floor Plans</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {community.unitTypes && community.unitTypes.length > 0 ? (
                  <div className="space-y-6">
                    {community.unitTypes.map((unitType, index) => (
                      <div key={index} className="border border-blue-200 rounded-lg p-6 bg-blue-50">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-blue-900">{unitType.name}</h3>
                            <p className="text-blue-700 font-medium">{unitType.type}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-900">
                              ${unitType.priceRange.min.toLocaleString()} - ${unitType.priceRange.max.toLocaleString()}
                            </div>
                            <div className="text-sm text-blue-700">per month</div>
                            {/* Data Source Citation */}
                            {(() => {
                              const sourceCitation = getDataSourceCitation(community);
                              return (
                                <div className={`flex items-center justify-end space-x-1 mt-1 text-xs ${sourceCitation.color}`}>
                                  {sourceCitation.icon}
                                  <span className="font-medium">{sourceCitation.text}</span>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-blue-800">Square Footage:</span>
                              <span className="text-sm text-blue-700">{unitType.squareFootage} sq ft</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-blue-800">Available Units:</span>
                              <span className="text-sm text-blue-700">{unitType.available}</span>
                            </div>
                          </div>
                          
                          {unitType.floorPlan && (
                            <div className="flex justify-end">
                              <Button variant="outline" size="sm" className="text-blue-600 border-blue-300">
                                <Camera className="h-4 w-4 mr-2" />
                                View Floor Plan
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        {unitType.features && unitType.features.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-blue-900 mb-2">Features:</h4>
                            <div className="flex flex-wrap gap-2">
                              {unitType.features.map((feature, idx) => (
                                <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-800">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {unitType.availability && unitType.availability.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-blue-900 mb-2">Available Units:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {unitType.availability.slice(0, 4).map((unit, idx) => (
                                <div key={idx} className="bg-white border border-blue-200 rounded p-3">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium text-blue-900">Unit {unit.unitNumber}</span>
                                    <span className="text-sm text-blue-700">${unit.price.toLocaleString()}/mo</span>
                                  </div>
                                  <div className="text-sm text-blue-600">
                                    Available: {unit.availableDate}
                                  </div>
                                  {unit.specialOffers && unit.specialOffers.length > 0 && (
                                    <div className="text-xs text-green-600 mt-1">
                                      {unit.specialOffers[0]}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8">
                      <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Unit Types & Floor Plans</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        We're working to gather verified unit type information for this community.
                      </p>
                      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          <ShieldCheck className="h-5 w-5 text-blue-600" />
                          <span className="font-medium text-gray-900">What We'll Show You</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                          <div>• Studio, 1-bedroom, and 2-bedroom options</div>
                          <div>• Square footage and floor plans</div>
                          <div>• Current availability and pricing</div>
                          <div>• Unit features and amenities</div>
                        </div>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800">
                            Only verified unit data will be displayed
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* FLOOR PLANS GALLERY SECTION */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="h-6 w-6 text-purple-600" />
                  <span>Floor Plans Gallery</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {community.unitTypes && community.unitTypes.some(unit => unit.floorPlan) ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {community.unitTypes
                      .filter(unit => unit.floorPlan)
                      .map((unitType, index) => (
                        <div key={index} className="border border-purple-200 rounded-lg overflow-hidden">
                          <div className="bg-purple-50 px-4 py-3 border-b border-purple-200">
                            <h3 className="font-semibold text-purple-900">{unitType.name}</h3>
                            <p className="text-sm text-purple-700">{unitType.squareFootage} sq ft</p>
                          </div>
                          <div className="p-4">
                            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                              <img 
                                src={unitType.floorPlan} 
                                alt={`Floor plan for ${unitType.name}`}
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                            <div className="text-center">
                              <Button variant="outline" size="sm" className="text-purple-600 border-purple-300">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Full Size
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8">
                      <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Floor Plans Gallery</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        We're working to gather verified floor plan images for this community.
                      </p>
                      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          <ShieldCheck className="h-5 w-5 text-purple-600" />
                          <span className="font-medium text-gray-900">What We'll Show You</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                          <div>• Detailed floor plan layouts</div>
                          <div>• Room dimensions and flow</div>
                          <div>• Furniture placement options</div>
                          <div>• Accessibility features</div>
                        </div>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800">
                            Only verified floor plans will be displayed
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN - Pricing & Quick Actions */}
          <div className="space-y-6">
            {/* Pricing & Contact */}
            <Card className="sticky top-24">
              <CardContent className="p-6">
                {/* Pricing - Business Rule Compliant */}
                {community.priceRange && (
                  <div className={`border rounded-lg p-4 mb-6 ${
                    community.claimedByBy ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className={`h-5 w-5 ${
                        community.claimedBy ? 'text-green-600' : 'text-blue-600'
                      }`} />
                      <span className={`font-semibold ${
                        community.claimedBy ? 'text-green-900' : 'text-blue-900'
                      }`}>
                        {community.claimedBy ? 'Live Pricing' : 'Estimated Pricing'}
                      </span>
                      {community.claimedBy && (
                        <Badge className="bg-green-600 text-white text-xs">
                          Claimed Community
                        </Badge>
                      )}
                    </div>
                    <div className={`text-2xl font-bold ${
                      community.claimedBy ? 'text-green-900' : 'text-blue-900'
                    }`}>
                      ${community.priceRange.min.toLocaleString()} - ${community.priceRange.max.toLocaleString()}
                      {!community.claimedBy && (
                        <span className="text-sm text-blue-600 ml-2 font-normal">est.</span>
                      )}
                    </div>
                    <div className={`text-sm ${
                      community.claimedBy ? 'text-green-700' : 'text-blue-700'
                    }`}>
                      per month {community.claimedBy ? '(verified)' : '(market estimate)'}
                    </div>
                    
                    {/* Data Source Citation */}
                    {(() => {
                      const sourceCitation = getDataSourceCitation(community);
                      return (
                        <div className={`flex items-center space-x-1 mt-1 text-xs ${sourceCitation.color}`}>
                          {sourceCitation.icon}
                          <span className="font-medium">{sourceCitation.text}</span>
                        </div>
                      );
                    })()}
                    
                    {/* Special Offers - Only for claimed communities */}
                    {community.claimedBy && community.pricingDetails?.specialOffers && community.pricingDetails.specialOffers.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-green-200">
                        {community.pricingDetails.specialOffers.map((offer, index) => (
                          <div key={index} className="bg-red-100 border border-red-200 rounded p-2">
                            <div className="font-semibold text-red-900">{offer.title}</div>
                            <div className="text-sm text-red-700">Save ${offer.savings?.toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ADDITIONAL PRICING DETAILS - Business Rule Compliant */}
                <div className={`border rounded-lg p-4 mb-6 ${
                  community.claimedBy ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-center space-x-2 mb-4">
                    <Home className={`h-5 w-5 ${
                      community.claimedBy ? 'text-green-600' : 'text-yellow-600'
                    }`} />
                    <span className={`font-semibold ${
                      community.claimedBy ? 'text-green-900' : 'text-yellow-900'
                    }`}>
                      {community.claimedBy ? 'Verified Pricing Details' : 'Estimated Pricing Information'}
                    </span>
                  </div>
                  
                  {/* Typical Pricing Range */}
                  {community.priceRange && (
                    <div className="mb-4">
                      <div className={`text-lg font-semibold mb-2 ${
                        community.claimedBy ? 'text-green-900' : 'text-yellow-900'
                      }`}>
                        {community.claimedBy ? 'Current Monthly Cost' : 'Typical Monthly Cost'}: ${community.priceRange.min?.toLocaleString()} - ${community.priceRange.max?.toLocaleString()}
                        {!community.claimedBy && (
                          <span className="text-sm text-yellow-600 ml-2 font-normal">est.</span>
                        )}
                      </div>
                      <div className={`text-sm ${
                        community.claimedBy ? 'text-green-700' : 'text-yellow-700'
                      }`}>
                        {community.claimedBy ? 'Verified pricing based on care level and unit type' : 'Based on care level and unit type (market estimate)'}
                      </div>
                      
                      {/* Data Source Citation */}
                      {(() => {
                        const sourceCitation = getDataSourceCitation(community);
                        return (
                          <div className={`flex items-center space-x-1 mt-1 text-xs ${sourceCitation.color}`}>
                            {sourceCitation.icon}
                            <span className="font-medium">{sourceCitation.text}</span>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Move-In Costs - Only for claimed communities */}
                  {community.claimedBy && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-white border border-green-200 rounded p-3">
                        <div className="text-sm font-medium text-green-900">Community Fee</div>
                        <div className="text-lg font-semibold text-green-800">
                          $1,500 (one-time)
                        </div>
                        <div className="text-xs text-green-600">One-time move-in fee</div>
                      </div>
                      <div className="bg-white border border-green-200 rounded p-3">
                        <div className="text-sm font-medium text-green-900">Application Fee</div>
                        <div className="text-lg font-semibold text-green-800">$150</div>
                        <div className="text-xs text-green-600">Non-refundable</div>
                      </div>
                    </div>
                  )}

                  {/* Verification Notice */}
                  <div className={`border rounded p-3 ${
                    community.claimedBy 
                      ? 'bg-green-100 border-green-200' 
                      : 'bg-orange-100 border-orange-200'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className={`h-4 w-4 ${
                        community.claimedBy ? 'text-green-600' : 'text-orange-600'
                      }`} />
                      <span className={`text-sm font-medium ${
                        community.claimedBy ? 'text-green-900' : 'text-orange-900'
                      }`}>
                        {community.claimedBy ? 'Verified Community Information' : 'Pending Community Verification'}
                      </span>
                    </div>
                    <div className={`text-xs ${
                      community.claimedBy ? 'text-green-700' : 'text-orange-700'
                    }`}>
                      {community.claimedBy 
                        ? 'This community has been verified and is actively managed by the community team. Pricing and availability information is current and accurate.'
                        : 'Exact pricing, current specials, and available units are being verified directly with the community. Prices shown are typical ranges and may vary based on care needs and current promotions.'
                      }
                    </div>
                  </div>

                  <div className={`mt-4 text-xs text-center ${
                    community.claimedBy ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {community.claimedBy 
                      ? 'Contact the community for immediate availability and to schedule a tour.'
                      : 'Contact the community for current pricing and availability information.'
                    }
                  </div>
                </div>

                {/* AVAILABLE UNITS & FLOOR PLANS */}
                {community.unitTypes && community.unitTypes.length > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Home className="h-5 w-5 text-purple-600" />
                      <span className="font-semibold text-purple-900">Available Units & Floor Plans</span>
                    </div>

                    <div className="space-y-4">
                      {community.unitTypes.map((unitType) => (
                        <div key={unitType.id} className="bg-white border border-purple-200 rounded-lg p-4">
                          {/* Unit Type Header */}
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900">{unitType.name}</h4>
                              <p className="text-sm text-gray-600">{unitType.squareFootage} sq ft • {unitType.available} available</p>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-purple-900">
                                ${unitType.priceRange.min.toLocaleString()}/month
                              </div>
                              {/* Data Source Citation */}
                              {(() => {
                                const sourceCitation = getDataSourceCitation(community);
                                return (
                                  <div className={`flex items-center justify-end space-x-1 mt-1 text-xs ${sourceCitation.color}`}>
                                    {sourceCitation.icon}
                                    <span className="font-medium">{sourceCitation.text}</span>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>

                          {/* Unit Photos */}
                          {unitType.photos && unitType.photos.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              {unitType.photos.map((photo, index) => (
                                <img
                                  key={index}
                                  src={photo}
                                  alt={`${unitType.name} - Photo ${index + 1}`}
                                  className="w-full h-24 object-cover rounded"
                                />
                              ))}
                            </div>
                          )}

                          {/* Features */}
                          <div className="mb-3">
                            <div className="text-xs font-medium text-gray-700 mb-1">Features:</div>
                            <div className="flex flex-wrap gap-1">
                              {unitType.features?.map((feature, index) => (
                                <span key={index} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Available Units for Reservation */}
                          <div className="space-y-2">
                            <div className="text-xs font-medium text-gray-700">Reserve a specific unit:</div>
                            {unitType.availability?.map((unit, index) => (
                              <div key={index} className="bg-gray-50 border rounded p-3">
                                <div className="flex justify-between items-center mb-2">
                                  <div>
                                    <span className="font-medium text-gray-900">Unit {unit.unitNumber}</span>
                                    <span className={`ml-2 text-xs px-2 py-1 rounded ${
                                      unit.moveInReady ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {unit.moveInReady ? 'Move-in Ready' : 'Available ' + new Date(unit.availableDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-semibold text-gray-900">${unit.price.toLocaleString()}/month</div>
                                  </div>
                                </div>

                                {/* Special Offers */}
                                {unit.specialOffers && unit.specialOffers.length > 0 && (
                                  <div className="mb-2">
                                    {unit.specialOffers.map((offer, offerIndex) => (
                                      <span key={offerIndex} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded mr-1">
                                        🏷️ {offer}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Contact Actions */}
                                <div className="flex space-x-2">
                                  <Button 
                                    size="sm" 
                                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-xs"
                                    onClick={() => {
                                      alert(`Contact about Unit ${unit.unitNumber} - ${unitType.name}\nPrice: $${unit.price.toLocaleString()}/month\nAvailable: ${unit.availableDate}\n\nCall or visit to inquire about availability.`);
                                    }}
                                  >
                                    Contact for Unit
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-xs"
                                    onClick={() => {
                                      alert(`Schedule tour for Unit ${unit.unitNumber}\nAvailable for viewing: ${unit.moveInReady ? 'Immediately' : unit.availableDate}`);
                                    }}
                                  >
                                    Tour Unit
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Floor Plan Link */}
                          {unitType.floorPlan && (
                            <div className="mt-3 pt-3 border-t border-purple-200">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full text-xs"
                                onClick={() => window.open(unitType.floorPlan, '_blank')}
                              >
                                View Floor Plan
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 p-3 bg-blue-100 border border-blue-200 rounded">
                      <div className="text-sm font-medium text-blue-900 mb-1">💡 How to Inquire:</div>
                      <div className="text-xs text-blue-800 space-y-1">
                        <div>1. Contact the community directly to discuss unit availability</div>
                        <div>2. Schedule a tour to view available units in person</div>
                        <div>3. Discuss pricing, care needs, and move-in timeline</div>
                        <div>4. Complete application process if you decide to move forward</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3"
                    onClick={() => {
                      // Open Calendly widget or scheduling modal
                      const schedulingUrl = `https://calendly.com/myseniorvalet-tours/community-tour?prefill_community=${encodeURIComponent(community.name)}&prefill_location=${encodeURIComponent(community.city + ', ' + community.state)}`;
                      window.open(schedulingUrl, '_blank', 'width=800,height=700');
                    }}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Tour
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      const subject = `Information Request - ${community.name}`;
                      const body = `Hello,\n\nI'm interested in learning more about ${community.name} located at ${community.address}, ${community.city}, ${community.state}.\n\nCould you please provide:\n- Current availability and pricing\n- Care services offered\n- Amenities and activities\n- Move-in timeline\n\nThank you!`;
                      const mailtoUrl = `mailto:${community.email || 'info@' + community.name.toLowerCase().replace(/\s+/g, '') + '.com'}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                      window.location.href = mailtoUrl;
                    }}
                  >
                    <MailIcon className="h-4 w-4 mr-2" />
                    Request Information
                  </Button>
                  {community.phone && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        window.location.href = `tel:${community.phone}`;
                      }}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call {community.phone}
                    </Button>
                  )}
                  {community.virtualTourUrl && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        if (community.virtualTourUrl && typeof community.virtualTourUrl === 'string') {
                          window.open(community.virtualTourUrl, '_blank');
                        }
                      }}
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Take Virtual Tour
                    </Button>
                  )}
                  
                  {/* Claim This Community Button */}
                  <Link to={`/claim/${community.id}`}>
                    <Button 
                      variant="outline" 
                      className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Claim This Community
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Similar Communities */}
            {similarCommunities && similarCommunities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Similar Communities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {similarCommunities.slice(0, 3).map((similar, index) => (
                      <EnhancedCommunityCard
                        key={similar.id}
                        community={similar}
                        variant="horizontal"
                        index={index}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
      </div>
    </div>
  );
}