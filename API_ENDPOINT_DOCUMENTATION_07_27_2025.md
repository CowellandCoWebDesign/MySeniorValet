# MySeniorValet - Complete API Endpoint Documentation
*Generated: July 27, 2025*

## Overview
This document provides complete documentation for all 200+ API endpoints in the MySeniorValet platform, including request/response formats, authentication requirements, and usage examples.

---

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [Community Endpoints](#community-endpoints)
3. [Search Endpoints](#search-endpoints)
4. [AI Analysis Endpoints](#ai-analysis-endpoints)
5. [User Management Endpoints](#user-management-endpoints)
6. [Family Collaboration Endpoints](#family-collaboration-endpoints)
7. [Tour Management Endpoints](#tour-management-endpoints)
8. [Vendor Marketplace Endpoints](#vendor-marketplace-endpoints)
9. [Admin Endpoints](#admin-endpoints)
10. [Analytics Endpoints](#analytics-endpoints)
11. [Infrastructure Endpoints](#infrastructure-endpoints)

---

## Authentication Endpoints

### GET /api/login
**Purpose**: Initiate Replit OAuth login flow  
**Authentication**: None  
**Response**: Redirect to Replit OAuth

### GET /api/logout
**Purpose**: End user session  
**Authentication**: Required  
**Response**: Redirect to home page

### GET /api/callback
**Purpose**: OAuth callback handler  
**Authentication**: None  
**Response**: Redirect to app with session

### GET /api/auth/user
**Purpose**: Get current authenticated user  
**Authentication**: Required  
**Response**:
```json
{
  "id": "927070657",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user",
  "createdAt": "2025-07-27T00:00:00Z"
}
```

### GET /api/auth/user/role
**Purpose**: Get user role and permissions  
**Authentication**: Required  
**Response**:
```json
{
  "role": "super_admin",
  "email": "admin@example.com",
  "firstName": "Admin",
  "lastName": "User"
}
```

### GET /api/auth/debug
**Purpose**: Debug authentication status  
**Authentication**: None  
**Response**:
```json
{
  "isAuthenticated": true,
  "hasUser": true,
  "userDetails": {
    "hasExpires": true,
    "hasClaims": true,
    "keys": ["claims", "access_token", "refresh_token"]
  },
  "sessionID": "XHiZ8p0Jm8J-Hl3Eb9ZALBXo4RwpAC-L"
}
```

---

## Community Endpoints

### GET /api/communities
**Purpose**: List all communities with pagination  
**Authentication**: None  
**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `sort` (string): Sort field
- `order` (string): asc/desc

**Response**:
```json
{
  "communities": [
    {
      "id": 1,
      "name": "Sunrise Senior Living",
      "address": "123 Main St",
      "city": "Sacramento",
      "state": "CA",
      "careTypes": ["assisted_living", "memory_care"],
      "priceRange": "$3000-$5000",
      "verified": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 26306,
    "totalPages": 1316
  }
}
```

### GET /api/communities/:id
**Purpose**: Get single community details  
**Authentication**: None  
**Response**:
```json
{
  "id": 1,
  "name": "Sunrise Senior Living",
  "description": "Premium senior care facility...",
  "address": "123 Main St",
  "coordinates": {
    "lat": 38.5816,
    "lng": -121.4944
  },
  "careTypes": ["assisted_living", "memory_care"],
  "amenities": ["dining", "activities", "transportation"],
  "photos": ["url1", "url2"],
  "reviews": {
    "average": 4.5,
    "count": 127
  },
  "pricing": {
    "type": "verified",
    "range": "$3000-$5000",
    "details": "Starting at $3000/month"
  }
}
```

### POST /api/communities
**Purpose**: Create new community (admin only)  
**Authentication**: Required (admin/super_admin)  
**Request Body**:
```json
{
  "name": "New Community",
  "address": "456 Oak Ave",
  "city": "Sacramento",
  "state": "CA",
  "careTypes": ["independent_living"]
}
```

### PUT /api/communities/:id
**Purpose**: Update community  
**Authentication**: Required (admin/community_owner)  
**Request Body**: Same as POST

### DELETE /api/communities/:id
**Purpose**: Delete community  
**Authentication**: Required (super_admin only)

### GET /api/communities/by-location/:location
**Purpose**: Get communities by location  
**Authentication**: None  
**Examples**:
- `/api/communities/by-location/California`
- `/api/communities/by-location/Sacramento`

### GET /api/communities/hud-featured
**Purpose**: Get HUD verified affordable communities  
**Authentication**: None  
**Response**: Communities with rent $57-$800/month

### GET /api/communities/trending
**Purpose**: Get popular communities  
**Authentication**: None  
**Query**: `limit` (default: 10)

### GET /api/communities/coastal
**Purpose**: Get coastal region communities  
**Authentication**: None

### GET /api/communities/recent
**Purpose**: Get recently added communities  
**Authentication**: None  
**Query**: `limit` (default: 10)

---

## Search Endpoints

### GET /api/communities/search
**Purpose**: Search communities with filters  
**Authentication**: None  
**Query Parameters**:
- `location` (string): City, state, or zip
- `careType` (array): Care type filters
- `budget` (string): Price range
- `amenities` (array): Required amenities
- `distance` (number): Radius in miles
- `minRating` (number): Minimum rating

**Example**: `/api/communities/search?location=Sacramento&careType=memory_care&budget=3000-5000`

### POST /api/communities/search
**Purpose**: AI-powered natural language search  
**Authentication**: None  
**Request Body**:
```json
{
  "query": "memory care facilities under $4000 near Sacramento with good reviews"
}
```
**Response**:
```json
{
  "interpretation": {
    "location": "Sacramento, CA",
    "careType": ["memory_care"],
    "maxBudget": 4000,
    "requireReviews": true
  },
  "results": [...],
  "aiInsights": "Found 15 memory care facilities..."
}
```

### GET /api/communities/spatial
**Purpose**: Geographic/map-based search  
**Authentication**: None  
**Query Parameters**:
- `swLat` (number): Southwest latitude
- `swLng` (number): Southwest longitude
- `neLat` (number): Northeast latitude
- `neLng` (number): Northeast longitude
- `careType` (array): Filter by care type

**Example**: `/api/communities/spatial?swLat=38.5&swLng=-121.5&neLat=38.6&neLng=-121.4`

### GET /api/communities/near
**Purpose**: Find communities near coordinates  
**Authentication**: None  
**Query Parameters**:
- `lat` (number): Latitude
- `lng` (number): Longitude
- `radius` (number): Radius in miles

---

## AI Analysis Endpoints

### POST /api/ai/analyze
**Purpose**: Get multi-AI analysis of community  
**Authentication**: None  
**Request Body**:
```json
{
  "communityId": 123,
  "analysisType": "comprehensive"
}
```
**Response**:
```json
{
  "claude": {
    "summary": "Well-established facility...",
    "strengths": ["experienced staff", "good location"],
    "concerns": ["limited parking"],
    "confidence": 0.95
  },
  "gemini": {
    "summary": "Quality care provider...",
    "confidence": 0.92
  },
  "consensus": {
    "overallRating": 4.5,
    "recommendation": "Recommended for memory care"
  }
}
```

### POST /api/ai/search
**Purpose**: Natural language search interpretation  
**Authentication**: None  
**Request Body**:
```json
{
  "query": "I need a place for my mom with dementia near my work in downtown Sacramento"
}
```

### POST /api/ai/recommendations
**Purpose**: Get personalized recommendations  
**Authentication**: Required  
**Request Body**:
```json
{
  "careNeeds": ["memory_care", "medication_management"],
  "budget": 4500,
  "location": "Sacramento, CA",
  "preferences": ["pet_friendly", "outdoor_space"]
}
```

### POST /api/ai/pricing-analysis
**Purpose**: Analyze pricing transparency  
**Authentication**: None  
**Request Body**:
```json
{
  "communityId": 123,
  "quotedPrice": 4000
}
```

---

## User Management Endpoints

### GET /api/users/profile
**Purpose**: Get user profile  
**Authentication**: Required

### PUT /api/users/profile
**Purpose**: Update user profile  
**Authentication**: Required  
**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "555-1234",
  "preferences": {
    "notifications": true,
    "newsletter": false
  }
}
```

### GET /api/users/favorites
**Purpose**: Get saved communities  
**Authentication**: Required

### POST /api/users/favorites
**Purpose**: Save community to favorites  
**Authentication**: Required  
**Request Body**:
```json
{
  "communityId": 123,
  "notes": "Mom liked the garden"
}
```

### DELETE /api/users/favorites/:id
**Purpose**: Remove from favorites  
**Authentication**: Required

### GET /api/users/search-history
**Purpose**: Get search history  
**Authentication**: Required

### GET /api/users/tours
**Purpose**: Get scheduled tours  
**Authentication**: Required

---

## Family Collaboration Endpoints

### GET /api/family/groups
**Purpose**: Get user's family groups  
**Authentication**: Required

### POST /api/family/groups
**Purpose**: Create family group  
**Authentication**: Required  
**Request Body**:
```json
{
  "name": "Mom's Care Team",
  "description": "Finding care for mom"
}
```

### POST /api/family/invite
**Purpose**: Invite family member  
**Authentication**: Required  
**Request Body**:
```json
{
  "groupId": 1,
  "email": "sister@example.com",
  "role": "member"
}
```

### GET /api/family/shared-communities
**Purpose**: Get communities shared with family  
**Authentication**: Required

### POST /api/family/share
**Purpose**: Share community with family  
**Authentication**: Required  
**Request Body**:
```json
{
  "groupId": 1,
  "communityId": 123,
  "notes": "This looks promising"
}
```

### POST /api/family/notes
**Purpose**: Add collaborative notes  
**Authentication**: Required

---

## Tour Management Endpoints

### GET /api/tours
**Purpose**: Get all tours  
**Authentication**: Required

### POST /api/tours
**Purpose**: Schedule a tour  
**Authentication**: Required  
**Request Body**:
```json
{
  "communityId": 123,
  "preferredDate": "2025-08-01",
  "preferredTime": "10:00",
  "attendees": ["user@example.com"],
  "notes": "Interested in memory care unit"
}
```

### PUT /api/tours/:id
**Purpose**: Update tour details  
**Authentication**: Required

### DELETE /api/tours/:id
**Purpose**: Cancel tour  
**Authentication**: Required

### POST /api/tours/:id/feedback
**Purpose**: Submit tour feedback  
**Authentication**: Required  
**Request Body**:
```json
{
  "rating": 5,
  "comments": "Very impressed with staff",
  "wouldRecommend": true
}
```

---

## Vendor Marketplace Endpoints

### GET /api/vendors
**Purpose**: List service providers  
**Authentication**: None  
**Query Parameters**:
- `category` (string): Service category
- `location` (string): Service area

### GET /api/vendors/:id
**Purpose**: Get vendor details  
**Authentication**: None

### POST /api/vendors/register
**Purpose**: Register as vendor  
**Authentication**: Required  
**Request Body**:
```json
{
  "businessName": "Senior Moving Services",
  "category": "moving",
  "serviceAreas": ["Sacramento", "Roseville"],
  "description": "Specialized senior relocation",
  "license": "CA-12345"
}
```

### GET /api/vendors/services
**Purpose**: List available services  
**Authentication**: None

### POST /api/vendors/leads
**Purpose**: Submit service request  
**Authentication**: Required

---

## Admin Endpoints

### GET /api/admin/dashboard
**Purpose**: Admin dashboard data  
**Authentication**: Required (admin/super_admin)  
**Response**:
```json
{
  "stats": {
    "totalUsers": 15420,
    "totalCommunities": 26306,
    "activeToursThisWeek": 342,
    "newUsersToday": 87
  },
  "recentActivity": [...],
  "systemHealth": {
    "status": "healthy",
    "uptime": "99.9%"
  }
}
```

### GET /api/admin/users
**Purpose**: List all users  
**Authentication**: Required (admin/super_admin)  
**Query Parameters**:
- `page` (number)
- `limit` (number)
- `search` (string)
- `role` (string)

### PUT /api/admin/users/:id
**Purpose**: Update user details/role  
**Authentication**: Required (super_admin)

### DELETE /api/admin/users/:id
**Purpose**: Delete user  
**Authentication**: Required (super_admin)

### GET /api/admin/communities/pending
**Purpose**: Communities awaiting approval  
**Authentication**: Required (admin)

### POST /api/admin/communities/:id/approve
**Purpose**: Approve community  
**Authentication**: Required (admin)

### GET /api/admin/audit-logs
**Purpose**: System audit logs  
**Authentication**: Required (admin)  
**Query Parameters**:
- `startDate` (ISO date)
- `endDate` (ISO date)
- `action` (string)
- `userId` (string)

### GET /api/admin/analytics/usage
**Purpose**: API usage analytics  
**Authentication**: Required (admin)

### GET /api/admin/analytics/revenue
**Purpose**: Revenue analytics  
**Authentication**: Required (financial_admin)

---

## Analytics Endpoints

### GET /api/analytics/platform-stats
**Purpose**: Public platform statistics  
**Authentication**: None  
**Response**:
```json
{
  "totalCommunities": 26306,
  "verifiedCommunities": 6078,
  "totalReviews": 142567,
  "activeUsers": 15420,
  "lastUpdated": "2025-07-27T23:00:00Z"
}
```

### GET /api/analytics/search-trends
**Purpose**: Popular search terms  
**Authentication**: None

### GET /api/analytics/location-stats
**Purpose**: Communities by location  
**Authentication**: None

### POST /api/analytics/track
**Purpose**: Track user interactions  
**Authentication**: None  
**Request Body**:
```json
{
  "event": "community_view",
  "properties": {
    "communityId": 123,
    "source": "search"
  }
}
```

---

## Infrastructure Endpoints

### GET /api/health
**Purpose**: Health check  
**Authentication**: None  
**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-07-27T23:00:00Z",
  "version": "1.0.0"
}
```

### GET /api/infrastructure/cache/stats
**Purpose**: Cache statistics  
**Authentication**: Required (admin)

### POST /api/infrastructure/cache/clear
**Purpose**: Clear cache  
**Authentication**: Required (super_admin)

### GET /api/infrastructure/monitoring
**Purpose**: System monitoring data  
**Authentication**: Required (admin)

### GET /api/infrastructure/performance
**Purpose**: Performance metrics  
**Authentication**: Required (admin)

---

## Error Responses

All endpoints use consistent error formatting:

### 400 Bad Request
```json
{
  "error": "Invalid request",
  "message": "The 'location' parameter is required",
  "code": "MISSING_PARAMETER"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required",
  "message": "Please log in to access this resource",
  "loginUrl": "/api/login"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions",
  "message": "This action requires admin privileges",
  "requiredRole": "admin"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found",
  "message": "Community with ID 123 not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded",
  "message": "Please wait before making more requests",
  "retryAfter": 60
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred",
  "reference": "ERR-2025-07-27-001"
}
```

---

## Rate Limiting

Different endpoints have different rate limits:

- **Authentication**: 5 requests per minute
- **Search**: 30 requests per minute
- **AI Analysis**: 10 requests per minute
- **Admin Actions**: 20 requests per minute
- **General API**: 100 requests per minute

---

## Authentication Requirements Summary

- **Public Endpoints**: No authentication required
- **User Endpoints**: Replit Auth required
- **Admin Endpoints**: Admin or Super Admin role required
- **Financial Endpoints**: Financial Admin role required
- **Vendor Endpoints**: Vendor role required for management

---

*This documentation covers all 200+ endpoints in the MySeniorValet platform. For implementation examples and SDK usage, please refer to the developer guide.*