import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, DollarSign, Home, Users, Calendar, Eye } from 'lucide-react';
import { Link } from 'wouter';

interface CommunityCardProps {
  community: {
    id: number;
    name: string;
    address?: string;
    city?: string;
    state?: string;
    rating?: number | string;
    reviewCount?: number;
    priceRange?: { min: number; max: number };
    careTypes?: string[];
    photos?: string[];
    availableUnits?: number;
    virtualTourUrl?: string;
  };
}

export function CommunityCard({ community }: CommunityCardProps) {
  // Format price display
  const formatPrice = (priceRange?: { min: number; max: number }) => {
    if (!priceRange) return 'Contact for pricing';
    if (priceRange.min === priceRange.max) {
      return `$${priceRange.min.toLocaleString()}/mo`;
    }
    return `$${priceRange.min.toLocaleString()} - $${priceRange.max.toLocaleString()}/mo`;
  };
  
  // Parse rating (could be decimal string or number)
  const rating = typeof community.rating === 'string' 
    ? parseFloat(community.rating) 
    : community.rating;
  
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 border-purple-100 dark:border-purple-900">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-1">
              {community.name}
            </h3>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="w-3 h-3 mr-1" />
              {community.city}, {community.state}
            </div>
          </div>
          
          {rating && rating > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{rating.toFixed(1)}</span>
              {community.reviewCount && (
                <span className="text-gray-500 dark:text-gray-400">
                  ({community.reviewCount})
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Care Types */}
        {community.careTypes && community.careTypes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {community.careTypes.slice(0, 3).map((type, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {type}
              </Badge>
            ))}
            {community.careTypes.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{community.careTypes.length - 3} more
              </Badge>
            )}
          </div>
        )}
        
        {/* Price and Availability */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-sm font-medium text-purple-700 dark:text-purple-300">
            <DollarSign className="w-3 h-3" />
            {formatPrice(community.priceRange)}
          </div>
          
          {community.availableUnits !== undefined && (
            <div className="flex items-center gap-1 text-sm">
              <Home className="w-3 h-3" />
              <span className={community.availableUnits > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}>
                {community.availableUnits > 0 
                  ? `${community.availableUnits} available`
                  : 'Waitlist'
                }
              </span>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button asChild variant="default" size="sm" className="flex-1">
            <Link href={`/community/${community.id}`}>
              <Eye className="w-3 h-3 mr-1" />
              View Details
            </Link>
          </Button>
          
          {community.virtualTourUrl && (
            <Button variant="outline" size="sm">
              <Calendar className="w-3 h-3 mr-1" />
              Virtual Tour
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}