import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Phone, Globe, CheckCircle, Users, Calendar, DollarSign, Camera, Video, Home, UserCheck, Stethoscope, Activity, Wifi, Car, Utensils, ChevronLeft, ChevronRight, ExternalLink, Heart, Share, Clock, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import type { Community } from "@shared/schema";

export default function CommunityPage() {
  const [, params] = useRoute("/community/:id");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  
  const { data: community, isLoading } = useQuery<Community>({
    queryKey: ["/api/communities", params?.id],
  });

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

        {/* PHOTO GALLERY & VIRTUAL TOUR */}
        {community.photos && community.photos.length > 0 && (
          <div className="mb-8">
            <Card className="overflow-hidden">
              <div className="relative h-96">
                <img 
                  src={community.photos[selectedPhotoIndex]} 
                  alt={`${community.name} - Photo ${selectedPhotoIndex + 1}`}
                  className="w-full h-96 object-cover"
                />
                
                {/* Photo Navigation */}
                {community.photos.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/60 text-white hover:bg-black/80"
                      onClick={() => setSelectedPhotoIndex(prev => prev === 0 ? community.photos!.length - 1 : prev - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/60 text-white hover:bg-black/80"
                      onClick={() => setSelectedPhotoIndex(prev => prev === community.photos!.length - 1 ? 0 : prev + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}

                {/* Photo Counter & Virtual Tour */}
                <div className="absolute bottom-4 right-4 flex space-x-2">
                  <Badge className="bg-black/60 text-white">
                    <Camera className="h-3 w-3 mr-1" />
                    {selectedPhotoIndex + 1} of {community.photos.length}
                  </Badge>
                  {community.virtualTourUrl && (
                    <Badge className="bg-blue-600 text-white cursor-pointer hover:bg-blue-700">
                      <Video className="h-3 w-3 mr-1" />
                      Virtual Tour
                    </Badge>
                  )}
                </div>

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

              {/* Photo Thumbnails */}
              {community.photos.length > 1 && (
                <div className="p-4 bg-gray-50">
                  <div className="flex space-x-2 overflow-x-auto">
                    {community.photos.map((photo, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedPhotoIndex(index)}
                        className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 ${
                          selectedPhotoIndex === index ? 'border-blue-500' : 'border-gray-200'
                        }`}
                      >
                        <img 
                          src={photo} 
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

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
                         className="text-sm text-blue-600 hover:underline">
                        Visit Website
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
                  {community.careTypes.map((type) => (
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

            {/* Reviews */}
            {community.googleReviewSnippets && community.googleReviewSnippets.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-6 w-6 text-yellow-500" />
                    <span>What Families Say</span>
                    {community.googleRating && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        {parseFloat(community.googleRating).toFixed(1)} ★ ({community.googleReviewCount} reviews)
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {community.googleReviewSnippets.map((review, index) => (
                      <div key={index} className="border-l-4 border-yellow-400 pl-4 py-2">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{review.author}</span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">{review.text}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
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

                {/* Quick Actions */}
                <div className="space-y-3">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3">
                    Schedule Tour
                  </Button>
                  <Button variant="outline" className="w-full">
                    Request Information
                  </Button>
                  {community.phone && (
                    <Button variant="outline" className="w-full">
                      <Phone className="h-4 w-4 mr-2" />
                      Call Now
                    </Button>
                  )}
                  {community.virtualTourUrl && (
                    <Button variant="outline" className="w-full">
                      <Video className="h-4 w-4 mr-2" />
                      Take Virtual Tour
                    </Button>
                  )}
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