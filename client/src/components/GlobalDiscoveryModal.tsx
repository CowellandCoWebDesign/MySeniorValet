import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Loader2, MapPin, Globe, Building, Phone, Mail, Link2, CheckCircle, AlertCircle, Sparkles, Search, Code, ChevronDown, ChevronUp, DollarSign, Clock } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { useLocation } from 'wouter';
import { queryClient } from '@/lib/queryClient';

interface GlobalDiscoveryResult {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  careTypes?: string[];
  photos?: string[];
  isExisting?: boolean;
  isDiscovered?: boolean;
  needsApproval?: boolean;
  data_source?: string;
  pricing?: string;
  hours?: string;
  entityType?: string;
  confidence?: number;
}

interface GlobalDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  results: GlobalDiscoveryResult[];
  metadata?: {
    totalFound: number;
    existingCount: number;
    discoveredCount: number;
    sources?: string[];
    searchLocation: string;
    aiConfidence?: number;
    discoveryType?: 'communities' | 'services' | 'healthcare' | 'resources' | 'vendors';
    aiNarrative?: string;
    citations?: string[];
    rawPerplexityResponse?: string;
    perplexityQuery?: string;
    timeout?: boolean;
    status?: 'timeout' | 'partial' | string;
    note?: string;
    retryAfterMs?: number;
  };
}

export function GlobalDiscoveryModal({
  isOpen,
  onClose,
  searchQuery,
  results,
  metadata
}: GlobalDiscoveryModalProps) {
  const [, setLocation] = useLocation();
  const [selectedCommunity, setSelectedCommunity] = useState<GlobalDiscoveryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showRawResponse, setShowRawResponse] = useState(false);
  
  // CRITICAL: Invalidate recently-discovered cache when modal opens with results
  // This ensures new discoveries appear immediately in Recently Discovered section
  useEffect(() => {
    if (isOpen && results && results.length > 0) {
      // Use prefix matching to invalidate all recently-discovered queries regardless of params
      queryClient.invalidateQueries({ queryKey: ['/api/communities/recently-discovered'] });
      // Also invalidate with the specific limit param used by RecentlyDiscoveredCommunities component
      queryClient.invalidateQueries({ queryKey: ['/api/communities/recently-discovered', { limit: 100 }] });
      console.log('🔄 GlobalDiscoveryModal: Invalidated recently-discovered cache for', results.length, 'results');
    }
  }, [isOpen, results]);
  
  const handleSelectCommunity = (community: GlobalDiscoveryResult) => {
    setSelectedCommunity(community);
    setIsLoading(true);
    
    // Navigate to the appropriate detail page based on discovery type
    setTimeout(() => {
      if (metadata?.discoveryType === 'services') {
        const slug = community.id.toString();
        setLocation(`/service/${slug}?discovery=true`);
      } else if (metadata?.discoveryType === 'healthcare') {
        // Healthcare providers - show details modal or navigate to website
        if (community.website) {
          window.open(community.website, '_blank', 'noopener,noreferrer');
        }
      } else if (metadata?.discoveryType === 'resources') {
        // Resources - navigate to website if available
        if (community.website) {
          window.open(community.website, '_blank', 'noopener,noreferrer');
        }
      } else if (metadata?.discoveryType === 'vendors') {
        // Vendors - navigate to vendor page or website
        if (community.website) {
          window.open(community.website, '_blank', 'noopener,noreferrer');
        }
      } else {
        setLocation(`/community/${community.id}?discovery=true`);
      }
      onClose();
    }, 500);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Globe className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            Global Discovery Results
          </DialogTitle>
          <DialogDescription className="text-base">
            {/* Check if it's a timeout before showing results count */}
            {metadata?.timeout && metadata?.status === 'timeout' ? (
              <span className="text-amber-600 dark:text-amber-400">
                Search timed out for "{searchQuery}" - This search is taking longer than expected
              </span>
            ) : (
              <>
                Found {metadata?.totalFound || results.length} {
                  metadata?.discoveryType === 'services' ? 'service providers' 
                  : metadata?.discoveryType === 'healthcare' ? 'healthcare providers'
                  : metadata?.discoveryType === 'resources' ? 'resources'
                  : metadata?.discoveryType === 'vendors' ? 'vendors'
                  : 'communities'
                } for "{searchQuery}"
                {metadata?.discoveredCount && metadata.discoveredCount > 0 && (
                  <span className="ml-2 text-green-600 dark:text-green-400">
                    ({metadata.discoveredCount} newly discovered!)
                  </span>
                )}
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          {/* Raw AI Response Section */}
          {metadata?.rawPerplexityResponse && (
            <div className="mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRawResponse(!showRawResponse)}
                className="flex items-center gap-2 mb-2"
              >
                <Code className="w-4 h-4" />
                {showRawResponse ? 'Hide' : 'Show'} AI Response
                {showRawResponse ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
              
              {showRawResponse && (
                <Card className="bg-gray-50 dark:bg-gray-900/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Perplexity AI Response</CardTitle>
                    {metadata.perplexityQuery && (
                      <CardDescription className="text-xs">
                        Query: "{metadata.perplexityQuery}"
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-48 w-full rounded-md border p-3">
                      <pre className="text-xs font-mono whitespace-pre-wrap">
                        {metadata.rawPerplexityResponse}
                      </pre>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
              
              <Separator className="my-3" />
            </div>
          )}
          
          {/* Metadata Banner */}
          {metadata && (
            <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="bg-white dark:bg-gray-800">
                    <Building className="w-3 h-3 mr-1" />
                    {metadata.existingCount} Verified
                  </Badge>
                  <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 border-green-500">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {metadata.discoveredCount} New
                  </Badge>
                  {metadata.aiConfidence && (
                    <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20 border-purple-500">
                      AI Confidence: {metadata.aiConfidence}%
                    </Badge>
                  )}
                </div>
                {metadata.sources && metadata.sources.length > 0 && (
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Sources: {
                      metadata.sources.includes('Database') && metadata.sources.length > 1
                        ? `${metadata.sources.filter(s => s !== 'Database').length} websites + Database comparison`
                        : metadata.sources.includes('Database')
                        ? 'MySeniorValet Database'
                        : `${metadata.sources.length} ${metadata.sources.length === 1 ? 'website' : 'websites'}`
                    }
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* AI Narrative Section */}
          {metadata?.aiNarrative && (
            <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    {metadata.aiNarrative}
                  </p>
                  {metadata.citations && metadata.citations.length > 0 && (
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Sources: </span>
                      {metadata.citations.slice(0, 3).map((citation, idx) => (
                        <span key={idx}>
                          {idx > 0 && ', '}
                          <a href={citation} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                            {new URL(citation).hostname.replace('www.', '')}
                          </a>
                        </span>
                      ))}
                      {metadata.citations.length > 3 && ` +${metadata.citations.length - 3} more`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Timeout Message */}
          {metadata?.timeout && metadata?.status === 'timeout' && results.length === 0 && (
            <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
              <div className="flex items-start gap-3">
                <Search className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Search is taking longer than expected
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    International searches can take 30-60 seconds. Please try:
                  </p>
                  <ul className="text-sm text-amber-700 dark:text-amber-300 list-disc list-inside space-y-1">
                    <li>Searching for a specific city instead of a country (e.g., "Hotels in Rome" instead of "Hotels in Italy")</li>
                    <li>Waiting a moment and trying again</li>
                    <li>Using more specific search terms</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {/* Results Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {results.map((community) => (
              <motion.div
                key={community.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedCommunity?.id === community.id 
                      ? 'ring-2 ring-blue-500 dark:ring-blue-400' 
                      : ''
                  } ${
                    community.isDiscovered 
                      ? 'border-green-500 dark:border-green-400' 
                      : ''
                  }`}
                  onClick={() => handleSelectCommunity(community)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-1">
                        {community.name}
                      </CardTitle>
                      <div className="flex gap-1">
                        {community.isExisting && (
                          <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {community.isDiscovered && (
                          <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            <Sparkles className="w-3 h-3 mr-1" />
                            New
                          </Badge>
                        )}
                        {community.isDiscovered && (
                          <Badge variant="default" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {community.city}, {community.state}
                      {community.country && community.country !== 'US' && (
                        <span className="ml-1">• {community.country}</span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {community.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {community.description}
                      </p>
                    )}
                    
                    <div className="space-y-1">
                      {community.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-3 h-3 text-gray-500" />
                          <span>{community.phone}</span>
                        </div>
                      )}
                      {community.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-3 h-3 text-gray-500" />
                          <span className="truncate">{community.email}</span>
                        </div>
                      )}
                      {community.website && (
                        <div className="flex items-center gap-2 text-sm">
                          <Link2 className="w-3 h-3 text-gray-500" />
                          <span className="truncate text-blue-600 dark:text-blue-400">
                            {community.website}
                          </span>
                        </div>
                      )}
                      {community.pricing && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-3 h-3 text-green-600 dark:text-green-400" />
                          <span className="text-green-700 dark:text-green-300 font-medium">{community.pricing}</span>
                        </div>
                      )}
                      {community.hours && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-3 h-3 text-blue-500" />
                          <span>{community.hours}</span>
                        </div>
                      )}
                    </div>
                    
                    {community.careTypes && community.careTypes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {community.careTypes.slice(0, 3).map((type, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                        {community.careTypes.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{community.careTypes.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {community.data_source && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Source: {community.data_source}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          {/* No Results Message */}
          {results.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No communities found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try searching for a different location or adjusting your search terms.
              </p>
            </div>
          )}
        </div>
        
        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {selectedCommunity && (
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Selected: {selectedCommunity.name}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {selectedCommunity && (
              <Button 
                onClick={() => handleSelectCommunity(selectedCommunity)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    View Details
                    <CheckCircle className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}