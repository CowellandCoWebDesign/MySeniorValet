import requests
from bs4 import BeautifulSoup

# Test if we can access the Texas LTC search
url = "https://apps.hhs.texas.gov/ltcsearch/"
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"}

try:
    response = requests.get(url, headers=headers, timeout=10)
    print(f"Status Code: {response.status_code}")
    print(f"URL: {response.url}")
    
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        print("\nPage Title:", soup.title.string if soup.title else "No title")
        
        # Look for form elements or search functionality
        forms = soup.find_all('form')
        print(f"\nForms found: {len(forms)}")
        
        # Look for any provider links or data structure
        links = soup.find_all('a', href=True)
        print(f"Total links: {len(links)}")
        
        # Print first 500 characters of content
        print("\nFirst 500 chars of body:")
        print(soup.text[:500])
        
except Exception as e:
    print(f"Error accessing site: {e}")