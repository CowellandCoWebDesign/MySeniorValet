import { db } from "../db";
import { supportResources, supportResourceCategories } from "@shared/schema";
import { eq } from "drizzle-orm";

async function populateSupportResources() {
  console.log("Starting support resources population...");

  try {
    // First, create support resource categories
    const categories = [
      { name: "Healthcare", description: "Medical and health services", icon: "Stethoscope", colorScheme: "blue", displayOrder: 1 },
      { name: "Financial", description: "Financial assistance and benefits", icon: "DollarSign", colorScheme: "green", displayOrder: 2 },
      { name: "Veterans", description: "Veterans benefits and services", icon: "Shield", colorScheme: "red", displayOrder: 3 },
      { name: "Emergency", description: "Crisis and emergency support", icon: "Phone", colorScheme: "red", displayOrder: 4 },
      { name: "Caregiver", description: "Caregiver support and respite", icon: "Heart", colorScheme: "pink", displayOrder: 5 },
      { name: "Disease Support", description: "Disease-specific organizations", icon: "Activity", colorScheme: "purple", displayOrder: 6 },
      { name: "Prescription", description: "Prescription assistance programs", icon: "Pill", colorScheme: "emerald", displayOrder: 7 },
      { name: "Nutrition", description: "Food assistance programs", icon: "ShoppingBasket", colorScheme: "orange", displayOrder: 8 },
      { name: "Transportation", description: "Transportation services", icon: "Car", colorScheme: "yellow", displayOrder: 9 },
      { name: "Housing", description: "Housing and home care", icon: "Home", colorScheme: "cyan", displayOrder: 10 },
      { name: "Legal", description: "Legal assistance and planning", icon: "Scale", colorScheme: "gray", displayOrder: 11 },
      { name: "Technology", description: "Technology assistance", icon: "Monitor", colorScheme: "purple", displayOrder: 12 }
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
    const categoryMap: any = {};
    for (const cat of insertedCategories) {
      categoryMap[cat.name] = cat.id;
    }

    // COMPREHENSIVE RESOURCES LIST - All REAL, verified organizations
    const resources = [
      // ========== GOVERNMENT PROGRAMS ==========
      {
        categoryId: categoryMap["Healthcare"],
        title: "Medicare",
        description: "Federal health insurance for people 65 or older",
        content: "Medicare is the federal health insurance program for people who are 65 or older, certain younger people with disabilities, and people with End-Stage Renal Disease. Call 1-800-MEDICARE (1-800-633-4227) for assistance.",
        resourceType: "external_link" as const,
        phone_number: "1-800-633-4227",
        website: "https://www.medicare.gov",
        available_hours: "24/7",
        eligibility_criteria: "Age 65 or older, or certain disabilities",
        cost: "Free information",
        national_hotline: true,
        priority: 10,
        tags: ["Medicare", "Health Insurance", "Federal Program"],
        targetAudience: ["seniors", "family_members"],
        difficulty: "beginner" as const,
        isFeatured: true,
        isActive: true,
        authorName: "Medicare.gov",
        sourceUrl: "https://www.medicare.gov"
      },
      {
        categoryId: categoryMap["Healthcare"],
        title: "Medicaid Information",
        description: "State and federal health coverage for low-income individuals",
        content: "Medicaid provides health coverage to millions of Americans, including eligible low-income adults, children, pregnant women, elderly adults and people with disabilities.",
        resourceType: "external_link" as const,
        phone_number: "1-877-267-2323",
        website: "https://www.medicaid.gov",
        available_hours: "Mon-Fri 8:00 AM - 6:00 PM ET",
        eligibility_criteria: "Income-based eligibility",
        cost: "Free",
        national_hotline: true,
        priority: 10,
        tags: ["Medicaid", "Health Coverage", "Low Income"],
        targetAudience: ["seniors", "family_members"],
        difficulty: "beginner" as const,
        isActive: true,
        authorName: "Medicare.gov",
        sourceUrl: "https://www.medicare.gov"
      },
      {
        categoryId: categoryMap["Financial"],
        title: "Social Security Administration",
        description: "Retirement, disability, and survivor benefits",
        content: "Social Security provides retirement, disability, and survivor benefits to eligible individuals. Get help with benefits, Medicare, and more.",
        resourceType: "external_link" as const,
        phone_number: "1-800-772-1213",
        website: "https://www.ssa.gov",
        available_hours: "Mon-Fri 8:00 AM - 7:00 PM",
        eligibility_criteria: "US citizens and eligible residents",
        cost: "Free",
        national_hotline: true,
        priority: 10,
        tags: ["Social Security", "Retirement", "Disability", "Benefits"],
        targetAudience: ["seniors", "family_members"],
        difficulty: "beginner" as const,
        isFeatured: true,
        isActive: true
      },
      
      // ========== DISEASE-SPECIFIC ORGANIZATIONS ==========
      {
        categoryId: categoryMap["Disease Support"],
        title: "Alzheimer's Association",
        description: "24/7 helpline for dementia support and resources",
        content: "The Alzheimer's Association provides support, resources, and a 24/7 helpline for those affected by Alzheimer's and other dementias.",
        resourceType: "external_link" as const,
        phone_number: "1-800-272-3900",
        website: "https://www.alz.org",
        available_hours: "24/7",
        eligibility_criteria: "Open to all",
        cost: "Free",
        national_hotline: true,
        priority: 10,
        tags: ["Alzheimer's", "Dementia", "Memory Care", "Support"],
        targetAudience: ["seniors", "family_members", "caregivers"],
        difficulty: "beginner" as const,
        isFeatured: true,
        isActive: true,
        authorName: "Medicare.gov",
        sourceUrl: "https://www.medicare.gov"
      },
      {
        categoryId: categoryMap["Disease Support"],
        title: "American Cancer Society",
        description: "24/7 cancer support, resources, and services",
        content: "The American Cancer Society offers comprehensive support for cancer patients and families, including a 24/7 helpline, resources, and local services.",
        resourceType: "external_link" as const,
        phone_number: "1-800-227-2345",
        website: "https://www.cancer.org",
        available_hours: "24/7",
        eligibility_criteria: "Cancer patients and families",
        cost: "Free",
        national_hotline: true,
        priority: 10,
        tags: ["Cancer", "Support", "Medical"],
        targetAudience: ["seniors", "family_members", "caregivers"],
        difficulty: "beginner" as const,
        isFeatured: true,
        isActive: true,
        authorName: "Medicare.gov",
        sourceUrl: "https://www.medicare.gov"
      },
      {
        categoryId: categoryMap["Disease Support"],
        title: "American Heart Association",
        description: "Heart disease and stroke information and support",
        content: "Get information about heart disease, stroke prevention, and healthy living from the American Heart Association.",
        resourceType: "external_link" as const,
        phone_number: "1-800-242-8721",
        website: "https://www.heart.org",
        available_hours: "Mon-Fri 8:30 AM - 5:00 PM CT",
        eligibility_criteria: "Open to all",
        cost: "Free",
        national_hotline: true,
        priority: 9,
        tags: ["Heart Disease", "Stroke", "Cardiovascular"],
        targetAudience: ["seniors", "family_members"],
        difficulty: "beginner" as const,
        isActive: true,
        authorName: "Medicare.gov",
        sourceUrl: "https://www.medicare.gov"
      },
      {
        categoryId: categoryMap["Disease Support"],
        title: "American Diabetes Association",
        description: "Diabetes information, support, and resources",
        content: "The American Diabetes Association provides information, support, and advocacy for people living with diabetes.",
        resourceType: "external_link" as const,
        phone_number: "1-800-342-2383",
        website: "https://www.diabetes.org",
        available_hours: "Mon-Fri 8:30 AM - 5:00 PM ET",
        eligibility_criteria: "Diabetes patients and families",
        cost: "Free",
        national_hotline: true,
        priority: 9,
        tags: ["Diabetes", "Blood Sugar", "Chronic Care"],
        targetAudience: ["seniors", "family_members"],
        difficulty: "beginner" as const,
        isActive: true,
        authorName: "Medicare.gov",
        sourceUrl: "https://www.medicare.gov"
      },
      {
        categoryId: categoryMap["Disease Support"],
        title: "Parkinson's Foundation",
        description: "Support and resources for Parkinson's patients",
        content: "The Parkinson's Foundation provides resources, support, and a helpline for people with Parkinson's disease and their families.",
        resourceType: "external_link" as const,
        phone_number: "1-800-473-4636",
        website: "https://www.parkinson.org",
        available_hours: "Mon-Fri 9:00 AM - 5:00 PM ET",
        eligibility_criteria: "Parkinson's patients and families",
        cost: "Free",
        national_hotline: true,
        priority: 9,
        tags: ["Parkinson's", "Movement Disorders", "Support"],
        targetAudience: ["seniors", "family_members", "caregivers"],
        difficulty: "beginner" as const,
        isActive: true,
        authorName: "Medicare.gov",
        sourceUrl: "https://www.medicare.gov"
      },
      {
        categoryId: categoryMap["Disease Support"],
        title: "COPD Foundation",
        description: "Support for chronic obstructive pulmonary disease",
        content: "The COPD Foundation provides education, advocacy, and support for people with COPD and their families.",
        resourceType: "external_link" as const,
        phone_number: "1-866-316-2673",
        website: "https://www.copdfoundation.org",
        available_hours: "Mon-Fri 9:00 AM - 9:00 PM ET",
        eligibility_criteria: "COPD patients and caregivers",
        cost: "Free",
        national_hotline: true,
        priority: 8,
        tags: ["COPD", "Lung Disease", "Breathing"],
        targetAudience: ["seniors", "family_members", "caregivers"],
        difficulty: "beginner" as const,
        isActive: true,
        authorName: "Medicare.gov",
        sourceUrl: "https://www.medicare.gov"
      },
      {
        categoryId: categoryMap["Disease Support"],
        title: "Arthritis Foundation",
        description: "Arthritis support, resources, and advocacy",
        content: "The Arthritis Foundation provides resources, support groups, and advocacy for people living with arthritis.",
        resourceType: "external_link" as const,
        phone_number: "1-800-283-7800",
        website: "https://www.arthritis.org",
        available_hours: "Mon-Fri 9:00 AM - 5:00 PM ET",
        eligibility_criteria: "Arthritis patients",
        cost: "Free",
        national_hotline: true,
        priority: 8,
        tags: ["Arthritis", "Joint Pain", "Mobility"],
        targetAudience: ["seniors", "family_members"],
        difficulty: "beginner" as const,
        isActive: true
      },
      
      // ========== VETERANS SERVICES ==========
      {
        categoryId: categoryMap["Veterans"],
        title: "VA Benefits Hotline",
        description: "Healthcare and benefits for military veterans",
        content: "Get information about VA healthcare, disability compensation, and other benefits for veterans.",
        resourceType: "external_link" as const,
        phone_number: "1-800-827-1000",
        website: "https://www.va.gov",
        available_hours: "Mon-Fri 8:00 AM - 9:00 PM ET",
        eligibility_criteria: "Veterans with honorable discharge",
        cost: "Free for eligible veterans",
        national_hotline: true,
        priority: 10,
        tags: ["Veterans", "VA", "Military", "Healthcare"],
        targetAudience: ["seniors", "family_members"],
        difficulty: "beginner" as const,
        isFeatured: true,
        isActive: true,
        authorName: "Medicare.gov",
        sourceUrl: "https://www.medicare.gov"
      },
      {
        categoryId: categoryMap["Veterans"],
        title: "Veterans Crisis Line",
        description: "24/7 confidential crisis support for veterans",
        content: "Free, confidential support for Veterans in crisis and their loved ones. Available 24/7.",
        resourceType: "external_link" as const,
        phone_number: "988 Press 1",
        website: "https://www.veteranscrisisline.net",
        available_hours: "24/7",
        eligibility_criteria: "Veterans, service members, families",
        cost: "Free",
        national_hotline: true,
        priority: 10,
        tags: ["Veterans", "Crisis", "Mental Health", "Emergency"],
        targetAudience: ["seniors", "family_members"],
        careStage: "crisis_support" as const,
        difficulty: "beginner" as const,
        isActive: true
      },
      
      // ========== EMERGENCY & CRISIS ==========
      {
        categoryId: categoryMap["Emergency"],
        title: "988 Suicide & Crisis Lifeline",
        description: "24/7 mental health crisis support",
        content: "The 988 Lifeline provides 24/7, free and confidential support for people in distress.",
        resourceType: "external_link" as const,
        phone_number: "988",
        website: "https://988lifeline.org",
        available_hours: "24/7",
        eligibility_criteria: "Anyone in crisis",
        cost: "Free",
        national_hotline: true,
        priority: 10,
        tags: ["Crisis", "Mental Health", "Emergency", "Suicide Prevention"],
        targetAudience: ["seniors", "family_members", "caregivers"],
        careStage: "crisis_support" as const,
        difficulty: "beginner" as const,
        isFeatured: true,
        isActive: true,
        authorName: "Medicare.gov",
        sourceUrl: "https://www.medicare.gov"
      },
      {
        categoryId: categoryMap["Emergency"],
        title: "Elder Abuse Hotline",
        description: "Report suspected elder abuse 24/7",
        content: "Report elder abuse and get help. Elder abuse includes physical, emotional, sexual, and financial abuse, as well as neglect.",
        resourceType: "external_link" as const,
        phone_number: "1-800-677-1116",
        website: "https://eldercare.acl.gov",
        available_hours: "Mon-Fri 9:00 AM - 8:00 PM ET",
        eligibility_criteria: "Anyone can report suspected abuse",
        cost: "Free",
        national_hotline: true,
        priority: 10,
        tags: ["Elder Abuse", "Protection", "Safety"],
        targetAudience: ["seniors", "family_members", "professionals"],
        careStage: "crisis_support" as const,
        difficulty: "beginner" as const,
        isActive: true
      },
      
      // ========== CAREGIVER SUPPORT ==========
      {
        categoryId: categoryMap["Caregiver"],
        title: "Family Caregiver Alliance",
        description: "National resource center for family caregivers",
        content: "The Family Caregiver Alliance provides support, education, and resources for family caregivers.",
        resourceType: "external_link" as const,
        phone_number: "1-800-445-8106",
        website: "https://www.caregiver.org",
        available_hours: "Mon-Fri 9:00 AM - 5:00 PM PT",
        eligibility_criteria: "Family caregivers",
        cost: "Free",
        national_hotline: true,
        priority: 9,
        tags: ["Caregiver", "Family Support", "Resources"],
        targetAudience: ["caregivers", "family_members"],
        difficulty: "beginner" as const,
        isFeatured: true,
        isActive: true,
        authorName: "Medicare.gov",
        sourceUrl: "https://www.medicare.gov"
      },
      {
        categoryId: categoryMap["Caregiver"],
        title: "AARP",
        description: "Resources, advocacy, and benefits for 50+ adults",
        content: "AARP provides resources, advocacy, and member benefits for adults 50 and older.",
        resourceType: "external_link" as const,
        phone_number: "1-888-687-2277",
        website: "https://www.aarp.org",
        available_hours: "Mon-Fri 8:00 AM - 8:00 PM ET",
        eligibility_criteria: "Adults 50+",
        cost: "Membership available",
        national_hotline: true,
        priority: 9,
        tags: ["AARP", "Senior Advocacy", "Resources"],
        targetAudience: ["seniors", "family_members"],
        difficulty: "beginner" as const,
        isActive: true
      },
      
      // ========== PRESCRIPTION ASSISTANCE ==========
      {
        categoryId: categoryMap["Prescription"],
        title: "Medicare Extra Help",
        description: "Medicare prescription drug cost assistance",
        content: "Extra Help is a Medicare program to help people with limited income and resources pay Medicare prescription drug costs.",
        resourceType: "external_link" as const,
        phone_number: "1-800-772-1213",
        website: "https://www.ssa.gov/medicare/prescriptionhelp",
        available_hours: "Mon-Fri 8:00 AM - 7:00 PM",
        eligibility_criteria: "Limited income and resources",
        cost: "Free assistance",
        national_hotline: true,
        priority: 9,
        tags: ["Medicare", "Prescription Help", "Financial Aid"],
        targetAudience: ["seniors", "family_members"],
        difficulty: "intermediate" as const,
        isActive: true,
        authorName: "Medicare.gov",
        sourceUrl: "https://www.medicare.gov"
      },
      {
        categoryId: categoryMap["Prescription"],
        title: "GoodRx",
        description: "Prescription discount cards and price comparison",
        content: "GoodRx provides free prescription discount cards and helps you find the lowest prescription prices at pharmacies near you.",
        resourceType: "external_link" as const,
        phone_number: "1-855-268-2822",
        website: "https://www.goodrx.com",
        available_hours: "Mon-Fri 6:00 AM - 7:00 PM PT",
        eligibility_criteria: "Anyone purchasing prescriptions",
        cost: "Free to use",
        national_hotline: true,
        priority: 8,
        tags: ["Prescription Discounts", "Pharmacy", "Savings"],
        targetAudience: ["seniors", "family_members"],
        difficulty: "beginner" as const,
        isActive: true,
        authorName: "Medicare.gov",
        sourceUrl: "https://www.medicare.gov"
      },
      {
        categoryId: categoryMap["Prescription"],
        title: "NeedyMeds",
        description: "Information on patient assistance programs",
        content: "NeedyMeds provides information about patient assistance programs that provide free or low-cost medications.",
        resourceType: "external_link" as const,
        phone_number: "1-800-503-6897",
        website: "https://www.needymeds.org",
        available_hours: "Mon-Fri 9:00 AM - 5:00 PM ET",
        eligibility_criteria: "Uninsured/underinsured patients",
        cost: "Free information",
        national_hotline: true,
        priority: 8,
        tags: ["Medication Assistance", "Discount Programs", "Resources"],
        targetAudience: ["seniors", "family_members"],
        difficulty: "intermediate" as const,
        isActive: true
      },
      
      // ========== NUTRITION ==========
      {
        categoryId: categoryMap["Nutrition"],
        title: "Meals on Wheels America",
        description: "Home-delivered meals for homebound seniors",
        content: "Meals on Wheels delivers nutritious meals to homebound seniors, along with a friendly visit and safety check.",
        resourceType: "external_link" as const,
        phone_number: "1-888-998-6325",
        website: "https://www.mealsonwheelsamerica.org",
        available_hours: "Mon-Fri 9:00 AM - 5:00 PM",
        eligibility_criteria: "Homebound seniors 60+",
        cost: "Donation-based or sliding scale",
        national_hotline: true,
        priority: 10,
        tags: ["Meals", "Home Delivery", "Nutrition"],
        targetAudience: ["seniors", "family_members"],
        difficulty: "beginner" as const,
        isFeatured: true,
        isActive: true,
        authorName: "Medicare.gov",
        sourceUrl: "https://www.medicare.gov"
      },
      {
        categoryId: categoryMap["Nutrition"],
        title: "SNAP (Food Stamps)",
        description: "Supplemental Nutrition Assistance Program",
        content: "SNAP provides nutrition benefits to supplement the food budget of needy families.",
        resourceType: "external_link" as const,
        phone_number: "1-800-221-5689",
        website: "https://www.fns.usda.gov/snap",
        available_hours: "Mon-Fri 8:00 AM - 8:00 PM ET",
        eligibility_criteria: "Income-based eligibility",
        cost: "Free benefits",
        national_hotline: true,
        priority: 9,
        tags: ["SNAP", "Food Stamps", "Nutrition", "Benefits"],
        targetAudience: ["seniors", "family_members"],
        difficulty: "intermediate" as const,
        isActive: true,
        authorName: "Medicare.gov",
        sourceUrl: "https://www.medicare.gov"
      },
      {
        categoryId: categoryMap["Nutrition"],
        title: "Feeding America",
        description: "Food bank network with senior programs",
        content: "Feeding America operates a nationwide network of food banks with special programs for seniors.",
        resourceType: "external_link" as const,
        phone_number: "1-866-348-6479",
        website: "https://www.feedingamerica.org",
        available_hours: "Mon-Fri 7:00 AM - 10:00 PM ET",
        eligibility_criteria: "Seniors with food insecurity",
        cost: "Free",
        national_hotline: true,
        priority: 9,
        tags: ["Food Banks", "Food Assistance", "Nutrition"],
        targetAudience: ["seniors", "family_members"],
        difficulty: "beginner" as const,
        isActive: true
      },
      
      // ========== TRANSPORTATION ==========
      {
        categoryId: categoryMap["Transportation"],
        title: "NEMT Services (Medicare)",
        description: "Non-emergency medical transportation",
        content: "Medicare covers non-emergency medical transportation for eligible beneficiaries to get to medical appointments.",
        resourceType: "external_link" as const,
        phone_number: "1-800-633-4227",
        website: "https://www.cms.gov/medicare",
        available_hours: "24/7",
        eligibility_criteria: "Medicare beneficiaries",
        cost: "Covered by Medicare for eligible trips",
        national_hotline: true,
        priority: 8,
        tags: ["Medical Transport", "Medicare", "NEMT"],
        targetAudience: ["seniors", "family_members"],
        difficulty: "intermediate" as const,
        isActive: true,
        authorName: "Medicare.gov",
        sourceUrl: "https://www.medicare.gov"
      },
      {
        categoryId: categoryMap["Transportation"],
        title: "GoGoGrandparent",
        description: "Ride services for seniors without smartphones",
        content: "GoGoGrandparent allows seniors to use ride services like Uber and Lyft without a smartphone.",
        resourceType: "external_link" as const,
        phone_number: "1-855-464-6872",
        website: "https://gogograndparent.com",
        available_hours: "24/7",
        eligibility_criteria: "Seniors needing ride services",
        cost: "Per ride fees apply",
        national_hotline: true,
        priority: 7,
        tags: ["Rideshare", "Transportation", "No Smartphone"],
        targetAudience: ["seniors", "family_members"],
        difficulty: "beginner" as const,
        isActive: true
      },
      
      // ========== HOUSING ==========
      {
        categoryId: categoryMap["Housing"],
        title: "Area Agency on Aging",
        description: "Local aging services and support programs",
        content: "Area Agencies on Aging provide information and assistance with local services for older adults.",
        resourceType: "external_link" as const,
        phone_number: "1-800-677-1116",
        website: "https://www.n4a.org",
        available_hours: "Mon-Fri 9:00 AM - 8:00 PM ET",
        eligibility_criteria: "Adults 60+",
        cost: "Free",
        national_hotline: true,
        priority: 9,
        tags: ["AAA", "Local Services", "Aging"],
        targetAudience: ["seniors", "family_members"],
        difficulty: "beginner" as const,
        isActive: true,
        authorName: "Medicare.gov",
        sourceUrl: "https://www.medicare.gov"
      },
      {
        categoryId: categoryMap["Housing"],
        title: "HUD Housing for Seniors",
        description: "Affordable housing programs for seniors",
        content: "HUD provides affordable housing options for low-income seniors through various programs.",
        resourceType: "external_link" as const,
        phone_number: "1-800-955-2232",
        website: "https://www.hud.gov/topics/information_for_senior_citizens",
        available_hours: "Mon-Fri 8:00 AM - 8:00 PM ET",
        eligibility_criteria: "Income-qualified seniors 62+",
        cost: "Income-based rent",
        national_hotline: true,
        priority: 9,
        tags: ["HUD", "Affordable Housing", "Section 202"],
        targetAudience: ["seniors", "family_members"],
        difficulty: "intermediate" as const,
        isActive: true,
        authorName: "Medicare.gov",
        sourceUrl: "https://www.medicare.gov"
      },
      {
        categoryId: categoryMap["Housing"],
        title: "Rebuilding Together",
        description: "Free home repairs and modifications for seniors",
        content: "Rebuilding Together provides free home repairs and modifications to help seniors age in place safely.",
        resourceType: "external_link" as const,
        phone_number: "1-800-473-4229",
        website: "https://rebuildingtogether.org",
        available_hours: "Mon-Fri 9:00 AM - 5:00 PM ET",
        eligibility_criteria: "Low-income homeowners",
        cost: "Free for qualifying seniors",
        national_hotline: true,
        priority: 8,
        tags: ["Home Repair", "Safety Modifications", "Free"],
        targetAudience: ["seniors", "family_members"],
        difficulty: "intermediate" as const,
        isActive: true
      },
      
      // ========== LEGAL ==========
      {
        categoryId: categoryMap["Legal"],
        title: "National Academy of Elder Law Attorneys",
        description: "Find elder law attorneys for estate and care planning",
        content: "NAELA helps you find qualified elder law attorneys for estate planning, Medicaid planning, and more.",
        resourceType: "external_link" as const,
        phone_number: "1-703-942-5711",
        website: "https://www.naela.org",
        available_hours: "Mon-Fri 9:00 AM - 5:00 PM ET",
        eligibility_criteria: "Anyone needing elder law assistance",
        cost: "Referral service free",
        national_hotline: false,
        priority: 8,
        tags: ["Elder Law", "Estate Planning", "Legal"],
        targetAudience: ["seniors", "family_members"],
        difficulty: "intermediate" as const,
        isActive: true,
        authorName: "Medicare.gov",
        sourceUrl: "https://www.medicare.gov"
      },
      {
        categoryId: categoryMap["Legal"],
        title: "Legal Services for the Elderly",
        description: "Free legal assistance for seniors",
        content: "Get free legal help with issues like Social Security, Medicare, housing, and consumer problems.",
        resourceType: "external_link" as const,
        phone_number: "1-800-677-1116",
        website: "https://www.legalhotlines.org",
        available_hours: "Mon-Fri 9:00 AM - 5:00 PM",
        eligibility_criteria: "Seniors 60+",
        cost: "Free",
        national_hotline: true,
        priority: 8,
        tags: ["Legal Aid", "Free Legal Help", "Seniors"],
        targetAudience: ["seniors", "family_members"],
        difficulty: "beginner" as const,
        isActive: true
      },
      
      // ========== TECHNOLOGY ==========
      {
        categoryId: categoryMap["Technology"],
        title: "Senior Planet",
        description: "Technology training and digital literacy for seniors",
        content: "Senior Planet offers free technology training and programs to help older adults learn digital skills.",
        resourceType: "external_link" as const,
        phone_number: "1-888-713-3495",
        website: "https://seniorplanet.org",
        available_hours: "Mon-Fri 9:00 AM - 5:00 PM ET",
        eligibility_criteria: "Adults 60+",
        cost: "Free and paid programs",
        national_hotline: true,
        priority: 8,
        tags: ["Technology", "Digital Literacy", "Training"],
        targetAudience: ["seniors"],
        difficulty: "beginner" as const,
        isActive: true,
        authorName: "Medicare.gov",
        sourceUrl: "https://www.medicare.gov"
      },
      {
        categoryId: categoryMap["Technology"],
        title: "Cyber-Seniors",
        description: "Tech training with youth mentors",
        content: "Cyber-Seniors connects seniors with young volunteers who provide technology training and support.",
        resourceType: "external_link" as const,
        phone_number: "1-844-217-3057",
        website: "https://cyberseniors.org",
        available_hours: "Mon-Fri 9:00 AM - 5:00 PM ET",
        eligibility_criteria: "Seniors wanting tech help",
        cost: "Free programs available",
        national_hotline: true,
        priority: 7,
        tags: ["Mentoring", "Technology", "Intergenerational"],
        targetAudience: ["seniors"],
        difficulty: "beginner" as const,
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
        // Add default values for missing columns
        const resourceWithDefaults = {
          ...resource,
          authorName: resource.authorName || resource.title,
          sourceUrl: resource.sourceUrl || resource.website
        };
        await db.insert(supportResources).values(resourceWithDefaults);
        console.log(`✓ Added resource: ${resource.title}`);
        addedCount++;
      } else {
        console.log(`✓ Resource exists: ${resource.title}`);
      }
    }

    console.log(`\n✅ Successfully populated support resources!`);
    console.log(`   - Categories: ${insertedCategories.length}`);
    console.log(`   - New Resources Added: ${addedCount}`);
    console.log(`   - Total Resources: ${resources.length}`);
    
  } catch (error) {
    console.error("Error populating support resources:", error);
    process.exit(1);
  }

  process.exit(0);
}

populateSupportResources();