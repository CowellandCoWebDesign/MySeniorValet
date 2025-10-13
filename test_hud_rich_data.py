#!/usr/bin/env python3
"""
Test script to verify HUD API data collection with comprehensive rich data
Focus on collecting a small sample with all the valuable HUD information
"""
import os
import logging
import psycopg2
from real_hud_api_collector import RealHUDAPICollector

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_rich_hud_data_collection():
    """Test collecting a small sample of HUD data with rich information"""
    print("="*80)
    print("🧪 TESTING HUD RICH DATA COLLECTION")
    print("Collecting small sample to verify rich data capture")
    print("="*80)
    
    # Initialize collector
    collector = RealHUDAPICollector()
    
    # Test with California (small sample)
    print("\n🔍 Testing California HUD data collection...")
    
    # Get just Section 202 data for testing
    section_202_data = collector.query_hud_section_202_by_state('CA')
    
    if section_202_data and len(section_202_data) > 0:
        print(f"✅ Found {len(section_202_data)} Section 202 properties")
        
        # Process first few properties to test data structure
        test_properties = []
        for i, feature in enumerate(section_202_data[:5]):  # Just test 5 properties
            processed = collector.process_hud_property(feature, "Section 202 Elderly Housing")
            if processed:
                test_properties.append(processed)
                
                # Print detailed data for verification
                print(f"\n📋 PROPERTY {i+1}: {processed['name']}")
                print(f"   📍 Location: {processed['city']}, {processed['state']}")
                print(f"   🏠 Total Units: {processed.get('total_units_hud', 'N/A')}")
                print(f"   👥 Occupancy Rate: {processed.get('occupancy_rate_hud', 'N/A')}%")
                print(f"   💰 Rent/Month: ${processed.get('rent_per_month', 'N/A')}")
                print(f"   👴 Senior (62+): {processed.get('age_62_plus_pct', 'N/A')}%")
                print(f"   🏢 Management: {processed.get('management_company', 'N/A')}")
                print(f"   📞 Mgmt Phone: {processed.get('management_phone', 'N/A')}")
                
        print(f"\n💾 Testing database insertion with {len(test_properties)} properties...")
        
        if test_properties:
            # Test database insertion
            added = collector.save_authentic_properties_to_database(test_properties, 'CA')
            print(f"✅ Successfully added {added} test properties with rich HUD data")
            
            # Verify the data was saved correctly
            verify_saved_data()
        else:
            print("❌ No valid test properties to save")
    else:
        print("❌ No Section 202 data found for testing")

def verify_saved_data():
    """Verify that the rich HUD data was saved correctly"""
    print("\n🔍 VERIFYING SAVED RICH DATA...")
    
    try:
        db_url = os.environ.get('DATABASE_URL')
        if not db_url:
            print("❌ DATABASE_URL not found")
            return
            
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        # Check for HUD properties with rich data
        cursor.execute("""
            SELECT name, city, state, total_units_hud, occupancy_rate_hud, 
                   rent_per_month, age_62_plus_pct, management_company
            FROM communities 
            WHERE hud_property_id IS NOT NULL 
            AND total_units_hud IS NOT NULL
            ORDER BY id DESC
            LIMIT 3
        """)
        
        results = cursor.fetchall()
        
        if results:
            print(f"✅ Found {len(results)} HUD properties with rich data:")
            for row in results:
                name, city, state, units, occupancy, rent, senior_pct, mgmt = row
                print(f"   🏠 {name} ({city}, {state})")
                print(f"      Units: {units}, Occupancy: {occupancy}%, Rent: ${rent}, Seniors: {senior_pct}%")
                print(f"      Management: {mgmt}")
        else:
            print("❌ No HUD properties with rich data found")
            
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error verifying data: {e}")

if __name__ == "__main__":
    test_rich_hud_data_collection()