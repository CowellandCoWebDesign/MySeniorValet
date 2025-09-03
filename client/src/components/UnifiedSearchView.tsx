import React, { useState, useEffect, useRef } from 'react';
import { Map, List, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { PrioritizedCommunityCard } from './PrioritizedCommunityCard';
import { VendorServiceCard } from './VendorServiceCard';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';

interface UnifiedSearchViewProps {
  searchResults: any;
  searchQuery: string;
  searchCategory: 'communities' | 'services' | 'healthcare' | 'resources';
  filters?: any;
  onCommunityClick?: (community: any) => void;
  isLoading?: boolean;
}

export default function UnifiedSearchView({ 
  searchResults,
  searchQuery,
  searchCategory,
  filters,
  onCommunityClick,
  isLoading = false
}: UnifiedSearchViewProps) {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [mapBounds, setMapBounds] = useState<any>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<number | null>(null);
  const mapRef = useRef<any>(null);
  
  const [, setLocation] = useLocation();
  
  // Integrate discovery results naturally
  const { data: discoveryEnhancement } = useQuery<any>({
    queryKey: ['/api/global-discovery/enhance', searchQuery, searchCategory],
    enabled: !!searchQuery && searchQuery.length > 2,
    staleTime: 5 * 60 * 1000,
  });

  // Combine database results with discovery results
  const combinedResults = React.useMemo(() => {
    if (!searchResults?.results) return [];
    
    const dbResults = searchResults.results || [];
    const discoveredResults = discoveryEnhancement?.discovered || [];
    
    // Merge and deduplicate based on name/location
    const merged = [...dbResults];
    discoveredResults.forEach((discovered: any) => {
      const exists = merged.some(r => 
        r.name?.toLowerCase() === discovered.name?.toLowerCase() &&
        r.city?.toLowerCase() === discovered.city?.toLowerCase()
      );
      if (!exists) {
        merged.push({
          ...discovered,
          isDiscovered: true,
          discoverySource: 'The Kraken Engine'
        });
      }
    });
    
    return merged;
  }, [searchResults, discoveryEnhancement]);

  const handleToggleView = () => {
    setViewMode(prev => prev === 'list' ? 'map' : 'list');
  };

  const handleCommunitySelect = (community: any) => {
    setSelectedCommunity(community.id);
    if (onCommunityClick) {
      onCommunityClick(community);
    }
  };

  // Format results count message
  const getResultsMessage = () => {
    const count = combinedResults.length;
    const categoryLabel = searchCategory === 'services' ? 'services' :
                         searchCategory === 'healthcare' ? 'healthcare providers' :
                         searchCategory === 'resources' ? 'resources' : 'communities';
    
    if (searchQuery) {
      return `Found ${count} ${categoryLabel} matching "${searchQuery}"`;
    }
    return `${count} ${categoryLabel} found`;
  };

  return (
    <div className="relative w-full h-full">
      {/* Results Header */}
      <div className="bg-white/10 dark:bg-gray-900/50 backdrop-blur-md px-4 py-3 border border-white/20 dark:border-gray-700 rounded-xl shadow-2xl mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white dark:text-gray-100">
            {getResultsMessage()}
            {discoveryEnhancement?.discovered?.length > 0 && (
              <Badge className="ml-2 bg-green-500/20 text-green-400 border-green-500/30">
                +{discoveryEnhancement.discovered.length} discovered
              </Badge>
            )}
          </h3>
          
          {/* View Mode Indicator */}
          <div className="flex items-center gap-2">
            {viewMode === 'list' ? (
              <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                <List className="w-3 h-3 mr-1" />
                List View
              </Badge>
            ) : (
              <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                <Map className="w-3 h-3 mr-1" />
                Map View
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {viewMode === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* List View */}
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
                </div>
              ) : combinedResults.length === 0 ? (
                <Card className="p-8 text-center bg-white/5 dark:bg-gray-800/50 backdrop-blur-sm">
                  <p className="text-gray-400">No results found for "{searchQuery}"</p>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {combinedResults.map((item: any, index: number) => (
                    <motion.div
                      key={item.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      {searchCategory === 'communities' ? (
                        <PrioritizedCommunityCard
                          community={item}
                          variant="list"
                          onSelect={() => handleCommunitySelect(item)}
                        />
                      ) : (
                        <Card 
                          className="p-4 hover:shadow-xl transition-all cursor-pointer"
                          onClick={() => handleCommunitySelect(item)}
                        >
                          <h4 className="font-semibold text-lg mb-2">{item.name || item.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.description || item.address}
                          </p>
                          {item.isDiscovered && (
                            <Badge className="mt-2 bg-purple-500/20 text-purple-400">
                              <MapPin className="w-3 h-3 mr-1" />
                              Discovered by Kraken
                            </Badge>
                          )}
                        </Card>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="map"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="h-[600px] rounded-xl overflow-hidden"
            >
              {/* Map View - Placeholder for now */}
              <div className="w-full h-full bg-gray-900/50 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <Map className="w-24 h-24 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Map View Coming Soon</h3>
                  <p className="text-gray-400">The interactive map will display all {combinedResults.length} results</p>
                  <Button 
                    onClick={() => setLocation('/map-search')}
                    className="mt-4 bg-purple-600 hover:bg-purple-700"
                  >
                    Open Full Map View
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Toggle Button - Yelp/Expedia Style */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.3
        }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={handleToggleView}
          size="lg"
          className="group relative overflow-hidden shadow-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-full transition-all duration-300 hover:scale-105"
        >
          <span className="relative z-10 flex items-center gap-2 font-semibold">
            {viewMode === 'list' ? (
              <>
                <Map className="w-5 h-5" />
                View in Map
              </>
            ) : (
              <>
                <List className="w-5 h-5" />
                View as List
              </>
            )}
          </span>
          
          {/* Animated background effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600"
            initial={{ x: '100%' }}
            whileHover={{ x: 0 }}
            transition={{ duration: 0.3 }}
          />
        </Button>

        {/* Pulse effect for attention */}
        <div className="absolute inset-0 rounded-full bg-white opacity-20 animate-ping" />
      </motion.div>

      {/* Discovery Enhancement Indicator */}
      {discoveryEnhancement?.isSearching && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-20 right-6 bg-purple-600/90 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            <span className="text-sm font-medium">Discovering more results...</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}