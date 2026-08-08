export const PROFILE_REFRESH_STALE_DAYS = 180;
export const PROFILE_REFRESH_MIN_DESCRIPTION_CHARS = 200;

export type ProfileRefreshReason =
  | "short_description"
  | "boilerplate_description"
  | "generic_description"
  | "missing_amenities_services"
  | "missing_contact"
  | "missing_pricing"
  | "missing_availability"
  | "stale_enrichment";

export interface ProfileRefreshEvaluation {
  eligible: boolean;
  reasons: ProfileRefreshReason[];
}

export interface ProfileRefreshCommunity {
  name?: string | null;
  city?: string | null;
  description?: string | null;
  amenities?: string[] | null;
  services?: string[] | null;
  phone?: string | null;
  website?: string | null;
  priceRange?: { min?: number | null; max?: number | null } | null;
  availabilityStatus?: string | null;
  lastSuccessfulEnrichment?: Date | string | null;
}

const FAILURE_OR_BOILERPLATE_PATTERNS = [
  /contact (?:the community )?for (?:more )?details/i,
  /information (?:for|about) this community was not found/i,
  /we (?:could not|couldn't|were unable to) find/i,
  /details (?:are|were) not available/i,
  /specific (?:community )?information (?:is|was) unavailable/i,
  /this (?:senior living )?(?:community|facility) offers quality care/i,
];

const SUBSTANCE_TERMS = [
  "assisted living", "independent living", "memory care", "skilled nursing",
  "respite", "rehabilitation", "studio", "apartment", "suite", "room",
  "dining", "meal", "chef", "activity", "program", "amenity", "service",
  "transportation", "housekeeping", "wellness", "fitness", "garden",
  "caregiver", "nursing", "medication", "therapy", "resident",
];

export function isBoilerplateOrFailureDescription(
  description: string | null | undefined,
): boolean {
  const text = (description || "").trim();
  return !!text && FAILURE_OR_BOILERPLATE_PATTERNS.some((pattern) => pattern.test(text));
}

export function hasCommunitySpecificSubstance(
  description: string | null | undefined,
  communityName?: string | null,
  city?: string | null,
): boolean {
  const text = (description || "").trim().toLowerCase();
  if (text.length < PROFILE_REFRESH_MIN_DESCRIPTION_CHARS) return false;
  if (isBoilerplateOrFailureDescription(text)) return false;

  const detailHits = SUBSTANCE_TERMS.filter((term) => text.includes(term)).length;
  const nameTokens = (communityName || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 4);
  const identityWasProvided = nameTokens.length > 0 || !!city;
  const mentionsIdentity =
    nameTokens.some((token) => text.includes(token)) ||
    (!!city && text.includes(city.toLowerCase()));

  return detailHits >= 2 && (!identityWasProvided || mentionsIdentity);
}

export function evaluateCommunityProfileRefresh(
  community: ProfileRefreshCommunity,
  now: Date = new Date(),
): ProfileRefreshEvaluation {
  const reasons: ProfileRefreshReason[] = [];
  const description = (community.description || "").trim();

  if (description.length < PROFILE_REFRESH_MIN_DESCRIPTION_CHARS) {
    reasons.push("short_description");
  }
  if (isBoilerplateOrFailureDescription(description)) {
    reasons.push("boilerplate_description");
  } else if (
    description.length >= PROFILE_REFRESH_MIN_DESCRIPTION_CHARS &&
    !hasCommunitySpecificSubstance(description, community.name, community.city)
  ) {
    reasons.push("generic_description");
  }

  if ((community.amenities || []).length === 0 && (community.services || []).length === 0) {
    reasons.push("missing_amenities_services");
  }
  if (!(community.phone || "").trim() && !(community.website || "").trim()) {
    reasons.push("missing_contact");
  }
  if (!community.priceRange?.min && !community.priceRange?.max) {
    reasons.push("missing_pricing");
  }
  if (!(community.availabilityStatus || "").trim()) {
    reasons.push("missing_availability");
  }

  const enrichedAt = community.lastSuccessfulEnrichment
    ? new Date(community.lastSuccessfulEnrichment).getTime()
    : 0;
  const staleMs = PROFILE_REFRESH_STALE_DAYS * 24 * 60 * 60 * 1000;
  if (!enrichedAt || !Number.isFinite(enrichedAt) || now.getTime() - enrichedAt > staleMs) {
    reasons.push("stale_enrichment");
  }

  return { eligible: reasons.length > 0, reasons };
}