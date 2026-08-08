import { useQuery } from "@tanstack/react-query";
import { Building2, Sparkles } from "lucide-react";
import { CommunityCard } from "@/components/CommunityCard";

/**
 * A single admin-approved operator family returned by the canonical public
 * supporting-portfolios endpoint. The server is the single source of truth for
 * eligibility: only families/communities the admin has approved are returned,
 * and community-level exclusions are already applied server-side. The client
 * never re-derives approval from literal brand-name searches.
 */
export interface SupportingPortfolioFamily {
  id: number | string;
  slug: string;
  name: string;
  /** Optional short marketing description for the family header. */
  subtitle?: string | null;
  communities: any[];
}

interface SupportingPortfoliosResponse {
  families?: SupportingPortfolioFamily[];
}

/**
 * Deduplicate a list of community cards by their community id. Approved
 * portfolios can overlap (e.g. a community inherited through more than one
 * operator family, or repeated across paginated payloads), and the directory
 * must never render the same community twice.
 */
export function dedupeCommunitiesById(communities: any[]): any[] {
  const seen = new Set<string | number>();
  const out: any[] = [];
  for (const community of communities ?? []) {
    if (!community) continue;
    const id = community.id ?? community.communityId;
    if (id == null) {
      // Keep id-less rows but never collapse them together.
      out.push(community);
      continue;
    }
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(community);
  }
  return out;
}

/**
 * Renders every admin-approved operator family as a signature slider. The
 * visual treatment mirrors the previous hardcoded brand sections (dark
 * gradient panel, gradient-outlined compact cards) so the directory keeps its
 * established look while sourcing content from the gated registry instead of
 * literal comprehensive-search brand queries.
 */
export function SupportingPortfolioSections() {
  const { data, isLoading } = useQuery<SupportingPortfoliosResponse>({
    queryKey: ["/api/communities/supporting-portfolios"],
    queryFn: async () => {
      const res = await fetch("/api/communities/supporting-portfolios", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load supporting portfolios");
      return res.json();
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
  });

  const globallySeen = new Set<string | number>();
  const families = (data?.families ?? [])
    .map((family) => ({
      ...family,
      communities: dedupeCommunitiesById(family.communities).filter((community) => {
        const id = community?.id ?? community?.communityId;
        if (id == null) return true;
        if (globallySeen.has(id)) return false;
        globallySeen.add(id);
        return true;
      }),
    }))
    .filter((family) => family.communities.length > 0);

  if (isLoading) {
    return (
      <section
        className="px-4 py-16 bg-gradient-to-br from-cyan-950 via-blue-950 to-indigo-950"
        data-testid="supporting-portfolios-loading"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-6 overflow-hidden pb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-80 h-[420px] rounded-xl bg-white/5 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (families.length === 0) {
    return null;
  }

  return (
    <>
      {families.map((family, index) => (
        <PortfolioSection key={family.id ?? family.slug} family={family} index={index} />
      ))}
    </>
  );
}

// Rotating gradient palette so consecutive approved families read as distinct,
// polished blocks — matching the existing directory aesthetic without hardcoding
// any single brand's identity.
const PALETTES = [
  {
    bg: "from-cyan-950 via-blue-950 to-indigo-950",
    text: "text-cyan-300",
    badge: "from-cyan-500 to-blue-500",
    glow: "from-cyan-400 to-blue-400",
    thumb: "scrollbar-thumb-cyan-500",
  },
  {
    bg: "from-purple-950 via-pink-950 to-fuchsia-950",
    text: "text-purple-300",
    badge: "from-purple-500 to-pink-500",
    glow: "from-purple-400 to-pink-400",
    thumb: "scrollbar-thumb-purple-500",
  },
  {
    bg: "from-amber-950 via-orange-950 to-yellow-950",
    text: "text-amber-300",
    badge: "from-amber-500 to-orange-500",
    glow: "from-amber-400 to-orange-400",
    thumb: "scrollbar-thumb-amber-500",
  },
  {
    bg: "from-rose-950 via-red-950 to-pink-950",
    text: "text-rose-300",
    badge: "from-rose-500 to-red-500",
    glow: "from-rose-400 to-red-400",
    thumb: "scrollbar-thumb-rose-500",
  },
];

function PortfolioSection({
  family,
  index,
}: {
  family: SupportingPortfolioFamily;
  index: number;
}) {
  const palette = PALETTES[index % PALETTES.length];
  const communities = dedupeCommunitiesById(family.communities);

  if (communities.length === 0) return null;

  return (
    <section
      className={`px-4 py-16 bg-gradient-to-br ${palette.bg}`}
      data-testid={`portfolio-section-${family.slug}`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div
                className={`absolute -inset-4 bg-gradient-to-r ${palette.glow} rounded-full blur-2xl opacity-40`}
              />
              <span className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white">
                <Building2 className="h-8 w-8" />
              </span>
            </div>
          </div>

          <div className="inline-flex items-center gap-3 text-4xl md:text-5xl font-bold mb-4">
            <span className={`bg-gradient-to-r ${palette.glow} bg-clip-text text-transparent`}>
              {family.name}
            </span>
          </div>

          {family.subtitle && (
            <p className="text-lg text-gray-200 mb-4 max-w-3xl mx-auto">{family.subtitle}</p>
          )}
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-2xl font-bold ${palette.text} flex items-center gap-2`}>
              <Sparkles className="h-5 w-5" />
              {family.name} Communities
            </h3>
            <span
              className={`bg-gradient-to-r ${palette.badge} text-white px-4 py-2 font-bold rounded-md`}
              data-testid={`portfolio-count-${family.slug}`}
            >
              {communities.length} Communities
            </span>
          </div>
          <div
            className={`flex gap-6 overflow-x-auto overflow-y-hidden pb-6 scrollbar-thin ${palette.thumb}`}
            style={{ scrollBehavior: "smooth" }}
          >
            {communities.map((community: any) => (
              <div key={community.id} className="flex-shrink-0">
                <div className="relative group">
                  <div
                    className={`absolute -inset-0.5 bg-gradient-to-r ${palette.glow} rounded-xl opacity-30 group-hover:opacity-60 transition duration-300 blur`}
                  />
                  <div className="relative">
                    <CommunityCard community={community} variant="compact" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
