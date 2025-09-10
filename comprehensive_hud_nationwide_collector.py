#!/usr/bin/env python3
"""
COMPREHENSIVE HUD NATIONWIDE COLLECTOR - Final push to complete all remaining states
Deploy remaining US states and territories for complete nationwide coverage
"""
import os
import psycopg2
from real_hud_api_collector import RealHUDAPICollector

def comprehensive_nationwide_deployment():
    """Complete nationwide HUD deployment across all remaining states and territories"""
    print("🇺🇸 COMPREHENSIVE NATIONWIDE HUD DEPLOYMENT")
    print("="*80)
    
    collector = RealHUDAPICollector()
    
    # Complete remaining states and territories for total US coverage
    remaining_states_territories = [
        ('NY', 'New York'),      # Major state - high priority
        ('IN', 'Indiana'),       # Midwest coverage
        ('MO', 'Missouri'),      # Central US
        ('LA', 'Louisiana'),     # Gulf Coast
        ('NV', 'Nevada'),        # Western US
        ('HI', 'Hawaii'),        # Pacific territory
        ('NM', 'New Mexico'),    # Southwest
        ('WV', 'West Virginia'), # Appalachian region
        ('ND', 'North Dakota'),  # Northern plains
        ('SD', 'South Dakota'),  # Northern plains
        ('VT', 'Vermont'),       # Northeast
        ('WY', 'Wyoming'),       # Mountain West
        ('AK', 'Alaska'),        # Arctic territory
        ('MT', 'Montana'),       # Mountain West
        ('RI', 'Rhode Island'),  # New England
        ('DE', 'Delaware'),      # Mid-Atlantic
        ('DC', 'Washington DC')  # Federal district
    ]
    
    success_count = 0
    total_added = 0
    
    for state_code, state_name in remaining_states_territories:
        print(f"\n🗺️ DEPLOYING {state_name.upper()} ({state_code})")
        
        try:
            # Check if already has substantial coverage
            existing = get_hud_count(state_code)
            if existing > 50:
                print(f"   ✅ Already covered with {existing} properties")
                success_count += 1
                continue
            
            # Rapid collection focusing on quality data
            properties = rapid_quality_collection(collector, state_code)
            
            if properties:
                # Efficient save with validation
                saved = efficient_save_with_validation(collector, properties, state_code)
                if saved > 0:
                    print(f"   ✅ DEPLOYED: {saved} properties in {state_name}")
                    success_count += 1
                    total_added += saved
                    
                    # Quick quality check
                    show_deployment_sample(properties[:2])
                else:
                    print(f"   ⚠️ No valid saves for {state_name}")
            else:
                print(f"   ❌ No data found for {state_name}")
                
        except Exception as e:
            print(f"   ❌ Deployment error for {state_name}: {e}")
            continue
    
    print(f"\n🎯 NATIONWIDE DEPLOYMENT COMPLETE!")
    print(f"   States Successfully Deployed: {success_count}")
    print(f"   Total Properties Added: {total_added:,}")
    
    # Final comprehensive verification
    comprehensive_platform_verification()

def rapid_quality_collection(collector, state_code):
    """Rapidly collect highest quality HUD properties"""
    properties = []
    
    try:
        # Focus on Section 202 - highest senior concentration
        section_202 = collector.query_hud_section_202_by_state(state_code)
        if section_202:
            for feature in section_202[:75]:  # Limit for speed
                processed = collector.process_hud_property(feature, "Section 202 Elderly Housing")
                if is_quality_property(processed):
                    properties.append(processed)
        
        # Add multifamily elderly if needed
        if len(properties) < 30:  # Need more coverage
            multifamily = collector.query_hud_multifamily_elderly(state_code)
            if multifamily:
                for feature in multifamily[:50]:
                    processed = collector.process_hud_property(feature, "HUD Multifamily Elderly Housing")
                    if is_quality_property(processed):
                        properties.append(processed)
        
        # Deduplicate by HUD ID and name
        unique_props = []
        seen = set()
        for prop in properties:
            key = f"{prop.get('hud_property_id')}_{prop.get('name', '')}"
            if key not in seen:
                seen.add(key)
                unique_props.append(prop)
        
        print(f"      📊 Collected {len(unique_props)} quality properties")
        return unique_props
        
    except Exception as e:
        print(f"      ❌ Collection error: {e}")
        return []

def is_quality_property(prop):
    """Validate property meets quality standards"""
    if not prop or not prop.get('name') or not prop.get('hud_property_id'):
        return False
    
    # Clean invalid data
    rent = prop.get('rent_per_month')
    if rent is not None and rent < 0:
        prop['rent_per_month'] = None
    
    occupancy = prop.get('occupancy_rate_hud')
    if occupancy is not None and (occupancy < 0 or occupancy > 100):
        prop['occupancy_rate_hud'] = None
    
    units = prop.get('total_units_hud')
    if units is not None and (units <= 0 or units > 2000):
        prop['total_units_hud'] = None
    
    return True

def efficient_save_with_validation(collector, properties, state_code):
    """Save with comprehensive error handling"""
    if not properties:
        return 0
    
    try:
        return collector.save_authentic_properties_to_database(properties, state_code)
    except Exception as e:
        print(f"      ⚠️ Batch save failed: {e}")
        # Individual saves for error isolation
        saved_count = 0
        for prop in properties:
            try:
                saved = collector.save_authentic_properties_to_database([prop], state_code)
                saved_count += saved
            except:
                continue
        return saved_count

def show_deployment_sample(properties):
    """Show sample of deployed properties"""
    for i, prop in enumerate(properties, 1):
        name = prop.get('name', 'Unknown')[:40]
        units = prop.get('total_units_hud', 'N/A')
        occupancy = prop.get('occupancy_rate_hud', 'N/A')
        print(f"      {i}. {name} - {units} units, {occupancy}% occupied")

def get_hud_count(state_code):
    """Get current HUD property count for state"""
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

def comprehensive_platform_verification():
    """Final comprehensive platform verification"""
    print(f"\n🏆 COMPREHENSIVE PLATFORM VERIFICATION")
    print("="*60)
    
    try:
        db_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        # Platform totals
        cursor.execute("""
            SELECT 
                COUNT(*) as total_hud,
                COUNT(DISTINCT state) as states,
                SUM(COALESCE(total_units_hud, 0)) as total_units,
                AVG(occupancy_rate_hud) as avg_occupancy,
                COUNT(CASE WHEN rent_per_month > 0 THEN 1 END) as with_rent,
                COUNT(CASE WHEN management_company IS NOT NULL THEN 1 END) as with_mgmt
            FROM communities 
            WHERE hud_property_id IS NOT NULL
        """)
        
        platform_stats = cursor.fetchone()
        if platform_stats:
            total, states, units, occupancy, rent_count, mgmt_count = platform_stats
            print(f"🇺🇸 NATIONWIDE PLATFORM TOTALS:")
            print(f"   Total HUD Properties: {total:,}")
            print(f"   States/Territories: {states}")
            print(f"   Total Housing Units: {units:,}")
            print(f"   Average Occupancy: {occupancy:.1f}%")
            print(f"   With Pricing: {rent_count:,} ({(rent_count/total*100):.1f}%)")
            print(f"   With Management: {mgmt_count:,} ({(mgmt_count/total*100):.1f}%)")
        
        # Coverage by region
        cursor.execute("""
            SELECT state, COUNT(*) as count
            FROM communities 
            WHERE hud_property_id IS NOT NULL
            GROUP BY state
            HAVING COUNT(*) >= 10
            ORDER BY count DESC
        """)
        
        coverage = cursor.fetchall()
        print(f"\n📍 STATES WITH 10+ HUD PROPERTIES: {len(coverage)}")
        for state, count in coverage[:20]:  # Top 20
            print(f"   {state}: {count:,} properties")
        
        # Quality assessment
        cursor.execute("""
            SELECT 
                COUNT(CASE WHEN total_units_hud > 0 THEN 1 END) as valid_units,
                COUNT(CASE WHEN occupancy_rate_hud BETWEEN 0 AND 100 THEN 1 END) as valid_occupancy,
                COUNT(CASE WHEN rent_per_month > 0 THEN 1 END) as valid_rent,
                COUNT(*) as total
            FROM communities 
            WHERE hud_property_id IS NOT NULL
        """)
        
        quality = cursor.fetchone()
        if quality:
            units, occupancy, rent, total = quality
            print(f"\n📊 DATA QUALITY METRICS:")
            print(f"   Valid Units: {units:,}/{total:,} ({(units/total*100):.1f}%)")
            print(f"   Valid Occupancy: {occupancy:,}/{total:,} ({(occupancy/total*100):.1f}%)")
            print(f"   Valid Rent: {rent:,}/{total:,} ({(rent/total*100):.1f}%)")
        
        cursor.close()
        conn.close()
        
        print(f"\n✅ COMPREHENSIVE NATIONWIDE DEPLOYMENT SUCCESS!")
        print(f"Platform provides unprecedented HUD housing transparency across America!")
        
    except Exception as e:
        print(f"❌ Verification error: {e}")

if __name__ == "__main__":
    comprehensive_nationwide_deployment()