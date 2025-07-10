import requests
import json
import csv
import time

# Texas Open Data Portal API endpoint for HHSC CCL data
API_BASE = "https://data.texas.gov/resource/bc5r-88dy.json"

# API documentation: https://dev.socrata.com/foundry/data.texas.gov/bc5r-88dy

def fetch_residential_operations(limit=2000, offset=0):
    """
    Fetch residential operations data from Texas Open Data Portal
    Focus on assisted living and senior care facilities
    """
    params = {
        "$limit": limit,
        "$offset": offset,
        "$order": "operation_name ASC"
    }
    
    headers = {
        "Accept": "application/json",
        "User-Agent": "TrueView Data Collection"
    }
    
    try:
        response = requests.get(API_BASE, params=params, headers=headers, timeout=30)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error fetching data: {e}")
        return []

def process_texas_facilities():
    """Process all Texas senior living facilities from Open Data Portal"""
    all_facilities = []
    offset = 0
    limit = 2000
    
    while True:
        print(f"Fetching records {offset} to {offset + limit}...")
        facilities = fetch_residential_operations(limit=limit, offset=offset)
        
        if not facilities:
            break
            
        all_facilities.extend(facilities)
        
        if len(facilities) < limit:
            break
            
        offset += limit
        time.sleep(1)  # Be respectful to the API
    
    print(f"\nTotal facilities fetched: {len(all_facilities)}")
    
    # Process and filter for senior living
    senior_facilities = []
    for facility in all_facilities:
        # Filter for senior-focused operations
        op_type = facility.get('type_of_operation', '').upper()
        op_name = facility.get('operation_name', '').upper()
        
        senior_keywords = ['ASSISTED', 'ADULT', 'SENIOR', 'ELDERLY', 'NURSING', 'MEMORY', 'ALZHEIMER']
        
        if any(keyword in op_type for keyword in senior_keywords) or \
           any(keyword in op_name for keyword in senior_keywords):
            
            # Extract relevant fields
            processed = {
                'ProviderID': facility.get('operation_id', ''),
                'Name': facility.get('operation_name', ''),
                'Type': facility.get('type_of_operation', ''),
                'Address': facility.get('location_address', ''),
                'City': facility.get('location_city', ''),
                'County': facility.get('county', ''),
                'State': 'TX',
                'ZipCode': facility.get('location_zip', ''),
                'Phone': facility.get('phone', ''),
                'Email': facility.get('email', ''),
                'Website': facility.get('website_address', ''),
                'Capacity': facility.get('total_capacity', ''),
                'LicenseStatus': facility.get('operation_status', ''),
                'IssueDate': facility.get('issue_date', ''),
                'Administrator': facility.get('administrator', ''),
                'SourceURL': f"https://data.texas.gov/d/bc5r-88dy/row-{facility.get('operation_id', '')}"
            }
            
            senior_facilities.append(processed)
    
    print(f"Senior living facilities found: {len(senior_facilities)}")
    
    # Save to CSV
    if senior_facilities:
        with open('texas_senior_facilities.csv', 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=senior_facilities[0].keys())
            writer.writeheader()
            writer.writerows(senior_facilities)
        
        print(f"Saved {len(senior_facilities)} facilities to texas_senior_facilities.csv")
        
        # Print sample
        print("\nSample facilities:")
        for facility in senior_facilities[:5]:
            print(f"  - {facility['Name']} ({facility['Type']}) in {facility['City']}, {facility['County']} County")
    
    return senior_facilities

if __name__ == "__main__":
    print("Fetching Texas senior living facilities from Open Data Portal...")
    facilities = process_texas_facilities()