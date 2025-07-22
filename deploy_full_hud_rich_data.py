#!/usr/bin/env python3
"""
FULL HUD RICH DATA DEPLOYMENT
Deploy comprehensive HUD data collection across CA, TX, FL with all valuable information
"""
import os
import time
import logging
import psycopg2
from real_hud_api_collector import RealHUDAPICollector

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('hud_deployment.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def deploy_comprehensive_hud_data():
    """Deploy full HUD rich data collection across target states"""
    print("="*100)
    print("🚀 FULL HUD RICH DATA DEPLOYMENT")
    print("Target: CA, TX, FL with comprehensive occupancy, pricing, and demographic data")
    print("="*100)
    
    # Initialize collector
    collector = RealHUDAPICollector()
    
    # Target states for comprehensive coverage
    target_states = [
        ('CA', 'California'),
        ('TX', 'Texas'), 
        ('FL', 'Florida')
    ]
    
    deployment_stats = {
        'total_properties_processed': 0,
        'total_properties_added': 0,
        'states_completed': 0,
        'properties_by_state': {}
    }
    
    for state_code, state_name in target_states:
        print(f"\n🗺️ DEPLOYING {state_name.upper()} ({state_code}) - Full HUD Rich Data Collection")
        print("="*80)
        
        state_start_time = time.time()
        state_properties = []
        
        # Collect Section 202 Elderly Housing
        print(f"🏛️ Collecting HUD Section 202 Elderly Housing for {state_name}...")
        section_202_data = collector.query_hud_section_202_by_state(state_code)
        
        if section_202_data:
            print(f"✅ Found {len(section_202_data)} Section 202 properties")
            for feature in section_202_data:
                processed = collector.process_hud_property(feature, "Section 202 Elderly Housing")
                if processed and processed.get('name') and processed.get('city'):
                    state_properties.append(processed)
        
        # Collect Multifamily Elderly Housing
        print(f"🏠 Collecting HUD Multifamily Elderly Housing for {state_name}...")
        multifamily_data = collector.query_hud_multifamily_elderly(state_code)
        
        if multifamily_data:
            print(f"✅ Found {len(multifamily_data)} Multifamily Elderly properties")
            for feature in multifamily_data:
                processed = collector.process_hud_property(feature, "HUD Multifamily Elderly Housing")
                if processed and processed.get('name') and processed.get('city'):
                    state_properties.append(processed)
        
        # Remove duplicates based on HUD Property ID
        unique_properties = []
        seen_ids = set()
        for prop in state_properties:
            hud_id = prop.get('hud_property_id')
            if hud_id and hud_id not in seen_ids:
                seen_ids.add(hud_id)
                unique_properties.append(prop)
        
        print(f"💾 Processing {len(unique_properties)} unique properties for {state_name}...")
        
        # Save to database with rich data
        if unique_properties:
            added_count = collector.save_authentic_properties_to_database(unique_properties, state_code)
            
            # Update deployment stats
            deployment_stats['total_properties_processed'] += len(unique_properties)
            deployment_stats['total_properties_added'] += added_count
            deployment_stats['properties_by_state'][state_code] = {
                'processed': len(unique_properties),
                'added': added_count,
                'skipped': len(unique_properties) - added_count
            }
            
            state_duration = time.time() - state_start_time
            print(f"\n📊 {state_name.upper()} DEPLOYMENT COMPLETE:")
            print(f"   Properties Processed: {len(unique_properties)}")
            print(f"   Properties Added: {added_count}")
            print(f"   Properties Skipped: {len(unique_properties) - added_count}")
            print(f"   Duration: {state_duration:.1f} seconds")
            
            # Verify rich data for this state
            verify_state_rich_data(state_code, state_name)
            
            deployment_stats['states_completed'] += 1
        else:
            print(f"❌ No valid properties found for {state_name}")
    
    # Final deployment summary
    print_deployment_summary(deployment_stats)
    
    # Comprehensive verification
    verify_comprehensive_deployment()

def verify_state_rich_data(state_code, state_name):
    """Verify rich data deployment for a specific state"""
    print(f"\n🔍 Verifying {state_name} rich data integration...")
    
    try:
        db_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        # Check rich data statistics for this state
        cursor.execute("""
            SELECT 
                COUNT(*) as total_hud,
                COUNT(CASE WHEN total_units_hud > 0 THEN 1 END) as with_units,
                COUNT(CASE WHEN occupancy_rate_hud > 0 THEN 1 END) as with_occupancy,
                COUNT(CASE WHEN rent_per_month > 0 THEN 1 END) as with_rent,
                COUNT(CASE WHEN age_62_plus_pct > 0 THEN 1 END) as with_senior_data,
                COUNT(CASE WHEN management_company IS NOT NULL AND management_company != '' THEN 1 END) as with_mgmt
            FROM communities 
            WHERE state = %s AND hud_property_id IS NOT NULL
        """, (state_code,))
        
        stats = cursor.fetchone()
        if stats:
            total, units, occupancy, rent, senior, mgmt = stats
            if total > 0:
                print(f"   ✅ {state_name} Rich Data Statistics:")
                print(f"      Total HUD Properties: {total}")
                print(f"      With Unit Counts: {units} ({(units/total*100):.1f}%)")
                print(f"      With Occupancy Data: {occupancy} ({(occupancy/total*100):.1f}%)")
                print(f"      With Rent Data: {rent} ({(rent/total*100):.1f}%)")
                print(f"      With Senior Demographics: {senior} ({(senior/total*100):.1f}%)")
                print(f"      With Management Data: {mgmt} ({(mgmt/total*100):.1f}%)")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error verifying {state_name} data: {e}")

def print_deployment_summary(stats):
    """Print comprehensive deployment summary"""
    print("\n" + "="*100)
    print("🎯 COMPREHENSIVE HUD DEPLOYMENT SUMMARY")
    print("="*100)
    
    print(f"States Completed: {stats['states_completed']}/3")
    print(f"Total Properties Processed: {stats['total_properties_processed']:,}")
    print(f"Total Properties Added: {stats['total_properties_added']:,}")
    print(f"Total Properties Skipped: {stats['total_properties_processed'] - stats['total_properties_added']:,}")
    
    print("\nBy State:")
    for state, data in stats['properties_by_state'].items():
        print(f"  {state}: {data['added']} added, {data['skipped']} skipped ({data['processed']} total)")

def verify_comprehensive_deployment():
    """Verify the comprehensive deployment across all states"""
    print("\n🔍 COMPREHENSIVE DEPLOYMENT VERIFICATION")
    print("="*60)
    
    try:
        db_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        # Overall HUD statistics
        cursor.execute("""
            SELECT 
                COUNT(*) as total_hud,
                COUNT(CASE WHEN total_units_hud > 0 THEN 1 END) as with_units,
                COUNT(CASE WHEN occupancy_rate_hud > 0 THEN 1 END) as with_occupancy,
                COUNT(CASE WHEN rent_per_month > 0 THEN 1 END) as with_rent,
                COUNT(CASE WHEN age_62_plus_pct > 0 THEN 1 END) as with_senior_data,
                COUNT(CASE WHEN management_company IS NOT NULL AND management_company != '' THEN 1 END) as with_mgmt,
                AVG(total_units_hud) as avg_units,
                AVG(occupancy_rate_hud) as avg_occupancy,
                AVG(rent_per_month) as avg_rent
            FROM communities 
            WHERE hud_property_id IS NOT NULL
        """)
        
        overall_stats = cursor.fetchone()
        if overall_stats:
            total, units, occupancy, rent, senior, mgmt, avg_units, avg_occupancy, avg_rent = overall_stats
            
            print(f"🏆 DEPLOYMENT SUCCESS METRICS:")
            print(f"   Total HUD Properties: {total:,}")
            print(f"   Properties with Unit Data: {units:,} ({(units/total*100):.1f}%)")
            print(f"   Properties with Occupancy Data: {occupancy:,} ({(occupancy/total*100):.1f}%)")
            print(f"   Properties with Rent Data: {rent:,} ({(rent/total*100):.1f}%)")
            print(f"   Properties with Senior Demographics: {senior:,} ({(senior/total*100):.1f}%)")
            print(f"   Properties with Management Data: {mgmt:,} ({(mgmt/total*100):.1f}%)")
            
            if avg_units:
                print(f"\n📊 AVERAGE PROPERTY METRICS:")
                print(f"   Average Units per Property: {avg_units:.1f}")
                print(f"   Average Occupancy Rate: {avg_occupancy:.1f}%")
                print(f"   Average Monthly Rent: ${avg_rent:.2f}")
        
        # Sample of rich data properties
        cursor.execute("""
            SELECT name, city, state, total_units_hud, occupancy_rate_hud, 
                   rent_per_month, age_62_plus_pct, management_company
            FROM communities 
            WHERE hud_property_id IS NOT NULL 
            AND total_units_hud > 0 
            AND occupancy_rate_hud > 0
            ORDER BY total_units_hud DESC
            LIMIT 5
        """)
        
        samples = cursor.fetchall()
        if samples:
            print(f"\n🏠 TOP PROPERTIES WITH RICH DATA:")
            for i, (name, city, state, units, occupancy, rent, senior_pct, mgmt) in enumerate(samples, 1):
                print(f"   {i}. {name} ({city}, {state})")
                print(f"      {units} units, {occupancy}% occupied, ${rent}/month, {senior_pct}% seniors")
        
        cursor.close()
        conn.close()
        
        print(f"\n🎉 COMPREHENSIVE HUD RICH DATA DEPLOYMENT COMPLETE!")
        print(f"Platform now has extensive occupancy, pricing, and demographic data for enhanced filtering!")
        
    except Exception as e:
        print(f"❌ Error in comprehensive verification: {e}")

if __name__ == "__main__":
    deploy_comprehensive_hud_data()