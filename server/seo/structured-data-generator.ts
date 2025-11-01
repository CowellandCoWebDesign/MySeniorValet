import { Community } from '../../shared/schema';

// Generate Schema.org structured data for different types of senior housing
export function generateStructuredData(
  community: Community,
  type: 'page' | 'community' | 'directory' = 'community'
): any {
  const baseUrl = 'https://www.myseniorvalet.com';
  
  if (type === 'community') {
    return generateCommunitySchema(community, baseUrl);
  } else if (type === 'directory') {
    return generateDirectorySchema(baseUrl);
  } else {
    return generateOrganizationSchema(baseUrl);
  }
}

// Schema for individual community/facility
function generateCommunitySchema(community: Community, baseUrl: string): any {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': determineSeniorHousingType(community.careTypes),
    '@id': `${baseUrl}/community/${community.id}`,
    'name': community.name,
    'description': community.description || `${community.name} - Senior housing in ${community.city}, ${community.state}`,
    'url': `${baseUrl}/community/${community.id}`,
    'telephone': community.phone,
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': community.address,
      'addressLocality': community.city,
      'addressRegion': community.state,
      'postalCode': community.zipCode,
      'addressCountry': community.country || 'US'
    }
  };

  // Add geographic coordinates if available
  if (community.latitude && community.longitude) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      'latitude': community.latitude,
      'longitude': community.longitude
    };
  }

  // Add images if available
  if (community.photos && community.photos.length > 0) {
    schema.image = community.photos.filter(photo => photo && !photo.includes('placeholder'));
  }

  // Add rating if available
  if (community.rating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      'ratingValue': community.rating,
      'bestRating': 5,
      'worstRating': 1,
      'reviewCount': community.reviewCount || 1
    };
  }

  // Add price range information
  if (community.rentPerMonth) {
    schema.priceRange = `$${community.rentPerMonth}/month`;
    
    // Add offers for specific pricing
    schema.makesOffer = [{
      '@type': 'Offer',
      'name': 'Monthly Rent',
      'price': community.rentPerMonth,
      'priceCurrency': 'USD',
      'unitText': 'MONTH',
      'availability': 'https://schema.org/InStock'
    }];
  } else if (community.priceRange) {
    schema.priceRange = community.priceRange;
  }

  // Add amenities
  const amenities = [];
  if (community.careTypes?.includes('memory')) {
    amenities.push('Memory Care', 'Dementia Care', 'Alzheimer\'s Care');
  }
  if (community.careTypes?.includes('assisted')) {
    amenities.push('Assisted Living', '24/7 Care Staff', 'Medication Management');
  }
  if (community.careTypes?.includes('independent')) {
    amenities.push('Independent Living', 'Maintenance-Free Living');
  }
  if (community.careTypes?.includes('skilled')) {
    amenities.push('Skilled Nursing', 'Rehabilitation Services', '24-Hour Nursing');
  }
  if (community.careTypes?.includes('ccrc')) {
    amenities.push('Continuing Care', 'Life Care Contract', 'Multiple Care Levels');
  }
  if (community.careTypes?.includes('hud')) {
    amenities.push('HUD Subsidized', 'Income-Based Rent', 'Government Assistance');
  }
  if (community.careTypes?.includes('55plus')) {
    amenities.push('55+ Community', 'Active Adult', 'Age-Restricted');
  }
  if (community.careTypes?.includes('mobile')) {
    amenities.push('RV Park', 'Mobile Home Community', 'Manufactured Homes');
  }
  
  if (amenities.length > 0) {
    schema.amenityFeature = amenities.map(name => ({
      '@type': 'LocationFeatureSpecification',
      'name': name,
      'value': true
    }));
  }

  // Add additional type-specific properties based on care types
  if (community.careTypes?.includes('hud')) {
    schema['@type'] = ['SeniorLivingCommunity', 'GovernmentBuilding'];
    schema.additionalType = 'HUD Senior Housing';
  } else if (community.careTypes?.includes('mobile')) {
    schema['@type'] = 'RVPark';
    schema.additionalType = 'Senior RV/Mobile Park';
  } else if (community.careTypes?.includes('skilled')) {
    schema['@type'] = 'MedicalClinic';
    schema.medicalSpecialty = 'Skilled Nursing';
  }

  // Add opening hours (standard for senior communities)
  schema.openingHoursSpecification = {
    '@type': 'OpeningHoursSpecification',
    'dayOfWeek': [
      'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
      'Friday', 'Saturday', 'Sunday'
    ],
    'opens': '00:00',
    'closes': '23:59'
  };

  return schema;
}

// Determine the primary Schema.org type based on care types
function determineSeniorHousingType(careTypes: string[] | null): string {
  if (!careTypes || careTypes.length === 0) {
    return 'SeniorLivingCommunity';
  }
  
  // Priority order for Schema.org types
  if (careTypes.includes('skilled')) {
    return 'MedicalClinic'; // Best for skilled nursing
  }
  if (careTypes.includes('memory')) {
    return 'MedicalBusiness'; // Best for memory care
  }
  if (careTypes.includes('mobile')) {
    return 'RVPark'; // Specific type for RV/mobile communities
  }
  if (careTypes.includes('hud')) {
    return 'ApartmentComplex'; // Best for subsidized housing
  }
  if (careTypes.includes('55plus')) {
    return 'ApartmentComplex'; // Age-restricted apartments
  }
  if (careTypes.includes('ccrc')) {
    return 'SeniorLivingCommunity'; // Comprehensive communities
  }
  
  // Default for assisted/independent living
  return 'SeniorLivingCommunity';
}

// Schema for directory/listing pages
function generateDirectorySchema(baseUrl: string): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': 'Senior Housing Directory - All Types of Senior Living Options',
    'description': 'Comprehensive directory of 33,500+ senior housing options including assisted living facilities, HUD housing, RV parks, memory care, skilled nursing, and more.',
    'url': `${baseUrl}/community-directory`,
    'numberOfItems': 33500,
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'HUD Senior Housing',
        'description': 'Government-subsidized housing for low-income seniors'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Assisted Living Facilities',
        'description': '24/7 support with daily activities'
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': 'Memory Care Communities',
        'description': 'Specialized care for Alzheimer\'s and dementia'
      },
      {
        '@type': 'ListItem',
        'position': 4,
        'name': 'Senior RV & Mobile Parks',
        'description': 'Active retirement in RV and mobile home communities'
      },
      {
        '@type': 'ListItem',
        'position': 5,
        'name': '55+ Active Adult Communities',
        'description': 'Age-restricted communities for active seniors'
      },
      {
        '@type': 'ListItem',
        'position': 6,
        'name': 'Skilled Nursing Facilities',
        'description': '24-hour medical care and rehabilitation'
      },
      {
        '@type': 'ListItem',
        'position': 7,
        'name': 'CCRCs',
        'description': 'Continuing Care Retirement Communities with all care levels'
      }
    ]
  };
}

// Schema for the main organization
function generateOrganizationSchema(baseUrl: string): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'MySeniorValet',
    'alternateName': 'My Senior Valet',
    'url': baseUrl,
    'logo': `${baseUrl}/valet-mascot.png`,
    'description': 'The trusted platform for authentic senior housing information. Comprehensive directory of all types of senior living options including facilities, HUD housing, RV parks, and more.',
    'sameAs': [
      'https://www.facebook.com/myseniorvalet',
      'https://twitter.com/myseniorvalet',
      'https://www.linkedin.com/company/myseniorvalet'
    ],
    'contactPoint': {
      '@type': 'ContactPoint',
      'telephone': '+1-555-SENIOR-1',
      'contactType': 'Customer Service',
      'availableLanguage': ['English', 'Spanish', 'French']
    },
    'address': {
      '@type': 'PostalAddress',
      'addressCountry': 'US'
    },
    'areaServed': [
      {
        '@type': 'Country',
        'name': 'United States'
      },
      {
        '@type': 'Country',
        'name': 'Canada'
      },
      {
        '@type': 'Country',
        'name': 'Australia'
      },
      {
        '@type': 'Country',
        'name': 'Japan'
      },
      {
        '@type': 'Country',
        'name': 'Singapore'
      },
      {
        '@type': 'Country',
        'name': 'United Kingdom'
      },
      {
        '@type': 'Country',
        'name': 'Puerto Rico'
      },
      {
        '@type': 'Country',
        'name': 'Mexico'
      }
    ]
  };
}

// Generate breadcrumb structured data
export function generateBreadcrumbSchema(
  path: Array<{ name: string; url: string }>,
  baseUrl: string
): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': path.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': index === path.length - 1 ? undefined : `${baseUrl}${item.url}`
    }))
  };
}

// Generate location-specific structured data
export function generateLocationSchema(
  location: string,
  communities: Community[],
  baseUrl: string
): any {
  const locationData: Record<string, any> = {
    'oakmont': {
      name: 'Oakmont Senior Living Communities',
      description: '60+ luxury senior living communities across California',
      areaServed: 'California'
    },
    'puerto-rico': {
      name: 'Puerto Rico Senior Living',
      description: '50+ Caribbean senior housing options with tax benefits',
      areaServed: 'Puerto Rico'
    },
    'hawaii': {
      name: 'Hawaii Senior Living',
      description: '55+ island senior housing communities',
      areaServed: 'Hawaii'
    },
    'fort-worth': {
      name: 'Fort Worth Texas Senior Housing',
      description: '180+ senior living options in Fort Worth metropolitan area',
      areaServed: 'Fort Worth, Texas'
    },
    'new-york': {
      name: 'New York Senior Housing',
      description: '2,800+ senior living facilities across New York State',
      areaServed: 'New York'
    },
    'canada': {
      name: 'Canadian Senior Housing',
      description: '5,343 senior care facilities across Canada',
      areaServed: 'Canada'
    },
    'australia': {
      name: 'Australian Aged Care',
      description: '1,458 aged care facilities across Australia',
      areaServed: 'Australia'
    }
  };

  const info = locationData[location] || {
    name: `${location} Senior Housing`,
    description: `Senior housing options in ${location}`,
    areaServed: location
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': info.name,
    'description': info.description,
    'url': `${baseUrl}/directory/${location}`,
    'about': {
      '@type': 'Place',
      'name': info.areaServed
    },
    'hasPart': communities.slice(0, 10).map(community => ({
      '@type': 'SeniorLivingCommunity',
      'name': community.name,
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': community.city,
        'addressRegion': community.state
      }
    })),
    'numberOfItems': communities.length
  };
}