import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Shield, AlertTriangle, DollarSign, MapPin, Heart, Share } from "lucide-react";
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

  const formatDistance = (lat?: string, lng?: string) => {
    // Mock distance calculation - in real app would use geolocation
    return `${(Math.random() * 10 + 1).toFixed(1)} miles away`;
  };

  const formatPrice = (priceRange?: { min: number; max: number } | null) => {
    if (!priceRange) return 'Contact for pricing';
    return `Starting at $${priceRange.min.toLocaleString()}/mo`;
  };

  const formatLastInspection = (date?: Date | null) => {
    if (!date) return 'No recent inspection';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
        <div className="md:col-span-1">
          <img
            src={community.imageUrl || "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
            alt={`${community.name} exterior`}
            className="w-full h-48 md:h-full object-cover"
          />
        </div>
        
        <CardContent className="md:col-span-2 p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-semibold text-gray-900">{community.name}</h3>
            <div className="flex items-center space-x-2">
              {community.rating && (
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-700">
                    {parseFloat(community.rating).toFixed(1)}
                  </span>
                </div>
              )}
              <Badge className={getLicenseStatusColor(community.licenseStatus || 'Unknown')}>
                {community.licenseStatus || 'Unknown'}
              </Badge>
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
          
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-gray-700">
                Last Inspection: <span className="font-medium">{formatLastInspection(community.lastInspection)}</span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className={`h-4 w-4 ${community.violations === 0 ? 'text-green-500' : 'text-orange-500'}`} />
              <span className="text-gray-700">
                Violations: <span className="font-medium">
                  {community.violations === 0 ? '0 Active' : `${community.violations} Active`}
                </span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-gray-700">{formatPrice(community.priceRange)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-orange-500" />
              <span className="text-gray-700">{formatDistance(community.latitude, community.longitude)}</span>
            </div>
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
