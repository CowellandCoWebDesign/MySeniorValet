import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Globe, ExternalLink, RefreshCw, CheckCircle, Info, Clock, 
  MapPin, DollarSign, Users, Building, Shield, TrendingUp,
  Star, AlertCircle, Sparkles, Calendar, Link as LinkIcon, Database,
  Activity, Award, Home, Heart, Brain, Phone, CheckCircle2, XCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from "@/lib/utils";

interface PerplexityResponse {
  content: string;
  citations?: string[];
  images?: Array<{
    image_url: string;
    origin_url: string;
    height?: number;
    width?: number;
  }>;
  search_results?: Array<{
    title: string;
    url: string;
    date?: string;
    last_updated?: string;
  }>;
  usage?: {
    total_tokens: number;
    cost?: {
      total_cost: number;
    };
  };
  verified?: boolean;
  identityVerified?: boolean;
}

interface LiveWebIntelligenceProps {
  communityName: string;
  city: string;
  state: string;
  address?: string; // Exact address from database for verification
  databasePhone?: string; // Phone from database
  marketAnalysisData?: any; // Data from market analysis including found websites
  onDataUpdate?: (data: any) => void;
  onPhotosUpdate?: (photos: string[]) => void;
}

export function LiveWebIntelligence({ 
  communityName, 
  city, 
  state,
  address,
  databasePhone,
  marketAnalysisData,
  onDataUpdate,
  onPhotosUpdate 
}: LiveWebIntelligenceProps) {
  const [isExpanded, setIsExpanded] = useState(true); // Auto-expand intelligence report
  const [extractedData, setExtractedData] = useState<any>(null);
  const [intelligenceData, setIntelligenceData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [addressMismatch, setAddressMismatch] = useState(false);

  // Extract website from market analysis data if available
  const extractWebsiteFromMarketData = (marketData: any): string | null => {
    if (!marketData) return null;
    
    // Look for website URLs in the market analysis response
    const content = marketData.insights?.join(' ') || marketData.content || '';
    const urlPattern = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9\-]+(?:\.[a-zA-Z]{2,})+)/g;
    const urls = content.match(urlPattern);
    
    if (urls && urls.length > 0) {
      // Filter out directory sites
      const directorySites = [
        'aplaceformom', 'caring.com', 'seniorly', 'assistedliving.org', 'senioradvisor',
        'seniorhousing.net', 'medicare.gov', 'google.com', 'facebook.com', 'yelp.com'
      ];
      
      const officialUrls = urls.filter((url: string) => {
        const domain = url.toLowerCase();
        return !directorySites.some(site => domain.includes(site));
      });
      
      if (officialUrls.length > 0) {
        return officialUrls[0];
      }
    }
    
    return null;
  };

  const websiteFromMarketData = extractWebsiteFromMarketData(marketAnalysisData);

  // Fetch live data from Perplexity with exact address for verification
  const { data: webData, isLoading, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['/api/communities/web-intelligence', communityName, city, state, address, websiteFromMarketData],
    queryFn: async () => {
      // Include exact address in the query for more precise results
      const searchQuery = address 
        ? `"${communityName}" "${address}" ${city} ${state} senior living`
        : `"${communityName}" ${city} ${state} senior living`;
        
      const response = await fetch('/api/communities/web-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communityName,
          city,
          state,
          address, // Pass address for verification
          query: searchQuery,
          website: websiteFromMarketData, // Pass website found from market analysis
          marketAnalysisData // Pass the full market analysis data
        })
      });
      
      if (!response.ok) throw new Error('Failed to fetch web intelligence');
      return response.json();
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    retry: 1,
    enabled: !!marketAnalysisData // Only run when market analysis data is available
  });

  // Extract structured data from the response and verify address matches
  useEffect(() => {
    if (webData?.content) {
      const extracted = extractStructuredData(webData.content);
      setExtractedData(extracted);
      setIntelligenceData(webData); // Set the intelligence data from backend
      
      // Verify if extracted addresses match our database address
      if (address && extracted.addresses && extracted.addresses.length > 0) {
        const normalizeAddress = (addr: string) => {
          return addr.toLowerCase().replace(/[.,]/g, '').trim();
        };
        
        const ourAddress = normalizeAddress(address);
        const foundMatchingAddress = extracted.addresses.some((foundAddr: string) => {
          const normalized = normalizeAddress(foundAddr);
          // Check if the street number and street name match
          const ourStreetNum = ourAddress.match(/^\d+/)?.[0];
          const foundStreetNum = normalized.match(/^\d+/)?.[0];
          
          if (ourStreetNum && foundStreetNum && ourStreetNum !== foundStreetNum) {
            return false; // Different street numbers mean different communities
          }
          
          // Check if key parts of the address match
          return normalized.includes(ourStreetNum || '') && 
                 ourAddress.split(' ').some(part => part.length > 3 && normalized.includes(part));
        });
        
        setAddressMismatch(!foundMatchingAddress);
        
        // If address doesn't match, mark as low confidence
        if (!foundMatchingAddress) {
          console.warn(`Address mismatch detected! Database: "${address}" | Found: "${extracted.addresses.join(', ')}"`);
        }
      }
      
      // Notify parent component of new data (optional callback)
      if (onDataUpdate) {
        // Merge pricing from backend response with extracted pricing
        const mergedPricing = webData.pricing || extracted.pricing;
        
        onDataUpdate({
          ...extracted,
          pricing: mergedPricing, // Include pricing from backend response
          citations: webData.citations,
          images: webData.images || [],
          verified: webData.verified && !addressMismatch,
          identityVerified: webData.identityVerified && !addressMismatch,
          addressMismatch,
          lastUpdated: new Date().toISOString()
        });
      }
    }
  }, [webData, onDataUpdate, address, addressMismatch]);

  // Photos now stay in LiveWebIntelligence section only - no hero carousel integration

  // Calculate data freshness
  const getFreshnessInfo = () => {
    if (!webData?.search_results?.[0]?.last_updated) {
      return { label: 'Live Data', color: 'text-green-600', icon: Activity };
    }
    
    const lastUpdate = new Date(webData.search_results[0].last_updated);
    const daysSince = Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSince < 7) {
      return { label: 'Very Fresh', color: 'text-green-600', icon: CheckCircle };
    } else if (daysSince < 30) {
      return { label: 'Recent', color: 'text-blue-600', icon: Clock };
    } else if (daysSince < 90) {
      return { label: 'Moderate', color: 'text-yellow-600', icon: Info };
    } else {
      return { label: 'Needs Update', color: 'text-orange-600', icon: AlertCircle };
    }
  };

  const freshness = getFreshnessInfo();

  // Calculate trust score based on citations and address match
  const getTrustScore = () => {
    if (!webData?.citations) return 0;
    const citationCount = webData.citations.length;
    
    let baseScore = 50;
    if (citationCount >= 5) baseScore = 95;
    else if (citationCount >= 3) baseScore = 85;
    else if (citationCount >= 2) baseScore = 75;
    else if (citationCount >= 1) baseScore = 65;
    
    // Reduce trust score significantly if address doesn't match
    if (addressMismatch) {
      return Math.max(20, baseScore - 50); // Cap at 45% max when mismatch detected
    }
    
    return baseScore;
  };

  const trustScore = getTrustScore();

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="w-5 h-5 mr-2 animate-spin" />
            Gathering Live Intelligence...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !webData) {
    return null; // Gracefully fail without showing error
  }

  return (
    <div className="space-y-4">
      {/* Main Intelligence Card */}
      <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center">
              <Globe className="w-6 h-6 mr-2 text-blue-600" />
              Live Web Intelligence
              <Badge variant="secondary" className="ml-2">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={cn("flex items-center", freshness.color)}>
                <freshness.icon className="w-3 h-3 mr-1" />
                {freshness.label}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                className="text-blue-600"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            Real-time information from {webData?.citations?.length || 0} verified sources
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Address Mismatch Warning */}
          {addressMismatch && extractedData?.addresses && (
            <Alert className="border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <AlertDescription>
                <strong className="text-yellow-800 dark:text-yellow-200">⚠️ Address Verification Warning</strong>
                <p className="mt-2 text-sm">
                  The information below may be for a different community. 
                </p>
                <p className="text-xs mt-1">
                  <strong>Our Database:</strong> {address}
                  <br />
                  <strong>Information Found For:</strong> {extractedData.addresses[0]}
                </p>
                <p className="text-xs mt-2 text-yellow-700 dark:text-yellow-300">
                  Please verify details directly with the community or use the contact information from our database.
                </p>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Trust & Freshness Indicators */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Trust Score</span>
                <Shield className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                {trustScore}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Based on {webData?.citations?.length || 0} sources
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Last Verified</span>
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-lg font-bold text-blue-700 dark:text-blue-400">
                {formatDistanceToNow(dataUpdatedAt, { addSuffix: true })}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Live data refresh
              </div>
            </div>
          </div>

          {/* Official Website and Contact Info Quick Access */}
          {(extractedData?.officialWebsite || extractedData?.phoneNumbers?.length > 0 || databasePhone) && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
              <div className="flex flex-wrap items-center gap-4">
                {extractedData?.officialWebsite && (
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => window.open(extractedData.officialWebsite, '_blank')}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Visit Official Website
                    <ExternalLink className="w-3 h-3 ml-2" />
                  </Button>
                )}
                {(databasePhone || extractedData?.phoneNumbers?.length > 0) && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <div className="flex flex-col">
                      {databasePhone && (
                        <a 
                          href={`tel:${databasePhone}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          {databasePhone}
                          <Badge variant="outline" className="ml-2 text-xs">Primary</Badge>
                        </a>
                      )}
                      {extractedData?.phoneNumbers?.map((phone: string, idx: number) => (
                        phone !== databasePhone && (
                          <a 
                            key={idx}
                            href={`tel:${phone}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                          >
                            {phone}
                            <Badge variant="outline" className="ml-2 text-xs">Web</Badge>
                          </a>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Extracted Key Information with Tabs */}
          {extractedData && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                {/* Addresses Found */}
                {extractedData.addresses?.length > 0 && (
                  <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <AlertDescription>
                      <strong>Verified Addresses:</strong>
                      <ul className="mt-2 space-y-1">
                        {extractedData.addresses.map((addr: string, idx: number) => (
                          <li key={idx} className="text-sm">{addr}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Care Types */}
                {extractedData.careTypes?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Care Types Offered:</p>
                    <div className="flex flex-wrap gap-2">
                      {extractedData.careTypes.map((type: string, idx: number) => (
                        <Badge key={idx} variant="secondary">
                          <Heart className="w-3 h-3 mr-1" />
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chain Information */}
                {extractedData.chainName && (
                  <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-900/20">
                    <Building className="w-4 h-4 text-purple-600" />
                    <AlertDescription>
                      <strong>Part of {extractedData.chainName}</strong>
                      {extractedData.relatedCommunities?.length > 0 && (
                        <p className="mt-1 text-sm">
                          {extractedData.relatedCommunities.length} other locations in chain
                        </p>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="services" className="space-y-4 mt-4">
                {extractedData.services?.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {extractedData.services.map((service: string, idx: number) => (
                      <div key={idx} className="flex items-center text-sm">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-600" />
                        {service}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No specific services information found. Contact community for details.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="amenities" className="space-y-4 mt-4">
                {extractedData.amenities?.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {extractedData.amenities.map((amenity: string, idx: number) => (
                      <div key={idx} className="flex items-center text-sm">
                        <Star className="w-3 h-3 mr-2 text-yellow-600" />
                        {amenity}
                      </div>
                    ))}
                  </div>
                ) : extractedData.features?.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {extractedData.features.map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-center text-sm">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-600" />
                        {feature}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No specific amenities information found. Contact community for details.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="pricing" className="space-y-4 mt-4">
                {(intelligenceData?.pricing || extractedData.pricing) ? (
                  <div className="space-y-4">
                    {/* Main pricing display from backend or extracted data */}
                    {(intelligenceData?.pricing?.formatted || (extractedData.pricing?.min && extractedData.pricing?.max)) && (
                      <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-900/20">
                        <DollarSign className="w-5 h-5 text-purple-600" />
                        <AlertDescription>
                          <strong className="text-lg">Live Pricing Range</strong>
                          {intelligenceData?.pricing?.formatted ? (
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                              {intelligenceData.pricing.formatted}
                            </p>
                          ) : (
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                              ${extractedData.pricing.min.toLocaleString()} - ${extractedData.pricing.max.toLocaleString()}
                              <span className="text-sm font-normal ml-1 text-gray-600">per month</span>
                            </p>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {/* Raw pricing mentions from backend or extracted data */}
                    {(intelligenceData?.pricing?.raw || extractedData.pricing?.raw) && (
                      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                        <Info className="w-4 h-4 text-blue-600" />
                        <AlertDescription>
                          <strong>Found pricing mentions from sources:</strong>
                          <ul className="mt-2 space-y-1">
                            {(intelligenceData?.pricing?.raw || extractedData.pricing?.raw || []).slice(0, 5).map((price: string, idx: number) => (
                              <li key={idx} className="text-sm ml-4">• {price}</li>
                            ))}
                          </ul>
                          <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                            Prices may vary based on care level, room type, and current availability. Contact community for exact rates.
                          </p>
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {/* Note if pricing is "call for price" */}
                    {intelligenceData?.pricing?.note && (
                      <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                        <Info className="w-4 h-4 text-yellow-600" />
                        <AlertDescription>
                          <p className="text-sm">{intelligenceData.pricing.note}</p>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <Alert className="border-gray-200">
                    <Info className="w-4 h-4 text-gray-600" />
                    <AlertDescription>
                      <p className="text-sm">
                        Pricing information not available online. Please contact the community directly for current rates.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            </Tabs>
          )}

          {/* Community Photos Found */}
          {webData?.images && webData.images.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold mb-3 flex items-center">
                <Building className="w-4 h-4 mr-2 text-orange-600" />
                Community Photos Found Online
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {webData.images.slice(0, 6).map((image: any, idx: number) => {
                  const imageUrl = typeof image === 'string' ? image : image.image_url;
                  return (
                    <div key={idx} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`${communityName} photo ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-lg border shadow-sm group-hover:shadow-md transition-shadow"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors" />
                    </div>
                  );
                })}
              </div>
              {webData.images.length > 6 && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  +{webData.images.length - 6} more photos found
                </p>
              )}
            </div>
          )}

          {/* Expandable Full Content */}
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full"
            >
              {isExpanded ? 'Hide' : 'Show'} Full Intelligence Report
            </Button>

            {isExpanded && (
              <div className="mt-4 space-y-4">
                <Separator />
                
                {/* Full Content */}
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ 
                    __html: webData.content.replace(/\n/g, '<br />') 
                  }} />
                </div>

                <Separator />

                {/* Sources */}
                {webData.citations && webData.citations.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center">
                      <LinkIcon className="w-4 h-4 mr-2 text-blue-600" />
                      Information Sources
                    </h4>
                    <div className="space-y-2">
                      {webData.citations.map((citation: string, idx: number) => {
                        const searchResult = webData.search_results?.[idx];
                        return (
                          <a
                            key={idx}
                            href={citation}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="flex items-center flex-1">
                              <Database className="w-4 h-4 mr-3 text-gray-500" />
                              <div>
                                <p className="text-sm font-medium">
                                  {searchResult?.title || `Source ${idx + 1}`}
                                </p>
                                {searchResult?.last_updated && (
                                  <p className="text-xs text-gray-500">
                                    Updated: {new Date(searchResult.last_updated).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Related Communities (if found) */}
      {extractedData?.relatedCommunities?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Building className="w-5 h-5 mr-2" />
              Related {extractedData.chainName || 'Communities'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {extractedData.relatedCommunities.map((community: any, idx: number) => (
                <Link 
                  key={idx} 
                  href={`/search?q=${encodeURIComponent(community.name)}`}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
                >
                  <div>
                    <p className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400">{community.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{community.address}</p>
                  </div>
                  <Badge variant="outline">{community.type}</Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper function to extract structured data from content
function extractStructuredData(content: string) {
  const data: any = {};

  // Extract official website URLs
  const websitePatterns = [
    /(?:https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.(?:com|org|net|care|health|senior|living))(?:\/[\w\-._~:/?#[\]@!$&'()*+,;=%]*)?/gi,
    /visit\s+(?:us\s+at\s+)?([a-zA-Z0-9-]+\.(?:com|org|net))(?:\/[\w\-._~:/?#[\]@!$&'()*+,;=%]*)?/gi,
    /(?:official\s+)?website:\s*([a-zA-Z0-9-]+\.(?:com|org|net))(?:\/[\w\-._~:/?#[\]@!$&'()*+,;=%]*)?/gi
  ];
  
  for (const pattern of websitePatterns) {
    const matches = content.match(pattern);
    if (matches) {
      // Find the most likely official website (prioritize .com and .org)
      const websites = matches.filter(url => {
        const cleanUrl = url.toLowerCase();
        // Filter out social media and review sites
        return !cleanUrl.includes('facebook') && 
               !cleanUrl.includes('twitter') && 
               !cleanUrl.includes('aplaceformom') &&
               !cleanUrl.includes('caring.com') &&
               !cleanUrl.includes('yelp.com');
      });
      if (websites.length > 0) {
        let website = websites[0];
        if (!website.startsWith('http')) {
          website = 'https://' + website.replace(/^(www\.)?/, 'www.');
        }
        data.officialWebsite = website;
        break;
      }
    }
  }

  // Extract phone numbers with improved patterns
  const phonePatterns = [
    /(?:phone|tel|call|contact)[\s:]*(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/gi,
    /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g
  ];
  
  const foundPhones: string[] = [];
  phonePatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // Clean the phone number
        const cleanPhone = match.replace(/(?:phone|tel|call|contact)[\s:]*/i, '').trim();
        if (cleanPhone && !foundPhones.includes(cleanPhone)) {
          foundPhones.push(cleanPhone);
        }
      });
    }
  });
  
  if (foundPhones.length > 0) {
    data.phoneNumbers = foundPhones.slice(0, 3);
  }

  // Extract addresses (looking for patterns like "1234 Street Name, City, ST 12345")
  const addressPattern = /\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl|Trail|Parkway|Pkwy|Highway|Hwy)[^,]*,\s*[A-Za-z\s]+,\s*[A-Z]{2}\s+\d{5}/gi;
  const addresses = content.match(addressPattern);
  if (addresses) {
    data.addresses = [...new Set(addresses)];
  }

  // Extract pricing information with comprehensive patterns
  const pricingData: any = {};
  
  // First, extract pricing from markdown tables
  const tableRowPattern = /\|[^|]*\|[^|]*\|\s*([^|]*(?:Living|Care|Memory|Nursing|Skilled|Studio|bedroom|Apartment)?[^|]*)\s*\|\s*([^|]*\$[^|]*)\s*\|/gi;
  const tablePrices: string[] = [];
  let tableMatch;
  while ((tableMatch = tableRowPattern.exec(content)) !== null) {
    const priceCell = tableMatch[2];
    if (priceCell && priceCell.includes('$')) {
      tablePrices.push(priceCell.replace(/\|/g, '').trim());
    }
  }
  
  // Additional pricing patterns for non-table content
  const pricingPatterns = [
    // Markdown table cells with pricing (handle various dash types)
    /\|\s*\$[\d,]+(?:\.\d{2})?\s*(?:[–—-]\s*\$[\d,]+(?:\.\d{2})?)?(?:\s*\/?\s*(?:per\s+)?(?:month|mo|monthly))?\s*\|/gi,
    // Price ranges with em dash, en dash, or hyphen
    /\$[\d,]+(?:\.\d{2})?\s*[–—-]\s*\$[\d,]+(?:\.\d{2})?(?:\s*\/?\s*(?:per\s+)?(?:month|mo|monthly))?/gi,
    // Starting/from prices
    /(?:starting\s+(?:at|from)|from|starts\s+at|as\s+low\s+as)\s*\$[\d,]+(?:\.\d{2})?(?:\s*\/?\s*(?:per\s+)?(?:month|mo|monthly))?/gi,
    // Prices with context words
    /(?:cost(?:s)?|price(?:d)?|rate(?:s)?|fee(?:s)?|rent)[\s:]*\$[\d,]+(?:\.\d{2})?(?:\s*[–—-]\s*\$[\d,]+(?:\.\d{2})?)?/gi,
    // Simple dollar amounts with context
    /\$[\d,]+(?:\.\d{2})?(?:\s*\/?\s*(?:per\s+)?(?:month|mo|monthly|day|daily|week|weekly))/gi,
    // Standalone dollar amounts
    /\$[\d,]+(?:\.\d{2})?/g
  ];
  
  const foundPrices: string[] = [...tablePrices];
  pricingPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const cleanMatch = match.replace(/\|/g, '').trim();
        if (cleanMatch && !foundPrices.some(p => p.includes(cleanMatch.replace(/[^\d$,.-]/g, '')))) {
          foundPrices.push(cleanMatch);
        }
      });
    }
  });
  
  if (foundPrices.length > 0) {
    console.log(`💰 Found pricing mentions:`, foundPrices);
    
    // Try to extract min/max pricing
    const numbers: number[] = [];
    foundPrices.forEach(price => {
      const priceNumbers = price.match(/\$?([\d,]+(?:\.\d{2})?)/g);
      if (priceNumbers) {
        priceNumbers.forEach(n => {
          const num = parseFloat(n.replace(/[$,]/g, ''));
          if (num > 100 && num < 50000) { // Reasonable range for monthly costs
            numbers.push(num);
          }
        });
      }
    });
    
    if (numbers.length > 0) {
      pricingData.min = Math.min(...numbers);
      pricingData.max = Math.max(...numbers);
      pricingData.raw = foundPrices;
    }
  }
  
  if (Object.keys(pricingData).length > 0) {
    data.pricing = pricingData;
  }

  // Extract care types
  const careTypes: string[] = [];
  const careTypePatterns = [
    /memory care/gi,
    /assisted living/gi,
    /independent living/gi,
    /skilled nursing/gi,
    /alzheimer['']s care/gi,
    /dementia care/gi,
    /hospice care/gi,
    /respite care/gi,
    /rehabilitation/gi
  ];
  
  careTypePatterns.forEach(pattern => {
    if (pattern.test(content)) {
      const match = pattern.source.replace(/\\/g, '').replace(/gi$/, '');
      careTypes.push(match.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
    }
  });
  
  if (careTypes.length > 0) {
    data.careTypes = [...new Set(careTypes)];
  }

  // Extract services
  const services: string[] = [];
  const servicePatterns = [
    /24\/7 (?:staff|support|care)/gi,
    /24-hour (?:staff|support|care)/gi,
    /medication management/gi,
    /personal care/gi,
    /bathing assistance/gi,
    /dressing assistance/gi,
    /meal preparation/gi,
    /wound care/gi,
    /diabetes management/gi
  ];
  
  servicePatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        services.push(match);
      });
    }
  });
  
  if (services.length > 0) {
    data.services = [...new Set(services.map((s: string) => 
      s.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    ))];
  }

  // Extract amenities
  const amenities: string[] = [];
  const amenityPatterns = [
    /secure environment/gi,
    /transportation/gi,
    /housekeeping/gi,
    /dining services/gi,
    /activity programs/gi,
    /physical therapy/gi,
    /occupational therapy/gi,
    /beauty.*salon|barber.*shop/gi,
    /fitness center/gi,
    /library/gi,
    /chapel/gi,
    /outdoor spaces/gi,
    /pet.*friendly/gi,
    /garden|courtyard/gi,
    /swimming pool/gi,
    /game room/gi,
    /theater|cinema/gi,
    /computer room/gi
  ];

  amenityPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        amenities.push(match);
      });
    }
  });

  if (amenities.length > 0) {
    data.amenities = [...new Set(amenities.map((a: string) => 
      a.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    ))];
  }

  // Combine services and amenities into features for backward compatibility
  data.features = [...(data.services || []), ...(data.amenities || [])];

  // Extract pricing information with improved patterns
  const pricePatterns = [
    /starting\s+(?:at|from)\s+\$[\d,]+(?:\s*(?:per|\/)\s*month)?/gi,
    /\$[\d,]+\s*-\s*\$[\d,]+(?:\s*(?:per|\/)\s*month)?/gi,
    /\$[\d,]+(?:\s*(?:per|\/)\s*month)/gi,
    /monthly\s+(?:rate|cost|price)[\s:]*\$[\d,]+/gi
  ];
  
  for (const pattern of pricePatterns) {
    const matches = content.match(pattern);
    if (matches) {
      data.pricing = matches.join(', ');
      break;
    }
  }

  // Check if it's part of a chain
  const chainPatterns = [
    /Brookdale/gi,
    /Sunrise Senior Living/gi,
    /Atria/gi,
    /Holiday Retirement/gi,
    /Five Star Senior Living/gi,
    /Kindred/gi,
    /Genesis/gi
  ];

  chainPatterns.forEach(pattern => {
    const match = content.match(pattern);
    if (match) {
      data.chainName = match[0];
    }
  });

  // Extract related communities if mentioned
  if (data.chainName) {
    const relatedPattern = new RegExp(`${data.chainName}[^.]*(?:locations?|communities)[^.]*`, 'gi');
    const relatedMatches = content.match(relatedPattern);
    
    if (relatedMatches) {
      // Try to extract individual community names and addresses
      const communities: Array<{name: string, address: string, type: string}> = [];
      const communityBlocks = content.split(/\n\n|\n-/);
      
      communityBlocks.forEach(block => {
        if (block.includes(data.chainName) && block.length < 500) {
          const nameMatch = block.match(new RegExp(`${data.chainName}[^\\n]*`, 'i'));
          const addressMatch = block.match(addressPattern);
          
          if (nameMatch && addressMatch) {
            communities.push({
              name: nameMatch[0].trim(),
              address: addressMatch[0].trim(),
              type: extractCareTypeFromBlock(block)
            });
          }
        }
      });
      
      if (communities.length > 0) {
        data.relatedCommunities = communities.slice(0, 5); // Limit to 5
      }
    }
  }

  return data;
}

function extractCareTypeFromBlock(block: string): string {
  if (/memory care/i.test(block)) return 'Memory Care';
  if (/assisted living/i.test(block)) return 'Assisted Living';
  if (/independent living/i.test(block)) return 'Independent Living';
  if (/skilled nursing/i.test(block)) return 'Skilled Nursing';
  return 'Senior Living';
}