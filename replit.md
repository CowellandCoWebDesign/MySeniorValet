# TrueView - Senior Living Community Transparency Platform

© 2025 Scott Cowell. All rights reserved.

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

## Complete Development Journey: Day 1 to Present

### Phase 1: Foundation & Core Architecture (July 2, 2025)
**Day 1 - Project Genesis**
- July 02, 2025: Initial setup with complete full-stack architecture
- React frontend with TypeScript, Express backend, PostgreSQL database
- Tailwind CSS + shadcn/ui component system
- Drizzle ORM with type-safe database operations
- Vite build system with hot module replacement
**Early Foundation Features**
- Enhanced homepage with senior community visuals
- Database migration from in-memory to PostgreSQL
- Interactive map functionality with pricing transparency
- Location autocomplete with verified data sources
- Comprehensive UI/UX improvements

### Phase 2: Data Integrity & Verification (July 2-3, 2025)
**Critical Data Standards Implementation**
- Removed all fictional/placeholder community data
- Implemented authentic Google Places API integration
- Added 3 verified Redding, CA communities with real contact info
- Enhanced location search with "City, State" parsing
- Added verification status filtering and messaging

### Phase 3: Advanced Features & Enrichment (July 3, 2025)
**Multi-Source Data Collection**
- Hybrid data collection strategy (licensed + general searches)
- 6-layer verification pipeline (licensing, business registration, phone, directories, Medicare, address)
- FREE→PAID API cascade system with cost optimization
- Unit types & floor plans display system
- Photo carousel with unlimited display capacity

**Enterprise Infrastructure**
- Comprehensive admin dashboard (9 tabs)
- Flag system for community reporting
- Employee guidance and API quota management
- Content moderation and customer support tools
- Scalable infrastructure for 10,000+ users

### Phase 4: Security & Compliance (January 2-3, 2025)
**Regulatory Compliance**
- ADA/WCAG 2.2 AA accessibility implementation
- CPRA privacy controls with "Do Not Sell" toggle
- State licensing compliance matrix (8 states)
- Legal documentation (Terms, Privacy, Disclaimer)
- Non-discrimination filters

**Security Hardening**
- Comprehensive security audit and remediation
- Database session storage with IP tracking
- Security headers (CSP, HSTS, XSS protection)
- Tiered rate limiting (5-100 req/15min)
- Audit logging with risk scoring

### Phase 5: Regional Expansion (January 4, 2025)
**Northern California Coverage**
- Systematic county-by-county research system
- 12 target counties with comprehensive discovery
- Database expansion from 29 to 148 total communities
- Geographic equivalence with ZIP code intelligence
- 87 ZIP codes across 14 counties supported

**Geographic Intelligence**
- Enhanced search parity (city name = ZIP code results)
- Automatic expansion for unknown ZIP codes
- San Francisco comprehensive coverage (18 communities)
- Major market restoration and verification

### Phase 6: Visual Excellence & Review Integration (January 5, 2025)
**Complete Photo Enrichment**
- 1,608 authentic Google Places photos added
- 89% photo coverage across all communities
- Average 10.86 photos per community
- Top communities with 24-27 photos each
- Systematic enrichment with 100% success rate

**Review Transparency Enhancement**
- Google and Yelp review linking from community cards
- Direct platform access with "Find on Google/Yelp" buttons
- Authentic API integration messaging (no synthetic data)
- Community page review sections with external links
- Complete review transparency infrastructure

## Current Status (January 5, 2025)
**Database**: 148 authenticated Northern California communities
**Coverage**: Complete Bay Area, Sacramento Region, North Coast
**Photos**: 1,608 authentic images with 89% coverage
**Reviews**: Direct Google/Yelp platform integration
**Infrastructure**: Enterprise-ready with 10,000+ user capacity
**Compliance**: Full ADA, CPRA, and state licensing compliance
**Security**: Comprehensive audit and hardening implementation

## Changelog

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