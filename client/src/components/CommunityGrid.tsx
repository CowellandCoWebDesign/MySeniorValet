import { CommunityCard, type CommunityCardVariant } from "@/components/CommunityCard";

/**
 * Shared presentation for every "communities" section (home + directory).
 *
 * The directory's "Recently Added Communities" grid is the reference look:
 * a responsive multi-column grid of `CommunityCard variant="grid"`. This
 * component renders that exact grid (plus matching loading skeletons and an
 * empty state) so the various sections can never drift apart again.
 *
 * It is body-only: each section keeps its own title/intro/header chrome.
 */

const GRID_CLASS = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";

interface CommunityGridProps {
  communities: any[];
  isLoading?: boolean;
  skeletonCount?: number;
  emptyMessage?: string;
  variant?: CommunityCardVariant;
  className?: string;
}

export function CommunityGrid({
  communities,
  isLoading = false,
  skeletonCount = 8,
  emptyMessage = "No communities to show yet.",
  variant = "grid",
  className = "",
}: CommunityGridProps) {
  if (isLoading) {
    return (
      <div className={`${GRID_CLASS} ${className}`}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div
            key={i}
            className="bg-gray-100 dark:bg-gray-800 rounded-xl h-52 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!communities || communities.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-10">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`${GRID_CLASS} ${className}`}>
      {communities.map((community: any, index: number) => (
        <CommunityCard
          key={community.id ?? index}
          community={community}
          variant={variant}
        />
      ))}
    </div>
  );
}

export default CommunityGrid;
