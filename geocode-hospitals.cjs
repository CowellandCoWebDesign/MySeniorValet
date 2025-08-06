const { Pool } = require('@neondatabase/serverless');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Simple geocoding using city/state coordinates (basic approximation)
const cityCoordinates = {
  // Florida cities
  'TALLAHASSEE,FL': { lat: 30.4383, lng: -84.2807 },
  'MIAMI,FL': { lat: 25.7617, lng: -80.1918 },
  'PORT ORANGE,FL': { lat: 29.1383, lng: -80.9956 },
  'PALM BEACH GARDENS,FL': { lat: 26.8234, lng: -80.1386 },
  'ORLANDO,FL': { lat: 28.5383, lng: -81.3792 },
  'TAMPA,FL': { lat: 27.9506, lng: -82.4572 },
  'JACKSONVILLE,FL': { lat: 30.3322, lng: -81.6557 },
  'FORT LAUDERDALE,FL': { lat: 26.1224, lng: -80.1373 },
  'SAINT PETERSBURG,FL': { lat: 27.7676, lng: -82.6403 },
  'CLEARWATER,FL': { lat: 27.9659, lng: -82.8001 },
  'SARASOTA,FL': { lat: 27.3364, lng: -82.5307 },
  'GAINESVILLE,FL': { lat: 29.6516, lng: -82.3248 },
  'FORT MYERS,FL': { lat: 26.6406, lng: -81.8723 },
  'PENSACOLA,FL': { lat: 30.4213, lng: -87.2169 },
  
  // Pennsylvania cities  
  'PHILADELPHIA,PA': { lat: 39.9526, lng: -75.1652 },
  'PITTSBURGH,PA': { lat: 40.4406, lng: -79.9959 },
  'ALLENTOWN,PA': { lat: 40.6084, lng: -75.4902 },
  'ERIE,PA': { lat: 42.1292, lng: -80.0851 },
  'HARRISBURG,PA': { lat: 40.2732, lng: -76.8867 },
  'SCRANTON,PA': { lat: 41.4089, lng: -75.6624 },
  'BETHLEHEM,PA': { lat: 40.6259, lng: -75.3705 },
  
  // New York cities
  'NEW YORK,NY': { lat: 40.7128, lng: -74.0060 },
  'BROOKLYN,NY': { lat: 40.6782, lng: -73.9442 },
  'BRONX,NY': { lat: 40.8448, lng: -73.8648 },
  'QUEENS,NY': { lat: 40.7282, lng: -73.7949 },
  'MANHATTAN,NY': { lat: 40.7831, lng: -73.9712 },
  'BUFFALO,NY': { lat: 42.8864, lng: -78.8784 },
  'ROCHESTER,NY': { lat: 43.1566, lng: -77.6088 },
  'SYRACUSE,NY': { lat: 43.0481, lng: -76.1474 },
  'ALBANY,NY': { lat: 42.6526, lng: -73.7562 },
  
  // California cities
  'LOS ANGELES,CA': { lat: 34.0522, lng: -118.2437 },
  'SAN FRANCISCO,CA': { lat: 37.7749, lng: -122.4194 },
  'SAN DIEGO,CA': { lat: 32.7157, lng: -117.1611 },
  'SACRAMENTO,CA': { lat: 38.5816, lng: -121.4944 },
  'FRESNO,CA': { lat: 36.7468, lng: -119.7726 },
  'OAKLAND,CA': { lat: 37.8044, lng: -122.2711 },
  'SAN JOSE,CA': { lat: 37.3382, lng: -121.8863 },
  'LONG BEACH,CA': { lat: 33.7701, lng: -118.1937 },
  'ANAHEIM,CA': { lat: 33.8366, lng: -117.9143 },
  'SANTA ANA,CA': { lat: 33.7455, lng: -117.8677 },
  'RIVERSIDE,CA': { lat: 33.9806, lng: -117.3755 },
  'STOCKTON,CA': { lat: 37.9577, lng: -121.2908 },
  'IRVINE,CA': { lat: 33.6846, lng: -117.8265 },
  
  // Texas cities
  'HOUSTON,TX': { lat: 29.7604, lng: -95.3698 },
  'SAN ANTONIO,TX': { lat: 29.4241, lng: -98.4936 },
  'DALLAS,TX': { lat: 32.7767, lng: -96.7970 },
  'AUSTIN,TX': { lat: 30.2672, lng: -97.7431 },
  'FORT WORTH,TX': { lat: 32.7555, lng: -97.3308 },
  'EL PASO,TX': { lat: 31.7619, lng: -106.4850 },
  'ARLINGTON,TX': { lat: 32.7357, lng: -97.1081 },
  'CORPUS CHRISTI,TX': { lat: 27.8006, lng: -97.3964 },
  'PLANO,TX': { lat: 33.0198, lng: -96.6989 },
  'LUBBOCK,TX': { lat: 33.5779, lng: -101.8552 },
  'GARLAND,TX': { lat: 32.9126, lng: -96.6389 },
  'IRVING,TX': { lat: 32.8140, lng: -96.9489 },
  
  // Illinois cities
  'CHICAGO,IL': { lat: 41.8781, lng: -87.6298 },
  'AURORA,IL': { lat: 41.7606, lng: -88.3201 },
  'ROCKFORD,IL': { lat: 42.2711, lng: -89.0940 },
  'JOLIET,IL': { lat: 41.5250, lng: -88.0817 },
  'NAPERVILLE,IL': { lat: 41.7508, lng: -88.1535 },
  'SPRINGFIELD,IL': { lat: 39.7817, lng: -89.6501 },
  'PEORIA,IL': { lat: 40.6936, lng: -89.5890 },
  'ELGIN,IL': { lat: 42.0354, lng: -88.2826 },
  
  // Ohio cities
  'COLUMBUS,OH': { lat: 39.9612, lng: -82.9988 },
  'CLEVELAND,OH': { lat: 41.4993, lng: -81.6944 },
  'CINCINNATI,OH': { lat: 39.1031, lng: -84.5120 },
  'TOLEDO,OH': { lat: 41.6528, lng: -83.5379 },
  'AKRON,OH': { lat: 41.0814, lng: -81.5190 },
  'DAYTON,OH': { lat: 39.7589, lng: -84.1916 },
  
  // Georgia cities
  'ATLANTA,GA': { lat: 33.7490, lng: -84.3880 },
  'AUGUSTA,GA': { lat: 33.4735, lng: -82.0105 },
  'COLUMBUS,GA': { lat: 32.4609, lng: -84.9877 },
  'SAVANNAH,GA': { lat: 32.0809, lng: -81.0912 },
  'ATHENS,GA': { lat: 33.9519, lng: -83.3576 },
  
  // North Carolina cities
  'CHARLOTTE,NC': { lat: 35.2271, lng: -80.8431 },
  'RALEIGH,NC': { lat: 35.7796, lng: -78.6382 },
  'GREENSBORO,NC': { lat: 36.0726, lng: -79.7920 },
  'DURHAM,NC': { lat: 35.9940, lng: -78.8986 },
  'WINSTON-SALEM,NC': { lat: 36.0999, lng: -80.2442 },
  'FAYETTEVILLE,NC': { lat: 35.0527, lng: -78.8784 },
  
  // Michigan cities
  'DETROIT,MI': { lat: 42.3314, lng: -83.0458 },
  'GRAND RAPIDS,MI': { lat: 42.9634, lng: -85.6681 },
  'WARREN,MI': { lat: 42.5145, lng: -83.0147 },
  'STERLING HEIGHTS,MI': { lat: 42.5803, lng: -83.0302 },
  'ANN ARBOR,MI': { lat: 42.2808, lng: -83.7430 },
  'LANSING,MI': { lat: 42.7325, lng: -84.5555 },
  'FLINT,MI': { lat: 43.0125, lng: -83.6875 },
  
  // Add more cities as needed
};

// State center coordinates as fallback
const stateCoordinates = {
  'AL': { lat: 32.3182, lng: -86.9023 },
  'AK': { lat: 64.2008, lng: -149.4937 },
  'AZ': { lat: 34.0489, lng: -111.0937 },
  'AR': { lat: 35.2011, lng: -91.8318 },
  'CA': { lat: 36.7783, lng: -119.4179 },
  'CO': { lat: 39.5501, lng: -105.7821 },
  'CT': { lat: 41.6032, lng: -73.0877 },
  'DE': { lat: 38.9108, lng: -75.5277 },
  'FL': { lat: 27.6648, lng: -81.5158 },
  'GA': { lat: 32.1656, lng: -82.9001 },
  'HI': { lat: 19.8968, lng: -155.5828 },
  'ID': { lat: 44.0682, lng: -114.7420 },
  'IL': { lat: 40.6331, lng: -89.3985 },
  'IN': { lat: 40.2672, lng: -86.1349 },
  'IA': { lat: 41.8780, lng: -93.0977 },
  'KS': { lat: 39.0119, lng: -98.4842 },
  'KY': { lat: 37.8393, lng: -84.2700 },
  'LA': { lat: 30.9843, lng: -91.9623 },
  'ME': { lat: 45.2538, lng: -69.4455 },
  'MD': { lat: 39.0458, lng: -76.6413 },
  'MA': { lat: 42.4072, lng: -71.3824 },
  'MI': { lat: 44.3148, lng: -85.6024 },
  'MN': { lat: 46.7296, lng: -94.6859 },
  'MS': { lat: 32.3547, lng: -89.3985 },
  'MO': { lat: 37.9643, lng: -91.8318 },
  'MT': { lat: 46.8797, lng: -110.3626 },
  'NE': { lat: 41.4925, lng: -99.9018 },
  'NV': { lat: 38.8026, lng: -116.4194 },
  'NH': { lat: 43.1939, lng: -71.5724 },
  'NJ': { lat: 40.0583, lng: -74.4057 },
  'NM': { lat: 35.6870, lng: -105.9378 },
  'NY': { lat: 40.7128, lng: -74.0060 },
  'NC': { lat: 35.7596, lng: -79.0193 },
  'ND': { lat: 47.5515, lng: -101.0020 },
  'OH': { lat: 40.4173, lng: -82.9071 },
  'OK': { lat: 35.0078, lng: -97.0929 },
  'OR': { lat: 43.8041, lng: -120.5542 },
  'PA': { lat: 41.2033, lng: -77.1945 },
  'RI': { lat: 41.5801, lng: -71.4774 },
  'SC': { lat: 33.8361, lng: -81.1637 },
  'SD': { lat: 43.9695, lng: -99.9018 },
  'TN': { lat: 35.5175, lng: -86.5804 },
  'TX': { lat: 31.9686, lng: -99.9018 },
  'UT': { lat: 39.3210, lng: -111.0937 },
  'VT': { lat: 44.5588, lng: -72.5778 },
  'VA': { lat: 37.4316, lng: -78.6569 },
  'WA': { lat: 47.7511, lng: -120.7401 },
  'WV': { lat: 38.5976, lng: -80.4549 },
  'WI': { lat: 43.7844, lng: -88.7879 },
  'WY': { lat: 43.0760, lng: -107.2903 }
};

async function geocodeHospitals() {
  const client = await pool.connect();
  
  try {
    // Get all hospitals without coordinates
    const hospitalsResult = await client.query(`
      SELECT id, name, city, state, address, zip_code
      FROM hospitals
      WHERE latitude IS NULL OR longitude IS NULL
    `);
    
    console.log(`Found ${hospitalsResult.rows.length} hospitals without coordinates`);
    
    let geocoded = 0;
    let failedGeocoding = 0;
    
    for (const hospital of hospitalsResult.rows) {
      let lat, lng;
      
      // Try to find coordinates by city,state first
      const cityStateKey = `${hospital.city?.toUpperCase()},${hospital.state}`;
      
      if (cityCoordinates[cityStateKey]) {
        // Use city coordinates with slight random offset to prevent overlapping
        lat = cityCoordinates[cityStateKey].lat + (Math.random() - 0.5) * 0.02;
        lng = cityCoordinates[cityStateKey].lng + (Math.random() - 0.5) * 0.02;
      } else if (stateCoordinates[hospital.state]) {
        // Fallback to state center with wider random offset
        lat = stateCoordinates[hospital.state].lat + (Math.random() - 0.5) * 2;
        lng = stateCoordinates[hospital.state].lng + (Math.random() - 0.5) * 2;
      } else {
        console.log(`⚠️ Could not geocode hospital: ${hospital.name} in ${hospital.city}, ${hospital.state}`);
        failedGeocoding++;
        continue;
      }
      
      // Update hospital with coordinates
      await client.query(`
        UPDATE hospitals 
        SET 
          latitude = $1,
          longitude = $2,
          location = ST_SetSRID(ST_MakePoint($2, $1), 4326)
        WHERE id = $3
      `, [lat, lng, hospital.id]);
      
      geocoded++;
      
      if (geocoded % 100 === 0) {
        console.log(`Progress: ${geocoded}/${hospitalsResult.rows.length} hospitals geocoded`);
      }
    }
    
    console.log(`\n✅ Geocoding complete!`);
    console.log(`   - Successfully geocoded: ${geocoded} hospitals`);
    console.log(`   - Failed to geocode: ${failedGeocoding} hospitals`);
    
    // Verify the update
    const verifyResult = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(latitude) as with_coordinates
      FROM hospitals
    `);
    
    console.log(`\n📊 Final statistics:`);
    console.log(`   - Total hospitals: ${verifyResult.rows[0].total}`);
    console.log(`   - Hospitals with coordinates: ${verifyResult.rows[0].with_coordinates}`);
    
  } catch (error) {
    console.error('Error geocoding hospitals:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the geocoding
geocodeHospitals();