import { useRef, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, ArrowRight, MapPin, Shield } from "lucide-react";
import { FeaturedExcellenceCard } from "@/components/FeaturedExcellenceCard";

interface CityConfig {
  city: string;
  emoji: string;
  title: string;
  subtitle: string;
  badge: string;
  lat: number;
  lng: number;
  zoom: number;
  gradient: string;
  radialOverlay: string;
  buttonGradient: string;
  buttonHoverGradient: string;
  scrollbarColor: string;
  skeletonBg: string;
  skeletonCardBg: string;
}

const NORTHERN_CA_CITIES: CityConfig[] = [
  {
    city: "Redding",
    emoji: "🏔️",
    title: "Redding Mountain Gateway",
    subtitle: "Senior living at the base of Mt. Shasta with stunning views and outdoor recreation",
    badge: "🏔️ Mountain Living",
    lat: 40.5865,
    lng: -122.3917,
    zoom: 12,
    gradient: "bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 dark:from-emerald-950 dark:via-green-900 dark:to-teal-950",
    radialOverlay: `radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.3) 0%, transparent 50%),
                    radial-gradient(circle at 80% 80%, rgba(20, 184, 166, 0.2) 0%, transparent 50%),
                    radial-gradient(circle at 40% 20%, rgba(52, 211, 153, 0.2) 0%, transparent 40%)`,
    buttonGradient: "from-emerald-600 to-teal-600",
    buttonHoverGradient: "hover:from-emerald-700 hover:to-teal-700",
    scrollbarColor: "scrollbar-thumb-emerald-500",
    skeletonBg: "from-emerald-900/50 to-teal-900/50",
    skeletonCardBg: "from-emerald-800/50 to-teal-800/50",
  },
  {
    city: "Sacramento",
    emoji: "🏛️",
    title: "Sacramento Capital Living",
    subtitle: "California's capital city with world-class healthcare and vibrant culture",
    badge: "🏛️ Capital City",
    lat: 38.5816,
    lng: -121.4944,
    zoom: 11,
    gradient: "bg-gradient-to-br from-yellow-900 via-amber-800 to-teal-900 dark:from-yellow-950 dark:via-amber-900 dark:to-teal-950",
    radialOverlay: `radial-gradient(circle at 20% 50%, rgba(234, 179, 8, 0.3) 0%, transparent 50%),
                    radial-gradient(circle at 80% 80%, rgba(20, 184, 166, 0.2) 0%, transparent 50%),
                    radial-gradient(circle at 40% 20%, rgba(250, 204, 21, 0.2) 0%, transparent 40%)`,
    buttonGradient: "from-yellow-600 to-teal-600",
    buttonHoverGradient: "hover:from-yellow-700 hover:to-teal-700",
    scrollbarColor: "scrollbar-thumb-yellow-500",
    skeletonBg: "from-yellow-900/50 to-teal-900/50",
    skeletonCardBg: "from-yellow-800/50 to-teal-800/50",
  },
  {
    city: "Chico",
    emoji: "🌳",
    title: "Chico University Town Living",
    subtitle: "Vibrant college-town charm with tree-lined streets and cultural amenities",
    badge: "🌳 College Town",
    lat: 39.7285,
    lng: -121.8375,
    zoom: 12,
    gradient: "bg-gradient-to-br from-amber-900 via-yellow-800 to-orange-900 dark:from-amber-950 dark:via-yellow-900 dark:to-orange-950",
    radialOverlay: `radial-gradient(circle at 20% 50%, rgba(245, 158, 11, 0.3) 0%, transparent 50%),
                    radial-gradient(circle at 80% 80%, rgba(251, 146, 60, 0.2) 0%, transparent 50%),
                    radial-gradient(circle at 40% 20%, rgba(252, 211, 77, 0.2) 0%, transparent 40%)`,
    buttonGradient: "from-amber-600 to-orange-600",
    buttonHoverGradient: "hover:from-amber-700 hover:to-orange-700",
    scrollbarColor: "scrollbar-thumb-amber-500",
    skeletonBg: "from-amber-900/50 to-orange-900/50",
    skeletonCardBg: "from-amber-800/50 to-orange-800/50",
  },
  {
    city: "Red Bluff",
    emoji: "🌾",
    title: "Red Bluff Valley Heritage",
    subtitle: "Affordable small-town living in the heart of the Sacramento Valley",
    badge: "🌾 Valley Living",
    lat: 40.1785,
    lng: -122.2358,
    zoom: 13,
    gradient: "bg-gradient-to-br from-rose-900 via-red-800 to-orange-900 dark:from-rose-950 dark:via-red-900 dark:to-orange-950",
    radialOverlay: `radial-gradient(circle at 20% 50%, rgba(244, 63, 94, 0.3) 0%, transparent 50%),
                    radial-gradient(circle at 80% 80%, rgba(239, 68, 68, 0.2) 0%, transparent 50%),
                    radial-gradient(circle at 40% 20%, rgba(251, 113, 133, 0.2) 0%, transparent 40%)`,
    buttonGradient: "from-rose-600 to-red-600",
    buttonHoverGradient: "hover:from-rose-700 hover:to-red-700",
    scrollbarColor: "scrollbar-thumb-rose-500",
    skeletonBg: "from-rose-900/50 to-red-900/50",
    skeletonCardBg: "from-rose-800/50 to-red-800/50",
  },
  {
    city: "Eureka",
    emoji: "🌊",
    title: "Eureka Coastal Living",
    subtitle: "Scenic Humboldt Bay coastline with cool ocean breezes and redwood forests",
    badge: "🌊 Coastal Living",
    lat: 40.8021,
    lng: -124.1637,
    zoom: 12,
    gradient: "bg-gradient-to-br from-slate-800 via-blue-900 to-gray-800 dark:from-slate-900 dark:via-blue-950 dark:to-gray-900",
    radialOverlay: `radial-gradient(circle at 20% 50%, rgba(148, 163, 184, 0.3) 0%, transparent 50%),
                    radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
                    radial-gradient(circle at 40% 20%, rgba(100, 116, 139, 0.25) 0%, transparent 40%)`,
    buttonGradient: "from-slate-600 to-blue-600",
    buttonHoverGradient: "hover:from-slate-700 hover:to-blue-700",
    scrollbarColor: "scrollbar-thumb-slate-500",
    skeletonBg: "from-slate-800/50 to-blue-900/50",
    skeletonCardBg: "from-slate-700/50 to-blue-800/50",
  },
  {
    city: "Anderson",
    emoji: "🏡",
    title: "Anderson Quiet Countryside",
    subtitle: "Peaceful rural setting just minutes from Redding's amenities",
    badge: "🏡 Countryside",
    lat: 40.4482,
    lng: -122.2978,
    zoom: 13,
    gradient: "bg-gradient-to-br from-sky-900 via-blue-800 to-indigo-900 dark:from-sky-950 dark:via-blue-900 dark:to-indigo-950",
    radialOverlay: `radial-gradient(circle at 20% 50%, rgba(14, 165, 233, 0.3) 0%, transparent 50%),
                    radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
                    radial-gradient(circle at 40% 20%, rgba(99, 102, 241, 0.2) 0%, transparent 40%)`,
    buttonGradient: "from-sky-600 to-blue-600",
    buttonHoverGradient: "hover:from-sky-700 hover:to-blue-700",
    scrollbarColor: "scrollbar-thumb-sky-500",
    skeletonBg: "from-sky-900/50 to-blue-900/50",
    skeletonCardBg: "from-sky-800/50 to-blue-800/50",
  },
];

function getMapSearchUrl(config: CityConfig) {
  return `/map-search?city=${encodeURIComponent(config.city)}&state=CA&lat=${config.lat}&lng=${config.lng}&zoom=${config.zoom}`;
}

function CityCarouselSection({ config }: { config: CityConfig }) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "200px", threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const checkScrollPosition = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: direction === "left" ? -296 : 296,
        behavior: "smooth",
      });
    }
  };

  const { data, isLoading } = useQuery<{ communities: any[] }>({
    queryKey: [`/api/communities/by-city?city=${encodeURIComponent(config.city)}&state=CA`],
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    enabled: isVisible,
  });

  const communities = (data?.communities || []).slice(0, 20);
  const totalCount = data?.communities?.length || 0;

  useEffect(() => {
    checkScrollPosition();
    const handleResize = () => checkScrollPosition();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isLoading, communities.length]);

  return (
    <section ref={sectionRef} className={`relative px-4 py-8 overflow-hidden rounded-xl`}>
      <div className="absolute inset-0">
        <div className={`absolute inset-0 ${config.gradient}`}></div>
        <div className="absolute inset-0" style={{ backgroundImage: config.radialOverlay }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-2xl md:text-3xl font-bold mb-2">
            <span className="text-3xl">{config.emoji}</span>
            <span className="text-white drop-shadow-lg">
              {config.title}
            </span>
            {totalCount > 0 && (
              <Badge className="bg-white/20 text-white border-white/30 text-sm font-bold ml-2">
                {totalCount} Communities
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-200 max-w-xl mx-auto">{config.subtitle}</p>
        </div>

        <div className="relative group">
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute -left-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-full p-2 shadow-xl opacity-0 md:opacity-100 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          )}

          <div
            ref={sliderRef}
            className={`flex gap-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin ${config.scrollbarColor} px-1`}
            onScroll={checkScrollPosition}
            style={{ scrollBehavior: "smooth" }}
          >
            {isLoading || !isVisible ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className={`flex-shrink-0 w-[280px] min-w-[280px] max-w-[280px] h-[380px] bg-gradient-to-br ${config.skeletonBg} rounded-xl border border-white/20 overflow-hidden animate-pulse`}
                >
                  <div className={`h-36 bg-gradient-to-br ${config.skeletonCardBg}`}></div>
                  <div className="p-3 space-y-3">
                    <div className="h-5 bg-white/10 rounded"></div>
                    <div className="h-4 bg-white/10 rounded w-3/4"></div>
                    <div className="h-3 bg-white/10 rounded w-1/2"></div>
                    <div className="h-3 bg-white/10 rounded w-2/3"></div>
                  </div>
                </div>
              ))
            ) : communities.length > 0 ? (
              communities.map((community: any, index: number) => (
                <div key={`${config.city}-${community.id}-${index}`} className="flex-shrink-0">
                  <FeaturedExcellenceCard
                    community={{ ...community, badge: config.badge }}
                    index={index}
                    disableAutoPhotoLoad={true}
                    compact
                  />
                </div>
              ))
            ) : (
              <div className="text-white/70 text-center py-8 w-full">
                No communities found in {config.city}.
              </div>
            )}
          </div>

          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute -right-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-full p-2 shadow-xl opacity-0 md:opacity-100 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          )}
        </div>

        <div className="text-center mt-4">
          <Link to={getMapSearchUrl(config)}>
            <Button
              size="lg"
              className={`bg-gradient-to-r ${config.buttonGradient} ${config.buttonHoverGradient} text-white px-6 py-3 text-sm font-semibold shadow-xl`}
            >
              Explore All {totalCount > 0 ? `${totalCount} ` : ""}{config.city} Communities
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function NorthernCACitySections() {
  const { data: localData } = useQuery<{ cities: { city: string; count: number }[]; total: number }>({
    queryKey: ["/api/communities/local-counts"],
    staleTime: 10 * 60 * 1000,
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <MapPin className="w-6 h-6 text-emerald-600" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            Serving Northern California
          </h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
          {localData
            ? `${localData.total} senior living communities across ${localData.cities.length} cities in the greater Redding and Northern California region`
            : "Senior living communities in the greater Redding and Northern California region"}
        </p>
      </div>

      <div className="flex items-center justify-center gap-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-medium text-emerald-800 dark:text-emerald-200">
            {localData?.total ?? "—"} Local Communities
          </span>
        </div>
        <div className="w-px h-4 bg-emerald-300 dark:bg-emerald-600" />
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-medium text-emerald-800 dark:text-emerald-200">
            {localData?.cities?.length ?? "—"} Cities Covered
          </span>
        </div>
      </div>

      {NORTHERN_CA_CITIES.map((config) => (
        <CityCarouselSection key={config.city} config={config} />
      ))}

      {localData && (() => {
        const majorCityNames = NORTHERN_CA_CITIES.map(c => c.city);
        const smallCities = localData.cities.filter(
          c => !majorCityNames.includes(c.city) && c.count > 0
        );
        if (smallCities.length === 0) return null;
        const totalSmall = smallCities.reduce((sum, c) => sum + c.count, 0);
        return (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 p-5">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center justify-center gap-2">
                <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                More Northern CA Communities
                <Badge className="bg-gray-600 text-white text-xs">{totalSmall} Total</Badge>
              </h3>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {smallCities.map((item) => (
                <Link key={item.city} to={`/map-search?query=${encodeURIComponent(item.city + ', CA')}`}>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <span>{item.city}</span>
                    <Badge variant="secondary" className="text-xs px-1.5">{item.count}</Badge>
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
