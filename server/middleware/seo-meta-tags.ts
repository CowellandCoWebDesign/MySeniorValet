import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { db } from '../db';
import { communities } from '../../shared/schema';
import { eq } from 'drizzle-orm';

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
          const priceText = community.monthlyRent 
            ? `Starting at $${community.monthlyRent}/mo` 
            : 'Contact for pricing';
            
          const careTypes = community.careLevel?.join(', ') || 'Senior Living';
          
          return {
            title: `${community.name} - ${community.city}, ${community.state} | MySeniorValet`,
            description: `${community.name} offers ${careTypes} in ${community.city}, ${community.state}. ${priceText}. ${community.description || 'View photos, amenities, reviews and verified pricing on MySeniorValet.'}`,
            image: community.photos?.[0]?.url || defaultImage,
            type: 'article',
            keywords: `${community.name}, ${community.city} senior living, ${community.state} ${careTypes.toLowerCase()}, ${community.zipCode}`
          };
        }
      }
    } catch (error) {
      console.error('Error fetching community metadata:', error);
    }
  }
  
  // Community Directory page
  if (section === 'community-directory') {
    return {
      title: 'Senior Living Directory 2025 | 33,500+ Communities Worldwide | MySeniorValet',
      description: 'Browse 33,500+ senior living communities across USA, Canada, Australia, Japan, and more. Compare Brookdale, Atria, Provincial communities with verified pricing, real reviews, and transparent data.',
      image: defaultImage,
      type: 'website',
      keywords: 'senior living directory, worldwide retirement homes, Canada senior care, Australia aged care, USA assisted living, global elderly care'
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
    
    // Replace or inject meta tags
    const metaTagsToInject = `
    <title>${metadata.title}</title>
    <meta name="description" content="${metadata.description}" />
    ${metadata.keywords ? `<meta name="keywords" content="${metadata.keywords}" />` : ''}
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="${metadata.type}" />
    <meta property="og:url" content="${fullUrl}" />
    <meta property="og:title" content="${metadata.title}" />
    <meta property="og:description" content="${metadata.description}" />
    <meta property="og:image" content="${metadata.image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="MySeniorValet" />
    <meta property="og:locale" content="en_US" />
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="${fullUrl}" />
    <meta property="twitter:title" content="${metadata.title}" />
    <meta property="twitter:description" content="${metadata.description}" />
    <meta property="twitter:image" content="${metadata.image}" />
    <meta property="twitter:site" content="@MySeniorValet" />
    
    <!-- Additional SEO -->
    <link rel="canonical" href="${fullUrl}" />`;
    
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