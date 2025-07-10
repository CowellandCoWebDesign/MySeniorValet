import requests
import json
import csv
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import Select
import os

def scrape_texas_tulip_with_browser():
    """Use browser automation to scrape Texas TULIP system"""
    
    print("🤠 Texas TULIP System - Browser Automation Approach")
    print("Accessing: https://txhhs.my.site.com/TULIP/s/ltc-provider-search")
    
    # Set up Chrome options for headless browsing
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        
        # Navigate to search page
        driver.get("https://txhhs.my.site.com/TULIP/s/ltc-provider-search")
        
        # Wait for page to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        
        print("✅ Page loaded successfully")
        
        # Look for provider type dropdown
        try:
            # Common selectors for provider type
            provider_selectors = [
                "select[name*='provider']",
                "select[name*='type']",
                "select[id*='provider']",
                "select[id*='type']",
                "[data-testid*='provider']",
                "[data-testid*='type']"
            ]
            
            provider_dropdown = None
            for selector in provider_selectors:
                try:
                    provider_dropdown = driver.find_element(By.CSS_SELECTOR, selector)
                    break
                except:
                    continue
            
            if provider_dropdown:
                select = Select(provider_dropdown)
                
                # Look for assisted living option
                options = select.options
                print(f"Found {len(options)} provider type options:")
                
                assisted_living_option = None
                for option in options:
                    option_text = option.text.lower()
                    print(f"  - {option.text}")
                    
                    if 'assisted living' in option_text or 'alf' in option_text:
                        assisted_living_option = option
                        break
                
                if assisted_living_option:
                    print(f"✅ Found assisted living option: {assisted_living_option.text}")
                    select.select_by_visible_text(assisted_living_option.text)
                    time.sleep(2)  # Wait for selection
                    
                    # Look for search button
                    search_button = None
                    search_selectors = [
                        "button[type='submit']",
                        "input[type='submit']",
                        "button:contains('Search')",
                        "[data-testid*='search']"
                    ]
                    
                    for selector in search_selectors:
                        try:
                            search_button = driver.find_element(By.CSS_SELECTOR, selector)
                            break
                        except:
                            continue
                    
                    if search_button:
                        print("✅ Found search button, clicking...")
                        search_button.click()
                        
                        # Wait for results
                        WebDriverWait(driver, 15).until(
                            lambda d: "loading" not in d.page_source.lower()
                        )
                        
                        # Extract results
                        facilities = extract_facilities_from_results(driver)
                        
                        if facilities:
                            print(f"🎯 SUCCESS: Found {len(facilities)} facilities")
                            save_facilities_to_csv(facilities, 'texas_tulip_assisted_living.csv')
                            create_integration_script(facilities)
                            return facilities
                        else:
                            print("⚠️  No facilities found in results")
                    else:
                        print("❌ Could not find search button")
                else:
                    print("❌ Could not find assisted living option")
            else:
                print("❌ Could not find provider type dropdown")
                
        except Exception as e:
            print(f"Error during search: {e}")
        
        # Save page source for debugging
        with open('texas_tulip_page_source.html', 'w', encoding='utf-8') as f:
            f.write(driver.page_source)
        print("💾 Saved page source for debugging")
        
    except Exception as e:
        print(f"Browser automation error: {e}")
        return []
    finally:
        try:
            driver.quit()
        except:
            pass
    
    return []

def extract_facilities_from_results(driver):
    """Extract facility data from search results"""
    facilities = []
    
    try:
        # Common patterns for facility listings
        result_selectors = [
            ".facility-item",
            ".provider-item", 
            ".search-result",
            "[data-testid*='facility']",
            "[data-testid*='provider']",
            ".result-card"
        ]
        
        result_elements = []
        for selector in result_selectors:
            try:
                elements = driver.find_elements(By.CSS_SELECTOR, selector)
                if elements:
                    result_elements = elements
                    break
            except:
                continue
        
        if not result_elements:
            # Try table rows
            table_rows = driver.find_elements(By.CSS_SELECTOR, "table tr")
            if len(table_rows) > 1:  # Has header + data rows
                result_elements = table_rows[1:]  # Skip header
        
        print(f"Found {len(result_elements)} result elements")
        
        for element in result_elements:
            facility = {}
            
            # Extract text content
            text = element.text.strip()
            lines = [line.strip() for line in text.split('\n') if line.strip()]
            
            if lines:
                facility['name'] = lines[0]  # First line usually the name
                
                # Look for address, city, phone patterns
                for line in lines[1:]:
                    if any(street in line.lower() for street in ['street', 'avenue', 'road', 'drive', 'way', 'blvd']):
                        facility['address'] = line
                    elif line.count(',') >= 1:  # City, State format
                        parts = line.split(',')
                        if len(parts) >= 2:
                            facility['city'] = parts[0].strip()
                            facility['state'] = parts[1].strip()
                    elif line.replace('-', '').replace('(', '').replace(')', '').replace(' ', '').isdigit():
                        facility['phone'] = line
                
                # Add defaults
                facility['state'] = facility.get('state', 'TX')
                facility['type'] = 'Assisted Living'
                
                facilities.append(facility)
        
        print(f"Extracted {len(facilities)} facilities")
        
    except Exception as e:
        print(f"Error extracting facilities: {e}")
    
    return facilities

def scrape_without_browser():
    """Fallback method without browser automation"""
    print("🤠 Texas TULIP - Fallback API Approach")
    
    # Try to find the API endpoint through network inspection
    session = requests.Session()
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://txhhs.my.site.com/TULIP/s/ltc-provider-search"
    }
    session.headers.update(headers)
    
    # Try Salesforce Community API endpoints
    api_endpoints = [
        "https://txhhs.my.site.com/TULIP/s/sfsites/aura?r=1&aura.ApexAction.execute=1",
        "https://txhhs.my.site.com/TULIP/services/apexrest/providers",
        "https://txhhs.my.site.com/TULIP/services/data/v55.0/query/?q=SELECT+Name,City,State+FROM+Provider__c+WHERE+Type__c='Assisted Living'"
    ]
    
    for endpoint in api_endpoints:
        try:
            response = session.get(endpoint, timeout=15)
            if response.status_code == 200:
                try:
                    data = response.json()
                    if data and isinstance(data, (dict, list)):
                        print(f"✅ Found data at {endpoint}")
                        # Process the data
                        return process_api_data(data)
                except:
                    pass
        except:
            continue
    
    print("❌ Could not find API endpoint")
    return []

def process_api_data(data):
    """Process API response data"""
    facilities = []
    
    if isinstance(data, dict):
        # Check for common data structures
        if 'records' in data:
            facilities = data['records']
        elif 'data' in data:
            facilities = data['data']
        elif 'providers' in data:
            facilities = data['providers']
    elif isinstance(data, list):
        facilities = data
    
    # Standardize facility data
    standardized = []
    for facility in facilities:
        if isinstance(facility, dict):
            std_facility = {
                'name': facility.get('Name', facility.get('name', '')),
                'address': facility.get('Address', facility.get('address', '')),
                'city': facility.get('City', facility.get('city', '')),
                'state': 'TX',
                'type': 'Assisted Living'
            }
            standardized.append(std_facility)
    
    return standardized

def save_facilities_to_csv(facilities, filename):
    """Save facilities to CSV"""
    if not facilities:
        return
    
    fieldnames = ['name', 'address', 'city', 'state', 'zip_code', 'phone', 'type']
    
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(facilities)
    
    print(f"💾 Saved {len(facilities)} facilities to {filename}")

def create_integration_script(facilities):
    """Create integration script for TrueView"""
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
  
  await new Promise((resolve, reject) => {{
    fs.createReadStream('texas_tulip_assisted_living.csv')
      .pipe(csv())
      .on('data', (row) => facilities.push(row))
      .on('end', resolve)
      .on('error', reject);
  }});
  
  console.log(`✅ Loaded ${{facilities.length}} Texas TULIP facilities`);
  
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
      
      await pool.query(insertQuery, [
        facility.name,
        facility.address,
        facility.city,
        'TX',
        facility.zip_code,
        facility.phone,
        '',
        ['Assisted Living'],
        [],
        [],
        [],
        'Texas TULIP System',
        new Date().toISOString(),
        true
      ]);
      
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
  
  const statsQuery = `SELECT COUNT(*) as total, COUNT(CASE WHEN state = 'TX' THEN 1 END) as texas_count FROM communities`;
  const stats = await pool.query(statsQuery);
  console.log(`\\n🌟 FINAL DATABASE STATUS:`);
  console.log(`   Total Communities: ${{stats.rows[0].total}}`);
  console.log(`   Texas Communities: ${{stats.rows[0].texas_count}}`);
  
  await pool.end();
}}

if (require.main === module) {{
  integrateTexasTulipFacilities().catch(console.error);
}}

module.exports = {{ integrateTexasTulipFacilities }};"""
    
    with open('integrate-texas-tulip-facilities.cjs', 'w') as f:
        f.write(script)
    
    print("✅ Created integration script: integrate-texas-tulip-facilities.cjs")

if __name__ == "__main__":
    print("🤠 Starting Texas TULIP Assisted Living Facility Scraper")
    
    # Try browser automation first
    try:
        facilities = scrape_texas_tulip_with_browser()
        if facilities:
            print(f"\n🎯 SUCCESS: Found {len(facilities)} facilities via browser automation")
            exit(0)
    except Exception as e:
        print(f"Browser automation failed: {e}")
    
    # Fallback to API approach
    try:
        facilities = scrape_without_browser()
        if facilities:
            print(f"\n🎯 SUCCESS: Found {len(facilities)} facilities via API")
        else:
            print("\n❌ No facilities found with either method")
            print("Manual investigation of the TULIP system may be required")
    except Exception as e:
        print(f"API approach failed: {e}")
        print("Manual investigation of the TULIP system may be required")