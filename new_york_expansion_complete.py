#!/usr/bin/env python3
"""
NEW YORK STATE SENIOR LIVING EXPANSION
MySeniorValet.com - Comprehensive Adult Care Facility Data Collection
SOURCE: NY Department of Health Official Databases

Data Sources:
1. Health Facility Certification Information: https://health.data.ny.gov/Health/Health-Facility-Certification-Information/2g9y-7kqm
2. Health Facility General Information: https://health.data.ny.gov/Health/Health-Facility-General-Information/vn5v-hh5r

Target: Complete New York State coverage (62 counties)
Expected: 1,000+ adult care facilities
"""

import requests
import json
import csv
from datetime import datetime
import time
import re

class NewYorkExpansionCollector:
    def __init__(self):
        self.base_url = "https://health.data.ny.gov/resource/"
        self.certification_endpoint = "2g9y-7kqm.json"
        self.general_info_endpoint = "vn5v-hh5r.json"
        self.facilities = []
        self.timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
    def fetch_certification_data(self):
        """Fetch facility certification data from NY DOH"""
        print("📊 Fetching NY facility certification data...")
        
        # Adult Care Facility types we want
        acf_types = [
            "Adult Care Facility",
            "Adult Home", 
            "Assisted Living Residence",
            "Assisted Living Program",
            "Enhanced Assisted Living Residence",
            "Special Needs Assisted Living Residence",
            "Enriched Housing Program"
        ]
        
        certifications = []
        
        # Fetch all facility certification data
        offset = 0
        limit = 1000
        
        while True:
            url = f"{self.base_url}{self.certification_endpoint}?$limit={limit}&$offset={offset}"
            
            response = requests.get(url)
            if response.status_code != 200:
                print(f"❌ Error fetching certification data: {response.status_code}")
                break
                
            data = response.json()
            if not data:
                break
                
            # Filter for adult care facilities
            for cert in data:
                facility_type = cert.get('facility_type', '')
                if any(acf_type in facility_type for acf_type in acf_types):
                    certifications.append(cert)
                    
            print(f"✅ Fetched {len(data)} certification records (offset {offset})")
            offset += limit
            
            if len(data) < limit:
                break
                
        print(f"🏢 Found {len(certifications)} adult care facility certifications")
        return certifications
        
    def fetch_general_info_data(self):
        """Fetch general facility information from NY DOH"""
        print("📋 Fetching NY facility general information...")
        
        general_info = []
        offset = 0
        limit = 1000
        
        while True:
            url = f"{self.base_url}{self.general_info_endpoint}?$limit={limit}&$offset={offset}"
            
            response = requests.get(url)
            if response.status_code != 200:
                print(f"❌ Error fetching general info: {response.status_code}")
                break
                
            data = response.json()
            if not data:
                break
                
            general_info.extend(data)
            print(f"✅ Fetched {len(data)} general info records (offset {offset})")
            offset += limit
            
            if len(data) < limit:
                break
                
        print(f"📊 Found {len(general_info)} facility general info records")
        return general_info
        
    def merge_facility_data(self, certifications, general_info):
        """Merge certification and general info data by facility ID"""
        print("🔄 Merging facility datasets...")
        
        # Create lookup dictionary for general info
        general_lookup = {}
        for info in general_info:
            facility_id = info.get('facility_id')
            if facility_id:
                general_lookup[facility_id] = info
                
        facilities = []
        processed_ids = set()
        
        # Process certifications and merge with general info
        for cert in certifications:
            facility_id = cert.get('facility_id')
            if not facility_id or facility_id in processed_ids:
                continue
                
            processed_ids.add(facility_id)
            
            # Get general info for this facility
            general = general_lookup.get(facility_id, {})
            
            # Extract facility data
            facility = {
                'facility_id': facility_id,
                'name': general.get('facility_name', cert.get('facility_name', '')),
                'address': general.get('street_address', ''),
                'city': general.get('city', ''),
                'state': 'NY',
                'zip_code': general.get('zip_code', ''),
                'county': general.get('county', ''),
                'phone': general.get('phone_number', ''),
                'facility_type': cert.get('facility_type', ''),
                'operator': cert.get('operator_name', ''),
                'certificate_number': cert.get('operating_certificate_number', ''),
                'beds': general.get('capacity', 0),
                'license_status': cert.get('license_status', ''),
                'description': f"Licensed {cert.get('facility_type', 'adult care facility')} in {general.get('city', 'New York')}",
                'data_source': 'NY_DOH',
                'last_updated': datetime.now().isoformat()
            }
            
            # Clean and validate data
            if facility['name'] and facility['city']:
                facilities.append(facility)
                
        print(f"✅ Merged {len(facilities)} complete facility records")
        return facilities
        
    def normalize_facility_data(self, facilities):
        """Normalize facility data for MySeniorValet format"""
        print("🔧 Normalizing facility data...")
        
        normalized = []
        
        for facility in facilities:
            # Determine care type from facility type
            care_types = []
            facility_type = facility.get('facility_type', '').lower()
            
            if 'assisted living' in facility_type:
                care_types.append('Assisted Living')
            if 'adult home' in facility_type:
                care_types.append('Adult Home')
            if 'enriched housing' in facility_type:
                care_types.append('Enriched Housing')
            if 'special needs' in facility_type:
                care_types.append('Memory Care')
                
            if not care_types:
                care_types = ['Senior Living']
                
            # Create normalized facility record
            normalized_facility = {
                'name': facility['name'],
                'address': facility['address'],
                'city': facility['city'],
                'state': 'NY',
                'zip_code': facility['zip_code'][:5] if facility['zip_code'] else '',
                'county': facility['county'],
                'phone': self.clean_phone(facility['phone']),
                'care_types': care_types,
                'facility_type': 'Senior Living Community',
                'description': facility['description'],
                'beds': int(facility['beds']) if facility['beds'] else None,
                'license_status': facility['license_status'],
                'certificate_number': facility['certificate_number'],
                'operator': facility['operator'],
                'data_source': 'NY_DOH_Official',
                'verification_status': 'Government_Verified',
                'last_updated': facility['last_updated']
            }
            
            normalized.append(normalized_facility)
            
        print(f"✅ Normalized {len(normalized)} facility records")
        return normalized
        
    def clean_phone(self, phone_str):
        """Clean phone number format"""
        if not phone_str:
            return ''
            
        # Remove all non-digit characters
        digits = re.sub(r'\D', '', phone_str)
        
        # Format as (XXX) XXX-XXXX if 10 digits
        if len(digits) == 10:
            return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
        elif len(digits) == 11 and digits[0] == '1':
            return f"({digits[1:4]}) {digits[4:7]}-{digits[7:]}"
        
        return phone_str
        
    def save_data(self, facilities):
        """Save facility data to files"""
        print("💾 Saving New York expansion data...")
        
        # Save as JSON
        json_filename = f"new_york_facilities_{self.timestamp}.json"
        with open(json_filename, 'w', encoding='utf-8') as f:
            json.dump(facilities, f, indent=2, ensure_ascii=False)
            
        # Save as CSV
        csv_filename = f"new_york_facilities_{self.timestamp}.csv"
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
            'data_collection_date': datetime.now().isoformat(),
            'data_source': 'NY_Department_of_Health_Official'
        }
        
        # Generate statistics
        for facility in facilities:
            county = facility.get('county', 'Unknown')
            stats['by_county'][county] = stats['by_county'].get(county, 0) + 1
            
            for care_type in facility.get('care_types', []):
                stats['by_care_type'][care_type] = stats['by_care_type'].get(care_type, 0) + 1
                
        stats_filename = f"new_york_expansion_stats_{self.timestamp}.json"
        with open(stats_filename, 'w', encoding='utf-8') as f:
            json.dump(stats, f, indent=2, ensure_ascii=False)
            
        print(f"✅ Data saved:")
        print(f"   📄 JSON: {json_filename}")
        print(f"   📊 CSV: {csv_filename}")
        print(f"   📈 Stats: {stats_filename}")
        
        return stats
        
    def run_expansion(self):
        """Run complete New York expansion data collection"""
        print("🗽 STARTING NEW YORK STATE EXPANSION")
        print("=" * 50)
        
        try:
            # Fetch data from both NY DOH endpoints
            certifications = self.fetch_certification_data()
            general_info = self.fetch_general_info_data()
            
            # Merge and normalize data
            facilities = self.merge_facility_data(certifications, general_info)
            normalized_facilities = self.normalize_facility_data(facilities)
            
            # Save results
            stats = self.save_data(normalized_facilities)
            
            print("\n🎉 NEW YORK EXPANSION COMPLETE!")
            print(f"📊 Total facilities collected: {stats['total_facilities']}")
            print(f"🏢 Counties covered: {len(stats['by_county'])}")
            print(f"🏥 Care types: {len(stats['by_care_type'])}")
            print("\n📋 Top counties by facility count:")
            
            sorted_counties = sorted(stats['by_county'].items(), key=lambda x: x[1], reverse=True)
            for county, count in sorted_counties[:10]:
                print(f"   {county}: {count} facilities")
                
            return normalized_facilities
            
        except Exception as e:
            print(f"❌ ERROR: {str(e)}")
            return []

if __name__ == "__main__":
    collector = NewYorkExpansionCollector()
    collector.run_expansion()