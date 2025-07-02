import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Shield, AlertTriangle, DollarSign, MapPin, Heart, Share, Users, Calendar, CheckCircle, ExternalLink, Clock, Home, Wifi, Car, Utensils, Activity, Phone } from "lucide-react";
import { Link } from "wouter";
import type { Community } from "@shared/schema";

interface CommunityCardProps {
  community: Community;
}

export function CommunityCard({ community }: CommunityCardProps) {
  const getAvailabilityConfig = (status: string) => {
    switch (status) {
      case "Available Now": 
        return { 
          color: "bg-green-600 text-white border-green-600", 
          icon: <CheckCircle className="h-4 w-4" />,
          urgency: "high"
        };
      case "Waitlist": 
        return { 
          color: "bg-yellow-600 text-white border-yellow-600", 
          icon: <Users className="h-4 w-4" />,
          urgency: "medium"
        };
      case "Full": 
        return { 
          color: "bg-red-600 text-white border-red-600", 
          icon: <AlertTriangle className="h-4 w-4" />,
          urgency: "low"
        };
      default: 
        return { 
          color: "bg-gray-600 text-white border-gray-600", 
          icon: <Calendar className="h-4 w-4" />,
          urgency: "medium"
        };
    }
  };

  const formatPrice = (priceRange?: { min: number; max: number } | null) => {
    if (!priceRange) return null;
    return {
      range: `$${priceRange.min.toLocaleString()} - $${priceRange.max.toLocaleString()}`,
      monthly: "/month"
    };
  };

  const getSpecialOffers = () => {
    const pricingDetails = community.pricingDetails as any;
    return pricingDetails?.specialOffers || [];
  };

  const getReviewSnippets = () => {
    const snippets = community.googleReviewSnippets as any[] || [];
    return snippets.slice(0, 2);
  };

  const getTopAmenities = () => {
    const amenities = community.amenities || [];
    const amenityIcons: { [key: string]: any } = {
      'WiFi': <Wifi className="h-4 w-4" />,
      'Parking': <Car className="h-4 w-4" />,
      'Dining': <Utensils className="h-4 w-4" />,
      'Fitness': <Activity className="h-4 w-4" />,
      'Restaurant': <Utensils className="h-4 w-4" />,
      'Activities': <Activity className="h-4 w-4" />,
    };
    
    return amenities.slice(0, 4).map((amenity: string) => ({
      name: amenity,
      icon: amenityIcons[amenity] || <CheckCircle className="h-4 w-4" />
    }));
  };

  const getPriceTransparency = () => {
    if (!community.priceRange) return null;
    
    const priceTransparency = community.priceTransparency as any;
    const hasPublicPricing = priceTransparency?.hasPublicPricing;
    const lastUpdated = priceTransparency?.lastUpdated;
    
    return {
      hasPublicPricing,
      lastUpdated: lastUpdated ? new Date(lastUpdated) : null,
      isRecent: lastUpdated ? (new Date().getTime() - new Date(lastUpdated).getTime()) < (30 * 24 * 60 * 60 * 1000) : false
    };
  };

  const availability = getAvailabilityConfig(community.availabilityStatus || "Contact for Availability");
  const pricing = formatPrice(community.priceRange);
  const specialOffers = getSpecialOffers();
  const reviewSnippets = getReviewSnippets();
  const topAmenities = getTopAmenities();
  const priceTransparency = getPriceTransparency();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      {/* LIVE AVAILABILITY STATUS - Top Priority */}
      <div className={`${availability.color} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center space-x-3">
          {availability.icon}
          <div>
            <span className="font-bold text-lg">{community.availabilityStatus}</span>
            {community.availableUnits && (
              <span className="text-sm opacity-90 ml-2">• {community.availableUnits} units available</span>
            )}
          </div>
        </div>
        {availability.urgency === "high" && (
          <Badge variant="secondary" className="bg-white text-green-800 font-semibold">
            <Clock className="h-3 w-3 mr-1" />
            Act Fast
          </Badge>
        )}
      </div>

      <CardContent className="p-6">
        {/* Header: Name, Rating & Location */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{community.name}</h3>
            <div className="flex items-center text-gray-600 text-sm mb-3">
              <MapPin className="h-4 w-4 mr-1" />
              {community.address}, {community.city}, {community.state}
            </div>
          </div>
          
          {/* PROMINENT RATING DISPLAY */}
          {community.googleRating && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center min-w-[100px]">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <span className="text-xl font-bold text-gray-900">{parseFloat(community.googleRating).toFixed(1)}</span>
              </div>
              <div className="text-xs text-gray-600">{community.googleReviewCount} reviews</div>
              <div className="flex justify-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-3 w-3 ${i < Math.round(parseFloat(community.googleRating || '0')) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* LEFT COLUMN: PRICING & OFFERS */}
          <div className="space-y-4">
            {/* PRICING TRANSPARENCY - Highly Prominent */}
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-6 w-6 text-green-600" />
                  <span className="font-bold text-green-900 text-lg">Monthly Cost</span>
                </div>
                {priceTransparency?.hasPublicPricing && (
                  <Badge className="bg-green-600 text-white text-xs">
                    Public Pricing
                  </Badge>
                )}
              </div>
              
              {pricing ? (
                <div>
                  <div className="text-3xl font-bold text-green-900 mb-1">
                    {pricing.range}
                  </div>
                  <div className="text-sm text-green-700">per month</div>
                  {priceTransparency?.lastUpdated && (
                    <div className="text-xs text-green-600 mt-1">
                      Updated {priceTransparency.isRecent ? 'recently' : 'over 30 days ago'}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xl font-semibold text-green-900">Contact for pricing</div>
              )}
            </div>

            {/* SPECIAL OFFERS */}
            {specialOffers.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge className="bg-red-600 text-white">
                    {specialOffers.length} Special Offer{specialOffers.length > 1 ? 's' : ''}
                  </Badge>
                </div>
                {specialOffers.slice(0, 2).map((offer: any, index: number) => (
                  <div key={index} className="mb-2 last:mb-0">
                    <div className="font-semibold text-red-900">{offer.title}</div>
                    <div className="text-sm text-red-700">Save ${offer.savings?.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: AMENITIES & FEATURES */}
          <div className="space-y-4">
            {/* TOP AMENITIES */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Activity className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-900">Top Amenities</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {topAmenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-blue-800">
                    <span className="text-blue-600">{amenity.icon}</span>
                    <span>{amenity.name}</span>
                  </div>
                ))}
              </div>
              {community.amenities && community.amenities.length > 4 && (
                <div className="text-xs text-blue-600 mt-2">
                  +{community.amenities.length - 4} more amenities
                </div>
              )}
            </div>

            {/* CARE TYPES */}
            <div className="space-y-2">
              <div className="text-sm font-semibold text-gray-700">Care Services</div>
              <div className="flex flex-wrap gap-2">
                {community.careTypes.slice(0, 4).map((type) => (
                  <Badge key={type} variant="outline" className="text-xs border-gray-300">
                    <Home className="h-3 w-3 mr-1" />
                    {type}
                  </Badge>
                ))}
                {community.careTypes.length > 4 && (
                  <Badge variant="outline" className="text-xs border-gray-300">
                    +{community.careTypes.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* REVIEW SNIPPETS - Prominent Section */}
        {reviewSnippets.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 mb-4">
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <span className="font-bold text-gray-900 text-lg">What Families Say</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviewSnippets.map((snippet: any, index: number) => (
                <div key={index} className="bg-white border border-gray-200 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < snippet.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">- {snippet.author}</span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-3">"{snippet.text}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="flex space-x-3">
          <Link href={`/community/${community.id}`} className="flex-1">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 py-3 text-lg font-semibold">
              View Full Details & More Reviews
            </Button>
          </Link>
          {community.phone && (
            <Button variant="outline" className="px-6 py-3 border-2">
              <Phone className="h-4 w-4 mr-2" />
              Call Now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}