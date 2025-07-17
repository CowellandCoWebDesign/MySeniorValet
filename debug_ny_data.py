#!/usr/bin/env python3
"""
Debug script to understand NY data structure
"""

import requests
import json

# Test the NY APIs to understand structure
cert_url = "https://health.data.ny.gov/resource/2g9y-7kqm.json"
general_url = "https://health.data.ny.gov/resource/vn5v-hh5r.json"

print("Testing NY Certification API...")
try:
    response = requests.get(cert_url + "?$limit=5")
    cert_data = response.json()
    print(f"Certification data structure (first record):")
    if cert_data:
        print(json.dumps(cert_data[0], indent=2))
    else:
        print("No certification data found")
except Exception as e:
    print(f"Error with certification API: {e}")

print("\n" + "="*50 + "\n")

print("Testing NY General Info API...")
try:
    response = requests.get(general_url + "?$limit=5")
    general_data = response.json()
    print(f"General info data structure (first record):")
    if general_data:
        print(json.dumps(general_data[0], indent=2))
    else:
        print("No general info data found")
except Exception as e:
    print(f"Error with general info API: {e}")

print("\n" + "="*50 + "\n")

# Check for adult care facilities in both datasets
print("Checking for adult care facilities in certification data...")
try:
    response = requests.get(cert_url + "?$limit=100")
    cert_data = response.json()
    
    acf_count = 0
    for record in cert_data:
        description = record.get('description', '').lower()
        if 'adult' in description or 'care' in description or 'assisted' in description:
            acf_count += 1
            if acf_count <= 3:  # Show first 3 examples
                print(f"  - {record.get('description', 'No description')}")
                print(f"    Facility ID: {record.get('facility_id', 'No ID')}")
                
    print(f"Found {acf_count} potential adult care facilities in first 100 records")
    
except Exception as e:
    print(f"Error checking certification data: {e}")