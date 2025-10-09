import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Star, DollarSign, Users, Heart } from 'lucide-react';
import { Link } from 'wouter';

interface Community {
  id: number;
  name: string;
  city?: string;
  state?: string;
  rating?: number | string;
  reviewCount?: number;
  priceRange?: { min: number; max: number };
  pricingDetails?: any;
  careTypes?: string[];
  amenities?: string[];
  availableUnits?: number;
  totalUnits?: number;
}

interface ComparisonTableProps {
  communities: Community[];
}

export function ComparisonTable({ communities }: ComparisonTableProps) {
  // Limit to 4 communities max for comparison
  const compareList = communities.slice(0, 4);
  
  // Helper to format price
  const formatPrice = (priceRange?: { min: number; max: number }) => {
    if (!priceRange) return 'Contact';
    if (priceRange.min === priceRange.max) {
      return `$${priceRange.min.toLocaleString()}`;
    }
    return `$${priceRange.min.toLocaleString()}-${priceRange.max.toLocaleString()}`;
  };
  
  // Helper to get rating value
  const getRating = (rating?: number | string) => {
    if (!rating) return 0;
    return typeof rating === 'string' ? parseFloat(rating) : rating;
  };
  
  // Get all unique care types
  const allCareTypes = Array.from(new Set(
    compareList.flatMap(c => c.careTypes || [])
  ));
  
  // Get common amenities to compare
  const commonAmenities = [
    'Pet Friendly',
    '24/7 Nursing',
    'Transportation',
    'Meal Service',
    'Physical Therapy',
    'Memory Care'
  ];
  
  return (
    <Card className="overflow-hidden border-purple-200 dark:border-purple-800">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Community Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 sticky left-0 bg-gray-50 dark:bg-gray-800">
                  Feature
                </th>
                {compareList.map(community => (
                  <th key={community.id} className="text-center p-3 min-w-[150px]">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {community.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {community.city}, {community.state}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Rating Row */}
              <tr className="border-b dark:border-gray-700">
                <td className="p-3 font-medium sticky left-0 bg-white dark:bg-gray-900">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Rating
                  </div>
                </td>
                {compareList.map(community => {
                  const rating = getRating(community.rating);
                  return (
                    <td key={community.id} className="text-center p-3">
                      {rating > 0 ? (
                        <div>
                          <span className="font-semibold">{rating.toFixed(1)}</span>
                          {community.reviewCount && (
                            <span className="text-xs text-gray-500 ml-1">
                              ({community.reviewCount})
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">No ratings</span>
                      )}
                    </td>
                  );
                })}
              </tr>
              
              {/* Price Row */}
              <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <td className="p-3 font-medium sticky left-0 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    Monthly Price
                  </div>
                </td>
                {compareList.map(community => (
                  <td key={community.id} className="text-center p-3 font-semibold text-purple-700 dark:text-purple-300">
                    {formatPrice(community.priceRange)}
                  </td>
                ))}
              </tr>
              
              {/* Availability Row */}
              <tr className="border-b dark:border-gray-700">
                <td className="p-3 font-medium sticky left-0 bg-white dark:bg-gray-900">
                  Availability
                </td>
                {compareList.map(community => (
                  <td key={community.id} className="text-center p-3">
                    {community.availableUnits !== undefined ? (
                      community.availableUnits > 0 ? (
                        <Badge variant="default" className="bg-green-600">
                          {community.availableUnits} available
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Waitlist</Badge>
                      )
                    ) : (
                      <span className="text-gray-400">Unknown</span>
                    )}
                  </td>
                ))}
              </tr>
              
              {/* Care Types */}
              <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <td className="p-3 font-medium sticky left-0 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 text-red-500" />
                    Care Types
                  </div>
                </td>
                {compareList.map(community => (
                  <td key={community.id} className="text-center p-3">
                    <div className="space-y-1">
                      {community.careTypes?.map((type, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs m-0.5">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
              
              {/* Common Amenities */}
              {commonAmenities.map((amenity, idx) => (
                <tr key={amenity} className={`border-b dark:border-gray-700 ${idx % 2 === 0 ? '' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                  <td className={`p-3 text-sm sticky left-0 ${idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                    {amenity}
                  </td>
                  {compareList.map(community => {
                    const hasAmenity = community.amenities?.some(a => 
                      a.toLowerCase().includes(amenity.toLowerCase())
                    );
                    return (
                      <td key={community.id} className="text-center p-3">
                        {hasAmenity ? (
                          <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              
              {/* View Details Row */}
              <tr>
                <td className="p-3 font-medium sticky left-0 bg-white dark:bg-gray-900">
                  Actions
                </td>
                {compareList.map(community => (
                  <td key={community.id} className="text-center p-3">
                    <Button asChild variant="default" size="sm">
                      <Link href={`/community/${community.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}