#!/usr/bin/env python3

import requests
import json
import csv
from datetime import datetime
import time

def collect_hud_multifamily_data():
    """
    Collect HUD Multifamily Properties data including Section 202 senior housing
    """
    
    print("=" * 60)
    print("HUD MULTIFAMILY PROPERTIES DATA COLLECTOR")
    print("=" * 60)
    print("Target: Section 202 Senior Housing & Other HUD Senior Properties")
    print("Source: HUD Open Data Portal")
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # HUD Open Data API endpoints
    api_urls = {
        'multifamily_assisted': 'https://hudgis-hud.opendata.arcgis.com/datasets/HUD::multifamily-properties-assisted/api/v2/downloads/data?format=json&spatialRefId=4326&where=1%3D1',
        'section_202': 'https://services.arcgis.com/VTyQ9soqVukalItT/arcgis/rest/services/HUD_Section_202_Properties/FeatureServer/0/query?where=1%3D1&outFields=*&f=json'
    }
    
    all_facilities = []
    
    # Try to collect from HUD Open Data portal
    for source_name, url in api_urls.items():
        print(f"\nCollecting from {source_name}...")
        
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            response = requests.get(url, headers=headers, timeout=30)
            
            if response.status_code == 200:
                print(f"✓ Successfully accessed {source_name}")
                
                try:
                    data = response.json()
                    
                    # Handle different JSON structures
                    if 'features' in data:
                        # ArcGIS format
                        features = data['features']
                        print(f"Found {len(features)} properties")
                        
                        for feature in features:
                            props = feature.get('attributes', feature.get('properties', {}))
                            
                            # Extract senior/elderly properties
                            property_name = props.get('PROPERTY_NAME', props.get('PropertyName', ''))
                            property_type = props.get('PROPERTY_CATEGORY', props.get('PropertyType', ''))
                            
                            # Look for senior/elderly indicators
                            is_senior = False
                            senior_keywords = ['elderly', 'senior', '202', 'age 62', 'age 55']
                            
                            for keyword in senior_keywords:
                                if keyword in str(property_name).lower() or keyword in str(property_type).lower():
                                    is_senior = True
                                    break
                            
                            # Also check program codes
                            program_code = props.get('PROGRAM_CODE', props.get('ProgramCode', ''))
                            if '202' in str(program_code):
                                is_senior = True
                            
                            if is_senior:
                                facility = {
                                    'name': property_name,
                                    'address': props.get('PROPERTY_STREET', props.get('Address', '')),
                                    'city': props.get('PROPERTY_CITY', props.get('City', '')),
                                    'state': props.get('PROPERTY_STATE', props.get('State', '')),
                                    'zip': props.get('PROPERTY_ZIP', props.get('ZipCode', '')),
                                    'county': props.get('COUNTY_NAME', props.get('County', '')),
                                    'units': props.get('TOTAL_UNITS', props.get('Units', '')),
                                    'program': program_code,
                                    'hud_property_id': props.get('PROPERTY_ID', props.get('PropertyID', '')),
                                    'source': f'HUD {source_name}',
                                    'facilityType': 'HUD Senior Housing'
                                }
                                
                                # Add coordinates if available
                                if 'geometry' in feature:
                                    geom = feature['geometry']
                                    if geom and 'x' in geom and 'y' in geom:
                                        facility['coordinates'] = {
                                            'latitude': geom['y'],
                                            'longitude': geom['x']
                                        }
                                
                                all_facilities.append(facility)
                    
                    elif isinstance(data, list):
                        # Direct list format
                        print(f"Found {len(data)} properties")
                        
                        for item in data:
                            property_name = item.get('PROPERTY_NAME', item.get('name', ''))
                            
                            # Look for senior properties
                            is_senior = any(keyword in str(property_name).lower() 
                                          for keyword in ['elderly', 'senior', '202'])
                            
                            if is_senior:
                                facility = {
                                    'name': property_name,
                                    'address': item.get('PROPERTY_STREET', item.get('address', '')),
                                    'city': item.get('PROPERTY_CITY', item.get('city', '')),
                                    'state': item.get('PROPERTY_STATE', item.get('state', '')),
                                    'zip': item.get('PROPERTY_ZIP', item.get('zip_code', '')),
                                    'county': item.get('COUNTY_NAME', item.get('county', '')),
                                    'units': item.get('TOTAL_UNITS', ''),
                                    'hud_property_id': item.get('PROPERTY_ID', ''),
                                    'source': f'HUD {source_name}',
                                    'facilityType': 'HUD Senior Housing'
                                }
                                all_facilities.append(facility)
                    
                except json.JSONDecodeError:
                    print(f"✗ Could not parse JSON from {source_name}")
                except Exception as e:
                    print(f"✗ Error processing data: {str(e)}")
                    
            else:
                print(f"✗ Failed to access {source_name}: Status {response.status_code}")
                
        except requests.exceptions.Timeout:
            print(f"✗ Request timed out for {source_name}")
        except Exception as e:
            print(f"✗ Error accessing {source_name}: {str(e)}")
        
        # Add a small delay between requests
        time.sleep(2)
    
    # Remove duplicates based on HUD property ID
    unique_facilities = []
    seen_ids = set()
    
    for facility in all_facilities:
        hud_id = facility.get('hud_property_id')
        if hud_id and hud_id not in seen_ids:
            seen_ids.add(hud_id)
            unique_facilities.append(facility)
        elif not hud_id:
            # Include facilities without HUD ID (check by name/address)
            key = f"{facility['name']}_{facility['address']}_{facility['city']}"
            if key not in seen_ids:
                seen_ids.add(key)
                unique_facilities.append(facility)
    
    print(f"\n" + "=" * 60)
    print(f"COLLECTION SUMMARY")
    print(f"=" * 60)
    print(f"Total senior properties collected: {len(unique_facilities)}")
    
    if unique_facilities:
        # Save to JSON
        output_file = f"hud_senior_housing_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w') as f:
            json.dump(unique_facilities, f, indent=2)
        print(f"\n✓ Saved to: {output_file}")
        
        # Display sample data
        print(f"\nSample facilities:")
        for i, facility in enumerate(unique_facilities[:5]):
            print(f"\n{i+1}. {facility['name']}")
            print(f"   Location: {facility['city']}, {facility['state']} {facility['zip']}")
            print(f"   Units: {facility.get('units', 'N/A')}")
            print(f"   Program: {facility.get('program', 'N/A')}")
    
    # Also try to provide direct download instructions
    print(f"\n" + "=" * 60)
    print("ALTERNATIVE DOWNLOAD OPTIONS")
    print("=" * 60)
    print("\nFor the complete HUD Multifamily database Excel file:")
    print("1. Visit: https://www.hud.gov/hud-partners/multifamily-assist-section8-database")
    print("2. Download the Excel file (updated monthly)")
    print("3. Filter for elderly/senior properties")
    print("\nThe Excel file contains ALL HUD multifamily properties including:")
    print("- Section 202 elderly housing")
    print("- Section 8 properties serving elderly")
    print("- Other HUD-assisted senior housing")
    
    return unique_facilities

if __name__ == "__main__":
    facilities = collect_hud_multifamily_data()