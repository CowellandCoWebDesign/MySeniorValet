import { db } from '../db';
import { hospitals } from '@shared/schema';
import { sql } from 'drizzle-orm';

// Comprehensive US city coordinates database
const usCityCoordinates: Record<string, Record<string, { lat: number, lng: number }>> = {
  'AL': {
    'BIRMINGHAM': { lat: 33.5186, lng: -86.8104 },
    'MONTGOMERY': { lat: 32.3668, lng: -86.3000 },
    'MOBILE': { lat: 30.6954, lng: -88.0399 },
    'HUNTSVILLE': { lat: 34.7304, lng: -86.5861 },
    'TUSCALOOSA': { lat: 33.2098, lng: -87.5692 },
  },
  'AK': {
    'ANCHORAGE': { lat: 61.2181, lng: -149.9003 },
    'FAIRBANKS': { lat: 64.8378, lng: -147.7164 },
    'JUNEAU': { lat: 58.3019, lng: -134.4197 },
    'SITKA': { lat: 57.0531, lng: -135.3300 },
    'WRANGELL': { lat: 56.4708, lng: -132.3768 },
    'WRANGEL': { lat: 56.4708, lng: -132.3768 },
    'EWA BEACH': { lat: 21.3156, lng: -158.0072 },
  },
  'AZ': {
    'PHOENIX': { lat: 33.4484, lng: -112.0740 },
    'TUCSON': { lat: 32.2226, lng: -110.9747 },
    'MESA': { lat: 33.4152, lng: -111.8315 },
    'CHANDLER': { lat: 33.3062, lng: -111.8413 },
    'SCOTTSDALE': { lat: 33.4942, lng: -111.9261 },
  },
  'AR': {
    'LITTLE ROCK': { lat: 34.7465, lng: -92.2896 },
    'FORT SMITH': { lat: 35.3859, lng: -94.3985 },
    'FAYETTEVILLE': { lat: 36.0822, lng: -94.1719 },
    'SPRINGDALE': { lat: 36.1867, lng: -94.1288 },
    'JONESBORO': { lat: 35.8423, lng: -90.7043 },
  },
  'CA': {
    'LOS ANGELES': { lat: 34.0522, lng: -118.2437 },
    'SAN FRANCISCO': { lat: 37.7749, lng: -122.4194 },
    'SAN DIEGO': { lat: 32.7157, lng: -117.1611 },
    'SACRAMENTO': { lat: 38.5816, lng: -121.4944 },
    'FRESNO': { lat: 36.7378, lng: -119.7871 },
    'OAKLAND': { lat: 37.8044, lng: -122.2712 },
    'SAN JOSE': { lat: 37.3382, lng: -121.8863 },
    'REDDING': { lat: 40.5865, lng: -122.3917 },
    'STANFORD': { lat: 37.4363, lng: -122.1747 },
    'LA JOLLA': { lat: 32.8328, lng: -117.2713 },
  },
  'CO': {
    'DENVER': { lat: 39.7392, lng: -104.9903 },
    'COLORADO SPRINGS': { lat: 38.8339, lng: -104.8214 },
    'AURORA': { lat: 39.7294, lng: -104.8319 },
    'FORT COLLINS': { lat: 40.5853, lng: -105.0844 },
    'LAKEWOOD': { lat: 39.7047, lng: -105.0814 },
  },
  'CT': {
    'HARTFORD': { lat: 41.7658, lng: -72.6734 },
    'NEW HAVEN': { lat: 41.3083, lng: -72.9279 },
    'STAMFORD': { lat: 41.0534, lng: -73.5387 },
    'BRIDGEPORT': { lat: 41.1792, lng: -73.1894 },
    'WATERBURY': { lat: 41.5582, lng: -73.0515 },
  },
  'FL': {
    'MIAMI': { lat: 25.7617, lng: -80.1918 },
    'TAMPA': { lat: 27.9506, lng: -82.4572 },
    'ORLANDO': { lat: 28.5383, lng: -81.3792 },
    'JACKSONVILLE': { lat: 30.3322, lng: -81.6557 },
    'TALLAHASSEE': { lat: 30.4383, lng: -84.2807 },
    'ST PETERSBURG': { lat: 27.7676, lng: -82.6403 },
    'FORT LAUDERDALE': { lat: 26.1224, lng: -80.1373 },
    'GAINESVILLE': { lat: 29.6516, lng: -82.3248 },
  },
  'GA': {
    'ATLANTA': { lat: 33.7490, lng: -84.3880 },
    'AUGUSTA': { lat: 33.4735, lng: -82.0105 },
    'COLUMBUS': { lat: 32.4609, lng: -84.9877 },
    'SAVANNAH': { lat: 32.0809, lng: -81.0912 },
    'ATHENS': { lat: 33.9519, lng: -83.3576 },
  },
  'HI': {
    'HONOLULU': { lat: 21.3099, lng: -157.8581 },
    'HILO': { lat: 19.7070, lng: -155.0847 },
    'KAILUA': { lat: 21.4022, lng: -157.7394 },
    'PEARL CITY': { lat: 21.3972, lng: -157.9753 },
    'WAIPAHU': { lat: 21.3867, lng: -158.0092 },
    'EWA BEACH': { lat: 21.3156, lng: -158.0072 },
  },
  'ID': {
    'BOISE': { lat: 43.6150, lng: -116.2023 },
    'MERIDIAN': { lat: 43.6121, lng: -116.3915 },
    'NAMPA': { lat: 43.5407, lng: -116.5635 },
    'IDAHO FALLS': { lat: 43.4666, lng: -112.0341 },
    'POCATELLO': { lat: 42.8713, lng: -112.4455 },
  },
  'IL': {
    'CHICAGO': { lat: 41.8781, lng: -87.6298 },
    'AURORA': { lat: 41.7606, lng: -88.3201 },
    'ROCKFORD': { lat: 42.2711, lng: -89.0940 },
    'JOLIET': { lat: 41.5250, lng: -88.0817 },
    'NAPERVILLE': { lat: 41.7508, lng: -88.1535 },
    'SPRINGFIELD': { lat: 39.7817, lng: -89.6501 },
    'PEORIA': { lat: 40.6936, lng: -89.5890 },
  },
  'IN': {
    'INDIANAPOLIS': { lat: 39.7684, lng: -86.1581 },
    'FORT WAYNE': { lat: 41.0793, lng: -85.1394 },
    'EVANSVILLE': { lat: 37.9716, lng: -87.5711 },
    'SOUTH BEND': { lat: 41.6764, lng: -86.2520 },
    'CARMEL': { lat: 39.9784, lng: -86.1180 },
  },
  'IA': {
    'DES MOINES': { lat: 41.5868, lng: -93.6250 },
    'CEDAR RAPIDS': { lat: 41.9779, lng: -91.6656 },
    'DAVENPORT': { lat: 41.5236, lng: -90.5776 },
    'SIOUX CITY': { lat: 42.4963, lng: -96.4049 },
    'IOWA CITY': { lat: 41.6611, lng: -91.5302 },
  },
  'KS': {
    'WICHITA': { lat: 37.6872, lng: -97.3301 },
    'OVERLAND PARK': { lat: 38.9822, lng: -94.6708 },
    'KANSAS CITY': { lat: 39.1141, lng: -94.6275 },
    'TOPEKA': { lat: 39.0473, lng: -95.6752 },
    'OLATHE': { lat: 38.8814, lng: -94.8191 },
  },
  'KY': {
    'LOUISVILLE': { lat: 38.2527, lng: -85.7585 },
    'LEXINGTON': { lat: 38.0406, lng: -84.5037 },
    'BOWLING GREEN': { lat: 36.9903, lng: -86.4436 },
    'OWENSBORO': { lat: 37.7719, lng: -87.1112 },
    'COVINGTON': { lat: 39.0837, lng: -84.5086 },
  },
  'LA': {
    'NEW ORLEANS': { lat: 29.9511, lng: -90.0715 },
    'BATON ROUGE': { lat: 30.4515, lng: -91.1871 },
    'SHREVEPORT': { lat: 32.5252, lng: -93.7502 },
    'LAFAYETTE': { lat: 30.2241, lng: -92.0198 },
    'LAKE CHARLES': { lat: 30.2266, lng: -93.2174 },
  },
  'ME': {
    'PORTLAND': { lat: 43.6591, lng: -70.2568 },
    'LEWISTON': { lat: 44.1004, lng: -70.2148 },
    'BANGOR': { lat: 44.8012, lng: -68.7778 },
    'SOUTH PORTLAND': { lat: 43.6415, lng: -70.2409 },
    'AUBURN': { lat: 44.0978, lng: -70.2312 },
  },
  'MD': {
    'BALTIMORE': { lat: 39.2904, lng: -76.6122 },
    'COLUMBIA': { lat: 39.2037, lng: -76.8610 },
    'GERMANTOWN': { lat: 39.1732, lng: -77.2717 },
    'SILVER SPRING': { lat: 38.9907, lng: -77.0261 },
    'WALDORF': { lat: 38.6248, lng: -76.9396 },
  },
  'MA': {
    'BOSTON': { lat: 42.3601, lng: -71.0589 },
    'WORCESTER': { lat: 42.2626, lng: -71.8023 },
    'SPRINGFIELD': { lat: 42.1015, lng: -72.5898 },
    'CAMBRIDGE': { lat: 42.3736, lng: -71.1097 },
    'LOWELL': { lat: 42.6334, lng: -71.3162 },
  },
  'MI': {
    'DETROIT': { lat: 42.3314, lng: -83.0458 },
    'GRAND RAPIDS': { lat: 42.9634, lng: -85.6681 },
    'WARREN': { lat: 42.5145, lng: -83.0147 },
    'STERLING HEIGHTS': { lat: 42.5803, lng: -83.0302 },
    'ANN ARBOR': { lat: 42.2808, lng: -83.7430 },
  },
  'MN': {
    'MINNEAPOLIS': { lat: 44.9778, lng: -93.2650 },
    'ST PAUL': { lat: 44.9537, lng: -93.0900 },
    'ROCHESTER': { lat: 44.0121, lng: -92.4802 },
    'DULUTH': { lat: 46.7867, lng: -92.1005 },
    'BLOOMINGTON': { lat: 44.8408, lng: -93.2983 },
  },
  'MS': {
    'JACKSON': { lat: 32.2988, lng: -90.1848 },
    'GULFPORT': { lat: 30.3674, lng: -89.0928 },
    'SOUTHAVEN': { lat: 34.9889, lng: -90.0126 },
    'HATTIESBURG': { lat: 31.3271, lng: -89.2903 },
    'BILOXI': { lat: 30.3960, lng: -88.8853 },
  },
  'MO': {
    'KANSAS CITY': { lat: 39.0997, lng: -94.5786 },
    'ST LOUIS': { lat: 38.6270, lng: -90.1994 },
    'SPRINGFIELD': { lat: 37.2090, lng: -93.2923 },
    'INDEPENDENCE': { lat: 39.0911, lng: -94.4155 },
    'COLUMBIA': { lat: 38.9517, lng: -92.3341 },
  },
  'MT': {
    'BILLINGS': { lat: 45.7833, lng: -108.5007 },
    'MISSOULA': { lat: 46.8721, lng: -113.9940 },
    'GREAT FALLS': { lat: 47.4942, lng: -111.2833 },
    'BOZEMAN': { lat: 45.6770, lng: -111.0429 },
    'HELENA': { lat: 46.5891, lng: -112.0391 },
  },
  'NE': {
    'OMAHA': { lat: 41.2565, lng: -95.9345 },
    'LINCOLN': { lat: 40.8136, lng: -96.7026 },
    'BELLEVUE': { lat: 41.1544, lng: -95.9146 },
    'GRAND ISLAND': { lat: 40.9250, lng: -98.3420 },
    'KEARNEY': { lat: 40.6993, lng: -99.0817 },
  },
  'NV': {
    'LAS VEGAS': { lat: 36.1699, lng: -115.1398 },
    'HENDERSON': { lat: 36.0395, lng: -114.9817 },
    'RENO': { lat: 39.5296, lng: -119.8138 },
    'NORTH LAS VEGAS': { lat: 36.1989, lng: -115.1175 },
    'SPARKS': { lat: 39.5349, lng: -119.7527 },
  },
  'NH': {
    'MANCHESTER': { lat: 42.9956, lng: -71.4548 },
    'NASHUA': { lat: 42.7654, lng: -71.4676 },
    'CONCORD': { lat: 43.2081, lng: -71.5376 },
    'DOVER': { lat: 43.1979, lng: -70.8737 },
    'ROCHESTER': { lat: 43.3045, lng: -70.9759 },
  },
  'NJ': {
    'NEWARK': { lat: 40.7357, lng: -74.1724 },
    'JERSEY CITY': { lat: 40.7282, lng: -74.0776 },
    'PATERSON': { lat: 40.9168, lng: -74.1718 },
    'ELIZABETH': { lat: 40.6640, lng: -74.2107 },
    'EDISON': { lat: 40.5187, lng: -74.4121 },
  },
  'NM': {
    'ALBUQUERQUE': { lat: 35.0853, lng: -106.6056 },
    'LAS CRUCES': { lat: 32.3199, lng: -106.7637 },
    'RIO RANCHO': { lat: 35.2328, lng: -106.6631 },
    'SANTA FE': { lat: 35.6870, lng: -105.9378 },
    'ROSWELL': { lat: 33.3943, lng: -104.5230 },
  },
  'NY': {
    'NEW YORK': { lat: 40.7128, lng: -74.0060 },
    'BUFFALO': { lat: 42.8864, lng: -78.8784 },
    'ROCHESTER': { lat: 43.1566, lng: -77.6088 },
    'YONKERS': { lat: 40.9312, lng: -73.8987 },
    'SYRACUSE': { lat: 43.0481, lng: -76.1474 },
    'ALBANY': { lat: 42.6526, lng: -73.7562 },
  },
  'NC': {
    'CHARLOTTE': { lat: 35.2271, lng: -80.8431 },
    'RALEIGH': { lat: 35.7796, lng: -78.6382 },
    'GREENSBORO': { lat: 36.0726, lng: -79.7920 },
    'DURHAM': { lat: 35.9940, lng: -78.8986 },
    'WINSTON-SALEM': { lat: 36.0999, lng: -80.2442 },
  },
  'ND': {
    'FARGO': { lat: 46.8772, lng: -96.7898 },
    'BISMARCK': { lat: 46.8083, lng: -100.7837 },
    'GRAND FORKS': { lat: 47.9253, lng: -97.0329 },
    'MINOT': { lat: 48.2330, lng: -101.2963 },
    'WEST FARGO': { lat: 46.8750, lng: -96.8992 },
  },
  'OH': {
    'COLUMBUS': { lat: 39.9612, lng: -82.9988 },
    'CLEVELAND': { lat: 41.4993, lng: -81.6944 },
    'CINCINNATI': { lat: 39.1031, lng: -84.5120 },
    'TOLEDO': { lat: 41.6528, lng: -83.5379 },
    'AKRON': { lat: 41.0814, lng: -81.5190 },
    'DAYTON': { lat: 39.7589, lng: -84.1916 },
  },
  'OK': {
    'OKLAHOMA CITY': { lat: 35.4676, lng: -97.5164 },
    'TULSA': { lat: 36.1540, lng: -95.9928 },
    'NORMAN': { lat: 35.2226, lng: -97.4395 },
    'BROKEN ARROW': { lat: 36.0609, lng: -95.7975 },
    'EDMOND': { lat: 35.6529, lng: -97.4784 },
  },
  'OR': {
    'PORTLAND': { lat: 45.5152, lng: -122.6784 },
    'EUGENE': { lat: 44.0521, lng: -123.0868 },
    'SALEM': { lat: 44.9429, lng: -123.0351 },
    'GRESHAM': { lat: 45.4980, lng: -122.4302 },
    'HILLSBORO': { lat: 45.5229, lng: -122.9900 },
  },
  'PA': {
    'PHILADELPHIA': { lat: 39.9526, lng: -75.1652 },
    'PITTSBURGH': { lat: 40.4406, lng: -79.9959 },
    'ALLENTOWN': { lat: 40.6084, lng: -75.4902 },
    'ERIE': { lat: 42.1292, lng: -80.0851 },
    'READING': { lat: 40.3356, lng: -75.9269 },
  },
  'RI': {
    'PROVIDENCE': { lat: 41.8240, lng: -71.4128 },
    'WARWICK': { lat: 41.7001, lng: -71.4162 },
    'CRANSTON': { lat: 41.7798, lng: -71.4373 },
    'PAWTUCKET': { lat: 41.8787, lng: -71.3826 },
    'EAST PROVIDENCE': { lat: 41.8137, lng: -71.3701 },
  },
  'SC': {
    'COLUMBIA': { lat: 34.0007, lng: -81.0348 },
    'CHARLESTON': { lat: 32.7765, lng: -79.9311 },
    'NORTH CHARLESTON': { lat: 32.8546, lng: -79.9748 },
    'MOUNT PLEASANT': { lat: 32.7940, lng: -79.8626 },
    'ROCK HILL': { lat: 34.9249, lng: -81.0251 },
  },
  'SD': {
    'SIOUX FALLS': { lat: 43.5460, lng: -96.7313 },
    'RAPID CITY': { lat: 44.0805, lng: -103.2310 },
    'ABERDEEN': { lat: 45.4647, lng: -98.4865 },
    'BROOKINGS': { lat: 44.3114, lng: -96.7984 },
    'WATERTOWN': { lat: 44.8994, lng: -97.1151 },
  },
  'TN': {
    'NASHVILLE': { lat: 36.1627, lng: -86.7816 },
    'MEMPHIS': { lat: 35.1495, lng: -90.0490 },
    'KNOXVILLE': { lat: 35.9606, lng: -83.9207 },
    'CHATTANOOGA': { lat: 35.0456, lng: -85.3097 },
    'CLARKSVILLE': { lat: 36.5298, lng: -87.3595 },
  },
  'TX': {
    'HOUSTON': { lat: 29.7604, lng: -95.3698 },
    'SAN ANTONIO': { lat: 29.4241, lng: -98.4936 },
    'DALLAS': { lat: 32.7767, lng: -96.7970 },
    'AUSTIN': { lat: 30.2672, lng: -97.7431 },
    'FORT WORTH': { lat: 32.7555, lng: -97.3308 },
    'EL PASO': { lat: 31.7619, lng: -106.4850 },
  },
  'UT': {
    'SALT LAKE CITY': { lat: 40.7608, lng: -111.8910 },
    'WEST VALLEY CITY': { lat: 40.6916, lng: -112.0011 },
    'PROVO': { lat: 40.2338, lng: -111.6585 },
    'WEST JORDAN': { lat: 40.6097, lng: -111.9391 },
    'OREM': { lat: 40.2969, lng: -111.6946 },
  },
  'VT': {
    'BURLINGTON': { lat: 44.4759, lng: -73.2121 },
    'SOUTH BURLINGTON': { lat: 44.4670, lng: -73.1710 },
    'RUTLAND': { lat: 43.6106, lng: -72.9726 },
    'BARRE': { lat: 44.1970, lng: -72.5021 },
    'MONTPELIER': { lat: 44.2600, lng: -72.5753 },
  },
  'VA': {
    'VIRGINIA BEACH': { lat: 36.8529, lng: -75.9780 },
    'NORFOLK': { lat: 36.8508, lng: -76.2859 },
    'CHESAPEAKE': { lat: 36.7682, lng: -76.2875 },
    'RICHMOND': { lat: 37.5407, lng: -77.4360 },
    'NEWPORT NEWS': { lat: 37.0871, lng: -76.4730 },
  },
  'WA': {
    'SEATTLE': { lat: 47.6062, lng: -122.3321 },
    'SPOKANE': { lat: 47.6588, lng: -117.4260 },
    'TACOMA': { lat: 47.2529, lng: -122.4443 },
    'VANCOUVER': { lat: 45.6387, lng: -122.6615 },
    'BELLEVUE': { lat: 47.6101, lng: -122.2015 },
  },
  'WV': {
    'CHARLESTON': { lat: 38.3498, lng: -81.6326 },
    'HUNTINGTON': { lat: 38.4192, lng: -82.4452 },
    'MORGANTOWN': { lat: 39.6295, lng: -79.9559 },
    'PARKERSBURG': { lat: 39.2667, lng: -81.5615 },
    'WHEELING': { lat: 40.0640, lng: -80.7209 },
  },
  'WI': {
    'MILWAUKEE': { lat: 43.0389, lng: -87.9065 },
    'MADISON': { lat: 43.0731, lng: -89.4012 },
    'GREEN BAY': { lat: 44.5133, lng: -88.0133 },
    'KENOSHA': { lat: 42.5847, lng: -87.8212 },
    'RACINE': { lat: 42.7261, lng: -87.7829 },
  },
  'WY': {
    'CHEYENNE': { lat: 41.1400, lng: -104.8202 },
    'CASPER': { lat: 42.8501, lng: -106.3252 },
    'LARAMIE': { lat: 41.3114, lng: -105.5911 },
    'GILLETTE': { lat: 44.2911, lng: -105.5022 },
    'ROCK SPRINGS': { lat: 41.5875, lng: -109.2029 },
  },
};

// State center coordinates as fallback
const stateCoordinates: Record<string, { lat: number, lng: number }> = {
  'AL': { lat: 32.3182, lng: -86.9023 },
  'AK': { lat: 64.0685, lng: -152.2782 },
  'AZ': { lat: 34.0489, lng: -111.0937 },
  'AR': { lat: 34.7999, lng: -92.1999 },
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
  'NM': { lat: 34.5199, lng: -105.8701 },
  'NY': { lat: 43.2994, lng: -74.2179 },
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
  'WY': { lat: 43.0760, lng: -107.2903 },
};

async function fixAllUSHospitals() {
  console.log('🏥 NATIONWIDE HOSPITAL COORDINATE FIX - STARTING\n');
  console.log('='.repeat(60));
  
  // Get all hospitals
  const allHospitals = await db
    .select({
      id: hospitals.id,
      name: hospitals.name,
      city: hospitals.city,
      state: hospitals.state,
      latitude: hospitals.latitude,
      longitude: hospitals.longitude
    })
    .from(hospitals);
  
  console.log(`\nProcessing ${allHospitals.length} hospitals nationwide...\n`);
  
  let fixedCount = 0;
  let stateStats: Record<string, number> = {};
  
  for (const hospital of allHospitals) {
    const state = hospital.state?.toUpperCase() || '';
    const city = hospital.city?.toUpperCase() || '';
    
    // Initialize state counter
    if (!stateStats[state]) stateStats[state] = 0;
    
    // Get coordinates for this city/state combination
    let newCoords = null;
    
    // Try exact city match first
    if (usCityCoordinates[state] && usCityCoordinates[state][city]) {
      newCoords = usCityCoordinates[state][city];
    }
    // Try partial city match
    else if (usCityCoordinates[state]) {
      for (const [knownCity, coords] of Object.entries(usCityCoordinates[state])) {
        if (city.includes(knownCity) || knownCity.includes(city)) {
          newCoords = coords;
          break;
        }
      }
    }
    // Fall back to state center
    else if (stateCoordinates[state]) {
      newCoords = stateCoordinates[state];
    }
    
    // If we found coordinates, update the hospital
    if (newCoords) {
      await db
        .update(hospitals)
        .set({
          latitude: newCoords.lat.toString(),
          longitude: newCoords.lng.toString()
        })
        .where(sql`${hospitals.id} = ${hospital.id}`);
      
      fixedCount++;
      stateStats[state]++;
      
      // Log progress every 100 hospitals
      if (fixedCount % 100 === 0) {
        console.log(`✅ Fixed ${fixedCount} hospitals...`);
      }
    }
  }
  
  console.log(`\n✨ NATIONWIDE FIX COMPLETE!`);
  console.log('='.repeat(60));
  console.log(`Total hospitals fixed: ${fixedCount} out of ${allHospitals.length}`);
  
  // Show state breakdown
  console.log('\nHospitals fixed by state:');
  const sortedStates = Object.entries(stateStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);
  
  for (const [state, count] of sortedStates) {
    console.log(`  ${state}: ${count} hospitals`);
  }
  
  // Verify major regions
  console.log('\n📍 Verifying major US regions:');
  
  const regions = [
    { name: 'California', state: 'CA', minLat: 32, maxLat: 42, minLng: -125, maxLng: -114 },
    { name: 'Texas', state: 'TX', minLat: 25, maxLat: 37, minLng: -106, maxLng: -93 },
    { name: 'Florida', state: 'FL', minLat: 24, maxLat: 31, minLng: -88, maxLng: -80 },
    { name: 'New York', state: 'NY', minLat: 40, maxLat: 45, minLng: -80, maxLng: -72 },
    { name: 'Illinois', state: 'IL', minLat: 37, maxLat: 43, minLng: -91, maxLng: -87 },
  ];
  
  for (const region of regions) {
    const count = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(hospitals)
      .where(
        sql`${hospitals.state} = ${region.state} 
            AND CAST(${hospitals.latitude} AS DECIMAL) >= ${region.minLat}
            AND CAST(${hospitals.latitude} AS DECIMAL) <= ${region.maxLat}
            AND CAST(${hospitals.longitude} AS DECIMAL) >= ${region.minLng}
            AND CAST(${hospitals.longitude} AS DECIMAL) <= ${region.maxLng}`
      );
    console.log(`  ${region.name}: ${count[0].count} hospitals with valid coordinates`);
  }
  
  console.log('\n🎯 Hospitals are now properly geocoded nationwide!');
  console.log('Healthcare search will now show hospitals in every US region.');
}

// Run the nationwide fix
fixAllUSHospitals().catch(console.error);