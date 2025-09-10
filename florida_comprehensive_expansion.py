#!/usr/bin/env python3
"""
Florida Comprehensive Expansion Data Collector
Addresses the critical data gap in Florida coverage (currently only 33% county coverage)

CRITICAL ISSUE: We only have 101 communities in 22 counties out of 67 total Florida counties
Missing ALL major retirement destinations including:
- Miami-Dade County (2.7M population)
- Broward County (1.9M population) 
- Palm Beach County (West Palm Beach, Boca Raton)
- Sumter County (The Villages - largest retirement community in US)
- Orange County (Orlando)
- Hillsborough County (Tampa)
- Pinellas County (St. Petersburg)

Data Source: Florida AHCA FloridaHealthFinder database
URL: https://quality.healthfinder.fl.gov
"""

import requests
import json
import csv
import time
from datetime import datetime
import logging
import sys
from typing import Dict, List, Any
import re

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class FloridaAHCAExpansionCollector:
    def __init__(self):
        self.base_url = "https://quality.healthfinder.fl.gov"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://quality.healthfinder.fl.gov/',
        })
        
        # Florida counties we're missing (44 out of 67 total)
        self.missing_counties = [
            # Major Metro Areas
            'Miami-Dade', 'Broward', 'Palm Beach', 'Orange', 'Hillsborough', 'Pinellas',
            # Major Retirement Counties  
            'Sumter', 'Citrus', 'Charlotte', 'Sarasota', 'Manatee', 'Lee', 'Collier',
            # Central Florida
            'Polk', 'Volusia', 'Brevard', 'Seminole', 'Lake', 'Marion', 'Pasco',
            # North Florida
            'Duval', 'Clay', 'St. Johns', 'Flagler', 'Putnam', 'Bradford', 'Union',
            'Alachua', 'Gilchrist', 'Levy', 'Nassau', 'Baker',
            # Southwest Florida  
            'Hernando', 'Citrus', 'Hardee', 'Highlands', 'Hendry', 'Glades',
            # Southeast Florida
            'St. Lucie', 'Martin', 'Indian River', 'Okeechobee',
            # Keys and South
            'Monroe', 'Dade'
        ]
        
        self.facilities = []
        self.stats = {
            'total_facilities': 0,
            'counties_covered': set(),
            'cities_covered': set(),
            'facility_types': {},
            'collection_errors': 0
        }

    def search_facilities_by_county(self, county_name: str) -> List[Dict]:
        """Search for facilities in a specific Florida county"""
        logger.info(f"Searching facilities in {county_name} County...")
        
        try:
            # AHCA facility search endpoint
            search_url = f"{self.base_url}/api/facility/search"
            
            # Search parameters for assisted living and nursing facilities
            params = {
                'county': county_name,
                'facilityType': ['ALF', 'NH', 'AFCH'],  # Assisted Living, Nursing Home, Adult Family Care
                'pageSize': 500,
                'page': 1
            }
            
            response = self.session.get(search_url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            facilities = data.get('facilities', [])
            
            logger.info(f"Found {len(facilities)} facilities in {county_name} County")
            return facilities
            
        except Exception as e:
            logger.error(f"Error searching {county_name} County: {str(e)}")
            self.stats['collection_errors'] += 1
            return []

    def normalize_facility_data(self, facility: Dict) -> Dict:
        """Convert AHCA facility data to our schema format"""
        try:
            # Extract address components
            address_parts = facility.get('address', '').split(',')
            street_address = address_parts[0].strip() if address_parts else ''
            
            # Determine care types based on facility type and services
            care_types = []
            facility_type = facility.get('facilityType', '').upper()
            
            if facility_type == 'ALF':
                care_types.extend(['Assisted Living', 'Independent Living'])
            elif facility_type == 'NH':
                care_types.extend(['Skilled Nursing', 'Memory Care'])
            elif facility_type == 'AFCH':
                care_types.extend(['Adult Family Care', 'Assisted Living'])
                
            # Add specialized care based on services
            services = facility.get('services', [])
            if any('memory' in service.lower() or 'alzheimer' in service.lower() for service in services):
                care_types.append('Memory Care')
            if any('respite' in service.lower() for service in services):
                care_types.append('Respite Care')

            # Extract coordinates if available
            latitude = facility.get('latitude')
            longitude = facility.get('longitude')
            
            # Format phone number
            phone = facility.get('phone', '')
            if phone and not phone.startswith('('):
                phone = f"({phone[:3]}) {phone[3:6]}-{phone[6:]}" if len(phone) == 10 else phone

            normalized = {
                'name': facility.get('facilityName', '').strip(),
                'address': street_address,
                'city': facility.get('city', '').strip(),
                'state': 'FL',
                'zipCode': facility.get('zipCode', '').strip(),
                'county': facility.get('county', '').strip(),
                'phone': phone,
                'email': facility.get('email', ''),
                'website': facility.get('website', ''),
                'description': f"Licensed {facility_type} facility in {facility.get('county', '')} County, Florida",
                'careTypes': list(set(care_types)),  # Remove duplicates
                'amenities': [],
                'services': services or [],
                'latitude': str(latitude) if latitude else None,
                'longitude': str(longitude) if longitude else None,
                'licenseNumber': facility.get('licenseNumber', ''),
                'licenseStatus': facility.get('licenseStatus', ''),
                'facilityType': 'Senior Living',
                'discoverySource': 'Florida AHCA FloridaHealthFinder',
                'discoveryDate': datetime.now().isoformat(),
                'isVerified': True,  # AHCA data is government-verified
                'subscriptionTier': 'Basic',
                'billingStatus': 'active'
            }
            
            # Update stats
            self.stats['counties_covered'].add(facility.get('county', ''))
            self.stats['cities_covered'].add(facility.get('city', ''))
            self.stats['facility_types'][facility_type] = self.stats['facility_types'].get(facility_type, 0) + 1
            
            return normalized
            
        except Exception as e:
            logger.error(f"Error normalizing facility data: {str(e)}")
            return None

    def collect_all_missing_counties(self):
        """Collect facilities from all missing Florida counties"""
        logger.info(f"Starting comprehensive Florida expansion for {len(self.missing_counties)} missing counties...")
        
        for county in self.missing_counties:
            try:
                logger.info(f"Processing {county} County ({self.missing_counties.index(county) + 1}/{len(self.missing_counties)})...")
                
                county_facilities = self.search_facilities_by_county(county)
                
                for facility_data in county_facilities:
                    normalized_facility = self.normalize_facility_data(facility_data)
                    if normalized_facility and normalized_facility['name']:
                        self.facilities.append(normalized_facility)
                        self.stats['total_facilities'] += 1
                
                # Rate limiting - respectful to AHCA servers
                time.sleep(2)
                
            except Exception as e:
                logger.error(f"Error processing {county} County: {str(e)}")
                self.stats['collection_errors'] += 1
                continue

    def save_results(self):
        """Save collected facilities to files"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Save CSV for database integration
        csv_filename = f"florida_comprehensive_expansion_{timestamp}.csv"
        with open(csv_filename, 'w', newline='', encoding='utf-8') as csvfile:
            if self.facilities:
                fieldnames = self.facilities[0].keys()
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(self.facilities)
        
        # Save JSON for detailed data
        json_filename = f"florida_comprehensive_expansion_{timestamp}.json"
        with open(json_filename, 'w', encoding='utf-8') as jsonfile:
            json.dump(self.facilities, jsonfile, indent=2, ensure_ascii=False)
        
        # Save comprehensive stats
        stats_filename = f"florida_expansion_stats_{timestamp}.json"
        final_stats = {
            **self.stats,
            'counties_covered': list(self.stats['counties_covered']),
            'cities_covered': list(self.stats['cities_covered']),
            'collection_timestamp': timestamp,
            'total_missing_counties': len(self.missing_counties),
            'data_source': 'Florida AHCA FloridaHealthFinder',
            'coverage_improvement': f"Expanding from 22 to {22 + len(self.stats['counties_covered'])} counties"
        }
        
        with open(stats_filename, 'w', encoding='utf-8') as statsfile:
            json.dump(final_stats, statsfile, indent=2, ensure_ascii=False)
        
        logger.info(f"Results saved:")
        logger.info(f"  CSV: {csv_filename}")
        logger.info(f"  JSON: {json_filename}")
        logger.info(f"  Stats: {stats_filename}")
        
        return csv_filename, json_filename, stats_filename

    def print_collection_summary(self):
        """Print comprehensive collection summary"""
        print("\n" + "="*80)
        print("FLORIDA COMPREHENSIVE EXPANSION RESULTS")
        print("="*80)
        print(f"Total Facilities Collected: {self.stats['total_facilities']:,}")
        print(f"Counties Covered: {len(self.stats['counties_covered'])}")
        print(f"Cities Covered: {len(self.stats['cities_covered'])}")
        print(f"Collection Errors: {self.stats['collection_errors']}")
        
        print(f"\nFacility Types:")
        for facility_type, count in self.stats['facility_types'].items():
            print(f"  {facility_type}: {count:,}")
        
        print(f"\nCounties Successfully Processed:")
        for county in sorted(self.stats['counties_covered']):
            print(f"  • {county} County")
            
        print(f"\nCoverage Improvement:")
        print(f"  Before: 22 counties (33% of Florida's 67 counties)")
        print(f"  After: {22 + len(self.stats['counties_covered'])} counties")
        print(f"  New Coverage: {((22 + len(self.stats['counties_covered'])) / 67 * 100):.1f}%")
        
        print("\n" + "="*80)

def main():
    """Main execution function"""
    print("Florida Comprehensive Expansion Data Collector")
    print("Addressing critical 67% coverage gap in Florida counties")
    print("Current: 22/67 counties | Target: 67/67 counties (100%)")
    print("-" * 60)
    
    collector = FloridaAHCAExpansionCollector()
    
    try:
        # Collect facilities from all missing counties
        collector.collect_all_missing_counties()
        
        # Save results
        csv_file, json_file, stats_file = collector.save_results()
        
        # Print summary
        collector.print_collection_summary()
        
        print(f"\nNext Steps:")
        print(f"1. Review collected data in {csv_file}")
        print(f"2. Run database integration script")
        print(f"3. Update replit.md with new Florida coverage stats")
        print(f"4. Verify major missing areas now covered:")
        print(f"   • Miami-Dade County (Miami Metro)")
        print(f"   • Broward County (Fort Lauderdale)")
        print(f"   • Palm Beach County (West Palm Beach, Boca Raton)")
        print(f"   • Sumter County (The Villages)")
        print(f"   • Orange County (Orlando)")
        print(f"   • Hillsborough County (Tampa)")
        
    except KeyboardInterrupt:
        print("\nCollection interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Critical error in main execution: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()