#!/usr/bin/env python3
"""
Analyze Current Unlicensed Housing Coverage
Assess the current state of unlicensed senior housing across the platform
"""

import os
import psycopg2

def analyze_unlicensed_coverage():
    """Analyze current unlicensed housing coverage across all regions"""
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor()
    
    print("="*80)
    print("UNLICENSED SENIOR HOUSING COVERAGE ANALYSIS")
    print("="*80)
    
    # Overall statistics
    cursor.execute("SELECT COUNT(*) FROM communities WHERE is_licensed = true")
    licensed_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM communities WHERE is_licensed = false")
    unlicensed_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM communities")
    total_count = cursor.fetchone()[0]
    
    print(f"\nOVERALL PLATFORM COVERAGE:")
    print(f"   Licensed Facilities: {licensed_count:,}")
    print(f"   Unlicensed/Independent: {unlicensed_count:,}")
    print(f"   Total Communities: {total_count:,}")
    print(f"   Unlicensed Percentage: {(unlicensed_count/total_count)*100:.1f}%")
    
    # State breakdown for US states with unlicensed facilities
    cursor.execute("""
        SELECT state, 
               COUNT(*) FILTER (WHERE is_licensed = true) as licensed,
               COUNT(*) FILTER (WHERE is_licensed = false) as unlicensed,
               COUNT(*) as total
        FROM communities 
        WHERE state IN ('CA', 'TX', 'FL', 'NY', 'PA', 'IL', 'OH', 'GA', 'NC', 'MI',
                       'NJ', 'VA', 'WA', 'AZ', 'MA', 'TN', 'IN', 'MO', 'MD', 'WI',
                       'CO', 'MN', 'SC', 'AL', 'LA', 'KY', 'OR', 'OK', 'CT', 'UT',
                       'NV', 'ID', 'MT', 'WY', 'HI', 'AK', 'DE', 'RI', 'VT', 'NH',
                       'ME', 'WV', 'AR', 'KS', 'IA', 'MS', 'NM', 'Puerto Rico')
        GROUP BY state
        ORDER BY unlicensed DESC, total DESC
    """)
    
    state_data = cursor.fetchall()
    
    print(f"\nSTATE-BY-STATE UNLICENSED COVERAGE:")
    print(f"{'State':<15} {'Licensed':<10} {'Unlicensed':<12} {'Total':<8} {'% Unlicensed':<12}")
    print("-" * 70)
    
    states_with_unlicensed = 0
    states_without_unlicensed = 0
    
    for state, licensed, unlicensed, total in state_data:
        if unlicensed > 0:
            states_with_unlicensed += 1
            percentage = (unlicensed/total)*100
            print(f"{state:<15} {licensed:<10} {unlicensed:<12} {total:<8} {percentage:<12.1f}%")
        else:
            states_without_unlicensed += 1
    
    print(f"\nSTATES NEEDING UNLICENSED EXPANSION:")
    for state, licensed, unlicensed, total in state_data:
        if unlicensed == 0 and total > 10:  # States with facilities but no unlicensed options
            print(f"   {state}: {total} licensed facilities, 0 unlicensed options")
    
    # Identify specific unlicensed facility types if any exist
    cursor.execute("""
        SELECT care_types, COUNT(*) as count
        FROM communities 
        WHERE is_licensed = false
        GROUP BY care_types
        ORDER BY count DESC
    """)
    
    unlicensed_types = cursor.fetchall()
    
    if unlicensed_types:
        print(f"\nUNLICENSED FACILITY TYPES:")
        for care_type, count in unlicensed_types:
            print(f"   {care_type}: {count} facilities")
    
    # Geographic gaps analysis
    print(f"\nGEOGRAPHIC COVERAGE ANALYSIS:")
    print(f"   States with unlicensed options: {states_with_unlicensed}")
    print(f"   States without unlicensed options: {states_without_unlicensed}")
    print(f"   Coverage gap: {states_without_unlicensed} states need expansion")
    
    # International analysis
    cursor.execute("""
        SELECT 
            CASE 
                WHEN state IN ('Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba', 'Saskatchewan', 'Nova Scotia', 'New Brunswick', 'Newfoundland and Labrador', 'Prince Edward Island', 'Northwest Territories', 'Nunavut', 'Yukon') THEN 'Canada'
                WHEN state = 'Puerto Rico' THEN 'Puerto Rico'
                WHEN state IN ('Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua', 'Coahuila', 'Colima', 'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'México', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas', 'Mexico City') THEN 'Mexico'
                ELSE 'United States'
            END as region,
            COUNT(*) FILTER (WHERE is_licensed = false) as unlicensed,
            COUNT(*) as total
        FROM communities
        GROUP BY 
            CASE 
                WHEN state IN ('Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba', 'Saskatchewan', 'Nova Scotia', 'New Brunswick', 'Newfoundland and Labrador', 'Prince Edward Island', 'Northwest Territories', 'Nunavut', 'Yukon') THEN 'Canada'
                WHEN state = 'Puerto Rico' THEN 'Puerto Rico'
                WHEN state IN ('Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua', 'Coahuila', 'Colima', 'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'México', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas', 'Mexico City') THEN 'Mexico'
                ELSE 'United States'
            END
        ORDER BY unlicensed DESC
    """)
    
    international_data = cursor.fetchall()
    
    print(f"\nINTERNATIONAL UNLICENSED COVERAGE:")
    for region, unlicensed, total in international_data:
        percentage = (unlicensed/total)*100 if total > 0 else 0
        print(f"   {region}: {unlicensed}/{total} ({percentage:.1f}% unlicensed)")
    
    # Recommendations
    print(f"\n" + "="*80)
    print("EXPANSION RECOMMENDATIONS:")
    print("="*80)
    
    if unlicensed_count < (total_count * 0.15):  # Less than 15% unlicensed
        print("📈 CRITICAL: Platform heavily skewed toward licensed facilities")
        print("   • Target 15-25% unlicensed coverage for realistic market representation")
        print("   • Focus on mobile home parks, RV resorts, and 55+ apartments")
        print("   • These options are 'hugely popular' and cost-effective for seniors")
    
    if states_without_unlicensed > 10:
        print("🗺️  GEOGRAPHIC GAPS: Many states lack unlicensed options")
        print("   • Prioritize major population centers in uncovered states")
        print("   • Research local mobile home parks and senior apartment complexes")
    
    print("🎯 PRIORITY HOUSING TYPES TO ADD:")
    print("   • 55+ Mobile Home Parks (affordable independent living)")
    print("   • Senior RV Resorts (snowbird communities)")
    print("   • Age-Restricted Apartments (independent living)")
    print("   • Active Adult Communities (55+ with amenities)")
    
    cursor.close()
    conn.close()

if __name__ == "__main__":
    analyze_unlicensed_coverage()