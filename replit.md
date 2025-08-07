# MySeniorValet - Senior Living Community Transparency Platform

## Overview
MySeniorValet is a comprehensive senior living transparency platform designed to provide accurate, verified information about senior living communities across North America. It utilizes multi-AI intelligence orchestration (Claude, Gemini, ChatGPT, Grok) for data cross-validation, offering insights into over 34,000 communities in the U.S. and Canada, including traditional assisted living, 55+ active adult, mobile home parks, and manufactured home communities. A key capability is the display of verified HUD pricing. The platform's vision is to bring unparalleled transparency to the senior living market.

## User Preferences
- **Authentication Priority**: William.cowell01@gmail.com requires super admin access. Platform configured for production Replit Auth integration.
- **Notification Email Configuration**:
  - Super Admin Primary: William.cowell01@gmail.com (private)
  - Super Admin Backup: CowellandCoWebDesign@gmail.com (private)
  - Onboarding Team: hello@myseniorvalet.com (public)
  - Billing Team: billing@myseniorvalet.com (public)
  - Super admin receives all critical system alerts, security notifications, and platform milestones
- **Data Integrity Standards**: Maintain strict Golden Data Rule enforcement. HUD properties show verified government pricing only. Communities without verified pricing display "Contact for pricing." Multi-AI verification system for absolute accuracy. Never claim partnerships, verifications, or certifications unless legally verified and documented. Service recommendations must be clearly labeled as such, not as partnerships.
- **Accurate Platform Messaging**: Use "Complete Care Spectrum & Live Market Intelligence" to describe our national pricing insights and verified HUD data system. Avoid claiming "live pricing from all communities" as this is our goal, not current capability. Market Intelligence fills gaps with national reported averages while building toward full live pricing coverage. Be cautious with analytics claims during launch phase.
- **Documentation Preferences**: Keep documentation clean and consolidated. Remove outdated files to prevent confusion. Focus on current operational status over historical details.
- **Visual Design Preferences**: Hero image should be a beautiful space/astronomy image (https://cdn.pixabay.com/photo/2016/11/29/05/45/astronomy-1867616_1280.jpg). The user specifically prefers cosmic space imagery over senior living villa photos, symbolizing infinite possibilities in senior living. Dark mode is enabled by default for better user experience.
- **Critical Branding Rule**: NEVER USE "TRUEVIEW" - The brand name is MySeniorValet. All references to "TrueView" must be replaced with "MySeniorValet".
- **Mission Messaging**: Include official mission statement in email communications: "The trusted platform for authentic senior living community information. Helping families make informed decisions with verified data and transparent pricing."
- **Launch Status**: Platform verified and ready for immediate deployment (August 7, 2025). All systems operational: payment processing, advanced financial analytics, comprehensive legal compliance (Terms of Service, Privacy Policy, Cookie Policy), email templates, and 34,180 communities loaded with authentic data.
- **Single Home Page Rule**: The primary home page is `client/src/pages/myseniorvalet-home.tsx` (VERSION 3). DO NOT create or use `home.tsx`. All home page edits must target `myseniorvalet-home.tsx`. Root path "/" routes to MySeniorValetHome component only.
- **Golden Data Rule**: Zero tolerance for synthetic, mock, sample, or placeholder data. All data must come from verified authentic sources.

## System Architecture
The platform is built with a modern web stack emphasizing transparency and user engagement.
- **Frontend**: React with TypeScript, utilizing Tailwind CSS and shadcn/ui components. Features include community cards with subtype badges, an interactive Care Spectrum Slider, and a redesigned red tag example page matching authentic community detail layouts.
- **Backend**: Express.js with TypeScript.
- **Database**: PostgreSQL, managed with Drizzle ORM, supporting multiple senior living types and a robust services management system.
- **Build System**: Vite for the frontend and esbuild for the backend.
- **Authentication**: Replit Auth with role-based access control.
- **Key Features**: Interactive Map System with AI analysis, AI-Powered Search with multi-AI verification (including enhanced geocoding), Transparent Pricing (HUD-verified data), Comprehensive Community Profiles, Unified Admin Dashboard, Family Collaboration tools, and a Senior Vendor Marketplace. It includes comprehensive notification and in-app messaging systems, an onboarding wizard with AI character guidance, and a robust photo handling system. Full bilingual functionality (French/English) is supported.
- **UI/UX Decisions**: Emphasizes a clean, modern aesthetic with cosmic imagery. Consistent design elements include horizontal sliders and AI-generated product imagery for compliance. The system incorporates an automated testing infrastructure.
- **System Design**: Features a 5-table database architecture for services management, supporting dual subscription tier systems for communities and vendors.
  - **Community Tiers**: Verified Listing ($0/month), Standard ($149/month), Featured ($249/month), Platinum ($349/month). Tier-gated features prompt upgrades.
  - **Vendor Tiers**: Basic ($99/month, 1 state), Featured ($249/month, up to 3 states), National Partner ($499/month, nationwide).
- **Dashboard Separation**: User dashboards display personalized journey analytics. Business features (e.g., DocuSign, payment processing) are reserved for platinum-tier communities and contextually displayed.
- **Payment System**: Integrated dual payment system supporting Stripe Checkout Sessions and Payment Element for mobile-optimized, on-platform payment experiences. All payment flows, including free tier claims and paid subscriptions, are production-ready with automatic user authentication post-payment. Fixed price display (dividing cents by 100) and tier mapping for vendor payments. Handles existing vendor upgrades by checking email and updating subscription tier instead of creating duplicates. Vendor promotional pricing: 50% off first month for new vendors, 20% discount on annual billing (August 7, 2025).
- **Search & Navigation**: "Find My Perfect Match" button on the home page redirects to an AI search intelligence page with automatic Perfect Match tab activation, offering comprehensive care type, budget, location, and urgency options. Live Market Intelligence section integrates the 7-level care spectrum from HUD-Sponsored Housing to Skilled Nursing with visual indicators and community counts. Healthcare search includes enhanced map filtering and color-coded hospital cards with CMS ratings.

- **Onboarding System Enhancements** (Completed August 6, 2025): Fixed z-index layering issue where hero search bar appeared above onboarding popup by setting DialogContent z-index to 9999. Added "Sign Up & Save" functionality to the final onboarding step, allowing users to create an account with all their preferences pre-filled. Onboarding data is stored in localStorage and automatically applied after signup, seamlessly transitioning users to map search with their selected preferences (location, care types, budget). This creates a smooth user journey from initial exploration through account creation.
- **Community Creator Onboarding** (Completed August 7, 2025): Implemented comprehensive tutorial system for first-time community creators featuring AI character guidance (Sage, Compass, Builder), 7-step walkthrough highlighting key platform benefits (live availability, real-time pricing, Tour Track™ reviews, in-app messaging, specials/incentives), full onboarding form with validation, and seamless payment integration. Fixed city dropdown selection issue. Portal accessible at /community-creator-portal.

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