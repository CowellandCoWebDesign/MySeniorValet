import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FeaturedExcellenceCard } from '@/components/FeaturedExcellenceCard';

export function HUDCommunitiesSection() {
  // Slider ref for navigation
  const hudSliderRef = useRef<HTMLDivElement>(null);

  // Fetch HUD count
  const { data: hudCount } = useQuery({
    queryKey: ['/api/communities/hud-count']
  });

  // Fetch HUD properties for showcase
  const { data: hudProperties } = useQuery({
    queryKey: ['/api/communities/hud-properties?limit=10']
  });

  // Scroll navigation function
  const scrollSlider = (direction: 'left' | 'right') => {
    if (hudSliderRef.current) {
      const scrollAmount = 320; // Width of one card plus gap
      const currentScroll = hudSliderRef.current.scrollLeft;
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      hudSliderRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-900/50 dark:to-gray-800/50 rounded-2xl shadow-xl p-8 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              HUD Communities & Government Verified
            </h2>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-700 dark:text-green-300 font-medium">Government verified pricing</span>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">Income-based affordable</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">$57 - $800</div>
            <div className="text-sm text-green-600 dark:text-green-400 font-medium">HUD verified</div>
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
          {(hudCount as any)?.total || '4,771'} affordable communities • 
          Government transparency and income-based options
        </p>
        
        {/* Platform Promise Box */}
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-6">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <span className="font-semibold">Platform Promise:</span> Not all senior housing requires a six-figure budget. 
            MySeniorValet shows everything — from $0 HUD properties to full-service memory care.
          </p>
        </div>
      
        <div className="relative">
          {/* Navigation Arrows */}
          <Button
            variant="ghost"
            size="icon"
            data-testid="button-scroll-left-hud"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-gray-700 rounded-full"
            onClick={() => scrollSlider('left')}
          >
            <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            data-testid="button-scroll-right-hud"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-gray-700 rounded-full"
            onClick={() => scrollSlider('right')}
          >
            <ChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </Button>
          
          {/* HUD Communities Carousel */}
          <div 
            ref={hudSliderRef} 
            className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-hide" 
            style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {(!hudProperties || (hudProperties as any[]).length === 0) ? (
              // Loading skeleton cards
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex-shrink-0 w-80 h-[520px] bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
                  <div className="h-48 bg-gradient-to-br from-green-200 to-emerald-200 dark:from-gray-700 dark:to-gray-800"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : (
              <>
                {/* Display first 10 HUD properties */}
                {((hudProperties as any[]) || []).slice(0, 10).map((community: any, index: number) => (
                  <Link key={`hud-${community.id}-${index}`} href={`/community/${community.id}`}>
                    <FeaturedExcellenceCard 
                      community={community} 
                      index={index} 
                      disableAutoPhotoLoad={true} 
                      compact 
                    />
                  </Link>
                ))}
                
                {/* View More Card */}
                <Link to="/search?certified=hud" data-testid="link-view-all-hud">
                  <div className="flex-shrink-0 w-80 h-[520px] border-2 border-green-300 dark:border-green-600 hover:shadow-xl transition-all cursor-pointer group bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
                    <div className="h-48 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 flex items-center justify-center">
                      <div className="text-center p-6">
                        <div className="text-5xl mb-3">🏠</div>
                        <div className="text-lg font-bold text-green-800 dark:text-green-200">View All HUD Communities</div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100 mb-2">
                        Explore {(hudCount as any)?.total || '4,771'}+ HUD Properties
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Discover affordable senior housing options with government-verified pricing across the nation.
                      </p>
                      <Button data-testid="button-browse-hud" className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white">
                        Browse All HUD Communities →
                      </Button>
                    </div>
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}