#!/usr/bin/env python3

import requests
import pandas as pd
import json
from datetime import datetime

def collect_minnesota_facilities():
    """Download and process Minnesota health facilities database"""
    
    print("Collecting Minnesota health facilities data...")
    print("Source: Minnesota Department of Health")
    print("=" * 50)
    
    # The Minnesota Health Department provides a direct Excel download
    # URL from the health.state.mn.us website
    url = "https://www.health.state.mn.us/facilities/regulation/homecare/consumers/database.html"
    
    print(f"\nAttempting to access Minnesota Health Department database...")
    print(f"URL: {url}")
    
    # First, let's try to access the page to find the Excel download link
    try:
        response = requests.get(url)
        if response.status_code == 200:
            print("✓ Successfully accessed Minnesota Health Department page")
            
            # Look for Excel file links in the response
            if 'database.xlsx' in response.text or 'Database.xlsx' in response.text:
                print("✓ Found database download link")
                
                # Common patterns for Minnesota health department Excel files
                possible_urls = [
                    "https://www.health.state.mn.us/facilities/regulation/homecare/consumers/database.xlsx",
                    "https://www.health.state.mn.us/facilities/regulation/homecare/consumers/Database.xlsx",
                    "https://www.health.state.mn.us/data/facilities/database.xlsx"
                ]
                
                for excel_url in possible_urls:
                    try:
                        print(f"\nTrying to download from: {excel_url}")
                        excel_response = requests.get(excel_url, stream=True)
                        if excel_response.status_code == 200:
                            # Save the Excel file
                            filename = f"minnesota_health_facilities_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
                            with open(filename, 'wb') as f:
                                for chunk in excel_response.iter_content(chunk_size=8192):
                                    f.write(chunk)
                            print(f"✓ Downloaded Excel file: {filename}")
                            
                            # Process the Excel file
                            df = pd.read_excel(filename)
                            print(f"\nTotal facilities found: {len(df)}")
                            
                            # Filter for assisted living and senior facilities
                            senior_keywords = ['assisted living', 'senior', 'memory care', 'nursing home', 
                                             'residential care', 'elderly', 'retirement']
                            
                            # Create a filter based on facility type or name
                            mask = df.apply(lambda row: any(keyword in str(row).lower() 
                                                           for keyword in senior_keywords), axis=1)
                            senior_facilities = df[mask]
                            
                            print(f"Senior/assisted living facilities found: {len(senior_facilities)}")
                            
                            # Save filtered results
                            output_file = f"minnesota_senior_facilities_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
                            senior_facilities.to_json(output_file, orient='records', indent=2)
                            print(f"\n✓ Saved senior facilities to: {output_file}")
                            
                            # Display sample data
                            print("\nSample facilities:")
                            print(senior_facilities.head(10).to_string())
                            
                            return senior_facilities
                            
                    except Exception as e:
                        print(f"✗ Failed to download from {excel_url}: {str(e)}")
                        continue
            
            # If direct download fails, provide manual instructions
            print("\n⚠️  Could not find direct download link.")
            print("\nManual download instructions:")
            print("1. Visit: https://www.health.state.mn.us/facilities/regulation/homecare/consumers/database.html")
            print("2. Look for 'Download the database' or similar link")
            print("3. Download the Excel file")
            print("4. Save it as 'minnesota_health_facilities.xlsx' in this directory")
            
    except Exception as e:
        print(f"\n✗ Error accessing Minnesota Health Department: {str(e)}")
        print("\nAlternative approach - searching for cached or mirror data...")
        
    return None

if __name__ == "__main__":
    facilities = collect_minnesota_facilities()
    
    if facilities is None:
        print("\n" + "=" * 50)
        print("COLLECTION INCOMPLETE")
        print("=" * 50)
        print("\nNext steps:")
        print("1. Manually download the Minnesota health facilities database")
        print("2. Or try alternative state databases")
        print("3. Consider CMS Medicare data as a comprehensive alternative")