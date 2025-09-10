#!/usr/bin/env python3

import requests
import json
import csv
from datetime import datetime
import time
import io

def collect_usda_section515_data():
    """
    Collect USDA Section 515 Rural Rental Housing data for elderly properties
    """
    
    print("=" * 60)
    print("USDA SECTION 515 RURAL HOUSING DATA COLLECTOR")
    print("=" * 60)
    print("Target: Section 515 Elderly Housing Properties")
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    all_facilities = []
    
    # USDA Section 515 tenant characteristics CSV
    tenant_url = "https://www.sc.egov.usda.gov/data/files/MFH_Section_515/ActiveProjects/mfhd_tenant_info_all_properties.csv"
    
    # USDA property characteristics CSV
    property_url = "https://www.sc.egov.usda.gov/data/files/MFH_Section_515/ActiveProjects/mfh_property_characteristics.csv"
    
    print("\n1. Downloading USDA Section 515 tenant data...")
    
    try:
        # Download tenant data
        response = requests.get(tenant_url, timeout=60)
        
        if response.status_code == 200:
            print("✓ Successfully downloaded tenant data")
            
            # Parse CSV
            csv_file = io.StringIO(response.text)
            reader = csv.DictReader(csv_file)
            
            elderly_properties = {}
            
            for row in reader:
                property_id = row.get('property_id', '')
                
                # Look for elderly population indicators
                elderly_62_plus = row.get('elderly_aged_62_plus', '0')
                
                try:
                    elderly_count = int(elderly_62_plus)
                    total_tenants = int(row.get('total_tenants', '0'))
                    
                    # If significant elderly population (>30%), mark as elderly property
                    if total_tenants > 0 and (elderly_count / total_tenants) > 0.3:
                        elderly_properties[property_id] = {
                            'elderly_count': elderly_count,
                            'total_tenants': total_tenants,
                            'elderly_percentage': round((elderly_count / total_tenants) * 100, 1)
                        }
                except:
                    pass
            
            print(f"   Found {len(elderly_properties)} properties with significant elderly populations")
            
        else:
            print(f"✗ Failed to download tenant data: HTTP {response.status_code}")
            
    except Exception as e:
        print(f"✗ Error downloading tenant data: {str(e)}")
    
    print("\n2. Downloading USDA Section 515 property data...")
    
    try:
        # Download property data
        response = requests.get(property_url, timeout=60)
        
        if response.status_code == 200:
            print("✓ Successfully downloaded property data")
            
            # Parse CSV
            csv_file = io.StringIO(response.text)
            reader = csv.DictReader(csv_file)
            
            for row in reader:
                property_id = row.get('property_id', '')
                
                # Check if this is an elderly property based on tenant data
                if property_id in elderly_properties:
                    facility = {
                        'name': row.get('property_name', ''),
                        'address': row.get('address', ''),
                        'city': row.get('city', ''),
                        'state': row.get('state', ''),
                        'zip': row.get('zip_code', ''),
                        'county': row.get('county', ''),
                        'phone': row.get('phone', ''),
                        'facilityType': 'USDA Section 515 Rural Elderly Housing',
                        'source': 'USDA Rural Development',
                        'careTypes': ['Senior Housing'],
                        'usda_property_id': property_id,
                        'units': row.get('total_units', ''),
                        'property_type': row.get('property_type', ''),
                        'elderly_percentage': elderly_properties[property_id]['elderly_percentage']
                    }
                    
                    # Add coordinates if available
                    lat = row.get('latitude', '')
                    lon = row.get('longitude', '')
                    if lat and lon:
                        try:
                            facility['coordinates'] = {
                                'latitude': float(lat),
                                'longitude': float(lon)
                            }
                        except:
                            pass
                    
                    if facility['name'] and facility['state']:
                        all_facilities.append(facility)
            
            print(f"   Matched {len(all_facilities)} elderly properties with location data")
            
        else:
            print(f"✗ Failed to download property data: HTTP {response.status_code}")
            
    except Exception as e:
        print(f"✗ Error downloading property data: {str(e)}")
    
    # Alternative: Try Data.gov catalog endpoint
    print("\n3. Checking Data.gov catalog for additional datasets...")
    
    catalog_urls = [
        "https://catalog.data.gov/api/3/action/package_show?id=usda-rural-development-multifamily-section-515-rural-rental-housing-and-section-514-farm-l-5862a",
        "https://catalog.data.gov/api/3/action/package_show?id=usda-rural-development-multi-family-housing-program-exit-data"
    ]
    
    for url in catalog_urls:
        try:
            response = requests.get(url, timeout=30)
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    result = data['result']
                    resources = result.get('resources', [])
                    
                    print(f"   Found dataset: {result.get('title', 'Unknown')}")
                    for resource in resources:
                        if resource.get('format', '').upper() == 'CSV':
                            print(f"     - CSV available: {resource.get('name', 'Unknown')}")
                            print(f"       URL: {resource.get('url', 'N/A')}")
        except:
            pass
    
    print(f"\n" + "=" * 60)
    print("COLLECTION SUMMARY")
    print("=" * 60)
    print(f"Total elderly properties collected: {len(all_facilities)}")
    
    if all_facilities:
        # Save to JSON
        output_file = f"usda_section515_elderly_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
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
            print(f"   Elderly: {facility['elderly_percentage']}% of residents")
            print(f"   Units: {facility.get('units', 'N/A')}")
    
    print(f"\n" + "=" * 60)
    print("ALTERNATIVE ACCESS METHODS")
    print("=" * 60)
    print("\n1. Direct USDA Portal:")
    print("   Visit: https://www.sc.egov.usda.gov/data/MFH_section_515.html")
    print("   Download all CSV files directly")
    
    print("\n2. Data.gov Catalog:")
    print("   Visit: https://catalog.data.gov/dataset/")
    print("   Search for 'USDA Section 515'")
    print("   Multiple datasets with data dictionaries available")
    
    return all_facilities

if __name__ == "__main__":
    facilities = collect_usda_section515_data()