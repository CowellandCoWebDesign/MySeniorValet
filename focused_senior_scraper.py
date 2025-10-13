"""
Focused Senior Living Scraper
Targets SeniorHousingNet with improved error handling and fallback strategies
"""

import requests
from bs4 import BeautifulSoup
import time
import csv
import re
from urllib.parse import urljoin, urlparse
import json

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1"
}

def test_seniorhousingnet_structure():
    """Test SeniorHousingNet structure and find working URLs"""
    print("🔍 Testing SeniorHousingNet structure...")
    
    # Test different URL patterns
    test_urls = [
        "https://www.seniorhousingnet.com/",
        "https://www.seniorhousingnet.com/search",
        "https://www.seniorhousingnet.com/california",
        "https://www.seniorhousingnet.com/communities",
        "https://www.seniorhousingnet.com/senior-living/california"
    ]
    
    working_urls = []
    
    for url in test_urls:
        try:
            response = requests.get(url, headers=HEADERS, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Check for community-related content
                community_indicators = [
                    'community', 'senior', 'assisted', 'living', 'care',
                    'memory', 'nursing', 'residence', 'manor', 'village'
                ]
                
                page_text = response.text.lower()
                indicator_count = sum(1 for indicator in community_indicators if indicator in page_text)
                
                if indicator_count > 3:
                    working_urls.append(url)
                    print(f"  ✓ Working: {url} (found {indicator_count} indicators)")
                else:
                    print(f"  ❌ Not relevant: {url}")
            else:
                print(f"  ❌ Error {response.status_code}: {url}")
                
        except Exception as e:
            print(f"  ❌ Failed: {url} - {e}")
    
    return working_urls

def find_community_links(url):
    """Find community links from a page"""
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Look for links with community-related keywords
        community_links = []
        
        for a in soup.find_all('a', href=True):
            href = a.get('href')
            text = a.text.strip().lower()
            
            # Check if link or text contains community indicators
            if href and any(indicator in href.lower() for indicator in ['community', 'senior', 'assisted', 'living', 'care']):
                if href.startswith('/'):
                    href = urljoin(url, href)
                community_links.append(href)
            
            # Check if text looks like a community name
            if text and any(indicator in text for indicator in ['senior', 'assisted', 'living', 'care', 'memory', 'village', 'manor', 'residence']):
                if len(text) > 10 and len(text) < 100:
                    href = a.get('href')
                    if href:
                        if href.startswith('/'):
                            href = urljoin(url, href)
                        community_links.append(href)
        
        return list(set(community_links))
        
    except Exception as e:
        print(f"  ❌ Error finding links: {e}")
        return []

def scrape_community_data(url):
    """Scrape data from a potential community page"""
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract community name
        name = ""
        for selector in ['h1', 'h2', '.community-name', '.facility-name', '.property-name', '.listing-title']:
            element = soup.select_one(selector)
            if element:
                name = element.text.strip()
                if len(name) > 5:  # Valid community name
                    break
        
        # Extract address
        address = ""
        for selector in ['.address', '.location', '.community-address', '[itemprop="address"]']:
            element = soup.select_one(selector)
            if element:
                address = element.text.strip()
                break
        
        # Extract phone
        phone = ""
        phone_patterns = [
            r'\(\d{3}\)\s*\d{3}-\d{4}',
            r'\d{3}-\d{3}-\d{4}',
            r'\d{10}'
        ]
        
        for pattern in phone_patterns:
            matches = re.findall(pattern, response.text)
            if matches:
                phone = matches[0]
                break
        
        # Extract description
        description = ""
        for selector in ['.description', '.about', '.overview', '.community-description']:
            element = soup.select_one(selector)
            if element:
                description = element.text.strip()
                if len(description) > 50:
                    break
        
        # Only return data if we found a valid community name
        if name and len(name) > 5:
            return {
                "Name": name,
                "Address": address or "California",
                "Phone": phone or "Contact for details",
                "Description": description[:200] + "..." if len(description) > 200 else description,
                "Images": "",
                "Care Levels": "",
                "Amenities": "",
                "Price": "",
                "Source": "SeniorHousingNet.com",
                "Source URL": url
            }
        
        return None
        
    except Exception as e:
        print(f"    ❌ Error scraping {url}: {e}")
        return None

def main():
    """Main execution function"""
    print("🚀 Starting Focused Senior Living Scraper...")
    
    # Test site structure first
    working_urls = test_seniorhousingnet_structure()
    
    if not working_urls:
        print("❌ No working URLs found. Site may be down or structure changed.")
        return
    
    scraped_data = []
    
    # Process each working URL
    for base_url in working_urls[:2]:  # Limit to first 2 working URLs
        print(f"\n🎯 Processing: {base_url}")
        
        # Find community links
        community_links = find_community_links(base_url)
        print(f"  Found {len(community_links)} potential community links")
        
        # Process community links
        for i, link in enumerate(community_links[:10]):  # Limit to 10 per URL
            print(f"  📋 Processing {i+1}/{min(len(community_links), 10)}: {link}")
            
            data = scrape_community_data(link)
            if data:
                scraped_data.append(data)
                print(f"    ✓ Saved: {data['Name']}")
            else:
                print(f"    ❌ No valid data found")
            
            time.sleep(1)  # Be respectful
    
    # Save results
    if scraped_data:
        with open("seniorhousingnet_sample.csv", "w", newline='', encoding="utf-8") as f:
            writer = csv.DictWriter(f, scraped_data[0].keys())
            writer.writeheader()
            writer.writerows(scraped_data)
        
        print(f"\n✅ Successfully scraped {len(scraped_data)} communities!")
        print(f"📄 Data saved to seniorhousingnet_sample.csv")
        
        # Show sample
        if scraped_data:
            print("\n📊 Sample data:")
            sample = scraped_data[0]
            for key, value in sample.items():
                print(f"  {key}: {value}")
    else:
        print("\n❌ No data was successfully scraped")

if __name__ == "__main__":
    main()