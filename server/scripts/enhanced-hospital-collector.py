#!/usr/bin/env python3
"""
Enhanced Hospital Data Collector
Collects hospital data from multiple sources including NPI Registry and Hospital Compare datasets
"""

import requests
import json
import time
import logging
import psycopg2
import os
from datetime import datetime
import csv
import re
from typing import Dict, List, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class EnhancedHospitalCollector:
    def __init__(self):
        self.db_url = os.getenv('DATABASE_URL')
        if not self.db_url:
            raise ValueError("DATABASE_URL environment variable not set")
        
        # API endpoints
        self.npi_api = "https://npiregistry.cms.hhs.gov/api/"
        self.hospital_compare_api = "https://data.medicare.gov/api/views/"
        
        # Rate limiting
        self.request_delay = 1.0  # seconds between requests
        
    def connect_db(self):
        """Connect to PostgreSQL database"""
        try:
            conn = psycopg2.connect(self.db_url)
            logger.info("Database connection established")
            return conn
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            raise

    def search_hospitals_npi(self, state: str, limit: int = 200) -> List[Dict]:
        """Search for hospitals using NPI Registry API"""
        hospitals = []
        
        try:
            # NPI API endpoint for organizations
            url = f"{self.npi_api}?version=2.1&enumeration_type=NPI-2&taxonomy_description=General Acute Care Hospital&address_purpose=location&state={state}&limit={limit}"
            
            logger.info(f"Fetching hospitals from NPI Registry for state: {state}")
            response = requests.get(url, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                
                if 'results' in data:
                    for result in data['results']:
                        try:
                            hospital = self.parse_npi_hospital(result)
                            if hospital:
                                hospitals.append(hospital)
                        except Exception as e:
                            logger.warning(f"Failed to parse hospital: {e}")
                            continue
                            
                logger.info(f"Found {len(hospitals)} hospitals for state {state}")
            else:
                logger.warning(f"NPI API returned status {response.status_code} for state {state}")
                
        except Exception as e:
            logger.error(f"Error fetching hospitals for state {state}: {e}")
            
        time.sleep(self.request_delay)
        return hospitals

    def parse_npi_hospital(self, npi_data: Dict) -> Optional[Dict]:
        """Parse hospital data from NPI Registry response"""
        try:
            basic = npi_data.get('basic', {})
            addresses = npi_data.get('addresses', [])
            
            # Get practice location address
            address_info = None
            for addr in addresses:
                if addr.get('address_purpose') == 'LOCATION':
                    address_info = addr
                    break
            
            if not address_info:
                address_info = addresses[0] if addresses else {}
            
            # Extract basic information
            name = basic.get('organization_name', '').strip()
            if not name:
                return None
                
            # Create slug from name
            slug = re.sub(r'[^a-zA-Z0-9\s-]', '', name.lower())
            slug = re.sub(r'[\s-]+', '-', slug).strip('-')
            
            # Extract services and specialties from taxonomies
            services = []
            specialties = []
            
            taxonomies = npi_data.get('taxonomies', [])
            for taxonomy in taxonomies:
                desc = taxonomy.get('desc', '')
                if desc and desc not in services:
                    if 'hospital' in desc.lower() or 'medical' in desc.lower():
                        services.append(desc)
                    else:
                        specialties.append(desc)
            
            # Default services if none found
            if not services:
                services = [
                    "Emergency Services",
                    "Inpatient Care",
                    "Outpatient Services",
                    "Diagnostic Imaging"
                ]
            
            hospital = {
                'name': name,
                'slug': slug,
                'description': f"{name} is a healthcare facility providing comprehensive medical services to the community.",
                'address': address_info.get('address_1', ''),
                'city': address_info.get('city', ''),
                'state': address_info.get('state', ''),
                'zip_code': address_info.get('postal_code', ''),
                'county': address_info.get('country_name', ''),
                'phone': address_info.get('telephone_number'),
                'hospital_type': self.determine_hospital_type(name, services),
                'ownership': self.determine_ownership(name),
                'services': services[:10],  # Limit to 10 services
                'specialties': specialties[:8],  # Limit to 8 specialties
                'emergency_services': True,  # Most hospitals have emergency services
                'teaching_hospital': self.is_teaching_hospital(name),
                'tags': self.generate_tags(name, services, specialties)
            }
            
            return hospital
            
        except Exception as e:
            logger.error(f"Error parsing NPI hospital data: {e}")
            return None

    def determine_hospital_type(self, name: str, services: List[str]) -> str:
        """Determine hospital type based on name and services"""
        name_lower = name.lower()
        
        if any(word in name_lower for word in ['children', 'pediatric', 'kids']):
            return "Children's Hospital"
        elif any(word in name_lower for word in ['veterans', 'va ', 'va medical']):
            return "Veterans Affairs"
        elif any(word in name_lower for word in ['university', 'college', 'medical school']):
            return "Teaching Hospital"
        elif any(word in name_lower for word in ['psychiatric', 'behavioral', 'mental health']):
            return "Psychiatric Hospital"
        elif any(word in name_lower for word in ['rehabilitation', 'rehab']):
            return "Rehabilitation Hospital"
        elif any(word in name_lower for word in ['specialty', 'surgical']):
            return "Specialty Hospital"
        else:
            return "General Acute Care"

    def determine_ownership(self, name: str) -> str:
        """Determine ownership type based on hospital name"""
        name_lower = name.lower()
        
        if any(word in name_lower for word in ['veterans', 'va ', 'county', 'state', 'city', 'municipal']):
            return "Government - Federal/State/Local"
        elif any(word in name_lower for word in ['saint', 'st.', 'holy', 'sacred', 'baptist', 'methodist', 'presbyterian', 'lutheran', 'catholic']):
            return "Voluntary non-profit - Church"
        elif any(word in name_lower for word in ['university', 'college']):
            return "Voluntary non-profit - Other"
        else:
            return "Proprietary"

    def is_teaching_hospital(self, name: str) -> bool:
        """Determine if hospital is a teaching hospital"""
        name_lower = name.lower()
        return any(word in name_lower for word in ['university', 'college', 'medical school', 'teaching'])

    def generate_tags(self, name: str, services: List[str], specialties: List[str]) -> List[str]:
        """Generate tags based on hospital information"""
        tags = []
        name_lower = name.lower()
        
        if any(word in name_lower for word in ['trauma', 'level']):
            tags.append('Trauma Center')
        if any(word in name_lower for word in ['cancer', 'oncology']):
            tags.append('Cancer Care')
        if any(word in name_lower for word in ['heart', 'cardiac', 'cardiovascular']):
            tags.append('Heart Care')
        if any(word in name_lower for word in ['women', "women's"]):
            tags.append("Women's Health")
        if any(word in name_lower for word in ['children', 'pediatric']):
            tags.append('Pediatric Care')
        if any(word in name_lower for word in ['emergency', 'er']):
            tags.append('Emergency Care')
        
        return tags

    def get_major_hospitals(self) -> List[Dict]:
        """Get data for major well-known hospitals"""
        major_hospitals = [
            {
                'name': 'Mayo Clinic',
                'slug': 'mayo-clinic',
                'description': 'Mayo Clinic is a nonprofit American academic medical center focused on integrated health care, education, and research.',
                'address': '200 First St SW',
                'city': 'Rochester',
                'state': 'MN',
                'zip_code': '55905',
                'county': 'Olmsted County',
                'phone': '(507) 284-2511',
                'hospital_type': 'Teaching Hospital',
                'ownership': 'Voluntary non-profit - Other',
                'services': ['Transplant Services', 'Cancer Care', 'Cardiovascular Surgery', 'Neurosurgery', 'Orthopedics', 'Emergency Services'],
                'specialties': ['Oncology', 'Cardiology', 'Neurology', 'Orthopedic Surgery', 'Gastroenterology'],
                'trauma_level': 'Level I',
                'emergency_services': True,
                'bed_count': 1265,
                'cms_rating': 5,
                'teaching_hospital': True,
                'magnet': True,
                'joint_commission': True,
                'tags': ['Trauma Center', 'Cancer Care', 'Heart Care', 'Teaching Hospital']
            },
            {
                'name': 'Johns Hopkins Hospital',
                'slug': 'johns-hopkins-hospital',
                'description': 'Johns Hopkins Hospital is a teaching hospital and biomedical research facility located in Baltimore, Maryland.',
                'address': '1800 Orleans St',
                'city': 'Baltimore',
                'state': 'MD',
                'zip_code': '21287',
                'county': 'Baltimore City',
                'phone': '(410) 955-5000',
                'hospital_type': 'Teaching Hospital',
                'ownership': 'Voluntary non-profit - Other',
                'services': ['Transplant Services', 'Cancer Care', 'Cardiovascular Surgery', 'Neurosurgery', 'Pediatrics', 'Emergency Services'],
                'specialties': ['Oncology', 'Cardiology', 'Neurology', 'Pediatric Surgery', 'Psychiatry'],
                'trauma_level': 'Level I',
                'emergency_services': True,
                'bed_count': 1154,
                'cms_rating': 5,
                'teaching_hospital': True,
                'magnet': True,
                'joint_commission': True,
                'tags': ['Trauma Center', 'Cancer Care', 'Heart Care', 'Teaching Hospital', 'Pediatric Care']
            },
            {
                'name': 'Massachusetts General Hospital',
                'slug': 'massachusetts-general-hospital',
                'description': 'Massachusetts General Hospital is the original and largest teaching hospital of Harvard Medical School located in Boston, Massachusetts.',
                'address': '55 Fruit St',
                'city': 'Boston',
                'state': 'MA',
                'zip_code': '02114',
                'county': 'Suffolk County',
                'phone': '(617) 726-2000',
                'hospital_type': 'Teaching Hospital',
                'ownership': 'Voluntary non-profit - Other',
                'services': ['Transplant Services', 'Cancer Care', 'Cardiovascular Surgery', 'Neurosurgery', 'Burn Center', 'Emergency Services'],
                'specialties': ['Oncology', 'Cardiology', 'Neurology', 'Orthopedic Surgery', 'Dermatology'],
                'trauma_level': 'Level I',
                'emergency_services': True,
                'bed_count': 999,
                'cms_rating': 5,
                'teaching_hospital': True,
                'magnet': True,
                'joint_commission': True,
                'tags': ['Trauma Center', 'Cancer Care', 'Heart Care', 'Teaching Hospital', 'Burn Center']
            },
            {
                'name': 'UCLA Medical Center',
                'slug': 'ucla-medical-center',
                'description': 'UCLA Medical Center is a hospital located on the campus of the University of California, Los Angeles in Westwood, Los Angeles, California.',
                'address': '757 Westwood Plaza',
                'city': 'Los Angeles',
                'state': 'CA',
                'zip_code': '90095',
                'county': 'Los Angeles County',
                'phone': '(310) 825-9111',
                'hospital_type': 'Teaching Hospital',
                'ownership': 'Government - State',
                'services': ['Transplant Services', 'Cancer Care', 'Cardiovascular Surgery', 'Neurosurgery', 'Pediatrics', 'Emergency Services'],
                'specialties': ['Oncology', 'Cardiology', 'Neurology', 'Pediatric Surgery', 'Urology'],
                'trauma_level': 'Level I',
                'emergency_services': True,
                'bed_count': 520,
                'cms_rating': 4,
                'teaching_hospital': True,
                'magnet': True,
                'joint_commission': True,
                'tags': ['Trauma Center', 'Cancer Care', 'Heart Care', 'Teaching Hospital', 'Pediatric Care']
            },
            {
                'name': 'Houston Methodist Hospital',
                'slug': 'houston-methodist-hospital',
                'description': 'Houston Methodist Hospital is the flagship hospital of Houston Methodist, a leading academic medical center in the Texas Medical Center.',
                'address': '6565 Fannin St',
                'city': 'Houston',
                'state': 'TX',
                'zip_code': '77030',
                'county': 'Harris County',
                'phone': '(713) 790-3311',
                'hospital_type': 'Teaching Hospital',
                'ownership': 'Voluntary non-profit - Church',
                'services': ['Transplant Services', 'Cancer Care', 'Cardiovascular Surgery', 'Neurosurgery', 'Orthopedics', 'Emergency Services'],
                'specialties': ['Oncology', 'Cardiology', 'Neurology', 'Orthopedic Surgery', 'Gastroenterology'],
                'trauma_level': 'Level I',
                'emergency_services': True,
                'bed_count': 907,
                'cms_rating': 4,
                'teaching_hospital': True,
                'magnet': True,
                'joint_commission': True,
                'tags': ['Trauma Center', 'Cancer Care', 'Heart Care', 'Teaching Hospital']
            }
        ]
        
        return major_hospitals

    def insert_hospital(self, conn, hospital: Dict) -> bool:
        """Insert hospital into database"""
        try:
            cursor = conn.cursor()
            
            # Convert lists to JSON strings for PostgreSQL
            services_json = json.dumps(hospital.get('services', []))
            specialties_json = json.dumps(hospital.get('specialties', []))
            tags_json = json.dumps(hospital.get('tags', []))
            
            insert_query = """
            INSERT INTO hospitals (
                name, slug, description, address, city, state, zip_code, county,
                phone, website, hospital_type, ownership, services, specialties,
                trauma_level, emergency_services, bed_count, cms_rating,
                mortality_rating, safety_rating, readmission_rating, experience_rating,
                tags, emergency_phone, latitude, longitude, teaching_hospital,
                magnet, joint_commission, is_active, created_at, updated_at
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, TRUE, NOW(), NOW()
            ) ON CONFLICT (slug) DO UPDATE SET
                name = EXCLUDED.name,
                description = EXCLUDED.description,
                address = EXCLUDED.address,
                city = EXCLUDED.city,
                state = EXCLUDED.state,
                zip_code = EXCLUDED.zip_code,
                county = EXCLUDED.county,
                phone = EXCLUDED.phone,
                hospital_type = EXCLUDED.hospital_type,
                ownership = EXCLUDED.ownership,
                services = EXCLUDED.services,
                specialties = EXCLUDED.specialties,
                updated_at = NOW()
            """
            
            cursor.execute(insert_query, (
                hospital.get('name'),
                hospital.get('slug'),
                hospital.get('description'),
                hospital.get('address'),
                hospital.get('city'),
                hospital.get('state'),
                hospital.get('zip_code'),
                hospital.get('county'),
                hospital.get('phone'),
                hospital.get('website'),
                hospital.get('hospital_type'),
                hospital.get('ownership'),
                services_json,
                specialties_json,
                hospital.get('trauma_level'),
                hospital.get('emergency_services', True),
                hospital.get('bed_count'),
                hospital.get('cms_rating'),
                hospital.get('mortality_rating'),
                hospital.get('safety_rating'),
                hospital.get('readmission_rating'),
                hospital.get('experience_rating'),
                tags_json,
                hospital.get('emergency_phone'),
                hospital.get('latitude'),
                hospital.get('longitude'),
                hospital.get('teaching_hospital', False),
                hospital.get('magnet', False),
                hospital.get('joint_commission', True)
            ))
            
            conn.commit()
            cursor.close()
            return True
            
        except Exception as e:
            logger.error(f"Error inserting hospital {hospital.get('name', 'Unknown')}: {e}")
            conn.rollback()
            return False

    def collect_hospitals(self, max_per_state: int = 50):
        """Collect hospitals from multiple sources"""
        conn = self.connect_db()
        total_inserted = 0
        
        try:
            # First, insert major hospitals
            logger.info("Inserting major hospitals...")
            major_hospitals = self.get_major_hospitals()
            
            for hospital in major_hospitals:
                if self.insert_hospital(conn, hospital):
                    total_inserted += 1
                    logger.info(f"Inserted major hospital: {hospital['name']}")
            
            # Then collect from NPI Registry for each state
            states = [
                'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
                'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
                'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
                'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
                'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
            ]
            
            for state in states:
                logger.info(f"Processing state: {state}")
                
                try:
                    hospitals = self.search_hospitals_npi(state, max_per_state)
                    
                    for hospital in hospitals:
                        if self.insert_hospital(conn, hospital):
                            total_inserted += 1
                            
                    logger.info(f"Inserted {len(hospitals)} hospitals for state {state}")
                    
                except Exception as e:
                    logger.error(f"Error processing state {state}: {e}")
                    continue
                
                # Rate limiting between states
                time.sleep(2.0)
            
            logger.info(f"Hospital collection completed. Total hospitals inserted: {total_inserted}")
            
        except Exception as e:
            logger.error(f"Error in hospital collection: {e}")
        finally:
            conn.close()

def main():
    """Main function"""
    try:
        collector = EnhancedHospitalCollector()
        collector.collect_hospitals(max_per_state=25)  # Limit to prevent overwhelming the API
        
    except Exception as e:
        logger.error(f"Application error: {e}")

if __name__ == "__main__":
    main()