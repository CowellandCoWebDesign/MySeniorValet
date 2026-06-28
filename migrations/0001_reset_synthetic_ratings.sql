-- Migration: Reset synthetic ratings and add admin override columns
-- Applied: June 2026
-- Purpose: Golden Data Rule compliance — ratings must come from real verified sources only.

-- Step 1: Add admin manual rating override columns (idempotent)
ALTER TABLE communities ADD COLUMN IF NOT EXISTS admin_rating_override NUMERIC(3,1);
ALTER TABLE communities ADD COLUMN IF NOT EXISTS admin_rating_note TEXT;

-- Step 2: Clear all synthetic ratings — set rating=NULL and review_count=0
-- for every community that has no approved reviews on record.
-- This enforces the Golden Data Rule: no community shows a rating
-- unless real users have submitted and had reviews approved.
UPDATE communities
SET rating = NULL,
    review_count = 0
WHERE id NOT IN (
  SELECT DISTINCT community_id
  FROM reviews
  WHERE moderation_status = 'Approved'
);

-- Verification: the following query must return 0 rows after this migration runs.
-- SELECT COUNT(*) FROM communities WHERE rating IS NOT NULL AND review_count = 0;
-- SELECT COUNT(*) FROM communities
--   WHERE rating IS NOT NULL
--   AND id NOT IN (SELECT DISTINCT community_id FROM reviews WHERE moderation_status = 'Approved');
