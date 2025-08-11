# MySeniorValet - Senior Living Community Transparency Platform

## Overview
MySeniorValet is a technology platform connecting families with publicly available information about over 34,000 senior living communities in the U.S. and Canada. It acts as a facilitator, using advanced AI orchestration to gather, organize, and present public information, including verified HUD pricing. The platform's vision is to empower families with authentic, verified data for informed decision-making in senior living, bringing much-needed transparency to the market.

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
- **Map Interface Preferences**: Legend button positioned on map at top-right (not in header). Map Layers control positioned 60px below Legend button. Heatmap toggle removed from interface to prevent UI overlap issues.

## Recent Updates (August 11, 2025)
- **AI Matching Assistant Enhancement**: Expanded from 4 care levels to complete 10-level care spectrum:
  1. HUD Housing (Subsidized) - $0-500/mo
  2. VA/Veterans Housing - $0-1k/mo
  3. Mobile Home & RV Parks - $400-1k/mo
  4. 55+ Active Communities - $1-3k/mo
  5. Independent Living - $2-4k/mo
  6. Board & Care Homes - $2.5-5k/mo
  7. Assisted Living - $3-6k/mo
  8. Memory Care - $4-8k/mo
  9. Continuing Care (CCRC) - $5-10k/mo
  10. Skilled Nursing - $6-12k/mo
  Care type mapping now handles all variants including lowercase, underscored, and space-separated formats

## Recent Launch Message Enhancement (August 10, 2025)
**"TODAY, EVERYTHING CHANGES" - Historic Platform Launch**
- Powerful narrative structure directly addressing industry darkness
- **The Darkness Section** confronts all pain points:
  * No Information Online - families searching desperately
  * Care Level Confusion - no understanding of care differences
  * "Contact for Pricing" - universal gatekeeping during crisis
  * Middleman Paywalls - $500+ charges for basic information
  * Endless Tours, No Records - nothing to show for hard work
  * Communities Hidden Too - great facilities lost in darkness
- **THIS STOPS NOW Section** presents platform solutions:
  * Complete Care Spectrum Education
  * Real Pricing, Real Availability
  * Zero Paywalls, 100% Free
  * Save & Share Research
  * Communities Shine Bright
  * Immediate Access to Everything
- Closing: "To every family searching in the dark: The lights are on now"
- Positions as "The Dawn of Transparency in Senior Living"

## System Architecture
The platform is built with a modern web stack, emphasizing transparency and user engagement.
- **Frontend**: React with TypeScript, Tailwind CSS, and shadcn/ui components. Features include community cards with subtype badges, an interactive Care Spectrum Slider, and dynamic occupancy displays with color-coded status indicators. Map pins are circular with bold colored borders (green for data, red for no data; red for emergency, orange for urgent care). Dark mode is fully supported for map tiles.
- **Backend**: Express.js with TypeScript.
- **Database**: PostgreSQL, managed with Drizzle ORM, supporting multiple senior living types and a robust services management system.
- **Build System**: Vite for the frontend and esbuild for the backend.
- **Authentication**: Replit Auth with role-based access control.
- **Key Features**: Interactive Map System with AI analysis, AI-Powered Search with multi-AI verification, Semantic Search capabilities, Transparent Pricing (HUD-verified data), Comprehensive Community Profiles, Unified Admin Dashboard, Family Collaboration tools, and a Senior Vendor Marketplace. Includes comprehensive notification and in-app messaging, an onboarding wizard with AI character guidance, and a robust photo handling system. Full bilingual functionality (French/English) is supported.
- **UI/UX Decisions**: Emphasizes a clean, modern aesthetic with cosmic imagery. Dark mode is default. Consistent design elements include horizontal sliders and AI-generated product imagery. Search results are displayed in a vertical scrolling "rolodex" style with regional theme styling. Content is organized with distinct visual theming for communities, hospitals (red/pink theme), vendors, and resources.
- **System Design**: Supports dual subscription tier systems for communities and vendors. Dashboard separation includes user analytics, contextual business features, and a unified super admin analytics center with RBAC.
- **Payment System**: Integrated dual payment system supporting Stripe Checkout Sessions and Payment Element for mobile-optimized, on-platform payments.
- **Search & Navigation**: Simplified AI-powered search with semantic understanding and natural language queries. Live Market Intelligence section integrates the 7-level care spectrum. Healthcare search includes enhanced map filtering and color-coded hospital cards. "Perfect Match" functionality has been removed. AI Search Interface maintains a 3-row layout for amenities/care services, distance/price sliders, and Complete Care Spectrum types.
- **AI Deep Analysis**: Provides detailed comparative analysis including price comparisons, value leaders, HUD affordable options, neighborhood insights, care type matching, and personalized recommendations. Generates comprehensive market trends and actionable advice. AI personalization ensures empathetic and context-aware interactions.
- **Onboarding System**: Users can sign up with preferences pre-filled from onboarding data. Community creators have a comprehensive tutorial system with AI character guidance, a 7-step walkthrough, full onboarding form validation, and seamless payment integration.
- **Legal Document Version Control System**: Enterprise-level system with complete version history, SHA-256 integrity checks, audit trails, GDPR/CCPA compliance, document status management, and a professional frontend interface at /legal-document-history.
- **Availability Heatmap System**: Public version at `/availability-heatmap` and an enhanced admin version at `/admin/availability-heatmap`.
- **Semantic Search Integration**: Weaviate-powered semantic search with natural language understanding. Features include toggle switch for semantic/traditional modes (semantic default), hybrid search, RAG-powered AI recommendations, natural language query support, visual match score indicators, and match explanation display. Endpoint: `/api/semantic/search`.

## External Dependencies
- **Database Connectivity**: `@neondatabase/serverless`
- **ORM**: `drizzle-orm`
- **State Management**: `@tanstack/react-query`
- **Routing**: `wouter`
- **UI Libraries**: `@radix-ui/*`, `tailwindcss`, `lucide-react`
- **Mapping**: `react-leaflet`
- **AI Integrations**: Priority-based multi-AI orchestration:
  1. **Perplexity (Primary)**: Real-time web search, verification of alternative sources, current pricing, market data.
  2. **Claude (Secondary)**: `@anthropic-ai/sdk` - Advanced reasoning, complex analysis, care planning, contract analysis.
  3. **ChatGPT (Backup)**: `openai` - General purpose fallback and validation.
- **Email Service**: SendGrid
- **Payment Processing**: Stripe
- **Document Signing**: Documenso (open-source, self-hosted)