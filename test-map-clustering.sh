#!/bin/bash

# Test Map Clustering and Search Functionality
echo "🗺️  Map Clustering and Search Tests"
echo "==================================="

BASE_URL="http://localhost:5000"
PASSED=0
FAILED=0

# Test bounds for San Francisco
WEST=-122.43
SOUTH=37.76
EAST=-122.40
NORTH=37.79

run_test() {
    local test_name="$1"
    echo -e "\n⚡ Running: $test_name"
}

# Test 1: Spatial search returns communities
run_test "Spatial search returns communities"
RESPONSE=$(curl -s "${BASE_URL}/api/communities/search/spatial?swLat=${SOUTH}&swLng=${WEST}&neLat=${NORTH}&neLng=${EAST}&limit=500")
COUNT=$(echo "$RESPONSE" | jq 'length')
if [ "$COUNT" -gt 0 ]; then
    echo "✅ PASSED: Found $COUNT communities in bounds"
    ((PASSED++))
else
    echo "❌ FAILED: No communities found in San Francisco area"
    ((FAILED++))
fi

# Test 2: Zoom 12 shows clustered markers
run_test "Zoom 12 shows clustered markers"
RESPONSE=$(curl -s "${BASE_URL}/api/communities/clusters?west=${WEST}&south=${SOUTH}&east=${EAST}&north=${NORTH}&zoom=12")
TOTAL=$(echo "$RESPONSE" | jq '.clusters | length')
CLUSTERS=$(echo "$RESPONSE" | jq '[.clusters[] | select(.properties.cluster == true)] | length')
MARKERS=$(echo "$RESPONSE" | jq '[.clusters[] | select(.properties.cluster != true)] | length')

echo "   Zoom 12: $TOTAL features ($CLUSTERS clusters, $MARKERS markers)"
if [ "$CLUSTERS" -gt 0 ]; then
    echo "✅ PASSED: Found clusters at zoom 12"
    ((PASSED++))
else
    echo "❌ FAILED: Expected clusters at zoom 12"
    ((FAILED++))
fi

# Test 3: Zoom 13 shows more individual markers
run_test "Zoom 13 shows more individual markers"
RESPONSE_13=$(curl -s "${BASE_URL}/api/communities/clusters?west=${WEST}&south=${SOUTH}&east=${EAST}&north=${NORTH}&zoom=13")
TOTAL_13=$(echo "$RESPONSE_13" | jq '.clusters | length')
CLUSTERS_13=$(echo "$RESPONSE_13" | jq '[.clusters[] | select(.properties.cluster == true)] | length')
MARKERS_13=$(echo "$RESPONSE_13" | jq '[.clusters[] | select(.properties.cluster != true)] | length')

echo "   Zoom 13: $TOTAL_13 features ($CLUSTERS_13 clusters, $MARKERS_13 markers)"
if [ "$MARKERS_13" -gt "$MARKERS" ]; then
    echo "✅ PASSED: More individual markers at zoom 13"
    ((PASSED++))
else
    echo "❌ FAILED: Expected more individual markers at zoom 13"
    ((FAILED++))
fi

# Test 4: Zoom 17 shows minimal clustering
run_test "Zoom 17 shows minimal clustering"
RESPONSE_17=$(curl -s "${BASE_URL}/api/communities/clusters?west=${WEST}&south=${SOUTH}&east=${EAST}&north=${NORTH}&zoom=17")
CLUSTERS_17=$(echo "$RESPONSE_17" | jq '[.clusters[] | select(.properties.cluster == true)] | length')

echo "   Zoom 17: $CLUSTERS_17 clusters"
if [ "$CLUSTERS_17" -le 2 ]; then
    echo "✅ PASSED: Minimal clustering at zoom 17"
    ((PASSED++))
else
    echo "❌ FAILED: Too many clusters at zoom 17 ($CLUSTERS_17)"
    ((FAILED++))
fi

# Test 5: Different bounds return different results
run_test "Different bounds return different results"
OAKLAND_RESPONSE=$(curl -s "${BASE_URL}/api/communities/clusters?west=-122.30&south=37.75&east=-122.20&north=37.85&zoom=13")
OAKLAND_COUNT=$(echo "$OAKLAND_RESPONSE" | jq '.clusters | length')
SF_COUNT="$TOTAL_13"

echo "   Oakland area: $OAKLAND_COUNT features"
echo "   SF area: $SF_COUNT features"

if [ "$OAKLAND_COUNT" != "$SF_COUNT" ]; then
    echo "✅ PASSED: Different areas return different results"
    ((PASSED++))
else
    echo "❌ FAILED: Different areas returned same results"
    ((FAILED++))
fi

# Summary
echo -e "\n📊 Test Summary"
echo "================"
echo "✅ Passed: $PASSED"
echo "❌ Failed: $FAILED"
echo "📈 Total: $((PASSED + FAILED))"

if [ "$FAILED" -gt 0 ]; then
    echo -e "\n⚠️  Some tests failed. Checking specific issues..."
    
    # Additional debugging
    echo -e "\n🔍 Debugging Information:"
    echo "1. Checking if clustering reduces at higher zoom levels:"
    for zoom in 10 11 12 13 14 15 16 17; do
        RESP=$(curl -s "${BASE_URL}/api/communities/clusters?west=${WEST}&south=${SOUTH}&east=${EAST}&north=${NORTH}&zoom=${zoom}")
        FEAT_COUNT=$(echo "$RESP" | jq '.clusters | length')
        CLUST_COUNT=$(echo "$RESP" | jq '[.clusters[] | select(.properties.cluster == true)] | length')
        echo "   Zoom $zoom: $FEAT_COUNT features, $CLUST_COUNT clusters"
    done
    
    exit 1
else
    echo -e "\n🎉 All tests passed! Map clustering is working correctly."
    exit 0
fi