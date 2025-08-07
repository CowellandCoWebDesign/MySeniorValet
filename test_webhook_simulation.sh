#!/bin/bash

echo "==========================================="
echo "SIMULATING STRIPE WEBHOOK EVENTS"
echo "==========================================="
echo ""

BASE_URL="http://localhost:5000/api/payments/webhook"

# Simulate payment_intent.succeeded event
echo "1. Simulating payment_intent.succeeded..."
curl -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -H "stripe-signature: test_signature" \
  -d '{
    "id": "evt_test_webhook",
    "type": "payment_intent.succeeded",
    "data": {
      "object": {
        "id": "pi_test_community_standard",
        "amount": 14900,
        "currency": "usd",
        "metadata": {
          "tier": "standard",
          "type": "community",
          "tierName": "Standard",
          "communityId": "1"
        }
      }
    }
  }' \
  -s -o /dev/null -w "Response: %{http_code}\n"

# Simulate checkout.session.completed event
echo "2. Simulating checkout.session.completed..."
curl -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -H "stripe-signature: test_signature" \
  -d '{
    "id": "evt_test_checkout",
    "type": "checkout.session.completed",
    "data": {
      "object": {
        "id": "cs_test_vendor_basic",
        "subscription": "sub_test_vendor",
        "metadata": {
          "tier": "basic",
          "type": "vendor",
          "tierName": "Basic Listing",
          "vendorId": "1"
        }
      }
    }
  }' \
  -s -o /dev/null -w "Response: %{http_code}\n"

echo ""
echo "Webhook simulation complete!"
echo "Check server logs for processing details."
