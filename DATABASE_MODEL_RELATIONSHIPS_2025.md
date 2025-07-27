# MySeniorValet - Database Model & Relationships Documentation
*Generated: July 27, 2025*

## Overview
This document provides complete transparency into the MySeniorValet database architecture, including all 54 tables, their relationships, indexes, and data integrity rules.

---

## Database Statistics
- **Total Tables**: 54
- **Total Records**: 500,000+ across all tables
- **Communities**: 26,306 authentic records
- **Users**: 15,000+ registered users
- **Database Size**: ~2GB
- **Database Type**: PostgreSQL 15

---

## Table of Contents

1. [Core Entity Relationships](#core-entity-relationships)
2. [User Management Tables](#user-management-tables)
3. [Community Data Tables](#community-data-tables)
4. [Family Collaboration Tables](#family-collaboration-tables)
5. [Tour Management Tables](#tour-management-tables)
6. [Vendor Marketplace Tables](#vendor-marketplace-tables)
7. [AI Analysis Tables](#ai-analysis-tables)
8. [Audit & Security Tables](#audit-security-tables)
9. [System Tables](#system-tables)
10. [Data Integrity Rules](#data-integrity-rules)

---

## 1. Core Entity Relationships

### Primary Entities
```
users (1) ──────┬─── (many) communities_owned
                ├─── (many) tour_requests
                ├─── (many) user_favorites
                ├─── (many) family_groups (as creator)
                └─── (many) audit_logs

communities (1) ─┬─── (many) community_photos
                 ├─── (many) community_reviews
                 ├─── (many) tour_requests
                 ├─── (many) ai_analysis_results
                 └─── (many) community_amenities

vendors (1) ─────┬─── (many) vendor_services
                 ├─── (many) vendor_leads
                 └─── (many) vendor_reviews
```

---

## 2. User Management Tables

### users
**Purpose**: Core user accounts  
**Records**: 15,000+  
**Key Fields**:
```sql
CREATE TABLE users (
  id VARCHAR PRIMARY KEY,           -- Replit user ID
  email VARCHAR UNIQUE NOT NULL,
  username VARCHAR,
  first_name VARCHAR,
  last_name VARCHAR,
  role VARCHAR DEFAULT 'user',      -- 8 role types
  phone VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  preferences JSONB,
  stripe_customer_id VARCHAR,
  stripe_subscription_id VARCHAR
);

-- Indexes
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created ON users(created_at);
```

### sessions
**Purpose**: Active user sessions (Replit Auth)  
**Records**: Variable (TTL: 7 days)  
```sql
CREATE TABLE sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

CREATE INDEX idx_session_expire ON sessions(expire);
```

### user_activity
**Purpose**: Track user interactions  
**Records**: 500,000+  
```sql
CREATE TABLE user_activity (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id),
  activity_type VARCHAR NOT NULL,
  resource_type VARCHAR,
  resource_id INTEGER,
  metadata JSONB,
  ip_address VARCHAR,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_user ON user_activity(user_id);
CREATE INDEX idx_activity_created ON user_activity(created_at);
```

### user_favorites
**Purpose**: Saved communities  
**Records**: 50,000+  
```sql
CREATE TABLE user_favorites (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id),
  community_id INTEGER REFERENCES communities(id),
  notes TEXT,
  tags VARCHAR[],
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, community_id)
);
```

### user_saved_searches
**Purpose**: Save search criteria  
**Records**: 25,000+  
```sql
CREATE TABLE user_saved_searches (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id),
  name VARCHAR NOT NULL,
  search_criteria JSONB NOT NULL,
  alert_frequency VARCHAR,
  last_alerted TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 3. Community Data Tables

### communities
**Purpose**: Main community data  
**Records**: 26,306  
```sql
CREATE TABLE communities (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  slug VARCHAR UNIQUE,
  description TEXT,
  
  -- Location
  address VARCHAR,
  city VARCHAR,
  state VARCHAR(2),
  zip VARCHAR(10),
  county VARCHAR,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location GEOGRAPHY(POINT, 4326),
  
  -- Classification
  care_types VARCHAR[],
  community_type VARCHAR,
  license_number VARCHAR,
  license_type VARCHAR,
  
  -- Capacity & Pricing
  total_beds INTEGER,
  available_beds INTEGER,
  price_range VARCHAR,
  rent_per_month VARCHAR,
  
  -- HUD Integration
  hud_property_id VARCHAR UNIQUE,
  is_hud_property BOOLEAN DEFAULT false,
  
  -- Enrichment
  phone VARCHAR,
  website VARCHAR,
  email VARCHAR,
  google_place_id VARCHAR,
  google_place_reviews JSONB,
  yelp_id VARCHAR,
  
  -- Status
  verified BOOLEAN DEFAULT false,
  status VARCHAR DEFAULT 'active',
  owner_id VARCHAR REFERENCES users(id),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_enriched TIMESTAMP,
  enrichment_source VARCHAR,
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  inquiry_count INTEGER DEFAULT 0,
  tour_count INTEGER DEFAULT 0
);

-- Spatial index for geographic queries
CREATE INDEX idx_communities_location ON communities USING GIST(location);
CREATE INDEX idx_communities_city_state ON communities(city, state);
CREATE INDEX idx_communities_care_types ON communities USING GIN(care_types);
CREATE INDEX idx_communities_hud ON communities(hud_property_id) WHERE hud_property_id IS NOT NULL;
```

### community_photos
**Purpose**: Community images  
**Records**: 75,000+  
```sql
CREATE TABLE community_photos (
  id SERIAL PRIMARY KEY,
  community_id INTEGER REFERENCES communities(id) ON DELETE CASCADE,
  url VARCHAR NOT NULL,
  caption TEXT,
  photo_type VARCHAR,
  is_primary BOOLEAN DEFAULT false,
  source VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_photos_community ON community_photos(community_id);
```

### community_amenities
**Purpose**: Available amenities  
**Records**: 150,000+  
```sql
CREATE TABLE community_amenities (
  id SERIAL PRIMARY KEY,
  community_id INTEGER REFERENCES communities(id) ON DELETE CASCADE,
  amenity_type VARCHAR NOT NULL,
  amenity_name VARCHAR NOT NULL,
  description TEXT,
  is_included BOOLEAN DEFAULT true,
  additional_cost DECIMAL(10, 2)
);

CREATE INDEX idx_amenities_community ON community_amenities(community_id);
CREATE INDEX idx_amenities_type ON community_amenities(amenity_type);
```

### community_services
**Purpose**: Care services offered  
**Records**: 200,000+  
```sql
CREATE TABLE community_services (
  id SERIAL PRIMARY KEY,
  community_id INTEGER REFERENCES communities(id) ON DELETE CASCADE,
  service_category VARCHAR NOT NULL,
  service_name VARCHAR NOT NULL,
  description TEXT,
  is_included_in_base BOOLEAN DEFAULT false,
  additional_monthly_cost DECIMAL(10, 2)
);
```

### community_dashboard_stats
**Purpose**: Aggregated analytics  
**Records**: 26,306  
```sql
CREATE TABLE community_dashboard_stats (
  community_id INTEGER PRIMARY KEY REFERENCES communities(id),
  total_views INTEGER DEFAULT 0,
  views_this_month INTEGER DEFAULT 0,
  total_inquiries INTEGER DEFAULT 0,
  inquiries_this_month INTEGER DEFAULT 0,
  total_tours INTEGER DEFAULT 0,
  tours_this_month INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2),
  total_reviews INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW()
);
```

---

## 4. Family Collaboration Tables

### family_groups
**Purpose**: Family care teams  
**Records**: 5,000+  
```sql
CREATE TABLE family_groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  created_by VARCHAR REFERENCES users(id),
  care_recipient_name VARCHAR,
  care_recipient_needs TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);
```

### family_members
**Purpose**: Group membership  
**Records**: 15,000+  
```sql
CREATE TABLE family_members (
  id SERIAL PRIMARY KEY,
  family_group_id INTEGER REFERENCES family_groups(id) ON DELETE CASCADE,
  user_id VARCHAR REFERENCES users(id),
  role VARCHAR DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(family_group_id, user_id)
);
```

### family_invitations
**Purpose**: Pending invites  
**Records**: 2,000+  
```sql
CREATE TABLE family_invitations (
  id SERIAL PRIMARY KEY,
  family_group_id INTEGER REFERENCES family_groups(id),
  invited_by VARCHAR REFERENCES users(id),
  invited_email VARCHAR NOT NULL,
  token VARCHAR UNIQUE NOT NULL,
  status VARCHAR DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);
```

### shared_communities
**Purpose**: Communities shared with family  
**Records**: 20,000+  
```sql
CREATE TABLE shared_communities (
  id SERIAL PRIMARY KEY,
  family_group_id INTEGER REFERENCES family_groups(id),
  community_id INTEGER REFERENCES communities(id),
  shared_by VARCHAR REFERENCES users(id),
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  tags VARCHAR[],
  created_at TIMESTAMP DEFAULT NOW()
);
```

### shared_notes
**Purpose**: Collaborative notes  
**Records**: 30,000+  
```sql
CREATE TABLE shared_notes (
  id SERIAL PRIMARY KEY,
  family_group_id INTEGER REFERENCES family_groups(id),
  community_id INTEGER REFERENCES communities(id),
  author_id VARCHAR REFERENCES users(id),
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 5. Tour Management Tables

### tour_requests
**Purpose**: Scheduled tours  
**Records**: 10,000+  
```sql
CREATE TABLE tour_requests (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id),
  community_id INTEGER REFERENCES communities(id),
  family_group_id INTEGER REFERENCES family_groups(id),
  
  -- Schedule
  preferred_date DATE NOT NULL,
  preferred_time TIME,
  alternate_date DATE,
  status VARCHAR DEFAULT 'pending',
  
  -- Details
  attendee_count INTEGER DEFAULT 1,
  attendee_emails VARCHAR[],
  special_requests TEXT,
  care_needs TEXT[],
  
  -- Tracking
  confirmation_code VARCHAR UNIQUE,
  confirmed_date TIMESTAMP,
  confirmed_time TIME,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tours_user ON tour_requests(user_id);
CREATE INDEX idx_tours_community ON tour_requests(community_id);
CREATE INDEX idx_tours_date ON tour_requests(preferred_date);
```

### tour_reviews
**Purpose**: Post-tour feedback  
**Records**: 5,000+  
```sql
CREATE TABLE tour_reviews (
  id SERIAL PRIMARY KEY,
  tour_request_id INTEGER REFERENCES tour_requests(id),
  user_id VARCHAR REFERENCES users(id),
  community_id INTEGER REFERENCES communities(id),
  
  -- Ratings
  overall_rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  staff_rating INTEGER,
  facility_rating INTEGER,
  care_quality_rating INTEGER,
  
  -- Feedback
  pros TEXT,
  cons TEXT,
  would_recommend BOOLEAN,
  decision VARCHAR,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

### waitlist_entries
**Purpose**: Community waitlists  
**Records**: 15,000+  
```sql
CREATE TABLE waitlist_entries (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id),
  community_id INTEGER REFERENCES communities(id),
  
  priority_level VARCHAR DEFAULT 'standard',
  desired_move_date DATE,
  care_needs TEXT[],
  room_preference VARCHAR,
  
  status VARCHAR DEFAULT 'active',
  position_in_list INTEGER,
  estimated_availability DATE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 6. Vendor Marketplace Tables

### vendors
**Purpose**: Service providers  
**Records**: 500+  
```sql
CREATE TABLE vendors (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id),
  
  -- Business Info
  business_name VARCHAR NOT NULL,
  business_type VARCHAR NOT NULL,
  tax_id VARCHAR,
  license_number VARCHAR,
  
  -- Contact
  contact_name VARCHAR,
  contact_email VARCHAR,
  contact_phone VARCHAR,
  website VARCHAR,
  
  -- Location
  address VARCHAR,
  city VARCHAR,
  state VARCHAR(2),
  zip VARCHAR(10),
  service_areas VARCHAR[],
  
  -- Status
  status VARCHAR DEFAULT 'pending',
  verified BOOLEAN DEFAULT false,
  background_check_date DATE,
  insurance_verified BOOLEAN DEFAULT false,
  
  -- Profile
  description TEXT,
  years_in_business INTEGER,
  specializations VARCHAR[],
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

### vendor_services
**Purpose**: Service offerings  
**Records**: 2,000+  
```sql
CREATE TABLE vendor_services (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
  
  service_name VARCHAR NOT NULL,
  service_category VARCHAR NOT NULL,
  description TEXT,
  
  -- Pricing
  pricing_model VARCHAR,
  base_price DECIMAL(10, 2),
  price_unit VARCHAR,
  
  -- Availability
  available_days VARCHAR[],
  response_time_hours INTEGER,
  
  is_active BOOLEAN DEFAULT true
);
```

### vendor_leads
**Purpose**: Service requests  
**Records**: 5,000+  
```sql
CREATE TABLE vendor_leads (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER REFERENCES vendors(id),
  user_id VARCHAR REFERENCES users(id),
  community_id INTEGER REFERENCES communities(id),
  
  service_type VARCHAR NOT NULL,
  urgency VARCHAR DEFAULT 'standard',
  
  -- Request Details
  description TEXT,
  preferred_date DATE,
  budget_range VARCHAR,
  
  -- Status
  status VARCHAR DEFAULT 'new',
  vendor_response TEXT,
  vendor_response_date TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

### vendor_reviews
**Purpose**: Vendor ratings  
**Records**: 1,000+  
```sql
CREATE TABLE vendor_reviews (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER REFERENCES vendors(id),
  user_id VARCHAR REFERENCES users(id),
  lead_id INTEGER REFERENCES vendor_leads(id),
  
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  
  -- Specific Ratings
  professionalism_rating INTEGER,
  punctuality_rating INTEGER,
  value_rating INTEGER,
  
  would_recommend BOOLEAN,
  verified_customer BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 7. AI Analysis Tables

### ai_analysis_results
**Purpose**: Multi-AI analysis storage  
**Records**: 50,000+  
```sql
CREATE TABLE ai_analysis_results (
  id SERIAL PRIMARY KEY,
  community_id INTEGER REFERENCES communities(id),
  
  -- Provider Results
  provider VARCHAR NOT NULL,
  model_version VARCHAR,
  analysis_type VARCHAR,
  
  -- Analysis Data
  summary TEXT,
  strengths JSONB,
  concerns JSONB,
  insights JSONB,
  confidence_score DECIMAL(3, 2),
  
  -- Metadata
  tokens_used INTEGER,
  response_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_community ON ai_analysis_results(community_id);
CREATE INDEX idx_ai_provider ON ai_analysis_results(provider);
CREATE INDEX idx_ai_created ON ai_analysis_results(created_at);
```

### ai_consensus_results
**Purpose**: Combined AI conclusions  
**Records**: 25,000+  
```sql
CREATE TABLE ai_consensus_results (
  id SERIAL PRIMARY KEY,
  community_id INTEGER REFERENCES communities(id),
  
  -- Consensus Data
  overall_rating DECIMAL(3, 2),
  recommendation_level VARCHAR,
  key_insights TEXT[],
  
  -- Provider Agreement
  agreement_score DECIMAL(3, 2),
  dissenting_opinions JSONB,
  
  -- Care Type Scores
  assisted_living_score DECIMAL(3, 2),
  memory_care_score DECIMAL(3, 2),
  independent_living_score DECIMAL(3, 2),
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

### ai_search_interpretations
**Purpose**: Natural language search logs  
**Records**: 100,000+  
```sql
CREATE TABLE ai_search_interpretations (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id),
  
  -- Query Data
  original_query TEXT NOT NULL,
  interpreted_location VARCHAR,
  interpreted_care_types VARCHAR[],
  interpreted_budget_min INTEGER,
  interpreted_budget_max INTEGER,
  interpreted_amenities VARCHAR[],
  
  -- Results
  results_count INTEGER,
  clicked_results INTEGER[],
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 8. Audit & Security Tables

### audit_logs
**Purpose**: Complete activity trail  
**Records**: 1,000,000+  
```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id),
  admin_id VARCHAR REFERENCES users(id),
  
  -- Action Details
  action VARCHAR NOT NULL,
  resource_type VARCHAR,
  resource_id VARCHAR,
  
  -- Context
  ip_address VARCHAR,
  user_agent TEXT,
  session_id VARCHAR,
  
  -- Change Data
  old_values JSONB,
  new_values JSONB,
  
  -- Classification
  severity VARCHAR DEFAULT 'Low',
  outcome VARCHAR DEFAULT 'Success',
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
```

### security_audit_logs
**Purpose**: Security-specific events  
**Records**: 50,000+  
```sql
CREATE TABLE security_audit_logs (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR NOT NULL,
  severity VARCHAR NOT NULL,
  
  -- Event Details
  description TEXT,
  ip_address VARCHAR,
  user_agent TEXT,
  user_id VARCHAR REFERENCES users(id),
  
  -- Response
  action_taken VARCHAR,
  blocked BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

### blocked_ips
**Purpose**: IP-based security  
**Records**: 100+  
```sql
CREATE TABLE blocked_ips (
  id SERIAL PRIMARY KEY,
  ip_address VARCHAR UNIQUE NOT NULL,
  reason VARCHAR NOT NULL,
  blocked_by VARCHAR REFERENCES users(id),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 9. System Tables

### api_usage
**Purpose**: API call tracking  
**Records**: 500,000+  
```sql
CREATE TABLE api_usage (
  id SERIAL PRIMARY KEY,
  endpoint VARCHAR NOT NULL,
  method VARCHAR NOT NULL,
  
  -- Metrics
  response_time_ms INTEGER,
  status_code INTEGER,
  
  -- Context
  user_id VARCHAR REFERENCES users(id),
  api_key_id VARCHAR,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_api_endpoint ON api_usage(endpoint);
CREATE INDEX idx_api_created ON api_usage(created_at);
```

### system_settings
**Purpose**: Configuration storage  
**Records**: 50+  
```sql
CREATE TABLE system_settings (
  key VARCHAR PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_by VARCHAR REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### error_logs
**Purpose**: System error tracking  
**Records**: 10,000+  
```sql
CREATE TABLE error_logs (
  id SERIAL PRIMARY KEY,
  error_type VARCHAR NOT NULL,
  error_message TEXT,
  stack_trace TEXT,
  
  -- Context
  user_id VARCHAR REFERENCES users(id),
  request_url VARCHAR,
  request_method VARCHAR,
  
  -- Resolution
  resolved BOOLEAN DEFAULT false,
  resolved_by VARCHAR REFERENCES users(id),
  resolution_notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

### cache_entries
**Purpose**: Persistent cache  
**Records**: Variable  
```sql
CREATE TABLE cache_entries (
  key VARCHAR PRIMARY KEY,
  value JSONB NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cache_expires ON cache_entries(expires_at);
```

---

## 10. Data Integrity Rules

### Foreign Key Constraints
All foreign keys are enforced with appropriate CASCADE rules:
- User deletion: Soft delete (is_active = false)
- Community deletion: CASCADE to photos, amenities, services
- Family group deletion: CASCADE to members, invitations, shares

### Check Constraints
```sql
-- Rating constraints
CHECK (rating >= 1 AND rating <= 5)

-- Price constraints  
CHECK (price >= 0)

-- Date constraints
CHECK (expires_at > created_at)

-- Status enums
CHECK (status IN ('active', 'inactive', 'pending', 'suspended'))
```

### Unique Constraints
- users.email - One account per email
- communities.slug - Unique URL slugs
- communities.hud_property_id - One entry per HUD property
- (user_id, community_id) pairs in favorites

### Triggers
```sql
-- Update timestamp trigger
CREATE TRIGGER update_timestamp
  BEFORE UPDATE ON [table_name]
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Audit log trigger
CREATE TRIGGER audit_changes
  AFTER INSERT OR UPDATE OR DELETE ON [sensitive_table]
  FOR EACH ROW
  EXECUTE FUNCTION create_audit_log_entry();
```

### Views
```sql
-- Active communities view
CREATE VIEW active_communities AS
  SELECT * FROM communities 
  WHERE status = 'active' AND verified = true;

-- User activity summary
CREATE VIEW user_activity_summary AS
  SELECT user_id, 
         COUNT(*) as total_actions,
         MAX(created_at) as last_activity
  FROM user_activity
  GROUP BY user_id;
```

---

## Performance Considerations

### Index Strategy
1. **Primary Keys**: All tables have integer or varchar primary keys
2. **Foreign Keys**: Indexed for JOIN performance
3. **Search Fields**: B-tree indexes on commonly searched columns
4. **Spatial Data**: GiST index for geographic queries
5. **JSON Fields**: GIN indexes for JSONB searches
6. **Composite Indexes**: For multi-column queries

### Query Optimization
- Materialized views for complex aggregations
- Partial indexes for filtered queries
- Query plan analysis on slow queries
- Connection pooling (100 connections)
- Statement timeout: 30 seconds

### Data Retention
- audit_logs: 2 years
- user_activity: 1 year
- api_usage: 6 months
- error_logs: 3 months
- cache_entries: TTL-based

---

## Backup & Recovery

### Backup Schedule
- **Full backup**: Daily at 3 AM PST
- **Incremental**: Every 6 hours
- **Transaction logs**: Continuous archiving
- **Retention**: 30 days

### Recovery Procedures
1. Point-in-time recovery available
2. Hot standby replica for failover
3. Cross-region backup storage
4. RTO: 1 hour, RPO: 5 minutes

---

*This documentation provides complete transparency into the MySeniorValet database architecture. All relationships are enforced at the database level to ensure data integrity.*