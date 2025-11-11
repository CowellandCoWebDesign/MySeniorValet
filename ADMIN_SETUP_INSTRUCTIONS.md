# Admin Setup Instructions for Production Deployment

## Overview
This application includes a secure one-time admin setup flow that allows creating the first super administrator account after deployment. The setup flow is automatically disabled once the first admin account is created.

## Security Features
- Setup secret required (never exposed in URLs)
- CSRF protection with double-submit cookies
- Rate limiting (5 attempts per minute)
- Session IP validation
- 30-minute setup session timeout
- Strong password requirements
- Automatic deactivation after first admin created

## Production Deployment Requirements

### 1. Set the Setup Secret (REQUIRED)
In production, you MUST explicitly set the `ADMIN_SETUP_SECRET` environment variable:

```bash
ADMIN_SETUP_SECRET=<your-secure-random-string>
```

**Important:** 
- Generate a strong random secret (32+ characters recommended)
- Store this secret securely - you'll need it for the initial setup
- DO NOT rely on auto-generated secrets in production (they won't work across multiple instances)
- Rotate the secret after setup is complete for additional security

### 2. Trust Proxy Configuration
If deploying behind a load balancer or proxy, ensure Express is configured with:

```javascript
app.set('trust proxy', true)
```

This ensures IP validation works correctly with forwarded headers.

### 3. Log Security
- Restrict access to application logs since the setup secret may be logged on startup
- Consider using a centralized logging system with access controls
- Rotate logs after initial setup

## Setup Process

### For Administrators
1. After deployment, obtain the setup secret from your deployment team
2. Navigate to: `https://your-domain.com/admin/setup`
3. Enter the setup secret in the secure input field (NOT in the URL)
4. Fill in your account details:
   - Email address
   - First and last name
   - Strong password (8+ chars, uppercase, lowercase, number)
5. Click "Create Administrator Account"
6. You'll be automatically redirected to the application

### For DevOps/Deployment Team
1. Generate a secure random setup secret
2. Set `ADMIN_SETUP_SECRET` environment variable in production
3. Deploy the application
4. Provide the setup secret to the designated administrator through a secure channel
5. Monitor logs to confirm successful admin account creation
6. Consider rotating the secret after setup (though endpoints auto-disable)

## Troubleshooting

### "Setup Not Available" Error
- An administrator account already exists
- Check database for existing super_admin users

### 404 Errors on Setup Endpoints
- Verify the setup secret is correct
- Ensure you're sending it via the X-Setup-Secret header (the UI handles this)
- Check that no super_admin accounts exist in the database

### Session Expired
- The setup session expires after 30 minutes
- Refresh the page and start over with the setup secret

### Multiple Instance Deployments
- MUST use the same `ADMIN_SETUP_SECRET` across all instances
- Never rely on auto-generated secrets in clustered environments

## Security Best Practices

1. **Never share the setup secret in:**
   - URLs or query parameters
   - Email or unencrypted messages
   - Version control systems
   - Public documentation

2. **Always:**
   - Use HTTPS in production
   - Set strong, unique setup secrets
   - Rotate secrets after use
   - Monitor setup attempts in logs
   - Restrict database access

3. **After Setup:**
   - The setup endpoints automatically become inaccessible
   - Consider removing the setup secret from environment variables
   - Audit the created admin account
   - Enable additional authentication factors if available

## Technical Details

- Setup endpoints: `/api/setup/status` and `/api/setup/create-admin`
- Frontend page: `/admin/setup`
- Security middleware validates all requests
- Database: Uses PostgreSQL with proper constraints
- Session storage: In-memory (clears on restart)