#!/bin/bash

echo "Testing Free Tier Claim and Contact Information Editing"
echo "======================================================="

# Test claiming a free tier community
echo -e "\n1. Testing free tier claim..."
curl -s -X POST "http://localhost:5000/api/payments/claim-free-tier" \
  -H "Content-Type: application/json" \
  -d '{
    "isNewCommunity": true,
    "companyName": "Test Senior Living",
    "businessAddress": "123 Test St, Miami, FL 33101",
    "claimerEmail": "test@example.com",
    "claimerPhone": "(555) 123-4567"
  }' | jq .

echo -e "\n2. Checking if we can access the dashboard (should redirect to login)..."
curl -s -I "http://localhost:5000/dashboard/community" | head -5

echo -e "\n3. Testing community update (requires authentication)..."
# This will fail without proper authentication
curl -s -X PUT "http://localhost:5000/api/communities/50995" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Community Name",
    "phone": "(555) 999-8888",
    "email": "updated@example.com",
    "website": "www.updatedcommunity.com"
  }' | jq .