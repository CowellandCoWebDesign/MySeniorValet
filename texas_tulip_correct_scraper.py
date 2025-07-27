import requests
from bs4 import BeautifulSoup
import json
import csv
import time
import re

# Correct Texas TULIP URL you provided
TULIP_URL = "https://txhhs.my.site.com/TULIP/s/ltc-provider-search"

def scrape_texas_tulip():
    """Scrape Texas TULIP system for assisted living facilities"""
    
    session = requests.Session()
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Cache-Control": "max-age=0",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1"
    }
    session.headers.update(headers)
    
    print(f"Accessing Texas TULIP: {TULIP_URL}")
    
    try:
        # Get the main search page
        response = session.get(TULIP_URL, timeout=30)
        print(f"Response status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"Failed to access page: {response.status_code}")
            return []
        
        # Save the full page
        with open('texas_tulip_full_page.html', 'w', encoding='utf-8') as f:
            f.write(response.text)
        print("Saved full page to texas_tulip_full_page.html")
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Look for any JavaScript data or API endpoints
        scripts = soup.find_all('script')
        print(f"Found {len(scripts)} script tags")
        
        # Search for data in script tags
        for script in scripts:
            if script.string:
                # Look for provider data
                if 'provider' in script.string.lower() or 'facility' in script.string.lower():
                    # Look for JSON data
                    json_matches = re.findall(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', script.string)
                    for match in json_matches:
                        try:
                            data = json.loads(match)
                            if isinstance(data, dict) and ('providers' in data or 'facilities' in data):
                                print(f"Found potential facility data in script tag")
                                return extract_facilities_from_json(data)
                        except:
                            continue
        
        # Look for any forms that might submit to get data
        forms = soup.find_all('form')
        print(f"Found {len(forms)} forms")
        
        for form in forms:
            action = form.get('action', '')
            method = form.get('method', 'get').lower()
            
            print(f"Form action: {action}, method: {method}")
            
            # Look for form inputs
            inputs = form.find_all(['input', 'select', 'textarea'])
            print(f"Form has {len(inputs)} inputs")
            
            for input_elem in inputs:
                name = input_elem.get('name', '')
                input_type = input_elem.get('type', input_elem.name)
                print(f"  Input: {name} ({input_type})")
                
                # If it's a select with options, show options
                if input_elem.name == 'select':
                    options = input_elem.find_all('option')
                    for option in options:
                        value = option.get('value', '')
                        text = option.get_text(strip=True)
                        if text:
                            print(f"    Option: {text} (value: {value})")
        
        # Look for any existing data in the page
        facilities = extract_facilities_from_html(soup)
        
        if facilities:
            print(f"Found {len(facilities)} facilities in HTML")
            save_facilities_to_csv(facilities)
            return facilities
        
        # Try to find AJAX endpoints
        ajax_endpoints = find_ajax_endpoints(soup)
        if ajax_endpoints:
            print(f"Found {len(ajax_endpoints)} potential AJAX endpoints")
            for endpoint in ajax_endpoints:
                try:
                    ajax_response = session.get(endpoint, timeout=15)
                    if ajax_response.status_code == 200:
                        try:
                            data = ajax_response.json()
                            facilities = extract_facilities_from_json(data)
                            if facilities:
                                print(f"Found {len(facilities)} facilities from AJAX endpoint")
                                save_facilities_to_csv(facilities)
                                return facilities
                        except:
                            pass
                except:
                    continue
        
        print("No facility data found in initial page load")
        return []
        
    except Exception as e:
        print(f"Error accessing TULIP: {e}")
        return []

def extract_facilities_from_html(soup):
    """Extract facilities from HTML content"""
    facilities = []
    
    # Look for table data
    tables = soup.find_all('table')
    for table in tables:
        rows = table.find_all('tr')
        if len(rows) > 1:  # Has header and data
            headers = [th.get_text(strip=True).lower() for th in rows[0].find_all(['th', 'td'])]
            
            for row in rows[1:]:
                cells = row.find_all(['td', 'th'])
                if len(cells) >= 2:
                    facility = {}
                    for i, cell in enumerate(cells):
                        text = cell.get_text(strip=True)
                        if i < len(headers):
                            header = headers[i]
                            if 'name' in header:
                                facility['name'] = text
                            elif 'city' in header:
                                facility['city'] = text
                            elif 'county' in header:
                                facility['county'] = text
                            elif 'address' in header:
                                facility['address'] = text
                            elif 'phone' in header:
                                facility['phone'] = text
                    
                    if facility.get('name'):
                        facility['state'] = 'TX'
                        facility['type'] = 'Assisted Living'
                        facilities.append(facility)
    
    # Look for list items
    lists = soup.find_all(['ul', 'ol'])
    for list_elem in lists:
        items = list_elem.find_all('li')
        for item in items:
            text = item.get_text(strip=True)
            if len(text) > 10 and any(keyword in text.lower() for keyword in ['assisted', 'living', 'care', 'senior']):
                facility = {
                    'name': text,
                    'state': 'TX',
                    'type': 'Assisted Living'
                }
                facilities.append(facility)
    
    return facilities

def extract_facilities_from_json(data):
    """Extract facilities from JSON data"""
    facilities = []
    
    if isinstance(data, dict):
        # Look for common data structures
        for key in ['providers', 'facilities', 'data', 'records', 'results']:
            if key in data and isinstance(data[key], list):
                for item in data[key]:
                    if isinstance(item, dict):
                        facility = {
                            'name': item.get('name', item.get('Name', item.get('facility_name', ''))),
                            'address': item.get('address', item.get('Address', '')),
                            'city': item.get('city', item.get('City', '')),
                            'county': item.get('county', item.get('County', '')),
                            'state': 'TX',
                            'phone': item.get('phone', item.get('Phone', '')),
                            'type': 'Assisted Living'
                        }
                        if facility['name']:
                            facilities.append(facility)
    elif isinstance(data, list):
        for item in data:
            if isinstance(item, dict):
                facility = {
                    'name': item.get('name', item.get('Name', '')),
                    'address': item.get('address', item.get('Address', '')),
                    'city': item.get('city', item.get('City', '')),
                    'county': item.get('county', item.get('County', '')),
                    'state': 'TX',
                    'phone': item.get('phone', item.get('Phone', '')),
                    'type': 'Assisted Living'
                }
                if facility['name']:
                    facilities.append(facility)
    
    return facilities

def find_ajax_endpoints(soup):
    """Find potential AJAX endpoints in the page"""
    endpoints = []
    
    # Look in script tags for URLs
    scripts = soup.find_all('script')
    for script in scripts:
        if script.string:
            # Look for API endpoints
            url_patterns = [
                r'["\']([^"\']*api[^"\']*)["\']',
                r'["\']([^"\']*service[^"\']*)["\']',
                r'["\']([^"\']*search[^"\']*)["\']'
            ]
            
            for pattern in url_patterns:
                matches = re.findall(pattern, script.string)
                for match in matches:
                    if match.startswith('http') or match.startswith('/'):
                        endpoints.append(match)
    
    return list(set(endpoints))

def save_facilities_to_csv(facilities):
    """Save facilities to CSV file"""
    if not facilities:
        return
    
    filename = 'texas_tulip_facilities.csv'
    fieldnames = ['name', 'address', 'city', 'county', 'state', 'phone', 'type']
    
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(facilities)
    
    print(f"Saved {len(facilities)} facilities to {filename}")
    
    # Create integration script
    create_integration_script(len(facilities))

def create_integration_script(count):
    """Create integration script for MySeniorValet"""
    script = f"""const {{ Pool, neonConfig }} = require('@neondatabase/serverless');
const ws = require('ws');
const fs = require('fs');
const csv = require('csv-parser');

neonConfig.webSocketConstructor = ws;
const pool = new Pool({{ connectionString: process.env.DATABASE_URL }});

async function integrateTexasTulipFacilities() {{
  console.log('🤠 TEXAS TULIP EXPANSION - Adding {count} Facilities');
  
  const facilities = [];
  
  await new Promise((resolve, reject) => {{
    fs.createReadStream('texas_tulip_facilities.csv')
      .pipe(csv())
      .on('data', (row) => facilities.push(row))
      .on('end', resolve)
      .on('error', reject);
  }});
  
  console.log(`✅ Loaded ${{facilities.length}} facilities from TULIP`);
  
  let addedCount = 0;
  
  for (const facility of facilities) {{
    try {{
      const insertQuery = `
        INSERT INTO communities (
          name, address, city, state, zip_code, phone, county,
          care_types, amenities, services, medical_restrictions,
          discovery_source, discovery_date, is_verified
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
        )
      `;
      
      await pool.query(insertQuery, [
        facility.name,
        facility.address,
        facility.city,
        'TX',
        '',
        facility.phone,
        facility.county,
        ['Assisted Living'],
        [],
        [],
        [],
        'Texas TULIP System',
        new Date().toISOString(),
        true
      ]);
      
      addedCount++;
      
      if (addedCount % 50 === 0) {{
        console.log(`✅ Added ${{addedCount}} facilities...`);
      }}
      
    }} catch (error) {{
      console.error(`❌ Error adding ${{facility.name}}:`, error.message);
    }}
  }}
  
  console.log(`\\n🎯 TEXAS EXPANSION COMPLETE: Added ${{addedCount}} facilities`);
  
  await pool.end();
}}

if (require.main === module) {{
  integrateTexasTulipFacilities().catch(console.error);
}}

module.exports = {{ integrateTexasTulipFacilities }};"""
    
    with open('integrate-texas-tulip-final.cjs', 'w') as f:
        f.write(script)
    
    print("✅ Created integration script: integrate-texas-tulip-final.cjs")

if __name__ == "__main__":
    print("🤠 Texas TULIP Assisted Living Scraper")
    print("Targeting: https://txhhs.my.site.com/TULIP/s/ltc-provider-search")
    
    facilities = scrape_texas_tulip()
    
    if facilities:
        print(f"\n🎯 SUCCESS: Found {len(facilities)} assisted living facilities")
        print("\nSample facilities:")
        for facility in facilities[:5]:
            print(f"  - {facility.get('name', 'Unknown')} in {facility.get('city', 'Unknown')}")
    else:
        print("\n❌ No facilities found")
        print("The page may require JavaScript execution or has changed structure")
        print("Check texas_tulip_full_page.html for analysis")