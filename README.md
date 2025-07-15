# MySeniorValet - Senior Living Community Transparency Platform

© 2025 Scott Cowell. All rights reserved.

## Overview

MySeniorValet is a comprehensive senior living community search platform that prioritizes pricing transparency, real-time availability, and trusted reviews. The platform helps families make informed decisions by providing comprehensive community information including amenities, services, medical restrictions, and verified review sources.

## Key Features

- **Interactive Map Visualization**: Real-time map with availability indicators and custom markers
- **Pricing Transparency**: Full price ranges with recent update tracking
- **Trusted Reviews**: Integration of Google, Yelp, and other verified review sources
- **Multi-Source Verification**: 6-layer cross-referencing system for data accuracy
- **Community Claims**: Allows community owners to claim and manage their profiles
- **Enterprise Dashboard**: Comprehensive admin tools for content moderation and management
- **Regulatory Compliance**: ADA, CPRA, and multi-state licensing compliance

## Technology Stack

- **Frontend**: React with TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js with TypeScript, PostgreSQL database
- **ORM**: Drizzle ORM for type-safe database operations
- **Build**: Vite for frontend, esbuild for backend
- **Infrastructure**: Redis caching, rate limiting, performance monitoring

## Database

The platform maintains a database of verified senior living communities with:
- 28 authenticated facilities in Northern California
- Google Places integration for real photos and ratings
- Multi-source verification through state licensing databases
- Real-time availability and pricing information

## API Integrations

- Google Places API for community discovery and verification
- Yelp Fusion API for photos and ratings
- State licensing databases (CA, TX, FL, NY, PA)
- Mapillary for community photos
- Foursquare for business verification

## Compliance

- **ADA Compliance**: WCAG 2.2 AA accessibility standards
- **Privacy**: CPRA-compliant privacy controls
- **Legal**: Comprehensive terms, privacy policy, and disclaimers
- **State Licensing**: Multi-state regulatory compliance framework

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Database operations
npm run db:push
npm run db:seed
```

## Documentation

- [Investor Timeline](INVESTOR_TIMELINE.md) - Development milestones and achievements
- [Timestamped Development Log](TIMESTAMPED_DEVELOPMENT_LOG.md) - Complete development history
- [Project Architecture](replit.md) - Technical architecture and user preferences

## License

© 2025 Scott Cowell. All rights reserved.

This software and all associated documentation are proprietary and confidential. No part of this software may be reproduced, distributed, or transmitted in any form or by any means without prior written permission.