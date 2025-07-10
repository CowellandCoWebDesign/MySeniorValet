"""
Demo Senior Living Data Scraper
Creates sample data structure for TrueView integration
Shows how scraped data would be formatted and integrated
"""

import csv
import json
import time
from datetime import datetime

def create_sample_scraped_data():
    """Create sample scraped data structure for demonstration"""
    
    # Sample data structure that matches TrueView schema
    sample_communities = [
        {
            "Name": "Sunrise Senior Living of Palo Alto",
            "Address": "380 Cambridge Ave, Palo Alto, CA 94306",
            "Phone": "(650) 326-8210",
            "Description": "Sunrise Senior Living provides assisted living and memory care services in a warm, homelike environment. Our community offers personalized care plans, engaging activities, and restaurant-style dining.",
            "Images": "https://example.com/sunrise-exterior.jpg; https://example.com/sunrise-dining.jpg; https://example.com/sunrise-activities.jpg",
            "Care Levels": "Assisted Living; Memory Care",
            "Amenities": "Restaurant-style dining; Fitness center; Beauty salon; Library; Outdoor gardens; Transportation services",
            "Price": "$4,500 - $6,800/month",
            "Source": "SeniorHousingNet.com",
            "Source URL": "https://www.seniorhousingnet.com/senior-living-community/sunrise-of-palo-alto"
        },
        {
            "Name": "Belmont Village Senior Living",
            "Address": "1045 La Avenida St, Mountain View, CA 94043",
            "Phone": "(650) 230-0840",
            "Description": "Belmont Village offers luxury senior living with a focus on wellness and engagement. Features include a state-of-the-art fitness center, swimming pool, and diverse dining options.",
            "Images": "https://example.com/belmont-exterior.jpg; https://example.com/belmont-pool.jpg",
            "Care Levels": "Independent Living; Assisted Living; Memory Care",
            "Amenities": "Swimming pool; Fitness center; Concierge services; Pet-friendly; WiFi; Library; Beauty salon",
            "Price": "$5,200 - $8,500/month",
            "Source": "SeniorHousingNet.com",
            "Source URL": "https://www.seniorhousingnet.com/senior-living-community/belmont-village-mountain-view"
        },
        {
            "Name": "Atria Senior Living Sunnyvale",
            "Address": "1000 E Fremont Ave, Sunnyvale, CA 94087",
            "Phone": "(408) 736-1400",
            "Description": "Atria provides engaging assisted living and memory care in a vibrant community setting. Residents enjoy chef-prepared meals, wellness programs, and a variety of social activities.",
            "Images": "https://example.com/atria-exterior.jpg; https://example.com/atria-dining.jpg; https://example.com/atria-courtyard.jpg",
            "Care Levels": "Assisted Living; Memory Care",
            "Amenities": "Chef-prepared meals; Wellness programs; Art studio; Game room; Outdoor spaces; Transportation",
            "Price": "$4,800 - $7,200/month",
            "Source": "SeniorHousingNet.com",
            "Source URL": "https://www.seniorhousingnet.com/senior-living-community/atria-sunnyvale"
        },
        {
            "Name": "Moldaw Residences",
            "Address": "800 Inverness Dr, Palo Alto, CA 94301",
            "Phone": "(650) 330-3500",
            "Description": "Moldaw Residences offers independent and assisted living with a focus on Jewish culture and traditions. The community features kosher dining, cultural programs, and beautiful gardens.",
            "Images": "https://example.com/moldaw-exterior.jpg; https://example.com/moldaw-synagogue.jpg",
            "Care Levels": "Independent Living; Assisted Living",
            "Amenities": "Kosher dining; Synagogue; Cultural programs; Library; Gardens; Transportation; Fitness center",
            "Price": "$3,800 - $6,200/month",
            "Source": "SeniorHousingNet.com",
            "Source URL": "https://www.seniorhousingnet.com/senior-living-community/moldaw-residences"
        },
        {
            "Name": "Vi at Palo Alto",
            "Address": "620 Sand Hill Rd, Palo Alto, CA 94304",
            "Phone": "(650) 838-4004",
            "Description": "Vi at Palo Alto is a luxury continuing care retirement community offering independent living, assisted living, and skilled nursing care on a beautiful campus.",
            "Images": "https://example.com/vi-exterior.jpg; https://example.com/vi-dining.jpg; https://example.com/vi-pool.jpg",
            "Care Levels": "Independent Living; Assisted Living; Skilled Nursing; Memory Care",
            "Amenities": "Swimming pool; Golf course; Multiple dining venues; Fitness center; Library; Art studio; Transportation",
            "Price": "$6,500 - $12,000/month",
            "Source": "SeniorHousingNet.com",
            "Source URL": "https://www.seniorhousingnet.com/senior-living-community/vi-palo-alto"
        }
    ]
    
    return sample_communities

def save_to_csv(data, filename="seniorhousingnet_sample.csv"):
    """Save scraped data to CSV format"""
    if data:
        with open(filename, "w", newline='', encoding="utf-8") as f:
            writer = csv.DictWriter(f, data[0].keys())
            writer.writeheader()
            writer.writerows(data)
        
        print(f"✅ Saved {len(data)} communities to {filename}")
    else:
        print("❌ No data to save")

def save_to_json(data, filename="seniorhousingnet_sample.json"):
    """Save scraped data to JSON format"""
    if data:
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Saved {len(data)} communities to {filename}")
    else:
        print("❌ No data to save")

def convert_to_trueview_format(scraped_data):
    """Convert scraped data to TrueView database format"""
    
    trueview_communities = []
    
    for community in scraped_data:
        # Parse care types
        care_types = []
        if community.get("Care Levels"):
            care_types = [ct.strip() for ct in community["Care Levels"].split(";")]
        
        # Parse amenities
        amenities = []
        if community.get("Amenities"):
            amenities = [amenity.strip() for amenity in community["Amenities"].split(";")]
        
        # Parse price range
        price_range = None
        if community.get("Price") and "$" in community["Price"]:
            price_text = community["Price"]
            # Extract numbers from price range like "$4,500 - $6,800/month"
            import re
            prices = re.findall(r'\$([0-9,]+)', price_text)
            if len(prices) >= 2:
                min_price = int(prices[0].replace(",", ""))
                max_price = int(prices[1].replace(",", ""))
                price_range = {"min": min_price, "max": max_price}
        
        # Create TrueView format
        trueview_community = {
            "name": community["Name"],
            "address": community["Address"],
            "phone": community["Phone"],
            "description": community["Description"],
            "careTypes": care_types,
            "amenities": amenities,
            "priceRange": price_range,
            "source": community["Source"],
            "sourceUrl": community["Source URL"],
            "discoveryMethod": "web_scraping",
            "discoveryDate": datetime.now().isoformat(),
            "verified": False,
            "needsReview": True
        }
        
        trueview_communities.append(trueview_community)
    
    return trueview_communities

def main():
    """Main demonstration function"""
    print("🚀 Demo Senior Living Data Scraper")
    print("=" * 50)
    
    # Create sample scraped data
    print("📋 Creating sample scraped data structure...")
    scraped_data = create_sample_scraped_data()
    
    # Save in multiple formats
    print("\n💾 Saving data in multiple formats...")
    save_to_csv(scraped_data)
    save_to_json(scraped_data)
    
    # Convert to TrueView format
    print("\n🔄 Converting to TrueView database format...")
    trueview_data = convert_to_trueview_format(scraped_data)
    save_to_json(trueview_data, "trueview_import_ready.json")
    
    # Show sample data
    print("\n📊 Sample scraped data structure:")
    print("-" * 40)
    sample = scraped_data[0]
    for key, value in sample.items():
        print(f"{key}: {value[:80]}{'...' if len(str(value)) > 80 else ''}")
    
    print("\n📊 Sample TrueView import format:")
    print("-" * 40)
    trueview_sample = trueview_data[0]
    for key, value in trueview_sample.items():
        if isinstance(value, list):
            print(f"{key}: {value}")
        elif isinstance(value, dict):
            print(f"{key}: {value}")
        else:
            print(f"{key}: {str(value)[:80]}{'...' if len(str(value)) > 80 else ''}")
    
    print("\n✅ Demo complete!")
    print("📄 Files created:")
    print("  - seniorhousingnet_sample.csv (Raw scraped data)")
    print("  - seniorhousingnet_sample.json (JSON format)")
    print("  - trueview_import_ready.json (TrueView database format)")

if __name__ == "__main__":
    main()