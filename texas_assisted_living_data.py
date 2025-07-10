import requests
import json
import csv
import time

# Texas Open Data Portal - HHSC CCL Residential Operations
API_BASE = "https://data.texas.gov/resource/bc5r-88dy.json"

def fetch_assisted_living_facilities():
    """
    Fetch assisted living facilities from Texas HHSC CCL dataset
    Looking specifically for residential operations that are assisted living
    """
    
    headers = {
        "Accept": "application/json",
        "User-Agent": "TrueView Data Collection"
    }
    
    all_facilities = []
    offset = 0
    limit = 1000
    
    print("Fetching Texas assisted living facilities from HHSC CCL dataset...")
    
    while True:
        # First, let's get all residential operations
        params = {
            "$limit": limit,
            "$offset": offset,
            "$order": "operation_name ASC"
        }
        
        try:
            response = requests.get(API_BASE, params=params, headers=headers, timeout=30)
            response.raise_for_status()
            batch = response.json()
            
            if not batch:
                break
            
            # Filter for assisted living type operations
            for record in batch:
                operation_type = record.get('operation_type', '').upper()
                operation_name = record.get('operation_name', '').upper()
                programs = record.get('programs_provided', '').upper()
                
                # Look for assisted living indicators
                # Check if it's a General Residential Operation (GRO) which includes assisted living
                if operation_type == 'GENERAL RESIDENTIAL OPERATION' or \
                   'ASSISTED' in operation_name or \
                   'SENIOR' in operation_name or \
                   'ADULT' in programs or \
                   'ELDERLY' in operation_name:
                    
                    facility = {
                        'ProviderID': record.get('operation_id', ''),
                        'Name': record.get('operation_name', ''),
                        'Type': operation_type,
                        'Address': record.get('location_address', ''),
                        'City': record.get('city', ''),
                        'County': record.get('county', ''),
                        'State': 'TX',
                        'ZipCode': record.get('zipcode', ''),
                        'Phone': record.get('phone_number', ''),
                        'Email': record.get('email_address', ''),
                        'Website': record.get('website_address', ''),
                        'Capacity': record.get('total_capacity', ''),
                        'Status': record.get('operation_status', ''),
                        'IssueDate': record.get('issuance_date', ''),
                        'Administrator': record.get('administrator_director_name', ''),
                        'Programs': record.get('programs_provided', '')
                    }
                    
                    all_facilities.append(facility)
            
            print(f"Processed {offset + len(batch)} records, found {len(all_facilities)} potential assisted living facilities...")
            
            if len(batch) < limit:
                break
                
            offset += limit
            time.sleep(0.5)  # Be respectful to the API
            
        except Exception as e:
            print(f"Error fetching batch at offset {offset}: {e}")
            break
    
    print(f"\nTotal facilities found: {len(all_facilities)}")
    
    # Save to CSV
    if all_facilities:
        with open('texas_assisted_living_facilities.csv', 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=all_facilities[0].keys())
            writer.writeheader()
            writer.writerows(all_facilities)
        
        print(f"Saved {len(all_facilities)} facilities to texas_assisted_living_facilities.csv")
        
        # Show county distribution
        counties = {}
        for facility in all_facilities:
            county = facility.get('County', 'Unknown')
            counties[county] = counties.get(county, 0) + 1
        
        print(f"\nCounties covered: {len(counties)}")
        print("Top 10 counties by facility count:")
        for county, count in sorted(counties.items(), key=lambda x: x[1], reverse=True)[:10]:
            print(f"  {county}: {count} facilities")
        
        # Show sample facilities
        print("\nSample facilities:")
        for facility in all_facilities[:10]:
            print(f"  - {facility['Name']} ({facility['Type']}) in {facility['City']}, {facility['County']} County")
            if facility['Programs']:
                print(f"    Programs: {facility['Programs']}")
    
    return all_facilities

def integrate_texas_facilities():
    """Integrate Texas facilities into TrueView database"""
    facilities = fetch_assisted_living_facilities()
    
    if not facilities:
        print("No facilities to integrate")
        return
    
    # Create integration script
    integration_script = """
const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
const fs = require('fs');
const csv = require('csv-parser');

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function integrateTexasFacilities() {
  console.log('🤠 TEXAS EXPANSION - Integrating Assisted Living Facilities');
  
  const facilities = [];
  
  await new Promise((resolve, reject) => {
    fs.createReadStream('texas_assisted_living_facilities.csv')
      .pipe(csv())
      .on('data', (row) => {
        facilities.push(row);
      })
      .on('end', resolve)
      .on('error', reject);
  });
  
  console.log(`✅ Loaded ${facilities.length} Texas facilities`);
  
  let addedCount = 0;
  
  for (const facility of facilities) {
    try {
      // Check if already exists
      const checkQuery = `SELECT id FROM communities WHERE name = $1 AND city = $2 AND state = $3`;
      const existing = await pool.query(checkQuery, [facility.Name, facility.City, 'TX']);
      
      if (existing.rows.length === 0) {
        const insertQuery = `
          INSERT INTO communities (
            name, address, city, state, zip_code, phone, county,
            care_types, amenities, services, medical_restrictions,
            discovery_source, discovery_date, is_verified
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
          )
        `;
        
        const values = [
          facility.Name,
          facility.Address,
          facility.City,
          'TX',
          facility.ZipCode,
          facility.Phone,
          facility.County,
          ['Assisted Living'], // care_types
          [], // amenities
          [], // services
          [], // medical_restrictions
          'Texas HHSC CCL Dataset',
          new Date().toISOString(),
          true // is_verified
        ];
        
        await pool.query(insertQuery, values);
        addedCount++;
        
        if (addedCount % 50 === 0) {
          console.log(`✅ Added ${addedCount} facilities...`);
        }
      }
    } catch (error) {
      console.error(`❌ Error adding ${facility.Name}:`, error.message);
    }
  }
  
  console.log(`\\n🎯 TEXAS EXPANSION COMPLETE`);
  console.log(`✅ Successfully added: ${addedCount} new facilities`);
  
  await pool.end();
}

integrateTexasFacilities().catch(console.error);
"""
    
    with open('integrate-texas-facilities.cjs', 'w') as f:
        f.write(integration_script)
    
    print("\n✅ Created integration script: integrate-texas-facilities.cjs")
    print("Run: node integrate-texas-facilities.cjs")

if __name__ == "__main__":
    integrate_texas_facilities()