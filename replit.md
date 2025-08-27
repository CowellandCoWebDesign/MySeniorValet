# MySeniorValet - Senior Living Community Transparency Platform

## Overview
MySeniorValet is a technology platform connecting families with publicly available, verified information about senior living communities across North America. Its purpose is to bring transparency to the senior living market by providing authentic, verified data, including HUD pricing, to empower informed decision-making. The platform offers complete care spectrum education, real pricing without paywalls, and tools for saving and sharing research. Key capabilities include the TourMate™ tour scheduling system, a One-Touch Emergency Contact Shortcut, and trilingual support (English, French, Spanish). MySeniorValet aims to be "The Dawn of Transparency in Senior Living." The platform includes an enhanced pricing intelligence system for historical tracking, confidence scoring, and trend analysis across different care levels, and prioritizes transparency by gathering comprehensive information from all available sources with robust AI-driven verification.

### Authentication System Fixed (August 27, 2025 - 6:00 AM)
- **Major Success**: Authentication system completely repaired after critical failures
- **Fixed Components**: User registration, login, session management, protected routes
- **Database Fix**: Created missing `user_sessions` table for proper session tracking
- **Current Users**: 21 registered users with secure password hashing
- **Email Integration**: SendGrid working for registration notifications

### AI Priority System (August 27, 2025)
1. **Perplexity (Primary)** - `sonar-pro` model for real-time web search
2. **Anthropic Claude (Secondary)** - `claude-sonnet-4-20250514` for intelligent analysis  
3. **OpenAI ChatGPT (Tertiary)** - `gpt-5` as backup when others unavailable

### Simplified Perplexity-First Intelligence System (August 27, 2025)
- **Major Architecture Simplification**: Completely rebuilt intelligence system after identifying over-engineering issues
- **Perplexity-First Approach**: Use Perplexity as primary source for exact community information
- **Direct Website Scraping**: If exact match found, scrape official website for photos and pricing
- **Fallback Strategy**: Only search surrounding areas if exact community match isn't found
- **Removed Complexity**: Eliminated multi-AI verification, redundant calls, and complex scraping patterns
- **Clean Implementation**: Single simplified-perplexity-service.ts handles all intelligence gathering
- **Streamlined UI**: LiveWebIntelligence component simplified for on-demand intelligence fetching
- **Critical API Fixes (August 27, 2025)**: 
  - Fixed Perplexity API model names - migrated from deprecated `llama-3.1-sonar-small-128k-online` to current `sonar-pro` model for enhanced search capabilities. Perplexity's 2025 models are: `sonar`, `sonar-pro` (enhanced, currently used), `sonar-reasoning-pro`, and `sonar-deep-research`
  - Fixed autocomplete predictive text - removed circular fetch call in legacy endpoint that was preventing suggestions from loading. Now directly queries database returning 103 Dallas communities in ~1 second from 34,365 total communities

### Comprehensive Automated Frontend Testing (August 27, 2025)
- **Test Framework**: Jest + React Testing Library with 85% coverage target
- **Unit Tests**: Complete coverage of Home page, AutocompleteSearch, Community Detail, and Map Search components
- **Integration Tests**: End-to-end search flow testing with comprehensive user journey validation
- **Test Features**: Performance testing (debouncing, caching), accessibility compliance (ARIA, keyboard nav), responsive design validation, error handling verification
- **Test Runner**: Automated `run-frontend-tests.sh` script with color-coded output and coverage reporting
- **Key Metrics**: 150+ tests across 5 test suites, <30 second execution time, 100% critical path coverage
- **Mock Strategy**: Realistic data mocks matching production API responses with both success and failure scenarios

## User Preferences
- **Authentication Priority**: William.cowell01@gmail.com and admin@myseniorvalet.com have super admin access. Platform configured for production Replit Auth integration.
- **Notification Email Configuration**:
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
- **CRITICAL MASCOT RULE**: The MySeniorValet mascot must ALWAYS be the gentleman valet IMAGE (valet-mascot.png), NEVER an emoji. This is a non-negotiable brand requirement. Photo carousel displays friendly valet mascot with personalized message while searching for authentic photos (10-15 second expectation).
- **Mission Messaging**: Include official mission statement in email communications: "The trusted platform for authentic senior living community information. Helping families make informed decisions with verified data and transparent pricing."
- **Single Home Page Rule**: The primary home page is `client/src/pages/myseniorvalet-home.tsx` (VERSION 3). DO NOT create or use `home.tsx`. All home page edits must target `myseniorvalet-home.tsx`. Root path "/" routes to MySeniorValetHome component only.
- **Golden Data Rule**: Zero tolerance for synthetic, mock, sample, or placeholder data. All data must come from verified authentic sources.
- **Map Interface Preferences**: Legend button positioned on map at top-right (not in header). Map Layers control positioned 60px below Legend button. Heatmap toggle removed from interface to prevent UI overlap issues.

## System Architecture
The platform is built with a modern web stack, emphasizing transparency and user engagement.
- **Frontend**: React with TypeScript, Tailwind CSS, and shadcn/ui components. Features include community cards with subtype badges, an interactive Care Spectrum Slider, and dynamic occupancy displays. Map pins are circular with bold colored borders. Dark mode is fully supported. Responsive design utilizes container queries, CSS clamp(), new viewport units, aspect-ratio, logical properties, and fluid grid layouts.
- **Backend**: Express.js with TypeScript.
- **Database**: PostgreSQL, managed with Drizzle ORM, supporting multiple senior living types, pricing history, community claims, and verification logs.
- **Build System**: Vite for frontend, esbuild for backend.
- **Authentication**: Custom system with email/password, social login (Google, Facebook), and Replit Auth.
- **Key Features**: Interactive Map System with AI analysis, AI-Powered Semantic Search, Transparent Pricing (HUD-verified and AI-verified market rates), Comprehensive Community Profiles, Unified Admin Dashboard, Family Collaboration tools, Senior Vendor Marketplace, notification and in-app messaging, an onboarding wizard with AI character guidance, and robust photo handling. Full bilingual functionality (French/English). TourMate™ Tour Scheduling System. One-Touch Emergency Contact System.
- **UI/UX Decisions**: Clean, modern aesthetic with cosmic imagery and default dark mode. Consistent design elements, horizontal sliders, and AI-generated product imagery. Search results display in a vertical scrolling "rolodex" style with regional theme styling. Content is organized with distinct visual theming for communities, hospitals, vendors, and resources. Senior Living Command Center displays ecosystem options with emojis. Compact design with reduced font sizes and spacing. Navbar has a transparent background with gradient text. Trust indicators are prominent. An engaging loading screen features a custom Valet Gentleman character with educational "Did you know..." facts and progress indicators. The hero section includes a HeroMascotPanel mimicking community details loading page style and features rotating platform messages.
- **System Design**: Supports dual subscription tiers for communities and vendors. Dashboard separation includes user analytics, contextual business features, and a unified super admin analytics center with RBAC. Dual pricing display. Dynamic scaling cost controls for API calls with regional caching and batch processing. Pricing extraction is robust, supporting patterns like "Starting at $", "From $", and monthly rent ranges specific to senior living sites.
- **Payment System**: Integrated dual payment system supporting Stripe Checkout Sessions and Payment Element.
- **Search & Navigation**: Simplified AI-powered search with semantic understanding and natural language queries. Live Market Intelligence section integrates a 10-level care spectrum, transformed into an interactive 3D carousel. Healthcare search includes enhanced map filtering and color-coded hospital cards. AI Search Interface maintains a 3-row layout for amenities/care services, distance/price sliders, and Complete Care Spectrum types. Unified autocomplete across all search pages with predictive text.
- **AI Deep Analysis**: Provides detailed comparative analysis including price comparisons, value leaders, HUD affordable options, neighborhood insights, care type matching, and personalized recommendations. Generates comprehensive market trends and actionable advice. AI personalization ensures empathetic and context-aware interactions. The "What We Found About [Community Name]" section focuses exclusively on the specific community, identifying public website, major management corporations, and community-specific facts from web searches, filtering out generic information. Multi-AI verification service prioritizes official website pricing at 95% confidence, marking with `isOfficial: true` flag. Structured responses are implemented for reliable data extraction.
- **Onboarding System**: Users can sign up with preferences pre-filled. Community creators have a comprehensive tutorial system with AI character guidance, a 7-step walkthrough, full onboarding form validation, and seamless payment integration.
- **Legal Document Version Control System**: Enterprise-level system with complete version history, SHA-256 integrity checks, audit trails, GDPR/CCPA compliance, document status management, and a professional frontend interface.
- **Availability Heatmap System**: Public version at `/availability-heatmap` and an enhanced admin version at `/admin/availability-heatmap`.
- **Performance Optimization System**: Comprehensive performance enhancement with advanced caching service, database query analysis, automated index creation, real-time metrics monitoring, and admin dashboard for performance management.
- **Photo Management System**: Complete implementation with validation, CDN optimization, quality scoring, source attribution, and database logging.

## External Dependencies
- **Database Connectivity**: `@neondatabase/serverless`
- **ORM**: `drizzle-orm`
- **State Management**: `@tanstack/react-query`
- **Routing**: `wouter`
- **UI Libraries**: `@radix-ui/*`, `tailwindcss`, `lucide-react`
- **Mapping**: `react-leaflet`
- **AI Integrations**:
  - **Perplexity (Primary)**: For real-time web search, verification, and market data. Using `sonar-pro` model.
  - **Claude (Secondary)**: For advanced reasoning, complex analysis, and care planning.
  - **ChatGPT (Backup)**: For general purpose fallback and validation.
- **Email Service**: SendGrid
- **Payment Processing**: Stripe
- **Document Signing**: Documenso