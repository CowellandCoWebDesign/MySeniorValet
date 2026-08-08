/**
 * Consolidated community-profile sections (Task #394) — APFM/Caring.com style.
 *
 * These render the single coherent profile on the Info & Tours tab:
 *  - ProfileHeaderBand: name, care badges, location + prominent pricing with a
 *    freshness/source note (Perplexity > persisted > "Contact for pricing").
 *  - QuickFactsStrip: capacity, community type, ownership, availability.
 *  - CostsSection: pricing by care level / room type (reveal-gated detail).
 *  - DataSourcesLine: compact citations + last-verified expander that replaces
 *    the old Live Web Intelligence card.
 *
 * Empty data renders one honest "Not published — contact community" line —
 * never a blank card, never fabricated values.
 */
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  DollarSign,
  Users,
  Building,
  Briefcase,
  CalendarCheck,
  ChevronDown,
  ChevronUp,
  Globe,
  Lock,
  ShieldCheck,
} from "lucide-react";

// ── Shared types ─────────────────────────────────────────────────────────────

export interface StructuredFacts {
  capacity?: number | null;
  unitTypes?: string[];
  pricingByCareLevel?: Array<{ label: string; min: number; max?: number; raw?: string }>;
  availability?: string | null;
  parsedAt?: string;
}

export interface ProfileFacts {
  facts: StructuredFacts;
  pricingRange: { min?: number; max?: number } | null;
  pricingSource: "live" | "persisted" | null;
  lastVerified: string | null;
  sources: Array<{ title?: string; url?: string } | string>;
}

const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;

export function formatPriceRange(r: { min?: number; max?: number } | null): string | null {
  if (!r) return null;
  const { min, max } = r;
  if (min && max && min !== max) return `${fmt(min)}–${fmt(max)}/mo`;
  if (min || max) return `${fmt((min ?? max)!)}/mo`;
  return null;
}

/**
 * Merge the verification report (freshest, from Perplexity) with the persisted
 * community record into one facts object. Priority: Perplexity > persisted.
 */
export function buildProfileFacts(community: any, verificationReport: any): ProfileFacts {
  const reportFacts: StructuredFacts | null = verificationReport?.structuredFacts || null;
  const persistedFacts: StructuredFacts | null =
    (community?.enrichmentData as any)?.structuredFacts || null;

  const facts: StructuredFacts = {
    capacity: reportFacts?.capacity ?? persistedFacts?.capacity ?? community?.totalUnits ?? null,
    unitTypes:
      (reportFacts?.unitTypes?.length ? reportFacts.unitTypes : persistedFacts?.unitTypes) || [],
    pricingByCareLevel:
      (reportFacts?.pricingByCareLevel?.length
        ? reportFacts.pricingByCareLevel
        : persistedFacts?.pricingByCareLevel) || [],
    availability:
      reportFacts?.availability ??
      persistedFacts?.availability ??
      (community?.availabilityStatus && community.availabilityStatus !== "Unknown"
        ? community.availabilityStatus
        : null),
    parsedAt: reportFacts?.parsedAt || persistedFacts?.parsedAt,
  };

  // Pricing: freshest source wins — verify-report structured range, then the
  // persisted enrichment pricing, then the community's own live price range.
  let pricingRange: { min?: number; max?: number } | null = null;
  let pricingSource: "live" | "persisted" | null = null;
  const reportRange = verificationReport?.pricingRange;
  const persistedRange = (community?.enrichmentData as any)?.pricing;
  if (reportRange && (reportRange.min || reportRange.max)) {
    pricingRange = reportRange;
    pricingSource = "live";
  } else if (persistedRange && (persistedRange.min || persistedRange.max)) {
    pricingRange = persistedRange;
    pricingSource = "persisted";
  } else if (community?.pricingType === "live" && (community?.priceMin || community?.priceMax)) {
    pricingRange = { min: community.priceMin, max: community.priceMax };
    pricingSource = "persisted";
  }

  const lastVerified =
    verificationReport?.lastVerified ||
    verificationReport?.timestamp ||
    (community?.enrichmentData as any)?.lastFetched ||
    null;

  const sources =
    verificationReport?.verificationResults?.perplexityData?.sources ||
    verificationReport?.verificationResults?.webIntelligence?.sources ||
    (community?.enrichmentData as any)?.searchResults?.sources ||
    [];

  return { facts, pricingRange, pricingSource, lastVerified, sources };
}

const NotPublished = ({ testId }: { testId?: string }) => (
  <p className="text-sm text-gray-500 dark:text-gray-400 italic" data-testid={testId}>
    Not published — contact community
  </p>
);

// ── Header band ──────────────────────────────────────────────────────────────

export function ProfileHeaderBand({
  community,
  profile,
}: {
  community: any;
  profile: ProfileFacts;
}) {
  const priceText = formatPriceRange(profile.pricingRange);
  const careTypes: string[] = Array.isArray(community?.careTypes)
    ? community.careTypes
    : community?.careType
      ? [community.careType]
      : [];
  const location = [community?.city, community?.state].filter(Boolean).join(", ");
  const freshness = profile.lastVerified
    ? new Date(profile.lastVerified).toLocaleDateString()
    : null;

  return (
    <Card data-testid="card-profile-header">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
              {community?.name}
            </h2>
            {location && (
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mt-1">
                <MapPin className="w-4 h-4 mr-1 shrink-0" />
                {location}
              </p>
            )}
            {careTypes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {careTypes.map((ct, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {ct}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="shrink-0 text-left sm:text-right" data-testid="band-pricing">
            <div className="flex items-center sm:justify-end text-green-700 dark:text-green-400">
              <DollarSign className="w-5 h-5 mr-1" />
              <span className="text-xl sm:text-2xl font-bold">
                {priceText || "Contact for pricing"}
              </span>
            </div>
            {priceText ? (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {profile.pricingSource === "live" ? "Verified via live web search" : "From verified records"}
                {freshness ? ` · ${freshness}` : ""}
              </p>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Pricing not published by this community
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Quick facts strip ────────────────────────────────────────────────────────

export function QuickFactsStrip({
  community,
  profile,
}: {
  community: any;
  profile: ProfileFacts;
}) {
  const { facts } = profile;
  const items: Array<{ icon: React.ReactNode; label: string; value: string }> = [];

  if (facts.capacity) {
    items.push({
      icon: <Users className="w-4 h-4 text-blue-600" />,
      label: "Capacity",
      value: `${facts.capacity} residents`,
    });
  }
  const communityType = community?.communityType || community?.careType;
  if (communityType) {
    items.push({
      icon: <Building className="w-4 h-4 text-indigo-600" />,
      label: "Community type",
      value: String(communityType),
    });
  }
  const ownership = community?.managementCompany || (community?.enrichmentData as any)?.managementCompany;
  if (ownership) {
    items.push({
      icon: <Briefcase className="w-4 h-4 text-purple-600" />,
      label: "Managed by",
      value: String(ownership),
    });
  }
  if (facts.availability) {
    items.push({
      icon: <CalendarCheck className="w-4 h-4 text-green-600" />,
      label: "Availability",
      value: String(facts.availability),
    });
  }
  if (facts.unitTypes && facts.unitTypes.length > 0) {
    items.push({
      icon: <Building className="w-4 h-4 text-teal-600" />,
      label: "Unit types",
      value: facts.unitTypes.join(", "),
    });
  }

  return (
    <Card data-testid="card-quick-facts">
      <CardContent className="p-4 sm:p-5">
        {items.length === 0 ? (
          <NotPublished testId="text-quick-facts-empty" />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {items.map((it, i) => (
              <div key={i} className="flex items-start gap-2" data-testid={`fact-${it.label.toLowerCase().replace(/\s+/g, "-")}`}>
                <div className="mt-0.5 shrink-0">{it.icon}</div>
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {it.label}
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words">
                    {it.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Costs section ────────────────────────────────────────────────────────────

export function CostsSection({
  profile,
  discoveredPricing,
  revealed,
  onReveal,
}: {
  profile: ProfileFacts;
  /** Legacy aggregated web-intel pricing strings (kept as supporting lines). */
  discoveredPricing?: Array<{ label?: string; value?: string; source?: string }> | null;
  revealed: boolean;
  onReveal: () => void;
}) {
  const entries = profile.facts.pricingByCareLevel || [];
  const overall = formatPriceRange(profile.pricingRange);
  const extra = (discoveredPricing || []).filter((d) => d && (d.value || d.label));
  const hasAnything = entries.length > 0 || !!overall || extra.length > 0;

  return (
    <Card data-testid="card-costs-section">
      <CardContent className="p-4 sm:p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center mb-1">
          <DollarSign className="w-5 h-5 mr-2 text-green-600" />
          Costs at a Glance
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Found via verified web search — always confirm current rates with the community.
        </p>

        {!hasAnything ? (
          <NotPublished testId="text-costs-empty" />
        ) : !revealed ? (
          <div className="relative" data-testid="costs-locked">
            <div className="blur-sm select-none pointer-events-none space-y-2" aria-hidden>
              {(entries.length > 0 ? entries : [{ label: "Monthly Rate", min: 4200 }]).slice(0, 4).map((e, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{e.label}</span>
                  <span className="font-semibold">{fmt(e.min)}{e.max ? `–${fmt(e.max)}` : "+"}/mo</span>
                </div>
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Button size="sm" onClick={onReveal} data-testid="button-unlock-costs">
                <Lock className="w-3.5 h-3.5 mr-1.5" />
                Unlock pricing details
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((e, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2"
                data-testid={`cost-entry-${i}`}
              >
                <span className="text-sm text-gray-800 dark:text-gray-200">{e.label}</span>
                <span className="text-sm font-bold text-green-700 dark:text-green-300">
                  {fmt(e.min)}
                  {e.max && e.max !== e.min ? `–${fmt(e.max)}` : ""}
                  /mo
                </span>
              </div>
            ))}
            {entries.length === 0 && overall && (
              <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2">
                <span className="text-sm text-gray-800 dark:text-gray-200">Monthly rate</span>
                <span className="text-sm font-bold text-green-700 dark:text-green-300">{overall}</span>
              </div>
            )}
            {extra.map((d, i) => (
              <div key={`x-${i}`} className="text-xs text-gray-600 dark:text-gray-400 px-1">
                {d.label ? `${d.label}: ` : ""}
                {d.value}
                {d.source ? ` (${d.source})` : ""}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Data sources & freshness line ───────────────────────────────────────────

export function DataSourcesLine({ profile }: { profile: ProfileFacts }) {
  const [open, setOpen] = useState(false);
  const { sources, lastVerified } = profile;
  if ((!sources || sources.length === 0) && !lastVerified) return null;

  const normalized = (sources || [])
    .map((s: any) => (typeof s === "string" ? { url: s } : s))
    .filter((s: any) => s && (s.url || s.title))
    .slice(0, 8);

  return (
    <div
      className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-3"
      data-testid="line-data-sources"
    >
      <button
        type="button"
        className="w-full flex items-center justify-between text-left"
        onClick={() => setOpen((o) => !o)}
        data-testid="button-toggle-sources"
      >
        <span className="flex items-center text-sm text-gray-700 dark:text-gray-300">
          <ShieldCheck className="w-4 h-4 mr-2 text-blue-600 shrink-0" />
          Verified from {normalized.length > 0 ? `${normalized.length} public source${normalized.length === 1 ? "" : "s"}` : "public web sources"}
          {lastVerified ? ` · last checked ${new Date(lastVerified).toLocaleDateString()}` : ""}
        </span>
        {normalized.length > 0 &&
          (open ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />)}
      </button>
      {open && normalized.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {normalized.map((s: any, i: number) => {
            let host = "";
            try {
              host = s.url ? new URL(s.url).hostname.replace(/^www\./, "") : "";
            } catch {
              host = "";
            }
            return (
              <li key={i} className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                <Globe className="w-3 h-3 mr-1.5 shrink-0" />
                {s.url ? (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="hover:underline truncate"
                  >
                    {s.title || host || s.url}
                  </a>
                ) : (
                  <span className="truncate">{s.title}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
