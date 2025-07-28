-- Insert 1-800-FLORALS as premium vendor partner
INSERT INTO vendors (
  user_id,
  business_name,
  contact_name,
  contact_email,
  contact_phone,
  website,
  description,
  business_address,
  service_categories,
  service_areas,
  years_in_business,
  is_verified,
  verification_date,
  status,
  subscription_plan_id,
  average_rating,
  total_reviews,
  specializations
) VALUES (
  'vendor_800florals',
  '1-800-FLORALS',
  'Customer Service Team',
  'service@800florals.com',
  '1-800-356-7257',
  'https://www.800florals.com',
  'Professional florist network with over 95 years of experience, specializing in fresh flowers and plants delivered nationwide. Trusted partner for senior living communities with special rates and services.',
  'Nationwide Network, United States',
  ARRAY['florals', 'gifts', 'plants'],
  ARRAY['United States', 'Canada', 'Continental US'],
  95,
  true,
  NOW(),
  'active',
  3, -- Premium plan
  4.8,
  15000,
  ARRAY['Fresh Flower Delivery', 'Senior Living Specialist', 'Same-Day Delivery', 'Nationwide Network', 'Professional Florists']
)
ON CONFLICT (user_id) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  contact_email = EXCLUDED.contact_email,
  website = EXCLUDED.website,
  description = EXCLUDED.description,
  is_verified = EXCLUDED.is_verified,
  average_rating = EXCLUDED.average_rating,
  total_reviews = EXCLUDED.total_reviews,
  updated_at = NOW();

-- Get the vendor ID for service insertion
DO $$
DECLARE
    florals_vendor_id INTEGER;
BEGIN
    SELECT id INTO florals_vendor_id FROM vendors WHERE user_id = 'vendor_800florals';

    -- Insert floral services
    INSERT INTO vendor_services (
        vendor_id,
        category_id,
        service_name,
        service_description,
        pricing_type,
        price,
        price_unit,
        price_range,
        duration,
        included_features,
        is_active,
        service_area,
        availability_schedule,
        special_requirements
    ) VALUES 
    (
        florals_vendor_id,
        (SELECT id FROM vendor_service_categories WHERE category_name = 'Home Services' LIMIT 1),
        'Move-In Welcome Arrangements',
        'Beautiful floral arrangements to welcome new senior living residents to their new home. Special pricing available for senior living communities.',
        'fixed',
        89.95,
        'per_arrangement',
        '{"min": 59.95, "max": 199.95}',
        60,
        ARRAY['Professional Design', 'Fresh Flowers', 'Decorative Vase', 'Same-Day Delivery Available', 'Welcome Message Card'],
        true,
        ARRAY['Continental US', 'Canada'],
        '{"days": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"], "hours": {"start": "08:00", "end": "17:00"}}',
        ARRAY['Address Verification Required', 'Delivery Date Coordination']
    ),
    (
        florals_vendor_id,
        (SELECT id FROM vendor_service_categories WHERE category_name = 'Home Services' LIMIT 1),
        'Monthly Bloom Subscription',
        'Regular monthly flower delivery service for senior living residents. Keep spaces bright and cheerful with fresh seasonal arrangements.',
        'subscription',
        69.95,
        'per_month',
        '{"min": 49.95, "max": 129.95}',
        30,
        ARRAY['Monthly Fresh Arrangements', 'Seasonal Variety', 'Professional Design', 'Flexible Scheduling', '20% Senior Discount'],
        true,
        ARRAY['Continental US', 'Canada'],
        '{"days": ["monday", "tuesday", "wednesday", "thursday", "friday"], "hours": {"start": "08:00", "end": "17:00"}}',
        ARRAY['Monthly Delivery Schedule', 'Payment Setup Required']
    ),
    (
        florals_vendor_id,
        (SELECT id FROM vendor_service_categories WHERE category_name = 'Personal Care' LIMIT 1),
        'Celebration & Special Occasion Flowers',
        'Custom floral arrangements for birthdays, anniversaries, holidays, and other special occasions. Perfect for family visits and celebrations.',
        'quote',
        NULL,
        'per_occasion',
        '{"min": 49.95, "max": 299.95}',
        90,
        ARRAY['Custom Design Consultation', 'Occasion-Specific Arrangements', 'Family Coordination', 'Delivery Scheduling', 'Photo Updates'],
        true,
        ARRAY['Continental US', 'Canada'],
        '{"days": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"], "hours": {"start": "08:00", "end": "18:00"}}',
        ARRAY['Event Date Coordination', 'Custom Requirements Discussion']
    ),
    (
        florals_vendor_id,
        (SELECT id FROM vendor_service_categories WHERE category_name = 'Healthcare' LIMIT 1),
        'Sympathy & Comfort Arrangements',
        'Thoughtful floral tributes and comfort arrangements for difficult times. Professional, respectful service with flexible delivery options.',
        'fixed',
        124.95,
        'per_arrangement',
        '{"min": 79.95, "max": 249.95}',
        120,
        ARRAY['Respectful Professional Design', 'Sympathy Card Included', 'Flexible Delivery', 'Family Coordination', 'Tribute Options'],
        true,
        ARRAY['Continental US', 'Canada'],
        '{"days": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"], "hours": {"start": "08:00", "end": "20:00"}}',
        ARRAY['Sensitive Timing Coordination', 'Family Communication']
    )
    ON CONFLICT (vendor_id, service_name) DO UPDATE SET
        service_description = EXCLUDED.service_description,
        price = EXCLUDED.price,
        price_range = EXCLUDED.price_range,
        included_features = EXCLUDED.included_features,
        updated_at = NOW();

END $$;

-- Create service integration record
INSERT INTO service_integrations (
    vendor_id,
    service_name,
    integration_url,
    affiliate_id,
    commission_rate,
    is_active
) VALUES (
    (SELECT id FROM vendors WHERE user_id = 'vendor_800florals'),
    '1-800-FLORALS',
    'https://www.800florals.com',
    'movein_support_florals',
    0.08, -- 8% commission rate
    true
)
ON CONFLICT (vendor_id, service_name) DO UPDATE SET
    integration_url = EXCLUDED.integration_url,
    affiliate_id = EXCLUDED.affiliate_id,
    commission_rate = EXCLUDED.commission_rate,
    last_updated = NOW();

-- Update vendor featured status
UPDATE vendors 
SET 
    is_featured = true,
    featured_until = NOW() + INTERVAL '1 year',
    partnership_level = 'premium'
WHERE user_id = 'vendor_800florals';