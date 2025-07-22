#!/usr/bin/env python3
"""
COMPREHENSIVE NATIONWIDE HUD RICH DATA COLLECTOR
Systematic state-by-state deployment of comprehensive HUD data collection
Focus on ALL valuable information: occupancy, pricing, demographics, management
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
        logging.FileHandler('nationwide_hud_deployment.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def deploy_nationwide_hud_rich_data():
    """Deploy comprehensive HUD rich data collection nationwide"""
    print("="*120)
    print("🚀 COMPREHENSIVE NATIONWIDE HUD RICH DATA DEPLOYMENT")
    print("Collecting ALL valuable information: occupancy, pricing, demographics, management contacts")
    print("="*120)
    
    # Initialize collector
    collector = RealHUDAPICollector()
    
    # All remaining states for systematic coverage
    target_states = [
        # High Priority States (Large populations)
        ('NY', 'New York'),
        ('PA', 'Pennsylvania'),
        ('IL', 'Illinois'),
        ('OH', 'Ohio'),
        ('GA', 'Georgia'),
        ('NC', 'North Carolina'),
        ('MI', 'Michigan'),
        ('NJ', 'New Jersey'),
        ('VA', 'Virginia'),
        ('WA', 'Washington'),
        
        # Medium Priority States
        ('AZ', 'Arizona'),
        ('MA', 'Massachusetts'),
        ('TN', 'Tennessee'),
        ('IN', 'Indiana'),
        ('MO', 'Missouri'),
        ('MD', 'Maryland'),
        ('WI', 'Wisconsin'),
        ('CO', 'Colorado'),
        ('MN', 'Minnesota'),
        ('SC', 'South Carolina'),
        
        # Smaller States (Complete Coverage)
        ('AL', 'Alabama'),
        ('LA', 'Louisiana'),
        ('KY', 'Kentucky'),
        ('OR', 'Oregon'),
        ('OK', 'Oklahoma'),
        ('CT', 'Connecticut'),
        ('IA', 'Iowa'),
        ('MS', 'Mississippi'),
        ('AR', 'Arkansas'),
        ('KS', 'Kansas'),
        ('UT', 'Utah'),
        ('NV', 'Nevada'),
        ('NM', 'New Mexico'),
        ('WV', 'West Virginia'),
        ('ID', 'Idaho'),
        ('HI', 'Hawaii'),
        ('NH', 'New Hampshire'),
        ('ME', 'Maine'),
        ('MT', 'Montana'),
        ('RI', 'Rhode Island'),
        ('DE', 'Delaware'),
        ('SD', 'South Dakota'),
        ('ND', 'North Dakota'),
        ('AK', 'Alaska'),
        ('VT', 'Vermont'),
        ('WY', 'Wyoming'),
        
        # US Territories
        ('PR', 'Puerto Rico'),
        ('VI', 'US Virgin Islands'),
        ('GU', 'Guam'),
        ('DC', 'Washington DC')
    ]
    
    nationwide_stats = {
        'total_states_processed': 0,
        'total_properties_processed': 0,
        'total_properties_added': 0,
        'states_completed': 0,
        'properties_by_state': {},
        'rich_data_stats': {
            'total_with_units': 0,
            'total_with_occupancy': 0,
            'total_with_rent': 0,
            'total_with_demographics': 0,
            'total_with_management': 0
        }
    }
    
    for state_code, state_name in target_states:
        print(f"\n🗺️ DEPLOYING {state_name.upper()} ({state_code}) - Comprehensive HUD Rich Data")
        print("="*90)
        
        state_start_time = time.time()
        
        try:
            # Check if state already has substantial HUD data
            existing_count = check_existing_hud_data(state_code)
            if existing_count > 50:  # Skip states with substantial existing data
                print(f"⚠️  {state_name} already has {existing_count} HUD properties - skipping")
                continue
            
            state_properties = []
            
            # Collect Section 202 Elderly Housing
            print(f"🏛️ Collecting HUD Section 202 Elderly Housing...")
            section_202_data = collector.query_hud_section_202_by_state(state_code)
            
            if section_202_data:
                print(f"✅ Found {len(section_202_data)} Section 202 properties")
                for feature in section_202_data:
                    processed = collector.process_hud_property(feature, "Section 202 Elderly Housing")
                    if processed and processed.get('name') and processed.get('city'):
                        state_properties.append(processed)
            
            # Collect Multifamily Elderly Housing
            print(f"🏠 Collecting HUD Multifamily Elderly Housing...")
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
                elif not hud_id and prop.get('name'):  # Include properties without HUD ID if they have name
                    unique_properties.append(prop)
            
            if unique_properties:
                print(f"💾 Processing {len(unique_properties)} unique properties...")
                
                # Show sample of rich data being collected
                print_rich_data_sample(unique_properties[:3], state_name)
                
                # Save to database
                added_count = collector.save_authentic_properties_to_database(unique_properties, state_code)
                
                # Update stats
                nationwide_stats['total_properties_processed'] += len(unique_properties)
                nationwide_stats['total_properties_added'] += added_count
                nationwide_stats['properties_by_state'][state_code] = {
                    'name': state_name,
                    'processed': len(unique_properties),
                    'added': added_count,
                    'skipped': len(unique_properties) - added_count
                }
                
                state_duration = time.time() - state_start_time
                print(f"\n📊 {state_name.upper()} DEPLOYMENT COMPLETE:")
                print(f"   Properties Added: {added_count}")
                print(f"   Duration: {state_duration:.1f} seconds")
                
                # Verify rich data for this state
                verify_state_rich_data_quality(state_code, state_name)
                
                nationwide_stats['states_completed'] += 1
            else:
                print(f"❌ No valid properties found for {state_name}")
                
            nationwide_stats['total_states_processed'] += 1
            
        except Exception as e:
            print(f"❌ Error processing {state_name}: {e}")
            continue
    
    # Final comprehensive summary
    print_nationwide_deployment_summary(nationwide_stats)
    verify_nationwide_rich_data_deployment()

def check_existing_hud_data(state_code):
    """Check if state already has substantial HUD data"""
    try:
        db_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT COUNT(*) 
            FROM communities 
            WHERE state = %s AND hud_property_id IS NOT NULL
        """, (state_code,))
        
        count = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        return count
        
    except Exception as e:
        print(f"Error checking existing data for {state_code}: {e}")
        return 0

def print_rich_data_sample(properties, state_name):
    """Print sample of rich data being collected"""
    if not properties:
        return
        
    print(f"\n📋 RICH DATA SAMPLE FOR {state_name.upper()}:")
    for i, prop in enumerate(properties, 1):
        print(f"   {i}. {prop['name']} ({prop['city']})")
        print(f"      🏠 Units: {prop.get('total_units_hud', 'N/A')}")
        print(f"      👥 Occupancy: {prop.get('occupancy_rate_hud', 'N/A')}%")
        print(f"      💰 Rent: ${prop.get('rent_per_month', 'N/A')}/month")
        print(f"      👴 Seniors 62+: {prop.get('age_62_plus_pct', 'N/A')}%")
        print(f"      🏢 Management: {prop.get('management_company', 'N/A')}")

def verify_state_rich_data_quality(state_code, state_name):
    """Verify rich data quality for a specific state"""
    try:
        db_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN total_units_hud > 0 THEN 1 END) as with_units,
                COUNT(CASE WHEN occupancy_rate_hud > 0 THEN 1 END) as with_occupancy,
                COUNT(CASE WHEN rent_per_month > 0 THEN 1 END) as with_rent,
                COUNT(CASE WHEN age_62_plus_pct > 0 THEN 1 END) as with_demographics,
                COUNT(CASE WHEN management_company IS NOT NULL AND management_company != '' THEN 1 END) as with_mgmt,
                AVG(total_units_hud) as avg_units,
                AVG(occupancy_rate_hud) as avg_occupancy,
                AVG(rent_per_month) as avg_rent
            FROM communities 
            WHERE state = %s AND hud_property_id IS NOT NULL
        """, (state_code,))
        
        stats = cursor.fetchone()
        if stats and stats[0] > 0:
            total, units, occupancy, rent, demographics, mgmt, avg_units, avg_occupancy, avg_rent = stats
            print(f"   ✅ Rich Data Quality Check:")
            print(f"      Unit Data: {units}/{total} ({(units/total*100):.1f}%)")
            print(f"      Occupancy Data: {occupancy}/{total} ({(occupancy/total*100):.1f}%)")
            print(f"      Rent Data: {rent}/{total} ({(rent/total*100):.1f}%)")
            print(f"      Demographics: {demographics}/{total} ({(demographics/total*100):.1f}%)")
            print(f"      Management: {mgmt}/{total} ({(mgmt/total*100):.1f}%)")
            
            if avg_units:
                print(f"      Avg Units: {avg_units:.1f}, Avg Occupancy: {avg_occupancy:.1f}%, Avg Rent: ${avg_rent:.2f}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"Error verifying {state_name} data quality: {e}")

def print_nationwide_deployment_summary(stats):
    """Print comprehensive nationwide deployment summary"""
    print("\n" + "="*120)
    print("🎯 NATIONWIDE HUD RICH DATA DEPLOYMENT SUMMARY")
    print("="*120)
    
    print(f"States Processed: {stats['total_states_processed']}")
    print(f"States Completed: {stats['states_completed']}")
    print(f"Total Properties Processed: {stats['total_properties_processed']:,}")
    print(f"Total Properties Added: {stats['total_properties_added']:,}")
    
    if stats['properties_by_state']:
        print(f"\nTop States by Properties Added:")
        sorted_states = sorted(stats['properties_by_state'].items(), 
                             key=lambda x: x[1]['added'], reverse=True)
        for i, (state_code, data) in enumerate(sorted_states[:10], 1):
            print(f"  {i:2d}. {data['name']}: {data['added']} properties added")

def verify_nationwide_rich_data_deployment():
    """Verify the nationwide rich data deployment"""
    print("\n🔍 NATIONWIDE RICH DATA DEPLOYMENT VERIFICATION")
    print("="*70)
    
    try:
        db_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        # Overall nationwide HUD statistics
        cursor.execute("""
            SELECT 
                COUNT(*) as total_hud,
                COUNT(CASE WHEN total_units_hud > 0 THEN 1 END) as with_units,
                COUNT(CASE WHEN occupancy_rate_hud > 0 THEN 1 END) as with_occupancy,
                COUNT(CASE WHEN rent_per_month > 0 THEN 1 END) as with_rent,
                COUNT(CASE WHEN age_62_plus_pct > 0 THEN 1 END) as with_demographics,
                COUNT(CASE WHEN management_company IS NOT NULL AND management_company != '' THEN 1 END) as with_mgmt,
                AVG(total_units_hud) as avg_units,
                AVG(occupancy_rate_hud) as avg_occupancy,
                AVG(rent_per_month) as avg_rent,
                SUM(total_units_hud) as total_units_nationwide
            FROM communities 
            WHERE hud_property_id IS NOT NULL
        """)
        
        overall_stats = cursor.fetchone()
        if overall_stats:
            total, units, occupancy, rent, demographics, mgmt, avg_units, avg_occupancy, avg_rent, total_units = overall_stats
            
            print(f"🏆 NATIONWIDE DEPLOYMENT SUCCESS:")
            print(f"   Total HUD Properties: {total:,}")
            print(f"   Total Housing Units: {total_units:,}")
            print(f"   Properties with Unit Data: {units:,} ({(units/total*100):.1f}%)")
            print(f"   Properties with Occupancy Data: {occupancy:,} ({(occupancy/total*100):.1f}%)")
            print(f"   Properties with Rent Data: {rent:,} ({(rent/total*100):.1f}%)")
            print(f"   Properties with Demographics: {demographics:,} ({(demographics/total*100):.1f}%)")
            print(f"   Properties with Management Data: {mgmt:,} ({(mgmt/total*100):.1f}%)")
            
            if avg_units:
                print(f"\n📊 NATIONWIDE AVERAGES:")
                print(f"   Average Units per Property: {avg_units:.1f}")
                print(f"   Average Occupancy Rate: {avg_occupancy:.1f}%")
                print(f"   Average Monthly Rent: ${avg_rent:.2f}")
        
        # State-by-state coverage summary
        cursor.execute("""
            SELECT state, COUNT(*) as hud_count,
                   AVG(total_units_hud) as avg_units,
                   AVG(occupancy_rate_hud) as avg_occupancy
            FROM communities 
            WHERE hud_property_id IS NOT NULL
            GROUP BY state 
            ORDER BY hud_count DESC
            LIMIT 15
        """)
        
        state_coverage = cursor.fetchall()
        if state_coverage:
            print(f"\n🗺️  TOP STATES BY HUD COVERAGE:")
            for state, count, avg_units, avg_occupancy in state_coverage:
                avg_units_str = f"{avg_units:.0f}" if avg_units else "N/A"
                avg_occupancy_str = f"{avg_occupancy:.1f}%" if avg_occupancy else "N/A"
                print(f"   {state}: {count:,} properties (avg {avg_units_str} units, {avg_occupancy_str} occupancy)")
        
        cursor.close()
        conn.close()
        
        print(f"\n🎉 NATIONWIDE HUD RICH DATA DEPLOYMENT COMPLETE!")
        print(f"Platform now has comprehensive nationwide coverage with valuable filtering data!")
        
    except Exception as e:
        print(f"❌ Error in nationwide verification: {e}")

if __name__ == "__main__":
    deploy_nationwide_hud_rich_data()