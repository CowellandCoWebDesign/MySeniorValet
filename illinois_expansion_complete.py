#!/usr/bin/env python3
"""
ILLINOIS STATE SENIOR LIVING EXPANSION
MySeniorValet.com - Comprehensive Senior Living Facility Data Collection
SOURCE: Illinois Department of Public Health Official Database

Data Source: Illinois Data Portal - Assisted Living Database
URL: https://data.illinois.gov/dataset/379idph_assisted_living_and_shared_housing_licensed_establishments_listing

Target: Complete Illinois coverage (102 counties)
Expected: 600+ assisted living and shared housing facilities
"""

import requests
import json
import csv
from datetime import datetime
import time
import re

class IllinoisExpansionCollector:
    def __init__(self):
        # Use the IDPH interactive portal approach
        self.base_url = "http://www.idph.state.il.us/AssistedLiving/"
        self.facilities = []
        self.timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Illinois has 102 counties
        self.expected_counties = 102
        
    def fetch_illinois_facilities(self):
        """Fetch Illinois facilities from official sources only"""
        print("🏢 Fetching Illinois assisted living facilities from official sources...")
        print("⚠️  GOLDEN RULE: Only verified data from government sources allowed")
        
        # This function should connect to official Illinois Department of Public Health databases
        # No demo or sample data is permitted
        
        sample_facilities = []
        
        print("❌ Demo data has been removed - integration with Illinois IDPH required")
        print("📝 Use Illinois Data Portal or IDPH Facility Lookup for official data")
        
        # TODO: Implement connection to:
        # 1. Illinois Data Portal - Assisted Living Database
        # 2. IDPH Facility Lookup system
        # No demo or placeholder data is permitted
        
        return sample_facilities
            
    def fetch_from_facility_lookup(self):
        """Fetch additional data from IDPH Facility Lookup"""
        print("🔍 Fetching additional data from IDPH Facility Lookup...")
        
        # This would require additional API calls or web scraping
        # of the IDPH Facility Lookup system
        # URL: https://llcs.dph.illinois.gov/s/facility-lookup
        
        # For now, we'll use the main data source
        return []
        
    def normalize_facility_data(self, raw_facilities):
        """Normalize facility data for MySeniorValet format"""
        print("🔧 Normalizing Illinois facility data...")
        
        normalized = []
        
        for facility in raw_facilities:
            # Determine care types
            care_types = ['Assisted Living']
            
            # Add specialized care types
            if facility.get('alzheimers_care', 'N').upper() == 'Y':
                care_types.append('Memory Care')
            if facility.get('adult_day_care', 'N').upper() == 'Y':
                care_types.append('Adult Day Care')
                
            # Create normalized facility record
            normalized_facility = {
                'name': facility.get('establishment_name', ''),
                'address': facility.get('address', ''),
                'city': facility.get('city', ''),
                'state': 'IL',
                'zip_code': self.clean_zip(facility.get('zip_code', '')),
                'county': facility.get('county', ''),
                'phone': self.clean_phone(facility.get('phone', '')),
                'care_types': care_types,
                'facility_type': 'Senior Living Community',
                'description': f"Licensed assisted living facility in {facility.get('city', 'Illinois')}",
                'units': int(facility.get('units', 0)) if facility.get('units') else None,
                'license_number': facility.get('license_number', ''),
                'alzheimers_care': facility.get('alzheimers_care', 'N').upper() == 'Y',
                'adult_day_care': facility.get('adult_day_care', 'N').upper() == 'Y',
                'data_source': 'IL_DPH_Official',
                'verification_status': 'Government_Verified',
                'last_updated': datetime.now().isoformat()
            }
            
            # Only include facilities with valid names and cities
            if normalized_facility['name'] and normalized_facility['city']:
                normalized.append(normalized_facility)
                
        return normalized
        
    def clean_phone(self, phone_str):
        """Clean phone number format"""
        if not phone_str:
            return ''
            
        # Remove all non-digit characters
        digits = re.sub(r'\D', '', str(phone_str))
        
        # Format as (XXX) XXX-XXXX if 10 digits
        if len(digits) == 10:
            return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
        elif len(digits) == 11 and digits[0] == '1':
            return f"({digits[1:4]}) {digits[4:7]}-{digits[7:]}"
        
        return str(phone_str)
        
    def clean_zip(self, zip_code):
        """Clean ZIP code format"""
        if not zip_code:
            return ''
            
        # Extract first 5 digits
        digits = re.sub(r'\D', '', str(zip_code))
        return digits[:5] if len(digits) >= 5 else str(zip_code)
        
    def save_data(self, facilities):
        """Save facility data to files"""
        print("💾 Saving Illinois expansion data...")
        
        # Save as JSON
        json_filename = f"illinois_facilities_{self.timestamp}.json"
        with open(json_filename, 'w', encoding='utf-8') as f:
            json.dump(facilities, f, indent=2, ensure_ascii=False)
            
        # Save as CSV
        csv_filename = f"illinois_facilities_{self.timestamp}.csv"
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
            'with_alzheimers_care': 0,
            'with_adult_day_care': 0,
            'data_collection_date': datetime.now().isoformat(),
            'data_source': 'IL_Department_of_Public_Health_Official'
        }
        
        # Generate statistics
        for facility in facilities:
            county = facility.get('county', 'Unknown')
            stats['by_county'][county] = stats['by_county'].get(county, 0) + 1
            
            for care_type in facility.get('care_types', []):
                stats['by_care_type'][care_type] = stats['by_care_type'].get(care_type, 0) + 1
                
            if facility.get('alzheimers_care', False):
                stats['with_alzheimers_care'] += 1
            if facility.get('adult_day_care', False):
                stats['with_adult_day_care'] += 1
                
        stats_filename = f"illinois_expansion_stats_{self.timestamp}.json"
        with open(stats_filename, 'w', encoding='utf-8') as f:
            json.dump(stats, f, indent=2, ensure_ascii=False)
            
        print(f"✅ Data saved:")
        print(f"   📄 JSON: {json_filename}")
        print(f"   📊 CSV: {csv_filename}")
        print(f"   📈 Stats: {stats_filename}")
        
        return stats
        
    def run_expansion(self):
        """Run complete Illinois expansion data collection"""
        print("🌽 STARTING ILLINOIS STATE EXPANSION")
        print("=" * 50)
        
        try:
            # Fetch facility data
            raw_facilities = self.fetch_illinois_facilities()
            
            if not raw_facilities:
                print("❌ No facilities found. Check API endpoint.")
                return []
                
            # Normalize data
            normalized_facilities = self.normalize_facility_data(raw_facilities)
            
            # Save results
            stats = self.save_data(normalized_facilities)
            
            print("\n🎉 ILLINOIS EXPANSION COMPLETE!")
            print(f"📊 Total facilities collected: {stats['total_facilities']}")
            print(f"🏢 Counties covered: {len(stats['by_county'])}")
            print(f"🏥 Care types: {len(stats['by_care_type'])}")
            print(f"🧠 Alzheimer's care available: {stats['with_alzheimers_care']}")
            print(f"🌅 Adult day care available: {stats['with_adult_day_care']}")
            
            print("\n📋 Top counties by facility count:")
            sorted_counties = sorted(stats['by_county'].items(), key=lambda x: x[1], reverse=True)
            for county, count in sorted_counties[:10]:
                print(f"   {county}: {count} facilities")
                
            return normalized_facilities
            
        except Exception as e:
            print(f"❌ ERROR: {str(e)}")
            return []

if __name__ == "__main__":
    collector = IllinoisExpansionCollector()
    collector.run_expansion()