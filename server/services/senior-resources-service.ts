/**
 * SENIOR RESOURCES DIRECTORY SERVICE
 * ==================================
 * Powers the comprehensive, location-aware Senior Resources directory.
 *
 * Serving order (per Task #304):
 *   1. Hand-curated, verified listings (Northern California home base) take precedence.
 *   2. Previously-saved AI/web-discovered listings (senior_resources table cache).
 *   3. A fresh free web discovery (DuckDuckGo + Jina) only when local coverage is thin.
 *   4. Always include national programs + a 211 / Area Agency on Aging fallback so a
 *      location is never an empty page.
 *
 * Golden Data Rule: only real, source-cited resources are persisted; nothing is
 * fabricated. Advance-care documents link to official government/state forms only.
 *
 * Reuses existing infrastructure: the senior_resources table + insert schema, the
 * free-discovery pipeline, and the discovered-community caching pattern (cost guard
 * + freshness TTL).
 */

import { db } from "../db";
import { seniorResources } from "@shared/schema";
import { and, eq, sql, gte } from "drizzle-orm";
import { discoverResourcesViaWeb } from "./free-discovery-service";
import { isReachableWebsite } from "../utils/data-quality";

// ---------------------------------------------------------------------------
// Category set + the single consistent resource item shape
// ---------------------------------------------------------------------------

export interface ResourceCategoryDef {
  id: string;
  label: string;
  description: string;
  icon: string; // lucide icon name resolved on the client
}

/**
 * The full category set for the directory. The three legacy tabs (food-banks,
 * ihss, sls) keep their dedicated endpoints; these are the additive categories
 * served by the unified /directory endpoint.
 */
export const RESOURCE_CATEGORIES: ResourceCategoryDef[] = [
  { id: "healthcare", label: "Healthcare & Medical", description: "Medicare, PACE, clinics, in-home health, and senior medical programs", icon: "Stethoscope" },
  { id: "veterans", label: "Veterans Benefits", description: "VA benefits, Aid & Attendance, and county Veterans Service Offices", icon: "Shield" },
  { id: "housing", label: "Housing & Placement", description: "Senior housing, placement help, and Area Agency on Aging referrals", icon: "Home" },
  { id: "financial-legal", label: "Financial, Legal & Benefits", description: "Social Security, Medicare counseling (HICAP), legal aid, and benefits", icon: "Scale" },
  { id: "aging-county", label: "Area Agencies on Aging & County", description: "Your local Area Agency on Aging and county aging/adult services", icon: "Building" },
  { id: "community-211", label: "Community Support & 211", description: "211 information line, senior centers, and community support", icon: "Users" },
  { id: "events-support", label: "Events & Support Groups", description: "Caregiver support, dementia support, and local events", icon: "HandHeart" },
];

export type ResourceScope = "national" | "state" | "curated" | "discovered";

export interface ResourceItem {
  name: string;
  category: string;
  type?: string;
  address?: string;
  city?: string;
  county?: string;
  state?: string;
  phone?: string;
  website?: string;
  email?: string;
  services?: string[];
  hours?: string;
  eligibility?: string;
  isFree?: boolean;
  pricingSummary?: string;
  source: string; // citation: who provided this
  sourceUrl?: string; // citation: link to verify
  verified: boolean;
  scope: ResourceScope;
  lastFound?: string;
}

export interface AdvanceCareLink {
  name: string;
  description: string;
  url: string;
  source: string;
  official: boolean;
}

export interface DirectoryResponse {
  location: { state: string; county: string };
  categories: ResourceCategoryDef[];
  items: ResourceItem[];
  advanceCare: AdvanceCareLink[];
  fallback: ResourceItem[];
  meta: {
    curatedCount: number;
    cachedCount: number;
    discoveredCount: number;
    nationalCount: number;
    isNorCal: boolean;
    hasCuratedCoverage: boolean;
    curatedRegion: string | null;
    discoveryRan: boolean;
    timestamp: string;
  };
}

// ---------------------------------------------------------------------------
// Curated home-base regions (verified, source-cited).
// Originally Northern-California-only; now generalized to any curated metro so
// the "Verified Local" badge + coverage banner light up wherever we have
// hand-verified listings. See CURATED_REGIONS below.
// ---------------------------------------------------------------------------

type CuratedItem = Omit<ResourceItem, "scope" | "verified"> & {
  counties: string[]; // lowercased county names this listing serves
};

const norm = (s: string) => (s || "").trim().toLowerCase();

/**
 * NorCal counties served by the curated home base. Used to detect whether the
 * requested location is a "home base" location where curated data takes precedence.
 */
export const NORCAL_COUNTIES = new Set([
  "shasta", "tehama", "butte", "trinity", "siskiyou",
  "lassen", "modoc", "plumas", "glenn", "colusa",
]);

const NORCAL_CITY_TO_COUNTY: Record<string, string> = {
  redding: "shasta", anderson: "shasta", cottonwood: "shasta", shingletown: "shasta",
  "red bluff": "tehama", corning: "tehama",
  chico: "butte", oroville: "butte", paradise: "butte",
  weaverville: "trinity",
};

/**
 * Hand-curated, verified NorCal listings across all categories. Each carries a
 * real source citation (official site / agency). These ALWAYS take precedence
 * over discovered data for NorCal locations.
 */
const NORCAL_CURATED: CuratedItem[] = [
  // ---- Area Agencies on Aging & County ----
  {
    name: "PSA 2 Area Agency on Aging",
    category: "aging-county",
    type: "Area Agency on Aging",
    address: "1647 Hartnell Ave, Suite 6",
    city: "Redding", state: "CA", county: "Shasta",
    phone: "(530) 229-1435",
    website: "https://www.psa2.org",
    services: ["Information & Assistance", "Senior Advocacy", "Long-Term Care Ombudsman", "Caregiver Support", "Older Americans Act programs"],
    hours: "Mon–Fri 8:00 AM – 5:00 PM",
    eligibility: "Adults 60+ in Shasta, Trinity, Siskiyou, Lassen, and Modoc Counties",
    isFree: true, pricingSummary: "Free",
    source: "PSA 2 Area Agency on Aging", sourceUrl: "https://www.psa2.org",
    counties: ["shasta", "trinity", "siskiyou", "lassen", "modoc"],
  },
  {
    name: "PASSAGES Area Agency on Aging (Area 3)",
    category: "aging-county",
    type: "Area Agency on Aging",
    address: "25 Main St",
    city: "Chico", state: "CA", county: "Butte",
    phone: "(530) 898-5923",
    website: "https://www.passagescenter.org",
    services: ["Information & Assistance", "Caregiver Resource Center", "HICAP Medicare Counseling", "Long-Term Care Ombudsman", "Senior Legal Services screening"],
    hours: "Mon–Fri 8:00 AM – 5:00 PM",
    eligibility: "Adults 60+ in Butte, Colusa, Glenn, Plumas, and Tehama Counties",
    isFree: true, pricingSummary: "Free",
    source: "PASSAGES Area Agency on Aging", sourceUrl: "https://www.passagescenter.org",
    counties: ["butte", "colusa", "glenn", "plumas", "tehama"],
  },
  {
    name: "Shasta County Adult Services (IHSS & APS)",
    category: "aging-county",
    type: "County Aging & Adult Services",
    city: "Redding", state: "CA", county: "Shasta",
    phone: "(530) 225-5507",
    website: "https://www.shastacounty.gov/health-human-services",
    services: ["In-Home Supportive Services (IHSS)", "Adult Protective Services (APS): (530) 225-5798", "Case management"],
    hours: "Mon–Fri 8:00 AM – 5:00 PM",
    eligibility: "Older and dependent adults in Shasta County",
    isFree: true, pricingSummary: "Free",
    source: "Shasta County Health & Human Services Agency", sourceUrl: "https://www.shastacounty.gov/health-human-services",
    counties: ["shasta"],
  },
  {
    name: "Tehama County Department of Social Services — Adult Services",
    category: "aging-county",
    type: "County Aging & Adult Services",
    address: "310 South Main Street",
    city: "Red Bluff", state: "CA", county: "Tehama",
    phone: "(530) 527-1911",
    website: "https://www.tcdss.org",
    services: ["In-Home Supportive Services (IHSS)", "Adult Protective Services", "Senior assistance"],
    hours: "Mon–Fri 8:00 AM – 5:00 PM",
    eligibility: "Older and dependent adults in Tehama County",
    isFree: true, pricingSummary: "Free",
    source: "Tehama County Department of Social Services", sourceUrl: "https://www.tcdss.org",
    counties: ["tehama"],
  },

  // ---- Healthcare & Medical ----
  {
    name: "Dignity Health Connected Living (formerly Golden Umbrella)",
    category: "healthcare",
    type: "Senior Nutrition & In-Home Services",
    address: "200 Mercy Oaks Dr",
    city: "Redding", state: "CA", county: "Shasta",
    phone: "(530) 226-3002",
    website: "https://www.dignityhealth.org/north-state/locations/connected-living",
    services: ["Meals on Wheels: (530) 226-3073", "Senior dining centers", "In-home senior support", "Care management"],
    hours: "Mon–Fri 8:30 AM – 2:30 PM",
    eligibility: "Seniors 60+ in Shasta County; homebound for Meals on Wheels",
    isFree: false, pricingSummary: "Suggested donation for meals",
    source: "Dignity Health Connected Living", sourceUrl: "https://www.dignityhealth.org/north-state/locations/connected-living",
    counties: ["shasta"],
  },
  {
    name: "Trinity County Behavioral Health Services",
    category: "healthcare",
    type: "Behavioral & Older-Adult Mental Health",
    address: "1450 Main St",
    city: "Weaverville", state: "CA", county: "Trinity",
    phone: "(530) 623-1362",
    website: "https://www.trinitycounty.org/Behavioral-Health",
    services: ["Older-adult mental health (65+)", "Telehealth appointments", "24/7 Crisis Line: (530) 623-5708"],
    hours: "Mon–Fri 8:00 AM – 5:00 PM",
    eligibility: "Trinity County residents; specialized care for seniors 65+",
    isFree: true, pricingSummary: "Medi-Cal accepted",
    source: "Trinity County Behavioral Health", sourceUrl: "https://www.trinitycounty.org/Behavioral-Health",
    counties: ["trinity"],
  },

  // ---- Housing & Placement ----
  {
    name: "Housing Authority of the County of Shasta (HCAP)",
    category: "housing",
    type: "Public Housing Authority (Senior Housing)",
    address: "2600 Park Marina Drive",
    city: "Redding", state: "CA", county: "Shasta",
    phone: "(530) 225-5160",
    website: "https://www.shastacounty.gov/housing-community-action-programs",
    services: ["Senior housing communities (Burney Commons, Cascade Village)", "Housing Choice Vouchers (Section 8)", "Serves Shasta, Siskiyou, Trinity & Modoc counties"],
    hours: "Mon–Fri 9:00 AM – 4:00 PM",
    eligibility: "Income-qualified seniors in Shasta, Siskiyou, Trinity & Modoc Counties",
    isFree: false, pricingSummary: "Income-based rent",
    source: "Housing Authority of the County of Shasta", sourceUrl: "https://www.shastacounty.gov/housing-community-action-programs",
    counties: ["shasta", "siskiyou", "trinity", "modoc"],
  },

  // ---- Veterans ----
  {
    name: "Shasta County Veterans Service Office",
    category: "veterans",
    type: "County Veterans Service Office",
    address: "1855 Shasta Street",
    city: "Redding", state: "CA", county: "Shasta",
    phone: "(530) 225-5616",
    website: "https://www.shastacounty.gov/veterans",
    services: ["VA benefits claims assistance", "Aid & Attendance pension help", "Survivor benefits", "Healthcare enrollment"],
    hours: "Mon–Fri 8:30–11:30 AM & 1:00–4:00 PM (walk-ins welcome)",
    eligibility: "Veterans and dependents in Shasta County",
    isFree: true, pricingSummary: "Free",
    source: "Shasta County Veterans Service Office", sourceUrl: "https://www.shastacounty.gov/veterans",
    counties: ["shasta"],
  },

  // ---- Financial, Legal & Benefits ----
  {
    name: "Legal Services of Northern California — Redding",
    category: "financial-legal",
    type: "Free Civil Legal Aid (Senior Legal Services)",
    address: "1370 West Street",
    city: "Redding", state: "CA", county: "Shasta",
    phone: "(800) 822-9687",
    website: "https://lsnc.net/office/redding",
    services: ["Wills, trusts & powers of attorney", "Elder abuse restraining orders", "Housing preservation", "Public benefits & healthcare"],
    hours: "Mon, Tue, Wed, Fri 9:00–11:45 AM & 1:00–4:45 PM; Thu 1:00–4:45 PM",
    eligibility: "Free Senior Legal Services for adults 60+; serves the northern counties",
    isFree: true, pricingSummary: "Free",
    source: "Legal Services of Northern California", sourceUrl: "https://lsnc.net/office/redding",
    counties: ["shasta", "tehama", "trinity", "siskiyou", "lassen", "modoc", "plumas"],
  },
  {
    name: "HICAP — Health Insurance Counseling & Advocacy Program (Northern CA)",
    category: "financial-legal",
    type: "Free Medicare Counseling",
    state: "CA",
    phone: "1-800-434-0222",
    website: "https://www.aging.ca.gov/hicap/",
    services: ["Free Medicare counseling", "Plan comparison (Advantage & Part D)", "Claim & denial appeals help", "Group Medicare presentations"],
    hours: "Call for appointment",
    eligibility: "Medicare beneficiaries of any age and their families",
    isFree: true, pricingSummary: "Free",
    source: "California Department of Aging (HICAP)", sourceUrl: "https://www.aging.ca.gov/hicap/",
    counties: ["shasta", "tehama", "butte", "trinity", "siskiyou", "lassen", "modoc", "plumas", "glenn", "colusa"],
  },

  // ---- Community Support & 211 ----
  {
    name: "211 NorCal — United Way",
    category: "community-211",
    type: "Free Information & Referral Line",
    state: "CA",
    phone: "211",
    website: "https://211norcal.org",
    services: ["24/7 multilingual information line", "Senior services referrals", "Food, housing & utility assistance", "Disaster information"],
    hours: "24/7",
    eligibility: "Open to all — dial 211",
    isFree: true, pricingSummary: "Free",
    source: "211 NorCal / United Way", sourceUrl: "https://211norcal.org",
    counties: ["shasta", "tehama", "butte", "trinity", "siskiyou", "lassen", "modoc", "plumas", "glenn", "colusa"],
  },

  // ---- Events & Support Groups ----
  {
    name: "PASSAGES Caregiver Resource Center",
    category: "events-support",
    type: "Caregiver Support",
    address: "25 Main St",
    city: "Chico", state: "CA", county: "Butte",
    phone: "(530) 898-5923",
    website: "https://www.passagescenter.org/caregiver-support/",
    services: ["Family caregiver support groups", "Respite assistance", "Care planning & counseling", "Education workshops"],
    hours: "Mon–Fri 8:00 AM – 5:00 PM",
    eligibility: "Family caregivers of adults with chronic conditions in the north state",
    isFree: true, pricingSummary: "Free",
    source: "PASSAGES Caregiver Resource Center", sourceUrl: "https://www.passagescenter.org/caregiver-support/",
    counties: ["butte", "colusa", "glenn", "plumas", "tehama"],
  },
  {
    name: "Alzheimer's Association — Northern California & Northern Nevada",
    category: "events-support",
    type: "Dementia Support",
    state: "CA",
    phone: "1-800-272-3900",
    website: "https://www.alz.org/norcal",
    services: ["24/7 helpline", "Caregiver & dementia support groups", "Education programs", "Care consultations"],
    hours: "24/7 helpline",
    eligibility: "Families affected by Alzheimer's and dementia",
    isFree: true, pricingSummary: "Free",
    source: "Alzheimer's Association", sourceUrl: "https://www.alz.org/norcal",
    counties: ["shasta", "tehama", "butte", "trinity", "siskiyou", "lassen", "modoc", "plumas", "glenn", "colusa"],
  },
];

/**
 * Additional hand-verified metros beyond the NorCal home base. Same structure
 * and Golden-Data standard (real, source-cited agencies). Each item's `state`
 * + `counties` decide where it appears; the coverage banner uses CURATED_REGIONS.
 */
const EXTENDED_CURATED: CuratedItem[] = [
  // ===================== Greater Sacramento (CA) =====================
  {
    name: "Agency on Aging Area 4 (AAA4)",
    category: "aging-county",
    type: "Area Agency on Aging",
    address: "1401 El Camino Avenue, 4th Floor",
    city: "Sacramento", state: "CA", county: "Sacramento",
    phone: "(916) 486-1876",
    website: "https://www.agencyonaging4.org",
    services: ["Information & Assistance / ADRC: 1-800-211-4545", "Long-Term Care Ombudsman", "Family Caregiver Support", "HICAP Medicare counseling", "Older Americans Act programs"],
    hours: "Mon–Fri 9:00 AM – 12:00 PM & 1:00 – 4:00 PM",
    eligibility: "Adults 60+ in Sacramento, Nevada, Placer, Sierra, Sutter, Yolo & Yuba Counties",
    isFree: true, pricingSummary: "Free",
    source: "Agency on Aging Area 4", sourceUrl: "https://www.agencyonaging4.org",
    counties: ["sacramento", "placer", "yolo"],
  },
  {
    name: "Sacramento County In-Home Supportive Services (IHSS)",
    category: "aging-county",
    type: "County Aging & Adult Services",
    city: "Sacramento", state: "CA", county: "Sacramento",
    phone: "(916) 874-9471",
    website: "https://ha.saccounty.gov",
    services: ["In-Home Supportive Services (IHSS)", "IHSS Public Authority / providers: (916) 874-2888", "Report adult abuse (APS, 24/7): 1-833-401-0832"],
    hours: "Mon–Fri 9:00 AM – 4:00 PM",
    eligibility: "Older and dependent adults in Sacramento County",
    isFree: true, pricingSummary: "Free",
    source: "Sacramento County Department of Human Assistance", sourceUrl: "https://ha.saccounty.gov",
    counties: ["sacramento"],
  },
  {
    name: "Sacramento County Veterans Service Office",
    category: "veterans",
    type: "County Veterans Service Office",
    address: "3075 Prospect Park Drive, Suite 170",
    city: "Rancho Cordova", state: "CA", county: "Sacramento",
    phone: "(916) 874-6811",
    website: "https://ha.saccounty.gov",
    services: ["VA benefits claims assistance", "Aid & Attendance pension help", "Survivor benefits", "Healthcare enrollment"],
    hours: "Mon–Fri 8:00 AM – 4:00 PM",
    eligibility: "Veterans and dependents in Sacramento County",
    isFree: true, pricingSummary: "Free",
    source: "Sacramento County Veterans Service Office", sourceUrl: "https://ha.saccounty.gov",
    counties: ["sacramento"],
  },
  {
    name: "Legal Services of Northern California — Sacramento",
    category: "financial-legal",
    type: "Free Civil Legal Aid (Senior Legal Services)",
    address: "515 12th Street",
    city: "Sacramento", state: "CA", county: "Sacramento",
    phone: "(916) 551-2150",
    website: "https://lsnc.net/office/sacramento",
    services: ["Wills, trusts & powers of attorney", "Elder abuse restraining orders", "Housing preservation", "Public benefits & healthcare"],
    hours: "Mon–Fri 8:30 AM – 12:00 PM & 1:00 – 5:00 PM",
    eligibility: "Free Senior Legal Services for adults 60+; serves the greater Sacramento region",
    isFree: true, pricingSummary: "Free",
    source: "Legal Services of Northern California", sourceUrl: "https://lsnc.net/office/sacramento",
    counties: ["sacramento", "placer", "yolo"],
  },
  {
    name: "211 Sacramento — Community Link Capital Region",
    category: "community-211",
    type: "Free Information & Referral Line",
    city: "Sacramento", state: "CA", county: "Sacramento",
    phone: "211",
    website: "https://www.211sacramento.org",
    services: ["24/7 multilingual information line", "Senior services referrals", "Food, housing & utility assistance", "Toll-free: 1-844-546-1464"],
    hours: "24/7",
    eligibility: "Open to all — dial 211",
    isFree: true, pricingSummary: "Free",
    source: "Community Link Capital Region (211 Sacramento)", sourceUrl: "https://www.211sacramento.org",
    counties: ["sacramento", "placer", "yolo"],
  },
  {
    name: "Alzheimer's Association — Northern California & Northern Nevada (Sacramento)",
    category: "events-support",
    type: "Dementia Support",
    city: "Sacramento", state: "CA", county: "Sacramento",
    phone: "1-800-272-3900",
    website: "https://www.alz.org/norcal",
    services: ["24/7 helpline", "Caregiver & dementia support groups", "Education programs", "Care consultations"],
    hours: "24/7 helpline",
    eligibility: "Families affected by Alzheimer's and dementia",
    isFree: true, pricingSummary: "Free",
    source: "Alzheimer's Association", sourceUrl: "https://www.alz.org/norcal",
    counties: ["sacramento", "placer", "yolo"],
  },
  {
    name: "WelbeHealth PACE — Elk Grove (Sacramento County)",
    category: "healthcare",
    type: "PACE — Program of All-Inclusive Care for the Elderly",
    address: "7560 Sheldon Rd",
    city: "Elk Grove", state: "CA", county: "Sacramento",
    phone: "(916) 250-1627",
    website: "https://welbehealth.com/locations/elk-grove/",
    services: ["All-inclusive medical & dental care", "Physical & occupational therapy", "Behavioral health", "Transportation, meals & personal care", "Enrollment: (888) 530-4415"],
    hours: "Mon–Fri 8:00 AM – 4:30 PM",
    eligibility: "Age 55+, needing nursing-home level care and able to live safely in the community (Sacramento area)",
    isFree: false, pricingSummary: "No cost with Medi-Cal or Medicare + Medi-Cal",
    source: "WelbeHealth", sourceUrl: "https://welbehealth.com/locations/elk-grove/",
    counties: ["sacramento"],
  },
  {
    name: "Sacramento Housing & Redevelopment Agency (SHRA)",
    category: "housing",
    type: "Public Housing Authority (Senior Housing)",
    address: "801 12th Street",
    city: "Sacramento", state: "CA", county: "Sacramento",
    phone: "(916) 440-1390",
    website: "https://www.shra.org",
    services: ["Elderly public housing (head of household 62+)", "Housing Choice Vouchers (Section 8)", "Waitlists posted at sacwaitlist.com"],
    hours: "Mon–Fri 8:00 AM – 5:00 PM (closed every other Friday)",
    eligibility: "Income-qualified seniors 62+ in Sacramento County",
    isFree: false, pricingSummary: "Income-based rent",
    source: "Sacramento Housing & Redevelopment Agency", sourceUrl: "https://www.shra.org",
    counties: ["sacramento"],
  },

  // ===================== Greater Los Angeles (CA) =====================
  {
    name: "Los Angeles County Aging & Disabilities Department",
    category: "aging-county",
    type: "Area Agency on Aging",
    address: "510 S. Vermont Ave., 11th Floor",
    city: "Los Angeles", state: "CA", county: "Los Angeles",
    phone: "(800) 510-2020",
    website: "https://ad.lacounty.gov",
    services: ["Information & Assistance for older adults: (626) 414-6439", "Long-Term Care Ombudsman", "Adult Protective Services referrals", "Family caregiver support"],
    hours: "Mon–Fri 8:00 AM – 5:00 PM",
    eligibility: "Older adults and adults with disabilities in Los Angeles County",
    isFree: true, pricingSummary: "Free",
    source: "Los Angeles County Aging & Disabilities Department", sourceUrl: "https://ad.lacounty.gov",
    counties: ["los angeles"],
  },
  {
    name: "LA County Adult Protective Services (WDACS)",
    category: "aging-county",
    type: "County Aging & Adult Services",
    city: "Los Angeles", state: "CA", county: "Los Angeles",
    phone: "1-877-477-3646",
    website: "https://wdacs.lacounty.gov/programs/aps",
    services: ["24/7 elder & dependent adult abuse hotline", "Long-Term Care Ombudsman: 1-800-334-9473", "Case management"],
    hours: "24/7 hotline",
    eligibility: "Older and dependent adults in Los Angeles County",
    isFree: true, pricingSummary: "Free",
    source: "LA County Workforce Development, Aging & Community Services (WDACS)", sourceUrl: "https://wdacs.lacounty.gov/programs/aps",
    counties: ["los angeles"],
  },
  {
    name: "LA County Department of Military & Veterans Affairs",
    category: "veterans",
    type: "County Veterans Affairs",
    address: "1816 S. Figueroa St (Bob Hope Patriotic Hall)",
    city: "Los Angeles", state: "CA", county: "Los Angeles",
    phone: "(213) 765-9680",
    website: "https://mva.lacounty.gov",
    services: ["VA benefits claims assistance", "Aid & Attendance pension help", "Survivor benefits", "Veteran resource navigation"],
    hours: "Mon–Fri 8:00 AM – 4:00 PM",
    eligibility: "Veterans and dependents in Los Angeles County",
    isFree: true, pricingSummary: "Free",
    source: "LA County Department of Military & Veterans Affairs", sourceUrl: "https://mva.lacounty.gov",
    counties: ["los angeles"],
  },
  {
    name: "Center for Health Care Rights — HICAP (Los Angeles County)",
    category: "financial-legal",
    type: "Free Medicare Counseling (HICAP)",
    address: "520 S. Lafayette Park Place",
    city: "Los Angeles", state: "CA", county: "Los Angeles",
    phone: "(213) 383-4519",
    website: "https://www.healthcarerights.org",
    services: ["Free Medicare counseling", "Plan comparison (Advantage & Part D)", "Claim & appeal help", "HICAP helpline: 1-800-824-0780"],
    hours: "Mon–Fri 9:00 AM – 5:00 PM",
    eligibility: "Medicare beneficiaries in Los Angeles County",
    isFree: true, pricingSummary: "Free",
    source: "Center for Health Care Rights (HICAP)", sourceUrl: "https://www.healthcarerights.org",
    counties: ["los angeles"],
  },
  {
    name: "Bet Tzedek Legal Services",
    category: "financial-legal",
    type: "Free Civil Legal Aid (Elder Law)",
    address: "3250 Wilshire Blvd, 13th Floor",
    city: "Los Angeles", state: "CA", county: "Los Angeles",
    phone: "(323) 939-0506",
    website: "https://www.bettzedek.org",
    services: ["Elder law & conservatorship alternatives", "Wills & powers of attorney", "Elder abuse & fraud", "Housing & public benefits"],
    hours: "Mon–Fri 9:00 AM – 5:00 PM",
    eligibility: "Free legal help for low-income residents of Los Angeles County",
    isFree: true, pricingSummary: "Free",
    source: "Bet Tzedek Legal Services", sourceUrl: "https://www.bettzedek.org",
    counties: ["los angeles"],
  },
  {
    name: "211 LA",
    category: "community-211",
    type: "Free Information & Referral Line",
    city: "Los Angeles", state: "CA", county: "Los Angeles",
    phone: "211",
    website: "https://www.211la.org",
    services: ["24/7 multilingual information line", "Senior services referrals", "Food, housing & utility assistance", "Outside LA County: (800) 339-6993"],
    hours: "24/7",
    eligibility: "Open to all — dial 211",
    isFree: true, pricingSummary: "Free",
    source: "211 LA", sourceUrl: "https://www.211la.org",
    counties: ["los angeles"],
  },
  {
    name: "Alzheimer's Los Angeles",
    category: "events-support",
    type: "Dementia Support",
    address: "2922 Crenshaw Blvd, Suite 125",
    city: "Los Angeles", state: "CA", county: "Los Angeles",
    phone: "(844) 435-7259",
    website: "https://www.alzheimersla.org",
    services: ["24/7 bilingual helpline", "Caregiver & dementia support groups", "Care counseling", "Education programs"],
    hours: "24/7 helpline",
    eligibility: "Families affected by Alzheimer's and dementia in Southern California",
    isFree: true, pricingSummary: "Free",
    source: "Alzheimer's Los Angeles", sourceUrl: "https://www.alzheimersla.org",
    counties: ["los angeles"],
  },
  {
    name: "AltaMed PACE — Los Angeles",
    category: "healthcare",
    type: "PACE — Program of All-Inclusive Care for the Elderly",
    address: "5425 E Pomona Blvd",
    city: "Los Angeles", state: "CA", county: "Los Angeles",
    phone: "(855) 252-7223",
    website: "https://www.altamed.org/PACE",
    services: ["All-inclusive senior medical care", "Care coordination & transportation", "Physical & occupational therapy", "Social services", "Intake: (877) 462-2582"],
    hours: "Mon–Fri 8:00 AM – 5:00 PM",
    eligibility: "Independent seniors with complex medical needs seeking to avoid nursing-home placement (LA County)",
    isFree: false, pricingSummary: "Medicare/Medi-Cal based",
    source: "AltaMed Health Services", sourceUrl: "https://www.altamed.org/PACE",
    counties: ["los angeles"],
  },
  {
    name: "Housing Authority of the City of Los Angeles (HACLA)",
    category: "housing",
    type: "Public Housing Authority (Senior Housing)",
    address: "2600 Wilshire Blvd",
    city: "Los Angeles", state: "CA", county: "Los Angeles",
    phone: "(213) 252-2500",
    website: "https://www.hacla.org",
    services: ["Senior public housing", "Section 8 Housing Choice Vouchers", "Application help: application.help@hacla.org", "Toll-free: (833) 422-5248"],
    hours: "Mon–Fri 8:00 AM – 4:00 PM",
    eligibility: "Low-income seniors in the City of Los Angeles",
    isFree: false, pricingSummary: "Income-based rent",
    source: "Housing Authority of the City of Los Angeles", sourceUrl: "https://www.hacla.org",
    counties: ["los angeles"],
  },

  // ===================== Phoenix Metro — Maricopa County (AZ) =====================
  {
    name: "Area Agency on Aging, Region One (Phoenix)",
    category: "aging-county",
    type: "Area Agency on Aging",
    address: "1366 E. Thomas Rd, Suite 108",
    city: "Phoenix", state: "AZ", county: "Maricopa",
    phone: "(602) 264-4357",
    website: "https://www.aaaphx.org",
    services: ["24-hour Senior HELP LINE", "Family caregiver support", "Long-Term Care Ombudsman", "SHIP Medicare counseling"],
    hours: "Senior Help Line 24/7; office Mon–Fri 8:00 AM – 5:00 PM",
    eligibility: "Adults 60+ in Maricopa County",
    isFree: true, pricingSummary: "Free",
    source: "Area Agency on Aging, Region One", sourceUrl: "https://www.aaaphx.org",
    counties: ["maricopa"],
  },
  {
    name: "Arizona Adult Protective Services (DES)",
    category: "aging-county",
    type: "State Adult Protective Services",
    city: "Phoenix", state: "AZ", county: "Maricopa",
    phone: "1-877-767-2385",
    website: "https://des.az.gov/services/basic-needs/adult-protective-services",
    services: ["Report abuse, neglect or exploitation of vulnerable adults", "Online reporting available 24/7", "Investigations & protective services"],
    hours: "Mon–Fri 7:00 AM – 7:00 PM; Sat–Sun 10:00 AM – 6:00 PM",
    eligibility: "Vulnerable and older adults in Arizona",
    isFree: true, pricingSummary: "Free",
    source: "Arizona Department of Economic Security (APS)", sourceUrl: "https://des.az.gov/services/basic-needs/adult-protective-services",
    counties: ["maricopa"],
  },
  {
    name: "Arizona Department of Veterans' Services",
    category: "veterans",
    type: "State Veterans Benefits",
    address: "1688 W. Adams Street",
    city: "Phoenix", state: "AZ", county: "Maricopa",
    phone: "(602) 255-3373",
    website: "https://dvs.az.gov",
    services: ["VA benefits claims assistance", "Aid & Attendance pension help", "Survivor benefits", "State Veteran Home referrals"],
    hours: "Mon–Fri 8:00 AM – 5:00 PM",
    eligibility: "Veterans and dependents in Arizona",
    isFree: true, pricingSummary: "Free",
    source: "Arizona Department of Veterans' Services", sourceUrl: "https://dvs.az.gov",
    counties: ["maricopa"],
  },
  {
    name: "Community Legal Services (Arizona)",
    category: "financial-legal",
    type: "Free Civil Legal Aid",
    address: "305 S. 2nd Ave",
    city: "Phoenix", state: "AZ", county: "Maricopa",
    phone: "(602) 258-3434",
    website: "https://clsaz.org",
    services: ["Senior legal assistance", "Wills & powers of attorney", "Consumer & housing law", "Toll-free: 1-800-852-9075"],
    hours: "Phone intake Mon–Fri 9:00 AM – 2:00 PM",
    eligibility: "Free civil legal help for low-income & older residents of Maricopa County",
    isFree: true, pricingSummary: "Free",
    source: "Community Legal Services", sourceUrl: "https://clsaz.org",
    counties: ["maricopa"],
  },
  {
    name: "211 Arizona",
    category: "community-211",
    type: "Free Information & Referral Line",
    city: "Phoenix", state: "AZ", county: "Maricopa",
    phone: "211",
    website: "https://211arizona.org",
    services: ["Information & referral line", "Senior services & benefits", "Food, housing & utility assistance", "Toll-free: 877-211-8661"],
    hours: "7 days a week 9:00 AM – 7:00 PM",
    eligibility: "Open to all — dial 211",
    isFree: true, pricingSummary: "Free",
    source: "211 Arizona", sourceUrl: "https://211arizona.org",
    counties: ["maricopa"],
  },
  {
    name: "Alzheimer's Association — Desert Southwest Chapter",
    category: "events-support",
    type: "Dementia Support",
    address: "300 W. Clarendon Ave., Suite 350",
    city: "Phoenix", state: "AZ", county: "Maricopa",
    phone: "1-800-272-3900",
    website: "https://www.alz.org/dsw",
    services: ["24/7 helpline", "Caregiver & dementia support groups", "Education programs", "Care consultations"],
    hours: "24/7 helpline",
    eligibility: "Families affected by Alzheimer's and dementia",
    isFree: true, pricingSummary: "Free",
    source: "Alzheimer's Association Desert Southwest", sourceUrl: "https://www.alz.org/dsw",
    counties: ["maricopa"],
  },
  {
    name: "Sun Health — Senior Health & Wellness",
    category: "healthcare",
    type: "Nonprofit Senior Health & Wellness",
    address: "14719 W. Grand Ave.",
    city: "Surprise", state: "AZ", county: "Maricopa",
    phone: "(623) 832-5330",
    website: "https://sunhealth.org",
    services: ["Care transitions & navigation", "Memory care navigation", "Health & wellness classes", "Chronic disease self-management"],
    hours: "Mon–Fri 8:00 AM – 5:00 PM",
    eligibility: "Older adults in the West Valley / Northwest Phoenix metro",
    isFree: false, pricingSummary: "Many programs free; some fee-based",
    source: "Sun Health", sourceUrl: "https://sunhealth.org",
    counties: ["maricopa"],
  },
  {
    name: "City of Phoenix Housing Department — Senior Housing",
    category: "housing",
    type: "Public Housing Authority (Senior Housing)",
    address: "251 W. Washington St., 4th Floor",
    city: "Phoenix", state: "AZ", county: "Maricopa",
    phone: "(602) 262-6794",
    website: "https://www.phoenix.gov/housing",
    services: ["Senior housing program (priority for 62+)", "55+ and 62+ senior/disabled communities", "Section 8 vouchers", "Senior info: (602) 262-6011"],
    hours: "Mon–Fri 8:00 AM – 5:00 PM",
    eligibility: "Income-qualified seniors 62+ (priority) in the Phoenix area",
    isFree: false, pricingSummary: "Income-based rent",
    source: "City of Phoenix Housing Department", sourceUrl: "https://www.phoenix.gov/housing",
    counties: ["maricopa"],
  },

  // ===================== Las Vegas Metro — Clark County (NV) =====================
  {
    name: "Nevada Aging & Disability Services Division (ADSD) — Las Vegas",
    category: "aging-county",
    type: "State Aging & Disability Services",
    address: "1161 S. Valley View Blvd",
    city: "Las Vegas", state: "NV", county: "Clark",
    phone: "(702) 486-7670",
    website: "https://adsd.nv.gov",
    services: ["Aging & Disability Resource Center", "Referral hotline: (702) 486-9200", "Elder abuse reporting (Clark County): (702) 486-6930", "SHIP Medicare counseling: 1-800-307-4444"],
    hours: "Mon–Fri 8:00 AM – 5:00 PM",
    eligibility: "Older adults and people with disabilities in southern Nevada",
    isFree: true, pricingSummary: "Free",
    source: "Nevada Aging & Disability Services Division", sourceUrl: "https://adsd.nv.gov",
    counties: ["clark"],
  },
  {
    name: "Nevada Department of Veterans Services — Las Vegas",
    category: "veterans",
    type: "State Veterans Benefits",
    address: "7220 Bermuda Road",
    city: "Las Vegas", state: "NV", county: "Clark",
    phone: "(702) 486-3830",
    website: "https://veterans.nv.gov",
    services: ["VA benefits claims assistance", "Aid & Attendance pension help", "Survivor benefits", "Veteran resource navigation"],
    hours: "Mon–Fri 8:00 AM – 5:00 PM",
    eligibility: "Veterans and dependents in southern Nevada",
    isFree: true, pricingSummary: "Free",
    source: "Nevada Department of Veterans Services", sourceUrl: "https://veterans.nv.gov",
    counties: ["clark"],
  },
  {
    name: "Legal Aid Center of Southern Nevada",
    category: "financial-legal",
    type: "Free Civil Legal Aid",
    address: "725 E. Charleston Blvd",
    city: "Las Vegas", state: "NV", county: "Clark",
    phone: "(702) 386-1070",
    website: "https://www.lacsn.org",
    services: ["Guardianship & elder law", "Wills & powers of attorney", "Consumer & housing law", "Self-help center"],
    hours: "Mon–Fri 8:30 AM – 4:30 PM",
    eligibility: "Free civil legal help for low-income residents of Clark County",
    isFree: true, pricingSummary: "Free",
    source: "Legal Aid Center of Southern Nevada", sourceUrl: "https://www.lacsn.org",
    counties: ["clark"],
  },
  {
    name: "Nevada 211",
    category: "community-211",
    type: "Free Information & Referral Line",
    city: "Las Vegas", state: "NV", county: "Clark",
    phone: "211",
    website: "https://www.nevada211.org",
    services: ["Information & referral line", "Senior services & benefits", "Food, housing & utility assistance", "Toll-free: 1-866-535-5654"],
    hours: "Available statewide — dial 211",
    eligibility: "Open to all — dial 211",
    isFree: true, pricingSummary: "Free",
    source: "Nevada 211", sourceUrl: "https://www.nevada211.org",
    counties: ["clark"],
  },
  {
    name: "Alzheimer's Association — Desert Southwest Chapter (Nevada)",
    category: "events-support",
    type: "Dementia Support",
    city: "Las Vegas", state: "NV", county: "Clark",
    phone: "1-800-272-3900",
    website: "https://www.alz.org/dsw",
    services: ["24/7 helpline", "Caregiver & dementia support groups", "Education programs", "Care consultations"],
    hours: "24/7 helpline",
    eligibility: "Families affected by Alzheimer's and dementia",
    isFree: true, pricingSummary: "Free",
    source: "Alzheimer's Association Desert Southwest", sourceUrl: "https://www.alz.org/dsw",
    counties: ["clark"],
  },
  {
    name: "Nevada Senior Services — Adult Day Care Centers",
    category: "healthcare",
    type: "Adult Day Health Care",
    address: "901 N. Jones Blvd",
    city: "Las Vegas", state: "NV", county: "Clark",
    phone: "(702) 648-3425",
    website: "https://nevadaseniorservices.org",
    services: ["Professional nursing care", "Assistance with activities of daily living", "Meals & nutrition", "Social work & recreation", "Henderson center: (702) 368-2273"],
    hours: "Mon–Fri 7:30 AM – 5:30 PM; Sat 8:00 AM – 6:00 PM",
    eligibility: "Older adults needing daytime supervised care in the Las Vegas area",
    isFree: false, pricingSummary: "Fee-based; Medicaid & assistance may apply",
    source: "Nevada Senior Services", sourceUrl: "https://nevadaseniorservices.org",
    counties: ["clark"],
  },
  {
    name: "Southern Nevada Regional Housing Authority (SNRHA)",
    category: "housing",
    type: "Public Housing Authority (Senior Housing)",
    address: "340 N. 11th Street",
    city: "Las Vegas", state: "NV", county: "Clark",
    phone: "(702) 477-3100",
    website: "https://www.snvrha.org",
    services: ["Senior public housing communities", "Senior Supportive Services: (702) 477-3100 ext. 2", "Housing Choice Vouchers (Section 8)"],
    hours: "Mon–Thu 8:00 AM – 5:00 PM",
    eligibility: "Income-qualified seniors in Clark County / southern Nevada",
    isFree: false, pricingSummary: "Income-based rent",
    source: "Southern Nevada Regional Housing Authority", sourceUrl: "https://www.snvrha.org",
    counties: ["clark"],
  },
];

/** All curated listings (NorCal home base + extended metros). */
const ALL_CURATED: CuratedItem[] = [...NORCAL_CURATED, ...EXTENDED_CURATED];

// ---------------------------------------------------------------------------
// Curated region registry — defines which (state, county) pairs are "home base"
// curated coverage, the friendly banner label, and city→county aliasing so a
// city typed into the county field still resolves to its curated county.
// ---------------------------------------------------------------------------

interface CuratedRegion {
  id: string;
  label: string; // banner label, e.g. "Greater Sacramento"
  stateKey: string; // canonical lowercased postal abbrev, e.g. "ca", "az", "nv"
  counties: Set<string>; // lowercased county names with curated coverage
  cityToCounty?: Record<string, string>; // city → county within this region
}

const CURATED_REGIONS: CuratedRegion[] = [
  {
    id: "norcal",
    label: "Northern California",
    stateKey: "ca",
    counties: NORCAL_COUNTIES,
    cityToCounty: NORCAL_CITY_TO_COUNTY,
  },
  {
    id: "sacramento",
    label: "Greater Sacramento",
    stateKey: "ca",
    counties: new Set(["sacramento", "placer", "yolo"]),
    cityToCounty: {
      sacramento: "sacramento", "elk grove": "sacramento", "citrus heights": "sacramento",
      "rancho cordova": "sacramento", folsom: "sacramento",
      roseville: "placer", rocklin: "placer", lincoln: "placer", auburn: "placer",
      davis: "yolo", "west sacramento": "yolo", woodland: "yolo",
    },
  },
  {
    id: "los-angeles",
    label: "Greater Los Angeles",
    stateKey: "ca",
    counties: new Set(["los angeles"]),
    cityToCounty: {
      "los angeles": "los angeles", "long beach": "los angeles", pasadena: "los angeles",
      glendale: "los angeles", "santa monica": "los angeles", burbank: "los angeles",
      torrance: "los angeles", "santa clarita": "los angeles", lancaster: "los angeles", palmdale: "los angeles",
    },
  },
  {
    id: "phoenix",
    label: "Phoenix Metro (Maricopa County)",
    stateKey: "az",
    counties: new Set(["maricopa"]),
    cityToCounty: {
      phoenix: "maricopa", mesa: "maricopa", chandler: "maricopa", scottsdale: "maricopa",
      glendale: "maricopa", gilbert: "maricopa", tempe: "maricopa", peoria: "maricopa", surprise: "maricopa",
    },
  },
  {
    id: "las-vegas",
    label: "Las Vegas Metro (Clark County)",
    stateKey: "nv",
    counties: new Set(["clark"]),
    cityToCounty: {
      "las vegas": "clark", henderson: "clark", "north las vegas": "clark",
      "boulder city": "clark", mesquite: "clark", paradise: "clark",
    },
  },
];

// ---------------------------------------------------------------------------
// National programs (apply to every US location — no location is ever empty)
// ---------------------------------------------------------------------------

const NATIONAL_ITEMS: Omit<ResourceItem, "scope" | "verified">[] = [
  // Healthcare
  { name: "Medicare", category: "healthcare", type: "Federal Health Insurance", phone: "1-800-633-4227", website: "https://www.medicare.gov", services: ["Hospital & medical insurance (65+)", "Prescription drug plans", "Plan finder"], isFree: false, pricingSummary: "Premiums vary", source: "U.S. Centers for Medicare & Medicaid Services", sourceUrl: "https://www.medicare.gov" },
  { name: "PACE — Programs of All-Inclusive Care for the Elderly", category: "healthcare", type: "Comprehensive Senior Care", phone: "1-855-435-7223", website: "https://www.medicare.gov/health-drug-plans/health-plans/your-health-plan-options/pace", services: ["All-inclusive medical & social care", "Helps seniors remain at home"], isFree: false, pricingSummary: "Medicaid/Medicare based", source: "Medicare.gov", sourceUrl: "https://www.medicare.gov/health-drug-plans/health-plans/your-health-plan-options/pace" },
  { name: "Eldercare Locator", category: "healthcare", type: "National Referral Service", phone: "1-800-677-1116", website: "https://eldercare.acl.gov", services: ["Connects to local aging services", "Transportation", "Home care referrals"], isFree: true, pricingSummary: "Free", source: "U.S. Administration for Community Living", sourceUrl: "https://eldercare.acl.gov" },

  // Veterans
  { name: "VA Benefits", category: "veterans", type: "Federal Veterans Benefits", phone: "1-800-827-1000", website: "https://www.va.gov", services: ["Healthcare enrollment", "Pension & Aid & Attendance", "Survivor benefits"], isFree: true, pricingSummary: "Free", source: "U.S. Department of Veterans Affairs", sourceUrl: "https://www.va.gov" },
  { name: "VA Aid & Attendance Pension", category: "veterans", type: "Enhanced Pension Benefit", phone: "1-800-827-1000", website: "https://www.va.gov/pension/aid-attendance-housebound/", services: ["Extra monthly pension for in-home or facility care", "For wartime veterans & surviving spouses"], isFree: true, pricingSummary: "Free to apply", source: "U.S. Department of Veterans Affairs", sourceUrl: "https://www.va.gov/pension/aid-attendance-housebound/" },

  // Housing & Placement
  { name: "HUD Senior Housing (Section 202)", category: "housing", type: "Affordable Senior Housing", phone: "1-800-955-2232", website: "https://www.hud.gov/topics/information_for_senior_citizens", services: ["Affordable housing for 62+", "Supportive housing programs"], isFree: false, pricingSummary: "Income-based rent", source: "U.S. Department of Housing & Urban Development", sourceUrl: "https://www.hud.gov/topics/information_for_senior_citizens" },
  { name: "Area Agency on Aging (Housing & Placement Help)", category: "housing", type: "Local Placement Referrals", phone: "1-800-677-1116", website: "https://eldercare.acl.gov", services: ["Senior housing referrals", "Long-term care options counseling", "Home modification programs"], isFree: true, pricingSummary: "Free", source: "Eldercare Locator", sourceUrl: "https://eldercare.acl.gov" },

  // Financial, Legal & Benefits
  { name: "Social Security Administration", category: "financial-legal", type: "Federal Benefits", phone: "1-800-772-1213", website: "https://www.ssa.gov", services: ["Retirement benefits", "SSI & SSDI", "Medicare enrollment"], isFree: true, pricingSummary: "Free", source: "U.S. Social Security Administration", sourceUrl: "https://www.ssa.gov" },
  { name: "BenefitsCheckUp", category: "financial-legal", type: "Benefits Screening Tool", website: "https://benefitscheckup.org", services: ["Screens for benefit programs", "Prescription, food & utility help"], isFree: true, pricingSummary: "Free", source: "National Council on Aging", sourceUrl: "https://benefitscheckup.org" },
  { name: "Extra Help / Low-Income Subsidy (Medicare Rx)", category: "financial-legal", type: "Prescription Cost Assistance", phone: "1-800-772-1213", website: "https://www.ssa.gov/medicare/part-d-extra-help", services: ["Lowers Medicare prescription costs", "Income-based assistance"], isFree: true, pricingSummary: "Free to apply", source: "U.S. Social Security Administration", sourceUrl: "https://www.ssa.gov/medicare/part-d-extra-help" },

  // Community Support & 211
  { name: "211 — United Way Information Line", category: "community-211", type: "Information & Referral", phone: "211", website: "https://www.211.org", services: ["24/7 referrals to local help", "Food, housing & utility assistance", "Senior services"], isFree: true, pricingSummary: "Free", source: "United Way / 211", sourceUrl: "https://www.211.org" },
  { name: "988 Suicide & Crisis Lifeline", category: "community-211", type: "Crisis Support", phone: "988", website: "https://988lifeline.org", services: ["24/7 mental health crisis support", "Confidential"], isFree: true, pricingSummary: "Free", source: "SAMHSA / 988 Lifeline", sourceUrl: "https://988lifeline.org" },

  // Events & Support Groups
  { name: "Alzheimer's Association 24/7 Helpline", category: "events-support", type: "Dementia Support", phone: "1-800-272-3900", website: "https://www.alz.org", services: ["24/7 helpline", "Support groups", "Caregiver resources"], isFree: true, pricingSummary: "Free", source: "Alzheimer's Association", sourceUrl: "https://www.alz.org" },
  { name: "Family Caregiver Alliance", category: "events-support", type: "Caregiver Support", phone: "1-800-445-8106", website: "https://www.caregiver.org", services: ["Caregiver education", "Support services", "Local services locator"], isFree: true, pricingSummary: "Free", source: "Family Caregiver Alliance", sourceUrl: "https://www.caregiver.org" },
];

// ---------------------------------------------------------------------------
// Advance-care documents — official government/state sources only
// ---------------------------------------------------------------------------

const NATIONAL_ADVANCE_CARE: AdvanceCareLink[] = [
  { name: "Advance Directives by State (CaringInfo)", description: "Free, state-specific advance directive and living will forms.", url: "https://www.caringinfo.org/planning/advance-directives/by-state/", source: "National Hospice and Palliative Care Organization (CaringInfo)", official: true },
  { name: "National POLST", description: "Learn about Physician Orders for Life-Sustaining Treatment and find your state's program.", url: "https://polst.org/", source: "National POLST", official: true },
  { name: "Advance Care Planning (NIA)", description: "Federal guide to living wills, durable power of attorney for health care, and POLST.", url: "https://www.nia.nih.gov/health/advance-care-planning", source: "National Institute on Aging (NIH)", official: true },
  { name: "VA Advance Directive (VA Form 10-0137)", description: "Official advance directive for veterans enrolled in VA health care.", url: "https://www.va.gov/health-care/about-disability-ratings/", source: "U.S. Department of Veterans Affairs", official: true },
];

const STATE_ADVANCE_CARE: Record<string, AdvanceCareLink[]> = {
  CA: [
    { name: "California POLST", description: "Official California Physician Orders for Life-Sustaining Treatment form and guidance.", url: "https://capolst.org", source: "California POLST", official: true },
    { name: "Coalition for Compassionate Care of California", description: "Advance care planning resources and the California Advance Health Care Directive.", url: "https://coalitionccc.org/tools-resources/advance-care-planning-resources/", source: "Coalition for Compassionate Care of California", official: true },
    { name: "California Advance Health Care Directive (Attorney General)", description: "State-published Advance Health Care Directive form (Probate Code §4701).", url: "https://oag.ca.gov/consumers/general/care", source: "California Office of the Attorney General", official: true },
  ],
  AZ: [
    { name: "Arizona Healthcare Directives Registry (AzHDR)", description: "Arizona's free, secure online registry for storing your living will, health care power of attorney, and other advance directives.", url: "https://azhdr.org", source: "Arizona Healthcare Directives Registry", official: true },
    { name: "Arizona Attorney General — Life Care Planning", description: "Free Arizona advance directive forms: living will, health care power of attorney, and mental health care power of attorney.", url: "https://www.azag.gov/seniors/life-care-planning", source: "Arizona Office of the Attorney General", official: true },
  ],
  NV: [
    { name: "Nevada Living Will Lockbox (Advance Directive Registry)", description: "Nevada Secretary of State's free electronic registry for advance directives and guardianship nominations.", url: "https://www.nvsos.gov/sos/online-services/nevada-lockbox", source: "Nevada Secretary of State", official: true },
    { name: "Nevada POLST", description: "Official Nevada Provider Order for Life-Sustaining Treatment form and guidance.", url: "https://www.nevadapolst.org", source: "Nevada POLST", official: true },
  ],
};

// ---------------------------------------------------------------------------
// Cost guard — avoid hammering web discovery for the same location within 24h.
// Mirrors the community-discovery pattern. Resets on server restart.
// ---------------------------------------------------------------------------

const AUTO_DISCOVERY_TTL_MS = 24 * 60 * 60 * 1000;
const recentResourceDiscovery = new Map<string, number>();

function discoveryRecentlyRan(key: string): boolean {
  const last = recentResourceDiscovery.get(key);
  if (!last) return false;
  if (Date.now() - last > AUTO_DISCOVERY_TTL_MS) {
    recentResourceDiscovery.delete(key);
    return false;
  }
  return true;
}

/** Saved senior_resources rows are considered fresh for 30 days. */
const CACHE_FRESHNESS_DAYS = 30;
/** Below this many curated+cached local listings, trigger a fresh web discovery. */
const THIN_COVERAGE_THRESHOLD = 3;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Find the curated region (if any) that covers a given state + county/city. */
function getCuratedRegion(state: string, county: string): CuratedRegion | null {
  const sk = stateAbbrev(state).toLowerCase();
  const c = norm(county);
  for (const region of CURATED_REGIONS) {
    if (region.stateKey !== sk) continue;
    if (region.counties.has(c)) return region;
    if (region.cityToCounty?.[c]) return region;
  }
  return null;
}

/** Resolve a typed county/city to the canonical curated county key for a region. */
function resolveCuratedCounty(region: CuratedRegion, county: string): string {
  const c = norm(county);
  if (region.counties.has(c)) return c;
  return region.cityToCounty?.[c] ?? c;
}

/** Backward-compatible NorCal flag (kept for any existing callers). */
function detectIsNorCal(state: string, county: string): boolean {
  return getCuratedRegion(state, county)?.id === "norcal";
}

function getCuratedItems(state: string, county: string): ResourceItem[] {
  const region = getCuratedRegion(state, county);
  if (!region) return [];
  const countyKey = resolveCuratedCounty(region, county);
  return ALL_CURATED
    .filter((item) => stateAbbrev(item.state || "").toLowerCase() === region.stateKey && item.counties.includes(countyKey))
    .map(({ counties, ...rest }) => ({ ...rest, scope: "curated" as const, verified: true }));
}

function getNationalItems(): ResourceItem[] {
  return NATIONAL_ITEMS.map((item) => ({ ...item, scope: "national" as const, verified: true }));
}

function getAdvanceCare(state: string): AdvanceCareLink[] {
  const abbr = stateAbbrev(state);
  const stateLinks = STATE_ADVANCE_CARE[abbr] || [];
  return [...stateLinks, ...NATIONAL_ADVANCE_CARE];
}

function getFallback(state: string, county: string): ResourceItem[] {
  const locationLabel = county ? `${county}, ${state}` : state;
  return [
    {
      name: "Call 211",
      category: "community-211",
      type: "Free Local Help Line",
      state,
      county,
      phone: "211",
      website: "https://www.211.org",
      services: ["Local senior services", "Food, housing & utility help", "Available 24/7"],
      hours: "24/7",
      eligibility: "Open to all",
      isFree: true,
      pricingSummary: "Free",
      source: "United Way / 211",
      sourceUrl: "https://www.211.org",
      verified: true,
      scope: "national",
    },
    {
      name: "Eldercare Locator — Find your Area Agency on Aging",
      category: "aging-county",
      type: "National Referral Service",
      state,
      county,
      phone: "1-800-677-1116",
      website: "https://eldercare.acl.gov",
      services: [`Find aging services near ${locationLabel}`, "Transportation & home care referrals", "Benefits counseling"],
      hours: "Mon–Fri 9:00 AM – 8:00 PM ET",
      eligibility: "Open to all older adults and caregivers",
      isFree: true,
      pricingSummary: "Free",
      source: "U.S. Administration for Community Living",
      sourceUrl: "https://eldercare.acl.gov",
      verified: true,
      scope: "national",
    },
  ];
}

const US_STATE_ABBREV: Record<string, string> = {
  alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR", california: "CA",
  colorado: "CO", connecticut: "CT", delaware: "DE", florida: "FL", georgia: "GA",
  hawaii: "HI", idaho: "ID", illinois: "IL", indiana: "IN", iowa: "IA",
  kansas: "KS", kentucky: "KY", louisiana: "LA", maine: "ME", maryland: "MD",
  massachusetts: "MA", michigan: "MI", minnesota: "MN", mississippi: "MS", missouri: "MO",
  montana: "MT", nebraska: "NE", nevada: "NV", "new hampshire": "NH", "new jersey": "NJ",
  "new mexico": "NM", "new york": "NY", "north carolina": "NC", "north dakota": "ND", ohio: "OH",
  oklahoma: "OK", oregon: "OR", pennsylvania: "PA", "rhode island": "RI", "south carolina": "SC",
  "south dakota": "SD", tennessee: "TN", texas: "TX", utah: "UT", vermont: "VT",
  virginia: "VA", washington: "WA", "west virginia": "WV", wisconsin: "WI", wyoming: "WY",
  "district of columbia": "DC",
};

function stateAbbrev(state: string): string {
  const s = norm(state);
  if (s.length === 2) return s.toUpperCase();
  return US_STATE_ABBREV[s] || state.toUpperCase();
}

function isUsState(state: string): boolean {
  const s = norm(state);
  return s.length === 2 || !!US_STATE_ABBREV[s];
}

// ---------------------------------------------------------------------------
// Cached + discovered resources from the senior_resources table
// ---------------------------------------------------------------------------

// Keyword classifier: maps a discovered/cached resource to one of the directory
// categories so AI-found local data populates the right tab (Healthcare,
// Veterans, Housing, etc.) instead of all landing in "community-211".
// Order matters — most specific patterns first; community-211 is the catch-all.
const CATEGORY_KEYWORDS: Array<{ category: string; patterns: RegExp }> = [
  { category: "veterans", patterns: /\b(veterans?|va clinic|va medical|military|vfw|american legion|aid (?:&|and) attendance)\b/i },
  { category: "aging-county", patterns: /\b(area agency on aging|\baaa\b|adult protective|\baps\b|county (?:aging|adult|senior|social services|department)|ombudsman|department of aging)\b/i },
  { category: "healthcare", patterns: /\b(health|medical|clinic|hospital|\bpace\b|hospice|home health|nursing|nurse|physician|pharmacy|dental|behavioral health|rehab)\b/i },
  { category: "housing", patterns: /\b(housing|apartments?|placement|assisted living|residence|\bhud\b|section 8|section 202|shelter|low.income housing)\b/i },
  { category: "financial-legal", patterns: /\b(legal|attorney|\blaw\b|benefits?|social security|\bhicap\b|medicare counsel|\btax\b|financial|insurance|conservator|guardianship|fraud)\b/i },
  { category: "events-support", patterns: /\b(support group|caregiver|alzheimer|dementia|grief|bereavement|workshop|class|seminar|event)\b/i },
  { category: "community-211", patterns: /.*/ },
];

function classifyResourceCategory(text: string): string {
  const t = (text || "").toLowerCase();
  for (const { category, patterns } of CATEGORY_KEYWORDS) {
    if (patterns.test(t)) return category;
  }
  return "community-211";
}

function rowToItem(row: any): ResourceItem {
  const metaCategory = typeof row?.metadata?.discoveryCategory === "string" ? row.metadata.discoveryCategory : undefined;
  const servicesText = Array.isArray(row.services) ? row.services.join(" ") : "";
  const category = metaCategory || classifyResourceCategory(`${row.name || ""} ${servicesText} ${row.description || ""}`);
  return {
    name: row.name,
    category,
    type: "Local Resource (community-found)",
    address: row.address || undefined,
    city: row.city || undefined,
    state: row.state || undefined,
    phone: row.phone || undefined,
    website: row.website || undefined,
    email: row.email || undefined,
    services: Array.isArray(row.services) ? row.services : [],
    hours: row.hours || undefined,
    eligibility: row.eligibility || undefined,
    isFree: !!row.isFree,
    pricingSummary: row.pricingSummary || undefined,
    source: row.source === "free_discovery" ? "Found on the web" : (row.source || "Discovered"),
    sourceUrl: row.sourceUrl || row.website || undefined,
    verified: !!row.isVerified,
    scope: "discovered",
    lastFound: (row.discoveredAt || row.updatedAt || new Date()).toString(),
  };
}

async function getCachedResources(state: string, county: string): Promise<ResourceItem[]> {
  const freshnessCutoff = new Date(Date.now() - CACHE_FRESHNESS_DAYS * 24 * 60 * 60 * 1000);
  const abbr = stateAbbrev(state);
  try {
    const rows = await db
      .select()
      .from(seniorResources)
      .where(
        and(
          sql`(LOWER(${seniorResources.state}) = ${norm(state)} OR ${seniorResources.state} = ${abbr})`,
          // County-aware: match the discovery county we recorded in metadata, or
          // fall back to the city column for legacy/user-submitted rows.
          sql`(LOWER(${seniorResources.metadata}->>'discoveryCounty') = ${norm(county)} OR LOWER(${seniorResources.city}) = ${norm(county)})`,
          gte(seniorResources.discoveredAt, freshnessCutoff),
        ),
      )
      .limit(40);
    return rows.map(rowToItem);
  } catch (err) {
    console.error("⚠️ getCachedResources failed:", err);
    return [];
  }
}

/**
 * Run a fresh free web discovery for the location and persist results to the
 * senior_resources table (Golden-Data filtered, SSRF-guarded by the discovery
 * pipeline; unreachable websites dropped). Returns the newly-saved items.
 */
// Category-specific discovery queries so non-NorCal locations populate every
// tab (not just community-211). Each query is tagged with its category and that
// category is persisted in metadata.discoveryCategory for stable repeat reads.
const DISCOVERY_QUERIES: Array<{ category: string; query: (c: string, s: string) => string }> = [
  { category: "aging-county", query: (c, s) => `${c} County ${s} area agency on aging senior services` },
  { category: "healthcare", query: (c, s) => `${c} County ${s} senior healthcare clinic in-home medical services` },
  { category: "veterans", query: (c, s) => `${c} County ${s} veterans service office benefits` },
  { category: "housing", query: (c, s) => `${c} County ${s} senior housing placement assistance` },
  { category: "financial-legal", query: (c, s) => `${c} County ${s} senior legal aid benefits HICAP counseling` },
  { category: "events-support", query: (c, s) => `${c} County ${s} caregiver support group seniors dementia` },
  { category: "community-211", query: (c, s) => `${c} County ${s} senior center community resources` },
];

async function persistDiscoveredEntity(
  entity: any,
  category: string,
  query: string,
  state: string,
  county: string,
): Promise<ResourceItem | null> {
  if (!entity.name || entity.name.length < 4) return null;

  // Golden Data Rule: drop a website that does not actually resolve.
  let website: string | undefined = entity.website || undefined;
  if (website && !(await isReachableWebsite(website))) {
    website = undefined;
  }

  const normalizedName = entity.name.toLowerCase().trim();
  try {
    const existing = await db
      .select()
      .from(seniorResources)
      .where(sql`LOWER(${seniorResources.normalizedName}) = ${normalizedName}`)
      .limit(1);
    if (existing.length > 0) {
      return rowToItem(existing[0]);
    }

    const [inserted] = await db
      .insert(seniorResources)
      .values({
        name: entity.name,
        normalizedName,
        description: entity.description || null,
        shortDescription: entity.description ? entity.description.substring(0, 200) : null,
        address: entity.address || null,
        city: entity.city || county || null,
        state: stateAbbrev(state),
        phone: entity.phone || null,
        website: website || null,
        resourceType: "senior_services",
        services: entity.services || [],
        source: "free_discovery",
        sourceUrl: website || null,
        confidence: entity.confidence || 40,
        isVerified: false,
        metadata: { discoveryQuery: query, discoveryCategory: category, discoveryCounty: county },
      })
      .returning();
    console.log(`✅ Saved discovered resource: ${entity.name} [${category}] (ID: ${inserted.id})`);
    return rowToItem(inserted);
  } catch (insertErr) {
    console.error(`❌ Failed to save resource "${entity.name}":`, insertErr);
    return null;
  }
}

async function runDiscoveryAndPersist(state: string, county: string): Promise<ResourceItem[]> {
  const saved: ResourceItem[] = [];
  const seenNames = new Set<string>();
  try {
    // Run each category's discovery in parallel; tag every candidate with the
    // category that found it so it lands in the correct tab.
    const perCategory = await Promise.all(
      DISCOVERY_QUERIES.map(async ({ category, query }) => {
        const q = query(county, state);
        try {
          const discovered = await discoverResourcesViaWeb(q, county, state);
          console.log(`🔎 [${category}] discovery for ${county}, ${state}: ${discovered.length} candidates`);
          return discovered.map((entity: any) => ({ entity, category, query: q }));
        } catch (catErr) {
          console.error(`⚠️ [${category}] discovery failed:`, catErr);
          return [];
        }
      }),
    );

    // Flatten, then persist sequentially (dedupe by name so the same org found
    // by two category queries is stored once, under the first/most-specific).
    for (const { entity, category, query } of perCategory.flat()) {
      const key = (entity.name || "").toLowerCase().trim();
      if (!key || seenNames.has(key)) continue;
      seenNames.add(key);
      const item = await persistDiscoveredEntity(entity, category, query, state, county);
      if (item) saved.push(item);
    }
  } catch (err) {
    console.error("❌ runDiscoveryAndPersist failed:", err);
  }
  return saved;
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export async function getResourceDirectory(
  state: string,
  county: string,
): Promise<DirectoryResponse> {
  const curatedRegion = getCuratedRegion(state, county);
  const isNorCal = curatedRegion?.id === "norcal";
  const usState = isUsState(state);

  const curated = getCuratedItems(state, county);
  const national = getNationalItems();
  const cached = usState ? await getCachedResources(state, county) : [];

  // Local coverage = curated + cached (national programs apply everywhere but
  // do not count as "local" coverage for the discovery trigger).
  const localCount = curated.length + cached.length;

  let discovered: ResourceItem[] = [];
  let discoveryRan = false;
  const guardKey = `${norm(state)}|${norm(county)}`;

  // Curated-first; only run a fresh live discovery for US locations with thin
  // local coverage that we haven't already hit recently (cost guard).
  if (usState && localCount < THIN_COVERAGE_THRESHOLD && county && !discoveryRecentlyRan(guardKey)) {
    recentResourceDiscovery.set(guardKey, Date.now());
    discovered = await runDiscoveryAndPersist(state, county);
    discoveryRan = true;
  }

  // De-duplicate discovered against cached by normalized name.
  const seen = new Set<string>([...curated, ...cached].map((i) => i.name.toLowerCase().replace(/[^a-z0-9]/g, "")));
  const dedupedDiscovered = discovered.filter((i) => {
    const k = i.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const items = [...curated, ...cached, ...dedupedDiscovered, ...national];

  return {
    location: { state, county },
    categories: RESOURCE_CATEGORIES,
    items,
    advanceCare: getAdvanceCare(state),
    fallback: getFallback(state, county),
    meta: {
      curatedCount: curated.length,
      cachedCount: cached.length,
      discoveredCount: dedupedDiscovered.length,
      nationalCount: national.length,
      isNorCal,
      hasCuratedCoverage: !!curatedRegion,
      curatedRegion: curatedRegion?.label ?? null,
      discoveryRan,
      timestamp: new Date().toISOString(),
    },
  };
}
