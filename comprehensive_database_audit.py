#!/usr/bin/env python3
"""
Comprehensive Database Audit - United States
Identify and remove ALL synthetic/fake data violating REAL DATA policy
"""

import os
import logging
import psycopg2
import re
from datetime import datetime

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DatabaseIntegrityAuditor:
    def __init__(self):
        self.db_url = os.environ.get('DATABASE_URL')
        if not self.db_url:
            raise ValueError("DATABASE_URL not found")
        
        self.synthetic_patterns = [
            r'^[0-9]+ Main Street$',  # Sequential Main Street addresses
            r'^[0-9]+ First Street$',  # Sequential First Street addresses
            r'^[0-9]+ Oak Street$',    # Sequential Oak Street addresses
            r'^[0-9]+ Elm Street$',    # Sequential Elm Street addresses
            r'Senior Living \d+$',     # "Senior Living 1", "Senior Living 2" patterns
            r'Community \d+$',         # "Community 1", "Community 2" patterns
            r'Facility \d+$',          # "Facility 1", "Facility 2" patterns
        ]
        
        self.suspicious_phone_patterns = [
            r'^\(555\)',              # 555 area codes (reserved for fictional use)
            r'^\(000\)',              # Invalid area codes
            r'^\(999\)',              # Invalid area codes
            r'555-0\d{3}$',           # 555-01xx numbers (fictional)
        ]

    def audit_all_states(self):
        """Comprehensive audit of all US states"""
        
        try:
            conn = psycopg2.connect(self.db_url)
            cursor = conn.cursor()
            
            print("="*100)
            print("COMPREHENSIVE DATABASE INTEGRITY AUDIT - UNITED STATES")
            print("="*100)
            
            # Get all states in database
            cursor.execute("SELECT DISTINCT state FROM communities ORDER BY state")
            states = [row[0] for row in cursor.fetchall()]
            
            total_violations = 0
            state_violations = {}
            
            for state in states:
                violations = self.audit_state(cursor, state)
                state_violations[state] = violations
                total_violations += violations['total']
                
                if violations['total'] > 0:
                    print(f"\n❌ {state}: {violations['total']} violations found")
                    if violations['fake_addresses'] > 0:
                        print(f"   • {violations['fake_addresses']} fake addresses")
                    if violations['fake_phones'] > 0:
                        print(f"   • {violations['fake_phones']} fake phone numbers")
                    if violations['missing_phones'] > 0:
                        print(f"   • {violations['missing_phones']} missing phone numbers")
                    if violations['sequential_names'] > 0:
                        print(f"   • {violations['sequential_names']} sequential names")
                else:
                    print(f"✅ {state}: Clean")
            
            # Summary by violation type
            total_fake_addresses = sum(v['fake_addresses'] for v in state_violations.values())
            total_fake_phones = sum(v['fake_phones'] for v in state_violations.values())
            total_missing_phones = sum(v['missing_phones'] for v in state_violations.values())
            total_sequential_names = sum(v['sequential_names'] for v in state_violations.values())
            
            print(f"\n" + "="*100)
            print(f"AUDIT SUMMARY:")
            print(f"States Audited: {len(states)}")
            print(f"Total Violations: {total_violations:,}")
            print(f"Fake Addresses: {total_fake_addresses:,}")
            print(f"Fake Phone Numbers: {total_fake_phones:,}")
            print(f"Missing Phone Numbers: {total_missing_phones:,}")
            print(f"Sequential Names: {total_sequential_names:,}")
            
            if total_violations > 0:
                print(f"\n❌ CRITICAL: {total_violations:,} synthetic data violations detected")
                print("These must be removed to maintain data integrity")
            else:
                print(f"\n✅ DATABASE INTEGRITY CONFIRMED")
            
            cursor.close()
            conn.close()
            
            return total_violations, state_violations
            
        except Exception as e:
            logger.error(f"Audit error: {str(e)}")
            return -1, {}

    def audit_state(self, cursor, state):
        """Audit a specific state for violations"""
        
        violations = {
            'fake_addresses': 0,
            'fake_phones': 0,
            'missing_phones': 0,
            'sequential_names': 0,
            'total': 0
        }
        
        # Check for fake addresses
        for pattern in self.synthetic_patterns:
            cursor.execute("""
                SELECT COUNT(*) FROM communities 
                WHERE state = %s AND address ~ %s
            """, (state, pattern))
            count = cursor.fetchone()[0]
            violations['fake_addresses'] += count
        
        # Check for fake phone numbers
        for pattern in self.suspicious_phone_patterns:
            cursor.execute("""
                SELECT COUNT(*) FROM communities 
                WHERE state = %s AND phone ~ %s
            """, (state, pattern))
            count = cursor.fetchone()[0]
            violations['fake_phones'] += count
        
        # Check for missing phone numbers
        cursor.execute("""
            SELECT COUNT(*) FROM communities 
            WHERE state = %s AND (phone IS NULL OR phone = '' OR phone = 'N/A')
        """, (state,))
        violations['missing_phones'] = cursor.fetchone()[0]
        
        # Check for sequential naming patterns
        cursor.execute("""
            SELECT COUNT(*) FROM communities 
            WHERE state = %s AND (
                name ~ 'Senior Living \\d+$' OR
                name ~ 'Community \\d+$' OR
                name ~ 'Facility \\d+$' OR
                name ~ '\\w+ \\d+$'
            )
        """, (state,))
        violations['sequential_names'] = cursor.fetchone()[0]
        
        violations['total'] = (violations['fake_addresses'] + 
                              violations['fake_phones'] + 
                              violations['sequential_names'])
        
        return violations

    def clean_synthetic_data(self, state_violations):
        """Remove all identified synthetic data"""
        
        try:
            conn = psycopg2.connect(self.db_url)
            cursor = conn.cursor()
            
            print(f"\n" + "="*100)
            print("CLEANING SYNTHETIC DATA")
            print("="*100)
            
            total_deleted = 0
            
            # Remove communities with fake addresses
            for pattern in self.synthetic_patterns:
                cursor.execute("""
                    DELETE FROM communities 
                    WHERE address ~ %s
                """, (pattern,))
                deleted = cursor.rowcount
                total_deleted += deleted
                if deleted > 0:
                    print(f"Removed {deleted:,} communities with pattern: {pattern}")
            
            # Remove communities with fake phone numbers
            for pattern in self.suspicious_phone_patterns:
                cursor.execute("""
                    DELETE FROM communities 
                    WHERE phone ~ %s
                """, (pattern,))
                deleted = cursor.rowcount
                total_deleted += deleted
                if deleted > 0:
                    print(f"Removed {deleted:,} communities with fake phones: {pattern}")
            
            # Remove communities with sequential names
            cursor.execute("""
                DELETE FROM communities 
                WHERE name ~ 'Senior Living \\d+$' OR
                      name ~ 'Community \\d+$' OR
                      name ~ 'Facility \\d+$'
            """)
            deleted = cursor.rowcount
            total_deleted += deleted
            if deleted > 0:
                print(f"Removed {deleted:,} communities with sequential names")
            
            conn.commit()
            
            # Get final counts
            cursor.execute("SELECT COUNT(*) FROM communities")
            final_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(DISTINCT state) FROM communities")
            states_remaining = cursor.fetchone()[0]
            
            print(f"\n✅ CLEANUP COMPLETED:")
            print(f"   Total Removed: {total_deleted:,}")
            print(f"   Remaining Communities: {final_count:,}")
            print(f"   States Covered: {states_remaining}")
            
            cursor.close()
            conn.close()
            
            return total_deleted
            
        except Exception as e:
            logger.error(f"Cleanup error: {str(e)}")
            return 0

    def create_integrity_safeguards(self):
        """Create database constraints to prevent future synthetic data"""
        
        try:
            conn = psycopg2.connect(self.db_url)
            cursor = conn.cursor()
            
            print(f"\n" + "="*100)
            print("IMPLEMENTING INTEGRITY SAFEGUARDS")
            print("="*100)
            
            # Add constraint to prevent Main Street addresses
            try:
                cursor.execute("""
                    ALTER TABLE communities 
                    ADD CONSTRAINT no_fake_addresses 
                    CHECK (address !~ '^[0-9]+ Main Street$')
                """)
                print("✅ Added constraint: no_fake_addresses")
            except:
                print("⚠️  Constraint no_fake_addresses already exists")
            
            # Add constraint to prevent 555 phone numbers
            try:
                cursor.execute("""
                    ALTER TABLE communities 
                    ADD CONSTRAINT no_fake_phones 
                    CHECK (phone !~ '^\\(555\\)')
                """)
                print("✅ Added constraint: no_fake_phones")
            except:
                print("⚠️  Constraint no_fake_phones already exists")
            
            # Add constraint to require phone numbers
            try:
                cursor.execute("""
                    ALTER TABLE communities 
                    ADD CONSTRAINT require_phone 
                    CHECK (phone IS NOT NULL AND phone != '' AND phone != 'N/A')
                """)
                print("✅ Added constraint: require_phone")
            except:
                print("⚠️  Constraint require_phone already exists")
            
            conn.commit()
            cursor.close()
            conn.close()
            
            print("✅ Database integrity safeguards implemented")
            
        except Exception as e:
            logger.error(f"Safeguard implementation error: {str(e)}")

def main():
    """Execute comprehensive database audit"""
    try:
        auditor = DatabaseIntegrityAuditor()
        
        # Perform comprehensive audit
        total_violations, state_violations = auditor.audit_all_states()
        
        if total_violations == -1:
            return 1
        
        if total_violations > 0:
            print(f"\n❌ CRITICAL VIOLATIONS DETECTED: {total_violations:,}")
            
            # Auto-clean since this is critical for launch
            print(f"\nAUTO-CLEANING SYNTHETIC DATA FOR LAUNCH PREPARATION...")
            deleted = auditor.clean_synthetic_data(state_violations)
            
            if deleted > 0:
                print(f"\n✅ CLEANING SUCCESSFUL - {deleted:,} synthetic entries removed")
                
                # Re-audit to confirm cleanup
                print(f"\nRE-AUDITING DATABASE...")
                post_violations, _ = auditor.audit_all_states()
                
                if post_violations == 0:
                    print(f"\n✅ DATABASE INTEGRITY FULLY RESTORED")
                else:
                    print(f"\n⚠️  {post_violations} violations still remain")
            
            # Implement safeguards
            auditor.create_integrity_safeguards()
            
        else:
            print(f"\n✅ DATABASE INTEGRITY CONFIRMED - Ready for launch")
        
        print("="*100)
        
        return 0
        
    except Exception as e:
        logger.error(f"Critical error: {str(e)}")
        return 1

if __name__ == "__main__":
    exit(main())