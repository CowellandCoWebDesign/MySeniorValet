#!/usr/bin/env python3
"""
RAPID STATE EXPANSION - Quick deployment for remaining priority states
"""
import os
import logging
from real_hud_api_collector import RealHUDAPICollector

def rapid_expansion():
    """Rapid expansion for high-priority remaining states"""
    print("🚀 RAPID STATE EXPANSION")
    
    collector = RealHUDAPICollector()
    
    # Highest priority states for immediate expansion
    priority_states = [
        ('OH', 'Ohio'),
        ('GA', 'Georgia'), 
        ('NC', 'North Carolina'),
        ('MI', 'Michigan'),
        ('NJ', 'New Jersey'),
        ('VA', 'Virginia'),
        ('WA', 'Washington'),
        ('AZ', 'Arizona'),
        ('MA', 'Massachusetts'),
        ('TN', 'Tennessee')
    ]
    
    total_added = 0
    
    for state_code, state_name in priority_states:
        try:
            print(f"\n⚡ {state_name}")
            
            # Quick collection and processing
            properties = []
            
            # Section 202
            s202 = collector.query_hud_section_202_by_state(state_code)
            if s202:
                for feature in s202[:200]:  # Limit for speed
                    processed = collector.process_hud_property(feature, "Section 202")
                    if processed and processed.get('name'):
                        properties.append(processed)
            
            # Save batch
            if properties:
                added = collector.save_authentic_properties_to_database(properties, state_code)
                total_added += added
                print(f"   ✅ Added {added} properties")
                
                # Show sample rich data
                if properties:
                    sample = properties[0]
                    units = sample.get('total_units_hud', 'N/A')
                    occ = sample.get('occupancy_rate_hud', 'N/A')
                    print(f"   📊 Sample: {units} units, {occ}% occupancy")
            else:
                print("   ❌ No properties")
                
        except Exception as e:
            print(f"   ❌ Error: {e}")
            continue
    
    print(f"\n🎯 RAPID EXPANSION COMPLETE: {total_added:,} properties added")

if __name__ == "__main__":
    rapid_expansion()