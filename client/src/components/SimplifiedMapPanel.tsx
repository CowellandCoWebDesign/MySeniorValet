import { useState, useEffect, useCallback, useMemo } from "react";
import Map from "@/components/Map";
import { FeaturedExcellenceCard } from "@/components/FeaturedExcellenceCard";
import { Button } from "@/components/ui/button";
import { Rows3, Columns2, MapPin, Sparkles } from "lucide-react";
import { AutocompleteSearch } from "@/components/AutocompleteSearch";

interface SimplifiedMapPanelProps {
  locationQuery?: string;
  discoveredCommunities?: any[];
}

const CARE_TYPE_FILTERS = [
  { label: "All", value: "all" },
  { label: "Assisted Living", value: "Assisted Living" },
  { label: "Memory Care", value: "Memory Care" },
  { label: "Independent Living", value: "Independent Living" },
  { label: "Skilled Nursing", value: "Skilled Nursing" },
  { label: "HUD / Subsidized", value: "hud-sponsored" },
];

const CARE_KEYWORDS: { key: string; label: string }[] = [
  { key: "memory care", label: "Memory Care" },
  { key: "assisted living", label: "Assisted Living" },
  { key: "independent living", label: "Independent Living" },
  { key: "skilled nursing", label: "Skilled Nursing" },
  { key: "nursing home", label: "Skilled Nursing" },
  { key: "hud", label: "hud-sponsored" },
  { key: "subsidized", label: "hud-sponsored" },
];

export function SimplifiedMapPanel({ locationQuery, discoveredCommunities = [] }: SimplifiedMapPanelProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.52, -122.1]);
  const [mapZoom, setMapZoom] = useState(9);
  const [searchValue, setSearchValue] = useState("");
  const [mapCommunities, setMapCommunities] = useState<any[]>([]);
  const [mapBounds, setMapBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null);
  const [layoutMode, setLayoutMode] = useState<"vertical" | "horizontal">("horizontal");
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

  // Detect care-type keywords in locationQuery for relevance sorting
  const detectedCareType = useMemo(() => {
    if (!locationQuery) return null;
    const lower = locationQuery.toLowerCase();
    for (const { key, label } of CARE_KEYWORDS) {
      if (lower.includes(key)) return label;
    }
    return null;
  }, [locationQuery]);

  // Filter communities by selected care type dropdown
  const filteredCommunities = useMemo(() => {
    let list = mapCommunities;

    if (selectedCareType !== "all") {
      list = list.filter(c => {
        const types = (c.careTypes || []).map((t: string) => t.toLowerCase());
        const subtype = (c.communitySubtype || "").toLowerCase();
        if (selectedCareType === "hud-sponsored") {
          return c.hudPropertyId || subtype.includes("hud");
        }
        return types.some((t: string) => t.includes(selectedCareType.toLowerCase())) ||
               subtype.includes(selectedCareType.toLowerCase());
      });
    }

    // Keyword-aware sort: if locationQuery mentions a care type, bubble those to top
    if (detectedCareType && selectedCareType === "all") {
      const careKey = detectedCareType.toLowerCase();
      list = [...list].sort((a, b) => {
        const aMatch = (a.careTypes || []).some((t: string) => t.toLowerCase().includes(careKey)) ||
                       (a.communitySubtype || "").toLowerCase().includes(careKey);
        const bMatch = (b.careTypes || []).some((t: string) => t.toLowerCase().includes(careKey)) ||
                       (b.communitySubtype || "").toLowerCase().includes(careKey);
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
      });
    }

    return list;
  }, [mapCommunities, selectedCareType, detectedCareType]);

  const communityCount = filteredCommunities.length;

  const CommunityList = ({ communities, maxHeight, horizontal = false }: { communities: any[]; maxHeight: string; horizontal?: boolean }) => {
    if (horizontal) {
      return (
        <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-3 pt-3" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {communities.length === 0 && !isLoading && (
            <div className="flex-shrink-0 w-full p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
              {locationQuery
                ? "No communities found in this area. Try zooming out or adjusting filters."
                : "Search a city above to explore communities on the map."}
            </div>
          )}
          {communities.map((community: any, index: number) => (
            <div key={community.id} id={`smp-community-${community.id}`} className="flex-shrink-0 w-72">
              <FeaturedExcellenceCard
                community={{
                  ...community,
                  name: community.name || "Community",
                  city: community.city || "City",
                  state: community.state || "State",
                  rating: community.rating || null,
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

          {discoveredCommunities.length > 0 && (
            <>
              <div className="flex-shrink-0 self-center px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full flex items-center gap-1.5 border border-purple-200 dark:border-purple-700">
                <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 whitespace-nowrap">
                  {discoveredCommunities.length} via AI
                </span>
              </div>
              {discoveredCommunities.map((community: any, index: number) => (
                <div key={`disc-${community.id || index}`} id={`smp-disc-${community.id}`} className="flex-shrink-0 w-72">
                  <FeaturedExcellenceCard
                    community={{
                      ...community,
                      name: community.name || "Community",
                      city: community.city || "City",
                      state: community.state || "State",
                      rating: community.rating || null,
                      photos: community.photos || [],
                      careTypes: community.careTypes || [],
                      amenities: community.amenities || [],
                      occupancyRate: 0,
                      totalUnits: 100,
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
            </>
          )}
        </div>
      );
    }

    return (
      <div className={`overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800`} style={{ maxHeight }}>
        {communities.length === 0 && !isLoading && (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
            {locationQuery
              ? "No communities found in this area. Try zooming out or adjusting filters."
              : "Search a city above to explore communities on the map."}
          </div>
        )}
        {communities.map((community: any, index: number) => (
          <div key={community.id} id={`smp-community-${community.id}`} className="p-3">
            <FeaturedExcellenceCard
              community={{
                ...community,
                name: community.name || "Community",
                city: community.city || "City",
                state: community.state || "State",
                rating: community.rating || null,
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

        {discoveredCommunities.length > 0 && (
          <>
            <div className="px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-t border-purple-200 dark:border-purple-700 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                {discoveredCommunities.length} Newly Found via AI Discovery
              </span>
            </div>
            {discoveredCommunities.map((community: any, index: number) => (
              <div key={`disc-${community.id || index}`} id={`smp-disc-${community.id}`} className="p-3 bg-purple-50/30 dark:bg-purple-900/10">
                <FeaturedExcellenceCard
                  community={{
                    ...community,
                    name: community.name || "Community",
                    city: community.city || "City",
                    state: community.state || "State",
                    rating: community.rating || null,
                    photos: community.photos || [],
                    careTypes: community.careTypes || [],
                    amenities: community.amenities || [],
                    occupancyRate: 0,
                    totalUnits: 100,
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
          </>
        )}
      </div>
    );
  };

  const LandscapeList = ({ communities }: { communities: any[] }) => (
    <div className="flex flex-col gap-3 p-3">
      {communities.length === 0 && !isLoading && (
        <div className="w-full p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
          {locationQuery
            ? "No communities found in this area. Try zooming out or adjusting filters."
            : "Search a city above to explore communities on the map."}
        </div>
      )}
      {communities.map((community: any, index: number) => (
        <div key={community.id} id={`smp-community-${community.id}`}>
          <FeaturedExcellenceCard
            community={{
              ...community,
              name: community.name || "Community",
              city: community.city || "City",
              state: community.state || "State",
              rating: community.rating || null,
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
            landscape={true}
            disableAutoPhotoLoad={true}
          />
        </div>
      ))}

      {discoveredCommunities.length > 0 && (
        <>
          <div className="px-3 py-2 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-700 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
              {discoveredCommunities.length} Newly Found via AI Discovery
            </span>
          </div>
          {discoveredCommunities.map((community: any, index: number) => (
            <div key={`disc-${community.id || index}`} id={`smp-disc-${community.id}`}>
              <FeaturedExcellenceCard
                community={{
                  ...community,
                  name: community.name || "Community",
                  city: community.city || "City",
                  state: community.state || "State",
                  rating: community.rating || null,
                  photos: community.photos || [],
                  careTypes: community.careTypes || [],
                  amenities: community.amenities || [],
                  occupancyRate: 0,
                  totalUnits: 100,
                  priceRange: community.priceRange,
                  phone: community.phone,
                  website: community.website,
                }}
                index={index}
                landscape={true}
                disableAutoPhotoLoad={true}
              />
            </div>
          ))}
        </>
      )}
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <AutocompleteSearch
            value={searchValue}
            onChange={setSearchValue}
            onSubmit={(query) => {
              if (!query.trim()) return;
              fetch(`/api/geocode?location=${encodeURIComponent(query.trim())}`)
                .then(r => r.json())
                .then(geo => {
                  if (geo?.lat && geo?.lng) {
                    setMapCenter([geo.lat, geo.lng]);
                    setMapZoom(12);
                  }
                })
                .catch(() => {});
            }}
            placeholder="Search a city or location…"
            isLoading={isLoading}
          />
        </div>

        {/* Layout toggle */}
        <div className="flex-shrink-0 flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
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

      {/* Care type filter pills */}
      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 flex gap-2 overflow-x-auto scrollbar-hide">
        {CARE_TYPE_FILTERS.map(filter => (
          <button
            key={filter.value}
            onClick={() => setSelectedCareType(filter.value)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedCareType === filter.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {filter.label}
            {detectedCareType === filter.label && selectedCareType === "all" && (
              <span className="ml-1 text-yellow-300">★</span>
            )}
          </button>
        ))}
      </div>

      {layoutMode === "vertical" ? (
        /* Vertical: map on top, list below */
        <div>
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
          <div className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
            <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span>
              {isLoading
                ? "Loading communities…"
                : `${communityCount} communities in view${discoveredCommunities.length > 0 ? ` + ${discoveredCommunities.length} newly found` : ""}`}
            </span>
          </div>
          <CommunityList communities={filteredCommunities} maxHeight="480px" horizontal={true} />
        </div>
      ) : (
        /* Horizontal: map left, landscape cards right (vertical scroll) */
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="md:border-r border-gray-200 dark:border-gray-700 flex flex-col">
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
            <div className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 border-t border-gray-200 dark:border-gray-700">
              <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span>
                {isLoading
                  ? "Loading communities…"
                  : `${communityCount} communities in view${discoveredCommunities.length > 0 ? ` + ${discoveredCommunities.length} newly found` : ""}`}
              </span>
            </div>
          </div>
          {/* Right panel: vertically scrollable list of landscape cards, same height as map */}
          <div className="overflow-y-auto" style={{ height: "520px" }}>
            <LandscapeList communities={filteredCommunities} />
          </div>
        </div>
      )}
    </div>
  );
}
