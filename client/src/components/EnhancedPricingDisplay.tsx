import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Minus, Info, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PricingData {
  basePrice?: number;
  independentLiving?: { min: number; max: number };
  assistedLiving?: { min: number; max: number };
  memoryCare?: { min: number; max: number };
  skilledNursing?: { min: number; max: number };
  confidence: number;
  source: string;
  lastUpdated: string;
  trend?: 'increasing' | 'stable' | 'decreasing';
  percentChange?: number;
}

interface EnhancedPricingDisplayProps {
  communityId: number;
  communityName: string;
  userId?: number;
}

export function EnhancedPricingDisplay({ 
  communityId, 
  communityName,
  userId 
}: EnhancedPricingDisplayProps) {
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/pricing-intelligence/${communityId}`],
    retry: 1,
  });

  const pricingData: PricingData | null = data?.data?.pricing || null;

  const formatPrice = (price: number | undefined) => {
    if (!price) return "Not Available";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatPriceRange = (range: { min: number; max: number } | undefined) => {
    if (!range) return "Contact for pricing";
    return `${formatPrice(range.min)} - ${formatPrice(range.max)}`;
  };

  const getTrendIcon = (trend?: string, percentChange?: number) => {
    if (trend === 'increasing') {
      return <TrendingUp className="w-4 h-4 text-red-500" />;
    } else if (trend === 'decreasing') {
      return <TrendingDown className="w-4 h-4 text-green-500" />;
    } else {
      return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) {
      return <Badge className="bg-green-100 text-green-800">High Confidence</Badge>;
    } else if (confidence >= 60) {
      return <Badge className="bg-yellow-100 text-yellow-800">Medium Confidence</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Low Confidence</Badge>;
    }
  };

  const getSourceDisplay = (source: string) => {
    const sourceMap: Record<string, string> = {
      'official_website': 'Official Website',
      'aplaceformom.com': 'A Place for Mom',
      'caring.com': 'Caring.com',
      'seniorliving.org': 'SeniorLiving.org',
      'senioradvisor.com': 'Senior Advisor',
      'perplexity_search': 'Web Research',
      'estimate': 'Market Estimate'
    };
    return sourceMap[source] || source;
  };

  const handleSetAlert = async (alertType: string, threshold?: number) => {
    if (!userId) {
      toast({
        title: "Login Required",
        description: "Please login to set price alerts",
        variant: "destructive"
      });
      return;
    }

    try {
      await apiRequest('POST', '/api/pricing-alerts', {
        userId,
        communityId,
        alertType,
        threshold
      });

      toast({
        title: "Alert Created",
        description: `You'll be notified when the pricing ${alertType === 'price_drop' ? 'drops' : 'changes'}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create price alert",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Pricing Intelligence...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !pricingData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pricing Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            Pricing information is currently unavailable. Please contact the community directly.
          </p>
        </CardContent>
      </Card>
    );
  }

  const lastUpdatedDate = new Date(pricingData.lastUpdated);
  const timeAgo = Math.floor((Date.now() - lastUpdatedDate.getTime()) / (1000 * 60 * 60));

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Pricing Intelligence</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                {getConfidenceBadge(pricingData.confidence)}
                <Badge variant="outline" className="text-xs">
                  {getSourceDisplay(pricingData.source)}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getTrendIcon(pricingData.trend, pricingData.percentChange)}
              {pricingData.percentChange && pricingData.percentChange !== 0 && (
                <span className={`text-sm font-medium ${
                  pricingData.percentChange > 0 ? 'text-red-500' : 'text-green-500'
                }`}>
                  {pricingData.percentChange > 0 ? '+' : ''}{pricingData.percentChange}%
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Base Price */}
          {pricingData.basePrice && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">Average Monthly Cost</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatPrice(pricingData.basePrice)}
                </span>
              </div>
            </div>
          )}

          {/* Care Level Pricing */}
          <div className="space-y-3">
            {pricingData.independentLiving && (
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <span className="text-sm font-medium">Independent Living</span>
                <span className="text-sm font-semibold">
                  {formatPriceRange(pricingData.independentLiving)}
                </span>
              </div>
            )}
            
            {pricingData.assistedLiving && (
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <span className="text-sm font-medium">Assisted Living</span>
                <span className="text-sm font-semibold">
                  {formatPriceRange(pricingData.assistedLiving)}
                </span>
              </div>
            )}
            
            {pricingData.memoryCare && (
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <span className="text-sm font-medium">Memory Care</span>
                <span className="text-sm font-semibold">
                  {formatPriceRange(pricingData.memoryCare)}
                </span>
              </div>
            )}
            
            {pricingData.skilledNursing && (
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <span className="text-sm font-medium">Skilled Nursing</span>
                <span className="text-sm font-semibold">
                  {formatPriceRange(pricingData.skilledNursing)}
                </span>
              </div>
            )}
          </div>

          {/* Confidence Meter */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Data Confidence</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">
                    Confidence score based on data source reliability and completeness
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Progress value={pricingData.confidence} className="h-2" />
          </div>

          {/* Price Alert Button */}
          {userId && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => handleSetAlert('price_drop')}
            >
              <Bell className="w-4 h-4 mr-2" />
              Set Price Alert
            </Button>
          )}

          {/* Last Updated */}
          <div className="text-xs text-gray-500 text-center">
            Last updated: {timeAgo < 1 ? 'Just now' : timeAgo < 24 ? `${timeAgo} hours ago` : `${Math.floor(timeAgo / 24)} days ago`}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}