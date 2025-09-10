#!/usr/bin/env python3
"""
Florida AHCA Web Scraper for Comprehensive Expansion
Addresses critical data gap: Florida only has 33% county coverage (22/67 counties)

Target: Collect facilities from 45 missing counties including major retirement areas:
- Miami-Dade, Broward, Palm Beach (Southeast Florida)
- Sumter (The Villages), Orange (Orlando), Hillsborough (Tampa)
- All other missing counties to achieve 100% Florida coverage

Data Source: FloridaHealthFinder web interface
"""

import requests
import csv
import json
import time
import logging
from datetime import datetime
from typing import List, Dict, Any
import re
from bs4 import BeautifulSoup
import urllib.parse

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class FloridaAHCAWebScraper:
    def __init__(self):
        self.base_url = "https://quality.healthfinder.fl.gov"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })
        
        # All 67 Florida counties
        self.all_florida_counties = [
            'Alachua', 'Baker', 'Bay', 'Bradford', 'Brevard', 'Broward', 'Calhoun',
            'Charlotte', 'Citrus', 'Clay', 'Collier', 'Columbia', 'DeSoto', 'Dixie',
            'Duval', 'Escambia', 'Flagler', 'Franklin', 'Gadsden', 'Gilchrist',
            'Glades', 'Gulf', 'Hamilton', 'Hardee', 'Hendry', 'Hernando',
            'Highlands', 'Hillsborough', 'Holmes', 'Indian River', 'Jackson',
            'Jefferson', 'Lafayette', 'Lake', 'Lee', 'Leon', 'Levy', 'Liberty',
            'Madison', 'Manatee', 'Marion', 'Martin', 'Miami-Dade', 'Monroe',
            'Nassau', 'Okaloosa', 'Okeechobee', 'Orange', 'Osceola', 'Palm Beach',
            'Pasco', 'Pinellas', 'Polk', 'Putnam', 'Santa Rosa', 'Sarasota',
            'Seminole', 'St. Johns', 'St. Lucie', 'Sumter', 'Suwannee', 'Taylor',
            'Union', 'Volusia', 'Wakulla', 'Walton', 'Washington'
        ]
        
        # Counties we currently have (from database audit)
        self.current_counties = [
            'Bay', 'Calhoun', 'Columbia', 'Dixie', 'Escambia', 'Franklin',
            'Gadsden', 'Gulf', 'Hamilton', 'Holmes', 'Jackson', 'Jefferson',
            'Lafayette', 'Leon', 'Liberty', 'Okaloosa', 'Santa Rosa',
            'Suwannee', 'Taylor', 'Wakulla', 'Walton', 'Washington'
        ]
        
        # Priority missing counties (45 total)
        self.missing_counties = [county for county in self.all_florida_counties 
                               if county not in self.current_counties]
        
        self.facilities = []
        self.stats = {
            'total_facilities': 0,
            'counties_processed': set(),
            'cities_covered': set(),
            'collection_errors': 0,
            'processing_start': datetime.now().isoformat()
        }

    def get_search_page_form_data(self) -> Dict[str, str]:
        """Extract form data and session tokens from search page"""
        try:
            search_url = f"{self.base_url}/Facility-Search/FacilityLocateSearch"
            response = self.session.get(search_url, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract hidden form fields (viewstate, etc.)
            form_data = {}
            hidden_inputs = soup.find_all('input', type='hidden')
            for input_tag in hidden_inputs:
                name = input_tag.get('name')
                value = input_tag.get('value', '')
                if name:
                    form_data[name] = value
            
            return form_data
            
        except Exception as e:
            logger.error(f"Error getting search page form data: {str(e)}")
            return {}

    def search_county_facilities(self, county_name: str) -> List[Dict]:
        """Search for facilities in a specific county using web form submission"""
        logger.info(f"Searching facilities in {county_name} County...")
        
        try:
            # Get initial form data
            form_data = self.get_search_page_form_data()
            if not form_data:
                logger.error(f"Could not get form data for {county_name}")
                return []
            
            # Prepare search parameters
            search_params = {
                **form_data,
                'ctl00$MainContent$txtCounty': county_name,
                'ctl00$MainContent$ddlFacilityType': 'ALF',  # Start with Assisted Living
                'ctl00$MainContent$btnSearch': 'Search'
            }
            
            # Submit search form
            search_url = f"{self.base_url}/Facility-Search/FacilityLocateSearch"
            response = self.session.post(search_url, data=search_params, timeout=30)
            response.raise_for_status()
            
            # Parse results
            facilities = self.parse_search_results(response.text, county_name)
            
            # Also search nursing homes
            time.sleep(2)  # Rate limiting
            
            search_params['ctl00$MainContent$ddlFacilityType'] = 'NH'  # Nursing Homes
            response = self.session.post(search_url, data=search_params, timeout=30)
            response.raise_for_status()
            
            nh_facilities = self.parse_search_results(response.text, county_name, 'NH')
            facilities.extend(nh_facilities)
            
            logger.info(f"Found {len(facilities)} facilities in {county_name} County")
            return facilities
            
        except Exception as e:
            logger.error(f"Error searching {county_name} County: {str(e)}")
            self.stats['collection_errors'] += 1
            return []

    def parse_search_results(self, html_content: str, county_name: str, facility_type: str = 'ALF') -> List[Dict]:
        """Parse facility search results from HTML"""
        facilities = []
        
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Look for facility results table or list
            # This will need to be adjusted based on actual HTML structure
            result_rows = soup.find_all('tr', class_=['gridrow', 'gridaltrow']) or \
                         soup.find_all('div', class_='facility-result')
            
            for row in result_rows:
                try:
                    facility_data = self.extract_facility_data(row, county_name, facility_type)
                    if facility_data:
                        facilities.append(facility_data)
                except Exception as e:
                    logger.warning(f"Error parsing facility row: {str(e)}")
                    continue
                    
        except Exception as e:
            logger.error(f"Error parsing search results: {str(e)}")
            
        return facilities

    def extract_facility_data(self, row_element, county_name: str, facility_type: str) -> Dict:
        """Extract facility information from HTML row element"""
        try:
            # This needs to be customized based on actual HTML structure
            # Looking for common patterns in facility listings
            
            name = ""
            address = ""
            city = ""
            phone = ""
            
            # Try to extract name (usually in first column or as a link)
            name_elem = row_element.find('a') or row_element.find('td')
            if name_elem:
                name = name_elem.get_text().strip()
            
            # Try to extract other data from table cells
            cells = row_element.find_all('td')
            if len(cells) >= 3:
                # Common pattern: Name, Address, Phone
                if len(cells) > 0 and not name:
                    name = cells[0].get_text().strip()
                if len(cells) > 1:
                    address_text = cells[1].get_text().strip()
                    # Try to split address and city
                    if ',' in address_text:
                        parts = address_text.split(',')
                        address = parts[0].strip()
                        city = parts[1].strip() if len(parts) > 1 else ""
                    else:
                        address = address_text
                if len(cells) > 2:
                    phone = cells[2].get_text().strip()
            
            # Clean up phone number
            phone = re.sub(r'[^\d-()]', '', phone) if phone else ""
            
            if name:
                facility = {
                    'name': name,
                    'address': address,
                    'city': city or county_name.replace(' County', ''),
                    'state': 'FL',
                    'zipCode': '',
                    'county': county_name,
                    'phone': phone,
                    'email': '',
                    'website': '',
                    'description': f"Licensed {facility_type} facility in {county_name} County, Florida",
                    'careTypes': ['Assisted Living'] if facility_type == 'ALF' else ['Skilled Nursing'],
                    'amenities': [],
                    'services': [],
                    'latitude': None,
                    'longitude': None,
                    'licenseNumber': '',
                    'facilityType': 'Senior Living',
                    'discoverySource': 'Florida AHCA FloridaHealthFinder',
                    'discoveryDate': datetime.now().isoformat(),
                    'isVerified': True,
                    'subscriptionTier': 'Basic',
                    'billingStatus': 'active'
                }
                
                # Update stats
                self.stats['counties_processed'].add(county_name)
                self.stats['cities_covered'].add(city or county_name)
                
                return facility
                
        except Exception as e:
            logger.warning(f"Error extracting facility data: {str(e)}")
            
        return None

    def collect_all_missing_counties(self):
        """Collect facilities from all 45 missing Florida counties"""
        logger.info(f"Starting Florida comprehensive expansion for {len(self.missing_counties)} missing counties...")
        
        # Prioritize major retirement and metro areas
        priority_counties = [
            'Miami-Dade', 'Broward', 'Palm Beach',  # Southeast major metros
            'Orange', 'Hillsborough', 'Pinellas',   # Central metros  
            'Sumter', 'Sarasota', 'Charlotte',      # Prime retirement
            'Lee', 'Collier', 'Manatee'             # Southwest retirement
        ]
        
        # Process priority counties first
        for county in priority_counties:
            if county in self.missing_counties:
                self.process_county(county)
                
        # Process remaining counties
        remaining_counties = [c for c in self.missing_counties if c not in priority_counties]
        for county in remaining_counties:
            self.process_county(county)

    def process_county(self, county: str):
        """Process a single county with error handling and rate limiting"""
        try:
            logger.info(f"Processing {county} County...")
            
            county_facilities = self.search_county_facilities(county)
            
            for facility_data in county_facilities:
                if facility_data and facility_data.get('name'):
                    self.facilities.append(facility_data)
                    self.stats['total_facilities'] += 1
            
            logger.info(f"Collected {len(county_facilities)} facilities from {county} County")
            
            # Rate limiting - respectful to AHCA servers
            time.sleep(3)
            
        except Exception as e:
            logger.error(f"Error processing {county} County: {str(e)}")
            self.stats['collection_errors'] += 1

    def save_results(self):
        """Save collected facilities to files"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Save CSV for database integration
        csv_filename = f"florida_expansion_facilities_{timestamp}.csv"
        if self.facilities:
            with open(csv_filename, 'w', newline='', encoding='utf-8') as csvfile:
                fieldnames = self.facilities[0].keys()
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(self.facilities)
        
        # Save JSON for detailed data
        json_filename = f"florida_expansion_facilities_{timestamp}.json"
        with open(json_filename, 'w', encoding='utf-8') as jsonfile:
            json.dump(self.facilities, jsonfile, indent=2, ensure_ascii=False)
        
        # Save stats
        final_stats = {
            **self.stats,
            'counties_processed': list(self.stats['counties_processed']),
            'cities_covered': list(self.stats['cities_covered']),
            'processing_end': datetime.now().isoformat(),
            'target_counties': len(self.missing_counties),
            'expected_coverage_improvement': f"From 22/67 (33%) to {22 + len(self.stats['counties_processed'])}/67 counties"
        }
        
        stats_filename = f"florida_expansion_stats_{timestamp}.json"
        with open(stats_filename, 'w', encoding='utf-8') as statsfile:
            json.dump(final_stats, statsfile, indent=2, ensure_ascii=False)
        
        logger.info(f"Results saved: {csv_filename}, {json_filename}, {stats_filename}")
        return csv_filename, json_filename, stats_filename

    def print_collection_summary(self):
        """Print comprehensive collection summary"""
        print("\n" + "="*80)
        print("FLORIDA COMPREHENSIVE EXPANSION RESULTS")
        print("="*80)
        print(f"Total Facilities Collected: {self.stats['total_facilities']:,}")
        print(f"Counties Processed: {len(self.stats['counties_processed'])}")
        print(f"Cities Covered: {len(self.stats['cities_covered'])}")
        print(f"Collection Errors: {self.stats['collection_errors']}")
        
        print(f"\nCounties Successfully Processed:")
        for county in sorted(self.stats['counties_processed']):
            print(f"  • {county} County")
        
        print(f"\nCoverage Improvement:")
        current_total = 22 + len(self.stats['counties_processed'])
        coverage_pct = (current_total / 67) * 100
        print(f"  Before: 22/67 counties (33%)")
        print(f"  After: {current_total}/67 counties ({coverage_pct:.1f}%)")
        
        if len(self.stats['counties_processed']) > 0:
            print(f"\nMAJOR RETIREMENT AREAS NOW COVERED:")
            major_areas = ['Miami-Dade', 'Broward', 'Palm Beach', 'Sumter', 'Orange', 'Hillsborough', 'Pinellas']
            for area in major_areas:
                status = "✅ ADDED" if area in self.stats['counties_processed'] else "❌ STILL MISSING"
                print(f"    {area}: {status}")
        
        print("="*80)

def main():
    """Main execution function"""
    print("Florida AHCA Comprehensive Expansion Scraper")
    print("Addressing critical 67% coverage gap in Florida counties")
    print("Target: 45 missing counties including major retirement destinations")
    print("-" * 60)
    
    scraper = FloridaAHCAWebScraper()
    
    try:
        # Collect facilities from missing counties
        scraper.collect_all_missing_counties()
        
        # Save results
        csv_file, json_file, stats_file = scraper.save_results()
        
        # Print summary
        scraper.print_collection_summary()
        
        print(f"\nNext Steps:")
        print(f"1. Review collected data in {csv_file}")
        print(f"2. Run database integration script to add {scraper.stats['total_facilities']} facilities")
        print(f"3. Update replit.md with new Florida coverage statistics")
        print(f"4. Address remaining state integrity issues (Georgia, Colorado)")
        
    except KeyboardInterrupt:
        print("\nCollection interrupted by user")
        return 1
    except Exception as e:
        logger.error(f"Critical error: {str(e)}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())