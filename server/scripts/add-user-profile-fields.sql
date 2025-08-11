-- Database Enhancement Phase 1: User Profile Fields Migration
-- Date: August 11, 2025
-- Purpose: Add critical user profile enhancement fields

-- Add relationship to care field
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS relationship_to_care TEXT 
CHECK (relationship_to_care IN (
  'Seeking for Self', 
  'Seeking for Parent', 
  'Seeking for Spouse', 
  'Seeking for Other Family', 
  'Healthcare Professional'
));

-- Add care needs array
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS care_needs TEXT[] DEFAULT '{}';

-- Add search preferences JSON
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS search_preferences JSONB DEFAULT '{}';

-- Add notifications JSON with defaults
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS notifications JSONB DEFAULT '{
  "emailNotifications": true,
  "smsNotifications": false,
  "newListings": false,
  "priceAlerts": false,
  "messageAlerts": true,
  "reviewReminders": false
}'::jsonb;

-- Add dashboard preferences JSON with defaults
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS dashboard_preferences JSONB DEFAULT '{
  "layoutType": "detailed",
  "fontSize": "medium",
  "highContrast": false,
  "reducedMotion": false,
  "cardSize": "comfortable",
  "showHelpTips": true,
  "quickActions": ["search", "favorites", "schedule-tour", "family-share"],
  "dashboardSections": {
    "favorites": {"visible": true, "order": 1},
    "recentSearches": {"visible": true, "order": 2},
    "recommendations": {"visible": true, "order": 3},
    "savedCommunities": {"visible": true, "order": 4},
    "tourSchedule": {"visible": true, "order": 5},
    "familyNotes": {"visible": true, "order": 6}
  }
}'::jsonb;