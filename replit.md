## Overview
MySeniorValet is an AI-powered "Google of Senior Care" platform designed to bring transparency to senior living. It features a "Learn Mode" and a unified AI search engine. The platform provides comprehensive care spectrum education, real pricing without paywalls, and tools for saving and sharing research. Key capabilities include the TourMate™ tour scheduling system, One-Touch Emergency Contact Shortcut, trilingual support (English, French, Spanish), and self-healing mechanisms. The business model provides free platform access to families, with revenue generated from B2B clients.

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

**SEO Implementation (November 19, 2025)**:
- Server-side rendering for location-specific pages ensures search engines receive properly rendered HTML with location-specific titles
- Location pages use query-string URLs: `/ai-search-intelligence?location={city}-{state}&tab=simplified`
- Dynamic titles follow SEO best practices: "Senior Living in {City}, {State} | MySeniorValet" (all under 60 characters)
- Shared location SEO module (`shared/location-seo.ts`) provides consistent SEO metadata for both client and server
- SSR middleware detects search engine crawlers and serves pre-rendered HTML while maintaining SPA experience for regular users
- Sitemap generation includes thousands of city-specific URLs for comprehensive search coverage

**Technical Implementations**:
- **Frontend**: React with TypeScript, Tailwind CSS, and shadcn/ui components, using Vite.
- **Backend**: Express.js with TypeScript, using esbuild.
- **Database**: PostgreSQL, managed with Drizzle ORM, storing comprehensive senior living data.
- **Authentication**: Custom system with email/password, Google OAuth, and email verification on signup. Sessions use intelligent fallback (PostgreSQL for production, MemoryStore for development). Features include: secure password reset with verified email delivery, email verification tokens with 24-hour expiry and secure base URL generation, 2FA support (optional), and proper session persistence across deployments.
- **Comprehensive Search System**: A Zillow-level search engine handles various search types with intent detection, real-time suggestions, and dynamic autocomplete. Integrated with 32,970+ authentic communities.
- **Self-Healing Discovery Mode**: Automatically activates when searches return zero results, using Perplexity AI to find and save new communities to the database via `DiscoveredCommunityService`, ensuring continuous database enrichment.
- **AI Integration**: Perplexity-first for web scraping and verification; Claude and ChatGPT as fallbacks for analysis and recommendations.
- **Enhanced ChatKit (October 27, 2025)**: AI assistant now has full platform awareness with comprehensive knowledge base. Understands MySeniorValet searches the ENTIRE INTERNET globally (33,837+ communities across all countries). Features smart Discovery Mode triggers (only on zero results or explicit request for cost control), rich tool functions (search_communities, search_vendors, search_healthcare_providers, get_support_resources), enhanced community cards with photos/pricing/action buttons, and proper integration with global-discovery endpoint.
- **Payment System**: Integrated dual payment system supporting Stripe Checkout Sessions and Payment Element.
- **Messaging System**: Real-time infrastructure with WebSocket support for various messaging types; email notifications via SendGrid.
- **Admin Dashboard**: Consolidated super admin dashboard (`/admin-mega-dashboard`) with NLP, predictive search, and multi-AI orchestration.
- **Key Features**: Interactive Map System with AI analysis, AI-Powered Semantic Search, Transparent Pricing (HUD-verified and AI-verified), Comprehensive Community Profiles, Family Collaboration tools, Senior Vendor Marketplace, Senior Living News & Research section, notification and in-app messaging, an onboarding wizard, robust photo handling, bilingual functionality (French/English), TourMate™ Tour Scheduling System, One-Touch Emergency Contact System, Legal Document Version Control System, and Availability Heatmap System.
- **UI/UX Decisions**: Clean, modern aesthetic with cosmic imagery and default dark mode. Consistent design, horizontal sliders, AI-generated product imagery, vertical "rolodex" search results with regional theming, compact design with reduced font sizes, transparent navbar with gradient text, prominent trust indicators, engaging loading screen with custom Valet Gentleman character, and Rodin's The Thinker statue on loading/error screens.
- **Performance Optimization**: Advanced caching, database query analysis, automated index creation, real-time metrics monitoring.
- **Photo Management**: Complete implementation with validation, CDN optimization, quality scoring, source attribution, and database logging.
- **Senior Living News & Research Section**: Real-time transparency section on home page sharing critical information with families regarding costs, waitlists, caregiver burden, and regulatory issues, all cited from authoritative sources.
- **Automated Frontend Testing**: Jest + React Testing Library with 85% coverage target for critical components.

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