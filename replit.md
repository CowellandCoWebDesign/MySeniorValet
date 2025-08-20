# MySeniorValet - Senior Living Community Transparency Platform

## Overview
MySeniorValet is a technology platform connecting families with publicly available information about verified senior living communities across North America (United States, Canada, and Mexico). It leverages advanced AI orchestration to gather, organize, and present public information, including verified HUD pricing. The platform's vision is to empower families with authentic, verified data for informed decision-making in senior living, bringing much-needed transparency to the market. It aims to be "The Dawn of Transparency in Senior Living" by providing a complete care spectrum education, real pricing, zero paywalls, and tools for saving and sharing research. It features the fully operational TourMate™ tour scheduling system and includes a One-Touch Emergency Contact Shortcut. The platform offers trilingual support (English, French, Spanish) with true trilateral North American coverage.

**Platform Status (August 20, 2025)**: ✅ FULLY OPERATIONAL - Ready for Public Beta Launch
- **Database**: 33,560 verified communities across 3,000+ cities
- **AI Stack**: Perplexity, Claude, ChatGPT, Gemini all configured
- **Payment System**: Stripe fully integrated with subscriptions
- **Coverage**: Complete USA, Canada, Mexico trilingual support
- **Infrastructure**: Enterprise-grade with real-time features
- **Testing**: 100% pass rate on comprehensive platform test (22/22 tests passing)
- **Search Interface**: Unified autocomplete across all search pages with predictive text

## User Preferences
- **Authentication Priority**: William.cowell01@gmail.com and admin@myseniorvalet.com have super admin access. Platform configured for production Replit Auth integration.
- **Notification Email Configuration** (STANDARDIZED August 19, 2025):
  - Primary Admin Notifications: admin@myseniorvalet.com (system events, emergency alerts, privacy inquiries)
  - Personal Emergency/Backup Access: William.cowell01@gmail.com (private, secondary notifications, security concerns)
  - Technical Support: CowellandCoWebDesign@gmail.com (private, technical issues)
  - General Inquiries: hello@myseniorvalet.com (public, press inquiries, community onboarding)
  - Billing & Reservations: billing@myseniorvalet.com (public, payments, reservation confirmations)
  - Emergency button alerts sent to both admin@myseniorvalet.com (primary) and William.cowell01@gmail.com (backup)
  - NOTE: ALL emails standardized across entire platform - no legacy addresses remain
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
- **Database**: PostgreSQL, managed with Drizzle ORM, supporting multiple senior living types and a robust services management system, including pricing history, community claims, and verification logs.
- **Build System**: Vite for the frontend and esbuild for the backend.
- **Authentication**: Custom authentication system with email/password, social login (Google, Facebook), and Replit Auth integration.
- **Key Features**: Interactive Map System with AI analysis, AI-Powered Search with multi-AI verification, Semantic Search, Transparent Pricing (HUD-verified and AI-verified market rates), Comprehensive Community Profiles, Unified Admin Dashboard, Family Collaboration tools, Senior Vendor Marketplace, notification and in-app messaging, an onboarding wizard with AI character guidance, and robust photo handling. Full bilingual functionality (French/English). TourMate™ Tour Scheduling System. One-Touch Emergency Contact System.
- **UI/UX Decisions**: Clean, modern aesthetic with cosmic imagery. Dark mode is default. Consistent design elements, horizontal sliders, and AI-generated product imagery. Search results display in a vertical scrolling "rolodex" style with regional theme styling. Content is organized with distinct visual theming for communities, hospitals, vendors, and resources. Senior Living Command Center displays ecosystem options on separate lines with emojis. Compact design with reduced font sizes and spacing. Navbar has a transparent background with gradient text for the title. Trust indicators are prominently displayed. An engaging loading screen for competitive analysis features a custom Valet Gentleman character with rotating educational "Did you know..." facts and visual progress indicators.
- **System Design**: Supports dual subscription tiers for communities and vendors. Dashboard separation includes user analytics, contextual business features, and a unified super admin analytics center with RBAC. Dual pricing display. Dynamic scaling cost controls for API calls with regional caching and batch processing.
- **Payment System**: Integrated dual payment system supporting Stripe Checkout Sessions and Payment Element.
- **Search & Navigation**: Simplified AI-powered search with semantic understanding and natural language queries. Live Market Intelligence section integrates a 10-level care spectrum, transformed into an interactive 3D carousel. Healthcare search includes enhanced map filtering and color-coded hospital cards. AI Search Interface maintains a 3-row layout for amenities/care services, distance/price sliders, and Complete Care Spectrum types.
- **AI Deep Analysis**: Provides detailed comparative analysis including price comparisons, value leaders, HUD affordable options, neighborhood insights, care type matching, and personalized recommendations. Generates comprehensive market trends and actionable advice. AI personalization ensures empathetic and context-aware interactions. Includes Orchestra's deep market analysis by Anthropic Claude as a final verdict section in community details, featuring executive analysis, key value propositions, market position scoring, and AI recommendations.
- **Onboarding System**: Users can sign up with preferences pre-filled. Community creators have a comprehensive tutorial system with AI character guidance, a 7-step walkthrough, full onboarding form validation, and seamless payment integration.
- **Legal Document Version Control System**: Enterprise-level system with complete version history, SHA-256 integrity checks, audit trails, GDPR/CCPA compliance, document status management, and a professional frontend interface.
- **Availability Heatmap System**: Public version at `/availability-heatmap` and an enhanced admin version at `/admin/availability-heatmap`.

## External Dependencies
- **Database Connectivity**: `@neondatabase/serverless`
- **ORM**: `drizzle-orm`
- **State Management**: `@tanstack/react-query`
- **Routing**: `wouter`
- **UI Libraries**: `@radix-ui/*`, `tailwindcss`, `lucide-react`
- **Mapping**: `react-leaflet`
- **AI Integrations**:
  - **Perplexity (Primary)**: For real-time web search, verification, and market data.
  - **Claude (Secondary)**: For advanced reasoning, complex analysis, and care planning.
  - **ChatGPT (Backup)**: For general purpose fallback and validation.
- **Email Service**: SendGrid
- **Payment Processing**: Stripe
- **Document Signing**: Documenso

## Recent Changes & Status (August 20, 2025)
- ✅ **Search Interface Unified**: Replaced plain input fields with AutocompleteSearch component across all search interfaces for consistent predictive text
- ✅ **Duplicate Interface Removed**: Eliminated redundant MySeniorValet search page, maintaining single map-search interface
- ✅ **Code Cleanup**: Removed old custom autocomplete implementation in map-search page
- ✅ **Bug Fix**: Resolved detectLocationType function to properly parse "City State" queries without commas

## Previous Updates (August 19, 2025)
- ✅ **MAJOR MILESTONE ACHIEVED**: Complete government-cited content integration across ALL 8 care type pages
  - **Memory Care**: CMS dementia care standards, NIA Alzheimer's research, federal funding programs
  - **Assisted Living**: Federal quality standards, Medicaid HCBS coverage, state licensing requirements
  - **Home Care**: Medicare home health benefits, VA aid & attendance, federal workforce statistics
  - **Adult Day Care**: PACE programs, CDC social engagement statistics, Medicare/Medicaid coverage
  - **Personal Care**: Medicaid personal care services, ADL standards, state-specific coverage
  - **Companion Care**: Federal social isolation research, ACL senior companion programs, mental health impact data
  - **Nursing Services**: Medicare skilled nursing coverage, HRSA workforce data, CMS quality measures
  - **Hospice Care**: Medicare hospice benefit, CMS CAHPS quality measures, eligibility requirements
- ✅ **Golden Data Rule Compliance**: All pages feature transparent government citations with Info icons
- ✅ **Email Notification System**: Standardized with admin@myseniorvalet.com as primary recipient
- ✅ **Legal Compliance**: All "recommend" language replaced with "discover/connect/explore" terminology
- ✅ **Tab Structure Fixed**: Removed redundant TourTracker tab from Community Details page - now shows 3 tabs
- ✅ **Business Functionality Verified**: Complete verification of community claiming, payment tiers, and dashboard management - all core business features confirmed operational
- ✅ **Community Management Confirmed**: Communities can claim listings, choose payment tiers (free/$149/$299/$349), and edit information through dashboard based on subscription level
- ✅ **Loading Screen Timing Optimized**: Increased message display duration from 3 seconds to 7 seconds across all loading components (SearchingMascot and CompetitiveAnalysisLoader) for better readability