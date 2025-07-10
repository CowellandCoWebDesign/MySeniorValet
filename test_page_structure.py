"""
Test script to analyze the page structure of SeniorHousingNet
"""

import requests
from bs4 import BeautifulSoup
import re

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

def analyze_page_structure(url):
    """Analyze the structure of a SeniorHousingNet page"""
    print(f"🔍 Analyzing page: {url}")
    
    try:
        response = requests.get(url, headers=HEADERS)
        print(f"Response status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ Failed to access page: {response.status_code}")
            return
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Check for JavaScript-heavy content
        scripts = soup.find_all('script')
        print(f"Found {len(scripts)} script tags")
        
        # Look for any links on the page
        all_links = soup.find_all('a', href=True)
        print(f"Found {len(all_links)} total links")
        
        # Show some sample links
        print("\nSample links found:")
        for i, link in enumerate(all_links[:10]):
            href = link.get('href')
            text = link.text.strip()
            print(f"  {i+1}. {href} - '{text[:50]}{'...' if len(text) > 50 else ''}'")
        
        # Look for specific patterns
        community_links = []
        for link in all_links:
            href = link.get('href')
            if href and any(pattern in href.lower() for pattern in ['community', 'senior', 'assisted', 'living']):
                community_links.append(href)
        
        print(f"\nCommunity-related links: {len(community_links)}")
        for i, link in enumerate(community_links[:5]):
            print(f"  {i+1}. {link}")
        
        # Check if page has dynamic content indicators
        dynamic_indicators = [
            'data-react', 'ng-app', 'vue-app', 'ember-app',
            'application/json', 'window.APP_DATA', 'window.INITIAL_STATE'
        ]
        
        page_text = response.text.lower()
        found_indicators = [ind for ind in dynamic_indicators if ind in page_text]
        
        if found_indicators:
            print(f"\nDynamic content indicators found: {found_indicators}")
        
        # Save the HTML for manual inspection
        with open("page_source.html", "w", encoding="utf-8") as f:
            f.write(response.text)
        print(f"\nPage source saved to page_source.html")
        
    except Exception as e:
        print(f"❌ Error analyzing page: {e}")

def main():
    """Test the page structure"""
    test_url = "https://www.seniorhousingnet.com/seniorliving-search/redding_ca?ctyp=2&ctyp=8&ctyp=10&ctyp=12&ctyp=19"
    analyze_page_structure(test_url)

if __name__ == "__main__":
    main()