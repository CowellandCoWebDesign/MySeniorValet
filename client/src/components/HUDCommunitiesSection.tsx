import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { ChevronLeft, ChevronRight, Home, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FeaturedExcellenceCard } from '@/components/FeaturedExcellenceCard';
import { CommunityCard } from '@/components/CommunityCard';

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

  // Scroll navigation function - card width 280px + gap 16px
  const scrollSlider = (direction: 'left' | 'right') => {
    if (hudSliderRef.current) {
      const scrollAmount = 296; // Width of one card (280px) plus gap (16px)
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
    <div className="space-y-4">
      {/* Section Title */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Shield className="w-7 h-7 text-green-500" />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            HUD Affordable Communities
          </h2>
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 text-sm font-bold">
            $57-$800
          </Badge>
        </div>
        <p className="text-base text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          {(hudCount as any)?.total || '4,771'} government-verified affordable housing options • Not all senior care requires a six-figure budget
        </p>
      </div>

      {/* Communities Carousel */}
      <div className="relative group">
        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          data-testid="button-scroll-left-hud"
          className="hidden md:inline-flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-full p-3 shadow-xl transition-all duration-200 hover:scale-110 hover:bg-white dark:hover:bg-gray-800"
          onClick={() => scrollSlider('left')}
        >
          <ChevronLeft className="h-6 w-6 text-green-600 dark:text-green-400" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          data-testid="button-scroll-right-hud"
          className="hidden md:inline-flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-full p-3 shadow-xl transition-all duration-200 hover:scale-110 hover:bg-white dark:hover:bg-gray-800"
          onClick={() => scrollSlider('right')}
        >
          <ChevronRight className="h-6 w-6 text-green-600 dark:text-green-400" />
        </Button>
        
        {/* HUD Communities Carousel */}
        <div 
          ref={hudSliderRef} 
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-2" 
          style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {(!hudProperties || (hudProperties as any[]).length === 0) ? (
            // Loading skeleton cards - matching FeaturedExcellenceCard dimensions
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex-shrink-0 w-[85%] sm:w-[280px] min-w-[85%] sm:min-w-[280px] h-[380px] bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="h-36 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700"></div>
                <div className="p-3 space-y-3">
                  <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded w-1/2"></div>
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded w-2/3"></div>
                  <div className="flex gap-2 mt-3">
                    <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded w-16"></div>
                    <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <>
              {/* Display first 10 HUD properties */}
              {((hudProperties as any[]) || []).slice(0, 10).map((community: any, index: number) => (
                <div key={`hud-${community.id}-${index}`} className="flex-shrink-0 h-full">
                  <CommunityCard community={community} variant="compact" />
                </div>
              ))}
              
              {/* View More Card - matching card dimensions */}
              <div className="flex-shrink-0">
                <Link to="/search?certified=hud" data-testid="link-view-all-hud">
                  <div className="w-[85%] sm:w-[280px] min-w-[85%] sm:min-w-[280px] h-full border-2 border-green-300 dark:border-green-600 hover:shadow-xl transition-all cursor-pointer group bg-white dark:bg-gray-900 rounded-xl overflow-hidden flex flex-col">
                    <div className="h-36 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center flex-shrink-0">
                      <div className="text-center p-4">
                        <div className="text-4xl mb-2">🏠</div>
                        <div className="text-sm font-bold text-green-800 dark:text-green-200">View All HUD</div>
                      </div>
                    </div>
                    <div className="p-3 flex flex-col flex-grow">
                      <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
                        {(hudCount as any)?.total || '4,771'}+ HUD Properties
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-xs mb-2 line-clamp-2">
                        Affordable housing with verified pricing
                      </p>
                      <Button data-testid="button-browse-hud" size="sm" className="w-full mt-auto bg-green-600 hover:bg-green-700 text-white text-xs">
                        Browse All →
                      </Button>
                    </div>
                  </div>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Quick Stats Bar */}
      <div className="flex flex-wrap justify-center gap-3 -mt-2">
        <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30 px-4 py-2">
          <span className="font-medium">Government-verified pricing from $57/month</span>
        </Badge>
      </div>
    </div>
  );
}