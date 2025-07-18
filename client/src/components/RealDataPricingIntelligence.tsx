import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Database, TrendingUp, MapPin, DollarSign } from 'lucide-react';

interface RealDataPricingIntelligenceProps {
  className?: string;
}

export function RealDataPricingIntelligence({ className = '' }: RealDataPricingIntelligenceProps) {
  const { data: analysis, isLoading: analysisLoading } = useQuery({
    queryKey: ['/api/real-data/analysis'],
    staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
    retry: 2,
  });

  const { data: marketData, isLoading: marketLoading } = useQuery({
    queryKey: ['/api/real-data/market-data'],
    staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
    retry: 2,
  });

  const { data: combinedIntelligence, isLoading: combinedLoading } = useQuery({
    queryKey: ['/api/real-data/combined-intelligence'],
    staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
    retry: 2,
  });

  if (analysisLoading || marketLoading || combinedLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-blue-600">Analyzing 25,782 communities...</span>
      </div>
    );
  }

  if (!analysis || !marketData || !combinedIntelligence) {
    return (
      <div className={`p-8 text-center ${className}`}>
        <p className="text-gray-500">Unable to load real pricing data</p>
      </div>
    );
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A';
    return `$${amount.toLocaleString()}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Real Pricing Intelligence
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Authentic data from {analysis.totalCommunities.toLocaleString()} verified communities
        </p>
      </div>

      {/* Database Analysis */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-blue-600" />
            <span>Database Analysis</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
              {new Date(analysis.lastAnalyzed).toLocaleDateString()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {analysis.totalCommunities.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Communities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatPercentage(analysis.pricingAnalysis.pricingCoverage)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Have Pricing Data</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(analysis.pricingAnalysis.averagePrice)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Average Price</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Care Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Care Type Distribution</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.careTypeDistribution.slice(0, 5).map((careType, index) => (
              <div key={careType.careType} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-blue-500' : 
                    index === 1 ? 'bg-green-500' : 
                    index === 2 ? 'bg-purple-500' : 
                    index === 3 ? 'bg-orange-500' : 'bg-gray-500'
                  }`}></div>
                  <span className="font-medium">{careType.careType}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{careType.count.toLocaleString()}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {formatPercentage(careType.percentage)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top States */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-red-600" />
            <span>Top States by Coverage</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.stateBreakdown.slice(0, 8).map((state, index) => (
              <div key={state.state} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-red-500' : 
                    index === 1 ? 'bg-orange-500' : 
                    index === 2 ? 'bg-yellow-500' : 
                    index === 3 ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  <span className="font-medium">{state.state}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{state.communityCount.toLocaleString()}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {formatCurrency(state.avgPricing)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Quality Assessment */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span>Data Quality Assessment</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Database Coverage</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Communities:</span>
                  <span className="font-bold">{combinedIntelligence.combinedInsights.dataQuality.totalCommunities.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pricing Coverage:</span>
                  <span className="font-bold">{formatPercentage(combinedIntelligence.combinedInsights.dataQuality.pricingCoverage)}</span>
                </div>
                <div className="flex justify-between">
                  <span>External Validation:</span>
                  <span className="font-bold text-green-600">
                    {combinedIntelligence.combinedInsights.dataQuality.hasExternalValidation ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Pricing Intelligence</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Database Average:</span>
                  <span className="font-bold">{formatCurrency(combinedIntelligence.combinedInsights.pricingIntelligence.databaseAverage)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Market Average:</span>
                  <span className="font-bold">{formatCurrency(combinedIntelligence.combinedInsights.pricingIntelligence.marketAverage)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Confidence:</span>
                  <Badge variant={
                    combinedIntelligence.combinedInsights.pricingIntelligence.confidence === 'high' ? 'default' :
                    combinedIntelligence.combinedInsights.pricingIntelligence.confidence === 'medium' ? 'secondary' : 'destructive'
                  }>
                    {combinedIntelligence.combinedInsights.pricingIntelligence.confidence}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Source Attribution */}
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              <strong>Data Sources:</strong> {marketData.source}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Last updated: {new Date(marketData.lastUpdated).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}