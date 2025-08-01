-- Add new columns to support mobile home parks and other senior living types
ALTER TABLE communities 
ADD COLUMN IF NOT EXISTS community_subtype TEXT,
ADD COLUMN IF NOT EXISTS age_restriction INTEGER,
ADD COLUMN IF NOT EXISTS lot_rent DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS hoa_fee DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS has_homes_for_sale BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_rentals BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS allows_double_wides BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS allows_single_wides BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS gated_community BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS golf_course BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS resort_style BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS master_planned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS allows_rvs BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS rv_sites_available INTEGER,
ADD COLUMN IF NOT EXISTS rv_hookups TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS park_model_homes BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pet_friendly BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS pet_restrictions TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS active_lifestyle BOOLEAN DEFAULT FALSE;

-- Add constraint for community_subtype
ALTER TABLE communities 
ADD CONSTRAINT check_community_subtype CHECK (
  community_subtype IN (
    'traditional_assisted_living',
    'mobile_home_park',
    'manufactured_home_community',
    'active_adult_55plus',
    'rv_retirement_park',
    'senior_coop',
    'norc',
    'ccah_program',
    'independent_living_facility'
  )
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_communities_subtype ON communities(community_subtype);
CREATE INDEX IF NOT EXISTS idx_communities_age_restriction ON communities(age_restriction);
CREATE INDEX IF NOT EXISTS idx_communities_gated ON communities(gated_community);
CREATE INDEX IF NOT EXISTS idx_communities_allows_rvs ON communities(allows_rvs);