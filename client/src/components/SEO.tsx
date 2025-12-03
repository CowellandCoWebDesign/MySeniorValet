import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "profile" | "local.business";
  canonicalUrl?: string;
  structuredData?: any;
  noindex?: boolean;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
}

export function SEO({
  title = "MySeniorValet - Find Senior Living Communities Near You | 35,264+ Verified Locations",
  description = "Search 35,264+ senior living communities across USA, Canada, Mexico, Peru, Cuba, Costa Rica & Panama with transparent pricing, verified HUD rates, real availability. Compare assisted living, memory care, nursing homes near you. No hidden fees, no referral markups.",
  keywords = "senior living near me, assisted living costs, memory care facilities, HUD senior housing, nursing home prices, independent living communities, retirement homes, elder care, senior apartments",
  image = "/og-image.jpg",
  url = "https://www.myseniorvalet.com",
  type = "website",
  canonicalUrl,
  structuredData,
  noindex = false,
  location,
}: SEOProps) {
  const fullTitle = title.includes("MySeniorValet") ? title : `${title} | MySeniorValet`;
  // Always use production domain for all URLs
  const productionDomain = "https://www.myseniorvalet.com";
  const fullUrl = url.startsWith("http") ? url : `${productionDomain}${url}`;
  const fullImage = image.startsWith("http") ? image : `${productionDomain}${image}`;
  // Use provided canonical URL or default to the current page URL
  const finalCanonicalUrl = canonicalUrl || fullUrl;

  // Generate location-specific keywords
  const locationKeywords = location
    ? `, ${location.city ? `${location.city} senior living, ` : ""}${
        location.state ? `${location.state} assisted living, ` : ""
      }${location.city && location.state ? `${location.city} ${location.state} nursing homes` : ""}`
    : "";

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={`${keywords}${locationKeywords}`} />
      
      {/* Control indexing */}
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"} />
      <meta name="googlebot" content={noindex ? "noindex, nofollow" : "index, follow"} />
      
      {/* Canonical URL - always include for SEO */}
      <link rel="canonical" href={finalCanonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content="MySeniorValet" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImage} />
      <meta property="twitter:site" content="@MySeniorValet" />
      
      {/* Location-based SEO */}
      {location?.state && <meta name="geo.region" content={`US-${location.state}`} />}
      {location?.city && <meta name="geo.placename" content={location.city} />}
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}

// Generate structured data for a senior living community
// Enhanced with additional schema.org properties for better SEO
export function generateCommunityStructuredData(community: any) {
  // Map care types to schema.org ResidentialCommunity subtypes
  const careTypeMap: Record<string, string> = {
    'independent': 'IndependentLiving',
    'assisted': 'AssistedLivingFacility', 
    'memory': 'MemoryCareFacility',
    'nursing': 'NursingHome',
    'skilled': 'SkilledNursingFacility',
    'rehabilitation': 'RehabilitationCenter',
    'continuing': 'ContinuingCareRetirementCommunity'
  };
  
  // Determine the best @type based on care types
  const primaryCareType = community.careTypes?.[0]?.toLowerCase() || '';
  const schemaType = careTypeMap[primaryCareType] || 'SeniorLiving';
  
  // Build comprehensive description
  const careTypesText = community.careTypes?.length > 0 
    ? community.careTypes.join(", ") 
    : "senior living";
  
  const description = community.description && community.description.length > 100
    ? community.description.slice(0, 300) + "..."
    : `${community.name} offers ${careTypesText} services in ${community.city}, ${community.state}. Providing quality senior care with comprehensive amenities and services for seniors and their families.`;

  // Build image array for better SEO
  const images = community.photos?.length > 0 
    ? community.photos.slice(0, 10)
    : ["/default-community.jpg"];

  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", schemaType],
    "@id": `https://www.myseniorvalet.com/community/${community.id}#organization`,
    "name": community.name,
    "alternateName": community.alternateNames || undefined,
    "description": description,
    "url": `https://www.myseniorvalet.com/community/${community.id}`,
    "image": images,
    "logo": community.logo || undefined,
    "telephone": community.phone,
    "email": community.email || undefined,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": community.address,
      "addressLocality": community.city,
      "addressRegion": community.state,
      "postalCode": community.zipCode,
      "addressCountry": community.country || "US"
    },
    "geo": community.latitude && community.longitude ? {
      "@type": "GeoCoordinates",
      "latitude": community.latitude,
      "longitude": community.longitude
    } : undefined,
    "hasMap": community.latitude && community.longitude 
      ? `https://www.google.com/maps?q=${community.latitude},${community.longitude}`
      : undefined,
    "priceRange": community.priceRange 
      ? `$${community.priceRange.min?.toLocaleString()}-$${community.priceRange.max?.toLocaleString()}/month` 
      : community.rentPerMonth 
        ? `$${Number(community.rentPerMonth).toLocaleString()}/month`
        : "Contact for pricing",
    "currenciesAccepted": "USD",
    "paymentAccepted": ["Cash", "Credit Card", "Check", "Medicare", "Medicaid", "Long-term Care Insurance"].filter(Boolean),
    "aggregateRating": community.rating && community.rating > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": community.rating.toFixed(1),
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": community.reviewCount || 1,
      "reviewCount": community.reviewCount || 1
    } : undefined,
    "amenityFeature": community.amenities?.map((amenity: string) => ({
      "@type": "LocationFeatureSpecification",
      "name": amenity,
      "value": true
    })),
    "speciality": community.careTypes || ["Senior Living"],
    "numberOfRooms": community.capacity || undefined,
    "petsAllowed": community.petFriendly || undefined,
    "smokingAllowed": false,
    "isAccessibleForFree": false,
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "00:00",
      "closes": "23:59"
    },
    "sameAs": [
      community.website,
      community.facebookUrl,
      community.linkedinUrl
    ].filter(Boolean),
    "potentialAction": {
      "@type": "ReserveAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `https://www.myseniorvalet.com/community/${community.id}?action=schedule-tour`,
        "actionPlatform": ["http://schema.org/DesktopWebPlatform", "http://schema.org/MobileWebPlatform"]
      },
      "result": {
        "@type": "Reservation",
        "name": "Schedule a Tour"
      }
    }
  };
}

// Generate LocalBusiness structured data for organization schema
export function generateOrganizationStructuredData(community: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `https://www.myseniorvalet.com/community/${community.id}#org`,
    "name": community.name,
    "url": `https://www.myseniorvalet.com/community/${community.id}`,
    "logo": community.logo || community.photos?.[0],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": community.phone,
      "contactType": "customer service",
      "availableLanguage": ["English", "Spanish"]
    }
  };
}

// Generate breadcrumb structured data
export function generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith("http") ? item.url : `https://www.myseniorvalet.com${item.url}`
    }))
  };
}

// Generate FAQ structured data
export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

// Generate Review structured data for individual reviews
export function generateReviewStructuredData(review: {
  author: string;
  rating: number;
  text: string;
  date: string;
  communityName: string;
  communityId: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": "LocalBusiness",
      "name": review.communityName,
      "@id": `https://www.myseniorvalet.com/community/${review.communityId}#organization`
    },
    "author": {
      "@type": "Person",
      "name": review.author
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": review.rating,
      "bestRating": "5",
      "worstRating": "1"
    },
    "reviewBody": review.text,
    "datePublished": review.date
  };
}

// Generate Product structured data for pricing display
export function generateServiceStructuredData(community: any) {
  const services = [];
  
  if (community.careTypes?.includes('Independent Living')) {
    services.push({
      "@type": "Service",
      "name": "Independent Living",
      "description": `Independent living services at ${community.name}`,
      "provider": {
        "@type": "LocalBusiness",
        "name": community.name
      },
      "offers": community.priceRange?.independent ? {
        "@type": "Offer",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": community.priceRange.independent,
          "priceCurrency": "USD",
          "unitCode": "MON"
        }
      } : undefined
    });
  }
  
  if (community.careTypes?.includes('Assisted Living')) {
    services.push({
      "@type": "Service", 
      "name": "Assisted Living",
      "description": `Assisted living care at ${community.name}`,
      "provider": {
        "@type": "LocalBusiness",
        "name": community.name
      }
    });
  }
  
  if (community.careTypes?.includes('Memory Care')) {
    services.push({
      "@type": "Service",
      "name": "Memory Care",
      "description": `Memory care and Alzheimer's care at ${community.name}`,
      "provider": {
        "@type": "LocalBusiness",
        "name": community.name
      }
    });
  }
  
  return services;
}