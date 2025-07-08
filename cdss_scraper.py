import requests
from bs4 import BeautifulSoup
import csv
import time
import json
import os
from datetime import datetime

# Configuration
BASE_URL = "https://www.ccld.dss.ca.gov/carefacilitysearch/Results"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (compatible; TrueViewBot/1.0; +https://trueviewsenior.com)'
}
COUNTY = "Shasta"
FACILITY_TYPE = "Residential Care Elderly"

def scrape_cdss(county=COUNTY, facility_type=FACILITY_TYPE):
    """Scrape CDSS for senior living facilities in a specific county"""
    payload = {
        'facilityType': facility_type,
        'county': county,
        'facilityName': '',
        'city': '',
        'zip': '',
        'licNum': '',
        'action': 'Search'
    }

    try:
        response = requests.post(BASE_URL, data=payload, headers=HEADERS, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        cards = soup.find_all('div', class_='result-card')

        results = []
        for card in cards:
            name = card.find('h4').text.strip() if card.find('h4') else ''
            details = card.find_all('p')
            data = {
                'Name': name,
                'Address': '',
                'Phone': '',
                'License Number': '',
                'Facility Type': '',
                'Capacity': '',
                'Status': '',
                'County': county,
                'Scraped At': datetime.now().isoformat()
            }

            for detail in details:
                text = detail.text.strip()
                if "Address:" in text:
                    data['Address'] = text.replace("Address:", "").strip()
                elif "Phone:" in text:
                    data['Phone'] = text.replace("Phone:", "").strip()
                elif "License Number:" in text:
                    data['License Number'] = text.replace("License Number:", "").strip()
                elif "Facility Type:" in text:
                    data['Facility Type'] = text.replace("Facility Type:", "").strip()
                elif "Capacity:" in text:
                    data['Capacity'] = text.replace("Capacity:", "").strip()
                elif "Status:" in text:
                    data['Status'] = text.replace("Status:", "").strip()

            # Only add if we have meaningful data
            if data['Name'] and data['Address']:
                results.append(data)

        return results
        
    except requests.RequestException as e:
        print(f"Error scraping CDSS for {county}: {e}")
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
    """Scrape all California counties for RCFE facilities"""
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
        print(f"Scraping {county} County...")
        results = scrape_cdss(county)
        
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
    print(f"Testing CDSS scraper with {COUNTY} County ({FACILITY_TYPE})...")
    results = scrape_cdss()
    
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
        print("This could be due to:")
        print("- Website blocking requests")
        print("- Changes to website structure")
        print("- Network connectivity issues")