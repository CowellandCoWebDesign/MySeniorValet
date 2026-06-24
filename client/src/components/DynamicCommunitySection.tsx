import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
    selectionMode?: "auto" | "curated" | "pinned";
    communityIds?: number[];
    excludeIds?: number[];
  } | null;
}

interface Props {
  section: HomeSectionConfig;
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

  if (!isLoading && list.length === 0) {
    return (
      <div className="mb-6 space-y-3">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{section.title}</h2>
          {section.subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{section.subtitle}</p>}
        </div>
        <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-10 italic">
          No communities found for this section.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6 space-y-3">
      <div className="text-center">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
          {section.title}
        </h2>
        {section.subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{section.subtitle}</p>
        )}
      </div>

      <div className="relative group">
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:inline-flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-full p-3 shadow-xl transition-all duration-200 hover:scale-110"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:inline-flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-full p-3 shadow-xl transition-all duration-200 hover:scale-110"
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
    </div>
  );
}
