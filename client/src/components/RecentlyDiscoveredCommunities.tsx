import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FeaturedExcellenceCard } from '@/components/FeaturedExcellenceCard';

export function RecentlyDiscoveredCommunities() {
  // Carousel refs and state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position for navigation buttons
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Scroll navigation functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -424, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 424, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const handleResize = () => checkScrollPosition();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch recently discovered communities
  const { data: recentCommunities = [], isLoading } = useQuery({
    queryKey: ['/api/communities/recently-discovered?limit=100'],
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
    gcTime: 2 * 60 * 60 * 1000, // Keep in cache for 2 hours
  });

  return (
    <div className="space-y-6">
      {/* Section Title */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Sparkles className="w-7 h-7 text-yellow-400 animate-pulse" />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Recently Discovered Communities
          </h2>
          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 text-sm font-bold animate-pulse">
            🔥 NEW
          </Badge>
        </div>
        <p className="text-base text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Fresh additions to our database - Real communities discovered through our AI-powered search
        </p>
      </div>

      {/* Communities Carousel */}
      <div className="relative group">
        {/* Left Scroll Button */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            data-testid="button-scroll-left-recently-discovered"
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-full p-3 shadow-xl opacity-0 md:opacity-100 group-hover:opacity-100 transition-all duration-200 hover:scale-110 hover:bg-white dark:hover:bg-gray-800"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </button>
        )}

        {/* Carousel Container */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2"
          onScroll={checkScrollPosition}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[400px]">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-5 animate-pulse border border-gray-200 dark:border-gray-700">
                  <div className="h-40 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded w-1/2 mb-3"></div>
                  <div className="flex gap-2 mt-4">
                    <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-full w-24"></div>
                    <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-full w-24"></div>
                  </div>
                </div>
              </div>
            ))
          ) : recentCommunities && recentCommunities.length > 0 ? (
            recentCommunities.map((community: any, index: number) => (
              <motion.div 
                key={community.id} 
                className="flex-shrink-0"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
              >
                <div className="hover:scale-[1.02] transition-transform duration-300">
                  <FeaturedExcellenceCard 
                    community={community}
                    compact={true}
                    disableAutoPhotoLoad={true}
                  />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-gray-500 dark:text-gray-400 text-center py-8 w-full">
              No recently discovered communities yet. Search for communities to populate this section!
            </div>
          )}
        </div>

        {/* Right Scroll Button */}
        {canScrollRight && (
          <button
            onClick={scrollRight}
            data-testid="button-scroll-right-recently-discovered"
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-full p-3 shadow-xl opacity-0 md:opacity-100 group-hover:opacity-100 transition-all duration-200 hover:scale-110 hover:bg-white dark:hover:bg-gray-800"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </button>
        )}
      </div>

      {/* Quick Stats Bar */}
      <div className="flex flex-wrap justify-center gap-3">
        <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30 px-4 py-2">
          <span className="font-medium">Database grows daily with real discoveries</span>
        </Badge>
      </div>
    </div>
  );
}