import requests
import csv
import pandas as pd
import json

def download_cms_nursing_homes():
    """Download CMS nursing home data and filter for Texas facilities"""
    
    # CMS Provider Data API endpoints
    # Main provider info dataset
    provider_info_url = "https://data.cms.gov/provider-data/api/1/datastore/query/b27b-2uc7/0/download?format=csv"
    
    print("Downloading CMS nursing home data...")
    
    try:
        # Download provider info data
        response = requests.get(provider_info_url, stream=True, timeout=60)
        response.raise_for_status()
        
        # Save to file first
        with open('cms_provider_info.csv', 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        print("Downloaded CMS data. Processing Texas facilities...")
        
        # Read and filter for Texas
        df = pd.read_csv('cms_provider_info.csv', low_memory=False)
        
        # Filter for Texas
        texas_df = df[df['Provider State'] == 'TX']
        
        print(f"Found {len(texas_df)} Texas nursing facilities")
        
        # Select relevant columns
        columns_to_keep = [
            'Federal Provider Number',
            'Provider Name',
            'Provider Address',
            'Provider City',
            'Provider State', 
            'Provider Zip Code',
            'Provider County Name',
            'Provider Phone Number',
            'Ownership Type',
            'Number of Certified Beds',
            'Provider Type',
            'Provider Resides in Hospital',
            'Overall Rating',
            'Health Inspection Rating',
            'QM Rating',
            'Staffing Rating'
        ]
        
        # Check which columns exist
        existing_columns = [col for col in columns_to_keep if col in texas_df.columns]
        texas_filtered = texas_df[existing_columns]
        
        # Save Texas facilities
        texas_filtered.to_csv('texas_nursing_homes_cms.csv', index=False)
        
        print(f"\nSaved {len(texas_filtered)} Texas nursing facilities to texas_nursing_homes_cms.csv")
        
        # Show sample
        print("\nSample Texas facilities:")
        for idx, row in texas_filtered.head(10).iterrows():
            print(f"  - {row.get('Provider Name', 'Unknown')} in {row.get('Provider City', 'Unknown')}, {row.get('Provider County Name', 'Unknown')} County")
            print(f"    Type: {row.get('Provider Type', 'Unknown')}, Beds: {row.get('Number of Certified Beds', 'Unknown')}")
        
        # Show counties covered
        counties = texas_filtered['Provider County Name'].value_counts()
        print(f"\nTexas counties covered: {len(counties)}")
        print("Top 10 counties by facility count:")
        for county, count in counties.head(10).items():
            print(f"  {county}: {count} facilities")
        
        return texas_filtered
        
    except Exception as e:
        print(f"Error downloading CMS data: {e}")
        
        # Try alternative approach - use the API directly
        print("\nTrying alternative API approach...")
        
        api_url = "https://data.cms.gov/provider-data/api/1/datastore/query/b27b-2uc7/0"
        params = {
            "filter[Provider State]": "TX",
            "limit": 1000,
            "offset": 0
        }
        
        all_facilities = []
        
        try:
            while True:
                response = requests.get(api_url, params=params)
                response.raise_for_status()
                data = response.json()
                
                if 'results' not in data or not data['results']:
                    break
                
                all_facilities.extend(data['results'])
                
                print(f"Fetched {len(all_facilities)} facilities...")
                
                if len(data['results']) < params['limit']:
                    break
                
                params['offset'] += params['limit']
            
            if all_facilities:
                # Convert to CSV
                with open('texas_nursing_homes_api.csv', 'w', newline='', encoding='utf-8') as f:
                    writer = csv.DictWriter(f, fieldnames=all_facilities[0].keys())
                    writer.writeheader()
                    writer.writerows(all_facilities)
                
                print(f"\nSaved {len(all_facilities)} Texas facilities via API to texas_nursing_homes_api.csv")
                
                # Show sample
                print("\nSample facilities:")
                for facility in all_facilities[:5]:
                    print(f"  - {facility.get('Provider Name')} in {facility.get('Provider City')}, {facility.get('Provider County Name')} County")
        
        except Exception as api_error:
            print(f"API approach also failed: {api_error}")
            
            # Final fallback - try a simpler dataset
            print("\nTrying simpler CMS dataset...")
            simple_url = "https://data.cms.gov/provider-data/sites/default/files/resources/092256c2c5d5c04bb7e193ba3eb1d847_1735257944/NH_ProviderInfo_Dec2024.csv"
            
            try:
                response = requests.get(simple_url, timeout=60)
                with open('cms_simple.csv', 'wb') as f:
                    f.write(response.content)
                
                # Read and filter
                df = pd.read_csv('cms_simple.csv', low_memory=False)
                texas_df = df[df['STATE'] == 'TX'] if 'STATE' in df.columns else df[df['Provider State'] == 'TX']
                
                texas_df.to_csv('texas_nursing_homes_simple.csv', index=False)
                print(f"Saved {len(texas_df)} Texas facilities to texas_nursing_homes_simple.csv")
                
            except Exception as simple_error:
                print(f"Simple approach failed: {simple_error}")

if __name__ == "__main__":
    download_cms_nursing_homes()