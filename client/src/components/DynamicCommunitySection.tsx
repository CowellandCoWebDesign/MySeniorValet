import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Trophy,
  MapPin,
  Star,
  Sparkles,
  Shield,
  Building2,
  Globe,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CommunityCard } from "@/components/CommunityCard";

export interface HomeSectionConfig {
  id: number;
  position: number;
  enabled: boolean;
  title: string;
  subtitle: string | null;
  sectionType: string;
  config: {
    city?: string;
    state?: string;
    careType?: string;
    country?: string;
    brand?: string;
    selectionMode?: "auto" | "curated" | "pinned";
    communityIds?: number[];
    excludeIds?: number[];
  } | null;
}

interface Props {
  section: HomeSectionConfig;
}

// Per-section visual treatment so each admin section reads as a distinct,
// polished block (mirroring the richer /community-directory aesthetic).
const SECTION_STYLE: Record<string, { icon: LucideIcon; accent: string }> = {
  featured: { icon: Trophy, accent: "from-amber-400 to-orange-500" },
  highest_rated: { icon: Star, accent: "from-yellow-400 to-amber-500" },
  most_reviewed: { icon: Star, accent: "from-orange-400 to-rose-500" },
  recently_discovered: { icon: Sparkles, accent: "from-fuchsia-500 to-purple-600" },
  hud: { icon: Shield, accent: "from-emerald-500 to-green-600" },
  location: { icon: MapPin, accent: "from-sky-500 to-blue-600" },
  brand: { icon: Building2, accent: "from-indigo-500 to-violet-600" },
  country: { icon: Globe, accent: "from-teal-500 to-cyan-600" },
};

function getStyle(sectionType: string) {
  return SECTION_STYLE[sectionType] ?? { icon: Building2, accent: "from-blue-500 to-indigo-600" };
}

function buildQueryKey(section: HomeSectionConfig): [string, Record<string, string>] {
  // Pass the section id so the server reads the authoritative selection rules
  // (auto / curated / pinned) from the stored section config.
  const params: Record<string, string> = {
    type: section.sectionType,
    limit: "12",
    sectionId: String(section.id),
  };
  if (section.config?.city) params.city = section.config.city;
  if (section.config?.state) params.state = section.config.state;
  if (section.config?.careType) params.careType = section.config.careType;
  return [`/api/communities/section-data`, params];
}

export function DynamicCommunitySection({ section }: Props) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const [baseKey, params] = buildQueryKey(section);
  const queryString = new URLSearchParams(params).toString();

  const { data: communities, isLoading } = useQuery<any[]>({
    queryKey: [`${baseKey}?${queryString}`],
    queryFn: async () => {
      const res = await fetch(`${baseKey}?${queryString}`);
      if (!res.ok) throw new Error("Failed to load communities");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const scroll = (dir: "left" | "right") => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({ left: dir === "left" ? -296 : 296, behavior: "smooth" });
  };

  const list = Array.isArray(communities) ? communities : [];
  const { icon: Icon, accent } = getStyle(section.sectionType);

  const Header = (
    <div className="flex items-center gap-3 mb-5">
      <span
        className={`inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-md`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
          {section.title}
        </h2>
        {section.subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{section.subtitle}</p>
        )}
      </div>
    </div>
  );

  const panelClass =
    "mb-8 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50/80 dark:from-gray-900 dark:to-gray-800/40 p-5 md:p-6 shadow-sm";

  if (!isLoading && list.length === 0) {
    return (
      <section className={panelClass}>
        {Header}
        <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-10 italic">
          No communities found for this section.
        </p>
      </section>
    );
  }

  return (
    <section className={panelClass}>
      {Header}

      <div className="relative group">
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:inline-flex absolute -left-3 top-1/2 -translate-y-1/2 z-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-full p-3 shadow-xl transition-all duration-200 hover:scale-110"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:inline-flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-full p-3 shadow-xl transition-all duration-200 hover:scale-110"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </Button>

        <div
          ref={sliderRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-[280px] min-w-[280px] h-[380px] rounded-xl overflow-hidden"
                >
                  <Skeleton className="w-full h-full" />
                </div>
              ))
            : list.map((community, index) => (
                <div key={`${section.id}-${community.id}-${index}`} className="flex-shrink-0">
                  <CommunityCard community={community} variant="compact" />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
