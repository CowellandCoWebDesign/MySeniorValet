// Comprehensive geocoding data for MySeniorValet's full US coverage area
// This file contains coordinates for all 50 states, major cities, and territories

export const US_STATES: Record<string, [number, number]> = {
  // All 50 US States with their geographic centers
  'alabama': [32.3182, -86.9023], 'al': [32.3182, -86.9023],
  'alaska': [64.2008, -149.4937], 'ak': [64.2008, -149.4937],
  'arizona': [34.0489, -111.0937], 'az': [34.0489, -111.0937],
  'arkansas': [35.2010, -91.8318], 'ar': [35.2010, -91.8318],
  'california': [36.7783, -119.4179], 'ca': [36.7783, -119.4179],
  'colorado': [39.5501, -105.7821], 'co': [39.5501, -105.7821],
  'connecticut': [41.6032, -73.0877], 'ct': [41.6032, -73.0877],
  'delaware': [38.9108, -75.5277], 'de': [38.9108, -75.5277],
  'florida': [27.6648, -81.5158], 'fl': [27.6648, -81.5158],
  'georgia': [32.1656, -82.9001], 'ga': [32.1656, -82.9001],
  'hawaii': [19.8968, -155.5828], 'hi': [19.8968, -155.5828],
  'idaho': [44.0682, -114.7420], 'id': [44.0682, -114.7420],
  'illinois': [40.6331, -89.3985], 'il': [40.6331, -89.3985],
  'indiana': [40.2672, -86.1349], 'in': [40.2672, -86.1349],
  'iowa': [41.8780, -93.0977], 'ia': [41.8780, -93.0977],
  'kansas': [39.0119, -98.4842], 'ks': [39.0119, -98.4842],
  'kentucky': [37.8393, -84.2700], 'ky': [37.8393, -84.2700],
  'louisiana': [30.9843, -91.9623], 'la': [30.9843, -91.9623],
  'maine': [45.2538, -69.4455], 'me': [45.2538, -69.4455],
  'maryland': [39.0458, -76.6413], 'md': [39.0458, -76.6413],
  'massachusetts': [42.4072, -71.3824], 'ma': [42.4072, -71.3824],
  'michigan': [44.3148, -85.6024], 'mi': [44.3148, -85.6024],
  'minnesota': [46.7296, -94.6859], 'mn': [46.7296, -94.6859],
  'mississippi': [32.3547, -89.3985], 'ms': [32.3547, -89.3985],
  'missouri': [37.9643, -91.8318], 'mo': [37.9643, -91.8318],
  'montana': [46.8797, -110.3626], 'mt': [46.8797, -110.3626],
  'nebraska': [41.4925, -99.9018], 'ne': [41.4925, -99.9018],
  'nevada': [38.8026, -116.4194], 'nv': [38.8026, -116.4194],
  'new hampshire': [43.1939, -71.5724], 'nh': [43.1939, -71.5724],
  'new jersey': [40.0583, -74.4057], 'nj': [40.0583, -74.4057],
  'new mexico': [34.5199, -105.8701], 'nm': [34.5199, -105.8701],
  'new york': [43.2994, -74.2179], 'ny': [43.2994, -74.2179],
  'north carolina': [35.7596, -79.0193], 'nc': [35.7596, -79.0193],
  'north dakota': [47.5515, -101.0020], 'nd': [47.5515, -101.0020],
  'ohio': [40.4173, -82.9071], 'oh': [40.4173, -82.9071],
  'oklahoma': [35.0078, -97.0929], 'ok': [35.0078, -97.0929],
  'oregon': [43.8041, -120.5542], 'or': [43.8041, -120.5542],
  'pennsylvania': [41.2033, -77.1945], 'pa': [41.2033, -77.1945],
  'rhode island': [41.5801, -71.4774], 'ri': [41.5801, -71.4774],
  'south carolina': [33.8361, -81.1637], 'sc': [33.8361, -81.1637],
  'south dakota': [43.9695, -99.9018], 'sd': [43.9695, -99.9018],
  'tennessee': [35.5175, -86.5804], 'tn': [35.5175, -86.5804],
  'texas': [31.9686, -99.9018], 'tx': [31.9686, -99.9018],
  'utah': [39.3210, -111.0937], 'ut': [39.3210, -111.0937],
  'vermont': [44.5588, -72.5778], 'vt': [44.5588, -72.5778],
  'virginia': [37.4316, -78.6569], 'va': [37.4316, -78.6569],
  'washington': [47.7511, -120.7401], 'wa': [47.7511, -120.7401],
  'west virginia': [38.5976, -80.4549], 'wv': [38.5976, -80.4549],
  'wisconsin': [43.7844, -88.7879], 'wi': [43.7844, -88.7879],
  'wyoming': [43.0760, -107.2903], 'wy': [43.0760, -107.2903],
  
  // US Territories
  'puerto rico': [18.2208, -66.5901], 'pr': [18.2208, -66.5901],
  
  // National
  'united states': [39.8283, -98.5795], 'usa': [39.8283, -98.5795], 'us': [39.8283, -98.5795],
};

export const US_CITIES: Record<string, [number, number]> = {
  // === CALIFORNIA CITIES ===
  'los angeles': [34.0522, -118.2437],
  'san diego': [32.7157, -117.1611],
  'san francisco': [37.7749, -122.4194],
  'san jose': [37.3382, -121.8863],
  'sacramento': [38.5816, -121.4944],
  'fresno': [36.7378, -119.7871],
  'oakland': [37.8044, -122.2712],
  'long beach': [33.7701, -118.1937],
  'bakersfield': [35.3733, -119.0187],
  'anaheim': [33.8366, -117.9143],
  'riverside': [33.9806, -117.3755],
  'stockton': [37.9577, -121.2908],
  'irvine': [33.6846, -117.8265],
  'chula vista': [32.6401, -117.0842],
  'fremont': [37.5485, -121.9886],
  'san bernardino': [34.1083, -117.2898],
  'modesto': [37.6391, -120.9969],
  'fontana': [34.0922, -117.4350],
  'santa clarita': [34.3917, -118.5426],
  'moreno valley': [33.9425, -117.2297],
  'glendale': [34.1425, -118.2551],
  'huntington beach': [33.6595, -117.9988],
  'santa rosa': [38.4404, -122.7141],
  'ontario': [34.0633, -117.6509],
  'elk grove': [38.4088, -121.3716],
  'rancho cucamonga': [34.1064, -117.5931],
  'oceanside': [33.1959, -117.3795],
  'lancaster': [34.6868, -118.1542],
  'garden grove': [33.7742, -117.9378],
  'palmdale': [34.5794, -118.1165],
  'salinas': [36.6777, -121.6555],
  'hayward': [37.6688, -122.0808],
  'corona': [33.8753, -117.5664],
  'sunnyvale': [37.3688, -122.0363],
  'lakewood': [33.8536, -118.1340],
  'pasadena': [34.1478, -118.1445],
  'pomona': [34.0551, -117.7523],
  'escondido': [33.1192, -117.0864],
  'torrance': [33.8358, -118.3406],
  'roseville': [38.7521, -121.2880],
  'fullerton': [33.8704, -117.9242],
  'visalia': [36.3302, -119.2921],
  'orange': [33.7879, -117.8531],
  'concord': [37.9780, -122.0311],
  'simi valley': [34.2694, -118.7815],
  'victorville': [34.5362, -117.2928],
  'vallejo': [38.1041, -122.2566],
  'berkeley': [37.8716, -122.2727],
  'fairfield': [38.2494, -122.0400],
  'thousand oaks': [34.1706, -118.8376],
  'carlsbad': [33.1581, -117.3506],
  'temecula': [33.4936, -117.1484],
  'antioch': [38.0049, -121.8058],
  'murrieta': [33.5539, -117.2139],
  'richmond': [37.9358, -122.3477],
  'ventura': [34.2746, -119.2290],
  'west covina': [34.0686, -117.9390],
  'norwalk': [33.9022, -118.0817],
  'daly city': [37.6879, -122.4702],
  'burbank': [34.1808, -118.3090],
  'santa maria': [34.9530, -120.4357],
  'el cajon': [32.7948, -116.9625],
  'san mateo': [37.5630, -122.3255],
  'rialto': [34.1064, -117.3703],
  'clovis': [36.8252, -119.7029],
  'red bluff': [40.1785, -122.2358],
  'redding': [40.5865, -122.3917],
  'chico': [39.7285, -121.8375],
  'yuba city': [39.1404, -121.6169],
  'grass valley': [39.2191, -121.0611],
  'placerville': [38.7296, -120.7986],
  'sonora': [37.9829, -120.3822],
  'eureka': [40.8021, -124.1637],
  'crescent city': [41.7558, -124.2026],
  'ukiah': [39.1502, -123.2078],
  'fort bragg': [39.4457, -123.8053],
  'lakeport': [39.0430, -122.9158],
  'willows': [39.5243, -122.1936],
  'oroville': [39.5138, -121.5556],
  'paradise': [39.7596, -121.6219],
  'lincoln': [38.8912, -121.2930],
  'auburn': [38.8966, -121.0769],
  'nevada city': [39.2616, -121.0161],
  'truckee': [39.3278, -120.1833],
  'south lake tahoe': [38.9332, -119.9844],
  'mammoth lakes': [37.6485, -118.9721],
  'bishop': [37.3614, -118.3951],
  'ridgecrest': [35.6225, -117.6709],
  'barstow': [34.8958, -117.0173],
  'needles': [34.8481, -114.6141],
  'blythe': [33.6103, -114.5889],
  'el centro': [32.7920, -115.5631],
  'calexico': [32.6789, -115.4989],
  'indio': [33.7206, -116.2156],
  'palm springs': [33.8303, -116.5453],
  'palm desert': [33.7222, -116.3745],
  'hemet': [33.7475, -116.9717],
  'san jacinto': [33.7839, -116.9586],
  'banning': [33.9256, -116.8764],
  'beaumont': [33.9294, -116.9770],
  'big bear lake': [34.2439, -116.9114],
  'lake arrowhead': [34.2483, -117.1892],
  'twentynine palms': [34.1356, -116.0542],
  'yucca valley': [34.1142, -116.4322],
  'joshua tree': [34.1347, -116.3131],
  'alpine': [32.8352, -116.7664],
  'santa barbara': [34.4208, -119.6982],
  'monterey': [36.6002, -121.8947],
  'carmel': [36.5552, -121.9233],
  
  // === TEXAS CITIES ===
  'houston': [29.7604, -95.3698],
  'san antonio': [29.4241, -98.4936],
  'dallas': [32.7767, -96.7970],
  'austin': [30.2672, -97.7431],
  'fort worth': [32.7555, -97.3308],
  'el paso': [31.7619, -106.4850],
  'arlington': [32.7357, -97.1081],
  'corpus christi': [27.8006, -97.3964],
  'plano': [33.0198, -96.6989],
  'lubbock': [33.5779, -101.8552],
  'amarillo': [35.2220, -101.8313],
  'mcallen': [26.2034, -98.2300],
  'waco': [31.5493, -97.1467],
  
  // === FLORIDA CITIES ===
  'miami': [25.7617, -80.1918],
  'tampa': [27.9506, -82.4572],
  'orlando': [28.5383, -81.3792],
  'jacksonville': [30.3322, -81.6557],
  'panama city': [30.1588, -85.6602],
  'tallahassee': [30.4383, -84.2807],
  'fort lauderdale': [26.1224, -80.1373],
  'st petersburg': [27.7676, -82.6403],
  'hialeah': [25.8576, -80.2781],
  'gainesville': [29.6516, -82.3248],
  'naples': [26.1420, -81.7948],
  'pensacola': [30.4213, -87.2169],
  'fort myers': [26.6406, -81.8723],
  'daytona beach': [29.2108, -81.0228],
  'sarasota': [27.3364, -82.5307],
  'west palm beach': [26.7153, -80.0534],
  
  // === NEW YORK CITIES ===
  'new york city': [40.7128, -74.0060],
  'nyc': [40.7128, -74.0060],
  'manhattan': [40.7831, -73.9712],
  'brooklyn': [40.6782, -73.9442],
  'queens': [40.7282, -73.7949],
  'bronx': [40.8448, -73.8648],
  'staten island': [40.5795, -74.1502],
  'buffalo': [42.8864, -78.8784],
  'rochester': [43.1566, -77.6088],
  'albany': [42.6526, -73.7562],
  'syracuse': [43.0481, -76.1474],
  'yonkers': [40.9312, -73.8987],
  
  // === OREGON CITIES (EXPANDED) ===
  'portland': [45.5152, -122.6784],
  'eugene': [44.0521, -123.0868],
  'salem': [44.9429, -123.0351],
  'bend': [44.0582, -121.3153],
  'medford': [42.3265, -122.8756],
  'springfield': [44.0462, -123.0220],
  'corvallis': [44.5646, -123.2620],
  'albany': [44.6365, -123.1059],
  'grants pass': [42.4390, -123.3284],
  'roseburg': [43.2165, -123.3417],
  'klamath falls': [42.2249, -121.7817],
  'coos bay': [43.3665, -124.2179],
  'the dalles': [45.5946, -121.1787],
  'pendleton': [45.6721, -118.7886],
  'baker city': [44.7749, -117.8344],
  'ontario': [44.0266, -116.9626],
  'la grande': [45.3246, -118.0879],
  'astoria': [46.1879, -123.8313],
  'newport': [44.6368, -124.0534],
  'lincoln city': [44.9581, -124.0178],
  'florence': [43.9826, -124.0998],
  'bandon': [43.1187, -124.4084], // Added Bandon, Oregon!
  'gold beach': [42.4073, -124.4218],
  'brookings': [42.0526, -124.2839],
  'reedsport': [43.7040, -124.0956],
  'tillamook': [45.4562, -123.8440],
  'seaside': [45.9932, -123.9226],
  'cannon beach': [45.8892, -123.9615],
  'manzanita': [45.7184, -123.9351],
  'waldport': [44.4268, -124.0690],
  'yachats': [44.3118, -124.1048],
  'depoe bay': [44.8084, -124.0634],
  'pacific city': [45.2021, -123.9626],
  'hood river': [45.7054, -121.5215],
  'joseph': [45.3546, -117.2296],
  'enterprise': [45.4263, -117.2788],
  'john day': [44.4160, -118.9530],
  'burns': [43.5863, -119.0541],
  'lakeview': [42.1888, -120.3458],
  'madras': [44.6334, -121.1295],
  'redmond': [44.2726, -121.1739],
  'sisters': [44.2909, -121.5492],
  'prineville': [44.2998, -120.8344],
  
  // === ILLINOIS CITIES ===
  'chicago': [41.8781, -87.6298],
  'aurora': [41.7606, -88.3201],
  'rockford': [42.2711, -89.0940],
  'joliet': [41.5250, -88.0817],
  'naperville': [41.7508, -88.1535],
  'springfield': [39.7817, -89.6501],
  'peoria': [40.6936, -89.5890],
  
  // === PENNSYLVANIA CITIES ===
  'philadelphia': [39.9526, -75.1652],
  'pittsburgh': [40.4406, -79.9959],
  'allentown': [40.6084, -75.4902],
  'erie': [42.1292, -80.0851],
  'reading': [40.3356, -75.9269],
  'scranton': [41.4089, -75.6624],
  'harrisburg': [40.2732, -76.8867],
  
  // === ARIZONA CITIES ===
  'phoenix': [33.4484, -112.0740],
  'tucson': [32.2226, -110.9747],
  'mesa': [33.4152, -111.8315],
  'chandler': [33.3062, -111.8413],
  'scottsdale': [33.4942, -111.9261],
  'glendale': [33.5387, -112.1860],
  'tempe': [33.4255, -111.9400],
  'flagstaff': [35.1983, -111.6513],
  
  // === OHIO CITIES ===
  'columbus': [39.9612, -82.9988],
  'cleveland': [41.4993, -81.6944],
  'cincinnati': [39.1031, -84.5120],
  'toledo': [41.6528, -83.5379],
  'akron': [41.0814, -81.5190],
  'dayton': [39.7589, -84.1916],
  
  // === GEORGIA CITIES ===
  'atlanta': [33.7490, -84.3880],
  'augusta': [33.4735, -82.0105],
  'columbus ga': [32.4609, -84.9878], // Disambiguate from Columbus, OH
  'savannah': [32.0809, -81.0912],
  'athens': [33.9519, -83.3576],
  
  // === NORTH CAROLINA CITIES ===
  'charlotte': [35.2271, -80.8431],
  'raleigh': [35.7796, -78.6382],
  'greensboro': [36.0726, -79.7920],
  'durham': [35.9940, -78.8986],
  'winston-salem': [36.0999, -80.2442],
  'asheville': [35.5951, -82.5515],
  
  // === MICHIGAN CITIES ===
  'detroit': [42.3314, -83.0458],
  'grand rapids': [42.9634, -85.6681],
  'warren': [42.4774, -83.0277],
  'sterling heights': [42.5803, -83.0302],
  'ann arbor': [42.2808, -83.7430],
  'lansing': [42.7325, -84.5555],
  
  // === OTHER MAJOR CITIES ===
  'seattle': [47.6062, -122.3321], // Washington
  'boston': [42.3601, -71.0589], // Massachusetts
  'denver': [39.7392, -104.9903], // Colorado
  'las vegas': [36.1699, -115.1398], // Nevada
  'portland': [45.5152, -122.6784], // Oregon
  'minneapolis': [44.9778, -93.2650], // Minnesota
  'milwaukee': [43.0389, -87.9065], // Wisconsin
  'salt lake city': [40.7608, -111.8910], // Utah
  'kansas city': [39.0997, -94.5786], // Missouri
  'st louis': [38.6270, -90.1994], // Missouri
  'new orleans': [29.9511, -90.0715], // Louisiana
  'memphis': [35.1495, -90.0490], // Tennessee
  'nashville': [36.1627, -86.7816], // Tennessee
  'louisville': [38.2527, -85.7585], // Kentucky
  'baltimore': [39.2904, -76.6122], // Maryland
  'washington dc': [38.9072, -77.0369], // DC
  'virginia beach': [36.8529, -75.9780], // Virginia
  'omaha': [41.2565, -95.9345], // Nebraska
  'tulsa': [36.1540, -95.9928], // Oklahoma
  'albuquerque': [35.0844, -106.6504], // New Mexico
  'honolulu': [21.3099, -157.8581], // Hawaii
  'anchorage': [61.2181, -149.9003], // Alaska
  
  // === PUERTO RICO CITIES ===
  'san juan': [18.4655, -66.1057],
  'bayamon': [18.3985, -66.1548],
  'carolina': [18.3813, -65.9579],
  'ponce': [18.0111, -66.6141],
  'caguas': [18.2342, -66.0308],
};

// Helper function to geocode a location
export function geocodeLocation(location: string): { lat: number; lng: number } | null {
  const normalized = location.toLowerCase().trim();
  
  // Try exact match first
  if (US_STATES[normalized]) {
    const [lat, lng] = US_STATES[normalized];
    return { lat, lng };
  }
  
  if (US_CITIES[normalized]) {
    const [lat, lng] = US_CITIES[normalized];
    return { lat, lng };
  }
  
  // Try to parse "city, state" format
  const parts = normalized.split(',').map(p => p.trim());
  if (parts.length === 2) {
    const [city, state] = parts;
    
    // Try city match
    if (US_CITIES[city]) {
      const [lat, lng] = US_CITIES[city];
      return { lat, lng };
    }
    
    // Try "city state" format (without comma)
    const cityState = `${city} ${state}`;
    if (US_CITIES[cityState]) {
      const [lat, lng] = US_CITIES[cityState];
      return { lat, lng };
    }
    
    // If city not found, return state coordinates
    if (US_STATES[state]) {
      const [lat, lng] = US_STATES[state];
      return { lat, lng };
    }
  }
  
  // Also handle "city state" format without comma (like "panama city florida")
  const words = normalized.split(' ');
  if (words.length >= 2) {
    // Try last word as state
    const possibleState = words[words.length - 1];
    const possibleCity = words.slice(0, -1).join(' ');
    
    // Check if it's a valid state
    if (US_STATES[possibleState]) {
      // Try to find the city
      if (US_CITIES[possibleCity]) {
        const [lat, lng] = US_CITIES[possibleCity];
        return { lat, lng };
      }
      // Return state coordinates if city not found
      const [lat, lng] = US_STATES[possibleState];
      return { lat, lng };
    }
  }
  
  // Try to match partial city names
  const cityKeys = Object.keys(US_CITIES);
  const partialMatch = cityKeys.find(key => 
    key.includes(normalized) || normalized.includes(key)
  );
  
  if (partialMatch) {
    const [lat, lng] = US_CITIES[partialMatch];
    return { lat, lng };
  }
  
  return null;
}

// International countries and cities
export const INTERNATIONAL_LOCATIONS: Record<string, [number, number]> = {
  // Canada
  'canada': [56.1304, -106.3468],
  'toronto': [43.6532, -79.3832], 'toronto on': [43.6532, -79.3832], 'toronto, on': [43.6532, -79.3832],
  'vancouver': [49.2827, -123.1207], 'vancouver bc': [49.2827, -123.1207], 'vancouver, bc': [49.2827, -123.1207],
  'montreal': [45.5017, -73.5673], 'montreal qc': [45.5017, -73.5673], 'montreal, qc': [45.5017, -73.5673],
  'calgary': [51.0486, -114.0708], 'calgary ab': [51.0486, -114.0708], 'calgary, ab': [51.0486, -114.0708],
  'ottawa': [45.4215, -75.6972], 'ottawa on': [45.4215, -75.6972], 'ottawa, on': [45.4215, -75.6972],
  'edmonton': [53.5461, -113.4938], 'edmonton ab': [53.5461, -113.4938], 'edmonton, ab': [53.5461, -113.4938],
  'winnipeg': [49.8951, -97.1384], 'winnipeg mb': [49.8951, -97.1384], 'winnipeg, mb': [49.8951, -97.1384],
  'quebec city': [46.8139, -71.2080], 'quebec city qc': [46.8139, -71.2080], 'quebec city, qc': [46.8139, -71.2080],
  
  // Canadian Provinces
  'ontario': [51.2538, -85.3232], 'on': [51.2538, -85.3232],
  'quebec': [52.9399, -73.5491], 'qc': [52.9399, -73.5491],
  'british columbia': [53.7267, -127.6476], 'bc': [53.7267, -127.6476],
  'alberta': [53.9333, -116.5765], 'ab': [53.9333, -116.5765],
  'manitoba': [53.7609, -98.8139], 'mb': [53.7609, -98.8139],
  'saskatchewan': [53.2033, -105.7531], 'sk': [53.2033, -105.7531],
  'nova scotia': [44.6820, -63.7443], 'ns': [44.6820, -63.7443],
  'new brunswick': [46.5653, -66.4619], 'nb': [46.5653, -66.4619],
  'newfoundland': [53.1355, -57.6604], 'nl': [53.1355, -57.6604],
  'prince edward island': [46.5107, -63.4168], 'pei': [46.5107, -63.4168],
  
  // Mexico
  'mexico': [23.6345, -102.5528],
  'mexico city': [19.4326, -99.1332], 'ciudad de mexico': [19.4326, -99.1332], 'cdmx': [19.4326, -99.1332],
  'guadalajara': [20.6597, -103.3496], 'guadalajara jal': [20.6597, -103.3496],
  'monterrey': [25.6866, -100.3161], 'monterrey nl': [25.6866, -100.3161],
  'puebla': [19.0414, -98.2063], 'puebla pue': [19.0414, -98.2063],
  'tijuana': [32.5149, -117.0382], 'tijuana bc': [32.5149, -117.0382],
  'leon': [21.1221, -101.6827], 'leon gto': [21.1221, -101.6827],
  'juarez': [31.6904, -106.4245], 'ciudad juarez': [31.6904, -106.4245],
  'zapopan': [20.7210, -103.3918], 'zapopan jal': [20.7210, -103.3918],
  
  // Europe
  'united kingdom': [55.3781, -3.4360], 'uk': [55.3781, -3.4360], 'great britain': [55.3781, -3.4360],
  'london': [51.5074, -0.1278], 'london uk': [51.5074, -0.1278],
  'france': [46.2276, 2.2137],
  'paris': [48.8566, 2.3522], 'paris france': [48.8566, 2.3522],
  'germany': [51.1657, 10.4515],
  'berlin': [52.5200, 13.4050], 'berlin germany': [52.5200, 13.4050],
  'spain': [40.4637, -3.7492],
  'madrid': [40.4168, -3.7038], 'madrid spain': [40.4168, -3.7038],
  'italy': [41.8719, 12.5674],
  'rome': [41.9028, 12.4964], 'rome italy': [41.9028, 12.4964],
  
  // Asia
  'japan': [36.2048, 138.2529],
  'tokyo': [35.6762, 139.6503], 'tokyo japan': [35.6762, 139.6503],
  'china': [35.8617, 104.1954],
  'beijing': [39.9042, 116.4074], 'beijing china': [39.9042, 116.4074],
  'india': [20.5937, 78.9629],
  'new delhi': [28.6139, 77.2090], 'delhi': [28.6139, 77.2090],
  'south korea': [35.9078, 127.7669], 'korea': [35.9078, 127.7669],
  'seoul': [37.5665, 126.9780], 'seoul korea': [37.5665, 126.9780],
  
  // Australia & Oceania
  'australia': [-25.2744, 133.7751],
  'sydney': [-33.8688, 151.2093], 'sydney australia': [-33.8688, 151.2093],
  'melbourne': [-37.8136, 144.9631], 'melbourne australia': [-37.8136, 144.9631],
  'brisbane': [-27.4698, 153.0251], 'brisbane australia': [-27.4698, 153.0251],
  'new zealand': [-40.9006, 174.8860], 'nz': [-40.9006, 174.8860],
  'auckland': [-36.8485, 174.7633], 'auckland nz': [-36.8485, 174.7633],
  
  // South America
  'brazil': [-14.2350, -51.9253],
  'sao paulo': [-23.5505, -46.6333], 'são paulo': [-23.5505, -46.6333],
  'argentina': [-38.4161, -63.6167],
  'buenos aires': [-34.6037, -58.3816],
  'chile': [-35.6751, -71.5430],
  'santiago': [-33.4489, -70.6693], 'santiago chile': [-33.4489, -70.6693],
  'colombia': [4.5709, -74.2973],
  'bogota': [4.7110, -74.0721], 'bogotá': [4.7110, -74.0721],
  
  // Africa
  'south africa': [-30.5595, 22.9375],
  'johannesburg': [-26.2041, 28.0473], 'joburg': [-26.2041, 28.0473],
  'cape town': [-33.9249, 18.4241],
  'egypt': [26.8206, 30.8025],
  'cairo': [30.0444, 31.2357], 'cairo egypt': [30.0444, 31.2357],
  'nigeria': [9.0820, 8.6753],
  'lagos': [6.5244, 3.3792], 'lagos nigeria': [6.5244, 3.3792],
  'kenya': [-0.0236, 37.9062],
  'nairobi': [-1.2921, 36.8219], 'nairobi kenya': [-1.2921, 36.8219],
};

// Enhanced geocoding function with international support
export function geocodeLocationInternational(location: string): { lat: number; lng: number } | null {
  const normalized = location.toLowerCase().trim();
  
  // First try US locations
  const usResult = geocodeLocation(location);
  if (usResult) return usResult;
  
  // Then try international locations
  if (INTERNATIONAL_LOCATIONS[normalized]) {
    const [lat, lng] = INTERNATIONAL_LOCATIONS[normalized];
    return { lat, lng };
  }
  
  // Try partial matches for international locations
  const intlKeys = Object.keys(INTERNATIONAL_LOCATIONS);
  const partialMatch = intlKeys.find(key => 
    key.includes(normalized) || normalized.includes(key)
  );
  
  if (partialMatch) {
    const [lat, lng] = INTERNATIONAL_LOCATIONS[partialMatch];
    return { lat, lng };
  }
  
  return null;
}

// Get zoom level based on location type
export function getZoomLevel(location: string): number {
  if (!location) {
    return 12; // Default city level zoom
  }
  const normalized = location.toLowerCase().trim();
  
  // Country level
  if (['united states', 'usa', 'us'].includes(normalized)) {
    return 4;
  }
  
  // State level
  if (US_STATES[normalized]) {
    return 6;
  }
  
  // City level
  return 12;
}