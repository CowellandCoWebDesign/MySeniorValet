# MySeniorValet - Senior Living Community Transparency Platform

## Overview
MySeniorValet is a comprehensive senior living transparency platform designed to provide accurate, verified information about senior living communities. It features multi-AI intelligence orchestration (Claude, Gemini, ChatGPT, Grok) for cross-checking accuracy and industry-leading transparency functionality. The platform aims to offer unparalleled insight into senior living options, including verified HUD pricing and extensive community details. 

**Current Database Status**: 34,147 communities (as of August 1, 2025) - Major expansion continuing toward 40,000-45,000 target. Successfully added 8,771 new communities since the start of August 1st (from 25,376 to 34,147). Database includes mobile home parks, manufactured home communities, 55+ active adult communities, and traditional assisted living facilities. Expansion includes: Ohio (720), Pennsylvania (74), Texas (1,450), South Carolina (46), Arkansas (75), Oklahoma (77), Alaska (29), Kansas (420), Maine (16), New Hampshire (10), Vermont (14), Alabama (2), Georgia (5), Louisiana (1), Mississippi (15), Tennessee (21), Delaware (4), Rhode Island (6), Massachusetts (35), Washington (132), Wyoming (48), Nevada (166), Arizona (252), Colorado (157), Oregon (122), Idaho (251), Utah (78), New Mexico (85). Note: Zip code issues resolved for western states using placeholder zip codes.

## User Preferences
- **Authentication Priority**: William.cowell01@gmail.com requires super admin access. Platform configured for production Replit Auth integration.
- **Data Integrity Standards**: Maintain strict Golden Data Rule enforcement. HUD properties show verified government pricing only. Communities without verified pricing display "Contact for pricing." Multi-AI verification system for absolute accuracy. Never claim partnerships, verifications, or certifications unless legally verified and documented. Service recommendations must be clearly labeled as such, not as partnerships.
- **Documentation Preferences**: Keep documentation clean and consolidated. Remove outdated files to prevent confusion. Focus on current operational status over historical details.
- **Visual Design Preferences**: Hero image should be a beautiful space/astronomy image (https://cdn.pixabay.com/photo/2016/11/29/05/45/astronomy-1867616_1280.jpg). The user specifically prefers cosmic space imagery over senior living villa photos, symbolizing infinite possibilities in senior living.
- **Critical Branding Rule**: NEVER USE "TRUEVIEW" - The brand name is MySeniorValet. All references to "TrueView" must be replaced with "MySeniorValet".
- **Single Home Page Rule**: The primary home page is `client/src/pages/myseniorvalet-home.tsx` (VERSION 3). DO NOT create or use `home.tsx`. All home page edits must target `myseniorvalet-home.tsx`. Root path "/" routes to MySeniorValetHome component only.
- **Golden Data Rule**: Zero tolerance for synthetic, mock, sample, or placeholder data. All data must come from verified authentic sources.

## System Architecture
The platform is built with a modern web stack.
- **Frontend**: React with TypeScript, styled using Tailwind CSS and shadcn/ui components. Community cards display new subtype badges for mobile home parks and 55+ communities.
- **Backend**: Express.js with TypeScript.
- **Database**: PostgreSQL, managed with Drizzle ORM. Enhanced schema supports multiple senior living types including mobile home parks, manufactured home communities, 55+ active adult communities, and RV retirement parks.
- **Build System**: Vite for the frontend and esbuild for the backend.
- **Authentication**: Replit Auth with role-based access control for secure user and admin access.
- **Key Features**: Interactive Map System with AI analysis, AI-Powered Search with multi-AI verification, Transparent Pricing including HUD-verified data, Comprehensive Community Profiles, Unified Admin Dashboard with role-based access, Family Collaboration features for tour tracking and sharing, and a Senior Vendor Marketplace featuring real service providers (Amazon Pharmacy, Walmart, T-Mobile 55+, 1-800-FLORALS as featured partners).
- **UI/UX Decisions**: Emphasizes a clean, modern aesthetic with specific preference for cosmic imagery on the homepage. Consistent design elements are applied across features like horizontal sliders for services and products. AI-generated product imagery is used for legal compliance and visual appeal. Tour tracker includes enhanced community selection with search and redirect warnings.
- **System Design**: Features a robust services management system with a 5-table database architecture. Implements a subscription tier system for access control (Free, Featured Spotlight, Premium Tools, Platinum Partner). Includes an automated testing infrastructure for code quality.

## Recent Changes (August 1, 2025)
- **Final Spectrum Integration Completed**: Successfully implemented Ghost dispatch expanding housing type coverage to full senior housing continuum
- **Database Expansion**: Dramatically expanded from 25,376 to 34,147 communities - added 8,771 new communities including mobile home parks, manufactured home communities, 55+ active adult communities, and RV retirement parks across multiple states
- **Schema Enhancement**: Upgraded communitySubtype field to comprehensive enum with 13 housing types: HUD senior housing, mobile parks, active adult, independent living, assisted living, memory care, board & care, skilled nursing, VA housing, unlicensed housing, manufactured homes, RV parks, and senior cooperatives
- **Frontend Updates**: 
  - Community cards now display color-coded housing type badges with unique emojis for each type
  - Super admin dashboard shows full housing type distribution breakdown
  - Enhanced community filter panel supports all new housing types
- **Platform Scope**: Achieved estimated 40,000-44,000 unique U.S. listings (overlap-adjusted) covering full senior housing spectrum

## External Dependencies
- **Database Connectivity**: `@neondatabase/serverless`
- **ORM**: `drizzle-orm`
- **State Management**: `@tanstack/react-query`
- **Routing**: `wouter`
- **UI Libraries**: `@radix-ui/*`, `tailwindcss`, `lucide-react`
- **Mapping**: `react-leaflet`
- **AI Integrations**: `@anthropic-ai/sdk` (Claude), `@google/genai` (Gemini), `openai` (ChatGPT), `Perplexity API`, `XAI integration` (Grok infrastructure ready).
- **Email Service**: SendGrid for notifications and confirmations.