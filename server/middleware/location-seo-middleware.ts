import { Request, Response, NextFunction } from 'express';
import { MAJOR_LOCATIONS } from '../../client/src/services/locationSEO.service';

// Middleware to inject location-based SEO meta tags for server-side rendering
export function locationSEOMiddleware(req: Request, res: Response, next: NextFunction) {
  // Check if this is a request for the AI search intelligence page
  if (req.path === '/ai-search-intelligence' || req.path.startsWith('/location/')) {
    const locationParam = req.query.location as string;
    
    if (locationParam) {
      // Find the location data
      const location = MAJOR_LOCATIONS.find(loc => loc.slug === locationParam);
      
      if (location) {
        // Generate SEO meta tags
        const title = generateLocationTitle(location);
        const description = generateLocationDescription(location);
        const keywords = generateLocationKeywords(location);
        
        // Store in res.locals for use in HTML template
        res.locals.seoData = {
          title,
          description,
          keywords,
          canonicalUrl: `https://www.myseniorvalet.com/ai-search-intelligence?location=${location.slug}&tab=simplified`,
          location
        };
      }
    }
  }
  
  next();
}

function generateLocationTitle(location: any): string {
  const locationStr = `${location.city}, ${location.stateAbbr}`;
  const title = `Senior Living in ${locationStr} | MySeniorValet`;
  
  // Ensure title is under 60 characters
  if (title.length > 60) {
    return `Senior Living ${locationStr} | MSV`;
  }
  
  return title;
}

function generateLocationDescription(location: any): string {
  return `Find senior living communities in ${location.city}, ${location.state}. Compare assisted living, memory care, nursing homes with transparent pricing, real availability, no hidden fees.`;
}

function generateLocationKeywords(location: any): string[] {
  return [
    `senior living ${location.city}`,
    `assisted living ${location.city} ${location.stateAbbr}`,
    `memory care ${location.city}`,
    `nursing homes ${location.city}`,
    `retirement homes ${location.city}`,
    `${location.city} senior care`,
    `${location.state} senior living`
  ];
}

// Function to inject meta tags into HTML response
export function injectSEOTags(html: string, seoData: any): string {
  if (!seoData) return html;
  
  const metaTags = `
    <title>${seoData.title}</title>
    <meta name="description" content="${seoData.description}" />
    <meta name="keywords" content="${seoData.keywords.join(', ')}" />
    <link rel="canonical" href="${seoData.canonicalUrl}" />
    <meta property="og:title" content="${seoData.title}" />
    <meta property="og:description" content="${seoData.description}" />
    <meta property="og:url" content="${seoData.canonicalUrl}" />
    <meta property="og:type" content="website" />
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:title" content="${seoData.title}" />
    <meta property="twitter:description" content="${seoData.description}" />
  `;
  
  // Replace the existing title tag or inject before </head>
  if (html.includes('<title>')) {
    // Replace existing title and add other meta tags
    html = html.replace(/<title>.*?<\/title>/, '');
  }
  
  // Inject all meta tags before </head>
  html = html.replace('</head>', `${metaTags}\n</head>`);
  
  return html;
}