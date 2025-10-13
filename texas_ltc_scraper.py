import requests
from bs4 import BeautifulSoup
import csv
import time

BASE_SEARCH_URL = "https://apps.hhs.texas.gov/ltcsearch/"
SEARCH_STEP_URL = BASE_SEARCH_URL + "search"
DETAIL_BASE_URL = BASE_SEARCH_URL + "details?ProviderID="

HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; MySeniorValetBot/1.0)"}

def get_provider_ids(page=1):
    resp = requests.get(SEARCH_STEP_URL, params={'page': page}, headers=HEADERS)
    soup = BeautifulSoup(resp.text, 'html.parser')
    ids = [tag['data-id'] for tag in soup.select("a.provider-link[data-id]")]
    return ids

def parse_provider_details(provider_id):
    resp = requests.get(DETAIL_BASE_URL + provider_id, headers=HEADERS)
    soup = BeautifulSoup(resp.text, 'html.parser')
    data = {
        'ProviderID': provider_id,
        'Name': soup.select_one("h1.name").text.strip() if soup.select_one("h1.name") else "",
        'Type': soup.select_one("span.type").text.strip() if soup.select_one("span.type") else "",
        'Address': soup.select_one("div.address").text.strip() if soup.select_one("div.address") else "",
        'Phone': soup.select_one("span.phone").text.strip() if soup.select_one("span.phone") else "",
        'Capacity': soup.select_one("span.capacity").text.strip() if soup.select_one("span.capacity") else "",
        'LicenseStatus': soup.select_one("span.status").text.strip() if soup.select_one("span.status") else "",
        'InspectionDate': soup.select_one("span.last-inspection").text.strip() if soup.select_one("span.last-inspection") else "",
        'Enforcement': soup.select_one("div.enforcement-records").text.strip() if soup.select_one("div.enforcement-records") else "",
        'SourceURL': resp.url
    }
    return data

def scrape_texas_ltc(max_pages=50):
    out = []
    for page in range(1, max_pages + 1):
        print(f"Scraping page {page}...")
        try:
            ids = get_provider_ids(page)
        except Exception as e:
            print(f"Failed to fetch page {page}: {e}")
            continue
        for pid in ids:
            try:
                rec = parse_provider_details(pid)
                out.append(rec)
                time.sleep(1)
            except Exception as e:
                print(f"Error {pid}: {e}")
        time.sleep(2)

    with open("texas_ltc_facilities.csv", "w", newline='', encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=out[0].keys())
        writer.writeheader()
        writer.writerows(out)
    print(f"Saved {len(out)} facilities and agencies.")

if __name__ == "__main__":
    scrape_texas_ltc(max_pages=50)