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

// Horizontal slider row (the home page's signature pattern): smooth scrolling,
// hidden scrollbar, fixed-width cards so several are visible/peeking to signal
// sideways scrollability.
const SLIDER_CLASS = "flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4";
const SLIDER_ITEM_CLASS = "w-72 sm:w-80 flex-shrink-0";
const HIDE_SCROLLBAR_STYLE = { scrollbarWidth: "none", msOverflowStyle: "none" } as const;

export type CommunityGridLayout = "grid" | "slider";

interface CommunityGridProps {
  communities: any[];
  isLoading?: boolean;
  skeletonCount?: number;
  emptyMessage?: string;
  variant?: CommunityCardVariant;
  /** "grid" (directory reference look, default) or "slider" (home page rows). */
  layout?: CommunityGridLayout;
  className?: string;
}

export function CommunityGrid({
  communities,
  isLoading = false,
  skeletonCount = 8,
  emptyMessage = "No communities to show yet.",
  variant = "grid",
  layout = "grid",
  className = "",
}: CommunityGridProps) {
  const isSlider = layout === "slider";
  const containerClass = isSlider ? SLIDER_CLASS : GRID_CLASS;
  const containerStyle = isSlider ? HIDE_SCROLLBAR_STYLE : undefined;

  if (isLoading) {
    return (
      <div className={`${containerClass} ${className}`} style={containerStyle}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div
            key={i}
            className={`bg-gray-100 dark:bg-gray-800 rounded-xl h-52 animate-pulse ${
              isSlider ? SLIDER_ITEM_CLASS : ""
            }`}
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

  if (isSlider) {
    return (
      <div className={`${SLIDER_CLASS} ${className}`} style={containerStyle}>
        {communities.map((community: any, index: number) => (
          <div key={community.id ?? index} className={SLIDER_ITEM_CLASS}>
            <CommunityCard community={community} variant={variant} />
          </div>
        ))}
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
