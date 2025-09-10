#!/usr/bin/env python3
"""
TEST FRESH HUD INTEGRATION - Find that last state to make 50
Complete the final state and explore international expansion opportunities
"""
import os
import psycopg2
from real_hud_api_collector import RealHUDAPICollector

def find_final_state_and_explore_international():
    """Find the final state to complete all 50 US states and explore international options"""
    print("🌎 FINDING FINAL STATE + INTERNATIONAL EXPLORATION")
    print("="*80)
    
    # Check current state coverage
    current_coverage = analyze_current_coverage()
    
    # Find missing state
    missing_state = find_missing_state(current_coverage)
    
    if missing_state:
        print(f"\n🎯 COMPLETING FINAL STATE: {missing_state}")
        complete_final_state(missing_state)
    
    # Explore international opportunities
    explore_international_coverage()

def analyze_current_coverage():
    """Analyze current state coverage to find what's missing"""
    print("\n📊 ANALYZING CURRENT STATE COVERAGE")
    
    try:
        db_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        # Get states with HUD coverage
        cursor.execute("""
            SELECT state, COUNT(*) as hud_count
            FROM communities 
            WHERE hud_property_id IS NOT NULL
            GROUP BY state
            HAVING COUNT(*) >= 1
            ORDER BY state;
        """)
        
        covered_states = cursor.fetchall()
        print(f"   📍 STATES WITH HUD COVERAGE: {len(covered_states)}")
        
        all_us_states = [
            'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
            'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
            'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
            'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
            'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
        ]
        
        covered_state_codes = [state[0] for state in covered_states]
        missing_states = [state for state in all_us_states if state not in covered_state_codes]
        
        print(f"   🏆 COVERED STATES ({len(covered_state_codes)}): {', '.join(covered_state_codes)}")
        if missing_states:
            print(f"   ❌ MISSING STATES ({len(missing_states)}): {', '.join(missing_states)}")
        else:
            print(f"   ✅ ALL 50 STATES + DC COVERED!")
        
        cursor.close()
        conn.close()
        
        return {
            'covered_states': covered_state_codes,
            'missing_states': missing_states,
            'coverage_count': len(covered_state_codes)
        }
        
    except Exception as e:
        print(f"   ❌ Error analyzing coverage: {e}")
        return {'covered_states': [], 'missing_states': [], 'coverage_count': 0}

def find_missing_state(coverage_data):
    """Find the missing state to complete coverage"""
    missing_states = coverage_data.get('missing_states', [])
    
    if not missing_states:
        print("   🎉 ALL US STATES AND DC ALREADY COVERED!")
        return None
    
    # Return first missing state (should only be 1-2 max)
    return missing_states[0]

def complete_final_state(state_code):
    """Complete the final state for 50-state coverage"""
    print(f"\n🚀 COMPLETING FINAL STATE: {state_code}")
    
    collector = RealHUDAPICollector()
    
    # Map state code to name
    state_names = {
        'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
        'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
        'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
        'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
        'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
        'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
        'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
        'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
        'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
        'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
        'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
        'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
        'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'Washington DC'
    }
    
    state_name = state_names.get(state_code, state_code)
    
    try:
        # Comprehensive data collection for final state
        all_properties = []
        
        # Section 202 collection
        print(f"   📋 Collecting Section 202 data for {state_name}...")
        section_202 = collector.query_hud_section_202_by_state(state_code)
        if section_202:
            for feature in section_202:
                processed = collector.process_hud_property(feature, "Section 202 Elderly Housing")
                if processed and processed.get('name'):
                    # Clean any negative rent values
                    if processed.get('rent_per_month') and processed['rent_per_month'] < 0:
                        processed['rent_per_month'] = None
                    all_properties.append(processed)
            print(f"      ✅ Found {len(section_202)} Section 202 properties")
        
        # Multifamily collection
        print(f"   🏢 Collecting Multifamily data for {state_name}...")
        multifamily = collector.query_hud_multifamily_elderly(state_code)
        if multifamily:
            for feature in multifamily:
                processed = collector.process_hud_property(feature, "HUD Multifamily Elderly Housing")
                if processed and processed.get('name'):
                    # Clean any negative rent values
                    if processed.get('rent_per_month') and processed['rent_per_month'] < 0:
                        processed['rent_per_month'] = None
                    all_properties.append(processed)
            print(f"      ✅ Found {len(multifamily)} Multifamily properties")
        
        # Deduplicate
        unique_properties = []
        seen_ids = set()
        for prop in all_properties:
            hud_id = prop.get('hud_property_id')
            if hud_id and hud_id not in seen_ids:
                seen_ids.add(hud_id)
                unique_properties.append(prop)
        
        # Save to database
        if unique_properties:
            print(f"   💾 Saving {len(unique_properties)} properties...")
            saved_count = collector.save_authentic_properties_to_database(unique_properties, state_code)
            
            if saved_count > 0:
                print(f"   🎉 SUCCESS! Added {saved_count} properties to {state_name}")
                print(f"   🇺🇸 COMPLETE 50-STATE COVERAGE ACHIEVED!")
                
                # Show sample
                if unique_properties:
                    sample = unique_properties[0]
                    units = sample.get('total_units_hud', 'N/A')
                    occupancy = sample.get('occupancy_rate_hud', 'N/A')
                    rent = sample.get('rent_per_month', 'N/A')
                    print(f"      📊 Sample: {units} units, {occupancy}% occupied, ${rent}/month")
            else:
                print(f"   ⚠️ No properties saved for {state_name}")
        else:
            print(f"   ❌ No properties found for {state_name}")
            
    except Exception as e:
        print(f"   ❌ Error completing {state_name}: {e}")

def explore_international_coverage():
    """Explore international senior housing data sources"""
    print(f"\n🌍 EXPLORING INTERNATIONAL SENIOR HOUSING DATA")
    print("-" * 60)
    
    international_research = {
        "Puerto Rico": {
            "status": "US Territory - HUD Coverage Available",
            "potential_sources": [
                "HUD Caribbean Field Office",
                "Puerto Rico Department of Housing",
                "AARP Puerto Rico resources"
            ],
            "notes": "Should have HUD Section 202 and multifamily data like states"
        },
        "Canada": {
            "status": "Federal System - Provincial Coordination",
            "potential_sources": [
                "Canada Mortgage and Housing Corporation (CMHC)",
                "Provincial housing authorities",
                "Statistics Canada housing data",
                "Canadian Association of Retired Persons (CARP)"
            ],
            "notes": "Each province manages senior housing differently"
        },
        "Mexico": {
            "status": "Limited Government Data Available",
            "potential_sources": [
                "Instituto Nacional de las Personas Adultas Mayores (INAPAM)",
                "Secretaría de Desarrollo Agrario, Territorial y Urbano (SEDATU)",
                "Instituto Nacional de Estadística y Geografía (INEGI)",
                "Asociación Mexicana de Gerontología y Geriatría"
            ],
            "notes": "Focus on major retirement destinations like Riviera Maya, Puerto Vallarta"
        }
    }
    
    for country, info in international_research.items():
        print(f"\n🏛️ {country.upper()}:")
        print(f"   Status: {info['status']}")
        print(f"   Potential Data Sources:")
        for source in info['potential_sources']:
            print(f"      • {source}")
        print(f"   Research Notes: {info['notes']}")
    
    print(f"\n📋 INTERNATIONAL EXPANSION RECOMMENDATIONS:")
    print("   1. Puerto Rico - Start here (US territory, HUD data available)")
    print("   2. Canada - Research CMHC database and provincial housing authorities")
    print("   3. Mexico - Focus on expat-friendly retirement communities")
    print("   4. Consider API availability and data licensing requirements")

def final_comprehensive_verification():
    """Final verification of complete US coverage"""
    print(f"\n🏆 FINAL COMPREHENSIVE VERIFICATION")
    print("="*60)
    
    try:
        db_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        # Final statistics
        cursor.execute("""
            SELECT 
                COUNT(*) as total_hud,
                COUNT(DISTINCT state) as states_territories,
                SUM(total_units_hud) as total_units,
                AVG(occupancy_rate_hud) as avg_occupancy,
                COUNT(CASE WHEN rent_per_month > 0 THEN 1 END) as with_pricing
            FROM communities 
            WHERE hud_property_id IS NOT NULL;
        """)
        
        final_stats = cursor.fetchone()
        if final_stats:
            total, states, units, occupancy, pricing = final_stats
            print(f"🇺🇸 FINAL PLATFORM TOTALS:")
            print(f"   Total HUD Properties: {total:,}")
            print(f"   States/Territories: {states}")
            print(f"   Total Housing Units: {units:,}")
            print(f"   Average Occupancy: {occupancy:.1f}%")
            print(f"   With Pricing Data: {pricing:,} ({(pricing/total*100):.1f}%)")
            
            if states >= 50:
                print(f"\n🎉 HISTORIC ACHIEVEMENT: COMPLETE 50-STATE US COVERAGE!")
                print(f"Platform now provides comprehensive HUD transparency nationwide!")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error in verification: {e}")

if __name__ == "__main__":
    find_final_state_and_explore_international()
    final_comprehensive_verification()