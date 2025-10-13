import requests
import csv

# URLs for Section 202 and 811 - Using HUD's Multifamily Properties Assisted endpoint
HUD_SOURCES = [
    {
        "url": "https://services.arcgis.com/VTyQ9soqVukalItT/arcgis/rest/services/Multifamily_Properties_Assisted/FeatureServer/0/query",
        "program_type": "Multifamily Assisted Housing"
    }
]

def fetch_hud_data(source_url, program_type):
    params = {
        "where": "1=1",
        "outFields": "*",
        "f": "json",
        "resultRecordCount": 2000
    }
    try:
        resp = requests.get(source_url, params=params)
        resp.raise_for_status()
        data = resp.json()
        
        # Debug print
        print(f"Response keys: {data.keys() if isinstance(data, dict) else 'Not a dict'}")
        if 'error' in data:
            print(f"Error in response: {data['error']}")
            return []
            
        rows = []
        features = data.get("features", [])
        print(f"Found {len(features)} features for {program_type}")
        
        for item in features:
            a = item.get("attributes", {})
            
            # Filter for 202 (elderly) and 811 (disabled) properties
            is_202 = a.get("IS_202_811_IND") == "Y" or a.get("WAS_EVER_202_811_IND") == "Y" or \
                     a.get("IS_PAC_202_IND") == "Y" or a.get("IS_PRAC_202_IND") == "Y" or \
                     a.get("IS_SEC8_202_IND") == "Y" or a.get("IS_202_DIRECT_LOAN_IND") == "Y" or \
                     a.get("IS_202_CAPITAL_ADVANCE_IND") == "Y"
            
            is_811 = a.get("IS_PAC_811_IND") == "Y" or a.get("IS_PRAC_811_IND") == "Y" or \
                     a.get("IS_811_CAPITAL_ADVANCE_IND") == "Y" or a.get("IS_811_PRA_DEMO_IND") == "Y"
            
            # Get program type
            if is_202:
                specific_program = "Section 202 - Elderly Housing"
            elif is_811:
                specific_program = "Section 811 - Disabled Housing"
            elif a.get("CLIENT_GROUP_TYPE") == "Elderly":
                specific_program = "Elderly Housing"
            elif a.get("CLIENT_GROUP_TYPE") == "Disabled":
                specific_program = "Disabled Housing"
            else:
                # Skip non-elderly/disabled properties
                continue
                
            rows.append({
                "Property_ID": a.get("PROPERTY_ID"),
                "Property_Name": a.get("PROPERTY_NAME_TEXT"),
                "Address": a.get("ADDRESS_LINE1_TEXT"),
                "City": a.get("PLACED_BASE_CITY_NAME_TEXT"),
                "State": a.get("STD_STATE_CODE"),
                "Zip_Code": a.get("STD_ZIP_CODE"),
                "County": a.get("CNTY_NM2KX", "").strip(),
                "Latitude": a.get("LATITUDE"),
                "Longitude": a.get("LONGITUDE"),
                "Total_Units": a.get("TOTAL_UNIT_COUNT"),
                "Assisted_Units": a.get("TOTAL_ASSISTED_UNIT_COUNT"),
                "Phone": a.get("PROPERTY_ON_SITE_PHONE_NUMBER"),
                "Client_Group": a.get("CLIENT_GROUP_NAME"),
                "Client_Type": a.get("CLIENT_GROUP_TYPE"),
                "Program_Type": specific_program,
                "Source": "HUD"
            })
        return rows
    except Exception as e:
        print(f"Error fetching {program_type}: {str(e)}")
        return []

def save_to_csv(all_data, filename="hud_affordable_senior_housing.csv"):
    if not all_data:
        print("No data to save")
        return
    keys = all_data[0].keys()
    with open(filename, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        writer.writerows(all_data)

def main():
    all_data = []
    for source in HUD_SOURCES:
        print(f"Fetching {source['program_type']} data...")
        data = fetch_hud_data(source["url"], source["program_type"])
        all_data.extend(data)
    save_to_csv(all_data)
    print(f"Saved {len(all_data)} entries to hud_affordable_senior_housing.csv")

if __name__ == "__main__":
    main()