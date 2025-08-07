import { db } from '../db';
import { healthcareProviders } from '@shared/schema';

// Arrays of real-sounding business names for each service type
const homeHealthNames = [
  'Comfort Care Home Health', 'Golden Years Home Care', 'Sunshine Home Health Services',
  'Family First Home Care', 'Caring Hearts Home Health', 'Premier Home Health Solutions',
  'Compassionate Care Home Health', 'Quality Home Health Services', 'Gentle Touch Home Care',
  'Harmony Home Health', 'Reliable Home Health Care', 'Serenity Home Health Services',
  'TenderCare Home Health', 'Unity Home Health Solutions', 'Wellness Home Health Care',
  'Vital Home Health Services', 'Guardian Home Health', 'Complete Home Health Care',
  'Trusted Home Health Services', 'Elite Home Health Care'
];

const hospiceNames = [
  'Serenity Hospice Care', 'Compassion Hospice Services', 'Grace Hospice',
  'Peaceful Journey Hospice', 'Comfort Hospice Care', 'Haven Hospice Services',
  'Dignity Hospice Care', 'Angel Wings Hospice', 'Sacred Heart Hospice',
  'Eternal Peace Hospice', 'Gentle Care Hospice', 'Hope Hospice Services'
];

const therapyNames = [
  'Active Life Physical Therapy', 'Motion Masters PT', 'Recovery Plus Therapy',
  'Restore Physical Therapy', 'Peak Performance PT', 'Mobility Solutions Therapy',
  'Balance & Motion PT', 'Progressive Therapy Services', 'Optimal Therapy Solutions',
  'Wellness Physical Therapy', 'Rehab Plus Therapy', 'Movement Therapy Center'
];

const adultDayNames = [
  'Golden Years Adult Day Center', 'Sunshine Adult Day Program', 'Community Care Day Center',
  'Active Seniors Day Program', 'Social Day Center', 'Friendship Adult Day Services',
  'Daily Activities Center', 'Senior Social Club', 'Day Break Adult Care',
  'Enrichment Day Program', 'Joyful Days Adult Center', 'Harmony Day Program'
];

const personalCareNames = [
  'Helping Hands Personal Care', 'Comfort Keepers', 'Caring Companions',
  'Daily Living Assistance', 'Personal Touch Care Services', 'Independent Living Support',
  'Quality Personal Care', 'Compassionate Caregivers', 'Home Helpers',
  'Life Assistance Services', 'Personal Care Solutions', 'Daily Care Support'
];

const states = ['CA', 'TX', 'FL', 'NY', 'PA', 'IL', 'OH', 'GA', 'NC', 'MI', 
                'NJ', 'VA', 'WA', 'AZ', 'MA', 'TN', 'IN', 'MO', 'MD', 'WI',
                'CO', 'MN', 'SC', 'AL', 'LA', 'KY', 'OR', 'OK', 'CT', 'UT',
                'IA', 'NV', 'AR', 'MS', 'KS', 'NM', 'NE', 'WV', 'ID', 'HI',
                'NH', 'ME', 'MT', 'RI', 'DE', 'SD', 'ND', 'AK', 'VT', 'WY'];

const cities = {
  'CA': ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento', 'San Jose'],
  'TX': ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth'],
  'FL': ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale'],
  'NY': ['New York', 'Buffalo', 'Rochester', 'Albany', 'Syracuse'],
  'PA': ['Philadelphia', 'Pittsburgh', 'Harrisburg', 'Allentown', 'Erie'],
  'IL': ['Chicago', 'Springfield', 'Rockford', 'Peoria', 'Naperville'],
  'OH': ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron'],
  'GA': ['Atlanta', 'Augusta', 'Columbus', 'Savannah', 'Athens'],
  'NC': ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem'],
  'MI': ['Detroit', 'Grand Rapids', 'Ann Arbor', 'Lansing', 'Flint']
};

const certifications = [
  ['Medicare Certified', 'Medicaid Certified'],
  ['Joint Commission Accredited', 'State Licensed'],
  ['CHAP Accredited', 'ACHC Accredited'],
  ['Medicare Provider', 'Board Certified'],
  ['State Licensed', 'Bonded and Insured']
];

const insuranceOptions = [
  ['Medicare', 'Medicaid', 'Private Insurance'],
  ['Medicare', 'Most PPO Plans'],
  ['Long-term Care Insurance', 'Private Pay'],
  ['Medicare', 'Veterans Benefits', 'Private Pay'],
  ['Medicaid', 'Private Pay', 'Some Insurance Plans']
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePhone(): string {
  const area = getRandomNumber(200, 999);
  const prefix = getRandomNumber(200, 999);
  const line = getRandomNumber(1000, 9999);
  return `${area}-${prefix}-${line}`;
}

function generateProviders(
  count: number,
  serviceType: string,
  namePool: string[],
  baseDescription: string
) {
  const providers = [];
  
  for (let i = 0; i < count; i++) {
    const state = getRandomElement(states);
    const cityList = cities[state] || ['City'];
    const city = getRandomElement(cityList);
    const nameIndex = i % namePool.length;
    const nameSuffix = i >= namePool.length ? ` ${Math.floor(i / namePool.length) + 1}` : '';
    const businessName = `${namePool[nameIndex]}${nameSuffix} - ${city}`;
    
    const provider = {
      businessName,
      contactName: `Manager ${i + 1}`,
      email: `info${i + 1}@healthcare-provider.com`,
      phone: generatePhone(),
      website: `https://provider${i + 1}.com`,
      serviceType,
      description: `${baseDescription} Serving ${city}, ${state} and surrounding areas with quality care.`,
      services: getServicesForType(serviceType),
      certifications: getRandomElement(certifications),
      insuranceAccepted: getRandomElement(insuranceOptions),
      serviceAreas: [city, `${state} Metro Area`],
      states: [state],
      address: `${getRandomNumber(100, 9999)} Healthcare Blvd`,
      city,
      state,
      zipCode: getRandomNumber(10000, 99999).toString(),
      isVerified: Math.random() > 0.3,
      isActive: true,
      viewCount: getRandomNumber(10, 500),
      metadata: {
        yearsInBusiness: getRandomNumber(1, 30),
        employeeCount: getRandomElement(['1-10', '10-25', '25-50', '50-100', '100+']),
        languages: ['English', 'Spanish'],
        emergencyAvailable: Math.random() > 0.5,
        acceptingNewPatients: Math.random() > 0.2
      }
    };
    
    providers.push(provider);
  }
  
  return providers;
}

function getServicesForType(serviceType: string): string[] {
  const serviceMap: { [key: string]: string[] } = {
    home_health: ['Skilled Nursing', 'Physical Therapy', 'Personal Care', 'Medication Management', 'Wound Care'],
    hospice: ['Pain Management', 'Emotional Support', 'Respite Care', 'Bereavement Counseling', '24/7 Support'],
    physical_therapy: ['Balance Training', 'Gait Training', 'Pain Relief', 'Post-Surgery Rehabilitation', 'Fall Prevention'],
    occupational_therapy: ['Daily Living Skills', 'Adaptive Equipment Training', 'Cognitive Rehabilitation', 'Work Conditioning'],
    speech_therapy: ['Swallowing Therapy', 'Voice Therapy', 'Cognitive-Communication Therapy', 'Aphasia Treatment'],
    adult_day: ['Social Activities', 'Meals', 'Health Monitoring', 'Transportation', 'Exercise Programs'],
    personal_care: ['Companionship', 'Meal Preparation', 'Light Housekeeping', 'Transportation', 'Bathing Assistance'],
    respite: ['Short-term Care', 'Overnight Care', 'Weekend Care', 'Vacation Coverage', 'Emergency Respite'],
    medical_equipment: ['Equipment Rental', 'Equipment Sales', 'Delivery', 'Setup & Training', 'Repairs'],
    mental_health: ['Individual Therapy', 'Group Therapy', 'Cognitive Assessments', 'Family Counseling', 'Crisis Support'],
    transportation: ['Wheelchair Transport', 'Ambulatory Transport', 'Door-to-Door Service', 'Round Trip Service']
  };
  
  return serviceMap[serviceType] || ['General Services', 'Consultation', 'Support Services'];
}

async function seedAllHealthcareProviders() {
  console.log('Starting comprehensive healthcare provider seeding...\n');
  
  try {
    // Clear existing providers first (optional - comment out if you want to keep existing)
    // await db.delete(healthcareProviders);
    
    // Generate providers for each service type
    const allProviders = [
      // 200 Home Health providers
      ...generateProviders(200, 'home_health', homeHealthNames, 
        'Providing compassionate home health care services including skilled nursing, therapy, and personal care assistance.'),
      
      // 74 Hospice providers
      ...generateProviders(74, 'hospice', hospiceNames,
        'Compassionate end-of-life care focusing on comfort, dignity, and family support.'),
      
      // Physical Therapy (part of 147 therapy services)
      ...generateProviders(50, 'physical_therapy', therapyNames,
        'Specialized physical therapy for seniors, focusing on mobility, balance, and fall prevention.'),
      
      // Occupational Therapy (part of 147 therapy services)
      ...generateProviders(47, 'occupational_therapy', therapyNames,
        'Helping seniors regain independence in daily activities through targeted therapy.'),
      
      // Speech Therapy (part of 147 therapy services)
      ...generateProviders(50, 'speech_therapy', therapyNames,
        'Specialized speech therapy for seniors with swallowing difficulties and communication disorders.'),
      
      // 707 Adult Day Programs
      ...generateProviders(707, 'adult_day', adultDayNames,
        'Engaging daily activities, socialization, and care for seniors in a safe, supportive environment.'),
      
      // 316 Personal Care Services
      ...generateProviders(316, 'personal_care', personalCareNames,
        'Non-medical personal care services including companionship, meal preparation, and assistance with daily activities.'),
      
      // Additional services to round out the offerings
      ...generateProviders(30, 'respite', personalCareNames,
        'Temporary relief for family caregivers, providing professional care for your loved ones.'),
      
      ...generateProviders(25, 'medical_equipment', ['MedEquip Solutions', 'Medical Supply Plus'],
        'Durable medical equipment and supplies for home care.'),
      
      ...generateProviders(35, 'mental_health', ['Mind Wellness', 'Senior Mental Health Services'],
        'Specialized mental health services for seniors.'),
      
      ...generateProviders(40, 'transportation', ['Reliable Transport', 'Senior Ride Services'],
        'Non-emergency medical transportation for seniors.')
    ];
    
    console.log(`Total providers to seed: ${allProviders.length}`);
    console.log('Starting database insertion...\n');
    
    // Insert in batches to avoid overwhelming the database
    const batchSize = 50;
    for (let i = 0; i < allProviders.length; i += batchSize) {
      const batch = allProviders.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(provider => 
          db.insert(healthcareProviders)
            .values(provider)
            .onConflictDoNothing()
        )
      );
      
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allProviders.length / batchSize)}`);
    }
    
    // Get final counts
    const counts = await db.select({
      serviceType: healthcareProviders.serviceType,
      count: db.count()
    })
    .from(healthcareProviders)
    .groupBy(healthcareProviders.serviceType);
    
    console.log('\n✅ Successfully seeded all healthcare providers!');
    console.log('\nFinal counts by service type:');
    counts.forEach(({ serviceType, count }) => {
      console.log(`  ${serviceType}: ${count} providers`);
    });
    
    const total = counts.reduce((sum, { count }) => sum + Number(count), 0);
    console.log(`\nTotal providers in database: ${total}`);
    
  } catch (error) {
    console.error('Error seeding healthcare providers:', error);
  }
  
  process.exit(0);
}

seedAllHealthcareProviders();