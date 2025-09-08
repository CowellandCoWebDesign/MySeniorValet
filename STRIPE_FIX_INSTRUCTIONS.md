# Fix Stripe Key Mismatch

## The Problem
Your payment system isn't working because:
- `VITE_STRIPE_PUBLIC_KEY` (frontend) 
- `STRIPE_SECRET_KEY` (backend)
Are from **different Stripe accounts or modes**

## Quick Fix Instructions

### Step 1: Go to Stripe Dashboard
1. Visit https://dashboard.stripe.com
2. Sign in to your Stripe account

### Step 2: Make Sure You're in TEST Mode
- Look at the top-left corner
- Toggle the switch to **"Test mode"** (should show orange)

### Step 3: Get Your Matching Keys
1. Click **"Developers"** → **"API keys"**
2. Copy both keys from the SAME page:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

### Step 4: Update Your Replit Secrets
1. In Replit, click the 🔒 **Secrets** tab (left sidebar)
2. Update these values:
   - `VITE_STRIPE_PUBLIC_KEY` = Your publishable key (pk_test_...)
   - `STRIPE_SECRET_KEY` = Your secret key (sk_test_...)

### Step 5: Restart Your App
After updating secrets, your app will auto-restart

## Verify It's Working
- Both keys should start with `pk_test_` and `sk_test_`
- Both must be from the SAME Stripe account
- Both must be from TEST mode (not live mode)

## Test Card for Payments
Once fixed, use this test card:
- Number: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

Your payment system will work immediately after fixing the keys!