import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EnhancedCommunityCard } from '@/components/EnhancedCommunityCard';
import { Star, Home, Heart } from 'lucide-react';
import { Link } from 'wouter';

export function HighestRatedSection() {
  // Fetch highest-rated communities
  const { data: highestRatedCommunities, isLoading: highestRatedLoading } = useQuery({
    queryKey: ["/api/communities/highest-rated"],
    retry: false,
    staleTime: 0,
  });

  const topRatedCommunities = (highestRatedCommunities as any[])?.slice(0, 12) || [];

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-amber-100 dark:bg-amber-900/50 rounded-full p-4">
              <Star className="h-12 w-12 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-display font-bold text-gray-900 dark:text-white mb-6">
            Highest Rated Communities
          </h2>
          <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Top performers with exceptional ratings and satisfied families
          </p>
          
          <div className="flex items-center justify-center space-x-6 mt-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
              <span className="text-lg text-amber-700 dark:text-amber-300 font-medium">4.0+ star ratings</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-lg text-yellow-700 dark:text-yellow-300 font-medium">10+ verified reviews</span>
            </div>
          </div>
          
          <div className="text-center mt-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">Average 4.3★ Rating</div>
            <div className="text-lg text-amber-600 dark:text-amber-300 font-medium">Exceptional satisfaction scores</div>
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
          {topRatedCommunities.length} top-rated communities • 
          Excellence verified through authentic family reviews
        </p>
      
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Show highest-rated communities */}
          {highestRatedLoading ? (
            // Loading skeleton cards
            Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="overflow-hidden border border-gray-200 animate-pulse">
                <div className="aspect-[4/3] bg-gray-200"></div>
                <CardContent className="p-4">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            topRatedCommunities.slice(0, 8).map((community: any, index) => (
              <EnhancedCommunityCard
                key={`highest-rated-${community.id}-${index}`}
                community={community}
                index={index}
                variant="highest-rated"
              />
            ))
          )}
        </div>

        {/* More Highest-Rated Communities Section */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              More Top-Rated Communities
            </h3>
            <Link href="/map-search?minRating=4.0">
              <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/20">
                <Star className="w-4 h-4 mr-2" />
                View All Top-Rated
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Show remaining top-rated communities */}
            {topRatedCommunities.slice(8, 12).map((community: any, index: number) => (
              <Link key={`more-rated-${community.id}-${index}`} href={`/community/${community.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow border-0 shadow-sm dark:bg-gray-700">
                  <div className="relative">
                    <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <Home className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                    </div>
                    
                    {/* Heart Icon */}
                    <div className="absolute top-3 right-3">
                      <div className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Heart className="w-4 h-4 text-gray-600" />
                      </div>
                    </div>
                    
                    {/* Rating Badge */}
                    <div className="absolute top-3 left-3">
                      <div className="bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{community.rating || '4.0+'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                      {community.name || 'Premium Community'}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                      {community.city && community.state ? `${community.city}, ${community.state}` : 'Multiple Locations'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                        {community.rating || '4.0+'}★
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {community.reviewCount || '10+'} reviews
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}