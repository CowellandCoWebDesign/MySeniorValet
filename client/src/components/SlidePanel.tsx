import { useEffect, useMemo, useRef, useState } from "react";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { Heart, Star } from "lucide-react";

export default function SlidePanel({
  communities = [],
  sortBy,
  setSortBy,
  isLoading = false
}) {
  const [panelHeight, setPanelHeight] = useState(120);
  const dragRef = useRef(null);
  const startYRef = useRef(0);
  const startHeightRef = useRef(120);
  const rafRef = useRef(0);

  const screenHeight =
    typeof window !== "undefined" ? window.innerHeight : 800;

  const sortedCommunities = useMemo(() => {
    return [...communities].sort((a, b) => {
      switch (sortBy) {
        case "priceAsc":
          return (a.priceRange?.min || 0) - (b.priceRange?.min || 0);
        case "priceDesc":
          return (b.priceRange?.max || 0) - (a.priceRange?.max || 0);
        case "rating":
          return (b.googleRating || 0) - (a.googleRating || 0);
        case "nameAsc":
          return a.name.localeCompare(b.name);
        case "newest":
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default:
          return 0;
      }
    });
  }, [communities, sortBy]);

  const handleDragStart = (e) => {
    startYRef.current =
      "touches" in e ? e.touches[0].clientY : e.clientY;
    startHeightRef.current = panelHeight;
    document.addEventListener("mousemove", handleDrag);
    document.addEventListener("touchmove", handleDrag, { passive: false });
    document.addEventListener("mouseup", handleDragEnd);
    document.addEventListener("touchend", handleDragEnd);
    e.preventDefault();
  };

  const handleDrag = (e) => {
    const currentY =
      "touches" in e ? e.touches[0].clientY : e.clientY;
    const deltaY = startYRef.current - currentY;
    const newHeight = Math.max(
      120,
      Math.min(screenHeight * 0.9, startHeightRef.current + deltaY)
    );
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => setPanelHeight(newHeight));
    e.preventDefault();
  };

  const handleDragEnd = () => {
    const snap =
      panelHeight < 180
        ? 120
        : panelHeight < screenHeight * 0.6
        ? 350
        : screenHeight * 0.85;
    const start = panelHeight;
    const duration = 200;
    const startTime = Date.now();
    const animate = () => {
      const progress = Math.min((Date.now() - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const height = start + (snap - start) * eased;
      setPanelHeight(height);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    animate();
    document.removeEventListener("mousemove", handleDrag);
    document.removeEventListener("touchmove", handleDrag);
    document.removeEventListener("mouseup", handleDragEnd);
    document.removeEventListener("touchend", handleDragEnd);
  };

  const Row = ({ index, style }) => {
    if (isLoading) {
      return (
        <div
          style={style}
          className="animate-pulse bg-white rounded-xl p-4 border border-gray-200 space-y-4"
        >
          <div className="bg-gray-200 h-36 w-full rounded-md"></div>
          <div className="h-4 bg-gray-300 w-3/4 rounded"></div>
          <div className="h-3 bg-gray-200 w-1/2 rounded"></div>
        </div>
      );
    }

    const c = sortedCommunities[index];
    return (
      <div
        key={c.id}
        style={style}
        onClick={() =>
          (window.location.href = `/community/${c.id}`)
        }
        className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:scale-[1.01] transition-transform duration-200 ease-in-out cursor-pointer mb-2"
      >
        <div className="relative w-full h-40 bg-gray-100 rounded-md overflow-hidden">
          {c.photos?.[0] && (
            <img
              src={c.photos[0]}
              alt={c.name}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          )}
          <button className="absolute top-2 right-2 bg-white/80 rounded-full p-1">
            <Heart className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <h4 className="mt-3 font-semibold text-gray-900 text-sm truncate">
          {c.name}
        </h4>
        <p className="text-xs text-gray-600 truncate">
          {c.address}, {c.city}, {c.state}
        </p>
        <div className="flex justify-between items-center mt-2">
          <div className="text-sm text-blue-600 font-medium">
            {c.priceRange
              ? `$${c.priceRange.min?.toLocaleString()} - $${c.priceRange.max?.toLocaleString()}/mo`
              : "Contact for pricing"}
            {c.priceRange && !c.isVerified && (
              <span className="ml-1 text-xs text-yellow-600">
                (Estimated)
              </span>
            )}
          </div>
          {c.googleRating && (
            <div className="flex items-center bg-yellow-50 px-2 py-0.5 rounded-full text-xs font-semibold text-yellow-700">
              <Star className="w-3 h-3 mr-1 text-yellow-500" />{" "}
              {c.googleRating}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed left-0 right-0 bottom-0 bg-white z-40 rounded-t-2xl border-t border-gray-200 shadow-2xl overflow-hidden"
      style={{ height: panelHeight }}
    >
      <div className="flex flex-col h-full">
        <div
          ref={dragRef}
          className="cursor-grab active:cursor-grabbing select-none bg-white rounded-t-2xl"
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          style={{ touchAction: "none" }}
        >
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
          </div>
          <div className="px-4 pb-2">
            <div className="flex flex-wrap gap-2 overflow-x-auto text-xs text-gray-600">
              <button
                onClick={() => setSortBy("priceAsc")}
                className={`px-3 py-1 rounded-full border ${
                  sortBy === "priceAsc"
                    ? "bg-blue-100 text-blue-700 border-blue-300"
                    : "border-gray-200"
                }`}
              >
                💵 Low to High
              </button>
              <button
                onClick={() => setSortBy("priceDesc")}
                className={`px-3 py-1 rounded-full border ${
                  sortBy === "priceDesc"
                    ? "bg-blue-100 text-blue-700 border-blue-300"
                    : "border-gray-200"
                }`}
              >
                💰 High to Low
              </button>
              <button
                onClick={() => setSortBy("rating")}
                className={`px-3 py-1 rounded-full border ${
                  sortBy === "rating"
                    ? "bg-blue-100 text-blue-700 border-blue-300"
                    : "border-gray-200"
                }`}
              >
                ⭐ Top Rated
              </button>
              <button
                onClick={() => setSortBy("newest")}
                className={`px-3 py-1 rounded-full border ${
                  sortBy === "newest"
                    ? "bg-blue-100 text-blue-700 border-blue-300"
                    : "border-gray-200"
                }`}
              >
                🕒 Newest
              </button>
              <button
                onClick={() => setSortBy("nameAsc")}
                className={`px-3 py-1 rounded-full border ${
                  sortBy === "nameAsc"
                    ? "bg-blue-100 text-blue-700 border-blue-300"
                    : "border-gray-200"
                }`}
              >
                🔤 Name
              </button>
            </div>
            <div className="mt-2 text-sm font-semibold text-gray-900">
              {sortedCommunities.length} communities in view
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-gray-50">
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                width={width}
                itemCount={isLoading ? 10 : sortedCommunities.length}
                itemSize={310}
              >
                {Row}
              </List>
            )}
          </AutoSizer>
        </div>
      </div>
    </div>
  );
}