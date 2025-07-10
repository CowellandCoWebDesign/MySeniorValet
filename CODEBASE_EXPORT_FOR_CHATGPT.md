# TrueView - Senior Living Platform - Complete Codebase Export

## CRITICAL ISSUE ANALYSIS

### Problem Statement
**Slide Panel Performance Issue**: Despite multiple optimization attempts, the drag-based slide panel in the map view remains laggy and unresponsive. The panel should smoothly drag up/down with snap positions at 120px (collapsed), 350px (medium), and 85% screen height (full).

### Issue History & Failed Attempts
1. **Complex Drag System** → Simplified to click-only
2. **CSS-Only Approach** → Removed complex animations
3. **Proper Drag Implementation** → Added requestAnimationFrame, smooth easing
4. **Performance Optimizations** → Added proper touch handling, pan-y restrictions

### Root Cause Hypotheses
1. **Rendering Performance**: 2000+ communities causing re-renders during drag
2. **DOM Manipulation**: Large DOM tree with complex filtering operations
3. **Event Handling Conflicts**: Touch events interfering with scroll behavior
4. **State Management**: React state updates during drag causing performance bottlenecks

### Technical Context
- **Platform**: Replit development environment
- **Framework**: React with TypeScript
- **Data Volume**: 2000+ communities with complex filtering
- **UI Pattern**: Zillow-style map with bottom slide panel
- **Performance Target**: 60fps drag interaction

---

## CORE FILES

### 1. Main Component with Slide Panel (client/src/pages/basic-search.tsx)

```typescript
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Star, Heart, List, Map, Bell, Calendar, Mail, Phone, ExternalLink, Users, CheckCircle, AlertTriangle, Activity, UserCheck, Stethoscope, Clock, ImageIcon, ChevronDown, SortAsc, ArrowLeft, Home, Plus, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Link } from "wouter";
import 'leaflet/dist/leaflet.css';

export default function BasicSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState('search');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [sortBy, setSortBy] = useState('recommended');
  const [showSortOptions, setShowSortOptions] = useState(false);
  
  const [mapBounds, setMapBounds] = useState<any>(null);
  const [displayCount, setDisplayCount] = useState(20);

  // 🔥 PROBLEMATIC DRAG SYSTEM - PERFORMANCE ISSUES
  const [panelHeight, setPanelHeight] = useState(120);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartHeight, setDragStartHeight] = useState(0);
  
  // Handle drag start
  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStartY(clientY);
    setDragStartHeight(panelHeight);
    e.preventDefault();
  };
  
  // Handle drag move - POTENTIAL PERFORMANCE BOTTLENECK
  const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaY = dragStartY - clientY;
    const newHeight = Math.max(120, Math.min(window.innerHeight * 0.9, dragStartHeight + deltaY));
    
    // requestAnimationFrame for smoother updates
    requestAnimationFrame(() => {
      setPanelHeight(newHeight);
    });
    
    e.preventDefault();
  };
  
  // Handle drag end with snap positions
  const handleDragEnd = () => {
    setIsDragging(false);
    
    const screenHeight = window.innerHeight;
    let snapHeight;
    
    if (panelHeight < 180) {
      snapHeight = 120; // Collapsed
    } else if (panelHeight < screenHeight * 0.6) {
      snapHeight = 350; // Medium
    } else {
      snapHeight = screenHeight * 0.85; // Full
    }
    
    // Animation to snap position
    const startHeight = panelHeight;
    const startTime = Date.now();
    const duration = 300;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 4);
      
      const currentHeight = startHeight + (snapHeight - startHeight) * easeOut;
      setPanelHeight(currentHeight);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  };
  
  // Global event listeners - POTENTIAL MEMORY LEAK
  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e: MouseEvent) => handleDragMove(e);
    const handleTouchMove = (e: TouchEvent) => handleDragMove(e);
    const handleMouseUp = () => handleDragEnd();
    const handleTouchEnd = () => handleDragEnd();
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragStartY, dragStartHeight, panelHeight]);

  // 🔥 HEAVY DATA PROCESSING - 2000+ COMMUNITIES
  const { data: communitiesResponse, isLoading, error } = useQuery({
    queryKey: ["/api/communities/search", { limit: 2000 }],
    queryFn: async () => {
      const response = await fetch("/api/communities/search?limit=2000");
      if (!response.ok) throw new Error("Failed to fetch communities");
      return response.json();
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  const communities = Array.isArray(communitiesResponse) ? communitiesResponse : [];

  // 🔥 COMPLEX FILTERING - RUNS ON EVERY RENDER
  const filteredCommunities = communities?.filter((community: any) => {
    const searchMatch = !searchQuery || 
      community.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.careTypes?.some((type: string) => 
        type.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const boundsMatch = !mapBounds || (
      community.latitude >= mapBounds.getSouth() &&
      community.latitude <= mapBounds.getNorth() &&
      community.longitude >= mapBounds.getWest() &&
      community.longitude <= mapBounds.getEast()
    );

    return searchMatch && boundsMatch;
  }) || [];

  // 🔥 COMPLEX SORTING - PERFORMANCE IMPACT
  const sortedCommunities = sortCommunities(filteredCommunities, sortBy);
  const boundsFilteredCommunities = filteredCommunities.filter((community: any) => {
    if (!mapBounds || !community.latitude || !community.longitude) return false;
    
    const lat = parseFloat(community.latitude);
    const lng = parseFloat(community.longitude);
    const buffer = 0.01;
    
    return (
      lat >= (mapBounds.getSouth() - buffer) &&
      lat <= (mapBounds.getNorth() + buffer) &&
      lng >= (mapBounds.getWest() - buffer) &&
      lng <= (mapBounds.getEast() + buffer)
    );
  });

  const visibleCommunities = sortCommunities(boundsFilteredCommunities, sortBy);
  const displayedCommunities = visibleCommunities.slice(0, displayCount);

  // 🔥 SLIDE PANEL JSX - COMPLEX RENDERING
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Map and other components */}
      
      {/* PROBLEMATIC SLIDE PANEL */}
      <div 
        className="fixed left-0 right-0 bg-white z-30 shadow-2xl overflow-hidden"
        style={{ 
          bottom: 0,
          height: `${panelHeight}px`,
          borderRadius: '16px 16px 0 0',
          borderTop: '1px solid #e5e7eb',
          transition: isDragging ? 'none' : 'height 0.2s ease-out'
        }}
      >
        {/* Draggable Header */}
        <div className="flex flex-col h-full">
          <div 
            className="flex-shrink-0 bg-white cursor-grab active:cursor-grabbing select-none rounded-t-2xl"
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            style={{ touchAction: 'none' }}
          >
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-8 h-1 bg-gray-300 rounded-full hover:bg-gray-400 transition-colors"></div>
            </div>
            
            {/* Header with property count */}
            <div className="px-3 pb-2 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-1.5">
                    <h2 className="text-sm font-semibold text-gray-900">
                      {visibleCommunities.length} communities
                    </h2>
                    <div className="h-0.5 w-0.5 bg-gray-400 rounded-full"></div>
                    <span className="text-xs text-gray-500">in view</span>
                  </div>
                </div>
                
                {/* Sort dropdown */}
                <div className="relative sort-dropdown">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSortOptions(!showSortOptions);
                    }}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md"
                  >
                    <SortAsc className="w-3 h-3 text-gray-600" />
                    <span className="text-gray-600">Sort</span>
                    <ChevronDown className="w-3 h-3 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Results - PERFORMANCE CRITICAL */}
          <div
            className="flex-1 overflow-y-auto bg-gray-50"
            style={{
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-y',
              overscrollBehavior: 'contain'
            }}
          >
            {/* 🔥 HEAVY RENDERING - 2000+ COMMUNITY CARDS */}
            <div className="p-3 space-y-2">
              {displayedCommunities.map((community: any) => (
                <div
                  key={community.id}
                  onClick={() => window.location.href = `/community/${community.id}`}
                  className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer mb-4 border border-gray-200"
                >
                  {/* Complex community card rendering */}
                  <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
                    {/* Image rendering */}
                    {community.photos?.[0] && (
                      <img
                        src={community.photos[0]}
                        alt={community.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    
                    {/* Heart button */}
                    <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                      <Heart className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  
                  {/* Community details */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-base font-semibold text-gray-900 leading-tight flex-1 pr-2">
                        {community.name}
                      </h4>
                      {community.googleRating && (
                        <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="ml-1 text-xs font-semibold text-yellow-700">
                            {community.googleRating}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      {community.address}, {community.city}, {community.state}
                    </div>
                    
                    {/* Additional community details */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 🔥 COMPLEX SORTING FUNCTION
function sortCommunities(communities: any[], sortBy: string) {
  return communities.sort((a, b) => {
    switch (sortBy) {
      case 'priceAsc':
        return (a.priceRange?.min || 0) - (b.priceRange?.min || 0);
      case 'priceDesc':
        return (b.priceRange?.max || 0) - (a.priceRange?.max || 0);
      case 'rating':
        return (b.googleRating || 0) - (a.googleRating || 0);
      case 'nameAsc':
        return a.name.localeCompare(b.name);
      case 'newest':
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      default:
        return 0;
    }
  });
}

function getOptimalDisplayCount() {
  const screenHeight = window.innerHeight;
  const cardHeight = 300; // Approximate card height
  return Math.ceil(screenHeight / cardHeight) * 2; // Show 2 screens worth
}
```

### 2. Database Schema (shared/schema.ts)

```typescript
import { pgTable, text, serial, integer, boolean, timestamp, decimal, json, jsonb, date, varchar, real, numeric, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const communities = pgTable("communities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  description: text("description"),
  careTypes: text("care_types").array().notNull(),
  amenities: text("amenities").array().default([]),
  services: text("services").array().default([]),
  photos: text("photos").array().default([]),
  photoAttributions: text("photo_attributions").array().default([]),
  latitude: real("latitude"),
  longitude: real("longitude"),
  googlePlacesId: text("google_places_id"),
  googleRating: real("google_rating"),
  googleReviewCount: integer("google_review_count"),
  priceRange: json("price_range").$type<{ min: number; max: number }>(),
  availabilityStatus: text("availability_status"),
  unitTypes: text("unit_types").array().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  enrichmentCompleted: boolean("enrichment_completed").default(false),
});

export type Community = typeof communities.$inferSelect;
export type InsertCommunity = typeof communities.$inferInsert;

export const insertCommunitySchema = createInsertSchema(communities);
export const searchCommunitySchema = z.object({
  query: z.string().optional(),
  careTypes: z.array(z.string()).optional(),
  priceRange: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  location: z.string().optional(),
  radius: z.number().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});
```

### 3. Backend Routes (server/routes.ts)

```typescript
import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { communities, searchCommunitySchema } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, inArray, sql } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // 🔥 HEAVY SEARCH ENDPOINT - 2000+ COMMUNITIES
  app.get("/api/communities/search", async (req, res) => {
    try {
      const { limit = 20, offset = 0 } = req.query;
      
      console.log('Search request received:', { limit, offset });
      
      const parsedLimit = parseInt(limit as string);
      const parsedOffset = parseInt(offset as string);
      
      console.log('Parsed search parameters:', { limit: parsedLimit, offset: parsedOffset });
      
      const startTime = Date.now();
      
      // 🔥 PERFORMANCE BOTTLENECK - NO INDEXING
      const results = await db.select()
        .from(communities)
        .limit(parsedLimit)
        .offset(parsedOffset)
        .orderBy(desc(communities.createdAt));
      
      const endTime = Date.now();
      console.log(`Search returned ${results.length} communities`);
      console.log(`Found ${results.length} communities in ${endTime - startTime}ms`);
      
      res.json(results);
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  });

  // Community count endpoint
  app.get("/api/communities/count", async (req, res) => {
    try {
      const count = await db.select({ count: sql<number>`count(*)` }).from(communities);
      res.json({ count: count[0].count.toString() });
    } catch (error) {
      console.error('Count error:', error);
      res.status(500).json({ count: "2053" });
    }
  });

  // Other endpoints...
  
  const httpServer = createServer(app);
  return httpServer;
}
```

### 4. Package.json Dependencies

```json
{
  "name": "rest-express",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.60.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-leaflet": "^4.2.1",
    "leaflet": "^1.9.4",
    "lucide-react": "^0.453.0",
    "wouter": "^3.3.5",
    "drizzle-orm": "^0.39.1",
    "express": "^4.21.2",
    "@neondatabase/serverless": "^0.10.4",
    "typescript": "5.6.3",
    "tailwindcss": "^3.4.17"
  }
}
```

### 5. CSS Styles (client/src/index.css)

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@import "leaflet/dist/leaflet.css";

@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom scrollbar utilities */
@layer utilities {
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
}

/* Mobile viewport fixes */
@media (max-width: 768px) {
  .hero-mobile-safe {
    min-height: 100vh;
    min-height: 100dvh;
    padding-bottom: 2rem;
  }
  
  .mobile-keyboard-safe {
    padding-bottom: env(keyboard-inset-height, 0);
  }
}

/* Leaflet customization */
.leaflet-container {
  font-family: inherit;
}

.leaflet-popup-content-wrapper {
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.leaflet-marker-icon {
  transition: transform 0.2s ease;
}

.leaflet-marker-icon:hover {
  transform: scale(1.1);
}

:root {
  --background: hsl(220, 30%, 98%);
  --foreground: hsl(222, 84%, 4.9%);
  --primary: hsl(207, 100%, 36%);
  --border: hsl(220, 20%, 88%);
  --trueview-blue: hsl(207, 100%, 36%);
}
```

---

## PERFORMANCE OPTIMIZATION REQUIREMENTS

### Critical Performance Issues
1. **Drag Performance**: 60fps drag interaction required
2. **Rendering Performance**: 2000+ communities causing render bottlenecks
3. **Memory Management**: Event listeners and state updates
4. **Touch Handling**: Smooth mobile interaction

### Optimization Strategies Needed
1. **Virtualization**: Only render visible communities
2. **Debouncing**: Throttle drag updates
3. **Memoization**: Cache expensive calculations
4. **State Management**: Optimize React state updates
5. **Event Optimization**: Passive event listeners

### Success Criteria
- Smooth 60fps drag interaction
- Responsive touch handling on mobile
- Proper snap positions (120px, 350px, 85% height)
- Property count visible in collapsed state
- No lag during scrolling or dragging

---

## DEVELOPMENT ENVIRONMENT
- **Platform**: Replit
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: TanStack Query
- **CSS Framework**: Tailwind CSS

## REQUEST TO CHATGPT

Please analyze this codebase and provide a comprehensive solution for the slide panel performance issue. The current implementation is laggy and unresponsive despite multiple optimization attempts. We need a production-ready drag panel that works smoothly with 2000+ communities data.

**Specific Requirements:**
1. Smooth 60fps drag interaction
2. Snap positions at 120px, 350px, and 85% screen height
3. Property count visible when collapsed
4. No interference with scrolling inside the panel
5. Mobile-optimized touch handling

**Current Problems:**
- Laggy drag performance
- State update bottlenecks
- Complex rendering with 2000+ items
- Event handling conflicts

Please provide a complete, optimized solution that addresses these performance issues while maintaining the existing functionality.