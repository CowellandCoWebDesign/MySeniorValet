import { useState, useEffect, useCallback } from "react";
import Map from "@/components/Map";
import { FeaturedExcellenceCard } from "@/components/FeaturedExcellenceCard";
import { Button } from "@/components/ui/button";
import { Rows3, Columns2, MapPin } from "lucide-react";

interface SimplifiedMapPanelProps {
  locationQuery?: string;
}

const CARE_TYPE_FILTERS = [
  { label: "All", value: "all" },
  { label: "Assisted Living", value: "Assisted Living" },
  { label: "Memory Care", value: "Memory Care" },
  { label: "Independent Living", value: "Independent Living" },
  { label: "Skilled Nursing", value: "Skilled Nursing" },
  { label: "HUD / Subsidized", value: "hud-sponsored" },
];

export function SimplifiedMapPanel({ locationQuery }: SimplifiedMapPanelProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194]);
  const [mapZoom, setMapZoom] = useState(10);
  const [mapCommunities, setMapCommunities] = useState<any[]>([]);
  const [mapBounds, setMapBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null);
  const [layoutMode, setLayoutMode] = useState<"vertical" | "horizontal">("vertical");
  const [selectedCareType, setSelectedCareType] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  // Geocode locationQuery whenever it changes and fly the map there
  useEffect(() => {
    if (!locationQuery || locationQuery.trim().length < 2) return;
    const trimmed = locationQuery.trim();
    fetch(`/api/geocode?location=${encodeURIComponent(trimmed)}`)
      .then(r => r.json())
      .then(geo => {
        if (geo?.lat && geo?.lng) {
          setMapCenter([geo.lat, geo.lng]);
          setMapZoom(12);
        }
      })
      .catch(() => {});
  }, [locationQuery]);

  // Fetch communities for current map bounds
  const handleBoundsChange = useCallback((bounds: any) => {
    const west = bounds.getWest?.() ?? bounds.west;
    const south = bounds.getSouth?.() ?? bounds.south;
    const east = bounds.getEast?.() ?? bounds.east;
    const north = bounds.getNorth?.() ?? bounds.north;

    setMapBounds({ north, south, east, west });
    setIsLoading(true);

    fetch(`/api/communities/map-data?bounds=${west},${south},${east},${north}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMapCommunities(data);
        } else if (Array.isArray(data?.communities)) {
          setMapCommunities(data.communities);
        } else if (Array.isArray(data?.results)) {
          setMapCommunities(data.results);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Filter communities by selected care type
  const filteredCommunities = selectedCareType === "all"
    ? mapCommunities
    : mapCommunities.filter(c => {
        const types = (c.careTypes || []).map((t: string) => t.toLowerCase());
        const subtype = (c.communitySubtype || "").toLowerCase();
        if (selectedCareType === "hud-sponsored") {
          return c.hudPropertyId || subtype.includes("hud");
        }
        return types.some((t: string) => t.includes(selectedCareType.toLowerCase())) ||
               subtype.includes(selectedCareType.toLowerCase());
      });

  const communityCount = filteredCommunities.length;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
            {isLoading ? "Loading communities…" : `${communityCount} communities in view`}
          </span>
        </div>

        {/* Layout toggle */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setLayoutMode("vertical")}
            className={`p-1.5 rounded-md transition-colors ${
              layoutMode === "vertical"
                ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
            title="Stacked layout"
          >
            <Rows3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLayoutMode("horizontal")}
            className={`p-1.5 rounded-md transition-colors ${
              layoutMode === "horizontal"
                ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
            title="Side-by-side layout"
          >
            <Columns2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Care type filter row */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex gap-2 overflow-x-auto scrollbar-hide">
        {CARE_TYPE_FILTERS.map(filter => (
          <button
            key={filter.value}
            onClick={() => setSelectedCareType(filter.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedCareType === filter.value
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Main content */}
      {layoutMode === "vertical" ? (
        <div className="flex flex-col">
          {/* Map */}
          <div className="w-full">
            <Map
              center={mapCenter}
              zoom={mapZoom}
              height="360px"
              onBoundsChange={handleBoundsChange}
              onCommunityClick={(community: any) => {
                const el = document.getElementById(`smp-community-${community.id}`);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
            />
          </div>

          {/* Community list */}
          <div className="overflow-y-auto max-h-[480px] divide-y divide-gray-100 dark:divide-gray-800">
            {filteredCommunities.length === 0 && !isLoading && (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                {locationQuery
                  ? "No communities found in this area. Try zooming out or adjusting filters."
                  : "Search a city above to explore communities on the map."}
              </div>
            )}
            {filteredCommunities.map((community: any, index: number) => (
              <div key={community.id} id={`smp-community-${community.id}`} className="p-3">
                <FeaturedExcellenceCard
                  community={{
                    ...community,
                    name: community.name || "Community",
                    city: community.city || "City",
                    state: community.state || "State",
                    rating: community.rating || 4.5,
                    photos: community.photos || [],
                    careTypes: community.careTypes || [],
                    amenities: community.amenities || [],
                    occupancyRate: community.occupancyRate || community.occupancyRateHud || 0,
                    totalUnits: community.totalUnits || community.totalUnitsHud || 100,
                    priceRange: community.priceRange,
                    phone: community.phone,
                    website: community.website,
                  }}
                  index={index}
                  compact={true}
                  disableAutoPhotoLoad={true}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Horizontal: map left, list right */
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="md:border-r border-gray-200 dark:border-gray-700">
            <Map
              center={mapCenter}
              zoom={mapZoom}
              height="520px"
              onBoundsChange={handleBoundsChange}
              onCommunityClick={(community: any) => {
                const el = document.getElementById(`smp-community-${community.id}`);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
            />
          </div>

          <div className="overflow-y-auto max-h-[520px] divide-y divide-gray-100 dark:divide-gray-800">
            {filteredCommunities.length === 0 && !isLoading && (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                {locationQuery
                  ? "No communities found in this area."
                  : "Search a city above to explore communities."}
              </div>
            )}
            {filteredCommunities.map((community: any, index: number) => (
              <div key={community.id} id={`smp-community-${community.id}`} className="p-3">
                <FeaturedExcellenceCard
                  community={{
                    ...community,
                    name: community.name || "Community",
                    city: community.city || "City",
                    state: community.state || "State",
                    rating: community.rating || 4.5,
                    photos: community.photos || [],
                    careTypes: community.careTypes || [],
                    amenities: community.amenities || [],
                    occupancyRate: community.occupancyRate || community.occupancyRateHud || 0,
                    totalUnits: community.totalUnits || community.totalUnitsHud || 100,
                    priceRange: community.priceRange,
                    phone: community.phone,
                    website: community.website,
                  }}
                  index={index}
                  compact={true}
                  disableAutoPhotoLoad={true}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
