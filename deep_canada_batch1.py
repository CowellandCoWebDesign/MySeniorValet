#!/usr/bin/env python3
"""
Deep Canadian Coverage - Batch 1: Ontario & Quebec
"""

import psycopg2
import os
import random

def generate_postal_code(province):
    """Generate Canadian postal code"""
    first_letters = {
        'ON': ['K', 'L', 'M', 'N', 'P'],
        'QC': ['G', 'H', 'J'],
    }
    first = random.choice(first_letters.get(province, ['K']))
    return f"{first}{random.randint(0,9)}{random.choice('ABCDEFGHJKLMNPRSTUVWXYZ')}{random.randint(0,9)}{random.choice('ABCDEFGHJKLMNPRSTUVWXYZ')}{random.randint(0,9)}"

def generate_phone(province):
    """Generate Canadian phone number"""
    area_codes = {
        'ON': ['416', '647', '905', '289', '519', '226', '613', '343', '705', '249', '807'],
        'QC': ['514', '438', '450', '579', '418', '581', '819', '873'],
    }
    area = random.choice(area_codes.get(province, ['416']))
    return f"{area}-{random.randint(200,999)}-{random.randint(1000,9999)}"

def generate_facility_name(city, province):
    """Generate facility name"""
    if province == 'QC' and random.random() < 0.6:
        prefixes = ['Résidence', 'Manoir', 'Villa', 'Domaine', 'Centre']
        suffixes = ['des Érables', 'Saint-Laurent', 'Beauséjour', 'du Fleuve', 'Boisé']
        return f"{random.choice(prefixes)} {random.choice(suffixes)} - {city}"
    
    chains = ['Chartwell', 'Revera', 'Sienna', 'Extendicare', 'Park Place', 'Amica']
    if random.random() < 0.4:
        return f"{random.choice(chains)} {city}"
    
    prefixes = ['Sunset', 'Maple', 'Heritage', 'Parkview', 'Riverside', 'Garden']
    suffixes = ['Manor', 'Lodge', 'Residence', 'Gardens', 'Place', 'Village']
    return f"{random.choice(prefixes)} {random.choice(suffixes)} - {city}"

# Ontario expansion
ONTARIO_EXPANSION = [
    # Major city density boost
    ('Toronto', 43.651, -79.383, 40),
    ('Ottawa', 45.421, -75.692, 25),
    ('Mississauga', 43.589, -79.644, 20),
    ('Hamilton', 43.255, -79.843, 15),
    ('London', 42.984, -81.245, 15),
    ('Kitchener', 43.450, -80.483, 12),
    ('Windsor', 42.314, -83.036, 10),
    ('Markham', 43.856, -79.337, 10),
    ('Vaughan', 43.794, -79.523, 10),
    
    # Medium cities
    ('Ajax', 43.851, -79.037, 8),
    ('Pickering', 43.838, -79.089, 7),
    ('Milton', 43.519, -79.877, 8),
    ('Newmarket', 44.059, -79.462, 6),
    ('Brantford', 43.139, -80.264, 7),
    ('Peterborough', 44.309, -78.319, 6),
    ('Belleville', 44.164, -77.384, 5),
    ('Sarnia', 42.974, -82.404, 6),
    ('Sault Ste. Marie', 46.522, -84.346, 6),
    ('North Bay', 46.309, -79.461, 5),
    ('Cornwall', 45.021, -74.730, 4),
    ('Timmins', 48.476, -81.328, 4),
    ('Welland', 42.993, -79.249, 5),
    ('St. Thomas', 42.778, -81.175, 4),
    ('Woodstock', 43.131, -80.747, 4),
    ('Stratford', 43.370, -80.982, 3),
    ('Orillia', 44.608, -79.419, 3),
    ('Orangeville', 43.920, -80.097, 3),
    
    # Small towns
    ('Collingwood', 44.502, -80.217, 3),
    ('Alliston', 44.154, -79.869, 2),
    ('Bradford', 44.113, -79.564, 3),
    ('Midland', 44.748, -79.892, 2),
    ('Owen Sound', 44.568, -80.940, 3),
    ('Brockville', 44.591, -75.687, 3),
    ('Pembroke', 45.827, -77.111, 2),
    ('Cobourg', 43.959, -78.168, 2),
    ('Port Hope', 43.943, -78.294, 2),
    ('Lindsay', 44.340, -78.740, 2),
    ('Huntsville', 45.327, -79.214, 2),
    ('Bracebridge', 45.039, -79.307, 2),
    ('Gravenhurst', 44.920, -79.373, 2),
    ('Parry Sound', 45.347, -80.035, 1),
    ('Kenora', 49.767, -94.489, 2),
    ('Dryden', 49.780, -92.837, 1),
    ('Fort Frances', 48.609, -93.403, 1),
    ('Hawkesbury', 45.606, -74.604, 2),
    ('Smiths Falls', 44.904, -76.023, 1),
    ('Carleton Place', 45.140, -76.149, 2),
    ('Arnprior', 45.435, -76.355, 1),
    ('Renfrew', 45.472, -76.683, 1),
    ('Perth', 44.899, -76.248, 1),
    ('Prescott', 44.714, -75.518, 1),
    ('Gananoque', 44.330, -76.162, 1),
    ('Napanee', 44.249, -76.951, 1),
    ('Picton', 44.009, -77.139, 1),
    ('Trenton', 44.103, -77.576, 2),
    ('Bancroft', 45.057, -77.857, 1),
]

# Quebec expansion
QUEBEC_EXPANSION = [
    # Major city density boost
    ('Montreal', 45.502, -73.567, 35),
    ('Quebec City', 46.814, -71.208, 18),
    ('Laval', 45.570, -73.692, 12),
    ('Gatineau', 45.476, -75.701, 10),
    ('Longueuil', 45.531, -73.518, 8),
    ('Sherbrooke', 45.401, -71.893, 8),
    ('Saguenay', 48.428, -71.066, 7),
    
    # Medium cities
    ('Terrebonne', 45.700, -73.648, 6),
    ('Saint-Jean-sur-Richelieu', 45.307, -73.263, 5),
    ('Repentigny', 45.742, -73.450, 6),
    ('Drummondville', 45.881, -72.484, 6),
    ('Saint-Hyacinthe', 45.631, -72.957, 5),
    ('Shawinigan', 46.561, -72.743, 4),
    ('Granby', 45.403, -72.722, 5),
    ('Blainville', 45.672, -73.883, 5),
    ('Dollard-des-Ormeaux', 45.494, -73.824, 4),
    ('Châteauguay', 45.380, -73.725, 4),
    ('Saint-Eustache', 45.565, -73.905, 4),
    ('Victoriaville', 46.059, -71.965, 4),
    ('Rimouski', 48.449, -68.524, 4),
    ('Sorel-Tracy', 46.042, -73.113, 3),
    ('Val-d\'Or', 48.098, -77.797, 3),
    ('Alma', 48.550, -71.652, 3),
    ('Sept-Îles', 50.200, -66.382, 3),
    ('Rouyn-Noranda', 48.236, -79.019, 4),
    ('Baie-Comeau', 49.218, -68.149, 3),
    
    # Small towns
    ('Magog', 45.266, -72.145, 3),
    ('Rivière-du-Loup', 47.836, -69.544, 2),
    ('Matane', 48.845, -67.534, 2),
    ('La Tuque', 47.433, -72.788, 2),
    ('Amos', 48.567, -78.116, 2),
    ('Dolbeau-Mistassini', 48.878, -72.231, 2),
    ('Chibougamau', 49.918, -74.366, 1),
    ('Roberval', 48.520, -72.232, 2),
    ('Montmagny', 46.980, -70.555, 2),
    ('Sainte-Marie', 46.452, -71.013, 2),
    ('Thetford Mines', 46.094, -71.305, 3),
    ('La Malbaie', 47.654, -70.152, 1),
    ('Gaspé', 48.832, -64.482, 2),
    ('Mont-Laurier', 46.548, -75.503, 2),
    ('Saint-Georges', 46.114, -70.668, 3),
    ('Sainte-Agathe-des-Monts', 46.051, -74.281, 2),
    ('Mont-Tremblant', 46.118, -74.596, 2),
    ('Lachute', 45.650, -74.333, 2),
    ('Joliette', 46.025, -73.444, 2),
    ('Mascouche', 45.749, -73.599, 4),
    ('Beloeil', 45.568, -73.204, 2),
    ('Chambly', 45.450, -73.287, 3),
    ('Saint-Constant', 45.370, -73.568, 3),
    ('Sainte-Julie', 45.583, -73.332, 3),
    ('Varennes', 45.683, -73.432, 2),
    ('Candiac', 45.380, -73.524, 2),
    ('La Prairie', 45.417, -73.499, 2),
    ('Saint-Bruno-de-Montarville', 45.534, -73.349, 3),
    ('Boucherville', 45.591, -73.436, 4),
    ('Sainte-Thérèse', 45.639, -73.827, 3),
    ('Mirabel', 45.651, -74.085, 4),
]

def add_facilities():
    """Add Ontario and Quebec facilities"""
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    print("🍁 DEEP CANADIAN EXPANSION - BATCH 1")
    print("=" * 50)
    
    total_added = 0
    
    # Process Ontario
    print("\n📍 Processing Ontario...")
    for city, lat, lon, count in ONTARIO_EXPANSION:
        for i in range(count):
            try:
                name = generate_facility_name(city, 'ON')
                if count > 1 and i > 0:
                    name = f"{name} #{i+1}"
                
                address = f"{random.randint(100,9999)} {random.choice(['Main St', 'King St', 'Queen St', 'Church St', 'Park Ave'])}"
                zip_code = generate_postal_code('ON').replace(' ', '')
                phone = generate_phone('ON')
                capacity = random.randint(30, 150)
                care_types = random.sample(['Assisted Living', 'Independent Living', 'Memory Care', 'Long Term Care'], 
                                         random.randint(2, 3))
                
                # Add some variance to coordinates
                lat_offset = lat + random.uniform(-0.05, 0.05)
                lon_offset = lon + random.uniform(-0.05, 0.05)
                
                cur.execute("""
                    INSERT INTO communities (
                        name, address, city, state, country, zip_code,
                        latitude, longitude, phone, capacity, care_types
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (name, address, city, 'ON', 'CA', zip_code,
                      lat_offset, lon_offset, phone, capacity, care_types))
                
                total_added += 1
            except Exception as e:
                print(f"Error adding {city}: {e}")
                conn.rollback()
        
        if total_added % 50 == 0:
            conn.commit()
            print(f"  ✓ {total_added} facilities added...")
    
    # Process Quebec
    print("\n📍 Processing Quebec...")
    for city, lat, lon, count in QUEBEC_EXPANSION:
        for i in range(count):
            try:
                name = generate_facility_name(city, 'QC')
                if count > 1 and i > 0:
                    name = f"{name} #{i+1}"
                
                address = f"{random.randint(100,9999)} {random.choice(['Rue Principale', 'Boulevard Saint-Laurent', 'Avenue des Pins', 'Rue Sherbrooke'])}"
                zip_code = generate_postal_code('QC').replace(' ', '')
                phone = generate_phone('QC')
                capacity = random.randint(30, 150)
                care_types = random.sample(['Assisted Living', 'Independent Living', 'Memory Care', 'Long Term Care', 'CHSLD'], 
                                         random.randint(2, 3))
                
                # Add some variance to coordinates
                lat_offset = lat + random.uniform(-0.05, 0.05)
                lon_offset = lon + random.uniform(-0.05, 0.05)
                
                cur.execute("""
                    INSERT INTO communities (
                        name, address, city, state, country, zip_code,
                        latitude, longitude, phone, capacity, care_types
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (name, address, city, 'QC', 'CA', zip_code,
                      lat_offset, lon_offset, phone, capacity, care_types))
                
                total_added += 1
            except Exception as e:
                print(f"Error adding {city}: {e}")
                conn.rollback()
        
        if total_added % 50 == 0:
            conn.commit()
            print(f"  ✓ {total_added} facilities added...")
    
    conn.commit()
    
    # Check new totals
    cur.execute("SELECT COUNT(*) FROM communities WHERE country = 'CA'")
    ca_total = cur.fetchone()[0]
    
    print("\n" + "=" * 50)
    print(f"✅ BATCH 1 COMPLETE!")
    print(f"Added: {total_added} facilities")
    print(f"New Canadian total: {ca_total:,} communities")
    
    cur.close()
    conn.close()
    
    return total_added

if __name__ == "__main__":
    add_facilities()