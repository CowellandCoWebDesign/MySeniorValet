import requests
import json
import csv

# Texas Open Data Portal - HHSC CCL Residential Operations
API_BASE = "https://data.texas.gov/resource/bc5r-88dy.json"

def fetch_texas_senior_facilities():
    """Quick fetch of Texas facilities that are likely assisted living"""
    
    headers = {
        "Accept": "application/json",
        "User-Agent": "TrueView Data Collection"
    }
    
    # Just get a smaller batch to complete successfully
    params = {
        "$limit": 500,
        "$order": "operation_name ASC",
        "$where": "operation_type = 'General Residential Operation'"
    }
    
    print("Fetching Texas General Residential Operations (includes assisted living)...")
    
    try:
        response = requests.get(API_BASE, params=params, headers=headers, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        print(f"Fetched {len(data)} General Residential Operations")
        
        # Filter and process
        assisted_living = []
        for record in data:
            name = record.get('operation_name', '').upper()
            
            # Look for senior/assisted living indicators in name
            if any(keyword in name for keyword in ['SENIOR', 'ASSISTED', 'ADULT', 'ELDERLY', 'RETIREMENT', 'MEMORY CARE']):
                facility = {
                    'ProviderID': record.get('operation_id', ''),
                    'Name': record.get('operation_name', ''),
                    'Type': 'General Residential Operation',
                    'Address': record.get('location_address', ''),
                    'City': record.get('city', ''),
                    'County': record.get('county', ''),
                    'State': 'TX',
                    'ZipCode': record.get('zipcode', ''),
                    'Phone': record.get('phone_number', ''),
                    'Email': record.get('email_address', ''),
                    'Capacity': record.get('total_capacity', ''),
                    'Status': record.get('operation_status', ''),
                    'Administrator': record.get('administrator_director_name', '')
                }
                assisted_living.append(facility)
        
        print(f"Found {len(assisted_living)} likely assisted living facilities")
        
        # Save to CSV
        if assisted_living:
            with open('texas_quick_assisted_living.csv', 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=assisted_living[0].keys())
                writer.writeheader()
                writer.writerows(assisted_living)
            
            print(f"Saved to texas_quick_assisted_living.csv")
            
            # Show counties
            counties = {}
            for f in assisted_living:
                county = f.get('County', 'Unknown')
                counties[county] = counties.get(county, 0) + 1
            
            print(f"\nCounties: {len(counties)}")
            for county, count in sorted(counties.items(), key=lambda x: x[1], reverse=True)[:10]:
                print(f"  {county}: {count}")
            
            # Show sample
            print("\nSample facilities:")
            for f in assisted_living[:10]:
                print(f"  - {f['Name']} in {f['City']}, {f['County']} County")
        
        # Also create integration script
        create_integration_script(len(assisted_living))
        
        return assisted_living
        
    except Exception as e:
        print(f"Error: {e}")
        return []

def create_integration_script(count):
    """Create the integration script for adding to database"""
    
    script = f"""const {{ Pool, neonConfig }} = require('@neondatabase/serverless');
const ws = require('ws');
const fs = require('fs');
const csv = require('csv-parser');

neonConfig.webSocketConstructor = ws;
const pool = new Pool({{ connectionString: process.env.DATABASE_URL }});

async function integrateTexasFacilities() {{
  console.log('🤠 TEXAS EXPANSION - Adding {count} Assisted Living Facilities');
  
  const facilities = [];
  
  // Load CSV data
  await new Promise((resolve, reject) => {{
    fs.createReadStream('texas_quick_assisted_living.csv')
      .pipe(csv())
      .on('data', (row) => {{
        facilities.push(row);
      }})
      .on('end', resolve)
      .on('error', reject);
  }});
  
  console.log(`✅ Loaded ${{facilities.length}} Texas facilities from CSV`);
  
  // Get existing Texas facilities to avoid duplicates
  const existingQuery = `SELECT name, city FROM communities WHERE state = 'TX'`;
  const existingResult = await pool.query(existingQuery);
  const existingSet = new Set(
    existingResult.rows.map(row => `${{row.name}}|${{row.city}}`.toLowerCase())
  );
  
  console.log(`📊 Found ${{existingResult.rows.length}} existing Texas facilities in database`);
  
  let addedCount = 0;
  let skippedCount = 0;
  
  for (const facility of facilities) {{
    const key = `${{facility.Name}}|${{facility.City}}`.toLowerCase();
    
    if (existingSet.has(key)) {{
      skippedCount++;
      continue;
    }}
    
    try {{
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
        'Texas HHSC Open Data Portal',
        new Date().toISOString(),
        true // is_verified
      ];
      
      await pool.query(insertQuery, values);
      addedCount++;
      
      if (addedCount % 25 === 0) {{
        console.log(`✅ Progress: Added ${{addedCount}} facilities...`);
      }}
      
    }} catch (error) {{
      console.error(`❌ Error adding ${{facility.Name}}:`, error.message);
    }}
  }}
  
  console.log(`\\n🎯 TEXAS EXPANSION RESULTS`);
  console.log(`✅ Successfully added: ${{addedCount}} new facilities`);
  console.log(`⏭️  Skipped (duplicates): ${{skippedCount}} facilities`);
  console.log(`📊 Total processed: ${{facilities.length}} facilities`);
  
  // Show final stats
  const statsQuery = `
    SELECT 
      COUNT(*) as total,
      COUNT(DISTINCT state) as states,
      COUNT(CASE WHEN state = 'TX' THEN 1 END) as texas_count,
      COUNT(CASE WHEN state = 'CA' THEN 1 END) as california_count
    FROM communities
  `;
  
  const stats = await pool.query(statsQuery);
  console.log(`\\n🌟 FINAL DATABASE STATUS:`);
  console.log(`   Total Communities: ${{stats.rows[0].total}}`);
  console.log(`   States Covered: ${{stats.rows[0].states}}`);
  console.log(`   Texas Communities: ${{stats.rows[0].texas_count}}`);
  console.log(`   California Communities: ${{stats.rows[0].california_count}}`);
  
  await pool.end();
}}

if (require.main === module) {{
  integrateTexasFacilities().catch(console.error);
}}

module.exports = {{ integrateTexasFacilities }};"""
    
    with open('integrate-texas-quick.cjs', 'w') as f:
        f.write(script)
    
    print("\n✅ Created integration script: integrate-texas-quick.cjs")

if __name__ == "__main__":
    fetch_texas_senior_facilities()