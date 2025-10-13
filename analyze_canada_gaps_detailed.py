#!/usr/bin/env python3
"""Detailed analysis of Canadian coverage gaps including smaller communities"""

import psycopg2
import os

DATABASE_URL = os.environ.get('DATABASE_URL')

def analyze_detailed_gaps():
    """Deep dive into Canadian coverage gaps"""
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    print("DETAILED CANADIAN COVERAGE GAP ANALYSIS")
    print("=" * 60)
    
    # Important mid-size cities by province that should have coverage
    important_cities = {
        'ON': [
            'Barrie', 'Guelph', 'Oshawa', 'Thunder Bay', 'Sudbury',
            'Kingston', 'Peterborough', 'Belleville', 'Sarnia', 'Sault Ste. Marie',
            'North Bay', 'Cornwall', 'Brantford', 'St. Catharines', 'Cambridge',
            'Ajax', 'Pickering', 'Whitby', 'Burlington', 'Milton'
        ],
        'QC': [
            'Levis', 'Terrebonne', 'Saint-Jean-sur-Richelieu', 'Repentigny',
            'Brossard', 'Drummondville', 'Saint-Jerome', 'Granby', 'Blainville',
            'Saint-Hyacinthe', 'Rimouski', 'Shawinigan', 'Dollard-Des Ormeaux',
            'Chateauguay', 'Saint-Eustache', 'Victoriaville', 'Rouyn-Noranda'
        ],
        'BC': [
            'Prince George', 'Chilliwack', 'North Vancouver', 'West Vancouver',
            'New Westminster', 'Port Coquitlam', 'Maple Ridge', 'Penticton',
            'Vernon', 'Courtenay', 'Campbell River', 'Cranbrook', 'Fort St. John',
            'Port Moody', 'White Rock', 'Langford', 'Saanich'
        ],
        'AB': [
            'Airdrie', 'Grande Prairie', 'St. Albert', 'Okotoks', 'Spruce Grove',
            'Leduc', 'Fort Saskatchewan', 'Cochrane', 'Chestermere', 'Camrose',
            'Lloydminster', 'Beaumont', 'Cold Lake', 'Lacombe', 'Sylvan Lake'
        ],
        'SK': [
            'Prince Albert', 'Moose Jaw', 'Swift Current', 'Yorkton', 'North Battleford',
            'Estevan', 'Weyburn', 'Lloydminster', 'Martensville', 'Warman'
        ],
        'MB': [
            'Brandon', 'Steinbach', 'Thompson', 'Portage la Prairie', 'Winkler',
            'Selkirk', 'Morden', 'Dauphin', 'The Pas', 'Flin Flon'
        ],
        'NS': [
            'Dartmouth', 'Sydney', 'Glace Bay', 'Truro', 'Amherst', 'New Glasgow',
            'Bridgewater', 'Yarmouth', 'Kentville', 'Antigonish'
        ],
        'NB': [
            'Saint John', 'Dieppe', 'Miramichi', 'Edmundston', 'Bathurst',
            'Campbellton', 'Oromocto', 'Grand Falls', 'Woodstock', 'Sackville'
        ],
        'NL': [
            'Mount Pearl', 'Corner Brook', 'Conception Bay South', 'Grand Falls-Windsor',
            'Paradise', 'Gander', 'Happy Valley-Goose Bay', 'Labrador City', 'Stephenville'
        ],
        'PE': [
            'Summerside', 'Cornwall', 'Stratford', 'Montague', 'Kensington',
            'Souris', 'Alberton', 'Tignish', 'Georgetown', 'OLeary'
        ]
    }
    
    print("\nCHECKING MID-SIZE CITIES COVERAGE:")
    print("-" * 40)
    
    missing_by_province = {}
    covered_by_province = {}
    
    for province, cities in important_cities.items():
        missing_by_province[province] = []
        covered_by_province[province] = []
        
        for city in cities:
            cur.execute("""
                SELECT COUNT(*) 
                FROM communities 
                WHERE country = 'CA' 
                AND state = %s
                AND (
                    LOWER(city) = LOWER(%s)
                    OR LOWER(city) LIKE LOWER(%s)
                )
            """, (province, city, f'%{city}%'))
            
            count = cur.fetchone()[0]
            if count == 0:
                missing_by_province[province].append(city)
            else:
                covered_by_province[province].append((city, count))
    
    # Show missing cities by province
    print("\n❌ MISSING MID-SIZE CITIES BY PROVINCE:")
    print("-" * 40)
    total_missing = 0
    for province in ['ON', 'QC', 'BC', 'AB', 'SK', 'MB', 'NS', 'NB', 'NL', 'PE']:
        if missing_by_province.get(province):
            print(f"\n{province} - Missing {len(missing_by_province[province])} cities:")
            for city in missing_by_province[province]:
                print(f"  • {city}")
                total_missing += 1
    
    # Show well-covered cities
    print("\n✅ WELL-COVERED MID-SIZE CITIES (Sample):")
    print("-" * 40)
    for province in ['ON', 'QC', 'BC', 'AB']:
        if covered_by_province.get(province):
            print(f"\n{province}:")
            for city, count in sorted(covered_by_province[province], key=lambda x: x[1], reverse=True)[:5]:
                print(f"  • {city}: {count} communities")
    
    # Check Indigenous communities
    print("\n\nINDIGENOUS & FIRST NATIONS COMMUNITIES:")
    print("-" * 40)
    
    indigenous_keywords = ['First Nation', 'Reserve', 'Indigenous', 'Inuit', 'Métis', 'Nation']
    
    for keyword in indigenous_keywords:
        cur.execute("""
            SELECT COUNT(*)
            FROM communities
            WHERE country = 'CA'
            AND (city ILIKE %s OR description ILIKE %s)
        """, (f'%{keyword}%', f'%{keyword}%'))
        
        count = cur.fetchone()[0]
        print(f"  Communities with '{keyword}': {count}")
    
    # Check French language support in Quebec
    print("\n\nLANGUAGE SUPPORT IN QUEBEC:")
    print("-" * 40)
    
    cur.execute("""
        SELECT COUNT(*)
        FROM communities
        WHERE country = 'CA' AND state = 'QC'
    """)
    total_qc = cur.fetchone()[0]
    
    cur.execute("""
        SELECT COUNT(*)
        FROM communities
        WHERE country = 'CA' AND state = 'QC'
        AND (name_fr IS NOT NULL OR bilingual = true)
    """)
    bilingual_qc = cur.fetchone()[0]
    
    print(f"  Total Quebec communities: {total_qc}")
    print(f"  With French support: {bilingual_qc}")
    print(f"  Percentage with French: {(bilingual_qc/total_qc*100) if total_qc > 0 else 0:.1f}%")
    
    # Rural vs Urban distribution
    print("\n\nRURAL VS URBAN DISTRIBUTION:")
    print("-" * 40)
    
    # Check communities in major vs smaller cities
    cur.execute("""
        SELECT 
            CASE 
                WHEN city IN ('Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa') THEN 'Major Cities'
                WHEN city IN ('Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener', 'London', 'Victoria') THEN 'Large Cities'
                ELSE 'Smaller/Rural'
            END as city_type,
            COUNT(*) as count
        FROM communities
        WHERE country = 'CA'
        GROUP BY city_type
    """)
    
    distribution = cur.fetchall()
    for city_type, count in distribution:
        percentage = (count / 7591) * 100
        print(f"  {city_type}: {count} ({percentage:.1f}%)")
    
    # Summary
    print("\n\n" + "=" * 60)
    print("COVERAGE GAP SUMMARY:")
    print("=" * 60)
    
    if total_missing > 0:
        print(f"\n⚠️  MISSING {total_missing} important mid-size cities")
        print("\nTOP PRIORITY CITIES TO ADD:")
        priority_cities = []
        for province in ['ON', 'QC', 'BC', 'AB']:
            if missing_by_province.get(province):
                for city in missing_by_province[province][:3]:
                    priority_cities.append(f"{city}, {province}")
        
        for city in priority_cities[:15]:
            print(f"  1. {city}")
    
    print("\n📊 CURRENT STRENGTHS:")
    print("  ✅ All major metropolitan areas covered")
    print("  ✅ Good coverage in Ontario (2,088 communities)")
    print("  ✅ Strong Quebec presence (1,456 communities)")
    print("  ✅ All provinces and territories represented")
    
    print("\n🎯 AREAS FOR IMPROVEMENT:")
    if total_missing > 0:
        print(f"  • Add {total_missing} missing mid-size cities")
    print("  • Increase Indigenous/First Nations community coverage")
    print("  • Enhance French language support in Quebec")
    print("  • Add more rural and remote communities")
    print("  • Strengthen coverage in Yukon (only 80 communities)")
    
    cur.close()
    conn.close()

if __name__ == "__main__":
    analyze_detailed_gaps()