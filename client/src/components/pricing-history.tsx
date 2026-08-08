import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Calendar, History, AlertCircle, CheckCircle, Globe, Lock } from 'lucide-react';
import { format } from 'date-fns';

interface PricingHistoryEntry {
  id: number;
  communityId: number;
  priceType: string;
  priceAmount?: string;
  priceMin?: string;
  priceMax?: string;
  effectiveDate: string;
  endDate?: string;
  notes?: string;
  source: string;
  verificationStatus: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
}

// Task #393: pricing discovered by web intelligence / verification is
// documented here so found rates aren't confined to the intelligence card.
export interface DiscoveredPricingEntry {
  label: string;
  value: string;
  source: string;
}

interface PricingHistoryProps {
  communityId: number;
  communityName: string;
  discoveredPricing?: DiscoveredPricingEntry[];
  /** Login gating for detailed pricing is preserved: values blur until revealed */
  pricingRevealed?: boolean;
  onRevealPricing?: () => void;
}

export function PricingHistory({ communityId, communityName, discoveredPricing = [], pricingRevealed = true, onRevealPricing }: PricingHistoryProps) {
  const { data: historyData, isLoading, error } = useQuery<{ success: boolean; data: PricingHistoryEntry[]; count: number }>({
    queryKey: [`/api/communities/${communityId}/pricing-history`],
    enabled: !!communityId
  });

  const formatPriceType = (type: string) => {
    const typeMap: Record<string, string> = {
      'base': 'Base Price',
      'assisted_living': 'Assisted Living',
      'memory_care': 'Memory Care',
      'independent_living': 'Independent Living',
      'skilled_nursing': 'Skilled Nursing'
    };
    return typeMap[type] || type;
  };

  const formatPrice = (entry: PricingHistoryEntry) => {
    if (entry.priceAmount) {
      return `$${parseFloat(entry.priceAmount).toLocaleString()}/mo`;
    } else if (entry.priceMin && entry.priceMax) {
      return `$${parseFloat(entry.priceMin).toLocaleString()} - $${parseFloat(entry.priceMax).toLocaleString()}/mo`;
    }
    return 'Contact for pricing';
  };

  const getSourceBadge = (source: string) => {
    const sourceConfig: Record<string, { color: string; label: string }> = {
      'community_reported': { color: 'bg-blue-100 text-blue-800', label: 'Community Reported' },
      'hud_verified': { color: 'bg-green-100 text-green-800', label: 'HUD Verified' },
      'government_data': { color: 'bg-purple-100 text-purple-800', label: 'Government Data' },
      'market_intelligence': { color: 'bg-orange-100 text-orange-800', label: 'Market Intelligence' },
      'user_reported': { color: 'bg-gray-100 text-gray-800', label: 'User Reported' }
    };
    const config = sourceConfig[source] || { color: 'bg-gray-100 text-gray-800', label: source };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const calculatePriceChange = (current: PricingHistoryEntry, previous: PricingHistoryEntry) => {
    const currentPrice = parseFloat(current.priceAmount || current.priceMin || '0');
    const previousPrice = parseFloat(previous.priceAmount || previous.priceMin || '0');
    
    if (!currentPrice || !previousPrice) return null;
    
    const change = currentPrice - previousPrice;
    const percentChange = ((change / previousPrice) * 100).toFixed(1);
    
    return {
      amount: change,
      percent: percentChange,
      isIncrease: change > 0
    };
  };

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg font-semibold">Pricing History & Transparency</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg font-semibold">Pricing History & Transparency</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p>Unable to load pricing history at this time</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const history = historyData?.data || [];
  const hasHistory = history.length > 0;

  // Group history by price type
  const historyByType = history.reduce((acc, entry) => {
    if (!acc[entry.priceType]) {
      acc[entry.priceType] = [];
    }
    acc[entry.priceType].push(entry);
    return acc;
  }, {} as Record<string, PricingHistoryEntry[]>);

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg font-semibold">Pricing History & Transparency</CardTitle>
          </div>
          {hasHistory && (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              {history.length} Records Available
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Task #393: rates discovered by web intelligence / verification */}
        {discoveredPricing.length > 0 && (
          <div className="mb-6" data-testid="section-discovered-pricing">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="h-4 w-4 text-indigo-600" />
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                Rates Found Online
              </h4>
              <Badge className="bg-orange-100 text-orange-800">Market Intelligence</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {discoveredPricing.map((entry, idx) => (
                <div key={idx} className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{entry.label}</p>
                  {pricingRevealed ? (
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{entry.value}</p>
                  ) : (
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 blur-sm select-none" aria-hidden="true">
                        {entry.value}
                      </p>
                      {onRevealPricing && (
                        <button
                          type="button"
                          onClick={onRevealPricing}
                          className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                          data-testid="button-reveal-discovered-pricing"
                        >
                          <Lock className="w-3 h-3" />
                          Unlock pricing
                        </button>
                      )}
                    </div>
                  )}
                  <p className="text-[11px] text-gray-500 dark:text-gray-500 mt-1">Source: {entry.source}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Found via live web search — verify current rates directly with the community.
            </p>
          </div>
        )}
        {!hasHistory ? (
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              No pricing history available yet
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Pricing transparency data will appear here once {communityName} provides pricing updates
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(historyByType).map(([priceType, entries]) => (
              <div key={priceType} className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  {formatPriceType(priceType)}
                </h4>
                
                <div className="space-y-3">
                  {entries.map((entry, index) => {
                    const previousEntry = entries[index + 1];
                    const priceChange = previousEntry ? calculatePriceChange(entry, previousEntry) : null;
                    
                    return (
                      <div key={entry.id} className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                              {formatPrice(entry)}
                            </span>
                            {priceChange && (
                              <div className={`flex items-center gap-1 text-sm ${priceChange.isIncrease ? 'text-red-600' : 'text-green-600'}`}>
                                {priceChange.isIncrease ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                <span>{priceChange.percent}%</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Effective: {format(new Date(entry.effectiveDate), 'MMM d, yyyy')}
                              {entry.endDate && ` - ${format(new Date(entry.endDate), 'MMM d, yyyy')}`}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {getSourceBadge(entry.source)}
                            {entry.verificationStatus === 'verified' && (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          
                          {entry.notes && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                              {entry.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
                Pricing history is provided for transparency. Always verify current pricing directly with the community.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}