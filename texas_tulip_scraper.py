import requests
from bs4 import BeautifulSoup
import json
import csv
import time
import re

# New Texas TULIP system URL
TULIP_BASE = "https://txhhs.my.site.com/TULIP/s/"
SEARCH_URL = "https://txhhs.my.site.com/TULIP/s/ltc-provider-search"

def scrape_texas_tulip_assisted_living():
    """Scrape Texas TULIP system for assisted living facilities"""
    
    session = requests.Session()
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
    }
    session.headers.update(headers)
    
    print("Accessing Texas TULIP LTC Provider Search...")
    
    try:
        # First, get the main search page
        response = session.get(SEARCH_URL, timeout=30)
        print(f"Main search page status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"Failed to access search page: {response.status_code}")
            return []
        
        # Save the page to analyze structure
        with open('texas_tulip_search_page.html', 'w', encoding='utf-8') as f:
            f.write(response.text)
        print("Saved search page to texas_tulip_search_page.html")
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Look for forms and their structure
        forms = soup.find_all('form')
        print(f"Found {len(forms)} forms on page")
        
        # Look for JavaScript that might handle the search
        scripts = soup.find_all('script')
        api_endpoints = []
        
        for script in scripts:
            if script.string:
                # Look for API endpoints in JavaScript
                api_matches = re.findall(r'["\']([^"\']*api[^"\']*)["\']', script.string)
                api_endpoints.extend(api_matches)
        
        print(f"Found {len(api_endpoints)} potential API endpoints")
        
        # Look for Salesforce Lightning components (common in government sites)
        lightning_elements = soup.find_all(attrs={"data-aura-class": True})
        print(f"Found {len(lightning_elements)} Lightning components")
        
        # Try to find the actual search endpoint by looking for AJAX calls
        # This is a modern JavaScript application, so we need to find the API
        
        # Look for provider type options in the HTML
        provider_options = soup.find_all(text=lambda text: text and 'assisted living' in text.lower())
        print(f"Found {len(provider_options)} mentions of assisted living")
        
        # Try to extract any data already on the page
        facilities = extract_facility_data_from_page(soup)
        
        if facilities:
            print(f"Found {len(facilities)} facilities on initial page")
            save_facilities_to_csv(facilities, 'texas_tulip_facilities.csv')
            create_integration_script(facilities)
            return facilities
        
        # If no facilities found, try API approach
        print("No facilities found on page, trying API approach...")
        
        # Try common API endpoints for Salesforce Community sites
        api_urls = [
            f"{TULIP_BASE}sfsites/aura",
            f"{TULIP_BASE}s/sfsites/aura",
            f"{TULIP_BASE}services/data/v55.0/query",
            f"{TULIP_BASE}services/apexrest/",
        ]
        
        for api_url in api_urls:
            try:
                # Try to get provider data via API
                api_response = session.get(api_url, timeout=15)
                if api_response.status_code == 200:
                    print(f"Successfully accessed {api_url}")
                    # Further API exploration would go here
                    
            except Exception as e:
                print(f"API {api_url} failed: {e}")
                continue
        
        return []
        
    except Exception as e:
        print(f"Error accessing TULIP search: {e}")
        return []

def extract_facility_data_from_page(soup):
    """Extract facility data from the page HTML"""
    facilities = []
    
    # Look for common patterns in facility listings
    # Tables, lists, cards, etc.
    
    # Check for table data
    tables = soup.find_all('table')
    for table in tables:
        rows = table.find_all('tr')
        for row in rows[1:]:  # Skip header
            cells = row.find_all(['td', 'th'])
            if len(cells) >= 3:  # Minimum columns for facility data
                facility_data = {}
                for i, cell in enumerate(cells):
                    text = cell.get_text(strip=True)
                    if i == 0 and text:
                        facility_data['name'] = text
                    elif i == 1 and text:
                        facility_data['city'] = text
                    elif i == 2 and text:
                        facility_data['county'] = text
                
                if facility_data.get('name'):
                    facilities.append(facility_data)
    
    # Check for card-like structures
    cards = soup.find_all(['div', 'section'], class_=re.compile(r'card|facility|provider', re.I))
    for card in cards:
        facility_data = {}
        
        # Look for facility name
        name_elem = card.find(['h1', 'h2', 'h3', 'h4', 'strong', 'b'])
        if name_elem:
            facility_data['name'] = name_elem.get_text(strip=True)
        
        # Look for address/location info
        address_elem = card.find(text=re.compile(r'\d+.*\w+.*Street|Avenue|Road|Drive|Way|Boulevard', re.I))
        if address_elem:
            facility_data['address'] = address_elem.strip()
        
        if facility_data.get('name'):
            facilities.append(facility_data)
    
    # Look for JSON data embedded in the page
    script_tags = soup.find_all('script', type='application/json')
    for script in script_tags:
        try:
            data = json.loads(script.string)
            if isinstance(data, dict) and 'providers' in data:
                # Extract provider data
                for provider in data['providers']:
                    facility_data = {
                        'name': provider.get('name', ''),
                        'address': provider.get('address', ''),
                        'city': provider.get('city', ''),
                        'county': provider.get('county', ''),
                        'phone': provider.get('phone', ''),
                        'type': provider.get('type', 'Assisted Living')
                    }
                    facilities.append(facility_data)
        except:
            continue
    
    return facilities

def save_facilities_to_csv(facilities, filename):
    """Save facilities to CSV file"""
    if not facilities:
        return
    
    # Standardize fields
    fieldnames = ['name', 'address', 'city', 'county', 'state', 'zip_code', 'phone', 'type']
    
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        for facility in facilities:
            row = {
                'name': facility.get('name', ''),
                'address': facility.get('address', ''),
                'city': facility.get('city', ''),
                'county': facility.get('county', ''),
                'state': 'TX',
                'zip_code': facility.get('zip_code', ''),
                'phone': facility.get('phone', ''),
                'type': facility.get('type', 'Assisted Living')
            }
            writer.writerow(row)
    
    print(f"Saved {len(facilities)} facilities to {filename}")

def create_integration_script(facilities):
    """Create integration script for TrueView database"""
    
    count = len(facilities)
    script = f"""const {{ Pool, neonConfig }} = require('@neondatabase/serverless');
const ws = require('ws');
const fs = require('fs');
const csv = require('csv-parser');

neonConfig.webSocketConstructor = ws;
const pool = new Pool({{ connectionString: process.env.DATABASE_URL }});

async function integrateTexasTulipFacilities() {{
  console.log('🤠 TEXAS TULIP EXPANSION - Adding {count} Assisted Living Facilities');
  
  const facilities = [];
  
  // Load CSV data
  await new Promise((resolve, reject) => {{
    fs.createReadStream('texas_tulip_facilities.csv')
      .pipe(csv())
      .on('data', (row) => {{
        facilities.push(row);
      }})
      .on('end', resolve)
      .on('error', reject);
  }});
  
  console.log(`✅ Loaded ${{facilities.length}} Texas TULIP facilities`);
  
  // Check existing facilities
  const existingQuery = `SELECT name, city FROM communities WHERE state = 'TX'`;
  const existingResult = await pool.query(existingQuery);
  const existingSet = new Set(
    existingResult.rows.map(row => `${{row.name}}|${{row.city}}`.toLowerCase())
  );
  
  console.log(`📊 Found ${{existingResult.rows.length}} existing Texas facilities`);
  
  let addedCount = 0;
  let skippedCount = 0;
  
  for (const facility of facilities) {{
    const key = `${{facility.name}}|${{facility.city}}`.toLowerCase();
    
    if (existingSet.has(key)) {{
      skippedCount++;
      continue;
    }}
    
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
      
      const values = [
        facility.name,
        facility.address,
        facility.city,
        'TX',
        facility.zip_code,
        facility.phone,
        facility.county,
        ['Assisted Living'],
        [],
        [],
        [],
        'Texas TULIP System',
        new Date().toISOString(),
        true
      ];
      
      await pool.query(insertQuery, values);
      addedCount++;
      
      if (addedCount % 100 === 0) {{
        console.log(`✅ Progress: Added ${{addedCount}} facilities...`);
      }}
      
    }} catch (error) {{
      console.error(`❌ Error adding ${{facility.name}}:`, error.message);
    }}
  }}
  
  console.log(`\\n🎯 TEXAS TULIP EXPANSION COMPLETE`);
  console.log(`✅ Successfully added: ${{addedCount}} new facilities`);
  console.log(`⏭️  Skipped (duplicates): ${{skippedCount}} facilities`);
  console.log(`📊 Total processed: ${{facilities.length}} facilities`);
  
  // Final stats
  const statsQuery = `
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN state = 'TX' THEN 1 END) as texas_count,
      COUNT(CASE WHEN state = 'CA' THEN 1 END) as california_count
    FROM communities
  `;
  
  const stats = await pool.query(statsQuery);
  console.log(`\\n🌟 FINAL DATABASE STATUS:`);
  console.log(`   Total Communities: ${{stats.rows[0].total}}`);
  console.log(`   Texas Communities: ${{stats.rows[0].texas_count}}`);
  console.log(`   California Communities: ${{stats.rows[0].california_count}}`);
  
  await pool.end();
}}

if (require.main === module) {{
  integrateTexasTulipFacilities().catch(console.error);
}}

module.exports = {{ integrateTexasTulipFacilities }};"""
    
    with open('integrate-texas-tulip.cjs', 'w') as f:
        f.write(script)
    
    print("✅ Created integration script: integrate-texas-tulip.cjs")

if __name__ == "__main__":
    facilities = scrape_texas_tulip_assisted_living()
    
    if facilities:
        print(f"\n🎯 SUCCESS: Found {len(facilities)} Texas assisted living facilities")
        
        # Show sample facilities
        print("\nSample facilities:")
        for facility in facilities[:10]:
            print(f"  - {facility.get('name', 'Unknown')} in {facility.get('city', 'Unknown')}")
    else:
        print("\n⚠️  No facilities found - may need manual API exploration")
        print("The page structure has been saved for analysis")