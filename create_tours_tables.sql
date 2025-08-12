-- Create tours table
CREATE TABLE IF NOT EXISTS tours (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
  community_id INTEGER NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  
  -- Tour Details
  preferred_date DATE NOT NULL,
  preferred_time TEXT NOT NULL CHECK (preferred_time IN ('9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM')),
  alternative_date DATE,
  alternative_time TEXT,
  
  -- Contact Information  
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  
  -- Tour Preferences
  tour_type TEXT DEFAULT 'in-person' CHECK (tour_type IN ('in-person', 'virtual', 'self-guided')),
  party_size INTEGER DEFAULT 1,
  special_requests TEXT,
  interested_in_care_level TEXT[],
  
  -- Tour Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rescheduled', 'completed', 'cancelled', 'no-show')),
  confirmed_date DATE,
  confirmed_time TEXT,
  confirmation_code TEXT,
  
  -- Community Response
  community_response TEXT,
  community_notes TEXT,
  assigned_rep_id VARCHAR REFERENCES users(id),
  assigned_rep_name TEXT,
  
  -- Follow-up & Feedback
  tour_completed BOOLEAN DEFAULT false,
  tour_rating INTEGER,
  tour_feedback TEXT,
  follow_up_scheduled BOOLEAN DEFAULT false,
  follow_up_date DATE,
  
  -- Integration with TourTracker™
  tour_tracker_linked BOOLEAN DEFAULT false,
  tour_tracker_score INTEGER,
  
  -- Metadata
  source TEXT DEFAULT 'website' CHECK (source IN ('website', 'mobile', 'phone', 'email', 'partner')),
  referral_source TEXT,
  utm_params JSONB,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for tours table
CREATE INDEX IF NOT EXISTS tours_user_id_idx ON tours(user_id);
CREATE INDEX IF NOT EXISTS tours_community_id_idx ON tours(community_id);
CREATE INDEX IF NOT EXISTS tours_status_idx ON tours(status);
CREATE INDEX IF NOT EXISTS tours_preferred_date_idx ON tours(preferred_date);
CREATE INDEX IF NOT EXISTS tours_created_at_idx ON tours(created_at);

-- Create tour_availability table
CREATE TABLE IF NOT EXISTS tour_availability (
  id SERIAL PRIMARY KEY,
  community_id INTEGER NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  
  -- Availability Settings
  day_of_week INTEGER NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  slot_duration INTEGER DEFAULT 60,
  max_tours_per_slot INTEGER DEFAULT 1,
  
  -- Blackout Dates
  blackout_dates DATE[] DEFAULT '{}',
  
  -- Special Hours
  is_active BOOLEAN DEFAULT true,
  effective_from DATE,
  effective_until DATE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for tour_availability table
CREATE INDEX IF NOT EXISTS tour_availability_community_id_idx ON tour_availability(community_id);
CREATE INDEX IF NOT EXISTS tour_availability_day_of_week_idx ON tour_availability(day_of_week);
