# MySeniorValet - Senior Living Community Transparency Platform

## Overview
MySeniorValet is a technology platform connecting families with publicly available information about over 34,000 senior living communities in the U.S. and Canada. It leverages advanced AI orchestration to gather, organize, and present public information, including verified HUD pricing. The platform's vision is to empower families with authentic, verified data for informed decision-making in senior living, bringing much-needed transparency to the market. It aims to be "The Dawn of Transparency in Senior Living" by providing a complete care spectrum education, real pricing, zero paywalls, and tools for saving and sharing research. It features the fully operational TourMate™ tour scheduling system and includes a One-Touch Emergency Contact Shortcut.

## CRITICAL PLATFORM RULES
1. **NO FAKE DATA** - Never add placeholder, mock, or synthetic data (e.g., "000-000-0000" phones, "00000" zips)
2. **NO HERO/LOGO CHANGES** - Never modify hero section or logo without explicit permission
3. **REAL DATA ONLY** - All community entries must have legitimate, verifiable information
4. **TWO-STAGE EXPANSION** - Always use Discovery → Enrichment approach for new cities (proven 10-20x more effective)

## Launch Status (August 14, 2025)
✅ **CRITICAL CLUSTERING FIX DEPLOYED - PRODUCTION STABLE**

### Critical Fix Deployed (August 14, 2025 - 8:08 PM):
- **CLUSTERING BUG FIXED**: Resolved production crash from 832+ individual markers rendering
- **SMART CLUSTERING**: Zoom 14+ shows ALL communities, Zoom <12 uses heavy clustering
- **PERFORMANCE RESTORED**: Map now handles 34,922 communities without crashes
- **DATABASE STABLE**: 34,922 communities maintained with all processors on manual control

### Systematic Gap Closure Results:
- **UNDERSERVED STATES EXPANDING**: 
  - North Dakota: Fargo (76), Bismarck (122) discovered
  - South Dakota: Sioux Falls (100) discovered
  - Wyoming: Cheyenne (69) discovered
  - Hawaii: Honolulu (91) discovered
  - Montana: Billings (51) discovered
  - Alaska: Anchorage (99) discovered
- **MAJOR METROS FIXED**:
  - New York: 161 facilities discovered (was missing!)
  - Atlanta: 167 facilities discovered (was missing!)
  - Houston: 152 facilities discovered (was only 97)
  - Dallas: 131 facilities discovered (was only 39)
- **NO FAKE DATA**: All facilities verified with real addresses and contact info

### Technical Issues Resolved:
- Map search functionality fully restored - successfully loading 69 communities in San Francisco area
- Spatial search PostGIS queries optimized and working (300-500ms response times)
- Fixed query key mismatches and timeout issues preventing community data from loading
- Fixed broken photo display issue - all missing/broken images now show proper fallback placeholders with community type icons
- **LOCALHOST CLEANUP COMPLETE** - Fixed all production-breaking localhost references in aiRoutes.ts and seniorResourcesRoutes.ts to use dynamic host detection
- **Authentication System - CUSTOM IMPLEMENTATION WITH SOCIAL LOGIN OPTIONS**:
  - ✅ Custom authentication system implemented - users create accounts with email/password directly
  - ✅ NO Replit account required for ANY users (confirmed: Replit Auth requires Replit accounts)
  - ✅ Full registration flow with first name, last name, email, and password
  - ✅ PostgreSQL session storage for persistent authentication
  - ✅ Super admin bypass maintained for William.cowell01@gmail.com and admin@myseniorvalet.com
  - ✅ Social login options added: Google and Facebook OAuth (Apple coming soon)
  - ✅ All route files updated to use custom auth-middleware.ts instead of replitAuth
  - ✅ Fixed authentication crash by replacing all replitAuth imports across 19+ route files
  - Note: Social login requires OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
- **Community Payment Flow - CRITICAL BUSINESS FIX COMPLETE**:
  - ✅ Redesigned payment process to require account setup as first step
  - ✅ Prevents lost purchases by tying all payments to user accounts
  - ✅ Payment flow: Account Setup → Tier Selection → Payment → Activation
  - ✅ Tier selection preserved in sessionStorage during authentication
  - ✅ Login/signup pages redirect back to payment after authentication
  - ✅ All payments now include userId in metadata for proper tracking
- Production deployment configured for:
  - Primary: https://www.myseniorvalet.com
  - Replit Domain: https://MySeniorValet.replit.app
- Database sessions persistent with PostgreSQL backend
- All navigation links converted to real pages with dedicated routes
- Featured sections implemented across Healthcare Directory, Senior Marketplace, and Senior Resources Center
- Professional pages created for Mayo Clinic, Cleveland Clinic, Walgreens, CVS Pharmacy, and Medicare Guide
- Platform fully functional with clean production interface and working map search

### SEO Improvements (August 13, 2025)
✅ **Comprehensive SEO Implementation**
- Enhanced meta tags with keyword-rich descriptions targeting "senior living near me" searches
- Added structured data (JSON-LD) for WebSite and LocalBusiness schemas
- Created XML sitemap with all major pages and proper priorities
- Implemented robots.txt with crawler instructions and sitemap reference
- Added Open Graph and Twitter Card meta tags for social sharing
- Created custom useSEO hook for dynamic page-specific titles and descriptions
- Optimized title tags: "34,494+ Verified Locations with Real Pricing"
- Added geo-targeting meta tags for US market
- Implemented canonical URLs to prevent duplicate content issues
- Set up proper googlebot and search engine directives

## User Preferences
- **Authentication Priority**: William.cowell01@gmail.com and admin@myseniorvalet.com have super admin access. Platform configured for production Replit Auth integration.
- **Notification Email Configuration**:
  - Primary Admin Notifications: admin@myseniorvalet.com (system events, emergency alerts)
  - Personal Emergency/Backup Access: William.cowell01@gmail.com (private, secondary notifications)
  - Super Admin Backup: CowellandCoWebDesign@gmail.com (private)
  - Onboarding Team: hello@myseniorvalet.com (public)
  - Billing Team: billing@myseniorvalet.com (public)
  - Emergency button alerts sent to both admin@myseniorvalet.com (primary) and William.cowell01@gmail.com (backup)
- **Data Integrity Standards**: Maintain strict Golden Data Rule enforcement. HUD properties show verified government pricing only. Communities without verified pricing display "Contact for pricing." Multi-AI verification system for absolute accuracy. Never claim partnerships, verifications, or certifications unless legally verified and documented. Service recommendations must be clearly labeled as such, not as partnerships.
- **Accurate Platform Messaging**: Use "Complete Care Spectrum & Live Market Intelligence" to describe our national pricing insights and verified HUD data system. Avoid claiming "live pricing from all communities" as this is our goal, not current capability. Market Intelligence fills gaps with national reported averages while building toward full live pricing coverage. Be cautious with analytics claims during launch phase.
- **Documentation Preferences**: Keep documentation clean and consolidated. Remove outdated files to prevent confusion. Focus on current operational status over historical details.
- **Visual Design Preferences**: Hero image should be a beautiful space/astronomy image (https://cdn.pixabay.com/photo/2016/11/29/05/45/astronomy-1867616_1280.jpg). The user specifically prefers cosmic space imagery over senior living villa photos, symbolizing infinite possibilities in senior living. Dark mode is enabled by default for better user experience.
- **Critical Branding Rule**: NEVER USE "TRUEVIEW" - The brand name is MySeniorValet. All references to "TrueView" must be replaced with "MySeniorValet".
- **Mission Messaging**: Include official mission statement in email communications: "The trusted platform for authentic senior living community information. Helping families make informed decisions with verified data and transparent pricing."
- **Single Home Page Rule**: The primary home page is `client/src/pages/myseniorvalet-home.tsx` (VERSION 3). DO NOT create or use `home.tsx`. All home page edits must target `myseniorvalet-home.tsx`. Root path "/" routes to MySeniorValetHome component only.
- **Golden Data Rule**: Zero tolerance for synthetic, mock, sample, or placeholder data. All data must come from verified authentic sources.
- **Map Interface Preferences**: Legend button positioned on map at top-right (not in header). Map Layers control positioned 60px below Legend button. Heatmap toggle removed from interface to prevent UI overlap issues.

## System Architecture
The platform is built with a modern web stack, emphasizing transparency and user engagement.
- **Frontend**: React with TypeScript, Tailwind CSS, and shadcn/ui components. Features include community cards with subtype badges, an interactive Care Spectrum Slider, and dynamic occupancy displays. Map pins are circular with bold colored borders. Dark mode is fully supported.
- **Backend**: Express.js with TypeScript.
- **Database**: PostgreSQL, managed with Drizzle ORM, supporting multiple senior living types and a robust services management system. Database includes tables for pricing history, price change alerts, community claims, verified community profiles, and verification activity logs.
- **Build System**: Vite for the frontend and esbuild for the backend.
- **Authentication**: Replit Auth with role-based access control.
- **Key Features**: Interactive Map System with AI analysis, AI-Powered Search with multi-AI verification, Semantic Search capabilities, Transparent Pricing (HUD-verified data and AI-verified market rates), Comprehensive Community Profiles, Unified Admin Dashboard, Family Collaboration tools, Senior Vendor Marketplace, comprehensive notification and in-app messaging, an onboarding wizard with AI character guidance, and a robust photo handling system. Full bilingual functionality (French/English) is supported. **TourMate™ Tour Scheduling System** enables seamless tour coordination with confirmation codes, email notifications, and feedback collection.
- **UI/UX Decisions**: Emphasizes a clean, modern aesthetic with cosmic imagery. Dark mode is default. Consistent design elements include horizontal sliders and AI-generated product imagery. Search results are displayed in a vertical scrolling "rolodex" style with regional theme styling. Content is organized with distinct visual theming for communities, hospitals, vendors, and resources. Senior Living Command Center displays ecosystem options on separate lines with emojis for better emphasis (🏘️ 34,181+ Communities, 🛍️ 1,500+ Vendor Services, 🏥 6,800+ Healthcare Providers, 📚 100+ Educational Resources).
- **System Design**: Supports dual subscription tier systems for communities and vendors. Dashboard separation includes user analytics, contextual business features, and a unified super admin analytics center with RBAC. Dual pricing display shows government pricing alongside AI-verified market rates with clear notifications for discrepancies. Dynamic scaling cost controls are implemented for API calls with regional caching and batch processing.
- **Payment System**: Integrated dual payment system supporting Stripe Checkout Sessions and Payment Element.
- **Search & Navigation**: Simplified AI-powered search with semantic understanding and natural language queries. Live Market Intelligence section integrates a 10-level care spectrum. Healthcare search includes enhanced map filtering and color-coded hospital cards. AI Search Interface maintains a 3-row layout for amenities/care services, distance/price sliders, and Complete Care Spectrum types.
- **AI Deep Analysis**: Provides detailed comparative analysis including price comparisons, value leaders, HUD affordable options, neighborhood insights, care type matching, and personalized recommendations. Generates comprehensive market trends and actionable advice. AI personalization ensures empathetic and context-aware interactions.
- **Onboarding System**: Users can sign up with preferences pre-filled from onboarding data. Community creators have a comprehensive tutorial system with AI character guidance, a 7-step walkthrough, full onboarding form validation, and seamless payment integration.
- **Legal Document Version Control System**: Enterprise-level system with complete version history, SHA-256 integrity checks, audit trails, GDPR/CCPA compliance, document status management, and a professional frontend interface.
- **Availability Heatmap System**: Public version at `/availability-heatmap` and an enhanced admin version at `/admin/availability-heatmap`.

## External Dependencies
- **Database Connectivity**: `@neondatabase/serverless`
- **ORM**: `drizzle-orm`
- **State Management**: `@tanstack/react-query`
- **Routing**: `wouter`
- **UI Libraries**: `@radix-ui/*`, `tailwindcss`, `lucide-react`
- **Mapping**: `react-leaflet`
- **AI Integrations**: Priority-based multi-AI orchestration:
  - **Perplexity (Primary)**: Real-time web search, verification of alternative sources, current pricing, market data.
  - **Claude (Secondary)**: `@anthropic-ai/sdk` - Advanced reasoning, complex analysis, care planning, contract analysis.
  - **ChatGPT (Backup)**: `openai` - General purpose fallback and validation.
- **Email Service**: SendGrid
- **Payment Processing**: Stripe
- **Document Signing**: Documenso (open-source, self-hosted)