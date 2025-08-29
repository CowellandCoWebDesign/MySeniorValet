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
    // If we have verification report data, use it directly
    if (verificationReport && !intelligence) {
      console.log('Using verification report data directly:', verificationReport);
      
      // Extract data from verification report
      const webIntel = verificationReport?.verificationResults?.webIntelligence || 
                      verificationReport?.webIntelligence ||
                      {};
      const perplexityData = verificationReport?.verificationResults?.perplexityData || 
                            verificationReport?.perplexityData ||
                            {};
      
      // Parse the perplexity response properly
      let parsedDescription = '';
      let parsedWebsite = '';
      let parsedPhone = '';
      let parsedPricing = {};
      let parsedAmenities: string[] = [];
      let parsedCareLevels: string[] = [];
      
      // Extract from perplexity search content
      if (perplexityData.searchContent) {
        parsedDescription = perplexityData.searchContent;
        
        // Try to extract structured data from the search content
        const content = perplexityData.searchContent;
        
        // Extract website
        const websiteMatch = content.match(/OFFICIAL WEBSITE:\s*([^\s]+)/i) || 
                           content.match(/website:\s*([^\s]+)/i);
        if (websiteMatch) parsedWebsite = websiteMatch[1];
        
        // Extract phone
        const phoneMatch = content.match(/PHONE:\s*([\d-\(\)\s]+)/i) || 
                          content.match(/phone:\s*([\d-\(\)\s]+)/i);
        if (phoneMatch) parsedPhone = phoneMatch[1];
        
        // Extract pricing info
        const pricingMatch = content.match(/CURRENT PRICING:\s*([^A-Z]+)/i) || 
                           content.match(/pricing:\s*([^A-Z]+)/i);
        if (pricingMatch) {
          const pricingText = pricingMatch[1];
          parsedPricing = { details: pricingText.trim() };
        }
        
        // Extract care levels
        const careLevelsMatch = content.match(/CARE LEVELS OFFERED:\s*([^A-Z]+)/i);
        if (careLevelsMatch) {
          parsedCareLevels = careLevelsMatch[1].split(',').map((s: string) => s.trim()).filter(Boolean);
        }
        
        // Extract amenities
        const amenitiesMatch = content.match(/KEY AMENITIES:\s*([^A-Z]+)/i);
        if (amenitiesMatch) {
          parsedAmenities = amenitiesMatch[1].split(',').map((s: string) => s.trim()).filter(Boolean);
        }
      }
      
      const mockIntelligence: CommunityIntelligence = {
        found: true,
        name: communityName,
        officialWebsite: parsedWebsite || 
                        webIntel.website || 
                        verificationReport?.contactInfo?.website || 
                        verificationReport?.officialWebsite,
        phone: parsedPhone ||
               webIntel.phone || 
               verificationReport?.contactInfo?.phone || 
               verificationReport?.phoneNumber,
        pricing: Object.keys(parsedPricing).length > 0 ? parsedPricing : 
                (verificationReport?.pricing || webIntel.pricing),
        description: parsedDescription || 
                    webIntel.description ||
                    verificationReport?.searchResults?.summary,
        sources: perplexityData.sources || 
                verificationReport?.searchResults?.sources || 
                [],
        photos: webIntel.images?.map((img: any) => typeof img === 'object' ? img.url : img)
                  ?.filter((url: string) => {
                    // Filter out logos, icons, and social media images
                    const lowercaseUrl = url.toLowerCase();
                    return !lowercaseUrl.includes('logo') &&
                           !lowercaseUrl.includes('icon') &&
                           !lowercaseUrl.includes('twitter') &&
                           !lowercaseUrl.includes('facebook') &&
                           !lowercaseUrl.includes('x-20-20') &&
                           !lowercaseUrl.includes('social');
                  }) || 
               verificationReport?.photos?.map((p: any) => typeof p === 'string' ? p : p.url) || 
               [],
        amenities: parsedAmenities.length > 0 ? parsedAmenities : 
                  (webIntel.amenities || verificationReport?.amenities?.extracted),
        careLevels: parsedCareLevels.length > 0 ? parsedCareLevels : 
                   (webIntel.careLevels || verificationReport?.careLevels),
        notes: perplexityData.searchContent ? 'Information from web search' : undefined
      };
      
      setIntelligence(mockIntelligence);
      setIsExpanded(true);
      setHasTriedLoading(true);
    }
    // Only call competitive analysis if no verification data and autoLoad is true
    else if (autoLoad && !hasTriedLoading && !intelligence && !fetchIntelligence.isPending && !verificationReport) {
      setHasTriedLoading(true);
      fetchIntelligence.mutate();
    }
  }, [verificationReport, autoLoad, hasTriedLoading, intelligence, fetchIntelligence, communityName]);

  // Loading state - show this while waiting for verification report
  if (!intelligence && !verificationReport && autoLoad) {
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

  // If we haven't fetched yet and no verification report, show the button
  if (!intelligence && !verificationReport && !autoLoad) {
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
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <CheckCircle className="h-6 w-6 text-green-600" />
              AI Generated Community Overview
            </CardTitle>
            <CardDescription className="text-sm">
              Verified information from web sources • Last updated: {new Date().toLocaleDateString()}
            </CardDescription>
          </div>
          <Button 
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setIntelligence(null);
              setHasTriedLoading(false);
              fetchIntelligence.mutate();
            }}
            title="Refresh intelligence"
            className="h-8 w-8"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-5 pt-0">
          {/* Description - Show first if available */}
          {intelligence?.description && (
            <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-100 dark:border-blue-900">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                Community Overview
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {intelligence.description}
              </p>
            </div>
          )}

          {/* Official Website */}
          {intelligence?.officialWebsite && (
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-100 dark:border-green-900">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                  <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <span className="font-semibold text-sm">Official Website</span>
                  <p className="text-xs text-muted-foreground">Visit for more information</p>
                </div>
              </div>
              <a 
                href={intelligence?.officialWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Visit Site
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}

          {/* Contact Information */}
          {(intelligence?.phone || intelligence?.address) && (
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-950/20 border border-gray-200 dark:border-gray-800">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-600" />
                Contact Information
              </h4>
              <div className="space-y-3">
                {intelligence?.phone && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                      <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <a href={`tel:${intelligence.phone}`} className="font-medium text-sm hover:text-primary transition-colors">
                        {intelligence.phone}
                      </a>
                    </div>
                  </div>
                )}
                {intelligence?.address && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
                      <MapPin className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="font-medium text-sm">{intelligence.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pricing Information */}
          {intelligence?.pricing && Object.keys(intelligence.pricing).length > 0 && (
            <div className="p-4 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-100 dark:border-amber-900">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-amber-600" />
                Pricing Information
              </h4>
              <div className="grid gap-3">
                {intelligence?.pricing?.assistedLiving && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">Assisted Living</span>
                    </div>
                    <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                      {intelligence.pricing.assistedLiving}
                    </span>
                  </div>
                )}
                {intelligence?.pricing?.memoryCare && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Memory Care</span>
                    </div>
                    <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                      {intelligence.pricing.memoryCare}
                    </span>
                  </div>
                )}
                {intelligence?.pricing?.independentLiving && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Independent Living</span>
                    </div>
                    <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                      {intelligence.pricing.independentLiving}
                    </span>
                  </div>
                )}
                {intelligence?.pricing?.details && (
                  <div className="mt-2 p-2 rounded bg-amber-100/50 dark:bg-amber-900/20">
                    <p className="text-xs text-muted-foreground">
                      {intelligence.pricing.details}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Care Levels */}
          {intelligence?.careLevels && intelligence.careLevels.length > 0 && (
            <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-100 dark:border-purple-900">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Heart className="h-4 w-4 text-purple-600" />
                Care Levels Offered
              </h4>
              <div className="flex flex-wrap gap-2">
                {intelligence?.careLevels?.map((level, idx) => (
                  <Badge key={idx} variant="secondary" className="px-3 py-1.5">
                    {level === 'Assisted Living' && <Heart className="h-3 w-3 mr-1.5 text-red-500" />}
                    {level === 'Memory Care' && <Brain className="h-3 w-3 mr-1.5 text-purple-500" />}
                    {level === 'Independent Living' && <Home className="h-3 w-3 mr-1.5 text-blue-500" />}
                    {level === 'Skilled Nursing' && <Building className="h-3 w-3 mr-1.5 text-green-500" />}
                    <span className="text-xs font-medium">{level}</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Amenities */}
          {intelligence?.amenities && intelligence.amenities.length > 0 && (
            <div className="p-4 rounded-lg bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20 border border-teal-100 dark:border-teal-900">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-teal-600" />
                Amenities & Features
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {intelligence?.amenities?.slice(0, 8).map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-gray-900 border border-teal-200 dark:border-teal-800">
                    <CheckCircle className="h-3 w-3 text-teal-600 flex-shrink-0" />
                    <span className="text-xs font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
              {intelligence.amenities.length > 8 && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  +{intelligence.amenities.length - 8} more amenities
                </p>
              )}
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