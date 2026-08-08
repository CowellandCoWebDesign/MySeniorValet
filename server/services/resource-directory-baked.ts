/**
 * BAKED Senior Resource Directory
 * ===============================
 * Pre-builds the full /senior-resources directory payload from stored data
 * only — curated hand-verified listings + the already-cached senior_resources
 * pool. NO live web discovery ever runs in this path: the page must render
 * instantly and its content must be servable in the initial HTML.
 *
 * (Background discovery still grows the cached pool via the legacy
 * /api/senior-resources/directory endpoint; this module simply reads whatever
 * has already been saved.)
 */

import { db } from "../db";
import { seniorResources } from "@shared/schema";
import { sql, gte, and } from "drizzle-orm";
import {
  DIRECTORY_CATEGORIES,
  DIRECTORY_CATEGORY_IDS,
  DIRECTORY_COUNTIES,
  DIRECTORY_COUNTY_IDS,
  DIRECTORY_SITUATIONS,
  type BakedResourceDirectory,
  type DirectoryListing,
} from "@shared/resource-directory";
import {
  CURATED_LOCAL_LISTINGS,
  STATEWIDE_LISTINGS,
  NATIONAL_LISTINGS,
} from "../data/resource-directory-curated";

/** Cached senior_resources rows are considered usable for 90 days. */
const CACHED_ROW_MAX_AGE_DAYS = 90;
/** Rebuild the baked payload at most every 15 minutes. */
const BAKE_TTL_MS = 15 * 60 * 1000;

// ---------------------------------------------------------------------------
// Category mapping for cached/discovered rows (old 7-category taxonomy +
// free-text names/services → new A–Z taxonomy). Most specific patterns first.
// ---------------------------------------------------------------------------

const NEW_CATEGORY_KEYWORDS: Array<{ category: string; pattern: RegExp }> = [
  { category: "va-aid-attendance", pattern: /\baid (?:&|and) attendance\b/i },
  { category: "veterans-resources", pattern: /\b(veterans?|va clinic|va medical|military|vfw|american legion|cvso)\b/i },
  { category: "adult-protective-services", pattern: /\b(adult protective|\baps\b|elder abuse)\b/i },
  { category: "in-home-supportive-services", pattern: /\b(ihss|in.home supportive)\b/i },
  { category: "meals-on-wheels", pattern: /\b(meals on wheels|home.delivered meals|senior (?:dining|nutrition|meal))\b/i },
  { category: "food-assistance", pattern: /\b(food bank|food pantry|calfresh|snap|groceries|hunger|emergency food)\b/i },
  { category: "hospice", pattern: /\b(hospice|palliative)\b/i },
  { category: "home-health", pattern: /\b(home health|visiting nurse|skilled.*in.home)\b/i },
  { category: "home-care", pattern: /\b(home care|caregiv(?:er|ing) agency|personal care|homemaker)\b/i },
  { category: "skilled-nursing", pattern: /\b(skilled nursing|nursing home|rehab(?:ilitation)? (?:center|facility)|convalescent)\b/i },
  { category: "dementia-memory-support", pattern: /\b(alzheimer|dementia|memory)\b/i },
  { category: "caregiver-support", pattern: /\b(caregiver|respite)\b/i },
  { category: "support-groups", pattern: /\b(support group|grief|bereavement|crisis line|mental health)\b/i },
  { category: "estate-planning-elder-law", pattern: /\b(legal|attorney|\blaw\b|elder law|estate planning|wills?|trusts?|conservator|guardianship)\b/i },
  { category: "tax-assistance", pattern: /\b(tax(?:es)? (?:aid|help|assistance|prep)|vita|tax-aide)\b/i },
  { category: "utility-bill-assistance", pattern: /\b(liheap|heap\b|utility|energy assistance|weatherization)\b/i },
  { category: "medicare-benefits-counseling", pattern: /\b(medicare|hicap|\bship\b|social security|benefits? counsel|insurance counsel)\b/i },
  { category: "transportation", pattern: /\b(transport|dial.a.ride|paratransit|rides?\b|shuttle)\b/i },
  { category: "affordable-senior-housing", pattern: /\b(housing authority|affordable housing|section 8|section 202|low.income housing|hud\b|senior apartments)\b/i },
  { category: "senior-centers", pattern: /\b(senior center|community center)\b/i },
  { category: "area-agencies-on-aging", pattern: /\b(area agency on aging|\baaa\b|agency on aging|council on aging|aging and adult|department of aging|ombudsman)\b/i },
  { category: "medical-equipment", pattern: /\b(medical equipment|dme\b|wheelchairs?|walkers?|mobility equipment)\b/i },
  { category: "pharmacies-with-delivery", pattern: /\b(pharmac|prescription)\b/i },
  { category: "funeral-homes-cremation", pattern: /\b(funeral|cremation|mortuary|cemetery)\b/i },
  { category: "advance-planning", pattern: /\b(advance directive|polst|living will|power of attorney)\b/i },
  { category: "hospitals-clinics", pattern: /\b(hospital|clinic|health center|medical center|physician|doctor|urgent care|behavioral health)\b/i },
];

/** Legacy directory category ids → best-fit new category (fallbacks only). */
const LEGACY_CATEGORY_MAP: Record<string, string> = {
  "aging-county": "area-agencies-on-aging",
  healthcare: "hospitals-clinics",
  veterans: "veterans-resources",
  housing: "affordable-senior-housing",
  "financial-legal": "estate-planning-elder-law",
  "events-support": "support-groups",
  "community-211": "senior-centers",
};

export function mapToDirectoryCategory(text: string, legacyCategory?: string): string {
  for (const { category, pattern } of NEW_CATEGORY_KEYWORDS) {
    if (pattern.test(text)) return category;
  }
  if (legacyCategory && LEGACY_CATEGORY_MAP[legacyCategory]) {
    return LEGACY_CATEGORY_MAP[legacyCategory];
  }
  return "senior-centers";
}

// ---------------------------------------------------------------------------
// Cached rows → listings
// ---------------------------------------------------------------------------

const COUNTY_ID_LIST = DIRECTORY_COUNTIES.map((c) => c.id);

/**
 * County-id list as a real PostgreSQL text[] literal for `= ANY(...)`.
 * Interpolating a JS array directly into a drizzle sql`` template expands it
 * as a tuple `(a, b, c)`, and `x = ANY((a,b,c))` fails with error 42809
 * ("op ANY/ALL (array) requires array on right side"). Building
 * `ARRAY[$1,$2,...]::text[]` keeps values parameterized AND array-typed.
 */
export function countyIdArraySql() {
  return sql`ARRAY[${sql.join(
    COUNTY_ID_LIST.map((id) => sql`${id}`),
    sql`, `,
  )}]::text[]`;
}

/** WHERE condition selecting cached NorCal senior_resources rows. Exported for tests. */
export function cachedNorCalCondition(cutoff: Date) {
  return and(
    sql`(UPPER(${seniorResources.state}) = 'CA' OR LOWER(${seniorResources.state}) = 'california')`,
    sql`(LOWER(${seniorResources.metadata}->>'discoveryCounty') = ANY(${countyIdArraySql()}) OR LOWER(${seniorResources.city}) = ANY(${countyIdArraySql()}))`,
    gte(seniorResources.discoveredAt, cutoff),
  );
}

function rowCounty(row: any): string | null {
  const metaCounty = typeof row?.metadata?.discoveryCounty === "string" ? row.metadata.discoveryCounty.toLowerCase().trim() : "";
  if (DIRECTORY_COUNTY_IDS.has(metaCounty)) return metaCounty;
  const city = (row.city || "").toLowerCase().trim();
  if (DIRECTORY_COUNTY_IDS.has(city)) return city;
  return null;
}

export function cachedRowToListing(row: any): DirectoryListing | null {
  const county = rowCounty(row);
  if (!county) return null;
  if (!row.name || !(row.phone || row.website)) return null; // must be actionable
  const servicesText = Array.isArray(row.services) ? row.services.join(" ") : "";
  const legacy = typeof row?.metadata?.discoveryCategory === "string" ? row.metadata.discoveryCategory : undefined;
  const category = mapToDirectoryCategory(`${row.name || ""} ${servicesText} ${row.description || ""}`, legacy);
  if (!DIRECTORY_CATEGORY_IDS.has(category)) return null;
  return {
    name: row.name,
    category,
    type: "Local Resource",
    address: row.address || undefined,
    city: row.city && !DIRECTORY_COUNTY_IDS.has((row.city || "").toLowerCase()) ? row.city : undefined,
    state: row.state || "CA",
    counties: [county],
    phone: row.phone || undefined,
    website: row.website || undefined,
    services: Array.isArray(row.services) ? row.services.slice(0, 5) : [],
    hours: row.hours || undefined,
    eligibility: row.eligibility || undefined,
    isFree: !!row.isFree,
    pricingSummary: row.pricingSummary || undefined,
    source: row.source === "free_discovery" ? "Found on the web" : (row.source || "Discovered"),
    sourceUrl: row.sourceUrl || row.website || undefined,
    verified: !!row.isVerified,
    scope: "discovered",
  };
}

async function getCachedNorCalListings(): Promise<DirectoryListing[]> {
  const cutoff = new Date(Date.now() - CACHED_ROW_MAX_AGE_DAYS * 24 * 60 * 60 * 1000);
  try {
    const rows = await db
      .select()
      .from(seniorResources)
      .where(cachedNorCalCondition(cutoff))
      .limit(200);
    return rows.map(cachedRowToListing).filter((l): l is DirectoryListing => l !== null);
  } catch (err) {
    console.error("⚠️ [BakedDirectory] cached listings query failed:", err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Assembly + in-memory cache
// ---------------------------------------------------------------------------

const nameKey = (n: string) => n.toLowerCase().replace(/[^a-z0-9]/g, "");

export function assemble(cached: DirectoryListing[]): BakedResourceDirectory {
  // Curated first; cached/discovered rows are deduped against curated by name.
  const seen = new Set<string>();
  const listings: DirectoryListing[] = [];
  for (const group of [CURATED_LOCAL_LISTINGS, STATEWIDE_LISTINGS, cached, NATIONAL_LISTINGS]) {
    for (const l of group) {
      const k = nameKey(l.name);
      if (seen.has(k)) continue;
      seen.add(k);
      listings.push(l);
    }
  }
  return {
    categories: DIRECTORY_CATEGORIES,
    counties: DIRECTORY_COUNTIES,
    situations: DIRECTORY_SITUATIONS,
    listings,
    generatedAt: new Date().toISOString(),
  };
}

let baked: { data: BakedResourceDirectory; builtAt: number } | null = null;
let inflight: Promise<BakedResourceDirectory> | null = null;

/**
 * Returns the baked directory, rebuilding from the DB at most every
 * BAKE_TTL_MS. Never runs live discovery; on DB failure falls back to
 * curated + national data so the page always renders.
 */
export async function getBakedResourceDirectory(): Promise<BakedResourceDirectory> {
  if (baked && Date.now() - baked.builtAt < BAKE_TTL_MS) return baked.data;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const cached = await getCachedNorCalListings();
      const data = assemble(cached);
      baked = { data, builtAt: Date.now() };
      return data;
    } catch (err) {
      console.error("⚠️ [BakedDirectory] build failed, serving curated-only:", err);
      const data = assemble([]);
      baked = { data, builtAt: Date.now() };
      return data;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

/** Test/ops hook: drop the in-memory bake so the next request rebuilds. */
export function invalidateBakedResourceDirectory(): void {
  baked = null;
}
