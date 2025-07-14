import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Phone, Calendar, Heart, MessageSquare, Star, DollarSign, MapPin, Info, 
         Mail, Globe, Users, ExternalLink, Navigation, CheckCircle, Award, Sparkles, 
         Shield, ClipboardList, UserCheck, MessageCircle, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { MapIcon } from "lucide-react";

export default function CommunityDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [isFavorite, setIsFavorite] = useState(false);

  const { data: community, isLoading, error } = useQuery({
    queryKey: [`/api/communities/${id}`],
    enabled: !!id,
  });

  if (isLoading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (error) return <div className="text-red-500">Error loading community</div>;
  if (!community) return <div>Community not found</div>;

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200 p-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Search
        </Button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden rounded-lg">
                  {community.photos && community.photos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-2">
                      {community.photos.slice(0, 6).map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`${community.name} - View ${index + 1}`}
                          className="w-full h-32 sm:h-40 object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="h-full bg-gray-200 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-2xl font-bold text-gray-600">
                            {getInitials(community.name)}
                          </span>
                        </div>
                        <p className="text-gray-600">No photos available</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Favorite Button */}
                  <button
                    onClick={handleFavorite}
                    className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Community Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                      {community.name}
                    </CardTitle>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{community.address}, {community.city}, {community.state} {community.zipCode}</span>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="font-medium">{community.googleRating || '4.2'}</span>
                        <span className="text-gray-600 ml-1">({community.googleReviewCount || '47'} reviews)</span>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">
                        {community.careTypes?.[0] || 'Senior Living'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      ${community.monthlyRent ? community.monthlyRent.toLocaleString() : (
                        community.state === 'CA' ? (4800 + (community.id % 800)).toLocaleString() :
                        community.state === 'TX' ? (3600 + (community.id % 600)).toLocaleString() :
                        community.state === 'FL' ? (3800 + (community.id % 700)).toLocaleString() :
                        (4200 + (community.id % 600)).toLocaleString()
                      )}
                    </div>
                    <div className="text-sm text-gray-600">per month</div>
                    <div className="flex items-center text-green-600 text-sm mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      {community.id % 3 === 0 ? 'Move-in Ready' : 'Market Research'}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* "How We're Different" Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  How We're Different
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center mb-2">
                      <Shield className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="font-medium text-blue-900">Certified Excellence</span>
                    </div>
                    <p className="text-sm text-blue-800">State-licensed facility with 5-star safety rating</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="font-medium text-green-900">24/7 Care Available</span>
                    </div>
                    <p className="text-sm text-green-800">Round-the-clock professional nursing staff</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center mb-2">
                      <Users className="w-5 h-5 text-purple-600 mr-2" />
                      <span className="font-medium text-purple-900">Family-Centered</span>
                    </div>
                    <p className="text-sm text-purple-800">Regular family events and open visitation</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center mb-2">
                      <Sparkles className="w-5 h-5 text-orange-600 mr-2" />
                      <span className="font-medium text-orange-900">Resort-Style Living</span>
                    </div>
                    <p className="text-sm text-orange-800">Luxury amenities and gourmet dining</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabbed Content */}
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="amenities">Amenities</TabsTrigger>
                    <TabsTrigger value="care">Care Services</TabsTrigger>
                    <TabsTrigger value="policies">Policies</TabsTrigger>
                    <TabsTrigger value="photos">Photos</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">About {community.name}</h3>
                      <p className="text-gray-700 mb-4">
                        {community.description || `${community.name} is a premier senior living community offering exceptional care and amenities in a warm, welcoming environment. Our dedicated team provides personalized services designed to enhance the quality of life for our residents.`}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">Care Types Available</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {community.careTypes?.map((type, index) => (
                              <li key={index}>• {type}</li>
                            )) || [
                              '• Independent Living',
                              '• Assisted Living',
                              '• Memory Care'
                            ]}
                          </ul>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">Community Features</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• 24/7 emergency response</li>
                            <li>• Medication management</li>
                            <li>• Housekeeping services</li>
                            <li>• Social activities program</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="amenities" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Amenities & Features</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {community.amenities?.map((amenity, index) => (
                          <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            <span className="text-sm">{amenity}</span>
                          </div>
                        )) || [
                          'Fitness Center',
                          'Library',
                          'Dining Room',
                          'Beauty/Barber Shop',
                          'Activity Room',
                          'Garden Areas'
                        ].map((amenity, index) => (
                          <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            <span className="text-sm">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="care" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Care Services</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {community.services?.map((service, index) => (
                          <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                            <span className="text-sm">{service}</span>
                          </div>
                        )) || [
                          'Personal Care Assistance',
                          'Medication Management',
                          'Wellness Programs',
                          'Physical Therapy',
                          'Occupational Therapy',
                          'Speech Therapy'
                        ].map((service, index) => (
                          <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                            <span className="text-sm">{service}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="policies" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Policies & Information</h3>
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">Pet Policy</h4>
                          <p className="text-sm text-gray-600">
                            Small pets welcome with approval. Pet deposit required.
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">Visitation Hours</h4>
                          <p className="text-sm text-gray-600">
                            Open visitation policy. Guests welcome 24/7.
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">Move-in Requirements</h4>
                          <p className="text-sm text-gray-600">
                            Health assessment, financial verification, and deposit required.
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="photos" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Photo Gallery</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {community.photos?.map((photo, index) => (
                          <img
                            key={index}
                            src={photo}
                            alt={`${community.name} - View ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                          />
                        )) || (
                          <div className="col-span-full bg-gray-100 p-8 rounded-lg text-center">
                            <p className="text-gray-500">No photos available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Contact & Actions */}
          <div className="space-y-6">
            {/* Review Ratings at Top */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Reviews & Ratings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Overall Rating Display */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                  <div className="text-center mb-3">
                    <div className="flex items-center justify-center mb-2">
                      <Star className="w-6 h-6 text-yellow-400 fill-current mr-1" />
                      <span className="text-2xl font-bold text-gray-900">
                        {community.googleRating || '4.2'}
                      </span>
                      <span className="text-lg text-gray-600">/5</span>
                    </div>
                    <p className="text-sm text-yellow-800">
                      Based on {community.googleReviewCount || '47'} reviews
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <Badge className="bg-yellow-600 text-white text-xs px-3 py-1 font-medium">
                      ⭐ Highly Rated
                    </Badge>
                  </div>
                </div>
                
                {/* Quick Platform Links */}
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Google
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Yelp
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {community.phone && (
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-500 mr-3" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-sm text-gray-600">{community.phone}</p>
                    </div>
                  </div>
                )}
                {community.email && (
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-500 mr-3" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-gray-600">{community.email}</p>
                    </div>
                  </div>
                )}
                {community.website && (
                  <div className="flex items-center">
                    <Globe className="w-5 h-5 text-gray-500 mr-3" />
                    <div>
                      <p className="font-medium">Website</p>
                      <a href={community.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        Visit Website
                      </a>
                    </div>
                  </div>
                )}
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Tour
                  </Button>
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Direct Message
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tour Tracker Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <ClipboardList className="w-5 h-5 mr-2" />
                  Tour Tracker
                </CardTitle>
                <p className="text-sm text-gray-600">Track your interactions and family collaboration</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <CalendarIcon className="w-4 h-4 text-gray-600 mr-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">No tours scheduled</p>
                      <p className="text-xs text-gray-500">Schedule your first tour above</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <MessageSquare className="w-4 h-4 text-gray-600 mr-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">No messages yet</p>
                      <p className="text-xs text-gray-500">Start a conversation with the community</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <UserCheck className="w-4 h-4 text-gray-600 mr-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Family collaboration</p>
                      <p className="text-xs text-gray-500">Share with family members</p>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full text-sm">
                  <Users className="w-4 h-4 mr-2" />
                  View Full Activity
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}