import { Helmet } from 'react-helmet-async';

interface SEOMetaTagsProps {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type?: 'website' | 'article' | 'profile' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  price?: {
    amount: number;
    currency: string;
  };
  availability?: 'in stock' | 'out of stock' | 'preorder';
  communityData?: {
    name: string;
    city?: string;
    state?: string;
    priceRange?: string;
    rating?: number;
    reviewCount?: number;
  };
  twitterHandle?: string;
  noindex?: boolean;
  canonical?: string;
  hreflangAlternates?: Array<{
    href: string;
    hreflang: string;
  }>;
}

export function SEOMetaTags({
  title,
  description,
  url = 'https://www.myseniorvalet.com',
  image = 'https://www.myseniorvalet.com/og-image.png',
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  section,
  tags,
  price,
  availability,
  communityData,
  twitterHandle = '@myseniorvalet',
  noindex = false,
  canonical,
  hreflangAlternates = []
}: SEOMetaTagsProps) {
  // Ensure absolute URLs
  const absoluteUrl = url.startsWith('http') ? url : `https://www.myseniorvalet.com${url}`;
  const absoluteImage = image.startsWith('http') ? image : `https://www.myseniorvalet.com${image}`;
  
  // Generate enhanced title with location if available  
  const enhancedTitle = communityData 
    ? communityData.city && communityData.state
      ? `${title} | ${communityData.city}, ${communityData.state} | MySeniorValet`
      : `${title} | MySeniorValet`
    : `${title} | MySeniorValet - Trusted Senior Living Platform`;
  
  // Generate enhanced description with additional data
  const enhancedDescription = communityData
    ? `${description}${
        communityData.city && communityData.state 
          ? ` Located in ${communityData.city}, ${communityData.state}.` 
          : ''
      } ${
        communityData.priceRange ? `Pricing: ${communityData.priceRange}.` : ''
      } ${
        communityData.rating ? `Rated ${communityData.rating}/5 by ${communityData.reviewCount} families.` : ''
      }`
    : description;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{enhancedTitle}</title>
      <meta name="description" content={enhancedDescription} />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Robots Meta */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={enhancedTitle} />
      <meta property="og:description" content={enhancedDescription} />
      <meta property="og:url" content={absoluteUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content="MySeniorValet" />
      <meta property="og:locale" content="en_US" />
      
      {/* Additional Open Graph tags based on type */}
      {type === 'article' && (
        <>
          {author && <meta property="article:author" content={author} />}
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {section && <meta property="article:section" content={section} />}
          {tags?.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Product/Community specific Open Graph */}
      {(type === 'product' || communityData) && (
        <>
          {price && (
            <>
              <meta property="product:price:amount" content={price.amount.toString()} />
              <meta property="product:price:currency" content={price.currency} />
            </>
          )}
          {availability && <meta property="product:availability" content={availability} />}
          {communityData?.rating && (
            <>
              <meta property="product:rating:value" content={communityData.rating.toString()} />
              <meta property="product:rating:scale" content="5" />
            </>
          )}
        </>
      )}
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:title" content={enhancedTitle} />
      <meta name="twitter:description" content={enhancedDescription} />
      <meta name="twitter:image" content={absoluteImage} />
      <meta name="twitter:image:alt" content={title} />
      
      {/* Additional SEO Meta Tags */}
      <meta name="author" content={author || 'MySeniorValet'} />
      <meta name="publisher" content="MySeniorValet" />
      <meta name="copyright" content="MySeniorValet" />
      
      {/* Geographic Meta Tags for Communities */}
      {communityData && (
        <>
          <meta name="geo.placename" content={`${communityData.city}, ${communityData.state}`} />
          <meta name="geo.region" content={`US-${communityData.state}`} />
        </>
      )}
      
      {/* Hreflang Tags for International SEO */}
      {hreflangAlternates.map(({ href, hreflang }) => (
        <link key={hreflang} rel="alternate" hrefLang={hreflang} href={href} />
      ))}
      
      {/* Default hreflang tags for main regions */}
      <link rel="alternate" hrefLang="en-US" href="https://www.myseniorvalet.com" />
      <link rel="alternate" hrefLang="en-CA" href="https://www.myseniorvalet.com/ca" />
      <link rel="alternate" hrefLang="en-AU" href="https://www.myseniorvalet.com/au" />
      <link rel="alternate" hrefLang="en-GB" href="https://www.myseniorvalet.com/uk" />
      <link rel="alternate" hrefLang="fr-CA" href="https://www.myseniorvalet.com/fr-ca" />
      <link rel="alternate" hrefLang="es-MX" href="https://www.myseniorvalet.com/mx" />
      <link rel="alternate" hrefLang="ja-JP" href="https://www.myseniorvalet.com/jp" />
      <link rel="alternate" hrefLang="x-default" href="https://www.myseniorvalet.com" />
      
      {/* Mobile App Tags (for future app) */}
      <meta name="apple-mobile-web-app-title" content="MySeniorValet" />
      <meta name="application-name" content="MySeniorValet" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Verification Tags (add your actual verification codes) */}
      {process.env.VITE_GOOGLE_SITE_VERIFICATION && (
        <meta name="google-site-verification" content={process.env.VITE_GOOGLE_SITE_VERIFICATION} />
      )}
      {process.env.VITE_BING_SITE_VERIFICATION && (
        <meta name="msvalidate.01" content={process.env.VITE_BING_SITE_VERIFICATION} />
      )}
      {process.env.VITE_PINTEREST_SITE_VERIFICATION && (
        <meta name="p:domain_verify" content={process.env.VITE_PINTEREST_SITE_VERIFICATION} />
      )}
      
      {/* Rich Snippets for Search Results */}
      {communityData && (
        <>
          <meta itemProp="name" content={communityData.name} />
          <meta itemProp="description" content={description} />
          <meta itemProp="image" content={absoluteImage} />
          {communityData.priceRange && (
            <meta itemProp="priceRange" content={communityData.priceRange} />
          )}
        </>
      )}
    </Helmet>
  );
}

// Generate hreflang alternates for a page
export function generateHreflangAlternates(basePath: string): Array<{ href: string; hreflang: string }> {
  const regions = [
    { code: 'en-US', path: '' },
    { code: 'en-CA', path: '/ca' },
    { code: 'en-AU', path: '/au' },
    { code: 'en-GB', path: '/uk' },
    { code: 'fr-CA', path: '/fr-ca' },
    { code: 'es-MX', path: '/mx' },
    { code: 'ja-JP', path: '/jp' },
  ];
  
  return regions.map(({ code, path }) => ({
    href: `https://www.myseniorvalet.com${path}${basePath}`,
    hreflang: code
  }));
}

// Helper to generate community-specific meta data
export function generateCommunityMetaTags(community: any) {
  return {
    title: community.name,
    description: `${community.name} - ${community.careLevel?.join(', ') || 'Senior Living'} in ${community.city}, ${community.state}. ${
      community.description || 'Find verified pricing, amenities, and care information.'
    }`,
    url: `/community/${community.id}/${community.name.toLowerCase().replace(/\s+/g, '-')}`,
    image: community.photos?.[0]?.url || '/default-community.jpg',
    type: 'product' as const,
    communityData: {
      name: community.name,
      city: community.city,
      state: community.state,
      priceRange: community.monthlyRent ? `From $${community.monthlyRent}/mo` : undefined,
      rating: community.rating,
      reviewCount: community.reviewCount
    },
    price: community.monthlyRent ? {
      amount: community.monthlyRent,
      currency: 'USD'
    } : undefined,
    tags: [
      'Senior Living',
      community.state,
      community.city,
      ...(community.careLevel || [])
    ]
  };
}

// Helper to generate location page meta data  
export function generateLocationMetaTags(location: {
  city?: string;
  state?: string;
  country?: string;
  communityCount?: number;
}) {
  const locationName = [location.city, location.state, location.country].filter(Boolean).join(', ');
  
  return {
    title: `Senior Living in ${locationName}`,
    description: `Find ${location.communityCount || ''} senior living communities in ${locationName}. Compare verified pricing, amenities, care levels, and availability. Trusted by thousands of families.`,
    url: `/senior-living/${location.state?.toLowerCase().replace(/\s+/g, '-')}${
      location.city ? '/' + location.city.toLowerCase().replace(/\s+/g, '-') : ''
    }`,
    type: 'website' as const,
    tags: [
      'Senior Living',
      location.state || '',
      location.city || '',
      'Retirement Communities',
      'Assisted Living',
      'Memory Care'
    ].filter(Boolean)
  };
}

export default SEOMetaTags;