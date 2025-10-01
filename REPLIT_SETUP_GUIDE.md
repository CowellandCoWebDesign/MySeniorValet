# MySeniorValet Platform - Replit Setup Guide

## Welcome to MySeniorValet! 🎩

This guide will walk you through how the MySeniorValet platform operates within the Replit environment, including startup procedures, workflows, and key commands.

---

## Table of Contents
1. [Quick Start](#quick-start)
2. [Understanding the Platform Architecture](#understanding-the-platform-architecture)
3. [How Replit Workflows Work](#how-replit-workflows-work)
4. [Available NPM Scripts](#available-npm-scripts)
5. [Database Setup & Management](#database-setup--management)
6. [Environment Variables & Secrets](#environment-variables--secrets)
7. [Project Structure](#project-structure)
8. [Development Workflow](#development-workflow)
9. [Deployment & Publishing](#deployment--publishing)
10. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Starting the Platform

1. **Click the Run Button** - The simplest way to start MySeniorValet:
   - Click the green "Run" button at the top of your Replit workspace
   - This automatically triggers the "Start application" workflow
   - The workflow runs `npm run dev` which starts both the Express backend and Vite frontend

2. **Manual Start** (alternative):
   ```bash
   npm run dev
   ```

3. **Preview Your App**:
   - Once running, Replit will display a preview pane with your application
   - The app is available at your Replit development domain (automatically assigned)
   - Frontend and backend both run on the same port for seamless integration

---

## Understanding the Platform Architecture

MySeniorValet is a **full-stack TypeScript application** with:

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (fast dev server and production builds)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query v5 (formerly React Query)
- **Maps**: Leaflet + React-Leaflet

### Backend
- **Server**: Express.js with TypeScript
- **Runtime**: tsx (TypeScript execution for development)
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM
- **Authentication**: Custom system + Replit Auth + Google/Facebook OAuth
- **APIs**: Perplexity (primary), Claude, ChatGPT, Stripe, SendGrid

### Database
- **Type**: PostgreSQL (Neon-backed)
- **Connection**: Serverless with optimized pool settings
- **Migrations**: Drizzle Kit (`npm run db:push`)
- **Schema**: Defined in `shared/schema.ts`

---

## How Replit Workflows Work

### The "Start application" Workflow

MySeniorValet uses a single primary workflow configured in Replit:

**Workflow Name**: Start application  
**Command**: `npm run dev`  
**Type**: Execute Shell Command  

This workflow:
1. Sets `NODE_ENV=development`
2. Runs the TypeScript Express server using `tsx server/index.ts`
3. Starts the Vite dev server for the React frontend
4. Hot-reloads on code changes
5. Serves both frontend and backend on port 5000

### Workflow Behavior

- **Auto-Restart**: Workflows automatically restart when:
  - Package dependencies are installed/updated
  - Major file changes are detected
  - You manually restart via the workflows pane
  
- **Logs**: View real-time logs in the Console/Workflows pane to debug issues

- **Stop/Start**: Control the workflow using:
  - Workflows pane controls
  - Or manually via Shell: `npm run dev`

---

## Available NPM Scripts

### Development Scripts

```bash
npm run dev
```
**Purpose**: Start the development server  
**What it does**: Runs Express backend + Vite frontend with hot-reload  
**Environment**: Development mode (`NODE_ENV=development`)  
**When to use**: Primary command for local development

```bash
npm run check
```
**Purpose**: Type-check TypeScript code  
**What it does**: Runs the TypeScript compiler in check mode (no output files)  
**When to use**: Before committing code to catch type errors

### Database Scripts

```bash
npm run db:push
```
**Purpose**: Push schema changes to the database  
**What it does**: Syncs your Drizzle schema (`shared/schema.ts`) with PostgreSQL  
**Important**: This is the ONLY way to modify database structure  
**Warning**: If you see a data-loss warning, use `npm run db:push --force`  

**NEVER manually write SQL migrations** - always use Drizzle Kit!

### Production Scripts

```bash
npm run build
```
**Purpose**: Build the application for production  
**What it does**:
  - Builds the React frontend with Vite
  - Bundles the Express backend with esbuild
  - Outputs to `dist/` directory

```bash
npm run start
```
**Purpose**: Start the production server  
**What it does**: Runs the built application from `dist/index.js`  
**Environment**: Production mode (`NODE_ENV=production`)  
**When to use**: After building, when deploying

---

## Database Setup & Management

### Automatic Database Provisioning

When you create or fork this Repl, Replit automatically:
1. Creates a PostgreSQL database (Neon-backed)
2. Sets environment variables:
   - `DATABASE_URL` - Full connection string
   - `PGHOST` - Database host
   - `PGUSER` - Database user
   - `PGPASSWORD` - Database password
   - `PGDATABASE` - Database name
   - `PGPORT` - Database port (default: 5432)

### Database Connection Configuration

The platform uses optimized settings for Neon serverless (in `server/db.ts`):

```typescript
// Connection pool settings
max: 3                    // Maximum 3 connections (Neon serverless optimal)
connectionTimeoutMillis: 60000  // 60 second timeout
idleTimeoutMillis: 30000  // Close idle connections after 30s
```

### Schema Management

**Location**: `shared/schema.ts`

To modify the database:
1. Edit your schema in `shared/schema.ts`
2. Update storage interfaces in `server/storage.ts`
3. Run `npm run db:push` to sync changes
4. Restart your application

### Database Access

**Via Code**:
```typescript
import { db } from './server/db';
// Use Drizzle ORM for queries
```

**Via Replit Database Tool**:
- Use the Database pane in Replit to visually browse tables
- Execute ad-hoc SQL queries (for inspection only, not migrations)

---

## Environment Variables & Secrets

### Predefined Replit Variables

These are automatically available:
- `REPL_OWNER` - Your Replit username
- `REPL_ID` - Unique identifier for this Repl
- `HOME` - Home directory path
- `REPLIT_DEV_DOMAIN` - Your development domain

### Database Variables (Auto-Created)

- `DATABASE_URL`
- `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGPORT`

### Custom Secrets

For API keys and sensitive data, use the **Secrets tool** (lock icon in sidebar):

**Currently Configured**:
- `PERPLEXITY_API_KEY` - For Perplexity AI integration

**Access in Code**:
```typescript
// Backend (Node.js)
const apiKey = process.env.PERPLEXITY_API_KEY;

// Frontend (must be prefixed with VITE_)
const publicKey = import.meta.env.VITE_PUBLIC_KEY;
```

**Important**: Frontend environment variables MUST be prefixed with `VITE_` to be accessible in client code.

---

## Project Structure

```
myseniorvalet/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   │   └── myseniorvalet-home.tsx  # Main homepage (VERSION 3)
│   │   ├── components/       # Reusable UI components
│   │   ├── lib/              # Utilities and helpers
│   │   └── App.tsx           # Root component with routing
│   └── index.html            # HTML entry point
│
├── server/                    # Express Backend
│   ├── index.ts              # Server entry point
│   ├── routes.ts             # API route definitions
│   ├── db.ts                 # Database connection and helpers
│   ├── storage.ts            # Storage interface and implementations
│   ├── custom-auth.ts        # Authentication logic
│   ├── social-auth.ts        # OAuth (Google/Facebook)
│   ├── services/             # Business logic services
│   └── routes/               # Modular route handlers
│       ├── adminCommunityRoutes.ts
│       ├── userRoutes.ts
│       └── ...
│
├── shared/                    # Shared Code (Frontend + Backend)
│   └── schema.ts             # Database schema (Drizzle)
│
├── public/                    # Static assets
├── attached_assets/           # User-uploaded or generated assets
├── tests/                     # Test suites
│
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite configuration
├── drizzle.config.ts         # Drizzle ORM configuration
├── tailwind.config.ts        # Tailwind CSS configuration
└── replit.md                 # Platform documentation and preferences
```

### Key Files

- **`myseniorvalet-home.tsx`**: The primary homepage (VERSION 3) - DO NOT create `home.tsx`
- **`shared/schema.ts`**: Single source of truth for data models
- **`server/storage.ts`**: Database operations interface
- **`server/routes.ts`**: API endpoint definitions
- **`client/src/App.tsx`**: Frontend routing configuration

---

## Development Workflow

### Making Changes

1. **Edit Code**:
   - Frontend: Edit files in `client/src/`
   - Backend: Edit files in `server/`
   - Schema: Edit `shared/schema.ts`

2. **See Changes**:
   - Frontend: Vite hot-reloads automatically
   - Backend: tsx restarts the server automatically
   - Database: Run `npm run db:push` after schema changes

3. **Test Changes**:
   - Use the preview pane to test your app
   - Check Console for logs and errors
   - Use browser DevTools for frontend debugging

### Adding New Features

**Frontend Pages**:
1. Create page in `client/src/pages/`
2. Register route in `client/src/App.tsx`
3. Use `wouter` for navigation: `<Link href="/new-page">Link</Link>`

**Backend APIs**:
1. Define schema in `shared/schema.ts`
2. Update `IStorage` interface in `server/storage.ts`
3. Implement storage methods (MemStorage or DbStorage)
4. Add route in `server/routes.ts`

**Database Models**:
1. Add table to `shared/schema.ts`
2. Export insert schema: `createInsertSchema(table).omit(...)`
3. Export types: `type Insert = z.infer<typeof insertSchema>`
4. Run `npm run db:push`

### Installing Packages

**Using Replit UI**:
- Use the Packages tool (cube icon) to search and install

**Using Shell**:
```bash
npm install package-name
npm install --save-dev package-name  # For dev dependencies
```

**Workflow Auto-Restart**: Package installation triggers automatic workflow restart.

---

## Deployment & Publishing

### Publishing to Production

When ready to deploy:

1. **Test Thoroughly** in development
2. **Build the Application**:
   ```bash
   npm run build
   ```
3. **Click "Deploy"** in Replit (ship icon in top-right)
4. **Configure Deployment**:
   - **Type**: Autoscale (recommended for web apps)
   - **Build Command**: `npm run build`
   - **Run Command**: `npm run start`
   - **Port**: 5000

### Health Check Endpoints

The platform includes lightweight health checks for deployment:

- `GET /` - Returns simple JSON status
- `GET /health` - Returns health status
- Both endpoints respond WITHOUT database queries (fast!)

### Database Connection Handling

Production uses optimized settings:
- 60-second connection timeout
- 3-connection pool maximum
- Automatic retry with exponential backoff
- Graceful error handling

---

## Troubleshooting

### Application Won't Start

**Check Logs**:
1. Open Console/Workflows pane
2. Look for error messages
3. Common issues:
   - Database connection timeout (check `DATABASE_URL`)
   - Port already in use (restart workflow)
   - Missing dependencies (run `npm install`)

**Solution**:
```bash
# Stop the workflow
# Then restart:
npm run dev
```

### Database Connection Errors

**Symptoms**: "Database connection unavailable" or timeout errors

**Solutions**:
1. Check `DATABASE_URL` is set in Secrets
2. Verify database exists in Database pane
3. Database helper functions include automatic retry logic
4. Wait a moment and try again (Neon serverless may be cold-starting)

**Connection Validation**:
```typescript
import { validateConnection } from './server/db';
const isConnected = await validateConnection();
```

### Build Failures

**Check**:
1. TypeScript errors: `npm run check`
2. Missing dependencies: `npm install`
3. Schema sync: `npm run db:push`

### Port Already in Use

**Solution**:
- Stop the current workflow
- Refresh the page
- Click Run again

### Changes Not Appearing

**Frontend**:
- Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)
- Check browser console for errors

**Backend**:
- Check if workflow restarted (Console shows new startup logs)
- Manually restart workflow if needed

### LSP/TypeScript Errors

**Solution**:
- These are usually informational
- Run `npm run check` to see actual errors
- Fix type issues in code

---

## Integration Details

MySeniorValet includes pre-configured integrations:

- **Authentication**: `javascript_log_in_with_replit`
- **AI Services**: `javascript_anthropic`, `javascript_openai`, `perplexity_v0`, `javascript_xai`
- **Payments**: `javascript_stripe`
- **Email**: `javascript_sendgrid`
- **Database**: `javascript_database`
- **Storage**: `javascript_object_storage`
- **Analytics**: `javascript_google_analytics`
- **WebSocket**: `javascript_websocket`

Each integration handles API keys, OAuth, and setup automatically through Replit's integration system.

---

## Key Reminders

1. **Always use `npm run db:push`** for database changes (never manual SQL migrations)
2. **Frontend env vars must be prefixed with `VITE_`**
3. **Main homepage is `myseniorvalet-home.tsx`** (not `home.tsx`)
4. **Use the Secrets tool** for API keys and sensitive data
5. **Workflows auto-restart** after package installation
6. **Health checks are database-free** for fast deployment passes

---

## Getting Help

- **Replit Docs**: Use the Replit AI or search documentation for platform-specific questions
- **Project Docs**: Check `replit.md` for platform preferences and architecture details
- **Console Logs**: Always check workflow logs when debugging issues

---

## Summary

**To Start Development**:
```bash
npm run dev
```

**To Push Database Changes**:
```bash
npm run db:push
```

**To Deploy**:
1. Test locally
2. `npm run build`
3. Click Deploy in Replit
4. Configure and publish

**The platform is designed to "just work" in Replit** - with automatic database provisioning, environment variable management, and integrated workflows. Happy coding! 🎩
