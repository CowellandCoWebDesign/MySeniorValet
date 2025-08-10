# MySeniorValet - Senior Living Community Transparency Platform

## Overview
MySeniorValet is a technology platform that connects families with publicly available information about over 34,000 senior living communities in the U.S. and Canada. It serves as a facilitator, providing access to existing public resources through advanced AI orchestration systems that gather, organize, and present information from the internet. The platform aims to bring transparency to the senior living market by enabling access to verified HUD pricing and other public information. Its business vision is to empower families with authentic, verified data to make informed decisions about senior living, addressing a critical need for transparency in this market.

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
- **Frontend**: React with TypeScript, Tailwind CSS, and shadcn/ui components. Features include community cards with subtype badges, an interactive Care Spectrum Slider, and dynamic occupancy displays with color-coded status indicators.
- **Backend**: Express.js with TypeScript.
- **Database**: PostgreSQL, managed with Drizzle ORM, supporting multiple senior living types and a robust services management system with a 5-table architecture.
- **Build System**: Vite for the frontend and esbuild for the backend.
- **Authentication**: Replit Auth with role-based access control.
- **Key Features**: Interactive Map System with AI analysis, AI-Powered Search with multi-AI verification, Semantic Search capabilities with natural language understanding, Transparent Pricing (HUD-verified data), Comprehensive Community Profiles, Unified Admin Dashboard, Family Collaboration tools, and a Senior Vendor Marketplace. Includes comprehensive notification and in-app messaging, an onboarding wizard with AI character guidance, and a robust photo handling system. Full bilingual functionality (French/English) is supported.
- **UI/UX Decisions**: Emphasizes a clean, modern aesthetic with cosmic imagery. Dark mode is default. Consistent design elements include horizontal sliders and AI-generated product imagery. Map markers feature compact pins with color-coded pricing status (green for live/verified, red for contact-only) and care level emojis. Search results are displayed in a vertical scrolling "rolodex" style with regional theme styling.
- **System Design**: Supports dual subscription tier systems for communities and vendors. Community tiers range from Verified Listing ($0/month) to Platinum ($349/month). Vendor tiers range from Basic ($99/month) to National Partner ($499/month).
- **Dashboard Separation**: User dashboards display personalized journey analytics. Business features (e.g., DocuSign, payment processing) are contextual. Admin dashboards are consolidated into a unified super admin analytics center with RBAC.
- **Payment System**: Integrated dual payment system supporting Stripe Checkout Sessions and Payment Element for mobile-optimized, on-platform payment experiences. Handles vendor upgrades and promotional pricing.
- **Search & Navigation**: Simplified AI-powered search with semantic understanding and natural language queries. Live Market Intelligence section integrates the 7-level care spectrum from HUD-Sponsored Housing to Skilled Nursing. Healthcare search includes enhanced map filtering and color-coded hospital cards with CMS ratings. "Perfect Match" functionality has been removed.
- **AI Deep Analysis**: Provides detailed comparative analysis including price comparisons, value leaders, HUD affordable options, neighborhood insights, care type matching, and personalized recommendations. Generates comprehensive market trends and actionable advice. AI personalization ensures empathetic and context-aware interactions.
- **Onboarding System**: Users can sign up with preferences pre-filled from onboarding data. Community creators have a comprehensive tutorial system with AI character guidance, a 7-step walkthrough, full onboarding form validation, and seamless payment integration.
- **Legal Document Version Control System**: Enterprise-level system with complete version history tracking, SHA-256 integrity checking, comprehensive audit trails, GDPR/CCPA compliance, document status management, and a professional frontend interface at /legal-document-history.
- **Availability Heatmap System**: Public version at `/availability-heatmap` and an enhanced admin version at `/admin/availability-heatmap` with detailed analytics overlays.
- **AI Search Interface Layout**: Maintains a 3-row structure with enhanced mobile responsiveness: Row 1 - Amenities/Care Services and Unit/Room Type selections, Row 2 - Flattened inline distance and price sliders with availability toggle, Row 3 - Complete Care Spectrum types.
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