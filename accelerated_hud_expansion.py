#!/usr/bin/env python3
"""
ACCELERATED HUD EXPANSION - Complete All Remaining States
High-speed deployment of comprehensive HUD data nationwide
"""
import os
import time
import logging
import psycopg2
from real_hud_api_collector import RealHUDAPICollector

def accelerated_hud_deployment():
    """Accelerated deployment for remaining states"""
    print("🚀 ACCELERATED HUD DEPLOYMENT - ALL REMAINING STATES")
    print("="*80)
    
    collector = RealHUDAPICollector()
    
    # Prioritized state list - focus on high-value states first
    priority_states = [
        ('PA', 'Pennsylvania'),
        ('IL', 'Illinois'), 
        ('OH', 'Ohio'),
        ('MI', 'Michigan'),
        ('GA', 'Georgia'),
        ('NC', 'North Carolina'),
        ('NJ', 'New Jersey'),
        ('VA', 'Virginia'),
        ('WA', 'Washington'),
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
        ('NM', 'New Mexico')
    ]
    
    deployment_summary = {'total_added': 0, 'states_completed': 0}
    
    for state_code, state_name in priority_states:
        print(f"\n🗺️ {state_name} ({state_code})")
        
        # Quick existing check
        existing = check_existing_count(state_code)
        if existing > 20:
            print(f"   ⚠️ Has {existing} properties - skipping")
            continue
            
        try:
            # Rapid collection
            all_properties = []
            
            # Section 202
            section_202 = collector.query_hud_section_202_by_state(state_code)
            if section_202:
                for feature in section_202:
                    processed = collector.process_hud_property(feature, "Section 202")
                    if processed and processed.get('name'):
                        all_properties.append(processed)
            
            # Multifamily
            multifamily = collector.query_hud_multifamily_elderly(state_code)
            if multifamily:
                for feature in multifamily:
                    processed = collector.process_hud_property(feature, "Multifamily")
                    if processed and processed.get('name'):
                        all_properties.append(processed)
            
            # Dedupe by HUD ID
            unique_props = []
            seen_ids = set()
            for prop in all_properties:
                hud_id = prop.get('hud_property_id')
                if hud_id and hud_id not in seen_ids:
                    seen_ids.add(hud_id)
                    unique_props.append(prop)
            
            if unique_props:
                print(f"   💾 Adding {len(unique_props)} properties...")
                added = collector.save_authentic_properties_to_database(unique_props, state_code)
                print(f"   ✅ Added {added} properties")
                
                deployment_summary['total_added'] += added
                deployment_summary['states_completed'] += 1
                
                # Quick sample of rich data
                if len(unique_props) >= 1:
                    sample = unique_props[0]
                    units = sample.get('total_units_hud', 'N/A')
                    occupancy = sample.get('occupancy_rate_hud', 'N/A')
                    rent = sample.get('rent_per_month', 'N/A')
                    print(f"   📊 Sample: {units} units, {occupancy}% occupied, ${rent}/month")
            else:
                print("   ❌ No properties found")
                
        except Exception as e:
            print(f"   ❌ Error: {e}")
            continue
    
    print(f"\n🎯 ACCELERATED DEPLOYMENT COMPLETE!")
    print(f"States Completed: {deployment_summary['states_completed']}")
    print(f"Total Properties Added: {deployment_summary['total_added']:,}")
    
    # Final verification
    final_verification()

def check_existing_count(state_code):
    """Quick check for existing HUD data"""
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

def final_verification():
    """Final comprehensive verification"""
    print("\n🔍 FINAL VERIFICATION")
    print("="*40)
    
    try:
        db_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        # Overall stats
        cursor.execute("""
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN total_units_hud > 0 THEN 1 END) as with_units,
                COUNT(CASE WHEN occupancy_rate_hud > 0 THEN 1 END) as with_occupancy,
                COUNT(CASE WHEN rent_per_month > 0 THEN 1 END) as with_rent,
                SUM(total_units_hud) as total_units,
                AVG(occupancy_rate_hud) as avg_occupancy
            FROM communities WHERE hud_property_id IS NOT NULL
        """)
        
        stats = cursor.fetchone()
        if stats:
            total, units, occupancy, rent, total_units, avg_occ = stats
            print(f"🏆 NATIONWIDE HUD TOTALS:")
            print(f"   Properties: {total:,}")
            print(f"   Total Units: {total_units:,}")
            print(f"   With Unit Data: {units:,} ({(units/total*100):.1f}%)")
            print(f"   With Occupancy: {occupancy:,} ({(occupancy/total*100):.1f}%)")
            print(f"   With Rent Data: {rent:,} ({(rent/total*100):.1f}%)")
            print(f"   Avg Occupancy: {avg_occ:.1f}%")
        
        # Top states
        cursor.execute("""
            SELECT state, COUNT(*) as count,
                   AVG(total_units_hud) as avg_units
            FROM communities 
            WHERE hud_property_id IS NOT NULL
            GROUP BY state 
            ORDER BY count DESC 
            LIMIT 10
        """)
        
        top_states = cursor.fetchall()
        print(f"\n🗺️ TOP 10 STATES:")
        for state, count, avg_units in top_states:
            avg_str = f"{avg_units:.0f}" if avg_units else "N/A"
            print(f"   {state}: {count:,} properties (avg {avg_str} units)")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"Error in verification: {e}")

if __name__ == "__main__":
    accelerated_hud_deployment()