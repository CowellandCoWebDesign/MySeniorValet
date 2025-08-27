#!/bin/bash

# MySeniorValet Comprehensive Functionality Test Suite
# Tests every endpoint, button, link, and system

echo "================================================"
echo " MySeniorValet Complete Functionality Test"
echo " Testing ALL endpoints and user interactions"
echo "================================================"
echo ""

BASE_URL="http://127.0.0.1:5000"
FAILED_TESTS=0
PASSED_TESTS=0

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_status=$3
    local description=$4
    local data=$5
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
    fi
    
    if [ "$response" = "$expected_status" ]; then
        echo "✓ $description"
        ((PASSED_TESTS++))
    else
        echo "✗ $description (Expected: $expected_status, Got: $response)"
        ((FAILED_TESTS++))
    fi
}

# Function to test endpoint with data response
test_endpoint_data() {
    local endpoint=$1
    local description=$2
    
    response=$(curl -s "$BASE_URL$endpoint")
    if [ ! -z "$response" ] && [ "$response" != "null" ]; then
        echo "✓ $description - Data returned"
        ((PASSED_TESTS++))
    else
        echo "✗ $description - No data"
        ((FAILED_TESTS++))
    fi
}

echo "1. TESTING CORE API ENDPOINTS"
echo "=============================="
test_endpoint "GET" "/api/platform/stats/formatted" "200" "Platform statistics"
test_endpoint "GET" "/api/communities/count" "200" "Community count"
test_endpoint "GET" "/api/auth/status" "200" "Authentication status"
test_endpoint "GET" "/api/communities/autocomplete/v2?q=Dallas" "200" "Autocomplete search - Dallas"
test_endpoint "GET" "/api/communities/autocomplete/v2?q=Toronto" "200" "Autocomplete search - Toronto"
test_endpoint "GET" "/api/communities/autocomplete/v2?q=Sydney" "200" "Autocomplete search - Sydney"
test_endpoint "GET" "/api/communities/autocomplete/v2?q=Mexico" "200" "Autocomplete search - Mexico"

echo ""
echo "2. TESTING COMMUNITY DETAIL PAGES"
echo "=================================="
# Get a sample community ID first
COMMUNITY_ID=$(curl -s "$BASE_URL/api/communities/autocomplete/v2?q=Dallas" | jq -r '.suggestions[0].value' 2>/dev/null)
if [ ! -z "$COMMUNITY_ID" ]; then
    test_endpoint "GET" "/api/communities/$COMMUNITY_ID" "200" "Community detail by ID"
    test_endpoint "GET" "/api/communities/$COMMUNITY_ID/photos" "200" "Community photos"
    test_endpoint "GET" "/api/communities/$COMMUNITY_ID/pricing" "200" "Community pricing"
    test_endpoint "GET" "/api/communities/$COMMUNITY_ID/availability" "200" "Community availability"
    test_endpoint "GET" "/api/communities/$COMMUNITY_ID/ai-insights" "200" "Community AI insights"
else
    echo "✗ Could not get community ID for testing"
    ((FAILED_TESTS+=5))
fi

echo ""
echo "3. TESTING SEARCH FUNCTIONALITY"
echo "================================"
test_endpoint "POST" "/api/communities/search" "200" "Advanced search" '{"query":"senior living","limit":10}'
test_endpoint "GET" "/api/communities/search?q=assisted%20living&limit=5" "200" "Simple search"
test_endpoint "GET" "/api/communities/nearby?lat=32.7767&lng=-96.7970&radius=10" "200" "Nearby search (Dallas)"
test_endpoint "GET" "/api/map/clusters" "200" "Map clusters"

echo ""
echo "4. TESTING USER AUTHENTICATION"
echo "==============================="
test_endpoint "GET" "/api/auth/user" "401" "User profile (unauthenticated)"
test_endpoint "POST" "/api/auth/register" "200" "User registration" '{"email":"test@test.com","password":"Test123!","firstName":"Test","lastName":"User"}'
test_endpoint "POST" "/api/auth/login" "200" "User login" '{"email":"test@test.com","password":"Test123!"}'
test_endpoint "POST" "/api/auth/logout" "200" "User logout" ""
test_endpoint "POST" "/api/auth/reset-password" "200" "Password reset request" '{"email":"test@test.com"}'

echo ""
echo "5. TESTING USER FEATURES"
echo "========================="
test_endpoint "GET" "/api/user/favorites" "401" "User favorites (unauthenticated)"
test_endpoint "GET" "/api/user/tours" "401" "User tours (unauthenticated)"
test_endpoint "GET" "/api/user/notifications" "401" "User notifications (unauthenticated)"
test_endpoint "GET" "/api/user/saved-searches" "401" "User saved searches (unauthenticated)"

echo ""
echo "6. TESTING VENDOR ENDPOINTS"
echo "============================"
test_endpoint "GET" "/api/vendor/dashboard" "401" "Vendor dashboard (unauthenticated)"
test_endpoint "GET" "/api/vendor/claims" "401" "Vendor claims (unauthenticated)"
test_endpoint "GET" "/api/vendor/analytics" "401" "Vendor analytics (unauthenticated)"
test_endpoint "GET" "/api/vendor/communities" "401" "Vendor communities (unauthenticated)"

echo ""
echo "7. TESTING TOUR SCHEDULING"
echo "==========================="
test_endpoint "GET" "/api/tours/available-times" "200" "Available tour times"
test_endpoint "POST" "/api/tours/schedule" "401" "Schedule tour (unauthenticated)" '{"communityId":"test","date":"2025-09-01","time":"10:00"}'
test_endpoint "GET" "/api/tours/upcoming" "401" "Upcoming tours (unauthenticated)"

echo ""
echo "8. TESTING PAYMENT SYSTEM"
echo "=========================="
test_endpoint "GET" "/api/payments/plans" "200" "Payment plans"
test_endpoint "POST" "/api/payments/create-intent" "401" "Create payment intent (unauthenticated)" '{"plan":"premium"}'
test_endpoint "GET" "/api/payments/history" "401" "Payment history (unauthenticated)"

echo ""
echo "9. TESTING AI INTELLIGENCE"
echo "==========================="
test_endpoint "POST" "/api/ai/analyze-community" "200" "AI community analysis" '{"communityId":"test"}'
test_endpoint "POST" "/api/ai/chat" "200" "AI chat" '{"message":"Tell me about senior living options"}'
test_endpoint "GET" "/api/ai/recommendations?preferences=assisted-living" "200" "AI recommendations"

echo ""
echo "10. TESTING ADMIN ENDPOINTS"
echo "============================"
test_endpoint "GET" "/api/admin/stats" "401" "Admin statistics (unauthenticated)"
test_endpoint "GET" "/api/admin/users" "401" "Admin user management (unauthenticated)"
test_endpoint "GET" "/api/admin/communities" "401" "Admin community management (unauthenticated)"

echo ""
echo "11. TESTING DATA INTEGRITY"
echo "==========================="
# Test if autocomplete returns valid data
AUTOCOMPLETE_COUNT=$(curl -s "$BASE_URL/api/communities/autocomplete/v2?q=a" | jq '.suggestions | length' 2>/dev/null)
if [ "$AUTOCOMPLETE_COUNT" -gt 0 ]; then
    echo "✓ Autocomplete returns results"
    ((PASSED_TESTS++))
else
    echo "✗ Autocomplete returns no results"
    ((FAILED_TESTS++))
fi

# Test if platform stats are reasonable
TOTAL_COMMUNITIES=$(curl -s "$BASE_URL/api/platform/stats/formatted" | jq -r '.communityCount' 2>/dev/null)
if [ "$TOTAL_COMMUNITIES" -gt 30000 ]; then
    echo "✓ Platform has $TOTAL_COMMUNITIES communities"
    ((PASSED_TESTS++))
else
    echo "✗ Platform community count issue: $TOTAL_COMMUNITIES"
    ((FAILED_TESTS++))
fi

echo ""
echo "12. TESTING NOTIFICATION SYSTEM"
echo "================================"
test_endpoint "GET" "/api/notifications/types" "200" "Notification types"
test_endpoint "POST" "/api/notifications/subscribe" "401" "Subscribe to notifications (unauthenticated)" '{"type":"price_changes"}'
test_endpoint "GET" "/api/notifications/history" "401" "Notification history (unauthenticated)"

echo ""
echo "13. TESTING EMERGENCY CONTACT"
echo "=============================="
test_endpoint "GET" "/api/emergency/contact" "200" "Emergency contact info"
test_endpoint "POST" "/api/emergency/alert" "200" "Send emergency alert" '{"communityId":"test","message":"Test alert"}'

echo ""
echo "14. TESTING WEBSOCKET CONNECTION"
echo "=================================="
# Test WebSocket endpoint exists
WS_TEST=$(curl -s -o /dev/null -w "%{http_code}" -H "Upgrade: websocket" -H "Connection: Upgrade" "$BASE_URL/ws")
if [ "$WS_TEST" = "426" ] || [ "$WS_TEST" = "101" ]; then
    echo "✓ WebSocket endpoint available"
    ((PASSED_TESTS++))
else
    echo "✗ WebSocket endpoint issue"
    ((FAILED_TESTS++))
fi

echo ""
echo "15. TESTING STATIC ASSETS"
echo "=========================="
test_endpoint "GET" "/" "200" "Homepage loads"
test_endpoint "GET" "/assets/index.js" "200" "JavaScript bundle"
test_endpoint "GET" "/assets/index.css" "200" "CSS stylesheet"

echo ""
echo "================================================"
echo " TEST RESULTS SUMMARY"
echo "================================================"
echo " PASSED: $PASSED_TESTS tests"
echo " FAILED: $FAILED_TESTS tests"
echo " TOTAL:  $((PASSED_TESTS + FAILED_TESTS)) tests"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo "✅ ALL TESTS PASSED!"
else
    echo "⚠️  Some tests failed - review needed"
fi

echo "================================================"