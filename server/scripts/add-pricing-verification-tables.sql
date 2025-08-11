-- Database Enhancement Phase 2: Pricing History & Verification Tables
-- Date: August 11, 2025
-- Purpose: Add pricing history tracking and enhanced verification features

-- Pricing history tracking table
CREATE TABLE IF NOT EXISTS pricing_history (
  id SERIAL PRIMARY KEY,
  community_id INTEGER REFERENCES communities(id) NOT NULL,
  price_type VARCHAR(50) NOT NULL, -- 'base', 'assisted_living', 'memory_care', 'independent_living', 'skilled_nursing', 'room_single', 'room_shared'
  price_amount DECIMAL(10,2),
  price_min DECIMAL(10,2),
  price_max DECIMAL(10,2),
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE, -- NULL if current price
  source VARCHAR(100) NOT NULL, -- 'HUD', 'community_reported', 'market_intel', 'verified_claim', 'api_import'
  verification_status VARCHAR(50) DEFAULT 'unverified', -- 'unverified', 'pending', 'verified', 'disputed'
  verified_by VARCHAR(255), -- User or system that verified
  verified_at TIMESTAMP,
  notes TEXT,
  metadata JSONB DEFAULT '{}', -- Additional data like currency, payment terms, etc.
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Price change alerts table
CREATE TABLE IF NOT EXISTS price_change_alerts (
  id SERIAL PRIMARY KEY,
  community_id INTEGER REFERENCES communities(id) NOT NULL,
  user_id INTEGER REFERENCES users(id), -- User to alert (NULL for global alerts)
  price_type VARCHAR(50),
  old_price DECIMAL(10,2),
  new_price DECIMAL(10,2),
  change_amount DECIMAL(10,2),
  change_percentage DECIMAL(5,2),
  alert_type VARCHAR(50) DEFAULT 'price_change', -- 'price_change', 'price_drop', 'price_increase'
  alert_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP,
  alert_method VARCHAR(50), -- 'email', 'sms', 'push', 'in_app'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced verified community profiles (extends claimed communities)
CREATE TABLE IF NOT EXISTS verified_community_profiles (
  id SERIAL PRIMARY KEY,
  community_id INTEGER REFERENCES communities(id) UNIQUE NOT NULL,
  claim_id INTEGER REFERENCES community_claims(id),
  
  -- Verification Details
  verification_badge BOOLEAN DEFAULT true,
  verification_tier VARCHAR(50) DEFAULT 'basic', -- 'basic', 'enhanced', 'premium', 'platinum'
  verification_expires DATE,
  
  -- Enhanced Business Information
  business_hours JSONB DEFAULT '{}',
  response_time_hours INTEGER,
  response_rate_percent INTEGER,
  
  -- Direct Booking & Tours
  virtual_tour_url VARCHAR(500),
  booking_url VARCHAR(500),
  calendar_link VARCHAR(500),
  tour_scheduling_enabled BOOLEAN DEFAULT false,
  instant_tour_booking BOOLEAN DEFAULT false,
  
  -- Payment & Insurance
  accepts_medicare BOOLEAN,
  accepts_medicaid BOOLEAN,
  accepts_va_benefits BOOLEAN,
  accepts_private_insurance BOOLEAN,
  insurance_partners JSONB DEFAULT '[]',
  payment_options JSONB DEFAULT '[]',
  
  -- Transparency Features
  price_transparency_enabled BOOLEAN DEFAULT false,
  availability_transparency_enabled BOOLEAN DEFAULT false,
  staff_ratios_public BOOLEAN DEFAULT false,
  inspection_reports_public BOOLEAN DEFAULT false,
  
  -- Marketing Features
  special_offers JSONB DEFAULT '[]',
  featured_amenities JSONB DEFAULT '[]',
  awards_certifications JSONB DEFAULT '[]',
  promotional_video_url VARCHAR(500),
  
  -- Analytics Access
  analytics_enabled BOOLEAN DEFAULT true,
  lead_notifications_enabled BOOLEAN DEFAULT true,
  competitor_insights_enabled BOOLEAN DEFAULT false,
  
  -- Metadata
  last_updated_by VARCHAR(255),
  last_updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Verification activity log for audit trail
CREATE TABLE IF NOT EXISTS verification_activity_log (
  id SERIAL PRIMARY KEY,
  claim_id INTEGER REFERENCES community_claims(id),
  community_id INTEGER REFERENCES communities(id),
  action VARCHAR(100) NOT NULL, -- 'claim_submitted', 'email_sent', 'phone_verified', 'document_uploaded', 'verified', 'rejected', 'suspended'
  performed_by VARCHAR(255),
  performed_by_role VARCHAR(50), -- 'user', 'admin', 'system'
  details JSONB DEFAULT '{}',
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Community pricing updates queue (for batch processing)
CREATE TABLE IF NOT EXISTS pricing_update_queue (
  id SERIAL PRIMARY KEY,
  community_id INTEGER REFERENCES communities(id) NOT NULL,
  update_source VARCHAR(100) NOT NULL, -- 'manual', 'api', 'scraper', 'claim_owner'
  update_data JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  processed_at TIMESTAMP,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pricing_history_community ON pricing_history(community_id);
CREATE INDEX IF NOT EXISTS idx_pricing_history_effective ON pricing_history(effective_date DESC);
CREATE INDEX IF NOT EXISTS idx_pricing_history_source ON pricing_history(source);
CREATE INDEX IF NOT EXISTS idx_pricing_history_verification ON pricing_history(verification_status);

CREATE INDEX IF NOT EXISTS idx_price_alerts_community ON price_change_alerts(community_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_user ON price_change_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_sent ON price_change_alerts(alert_sent);

CREATE INDEX IF NOT EXISTS idx_verified_profiles_tier ON verified_community_profiles(verification_tier);
CREATE INDEX IF NOT EXISTS idx_verified_profiles_expires ON verified_community_profiles(verification_expires);

CREATE INDEX IF NOT EXISTS idx_verification_log_claim ON verification_activity_log(claim_id);
CREATE INDEX IF NOT EXISTS idx_verification_log_community ON verification_activity_log(community_id);
CREATE INDEX IF NOT EXISTS idx_verification_log_action ON verification_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_verification_log_created ON verification_activity_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pricing_queue_status ON pricing_update_queue(status);
CREATE INDEX IF NOT EXISTS idx_pricing_queue_community ON pricing_update_queue(community_id);