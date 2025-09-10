#!/usr/bin/env python3
"""
ENHANCED HUD COLLECTOR - Continue systematic deployment with improved validation
Focus on remaining high-value states with data integrity protection
"""
import os
import psycopg2
from real_hud_api_collector import RealHUDAPICollector

def enhanced_hud_collection():
    """Continue HUD deployment with enhanced validation and error handling"""
    print("🚀 ENHANCED HUD COLLECTION - CONTINUING SYSTEMATIC DEPLOYMENT")
    print("="*80)
    
    collector = RealHUDAPICollector()
    
    # Focus on remaining high-value states that need more coverage
    priority_remaining_states = [
        ('MN', 'Minnesota'),
        ('WI', 'Wisconsin'),
        ('MD', 'Maryland'),
        ('CO', 'Colorado'),
        ('SC', 'South Carolina'),
        ('AL', 'Alabama'),
        ('KY', 'Kentucky'),
        ('OR', 'Oregon'),
        ('OK', 'Oklahoma'),
        ('CT', 'Connecticut'),
        ('IA', 'Iowa'),
        ('MS', 'Mississippi'),
        ('AR', 'Arkansas'),
        ('KS', 'Kansas'),
        ('UT', 'Utah'),
        ('WV', 'West Virginia'),
        ('NE', 'Nebraska'),
        ('ID', 'Idaho'),
        ('NH', 'New Hampshire'),
        ('ME', 'Maine')
    ]
    
    deployment_results = {'successful': 0, 'failed': 0, 'total_added': 0}
    
    for state_code, state_name in priority_remaining_states:
        print(f"\n🗺️ PROCESSING {state_name.upper()} ({state_code})")
        
        # Check current coverage
        existing = get_existing_coverage(state_code)
        if existing > 30:
            print(f"   ✅ Already has {existing} properties - sufficient coverage")
            deployment_results['successful'] += 1
            continue
        
        try:
            # Enhanced collection with validation
            state_properties = collect_state_hud_data(collector, state_code, state_name)
            
            if state_properties:
                # Enhanced saving with validation
                saved = save_with_validation(collector, state_properties, state_code, state_name)
                if saved > 0:
                    print(f"   ✅ SUCCESS: Added {saved} properties to {state_name}")
                    deployment_results['successful'] += 1
                    deployment_results['total_added'] += saved
                    
                    # Show quality sample
                    show_quality_sample(state_properties[:1])
                else:
                    print(f"   ⚠️ No valid properties saved for {state_name}")
                    deployment_results['failed'] += 1
            else:
                print(f"   ❌ No HUD data found for {state_name}")
                deployment_results['failed'] += 1
                
        except Exception as e:
            print(f"   ❌ Error processing {state_name}: {e}")
            deployment_results['failed'] += 1
            continue
    
    # Final summary
    print(f"\n🎯 ENHANCED DEPLOYMENT SUMMARY:")
    print(f"   Successful: {deployment_results['successful']}")
    print(f"   Failed: {deployment_results['failed']}")
    print(f"   Properties Added: {deployment_results['total_added']:,}")
    
    # Quick database update
    get_final_totals()

def collect_state_hud_data(collector, state_code, state_name):
    """Collect HUD data for a state with validation"""
    all_properties = []
    
    try:
        # Section 202 collection
        section_202 = collector.query_hud_section_202_by_state(state_code)
        if section_202:
            for feature in section_202[:100]:  # Limit for efficiency
                processed = collector.process_hud_property(feature, "Section 202 Elderly Housing")
                if is_valid_property(processed):
                    all_properties.append(processed)
        
        # Multifamily collection  
        multifamily = collector.query_hud_multifamily_elderly(state_code)
        if multifamily:
            for feature in multifamily[:100]:  # Limit for efficiency
                processed = collector.process_hud_property(feature, "HUD Multifamily Elderly Housing")
                if is_valid_property(processed):
                    all_properties.append(processed)
        
        # Remove duplicates
        unique_properties = []
        seen_ids = set()
        for prop in all_properties:
            hud_id = prop.get('hud_property_id')
            prop_name = prop.get('name', '')
            key = f"{hud_id}_{prop_name}"
            if key not in seen_ids:
                seen_ids.add(key)
                unique_properties.append(prop)
        
        print(f"      📊 Collected {len(unique_properties)} unique valid properties")
        return unique_properties
        
    except Exception as e:
        print(f"      ❌ Error collecting data: {e}")
        return []

def is_valid_property(prop):
    """Validate property data before saving"""
    if not prop or not prop.get('name'):
        return False
    
    # Check for valid rent (exclude negative values that cause DB errors)
    rent = prop.get('rent_per_month')
    if rent is not None and rent < 0:
        prop['rent_per_month'] = None  # Clean invalid rent
    
    # Check occupancy rate
    occupancy = prop.get('occupancy_rate_hud')
    if occupancy is not None and (occupancy < 0 or occupancy > 100):
        prop['occupancy_rate_hud'] = None  # Clean invalid occupancy
    
    # Check unit count
    units = prop.get('total_units_hud')
    if units is not None and (units <= 0 or units > 2000):
        prop['total_units_hud'] = None  # Clean invalid units
    
    return True

def save_with_validation(collector, properties, state_code, state_name):
    """Save properties with enhanced validation and error handling"""
    if not properties:
        return 0
    
    try:
        saved_count = collector.save_authentic_properties_to_database(properties, state_code)
        return saved_count
    except Exception as e:
        print(f"      ⚠️ Database save error for {state_name}: {e}")
        # Try individual saves for better error isolation
        individual_saves = 0
        for prop in properties:
            try:
                saved = collector.save_authentic_properties_to_database([prop], state_code)
                individual_saves += saved
            except:
                continue  # Skip problematic individual properties
        return individual_saves

def show_quality_sample(properties):
    """Show sample of high-quality data"""
    if not properties:
        return
        
    prop = properties[0]
    name = prop.get('name', 'N/A')
    units = prop.get('total_units_hud', 'N/A')
    occupancy = prop.get('occupancy_rate_hud', 'N/A')
    rent = prop.get('rent_per_month', 'N/A')
    mgmt = prop.get('management_company', 'N/A')[:50] if prop.get('management_company') else 'N/A'
    
    print(f"      📊 Sample: {name} - {units} units, {occupancy}% occupied, ${rent}/month - {mgmt}")

def get_existing_coverage(state_code):
    """Get existing HUD coverage for state"""
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

def get_final_totals():
    """Get final database totals"""
    try:
        db_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                COUNT(*) as total,
                COUNT(DISTINCT state) as states,
                SUM(total_units_hud) as units,
                AVG(occupancy_rate_hud) as occupancy
            FROM communities 
            WHERE hud_property_id IS NOT NULL
        """)
        
        totals = cursor.fetchone()
        if totals:
            total, states, units, occupancy = totals
            print(f"\n🏆 CURRENT PLATFORM TOTALS:")
            print(f"   HUD Properties: {total:,}")
            print(f"   States Covered: {states}")
            print(f"   Housing Units: {units:,}")
            print(f"   Avg Occupancy: {occupancy:.1f}%")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error getting totals: {e}")

if __name__ == "__main__":
    enhanced_hud_collection()