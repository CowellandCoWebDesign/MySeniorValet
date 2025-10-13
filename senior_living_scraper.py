"""
Multi-Source Senior Living Scraper
Scrapes from multiple senior living directories to build comprehensive database
"""

import requests
from bs4 import BeautifulSoup
import time
import csv
import re
from urllib.parse import urljoin, urlparse
import json

# Configuration
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

class SeniorLivingScraper:
    def __init__(self):
        self.scraped_data = []
        
    def scrape_care_source(self):
        """Scrape Care.com senior living listings"""
        print("🏥 Scraping Care.com senior living listings...")
        
        # Care.com senior living search for California
        search_url = "https://www.care.com/senior-living/california"
        
        try:
            response = requests.get(search_url, headers=HEADERS)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Look for community links
            community_links = []
            for a in soup.find_all('a', href=True):
                href = a.get('href')
                if href and ('/senior-living/' in href or '/community/' in href):
                    if href.startswith('/'):
                        href = 'https://www.care.com' + href
                    community_links.append(href)
            
            community_links = list(set(community_links))[:5]  # Limit for testing
            
            for link in community_links:
                print(f"  Processing: {link}")
                data = self.parse_care_listing(link)
                if data and data.get('Name'):
                    self.scraped_data.append(data)
                    print(f"    ✓ Saved: {data['Name']}")
                time.sleep(1)
                
        except Exception as e:
            print(f"  ❌ Error scraping Care.com: {e}")
    
    def parse_care_listing(self, url):
        """Parse individual Care.com listing"""
        try:
            response = requests.get(url, headers=HEADERS)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract data with multiple selectors
            name = ""
            for selector in ['h1', '.community-name', '.facility-name']:
                element = soup.select_one(selector)
                if element:
                    name = element.text.strip()
                    break
            
            address = ""
            for selector in ['.address', '.location', '[data-testid="address"]']:
                element = soup.select_one(selector)
                if element:
                    address = element.text.strip()
                    break
            
            phone = ""
            for selector in ['.phone', 'a[href^="tel:"]', '.contact-phone']:
                element = soup.select_one(selector)
                if element:
                    phone = element.text.strip()
                    break
            
            description = ""
            for selector in ['.description', '.about', '.overview']:
                element = soup.select_one(selector)
                if element:
                    description = element.text.strip()
                    break
            
            return {
                "Name": name,
                "Address": address,
                "Phone": phone,
                "Description": description[:300] + "..." if len(description) > 300 else description,
                "Images": "",
                "Care Levels": "",
                "Amenities": "",
                "Price": "",
                "Source": "Care.com",
                "Source URL": url
            }
        except Exception as e:
            print(f"    ❌ Error parsing {url}: {e}")
            return None
    
    def scrape_assisted_living_locator(self):
        """Scrape AssistedLivingLocator.com"""
        print("🏠 Scraping AssistedLivingLocator.com...")
        
        search_url = "https://www.assistedlivinglocator.com/california/"
        
        try:
            response = requests.get(search_url, headers=HEADERS)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Look for community links
            community_links = []
            for a in soup.find_all('a', href=True):
                href = a.get('href')
                if href and ('/assisted-living/' in href or '/community/' in href):
                    if href.startswith('/'):
                        href = 'https://www.assistedlivinglocator.com' + href
                    community_links.append(href)
            
            community_links = list(set(community_links))[:5]  # Limit for testing
            
            for link in community_links:
                print(f"  Processing: {link}")
                data = self.parse_all_listing(link)
                if data and data.get('Name'):
                    self.scraped_data.append(data)
                    print(f"    ✓ Saved: {data['Name']}")
                time.sleep(1)
                
        except Exception as e:
            print(f"  ❌ Error scraping AssistedLivingLocator: {e}")
    
    def parse_all_listing(self, url):
        """Parse AssistedLivingLocator listing"""
        try:
            response = requests.get(url, headers=HEADERS)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            name = ""
            for selector in ['h1', '.community-name', '.facility-name', '.property-name']:
                element = soup.select_one(selector)
                if element:
                    name = element.text.strip()
                    break
            
            address = ""
            for selector in ['.address', '.location', '.property-address']:
                element = soup.select_one(selector)
                if element:
                    address = element.text.strip()
                    break
            
            phone = ""
            for selector in ['.phone', 'a[href^="tel:"]', '.contact-phone']:
                element = soup.select_one(selector)
                if element:
                    phone = element.text.strip()
                    break
            
            return {
                "Name": name,
                "Address": address,
                "Phone": phone,
                "Description": "",
                "Images": "",
                "Care Levels": "",
                "Amenities": "",
                "Price": "",
                "Source": "AssistedLivingLocator.com",
                "Source URL": url
            }
        except Exception as e:
            print(f"    ❌ Error parsing {url}: {e}")
            return None
    
    def scrape_sample_directories(self):
        """Scrape sample data from known senior living directories"""
        print("🔍 Scraping sample senior living directories...")
        
        # Sample URLs from different directories
        sample_urls = [
            "https://www.seniorly.com/communities/california",
            "https://www.caring.com/senior-living/california",
            "https://www.seniorliving.org/california/",
            "https://www.assisted-living-directory.com/california/"
        ]
        
        for url in sample_urls:
            try:
                print(f"  Checking: {url}")
                response = requests.get(url, headers=HEADERS)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.text, 'html.parser')
                    
                    # Look for community names in various elements
                    community_names = []
                    for element in soup.find_all(['h1', 'h2', 'h3', 'h4', 'a']):
                        text = element.text.strip()
                        if any(keyword in text.lower() for keyword in ['senior', 'assisted', 'memory', 'care', 'living', 'community', 'village', 'manor', 'residence']):
                            if len(text) > 10 and len(text) < 100:
                                community_names.append(text)
                    
                    # Create sample entries
                    for name in community_names[:3]:  # Limit to 3 per site
                        self.scraped_data.append({
                            "Name": name,
                            "Address": "California (Address not available)",
                            "Phone": "Contact for details",
                            "Description": f"Senior living community found on {urlparse(url).netloc}",
                            "Images": "",
                            "Care Levels": "Senior Living",
                            "Amenities": "",
                            "Price": "Contact for pricing",
                            "Source": urlparse(url).netloc,
                            "Source URL": url
                        })
                
                time.sleep(2)
                
            except Exception as e:
                print(f"    ❌ Error with {url}: {e}")
                continue
    
    def save_results(self, filename="senior_living_sample.csv"):
        """Save scraped data to CSV"""
        if self.scraped_data:
            keys = self.scraped_data[0].keys()
            with open(filename, "w", newline='', encoding="utf-8") as f:
                writer = csv.DictWriter(f, keys)
                writer.writeheader()
                writer.writerows(self.scraped_data)
            
            print(f"✅ Saved {len(self.scraped_data)} listings to {filename}")
            
            # Show sample data
            if self.scraped_data:
                print("\n📊 Sample data:")
                sample = self.scraped_data[0]
                for key, value in sample.items():
                    print(f"  {key}: {value[:80]}{'...' if len(str(value)) > 80 else ''}")
        else:
            print("❌ No data scraped")

def main():
    """Main execution function"""
    print("🚀 Starting Multi-Source Senior Living Scraper...")
    
    scraper = SeniorLivingScraper()
    
    # Try multiple sources
    scraper.scrape_care_source()
    scraper.scrape_assisted_living_locator()
    scraper.scrape_sample_directories()
    
    # Save results
    scraper.save_results()
    
    print("\n✅ Scraping complete!")

if __name__ == "__main__":
    main()