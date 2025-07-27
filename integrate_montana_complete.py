"""
Integrate Complete Montana Dataset into MySeniorValet Database
Processes the comprehensive Montana dataset and creates SQL INSERT statements
"""

import csv
import json
from datetime import datetime

def read_montana_facilities(csv_file):
    """Read Montana facilities from CSV file"""
    facilities = []
    
    # Find the most recent Montana CSV file
    import os
    import glob
    
    montana_files = glob.glob("montana_complete_facilities_*.csv")
    if not montana_files:
        raise FileNotFoundError("No Montana facilities CSV file found")
    
    # Use the most recent file
    csv_file = max(montana_files, key=os.path.getctime)
    print(f"📖 Reading Montana facilities from: {csv_file}")
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Convert care_types from string representation to array format
            care_types_str = row['care_types'].strip('[]').replace("'", "")
            care_types = [ct.strip() for ct in care_types_str.split(',') if ct.strip()]
            
            facility = {
                'name': row['name'],
                'address': row['address'],
                'city': row['city'],
                'state': row['state'],
                'zip_code': row['zip_code'],
                'phone': row['phone'],
                'county': row['county'],
                'region': row['region'],
                'latitude': float(row['latitude']),
                'longitude': float(row['longitude']),
                'license_number': row['license_number'],
                'license_status': row['license_status'],
                'care_types': care_types,
                'availability_status': row['availability_status'],
                'pricing_type': row['pricing_type'],
                'is_claimed': row['is_claimed'].lower() == 'true',
                'is_verified': row['is_verified'].lower() == 'true',
                'violations': int(row['violations']),
                'review_count': int(row['review_count']),
                'google_review_count': int(row['google_review_count']),
                'facility_type': row['facility_type'],
                'discovery_source': row['discovery_source'],
                'discovery_date': row['discovery_date'],
                'enrichment_completed': row['enrichment_completed'].lower() == 'true'
            }
            facilities.append(facility)
    
    return facilities

def create_sql_inserts(facilities, batch_size=20):
    """Create SQL INSERT statements in batches"""
    sql_statements = []
    
    # Create batched INSERT statements
    for i in range(0, len(facilities), batch_size):
        batch = facilities[i:i + batch_size]
        
        sql = "INSERT INTO communities (\n"
        sql += "  name, address, city, state, zip_code, phone,\n"
        sql += "  care_types, county, region, latitude, longitude,\n"
        sql += "  license_number, license_status,\n"
        sql += "  availability_status, pricing_type, pricing_last_updated,\n"
        sql += "  is_claimed, is_verified, violations, review_count,\n"
        sql += "  google_review_count, facility_type, discovery_source,\n"
        sql += "  discovery_date, enrichment_completed, created_at, updated_at\n"
        sql += ") VALUES\n"
        
        values = []
        for facility in batch:
            care_types_sql = "ARRAY[" + ",".join([f"'{ct}'" for ct in facility['care_types']]) + "]::text[]"
            
            value = f"""  ('{facility['name'].replace("'", "''")}', '{facility['address']}', '{facility['city']}', 
   '{facility['state']}', '{facility['zip_code']}', '{facility['phone']}',
   {care_types_sql}, '{facility['county']}', '{facility['region']}', 
   {facility['latitude']}, {facility['longitude']},
   '{facility['license_number']}', '{facility['license_status']}',
   '{facility['availability_status']}', '{facility['pricing_type']}', NOW(),
   {str(facility['is_claimed']).lower()}, {str(facility['is_verified']).lower()}, 
   {facility['violations']}, {facility['review_count']}, {facility['google_review_count']},
   '{facility['facility_type']}', '{facility['discovery_source']}',
   NOW(), {str(facility['enrichment_completed']).lower()}, NOW(), NOW())"""
            
            values.append(value)
        
        sql += ",\n".join(values) + ";\n\n"
        sql_statements.append(sql)
    
    return sql_statements

def save_sql_file(sql_statements, filename="montana_complete_integration.sql"):
    """Save SQL statements to file"""
    with open(filename, 'w', encoding='utf-8') as f:
        f.write("-- Montana Complete Facilities Integration\n")
        f.write(f"-- Generated: {datetime.now().isoformat()}\n")
        f.write("-- Source: Montana Department of Public Health and Human Services\n\n")
        
        for sql in sql_statements:
            f.write(sql)
    
    print(f"💾 SQL integration file saved: {filename}")
    return filename

def main():
    """Main integration function"""
    print("🏔️ Starting Montana complete dataset integration...")
    
    try:
        # Read facilities
        facilities = read_montana_facilities("")
        print(f"✅ Read {len(facilities)} Montana facilities")
        
        # Create SQL
        sql_statements = create_sql_inserts(facilities)
        print(f"🔧 Generated {len(sql_statements)} SQL batch statements")
        
        # Save SQL file
        sql_file = save_sql_file(sql_statements)
        
        # Summary
        counties = len(set(f['county'] for f in facilities))
        cities = len(set(f['city'] for f in facilities))
        regions = len(set(f['region'] for f in facilities))
        
        print(f"\n📊 Integration Summary:")
        print(f"   Total Facilities: {len(facilities)}")
        print(f"   Counties: {counties}")
        print(f"   Cities: {cities}")
        print(f"   Regions: {regions}")
        print(f"   SQL File: {sql_file}")
        
        print(f"\n🏆 Montana integration ready!")
        print(f"🚀 Next step: Execute the SQL file to add Montana to MySeniorValet database")
        
    except Exception as e:
        print(f"❌ Error in Montana integration: {e}")
        raise

if __name__ == "__main__":
    main()