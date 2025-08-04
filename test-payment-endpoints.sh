#!/bin/bash

echo "=== Testing MySeniorValet Payment Endpoints ==="
echo

# Test 1: Payment Intent Creation
echo "1. Testing Payment Intent Creation..."
curl -X POST http://localhost:5000/api/payment-intent/create \
  -H "Content-Type: application/json" \
  -d '{"amount": 14900, "currency": "usd", "metadata": {"tier": "standard"}}' \
  -s | jq .

echo
echo "2. Testing Vendor Checkout Creation..."
curl -X POST http://localhost:5000/api/payments/create-vendor-checkout \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "featured-vendor",
    "vendorData": {
      "businessName": "Premium Care Services",
      "email": "contact@premiumcare.com",
      "phone": "555-9999",
      "contactName": "Jane Smith",
      "description": "Premium senior care services"
    }
  }' \
  -s | jq .

echo
echo "3. Testing Community Checkout Creation..."
curl -X POST http://localhost:5000/api/payments/create-community-checkout \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "featured-spotlight",
    "communityId": 1
  }' \
  -s | jq .

echo
echo "4. Testing Webhook Endpoint (with test signature)..."
curl -X POST http://localhost:5000/api/payments/webhook \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: t=12345,v1=test_signature" \
  -d '{"type": "checkout.session.completed", "data": {"object": {"id": "cs_test_123"}}}' \
  -s | jq .

echo
echo "=== All tests completed ==="
