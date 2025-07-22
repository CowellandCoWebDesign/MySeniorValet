#!/usr/bin/env python3
"""
Database Integrity Audit
Identify any synthetic/fake data that violates REAL DATA policy
"""

import os
import logging
import psycopg2

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def audit_database_integrity():
    """Audit database for potential synthetic data violations"""
    
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        raise ValueError("DATABASE_URL not found")

    try:
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        print("="*80)
        print("DATABASE INTEGRITY AUDIT - REAL DATA POLICY COMPLIANCE")
        print("="*80)
        
        # Check for suspicious license numbers (FL-BAY format indicates synthetic)
        cursor.execute("""
            SELECT name, city, county, license_number 
            FROM communities 
            WHERE state = 'FL' 
            AND license_number LIKE 'FL-BAY-%'
            ORDER BY license_number
        """)
        
        synthetic_licenses = cursor.fetchall()
        if synthetic_licenses:
            print(f"\n❌ VIOLATION FOUND: {len(synthetic_licenses)} facilities with synthetic license numbers")
            for name, city, county, license_num in synthetic_licenses:
                print(f"   • {name} ({city}, {county}) - License: {license_num}")
        else:
            print("\n✅ No synthetic license numbers found")
        
        # Check for suspicious address patterns (sequential numbers)
        cursor.execute("""
            SELECT name, address, city, county 
            FROM communities 
            WHERE state = 'FL' 
            AND address ~ '^[0-9]+ Main Street$'
            ORDER BY address
        """)
        
        generic_addresses = cursor.fetchall()
        if generic_addresses:
            print(f"\n❌ VIOLATION FOUND: {len(generic_addresses)} facilities with generic 'Main Street' addresses")
            for name, address, city, county in generic_addresses[:10]:  # Show first 10
                print(f"   • {name} - {address}, {city}, {county}")
            if len(generic_addresses) > 10:
                print(f"   ... and {len(generic_addresses) - 10} more")
        else:
            print("\n✅ No generic address patterns found")
        
        # Check for facilities without phone numbers (suspicious for real facilities)
        cursor.execute("""
            SELECT COUNT(*) 
            FROM communities 
            WHERE state = 'FL' 
            AND (phone IS NULL OR phone = '')
        """)
        
        no_phone_count = cursor.fetchone()[0]
        if no_phone_count > 0:
            print(f"\n⚠️  WARNING: {no_phone_count} Florida facilities missing phone numbers")
        else:
            print("\n✅ All Florida facilities have phone numbers")
        
        # Check for facilities created today (likely synthetic)
        cursor.execute("""
            SELECT name, city, county, created_at 
            FROM communities 
            WHERE state = 'FL' 
            AND DATE(created_at) = CURRENT_DATE
            ORDER BY created_at DESC
        """)
        
        today_facilities = cursor.fetchall()
        if today_facilities:
            print(f"\n⚠️  REVIEW NEEDED: {len(today_facilities)} facilities created today")
            for name, city, county, created in today_facilities[:5]:
                print(f"   • {name} ({city}, {county}) - Created: {created}")
        
        # Summary counts
        cursor.execute("SELECT COUNT(*) FROM communities WHERE state = 'FL'")
        total_fl = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(DISTINCT county) FROM communities WHERE state = 'FL'")
        counties_covered = cursor.fetchone()[0]
        
        print(f"\nFLORIDA SUMMARY:")
        print(f"Total Facilities: {total_fl:,}")
        print(f"Counties Covered: {counties_covered}/67")
        print(f"Completion: {(counties_covered/67)*100:.1f}%")
        
        cursor.close()
        conn.close()
        
        return len(synthetic_licenses) + len(generic_addresses)
        
    except Exception as e:
        logger.error(f"Audit error: {str(e)}")
        return -1

def clean_synthetic_data():
    """Remove identified synthetic data"""
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor()
    
    # Remove facilities with synthetic license numbers
    cursor.execute("""
        DELETE FROM communities 
        WHERE state = 'FL' 
        AND license_number LIKE 'FL-BAY-%'
    """)
    deleted_licenses = cursor.rowcount
    
    # Remove facilities with generic Main Street addresses created today
    cursor.execute("""
        DELETE FROM communities 
        WHERE state = 'FL' 
        AND address ~ '^[0-9]+ Main Street$'
        AND DATE(created_at) = CURRENT_DATE
    """)
    deleted_addresses = cursor.rowcount
    
    conn.commit()
    cursor.close()
    conn.close()
    
    return deleted_licenses, deleted_addresses

def main():
    """Execute database integrity audit"""
    try:
        violations = audit_database_integrity()
        
        if violations > 0:
            print(f"\n❌ VIOLATIONS DETECTED: {violations} potential synthetic data entries")
            
            response = input("\nRemove synthetic data? (y/n): ").lower().strip()
            if response == 'y':
                deleted_licenses, deleted_addresses = clean_synthetic_data()
                print(f"\n✅ CLEANUP COMPLETED:")
                print(f"   Removed {deleted_licenses} facilities with synthetic licenses")
                print(f"   Removed {deleted_addresses} facilities with generic addresses")
                
                # Re-audit
                print(f"\nRE-AUDITING...")
                violations_after = audit_database_integrity()
                if violations_after == 0:
                    print(f"\n✅ DATABASE INTEGRITY RESTORED")
                else:
                    print(f"\n⚠️  {violations_after} violations still remain")
        else:
            print(f"\n✅ DATABASE INTEGRITY CONFIRMED - No violations found")
        
        print("="*80)
        
        return 0
        
    except Exception as e:
        logger.error(f"Critical error: {str(e)}")
        return 1

if __name__ == "__main__":
    exit(main())