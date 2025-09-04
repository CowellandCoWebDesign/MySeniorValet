# MySeniorValet Platform - Deployment Guide

## 🚀 Getting Started Outside of Replit

This guide helps you deploy the MySeniorValet platform on standard hosting platforms after migrating from Replit.

### ✅ Prerequisites

- **Node.js 20.x** or higher
- **PostgreSQL 16** database
- **Redis** (optional, for caching)
- **PM2** (recommended for production)

### 🔧 Quick Setup

1. **Clone and Setup**
   ```bash
   git clone https://github.com/CowellandCoWebDesign/MySeniorValet.git
   cd MySeniorValet
   chmod +x dev.sh start.sh
   ```

2. **Development Mode** (Fastest way to get started)
   ```bash
   ./dev.sh
   ```
   This creates a minimal `.env` file and starts the development server.

3. **Production Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ./start.sh
   ```

### 📋 Environment Configuration

Copy `.env.example` to `.env` and configure:

#### Required Variables
```bash
DATABASE_URL=postgresql://username:password@localhost:5432/myseniorvalet
NODE_ENV=production
PORT=5000
JWT_SECRET=your_secure_jwt_secret
SESSION_SECRET=your_secure_session_secret
```

#### Optional but Recommended
```bash
# AI Services
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
PERPLEXITY_API_KEY=pplx-...

# Payment Processing
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# Email & SMS
SENDGRID_API_KEY=SG....

# Maps & Location
GOOGLE_PLACES_API_KEY=AIza...
GOOGLE_MAPS_API_KEY=AIza...
```

### 🗄️ Database Setup

1. **Create PostgreSQL Database**
   ```bash
   createdb myseniorvalet
   ```

2. **Run Migrations**
   ```bash
   npm run db:push
   ```

3. **Seed Initial Data** (Optional)
   ```bash
   # The application will seed basic data on first run
   ```

### 🏗️ Deployment Options

#### Option 1: Traditional VPS (Ubuntu/CentOS)
```bash
# Install dependencies
sudo apt update
sudo apt install nodejs npm postgresql redis-server

# Setup application
git clone [repo]
cd MySeniorValet
CHROMEDRIVER_SKIP_DOWNLOAD=true npm install
npm run build

# Use PM2 for process management
npm install -g pm2
pm2 start dist/index.js --name "myseniorvalet"
pm2 startup
pm2 save
```

#### Option 2: Docker Deployment
```dockerfile
# Dockerfile (create this)
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN CHROMEDRIVER_SKIP_DOWNLOAD=true npm install

COPY . .
RUN npm run build

EXPOSE 5000
CMD ["npm", "start"]
```

#### Option 3: Cloud Platforms

**Vercel:**
- Connect GitHub repository
- Set environment variables in dashboard
- Deploy automatically

**Railway/Render:**
- Connect repository
- Add PostgreSQL addon
- Set environment variables
- Deploy

**DigitalOcean App Platform:**
- Create app from GitHub
- Add managed PostgreSQL database
- Configure environment variables

### ⚙️ Performance Optimizations

1. **Enable Redis Caching**
   ```bash
   REDIS_URL=redis://localhost:6379
   ```

2. **Configure PostgreSQL**
   ```sql
   -- Optimize for performance
   ALTER SYSTEM SET shared_buffers = '256MB';
   ALTER SYSTEM SET effective_cache_size = '1GB';
   ALTER SYSTEM SET work_mem = '4MB';
   ```

3. **Enable GZIP Compression**
   The application already includes compression middleware.

### 🔒 Security Checklist

- [ ] Use strong, unique secrets for JWT_SECRET and SESSION_SECRET
- [ ] Enable HTTPS with SSL certificates
- [ ] Configure firewall rules
- [ ] Set up database backups
- [ ] Enable rate limiting (built-in)
- [ ] Review and configure CORS policies

### 📊 Monitoring & Maintenance

1. **Health Checks**
   - GET `/api/health` - Application health
   - GET `/api/version` - Version information

2. **Logs**
   ```bash
   # PM2 logs
   pm2 logs myseniorvalet
   
   # Docker logs
   docker logs [container_name]
   ```

3. **Database Maintenance**
   ```bash
   # Regular backups
   pg_dump myseniorvalet > backup_$(date +%Y%m%d).sql
   ```

### 🔧 Troubleshooting

#### Common Issues

1. **Port Already in Use**
   ```bash
   # Change PORT in .env file or kill existing process
   lsof -ti:5000 | xargs kill -9
   ```

2. **Database Connection Issues**
   ```bash
   # Test database connectivity
   psql $DATABASE_URL -c "SELECT version();"
   ```

3. **Missing Dependencies**
   ```bash
   # Reinstall with chromedriver skip
   rm -rf node_modules package-lock.json
   CHROMEDRIVER_SKIP_DOWNLOAD=true npm install
   ```

4. **Build Errors**
   ```bash
   # Skip TypeScript errors for deployment
   npm run build || true
   ```

### 📞 Support

For deployment issues:
1. Check the logs first
2. Verify environment configuration
3. Test database connectivity
4. Review security settings

### 🚀 Next Steps

After successful deployment:
1. Configure domain and SSL
2. Set up monitoring and alerts
3. Configure automated backups
4. Test all integrations (Stripe, email, etc.)
5. Set up CI/CD pipeline

---

**Note:** This platform was migrated from Replit. Some Replit-specific features have been removed or made optional for better compatibility with standard hosting environments.