import { db } from '../db';
import { healthcareProviders } from '@shared/schema';

const sampleProviders = [
  {
    businessName: 'Comfort Care Home Health',
    contactName: 'Sarah Johnson',
    email: 'info@comfortcarehh.com',
    phone: '555-0101',
    website: 'https://comfortcarehh.com',
    serviceType: 'home_health',
    description: 'Providing compassionate home health care services including skilled nursing, therapy, and personal care assistance.',
    services: ['Skilled Nursing', 'Physical Therapy', 'Personal Care', 'Medication Management'],
    certifications: ['Medicare Certified', 'Medicaid Certified', 'Joint Commission Accredited'],
    insuranceAccepted: ['Medicare', 'Medicaid', 'Private Insurance'],
    serviceAreas: ['Los Angeles', 'Orange County', 'Ventura County'],
    states: ['CA'],
    address: '123 Health Way',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90001',
    isVerified: true,
    isActive: true,
    metadata: {
      yearsInBusiness: 15,
      employeeCount: '50-100',
      languages: ['English', 'Spanish', 'Mandarin'],
      emergencyAvailable: true,
      acceptingNewPatients: true
    }
  },
  {
    businessName: 'Serenity Hospice Services',
    contactName: 'Michael Chen',
    email: 'care@serenityhospice.org',
    phone: '555-0102',
    website: 'https://serenityhospice.org',
    serviceType: 'hospice',
    description: 'Compassionate end-of-life care focusing on comfort, dignity, and family support.',
    services: ['Pain Management', 'Emotional Support', 'Respite Care', 'Bereavement Counseling'],
    certifications: ['Medicare Certified', 'CHAP Accredited'],
    insuranceAccepted: ['Medicare', 'Medicaid', 'Most Private Insurance'],
    serviceAreas: ['New York City', 'Long Island', 'Westchester'],
    states: ['NY'],
    address: '456 Peaceful Lane',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    isVerified: true,
    isActive: true,
    metadata: {
      yearsInBusiness: 20,
      employeeCount: '100-200',
      languages: ['English', 'Spanish', 'Russian'],
      emergencyAvailable: true,
      acceptingNewPatients: true
    }
  },
  {
    businessName: 'Active Life Physical Therapy',
    contactName: 'Dr. Robert Martinez',
    email: 'appointments@activelifept.com',
    phone: '555-0103',
    website: 'https://activelifept.com',
    serviceType: 'physical_therapy',
    description: 'Specialized physical therapy for seniors, focusing on mobility, balance, and fall prevention.',
    services: ['Balance Training', 'Gait Training', 'Pain Relief', 'Post-Surgery Rehabilitation'],
    certifications: ['Board Certified', 'Medicare Provider'],
    insuranceAccepted: ['Medicare', 'Most PPO Plans'],
    serviceAreas: ['Miami', 'Fort Lauderdale', 'West Palm Beach'],
    states: ['FL'],
    address: '789 Therapy Blvd',
    city: 'Miami',
    state: 'FL',
    zipCode: '33101',
    isVerified: true,
    isActive: true,
    metadata: {
      yearsInBusiness: 10,
      employeeCount: '10-25',
      languages: ['English', 'Spanish'],
      emergencyAvailable: false,
      acceptingNewPatients: true
    }
  },
  {
    businessName: 'Golden Years Adult Day Care',
    contactName: 'Patricia Williams',
    email: 'info@goldenyearsadc.com',
    phone: '555-0104',
    website: 'https://goldenyearsadc.com',
    serviceType: 'adult_day',
    description: 'Engaging daily activities, socialization, and care for seniors in a safe, supportive environment.',
    services: ['Social Activities', 'Meals', 'Health Monitoring', 'Transportation'],
    certifications: ['State Licensed', 'NADSA Member'],
    insuranceAccepted: ['Medicaid', 'Private Pay', 'Veterans Benefits'],
    serviceAreas: ['Chicago', 'Suburbs'],
    states: ['IL'],
    address: '321 Community Center Dr',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60601',
    isVerified: true,
    isActive: true,
    metadata: {
      yearsInBusiness: 8,
      employeeCount: '25-50',
      languages: ['English', 'Polish', 'Spanish'],
      emergencyAvailable: false,
      acceptingNewPatients: true
    }
  },
  {
    businessName: 'MedEquip Solutions',
    contactName: 'James Anderson',
    email: 'orders@medequipsolutions.com',
    phone: '555-0105',
    website: 'https://medequipsolutions.com',
    serviceType: 'medical_equipment',
    description: 'Durable medical equipment and supplies for home care, including wheelchairs, walkers, and oxygen equipment.',
    services: ['Equipment Rental', 'Equipment Sales', 'Delivery', 'Setup & Training'],
    certifications: ['Medicare DME Supplier', 'ACHC Accredited'],
    insuranceAccepted: ['Medicare', 'Medicaid', 'Private Insurance'],
    serviceAreas: ['Houston', 'Dallas', 'Austin', 'San Antonio'],
    states: ['TX'],
    address: '555 Equipment Way',
    city: 'Houston',
    state: 'TX',
    zipCode: '77001',
    isVerified: true,
    isActive: true,
    metadata: {
      yearsInBusiness: 12,
      employeeCount: '50-100',
      languages: ['English', 'Spanish'],
      emergencyAvailable: true,
      acceptingNewPatients: true
    }
  },
  {
    businessName: 'Mind Wellness Mental Health Services',
    contactName: 'Dr. Emily Thompson',
    email: 'appointments@mindwellness.org',
    phone: '555-0106',
    website: 'https://mindwellness.org',
    serviceType: 'mental_health',
    description: 'Specialized mental health services for seniors, including therapy for depression, anxiety, and dementia support.',
    services: ['Individual Therapy', 'Group Therapy', 'Cognitive Assessments', 'Family Counseling'],
    certifications: ['Board Certified Psychiatrists', 'Licensed Clinical Psychologists'],
    insuranceAccepted: ['Medicare', 'Most Insurance Plans'],
    serviceAreas: ['Boston', 'Cambridge', 'Brookline'],
    states: ['MA'],
    address: '888 Wellness Rd',
    city: 'Boston',
    state: 'MA',
    zipCode: '02101',
    isVerified: true,
    isActive: true,
    metadata: {
      yearsInBusiness: 18,
      employeeCount: '25-50',
      languages: ['English', 'Spanish', 'Portuguese'],
      emergencyAvailable: false,
      acceptingNewPatients: true
    }
  },
  {
    businessName: 'Helping Hands Personal Care',
    contactName: 'Maria Garcia',
    email: 'care@helpinghandspca.com',
    phone: '555-0107',
    website: 'https://helpinghandspca.com',
    serviceType: 'personal_care',
    description: 'Non-medical personal care services including companionship, meal preparation, and assistance with daily activities.',
    services: ['Companionship', 'Meal Preparation', 'Light Housekeeping', 'Transportation'],
    certifications: ['State Licensed', 'Bonded and Insured'],
    insuranceAccepted: ['Long-term Care Insurance', 'Private Pay'],
    serviceAreas: ['Phoenix', 'Scottsdale', 'Tempe'],
    states: ['AZ'],
    address: '222 Care Circle',
    city: 'Phoenix',
    state: 'AZ',
    zipCode: '85001',
    isVerified: true,
    isActive: true,
    metadata: {
      yearsInBusiness: 6,
      employeeCount: '10-25',
      languages: ['English', 'Spanish'],
      emergencyAvailable: true,
      acceptingNewPatients: true
    }
  },
  {
    businessName: 'Speech & Language Therapy Associates',
    contactName: 'Dr. Lisa Park',
    email: 'info@speechtherapyassoc.com',
    phone: '555-0108',
    website: 'https://speechtherapyassoc.com',
    serviceType: 'speech_therapy',
    description: 'Specialized speech therapy for seniors with swallowing difficulties, stroke recovery, and communication disorders.',
    services: ['Swallowing Therapy', 'Voice Therapy', 'Cognitive-Communication Therapy', 'Aphasia Treatment'],
    certifications: ['ASHA Certified', 'Medicare Provider'],
    insuranceAccepted: ['Medicare', 'Most Insurance Plans'],
    serviceAreas: ['Seattle', 'Bellevue', 'Tacoma'],
    states: ['WA'],
    address: '777 Communication Way',
    city: 'Seattle',
    state: 'WA',
    zipCode: '98101',
    isVerified: true,
    isActive: true,
    metadata: {
      yearsInBusiness: 14,
      employeeCount: '10-25',
      languages: ['English', 'Korean', 'Japanese'],
      emergencyAvailable: false,
      acceptingNewPatients: true
    }
  },
  {
    businessName: 'Comfort Keepers Respite Care',
    contactName: 'John Davis',
    email: 'respite@comfortkeepers.com',
    phone: '555-0109',
    website: 'https://comfortkeepersrespite.com',
    serviceType: 'respite',
    description: 'Temporary relief for family caregivers, providing professional care for your loved ones.',
    services: ['Short-term Care', 'Overnight Care', 'Weekend Care', 'Vacation Coverage'],
    certifications: ['State Licensed', 'Insured'],
    insuranceAccepted: ['Long-term Care Insurance', 'Veterans Benefits', 'Private Pay'],
    serviceAreas: ['Denver', 'Aurora', 'Lakewood'],
    states: ['CO'],
    address: '999 Respite Lane',
    city: 'Denver',
    state: 'CO',
    zipCode: '80201',
    isVerified: true,
    isActive: true,
    metadata: {
      yearsInBusiness: 9,
      employeeCount: '25-50',
      languages: ['English', 'Spanish'],
      emergencyAvailable: true,
      acceptingNewPatients: true
    }
  },
  {
    businessName: 'Reliable Medical Transport',
    contactName: 'Tom Wilson',
    email: 'dispatch@reliablemedtransport.com',
    phone: '555-0110',
    website: 'https://reliablemedtransport.com',
    serviceType: 'transportation',
    description: 'Non-emergency medical transportation for seniors to appointments, treatments, and therapy sessions.',
    services: ['Wheelchair Transport', 'Ambulatory Transport', 'Door-to-Door Service', 'Round Trip Service'],
    certifications: ['DOT Certified', 'State Licensed'],
    insuranceAccepted: ['Medicaid', 'Some Insurance Plans', 'Private Pay'],
    serviceAreas: ['Atlanta', 'Metro Area'],
    states: ['GA'],
    address: '444 Transport Blvd',
    city: 'Atlanta',
    state: 'GA',
    zipCode: '30301',
    isVerified: true,
    isActive: true,
    metadata: {
      yearsInBusiness: 7,
      employeeCount: '10-25',
      languages: ['English', 'Spanish'],
      emergencyAvailable: false,
      acceptingNewPatients: true
    }
  }
];

async function seedHealthcareProviders() {
  console.log('Seeding healthcare providers...');
  
  try {
    for (const provider of sampleProviders) {
      await db.insert(healthcareProviders).values({
        ...provider,
        viewCount: Math.floor(Math.random() * 100)
      }).onConflictDoNothing();
      console.log(`Added: ${provider.businessName}`);
    }
    
    console.log('Successfully seeded healthcare providers!');
  } catch (error) {
    console.error('Error seeding healthcare providers:', error);
  }
  
  process.exit(0);
}

seedHealthcareProviders();