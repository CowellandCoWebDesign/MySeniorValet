-- MySeniorValet Database Cleanup Script - EXECUTION
-- Purpose: Remove all demo/placeholder data to enforce golden data rule
-- Date: January 24, 2025

-- Start transaction for safe deletion
BEGIN;

-- Show count before deletion
SELECT COUNT(*) as communities_before FROM communities;

-- Delete all communities with demo data patterns
DELETE FROM communities
WHERE phone LIKE '%555-%' 
   OR phone LIKE '%(555)%'
   OR phone LIKE '%555.%'
   OR phone ~ '\(\d{3}\) \d{3}-0[0-9]{3}$'
   OR phone ~ '\(\d{3}\) 555-\d{4}$';

-- Show count after deletion
SELECT COUNT(*) as communities_after FROM communities;

-- Show how many were deleted
SELECT COUNT(*) as deleted_count FROM communities
WHERE phone LIKE '%555-%' 
   OR phone LIKE '%(555)%'
   OR phone LIKE '%555.%'
   OR phone ~ '\(\d{3}\) \d{3}-0[0-9]{3}$'
   OR phone ~ '\(\d{3}\) 555-\d{4}$';

-- Commit the transaction
COMMIT;

-- Update community count cache after cleanup
UPDATE platform_stats 
SET community_count = (SELECT COUNT(*) FROM communities),
    last_updated = NOW()
WHERE id = 1;

-- Final verification
SELECT COUNT(*) as final_community_count FROM communities;