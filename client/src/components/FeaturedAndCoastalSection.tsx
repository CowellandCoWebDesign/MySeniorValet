import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EnhancedCommunityCard } from '@/components/EnhancedCommunityCard';
import { Home, Heart } from 'lucide-react';
import { Link } from 'wouter';

export function FeaturedAndCoastalSection() {
  // Fetch trending communities for featured section
  const { data: trendingCommunities, isLoading: trendingLoading } = useQuery({
    queryKey: ["/api/communities/trending"],
    retry: false,
    staleTime: 0,
  });

  // Coastal communities
  const { data: coastalCommunities, isLoading: coastalLoading } = useQuery({
    queryKey: ["/api/communities/coastal"],
    retry: false,
    staleTime: 0,
  });

  const featuredCommunities = (trendingCommunities as any[])?.slice(0, 8) || [];
  
  // Combine coastal and featured communities for the premium section
  const premiumCommunities = [
    ...((coastalCommunities as any[]) || []).slice(0, 4),
    ...((featuredCommunities as any[]) || []).slice(0, 4)
  ];

  return (
    <>
      {/* Featured & Coastal Communities Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-display font-bold text-gray-900 dark:text-white mb-6">
              Featured & Coastal Communities
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Premium communities with exceptional amenities and coastal charm
            </p>
            
            <div className="flex items-center justify-center space-x-6 mt-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-lg text-purple-700 dark:text-purple-300 font-medium">Premium communities</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-lg text-blue-700 dark:text-blue-300 font-medium">Ocean views available</span>
              </div>
            </div>
            
            <div className="text-right mt-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">$3,200 - $4,800</div>
              <div className="text-lg text-purple-600 dark:text-purple-300 font-medium">Featured & coastal pricing</div>
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
            {(((coastalCommunities as any[])?.length || 0) + ((featuredCommunities as any[])?.length || 0))} premium communities • 
            Featured selections and coastal charm
          </p>
        
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Show combined premium communities (coastal + featured) */}
            {(coastalLoading || trendingLoading) ? (
              // Loading skeleton cards
              Array.from({ length: 4 }).map((_, index) => (
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
              premiumCommunities.slice(0, 8).map((community: any, index) => (
                <EnhancedCommunityCard
                  key={`premium-${community.id}-${index}`}
                  community={community}
                  index={index}
                  variant={index < 4 ? 'coastal' : 'featured'}
                />
              ))
            )}
          </div>

          {/* More Featured Communities Section */}
          <div className="border-t border-gray-200 dark:border-gray-600 pt-12">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                More Recommended Communities
              </h3>
              <Link href="/search?featured=true">
                <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-900/20">
                  View All Featured
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Show remaining recommended communities */}
              {((featuredCommunities as any[]).slice(4, 8)).map((community: any, index: number) => (
                <Link key={`more-featured-${community.id}-${index}`} href={`/community/${community.id}`}>
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
                      
                      {/* Featured Badge */}
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-amber-500 text-white px-2 py-1 text-xs font-medium">
                          🏆 Featured
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
                        {community?.name || 'Community Name'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 truncate">
                        {community?.city || 'City'}, {community?.state || 'State'}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          {community?.priceRange?.min && community?.priceRange?.max ? 
                            `$${community.priceRange.min.toLocaleString()}-$${community.priceRange.max.toLocaleString()}` :
                            '$2,800-$4,200'
                          }
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {community?.careTypes?.[0] || 'Senior Living'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}