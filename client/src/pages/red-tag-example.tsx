import React, { useState } from 'react';
import { useParams, Link } from 'wouter';
import { ArrowLeft, Tag, Star, MapPin, Phone, Globe, Calendar, Home, Building, 
         Clock, AlertCircle, ExternalLink, Sparkles, Users, Heart, Shield,
         TrendingUp, Award, CheckCircle, Settings, MessageSquare, Mail,
         ChevronLeft, ChevronRight, Info, Navigation, UserCheck, Gem, Crown,
         Activity, UtensilsCrossed, Car, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavigationHeader } from "@/components/NavigationHeader";

// Mock data for red tag examples (same as before)
const redTagExamples = {
  "sunrise-senior-living": {
    id: 1,
    name: "Sunrise Senior Living",
    address: "123 Sunset Boulevard, Beverly Hills, CA 90210",
    phone: "(555) 123-4567",
    website: "https://sunriseseniorliving.com",
    rating: 4.8,
    reviewCount: 156,
    actualCommunityId: 264,
    photos: [
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1571508601b60-5c8d0869d40a?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&h=600&fit=crop"
    ],
    redTagSpecial: {
      title: "First Month FREE + $500 Move-in Credit",
      description: "Limited time offer for new residents. Save over $3,000 on your first year!",
      originalPrice: 4200,
      specialPrice: 3700,
      validUntil: "December 31, 2025",
      unitsAvailable: 3,
      unitTypes: ["Studio", "1-Bedroom"]
    },
    description: "Luxury senior living with concierge services, gourmet dining, and wellness programs. Our beautiful community offers independence with peace of mind.",
    careTypes: ["Independent Living", "Assisted Living"],
    amenities: ["Fitness Center", "Dining Room", "Library", "Garden", "Transportation"],
    services: ["Concierge", "Housekeeping", "Wellness Programs", "Activities"]
  },
  "heritage-hills": {
    id: 2,
    name: "Heritage Hills Senior Community",
    address: "456 Oak Tree Lane, Austin, TX 78704",
    phone: "(555) 987-6543",
    website: "https://heritagehillsaustin.com",
    rating: 4.6,
    reviewCount: 89,
    actualCommunityId: 265,
    photos: [
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop"
    ],
    redTagSpecial: {
      title: "No Deposit + 2 Months FREE Rent",
      description: "Move in today with no security deposit required. Limited availability!",
      originalPrice: 3800,
      specialPrice: 3200,
      validUntil: "January 15, 2026",
      unitsAvailable: 2,
      unitTypes: ["1-Bedroom", "2-Bedroom"]
    },
    description: "Comfortable senior living in the heart of Austin with easy access to local attractions and medical facilities.",
    careTypes: ["Independent Living"],
    amenities: ["Pool", "Community Room", "Kitchen", "Parking"],
    services: ["Maintenance", "Social Activities", "Transportation"]
  },
  "golden-years": {
    id: 3,
    name: "Golden Years Assisted Living",
    address: "789 Maple Street, Portland, OR 97205",
    phone: "(555) 456-7890",
    website: "https://goldenyearsportland.com",
    rating: 4.7,
    reviewCount: 134,
    actualCommunityId: 266,
    photos: [
      "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1571508601108-4d53efdfeb6b?w=800&h=600&fit=crop"
    ],
    redTagSpecial: {
      title: "$1,000 Off First 3 Months + Free Care Assessment",
      description: "Professional care assessment included. Start your journey with personalized support.",
      originalPrice: 4500,
      specialPrice: 4100,
      validUntil: "February 28, 2026",
      unitsAvailable: 1,
      unitTypes: ["Studio", "1-Bedroom"]
    },
    description: "Specialized assisted living with 24/7 care, medication management, and therapeutic programs.",
    careTypes: ["Assisted Living", "Memory Care"],
    amenities: ["Nursing Station", "Therapy Room", "Secure Garden", "Dining Room"],
    services: ["24/7 Care", "Medication Management", "Physical Therapy", "Social Work"]
  }
};

// Hero Photo Carousel Component (same as authentic page)
const HeroPhotoCarousel = ({ photos, communityName }: { photos: string[], communityName: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextPhoto();
    }
    if (isRightSwipe) {
      prevPhoto();
    }
  };

  return (
    <div className="relative">
      <div 
        className="w-full h-80 lg:h-96 relative overflow-hidden rounded-xl shadow-lg"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={photos[currentIndex]}
          alt={`${communityName} - Photo ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
        
        {/* Navigation arrows */}
        {photos.length > 1 && (
          <>
            <button
              onClick={prevPhoto}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Photo indicators */}
        {photos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Red Tag Badge Overlay */}
        <div className="absolute top-4 left-4">
          <Badge className="bg-red-600 text-white text-sm font-semibold px-3 py-1">
            <Tag className="w-4 h-4 mr-1" />
            RED TAG SPECIAL
          </Badge>
        </div>

        {/* Photo count */}
        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {photos.length}
        </div>
      </div>
    </div>
  );
};

export default function RedTagExamplePage() {
  const [, params] = useRoute('/red-tag-example/:slug');
  const [showAuthenticDisclaimer, setShowAuthenticDisclaimer] = useState(true);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");

  const slug = params?.slug || 'sunrise-senior-living';
  const community = redTagExamples[slug as keyof typeof redTagExamples];

  if (!community) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Red Tag Example Not Found
          </h1>
          <Link href="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Header */}
      <NavigationHeader />

      {/* Red Tag Disclaimer Banner */}
      {showAuthenticDisclaimer && (
        <div className="bg-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div className="text-sm">
                  <strong>Red Tag Deal Demonstration:</strong> This page shows example pricing and availability features. 
                  Our community data is 100% authentic - only the deal pricing is demonstration.
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link href={`/community/${community.actualCommunityId}`}>
                  <Button variant="outline" size="sm" className="text-blue-600 bg-white hover:bg-gray-100">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Authentic Listing
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-blue-700"
                  onClick={() => setShowAuthenticDisclaimer(false)}
                >
                  ×
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Community Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Photo Gallery */}
            <HeroPhotoCarousel photos={community.photos} communityName={community.name} />

            {/* Community Header */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className="bg-red-600 text-white">
                        <Tag className="w-3 h-3 mr-1" />
                        RED TAG DEAL
                      </Badge>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Example Features
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        <Crown className="w-3 h-3 mr-1" />
                        Featured Community
                      </Badge>
                    </div>
                    
                    <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                      {community.name}
                    </CardTitle>
                    
                    <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        <span>{community.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-5 h-5" />
                        <span>{community.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        <a href={community.website} className="text-blue-600 hover:underline">
                          Visit Website
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="font-semibold">{community.rating}</span>
                        <span className="text-gray-600 dark:text-gray-400">
                          ({community.reviewCount} reviews)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="w-5 h-5 text-blue-600" />
                        <span>{community.redTagSpecial.unitsAvailable} units available</span>
                      </div>
                    </div>
                  </div>

                  {/* Live Pricing Display */}
                  <div className="text-right">
                    <div className="mb-3">
                      <div className="flex items-center justify-end mb-1">
                        <Badge className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 mr-2">
                          <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full mr-1"></div>
                          Live Pricing (Example)
                        </Badge>
                      </div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        ${community.redTagSpecial.specialPrice.toLocaleString()}/month
                      </div>
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        Red Tag Special Rate
                      </div>
                      <div className="text-sm text-gray-500 line-through mt-1">
                        Regular: ${community.redTagSpecial.originalPrice.toLocaleString()}/month
                      </div>
                    </div>

                    {/* Availability Status */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-end">
                        <div className="w-3 h-3 rounded-full mr-2 bg-green-500"></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
                          {community.redTagSpecial.unitsAvailable} Units Available
                        </span>
                      </div>

                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                        <div className="text-sm text-green-700 dark:text-green-300 font-medium">
                          Red Tag Special Active
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                          Valid until {community.redTagSpecial.validUntil}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Tabbed Content */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="photos">Photos</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Community Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {community.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Care Types</h4>
                        <div className="space-y-1">
                          {community.careTypes.map((type, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm">{type}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Key Services</h4>
                        <div className="space-y-1">
                          {community.services.slice(0, 4).map((service, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-blue-500" />
                              <span className="text-sm">{service}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="amenities" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Community Amenities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {community.amenities.map((amenity, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="photos" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Photo Gallery</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {community.photos.map((photo, idx) => (
                        <img 
                          key={idx}
                          src={photo} 
                          alt={`${community.name} - Photo ${idx + 1}`}
                          className="w-full h-64 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Red Tag Special Pricing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="text-center mb-4">
                        <h3 className="text-xl font-bold text-red-800 dark:text-red-200">
                          {community.redTagSpecial.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {community.redTagSpecial.description}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">
                            ${community.redTagSpecial.specialPrice.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">Special Rate</div>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                          <div className="text-2xl font-bold text-gray-400 line-through">
                            ${community.redTagSpecial.originalPrice.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">Regular Rate</div>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            ${(community.redTagSpecial.originalPrice - community.redTagSpecial.specialPrice).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">Monthly Savings</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Red Tag Special Card */}
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="bg-red-50 dark:bg-red-950/30">
                <CardTitle className="text-red-800 dark:text-red-200 flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  {community.redTagSpecial.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {community.redTagSpecial.description}
                </p>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">Valid until {community.redTagSpecial.validUntil}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{community.redTagSpecial.unitsAvailable} units available</span>
                  </div>
                </div>

                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    ${community.redTagSpecial.specialPrice.toLocaleString()}/month
                  </div>
                  <div className="text-sm text-gray-500 line-through">
                    Was ${community.redTagSpecial.originalPrice.toLocaleString()}/month
                  </div>
                  <div className="text-green-600 font-semibold text-sm mt-1">
                    Save ${(community.redTagSpecial.originalPrice - community.redTagSpecial.specialPrice).toLocaleString()}/month
                  </div>
                </div>

                <Button className="w-full mb-3 bg-red-600 hover:bg-red-700 text-white" disabled>
                  <Tag className="w-4 h-4 mr-2" />
                  Reserve Now (Example)
                </Button>

                <Button variant="outline" className="w-full" disabled>
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Tour (Example)
                </Button>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-semibold">{community.phone}</div>
                      <div className="text-sm text-gray-500">Main Office</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <div>
                      <a href={community.website} className="text-blue-600 hover:underline font-semibold">
                        Visit Website
                      </a>
                      <div className="text-sm text-gray-500">Community Website</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-semibold">Location</div>
                      <div className="text-sm text-gray-500">{community.address}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Disclaimer Card */}
            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <AlertCircle className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    Red Tag Example
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                    This is an example of how verified community specials will appear. Contact the actual community for real availability and pricing.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href={`/community/${community.actualCommunityId}`}>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Authentic Listing
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}