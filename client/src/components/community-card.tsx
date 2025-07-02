import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Shield, AlertTriangle, DollarSign, MapPin, Heart, Share, Users, Calendar, CheckCircle, ExternalLink, Clock, Home } from "lucide-react";
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

  const availability = getAvailabilityConfig(community.availabilityStatus || "Contact for Availability");
  const pricing = formatPrice(community.priceRange);
  const specialOffers = getSpecialOffers();
  const reviewSnippets = getReviewSnippets();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      {/* Prominent Availability Status Bar */}
      <div className={`${availability.color} px-4 py-2 flex items-center justify-between`}>
        <div className="flex items-center space-x-2">
          {availability.icon}
          <span className="font-semibold">{community.availabilityStatus}</span>
          {community.availableUnits && (
            <span className="text-sm opacity-90">({community.availableUnits} units)</span>
          )}
        </div>
        {availability.urgency === "high" && (
          <Badge variant="secondary" className="bg-white text-green-800">
            <Clock className="h-3 w-3 mr-1" />
            Act Fast
          </Badge>
        )}
      </div>

      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {/* Image Section */}
          <div className="md:col-span-1 relative">
            <img
              src={community.imageUrl || "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
              alt={`${community.name} exterior`}
              className="w-full h-48 md:h-full object-cover"
            />
            {community.isClaimed && (
              <Badge className="absolute top-2 left-2 bg-green-600 text-white">
                <Shield className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>

          {/* Content Section */}
          <div className="md:col-span-2 p-6">
            {/* Header with Name and Rating */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{community.name}</h3>
                <div className="flex items-center text-gray-600 text-sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  {community.address}, {community.city}, {community.state}
                </div>
              </div>
              {community.googleRating && (
                <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="font-semibold text-gray-900">{parseFloat(community.googleRating).toFixed(1)}</span>
                  <span className="text-xs text-gray-600">({community.googleReviewCount})</span>
                </div>
              )}
            </div>

            {/* PRICING TRANSPARENCY - Most Prominent */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">Pricing</span>
                  </div>
                  {pricing ? (
                    <div className="text-2xl font-bold text-blue-900">
                      {pricing.range}
                      <span className="text-sm text-blue-700 font-normal">{pricing.monthly}</span>
                    </div>
                  ) : (
                    <div className="text-lg font-semibold text-blue-900">Contact for pricing</div>
                  )}
                </div>
                {specialOffers.length > 0 && (
                  <Badge className="bg-red-600 text-white">
                    {specialOffers.length} Special{specialOffers.length > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              
              {/* Special Offers */}
              {specialOffers.slice(0, 1).map((offer: any, index: number) => (
                <div key={index} className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                  <div className="font-medium text-red-900">{offer.title}</div>
                  <div className="text-sm text-red-700">Save ${offer.savings?.toLocaleString()}</div>
                </div>
              ))}
            </div>

            {/* GOOGLE REVIEW SNIPPETS */}
            {reviewSnippets.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-semibold text-gray-900">Recent Reviews</span>
                </div>
                <div className="space-y-3">
                  {reviewSnippets.map((snippet: any, index: number) => (
                    <div key={index} className="border-l-3 border-l-gray-300 pl-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-3 w-3 ${i < snippet.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">by {snippet.author}</span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">"{snippet.text}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Care Types */}
            <div className="flex flex-wrap gap-2 mb-4">
              {community.careTypes.slice(0, 3).map((type) => (
                <Badge key={type} variant="outline" className="text-xs">
                  <Home className="h-3 w-3 mr-1" />
                  {type}
                </Badge>
              ))}
              {community.careTypes.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{community.careTypes.length - 3} more
                </Badge>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Link href={`/community/${community.id}`}>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                  View Details
                </Button>
              </Link>
              {community.phone && (
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Call
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}