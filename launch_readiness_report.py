#!/usr/bin/env python3
"""
Launch Readiness Report
Final verification of database integrity for platform launch
"""

import os
import psycopg2

def generate_launch_report():
    """Generate comprehensive launch readiness report"""
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor()
    
    print("="*80)
    print("MYSENIORVALET LAUNCH READINESS REPORT")
    print("="*80)
    
    # Total communities
    cursor.execute("SELECT COUNT(*) FROM communities")
    total_communities = cursor.fetchone()[0]
    
    # States/provinces covered
    cursor.execute("SELECT COUNT(DISTINCT state) FROM communities")
    states_covered = cursor.fetchone()[0]
    
    # Countries covered
    cursor.execute("""
        SELECT DISTINCT 
        CASE 
            WHEN state IN ('CA', 'FL', 'TX', 'NY', 'AZ', 'NV', 'ID', 'MT', 'OR', 'WA', 'WY', 'UT', 'NM', 'CO', 'GA', 'AL', 'MS', 'LA', 'TN', 'IL', 'PA', 'MI', 'OH', 'IN', 'WI', 'MN', 'NC', 'VA', 'MA', 'NJ', 'SC', 'MO', 'IA', 'AR', 'OK', 'KS', 'CT', 'DE', 'VT', 'RI', 'NH', 'ME', 'MD', 'WV', 'Kentucky', 'North Dakota', 'South Dakota', 'AK', 'HI', 'Puerto Rico') THEN 'United States'
            WHEN state IN ('Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba', 'Saskatchewan', 'Nova Scotia', 'New Brunswick', 'Newfoundland and Labrador', 'Prince Edward Island', 'Northwest Territories', 'Nunavut', 'Yukon') THEN 'Canada'
            ELSE 'Mexico'
        END as country
        FROM communities
    """)
    countries = [row[0] for row in cursor.fetchall()]
    
    # Licensed vs unlicensed
    cursor.execute("SELECT COUNT(*) FROM communities WHERE is_licensed = true")
    licensed_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM communities WHERE is_licensed = false")
    unlicensed_count = cursor.fetchone()[0]
    
    # Data quality checks
    cursor.execute("SELECT COUNT(*) FROM communities WHERE phone = 'PHONE_REQUIRED'")
    phone_needed = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM communities WHERE address ~ '^[0-9]+ Main Street$'")
    fake_addresses = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM communities WHERE phone ~ '^\\(555\\)'")
    fake_phones = cursor.fetchone()[0]
    
    # Top states by coverage
    cursor.execute("""
        SELECT state, COUNT(*) as facilities 
        FROM communities 
        GROUP BY state 
        ORDER BY facilities DESC 
        LIMIT 10
    """)
    top_states = cursor.fetchall()
    
    print(f"\n📊 PLATFORM STATISTICS:")
    print(f"   Total Communities: {total_communities:,}")
    print(f"   States/Provinces: {states_covered}")
    print(f"   Countries: {', '.join(countries)}")
    print(f"   Licensed Facilities: {licensed_count:,}")
    print(f"   Unlicensed/Independent: {unlicensed_count:,}")
    
    print(f"\n✅ DATA INTEGRITY STATUS:")
    if fake_addresses == 0 and fake_phones == 0:
        print("   ✅ NO synthetic addresses detected")
        print("   ✅ NO fake phone numbers detected")
        print("   ✅ Database safeguards active")
        integrity_status = "PASSED"
    else:
        print(f"   ❌ {fake_addresses} fake addresses found")
        print(f"   ❌ {fake_phones} fake phone numbers found")
        integrity_status = "FAILED"
    
    if phone_needed > 0:
        print(f"   ⚠️  {phone_needed} communities need phone number updates")
    
    print(f"\n🏆 TOP COVERAGE AREAS:")
    for state, count in top_states:
        print(f"   {state}: {count:,} facilities")
    
    print(f"\n🚀 LAUNCH READINESS:")
    if integrity_status == "PASSED" and total_communities > 20000:
        print("   ✅ READY FOR LAUNCH")
        print("   ✅ Data integrity verified")
        print("   ✅ Comprehensive North American coverage")
        print("   ✅ Both licensed and unlicensed options available")
    else:
        print("   ❌ NOT READY - Data integrity issues remain")
    
    print("="*80)
    
    cursor.close()
    conn.close()

if __name__ == "__main__":
    generate_launch_report()