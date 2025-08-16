#!/usr/bin/env python3
"""Test script to check what columns actually exist in communities table"""

import psycopg2
import os

DATABASE_URL = os.environ.get('DATABASE_URL')

def check_columns():
    """Check actual columns in communities table"""
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    # Get column information
    cur.execute("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'communities' 
        ORDER BY ordinal_position
    """)
    
    print("Columns in communities table:")
    print("-" * 40)
    columns = cur.fetchall()
    for col_name, col_type in columns:
        print(f"  {col_name}: {col_type}")
    
    print(f"\nTotal columns: {len(columns)}")
    
    # Check specific columns we need
    column_names = [col[0] for col in columns]
    required_cols = ['name', 'address', 'city', 'state', 'zip_code', 'country', 
                     'phone', 'website', 'care_types', 'amenities', 'description']
    
    print("\nChecking required columns:")
    for col in required_cols:
        if col in column_names:
            print(f"  ✓ {col} exists")
        else:
            print(f"  ✗ {col} MISSING")
    
    cur.close()
    conn.close()

if __name__ == "__main__":
    check_columns()