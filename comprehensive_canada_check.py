#!/usr/bin/env python3
"""
Comprehensive Canadian Coverage Analysis
Ensures we have complete coverage of all major Canadian population centers
"""

import psycopg2
import os
from datetime import datetime

# Major Canadian cities by population (2024 estimates)
MAJOR_CANADIAN_CITIES = {
    'ON': [
        ('Toronto', 2800000),
        ('Ottawa', 1000000),
        ('Mississauga', 750000),
        ('Brampton', 650000),
        ('Hamilton', 580000),
        ('London', 420000),
        ('Markham', 340000),
        ('Vaughan', 320000),
        ('Kitchener', 260000),
        ('Windsor', 230000),
        ('Richmond Hill', 200000),
        ('Oakville', 195000),
        ('Burlington', 185000),
        ('Greater Sudbury', 165000),
        ('Oshawa', 160000),
        ('Barrie', 150000),
        ('St. Catharines', 135000),
        ('Cambridge', 130000),
        ('Kingston', 125000),
        ('Guelph', 120000),
        ('Thunder Bay', 110000),
        ('Waterloo', 105000)
    ],
    'QC': [
        ('Montreal', 1760000),
        ('Quebec City', 550000),
        ('Laval', 440000),
        ('Gatineau', 290000),
        ('Longueuil', 250000),
        ('Sherbrooke', 170000),
        ('Saguenay', 145000),
        ('Levis', 145000),
        ('Trois-Rivieres', 135000),
        ('Terrebonne', 115000),
        ('Saint-Jean-sur-Richelieu', 95000)
    ],
    'BC': [
        ('Vancouver', 680000),
        ('Surrey', 570000),
        ('Burnaby', 250000),
        ('Richmond', 210000),
        ('Coquitlam', 150000),
        ('Langley', 130000),
        ('Delta', 110000),
        ('Abbotsford', 155000),
        ('Kelowna', 145000),
        ('Saanich', 120000),
        ('Victoria', 95000),
        ('Kamloops', 95000),
        ('Nanaimo', 90000)
    ],
    'AB': [
        ('Calgary', 1340000),
        ('Edmonton', 1010000),
        ('Red Deer', 105000),
        ('Lethbridge', 100000),
        ('Wood Buffalo', 70000),
        ('Medicine Hat', 65000),
        ('Grande Prairie', 65000),
        ('Airdrie', 75000)
    ],
    'MB': [
        ('Winnipeg', 750000),
        ('Brandon', 50000),
        ('Steinbach', 17000),
        ('Thompson', 13000)
    ],
    'SK': [
        ('Saskatoon', 270000),
        ('Regina', 230000),
        ('Prince Albert', 36000),
        ('Moose Jaw', 34000)
    ],
    'NS': [
        ('Halifax', 440000),
        ('Cape Breton', 95000),
        ('Truro', 12000),
        ('New Glasgow', 9000),
        ('Glace Bay', 19000)
    ],
    'NB': [
        ('Moncton', 80000),
        ('Saint John', 70000),
        ('Fredericton', 60000),
        ('Dieppe', 28000),
        ('Miramichi', 17000)
    ],
    'NL': [
        ("St. John's", 115000),
        ('Mount Pearl', 23000),
        ('Corner Brook', 20000),
        ('Conception Bay South', 27000),
        ('Grand Falls-Windsor', 14000)
    ],
    'PE': [
        ('Charlottetown', 38000),
        ('Summerside', 16000),
        ('Stratford', 10000),
        ('Cornwall', 6000)
    ],
    'NT': [
        ('Yellowknife', 20000),
        ('Hay River', 3500),
        ('Inuvik', 3200),
        ('Fort Smith', 2500)
    ],
    'YT': [
        ('Whitehorse', 28000),
        ('Dawson City', 2000),
        ('Watson Lake', 800)
    ],
    'NU': [
        ('Iqaluit', 8000),
        ('Rankin Inlet', 3000),
        ('Arviat', 3000),
        ('Baker Lake', 2000)
    ]
}

def check_coverage():
    """Check comprehensive Canadian coverage"""
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    print("🍁 COMPREHENSIVE CANADIAN COVERAGE ANALYSIS")
    print("=" * 60)
    
    # Get current coverage
    cur.execute("""
        SELECT state, city, COUNT(*) as count
        FROM communities
        WHERE country = 'CA'
        GROUP BY state, city
    """)
    
    current_coverage = {}
    for state, city, count in cur.fetchall():
        if state not in current_coverage:
            current_coverage[state] = {}
        current_coverage[state][city.lower()] = count
    
    # Analyze coverage gaps
    missing_cities = []
    covered_cities = []
    total_population_covered = 0
    total_population = 0
    
    for province, cities in MAJOR_CANADIAN_CITIES.items():
        print(f"\n📍 {province} Coverage:")
        province_coverage = current_coverage.get(province, {})
        
        for city_name, population in cities:
            total_population += population
            # Check various name formats
            found = False
            for variant in [city_name.lower(), city_name.replace(' ', '').lower(), 
                          city_name.replace('-', ' ').lower()]:
                if variant in province_coverage:
                    count = province_coverage[variant]
                    covered_cities.append((province, city_name, population, count))
                    total_population_covered += population
                    print(f"  ✓ {city_name} (pop: {population:,}) - {count} communities")
                    found = True
                    break
            
            if not found:
                missing_cities.append((province, city_name, population))
                print(f"  ❌ {city_name} (pop: {population:,}) - MISSING")
    
    # Summary statistics
    print("\n" + "=" * 60)
    print("📊 COVERAGE SUMMARY:")
    print(f"Total major cities checked: {len(covered_cities) + len(missing_cities)}")
    print(f"Cities with coverage: {len(covered_cities)}")
    print(f"Cities missing: {len(missing_cities)}")
    print(f"Population coverage: {total_population_covered:,} / {total_population:,} ({total_population_covered*100/total_population:.1f}%)")
    
    if missing_cities:
        print("\n⚠️ MISSING MAJOR CITIES (Need to add):")
        for province, city, pop in sorted(missing_cities, key=lambda x: x[2], reverse=True)[:20]:
            print(f"  - {city}, {province} (population: {pop:,})")
    
    # Get total counts
    cur.execute("SELECT COUNT(*) FROM communities WHERE country = 'CA'")
    total_ca = cur.fetchone()[0]
    
    print(f"\n✅ Total Canadian communities in database: {total_ca:,}")
    
    # Provincial distribution
    print("\n📍 Provincial Distribution:")
    cur.execute("""
        SELECT state, COUNT(*) as count
        FROM communities
        WHERE country = 'CA'
        GROUP BY state
        ORDER BY count DESC
    """)
    
    for state, count in cur.fetchall():
        print(f"  {state}: {count} communities")
    
    cur.close()
    conn.close()
    
    return len(missing_cities) == 0

if __name__ == "__main__":
    is_comprehensive = check_coverage()
    
    if is_comprehensive:
        print("\n🎉 COMPREHENSIVE COVERAGE ACHIEVED!")
        print("All major Canadian population centers are represented.")
    else:
        print("\n⚠️ COVERAGE GAPS IDENTIFIED")
        print("Additional cities need to be added for truly comprehensive coverage.")