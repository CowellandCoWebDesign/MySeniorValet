# MySeniorValet - Senior Living Community Transparency Platform

## Overview
MySeniorValet is a comprehensive senior living transparency platform providing accurate, verified information about senior living communities. It utilizes multi-AI intelligence orchestration (Claude, Gemini, ChatGPT, Grok) for cross-checking accuracy, offering unparalleled insight into senior living options, including verified HUD pricing. The platform has achieved North American coverage, encompassing 34,171 communities across the U.S. and Canada, including mobile home parks, manufactured home communities, 55+ active adult communities, and traditional assisted living facilities.

## User Preferences
- **Authentication Priority**: William.cowell01@gmail.com requires super admin access. Platform configured for production Replit Auth integration.
- **Notification Email Configuration**:
  - Super Admin Primary: William.cowell01@gmail.com (private)
  - Super Admin Backup: CowellandCoWebDesign@gmail.com (private)
  - Onboarding Team: hello@myseniorvalet.com (public)
  - Billing Team: billing@myseniorvalet.com (public)
  - Super admin receives all critical system alerts, security notifications, and platform milestones
- **Data Integrity Standards**: Maintain strict Golden Data Rule enforcement. HUD properties show verified government pricing only. Communities without verified pricing display "Contact for pricing." Multi-AI verification system for absolute accuracy. Never claim partnerships, verifications, or certifications unless legally verified and documented. Service recommendations must be clearly labeled as such, not as partnerships.
- **Documentation Preferences**: Keep documentation clean and consolidated. Remove outdated files to prevent confusion. Focus on current operational status over historical details.
- **Visual Design Preferences**: Hero image should be a beautiful space/astronomy image (https://cdn.pixabay.com/photo/2016/11/29/05/45/astronomy-1867616_1280.jpg). The user specifically prefers cosmic space imagery over senior living villa photos, symbolizing infinite possibilities in senior living.
- **Critical Branding Rule**: NEVER USE "TRUEVIEW" - The brand name is MySeniorValet. All references to "TrueView" must be replaced with "MySeniorValet".
- **Single Home Page Rule**: The primary home page is `client/src/pages/myseniorvalet-home.tsx` (VERSION 3). DO NOT create or use `home.tsx`. All home page edits must target `myseniorvalet-home.tsx`. Root path "/" routes to MySeniorValetHome component only.
- **Golden Data Rule**: Zero tolerance for synthetic, mock, sample, or placeholder data. All data must come from verified authentic sources.

## System Architecture
The platform is built with a modern web stack designed for transparency and user engagement.
- **Frontend**: React with TypeScript, using Tailwind CSS and shadcn/ui components. Features include community cards with subtype badges and an interactive Care Spectrum Slider.
- **Backend**: Express.js with TypeScript.
- **Database**: PostgreSQL, managed with Drizzle ORM, supporting multiple senior living types and a robust services management system.
- **Build System**: Vite for the frontend and esbuild for the backend.
- **Authentication**: Replit Auth with role-based access control.
- **Key Features**: Interactive Map System with AI analysis, AI-Powered Search with multi-AI verification, Transparent Pricing (including HUD-verified data), Comprehensive Community Profiles, Unified Admin Dashboard, Family Collaboration tools, and a Senior Vendor Marketplace.
- **UI/UX Decisions**: Emphasizes a clean, modern aesthetic with cosmic imagery. Consistent design elements include horizontal sliders and AI-generated product imagery for compliance. The system incorporates an automated testing infrastructure.
- **System Design**: Features a 5-table database architecture for services management, dual subscription tier systems:
  - **Community Tiers** - OFFICIAL PRICING:
    - Verified Listing: Free (1 photo, edit contact info, tour scheduling if email verified)
    - Standard: $149/month (10 photos, 1 PDF, respond to reviews, basic analytics)
    - Featured: $249/month (25 photos, 1 video, 3 PDFs, in-app messaging, featured placement)
    - Platinum: $349/month (50 photos, 3 videos, unlimited PDFs, staff bios, monthly performance call)
  - **Vendor Tiers** - CRITICAL PRICING:
    - Basic Listing: $99/month (1 regional zip cluster, no photos/branding, $25 verification badge add-on)
    - Featured Vendor: $249/month (5 regional areas, logo/branding, featured placement, basic analytics) 
    - National Partner: $499/month (nationwide coverage, banner rotation, dedicated profile page, quarterly reports)
    - Enterprise: $999+/month (custom pricing, exclusive category access, co-branding, revenue share options)
  Includes comprehensive notification and in-app messaging systems, onboarding wizard with AI character guidance, and robust photo handling system. The platform supports full bilingual functionality (French/English).
- **Dashboard Separation**: User dashboard shows personalized journey analytics (saved communities, tours, search patterns). Business features (DocuSign, payment processing) are reserved for platinum-tier communities only and shown contextually on community pages, not in user dashboards.
- **Subscription Enforcement** (Added August 2, 2025): Platform-wide tier restrictions implemented across community dashboards, vendor marketplace, photo uploads, analytics access, and messaging features. All tier-gated features show upgrade prompts with SubscriptionUpgradeModal integration.

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