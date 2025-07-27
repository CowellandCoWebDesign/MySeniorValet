// Senior Services Integration System
// Comprehensive ecosystem of services for seniors and their families

export interface SeniorService {
  id: string;
  category: ServiceCategory;
  name: string;
  description: string;
  provider: string;
  address?: string;
  phone?: string;
  website?: string;
  email?: string;
  location: {
    lat: number;
    lng: number;
  };
  serviceArea?: string[];
  pricing?: string;
  availability?: string;
  features?: string[];
  rating?: number;
  verified?: boolean;
}

export enum ServiceCategory {
  MOVING = 'moving',
  RX_DELIVERY = 'prescription_delivery',
  JUNK_REMOVAL = 'junk_removal',
  STORAGE = 'storage',
  CELL_PHONE = 'cell_phone_access',
  SENIOR_CENTER = 'senior_center',
  OMBUDSMAN = 'ombudsman',
  MEDICAL_TRANSPORT = 'medical_transport',
  HOME_CARE = 'home_care',
  MEAL_DELIVERY = 'meal_delivery',
  LEGAL_SERVICES = 'legal_services',
  FINANCIAL_PLANNING = 'financial_planning',
  EQUIPMENT_RENTAL = 'medical_equipment',
  HOSPICE = 'hospice_care',
  ADULT_DAY_CARE = 'adult_day_care'
}

export const ServiceCategoryInfo = {
  [ServiceCategory.MOVING]: {
    icon: '📦',
    name: 'Moving Services',
    description: 'Senior-specialized moving and downsizing services'
  },
  [ServiceCategory.RX_DELIVERY]: {
    icon: '💊',
    name: 'Prescription Delivery',
    description: 'Medication delivery services for seniors'
  },
  [ServiceCategory.JUNK_REMOVAL]: {
    icon: '🚛',
    name: 'Junk Removal',
    description: 'Estate cleanout and junk removal services'
  },
  [ServiceCategory.STORAGE]: {
    icon: '🏢',
    name: 'Storage Solutions',
    description: 'Storage units and solutions for downsizing'
  },
  [ServiceCategory.CELL_PHONE]: {
    icon: '📱',
    name: 'Cell Phone Access',
    description: 'Low-income and senior phone programs'
  },
  [ServiceCategory.SENIOR_CENTER]: {
    icon: '🏛️',
    name: 'Senior Centers',
    description: 'Community centers for senior activities'
  },
  [ServiceCategory.OMBUDSMAN]: {
    icon: '⚖️',
    name: 'Ombudsman Services',
    description: 'Advocacy and complaint resolution for seniors'
  },
  [ServiceCategory.MEDICAL_TRANSPORT]: {
    icon: '🚑',
    name: 'Medical Transport',
    description: 'Non-emergency medical transportation'
  },
  [ServiceCategory.HOME_CARE]: {
    icon: '🏠',
    name: 'Home Care',
    description: 'In-home care and support services'
  },
  [ServiceCategory.MEAL_DELIVERY]: {
    icon: '🍽️',
    name: 'Meal Delivery',
    description: 'Meals on Wheels and delivery services'
  },
  [ServiceCategory.LEGAL_SERVICES]: {
    icon: '⚖️',
    name: 'Legal Services',
    description: 'Elder law and estate planning'
  },
  [ServiceCategory.FINANCIAL_PLANNING]: {
    icon: '💰',
    name: 'Financial Planning',
    description: 'Senior financial advisors'
  },
  [ServiceCategory.EQUIPMENT_RENTAL]: {
    icon: '🦽',
    name: 'Medical Equipment',
    description: 'Wheelchair, walker, and equipment rental'
  },
  [ServiceCategory.HOSPICE]: {
    icon: '🕊️',
    name: 'Hospice Care',
    description: 'End-of-life care services'
  },
  [ServiceCategory.ADULT_DAY_CARE]: {
    icon: '☀️',
    name: 'Adult Day Care',
    description: 'Daytime care and activities for seniors'
  }
};

// Service discovery functions
export async function discoverLocalServices(lat: number, lng: number, radius: number = 5): Promise<SeniorService[]> {
  // This will integrate with various APIs and databases
  const services: SeniorService[] = [];
  
  // TODO: Integrate with real service APIs
  // For now, return sample data structure
  services.push({
    id: 'sample-1',
    category: ServiceCategory.MOVING,
    name: 'Gentle Transitions',
    description: 'Senior move management and downsizing specialists',
    provider: 'Gentle Transitions LLC',
    phone: '', // Phone will be populated from real API
    website: 'https://gentletransitions.com',
    location: { lat: lat + 0.01, lng: lng + 0.01 },
    pricing: 'Free consultation, hourly rates available',
    features: ['Packing', 'Unpacking', 'Estate sales', 'Donation coordination'],
    rating: 4.8,
    verified: true
  });
  
  return services;
}

// Amazon product recommendations based on senior needs
export interface AmazonProduct {
  asin: string;
  title: string;
  price: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  productUrl: string;
  category: string;
  features?: string[];
  prime?: boolean;
}

export const SeniorProductCategories = {
  MOBILITY: {
    name: 'Mobility Aids',
    keywords: ['walker', 'cane', 'wheelchair', 'mobility scooter'],
    icon: '🦽'
  },
  SAFETY: {
    name: 'Safety Equipment',
    keywords: ['grab bars', 'shower chair', 'bed rails', 'fall prevention'],
    icon: '🛡️'
  },
  DAILY_LIVING: {
    name: 'Daily Living Aids',
    keywords: ['pill organizer', 'reachers', 'dressing aids', 'easy grip'],
    icon: '🏠'
  },
  MEDICAL: {
    name: 'Medical Supplies',
    keywords: ['blood pressure monitor', 'pulse oximeter', 'thermometer'],
    icon: '🩺'
  },
  COMMUNICATION: {
    name: 'Communication Devices',
    keywords: ['senior phone', 'large button phone', 'medical alert'],
    icon: '📞'
  },
  COMFORT: {
    name: 'Comfort Items',
    keywords: ['compression socks', 'lumbar support', 'orthopedic cushion'],
    icon: '🛋️'
  }
};

// Function to generate Amazon affiliate links with tracking
export function generateAmazonLink(asin: string, associateTag: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${associateTag}`;
}

// Service quality scoring
export function calculateServiceScore(service: SeniorService): number {
  let score = 0;
  
  if (service.verified) score += 20;
  if (service.rating && service.rating >= 4) score += 20;
  if (service.website) score += 10;
  if (service.phone) score += 10;
  if (service.features && service.features.length > 3) score += 20;
  if (service.pricing) score += 10;
  if (service.availability) score += 10;
  
  return score;
}

// Service matching based on community needs
export function matchServicesToCommunity(
  communityType: string[],
  services: SeniorService[]
): SeniorService[] {
  const priorityServices: ServiceCategory[] = [];
  
  if (communityType.includes('Memory Care')) {
    priorityServices.push(
      ServiceCategory.ADULT_DAY_CARE,
      ServiceCategory.HOME_CARE,
      ServiceCategory.MEDICAL_TRANSPORT
    );
  }
  
  if (communityType.includes('Assisted Living')) {
    priorityServices.push(
      ServiceCategory.MOVING,
      ServiceCategory.STORAGE,
      ServiceCategory.JUNK_REMOVAL
    );
  }
  
  if (communityType.includes('Independent Living')) {
    priorityServices.push(
      ServiceCategory.MEAL_DELIVERY,
      ServiceCategory.MEDICAL_TRANSPORT,
      ServiceCategory.SENIOR_CENTER
    );
  }
  
  // Sort services by relevance
  return services.sort((a, b) => {
    const aIsPriority = priorityServices.includes(a.category);
    const bIsPriority = priorityServices.includes(b.category);
    
    if (aIsPriority && !bIsPriority) return -1;
    if (!aIsPriority && bIsPriority) return 1;
    
    return calculateServiceScore(b) - calculateServiceScore(a);
  });
}