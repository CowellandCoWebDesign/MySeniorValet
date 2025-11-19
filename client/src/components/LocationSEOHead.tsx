import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { LocationInfo, LocationSEOService } from '@/services/locationSEO.service';

interface LocationSEOHeadProps {
  location: LocationInfo;
  pageType?: string;
}

export function LocationSEOHead({ location, pageType = 'search' }: LocationSEOHeadProps) {
  const title = LocationSEOService.generateTitle(location, pageType);
  const description = LocationSEOService.generateDescription(location);
  const keywords = LocationSEOService.generateKeywords(location).join(', ');
  const canonicalUrl = LocationSEOService.generateCanonicalUrl(location);
  
  // Update document title for client-side navigation
  useEffect(() => {
    document.title = title;
  }, [title]);
  
  return (
    <Helmet prioritizeSeoTags>
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      <link rel="canonical" href={canonicalUrl} />
      
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content="MySeniorValet" />
      <meta property="og:locale" content="en_US" />
      
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      
      <meta name="geo.region" content={`${location.stateAbbr === 'ON' || location.stateAbbr === 'BC' || location.stateAbbr === 'QC' ? 'CA' : 'US'}-${location.stateAbbr}`} />
      <meta name="geo.placename" content={location.city} />
      
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": `Senior Living in ${location.city}`,
          "description": description,
          "url": canonicalUrl,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": location.city,
            "addressRegion": location.state,
            "addressCountry": location.stateAbbr === 'ON' || location.stateAbbr === 'BC' || location.stateAbbr === 'QC' ? 'CA' : 'US'
          },
          "areaServed": {
            "@type": "City",
            "name": location.city,
            "containedInPlace": {
              "@type": "State",
              "name": location.state
            }
          },
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${canonicalUrl}?q={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        })}
      </script>
    </Helmet>
  );
}