#!/usr/bin/env python3
"""
California Health and Human Services Open Data Portal - Facility Data Downloader
Downloads authentic senior living facility data from official California government sources

Data Sources:
1. ALW Assisted Living Facilities - https://data.chhs.ca.gov/dataset/alw-assisted-living-facilities
2. Licensed Healthcare Facility Listing - https://data.chhs.ca.gov/dataset/healthcare-facility-locations
3. Healthcare Facility Services - https://data.chhs.ca.gov/dataset/healthcare-facility-services
"""

import requests
import pandas as pd
import json
import os
from datetime import datetime
import time

# Configuration
DATASETS = {
    'alw_assisted_living': {
        'name': 'ALW Assisted Living Facilities',
        'url': 'https://data.chhs.ca.gov/dataset/alw-assisted-living-facilities',
        'csv_url': 'https://gis.dhcs.ca.gov/api/download/v1/items/c9b6f8ecdd194f46be0ea41d46b875c3/csv?layers=0',
        'description': 'Facilities enrolled in the Medi-Cal Assisted Living Waiver program'
    },
    'healthcare_facilities': {
        'name': 'Licensed Healthcare Facility Listing',
        'url': 'https://data.chhs.ca.gov/dataset/healthcare-facility-locations',
        'csv_url': 'https://data.chhs.ca.gov/dataset/3b5b80e8-6b8d-4715-b3c0-2699af6e72e5/resource/f0ae5731-fef8-417f-839d-54a0ed3a126e/download/health_facility_locations.csv',
        'description': 'Comprehensive list of all California healthcare facilities including skilled nursing'
    }
}

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (compatible; MySeniorValetBot/1.0; +https://myseniorvalet.com)'
}

def download_dataset(dataset_key, dataset_info):
    """Download a specific dataset from California Open Data Portal"""
    try:
        print(f"Downloading {dataset_info['name']}...")
        
        # Try direct CSV download first
        csv_url = dataset_info['csv_url']
        response = requests.get(csv_url, headers=HEADERS, timeout=60)
        
        if response.status_code == 200:
            filename = f"california_{dataset_key}_{datetime.now().strftime('%Y%m%d')}.csv"
            
            # Save raw CSV
            with open(filename, 'wb') as f:
                f.write(response.content)
            
            print(f"✅ Successfully downloaded {filename}")
            print(f"   Size: {len(response.content)} bytes")
            
            # Try to parse and show sample
            try:
                df = pd.read_csv(filename)
                print(f"   Rows: {len(df)}")
                print(f"   Columns: {list(df.columns)}")
                
                # Show first few rows
                print(f"   Sample data:")
                print(df.head(2).to_string(index=False))
                
                return df, filename
                
            except Exception as e:
                print(f"   Warning: Could not parse CSV - {e}")
                return None, filename
                
        else:
            print(f"❌ Failed to download {dataset_key}: HTTP {response.status_code}")
            return None, None
            
    except Exception as e:
        print(f"❌ Error downloading {dataset_key}: {e}")
        return None, None

def filter_senior_living_facilities(df, dataset_key):
    """Filter datasets for senior living facilities"""
    if df is None:
        return None
    
    if dataset_key == 'alw_assisted_living':
        # ALW dataset is already filtered for assisted living
        filtered_df = df
        
    elif dataset_key == 'healthcare_facilities':
        # Look at the FAC_FDR column which contains facility descriptions
        print(f"   Checking columns: {list(df.columns)}")
        
        # Check for SNF (Skilled Nursing Facility) and other senior care types
        conditions = []
        
        if 'FAC_FDR' in df.columns:
            snf_condition = df['FAC_FDR'].str.contains('SKILLED NURSING', case=False, na=False)
            residential_condition = df['FAC_FDR'].str.contains('RESIDENTIAL CARE', case=False, na=False)
            conditions.extend([snf_condition, residential_condition])
            
        if 'FAC_TYPE_CODE' in df.columns:
            # Filter by facility type codes - SNF is a major category
            snf_type = df['FAC_TYPE_CODE'].str.contains('SNF', case=False, na=False)
            conditions.append(snf_type)
            
        if 'FACNAME' in df.columns:
            # Filter by facility names containing senior living keywords
            senior_names = df['FACNAME'].str.contains('|'.join([
                'SKILLED NURSING', 'NURSING HOME', 'RESIDENTIAL CARE',
                'ASSISTED LIVING', 'MEMORY CARE', 'SENIOR LIVING',
                'ELDERLY CARE', 'BOARD AND CARE', 'CONVALESCENT'
            ]), case=False, na=False)
            conditions.append(senior_names)
        
        if conditions:
            # Combine all conditions with OR logic
            combined_condition = conditions[0]
            for condition in conditions[1:]:
                combined_condition = combined_condition | condition
            
            filtered_df = df[combined_condition]
        else:
            filtered_df = None
            
    else:
        filtered_df = None
    
    if filtered_df is not None and len(filtered_df) > 0:
        print(f"   Filtered to {len(filtered_df)} senior living facilities")
        return filtered_df
    else:
        print(f"   No senior living facilities found in {dataset_key}")
        return None

def standardize_facility_data(df, dataset_key):
    """Standardize facility data to common format"""
    if df is None:
        return None
    
    # Common field mapping based on actual column names
    field_mapping = {
        'alw_assisted_living': {
            'name': ['Legal_Name', 'Business_Name'],
            'address': ['Address'],
            'city': ['City'],
            'state': ['State'],
            'zip': ['Zip_Code'],
            'phone': ['Phone_Number'],
            'capacity': ['Capacity_Per_PEU'],
            'license_number': ['Number'],
            'latitude': ['Latitude'],
            'longitude': ['Longitude'],
            'county': ['County', 'CountyName']
        },
        'healthcare_facilities': {
            'name': ['FACNAME', 'BUSINESS_NAME'],
            'address': ['ADDRESS'],
            'city': ['CITY'],
            'state': ['STATE'],
            'zip': ['ZIP'],
            'phone': ['CONTACT_PHONE_NUMBER'],
            'facility_type': ['FAC_FDR', 'FAC_TYPE_CODE'],
            'license_number': ['LICENSE_NUMBER', 'FACID'],
            'latitude': ['LATITUDE'],
            'longitude': ['LONGITUDE'],
            'county': ['COUNTY_NAME'],
            'capacity': ['CAPACITY']
        }
    }
    
    if dataset_key not in field_mapping:
        return df
    
    mapping = field_mapping[dataset_key]
    standardized_data = []
    
    for _, row in df.iterrows():
        facility = {
            'data_source': dataset_key,
            'scraped_at': datetime.now().isoformat()
        }
        
        # Map fields using first available column
        for standard_field, possible_columns in mapping.items():
            for col in possible_columns:
                if col in df.columns and pd.notna(row[col]):
                    facility[standard_field] = str(row[col]).strip()
                    break
            
            # Set default if not found
            if standard_field not in facility:
                facility[standard_field] = ''
        
        # Add any additional fields from the original dataset
        for col in df.columns:
            if col not in [item for sublist in mapping.values() for item in sublist]:
                facility[f'original_{col.lower()}'] = str(row[col]) if pd.notna(row[col]) else ''
        
        standardized_data.append(facility)
    
    return pd.DataFrame(standardized_data)

def merge_facility_data(datasets):
    """Merge multiple datasets into a comprehensive facility database"""
    merged_facilities = []
    
    for dataset_key, df in datasets.items():
        if df is not None:
            merged_facilities.append(df)
    
    if merged_facilities:
        combined_df = pd.concat(merged_facilities, ignore_index=True)
        
        # Remove duplicates based on license number and name
        combined_df = combined_df.drop_duplicates(subset=['license_number', 'name'], keep='first')
        
        print(f"✅ Merged data: {len(combined_df)} unique facilities")
        return combined_df
    else:
        print("❌ No facility data to merge")
        return None

def save_results(df, filename_prefix="california_facilities"):
    """Save results in multiple formats"""
    if df is None:
        return
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    # Save CSV
    csv_filename = f"{filename_prefix}_{timestamp}.csv"
    df.to_csv(csv_filename, index=False)
    print(f"✅ Saved CSV: {csv_filename}")
    
    # Save JSON
    json_filename = f"{filename_prefix}_{timestamp}.json"
    df.to_json(json_filename, orient='records', indent=2)
    print(f"✅ Saved JSON: {json_filename}")
    
    # Save summary
    summary = {
        'total_facilities': len(df),
        'data_sources': df['data_source'].value_counts().to_dict(),
        'cities': df['city'].value_counts().head(10).to_dict(),
        'generated_at': datetime.now().isoformat()
    }
    
    summary_filename = f"{filename_prefix}_summary_{timestamp}.json"
    with open(summary_filename, 'w') as f:
        json.dump(summary, f, indent=2)
    
    print(f"✅ Saved summary: {summary_filename}")
    
    return csv_filename, json_filename

def main():
    """Main execution function"""
    print("California Health and Human Services Open Data Portal - Facility Data Downloader")
    print("=" * 80)
    
    downloaded_datasets = {}
    
    # Download all datasets
    for dataset_key, dataset_info in DATASETS.items():
        print(f"\n📥 Processing {dataset_info['name']}...")
        
        df, filename = download_dataset(dataset_key, dataset_info)
        
        if df is not None:
            # Filter for senior living facilities
            filtered_df = filter_senior_living_facilities(df, dataset_key)
            
            if filtered_df is not None:
                # Standardize data format
                standardized_df = standardize_facility_data(filtered_df, dataset_key)
                downloaded_datasets[dataset_key] = standardized_df
        
        # Be respectful - add delay between downloads
        time.sleep(2)
    
    # Merge all datasets
    print(f"\n🔄 Merging facility data from {len(downloaded_datasets)} sources...")
    merged_df = merge_facility_data(downloaded_datasets)
    
    if merged_df is not None:
        # Save final results
        print(f"\n💾 Saving results...")
        csv_file, json_file = save_results(merged_df)
        
        print(f"\n✅ SUCCESS! Downloaded {len(merged_df)} California senior living facilities")
        print(f"   📊 Data sources: {', '.join(downloaded_datasets.keys())}")
        print(f"   📄 CSV file: {csv_file}")
        print(f"   📄 JSON file: {json_file}")
        
        # Show sample data
        print(f"\n📋 Sample facilities:")
        sample_df = merged_df[['name', 'city', 'data_source']].head(5)
        print(sample_df.to_string(index=False))
        
    else:
        print("❌ No facility data was successfully downloaded")
        
    print(f"\n🏁 Process complete!")

if __name__ == "__main__":
    main()