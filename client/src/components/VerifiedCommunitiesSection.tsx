import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EnhancedCommunityCard } from '@/components/EnhancedCommunityCard';
import { Shield, Home, Heart, CheckCircle } from 'lucide-react';
import { Link } from 'wouter';

export function VerifiedCommunitiesSection() {
  // Fetch verified communities
  const { data: verifiedCommunities, isLoading: verifiedLoading } = useQuery({
    queryKey: ["/api/communities/verified"],
    retry: false,
    staleTime: 0,
  });

  const topVerifiedCommunities = (verifiedCommunities as any[])?.slice(0, 12) || [];

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-emerald-100 dark:bg-emerald-900/50 rounded-full p-4">
              <Shield className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-display font-bold text-gray-900 dark:text-white mb-6">
            Verified Communities
          </h2>
          <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Transparency leaders with verified data from government sources and regulatory compliance
          </p>
          
          <div className="flex items-center justify-center space-x-6 mt-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-lg text-emerald-700 dark:text-emerald-300 font-medium">Government verified</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-lg text-green-700 dark:text-green-300 font-medium">HUD authenticated</span>
            </div>
          </div>
          
          <div className="text-center mt-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">100% Transparent</div>
            <div className="text-lg text-emerald-600 dark:text-emerald-300 font-medium">Verified pricing & data integrity</div>
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
          {topVerifiedCommunities.length} verified communities • 
          Licensed, inspected, and transparency-committed facilities
        </p>
      
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Show verified communities */}
          {verifiedLoading ? (
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
            topVerifiedCommunities.slice(0, 8).map((community: any, index) => (
              <EnhancedCommunityCard
                key={`verified-${community.id}-${index}`}
                community={community}
                index={index}
                variant="verified"
              />
            ))
          )}
        </div>

        {/* More Verified Communities Section */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              More Verified Communities
            </h3>
            <Link href="/search?verified=true">
              <Button variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-600 dark:text-emerald-300 dark:hover:bg-emerald-900/20">
                <Shield className="w-4 h-4 mr-2" />
                View All Verified
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Show remaining verified communities */}
            {topVerifiedCommunities.slice(8, 12).map((community: any, index: number) => (
              <Link key={`more-verified-${community.id}-${index}`} href={`/community/${community.id}`}>
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
                    
                    {/* Verified Badge */}
                    <div className="absolute top-3 left-3">
                      <div className="bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3 fill-current" />
                        <span>VERIFIED</span>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                      {community.name || 'Verified Community'}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                      {community.city && community.state ? `${community.city}, ${community.state}` : 'Multiple Locations'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        <Shield className="w-4 h-4 inline mr-1" />
                        VERIFIED
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {community.hudPropertyId ? 'HUD ID: ' + community.hudPropertyId.slice(-4) : 
                         community.licenseNumber ? 'Licensed' : 'Verified'}
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