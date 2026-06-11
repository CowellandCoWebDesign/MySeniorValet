// JSON-LD Structured Data Generator for MySeniorValet
// Provides schema.org markup for better SEO and rich snippets

export interface OrganizationSchema {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  logo: string;
  description: string;
  foundingDate: string;
  founder?: {
    '@type': string;
    name: string;
  };
  address?: {
    '@type': string;
    addressCountry: string;
    addressRegion?: string;
    addressLocality?: string;
  };
  contactPoint?: Array<{
    '@type': string;
    contactType: string;
    telephone?: string;
    email?: string;
    availableLanguage?: string[];
    areaServed?: string | string[];
  }>;
  sameAs?: string[];
  knowsAbout?: string[];
  areaServed?: any[];
}

export interface CommunitySchema {
  '@context': string;
  '@type': string;
  '@id': string;
  name: string;
  description?: string;
  url: string;
  image?: string | string[];
  address: {
    '@type': string;
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  geo?: {
    '@type': string;
    latitude: number;
    longitude: number;
  };
  telephone?: string;
  email?: string;
  priceRange?: string;
  aggregateRating?: {
    '@type': string;
    ratingValue: number;
    reviewCount: number;
    bestRating: number;
    worstRating: number;
  };
  hasOfferCatalog?: {
    '@type': string;
    name: string;
    itemListElement: Array<{
      '@type': string;
      name: string;
      description?: string;
    }>;
  };
  amenityFeature?: Array<{
    '@type': string;
    name: string;
    value?: boolean;
  }>;
  openingHoursSpecification?: {
    '@type': string;
    dayOfWeek: string[];
    opens: string;
    closes: string;
  };
  knowsAbout?: string[];
  medicalSpecialty?: string[];
}

export interface BreadcrumbSchema {
  '@context': string;
  '@type': string;
  itemListElement: Array<{
    '@type': string;
    position: number;
    name: string;
    item?: string;
  }>;
}

export interface SearchActionSchema {
  '@context': string;
  '@type': string;
  url: string;
  potentialAction: {
    '@type': string;
    target: {
      '@type': string;
      urlTemplate: string;
    };
    'query-input': string;
  };
}

export interface FAQSchema {
  '@context': string;
  '@type': string;
  mainEntity: Array<{
    '@type': string;
    name: string;
    acceptedAnswer: {
      '@type': string;
      text: string;
    };
  }>;
}

export interface ServiceSchema {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  provider: {
    '@type': string;
    name: string;
    url?: string;
  };
  serviceType?: string;
  areaServed?: any;
  availableChannel?: {
    '@type': string;
    serviceUrl: string;
    availableLanguage?: string[];
  };
  termsOfService?: string;
  category?: string;
  serviceOutput?: string;
}

export interface LocalBusinessSchema extends CommunitySchema {
  '@type': 'SeniorCommunity' | 'AssistedLivingFacility' | 'NursingHome' | 'RetirementCommunity';
  parentOrganization?: {
    '@type': string;
    name: string;
    url?: string;
  };
  specialOpening?: {
    '@type': string;
    validFrom: string;
    validThrough: string;
    opens: string;
    closes: string;
  };
}

// Generate organization schema for MySeniorValet
export function generateOrganizationSchema(): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MySeniorValet',
    url: 'https://www.myseniorvalet.com',
    logo: 'https://www.myseniorvalet.com/logo.png',
    description: 'The trusted platform for authentic senior living community information. Helping families make informed decisions with verified data and transparent pricing.',
    foundingDate: '2024',
    founder: {
      '@type': 'Person',
      name: 'William Cowell'
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US'
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'CowellandCoWebDesign@gmail.com',
        availableLanguage: ['English', 'French', 'Spanish'],
        areaServed: ['US', 'CA', 'AU', 'JP', 'SG', 'GB', 'MX', 'PE', 'CU', 'CR', 'PA', 'PR']
      },
      {
        '@type': 'ContactPoint',
        contactType: 'emergency',
        email: 'CowellandCoWebDesign@gmail.com',
        availableLanguage: ['English'],
        areaServed: ['US', 'CA', 'AU', 'JP', 'SG', 'GB', 'MX', 'PE', 'CU', 'CR', 'PA', 'PR']
      }
    ],
    sameAs: [
      'https://www.linkedin.com/company/myseniorvalet',
      'https://www.facebook.com/myseniorvalet',
      'https://twitter.com/myseniorvalet'
    ],
    knowsAbout: [
      'Senior Living',
      'Assisted Living',
      'Memory Care',
      'Independent Living',
      'Nursing Homes',
      'HUD Senior Housing',
      'VA Homes',
      '55+ Communities',
      'Elder Care',
      'Senior Services',
      'Medicare',
      'Medicaid',
      'Long-term Care'
    ],
    areaServed: [
      {
        '@type': 'Country',
        name: 'United States'
      },
      {
        '@type': 'Country',
        name: 'Canada'
      },
      {
        '@type': 'Country',
        name: 'Australia'
      },
      {
        '@type': 'Country',
        name: 'Japan'
      },
      {
        '@type': 'Country',
        name: 'Singapore'
      },
      {
        '@type': 'Country',
        name: 'United Kingdom'
      },
      {
        '@type': 'Country',
        name: 'Mexico'
      }
    ]
  };
}

// Generate community/facility schema
export function generateCommunitySchema(community: any): LocalBusinessSchema {
  // Determine the specific type based on care level
  let schemaType: LocalBusinessSchema['@type'] = 'SeniorCommunity';
  if (community.careLevel?.includes('Nursing')) {
    schemaType = 'NursingHome';
  } else if (community.careLevel?.includes('Assisted')) {
    schemaType = 'AssistedLivingFacility';
  } else if (community.careLevel?.includes('Independent')) {
    schemaType = 'RetirementCommunity';
  }

  const stateSlug = (community.stateSlug as string | undefined) || community.state.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
  const citySlug = (community.citySlug as string | undefined) || community.city.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
  const nameSlug = (community.slug as string | undefined) || community.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '') || `community-${community.id}`;
  const seoUrl = `https://www.myseniorvalet.com/senior-living/${stateSlug}/${citySlug}/${nameSlug}`;

  const schema: LocalBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    '@id': seoUrl,
    name: community.name,
    description: community.description || `${community.name} is a senior living community in ${community.city}, ${community.state}`,
    url: seoUrl,
    address: {
      '@type': 'PostalAddress',
      streetAddress: community.address,
      addressLocality: community.city,
      addressRegion: community.state,
      postalCode: community.zip,
      addressCountry: community.country || 'US'
    }
  };

  // Add geographic coordinates if available
  if (community.latitude && community.longitude) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: community.latitude,
      longitude: community.longitude
    };
  }

  // Add contact information
  if (community.phone) {
    schema.telephone = community.phone;
  }
  if (community.email) {
    schema.email = community.email;
  }

  // Add pricing information
  if (community.monthlyRent || community.pricing) {
    const price = community.monthlyRent || community.pricing;
    schema.priceRange = typeof price === 'number' ? `$${price}+` : price;
  }

  // Add ratings if available
  if (community.rating && community.reviewCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: community.rating,
      reviewCount: community.reviewCount,
      bestRating: 5,
      worstRating: 1
    };
  }

  // Add images if available
  if (community.photos && community.photos.length > 0) {
    schema.image = community.photos.map((photo: any) => photo.url || photo);
  }

  // Add service catalog (care levels)
  if (community.careLevel && community.careLevel.length > 0) {
    schema.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      name: 'Care Services',
      itemListElement: community.careLevel.map((level: string) => ({
        '@type': 'Offer',
        name: level,
        description: `${level} care services`
      }))
    };
  }

  // Add amenities as amenity features
  if (community.amenities && community.amenities.length > 0) {
    schema.amenityFeature = community.amenities.map((amenity: string) => ({
      '@type': 'LocationFeatureSpecification',
      name: amenity,
      value: true
    }));
  }

  // Add medical specialties if it's a nursing home or has memory care
  if (community.careLevel?.includes('Memory Care') || community.careLevel?.includes('Alzheimer')) {
    schema.medicalSpecialty = ['Geriatrics', 'Memory Care', 'Dementia Care'];
  }

  // Add parent organization if part of a chain
  if (community.organizationName) {
    schema.parentOrganization = {
      '@type': 'Organization',
      name: community.organizationName,
      url: community.organizationWebsite
    };
  }

  // Add knowledge areas
  schema.knowsAbout = [
    'Senior Care',
    'Elder Care',
    community.careLevel || [],
    'Senior Living Options',
    'Long-term Care'
  ].flat().filter(Boolean);

  return schema;
}

// Generate breadcrumb schema
export function generateBreadcrumbSchema(items: Array<{name: string; url?: string}>): BreadcrumbSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url && { item: `https://www.myseniorvalet.com${item.url}` })
    }))
  };
}

// Generate search action schema for homepage
export function generateSearchActionSchema(): SearchActionSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: 'https://www.myseniorvalet.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.myseniorvalet.com/search?location={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  };
}

// Generate FAQ schema
export function generateFAQSchema(faqs: Array<{question: string; answer: string}>): FAQSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

// Generate service schema for MySeniorValet services
export function generateServiceSchema(serviceName: string, serviceDescription: string): ServiceSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: serviceName,
    description: serviceDescription,
    provider: {
      '@type': 'Organization',
      name: 'MySeniorValet',
      url: 'https://www.myseniorvalet.com'
    },
    serviceType: 'Senior Care Information Service',
    areaServed: {
      '@type': 'GeoShape',
      name: 'Worldwide'
    },
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: 'https://www.myseniorvalet.com',
      availableLanguage: ['English', 'French', 'Spanish']
    },
    category: 'Senior Care Services',
    serviceOutput: 'Information and Recommendations'
  };
}

// Generate location page schema (for city/state pages)
export function generateLocationSchema(location: {city?: string; state?: string; country?: string; communityCount: number}) {
  const name = [location.city, location.state, location.country].filter(Boolean).join(', ');
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: name,
    description: `Find ${location.communityCount}+ senior living communities in ${name}. Compare prices, amenities, and care levels.`,
    geo: {
      '@type': 'GeoShape',
      addressCountry: location.country || 'US',
      addressRegion: location.state,
      addressLocality: location.city
    },
    containsPlace: {
      '@type': 'AdministrativeArea',
      name: name
    },
    hasMap: `https://www.myseniorvalet.com/map-search?location=${encodeURIComponent(name)}`,
    url: `https://www.myseniorvalet.com/senior-living/${location.state?.toLowerCase().replace(/\s+/g, '-')}${location.city ? '/' + location.city.toLowerCase().replace(/\s+/g, '-') : ''}`
  };
}

// Utility to wrap schema in script tags for HTML embedding
export function wrapInScriptTag(schema: any): string {
  return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
}

// Generate complete structured data for a page
export function generatePageStructuredData(pageType: string, data?: any): string[] {
  const schemas: any[] = [];
  
  switch (pageType) {
    case 'homepage':
      schemas.push(generateOrganizationSchema());
      schemas.push(generateSearchActionSchema());
      schemas.push(generateBreadcrumbSchema([
        { name: 'Home' }
      ]));
      break;
      
    case 'community':
      if (data?.community) {
        schemas.push(generateCommunitySchema(data.community));
        schemas.push(generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Communities', url: '/community-directory' },
          { name: data.community.state, url: `/senior-living/${data.community.state?.toLowerCase().replace(/\s+/g, '-')}` },
          { name: data.community.city, url: `/senior-living/${data.community.state?.toLowerCase().replace(/\s+/g, '-')}/${data.community.city?.toLowerCase().replace(/\s+/g, '-')}` },
          { name: data.community.name }
        ]));
      }
      break;
      
    case 'location':
      if (data?.location) {
        schemas.push(generateLocationSchema(data.location));
        const breadcrumbs: Array<{name: string; url?: string}> = [
          { name: 'Home', url: '/' },
          { name: 'Locations', url: '/map-search' }
        ];
        if (data.location.state) {
          breadcrumbs.push({ 
            name: data.location.state, 
            url: `/senior-living/${data.location.state.toLowerCase().replace(/\s+/g, '-')}` 
          });
        }
        if (data.location.city) {
          breadcrumbs.push({ name: data.location.city });
        }
        schemas.push(generateBreadcrumbSchema(breadcrumbs));
      }
      break;
      
    case 'service':
      if (data?.serviceName) {
        schemas.push(generateServiceSchema(data.serviceName, data.serviceDescription));
        schemas.push(generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Services', url: '/senior-services' },
          { name: data.serviceName }
        ]));
      }
      break;
      
    case 'faq':
      if (data?.faqs) {
        schemas.push(generateFAQSchema(data.faqs));
        schemas.push(generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Help', url: '/help' },
          { name: 'FAQ' }
        ]));
      }
      break;
  }
  
  return schemas.map(schema => wrapInScriptTag(schema));
}

// Export for Express middleware
export function structuredDataMiddleware(req: any, res: any, next: any) {
  res.locals.generateStructuredData = generatePageStructuredData;
  next();
}