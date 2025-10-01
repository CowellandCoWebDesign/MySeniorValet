# MySeniorValet Platform - Complete Migration Guide

## Overview

This guide provides complete instructions for migrating MySeniorValet from Replit to another hosting provider and/or database service. This includes all secrets, environment variables, configuration changes, and deployment instructions.

---

## Table of Contents

1. [Current Environment Variables & Secrets](#current-environment-variables--secrets)
2. [Database Migration](#database-migration)
3. [Hosting Migration](#hosting-migration)
4. [Configuration Changes Required](#configuration-changes-required)
5. [Service Replacements](#service-replacements)
6. [Testing Migration](#testing-migration)
7. [Rollback Plan](#rollback-plan)

---

## Current Environment Variables & Secrets

### ✅ Secrets Currently Configured in Replit

These are the secrets that currently exist in your Replit environment and MUST be transferred to your new hosting provider:

#### Database Configuration
```bash
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]
PGHOST=[your-postgres-host]
PGUSER=[your-postgres-user]
PGPASSWORD=[your-postgres-password]
PGDATABASE=[your-database-name]
PGPORT=5432
```

#### AI Service API Keys
```bash
PERPLEXITY_API_KEY=[your-perplexity-api-key]
ANTHROPIC_API_KEY=[your-anthropic-api-key]
OPENAI_API_KEY=[your-openai-api-key]
```

#### Authentication & Security
```bash
SESSION_SECRET=[your-session-secret]
JWT_SECRET=[your-jwt-secret]
GOOGLE_CLIENT_ID=[your-google-oauth-client-id]
GOOGLE_CLIENT_SECRET=[your-google-oauth-client-secret]
```

#### Payment Processing
```bash
STRIPE_SECRET_KEY=[your-stripe-secret-key]
STRIPE_WEBHOOK_SECRET=[your-stripe-webhook-secret]
```

#### Email Service
```bash
SENDGRID_API_KEY=[your-sendgrid-api-key]
```

#### Replit-Specific (Currently Exists, May Need Replacement)
```bash
REPLIT_DB_URL=[replit-key-value-store-url]
```

### ⚠️ Secrets NOT Currently Configured (May Be Needed Later)

These were checked but don't exist in your current setup:
```bash
FACEBOOK_APP_ID=(not configured)
FACEBOOK_APP_SECRET=(not configured)
```

### 🤖 Replit Auto-Generated Variables (Will Need Manual Replacement)

These are automatically provided by Replit and will NOT exist on other platforms:

```bash
REPL_OWNER=[your-replit-username]
REPL_ID=[unique-repl-identifier]
REPLIT_DEV_DOMAIN=[your-dev-domain.repl.co]
HOME=[home-directory-path]
```

**Migration Strategy**: 
- `REPL_OWNER`, `REPL_ID`: Only used for Replit-specific features - can be removed or replaced with custom values
- `REPLIT_DEV_DOMAIN`: Replace with your actual production domain
- `HOME`: Will be automatically set by the new host

### 📝 Additional Environment Variables You May Need

```bash
# Node Environment
NODE_ENV=production

# Port Configuration (if needed)
PORT=5000

# Optional: Debug Flags
DEBUG_DB=false

# Optional: Custom Domain
CUSTOM_DOMAIN=myseniorvalet.com

# Optional: Frontend URL (if hosted separately)
VITE_API_URL=https://api.myseniorvalet.com
```

---

## Database Migration

### Step 1: Export Replit PostgreSQL Database

#### Option A: Using pg_dump (Recommended)

1. **Install PostgreSQL client tools locally** (if not already installed):
   ```bash
   # macOS
   brew install postgresql
   
   # Ubuntu/Debian
   sudo apt-get install postgresql-client
   
   # Windows
   # Download from https://www.postgresql.org/download/windows/
   ```

2. **Export the database from Replit Shell**:
   ```bash
   # Full database backup (schema + data)
   pg_dump $DATABASE_URL > myseniorvalet_backup_$(date +%Y%m%d).sql
   
   # Or with compression
   pg_dump $DATABASE_URL | gzip > myseniorvalet_backup_$(date +%Y%m%d).sql.gz
   ```

3. **Download the backup file**:
   - In Replit, navigate to the file in the file tree
   - Right-click → Download
   - Or use the Replit web interface to access files

#### Option B: Using Drizzle Kit

Since your project uses Drizzle ORM, you can also:

1. **Generate SQL from your current schema**:
   ```bash
   npx drizzle-kit generate
   ```
   This creates migration SQL files in `./migrations/`

2. **Export current data**:
   Create a custom export script (`scripts/export-data.ts`):
   ```typescript
   import { db } from '../server/db';
   import * as schema from '@shared/schema';
   import * as fs from 'fs';
   
   async function exportData() {
     const communities = await db.select().from(schema.communities);
     const users = await db.select().from(schema.users);
     // ... export other tables
     
     fs.writeFileSync('data-export.json', JSON.stringify({
       communities,
       users,
       // ... other tables
     }, null, 2));
   }
   
   exportData();
   ```

### Step 2: Choose Your New Database Provider

#### Recommended PostgreSQL Providers

1. **Neon (Serverless PostgreSQL)** - https://neon.tech
   - Pros: Similar to Replit's Neon backend, easy migration
   - Connection pooling built-in
   - Free tier available
   - Scale to zero

2. **Supabase** - https://supabase.com
   - Pros: PostgreSQL + built-in auth, storage, real-time
   - Good free tier
   - Admin UI included

3. **Railway** - https://railway.app
   - Pros: Simple setup, PostgreSQL included
   - Good for full-stack apps
   - Fair pricing

4. **Amazon RDS** - https://aws.amazon.com/rds/postgresql/
   - Pros: Enterprise-grade, highly scalable
   - Cons: More complex, more expensive

5. **DigitalOcean Managed PostgreSQL** - https://www.digitalocean.com/products/managed-databases-postgresql
   - Pros: Simple, reliable, good pricing
   - Managed backups included

### Step 3: Import to New Database

1. **Create new database on chosen provider**

2. **Get new connection string** (will look like):
   ```
   postgresql://username:password@host:5432/database?sslmode=require
   ```

3. **Import your backup**:
   ```bash
   # If you have .sql file
   psql "postgresql://new-connection-string" < myseniorvalet_backup_20250101.sql
   
   # If you have compressed .sql.gz
   gunzip -c myseniorvalet_backup_20250101.sql.gz | psql "postgresql://new-connection-string"
   ```

4. **Verify the import**:
   ```bash
   psql "postgresql://new-connection-string" -c "\dt"  # List tables
   psql "postgresql://new-connection-string" -c "SELECT COUNT(*) FROM communities;"
   ```

### Step 4: Update Database Configuration

Update `server/db.ts` if needed. Your current configuration already supports any PostgreSQL provider:

```typescript
// No changes needed! Just update DATABASE_URL environment variable
// The current setup works with any PostgreSQL provider
```

**Note**: If your new provider doesn't use Neon's serverless driver, you may need to change:

```typescript
// FROM:
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
neonConfig.webSocketConstructor = ws;

// TO (for standard PostgreSQL):
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
```

---

## Hosting Migration

### Step 1: Choose Your Hosting Provider

#### Recommended Hosting Options

1. **Vercel** - https://vercel.com
   - **Best for**: Frontend-heavy apps with API routes
   - **Pros**: Automatic deployments, edge functions, great DX
   - **Setup**: `vercel init` → deploy
   - **Cost**: Free tier generous, scales well

2. **Railway** - https://railway.app
   - **Best for**: Full-stack Node.js apps
   - **Pros**: Simple, includes database, automatic HTTPS
   - **Setup**: Connect GitHub → auto-deploy
   - **Cost**: $5/month minimum usage

3. **Render** - https://render.com
   - **Best for**: Traditional web services
   - **Pros**: Free tier, automatic SSL, simple setup
   - **Setup**: Connect GitHub → configure build/start commands
   - **Cost**: Free tier available

4. **DigitalOcean App Platform** - https://www.digitalocean.com/products/app-platform
   - **Best for**: Scalable production apps
   - **Pros**: Reliable, simple pricing, good docs
   - **Setup**: Connect GitHub → configure
   - **Cost**: Starts at $5/month

5. **AWS (Elastic Beanstalk or ECS)** - https://aws.amazon.com
   - **Best for**: Enterprise needs, maximum control
   - **Pros**: Full AWS ecosystem, highly scalable
   - **Cons**: More complex, steeper learning curve
   - **Cost**: Pay for what you use

6. **Fly.io** - https://fly.io
   - **Best for**: Global edge deployment
   - **Pros**: Deploy close to users, good for performance
   - **Cost**: Free tier available

### Step 2: Prepare Your Application

1. **Ensure build script works**:
   ```bash
   npm run build
   ```
   
   This should create:
   - `dist/public/` - Frontend static files (from Vite)
   - `dist/index.js` - Backend server bundle (from esbuild)

2. **Test production mode locally**:
   ```bash
   # Set environment variables in .env file (don't commit!)
   NODE_ENV=production
   DATABASE_URL=postgresql://...
   # ... all other secrets
   
   # Build and start
   npm run build
   npm run start
   ```

3. **Verify the app runs on http://localhost:5000**

### Step 3: Configure Your Hosting Provider

#### General Configuration (applies to most providers)

**Build Command**:
```bash
npm run build
```

**Start Command**:
```bash
npm run start
```

**Environment Variables**: Add all secrets from [Current Environment Variables](#current-environment-variables--secrets) section

**Port Configuration**:
- The app binds to port `5000` by default
- Some providers (like Heroku, Render) use `PORT` environment variable
- Your app should listen on: `process.env.PORT || 5000`

**Health Check Endpoint**:
- URL: `/health`
- Expected response: `{"status":"healthy"}`

#### Provider-Specific Instructions

##### Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Create `vercel.json`** in project root:
   ```json
   {
     "version": 2,
     "builds": [
       { "src": "dist/index.js", "use": "@vercel/node" }
     ],
     "routes": [
       { "src": "/(.*)", "dest": "dist/index.js" }
     ],
     "env": {
       "NODE_ENV": "production"
     }
   }
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

##### Railway

1. **Install Railway CLI**:
   ```bash
   npm i -g @railway/cli
   ```

2. **Create `railway.toml`** in project root:
   ```toml
   [build]
   builder = "NIXPACKS"
   
   [deploy]
   startCommand = "npm run start"
   healthcheckPath = "/health"
   healthcheckTimeout = 100
   restartPolicyType = "ON_FAILURE"
   restartPolicyMaxRetries = 10
   ```

3. **Deploy**:
   ```bash
   railway login
   railway up
   ```

##### Render

1. **Create `render.yaml`** in project root:
   ```yaml
   services:
     - type: web
       name: myseniorvalet
       env: node
       buildCommand: npm run build
       startCommand: npm run start
       healthCheckPath: /health
       envVars:
         - key: NODE_ENV
           value: production
         - key: DATABASE_URL
           sync: false  # Add manually in dashboard
   ```

2. **Connect GitHub repo in Render dashboard**
3. **Add environment variables in dashboard**
4. **Deploy automatically on push**

##### DigitalOcean App Platform

1. **Create `.do/app.yaml`**:
   ```yaml
   name: myseniorvalet
   services:
     - name: web
       github:
         repo: your-username/myseniorvalet
         branch: main
       build_command: npm run build
       run_command: npm run start
       http_port: 5000
       health_check:
         http_path: /health
       envs:
         - key: NODE_ENV
           value: "production"
         - key: DATABASE_URL
           type: SECRET
   ```

2. **Deploy via dashboard or doctl CLI**

### Step 4: Configure Domain & SSL

Most modern hosting providers automatically provision SSL certificates. For custom domains:

1. **Add custom domain in hosting provider dashboard**
2. **Update DNS records**:
   - Type: `A` or `CNAME`
   - Name: `@` (root) or `www`
   - Value: [provided by hosting platform]
3. **Wait for DNS propagation** (can take up to 48 hours)
4. **SSL certificate automatically provisioned**

---

## Configuration Changes Required

### 1. Update OAuth Redirect URIs

**Google OAuth Console** - https://console.cloud.google.com/apis/credentials

Current redirect URIs (Replit):
- `https://[your-repl].repl.co/api/auth/google/callback`
- `https://[your-repl].replit.dev/api/auth/google/callback`

**New redirect URIs** (update to your new domain):
- `https://myseniorvalet.com/api/auth/google/callback`
- `https://www.myseniorvalet.com/api/auth/google/callback`
- `http://localhost:5000/api/auth/google/callback` (for local testing)

### 2. Update Stripe Webhook URL

**Stripe Dashboard** - https://dashboard.stripe.com/webhooks

Current webhook URL:
- `https://[your-repl].repl.co/api/payments/webhook`

**New webhook URL**:
- `https://myseniorvalet.com/api/payments/webhook`

**Don't forget to**:
- Update `STRIPE_WEBHOOK_SECRET` with new webhook signing secret

### 3. Update SendGrid Configuration

**SendGrid Settings** - https://app.sendgrid.com/settings/sender_auth

- Update sender domain if using custom domain
- Verify new domain ownership
- Update DKIM/SPF records in DNS

### 4. Update Frontend Environment Variables

If you have frontend environment variables (prefixed with `VITE_`), update them:

**Example `.env.production`**:
```bash
VITE_API_URL=https://myseniorvalet.com
VITE_STRIPE_PUBLIC_KEY=pk_live_...
VITE_GOOGLE_MAPS_KEY=...
```

### 5. Remove Replit-Specific Code

Search and update/remove Replit-specific references:

**In `vite.config.ts`**:
```typescript
// REMOVE:
process.env.REPL_ID !== undefined ? [await import("@replit/vite-plugin-cartographer")...] : []

// OR update to:
process.env.NODE_ENV !== "production" ? [...] : []
```

**In code files**, search for:
- `REPL_ID`
- `REPL_OWNER`
- `REPLIT_DEV_DOMAIN`
- `REPLIT_DB_URL`

**Replace with**:
```typescript
// Instead of REPLIT_DEV_DOMAIN
const domain = process.env.CUSTOM_DOMAIN || 'myseniorvalet.com';

// Instead of REPL_OWNER
const ownerEmail = 'admin@myseniorvalet.com';
```

---

## Service Replacements

### Replit Key-Value Store → Redis or Alternative

If you're using `REPLIT_DB_URL` for key-value storage, migrate to:

**Option 1: Redis (Upstash)** - https://upstash.com
```bash
npm install @upstash/redis
```

```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

// Same API as Replit KV
await redis.set('key', 'value');
const value = await redis.get('key');
```

**Option 2: Use PostgreSQL** (you already have it)
```typescript
// Create a simple KV table in your database
await db.insert(keyValueStore).values({ key: 'mykey', value: 'myvalue' });
```

**Option 3: File-based (for small datasets)**
```typescript
import fs from 'fs/promises';
const data = JSON.parse(await fs.readFile('cache.json', 'utf-8'));
```

### Replit Auth → Custom Auth System

Your platform already has custom authentication! Just ensure:
- OAuth providers (Google) have updated redirect URIs
- Session management works with your new hosting provider
- JWT secrets are properly configured

### Object Storage (if needed)

If you plan to use object storage for user uploads:

**Option 1: Cloudflare R2** - https://www.cloudflare.com/products/r2/
- S3-compatible
- No egress fees
- Great pricing

**Option 2: AWS S3** - https://aws.amazon.com/s3/
- Industry standard
- Extensive integrations

**Option 3: Backblaze B2** - https://www.backblaze.com/b2/cloud-storage.html
- Affordable
- S3-compatible

---

## Testing Migration

### Pre-Migration Checklist

- [ ] Export full database backup
- [ ] Export all environment variables/secrets
- [ ] Document all OAuth redirect URIs
- [ ] Document all webhook URLs
- [ ] Test build locally: `npm run build`
- [ ] Test production mode locally: `npm run start`
- [ ] Verify all API endpoints work
- [ ] Verify authentication flows work
- [ ] Verify payment processing works

### Post-Migration Testing

1. **Health Check**:
   ```bash
   curl https://myseniorvalet.com/health
   # Expected: {"status":"healthy"}
   ```

2. **Database Connection**:
   - Log in to the application
   - Search for communities
   - Verify data loads correctly

3. **Authentication**:
   - Test email/password login
   - Test Google OAuth login
   - Test session persistence

4. **Payment Processing**:
   - Test Stripe checkout flow
   - Verify webhooks are received
   - Check transaction logs

5. **API Endpoints**:
   ```bash
   # Test key endpoints
   curl https://myseniorvalet.com/api/communities
   curl https://myseniorvalet.com/api/auth/me
   ```

6. **Email Delivery**:
   - Test password reset emails
   - Test tour confirmation emails
   - Test notification emails

7. **Performance Testing**:
   - Check page load times
   - Verify caching works
   - Test under load (if needed)

### Monitoring Post-Migration

Set up monitoring to catch issues early:

**Recommended Tools**:
- **Sentry** (already integrated!) - Error tracking
- **Uptime Robot** - Uptime monitoring
- **LogRocket** - Session replay
- **Datadog** or **New Relic** - Full observability

---

## Rollback Plan

If migration fails, you can quickly revert:

### Keep Replit Environment Active

**DO NOT delete your Replit workspace until you're 100% confident the migration is successful.**

### DNS Rollback

If issues arise with new hosting:
1. Update DNS records back to Replit
2. Wait for propagation (5-60 minutes)
3. Replit app continues serving traffic

### Database Rollback

If database migration fails:
1. Keep original Replit database connection string
2. Point `DATABASE_URL` back to Replit
3. Redeploy with original connection

### Quick Revert Checklist

1. Update DNS → Point back to Replit domain
2. Update OAuth URIs → Restore Replit redirect URLs
3. Update Webhooks → Restore Replit webhook URLs
4. Monitor logs for errors

---

## Migration Timeline Recommendation

### Week 1: Preparation
- Export database backup
- Document all secrets and configurations
- Choose hosting provider and database provider
- Test build and production mode locally

### Week 2: Infrastructure Setup
- Create accounts on new hosting/database providers
- Set up new database and import data
- Configure new hosting environment
- Test with new database connection

### Week 3: Configuration
- Update OAuth redirect URIs (keep both old and new)
- Update webhook URLs (keep both old and new)
- Configure domain and SSL
- Set up monitoring and logging

### Week 4: Soft Launch
- Deploy to new hosting
- Test thoroughly with subset of users
- Monitor performance and errors
- Keep Replit as fallback

### Week 5: Full Migration
- Update DNS to point to new hosting
- Monitor closely for 72 hours
- Verify all services working correctly
- Scale new infrastructure as needed

### Week 6+: Decommission
- After 2 weeks of stable operation
- Archive Replit workspace (don't delete immediately)
- Remove old OAuth/webhook configurations
- Celebrate successful migration! 🎉

---

## Cost Comparison Estimates

### Current: Replit
- **Replit Cycles**: ~$20-40/month (estimated for active deployment)
- **Neon Database**: Included or minimal

### After Migration Example (Railway + Neon):
- **Railway Hosting**: $5-20/month (depending on usage)
- **Neon Database**: Free tier or $19/month (pro)
- **Cloudflare R2**: $0-5/month (if using storage)
- **Total**: ~$10-45/month

### After Migration Example (Vercel + Supabase):
- **Vercel**: Free tier or $20/month (pro)
- **Supabase**: Free tier or $25/month (pro)
- **Total**: $0-45/month

**Note**: Actual costs depend on traffic, storage, and features used.

---

## Support Resources

### Community & Documentation

- **Neon Database**: https://neon.tech/docs
- **Vercel Deployment**: https://vercel.com/docs
- **Railway Deployment**: https://docs.railway.app
- **Render Deployment**: https://render.com/docs
- **DigitalOcean App Platform**: https://docs.digitalocean.com/products/app-platform/

### Emergency Contacts

Keep these handy during migration:

- **Database Provider Support**: [your database provider support]
- **Hosting Provider Support**: [your hosting provider support]
- **Domain Registrar**: [your domain registrar]
- **DNS Provider**: [your DNS provider]

---

## Final Notes

### Backup Everything!

Before starting migration:
1. ✅ Database backup downloaded
2. ✅ All secrets documented
3. ✅ Configuration files saved
4. ✅ Replit workspace kept active

### Take It Slow

**Don't rush the migration.** It's better to take extra time testing than to have downtime or data loss.

### Monitor Closely

For the first week after migration:
- Check logs daily
- Monitor error rates
- Watch database performance
- Verify backups are working

### Document Your Setup

Keep your new configuration documented:
- Where secrets are stored
- How to deploy updates
- Database backup procedures
- Rollback procedures

---

## Questions Before Migration?

Before proceeding, ensure you can answer:

1. **Where will the database live?** → [Provider name]
2. **Where will the app be hosted?** → [Hosting provider]
3. **Do you have all secrets documented?** → Yes/No
4. **Have you tested the build locally?** → Yes/No
5. **Do you have a rollback plan?** → Yes/No
6. **Have you notified your team/users?** → Yes/No

---

**Remember**: Successful migrations are methodical, well-tested, and reversible. Good luck with your migration! 🚀
