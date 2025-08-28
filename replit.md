# MySeniorValet - Senior Living Community Transparency Platform

## Overview
MySeniorValet is a $50M AI-powered "Google of Senior Care" platform with living, self-aware intelligence capabilities. The platform features a unified AI search engine that consolidates 10+ search interfaces into one superintelligent system with natural language processing, predictive search, and multi-AI orchestration (Perplexity, Claude, ChatGPT). It provides complete care spectrum education, real pricing without paywalls, and tools for saving and sharing research. Key capabilities include the TourMate™ tour scheduling system, One-Touch Emergency Contact Shortcut, trilingual support (English, French, Spanish), and self-healing mechanisms with enterprise infrastructure. The platform represents "The Dawn of Transparency in Senior Living" with neural network architecture and autonomous decision-making capabilities.

### Recent Changes (August 28, 2025)
- **Hero Section Stabilized**: Hero section now remains completely static during search - full viewport height maintained, no text movement or disappearing elements
- **Unified Search Implemented**: True unified search across all content types (Communities, Services, Healthcare, Resources) with proper filtering
- **Filter Tab Functionality**: All tabs now display actual filtered results instead of "coming soon" placeholders, with accurate count badges
- **Search Behavior Updated**: Search now only triggers on Enter key or Search button click (not automatically while typing)
- **Community Cards Simplified**: Removed Reviews & Ratings and Inspections sections for cleaner card layout
- **Performance Improved**: Removed sliding animations and complex state transforms for faster, more reliable user experience
- **Search Accuracy Fixed**: Improved intent detection to recognize city names directly (e.g., "Redding" now correctly returns Redding, CA communities)
- **Location Matching Enhanced**: Database search now properly handles both single cities and "City, State" formats with exact matching prioritization
- **Backend Optimized**: Fixed all price field references (roomAndBoard → rentPerMonth), disabled broken web search, search response time reduced to ~500ms
- **Pricing Display Fixed**: Corrected HUD pricing display issue showing $33,500/mo instead of $335/mo by using parseFloat instead of parseInt

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
- **Frontend**: React with TypeScript, Tailwind CSS, and shadcn/ui components. Features include community cards, interactive Care Spectrum Slider, dynamic occupancy displays, circular map pins with bold borders, and full dark mode support. Responsive design uses modern CSS techniques.
- **Backend**: Express.js with TypeScript.
- **Database**: PostgreSQL, managed with Drizzle ORM, storing comprehensive senior living data including pricing history and verification logs.
- **Build System**: Vite for frontend, esbuild for backend.
- **Authentication**: Custom system with email/password, social login (Google, Facebook), and Replit Auth.
- **Key Features**: Interactive Map System with AI analysis, AI-Powered Semantic Search, Transparent Pricing (HUD-verified and AI-verified), Comprehensive Community Profiles, Unified Admin Dashboard, Family Collaboration tools, Senior Vendor Marketplace, notification and in-app messaging, an onboarding wizard with AI character guidance, and robust photo handling. Full bilingual functionality (French/English). TourMate™ Tour Scheduling System. One-Touch Emergency Contact System.
- **UI/UX Decisions**: Clean, modern aesthetic with cosmic imagery and default dark mode. Consistent design, horizontal sliders, AI-generated product imagery. Search results display in a vertical "rolodex" style with regional theming. Content organization uses distinct visual theming. Compact design with reduced font sizes. Transparent navbar with gradient text. Prominent trust indicators. Engaging loading screen with custom Valet Gentleman character and "Did you know..." facts. Hero section features a HeroMascotPanel with rotating platform messages.
- **System Design**: Supports dual subscription tiers. Dashboard separation for user analytics, business features, and unified super admin analytics with RBAC. Dual pricing display. Dynamic scaling cost controls for API calls with regional caching and batch processing. Robust pricing extraction supports various formats. Utilizes a unified search engine with intent detection, multi-source fusion, and self-learning algorithms. Data standardization and AI enrichment implemented for high data quality.
- **Payment System**: Integrated dual payment system supporting Stripe Checkout Sessions and Payment Element.
- **Search & Navigation**: Simplified AI-powered semantic search with natural language queries. Live Market Intelligence section includes a 10-level care spectrum as an interactive 3D carousel. Healthcare search has enhanced map filtering and color-coded hospital cards. AI Search Interface maintains a 3-row layout for amenities/care services, distance/price sliders, and Complete Care Spectrum types. Unified autocomplete across all search pages. Intelligent search architecture includes exact match, alias variations, parent company search, and address-based fallbacks, with fuzzy search integration for misspellings.
- **AI Deep Analysis**: Provides detailed comparative analysis (price comparisons, value leaders, HUD affordable options, neighborhood insights, care type matching, personalized recommendations). Generates market trends and actionable advice. AI personalization ensures empathetic interactions. "What We Found About [Community Name]" section focuses exclusively on specific community details from web searches, filtering generic information. Multi-AI verification service prioritizes official website pricing at 95% confidence. Structured responses for reliable data extraction. The intelligence system follows a Perplexity-first approach, directly scraping official websites for photos and pricing if an exact match is found, with a fallback to search surrounding areas only if needed. Every discovered community is automatically saved to the database with comprehensive contact information. On-demand AI enrichment reduces costs while ensuring fresh information. The database features a self-healing architecture that automatically detects and corrects data issues, removes duplicates, and improves quality with each user interaction.
- **Onboarding System**: Users can sign up with pre-filled preferences. Community creators have a comprehensive tutorial system with AI character guidance, a 7-step walkthrough, form validation, and seamless payment integration.
- **Legal Document Version Control System**: Enterprise-level system with complete version history, integrity checks, audit trails, GDPR/CCPA compliance, document status management, and a professional frontend interface.
- **Availability Heatmap System**: Public and enhanced admin versions available.
- **Performance Optimization System**: Comprehensive performance enhancement with advanced caching, database query analysis, automated index creation, real-time metrics monitoring, and admin dashboard.
- **Photo Management System**: Complete implementation with validation, CDN optimization, quality scoring, source attribution, and database logging.
- **Automated Frontend Testing**: Jest + React Testing Library with 85% coverage target, including unit and integration tests for critical components and user journeys.

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