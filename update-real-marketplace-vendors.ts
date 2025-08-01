import { db } from "./server/db";
import { marketplaceCategories, marketplaceVendors, marketplaceVendorClicks } from "./shared/schema";
import { eq } from "drizzle-orm";

const main = async () => {
  console.log('🛍️ Updating marketplace with real vendors only...');

  try {
    // First, clear vendor click tracking data to avoid foreign key constraints
    await db.delete(marketplaceVendorClicks);
    console.log('✅ Cleared vendor click tracking data');
    
    // Then clear all existing vendors
    await db.delete(marketplaceVendors);
    console.log('✅ Cleared existing vendors');

    // Get categories
    const categories = await db.select().from(marketplaceCategories);
    const categoryMap: Record<string, number> = {};
    for (const cat of categories) {
      categoryMap[cat.slug] = cat.id;
    }

    // Create only real vendors with authentic affiliate links
    const realVendors = [
      // Featured Vendors - Top Section
      {
        categoryId: categoryMap['pharmacy'],
        name: 'Amazon Pharmacy',
        slug: 'amazon-pharmacy',
        shortDescription: 'Free prescription delivery for Prime members',
        description: 'Save on prescriptions with free delivery, transparent pricing, and 24/7 pharmacist support. Accepts most insurance plans.',
        logoUrl: 'https://m.media-amazon.com/images/G/01/Pharmacy/Amazon_Pharmacy_Logo_RGB_BLUE._CB424842459_.png',
        externalUrl: 'https://pharmacy.amazon.com/?tag=seniorvalet-20',
        isFeatured: true,
        displayOrder: 1,
      },
      {
        categoryId: categoryMap['groceries'],
        name: 'Walmart',
        slug: 'walmart',
        shortDescription: 'Groceries, health products & senior essentials',
        description: 'Shop for groceries, medical supplies, and daily essentials with free delivery on orders over $35. Special senior hours available.',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Walmart_logo.svg',
        externalUrl: 'https://www.walmart.com/cp/health/976760?povid=GlobalNav_rWeb_Health_HealthWellness',
        isFeatured: true,
        displayOrder: 2,
      },
      {
        categoryId: categoryMap['communication'],
        name: 'T-Mobile 55+',
        slug: 'tmobile-55plus',
        shortDescription: 'Unlimited plans starting at $27.50/line',
        description: 'Special unlimited phone plans exclusively for customers 55 and older. Get 2 lines for $55/month with autopay.',
        logoUrl: 'https://www.t-mobile.com/content/dam/t-mobile/images/logos/t-mobile-logo.svg',
        externalUrl: 'https://www.t-mobile.com/cell-phone-plans/unlimited-55-senior-discounts',
        isFeatured: true,
        displayOrder: 3,
      },
      {
        categoryId: categoryMap['groceries'],
        name: '1-800-FLORALS',
        slug: '1800florals',
        shortDescription: 'Beautiful flowers & gifts delivered',
        description: 'Premium flower arrangements and gift baskets perfect for brightening a senior\'s day. Same-day delivery available nationwide.',
        logoUrl: 'https://cdn.1800flowers.com/images/logos/flowers/1800flowers-logo.svg',
        externalUrl: 'https://www.1800flowers.com/?r=seniorsaffiliate',
        isFeatured: true,
        displayOrder: 4,
      },

      // Other Real Vendors - Groceries & Essentials
      {
        categoryId: categoryMap['groceries'],
        name: 'Amazon Fresh',
        slug: 'amazon-fresh',
        shortDescription: 'Fresh groceries delivered same-day',
        description: 'Fresh produce, meat, seafood, and everyday essentials delivered to your door. Free delivery for Prime members.',
        logoUrl: 'https://m.media-amazon.com/images/G/01/amazonfresh/brand/AFLogo._CB1564517020_.png',
        externalUrl: 'https://www.amazon.com/alm/storefront?almBrandId=QW1hem9uIEZyZXNo&tag=seniorvalet-20',
        displayOrder: 5,
      },
      {
        categoryId: categoryMap['groceries'],
        name: 'Instacart',
        slug: 'instacart',
        shortDescription: 'Groceries from your favorite stores',
        description: 'Shop from local stores and get same-day delivery. Special senior support available by phone.',
        logoUrl: 'https://www.instacart.com/assets/beetstrap/brand/2022/instacart-logo-color.svg',
        externalUrl: 'https://www.instacart.com',
        displayOrder: 6,
      },

      // Pharmacy & Health
      {
        categoryId: categoryMap['pharmacy'],
        name: 'CVS Pharmacy',
        slug: 'cvs',
        shortDescription: 'Your neighborhood pharmacy',
        description: 'Prescription services, immunizations, and health products. Free prescription delivery available.',
        logoUrl: 'https://www.cvs.com/bizcontent/general/CVS_Health_logo_reg_ai.svg',
        externalUrl: 'https://www.cvs.com/pharmacy/pharmacy-homepage.jsp',
        displayOrder: 5,
      },
      {
        categoryId: categoryMap['pharmacy'],
        name: 'Walgreens',
        slug: 'walgreens',
        shortDescription: 'Trusted pharmacy care',
        description: 'Prescription refills, health screenings, and pharmacy services with convenient pickup and delivery.',
        logoUrl: 'https://www.walgreens.com/images/adaptive/walgreens-logo.svg',
        externalUrl: 'https://www.walgreens.com/topic/pharmacy/pharmacy.jsp',
        displayOrder: 6,
      },
      {
        categoryId: categoryMap['pharmacy'],
        name: 'GoodRx',
        slug: 'goodrx',
        shortDescription: 'Save up to 80% on prescriptions',
        description: 'Free prescription coupons that work at over 70,000 pharmacies nationwide. No membership required.',
        logoUrl: 'https://www.goodrx.com/assets/logos/goodrx-logo.svg',
        externalUrl: 'https://www.goodrx.com',
        displayOrder: 7,
      },

      // Transportation
      {
        categoryId: categoryMap['transportation'],
        name: 'Uber Health',
        slug: 'uber-health',
        shortDescription: 'Medical appointment transportation',
        description: 'Reliable rides to medical appointments. Healthcare providers can schedule rides for patients.',
        logoUrl: 'https://www.uber.com/us/en/s/d/health/images/uber-health-logo.svg',
        externalUrl: 'https://www.uberhealth.com',
        displayOrder: 5,
      },
      {
        categoryId: categoryMap['transportation'],
        name: 'GoGoGrandparent',
        slug: 'gogograndparent',
        shortDescription: 'Rides without a smartphone',
        description: 'Request Uber and Lyft rides by phone call. Family members can monitor trips for safety.',
        logoUrl: 'https://gogograndparent.com/assets/images/logo.png',
        externalUrl: 'https://gogograndparent.com',
        displayOrder: 6,
      },

      // Medical Supplies
      {
        categoryId: categoryMap['medical-supplies'],
        name: 'Carewell',
        slug: 'carewell',
        shortDescription: 'Home health supplies delivered discreetly',
        description: 'Incontinence products, mobility aids, and medical supplies with free shipping on orders over $50.',
        logoUrl: 'https://www.carewell.com/static/frontend/Carewell/default/en_US/images/logo.svg',
        externalUrl: 'https://www.carewell.com',
        displayOrder: 5,
      },
      {
        categoryId: categoryMap['medical-supplies'],
        name: 'Medical Supply Depot',
        slug: 'medical-supply-depot',
        shortDescription: 'Affordable medical equipment',
        description: 'Wheelchairs, walkers, bathroom safety, and daily living aids at competitive prices.',
        logoUrl: 'https://www.medicalsupplydepot.com/images/logo.png',
        externalUrl: 'https://www.medicalsupplydepot.com',
        displayOrder: 6,
      },

      // Communication
      {
        categoryId: categoryMap['communication'],
        name: 'Consumer Cellular',
        slug: 'consumer-cellular',
        shortDescription: 'AARP member benefits available',
        description: 'Simple, affordable cell phone plans with U.S.-based customer support. AARP members save 5%.',
        logoUrl: 'https://www.consumercellular.com/content/dam/consumercellular/images/logos/cc-logo.svg',
        externalUrl: 'https://www.consumercellular.com',
        displayOrder: 5,
      },
      {
        categoryId: categoryMap['communication'],
        name: 'GreatCall (Lively)',
        slug: 'lively',
        shortDescription: 'Medical alert & senior phones',
        description: 'Jitterbug phones and medical alert devices designed specifically for seniors.',
        logoUrl: 'https://www.lively.com/content/dam/lively/logos/lively-logo.svg',
        externalUrl: 'https://www.lively.com',
        displayOrder: 6,
      },

      // Home Services
      {
        categoryId: categoryMap['home-services'],
        name: 'Two Men and a Truck',
        slug: 'two-men-and-a-truck',
        shortDescription: 'Senior moving specialists',
        description: 'Professional moving services with special programs for seniors downsizing or relocating.',
        logoUrl: 'https://twomenandatruck.com/images/default-source/logos/logo.svg',
        externalUrl: 'https://twomenandatruck.com/moving-services/senior-moving',
        displayOrder: 5,
      },
      {
        categoryId: categoryMap['home-services'],
        name: 'Molly Maid',
        slug: 'molly-maid',
        shortDescription: 'Professional house cleaning',
        description: 'Reliable home cleaning services with senior-friendly scheduling and customized cleaning plans.',
        logoUrl: 'https://www.mollymaid.com/static/images/logo.svg',
        externalUrl: 'https://www.mollymaid.com',
        displayOrder: 6,
      },

      // Financial Services
      {
        categoryId: categoryMap['financial'],
        name: 'AARP',
        slug: 'aarp',
        shortDescription: 'Benefits for members 50+',
        description: 'Membership benefits including insurance discounts, financial tools, and exclusive senior resources.',
        logoUrl: 'https://cdn.aarp.net/content/dam/aarp/graphics/aarp_logos/180x40-aarp-logo.svg',
        externalUrl: 'https://www.aarp.org/membership',
        displayOrder: 5,
      },
    ];

    // Insert all real vendors
    for (const vendor of realVendors) {
      const [inserted] = await db.insert(marketplaceVendors)
        .values({
          ...vendor,
          isHidden: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      console.log(`✅ Created vendor: ${inserted.name} (${inserted.isFeatured ? 'FEATURED' : 'Regular'})`);
    }

    console.log('\n🎉 Marketplace updated successfully with real vendors only!');
    console.log(`📊 Total vendors: ${realVendors.length}`);
    console.log(`⭐ Featured vendors: ${realVendors.filter(v => v.isFeatured).length}`);
    
  } catch (error) {
    console.error('❌ Error updating marketplace vendors:', error);
    process.exit(1);
  }

  process.exit(0);
};

main();