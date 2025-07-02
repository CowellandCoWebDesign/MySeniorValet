import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Shield, AlertTriangle, DollarSign, MapPin, Heart, Share, Users, Calendar, CheckCircle, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import type { Community } from "@shared/schema";

interface CommunityCardProps {
  community: Community;
}

export function CommunityCard({ community }: CommunityCardProps) {
  const getLicenseStatusColor = (status: string) => {
    switch (status) {
      case 'Licensed':
        return 'bg-green-100 text-green-800';
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-800';
      case 'Expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case "Available": return "bg-green-100 text-green-800";
      case "Waitlist": return "bg-yellow-100 text-yellow-800";
      case "Full": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDistance = (lat?: string, lng?: string) => {
    // Mock distance calculation - in real app would use geolocation
    return `${(Math.random() * 10 + 1).toFixed(1)} miles away`;
  };

  const formatPrice = (priceRange?: { min: number; max: number } | null) => {
    if (!priceRange) return 'Contact for pricing';
    return `$${priceRange.min.toLocaleString()} - $${priceRange.max.toLocaleString()}/month`;
  };

  const formatLastUpdate = (label: string, date?: Date | null) => {
    if (!date) return `${label}: Not available`;
    return `${label}: ${new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    })}`;
  };

  const getMainReviewSource = () => {
    if (community.trustedReviews && community.trustedReviews.length > 0) {
      return community.trustedReviews[0];
    }
    if (community.googleRating && community.googleReviewCount) {
      return {
        source: "Google",
        rating: parseFloat(community.googleRating),
        reviewCount: community.googleReviewCount
      };
    }
    return null;
  };

  const mainReview = getMainReviewSource();

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
        <div className="md:col-span-1 relative">
          <img
            src={community.imageUrl || "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
            alt={`${community.name} exterior`}
            className="w-full h-48 md:h-full object-cover"
          />
          <div className="absolute top-2 left-2 space-y-2">
            {community.isClaimed && (
              <Badge className="bg-green-600 text-white">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
            {community.availabilityStatus && (
              <Badge className={getAvailabilityColor(community.availabilityStatus)}>
                {community.availabilityStatus}
                {community.availableUnits && community.availabilityStatus === "Available" && 
                  ` (${community.availableUnits})`
                }
              </Badge>
            )}
          </div>
        </div>
        
        <CardContent className="md:col-span-2 p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-semibold text-gray-900">{community.name}</h3>
            <div className="flex items-center space-x-2">
              {mainReview && (
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-700">
                    {mainReview.rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({mainReview.reviewCount}) {mainReview.source}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <p className="text-gray-600 mb-3">
            {community.address}, {community.city}, {community.state} {community.zipCode}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {community.careTypes.map((type) => (
              <Badge key={type} variant="secondary" className="text-xs">
                {type}
              </Badge>
            ))}
          </div>

          {/* Key Services & Medical Restrictions */}
          <div className="mb-4 space-y-2">
            {community.services && community.services.length > 0 && (
              <div>
                <span className="font-medium text-sm text-gray-700">Services: </span>
                <span className="text-sm text-gray-600">
                  {community.services.slice(0, 3).join(", ")}
                  {community.services.length > 3 && ` +${community.services.length - 3} more`}
                </span>
              </div>
            )}
            {community.medicalRestrictions && community.medicalRestrictions.length > 0 && (
              <div className="flex items-start gap-1">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-sm text-amber-700">Restrictions: </span>
                  <span className="text-sm text-amber-600">
                    {community.medicalRestrictions.join(", ")}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <div>
                <div className="text-gray-700 font-medium">{formatPrice(community.priceRange)}</div>
                {community.lastPriceUpdate && (
                  <div className="text-xs text-gray-500">
                    {formatLastUpdate("Pricing updated", community.lastPriceUpdate)}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-gray-700 font-medium">
                  {community.availableUnits || 0}/{community.totalUnits || 0} units
                </div>
                {community.lastAvailabilityUpdate && (
                  <div className="text-xs text-gray-500">
                    {formatLastUpdate("Availability updated", community.lastAvailabilityUpdate)}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-orange-500" />
              <span className="text-gray-700">{formatDistance(community.latitude || undefined, community.longitude || undefined)}</span>
            </div>
            {community.trustedReviews && community.trustedReviews.length > 1 && (
              <div className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4 text-green-500" />
                <span className="text-gray-700">{community.trustedReviews.length} trusted review sources</span>
              </div>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Link href={`/community/${community.id}`} className="flex-1">
              <Button className="w-full">View Details</Button>
            </Link>
            <Button variant="outline" size="icon">
              <Heart className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
