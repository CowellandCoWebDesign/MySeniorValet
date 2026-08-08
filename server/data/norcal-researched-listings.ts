/**
 * AUTO-CURATED: hand-verified NorCal county listings gathered from official
 * sources (county .gov, agency sites, aging.ca.gov, cacvso.org, CDSS lists).
 * Golden Data Rule: every entry carries the sourceUrl it was verified on.
 * Hours are omitted wherever they could not be confirmed.
 */

import type { DirectoryListing } from "@shared/resource-directory";

export const RESEARCHED_NORCAL_LISTINGS: DirectoryListing[] = [
  {
    "name": "Area 1 Agency on Aging (A1AA)",
    "category": "area-agencies-on-aging",
    "type": "Area Agency on Aging",
    "address": "333 J Street",
    "city": "Eureka",
    "state": "CA",
    "counties": [
      "humboldt"
    ],
    "phone": "(707) 442-3763",
    "website": "https://a1aa.org/",
    "services": [
      "Information, assistance & referral for older adults",
      "Family caregiver support services",
      "Senior nutrition/meal programs",
      "HICAP Medicare counseling",
      "Long-Term Care Ombudsman program"
    ],
    "eligibility": "Older adults (60+), caregivers; serves Humboldt and Del Norte counties",
    "isFree": true,
    "source": "California Department of Aging \u2013 Find Services in My County (Humboldt)",
    "sourceUrl": "https://aging.ca.gov/Find_Services_in_My_County/My_County/?cc=HUM",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Area 1 Agency on Aging \u2013 HICAP (Medicare Counseling)",
    "category": "medicare-benefits-counseling",
    "type": "HICAP Medicare Counseling",
    "address": "333 J Street",
    "city": "Eureka",
    "state": "CA",
    "counties": [
      "humboldt"
    ],
    "phone": "(707) 444-3000",
    "website": "https://a1aa.org/",
    "services": [
      "Free, unbiased Medicare counseling",
      "Help comparing Medicare plans",
      "Assistance with Medicare claims and appeals",
      "Prescription drug (Part D) guidance"
    ],
    "eligibility": "Medicare beneficiaries and their families",
    "isFree": true,
    "source": "California Department of Aging \u2013 Find Services in My County (Humboldt)",
    "sourceUrl": "https://aging.ca.gov/Find_Services_in_My_County/My_County/?cc=HUM",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Humboldt County In-Home Supportive Services (IHSS)",
    "category": "in-home-supportive-services",
    "type": "IHSS Office",
    "address": "808 E St.",
    "city": "Eureka",
    "state": "CA",
    "counties": [
      "humboldt"
    ],
    "phone": "(707) 476-2100",
    "website": "https://humboldtgov.org/502/In-Home-Supportive-Services",
    "services": [
      "Assessment for in-home care needs",
      "Help with bathing, dressing, grooming",
      "Housekeeping, laundry, shopping, meal prep",
      "Provider referral through Public Authority"
    ],
    "eligibility": "Medi-Cal eligible aged, blind or disabled residents who need help to remain safely at home",
    "isFree": true,
    "source": "Humboldt County DHHS \u2013 IHSS Consumer & Provider Handbook",
    "sourceUrl": "https://humboldtgov.org/DocumentCenter/View/58203/Consumer-and-Provider-Handbook-PDF?bidId=",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Humboldt County Adult Protective Services (APS)",
    "category": "adult-protective-services",
    "type": "Adult Protective Services",
    "address": "808 E St.",
    "city": "Eureka",
    "state": "CA",
    "counties": [
      "humboldt"
    ],
    "phone": "(866) 527-8614",
    "website": "https://humboldtgov.org/499/Adult-Protective-Services",
    "services": [
      "24-hour elder & dependent adult abuse reporting",
      "Investigation of reported at-risk situations",
      "Protective intervention and referrals",
      "Coordination with community services"
    ],
    "eligibility": "Elders (60+) and dependent adults (18-59) unable to protect their own interests",
    "isFree": true,
    "source": "North Coast Resource Hub (211) \u2013 Humboldt Adult Protective Services",
    "sourceUrl": "https://resourcehub.nchiin.org/detail/864",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Humboldt County Veterans Service Office",
    "category": "veterans-resources",
    "type": "County Veterans Service Office (CVSO)",
    "address": "1105 6th St",
    "city": "Eureka",
    "state": "CA",
    "counties": [
      "humboldt"
    ],
    "phone": "(707) 445-7611",
    "website": "https://humboldtgov.org/517/Veterans-Service-Office",
    "services": [
      "Benefits counseling for veterans & dependents",
      "VA claim preparation and submission",
      "Claim follow-up and appeals assistance",
      "Referrals to federal, state & local programs"
    ],
    "eligibility": "Veterans, their dependents and survivors",
    "isFree": true,
    "source": "North Coast Resource Hub (211) \u2013 Veterans Service Office, Humboldt County",
    "sourceUrl": "https://resourcehub.nchiin.org/detail/1128",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Humboldt Senior Resource Center",
    "category": "senior-centers",
    "type": "Senior Center",
    "address": "1910 California Street",
    "city": "Eureka",
    "state": "CA",
    "counties": [
      "humboldt"
    ],
    "phone": "(707) 443-9747",
    "website": "https://humsenior.org/",
    "services": [
      "Senior activities and programs",
      "Heritage Caf\u00e9 senior dining centers",
      "Adult Day Health & Alzheimer's services",
      "Community resource assistance",
      "Nutrition programs"
    ],
    "hours": "9 am \u2013 4:40 pm, Monday\u2013Friday (except holidays)",
    "eligibility": "Older adults",
    "isFree": false,
    "source": "Humboldt Senior Resource Center \u2013 Contact Directory",
    "sourceUrl": "https://humsenior.org/about/contact-directory/",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Meals on Wheels \u2013 Redwood Coast (Humboldt Senior Resource Center)",
    "category": "meals-on-wheels",
    "type": "Home-Delivered Meals / Meals on Wheels",
    "address": "1910 California Street",
    "city": "Eureka",
    "state": "CA",
    "counties": [
      "humboldt"
    ],
    "phone": "(707) 443-9747",
    "website": "https://humsenior.org/programs/nutrition-programs/home-delivered-meals/",
    "services": [
      "Home-delivered meals for homebound seniors",
      "Congregate Heritage Caf\u00e9 dining sites",
      "Nutrition support for older adults"
    ],
    "eligibility": "Homebound older adults (60+)",
    "isFree": false,
    "source": "Humboldt Senior Resource Center \u2013 Contact Directory / Nutrition Programs",
    "sourceUrl": "https://humsenior.org/about/contact-directory/",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Food for People \u2013 The Food Bank for Humboldt County",
    "category": "food-assistance",
    "type": "Food Bank / Senior Nutrition",
    "address": "307 W 14th Street",
    "city": "Eureka",
    "state": "CA",
    "counties": [
      "humboldt"
    ],
    "phone": "(707) 445-3166",
    "website": "https://www.foodforpeople.org/",
    "services": [
      "Senior Brown Bag monthly groceries",
      "Commodity Supplemental Food Program (senior food box)",
      "Choice Pantry food distribution",
      "Countywide food distribution network"
    ],
    "eligibility": "Low-income households; senior programs for age 60+ meeting income limits",
    "isFree": true,
    "source": "Food for People \u2013 Senior Programs",
    "sourceUrl": "https://www.foodforpeople.org/seniors",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Humboldt Transit Authority Dial-a-Ride",
    "category": "transportation",
    "type": "Dial-a-Ride / ADA Paratransit",
    "city": "Eureka",
    "state": "CA",
    "counties": [
      "humboldt"
    ],
    "phone": "(707) 407-1020",
    "website": "https://hta.org/dial-a-ride/",
    "services": [
      "Door-to-door ADA paratransit service",
      "Advance-reservation rides (up to 14 days)",
      "Wheelchair-accessible vehicles",
      "Rides for people with disabilities"
    ],
    "eligibility": "ADA-eligible riders / people with disabilities",
    "isFree": false,
    "source": "Humboldt Transit Authority \u2013 Dial-a-Ride Making Reservations",
    "sourceUrl": "https://hta.org/dial-a-ride/making-reservations/",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Long-Term Care Ombudsman \u2013 Area 1 Agency on Aging",
    "category": "support-groups",
    "type": "Long-Term Care Ombudsman",
    "address": "333 J Street, Suite 209",
    "city": "Eureka",
    "state": "CA",
    "counties": [
      "humboldt"
    ],
    "phone": "(707) 269-1330",
    "website": "https://a1aa.org/ltcop/",
    "services": [
      "Advocacy for residents of nursing & care facilities",
      "Investigation of complaints about long-term care",
      "Protection of residents' rights"
    ],
    "eligibility": "Residents of long-term care facilities and their families",
    "isFree": true,
    "source": "California Department of Aging \u2013 Find Services in My County (Humboldt)",
    "sourceUrl": "https://aging.ca.gov/Find_Services_in_My_County/My_County/?cc=HUM",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Area Agency on Aging of Lake & Mendocino Counties",
    "category": "area-agencies-on-aging",
    "type": "Area Agency on Aging",
    "city": "Lakeport",
    "state": "CA",
    "counties": [
      "mendocino"
    ],
    "phone": "(707) 468-5132",
    "website": "https://www.lakecountyca.gov/727/Area-Agency-on-Aging",
    "services": [
      "Plans & coordinates senior support programs",
      "Family caregiver support",
      "Senior nutrition programs",
      "Long-Term Care Ombudsman",
      "Information & assistance"
    ],
    "eligibility": "Older adults (60+) and caregivers; serves Lake and Mendocino counties",
    "isFree": true,
    "source": "California Department of Aging \u2013 Find Services in My County (Mendocino)",
    "sourceUrl": "https://aging.ca.gov/Find_Services_in_My_County/My_County/?cc=MEN",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Senior Advocacy Services \u2013 HICAP (serving Mendocino)",
    "category": "medicare-benefits-counseling",
    "type": "HICAP Medicare Counseling",
    "address": "1129 Industrial Avenue, Suite 201",
    "city": "Petaluma",
    "state": "CA",
    "counties": [
      "mendocino"
    ],
    "phone": "(707) 526-4108",
    "website": "https://www.senioradvocacyservices.org/",
    "services": [
      "Free Medicare counseling",
      "Plan comparison assistance",
      "Help with claims and appeals",
      "Prescription drug guidance"
    ],
    "eligibility": "Medicare beneficiaries in Mendocino County and their families",
    "isFree": true,
    "source": "California Department of Aging \u2013 Find Services in My County (Mendocino)",
    "sourceUrl": "https://aging.ca.gov/Find_Services_in_My_County/My_County/?cc=MEN",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Mendocino County In-Home Supportive Services (IHSS)",
    "category": "in-home-supportive-services",
    "type": "IHSS Office",
    "address": "747 South State Street",
    "city": "Ukiah",
    "state": "CA",
    "counties": [
      "mendocino"
    ],
    "phone": "(707) 463-7900",
    "website": "https://www.mendocinocounty.gov/residents/public-assistance/in-home-supportive-services",
    "services": [
      "Assessment for in-home care needs",
      "Personal care assistance",
      "Housekeeping, meal prep, shopping",
      "Provider registry via Public Authority"
    ],
    "hours": "Monday\u2013Thursday 8:00am\u20135:00pm",
    "eligibility": "Medi-Cal eligible residents who are aged, blind or disabled and need in-home help",
    "isFree": true,
    "source": "Mendocino County Social Services \u2013 Information for IHSS Recipients",
    "sourceUrl": "https://www.mendocinocounty.gov/departments/social-services/adult-aging-services/in-home-supportive-services/information-for-ihss-recipients",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Mendocino County Adult Protective Services (APS)",
    "category": "adult-protective-services",
    "type": "Adult Protective Services",
    "city": "Ukiah",
    "state": "CA",
    "counties": [
      "mendocino"
    ],
    "phone": "(877) 327-1799",
    "website": "https://www.mendocinocounty.gov/departments/social-services/adult-aging-services/adult-protective-services",
    "services": [
      "24-hour elder & dependent adult abuse hotline",
      "Investigation of reported abuse",
      "Protective services and referrals",
      "Mandated reporter support"
    ],
    "eligibility": "Elders (65+) and dependent adults (18-64 disabled); no income limits",
    "isFree": true,
    "source": "Mendocino County Social Services \u2013 Adult Protective Services",
    "sourceUrl": "https://www.mendocinocounty.gov/departments/social-services/adult-aging-services/adult-protective-services",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Mendocino County Veterans Services Office",
    "category": "veterans-resources",
    "type": "County Veterans Service Office (CVSO)",
    "address": "405 Observatory Avenue",
    "city": "Ukiah",
    "state": "CA",
    "counties": [
      "mendocino"
    ],
    "phone": "(707) 463-4226",
    "website": "https://www.mendocinocounty.gov/departments/social-services/veterans-services",
    "services": [
      "Benefits counseling for veterans & dependents",
      "VA claim preparation and filing",
      "Appeals assistance",
      "Satellite offices in Fort Bragg and Willits"
    ],
    "hours": "Monday\u2013Thursday 8:00am\u20134:00pm (walk-in), 8:00am\u20135:00pm (telephone)",
    "eligibility": "Veterans, their dependents and survivors",
    "isFree": true,
    "source": "Mendocino County \u2013 Veterans Services Business Directory",
    "sourceUrl": "https://www.mendocinocounty.gov/Home/Components/BusinessDirectory/BusinessDirectory/110/667?npage=3",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Ukiah Senior Center",
    "category": "senior-centers",
    "type": "Senior Center",
    "address": "499 Leslie St",
    "city": "Ukiah",
    "state": "CA",
    "counties": [
      "mendocino"
    ],
    "phone": "(707) 462-4343",
    "website": "https://ukiahseniorcenter.org/",
    "services": [
      "Senior activities and social programs",
      "Nutrition and dining programs",
      "Community resources for older adults",
      "Transportation program"
    ],
    "hours": "Monday\u2013Thursday 9:00am\u20134:00pm; Friday closed",
    "eligibility": "Older adults",
    "isFree": false,
    "source": "Ukiah Senior Center \u2013 Contact & Directions",
    "sourceUrl": "https://ukiahseniorcenter.org/about-us/contact-directions",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Plowshares Peace & Justice Center \u2013 Meals on Wheels (Ukiah)",
    "category": "meals-on-wheels",
    "type": "Meals on Wheels / Food Program",
    "address": "1346 South State Street",
    "city": "Ukiah",
    "state": "CA",
    "counties": [
      "mendocino"
    ],
    "phone": "(707) 462-8582",
    "website": "https://www.plowsharesfeeds.org/meals-on-wheels",
    "services": [
      "Home-delivered meals for homebound seniors",
      "Daily hot nutritious meals",
      "Free community dining room",
      "Serving Ukiah Valley, Calpella, Redwood Valley, Hopland"
    ],
    "eligibility": "Homebound seniors age 60 and over in the Ukiah Valley area",
    "isFree": true,
    "source": "Plowshares \u2013 Meals on Wheels",
    "sourceUrl": "https://www.plowsharesfeeds.org/meals-on-wheels",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Mendocino Transit Authority (MTA) Dial-A-Ride",
    "category": "transportation",
    "type": "Dial-a-Ride / Paratransit",
    "city": "Ukiah",
    "state": "CA",
    "counties": [
      "mendocino"
    ],
    "phone": "(707) 462-3881",
    "website": "https://mendocinotransit.org/dial-a-ride/",
    "services": [
      "On-demand door-to-door bus service",
      "Paratransit for seniors (62+) and people with disabilities",
      "24-hour advance reservations",
      "Service in Ukiah and Fort Bragg"
    ],
    "eligibility": "In Ukiah: paratransit customers only (disabled and seniors 62+); Fort Bragg open to general public with senior/disabled discounts",
    "isFree": false,
    "source": "Mendocino Transit Authority \u2013 Dial-A-Ride",
    "sourceUrl": "https://mendocinotransit.org/dial-a-ride/",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Agency on Aging Area 4 (AAA4)",
    "category": "area-agencies-on-aging",
    "type": "Area Agency on Aging",
    "address": "1401 El Camino Avenue, Suite 400",
    "city": "Sacramento",
    "state": "CA",
    "counties": [
      "yuba"
    ],
    "phone": "1-800-211-4545",
    "website": "https://www.agencyonaging4.org/yuba-sutter-counties",
    "services": [
      "Information & assistance / ADRC",
      "HICAP Medicare counseling",
      "Long-term care ombudsman",
      "CalFresh assistance",
      "Senior nutrition & meals coordination"
    ],
    "isFree": true,
    "source": "Agency on Aging Area 4 \u2014 Yuba/Sutter Counties",
    "sourceUrl": "https://www.agencyonaging4.org/yuba-sutter-counties",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Passages Area Agency on Aging (PSA 3)",
    "category": "area-agencies-on-aging",
    "type": "Area Agency on Aging",
    "address": "25 Main Street",
    "city": "Chico",
    "state": "CA",
    "counties": [
      "glenn"
    ],
    "phone": "1-800-822-0109",
    "website": "https://www.passagescenter.org/",
    "services": [
      "Information & assistance / ADRC",
      "Caregiver support",
      "HICAP Medicare counseling",
      "Long-term care ombudsman",
      "Senior nutrition programs"
    ],
    "isFree": true,
    "source": "Passages \u2014 Contact Us",
    "sourceUrl": "https://www.passagescenter.org/contact-us/",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "PSA 2 Area Agency on Aging",
    "category": "area-agencies-on-aging",
    "type": "Area Agency on Aging",
    "address": "208 W. Center Street",
    "city": "Yreka",
    "state": "CA",
    "counties": [
      "siskiyou"
    ],
    "phone": "530-842-1687",
    "website": "https://www.psa2.org/",
    "services": [
      "Information & assistance",
      "HICAP Medicare counseling",
      "Long-term care ombudsman",
      "Elder abuse prevention & education",
      "Caregiver support"
    ],
    "eligibility": "Older adults and adults with disabilities in Lassen, Modoc, Shasta, Siskiyou & Trinity Counties",
    "isFree": true,
    "source": "PSA 2 Area Agency on Aging \u2014 Contact Us",
    "sourceUrl": "https://www.psa2.org/contact-us",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Yuba County Health & Human Services \u2014 Adult Services (IHSS & Adult Protective Services)",
    "category": "in-home-supportive-services",
    "type": "IHSS & Adult Protective Services",
    "address": "5730 Packard Avenue, Suite 100",
    "city": "Marysville",
    "state": "CA",
    "counties": [
      "yuba"
    ],
    "phone": "530-749-6311",
    "website": "https://www.yuba.gov/departments/health_and_human_services/index.php",
    "services": [
      "In-Home Supportive Services (IHSS)",
      "Adult Protective Services",
      "Elder & dependent adult abuse reporting",
      "24-hr abuse hotline: 866-999-9113 / 530-749-6471"
    ],
    "hours": "Mon\u2013Fri 8 a.m. \u2013 5 p.m.",
    "isFree": true,
    "source": "Yuba County HHS; CDSS APS County Contact List (Winter 2024)",
    "sourceUrl": "https://cdss.ca.gov/Portals/9/APS/County%20APS%20Contact%20List%20-%20Winter%202024.pdf",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Glenn County Health & Human Services Agency \u2014 Adult Services (IHSS & Adult Protective Services)",
    "category": "in-home-supportive-services",
    "type": "IHSS & Adult Protective Services",
    "address": "240 N Villa Avenue",
    "city": "Willows",
    "state": "CA",
    "counties": [
      "glenn"
    ],
    "phone": "530-865-1178",
    "website": "https://www.countyofglenn.net/government/departments/health-human-services/social-services/adult-services/ihss",
    "services": [
      "In-Home Supportive Services (IHSS)",
      "Adult Protective Services",
      "IHSS Public Authority provider registry",
      "24-hr abuse hotline: 530-934-1429 / 800-339-9236"
    ],
    "isFree": true,
    "source": "County of Glenn \u2014 Report Adult/Elder Abuse (APS/IHSS)",
    "sourceUrl": "https://www.countyofglenn.net/government/departments/health-human-services/social-services/adult-services/report-adultelder-abuse",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Siskiyou County Health & Human Services \u2014 Adult Services (IHSS & Adult Protective Services)",
    "category": "in-home-supportive-services",
    "type": "IHSS & Adult Protective Services",
    "address": "750 South Main Street",
    "city": "Yreka",
    "state": "CA",
    "counties": [
      "siskiyou"
    ],
    "phone": "530-841-4010",
    "website": "https://www.siskiyoucounty.gov/acs/page/home-supportive-services",
    "services": [
      "In-Home Supportive Services (IHSS)",
      "Adult Protective Services",
      "Elder & dependent adult abuse reporting",
      "24-hr abuse hotline: 530-842-7009"
    ],
    "hours": "Mon\u2013Fri 8:00am\u20135:00pm (closed 12\u20131pm)",
    "isFree": true,
    "source": "Siskiyou County \u2014 Adult & Children Services Contact Information",
    "sourceUrl": "https://www.siskiyoucounty.gov/acs/custom-contact-page/adult-and-children-services-contact-information",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Yuba-Sutter County Veterans Service Office",
    "category": "veterans-resources",
    "type": "County Veterans Service Office",
    "address": "5730 Packard Avenue, Suite 300",
    "city": "Marysville",
    "state": "CA",
    "counties": [
      "yuba"
    ],
    "phone": "530-749-6710",
    "website": "https://www.cacvso.org/county-contacts/",
    "services": [
      "VA disability compensation & pension claims",
      "Veterans benefits counseling",
      "DMV & fee waiver benefits",
      "Aid & Attendance assistance"
    ],
    "eligibility": "Veterans and dependents in Yuba and Sutter Counties",
    "isFree": true,
    "source": "CACVSO \u2014 Find Your VSO (county contacts)",
    "sourceUrl": "https://www.cacvso.org/county-contacts/",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Glenn County Veterans Service Office",
    "category": "veterans-resources",
    "type": "County Veterans Service Office",
    "address": "525 W. Sycamore Street, Suite A5",
    "city": "Willows",
    "state": "CA",
    "counties": [
      "glenn"
    ],
    "phone": "530-934-6524",
    "website": "https://www.countyofglenn.net/government/departments/health-human-services/veterans-services",
    "services": [
      "VA compensation & pension claims",
      "VA healthcare enrollment",
      "College fee waiver",
      "Aid & Attendance assistance"
    ],
    "eligibility": "Veterans and dependents in Glenn County",
    "isFree": true,
    "source": "CACVSO \u2014 Find Your VSO; County of Glenn Veterans Services",
    "sourceUrl": "https://www.cacvso.org/county-contacts/",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Siskiyou County Veterans Service Office",
    "category": "veterans-resources",
    "type": "County Veterans Service Office",
    "address": "105 E. Oberlin Road",
    "city": "Yreka",
    "state": "CA",
    "counties": [
      "siskiyou"
    ],
    "phone": "530-842-8010",
    "website": "https://www.siskiyoucounty.gov/sheriff/page/veterans-services",
    "services": [
      "VA disability compensation & pension claims",
      "Veterans benefits counseling",
      "Aid & Attendance assistance",
      "Burial & survivor benefits"
    ],
    "hours": "Mon\u2013Thu 8:00am\u20135:00pm",
    "eligibility": "Veterans and dependents in Siskiyou County",
    "isFree": true,
    "source": "CACVSO \u2014 Find Your VSO; Siskiyou County Veterans' Services",
    "sourceUrl": "https://www.cacvso.org/county-contacts/",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Willows Senior Center",
    "category": "senior-centers",
    "type": "Senior Center / Nutrition Site",
    "address": "556 E. Sycamore Street",
    "city": "Willows",
    "state": "CA",
    "counties": [
      "glenn"
    ],
    "phone": "530-865-1136",
    "website": "https://www.passagescenter.org/information-assistance/senior-nutrition/",
    "services": [
      "Congregate senior lunches",
      "Social & community activities",
      "Senior nutrition program"
    ],
    "hours": "Meals served Mon\u2013Fri 12:00pm\u201312:30pm",
    "eligibility": "Seniors 60+",
    "isFree": false,
    "source": "Passages \u2014 Senior Nutrition (Glenn County Nutrition Services)",
    "sourceUrl": "https://www.passagescenter.org/information-assistance/senior-nutrition/",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Madrone Senior Services (Yreka Community Center)",
    "category": "senior-centers",
    "type": "Senior Center & Nutrition",
    "address": "810 N. Oregon Street",
    "city": "Yreka",
    "state": "CA",
    "counties": [
      "siskiyou"
    ],
    "phone": "530-841-2365",
    "website": "https://www.madronehospice.org/senior-services",
    "services": [
      "Congregate lunches at Yreka Community Center",
      "Home-delivered meals for seniors",
      "Senior support services"
    ],
    "hours": "Mon\u2013Fri 8:00am\u20134:30pm",
    "eligibility": "Qualifying individuals age 60+",
    "isFree": true,
    "source": "Madrone Hospice \u2014 Senior Services",
    "sourceUrl": "https://www.madronehospice.org/senior-services",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Meals on Wheels Yuba & Sutter Counties",
    "category": "meals-on-wheels",
    "type": "Meals on Wheels / Senior Nutrition",
    "city": "Marysville",
    "state": "CA",
    "counties": [
      "yuba"
    ],
    "phone": "530-670-0033",
    "website": "https://www.yubasuttermow.org/",
    "services": [
      "Home-delivered meals for homebound seniors",
      "Nutritionally balanced meals",
      "Dine Around Town congregate meals",
      "Wellness check at delivery"
    ],
    "eligibility": "Homebound, frail older adults in Yuba & Sutter Counties",
    "isFree": false,
    "source": "Agency on Aging Area 4 \u2014 Yuba-Sutter Meals on Wheels",
    "sourceUrl": "https://www.agencyonaging4.org/yuba-sutter-meals-on-wheels",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Glenn County Senior Nutrition \u2014 Orland Nutrition Site",
    "category": "meals-on-wheels",
    "type": "Senior Nutrition Site",
    "address": "19 Walker Street",
    "city": "Orland",
    "state": "CA",
    "counties": [
      "glenn"
    ],
    "phone": "530-865-1136",
    "website": "https://www.passagescenter.org/information-assistance/senior-nutrition/",
    "services": [
      "Congregate senior meals",
      "Home-delivered meals",
      "Senior nutrition program"
    ],
    "hours": "Meals served Mon\u2013Fri 12:00pm\u201312:30pm",
    "eligibility": "Seniors 60+",
    "isFree": false,
    "source": "Passages \u2014 Senior Nutrition (Glenn County Nutrition Services)",
    "sourceUrl": "https://www.passagescenter.org/information-assistance/senior-nutrition/",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Great Northern Services \u2014 Siskiyou Senior Nutrition / Mt. Shasta Community Caf\u00e9",
    "category": "meals-on-wheels",
    "type": "Senior Nutrition / Community Caf\u00e9",
    "address": "City Park Upper Lodge, 1315 Nixon Road",
    "city": "Mount Shasta",
    "state": "CA",
    "counties": [
      "siskiyou"
    ],
    "phone": "530-926-4611",
    "website": "https://www.gnservices.org/programs-and-services/community-services/siskiyou-senior-nutrition-community-cafes/",
    "services": [
      "Congregate senior meals",
      "Community caf\u00e9 dining",
      "Nutritionally balanced meals with dietary options"
    ],
    "hours": "Community Caf\u00e9 Mon\u2013Thu 11:45am\u201312:15pm (doors 11am\u20131pm)",
    "eligibility": "Seniors (suggested donation $4/meal)",
    "isFree": false,
    "source": "Great Northern Services \u2014 Siskiyou Senior Nutrition & Community Caf\u00e9",
    "sourceUrl": "https://www.gnservices.org/programs-and-services/community-services/siskiyou-senior-nutrition-community-cafes/",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Yuba-Sutter Transit Dial-A-Ride / ADA Paratransit",
    "category": "transportation",
    "type": "Dial-A-Ride / Paratransit",
    "address": "2100 B Street",
    "city": "Marysville",
    "state": "CA",
    "counties": [
      "yuba"
    ],
    "phone": "530-742-2877",
    "website": "https://www.yubasuttertransit.com/dial-a-ride-paratransit",
    "services": [
      "Curb-to-curb Dial-A-Ride",
      "ADA paratransit",
      "Wheelchair-accessible vehicles",
      "Advance & standing reservations"
    ],
    "hours": "Call center Mon\u2013Fri 5:00am\u20138:00pm, Sat 8:00am\u20136:00pm",
    "eligibility": "General public; ADA paratransit for eligible riders",
    "isFree": false,
    "source": "Yuba-Sutter Transit \u2014 Dial-A-Ride",
    "sourceUrl": "https://www.yubasuttertransit.com/dial-a-ride-8e4b3d1",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Glenn Transit Service Dial-A-Ride",
    "category": "transportation",
    "type": "Dial-A-Ride",
    "city": "Willows",
    "state": "CA",
    "counties": [
      "glenn"
    ],
    "phone": "530-934-6700",
    "website": "https://www.glenntransitservice.com/dial-a-ride-service",
    "services": [
      "Specialized dial-a-ride transport",
      "Same-day service available",
      "Volunteer medical transportation",
      "Serves Orland & Willows areas"
    ],
    "hours": "Mon\u2013Thu 8:00am\u20135:00pm, Fri 8:00am\u20135:00pm",
    "eligibility": "Seniors 60+, persons with disabilities, and low-income residents unable to use fixed-route bus",
    "isFree": false,
    "source": "Glenn Transit Service \u2014 Dial-A-Ride Service",
    "sourceUrl": "https://www.glenntransitservice.com/dial-a-ride-service",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "STAGE \u2014 Siskiyou Transit and General Express",
    "category": "transportation",
    "type": "Public / Paratransit Transit",
    "address": "190 Greenhorn Road",
    "city": "Yreka",
    "state": "CA",
    "counties": [
      "siskiyou"
    ],
    "phone": "530-842-8220",
    "website": "https://www.siskiyoucounty.gov/stage",
    "services": [
      "Countywide bus service",
      "Dial-A-Ride / demand-response service",
      "Connections between Siskiyou communities"
    ],
    "hours": "Mon\u2013Fri 7:00am\u20135:00pm (closed 12\u20131pm); no weekend/holiday service",
    "isFree": false,
    "source": "Siskiyou County \u2014 STAGE Contact Information",
    "sourceUrl": "https://www.siskiyoucounty.gov/stage/custom-contact-page/stage-contact-information",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Madrone Hospice, Inc.",
    "category": "hospice",
    "type": "Hospice & Palliative Care",
    "address": "255 Collier Circle",
    "city": "Yreka",
    "state": "CA",
    "counties": [
      "siskiyou"
    ],
    "phone": "530-842-3160",
    "website": "https://www.madronehospice.org/",
    "services": [
      "Hospice care",
      "Palliative care",
      "Grief counseling",
      "Senior services program"
    ],
    "hours": "Office Mon\u2013Fri 8:00am\u20134:30pm",
    "isFree": false,
    "source": "Madrone Hospice \u2014 Contact Us",
    "sourceUrl": "https://www.madronehospice.org/contact",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "PSA 2 Area Agency on Aging (Planning and Service Area 2)",
    "category": "area-agencies-on-aging",
    "type": "Area Agency on Aging",
    "address": "208 West Center Street",
    "city": "Yreka",
    "state": "CA",
    "counties": [
      "lassen",
      "modoc",
      "trinity"
    ],
    "phone": "(530) 842-1687",
    "website": "https://www.psa2.org/",
    "services": [
      "Information, assistance and referral for older adults",
      "HICAP Medicare counseling",
      "Long-Term Care Ombudsman program",
      "Family caregiver support",
      "Senior meals and nutrition program coordination"
    ],
    "eligibility": "Older adults (60+) and adults with functional impairments",
    "isFree": true,
    "source": "PSA 2 Area Agency on Aging / California Department of Aging",
    "sourceUrl": "https://aging.ca.gov/Find_Services_in_My_County/My_County/?cc=las",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Passages Adult Resource Center (Area 3 Agency on Aging)",
    "category": "area-agencies-on-aging",
    "type": "Area Agency on Aging",
    "address": "25 Main Street, Suite 202",
    "city": "Chico",
    "state": "CA",
    "counties": [
      "tehama"
    ],
    "phone": "(530) 898-5923",
    "website": "https://www.passagescenter.org/",
    "services": [
      "Information and assistance for seniors and caregivers",
      "Care management",
      "HICAP Medicare counseling",
      "Caregiver resource center",
      "Long-Term Care Ombudsman"
    ],
    "hours": "Monday\u2013Friday",
    "eligibility": "Older adults (60+) and family caregivers in Butte, Colusa, Glenn, Plumas and Tehama counties",
    "isFree": true,
    "source": "Passages / California Department of Aging",
    "sourceUrl": "https://www.passagescenter.org/contact-us/",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Lassen County Adult Services (IHSS & Adult Protective Services)",
    "category": "in-home-supportive-services",
    "type": "IHSS / Adult Protective Services office",
    "address": "1400 Chestnut Street, Unit C",
    "city": "Susanville",
    "state": "CA",
    "counties": [
      "lassen"
    ],
    "phone": "(530) 251-8158",
    "services": [
      "In-Home Supportive Services (IHSS) intake and case management",
      "Adult Protective Services (APS) investigations",
      "24-hour elder/dependent adult abuse reporting",
      "Referrals to home care and community services"
    ],
    "eligibility": "Aged, blind or disabled adults; elder/dependent adults at risk of abuse or neglect",
    "isFree": true,
    "source": "California Department of Social Services \u2013 County APS Contact List",
    "sourceUrl": "https://cdss.ca.gov/Portals/9/APS/County%20APS%20Contact%20List%20-%20Winter%202024.pdf",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Modoc County Department of Social Services (IHSS & Adult Protective Services)",
    "category": "adult-protective-services",
    "type": "Adult Protective Services / Social Services",
    "address": "120 North Main Street",
    "city": "Alturas",
    "state": "CA",
    "counties": [
      "modoc"
    ],
    "phone": "(530) 233-6501",
    "services": [
      "Adult Protective Services (APS) investigations",
      "24-hour elder/dependent adult abuse hotline",
      "In-Home Supportive Services referrals",
      "Social services intake"
    ],
    "eligibility": "Elder (60+) and dependent adults who are victims of abuse, neglect or exploitation",
    "isFree": true,
    "source": "Elder Abuse Reporting \u2013 Modoc County Resources",
    "sourceUrl": "https://elder-abuseca.com/stateResources/California/Modoc-County.html",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Trinity County Dept. of Health & Human Services \u2013 Adult Protective Services / IHSS",
    "category": "adult-protective-services",
    "type": "Adult Protective Services / IHSS",
    "address": "P.O. Box 1470",
    "city": "Weaverville",
    "state": "CA",
    "counties": [
      "trinity"
    ],
    "phone": "(530) 623-1314",
    "services": [
      "Adult Protective Services investigations and case management",
      "24-hour elder/dependent adult abuse hotline (also 800-851-5658)",
      "In-Home Supportive Services (IHSS)",
      "Referrals for medical, legal, housing and supportive services"
    ],
    "eligibility": "Elder (60+) and dependent adults unable to protect their own interests; aged/blind/disabled for IHSS",
    "isFree": true,
    "source": "Elder Abuse Reporting \u2013 Trinity County Resources",
    "sourceUrl": "https://elder-abuseca.com/stateResources/California/Trinity-County.html",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Tehama County IHSS Public Authority",
    "category": "in-home-supportive-services",
    "type": "IHSS Public Authority",
    "address": "310 S. Main Street",
    "city": "Red Bluff",
    "state": "CA",
    "counties": [
      "tehama"
    ],
    "phone": "(530) 527-2466",
    "website": "https://tehamacountyihsspa.com/",
    "services": [
      "IHSS provider registry and referrals",
      "Provider enrollment and payroll support",
      "Caregiver training",
      "Consumer support for in-home care"
    ],
    "eligibility": "IHSS recipients and providers in Tehama County",
    "isFree": true,
    "source": "Tehama County IHSS Public Authority",
    "sourceUrl": "https://tehamacountyihsspa.com/contact-us",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Tehama County Dept. of Social Services \u2013 Adult Protective Services",
    "category": "adult-protective-services",
    "type": "Adult Protective Services",
    "city": "Red Bluff",
    "state": "CA",
    "counties": [
      "tehama"
    ],
    "phone": "(800) 323-7711",
    "website": "https://www.tcdss.org/",
    "services": [
      "24-hour emergency response for elder/dependent adult abuse",
      "APS investigations and case management",
      "Referrals to IHSS, legal and supportive services",
      "Coordination with law enforcement and paramedics"
    ],
    "eligibility": "Elder adults (60+) and dependent adults (18-59 with disabilities) who are victims of abuse or neglect",
    "isFree": true,
    "source": "iCarol / Tehama County DSS Adult Protective Services",
    "sourceUrl": "https://www.icarol.info/ResultDetails.aspx?agencynum=12802099&org=2273",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Lassen County Veterans Service Office",
    "category": "veterans-resources",
    "type": "County Veterans Service Office (CVSO)",
    "address": "1205 Main Street #101",
    "city": "Susanville",
    "state": "CA",
    "counties": [
      "lassen"
    ],
    "phone": "(530) 251-8192",
    "website": "https://co.lassen.ca.us/vso",
    "services": [
      "Assistance filing VA disability and pension claims",
      "VA Aid & Attendance benefit help",
      "Survivor and dependent benefits",
      "Referrals to veteran healthcare and services"
    ],
    "hours": "Monday\u2013Friday, 8:00 am \u2013 5:00 pm",
    "eligibility": "Veterans and their dependents/survivors",
    "isFree": true,
    "source": "California Association of County Veterans Service Officers (CACVSO)",
    "sourceUrl": "https://www.cacvso.org/county-contacts/?dir=1&name_directory_startswith=L",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Modoc County Veterans Service Office",
    "category": "veterans-resources",
    "type": "County Veterans Service Office (CVSO)",
    "address": "202 West 4th Street, Suite F",
    "city": "Alturas",
    "state": "CA",
    "counties": [
      "modoc"
    ],
    "phone": "(530) 233-6209",
    "website": "https://www.co.modoc.ca.us/departments/veterans_services.php",
    "services": [
      "VA disability and pension claim assistance",
      "VA Aid & Attendance benefit help",
      "Survivor and dependent benefits",
      "Referrals to veteran services"
    ],
    "eligibility": "Veterans and their dependents/survivors",
    "isFree": true,
    "source": "California Association of County Veterans Service Officers (CACVSO)",
    "sourceUrl": "https://www.cacvso.org/county-contacts/?dir=1&name_directory_startswith=M",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Trinity County Veterans Service Office",
    "category": "veterans-resources",
    "type": "County Veterans Service Office (CVSO)",
    "address": "61B Airport Road",
    "city": "Weaverville",
    "state": "CA",
    "counties": [
      "trinity"
    ],
    "phone": "(530) 623-3975",
    "website": "https://www.trinitycounty.org/440/Veteran-Services",
    "services": [
      "VA disability and pension claim assistance",
      "VA Aid & Attendance benefit help",
      "Survivor and dependent benefits",
      "Referrals to veteran services"
    ],
    "hours": "Monday\u2013Friday, by appointment only",
    "eligibility": "Veterans and their dependents/survivors",
    "isFree": true,
    "source": "California Association of County Veterans Service Officers (CACVSO)",
    "sourceUrl": "https://www.cacvso.org/county-contacts/?dir=1&name_directory_startswith=T",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Tehama County Veterans Service Office",
    "category": "veterans-resources",
    "type": "County Veterans Service Office (CVSO)",
    "address": "444 Oak Street, Room C",
    "city": "Red Bluff",
    "state": "CA",
    "counties": [
      "tehama"
    ],
    "phone": "(530) 529-3664",
    "website": "https://www.tehama.gov/government/departments/veterans-services/",
    "services": [
      "VA disability and pension claim assistance",
      "VA Aid & Attendance benefit help",
      "Survivor and dependent benefits",
      "Referrals to veteran services"
    ],
    "hours": "Monday\u2013Thursday, 8:00 am \u2013 4:00 pm",
    "eligibility": "Veterans and their dependents/survivors",
    "isFree": true,
    "source": "California Association of County Veterans Service Officers (CACVSO)",
    "sourceUrl": "https://www.cacvso.org/county-contacts/?dir=1&name_directory_startswith=T",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Lassen Senior Services",
    "category": "senior-centers",
    "type": "Senior center & nutrition program",
    "address": "1700 Sunkist Drive",
    "city": "Susanville",
    "state": "CA",
    "counties": [
      "lassen"
    ],
    "phone": "(530) 257-2113",
    "services": [
      "Congregate meals at 3 sites",
      "Meals on Wheels for homebound seniors",
      "Transportation to nutrition sites and medical appointments",
      "Senior computer and Tai Chi classes"
    ],
    "eligibility": "60 years of age or older",
    "isFree": false,
    "source": "Lassen Links / Lassen Senior Services",
    "sourceUrl": "https://www.lassenlinks.org/senior-resources/lassen-senior-services",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Modoc Senior Citizens Association (Modoc County Senior Center)",
    "category": "senior-centers",
    "type": "Senior center & congregate meals",
    "address": "906 West 4th Street",
    "city": "Alturas",
    "state": "CA",
    "counties": [
      "modoc"
    ],
    "phone": "(530) 233-4438",
    "services": [
      "Congregate senior lunch meals",
      "Senior social activities",
      "Community gathering space for older adults"
    ],
    "eligibility": "Seniors (60+)",
    "isFree": false,
    "source": "Elder Abuse Reporting \u2013 Modoc County Resources",
    "sourceUrl": "https://elder-abuseca.com/stateResources/California/Modoc-County.html",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Red Bluff Community/Senior Center \u2013 Senior Nutrition Program",
    "category": "senior-centers",
    "type": "Senior center & nutrition program",
    "address": "1500 South Jackson Street",
    "city": "Red Bluff",
    "state": "CA",
    "counties": [
      "tehama"
    ],
    "phone": "(530) 527-2414",
    "website": "https://www.cityofredbluff.org/parks/community_center/seniors/senior_nutrition_program.php",
    "services": [
      "Congregate lunch meals for seniors",
      "Social and recreational activities",
      "Meal reservations one day in advance"
    ],
    "hours": "Meals served daily at 12:00 pm, Monday\u2013Friday",
    "eligibility": "Seniors (60+)",
    "isFree": false,
    "source": "City of Red Bluff Parks & Recreation \u2013 Senior Nutrition Program",
    "sourceUrl": "https://www.cityofredbluff.org/parks/community_center/seniors/senior_nutrition_program.php",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Trinity County Food Bank \u2013 Senior Nutrition Program",
    "category": "food-assistance",
    "type": "Food bank & senior nutrition",
    "address": "51B Memorial Drive",
    "city": "Weaverville",
    "state": "CA",
    "counties": [
      "trinity"
    ],
    "phone": "(530) 739-0983",
    "website": "https://trinitycountyfoodbank.org/",
    "services": [
      "Food distribution and pantry services",
      "Senior nutrition and senior lunch programs",
      "Home food delivery",
      "Nutrition education for seniors"
    ],
    "eligibility": "Low-income residents; senior programs for older adults",
    "isFree": true,
    "source": "Trinity County Food Bank",
    "sourceUrl": "https://trinitycountyfoodbank.org/senior-programs",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Corning Senior Center \u2013 Senior Nutrition Program",
    "category": "meals-on-wheels",
    "type": "Senior nutrition site",
    "address": "1015 4th Avenue",
    "city": "Corning",
    "state": "CA",
    "counties": [
      "tehama"
    ],
    "phone": "(530) 824-4727",
    "website": "https://www.cityofredbluff.org/parks/community_center/seniors/senior_nutrition_program.php",
    "services": [
      "Congregate senior lunch meals",
      "Part of Tehama County Senior Nutrition Program",
      "Meal reservations one day in advance"
    ],
    "hours": "Meals served daily at 12:00 pm, Monday\u2013Friday",
    "eligibility": "Seniors (60+)",
    "isFree": false,
    "source": "City of Red Bluff Parks & Recreation \u2013 Senior Nutrition Program",
    "sourceUrl": "https://www.cityofredbluff.org/parks/community_center/seniors/senior_nutrition_program.php",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Lassen Transit Service Agency \u2013 Dial-A-Ride",
    "category": "transportation",
    "type": "Dial-A-Ride / paratransit",
    "city": "Susanville",
    "state": "CA",
    "counties": [
      "lassen"
    ],
    "phone": "(530) 252-7433",
    "website": "https://lassentransportation.com/dial-ride",
    "services": [
      "Curb-to-curb Dial-A-Ride service",
      "Local public transportation in the Susanville area",
      "Service for seniors and persons with disabilities"
    ],
    "isFree": false,
    "source": "Lassen Transit Service Agency (LTSA)",
    "sourceUrl": "https://lassentransportation.com/dial-ride",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Sage Stage (Modoc Transportation Agency)",
    "category": "transportation",
    "type": "Public / rural transit",
    "city": "Alturas",
    "state": "CA",
    "counties": [
      "modoc"
    ],
    "phone": "(530) 233-6410",
    "website": "https://sagestage.com/",
    "services": [
      "Local bus service in Alturas within a 10-mile radius",
      "Intercity transit to Redding, Reno and Klamath Falls",
      "Rural public transportation for seniors and residents"
    ],
    "isFree": false,
    "source": "Sage Stage / Modoc Transportation Agency",
    "sourceUrl": "https://sagestage.com/how-to-ride/",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Trinity Transit Dial-A-Ride",
    "category": "transportation",
    "type": "Dial-A-Ride / paratransit",
    "city": "Weaverville",
    "state": "CA",
    "counties": [
      "trinity"
    ],
    "phone": "(530) 623-5438",
    "website": "https://www.trinitycounty.org/612/Trinity-Transit",
    "services": [
      "Dial-A-Ride service (24-hour advance request)",
      "Fixed-route service between Weaverville, Hayfork, Lewiston and Redding",
      "Rural public transportation operated by Trinity County Dept. of Transportation"
    ],
    "isFree": false,
    "source": "Trinity County / Trinity Transit Rider Guide",
    "sourceUrl": "https://www.trinitycounty.org/DocumentCenter/View/2915/Trinity-Transit-Schedule",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Tehama Rural Area eXpress (TRAX) \u2013 ParaTRAX Dial-A-Ride",
    "category": "transportation",
    "type": "Dial-A-Ride / ADA paratransit",
    "address": "1509 Schwab Street",
    "city": "Red Bluff",
    "state": "CA",
    "counties": [
      "tehama"
    ],
    "phone": "(530) 385-2877",
    "website": "https://taketrax.com/",
    "services": [
      "ParaTRAX Dial-A-Ride ADA paratransit",
      "Fixed-route bus service in Red Bluff and Corning",
      "Regional connections to surrounding communities"
    ],
    "eligibility": "ADA-eligible riders and general public",
    "isFree": false,
    "source": "Tehama Rural Area eXpress (TRAX)",
    "sourceUrl": "https://taketrax.com/ada-services/",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Legal Services of Northern California \u2013 Redding Office",
    "category": "estate-planning-elder-law",
    "type": "Legal aid office",
    "address": "1370 West Street",
    "city": "Redding",
    "state": "CA",
    "counties": [
      "lassen",
      "modoc",
      "tehama"
    ],
    "phone": "(530) 241-3565",
    "website": "https://lsnc.net/office/redding",
    "services": [
      "Free civil legal aid for low-income residents",
      "Housing, public benefits and consumer legal help",
      "Assistance for seniors serving Lassen, Modoc, Shasta, Siskiyou and Tehama counties"
    ],
    "hours": "Monday, Tuesday, Wednesday, and Friday, 9:00 am (see office schedule)",
    "eligibility": "Low-income residents of the served counties",
    "isFree": true,
    "source": "Legal Services of Northern California",
    "sourceUrl": "https://lsnc.net/office/redding",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Legal Services of Northern California \u2013 Eureka Office",
    "category": "estate-planning-elder-law",
    "type": "Legal aid office",
    "address": "123 Third Street",
    "city": "Eureka",
    "state": "CA",
    "counties": [
      "trinity"
    ],
    "phone": "(707) 445-0866",
    "website": "https://lsnc.net/office/eureka",
    "services": [
      "Free civil legal aid for low-income residents",
      "Housing, public benefits and consumer legal help",
      "Serving Del Norte, Humboldt and Trinity counties"
    ],
    "hours": "Monday\u2013Friday, 9:00 am (see office schedule)",
    "eligibility": "Low-income residents of Del Norte, Humboldt and Trinity counties",
    "isFree": true,
    "source": "Legal Services of Northern California",
    "sourceUrl": "https://lsnc.net/how-contact-us",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "PSA 2 HICAP (Health Insurance Counseling & Advocacy Program)",
    "category": "medicare-benefits-counseling",
    "type": "Medicare counseling (HICAP)",
    "address": "1647 Hartnell Street, Suite 8",
    "city": "Redding",
    "state": "CA",
    "counties": [
      "lassen",
      "modoc",
      "trinity"
    ],
    "phone": "(530) 223-0999",
    "website": "https://www.psa2.org/",
    "services": [
      "Free one-on-one Medicare counseling",
      "Help comparing Medicare plans and prescription coverage",
      "Assistance with Medicare appeals and billing issues"
    ],
    "eligibility": "Medicare beneficiaries and their caregivers",
    "isFree": true,
    "source": "California Department of Aging \u2013 Find Services in My County",
    "sourceUrl": "https://aging.ca.gov/Find_Services_in_My_County/My_County/?cc=las",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Area 2 Agency on Aging Long-Term Care Ombudsman Program",
    "category": "support-groups",
    "type": "Long-Term Care Ombudsman",
    "address": "1647 Hartnell Avenue, Suite 6",
    "city": "Redding",
    "state": "CA",
    "counties": [
      "lassen",
      "modoc",
      "trinity"
    ],
    "phone": "(530) 229-1435",
    "website": "https://psa2ombudsman.com/",
    "services": [
      "Advocacy for residents of nursing homes and assisted living",
      "Investigates complaints of abuse or neglect in long-term care",
      "Elder abuse reporting support"
    ],
    "eligibility": "Residents of long-term care facilities and their families",
    "isFree": true,
    "source": "California Department of Aging \u2013 Find Services in My County",
    "sourceUrl": "https://aging.ca.gov/Find_Services_in_My_County/My_County/?cc=mod",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Westwood Senior Nutrition Program",
    "category": "meals-on-wheels",
    "type": "Senior nutrition site",
    "address": "2nd & Birch Street",
    "city": "Westwood",
    "state": "CA",
    "counties": [
      "lassen"
    ],
    "phone": "(530) 256-3009",
    "services": [
      "Congregate senior meals in Westwood",
      "Nutrition support for older adults in eastern Lassen County"
    ],
    "eligibility": "Seniors (60+)",
    "isFree": false,
    "source": "Elder Abuse Reporting \u2013 Lassen County Resources",
    "sourceUrl": "https://elder-abuseca.com/stateResources/California/Lassen-County.html",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Butte County Employment & Social Services \u2014 In-Home Supportive Services (IHSS)",
    "category": "in-home-supportive-services",
    "type": "IHSS Office",
    "address": "78 Table Mountain Boulevard",
    "city": "Oroville",
    "state": "CA",
    "counties": [
      "butte"
    ],
    "phone": "530-538-7538",
    "website": "https://www.buttecounty.net/414/Adult-Services",
    "services": [
      "In-Home Supportive Services (IHSS) eligibility & case management",
      "Personal care & domestic assistance",
      "IHSS Public Authority provider registry",
      "Toll-free: 855-398-8899"
    ],
    "hours": "Mon\u2013Fri 8 a.m. \u2013 5 p.m.",
    "isFree": true,
    "source": "Butte County \u2014 Adult Services / IHSS Staff Directory",
    "sourceUrl": "https://www.buttecounty.ca.gov/directory.aspx?did=47",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Butte County Adult Protective Services (APS)",
    "category": "adult-protective-services",
    "type": "Adult Protective Services",
    "address": "78 Table Mountain Boulevard",
    "city": "Oroville",
    "state": "CA",
    "counties": [
      "butte"
    ],
    "phone": "800-664-9774",
    "website": "https://www.buttecounty.net/421/Adult-Protective-Services-APS",
    "services": [
      "Investigation of elder & dependent adult abuse/neglect",
      "24/7 abuse & neglect report line: 800-664-9774",
      "Self-neglect intervention",
      "Referrals & protective services"
    ],
    "hours": "Mon\u2013Fri 8 a.m. \u2013 5 p.m. (abuse reports taken 24/7)",
    "isFree": true,
    "source": "Butte County \u2014 Adult Services Staff Directory (Reports of Adult Abuse/Neglect)",
    "sourceUrl": "https://www.buttecounty.ca.gov/directory.aspx?DID=44",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Butte County Veterans Service Office",
    "category": "veterans-resources",
    "type": "County Veterans Service Office",
    "address": "765 East Avenue, Suite 200",
    "city": "Chico",
    "state": "CA",
    "counties": [
      "butte"
    ],
    "phone": "530-552-6608",
    "website": "https://www.buttecounty.net/455/Veterans-Services",
    "services": [
      "VA disability compensation & pension claims",
      "Veterans benefits counseling",
      "Aid & Attendance assistance",
      "Survivor & burial benefits"
    ],
    "eligibility": "Veterans and dependents in Butte County",
    "isFree": true,
    "source": "Butte County \u2014 Veterans Service Office Staff Directory",
    "sourceUrl": "https://www.buttecounty.ca.gov/directory.aspx?did=42",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "Feather River Senior Citizens Center",
    "category": "senior-centers",
    "type": "Senior Center",
    "address": "1335 Myers Street",
    "city": "Oroville",
    "state": "CA",
    "counties": [
      "butte"
    ],
    "phone": "530-533-8370",
    "website": "https://aging.networkofcare.org/butte/services/agency?pid=FeatherRiverSeniorCitizensCenterFeatherRiverSeniorCitizensCenter_10_1_0",
    "services": [
      "Multipurpose senior activity center",
      "Social & recreational activities",
      "Senior services & referrals",
      "Adult resource center focal point"
    ],
    "eligibility": "Older adults in the community",
    "isFree": false,
    "source": "Network of Care Butte County (Passages Adult Resource Center) \u2014 Feather River Senior Citizens Center",
    "sourceUrl": "https://aging.networkofcare.org/butte/services/agency?pid=FeatherRiverSeniorCitizensCenterFeatherRiverSeniorCitizensCenter_10_1_0",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "North State Food Bank \u2014 Community Action Agency of Butte County (Fresh Choice Pantry)",
    "category": "food-assistance",
    "type": "Food Bank / Food Pantry",
    "address": "2640 South 5th Avenue",
    "city": "Oroville",
    "state": "CA",
    "counties": [
      "butte"
    ],
    "phone": "530-712-2600",
    "website": "https://www.buttecaa.com/north-state-food-bank/",
    "services": [
      "Fresh Choice client-choice food pantry",
      "Monthly food distributions",
      "Emergency food assistance",
      "Serves Butte, Colusa, Glenn, Plumas & Sierra Counties"
    ],
    "eligibility": "Income-eligible residents; pantry limited to Butte County residents",
    "isFree": true,
    "source": "Community Action Agency of Butte County \u2014 North State Food Bank / Fresh Choice Pantry",
    "sourceUrl": "https://www.buttecaa.com/north-state-food-bank/pantry/",
    "verified": true,
    "scope": "curated"
  },
  {
    "name": "B-Line PLUS Paratransit / Dial-A-Ride (Butte Regional Transit)",
    "category": "transportation",
    "type": "Paratransit / Dial-A-Ride",
    "city": "Chico",
    "state": "CA",
    "counties": [
      "butte"
    ],
    "phone": "530-342-0221",
    "website": "https://www.blinetransit.com/paratransit",
    "services": [
      "ADA paratransit for riders with disabilities",
      "Dial-A-Ride for residents age 70+",
      "Shared-ride door-to-door service",
      "Reservations by phone or Passenger Portal"
    ],
    "eligibility": "Riders with a qualifying disability (ADA) or residents age 70+ (Dial-A-Ride)",
    "isFree": false,
    "source": "Butte Regional Transit (B-Line) \u2014 Paratransit / B-Line PLUS",
    "sourceUrl": "https://www.blinetransit.com/paratransit",
    "verified": true,
    "scope": "curated"
  }
];
