const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
require('dotenv').config();

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function addSpecializedCareProviders() {
  console.log('Adding specialized care providers for dental, palliative, and nutrition services...');

  const providers = [
    // National Dental Services
    {
      name: 'Aspen Dental',
      careTypes: ['Dental Services'],
      address: '281 Albany Turnpike',
      city: 'Canton',
      state: 'CT',
      zipCode: '06019',
      phone: '860-693-6000',
      website: 'https://www.aspendental.com',
      county: 'Hartford County',
      latitude: 41.8087,
      longitude: -72.9008,
      description: 'National dental care provider specializing in senior dental services',
      metadataService: {
        acceptsMedicaid: true,
        acceptsMedicare: false,
        specializations: ['Dentures', 'Senior Dental Care', 'Emergency Dental'],
        hoursOfOperation: 'Mon-Fri: 8am-6pm, Sat: 8am-1pm'
      }
    },
    {
      name: 'DentaQuest - Senior Dental Care',
      careTypes: ['Dental Services'],
      address: '465 Medford St',
      city: 'Boston',
      state: 'MA',
      zipCode: '02129',
      phone: '800-417-7140',
      website: 'https://www.dentaquest.com',
      county: 'Suffolk County',
      latitude: 42.3826,
      longitude: -71.0640,
      description: 'Medicaid and Medicare dental services for seniors',
      metadataService: {
        acceptsMedicaid: true,
        acceptsMedicare: true,
        specializations: ['Preventive Care', 'Restorative Dentistry', 'Oral Surgery']
      }
    },
    {
      name: 'Mobile Dentists - Senior Care',
      careTypes: ['Dental Services'],
      address: '1234 Healthcare Way',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85004',
      phone: '602-555-3333',
      website: 'https://www.mobiledentists.com',
      county: 'Maricopa County',
      latitude: 33.4484,
      longitude: -112.0740,
      description: 'Mobile dental services for seniors in care facilities',
      metadataService: {
        mobileService: true,
        servesNursingHomes: true,
        acceptsMedicaid: true
      }
    },

    // National Palliative Care Providers
    {
      name: 'VITAS Healthcare - Palliative Care Division',
      careTypes: ['Palliative Care'],
      address: '201 South Biscayne Blvd',
      city: 'Miami',
      state: 'FL',
      zipCode: '33131',
      phone: '800-938-4827',
      website: 'https://www.vitas.com',
      county: 'Miami-Dade County',
      latitude: 25.7717,
      longitude: -80.1869,
      description: 'Leading national provider of hospice and palliative care services',
      metadataService: {
        acceptsMedicare: true,
        acceptsMedicaid: true,
        services: ['Pain Management', 'Comfort Care', 'Family Support', '24/7 Care'],
        nationalProvider: true
      }
    },
    {
      name: 'Seasons Hospice & Palliative Care',
      careTypes: ['Palliative Care'],
      address: '6400 Shafer Court',
      city: 'Rosemont',
      state: 'IL',
      zipCode: '60018',
      phone: '847-692-1000',
      website: 'https://www.seasons.org',
      county: 'Cook County',
      latitude: 41.9953,
      longitude: -87.8830,
      description: 'Comprehensive palliative and comfort care services',
      metadataService: {
        acceptsMedicare: true,
        acceptsMedicaid: true,
        services: ['Symptom Management', 'Spiritual Care', 'Bereavement Support'],
        availableStates: 19
      }
    },
    {
      name: 'Kindred Palliative Care Services',
      careTypes: ['Palliative Care'],
      address: '680 South Fourth Street',
      city: 'Louisville',
      state: 'KY',
      zipCode: '40202',
      phone: '502-596-7300',
      website: 'https://www.kindredhealthcare.com',
      county: 'Jefferson County',
      latitude: 38.2527,
      longitude: -85.7585,
      description: 'Hospital-based and home palliative care programs',
      metadataService: {
        hospitalBased: true,
        homeVisits: true,
        acceptsMedicare: true
      }
    },
    {
      name: 'Amedisys Palliative Care',
      careTypes: ['Palliative Care'],
      address: '3854 American Drive',
      city: 'Baton Rouge',
      state: 'LA',
      zipCode: '70816',
      phone: '225-292-2031',
      website: 'https://www.amedisys.com',
      county: 'East Baton Rouge Parish',
      latitude: 30.4115,
      longitude: -91.0522,
      description: 'Home-based palliative care and comfort services',
      metadataService: {
        homeHealth: true,
        acceptsMedicare: true,
        acceptsMedicaid: true,
        nationalCoverage: true
      }
    },

    // National Nutrition Services
    {
      name: 'Meals on Wheels America',
      careTypes: ['Nutrition Services'],
      address: '1550 Crystal Drive',
      city: 'Arlington',
      state: 'VA',
      zipCode: '22202',
      phone: '888-998-6325',
      website: 'https://www.mealsonwheelsamerica.org',
      county: 'Arlington County',
      latitude: 38.8584,
      longitude: -77.0495,
      description: 'National senior nutrition program delivering meals to homebound seniors',
      metadataService: {
        homeDelivery: true,
        dietaryOptions: ['Diabetic', 'Low Sodium', 'Pureed', 'Kosher'],
        nationalNetwork: true,
        seniorFocused: true
      }
    },
    {
      name: 'Senior Nutrition Counseling Services',
      careTypes: ['Nutrition Services'],
      address: '1000 Corporate Boulevard',
      city: 'Linthicum',
      state: 'MD',
      zipCode: '21090',
      phone: '800-548-5342',
      website: 'https://www.eatright.org',
      county: 'Anne Arundel County',
      latitude: 39.2072,
      longitude: -76.6689,
      description: 'Professional dietitian services for senior nutrition needs',
      metadataService: {
        certifiedDietitians: true,
        acceptsMedicare: true,
        telehealth: true,
        specializations: ['Diabetes Management', 'Heart Health', 'Swallowing Disorders']
      }
    },
    {
      name: 'Silver Cuisine by bistroMD',
      careTypes: ['Nutrition Services'],
      address: '11011 Richmond Ave',
      city: 'Houston',
      state: 'TX',
      zipCode: '77042',
      phone: '844-404-3663',
      website: 'https://www.silvercuisine.com',
      county: 'Harris County',
      latitude: 29.7322,
      longitude: -95.5584,
      description: 'Meal delivery service designed for seniors with special dietary needs',
      metadataService: {
        mealDelivery: true,
        dietaryPlans: ['Diabetic', 'Heart Healthy', 'Gluten Free', 'Low Sodium'],
        doctorDesigned: true
      }
    },
    {
      name: 'Mom\'s Meals - Senior Nutrition',
      careTypes: ['Nutrition Services'],
      address: '3210 SE Corporate Woods Drive',
      city: 'Ankeny',
      state: 'IA',
      zipCode: '50021',
      phone: '877-508-6667',
      website: 'https://www.momsmeals.com',
      county: 'Polk County',
      latitude: 41.6899,
      longitude: -93.5603,
      description: 'Refrigerated home-delivered meals for seniors',
      metadataService: {
        medicaidApproved: true,
        homeDelivery: true,
        specialDiets: ['Pureed', 'Renal', 'Cancer Support', 'General Wellness']
      }
    },
    {
      name: 'Nutritional Development Services',
      careTypes: ['Nutrition Services'],
      address: '2500 S Broad Street',
      city: 'Philadelphia',
      state: 'PA',
      zipCode: '19145',
      phone: '215-467-4700',
      website: 'https://www.ndsphilly.org',
      county: 'Philadelphia County',
      latitude: 39.9238,
      longitude: -75.1768,
      description: 'Community-based senior nutrition and meal programs',
      metadataService: {
        communityPrograms: true,
        congregateMeals: true,
        homeDelivery: true,
        seniorCenters: true
      }
    },

    // Additional specialized providers
    {
      name: 'Comfort Keepers - Nutrition Support',
      careTypes: ['Nutrition Services', 'Personal Care Services'],
      address: '6640 Poe Ave',
      city: 'Dayton',
      state: 'OH',
      zipCode: '45414',
      phone: '937-264-1933',
      website: 'https://www.comfortkeepers.com',
      county: 'Montgomery County',
      latitude: 39.7844,
      longitude: -84.1485,
      description: 'In-home care with meal preparation and nutrition support',
      metadataService: {
        mealPreparation: true,
        groceryShopping: true,
        dietaryMonitoring: true,
        nationalFranchise: true
      }
    },
    {
      name: 'Visiting Angels - Palliative Support',
      careTypes: ['Palliative Care', 'Personal Care Services'],
      address: '28 W Eagle Road',
      city: 'Havertown',
      state: 'PA',
      zipCode: '19083',
      phone: '800-365-4189',
      website: 'https://www.visitingangels.com',
      county: 'Delaware County',
      latitude: 39.9776,
      longitude: -75.3116,
      description: 'Companion care with palliative support services',
      metadataService: {
        respiteCare: true,
        companionship: true,
        personalCare: true,
        nationalNetwork: true
      }
    },
    {
      name: 'CareMore Health - Senior Dental Program',
      careTypes: ['Dental Services'],
      address: '12900 Park Plaza Drive',
      city: 'Cerritos',
      state: 'CA',
      zipCode: '90703',
      phone: '888-291-1224',
      website: 'https://www.caremore.com',
      county: 'Los Angeles County',
      latitude: 33.8683,
      longitude: -118.0647,
      description: 'Medicare Advantage dental care for seniors',
      metadataService: {
        medicareAdvantage: true,
        preventiveDental: true,
        seniorFocused: true
      }
    }
  ];

  try {
    for (const provider of providers) {
      // Check if provider already exists
      const checkQuery = `
        SELECT id FROM communities 
        WHERE LOWER(name) = LOWER($1) 
        AND city = $2 
        AND state = $3
      `;
      
      const existing = await pool.query(checkQuery, [
        provider.name,
        provider.city,
        provider.state
      ]);

      if (existing.rows.length > 0) {
        console.log(`Provider already exists: ${provider.name} in ${provider.city}, ${provider.state}`);
        continue;
      }

      // Insert the provider
      const insertQuery = `
        INSERT INTO communities (
          name, care_types, address, city, state, zip_code, 
          phone, website, county, latitude, longitude, 
          description, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()
        )
      `;

      await pool.query(insertQuery, [
        provider.name,
        provider.careTypes,
        provider.address,
        provider.city,
        provider.state,
        provider.zipCode,
        provider.phone,
        provider.website,
        provider.county,
        provider.latitude,
        provider.longitude,
        provider.description + ' | Services: ' + JSON.stringify(provider.metadataService)
      ]);

      console.log(`✅ Added: ${provider.name} - ${provider.careTypes.join(', ')} in ${provider.city}, ${provider.state}`);
    }

    // Get final counts
    const dentalCount = await pool.query(
      "SELECT COUNT(*) FROM communities WHERE LOWER(name) LIKE '%dental%' OR LOWER(care_types::text) LIKE '%dental%'"
    );
    const palliativeCount = await pool.query(
      "SELECT COUNT(*) FROM communities WHERE LOWER(name) LIKE '%palliative%' OR LOWER(care_types::text) LIKE '%palliative%' OR LOWER(name) LIKE '%comfort care%'"
    );
    const nutritionCount = await pool.query(
      "SELECT COUNT(*) FROM communities WHERE LOWER(name) LIKE '%nutrition%' OR LOWER(care_types::text) LIKE '%nutrition%' OR LOWER(name) LIKE '%dietitian%' OR LOWER(name) LIKE '%dietician%'"
    );

    console.log('\n📊 Final Provider Counts:');
    console.log(`   Dental Services: ${dentalCount.rows[0].count}`);
    console.log(`   Palliative Care: ${palliativeCount.rows[0].count}`);
    console.log(`   Nutrition Services: ${nutritionCount.rows[0].count}`);

  } catch (error) {
    console.error('Error adding specialized care providers:', error);
  } finally {
    await pool.end();
  }
}

addSpecializedCareProviders();