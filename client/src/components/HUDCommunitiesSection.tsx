import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { ChevronLeft, ChevronRight, Home, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    <div className="space-y-6">
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
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-full p-3 shadow-xl opacity-0 md:opacity-100 group-hover:opacity-100 transition-all duration-200 hover:scale-110 hover:bg-white dark:hover:bg-gray-800"
          onClick={() => scrollSlider('left')}
        >
          <ChevronLeft className="h-6 w-6 text-green-600 dark:text-green-400" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          data-testid="button-scroll-right-hud"
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-full p-3 shadow-xl opacity-0 md:opacity-100 group-hover:opacity-100 transition-all duration-200 hover:scale-110 hover:bg-white dark:hover:bg-gray-800"
          onClick={() => scrollSlider('right')}
        >
          <ChevronRight className="h-6 w-6 text-green-600 dark:text-green-400" />
        </Button>
        
        {/* HUD Communities Carousel */}
        <div 
          ref={hudSliderRef} 
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2" 
          style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {(!hudProperties || (hudProperties as any[]).length === 0) ? (
            // Loading skeleton cards
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex-shrink-0 w-[400px]">
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
          ) : (
            <>
              {/* Display first 10 HUD properties */}
              {((hudProperties as any[]) || []).slice(0, 10).map((community: any, index: number) => (
                <div key={`hud-${community.id}-${index}`} className="flex-shrink-0">
                  <Link href={`/community/${community.id}`}>
                    <FeaturedExcellenceCard 
                      community={community} 
                      index={index} 
                      disableAutoPhotoLoad={true} 
                      compact 
                    />
                  </Link>
                </div>
              ))}
              
              {/* View More Card */}
              <div className="flex-shrink-0">
                <Link to="/search?certified=hud" data-testid="link-view-all-hud">
                  <div className="w-[400px] h-[520px] border-2 border-green-300 dark:border-green-600 hover:shadow-xl transition-all cursor-pointer group bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
                    <div className="h-48 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
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
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Quick Stats Bar */}
      <div className="flex flex-wrap justify-center gap-3">
        <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30 px-4 py-2">
          <span className="font-medium">Government-verified pricing from $57/month</span>
        </Badge>
      </div>
    </div>
  );
}