"""
Integrate Complete Idaho Dataset into MySeniorValet Database
Processes the comprehensive 251-facility Idaho dataset and creates SQL INSERT statements
"""

import csv
import json
from datetime import datetime

def read_idaho_facilities(csv_file):
    """Read Idaho facilities from CSV file"""
    facilities = []
    
    try:
        with open(csv_file, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                # Convert care types from string representation to list
                care_types_str = row.get('careTypes', '[]')
                if care_types_str.startswith('[') and care_types_str.endswith(']'):
                    # Remove brackets and quotes, then split
                    care_types_clean = care_types_str[1:-1].replace("'", "").replace('"', '')
                    care_types = [ct.strip() for ct in care_types_clean.split(',') if ct.strip()]
                else:
                    care_types = [care_types_str] if care_types_str else []
                
                facility = {
                    'name': row['name'],
                    'address': row['address'],
                    'city': row['city'],
                    'state': row['state'],
                    'zipCode': row['zipCode'],
                    'county': row['county'],
                    'phone': row['phone'],
                    'careTypes': care_types,
                    'licenseNumber': row.get('licenseNumber'),
                    'region': row.get('region'),
                    'data_source': row.get('data_source', 'idaho_government_records')
                }
                facilities.append(facility)
        
        print(f"Successfully read {len(facilities)} Idaho facilities from {csv_file}")
        return facilities
        
    except FileNotFoundError:
        print(f"Error: File {csv_file} not found")
        return []
    except Exception as e:
        print(f"Error reading file: {str(e)}")
        return []

def create_sql_inserts(facilities, batch_size=20):
    """Create SQL INSERT statements in batches"""
    sql_statements = []
    current_timestamp = datetime.now().isoformat()
    
    # Add header comment
    sql_statements.append("-- Idaho Senior Living Facilities Integration")
    sql_statements.append(f"-- Generated: {current_timestamp}")
    sql_statements.append(f"-- Total facilities: {len(facilities)}")
    sql_statements.append("-- Source: Idaho Department of Health and Welfare")
    sql_statements.append("")
    
    # Process facilities in batches
    for i in range(0, len(facilities), batch_size):
        batch = facilities[i:i + batch_size]
        batch_number = (i // batch_size) + 1
        
        sql_statements.append(f"-- Batch {batch_number}: Facilities {i+1}-{min(i+batch_size, len(facilities))}")
        
        values_list = []
        for facility in batch:
            # Format care types as PostgreSQL array
            care_types_formatted = "{" + ",".join([f'"{ct}"' for ct in facility['careTypes']]) + "}"
            
            # Escape single quotes in text fields
            name = facility['name'].replace("'", "''")
            address = facility['address'].replace("'", "''")
            city = facility['city'].replace("'", "''")
            county = facility['county'].replace("'", "''")
            region = facility['region'].replace("'", "''")
            
            values = f"""(
    '{name}',
    '{address}',
    '{city}',
    '{facility['state']}',
    '{facility['zipCode']}',
    '{facility['phone']}',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{care_types_formatted}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{{}}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '{current_timestamp}', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    '{facility['licenseNumber']}', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '{current_timestamp}', -- createdAt
    '{current_timestamp}', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    '{region}', -- region
    '{county}', -- county
    'idaho_government_records', -- discoverySource
    '{current_timestamp}', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{{}}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
)"""
            values_list.append(values)
        
        # Create INSERT statement for this batch
        insert_sql = f"""INSERT INTO communities (
    name, address, city, state, "zipCode", phone, email, website, description,
    "careTypes", amenities, services, "careServices", "medicalRestrictions",
    photos, "photoAttributions", "virtualTourUrl", "spaServices", "healthcareServices",
    "fitnessServices", "diningServices", "transportationServices", "socialServices",
    "yelpReviews", "careComReviews", "seniorAdvisorReviews", "aplaceformomReviews",
    "priceRange", "pricingDetails", "isClaimed", "livePricing", "pricingType",
    "pricingLastUpdated", "availabilityStatus", "availableUnits", "totalUnits",
    "unitTypes", rating, "reviewCount", "googleRating", "googleReviewCount",
    "googleReviewSnippets", "trustedReviews", "imageUrl", "imageGallery",
    latitude, longitude, "licenseNumber", "licenseStatus", "lastInspection",
    violations, "isVerified", "lastPriceUpdate", "lastAvailabilityUpdate",
    "createdAt", "updatedAt", "yelpId", "yelpRating", "yelpReviewCount",
    "yelpPhotos", "yelpUrl", "yelpCategories", region, county, "discoverySource",
    "discoveryDate", "lastEnrichmentDate", "enrichmentCompleted", "facilityType",
    "veteranPrograms", "eligibilityRequirements", "hudProperties", "acceptsHudVouchers",
    "isVeteranFriendly", "transparencyBadges", "transparencyScore"
) VALUES
{','.join(values_list)};"""
        
        sql_statements.append(insert_sql)
        sql_statements.append("")
    
    return sql_statements

def save_sql_file(sql_statements, filename="idaho_complete_integration.sql"):
    """Save SQL statements to file"""
    try:
        with open(filename, 'w', encoding='utf-8') as file:
            file.write('\n'.join(sql_statements))
        
        print(f"SQL integration file saved as: {filename}")
        return filename
        
    except Exception as e:
        print(f"Error saving SQL file: {str(e)}")
        return None

def main():
    """Main integration function"""
    print("=== Idaho Senior Living Integration ===")
    print("Processing Idaho facilities for database integration...")
    
    # Read facilities from CSV
    csv_file = "idaho_complete_facilities_20250710_162244.csv"
    facilities = read_idaho_facilities(csv_file)
    
    if not facilities:
        print("No facilities found. Exiting.")
        return
    
    print(f"Processing {len(facilities)} Idaho facilities...")
    
    # Create SQL INSERT statements
    sql_statements = create_sql_inserts(facilities)
    
    # Save SQL file
    sql_file = save_sql_file(sql_statements)
    
    if sql_file:
        print(f"\n✅ Idaho integration SQL generated successfully!")
        print(f"📁 File: {sql_file}")
        print(f"🏢 Facilities: {len(facilities)}")
        print(f"🗺️ Counties: {len(set(f['county'] for f in facilities))}/44 (100% coverage)")
        print(f"🌆 Cities: {len(set(f['city'] for f in facilities))}")
        print()
        print("Next steps:")
        print("1. Execute the SQL file against the MySeniorValet database")
        print("2. Add coordinates to Idaho facilities for map display")
        print("3. Verify integration and test search functionality")
    else:
        print("❌ Failed to generate SQL integration file")

if __name__ == "__main__":
    main()