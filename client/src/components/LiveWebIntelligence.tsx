import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Globe, ExternalLink, RefreshCw, CheckCircle, Info, Clock, 
  MapPin, DollarSign, Users, Building, Shield, TrendingUp,
  Star, AlertCircle, Sparkles, Calendar, Link, Database,
  Activity, Award, Home, Heart, Brain
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from "@/lib/utils";

interface PerplexityResponse {
  content: string;
  citations?: string[];
  images?: string[];  // URLs of actual community photos found online
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
}

interface LiveWebIntelligenceProps {
  communityName: string;
  city: string;
  state: string;
  onDataUpdate?: (data: any) => void;
}

export function LiveWebIntelligence({ 
  communityName, 
  city, 
  state,
  onDataUpdate 
}: LiveWebIntelligenceProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);

  // Fetch live data from Perplexity
  const { data: webData, isLoading, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['/api/communities/web-intelligence', communityName, city, state],
    queryFn: async () => {
      const response = await fetch('/api/communities/web-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communityName,
          city,
          state,
          query: `"${communityName}" ${city} ${state} senior living`
        })
      });
      
      if (!response.ok) throw new Error('Failed to fetch web intelligence');
      return response.json();
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    retry: 1
  });

  // Extract structured data from the response
  useEffect(() => {
    if (webData?.content) {
      const extracted = extractStructuredData(webData.content);
      setExtractedData(extracted);
      
      // Notify parent component of new data including any found images
      if (onDataUpdate) {
        onDataUpdate({
          ...extracted,
          citations: webData.citations,
          images: webData.images || [],  // Pass actual community photos found online
          lastUpdated: new Date().toISOString()
        });
      }
    }
  }, [webData, onDataUpdate]);

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

  // Calculate trust score based on citations
  const getTrustScore = () => {
    if (!webData?.citations) return 0;
    const citationCount = webData.citations.length;
    
    if (citationCount >= 5) return 95;
    if (citationCount >= 3) return 85;
    if (citationCount >= 2) return 75;
    if (citationCount >= 1) return 65;
    return 50;
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

          {/* Extracted Key Information */}
          {extractedData && (
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center">
                <Brain className="w-4 h-4 mr-2 text-purple-600" />
                AI-Extracted Insights
              </h4>

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

              {/* Features */}
              {extractedData.features?.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Highlighted Features:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {extractedData.features.slice(0, 6).map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-center text-sm">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-600" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing Mentions */}
              {extractedData.pricing && (
                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <AlertDescription>
                    <strong>Pricing Information:</strong>
                    <p className="mt-1 text-sm">{extractedData.pricing}</p>
                  </AlertDescription>
                </Alert>
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
                      <Link className="w-4 h-4 mr-2 text-blue-600" />
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
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">{community.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{community.address}</p>
                  </div>
                  <Badge variant="outline">{community.type}</Badge>
                </div>
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

  // Extract addresses (looking for patterns like "1234 Street Name, City, ST 12345")
  const addressPattern = /\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl|Trail|Parkway|Pkwy|Highway|Hwy)[^,]*,\s*[A-Za-z\s]+,\s*[A-Z]{2}\s+\d{5}/gi;
  const addresses = content.match(addressPattern);
  if (addresses) {
    data.addresses = [...new Set(addresses)];
  }

  // Extract care types
  const careTypes = [];
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
      careTypes.push(match.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
    }
  });
  
  if (careTypes.length > 0) {
    data.careTypes = [...new Set(careTypes)];
  }

  // Extract features
  const features = [];
  const featurePatterns = [
    /24\/7 (?:staff|support|care)/gi,
    /secure environment/gi,
    /medication management/gi,
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
    /pet.*friendly/gi
  ];

  featurePatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        features.push(match);
      });
    }
  });

  if (features.length > 0) {
    data.features = [...new Set(features.map(f => 
      f.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    ))];
  }

  // Extract pricing information
  const pricePattern = /\$[\d,]+(?:\s*-\s*\$[\d,]+)?(?:\s*(?:per|\/)\s*month)?/gi;
  const prices = content.match(pricePattern);
  if (prices) {
    data.pricing = prices.join(', ');
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
      const communities = [];
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