import requests

url = "https://services.arcgis.com/VTyQ9soqVukalItT/arcgis/rest/services/Multifamily_Properties_Assisted/FeatureServer/0/query"
params = {
    "where": "1=1",
    "outFields": "*",
    "f": "json",
    "resultRecordCount": 1
}

resp = requests.get(url, params=params)
data = resp.json()

if "features" in data and len(data["features"]) > 0:
    print("Available fields:")
    attributes = data["features"][0]["attributes"]
    for key, value in attributes.items():
        print(f"  {key}: {value}")
else:
    print("No features found")