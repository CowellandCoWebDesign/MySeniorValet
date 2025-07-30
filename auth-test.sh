#!/bin/bash

echo "🔐 Testing MySeniorValet Authentication System"
echo "============================================"

BASE_URL="http://localhost:5000"
TEST_EMAIL="test-$(date +%s)@myseniorvalet.com"
TEST_PASSWORD="TestPassword123!"

echo -e "\n📝 Step 1: Creating new user..."
SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"confirmPassword\": \"$TEST_PASSWORD\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\"
  }")

echo "Signup Response:"
echo "$SIGNUP_RESPONSE" | jq

echo -e "\n🔑 Step 2: Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

echo "Login Response:"
echo "$LOGIN_RESPONSE" | jq

echo -e "\n👤 Step 3: Getting user profile..."
USER_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/user" \
  -b cookies.txt)

echo "User Profile Response:"
echo "$USER_RESPONSE" | jq

echo -e "\n🚪 Step 4: Logging out..."
LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/logout" \
  -b cookies.txt)

echo "Logout Response:"
echo "$LOGOUT_RESPONSE" | jq

echo -e "\n✅ Authentication test complete!"
echo "Test email used: $TEST_EMAIL"

# Clean up
rm -f cookies.txt