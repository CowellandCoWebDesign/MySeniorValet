-- MySeniorValet Database Cleanup Script
-- Purpose: Remove all demo/placeholder data to enforce golden data rule
-- Date: January 24, 2025

-- IMPORTANT: This script will permanently delete communities with demo data
-- Run with caution after backing up the database

-- 1. Identify communities with fake phone numbers (555 pattern)
SELECT COUNT(*) as demo_phone_count
FROM communities 
WHERE phone LIKE '%555-%' 
   OR phone LIKE '%(555)%'
   OR phone LIKE '%555.%';

-- 2. Identify communities with demo data sources
SELECT COUNT(*) as demo_source_count
FROM communities 
WHERE data_source LIKE '%Demo%' 
   OR data_source LIKE '%demo%'
   OR data_source LIKE '%DEMO%'
   OR data_source LIKE '%Sample%'
   OR data_source LIKE '%sample%'
   OR data_source LIKE '%Test%'
   OR data_source LIKE '%test%';

-- 3. Identify communities with sequential phone numbers (potential fake data)
SELECT COUNT(*) as sequential_phone_count
FROM communities
WHERE phone ~ '\(\d{3}\) \d{3}-0[0-9]{3}$'
   OR phone ~ '\(\d{3}\) 555-\d{4}$';

-- 4. Show sample of communities to be deleted
SELECT id, name, city, state, phone, data_source
FROM communities
WHERE phone LIKE '%555-%' 
   OR phone LIKE '%(555)%'
   OR phone LIKE '%555.%'
   OR data_source LIKE '%Demo%'
   OR data_source LIKE '%demo%'
   OR data_source LIKE '%Sample%'
   OR data_source LIKE '%sample%'
LIMIT 20;

-- 5. Delete all communities with demo data
-- UNCOMMENT THE LINES BELOW TO EXECUTE DELETION
-- BEGIN;

-- DELETE FROM communities
-- WHERE phone LIKE '%555-%' 
--    OR phone LIKE '%(555)%'
--    OR phone LIKE '%555.%'
--    OR data_source LIKE '%Demo%'
--    OR data_source LIKE '%demo%'
--    OR data_source LIKE '%DEMO%'
--    OR data_source LIKE '%Sample%'
--    OR data_source LIKE '%sample%'
--    OR data_source LIKE '%Test%'
--    OR data_source LIKE '%test%'
--    OR phone ~ '\(\d{3}\) \d{3}-0[0-9]{3}$'
--    OR phone ~ '\(\d{3}\) 555-\d{4}$';

-- COMMIT;

-- 6. Verify deletion results
-- SELECT COUNT(*) as remaining_communities FROM communities;

-- 7. Update community count cache after cleanup
-- UPDATE platform_stats 
-- SET community_count = (SELECT COUNT(*) FROM communities),
--     last_updated = NOW()
-- WHERE id = 1;