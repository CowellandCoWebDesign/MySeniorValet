/**
 * Senior Resource Directory — shared taxonomy + types.
 *
 * The directory is BAKED-IN: the server pre-builds the full listing set from
 * curated + cached data and injects it into the initial HTML of
 * /senior-resources (see server/seo/resource-directory-seo.ts). The client
 * page reads the same payload — no on-page-load live lookup.
 *
 * Category ids double as stable in-page anchor slugs (#food-assistance, …).
 * Keep ids stable: they are linked from other pages and indexed by crawlers.
 */

export interface DirectoryCategoryDef {
  /** Stable slug — also the in-page anchor id. */
  id: string;
  label: string;
  description: string;
  /** lucide icon name, resolved on the client. */
  icon: string;
}

/**
 * Full A–Z category taxonomy (kept alphabetical by label).
 */
export const DIRECTORY_CATEGORIES: DirectoryCategoryDef[] = [
  { id: "adult-protective-services", label: "Adult Protective Services", description: "Report elder abuse, neglect, or financial exploitation and get protective services for vulnerable adults.", icon: "Shield" },
  { id: "advance-planning", label: "Advance Planning", description: "Advance directives, POLST forms, and durable power of attorney for health care — official sources only.", icon: "FileText" },
  { id: "affordable-senior-housing", label: "Affordable Senior Housing", description: "Income-based senior apartments, HUD Section 202 communities, and public housing authorities.", icon: "Home" },
  { id: "area-agencies-on-aging", label: "Area Agencies on Aging", description: "Your regional Area Agency on Aging — information & assistance, care coordination, and Older Americans Act programs.", icon: "Building" },
  { id: "caregiver-support", label: "Caregiver Support & Respite", description: "Family caregiver support groups, respite care, education, and counseling.", icon: "HandHeart" },
  { id: "dementia-memory-support", label: "Dementia & Memory Support", description: "Alzheimer's and dementia helplines, support groups, and care consultations.", icon: "Brain" },
  { id: "estate-planning-elder-law", label: "Estate Planning & Elder Law", description: "Free senior legal services, wills and trusts, powers of attorney, and elder abuse restraining orders.", icon: "Scale" },
  { id: "food-assistance", label: "Food Assistance", description: "Food banks, senior food box programs, CalFresh/SNAP enrollment, and emergency food.", icon: "ShoppingBasket" },
  { id: "funeral-homes-cremation", label: "Funeral Homes & Cremation", description: "Funeral planning consumer resources and state licensing/consumer-protection contacts.", icon: "Flower2" },
  { id: "home-care", label: "Home Care (Non-Medical)", description: "Personal care, companionship, and homemaking help so seniors can stay safely at home.", icon: "Heart" },
  { id: "home-health", label: "Home Health", description: "Skilled nursing, therapy, and medical care delivered at home under a doctor's orders.", icon: "Stethoscope" },
  { id: "hospice", label: "Hospice & Palliative Care", description: "Comfort-focused end-of-life care at home or in a facility, covered by Medicare.", icon: "HeartHandshake" },
  { id: "hospitals-clinics", label: "Hospitals & Clinics", description: "Hospitals, community health centers, PACE programs, and senior medical services.", icon: "Cross" },
  { id: "in-home-supportive-services", label: "In-Home Supportive Services (IHSS)", description: "California's IHSS program pays for in-home care for eligible seniors — county office contacts and how to apply.", icon: "Home" },
  { id: "meals-on-wheels", label: "Meals on Wheels & Senior Dining", description: "Home-delivered meals for homebound seniors and congregate senior dining sites.", icon: "Utensils" },
  { id: "medical-equipment", label: "Medical Equipment & Supplies", description: "Walkers, wheelchairs, hospital beds, and other durable medical equipment through Medicare suppliers.", icon: "Accessibility" },
  { id: "medicare-benefits-counseling", label: "Medicare & Benefits Counseling", description: "Free HICAP/SHIP Medicare counseling, Social Security, Extra Help, and benefits screening.", icon: "BadgeCheck" },
  { id: "pharmacies-with-delivery", label: "Pharmacies With Delivery", description: "Prescription delivery options and programs that lower medication costs.", icon: "Pill" },
  { id: "senior-centers", label: "Senior Centers", description: "Local senior centers for meals, activities, classes, and connection.", icon: "Users" },
  { id: "skilled-nursing", label: "Skilled Nursing & Rehab", description: "Skilled nursing facilities, short-term rehab after a hospital stay, and how to compare quality.", icon: "BedDouble" },
  { id: "support-groups", label: "Support Groups", description: "Grief, illness, and caregiver support groups plus 24/7 crisis lines.", icon: "MessageCircle" },
  { id: "tax-assistance", label: "Tax Assistance", description: "Free tax preparation for seniors through AARP Tax-Aide and IRS VITA/TCE programs.", icon: "Calculator" },
  { id: "transportation", label: "Transportation", description: "Senior and paratransit rides, dial-a-ride services, and non-emergency medical transportation.", icon: "Car" },
  { id: "utility-bill-assistance", label: "Utility & Bill Assistance", description: "Help paying energy and utility bills (LIHEAP/HEAP) and weatherization programs.", icon: "Zap" },
  { id: "va-aid-attendance", label: "VA Aid & Attendance", description: "The VA's enhanced pension that helps wartime veterans and surviving spouses pay for care.", icon: "Award" },
  { id: "veterans-resources", label: "Veterans Resources", description: "County Veterans Service Offices, VA health care, and benefits claims help.", icon: "Flag" },
];

export const DIRECTORY_CATEGORY_IDS = new Set(DIRECTORY_CATEGORIES.map((c) => c.id));

/** NorCal home-base counties with hand-verified local coverage. */
export const DIRECTORY_COUNTIES: { id: string; label: string }[] = [
  { id: "butte", label: "Butte" },
  { id: "glenn", label: "Glenn" },
  { id: "humboldt", label: "Humboldt" },
  { id: "lassen", label: "Lassen" },
  { id: "mendocino", label: "Mendocino" },
  { id: "modoc", label: "Modoc" },
  { id: "shasta", label: "Shasta" },
  { id: "siskiyou", label: "Siskiyou" },
  { id: "tehama", label: "Tehama" },
  { id: "trinity", label: "Trinity" },
  { id: "yuba", label: "Yuba" },
];

export const DIRECTORY_COUNTY_IDS = new Set(DIRECTORY_COUNTIES.map((c) => c.id));

/** "Need help with…" situation jump links → category anchors. */
export const DIRECTORY_SITUATIONS: { label: string; categoryId: string }[] = [
  { label: "Paying utility bills", categoryId: "utility-bill-assistance" },
  { label: "Getting meals delivered", categoryId: "meals-on-wheels" },
  { label: "Urgent placement after a hospital discharge", categoryId: "skilled-nursing" },
  { label: "Reporting elder abuse or neglect", categoryId: "adult-protective-services" },
  { label: "Keeping a loved one safely at home", categoryId: "home-care" },
  { label: "Help paying for prescriptions", categoryId: "medicare-benefits-counseling" },
  { label: "Free legal help for seniors", categoryId: "estate-planning-elder-law" },
  { label: "Veterans benefits that pay for care", categoryId: "va-aid-attendance" },
  { label: "Rides to medical appointments", categoryId: "transportation" },
  { label: "Memory loss or dementia support", categoryId: "dementia-memory-support" },
  { label: "Finding affordable senior housing", categoryId: "affordable-senior-housing" },
  { label: "Food assistance near you", categoryId: "food-assistance" },
];

export type DirectoryScope = "national" | "state" | "curated" | "discovered";

export interface DirectoryListing {
  name: string;
  /** One of DIRECTORY_CATEGORIES ids. */
  category: string;
  type?: string;
  address?: string;
  city?: string;
  state?: string;
  /** Lowercase county ids this listing serves; empty/undefined = statewide or national. */
  counties?: string[];
  phone?: string;
  website?: string;
  services?: string[];
  hours?: string;
  eligibility?: string;
  isFree?: boolean;
  pricingSummary?: string;
  /** Golden Data Rule: every listing is source-cited. */
  source: string;
  sourceUrl?: string;
  verified: boolean;
  scope: DirectoryScope;
}

export interface BakedResourceDirectory {
  categories: DirectoryCategoryDef[];
  counties: { id: string; label: string }[];
  situations: { label: string; categoryId: string }[];
  listings: DirectoryListing[];
  generatedAt: string;
}
