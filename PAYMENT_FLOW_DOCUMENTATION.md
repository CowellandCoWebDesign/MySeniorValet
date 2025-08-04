# MySeniorValet Payment Flow Documentation

## Complete Payment Journey

### 1. Payment Intent Creation ✅ WORKING
- **Endpoint**: `POST /api/payments/create-payment-intent`
- **Test Result**: Successfully creates payment intents with valid clientSecret
- **Example Response**: 
  ```json
  {
    "clientSecret": "pi_3RsW79Cuxvo3uux00TetYdtN_secret_...",
    "paymentIntentId": "pi_3RsW79Cuxvo3uux00TetYdtN"
  }
  ```

### 2. Payment Page URLs

#### Community Payment Pages:
- `/community-mobile-payment/standard` - $149/month
- `/community-mobile-payment/featured` - $249/month  
- `/community-mobile-payment/platinum` - $349/month

#### Vendor Payment Pages:
- `/vendor-mobile-payment/basic-vendor` - $99/month
- `/vendor-mobile-payment/featured-vendor` - $249/month
- `/vendor-mobile-payment/national-partner` - $499/month

### 3. Payment Flow Steps

1. **User Selects Tier** (from /payment-test-dashboard or portal)
   - Data stored in sessionStorage
   - Redirects to appropriate payment page

2. **Payment Page Loads**
   - Retrieves tier details
   - Validates stored data
   - Initializes progress tracker

3. **MobilePaymentForm Component**
   - Automatically creates payment intent on mount
   - Loads Stripe Payment Element
   - Displays secure payment form

4. **User Enters Card Details**
   - Test card: 4242 4242 4242 4242
   - Any future expiry date
   - Any 3-digit CVC
   - Any 5-digit ZIP code

5. **Payment Processing**
   - Stripe validates card
   - Processes payment
   - Returns paymentIntent object

6. **Success Handling**
   - Calls confirmation endpoint
   - Updates database
   - Redirects to onboarding or success page

### 4. API Endpoints

#### Create Payment Intent
```
POST /api/payments/create-payment-intent
Body: {
  amount: 14900, // in cents
  metadata: {
    type: 'community',
    tier: 'standard'
  }
}
```

#### Confirm Community Payment
```
POST /api/payments/confirm-community-payment
Body: {
  paymentIntentId: "pi_...",
  communityId: "1",
  tier: "standard"
}
```

#### Confirm Vendor Payment  
```
POST /api/payments/confirm-vendor-payment
Body: {
  paymentIntentId: "pi_...",
  vendorData: {
    businessName: "Test Vendor",
    email: "test@vendor.com"
  }
}
```

### 5. Common Issues & Solutions

#### Issue: Payment page doesn't load
- **Check**: Data in sessionStorage
- **Solution**: Ensure tier selection stores data properly

#### Issue: Payment Element doesn't appear
- **Check**: VITE_STRIPE_PUBLIC_KEY environment variable
- **Check**: Network tab for payment intent creation
- **Solution**: Verify Stripe key starts with 'pk_'

#### Issue: Payment fails
- **Check**: Using test mode card numbers
- **Check**: Browser console for errors
- **Solution**: Use 4242 4242 4242 4242 for testing

#### Issue: Confirmation fails
- **Check**: Payment intent ID format
- **Check**: Backend logs for Stripe errors
- **Solution**: Ensure payment intent is valid

### 6. Testing Steps

1. Go to `/payment-test-dashboard`
2. Click any tier card (e.g., "Standard Community" for $149)
3. You'll be redirected to payment page
4. Wait for Payment Element to load
5. Enter test card: 4242 4242 4242 4242
6. Click "Subscribe for $X/month"
7. Payment should process and redirect to success

### 7. Mobile-Optimized Features
- Full-screen payment experience
- Progress tracker at top
- Clear pricing display
- Error messages below form
- Loading states during processing
- Secure badge for trust

## Current Status
✅ Payment intent creation working
✅ All payment pages accessible
✅ Stripe integration configured
✅ Mobile-optimized UI ready
⏳ Awaiting successful end-to-end test