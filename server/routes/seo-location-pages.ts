import { Request, Response } from 'express';
import { db } from '../db';
import { communities } from '../../shared/schema';
import { eq, and, sql, ilike, or } from 'drizzle-orm';

// Map of state/province codes to full names
const stateProvinceNames: Record<string, string> = {
  // US States
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
  'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
  'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
  'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
  'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
  'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
  'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
  'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
  'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
  'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
  'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'District of Columbia',
  // Canadian Provinces  
  'ON': 'Ontario', 'QC': 'Quebec', 'BC': 'British Columbia', 'AB': 'Alberta',
  'MB': 'Manitoba', 'SK': 'Saskatchewan', 'NS': 'Nova Scotia', 'NB': 'New Brunswick',
  'NL': 'Newfoundland and Labrador', 'PE': 'Prince Edward Island',
  'YT': 'Yukon', 'NU': 'Nunavut',
  // Australian States (using full codes to avoid conflicts with US states)
  'NSW': 'New South Wales', 'VIC': 'Victoria', 'QLD': 'Queensland',
  'AU-SA': 'South Australia', 'AU-WA': 'Western Australia', 'TAS': 'Tasmania',
  'ACT': 'Australian Capital Territory'
};

// Country detection based on state/province codes
const getCountryFromState = (state: string): string => {
  const canadianProvinces = ['ON', 'QC', 'BC', 'AB', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE', 'YT', 'NU'];
  const australianStates = ['NSW', 'VIC', 'QLD', 'AU-SA', 'AU-WA', 'TAS', 'ACT'];
  
  if (canadianProvinces.includes(state.toUpperCase())) return 'Canada';
  if (australianStates.includes(state.toUpperCase())) return 'Australia';
  return 'United States';
};

// Format city name for display
const formatCityName = (city: string): string => {
  return city
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Generate location data with statistics
async function getLocationData(state: string, city?: string) {
  try {
    const stateUpper = state.toUpperCase();
    const country = getCountryFromState(stateUpper);
    
    // Build query conditions
    let conditions = [];
    
    if (city) {
      // City-specific query
      const formattedCity = formatCityName(city);
      conditions.push(
        and(
          ilike(communities.city, formattedCity),
          eq(communities.state, stateUpper)
        )
      );
    } else {
      // State/province-wide query
      conditions.push(eq(communities.state, stateUpper));
    }
    
    // Get community count and statistics
    const stats = await db
      .select({
        totalCount: sql<number>`COUNT(*)`,
        avgPrice: sql<number>`AVG((${communities.priceRange}->>'min')::numeric)`,
        minPrice: sql<number>`MIN((${communities.priceRange}->>'min')::numeric)`,
        maxPrice: sql<number>`MAX((${communities.priceRange}->>'max')::numeric)`,
        withPricing: sql<number>`COUNT(CASE WHEN ${communities.priceRange} IS NOT NULL THEN 1 END)`,
        independentLiving: sql<number>`COUNT(CASE WHEN 'Independent Living' = ANY(${communities.careTypes}) THEN 1 END)`,
        assistedLiving: sql<number>`COUNT(CASE WHEN 'Assisted Living' = ANY(${communities.careTypes}) THEN 1 END)`,
        memoryCare: sql<number>`COUNT(CASE WHEN 'Memory Care' = ANY(${communities.careTypes}) THEN 1 END)`,
        nursingHome: sql<number>`COUNT(CASE WHEN 'Skilled Nursing' = ANY(${communities.careTypes}) THEN 1 END)`,
        ccrc: sql<number>`COUNT(CASE WHEN 'CCRC' = ANY(${communities.careTypes}) OR 'Continuing Care' = ANY(${communities.careTypes}) THEN 1 END)`
      })
      .from(communities)
      .where(or(...conditions));
    
    // Get sample communities for showcasing
    const sampleCommunities = await db
      .select({
        id: communities.id,
        name: communities.name,
        city: communities.city,
        state: communities.state,
        careTypes: communities.careTypes,
        priceRange: communities.priceRange
      })
      .from(communities)
      .where(or(...conditions))
      .orderBy(sql`RANDOM()`)
      .limit(6);
    
    // Get nearby cities if viewing a state
    let nearbyCities = [];
    if (!city) {
      nearbyCities = await db
        .select({
          city: communities.city,
          count: sql<number>`COUNT(*)`
        })
        .from(communities)
        .where(eq(communities.state, stateUpper))
        .groupBy(communities.city)
        .orderBy(sql`COUNT(*) DESC`)
        .limit(10);
    } else {
      // Get other cities in the same state
      nearbyCities = await db
        .select({
          city: communities.city,
          count: sql<number>`COUNT(*)`
        })
        .from(communities)
        .where(
          and(
            eq(communities.state, stateUpper),
            sql`${communities.city} != ${formatCityName(city)}`
          )
        )
        .groupBy(communities.city)
        .orderBy(sql`COUNT(*) DESC`)
        .limit(6);
    }
    
    return {
      state: stateUpper,
      stateName: stateProvinceNames[stateUpper] || stateUpper,
      city: city ? formatCityName(city) : null,
      country,
      stats: stats[0] || {},
      sampleCommunities,
      nearbyCities
    };
  } catch (error) {
    console.error('Error fetching location data:', error);
    return null;
  }
}

// Detect if request is from a bot/crawler
function isCrawler(userAgent: string): boolean {
  const crawlerPatterns = [
    /googlebot/i,
    /bingbot/i,
    /slurp/i,
    /duckduckbot/i,
    /baiduspider/i,
    /yandexbot/i,
    /facebookexternalhit/i,
    /twitterbot/i,
    /linkedinbot/i,
    /whatsapp/i,
    /slackbot/i,
    /applebot/i,
    /semrushbot/i,
    /ahrefsbot/i,
    /mj12bot/i,
    /dotbot/i,
    /rogerbot/i,
    /seznambot/i
  ];
  
  return crawlerPatterns.some(pattern => pattern.test(userAgent));
}

// Generate SEO-optimized HTML page
export async function renderSEOLocationPage(req: Request, res: Response) {
  const { state, city } = req.params;
  const userAgent = req.headers['user-agent'] || '';
  
  // Get location data
  const locationData = await getLocationData(state, city);
  
  if (!locationData || locationData.stats.totalCount === 0) {
    return res.status(404).send('Location not found');
  }
  
  // For regular users, redirect to AI Search Intelligence
  if (!isCrawler(userAgent)) {
    const location = city 
      ? `${locationData.city}, ${locationData.state}`
      : locationData.stateName;
    const redirectUrl = `/ai-search-intelligence?mode=simplified&location=${encodeURIComponent(location)}&country=${encodeURIComponent(locationData.country)}`;
    return res.redirect(301, redirectUrl);
  }
  
  // For crawlers, serve SEO-optimized HTML
  const { stats, sampleCommunities, nearbyCities, stateName, country } = locationData;
  const locationName = city ? `${locationData.city}, ${stateName}` : stateName;
  
  // Generate title and meta description
  const title = `Senior Living in ${locationName} | ${stats.totalCount} Communities | MySeniorValet`;
  
  const priceRange = stats.withPricing > 0 
    ? `Pricing from $${Math.round(stats.minPrice).toLocaleString()} to $${Math.round(stats.maxPrice).toLocaleString()}/month. `
    : '';
  
  const description = `Find ${stats.totalCount} senior living communities in ${locationName}. ${priceRange}Compare ${stats.independentLiving > 0 ? 'independent living, ' : ''}${stats.assistedLiving > 0 ? 'assisted living, ' : ''}${stats.memoryCare > 0 ? 'memory care, ' : ''}and more. Get verified pricing and availability.`;
  
  // Generate structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": title,
    "description": description,
    "url": `https://www.myseniorvalet.com/senior-living/${state}${city ? `/${city}` : ''}`,
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "item": {
            "@id": "https://www.myseniorvalet.com",
            "name": "MySeniorValet"
          }
        },
        {
          "@type": "ListItem",
          "position": 2,
          "item": {
            "@id": `https://www.myseniorvalet.com/senior-living/${state}`,
            "name": stateName
          }
        }
      ]
    },
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": stats.totalCount,
      "itemListElement": sampleCommunities.map((community, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Place",
          "name": community.name,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": community.city,
            "addressRegion": community.state,
            "addressCountry": country === 'United States' ? 'US' : country === 'Canada' ? 'CA' : 'AU'
          }
        }
      }))
    }
  };
  
  if (city && locationData.city) {
    structuredData.breadcrumb.itemListElement.push({
      "@type": "ListItem",
      "position": 3,
      "item": {
        "@id": `https://www.myseniorvalet.com/senior-living/${state}/${city}`,
        "name": locationData.city
      }
    });
  }
  
  // Generate HTML content
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="https://www.myseniorvalet.com/senior-living/${state}${city ? `/${city}` : ''}">
  
  ${/* Add hreflang tags for international content */''} 
  ${country === 'Canada' ? `
  <link rel="alternate" hreflang="en-CA" href="https://www.myseniorvalet.com/senior-living/${state}${city ? `/${city}` : ''}" />
  <link rel="alternate" hreflang="fr-CA" href="https://www.myseniorvalet.com/fr/senior-living/${state}${city ? `/${city}` : ''}" />
  ` : ''}
  ${country === 'Australia' ? `
  <link rel="alternate" hreflang="en-AU" href="https://www.myseniorvalet.com/senior-living/${state}${city ? `/${city}` : ''}" />
  ` : ''}
  ${country === 'United States' ? `
  <link rel="alternate" hreflang="en-US" href="https://www.myseniorvalet.com/senior-living/${state}${city ? `/${city}` : ''}" />
  ` : ''}
  <link rel="alternate" hreflang="x-default" href="https://www.myseniorvalet.com/senior-living/${state}${city ? `/${city}` : ''}" />
  
  <!-- Open Graph tags -->
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://www.myseniorvalet.com/senior-living/${state}${city ? `/${city}` : ''}">
  <meta property="og:site_name" content="MySeniorValet">
  <meta property="og:locale" content="${country === 'Canada' ? 'en_CA' : country === 'Australia' ? 'en_AU' : 'en_US'}">${country === 'Canada' ? `
  <meta property="og:locale:alternate" content="fr_CA">` : ''}
  
  <!-- Twitter Card tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  
  <!-- Structured Data -->
  <script type="application/ld+json">${JSON.stringify(structuredData)}</script>
  
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { color: #1a1a1a; font-size: 2.5em; margin-bottom: 10px; }
    .stats { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 20px; }
    .stat-item { background: white; padding: 15px; border-radius: 5px; }
    .stat-number { font-size: 2em; font-weight: bold; color: #4a90e2; }
    .stat-label { color: #666; margin-top: 5px; }
    .communities-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 30px 0; }
    .community-card { border: 1px solid #ddd; border-radius: 8px; padding: 15px; background: white; }
    .community-name { font-weight: bold; font-size: 1.2em; margin-bottom: 10px; }
    .community-details { color: #666; }
    .price { color: #4a90e2; font-weight: bold; margin-top: 10px; }
    .nearby-cities { margin: 30px 0; }
    .city-links { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px; }
    .city-link { background: #4a90e2; color: white; padding: 8px 16px; border-radius: 5px; text-decoration: none; }
    .city-link:hover { background: #357abd; }
    .cta { background: #4a90e2; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0; }
    .cta-button { display: inline-block; background: white; color: #4a90e2; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Senior Living Communities in ${locationName}</h1>
    <p>${description}</p>
    
    <div class="stats">
      <h2>Market Overview for ${locationName}</h2>
      <div class="stat-grid">
        <div class="stat-item">
          <div class="stat-number">${stats.totalCount}</div>
          <div class="stat-label">Total Communities</div>
        </div>
        ${stats.withPricing > 0 ? `
        <div class="stat-item">
          <div class="stat-number">$${Math.round(stats.avgPrice).toLocaleString()}</div>
          <div class="stat-label">Average Monthly Cost</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">$${Math.round(stats.minPrice).toLocaleString()}</div>
          <div class="stat-label">Starting From</div>
        </div>` : ''}
        ${stats.independentLiving > 0 ? `
        <div class="stat-item">
          <div class="stat-number">${stats.independentLiving}</div>
          <div class="stat-label">Independent Living</div>
        </div>` : ''}
        ${stats.assistedLiving > 0 ? `
        <div class="stat-item">
          <div class="stat-number">${stats.assistedLiving}</div>
          <div class="stat-label">Assisted Living</div>
        </div>` : ''}
        ${stats.memoryCare > 0 ? `
        <div class="stat-item">
          <div class="stat-number">${stats.memoryCare}</div>
          <div class="stat-label">Memory Care</div>
        </div>` : ''}
      </div>
    </div>
    
    <h2>Featured Communities in ${locationName}</h2>
    <div class="communities-grid">
      ${sampleCommunities.map(community => {
        const careTypeStr = community.careTypes?.join(', ') || 'Senior Living';
        const priceMin = community.priceRange?.min;
        return `
        <div class="community-card">
          <div class="community-name">${community.name}</div>
          <div class="community-details">
            📍 ${community.city}, ${community.state}<br>
            🏠 ${careTypeStr}
          </div>
          ${priceMin && priceMin > 0 ? `
            <div class="price">Starting at $${priceMin.toLocaleString()}/month</div>
          ` : '<div class="price">Contact for pricing</div>'}
        </div>
      `;
      }).join('')}
    </div>
    
    ${nearbyCities.length > 0 ? `
    <div class="nearby-cities">
      <h2>${city ? 'Other Cities' : 'Popular Cities'} in ${stateName}</h2>
      <div class="city-links">
        ${nearbyCities.map(nc => `
          <a href="/senior-living/${state}/${nc.city.toLowerCase().replace(/\s+/g, '-')}" class="city-link">
            ${nc.city} (${nc.count} communities)
          </a>
        `).join('')}
      </div>
    </div>` : ''}
    
    <div class="cta">
      <h2>Find Your Perfect Senior Living Community</h2>
      <p>Search all ${stats.totalCount} communities in ${locationName} with our AI-powered search engine</p>
      <a href="/ai-search-intelligence?mode=simplified&location=${encodeURIComponent(locationName)}&country=${encodeURIComponent(country)}" class="cta-button">
        Search Communities →
      </a>
    </div>
    
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;">
      <h3>About Senior Living in ${locationName}</h3>
      <p>${locationName} offers a diverse range of senior living options to meet various care needs and preferences. 
      ${stats.independentLiving > 0 ? `With ${stats.independentLiving} independent living communities, active seniors can maintain their lifestyle with added conveniences. ` : ''}
      ${stats.assistedLiving > 0 ? `The ${stats.assistedLiving} assisted living facilities provide personalized care and support with daily activities. ` : ''}
      ${stats.memoryCare > 0 ? `For those with Alzheimer's or dementia, ${stats.memoryCare} memory care units offer specialized programs and secure environments. ` : ''}
      MySeniorValet helps families navigate these options with transparent pricing, verified information, and comprehensive community profiles.</p>
      
      <p>Whether you're looking for luxury retirement communities, affordable senior housing, or specialized care facilities, 
      our platform provides the tools and information you need to make informed decisions about senior care in ${locationName}.</p>
    </div>
  </div>
</body>
</html>`;
  
  res.set('Content-Type', 'text/html');
  res.send(html);
}

// Generate list of top locations for SEO
export async function getTopLocations(limit: number = 100) {
  try {
    // Get top cities by community count
    const topCities = await db
      .select({
        city: communities.city,
        state: communities.state,
        count: sql<number>`COUNT(*)`
      })
      .from(communities)
      .where(
        and(
          sql`${communities.city} IS NOT NULL`,
          sql`${communities.state} IS NOT NULL`
        )
      )
      .groupBy(communities.city, communities.state)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(limit);
    
    // Get all states/provinces with counts
    const allStates = await db
      .select({
        state: communities.state,
        count: sql<number>`COUNT(*)`
      })
      .from(communities)
      .where(sql`${communities.state} IS NOT NULL`)
      .groupBy(communities.state)
      .orderBy(sql`COUNT(*) DESC`);
    
    return {
      cities: topCities,
      states: allStates
    };
  } catch (error) {
    console.error('Error fetching top locations:', error);
    return { cities: [], states: [] };
  }
}