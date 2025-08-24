import { db, pool } from '../db';
import { communities } from '../../shared/schema';

async function addCostaRicaPanamaCommunities() {
  console.log('🌴 Adding Costa Rica and Panama communities...');
  
  try {
    // Costa Rica Communities - Simplified data
    const costaRicaCommunities = [
      {
        name: "Verdeza Retirement Community",
        address: "Trejos Montealegre",
        city: "Escazú",
        state: "San José",
        zipCode: "10201",
        country: "CR",
        phone: "+506 2289-8979",
        website: "https://www.verdeza.com",
        description: "Premier continuing care retirement community with 61 apartments and 24-hour nursing care",
        latitude: 9.9190,
        longitude: -84.1390,
        capacity: 61,
        careTypes: ["Assisted Living", "Memory Care", "Skilled Nursing"],
        amenities: ["24-Hour Care", "Dining Services", "Activities", "Gardens", "Medical Services"],
        yearEstablished: 2015,
        acceptsMedicaid: false,
        acceptsMedicare: false,
        hasAvailability: true,
        rentPerMonth: 3500
      },
      {
        name: "José Pujol Retirement Community",
        address: "La Ribera de Belén",
        city: "Heredia",
        state: "Heredia",
        zipCode: "40701",
        country: "CR",
        phone: "+506 2239-0295",
        website: "https://www.residenciajosepujol.com",
        description: "Faith-based retirement community with 26 apartments and Spanish Country Club access",
        latitude: 9.9795,
        longitude: -84.1841,
        capacity: 26,
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Country Club Access", "Fitness Center", "All Meals", "Housekeeping", "Activities"],
        yearEstablished: 2005,
        acceptsMedicaid: false,
        acceptsMedicare: false,
        hasAvailability: true,
        rentPerMonth: 2800
      },
      {
        name: "Villa Alegría Senior Living",
        address: "Santa Ana",
        city: "Santa Ana",
        state: "San José",
        zipCode: "10901",
        country: "CR",
        phone: "+506 2282-5555",
        description: "Small family-style home with capacity for 7 residents",
        latitude: 9.9326,
        longitude: -84.1816,
        capacity: 7,
        careTypes: ["Assisted Living", "Residential Care"],
        amenities: ["Home-Cooked Meals", "Personal Care", "Activities", "Garden"],
        yearEstablished: 2010,
        acceptsMedicaid: false,
        acceptsMedicare: false,
        hasAvailability: true,
        rentPerMonth: 2000
      },
      {
        name: "Tamarindo Senior Residence",
        address: "Tamarindo Beach Road",
        city: "Tamarindo",
        state: "Guanacaste",
        zipCode: "50309",
        country: "CR",
        phone: "+506 2653-0000",
        description: "Beach community senior living with ocean views",
        latitude: 10.2989,
        longitude: -85.8406,
        capacity: 20,
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Ocean Views", "Pool", "Beach Access", "Restaurant", "Transportation"],
        yearEstablished: 2018,
        acceptsMedicaid: false,
        acceptsMedicare: false,
        hasAvailability: true,
        rentPerMonth: 2500
      },
      {
        name: "Atenas Golden Years",
        address: "Central Atenas",
        city: "Atenas",
        state: "Alajuela",
        zipCode: "20501",
        country: "CR",
        phone: "+506 2446-5000",
        description: "Small town retirement with perfect climate year-round",
        latitude: 9.9772,
        longitude: -84.3797,
        capacity: 12,
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Gardens", "Library", "Dining", "Transportation", "Activities"],
        yearEstablished: 2012,
        acceptsMedicaid: false,
        acceptsMedicare: false,
        hasAvailability: true,
        rentPerMonth: 2200
      }
    ];

    // Panama Communities - Simplified data
    const panamaCommunities = [
      {
        name: "Golden Years Facility",
        address: "Via España",
        city: "Panama City",
        state: "Panama",
        zipCode: "0801",
        country: "PA",
        phone: "+507 264-8888",
        description: "New North American-style independent and assisted living facility",
        latitude: 8.9824,
        longitude: -79.5199,
        capacity: 45,
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Pool", "Fitness Center", "Restaurant", "Medical Clinic", "Activities"],
        yearEstablished: 2024,
        acceptsMedicaid: false,
        acceptsMedicare: false,
        hasAvailability: true,
        rentPerMonth: 3200
      },
      {
        name: "Boquete Mountain Retreat",
        address: "Alto Boquete",
        city: "Boquete",
        state: "Chiriquí",
        zipCode: "0413",
        country: "PA",
        phone: "+507 720-2000",
        description: "Mountain retirement community with spring-like climate year-round",
        latitude: 8.7764,
        longitude: -82.4321,
        capacity: 25,
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Mountain Views", "Gardens", "Coffee Shop", "Library", "Activities"],
        yearEstablished: 2016,
        acceptsMedicaid: false,
        acceptsMedicare: false,
        hasAvailability: true,
        rentPerMonth: 2200
      },
      {
        name: "Valle Escondido Senior Living",
        address: "Valle Escondido Resort",
        city: "Boquete",
        state: "Chiriquí",
        zipCode: "0413",
        country: "PA",
        phone: "+507 720-2454",
        description: "Resort-style retirement within gated community",
        latitude: 8.7523,
        longitude: -82.4156,
        capacity: 20,
        careTypes: ["Independent Living"],
        amenities: ["Golf Course", "Spa", "Restaurant", "Fitness", "Security"],
        yearEstablished: 2018,
        acceptsMedicaid: false,
        acceptsMedicare: false,
        hasAvailability: true,
        rentPerMonth: 2800
      },
      {
        name: "Coronado Bay Senior Resort",
        address: "Avenida Roberto Eisenmann",
        city: "Coronado",
        state: "Panama Oeste",
        zipCode: "0301",
        country: "PA",
        phone: "+507 240-4444",
        description: "Beach resort retirement community on Pacific coast",
        latitude: 8.6341,
        longitude: -79.8762,
        capacity: 35,
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Beach Access", "Pool", "Golf", "Marina", "Shopping"],
        yearEstablished: 2017,
        acceptsMedicaid: false,
        acceptsMedicare: false,
        hasAvailability: true,
        rentPerMonth: 2600
      },
      {
        name: "David Senior Care Center",
        address: "Via Interamericana",
        city: "David",
        state: "Chiriquí",
        zipCode: "0426",
        country: "PA",
        phone: "+507 774-5000",
        description: "Full-service senior care in Panama's second-largest city",
        latitude: 8.4333,
        longitude: -82.4333,
        capacity: 40,
        careTypes: ["Assisted Living", "Skilled Nursing", "Memory Care"],
        amenities: ["Medical Services", "Therapy", "Dining", "Activities", "Chapel"],
        yearEstablished: 2010,
        acceptsMedicaid: false,
        acceptsMedicare: false,
        hasAvailability: true,
        rentPerMonth: 1800
      }
    ];

    // Insert Costa Rica communities
    console.log('🇨🇷 Inserting Costa Rica communities...');
    for (const community of costaRicaCommunities) {
      await db.insert(communities).values(community).onConflictDoNothing();
    }
    console.log(`✅ Added ${costaRicaCommunities.length} Costa Rica communities`);

    // Insert Panama communities
    console.log('🇵🇦 Inserting Panama communities...');
    for (const community of panamaCommunities) {
      await db.insert(communities).values(community).onConflictDoNothing();
    }
    console.log(`✅ Added ${panamaCommunities.length} Panama communities`);

    console.log('🎉 Successfully added all Costa Rica and Panama communities!');
    console.log('📊 Total added: ' + (costaRicaCommunities.length + panamaCommunities.length) + ' facilities');
    
  } catch (error) {
    console.error('❌ Error adding communities:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the script
addCostaRicaPanamaCommunities().catch(console.error);