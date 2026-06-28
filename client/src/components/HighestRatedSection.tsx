import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CommunityCard } from '@/components/CommunityCard';
import { Star, Home, Heart } from 'lucide-react';
import { Link } from 'wouter';
import { getCommunityUrl } from '@/lib/community-url';

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
              <span className="text-lg text-amber-700 dark:text-amber-300 font-medium">Ranked by verified family reviews</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-lg text-yellow-700 dark:text-yellow-300 font-medium">Real ratings from real families</span>
            </div>
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
              <CommunityCard
                key={`highest-rated-${community.id}-${index}`}
                community={community}
                variant="grid"
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
              <CommunityCard
                key={`more-rated-${community.id}-${index}`}
                community={community}
                variant="grid"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}