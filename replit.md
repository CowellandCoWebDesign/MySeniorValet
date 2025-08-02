# MySeniorValet - Senior Living Community Transparency Platform

## Overview
MySeniorValet is a comprehensive senior living transparency platform designed to provide accurate, verified information about senior living communities. It features multi-AI intelligence orchestration (Claude, Gemini, ChatGPT, Grok) for cross-checking accuracy and industry-leading transparency functionality. The platform aims to offer unparalleled insight into senior living options, including verified HUD pricing and extensive community details. 

**Current Database Status**: 34,171 communities (as of August 1, 2025) - Complete Canadian expansion achieved! Now includes 24 Canadian communities across all 13 provinces and territories with bilingual French/English support. Platform offers true North American coverage. Database includes mobile home parks, manufactured home communities, 55+ active adult communities, and traditional assisted living facilities. U.S. expansion includes: Ohio (720), Pennsylvania (74), Texas (1,450), South Carolina (46), Arkansas (75), Oklahoma (77), Alaska (29), Kansas (420), Maine (16), New Hampshire (10), Vermont (14), Alabama (2), Georgia (5), Louisiana (1), Mississippi (15), Tennessee (21), Delaware (4), Rhode Island (6), Massachusetts (35), Washington (132), Wyoming (48), Nevada (166), Arizona (252), Colorado (157), Oregon (122), Idaho (251), Utah (78), New Mexico (85). Canadian coverage: BC (2), AB (2), SK (2), MB (2), ON (2), QC (2), NB (3), NS (2), PE (2), NL (2), YT (1), NT (1), NU (1). 10 communities offer bilingual services.

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

## Recent Changes (August 2, 2025)
- **Photo Handling System Implementation with ChatGPT Partner Dispatch**:
  - Created MissingPhotosPanel component displaying placeholder image with "Photos Pending — Not Verified" badge
  - Built community contribution page at `/community/:id/contribute` for users to submit photos and information
  - Implemented `POST /api/community/contribute` endpoint storing submissions in audit logs
  - Integrated MissingPhotosPanel into both Hero Photo Carousel and Photos tab on community detail pages
  - Added transparency messaging encouraging real user contributions to unlock community listings
  - Created comprehensive automated testing documentation covering all components and data flow
  - System handles missing photos by showing informative panel explaining what's missing and how to help
- **Playful Onboarding Wizard with Character-Driven Guidance**:
  - Created comprehensive OnboardingWizard component with 3 AI characters (Sage, Compass, Heart) providing personalized guidance
  - Built OnboardingContext provider for managing onboarding state with localStorage persistence
  - Implemented 6-step wizard flow: Welcome → Personal Info → Care Needs → Budget → Preferences → Complete
  - Added PersonalizedBanner component showing customized content based on onboarding preferences
  - Created usePersonalizedContent hook for dynamic content personalization throughout the platform
  - Integrated character-driven storytelling with step-specific guidance and personality-driven responses
  - Built preference collection for location, care types, budget range, timeline, and contact preferences
  - Added automatic onboarding display for new users with 2-second delay on homepage
  - Implemented personalized greeting, search placeholders, and budget recommendations based on user data
  - Created seamless integration with existing MySeniorValet homepage and navigation system
- **In-App Messaging System Implementation**:
  - Created comprehensive vendor messaging system with real-time communication capabilities
  - Built vendor_conversations, vendor_conversation_participants, and vendor_messages tables for message storage
  - Implemented messaging API endpoints for creating conversations, sending messages, marking as read, and managing conversation status
  - Created VendorMessaging component with conversation list, message thread view, and new conversation dialog
  - Added ContactVendorButton component for customers to easily reach out to vendors from community pages
  - Integrated messaging tab into vendor dashboard with unread message count and priority indicators
  - Support for different conversation types: vendor_support, customer_vendor, and admin_support
  - Message threading with read status tracking and conversation management features
- **Legal Protection & Vendor Onboarding Enhancement**: 
  - Transformed removal request section into positive vendor onboarding opportunity
  - Created comprehensive RemovalRequestModal component with database storage
  - Implemented audit_logs and removal_requests tables for compliance tracking
  - Built API endpoints for handling removal requests with proper validation
  - Redesigned homepage section: "Are You a Vendor Who Would Like to Be Listed on Our Platform?"
  - Added benefits grid showcasing: 34,000+ community reach, analytics, verified partner badge, targeted audience
  - Included legal disclaimer: "These listings are curated for convenience only. Inclusion does not imply endorsement or affiliation unless marked as 'Official Partner.'"
  - Subtle removal option in collapsible details section with claim listing option
- **Vendor Signup & Payment System**: 
  - Implemented complete vendor registration flow with Stripe payment processing
  - Created vendor-signup.tsx with tiered pricing plans (Basic $49, Professional $149, Enterprise $299)
  - Built vendor_registrations database table for subscription management
  - Integrated Stripe subscription API for recurring monthly billing
  - Created vendor-welcome.tsx confirmation page with next steps guidance
  - Added webhook endpoints for payment confirmation and subscription management
  - Homepage "Become a Verified Partner" button now functional with payment flow
- **International Expansion - Canada Added**: Successfully expanded MySeniorValet to Canada with 24 communities across all 13 provinces and territories. Platform now covers North America (USA + Canada) with 34,171 total communities
- **Enhanced Bilingual Support**: 
  - Implemented comprehensive French/English language switching with persistent preferences
  - Created LanguageContext with extensive translation dictionary
  - Added language switcher component to navigation
  - Built dedicated Canadian statistics dashboard showing bilingual distribution
  - Created specialized bilingual community cards with dual-language content
  - Set up Canadian-specific API routes for filtering and stats
  - 10 communities offer full bilingual services (French/English)
- **Final Spectrum Integration Completed**: Successfully implemented Ghost dispatch expanding housing type coverage to full senior housing continuum
- **Database Expansion**: Dramatically expanded from 25,376 to 34,171 communities - added 8,795 new communities including mobile home parks, manufactured home communities, 55+ active adult communities, RV retirement parks, and Canadian senior living facilities
- **Schema Enhancement**: Upgraded communitySubtype field to comprehensive enum with 13 housing types: HUD senior housing, mobile parks, active adult, independent living, assisted living, memory care, board & care, skilled nursing, VA housing, unlicensed housing, manufactured homes, RV parks, and senior cooperatives
- **Frontend Updates**: 
  - Community cards now display color-coded housing type badges with unique emojis for each type
  - Super admin dashboard shows full housing type distribution breakdown
  - Enhanced community filter panel supports all new housing types with proper hierarchy (HUD lowest cost to Skilled Nursing highest care)
  - HUD filter now shows "🏷️ Income-Qualified | HUD Verified" badge as specified
  - Added platform promise message: "Not all senior housing requires a six-figure budget. MySeniorValet shows everything — from $0 HUD properties to full-service memory care."
  - Community detail pages now show "Claim This Community Now" button instead of email verification
  - Implemented Care Spectrum Slider component - interactive UI for exploring housing types from lowest cost (HUD) to highest care (Skilled Nursing)
  - Created dedicated Canada page (/canada) - Canadian-focused homepage version with Canadian communities, vendors, care services, and resources
  - Canadian expansion showcase section on homepage with bilingual features (View All link now navigates to Canada page)
- **Platform Scope**: Achieved 34,171 communities covering full North American senior housing spectrum (USA + Canada)

## External Dependencies
- **Database Connectivity**: `@neondatabase/serverless`
- **ORM**: `drizzle-orm`
- **State Management**: `@tanstack/react-query`
- **Routing**: `wouter`
- **UI Libraries**: `@radix-ui/*`, `tailwindcss`, `lucide-react`
- **Mapping**: `react-leaflet`
- **AI Integrations**: `@anthropic-ai/sdk` (Claude), `@google/genai` (Gemini), `openai` (ChatGPT), `Perplexity API`, `XAI integration` (Grok infrastructure ready).
- **Email Service**: SendGrid for notifications and confirmations.