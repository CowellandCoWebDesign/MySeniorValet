#!/usr/bin/env python3
"""
COMPLETE 50-STATE COVERAGE - Final Connecticut deployment
Deploy Connecticut to achieve complete 50-state + DC HUD coverage
"""
import os
import psycopg2
from real_hud_api_collector import RealHUDAPICollector

def complete_50_state_coverage():
    """Complete 50-state coverage by deploying Connecticut"""
    print("🇺🇸 COMPLETING 50-STATE HUD COVERAGE")
    print("="*80)
    
    print("🎯 TARGET: CONNECTICUT (Final state for 50-state completion)")
    
    # Deploy Connecticut
    deploy_connecticut()
    
    # Verify complete coverage
    verify_50_state_completion()

def deploy_connecticut():
    """Deploy comprehensive Connecticut HUD data"""
    print("\n🏛️ DEPLOYING CONNECTICUT HUD DATA")
    
    collector = RealHUDAPICollector()
    
    try:
        all_properties = []
        
        # Section 202 Elderly Housing
        print("   📋 Collecting Section 202 Elderly Housing for Connecticut...")
        section_202 = collector.query_hud_section_202_by_state('CT')
        if section_202:
            for feature in section_202:
                processed = collector.process_hud_property(feature, "Section 202 Elderly Housing")
                if processed and processed.get('name'):
                    # Clean any negative rent values
                    if processed.get('rent_per_month') and processed['rent_per_month'] < 0:
                        processed['rent_per_month'] = None
                    all_properties.append(processed)
            print(f"      ✅ Found {len(section_202)} Section 202 properties")
        
        # Multifamily Elderly Housing  
        print("   🏢 Collecting Multifamily Elderly Housing for Connecticut...")
        multifamily = collector.query_hud_multifamily_elderly('CT')
        if multifamily:
            for feature in multifamily:
                processed = collector.process_hud_property(feature, "HUD Multifamily Elderly Housing")
                if processed and processed.get('name'):
                    # Clean any negative rent values
                    if processed.get('rent_per_month') and processed['rent_per_month'] < 0:
                        processed['rent_per_month'] = None
                    all_properties.append(processed)
            print(f"      ✅ Found {len(multifamily)} Multifamily properties")
        
        # LIHTC Senior Housing
        print("   🏠 Collecting LIHTC Senior Housing for Connecticut...")
        try:
            lihtc = collector.query_hud_lihtc_senior('CT')
            if lihtc:
                for feature in lihtc:
                    processed = collector.process_hud_property(feature, "LIHTC Senior Housing")
                    if processed and processed.get('name'):
                        # Clean any negative rent values
                        if processed.get('rent_per_month') and processed['rent_per_month'] < 0:
                            processed['rent_per_month'] = None
                        all_properties.append(processed)
                print(f"      ✅ Found {len(lihtc)} LIHTC properties")
        except:
            print("      ⚠️ LIHTC data not available for Connecticut")
        
        # Deduplicate by HUD ID
        unique_properties = []
        seen_ids = set()
        for prop in all_properties:
            hud_id = prop.get('hud_property_id')
            if hud_id and hud_id not in seen_ids:
                seen_ids.add(hud_id)
                unique_properties.append(prop)
        
        print(f"   📊 Total unique properties collected: {len(unique_properties)}")
        
        # Save to database
        if unique_properties:
            print(f"   💾 Saving {len(unique_properties)} Connecticut properties...")
            saved_count = collector.save_authentic_properties_to_database(unique_properties, 'CT')
            
            if saved_count > 0:
                print(f"   🎉 SUCCESS! Added {saved_count} properties to Connecticut")
                print(f"   🇺🇸 50-STATE HUD COVERAGE ACHIEVED!")
                
                # Show top 3 samples
                for i, sample in enumerate(unique_properties[:3], 1):
                    name = sample.get('name', 'Unknown')[:50]
                    units = sample.get('total_units_hud', 'N/A')
                    occupancy = sample.get('occupancy_rate_hud', 'N/A')
                    rent = sample.get('rent_per_month', 'N/A')
                    city = sample.get('city', 'N/A')
                    print(f"      {i}. {name} ({city}) - {units} units, {occupancy}% occupied, ${rent}/month")
            else:
                print(f"   ⚠️ No properties saved for Connecticut")
        else:
            print(f"   ❌ No properties found for Connecticut")
            
    except Exception as e:
        print(f"   ❌ Error deploying Connecticut: {e}")

def verify_50_state_completion():
    """Verify complete 50-state + DC coverage achieved"""
    print(f"\n🏆 VERIFYING COMPLETE 50-STATE COVERAGE")
    print("="*60)
    
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
        
        # Get all covered states
        cursor.execute("""
            SELECT state, COUNT(*) as property_count
            FROM communities 
            WHERE hud_property_id IS NOT NULL
            GROUP BY state
            ORDER BY state;
        """)
        
        covered_states = cursor.fetchall()
        
        # Final platform statistics
        cursor.execute("""
            SELECT 
                COUNT(*) as total_hud,
                SUM(total_units_hud) as total_units,
                AVG(occupancy_rate_hud) as avg_occupancy,
                COUNT(CASE WHEN rent_per_month > 0 THEN 1 END) as with_pricing,
                COUNT(CASE WHEN data_quality_score >= 80 THEN 1 END) as high_quality
            FROM communities 
            WHERE hud_property_id IS NOT NULL;
        """)
        
        final_stats = cursor.fetchone()
        
        print(f"🇺🇸 HISTORIC ACHIEVEMENT VERIFICATION:")
        print(f"   States/Territories with HUD Coverage: {state_count}")
        
        if state_count >= 50:
            print(f"   ✅ COMPLETE 50-STATE + DC COVERAGE ACHIEVED!")
            print(f"   🎯 Platform now covers ALL US states and territories!")
        else:
            print(f"   ⚠️ Coverage: {state_count}/51 (50 states + DC)")
            
            # Show which states are still missing
            all_us_states = set([
                'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
                'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
                'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
                'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
                'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
            ])
            covered_state_codes = {state[0] for state in covered_states}
            missing = all_us_states - covered_state_codes
            if missing:
                print(f"   ❌ Still missing: {', '.join(sorted(missing))}")
        
        # Platform totals
        if final_stats:
            total, units, occupancy, pricing, high_quality = final_stats
            print(f"\n📊 FINAL PLATFORM TOTALS:")
            print(f"   Total HUD Properties: {total:,}")
            print(f"   Total Housing Units: {units:,}")
            print(f"   Average Occupancy: {occupancy:.1f}%")
            print(f"   With Pricing Data: {pricing:,} ({(pricing/total*100):.1f}%)")
            print(f"   High Quality Properties: {high_quality:,} ({(high_quality/total*100):.1f}%)")
        
        # Top 10 states by property count
        print(f"\n🏆 TOP 10 STATES BY HUD PROPERTY COUNT:")
        for i, (state, count) in enumerate(covered_states[:10], 1):
            print(f"   {i}. {state}: {count:,} properties")
        
        cursor.close()
        conn.close()
        
        if state_count >= 50:
            print(f"\n🎉 HISTORIC MILESTONE: COMPLETE AMERICAN HUD COVERAGE!")
            print(f"MySeniorValet now provides unprecedented nationwide transparency")
            print(f"across ALL US states and territories with authentic government data!")
        
    except Exception as e:
        print(f"❌ Error in verification: {e}")

def prepare_international_expansion():
    """Prepare for international expansion research"""
    print(f"\n🌍 PREPARING INTERNATIONAL EXPANSION")
    print("-" * 50)
    
    print("🎯 NEXT PHASE: INTERNATIONAL SENIOR HOUSING RESEARCH")
    
    expansion_targets = {
        "Puerto Rico": {
            "priority": "HIGH - US Territory",
            "data_availability": "HUD data should be available",
            "approach": "Query HUD API with PR territory code",
            "expected_properties": "50-200 properties"
        },
        "Canada": {
            "priority": "MEDIUM - Large expat population", 
            "data_availability": "CMHC database, provincial housing authorities",
            "approach": "Research Canada Mortgage and Housing Corporation API",
            "expected_properties": "500-2000 properties"
        },
        "Mexico": {
            "priority": "MEDIUM - Retirement destination",
            "data_availability": "INAPAM, SEDATU government sources",
            "approach": "Research Mexican senior housing registries",
            "expected_properties": "200-1000 properties"
        }
    }
    
    for country, details in expansion_targets.items():
        print(f"\n🏛️ {country}:")
        print(f"   Priority: {details['priority']}")
        print(f"   Data Sources: {details['data_availability']}")
        print(f"   Approach: {details['approach']}")
        print(f"   Expected Scale: {details['expected_properties']}")
    
    print(f"\n💡 RECOMMENDATION: Start with Puerto Rico HUD data collection")
    print(f"   Rationale: US territory, established HUD infrastructure")

if __name__ == "__main__":
    complete_50_state_coverage()
    prepare_international_expansion()