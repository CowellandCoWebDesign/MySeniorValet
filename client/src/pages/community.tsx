import { useParams } from "wouter";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Star, 
  Users, 
  Heart, 
  Camera, 
  ExternalLink,
  Shield,
  Clock,
  DollarSign,
  CheckCircle,
  Share,
  Calendar,
  Home,
  Wifi,
  Car,
  Utensils,
  Activity,
  Video,
  UserCheck,
  Stethoscope,
  Bed,
  ShowerHead,
  AlertTriangle
} from "lucide-react";
import { Link } from "wouter";
import { PhotoCarousel } from "@/components/photo-carousel";
import type { Community } from "@shared/schema";

export default function CommunityPage() {
  const { id } = useParams<{ id: string }>();
  const [isFavorited, setIsFavorited] = useState(false);
  
  const { data: community, isLoading, error } = useQuery<Community>({
    queryKey: [`/api/communities/${id}`],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading community details...</p>
        </div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Community Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find the community you're looking for.</p>
          <Link href="/search">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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

  // Calculate overall rating from available sources
  const calculateOverallRating = () => {
    const ratings = [];
    if (community.googleRating) ratings.push(community.googleRating);
    if (community.yelpRating) ratings.push(community.yelpRating);
    
    if (ratings.length === 0) return null;
    
    const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    return Math.round(average * 10) / 10;
  };

  const overallRating = calculateOverallRating();

  // Format pricing information
  const formatPricing = () => {
    if (!community.pricing) return null;
    
    // Handle different pricing format types
    if (typeof community.pricing === 'string') {
      return community.pricing;
    }
    
    // If it's an object with min/max values
    if (typeof community.pricing === 'object' && community.pricing !== null) {
      const pricing = community.pricing as any;
      if (pricing.min && pricing.max) {
        return `$${pricing.min.toLocaleString()} - $${pricing.max.toLocaleString()}/month`;
      }
      if (pricing.startingAt) {
        return `Starting at $${pricing.startingAt.toLocaleString()}/month`;
      }
    }
    
    return null;
  };

  const pricingInfo = formatPricing();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/search">
              <Button variant="ghost" className="text-gray-600 hover:text-blue-600">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Search
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Button 
                size="sm" 
                variant="outline" 
                className={`border-pink-200 ${isFavorited ? 'text-pink-600 bg-pink-50' : 'text-gray-600'}`}
                onClick={() => setIsFavorited(!isFavorited)}
              >
                <Heart className={`h-4 w-4 mr-1 ${isFavorited ? 'fill-current' : ''}`} />
                {isFavorited ? 'Saved' : 'Save'}
              </Button>
              <Button size="sm" variant="outline" className="text-gray-600">
                <Share className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Community Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-2xl text-gray-900">
                        {community.name}
                      </CardTitle>
                      {community.verified && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <Shield className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-gray-600 flex items-center mb-4">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                      {community.address}, {community.city}, {community.state} {community.zipCode}
                    </CardDescription>
                    
                    {/* Care Types */}
                    <div className="flex flex-wrap gap-2">
                      {community.careTypes?.map((type, index) => (
                        <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Rating */}
                  {overallRating && (
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-yellow-500 mb-1">
                        <Star className="h-5 w-5 fill-current" />
                        <span className="text-lg font-semibold text-gray-900">{overallRating}</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {community.googleReviewCount || community.yelpReviewCount 
                          ? `${(community.googleReviewCount || 0) + (community.yelpReviewCount || 0)} reviews`
                          : 'No reviews'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Photo Gallery */}
            {hasPhotos && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Photos ({allPhotos.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PhotoCarousel photos={allPhotos} />
                </CardContent>
              </Card>
            )}

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                {/* Description */}
                {community.description && (
                  <Card>
                    <CardHeader>
                      <CardTitle>About {community.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">{community.description}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Quick Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {community.hasAvailability && (
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium text-green-900">Availability</p>
                            <p className="text-sm text-green-700">Currently accepting residents</p>
                          </div>
                        </div>
                      )}
                      
                      {pricingInfo && (
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                          <DollarSign className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-blue-900">Pricing</p>
                            <p className="text-sm text-blue-700">{pricingInfo}</p>
                          </div>
                        </div>
                      )}
                      
                      {community.lastUpdated && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Clock className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="font-medium text-gray-900">Last Updated</p>
                            <p className="text-sm text-gray-700">
                              {new Date(community.lastUpdated).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="amenities">
                <Card>
                  <CardHeader>
                    <CardTitle>Amenities & Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {community.amenities && community.amenities.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {community.amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <span className="text-gray-900">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Home className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Amenity information will be added soon</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="services">
                <Card>
                  <CardHeader>
                    <CardTitle>Care Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {community.careServices && community.careServices.length > 0 ? (
                      <div className="space-y-4">
                        {community.careServices.map((service, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                            <UserCheck className="h-4 w-4 text-blue-600 flex-shrink-0" />
                            <span className="text-gray-900">{service}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Stethoscope className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Care services information will be added soon</p>
                      </div>
                    )}

                    {/* Medical Restrictions */}
                    {community.medicalRestrictions && community.medicalRestrictions.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Medical Restrictions</h4>
                        <div className="space-y-2">
                          {community.medicalRestrictions.map((restriction, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                              <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                              <span className="text-gray-900">{restriction}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <CardTitle>Reviews & Ratings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Review Sources */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {community.googleRating && (
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">Google Reviews</h4>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold">{community.googleRating}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {community.googleReviewCount} reviews
                          </p>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full"
                            onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(community.name + ' ' + community.city + ' reviews')}`, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View on Google
                          </Button>
                        </div>
                      )}
                      
                      {community.yelpRating && (
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">Yelp Reviews</h4>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold">{community.yelpRating}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {community.yelpReviewCount} reviews
                          </p>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full"
                            onClick={() => window.open(`https://www.yelp.com/search?find_desc=${encodeURIComponent(community.name)}&find_loc=${encodeURIComponent(community.city + ', ' + community.state)}`, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View on Yelp
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {!community.googleRating && !community.yelpRating && (
                      <div className="text-center py-8 text-gray-500">
                        <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Review information will be added soon</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Contact & Quick Actions */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {community.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Phone</p>
                      <a 
                        href={`tel:${community.phone}`} 
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {community.phone}
                      </a>
                    </div>
                  </div>
                )}
                
                {community.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <a 
                        href={`mailto:${community.email}`} 
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {community.email}
                      </a>
                    </div>
                  </div>
                )}
                
                {community.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900">Website</p>
                      <a 
                        href={community.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        Visit Website
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}
                
                <Separator />
                
                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Tour
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Request Information
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Camera className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                    <p className="text-2xl font-bold text-blue-900">{allPhotos.length}</p>
                    <p className="text-sm text-blue-700">Photos</p>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg">
                    <Star className="h-6 w-6 mx-auto mb-2 text-green-600" />
                    <p className="text-2xl font-bold text-green-900">
                      {overallRating || 'N/A'}
                    </p>
                    <p className="text-sm text-green-700">Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Community Owner Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-gray-600">Community Owner?</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/claim/${community.id}`}>
                  <Button variant="outline" className="w-full text-sm">
                    <Shield className="h-4 w-4 mr-2" />
                    Claim This Listing
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}