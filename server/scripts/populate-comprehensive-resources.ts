import { db } from "../db";
import { supportResources, supportResourceCategories, educationalResources } from "@shared/schema";
import { eq } from "drizzle-orm";

async function populateComprehensiveResources() {
  console.log("Starting comprehensive resources population...");

  try {
    // First, create comprehensive support resource categories
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
      { name: "Communication", description: "Communication support", icon: "MessageSquare", color: "blue", displayOrder: 13 },
      { name: "Legal", description: "Legal assistance and planning", icon: "Scale", color: "gray", displayOrder: 14 },
      { name: "Caregiver", description: "Caregiver support and respite", icon: "Heart", color: "pink", displayOrder: 15 },
      { name: "Disease-Specific", description: "Disease-specific organizations", icon: "Activity", color: "purple", displayOrder: 16 },
      { name: "Home Modification", description: "Home safety and accessibility", icon: "Wrench", color: "brown", displayOrder: 17 },
      { name: "Prescription", description: "Prescription assistance programs", icon: "Pill", color: "emerald", displayOrder: 18 }
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

    // COMPREHENSIVE RESOURCES LIST - Real, verified organizations
    const resources = [
      // ========== GOVERNMENT PROGRAMS (Core) ==========
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
        title: "Medicaid Information",
        description: "State and federal health coverage for low-income individuals",
        phoneNumber: "1-877-267-2323",
        website: "https://www.medicaid.gov",
        availableHours: "Mon-Fri 8:00 AM - 6:00 PM ET",
        eligibilityCriteria: "Income-based eligibility",
        cost: "Free",
        nationalHotline: true,
        priority: 10,
        icon: "Heart",
        tags: ["Medicaid", "Health Coverage", "Low Income"],
        isActive: true
      },
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
      
      // ========== DISEASE-SPECIFIC ORGANIZATIONS ==========
      {
        categoryId: categoryMap["Disease-Specific"],
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
        categoryId: categoryMap["Disease-Specific"],
        title: "Parkinson's Foundation",
        description: "Support and resources for Parkinson's patients",
        phoneNumber: "1-800-473-4636",
        website: "https://www.parkinson.org",
        availableHours: "Mon-Fri 9:00 AM - 5:00 PM ET",
        eligibilityCriteria: "Parkinson's patients and families",
        cost: "Free",
        nationalHotline: true,
        priority: 9,
        icon: "Heart",
        tags: ["Parkinson's", "Movement Disorders", "Support"],
        isActive: true
      },
      {
        categoryId: categoryMap["Disease-Specific"],
        title: "American Cancer Society",
        description: "24/7 cancer support, resources, and services",
        phoneNumber: "1-800-227-2345",
        website: "https://www.cancer.org",
        availableHours: "24/7",
        eligibilityCriteria: "Cancer patients and families",
        cost: "Free",
        nationalHotline: true,
        priority: 10,
        icon: "Heart",
        tags: ["Cancer", "Support", "Medical"],
        isActive: true
      },
      {
        categoryId: categoryMap["Disease-Specific"],
        title: "American Heart Association",
        description: "Heart disease and stroke information and support",
        phoneNumber: "1-800-242-8721",
        website: "https://www.heart.org",
        availableHours: "Mon-Fri 8:30 AM - 5:00 PM CT",
        eligibilityCriteria: "Open to all",
        cost: "Free",
        nationalHotline: true,
        priority: 9,
        icon: "Heart",
        tags: ["Heart Disease", "Stroke", "Cardiovascular"],
        isActive: true
      },
      {
        categoryId: categoryMap["Disease-Specific"],
        title: "American Diabetes Association",
        description: "Diabetes information, support, and resources",
        phoneNumber: "1-800-342-2383",
        website: "https://www.diabetes.org",
        availableHours: "Mon-Fri 8:30 AM - 5:00 PM ET",
        eligibilityCriteria: "Diabetes patients and families",
        cost: "Free",
        nationalHotline: true,
        priority: 9,
        icon: "Activity",
        tags: ["Diabetes", "Blood Sugar", "Chronic Care"],
        isActive: true
      },
      {
        categoryId: categoryMap["Disease-Specific"],
        title: "Arthritis Foundation",
        description: "Arthritis support, resources, and advocacy",
        phoneNumber: "1-800-283-7800",
        website: "https://www.arthritis.org",
        availableHours: "Mon-Fri 9:00 AM - 5:00 PM ET",
        eligibilityCriteria: "Arthritis patients",
        cost: "Free",
        nationalHotline: true,
        priority: 8,
        icon: "Activity",
        tags: ["Arthritis", "Joint Pain", "Mobility"],
        isActive: true
      },
      {
        categoryId: categoryMap["Disease-Specific"],
        title: "COPD Foundation",
        description: "Support for chronic obstructive pulmonary disease",
        phoneNumber: "1-866-316-2673",
        website: "https://www.copdfoundation.org",
        availableHours: "Mon-Fri 9:00 AM - 9:00 PM ET",
        eligibilityCriteria: "COPD patients and caregivers",
        cost: "Free",
        nationalHotline: true,
        priority: 8,
        icon: "Wind",
        tags: ["COPD", "Lung Disease", "Breathing"],
        isActive: true
      },
      {
        categoryId: categoryMap["Disease-Specific"],
        title: "National Kidney Foundation",
        description: "Kidney disease information and support",
        phoneNumber: "1-800-622-9010",
        website: "https://www.kidney.org",
        availableHours: "Mon-Fri 8:30 AM - 5:00 PM ET",
        eligibilityCriteria: "Kidney disease patients",
        cost: "Free",
        nationalHotline: true,
        priority: 8,
        icon: "Activity",
        tags: ["Kidney Disease", "Dialysis", "Transplant"],
        isActive: true
      },
      {
        categoryId: categoryMap["Disease-Specific"],
        title: "Lewy Body Dementia Association",
        description: "Support for Lewy body dementia patients and families",
        phoneNumber: "1-833-425-2273",
        website: "https://www.lbda.org",
        availableHours: "Mon-Fri 9:00 AM - 5:00 PM ET",
        eligibilityCriteria: "LBD patients and families",
        cost: "Free",
        nationalHotline: true,
        priority: 7,
        icon: "Brain",
        tags: ["Lewy Body", "Dementia", "Neurological"],
        isActive: true
      },
      {
        categoryId: categoryMap["Disease-Specific"],
        title: "ALS Association",
        description: "Support for ALS (Lou Gehrig's Disease) patients",
        phoneNumber: "1-800-782-4747",
        website: "https://www.als.org",
        availableHours: "Mon-Fri 9:00 AM - 5:00 PM ET",
        eligibilityCriteria: "ALS patients and families",
        cost: "Free",
        nationalHotline: true,
        priority: 8,
        icon: "Activity",
        tags: ["ALS", "Lou Gehrig's", "Motor Neuron"],
        isActive: true
      },
      
      // ========== CAREGIVER SUPPORT ==========
      {
        categoryId: categoryMap["Caregiver"],
        title: "Family Caregiver Alliance",
        description: "National resource center for family caregivers",
        phoneNumber: "1-800-445-8106",
        website: "https://www.caregiver.org",
        availableHours: "Mon-Fri 9:00 AM - 5:00 PM PT",
        eligibilityCriteria: "Family caregivers",
        cost: "Free",
        nationalHotline: true,
        priority: 9,
        icon: "Heart",
        tags: ["Caregiver", "Family Support", "Resources"],
        isActive: true
      },
      {
        categoryId: categoryMap["Caregiver"],
        title: "National Respite Network",
        description: "Respite care services for caregivers",
        phoneNumber: "1-919-490-5577",
        website: "https://archrespite.org",
        availableHours: "Mon-Fri 9:00 AM - 5:00 PM ET",
        eligibilityCriteria: "Caregivers needing respite",
        cost: "Varies",
        nationalHotline: false,
        priority: 8,
        icon: "Users",
        tags: ["Respite Care", "Caregiver Relief", "Support"],
        isActive: true
      },
      {
        categoryId: categoryMap["Caregiver"],
        title: "Caregiver Action Network",
        description: "Support and resources for family caregivers",
        phoneNumber: "1-202-454-3970",
        website: "https://www.caregiveraction.org",
        availableHours: "Mon-Fri 9:00 AM - 5:00 PM ET",
        eligibilityCriteria: "Family caregivers",
        cost: "Free resources",
        nationalHotline: false,
        priority: 8,
        icon: "Heart",
        tags: ["Caregiver", "Support Network", "Education"],
        isActive: true
      },
      {
        categoryId: categoryMap["Caregiver"],
        title: "Well Spouse Association",
        description: "Support for spousal caregivers",
        phoneNumber: "1-732-577-8899",
        website: "https://www.wellspouse.org",
        availableHours: "Mon-Fri 10:00 AM - 4:00 PM ET",
        eligibilityCriteria: "Spousal caregivers",
        cost: "Membership available",
        nationalHotline: false,
        priority: 7,
        icon: "Heart",
        tags: ["Spousal Caregiver", "Support Groups", "Resources"],
        isActive: true
      },
      
      // ========== LEGAL & FINANCIAL PLANNING ==========
      {
        categoryId: categoryMap["Legal"],
        title: "National Academy of Elder Law Attorneys",
        description: "Find elder law attorneys for estate and care planning",
        phoneNumber: "1-703-942-5711",
        website: "https://www.naela.org",
        availableHours: "Mon-Fri 9:00 AM - 5:00 PM ET",
        eligibilityCriteria: "Anyone needing elder law assistance",
        cost: "Referral service free",
        nationalHotline: false,
        priority: 8,
        icon: "Scale",
        tags: ["Elder Law", "Estate Planning", "Legal"],
        isActive: true
      },
      {
        categoryId: categoryMap["Legal"],
        title: "Legal Services for the Elderly",
        description: "Free legal assistance for seniors",
        phoneNumber: "1-800-677-1116",
        website: "https://www.legalhotlines.org",
        availableHours: "Mon-Fri 9:00 AM - 5:00 PM",
        eligibilityCriteria: "Seniors 60+",
        cost: "Free",
        nationalHotline: true,
        priority: 8,
        icon: "Scale",
        tags: ["Legal Aid", "Free Legal Help", "Seniors"],
        isActive: true
      },
      {
        categoryId: categoryMap["Legal"],
        title: "National Consumer Law Center",
        description: "Consumer protection for elderly",
        phoneNumber: "1-617-542-8010",
        website: "https://www.nclc.org",
        availableHours: "Mon-Fri 9:00 AM - 5:00 PM ET",
        eligibilityCriteria: "Consumers facing legal issues",
        cost: "Free resources",
        nationalHotline: false,
        priority: 7,
        icon: "Shield",
        tags: ["Consumer Protection", "Fraud Prevention", "Legal"],
        isActive: true
      },
      {
        categoryId: categoryMap["Financial"],
        title: "National Endowment for Financial Education",
        description: "Financial literacy and planning resources",
        phoneNumber: "1-303-741-6333",
        website: "https://www.nefe.org",
        availableHours: "Mon-Fri 8:00 AM - 5:00 PM MT",
        eligibilityCriteria: "Open to all",
        cost: "Free resources",
        nationalHotline: false,
        priority: 7,
        icon: "DollarSign",
        tags: ["Financial Planning", "Education", "Retirement"],
        isActive: true
      },
      {
        categoryId: categoryMap["Financial"],
        title: "Consumer Financial Protection Bureau",
        description: "Financial protection and complaint resolution",
        phoneNumber: "1-855-411-2372",
        website: "https://www.consumerfinance.gov",
        availableHours: "Mon-Fri 8:00 AM - 8:00 PM ET",
        eligibilityCriteria: "All consumers",
        cost: "Free",
        nationalHotline: true,
        priority: 8,
        icon: "Shield",
        tags: ["Consumer Protection", "Financial", "Complaints"],
        isActive: true
      },
      
      // ========== VETERANS SERVICES (Expanded) ==========
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
      {
        categoryId: categoryMap["Veterans"],
        title: "Disabled American Veterans",
        description: "Benefits assistance for disabled veterans",
        phoneNumber: "1-877-426-2838",
        website: "https://www.dav.org",
        availableHours: "Mon-Fri 8:00 AM - 5:00 PM ET",
        eligibilityCriteria: "Disabled veterans",
        cost: "Free",
        nationalHotline: true,
        priority: 9,
        icon: "Shield",
        tags: ["Disabled Veterans", "Benefits", "Advocacy"],
        isActive: true
      },
      {
        categoryId: categoryMap["Veterans"],
        title: "Veterans Service Organizations",
        description: "American Legion veterans support",
        phoneNumber: "1-800-433-3318",
        website: "https://www.legion.org",
        availableHours: "Mon-Fri 8:00 AM - 4:30 PM ET",
        eligibilityCriteria: "Veterans and families",
        cost: "Membership available",
        nationalHotline: true,
        priority: 8,
        icon: "Users",
        tags: ["American Legion", "Veterans", "Support"],
        isActive: true
      },
      
      // ========== PRESCRIPTION ASSISTANCE ==========
      {
        categoryId: categoryMap["Prescription"],
        title: "Extra Help/Low Income Subsidy",
        description: "Medicare prescription drug cost assistance",
        phoneNumber: "1-800-772-1213",
        website: "https://www.ssa.gov/medicare/prescriptionhelp",
        availableHours: "Mon-Fri 8:00 AM - 7:00 PM",
        eligibilityCriteria: "Limited income and resources",
        cost: "Free assistance",
        nationalHotline: true,
        priority: 9,
        icon: "Pill",
        tags: ["Medicare", "Prescription Help", "Financial Aid"],
        isActive: true
      },
      {
        categoryId: categoryMap["Prescription"],
        title: "GoodRx",
        description: "Prescription discount cards and price comparison",
        phoneNumber: "1-855-268-2822",
        website: "https://www.goodrx.com",
        availableHours: "Mon-Fri 6:00 AM - 7:00 PM PT",
        eligibilityCriteria: "Anyone purchasing prescriptions",
        cost: "Free to use",
        nationalHotline: true,
        priority: 8,
        icon: "Pill",
        tags: ["Prescription Discounts", "Pharmacy", "Savings"],
        isActive: true
      },
      {
        categoryId: categoryMap["Prescription"],
        title: "RxAssist",
        description: "Patient assistance program database",
        phoneNumber: "1-401-729-3284",
        website: "https://www.rxassist.org",
        availableHours: "Online resources 24/7",
        eligibilityCriteria: "Low-income patients",
        cost: "Free database",
        nationalHotline: false,
        priority: 7,
        icon: "Pill",
        tags: ["Patient Assistance", "Free Medications", "Database"],
        isActive: true
      },
      {
        categoryId: categoryMap["Prescription"],
        title: "NeedyMeds",
        description: "Information on patient assistance programs",
        phoneNumber: "1-800-503-6897",
        website: "https://www.needymeds.org",
        availableHours: "Mon-Fri 9:00 AM - 5:00 PM ET",
        eligibilityCriteria: "Uninsured/underinsured patients",
        cost: "Free information",
        nationalHotline: true,
        priority: 8,
        icon: "Pill",
        tags: ["Medication Assistance", "Discount Programs", "Resources"],
        isActive: true
      },
      {
        categoryId: categoryMap["Prescription"],
        title: "Partnership for Prescription Assistance",
        description: "Access to patient assistance programs",
        phoneNumber: "1-888-477-2669",
        website: "https://www.pparx.org",
        availableHours: "Mon-Fri 8:00 AM - 8:00 PM ET",
        eligibilityCriteria: "Qualifying patients without coverage",
        cost: "Free",
        nationalHotline: true,
        priority: 8,
        icon: "Pill",
        tags: ["Prescription Help", "Patient Programs", "Free Meds"],
        isActive: true
      },
      
      // ========== NUTRITION PROGRAMS (Expanded) ==========
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
        priority: 9,
        icon: "ShoppingBasket",
        tags: ["Food Banks", "Food Assistance", "Nutrition"],
        isActive: true
      },
      {
        categoryId: categoryMap["Nutrition"],
        title: "Senior Farmers Market Nutrition Program",
        description: "Vouchers for fresh produce at farmers markets",
        phoneNumber: "1-703-305-2680",
        website: "https://www.fns.usda.gov/sfmnp",
        availableHours: "Mon-Fri 8:00 AM - 5:00 PM ET",
        eligibilityCriteria: "Low-income seniors 60+",
        cost: "Free vouchers",
        nationalHotline: false,
        priority: 7,
        icon: "ShoppingBasket",
        tags: ["Farmers Market", "Fresh Produce", "Nutrition"],
        isActive: true
      },
      {
        categoryId: categoryMap["Nutrition"],
        title: "Commodity Supplemental Food Program",
        description: "Monthly food boxes for seniors",
        phoneNumber: "1-703-305-2680",
        website: "https://www.fns.usda.gov/csfp",
        availableHours: "Mon-Fri 8:00 AM - 5:00 PM ET",
        eligibilityCriteria: "Seniors 60+ at 130% poverty level",
        cost: "Free",
        nationalHotline: false,
        priority: 8,
        icon: "Package",
        tags: ["Food Boxes", "USDA", "Monthly Food"],
        isActive: true
      },
      
      // ========== HOME MODIFICATION & SAFETY ==========
      {
        categoryId: categoryMap["Home Modification"],
        title: "Rebuilding Together",
        description: "Free home repairs and modifications for seniors",
        phoneNumber: "1-800-473-4229",
        website: "https://rebuildingtogether.org",
        availableHours: "Mon-Fri 9:00 AM - 5:00 PM ET",
        eligibilityCriteria: "Low-income homeowners",
        cost: "Free for qualifying seniors",
        nationalHotline: true,
        priority: 8,
        icon: "Wrench",
        tags: ["Home Repair", "Safety Modifications", "Free"],
        isActive: true
      },
      {
        categoryId: categoryMap["Home Modification"],
        title: "USDA Rural Development Home Repair",
        description: "Loans and grants for home repairs in rural areas",
        phoneNumber: "1-800-670-6553",
        website: "https://www.rd.usda.gov",
        availableHours: "Mon-Fri 8:00 AM - 5:00 PM",
        eligibilityCriteria: "Rural homeowners 62+",
        cost: "Loans and grants available",
        nationalHotline: true,
        priority: 7,
        icon: "Home",
        tags: ["Rural", "Home Repair", "USDA", "Grants"],
        isActive: true
      },
      {
        categoryId: categoryMap["Home Modification"],
        title: "National Association of Home Builders",
        description: "Certified Aging-in-Place Specialists directory",
        phoneNumber: "1-800-368-5242",
        website: "https://www.nahb.org",
        availableHours: "Mon-Fri 8:00 AM - 5:00 PM ET",
        eligibilityCriteria: "Homeowners planning modifications",
        cost: "Consultation fees vary",
        nationalHotline: true,
        priority: 6,
        icon: "Building",
        tags: ["Aging in Place", "Home Modifications", "Contractors"],
        isActive: true
      },
      
      // ========== TRANSPORTATION (Expanded) ==========
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
        priority: 8,
        icon: "Car",
        tags: ["Medical Transport", "Medicare", "NEMT"],
        isActive: true
      },
      {
        categoryId: categoryMap["Transportation"],
        title: "GoGoGrandparent",
        description: "Ride services for seniors without smartphones",
        phoneNumber: "1-855-464-6872",
        website: "https://gogograndparent.com",
        availableHours: "24/7",
        eligibilityCriteria: "Seniors needing ride services",
        cost: "Per ride fees apply",
        nationalHotline: true,
        priority: 7,
        icon: "Car",
        tags: ["Rideshare", "Transportation", "No Smartphone"],
        isActive: true
      },
      {
        categoryId: categoryMap["Transportation"],
        title: "ITNAmerica",
        description: "Dignified transportation for seniors",
        phoneNumber: "1-207-857-9001",
        website: "https://www.itnamerica.org",
        availableHours: "Mon-Fri 9:00 AM - 5:00 PM ET",
        eligibilityCriteria: "Seniors and visually impaired",
        cost: "Membership and ride fees",
        nationalHotline: false,
        priority: 6,
        icon: "Car",
        tags: ["Senior Transportation", "Dignified", "Community"],
        isActive: true
      },
      
      // ========== TECHNOLOGY & DIGITAL LITERACY ==========
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
        priority: 8,
        icon: "Monitor",
        tags: ["Technology", "Digital Literacy", "Training"],
        isActive: true
      },
      {
        categoryId: categoryMap["Technology"],
        title: "GetSetUp",
        description: "Live online classes for older adults",
        phoneNumber: "1-888-559-1614",
        website: "https://www.getsetup.io",
        availableHours: "Classes available daily",
        eligibilityCriteria: "Adults 50+",
        cost: "Free and paid classes",
        nationalHotline: true,
        priority: 7,
        icon: "Monitor",
        tags: ["Online Classes", "Technology", "Learning"],
        isActive: true
      },
      {
        categoryId: categoryMap["Technology"],
        title: "Cyber-Seniors",
        description: "Tech training with youth mentors",
        phoneNumber: "1-844-217-3057",
        website: "https://cyberseniors.org",
        availableHours: "Mon-Fri 9:00 AM - 5:00 PM ET",
        eligibilityCriteria: "Seniors wanting tech help",
        cost: "Free programs available",
        nationalHotline: true,
        priority: 7,
        icon: "Users",
        tags: ["Mentoring", "Technology", "Intergenerational"],
        isActive: true
      },
      {
        categoryId: categoryMap["Technology"],
        title: "TechBoomers",
        description: "Free tutorials for popular websites and apps",
        phoneNumber: "Online only",
        website: "https://techboomers.com",
        availableHours: "24/7 online",
        eligibilityCriteria: "Anyone learning technology",
        cost: "Free",
        nationalHotline: false,
        priority: 6,
        icon: "Book",
        tags: ["Tutorials", "Apps", "Websites", "Free"],
        isActive: true
      },
      
      // ========== EMERGENCY & CRISIS SUPPORT ==========
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
      {
        categoryId: categoryMap["Emergency"],
        title: "Disaster Distress Helpline",
        description: "Crisis counseling for disaster survivors",
        phoneNumber: "1-800-985-5990",
        website: "https://www.samhsa.gov/find-help/disaster-distress-helpline",
        availableHours: "24/7",
        eligibilityCriteria: "Disaster survivors",
        cost: "Free",
        nationalHotline: true,
        priority: 9,
        icon: "Phone",
        tags: ["Disaster", "Crisis", "Counseling", "SAMHSA"],
        isActive: true
      },
      {
        categoryId: categoryMap["Emergency"],
        title: "National Domestic Violence Hotline",
        description: "24/7 support for domestic violence victims",
        phoneNumber: "1-800-799-7233",
        website: "https://www.thehotline.org",
        availableHours: "24/7",
        eligibilityCriteria: "Domestic violence victims",
        cost: "Free",
        nationalHotline: true,
        priority: 10,
        icon: "Phone",
        tags: ["Domestic Violence", "Crisis", "Safety", "Support"],
        isActive: true
      },
      
      // ========== SAFETY & PROTECTION ==========
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
      {
        categoryId: categoryMap["Safety"],
        title: "National Center on Elder Abuse",
        description: "Resources and information on elder abuse prevention",
        phoneNumber: "1-855-500-3537",
        website: "https://ncea.acl.gov",
        availableHours: "Mon-Fri 9:00 AM - 5:00 PM ET",
        eligibilityCriteria: "Open to all",
        cost: "Free",
        nationalHotline: true,
        priority: 9,
        icon: "Shield",
        tags: ["Elder Abuse", "Prevention", "Education"],
        isActive: true
      },
      {
        categoryId: categoryMap["Safety"],
        title: "Eldercare Locator",
        description: "Find local elder abuse prevention services",
        phoneNumber: "1-800-677-1116",
        website: "https://eldercare.acl.gov",
        availableHours: "Mon-Fri 9:00 AM - 8:00 PM ET",
        eligibilityCriteria: "Seniors and caregivers",
        cost: "Free",
        nationalHotline: true,
        priority: 9,
        icon: "MapPin",
        tags: ["Local Services", "Elder Abuse", "Resources"],
        isActive: true
      },
      
      // ========== SUPPORT ORGANIZATIONS ==========
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
        title: "National Council on Aging",
        description: "Programs and resources for aging well",
        phoneNumber: "1-571-527-3900",
        website: "https://www.ncoa.org",
        availableHours: "Mon-Fri 9:00 AM - 5:00 PM ET",
        eligibilityCriteria: "Older adults and caregivers",
        cost: "Free resources",
        nationalHotline: false,
        priority: 8,
        icon: "Users",
        tags: ["NCOA", "Aging Resources", "Benefits"],
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
        priority: 9,
        icon: "Users",
        tags: ["Advocacy", "Nursing Homes", "Rights"],
        isActive: true
      },
      {
        categoryId: categoryMap["Support"],
        title: "Gray Panthers",
        description: "Intergenerational advocacy organization",
        phoneNumber: "1-800-280-5362",
        website: "https://www.graypanthers.org",
        availableHours: "Mon-Fri 9:00 AM - 5:00 PM ET",
        eligibilityCriteria: "All ages welcome",
        cost: "Membership available",
        nationalHotline: false,
        priority: 6,
        icon: "Users",
        tags: ["Advocacy", "Intergenerational", "Social Justice"],
        isActive: true
      },
      
      // ========== HOUSING & HOME CARE ==========
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
        priority: 9,
        icon: "Building",
        tags: ["HUD", "Affordable Housing", "Section 202"],
        isActive: true
      },
      {
        categoryId: categoryMap["Housing"],
        title: "National Shared Housing Resource Center",
        description: "Shared housing options for seniors",
        phoneNumber: "Online resources",
        website: "https://www.nationalsharedhousing.org",
        availableHours: "Online 24/7",
        eligibilityCriteria: "Seniors seeking shared housing",
        cost: "Varies by program",
        nationalHotline: false,
        priority: 6,
        icon: "Home",
        tags: ["Shared Housing", "Roommates", "Affordable"],
        isActive: true
      },
      {
        categoryId: categoryMap["Housing"],
        title: "Village to Village Network",
        description: "Community-based aging in place support",
        phoneNumber: "1-617-299-9638",
        website: "https://www.vtvnetwork.org",
        availableHours: "Mon-Fri 9:00 AM - 5:00 PM ET",
        eligibilityCriteria: "Seniors aging in place",
        cost: "Membership fees vary",
        nationalHotline: false,
        priority: 7,
        icon: "Users",
        tags: ["Aging in Place", "Village Movement", "Community"],
        isActive: true
      },
      
      // ========== INSURANCE & MEDICARE ==========
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
        title: "Medicare Rights Center",
        description: "Medicare advocacy and education",
        phoneNumber: "1-800-333-4114",
        website: "https://www.medicarerights.org",
        availableHours: "Mon-Fri 9:00 AM - 5:00 PM ET",
        eligibilityCriteria: "Medicare beneficiaries",
        cost: "Free",
        nationalHotline: true,
        priority: 8,
        icon: "Shield",
        tags: ["Medicare", "Rights", "Advocacy", "Education"],
        isActive: true
      },
      {
        categoryId: categoryMap["Insurance"],
        title: "Medicare.gov Plan Finder",
        description: "Compare Medicare plans and prices",
        phoneNumber: "1-800-MEDICARE",
        website: "https://www.medicare.gov/plan-compare",
        availableHours: "24/7",
        eligibilityCriteria: "Medicare beneficiaries",
        cost: "Free",
        nationalHotline: true,
        priority: 9,
        icon: "Search",
        tags: ["Medicare", "Plan Comparison", "Enrollment"],
        isActive: true
      },
      
      // ========== EDUCATION & LIFELONG LEARNING ==========
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
        priority: 7,
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
        priority: 8,
        icon: "Book",
        tags: ["Health Education", "NIH", "Research"],
        isActive: true
      },
      {
        categoryId: categoryMap["Education"],
        title: "Road Scholar",
        description: "Educational travel programs for older adults",
        phoneNumber: "1-800-454-5768",
        website: "https://www.roadscholar.org",
        availableHours: "Mon-Fri 8:00 AM - 9:00 PM ET",
        eligibilityCriteria: "Adults interested in educational travel",
        cost: "Program fees vary",
        nationalHotline: true,
        priority: 6,
        icon: "Globe",
        tags: ["Educational Travel", "Learning Adventures", "Programs"],
        isActive: true
      },
      {
        categoryId: categoryMap["Education"],
        title: "SeniorNet",
        description: "Computer and technology education for seniors",
        phoneNumber: "1-571-203-7100",
        website: "https://www.seniornet.org",
        availableHours: "Mon-Fri 9:00 AM - 5:00 PM ET",
        eligibilityCriteria: "Adults 50+",
        cost: "Course fees vary",
        nationalHotline: false,
        priority: 6,
        icon: "Monitor",
        tags: ["Computer Training", "Technology", "Education"],
        isActive: true
      },
      
      // ========== COMMUNICATION SUPPORT ==========
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
        priority: 9,
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
        priority: 7,
        icon: "MessageSquare",
        tags: ["Translation", "Language", "Interpretation"],
        isActive: true
      },
      {
        categoryId: categoryMap["Communication"],
        title: "Caption Call",
        description: "Free captioned telephone service",
        phoneNumber: "1-877-557-2227",
        website: "https://www.captioncall.com",
        availableHours: "Mon-Fri 7:00 AM - 8:00 PM MT",
        eligibilityCriteria: "Hearing loss documented by professional",
        cost: "Free with certification",
        nationalHotline: true,
        priority: 7,
        icon: "Phone",
        tags: ["Hearing Loss", "Captioned Phone", "Free"],
        isActive: true
      },
      
      // ========== HEALTHCARE (Additional) ==========
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
        priority: 9,
        icon: "Heart",
        tags: ["PACE", "Comprehensive Care", "Medicare"],
        isActive: true
      },
      {
        categoryId: categoryMap["Healthcare"],
        title: "Health Resources & Services Administration",
        description: "Find health centers and free/low-cost care",
        phoneNumber: "1-877-464-4772",
        website: "https://www.hrsa.gov",
        availableHours: "Mon-Fri 8:00 AM - 8:00 PM ET",
        eligibilityCriteria: "Uninsured and underinsured",
        cost: "Sliding scale fees",
        nationalHotline: true,
        priority: 8,
        icon: "Stethoscope",
        tags: ["HRSA", "Health Centers", "Low Cost"],
        isActive: true
      },
      {
        categoryId: categoryMap["Healthcare"],
        title: "Indian Health Service",
        description: "Healthcare for American Indians and Alaska Natives",
        phoneNumber: "1-301-443-3593",
        website: "https://www.ihs.gov",
        availableHours: "Mon-Fri 8:00 AM - 5:00 PM ET",
        eligibilityCriteria: "American Indians and Alaska Natives",
        cost: "Free for eligible",
        nationalHotline: false,
        priority: 7,
        icon: "Stethoscope",
        tags: ["IHS", "Native American", "Healthcare"],
        isActive: true
      }
    ];

    // Now add educational resources
    const educationalResourcesList = [
      {
        title: "Medicare Basics Guide",
        slug: "medicare-basics-guide",
        category: "Medicare",
        subcategory: "Getting Started",
        content_type: "guide",
        content: "Comprehensive guide to understanding Medicare Parts A, B, C, and D",
        description: "Learn the fundamentals of Medicare coverage, enrollment periods, and how to choose the right plan",
        difficulty_level: "beginner",
        reading_time_minutes: 15,
        tags: ["Medicare", "Insurance", "Healthcare", "Enrollment"],
        is_featured: true,
        is_active: true
      },
      {
        title: "Medicaid Planning Strategies",
        slug: "medicaid-planning-strategies",
        category: "Financial",
        subcategory: "Medicaid",
        content_type: "guide",
        content: "Understanding Medicaid eligibility and asset protection strategies",
        description: "Learn how to qualify for Medicaid while protecting your assets",
        difficulty_level: "intermediate",
        reading_time_minutes: 20,
        tags: ["Medicaid", "Financial Planning", "Asset Protection"],
        is_featured: true,
        is_active: true
      },
      {
        title: "Advance Directives and Living Wills",
        slug: "advance-directives-living-wills",
        category: "Legal",
        subcategory: "End-of-Life Planning",
        content_type: "guide",
        content: "How to create advance directives and living wills",
        description: "Ensure your healthcare wishes are known and respected",
        difficulty_level: "intermediate",
        reading_time_minutes: 25,
        tags: ["Legal", "Healthcare Proxy", "Living Will", "Advance Directives"],
        is_featured: true,
        is_active: true
      },
      {
        title: "Understanding Memory Care",
        slug: "understanding-memory-care",
        category: "Health",
        subcategory: "Dementia Care",
        content_type: "guide",
        content: "Comprehensive guide to memory care services and when they're needed",
        description: "Learn about memory care options, costs, and how to choose the right facility",
        difficulty_level: "beginner",
        reading_time_minutes: 18,
        tags: ["Memory Care", "Dementia", "Alzheimer's", "Care Options"],
        is_featured: true,
        is_active: true
      },
      {
        title: "Veterans Benefits Guide",
        slug: "veterans-benefits-guide",
        category: "Financial",
        subcategory: "Veterans",
        content_type: "guide",
        content: "Complete guide to VA benefits for veterans and surviving spouses",
        description: "Understanding Aid & Attendance, healthcare, and other VA benefits",
        difficulty_level: "intermediate",
        reading_time_minutes: 22,
        tags: ["Veterans", "VA Benefits", "Aid & Attendance"],
        is_featured: true,
        is_active: true
      },
      {
        title: "Long-Term Care Insurance Explained",
        slug: "long-term-care-insurance",
        category: "Financial",
        subcategory: "Insurance",
        content_type: "guide",
        content: "Understanding long-term care insurance options and alternatives",
        description: "Learn about coverage, costs, and when to purchase long-term care insurance",
        difficulty_level: "intermediate",
        reading_time_minutes: 20,
        tags: ["Insurance", "Long-Term Care", "Financial Planning"],
        is_featured: false,
        is_active: true
      },
      {
        title: "Home Safety Checklist for Seniors",
        slug: "home-safety-checklist",
        category: "Health",
        subcategory: "Safety",
        content_type: "checklist",
        content: "Room-by-room safety checklist for aging in place",
        description: "Comprehensive checklist to make your home safer for aging in place",
        difficulty_level: "beginner",
        reading_time_minutes: 10,
        tags: ["Home Safety", "Aging in Place", "Fall Prevention"],
        is_featured: false,
        is_active: true
      },
      {
        title: "Caregiver Stress Management",
        slug: "caregiver-stress-management",
        category: "Caregiving",
        subcategory: "Self-Care",
        content_type: "guide",
        content: "Strategies for managing caregiver stress and preventing burnout",
        description: "Learn self-care techniques and find support resources for caregivers",
        difficulty_level: "beginner",
        reading_time_minutes: 15,
        tags: ["Caregiving", "Stress Management", "Self-Care", "Support"],
        is_featured: true,
        is_active: true
      },
      {
        title: "Social Security Optimization",
        slug: "social-security-optimization",
        category: "Financial",
        subcategory: "Retirement",
        content_type: "guide",
        content: "Strategies for maximizing your Social Security benefits",
        description: "Learn when to claim, spousal strategies, and how to avoid common mistakes",
        difficulty_level: "intermediate",
        reading_time_minutes: 25,
        tags: ["Social Security", "Retirement", "Financial Planning"],
        is_featured: true,
        is_active: true
      },
      {
        title: "Choosing the Right Care Level",
        slug: "choosing-care-level",
        category: "Health",
        subcategory: "Care Options",
        content_type: "guide",
        content: "Understanding different levels of care from independent to skilled nursing",
        description: "Learn how to assess care needs and choose the appropriate level of support",
        difficulty_level: "beginner",
        reading_time_minutes: 20,
        tags: ["Care Levels", "Assessment", "Care Planning"],
        is_featured: true,
        is_active: true
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

    console.log("\nInserting educational resources...");
    let educationalAddedCount = 0;
    for (const resource of educationalResourcesList) {
      const existing = await db.select().from(educationalResources)
        .where(eq(educationalResources.slug, resource.slug))
        .limit(1);
      
      if (existing.length === 0) {
        await db.insert(educationalResources).values(resource);
        console.log(`✓ Added educational resource: ${resource.title}`);
        educationalAddedCount++;
      } else {
        console.log(`✓ Educational resource exists: ${resource.title}`);
      }
    }

    console.log(`\n✅ Successfully populated comprehensive resources database!`);
    console.log(`   - Categories: ${insertedCategories.length}`);
    console.log(`   - New Support Resources Added: ${addedCount}`);
    console.log(`   - Total Support Resources: ${resources.length}`);
    console.log(`   - New Educational Resources Added: ${educationalAddedCount}`);
    console.log(`   - Total Educational Resources: ${educationalResourcesList.length}`);
    console.log(`   - GRAND TOTAL: ${resources.length + educationalResourcesList.length} resources`);
    
  } catch (error) {
    console.error("Error populating comprehensive resources:", error);
    process.exit(1);
  }

  process.exit(0);
}

populateComprehensiveResources();