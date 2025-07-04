import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Phone, Globe, CheckCircle, Users, Calendar, DollarSign, Camera, Video, Home, UserCheck, Stethoscope, Activity, Wifi, Car, Utensils, ChevronLeft, ChevronRight, ExternalLink, Heart, Share, Clock, AlertTriangle, Heart as HeartIcon, Dumbbell, UtensilsCrossed, Bus, HandHeart, Waves, Scissors, AlertCircle, ShieldCheck, Mail as MailIcon } from "lucide-react";
import { Link } from "wouter";
import type { Community } from "@shared/schema";
import { FlagListingDialog } from "@/components/flag-listing-dialog";
import { PhotoCarousel } from "@/components/photo-carousel";

export default function CommunityPage() {
  const [, params] = useRoute("/community/:id");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  
  const { data: community, isLoading } = useQuery<Community>({
    queryKey: [`/api/communities/${params?.id}`],
  });

  // Scroll to top when community data loads
  useEffect(() => {
    if (community) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
            <Link href="/search">
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
              <p className="text-gray-600">Loading community details...</p>
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
            <p className="text-gray-600 mb-6">The community you're looking for doesn't exist or has been removed.</p>
            <Link href="/search">
              <Button>Back to Search</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link href="/search">
            <Button variant="outline" className="mb-4">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
          </Link>
        </div>

        {/* ENHANCED PHOTO GALLERY */}
        <div className="mb-8">
          <Card className="overflow-hidden">
            {hasPhotos ? (
              <div className="relative">
                <PhotoCarousel 
                  photos={allPhotos} 
                  communityName={community.name}
                  className="h-96"
                />
                
                {/* Virtual Tour Badge */}
                {community.virtualTourUrl && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-blue-600 text-white cursor-pointer hover:bg-blue-700">
                      <Video className="h-3 w-3 mr-1" />
                      Virtual Tour Available
                    </Badge>
                  </div>
                )}

                {/* Availability Overlay */}
                <div className={`absolute bottom-0 left-0 right-0 ${availability.color} px-6 py-4`}>
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
                <div className="text-center text-gray-500">
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
                    <div className="flex items-center text-gray-600 mb-4">
                      <MapPin className="h-5 w-5 mr-2" />
                      {community.address}, {community.city}, {community.state} {community.zipCode}
                    </div>
                    {community.description && (
                      <p className="text-gray-700 leading-relaxed">{community.description}</p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share className="h-4 w-4" />
                    </Button>
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
                      <span className="text-sm">{community.phone}</span>
                    </div>
                  )}
                  {community.website && (
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-blue-600" />
                      <a href={`https://${community.website}`} target="_blank" rel="noopener noreferrer" 
                         className="text-sm text-blue-600 hover:underline font-semibold">
                        Visit Official Website
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

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-6 w-6 text-blue-600" />
                  <span>Amenities & Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {community.amenities?.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2 bg-blue-50 rounded-lg p-3">
                      <span className="text-blue-600">{getAmenityIcon(amenity)}</span>
                      <span className="text-sm font-medium text-blue-900">{amenity}</span>
                    </div>
                  ))}
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
                  Complete transparency with reviews from Google, Yelp, Care.com, SeniorAdvisor, and A Place For Mom
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
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <div className="text-sm">No Google review snippets available yet</div>
                        <div className="text-xs text-gray-400 mt-1">Review highlights will be automatically processed and displayed here</div>
                      </div>
                    )}
                  </div>

                  {/* Yelp Reviews */}
                  {community.yelpReviews && community.yelpReviews.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">Y</span>
                        </div>
                        <span className="font-semibold text-gray-900">Yelp Reviews</span>
                      </div>
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
                    </div>
                  )}

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
          </div>

          {/* RIGHT COLUMN - Pricing & Quick Actions */}
          <div className="space-y-6">
            {/* Pricing & Contact */}
            <Card className="sticky top-24">
              <CardContent className="p-6">
                {/* Pricing */}
                {community.priceRange && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-900">Monthly Cost</span>
                    </div>
                    <div className="text-2xl font-bold text-green-900">
                      ${community.priceRange.min.toLocaleString()} - ${community.priceRange.max.toLocaleString()}
                    </div>
                    <div className="text-sm text-green-700">per month</div>
                    
                    {/* Special Offers */}
                    {community.pricingDetails?.specialOffers && community.pricingDetails.specialOffers.length > 0 && (
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

                {/* PRICING INFORMATION */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Home className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">Pricing Information</span>
                  </div>
                  
                  {/* Typical Pricing Range */}
                  {community.priceRange && (
                    <div className="mb-4">
                      <div className="text-lg font-semibold text-blue-900 mb-2">
                        Typical Monthly Cost: ${community.priceRange.min?.toLocaleString()} - ${community.priceRange.max?.toLocaleString()}
                      </div>
                      <div className="text-sm text-blue-700">Based on care level and unit type</div>
                    </div>
                  )}

                  {/* Move-In Costs */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white border border-blue-200 rounded p-3">
                      <div className="text-sm font-medium text-blue-900">Community Fee</div>
                      <div className="text-lg font-semibold text-blue-800">
                        $1,500 (one-time)
                      </div>
                      <div className="text-xs text-blue-600">One-time move-in fee</div>
                    </div>
                    <div className="bg-white border border-blue-200 rounded p-3">
                      <div className="text-sm font-medium text-blue-900">Application Fee</div>
                      <div className="text-lg font-semibold text-blue-800">$150</div>
                      <div className="text-xs text-blue-600">Non-refundable</div>
                    </div>
                  </div>

                  {/* Verification Notice */}
                  <div className="bg-orange-100 border border-orange-200 rounded p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-900">Pending Community Verification</span>
                    </div>
                    <div className="text-xs text-orange-700">
                      Exact pricing, current specials, and available units are being verified directly with the community. 
                      Prices shown are typical ranges and may vary based on care needs and current promotions.
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-blue-600 text-center">
                    Contact the community for current pricing and availability information.
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
                      const schedulingUrl = `https://calendly.com/trueview-tours/community-tour?prefill_community=${encodeURIComponent(community.name)}&prefill_location=${encodeURIComponent(community.city + ', ' + community.state)}`;
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
                    {similarCommunities.slice(0, 3).map((similar) => (
                      <Link key={similar.id} href={`/community/${similar.id}`}>
                        <div className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                          <div className="font-medium text-gray-900">{similar.name}</div>
                          <div className="text-sm text-gray-600">{similar.city}, {similar.state}</div>
                          {similar.priceRange && (
                            <div className="text-sm text-green-600 font-medium">
                              ${similar.priceRange.min.toLocaleString()} - ${similar.priceRange.max.toLocaleString()}/month
                            </div>
                          )}
                          {similar.googleRating && (
                            <div className="flex items-center space-x-1 mt-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span className="text-xs text-gray-600">{parseFloat(similar.googleRating).toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </Link>
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
  );
}