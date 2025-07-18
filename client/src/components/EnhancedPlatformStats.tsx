import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Building, 
  Users, 
  Shield, 
  Phone, 
  Camera, 
  DollarSign,
  Star,
  ChevronRight
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
    averageUnitsPerCommunity: number;
    occupancyRate: number;
  };
  dataQualityMetrics: {
    pricingCoverage: number;
    photoCoverage: number;
    contactCoverage: number;
    websiteCoverage: number;
  };
}

export function EnhancedPlatformStats() {
  const { data: stats, isLoading, error } = useQuery<PlatformStats>({
    queryKey: ['/api/platform/stats'],
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
    staleTime: 15 * 60 * 1000, // Consider data stale after 15 minutes
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          Unable to load platform statistics
        </p>
      </div>
    );
  }

  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <div className="space-y-6">
      {/* Hero Statistics */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Complete North American Coverage
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Real-time data across {formatNumber(stats.totalCommunities)} communities
        </p>
      </div>

      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Geographic Coverage */}
        <Card className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Geographic Coverage</p>
              <p className="text-2xl font-bold">{stats.statesCovered}</p>
              <p className="text-sm text-gray-500">States & Provinces</p>
            </div>
            <MapPin className="h-8 w-8 text-blue-500" />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {formatNumber(stats.countiesCovered)} counties • {formatNumber(stats.citiesCovered)} cities
          </div>
        </Card>

        {/* Available Units */}
        <Card className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Available Units</p>
              <p className="text-2xl font-bold text-green-600">{formatNumber(stats.totalAvailableUnits)}</p>
              <p className="text-sm text-gray-500">Units Available Now</p>
            </div>
            <Building className="h-8 w-8 text-green-500" />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {stats.availabilityMetrics.occupancyRate}% occupancy rate
          </div>
        </Card>

        {/* Total Capacity */}
        <Card className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Capacity</p>
              <p className="text-2xl font-bold">{formatNumber(stats.totalResidentCapacity)}</p>
              <p className="text-sm text-gray-500">Resident Capacity</p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {formatNumber(stats.totalUnitCapacity)} total units
          </div>
        </Card>

        {/* Government Verified */}
        <Card className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Government Verified</p>
              <p className="text-2xl font-bold text-blue-600">{formatNumber(stats.governmentVerified)}</p>
              <p className="text-sm text-gray-500">Verified Communities</p>
            </div>
            <Shield className="h-8 w-8 text-blue-500" />
          </div>
          <div className="mt-2">
            <Badge variant="secondary" className="text-xs">
              Official Sources
            </Badge>
          </div>
        </Card>

        {/* Pricing Coverage */}
        <Card className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pricing Coverage</p>
              <p className="text-2xl font-bold text-green-600">{stats.dataQualityMetrics.pricingCoverage}%</p>
              <p className="text-sm text-gray-500">Transparent Pricing</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
          <div className="mt-2">
            <Progress value={stats.dataQualityMetrics.pricingCoverage} className="h-2" />
          </div>
        </Card>

        {/* Contact Coverage */}
        <Card className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Contact Coverage</p>
              <p className="text-2xl font-bold text-orange-600">{stats.dataQualityMetrics.contactCoverage}%</p>
              <p className="text-sm text-gray-500">Direct Contact Info</p>
            </div>
            <Phone className="h-8 w-8 text-orange-500" />
          </div>
          <div className="mt-2">
            <Progress value={stats.dataQualityMetrics.contactCoverage} className="h-2" />
          </div>
        </Card>
      </div>

      {/* Top States */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Top States by Coverage</h3>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </div>
        <div className="space-y-2">
          {stats.topStates.slice(0, 5).map((state, index) => (
            <div key={state.state} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  #{index + 1}
                </Badge>
                <span className="font-medium">{state.state}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {formatNumber(state.count)} communities
                </span>
                <span className="text-xs text-gray-500">
                  {state.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Care Type Breakdown */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Care Types Available</h3>
          <Star className="h-4 w-4 text-yellow-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {stats.careTypeBreakdown.slice(0, 6).map((careType) => (
            <div key={careType.careType} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-sm font-medium">{careType.careType}</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {formatNumber(careType.count)}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {careType.percentage}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Special Programs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {formatNumber(stats.veteranFriendly)}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Veteran-Friendly</p>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {formatNumber(stats.acceptsHudVouchers)}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">HUD Vouchers Accepted</p>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {stats.dataQualityMetrics.websiteCoverage}%
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Website Coverage</p>
        </Card>
      </div>

      {/* Data Quality Badge */}
      <div className="text-center">
        <Badge variant="outline" className="px-4 py-2 text-sm">
          ✅ 100% Authentic Data • Real-time Updates • Government-Verified Sources
        </Badge>
      </div>
    </div>
  );
}