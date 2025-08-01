#!/usr/bin/env python3

import requests
import json
import csv
from datetime import datetime
import time

def collect_cms_nursing_homes():
    """
    Collect CMS nursing home data using direct API endpoints
    """
    
    print("=" * 60)
    print("CMS NURSING HOME DATA COLLECTOR")
    print("=" * 60)
    print("Source: CMS Provider Data Catalog")
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    all_facilities = []
    
    # CMS Provider Information dataset
    dataset_id = "4pq5-n9py"
    
    # Try different API endpoints
    endpoints = [
        f"https://data.cms.gov/api/1/datastore/sql/{dataset_id}?query%5B%5D=SELECT%20*%20FROM%20%60{dataset_id}%60%20LIMIT%201000",
        f"https://data.cms.gov/provider-data/api/1/datastore/sql/{dataset_id}?query%5B%5D=SELECT%20*%20FROM%20%60{dataset_id}%60%20LIMIT%201000",
        f"https://data.cms.gov/api/1/datastore/dump/{dataset_id}/0"
    ]
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/csv, */*'
    }
    
    for endpoint in endpoints:
        print(f"\nTrying endpoint: {endpoint[:60]}...")
        
        try:
            response = requests.get(endpoint, headers=headers, timeout=60)
            
            if response.status_code == 200:
                print(f"✓ Successfully connected to CMS API")
                
                # Check if response is JSON or CSV
                content_type = response.headers.get('content-type', '')
                
                if 'json' in content_type:
                    data = response.json()
                    
                    if isinstance(data, list):
                        # Direct array of facilities
                        facilities_data = data
                    elif 'results' in data:
                        facilities_data = data['results']
                    elif 'records' in data:
                        facilities_data = data['records']
                    else:
                        print(f"   Unexpected JSON structure: {list(data.keys())[:5]}")
                        continue
                    
                    print(f"   Found {len(facilities_data)} facilities")
                    
                    for facility_data in facilities_data[:500]:  # Limit to first 500
                        facility = {
                            'name': facility_data.get('provider_name', facility_data.get('provname', '')),
                            'address': facility_data.get('provider_address', facility_data.get('address', '')),
                            'city': facility_data.get('provider_city', facility_data.get('city', '')),
                            'state': facility_data.get('provider_state', facility_data.get('state', '')),
                            'zip': facility_data.get('provider_zip_code', facility_data.get('zip', '')),
                            'phone': facility_data.get('provider_phone_number', facility_data.get('phone', '')),
                            'facilityType': 'Nursing Home',
                            'source': 'CMS Provider Data',
                            'careTypes': ['Skilled Nursing'],
                            'cms_provider_id': facility_data.get('federal_provider_number', ''),
                            'ownership_type': facility_data.get('ownership_type', ''),
                            'beds': facility_data.get('number_of_certified_beds', '')
                        }
                        
                        # Only add if we have basic info
                        if facility['name'] and facility['state']:
                            all_facilities.append(facility)
                    
                    if all_facilities:
                        break  # Success, exit loop
                        
                elif 'csv' in content_type or response.text.startswith('"'):
                    # Handle CSV response
                    print("   Processing CSV response...")
                    
                    lines = response.text.strip().split('\n')
                    if len(lines) > 1:
                        # Parse CSV
                        import io
                        csv_file = io.StringIO(response.text)
                        reader = csv.DictReader(csv_file)
                        
                        count = 0
                        for row in reader:
                            if count >= 500:  # Limit to first 500
                                break
                                
                            facility = {
                                'name': row.get('provider_name', row.get('provname', '')),
                                'address': row.get('provider_address', row.get('address', '')),
                                'city': row.get('provider_city', row.get('city', '')),
                                'state': row.get('provider_state', row.get('state', '')),
                                'zip': row.get('provider_zip_code', row.get('zip', '')),
                                'phone': row.get('provider_phone_number', row.get('phone', '')),
                                'facilityType': 'Nursing Home',
                                'source': 'CMS Provider Data',
                                'careTypes': ['Skilled Nursing'],
                                'cms_provider_id': row.get('federal_provider_number', ''),
                                'ownership_type': row.get('ownership_type', ''),
                                'beds': row.get('number_of_certified_beds', '')
                            }
                            
                            if facility['name'] and facility['state']:
                                all_facilities.append(facility)
                                count += 1
                        
                        print(f"   Processed {count} facilities from CSV")
                        
                        if all_facilities:
                            break  # Success, exit loop
                else:
                    print(f"   Unexpected content type: {content_type}")
                    
            else:
                print(f"   ✗ Failed: HTTP {response.status_code}")
                
        except Exception as e:
            print(f"   ✗ Error: {str(e)}")
        
        time.sleep(2)  # Be respectful between attempts
    
    # Save results
    print(f"\n" + "=" * 60)
    print("COLLECTION SUMMARY")
    print("=" * 60)
    print(f"Total facilities collected: {len(all_facilities)}")
    
    if all_facilities:
        # Save to JSON
        output_file = f"cms_nursing_homes_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w') as f:
            json.dump(all_facilities, f, indent=2)
        print(f"\n✓ Saved to: {output_file}")
        
        # Display state distribution
        state_counts = {}
        for facility in all_facilities:
            state = facility['state']
            state_counts[state] = state_counts.get(state, 0) + 1
        
        print(f"\nFacilities by state (top 10):")
        sorted_states = sorted(state_counts.items(), key=lambda x: x[1], reverse=True)
        for state, count in sorted_states[:10]:
            print(f"  {state}: {count} facilities")
        
        # Display sample data
        print(f"\nSample facilities:")
        for i, facility in enumerate(all_facilities[:5]):
            print(f"\n{i+1}. {facility['name']}")
            print(f"   Location: {facility['city']}, {facility['state']} {facility['zip']}")
            print(f"   CMS ID: {facility.get('cms_provider_id', 'N/A')}")
            print(f"   Beds: {facility.get('beds', 'N/A')}")
    
    print(f"\n" + "=" * 60)
    print("MANUAL DOWNLOAD INSTRUCTIONS")
    print("=" * 60)
    print("\nFor the complete CMS nursing home dataset:")
    print("1. Visit: https://data.cms.gov/provider-data/dataset/4pq5-n9py")
    print("2. Click 'Export' button")
    print("3. Select 'CSV' format")
    print("4. Download will include all 15,000+ nursing homes")
    
    print("\nFor Provider of Services file:")
    print("1. Visit: https://www.cms.gov/Research-Statistics-Data-and-Systems/")
    print("   Downloadable-Public-Use-Files/Provider-of-Services")
    print("2. Download the 'OTHER' file (includes nursing homes)")
    
    return all_facilities

if __name__ == "__main__":
    facilities = collect_cms_nursing_homes()