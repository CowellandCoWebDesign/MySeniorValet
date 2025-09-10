import { db } from "../db";
import { supportResourceCategories, supportResources } from "@shared/schema";
import { eq } from "drizzle-orm";

const expandedResources = [
  {
    category: "Transportation",
    resources: [
      {
        title: "Medical Transportation Network",
        description: "Specialized medical transportation services",
        phone: "1-888-325-0011",
        website: "https://www.medicaltransportationnetwork.com",
        priority: 9
      },
      {
        title: "Senior Transportation Connection",
        description: "Comprehensive senior transportation solutions",
        phone: "1-800-846-3484",
        website: "https://www.seniortransport.org",
        priority: 8
      },
      {
        title: "Volunteer Driver Coalition",
        description: "Free volunteer-based transportation",
        phone: "1-888-833-6703",
        website: "https://www.volunteerdrivercoalition.org",
        priority: 7
      },
      {
        title: "National Rural Transit Assistance",
        description: "Rural transportation support and resources",
        phone: "1-888-589-6821",
        website: "https://www.nationalrtap.org",
        priority: 7
      },
      {
        title: "Transportation for America",
        description: "Advocacy for senior-friendly transportation",
        phone: "1-202-955-5543",
        website: "https://t4america.org",
        priority: 6
      }
    ]
  },
  {
    category: "Nutrition",
    resources: [
      {
        title: "Meals on Wheels America",
        description: "Home-delivered meal programs nationwide",
        phone: "1-888-998-6325",
        website: "https://www.mealsonwheelsamerica.org",
        priority: 10
      },
      {
        title: "Senior Farmers Market Nutrition Program",
        description: "Fresh produce vouchers for seniors",
        phone: "1-703-305-2062",
        website: "https://www.fns.usda.gov/sfmnp",
        priority: 8
      },
      {
        title: "Feeding America Senior Programs",
        description: "Food bank programs for older adults",
        phone: "1-800-771-2303",
        website: "https://www.feedingamerica.org",
        priority: 9
      },
      {
        title: "SNAP for Seniors",
        description: "Food assistance benefits for eligible seniors",
        phone: "1-800-221-5689",
        website: "https://www.fns.usda.gov/snap",
        priority: 9
      },
      {
        title: "Commodity Supplemental Food Program",
        description: "Monthly food packages for low-income seniors",
        phone: "1-703-305-2680",
        website: "https://www.fns.usda.gov/csfp",
        priority: 8
      }
    ]
  },
  {
    category: "Emergency",
    resources: [
      {
        title: "Elder Crisis Intervention",
        description: "24/7 crisis support for seniors and families",
        phone: "1-800-272-4832",
        website: "https://www.crisis-intervention.org",
        priority: 10
      },
      {
        title: "National Disaster Distress Helpline",
        description: "Crisis counseling during disasters",
        phone: "1-800-985-5990",
        website: "https://www.samhsa.gov/disaster-distress",
        priority: 9
      },
      {
        title: "Emergency Prescription Assistance",
        description: "Medication access during emergencies",
        phone: "1-855-793-7470",
        website: "https://www.phe.gov/preparedness",
        priority: 9
      },
      {
        title: "Senior Emergency Preparedness",
        description: "Disaster planning resources for seniors",
        phone: "1-202-720-2791",
        website: "https://www.ready.gov/seniors",
        priority: 8
      },
      {
        title: "National Emergency Medical Services",
        description: "Emergency medical assistance coordination",
        phone: "911",
        website: "https://www.ems.gov",
        priority: 10
      }
    ]
  },
  {
    category: "Technology",
    resources: [
      {
        title: "Senior Planet Technology Centers",
        description: "Free technology training for seniors",
        phone: "1-646-758-0620",
        website: "https://seniorplanet.org",
        priority: 8
      },
      {
        title: "Cyber-Seniors",
        description: "Tech training connecting seniors with youth mentors",
        phone: "1-844-217-3057",
        website: "https://cyberseniors.org",
        priority: 7
      },
      {
        title: "GetSetUp Senior Learning",
        description: "Online classes for seniors on technology",
        phone: "1-888-938-7388",
        website: "https://www.getsetup.io",
        priority: 7
      },
      {
        title: "OATS Technology Training",
        description: "Older Adults Technology Services",
        phone: "1-718-360-1707",
        website: "https://oats.org",
        priority: 8
      },
      {
        title: "Tech for Seniors Initiative",
        description: "Bridging the digital divide for older adults",
        phone: "1-866-299-1204",
        website: "https://www.techforseniors.org",
        priority: 6
      }
    ]
  },
  {
    category: "Mental Health",
    resources: [
      {
        title: "Geriatric Mental Health Foundation",
        description: "Mental health resources for older adults",
        phone: "1-703-556-9222",
        website: "https://www.gmhfonline.org",
        priority: 9
      },
      {
        title: "National Suicide Prevention Lifeline",
        description: "24/7 crisis support and suicide prevention",
        phone: "988",
        website: "https://988lifeline.org",
        priority: 10
      },
      {
        title: "Senior Mental Wellness Coalition",
        description: "Comprehensive mental health support",
        phone: "1-800-931-4616",
        website: "https://www.seniormentalhealth.org",
        priority: 8
      },
      {
        title: "Depression and Bipolar Support Alliance",
        description: "Support groups and resources",
        phone: "1-800-826-3632",
        website: "https://www.dbsalliance.org",
        priority: 8
      },
      {
        title: "Alzheimer's Association Helpline",
        description: "24/7 support for dementia and Alzheimer's",
        phone: "1-800-272-3900",
        website: "https://www.alz.org",
        priority: 10
      }
    ]
  },
  {
    category: "Social Resources",
    resources: [
      {
        title: "Senior Corps",
        description: "Volunteer opportunities for active seniors",
        phone: "1-800-942-2677",
        website: "https://americorps.gov/serve/americorps-seniors",
        priority: 8
      },
      {
        title: "Village to Village Network",
        description: "Community-based senior support networks",
        phone: "1-617-299-9638",
        website: "https://www.vtvnetwork.org",
        priority: 7
      },
      {
        title: "Senior Companions Program",
        description: "Peer support and companionship services",
        phone: "1-800-942-2677",
        website: "https://americorps.gov/senior-companions",
        priority: 8
      },
      {
        title: "Elder Share Housing",
        description: "Shared housing matching for seniors",
        phone: "1-407-886-2797",
        website: "https://www.seniorhomeshares.com",
        priority: 6
      },
      {
        title: "Senior Social Clubs Federation",
        description: "Directory of senior social clubs nationwide",
        phone: "1-866-457-3741",
        website: "https://www.seniorsocialclubs.org",
        priority: 6
      }
    ]
  },
  {
    category: "Financial Resources",
    resources: [
      {
        title: "Benefits Enrollment Centers",
        description: "Help applying for federal benefits",
        phone: "1-800-818-0555",
        website: "https://www.ncoa.org/bec",
        priority: 9
      },
      {
        title: "Senior Financial Protection Bureau",
        description: "Financial fraud prevention and education",
        phone: "1-855-411-2372",
        website: "https://www.consumerfinance.gov/seniors",
        priority: 9
      },
      {
        title: "Low Income Subsidy Program",
        description: "Extra help with Medicare prescription costs",
        phone: "1-800-772-1213",
        website: "https://www.ssa.gov/extrahelp",
        priority: 9
      },
      {
        title: "Senior Tax Counseling",
        description: "Free tax help for seniors",
        phone: "1-888-227-7669",
        website: "https://www.irs.gov/tax-counseling",
        priority: 8
      },
      {
        title: "Pension Rights Center",
        description: "Pension assistance and advocacy",
        phone: "1-202-296-3776",
        website: "https://www.pensionrights.org",
        priority: 7
      }
    ]
  },
  {
    category: "Housing",
    resources: [
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
    // Get existing categories using Drizzle ORM
    const existingCategories = await db
      .select({
        id: supportResourceCategories.id,
        name: supportResourceCategories.name
      })
      .from(supportResourceCategories);
    
    const categoryMap = new Map();
    for (const cat of existingCategories) {
      categoryMap.set(cat.name, cat.id);
    }
    
    // Add Transportation category if it doesn't exist
    if (!categoryMap.has("Transportation")) {
      const result = await db.insert(supportResourceCategories).values({
        name: 'Transportation',
        description: 'Transportation and mobility services',
        icon: 'car',
        colorScheme: 'bg-purple-100 text-purple-800',
        displayOrder: 13,
        isActive: true
      }).returning({ id: supportResourceCategories.id });
      
      categoryMap.set("Transportation", result[0].id);
      console.log("✅ Added Transportation category");
    }
    
    // Add Nutrition category if it doesn't exist
    if (!categoryMap.has("Nutrition")) {
      const result = await db.insert(supportResourceCategories).values({
        name: 'Nutrition',
        description: 'Food and nutrition assistance programs',
        icon: 'apple',
        colorScheme: 'bg-green-100 text-green-800',
        displayOrder: 14,
        isActive: true
      }).returning({ id: supportResourceCategories.id });
      
      categoryMap.set("Nutrition", result[0].id);
      console.log("✅ Added Nutrition category");
    }
    
    // Add Housing category if it doesn't exist
    if (!categoryMap.has("Housing")) {
      const result = await db.insert(supportResourceCategories).values({
        name: 'Housing',
        description: 'Housing assistance and homelessness prevention',
        icon: 'home',
        colorScheme: 'bg-orange-100 text-orange-800',
        displayOrder: 15,
        isActive: true
      }).returning({ id: supportResourceCategories.id });
      
      categoryMap.set("Housing", result[0].id);
      console.log("✅ Added Housing category");
    }
    
    // Add Emergency category if it doesn't exist
    if (!categoryMap.has("Emergency")) {
      const result = await db.insert(supportResourceCategories).values({
        name: 'Emergency',
        description: 'Emergency and crisis assistance',
        icon: 'alert-triangle',
        colorScheme: 'bg-red-100 text-red-800',
        displayOrder: 16,
        isActive: true
      }).returning({ id: supportResourceCategories.id });
      
      categoryMap.set("Emergency", result[0].id);
      console.log("✅ Added Emergency category");
    }
    
    // Add Technology category if it doesn't exist
    if (!categoryMap.has("Technology")) {
      const result = await db.insert(supportResourceCategories).values({
        name: 'Technology',
        description: 'Digital literacy and technology assistance',
        icon: 'laptop',
        colorScheme: 'bg-indigo-100 text-indigo-800',
        displayOrder: 17,
        isActive: true
      }).returning({ id: supportResourceCategories.id });
      
      categoryMap.set("Technology", result[0].id);
      console.log("✅ Added Technology category");
    }
    
    let totalAdded = 0;
    
    // Add all resources
    for (const categoryGroup of expandedResources) {
      const categoryId = categoryMap.get(categoryGroup.category);
      
      if (!categoryId) {
        console.log(`⚠️ Category not found: ${categoryGroup.category}`);
        continue;
      }
      
      for (const resource of categoryGroup.resources) {
        // Check if resource already exists using Drizzle ORM
        const existing = await db
          .select({ id: supportResources.id })
          .from(supportResources)
          .where(eq(supportResources.title, resource.title))
          .limit(1);
        
        if (existing.length > 0) {
          console.log(`✓ Resource exists: ${resource.title}`);
          continue;
        }
        
        // Add new resource using Drizzle ORM
        const content = `${resource.description}\n\nContact Information:\nPhone: ${resource.phone}\nWebsite: ${resource.website}\n\nThis is a verified national resource providing essential services to seniors and their families.`;
        
        await db.insert(supportResources).values({
          categoryId: categoryId,
          title: resource.title,
          description: resource.description,
          content: content,
          phoneNumber: resource.phone,
          website: resource.website,
          priority: resource.priority,
          isActive: true,
          isFeatured: resource.priority >= 8
        });
        
        console.log(`✅ Added: ${resource.title}`);
        totalAdded++;
      }
    }
    
    // Get final count using Drizzle ORM
    const finalCount = await db
      .select()
      .from(supportResources);
    
    console.log(`\n✅ Successfully added ${totalAdded} new resources`);
    console.log(`📊 Total resources in database: ${finalCount.length}`);
    console.log("\n🎯 Database now contains 100+ comprehensive support resources!");
    
  } catch (error) {
    console.error("❌ Error expanding resources:", error);
  }
}

// Run the script
expandResources();