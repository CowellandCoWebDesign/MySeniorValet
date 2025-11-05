import { Express } from "express";

export function setupSeniorResourcesRoutes(app: Express) {
  // Get food banks and food access resources
  app.get("/api/senior-resources/food-banks", async (req, res) => {
    try {
      const { county, state } = req.query;
      
      // This is real data from government and nonprofit sources
      const foodBanks: Record<string, Record<string, any[]>> = {
        california: {
          "Los Angeles": [
            {
              id: 1,
              name: "Los Angeles Regional Food Bank",
              type: "Regional Food Bank",
              address: "1734 E 41st St",
              city: "Los Angeles",
              state: "CA",
              zipCode: "90058",
              phone: "323-234-3030",
              website: "https://www.lafoodbank.org",
              services: ["Emergency Food", "Senior Nutrition Programs", "Mobile Food Pantry", "CalFresh Enrollment"],
              seniorPrograms: {
                commodityProgram: true,
                homeDelivery: true,
                mobilePantry: true,
                brownBagProgram: true
              },
              hours: "Mon-Fri 8:00 AM - 5:00 PM",
              eligibility: "Seniors 60+ with limited income",
              languages: ["English", "Spanish", "Chinese", "Korean"],
              latitude: 34.0114,
              longitude: -118.2139
            },
            {
              id: 2,
              name: "St. Francis Center - Pantry for Seniors",
              type: "Senior Food Program",
              address: "1835 S Hope St",
              city: "Los Angeles", 
              state: "CA",
              zipCode: "90015",
              phone: "213-747-5347",
              website: "https://www.stfranciscenterla.org",
              services: ["Senior Brown Bag Program", "Hot Meals", "Food Pantry"],
              seniorPrograms: {
                commodityProgram: true,
                homeDelivery: false,
                mobilePantry: false,
                brownBagProgram: true
              },
              hours: "Tue & Thu 9:00 AM - 12:00 PM",
              eligibility: "Seniors 60+",
              languages: ["English", "Spanish"],
              latitude: 34.0356,
              longitude: -118.2673
            }
          ],
          "Sacramento": [
            {
              id: 3,
              name: "Sacramento Food Bank & Family Services",
              type: "Regional Food Bank",
              address: "3333 3rd Ave",
              city: "Sacramento",
              state: "CA",
              zipCode: "95817",
              phone: "916-456-1980",
              website: "https://www.sacramentofoodbank.org",
              services: ["Senior Food Box Program", "Mobile Farmers Market", "CalFresh Assistance"],
              seniorPrograms: {
                commodityProgram: true,
                homeDelivery: true,
                mobilePantry: true,
                brownBagProgram: true
              },
              hours: "Mon-Fri 8:00 AM - 4:30 PM",
              eligibility: "Seniors 60+ at or below 130% poverty level",
              languages: ["English", "Spanish", "Hmong", "Russian"],
              latitude: 38.5469,
              longitude: -121.4686
            }
          ],
          "San Diego": [
            {
              id: 4,
              name: "San Diego Food Bank",
              type: "Regional Food Bank",
              address: "9850 Distribution Ave",
              city: "San Diego",
              state: "CA",
              zipCode: "92121",
              phone: "858-527-1419",
              website: "https://sandiegofoodbank.org",
              services: ["Senior Food Program", "Mobile Pantry", "Nutrition Education"],
              seniorPrograms: {
                commodityProgram: true,
                homeDelivery: true,
                mobilePantry: true,
                brownBagProgram: true
              },
              hours: "Mon-Fri 8:00 AM - 5:00 PM",
              eligibility: "Seniors 60+ with limited income",
              languages: ["English", "Spanish", "Vietnamese", "Tagalog"],
              latitude: 32.8853,
              longitude: -117.1753
            }
          ],
          "Shasta": [
            {
              id: 20,
              name: "Shasta Senior Nutrition Program / Dignity Health Connected Living Food Bank",
              type: "Senior Food Bank & Nutrition Program",
              address: "100 Mercy Oaks Drive",
              city: "Redding",
              state: "CA",
              zipCode: "96001",
              phone: "530-226-3071",
              email: "connectedliving@dignityhealth.org",
              website: "https://www.ssnpweb.org",
              services: ["Senior Box Program (60+)", "TEFAP Emergency Food", "Meals on Wheels", "Senior Dining Centers", "Monthly Commodity Distributions"],
              seniorPrograms: {
                commodityProgram: true,
                homeDelivery: true,
                mobilePantry: true,
                brownBagProgram: true
              },
              hours: "1st & 3rd Friday 8:00-9:00 AM (emergency food); 4th Saturday 8:00-10:00 AM (monthly); Call for senior dining center hours",
              eligibility: "Seniors 60+ with income guidelines for box program; All ages for emergency food",
              languages: ["English", "Spanish"],
              latitude: 40.5865,
              longitude: -122.3917
            },
            {
              id: 21,
              name: "Anderson-Cottonwood Christian Assistance (ACCA)",
              type: "Community Food Pantry",
              address: "2979 East Center Street",
              city: "Anderson",
              state: "CA",
              zipCode: "96007",
              phone: "530-365-4220",
              email: "accafoodshelf@gmail.com",
              website: null,
              services: ["Food Pantry", "Emergency Food Assistance"],
              seniorPrograms: {
                commodityProgram: false,
                homeDelivery: false,
                mobilePantry: false,
                brownBagProgram: false
              },
              hours: "Tuesday & Friday 10:00 AM - 1:45 PM",
              eligibility: "Anderson, Cottonwood, Happy Valley, Shingletown residents - ID & proof of address required",
              languages: ["English"],
              latitude: 40.4482,
              longitude: -122.2978
            },
            {
              id: 22,
              name: "Good News Rescue Mission",
              type: "Mission & Meal Program",
              address: "3075 Veda Street",
              city: "Redding",
              state: "CA",
              zipCode: "96001",
              phone: "530-241-5754",
              website: null,
              services: ["Free Meals (Daily Breakfast, Lunch, Dinner)", "Shelter", "Clothing", "Recovery Programs"],
              seniorPrograms: {
                commodityProgram: false,
                homeDelivery: false,
                mobilePantry: false,
                brownBagProgram: false
              },
              hours: "Breakfast 6:30 AM daily; Lunch 12:00 PM Mon-Sat (1:00 PM Sunday); Dinner 5:45 PM daily",
              eligibility: "Open to all",
              languages: ["English"],
              latitude: 40.5643,
              longitude: -122.3844
            },
            {
              id: 23,
              name: "The Salvation Army - Compassion Food Ministry",
              type: "Food Ministry",
              address: "2691 Larkspur Lane",
              city: "Redding",
              state: "CA",
              zipCode: "96002",
              phone: "530-222-2207",
              website: null,
              services: ["Monthly Food for Seniors & Families", "Weekly Perishables"],
              seniorPrograms: {
                commodityProgram: true,
                homeDelivery: false,
                mobilePantry: false,
                brownBagProgram: false
              },
              hours: "Monday, Wednesday, Thursday 9:00-11:30 AM (Closed Tuesday & Friday)",
              eligibility: "Seniors & families with children - Photo ID & proof of residency required",
              languages: ["English"],
              latitude: 40.5538,
              longitude: -122.3531
            },
            {
              id: 24,
              name: "Shingletown Emergency Food & Outreach Center",
              type: "Emergency Food Program",
              address: "Call for location",
              city: "Shingletown",
              state: "CA",
              zipCode: "96088",
              phone: "530-474-3390 ext. 343",
              email: "info@shingletownmedcenter.org",
              website: null,
              services: ["Emergency Food", "Senior Delivery Available"],
              seniorPrograms: {
                commodityProgram: false,
                homeDelivery: true,
                mobilePantry: false,
                brownBagProgram: false
              },
              hours: "Wednesday by appointment (urgent needs accommodated)",
              eligibility: "Shingletown, Manton, Viola residents",
              languages: ["English"],
              latitude: 40.4917,
              longitude: -121.8889
            }
          ],
          "Fresno": [
            {
              id: 40,
              name: "Central California Food Bank",
              type: "Regional Food Bank",
              address: "Call for warehouse locations",
              city: "Fresno",
              state: "CA",
              zipCode: "93701",
              phone: "211 (24/7 multilingual support)",
              website: "https://ccfoodbank.org",
              services: ["Groceries2Go", "Neighborhood Market", "Mobile Pantry", "BackPack Program", "School Pantries", "CalFresh Outreach"],
              seniorPrograms: {
                commodityProgram: true,
                homeDelivery: false,
                mobilePantry: true,
                brownBagProgram: false
              },
              hours: "Call 211 for distribution sites and times",
              eligibility: "Open to all in need; serves Fresno, Madera, Tulare, Kings, and Kern Counties",
              languages: ["English", "Spanish", "Hmong"],
              latitude: 36.7378,
              longitude: -119.7871
            },
            {
              id: 41,
              name: "Fresno-Madera Area Agency on Aging",
              type: "Senior Nutrition Program",
              address: "Multiple locations",
              city: "Fresno",
              state: "CA",
              zipCode: "93701",
              phone: "559-214-0299 or 800-510-2020",
              website: null,
              services: ["Home-Delivered Meals (Meals on Wheels)", "Congregate Meal Sites", "Senior Nutrition Education"],
              seniorPrograms: {
                commodityProgram: false,
                homeDelivery: true,
                mobilePantry: false,
                brownBagProgram: false
              },
              hours: "Mon-Fri 8:00 AM - 5:00 PM (office); Congregate meals Mon-Fri 11:00 AM - 12:00 PM",
              eligibility: "Age 60+, homebound for Meals on Wheels; suggested donation $50/month",
              languages: ["English", "Spanish", "Hmong"],
              latitude: 36.7378,
              longitude: -119.7871
            },
            {
              id: 42,
              name: "City Center Fresno - First Free Grocery Store",
              type: "Free Grocery Store",
              address: "2025 E Dakota Ave",
              city: "Fresno",
              state: "CA",
              zipCode: "93726",
              phone: "See website",
              website: null,
              services: ["Free Groceries", "Seasonal Produce", "Pantry Staples"],
              seniorPrograms: {
                commodityProgram: false,
                homeDelivery: false,
                mobilePantry: false,
                brownBagProgram: false
              },
              hours: "Wed, Fri, Sat 10:30 AM - 2:30 PM",
              eligibility: "First-come, first-served; open to all",
              languages: ["English", "Spanish"],
              latitude: 36.7298,
              longitude: -119.7544
            }
          ],
          "Ventura": [
            {
              id: 43,
              name: "Food Share of Ventura County",
              type: "Regional Food Bank",
              address: "2240 E. Gonzales Road",
              city: "Oxnard",
              state: "CA",
              zipCode: "93036",
              phone: "805-983-7100",
              email: "seniorkits@foodshare.com",
              website: "https://foodshare.com",
              services: ["Senior Food Box Program", "Commodity Supplemental Food Program (CSFP)", "40 Distribution Sites"],
              seniorPrograms: {
                commodityProgram: true,
                homeDelivery: false,
                mobilePantry: true,
                brownBagProgram: true
              },
              hours: "Call for distribution schedule",
              eligibility: "Low-income seniors 60+",
              languages: ["English", "Spanish"],
              latitude: 34.1975,
              longitude: -119.1771
            },
            {
              id: 44,
              name: "Ventura County Area Agency on Aging",
              type: "Senior Nutrition Program",
              address: "4651 Telephone Rd",
              city: "Ventura",
              state: "CA",
              zipCode: "93003",
              phone: "805-477-7300",
              email: "LOIS.VCAAA@venturacounty.gov",
              website: "https://vcaaa.venturacounty.gov",
              services: ["Congregate Meals at Dining Sites", "Home-Delivered Meals", "Nutrition Education"],
              seniorPrograms: {
                commodityProgram: false,
                homeDelivery: true,
                mobilePantry: false,
                brownBagProgram: false
              },
              hours: "Mon-Fri 8:00 AM - 5:00 PM (office)",
              eligibility: "Seniors 60+, not income-based",
              languages: ["English", "Spanish"],
              latitude: 34.2632,
              longitude: -119.2293
            }
          ],
          "Kern": [
            {
              id: 45,
              name: "Community Action Partnership of Kern (CAPK) Food Bank",
              type: "Regional Food Bank",
              address: "1807 Feliz Drive",
              city: "Bakersfield",
              state: "CA",
              zipCode: "93307",
              phone: "661-336-5200 or 800-273-2275",
              website: "https://www.capk.org",
              services: ["Commodity Supplemental Food Program (30-lb box)", "Food2Door for seniors 65+", "Senior Farmers Market Nutrition", "150+ Partner Agencies"],
              seniorPrograms: {
                commodityProgram: true,
                homeDelivery: true,
                mobilePantry: true,
                brownBagProgram: true
              },
              hours: "Mon-Sat 8:00 AM - varies",
              eligibility: "Low-income seniors 60+ for CSFP",
              languages: ["English", "Spanish"],
              latitude: 35.3951,
              longitude: -119.0434
            },
            {
              id: 46,
              name: "Kern County Aging & Adult Services",
              type: "Senior Nutrition Program",
              address: "5357 Truxtun Ave",
              city: "Bakersfield",
              state: "CA",
              zipCode: "93309",
              phone: "661-868-1000 or 800-510-2020",
              email: "nutritioninfo@kerncounty.com",
              website: null,
              services: ["Supplemental Food Assistance (2 bags twice/month)", "Meals on Wheels", "Senior Nutrition Sites"],
              seniorPrograms: {
                commodityProgram: true,
                homeDelivery: true,
                mobilePantry: false,
                brownBagProgram: false
              },
              hours: "Call for hours",
              eligibility: "Seniors 60+, $2 one-time registration for food assistance",
              languages: ["English", "Spanish"],
              latitude: 35.3733,
              longitude: -119.0187
            },
            {
              id: 47,
              name: "Richard Prado East Bakersfield Senior Center",
              type: "Senior Dining Site",
              address: "2101 Ridge Road",
              city: "Bakersfield",
              state: "CA",
              zipCode: "93305",
              phone: "661-342-8225",
              website: null,
              services: ["Congregate Meals", "Social Activities"],
              seniorPrograms: {
                commodityProgram: false,
                homeDelivery: false,
                mobilePantry: false,
                brownBagProgram: false
              },
              hours: "Mon-Fri 8:00 AM - 2:00 PM; Lunch served 12:00 PM",
              eligibility: "Seniors 60+",
              languages: ["English", "Spanish"],
              latitude: 35.3923,
              longitude: -119.0018
            }
          ],
          "San Joaquin": [
            {
              id: 48,
              name: "Emergency Food Bank of Stockton/San Joaquin County",
              type: "Regional Food Bank",
              address: "7 West Scotts Avenue",
              city: "Stockton",
              state: "CA",
              zipCode: "95203",
              phone: "209-464-7369",
              email: "info@stocktonfoodbank.org",
              website: "https://www.stocktonfoodbank.org",
              services: ["Emergency Food Boxes", "DoorDash Home Delivery (served 44,471)", "Mobile Farmer's Market (83 sites)", "Healthy Food Rx Program"],
              seniorPrograms: {
                commodityProgram: false,
                homeDelivery: true,
                mobilePantry: true,
                brownBagProgram: false
              },
              hours: "Mon-Fri 9:00 AM - 12:00 PM (pantry); Office 8:00 AM - 3:30 PM",
              eligibility: "Open to all in need; DoorDash delivery for seniors and homebound",
              languages: ["English", "Spanish", "Tagalog"],
              latitude: 37.9577,
              longitude: -121.2908
            },
            {
              id: 49,
              name: "San Joaquin County 'Food For You' Program",
              type: "USDA Commodity Program",
              address: "Multiple community centers",
              city: "Stockton",
              state: "CA",
              zipCode: "95201",
              phone: "209-953-FOOD (3663)",
              email: "foodforyou@sjgov.org",
              website: "https://www.sjcfoodforyou.org",
              services: ["Free Monthly Food Distributions", "8 County Community Centers", "Emergency Food Boxes"],
              seniorPrograms: {
                commodityProgram: true,
                homeDelivery: false,
                mobilePantry: false,
                brownBagProgram: false
              },
              hours: "Most distributions 3rd Thursday of month",
              eligibility: "Self-certification based on income",
              languages: ["English", "Spanish", "Tagalog", "Hmong"],
              latitude: 37.9577,
              longitude: -121.2908
            }
          ],
          "Contra Costa": [
            {
              id: 50,
              name: "Food Bank of Contra Costa and Solano",
              type: "Regional Food Bank",
              address: "4010 Nelson Avenue",
              city: "Concord",
              state: "CA",
              zipCode: "94520",
              phone: "925-676-7543 or 855-309-FOOD",
              website: "https://www.foodbankccs.org",
              services: ["100+ Distribution Sites", "Emergency Food", "Produce Distributions", "CalFresh Enrollment"],
              seniorPrograms: {
                commodityProgram: true,
                homeDelivery: false,
                mobilePantry: true,
                brownBagProgram: true
              },
              hours: "Varies by distribution site",
              eligibility: "Low-income seniors 55+; FREE groceries twice/month",
              languages: ["English", "Spanish"],
              latitude: 37.9780,
              longitude: -122.0311
            },
            {
              id: 51,
              name: "Loaves & Fishes of Contra Costa",
              type: "Dining Room & Food Pantry",
              address: "835 Ferry Street",
              city: "Martinez",
              state: "CA",
              zipCode: "94553",
              phone: "925-293-4792",
              website: "https://loavesfishescc.org",
              services: ["Free Meals 7 Days/Week", "Food Pantry Mon-Fri", "5 Dining Rooms Countywide"],
              seniorPrograms: {
                commodityProgram: false,
                homeDelivery: false,
                mobilePantry: false,
                brownBagProgram: false
              },
              hours: "Meals 11:00 AM - 12:45 PM daily",
              eligibility: "Open to all",
              languages: ["English", "Spanish"],
              latitude: 38.0194,
              longitude: -122.1341
            },
            {
              id: 52,
              name: "Café Costa - Senior Congregate Meals",
              type: "Senior Dining Program",
              address: "18 locations throughout county",
              city: "Contra Costa County",
              state: "CA",
              zipCode: "94520",
              phone: "925-825-1488 or 925-313-6310",
              website: null,
              services: ["Lunch Mon-Fri", "Social Activities", "Nutrition Education"],
              seniorPrograms: {
                commodityProgram: false,
                homeDelivery: false,
                mobilePantry: false,
                brownBagProgram: false
              },
              hours: "Lunch 12:00 PM Mon-Fri; doors open 11:30 AM",
              eligibility: "Age 60+ ($3 suggested donation); Under 60 ($6 mandatory fee)",
              languages: ["English", "Spanish"],
              latitude: 37.9161,
              longitude: -122.0582
            }
          ],
          "Alameda": [
            {
              id: 53,
              name: "Alameda County Community Food Bank",
              type: "Regional Food Bank",
              address: "7900 Edgewater Drive",
              city: "Oakland",
              state: "CA",
              zipCode: "94621",
              phone: "510-635-3663 or 800-870-3663",
              email: "info@accfb.org",
              website: "https://www.accfb.org",
              services: ["400+ Partner Agencies", "Emergency Food", "Nutrition Education", "CalFresh Outreach", "300,000 meals/week"],
              seniorPrograms: {
                commodityProgram: false,
                homeDelivery: false,
                mobilePantry: true,
                brownBagProgram: false
              },
              hours: "Mon-Fri 9:00 AM - 5:00 PM (office); Mon-Fri 9:00 AM - 4:00 PM (emergency hotline)",
              eligibility: "Open to all; received $8.3M emergency funding Oct 2025",
              languages: ["English", "Spanish", "Chinese", "Vietnamese"],
              latitude: 37.7497,
              longitude: -122.1948
            },
            {
              id: 54,
              name: "St. Mary's Center - Food for All Ages",
              type: "Senior Nutrition Program",
              address: "925 Brockhurst Street",
              city: "Oakland",
              state: "CA",
              zipCode: "94608",
              phone: "510-923-9600",
              website: null,
              services: ["Meals on Wheels", "Food Assistance", "Senior Support Programs"],
              seniorPrograms: {
                commodityProgram: false,
                homeDelivery: true,
                mobilePantry: false,
                brownBagProgram: false
              },
              hours: "Call for hours",
              eligibility: "Seniors in Alameda County",
              languages: ["English", "Spanish"],
              latitude: 37.8044,
              longitude: -122.2711
            }
          ],
          "Riverside": [
            {
              id: 55,
              name: "Riverside County Office on Aging",
              type: "Senior Nutrition Program",
              address: "3610 Central Avenue, Suite 102",
              city: "Riverside",
              state: "CA",
              zipCode: "92506",
              phone: "877-932-4100 or 800-510-2020",
              website: "https://rcaging.org",
              services: ["Home-Delivered Meals", "Congregate Meals at 20+ Centers", "Emergency Food Delivery (2-week supplies)", "Grab-and-Go Packages"],
              seniorPrograms: {
                commodityProgram: true,
                homeDelivery: true,
                mobilePantry: false,
                brownBagProgram: false
              },
              hours: "Call for hours; Interactive map available on website",
              eligibility: "Seniors 60+, homebound for meal delivery",
              languages: ["English", "Spanish"],
              latitude: 33.9806,
              longitude: -117.3756
            },
            {
              id: 56,
              name: "Feeding America Riverside | San Bernardino",
              type: "Regional Food Bank",
              address: "Multiple distribution sites",
              city: "Riverside",
              state: "CA",
              zipCode: "92501",
              phone: "211",
              website: "https://feedingie.org",
              services: ["3.1+ million pounds monthly", "250+ Partner Agencies", "Pantries, Senior Centers, Schools"],
              seniorPrograms: {
                commodityProgram: true,
                homeDelivery: false,
                mobilePantry: true,
                brownBagProgram: false
              },
              hours: "Call 211 for distribution sites",
              eligibility: "Serves Riverside & San Bernardino Counties",
              languages: ["English", "Spanish"],
              latitude: 33.9806,
              longitude: -117.3756
            }
          ],
          "San Bernardino": [
            {
              id: 57,
              name: "Community Action Partnership of San Bernardino County (CAPSBC)",
              type: "Regional Food Bank",
              address: "Multiple locations",
              city: "San Bernardino",
              state: "CA",
              zipCode: "92401",
              phone: "211",
              website: "https://www.capsbc.org/food-bank",
              services: ["273+ Partner Programs", "96 Community Pantries", "25 Soup Kitchens", "14 Senior Choice Programs"],
              seniorPrograms: {
                commodityProgram: true,
                homeDelivery: false,
                mobilePantry: true,
                brownBagProgram: true
              },
              hours: "Varies by location; call 211",
              eligibility: "County residents",
              languages: ["English", "Spanish"],
              latitude: 34.1083,
              longitude: -117.2898
            },
            {
              id: 58,
              name: "San Bernardino County Department of Aging and Adult Services",
              type: "Senior Nutrition Program",
              address: "Multiple senior centers",
              city: "San Bernardino",
              state: "CA",
              zipCode: "92401",
              phone: "909-891-3900",
              website: "https://hss.sbcounty.gov/daas",
              services: ["Congregate Meals (on-site/to-go)", "Home-Delivered Meals"],
              seniorPrograms: {
                commodityProgram: false,
                homeDelivery: true,
                mobilePantry: false,
                brownBagProgram: false
              },
              hours: "High Desert: 760-256-9111; Mountain/Inland: 951-342-3057 (Mon-Fri 8:00 AM - 5:00 PM)",
              eligibility: "Age 60+, homebound due to illness/disability for home delivery; $3.75 suggested donation",
              languages: ["English", "Spanish"],
              latitude: 34.1083,
              longitude: -117.2898
            },
            {
              id: 59,
              name: "Fifth Street Senior Center",
              type: "Senior Dining Site",
              address: "600 W. Fifth St",
              city: "San Bernardino",
              state: "CA",
              zipCode: "92410",
              phone: "909-384-5434",
              website: null,
              services: ["Congregate Meals", "Social Activities"],
              seniorPrograms: {
                commodityProgram: false,
                homeDelivery: false,
                mobilePantry: false,
                brownBagProgram: false
              },
              hours: "Lunch Mon-Fri 11:30 AM - 12:30 PM; Dinner Tue-Thu 2:00-2:45 PM",
              eligibility: "Seniors 60+",
              languages: ["English", "Spanish"],
              latitude: 34.1069,
              longitude: -117.2982
            }
          ],
          "Santa Clara": [
            {
              id: 60,
              name: "Second Harvest of Silicon Valley",
              type: "Regional Food Bank",
              address: "4001 North 1st Street",
              city: "San Jose",
              state: "CA",
              zipCode: "95134",
              phone: "1-800-984-3663",
              website: "https://www.shfb.org",
              services: ["35+ Partner Distribution Sites", "Free Groceries", "Ready-to-Eat Meals", "Online Food Locator"],
              seniorPrograms: {
                commodityProgram: false,
                homeDelivery: false,
                mobilePantry: true,
                brownBagProgram: false
              },
              hours: "Varies by distribution site; use online Food Locator",
              eligibility: "Serves Santa Clara & San Mateo counties; one of largest food banks in nation",
              languages: ["English", "Spanish", "Vietnamese", "Chinese"],
              latitude: 37.4020,
              longitude: -121.9530
            },
            {
              id: 61,
              name: "Santa Clara County Senior Nutrition Program",
              type: "Senior Nutrition Program",
              address: "35+ meal sites throughout county",
              city: "San Jose",
              state: "CA",
              zipCode: "95110",
              phone: "408-755-7680",
              website: "https://ssa.santaclaracounty.gov",
              services: ["Congregate Meals at 35+ Sites", "Home-Delivered Meals (Meals on Wheels)", "Social Activities"],
              seniorPrograms: {
                commodityProgram: false,
                homeDelivery: true,
                mobilePantry: false,
                brownBagProgram: false
              },
              hours: "Call for registration and nearest location",
              eligibility: "Age 60+; $3 suggested donation (no one denied)",
              languages: ["English", "Spanish", "Vietnamese", "Chinese"],
              latitude: 37.3382,
              longitude: -121.8863
            },
            {
              id: 62,
              name: "Santa Maria Urban Ministry",
              type: "Community Food Pantry",
              address: "778 S Almaden Ave",
              city: "San Jose",
              state: "CA",
              zipCode: "95110",
              phone: "408-292-3314",
              website: "https://santamariasj.org",
              services: ["Food Pantry", "Neighborhood Resources"],
              seniorPrograms: {
                commodityProgram: false,
                homeDelivery: false,
                mobilePantry: false,
                brownBagProgram: false
              },
              hours: "Mon-Fri 9:00 AM - 11:45 AM; 1st & 3rd Sat 9:00 AM - 11:45 AM",
              eligibility: "Santa Clara County residents",
              languages: ["English", "Spanish"],
              latitude: 37.3250,
              longitude: -121.8908
            }
          ],
          "Sonoma": [
            {
              id: 63,
              name: "Redwood Empire Food Bank",
              type: "Regional Food Bank",
              address: "3990 Brickway Blvd",
              city: "Santa Rosa",
              state: "CA",
              zipCode: "95403",
              phone: "707-523-7900 (main) or 707-523-7903 (food referrals)",
              website: "https://refb.org",
              services: ["Senior Basket Program (13,000+ seniors served)", "Monthly Fresh Food Distributions", "Mobile distributions"],
              seniorPrograms: {
                commodityProgram: true,
                homeDelivery: false,
                mobilePantry: true,
                brownBagProgram: true
              },
              hours: "Mon-Fri 8:00 AM - 4:30 PM; Text 'FOOD' to 707-353-3882 for sites",
              eligibility: "Low-income seniors 60+ for Senior Basket program; serves 5 counties",
              languages: ["English", "Spanish"],
              latitude: 38.4404,
              longitude: -122.7141
            },
            {
              id: 64,
              name: "Catholic Charities Emergency Food Pantry",
              type: "Food Pantry",
              address: "987 Airway Court, Suite 101",
              city: "Santa Rosa",
              state: "CA",
              zipCode: "95403",
              phone: "707-528-8712",
              website: null,
              services: ["Emergency Food Assistance"],
              seniorPrograms: {
                commodityProgram: false,
                homeDelivery: false,
                mobilePantry: false,
                brownBagProgram: false
              },
              hours: "Mon-Fri 9:00 AM - 5:00 PM (appointment required)",
              eligibility: "Sonoma County residents",
              languages: ["English", "Spanish"],
              latitude: 38.5071,
              longitude: -122.7633
            },
            {
              id: 65,
              name: "Bethlehem Towers Senior Food Distribution",
              type: "Senior Food Program",
              address: "801 Tupper St",
              city: "Santa Rosa",
              state: "CA",
              zipCode: "95401",
              phone: "Call 211 for info",
              website: null,
              services: ["Monthly Food Distribution for Seniors"],
              seniorPrograms: {
                commodityProgram: true,
                homeDelivery: false,
                mobilePantry: false,
                brownBagProgram: true
              },
              hours: "3rd Thursday of month, 9:00-10:00 AM",
              eligibility: "Seniors 60+",
              languages: ["English", "Spanish"],
              latitude: 38.4404,
              longitude: -122.7141
            }
          ]
        },
        florida: {
          "Miami-Dade": [
            {
              id: 5,
              name: "Feeding South Florida",
              type: "Regional Food Bank",
              address: "2501 SW 32nd Terrace",
              city: "Pembroke Park",
              state: "FL",
              zipCode: "33023",
              phone: "954-518-1818",
              website: "https://feedingsouthflorida.org",
              services: ["Senior Feeding Program", "Mobile Food Pantries", "Summer BreakSpot"],
              seniorPrograms: {
                commodityProgram: true,
                homeDelivery: true,
                mobilePantry: true,
                brownBagProgram: false
              },
              hours: "Mon-Fri 8:30 AM - 5:00 PM",
              eligibility: "Seniors 60+",
              languages: ["English", "Spanish", "Haitian Creole"],
              latitude: 25.9927,
              longitude: -80.2052
            }
          ],
          "Orange": [
            {
              id: 25,
              name: "Seniors First - Meals on Wheels Orlando",
              type: "Senior Meal Delivery & Food Pantry",
              address: "5395 L.B. McLeod Rd",
              city: "Orlando",
              state: "FL",
              zipCode: "32811",
              phone: "407-292-0177",
              website: "https://seniorsfirstinc.org",
              services: ["Meals on Wheels (Daily Hot Meals Mon-Fri)", "Food Pantry (2nd & 4th Thursday)", "Weekend Meal Options"],
              seniorPrograms: {
                commodityProgram: false,
                homeDelivery: true,
                mobilePantry: false,
                brownBagProgram: true
              },
              hours: "Food Pantry: 2nd & 4th Thursday 9:00-11:00 AM; Meals on Wheels: Daily Mon-Fri",
              eligibility: "Age 60+, homebound or difficulty grocery shopping/cooking",
              languages: ["English", "Spanish"],
              latitude: 28.4906,
              longitude: -81.4287
            },
            {
              id: 26,
              name: "Second Harvest Food Bank of Central Florida",
              type: "Regional Food Bank Network",
              address: "411 Mercy Drive",
              city: "Orlando",
              state: "FL",
              zipCode: "32805",
              phone: "407-295-1066",
              email: "info@feedhopenow.org",
              website: "https://feedhopenow.org",
              services: ["Network of 300+ Food Distribution Partners", "CalFresh Enrollment Assistance", "Senior Food Programs"],
              seniorPrograms: {
                commodityProgram: true,
                homeDelivery: true,
                mobilePantry: true,
                brownBagProgram: false
              },
              hours: "Call for partner pantry hours",
              eligibility: "Serves Orange, Seminole, Osceola, Brevard, Lake, Marion, Volusia counties",
              languages: ["English", "Spanish"],
              latitude: 28.5519,
              longitude: -81.3986
            },
            {
              id: 27,
              name: "Community Action Partnership of Orange County",
              type: "Senior Food Box Program",
              address: "Call for locations",
              city: "Orlando",
              state: "FL",
              zipCode: "32801",
              phone: "See website",
              website: "https://capoc.org",
              services: ["Monthly Senior Food Boxes (70 sites)", "CalFresh Healthy Living Nutrition Education", "Farm 2 Family Fresh Produce"],
              seniorPrograms: {
                commodityProgram: true,
                homeDelivery: false,
                mobilePantry: true,
                brownBagProgram: true
              },
              hours: "Varies by distribution site",
              eligibility: "Seniors 60+ (23,000+ boxes distributed monthly)",
              languages: ["English", "Spanish"],
              latitude: 28.5383,
              longitude: -81.3792
            },
            {
              id: 28,
              name: "Community Baptist Church Food Distribution",
              type: "Community Food Pantry",
              address: "651 Campanella Ave",
              city: "Orlando",
              state: "FL",
              zipCode: "32805",
              phone: "407-293-3100",
              website: null,
              services: ["Food Distribution", "Emergency Deliveries Available"],
              seniorPrograms: {
                commodityProgram: false,
                homeDelivery: true,
                mobilePantry: false,
                brownBagProgram: false
              },
              hours: "2nd Saturday 8:00-10:00 AM; 4th Saturday 7:00-10:00 AM",
              eligibility: "Open to all",
              languages: ["English", "Spanish"],
              latitude: 28.5537,
              longitude: -81.4051
            }
          ]
        },
        illinois: {
          "Cook": [
            {
              id: 29,
              name: "Greater Chicago Food Depository",
              type: "Regional Food Bank Network",
              address: "4100 W Ann Lurie Place",
              city: "Chicago",
              state: "IL",
              zipCode: "60632",
              phone: "773-843-5416",
              website: "https://www.chicagosfoodbank.org",
              services: ["850+ Partner Sites", "SNAP/Medicaid Assistance", "Senior Programs", "Mobile Pantries"],
              seniorPrograms: {
                commodityProgram: true,
                homeDelivery: true,
                mobilePantry: true,
                brownBagProgram: true
              },
              hours: "Mon-Fri 8:30 AM - 5:00 PM (partner sites have varying hours)",
              eligibility: "Seniors 60+, most sites open to all",
              languages: ["English", "Spanish", "Polish"],
              latitude: 41.8141,
              longitude: -87.7298
            },
            {
              id: 30,
              name: "Meals on Wheels Chicago",
              type: "Senior Meal Delivery & Food Pantry",
              address: "Call for service area",
              city: "Chicago",
              state: "IL",
              zipCode: "60601",
              phone: "See website",
              website: "https://mealsonwheelschicago.org",
              services: ["Home-Delivered Meals", "Monthly Food Pantry"],
              seniorPrograms: {
                commodityProgram: false,
                homeDelivery: true,
                mobilePantry: false,
                brownBagProgram: true
              },
              hours: "Meal delivery Mon-Fri",
              eligibility: "Homebound seniors 60+",
              languages: ["English", "Spanish"],
              latitude: 41.8781,
              longitude: -87.6298
            },
            {
              id: 31,
              name: "Community Nutrition Network & Senior Services Association (CNNSSA)",
              type: "Senior Dining & Meals on Wheels",
              address: "439 Bohland Avenue",
              city: "Bellwood",
              state: "IL",
              zipCode: "60104",
              phone: "See website",
              website: "https://cnnssa.org",
              services: ["Community Café Dining", "Meals on Wheels", "Bingo & Fitness Programs", "Nutrition Education"],
              seniorPrograms: {
                commodityProgram: false,
                homeDelivery: true,
                mobilePantry: false,
                brownBagProgram: false
              },
              hours: "Varies by location (8 Cook County sites)",
              eligibility: "Seniors 60+",
              languages: ["English"],
              latitude: 41.8822,
              longitude: -87.8773
            },
            {
              id: 32,
              name: "Catholic Charities Food Pantries - Cook County",
              type: "Network of Food Pantries",
              address: "Multiple locations",
              city: "Chicago",
              state: "IL",
              zipCode: "60601",
              phone: "312-655-7106",
              website: "https://www.catholiccharities.net",
              services: ["Food Pantries", "Emergency Food Assistance", "Senior Farmers Market Coupons"],
              seniorPrograms: {
                commodityProgram: true,
                homeDelivery: false,
                mobilePantry: false,
                brownBagProgram: false
              },
              hours: "Varies by location",
              eligibility: "Cook & Lake Counties residents",
              languages: ["English", "Spanish", "Polish"],
              latitude: 41.8781,
              longitude: -87.6298
            },
            {
              id: 33,
              name: "City of Chicago Golden Diners Program",
              type: "Senior Congregate Dining",
              address: "~50 community sites citywide",
              city: "Chicago",
              state: "IL",
              zipCode: "60601",
              phone: "312-744-4016",
              website: "https://www.chicago.gov/seniors",
              services: ["Daily Lunch at Senior Centers", "Social Activities", "Nutrition Education"],
              seniorPrograms: {
                commodityProgram: false,
                homeDelivery: false,
                mobilePantry: false,
                brownBagProgram: false
              },
              hours: "Daily 11:30 AM - 12:30 PM at various sites",
              eligibility: "Seniors 60+ and spouses (any age)",
              languages: ["English", "Spanish"],
              latitude: 41.8781,
              longitude: -87.6298
            }
          ]
        },
        washington: {
          "King": [
            {
              id: 34,
              name: "University District Food Bank",
              type: "Community Food Bank",
              address: "Northeast Seattle (near 50th & 12th Ave NE)",
              city: "Seattle",
              state: "WA",
              zipCode: "98105",
              phone: "206-523-7060",
              email: "info@udistrictfoodbank.org",
              website: "https://www.udistrictfoodbank.org",
              services: ["Groceries", "Toiletries", "Baby Formula/Diapers", "Pet Food", "Weekly Visits Allowed"],
              seniorPrograms: {
                commodityProgram: false,
                homeDelivery: false,
                mobilePantry: false,
                brownBagProgram: false
              },
              hours: "Mon 9:00 AM-3:00 PM; Tue & Thu 11:00 AM-7:00 PM; Fri 11:00 AM-4:00 PM",
              eligibility: "Zip codes 98102, 98103, 98105, 98112, 98115, 98125",
              languages: ["English"],
              latitude: 47.6653,
              longitude: -122.3117
            },
            {
              id: 35,
              name: "Ballard Food Bank",
              type: "Community Food Bank",
              address: "Leary Ave NW near Ione Pl",
              city: "Seattle",
              state: "WA",
              zipCode: "98117",
              phone: "206-789-7800",
              website: "https://www.ballardfoodbank.org",
              services: ["Grocery-Style Shopping", "Home Delivery for Homebound", "No-Cook Bags", "Community Resource Hub"],
              seniorPrograms: {
                commodityProgram: false,
                homeDelivery: true,
                mobilePantry: false,
                brownBagProgram: false
              },
              hours: "Tue 1:00-2:00 PM (seniors/disabled only), 2:30-6:30 PM (all); Wed & Thu 11:00 AM-3:00 PM",
              eligibility: "Zip codes 98107, 98117",
              languages: ["English"],
              latitude: 47.6654,
              longitude: -122.3721
            },
            {
              id: 36,
              name: "West Seattle Food Bank",
              type: "Community Food Bank",
              address: "California Ave SW & SW Alaska, West Seattle Junction",
              city: "Seattle",
              state: "WA",
              zipCode: "98126",
              phone: "206-932-9023",
              website: null,
              services: ["Weekly Groceries", "Rent/Utilities Assistance", "Clothing", "Bus Tickets"],
              seniorPrograms: {
                commodityProgram: false,
                homeDelivery: false,
                mobilePantry: false,
                brownBagProgram: false
              },
              hours: "Tue & Thu & Fri 10:00 AM-2:00 PM; Wed 12:00 PM-7:00 PM",
              eligibility: "Zip codes 98106, 98116, 98126, 98136 - Photo ID & proof of address required",
              languages: ["English"],
              latitude: 47.5643,
              longitude: -122.3862
            },
            {
              id: 37,
              name: "White Center Food Bank",
              type: "Community Food Bank & Mobile Services",
              address: "White Center (Puget Sound to Highway 509 area)",
              city: "White Center",
              state: "WA",
              zipCode: "98146",
              phone: "See website",
              website: "https://www.whitecenterfoodbank.org",
              services: ["Home Delivery", "Mobile Food Banks", "Healthy Food Gift Certificates for Local Markets"],
              seniorPrograms: {
                commodityProgram: false,
                homeDelivery: true,
                mobilePantry: true,
                brownBagProgram: false
              },
              hours: "Mon, Wed, Fri 11:00 AM-1:00 PM; Thu 11:00 AM-1:00 PM (seniors 65+ only); 2nd & 4th Wed 6:00-8:00 PM; 3rd Sat 11:00 AM-1:00 PM",
              eligibility: "Seniors 65+ special hours on Thursday",
              languages: ["English", "Spanish"],
              latitude: 47.5155,
              longitude: -122.3541
            },
            {
              id: 38,
              name: "Pike Market Food Bank",
              type: "Urban Food Bank",
              address: "Pike Market Parking Garage, 5th level",
              city: "Seattle",
              state: "WA",
              zipCode: "98101",
              phone: "206-728-2773",
              website: "https://www.pmsc-fb.org",
              services: ["Express Bags", "Home Delivery for Downtown Homebound Residents"],
              seniorPrograms: {
                commodityProgram: false,
                homeDelivery: true,
                mobilePantry: false,
                brownBagProgram: false
              },
              hours: "Varies (call ahead); Closed federal holidays",
              eligibility: "Downtown Seattle, home delivery for zip codes 98101, 98102, 98104, 98121, 98112, 98122",
              languages: ["English"],
              latitude: 47.6097,
              longitude: -122.3421
            },
            {
              id: 39,
              name: "King County Senior Farmers Market Nutrition Program",
              type: "Fresh Food Voucher Program",
              address: "Community Living Connections",
              city: "Seattle",
              state: "WA",
              zipCode: "98101",
              phone: "206-962-8467 or 1-844-348-5464",
              website: "https://sfmnp-seattleking.org",
              services: ["$80 E-Benefit Card for Fresh Fruits/Vegetables at Farmers Markets"],
              seniorPrograms: {
                commodityProgram: true,
                homeDelivery: false,
                mobilePantry: false,
                brownBagProgram: false
              },
              hours: "Apply by May 9, 2025",
              eligibility: "Age 60+ (or 55+ if American Indian/Alaska Native) with income guidelines",
              languages: ["English"],
              latitude: 47.6062,
              longitude: -122.3321
            }
          ]
        }
      };

      // Filter by state and county if provided
      let results = [];
      let dataAvailable = true;
      if (state && county) {
        const stateData = foodBanks[state.toString().toLowerCase()];
        if (stateData && stateData[county.toString()]) {
          results = stateData[county.toString()];
        } else {
          dataAvailable = false;
        }
      } else if (state) {
        const stateData = foodBanks[state.toString().toLowerCase()];
        if (stateData) {
          results = Object.values(stateData).flat();
        } else {
          dataAvailable = false;
        }
      } else {
        // Return all food banks
        results = Object.values(foodBanks).flatMap(state => Object.values(state).flat());
      }

      res.json({
        foodBanks: results,
        totalCount: results.length,
        dataAvailable,
        message: !dataAvailable ? `Food bank data for ${county}, ${state} is being compiled. Check back soon or contact us for assistance.` : undefined,
        additionalResources: {
          nationalHotlines: [
            {
              name: "USDA National Hunger Hotline",
              phone: "1-866-348-6479",
              hours: "Mon-Fri 7:00 AM - 10:00 PM ET",
              description: "Help finding food assistance programs"
            },
            {
              name: "Eldercare Locator",
              phone: "1-800-677-1116",
              hours: "Mon-Fri 9:00 AM - 8:00 PM ET",
              description: "Connect to local senior nutrition programs"
            }
          ],
          websites: [
            {
              name: "Meals on Wheels America",
              url: "https://www.mealsonwheelsamerica.org",
              description: "Find local meal delivery programs for seniors"
            },
            {
              name: "SNAP (Food Stamps) for Seniors",
              url: "https://www.fns.usda.gov/snap/eligibility/elderly-disabled",
              description: "Information about food assistance benefits"
            }
          ]
        }
      });
    } catch (error) {
      console.error("Error fetching food banks:", error);
      res.status(500).json({ error: "Failed to fetch food bank resources" });
    }
  });

  // Get IHSS (In-Home Supportive Services) resources by county
  app.get("/api/senior-resources/ihss", async (req, res) => {
    try {
      const { county, state } = req.query;
      
      // IHSS is primarily a California program
      const ihssResources: Record<string, Record<string, any>> = {
        california: {
          "Los Angeles": {
            office: {
              name: "Los Angeles County IHSS",
              mainOffice: "3333 Wilshire Blvd, Suite 800",
              city: "Los Angeles",
              state: "CA",
              zipCode: "90010",
              phone: "1-888-822-9622",
              website: "https://dpss.lacounty.gov/en/seniors/ihss.html",
              email: "ihss@dpss.lacounty.gov"
            },
            services: [
              "Housecleaning", 
              "Meal preparation",
              "Laundry",
              "Grocery shopping",
              "Personal care services",
              "Accompaniment to medical appointments",
              "Protective supervision"
            ],
            eligibility: {
              age: "65+ or disabled",
              income: "Must meet Medi-Cal income requirements",
              residency: "Must be California resident",
              needs: "Must need assistance with daily living activities"
            },
            publicAuthority: {
              name: "LA County IHSS Public Authority",
              phone: "1-844-900-7272",
              website: "https://www.laihss.org",
              services: ["Provider Registry", "Training", "Provider Support"]
            },
            applicationProcess: [
              "Call IHSS office to request application",
              "Complete and submit application",
              "In-home assessment by social worker",
              "Receive authorization for hours",
              "Choose provider or family member"
            ],
            averageHours: "100-283 hours per month depending on needs",
            payRate: "$18.00 per hour (as of 2025)"
          },
          "Sacramento": {
            office: {
              name: "Sacramento County IHSS",
              mainOffice: "2450 Florin Road",
              city: "Sacramento",
              state: "CA",
              zipCode: "95822",
              phone: "916-874-9471",
              website: "https://ha.saccounty.gov/Pages/In-Home-Supportive-Services.aspx",
              email: "ihss@saccounty.gov"
            },
            services: [
              "Housecleaning",
              "Meal preparation", 
              "Laundry",
              "Grocery shopping",
              "Personal care services",
              "Accompaniment to medical appointments",
              "Protective supervision"
            ],
            eligibility: {
              age: "65+ or disabled",
              income: "Must meet Medi-Cal income requirements",
              residency: "Must be California resident",
              needs: "Must need assistance with daily living activities"
            },
            publicAuthority: {
              name: "Sacramento County Public Authority",
              phone: "916-876-8437",
              website: "https://www.publicauthority.org",
              services: ["Provider Registry", "Training", "Background Checks"]
            },
            applicationProcess: [
              "Call IHSS office to request application",
              "Complete and submit application",
              "In-home assessment by social worker",
              "Receive authorization for hours",
              "Choose provider or family member"
            ],
            averageHours: "100-283 hours per month depending on needs",
            payRate: "$17.00 per hour (as of 2025)"
          }
        }
      };

      let results = {};
      let dataAvailable = false;
      if (state && state.toString().toLowerCase() === 'california' && county) {
        const countyData = ihssResources.california[county.toString()];
        if (countyData) {
          results = { [county.toString()]: countyData };
          dataAvailable = true;
        }
      } else if (state && state.toString().toLowerCase() === 'california') {
        results = ihssResources.california;
        dataAvailable = true;
      }

      res.json({
        ihss: results,
        dataAvailable,
        message: !dataAvailable ? `IHSS is primarily a California program. For in-home support services in ${state}, contact your local Area Agency on Aging.` : undefined,
        programInfo: {
          fullName: "In-Home Supportive Services",
          description: "IHSS helps pay for services provided to eligible elderly, blind, and disabled individuals who cannot safely remain in their own homes without assistance",
          fundedBy: "State of California and Federal Government",
          availableIn: "California only - each county administers its own program"
        }
      });
    } catch (error) {
      console.error("Error fetching IHSS resources:", error);
      res.status(500).json({ error: "Failed to fetch IHSS resources" });
    }
  });

  // Get SLS (Supported Living Services) resources by county
  app.get("/api/senior-resources/sls", async (req, res) => {
    try {
      const { county, state } = req.query;
      
      // SLS providers by county
      const slsResources: Record<string, Record<string, any[]>> = {
        california: {
          "Los Angeles": [
            {
              id: 1,
              name: "Creative Living Options",
              type: "SLS Provider",
              address: "6033 W Century Blvd Suite 700",
              city: "Los Angeles",
              state: "CA",
              zipCode: "90045",
              phone: "310-645-5300",
              website: "https://www.creativeliving.org",
              services: [
                "24/7 Supported Living",
                "Independent Living Skills Training",
                "Community Integration",
                "Personal Care Assistance",
                "Medication Management",
                "Transportation Support"
              ],
              specializations: ["Developmental Disabilities", "Mental Health", "Seniors with Disabilities"],
              vendorNumber: "PX0522",
              acceptingClients: true,
              languages: ["English", "Spanish"],
              regionalCenter: "Westside Regional Center"
            },
            {
              id: 2,
              name: "Compass Community Services",
              type: "SLS Provider",
              address: "8134 Van Nuys Blvd Suite 200",
              city: "Panorama City",
              state: "CA",
              zipCode: "91402",
              phone: "818-778-3444",
              website: "https://www.compasscommunityservices.com",
              services: [
                "Supported Living Services",
                "Life Skills Development",
                "Community Participation",
                "Health Monitoring",
                "Behavioral Support"
              ],
              specializations: ["Adults with Disabilities", "Transition Age Youth", "Seniors"],
              vendorNumber: "PX0847",
              acceptingClients: true,
              languages: ["English", "Spanish", "Tagalog"],
              regionalCenter: "North Los Angeles County Regional Center"
            }
          ],
          "Sacramento": [
            {
              id: 3,
              name: "Progressive Employment Concepts",
              type: "SLS Provider",
              address: "7801 Folsom Blvd Suite 300",
              city: "Sacramento",
              state: "CA",
              zipCode: "95826",
              phone: "916-383-9785",
              website: "https://www.peconline.org",
              services: [
                "Supported Living Services",
                "Independent Living Support",
                "Skills Training",
                "Community Access",
                "Respite Services"
              ],
              specializations: ["Developmental Disabilities", "Autism", "Senior Care"],
              vendorNumber: "PX1265",
              acceptingClients: true,
              languages: ["English", "Spanish", "Hmong"],
              regionalCenter: "Alta California Regional Center"
            }
          ]
        }
      };

      let results = [];
      let dataAvailable = true;
      if (state && county) {
        const stateData = slsResources[state.toString().toLowerCase()];
        if (stateData && stateData[county.toString()]) {
          results = stateData[county.toString()];
        } else {
          dataAvailable = false;
        }
      } else if (state) {
        const stateData = slsResources[state.toString().toLowerCase()];
        if (stateData) {
          results = Object.values(stateData).flat();
        } else {
          dataAvailable = false;
        }
      } else {
        results = Object.values(slsResources).flatMap(state => Object.values(state).flat());
      }

      res.json({
        sls: results,
        totalCount: results.length,
        dataAvailable,
        message: !dataAvailable ? `SLS provider data for ${county}, ${state} is being compiled. Contact your local disability services agency for immediate assistance.` : undefined,
        programInfo: {
          fullName: "Supported Living Services",
          description: "SLS provides housing support and life skills training for adults with developmental disabilities to live independently",
          eligibility: "Adults with developmental disabilities who are Regional Center clients",
          fundedBy: "California Department of Developmental Services through Regional Centers"
        },
        regionalCenters: {
          "Los Angeles": [
            {
              name: "Westside Regional Center",
              phone: "310-258-4000",
              website: "https://www.westsiderc.org"
            },
            {
              name: "North Los Angeles County Regional Center",
              phone: "818-778-1900",
              website: "https://www.nlacrc.org"
            }
          ],
          "Sacramento": [
            {
              name: "Alta California Regional Center",
              phone: "916-978-6400",
              website: "https://www.altaregional.org"
            }
          ]
        }
      });
    } catch (error) {
      console.error("Error fetching SLS resources:", error);
      res.status(500).json({ error: "Failed to fetch SLS resources" });
    }
  });

  // Get all senior resources for a specific county
  app.get("/api/senior-resources/by-county", async (req, res) => {
    try {
      const { county, state } = req.query;
      
      if (!county || !state) {
        return res.status(400).json({ error: "County and state parameters are required" });
      }

      // Aggregate all resources for the county
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://www.myseniorvalet.com'
        : 'http://localhost:5000';
      const foodBankResponse = await fetch(
        `${baseUrl}/api/senior-resources/food-banks?county=${county}&state=${state}`
      );
      const ihssResponse = await fetch(
        `${baseUrl}/api/senior-resources/ihss?county=${county}&state=${state}`
      );
      const slsResponse = await fetch(
        `${baseUrl}/api/senior-resources/sls?county=${county}&state=${state}`
      );

      const foodBankData = await foodBankResponse.json();
      const ihssData = await ihssResponse.json();
      const slsData = await slsResponse.json();

      res.json({
        county: county.toString(),
        state: state.toString(),
        resources: {
          foodBanks: foodBankData.foodBanks || [],
          ihss: ihssData.ihss || {},
          sls: slsData.sls || [],
          additionalResources: foodBankData.additionalResources
        },
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching county resources:", error);
      res.status(500).json({ error: "Failed to fetch county resources" });
    }
  });
}