import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, MapPin, DollarSign, Home, Users, Calendar } from 'lucide-react';

interface MarketIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityName: string;
  location: string;
  marketPricing: {
    display: string;
    confidence: 'high' | 'medium' | 'low' | 'verified';
    source: string;
    insights?: {
      comparison?: {
        vsStateAverage: string;
        stateAverage: string;
        position: string;
      };
      trend?: {
        direction: 'rising' | 'stable' | 'falling';
        yearOverYear: string;
        forecast: string;
      };
      services?: {
        roomType?: string;
        servicesIncluded?: string[];
        additionalFees?: string[];
      };
      localMarket?: {
        percentile: string;
        countyAverage: string;
        ranking: string;
      };
    };
  } | null;
}

export function MarketIntelligenceModal({ 
  isOpen, 
  onClose, 
  communityName, 
  location,
  marketPricing 
}: MarketIntelligenceModalProps) {
  
  if (!marketPricing) return null;
  
  const getTrendIcon = () => {
    if (!marketPricing.insights?.trend) return <Minus className="h-5 w-5" />;
    
    switch (marketPricing.insights.trend.direction) {
      case 'rising':
        return <TrendingUp className="h-5 w-5 text-red-400" />;
      case 'falling':
        return <TrendingDown className="h-5 w-5 text-green-400" />;
      default:
        return <Minus className="h-5 w-5 text-gray-400" />;
    }
  };
  
  const getConfidenceColor = () => {
    switch (marketPricing.confidence) {
      case 'verified':
        return 'bg-blue-600';
      case 'high':
        return 'bg-purple-600';
      case 'medium':
        return 'bg-purple-700';
      default:
        return 'bg-purple-800';
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-purple-400" />
            Market Intelligence Report
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Comprehensive pricing analysis for {communityName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {/* Current Market Pricing */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">Current Market Estimate</h3>
              <Badge className={`${getConfidenceColor()} text-white`}>
                {marketPricing.confidence === 'verified' ? 'Verified' : `${marketPricing.confidence} Confidence`}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-purple-400">
              {marketPricing.display}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              Source: {marketPricing.source}
            </div>
          </div>
          
          {/* Market Trends */}
          {marketPricing.insights?.trend && (
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                {getTrendIcon()}
                <h3 className="font-semibold text-white">Market Trends</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Year-over-Year Change:</span>
                  <span className={`font-semibold ${
                    marketPricing.insights.trend.direction === 'rising' ? 'text-red-400' :
                    marketPricing.insights.trend.direction === 'falling' ? 'text-green-400' :
                    'text-gray-300'
                  }`}>
                    {marketPricing.insights.trend.yearOverYear}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Trend Direction:</span>
                  <span className="text-white capitalize">{marketPricing.insights.trend.direction}</span>
                </div>
                <div className="text-sm text-gray-400 mt-2 p-2 bg-gray-700 rounded">
                  📊 {marketPricing.insights.trend.forecast}
                </div>
              </div>
            </div>
          )}
          
          {/* State & Local Comparison */}
          {(marketPricing.insights?.comparison || marketPricing.insights?.localMarket) && (
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-5 w-5 text-purple-400" />
                <h3 className="font-semibold text-white">Market Comparison</h3>
              </div>
              <div className="space-y-3">
                {marketPricing.insights.comparison && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">State Average:</span>
                      <span className="text-white font-semibold">{marketPricing.insights.comparison.stateAverage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Position:</span>
                      <span className={`font-semibold ${
                        marketPricing.insights.comparison.position.includes('Below') ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {marketPricing.insights.comparison.vsStateAverage}
                      </span>
                    </div>
                  </div>
                )}
                
                {marketPricing.insights.localMarket && (
                  <div className="border-t border-gray-700 pt-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">County Average:</span>
                      <span className="text-white font-semibold">{marketPricing.insights.localMarket.countyAverage}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Market Percentile:</span>
                      <span className="text-purple-400 font-semibold">{marketPricing.insights.localMarket.percentile}</span>
                    </div>
                    <div className="mt-2">
                      <Badge className="bg-purple-900 text-purple-300">
                        {marketPricing.insights.localMarket.ranking}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* What's Included */}
          {marketPricing.insights?.services && (
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Home className="h-5 w-5 text-purple-400" />
                <h3 className="font-semibold text-white">Typical Services Included</h3>
              </div>
              
              {marketPricing.insights.services.roomType && (
                <div className="mb-3">
                  <span className="text-gray-400">Room Type: </span>
                  <span className="text-white">{marketPricing.insights.services.roomType}</span>
                </div>
              )}
              
              {marketPricing.insights.services.servicesIncluded && (
                <div className="mb-3">
                  <div className="text-gray-400 mb-2">Included Services:</div>
                  <div className="flex flex-wrap gap-2">
                    {marketPricing.insights.services.servicesIncluded.map((service, index) => (
                      <Badge key={index} className="bg-green-900 text-green-300">
                        ✓ {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {marketPricing.insights.services.additionalFees && marketPricing.insights.services.additionalFees.length > 0 && (
                <div>
                  <div className="text-gray-400 mb-2">May Have Additional Fees For:</div>
                  <div className="flex flex-wrap gap-2">
                    {marketPricing.insights.services.additionalFees.map((fee, index) => (
                      <Badge key={index} className="bg-yellow-900 text-yellow-300">
                        + {fee}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Location Info */}
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
          </div>
          
          {/* Disclaimer */}
          <div className="text-xs text-gray-500 p-3 bg-gray-800 rounded-lg">
            <p className="mb-1">📊 <strong>About Market Intelligence:</strong></p>
            <p>Pricing estimates are based on aggregated market data, regional trends, and publicly available information. 
            Actual pricing may vary based on individual needs, room availability, and specific care requirements. 
            We recommend contacting communities directly for personalized quotes.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}