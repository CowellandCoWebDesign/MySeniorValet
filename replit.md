# MySeniorValet - Senior Living Community Transparency Platform

## Overview
MySeniorValet is a comprehensive senior living transparency platform designed to provide accurate, verified information about senior living communities. It features multi-AI intelligence orchestration (Claude, Gemini, ChatGPT, Grok) for cross-checking accuracy and industry-leading transparency functionality. The platform aims to offer unparalleled insight into senior living options, including verified HUD pricing and extensive community details.

## User Preferences
- **Authentication Priority**: William.cowell01@gmail.com requires super admin access. Platform configured for production Replit Auth integration.
- **Data Integrity Standards**: Maintain strict Golden Data Rule enforcement. HUD properties show verified government pricing only. Communities without verified pricing display "Contact for pricing." Multi-AI verification system for absolute accuracy.
- **Documentation Preferences**: Keep documentation clean and consolidated. Remove outdated files to prevent confusion. Focus on current operational status over historical details.
- **Visual Design Preferences**: Hero image should be a beautiful space/astronomy image (https://cdn.pixabay.com/photo/2016/11/29/05/45/astronomy-1867616_1280.jpg). The user specifically prefers cosmic space imagery over senior living villa photos, symbolizing infinite possibilities in senior living.
- **Critical Branding Rule**: NEVER USE "TRUEVIEW" - The brand name is MySeniorValet. All references to "TrueView" must be replaced with "MySeniorValet".
- **Single Home Page Rule**: The primary home page is `client/src/pages/myseniorvalet-home.tsx` (VERSION 3). DO NOT create or use `home.tsx`. All home page edits must target `myseniorvalet-home.tsx`. Root path "/" routes to MySeniorValetHome component only.
- **Golden Data Rule**: Zero tolerance for synthetic, mock, sample, or placeholder data. All data must come from verified authentic sources.

## System Architecture
The platform is built with a modern web stack.
- **Frontend**: React with TypeScript, styled using Tailwind CSS and shadcn/ui components.
- **Backend**: Express.js with TypeScript.
- **Database**: PostgreSQL, managed with Drizzle ORM.
- **Build System**: Vite for the frontend and esbuild for the backend.
- **Authentication**: Replit Auth with role-based access control for secure user and admin access.
- **Key Features**: Interactive Map System with AI analysis, AI-Powered Search with multi-AI verification, Transparent Pricing including HUD-verified data, Comprehensive Community Profiles, Unified Admin Dashboard with role-based access, Family Collaboration features for tour tracking and sharing, and a Vendor Marketplace for service providers.
- **UI/UX Decisions**: Emphasizes a clean, modern aesthetic with specific preference for cosmic imagery on the homepage. Consistent design elements are applied across features like horizontal sliders for services and products. AI-generated product imagery is used for legal compliance and visual appeal.
- **System Design**: Features a robust services management system with a 5-table database architecture. Implements a subscription tier system for access control (Free, Featured Spotlight, Premium Tools, Platinum Partner). Includes an automated testing infrastructure for code quality.

## External Dependencies
- **Database Connectivity**: `@neondatabase/serverless`
- **ORM**: `drizzle-orm`
- **State Management**: `@tanstack/react-query`
- **Routing**: `wouter`
- **UI Libraries**: `@radix-ui/*`, `tailwindcss`, `lucide-react`
- **Mapping**: `react-leaflet`
- **AI Integrations**: `@anthropic-ai/sdk` (Claude), `@google/genai` (Gemini), `openai` (ChatGPT), `Perplexity API`, `XAI integration` (Grok infrastructure ready).
- **Email Service**: SendGrid for notifications and confirmations.