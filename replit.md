## Overview
MySeniorValet is an AI-powered "Google of Senior Care" platform, featuring "Learn Mode" and a unified AI search engine. Its purpose is to bring transparency to senior living through a neural network architecture and autonomous decision-making. The platform provides comprehensive care spectrum education, real pricing without paywalls, and tools for saving and sharing research. Key capabilities include the TourMate™ tour scheduling system, One-Touch Emergency Contact Shortcut, trilingual support (English, French, Spanish), and self-healing mechanisms. The business model ensures families receive full platform access for free, with revenue generated exclusively from B2B clients (communities, professionals, healthcare, vendors).

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
- **CRITICAL REMOVAL AUTHORIZATION RULE**: NO removal of functionality, features, or code sections without EXPLICIT user authorization. Any removal attempt must first be confirmed with user. This includes search results, UI components, data displays, or any existing functionality. Before proposing any removal, provide an IN-DEPTH explanation that includes: (1) What exactly will be removed, (2) Why the removal is being considered, (3) What impact the removal will have on functionality, (4) What alternative solutions exist, (5) Expected user experience changes after removal. Only proceed with removal after receiving explicit approval.

## System Architecture
The platform is built with a modern web stack, emphasizing transparency and user engagement. It features Fortune 500-level executive intelligence through a competitive analysis page and executive summary dashboard, showcasing market position, data confidence, AI insights, and strategic recommendations. Perplexity AI is treated as an intelligent business analyst, with its responses displayed unfiltered and with source attribution. Web enrichment data from Perplexity API is cached for 7 days.

**Technical Implementations**:
- **Frontend**: React with TypeScript, Tailwind CSS, and shadcn/ui components. Uses Vite for build.
- **Backend**: Express.js with TypeScript. Uses esbuild for build.
- **Database**: PostgreSQL, managed with Drizzle ORM, storing comprehensive senior living data including pricing history and verification logs.
- **Authentication**: Custom system with email/password, social login (Google, Facebook), and Replit Auth.
- **Comprehensive Search System**: A Zillow-level search engine handles all search types (companies, locations, prices, care types, natural language), with smart intent detection, real-time suggestions, and dynamic autocomplete. Integrated with 32,970+ authentic communities.
- **Self-Healing Discovery Mode**: An intelligent database enrichment system that automatically activates when searches return zero results. The Discovery Mode uses Perplexity AI to find real communities matching the search, then permanently saves them to the database via `DiscoveredCommunityService`. This creates a self-improving system where each failed search makes future searches better. The flow: Normal Search → If 0 results → Discovery Mode activates → AI finds communities → Saves to database → Next search finds them normally. This elegant architecture ensures the database continuously fills its own gaps without manual intervention.
- **AI Integration**: A Perplexity-first approach for web scraping and verification, with Claude and ChatGPT as fallbacks. Provides detailed comparative analysis, market trends, and personalized recommendations. AI personalization ensures empathetic interactions. The database features a self-healing architecture.
- **Payment System**: Integrated dual payment system supporting Stripe Checkout Sessions and Payment Element.
- **Messaging System**: Real-time infrastructure operational with WebSocket support for family groups, user-to-user, and community broadcast messaging. Email notifications via SendGrid.
- **Admin Dashboard**: A consolidated super admin dashboard (`/admin-mega-dashboard`) with natural language processing, predictive search, and multi-AI orchestration. Supports dual subscription tiers and RBAC.
- **Key Features**: Interactive Map System with AI analysis, AI-Powered Semantic Search, Transparent Pricing (HUD-verified and AI-verified), Comprehensive Community Profiles, Family Collaboration tools, Senior Vendor Marketplace, Senior Living News & Research section with real crisis data and citations, notification and in-app messaging, an onboarding wizard with AI character guidance, robust photo handling, and full bilingual functionality (French/English). TourMate™ Tour Scheduling System and One-Touch Emergency Contact System. Legal Document Version Control System and Availability Heatmap System.
- **UI/UX Decisions**: Clean, modern aesthetic with cosmic imagery and default dark mode. Consistent design, horizontal sliders, AI-generated product imagery. Search results display in a vertical "rolodex" style with regional theming. Compact design with reduced font sizes. Transparent navbar with gradient text. Prominent trust indicators. Engaging loading screen with custom Valet Gentleman character and "Did you know..." facts. Hero section features a HeroMascotPanel with rotating platform messages. Loading/error screens feature Rodin's The Thinker statue in cosmic space.
- **Performance Optimization**: Advanced caching, database query analysis, automated index creation, real-time metrics monitoring.
- **Photo Management**: Complete implementation with validation, CDN optimization, quality scoring, source attribution, and database logging.
- **Senior Living News & Research Section**: Real-time transparency section on home page sharing critical information with families including: $131,583/year nursing home costs, 520,000+ seniors on housing waitlists, 53 million caregiver burden crisis, Senate investigation of fake reviews, FTC $52,000 fines for deceptive practices. All data cited from authoritative sources (KFF Health News, HUD.gov, Washington Post, Senate Committee on Aging, FTC 2024-2025).
- **Automated Frontend Testing**: Jest + React Testing Library with 85% coverage target for critical components.

## Data Verification Progress (Launch Ready)
**Texas Verification Status**:
- **Total Communities**: 3,695 (cleaned of generic placeholders)
- **Web Verified**: 114 communities with real addresses, phones, websites
- **Major Cities Coverage**:
  - Houston: 8 verified (Brazos Towers, Parkway Place, etc.)
  - Dallas: 3 verified (CC Young, Belmont Village, etc.)
  - San Antonio: 14 verified (The Village at Incarnate Word, etc.)
  - Austin: 10 verified (Westminster, Tech Ridge Oaks, etc.)
  - Fort Worth: 10 verified (Sunrise, The Harrison, etc.)
  - El Paso: 24 verified (35% coverage)
  - Arlington: 18 verified (69% coverage)
  - Plano: 13 verified (Prestonwood Court, etc.)
  - Irving: 14 verified (48% coverage)
- **Data Quality Improvements**: Removed 123 generic placeholders, 13 wrong-state entries
- **Self-Healing Active**: Discovery Mode automatically fills remaining gaps

## External Dependencies
- **Database Connectivity**: `@neondatabase/serverless`
- **ORM**: `drizzle-orm`
- **State Management**: `@tanstack/react-query`
- **Routing**: `wouter`
- **UI Libraries**: `@radix-ui/*`, `tailwindcss`, `lucide-react`
- **Mapping**: `react-leaflet`
- **AI Integrations**:
  - **Perplexity (Primary)**: For real-time web search, verification, and market data (using `sonar-pro` model).
  - **Claude (Secondary)**: For advanced reasoning, complex analysis, and care planning.
  - **ChatGPT (Backup)**: For general purpose fallback and validation.
- **Email Service**: SendGrid
- **Payment Processing**: Stripe
- **Document Signing**: Documenso