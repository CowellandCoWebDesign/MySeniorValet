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
  title = "MySeniorValet - Find Senior Living Communities Near You | 35,182+ Verified Locations",
  description = "Search 35,182 senior living communities across USA, Canada & Mexico with transparent pricing, verified HUD rates, real availability. Compare assisted living, memory care, nursing homes near you. No hidden fees, no referral markups.",
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
  const fullUrl = url.startsWith("http") ? url : `https://www.myseniorvalet.com${url}`;
  const fullImage = image.startsWith("http") ? image : `https://www.myseniorvalet.com${image}`;

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
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
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
export function generateCommunityStructuredData(community: any) {
  return {
    "@context": "https://schema.org",
    "@type": "SeniorLiving",
    "name": community.name,
    "description": `${community.name} is a ${community.careTypes?.join(", ")} community in ${community.city}, ${community.state}`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": community.address,
      "addressLocality": community.city,
      "addressRegion": community.state,
      "postalCode": community.zipCode,
      "addressCountry": "US"
    },
    "telephone": community.phone,
    "url": `https://www.myseniorvalet.com/community/${community.id}`,
    "image": community.photos?.[0] || "/default-community.jpg",
    "priceRange": community.priceRange ? `$${community.priceRange.min}-$${community.priceRange.max}` : community.rentPerMonth ? `$${community.rentPerMonth}` : "Contact for pricing",
    "aggregateRating": community.rating ? {
      "@type": "AggregateRating",
      "ratingValue": community.rating,
      "reviewCount": community.reviewCount || 0
    } : undefined,
    "geo": community.latitude && community.longitude ? {
      "@type": "GeoCoordinates",
      "latitude": community.latitude,
      "longitude": community.longitude
    } : undefined,
    "amenityFeature": community.amenities?.map((amenity: string) => ({
      "@type": "LocationFeatureSpecification",
      "name": amenity,
      "value": true
    }))
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