#!/usr/bin/env python3

import requests
import json
import csv
from datetime import datetime
import time
import pandas as pd
import io

def collect_state_licensing_data():
    """
    Collect state licensing data from states with bulk download capabilities
    """
    
    print("=" * 60)
    print("STATE LICENSING DATABASE COLLECTOR")
    print("=" * 60)
    print("States: Minnesota (bulk CSV), Michigan (limited), Ohio")
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    all_facilities = []
    
    # 1. Minnesota - Direct download available
    print("\n1. Minnesota Health Department Database...")
    
    # Minnesota provides Excel file download
    mn_url = "https://www.health.state.mn.us/facilities/regulation/directory/docs/provdir.xlsx"
    
    try:
        print("   Downloading Minnesota provider directory...")
        response = requests.get(mn_url, timeout=60)
        
        if response.status_code == 200:
            print("✓ Successfully downloaded Minnesota data")
            
            # Save temporarily and read with pandas
            temp_file = "minnesota_temp.xlsx"
            with open(temp_file, 'wb') as f:
                f.write(response.content)
            
            # Read Excel file
            try:
                df = pd.read_excel(temp_file, sheet_name=0)
                print(f"   Found {len(df)} total facilities")
                
                # Filter for assisted living and nursing homes
                senior_keywords = ['assisted living', 'nursing home', 'senior', 'elderly', 'memory care']
                
                for _, row in df.iterrows():
                    facility_type = str(row.get('Facility Type', '')).lower()
                    facility_name = str(row.get('Facility Name', ''))
                    
                    # Check if it's a senior living facility
                    is_senior = any(keyword in facility_type for keyword in senior_keywords)
                    
                    if is_senior:
                        facility = {
                            'name': facility_name,
                            'address': row.get('Address', ''),
                            'city': row.get('City', ''),
                            'state': 'MN',
                            'zip': row.get('Zip', ''),
                            'county': row.get('County', ''),
                            'phone': row.get('Phone', ''),
                            'facilityType': row.get('Facility Type', ''),
                            'source': 'Minnesota Department of Health',
                            'careTypes': [row.get('Facility Type', 'Senior Living')],
                            'license_number': row.get('License Number', ''),
                            'administrator': row.get('Administrator', '')
                        }
                        
                        if facility['name'] and facility['city']:
                            all_facilities.append(facility)
                
                print(f"   Extracted {len(all_facilities)} senior living facilities")
                
                # Clean up temp file
                import os
                os.remove(temp_file)
                
            except Exception as e:
                print(f"   ✗ Error reading Excel file: {str(e)}")
                print("   Note: pandas library required for Excel processing")
                
        else:
            print(f"✗ Failed to download Minnesota data: HTTP {response.status_code}")
            
    except Exception as e:
        print(f"✗ Error accessing Minnesota data: {str(e)}")
    
    # 2. Michigan - No bulk download, but try state APIs
    print("\n2. Michigan LARA Database...")
    print("   Note: Michigan does not provide bulk downloads")
    print("   - Adult Foster Care facilities searchable at:")
    print("     https://adultfostercare.apps.lara.state.mi.us/")
    print("   - Individual facility lookup only")
    print("   - FOIA request needed for bulk data: LARAFOIAINFO@michigan.gov")
    
    # 3. Ohio - Search for Ohio Department of Health
    print("\n3. Ohio Department of Health...")
    
    # Ohio nursing home directory
    ohio_urls = [
        "https://publicapps.odh.ohio.gov/eid/Data/GetFacilityList",
        "https://data.ohio.gov/api/views/2wtz-t9jk/rows.csv?accessType=DOWNLOAD"  # Nursing homes dataset
    ]
    
    for url in ohio_urls:
        try:
            print(f"   Trying Ohio endpoint: {url[:50]}...")
            response = requests.get(url, timeout=30)
            
            if response.status_code == 200:
                # Check if it's JSON or CSV
                if 'json' in response.headers.get('content-type', ''):
                    data = response.json()
                    if isinstance(data, list):
                        print(f"   ✓ Found {len(data)} Ohio facilities")
                        
                        for item in data[:100]:  # Limit to first 100
                            facility = {
                                'name': item.get('FacilityName', item.get('name', '')),
                                'address': item.get('Address', item.get('address', '')),
                                'city': item.get('City', item.get('city', '')),
                                'state': 'OH',
                                'zip': item.get('ZipCode', item.get('zip', '')),
                                'county': item.get('County', item.get('county', '')),
                                'phone': item.get('Phone', ''),
                                'facilityType': item.get('FacilityType', 'Nursing Home'),
                                'source': 'Ohio Department of Health',
                                'careTypes': ['Skilled Nursing'],
                                'license_number': item.get('LicenseNumber', '')
                            }
                            
                            if facility['name'] and facility['city']:
                                all_facilities.append(facility)
                                
                elif 'csv' in response.headers.get('content-type', '') or response.text.startswith('"'):
                    # Parse CSV
                    csv_file = io.StringIO(response.text)
                    reader = csv.DictReader(csv_file)
                    
                    count = 0
                    for row in reader:
                        if count >= 100:  # Limit
                            break
                            
                        facility = {
                            'name': row.get('Provider Name', row.get('name', '')),
                            'address': row.get('Provider Address', row.get('address', '')),
                            'city': row.get('Provider City', row.get('city', '')),
                            'state': 'OH',
                            'zip': row.get('Provider Zip Code', row.get('zip', '')),
                            'county': row.get('County Name', ''),
                            'phone': row.get('Provider Phone Number', ''),
                            'facilityType': 'Nursing Home',
                            'source': 'Ohio Department of Health',
                            'careTypes': ['Skilled Nursing']
                        }
                        
                        if facility['name'] and facility['city']:
                            all_facilities.append(facility)
                            count += 1
                    
                    print(f"   ✓ Processed {count} Ohio facilities")
                    break
                    
        except Exception as e:
            print(f"   ✗ Error with Ohio data: {str(e)}")
    
    # 4. Additional states with known bulk downloads
    print("\n4. Additional States with Bulk Downloads...")
    
    additional_states = {
        'Iowa': 'https://dia-hfd.iowa.gov/DIA_HFD/GetFacilityList',
        'Wisconsin': 'https://www.dhs.wisconsin.gov/regulations/facilities/index.htm',
        'Illinois': 'https://data.illinois.gov/api/views/mz7e-kx5z/rows.csv?accessType=DOWNLOAD'
    }
    
    for state, info in additional_states.items():
        print(f"   {state}: {info}")
    
    print(f"\n" + "=" * 60)
    print("COLLECTION SUMMARY")
    print("=" * 60)
    print(f"Total facilities collected: {len(all_facilities)}")
    
    if all_facilities:
        # Save to JSON
        output_file = f"state_licensing_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w') as f:
            json.dump(all_facilities, f, indent=2)
        print(f"\n✓ Saved to: {output_file}")
        
        # Display state distribution
        state_counts = {}
        for facility in all_facilities:
            state = facility['state']
            state_counts[state] = state_counts.get(state, 0) + 1
        
        print(f"\nFacilities by state:")
        for state, count in state_counts.items():
            print(f"  {state}: {count} facilities")
        
        # Display sample data
        print(f"\nSample facilities:")
        for i, facility in enumerate(all_facilities[:5]):
            print(f"\n{i+1}. {facility['name']}")
            print(f"   Location: {facility['city']}, {facility['state']} {facility['zip']}")
            print(f"   Type: {facility['facilityType']}")
            print(f"   Source: {facility['source']}")
    
    print(f"\n" + "=" * 60)
    print("STATE LICENSING RESOURCES")
    print("=" * 60)
    print("\nStates with Direct Bulk Downloads:")
    print("• Minnesota: health.state.mn.us/facilities/regulation/directory/")
    print("• Illinois: data.illinois.gov")
    print("• Iowa: dia-hfd.iowa.gov")
    
    print("\nStates Requiring Manual/FOIA:")
    print("• Michigan: FOIA to LARAFOIAINFO@michigan.gov")
    print("• Most other states: Individual facility search only")
    
    return all_facilities

if __name__ == "__main__":
    # Note: This script requires pandas for Excel processing
    try:
        import pandas
        facilities = collect_state_licensing_data()
    except ImportError:
        print("\nError: pandas library required for Excel file processing")
        print("Install with: pip install pandas openpyxl")
        facilities = []