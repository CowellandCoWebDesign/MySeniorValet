import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Shield, TrendingUp, DollarSign, Building, FileText, Users, Flag, AlertTriangle, Home } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PricingSource {
  source: string;
  price?: number;
  priceRange?: {
    min: number;
    max: number;
    average?: number;
  };
  ratePerDay?: number;
  pricingText?: string;
  verified: boolean;
  lastUpdated: string;
  notes?: string;
}

interface AuthenticPricingData {
  communityId: number;
  communityName: string;
  location: string;
  totalSources: number;
  sources: PricingSource[];
  hudVerified: boolean;
  hudPrice?: number;
  confidenceScore: number;
  lastChecked: string;
}

export function AuthenticPricingDisplay({ communityId }: { communityId: number }) {
  const { data, isLoading, error } = useQuery<AuthenticPricingData>({
    queryKey: ['/api/authentic-pricing/community', communityId, 'all-sources'],
    enabled: !!communityId
  });

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    // Don't show any error message when pricing data is unavailable
    // The pricing is already shown above in the community details
    return null;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getSourceIcon = (source: string) => {
    if (source.includes('HUD')) return <Building className="h-4 w-4" />;
    if (source.includes('Medicare') || source.includes('CMS')) return <Shield className="h-4 w-4" />;
    if (source.includes('Veterans')) return <Flag className="h-4 w-4" />;
    if (source.includes('State') || source.includes('Licensing')) return <FileText className="h-4 w-4" />;
    if (source.includes('Family') || source.includes('Community')) return <Users className="h-4 w-4" />;
    return <DollarSign className="h-4 w-4" />;
  };

  const getSourceColor = (source: string) => {
    if (source.includes('HUD')) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    if (source.includes('Medicare') || source.includes('CMS')) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (source.includes('Veterans')) return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    if (source.includes('State')) return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Authentic Pricing Information
            </CardTitle>
            <CardDescription>
              Real pricing from {data.totalSources} verified sources • NO aggregator sites used
            </CardDescription>
          </div>
          {data.hudVerified && (
            <Badge className="bg-blue-600 text-white">
              <CheckCircle className="h-3 w-3 mr-1" />
              HUD Verified
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sources" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sources">Pricing Sources</TabsTrigger>
            <TabsTrigger value="confidence">Confidence Report</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sources" className="space-y-3 mt-4">
            {data.sources.length === 0 ? (
              <div className="space-y-3">
                <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800 dark:text-orange-200">
                    Live pricing temporarily unavailable. External APIs experiencing issues.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2 opacity-60">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Available Authentic Sources:</p>
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Building className="h-4 w-4" />
                      <span>HUD Database - Government verified affordable housing</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Shield className="h-4 w-4" />
                      <span>Medicare/CMS Nursing Home Compare</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <FileText className="h-4 w-4" />
                      <span>State Licensing Board APIs</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Flag className="h-4 w-4" />
                      <span>Veterans Affairs Pricing</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <DollarSign className="h-4 w-4" />
                      <span>State Medicaid Rates</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Home className="h-4 w-4" />
                      <span>Direct Community Websites</span>
                    </div>
                  </div>
                </div>
                
                <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    <strong>NO aggregator sites used</strong> - We never use A Place for Mom, Caring.com, Seniorly, or similar aggregators
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              data.sources.map((source, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getSourceIcon(source.source)}
                      <span className="font-medium">{source.source}</span>
                      {source.verified && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <Badge variant="secondary" className={getSourceColor(source.source)}>
                      {source.verified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                  
                  <div className="text-2xl font-semibold">
                    {source.price && formatPrice(source.price)}
                    {source.priceRange && (
                      <span>
                        {formatPrice(source.priceRange.min)} - {formatPrice(source.priceRange.max)}
                        {source.priceRange.average && (
                          <span className="text-sm text-gray-600 ml-2">
                            (avg: {formatPrice(source.priceRange.average)})
                          </span>
                        )}
                      </span>
                    )}
                    {source.ratePerDay && (
                      <span>{formatPrice(source.ratePerDay)}/day</span>
                    )}
                    {source.pricingText && (
                      <span className="text-lg">{source.pricingText}</span>
                    )}
                  </div>
                  
                  {source.notes && (
                    <p className="text-sm text-gray-600">{source.notes}</p>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    Last updated: {new Date(source.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="confidence" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-semibold">Pricing Confidence Score</p>
                    <p className="text-sm text-gray-600">Based on source verification and recency</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {data.confidenceScore}%
                </div>
              </div>
              
              <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                <Shield className="h-4 w-4" />
                <AlertTitle>100% Authentic Sources</AlertTitle>
                <AlertDescription>
                  We NEVER use aggregator sites like A Place for Mom, Caring.com, Seniorly, or Senior Advisor. 
                  All pricing comes directly from government databases, state licensing boards, and verified community sources.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 border rounded-lg">
                  <p className="text-sm font-medium text-gray-600">Government Sources</p>
                  <p className="text-lg font-semibold">HUD, Medicare, VA, CMS</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-sm font-medium text-gray-600">Direct Sources</p>
                  <p className="text-lg font-semibold">Community websites, State data</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}