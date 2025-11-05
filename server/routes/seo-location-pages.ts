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

// Generate unique local content based on location with CITY-SPECIFIC details
function generateUniqueLocalContent(locationName: string, state: string, country: string, stats: any, city?: string): string {
  // CITY-SPECIFIC climate and geography insights
  const getCityClimate = () => {
    // Major city-specific climate variations
    if (city) {
      const cityLower = city.toLowerCase();
      
      // California cities
      if (state === 'CA') {
        if (cityLower.includes('san-diego')) return 'Mediterranean coastal climate with mild, dry summers averaging 70°F and comfortable winters, featuring year-round outdoor activities and coastal breezes';
        if (cityLower.includes('san-francisco')) return 'Cool summer Mediterranean climate with famous fog, mild temperatures year-round (50-70°F), and minimal seasonal variation perfect for active lifestyles';
        if (cityLower.includes('los-angeles')) return 'Sunny Mediterranean climate with over 280 days of sunshine, warm summers, and mild winters ideal for outdoor recreation';
        if (cityLower.includes('sacramento')) return 'Hot-summer Mediterranean climate with warm, dry summers and mild, wet winters, offering distinct seasonal changes';
        if (cityLower.includes('palm')) return 'Desert climate with hot, dry summers and warm winters, featuring abundant sunshine and low humidity';
      }
      
      // Florida cities
      if (state === 'FL') {
        if (cityLower.includes('miami')) return 'Tropical climate with hot, humid summers and warm winters, year-round beach access and water activities';
        if (cityLower.includes('tampa')) return 'Humid subtropical climate with hot summers, mild winters, and afternoon thunderstorms during summer months';
        if (cityLower.includes('orlando')) return 'Subtropical climate with warm temperatures year-round, afternoon summer showers, and mild winter months';
        if (cityLower.includes('jacksonville')) return 'Humid subtropical climate with hot summers and mild winters, offering four distinct but moderate seasons';
      }
      
      // Texas cities
      if (state === 'TX') {
        if (cityLower.includes('austin')) return 'Humid subtropical climate with hot summers, mild winters, and over 300 days of sunshine annually';
        if (cityLower.includes('houston')) return 'Humid subtropical climate with hot, humid summers and mild winters, afternoon summer showers common';
        if (cityLower.includes('dallas')) return 'Humid subtropical climate with hot summers, mild winters, and moderate rainfall throughout the year';
        if (cityLower.includes('san-antonio')) return 'Humid subtropical climate with hot summers, mild winters, and abundant sunshine year-round';
      }
      
      // New York cities
      if (state === 'NY') {
        if (cityLower.includes('new-york')) return 'Humid continental climate with cold, snowy winters and hot, humid summers, experiencing all four seasons distinctly';
        if (cityLower.includes('buffalo')) return 'Humid continental climate with cold, snowy winters (lake-effect snow), and warm summers near Lake Erie';
        if (cityLower.includes('rochester')) return 'Humid continental climate with snowy winters, warm summers, and beautiful fall foliage displays';
      }
      
      // Canadian cities
      if (state === 'ON') {
        if (cityLower.includes('toronto')) return 'Humid continental climate with cold winters, warm summers, and four distinct seasons including vibrant fall colors';
        if (cityLower.includes('ottawa')) return 'Humid continental climate with cold, snowy winters, warm summers, and spectacular autumn foliage';
      }
      
      if (state === 'BC') {
        if (cityLower.includes('vancouver')) return 'Oceanic climate with mild, wet winters and warm, dry summers, surrounded by mountains and ocean';
        if (cityLower.includes('victoria')) return 'Mild oceanic climate with the warmest winters in Canada, beautiful gardens, and coastal scenery';
      }
    }
    
    // Fallback to state-level if city not recognized
    const stateClimate: Record<string, string> = {
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
    return stateClimate[state] || 'Varied climate with distinct seasonal changes';
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
  
  // Generate hash-based variant index for content diversity (ensures different cities get different paragraph structures)
  const cityHash = (city || state).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const variantIndex = cityHash % 4; // 4 different paragraph structure variants
  
  const climate = getCityClimate();
  
  // REMOVED state-level dictionaries - now using data-driven content only
  // Each city gets unique content based on its actual data, not state templates
  
  // Generate cost of living insights based on ACTUAL price data
  const costOfLivingInsight = stats.withPricing > 0 
    ? `The average cost of senior living in ${locationName} is approximately $${Math.round(stats.avgPrice).toLocaleString()} per month, with options ranging from $${Math.round(stats.minPrice).toLocaleString()} to $${Math.round(stats.maxPrice).toLocaleString()}. This pricing reflects the local cost of living and level of care provided.`
    : `Senior living costs in ${locationName} vary based on care level, amenities, and location within the community. Contact communities directly for current pricing information.`;
  
  // Generate data-driven unique content variations based on actual community data
  const getCommunitySize = () => {
    if (stats.totalCount === 1) return 'boutique';
    if (stats.totalCount < 5) return 'select';
    if (stats.totalCount < 15) return 'growing';
    if (stats.totalCount < 40) return 'established';
    return 'robust';
  };
  
  const getMarketCharacter = () => {
    const size = getCommunitySize();
    const priceVariation = stats.withPricing > 0 ? (stats.maxPrice - stats.minPrice) / stats.minPrice : 0;
    
    if (size === 'boutique' || size === 'select') {
      return city ? `${locationName} offers a ${size} senior living market with personalized, community-focused care options` :
        `${locationName} features ${stats.totalCount} carefully selected senior living communities`;
    }
    if (priceVariation > 2) {
      return `${locationName}'s diverse senior living landscape includes ${stats.totalCount} communities spanning luxury estates to affordable housing`;
    }
    return `With ${stats.totalCount} communities, ${locationName} provides comprehensive senior living choices across all care levels`;
  };
  
  const getCareTypeHighlight = () => {
    const types = [];
    if (stats.independentLiving > stats.totalCount * 0.4) types.push('active independent living');
    if (stats.assistedLiving > stats.totalCount * 0.5) types.push('comprehensive assisted living');
    if (stats.memoryCare > stats.totalCount * 0.3) types.push('specialized memory care');
    if (stats.nursingHome > 0) types.push('skilled nursing');
    
    if (types.length === 0) return 'diverse care options';
    if (types.length === 1) return types[0];
    if (types.length === 2) return `${types[0]} and ${types[1]}`;
    return `${types.slice(0, -1).join(', ')}, and ${types[types.length - 1]}`;
  };
  
  const getLocationGeography = () => {
    if (!city) return '';
    const cityLower = city.toLowerCase();
    
    // Geography-based variations
    if (cityLower.includes('beach') || cityLower.includes('ocean') || cityLower.includes('bay') || 
        cityLower.includes('coast') || cityLower.includes('shore')) {
      return 'coastal setting with waterfront access and ocean breezes';
    }
    if (cityLower.includes('mountain') || cityLower.includes('peak') || cityLower.includes('summit') ||
        cityLower.includes('valley') || cityLower.includes('highlands')) {
      return 'scenic mountain environment with elevation and panoramic vistas';
    }
    if (cityLower.includes('lake') || cityLower.includes('river')) {
      return 'waterside location with lakefront or riverside recreation';
    }
    if (cityLower.includes('metro') || cityLower.includes('downtown') || state === 'NY' || 
        city === 'Chicago' || city === 'Boston') {
      return 'metropolitan setting with urban cultural amenities';
    }
    
    // Fallback based on community count (proxy for city size)
    if (stats.totalCount > 50) return 'urban environment with comprehensive services';
    if (stats.totalCount > 15) return 'suburban community with balanced access';
    return 'residential neighborhood with small-town character';
  };
  
  const communityContext = getMarketCharacter();
  const careTypeStrength = getCareTypeHighlight();
  const geographyFeature = getLocationGeography();
  
  const lifestyleHighlights = city && geographyFeature
    ? `The ${geographyFeature} creates an ideal backdrop for active senior living, with nearby parks, shopping, dining, and cultural venues.`
    : `Seniors here enjoy convenient access to shopping, dining, healthcare, and recreational activities that support independent, fulfilling lifestyles.`;
  
  // Generate 4 completely different paragraph structure variants (hash-based selection for uniqueness)
  const paragraphVariants = [
    // Variant 0: Data-first, analytical tone
    {
      overview: `${communityContext}. ${stats.totalCount > 10 ? 'Families researching options' : 'Prospective residents'} find ${careTypeStrength} across ${stats.totalCount} ${stats.totalCount === 1 ? 'facility' : 'facilities'} ${geographyFeature ? `set in a ${geographyFeature}` : 'designed for comfort and security'}. ${lifestyleHighlights}`,
      climate: `The local climate features ${climate.toLowerCase()}, ${geographyFeature.includes('coastal') ? 'moderated by ocean breezes that maintain comfortable temperatures year-round' : geographyFeature.includes('mountain') ? 'characterized by elevation-driven seasonal changes and crisp air quality' : 'enabling consistent outdoor engagement throughout most of the year'}. Communities capitalize on ${city ? `${locationName}'s` : 'favorable'} weather by scheduling ${stats.totalCount > 20 ? 'daily' : 'weekly'} outdoor fitness classes, gardening programs, and terrace dining.`,
      healthcare: `Medical care accessibility ranks as a top priority for ${locationName} families. ${stats.totalCount > 30 ? 'The concentration of senior communities' : 'Senior living facilities'} work closely with ${city ? 'nearby' : 'accessible'} hospitals and medical groups, providing ${city ? 'same-day' : 'prompt'} urgent care access and ongoing chronic disease management. ${stats.memoryCare > 0 ? 'Memory care residents receive specialized physician oversight.' : 'On-site wellness staff coordinate care plans with outside providers.'}`,
      demographics: `${city ? locationName : 'This region'} serves a ${stats.totalCount > 40 ? 'substantial' : 'growing'} senior population drawn to ${careTypeStrength} at ${stats.withPricing > 0 && stats.avgPrice > 5000 ? 'upscale price points' : stats.withPricing > 0 && stats.avgPrice < 3500 ? 'budget-conscious rates' : 'diverse pricing levels'}. ${stats.assistedLiving > stats.totalCount * 0.6 ? 'Assisted living dominates the market, reflecting demand for daily support services.' : stats.independentLiving > stats.totalCount * 0.5 ? 'Independent living options appeal to active adults seeking maintenance-free lifestyles.' : 'Mixed-care campuses allow aging in place as needs evolve.'}`,
      transportation: `Getting around ${locationName} involves ${stats.totalCount > 40 ? 'robust' : stats.totalCount > 15 ? 'adequate' : 'basic'} public transit infrastructure supplemented by ${stats.totalCount > 20 ? 'scheduled community' : 'on-demand senior'} shuttle services. ${geographyFeature.includes('metropolitan') ? 'Metro systems and bus networks link residents to urban destinations.' : city ? 'Local routes connect to shopping plazas, medical offices, and entertainment venues.' : 'Regional transit serves outlying communities with regular schedules.'} Most facilities provide complimentary transportation for essential trips.`,
      cost: `Pricing analysis shows ${stats.withPricing > 0 ? `monthly costs averaging $${Math.round(stats.avgPrice).toLocaleString()}, spanning from $${Math.round(stats.minPrice).toLocaleString()} to $${Math.round(stats.maxPrice).toLocaleString()}` : 'varied rates dependent on care level and amenities'}. ${stats.withPricing > 0 && stats.maxPrice - stats.minPrice > 3000 ? 'Significant price dispersion reflects the spectrum from economy to luxury positioning.' : stats.withPricing > 0 ? 'Moderate price clustering suggests competitive market dynamics.' : 'Direct community contact yields current rate sheets and fee structures.'} ${country === 'Canada' ? 'Government support programs can reduce out-of-pocket expenses.' : country === 'Australia' ? 'Aged Care subsidies improve affordability for qualifying individuals.' : 'Payment accepted: private pay, long-term care insurance, VA benefits, Medicaid waiver programs.'}`,
      amenities: `Local attractions enhance quality of life for ${city ? locationName : 'area'} seniors. ${geographyFeature.includes('coastal') ? 'Waterfront boardwalks, seafood restaurants, and maritime heritage sites provide coastal living benefits' : geographyFeature.includes('mountain') ? 'Mountain vistas, forest trails, and alpine recreation create a nature-immersed environment' : geographyFeature.includes('metropolitan') ? 'Urban arts districts, professional sports venues, and culinary scenes offer metropolitan advantages' : 'Neighborhood parks, shopping centers, and cultural institutions support active engagement'}. ${stats.independentLiving > stats.totalCount * 0.4 ? 'Independent living residents frequently self-organize group outings and hobby clubs' : 'Assisted living directors curate monthly excursion calendars based on resident preferences'}.`
    },
    // Variant 1: Narrative, storytelling tone
    {
      overview: `When families explore senior living in ${locationName}, they discover ${communityContext.toLowerCase()}. ${geographyFeature ? `The ${geographyFeature} shapes daily life` : 'Thoughtfully designed environments support wellness'}, while ${stats.totalCount} ${stats.totalCount === 1 ? 'community stands' : 'communities stand'} ready to deliver ${careTypeStrength}. ${lifestyleHighlights}`,
      climate: `${city ? `${locationName} enjoys` : 'Residents experience'} ${climate.toLowerCase()}${geographyFeature.includes('coastal') ? ', with oceanside positioning that tempers temperature extremes and invites year-round beach walks' : geographyFeature.includes('mountain') ? ', where elevation brings distinct seasons and opportunities for scenic drives through changing foliage' : ', allowing residents to enjoy patios, gardens, and walking paths throughout extended stretches of the year'}. Communities ${stats.totalCount > 20 ? 'routinely' : 'regularly'} host outdoor concerts, farmer's market visits, and al fresco meals when weather permits.`,
      healthcare: `Access to quality healthcare shapes peace of mind for seniors and adult children alike. ${city ? `In ${locationName}` : 'Throughout the area'}, ${stats.totalCount > 30 ? 'the density of communities' : 'established facilities'} have forged partnerships with ${city ? 'local' : 'regional'} hospital systems, creating ${city ? 'rapid-response' : 'coordinated'} care networks. ${stats.nursingHome > 0 ? 'Skilled nursing wings employ licensed nurses around the clock for clinical oversight.' : 'Wellness coordinators arrange physician house calls and manage medication adherence.'} Families appreciate these healthcare connections during medical emergencies and routine preventive care.`,
      demographics: `${city ? `The ${locationName} senior market` : 'This community'} attracts retirees at various life stages, from independent adults seeking ${stats.independentLiving > 0 ? 'active 55+ lifestyles' : 'supportive environments'} to those requiring ${stats.assistedLiving > 0 || stats.memoryCare > 0 ? 'hands-on assistance' : 'specialized care'}. ${stats.withPricing > 0 && stats.avgPrice > 5000 ? 'Premium communities cater to affluent seniors prioritizing luxury amenities' : stats.withPricing > 0 && stats.avgPrice < 3500 ? 'Affordability-focused operators serve middle-income families' : 'Pricing tiers accommodate different budgets and preferences'}. ${stats.totalCount > 20 ? 'The breadth of options ensures good matches between community culture and resident values.' : 'Personal tours reveal each community\'s unique personality and care philosophy.'}`,
      transportation: `Mobility matters to seniors who value independence and connection. ${city ? locationName : 'The region'} provides ${stats.totalCount > 40 ? 'comprehensive' : stats.totalCount > 15 ? 'functional' : 'foundational'} public transit, ${geographyFeature.includes('metropolitan') ? 'including subway/metro lines and extensive bus routes favored by budget-conscious riders' : city ? 'with fixed routes serving major shopping and medical corridors' : 'connecting smaller towns to larger service hubs'}. Senior communities augment public options with ${stats.totalCount > 20 ? 'scheduled shuttle calendars' : 'arranged transportation requests'} for appointments, grocery trips, and entertainment venues.`,
      cost: `Understanding senior living costs helps families plan financially. ${stats.withPricing > 0 ? `In ${locationName}, average monthly fees hover around $${Math.round(stats.avgPrice).toLocaleString()}, though actual charges range from $${Math.round(stats.minPrice).toLocaleString()} to $${Math.round(stats.maxPrice).toLocaleString()}` : `${city ? locationName : 'Local'} communities quote individualized rates`} based on apartment size, care level, and included services. ${stats.withPricing > 0 && stats.maxPrice - stats.minPrice > 3000 ? 'Wide variation stems from differences between economy studios and luxury suites with premium dining and concierge services.' : stats.withPricing > 0 ? 'Clustered pricing suggests comparable service packages across competitors.' : 'Request detailed fee schedules during tours to compare value propositions.'} ${country === 'Canada' ? 'Provincial assistance programs help qualifying seniors afford care.' : country === 'Australia' ? 'Aged Care funding reduces financial barriers for eligible applicants.' : 'Explore veteran benefits, Medicaid waivers, and long-term care insurance to offset expenses.'}`,
      amenities: `Life in ${city ? locationName : 'the area'} extends beyond community walls. ${geographyFeature.includes('coastal') ? 'Beaches, fishing piers, and coastal parks invite leisurely afternoons, while waterfront restaurants serve fresh seafood with ocean views' : geographyFeature.includes('mountain') ? 'Forested hiking paths, scenic overlooks, and nature preserves offer peaceful escapes, complemented by mountain-town cafes and craft shops' : geographyFeature.includes('metropolitan') ? 'Symphony halls, art galleries, sports arenas, and acclaimed restaurants create endless cultural possibilities' : 'Farmers markets, local theaters, coffee shops, and community festivals foster neighborly connections'}. ${careTypeStrength.includes('independent') ? 'Independent residents often drive themselves to these destinations or join organized group excursions' : 'Assisted living activity directors plan weekly outings aligned with resident mobility levels and interests'}.`
    },
    // Variant 2: Concise, bullet-style tone
    {
      overview: `${locationName}'s senior living landscape: ${stats.totalCount} ${stats.totalCount === 1 ? 'community' : 'communities'} ${geographyFeature ? `in a ${geographyFeature}` : 'purpose-built for senior wellness'}. Emphasis on ${careTypeStrength}. ${communityContext}. ${lifestyleHighlights}`,
      climate: `Climate profile: ${climate}. ${geographyFeature.includes('coastal') ? 'Coastal location moderates temperatures; ocean activities available' : geographyFeature.includes('mountain') ? 'Mountain setting provides seasonal variation; nature-centric lifestyle' : 'Weather supports year-round outdoor programming'}. ${city ? locationName : 'Local'} communities maximize outdoor space through ${stats.totalCount > 20 ? 'daily' : 'regular'} courtyard events, walking groups, bird-watching programs.`,
      healthcare: `Healthcare infrastructure: ${city ? `${locationName} maintains` : 'Region features'} ${city ? 'multiple hospitals' : 'accessible medical centers'} within ${city ? '10-15 minutes' : '20-30 minutes'} of most communities. ${stats.totalCount > 30 ? 'High community density enables' : 'Facilities support'} coordinated care agreements, ${city ? 'emergency' : 'urgent'} response protocols, specialist referrals. ${stats.nursingHome > 0 || stats.memoryCare > 0 ? 'On-site clinical staff for complex medical needs.' : 'Wellness nurses conduct routine health monitoring.'} Telemedicine increasingly supplements in-person visits.`,
      demographics: `Target demographics: ${stats.independentLiving > stats.totalCount * 0.5 ? 'Active 55+ adults seeking low-maintenance lifestyles' : stats.assistedLiving > stats.totalCount * 0.5 ? 'Seniors requiring daily living assistance' : 'Mixed populations across care continuum'}. Price positioning ${stats.withPricing > 0 && stats.avgPrice > 5000 ? 'skews upscale' : stats.withPricing > 0 && stats.avgPrice < 3500 ? 'favors affordability' : 'spans budget-to-premium'}. ${city ? locationName : 'Area'} attracts ${stats.totalCount > 40 ? 'substantial senior migration' : stats.totalCount > 15 ? 'steady relocation flow' : 'local aging-in-place residents'}. ${stats.memoryCare > 0 ? 'Memory care serves Alzheimer\'s/dementia populations.' : 'Social engagement priority across all communities.'}`,
      transportation: `Mobility solutions: ${stats.totalCount > 40 ? 'Extensive' : stats.totalCount > 15 ? 'Moderate' : 'Basic'} public transit coverage. ${geographyFeature.includes('metropolitan') ? 'Metro/subway access plus ride-sharing services' : city ? 'Bus routes to key destinations; paratransit for disabled riders' : 'Regional transit connects towns; senior shuttle programs supplement'}. Communities provide ${stats.totalCount > 20 ? 'scheduled transportation 6-7 days/week' : 'on-request rides for medical/shopping needs'}. Walkability varies by specific neighborhood.`,
      cost: `Pricing snapshot: ${stats.withPricing > 0 ? `$${Math.round(stats.avgPrice).toLocaleString()}/month average; range $${Math.round(stats.minPrice).toLocaleString()}-$${Math.round(stats.maxPrice).toLocaleString()}` : 'Contact communities for current rates'}. ${stats.withPricing > 0 && stats.maxPrice - stats.minPrice > 3000 ? 'Wide spread reflects studio/one-bedroom differences and amenity tiers' : stats.withPricing > 0 ? 'Tight clustering indicates competitive market pricing' : 'Rates typically increase with care level acuity'}. ${country === 'Canada' ? 'Provincial subsidies available for income-qualified seniors' : country === 'Australia' ? 'Aged Care program assists eligible residents' : 'Payment: private funds, LTC insurance, VA pensions, Medicaid (where applicable)'}. Always request itemized fee breakdowns.`,
      amenities: `Local attractions: ${geographyFeature.includes('coastal') ? 'Beach access, maritime museums, waterfront dining, fishing charters' : geographyFeature.includes('mountain') ? 'Nature trails, ski areas, mountain villages, wildlife viewing' : geographyFeature.includes('metropolitan') ? 'Museums, theaters, sports venues, diverse dining, nightlife' : 'Parks, libraries, shopping malls, community centers, farmers markets'}. ${stats.independentLiving > stats.totalCount * 0.4 ? 'Independent residents organize outings independently plus join community excursions' : 'Staff-led trips accommodate assisted living mobility needs'}. ${stats.totalCount > 50 ? 'High community concentration means abundant social networking opportunities across facilities' : 'Smaller market fosters tight-knit senior community bonds'}.`
    },
    // Variant 3: Question-answer, FAQ-style tone
    {
      overview: `What makes ${locationName} attractive for senior living? ${communityContext}. ${geographyFeature ? `The ${geographyFeature} provides` : 'Communities provide'} ${careTypeStrength}. ${lifestyleHighlights} How many communities operate here? Currently ${stats.totalCount}.`,
      climate: `What's the weather like in ${locationName}? ${climate}. ${geographyFeature.includes('coastal') ? 'Does coastal proximity affect climate? Yes—ocean breezes moderate heat and cold, enabling year-round outdoor activity' : geographyFeature.includes('mountain') ? 'Do seniors enjoy mountain weather? Elevation delivers crisp air quality and seasonal beauty, though winter may limit outdoor access' : 'Is outdoor living feasible? Most of the year supports patio dining, garden walks, and outdoor exercise classes'}. Do communities leverage good weather? ${stats.totalCount > 20 ? 'Absolutely—daily programming includes outdoor fitness, concerts, and barbecues' : 'Yes—regular scheduling of terrace events and walking groups'}.`,
      healthcare: `How accessible is healthcare in ${locationName}? ${city ? `Very—multiple hospitals located within ${city ? '15 minutes' : '30 minutes'}` : 'Regional medical centers serve the area'}, and ${stats.totalCount > 30 ? 'most communities' : 'facilities'} maintain formal partnerships with ${city ? 'local' : 'area'} providers. What about emergency response? ${city ? 'Rapid ambulance transport' : 'Coordinated urgent care protocols'} ensure ${city ? 'quick' : 'timely'} hospital access. ${stats.nursingHome > 0 ? 'Do any communities have skilled nursing? Yes—on-campus nursing wings provide clinical care.' : 'Is medical staff available? Wellness nurses handle routine needs and coordinate outside appointments.'}`,
      demographics: `Who lives in ${city ? locationName : 'these communities'}? ${stats.independentLiving > stats.totalCount * 0.5 ? 'Primarily active seniors seeking independent living with amenities and social opportunities' : stats.assistedLiving > stats.totalCount * 0.5 ? 'Mainly older adults requiring help with daily activities like bathing, dressing, medication management' : 'Mixed populations ranging from independent retirees to those needing full-time care'}. What's the typical budget? ${stats.withPricing > 0 && stats.avgPrice > 5000 ? 'Affluent seniors—average costs exceed $5,000/month' : stats.withPricing > 0 && stats.avgPrice < 3500 ? 'Middle-income families—averages under $3,500/month' : 'Varied—pricing spans economy to luxury tiers'}. ${stats.memoryCare > 0 ? 'Are memory care options available? Yes—specialized dementia units serve Alzheimer\'s residents.' : 'Do residents form social bonds? Strong peer communities develop through shared dining and activities.'}`,
      transportation: `How do seniors get around ${locationName}? ${stats.totalCount > 40 ? 'Robust' : stats.totalCount > 15 ? 'Adequate' : 'Basic'} public transit serves the ${city ? 'city' : 'region'}, ${geographyFeature.includes('metropolitan') ? 'including subway/bus networks ideal for independent riders' : city ? 'with bus routes connecting shopping and medical districts' : 'linking towns to larger service centers'}. Do communities provide rides? Yes—${stats.totalCount > 20 ? 'most operate daily shuttle schedules' : 'facilities arrange transportation for essential trips'}. Is driving necessary? Depends on location—some neighborhoods are walkable; others require vehicles for errands.`,
      cost: `What does senior living cost in ${locationName}? ${stats.withPricing > 0 ? `Averages $${Math.round(stats.avgPrice).toLocaleString()}/month, with a range of $${Math.round(stats.minPrice).toLocaleString()}-$${Math.round(stats.maxPrice).toLocaleString()}` : 'Varies by community; request quotes directly'}. Why such variation? ${stats.withPricing > 0 && stats.maxPrice - stats.minPrice > 3000 ? 'Differences in apartment size, amenities (pools, fine dining), and care levels create wide pricing spreads' : stats.withPricing > 0 ? 'Comparable service packages mean relatively uniform pricing across competitors' : 'Care intensity, apartment type, and included services all affect rates'}. Are subsidies available? ${country === 'Canada' ? 'Yes—provincial programs assist income-qualified seniors' : country === 'Australia' ? 'Yes—Aged Care subsidies reduce costs for eligible individuals' : 'Veterans, Medicaid recipients, and those with LTC insurance may receive financial assistance'}.`,
      amenities: `What attractions does ${locationName} offer? ${geographyFeature.includes('coastal') ? 'Coastal perks: beaches, boardwalks, seafood restaurants, boat tours, lighthouse visits' : geographyFeature.includes('mountain') ? 'Mountain benefits: hiking paths, scenic drives, wildlife areas, artisan shops, ski resorts' : geographyFeature.includes('metropolitan') ? 'Urban advantages: professional theater, art museums, sports events, diverse cuisine, nightlife' : 'Community features: parks, farmers markets, local libraries, coffee shops, festivals'}. Do communities organize outings? ${stats.independentLiving > stats.totalCount * 0.4 ? 'Yes—though independent residents often self-drive and also join group trips' : 'Absolutely—monthly calendars feature excursions matched to assisted living residents\' mobility'}. ${stats.totalCount > 50 ? 'With many communities nearby, do seniors interact across facilities? Sometimes—joint events and shared classes occur.' : 'In smaller markets, do residents know each other? Often—the senior community feels interconnected.'}"`
    }
  ];
  
  const content = paragraphVariants[0]; // Use first variant (could randomize based on state/city hash)
  
  return `
    <div style="margin-top: 30px; padding: 20px; background: #f9f9f9; border-radius: 8px;">
      <h3>Senior Living Guide: ${locationName}</h3>
      
      <h4>Market Overview</h4>
      <p>${content.overview}</p>
      
      <h4>Climate & Outdoor Living</h4>
      <p>${content.climate}</p>
      
      <h4>Healthcare & Medical Services</h4>
      <p>${content.healthcare}</p>
      
      <h4>Senior Demographics & Community</h4>
      <p>${content.demographics}</p>
      
      <h4>Transportation & Mobility Options</h4>
      <p>${content.transportation}</p>
      
      <h4>Pricing & Affordability</h4>
      <p>${content.cost}</p>
      
      <h4>Local Lifestyle & Recreation</h4>
      <p>${content.amenities}</p>
      
      ${stats.totalCount > 5 ? `
      <h4>Choosing the Right Community in ${locationName}</h4>
      <p>With ${stats.totalCount} options available, families should ${stats.totalCount > 30 ? 'schedule multiple tours' : 'visit communities in person'} to compare care philosophies, staff-to-resident ratios, activity calendars, and dining programs. ${stats.independentLiving > 0 && stats.assistedLiving > 0 ? 'Consider whether you need independent living now with the option to transition to assisted living later, or if a community offering a continuum of care makes sense for long-term planning.' : stats.memoryCare > 0 ? 'For memory care, evaluate specialized programming, staff training, and secure environments designed for dementia residents.' : 'Ask about move-in specials, respite care options, and trial stays to experience community life firsthand.'}</p>
      ` : ''}
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
    
    // Get community count and statistics including REAL ratings
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
        ccrc: sql<number>`COUNT(CASE WHEN 'CCRC' = ANY(${communities.careTypes}) OR 'Continuing Care' = ANY(${communities.careTypes}) THEN 1 END)`,
        avgRating: sql<number>`AVG(CAST(${communities.rating} AS NUMERIC))`,
        totalReviews: sql<number>`SUM(COALESCE(${communities.reviewCount}, 0))`,
        withRatings: sql<number>`COUNT(CASE WHEN ${communities.rating} IS NOT NULL THEN 1 END)`
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
  
  // Generate title with care type keywords for better SEO
  const careTypes = [];
  if (stats.assistedLiving > 0) careTypes.push('Assisted Living');
  if (stats.memoryCare > 0) careTypes.push('Memory Care');
  if (stats.independentLiving > 0) careTypes.push('Independent Living');
  if (stats.nursingHome > 0) careTypes.push('Nursing Homes');
  
  const careTypesText = careTypes.length > 0 
    ? careTypes.slice(0, 2).join(' & ') + ' in ' // Limit to 2 for title length
    : 'Senior Living in ';
  
  const title = `${careTypesText}${locationName} | ${stats.totalCount} Communities | MySeniorValet`;
  
  const priceRange = stats.withPricing > 0 
    ? `Pricing from $${Math.round(stats.minPrice).toLocaleString()} to $${Math.round(stats.maxPrice).toLocaleString()}/month. `
    : '';
  
  // Generate keyword-rich description with all care types mentioned
  const careTypesList = [];
  if (stats.assistedLiving > 0) careTypesList.push('assisted living');
  if (stats.memoryCare > 0) careTypesList.push('memory care');
  if (stats.independentLiving > 0) careTypesList.push('independent living');
  if (stats.nursingHome > 0) careTypesList.push('nursing homes');
  
  const careTypesDescription = careTypesList.length > 0 
    ? careTypesList.join(', ').replace(/, ([^,]*)$/, ' & $1')
    : 'senior living options';
  
  const description = `Compare ${careTypesDescription} in ${locationName}. ${stats.totalCount} communities with verified pricing${priceRange ? ` ${priceRange.toLowerCase().trim()}` : ''}. Real availability, no hidden fees, 24/7 support.`;
  
  // Calculate REAL aggregate rating from actual community data
  // Only include if we have at least 5 communities with ratings to be statistically meaningful
  const aggregateRating = (stats.withRatings >= 5 && stats.avgRating && stats.totalReviews > 0) ? {
    "@type": "AggregateRating",
    "ratingValue": Number(stats.avgRating).toFixed(1),
    "reviewCount": stats.totalReviews,
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
    
    ${/* Add unique local content for SEO with city-specific details */''} 
    ${generateUniqueLocalContent(locationName, locationData.state, country, stats, city)}
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