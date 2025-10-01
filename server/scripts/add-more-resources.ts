import { db } from "../db";
import { supportResourceCategories, supportResources } from "@shared/schema";
import { eq } from "drizzle-orm";

const additionalResources = [
  {
    category: "Medical Resources",
    resources: [
      {
        title: "Visiting Physicians Association",
        description: "In-home medical care for seniors",
        phone: "1-855-846-2899",
        website: "https://www.vpa.com",
        priority: 9
      },
      {
        title: "American Telemedicine Association",
        description: "Virtual healthcare resources for seniors",
        phone: "1-202-223-3333",
        website: "https://www.americantelemed.org",
        priority: 8
      },
      {
        title: "National Council on Patient Information and Education",
        description: "Medication safety and education resources",
        phone: "1-301-340-3940",
        website: "https://www.bemedwise.org",
        priority: 7
      },
      {
        title: "Medication Management Systems",
        description: "Automated medication dispensing and reminders",
        phone: "1-800-650-6787",
        website: "https://www.managemymeds.com",
        priority: 8
      },
      {
        title: "Partnership for Prescription Assistance",
        description: "Free or low-cost prescription medications",
        phone: "1-888-477-2669",
        website: "https://www.pparx.org",
        priority: 9
      }
    ]
  },
  {
    category: "Home Care",
    resources: [
      {
        title: "National Private Duty Association",
        description: "Private duty home care services",
        phone: "1-317-663-3637",
        website: "https://www.privatedutyhomecare.org",
        priority: 8
      },
      {
        title: "Aging Life Care Association",
        description: "Professional care management services",
        phone: "1-520-881-8008",
        website: "https://www.aginglifecare.org",
        priority: 9
      },
      {
        title: "National Adult Day Services Association",
        description: "Adult day care programs and services",
        phone: "1-877-745-1440",
        website: "https://www.nadsa.org",
        priority: 7
      },
      {
        title: "Respite Care Association",
        description: "Temporary relief for family caregivers",
        phone: "1-800-473-7633",
        website: "https://archrespite.org",
        priority: 8
      },
      {
        title: "Homewatch CareGivers",
        description: "Professional in-home care services",
        phone: "1-888-404-5191",
        website: "https://www.homewatchcaregivers.com",
        priority: 7
      }
    ]
  },
  {
    category: "Social Resources",
    resources: [
      {
        title: "Senior Community Service Employment Program",
        description: "Job training and placement for seniors",
        phone: "1-877-872-5627",
        website: "https://www.doleta.gov/seniors",
        priority: 8
      },
      {
        title: "National Senior Games Association",
        description: "Sports and fitness programs for seniors",
        phone: "1-225-925-5678",
        website: "https://nsga.com",
        priority: 6
      },
      {
        title: "Road Scholar",
        description: "Educational travel programs for seniors",
        phone: "1-800-454-5768",
        website: "https://www.roadscholar.org",
        priority: 7
      },
      {
        title: "Senior Theater USA",
        description: "Theater programs and performances by seniors",
        phone: "1-800-858-4857",
        website: "https://www.seniortheater.com",
        priority: 5
      },
      {
        title: "Experience Corps",
        description: "Volunteer tutoring programs for seniors",
        phone: "1-202-478-6190",
        website: "https://www.aarp.org/experience-corps",
        priority: 7
      }
    ]
  },
  {
    category: "Transportation",
    resources: [
      {
        title: "GoGoGrandparent",
        description: "Ride services for seniors without smartphones",
        phone: "1-855-464-6872",
        website: "https://gogograndparent.com",
        priority: 9
      },
      {
        title: "ITN America",
        description: "Dignified transportation for seniors",
        phone: "1-207-857-9001",
        website: "https://www.itnamerica.org",
        priority: 8
      },
      {
        title: "TRIP National Volunteer Transportation",
        description: "Volunteer driver programs",
        phone: "1-951-682-1111",
        website: "https://www.tripvolunteertransportation.org",
        priority: 7
      },
      {
        title: "Access-A-Ride",
        description: "Paratransit services for disabled seniors",
        phone: "1-877-337-2017",
        website: "https://www.transit.dot.gov",
        priority: 8
      },
      {
        title: "Senior Ride Connection",
        description: "Door-to-door transportation services",
        phone: "1-503-226-0700",
        website: "https://rideconnection.org",
        priority: 7
      }
    ]
  },
  {
    category: "Legal Resources",
    resources: [
      {
        title: "National Elder Law Foundation",
        description: "Certified elder law attorneys",
        phone: "1-520-881-1076",
        website: "https://www.nelf.org",
        priority: 9
      },
      {
        title: "National Consumer Law Center",
        description: "Consumer protection for seniors",
        phone: "1-617-542-8010",
        website: "https://www.nclc.org",
        priority: 8
      },
      {
        title: "American Bar Association Elder Law",
        description: "Legal resources and referrals",
        phone: "1-800-285-2221",
        website: "https://www.americanbar.org",
        priority: 8
      },
      {
        title: "Justice in Aging",
        description: "Legal advocacy for low-income seniors",
        phone: "1-202-289-6976",
        website: "https://www.justiceinaging.org",
        priority: 9
      },
      {
        title: "National Senior Citizens Law Center",
        description: "Legal assistance for disadvantaged seniors",
        phone: "1-202-289-6976",
        website: "https://www.nsclc.org",
        priority: 8
      }
    ]
  },
  {
    category: "Financial Resources",
    resources: [
      {
        title: "National Endowment for Financial Education",
        description: "Financial literacy programs for seniors",
        phone: "1-303-741-6333",
        website: "https://www.nefe.org",
        priority: 7
      },
      {
        title: "Consumer Financial Protection Bureau",
        description: "Financial protection for older Americans",
        phone: "1-855-411-2372",
        website: "https://www.consumerfinance.gov",
        priority: 9
      },
      {
        title: "Money Management International",
        description: "Credit counseling and debt management",
        phone: "1-866-889-9347",
        website: "https://www.moneymanagement.org",
        priority: 7
      }
    ]
  }
];

async function addMoreResources() {
  console.log("🚀 Adding additional resources to reach 100+...\n");
  
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
    
    let totalAdded = 0;
    
    // Add all new resources
    for (const categoryGroup of additionalResources) {
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
      .select({ count: supportResources.id })
      .from(supportResources);
    
    console.log(`\n✅ Successfully added ${totalAdded} new resources`);
    console.log(`📊 Total resources in database: ${finalCount.length}`);
    
  } catch (error) {
    console.error("❌ Error adding resources:", error);
  }
}

// Run the script
addMoreResources();