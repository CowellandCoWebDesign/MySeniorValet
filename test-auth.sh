#!/bin/bash

echo "=== Authentication System Test ==="
echo ""

# Test signup
echo "1. Testing Signup..."
SIGNUP_RESULT=$(curl -s -X POST http://127.0.0.1:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"auth-test@example.com","password":"TestPass123!","confirmPassword":"TestPass123!","firstName":"Auth","lastName":"Test"}' 2>/dev/null)

if echo "$SIGNUP_RESULT" | grep -q '"user"'; then
  echo "✅ Signup successful"
else
  echo "❌ Signup failed: $SIGNUP_RESULT"
fi

# Test login
echo "2. Testing Login..."
LOGIN_RESULT=$(curl -s -c cookies.txt -X POST http://127.0.0.1:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"auth-test@example.com","password":"TestPass123!"}' 2>/dev/null)

if echo "$LOGIN_RESULT" | grep -q '"success":true'; then
  echo "✅ Login successful"
else
  echo "❌ Login failed: $LOGIN_RESULT"
fi

# Test authenticated endpoint
echo "3. Testing Authenticated Access..."
AUTH_USER=$(curl -s -b cookies.txt http://127.0.0.1:5000/api/auth/user 2>/dev/null)

if echo "$AUTH_USER" | grep -q "auth-test@example.com"; then
  echo "✅ Authenticated access working"
else
  echo "❌ Authenticated access failed: $AUTH_USER"
fi

# Test protected endpoints
echo "4. Testing Protected Endpoints..."
FAVORITES=$(curl -s -b cookies.txt http://127.0.0.1:5000/api/user/favorites 2>/dev/null)

if echo "$FAVORITES" | grep -q "Unauthorized"; then
  echo "⚠️ Favorites endpoint still needs auth middleware fix"
else
  echo "✅ Protected endpoints accessible"
fi

echo ""
echo "=== Community Functionality Test ==="
echo ""

# Test community search
echo "5. Testing Community Search..."
SEARCH_RESULT=$(curl -s "http://127.0.0.1:5000/api/communities/search?location=dallas" 2>/dev/null | head -c 100)

if echo "$SEARCH_RESULT" | grep -q "communities"; then
  echo "✅ Community search working"
else
  echo "❌ Community search failed"
fi

# Test autocomplete
echo "6. Testing Autocomplete..."
AUTOCOMPLETE=$(curl -s "http://127.0.0.1:5000/api/autocomplete/suggestions?query=park" 2>/dev/null | head -c 100)

if echo "$AUTOCOMPLETE" | grep -q "id"; then
  echo "✅ Autocomplete working"
else
  echo "❌ Autocomplete failed"
fi

# Test community detail
echo "7. Testing Community Detail..."
COMMUNITY_DETAIL=$(curl -s "http://127.0.0.1:5000/api/communities/3318" 2>/dev/null | head -c 100)

if echo "$COMMUNITY_DETAIL" | grep -q "name"; then
  echo "✅ Community detail working"
else
  echo "❌ Community detail failed"
fi

echo ""
echo "=== Platform Stats ==="
psql $DATABASE_URL -c "SELECT COUNT(*) as total_users FROM users;" 2>/dev/null
psql $DATABASE_URL -c "SELECT COUNT(*) as total_communities FROM communities;" 2>/dev/null
psql $DATABASE_URL -c "SELECT COUNT(*) as communities_with_pricing FROM communities WHERE pricing IS NOT NULL;" 2>/dev/null

# Clean up
rm -f cookies.txt

