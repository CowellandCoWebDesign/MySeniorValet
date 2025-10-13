import requests
from bs4 import BeautifulSoup
import csv
import time
import re

# Correct Texas HHSC LTC Search URL
BASE_URL = "https://apps.hhs.texas.gov/LTCSearch/"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}

def get_session():
    """Create a session to maintain cookies"""
    session = requests.Session()
    session.headers.update(HEADERS)
    return session

def search_by_county(session, county_name):
    """Search for facilities by county"""
    search_url = f"{BASE_URL}providersearch.cfm"
    
    # Common Texas counties to search
    form_data = {
        'searchType': 'county',
        'countyName': county_name,
        'providerType': 'ALF',  # Assisted Living Facilities
        'submit': 'Search'
    }
    
    try:
        response = session.post(search_url, data=form_data, timeout=30)
        response.raise_for_status()
        return response.text
    except Exception as e:
        print(f"Error searching county {county_name}: {e}")
        return None

def parse_search_results(html_content):
    """Parse search results page for facility links"""
    if not html_content:
        return []
    
    soup = BeautifulSoup(html_content, 'html.parser')
    facilities = []
    
    # Look for facility links - adjust selectors based on actual page structure
    # Common patterns in government sites
    facility_links = soup.find_all('a', href=re.compile(r'providerdetail\.cfm|facilityid=|providerid=', re.I))
    
    for link in facility_links:
        facility_info = {
            'name': link.get_text(strip=True),
            'url': link.get('href', '')
        }
        if facility_info['name'] and facility_info['url']:
            if not facility_info['url'].startswith('http'):
                facility_info['url'] = BASE_URL + facility_info['url']
            facilities.append(facility_info)
    
    # Also try to extract from tables
    tables = soup.find_all('table')
    for table in tables:
        rows = table.find_all('tr')
        for row in rows[1:]:  # Skip header
            cells = row.find_all(['td', 'th'])
            if len(cells) >= 2:
                # Try to find facility name and details
                for cell in cells:
                    text = cell.get_text(strip=True)
                    if len(text) > 10 and any(word in text.upper() for word in ['LIVING', 'CARE', 'HOME', 'CENTER']):
                        facilities.append({
                            'name': text,
                            'url': '',
                            'raw_row': [c.get_text(strip=True) for c in cells]
                        })
                        break
    
    return facilities

def scrape_facility_details(session, facility_url):
    """Scrape individual facility details page"""
    if not facility_url:
        return {}
    
    try:
        response = session.get(facility_url, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        details = {}
        
        # Extract details - patterns to look for
        patterns = {
            'name': ['facility name', 'provider name', 'name:'],
            'address': ['address:', 'location:', 'street address'],
            'city': ['city:'],
            'phone': ['phone:', 'telephone:', 'contact:'],
            'type': ['facility type:', 'provider type:', 'type:'],
            'capacity': ['capacity:', 'beds:', 'licensed for:'],
            'license': ['license:', 'license number:', 'license #'],
        }
        
        # Look for definition lists, tables, or labeled spans
        for key, search_terms in patterns.items():
            for term in search_terms:
                # Search in various HTML structures
                element = soup.find(text=re.compile(term, re.I))
                if element:
                    parent = element.parent
                    if parent.name in ['dt', 'th', 'strong', 'b']:
                        next_elem = parent.find_next_sibling()
                        if next_elem:
                            details[key] = next_elem.get_text(strip=True)
                    else:
                        # Try to get text after the label
                        text = parent.get_text(strip=True)
                        parts = text.split(':', 1)
                        if len(parts) > 1:
                            details[key] = parts[1].strip()
        
        return details
        
    except Exception as e:
        print(f"Error fetching details from {facility_url}: {e}")
        return {}

def scrape_texas_ltc():
    """Main scraping function"""
    session = get_session()
    
    # First, let's test the search page
    print("Testing Texas LTC Search access...")
    
    try:
        # Try to access the main page
        response = session.get(BASE_URL, timeout=30)
        print(f"Main page status: {response.status_code}")
        
        # Save the page for inspection
        with open('texas_ltc_main.html', 'w', encoding='utf-8') as f:
            f.write(response.text)
        print("Saved main page to texas_ltc_main.html")
        
        # Major Texas counties to search
        counties = ['HARRIS', 'DALLAS', 'TARRANT', 'BEXAR', 'TRAVIS', 'COLLIN', 'DENTON', 'FORT BEND']
        
        all_facilities = []
        
        for county in counties[:3]:  # Start with first 3 counties
            print(f"\nSearching {county} County...")
            
            results_html = search_by_county(session, county)
            if results_html:
                # Save results for inspection
                with open(f'texas_results_{county.lower()}.html', 'w', encoding='utf-8') as f:
                    f.write(results_html)
                
                facilities = parse_search_results(results_html)
                print(f"Found {len(facilities)} facilities in {county} County")
                
                # Get details for each facility
                for facility in facilities[:5]:  # Limit to first 5 per county for testing
                    if facility.get('url'):
                        print(f"  Fetching details for: {facility['name']}")
                        details = scrape_facility_details(session, facility['url'])
                        facility.update(details)
                        all_facilities.append(facility)
                        time.sleep(1)  # Be respectful
            
            time.sleep(2)  # Pause between counties
        
        # Save results
        if all_facilities:
            with open('texas_ltc_facilities.csv', 'w', newline='', encoding='utf-8') as f:
                fieldnames = ['name', 'address', 'city', 'phone', 'type', 'capacity', 'license', 'url']
                writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
                writer.writeheader()
                writer.writerows(all_facilities)
            
            print(f"\nSaved {len(all_facilities)} facilities to texas_ltc_facilities.csv")
            
            # Show sample
            print("\nSample facilities:")
            for facility in all_facilities[:5]:
                print(f"  - {facility.get('name', 'Unknown')} in {facility.get('city', 'Unknown')}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    scrape_texas_ltc()