import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Loader2, MapPin, Globe, Building, Phone, Mail, Link2, CheckCircle, AlertCircle, Sparkles, Search } from 'lucide-react';
import { useLocation } from 'wouter';

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
  
  const handleSelectCommunity = (community: GlobalDiscoveryResult) => {
    setSelectedCommunity(community);
    setIsLoading(true);
    
    // Navigate to the community detail page
    setTimeout(() => {
      setLocation(`/community/${community.id}?discovery=true`);
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
            Found {metadata?.totalFound || results.length} communities for "{searchQuery}"
            {metadata?.discoveredCount && metadata.discoveredCount > 0 && (
              <span className="ml-2 text-green-600 dark:text-green-400">
                ({metadata.discoveredCount} newly discovered!)
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
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
                    Sources: {metadata.sources.length} websites
                  </div>
                )}
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