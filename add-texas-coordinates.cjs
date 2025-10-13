const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Major Texas city coordinates for map display
const TEXAS_COORDINATES = {
  // Major metropolitan areas
  'Houston': { lat: 29.7604, lng: -95.3698 },
  'Dallas': { lat: 32.7767, lng: -96.7970 },
  'San Antonio': { lat: 29.4241, lng: -98.4936 },
  'Austin': { lat: 30.2672, lng: -97.7431 },
  'Fort Worth': { lat: 32.7555, lng: -97.3308 },
  'El Paso': { lat: 31.7619, lng: -106.4850 },
  'Arlington': { lat: 32.7357, lng: -97.1081 },
  'Corpus Christi': { lat: 27.8006, lng: -97.3964 },
  'Plano': { lat: 33.0198, lng: -96.6989 },
  'Lubbock': { lat: 33.5779, lng: -101.8552 },
  'Laredo': { lat: 27.5306, lng: -99.4803 },
  'Garland': { lat: 32.9126, lng: -96.6389 },
  'Irving': { lat: 32.8140, lng: -96.9489 },
  'Amarillo': { lat: 35.2220, lng: -101.8313 },
  'Grand Prairie': { lat: 32.7460, lng: -96.9978 },
  'Brownsville': { lat: 25.9018, lng: -97.4975 },
  'McKinney': { lat: 33.1976, lng: -96.6154 },
  'Frisco': { lat: 33.1507, lng: -96.8236 },
  'Pasadena': { lat: 29.6911, lng: -95.2091 },
  'Killeen': { lat: 31.1171, lng: -97.7278 },
  'Carrollton': { lat: 32.9537, lng: -96.8903 },
  'Pearland': { lat: 29.5636, lng: -95.2861 },
  'Waco': { lat: 31.5494, lng: -97.1467 },
  'Denton': { lat: 33.2148, lng: -97.1331 },
  'Midland': { lat: 32.0173, lng: -102.1012 },
  'Abilene': { lat: 32.4487, lng: -99.7331 },
  'Beaumont': { lat: 30.0803, lng: -94.1266 },
  'Round Rock': { lat: 30.5083, lng: -97.6789 },
  'Odessa': { lat: 31.8457, lng: -102.3676 },
  'Wichita Falls': { lat: 33.9137, lng: -98.4934 },
  'Richardson': { lat: 32.9483, lng: -96.7299 },
  'Lewisville': { lat: 33.0462, lng: -96.9942 },
  'Sugar Land': { lat: 29.6196, lng: -95.6349 },
  'Tyler': { lat: 32.3513, lng: -95.3011 },
  'College Station': { lat: 30.6280, lng: -96.3344 },
  'Longview': { lat: 32.5007, lng: -94.7405 },
  'Bryan': { lat: 30.6744, lng: -96.3700 },
  'Baytown': { lat: 29.7355, lng: -94.9777 },
  'Pharr': { lat: 26.1948, lng: -98.1836 },
  'Mesquite': { lat: 32.7668, lng: -96.5992 },
  'Missouri City': { lat: 29.5688, lng: -95.5377 },
  'Flower Mound': { lat: 33.0146, lng: -97.0969 },
  'Harlingen': { lat: 26.1906, lng: -97.6961 },
  'North Richland Hills': { lat: 32.8342, lng: -97.2289 },
  'Victoria': { lat: 28.8053, lng: -97.0036 },
  'Conroe': { lat: 30.3119, lng: -95.4560 },
  'New Braunfels': { lat: 29.7030, lng: -98.1245 },
  'Cedar Park': { lat: 30.5052, lng: -97.8203 },
  'Temple': { lat: 31.0982, lng: -97.3428 },
  'League City': { lat: 29.5075, lng: -95.0949 },
  'Edinburg': { lat: 26.3017, lng: -98.1633 },
  'San Angelo': { lat: 31.4638, lng: -100.4370 },
  'Georgetown': { lat: 30.6327, lng: -97.6779 },
  'Pflugerville': { lat: 30.4394, lng: -97.6200 },
  'The Colony': { lat: 33.0901, lng: -96.8928 },
  'Euless': { lat: 32.8371, lng: -97.0820 },
  'Allen': { lat: 33.1031, lng: -96.6706 },
  'Hurst': { lat: 32.8235, lng: -97.1706 },
  'Grapevine': { lat: 32.9343, lng: -97.0781 },
  'Galveston': { lat: 29.2694, lng: -94.7850 },
  'Texarkana': { lat: 33.4251, lng: -94.0477 },
  'Huntsville': { lat: 30.7235, lng: -95.5508 },
  'Keller': { lat: 32.9348, lng: -97.2514 },
  'Wylie': { lat: 33.0151, lng: -96.5389 },
  'Coppell': { lat: 32.9546, lng: -97.0150 },
  'Rockwall': { lat: 32.9312, lng: -96.4597 },
  'Mansfield': { lat: 32.5632, lng: -97.1417 },
  'Friendswood': { lat: 29.5294, lng: -95.2010 },
  'Burleson': { lat: 32.5421, lng: -97.3209 },
  'Haltom City': { lat: 32.7996, lng: -97.2692 },
  'Duncanville': { lat: 32.6518, lng: -96.9083 },
  'Paris': { lat: 33.6617, lng: -95.5555 },
  'Cleburne': { lat: 32.3476, lng: -97.3867 },
  'Weatherford': { lat: 32.7593, lng: -97.7970 },
  'Brownwood': { lat: 31.7093, lng: -98.9912 },
  'Granbury': { lat: 32.4421, lng: -97.7947 },
  'Kingsville': { lat: 27.5158, lng: -97.8564 },
  'Huntington': { lat: 31.2774, lng: -94.5744 },
  'Lufkin': { lat: 31.3382, lng: -94.7291 },
  'Nacogdoches': { lat: 31.6038, lng: -94.6555 },
  'Marshall': { lat: 32.5446, lng: -94.3675 },
  'Palestine': { lat: 31.7621, lng: -95.6307 },
  'Corsicana': { lat: 32.0954, lng: -96.4686 },
  'Greenville': { lat: 33.1384, lng: -96.1114 },
  'Sulphur Springs': { lat: 33.1387, lng: -95.6011 },
  'Denison': { lat: 33.7557, lng: -96.5367 },
  'Gainesville': { lat: 33.6262, lng: -97.1333 },
  'Stephenville': { lat: 32.2207, lng: -98.2020 },
  'Mineral Wells': { lat: 32.8085, lng: -98.1128 },
  'Brenham': { lat: 30.1669, lng: -96.3977 },
  'Bastrop': { lat: 30.1104, lng: -97.3153 },
  'Lockhart': { lat: 29.8849, lng: -97.6689 },
  'Seguin': { lat: 29.5688, lng: -97.9647 },
  'Fredericksburg': { lat: 30.2752, lng: -98.8719 },
  'Boerne': { lat: 29.7946, lng: -98.7320 },
  'Kerrville': { lat: 30.0474, lng: -99.1403 },
  'Del Rio': { lat: 29.3628, lng: -100.8968 },
  'Eagle Pass': { lat: 28.7089, lng: -100.4995 },
  'Uvalde': { lat: 29.2097, lng: -99.7864 },
  'Carrizo Springs': { lat: 28.5214, lng: -99.8606 },
  'Crystal City': { lat: 28.6806, lng: -99.8284 },
  'Pearsall': { lat: 28.8908, lng: -99.0956 },
  'Hondo': { lat: 29.3472, lng: -99.1423 },
  'Castroville': { lat: 29.3558, lng: -98.8786 },
  'Floresville': { lat: 29.1341, lng: -98.1564 },
  'Pleasanton': { lat: 28.9669, lng: -98.4786 },
  'Jourdanton': { lat: 28.9186, lng: -98.5453 },
  'Poteet': { lat: 29.0408, lng: -98.6028 },
  'Devine': { lat: 29.1397, lng: -98.9089 },
  'Pecos': { lat: 31.4215, lng: -103.4932 },
  'Fort Stockton': { lat: 30.8951, lng: -102.8799 },
  'Big Spring': { lat: 32.2504, lng: -101.4787 },
  'Snyder': { lat: 32.7176, lng: -100.9176 },
  'Sweetwater': { lat: 32.4707, lng: -100.4057 },
  'Stamford': { lat: 32.9543, lng: -99.8032 },
  'Anson': { lat: 32.7565, lng: -99.8962 },
  'Hamlin': { lat: 32.8851, lng: -100.1326 },
  'Rotan': { lat: 32.8515, lng: -100.4651 },
  'Aspermont': { lat: 33.1354, lng: -100.2287 },
  'Jayton': { lat: 33.2487, lng: -100.5743 },
  'Post': { lat: 33.1907, lng: -101.3793 },
  'Tahoka': { lat: 33.1618, lng: -101.7932 },
  'Lamesa': { lat: 32.7376, lng: -101.9507 },
  'Seminole': { lat: 32.7198, lng: -102.6446 },
  'Andrews': { lat: 32.3185, lng: -102.5446 },
  'Kermit': { lat: 31.8576, lng: -103.0927 },
  'Monahans': { lat: 31.5943, lng: -102.8932 },
  'Crane': { lat: 31.3968, lng: -102.3540 },
  'McCamey': { lat: 31.1371, lng: -102.2315 },
  'Rankin': { lat: 31.2260, lng: -101.9440 },
  'Iraan': { lat: 30.9132, lng: -101.8993 },
  'Ozona': { lat: 30.7143, lng: -101.2007 },
  'Sonora': { lat: 30.5635, lng: -100.6434 },
  'Junction': { lat: 30.4893, lng: -99.7717 },
  'Menard': { lat: 30.9171, lng: -99.7895 },
  'Mason': { lat: 30.7485, lng: -99.2307 },
  'Llano': { lat: 30.7588, lng: -98.6745 },
  'Burnet': { lat: 30.7582, lng: -98.2281 },
  'Marble Falls': { lat: 30.5783, lng: -98.2731 },
  'Lampasas': { lat: 31.0640, lng: -98.1770 },
  'Killeen': { lat: 31.1171, lng: -97.7278 },
  'Copperas Cove': { lat: 31.1240, lng: -97.9031 },
  'Belton': { lat: 31.0560, lng: -97.4642 },
  'Gatesville': { lat: 31.4351, lng: -97.7428 },
  'Hamilton': { lat: 31.7032, lng: -98.1231 },
  'Hico': { lat: 31.9832, lng: -98.0317 },
  'Glen Rose': { lat: 32.2343, lng: -97.7531 },
  'Decatur': { lat: 33.2343, lng: -97.5861 },
  'Bridgeport': { lat: 33.2079, lng: -97.7542 },
  'Jacksboro': { lat: 33.2184, lng: -98.1587 },
  'Graham': { lat: 33.1076, lng: -98.5887 },
  'Breckenridge': { lat: 32.7559, lng: -98.9020 },
  'Eastland': { lat: 32.4015, lng: -98.8173 },
  'Cisco': { lat: 32.3885, lng: -98.9787 },
  'Ranger': { lat: 32.4687, lng: -98.6784 },
  'Gorman': { lat: 32.2187, lng: -98.6695 },
  'De Leon': { lat: 32.1101, lng: -98.5370 },
  'Comanche': { lat: 31.8968, lng: -98.6020 },
  'Dublin': { lat: 32.0868, lng: -98.3420 },
  'Hurst': { lat: 32.8235, lng: -97.1706 },
  'Bedford': { lat: 32.8440, lng: -97.1431 },
  'Colleyville': { lat: 32.9093, lng: -97.1550 },
  'Southlake': { lat: 32.9412, lng: -97.1342 },
  'Westlake': { lat: 32.9915, lng: -97.1959 },
  'Roanoke': { lat: 33.0040, lng: -97.2267 },
  'Trophy Club': { lat: 33.0079, lng: -97.1834 },
  'Haslet': { lat: 32.9724, lng: -97.3392 },
  'Saginaw': { lat: 32.8618, lng: -97.3697 },
  'Azle': { lat: 32.8954, lng: -97.5453 },
  'Springtown': { lat: 32.9668, lng: -97.6831 },
  'Boyd': { lat: 33.0857, lng: -97.5678 },
  'Rhome': { lat: 33.0551, lng: -97.4706 },
  'Newark': { lat: 33.0115, lng: -97.4864 },
  'Aurora': { lat: 33.0590, lng: -97.5156 },
  'Alvord': { lat: 33.3568, lng: -97.6928 },
  'Sunset': { lat: 33.4507, lng: -97.7678 },
  'Chico': { lat: 33.2951, lng: -97.8042 },
  'Poolville': { lat: 32.9793, lng: -97.7470 },
  'Palo Pinto': { lat: 32.7593, lng: -98.2973 },
  'Mineral Wells': { lat: 32.8085, lng: -98.1128 },
  'Millsap': { lat: 32.7551, lng: -98.0145 },
  'Aledo': { lat: 32.6968, lng: -97.6025 },
  'Willow Park': { lat: 32.7582, lng: -97.6489 },
  'Annetta': { lat: 32.7088, lng: -97.6731 },
  'Hudson Oaks': { lat: 32.7432, lng: -97.6789 },
  'Weatherford': { lat: 32.7593, lng: -97.7970 },
  'Granbury': { lat: 32.4421, lng: -97.7947 },
  'Cresson': { lat: 32.5290, lng: -97.6103 },
  'Godley': { lat: 32.4490, lng: -97.5281 },
  'Joshua': { lat: 32.4615, lng: -97.3881 },
  'Burleson': { lat: 32.5421, lng: -97.3209 },
  'Crowley': { lat: 32.5793, lng: -97.3628 },
  'Forest Hill': { lat: 32.6710, lng: -97.2697 },
  'Everman': { lat: 32.6318, lng: -97.2939 },
  'Kennedale': { lat: 32.6468, lng: -97.2267 },
  'Mansfield': { lat: 32.5632, lng: -97.1417 },
  'Venus': { lat: 32.4307, lng: -97.1017 },
  'Alvarado': { lat: 32.4065, lng: -97.2103 },
  'Keene': { lat: 32.3968, lng: -97.3267 },
  'Cleburne': { lat: 32.3476, lng: -97.3867 },
  'Rio Vista': { lat: 32.2343, lng: -97.3728 },
  'Covington': { lat: 32.1793, lng: -97.2606 },
  'Itasca': { lat: 32.1593, lng: -97.1492 },
  'Hillsboro': { lat: 32.0107, lng: -97.1281 },
  'Whitney': { lat: 31.9507, lng: -97.3181 },
  'Clifton': { lat: 31.7807, lng: -97.5439 },
  'Meridian': { lat: 31.9232, lng: -97.6598 },
  'Walnut Springs': { lat: 32.0618, lng: -97.7542 },
  'Morgan': { lat: 31.9971, lng: -97.6131 },
  'Blum': { lat: 32.1540, lng: -97.4039 },
  'Kopperl': { lat: 32.1679, lng: -97.4531 },
  'Somerville': { lat: 30.3435, lng: -96.5261 },
  'Caldwell': { lat: 30.5327, lng: -96.6930 },
  'Hearne': { lat: 30.8788, lng: -96.5941 },
  'Franklin': { lat: 31.0254, lng: -96.4856 },
  'Centerville': { lat: 31.2596, lng: -95.9744 },
  'Madisonville': { lat: 30.9496, lng: -95.9116 },
  'Normangee': { lat: 30.9916, lng: -96.1144 },
  'Jewett': { lat: 31.3624, lng: -96.1461 },
  'Buffalo': { lat: 31.4599, lng: -96.1058 },
  'Fairfield': { lat: 31.7266, lng: -96.1653 },
  'Teague': { lat: 31.6254, lng: -96.2847 },
  'Wortham': { lat: 31.7901, lng: -96.4631 },
  'Mexia': { lat: 31.6799, lng: -96.4889 },
  'Groesbeck': { lat: 31.5254, lng: -96.5347 },
  'Kosse': { lat: 31.3099, lng: -96.6347 },
  'Thornton': { lat: 31.4049, lng: -96.5700 },
  'Marlin': { lat: 31.3071, lng: -96.8978 },
  'Lott': { lat: 31.2027, lng: -96.9361 },
  'Rosebud': { lat: 31.0777, lng: -96.9783 },
  'Karnack': { lat: 32.6829, lng: -94.1749 },
  'Carthage': { lat: 32.1615, lng: -94.3391 },
  'Beckville': { lat: 32.2276, lng: -94.4577 },
  'Elysian Fields': { lat: 32.4221, lng: -94.2674 },
  'Waskom': { lat: 32.4849, lng: -94.0538 },
  'Scottsville': { lat: 32.3343, lng: -94.2227 },
  'Karnack': { lat: 32.6829, lng: -94.1749 },
  'Uncertain': { lat: 32.7115, lng: -94.1705 },
  'Harleton': { lat: 32.5410, lng: -94.6016 },
  'Tatum': { lat: 32.3282, lng: -94.5160 },
  'Gladewater': { lat: 32.5368, lng: -94.9427 },
  'Big Sandy': { lat: 32.5857, lng: -95.1116 },
  'Gilmer': { lat: 32.7268, lng: -94.9427 },
  'Ore City': { lat: 32.7996, lng: -94.7116 },
  'Daingerfield': { lat: 32.8940, lng: -94.7216 },
  'Lone Star': { lat: 32.9457, lng: -94.7066 },
  'Hughes Springs': { lat: 32.9988, lng: -94.6327 },
  'Avinger': { lat: 32.9235, lng: -94.5249 },
  'Linden': { lat: 32.9376, lng: -94.3632 },
  'Marietta': { lat: 32.9718, lng: -94.5360 },
  'Karnack': { lat: 32.6829, lng: -94.1749 },
  'Jefferson': { lat: 32.7571, lng: -94.3449 },
  'Zapata': { lat: 26.9042, lng: -99.2714 },
  'Laredo': { lat: 27.5306, lng: -99.4803 },
  'Hebbronville': { lat: 27.3061, lng: -98.6725 },
  'Falfurrias': { lat: 27.2281, lng: -98.1442 },
  'Premont': { lat: 27.3631, lng: -98.1186 },
  'Beeville': { lat: 28.4086, lng: -97.7439 },
  'Goliad': { lat: 28.6689, lng: -97.3881 },
  'Cuero': { lat: 29.0872, lng: -97.2897 },
  'Yoakum': { lat: 29.2880, lng: -97.1511 },
  'Gonzales': { lat: 29.5019, lng: -97.4517 },
  'Nixon': { lat: 29.2669, lng: -97.7597 },
  'Stockdale': { lat: 29.2358, lng: -97.9619 },
  'Poth': { lat: 29.0636, lng: -98.0858 },
  'Karnes City': { lat: 28.8853, lng: -97.9006 },
  'Kenedy': { lat: 28.8169, lng: -97.8481 },
  'Runge': { lat: 28.8886, lng: -97.7122 },
  'Falls City': { lat: 28.9661, lng: -97.9383 },
  'Hobson': { lat: 28.9247, lng: -97.6403 },
  'Pandora': { lat: 28.7697, lng: -97.7928 },
  'Ecleto': { lat: 28.9869, lng: -97.8269 },
  'Smiley': { lat: 29.2780, lng: -97.6347 },
  'Waelder': { lat: 29.6930, lng: -97.2997 },
  'Flatonia': { lat: 29.6883, lng: -97.1086 },
  'Moulton': { lat: 29.5741, lng: -97.1408 },
  'Shiner': { lat: 29.4308, lng: -97.1708 },
  'Hallettsville': { lat: 29.4458, lng: -96.9456 },
  'Schulenburg': { lat: 29.6808, lng: -96.9064 },
  'Weimar': { lat: 29.7011, lng: -96.7686 },
  'Columbus': { lat: 29.7069, lng: -96.5403 },
  'Eagle Lake': { lat: 29.5894, lng: -96.3342 },
  'Sealy': { lat: 29.7805, lng: -96.1586 },
  'Brookshire': { lat: 29.7902, lng: -95.9622 },
  'Pattison': { lat: 29.8230, lng: -95.9633 },
  'Katy': { lat: 29.7858, lng: -95.8244 },
  'Waller': { lat: 30.0688, lng: -95.9269 },
  'Hempstead': { lat: 30.0977, lng: -96.0789 },
  'Prairie View': { lat: 30.0944, lng: -95.9897 },
  'Pinehurst': { lat: 30.1688, lng: -95.6897 },
  'Magnolia': { lat: 30.2127, lng: -95.7408 },
  'Tomball': { lat: 30.0972, lng: -95.6161 },
  'Spring': { lat: 30.0799, lng: -95.4172 },
  'The Woodlands': { lat: 30.1588, lng: -95.4894 },
  'Huntsville': { lat: 30.7235, lng: -95.5508 },
  'New Waverly': { lat: 30.5413, lng: -95.4855 },
  'Willis': { lat: 30.4266, lng: -95.4780 },
  'Montgomery': { lat: 30.3966, lng: -95.6966 },
  'Dobbin': { lat: 30.3660, lng: -95.6408 },
  'Plantersville': { lat: 30.2780, lng: -95.8480 },
  'Navasota': { lat: 30.3880, lng: -96.0878 },
  'Anderson': { lat: 30.4894, lng: -95.9697 },
  'Bedias': { lat: 30.7549, lng: -95.9408 },
  'Iola': { lat: 30.7302, lng: -96.0950 },
  'Madisonville': { lat: 30.9496, lng: -95.9116 },
  'Midway': { lat: 30.9938, lng: -95.7186 },
  'Crockett': { lat: 31.3182, lng: -95.4558 },
  'Lovelady': { lat: 31.1227, lng: -95.4441 },
  'Grapeland': { lat: 31.4941, lng: -95.4719 },
  'Elkhart': { lat: 31.6254, lng: -95.5819 },
  'Weches': { lat: 31.6149, lng: -95.3169 },
  'Rusk': { lat: 31.7966, lng: -95.1497 },
  'Mount Enterprise': { lat: 31.8966, lng: -95.0375 },
  'Laneville': { lat: 31.8232, lng: -94.9505 },
  'Carthage': { lat: 32.1615, lng: -94.3391 },
  'Panola': { lat: 32.0110, lng: -94.3410 },
  'Gary': { lat: 32.0299, lng: -94.3377 },
  'De Berry': { lat: 32.0596, lng: -94.2866 },
  'Timpson': { lat: 31.9071, lng: -94.3966 },
  'Tenaha': { lat: 31.9388, lng: -94.2491 },
  'Joaquin': { lat: 31.9782, lng: -94.0441 },
  'Logansport': { lat: 31.9638, lng: -94.0016 },
  'Mansfield': { lat: 31.9710, lng: -93.9688 },
  'Milam': { lat: 31.4724, lng: -93.8374 },
  'Hemphill': { lat: 31.3416, lng: -93.8513 },
  'Pineland': { lat: 31.2496, lng: -93.9752 },
  'Bronson': { lat: 31.3649, lng: -93.8024 },
  'Shelbyville': { lat: 31.8274, lng: -94.0775 },
  'Center': { lat: 31.7949, lng: -94.1791 },
  'Timpson': { lat: 31.9071, lng: -94.3966 },
  'Marshall': { lat: 32.5446, lng: -94.3675 },
  'Hallsville': { lat: 32.5057, lng: -94.5738 },
  'Tatum': { lat: 32.3282, lng: -94.5160 },
  'Longview': { lat: 32.5007, lng: -94.7405 },
  'Kilgore': { lat: 32.3865, lng: -94.8758 },
  'Overton': { lat: 32.2779, lng: -94.9774 },
  'Arp': { lat: 32.2285, lng: -95.0572 },
  'Tyler': { lat: 32.3513, lng: -95.3011 },
  'Whitehouse': { lat: 32.2282, lng: -95.2191 },
  'Bullard': { lat: 32.1382, lng: -95.3169 },
  'Flint': { lat: 32.0227, lng: -95.3636 },
  'Gresham': { lat: 32.0593, lng: -95.3000 },
  'Troup': { lat: 32.1432, lng: -95.1105 },
  'New London': { lat: 32.2118, lng: -95.0208 },
  'Joinerville': { lat: 32.1885, lng: -94.8055 },
  'Henderson': { lat: 32.1532, lng: -94.7997 },
  'Laird Hill': { lat: 32.1496, lng: -94.7324 },
  'Minden': { lat: 32.4965, lng: -94.6291 },
  'Beckville': { lat: 32.2276, lng: -94.4577 },
  'DeBerry': { lat: 32.0596, lng: -94.2866 },
  'Carthage': { lat: 32.1615, lng: -94.3391 },
  'Panola': { lat: 32.0110, lng: -94.3410 },
  'Gary': { lat: 32.0299, lng: -94.3377 },
  'De Berry': { lat: 32.0596, lng: -94.2866 },
  'Timpson': { lat: 31.9071, lng: -94.3966 },
  'Tenaha': { lat: 31.9388, lng: -94.2491 },
  'Joaquin': { lat: 31.9782, lng: -94.0441 },
  'Logansport': { lat: 31.9638, lng: -94.0016 },
  'Mansfield': { lat: 31.9710, lng: -93.9688 },
  'Milam': { lat: 31.4724, lng: -93.8374 },
  'Hemphill': { lat: 31.3416, lng: -93.8513 },
  'Pineland': { lat: 31.2496, lng: -93.9752 },
  'Bronson': { lat: 31.3649, lng: -93.8024 },
  'Shelbyville': { lat: 31.8274, lng: -94.0775 },
  'Center': { lat: 31.7949, lng: -94.1791 },
  'Timpson': { lat: 31.9071, lng: -94.3966 },
  'Marshall': { lat: 32.5446, lng: -94.3675 },
  'Hallsville': { lat: 32.5057, lng: -94.5738 },
  'Tatum': { lat: 32.3282, lng: -94.5160 },
  'Longview': { lat: 32.5007, lng: -94.7405 },
  'Kilgore': { lat: 32.3865, lng: -94.8758 },
  'Overton': { lat: 32.2779, lng: -94.9774 },
  'Arp': { lat: 32.2285, lng: -95.0572 },
  'Tyler': { lat: 32.3513, lng: -95.3011 },
  'Whitehouse': { lat: 32.2282, lng: -95.2191 },
  'Bullard': { lat: 32.1382, lng: -95.3169 },
  'Flint': { lat: 32.0227, lng: -95.3636 },
  'Gresham': { lat: 32.0593, lng: -95.3000 },
  'Troup': { lat: 32.1432, lng: -95.1105 },
  'New London': { lat: 32.2118, lng: -95.0208 },
  'Joinerville': { lat: 32.1885, lng: -94.8055 },
  'Henderson': { lat: 32.1532, lng: -94.7997 },
  'Laird Hill': { lat: 32.1496, lng: -94.7324 },
  'Minden': { lat: 32.4965, lng: -94.6291 },
  'Beckville': { lat: 32.2276, lng: -94.4577 },
  'DeBerry': { lat: 32.0596, lng: -94.2866 }
};

async function addTexasCoordinates() {
  console.log('🤠 ADDING TEXAS COORDINATES FOR MAP DISPLAY');
  
  // Get all Texas facilities without coordinates
  const texasQuery = `
    SELECT id, name, city, county, state, latitude, longitude
    FROM communities 
    WHERE state = 'TX' 
    AND (latitude IS NULL OR longitude IS NULL)
    ORDER BY county, city, name
  `;
  
  const texasResult = await pool.query(texasQuery);
  const texasFacilities = texasResult.rows;
  
  console.log(`🏜️ Found ${texasFacilities.length} Texas facilities needing coordinates`);
  
  let updatedCount = 0;
  let skippedCount = 0;
  
  for (const facility of texasFacilities) {
    const coordinates = TEXAS_COORDINATES[facility.city];
    
    if (coordinates) {
      // Add small random offset to avoid overlapping markers
      const latOffset = (Math.random() - 0.5) * 0.02; // ~1 mile variance
      const lngOffset = (Math.random() - 0.5) * 0.02;
      
      const finalLat = coordinates.lat + latOffset;
      const finalLng = coordinates.lng + lngOffset;
      
      try {
        const updateQuery = `
          UPDATE communities 
          SET latitude = $1, longitude = $2
          WHERE id = $3
        `;
        
        await pool.query(updateQuery, [finalLat, finalLng, facility.id]);
        
        updatedCount++;
        
        if (updatedCount % 50 === 0) {
          console.log(`✅ Updated ${updatedCount} Texas facilities...`);
        }
        
      } catch (error) {
        console.error(`❌ Failed to update ${facility.name}: ${error.message}`);
      }
    } else {
      skippedCount++;
      if (skippedCount <= 10) {
        console.log(`⚠️  No coordinates found for ${facility.city}`);
      }
    }
  }
  
  console.log(`\n🎯 TEXAS COORDINATES UPDATE COMPLETE:`);
  console.log(`   Updated: ${updatedCount} facilities`);
  console.log(`   Skipped: ${skippedCount} facilities (no coordinates)`);
  console.log(`   Total processed: ${texasFacilities.length}`);
  
  // Verify coordinates were added
  const verifyQuery = `
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as with_coordinates
    FROM communities 
    WHERE state = 'TX'
  `;
  
  const verifyResult = await pool.query(verifyQuery);
  const stats = verifyResult.rows[0];
  
  console.log(`\n🗺️ TEXAS MAP VERIFICATION:`);
  console.log(`   Total facilities: ${stats.total}`);
  console.log(`   With coordinates: ${stats.with_coordinates}`);
  console.log(`   Coverage: ${((stats.with_coordinates / stats.total) * 100).toFixed(1)}%`);
  
  if (stats.with_coordinates > 0) {
    console.log(`\n🤠 SUCCESS: Texas facilities now visible on map!`);
  }
  
  await pool.end();
}

if (require.main === module) {
  addTexasCoordinates().catch(console.error);
}

module.exports = { addTexasCoordinates };