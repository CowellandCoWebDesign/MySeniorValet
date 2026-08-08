import { useQuery } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CommunityGrid, type CommunityGridLayout } from '@/components/CommunityGrid';

interface RecentlyDiscoveredCommunitiesProps {
  /** "grid" (default, used off the home page) or "slider" (home page rows). */
  layout?: CommunityGridLayout;
}

export function RecentlyDiscoveredCommunities({ layout = "grid" }: RecentlyDiscoveredCommunitiesProps) {
  // Fetch recently discovered communities
  const { data: recentCommunities = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/communities/recently-discovered', { limit: 100 }],
    queryFn: async () => {
      const response = await fetch('/api/communities/recently-discovered?limit=100');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes (was 30 min - too stale for discovery)
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: true, // Refresh when user returns to tab
    refetchOnMount: 'always', // Always check for fresh data when component mounts
  });

  return (
    <div className="space-y-6">
      {/* Section header — same chrome as the directory's "Recently Added" grid */}
      <div className="flex items-center gap-3">
        <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Recently Discovered Communities
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Fresh additions to our database — real communities discovered through our search
          </p>
        </div>
        <Badge className="ml-auto bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 text-sm font-bold">
          🔥 NEW
        </Badge>
      </div>

      <CommunityGrid
        communities={recentCommunities}
        isLoading={isLoading}
        emptyMessage="No recently discovered communities yet. Search for communities to populate this section!"
        layout={layout}
      />
    </div>
  );
}
