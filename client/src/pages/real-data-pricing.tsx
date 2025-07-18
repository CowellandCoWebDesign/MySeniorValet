import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RealDataPricingIntelligence } from '@/components/RealDataPricingIntelligence';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Database, 
  RefreshCw, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft,
  Play,
  BarChart3
} from 'lucide-react';
import { Link } from 'wouter';

export default function RealDataPricing() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  // Get pricing statistics
  const { data: pricingStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/real-data/pricing-stats'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Update all pricing mutation
  const updateAllPricing = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/real-data/update-all-pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to update pricing');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/real-data/pricing-stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/real-data/analysis'] });
      setIsUpdating(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update pricing",
        variant: "destructive",
      });
      setIsUpdating(false);
    },
  });

  const handleUpdatePricing = async () => {
    setIsUpdating(true);
    updateAllPricing.mutate();
  };

  const formatNumber = (num: number) => num.toLocaleString();
  const formatPercentage = (num: number, total: number) => {
    return total > 0 ? `${((num / total) * 100).toFixed(1)}%` : '0%';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Real Data Pricing Intelligence
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Authentic pricing data from 25,782+ verified communities
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                No Hardcoded Estimates
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Database className="h-3 w-3 mr-1" />
                Real Data Only
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Alert Banner */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                    Real Data Pricing System Active
                  </h3>
                  <p className="text-blue-700 dark:text-blue-200 mt-1">
                    All pricing data comes from authentic sources: database analysis of 25,782 communities 
                    + external market research from Genworth, CMS, and AARP. No hardcoded estimates.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Statistics */}
          {pricingStats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  <span>Pricing Data Coverage</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {formatNumber(pricingStats.totalCommunities)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Communities</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {formatNumber(pricingStats.withRealPricing)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">With Real Pricing</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {formatPercentage(pricingStats.withRealPricing, pricingStats.totalCommunities)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Coverage</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {Object.keys(pricingStats.byState).length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">States Covered</div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Real Data Coverage
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatPercentage(pricingStats.withRealPricing, pricingStats.totalCommunities)}
                    </span>
                  </div>
                  <Progress 
                    value={(pricingStats.withRealPricing / pricingStats.totalCommunities) * 100} 
                    className="h-2"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Data Sources */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Data Sources</h4>
                    <div className="space-y-2">
                      {Object.entries(pricingStats.byDataSource).map(([source, count]) => (
                        <div key={source} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <span className="text-sm font-medium capitalize">
                            {source.replace('_', ' ')}
                          </span>
                          <Badge variant="secondary">{formatNumber(count as number)}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Confidence Levels */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Confidence Levels</h4>
                    <div className="space-y-2">
                      {Object.entries(pricingStats.byConfidence).map(([confidence, count]) => (
                        <div key={confidence} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <span className="text-sm font-medium capitalize">{confidence}</span>
                          <Badge variant={
                            confidence === 'high' ? 'default' :
                            confidence === 'medium' ? 'secondary' : 'outline'
                          }>
                            {formatNumber(count as number)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Update Pricing Control */}
          <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <RefreshCw className="h-5 w-5 text-orange-600" />
                <span>Update All Pricing</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Update all communities with the latest real pricing data from database analysis 
                  and external market research sources.
                </p>
                
                <div className="flex items-center space-x-4">
                  <Button 
                    onClick={handleUpdatePricing}
                    disabled={isUpdating || updateAllPricing.isPending}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {isUpdating || updateAllPricing.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Update All Pricing
                      </>
                    )}
                  </Button>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    This will analyze all {formatNumber(pricingStats?.totalCommunities || 0)} communities
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Real Data Pricing Intelligence Component */}
          <RealDataPricingIntelligence />
        </div>
      </div>
    </div>
  );
}