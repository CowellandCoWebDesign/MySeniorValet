import requests
from bs4 import BeautifulSoup
import csv
import time
import json
import os
from datetime import datetime

# Configuration
BASE_URL = "https://www.ccld.dss.ca.gov/carefacilitysearch/Search/ElderlyAssistedLiving"
SEARCH_API_URL = "https://www.ccld.dss.ca.gov/carefacilitysearch/api/search"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Content-Type': 'application/json',
    'Referer': 'https://www.ccld.dss.ca.gov/carefacilitysearch/Search/ElderlyAssistedLiving'
}
COUNTY = "Shasta"
FACILITY_TYPE = "Residential Care Elderly"

def search_cdss_facilities(county=COUNTY, facility_type="RCFE"):
    """Search CDSS transparency API for senior living facilities"""
    
    # First, try to get the main search page to find API structure
    try:
        # Get the main search page
        response = requests.get("https://www.ccld.dss.ca.gov/carefacilitysearch/", headers=HEADERS, timeout=30)
        response.raise_for_status()
        
        # Try to extract API endpoints or search structure
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Look for Angular app configuration or API calls
        scripts = soup.find_all('script')
        api_urls = []
        
        for script in scripts:
            if script.string:
                content = script.string
                # Look for API endpoints
                if 'api/' in content or 'transparencyapi' in content:
                    print(f"Found potential API reference: {content[:200]}...")
                    
        # Try the transparency API directly
        transparency_api_url = "https://www.ccld.dss.ca.gov/transparencyapi/api/FacilitySearch"
        
        # Attempt to search using different payload structures
        payloads_to_try = [
            {
                "county": county,
                "facilityType": facility_type,
                "pageNumber": 1,
                "pageSize": 100
            },
            {
                "County": county,
                "FacilityType": facility_type
            },
            {
                "searchCriteria": {
                    "county": county,
                    "facilityType": facility_type
                }
            }
        ]
        
        results = []
        
        for i, payload in enumerate(payloads_to_try):
            try:
                print(f"Trying payload structure {i+1}: {payload}")
                api_response = requests.post(transparency_api_url, 
                                           json=payload, 
                                           headers=HEADERS, 
                                           timeout=30)
                
                if api_response.status_code == 200:
                    data = api_response.json()
                    print(f"Success! Got response: {str(data)[:200]}...")
                    
                    # Process the JSON response
                    if isinstance(data, list):
                        facilities = data
                    elif isinstance(data, dict) and 'data' in data:
                        facilities = data['data']
                    elif isinstance(data, dict) and 'facilities' in data:
                        facilities = data['facilities']
                    else:
                        facilities = [data] if data else []
                    
                    for facility in facilities:
                        if isinstance(facility, dict):
                            facility_data = {
                                'Name': facility.get('facilityName', facility.get('name', '')),
                                'Address': facility.get('address', ''),
                                'Phone': facility.get('phone', ''),
                                'License Number': facility.get('licenseNumber', facility.get('facilityNumber', '')),
                                'Facility Type': facility.get('facilityType', ''),
                                'Capacity': facility.get('capacity', ''),
                                'Status': facility.get('status', ''),
                                'County': county,
                                'Scraped At': datetime.now().isoformat()
                            }
                            
                            if facility_data['Name']:
                                results.append(facility_data)
                    
                    if results:
                        return results
                        
                else:
                    print(f"API call {i+1} failed with status: {api_response.status_code}")
                    print(f"Response: {api_response.text[:200]}...")
                    
            except Exception as e:
                print(f"Error with payload {i+1}: {e}")
                continue
        
        return results
        
    except Exception as e:
        print(f"Error accessing CDSS: {e}")
        return []

def save_to_csv(data, filename="cdss_facilities.csv"):
    """Save facility data to CSV file"""
    if not data:
        return
    
    keys = data[0].keys()
    with open(filename, "w", newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, keys)
        writer.writeheader()
        writer.writerows(data)

def save_to_json(data, filename="cdss_facilities.json"):
    """Save facility data to JSON file for easier parsing"""
    with open(filename, "w", encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def scrape_all_counties():
    """Search all California counties for RCFE facilities"""
    ca_counties = [
        "Alameda", "Alpine", "Amador", "Butte", "Calaveras", "Colusa", "Contra Costa",
        "Del Norte", "El Dorado", "Fresno", "Glenn", "Humboldt", "Imperial", "Inyo",
        "Kern", "Kings", "Lake", "Lassen", "Los Angeles", "Madera", "Marin", "Mariposa",
        "Mendocino", "Merced", "Modoc", "Mono", "Monterey", "Napa", "Nevada", "Orange",
        "Placer", "Plumas", "Riverside", "Sacramento", "San Benito", "San Bernardino",
        "San Diego", "San Francisco", "San Joaquin", "San Luis Obispo", "San Mateo",
        "Santa Barbara", "Santa Clara", "Santa Cruz", "Shasta", "Sierra", "Siskiyou",
        "Solano", "Sonoma", "Stanislaus", "Sutter", "Tehama", "Trinity", "Tulare",
        "Tuolumne", "Ventura", "Yolo", "Yuba"
    ]
    
    all_results = []
    success_count = 0
    
    for county in ca_counties:
        print(f"Searching {county} County...")
        results = search_cdss_facilities(county)
        
        if results:
            all_results.extend(results)
            success_count += 1
            print(f"  Found {len(results)} facilities")
        else:
            print(f"  No results found")
            
        # Be respectful - add delay between requests
        time.sleep(2)
    
    print(f"\nCompleted: {success_count}/{len(ca_counties)} counties")
    print(f"Total facilities found: {len(all_results)}")
    
    return all_results

if __name__ == "__main__":
    # First test with single county
    print(f"Testing CDSS API search with {COUNTY} County...")
    results = search_cdss_facilities()
    
    if results:
        save_to_csv(results, f"cdss_{COUNTY.lower()}_test.csv")
        save_to_json(results, f"cdss_{COUNTY.lower()}_test.json")
        print(f"✅ Test successful! Found {len(results)} facilities")
        print(f"Sample facility: {results[0]['Name']}")
        
        # Ask if user wants to run full scrape
        response = input("\nRun full California scrape? (y/n): ")
        if response.lower() == 'y':
            print("\nStarting full California scrape...")
            all_results = scrape_all_counties()
            
            if all_results:
                save_to_csv(all_results, "cdss_all_california.csv")
                save_to_json(all_results, "cdss_all_california.json")
                print(f"✅ Full scrape complete! Saved {len(all_results)} facilities")
            else:
                print("❌ No facilities found in full scrape")
    else:
        print("❌ Test failed - no results found")
        print("Investigating API structure and endpoints...")
        
        # Try alternative approach - look for actual API structure
        try:
            print("\nTrying to find working API endpoints...")
            response = requests.get("https://www.ccld.dss.ca.gov/carefacilitysearch/", 
                                  headers={'User-Agent': 'Mozilla/5.0 (compatible; MySeniorValetBot/1.0)'})
            
            if response.status_code == 200:
                print("✅ Main site is accessible")
                
                # Look for API calls in the page source
                soup = BeautifulSoup(response.text, 'html.parser')
                scripts = soup.find_all('script')
                
                print("Analyzing page structure for API endpoints...")
                for script in scripts:
                    if script.get('src'):
                        js_url = script.get('src')
                        if 'controller' in js_url or 'app' in js_url or 'search' in js_url:
                            print(f"Found relevant JS file: {js_url}")
                            
                print("\nRecommendations:")
                print("1. The site may use a complex Angular/React app structure")
                print("2. Consider using Selenium for browser automation")
                print("3. Check the California Open Data Portal for facility datasets")
                print("4. Contact CDSS directly for API access")
                
            else:
                print(f"❌ Site returned status: {response.status_code}")
                
        except Exception as e:
            print(f"Error investigating site: {e}")