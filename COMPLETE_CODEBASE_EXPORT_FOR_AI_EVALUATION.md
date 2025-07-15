# Complete TrueView Codebase Export for AI Evaluation

## Issue: Search Results Limited to 20 Instead of All Available Results

### Key Files

#### 1. Main Search Page (Currently Used)
**File: client/src/pages/basic-search.tsx**
```typescript
// Uses limit: 200 - This is the main search page accessed via /search
const { data: communitiesResponse, isLoading, error } = useQuery({
  queryKey: ["/api/communities/search", { 
    limit: 200, // More communities for map view
    location: debouncedSearchQuery,
    careTypes: selectedCareTypes 
  }],
  queryFn: async () => {
    const limit = 200;
    let url = `/api/communities/search?limit=${limit}`;
    // ... rest of query logic
  }
});
```

#### 2. Rentals Page (Homepage redirects here)
**File: client/src/pages/rentals.tsx**
```typescript
// PROBLEM: Uses limit: 50 - This is where homepage search redirects
const { data: communities = [], isLoading, error } = useQuery({
  queryKey: ['/api/communities/search', { limit: 50 }],
  staleTime: 2 * 60 * 1000,
});
```

#### 3. Homepage Component
**File: client/src/pages/trueview-home.tsx**
```typescript
// Homepage redirects searches to /rentals page
const handleSuggestionClick = (suggestion: string) => {
  setSearchQuery(suggestion);
  setShowSuggestions(false);
  const query = `?q=${encodeURIComponent(suggestion)}`;
  window.location.href = `/rentals${query}`;
};
```

#### 4. App Router Configuration
**File: client/src/App.tsx**
```typescript
<Switch>
  <Route path="/" component={TrueViewHome} />
  <Route path="/search" component={BasicSearch} />
  <Route path="/rentals" component={Rentals} />
  // ... other routes
</Switch>
```

#### 5. Backend Search Endpoint (FIXED)
**File: server/routes.ts**
```typescript
app.get("/api/communities/search", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10000; // Updated from 20
    const offset = parseInt(req.query.offset as string) || 0;
    const location = req.query.location as string;
    const careTypes = req.query.careTypes as string;
    
    console.log('Search parameters received:', { location, limit, offset });
    
    const communities = await storage.searchCommunities({
      location,
      careTypes: careTypes ? careTypes.split(',') : undefined,
      limit,
      offset
    });
    
    res.json(communities);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});
```

#### 6. Database Storage Layer (FIXED)
**File: server/storage.ts**
```typescript
async searchCommunities(params: SearchCommunity): Promise<Community[]> {
  const { location, careTypes, limit = 10000, offset = 0 } = params; // Updated from 20
  
  let query = db.select().from(communities);
  
  if (location) {
    const locationConditions = this.buildLocationSearchConditions(location);
    if (locationConditions) {
      query = query.where(locationConditions);
    }
  }
  
  if (careTypes && careTypes.length > 0) {
    const careTypeConditions = careTypes.map(type => 
      sql`${communities.care_types} && ${[type]}`
    );
    query = query.where(or(...careTypeConditions));
  }
  
  const results = await query.limit(limit).offset(offset);
  console.log(`Search returned ${results.length} communities`);
  return results;
}
```

#### 7. Database Schema
**File: shared/schema.ts**
```typescript
export const communities = pgTable('communities', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  zip_code: text('zip_code'),
  phone: text('phone'),
  website: text('website'),
  email: text('email'),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  care_types: text('care_types').array(),
  amenities: text('amenities').array(),
  // ... many other fields
});
```

### Console Log Evidence
```
Search parameters received: { location: 'Sacramento', limit: 20, offset: 0 }
Search parameters received: { location: 'California', limit: 20, offset: 0 }
Search parameters received: { location: 'Santa Monica', limit: 5, offset: 0 }
Search returned 20 communities
Search returned 5 communities
```

### Database Statistics
- Total communities: 8,053
- California communities: 2,965
- 19 states covered
- PostgreSQL with Drizzle ORM

### Current Request Flow
1. User visits homepage (/)
2. TrueViewHome component loads
3. User searches or clicks suggestion
4. Redirects to `/rentals?q=searchterm`
5. Rentals component loads with `limit: 50`
6. Backend receives request with limit=50
7. Returns only 50 results instead of all matches

### The Fix Needed
Update `client/src/pages/rentals.tsx` line 21:
```typescript
// FROM:
queryKey: ['/api/communities/search', { limit: 50 }],

// TO:
queryKey: ['/api/communities/search', { limit: 10000 }],
```

### Additional Issues to Check
1. Any hardcoded limit=20 values in frontend components
2. Homepage location-based searches using small limits
3. Performance implications of loading 8000+ results
4. Map rendering with thousands of markers

### Test Commands
```bash
# Test backend directly
curl "http://localhost:5000/api/communities/search?limit=10000" | jq length

# Test with location filter
curl "http://localhost:5000/api/communities/search?location=California&limit=10000" | jq length
```

### Project Context
This is a senior living community search platform with:
- React frontend with TypeScript
- Express backend with PostgreSQL
- Mapbox/Leaflet integration
- 8,053 communities across 19 states
- Advanced filtering and search capabilities

The user wants all available search results returned, not just the first 20-50 matches.