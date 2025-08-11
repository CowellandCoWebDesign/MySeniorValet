# Database Enhancement Phase 2: Pricing History & Community Verification
## Implementation Date: August 11, 2025
## Status: PHASE 2 DATABASE INFRASTRUCTURE COMPLETE ✅

## Overview
Implementing two critical systems for platform transparency and trust:
1. **Pricing History System**: Track and display historical pricing changes for full transparency
2. **Community Claims & Verification**: Allow communities to claim and verify their listings (similar to Google My Business, Yelp, etc.)

## Phase 2A: Pricing History & Transparency

### Database Schema
```sql
-- Pricing history tracking table
CREATE TABLE pricing_history (
  id SERIAL PRIMARY KEY,
  community_id INTEGER REFERENCES communities(id),
  price_type VARCHAR(50), -- 'base', 'assisted_living', 'memory_care', 'room_single', 'room_shared'
  price_amount DECIMAL(10,2),
  price_min DECIMAL(10,2),
  price_max DECIMAL(10,2),
  effective_date DATE,
  end_date DATE, -- NULL if current price
  source VARCHAR(100), -- 'HUD', 'community_reported', 'market_intel', 'verified_claim'
  verification_status VARCHAR(50) DEFAULT 'unverified', -- 'unverified', 'pending', 'verified', 'disputed'
  verified_by VARCHAR(255), -- User or system that verified
  verified_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Price change alerts table
CREATE TABLE price_change_alerts (
  id SERIAL PRIMARY KEY,
  community_id INTEGER REFERENCES communities(id),
  old_price DECIMAL(10,2),
  new_price DECIMAL(10,2),
  change_amount DECIMAL(10,2),
  change_percentage DECIMAL(5,2),
  alert_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Features
- Track all price changes over time
- Show pricing trends and history graphs
- Alert users when prices change for saved communities
- Display source of pricing information
- Verification badges for confirmed prices

## Phase 2B: Community Claims & Verification System

### Database Schema
```sql
-- Community claims table (for ownership verification)
CREATE TABLE community_claims (
  id SERIAL PRIMARY KEY,
  community_id INTEGER REFERENCES communities(id),
  claimant_user_id VARCHAR(255) REFERENCES users(id),
  claimant_email VARCHAR(255) NOT NULL,
  claimant_name VARCHAR(255) NOT NULL,
  claimant_title VARCHAR(255), -- 'Owner', 'Administrator', 'Marketing Director', etc.
  claimant_phone VARCHAR(50),
  business_email VARCHAR(255), -- Official community email
  business_phone VARCHAR(50), -- Official community phone
  verification_method VARCHAR(50), -- 'email', 'phone', 'document', 'manual'
  verification_code VARCHAR(100), -- For email/phone verification
  verification_documents JSONB, -- Store uploaded document references
  claim_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'verified', 'rejected', 'expired'
  claimed_at TIMESTAMP DEFAULT NOW(),
  verified_at TIMESTAMP,
  rejected_at TIMESTAMP,
  rejection_reason TEXT,
  verified_by VARCHAR(255), -- Admin who verified manually
  metadata JSONB, -- Additional verification data
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Verified community profiles (enhanced data from claims)
CREATE TABLE verified_community_profiles (
  id SERIAL PRIMARY KEY,
  community_id INTEGER REFERENCES communities(id) UNIQUE,
  claim_id INTEGER REFERENCES community_claims(id),
  verification_badge BOOLEAN DEFAULT true,
  business_hours JSONB,
  special_offers JSONB,
  virtual_tour_url VARCHAR(500),
  booking_url VARCHAR(500),
  response_time_hours INTEGER,
  accepts_medicare BOOLEAN,
  accepts_medicaid BOOLEAN,
  accepts_private_insurance BOOLEAN,
  payment_options JSONB,
  staff_ratios JSONB,
  last_updated_by VARCHAR(255),
  last_updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Verification activity log
CREATE TABLE verification_activity_log (
  id SERIAL PRIMARY KEY,
  claim_id INTEGER REFERENCES community_claims(id),
  action VARCHAR(100), -- 'claim_submitted', 'email_sent', 'document_uploaded', 'verified', 'rejected'
  performed_by VARCHAR(255),
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Verification Process Flow
1. **Claim Initiation**
   - Community representative creates account
   - Searches for their community
   - Initiates claim with business details

2. **Verification Methods**
   - **Email Verification**: Send code to official community email
   - **Phone Verification**: Call official number with code
   - **Document Verification**: Upload business license, tax documents
   - **Manual Review**: Admin verification for complex cases

3. **Post-Verification Benefits**
   - ✅ Verified badge on listing
   - 📝 Edit community information
   - 💰 Update pricing directly
   - 📸 Upload photos and virtual tours
   - 📊 Access to analytics dashboard
   - 💬 Respond to reviews
   - 🎯 Priority in search results

### Similar to Industry Standards
- **Google My Business**: Email/phone verification, document upload
- **Yelp for Business**: Claim process with verification
- **Facebook Business**: Page verification system
- **TripAdvisor**: Management verification for hotels

## Implementation Steps

### Step 1: Create Database Tables ✅
- [x] Create pricing_history table
- [x] Create price_change_alerts table  
- [x] Create community_claims table
- [x] Create verified_community_profiles table
- [x] Create verification_activity_log table
- [x] Create pricing_update_queue table
- [x] All indexes created successfully

### Step 2: Update Drizzle Schema ✅
- [x] Add pricing history schemas
- [x] Add community claims schemas
- [x] Add relationships between tables
- [x] All foreign key constraints properly configured

### Step 3: Build API Endpoints
#### Pricing History APIs
- [ ] GET /api/communities/:id/pricing-history
- [ ] POST /api/communities/:id/pricing (for verified owners)
- [ ] GET /api/pricing/trends/:communityId
- [ ] POST /api/pricing/alerts/subscribe

#### Community Claims APIs
- [ ] POST /api/claims/initiate
- [ ] POST /api/claims/verify-email
- [ ] POST /api/claims/verify-phone
- [ ] POST /api/claims/upload-documents
- [ ] GET /api/claims/status/:claimId
- [ ] PATCH /api/claims/:id/approve (admin only)
- [ ] PATCH /api/claims/:id/reject (admin only)

### Step 4: Frontend Implementation
- [ ] Claims dashboard for communities
- [ ] Verification workflow UI
- [ ] Pricing history charts
- [ ] Admin verification panel

### Step 5: Testing & Validation
- [ ] Test verification flow
- [ ] Test pricing updates
- [ ] Test notification system
- [ ] Security audit

## Success Metrics - Database Infrastructure
- [x] Pricing history tracking table created
- [x] Claims system database ready
- [x] Verification tables operational
- [x] All foreign key constraints verified
- [x] All indexes created for performance
- [x] Database ready for API implementation

## Next Implementation Phase: API & Frontend
- [ ] Build pricing history API endpoints
- [ ] Create community claims workflow
- [ ] Implement email/phone verification
- [ ] Build admin verification panel
- [ ] Add verified badge display

## Security Considerations
- Prevent fake claims through multi-factor verification
- Document verification for high-value listings
- Rate limiting on claim attempts
- Audit trail for all verification activities
- Regular review of verified accounts

## Revenue Opportunities
1. **Premium Verification** ($99/year)
   - Expedited verification
   - Enhanced profile features
   - Priority support

2. **Analytics Dashboard** ($49/month)
   - Detailed visitor insights
   - Competitor pricing analysis
   - Lead quality scoring

3. **Featured Listings** ($299/month)
   - Top placement in search
   - Highlighted profile
   - Custom branding