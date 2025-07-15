-- Enable PostGIS extension for geographic data processing
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add location column to communities table
ALTER TABLE communities 
ADD COLUMN IF NOT EXISTS location geography(Point, 4326);

-- Populate location column from existing latitude/longitude data
UPDATE communities 
SET location = ST_SetSRID(ST_MakePoint(longitude::float, latitude::float), 4326)
WHERE latitude IS NOT NULL 
  AND longitude IS NOT NULL
  AND location IS NULL;

-- Create GiST index for efficient spatial queries
CREATE INDEX IF NOT EXISTS communities_location_gist_idx 
ON communities 
USING GIST (location);

-- Create additional performance indexes
CREATE INDEX IF NOT EXISTS communities_city_idx ON communities (city);
CREATE INDEX IF NOT EXISTS communities_state_idx ON communities (state);
CREATE INDEX IF NOT EXISTS communities_zip_code_idx ON communities (zip_code);
CREATE INDEX IF NOT EXISTS communities_care_types_idx ON communities USING gin (care_types);
CREATE INDEX IF NOT EXISTS communities_location_composite_idx ON communities (city, state, zip_code);
CREATE INDEX IF NOT EXISTS communities_coordinates_idx ON communities (latitude, longitude);
CREATE INDEX IF NOT EXISTS communities_rating_idx ON communities (rating);
CREATE INDEX IF NOT EXISTS communities_trending_score_idx ON communities (trending_score);

-- Verify PostGIS installation
SELECT PostGIS_Version();