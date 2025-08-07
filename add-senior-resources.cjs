const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addSeniorResources() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // First, add new categories for senior resources
    const categories = [
      { name: 'Government Services', slug: 'government-services', description: 'Official government services and agencies for seniors', displayOrder: 10 },
      { name: 'Support Groups', slug: 'support-groups', description: 'Support groups and communities for various health conditions', displayOrder: 11 },
      { name: 'Safety & Protection', slug: 'safety-protection', description: 'Safety, protection, and advocacy services for seniors', displayOrder: 12 },
      { name: 'Community Centers', slug: 'community-centers', description: 'Senior centers and community resources', displayOrder: 13 },
      { name: 'Training & Education', slug: 'training-education', description: 'Educational programs and training for seniors', displayOrder: 14 },
      { name: 'Veterans Services', slug: 'veterans-services', description: 'Services specifically for veterans', displayOrder: 15 },
      { name: 'Insurance & Healthcare', slug: 'insurance-healthcare', description: 'Insurance providers and healthcare resources', displayOrder: 16 },
      { name: 'Emergency Services', slug: 'emergency-services', description: 'Emergency assistance and rescue services', displayOrder: 17 }
    ];
    
    const categoryIds = {};
    
    for (const cat of categories) {
      const result = await client.query(`
        INSERT INTO marketplace_categories (name, slug, description, display_order)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (slug) DO UPDATE SET name = $1, description = $3, display_order = $4
        RETURNING id
      `, [cat.name, cat.slug, cat.description, cat.displayOrder]);
      categoryIds[cat.slug] = result.rows[0].id;
    }
    
    // Now add all the senior resources
    const resources = [
      // Government Services
      {
        categoryId: categoryIds['government-services'],
        name: 'Social Security Administration',
        slug: 'social-security-administration',
        description: 'Official Social Security Administration for benefits, Medicare enrollment, and retirement planning',
        shortDescription: 'Social Security benefits and Medicare enrollment',
        externalUrl: 'https://www.ssa.gov/',
        logoUrl: '/api/placeholder/150/150',
        isFeatured: true,
        displayOrder: 1
      },
      {
        categoryId: categoryIds['government-services'],
        name: 'Adult Protective Services (APS)',
        slug: 'adult-protective-services',
        description: 'Adult Protective Services helps protect vulnerable adults from abuse, neglect, and exploitation. Available in every county.',
        shortDescription: 'Protection from elder abuse and neglect',
        externalUrl: 'https://www.napsa-now.org/get-help/help-in-your-area/',
        logoUrl: '/api/placeholder/150/150',
        isFeatured: true,
        displayOrder: 2
      },
      {
        categoryId: categoryIds['government-services'],
        name: 'Long-Term Care Ombudsman',
        slug: 'ltc-ombudsman',
        description: 'Advocates for residents of nursing homes, assisted living facilities, and other long-term care facilities',
        shortDescription: 'Advocacy for long-term care residents',
        externalUrl: 'https://ltcombudsman.org/',
        logoUrl: '/api/placeholder/150/150',
        isFeatured: true,
        displayOrder: 3
      },
      
      // Community Centers
      {
        categoryId: categoryIds['community-centers'],
        name: 'National Council on Aging - Senior Centers',
        slug: 'ncoa-senior-centers',
        description: 'Find local senior centers offering activities, meals, health programs, and social opportunities',
        shortDescription: 'Find local senior centers near you',
        externalUrl: 'https://www.ncoa.org/article/senior-center-facts',
        logoUrl: '/api/placeholder/150/150',
        isFeatured: true,
        displayOrder: 1
      },
      {
        categoryId: categoryIds['community-centers'],
        name: 'Disability Action Centers',
        slug: 'disability-action-centers',
        description: 'Independent living centers providing services, advocacy, and resources for people with disabilities',
        shortDescription: 'Support for seniors with disabilities',
        externalUrl: 'https://www.ilru.org/projects/cil-net/cil-center-and-association-directory',
        logoUrl: '/api/placeholder/150/150',
        isFeatured: false,
        displayOrder: 2
      },
      
      // Support Groups
      {
        categoryId: categoryIds['support-groups'],
        name: 'Alzheimer\'s Association',
        slug: 'alzheimers-association',
        description: 'Support groups, education, and resources for Alzheimer\'s and dementia patients and caregivers',
        shortDescription: 'Alzheimer\'s and dementia support',
        externalUrl: 'https://www.alz.org/',
        logoUrl: '/api/placeholder/150/150',
        isFeatured: true,
        displayOrder: 1
      },
      {
        categoryId: categoryIds['support-groups'],
        name: 'Parkinson\'s Foundation',
        slug: 'parkinsons-foundation',
        description: 'Resources, support groups, and educational programs for people with Parkinson\'s disease',
        shortDescription: 'Parkinson\'s disease support and resources',
        externalUrl: 'https://www.parkinson.org/',
        logoUrl: '/api/placeholder/150/150',
        isFeatured: false,
        displayOrder: 2
      },
      {
        categoryId: categoryIds['support-groups'],
        name: 'American Cancer Society',
        slug: 'american-cancer-society',
        description: 'Cancer support services, transportation to treatment, lodging assistance, and support groups',
        shortDescription: 'Cancer support and resources',
        externalUrl: 'https://www.cancer.org/',
        logoUrl: '/api/placeholder/150/150',
        isFeatured: true,
        displayOrder: 3
      },
      
      // Safety & Protection
      {
        categoryId: categoryIds['safety-protection'],
        name: 'OneSAFE Place',
        slug: 'one-safe-place',
        description: 'Domestic violence prevention and intervention services for seniors experiencing abuse',
        shortDescription: 'Safety resources for domestic violence',
        externalUrl: 'https://www.onesafeplace.org/',
        logoUrl: '/api/placeholder/150/150',
        isFeatured: false,
        displayOrder: 1
      },
      {
        categoryId: categoryIds['emergency-services'],
        name: 'Salvation Army',
        slug: 'salvation-army',
        description: 'Emergency assistance, food programs, housing support, and senior services',
        shortDescription: 'Emergency assistance and support',
        externalUrl: 'https://www.salvationarmyusa.org/',
        logoUrl: '/api/placeholder/150/150',
        isFeatured: true,
        displayOrder: 1
      },
      {
        categoryId: categoryIds['emergency-services'],
        name: 'Rescue Missions Directory',
        slug: 'rescue-missions',
        description: 'Find local rescue missions providing emergency shelter, meals, and support services',
        shortDescription: 'Emergency shelter and meals',
        externalUrl: 'https://www.agrm.org/find-a-mission/',
        logoUrl: '/api/placeholder/150/150',
        isFeatured: false,
        displayOrder: 2
      },
      
      // Training & Education
      {
        categoryId: categoryIds['training-education'],
        name: 'AARP Technology Training',
        slug: 'aarp-tech-training',
        description: 'Free smartphone and technology training programs specifically designed for seniors',
        shortDescription: 'Smartphone and tech training for seniors',
        externalUrl: 'https://www.aarp.org/home-family/personal-technology/',
        logoUrl: '/api/placeholder/150/150',
        isFeatured: true,
        displayOrder: 1
      },
      {
        categoryId: categoryIds['training-education'],
        name: 'Senior Planet',
        slug: 'senior-planet',
        description: 'Technology training, online classes, and digital literacy programs for older adults',
        shortDescription: 'Digital literacy and online classes',
        externalUrl: 'https://seniorplanet.org/',
        logoUrl: '/api/placeholder/150/150',
        isFeatured: false,
        displayOrder: 2
      },
      {
        categoryId: categoryIds['training-education'],
        name: 'Health Education for Seniors',
        slug: 'health-education-seniors',
        description: 'NIH Senior Health provides reliable health information specifically for older adults',
        shortDescription: 'Health education and wellness resources',
        externalUrl: 'https://www.nia.nih.gov/',
        logoUrl: '/api/placeholder/150/150',
        isFeatured: false,
        displayOrder: 3
      },
      
      // Veterans Services
      {
        categoryId: categoryIds['veterans-services'],
        name: 'Nation\'s Finest',
        slug: 'nations-finest',
        description: 'Comprehensive services for veterans including housing, healthcare, and employment assistance',
        shortDescription: 'Veteran support services',
        externalUrl: 'https://www.nationsfinest.org/',
        logoUrl: '/api/placeholder/150/150',
        isFeatured: true,
        displayOrder: 1
      },
      {
        categoryId: categoryIds['veterans-services'],
        name: 'VA Benefits & Healthcare',
        slug: 'va-benefits',
        description: 'Official VA portal for veterans benefits, healthcare enrollment, and services',
        shortDescription: 'VA benefits and healthcare',
        externalUrl: 'https://www.va.gov/',
        logoUrl: '/api/placeholder/150/150',
        isFeatured: true,
        displayOrder: 2
      },
      
      // Insurance & Healthcare
      {
        categoryId: categoryIds['insurance-healthcare'],
        name: 'Medicare.gov',
        slug: 'medicare-gov',
        description: 'Official Medicare site for plan comparison, doctor lookup, and coverage information',
        shortDescription: 'Medicare plans and doctor finder',
        externalUrl: 'https://www.medicare.gov/',
        logoUrl: '/api/placeholder/150/150',
        isFeatured: true,
        displayOrder: 1
      },
      {
        categoryId: categoryIds['insurance-healthcare'],
        name: 'UnitedHealthcare',
        slug: 'unitedhealthcare',
        description: 'Medicare Advantage plans, doctor lookup, and senior health insurance options',
        shortDescription: 'Medicare Advantage and doctor finder',
        externalUrl: 'https://www.uhc.com/',
        logoUrl: '/api/placeholder/150/150',
        isFeatured: false,
        displayOrder: 2
      },
      {
        categoryId: categoryIds['insurance-healthcare'],
        name: 'Humana',
        slug: 'humana',
        description: 'Medicare plans, prescription coverage, and provider directory for seniors',
        shortDescription: 'Medicare plans and provider search',
        externalUrl: 'https://www.humana.com/',
        logoUrl: '/api/placeholder/150/150',
        isFeatured: false,
        displayOrder: 3
      },
      {
        categoryId: categoryIds['insurance-healthcare'],
        name: 'Anthem Blue Cross',
        slug: 'anthem-blue-cross',
        description: 'Medicare supplements, Advantage plans, and healthcare provider directory',
        shortDescription: 'Medicare plans and doctor lookup',
        externalUrl: 'https://www.anthem.com/',
        logoUrl: '/api/placeholder/150/150',
        isFeatured: false,
        displayOrder: 4
      },
      {
        categoryId: categoryIds['insurance-healthcare'],
        name: 'Kaiser Permanente',
        slug: 'kaiser-permanente',
        description: 'Integrated healthcare system with Medicare plans and provider services',
        shortDescription: 'Healthcare and Medicare services',
        externalUrl: 'https://healthy.kaiserpermanente.org/',
        logoUrl: '/api/placeholder/150/150',
        isFeatured: false,
        displayOrder: 5
      }
    ];
    
    // Insert all resources
    for (const resource of resources) {
      await client.query(`
        INSERT INTO marketplace_vendors (
          category_id, name, slug, description, short_description, 
          external_url, logo_url, is_featured, is_hidden, display_order, link_type
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (slug) DO UPDATE SET 
          category_id = $1,
          name = $2, 
          description = $4, 
          short_description = $5,
          external_url = $6,
          logo_url = $7,
          is_featured = $8,
          display_order = $10
      `, [
        resource.categoryId,
        resource.name,
        resource.slug,
        resource.description,
        resource.shortDescription,
        resource.externalUrl,
        resource.logoUrl,
        resource.isFeatured,
        false, // is_hidden
        resource.displayOrder,
        'standard' // link_type
      ]);
      
      console.log(`✅ Added resource: ${resource.name}`);
    }
    
    await client.query('COMMIT');
    console.log('\n🎉 Successfully added all senior resources to the database!');
    
    // Show summary
    const countResult = await client.query(`
      SELECT c.name as category, COUNT(v.id) as count
      FROM marketplace_categories c
      LEFT JOIN marketplace_vendors v ON v.category_id = c.id
      WHERE v.is_hidden = false
      GROUP BY c.name
      ORDER BY c.display_order
    `);
    
    console.log('\n📊 Resources Summary:');
    console.log('========================');
    countResult.rows.forEach(row => {
      console.log(`${row.category}: ${row.count} resources`);
    });
    
    const totalResult = await client.query(`
      SELECT COUNT(*) as total FROM marketplace_vendors WHERE is_hidden = false
    `);
    console.log(`\nTotal Resources Available: ${totalResult.rows[0].total}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding senior resources:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
addSeniorResources().catch(console.error);