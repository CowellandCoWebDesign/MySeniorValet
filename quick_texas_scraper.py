import requests
import json
import csv
import time

# Texas Open Data Portal API endpoint
API_BASE = "https://data.texas.gov/resource/bc5r-88dy.json"

def fetch_texas_senior_facilities():
    """Quick fetch of Texas senior living facilities - smaller batches"""
    
    # First, let's get a sample to understand the data
    params = {
        "$limit": 100,
        "$order": "operation_name ASC"
    }
    
    headers = {
        "Accept": "application/json",
        "User-Agent": "TrueView Data Collection"
    }
    
    print("Fetching sample data to understand structure...")
    try:
        response = requests.get(API_BASE, params=params, headers=headers, timeout=30)
        response.raise_for_status()
        sample_data = response.json()
        
        if sample_data:
            print(f"\nSample record fields: {list(sample_data[0].keys())}")
            
            # Check what types of operations exist
            operation_types = set()
            for record in sample_data:
                if 'type_of_operation' in record:
                    operation_types.add(record['type_of_operation'])
            
            print(f"\nOperation types found: {operation_types}")
            
            # Look for senior-related operations
            senior_records = []
            for record in sample_data:
                op_type = record.get('type_of_operation', '').upper()
                op_name = record.get('operation_name', '').upper()
                
                # Check for senior-related keywords
                if any(keyword in op_type for keyword in ['ADULT', 'ASSISTED', 'SENIOR', 'ELDERLY', 'NURSING']):
                    senior_records.append(record)
                    print(f"  Found: {record.get('operation_name')} - {record.get('type_of_operation')}")
            
            print(f"\nSenior facilities in sample: {len(senior_records)} out of {len(sample_data)}")
            
            # Now fetch a larger batch focusing on senior facilities
            print("\nFetching larger batch of senior facilities...")
            
            all_facilities = []
            offset = 0
            limit = 1000  # Smaller batches
            
            while len(all_facilities) < 500:  # Get first 500 senior facilities
                params = {
                    "$limit": limit,
                    "$offset": offset,
                    "$order": "operation_name ASC"
                }
                
                response = requests.get(API_BASE, params=params, headers=headers, timeout=30)
                if response.status_code != 200:
                    break
                    
                batch = response.json()
                if not batch:
                    break
                
                # Filter for senior facilities
                for facility in batch:
                    op_type = facility.get('type_of_operation', '').upper()
                    op_name = facility.get('operation_name', '').upper()
                    
                    if any(keyword in op_type for keyword in ['ADULT', 'ASSISTED', 'SENIOR', 'ELDERLY', 'NURSING', 'MEMORY']):
                        processed = {
                            'ProviderID': facility.get('operation_id', ''),
                            'Name': facility.get('operation_name', ''),
                            'Type': facility.get('type_of_operation', ''),
                            'Address': facility.get('location_address', ''),
                            'City': facility.get('location_city', ''),
                            'County': facility.get('county', ''),
                            'State': 'TX',
                            'ZipCode': facility.get('location_zip', ''),
                            'Phone': facility.get('phone_number', ''),
                            'Email': facility.get('email', ''),
                            'Website': facility.get('website_address', ''),
                            'Capacity': facility.get('total_capacity', ''),
                            'Status': facility.get('operation_status', ''),
                            'IssueDate': facility.get('issuance_date', ''),
                            'Administrator': facility.get('administrator_director_name', ''),
                            'Programs': facility.get('programs_provided', '')
                        }
                        all_facilities.append(processed)
                
                print(f"  Processed {offset + len(batch)} records, found {len(all_facilities)} senior facilities")
                offset += limit
                time.sleep(0.5)  # Be respectful
            
            # Save results
            if all_facilities:
                with open('texas_senior_facilities_quick.csv', 'w', newline='', encoding='utf-8') as f:
                    writer = csv.DictWriter(f, fieldnames=all_facilities[0].keys())
                    writer.writeheader()
                    writer.writerows(all_facilities)
                
                print(f"\nSaved {len(all_facilities)} Texas senior facilities to texas_senior_facilities_quick.csv")
                
                # Show sample
                print("\nSample facilities:")
                for facility in all_facilities[:10]:
                    print(f"  - {facility['Name']} ({facility['Type']}) in {facility['City']}, {facility['County']} County")
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    fetch_texas_senior_facilities()