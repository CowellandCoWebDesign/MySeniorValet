import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { NavigationHeader } from "@/components/NavigationHeader";
import { CommunityDirectorySections } from "@/components/CommunityDirectorySections";

interface DirectoryPageSettings {
  defaultSort: string;
  promoBannerEnabled: boolean;
  promoBannerText: string;
  pinnedCommunityIds: number[];
}

export default function CommunityDirectory() {
  const { data: pageSettings } = useQuery<DirectoryPageSettings>({
    queryKey: ["/api/settings/directory-page"],
    staleTime: 60_000,
  });

  return (
    <div>
      <Helmet>
        <title>Assisted Living, Memory Care & Nursing Homes Directory | MySeniorValet</title>
        <meta name="description" content="Search assisted living, memory care, independent living & nursing homes worldwide. Verified pricing, real availability, 24/7 support. USA, Canada, Australia, Japan, Mexico and more." />
        <meta name="keywords" content="senior living Canada, retirement homes Ontario, senior care Quebec, assisted living BC, Alberta senior communities, senior living Australia, NSW retirement homes, Queensland aged care, Victoria nursing homes, senior living Japan, Tokyo retirement, Singapore elderly care, Scotland care homes, Mexico retirement communities, senior living USA, Brookdale Senior Living, Atria Senior Living, Provincial Senior Living, HUD senior housing, international senior care directory, worldwide retirement homes, global elderly care, Ontario nursing homes, Quebec CHSLD, British Columbia senior care, Australian aged care facilities, Japanese senior homes" />
        
        {/* Open Graph tags for social sharing */}
        <meta property="og:title" content="Assisted Living, Memory Care & Nursing Homes Directory | MySeniorValet" />
        <meta property="og:description" content="Search assisted living, memory care, independent living & nursing homes worldwide. Verified pricing across USA, Canada, Australia, Japan & Mexico. Compare care options 24/7." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.myseniorvalet.com/community-directory" />
        <meta property="og:image" content="https://www.myseniorvalet.com/og-image.jpg" />
        <meta property="og:site_name" content="MySeniorValet" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Assisted Living, Memory Care & Nursing Homes Directory" />
        <meta name="twitter:description" content="Search assisted living, memory care, independent living & nursing homes worldwide. Verified pricing, real availability, 24/7 support across USA, Canada, Australia, Japan." />
        <meta name="twitter:image" content="https://www.myseniorvalet.com/og-image.jpg" />
        
        {/* Additional SEO tags */}
        <link rel="canonical" href="https://www.myseniorvalet.com/community-directory" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="MySeniorValet" />
        
        {/* Comprehensive Structured Data for Global Directory */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Worldwide Senior Living Directory 2025",
            "description": "Comprehensive senior living directory with communities across multiple countries. USA, Canada, Australia, Japan, Singapore, Scotland, Mexico and more.",
            "url": "https://myseniorvalet.com/community-directory",
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://myseniorvalet.com"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Community Directory",
                  "item": "https://myseniorvalet.com/community-directory"
                }
              ]
            },
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": "33500",
              "itemListElement": [
                {
                  "@type": "Place",
                  "name": "Canadian Senior Living",
                  "description": "5,343 communities across 13 provinces/territories",
                  "containsPlace": [
                    {"@type": "Place", "name": "Ontario", "description": "1,707 senior communities"},
                    {"@type": "Place", "name": "Quebec", "description": "1,278 senior communities"},
                    {"@type": "Place", "name": "British Columbia", "description": "987 senior communities"},
                    {"@type": "Place", "name": "Alberta", "description": "570 senior communities"}
                  ]
                },
                {
                  "@type": "Place",
                  "name": "Australian Senior Care",
                  "description": "1,458 aged care facilities across 6 states",
                  "containsPlace": [
                    {"@type": "Place", "name": "New South Wales", "description": "430 aged care facilities"},
                    {"@type": "Place", "name": "Queensland", "description": "330 aged care facilities"},
                    {"@type": "Place", "name": "Victoria", "description": "324 aged care facilities"}
                  ]
                },
                {
                  "@type": "Organization",
                  "name": "Brookdale Senior Living",
                  "description": "America's largest provider with 700+ communities",
                  "areaServed": "United States"
                },
                {
                  "@type": "Organization",
                  "name": "Provincial Senior Living",
                  "description": "55 affordable communities including Solstice brand",
                  "areaServed": "United States"
                },
                {
                  "@type": "Place",
                  "name": "Japan Senior Living",
                  "description": "49 communities in Tokyo metropolitan area"
                },
                {
                  "@type": "Place",
                  "name": "Singapore Senior Care",
                  "description": "27 senior care facilities"
                },
                {
                  "@type": "Place",
                  "name": "Scotland Care Homes",
                  "description": "31 care homes across Scotland"
                }
              ]
            },
            "publisher": {
              "@type": "Organization",
              "name": "MySeniorValet",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.myseniorvalet.com/logo.png"
              }
            },
            "spatialCoverage": [
              {"@type": "Country", "name": "Canada"},
              {"@type": "Country", "name": "Australia"},
              {"@type": "Country", "name": "United States"},
              {"@type": "Country", "name": "Japan"},
              {"@type": "Country", "name": "Singapore"},
              {"@type": "Country", "name": "Scotland"},
              {"@type": "Country", "name": "Mexico"},
              {"@type": "Country", "name": "Peru"},
              {"@type": "Country", "name": "Cuba"},
              {"@type": "Country", "name": "Costa Rica"},
              {"@type": "Country", "name": "Panama"}
            ]
          })}
        </script>
      </Helmet>
      <NavigationHeader />
      {/* Admin-configured promotional banner */}
      {pageSettings?.promoBannerEnabled && pageSettings.promoBannerText && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2 text-center">
            <Sparkles className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm font-medium">{pageSettings.promoBannerText}</span>
          </div>
        </div>
      )}
      <main>
        <CommunityDirectorySections showHero />
      </main>
    </div>
  );
}
