# MySeniorValet - Senior Living Community Transparency Platform

## Overview
MySeniorValet is a comprehensive senior living transparency platform providing accurate, verified information about senior living communities. It utilizes multi-AI intelligence orchestration (Claude, Gemini, ChatGPT, Grok) for cross-checking accuracy, offering unparalleled insight into senior living options, including verified HUD pricing. The platform has achieved North American coverage, encompassing 34,171 communities across the U.S. and Canada, including mobile home parks, manufactured home communities, 55+ active adult communities, and traditional assisted living facilities.

## User Preferences
- **Authentication Priority**: William.cowell01@gmail.com requires super admin access. Platform configured for production Replit Auth integration.
- **Notification Email Configuration**:
  - Super Admin Primary: William.cowell01@gmail.com (private)
  - Super Admin Backup: CowellandCoWebDesign@gmail.com (private)
  - Onboarding Team: hello@myseniorvalet.com (public)
  - Billing Team: billing@myseniorvalet.com (public)
  - Super admin receives all critical system alerts, security notifications, and platform milestones
- **Data Integrity Standards**: Maintain strict Golden Data Rule enforcement. HUD properties show verified government pricing only. Communities without verified pricing display "Contact for pricing." Multi-AI verification system for absolute accuracy. Never claim partnerships, verifications, or certifications unless legally verified and documented. Service recommendations must be clearly labeled as such, not as partnerships.
- **Documentation Preferences**: Keep documentation clean and consolidated. Remove outdated files to prevent confusion. Focus on current operational status over historical details.
- **Visual Design Preferences**: Hero image should be a beautiful space/astronomy image (https://cdn.pixabay.com/photo/2016/11/29/05/45/astronomy-1867616_1280.jpg). The user specifically prefers cosmic space imagery over senior living villa photos, symbolizing infinite possibilities in senior living. Dark mode is enabled by default for better user experience.
- **Critical Branding Rule**: NEVER USE "TRUEVIEW" - The brand name is MySeniorValet. All references to "TrueView" must be replaced with "MySeniorValet".
- **Single Home Page Rule**: The primary home page is `client/src/pages/myseniorvalet-home.tsx` (VERSION 3). DO NOT create or use `home.tsx`. All home page edits must target `myseniorvalet-home.tsx`. Root path "/" routes to MySeniorValetHome component only.
- **Golden Data Rule**: Zero tolerance for synthetic, mock, sample, or placeholder data. All data must come from verified authentic sources.

## System Architecture
The platform is built with a modern web stack designed for transparency and user engagement.
- **Frontend**: React with TypeScript, using Tailwind CSS and shadcn/ui components. Features include community cards with subtype badges and an interactive Care Spectrum Slider.
- **Backend**: Express.js with TypeScript.
- **Database**: PostgreSQL, managed with Drizzle ORM, supporting multiple senior living types and a robust services management system.
- **Build System**: Vite for the frontend and esbuild for the backend.
- **Authentication**: Replit Auth with role-based access control.
- **Key Features**: Interactive Map System with AI analysis, AI-Powered Search with multi-AI verification, Transparent Pricing (including HUD-verified data), Comprehensive Community Profiles, Unified Admin Dashboard, Family Collaboration tools, and a Senior Vendor Marketplace.
- **UI/UX Decisions**: Emphasizes a clean, modern aesthetic with cosmic imagery. Consistent design elements include horizontal sliders and AI-generated product imagery for compliance. The system incorporates an automated testing infrastructure.
- **System Design**: Features a 5-table database architecture for services management, dual subscription tier systems:
  - **Community Tiers** - OFFICIAL PRICING:
    - Tier 1: Verified Listing - $0/month (Free)
      * Claimable for free once community verifies email
      * Edit contact info (phone, website, email, address)
      * Upload 1 photo
      * Tour Scheduler enabled if email is present
      * Cannot respond to reviews
      * No PDF uploads, no analytics, no visibility boost
      * Appears in basic search results
    - Tier 2: Standard - $149/month
      * All Tier 1 features, plus:
      * Upload up to 10 photos
      * Upload 1 brochure PDF
      * Add external calendar link
      * Access basic analytics
      * Can respond to reviews
      * "Standard Verified" badge
    - Tier 3: Featured - $249/month
      * All Tier 2 features, plus:
      * Upload up to 25 photos
      * 1 video (max 2 mins)
      * Upload up to 3 PDFs
      * Featured placement in search & maps
      * In-app messaging + AI assist
      * Promo badge support
      * Concierge "Preferred" tag
    - Tier 4: Platinum - $349/month (For Communities Only)
      * All Tier 3 features, plus:
      * Upload up to 50 photos
      * Up to 3 videos (5 mins each)
      * Unlimited PDFs
      * Staff bios, care philosophy, menus
      * Availability sync (form, spreadsheet, or API)
      * Admin dashboard (multi-property view if licensed)
      * Top Concierge Priority
      * Monthly performance review call
      * Portfolio operators must subscribe per community
      * Bulk rates: 10-49 communities: $299/month each, 50+: $249/month each
  - **Vendor Tiers** - CRITICAL PRICING (3 TIERS ONLY):
    - Tier 1: Basic Listing - $99/month
      * Public listing in vendor directory
      * Region-limited to 1 zip cluster
      * Name, phone, category, description
      * Optional $25 verified badge
      * No logo, no analytics, no placement boost
      * User reviews allowed
      * Affiliate link support (if provided)
    - Tier 2: Featured Vendor - $249/month
      * All Tier 1 features, plus:
      * Coverage across 5 regions
      * Upload logo, brand colors, CTA button
      * Basic analytics (views, clicks, leads)
      * Post vendor promos
      * Featured placement in vendor carousels
      * Must have affiliate link for "Approved" badge
    - Tier 3: National Partner (Premium) - $499/month
      * All Tier 2 features, plus:
      * Nationwide visibility (no geo cap)
      * Banner rotation in major discovery areas
      * Concierge system priority & routing
      * AI-generated lead summaries + scoring
      * Optional API or CSV lead passback
      * Dedicated vendor microsite
      * Quarterly performance report
      * Optional vendor success call
  Includes comprehensive notification and in-app messaging systems, onboarding wizard with AI character guidance, and robust photo handling system. The platform supports full bilingual functionality (French/English).
- **Dashboard Separation**: User dashboard shows personalized journey analytics (saved communities, tours, search patterns). Business features (DocuSign, payment processing) are reserved for platinum-tier communities only and shown contextually on community pages, not in user dashboards.
- **Subscription Enforcement** (Added August 2, 2025): Platform-wide tier restrictions implemented across community dashboards, vendor marketplace, photo uploads, analytics access, and messaging features. All tier-gated features show upgrade prompts with SubscriptionUpgradeModal integration.
- **Tier Specification Implementation** (Completed August 2, 2025): Successfully implemented exact tier specifications from user screenshots. Community Portal displays 4 tiers: Verified (Free), Standard ($149), Featured ($249), Platinum ($349). Vendor Marketplace shows only 3 tiers: Basic Listing ($99), Featured Vendor ($249), National Partner ($499). Added comprehensive feature comparison tables with visual indicators. Frontend pages correctly reflect backend pricing structures with no Enterprise or Free vendor tiers.
- **Red Tag Example Page Redesign** (Completed August 2, 2025): Completely redesigned red tag example pages to match authentic community detail page layout. Added NavigationHeader, hero photo carousel, tabbed content structure, pricing displays, and contact sections. Red tag examples now properly demonstrate what actual paid red tag specials and claimed listings would look like while maintaining clear distinction from authentic data.
- **Stripe Payment Implementation** (Updated August 4, 2025): Implemented dual payment system supporting both Stripe Checkout Sessions and Payment Element for optimal flexibility. Checkout Sessions remain available for redirect-based flows, while the new Payment Element provides mobile-optimized, on-platform payment experience. Created MobilePaymentForm component with full mobile responsiveness, vendor-mobile-payment page for seamless vendor signups, and payment intent endpoints for secure card processing. Payment Element chosen for superior mobile UX, keeping users engaged on-platform without redirects. Both methods maintain PCI compliance through Stripe's secure infrastructure. Consolidated all payment testing into single dashboard at `/payment-test-dashboard` to avoid redundancy.
- **Database Constraint Fix** (August 5, 2025): Fixed critical subscription tier constraint mismatch. Database had old constraint expecting values like 'Basic', 'Verified Standard', etc., while schema used 'verified', 'standard', 'featured', 'platinum'. Updated all 34,171 communities from 'Basic' to 'verified' and recreated constraint to match schema. Free tier claims now work correctly.
- **Subscription Tier Logic Correction** (August 5, 2025): Corrected subscription tier hierarchy - unclaimed listings now have NULL subscription tier (unverified), while claimed free listings have 'verified' tier. Updated 34,112 unclaimed communities to NULL tier, leaving only 59 actually claimed communities as 'verified'. Schema updated to remove default 'verified' value. This properly distinguishes between unclaimed listings and free tier claimed listings.
- **Payment System Complete** (August 5, 2025): All payment flows now working perfectly end-to-end. Fixed Stripe initialization issue in stripe-subscription-service.ts, automatic login after payment now functional for both free tier claims and paid subscriptions. Fixed user ID type mismatch by allowing database to auto-generate integer IDs. Tested successfully: free tier claims create community and auto-login, vendor checkout sessions generate properly, community subscription checkouts work correctly. Payment infrastructure is production-ready with proper error handling and automatic user authentication post-payment.
- **Smart Search Navigation Fix** (Completed August 4, 2025): Fixed "Find My Perfect Match" button on home page to properly redirect to AI search intelligence page with automatic Perfect Match tab activation. Button now uses URL parameter `?mode=perfect-match` to trigger the perfect match flow. Perfect Match tab includes comprehensive care type selection (Independent Living, Assisted Living, Memory Care, Skilled Nursing) along with budget range, location preferences, and urgency options. This ensures users can easily find appropriate senior living communities based on their specific care needs directly from the home page.
- **Live Market Intelligence Care Spectrum Integration** (Completed August 5, 2025): Incorporated complete 7-level care spectrum from CareSpectrumSlider into Live Market Intelligence section. Now displays all care levels from HUD-Sponsored Housing ($0-$500) through Skilled Nursing ($6,000-$12,000+), including 55+ Mobile Home Parks, Active Adult 55+, Independent Living, Assisted Living, and Memory Care. Added visual spectrum indicator, icons, and community counts for each level. Moved the interactive "Find Your Perfect Care Level" slider directly into the bottom of the Live Market Intelligence section for better user flow, positioning it above the Florida communities section.
- **Healthcare Search & Map Enhancements** (Completed August 6, 2025): Fixed hospital coordinate comparison in healthcare search by casting string coordinates to DECIMAL for proper geographic filtering. Added count badges to Services, Healthcare, and Resources tabs matching Communities tab styling. Hospital cards now display with special blue/red color coding (red for emergency services, blue for hospitals, green for other healthcare) with enhanced CMS ratings and quality metrics. Verified no expired Amazon affiliate links exist in database. Messaging button properly shows "Messaging Locked" with lock icon for free-tier communities, clarifying that communities (not customers) need to upgrade to enable messaging features.

## External Dependencies
- **Database Connectivity**: `@neondatabase/serverless`
- **ORM**: `drizzle-orm`
- **State Management**: `@tanstack/react-query`
- **Routing**: `wouter`
- **UI Libraries**: `@radix-ui/*`, `tailwindcss`, `lucide-react`
- **Mapping**: `react-leaflet`
- **AI Integrations**: `@anthropic-ai/sdk` (Claude), `@google/genai` (Gemini), `openai` (ChatGPT), `Perplexity API`, `XAI integration` (Grok infrastructure ready).
- **Email Service**: SendGrid
- **Payment Processing**: Stripe