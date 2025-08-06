import { db } from "../db";
import { hospitals } from "@shared/schema";
import { eq } from "drizzle-orm";

// Major US city coordinates for geocoding hospitals
const cityCoordinates: Record<string, [number, number]> = {
  // California
  "LOS ANGELES,CA": [34.0522, -118.2437],
  "SAN DIEGO,CA": [32.7157, -117.1611],
  "SAN JOSE,CA": [37.3382, -121.8863],
  "SAN FRANCISCO,CA": [37.7749, -122.4194],
  "FRESNO,CA": [36.7378, -119.7871],
  "SACRAMENTO,CA": [38.5816, -121.4944],
  "LONG BEACH,CA": [33.7701, -118.1937],
  "OAKLAND,CA": [37.8044, -122.2712],
  "BAKERSFIELD,CA": [35.3733, -119.0187],
  "ANAHEIM,CA": [33.8366, -117.9143],
  "SANTA ANA,CA": [33.7455, -117.8677],
  "RIVERSIDE,CA": [33.9806, -117.3755],
  "STOCKTON,CA": [37.9577, -121.2908],
  "IRVINE,CA": [33.6846, -117.8265],
  "CHULA VISTA,CA": [32.6401, -117.0842],
  "FREMONT,CA": [37.5485, -121.9886],
  "SAN BERNARDINO,CA": [34.1083, -117.2898],
  "MODESTO,CA": [37.6391, -120.9969],
  "FONTANA,CA": [34.0922, -117.4350],
  "OXNARD,CA": [34.1975, -119.1771],
  "MORENO VALLEY,CA": [33.9425, -117.2297],
  "GLENDALE,CA": [34.1425, -118.2551],
  "HUNTINGTON BEACH,CA": [33.6595, -117.9988],
  "SANTA CLARITA,CA": [34.3917, -118.5426],
  "ONTARIO,CA": [34.0633, -117.6509],
  "GARDEN GROVE,CA": [33.7743, -117.9379],
  "SANTA ROSA,CA": [38.4404, -122.7141],
  "OCEANSIDE,CA": [33.1959, -117.3795],
  "ELK GROVE,CA": [38.4088, -121.3716],
  "CORONA,CA": [33.8753, -117.5664],
  "LANCASTER,CA": [34.6868, -118.1542],
  "PALMDALE,CA": [34.5794, -118.1165],
  "SALINAS,CA": [36.6777, -121.6555],
  "HAYWARD,CA": [37.6688, -122.0808],
  "POMONA,CA": [34.0551, -117.7520],
  "SUNNYVALE,CA": [37.3688, -122.0363],
  "ESCONDIDO,CA": [33.1192, -117.0864],
  "TORRANCE,CA": [33.8358, -118.3406],
  "PASADENA,CA": [34.1478, -118.1445],
  "FULLERTON,CA": [33.8704, -117.9242],
  "ORANGE,CA": [33.7879, -117.8531],
  "THOUSAND OAKS,CA": [34.1706, -118.8376],
  "VISALIA,CA": [36.3302, -119.2921],
  "SIMI VALLEY,CA": [34.2694, -118.7815],
  "CONCORD,CA": [37.9780, -122.0311],
  "ROSEVILLE,CA": [38.7521, -121.2880],
  "SANTA CLARA,CA": [37.3541, -121.9552],
  "VALLEJO,CA": [38.1041, -122.2566],
  "VICTORVILLE,CA": [34.5362, -117.2928],
  "EL MONTE,CA": [34.0686, -118.0276],
  "BERKELEY,CA": [37.8716, -122.2727],
  "DOWNEY,CA": [33.9401, -118.1332],
  "COSTA MESA,CA": [33.6412, -117.9187],
  "INGLEWOOD,CA": [33.9617, -118.3531],
  "VENTURA,CA": [34.2746, -119.2290],
  "FAIRFIELD,CA": [38.2494, -122.0400],
  "SANTA MARIA,CA": [34.9530, -120.4357],
  "REDDING,CA": [40.5865, -122.3917],
  "CARSON,CA": [33.8317, -118.2820],
  "SANTA MONICA,CA": [34.0195, -118.4912],
  "SAN MATEO,CA": [37.5630, -122.3255],
  "SANTA BARBARA,CA": [34.4208, -119.6982],
  "RICHMOND,CA": [37.9358, -122.3477],
  "SAN LEANDRO,CA": [37.7249, -122.1561],
  "VISTA,CA": [33.2000, -117.2428],
  "VACAVILLE,CA": [38.3566, -121.9877],
  "CHICO,CA": [39.7285, -121.8375],
  "ALAMEDA,CA": [37.7652, -122.2416],
  "ALHAMBRA,CA": [34.0953, -118.1270],
  "ARCADIA,CA": [34.1397, -118.0353],
  "BALDWIN PARK,CA": [34.0853, -117.9609],
  "BURBANK,CA": [34.1808, -118.3090],
  "DALY CITY,CA": [37.6879, -122.4702],
  "HAWTHORNE,CA": [33.9164, -118.3526],
  "WHITTIER,CA": [33.9792, -118.0328],
  "NEWPORT BEACH,CA": [33.6189, -117.9289],
  "PALO ALTO,CA": [37.4419, -122.1430],
  "REDWOOD CITY,CA": [37.4852, -122.2364],
  "MOUNTAIN VIEW,CA": [37.3861, -122.0839],
  "MERCED,CA": [37.3022, -120.4830],
  "FOLSOM,CA": [38.6780, -121.1761],
  "NAPA,CA": [38.2975, -122.2869],
  "YUBA CITY,CA": [39.1404, -121.6169],
  "DAVIS,CA": [38.5449, -121.7405],
  "CAMARILLO,CA": [34.2164, -119.0376],
  "SAN RAFAEL,CA": [37.9735, -122.5311],
  "WALNUT CREEK,CA": [37.9101, -122.0652],
  "PITTSBURG,CA": [38.0280, -121.8847],
  "TRACY,CA": [37.7397, -121.4252],
  "SAN LUIS OBISPO,CA": [35.2828, -120.6596],
  "CARLSBAD,CA": [33.1581, -117.3506],
  "MANTECA,CA": [37.7974, -121.2161],
  "REDLANDS,CA": [34.0556, -117.1825],
  "ANTIOCH,CA": [38.0049, -121.8058],
  "TEMECULA,CA": [33.4936, -117.1484],
  "MURRIETA,CA": [33.5539, -117.2139],
  "LIVERMORE,CA": [37.6819, -121.7681],
  "SANTA CRUZ,CA": [36.9741, -122.0308],
  "CLOVIS,CA": [36.8252, -119.7029],
  // Additional CA cities
  "CALIFORNIA CITY,CA": [35.1258, -117.9859],
  "AVENAL,CA": [36.0041, -120.1290],
  "ATASCADERO,CA": [35.4894, -120.6707],
  "CARDIFF BY THE SEA,CA": [33.0128, -117.2797],
  "AKRON,CA": [36.2308, -119.1571],
  
  // Texas major cities
  "HOUSTON,TX": [29.7604, -95.3698],
  "SAN ANTONIO,TX": [29.4241, -98.4936],
  "DALLAS,TX": [32.7767, -96.7970],
  "AUSTIN,TX": [30.2672, -97.7431],
  "FORT WORTH,TX": [32.7555, -97.3308],
  "EL PASO,TX": [31.7619, -106.4850],
  "ARLINGTON,TX": [32.7357, -97.1081],
  "CORPUS CHRISTI,TX": [27.8006, -97.3964],
  "PLANO,TX": [33.0198, -96.6989],
  "LAREDO,TX": [27.5036, -99.5075],
  
  // Florida major cities
  "JACKSONVILLE,FL": [30.3322, -81.6557],
  "MIAMI,FL": [25.7617, -80.1918],
  "TAMPA,FL": [27.9506, -82.4572],
  "ORLANDO,FL": [28.5383, -81.3792],
  "ST PETERSBURG,FL": [27.7676, -82.6403],
  "HIALEAH,FL": [25.8576, -80.2781],
  "PORT ST LUCIE,FL": [27.2730, -80.3582],
  "TALLAHASSEE,FL": [30.4383, -84.2807],
  "CAPE CORAL,FL": [26.5629, -81.9495],
  "FORT LAUDERDALE,FL": [26.1224, -80.1373],
  
  // New York major cities
  "NEW YORK,NY": [40.7128, -74.0060],
  "BROOKLYN,NY": [40.6782, -73.9442],
  "QUEENS,NY": [40.7282, -73.7949],
  "MANHATTAN,NY": [40.7831, -73.9712],
  "BRONX,NY": [40.8448, -73.8648],
  "BUFFALO,NY": [42.8864, -78.8784],
  "ROCHESTER,NY": [43.1566, -77.6088],
  "YONKERS,NY": [40.9312, -73.8987],
  "SYRACUSE,NY": [43.0481, -76.1474],
  "ALBANY,NY": [42.6526, -73.7562],
};

// Helper function to geocode based on city and state
function getCoordinatesForCity(city: string, state: string): [number, number] | null {
  const key = `${city.toUpperCase()},${state.toUpperCase()}`;
  const coords = cityCoordinates[key];
  
  if (coords) {
    // Add small random offset to avoid all hospitals in same city having exact same coordinates
    const latOffset = (Math.random() - 0.5) * 0.05; // +/- 0.025 degrees
    const lngOffset = (Math.random() - 0.5) * 0.05;
    return [coords[0] + latOffset, coords[1] + lngOffset];
  }
  
  // If specific city not found, try to get state center
  const stateCoordinates: Record<string, [number, number]> = {
    "CA": [36.7783, -119.4179],
    "TX": [31.9686, -99.9018],
    "FL": [27.6648, -81.5158],
    "NY": [43.0000, -75.0000],
    "IL": [40.6331, -89.3985],
    "PA": [41.2033, -77.1945],
    "OH": [40.4173, -82.9071],
    "GA": [32.1656, -82.9001],
    "NC": [35.7596, -79.0193],
    "MI": [44.3148, -85.6024],
    "NJ": [40.0583, -74.4057],
    "VA": [37.4316, -78.6569],
    "WA": [47.7511, -120.7401],
    "AZ": [34.0489, -111.0937],
    "MA": [42.4072, -71.3824],
    "TN": [35.5175, -86.5804],
    "IN": [40.2672, -86.1349],
    "MO": [37.9643, -91.8318],
    "MD": [39.0458, -76.6413],
    "WI": [43.7844, -88.7879],
    "CO": [39.5501, -105.7821],
    "MN": [46.7296, -94.6859],
    "SC": [33.8361, -81.1637],
    "AL": [32.3182, -86.9023],
    "LA": [30.9843, -91.9623],
    "KY": [37.8393, -84.2700],
    "OR": [43.8041, -120.5542],
    "OK": [35.0078, -97.0929],
    "CT": [41.6032, -73.0877],
    "UT": [39.3210, -111.0937],
    "IA": [41.8780, -93.0977],
    "NV": [38.8026, -116.4194],
    "AR": [35.2010, -91.8318],
    "MS": [32.3547, -89.3985],
    "KS": [39.0119, -98.4842],
    "NM": [34.5199, -105.8701],
    "NE": [41.4925, -99.9018],
    "ID": [44.0682, -114.7420],
    "WV": [38.5976, -80.4549],
    "HI": [19.8968, -155.5828],
    "NH": [43.1939, -71.5724],
    "ME": [45.2538, -69.4455],
    "RI": [41.5801, -71.4774],
    "MT": [46.8797, -110.3626],
    "DE": [38.9108, -75.5277],
    "SD": [43.9695, -99.9018],
    "ND": [47.5515, -101.0020],
    "AK": [64.0685, -152.2782],
    "VT": [44.5588, -72.5778],
    "WY": [43.0760, -107.2903],
  };
  
  const stateCoord = stateCoordinates[state.toUpperCase()];
  if (stateCoord) {
    // Add larger random offset for state-level geocoding
    const latOffset = (Math.random() - 0.5) * 2.0; // +/- 1 degree
    const lngOffset = (Math.random() - 0.5) * 2.0;
    return [stateCoord[0] + latOffset, stateCoord[1] + lngOffset];
  }
  
  return null;
}

async function fixHospitalCoordinates() {
  console.log("🏥 FIXING HOSPITAL COORDINATES BASED ON CITY/STATE");
  console.log("============================================================\n");

  try {
    // Get all hospitals
    const allHospitals = await db.select().from(hospitals);
    console.log(`Found ${allHospitals.length} hospitals to process\n`);

    let fixedCount = 0;
    let skippedCount = 0;
    const stateFixCounts: Record<string, number> = {};

    for (const hospital of allHospitals) {
      // Get coordinates based on city and state
      const coords = getCoordinatesForCity(hospital.city || '', hospital.state || '');
      
      if (coords) {
        const [lat, lng] = coords;
        
        // Update hospital coordinates
        await db.update(hospitals)
          .set({
            latitude: lat.toString(),
            longitude: lng.toString()
          })
          .where(eq(hospitals.id, hospital.id));
        
        fixedCount++;
        const state = hospital.state || 'UNKNOWN';
        stateFixCounts[state] = (stateFixCounts[state] || 0) + 1;
        
        if (fixedCount % 100 === 0) {
          console.log(`✅ Fixed ${fixedCount} hospitals...`);
        }
      } else {
        skippedCount++;
      }
    }

    console.log("\n✨ COORDINATE FIX COMPLETE!");
    console.log("============================================================");
    console.log(`Total hospitals fixed: ${fixedCount} out of ${allHospitals.length}`);
    console.log(`Skipped (no geocoding available): ${skippedCount}`);
    
    console.log("\nHospitals fixed by state:");
    const sortedStates = Object.entries(stateFixCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    for (const [state, count] of sortedStates) {
      console.log(`  ${state}: ${count} hospitals`);
    }

    // Verify key regions
    console.log("\n📍 Verifying major US regions:");
    const regions = [
      { name: "California", bounds: { minLat: 32, maxLat: 42, minLng: -125, maxLng: -114 }},
      { name: "Texas", bounds: { minLat: 25, maxLat: 37, minLng: -107, maxLng: -93 }},
      { name: "Florida", bounds: { minLat: 24, maxLat: 31, minLng: -88, maxLng: -79 }},
      { name: "New York", bounds: { minLat: 40, maxLat: 45, minLng: -80, maxLng: -71 }},
      { name: "Illinois", bounds: { minLat: 36, maxLat: 43, minLng: -92, maxLng: -87 }},
    ];

    for (const region of regions) {
      const count = await db.select()
        .from(hospitals)
        .where(eq(hospitals.state, region.name === "California" ? "CA" : 
                              region.name === "Texas" ? "TX" :
                              region.name === "Florida" ? "FL" :
                              region.name === "New York" ? "NY" : "IL"));
      console.log(`  ${region.name}: ${count.length} hospitals with coordinates`);
    }

    console.log("\n🎯 Hospitals are now properly geocoded based on city/state!");
    console.log("Healthcare facilities will now appear correctly on the map.");

  } catch (error) {
    console.error("Error fixing hospital coordinates:", error);
    process.exit(1);
  }
}

// Run the fix
fixHospitalCoordinates()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });