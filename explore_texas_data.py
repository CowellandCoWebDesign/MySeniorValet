import requests
import json

# Texas Open Data Portal API endpoint
API_BASE = "https://data.texas.gov/resource/bc5r-88dy.json"

def explore_texas_data():
    """Explore the actual structure of Texas data"""
    
    params = {
        "$limit": 200,
        "$order": "operation_name ASC"
    }
    
    headers = {
        "Accept": "application/json",
        "User-Agent": "MySeniorValet Data Collection"
    }
    
    print("Exploring Texas data structure...")
    try:
        response = requests.get(API_BASE, params=params, headers=headers, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        if data:
            # Check operation types
            operation_types = {}
            programs_types = {}
            
            for record in data:
                # Count operation types
                op_type = record.get('operation_type', 'UNKNOWN')
                operation_types[op_type] = operation_types.get(op_type, 0) + 1
                
                # Check programs_provided field
                programs = record.get('programs_provided', '')
                if programs:
                    programs_types[programs] = programs_types.get(programs, 0) + 1
            
            print(f"\nOperation Types Found:")
            for op_type, count in sorted(operation_types.items()):
                print(f"  {op_type}: {count}")
            
            print(f"\nPrograms Provided (first 20):")
            for program, count in sorted(list(programs_types.items())[:20]):
                print(f"  {program}: {count}")
            
            # Look for facilities with senior-related names or programs
            print(f"\nLooking for senior-related facilities...")
            senior_facilities = []
            
            for record in data:
                name = record.get('operation_name', '').upper()
                programs = record.get('programs_provided', '').upper()
                op_type = record.get('operation_type', '').upper()
                
                # Check various fields for senior keywords
                if any(keyword in name for keyword in ['SENIOR', 'ADULT', 'ASSISTED', 'ELDERLY', 'RETIREMENT', 'MEMORY']):
                    senior_facilities.append(record)
                    print(f"\n  Found by name: {record.get('operation_name')}")
                    print(f"    Type: {record.get('operation_type')}")
                    print(f"    Programs: {record.get('programs_provided')}")
                    print(f"    County: {record.get('county')}")
                elif any(keyword in programs for keyword in ['SENIOR', 'ADULT', 'ASSISTED', 'ELDERLY', 'ALZHEIMER']):
                    senior_facilities.append(record)
                    print(f"\n  Found by program: {record.get('operation_name')}")
                    print(f"    Type: {record.get('operation_type')}")
                    print(f"    Programs: {record.get('programs_provided')}")
                    print(f"    County: {record.get('county')}")
            
            print(f"\n\nTotal senior facilities found in sample: {len(senior_facilities)}")
            
            # Save a sample record to see all fields
            if data:
                with open('texas_sample_record.json', 'w') as f:
                    json.dump(data[0], f, indent=2)
                print("\nSaved sample record to texas_sample_record.json")
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    explore_texas_data()