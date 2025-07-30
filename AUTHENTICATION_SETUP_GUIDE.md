# MySeniorValet Authentication Setup Guide

## 🔐 Authentication Configuration for Launch

### 1. Stripe Webhook Secret Setup

**Current Status**: Your webhook handler already works without the secret in development mode!

To get your webhook secret:
1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter webhook URL: `https://your-replit-app-name.replit.app/api/webhooks/webhook`
4. Select these events:
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`)
7. Add to Replit Secrets: `STRIPE_WEBHOOK_SECRET = whsec_your_secret_here`

### 2. Replit Auth Configuration

**For Production Replit Auth:**
1. The platform automatically uses Replit Auth when deployed
2. No additional secrets needed - it works out of the box!
3. Users will see "Sign in with Replit" button

**Current Auth Flow:**
- Development: Uses session-based auth with email/password
- Production: Can use both Replit Auth AND email/password

### 3. Test Authentication Flow

Test the current email/password auth:
```bash
# Create test user
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "firstName": "Test",
    "lastName": "User"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

### 4. Production Deployment Checklist

✅ **Already Working:**
- Email/password authentication
- Session management
- Role-based access control
- Stripe payment integration
- SendGrid email system

🔧 **Optional Enhancements:**
- [ ] Add STRIPE_WEBHOOK_SECRET for production security
- [ ] Add Google OAuth (requires GOOGLE_CLIENT_ID/SECRET)
- [ ] Enable 2FA (two-factor authentication)

### 5. Quick Launch Option

You can launch immediately with:
1. Current email/password auth (working)
2. Stripe payments (working, webhook optional)
3. Add webhook secret later for production

The platform is fully functional without the webhook secret - it just won't automatically update subscription statuses (users can still subscribe successfully).

### 6. Domain Configuration

When you deploy to production:
1. Update environment variables:
   - `NODE_ENV=production`
   - `SITE_URL=https://your-domain.com`
2. Replit Auth will automatically work
3. Sessions will use secure cookies

---

**Bottom Line**: Your authentication is ready to launch! The webhook secret is optional for initial launch.