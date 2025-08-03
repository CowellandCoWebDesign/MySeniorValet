#!/usr/bin/env python3
"""
Comprehensive US Hospital Data Collector
Systematic nationwide hospital data collection from CMS Hospital Compare
and other authentic government data sources.
"""

import requests
import csv
import json
import time
import os
import sys
from typing import Dict, List, Optional
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('hospital_collection.log'),
        logging.StreamHandler()
    ]
)

class HospitalDataCollector:
    """Collects hospital data from CMS and other government sources"""
    
    def __init__(self):
        self.base_url = "https://data.cms.gov/api"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'MySeniorValet-Research/1.0 (Contact: hello@myseniorvalet.com)'
        })
        
        # Database connection
        self.db_connection = None
        self.setup_database_connection()
        
        # State-by-state collection tracking
        self.us_states = [
            'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
            'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
            'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
            'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
            'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
        ]
        
        # Data collection endpoints
        self.endpoints = {
            'hospital_general': '/1/data/hospital-general-info',
            'hospital_ownership': '/1/data/hospital-ownership',
            'hospital_ratings': '/1/data/hospital-overall-rating',
            'provider_info': '/1/data/provider-of-services-current-data',
            'quality_measures': '/1/data/hospital-value-based-purchasing-hvbp'
        }

    def setup_database_connection(self):
        """Setup PostgreSQL database connection"""
        try:
            db_url = os.environ.get('DATABASE_URL')
            if not db_url:
                raise ValueError("DATABASE_URL environment variable not set")
            
            self.db_connection = psycopg2.connect(db_url)
            self.db_connection.autocommit = True
            logging.info("Database connection established")
            
        except Exception as e:
            logging.error(f"Database connection failed: {e}")
            sys.exit(1)

    def fetch_cms_hospital_data(self, endpoint: str, filters: Dict = None) -> List[Dict]:
        """Fetch hospital data from CMS API"""
        try:
            url = f"{self.base_url}{endpoint}"
            params = {
                '$limit': 1000,
                '$offset': 0
            }
            
            if filters:
                params.update(filters)
            
            all_data = []
            
            while True:
                logging.info(f"Fetching data from {url} with offset {params['$offset']}")
                response = self.session.get(url, params=params, timeout=30)
                response.raise_for_status()
                
                data = response.json()
                if not data:
                    break
                    
                all_data.extend(data)
                
                if len(data) < params['$limit']:
                    break
                    
                params['$offset'] += params['$limit']
                time.sleep(0.5)  # Rate limiting
                
            logging.info(f"Collected {len(all_data)} records from {endpoint}")
            return all_data
            
        except requests.exceptions.RequestException as e:
            logging.error(f"Error fetching data from {endpoint}: {e}")
            return []
        except Exception as e:
            logging.error(f"Unexpected error: {e}")
            return []

    def collect_hospital_general_info(self, state: str = None) -> List[Dict]:
        """Collect general hospital information"""
        filters = {}
        if state:
            filters['state'] = state
            
        return self.fetch_cms_hospital_data(
            self.endpoints['hospital_general'],
            filters
        )

    def collect_hospital_ratings(self, state: str = None) -> List[Dict]:
        """Collect hospital quality ratings"""
        filters = {}
        if state:
            filters['state'] = state
            
        return self.fetch_cms_hospital_data(
            self.endpoints['hospital_ratings'],
            filters
        )

    def collect_provider_data(self, state: str = None) -> List[Dict]:
        """Collect provider of services data"""
        filters = {}
        if state:
            filters['state'] = state
            
        return self.fetch_cms_hospital_data(
            self.endpoints['provider_info'],
            filters
        )

    def process_hospital_data(self, general_info: List[Dict], ratings: List[Dict], provider_data: List[Dict]) -> List[Dict]:
        """Process and merge hospital data from multiple sources"""
        
        # Create lookup dictionaries
        ratings_lookup = {item.get('provider_id'): item for item in ratings if item.get('provider_id')}
        provider_lookup = {item.get('cms_certification_num'): item for item in provider_data if item.get('cms_certification_num')}
        
        processed_hospitals = []
        
        for hospital in general_info:
            provider_id = hospital.get('provider_id')
            if not provider_id:
                continue
                
            # Get additional data
            rating_data = ratings_lookup.get(provider_id, {})
            provider_info = provider_lookup.get(provider_id, {})
            
            # Process hospital data
            processed_hospital = self.create_hospital_record(hospital, rating_data, provider_info)
            if processed_hospital:
                processed_hospitals.append(processed_hospital)
                
        return processed_hospitals

    def create_hospital_record(self, general: Dict, rating: Dict, provider: Dict) -> Optional[Dict]:
        """Create a standardized hospital record"""
        try:
            # Extract basic information
            name = general.get('hospital_name', '').strip()
            if not name:
                return None
                
            # Create slug for URL
            slug = self.create_slug(name)
            
            # Geographic data
            address = general.get('address', '').strip()
            city = general.get('city', '').strip()
            state = general.get('state', '').strip()
            zip_code = general.get('zip_code', '').strip()
            
            # Hospital classification
            hospital_type = self.map_hospital_type(general.get('hospital_type', ''))
            ownership = self.map_ownership_type(general.get('hospital_ownership', ''))
            
            # Services and specialties
            services = self.extract_services(general)
            specialties = self.extract_specialties(general)
            
            # Quality metrics
            cms_rating = self.safe_int(rating.get('hospital_overall_rating'))
            mortality_rating = rating.get('mortality_national_comparison', '').strip()
            safety_rating = rating.get('safety_of_care_national_comparison', '').strip()
            readmission_rating = rating.get('readmission_national_comparison', '').strip()
            experience_rating = rating.get('patient_experience_national_comparison', '').strip()
            
            # Contact information
            phone = general.get('phone_number', '').strip()
            
            # Create standardized record
            hospital_record = {
                'name': name,
                'slug': slug,
                'description': f"Hospital located in {city}, {state}",
                'address': address,
                'city': city,
                'state': state,
                'zip_code': zip_code,
                'county': provider.get('county_name', '').strip(),
                'phone': phone if phone else None,
                'website': None,  # Not typically available in CMS data
                'latitude': self.safe_float(general.get('latitude')),
                'longitude': self.safe_float(general.get('longitude')),
                'hospital_type': hospital_type,
                'ownership': ownership,
                'services': services,
                'specialties': specialties,
                'trauma_level': None,  # Requires additional data source
                'emergency_services': general.get('emergency_services', '').lower() == 'yes',
                'bed_count': self.safe_int(provider.get('total_beds')),
                'total_discharges': None,
                'patient_days': None,
                'gross_charges': None,
                'cms_rating': cms_rating,
                'mortality_rating': self.normalize_rating(mortality_rating),
                'safety_rating': self.normalize_rating(safety_rating),
                'readmission_rating': self.normalize_rating(readmission_rating),
                'experience_rating': self.normalize_rating(experience_rating),
                'insurance_accepted': ['Medicare', 'Medicaid'],  # Default assumption
                'network_affiliations': [],
                'cms_provider_number': general.get('provider_id'),
                'npi_number': None,
                'is_active': True,
                'is_certified': True,
                'data_source': 'CMS Hospital Compare',
                'last_verified': datetime.now(),
                'verification_status': 'Verified',
                'search_terms': self.create_search_terms(name, city, state, services),
                'tags': self.create_tags(hospital_type, services, rating),
                'average_stay': None,
                'occupancy_rate': None,
                'emergency_phone': phone if general.get('emergency_services', '').lower() == 'yes' else None,
                'operating_hours': {'emergency': '24/7' if general.get('emergency_services', '').lower() == 'yes' else None}
            }
            
            return hospital_record
            
        except Exception as e:
            logging.error(f"Error creating hospital record: {e}")
            return None

    def create_slug(self, name: str) -> str:
        """Create URL-safe slug from hospital name"""
        import re
        slug = re.sub(r'[^a-zA-Z0-9\s-]', '', name.lower())
        slug = re.sub(r'\s+', '-', slug)
        slug = re.sub(r'-+', '-', slug)
        return slug.strip('-')

    def map_hospital_type(self, hospital_type: str) -> str:
        """Map CMS hospital type to our schema"""
        type_mapping = {
            'short term acute care': 'General Acute Care',
            'critical access': 'Critical Access',
            'childrens': "Children's Hospital",
            'psychiatric': 'Psychiatric',
            'rehabilitation': 'Rehabilitation',
            'long term care': 'Long-term Care'
        }
        
        hospital_type_lower = hospital_type.lower()
        for key, value in type_mapping.items():
            if key in hospital_type_lower:
                return value
        
        return 'General Acute Care'  # Default

    def map_ownership_type(self, ownership: str) -> Optional[str]:
        """Map ownership to our schema"""
        ownership_mapping = {
            'government - federal': 'Government - Federal',
            'government - state': 'Government - State',
            'government - local': 'Government - Local',
            'proprietary': 'Private - For Profit',
            'voluntary non-profit - private': 'Private - Non-profit',
            'voluntary non-profit - church': 'Private - Church Related'
        }
        
        return ownership_mapping.get(ownership.lower())

    def extract_services(self, hospital_data: Dict) -> List[str]:
        """Extract services from hospital data"""
        services = []
        
        if hospital_data.get('emergency_services', '').lower() == 'yes':
            services.append('Emergency Services')
            
        # Add more service extraction logic based on available data
        return services

    def extract_specialties(self, hospital_data: Dict) -> List[str]:
        """Extract specialties from hospital data"""
        # This would require additional data sources or manual mapping
        return []

    def create_search_terms(self, name: str, city: str, state: str, services: List[str]) -> List[str]:
        """Create search terms for the hospital"""
        terms = [name.lower(), city.lower(), state.lower()]
        terms.extend([service.lower() for service in services])
        return list(set(terms))

    def create_tags(self, hospital_type: str, services: List[str], rating: Dict) -> List[str]:
        """Create tags for the hospital"""
        tags = [hospital_type]
        
        if 'Emergency Services' in services:
            tags.append('Emergency Care')
            
        cms_rating = self.safe_int(rating.get('hospital_overall_rating'))
        if cms_rating and cms_rating >= 4:
            tags.append('High Quality')
            
        return tags

    def safe_int(self, value) -> Optional[int]:
        """Safely convert value to integer"""
        if value is None or value == '':
            return None
        try:
            return int(float(value))
        except (ValueError, TypeError):
            return None

    def safe_float(self, value) -> Optional[float]:
        """Safely convert value to float"""
        if value is None or value == '':
            return None
        try:
            return float(value)
        except (ValueError, TypeError):
            return None

    def normalize_rating(self, rating: str) -> Optional[str]:
        """Normalize rating comparison to our schema"""
        if not rating:
            return None
            
        rating_lower = rating.lower()
        if 'below' in rating_lower or 'worse' in rating_lower:
            return 'Below'
        elif 'above' in rating_lower or 'better' in rating_lower:
            return 'Above'
        elif 'same' in rating_lower or 'average' in rating_lower:
            return 'Same'
        
        return None

    def insert_hospitals_to_database(self, hospitals: List[Dict], state: str):
        """Insert hospital records into PostgreSQL database"""
        if not hospitals:
            logging.warning(f"No hospitals to insert for state {state}")
            return
            
        try:
            cursor = self.db_connection.cursor()
            
            insert_query = """
            INSERT INTO hospitals (
                name, slug, description, address, city, state, zip_code, county,
                phone, website, latitude, longitude, hospital_type, ownership,
                services, specialties, trauma_level, emergency_services,
                bed_count, cms_rating, mortality_rating, safety_rating,
                readmission_rating, experience_rating, insurance_accepted,
                network_affiliations, cms_provider_number, is_active,
                is_certified, data_source, last_verified, verification_status,
                search_terms, tags, emergency_phone, operating_hours
            ) VALUES (
                %(name)s, %(slug)s, %(description)s, %(address)s, %(city)s,
                %(state)s, %(zip_code)s, %(county)s, %(phone)s, %(website)s,
                %(latitude)s, %(longitude)s, %(hospital_type)s, %(ownership)s,
                %(services)s, %(specialties)s, %(trauma_level)s, %(emergency_services)s,
                %(bed_count)s, %(cms_rating)s, %(mortality_rating)s, %(safety_rating)s,
                %(readmission_rating)s, %(experience_rating)s, %(insurance_accepted)s,
                %(network_affiliations)s, %(cms_provider_number)s, %(is_active)s,
                %(is_certified)s, %(data_source)s, %(last_verified)s, %(verification_status)s,
                %(search_terms)s, %(tags)s, %(emergency_phone)s, %(operating_hours)s
            ) ON CONFLICT (cms_provider_number) DO UPDATE SET
                name = EXCLUDED.name,
                description = EXCLUDED.description,
                address = EXCLUDED.address,
                city = EXCLUDED.city,
                county = EXCLUDED.county,
                phone = EXCLUDED.phone,
                latitude = EXCLUDED.latitude,
                longitude = EXCLUDED.longitude,
                hospital_type = EXCLUDED.hospital_type,
                ownership = EXCLUDED.ownership,
                services = EXCLUDED.services,
                emergency_services = EXCLUDED.emergency_services,
                bed_count = EXCLUDED.bed_count,
                cms_rating = EXCLUDED.cms_rating,
                mortality_rating = EXCLUDED.mortality_rating,
                safety_rating = EXCLUDED.safety_rating,
                readmission_rating = EXCLUDED.readmission_rating,
                experience_rating = EXCLUDED.experience_rating,
                last_verified = EXCLUDED.last_verified,
                search_terms = EXCLUDED.search_terms,
                tags = EXCLUDED.tags,
                updated_at = NOW()
            """
            
            successful_inserts = 0
            
            for hospital in hospitals:
                try:
                    cursor.execute(insert_query, hospital)
                    successful_inserts += 1
                except Exception as e:
                    logging.error(f"Error inserting hospital {hospital.get('name', 'Unknown')}: {e}")
                    continue
            
            logging.info(f"Successfully inserted/updated {successful_inserts} hospitals for state {state}")
            
            # Save progress to file
            self.save_collection_progress(state, successful_inserts)
            
        except Exception as e:
            logging.error(f"Database insertion error for state {state}: {e}")
        finally:
            cursor.close()

    def save_collection_progress(self, state: str, count: int):
        """Save collection progress to JSON file"""
        progress_file = 'hospital_collection_progress.json'
        
        try:
            if os.path.exists(progress_file):
                with open(progress_file, 'r') as f:
                    progress = json.load(f)
            else:
                progress = {}
            
            progress[state] = {
                'collected_at': datetime.now().isoformat(),
                'hospital_count': count,
                'status': 'completed'
            }
            
            with open(progress_file, 'w') as f:
                json.dump(progress, f, indent=2)
                
        except Exception as e:
            logging.error(f"Error saving progress: {e}")

    def collect_hospitals_by_state(self, state: str):
        """Collect all hospitals for a specific state"""
        logging.info(f"Starting hospital collection for state: {state}")
        
        try:
            # Collect data from multiple sources
            general_info = self.collect_hospital_general_info(state)
            ratings = self.collect_hospital_ratings(state)
            provider_data = self.collect_provider_data(state)
            
            # Process and merge data
            hospitals = self.process_hospital_data(general_info, ratings, provider_data)
            
            # Insert into database
            self.insert_hospitals_to_database(hospitals, state)
            
            logging.info(f"Completed hospital collection for state: {state}")
            return len(hospitals)
            
        except Exception as e:
            logging.error(f"Error collecting hospitals for state {state}: {e}")
            return 0

    def collect_all_us_hospitals(self):
        """Systematically collect hospitals for all US states"""
        logging.info("Starting comprehensive US hospital collection")
        
        total_hospitals = 0
        
        for state in self.us_states:
            logging.info(f"Processing state {state} ({self.us_states.index(state) + 1}/{len(self.us_states)})")
            
            try:
                count = self.collect_hospitals_by_state(state)
                total_hospitals += count
                
                # Rate limiting between states
                time.sleep(2)
                
            except Exception as e:
                logging.error(f"Failed to process state {state}: {e}")
                continue
        
        logging.info(f"Hospital collection completed. Total hospitals collected: {total_hospitals}")
        return total_hospitals

def main():
    """Main execution function"""
    collector = HospitalDataCollector()
    
    # Check if specific state provided as argument
    if len(sys.argv) > 1:
        state = sys.argv[1].upper()
        if state in collector.us_states:
            collector.collect_hospitals_by_state(state)
        else:
            print(f"Invalid state: {state}")
            print(f"Valid states: {', '.join(collector.us_states)}")
    else:
        # Collect all hospitals
        collector.collect_all_us_hospitals()

if __name__ == "__main__":
    main()