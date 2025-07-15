# TrueView Codebase Export for ChatGPT Analysis

## CRITICAL ISSUES TO RESOLVE:
1. **Map Not Loading**: Interactive Mapbox map fails to render properly
2. **Styling Issues**: Real estate/rental styling not loading correctly
3. **Performance Problems**: Map should show all 8,000+ communities but only showing 20

## PROJECT CONTEXT:
- **Platform**: TrueView - Senior Living Community Search Platform
- **Database**: 8,053 communities across 19 states
- **Current Issue**: Map component fails to load with proper styling
- **Goal**: Interactive map showing all communities with markers and popups

---

## PACKAGE.JSON DEPENDENCIES
```json
{
  "name": "rest-express",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build --outDir dist/public",
    "build:server": "esbuild server/index.ts --bundle --platform=node --target=node18 --outfile=dist/index.js --external:@neondatabase/serverless --external:ws --external:drizzle-orm --external:drizzle-kit --format=esm --banner:js=\"import { createRequire } from 'module'; const require = createRequire(import.meta.url);\"",
    "start": "node dist/index.js",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "@neondatabase/serverless": "^0.10.6",
    "@radix-ui/react-accordion": "^1.2.1",
    "@radix-ui/react-alert-dialog": "^1.1.2",
    "@radix-ui/react-aspect-ratio": "^1.1.0",
    "@radix-ui/react-avatar": "^1.1.1",
    "@radix-ui/react-checkbox": "^1.1.2",
    "@radix-ui/react-collapsible": "^1.1.1",
    "@radix-ui/react-context-menu": "^2.2.2",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-dropdown-menu": "^2.1.2",
    "@radix-ui/react-hover-card": "^1.1.2",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-menubar": "^1.1.2",
    "@radix-ui/react-navigation-menu": "^1.2.1",
    "@radix-ui/react-popover": "^1.1.2",
    "@radix-ui/react-progress": "^1.1.0",
    "@radix-ui/react-radio-group": "^1.2.1",
    "@radix-ui/react-scroll-area": "^1.2.0",
    "@radix-ui/react-select": "^2.1.2",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-slider": "^1.2.1",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-switch": "^1.1.1",
    "@radix-ui/react-tabs": "^1.1.1",
    "@radix-ui/react-toast": "^1.2.2",
    "@radix-ui/react-toggle": "^1.1.0",
    "@radix-ui/react-toggle-group": "^1.1.0",
    "@radix-ui/react-tooltip": "^1.1.3",
    "react-map-gl": "^7.1.7",
    "mapbox-gl": "^3.7.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "wouter": "^3.3.5",
    "@tanstack/react-query": "^5.62.2",
    "axios": "^1.7.9",
    "drizzle-orm": "^0.36.4",
    "drizzle-zod": "^0.5.1",
    "express": "^4.21.1",
    "zod": "^3.24.1"
  }
}
```

---

## VITE CONFIG
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
      '@assets': path.resolve(__dirname, './attached_assets'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist/public',
    emptyOutDir: true,
  },
})
```

---

## DATABASE SCHEMA (shared/schema.ts)
```typescript
import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
  boolean,
  decimal,
  serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Session storage table
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Communities table - main data structure
export const communities = pgTable("communities", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  address: varchar("address"),
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  phone: varchar("phone"),
  website: varchar("website"),
  description: text("description"),
  
  // Coordinates - CRITICAL FOR MAP
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  
  // Pricing
  basePricing: jsonb("base_pricing"),
  livePricing: jsonb("live_pricing"),
  
  // Features
  careTypes: text("care_types").array(),
  amenities: text("amenities").array(),
  
  // Status
  isActive: boolean("is_active").default(true),
  verificationStatus: varchar("verification_status").default("pending"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  
  // Performance indexes
  trendingScore: decimal("trending_score", { precision: 5, scale: 2 }).default("0"),
  enrichmentCompleted: boolean("enrichment_completed").default(false),
  
  // Photo system
  photos: text("photos").array(),
  photoAttributions: text("photo_attributions").array(),
  
  // Reviews
  googleRating: decimal("google_rating", { precision: 3, scale: 2 }),
  googleReviewCount: integer("google_review_count"),
  yelpRating: decimal("yelp_rating", { precision: 3, scale: 2 }),
  yelpReviewCount: integer("yelp_review_count"),
}, (table) => [
  // Performance indexes for map queries
  index("idx_communities_city").on(table.city),
  index("idx_communities_state").on(table.state),
  index("idx_communities_zip_code").on(table.zipCode),
  index("idx_communities_care_types").on(table.careTypes),
  index("idx_communities_location_composite").on(table.city, table.state, table.zipCode),
  index("idx_communities_coordinates").on(table.latitude, table.longitude),
  index("idx_communities_rating").on(table.googleRating),
  index("idx_communities_trending_score").on(table.trendingScore),
]);

export type Community = typeof communities.$inferSelect;
export type InsertCommunity = typeof communities.$inferInsert;
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
```

---

## RENTALS PAGE (client/src/pages/rentals.tsx)
```typescript
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Heart, 
  Home,
  DollarSign,
  Users,
  Calendar,
  Phone,
  Mail,
  Grid3X3,
  List,
  SlidersHorizontal,
  Bed,
  Bath,
  Car,
  Wifi,
  Dumbbell,
  Utensils,
  Shield,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import RentalMapbox from '@/components/RentalMapbox';
import SlidePanel from '@/components/SlidePanel';
import type { Community } from '@shared/schema';

interface RentalFilters {
  priceRange: [number, number];
  careTypes: string[];
  amenities: string[];
  availabilityOnly: boolean;
  rating: number;
  location: string;
  sortBy: 'price' | 'rating' | 'distance' | 'newest';
}

export default function Rentals() {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [slidePanelHeight, setSlidePanelHeight] = useState(120);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [filters, setFilters] = useState<RentalFilters>({
    priceRange: [2000, 8000],
    careTypes: [],
    amenities: [],
    availabilityOnly: false,
    rating: 0,
    location: '',
    sortBy: 'price'
  });

  // Fetch communities data - get all communities for map view
  const { data: communities = [], isLoading, error } = useQuery({
    queryKey: ['/api/communities/search', { limit: 10000 }], // Increased to get all communities
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Debug logging
  useEffect(() => {
    console.log('Rentals page - communities loaded:', communities.length, 'communities');
    console.log('Rentals page - isLoading:', isLoading, 'error:', error);
  }, [communities, isLoading, error]);

  // Filter communities based on current filters
  const filteredCommunities = useMemo(() => {
    if (!communities.length) return [];
    
    let filtered = communities.filter((community: Community) => {
      // Search query filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          community.name.toLowerCase().includes(searchLower) ||
          community.city?.toLowerCase().includes(searchLower) ||
          community.state?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      // Location filter
      if (filters.location) {
        const locationLower = filters.location.toLowerCase();
        const matchesLocation = 
          community.city?.toLowerCase().includes(locationLower) ||
          community.state?.toLowerCase().includes(locationLower) ||
          community.zipCode?.toLowerCase().includes(locationLower);
        if (!matchesLocation) return false;
      }
      
      // Care types filter
      if (filters.careTypes.length > 0) {
        const hasCareType = filters.careTypes.some(type => 
          community.careTypes?.includes(type)
        );
        if (!hasCareType) return false;
      }
      
      // Rating filter
      if (filters.rating > 0) {
        const rating = parseFloat(community.googleRating || '0');
        if (rating < filters.rating) return false;
      }
      
      return true;
    });
    
    // Sort filtered results
    filtered.sort((a: Community, b: Community) => {
      switch (filters.sortBy) {
        case 'rating':
          return parseFloat(b.googleRating || '0') - parseFloat(a.googleRating || '0');
        case 'price':
          // Sort by base pricing if available
          const aPrice = a.basePricing ? (a.basePricing as any).min || 0 : 0;
          const bPrice = b.basePricing ? (b.basePricing as any).min || 0 : 0;
          return aPrice - bPrice;
        case 'distance':
          // TODO: Implement distance sorting
          return 0;
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [communities, filters, searchQuery]);

  // Handle map marker selection
  const handleMarkerClick = (community: Community) => {
    setSelectedCommunity(community);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading communities...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-500">Error loading communities</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">Senior Living Search</h1>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('map')}
            >
              <MapPin className="w-4 h-4 mr-1" />
              Map
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4 mr-1" />
              List
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-1" />
            Filters
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search communities, cities, or ZIP codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b px-4 py-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Price Range</Label>
              <div className="mt-2">
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => setFilters({...filters, priceRange: value as [number, number]})}
                  max={10000}
                  min={1000}
                  step={100}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>${filters.priceRange[0]}</span>
                  <span>${filters.priceRange[1]}</span>
                </div>
              </div>
            </div>
            
            <div>
              <Label>Care Types</Label>
              <Select onValueChange={(value) => setFilters({...filters, careTypes: [value]})}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select care type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Independent Living">Independent Living</SelectItem>
                  <SelectItem value="Assisted Living">Assisted Living</SelectItem>
                  <SelectItem value="Memory Care">Memory Care</SelectItem>
                  <SelectItem value="Skilled Nursing">Skilled Nursing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Minimum Rating</Label>
              <Select onValueChange={(value) => setFilters({...filters, rating: parseFloat(value)})}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Any rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any rating</SelectItem>
                  <SelectItem value="3">3+ stars</SelectItem>
                  <SelectItem value="4">4+ stars</SelectItem>
                  <SelectItem value="4.5">4.5+ stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 relative">
        {viewMode === 'map' ? (
          <>
            <RentalMapbox
              communities={filteredCommunities}
              selectedCommunity={selectedCommunity}
              onMarkerClick={handleMarkerClick}
              className="h-full"
            />
            <SlidePanel
              height={slidePanelHeight}
              onHeightChange={setSlidePanelHeight}
              className="absolute bottom-0 left-0 right-0 z-10"
            >
              <div className="p-4">
                <h3 className="font-semibold mb-3">
                  {filteredCommunities.length} Communities Found
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredCommunities.slice(0, 20).map((community: Community) => (
                    <Card key={community.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-sm">{community.name}</h4>
                          <Heart className="w-4 h-4 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          {community.address}, {community.city}, {community.state}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span className="text-xs">{community.googleRating || 'N/A'}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {community.careTypes?.[0] || 'Senior Living'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </SlidePanel>
          </>
        ) : (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCommunities.map((community: Community) => (
                <Card key={community.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{community.name}</h3>
                      <Heart className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {community.address}, {community.city}, {community.state}
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm">{community.googleRating || 'N/A'}</span>
                      <span className="text-sm text-gray-500">
                        ({community.googleReviewCount || 0} reviews)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">
                        {community.careTypes?.[0] || 'Senior Living'}
                      </Badge>
                      <Button size="sm">
                        <Phone className="w-4 h-4 mr-1" />
                        Contact
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
```

---

## MAPBOX COMPONENT (client/src/components/RentalMapbox.tsx)
```typescript
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Map, { 
  Marker, 
  Popup, 
  NavigationControl, 
  GeolocateControl,
  ScaleControl 
} from 'react-map-gl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Star, 
  Phone, 
  Globe,
  DollarSign,
  Users,
  Heart,
  X,
  Maximize,
  Minimize,
  Layers,
  Navigation
} from 'lucide-react';
import type { Community } from '@shared/schema';

interface RentalMapboxProps {
  communities: Community[];
  selectedCommunity: Community | null;
  onMarkerClick: (community: Community) => void;
  className?: string;
}

interface CustomMarkerProps {
  community: Community;
  isSelected: boolean;
  onClick: () => void;
}

// Custom marker component
const CustomMarker = ({ community, isSelected, onClick }: CustomMarkerProps) => {
  const hasRating = community.googleRating && parseFloat(community.googleRating) > 0;
  const rating = hasRating ? parseFloat(community.googleRating) : 0;
  
  return (
    <div
      className={`
        relative cursor-pointer transform transition-all duration-200 hover:scale-110
        ${isSelected ? 'z-50 scale-110' : 'z-10'}
      `}
      onClick={onClick}
    >
      {/* Main marker */}
      <div
        className={`
          w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center
          ${isSelected 
            ? 'bg-blue-600 border-blue-200' 
            : hasRating && rating >= 4 
              ? 'bg-green-500' 
              : hasRating && rating >= 3 
                ? 'bg-yellow-500' 
                : 'bg-gray-500'
          }
        `}
      >
        <MapPin className="w-4 h-4 text-white" />
      </div>
      
      {/* Rating badge */}
      {hasRating && (
        <div className="absolute -top-2 -right-2 bg-white rounded-full px-1 py-0.5 text-xs font-medium border shadow-sm">
          {rating.toFixed(1)}
        </div>
      )}
      
      {/* Pointer */}
      <div
        className={`
          absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-1
          w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent
          ${isSelected 
            ? 'border-t-blue-600' 
            : hasRating && rating >= 4 
              ? 'border-t-green-500' 
              : hasRating && rating >= 3 
                ? 'border-t-yellow-500' 
                : 'border-t-gray-500'
          }
        `}
      />
    </div>
  );
};

export default function RentalMapbox({ 
  communities, 
  selectedCommunity, 
  onMarkerClick, 
  className = "" 
}: RentalMapboxProps) {
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [showPopup, setShowPopup] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<Community | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v12');

  // Viewport state
  const [viewState, setViewState] = useState({
    longitude: -122.4194,
    latitude: 37.7749,
    zoom: 11,
    pitch: 0,
    bearing: 0
  });

  // Fetch Mapbox token
  const { data: config } = useQuery({
    queryKey: ['/api/config'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (config?.MAPBOX_ACCESS_TOKEN) {
      console.log('MAPBOX_TOKEN:', 'Token loaded successfully');
      console.log('Environment variables:', import.meta.env);
      console.log('Actual token value:', config.MAPBOX_ACCESS_TOKEN.substring(0, 20) + '...');
      console.log('Token type:', config.MAPBOX_ACCESS_TOKEN.startsWith('pk.') ? 'PUBLIC TOKEN' : 'SECRET TOKEN');
      setMapboxToken(config.MAPBOX_ACCESS_TOKEN);
    }
  }, [config]);

  // Filter communities with valid coordinates
  const validCommunities = useMemo(() => {
    if (!communities || communities.length === 0) return [];
    
    const filtered = communities.filter(community => 
      community.latitude && 
      community.longitude && 
      community.latitude !== '0' && 
      community.longitude !== '0' &&
      community.latitude !== 0 && 
      community.longitude !== 0
    );
    
    // Debug logging
    console.log('RentalMapbox - Total communities:', communities.length);
    console.log('RentalMapbox - Valid communities with coordinates:', filtered.length);
    if (filtered.length > 0) {
      console.log('RentalMapbox - Sample community coordinates:', {
        name: filtered[0].name,
        latitude: filtered[0].latitude,
        longitude: filtered[0].longitude,
        address: filtered[0].address,
        city: filtered[0].city,
        state: filtered[0].state
      });
    }
    
    return filtered;
  }, [communities]);

  // Calculate map bounds based on communities
  const mapBounds = useMemo(() => {
    if (validCommunities.length === 0) return null;
    
    const lats = validCommunities.map(c => parseFloat(c.latitude!));
    const lngs = validCommunities.map(c => parseFloat(c.longitude!));
    
    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs)
    };
  }, [validCommunities]);

  // Auto-fit map bounds when communities change
  useEffect(() => {
    if (mapBounds && validCommunities.length > 0) {
      const padding = 0.1; // 10% padding
      const latDiff = mapBounds.north - mapBounds.south;
      const lngDiff = mapBounds.east - mapBounds.west;
      
      setViewState(prev => ({
        ...prev,
        latitude: (mapBounds.north + mapBounds.south) / 2,
        longitude: (mapBounds.east + mapBounds.west) / 2,
        zoom: Math.max(4, Math.min(12, 
          Math.log2(360 / Math.max(latDiff + latDiff * padding, lngDiff + lngDiff * padding)) - 1
        ))
      }));
    }
  }, [mapBounds, validCommunities.length]);

  // Handle marker clicks
  const handleMarkerClick = (community: Community) => {
    setSelectedMarker(community);
    setShowPopup(true);
    onMarkerClick(community);
    
    // Center map on selected marker
    setViewState(prev => ({
      ...prev,
      latitude: parseFloat(community.latitude!),
      longitude: parseFloat(community.longitude!),
      zoom: Math.max(prev.zoom, 13)
    }));
  };

  // Handle popup close
  const handlePopupClose = () => {
    setShowPopup(false);
    setSelectedMarker(null);
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Map style options
  const mapStyles = [
    { id: 'mapbox://styles/mapbox/streets-v12', name: 'Streets', icon: '🗺️' },
    { id: 'mapbox://styles/mapbox/satellite-v9', name: 'Satellite', icon: '🛰️' },
    { id: 'mapbox://styles/mapbox/light-v11', name: 'Light', icon: '☀️' },
    { id: 'mapbox://styles/mapbox/dark-v11', name: 'Dark', icon: '🌙' }
  ];

  // Debug map rendering
  console.log('RentalMapbox - Rendering map with:', {
    viewState,
    mapboxToken: mapboxToken ? 'LOADED' : 'MISSING',
    validCommunities: validCommunities.length,
    mapStyle
  });

  return (
    <div className={`relative ${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle={mapStyle}
        mapboxAccessToken={mapboxToken}
        style={{ width: '100%', height: '100%' }}
        dragPan={true}
        dragRotate={true}
        scrollZoom={true}
        touchZoom={true}
        touchRotate={true}
        keyboard={true}
        doubleClickZoom={true}
        minZoom={3}
        maxZoom={20}
        attributionControl={false}
        onError={(error) => {
          console.error('Mapbox error:', error);
        }}
      >
        {/* Navigation Controls */}
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" />
        <ScaleControl position="bottom-left" />

        {/* Community Markers */}
        {validCommunities.map((community) => (
          <Marker
            key={community.id}
            longitude={parseFloat(community.longitude!)}
            latitude={parseFloat(community.latitude!)}
            anchor="bottom"
          >
            <CustomMarker
              community={community}
              isSelected={selectedCommunity?.id === community.id}
              onClick={() => handleMarkerClick(community)}
            />
          </Marker>
        ))}

        {/* Popup */}
        {showPopup && selectedMarker && (
          <Popup
            longitude={parseFloat(selectedMarker.longitude!)}
            latitude={parseFloat(selectedMarker.latitude!)}
            anchor="bottom"
            onClose={handlePopupClose}
            closeButton={false}
            className="rental-popup"
          >
            <Card className="w-80 border-0 shadow-lg">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 z-10 h-6 w-6 p-0"
                  onClick={handlePopupClose}
                >
                  <X className="w-4 h-4" />
                </Button>
                
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 pr-6">
                        {selectedMarker.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {selectedMarker.address}, {selectedMarker.city}, {selectedMarker.state}
                      </p>
                      
                      {/* Rating */}
                      {selectedMarker.googleRating && (
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{selectedMarker.googleRating}</span>
                          <span className="text-sm text-gray-500">
                            ({selectedMarker.googleReviewCount || 0} reviews)
                          </span>
                        </div>
                      )}
                      
                      {/* Care Types */}
                      {selectedMarker.careTypes && selectedMarker.careTypes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {selectedMarker.careTypes.slice(0, 2).map((type, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {/* Pricing */}
                      {selectedMarker.basePricing && (
                        <div className="flex items-center gap-1 mb-3">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium">
                            Starting at ${(selectedMarker.basePricing as any).min || 'N/A'}
                          </span>
                        </div>
                      )}
                      
                      {/* Action buttons */}
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="flex-1">
                          <Phone className="w-4 h-4 mr-1" />
                          Call
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Globe className="w-4 h-4 mr-1" />
                          Visit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Heart className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </Popup>
        )}
      </Map>

      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {/* Fullscreen toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleFullscreen}
          className="bg-white shadow-md"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </Button>
        
        {/* Style selector */}
        <div className="bg-white rounded-md shadow-md p-1">
          <select
            value={mapStyle}
            onChange={(e) => setMapStyle(e.target.value)}
            className="text-sm border-none outline-none bg-transparent"
          >
            {mapStyles.map(style => (
              <option key={style.id} value={style.id}>
                {style.icon} {style.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Community count badge */}
      <div className="absolute bottom-4 left-4 z-10">
        <Badge variant="outline" className="bg-white shadow-md">
          {validCommunities.length} communities
        </Badge>
      </div>
    </div>
  );
}
```

---

## SERVER ROUTES (server/routes.ts)
```typescript
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { communities } from "@shared/schema";
import { db } from "./db";
import { eq, and, or, ilike, sql, desc, asc } from "drizzle-orm";
import { rateLimiter } from './middleware/rateLimiter';
import { cache } from './middleware/cache';

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Configuration endpoint for Mapbox token
  app.get('/api/config', (req, res) => {
    res.json({
      MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN
    });
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Community search endpoint
  app.get('/api/communities/search', rateLimiter, cache(2 * 60 * 1000), async (req, res) => {
    try {
      const startTime = Date.now();
      console.log('Search request received:', req.query);
      
      const { 
        limit = 20, 
        offset = 0, 
        city, 
        state, 
        zipCode, 
        careTypes, 
        minRating, 
        maxPrice, 
        sortBy = 'name',
        location
      } = req.query;
      
      const parsedParams = {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      };
      
      console.log('Parsed search parameters:', parsedParams);
      
      let query = db.select().from(communities);
      let conditions: any[] = [];
      
      // Location-based filtering
      if (location) {
        const locationStr = String(location).toLowerCase();
        console.log('Building location conditions for:', locationStr, 'with distance:', req.query.distance);
        
        if (locationStr.includes(',')) {
          // "City, State" format
          const [cityPart, statePart] = locationStr.split(',').map(s => s.trim());
          conditions.push(
            and(
              ilike(communities.city, `%${cityPart}%`),
              ilike(communities.state, `%${statePart}%`)
            )
          );
          console.log('Detected location type: city_state');
        } else if (locationStr.length === 2) {
          // State abbreviation
          conditions.push(ilike(communities.state, `%${locationStr}%`));
          console.log('Detected location type: state_abbrev');
        } else if (/^\d{5}$/.test(locationStr)) {
          // ZIP code
          conditions.push(eq(communities.zipCode, locationStr));
          console.log('Detected location type: zip_code');
        } else {
          // City name or state name
          conditions.push(
            or(
              ilike(communities.city, `%${locationStr}%`),
              ilike(communities.state, `%${locationStr}%`)
            )
          );
          console.log('Detected location type: city_only');
        }
      }
      
      // Other filters
      if (city) conditions.push(ilike(communities.city, `%${city}%`));
      if (state) conditions.push(ilike(communities.state, `%${state}%`));
      if (zipCode) conditions.push(eq(communities.zipCode, String(zipCode)));
      if (careTypes) {
        const types = Array.isArray(careTypes) ? careTypes : [careTypes];
        conditions.push(
          or(...types.map(type => 
            sql`${communities.careTypes} @> ARRAY[${type}]::text[]`
          ))
        );
      }
      if (minRating) {
        conditions.push(sql`${communities.googleRating}::float >= ${parseFloat(String(minRating))}`);
      }
      
      // Apply conditions
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      // Sorting
      switch (sortBy) {
        case 'rating':
          query = query.orderBy(desc(communities.googleRating));
          break;
        case 'name':
          query = query.orderBy(asc(communities.name));
          break;
        case 'city':
          query = query.orderBy(asc(communities.city));
          break;
        case 'trending':
          query = query.orderBy(desc(communities.trendingScore));
          break;
        default:
          query = query.orderBy(asc(communities.name));
      }
      
      // Apply pagination
      query = query.limit(parsedParams.limit).offset(parsedParams.offset);
      
      console.log('Search parameters received:', { 
        location, 
        limit: parsedParams.limit, 
        offset: parsedParams.offset 
      });
      
      const results = await query;
      const endTime = Date.now();
      
      console.log(`Search returned ${results.length} communities`);
      console.log(`Found ${results.length} communities in ${endTime - startTime}ms`);
      
      res.json(results);
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ 
        message: 'Search failed', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Community count endpoint
  app.get('/api/communities/count', rateLimiter, cache(10 * 60 * 1000), async (req, res) => {
    try {
      const result = await db.select({ count: sql`count(*)` }).from(communities);
      res.json({ count: result[0].count });
    } catch (error) {
      console.error('Count error:', error);
      res.status(500).json({ message: 'Failed to get community count' });
    }
  });

  // Trending communities endpoint
  app.get('/api/communities/trending', rateLimiter, cache(5 * 60 * 1000), async (req, res) => {
    try {
      const startTime = Date.now();
      const results = await db
        .select()
        .from(communities)
        .orderBy(desc(communities.trendingScore))
        .limit(20);
      
      const endTime = Date.now();
      console.log(`Trending communities loaded in ${endTime - startTime}ms`);
      
      res.json(results);
    } catch (error) {
      console.error('Trending communities error:', error);
      res.status(500).json({ message: 'Failed to get trending communities' });
    }
  });

  // Communities by location endpoint
  app.get('/api/communities/by-location/:location', rateLimiter, cache(2 * 60 * 1000), async (req, res) => {
    try {
      const startTime = Date.now();
      const { location } = req.params;
      const { limit = 20 } = req.query;
      
      const results = await db
        .select()
        .from(communities)
        .where(
          or(
            ilike(communities.city, `%${location}%`),
            ilike(communities.state, `%${location}%`)
          )
        )
        .limit(parseInt(limit as string));
      
      const endTime = Date.now();
      console.log(`Location communities (${location}) loaded in ${endTime - startTime}ms`);
      
      res.json(results);
    } catch (error) {
      console.error('Location communities error:', error);
      res.status(500).json({ message: 'Failed to get location communities' });
    }
  });

  // Coastal communities endpoint
  app.get('/api/communities/coastal', rateLimiter, cache(10 * 60 * 1000), async (req, res) => {
    try {
      const startTime = Date.now();
      const coastalCities = [
        'Santa Monica', 'Monterey', 'San Francisco', 'Santa Barbara', 'Carmel'
      ];
      
      const results = await db
        .select()
        .from(communities)
        .where(
          or(...coastalCities.map(city => 
            ilike(communities.city, `%${city}%`)
          ))
        )
        .limit(100);
      
      const endTime = Date.now();
      console.log(`Coastal communities loaded in ${endTime - startTime}ms`);
      
      res.json(results);
    } catch (error) {
      console.error('Coastal communities error:', error);
      res.status(500).json({ message: 'Failed to get coastal communities' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
```

---

## MAIN SERVER (server/index.ts)
```typescript
import express from 'express';
import { registerRoutes } from './routes';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { existsSync } from 'fs';
import { db } from './db';
import { communities } from '@shared/schema';
import { sql } from 'drizzle-orm';
import { security } from './middleware/security';
import { cacheStats } from './middleware/cache';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://api.mapbox.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://api.mapbox.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.mapbox.com", "https://events.mapbox.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use(security);

// Cache monitoring
app.get('/api/cache/stats', (req, res) => {
  res.json(cacheStats);
});

// Database seeding and initialization
async function initializeDatabase() {
  try {
    console.log('Initializing community stats cache...');
    
    // Refresh community stats
    console.log('Refreshing community stats cache...');
    const result = await db.select({ count: sql`count(*)` }).from(communities);
    const totalCommunities = result[0].count;
    console.log(`Community stats cache refreshed: ${totalCommunities} total communities`);
    
    // Start intelligent pricing updates
    console.log('🎯 WAR ON "CALL FOR PRICING" - Starting automatic pricing updates...');
    console.log('Starting intelligent pricing update for all communities...');
    
    // Check if database needs seeding
    if (totalCommunities === 0) {
      console.log('Database is empty, seeding required...');
      // Seeding logic would go here
    } else {
      console.log(`Database already seeded with ${totalCommunities} communities`);
    }
    
    // Run pricing updates
    console.log('✅ Pricing update complete! Updated 0 communities.');
    
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Initialize database on startup
initializeDatabase();

// Register API routes
const httpServer = await registerRoutes(app);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const publicPath = join(__dirname, 'public');
  if (existsSync(publicPath)) {
    app.use(express.static(publicPath));
    app.get('*', (req, res) => {
      res.sendFile(join(publicPath, 'index.html'));
    });
  }
}

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🎯 WAR ON "CALL FOR PRICING" - Starting automatic pricing updates...`);
  console.log(`${new Date().toLocaleTimeString()} [express] serving on port ${PORT}`);
});
```

---

## STYLE ISSUES ANALYSIS

### Current CSS (client/src/index.css)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom mapbox styles */
.mapboxgl-popup {
  max-width: 400px;
}

.mapboxgl-popup-content {
  padding: 0;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.rental-popup .mapboxgl-popup-content {
  padding: 0;
  border-radius: 12px;
  overflow: hidden;
}

.mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip {
  border-top-color: #fff;
}

/* TrueView branding colors */
:root {
  --primary: #007cba;
  --primary-foreground: #ffffff;
  --secondary: #f1f5f9;
  --secondary-foreground: #0f172a;
  --accent: #e2e8f0;
  --accent-foreground: #1e293b;
  --background: #ffffff;
  --foreground: #0f172a;
  --card: #ffffff;
  --card-foreground: #0f172a;
  --border: #e2e8f0;
  --input: #ffffff;
  --ring: #007cba;
  --muted: #f8fafc;
  --muted-foreground: #64748b;
  --popover: #ffffff;
  --popover-foreground: #0f172a;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
}

/* Dark mode */
.dark {
  --primary: #0ea5e9;
  --primary-foreground: #ffffff;
  --secondary: #1e293b;
  --secondary-foreground: #f1f5f9;
  --accent: #334155;
  --accent-foreground: #f1f5f9;
  --background: #0f172a;
  --foreground: #f1f5f9;
  --card: #1e293b;
  --card-foreground: #f1f5f9;
  --border: #334155;
  --input: #1e293b;
  --ring: #0ea5e9;
  --muted: #1e293b;
  --muted-foreground: #94a3b8;
  --popover: #1e293b;
  --popover-foreground: #f1f5f9;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
}
```

---

## CRITICAL PROBLEMS IDENTIFIED:

### 1. **Map Token Issue**: 
- Using SECRET token (sk.) instead of PUBLIC token (pk.)
- Mapbox requires public tokens for client-side usage
- Current implementation serves secret token through API endpoint

### 2. **Coordinate Data Type Mismatch**:
- Database stores coordinates as `decimal` (strings in JavaScript)
- Map component expects `number` types
- Fixed with `parseFloat()` conversion but may indicate deeper issue

### 3. **Performance Issues**:
- Requesting 10,000 communities at once
- No pagination for map markers
- Potential memory and rendering issues

### 4. **Styling Problems**:
- Mapbox styles not loading correctly
- Missing rental-specific CSS
- Content Security Policy may be blocking Mapbox resources

### 5. **Error Handling**:
- Map errors logged but not handled gracefully
- No fallback when Mapbox fails to load
- Missing loading states

## IMMEDIATE FIXES NEEDED:

1. **Fix Mapbox Token**: Replace secret token with public token
2. **Add Map Loading State**: Show loading spinner while map initializes
3. **Implement Marker Clustering**: Handle 8,000+ markers efficiently
4. **Fix CSP Headers**: Allow Mapbox resources in security policy
5. **Add Error Boundaries**: Handle map failures gracefully
6. **Optimize Data Loading**: Use pagination or viewport-based loading
7. **Fix Styling**: Ensure Mapbox CSS loads correctly

This export provides complete context for ChatGPT to analyze and resolve the map loading and styling issues.