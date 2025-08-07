#!/bin/bash

echo "=== MYSENIORVALET PLATFORM FEATURE TEST ==="
echo ""

# Base URL
BASE_URL="http://localhost:5000"

echo "1. Testing Core APIs..."
echo "------------------------"

# Test Community Search
echo -n "✓ Community Search API: "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/communities/search?q=Florida")
[ "$STATUS" = "200" ] && echo "WORKING" || echo "FAILED ($STATUS)"

# Test Map Data
echo -n "✓ Map Data API: "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/communities/map-data")
[ "$STATUS" = "200" ] && echo "WORKING" || echo "FAILED ($STATUS)"

# Test Healthcare Search
echo -n "✓ Healthcare Services API: "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/services/categories")
[ "$STATUS" = "200" ] && echo "WORKING" || echo "FAILED ($STATUS)"

# Test Hospitals
echo -n "✓ Hospitals API: "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/hospitals/featured")
[ "$STATUS" = "200" ] && echo "WORKING" || echo "FAILED ($STATUS)"

# Test VA Resources
echo -n "✓ VA Resources API: "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/va-resources/facilities")
[ "$STATUS" = "200" ] && echo "WORKING" || echo "FAILED ($STATUS)"

echo ""
echo "2. Testing Authentication..."
echo "----------------------------"

# Test Auth Status
echo -n "✓ Auth System: "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/auth/quick-user")
[ "$STATUS" = "200" ] && echo "WORKING" || echo "FAILED ($STATUS)"

echo ""
echo "3. Testing Marketplace..."
echo "-------------------------"

# Test Marketplace Categories
echo -n "✓ Marketplace Categories: "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/marketplace/categories")
[ "$STATUS" = "200" ] && echo "WORKING" || echo "FAILED ($STATUS)"

# Test Vendors
echo -n "✓ Vendor Listings: "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/marketplace/vendors")
[ "$STATUS" = "200" ] && echo "WORKING" || echo "FAILED ($STATUS)"

echo ""
echo "4. Testing AI Integration..."
echo "----------------------------"

# Test AI Search
echo -n "✓ AI Search Intelligence: "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/ai/search-intelligence")
[ "$STATUS" = "200" ] && echo "WORKING" || echo "FAILED ($STATUS)"

echo ""
echo "=== FEATURE TEST COMPLETE ==="
