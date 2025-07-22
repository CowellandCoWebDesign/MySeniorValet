#!/usr/bin/env python3
"""
Fresh HUD Integration Test - Test with unused state to verify rich data collection
"""
import os
import logging
import psycopg2
from real_hud_api_collector import RealHUDAPICollector

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_fresh_state_integration():
    """Test HUD data collection with a state that has minimal existing data"""
    print("="*80)
    print("🧪 FRESH HUD INTEGRATION TEST")
    print("Testing with minimal existing data to verify rich data capture")
    print("="*80)
    
    # Check which states have minimal HUD data
    try:
        db_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        # Check HUD counts by state
        cursor.execute("""
            SELECT state, COUNT(*) as hud_count 
            FROM communities 
            WHERE hud_property_id IS NOT NULL 
            GROUP BY state 
            ORDER BY hud_count ASC
            LIMIT 5
        """)
        
        results = cursor.fetchall()
        print("📊 Current HUD data by state:")
        for state, count in results:
            print(f"   {state}: {count} properties")
            
        cursor.close()
        conn.close()
        
        # Test with a state that has low existing data or use Nevada
        test_state = 'NV'  # Nevada should have minimal HUD data
        
        # Initialize collector
        collector = RealHUDAPICollector()
        
        print(f"\n🔍 Testing {test_state} HUD data collection...")
        
        # Get Section 202 data for testing
        section_202_data = collector.query_hud_section_202_by_state(test_state)
        
        if section_202_data and len(section_202_data) > 0:
            print(f"✅ Found {len(section_202_data)} Section 202 properties in {test_state}")
            
            # Process first 3 properties
            test_properties = []
            for i, feature in enumerate(section_202_data[:3]):
                processed = collector.process_hud_property(feature, "Section 202 Elderly Housing")
                if processed and processed.get('name') and processed.get('city') and processed.get('state'):
                    test_properties.append(processed)
                    
                    # Print rich data
                    print(f"\n📋 PROPERTY {i+1}: {processed['name']}")
                    print(f"   📍 Location: {processed['city']}, {processed['state']}")
                    print(f"   🏠 Total Units: {processed.get('total_units_hud', 'N/A')}")
                    print(f"   👥 Occupancy: {processed.get('occupancy_rate_hud', 'N/A')}%")
                    print(f"   💰 Rent: ${processed.get('rent_per_month', 'N/A')}/month")
                    print(f"   👴 Seniors 62+: {processed.get('age_62_plus_pct', 'N/A')}%")
                    print(f"   🏢 Management: {processed.get('management_company', 'N/A')}")
                    
            if test_properties:
                print(f"\n💾 Adding {len(test_properties)} new properties with rich HUD data...")
                added = collector.save_authentic_properties_to_database(test_properties, test_state)
                print(f"✅ Successfully added {added} properties")
                
                if added > 0:
                    verify_rich_data_integration()
            else:
                print("❌ No valid properties to add")
        else:
            print(f"❌ No Section 202 data found for {test_state}")
            
    except Exception as e:
        print(f"❌ Error in test: {e}")

def verify_rich_data_integration():
    """Verify the rich HUD data integration"""
    print("\n🔍 VERIFYING RICH DATA INTEGRATION...")
    
    try:
        db_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        # Check for latest HUD properties with rich data
        cursor.execute("""
            SELECT name, city, state, total_units_hud, occupancy_rate_hud, 
                   rent_per_month, age_62_plus_pct, management_company,
                   management_phone, hud_property_id
            FROM communities 
            WHERE hud_property_id IS NOT NULL 
            AND (total_units_hud > 0 OR rent_per_month IS NOT NULL OR management_company IS NOT NULL)
            ORDER BY id DESC
            LIMIT 5
        """)
        
        results = cursor.fetchall()
        
        if results:
            print(f"✅ RICH DATA INTEGRATION SUCCESSFUL! Found {len(results)} properties:")
            for row in results:
                name, city, state, units, occupancy, rent, senior_pct, mgmt, phone, hud_id = row
                print(f"\n🏠 {name} ({city}, {state})")
                print(f"   🆔 HUD ID: {hud_id}")
                print(f"   📊 Units: {units}, Occupancy: {occupancy}%, Rent: ${rent}")
                print(f"   👴 Senior %: {senior_pct}%, Management: {mgmt}")
                print(f"   📞 Phone: {phone}")
        else:
            print("❌ No properties with rich data found")
            
        # Check total HUD integration stats
        cursor.execute("""
            SELECT 
                COUNT(*) as total_hud,
                COUNT(CASE WHEN total_units_hud > 0 THEN 1 END) as with_units,
                COUNT(CASE WHEN rent_per_month IS NOT NULL THEN 1 END) as with_rent,
                COUNT(CASE WHEN management_company IS NOT NULL THEN 1 END) as with_mgmt
            FROM communities 
            WHERE hud_property_id IS NOT NULL
        """)
        
        stats = cursor.fetchone()
        if stats:
            total, units, rent, mgmt = stats
            print(f"\n📈 HUD INTEGRATION STATISTICS:")
            print(f"   Total HUD Properties: {total}")
            print(f"   With Unit Data: {units} ({(units/total*100):.1f}%)")
            print(f"   With Rent Data: {rent} ({(rent/total*100):.1f}%)")
            print(f"   With Management Data: {mgmt} ({(mgmt/total*100):.1f}%)")
            
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error verifying data: {e}")

if __name__ == "__main__":
    test_fresh_state_integration()