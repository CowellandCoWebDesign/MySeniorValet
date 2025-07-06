import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Phone, Mail, Globe, MapPin, Star, Users, Heart, Camera, ExternalLink } from "lucide-react";
import { Link } from "wouter";

interface Community {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  description: string | null;
  careTypes: string[];
  amenities: string[];
  services: string[];
  unitTypes: string[];
  photos: string[];
  googlePhotos: string[];
  googleRating: number | null;
  googleReviewCount: number | null;
  yelpRating: number | null;
  yelpReviewCount: number | null;
  hasAvailability: boolean;
  lastUpdated: string;
  verified: boolean;
  latitude: number | null;
  longitude: number | null;
}

export default function CommunityPage() {
  const { id } = useParams<{ id: string }>();
  
  console.log('Community Page - ID:', id); // Debug log
  
  const { data: community, isLoading, error } = useQuery<Community>({
    queryKey: [`/api/communities/${id}`],
    enabled: !!id,
  });
  
  console.log('Community Page - Loading:', isLoading, 'Error:', error, 'Data:', community);

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
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getAllPhotos = () => {
    const allPhotos = [];
    if (community.photos) allPhotos.push(...community.photos);
    if (community.googlePhotos) allPhotos.push(...community.googlePhotos);
    return allPhotos;
  };

  const allPhotos = getAllPhotos();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" className="text-gray-600 hover:text-blue-600">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Search
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" className="text-pink-600 border-pink-200">
                <Heart className="h-4 w-4 mr-1" />
                Save
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
                  <div>
                    <CardTitle className="text-2xl text-gray-900 mb-2">
                      {community.name}
                    </CardTitle>
                    <CardDescription className="text-gray-600 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {community.address}, {community.city}, {community.state} {community.zipCode}
                    </CardDescription>
                  </div>
                  {community.verified && (
                    <Badge className="bg-green-100 text-green-800">
                      Verified
                    </Badge>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Photos */}
            {allPhotos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Camera className="h-5 w-5 mr-2" />
                    Photos ({allPhotos.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allPhotos.slice(0, 6).map((photo, index) => (
                      <div key={index} className="aspect-video rounded-lg overflow-hidden">
                        <img 
                          src={photo} 
                          alt={`${community.name} photo ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                  {allPhotos.length > 6 && (
                    <p className="text-sm text-gray-500 mt-2">
                      + {allPhotos.length - 6} more photos
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Description */}
            {community.description && (
              <Card>
                <CardHeader>
                  <CardTitle>About {community.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {community.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Care Types */}
            {community.careTypes && community.careTypes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Care Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {community.careTypes.map((type, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Amenities */}
            {community.amenities && community.amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {community.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center text-gray-700">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        {amenity}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Services */}
            {community.services && community.services.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {community.services.map((service, index) => (
                      <div key={index} className="flex items-center text-gray-700">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        {service}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Contact & Reviews */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {community.phone && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-700">
                      <Phone className="h-4 w-4 mr-2 text-blue-600" />
                      {community.phone}
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => window.open(`tel:${community.phone}`, '_self')}
                    >
                      Call
                    </Button>
                  </div>
                )}
                {community.email && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-700">
                      <Mail className="h-4 w-4 mr-2 text-blue-600" />
                      {community.email}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(`mailto:${community.email}`, '_self')}
                    >
                      Email
                    </Button>
                  </div>
                )}
                {community.website && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-700">
                      <Globe className="h-4 w-4 mr-2 text-blue-600" />
                      Website
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(community.website!, '_blank')}
                    >
                      Visit
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ratings & Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Ratings & Reviews</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {community.googleRating && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-500 fill-current" />
                      <span className="font-semibold">
                        {community.googleRating ? parseFloat(community.googleRating.toString()).toFixed(1) : 'N/A'}
                      </span>
                      <span className="text-gray-500 ml-1">
                        ({community.googleReviewCount || 0} reviews)
                      </span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(community.name + ' ' + community.address)}`, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Google
                    </Button>
                  </div>
                )}
                {community.yelpRating && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-500 fill-current" />
                      <span className="font-semibold">
                        {community.yelpRating ? parseFloat(community.yelpRating.toString()).toFixed(1) : 'N/A'}
                      </span>
                      <span className="text-gray-500 ml-1">
                        ({community.yelpReviewCount || 0} reviews)
                      </span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(`https://www.yelp.com/search?find_desc=${encodeURIComponent(community.name)}&find_loc=${encodeURIComponent(community.city + ', ' + community.state)}`, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Yelp
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Availability */}
            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  {community.hasAvailability ? (
                    <div className="text-green-600 font-semibold">
                      Units Available
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      Call for Availability
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    Last updated: {new Date(community.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}