# TrueView - Senior Living Community Transparency Platform

## Overview

TrueView is a full-stack senior living community search platform that prioritizes pricing transparency, real-time availability, and trusted reviews. The platform helps families make informed decisions by providing comprehensive community information including amenities, services, medical restrictions, and verified review sources. Key features include interactive map visualization, detailed community profiles with availability tracking, and a claim system for community owners.

## System Architecture

The application follows a modern full-stack architecture with clear separation of concerns:

- **Frontend**: React-based SPA with TypeScript
- **Backend**: Express.js REST API server
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **Build System**: Vite for frontend, esbuild for backend
- **Development Environment**: Optimized for Replit with hot reloading

## Key Components

### Frontend Architecture
- **React Router**: Uses Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state and data fetching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **API Layer**: Express.js with TypeScript for REST endpoints
- **Database Layer**: Drizzle ORM with PostgreSQL dialect
- **Data Storage**: In-memory storage implementation with interface for future database integration
- **Web Scraping**: Planned scraping functionality for licensing data from state websites

### Database Schema
- **Users**: Authentication and user management
- **Communities**: Senior living facility information with comprehensive metadata
- **Inspections**: Inspection records with violation tracking and compliance data

### Key Features
- **Interactive Map**: Real-time map visualization with availability indicators and custom markers
- **Community Search**: Location-based search with filtering by care type, amenities, pricing, and availability
- **Pricing Transparency**: Full price ranges with recent update tracking and availability status
- **Trusted Reviews**: Integration of Google, Yelp, Care.com, and other verified review sources
- **Service Differentiation**: Clear display of key services and medical restrictions for informed decisions
- **Community Profiles**: Detailed pages with availability tracking, service offerings, and trusted reviews
- **Claim System**: Allows community owners to claim and manage their profiles

## Data Flow

1. **Search Flow**: Users search communities → API queries database → Results filtered and returned → Frontend displays cards
2. **Community Details**: User clicks community → API fetches full details and inspection data → Comprehensive profile displayed
3. **Claim Process**: Community owners submit claim form → Creates pending claim record → Admin review workflow

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Database connectivity (configured for PostgreSQL)
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management and caching
- **axios & cheerio**: Web scraping capabilities for licensing data
- **wouter**: Lightweight React routing

### UI Dependencies
- **@radix-ui/***: Unstyled, accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe component variants
- **lucide-react**: Icon library
- **react-leaflet**: Interactive map components for community visualization
- **leaflet**: Map library for location-based features

## Deployment Strategy

The application is configured for multiple deployment environments:

- **Development**: Vite dev server with Express API, hot module replacement
- **Production**: Static build served by Express with API routes
- **Build Process**: Frontend builds to `dist/public`, backend bundles to `dist/index.js`
- **Database**: Uses environment variable `DATABASE_URL` for connection
- **Replit Integration**: Special handling for Replit environment with development banner

## Changelog

- July 02, 2025: Initial setup with complete full-stack architecture
- July 02, 2025: Enhanced homepage hero section with senior community background image and improved visual design
- July 02, 2025: Migrated from in-memory storage to PostgreSQL database with Drizzle ORM, including automatic data seeding
- July 02, 2025: **Major Enhancement**: Added interactive map functionality, pricing transparency features, availability tracking, trusted review integration, service differentiation, and medical restrictions display
- July 02, 2025: **Data Integrity Implementation**: Removed all fictional/placeholder community data, implemented location autocomplete with verified data sources, enhanced search filtering with "City, State" parsing, and added clear data verification messaging
- July 02, 2025: **UI/UX Improvements**: Removed verification restrictions to allow all communities to be displayed, added "55+ Housing" category for senior-only housing, moved data integrity commitment message from landing page to post-search area, and added verification status filter option
- July 02, 2025: **Critical Data Integrity Fix**: Removed all fictional/fake scraped data and replaced with verified real senior living communities in Redding, CA (Cascades of the North State, Prestige Senior Living Redding, Brookdale Redding) with authentic addresses, phone numbers, and websites
- July 02, 2025: **Enhanced Location Autocomplete**: Improved search bar with smart city/state suggestions, including popular California cities, better matching logic with starts-with prioritization, and enhanced dropdown styling with improved visual design
- July 02, 2025: **Real Community Data Integration**: Added authentic, verifiable senior care facilities in Redding, CA including Shasta Regional Medical Center, Mercy Medical Center Redding, and Redding Care Center with real phone numbers, websites, and verified addresses
- July 02, 2025: **Hybrid Data Collection Strategy**: Implemented comprehensive approach combining licensed facilities from state databases (CA, TX, FL, NY, PA) with general "senior living" searches to capture unlicensed Independent Living and 55+ communities that don't appear in licensing databases
- January 02, 2025: **ADA, Privacy & Licensing Compliance Implementation**: Added comprehensive regulatory safeguards including WCAG 2.2 AA accessibility features, CPRA-compliant privacy controls, state referral agency licensing matrix, non-discrimination filters, legal documentation (Terms, Privacy, Disclaimer, Accessibility pages), and compliance API endpoints for production readiness
- July 02, 2025: **Multi-Source Verification System & Yelp Integration**: Implemented OpenAI-recommended defensible multi-source verification pipeline with 6-layer cross-referencing (state licensing, business registration, phone verification, senior living directories, Medicare data, address validation). Added Yelp Fusion API integration for photos and ratings with intelligent caching and rate limiting. Created three-market testing framework (Urban/Suburban/Rural) with confidence scoring and automated quality assessment
- July 02, 2025: **Comprehensive Enrichment System (FREE→PAID API Cascade)**: Implemented production-ready enrichment pipeline with 6-layer hierarchy: State Licensing (free) → Foursquare (950 calls/day free) → Mapillary photos (unlimited free) → Mapbox static (50k/month free) → Yelp ($0.008/call after 5k free) → Google Places ($0.017/call). Added Twilio phone validation ($0.005/lookup), spend guards with daily limits monitoring, photo carousel frontend integration, Jest test coverage, and metro testing endpoints. System successfully enriches communities with photos, ratings, and validated contact information at near-zero cost through smart API cascade
- July 03, 2025: **Unit Types & Floor Plans Display**: Added comprehensive unit browser with photos, floor plans, and availability information. Displays unit types (Studio, 1BR, 2BR) with square footage, features, pricing, and specific unit availability. Removed reservation capabilities per user request to avoid licensing issues, keeping only contact and tour scheduling functionality

## Compliance Framework

### Accessibility (ADA/WCAG 2.2 AA)
- Skip-to-content links on all pages
- Comprehensive aria-labels and semantic HTML structure  
- 4.5:1 color contrast ratios enforced
- Keyboard navigation support
- Screen reader compatibility
- Accessibility page with accommodation contact (accessibility@trueview.com)

### Privacy & CPRA Compliance
- "Do Not Sell or Share My Personal Information" toggle with localStorage persistence
- Comprehensive privacy policy with California rights
- Data deletion and download capabilities
- Clear data collection and usage disclosure
- No referral fee collection policy prominently displayed

### State Licensing Compliance
- Licensing matrix for CA, TX, FL, WA, OR, NY, PA, CO with statute references
- API endpoints: `/api/compliance/state/:code` and `/api/compliance/states`
- Non-discrimination filter validation blocking protected characteristics
- Legal disclaimer prominently stating information-only purpose

### Legal Documentation
- Complete Terms of Service with liability limitations
- Comprehensive disclaimer stating no professional advice provided
- Accessibility commitment page with WCAG 2.2 standards
- Footer links to all compliance pages
- Sticky disclaimer banner with dismissal capability

## User Preferences

Preferred communication style: Simple, everyday language.

### Project Priorities (Updated July 2025)
- **Primary Focus**: Pricing transparency, availability tracking, and trusted reviews (Google, Yelp, Care.com)
- **Secondary Focus**: Licensing and inspection data (good supplementary information but not main focus)
- **Core Features**: Interactive map showing filtered communities, service differentiation, medical restrictions
- **User Experience**: Clear availability indicators, real-time pricing updates, comprehensive review integration
- **Launch Requirements**: All transparency features implemented and tested, map functionality working