import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { db } from '../db';
import { communities } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { generateStructuredData, generateBreadcrumbSchema, generateLocationSchema } from '../seo/structured-data-generator';

// Detect if the request is from a social media crawler
export function isSocialMediaCrawler(userAgent: string | undefined): boolean {
  if (!userAgent) return false;
  
  const crawlers = [
    'facebookexternalhit',
    'Facebot',
    'Twitterbot',
    'LinkedInBot',
    'WhatsApp',
    'Slackbot',
    'TelegramBot',
    'Discordbot',
    'Pinterest',
    'Applebot',
    'Googlebot',
    'bingbot'
  ];
  
  return crawlers.some(crawler => 
    userAgent.toLowerCase().includes(crawler.toLowerCase())
  );
}

// Get metadata for different page types
async function getPageMetadata(url: string): Promise<{
  title: string;
  description: string;
  image: string;
  type: string;
  keywords?: string;
  structuredData?: any;
  breadcrumbs?: any;
  canonicalUrl?: string;
  robots?: string;
  hreflang?: Array<{ lang: string; url: string }>;
}> {
  const defaultImage = 'https://www.myseniorvalet.com/og-image.jpg';
  const baseUrl = 'https://www.myseniorvalet.com';
  
  // Parse the URL
  const urlParts = url.split('/').filter(Boolean);
  const [section, id, ...rest] = urlParts;
  
  // Community detail pages
  if (section === 'community' && id) {
    try {
      const communityId = parseInt(id);
      if (!isNaN(communityId)) {
        const [community] = await db.select().from(communities)
          .where(eq(communities.id, communityId))
          .limit(1);
        
        if (community) {
          const priceText = community.rentPerMonth 
            ? `Starting at $${community.rentPerMonth}/mo` 
            : community.priceRange 
            ? `$${(community.priceRange as any).min}-$${(community.priceRange as any).max}/mo`
            : 'Contact for pricing';
            
          const careTypes = community.careTypes?.join(', ') || 'Senior Living';
          
          // Generate structured data for this community
          const structuredData = generateStructuredData(community, 'community');
          const breadcrumbs = generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Senior Housing Directory', url: '/community-directory' },
            { name: community.state, url: `/search?location=${community.state}` },
            { name: community.city, url: `/search?location=${community.city},${community.state}` },
            { name: community.name, url: `/community/${community.id}` }
          ], baseUrl);
          
          return {
            title: `${community.name} - ${community.city}, ${community.state} | MySeniorValet`,
            description: `${community.name} offers ${careTypes} in ${community.city}, ${community.state}. ${priceText}. ${community.description || 'View photos, amenities, reviews and verified pricing on MySeniorValet.'}`,
            image: community.photos?.[0] || defaultImage,
            type: 'article',
            keywords: `${community.name}, ${community.city} senior living, ${community.state} ${careTypes.toLowerCase()}, ${community.zipCode}`,
            structuredData,
            breadcrumbs,
            canonicalUrl: `${baseUrl}/community/${community.id}`,
            robots: 'index, follow',
            hreflang: [
              { lang: 'en', url: `${baseUrl}/community/${community.id}` },
              { lang: 'es', url: `${baseUrl}/es/community/${community.id}` },
              { lang: 'fr', url: `${baseUrl}/fr/community/${community.id}` }
            ]
          };
        }
      }
    } catch (error) {
      console.error('Error fetching community metadata:', error);
    }
  }
  
  // Community Directory page
  if (section === 'community-directory') {
    // Check for location query parameter in URL (e.g., ?location=oakmont, ?location=puerto-rico)
    const queryParams = url.includes('?') ? new URLSearchParams(url.split('?')[1]) : null;
    const location = queryParams?.get('location') || null;
    
    // Location-specific metadata
    const locationMeta: Record<string, { title: string; description: string; keywords: string }> = {
      'oakmont': {
        title: 'Oakmont Senior Living | 60+ Communities in California | MySeniorValet',
        description: 'Explore Oakmont Senior Living\'s 60+ luxury communities across California. Known for signature restaurants, wellness programs, and resort-style amenities. Starting from $3,500/mo.',
        keywords: 'Oakmont Senior Living, California luxury senior communities, Oakmont retirement homes'
      },
      'puerto-rico': {
        title: 'Puerto Rico Senior Living | 50+ Caribbean Communities | MySeniorValet',
        description: 'Discover 50+ senior living communities in Puerto Rico. Enjoy tax benefits, tropical climate, and bilingual healthcare. Social Security goes 40% further. Medicare accepted.',
        keywords: 'Puerto Rico senior living, Caribbean retirement, Act 60 tax benefits, bilingual senior care'
      },
      'peru': {
        title: 'Peru Senior Living | Affordable Expat Retirement | MySeniorValet',
        description: 'Find affordable senior living in Peru. USD goes 3x further with communities starting at $500/mo. English-speaking care, mountain and coastal options.',
        keywords: 'Peru retirement, Lima senior living, Cusco expat communities, affordable senior care Peru'
      },
      'hawaii': {
        title: 'Hawaii Senior Living | 55+ Island Communities | MySeniorValet',
        description: 'Browse 55+ senior living communities across Hawaiian islands. Oceanfront assisted living, memory care with aloha spirit. Kaiser Permanente partnerships.',
        keywords: 'Hawaii senior living, Honolulu assisted living, Maui retirement homes, island senior care'
      },
      'fort-worth': {
        title: 'Fort Worth Texas Senior Living | 180+ Communities | MySeniorValet',
        description: 'Search 180+ senior living communities in Fort Worth, Texas. No state income tax, affordable luxury options from $2,000/mo. Medical district proximity.',
        keywords: 'Fort Worth senior living, Texas retirement communities, DFW assisted living, Fort Worth memory care'
      },
      'new-york': {
        title: 'New York Senior Living | 2,800+ Communities Statewide | MySeniorValet',
        description: 'Explore 2,800+ senior living options across New York State. From Manhattan luxury high-rises to upstate affordability. Medicaid accepted at many locations.',
        keywords: 'New York senior living, NYC assisted living, Manhattan retirement, upstate NY senior care'
      },
      'cuba': {
        title: 'Cuba Senior Living | International Healthcare Options | MySeniorValet',
        description: 'Discover senior living possibilities in Cuba. International medical programs, tropical climate, emerging expat communities. USD goes 5x further.',
        keywords: 'Cuba retirement, Havana senior living, Caribbean healthcare, Cuba expat communities'
      },
      'costa-rica': {
        title: 'Costa Rica Senior Living | Pensionado Paradise | MySeniorValet',
        description: 'Find retirement communities in Costa Rica. Pensionado visa discounts 25-50% on everything. CAJA healthcare $75-150/mo. Perfect climate year-round.',
        keywords: 'Costa Rica retirement, Pensionado program, Central Valley senior living, CAJA healthcare'
      },
      'panama': {
        title: 'Panama Senior Living | US Dollar Economy | MySeniorValet',
        description: 'Browse senior communities in Panama with US dollar stability. Pensionado discounts, territorial tax benefits, Johns Hopkins affiliate healthcare.',
        keywords: 'Panama retirement, Boquete senior living, Panama City expat, Pensionado benefits Panama'
      },
      'japan': {
        title: 'Tokyo Senior Living | 49 Japanese Communities | MySeniorValet',
        description: 'Explore 49 senior living communities in Tokyo metropolitan area. Traditional Japanese hospitality, advanced healthcare technology, multilingual support.',
        keywords: 'Tokyo senior living, Japan retirement, Japanese assisted living, Tokyo elderly care'
      },
      'singapore': {
        title: 'Singapore Senior Care | 27 Premium Facilities | MySeniorValet',
        description: 'Discover 27 senior care facilities in Singapore. World-class healthcare, English-speaking staff, tropical climate. Strategic Asia-Pacific location.',
        keywords: 'Singapore senior living, Singapore elderly care, Asia retirement, Singapore nursing homes'
      },
      'scotland': {
        title: 'Scotland Care Homes | 31 Highland Communities | MySeniorValet',
        description: 'Find 31 care homes across Scotland. NHS healthcare access, historic settings, English-speaking care in Edinburgh, Glasgow, and Highlands.',
        keywords: 'Scotland care homes, Edinburgh senior living, Glasgow elderly care, Scottish retirement'
      },
      'canada': {
        title: 'Canada Senior Living | 5,343 Communities Nationwide | MySeniorValet',
        description: 'Search 5,343 senior living communities across Canada. Ontario (1,707), Quebec (1,278), BC (987), Alberta (570). Universal healthcare included.',
        keywords: 'Canada senior living, Ontario retirement homes, Quebec CHSLD, BC senior care, Alberta assisted living'
      },
      'australia': {
        title: 'Australia Senior Living | 1,458 Aged Care Facilities | MySeniorValet',
        description: 'Browse 1,458 aged care facilities across Australia. NSW (430), Queensland (330), Victoria (324). Government subsidized care available.',
        keywords: 'Australia aged care, Sydney retirement homes, Melbourne senior living, Brisbane elderly care'
      }
    };
    
    if (location && locationMeta[location]) {
      const breadcrumbs = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Senior Housing Directory', url: '/community-directory' },
        { name: locationMeta[location].title.split(' | ')[0], url: `/community-directory?location=${location}` }
      ], baseUrl);
      
      return {
        title: locationMeta[location].title,
        description: locationMeta[location].description,
        image: defaultImage,
        type: 'website',
        keywords: locationMeta[location].keywords,
        structuredData: generateDirectorySchema(baseUrl),
        breadcrumbs,
        canonicalUrl: `/directory/${location}`, // Future canonical URL
        robots: 'index, follow',
        hreflang: [
          { lang: 'en', url: `${baseUrl}/community-directory?location=${location}` },
          { lang: 'es', url: `${baseUrl}/es/community-directory?location=${location}` },
          { lang: 'fr', url: `${baseUrl}/fr/community-directory?location=${location}` }
        ]
      };
    }
    
    // Default Community Directory metadata
    const breadcrumbs = generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Senior Housing Directory', url: '/community-directory' }
    ], baseUrl);
    
    return {
      title: 'Senior Housing Directory 2025 | 33,500+ Communities Worldwide | MySeniorValet',
      description: 'Browse 33,500+ senior housing options across USA, Canada, Australia, Japan, and more. All types: facilities, HUD housing, RV parks, memory care, CCRCs. Compare with verified pricing and real reviews.',
      image: defaultImage,
      type: 'website',
      keywords: 'senior housing directory, senior living facilities, HUD senior housing, retirement homes, assisted living, memory care, RV senior parks, 55+ communities',
      structuredData: generateDirectorySchema(baseUrl),
      breadcrumbs,
      canonicalUrl: `${baseUrl}/community-directory`,
      robots: 'index, follow'
    };
  }
  
  // Map Search page
  if (section === 'map-search' || section === 'search') {
    const searchQuery = url.includes('?') ? new URLSearchParams(url.split('?')[1]).get('q') : null;
    if (searchQuery) {
      return {
        title: `Senior Living Search: "${searchQuery}" | MySeniorValet`,
        description: `Search results for "${searchQuery}" - Find senior living communities, assisted living, memory care, and nursing homes. Compare verified pricing and real reviews on MySeniorValet.`,
        image: defaultImage,
        type: 'website'
      };
    }
    return {
      title: 'Search Senior Living Communities | Interactive Map | MySeniorValet',
      description: 'Search 35,264+ senior living communities on our interactive map. Filter by care type, price, amenities. Find assisted living, memory care, nursing homes near you.',
      image: defaultImage,
      type: 'website'
    };
  }
  
  // Senior Marketplace
  if (section === 'senior-marketplace' || section === 'vendors-marketplace') {
    return {
      title: 'Senior Living Marketplace | Services & Products | MySeniorValet',
      description: 'Connect with trusted senior living vendors, healthcare providers, and services. Find moving companies, medical equipment, home care, legal services, and more.',
      image: defaultImage,
      type: 'website'
    };
  }
  
  // Location-specific pages
  if (section === 'senior-living-san-francisco') {
    return {
      title: 'San Francisco Senior Living | 127 Communities | MySeniorValet',
      description: 'Find senior living in San Francisco, CA. Compare 127 assisted living, memory care, and nursing homes with verified pricing from $2,500-$15,000/mo.',
      image: defaultImage,
      type: 'website'
    };
  }
  
  if (section === 'senior-living-san-diego') {
    return {
      title: 'San Diego Senior Living | 200+ Communities | MySeniorValet',
      description: 'Discover senior living options in San Diego, CA. Browse 200+ communities including beachfront assisted living, memory care, and luxury retirement homes.',
      image: defaultImage,
      type: 'website'
    };
  }
  
  if (section === 'senior-living-worldwide') {
    return {
      title: 'Worldwide Senior Living | 15+ Countries | MySeniorValet',
      description: 'Explore senior living globally across USA, Canada, Australia, Japan, Singapore, Scotland, Mexico, and more. Compare international retirement options.',
      image: defaultImage,
      type: 'website'
    };
  }
  
  if (section === 'assisted-living') {
    return {
      title: 'Assisted Living Communities | Compare 15,000+ Options | MySeniorValet',
      description: 'Find assisted living near you. Compare 15,000+ communities with help for daily activities, medication management, and personal care. Verified pricing and reviews.',
      image: defaultImage,
      type: 'website'
    };
  }
  
  if (section === 'admin-mega-dashboard') {
    return {
      title: 'Admin Dashboard | MySeniorValet',
      description: 'MySeniorValet administrative dashboard',
      image: defaultImage,
      type: 'website'
    };
  }
  
  // Competitive Analysis page
  if (section === 'competitive-analysis') {
    return {
      title: 'Senior Living Industry Analysis | Market Intelligence | MySeniorValet',
      description: 'Fortune 500-level competitive analysis of the senior living industry. Market positioning, data confidence metrics, strategic recommendations.',
      image: defaultImage,
      type: 'website'
    };
  }
  
  // Default home page
  return {
    title: 'MySeniorValet - Find Senior Living Communities | 35,264+ Verified Locations',
    description: 'FREE platform for families. Search 35,264+ senior living communities with transparent pricing, verified HUD rates, and real reviews. We NEVER sell your data.',
    image: defaultImage,
    type: 'website',
    keywords: 'senior living, assisted living, memory care, nursing homes, retirement communities, elder care'
  };
}

// Middleware to inject meta tags for social media crawlers
export async function injectMetaTags(req: Request, res: Response, next: NextFunction) {
  // Only process HTML requests
  if (!req.accepts('html')) {
    return next();
  }
  
  const userAgent = req.get('User-Agent');
  const isCrawler = isSocialMediaCrawler(userAgent);
  
  // Log crawler requests for debugging
  if (isCrawler) {
    console.log(`🤖 Social media crawler detected: ${userAgent}`);
    console.log(`   Requesting: ${req.url}`);
  }
  
  // Get the index.html path
  const indexPath = process.env.NODE_ENV === 'development'
    ? path.resolve(process.cwd(), 'client', 'index.html')
    : path.resolve(process.cwd(), 'public', 'index.html');
  
  // Check if file exists
  if (!fs.existsSync(indexPath)) {
    console.warn(`Index.html not found at ${indexPath}`);
    return next();
  }
  
  try {
    // Read the HTML file
    let html = await fs.promises.readFile(indexPath, 'utf-8');
    
    // Get page-specific metadata
    const metadata = await getPageMetadata(req.path);
    
    // Build the full URL
    const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
    const host = req.get('host') || 'www.myseniorvalet.com';
    const fullUrl = `${protocol}://${host}${req.originalUrl}`;
    
    // Build canonical URL
    const canonicalUrl = metadata.canonicalUrl || fullUrl;
    
    // Build hreflang tags
    const hreflangTags = metadata.hreflang 
      ? metadata.hreflang.map(({ lang, url }) => 
          `<link rel="alternate" hreflang="${lang}" href="${url}" />`
        ).join('\n    ')
      : '';
    
    // Build structured data
    const structuredDataScript = metadata.structuredData 
      ? `<script type="application/ld+json">
${JSON.stringify(metadata.structuredData, null, 2)}
</script>`
      : '';
    
    // Build breadcrumb structured data
    const breadcrumbScript = metadata.breadcrumbs
      ? `<script type="application/ld+json">
${JSON.stringify(metadata.breadcrumbs, null, 2)}
</script>`
      : '';
    
    // Replace or inject meta tags
    const metaTagsToInject = `
    <title>${metadata.title}</title>
    <meta name="description" content="${metadata.description}" />
    ${metadata.keywords ? `<meta name="keywords" content="${metadata.keywords}" />` : ''}
    ${metadata.robots ? `<meta name="robots" content="${metadata.robots}" />` : '<meta name="robots" content="index, follow" />'}
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="${metadata.type}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:title" content="${metadata.title}" />
    <meta property="og:description" content="${metadata.description}" />
    <meta property="og:image" content="${metadata.image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="MySeniorValet" />
    <meta property="og:locale" content="en_US" />
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="${canonicalUrl}" />
    <meta property="twitter:title" content="${metadata.title}" />
    <meta property="twitter:description" content="${metadata.description}" />
    <meta property="twitter:image" content="${metadata.image}" />
    <meta property="twitter:site" content="@MySeniorValet" />
    
    <!-- Canonical and Language Alternates -->
    <link rel="canonical" href="${canonicalUrl}" />
    ${hreflangTags}
    
    <!-- Structured Data for Search Engines -->
    ${structuredDataScript}
    ${breadcrumbScript}`;
    
    // Replace existing meta tags with new ones
    // First, remove old meta tags to avoid duplicates
    html = html.replace(/<title>.*?<\/title>/s, '');
    html = html.replace(/<meta name="description".*?>/g, '');
    html = html.replace(/<meta name="keywords".*?>/g, '');
    html = html.replace(/<meta property="og:.*?>/g, '');
    html = html.replace(/<meta property="twitter:.*?>/g, '');
    html = html.replace(/<meta name="twitter:.*?>/g, '');
    
    // Inject new meta tags right after <head>
    html = html.replace('<head>', `<head>\n${metaTagsToInject}`);
    
    // Send the modified HTML
    res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
    
    if (isCrawler) {
      console.log(`✅ Successfully served SEO-optimized page to crawler`);
    }
  } catch (error) {
    console.error('Error injecting meta tags:', error);
    // Fall back to normal serving
    next();
  }
}

// Export a simpler version for production that only runs for crawlers
export function createSEOMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    // Only inject meta tags for social media crawlers
    const userAgent = req.get('User-Agent');
    if (!isSocialMediaCrawler(userAgent)) {
      return next();
    }
    
    // Use the injection middleware
    return injectMetaTags(req, res, next);
  };
}