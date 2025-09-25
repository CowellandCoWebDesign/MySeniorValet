import React, { useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Phone, Mail, Globe, MapPin, Star, Calendar, 
         Building, CheckCircle, Sparkles, Clock, DollarSign, Shield, 
         TrendingUp, Users, ExternalLink, Loader2, Heart, Navigation } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { NavigationHeader } from "@/components/NavigationHeader";
import { BreadcrumbNavigation } from "@/components/BreadcrumbNavigation";
import { EnhancedPhotoCarousel } from "@/components/EnhancedPhotoCarousel";
import { LiveWebIntelligence } from "@/components/LiveWebIntelligence";
import { apiRequest } from "@/lib/queryClient";
import valetMascot from '@/assets/valet-mascot.png';

interface Vendor {
  id: number;
  business_name?: string;
  businessName?: string;
  business_type?: string;
  businessType?: string;
  description?: string;
  short_description?: string;
  shortDescription?: string;
  primary_contact_email?: string;
  primaryContactEmail?: string;
  primary_contact_phone?: string;
  primaryContactPhone?: string;
  business_city?: string;
  businessCity?: string;
  business_state?: string;
  businessState?: string;
  website?: string;
  logo_url?: string;
  logoUrl?: string;
  service_areas?: string[];
  serviceAreas?: string[];
  subscription_tier?: string;
  subscriptionTier?: string;
  is_verified?: boolean;
  isVerified?: boolean;
  average_rating?: number;
  averageRating?: number;
  total_reviews?: number;
  totalReviews?: number;
  featured?: boolean;
  status?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

const VendorBookingSection = ({ vendor }: { vendor: Vendor }) => {
  const [showBooking, setShowBooking] = useState(false);
  const { toast } = useToast();
  
  const phone = vendor.primary_contact_phone || vendor.primaryContactPhone;
  const email = vendor.primary_contact_email || vendor.primaryContactEmail;
  const website = vendor.website;
  
  return (
    <Card className="border-2 border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          Contact & Booking
        </CardTitle>
        <CardDescription>
          Get in touch or book services
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {phone && (
          <Button
            variant="default"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            onClick={() => window.location.href = `tel:${phone}`}
          >
            <Phone className="w-4 h-4 mr-2" />
            Call Now: {phone}
          </Button>
        )}
        
        {email && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.location.href = `mailto:${email}`}
          >
            <Mail className="w-4 h-4 mr-2" />
            Email: {email}
          </Button>
        )}
        
        {website && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open(website, '_blank')}
          >
            <Globe className="w-4 h-4 mr-2" />
            Visit Website
          </Button>
        )}
        
        {!phone && !email && !website && (
          <Alert>
            <AlertDescription>
              Contact information is being verified for this business.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

const VendorInfoCard = ({ vendor }: { vendor: Vendor }) => {
  const businessName = vendor.business_name || vendor.businessName;
  const businessType = vendor.business_type || vendor.businessType;
  const city = vendor.business_city || vendor.businessCity;
  const state = vendor.business_state || vendor.businessState;
  const isVerified = vendor.is_verified || vendor.isVerified;
  const rating = vendor.average_rating || vendor.averageRating;
  const reviews = vendor.total_reviews || vendor.totalReviews;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">{businessName}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {city}, {state}
            </CardDescription>
          </div>
          {isVerified && (
            <Badge className="bg-green-500/10 text-green-700 border-green-500/30">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {businessType && (
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Business Type:</span>
            <Badge variant="outline">{businessType}</Badge>
          </div>
        )}
        
        {rating && rating > 0 && (
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium">Rating:</span>
            <span className="text-sm">{rating.toFixed(1)} / 5.0</span>
            {reviews && reviews > 0 && (
              <span className="text-xs text-gray-500">({reviews} reviews)</span>
            )}
          </div>
        )}
        
        {vendor.description && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-semibold mb-2">About</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {vendor.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function VendorDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch vendor details
  const { data: vendor, isLoading, error } = useQuery<Vendor>({
    queryKey: [`/api/vendors/${id}`],
    enabled: !!id,
  });
  
  // Fetch vendor services
  const { data: services } = useQuery({
    queryKey: [`/api/vendors/${id}/services`],
    enabled: !!id,
  });
  
  // Fetch vendor reviews
  const { data: reviews } = useQuery({
    queryKey: [`/api/vendors/${id}/reviews`],
    enabled: !!id,
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
        <NavigationHeader />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading business details...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
        <NavigationHeader />
        <div className="container mx-auto px-4 py-8">
          <Alert className="max-w-2xl mx-auto">
            <AlertDescription>
              Business not found. It may have been removed or the link is incorrect.
            </AlertDescription>
          </Alert>
          <div className="text-center mt-4">
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  const businessName = vendor.business_name || vendor.businessName || 'Business';
  const businessType = vendor.business_type || vendor.businessType;
  const city = vendor.business_city || vendor.businessCity;
  const state = vendor.business_state || vendor.businessState;
  const shortDesc = vendor.short_description || vendor.shortDescription;
  
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: businessName, href: `/vendor/${id}` }
  ];
  
  // Prepare photos for carousel
  const photos = [];
  if (vendor.logo_url || vendor.logoUrl) {
    photos.push({
      url: vendor.logo_url || vendor.logoUrl,
      caption: businessName,
      source: 'Business Logo'
    });
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      <NavigationHeader />
      
      {/* Breadcrumb Navigation */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <BreadcrumbNavigation items={breadcrumbs} />
        </div>
      </div>
      
      {/* Hero Section with Photo Carousel */}
      <div className="relative bg-gradient-to-br from-purple-600/10 to-blue-600/10 dark:from-purple-900/20 dark:to-blue-900/20">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Photo Section */}
            <div className="relative">
              {photos.length > 0 ? (
                <EnhancedPhotoCarousel 
                  photos={photos}
                  businessName={businessName}
                  location={city && state ? `${city}, ${state}` : ''}
                  mascotImage={valetMascot}
                />
              ) : (
                <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 rounded-lg flex items-center justify-center">
                  <div className="text-center p-8">
                    <Building className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{businessName}</h3>
                    {shortDesc && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {shortDesc}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Quick Info Section */}
            <div className="space-y-4">
              <VendorInfoCard vendor={vendor} />
              <VendorBookingSection vendor={vendor} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Business Intelligence */}
            <LiveWebIntelligence
              searchQuery={`${businessName} ${businessType} ${city} ${state}`}
              context={{
                location: `${city}, ${state}`,
                businessType: businessType || 'business',
                businessName: businessName
              }}
              title="Live Market Intelligence"
              forceRefresh={false}
            />
            
            {/* Service Areas */}
            {(vendor.service_areas || vendor.serviceAreas) && (vendor.service_areas || vendor.serviceAreas).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Service Areas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(vendor.service_areas || vendor.serviceAreas).map((area: string, idx: number) => (
                      <Badge key={idx} variant="outline">
                        <MapPin className="w-3 h-3 mr-1" />
                        {area}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="services" className="space-y-4">
            {services && services.length > 0 ? (
              services.map((service: any) => (
                <Card key={service.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{service.serviceName}</CardTitle>
                    <CardDescription>{service.category}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {service.description && (
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {service.description}
                      </p>
                    )}
                    {service.pricing && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-sm">
                          {service.pricing.type === 'custom' 
                            ? service.pricing.customPricing || 'Contact for pricing'
                            : `$${service.pricing.amount} / ${service.pricing.type}`}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Alert>
                <AlertDescription>
                  No services listed yet. Contact the business for more information.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          <TabsContent value="reviews" className="space-y-4">
            {reviews && reviews.length > 0 ? (
              reviews.map((review: any) => (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{review.reviewerName || 'Anonymous'}</CardTitle>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'fill-yellow-500 text-yellow-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{review.reviewText}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Alert>
                <AlertDescription>
                  No reviews yet. Be the first to leave a review!
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Back Button */}
      <div className="container mx-auto px-4 pb-8">
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Button>
        </Link>
      </div>
    </div>
  );
}