#!/usr/bin/env python3
"""
CONNECTICUT FINAL PUSH - Complete 50-state coverage
Deploy Connecticut with proper error handling and schema compatibility
"""
import os
import psycopg2
from real_hud_api_collector import RealHUDAPICollector

def connecticut_final_push():
    """Final Connecticut deployment with proper error handling"""
    print("🎯 CONNECTICUT FINAL PUSH - 50-STATE COMPLETION")
    print("="*60)
    
    collector = RealHUDAPICollector()
    
    try:
        # Get Connecticut HUD properties
        print("📋 Collecting Connecticut Section 202 properties...")
        section_202 = collector.query_hud_section_202_by_state('CT')
        
        if not section_202:
            print("   ❌ No Connecticut properties found")
            return
        
        print(f"   Found {len(section_202)} Connecticut HUD properties")
        
        # Process and save with individual transaction handling
        saved_count = 0
        
        db_url = os.environ.get('DATABASE_URL')
        
        for i, feature in enumerate(section_202[:50]):  # Limit to prevent timeout
            try:
                # Process the property
                processed = collector.process_hud_property(feature, "Section 202 Elderly Housing")
                
                if not processed or not processed.get('name') or not processed.get('hud_property_id'):
                    continue
                
                # Clean rent values
                if processed.get('rent_per_month') and processed['rent_per_month'] < 0:
                    processed['rent_per_month'] = None
                
                # Individual database connection per property
                conn = psycopg2.connect(db_url)
                cursor = conn.cursor()
                
                # Insert with minimal required fields
                cursor.execute("""
                    INSERT INTO communities (
                        name, address, city, state, zip_code, phone,
                        latitude, longitude, total_units_hud, occupancy_rate_hud,
                        rent_per_month, management_company, housing_type,
                        hud_property_id, hud_property_name, hud_program_type
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                    )
                    ON CONFLICT (hud_property_id) DO NOTHING;
                """, (
                    processed.get('name'),
                    processed.get('address'),
                    processed.get('city', 'CT'),
                    'CT',  # Force Connecticut
                    processed.get('zip_code'),
                    processed.get('phone'),
                    processed.get('latitude'),
                    processed.get('longitude'),
                    processed.get('total_units_hud'),
                    processed.get('occupancy_rate_hud'),
                    processed.get('rent_per_month'),
                    processed.get('management_company'),
                    'Section 202 Elderly Housing',
                    processed.get('hud_property_id'),
                    processed.get('hud_property_name'),
                    'Section 202'
                ))
                
                if cursor.rowcount > 0:
                    saved_count += 1
                    if saved_count <= 5:  # Show first 5
                        name = processed.get('name', 'Unknown')[:40]
                        units = processed.get('total_units_hud', 'N/A')
                        occupancy = processed.get('occupancy_rate_hud', 'N/A')
                        print(f"      ✅ {saved_count}. {name} - {units} units ({occupancy}% occupied)")
                
                conn.commit()
                cursor.close()
                conn.close()
                
            except Exception as e:
                if "duplicate key" not in str(e).lower():
                    print(f"      ⚠️ Property {i+1} error: {str(e)[:40]}")
                continue
        
        print(f"\n   🎉 SUCCESS: {saved_count} Connecticut properties added!")
        
        # Check if we achieved 50-state coverage
        check_final_coverage()
        
    except Exception as e:
        print(f"   ❌ Deployment error: {e}")

def check_final_coverage():
    """Check final state coverage and celebrate if 50 states achieved"""
    try:
        db_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        # Count states with HUD coverage
        cursor.execute("""
            SELECT COUNT(DISTINCT state) as state_count
            FROM communities 
            WHERE hud_property_id IS NOT NULL;
        """)
        
        state_count = cursor.fetchone()[0]
        
        # Connecticut specific count
        cursor.execute("""
            SELECT COUNT(*) as ct_count
            FROM communities 
            WHERE state = 'CT' AND hud_property_id IS NOT NULL;
        """)
        
        ct_count = cursor.fetchone()[0]
        
        # Final platform totals
        cursor.execute("""
            SELECT 
                COUNT(*) as total_hud,
                SUM(total_units_hud) as total_units,
                AVG(occupancy_rate_hud) as avg_occupancy,
                COUNT(CASE WHEN rent_per_month > 0 THEN 1 END) as with_pricing
            FROM communities 
            WHERE hud_property_id IS NOT NULL;
        """)
        
        final_stats = cursor.fetchone()
        
        print(f"\n🏆 FINAL COVERAGE VERIFICATION:")
        print(f"   States with HUD Coverage: {state_count}/51 (50 states + DC)")
        print(f"   Connecticut HUD Properties: {ct_count}")
        
        if final_stats:
            total, units, occupancy, pricing = final_stats
            print(f"   📊 PLATFORM TOTALS:")
            print(f"      Total HUD Properties: {total:,}")
            print(f"      Total Housing Units: {units:,}")
            print(f"      Average Occupancy: {occupancy:.1f}%")
            print(f"      With Pricing Data: {pricing:,} ({(pricing/total*100):.1f}%)")
        
        if state_count >= 50:
            print(f"\n   🎉 HISTORIC ACHIEVEMENT: 50-STATE HUD COVERAGE COMPLETE!")
            print(f"   🇺🇸 MySeniorValet now provides comprehensive nationwide transparency!")
            
            if state_count == 51:
                print(f"   ✨ BONUS: All 50 states + DC covered!")
        else:
            missing_count = 51 - state_count
            print(f"   ⚠️ Still need {missing_count} more state(s) for complete coverage")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"   ❌ Coverage check error: {e}")

if __name__ == "__main__":
    connecticut_final_push()