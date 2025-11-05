import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavigationHeader } from "@/components/NavigationHeader";
import { BreadcrumbNavigation } from "@/components/BreadcrumbNavigation";
import { CommunityDetailsHeader } from '@/components/CommunityDetailsHeader';
import { AuthenticPricingDisplay } from "@/components/AuthenticPricingDisplay";
import { LiveWebIntelligence } from "@/components/LiveWebIntelligence";
import { CommunityReviews } from '@/components/CommunityReviews';
import { TourScheduler } from "@/components/TourScheduler";
import { MessageCommunityButton } from "@/components/message-community-button";
import { ReservationSection } from '@/components/ReservationSection';
import { HealthcarePartnerships } from '@/components/HealthcarePartnerships';
import { MascotLoadingDisplay } from "@/components/MascotLoadingDisplay";
import { 
  ArrowLeft, Home, Phone, Calendar, Heart, MessageSquare, Star, DollarSign, 
  MapPin, Info, Mail, Globe, Users, Building, Clock, Shield, Activity, 
  UtensilsCrossed, Car, ChevronDown, ChevronUp, CheckCircle, AlertCircle 
} from 'lucide-react';
import type { Community } from '@shared/schema';

// SEO-optimized community detail page with server-side data
export default function CommunitySEO() {
  const { state, city, slug } = useParams();
  const [location, setLocation] = useLocation();
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showAllCareServices, setShowAllCareServices] = useState(false);

  // Fetch community data using the SEO-friendly URL
  const { data: community, isLoading, error } = useQuery<Community>({
    queryKey: [`/api/communities/by-slug/${state}/${city}/${slug}`],
    retry: 1,
    staleTime: 30 * 60 * 1000, // Consider data fresh for 30 minutes
    gcTime: 2 * 60 * 60 * 1000, // Keep in cache for 2 hours even when component unmounts
  });

  // Generate breadcrumb items
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Senior Living", href: "/senior-living" },
    { label: state?.toUpperCase() || "State", href: `/senior-living/${state}` },
    { label: city?.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || "City", href: `/senior-living/${state}/${city}` },
    { label: community?.name || "Community", href: "#" }
  ];

  // Generate unique meta description based on community data
  const getMetaDescription = () => {
    if (!community) return "Senior living community information and pricing";
    
    let description = `${community.name} in ${community.city}, ${community.state}`;
    
    if (community.careTypes?.length > 0) {
      description += ` offers ${community.careTypes.slice(0, 2).join(', ')}`;
    }
    
    if (community.monthlyRent || community.priceRange) {
      const price = community.monthlyRent || community.priceRange?.min;
      if (price) {
        description += ` starting at $${price.toLocaleString()}/month`;
      }
    }
    
    description += `. View photos, amenities, reviews, and schedule tours.`;
    return description.substring(0, 160); // Meta descriptions should be under 160 chars
  };

  // Generate structured data for SEO
  const getStructuredData = () => {
    if (!community) return null;

    return {
      "@context": "https://schema.org",
      "@type": "SeniorLivingCommunity",
      "name": community.name,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": community.address,
        "addressLocality": community.city,
        "addressRegion": community.state,
        "postalCode": community.zipCode,
        "addressCountry": community.country || "US"
      },
      "telephone": community.phone,
      "url": community.website,
      "geo": community.latitude && community.longitude ? {
        "@type": "GeoCoordinates",
        "latitude": community.latitude,
        "longitude": community.longitude
      } : undefined,
      "priceRange": community.priceRange ? 
        `$${community.priceRange.min}-$${community.priceRange.max}` : 
        community.monthlyRent ? `$$${community.monthlyRent}` : undefined,
      "aggregateRating": community.averageRating ? {
        "@type": "AggregateRating",
        "ratingValue": community.averageRating,
        "reviewCount": community.reviews?.length || 0
      } : undefined,
      "amenityFeature": community.amenities?.map((amenity: string) => ({
        "@type": "LocationFeatureSpecification",
        "name": amenity,
        "value": true
      }))
    };
  };

  if (isLoading) {
    return <MascotLoadingDisplay title="Loading community details..." subtitle="Fetching information" />;
  }

  if (error || !community) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Community Not Found</h1>
          <p className="text-muted-foreground mb-4">
            We couldn't find the community you're looking for.
          </p>
          <Link href="/senior-living">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Browse All Communities
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const canonicalUrl = `https://www.myseniorvalet.com/senior-living/${state}/${city}/${slug}`;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{community.name} | Senior Living in {community.city}, {community.state} | MySeniorValet</title>
        <meta name="description" content={getMetaDescription()} />
        
        {/* Open Graph tags */}
        <meta property="og:title" content={`${community.name} - Senior Living in ${community.city}, ${community.state}`} />
        <meta property="og:description" content={getMetaDescription()} />
        <meta property="og:type" content="business.business" />
        <meta property="og:url" content={canonicalUrl} />
        {community.photos?.[0] && (
          <meta property="og:image" content={community.photos[0]} />
        )}
        
        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(getStructuredData())}
        </script>
      </Helmet>

      <NavigationHeader />
      <BreadcrumbNavigation items={breadcrumbItems} />

      <div className="container mx-auto px-4 py-6">
        {/* Header with photos */}
        <CommunityDetailsHeader community={community} />

        {/* Main content grid */}
        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          {/* Left column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  About {community.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {community.description || `${community.name} is a senior living community located in ${community.city}, ${community.state}.`}
                </p>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <div className="text-sm">
                      <p className="font-medium">Address</p>
                      <p className="text-muted-foreground">
                        {community.address}<br />
                        {community.city}, {community.state} {community.zipCode}
                      </p>
                    </div>
                  </div>
                  
                  {community.phone && (
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground mt-1" />
                      <div className="text-sm">
                        <p className="font-medium">Phone</p>
                        <a href={`tel:${community.phone}`} className="text-primary hover:underline">
                          {community.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {community.website && (
                    <div className="flex items-start gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground mt-1" />
                      <div className="text-sm">
                        <p className="font-medium">Website</p>
                        <a 
                          href={community.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {community.yearEstablished && (
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground mt-1" />
                      <div className="text-sm">
                        <p className="font-medium">Established</p>
                        <p className="text-muted-foreground">{community.yearEstablished}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Care Types & Services */}
            {community.careTypes && community.careTypes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Care Types & Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {community.careTypes.map((care: string) => (
                      <Badge key={care} variant="secondary">
                        {care.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
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
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Amenities & Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {(showAllAmenities ? community.amenities : community.amenities.slice(0, 10))
                      .map((amenity: string) => (
                        <div key={amenity} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>{amenity}</span>
                        </div>
                    ))}
                  </div>
                  {community.amenities.length > 10 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllAmenities(!showAllAmenities)}
                      className="mt-4"
                    >
                      {showAllAmenities ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-2" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-2" />
                          Show All ({community.amenities.length})
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Live Web Intelligence */}
            {community.competitiveAnalysis && (
              <LiveWebIntelligence 
                communityId={community.id}
                communityName={community.name}
                city={community.city}
                state={community.state}
                comprehensiveData={community.competitiveAnalysis}
              />
            )}

            {/* Reviews */}
            <CommunityReviews 
              community={community}
            />
          </div>

          {/* Right column - Actions & Pricing */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <AuthenticPricingDisplay community={community} />

            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <TourScheduler 
                  communityId={community.id}
                  communityName={community.name}
                />
                
                <MessageCommunityButton 
                  communityId={community.id}
                  communityName={community.name}
                />
                
                <Button variant="outline" className="w-full" asChild>
                  <a href={`tel:${community.phone}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    Call {community.phone}
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Reservation Section */}
            <ReservationSection 
              community={community}
            />

            {/* Healthcare Partnerships */}
            <HealthcarePartnerships community={community} />
          </div>
        </div>
      </div>
    </div>
  );
}