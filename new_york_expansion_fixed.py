#!/usr/bin/env python3
"""
NEW YORK STATE SENIOR LIVING EXPANSION - FIXED VERSION
MySeniorValet.com - Comprehensive Senior Living Facility Data Collection
SOURCE: New York Department of Health Official Database

Data Source: Health Data NY - Health Facility Information System (HFIS)
URL: https://health.data.ny.gov/

Target: Complete New York coverage (62 counties)
Expected: 400+ adult care facilities
"""

import requests
import json
import csv
from datetime import datetime
import time
import re

class NewYorkExpansionCollector:
    def __init__(self):
        self.general_url = "https://health.data.ny.gov/resource/vn5v-hh5r.json"
        self.facilities = []
        self.timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
    def fetch_adult_care_facilities(self):
        """Fetch adult care facilities from general info dataset"""
        print("🏢 Fetching New York adult care facilities...")
        
        all_facilities = []
        offset = 0
        limit = 1000
        
        while True:
            try:
                params = {
                    '$limit': limit,
                    '$offset': offset
                }
                
                response = requests.get(self.general_url, params=params)
                response.raise_for_status()
                
                data = response.json()
                if not data:
                    break
                    
                print(f"✅ Fetched {len(data)} general info records (offset {offset})")
                
                # Filter for adult care facilities
                for facility in data:
                    description = facility.get('description', '').lower()
                    fac_desc_short = facility.get('fac_desc_short', '').lower()
                    
                    # Look for adult care facility indicators
                    if (('adult' in description and 'care' in description) or 
                        'assisted living' in description or
                        'enriched housing' in description or
                        fac_desc_short in ['acf', 'alf', 'acp', 'alr', 'ehp']):
                        
                        all_facilities.append(facility)
                        
                offset += limit
                time.sleep(0.1)  # Rate limiting
                
            except requests.RequestException as e:
                print(f"❌ Error fetching data at offset {offset}: {str(e)}")
                break
                
        print(f"🏢 Found {len(all_facilities)} adult care facilities")
        return all_facilities
        
    def normalize_facility_data(self, raw_facilities):
        """Normalize facility data for MySeniorValet format"""
        print("🔧 Normalizing New York facility data...")
        
        normalized = []
        
        for facility in raw_facilities:
            description = facility.get('description', '')
            
            # Determine care types based on description
            care_types = []
            if 'adult care' in description.lower():
                care_types.append('Adult Care')
            if 'assisted living' in description.lower():
                care_types.append('Assisted Living')
            if 'enriched housing' in description.lower():
                care_types.append('Enriched Housing')
            if not care_types:
                care_types.append('Senior Living')
                
            # Clean phone number
            phone = facility.get('fac_phone', '')
            if phone and len(phone) == 10:
                phone = f"({phone[:3]}) {phone[3:6]}-{phone[6:]}"
                
            # Create normalized facility record
            normalized_facility = {
                'name': facility.get('facility_name', ''),
                'address': facility.get('address1', ''),
                'city': facility.get('city', ''),
                'state': 'NY',
                'zip_code': facility.get('fac_zip', ''),
                'county': facility.get('county', ''),
                'phone': phone,
                'care_types': care_types,
                'facility_type': 'Senior Living Community',
                'description': description,
                'license_number': facility.get('opcert_num', ''),
                'operator_name': facility.get('operator_name', ''),
                'ownership_type': facility.get('ownership_type', ''),
                'latitude': facility.get('latitude', ''),
                'longitude': facility.get('longitude', ''),
                'data_source': 'NY_DOH_Official',
                'verification_status': 'Government_Verified',
                'last_updated': datetime.now().isoformat()
            }
            
            # Only include facilities with valid names and cities
            if normalized_facility['name'] and normalized_facility['city']:
                normalized.append(normalized_facility)
                
        return normalized
        
    def save_data(self, facilities):
        """Save facility data to files"""
        print("💾 Saving New York expansion data...")
        
        # Save as JSON
        json_filename = f"new_york_facilities_fixed_{self.timestamp}.json"
        with open(json_filename, 'w', encoding='utf-8') as f:
            json.dump(facilities, f, indent=2, ensure_ascii=False)
            
        # Save as CSV
        csv_filename = f"new_york_facilities_fixed_{self.timestamp}.csv"
        with open(csv_filename, 'w', newline='', encoding='utf-8') as f:
            if facilities:
                fieldnames = facilities[0].keys()
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(facilities)
                
        # Save statistics
        stats = {
            'total_facilities': len(facilities),
            'by_county': {},
            'by_care_type': {},
            'by_ownership': {},
            'with_coordinates': 0,
            'data_collection_date': datetime.now().isoformat(),
            'data_source': 'NY_Department_of_Health_Official'
        }
        
        # Generate statistics
        for facility in facilities:
            county = facility.get('county', 'Unknown')
            stats['by_county'][county] = stats['by_county'].get(county, 0) + 1
            
            for care_type in facility.get('care_types', []):
                stats['by_care_type'][care_type] = stats['by_care_type'].get(care_type, 0) + 1
                
            ownership = facility.get('ownership_type', 'Unknown')
            stats['by_ownership'][ownership] = stats['by_ownership'].get(ownership, 0) + 1
            
            if facility.get('latitude') and facility.get('longitude'):
                stats['with_coordinates'] += 1
                
        stats_filename = f"new_york_expansion_fixed_stats_{self.timestamp}.json"
        with open(stats_filename, 'w', encoding='utf-8') as f:
            json.dump(stats, f, indent=2, ensure_ascii=False)
            
        print(f"✅ Data saved:")
        print(f"   📄 JSON: {json_filename}")
        print(f"   📊 CSV: {csv_filename}")
        print(f"   📈 Stats: {stats_filename}")
        
        return stats
        
    def run_expansion(self):
        """Run complete New York expansion data collection"""
        print("🗽 STARTING NEW YORK STATE EXPANSION - FIXED VERSION")
        print("=" * 60)
        
        try:
            # Fetch facility data
            raw_facilities = self.fetch_adult_care_facilities()
            
            if not raw_facilities:
                print("❌ No adult care facilities found.")
                return []
                
            # Normalize data
            normalized_facilities = self.normalize_facility_data(raw_facilities)
            
            # Save results
            stats = self.save_data(normalized_facilities)
            
            print("\n🎉 NEW YORK EXPANSION COMPLETE!")
            print(f"📊 Total facilities collected: {stats['total_facilities']}")
            print(f"🏢 Counties covered: {len(stats['by_county'])}")
            print(f"🏥 Care types: {len(stats['by_care_type'])}")
            print(f"📍 Facilities with coordinates: {stats['with_coordinates']}")
            
            print("\n📋 Top counties by facility count:")
            sorted_counties = sorted(stats['by_county'].items(), key=lambda x: x[1], reverse=True)
            for county, count in sorted_counties[:10]:
                print(f"   {county}: {count} facilities")
                
            print("\n🏥 Care types breakdown:")
            for care_type, count in stats['by_care_type'].items():
                print(f"   {care_type}: {count} facilities")
                
            return normalized_facilities
            
        except Exception as e:
            print(f"❌ ERROR: {str(e)}")
            return []

if __name__ == "__main__":
    collector = NewYorkExpansionCollector()
    collector.run_expansion()