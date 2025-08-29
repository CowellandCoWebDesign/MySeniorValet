import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Globe, ExternalLink, RefreshCw, CheckCircle, 
  MapPin, DollarSign, Phone, Search, Camera, Info,
  Building, Heart, Brain, Home, Sparkles
} from 'lucide-react';
import { cn } from "@/lib/utils";

interface CommunityIntelligence {
  found: boolean;
  name: string;
  officialWebsite?: string;
  address?: string;
  phone?: string;
  pricing?: {
    assistedLiving?: string;
    memoryCare?: string;
    independentLiving?: string;
    details?: string;
  };
  careLevels?: string[];
  description?: string;
  amenities?: string[];
  nearbyOptions?: Array<{
    name: string;
    address: string;
    distance: string;
  }>;
  photos?: string[];
  sources: string[];
  notes?: string; // Additional notes about the search result
}

interface LiveWebIntelligenceProps {
  communityId?: string | number;
  communityName: string;
  city: string;
  state: string;
  autoLoad?: boolean;  // Add autoLoad prop
  verificationReport?: any;
}

export function LiveWebIntelligence({ 
  communityId,
  communityName, 
  city, 
  state,
  autoLoad = true,  // Default to auto-loading
  verificationReport
}: LiveWebIntelligenceProps) {
  const [intelligence, setIntelligence] = useState<CommunityIntelligence | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasTriedLoading, setHasTriedLoading] = useState(false);

  // Use mutation for fetching
  const fetchIntelligence = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/competitive-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communityId,
          communityName,
          location: `${city}, ${state}`,
          type: 'city'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch intelligence');
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.intelligence) {
        setIntelligence(data.intelligence);
        setIsExpanded(true);
      }
    },
    onError: (error) => {
      console.error('Error fetching intelligence:', error);
    }
  });

  // Auto-load intelligence when component mounts (if autoLoad is true)
  useEffect(() => {
    // Only auto-load if we have verification report data to display
    if (autoLoad && !hasTriedLoading && !intelligence && !fetchIntelligence.isPending && verificationReport) {
      setHasTriedLoading(true);
      // Skip the competitive analysis call if we already have data from verification
      if (verificationReport?.searchResults || verificationReport?.verificationResults) {
        // Use verification data directly instead of calling competitive analysis
        const mockIntelligence: CommunityIntelligence = {
          found: true,
          name: communityName,
          officialWebsite: verificationReport?.contactInfo?.website || verificationReport?.officialWebsite,
          phone: verificationReport?.contactInfo?.phone || verificationReport?.phoneNumber,
          pricing: verificationReport?.pricing,
          description: verificationReport?.searchResults?.summary || verificationReport?.verificationResults?.perplexityData?.searchContent,
          sources: verificationReport?.searchResults?.sources || verificationReport?.verificationResults?.perplexityData?.sources || [],
          photos: verificationReport?.photos?.map((p: any) => p.url) || []
        };
        setIntelligence(mockIntelligence);
        setIsExpanded(true);
      } else {
        // Only call competitive analysis if we don't have verification data
        fetchIntelligence.mutate();
      }
    }
  }, [autoLoad, hasTriedLoading, intelligence, fetchIntelligence, verificationReport, communityName]);

  // If we haven't fetched yet, show the button
  if (!intelligence && !fetchIntelligence.isPending) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Live Web Intelligence</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Search for real-time information about this community
              </p>
            </div>
            <Button 
              onClick={() => fetchIntelligence.mutate()} 
              disabled={fetchIntelligence.isPending}
              className="w-full sm:w-auto"
            >
              <Search className="h-4 w-4 mr-2" />
              Search Live Data
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (fetchIntelligence.isPending) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin text-primary" />
            <CardTitle>Searching for {communityName}...</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  // Check if we have verification data even if competitive analysis didn't find it
  const hasVerificationData = verificationReport?.webIntelligence?.images?.length > 0 || 
                              verificationReport?.webIntelligence?.website ||
                              verificationReport?.webIntelligence?.phone ||
                              verificationReport?.verificationResults?.webIntelligence?.images?.length > 0 ||
                              verificationReport?.verificationResults?.webIntelligence?.website ||
                              verificationReport?.verificationResults?.webIntelligence?.phone;
  
  // If competitive analysis didn't find it but we have verification data, show that instead
  if (!intelligence?.found && hasVerificationData) {
    const verificationData = verificationReport?.verificationResults?.webIntelligence || verificationReport?.webIntelligence;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Community Intelligence Available
          </CardTitle>
          <CardDescription>
            Verified information gathered from the community's official sources
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Website */}
          {verificationData?.website && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <a 
                href={verificationData.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                Official Website
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
          
          {/* Phone */}
          {verificationData?.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              <a 
                href={`tel:${verificationData.phone}`}
                className="text-primary hover:underline"
              >
                {verificationData.phone}
              </a>
            </div>
          )}
          
          {/* Photos */}
          {verificationData?.images && verificationData.images.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-primary" />
                <span className="font-medium">{verificationData.images.length} Photos Available</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {verificationData.images.slice(0, 6).map((photo: string, idx: number) => (
                  <img
                    key={idx}
                    src={photo}
                    alt={`${communityName} photo ${idx + 1}`}
                    className="rounded-lg object-cover h-24 w-full"
                    loading="lazy"
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Additional info from verification */}
          {verificationData?.description && (
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm">{verificationData.description}</p>
            </div>
          )}
          
          <div className="pt-2">
            <Button 
              onClick={() => fetchIntelligence.mutate()} 
              variant="outline"
              size="sm"
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Live Search Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // No results found in competitive analysis AND no verification data
  if (!intelligence?.found && !hasVerificationData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-muted-foreground" />
            Live Intelligence Not Available
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Show notes about potential confusion if available */}
          {intelligence?.notes && (
            <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-900/10">
              <Info className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-800 dark:text-yellow-200">Search Notice</AlertTitle>
              <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                {intelligence.notes}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Display community information from database */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              We couldn't verify live information for <span className="font-semibold">{communityName}</span>.
              This community's information is displayed from our database records.
            </p>
            
            {/* Show database information hint */}
            <div className="p-3 rounded-lg bg-muted/50 space-y-2">
              <p className="text-sm font-medium">Database Information Available:</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building className="h-4 w-4" />
                <span>Community details from verified sources</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>Contact information (if available)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Location: {city}, {state}</span>
              </div>
            </div>
          </div>
          
          {/* Show nearby options if useful */}
          {intelligence?.nearbyOptions && 
           intelligence.nearbyOptions.length > 0 && 
           intelligence.nearbyOptions.some(opt => opt.name && !opt.name.includes('Several') && !opt.name.includes('Other search')) && (
            <div className="space-y-2 pt-2 border-t">
              <p className="text-sm font-medium">Nearby Communities:</p>
              <div className="space-y-2">
                {intelligence.nearbyOptions
                  .filter(opt => opt.name && !opt.name.includes('Several') && !opt.name.includes('Other search') && opt.name !== '- Distance' && opt.name !== '- Description')
                  .map((option, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
                    <MapPin className="h-3 w-3 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm">{option.name}</p>
                      {option.distance && <p className="text-xs text-muted-foreground">{option.distance}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="pt-2">
            <Button 
              onClick={() => {
                setIntelligence(null);
                fetchIntelligence.mutate();
              }} 
              variant="outline"
              size="sm"
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Searching Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Display found intelligence
  return (
    <Card className={cn(
      "transition-all duration-300",
      isExpanded && "ring-2 ring-primary/20"
    )}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              AI Generated Community Overview
            </CardTitle>
            <CardDescription>
              {intelligence?.description ? 'Verified information from web sources' : `Real-time information from ${intelligence?.sources?.length || 0} sources`}
            </CardDescription>
          </div>
          <Button 
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setIntelligence(null);
              setHasTriedLoading(false);
              fetchIntelligence.mutate();
            }}
            title="Refresh intelligence"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Official Website */}
          {intelligence?.officialWebsite && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Official Website</span>
              </div>
              <a 
                href={intelligence?.officialWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:underline"
              >
                Visit Site
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {/* Contact Information */}
          {(intelligence?.phone || intelligence?.address) && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Contact Information</h4>
              {intelligence?.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{intelligence.phone}</span>
                </div>
              )}
              {intelligence?.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{intelligence.address}</span>
                </div>
              )}
            </div>
          )}

          {/* Pricing Information */}
          {intelligence?.pricing && Object.keys(intelligence.pricing).length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Pricing Information</h4>
              <div className="grid gap-2">
                {intelligence?.pricing?.assistedLiving && (
                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <span className="text-sm">Assisted Living</span>
                    <span className="font-semibold">{intelligence.pricing.assistedLiving}</span>
                  </div>
                )}
                {intelligence?.pricing?.memoryCare && (
                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <span className="text-sm">Memory Care</span>
                    <span className="font-semibold">{intelligence.pricing.memoryCare}</span>
                  </div>
                )}
                {intelligence?.pricing?.independentLiving && (
                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <span className="text-sm">Independent Living</span>
                    <span className="font-semibold">{intelligence.pricing.independentLiving}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Care Levels */}
          {intelligence?.careLevels && intelligence.careLevels.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Care Levels Offered</h4>
              <div className="flex flex-wrap gap-2">
                {intelligence?.careLevels?.map((level, idx) => (
                  <Badge key={idx} variant="secondary">
                    {level === 'Assisted Living' && <Heart className="h-3 w-3 mr-1" />}
                    {level === 'Memory Care' && <Brain className="h-3 w-3 mr-1" />}
                    {level === 'Independent Living' && <Home className="h-3 w-3 mr-1" />}
                    {level === 'Skilled Nursing' && <Building className="h-3 w-3 mr-1" />}
                    {level}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Amenities */}
          {intelligence?.amenities && intelligence.amenities.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {intelligence?.amenities?.map((amenity, idx) => (
                  <Badge key={idx} variant="outline">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Photos */}
          {intelligence?.photos && intelligence.photos.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Photos from Official Website
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {intelligence?.photos?.slice(0, 6).map((photo, idx) => (
                  <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img 
                      src={photo} 
                      alt={`${communityName} photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {intelligence?.description && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">About</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {intelligence?.description}
              </p>
            </div>
          )}

          {/* Sources */}
          {intelligence?.sources && intelligence.sources.length > 0 && (
            <div className="pt-4 border-t space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Info className="h-4 w-4" />
                Sources
              </h4>
              <div className="space-y-1">
                {intelligence?.sources?.map((source, idx) => (
                  <div key={idx} className="text-xs">
                    <a 
                      href={source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 truncate"
                    >
                      {new URL(source).hostname.replace('www.', '')}
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Data from {intelligence?.sources?.length || 0} verified sources • 
                Powered by AI-driven research
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}