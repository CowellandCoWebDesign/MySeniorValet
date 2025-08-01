import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  MapPin, 
  Shield, 
  Clock,
  Heart,
  Home,
  Star,
  Building
} from 'lucide-react';

interface PlatformStats {
  totalCommunities: number;
  statesCovered: number;
  countiesCovered: number;
  citiesCovered: number;
  totalAvailableUnits: number;
  totalUnitCapacity: number;
  totalResidentCapacity: number;
  withPricing: number;
  withPhotos: number;
  withAvailability: number;
  governmentVerified: number;
  veteranFriendly: number;
  acceptsHudVouchers: number;
  careTypeBreakdown: Array<{
    careType: string;
    count: number;
    percentage: number;
  }>;
  topStates: Array<{
    state: string;
    count: number;
    percentage: number;
  }>;
  availabilityMetrics: {
    totalUnitsAvailable: number;
    totalUnitsOccupied: number;
    occupancyRate: number;
    communitiesWithAvailability: number;
    communitiesWithCapacityData: number;
    averageAvailableUnitsPerCommunity: number;
  };
  dataQualityMetrics: {
    pricingCoverage: number;
    photoCoverage: number;
    contactCoverage: number;
    websiteCoverage: number;
  };
}

export function PricingIntelligenceWidget() {
  const { data: stats, isLoading, error } = useQuery<PlatformStats>({
    queryKey: ['/api/platform/stats'],
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
    staleTime: 15 * 60 * 1000, // Consider data stale after 15 minutes
  });

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return null;
  }

  const getCareTypeIcon = (careType: string) => {
    switch (careType) {
      case 'Assisted Living':
        return <Users className="w-5 h-5 text-green-600" />;
      case 'Memory Care':
        return <Shield className="w-5 h-5 text-purple-600" />;
      case 'Independent Living':
        return <Home className="w-5 h-5 text-orange-600" />;
      case 'Skilled Nursing':
        return <Heart className="w-5 h-5 text-red-600" />;
      default:
        return <Building className="w-5 h-5 text-blue-600" />;
    }
  };

  const getCareTypePricing = (careType: string) => {
    const pricingMap: Record<string, { min: number; max: number; description: string }> = {
      'Assisted Living': { min: 4200, max: 7000, description: 'Most common option with personal care' },
      'Memory Care': { min: 6500, max: 9500, description: 'Specialized secure environment' },
      'Independent Living': { min: 2800, max: 4500, description: 'Active lifestyle communities' },
      'Skilled Nursing': { min: 8000, max: 12000, description: '24/7 medical care' }
    };
    return pricingMap[careType] || { min: 3000, max: 6000, description: 'Senior living community' };
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl font-bold">
          <DollarSign className="w-6 h-6 text-blue-600" />
          Live Pricing Intelligence
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Based on real-time data from {stats.totalCommunities.toLocaleString()} verified communities
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pricing Coverage Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Pricing Coverage</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {stats.dataQualityMetrics.pricingCoverage}%
            </div>
            <p className="text-xs text-gray-500">
              {stats.withPricing.toLocaleString()} communities with live pricing
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Geographic Coverage</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {stats.statesCovered}
            </div>
            <p className="text-xs text-gray-500">
              States • {stats.countiesCovered.toLocaleString()} counties
            </p>
          </div>
        </div>

        {/* Care Type Breakdown */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-600" />
            Care Type Distribution & Pricing
            <span className="text-xs text-amber-600 font-normal ml-auto">
              ⏳ Awaiting community claims for real-time pricing
            </span>
          </h3>
          
          {stats.careTypeBreakdown.map((careType) => {
            const pricing = getCareTypePricing(careType.careType);
            return (
              <div key={careType.careType} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getCareTypeIcon(careType.careType)}
                    <span className="font-medium text-sm">{careType.careType}</span>
                    <Badge className="bg-gray-100 text-gray-700 text-xs">
                      {careType.percentage}% of communities
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-blue-600">
                      ${pricing.min.toLocaleString()} - ${pricing.max.toLocaleString()}/month
                    </div>
                  </div>
                </div>
                <Progress value={careType.percentage} className="h-2 mb-1" />
                <p className="text-xs text-gray-500">{pricing.description}</p>
                <div className="text-xs text-gray-400 mt-1">
                  {careType.count.toLocaleString()} communities available
                </div>
              </div>
            );
          })}
        </div>

        {/* Availability Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-green-600" />
            Live Availability
            <span className="text-xs text-amber-600 font-normal ml-auto">
              ⏳ Awaiting community claims for real-time updates
            </span>
          </h3>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {stats.availabilityMetrics.totalUnitsAvailable.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500">Units Available Now</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {stats.availabilityMetrics.occupancyRate}%
              </div>
              <p className="text-xs text-gray-500">Average Occupancy</p>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Communities with live availability:
              </span>
              <span className="font-medium">
                {stats.availabilityMetrics.communitiesWithAvailability.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-600 dark:text-gray-400">
                Avg. available units per community:
              </span>
              <span className="font-medium">
                {stats.availabilityMetrics.averageAvailableUnitsPerCommunity}
              </span>
            </div>
          </div>
        </div>

        {/* Data Quality Indicator */}
        <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="font-medium text-sm">Data Quality Score</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span>Pricing:</span>
              <span className="font-medium text-green-600">
                {stats.dataQualityMetrics.pricingCoverage}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Photos:</span>
              <span className="font-medium text-blue-600">
                {stats.dataQualityMetrics.photoCoverage}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Contact Info:</span>
              <span className="font-medium text-purple-600">
                {stats.dataQualityMetrics.contactCoverage}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Websites:</span>
              <span className="font-medium text-orange-600">
                {stats.dataQualityMetrics.websiteCoverage}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}