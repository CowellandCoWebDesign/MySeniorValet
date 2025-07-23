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
  'riverside': [33.9533, -117.3962],
  'stockton': [37.9577, -121.2908],
  'irvine': [33.6846, -117.8265],
  'santa ana': [33.7455, -117.8677],
  'redding': [40.5865, -122.3917],
  'alpine': [32.8352, -116.7664],
  'pasadena': [34.1478, -118.1445],
  'modesto': [37.6391, -120.9969],
  'santa barbara': [34.4208, -119.6982],
  'san bernardino': [34.1083, -117.2898],
  'palm springs': [33.8303, -116.5453],
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

// Get zoom level based on location type
export function getZoomLevel(location: string): number {
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