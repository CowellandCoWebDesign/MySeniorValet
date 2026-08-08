import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { CommunityGrid } from '@/components/CommunityGrid';
import { Home } from 'lucide-react';
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
  ].slice(0, 8);

  const isLoading = coastalLoading || trendingLoading;

  return (
    <section className="px-4 py-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Section header — same chrome as the directory's "Recently Added" grid */}
        <div className="flex items-center gap-3 mb-6">
          <Home className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Featured & Coastal Communities
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Premium communities with exceptional amenities and coastal charm
            </p>
          </div>
        </div>

        <CommunityGrid
          communities={premiumCommunities}
          isLoading={isLoading}
          emptyMessage="No featured communities available right now."
          layout="slider"
        />

        {/* More Featured Communities */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-10 mt-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                More Recommended Communities
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Additional featured selections
              </p>
            </div>
            <Link href="/map-search?featured=true">
              <Button variant="outline">View All Featured</Button>
            </Link>
          </div>

          <CommunityGrid
            communities={(featuredCommunities as any[]).slice(4, 8)}
            isLoading={isLoading}
            skeletonCount={4}
            emptyMessage="No additional communities to show."
            layout="slider"
          />
        </div>
      </div>
    </section>
  );
}
