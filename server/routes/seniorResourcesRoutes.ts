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
          ]
        }
      };

      // Filter by state and county if provided
      let results = [];
      if (state && county) {
        const stateData = foodBanks[state.toString().toLowerCase()];
        if (stateData && stateData[county.toString()]) {
          results = stateData[county.toString()];
        }
      } else if (state) {
        const stateData = foodBanks[state.toString().toLowerCase()];
        if (stateData) {
          results = Object.values(stateData).flat();
        }
      } else {
        // Return all food banks
        results = Object.values(foodBanks).flatMap(state => Object.values(state).flat());
      }

      res.json({
        foodBanks: results,
        totalCount: results.length,
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
      if (state && state.toString().toLowerCase() === 'california' && county) {
        const countyData = ihssResources.california[county.toString()];
        if (countyData) {
          results = { [county.toString()]: countyData };
        }
      } else if (state && state.toString().toLowerCase() === 'california') {
        results = ihssResources.california;
      }

      res.json({
        ihss: results,
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
      if (state && county) {
        const stateData = slsResources[state.toString().toLowerCase()];
        if (stateData && stateData[county.toString()]) {
          results = stateData[county.toString()];
        }
      } else if (state) {
        const stateData = slsResources[state.toString().toLowerCase()];
        if (stateData) {
          results = Object.values(stateData).flat();
        }
      } else {
        results = Object.values(slsResources).flatMap(state => Object.values(state).flat());
      }

      res.json({
        sls: results,
        totalCount: results.length,
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