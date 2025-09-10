#!/usr/bin/env python3

import requests
import json
import csv
from datetime import datetime
import time

def collect_minnesota_licensing():
    """
    Collect Minnesota state licensing data using their public API
    """
    
    print("=" * 60)
    print("MINNESOTA STATE LICENSING COLLECTOR")
    print("=" * 60)
    print("Source: Minnesota Department of Human Services")
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    all_facilities = []
    
    # Minnesota DHS Licensing Lookup API endpoints
    base_url = "https://licensinglookup.dhs.state.mn.us"
    
    # Service types for senior living
    service_types = [
        "Assisted Living",
        "Housing With Services",
        "Adult Day Care",
        "Home Care Provider"
    ]
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/html, */*'
    }
    
    print("\nSearching Minnesota DHS Licensing Database...")
    
    for service_type in service_types:
        print(f"\n   Searching for {service_type} facilities...")
        
        # Try direct search endpoint
        search_params = {
            'serviceType': service_type,
            'county': 'All',
            'status': 'Active'
        }
        
        try:
            # Minnesota uses a form-based search, so we'll try common counties
            counties = [
                'Hennepin', 'Ramsey', 'Dakota', 'Anoka', 'Washington',
                'St. Louis', 'Stearns', 'Olmsted', 'Wright', 'Carver'
            ]
            
            for county in counties:
                url = f"{base_url}/Search/Results"
                params = {
                    'County': county,
                    'ServiceType': service_type,
                    'Status': 'Licensed'
                }
                
                response = requests.get(url, params=params, headers=headers, timeout=30)
                
                if response.status_code == 200:
                    # Parse HTML response (since API returns HTML)
                    # For now, we'll note the successful connection
                    print(f"      ✓ Connected to {county} county data")
                    
                    # Would need HTML parsing here to extract facility data
                    # BeautifulSoup would be ideal but keeping dependencies minimal
                    
                time.sleep(1)  # Be respectful
                
        except Exception as e:
            print(f"      ✗ Error searching {service_type}: {str(e)}")
    
    # Alternative: Try Minnesota Open Data Portal
    print("\n\nTrying Minnesota Open Data Portal...")
    
    open_data_urls = [
        "https://opendata.minneapolismn.gov/api/views/s4m9-q5j8/rows.json?accessType=DOWNLOAD",  # Minneapolis facilities
        "https://data.mn.gov/api/views/nh2p-xhr8/rows.json?accessType=DOWNLOAD"  # State facilities
    ]
    
    for url in open_data_urls:
        try:
            print(f"   Trying: {url[:60]}...")
            response = requests.get(url, headers=headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                
                if 'data' in data:
                    rows = data['data']
                    print(f"   ✓ Found {len(rows)} records")
                    
                    # Process rows based on data structure
                    for row in rows[:50]:  # Limit to first 50
                        # Minnesota open data structure varies
                        # Would need to inspect actual response structure
                        pass
                        
        except Exception as e:
            print(f"   ✗ Error: {str(e)}")
    
    print(f"\n" + "=" * 60)
    print("MINNESOTA MANUAL DOWNLOAD INSTRUCTIONS")
    print("=" * 60)
    
    print("\n1. Health Care Provider Directory (Excel):")
    print("   • Visit: https://www.health.state.mn.us/facilities/regulation/directory/")
    print("   • Click 'Provider Directory (Excel)'")
    print("   • Download includes all licensed health facilities")
    print("   • Updated daily")
    
    print("\n2. DHS Licensing Lookup:")
    print("   • Visit: https://licensinglookup.dhs.state.mn.us/")
    print("   • Search by service type:")
    print("     - Assisted Living")
    print("     - Housing With Services") 
    print("     - Adult Day Care")
    print("   • Export results to Excel")
    
    print("\n3. Assisted Living Report Card:")
    print("   • Visit: https://mn.gov/dhs/partners-and-providers/news-initiatives-reports-workgroups/aging/assisted-living-report-card/")
    print("   • Download 2025 report with quality ratings")
    
    print("\n4. For bulk data access:")
    print("   • Contact: health.facilitycomplaints@state.mn.us")
    print("   • Request: Licensed senior living facilities dataset")
    
    # Create a summary even without collected data
    summary = {
        'state': 'Minnesota',
        'manual_download_available': True,
        'bulk_csv_url': 'https://www.health.state.mn.us/facilities/regulation/directory/docs/provdir.xlsx',
        'api_available': False,
        'notes': 'Excel file download available with daily updates',
        'timestamp': datetime.now().isoformat()
    }
    
    output_file = f"minnesota_licensing_info_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(output_file, 'w') as f:
        json.dump(summary, f, indent=2)
    
    print(f"\n✓ Summary saved to: {output_file}")
    
    return summary

if __name__ == "__main__":
    result = collect_minnesota_licensing()