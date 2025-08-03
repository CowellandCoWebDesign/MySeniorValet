# Stripe Webhook Setup Guide for MySeniorValet

## Overview
This guide will help you set up Stripe webhooks so that test payments appear correctly in your Stripe dashboard and the platform can process subscription changes automatically.

## Step 1: Create Webhook Endpoint in Stripe Dashboard

1. **Go to Stripe Dashboard**
   - Log into your Stripe account
   - Navigate to **Developers** → **Webhooks**

2. **Add New Endpoint**
   - Click **"Add endpoint"**
   - Enter your webhook URL: `https://your-replit-app-url.replit.app/api/payments/webhook`
   - Replace `your-replit-app-url` with your actual Replit app URL

3. **Select Events to Listen For**
   Add these specific events (required for MySeniorValet):
   ```
   checkout.session.completed
   customer.subscription.created
   customer.subscription.updated
   customer.subscription.deleted
   invoice.payment_succeeded
   invoice.payment_failed
   payment_intent.succeeded
   payment_intent.payment_failed
   ```

4. **Save the Webhook**
   - Click **"Add endpoint"**
   - Stripe will generate a signing secret

## Step 2: Get Your Webhook Secret

1. **Copy the Signing Secret**
   - In your new webhook endpoint, click **"Reveal"** next to "Signing secret"
   - Copy the secret (starts with `whsec_`)
   - This is your `STRIPE_WEBHOOK_SECRET`

## Step 3: Get Your Publishable Key

1. **Navigate to API Keys**
   - Go to **Developers** → **API Keys**
   - Copy the **"Publishable key"** (starts with `pk_test_` or `pk_live_`)
   - This is your `STRIPE_PUBLISHABLE_KEY`

## Step 4: Add Keys to Replit

You'll need to provide these two keys:

1. **STRIPE_PUBLISHABLE_KEY**: `pk_test_...` (from API Keys section)
2. **STRIPE_WEBHOOK_SECRET**: `whsec_...` (from your webhook endpoint)

## Current Webhook Endpoint Implementation

The MySeniorValet platform already has the webhook handler configured at:
```
POST /api/payments/webhook
```

This endpoint handles:
- ✅ Checkout session completion
- ✅ Subscription creation/updates
- ✅ Payment success/failure
- ✅ Subscription cancellations
- ✅ Invoice processing

## Testing the Webhook

After setup, you can test using Stripe's test mode:

1. **Use Test Cards**
   ```
   Success: 4242424242424242
   Decline: 4000000000000002
   ```

2. **Monitor Webhook Events**
   - Go to **Developers** → **Webhooks** → Your endpoint
   - Click **"Send test webhook"** to verify connection

3. **Check Event Logs**
   - All webhook events will appear in your Stripe dashboard
   - Successful events show in MySeniorValet server logs

## Troubleshooting

**If payments still don't appear:**
1. Verify webhook URL matches your Replit app URL exactly
2. Ensure all required events are selected
3. Check that signing secret is copied correctly
4. Test with Stripe's webhook testing tool

**Common Issues:**
- Wrong webhook URL (must match your Replit domain)
- Missing required events in webhook configuration
- Incorrect signing secret format

Once you provide the two keys, all Stripe functionality will work correctly!