# Stripe Webhook Configuration for MySeniorValet

## 🚀 Production Webhook URL (Use This in Stripe)

When you deploy MySeniorValet to production, use this webhook URL:
```
https://your-production-domain.com/api/webhooks/webhook
```

## 📋 Required Stripe Webhook Events

Select these 6 events in your Stripe Dashboard webhook configuration:

1. **`checkout.session.completed`** - When subscription payment succeeds
2. **`invoice.paid`** - When recurring payments succeed  
3. **`invoice.payment_failed`** - When payments fail
4. **`customer.subscription.created`** - When new subscriptions start
5. **`customer.subscription.updated`** - When subscription details change
6. **`customer.subscription.deleted`** - When subscriptions are cancelled

## 🔧 Development Testing Options

Since Stripe doesn't accept localhost, you have 3 options:

### Option 1: Deploy to Production First
- Deploy MySeniorValet to your production domain
- Use the production URL in Stripe webhook settings
- Get the webhook secret and add it to environment variables

### Option 2: Use ngrok (Tunnel localhost)
```bash
# Install ngrok
npm install -g ngrok

# Create tunnel to your local server
ngrok http 5000

# Use the https URL ngrok provides in Stripe
# Example: https://abc123.ngrok.io/api/webhooks/webhook
```

### Option 3: Skip Webhook for Now
- The subscription system works without webhooks
- Users can subscribe and checkout successfully
- Webhooks only add automatic status updates
- You can add the webhook secret later when deployed

## 🎯 Recommended Approach

**For immediate testing:** Use Option 3 - skip webhooks for now
**For full functionality:** Use Option 1 - deploy to production first

The MySeniorValet subscription system is fully functional without webhooks. Communities can subscribe, checkout, and manage their plans. Webhooks just add automatic status synchronization.

## 🔐 After Webhook Creation

Once you create the webhook in Stripe, you'll get a signing secret starting with `whsec_`. Add this to your environment variables as `STRIPE_WEBHOOK_SECRET`.