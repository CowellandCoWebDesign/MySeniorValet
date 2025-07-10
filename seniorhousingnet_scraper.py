import requests
from bs4 import BeautifulSoup
import time
import csv
import re
from urllib.parse import urljoin, urlparse
import json

BASE_URL = "https://www.seniorhousingnet.com"
START_URL = "https://www.seniorhousingnet.com/seniorliving-search?state=CA"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

def get_listing_links(page_url):
    """Extract community listing links from search results page"""
    print(f"Fetching search results from: {page_url}")
    response = requests.get(page_url, headers=HEADERS)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    links = []
    
    # Try multiple selectors for community links
    selectors = [
        "a[href*='/seniorliving-community/']",
        "a[href*='/community/']", 
        "a[href*='/listing/']",
        "a[href*='/profile/']",
        "a[href*='/senior-living/']",
        "a.listing-link",
        "a.community-link",
        ".listing-item a",
        ".community-item a",
        ".search-result a"
    ]
    
    for selector in selectors:
        elements = soup.select(selector)
        for a in elements:
            href = a.get("href")
            if href:
                if href.startswith("/"):
                    full_url = BASE_URL + href
                elif href.startswith("http"):
                    full_url = href
                else:
                    continue
                
                # Filter for community pages
                if any(pattern in href.lower() for pattern in ['community', 'listing', 'profile', 'senior-living']):
                    links.append(full_url)
    
    # Remove duplicates
    links = list(set(links))
    
    print(f"Found {len(links)} potential community links")
    for link in links[:5]:  # Show first 5 for debugging
        print(f"  Sample: {link}")
    
    return links

def parse_listing(url):
    """Parse individual community listing page"""
    print(f"  Parsing: {url}")
    response = requests.get(url, headers=HEADERS)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Multiple selectors for each field to handle different page structures
    name_selectors = ["h1", ".community-name", ".listing-title", ".property-name", "h1.title"]
    address_selectors = [".address", ".location", ".community-address", ".property-address", "[itemprop='address']"]
    phone_selectors = [".phone-number", ".phone", ".contact-phone", ".tel", "a[href^='tel:']"]
    description_selectors = [".description", ".about", ".community-description", ".property-description", ".overview"]
    image_selectors = ["img[src*='photo']", "img[src*='image']", ".gallery img", ".photos img", ".community-image"]
    care_selectors = [".services li", ".care-types li", ".services-list li", ".amenities li"]
    amenity_selectors = [".amenities li", ".features li", ".services li", ".community-amenities li"]
    price_selectors = [".price-range", ".price-info", ".pricing", ".cost", ".rates"]
    
    # Extract data using multiple selectors
    name = ""
    for selector in name_selectors:
        element = soup.select_one(selector)
        if element:
            name = element.text.strip()
            break
    
    address = ""
    for selector in address_selectors:
        element = soup.select_one(selector)
        if element:
            address = element.text.strip()
            break
    
    phone = ""
    for selector in phone_selectors:
        element = soup.select_one(selector)
        if element:
            phone = element.text.strip()
            # Clean phone number
            phone = re.sub(r'[^\d\-\(\)\s\+]', '', phone)
            break
    
    description = ""
    for selector in description_selectors:
        element = soup.select_one(selector)
        if element:
            description = element.text.strip()
            break
    
    # Extract images
    images = []
    for selector in image_selectors:
        imgs = soup.select(selector)
        for img in imgs:
            src = img.get("src")
            if src:
                if src.startswith("//"):
                    src = "https:" + src
                elif src.startswith("/"):
                    src = BASE_URL + src
                images.append(src)
    
    # Extract care levels
    care_levels = []
    for selector in care_selectors:
        elements = soup.select(selector)
        for element in elements:
            text = element.text.strip()
            if text and len(text) > 2:
                care_levels.append(text)
    
    # Extract amenities
    amenities = []
    for selector in amenity_selectors:
        elements = soup.select(selector)
        for element in elements:
            text = element.text.strip()
            if text and len(text) > 2:
                amenities.append(text)
    
    # Extract pricing
    price = ""
    for selector in price_selectors:
        element = soup.select_one(selector)
        if element:
            price = element.text.strip()
            break
    
    # Remove duplicates
    images = list(set(images))
    care_levels = list(set(care_levels))
    amenities = list(set(amenities))
    
    return {
        "Name": name,
        "Address": address,
        "Phone": phone,
        "Description": description[:500] + "..." if len(description) > 500 else description,
        "Images": "; ".join(images[:5]),  # Limit to 5 images
        "Care Levels": "; ".join(care_levels),
        "Amenities": "; ".join(amenities),
        "Price": price,
        "Source URL": url
    }

def scrape_seniorhousingnet():
    """Main scraping function"""
    print("🚀 Starting SeniorHousingNet scraper...")
    listings_data = []
    
    # Try multiple search URLs to find working listings
    search_urls = [
        "https://www.seniorhousingnet.com/seniorliving-search?state=CA",
        "https://www.seniorhousingnet.com/senior-living/california",
        "https://www.seniorhousingnet.com/communities/california",
        "https://www.seniorhousingnet.com/search?location=california"
    ]
    
    all_links = []
    for url in search_urls:
        try:
            links = get_listing_links(url)
            all_links.extend(links)
            if links:
                print(f"✓ Found {len(links)} links from {url}")
                break  # Use first working URL
        except Exception as e:
            print(f"✗ Failed to get links from {url}: {e}")
            continue
    
    # Remove duplicates
    all_links = list(set(all_links))
    
    if not all_links:
        print("❌ No community links found. Trying alternative approach...")
        # Alternative: Try to find some sample community URLs directly
        sample_urls = [
            "https://www.seniorhousingnet.com/senior-living-community/sunrise-of-palo-alto",
            "https://www.seniorhousingnet.com/senior-living-community/belmont-village-senior-living",
            "https://www.seniorhousingnet.com/senior-living-community/atria-senior-living"
        ]
        
        for url in sample_urls:
            try:
                response = requests.get(url, headers=HEADERS)
                if response.status_code == 200:
                    all_links.append(url)
                    print(f"✓ Added sample URL: {url}")
            except:
                continue
    
    if not all_links:
        print("❌ No community links found at all. The site structure may have changed.")
        return
    
    print(f"🎯 Starting to scrape {len(all_links)} communities...")
    
    # Limit to first 10 for testing
    links_to_process = all_links[:10]
    
    for idx, link in enumerate(links_to_process):
        print(f"📋 Scraping {idx+1}/{len(links_to_process)}: {link}")
        try:
            data = parse_listing(link)
            if data["Name"]:  # Only save if we got a name
                listings_data.append(data)
                print(f"   ✓ Saved: {data['Name']}")
            else:
                print(f"   ✗ No data found")
            time.sleep(1)  # Be polite
        except Exception as e:
            print(f"   ✗ Error: {e}")
            continue
    
    # Save results
    if listings_data:
        keys = listings_data[0].keys()
        with open("seniorhousingnet_sample.csv", "w", newline='', encoding="utf-8") as f:
            writer = csv.DictWriter(f, keys)
            writer.writeheader()
            writer.writerows(listings_data)
        
        print(f"✅ Saved {len(listings_data)} listings to seniorhousingnet_sample.csv")
        
        # Show sample data
        if listings_data:
            print("\n📊 Sample data:")
            sample = listings_data[0]
            for key, value in sample.items():
                print(f"  {key}: {value[:100]}{'...' if len(str(value)) > 100 else ''}")
    else:
        print("❌ No data scraped successfully")

if __name__ == "__main__":
    scrape_seniorhousingnet()