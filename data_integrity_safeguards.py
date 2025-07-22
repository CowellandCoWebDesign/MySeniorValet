#!/usr/bin/env python3
"""
Data Integrity Safeguards
Prevent synthetic data insertion at database and API level
"""

import os
import re
import logging

class DataIntegrityValidator:
    """Validator to ensure only authentic data enters the system"""
    
    def __init__(self):
        self.forbidden_patterns = {
            'address': [
                r'^[0-9]+ Main Street$',
                r'^[0-9]+ First Street$', 
                r'^[0-9]+ Oak Street$',
                r'^[0-9]+ Elm Street$',
                r'^[0-9]+ Park Avenue$'
            ],
            'phone': [
                r'^\(555\)',
                r'^\(000\)',
                r'^\(999\)',
                r'555-0\d{3}$'
            ],
            'name': [
                r'Senior Living \d+$',
                r'Community \d+$',
                r'Facility \d+$',
                r'Test Community',
                r'Sample Facility'
            ]
        }
    
    def validate_community_data(self, community_data):
        """Validate community data for authenticity"""
        
        errors = []
        
        # Validate address
        address = community_data.get('address', '')
        for pattern in self.forbidden_patterns['address']:
            if re.match(pattern, address):
                errors.append(f"Synthetic address pattern detected: {address}")
        
        # Validate phone
        phone = community_data.get('phone', '')
        for pattern in self.forbidden_patterns['phone']:
            if re.match(pattern, phone):
                errors.append(f"Synthetic phone pattern detected: {phone}")
        
        # Validate name
        name = community_data.get('name', '')
        for pattern in self.forbidden_patterns['name']:
            if re.search(pattern, name):
                errors.append(f"Synthetic name pattern detected: {name}")
        
        # Require essential fields
        required_fields = ['name', 'address', 'city', 'state', 'phone']
        for field in required_fields:
            if not community_data.get(field):
                errors.append(f"Missing required field: {field}")
        
        # Check for realistic phone number
        if phone and len(phone.replace('(', '').replace(')', '').replace('-', '').replace(' ', '')) != 10:
            errors.append(f"Invalid phone number format: {phone}")
        
        return errors

# Database trigger function to prevent synthetic data
DATABASE_TRIGGER_SQL = """
CREATE OR REPLACE FUNCTION prevent_synthetic_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Prevent fake addresses
    IF NEW.address ~ '^[0-9]+ Main Street$' THEN
        RAISE EXCEPTION 'Synthetic address pattern not allowed: %', NEW.address;
    END IF;
    
    -- Prevent fake phone numbers
    IF NEW.phone ~ '^\\(555\\)' THEN
        RAISE EXCEPTION 'Synthetic phone number not allowed: %', NEW.phone;
    END IF;
    
    -- Prevent sequential names
    IF NEW.name ~ 'Senior Living \\d+$' OR NEW.name ~ 'Community \\d+$' THEN
        RAISE EXCEPTION 'Synthetic name pattern not allowed: %', NEW.name;
    END IF;
    
    -- Require phone number
    IF NEW.phone IS NULL OR NEW.phone = '' OR NEW.phone = 'N/A' THEN
        RAISE EXCEPTION 'Phone number is required for all communities';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS check_synthetic_data ON communities;
CREATE TRIGGER check_synthetic_data
    BEFORE INSERT OR UPDATE ON communities
    FOR EACH ROW
    EXECUTE FUNCTION prevent_synthetic_data();
"""

def implement_database_safeguards():
    """Implement database-level safeguards"""
    
    import psycopg2
    
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        raise ValueError("DATABASE_URL not found")
    
    try:
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        # Execute trigger creation
        cursor.execute(DATABASE_TRIGGER_SQL)
        conn.commit()
        
        print("✅ Database triggers implemented to prevent synthetic data")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error implementing safeguards: {str(e)}")

if __name__ == "__main__":
    implement_database_safeguards()