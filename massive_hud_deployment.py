#!/usr/bin/env python3
"""
MASSIVE HUD DEPLOYMENT - Complete US Coverage
Deploy comprehensive HUD data across all remaining US states systematically
"""
import os
import time
import psycopg2
from real_hud_api_collector import RealHUDAPICollector

def massive_hud_deployment():
    """Deploy HUD data systematically across all US states"""
    print("🚀 MASSIVE HUD DEPLOYMENT - COMPLETE US COVERAGE")
    print("="*80)
    
    collector = RealHUDAPICollector()
    
    # Complete list of all US states prioritized by population/value
    all_us_states = [
        ('CA', 'California'), ('TX', 'Texas'), ('FL', 'Florida'), ('NY', 'New York'),
        ('PA', 'Pennsylvania'), ('IL', 'Illinois'), ('OH', 'Ohio'), ('GA', 'Georgia'),
        ('NC', 'North Carolina'), ('MI', 'Michigan'), ('NJ', 'New Jersey'), 
        ('VA', 'Virginia'), ('WA', 'Washington'), ('AZ', 'Arizona'), ('MA', 'Massachusetts'),
        ('TN', 'Tennessee'), ('IN', 'Indiana'), ('MO', 'Missouri'), ('MD', 'Maryland'),
        ('WI', 'Wisconsin'), ('CO', 'Colorado'), ('MN', 'Minnesota'), ('SC', 'South Carolina'),
        ('AL', 'Alabama'), ('LA', 'Louisiana'), ('KY', 'Kentucky'), ('OR', 'Oregon'),
        ('OK', 'Oklahoma'), ('CT', 'Connecticut'), ('IA', 'Iowa'), ('MS', 'Mississippi'),
        ('AR', 'Arkansas'), ('KS', 'Kansas'), ('UT', 'Utah'), ('NV', 'Nevada'),
        ('NM', 'New Mexico'), ('WV', 'West Virginia'), ('NE', 'Nebraska'), ('ID', 'Idaho'),
        ('HI', 'Hawaii'), ('NH', 'New Hampshire'), ('ME', 'Maine'), ('MT', 'Montana'),
        ('RI', 'Rhode Island'), ('DE', 'Delaware'), ('SD', 'South Dakota'), ('ND', 'North Dakota'),
        ('AK', 'Alaska'), ('VT', 'Vermont'), ('WY', 'Wyoming')
    ]
    
    deployment_stats = {
        'states_completed': 0,
        'total_properties_added': 0,
        'states_with_data': [],
        'deployment_errors': []
    }
    
    for state_code, state_name in all_us_states:
        print(f"\n🗺️ DEPLOYING {state_name.upper()} ({state_code})")
        print("-" * 60)
        
        try:
            # Check existing coverage
            existing_count = check_hud_coverage(state_code)
            if existing_count > 50:
                print(f"   ✅ Already has {existing_count} HUD properties - skipping")
                deployment_stats['states_completed'] += 1
                deployment_stats['states_with_data'].append(f"{state_code}: {existing_count} properties")
                continue
            
            # Comprehensive HUD data collection
            all_state_properties = []
            
            # Section 202 Elderly Housing
            print("   📋 Collecting Section 202 Elderly Housing...")
            section_202 = collector.query_hud_section_202_by_state(state_code)
            if section_202:
                for feature in section_202:
                    processed = collector.process_hud_property(feature, "Section 202 Elderly Housing")
                    if processed and processed.get('name'):
                        all_state_properties.append(processed)
                print(f"      ✅ Found {len(section_202)} Section 202 properties")
            
            # Multifamily Elderly Housing
            print("   🏢 Collecting Multifamily Elderly Housing...")
            multifamily = collector.query_hud_multifamily_elderly(state_code)
            if multifamily:
                for feature in multifamily:
                    processed = collector.process_hud_property(feature, "HUD Multifamily Elderly Housing")
                    if processed and processed.get('name'):
                        all_state_properties.append(processed)
                print(f"      ✅ Found {len(multifamily)} Multifamily properties")
            
            # Remove duplicates by HUD Property ID
            unique_properties = []
            seen_hud_ids = set()
            for prop in all_state_properties:
                hud_id = prop.get('hud_property_id')
                if hud_id and hud_id not in seen_hud_ids:
                    seen_hud_ids.add(hud_id)
                    unique_properties.append(prop)
            
            # Save to database
            if unique_properties:
                print(f"   💾 Saving {len(unique_properties)} unique properties...")
                saved_count = collector.save_authentic_properties_to_database(unique_properties, state_code)
                
                if saved_count > 0:
                    print(f"   ✅ Successfully added {saved_count} properties to {state_name}")
                    deployment_stats['total_properties_added'] += saved_count
                    deployment_stats['states_with_data'].append(f"{state_code}: {saved_count} properties")
                    
                    # Show sample of rich data
                    if len(unique_properties) >= 1:
                        sample = unique_properties[0]
                        units = sample.get('total_units_hud', 'N/A')
                        occupancy = sample.get('occupancy_rate_hud', 'N/A')
                        rent = sample.get('rent_per_month', 'N/A')
                        mgmt = sample.get('management_company', 'N/A')
                        print(f"   📊 Sample: {units} units, {occupancy}% occupied, ${rent}/month - {mgmt}")
                else:
                    print(f"   ⚠️ No properties saved for {state_name}")
            else:
                print(f"   ❌ No HUD properties found for {state_name}")
            
            deployment_stats['states_completed'] += 1
            
        except Exception as e:
            error_msg = f"{state_name}: {str(e)}"
            print(f"   ❌ Error deploying {state_name}: {e}")
            deployment_stats['deployment_errors'].append(error_msg)
            continue
    
    # Final deployment summary
    print(f"\n🎯 MASSIVE HUD DEPLOYMENT COMPLETE!")
    print("=" * 80)
    print(f"States Processed: {deployment_stats['states_completed']}")
    print(f"Total Properties Added: {deployment_stats['total_properties_added']:,}")
    print(f"States with HUD Data: {len(deployment_stats['states_with_data'])}")
    
    if deployment_stats['states_with_data']:
        print(f"\n📊 HUD COVERAGE BY STATE:")
        for state_info in deployment_stats['states_with_data'][:20]:  # Top 20
            print(f"   {state_info}")
    
    if deployment_stats['deployment_errors']:
        print(f"\n⚠️ DEPLOYMENT ERRORS ({len(deployment_stats['deployment_errors'])}):")
        for error in deployment_stats['deployment_errors'][:10]:  # Top 10 errors
            print(f"   {error}")
    
    # Final verification
    final_database_verification()

def check_hud_coverage(state_code):
    """Check existing HUD coverage for a state"""
    try:
        db_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT COUNT(*) FROM communities 
            WHERE state = %s AND hud_property_id IS NOT NULL
        """, (state_code,))
        
        count = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        return count
    except:
        return 0

def final_database_verification():
    """Final comprehensive database verification"""
    print(f"\n🔍 FINAL DATABASE VERIFICATION")
    print("=" * 50)
    
    try:
        db_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        # Overall HUD statistics
        cursor.execute("""
            SELECT 
                COUNT(*) as total_hud,
                COUNT(DISTINCT state) as states_covered,
                SUM(total_units_hud) as total_units,
                AVG(occupancy_rate_hud) as avg_occupancy,
                COUNT(CASE WHEN rent_per_month > 0 THEN 1 END) as with_pricing,
                COUNT(CASE WHEN management_company IS NOT NULL THEN 1 END) as with_mgmt
            FROM communities 
            WHERE hud_property_id IS NOT NULL
        """)
        
        overall_stats = cursor.fetchone()
        if overall_stats:
            total, states, units, occupancy, pricing, mgmt = overall_stats
            print(f"🏆 NATIONWIDE HUD TOTALS:")
            print(f"   Total HUD Properties: {total:,}")
            print(f"   States Covered: {states}")
            print(f"   Total Housing Units: {units:,}")
            print(f"   Average Occupancy: {occupancy:.1f}%")
            print(f"   With Pricing Data: {pricing:,} ({(pricing/total*100):.1f}%)")
            print(f"   With Management Info: {mgmt:,} ({(mgmt/total*100):.1f}%)")
        
        # Top 15 states by HUD coverage
        cursor.execute("""
            SELECT state, COUNT(*) as count,
                   AVG(total_units_hud) as avg_units,
                   AVG(occupancy_rate_hud) as avg_occupancy,
                   COUNT(CASE WHEN rent_per_month > 0 THEN 1 END) as with_rent
            FROM communities 
            WHERE hud_property_id IS NOT NULL
            GROUP BY state 
            ORDER BY count DESC 
            LIMIT 15
        """)
        
        top_states = cursor.fetchall()
        print(f"\n🗺️ TOP 15 STATES BY HUD COVERAGE:")
        for state, count, avg_units, avg_occ, with_rent in top_states:
            avg_units_str = f"{avg_units:.0f}" if avg_units else "N/A"
            avg_occ_str = f"{avg_occ:.1f}%" if avg_occ else "N/A"
            rent_pct = (with_rent/count*100) if count > 0 else 0
            print(f"   {state}: {count:,} properties | {avg_units_str} avg units | {avg_occ_str} occupancy | {rent_pct:.0f}% with rent")
        
        cursor.close()
        conn.close()
        
        print(f"\n✅ MASSIVE HUD DEPLOYMENT VERIFICATION COMPLETE")
        print(f"Platform now has comprehensive HUD coverage across major US states!")
        
    except Exception as e:
        print(f"❌ Error in verification: {e}")

if __name__ == "__main__":
    massive_hud_deployment()