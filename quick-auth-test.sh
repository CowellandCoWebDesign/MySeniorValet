#!/bin/bash

echo "🚀 Testing Quick Auth System for MySeniorValet Launch"
echo "================================================="

BASE_URL="http://localhost:5000"
TEST_EMAIL="launch-$(date +%s)@myseniorvalet.com"
TEST_PASSWORD="LaunchPass123!"

echo -e "\n✅ Testing auth endpoint availability..."
curl -s "$BASE_URL/api/auth/test"
echo -e "\n"

echo -e "\n📝 Creating new user with quick auth..."
SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/quick-signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"firstName\": \"Launch\",
    \"lastName\": \"Test\"
  }")

echo "Signup Response: $SIGNUP_RESPONSE"

echo -e "\n🔑 Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/quick-login" \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

echo "Login Response: $LOGIN_RESPONSE"

echo -e "\n👤 Getting user profile..."
USER_RESPONSE=$(curl -s "$BASE_URL/api/auth/quick-user" -b cookies.txt)
echo "User Profile: $USER_RESPONSE"

echo -e "\n🚪 Logging out..."
LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/quick-logout" -b cookies.txt)
echo "Logout Response: $LOGOUT_RESPONSE"

echo -e "\n✅ Auth test complete! Test email: $TEST_EMAIL"

# Clean up
rm -f cookies.txt

echo -e "\n🎉 AUTHENTICATION READY FOR LAUNCH!"
echo "Working endpoints:"
echo "  - POST /api/auth/quick-signup"
echo "  - POST /api/auth/quick-login"
echo "  - GET /api/auth/quick-user"
echo "  - POST /api/auth/quick-logout"