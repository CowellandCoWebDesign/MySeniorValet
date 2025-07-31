import { db } from "./server/db";
import { marketplaceCategories, marketplaceVendors } from "./shared/schema";

const main = async () => {
  console.log('🛍️ Seeding marketplace vendors...');

  try {
    // Create categories
    const categories = [
      { name: 'Groceries & Essentials', slug: 'groceries', icon: 'ShoppingCart', description: 'Grocery delivery and household essentials for seniors' },
      { name: 'Pharmacy & Health', slug: 'pharmacy', icon: 'Pill', description: 'Prescription services and health supplies' },
      { name: 'Transportation', slug: 'transportation', icon: 'Car', description: 'Ride services and transportation solutions' },
      { name: 'Medical Supplies', slug: 'medical-supplies', icon: 'Stethoscope', description: 'Medical equipment and supplies for home care' },
      { name: 'Communication', slug: 'communication', icon: 'Phone', description: 'Senior-friendly phones and communication devices' },
      { name: 'Home Services', slug: 'home-services', icon: 'Home', description: 'Home maintenance and support services' },
      { name: 'Financial Services', slug: 'financial', icon: 'DollarSign', description: 'Financial planning and services for seniors' },
    ];

    const insertedCategories = [];
    for (const category of categories) {
      const [inserted] = await db.insert(marketplaceCategories)
        .values(category)
        .onConflictDoUpdate({
          target: marketplaceCategories.slug,
          set: {
            name: category.name,
            description: category.description,
            icon: category.icon,
            updatedAt: new Date(),
          }
        })
        .returning();
      insertedCategories.push(inserted);
      console.log(`✅ Created category: ${inserted.name}`);
    }

    // Map categories by slug for easier reference
    const categoryMap: Record<string, number> = {};
    for (const cat of insertedCategories) {
      categoryMap[cat.slug] = cat.id;
    }

    // Create vendors
    const vendors = [
      // Groceries & Essentials
      {
        categoryId: categoryMap['groceries'],
        name: 'Walmart',
        slug: 'walmart',
        shortDescription: 'Groceries, household essentials, and more',
        description: 'Shop for groceries, household items, medical supplies, and more with convenient delivery options for seniors.',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Walmart_logo.svg',
        externalUrl: 'https://www.walmart.com/cp/health/976760',
        isFeatured: true,
        displayOrder: 1,
      },
      {
        categoryId: categoryMap['groceries'],
        name: 'Amazon',
        slug: 'amazon',
        shortDescription: 'Everything delivered to your door',
        description: 'Shop millions of products including medical aids, groceries, and daily essentials with fast delivery.',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
        externalUrl: 'https://www.amazon.com/health-personal-care/b?ie=UTF8&node=3760901',
        isFeatured: true,
        displayOrder: 2,
      },
      {
        categoryId: categoryMap['groceries'],
        name: 'Instacart',
        slug: 'instacart',
        shortDescription: 'Fresh groceries delivered same-day',
        description: 'Get fresh groceries delivered from your favorite local stores in as fast as 1 hour.',
        logoUrl: 'https://www.instacart.com/assets/beetstrap/brand/2022/instacart-logo-color-6678cb82d531f8910d5ba270a11a7e9b56fc261371bda42ea7a5abeff3492e1c.svg',
        externalUrl: 'https://www.instacart.com',
        isFeatured: true,
        displayOrder: 3,
      },

      // Pharmacy & Health
      {
        categoryId: categoryMap['pharmacy'],
        name: 'Walgreens',
        slug: 'walgreens',
        shortDescription: 'Your neighborhood pharmacy',
        description: 'Prescription refills, health products, and pharmacy services with convenient pickup and delivery options.',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/55/Walgreens_Logo.svg',
        externalUrl: 'https://www.walgreens.com/topic/pharmacy/pharmacy.jsp',
        isFeatured: true,
        displayOrder: 1,
      },
      {
        categoryId: categoryMap['pharmacy'],
        name: 'CVS Pharmacy',
        slug: 'cvs',
        shortDescription: 'Health is everything',
        description: 'Pharmacy services, health products, and MinuteClinic for your healthcare needs.',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/df/CVS_Health_Logo_2022.svg',
        externalUrl: 'https://www.cvs.com/pharmacy/pharmacy-homepage.jsp',
        isFeatured: true,
        displayOrder: 2,
      },
      {
        categoryId: categoryMap['pharmacy'],
        name: 'GoodRx',
        slug: 'goodrx',
        shortDescription: 'Prescription discounts that work',
        description: 'Save up to 80% on prescriptions with free coupons that work at most pharmacies.',
        logoUrl: 'https://www.goodrx.com/assets/logos/goodrx-logo.svg',
        externalUrl: 'https://www.goodrx.com',
        displayOrder: 3,
      },

      // Transportation
      {
        categoryId: categoryMap['transportation'],
        name: 'Lyft',
        slug: 'lyft',
        shortDescription: 'Rides for seniors',
        description: 'Safe, reliable rides for medical appointments, shopping, and social activities.',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Lyft_logo.svg',
        externalUrl: 'https://www.lyft.com',
        isFeatured: true,
        displayOrder: 1,
      },
      {
        categoryId: categoryMap['transportation'],
        name: 'Uber',
        slug: 'uber',
        shortDescription: 'Your ride, on demand',
        description: 'Request a ride for yourself or a loved one with Uber\'s reliable transportation network.',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/58/Uber_logo_2018.svg',
        externalUrl: 'https://www.uber.com',
        displayOrder: 2,
      },

      // Medical Supplies
      {
        categoryId: categoryMap['medical-supplies'],
        name: 'Carewell',
        slug: 'carewell',
        shortDescription: 'Home health supplies delivered',
        description: 'Incontinence products, nutrition supplies, and home health essentials delivered discreetly.',
        logoUrl: 'https://www.carewell.com/static/version1735786800/frontend/Carewell/default/en_US/images/logo.svg',
        externalUrl: 'https://www.carewell.com',
        isFeatured: true,
        displayOrder: 1,
      },

      // Communication
      {
        categoryId: categoryMap['communication'],
        name: 'Consumer Cellular',
        slug: 'consumer-cellular',
        shortDescription: 'Senior-friendly phone plans',
        description: 'Simple, affordable cell phone plans designed specifically for seniors.',
        logoUrl: 'https://www.consumercellular.com/content/dam/consumercellular/images/logos/cc-logo.svg',
        externalUrl: 'https://www.consumercellular.com',
        isFeatured: true,
        displayOrder: 1,
      },
      {
        categoryId: categoryMap['communication'],
        name: 'Lively',
        slug: 'lively',
        shortDescription: 'Emergency response & phones',
        description: 'Medical alert devices and senior-friendly smartphones for safety and connection.',
        logoUrl: 'https://www.lively.com/content/dam/lively/logos/lively-logo.svg',
        externalUrl: 'https://www.lively.com',
        displayOrder: 2,
      },
      {
        categoryId: categoryMap['communication'],
        name: 'T-Mobile 55+',
        slug: 'tmobile-55plus',
        shortDescription: 'Unlimited plans for seniors',
        description: 'Special unlimited phone plans for customers 55 and older at discounted rates.',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/T-Mobile_logo.svg',
        externalUrl: 'https://www.t-mobile.com/cell-phone-plans/unlimited-55-senior-discounts',
        displayOrder: 3,
      },

      // Home Services
      {
        categoryId: categoryMap['home-services'],
        name: 'TaskRabbit',
        slug: 'taskrabbit',
        shortDescription: 'Help with everyday tasks',
        description: 'Hire trusted local help for furniture assembly, handyman work, moving help, and more.',
        logoUrl: 'https://www.taskrabbit.com/v3/assets/logo-taskrabbit-green.svg',
        externalUrl: 'https://www.taskrabbit.com',
        displayOrder: 1,
      },
      {
        categoryId: categoryMap['home-services'],
        name: 'Bellhop',
        slug: 'bellhop',
        shortDescription: 'Moving made simple',
        description: 'Professional movers for downsizing, relocating to senior living, or local moves.',
        logoUrl: 'https://www.getbellhop.com/assets/logos/bellhop-logo.svg',
        externalUrl: 'https://www.getbellhop.com',
        displayOrder: 2,
      },

      // Financial Services
      {
        categoryId: categoryMap['financial'],
        name: 'Rocket Mortgage',
        slug: 'rocket-mortgage',
        shortDescription: 'Refinance or downsize',
        description: 'Mortgage solutions for seniors looking to refinance, downsize, or access home equity.',
        logoUrl: 'https://www.rocketmortgage.com/resources/assets/images/logos/rocket-mortgage-logo.svg',
        externalUrl: 'https://www.rocketmortgage.com',
        displayOrder: 1,
      },
      {
        categoryId: categoryMap['financial'],
        name: 'American Advisors Group',
        slug: 'aag',
        shortDescription: 'Reverse mortgage solutions',
        description: 'Learn about reverse mortgages and how to access your home equity in retirement.',
        logoUrl: 'https://www.aag.com/assets/images/aag-logo.svg',
        externalUrl: 'https://www.aag.com',
        displayOrder: 2,
      },
    ];

    // Insert vendors
    for (const vendor of vendors) {
      const [inserted] = await db.insert(marketplaceVendors)
        .values(vendor)
        .onConflictDoUpdate({
          target: marketplaceVendors.slug,
          set: {
            ...vendor,
            updatedAt: new Date(),
          }
        })
        .returning();
      console.log(`✅ Created vendor: ${inserted.name}`);
    }

    console.log('\n🎉 Marketplace vendors seeded successfully!');
    console.log(`📊 Total categories: ${insertedCategories.length}`);
    console.log(`📊 Total vendors: ${vendors.length}`);

  } catch (error) {
    console.error('❌ Error seeding marketplace vendors:', error);
    throw error;
  } finally {
    process.exit(0);
  }
};

main().catch(console.error);