import { db } from "../db";

const additionalResources = [
  // PRESCRIPTION & MEDICATION ASSISTANCE
  {
    category: "Prescription",
    resources: [
      {
        title: "NeedyMeds",
        description: "Free information on medication assistance programs",
        phone: "1-800-503-6897",
        website: "https://www.needymeds.org",
        priority: 9
      },
      {
        title: "RxAssist",
        description: "Patient assistance program center",
        phone: "1-401-729-3284",
        website: "https://www.rxassist.org",
        priority: 8
      },
      {
        title: "Pharmaceutical Research and Manufacturers of America",
        description: "Medicine assistance tool for prescription help",
        phone: "1-888-477-2669",
        website: "https://www.phrma.org",
        priority: 8
      },
      {
        title: "SingleCare",
        description: "Free prescription discount card",
        phone: "1-844-234-3057",
        website: "https://www.singlecare.com",
        priority: 7
      },
      {
        title: "Blink Health",
        description: "Discounted prescription medications",
        phone: "1-844-366-2211",
        website: "https://www.blinkhealth.com",
        priority: 7
      }
    ]
  },
  
  // DENTAL & VISION
  {
    category: "Healthcare",
    resources: [
      {
        title: "Dental Lifeline Network",
        description: "Free dental care for elderly and disabled",
        phone: "1-866-454-8348",
        website: "https://dentallifeline.org",
        priority: 9
      },
      {
        title: "EyeCare America",
        description: "Free eye exams for seniors",
        phone: "1-877-887-6327",
        website: "https://www.aao.org/eyecare-america",
        priority: 9
      },
      {
        title: "Lions Clubs International",
        description: "Vision screening and eyeglass assistance",
        phone: "1-630-571-5466",
        website: "https://www.lionsclubs.org",
        priority: 8
      },
      {
        title: "Mission Cataract USA",
        description: "Free cataract surgery for those in need",
        phone: "1-800-343-7265",
        website: "https://missioncataractusa.org",
        priority: 8
      }
    ]
  },
  
  // SPECIFIC DISEASE SUPPORT
  {
    category: "Disease Support",
    resources: [
      {
        title: "Crohn's & Colitis Foundation",
        description: "Support for inflammatory bowel diseases",
        phone: "1-888-694-8872",
        website: "https://www.crohnscolitisfoundation.org",
        priority: 8
      },
      {
        title: "Epilepsy Foundation",
        description: "Resources and support for epilepsy",
        phone: "1-800-332-1000",
        website: "https://www.epilepsy.com",
        priority: 8
      },
      {
        title: "Pulmonary Fibrosis Foundation",
        description: "Support for pulmonary fibrosis patients",
        phone: "1-888-733-6741",
        website: "https://www.pulmonaryfibrosis.org",
        priority: 7
      },
      {
        title: "Scleroderma Foundation",
        description: "Support for scleroderma patients",
        phone: "1-800-722-4673",
        website: "https://www.scleroderma.org",
        priority: 7
      },
      {
        title: "Myasthenia Gravis Foundation",
        description: "Resources for myasthenia gravis patients",
        phone: "1-800-541-5454",
        website: "https://myasthenia.org",
        priority: 7
      }
    ]
  },
  
  // TECHNOLOGY & COMMUNICATION
  {
    category: "Technology",
    resources: [
      {
        title: "GetSetUp",
        description: "Live online classes for older adults",
        phone: "1-888-559-1614",
        website: "https://www.getsetup.io",
        priority: 8
      },
      {
        title: "Older Adults Technology Services (OATS)",
        description: "Technology training for seniors",
        phone: "1-920-734-1625",
        website: "https://oats.org",
        priority: 8
      },
      {
        title: "TechBoomers",
        description: "Free tutorials on websites and apps",
        phone: "1-519-489-4242",
        website: "https://techboomers.com",
        priority: 7
      }
    ]
  },
  
  // SPECIFIC VETERAN SERVICES
  {
    category: "Veterans",
    resources: [
      {
        title: "Paralyzed Veterans of America",
        description: "Support for paralyzed veterans",
        phone: "1-800-424-8200",
        website: "https://www.pva.org",
        priority: 9
      },
      {
        title: "Blinded Veterans Association",
        description: "Support for veterans with vision loss",
        phone: "1-800-669-7079",
        website: "https://www.bva.org",
        priority: 8
      },
      {
        title: "Veterans Community Living Centers",
        description: "State veterans homes nationwide",
        phone: "1-800-827-1000",
        website: "https://www.va.gov/GERIATRICS/pages/Veterans_Community_Living_Centers.asp",
        priority: 8
      },
      {
        title: "Hope For The Warriors",
        description: "Comprehensive support for combat wounded",
        phone: "1-877-246-7349",
        website: "https://www.hopeforthewarriors.org",
        priority: 8
      }
    ]
  },
  
  // LEGAL & FINANCIAL PLANNING
  {
    category: "Legal",
    resources: [
      {
        title: "National Consumer Law Center",
        description: "Consumer advocacy and legal assistance",
        phone: "1-617-542-8010",
        website: "https://www.nclc.org",
        priority: 8
      },
      {
        title: "Pension Rights Center",
        description: "Help with pension and retirement benefits",
        phone: "1-202-296-3776",
        website: "https://www.pensionrights.org",
        priority: 8
      },
      {
        title: "Center for Medicare Advocacy",
        description: "Medicare legal assistance and education",
        phone: "1-860-456-7790",
        website: "https://www.medicareadvocacy.org",
        priority: 9
      },
      {
        title: "Justice in Aging",
        description: "Legal advocacy for low-income seniors",
        phone: "1-202-289-6976",
        website: "https://justiceinaging.org",
        priority: 8
      }
    ]
  },
  
  // ADDITIONAL FINANCIAL RESOURCES
  {
    category: "Financial",
    resources: [
      {
        title: "Financial Planning Association",
        description: "Find certified financial planners",
        phone: "1-800-322-4237",
        website: "https://www.plannersearch.org",
        priority: 7
      },
      {
        title: "National Endowment for Financial Education",
        description: "Free financial literacy resources",
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
    // Get existing categories
    const existingCategories = await db.execute(
      `SELECT id, name FROM support_resource_categories`
    );
    
    const categoryMap = new Map();
    for (const cat of existingCategories.rows as any[]) {
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
    console.error("Error adding resources:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

addMoreResources();