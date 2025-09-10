-- Canadian Expansion Verification
-- Generated: August 16, 2025

-- 1. Top 10 Canadian cities by community count
SELECT 
  city,
  state as province,
  COUNT(*) as communities
FROM communities 
WHERE country = 'CA'
GROUP BY city, state
ORDER BY COUNT(*) DESC
LIMIT 10;

-- 2. Verify all provinces have coverage
SELECT 
  state as province,
  MIN(name) as sample_community,
  COUNT(*) as total
FROM communities 
WHERE country = 'CA'
GROUP BY state
ORDER BY state;

-- 3. Platform summary
SELECT 
  CASE 
    WHEN country = 'US' THEN '🇺🇸 United States'
    WHEN country = 'CA' THEN '🇨🇦 Canada'
    WHEN country = 'MX' THEN '🇲🇽 Mexico'
    ELSE country
  END as nation,
  COUNT(*) as communities,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) || '%' as percentage
FROM communities 
GROUP BY country
ORDER BY COUNT(*) DESC;
