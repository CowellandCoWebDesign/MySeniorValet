# MySeniorValet - Senior Living Community Transparency Platform

## Overview
MySeniorValet is a comprehensive senior living transparency platform providing accurate, verified information about over 34,000 senior living communities in the U.S. and Canada, including traditional assisted living, 55+ active adult, mobile home parks, and manufactured home communities. Its core purpose is to bring unparalleled transparency to the senior living market by utilizing multi-AI intelligence orchestration for data cross-validation, especially for displaying verified HUD pricing. The project aims to empower families to make informed decisions with verified data and transparent pricing.

### Recent Updates (August 9, 2025)
- **Enhanced Community Cards**: Implemented dynamic occupancy display showing actual unit availability (e.g., "3 of 85 units") with color-coded status indicators
- **Care-Type Placeholders**: Added specific icons for Memory Care (🧠), Skilled Nursing (🏥), Independent Living (🏡), HUD Housing (🏛️), 55+ Active (🎾), Mobile Park (🚐)
- **Critical Information Display**: Added pet policy, special promotions, medical restrictions, license status, and violations display to community cards
- **Dual Color-Coding System**: Left side pricing color-coded by verification source (Blue=HUD, Green=Community, Yellow=Market), right side availability color-coded by status
- **Consolidated Occupancy Display**: Unit counts and occupancy percentage now display on single line for cleaner layout (e.g., "3 of 85 units • 96% Occupied")
- **Header Layout Optimization**: Header displays pricing on left side, availability status and details on right side with occupancy percentage shown first
- **Pricing Attribution**: Added source citation below pricing amount indicating data source (HUD Verified Data, Community Verified, or MySeniorValet Market Intelligence)
- **Reviews Section**: Replaced availability section with comprehensive reviews displaying Tour Tracker Score (gold-themed), Yelp rating with link, and Google rating with link
- **Units Display**: Moved units count to top right of card body next to care type badge for cleaner layout
- **Community Name**: Removed verified source parenthetical from community names, relying on pricing citation below
- **Test Page**: Created `/enhanced-card-test` to showcase all new card features with comprehensive sample data

## User Preferences
- **Authentication Priority**: William.cowell01@gmail.com and admin@myseniorvalet.com have super admin access. Platform configured for production Replit Auth integration.
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
- **Single Home Page Rule**: The primary home page is `client/src/pages/myseniorvalet-home.tsx` (VERSION 3). DO NOT create or use `home.tsx`. All home page edits must target `myseniorvalet-home.tsx`. Root path "/" routes to MySeniorValetHome component only.
- **Golden Data Rule**: Zero tolerance for synthetic, mock, sample, or placeholder data. All data must come from verified authentic sources.

## System Architecture
The platform is built with a modern web stack, emphasizing transparency and user engagement.
- **Frontend**: React with TypeScript, Tailwind CSS, and shadcn/ui components. Features include community cards with subtype badges, an interactive Care Spectrum Slider, and a redesigned red tag example page.
- **Backend**: Express.js with TypeScript.
- **Database**: PostgreSQL, managed with Drizzle ORM, supporting multiple senior living types and a robust services management system.
- **Build System**: Vite for the frontend and esbuild for the backend.
- **Authentication**: Replit Auth with role-based access control.
- **Key Features**: Interactive Map System with AI analysis, AI-Powered Search with multi-AI verification (including enhanced geocoding), Semantic Search capabilities with natural language understanding, Transparent Pricing (HUD-verified data), Comprehensive Community Profiles, Unified Admin Dashboard, Family Collaboration tools, and a Senior Vendor Marketplace. Includes comprehensive notification and in-app messaging, an onboarding wizard with AI character guidance, and a robust photo handling system. Full bilingual functionality (French/English) is supported.
- **UI/UX Decisions**: Emphasizes a clean, modern aesthetic with cosmic imagery. Consistent design elements include horizontal sliders and AI-generated product imagery. Dark mode is default.
- **System Design**: Features a 5-table database architecture for services management, supporting dual subscription tier systems for communities and vendors.
  - **Community Tiers**: Verified Listing ($0/month), Standard ($149/month), Featured ($249/month), Platinum ($349/month).
  - **Vendor Tiers**: Basic ($99/month, 1 state), Featured ($249/month, up to 3 states), National Partner ($499/month, nationwide).
- **Dashboard Separation**: User dashboards display personalized journey analytics. Business features (e.g., DocuSign, payment processing) are reserved for platinum-tier communities and contextually displayed. Marketing Hub is admin-only at /admin/marketing-hub. Admin dashboards are consolidated into a unified super admin analytics center with role-based access control (RBAC).
- **Payment System**: Integrated dual payment system supporting Stripe Checkout Sessions and Payment Element for mobile-optimized, on-platform payment experiences. All payment flows are production-ready with automatic user authentication post-payment. Handles vendor upgrades and promotional pricing (50% off first month for new vendors, 20% discount on annual billing).
- **Search & Navigation**: Simplified Search functionality provides AI-powered search with semantic understanding and natural language queries. Live Market Intelligence section integrates the 7-level care spectrum from HUD-Sponsored Housing to Skilled Nursing with visual indicators and community counts. Healthcare search includes enhanced map filtering and color-coded hospital cards with CMS ratings. Perfect Match functionality has been removed (January 2025) to avoid referral partner concerns.
- **AI Deep Analysis**: Provides detailed comparative analysis including price comparisons, value leaders, HUD affordable options, neighborhood insights, care type matching, and personalized recommendations with strengths, considerations, and ideal resident profiles. Generates comprehensive market trends and actionable advice.
- **Onboarding System**: Users can sign up with preferences pre-filled from onboarding data stored in localStorage. Community creators have a comprehensive tutorial system with AI character guidance, a 7-step walkthrough, full onboarding form validation, and seamless payment integration.
- **Legal Document Version Control System**: Enterprise-level system with complete version history tracking, SHA-256 integrity checking, comprehensive audit trails, GDPR/CCPA compliance, document status management, and a professional frontend interface at /legal-document-history.
- **Availability Heatmap System**: Public version at `/availability-heatmap` and an enhanced admin version at `/admin/availability-heatmap` with detailed analytics overlays, historical trend data, competitor analysis, revenue heat mapping, and occupancy rate insights.
- **Map Pin Aesthetics**: Improved map marker design with compact pins, prominent thick borders (stroke-width="4") with color-coded pricing status (bright green for live/verified pricing, bright red for contact-only pricing). Care level visual differentiation using intuitive emojis (e.g., 🏛️ HUD, 🧠 Memory Care).
- **Search Results Display**: Vertical scrolling "rolodex" style with EnhancedCommunityCard (variant="list"). Implements regional theme styling with gradient backgrounds and edge indicators for HUD/Government (green), Canadian (red maple), Hawaiian (tropical blue-cyan), Mexican (tricolor), Florida (sunset orange), Texas (amber), New York (urban gray-blue), and Arizona (desert red-orange) communities.
- **AI Search Interface Layout** (Updated January 11, 2025): Maintained original 3-row structure with enhanced mobile responsiveness: Row 1 - Amenities/Care Services and Unit/Room Type selections, Row 2 - Flattened inline distance and price sliders with immediate availability toggle and apply/reset controls, Row 3 - Complete Care Spectrum types. Added responsive sizing with smaller text and compact layouts on mobile devices.
- **Semantic Search Integration** (Updated January 11, 2025): Integrated Weaviate-powered semantic search with natural language understanding. Features include: Toggle switch for semantic/traditional search modes (semantic enabled by default), Hybrid search combining semantic understanding with keyword matching, RAG-powered AI recommendations, Natural language query support (e.g., "safe place for dad who wanders"), Visual match score indicators, Match explanation display for transparency. Endpoint: `/api/semantic/search` supports queries like "affordable memory care near Baptist hospital in Dallas".

## External Dependencies
- **Database Connectivity**: `@neondatabase/serverless`
- **ORM**: `drizzle-orm`
- **State Management**: `@tanstack/react-query`
- **Routing**: `wouter`
- **UI Libraries**: `@radix-ui/*`, `tailwindcss`, `lucide-react`
- **Mapping**: `react-leaflet`
- **AI Integrations**: Priority-based multi-AI orchestration:
  1. **Claude (Primary)**: `@anthropic-ai/sdk` - Advanced reasoning, complex analysis, care planning, contract analysis
  2. **Perplexity (Secondary)**: Real-time web search, current pricing, market data, web search relevance
  3. **ChatGPT-4o (3rd)**: `openai` - Using GPT-4o model for tertiary analysis and validation
- **Email Service**: SendGrid
- **Payment Processing**: Stripe
- **Document Signing**: Documenso (open-source, self-hosted)