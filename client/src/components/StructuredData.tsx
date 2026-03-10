import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { getCommunityUrl } from '@/lib/community-url';

interface StructuredDataProps {
  data: any | any[];
}

// Component to inject JSON-LD structured data into the page head
export function StructuredData({ data }: StructuredDataProps) {
  const schemas = Array.isArray(data) ? data : [data];
  
  return (
    <Helmet>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ 
            __html: JSON.stringify(schema, null, 2) 
          }}
        />
      ))}
    </Helmet>
  );
}

// Organization schema for MySeniorValet
export const organizationSchema = {
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
      email: 'hello@myseniorvalet.com',
      availableLanguage: ['English', 'French', 'Spanish'],
      areaServed: ['US', 'CA', 'AU', 'JP', 'SG', 'GB', 'MX', 'PE', 'CU', 'CR', 'PA', 'PR']
    },
    {
      '@type': 'ContactPoint',
      contactType: 'emergency',
      email: 'admin@myseniorvalet.com',
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
  ]
};

// Search action schema for site search
export const searchActionSchema = {
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

// Helper function to create community schema
export function createCommunitySchema(community: any) {
  let schemaType = 'SeniorCommunity';
  if (community.careLevel?.includes('Nursing')) {
    schemaType = 'NursingHome';
  } else if (community.careLevel?.includes('Assisted')) {
    schemaType = 'AssistedLivingFacility';
  } else if (community.careLevel?.includes('Independent')) {
    schemaType = 'RetirementCommunity';
  }

  const schema: any = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    '@id': `https://www.myseniorvalet.com${getCommunityUrl(community)}`,
    name: community.name,
    description: community.description || `${community.name} is a senior living community in ${community.city}, ${community.state}`,
    url: `https://www.myseniorvalet.com${getCommunityUrl(community)}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: community.address,
      addressLocality: community.city,
      addressRegion: community.state,
      postalCode: community.zip,
      addressCountry: community.country || 'US'
    }
  };

  if (community.latitude && community.longitude) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: community.latitude,
      longitude: community.longitude
    };
  }

  if (community.phone) schema.telephone = community.phone;
  if (community.email) schema.email = community.email;
  
  if (community.monthlyRent || community.pricing) {
    const price = community.monthlyRent || community.pricing;
    schema.priceRange = typeof price === 'number' ? `$${price}+` : price;
  }

  if (community.rating && community.reviewCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: community.rating,
      reviewCount: community.reviewCount,
      bestRating: 5,
      worstRating: 1
    };
  }

  if (community.photos && community.photos.length > 0) {
    schema.image = community.photos.map((photo: any) => photo.url || photo);
  }

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

  if (community.amenities && community.amenities.length > 0) {
    schema.amenityFeature = community.amenities.map((amenity: string) => ({
      '@type': 'LocationFeatureSpecification',
      name: amenity,
      value: true
    }));
  }

  return schema;
}

// Helper function to create breadcrumb schema
export function createBreadcrumbSchema(items: Array<{name: string; url?: string}>) {
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

// Helper function to create FAQ schema
export function createFAQSchema(faqs: Array<{question: string; answer: string}>) {
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

// Helper function to create location schema
export function createLocationSchema(location: {
  city?: string;
  state?: string;
  country?: string;
  communityCount: number;
}) {
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

// Helper function to create service schema
export function createServiceSchema(serviceName: string, serviceDescription: string) {
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

export default StructuredData;