import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EnhancedCommunityCard } from '@/components/EnhancedCommunityCard';
import { Home, Shield, DollarSign } from 'lucide-react';
import { Link } from 'wouter';

export function HudCommunitiesSection() {
  // Fetch HUD communities with verified pricing
  const { data: hudCommunities, isLoading: hudLoading } = useQuery({
    queryKey: ["/api/communities/hud-featured"],
    retry: false,
    staleTime: 0,
  });

  const displayCommunities = (hudCommunities as any[])?.slice(0, 8) || [];

  return (
    <>
      {/* HUD Communities with Official Pricing Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-display font-bold text-gray-900 dark:text-white mb-6">
              HUD Communities with Official Pricing
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Government-verified affordable housing with transparent, official pricing
            </p>
            
            <div className="flex items-center justify-center space-x-6 mt-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-lg text-emerald-700 dark:text-emerald-300 font-medium">HUD verified pricing</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-lg text-green-700 dark:text-green-300 font-medium">Government sourced</span>
              </div>
            </div>
            
            <div className="text-right mt-4">
              <div className="inline-block">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">$57 - $375</div>
                <div className="text-lg text-emerald-600 dark:text-emerald-300 font-medium">HUD official pricing</div>
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
            {((hudCommunities as any[])?.length || 0)} HUD properties • 
            Official government pricing and verified availability
          </p>
        
          {/* Horizontal Scrolling Container */}
          <div className="relative mb-12">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex space-x-6 pb-4" style={{ width: 'max-content' }}>
                {/* Show HUD communities in horizontal slider */}
                {hudLoading ? (
                  // Loading skeleton cards
                  Array.from({ length: 8 }).map((_, index) => (
                    <Card key={index} className="flex-shrink-0 w-80 overflow-hidden border border-gray-200 animate-pulse">
                      <div className="aspect-[4/3] bg-gray-200"></div>
                      <CardContent className="p-4">
                        <div className="h-6 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded mb-1"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                      </CardContent>
                    </Card>
                  ))
                ) : displayCommunities.length > 0 ? (
                  displayCommunities.map((community, index) => (
                    <div key={community.id || index} className="flex-shrink-0 w-80 group">
                      <EnhancedCommunityCard
                        community={community}
                        variant="hud"
                        index={index}
                      />
                    </div>
                  ))
                ) : (
                  <div className="flex-shrink-0 w-full text-center py-12">
                    <div className="flex justify-center mb-4">
                      <div className="bg-emerald-100 dark:bg-emerald-900/50 rounded-full p-4">
                        <Home className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      HUD Communities Loading
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      We're loading verified HUD properties with official pricing...
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Scroll indicator */}
            {displayCommunities.length > 3 && (
              <div className="text-center mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ← Scroll to see more HUD communities →
                </p>
              </div>
            )}
          </div>

          {/* HUD Features Highlight */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-600 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Government Verified</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  All pricing and availability data comes directly from HUD official databases
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Transparent Pricing</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Real monthly rent amounts from $57 to $375, no hidden fees or surprises
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Home className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Quality Housing</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Safe, well-maintained communities with occupancy rates and management details
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Link href="/affordable-housing">
              <Button className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                <Shield className="mr-3 h-6 w-6" />
                Explore All HUD Communities
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}