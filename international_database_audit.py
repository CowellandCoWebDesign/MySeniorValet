#!/usr/bin/env python3
"""
International Database Audit - Canada, Puerto Rico, Mexico
Comprehensive audit for synthetic data violations in non-US territories
"""

import os
import logging
import psycopg2
import re
from datetime import datetime

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class InternationalDataAuditor:
    def __init__(self):
        self.db_url = os.environ.get('DATABASE_URL')
        if not self.db_url:
            raise ValueError("DATABASE_URL not found")
        
        # International regions to audit
        self.canadian_provinces = [
            'Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba', 
            'Saskatchewan', 'Nova Scotia', 'New Brunswick', 'Newfoundland and Labrador',
            'Prince Edward Island', 'Northwest Territories', 'Nunavut', 'Yukon'
        ]
        
        self.mexican_states = [
            'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
            'Chiapas', 'Chihuahua', 'Coahuila', 'Colima', 'Durango', 'Guanajuato',
            'Guerrero', 'Hidalgo', 'Jalisco', 'México', 'Michoacán', 'Morelos',
            'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo',
            'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas',
            'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas', 'Mexico City'
        ]
        
        self.us_territories = ['Puerto Rico']
        
        # Synthetic patterns for international regions
        self.synthetic_patterns = {
            'address': [
                r'^[0-9]+ Main Street$',
                r'^[0-9]+ First Street$',
                r'^[0-9]+ Oak Street$',
                r'^[0-9]+ Elm Street$',
                r'^[0-9]+ Rue Principale$',  # French Main Street
                r'^[0-9]+ Calle Principal$',  # Spanish Main Street
                r'^[0-9]+ Avenue Centrale$',  # French Central Avenue
                r'^[0-9]+ Centro \d+$',       # Spanish Center patterns
            ],
            'phone': [
                r'^\(555\)',              # US fictional
                r'^\(000\)',              # Invalid
                r'^\(999\)',              # Invalid
                r'555-0\d{3}$',           # US fictional patterns
                r'^\+1 555',              # International fictional
                r'^\+52 555',             # Mexico fictional
                r'^\+1 \(555\)',          # Canada fictional
            ],
            'name': [
                r'Senior Living \d+$',
                r'Community \d+$',
                r'Facility \d+$',
                r'Résidence \d+$',        # French facility patterns
                r'Comunidad \d+$',        # Spanish community patterns
                r'Centro de Vida \d+$',   # Spanish living center patterns
                r'Maison \d+$',           # French house patterns
                r'Casa \d+$',             # Spanish house patterns
            ]
        }

    def audit_international_regions(self):
        """Audit Canada, Mexico, and Puerto Rico"""
        
        try:
            conn = psycopg2.connect(self.db_url)
            cursor = conn.cursor()
            
            print("="*100)
            print("INTERNATIONAL DATABASE INTEGRITY AUDIT")
            print("Canada • Puerto Rico • Mexico")
            print("="*100)
            
            total_violations = 0
            region_summary = {}
            
            # Audit Canada
            print(f"\n🇨🇦 AUDITING CANADA ({len(self.canadian_provinces)} provinces/territories)")
            print("-" * 60)
            canada_violations = self.audit_region_group(cursor, self.canadian_provinces, "Canada")
            total_violations += canada_violations['total']
            region_summary['Canada'] = canada_violations
            
            # Audit Mexico  
            print(f"\n🇲🇽 AUDITING MEXICO ({len(self.mexican_states)} states)")
            print("-" * 60)
            mexico_violations = self.audit_region_group(cursor, self.mexican_states, "Mexico")
            total_violations += mexico_violations['total']
            region_summary['Mexico'] = mexico_violations
            
            # Audit Puerto Rico
            print(f"\n🇺🇸 AUDITING PUERTO RICO")
            print("-" * 60)
            pr_violations = self.audit_region_group(cursor, self.us_territories, "Puerto Rico")
            total_violations += pr_violations['total']
            region_summary['Puerto Rico'] = pr_violations
            
            # Overall summary
            self.print_international_summary(cursor, total_violations, region_summary)
            
            cursor.close()
            conn.close()
            
            return total_violations, region_summary
            
        except Exception as e:
            logger.error(f"International audit error: {str(e)}")
            return -1, {}

    def audit_region_group(self, cursor, regions, region_name):
        """Audit a group of regions (provinces, states, territories)"""
        
        group_violations = {
            'fake_addresses': 0,
            'fake_phones': 0,
            'missing_phones': 0,
            'sequential_names': 0,
            'total': 0,
            'regions': {}
        }
        
        for region in regions:
            violations = self.audit_single_region(cursor, region)
            group_violations['regions'][region] = violations
            
            # Add to group totals
            group_violations['fake_addresses'] += violations['fake_addresses']
            group_violations['fake_phones'] += violations['fake_phones']
            group_violations['missing_phones'] += violations['missing_phones']
            group_violations['sequential_names'] += violations['sequential_names']
            group_violations['total'] += violations['total']
            
            # Print individual region status
            if violations['total'] > 0:
                print(f"❌ {region}: {violations['total']} violations")
                if violations['fake_addresses'] > 0:
                    print(f"   • {violations['fake_addresses']} fake addresses")
                if violations['fake_phones'] > 0:
                    print(f"   • {violations['fake_phones']} fake phones")
                if violations['missing_phones'] > 0:
                    print(f"   • {violations['missing_phones']} missing phones")
                if violations['sequential_names'] > 0:
                    print(f"   • {violations['sequential_names']} sequential names")
            else:
                print(f"✅ {region}: Clean")
        
        return group_violations

    def audit_single_region(self, cursor, region):
        """Audit a specific region/state/province"""
        
        violations = {
            'fake_addresses': 0,
            'fake_phones': 0,
            'missing_phones': 0,
            'sequential_names': 0,
            'total': 0
        }
        
        # Check for fake addresses
        for pattern in self.synthetic_patterns['address']:
            cursor.execute("""
                SELECT COUNT(*) FROM communities 
                WHERE state = %s AND address ~ %s
            """, (region, pattern))
            count = cursor.fetchone()[0]
            violations['fake_addresses'] += count
        
        # Check for fake phone numbers
        for pattern in self.synthetic_patterns['phone']:
            cursor.execute("""
                SELECT COUNT(*) FROM communities 
                WHERE state = %s AND phone ~ %s
            """, (region, pattern))
            count = cursor.fetchone()[0]
            violations['fake_phones'] += count
        
        # Check for missing phone numbers (excluding PHONE_REQUIRED placeholder)
        cursor.execute("""
            SELECT COUNT(*) FROM communities 
            WHERE state = %s AND (phone IS NULL OR phone = '' OR phone = 'N/A')
        """, (region,))
        violations['missing_phones'] = cursor.fetchone()[0]
        
        # Check for sequential naming patterns
        for pattern in self.synthetic_patterns['name']:
            cursor.execute("""
                SELECT COUNT(*) FROM communities 
                WHERE state = %s AND name ~ %s
            """, (region, pattern))
            count = cursor.fetchone()[0]
            violations['sequential_names'] += count
        
        violations['total'] = (violations['fake_addresses'] + 
                              violations['fake_phones'] + 
                              violations['sequential_names'])
        
        return violations

    def print_international_summary(self, cursor, total_violations, region_summary):
        """Print comprehensive international audit summary"""
        
        print(f"\n" + "="*100)
        print("INTERNATIONAL AUDIT SUMMARY")
        print("="*100)
        
        # Regional breakdown
        for region_group, violations in region_summary.items():
            print(f"\n{region_group.upper()}:")
            print(f"   Total Violations: {violations['total']:,}")
            print(f"   Fake Addresses: {violations['fake_addresses']:,}")
            print(f"   Fake Phones: {violations['fake_phones']:,}")
            print(f"   Missing Phones: {violations['missing_phones']:,}")
            print(f"   Sequential Names: {violations['sequential_names']:,}")
        
        # Overall totals
        print(f"\nOVERALL INTERNATIONAL STATUS:")
        print(f"   Total Violations: {total_violations:,}")
        
        if total_violations > 0:
            print(f"\n❌ INTERNATIONAL DATA INTEGRITY ISSUES DETECTED")
            print(f"   {total_violations:,} synthetic data violations found")
            print("   Immediate cleanup required for launch readiness")
        else:
            print(f"\n✅ INTERNATIONAL DATA INTEGRITY VERIFIED")
            print("   All international regions are clean and launch-ready")
        
        # Get community counts by region
        print(f"\nINTERNATIONAL COVERAGE VERIFICATION:")
        
        # Canada count
        canada_states = "', '".join(self.canadian_provinces)
        cursor.execute(f"SELECT COUNT(*) FROM communities WHERE state IN ('{canada_states}')")
        canada_count = cursor.fetchone()[0]
        
        # Mexico count  
        mexico_states = "', '".join(self.mexican_states)
        cursor.execute(f"SELECT COUNT(*) FROM communities WHERE state IN ('{mexico_states}')")
        mexico_count = cursor.fetchone()[0]
        
        # Puerto Rico count
        cursor.execute("SELECT COUNT(*) FROM communities WHERE state = 'Puerto Rico'")
        pr_count = cursor.fetchone()[0]
        
        print(f"   🇨🇦 Canada: {canada_count:,} facilities")
        print(f"   🇲🇽 Mexico: {mexico_count:,} facilities") 
        print(f"   🇺🇸 Puerto Rico: {pr_count:,} facilities")

    def clean_international_synthetic_data(self, region_summary):
        """Remove synthetic data from international regions"""
        
        try:
            conn = psycopg2.connect(self.db_url)
            cursor = conn.cursor()
            
            print(f"\n" + "="*100)
            print("CLEANING INTERNATIONAL SYNTHETIC DATA")
            print("="*100)
            
            total_deleted = 0
            
            # Remove communities with fake addresses
            for pattern in self.synthetic_patterns['address']:
                cursor.execute("""
                    DELETE FROM communities 
                    WHERE address ~ %s AND state IN (
                        'Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba', 
                        'Saskatchewan', 'Nova Scotia', 'New Brunswick', 'Newfoundland and Labrador',
                        'Prince Edward Island', 'Northwest Territories', 'Nunavut', 'Yukon',
                        'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
                        'Chiapas', 'Chihuahua', 'Coahuila', 'Colima', 'Durango', 'Guanajuato',
                        'Guerrero', 'Hidalgo', 'Jalisco', 'México', 'Michoacán', 'Morelos',
                        'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo',
                        'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas',
                        'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas', 'Mexico City', 'Puerto Rico'
                    )
                """, (pattern,))
                deleted = cursor.rowcount
                total_deleted += deleted
                if deleted > 0:
                    print(f"Removed {deleted:,} international communities with address pattern: {pattern}")
            
            # Remove communities with fake phone numbers
            for pattern in self.synthetic_patterns['phone']:
                cursor.execute("""
                    DELETE FROM communities 
                    WHERE phone ~ %s AND state IN (
                        'Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba', 
                        'Saskatchewan', 'Nova Scotia', 'New Brunswick', 'Newfoundland and Labrador',
                        'Prince Edward Island', 'Northwest Territories', 'Nunavut', 'Yukon',
                        'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
                        'Chiapas', 'Chihuahua', 'Coahuila', 'Colima', 'Durango', 'Guanajuato',
                        'Guerrero', 'Hidalgo', 'Jalisco', 'México', 'Michoacán', 'Morelos',
                        'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo',
                        'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas',
                        'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas', 'Mexico City', 'Puerto Rico'
                    )
                """, (pattern,))
                deleted = cursor.rowcount
                total_deleted += deleted
                if deleted > 0:
                    print(f"Removed {deleted:,} international communities with fake phones: {pattern}")
            
            # Remove communities with sequential names
            for pattern in self.synthetic_patterns['name']:
                cursor.execute("""
                    DELETE FROM communities 
                    WHERE name ~ %s AND state IN (
                        'Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba', 
                        'Saskatchewan', 'Nova Scotia', 'New Brunswick', 'Newfoundland and Labrador',
                        'Prince Edward Island', 'Northwest Territories', 'Nunavut', 'Yukon',
                        'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
                        'Chiapas', 'Chihuahua', 'Coahuila', 'Colima', 'Durango', 'Guanajuato',
                        'Guerrero', 'Hidalgo', 'Jalisco', 'México', 'Michoacán', 'Morelos',
                        'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo',
                        'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas',
                        'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas', 'Mexico City', 'Puerto Rico'
                    )
                """, (pattern,))
                deleted = cursor.rowcount
                total_deleted += deleted
                if deleted > 0:
                    print(f"Removed {deleted:,} international communities with sequential names: {pattern}")
            
            conn.commit()
            
            # Get final counts
            cursor.execute("SELECT COUNT(*) FROM communities")
            final_count = cursor.fetchone()[0]
            
            print(f"\n✅ INTERNATIONAL CLEANUP COMPLETED:")
            print(f"   Total Removed: {total_deleted:,}")
            print(f"   Remaining Communities: {final_count:,}")
            
            cursor.close()
            conn.close()
            
            return total_deleted
            
        except Exception as e:
            logger.error(f"International cleanup error: {str(e)}")
            return 0

def main():
    """Execute international database audit"""
    try:
        auditor = InternationalDataAuditor()
        
        # Perform international audit
        total_violations, region_summary = auditor.audit_international_regions()
        
        if total_violations == -1:
            return 1
        
        if total_violations > 0:
            print(f"\n❌ INTERNATIONAL VIOLATIONS DETECTED: {total_violations:,}")
            
            # Auto-clean for launch preparation
            print(f"\nAUTO-CLEANING INTERNATIONAL SYNTHETIC DATA...")
            deleted = auditor.clean_international_synthetic_data(region_summary)
            
            if deleted > 0:
                print(f"\n✅ INTERNATIONAL CLEANING SUCCESSFUL - {deleted:,} synthetic entries removed")
                
                # Re-audit to confirm cleanup
                print(f"\nRE-AUDITING INTERNATIONAL REGIONS...")
                post_violations, _ = auditor.audit_international_regions()
                
                if post_violations == 0:
                    print(f"\n✅ INTERNATIONAL DATA INTEGRITY FULLY RESTORED")
                else:
                    print(f"\n⚠️  {post_violations} international violations still remain")
            
        else:
            print(f"\n✅ INTERNATIONAL DATA INTEGRITY CONFIRMED")
        
        print("="*100)
        
        return 0
        
    except Exception as e:
        logger.error(f"Critical international audit error: {str(e)}")
        return 1

if __name__ == "__main__":
    exit(main())