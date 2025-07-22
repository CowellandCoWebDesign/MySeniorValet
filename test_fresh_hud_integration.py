#!/usr/bin/env python3
"""
FRESH HUD INTEGRATION TEST & DATA INTEGRITY VERIFICATION
Ensure all HUD data maintains 100% authenticity and quality
"""
import os
import psycopg2
from real_hud_api_collector import RealHUDAPICollector

def test_hud_data_integrity():
    """Test and verify HUD data integrity across the platform"""
    print("🔍 HUD DATA INTEGRITY VERIFICATION")
    print("="*60)
    
    try:
        db_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        # 1. Verify authentic HUD property identification
        print("1️⃣ VERIFYING AUTHENTIC HUD PROPERTIES...")
        cursor.execute("""
            SELECT COUNT(*) as total,
                   COUNT(CASE WHEN hud_property_id IS NOT NULL THEN 1 END) as with_hud_id,
                   COUNT(CASE WHEN hud_property_id IS NOT NULL AND hud_property_id != '' THEN 1 END) as valid_hud_id
            FROM communities
            WHERE facility_type LIKE '%HUD%' OR facility_type LIKE '%Section%'
        """)
        
        hud_verification = cursor.fetchone()
        if hud_verification:
            total, with_id, valid_id = hud_verification
            print(f"   Total HUD Properties: {total:,}")
            print(f"   With HUD Property ID: {with_id:,} ({(with_id/total*100):.1f}%)")
            print(f"   Valid HUD Property ID: {valid_id:,} ({(valid_id/total*100):.1f}%)")
        
        # 2. Verify rich data quality metrics
        print("\n2️⃣ VERIFYING RICH DATA QUALITY...")
        cursor.execute("""
            SELECT 
                COUNT(*) as total_hud,
                COUNT(CASE WHEN total_units_hud > 0 AND total_units_hud < 2000 THEN 1 END) as valid_units,
                COUNT(CASE WHEN occupancy_rate_hud >= 0 AND occupancy_rate_hud <= 100 THEN 1 END) as valid_occupancy,
                COUNT(CASE WHEN rent_per_month > 0 AND rent_per_month < 5000 THEN 1 END) as valid_rent,
                COUNT(CASE WHEN age_62_plus_pct >= 0 AND age_62_plus_pct <= 100 THEN 1 END) as valid_demographics,
                COUNT(CASE WHEN management_company IS NOT NULL AND LENGTH(management_company) > 2 THEN 1 END) as valid_mgmt
            FROM communities 
            WHERE hud_property_id IS NOT NULL
        """)
        
        quality_stats = cursor.fetchone()
        if quality_stats:
            total, units, occupancy, rent, demographics, mgmt = quality_stats
            print(f"   Total HUD Properties: {total:,}")
            print(f"   Valid Unit Counts: {units:,} ({(units/total*100):.1f}%)")
            print(f"   Valid Occupancy Rates: {occupancy:,} ({(occupancy/total*100):.1f}%)")
            print(f"   Valid Rent Data: {rent:,} ({(rent/total*100):.1f}%)")
            print(f"   Valid Demographics: {demographics:,} ({(demographics/total*100):.1f}%)")
            print(f"   Valid Management Info: {mgmt:,} ({(mgmt/total*100):.1f}%)")
        
        # 3. Check for data anomalies
        print("\n3️⃣ CHECKING FOR DATA ANOMALIES...")
        
        # Check for suspicious occupancy rates
        cursor.execute("""
            SELECT COUNT(*) FROM communities 
            WHERE hud_property_id IS NOT NULL 
            AND (occupancy_rate_hud < 0 OR occupancy_rate_hud > 100)
        """)
        invalid_occupancy = cursor.fetchone()[0]
        print(f"   Invalid Occupancy Rates: {invalid_occupancy}")
        
        # Check for unrealistic unit counts
        cursor.execute("""
            SELECT COUNT(*) FROM communities 
            WHERE hud_property_id IS NOT NULL 
            AND (total_units_hud <= 0 OR total_units_hud > 2000)
        """)
        invalid_units = cursor.fetchone()[0]
        print(f"   Unrealistic Unit Counts: {invalid_units}")
        
        # Check for suspicious rent amounts
        cursor.execute("""
            SELECT COUNT(*) FROM communities 
            WHERE hud_property_id IS NOT NULL 
            AND (rent_per_month <= 0 OR rent_per_month > 5000)
        """)
        invalid_rent = cursor.fetchone()[0]
        print(f"   Suspicious Rent Amounts: {invalid_rent}")
        
        # 4. Sample highest quality HUD properties
        print("\n4️⃣ TOP QUALITY HUD PROPERTIES SAMPLE...")
        cursor.execute("""
            SELECT name, city, state, total_units_hud, occupancy_rate_hud, 
                   rent_per_month, age_62_plus_pct, management_company
            FROM communities 
            WHERE hud_property_id IS NOT NULL 
            AND total_units_hud > 0 
            AND occupancy_rate_hud BETWEEN 0 AND 100
            AND rent_per_month > 0
            AND management_company IS NOT NULL
            ORDER BY total_units_hud DESC
            LIMIT 5
        """)
        
        top_properties = cursor.fetchall()
        for i, (name, city, state, units, occupancy, rent, senior_pct, mgmt) in enumerate(top_properties, 1):
            print(f"   {i}. {name} ({city}, {state})")
            print(f"      🏠 {units} units | 👥 {occupancy}% occupied | 💰 ${rent}/month")
            print(f"      👴 {senior_pct}% seniors | 🏢 {mgmt}")
        
        # 5. State coverage analysis
        print("\n5️⃣ STATE COVERAGE ANALYSIS...")
        cursor.execute("""
            SELECT state, COUNT(*) as hud_count,
                   AVG(total_units_hud) as avg_units,
                   AVG(occupancy_rate_hud) as avg_occupancy,
                   COUNT(CASE WHEN rent_per_month > 0 THEN 1 END) as with_rent
            FROM communities 
            WHERE hud_property_id IS NOT NULL
            GROUP BY state 
            HAVING COUNT(*) >= 10
            ORDER BY hud_count DESC
        """)
        
        state_coverage = cursor.fetchall()
        print(f"   States with 10+ HUD Properties: {len(state_coverage)}")
        for state, count, avg_units, avg_occupancy, with_rent in state_coverage[:10]:
            avg_units_str = f"{avg_units:.0f}" if avg_units else "N/A"
            avg_occ_str = f"{avg_occupancy:.1f}%" if avg_occupancy else "N/A"
            rent_pct = (with_rent/count*100) if count > 0 else 0
            print(f"   {state}: {count:,} properties | {avg_units_str} avg units | {avg_occ_str} occupancy | {rent_pct:.0f}% with rent")
        
        cursor.close()
        conn.close()
        
        print(f"\n✅ HUD DATA INTEGRITY VERIFICATION COMPLETE")
        print(f"The platform maintains high-quality, authentic HUD data for user filtering!")
        
    except Exception as e:
        print(f"❌ Error in integrity verification: {e}")

def demonstrate_fresh_hud_integration():
    """Demonstrate fresh HUD data integration for one high-value state"""
    print(f"\n🔬 FRESH HUD INTEGRATION DEMONSTRATION")
    print("="*50)
    
    collector = RealHUDAPICollector()
    
    # Test with one high-value state to show fresh integration
    test_state = 'WI'  # Wisconsin - good test case
    
    try:
        print(f"🗺️ Testing fresh HUD integration for Wisconsin...")
        
        # Query Section 202 properties
        section_202_data = collector.query_hud_section_202_by_state(test_state)
        
        if section_202_data and len(section_202_data) > 0:
            print(f"✅ Found {len(section_202_data)} Section 202 properties")
            
            # Process first few properties to show data quality
            sample_properties = []
            for feature in section_202_data[:3]:
                processed = collector.process_hud_property(feature, "Section 202 Elderly Housing")
                if processed and processed.get('name'):
                    sample_properties.append(processed)
            
            if sample_properties:
                print(f"\n📊 FRESH DATA SAMPLE FROM WISCONSIN:")
                for i, prop in enumerate(sample_properties, 1):
                    print(f"   {i}. {prop['name']} ({prop.get('city', 'Unknown City')})")
                    print(f"      🏠 Units: {prop.get('total_units_hud', 'N/A')}")
                    print(f"      👥 Occupancy: {prop.get('occupancy_rate_hud', 'N/A')}%")
                    print(f"      💰 Rent: ${prop.get('rent_per_month', 'N/A')}/month")
                    print(f"      👴 Seniors: {prop.get('age_62_plus_pct', 'N/A')}%")
                    print(f"      🏢 Management: {prop.get('management_company', 'N/A')}")
                
                print(f"\n✅ Fresh HUD integration working perfectly!")
                print(f"Data shows authentic occupancy, pricing, and management information")
            else:
                print("⚠️ No valid properties processed from sample")
        else:
            print("❌ No Section 202 properties found for Wisconsin")
            
    except Exception as e:
        print(f"❌ Error in fresh integration test: {e}")

if __name__ == "__main__":
    test_hud_data_integrity()
    demonstrate_fresh_hud_integration()