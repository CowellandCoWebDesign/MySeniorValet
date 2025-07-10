#!/usr/bin/env python3
"""
CCLD Adult Residential and Daycare Facilities Scraper
Downloads ALL Adult Residential facilities from California Community Care Licensing Division
Includes ARF, RCFE, EBSH, CCH, SRF and other adult care facilities
"""

import requests
import json
import csv
from datetime import datetime
import time
import os

# CCLD API endpoint for Adult Residential facilities
BASE_URL = "https://www.ccld.dss.ca.gov/carefacilitysearch/api/FacilitySearch"

# All Adult Residential facility types
FACILITY_TYPES = {
    'ARF': 'Adult Residential Facility',
    'RCFE': 'Residential Care Facility for the Elderly',
    'EBSH': 'Enhanced Behavioral Support Home',
    'CCH': 'Community Crisis Home', 
    'SRF': 'Social Rehabilitation Facility',
    'ARFCP': 'Adult Residential Facility - Continuing Care',
    'ARFPSW': 'Adult Residential Facility - Private Single Dwelling'
}

def search_adult_residential_facilities(page=1, page_size=100):
    """Search CCLD API for Adult Residential facilities"""
    
    # Search parameters for Adult Residential facilities
    payload = {
        "FacilityTypeIds": [2],  # Adult Residential ID
        "CountyIds": [],  # All counties
        "ZipCodes": [],
        "CityNames": [],
        "FacilityName": "",
        "FacilityNumber": "",
        "Longitude": 0,
        "Latitude": 0,
        "SearchRadius": 0,
        "PageNumber": page,
        "PageSize": page_size,
        "SortBy": "FacilityName",
        "SortOrder": "ASC"
    }
    
    headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; TrueViewBot/1.0)'
    }
    
    try:
        response = requests.post(BASE_URL, json=payload, headers=headers, timeout=30)
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Error: HTTP {response.status_code}")
            return None
            
    except Exception as e:
        print(f"Error searching facilities: {e}")
        return None

def extract_facility_data(facility):
    """Extract relevant data from facility record"""
    return {
        'name': facility.get('FacilityName', ''),
        'facility_number': facility.get('FacilityNumber', ''),
        'facility_type': facility.get('FacilityType', ''),
        'status': facility.get('FacilityStatus', ''),
        'address': facility.get('FacilityAddress', ''),
        'city': facility.get('City', ''),
        'county': facility.get('County', ''),
        'state': 'CA',
        'zip_code': facility.get('ZipCode', ''),
        'phone': facility.get('FacilityPhone', ''),
        'capacity': facility.get('Capacity', ''),
        'license_first_date': facility.get('LicenseFirstDate', ''),
        'visits': facility.get('Visits', []),
        'complaints': facility.get('Complaints', []),
        'data_source': 'California CCLD Adult Residential'
    }

def scrape_all_adult_residential():
    """Download ALL Adult Residential facilities from CCLD"""
    print("🎯 Downloading California Adult Residential & Daycare Facilities")
    print("=" * 50)
    
    all_facilities = []
    page = 1
    page_size = 100
    
    while True:
        print(f"Fetching page {page}...")
        
        result = search_adult_residential_facilities(page, page_size)
        
        if not result:
            print("Error fetching data, stopping")
            break
            
        facilities = result.get('Results', [])
        total_count = result.get('TotalCount', 0)
        
        if not facilities:
            print("No more facilities found")
            break
            
        for facility in facilities:
            facility_data = extract_facility_data(facility)
            all_facilities.append(facility_data)
            
        print(f"✅ Page {page}: {len(facilities)} facilities (Total so far: {len(all_facilities)})")
        
        # Check if we've gotten all facilities
        if len(all_facilities) >= total_count:
            print(f"✅ Downloaded all {total_count} facilities")
            break
            
        page += 1
        time.sleep(1)  # Be respectful to the API
    
    return all_facilities

def save_to_csv(facilities):
    """Save facilities to CSV file"""
    if not facilities:
        print("No facilities to save")
        return None
        
    filename = f"california_adult_residential_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    
    # Define CSV columns
    fieldnames = [
        'name', 'facility_number', 'facility_type', 'status',
        'address', 'city', 'county', 'state', 'zip_code', 
        'phone', 'capacity', 'license_first_date', 'data_source'
    ]
    
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        
        for facility in facilities:
            # Only write the fields we defined
            row = {key: facility.get(key, '') for key in fieldnames}
            writer.writerow(row)
    
    print(f"✅ Saved {len(facilities)} facilities to {filename}")
    return filename

def save_summary(facilities):
    """Save summary statistics"""
    if not facilities:
        return
        
    # Count by facility type
    type_counts = {}
    county_counts = {}
    city_counts = {}
    
    for facility in facilities:
        # Count types
        ftype = facility.get('facility_type', 'Unknown')
        type_counts[ftype] = type_counts.get(ftype, 0) + 1
        
        # Count counties
        county = facility.get('county', 'Unknown')
        county_counts[county] = county_counts.get(county, 0) + 1
        
        # Count cities
        city = facility.get('city', 'Unknown')
        city_counts[city] = city_counts.get(city, 0) + 1
    
    summary = {
        'total_facilities': len(facilities),
        'facility_types': type_counts,
        'counties': len(county_counts),
        'cities': len(city_counts),
        'top_counties': dict(sorted(county_counts.items(), key=lambda x: x[1], reverse=True)[:10]),
        'top_cities': dict(sorted(city_counts.items(), key=lambda x: x[1], reverse=True)[:10])
    }
    
    summary_filename = f"california_adult_residential_summary_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    
    with open(summary_filename, 'w') as f:
        json.dump(summary, f, indent=2)
    
    print(f"\n📊 Summary saved to {summary_filename}")
    print(f"   Total Facilities: {summary['total_facilities']}")
    print(f"   Facility Types: {summary['facility_types']}")
    print(f"   Counties Covered: {summary['counties']}")
    print(f"   Cities Covered: {summary['cities']}")
    
    return summary_filename

def main():
    """Main execution function"""
    print("🏠 California Adult Residential & Daycare Facilities Downloader")
    print("Fetching from CCLD database...")
    print()
    
    # Download all facilities
    facilities = scrape_all_adult_residential()
    
    if facilities:
        # Save to CSV
        csv_file = save_to_csv(facilities)
        
        # Save summary
        summary_file = save_summary(facilities)
        
        print(f"\n✅ DOWNLOAD COMPLETE!")
        print(f"   Total facilities: {len(facilities)}")
        print(f"   CSV file: {csv_file}")
        print(f"   Summary file: {summary_file}")
        
        # Show facility type breakdown
        type_counts = {}
        for facility in facilities:
            ftype = facility.get('facility_type', 'Unknown')
            type_counts[ftype] = type_counts.get(ftype, 0) + 1
        
        print(f"\n📊 Facility Type Breakdown:")
        for ftype, count in sorted(type_counts.items(), key=lambda x: x[1], reverse=True):
            print(f"   {ftype}: {count} facilities")
            
    else:
        print("❌ No facilities downloaded")

if __name__ == "__main__":
    main()