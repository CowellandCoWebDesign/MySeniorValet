#!/usr/bin/env python3
"""
Data Integrity Audit Script
Identifies states with incorrect "100% coverage" claims in documentation

CRITICAL FINDINGS:
- Florida: Claims 100% but only has 33% county coverage (22/67 counties)
- Georgia: Claims 100% but only has 91% county coverage (144/159 counties)  
- Need to audit all states claiming "100% COMPLETE" coverage

This script cross-references our database with official state county counts
"""

import psycopg2
import json
import csv
from datetime import datetime
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DataIntegrityAuditor:
    def __init__(self):
        self.db_url = os.environ.get('DATABASE_URL')
        if not self.db_url:
            raise ValueError("DATABASE_URL environment variable not found")
            
        # Official US state county counts
        self.official_county_counts = {
            'FL': 67,   # Florida - CRITICAL GAP IDENTIFIED
            'TX': 254,  # Texas - Verified complete
            'GA': 159,  # Georgia - 15 counties missing 
            'CA': 58,   # California - Need to verify
            'NY': 62,   # New York - Need to verify
            'OH': 88,   # Ohio - Claims 100%
            'VA': 95,   # Virginia - Claims 91%
            'NC': 100,  # North Carolina - Claims 99%
            'MI': 83,   # Michigan - Claims 100% 
            'PA': 67,   # Pennsylvania - Claims 100%
            'IL': 102,  # Illinois - Claims 100%
            'IN': 92,   # Indiana - Claims 100%
            'WI': 72,   # Wisconsin - Claims 100%
            'MN': 87,   # Minnesota - Claims 100%
            'IA': 99,   # Iowa - Claims 100%
            'MO': 115,  # Missouri - Claims 99%
            'AR': 75,   # Arkansas - Claims 100%
            'OK': 77,   # Oklahoma - Claims 100%
            'KS': 105,  # Kansas - Claims 100%
            'NE': 93,   # Nebraska
            'ND': 53,   # North Dakota - Claims 100%
            'SD': 66,   # South Dakota - Claims 100%
            'MT': 56,   # Montana - Claims 100%
            'WY': 23,   # Wyoming - Claims 100%
            'CO': 64,   # Colorado
            'NM': 33,   # New Mexico
            'AZ': 15,   # Arizona - Claims 100%
            'UT': 29,   # Utah - Claims 100%
            'NV': 17,   # Nevada - Claims 100%
            'ID': 44,   # Idaho - Claims 100%
            'OR': 36,   # Oregon - Claims 100%
            'WA': 39,   # Washington - Claims 100%
            'AK': 29,   # Alaska - Claims 100%
            'HI': 5,    # Hawaii - Claims 100%
        }
        
        self.audit_results = {}
        
    def connect_to_database(self):
        """Connect to PostgreSQL database"""
        try:
            conn = psycopg2.connect(self.db_url)
            return conn
        except Exception as e:
            logger.error(f"Database connection failed: {str(e)}")
            raise

    def audit_state_coverage(self, state_code: str) -> dict:
        """Audit coverage for a specific state"""
        conn = self.connect_to_database()
        cursor = conn.cursor()
        
        try:
            # Get our current coverage
            cursor.execute("""
                SELECT COUNT(*) as communities, 
                       COUNT(DISTINCT county) as counties_covered,
                       COUNT(DISTINCT city) as cities_covered
                FROM communities 
                WHERE state = %s
            """, (state_code,))
            
            result = cursor.fetchone()
            communities, counties_covered, cities_covered = result
            
            # Get official county count
            official_counties = self.official_county_counts.get(state_code, 0)
            
            # Calculate coverage percentage
            coverage_pct = (counties_covered / official_counties * 100) if official_counties > 0 else 0
            
            # Determine status
            if coverage_pct >= 95:
                status = "COMPLETE"
            elif coverage_pct >= 80:
                status = "GOOD"
            elif coverage_pct >= 50:
                status = "PARTIAL"
            else:
                status = "CRITICAL GAP"
                
            # Get list of covered counties
            cursor.execute("""
                SELECT DISTINCT county 
                FROM communities 
                WHERE state = %s AND county IS NOT NULL
                ORDER BY county
            """, (state_code,))
            
            covered_counties = [row[0] for row in cursor.fetchall()]
            
            audit_result = {
                'state': state_code,
                'communities': communities,
                'counties_covered': counties_covered,
                'official_counties': official_counties,
                'coverage_percentage': round(coverage_pct, 1),
                'status': status,
                'cities_covered': cities_covered,
                'covered_counties': covered_counties,
                'missing_counties': official_counties - counties_covered,
                'audit_timestamp': datetime.now().isoformat()
            }
            
            return audit_result
            
        except Exception as e:
            logger.error(f"Error auditing {state_code}: {str(e)}")
            return None
        finally:
            cursor.close()
            conn.close()

    def audit_all_states(self):
        """Audit all states in our database"""
        logger.info("Starting comprehensive data integrity audit...")
        
        conn = self.connect_to_database()
        cursor = conn.cursor()
        
        try:
            # Get all states with communities
            cursor.execute("""
                SELECT DISTINCT state, COUNT(*) as community_count
                FROM communities 
                WHERE state IS NOT NULL AND LENGTH(state) = 2
                GROUP BY state
                ORDER BY community_count DESC
            """)
            
            states_with_data = cursor.fetchall()
            
            logger.info(f"Found {len(states_with_data)} states with community data")
            
            for state_code, community_count in states_with_data:
                if state_code in self.official_county_counts:
                    logger.info(f"Auditing {state_code} ({community_count:,} communities)...")
                    audit_result = self.audit_state_coverage(state_code)
                    if audit_result:
                        self.audit_results[state_code] = audit_result
                        
        except Exception as e:
            logger.error(f"Error in comprehensive audit: {str(e)}")
        finally:
            cursor.close()
            conn.close()

    def identify_critical_gaps(self):
        """Identify states with critical coverage gaps"""
        critical_gaps = []
        false_completions = []
        
        for state_code, result in self.audit_results.items():
            # Critical gaps (less than 50% coverage)
            if result['coverage_percentage'] < 50:
                critical_gaps.append(result)
                
            # False "100% complete" claims (less than 95% coverage)
            if result['coverage_percentage'] < 95:
                false_completions.append(result)
        
        return critical_gaps, false_completions

    def generate_coverage_report(self):
        """Generate comprehensive coverage report"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Sort states by coverage percentage
        sorted_results = sorted(self.audit_results.values(), 
                              key=lambda x: x['coverage_percentage'], reverse=True)
        
        # Generate CSV report
        csv_filename = f"data_integrity_audit_{timestamp}.csv"
        with open(csv_filename, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['state', 'communities', 'counties_covered', 'official_counties', 
                         'coverage_percentage', 'status', 'cities_covered', 'missing_counties']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            
            for result in sorted_results:
                writer.writerow({k: v for k, v in result.items() if k in fieldnames})
        
        # Generate detailed JSON report
        json_filename = f"data_integrity_audit_detailed_{timestamp}.json"
        with open(json_filename, 'w', encoding='utf-8') as jsonfile:
            json.dump({
                'audit_summary': {
                    'total_states_audited': len(self.audit_results),
                    'audit_timestamp': timestamp,
                    'critical_gaps_found': len([r for r in self.audit_results.values() if r['coverage_percentage'] < 50]),
                    'false_completions_found': len([r for r in self.audit_results.values() if r['coverage_percentage'] < 95])
                },
                'state_results': self.audit_results
            }, jsonfile, indent=2, ensure_ascii=False)
        
        return csv_filename, json_filename

    def print_audit_summary(self):
        """Print comprehensive audit summary"""
        critical_gaps, false_completions = self.identify_critical_gaps()
        
        print("\n" + "="*80)
        print("DATA INTEGRITY AUDIT RESULTS")
        print("="*80)
        print(f"Total States Audited: {len(self.audit_results)}")
        print(f"Critical Coverage Gaps Found: {len(critical_gaps)}")
        print(f"False '100% Complete' Claims: {len(false_completions)}")
        
        print(f"\n🚨 CRITICAL COVERAGE GAPS (< 50% county coverage):")
        for gap in sorted(critical_gaps, key=lambda x: x['coverage_percentage']):
            print(f"  {gap['state']}: {gap['coverage_percentage']}% "
                  f"({gap['counties_covered']}/{gap['official_counties']} counties) "
                  f"- {gap['communities']:,} communities")
        
        print(f"\n⚠️  FALSE COMPLETION CLAIMS (< 95% county coverage):")
        for false_claim in sorted(false_completions, key=lambda x: x['coverage_percentage']):
            print(f"  {false_claim['state']}: {false_claim['coverage_percentage']}% "
                  f"({false_claim['counties_covered']}/{false_claim['official_counties']} counties) "
                  f"- {false_claim['communities']:,} communities")
        
        print(f"\n✅ VERIFIED COMPLETE STATES (≥ 95% county coverage):")
        complete_states = [r for r in self.audit_results.values() if r['coverage_percentage'] >= 95]
        for complete in sorted(complete_states, key=lambda x: x['coverage_percentage'], reverse=True):
            print(f"  {complete['state']}: {complete['coverage_percentage']}% "
                  f"({complete['counties_covered']}/{complete['official_counties']} counties) "
                  f"- {complete['communities']:,} communities")
        
        # Specific Florida analysis
        if 'FL' in self.audit_results:
            fl_result = self.audit_results['FL']
            print(f"\n🏖️  FLORIDA SPECIFIC ANALYSIS:")
            print(f"  Current Coverage: {fl_result['coverage_percentage']}% ({fl_result['counties_covered']}/67 counties)")
            print(f"  Communities: {fl_result['communities']:,}")
            print(f"  Missing Counties: {fl_result['missing_counties']}")
            print(f"  Status: {fl_result['status']}")
            print(f"  🎯 MISSING MAJOR RETIREMENT AREAS:")
            
            major_missing = ['Miami-Dade', 'Broward', 'Palm Beach', 'Sumter', 'Orange', 'Hillsborough', 'Pinellas']
            covered = fl_result['covered_counties']
            for county in major_missing:
                status = "✅ COVERED" if any(county.lower() in c.lower() for c in covered) else "❌ MISSING"
                print(f"    {county} County: {status}")
        
        print("\n" + "="*80)

def main():
    """Main execution function"""
    print("MySeniorValet Data Integrity Audit")
    print("Identifying false '100% coverage' claims and critical gaps")
    print("-" * 60)
    
    auditor = DataIntegrityAuditor()
    
    try:
        # Run comprehensive audit
        auditor.audit_all_states()
        
        # Generate reports
        csv_file, json_file = auditor.generate_coverage_report()
        
        # Print summary
        auditor.print_audit_summary()
        
        print(f"\nDetailed reports saved:")
        print(f"  CSV Summary: {csv_file}")
        print(f"  JSON Detail: {json_file}")
        
        print(f"\nNext Actions Required:")
        print(f"1. 🏖️  IMMEDIATE: Fix Florida coverage (33% → 100%)")
        print(f"2. 🍑 Review Georgia missing counties (91% → 100%)")
        print(f"3. 📝 Update replit.md documentation with accurate coverage percentages")
        print(f"4. 🔍 Investigate other states with false completion claims")
        print(f"5. 🚀 Prioritize major retirement state expansions")
        
    except Exception as e:
        logger.error(f"Critical error in audit: {str(e)}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())