#!/usr/bin/env python3

import requests
import json
import csv
from datetime import datetime
import os

def collect_github_assisted_living_data():
    """
    Download and process the comprehensive assisted living dataset from GitHub
    """
    
    print("=" * 60)
    print("GITHUB ASSISTED LIVING DATASET COLLECTOR")
    print("=" * 60)
    print("Source: antonstengel/assisted-living-data")
    print("Coverage: All 50 states + Washington DC")
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # GitHub raw content URL for the main dataset
    dataset_url = "https://raw.githubusercontent.com/antonstengel/assisted-living-data/main/alf-dataset.csv"
    
    print(f"\nDownloading comprehensive dataset from GitHub...")
    print(f"URL: {dataset_url}")
    
    try:
        response = requests.get(dataset_url, timeout=60)
        
        if response.status_code == 200:
            print("✓ Successfully downloaded dataset")
            
            # Save the raw CSV
            csv_filename = f"github_assisted_living_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            with open(csv_filename, 'w', encoding='utf-8') as f:
                f.write(response.text)
            print(f"✓ Saved raw CSV: {csv_filename}")
            
            # Parse CSV and convert to JSON
            facilities = []
            
            # Read CSV with proper encoding
            lines = response.text.strip().split('\n')
            if len(lines) > 1:
                # Use csv.DictReader to handle CSV properly
                import io
                csv_file = io.StringIO(response.text)
                reader = csv.DictReader(csv_file)
                
                for row in reader:
                    # Extract relevant fields (adjust based on actual CSV structure)
                    facility = {
                        'name': row.get('name', row.get('facility_name', '')),
                        'address': row.get('address', row.get('street_address', '')),
                        'city': row.get('city', ''),
                        'state': row.get('state', ''),
                        'zip': row.get('zip', row.get('zip_code', '')),
                        'county': row.get('county', ''),
                        'phone': row.get('phone', ''),
                        'facilityType': 'Assisted Living',
                        'source': 'GitHub antonstengel dataset',
                        'careTypes': ['Assisted Living']
                    }
                    
                    # Add coordinates if available
                    if row.get('latitude') and row.get('longitude'):
                        facility['coordinates'] = {
                            'latitude': float(row.get('latitude')),
                            'longitude': float(row.get('longitude'))
                        }
                    
                    # Only add if we have at least name and state
                    if facility['name'] and facility['state']:
                        facilities.append(facility)
                
                print(f"\n✓ Parsed {len(facilities)} facilities from CSV")
                
                # Save to JSON format
                json_filename = f"github_assisted_living_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
                with open(json_filename, 'w') as f:
                    json.dump(facilities, f, indent=2)
                print(f"✓ Saved JSON format: {json_filename}")
                
                # Display statistics by state
                state_counts = {}
                for facility in facilities:
                    state = facility['state']
                    state_counts[state] = state_counts.get(state, 0) + 1
                
                print(f"\n" + "=" * 60)
                print("FACILITIES BY STATE")
                print("=" * 60)
                
                # Sort states by count
                sorted_states = sorted(state_counts.items(), key=lambda x: x[1], reverse=True)
                
                for state, count in sorted_states[:10]:
                    print(f"{state}: {count:,} facilities")
                
                if len(sorted_states) > 10:
                    print(f"... and {len(sorted_states) - 10} more states")
                
                print(f"\n" + "=" * 60)
                print("COLLECTION SUMMARY")
                print("=" * 60)
                print(f"Total facilities collected: {len(facilities):,}")
                print(f"States covered: {len(state_counts)}")
                print(f"Files created:")
                print(f"  - CSV: {csv_filename}")
                print(f"  - JSON: {json_filename}")
                
                # Display sample data
                print(f"\nSample facilities:")
                for i, facility in enumerate(facilities[:5]):
                    print(f"\n{i+1}. {facility['name']}")
                    print(f"   Location: {facility['city']}, {facility['state']} {facility['zip']}")
                    print(f"   Address: {facility['address']}")
                
                return facilities
                
            else:
                print("✗ CSV file appears to be empty")
                
        else:
            print(f"✗ Failed to download: HTTP {response.status_code}")
            
    except Exception as e:
        print(f"✗ Error downloading dataset: {str(e)}")
        
    # Try alternative repository if first one fails
    print("\nTrying alternative repository...")
    alt_url = "https://raw.githubusercontent.com/mlph2021-anonymous/assisted-living-data/main/alf-dataset.csv"
    
    try:
        response = requests.get(alt_url, timeout=60)
        if response.status_code == 200:
            print("✓ Successfully downloaded from alternative repository")
            # Process similar to above...
        else:
            print(f"✗ Alternative also failed: HTTP {response.status_code}")
    except Exception as e:
        print(f"✗ Error with alternative: {str(e)}")
    
    return None

if __name__ == "__main__":
    facilities = collect_github_assisted_living_data()