/**
 * Hand-verified curated listings for the baked Senior Resource Directory.
 *
 * Golden Data Rule: every entry is real and source-cited (official county /
 * agency / program pages). Never add a listing without verifying name,
 * phone, and address against the cited sourceUrl. Omit hours rather than
 * guessing them.
 *
 * Sections:
 *  - NORCAL_LOCAL: county-scoped listings for the 11 NorCal home-base counties
 *    (Butte, Glenn, Humboldt, Lassen, Mendocino, Modoc, Shasta, Siskiyou,
 *    Tehama, Trinity, Yuba). scope: "curated" → "Verified Local" badge.
 *  - CA_STATEWIDE: California-wide programs. scope: "state".
 *  - NATIONAL_ANCHORS: national programs so no category is ever empty.
 *    scope: "national".
 */

import type { DirectoryListing } from "@shared/resource-directory";
import { RESEARCHED_NORCAL_LISTINGS } from "./norcal-researched-listings";

type Curated = Omit<DirectoryListing, "verified" | "scope">;

const local = (l: Curated): DirectoryListing => ({ ...l, verified: true, scope: "curated" });
const state = (l: Curated): DirectoryListing => ({ ...l, verified: true, scope: "state" });
const national = (l: Curated): DirectoryListing => ({ ...l, verified: true, scope: "national" });

// ---------------------------------------------------------------------------
// NorCal home-base counties — hand-verified local listings
// ---------------------------------------------------------------------------

const NORCAL_LOCAL: DirectoryListing[] = [
  // ===== Area Agencies on Aging =====
  local({
    name: "PSA 2 Area Agency on Aging",
    category: "area-agencies-on-aging",
    type: "Area Agency on Aging",
    address: "1647 Hartnell Ave, Suite 6",
    city: "Redding", state: "CA",
    phone: "(530) 229-1435",
    website: "https://www.psa2.org",
    services: ["Information & Assistance", "Senior advocacy", "Long-Term Care Ombudsman", "Caregiver support", "Older Americans Act programs"],
    hours: "Mon–Fri 8:00 AM – 5:00 PM",
    eligibility: "Adults 60+ in Shasta, Trinity, Siskiyou, Lassen, and Modoc Counties",
    isFree: true, pricingSummary: "Free",
    source: "PSA 2 Area Agency on Aging", sourceUrl: "https://www.psa2.org",
    counties: ["shasta", "trinity", "siskiyou", "lassen", "modoc"],
  }),
  local({
    name: "PASSAGES Area Agency on Aging (Area 3)",
    category: "area-agencies-on-aging",
    type: "Area Agency on Aging",
    address: "25 Main St",
    city: "Chico", state: "CA",
    phone: "(530) 898-5923",
    website: "https://www.passagescenter.org",
    services: ["Information & Assistance", "Caregiver Resource Center", "HICAP Medicare counseling", "Long-Term Care Ombudsman", "Senior legal services screening"],
    hours: "Mon–Fri 8:00 AM – 5:00 PM",
    eligibility: "Adults 60+ in Butte, Colusa, Glenn, Plumas, and Tehama Counties",
    isFree: true, pricingSummary: "Free",
    source: "PASSAGES Area Agency on Aging", sourceUrl: "https://www.passagescenter.org",
    counties: ["butte", "glenn", "tehama"],
  }),

  // ===== IHSS & APS (county offices) =====
  local({
    name: "Shasta County Adult Services — In-Home Supportive Services (IHSS)",
    category: "in-home-supportive-services",
    type: "County IHSS Office",
    city: "Redding", state: "CA",
    phone: "(530) 225-5507",
    website: "https://www.shastacounty.gov/health-human-services",
    services: ["IHSS applications & case management", "In-home care for eligible seniors", "Provider enrollment"],
    hours: "Mon–Fri 8:00 AM – 5:00 PM",
    eligibility: "Older and dependent adults in Shasta County (Medi-Cal linked)",
    isFree: true, pricingSummary: "Free",
    source: "Shasta County Health & Human Services Agency", sourceUrl: "https://www.shastacounty.gov/health-human-services",
    counties: ["shasta"],
  }),
  local({
    name: "Shasta County Adult Protective Services",
    category: "adult-protective-services",
    type: "County APS",
    city: "Redding", state: "CA",
    phone: "(530) 225-5798",
    website: "https://www.shastacounty.gov/health-human-services",
    services: ["Report elder or dependent-adult abuse", "Investigations & protective services", "Case management"],
    hours: "Mon–Fri 8:00 AM – 5:00 PM",
    eligibility: "Older and dependent adults in Shasta County",
    isFree: true, pricingSummary: "Free",
    source: "Shasta County Health & Human Services Agency", sourceUrl: "https://www.shastacounty.gov/health-human-services",
    counties: ["shasta"],
  }),
  local({
    name: "Tehama County Department of Social Services — Adult Services (IHSS & APS)",
    category: "in-home-supportive-services",
    type: "County IHSS & APS Office",
    address: "310 South Main Street",
    city: "Red Bluff", state: "CA",
    phone: "(530) 527-1911",
    website: "https://www.tcdss.org",
    services: ["In-Home Supportive Services (IHSS)", "Adult Protective Services", "Senior assistance"],
    hours: "Mon–Fri 8:00 AM – 5:00 PM",
    eligibility: "Older and dependent adults in Tehama County",
    isFree: true, pricingSummary: "Free",
    source: "Tehama County Department of Social Services", sourceUrl: "https://www.tcdss.org",
    counties: ["tehama"],
  }),

  // ===== Meals on Wheels & Senior Dining =====
  local({
    name: "Dignity Health Connected Living (formerly Golden Umbrella)",
    category: "meals-on-wheels",
    type: "Senior Nutrition & In-Home Services",
    address: "200 Mercy Oaks Dr",
    city: "Redding", state: "CA",
    phone: "(530) 226-3002",
    website: "https://www.dignityhealth.org/north-state/locations/connected-living",
    services: ["Meals on Wheels: (530) 226-3073", "Senior dining centers", "In-home senior support", "Care management"],
    hours: "Mon–Fri 8:30 AM – 2:30 PM",
    eligibility: "Seniors 60+ in Shasta County; homebound for Meals on Wheels",
    isFree: false, pricingSummary: "Suggested donation for meals",
    source: "Dignity Health Connected Living", sourceUrl: "https://www.dignityhealth.org/north-state/locations/connected-living",
    counties: ["shasta"],
  }),

  // ===== Food Assistance (ported from the verified food-bank dataset) =====
  local({
    name: "Shasta Senior Nutrition Program / Dignity Health Connected Living Food Bank",
    category: "food-assistance",
    type: "Senior Food Bank",
    address: "100 Mercy Oaks Drive",
    city: "Redding", state: "CA",
    phone: "(530) 226-3071",
    website: "https://www.ssnpweb.org",
    services: ["Senior food box program", "Emergency food", "Senior dining centers"],
    hours: "1st & 3rd Friday 8:00–9:00 AM (emergency food); 4th Saturday 8:00–10:00 AM (monthly)",
    eligibility: "Seniors 60+ with income guidelines for box program; all ages for emergency food",
    isFree: true, pricingSummary: "Free",
    source: "Shasta Senior Nutrition Program", sourceUrl: "https://www.ssnpweb.org",
    counties: ["shasta"],
  }),
  local({
    name: "Anderson-Cottonwood Christian Assistance (ACCA)",
    category: "food-assistance",
    type: "Community Food Pantry",
    address: "2979 East Center Street",
    city: "Anderson", state: "CA",
    phone: "(530) 365-4220",
    services: ["Food pantry", "Emergency food assistance"],
    hours: "Tuesday & Friday 10:00 AM – 1:45 PM",
    eligibility: "Anderson, Cottonwood, Happy Valley, Shingletown residents — ID & proof of address required",
    isFree: true, pricingSummary: "Free",
    source: "Anderson-Cottonwood Christian Assistance", sourceUrl: "https://www.211norcal.org/",
    counties: ["shasta"],
  }),
  local({
    name: "Good News Rescue Mission",
    category: "food-assistance",
    type: "Mission & Meal Program",
    address: "3075 Veda Street",
    city: "Redding", state: "CA",
    phone: "(530) 241-5754",
    services: ["Free daily meals (breakfast, lunch, dinner)", "Shelter", "Clothing"],
    hours: "Breakfast 6:30 AM daily; Lunch 12:00 PM Mon–Sat (1:00 PM Sun); Dinner 5:45 PM daily",
    eligibility: "Open to all",
    isFree: true, pricingSummary: "Free",
    source: "Good News Rescue Mission", sourceUrl: "https://www.211norcal.org/",
    counties: ["shasta"],
  }),

  // ===== Hospitals & Clinics =====
  local({
    name: "Trinity County Behavioral Health Services",
    category: "hospitals-clinics",
    type: "Behavioral & Older-Adult Mental Health",
    address: "1450 Main St",
    city: "Weaverville", state: "CA",
    phone: "(530) 623-1362",
    website: "https://www.trinitycounty.org/Behavioral-Health",
    services: ["Older-adult mental health (65+)", "Telehealth appointments", "24/7 Crisis Line: (530) 623-5708"],
    hours: "Mon–Fri 8:00 AM – 5:00 PM",
    eligibility: "Trinity County residents; specialized care for seniors 65+",
    isFree: true, pricingSummary: "Medi-Cal accepted",
    source: "Trinity County Behavioral Health", sourceUrl: "https://www.trinitycounty.org/Behavioral-Health",
    counties: ["trinity"],
  }),

  // ===== Affordable Senior Housing =====
  local({
    name: "Housing Authority of the County of Shasta (HCAP)",
    category: "affordable-senior-housing",
    type: "Public Housing Authority (Senior Housing)",
    address: "2600 Park Marina Drive",
    city: "Redding", state: "CA",
    phone: "(530) 225-5160",
    website: "https://www.shastacounty.gov/housing-community-action-programs",
    services: ["Senior housing communities (Burney Commons, Cascade Village)", "Housing Choice Vouchers (Section 8)"],
    hours: "Mon–Fri 9:00 AM – 4:00 PM",
    eligibility: "Income-qualified seniors in Shasta, Siskiyou, Trinity & Modoc Counties",
    isFree: false, pricingSummary: "Income-based rent",
    source: "Housing Authority of the County of Shasta", sourceUrl: "https://www.shastacounty.gov/housing-community-action-programs",
    counties: ["shasta", "siskiyou", "trinity", "modoc"],
  }),

  // ===== Veterans =====
  local({
    name: "Shasta County Veterans Service Office",
    category: "veterans-resources",
    type: "County Veterans Service Office",
    address: "1855 Shasta Street",
    city: "Redding", state: "CA",
    phone: "(530) 225-5616",
    website: "https://www.shastacounty.gov/veterans",
    services: ["VA benefits claims assistance", "Aid & Attendance pension help", "Survivor benefits", "Healthcare enrollment"],
    hours: "Mon–Fri 8:30–11:30 AM & 1:00–4:00 PM (walk-ins welcome)",
    eligibility: "Veterans and dependents in Shasta County",
    isFree: true, pricingSummary: "Free",
    source: "Shasta County Veterans Service Office", sourceUrl: "https://www.shastacounty.gov/veterans",
    counties: ["shasta"],
  }),

  // ===== Estate Planning & Elder Law =====
  local({
    name: "Legal Services of Northern California — Redding",
    category: "estate-planning-elder-law",
    type: "Free Civil Legal Aid (Senior Legal Services)",
    address: "1370 West Street",
    city: "Redding", state: "CA",
    phone: "(800) 822-9687",
    website: "https://lsnc.net/office/redding",
    services: ["Wills, trusts & powers of attorney", "Elder abuse restraining orders", "Housing preservation", "Public benefits & healthcare"],
    hours: "Mon, Tue, Wed, Fri 9:00–11:45 AM & 1:00–4:45 PM; Thu 1:00–4:45 PM",
    eligibility: "Free Senior Legal Services for adults 60+; serves the northern counties",
    isFree: true, pricingSummary: "Free",
    source: "Legal Services of Northern California", sourceUrl: "https://lsnc.net/office/redding",
    counties: ["shasta", "tehama", "trinity", "siskiyou", "lassen", "modoc"],
  }),

  // ===== Caregiver Support =====
  local({
    name: "PASSAGES Caregiver Resource Center",
    category: "caregiver-support",
    type: "Caregiver Support",
    address: "25 Main St",
    city: "Chico", state: "CA",
    phone: "(530) 898-5923",
    website: "https://www.passagescenter.org/caregiver-support/",
    services: ["Family caregiver support groups", "Respite assistance", "Care planning & counseling", "Education workshops"],
    hours: "Mon–Fri 8:00 AM – 5:00 PM",
    eligibility: "Family caregivers of adults with chronic conditions in the north state",
    isFree: true, pricingSummary: "Free",
    source: "PASSAGES Caregiver Resource Center", sourceUrl: "https://www.passagescenter.org/caregiver-support/",
    counties: ["butte", "glenn", "tehama"],
  }),
];

// ---------------------------------------------------------------------------
// California statewide programs
// ---------------------------------------------------------------------------

const CA_STATEWIDE: DirectoryListing[] = [
  state({
    name: "HICAP — Health Insurance Counseling & Advocacy Program",
    category: "medicare-benefits-counseling",
    type: "Free Medicare Counseling",
    state: "CA",
    phone: "1-800-434-0222",
    website: "https://www.aging.ca.gov/hicap/",
    services: ["Free Medicare counseling", "Plan comparison (Advantage & Part D)", "Claim & denial appeals help"],
    eligibility: "Medicare beneficiaries of any age and their families",
    isFree: true, pricingSummary: "Free",
    source: "California Department of Aging (HICAP)", sourceUrl: "https://www.aging.ca.gov/hicap/",
  }),
  state({
    name: "Alzheimer's Association — Northern California & Northern Nevada",
    category: "dementia-memory-support",
    type: "Dementia Support",
    state: "CA",
    phone: "1-800-272-3900",
    website: "https://www.alz.org/norcal",
    services: ["24/7 helpline", "Caregiver & dementia support groups", "Education programs", "Care consultations"],
    hours: "24/7 helpline",
    eligibility: "Families affected by Alzheimer's and dementia",
    isFree: true, pricingSummary: "Free",
    source: "Alzheimer's Association", sourceUrl: "https://www.alz.org/norcal",
  }),
  state({
    name: "In-Home Supportive Services (IHSS) — California Program Overview",
    category: "in-home-supportive-services",
    type: "State Program Information",
    state: "CA",
    website: "https://www.cdss.ca.gov/in-home-supportive-services",
    services: ["How IHSS works & who qualifies", "Links to every county IHSS office (IHSS is county-administered)", "Provider information"],
    eligibility: "Californians who are 65+, blind, or disabled and eligible for Medi-Cal",
    isFree: true, pricingSummary: "Free",
    source: "California Department of Social Services", sourceUrl: "https://www.cdss.ca.gov/in-home-supportive-services",
  }),
  state({
    name: "California Adult Protective Services — 24/7 Statewide Report Line",
    category: "adult-protective-services",
    type: "State Report Line",
    state: "CA",
    phone: "1-833-401-0832",
    website: "https://www.cdss.ca.gov/adult-protective-services",
    services: ["Report elder/dependent adult abuse, neglect, or exploitation", "24/7 statewide intake routed to county APS by ZIP code"],
    hours: "24/7",
    isFree: true, pricingSummary: "Free",
    source: "California Department of Social Services", sourceUrl: "https://www.cdss.ca.gov/adult-protective-services",
  }),
  state({
    name: "CalFresh (SNAP) Information Line",
    category: "food-assistance",
    type: "State Nutrition Benefits",
    state: "CA",
    phone: "1-877-847-3663",
    website: "https://www.cdss.ca.gov/CalFresh",
    services: ["CalFresh/SNAP food benefit information", "Application guidance and referral to county offices"],
    isFree: true, pricingSummary: "Free to apply",
    source: "California Department of Social Services", sourceUrl: "https://cdss.ca.gov/inforesources/calfresh/contacts",
  }),
  state({
    name: "California LIHEAP — Energy Bill Assistance (CSD)",
    category: "utility-bill-assistance",
    type: "State Energy Assistance",
    state: "CA",
    phone: "1-866-675-6623",
    website: "https://www.csd.ca.gov/Pages/Assistance-PayingMyEnergyBills.aspx",
    services: ["Help paying heating/cooling and utility bills (LIHEAP)", "Referral to local service providers", "Weatherization"],
    isFree: true, pricingSummary: "Free to apply",
    source: "California Department of Community Services and Development", sourceUrl: "https://www.csd.ca.gov/Pages/Assistance-PayingMyEnergyBills.aspx",
  }),
  state({
    name: "California Long-Term Care Ombudsman CRISISline",
    category: "skilled-nursing",
    type: "Resident Rights & Advocacy",
    state: "CA",
    phone: "1-800-231-4024",
    website: "https://www.aging.ca.gov/Programs_and_Services/Long-Term_Care_Ombudsman/",
    services: ["24/7 crisis line for nursing home & assisted living residents", "Complaint investigation & resident advocacy"],
    hours: "24/7",
    isFree: true, pricingSummary: "Free",
    source: "California Department of Aging", sourceUrl: "https://www.aging.ca.gov/Programs_and_Services/Long-Term_Care_Ombudsman/",
  }),
  state({
    name: "CalVet — California Department of Veterans Affairs",
    category: "veterans-resources",
    type: "State Veterans Benefits",
    state: "CA",
    phone: "1-800-952-5626",
    website: "https://www.calvet.ca.gov/",
    services: ["State veterans benefits & claims help", "Veterans Homes of California", "Connects to County Veterans Service Offices"],
    isFree: true, pricingSummary: "Free",
    source: "California Department of Veterans Affairs", sourceUrl: "https://www.calvet.ca.gov/",
  }),
  state({
    name: "California Cemetery & Funeral Bureau",
    category: "funeral-homes-cremation",
    type: "State Licensing & Consumer Protection",
    state: "CA",
    phone: "(916) 574-7870",
    website: "https://cfb.ca.gov/",
    services: ["Verify funeral home & cemetery licenses", "Consumer guides & complaint process"],
    isFree: true, pricingSummary: "Free",
    source: "California Department of Consumer Affairs", sourceUrl: "https://cfb.ca.gov/",
  }),
  // ===== Advance Planning (official sources only) =====
  state({
    name: "California POLST",
    category: "advance-planning",
    type: "Official POLST Program",
    state: "CA",
    website: "https://capolst.org",
    services: ["Official California POLST form", "Guidance for patients & families"],
    isFree: true, pricingSummary: "Free",
    source: "California POLST", sourceUrl: "https://capolst.org",
  }),
  state({
    name: "California Advance Health Care Directive (Attorney General)",
    category: "advance-planning",
    type: "Official State Form",
    state: "CA",
    website: "https://oag.ca.gov/consumers/general/care",
    services: ["State-published Advance Health Care Directive form (Probate Code §4701)"],
    isFree: true, pricingSummary: "Free",
    source: "California Office of the Attorney General", sourceUrl: "https://oag.ca.gov/consumers/general/care",
  }),
  state({
    name: "Coalition for Compassionate Care of California",
    category: "advance-planning",
    type: "Advance Care Planning Resources",
    state: "CA",
    website: "https://coalitionccc.org/tools-resources/advance-care-planning-resources/",
    services: ["Advance care planning guides", "California Advance Health Care Directive resources"],
    isFree: true, pricingSummary: "Free",
    source: "Coalition for Compassionate Care of California", sourceUrl: "https://coalitionccc.org/tools-resources/advance-care-planning-resources/",
  }),
];

// ---------------------------------------------------------------------------
// National anchor programs — every category keeps at least one entry
// ---------------------------------------------------------------------------

const NATIONAL_ANCHORS: DirectoryListing[] = [
  // Adult Protective Services
  national({
    name: "Adult Protective Services (via Eldercare Locator)",
    category: "adult-protective-services",
    type: "National Referral",
    phone: "1-800-677-1116",
    website: "https://acl.gov/programs/elder-justice/adult-protective-services",
    services: ["Find your local APS office", "Report elder abuse, neglect, or exploitation"],
    isFree: true, pricingSummary: "Free",
    source: "U.S. Administration for Community Living", sourceUrl: "https://acl.gov/programs/elder-justice/adult-protective-services",
  }),
  // Advance Planning
  national({
    name: "Advance Directives by State (CaringInfo)",
    category: "advance-planning",
    type: "Free State Forms",
    website: "https://www.caringinfo.org/planning/advance-directives/by-state/",
    services: ["Free, state-specific advance directive and living will forms"],
    isFree: true, pricingSummary: "Free",
    source: "National Hospice and Palliative Care Organization (CaringInfo)", sourceUrl: "https://www.caringinfo.org/planning/advance-directives/by-state/",
  }),
  national({
    name: "Advance Care Planning (National Institute on Aging)",
    category: "advance-planning",
    type: "Federal Guide",
    website: "https://www.nia.nih.gov/health/advance-care-planning",
    services: ["Living wills", "Durable power of attorney for health care", "POLST explained"],
    isFree: true, pricingSummary: "Free",
    source: "National Institute on Aging (NIH)", sourceUrl: "https://www.nia.nih.gov/health/advance-care-planning",
  }),
  // Affordable Senior Housing
  national({
    name: "HUD Senior Housing (Section 202)",
    category: "affordable-senior-housing",
    type: "Federal Affordable Housing",
    phone: "1-800-955-2232",
    website: "https://www.hud.gov/topics/information_for_senior_citizens",
    services: ["Affordable housing for 62+", "Supportive housing programs"],
    isFree: false, pricingSummary: "Income-based rent",
    source: "U.S. Department of Housing & Urban Development", sourceUrl: "https://www.hud.gov/topics/information_for_senior_citizens",
  }),
  // Area Agencies on Aging
  national({
    name: "Eldercare Locator — Find Your Area Agency on Aging",
    category: "area-agencies-on-aging",
    type: "National Referral Service",
    phone: "1-800-677-1116",
    website: "https://eldercare.acl.gov",
    services: ["Connects to local aging services", "Transportation & home care referrals", "Benefits counseling"],
    hours: "Mon–Fri 9:00 AM – 8:00 PM ET",
    isFree: true, pricingSummary: "Free",
    source: "U.S. Administration for Community Living", sourceUrl: "https://eldercare.acl.gov",
  }),
  // Caregiver Support
  national({
    name: "Family Caregiver Alliance",
    category: "caregiver-support",
    type: "Caregiver Support",
    phone: "1-800-445-8106",
    website: "https://www.caregiver.org",
    services: ["Caregiver education", "Support services", "Local services locator"],
    isFree: true, pricingSummary: "Free",
    source: "Family Caregiver Alliance", sourceUrl: "https://www.caregiver.org",
  }),
  // Dementia & Memory Support
  national({
    name: "Alzheimer's Association 24/7 Helpline",
    category: "dementia-memory-support",
    type: "National Helpline",
    phone: "1-800-272-3900",
    website: "https://www.alz.org",
    services: ["24/7 helpline", "Support groups", "Caregiver resources"],
    hours: "24/7",
    isFree: true, pricingSummary: "Free",
    source: "Alzheimer's Association", sourceUrl: "https://www.alz.org",
  }),
  // Estate Planning & Elder Law
  national({
    name: "Eldercare Locator — Free Legal Assistance Referrals",
    category: "estate-planning-elder-law",
    type: "National Referral Service",
    phone: "1-800-677-1116",
    website: "https://eldercare.acl.gov",
    services: ["Referrals to free senior legal aid", "Elder rights programs"],
    isFree: true, pricingSummary: "Free",
    source: "U.S. Administration for Community Living", sourceUrl: "https://eldercare.acl.gov",
  }),
  // Food Assistance
  national({
    name: "SNAP (Supplemental Nutrition Assistance Program)",
    category: "food-assistance",
    type: "Federal Nutrition Benefits",
    phone: "1-800-221-5689",
    website: "https://www.fns.usda.gov/snap",
    services: ["Monthly grocery benefits", "Senior-friendly application options"],
    isFree: true, pricingSummary: "Free to apply",
    source: "USDA Food and Nutrition Service", sourceUrl: "https://www.fns.usda.gov/snap",
  }),
  national({
    name: "Feeding America — Find Your Local Food Bank",
    category: "food-assistance",
    type: "National Food Bank Network",
    website: "https://www.feedingamerica.org/find-your-local-foodbank",
    services: ["Locate food banks and pantries near you", "Senior food programs"],
    isFree: true, pricingSummary: "Free",
    source: "Feeding America", sourceUrl: "https://www.feedingamerica.org/find-your-local-foodbank",
  }),
  // Home Care
  national({
    name: "Eldercare Locator — Home Care Referrals",
    category: "home-care",
    type: "National Referral Service",
    phone: "1-800-677-1116",
    website: "https://eldercare.acl.gov",
    services: ["Referrals to local in-home care programs", "Options counseling"],
    isFree: true, pricingSummary: "Free",
    source: "U.S. Administration for Community Living", sourceUrl: "https://eldercare.acl.gov",
  }),
  // Home Health
  national({
    name: "Medicare Care Compare — Home Health Agencies",
    category: "home-health",
    type: "Federal Quality Comparison Tool",
    phone: "1-800-633-4227",
    website: "https://www.medicare.gov/care-compare/",
    services: ["Compare Medicare-certified home health agencies", "Quality ratings & patient surveys"],
    isFree: true, pricingSummary: "Free",
    source: "U.S. Centers for Medicare & Medicaid Services", sourceUrl: "https://www.medicare.gov/care-compare/",
  }),
  // Hospice
  national({
    name: "Medicare Hospice Benefit",
    category: "hospice",
    type: "Federal Benefit Information",
    phone: "1-800-633-4227",
    website: "https://www.medicare.gov/coverage/hospice-care",
    services: ["What hospice covers under Medicare", "How to find Medicare-certified hospices"],
    isFree: true, pricingSummary: "Covered by Medicare",
    source: "U.S. Centers for Medicare & Medicaid Services", sourceUrl: "https://www.medicare.gov/coverage/hospice-care",
  }),
  // Hospitals & Clinics
  national({
    name: "Medicare",
    category: "hospitals-clinics",
    type: "Federal Health Insurance",
    phone: "1-800-633-4227",
    website: "https://www.medicare.gov",
    services: ["Hospital & medical insurance (65+)", "Prescription drug plans", "Plan finder"],
    isFree: false, pricingSummary: "Premiums vary",
    source: "U.S. Centers for Medicare & Medicaid Services", sourceUrl: "https://www.medicare.gov",
  }),
  national({
    name: "HRSA Find a Health Center",
    category: "hospitals-clinics",
    type: "Federal Health Center Locator",
    phone: "1-877-464-4772",
    website: "https://findahealthcenter.hrsa.gov/",
    services: ["Find low-cost community health centers near you", "Sliding-fee care regardless of insurance"],
    isFree: true, pricingSummary: "Sliding fee",
    source: "U.S. Health Resources & Services Administration", sourceUrl: "https://findahealthcenter.hrsa.gov/",
  }),
  national({
    name: "PACE — Programs of All-Inclusive Care for the Elderly",
    category: "hospitals-clinics",
    type: "Comprehensive Senior Care",
    phone: "1-855-435-7223",
    website: "https://www.medicare.gov/health-drug-plans/health-plans/your-health-plan-options/pace",
    services: ["All-inclusive medical & social care", "Helps seniors remain at home"],
    isFree: false, pricingSummary: "Medicaid/Medicare based",
    source: "Medicare.gov", sourceUrl: "https://www.medicare.gov/health-drug-plans/health-plans/your-health-plan-options/pace",
  }),
  // Meals on Wheels
  national({
    name: "Meals on Wheels America — Find a Local Program",
    category: "meals-on-wheels",
    type: "National Meal Delivery Network",
    phone: "1-888-998-6325",
    website: "https://www.mealsonwheelsamerica.org",
    services: ["Home-delivered meals for homebound seniors", "Local program locator"],
    isFree: false, pricingSummary: "Often donation-based",
    source: "Meals on Wheels America", sourceUrl: "https://www.mealsonwheelsamerica.org",
  }),
  // Medical Equipment
  national({
    name: "Medicare Medical Equipment & Suppliers Directory",
    category: "medical-equipment",
    type: "Federal Supplier Directory",
    phone: "1-800-633-4227",
    website: "https://www.medicare.gov/medical-equipment-suppliers/",
    services: ["Find Medicare-approved DME suppliers", "Walkers, wheelchairs, hospital beds & more"],
    isFree: true, pricingSummary: "Free to search",
    source: "U.S. Centers for Medicare & Medicaid Services", sourceUrl: "https://www.medicare.gov/medical-equipment-suppliers/",
  }),
  // Medicare & Benefits Counseling
  national({
    name: "Social Security Administration",
    category: "medicare-benefits-counseling",
    type: "Federal Benefits",
    phone: "1-800-772-1213",
    website: "https://www.ssa.gov",
    services: ["Retirement benefits", "SSI & SSDI", "Medicare enrollment"],
    isFree: true, pricingSummary: "Free",
    source: "U.S. Social Security Administration", sourceUrl: "https://www.ssa.gov",
  }),
  national({
    name: "Extra Help / Low-Income Subsidy (Medicare Rx)",
    category: "medicare-benefits-counseling",
    type: "Prescription Cost Assistance",
    phone: "1-800-772-1213",
    website: "https://www.ssa.gov/medicare/part-d-extra-help",
    services: ["Lowers Medicare prescription costs", "Income-based assistance"],
    isFree: true, pricingSummary: "Free to apply",
    source: "U.S. Social Security Administration", sourceUrl: "https://www.ssa.gov/medicare/part-d-extra-help",
  }),
  national({
    name: "BenefitsCheckUp",
    category: "medicare-benefits-counseling",
    type: "Benefits Screening Tool",
    website: "https://benefitscheckup.org",
    services: ["Screens for benefit programs", "Prescription, food & utility help"],
    isFree: true, pricingSummary: "Free",
    source: "National Council on Aging", sourceUrl: "https://benefitscheckup.org",
  }),
  // Pharmacies With Delivery
  national({
    name: "Medicare Plan Finder — Drug Plans & Pharmacy Coverage",
    category: "pharmacies-with-delivery",
    type: "Federal Plan Comparison Tool",
    phone: "1-800-633-4227",
    website: "https://www.medicare.gov/plan-compare/",
    services: ["Compare Part D drug plans", "Check which pharmacies (including mail-order/delivery) are in network"],
    isFree: true, pricingSummary: "Free",
    source: "U.S. Centers for Medicare & Medicaid Services", sourceUrl: "https://www.medicare.gov/plan-compare/",
  }),
  // Senior Centers
  national({
    name: "Find Your Local Senior Center (Eldercare Locator)",
    category: "senior-centers",
    type: "National Referral Service",
    phone: "1-800-677-1116",
    website: "https://eldercare.acl.gov",
    services: ["Locate senior centers near you", "Meals, activities & classes"],
    isFree: true, pricingSummary: "Free",
    source: "U.S. Administration for Community Living", sourceUrl: "https://eldercare.acl.gov",
  }),
  // Skilled Nursing
  national({
    name: "Medicare Care Compare — Nursing Homes & Rehab",
    category: "skilled-nursing",
    type: "Federal Quality Comparison Tool",
    phone: "1-800-633-4227",
    website: "https://www.medicare.gov/care-compare/",
    services: ["Compare skilled nursing facility quality ratings", "Inspection results & staffing data"],
    isFree: true, pricingSummary: "Free",
    source: "U.S. Centers for Medicare & Medicaid Services", sourceUrl: "https://www.medicare.gov/care-compare/",
  }),
  // Support Groups
  national({
    name: "988 Suicide & Crisis Lifeline",
    category: "support-groups",
    type: "Crisis Support",
    phone: "988",
    website: "https://988lifeline.org",
    services: ["24/7 mental health crisis support", "Confidential"],
    hours: "24/7",
    isFree: true, pricingSummary: "Free",
    source: "SAMHSA / 988 Lifeline", sourceUrl: "https://988lifeline.org",
  }),
  // Tax Assistance
  national({
    name: "AARP Foundation Tax-Aide",
    category: "tax-assistance",
    type: "Free Tax Preparation",
    phone: "1-888-227-7669",
    website: "https://www.aarp.org/money/taxes/aarp_taxaide/",
    services: ["Free tax preparation focused on 50+", "In-person and virtual options"],
    isFree: true, pricingSummary: "Free",
    source: "AARP Foundation", sourceUrl: "https://www.aarp.org/money/taxes/aarp_taxaide/",
  }),
  national({
    name: "IRS VITA / TCE — Free Tax Help",
    category: "tax-assistance",
    type: "Federal Free Tax Preparation",
    phone: "1-800-906-9887",
    website: "https://www.irs.gov/individuals/free-tax-return-preparation-for-qualifying-taxpayers",
    services: ["Free tax preparation (TCE specializes in 60+)", "Site locator"],
    isFree: true, pricingSummary: "Free",
    source: "Internal Revenue Service", sourceUrl: "https://www.irs.gov/individuals/free-tax-return-preparation-for-qualifying-taxpayers",
  }),
  // Transportation
  national({
    name: "Eldercare Locator — Transportation Services",
    category: "transportation",
    type: "National Referral Service",
    phone: "1-800-677-1116",
    website: "https://eldercare.acl.gov",
    services: ["Find local senior transportation", "Rides to medical appointments"],
    isFree: true, pricingSummary: "Free",
    source: "U.S. Administration for Community Living", sourceUrl: "https://eldercare.acl.gov",
  }),
  // Utility & Bill Assistance
  national({
    name: "LIHEAP — Low Income Home Energy Assistance Program",
    category: "utility-bill-assistance",
    type: "Federal Energy Bill Assistance",
    website: "https://www.acf.hhs.gov/ocs/programs/liheap",
    services: ["Help paying heating & cooling bills", "Energy crisis assistance", "Weatherization"],
    isFree: true, pricingSummary: "Free to apply",
    source: "U.S. Department of Health & Human Services", sourceUrl: "https://www.acf.hhs.gov/ocs/programs/liheap",
  }),
  // VA Aid & Attendance
  national({
    name: "VA Aid & Attendance Pension",
    category: "va-aid-attendance",
    type: "Enhanced Pension Benefit",
    phone: "1-800-827-1000",
    website: "https://www.va.gov/pension/aid-attendance-housebound/",
    services: ["Extra monthly pension for in-home or facility care", "For wartime veterans & surviving spouses"],
    isFree: true, pricingSummary: "Free to apply",
    source: "U.S. Department of Veterans Affairs", sourceUrl: "https://www.va.gov/pension/aid-attendance-housebound/",
  }),
  // Veterans Resources
  national({
    name: "VA Benefits",
    category: "veterans-resources",
    type: "Federal Veterans Benefits",
    phone: "1-800-827-1000",
    website: "https://www.va.gov",
    services: ["Healthcare enrollment", "Pension & Aid & Attendance", "Survivor benefits"],
    isFree: true, pricingSummary: "Free",
    source: "U.S. Department of Veterans Affairs", sourceUrl: "https://www.va.gov",
  }),
  // Funeral Homes & Cremation
  national({
    name: "Funeral Consumers Alliance",
    category: "funeral-homes-cremation",
    type: "Nonprofit Consumer Organization",
    phone: "(802) 865-8300",
    website: "https://www.funerals.org/",
    services: ["Funeral planning education", "Price surveys & consumer advocacy", "Local affiliate directory"],
    isFree: true, pricingSummary: "Free",
    source: "Funeral Consumers Alliance", sourceUrl: "https://www.funerals.org/",
  }),
  national({
    name: "FTC Funeral Rule — Shopping for Funeral Services",
    category: "funeral-homes-cremation",
    type: "Federal Consumer Guide",
    website: "https://consumer.ftc.gov/articles/shopping-funeral-services",
    services: ["Your rights when arranging a funeral", "Price list requirements", "Cremation options"],
    isFree: true, pricingSummary: "Free",
    source: "Federal Trade Commission", sourceUrl: "https://consumer.ftc.gov/articles/shopping-funeral-services",
  }),
];

/**
 * Merge hand-written listings with the researched batch, deduping obvious
 * same-organization variants (parentheticals and "Office" suffixes ignored).
 * Hand-written entries win because they carry richer service notes.
 */
function mergeLocal(): DirectoryListing[] {
  const dedupeKey = (n: string) =>
    n
      .toLowerCase()
      .replace(/\(.*?\)/g, "")
      .replace(/\boffice\b/g, "")
      .replace(/[^a-z0-9]/g, "");
  const merged: DirectoryListing[] = [...NORCAL_LOCAL];
  const keys = new Set(NORCAL_LOCAL.map((l) => dedupeKey(l.name)));
  for (const l of RESEARCHED_NORCAL_LISTINGS) {
    const k = dedupeKey(l.name);
    if (keys.has(k)) continue;
    keys.add(k);
    merged.push(l);
  }
  return merged;
}

export const CURATED_LOCAL_LISTINGS = mergeLocal();
export const STATEWIDE_LISTINGS = CA_STATEWIDE;
export const NATIONAL_LISTINGS = NATIONAL_ANCHORS;
