import asyncio
import csv
import json
import time
from playwright.async_api import async_playwright
from datetime import datetime
import re
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TexasTulipAdvancedScraper:
    def __init__(self):
        self.base_url = "https://txhhs.my.site.com/TULIP/s/ltc-provider-search"
        self.facilities = []
        self.page = None
        self.browser = None
        self.context = None
        
    async def start_browser(self):
        """Initialize Playwright browser with proper configuration"""
        playwright = await async_playwright().start()
        self.browser = await playwright.chromium.launch(
            headless=False,  # Run in visible mode for debugging
            args=[
                '--no-sandbox',
                '--disable-dev-shm-usage',
                '--disable-blink-features=AutomationControlled',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ]
        )
        
        self.context = await self.browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={'width': 1920, 'height': 1080}
        )
        
        # Add extra headers
        await self.context.set_extra_http_headers({
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        })
        
        self.page = await self.context.new_page()
        
        # Block unnecessary resources to speed up loading
        await self.page.route("**/*.{png,jpg,jpeg,gif,svg,css,woff,woff2}", lambda route: route.abort())
        
    async def scrape_facilities(self):
        """Main scraping function with comprehensive approach"""
        try:
            await self.start_browser()
            
            logger.info("🤠 Texas TULIP Advanced Scraper - Starting comprehensive extraction")
            
            # Navigate to search page
            await self.page.goto(self.base_url, wait_until='networkidle', timeout=60000)
            logger.info(f"✅ Successfully loaded page: {self.base_url}")
            
            # Wait for page to fully load
            await self.page.wait_for_timeout(10000)
            
            # Take screenshot for debugging
            await self.page.screenshot(path="tulip_initial_page.png")
            
            # Save page content
            content = await self.page.content()
            with open('tulip_full_page.html', 'w', encoding='utf-8') as f:
                f.write(content)
            
            # Look for and interact with search form
            await self.find_and_submit_search()
            
            # Wait for results to load
            await self.page.wait_for_timeout(10000)
            
            # Extract facility data
            await self.extract_all_facilities()
            
            # Save results
            self.save_results()
            
            logger.info(f"🎯 Scraping complete: {len(self.facilities)} facilities found")
            
        except Exception as e:
            logger.error(f"❌ Error during scraping: {e}")
            await self.page.screenshot(path="tulip_error.png")
            raise
        finally:
            if self.browser:
                await self.browser.close()
                
    async def find_and_submit_search(self):
        """Find and submit search form with multiple strategies"""
        logger.info("🔍 Searching for form elements...")
        
        # Strategy 1: Look for search buttons
        search_strategies = [
            "button:has-text('Search')",
            "input[type='submit']",
            "button[type='submit']",
            ".slds-button--brand",
            ".slds-button--neutral",
            "[data-aura-rendered-by*='search']",
            "c-ltc-provider-search button"
        ]
        
        for strategy in search_strategies:
            try:
                elements = await self.page.query_selector_all(strategy)
                if elements:
                    logger.info(f"✅ Found {len(elements)} elements with strategy: {strategy}")
                    for element in elements:
                        text = await element.text_content()
                        if text and ('search' in text.lower() or 'find' in text.lower()):
                            await element.click()
                            logger.info(f"✅ Clicked search button: {text}")
                            await self.page.wait_for_timeout(5000)
                            break
                    break
            except Exception as e:
                logger.debug(f"Strategy {strategy} failed: {e}")
                continue
        
        # Strategy 2: Look for form inputs and try to submit
        form_strategies = [
            "form",
            ".slds-form",
            "[data-aura-rendered-by*='form']"
        ]
        
        for strategy in form_strategies:
            try:
                forms = await self.page.query_selector_all(strategy)
                if forms:
                    logger.info(f"✅ Found {len(forms)} forms with strategy: {strategy}")
                    for form in forms:
                        # Try to submit the form
                        await form.evaluate("form => form.submit()")
                        await self.page.wait_for_timeout(5000)
                        break
                    break
            except Exception as e:
                logger.debug(f"Form strategy {strategy} failed: {e}")
                continue
        
        # Strategy 3: Try pressing Enter
        try:
            await self.page.keyboard.press('Enter')
            await self.page.wait_for_timeout(5000)
            logger.info("✅ Tried Enter key")
        except Exception as e:
            logger.debug(f"Enter key failed: {e}")
        
        # Strategy 4: Look for specific Lightning components
        lightning_strategies = [
            "c-ltc-provider-search",
            "lightning-button",
            "lightning-input",
            "[data-aura-rendered-by]"
        ]
        
        for strategy in lightning_strategies:
            try:
                elements = await self.page.query_selector_all(strategy)
                if elements:
                    logger.info(f"✅ Found {len(elements)} Lightning components with: {strategy}")
                    # Try to interact with Lightning components
                    for element in elements:
                        try:
                            await element.click()
                            await self.page.wait_for_timeout(3000)
                        except:
                            continue
                    break
            except Exception as e:
                logger.debug(f"Lightning strategy {strategy} failed: {e}")
                continue
    
    async def extract_all_facilities(self):
        """Extract facilities with multiple strategies"""
        logger.info("📊 Extracting facility data...")
        
        # Take screenshot after search
        await self.page.screenshot(path="tulip_after_search.png")
        
        # Strategy 1: Look for data tables
        table_strategies = [
            "table tbody tr",
            ".slds-table tbody tr",
            ".datatable tr",
            "[data-aura-rendered-by*='table'] tr",
            "c-ltc-provider-search table tr"
        ]
        
        for strategy in table_strategies:
            try:
                rows = await self.page.query_selector_all(strategy)
                if rows and len(rows) > 0:
                    logger.info(f"✅ Found {len(rows)} table rows with: {strategy}")
                    
                    for i, row in enumerate(rows):
                        try:
                            facility = await self.extract_facility_from_row(row)
                            if facility and facility.get('provider_name'):
                                self.facilities.append(facility)
                                logger.info(f"✅ Extracted: {facility.get('provider_name')}")
                                
                                # Add delay every 10 facilities
                                if i % 10 == 0 and i > 0:
                                    await self.page.wait_for_timeout(2000)
                        except Exception as e:
                            logger.debug(f"Error extracting row {i}: {e}")
                            continue
                    
                    if self.facilities:
                        break
                        
            except Exception as e:
                logger.debug(f"Table strategy {strategy} failed: {e}")
                continue
        
        # Strategy 2: Look for Lightning data service components
        lightning_data_strategies = [
            "lightning-datatable",
            "c-datatable",
            "[data-aura-rendered-by*='datatable']",
            ".slds-table"
        ]
        
        for strategy in lightning_data_strategies:
            try:
                elements = await self.page.query_selector_all(strategy)
                if elements:
                    logger.info(f"✅ Found {len(elements)} Lightning data components with: {strategy}")
                    
                    for element in elements:
                        # Try to extract data from Lightning components
                        text_content = await element.text_content()
                        if text_content and len(text_content) > 100:
                            facilities = self.parse_text_content(text_content)
                            self.facilities.extend(facilities)
                            
            except Exception as e:
                logger.debug(f"Lightning data strategy {strategy} failed: {e}")
                continue
        
        # Strategy 3: Look for JSON data in page
        await self.extract_json_data()
        
        # Strategy 4: Try to find paginated results
        await self.handle_pagination()
    
    async def extract_facility_from_row(self, row):
        """Extract facility data from a table row"""
        try:
            cells = await row.query_selector_all('td, th')
            if len(cells) < 2:
                return None
            
            # Extract text from all cells
            cell_texts = []
            for cell in cells:
                text = await cell.text_content()
                if text:
                    cell_texts.append(text.strip())
            
            if len(cell_texts) < 2:
                return None
            
            # Build facility object
            facility = {
                'provider_name': cell_texts[0] if len(cell_texts) > 0 else '',
                'facility_type': cell_texts[1] if len(cell_texts) > 1 else 'Assisted Living',
                'city': cell_texts[2] if len(cell_texts) > 2 else '',
                'state': 'TX',
                'address': cell_texts[3] if len(cell_texts) > 3 else '',
                'phone': '',
                'license_number': '',
                'license_status': 'Active',
                'ownership_type': '',
                'services': '',
                'care_category': self.categorize_facility_type(cell_texts[1] if len(cell_texts) > 1 else ''),
                'source_url': self.base_url,
                'scraped_date': datetime.now().isoformat()
            }
            
            # Look for clickable links to get more details
            links = await row.query_selector_all('a')
            if links:
                try:
                    detail_data = await self.get_facility_details(links[0])
                    facility.update(detail_data)
                except Exception as e:
                    logger.debug(f"Error getting facility details: {e}")
            
            return facility
            
        except Exception as e:
            logger.debug(f"Error extracting facility from row: {e}")
            return None
    
    async def get_facility_details(self, link):
        """Get detailed facility information"""
        detail_data = {}
        
        try:
            # Open link in new tab
            new_page = await self.context.new_page()
            
            href = await link.get_attribute('href')
            if href:
                if not href.startswith('http'):
                    href = f"https://txhhs.my.site.com{href}"
                
                await new_page.goto(href, wait_until='networkidle', timeout=30000)
                await new_page.wait_for_timeout(5000)
                
                # Extract details
                page_text = await new_page.text_content('body')
                
                # Extract phone numbers
                phone_match = re.search(r'(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})', page_text)
                if phone_match:
                    detail_data['phone'] = phone_match.group(1)
                
                # Extract license numbers
                license_match = re.search(r'License[:\s#]*([A-Z0-9\-]+)', page_text, re.IGNORECASE)
                if license_match:
                    detail_data['license_number'] = license_match.group(1)
                
                # Extract addresses
                address_match = re.search(r'(\d+[^,\n]+(?:Street|Ave|Avenue|Road|Rd|Drive|Dr|Lane|Ln|Blvd|Boulevard)[^,\n]*)', page_text, re.IGNORECASE)
                if address_match:
                    detail_data['address'] = address_match.group(1)
            
            await new_page.close()
            
        except Exception as e:
            logger.debug(f"Error getting facility details: {e}")
        
        return detail_data
    
    def parse_text_content(self, text):
        """Parse text content for facility information"""
        facilities = []
        
        # Look for facility-like patterns
        lines = text.split('\n')
        current_facility = {}
        
        for line in lines:
            line = line.strip()
            if len(line) < 5:
                continue
                
            # Look for facility names
            if any(keyword in line.lower() for keyword in ['assisted living', 'senior', 'care', 'nursing', 'home']):
                if current_facility.get('provider_name'):
                    facilities.append(current_facility)
                    current_facility = {}
                
                current_facility['provider_name'] = line
                current_facility['facility_type'] = 'Assisted Living'
                current_facility['state'] = 'TX'
                current_facility['care_category'] = 'Assisted Living'
                current_facility['source_url'] = self.base_url
                current_facility['scraped_date'] = datetime.now().isoformat()
            
            # Look for cities
            elif re.match(r'^[A-Z][a-z]+(?:\s[A-Z][a-z]+)*$', line) and len(line) < 30:
                if current_facility.get('provider_name') and not current_facility.get('city'):
                    current_facility['city'] = line
            
            # Look for phone numbers
            elif re.search(r'\(\d{3}\)\s?\d{3}-?\d{4}', line):
                if current_facility.get('provider_name'):
                    current_facility['phone'] = line
        
        # Add the last facility
        if current_facility.get('provider_name'):
            facilities.append(current_facility)
        
        return facilities
    
    async def extract_json_data(self):
        """Extract JSON data from page scripts"""
        try:
            # Execute JavaScript to find data
            data = await self.page.evaluate("""
                () => {
                    const results = [];
                    
                    // Look for global variables
                    if (window.providerData) results.push(window.providerData);
                    if (window.facilitiesData) results.push(window.facilitiesData);
                    if (window.searchResults) results.push(window.searchResults);
                    
                    // Look for Salesforce/Lightning data
                    if (window.$A && window.$A.getComponent) {
                        try {
                            const components = window.$A.getComponent();
                            if (components) results.push(components);
                        } catch (e) {}
                    }
                    
                    return results;
                }
            """)
            
            if data:
                logger.info(f"✅ Found {len(data)} JSON data sources")
                for item in data:
                    if isinstance(item, dict):
                        facilities = self.process_json_data(item)
                        self.facilities.extend(facilities)
                        
        except Exception as e:
            logger.debug(f"Error extracting JSON data: {e}")
    
    def process_json_data(self, data):
        """Process JSON data for facilities"""
        facilities = []
        
        if isinstance(data, dict):
            for key in ['providers', 'facilities', 'records', 'data', 'results']:
                if key in data and isinstance(data[key], list):
                    for item in data[key]:
                        if isinstance(item, dict):
                            facility = {
                                'provider_name': item.get('name', item.get('providerName', '')),
                                'facility_type': item.get('type', 'Assisted Living'),
                                'address': item.get('address', ''),
                                'city': item.get('city', ''),
                                'state': 'TX',
                                'phone': item.get('phone', ''),
                                'license_number': item.get('licenseNumber', ''),
                                'license_status': item.get('status', 'Active'),
                                'ownership_type': item.get('ownershipType', ''),
                                'services': item.get('services', ''),
                                'care_category': self.categorize_facility_type(item.get('type', '')),
                                'source_url': self.base_url,
                                'scraped_date': datetime.now().isoformat()
                            }
                            
                            if facility['provider_name']:
                                facilities.append(facility)
        
        return facilities
    
    async def handle_pagination(self):
        """Handle paginated results"""
        try:
            # Look for pagination controls
            pagination_selectors = [
                "button:has-text('Next')",
                ".slds-pagination button",
                "[data-aura-rendered-by*='pagination']",
                "lightning-button-icon[icon-name='utility:chevronright']"
            ]
            
            page_count = 1
            max_pages = 10
            
            while page_count < max_pages:
                next_button = None
                
                for selector in pagination_selectors:
                    try:
                        elements = await self.page.query_selector_all(selector)
                        for element in elements:
                            text = await element.text_content()
                            if text and ('next' in text.lower() or '>' in text):
                                next_button = element
                                break
                        if next_button:
                            break
                    except:
                        continue
                
                if next_button:
                    await next_button.click()
                    await self.page.wait_for_timeout(5000)
                    
                    # Extract facilities from new page
                    await self.extract_all_facilities()
                    
                    page_count += 1
                    logger.info(f"✅ Processed page {page_count}")
                else:
                    break
                    
        except Exception as e:
            logger.debug(f"Error handling pagination: {e}")
    
    def categorize_facility_type(self, facility_type):
        """Categorize facility type"""
        if not facility_type:
            return 'Assisted Living'
        
        facility_type_lower = facility_type.lower()
        
        if 'assisted living' in facility_type_lower or 'alf' in facility_type_lower:
            return 'Assisted Living'
        elif 'nursing' in facility_type_lower:
            return 'Skilled Nursing'
        elif 'home' in facility_type_lower and 'community' in facility_type_lower:
            return 'Home & Community Support'
        elif 'adult day' in facility_type_lower:
            return 'Adult Day Care'
        elif 'medicaid' in facility_type_lower or 'waiver' in facility_type_lower:
            return 'Medicaid Waiver'
        else:
            return 'Assisted Living'
    
    def save_results(self):
        """Save all results"""
        if not self.facilities:
            logger.warning("⚠️ No facilities found to save")
            return
        
        # Remove duplicates
        unique_facilities = []
        seen = set()
        
        for facility in self.facilities:
            key = f"{facility.get('provider_name', '')}-{facility.get('city', '')}".lower()
            if key not in seen:
                seen.add(key)
                unique_facilities.append(facility)
        
        self.facilities = unique_facilities
        
        # Save to CSV
        fieldnames = [
            'provider_name', 'facility_type', 'address', 'city', 'state',
            'phone', 'license_number', 'license_status', 'ownership_type',
            'services', 'care_category', 'source_url', 'scraped_date'
        ]
        
        with open('texas_tulip_facilities.csv', 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(self.facilities)
        
        # Save to JSON
        with open('texas_tulip_facilities.json', 'w', encoding='utf-8') as f:
            json.dump(self.facilities, f, indent=2, ensure_ascii=False)
        
        logger.info(f"💾 Saved {len(self.facilities)} facilities to files")
        
        # Create integration script
        self.create_integration_script()
    
    def create_integration_script(self):
        """Create integration script for TrueView"""
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
  
  // Check for existing facilities
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
        console.log(`✅ Progress: ${{addedCount}} facilities added...`);
      }}
      
    }} catch (error) {{
      console.error(`❌ Error adding ${{facility.provider_name}}:`, error.message);
    }}
  }}
  
  console.log(`\\n🎯 TEXAS TULIP EXPANSION COMPLETE`);
  console.log(`✅ Successfully added: ${{addedCount}} new facilities`);
  console.log(`⏭️  Skipped (duplicates): ${{skippedCount}} facilities`);
  
  // Show final statistics
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
        
        logger.info("✅ Created integration script: integrate-texas-tulip-scraped.cjs")

async def main():
    """Run the advanced scraper"""
    scraper = TexasTulipAdvancedScraper()
    await scraper.scrape_facilities()
    
    if scraper.facilities:
        logger.info(f"\n🎯 SCRAPING COMPLETE: {len(scraper.facilities)} facilities found")
        
        # Show breakdown
        categories = {}
        cities = {}
        
        for facility in scraper.facilities:
            cat = facility.get('care_category', 'Unknown')
            categories[cat] = categories.get(cat, 0) + 1
            
            city = facility.get('city', 'Unknown')
            cities[city] = cities.get(city, 0) + 1
        
        print(f"\n📊 Facilities by Care Category:")
        for category, count in sorted(categories.items(), key=lambda x: x[1], reverse=True):
            print(f"   {category}: {count}")
        
        print(f"\n🏙️ Top Cities:")
        for city, count in sorted(cities.items(), key=lambda x: x[1], reverse=True)[:10]:
            print(f"   {city}: {count}")
        
        print(f"\n📁 Files Created:")
        print(f"   - texas_tulip_facilities.csv")
        print(f"   - texas_tulip_facilities.json")
        print(f"   - integrate-texas-tulip-scraped.cjs")
        
        print(f"\n🚀 Next Steps:")
        print(f"   1. Run: node integrate-texas-tulip-scraped.cjs")
        print(f"   2. This will add {len(scraper.facilities)} Texas facilities to TrueView")
        
    else:
        logger.error("❌ No facilities found - check debug files")

if __name__ == "__main__":
    asyncio.run(main())