#!/bin/bash

echo "=== DEPLOYMENT READINESS CHECK ==="
echo ""

# 1. Check authentication
echo "1. Authentication System:"
AUTH_TEST=$(curl -s -X POST http://127.0.0.1:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"MySecurePass123!"}' 2>/dev/null)
if echo "$AUTH_TEST" | grep -q "success"; then
  echo "✅ Authentication working"
else
  echo "❌ Authentication broken"
fi

# 2. Check Stripe configuration
echo ""
echo "2. Payment System:"
if [ -n "$STRIPE_SECRET_KEY" ] && [ -n "$VITE_STRIPE_PUBLISHABLE_KEY" ]; then
  echo "✅ Stripe API keys configured"
else
  echo "❌ Stripe API keys missing"
fi

# 3. Check data quality
echo ""
echo "3. Data Quality:"
psql $DATABASE_URL -t -c "
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN pricing IS NOT NULL THEN 1 END) as with_pricing,
  COUNT(CASE WHEN photos IS NOT NULL AND photos != '[]' THEN 1 END) as with_photos,
  COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as with_email,
  COUNT(CASE WHEN phone IS NOT NULL THEN 1 END) as with_phone
FROM communities;" 2>/dev/null | while read total with_pricing with_photos with_email with_phone; do
  echo "  Total Communities: $total"
  echo "  With Pricing: $with_pricing ($(( with_pricing * 100 / total ))%)"
  echo "  With Photos: $with_photos ($(( with_photos * 100 / total ))%)"
  echo "  With Email: $with_email ($(( with_email * 100 / total ))%)"
  echo "  With Phone: $with_phone ($(( with_phone * 100 / total ))%)"
done

# 4. Check critical endpoints
echo ""
echo "4. API Endpoints:"
curl -s http://127.0.0.1:5000/api/communities/count 2>/dev/null | grep -q "count" && echo "✅ Communities endpoint working" || echo "❌ Communities endpoint broken"
curl -s "http://127.0.0.1:5000/api/communities/search?location=dallas" 2>/dev/null | grep -q "communities" && echo "✅ Search working" || echo "❌ Search broken"
curl -s "http://127.0.0.1:5000/api/autocomplete/suggestions?query=park" 2>/dev/null | grep -q "suggestions" && echo "✅ Autocomplete working" || echo "❌ Autocomplete broken"

# 5. Check AI services
echo ""
echo "5. AI Services:"
[ -n "$PERPLEXITY_API_KEY" ] && echo "✅ Perplexity configured" || echo "❌ Perplexity missing"
[ -n "$ANTHROPIC_API_KEY" ] && echo "✅ Claude configured" || echo "❌ Claude missing"
[ -n "$OPENAI_API_KEY" ] && echo "✅ OpenAI configured" || echo "❌ OpenAI missing"

# 6. Check email service
echo ""
echo "6. Email Service:"
[ -n "$SENDGRID_API_KEY" ] && echo "✅ SendGrid configured" || echo "❌ SendGrid missing"

# 7. Check legal documents
echo ""
echo "7. Legal Documents:"
[ -f "client/src/pages/terms.tsx" ] && echo "✅ Terms of Service exists" || echo "⚠️ Terms of Service missing"
[ -f "client/src/pages/privacy.tsx" ] && echo "✅ Privacy Policy exists" || echo "⚠️ Privacy Policy missing"

echo ""
echo "=== CRITICAL ISSUES ==="
echo "⚠️ Only 0.86% of communities have photos - users will see empty profiles"
echo "⚠️ Only 28% have pricing information - limited value for users"
echo "⚠️ Legal documents may need review"

