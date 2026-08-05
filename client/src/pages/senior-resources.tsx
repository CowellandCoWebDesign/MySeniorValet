import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin, Phone, Globe, Clock, Search, ExternalLink, Shield, CheckCircle2,
  Sparkles, Info, PhoneCall, FileText, Home, Building, HandHeart, Brain,
  Scale, ShoppingBasket, Flower2, Heart, Stethoscope, HeartHandshake, Cross,
  Utensils, Accessibility, BadgeCheck, Pill, Users, BedDouble, MessageCircle,
  Calculator, Car, Zap, Award, Flag, type LucideIcon,
} from "lucide-react";
import { ProfessionalNavbar } from "@/components/ProfessionalNavbar";
import type {
  BakedResourceDirectory,
  DirectoryListing,
} from "@shared/resource-directory";

const PAGE_TITLE =
  "Senior Resource Directory — Northern California & National Programs | MySeniorValet";
const PAGE_DESCRIPTION =
  "A–Z directory of senior resources: food assistance, Meals on Wheels, IHSS in-home care, veterans benefits, Medicare counseling, transportation and more — hand-verified listings for Shasta, Butte, Tehama, Humboldt and other Northern California counties, plus national programs.";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Shield, FileText, Home, Building, HandHeart, Brain, Scale, ShoppingBasket,
  Flower2, Heart, Stethoscope, HeartHandshake, Cross, Utensils, Accessibility,
  BadgeCheck, Pill, Users, BedDouble, MessageCircle, Calculator, Car, Zap,
  Award, Flag,
};

/**
 * The server bakes the full directory into the initial HTML and embeds the
 * same payload as JSON (outside #root, so React doesn't remove it). Reading
 * it here means the page renders instantly with zero fetches on first load.
 */
function readEmbeddedDirectory(): BakedResourceDirectory | undefined {
  try {
    const el = document.getElementById("__RESOURCE_DIRECTORY__");
    if (!el?.textContent) return undefined;
    const parsed = JSON.parse(el.textContent);
    if (parsed && Array.isArray(parsed.categories) && Array.isArray(parsed.listings)) {
      return parsed as BakedResourceDirectory;
    }
  } catch {
    // fall through to the API fallback
  }
  return undefined;
}

function ScopeBadge({ scope }: { scope: DirectoryListing["scope"] }) {
  if (scope === "curated") {
    return (
      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 flex items-center gap-1">
        <CheckCircle2 className="h-3 w-3" /> Verified Local
      </Badge>
    );
  }
  if (scope === "discovered") {
    return (
      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 flex items-center gap-1">
        <Sparkles className="h-3 w-3" /> Found on the web
      </Badge>
    );
  }
  if (scope === "state") {
    return (
      <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200 flex items-center gap-1">
        <Shield className="h-3 w-3" /> California Program
      </Badge>
    );
  }
  return (
    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 flex items-center gap-1">
      <Shield className="h-3 w-3" /> National Program
    </Badge>
  );
}

function ResourceCard({ item }: { item: DirectoryListing }) {
  return (
    <Card className="hover:shadow-lg transition-shadow" data-testid={`card-resource-${item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
      <CardHeader>
        <div className="flex justify-between items-start gap-3 flex-wrap">
          <div>
            <CardTitle className="text-lg">{item.name}</CardTitle>
            {item.type && <Badge variant="secondary" className="mt-2">{item.type}</Badge>}
          </div>
          <div className="flex flex-col items-end gap-1">
            <ScopeBadge scope={item.scope} />
            {item.isFree && <Badge className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200">Free</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            {(item.address || item.city) && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-500 mt-1 shrink-0" />
                <div>
                  {item.address && <p className="text-sm">{item.address}</p>}
                  {(item.city || item.state) && (
                    <p className="text-sm">{[item.city, item.state].filter(Boolean).join(", ")}</p>
                  )}
                </div>
              </div>
            )}
            {item.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500 shrink-0" />
                <a href={`tel:${item.phone.replace(/[^0-9+]/g, "")}`} className="text-sm text-blue-600 hover:underline">{item.phone}</a>
              </div>
            )}
            {item.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-500 shrink-0" />
                <a href={item.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                  Visit Website <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
            {item.hours && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500 shrink-0" />
                <p className="text-sm">{item.hours}</p>
              </div>
            )}
          </div>
          <div className="space-y-2">
            {item.services && item.services.length > 0 && (
              <>
                <h4 className="font-semibold text-sm">Services:</h4>
                <div className="flex flex-wrap gap-2">
                  {item.services.map((service, i) => (
                    <Badge key={`${service}-${i}`} variant="outline" className="text-xs">{service}</Badge>
                  ))}
                </div>
              </>
            )}
            {item.eligibility && (
              <div className="pt-1">
                <h4 className="font-semibold text-sm">Eligibility:</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.eligibility}</p>
              </div>
            )}
          </div>
        </div>
        {/* Source citation (Golden Data Rule: every listing is traceable) */}
        <div className="border-t pt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Info className="h-3 w-3 shrink-0" />
          <span>Source: </span>
          {item.sourceUrl ? (
            <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{item.source}</a>
          ) : (
            <span>{item.source}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function matchesSearch(item: DirectoryListing, q: string): boolean {
  const haystack = [
    item.name, item.type, item.city, item.address, item.eligibility,
    ...(item.services || []), ...(item.counties || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return q.split(/\s+/).every((token) => haystack.includes(token));
}

export default function SeniorResources() {
  const embedded = useMemo(readEmbeddedDirectory, []);
  const [selectedCounty, setSelectedCounty] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Baked payload: embedded in the HTML by the server; the API call only
  // happens on client-side navigation when the embed isn't present.
  const { data: directory } = useQuery<BakedResourceDirectory>({
    queryKey: ["/api/senior-resources/directory-baked"],
    queryFn: async () => {
      const response = await fetch("/api/senior-resources/directory-baked");
      if (!response.ok) throw new Error("Failed to load resource directory");
      return response.json();
    },
    initialData: embedded,
    staleTime: 15 * 60 * 1000,
  });

  // Honor #category-anchor links once content is on screen.
  useEffect(() => {
    if (!directory || !window.location.hash) return;
    const el = document.getElementById(window.location.hash.slice(1));
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [directory]);

  const q = searchQuery.trim().toLowerCase();

  const visibleByCategory = useMemo(() => {
    const map = new Map<string, DirectoryListing[]>();
    if (!directory) return map;
    for (const item of directory.listings) {
      // County chips filter local listings; statewide & national anchors
      // always apply everywhere, so no section ever goes empty.
      if (selectedCounty !== "all") {
        const isLocal = item.scope === "curated" || item.scope === "discovered";
        if (isLocal && !(item.counties || []).includes(selectedCounty)) continue;
      }
      if (q && !matchesSearch(item, q)) continue;
      const list = map.get(item.category) || [];
      list.push(item);
      map.set(item.category, list);
    }
    return map;
  }, [directory, selectedCounty, q]);

  const jumpTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", `#${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Helmet>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={PAGE_DESCRIPTION} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://www.myseniorvalet.com/senior-resources" />
      </Helmet>

      <ProfessionalNavbar />

      <div className="container mx-auto px-4 py-8 max-w-6xl mt-20">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white" data-testid="text-directory-title">
            Senior Resource Directory
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-3xl">
            Hand-verified senior resources for Northern California — plus statewide
            California and national programs. Every listing is source-cited, with
            phone numbers, addresses, and hours where available.
          </p>
        </div>

        {/* 211 banner */}
        <div className="mb-6 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-4 flex flex-wrap items-center gap-3" data-testid="banner-211">
          <PhoneCall className="h-6 w-6 text-red-600 dark:text-red-400 shrink-0" />
          <div className="flex-1 min-w-[220px]">
            <p className="font-semibold text-red-900 dark:text-red-200">Need help right now? Dial 2-1-1</p>
            <p className="text-sm text-red-800/80 dark:text-red-300/80">
              Free, confidential, 24/7 referrals to local food, housing, utility, and care resources.
            </p>
          </div>
          <Button asChild variant="destructive" size="sm" data-testid="button-call-211">
            <a href="tel:211">Call 211</a>
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search the directory — keyword, service, or town (e.g. “meals Redding”)"
            className="pl-9"
            data-testid="input-directory-search"
          />
        </div>

        {/* Need help with… */}
        {directory && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
              Need help with…
            </h2>
            <div className="flex flex-wrap gap-2">
              {directory.situations.map((s) => (
                <Button
                  key={s.label}
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => jumpTo(s.categoryId)}
                  data-testid={`button-situation-${s.categoryId}`}
                >
                  {s.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* County chips */}
        {directory && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
              NorCal counties — verified local coverage
            </h2>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCounty === "all" ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => setSelectedCounty("all")}
                data-testid="button-county-all"
              >
                All Counties
              </Button>
              {directory.counties.map((c) => (
                <Button
                  key={c.id}
                  variant={selectedCounty === c.id ? "default" : "outline"}
                  size="sm"
                  className="rounded-full"
                  onClick={() => setSelectedCounty(selectedCounty === c.id ? "all" : c.id)}
                  data-testid={`button-county-${c.id}`}
                >
                  {c.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* A–Z category nav */}
        {directory && (
          <nav aria-label="Directory categories" className="mb-10 rounded-lg border bg-white dark:bg-gray-900 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
              Browse A–Z
            </h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {directory.categories.map((cat) => (
                <a
                  key={cat.id}
                  href={`#${cat.id}`}
                  onClick={(e) => { e.preventDefault(); jumpTo(cat.id); }}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  data-testid={`link-category-${cat.id}`}
                >
                  {cat.label}
                </a>
              ))}
            </div>
          </nav>
        )}

        {/* Category sections */}
        {directory ? (
          <div className="space-y-12">
            {directory.categories.map((cat) => {
              const items = visibleByCategory.get(cat.id) || [];
              if (q && items.length === 0) return null;
              const Icon = CATEGORY_ICONS[cat.icon] || Users;
              return (
                <section key={cat.id} id={cat.id} className="scroll-mt-24">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{cat.label}</h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 ml-12">{cat.description}</p>
                  {items.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {items.map((item, i) => (
                        <ResourceCard key={`${cat.id}-${item.name}-${i}`} item={item} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 ml-12">
                      No local listings match this filter — clear the county filter or dial 2-1-1 for local referrals.
                    </p>
                  )}
                </section>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-300">Loading the resource directory…</p>
        )}

        {/* Footer note */}
        <div className="mt-12 border-t pt-6 text-sm text-gray-500 dark:text-gray-400">
          <p>
            Every listing links to its source. Spot something out of date?{" "}
            <a href="/contact" className="text-blue-600 hover:underline">Let us know</a> and we'll fix it.
          </p>
        </div>
      </div>
    </div>
  );
}
