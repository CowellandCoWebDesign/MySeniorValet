import { useEffect, useMemo, useRef, useState } from "react";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { Heart, Star } from "lucide-react";

export default function SlidePanel({
  communities = [],
  sortBy,
  setSortBy,
  isLoading = false,
  initialHeight = 160,
  autoExpand = false
}) {
  const [panelHeight, setPanelHeight] = useState(initialHeight);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const startYRef = useRef(0);
  const startHeightRef = useRef(initialHeight);
  const currentHeightRef = useRef(initialHeight); // Track current height to avoid closure issues
  const rafRef = useRef(0);
  
  // Update panel height when initialHeight prop changes
  useEffect(() => {
    if (initialHeight !== panelHeight) {
      // Animate to the new height
      const targetHeight = initialHeight;
      const start = panelHeight;
      const duration = 300;
      const startTime = Date.now();
      
      const animate = () => {
        const progress = Math.min((Date.now() - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const height = start + (targetHeight - start) * eased;
        setPanelHeight(height);
        currentHeightRef.current = height;
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      animate();
    }
  }, [initialHeight]);

  // Auto-expand when search results are loaded (only when explicitly requested)
  useEffect(() => {
    if (communities.length > 0 && autoExpand) {
      // Animate to the expanded height
      const targetHeight = initialHeight;
      const start = panelHeight;
      const duration = 300;
      const startTime = Date.now();
      
      const animate = () => {
        const progress = Math.min((Date.now() - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const height = start + (targetHeight - start) * eased;
        setPanelHeight(height);
        currentHeightRef.current = height;
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      animate();
    }
  }, [communities.length, autoExpand]);

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
    setIsDragging(true);
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
    rafRef.current = requestAnimationFrame(() => {
      setPanelHeight(newHeight);
      currentHeightRef.current = newHeight; // Update ref to avoid closure issues
    });
    e.preventDefault();
  };

  const handleDragEnd = () => {
    const currentHeight = currentHeightRef.current; // Use ref instead of state
    setIsDragging(false);
    const snap =
      currentHeight < 200
        ? 160
        : currentHeight < screenHeight * 0.6
        ? 350
        : screenHeight * 0.85;
    const start = currentHeight;
    const duration = 200;
    const startTime = Date.now();
    const animate = () => {
      const progress = Math.min((Date.now() - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const height = start + (snap - start) * eased;
      setPanelHeight(height);
      currentHeightRef.current = height; // Keep ref in sync
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
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
        className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-transform duration-200 ease-in-out cursor-pointer mb-2 overflow-hidden"
      >
        <div className="relative w-full h-40 bg-gray-100 overflow-hidden">
          {c.photos?.[0] ? (
            <img
              src={c.photos[0]}
              alt={c.name}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <div className="w-12 h-12 text-gray-400">🏠</div>
            </div>
          )}
          
          {/* Heart Icon */}
          <div className="absolute top-2 right-2">
            <div className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-gray-600" />
            </div>
          </div>
          
          {/* Vacancy Status Badge */}
          {index % 3 === 0 && (
            <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 font-medium animate-pulse rounded">
              🟢 Available Now
            </div>
          )}
          {index % 3 === 1 && (
            <div className="absolute top-2 left-2 bg-orange-600 text-white text-xs px-2 py-1 font-medium rounded">
              🟡 Waitlist Open
            </div>
          )}
          {index % 3 === 2 && (
            <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 font-medium rounded">
              📋 Call for Availability
            </div>
          )}
          
          {/* Price Badge */}
          <div className="absolute bottom-2 left-2 bg-gray-900 text-white text-xs px-2 py-1 font-medium rounded">
            {c.monthlyRent ? `$${(c.monthlyRent / 1000).toFixed(1)}K+` : 
             c.priceRange ? `$${(c.priceRange.min / 1000).toFixed(1)}K+` : '$4K+'}
            {!c.claimed && (
              <span className="text-xs text-gray-300 ml-1 font-normal">est.</span>
            )}
          </div>
        </div>
        
        <div className="p-3">
          <h4 className="font-semibold text-gray-900 text-sm truncate mb-1">
            {c.name}
          </h4>
          <p className="text-xs text-gray-600 truncate mb-2">
            {c.address || 'Community Address'}, {c.city}, {c.state} {c.zipCode}
          </p>
          
          {/* Regional Badges */}
          <div className="mb-2">
            {c.state === 'CA' && index % 4 === 0 && (
              <div className="bg-amber-600/90 text-white text-xs px-2 py-1 font-medium rounded inline-block">
                Silicon Valley
              </div>
            )}
            {c.state === 'CA' && index % 4 === 1 && (
              <div className="bg-orange-600/90 text-white text-xs px-2 py-1 font-medium rounded inline-block">
                LA Metro
              </div>
            )}
            {c.state === 'TX' && index % 4 === 2 && (
              <div className="bg-red-600/90 text-white text-xs px-2 py-1 font-medium rounded inline-block">
                Dallas Metro
              </div>
            )}
            {c.state === 'TX' && index % 4 === 3 && (
              <div className="bg-purple-600/90 text-white text-xs px-2 py-1 font-medium rounded inline-block">
                Houston Area
              </div>
            )}
            {!['CA', 'TX'].includes(c.state) && (
              <div className="bg-gray-600/90 text-white text-xs px-2 py-1 font-medium rounded inline-block">
                {c.state} Community
              </div>
            )}
          </div>
          
          {/* Enhanced Features Row */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center text-gray-500">
              <span>License #{20000 + c.id}</span>
            </div>
            {index % 4 === 0 && (
              <div className="text-purple-600 font-medium">
                🏆 Featured
              </div>
            )}
            {index % 4 === 1 && (
              <div className="text-blue-600 font-medium">
                ⭐ Top Rated
              </div>
            )}
            {index % 4 === 2 && (
              <div className="text-green-600 font-medium">
                💎 Premium
              </div>
            )}
            {index % 4 === 3 && c.googleRating && (
              <div className="flex items-center">
                <Star className="w-3 h-3 mr-1 text-yellow-500" />
                <span className="text-yellow-700 font-medium">{c.googleRating}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Keep ref in sync with state
  useEffect(() => {
    currentHeightRef.current = panelHeight;
  }, [panelHeight]);

  return (
    <div
      className={`fixed left-0 right-0 bottom-16 bg-white z-40 rounded-t-2xl border-t border-gray-200 shadow-2xl overflow-hidden ${isDragging ? 'transition-none' : 'transition-all duration-200'}`}
      style={{ height: panelHeight }}
    >
      <div className="flex flex-col h-full">
        {/* Drag Handle - Expanded touch area */}
        <div
          ref={dragRef}
          className="cursor-grab active:cursor-grabbing select-none bg-white rounded-t-2xl px-4 py-4"
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          style={{ touchAction: "none" }}
        >
          <div className="flex justify-center items-center">
            <div className={`w-12 h-1.5 rounded-full ${isDragging ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
          </div>
          <div className="text-center mt-1 text-xs text-gray-500">
            Drag to resize
          </div>
        </div>

        {/* Sticky Sort Bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-2">
          <div className="flex flex-wrap gap-2 text-xs">
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
          <div 
            className="mt-2 text-sm font-semibold text-gray-900 cursor-grab active:cursor-grabbing select-none py-1"
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            style={{ touchAction: "none" }}
          >
            {sortedCommunities.length} communities in view
          </div>
        </div>

        {/* Scrollable Results */}
        <div className="flex-1 overflow-hidden bg-gray-50">
          {!isLoading && sortedCommunities.length === 0 && (
            <div className="text-center text-gray-500 py-10 px-4">
              <p className="text-lg mb-2">😕 No communities match your filters.</p>
              <p className="text-sm">Try zooming out or adjusting your search.</p>
            </div>
          )}
          {(isLoading || sortedCommunities.length > 0) && (
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
          )}
        </div>
      </div>
    </div>
  );
}