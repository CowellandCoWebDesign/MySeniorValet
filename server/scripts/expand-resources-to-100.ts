import { db } from "../db";
import { supportResourceCategories, supportResources } from "../../shared/schema";

const expandedResources = [
  // VETERAN RESOURCES (Category: Veterans)
  {
    category: "Veterans",
    resources: [
      {
        title: "Disabled American Veterans (DAV)",
        description: "Free assistance with VA benefits and claims for disabled veterans",
        phone: "1-877-426-2838",
        website: "https://www.dav.org",
        priority: 10
      },
      {
        title: "Veterans of Foreign Wars (VFW)",
        description: "Support services and advocacy for veterans and their families",
        phone: "1-816-756-3390",
        website: "https://www.vfw.org",
        priority: 9
      },
      {
        title: "American Legion",
        description: "Veterans service organization providing support and advocacy",
        phone: "1-800-433-3318",
        website: "https://www.legion.org",
        priority: 9
      },
      {
        title: "Wounded Warrior Project",
        description: "Programs and services for wounded veterans",
        phone: "1-877-832-6997",
        website: "https://www.woundedwarriorproject.org",
        priority: 10
      },
      {
        title: "Fisher House Foundation",
        description: "Free housing for military families during medical treatment",
        phone: "1-888-294-8560",
        website: "https://www.fisherhouse.org",
        priority: 8
      },
      {
        title: "VA Caregiver Support",
        description: "Support services for caregivers of veterans",
        phone: "1-855-260-3274",
        website: "https://www.caregiver.va.gov",
        priority: 9
      }
    ]
  },
  
  // DISEASE-SPECIFIC ORGANIZATIONS (Category: Healthcare)
  {
    category: "Healthcare",
    resources: [
      {
        title: "American Diabetes Association",
        description: "Resources and support for diabetes management",
        phone: "1-800-342-2383",
        website: "https://www.diabetes.org",
        priority: 10
      },
      {
        title: "National Stroke Association",
        description: "Stroke recovery resources and caregiver support",
        phone: "1-800-787-6537",
        website: "https://www.stroke.org",
        priority: 9
      },
      {
        title: "Arthritis Foundation",
        description: "Resources for arthritis management and support",
        phone: "1-800-283-7800",
        website: "https://www.arthritis.org",
        priority: 8
      },
      {
        title: "Lewy Body Dementia Association",
        description: "Support and resources for Lewy body dementia",
        phone: "1-833-432-5111",
        website: "https://www.lbda.org",
        priority: 8
      },
      {
        title: "National Multiple Sclerosis Society",
        description: "Support services for MS patients and families",
        phone: "1-800-344-4867",
        website: "https://www.nationalmssociety.org",
        priority: 9
      },
      {
        title: "ALS Association",
        description: "Resources and support for ALS patients and caregivers",
        phone: "1-800-782-4747",
        website: "https://www.als.org",
        priority: 9
      },
      {
        title: "Lupus Foundation of America",
        description: "Support and resources for lupus patients",
        phone: "1-800-558-0121",
        website: "https://www.lupus.org",
        priority: 7
      },
      {
        title: "National Kidney Foundation",
        description: "Resources for kidney disease patients",
        phone: "1-800-622-9010",
        website: "https://www.kidney.org",
        priority: 8
      },
      {
        title: "COPD Foundation",
        description: "Support for chronic obstructive pulmonary disease",
        phone: "1-866-316-2673",
        website: "https://www.copdfoundation.org",
        priority: 8
      },
      {
        title: "National Osteoporosis Foundation",
        description: "Resources for bone health and osteoporosis prevention",
        phone: "1-800-231-4222",
        website: "https://www.nof.org",
        priority: 7
      }
    ]
  },
  
  // MENTAL HEALTH RESOURCES (Category: Healthcare)
  {
    category: "Healthcare",
    resources: [
      {
        title: "National Alliance on Mental Illness (NAMI)",
        description: "Mental health support, education, and advocacy",
        phone: "1-800-950-6264",
        website: "https://www.nami.org",
        priority: 10
      },
      {
        title: "Depression and Bipolar Support Alliance",
        description: "Support groups and resources for mood disorders",
        phone: "1-800-826-3632",
        website: "https://www.dbsalliance.org",
        priority: 8
      },
      {
        title: "Anxiety & Depression Association of America",
        description: "Resources for anxiety and depression management",
        phone: "1-240-485-1001",
        website: "https://adaa.org",
        priority: 8
      },
      {
        title: "Crisis Text Line",
        description: "24/7 text-based crisis support",
        phone: "Text HOME to 741741",
        website: "https://www.crisistextline.org",
        priority: 10
      }
    ]
  },
  
  // FINANCIAL ASSISTANCE (Category: Financial)
  {
    category: "Financial",
    resources: [
      {
        title: "Benefits.gov",
        description: "Official guide to government benefits",
        phone: "1-800-333-4636",
        website: "https://www.benefits.gov",
        priority: 10
      },
      {
        title: "National Foundation for Credit Counseling",
        description: "Non-profit credit counseling and debt management",
        phone: "1-800-388-2227",
        website: "https://www.nfcc.org",
        priority: 8
      },
      {
        title: "Low Income Home Energy Assistance Program (LIHEAP)",
        description: "Help with energy bills for low-income households",
        phone: "1-866-674-6327",
        website: "https://www.acf.hhs.gov/ocs/liheap",
        priority: 9
      },
      {
        title: "Supplemental Nutrition Assistance Program (SNAP)",
        description: "Food assistance for eligible individuals and families",
        phone: "1-800-221-5689",
        website: "https://www.fns.usda.gov/snap",
        priority: 10
      },
      {
        title: "Extra Help (Medicare Part D)",
        description: "Assistance with Medicare prescription drug costs",
        phone: "1-800-772-1213",
        website: "https://www.ssa.gov/extrahelp",
        priority: 9
      },
      {
        title: "Patient Advocate Foundation",
        description: "Help with medical debt and insurance appeals",
        phone: "1-800-532-5274",
        website: "https://www.patientadvocate.org",
        priority: 8
      }
    ]
  },
  
  // TRANSPORTATION SERVICES (Category: Transportation)
  {
    category: "Transportation",
    resources: [
      {
        title: "National Aging and Disability Transportation Center",
        description: "Transportation resources for seniors and disabled individuals",
        phone: "1-866-983-3222",
        website: "https://www.nadtc.org",
        priority: 9
      },
      {
        title: "GoGoGrandparent",
        description: "Ride services for seniors without smartphones",
        phone: "1-855-464-6872",
        website: "https://gogograndparent.com",
        priority: 7
      },
      {
        title: "ITNAmerica",
        description: "Dignified transportation for seniors",
        phone: "1-207-857-9001",
        website: "https://www.itnamerica.org",
        priority: 7
      },
      {
        title: "Medical Transportation Management",
        description: "Non-emergency medical transportation coordination",
        phone: "1-888-561-9111",
        website: "https://www.mtm-inc.net",
        priority: 8
      }
    ]
  },
  
  // CAREGIVER SUPPORT (Category: Caregiver)
  {
    category: "Caregiver",
    resources: [
      {
        title: "Family Caregiver Alliance",
        description: "Information, education, and support for caregivers",
        phone: "1-800-445-8106",
        website: "https://www.caregiver.org",
        priority: 10
      },
      {
        title: "National Respite Network",
        description: "Respite care services and support for caregivers",
        phone: "1-919-490-5577",
        website: "https://archrespite.org",
        priority: 8
      },
      {
        title: "Well Spouse Association",
        description: "Support for partners of chronically ill or disabled",
        phone: "1-732-577-8899",
        website: "https://www.wellspouse.org",
        priority: 7
      },
      {
        title: "Caregiver Action Network",
        description: "Resources and support for family caregivers",
        phone: "1-202-454-3970",
        website: "https://www.caregiveraction.org",
        priority: 9
      },
      {
        title: "National Alliance for Caregiving",
        description: "Research, advocacy, and support for caregivers",
        phone: "1-301-718-8444",
        website: "https://www.caregiving.org",
        priority: 8
      }
    ]
  },
  
  // DISABILITY SERVICES (Category: Healthcare)
  {
    category: "Healthcare",
    resources: [
      {
        title: "United Spinal Association",
        description: "Resources for spinal cord injuries and disorders",
        phone: "1-800-404-2898",
        website: "https://www.unitedspinal.org",
        priority: 8
      },
      {
        title: "National Federation of the Blind",
        description: "Advocacy and resources for blind individuals",
        phone: "1-410-659-9314",
        website: "https://www.nfb.org",
        priority: 8
      },
      {
        title: "Hearing Loss Association of America",
        description: "Support and resources for hearing loss",
        phone: "1-301-657-2248",
        website: "https://www.hearingloss.org",
        priority: 8
      },
      {
        title: "Brain Injury Association of America",
        description: "Support for traumatic brain injury survivors",
        phone: "1-800-444-6443",
        website: "https://www.biausa.org",
        priority: 9
      },
      {
        title: "Christopher & Dana Reeve Foundation",
        description: "Resources for paralysis and spinal cord injuries",
        phone: "1-800-225-0292",
        website: "https://www.christopherreeve.org",
        priority: 8
      }
    ]
  },
  
  // NUTRITION PROGRAMS (Category: Nutrition)
  {
    category: "Nutrition",
    resources: [
      {
        title: "Feeding America",
        description: "National network of food banks",
        phone: "1-800-771-2303",
        website: "https://www.feedingamerica.org",
        priority: 10
      },
      {
        title: "Senior Farmers Market Nutrition Program",
        description: "Fresh produce vouchers for low-income seniors",
        phone: "1-703-305-2286",
        website: "https://www.fns.usda.gov/sfmnp",
        priority: 8
      },
      {
        title: "Commodity Supplemental Food Program",
        description: "Monthly food packages for seniors",
        phone: "1-703-305-2286",
        website: "https://www.fns.usda.gov/csfp",
        priority: 8
      },
      {
        title: "Academy of Nutrition and Dietetics",
        description: "Nutrition information and registered dietitian locator",
        phone: "1-800-877-1600",
        website: "https://www.eatright.org",
        priority: 7
      }
    ]
  },
  
  // EMERGENCY ASSISTANCE (Category: Emergency)
  {
    category: "Emergency",
    resources: [
      {
        title: "Disaster Distress Helpline",
        description: "Crisis counseling for disaster survivors",
        phone: "1-800-985-5990",
        website: "https://www.samhsa.gov/ddh",
        priority: 10
      },
      {
        title: "National Poison Control",
        description: "24/7 poison emergency assistance",
        phone: "1-800-222-1222",
        website: "https://www.poison.org",
        priority: 10
      },
      {
        title: "Elder Abuse Hotline",
        description: "Report and get help for elder abuse",
        phone: "1-800-677-1116",
        website: "https://ncea.acl.gov",
        priority: 10
      },
      {
        title: "FEMA Disaster Assistance",
        description: "Federal disaster relief and recovery",
        phone: "1-800-621-3362",
        website: "https://www.disasterassistance.gov",
        priority: 9
      }
    ]
  },
  
  // HOUSING & HOMELESSNESS (Category: Housing)
  {
    category: "Housing",
    resources: [
      {
        title: "National Coalition for the Homeless",
        description: "Resources and advocacy for homeless individuals",
        phone: "1-202-462-4822",
        website: "https://nationalhomeless.org",
        priority: 8
      },
      {
        title: "National Low Income Housing Coalition",
        description: "Affordable housing advocacy and resources",
        phone: "1-202-662-1530",
        website: "https://nlihc.org",
        priority: 8
      },
      {
        title: "Habitat for Humanity Aging in Place",
        description: "Home modifications for safe aging",
        phone: "1-800-422-4828",
        website: "https://www.habitat.org",
        priority: 7
      },
      {
        title: "USDA Rural Housing Service",
        description: "Housing assistance for rural seniors",
        phone: "1-800-414-1226",
        website: "https://www.rd.usda.gov",
        priority: 7
      }
    ]
  }
];

async function expandResources() {
  console.log("🚀 Starting expansion to 100+ resources...\n");
  
  try {
    // Get existing categories
    const existingCategories = await db.execute(
      `SELECT id, name FROM support_resource_categories`
    );
    
    const categoryMap = new Map();
    for (const cat of existingCategories.rows as any[]) {
      categoryMap.set(cat.name, cat.id);
    }
    
    // Add Transportation category if it doesn't exist
    if (!categoryMap.has("Transportation")) {
      const result = await db.execute(
        `INSERT INTO support_resource_categories (name, description, icon, color_scheme, display_order, is_active)
         VALUES ('Transportation', 'Transportation and mobility services', 'car', 'bg-purple-100 text-purple-800', 13, true)
         RETURNING id`
      );
      categoryMap.set("Transportation", (result.rows[0] as any).id);
      console.log("✅ Added Transportation category");
    }
    
    // Add Nutrition category if it doesn't exist
    if (!categoryMap.has("Nutrition")) {
      const result = await db.execute(
        `INSERT INTO support_resource_categories (name, description, icon, color_scheme, display_order, is_active)
         VALUES ('Nutrition', 'Food and nutrition assistance programs', 'apple', 'bg-green-100 text-green-800', 14, true)
         RETURNING id`
      );
      categoryMap.set("Nutrition", (result.rows[0] as any).id);
      console.log("✅ Added Nutrition category");
    }
    
    // Add Housing category if it doesn't exist
    if (!categoryMap.has("Housing")) {
      const result = await db.execute(
        `INSERT INTO support_resource_categories (name, description, icon, color_scheme, display_order, is_active)
         VALUES ('Housing', 'Housing assistance and homelessness prevention', 'home', 'bg-orange-100 text-orange-800', 15, true)
         RETURNING id`
      );
      categoryMap.set("Housing", (result.rows[0] as any).id);
      console.log("✅ Added Housing category");
    }
    
    // Add Emergency category if it doesn't exist
    if (!categoryMap.has("Emergency")) {
      const result = await db.execute(
        `INSERT INTO support_resource_categories (name, description, icon, color_scheme, display_order, is_active)
         VALUES ('Emergency', 'Emergency and crisis assistance', 'alert-triangle', 'bg-red-100 text-red-800', 16, true)
         RETURNING id`
      );
      categoryMap.set("Emergency", (result.rows[0] as any).id);
      console.log("✅ Added Emergency category");
    }
    
    let totalAdded = 0;
    
    // Add all new resources
    for (const categoryGroup of expandedResources) {
      const categoryId = categoryMap.get(categoryGroup.category);
      
      if (!categoryId) {
        console.log(`⚠️ Category not found: ${categoryGroup.category}`);
        continue;
      }
      
      for (const resource of categoryGroup.resources) {
        // Check if resource already exists
        const existing = await db.execute(
          `SELECT id FROM support_resources WHERE title = '${resource.title.replace(/'/g, "''")}' LIMIT 1`
        );
        
        if (existing.rows.length > 0) {
          console.log(`✓ Resource exists: ${resource.title}`);
          continue;
        }
        
        // Add new resource
        const content = `${resource.description}\n\nContact Information:\nPhone: ${resource.phone}\nWebsite: ${resource.website}\n\nThis is a verified national resource providing essential services to seniors and their families.`;
        
        await db.execute(
          `INSERT INTO support_resources (
            category_id, 
            title, 
            description,
            content,
            phone_number, 
            website, 
            priority,
            resource_type,
            is_featured,
            is_active,
            national_hotline
          ) VALUES (
            ${categoryId},
            '${resource.title.replace(/'/g, "''")}',
            '${resource.description.replace(/'/g, "''")}',
            '${content.replace(/'/g, "''")}',
            '${resource.phone.replace(/'/g, "''")}',
            '${resource.website.replace(/'/g, "''")}',
            ${resource.priority || 5},
            'external_link',
            ${resource.priority >= 9},
            true,
            ${resource.priority >= 10}
          )`
        );
        
        console.log(`✅ Added: ${resource.title}`);
        totalAdded++;
      }
    }
    
    // Get final count
    const finalCount = await db.execute(
      `SELECT COUNT(*) as count FROM support_resources WHERE is_active = true`
    );
    
    console.log("\n🎉 Expansion complete!");
    console.log(`   - New resources added: ${totalAdded}`);
    console.log(`   - Total active resources: ${(finalCount.rows[0] as any).count}`);
    
  } catch (error) {
    console.error("Error expanding resources:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

expandResources();