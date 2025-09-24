import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";

interface DynamicSearchSEOProps {
  location?: string;
  query?: string;
  careType?: string;
  priceRange?: string;
  totalResults?: number;
  city?: string;
  state?: string;
  country?: string;
}

export function DynamicSearchSEO({
  location,
  query,
  careType,
  priceRange,
  totalResults = 0,
  city,
  state,
  country
}: DynamicSearchSEOProps) {
  const [title, setTitle] = useState("MySeniorValet - Find Senior Living Communities");
  const [description, setDescription] = useState("Search senior living communities worldwide");
  const [keywords, setKeywords] = useState("senior living, retirement homes, assisted living");
  const [structuredData, setStructuredData] = useState<any>(null);

  useEffect(() => {
    // Generate dynamic title based on search parameters
    let dynamicTitle = "";
    let dynamicDescription = "";
    let dynamicKeywords = "";

    if (location) {
      // Location-specific SEO (highest priority for untapped goldmines!)
      const locationName = decodeURIComponent(location);
      
      // Check if it's a Canadian province
      const canadianProvinces = {
        'ON': 'Ontario',
        'Ontario': 'Ontario',
        'QC': 'Quebec', 
        'Quebec': 'Quebec',
        'BC': 'British Columbia',
        'AB': 'Alberta',
        'NS': 'Nova Scotia',
        'SK': 'Saskatchewan',
        'NB': 'New Brunswick',
        'MB': 'Manitoba',
        'NL': 'Newfoundland'
      };

      // Check if it's an Australian state
      const australianStates = {
        'NSW': 'New South Wales',
        'QLD': 'Queensland',
        'VIC': 'Victoria',
        'SA': 'South Australia',
        'WA': 'Western Australia',
        'TAS': 'Tasmania',
        'ACT': 'Australian Capital Territory'
      };

      // International locations
      const internationalLocations: { [key: string]: { title: string; keywords: string; description: string } } = {
        'Tokyo': {
          title: 'Senior Living Tokyo Japan - 49 Communities',
          keywords: 'senior living Tokyo, retirement homes Japan, elderly care Tokyo, 高齢者施設',
          description: 'Find 49 senior living communities in Tokyo, Japan. English-language directory for expats and international families seeking elderly care in Tokyo.'
        },
        'Singapore': {
          title: 'Senior Living Singapore - 27 Facilities',
          keywords: 'senior living Singapore, retirement homes Singapore, elderly care Singapore',
          description: 'Discover 27 senior living facilities in Singapore. Complete directory of retirement communities and elderly care options for international families.'
        },
        'Scotland': {
          title: 'Care Homes Scotland - 31 Facilities',
          keywords: 'care homes Scotland, Scottish retirement homes, elderly care Scotland',
          description: 'Search 31 care homes across Scotland. Find retirement communities and senior living options throughout Scottish regions.'
        },
        'Mexico': {
          title: 'Senior Living Mexico - Retirement Communities',
          keywords: 'senior living Mexico, retirement Mexico, casas de retiro México',
          description: 'Explore senior living communities across Mexico. Find retirement homes and elderly care facilities for expats and locals.'
        },
        'France': {
          title: 'Senior Living France - EHPAD & Retirement Homes',
          keywords: 'senior living France, EHPAD, maisons de retraite France',
          description: 'Find senior living and EHPAD facilities in France. Complete directory for international families seeking elderly care in France.'
        }
      };

      // Generate location-specific title and metadata
      if (canadianProvinces[locationName]) {
        const provinceName = canadianProvinces[locationName];
        dynamicTitle = `Senior Living ${provinceName} - ${totalResults || 'All'} Communities | MySeniorValet`;
        dynamicDescription = `Explore ${totalResults || 'all'} senior living communities in ${provinceName}, Canada. Compare retirement homes, assisted living, long-term care facilities with transparent pricing. No referral fees.`;
        dynamicKeywords = `senior living ${provinceName}, retirement homes ${provinceName}, ${provinceName} assisted living, ${provinceName} nursing homes, elderly care ${provinceName} Canada`;
      } else if (australianStates[locationName]) {
        const stateName = australianStates[locationName];
        dynamicTitle = `Aged Care ${stateName} Australia - ${totalResults || 'All'} Facilities | MySeniorValet`;
        dynamicDescription = `Find ${totalResults || 'all'} aged care facilities in ${stateName}, Australia. Compare retirement villages, residential aged care, and nursing homes with transparent information.`;
        dynamicKeywords = `aged care ${stateName}, retirement villages ${stateName}, ${stateName} nursing homes, elderly care ${stateName} Australia, residential aged care ${stateName}`;
      } else if (internationalLocations[locationName]) {
        const locData = internationalLocations[locationName];
        dynamicTitle = `${locData.title} | MySeniorValet`;
        dynamicDescription = locData.description;
        dynamicKeywords = locData.keywords;
      } else {
        // Generic location (US cities, etc.)
        dynamicTitle = `Senior Living ${locationName} - ${totalResults || 'Find'} Communities | MySeniorValet`;
        dynamicDescription = `${totalResults ? `Browse ${totalResults}` : 'Find'} senior living communities in ${locationName}. Compare assisted living, memory care, independent living facilities with verified pricing and availability.`;
        dynamicKeywords = `senior living ${locationName}, assisted living ${locationName}, memory care ${locationName}, retirement homes ${locationName}, nursing homes ${locationName}`;
      }

      // Generate location-based structured data
      const searchAction = {
        "@context": "https://schema.org",
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `https://www.myseniorvalet.com/search?location=${encodeURIComponent(locationName)}`
        },
        "query-input": "required name=location"
      };

      const breadcrumb = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://www.myseniorvalet.com"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Search",
            "item": "https://www.myseniorvalet.com/search"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": locationName,
            "item": `https://www.myseniorvalet.com/search?location=${encodeURIComponent(locationName)}`
          }
        ]
      };

      setStructuredData([searchAction, breadcrumb]);

    } else if (query) {
      // General search query SEO
      const searchTerm = decodeURIComponent(query);
      dynamicTitle = `"${searchTerm}" - ${totalResults || 'Search'} Results | MySeniorValet`;
      dynamicDescription = `${totalResults ? `Found ${totalResults} results` : 'Search results'} for "${searchTerm}". Browse senior living communities, services, and resources matching your search.`;
      dynamicKeywords = `${searchTerm}, senior living search, ${searchTerm} elderly care, ${searchTerm} retirement`;
      
    } else if (careType) {
      // Care type specific SEO
      dynamicTitle = `${careType} Communities - ${totalResults || 'Find'} Options | MySeniorValet`;
      dynamicDescription = `Discover ${totalResults || ''} ${careType} communities. Compare facilities, pricing, and availability across multiple locations.`;
      dynamicKeywords = `${careType}, ${careType} facilities, ${careType} costs, ${careType} near me`;
      
    } else {
      // Default search page SEO
      dynamicTitle = "Search Senior Living - 33,500+ Communities Worldwide | MySeniorValet";
      dynamicDescription = "Search 33,500+ senior living communities across USA, Canada, Australia, Japan, Singapore, and more. Find the perfect community with transparent pricing.";
      dynamicKeywords = "senior living search, find retirement homes, assisted living search, elderly care directory";
    }

    setTitle(dynamicTitle);
    setDescription(dynamicDescription);
    setKeywords(dynamicKeywords);
  }, [location, query, careType, priceRange, totalResults, city, state, country]);

  return (
    <Helmet>
      {/* Dynamic Title & Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Canonical URL for search pages */}
      {location && (
        <link 
          rel="canonical" 
          href={`https://www.myseniorvalet.com/search?location=${encodeURIComponent(location)}`} 
        />
      )}
      
      {/* Open Graph tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="MySeniorValet" />
      
      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      
      {/* Location-based meta tags */}
      {state && <meta name="geo.region" content={`${country || 'US'}-${state}`} />}
      {city && <meta name="geo.placename" content={city} />}
      
      {/* Structured Data */}
      {structuredData && Array.isArray(structuredData) ? (
        structuredData.map((data, index) => (
          <script key={index} type="application/ld+json">
            {JSON.stringify(data)}
          </script>
        ))
      ) : structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}