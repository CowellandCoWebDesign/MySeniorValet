import requests
from bs4 import BeautifulSoup
import json
import time

def test_search_page():
    """Test if we can access the search page and understand its structure"""
    
    session = requests.Session()
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    }
    session.headers.update(headers)
    
    print("Testing Texas HHSC LTC Search...")
    
    # First, visit the main page
    try:
        main_url = "https://apps.hhs.texas.gov/LTCSearch/"
        response = session.get(main_url, timeout=30)
        print(f"Main page status: {response.status_code}")
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Look for form elements
            forms = soup.find_all('form')
            print(f"Found {len(forms)} forms")
            
            # Look for dropdowns/selects
            selects = soup.find_all('select')
            print(f"Found {len(selects)} select elements")
            for select in selects:
                print(f"  - {select.get('name', 'unnamed')}: {select.get('id', 'no-id')}")
            
            # Look for provider type options
            provider_types = soup.find_all(text=lambda text: 'Assisted Living' in text if text else False)
            print(f"Found {len(provider_types)} mentions of 'Assisted Living'")
            
            # Save the page for inspection
            with open('texas_ltc_main_page.html', 'w', encoding='utf-8') as f:
                f.write(response.text)
            print("Saved main page to texas_ltc_main_page.html")
            
    except Exception as e:
        print(f"Error accessing main page: {e}")
        return
    
    # Try provider search page directly
    try:
        search_url = "https://apps.hhs.texas.gov/LTCSearch/providersearch.cfm"
        response = session.get(search_url, timeout=30)
        print(f"\nProvider search page status: {response.status_code}")
        
        if response.status_code == 200:
            with open('texas_ltc_search_page.html', 'w', encoding='utf-8') as f:
                f.write(response.text)
            print("Saved search page to texas_ltc_search_page.html")
            
    except Exception as e:
        print(f"Error accessing search page: {e}")

def search_by_county(county_name="HARRIS"):
    """Try to search for facilities by county"""
    
    session = requests.Session()
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Content-Type": "application/x-www-form-urlencoded",
    }
    session.headers.update(headers)
    
    print(f"\nSearching for facilities in {county_name} County...")
    
    # Try different search endpoints
    search_urls = [
        "https://apps.hhs.texas.gov/LTCSearch/providersearchresults.cfm",
        "https://apps.hhs.texas.gov/LTCSearch/providersearch.cfm",
    ]
    
    # Common form parameters for assisted living search
    form_data_options = [
        {
            "providerType": "ALF",  # Assisted Living Facility
            "countyName": county_name,
            "searchType": "county",
            "submit": "Search"
        },
        {
            "ProviderType": "ALF",
            "County": county_name,
            "City": "",
            "ZipCode": "",
            "Search": "Search"
        },
        {
            "facilityType": "ALF",
            "county": county_name,
            "action": "search"
        }
    ]
    
    for url in search_urls:
        for form_data in form_data_options:
            try:
                print(f"Trying {url} with data: {form_data}")
                response = session.post(url, data=form_data, timeout=30)
                
                if response.status_code == 200 and len(response.text) > 1000:
                    # Check if we got results
                    if "no results" not in response.text.lower() and "error" not in response.text.lower():
                        soup = BeautifulSoup(response.text, 'html.parser')
                        
                        # Look for facility data in tables
                        tables = soup.find_all('table')
                        if tables:
                            print(f"Found {len(tables)} tables in response")
                            
                            # Save successful response
                            with open(f'texas_search_results_{county_name}.html', 'w', encoding='utf-8') as f:
                                f.write(response.text)
                            print(f"Saved results to texas_search_results_{county_name}.html")
                            
                            # Try to extract facility names
                            links = soup.find_all('a')
                            facility_links = [link for link in links if 'facility' in str(link).lower() or 'provider' in str(link).lower()]
                            print(f"Found {len(facility_links)} potential facility links")
                            
                            return response.text
                        
            except Exception as e:
                print(f"Error with {url}: {e}")
                continue
    
    return None

if __name__ == "__main__":
    # First test the structure
    test_search_page()
    
    # Then try searching
    search_by_county("HARRIS")
    search_by_county("DALLAS")