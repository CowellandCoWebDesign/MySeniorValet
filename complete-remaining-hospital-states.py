#!/usr/bin/env python3
"""
Complete Hospital Data Collection for Remaining US States
Fills in the missing states to achieve complete nationwide coverage
"""

import requests
import json
import time
import logging
import psycopg2
import os
from datetime import datetime
import re
from typing import Dict, List, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('remaining_states_hospital_collection.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Remaining states to collect
REMAINING_STATES = {
    'PA': {'name': 'Pennsylvania', 'capital': 'Harrisburg', 'major_cities': ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading']},
    'RI': {'name': 'Rhode Island', 'capital': 'Providence', 'major_cities': ['Providence', 'Warwick', 'Cranston', 'Pawtucket']},
    'SC': {'name': 'South Carolina', 'capital': 'Columbia', 'major_cities': ['Charleston', 'Columbia', 'Greenville', 'Myrtle Beach']},
    'SD': {'name': 'South Dakota', 'capital': 'Pierre', 'major_cities': ['Sioux Falls', 'Rapid City', 'Aberdeen', 'Brookings']},
    'TN': {'name': 'Tennessee', 'capital': 'Nashville', 'major_cities': ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville']},
    'TX': {'name': 'Texas', 'capital': 'Austin', 'major_cities': ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth', 'El Paso']},
    'UT': {'name': 'Utah', 'capital': 'Salt Lake City', 'major_cities': ['Salt Lake City', 'Provo', 'Ogden', 'St. George']},
    'VT': {'name': 'Vermont', 'capital': 'Montpelier', 'major_cities': ['Burlington', 'Rutland', 'Montpelier', 'Brattleboro']},
    'VA': {'name': 'Virginia', 'capital': 'Richmond', 'major_cities': ['Virginia Beach', 'Norfolk', 'Richmond', 'Arlington', 'Newport News']},
    'WA': {'name': 'Washington', 'capital': 'Olympia', 'major_cities': ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue']},
    'WV': {'name': 'West Virginia', 'capital': 'Charleston', 'major_cities': ['Charleston', 'Huntington', 'Morgantown', 'Parkersburg']},
    'WI': {'name': 'Wisconsin', 'capital': 'Madison', 'major_cities': ['Milwaukee', 'Madison', 'Green Bay', 'Kenosha', 'Racine']},
    'WY': {'name': 'Wyoming', 'capital': 'Cheyenne', 'major_cities': ['Cheyenne', 'Casper', 'Laramie', 'Gillette']}
}

class RemainingStatesHospitalCollector:
    def __init__(self):
        self.db_url = os.getenv('DATABASE_URL')
        if not self.db_url:
            raise ValueError("DATABASE_URL environment variable not set")
        
        # API endpoints
        self.npi_api = "https://npiregistry.cms.hhs.gov/api/"
        
        # Rate limiting
        self.request_delay = 1.5  # seconds between requests
        self.batch_size = 20  # hospitals per batch
        
        # Stats tracking
        self.stats = {
            'total_processed': 0,
            'total_inserted': 0,
            'total_errors': 0,
            'states_completed': [],
            'start_time': datetime.now().isoformat()
        }
        
    def connect_db(self):
        """Connect to PostgreSQL database"""
        try:
            conn = psycopg2.connect(self.db_url)
            logger.info("Database connection established")
            return conn
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            raise

    def create_slug(self, name: str, city: str, state: str) -> str:
        """Create URL-friendly slug"""
        slug_base = re.sub(r'[^a-z0-9]+', '-', name.lower().strip())
        slug = f"{slug_base}-{city.lower().replace(' ', '-')}-{state.lower()}"
        return slug.strip('-')

    def determine_hospital_type(self, name: str) -> str:
        """Determine hospital type from name"""
        name_lower = name.lower()
        
        if any(x in name_lower for x in ['va ', 'veterans', 'veteran']):
            return 'Veterans Affairs'
        elif any(x in name_lower for x in ['children', 'pediatric', 'kids']):
            return 'Children\'s Hospital'
        elif any(x in name_lower for x in ['rehabilitation', 'rehab']):
            return 'Rehabilitation'
        elif any(x in name_lower for x in ['psychiatric', 'mental health', 'behavioral']):
            return 'Psychiatric'
        elif any(x in name_lower for x in ['university', 'medical school', 'teaching']):
            return 'Teaching Hospital'
        elif any(x in name_lower for x in ['specialty', 'cancer', 'heart', 'cardiac', 'oncology', 'orthopedic']):
            return 'Specialty'
        elif any(x in name_lower for x in ['critical access', 'rural']):
            return 'Critical Access'
        elif any(x in name_lower for x in ['surgery center', 'ambulatory']):
            return 'Ambulatory Surgery Center'
        else:
            return 'General Acute Care'  # Default to General Acute Care

    def extract_specialties(self, name: str, taxonomies: List) -> List[str]:
        """Extract specialties from hospital data"""
        specialties = []
        
        # Check name for obvious specialties
        name_lower = name.lower()
        if 'cancer' in name_lower or 'oncology' in name_lower:
            specialties.append('Oncology')
        if 'heart' in name_lower or 'cardiac' in name_lower:
            specialties.append('Cardiology')
        if 'ortho' in name_lower:
            specialties.append('Orthopedics')
        if 'neuro' in name_lower:
            specialties.append('Neurology')
        if 'pediatric' in name_lower or 'children' in name_lower:
            specialties.append('Pediatrics')
        if 'women' in name_lower or 'maternity' in name_lower:
            specialties.append('Women\'s Health')
        if 'emergency' in name_lower or 'trauma' in name_lower:
            specialties.append('Emergency Medicine')
        
        # Add from taxonomies if available
        if taxonomies:
            for tax in taxonomies[:3]:  # Limit to top 3
                if tax.get('desc'):
                    specialties.append(tax['desc'])
        
        return list(dict.fromkeys(specialties))[:5]  # Remove duplicates, limit to 5

    def fetch_hospitals_by_city(self, state: str, city: str) -> List[Dict]:
        """Fetch hospitals from NPI Registry for a specific city"""
        hospitals = []
        
        try:
            params = {
                'version': '2.1',
                'enumeration_type': 'NPI-2',  # Organizations
                'state': state,
                'city': city,
                'taxonomy_description': 'hospital',
                'limit': self.batch_size,
                'skip': 0
            }
            
            while True:
                response = requests.get(self.npi_api, params=params, timeout=30)
                
                if response.status_code == 200:
                    data = response.json()
                    results = data.get('results', [])
                    
                    if not results:
                        break
                    
                    for result in results:
                        basic = result.get('basic', {})
                        addresses = result.get('addresses', [])
                        taxonomies = result.get('taxonomies', [])
                        
                        # Find primary location
                        primary_address = None
                        for addr in addresses:
                            if addr.get('address_purpose') == 'LOCATION':
                                primary_address = addr
                                break
                        
                        if not primary_address:
                            primary_address = addresses[0] if addresses else {}
                        
                        # Skip if not actually a hospital
                        org_name = basic.get('organization_name', '')
                        if not org_name or not any(hosp_term in org_name.lower() for hosp_term in 
                                                  ['hospital', 'medical center', 'health center', 'clinic']):
                            continue
                        
                        hospital_city = primary_address.get('city', city)
                        hospital_type = self.determine_hospital_type(org_name)
                        
                        hospital = {
                            'npi': result.get('number'),
                            'name': org_name,
                            'description': f"{hospital_type} serving {hospital_city}, {state}",
                            'address': primary_address.get('address_1', ''),
                            'city': hospital_city,
                            'state': state,
                            'zip': primary_address.get('postal_code', '')[:5] if primary_address.get('postal_code') else '',
                            'county': 'Unknown',  # NPI Registry doesn't provide county data
                            'phone': primary_address.get('telephone_number', ''),
                            'type': hospital_type,
                            'specialties': self.extract_specialties(org_name, taxonomies),
                            'website': '',  # Would need additional lookup
                            'rating': None,  # Would need CMS quality data
                            'data_source': 'NPI Registry'
                        }
                        
                        hospitals.append(hospital)
                    
                    # Check if more results available
                    if len(results) < self.batch_size:
                        break
                    
                    params['skip'] += self.batch_size
                    time.sleep(self.request_delay)
                else:
                    logger.error(f"API request failed for {city}, {state}: {response.status_code}")
                    break
                    
        except Exception as e:
            logger.error(f"Error fetching hospitals for {city}, {state}: {e}")
        
        return hospitals

    def insert_hospitals(self, conn, hospitals: List[Dict]) -> int:
        """Insert hospitals into database"""
        cursor = conn.cursor()
        inserted = 0
        
        for hospital in hospitals:
            try:
                # Check if hospital already exists
                cursor.execute("""
                    SELECT id FROM hospitals 
                    WHERE npi_number = %s OR (name = %s AND city = %s AND state = %s)
                """, (hospital['npi'], hospital['name'], hospital['city'], hospital['state']))
                
                if cursor.fetchone():
                    logger.info(f"Hospital already exists: {hospital['name']} in {hospital['city']}, {hospital['state']}")
                    continue
                
                # Generate slug
                slug = self.create_slug(hospital['name'], hospital['city'], hospital['state'])
                
                # Insert hospital
                cursor.execute("""
                    INSERT INTO hospitals (
                        npi_number, name, slug, description, address, city, state, zip_code, county,
                        phone, hospital_type, specialties, website, cms_rating, data_source,
                        created_at, updated_at
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s,
                        %s, %s, %s, %s, %s, %s,
                        NOW(), NOW()
                    )
                """, (
                    hospital['npi'],
                    hospital['name'],
                    slug,
                    hospital['description'],
                    hospital['address'],
                    hospital['city'],
                    hospital['state'],
                    hospital['zip'],
                    hospital['county'],
                    hospital['phone'],
                    hospital['type'],
                    hospital['specialties'],
                    hospital['website'],
                    hospital['rating'],
                    hospital['data_source']
                ))
                
                inserted += 1
                logger.info(f"✅ Inserted: {hospital['name']} in {hospital['city']}, {hospital['state']}")
                
            except Exception as e:
                logger.error(f"Error inserting hospital {hospital['name']}: {e}")
                conn.rollback()
                continue
        
        conn.commit()
        cursor.close()
        return inserted

    def collect_state_hospitals(self, conn, state_code: str, state_info: Dict):
        """Collect hospitals for a specific state"""
        logger.info(f"\n{'='*60}")
        logger.info(f"🏥 Collecting hospitals for {state_info['name']} ({state_code})")
        logger.info(f"{'='*60}")
        
        state_total = 0
        
        # Collect from major cities
        for city in state_info['major_cities']:
            logger.info(f"\nSearching {city}, {state_code}...")
            
            hospitals = self.fetch_hospitals_by_city(state_code, city)
            if hospitals:
                inserted = self.insert_hospitals(conn, hospitals)
                state_total += inserted
                self.stats['total_inserted'] += inserted
                self.stats['total_processed'] += len(hospitals)
                logger.info(f"Found {len(hospitals)} hospitals, inserted {inserted}")
            
            time.sleep(self.request_delay)
        
        self.stats['states_completed'].append(state_code)
        logger.info(f"\n✅ {state_info['name']} complete: {state_total} hospitals added")
        
        # Save progress after each state
        self.save_progress()

    def collect_remaining_states(self):
        """Main collection method for remaining states"""
        conn = self.connect_db()
        
        try:
            logger.info("\n🚀 Starting collection for remaining US states...")
            logger.info(f"States to process: {', '.join(REMAINING_STATES.keys())}")
            
            for state_code, state_info in REMAINING_STATES.items():
                self.collect_state_hospitals(conn, state_code, state_info)
                
                # Respect rate limits between states
                time.sleep(3)
            
            logger.info(f"\n{'='*60}")
            logger.info("✅ REMAINING STATES COLLECTION COMPLETED!")
            logger.info(f"{'='*60}")
            logger.info(f"Total states processed: {len(self.stats['states_completed'])}")
            logger.info(f"Total hospitals processed: {self.stats['total_processed']}")
            logger.info(f"Total hospitals inserted: {self.stats['total_inserted']}")
            logger.info(f"Total errors: {self.stats['total_errors']}")
            logger.info("All data sourced from CMS NPI Registry")
            
            # Generate final report
            self.generate_final_report()
            
        except Exception as e:
            logger.error(f"Critical error in collection: {e}")
        finally:
            conn.close()

    def save_progress(self):
        """Save collection progress"""
        with open('remaining_states_progress.json', 'w') as f:
            json.dump({
                'timestamp': datetime.now().isoformat(),
                'stats': self.stats
            }, f, indent=2)

    def generate_final_report(self):
        """Generate final collection report"""
        conn = self.connect_db()
        cursor = conn.cursor()
        
        # Get complete nationwide stats
        cursor.execute("""
            SELECT 
                COUNT(*) as total_hospitals,
                COUNT(DISTINCT state) as total_states
            FROM hospitals 
            WHERE data_source IN ('NPI Registry', 'CMS/NPI Registry')
        """)
        
        total_stats = cursor.fetchone()
        total_hospitals = total_stats[0] if total_stats else 0
        total_states = total_stats[1] if total_stats else 0
        
        # Get counts by state
        cursor.execute("""
            SELECT state, COUNT(*) as count 
            FROM hospitals 
            WHERE data_source IN ('NPI Registry', 'CMS/NPI Registry')
            GROUP BY state 
            ORDER BY state
        """)
        
        state_counts = {}
        for row in cursor.fetchall():
            state_counts[row[0]] = row[1]
        
        cursor.close()
        conn.close()
        
        report = {
            'collection_date': datetime.now().isoformat(),
            'data_source': 'CMS NPI Registry',
            'nationwide_total': total_hospitals,
            'states_with_data': total_states,
            'new_states_added': len(self.stats['states_completed']),
            'new_hospitals_added': self.stats['total_inserted'],
            'coverage_by_state': state_counts,
            'completion_status': 'NATIONWIDE COVERAGE ACHIEVED' if total_states >= 50 else 'IN PROGRESS'
        }
        
        # Save report
        filename = f'nationwide_completion_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        with open(filename, 'w') as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"\n📊 Final report saved to {filename}")
        logger.info(f"🎯 Nationwide total: {total_hospitals} hospitals across {total_states} states")

def main():
    """Main function"""
    try:
        collector = RemainingStatesHospitalCollector()
        collector.collect_remaining_states()
        
    except Exception as e:
        logger.error(f"Application error: {e}")

if __name__ == "__main__":
    main()