import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { MapPin, Star, ShieldCheck, UserCheck, Building2 } from "lucide-react";
import { getCommunityUrl } from "@/lib/community-url";
import { getEffectiveRating } from "@/lib/rating-utils";

/**
 * Canonical community card for the whole platform.
 *
 * One component, three context variants:
 *   - "grid"    : standard vertical card (photo on top) — directory & home grids
 *   - "compact" : fixed-width vertical card for horizontal sliders
 *   - "list"    : horizontal row (photo left, content right) — map list / search rows
 *
 * Data-integrity rules baked in (Golden Data Rule):
 *   - Price shows a real number only; otherwise "Contact for pricing".
 *   - Rating uses getEffectiveRating (admin override → real reviews → null).
 *   - Status badge reflects REAL signals only (HUD id, operator claim, featured
 *     tier) — never the legacy `is_verified` boolean.
 *
 * SEO links always go through getCommunityUrl() (/senior-living/... URLs).
 */

export interface CommunityCardData {
  id: number;
  name: string;
  city?: string;
  state?: string;
  address?: string;
  slug?: string | null;
  citySlug?: string | null;
  stateSlug?: string | null;
  photos?: string[] | null;
  careTypes?: string[] | null;

  // Rating sources
  rating?: number | string | null;
  adminRatingOverride?: number | string | null;
  reviewCount?: number | null;

  // Pricing sources (any may be present)
  rentPerMonth?: number | string | null;
  basePrice?: number | string | null;
  priceRange?: { min?: number; max?: number } | null;
  monthlyRentRangeStart?: number | null;
  monthlyRentRangeEnd?: number | null;
  livePricing?: {
    independentLiving?: { min: number; max: number };
    assistedLiving?: { min: number; max: number };
    memoryCare?: { min: number; max: number };
  } | null;
  pricingType?: "live" | "market" | "contact" | string;

  // Honest status-badge signals
  hudPropertyId?: string | null;
  priceTier?: string | null;
  featured?: boolean;
  isClaimed?: boolean;
  claimVerified?: boolean;
  claimed_by?: unknown;
  claim_verified?: unknown;

  // Bilingual (Canada surface)
  nameEn?: string | null;
  nameFr?: string | null;
  addressEn?: string | null;
  addressFr?: string | null;
  bilingual?: boolean;

  [key: string]: unknown;
}

export type CommunityCardVariant = "grid" | "compact" | "list";

interface CommunityCardProps {
  community: CommunityCardData;
  variant?: CommunityCardVariant;
  /** Language for bilingual surfaces (Canada). Defaults to English. */
  language?: "en" | "fr";
  /** When provided, the card calls this instead of navigating to the SEO URL. */
  onSelect?: () => void;
  className?: string;
  "data-testid"?: string;
}

function toNumber(value: unknown): number | null {
  if (value == null) return null;
  const n = typeof value === "string" ? parseFloat(value) : (value as number);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function money(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

/**
 * Resolve a VERIFIED price line, or null → caller shows "Contact for pricing".
 *
 * Golden Data Rule: only two sources count as verified pricing —
 *   1. HUD government data (community has a hudPropertyId), and
 *   2. Operator live pricing (pricingType === "live").
 * Market estimates / national averages / generic stored numbers are NOT
 * verified and must always fall back to "Contact for pricing".
 */
function resolvePrice(c: CommunityCardData): string | null {
  const isHud = !!c.hudPropertyId;
  const isLive = c.pricingType === "live";

  // Anything that is not government- or operator-verified → contact for pricing.
  if (!isHud && !isLive) return null;

  // HUD government-verified pricing
  if (isHud) {
    const rent = toNumber(c.rentPerMonth);
    if (rent) return `${money(rent)}/mo`;
  }

  // Operator live pricing
  if (isLive) {
    if (c.livePricing) {
      const types = c.careTypes || [];
      const pick =
        (types.includes("Independent Living") && c.livePricing.independentLiving) ||
        (types.includes("Assisted Living") && c.livePricing.assistedLiving) ||
        (types.includes("Memory Care") && c.livePricing.memoryCare) ||
        c.livePricing.assistedLiving ||
        c.livePricing.independentLiving ||
        c.livePricing.memoryCare;
      if (pick) {
        const min = toNumber(pick.min);
        const max = toNumber(pick.max);
        if (min && max && min !== max) return `${money(min)} - ${money(max)}/mo`;
        if (min) return `${money(min)}/mo`;
      }
    }

    // Live pricing may also be stored in range / base / rent fields
    const rangeMin = toNumber(c.priceRange?.min);
    const rangeMax = toNumber(c.priceRange?.max);
    if (rangeMin && rangeMax && rangeMin !== rangeMax) return `${money(rangeMin)} - ${money(rangeMax)}/mo`;
    if (rangeMin) return `From ${money(rangeMin)}/mo`;

    const mrStart = toNumber(c.monthlyRentRangeStart);
    const mrEnd = toNumber(c.monthlyRentRangeEnd);
    if (mrStart && mrEnd && mrStart !== mrEnd) return `${money(mrStart)} - ${money(mrEnd)}/mo`;
    if (mrStart) return `From ${money(mrStart)}/mo`;

    const base = toNumber(c.basePrice);
    if (base) return `From ${money(base)}/mo`;

    const rent = toNumber(c.rentPerMonth);
    if (rent) return `${money(rent)}/mo`;
  }

  return null;
}

interface StatusBadge {
  label: string;
  icon: typeof ShieldCheck;
  className: string;
}

/** One honest badge from REAL signals only (never is_verified). */
function resolveBadge(c: CommunityCardData): StatusBadge | null {
  if (c.hudPropertyId) {
    return {
      label: "Government-Verified",
      icon: ShieldCheck,
      className: "bg-green-600 text-white",
    };
  }
  if (c.isClaimed || c.claimVerified || c.claimed_by || c.claim_verified) {
    return {
      label: "Operator-Verified",
      icon: UserCheck,
      className: "bg-teal-600 text-white",
    };
  }
  if (c.featured || c.priceTier === "featured") {
    return {
      label: "Featured",
      icon: Star,
      className: "bg-amber-500 text-white",
    };
  }
  return null;
}

export function CommunityCard({
  community,
  variant = "grid",
  language = "en",
  onSelect,
  className = "",
  "data-testid": dataTestId,
}: CommunityCardProps) {
  const displayName =
    language === "fr" && community.nameFr ? community.nameFr : community.nameEn || community.name;
  const displayAddress =
    language === "fr" && community.addressFr ? community.addressFr : community.addressEn || community.address;

  const rating = getEffectiveRating(community);
  const price = resolvePrice(community);
  const badge = resolveBadge(community);
  const photo = community.photos?.find((p) => typeof p === "string" && p.trim().length > 0) || null;
  const careTypes = (community.careTypes || []).filter(Boolean).slice(0, 2);
  const cityState = [community.city, community.state].filter(Boolean).join(", ");
  const locationLine = displayAddress || cityState;

  const url = getCommunityUrl({
    id: community.id,
    name: community.name,
    city: community.city || "",
    state: community.state || "",
    slug: community.slug,
    citySlug: community.citySlug,
    stateSlug: community.stateSlug,
  });

  const isList = variant === "list";
  const isCompact = variant === "compact";

  const cardBase =
    "group relative block overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none cursor-pointer";
  const widthClass = isCompact ? "w-[280px] min-w-[280px] max-w-[280px]" : "w-full";

  const Photo = (
    <div
      className={
        isList
          ? "relative w-32 sm:w-40 flex-shrink-0 bg-gray-100 dark:bg-gray-700 overflow-hidden"
          : "relative h-40 w-full bg-gray-100 dark:bg-gray-700 overflow-hidden"
      }
    >
      {photo ? (
        <img
          src={photo}
          alt={displayName}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-800">
          <Building2 className="h-8 w-8 text-blue-300 dark:text-gray-500" />
        </div>
      )}
      {badge && (
        <div className="absolute left-2 top-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold shadow ${badge.className}`}
            data-testid={`badge-${community.id}`}
          >
            <badge.icon className="h-3 w-3" />
            {badge.label}
          </span>
        </div>
      )}
    </div>
  );

  const Content = (
    <div className={isList ? "flex flex-1 flex-col p-3 min-w-0" : "p-3"}>
      <div className="flex items-start justify-between gap-2">
        <h3
          className="font-semibold text-sm text-gray-900 dark:text-white leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
          data-testid={`text-name-${community.id}`}
        >
          {displayName}
        </h3>
        {rating !== null && (
          <span className="flex shrink-0 items-center gap-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <Star className="h-3 w-3 fill-current" />
            {rating.toFixed(1)}
          </span>
        )}
      </div>

      {locationLine && (
        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          <span className="line-clamp-1">{locationLine}</span>
        </p>
      )}

      {careTypes.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {careTypes.map((type) => (
            <span
              key={type}
              className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
            >
              {type}
            </span>
          ))}
        </div>
      )}

      <div className={`flex items-center justify-between gap-2 ${isList ? "mt-auto pt-2" : "mt-2"}`}>
        {price ? (
          <p className="text-xs font-semibold text-green-600 dark:text-green-400" data-testid={`text-price-${community.id}`}>
            {price}
          </p>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400" data-testid={`text-price-${community.id}`}>
            {language === "fr" ? "Contactez pour les tarifs" : "Contact for pricing"}
          </p>
        )}
        {community.bilingual && (
          <span className="rounded-full bg-gradient-to-r from-blue-500 to-red-500 px-2 py-0.5 text-[10px] font-semibold text-white">
            {language === "fr" ? "Bilingue" : "Bilingual"}
          </span>
        )}
      </div>
    </div>
  );

  const inner = isList ? (
    <div className="flex flex-row">
      {Photo}
      {Content}
    </div>
  ) : (
    <>
      {Photo}
      {Content}
    </>
  );

  // Map/search rows that handle their own click pass onSelect; otherwise we link.
  if (onSelect) {
    return (
      <Card
        className={`${cardBase} ${widthClass} ${className} p-0`}
        onClick={onSelect}
        data-testid={dataTestId || `card-community-${community.id}`}
      >
        {inner}
      </Card>
    );
  }

  return (
    <Link
      href={url}
      className={`${cardBase} ${widthClass} ${className}`}
      data-testid={dataTestId || `card-community-${community.id}`}
    >
      {inner}
    </Link>
  );
}

export default CommunityCard;
