-- Add missing columns to tours table for TourMate™ system
ALTER TABLE tours 
ADD COLUMN IF NOT EXISTS preferred_date DATE,
ADD COLUMN IF NOT EXISTS preferred_time VARCHAR(50),
ADD COLUMN IF NOT EXISTS alternative_date DATE,
ADD COLUMN IF NOT EXISTS alternative_time VARCHAR(50),
ADD COLUMN IF NOT EXISTS contact_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS party_size INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS interested_in_care_level TEXT[],
ADD COLUMN IF NOT EXISTS source VARCHAR(100),
ADD COLUMN IF NOT EXISTS utm_params JSONB,
ADD COLUMN IF NOT EXISTS confirmation_code VARCHAR(50);

-- Update existing tour_date column to use preferred_date
UPDATE tours SET preferred_date = tour_date::DATE WHERE preferred_date IS NULL;

-- Update existing attendee_count to party_size
UPDATE tours SET party_size = attendee_count WHERE party_size IS NULL;

-- Verify the structure
\d tours
