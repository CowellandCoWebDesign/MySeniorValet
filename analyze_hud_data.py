import csv

# Analyze HUD data to find CA, TX, HI facilities
ca_facilities = []
tx_facilities = []
hi_facilities = []
other_facilities = []

with open('hud_affordable_senior_housing.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        city = row['City'].upper() if row['City'] else ''
        county = row['County'].upper() if row['County'] else ''
        
        # California cities/counties
        ca_cities = ['LOS ANGELES', 'SAN FRANCISCO', 'SAN DIEGO', 'SACRAMENTO', 'REDDING', 'CHICO', 'PALM SPRINGS']
        ca_counties = ['LOS ANGELES', 'SAN FRANCISCO', 'ALAMEDA', 'SACRAMENTO', 'SHASTA', 'BUTTE', 'RIVERSIDE']
        
        # Texas cities/counties  
        tx_cities = ['HOUSTON', 'DALLAS', 'AUSTIN', 'SAN ANTONIO', 'FORT WORTH', 'EL PASO', 'TEXARKANA']
        tx_counties = ['HARRIS', 'DALLAS', 'TRAVIS', 'BEXAR', 'TARRANT', 'EL PASO']
        
        # Hawaii cities/counties
        hi_cities = ['HONOLULU', 'HILO', 'KAILUA', 'PEARL CITY', 'WAIPAHU', 'KANEOHE']
        hi_counties = ['HONOLULU', 'HAWAII', 'MAUI', 'KAUAI']
        
        if any(c in city for c in ca_cities) or any(c in county for c in ca_counties):
            ca_facilities.append(row)
        elif any(c in city for c in tx_cities) or any(c in county for c in tx_counties):
            tx_facilities.append(row)
        elif any(c in city for c in hi_cities) or any(c in county for c in hi_counties):
            hi_facilities.append(row)
        else:
            other_facilities.append(row)

print(f"California facilities: {len(ca_facilities)}")
print(f"Texas facilities: {len(tx_facilities)}")
print(f"Hawaii facilities: {len(hi_facilities)}")
print(f"Other facilities: {len(other_facilities)}")

# Show samples
if ca_facilities:
    print("\nCalifornia samples:")
    for f in ca_facilities[:3]:
        print(f"  - {f['Property_Name']}, {f['City']}, {f['County']}")

if tx_facilities:
    print("\nTexas samples:")
    for f in tx_facilities[:3]:
        print(f"  - {f['Property_Name']}, {f['City']}, {f['County']}")
        
if hi_facilities:
    print("\nHawaii samples:")
    for f in hi_facilities[:3]:
        print(f"  - {f['Property_Name']}, {f['City']}, {f['County']}")

# Save target state facilities
target_facilities = ca_facilities + tx_facilities + hi_facilities
print(f"\nTotal target state facilities: {len(target_facilities)}")

if target_facilities:
    with open('hud_target_states.csv', 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=target_facilities[0].keys())
        writer.writeheader()
        writer.writerows(target_facilities)
    print("Saved to hud_target_states.csv")