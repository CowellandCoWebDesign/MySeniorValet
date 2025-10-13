#!/usr/bin/env python3
"""Analyze Canadian coverage gaps by checking distribution across provinces and major cities"""

import psycopg2
import os
from collections import defaultdict

DATABASE_URL = os.environ.get('DATABASE_URL')

def analyze_coverage():
    """Analyze Canadian community coverage and identify gaps"""
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    print("CANADIAN COVERAGE ANALYSIS")
    print("=" * 60)
    
    # Get province distribution
    cur.execute("""
        SELECT state, COUNT(*) as count
        FROM communities 
        WHERE country = 'CA'
        GROUP BY state
        ORDER BY count DESC
    """)
    
    province_data = cur.fetchall()
    total_canadian = sum(count for _, count in province_data)
    
    print(f"\nTotal Canadian Communities: {total_canadian}")
    print("\nBy Province/Territory:")
    print("-" * 40)
    
    province_map = {
        'ON': 'Ontario', 'QC': 'Quebec', 'BC': 'British Columbia',
        'AB': 'Alberta', 'SK': 'Saskatchewan', 'MB': 'Manitoba',
        'NS': 'Nova Scotia', 'NB': 'New Brunswick', 'NL': 'Newfoundland',
        'PE': 'Prince Edward Island', 'YT': 'Yukon', 'NT': 'Northwest Territories',
        'NU': 'Nunavut'
    }
    
    for state, count in province_data:
        province_name = province_map.get(state, state)
        percentage = (count / total_canadian) * 100
        print(f"  {state:3} ({province_name:25}): {count:5} ({percentage:.1f}%)")
    
    # Check major cities coverage
    print("\n\nMAJOR CITIES COVERAGE:")
    print("-" * 40)
    
    major_cities = [
        # Ontario
        ('Toronto', 'ON'), ('Ottawa', 'ON'), ('Mississauga', 'ON'), 
        ('Brampton', 'ON'), ('Hamilton', 'ON'), ('London', 'ON'),
        ('Markham', 'ON'), ('Vaughan', 'ON'), ('Kitchener', 'ON'),
        ('Windsor', 'ON'), ('Richmond Hill', 'ON'), ('Oakville', 'ON'),
        
        # Quebec
        ('Montreal', 'QC'), ('Quebec City', 'QC'), ('Laval', 'QC'),
        ('Gatineau', 'QC'), ('Longueuil', 'QC'), ('Sherbrooke', 'QC'),
        ('Saguenay', 'QC'), ('Trois-Rivières', 'QC'),
        
        # British Columbia
        ('Vancouver', 'BC'), ('Surrey', 'BC'), ('Burnaby', 'BC'),
        ('Richmond', 'BC'), ('Coquitlam', 'BC'), ('Langley', 'BC'),
        ('Delta', 'BC'), ('Abbotsford', 'BC'), ('Kelowna', 'BC'),
        ('Victoria', 'BC'), ('Kamloops', 'BC'), ('Nanaimo', 'BC'),
        
        # Alberta
        ('Calgary', 'AB'), ('Edmonton', 'AB'), ('Red Deer', 'AB'),
        ('Lethbridge', 'AB'), ('Medicine Hat', 'AB'), ('Fort McMurray', 'AB'),
        
        # Other provinces
        ('Winnipeg', 'MB'), ('Regina', 'SK'), ('Saskatoon', 'SK'),
        ('Halifax', 'NS'), ('St. John\'s', 'NL'), ('Moncton', 'NB'),
        ('Fredericton', 'NB'), ('Charlottetown', 'PE'),
        ('Whitehorse', 'YT'), ('Yellowknife', 'NT'), ('Iqaluit', 'NU')
    ]
    
    city_coverage = defaultdict(int)
    missing_cities = []
    
    for city, province in major_cities:
        # Check multiple variations of city names
        cur.execute("""
            SELECT COUNT(*) 
            FROM communities 
            WHERE country = 'CA' 
            AND state = %s
            AND (
                LOWER(city) = LOWER(%s)
                OR LOWER(city) LIKE LOWER(%s)
                OR LOWER(city) LIKE LOWER(%s)
            )
        """, (province, city, f'{city}%', f'%{city}%'))
        
        count = cur.fetchone()[0]
        city_coverage[(city, province)] = count
        
        if count == 0:
            missing_cities.append((city, province))
    
    # Display cities with coverage
    print("\nCities WITH Coverage (Top 20):")
    sorted_cities = sorted(city_coverage.items(), key=lambda x: x[1], reverse=True)
    for (city, province), count in sorted_cities[:20]:
        if count > 0:
            print(f"  {city:20}, {province:2}: {count:3} communities")
    
    # Display cities without coverage
    if missing_cities:
        print("\n⚠️  CITIES WITH NO COVERAGE:")
        print("-" * 40)
        for city, province in missing_cities:
            print(f"  ❌ {city}, {province}")
    
    # Check for specific regions
    print("\n\nREGIONAL ANALYSIS:")
    print("-" * 40)
    
    # Check Northern territories
    cur.execute("""
        SELECT state, COUNT(*) 
        FROM communities 
        WHERE country = 'CA' 
        AND state IN ('YT', 'NT', 'NU')
        GROUP BY state
    """)
    
    northern = cur.fetchall()
    print("\nNorthern Territories:")
    for state, count in northern:
        print(f"  {state}: {count} communities")
    
    # Check Atlantic provinces
    cur.execute("""
        SELECT state, COUNT(*) 
        FROM communities 
        WHERE country = 'CA' 
        AND state IN ('NS', 'NB', 'NL', 'PE')
        GROUP BY state
    """)
    
    atlantic = cur.fetchall()
    print("\nAtlantic Provinces:")
    for state, count in atlantic:
        print(f"  {state}: {count} communities")
    
    # Check Prairie provinces
    cur.execute("""
        SELECT state, COUNT(*) 
        FROM communities 
        WHERE country = 'CA' 
        AND state IN ('AB', 'SK', 'MB')
        GROUP BY state
    """)
    
    prairie = cur.fetchall()
    print("\nPrairie Provinces:")
    for state, count in prairie:
        print(f"  {state}: {count} communities")
    
    # Summary recommendations
    print("\n\nCOVERAGE GAP SUMMARY:")
    print("=" * 60)
    
    if missing_cities:
        print(f"❌ {len(missing_cities)} major cities have NO coverage")
        print("\nPriority cities to add:")
        for city, province in missing_cities[:10]:
            print(f"  • {city}, {province}")
    else:
        print("✅ All major cities have coverage!")
    
    # Check for underrepresented provinces
    print("\n\nProvincial Coverage Quality:")
    for state, count in province_data:
        if count < 50:
            print(f"  ⚠️  {state} has only {count} communities - needs expansion")
        elif count < 100:
            print(f"  ⚠️  {state} has {count} communities - could use more coverage")
    
    cur.close()
    conn.close()

if __name__ == "__main__":
    analyze_coverage()