import { db } from "../db";
import { supportResources, supportResourceCategories } from "@shared/schema";
import { eq } from "drizzle-orm";

async function populateResources() {
  console.log("Starting to populate resources database...");

  try {
    // First, create support resource categories
    const categories = [
      { name: "Healthcare", description: "Medical and health services", icon: "Stethoscope", color: "blue", displayOrder: 1 },
      { name: "Financial", description: "Financial assistance and benefits", icon: "DollarSign", color: "green", displayOrder: 2 },
      { name: "Veterans", description: "Veterans benefits and services", icon: "Shield", color: "red", displayOrder: 3 },
      { name: "Safety", description: "Safety and protection services", icon: "Shield", color: "rose", displayOrder: 4 },
      { name: "Support", description: "Support groups and organizations", icon: "Users", color: "purple", displayOrder: 5 },
      { name: "Nutrition", description: "Food assistance programs", icon: "ShoppingBasket", color: "orange", displayOrder: 6 },
      { name: "Transportation", description: "Transportation services", icon: "Car", color: "yellow", displayOrder: 7 },
      { name: "Housing", description: "Housing and home care", icon: "Home", color: "cyan", displayOrder: 8 },
      { name: "Emergency", description: "Crisis and emergency support", icon: "Phone", color: "red", displayOrder: 9 },
      { name: "Education", description: "Educational resources", icon: "GraduationCap", color: "indigo", displayOrder: 10 },
      { name: "Insurance", description: "Insurance information", icon: "Shield", color: "teal", displayOrder: 11 },
      { name: "Technology", description: "Technology assistance", icon: "Monitor", color: "purple", displayOrder: 12 },
      { name: "Communication", description: "Communication support", icon: "MessageSquare", color: "blue", displayOrder: 13 }
    ];

    console.log("Inserting categories...");
    const insertedCategories = [];
    for (const category of categories) {
      const existing = await db.select().from(supportResourceCategories)
        .where(eq(supportResourceCategories.name, category.name))
        .limit(1);
      
      if (existing.length === 0) {
        const [inserted] = await db.insert(supportResourceCategories).values(category).returning();
        insertedCategories.push(inserted);
        console.log(`✓ Added category: ${category.name}`);
      } else {
        insertedCategories.push(existing[0]);
        console.log(`✓ Category exists: ${category.name}`);
      }
    }

    // Map category names to IDs
    const categoryMap = {};
    for (const cat of insertedCategories) {
      categoryMap[cat.name] = cat.id;
    }

    // Now populate support resources
    const resources = [
      // Healthcare Resources
      {
        categoryId: categoryMap["Healthcare"],
        title: "Medicare",
        description: "Federal health insurance for people 65 or older",
        phoneNumber: "1-800-MEDICARE (1-800-633-4227)",
        website: "https://www.medicare.gov",
        availableHours: "24/7",
        eligibilityCriteria: "Age 65 or older, or certain disabilities",
        cost: "Free information",
        nationalHotline: true,
        priority: 10,
        icon: "Stethoscope",
        tags: ["Medicare", "Health Insurance", "Federal Program"],
        isActive: true
      },
      {
        categoryId: categoryMap["Healthcare"],
        title: "PACE Programs",
        description: "All-inclusive care for the elderly",
        phoneNumber: "1-855-435-7223",
        website: "https://www.medicare.gov/health-drug-plans/health-plans/your-health-plan-options/pace",
        availableHours: "Mon-Fri 8:00 AM - 5:00 PM ET",
        eligibilityCriteria: "Age 55+, need nursing home level care",
        cost: "Varies by income",
        nationalHotline: true,
        priority: 8,
        icon: "Heart",
        tags: ["PACE", "Comprehensive Care", "Medicare"],
        isActive: true
      },
      
      // Financial Resources
      {
        categoryId: categoryMap["Financial"],
        title: "Social Security Administration",
        description: "Retirement, disability, and survivor benefits",
        phoneNumber: "1-800-772-1213",
        website: "https://www.ssa.gov",
        availableHours: "Mon-Fri 8:00 AM - 7:00 PM",
        eligibilityCriteria: "US citizens and eligible residents",
        cost: "Free",
        nationalHotline: true,
        priority: 10,
        icon: "DollarSign",
        tags: ["Social Security", "Retirement", "Disability", "Benefits"],
        isActive: true
      },
      {
        categoryId: categoryMap["Financial"],
        title: "Extra Help/Low Income Subsidy",
        description: "Medicare prescription drug cost assistance",
        phoneNumber: "1-800-772-1213",
        website: "https://www.ssa.gov/medicare/prescriptionhelp",
        availableHours: "Mon-Fri 8:00 AM - 7:00 PM",
        eligibilityCriteria: "Limited income and resources",
        cost: "Free assistance",
        nationalHotline: true,
        priority: 8,
        icon: "Pill",
        tags: ["Medicare", "Prescription Help", "Financial Aid"],
        isActive: true
      },
      
      // Veterans Resources
      {
        categoryId: categoryMap["Veterans"],
        title: "VA Benefits Hotline",
        description: "Healthcare and benefits for military veterans",
        phoneNumber: "1-800-827-1000",
        website: "https://www.va.gov",
        availableHours: "Mon-Fri 8:00 AM - 9:00 PM ET",
        eligibilityCriteria: "Veterans with honorable discharge",
        cost: "Free for eligible veterans",
        nationalHotline: true,
        priority: 10,
        icon: "Shield",
        tags: ["Veterans", "VA", "Military", "Healthcare"],
        isActive: true
      },
      {
        categoryId: categoryMap["Veterans"],
        title: "Veterans Crisis Line",
        description: "24/7 confidential crisis support for veterans",
        phoneNumber: "1-800-273-8255 Press 1",
        website: "https://www.veteranscrisisline.net",
        availableHours: "24/7",
        eligibilityCriteria: "Veterans, service members, families",
        cost: "Free",
        nationalHotline: true,
        priority: 10,
        icon: "Phone",
        tags: ["Veterans", "Crisis", "Mental Health", "Emergency"],
        isActive: true
      },
      
      // Safety & Protection
      {
        categoryId: categoryMap["Safety"],
        title: "Adult Protective Services",
        description: "Report elder abuse and get protection services",
        phoneNumber: "1-800-677-1116",
        website: "https://acl.gov/programs/elder-justice/adult-protective-services",
        availableHours: "Mon-Fri 9:00 AM - 8:00 PM ET",
        eligibilityCriteria: "Adults 60+ experiencing abuse or neglect",
        cost: "Free",
        nationalHotline: true,
        priority: 10,
        icon: "Shield",
        tags: ["Elder Abuse", "Protection", "Safety"],
        isActive: true
      },
      {
        categoryId: categoryMap["Safety"],
        title: "Elder Abuse Hotline",
        description: "Report suspected elder abuse 24/7",
        phoneNumber: "1-800-252-8966",
        website: "https://www.justice.gov/elderjustice",
        availableHours: "24/7",
        eligibilityCriteria: "Anyone can report suspected abuse",
        cost: "Free",
        nationalHotline: true,
        priority: 10,
        icon: "Phone",
        tags: ["Elder Abuse", "Emergency", "Justice"],
        isActive: true
      },
      
      // Support Organizations
      {
        categoryId: categoryMap["Support"],
        title: "AARP",
        description: "Resources, advocacy, and benefits for 50+ adults",
        phoneNumber: "1-888-687-2277",
        website: "https://www.aarp.org",
        availableHours: "Mon-Fri 8:00 AM - 8:00 PM ET",
        eligibilityCriteria: "Adults 50+",
        cost: "Membership available",
        nationalHotline: true,
        priority: 9,
        icon: "Users",
        tags: ["AARP", "Senior Advocacy", "Resources"],
        isActive: true
      },
      {
        categoryId: categoryMap["Support"],
        title: "Alzheimer's Association",
        description: "24/7 helpline for dementia support and resources",
        phoneNumber: "1-800-272-3900",
        website: "https://www.alz.org",
        availableHours: "24/7",
        eligibilityCriteria: "Open to all",
        cost: "Free",
        nationalHotline: true,
        priority: 10,
        icon: "Brain",
        tags: ["Alzheimer's", "Dementia", "Memory Care", "Support"],
        isActive: true
      },
      {
        categoryId: categoryMap["Support"],
        title: "Parkinson's Foundation",
        description: "Support and resources for Parkinson's patients",
        phoneNumber: "1-800-473-4636",
        website: "https://www.parkinson.org",
        availableHours: "Mon-Fri 9:00 AM - 5:00 PM ET",
        eligibilityCriteria: "Parkinson's patients and families",
        cost: "Free",
        nationalHotline: true,
        priority: 8,
        icon: "Heart",
        tags: ["Parkinson's", "Movement Disorders", "Support"],
        isActive: true
      },
      {
        categoryId: categoryMap["Support"],
        title: "American Cancer Society",
        description: "24/7 cancer support, resources, and services",
        phoneNumber: "1-800-227-2345",
        website: "https://www.cancer.org",
        availableHours: "24/7",
        eligibilityCriteria: "Cancer patients and families",
        cost: "Free",
        nationalHotline: true,
        priority: 9,
        icon: "Heart",
        tags: ["Cancer", "Support", "Medical"],
        isActive: true
      },
      {
        categoryId: categoryMap["Support"],
        title: "Long-Term Care Ombudsman",
        description: "Advocates for residents in nursing homes & assisted living",
        phoneNumber: "1-800-252-2412",
        website: "https://theconsumervoice.org",
        availableHours: "Mon-Fri 9:00 AM - 5:00 PM",
        eligibilityCriteria: "Residents of long-term care facilities",
        cost: "Free",
        nationalHotline: true,
        priority: 8,
        icon: "Users",
        tags: ["Advocacy", "Nursing Homes", "Rights"],
        isActive: true
      },
      
      // Nutrition Programs
      {
        categoryId: categoryMap["Nutrition"],
        title: "SNAP (Food Stamps)",
        description: "Supplemental Nutrition Assistance Program",
        phoneNumber: "1-800-221-5689",
        website: "https://www.fns.usda.gov/snap",
        availableHours: "Mon-Fri 8:00 AM - 8:00 PM ET",
        eligibilityCriteria: "Income-based eligibility",
        cost: "Free benefits",
        nationalHotline: true,
        priority: 9,
        icon: "ShoppingBasket",
        tags: ["SNAP", "Food Stamps", "Nutrition", "Benefits"],
        isActive: true
      },
      {
        categoryId: categoryMap["Nutrition"],
        title: "Meals on Wheels America",
        description: "Home-delivered meals for homebound seniors",
        phoneNumber: "1-888-998-6325",
        website: "https://www.mealsonwheelsamerica.org",
        availableHours: "Mon-Fri 9:00 AM - 5:00 PM",
        eligibilityCriteria: "Homebound seniors 60+",
        cost: "Donation-based or sliding scale",
        nationalHotline: true,
        priority: 10,
        icon: "Utensils",
        tags: ["Meals", "Home Delivery", "Nutrition"],
        isActive: true
      },
      {
        categoryId: categoryMap["Nutrition"],
        title: "Feeding America",
        description: "Senior-specific food programs with home delivery",
        phoneNumber: "1-866-3-HUNGRY (1-866-348-6479)",
        website: "https://www.feedingamerica.org",
        availableHours: "Mon-Fri 7:00 AM - 10:00 PM ET",
        eligibilityCriteria: "Seniors with food insecurity",
        cost: "Free",
        nationalHotline: true,
        priority: 8,
        icon: "ShoppingBasket",
        tags: ["Food Banks", "Food Assistance", "Nutrition"],
        isActive: true
      },
      
      // Transportation
      {
        categoryId: categoryMap["Transportation"],
        title: "Eldercare Locator - Transportation",
        description: "Connect to local transportation services",
        phoneNumber: "1-800-677-1116",
        website: "https://eldercare.acl.gov",
        availableHours: "Mon-Fri 9:00 AM - 8:00 PM ET",
        eligibilityCriteria: "Seniors 60+",
        cost: "Free referrals",
        nationalHotline: true,
        priority: 8,
        icon: "Car",
        tags: ["Transportation", "Local Services", "Mobility"],
        isActive: true
      },
      {
        categoryId: categoryMap["Transportation"],
        title: "NEMT Services",
        description: "Non-emergency medical transportation",
        phoneNumber: "1-800-MEDICARE",
        website: "https://www.cms.gov/medicare",
        availableHours: "24/7",
        eligibilityCriteria: "Medicare beneficiaries",
        cost: "Covered by Medicare for eligible trips",
        nationalHotline: true,
        priority: 7,
        icon: "Car",
        tags: ["Medical Transport", "Medicare", "NEMT"],
        isActive: true
      },
      
      // Housing & Home Care
      {
        categoryId: categoryMap["Housing"],
        title: "Area Agency on Aging",
        description: "Local aging services and support programs",
        phoneNumber: "1-800-677-1116",
        website: "https://www.n4a.org",
        availableHours: "Mon-Fri 9:00 AM - 8:00 PM ET",
        eligibilityCriteria: "Adults 60+",
        cost: "Free",
        nationalHotline: true,
        priority: 9,
        icon: "Home",
        tags: ["AAA", "Local Services", "Aging"],
        isActive: true
      },
      {
        categoryId: categoryMap["Housing"],
        title: "HUD Housing for Seniors",
        description: "Affordable housing programs for seniors",
        phoneNumber: "1-800-955-2232",
        website: "https://www.hud.gov/topics/information_for_senior_citizens",
        availableHours: "Mon-Fri 8:00 AM - 8:00 PM ET",
        eligibilityCriteria: "Income-qualified seniors 62+",
        cost: "Income-based rent",
        nationalHotline: true,
        priority: 8,
        icon: "Building",
        tags: ["HUD", "Affordable Housing", "Section 202"],
        isActive: true
      },
      
      // Emergency Support
      {
        categoryId: categoryMap["Emergency"],
        title: "988 Suicide & Crisis Lifeline",
        description: "24/7 mental health crisis support",
        phoneNumber: "988",
        website: "https://988lifeline.org",
        availableHours: "24/7",
        eligibilityCriteria: "Anyone in crisis",
        cost: "Free",
        nationalHotline: true,
        priority: 10,
        icon: "Phone",
        tags: ["Crisis", "Mental Health", "Emergency", "Suicide Prevention"],
        isActive: true
      },
      
      // Education
      {
        categoryId: categoryMap["Education"],
        title: "OLLI (Osher Lifelong Learning)",
        description: "Educational programs for adults 50+",
        phoneNumber: "1-800-677-1116",
        website: "https://www.osher.net",
        availableHours: "Varies by location",
        eligibilityCriteria: "Adults 50+",
        cost: "Membership fees vary",
        nationalHotline: false,
        priority: 6,
        icon: "GraduationCap",
        tags: ["Education", "Lifelong Learning", "Classes"],
        isActive: true
      },
      {
        categoryId: categoryMap["Education"],
        title: "NIH Senior Health",
        description: "Health information from National Institutes",
        phoneNumber: "1-800-222-2225",
        website: "https://www.nia.nih.gov",
        availableHours: "Mon-Fri 8:30 AM - 5:00 PM ET",
        eligibilityCriteria: "Open to all",
        cost: "Free",
        nationalHotline: true,
        priority: 7,
        icon: "Book",
        tags: ["Health Education", "NIH", "Research"],
        isActive: true
      },
      
      // Technology
      {
        categoryId: categoryMap["Technology"],
        title: "Senior Planet",
        description: "Technology training and digital literacy for seniors",
        phoneNumber: "1-888-713-3495",
        website: "https://seniorplanet.org",
        availableHours: "Mon-Fri 9:00 AM - 5:00 PM ET",
        eligibilityCriteria: "Adults 60+",
        cost: "Free and paid programs",
        nationalHotline: true,
        priority: 7,
        icon: "Monitor",
        tags: ["Technology", "Digital Literacy", "Training"],
        isActive: true
      },
      
      // Insurance
      {
        categoryId: categoryMap["Insurance"],
        title: "SHIP (Medicare Counseling)",
        description: "Free Medicare counseling and assistance",
        phoneNumber: "1-877-839-2675",
        website: "https://www.shiphelp.org",
        availableHours: "Mon-Fri 9:00 AM - 5:00 PM",
        eligibilityCriteria: "Medicare beneficiaries",
        cost: "Free",
        nationalHotline: true,
        priority: 9,
        icon: "Shield",
        tags: ["Medicare", "Insurance", "Counseling", "SHIP"],
        isActive: true
      },
      {
        categoryId: categoryMap["Insurance"],
        title: "MediGap/Supplemental Insurance",
        description: "Medicare supplement insurance information",
        phoneNumber: "1-800-MEDICARE",
        website: "https://www.medicare.gov/supplements-other-insurance",
        availableHours: "24/7",
        eligibilityCriteria: "Medicare beneficiaries",
        cost: "Free information",
        nationalHotline: true,
        priority: 7,
        icon: "Shield",
        tags: ["MediGap", "Medicare Supplement", "Insurance"],
        isActive: true
      },
      
      // Communication Support
      {
        categoryId: categoryMap["Communication"],
        title: "Relay Services (711)",
        description: "Phone relay for deaf/hard of hearing",
        phoneNumber: "711",
        website: "https://www.fcc.gov/consumers/guides/telecommunications-relay-service-trs",
        availableHours: "24/7",
        eligibilityCriteria: "Hearing or speech impaired",
        cost: "Free",
        nationalHotline: true,
        priority: 8,
        icon: "Phone",
        tags: ["Accessibility", "Deaf", "Communication"],
        isActive: true
      },
      {
        categoryId: categoryMap["Communication"],
        title: "Language Line Solutions",
        description: "Interpretation services for non-English speakers",
        phoneNumber: "1-866-874-3972",
        website: "https://www.languageline.com",
        availableHours: "24/7",
        eligibilityCriteria: "Non-English speakers",
        cost: "May be covered by healthcare provider",
        nationalHotline: true,
        priority: 6,
        icon: "MessageSquare",
        tags: ["Translation", "Language", "Interpretation"],
        isActive: true
      }
    ];

    console.log("\nInserting support resources...");
    let addedCount = 0;
    for (const resource of resources) {
      const existing = await db.select().from(supportResources)
        .where(eq(supportResources.title, resource.title))
        .limit(1);
      
      if (existing.length === 0) {
        await db.insert(supportResources).values(resource);
        console.log(`✓ Added resource: ${resource.title}`);
        addedCount++;
      } else {
        console.log(`✓ Resource exists: ${resource.title}`);
      }
    }

    console.log(`\n✅ Successfully populated resources database!`);
    console.log(`   - Categories: ${insertedCategories.length}`);
    console.log(`   - New Resources Added: ${addedCount}`);
    console.log(`   - Total Resources: ${resources.length}`);
    
  } catch (error) {
    console.error("Error populating resources:", error);
    process.exit(1);
  }

  process.exit(0);
}

populateResources();