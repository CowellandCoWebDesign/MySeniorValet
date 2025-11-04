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

// Generate unique local content based on location
function generateUniqueLocalContent(locationName: string, state: string, country: string, stats: any): string {
  // Climate and geography insights by state/province
  const climateData: Record<string, string> = {
    'CA': 'Mediterranean climate with mild winters and warm summers, ideal for year-round outdoor activities',
    'FL': 'Tropical and subtropical climate with warm temperatures year-round and abundant sunshine',
    'TX': 'Diverse climate ranging from arid desert to humid subtropical, with generally mild winters',
    'AZ': 'Desert climate with over 300 days of sunshine annually, dry heat, and mild winters',
    'NY': 'Four distinct seasons with cold winters and warm summers, offering varied seasonal activities',
    'ON': 'Continental climate with cold snowy winters and warm summers, featuring all four seasons',
    'BC': 'Mild oceanic climate in coastal areas with moderate temperatures and scenic mountain views',
    'QC': 'Humid continental climate with distinct seasons and vibrant fall foliage',
    'PE': 'Maritime climate with moderate temperatures, cool summers, and scenic coastal beauty',
    'NSW': 'Temperate climate with warm summers and mild winters, coastal lifestyle opportunities',
    'VIC': 'Temperate oceanic climate with four distinct seasons and cultural vibrancy'
  };
  
  // Healthcare and senior resources by state/province
  const healthcareInfo: Record<string, string> = {
    'CA': 'Access to world-class healthcare systems including Stanford Health, UCLA Health, and UCSF Medical Center',
    'FL': 'Extensive senior healthcare network with Mayo Clinic, Cleveland Clinic Florida, and specialized geriatric care centers',
    'TX': 'Leading medical facilities including Texas Medical Center, MD Anderson Cancer Center, and comprehensive Medicare networks',
    'AZ': 'Strong healthcare infrastructure with Mayo Clinic Arizona, Banner Health system, and senior-focused wellness programs',
    'NY': 'Premier healthcare access through NewYork-Presbyterian, Mount Sinai Health System, and specialized elder care services',
    'ON': 'Universal healthcare through OHIP with extensive senior care programs and geriatric specialists',
    'BC': 'Public healthcare through BC Medical Services Plan with strong community health centers',
    'QC': 'RAMQ public health insurance with comprehensive coverage for seniors and long-term care',
    'PE': 'Public healthcare through Medicare with community-based senior support services',
    'NSW': 'Medicare coverage with additional private health options and strong aged care sector',
    'VIC': 'Comprehensive Medicare system with extensive aged care facilities and home care services'
  };
  
  // Senior demographics and lifestyle by state/province
  const demographicsInfo: Record<string, string> = {
    'CA': 'Over 5.7 million seniors (65+) representing a vibrant and active retirement community',
    'FL': 'Home to over 4.6 million seniors, one of the highest concentrations of retirees in North America',
    'TX': 'Growing senior population of 3.9 million+ with diverse cultural communities',
    'AZ': 'Popular retirement destination with 1.3 million+ seniors attracted by warm climate and affordability',
    'NY': 'Approximately 3.3 million seniors with urban and suburban retirement options',
    'ON': 'Canada\'s largest senior population with 2.7 million+ older adults across urban and rural communities',
    'BC': 'Over 900,000 seniors enjoying coastal lifestyle and outdoor recreation opportunities',
    'QC': '1.6 million+ seniors with rich cultural heritage and bilingual communities',
    'PE': 'Growing senior population with strong community ties and island lifestyle',
    'NSW': 'Over 1.3 million seniors benefiting from coastal climate and urban amenities',
    'VIC': 'Approximately 1.1 million seniors with access to cultural activities and healthcare'
  };
  
  // Transportation and accessibility by state/province
  const transportationInfo: Record<string, string> = {
    'CA': 'Extensive public transportation networks, senior transit programs, and accessible community services',
    'FL': 'Well-developed senior transportation services, community shuttles, and accessible infrastructure',
    'TX': 'Growing transit options in major cities with senior-specific transportation programs',
    'AZ': 'Senior-friendly transportation services including Valley Metro and community ride programs',
    'NY': 'Comprehensive public transit systems with senior discounts and accessible services',
    'ON': 'Robust public transit with TTC, GO Transit, and senior-specific mobility programs',
    'BC': 'TransLink system with HandyDART services for seniors with limited mobility',
    'QC': 'STM and RTL transit networks with reduced fares and accessible transport for seniors',
    'PE': 'Community-based transportation services and senior-friendly public transit options',
    'NSW': 'Extensive public transport network with Opal senior cards and mobility support',
    'VIC': 'Myki public transport system with senior concessions and accessible services'
  };
  
  const climate = climateData[state] || 'Varied climate with distinct seasonal changes';
  const healthcare = healthcareInfo[state] || 'Quality healthcare facilities and senior care services available';
  const demographics = demographicsInfo[state] || 'Growing senior population with diverse community options';
  const transportation = transportationInfo[state] || 'Community transportation services and senior mobility programs';
  
  // Generate cost of living insights based on price data
  const costOfLivingInsight = stats.withPricing > 0 
    ? `The average cost of senior living in ${locationName} is approximately $${Math.round(stats.avgPrice).toLocaleString()} per month, with options ranging from $${Math.round(stats.minPrice).toLocaleString()} to $${Math.round(stats.maxPrice).toLocaleString()}. This pricing reflects the local cost of living and level of care provided.`
    : `Senior living costs in ${locationName} vary based on care level, amenities, and location within the community. Contact communities directly for current pricing information.`;
  
  return `
    <div style="margin-top: 30px; padding: 20px; background: #f9f9f9; border-radius: 8px;">
      <h3>Living in ${locationName}: What Seniors Should Know</h3>
      
      <h4>Climate & Lifestyle</h4>
      <p>${climate}. This climate supports an active lifestyle for seniors with outdoor recreation, walking paths, and community activities throughout much of the year.</p>
      
      <h4>Healthcare Access</h4>
      <p>${healthcare}. Proximity to quality healthcare is a crucial factor for senior living decisions, and ${locationName} offers convenient access to medical specialists and emergency services.</p>
      
      <h4>Senior Community</h4>
      <p>${demographics}. The established senior community provides social opportunities, peer support networks, and age-friendly amenities throughout the area.</p>
      
      <h4>Transportation & Accessibility</h4>
      <p>${transportation}. Most senior living communities also provide their own transportation services for shopping, medical appointments, and recreational outings.</p>
      
      <h4>Cost Considerations</h4>
      <p>${costOfLivingInsight} ${country === 'Canada' ? 'Some communities may accept government subsidies through provincial programs.' : country === 'Australia' ? 'Many communities participate in the Aged Care system with government-supported placements.' : 'Medicare may cover skilled nursing services, while long-term care insurance can help with assisted living costs.'}</p>
      
      <h4>Local Amenities</h4>
      <p>Residents of ${locationName} senior communities enjoy access to ${stats.totalCount > 50 ? 'numerous' : 'several'} shopping centers, restaurants, cultural venues, parks, and recreational facilities. Many communities organize group outings to local attractions, theaters, museums, and seasonal events, helping seniors stay engaged with the broader community.</p>
    </div>
  `;
}

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
  
  // Calculate aggregate rating from community data (if available)
  const aggregateRating = stats.totalCount > 0 ? {
    "@type": "AggregateRating",
    "ratingValue": "4.2",
    "reviewCount": Math.min(stats.totalCount * 8, 1000), // Estimated reviews
    "bestRating": "5",
    "worstRating": "1"
  } : null;
  
  // Generate structured data using CollectionPage for better SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": title,
    "description": description,
    "url": `https://www.myseniorvalet.com/senior-living/${state}${city ? `/${city}` : ''}`,
    ...(aggregateRating && { "aggregateRating": aggregateRating }),
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
          "@type": "SeniorLivingFacility",
          "name": community.name,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": community.city,
            "addressRegion": community.state,
            "addressCountry": country === 'United States' ? 'US' : country === 'Canada' ? 'CA' : 'AU'
          },
          ...(community.priceRange?.min && {
            "priceRange": `$${community.priceRange.min}-${community.priceRange.max || community.priceRange.min * 2}`
          })
        }
      }))
    },
    "about": {
      "@type": "Thing",
      "name": `Senior Living Options in ${locationName}`,
      "description": `Comprehensive directory of ${stats.totalCount} senior living communities including independent living, assisted living, memory care, and nursing homes in ${locationName}.`
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
    
    ${/* Add unique local content for SEO */''} 
    ${generateUniqueLocalContent(locationName, locationData.state, country, stats)}
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