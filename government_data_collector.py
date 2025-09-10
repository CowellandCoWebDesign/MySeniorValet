#!/usr/bin/env python3

import requests
import json
import csv
from datetime import datetime
import time

def collect_government_data_sources():
    """
    Collect senior living data from census.gov, healthdata.gov, and HUD ONAP
    """
    
    print("=" * 60)
    print("GOVERNMENT DATA SOURCES COLLECTOR")
    print("=" * 60)
    print("Sources: census.gov, healthdata.gov, HUD ONAP")
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    all_facilities = []
    
    # 1. Data.gov Assisted Living Datasets
    print("\n1. Collecting from Data.gov Assisted Living Catalog...")
    
    # Maryland Assisted Living dataset
    maryland_url = "https://opendata.maryland.gov/api/views/rjc3-6ptz/rows.json?accessType=DOWNLOAD"
    
    try:
        print("   Attempting Maryland Assisted Living dataset...")
        response = requests.get(maryland_url, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            
            if 'data' in data:
                facilities_data = data['data']
                print(f"   ✓ Found {len(facilities_data)} Maryland facilities")
                
                for row in facilities_data:
                    # Maryland dataset structure varies, but typically includes facility info
                    facility = {
                        'name': row[8] if len(row) > 8 else '',  # Facility name
                        'address': row[9] if len(row) > 9 else '',
                        'city': row[10] if len(row) > 10 else '',
                        'state': 'MD',
                        'zip': row[12] if len(row) > 12 else '',
                        'phone': row[13] if len(row) > 13 else '',
                        'facilityType': 'Assisted Living',
                        'source': 'Maryland Open Data',
                        'careTypes': ['Assisted Living']
                    }
                    
                    if facility['name']:
                        all_facilities.append(facility)
        else:
            print(f"   ✗ Maryland dataset failed: HTTP {response.status_code}")
            
    except Exception as e:
        print(f"   ✗ Error accessing Maryland data: {str(e)}")
    
    # 2. CMS Nursing Home Data API
    print("\n2. Collecting from CMS Nursing Home Data...")
    
    cms_api_url = "https://data.cms.gov/provider-data/api/1/datastore/query"
    
    # Try to get nursing home provider information
    cms_params = {
        "resource": "4pq5-n9py",  # Provider Information dataset
        "limit": 1000,
        "offset": 0
    }
    
    try:
        print("   Attempting CMS Provider Information API...")
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(cms_api_url, params=cms_params, headers=headers, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            
            if 'results' in data:
                providers = data['results']
                print(f"   ✓ Found {len(providers)} CMS providers")
                
                for provider in providers[:100]:  # Limit to first 100 for testing
                    facility = {
                        'name': provider.get('provider_name', ''),
                        'address': provider.get('provider_address', ''),
                        'city': provider.get('provider_city', ''),
                        'state': provider.get('provider_state', ''),
                        'zip': provider.get('provider_zip_code', ''),
                        'phone': provider.get('provider_phone_number', ''),
                        'facilityType': 'Nursing Home',
                        'source': 'CMS Provider Data',
                        'careTypes': ['Skilled Nursing'],
                        'cms_provider_id': provider.get('federal_provider_number', '')
                    }
                    
                    if facility['name'] and facility['state']:
                        all_facilities.append(facility)
        else:
            print(f"   ✗ CMS API failed: HTTP {response.status_code}")
            
    except Exception as e:
        print(f"   ✗ Error accessing CMS data: {str(e)}")
    
    # 3. HUD Open Data Portal
    print("\n3. Collecting from HUD Open Data Portal...")
    
    # HUD Section 202 Elderly Housing
    hud_section202_url = "https://services.arcgis.com/VTyQ9soqVukalItT/arcgis/rest/services/HUD_Section_202_Properties/FeatureServer/0/query"
    
    hud_params = {
        'where': '1=1',
        'outFields': '*',
        'f': 'json',
        'resultRecordCount': 1000
    }
    
    try:
        print("   Attempting HUD Section 202 Elderly Housing...")
        response = requests.get(hud_section202_url, params=hud_params, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            
            if 'features' in data:
                features = data['features']
                print(f"   ✓ Found {len(features)} HUD Section 202 properties")
                
                for feature in features:
                    attrs = feature.get('attributes', {})
                    
                    facility = {
                        'name': attrs.get('PROJECT_NAME', attrs.get('PROPERTY_NAME', '')),
                        'address': attrs.get('ADDRESS', ''),
                        'city': attrs.get('CITY', ''),
                        'state': attrs.get('STATE', ''),
                        'zip': attrs.get('ZIP', ''),
                        'facilityType': 'HUD Section 202 Elderly Housing',
                        'source': 'HUD Open Data',
                        'careTypes': ['Senior Housing'],
                        'hud_property_id': attrs.get('PROPERTY_ID', ''),
                        'units': attrs.get('TOTAL_UNITS', '')
                    }
                    
                    # Add coordinates if available
                    if 'geometry' in feature and feature['geometry']:
                        geom = feature['geometry']
                        if 'x' in geom and 'y' in geom:
                            facility['coordinates'] = {
                                'latitude': geom['y'],
                                'longitude': geom['x']
                            }
                    
                    if facility['name'] and facility['state']:
                        all_facilities.append(facility)
        else:
            print(f"   ✗ HUD API failed: HTTP {response.status_code}")
            
    except Exception as e:
        print(f"   ✗ Error accessing HUD data: {str(e)}")
    
    # 4. Census Bureau API (for demographic data)
    print("\n4. Checking Census Bureau Data...")
    print("   Note: Census provides demographic/industry data, not facility lists")
    print("   - Service Annual Survey tracks senior care industry revenue")
    print("   - American Community Survey includes group quarters data")
    
    # 5. ONAP Tribal Housing
    print("\n5. HUD ONAP (Office of Native American Programs)...")
    print("   Note: ONAP data focuses on block grants and program reporting")
    print("   - IHBG Formula data available at ihbgformula.com")
    print("   - Contact Codetalk@hud.gov for specific elderly housing data")
    
    # Remove duplicates
    unique_facilities = []
    seen = set()
    
    for facility in all_facilities:
        key = f"{facility['name']}_{facility.get('city', '')}_{facility.get('state', '')}"
        if key not in seen:
            seen.add(key)
            unique_facilities.append(facility)
    
    print(f"\n" + "=" * 60)
    print("COLLECTION SUMMARY")
    print("=" * 60)
    print(f"Total facilities collected: {len(unique_facilities)}")
    
    if unique_facilities:
        # Save to JSON
        output_file = f"government_sources_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w') as f:
            json.dump(unique_facilities, f, indent=2)
        print(f"\n✓ Saved to: {output_file}")
        
        # Display sample data
        print(f"\nSample facilities:")
        for i, facility in enumerate(unique_facilities[:5]):
            print(f"\n{i+1}. {facility['name']}")
            print(f"   Location: {facility.get('city', 'N/A')}, {facility.get('state', 'N/A')} {facility.get('zip', 'N/A')}")
            print(f"   Type: {facility['facilityType']}")
            print(f"   Source: {facility['source']}")
    
    print(f"\n" + "=" * 60)
    print("ALTERNATIVE ACCESS METHODS")
    print("=" * 60)
    print("\n1. Census.gov:")
    print("   - Visit data.census.gov")
    print("   - Search for 'NAICS 6233' (senior care facilities)")
    print("   - Access Service Annual Survey data")
    
    print("\n2. HealthData.gov / CMS:")
    print("   - Visit data.cms.gov/provider-data/topics/nursing-homes")
    print("   - Download CSV files directly")
    print("   - Use Provider of Services file for comprehensive data")
    
    print("\n3. HUD ONAP:")
    print("   - Visit hudgis-hud.opendata.arcgis.com")
    print("   - Contact Codetalk@hud.gov for tribal elderly housing")
    print("   - Access IHBG formula data at ihbgformula.com")
    
    return unique_facilities

if __name__ == "__main__":
    facilities = collect_government_data_sources()