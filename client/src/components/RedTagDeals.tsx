import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag, Percent, Calendar, TrendingDown, CheckCircle, Star, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CommunityGrid, type CommunityGridLayout } from "@/components/CommunityGrid";

interface RedTagDealsProps {
  communityCount?: string;
  hideHeader?: boolean;
  /** "grid" (directory default) or "slider" (home page rows). */
  layout?: CommunityGridLayout;
}

export function RedTagDeals({ communityCount, hideHeader = false, layout = "grid" }: RedTagDealsProps) {
  // Single source of truth: the admin-managed featured_communities table,
  // served by /api/featured-communities. No hardcoded IDs, no fabricated
  // marketing copy, no stock photos — real community data only.
  const { data: featuredCommunities, isLoading } = useQuery({
    queryKey: ['/api/featured-communities'],
    retry: 1,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // The endpoint returns records shaped { id, communityId, community, ... }.
  // Feed the real, enriched `community` object straight into the shared grid so
  // photos, name, city/state, care types, and "Contact for pricing" all come
  // from authentic data (Golden Data Rule).
  const featuredCommunityCards = Array.isArray(featuredCommunities)
    ? featuredCommunities
        .map((featured: any) => featured?.community)
        .filter((c: any) => c && c.id)
    : [];

  return (
    <div className="space-y-4">
      {/* Section Title - Always visible */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Star className="w-7 h-7 text-orange-500" />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Featured Excellence Communities
          </h2>
          <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1 text-sm font-bold">
            Premium
          </Badge>
        </div>
        <p className="text-base text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Hand-picked exceptional senior living communities
        </p>
      </div>

      {/* Featured Communities Alert - Extra details (hidden when hideHeader is true) */}
      {!hideHeader && (
        <Card className="border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950">
          <CardContent className="py-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-full">
                  <Star className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Excellence Showcase</p>
                  <p className="text-xs text-muted-foreground">Hand-picked premium communities</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {communityCount && (
                  <div className="flex items-center gap-1.5 bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded-full">
                    <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-sm font-bold text-green-700 dark:text-green-400">{communityCount}</span>
                    <span className="text-xs text-green-600 dark:text-green-500 hidden sm:inline">Total</span>
                  </div>
                )}
                <Badge className="bg-orange-600 text-white text-sm px-2 py-1">
                  {featuredCommunityCards.length} Featured
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Featured communities — unified grid (matches the directory reference) */}
      <CommunityGrid
        communities={featuredCommunityCards}
        isLoading={isLoading}
        skeletonCount={8}
        emptyMessage="No featured communities available right now."
        layout={layout}
      />

      {/* Additional Savings Info */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-blue-600" />
            How to Maximize Your Savings
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700 rounded-lg">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              <strong>Authentic Tips:</strong> The savings strategies below are based on real industry data and proven negotiation techniques used by senior living experts.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">Best Times to Move</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Percent className="w-4 h-4 text-green-600 mt-0.5" />
                  <span><strong>Off-season moves (Nov-Feb):</strong> Up to 25% savings</span>
                </li>
                <li className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-blue-600 mt-0.5" />
                  <span><strong>End of month specials:</strong> Many communities offer deals</span>
                </li>
                <li className="flex items-start gap-2">
                  <Tag className="w-4 h-4 text-purple-600 mt-0.5" />
                  <span><strong>Holiday promotions:</strong> Special rates during holidays</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Negotiation Tips</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Ask about unpublished specials and discounts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Compare multiple communities for leverage</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Inquire about waived fees and deposits</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
