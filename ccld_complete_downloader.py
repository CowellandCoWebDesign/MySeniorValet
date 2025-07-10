#!/usr/bin/env python3
"""
Complete CCLD Facilities Data Downloader
Downloads ALL Community Care Licensing facilities including:
- Adult Residential Facilities (ARF)
- Residential Care Facilities for the Elderly (RCFE)
- Enhanced Behavioral Support Homes
- Social Rehabilitation Facilities
- And all other CCLD-licensed facilities
"""

import requests
import pandas as pd
import json
from datetime import datetime
import time

# CCLD Complete Dataset from CHHS Open Data Portal
CCLD_DATASET_URL = "https://data.chhs.ca.gov/dataset/ccl-facilities"

# Possible CSV download URLs based on CHHS patterns
CCLD_CSV_URLS = [
    "https://data.chhs.ca.gov/dataset/community-care-licensing-facilities/resource/dd6a5f0f-7093-4b2f-a7f4-d3b8fe2158ce/download/facilities.csv",
    "https://data.chhs.ca.gov/dataset/fb01d547-0d2a-4cd6-bdbe-7b19ddeb2e11/resource/dd6a5f0f-7093-4b2f-a7f4-d3b8fe2158ce/download/facilities.csv",
    "https://data.chhs.ca.gov/api/3/action/datastore_search?resource_id=dd6a5f0f-7093-4b2f-a7f4-d3b8fe2158ce&limit=10000"
]

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (compatible; TrueViewBot/1.0; +https://trueviewsenior.com)'
}

def try_download_ccld_data():
    """Try different methods to download CCLD facility data"""
    
    # Method 1: Try direct CSV downloads
    for i, url in enumerate(CCLD_CSV_URLS[:2]):
        print(f"Trying download method {i+1}: Direct CSV from {url[:60]}...")
        try:
            response = requests.get(url, headers=HEADERS, timeout=60)
            
            if response.status_code == 200:
                filename = f"california_ccld_facilities_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
                
                with open(filename, 'wb') as f:
                    f.write(response.content)
                
                print(f"✅ Successfully downloaded to {filename}")
                print(f"   Size: {len(response.content):,} bytes")
                
                # Try to parse and show info
                try:
                    df = pd.read_csv(filename)
                    print(f"   Rows: {len(df):,}")
                    print(f"   Columns: {list(df.columns)[:5]}... ({len(df.columns)} total)")
                    return df, filename
                except Exception as e:
                    print(f"   Warning: Could not parse CSV - {e}")
                    return None, filename
                    
        except Exception as e:
            print(f"   Failed: {e}")
    
    # Method 2: Try API endpoint
    print("\nTrying download method 3: CKAN API...")
    try:
        api_url = CCLD_CSV_URLS[2]
        response = requests.get(api_url, headers=HEADERS, timeout=60)
        
        if response.status_code == 200:
            data = response.json()
            
            if 'result' in data and 'records' in data['result']:
                records = data['result']['records']
                total = data['result'].get('total', len(records))
                
                print(f"✅ API returned {len(records)} records (total available: {total})")
                
                # If there are more records, fetch them all
                all_records = records
                offset = len(records)
                
                while offset < total and offset < 50000:  # Limit to 50k for safety
                    print(f"   Fetching records {offset} to {offset + 10000}...")
                    next_url = f"{api_url}&offset={offset}"
                    next_response = requests.get(next_url, headers=HEADERS, timeout=60)
                    
                    if next_response.status_code == 200:
                        next_data = next_response.json()
                        if 'result' in next_data and 'records' in next_data['result']:
                            all_records.extend(next_data['result']['records'])
                            offset += len(next_data['result']['records'])
                        else:
                            break
                    else:
                        break
                    
                    time.sleep(1)  # Be respectful
                
                # Convert to DataFrame
                df = pd.DataFrame(all_records)
                filename = f"california_ccld_facilities_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
                df.to_csv(filename, index=False)
                
                print(f"✅ Downloaded {len(df):,} total records to {filename}")
                return df, filename
                
    except Exception as e:
        print(f"   API method failed: {e}")
    
    return None, None

def analyze_facility_types(df):
    """Analyze the types of facilities in the dataset"""
    if df is None or df.empty:
        return
    
    print("\n📊 Facility Type Analysis:")
    
    # Look for facility type columns
    type_columns = [col for col in df.columns if 'type' in col.lower() or 'category' in col.lower()]
    
    if type_columns:
        for col in type_columns:
            print(f"\n{col}:")
            counts = df[col].value_counts()
            for ftype, count in counts.head(20).items():
                print(f"   {ftype}: {count:,}")
    
    # Look for adult residential facilities specifically
    print("\n🔍 Searching for Adult Residential facilities...")
    
    # Create mask for adult residential facilities
    adult_mask = pd.Series([False] * len(df))
    
    for col in df.columns:
        if df[col].dtype == 'object':  # Text columns only
            try:
                # Look for various adult residential patterns
                adult_mask |= df[col].str.contains('Adult Residential|ARF|RCFE|Adult Care', 
                                                  case=False, na=False)
            except:
                pass
    
    adult_facilities = df[adult_mask]
    print(f"✅ Found {len(adult_facilities):,} facilities that appear to be Adult Residential")
    
    return adult_facilities

def save_filtered_data(df, facility_type="adult_residential"):
    """Save filtered facility data"""
    if df is None or df.empty:
        return None
        
    filename = f"california_{facility_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    df.to_csv(filename, index=False)
    
    print(f"✅ Saved {len(df):,} {facility_type} facilities to {filename}")
    
    # Save summary
    summary = {
        'total_facilities': len(df),
        'columns': list(df.columns),
        'sample_data': df.head(5).to_dict('records') if len(df) > 0 else []
    }
    
    summary_filename = f"california_{facility_type}_summary_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    
    with open(summary_filename, 'w') as f:
        json.dump(summary, f, indent=2)
    
    print(f"📊 Summary saved to {summary_filename}")
    
    return filename

def main():
    """Main execution function"""
    print("🏠 Complete CCLD Facilities Data Downloader")
    print("=" * 50)
    print("Downloading ALL Community Care Licensing facilities...")
    print("Including: Adult Residential, RCFE, ARF, SRF, and more")
    print()
    
    # Download the data
    df, filename = try_download_ccld_data()
    
    if df is not None:
        print(f"\n✅ DOWNLOAD SUCCESSFUL!")
        print(f"   Total facilities: {len(df):,}")
        print(f"   Data saved to: {filename}")
        
        # Analyze facility types
        adult_facilities = analyze_facility_types(df)
        
        # Save filtered adult residential data if found
        if adult_facilities is not None and len(adult_facilities) > 0:
            save_filtered_data(adult_facilities, "adult_residential_filtered")
            
    else:
        print("\n❌ Failed to download CCLD data")
        print("You may need to:")
        print("1. Visit https://data.chhs.ca.gov/dataset/ccl-facilities")
        print("2. Click on the 'Download' button for the CSV file")
        print("3. Save it as 'california_ccld_facilities.csv'")
        print("4. Run the integration script to add to database")

if __name__ == "__main__":
    main()