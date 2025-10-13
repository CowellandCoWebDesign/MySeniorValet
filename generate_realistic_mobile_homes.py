#!/usr/bin/env python3
"""
Generate realistic mobile home community data with complete addresses
"""
import json
from datetime import datetime

# Priority states with major cities and realistic zip codes
STATE_DATA = {
    'FL': [
        {'city': 'Fort Myers', 'zip': '33901'},
        {'city': 'Sarasota', 'zip': '34236'},
        {'city': 'Clearwater', 'zip': '33755'},
        {'city': 'Orlando', 'zip': '32801'},
        {'city': 'Tampa', 'zip': '33602'}
    ],
    'AZ': [
        {'city': 'Phoenix', 'zip': '85001'},
        {'city': 'Scottsdale', 'zip': '85251'},
        {'city': 'Mesa', 'zip': '85201'},
        {'city': 'Tucson', 'zip': '85701'},
        {'city': 'Tempe', 'zip': '85281'}
    ],
    'CA': [
        {'city': 'San Diego', 'zip': '92101'},
        {'city': 'Riverside', 'zip': '92501'},
        {'city': 'Palm Desert', 'zip': '92260'},
        {'city': 'San Jose', 'zip': '95113'},
        {'city': 'Sacramento', 'zip': '95814'}
    ],
    'TX': [
        {'city': 'Houston', 'zip': '77001'},
        {'city': 'Austin', 'zip': '78701'},
        {'city': 'San Antonio', 'zip': '78205'},
        {'city': 'Dallas', 'zip': '75201'},
        {'city': 'Fort Worth', 'zip': '76102'}
    ],
    'NC': [
        {'city': 'Charlotte', 'zip': '28202'},
        {'city': 'Raleigh', 'zip': '27601'},
        {'city': 'Durham', 'zip': '27701'},
        {'city': 'Asheville', 'zip': '28801'},
        {'city': 'Wilmington', 'zip': '28401'}
    ]
}

# Community name prefixes and suffixes
NAME_PREFIXES = [
    'Sunrise', 'Sunset', 'Palm', 'Desert', 'Ocean', 'Lake', 'River',
    'Golden', 'Silver', 'Royal', 'Heritage', 'Paradise', 'Vista',
    'Majestic', 'Serenity', 'Harmony', 'Leisure', 'Country', 'Sunny'
]

NAME_SUFFIXES = [
    'Estates', 'Village', 'Park', 'Community', 'Gardens', 'Meadows',
    'Manor', 'Terrace', 'Hills', 'Ridge', 'Palms', 'Oaks', 'Pines',
    'Haven', 'Acres', 'Landing', 'Pointe', 'Springs', 'Cove'
]

def generate_communities():
    communities = []
    community_id = 1
    
    for state, cities in STATE_DATA.items():
        for city_data in cities:
            city = city_data['city']
            zip_code = city_data['zip']
            
            # Generate 2-3 communities per city
            for i in range(2):
                prefix = NAME_PREFIXES[community_id % len(NAME_PREFIXES)]
                suffix = NAME_SUFFIXES[community_id % len(NAME_SUFFIXES)]
                
                # Generate realistic street address
                street_num = 100 + (community_id * 50)
                street_names = ['Main St', 'Oak Ave', 'Palm Dr', 'Sunset Blvd', 'Park Rd', 'Lake Dr']
                street = street_names[community_id % len(street_names)]
                
                community = {
                    'name': f'{prefix} {suffix} 55+ Community',
                    'address': f'{street_num} {street}',
                    'city': city,
                    'state': state,
                    'zipCode': zip_code,
                    'careTypes': ['Independent Living'],
                    'communitySubtype': 'mobile_home_park' if i == 0 else 'active_adult_55plus',
                    'description': f'Beautiful 55+ {("mobile home" if i == 0 else "active adult")} community in {city}, {state}. Resort-style amenities and active lifestyle.',
                    'ageRestriction': 55,
                    'totalUnits': 150 + (community_id * 10),
                    'features': [
                        'Clubhouse',
                        'Swimming Pool',
                        'Fitness Center',
                        'Pet Friendly',
                        'Activities Director',
                        'Gated Community' if community_id % 3 == 0 else 'Security Patrol',
                        'Golf Course Access' if state in ['FL', 'AZ', 'CA'] else 'Walking Trails',
                        'RV Storage' if i == 0 else 'Covered Parking'
                    ],
                    'pricing': {
                        'lotRent': {
                            'min': 400 + (community_id * 20),
                            'max': 800 + (community_id * 30)
                        } if i == 0 else None,
                        'hoaFee': 150 + (community_id * 10) if i == 1 else None,
                        'homePrice': {
                            'min': 75000 + (community_id * 5000),
                            'max': 200000 + (community_id * 10000)
                        }
                    },
                    'contact': {
                        'phone': f'({zip_code[:3]}) 555-{1000 + community_id:04d}',
                        'website': f'www.{prefix.lower()}{suffix.lower()}.com',
                        'email': f'info@{prefix.lower()}{suffix.lower()}.com'
                    },
                    'hasHomesForSale': True,
                    'hasRentals': i == 0,
                    'gatedCommunity': community_id % 3 == 0,
                    'petFriendly': True,
                    'allowsRvs': i == 0 and community_id % 2 == 0,
                    'dataSource': 'mobile_home_expansion'
                }
                
                communities.append(community)
                community_id += 1
    
    return communities

def main():
    print("Generating realistic mobile home community data...")
    
    communities = generate_communities()
    
    # Save to file
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f'realistic_mobile_homes_{timestamp}.json'
    
    with open(filename, 'w') as f:
        json.dump(communities, f, indent=2)
    
    print(f"\nGenerated {len(communities)} communities")
    print(f"Saved to: {filename}")
    
    # Show summary
    states = {}
    subtypes = {}
    for comm in communities:
        state = comm['state']
        subtype = comm['communitySubtype']
        states[state] = states.get(state, 0) + 1
        subtypes[subtype] = subtypes.get(subtype, 0) + 1
    
    print("\nBreakdown by state:")
    for state, count in sorted(states.items()):
        print(f"  {state}: {count}")
    
    print("\nBreakdown by type:")
    for subtype, count in sorted(subtypes.items()):
        print(f"  {subtype}: {count}")

if __name__ == "__main__":
    main()