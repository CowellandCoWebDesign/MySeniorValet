import asyncio
import csv
import json
import time
from playwright.async_api import async_playwright
from datetime import datetime
import re

class TexasTulipScraper:
    def __init__(self):
        self.base_url = "https://txhhs.my.site.com/TULIP/s/ltc-provider-search"
        self.facilities = []
        self.page = None
        self.browser = None
        
    async def start_browser(self):
        """Initialize Playwright browser"""
        playwright = await async_playwright().start()
        self.browser = await playwright.chromium.launch(
            headless=True,
            args=['--no-sandbox', '--disable-dev-shm-usage']
        )
        context = await self.browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        self.page = await context.new_page()
        
    async def scrape_facilities(self):
        """Main scraping function"""
        try:
            await self.start_browser()
            
            print("🤠 Texas TULIP Scraper - Accessing provider search...")
            await self.page.goto(self.base_url, wait_until='networkidle', timeout=30000)
            
            # Wait for the page to fully load
            await self.page.wait_for_timeout(5000)
            
            # Look for search form elements
            await self.find_and_interact_with_search()
            
            # Extract facility data from results
            await self.extract_facility_data()
            
            # Save results
            self.save_to_csv()
            self.save_to_json()
            
            print(f"🎯 Scraping complete: {len(self.facilities)} facilities found")
            
        except Exception as e:
            print(f"❌ Error during scraping: {e}")
            # Save page screenshot for debugging
            if self.page:
                await self.page.screenshot(path="tulip_error_screenshot.png")
                
        finally:
            if self.browser:
                await self.browser.close()
                
    async def find_and_interact_with_search(self):
        """Find and interact with search elements"""
        print("🔍 Looking for search form elements...")
        
        # Save page content for debugging
        page_content = await self.page.content()
        with open('tulip_page_content.html', 'w', encoding='utf-8') as f:
            f.write(page_content)
        
        # Try different selectors for search elements
        search_selectors = [
            'button[type="submit"]',
            'input[type="submit"]',
            'button:has-text("Search")',
            'button:has-text("Find")',
            '[data-testid*="search"]',
            '.search-button',
            '.btn-primary'
        ]
        
        search_button = None
        for selector in search_selectors:
            try:
                elements = await self.page.query_selector_all(selector)
                if elements:
                    search_button = elements[0]
                    print(f"✅ Found search button with selector: {selector}")
                    break
            except:
                continue
                
        # Look for provider type dropdown
        provider_selectors = [
            'select[name*="provider"]',
            'select[name*="type"]',
            'select[id*="provider"]',
            'select[id*="type"]',
            '.provider-select',
            '.facility-type-select'
        ]
        
        provider_dropdown = None
        for selector in provider_selectors:
            try:
                element = await self.page.query_selector(selector)
                if element:
                    provider_dropdown = element
                    print(f"✅ Found provider dropdown with selector: {selector}")
                    break
            except:
                continue
                
        # If we found a provider dropdown, select assisted living
        if provider_dropdown:
            options = await provider_dropdown.query_selector_all('option')
            for option in options:
                text = await option.inner_text()
                if 'assisted living' in text.lower() or 'alf' in text.lower():
                    await option.click()
                    print(f"✅ Selected: {text}")
                    break
                    
        # Click search button if found
        if search_button:
            await search_button.click()
            print("✅ Clicked search button")
            await self.page.wait_for_timeout(5000)
        else:
            print("⚠️  No search button found, checking for existing results...")
            
        # Try to submit a blank search to get all results
        await self.try_blank_search()
        
    async def try_blank_search(self):
        """Try submitting a blank search to get all results"""
        print("🔄 Attempting blank search submission...")
        
        # Try pressing Enter on the page
        await self.page.keyboard.press('Enter')
        await self.page.wait_for_timeout(3000)
        
        # Look for form submissions
        forms = await self.page.query_selector_all('form')
        for form in forms:
            try:
                await form.evaluate('form => form.submit()')
                await self.page.wait_for_timeout(3000)
                break
            except:
                continue
                
    async def extract_facility_data(self):
        """Extract facility data from search results"""
        print("📊 Extracting facility data...")
        
        # Wait for results to load
        await self.page.wait_for_timeout(3000)
        
        # Look for results table or list
        table_selectors = [
            'table tbody tr',
            '.search-results tr',
            '.facility-list .facility-item',
            '.provider-list .provider-item',
            '[data-testid*="result"] tr',
            '.results-table tr'
        ]
        
        results_found = False
        for selector in table_selectors:
            try:
                rows = await self.page.query_selector_all(selector)
                if rows and len(rows) > 0:
                    print(f"✅ Found {len(rows)} result rows with selector: {selector}")
                    results_found = True
                    
                    for i, row in enumerate(rows):
                        try:
                            facility_data = await self.extract_facility_from_row(row)
                            if facility_data:
                                self.facilities.append(facility_data)
                                
                                # Add delay every 10 facilities
                                if i % 10 == 0 and i > 0:
                                    await self.page.wait_for_timeout(2000)
                                    
                        except Exception as e:
                            print(f"❌ Error extracting facility {i}: {e}")
                            continue
                    break
                    
            except Exception as e:
                print(f"❌ Error with selector {selector}: {e}")
                continue
                
        if not results_found:
            print("⚠️  No results table found, trying alternative extraction...")
            await self.extract_from_page_content()
            
    async def extract_facility_from_row(self, row):
        """Extract facility data from a table row"""
        try:
            # Get all cells in the row
            cells = await row.query_selector_all('td, th')
            
            if len(cells) < 2:
                return None
                
            facility_data = {
                'provider_name': '',
                'facility_type': '',
                'address': '',
                'city': '',
                'state': 'TX',
                'phone': '',
                'license_number': '',
                'license_status': '',
                'ownership_type': '',
                'services': '',
                'care_category': '',
                'source_url': self.base_url,
                'scraped_date': datetime.now().isoformat()
            }
            
            # Extract text from cells
            cell_texts = []
            for cell in cells:
                text = await cell.inner_text()
                cell_texts.append(text.strip())
                
            # Map cell data to facility fields
            if len(cell_texts) >= 1:
                facility_data['provider_name'] = cell_texts[0]
                
            if len(cell_texts) >= 2:
                facility_data['facility_type'] = cell_texts[1]
                facility_data['care_category'] = self.categorize_facility_type(cell_texts[1])
                
            if len(cell_texts) >= 3:
                facility_data['city'] = cell_texts[2]
                
            if len(cell_texts) >= 4:
                facility_data['address'] = cell_texts[3]
                
            # Look for clickable links to get more details
            links = await row.query_selector_all('a')
            if links:
                try:
                    detail_data = await self.get_facility_details(links[0])
                    facility_data.update(detail_data)
                except:
                    pass
                    
            return facility_data
            
        except Exception as e:
            print(f"❌ Error extracting facility from row: {e}")
            return None
            
    async def get_facility_details(self, link):
        """Get detailed facility information from detail page"""
        detail_data = {}
        
        try:
            # Open link in new tab
            new_page = await self.browser.new_page()
            
            href = await link.get_attribute('href')
            if href:
                if not href.startswith('http'):
                    href = f"https://txhhs.my.site.com{href}"
                    
                await new_page.goto(href, wait_until='networkidle', timeout=15000)
                await new_page.wait_for_timeout(3000)
                
                # Extract details from the page
                page_text = await new_page.inner_text('body')
                
                # Look for phone numbers
                phone_match = re.search(r'(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})', page_text)
                if phone_match:
                    detail_data['phone'] = phone_match.group(1)
                    
                # Look for license numbers
                license_match = re.search(r'License[:\s#]*([A-Z0-9\-]+)', page_text, re.IGNORECASE)
                if license_match:
                    detail_data['license_number'] = license_match.group(1)
                    
                # Look for addresses
                address_match = re.search(r'(\d+[^,]+(?:Street|Ave|Avenue|Road|Rd|Drive|Dr|Lane|Ln|Blvd|Boulevard)[^,]*)', page_text, re.IGNORECASE)
                if address_match:
                    detail_data['address'] = address_match.group(1)
                    
            await new_page.close()
            
        except Exception as e:
            print(f"❌ Error getting facility details: {e}")
            
        return detail_data
        
    async def extract_from_page_content(self):
        """Extract facilities from page content as fallback"""
        print("🔄 Extracting from page content...")
        
        page_text = await self.page.inner_text('body')
        
        # Look for facility-like patterns in text
        facility_patterns = [
            r'([A-Z][a-z]+ [A-Z][a-z]+ (?:Care|Living|Center|Home|Services))',
            r'([A-Z][a-z]+ (?:Assisted Living|Nursing Home|Adult Day Care))',
            r'([A-Z][a-z]+ [A-Z][a-z]+ (?:LLC|Inc|Corporation))'
        ]
        
        for pattern in facility_patterns:
            matches = re.findall(pattern, page_text)
            for match in matches:
                facility_data = {
                    'provider_name': match,
                    'facility_type': 'Unknown',
                    'address': '',
                    'city': '',
                    'state': 'TX',
                    'phone': '',
                    'license_number': '',
                    'license_status': '',
                    'ownership_type': '',
                    'services': '',
                    'care_category': 'Unknown',
                    'source_url': self.base_url,
                    'scraped_date': datetime.now().isoformat()
                }
                self.facilities.append(facility_data)
                
        # Deduplicate facilities
        seen_names = set()
        unique_facilities = []
        for facility in self.facilities:
            name = facility['provider_name'].lower()
            if name not in seen_names and len(name) > 3:
                seen_names.add(name)
                unique_facilities.append(facility)
                
        self.facilities = unique_facilities
        
    def categorize_facility_type(self, facility_type):
        """Categorize facility type into care categories"""
        facility_type_lower = facility_type.lower()
        
        if 'assisted living' in facility_type_lower or 'alf' in facility_type_lower:
            return 'Assisted Living'
        elif 'nursing' in facility_type_lower or 'skilled nursing' in facility_type_lower:
            return 'Skilled Nursing'
        elif 'home' in facility_type_lower and 'community' in facility_type_lower:
            return 'Home & Community Support'
        elif 'adult day' in facility_type_lower or 'day care' in facility_type_lower:
            return 'Adult Day Care'
        elif 'medicaid' in facility_type_lower or 'waiver' in facility_type_lower:
            return 'Medicaid Waiver'
        else:
            return 'Other'
            
    def save_to_csv(self):
        """Save facilities to CSV file"""
        if not self.facilities:
            print("⚠️  No facilities to save")
            return
            
        filename = 'texas_tulip_facilities.csv'
        
        fieldnames = [
            'provider_name', 'facility_type', 'address', 'city', 'state',
            'phone', 'license_number', 'license_status', 'ownership_type',
            'services', 'care_category', 'source_url', 'scraped_date'
        ]
        
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(self.facilities)
            
        print(f"💾 Saved {len(self.facilities)} facilities to {filename}")
        
    def save_to_json(self):
        """Save facilities to JSON file"""
        if not self.facilities:
            return
            
        filename = 'texas_tulip_facilities.json'
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.facilities, f, indent=2, ensure_ascii=False)
            
        print(f"💾 Saved {len(self.facilities)} facilities to {filename}")
        
    def create_integration_script(self):
        """Create TrueView integration script"""
        count = len(self.facilities)
        
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
  
  console.log(`✅ Loaded ${{facilities.length}} Texas TULIP facilities`);
  
  // Get existing facilities to avoid duplicates
  const existingQuery = `SELECT name, city FROM communities WHERE state = 'TX'`;
  const existingResult = await pool.query(existingQuery);
  const existingSet = new Set(
    existingResult.rows.map(row => `${{row.name}}|${{row.city}}`.toLowerCase())
  );
  
  console.log(`📊 Found ${{existingResult.rows.length}} existing Texas facilities`);
  
  let addedCount = 0;
  let skippedCount = 0;
  
  for (const facility of facilities) {{
    const key = `${{facility.provider_name}}|${{facility.city}}`.toLowerCase();
    
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
        facility.provider_name,
        facility.address,
        facility.city,
        facility.state,
        '',  // zip_code
        facility.phone,
        '',  // county
        [facility.care_category],
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
      console.error(`❌ Error adding ${{facility.provider_name}}:`, error.message);
    }}
  }}
  
  console.log(`\\n🎯 TEXAS TULIP EXPANSION COMPLETE`);
  console.log(`✅ Successfully added: ${{addedCount}} new facilities`);
  console.log(`⏭️  Skipped (duplicates): ${{skippedCount}} facilities`);
  
  // Show care category breakdown
  const categoryQuery = `
    SELECT 
      care_types,
      COUNT(*) as count
    FROM communities 
    WHERE state = 'TX' 
    GROUP BY care_types
    ORDER BY count DESC
  `;
  
  const categoryResult = await pool.query(categoryQuery);
  console.log(`\\n📊 Texas Facilities by Care Type:`);
  for (const row of categoryResult.rows) {{
    console.log(`   ${{row.care_types}}: ${{row.count}}`);
  }}
  
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
        
        with open('integrate-texas-tulip-scraped.cjs', 'w') as f:
            f.write(script)
            
        print("✅ Created integration script: integrate-texas-tulip-scraped.cjs")

async def main():
    """Main function to run the scraper"""
    scraper = TexasTulipScraper()
    await scraper.scrape_facilities()
    scraper.create_integration_script()
    
    # Show summary
    if scraper.facilities:
        print(f"\n🎯 SCRAPING COMPLETE")
        print(f"✅ Total facilities scraped: {len(scraper.facilities)}")
        
        # Show breakdown by care category
        categories = {}
        for facility in scraper.facilities:
            cat = facility.get('care_category', 'Unknown')
            categories[cat] = categories.get(cat, 0) + 1
            
        print(f"\n📊 Facilities by Care Category:")
        for category, count in sorted(categories.items(), key=lambda x: x[1], reverse=True):
            print(f"   {category}: {count}")
            
        print(f"\n📁 Output Files:")
        print(f"   - texas_tulip_facilities.csv")
        print(f"   - texas_tulip_facilities.json")
        print(f"   - integrate-texas-tulip-scraped.cjs")
        
        print(f"\n🚀 Next Steps:")
        print(f"   1. Run: node integrate-texas-tulip-scraped.cjs")
        print(f"   2. This will integrate all facilities into TrueView database")
        
    else:
        print(f"\n❌ No facilities found - check tulip_page_content.html for debugging")

if __name__ == "__main__":
    asyncio.run(main())