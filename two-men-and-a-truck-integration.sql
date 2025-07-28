-- Two Men and a Truck Integration
-- Complete vendor and services integration for MySeniorValet platform

-- First, create the vendor entry
DO $$
DECLARE
    vendor_id INTEGER;
    moving_category_id INTEGER;
    home_services_category_id INTEGER;
BEGIN
    -- Insert Two Men and a Truck vendor
    INSERT INTO vendors (
        user_id,
        business_name,
        contact_name,
        email,
        phone,
        website,
        address,
        city,
        state,
        zip_code,
        country,
        description,
        vendor_type,
        specializations,
        years_in_business,
        license_number,
        insurance_verified,
        background_check_verified,
        is_verified,
        verification_date,
        service_area,
        operating_hours,
        social_media_links,
        certifications,
        languages_supported,
        emergency_available,
        payment_methods_accepted,
        business_logo_url,
        gallery_images,
        is_national_chain,
        franchise_locations,
        founded_year
    ) VALUES (
        NULL, -- No user_id for national chains
        'TWO MEN AND A TRUCK',
        'TWO MEN AND A TRUCK Customer Service',
        'info@twomenandatruck.com',
        '1-800-345-1070',
        'https://twomenandatruck.com/',
        '3400 Belle Chase Way',
        'Lansing',
        'MI',
        '48911',
        'USA',
        'TWO MEN AND A TRUCK is a national, full-service moving company offering customers a comprehensive package of home and business relocation services, packing and unpacking options, and junk removal plans. With training and customer service being a top priority, we offer professionally trained movers and top-of-the-line equipment to exceed your expectations.',
        'Moving Services',
        ARRAY['Local Moving', 'Long Distance Moving', 'Packing Services', 'Storage Solutions', 'Junk Removal', 'Senior Moving Specialists'],
        43, -- Founded in 1985, so 40+ years
        'US DOT 70441',
        true,
        true,
        true,
        NOW(),
        ARRAY['United States', 'Canada', 'United Kingdom'],
        '{"monday": "8:00-17:00", "tuesday": "8:00-17:00", "wednesday": "8:00-17:00", "thursday": "8:00-17:00", "friday": "8:00-17:00", "saturday": "8:00-16:00", "sunday": "closed"}',
        '{"facebook": "https://facebook.com/twomenandatruck", "twitter": "https://twitter.com/twomenandatruck", "youtube": "https://youtube.com/twomenandatruck"}',
        ARRAY['BBB Accredited Business', 'ProMover Certified', 'AMSA Member'],
        ARRAY['English', 'Spanish'],
        false, -- Not emergency service
        ARRAY['Cash', 'Check', 'Credit Card', 'Debit Card'],
        'https://twomenandatruck.com/sites/default/files/logo.png',
        ARRAY[
            'https://twomenandatruck.com/brand-d8-master/us/styles/banner_mobile/s3/2018-07/movers-in-front-of-apartment_0.jpg.jpg',
            'https://twomenandatruck.com/brand-d8-master/us/styles/banner_mobile/s3/2025-04/header-birthday-logo.jpg.jpg'
        ],
        true,
        400, -- 400+ locations
        1985
    ) RETURNING id INTO vendor_id;

    -- Get category IDs
    SELECT id INTO moving_category_id FROM vendor_service_categories WHERE category_name = 'Moving Services' LIMIT 1;
    SELECT id INTO home_services_category_id FROM vendor_service_categories WHERE category_name = 'Home Services' LIMIT 1;

    -- If categories don't exist, create them
    IF moving_category_id IS NULL THEN
        INSERT INTO vendor_service_categories (category_name, description, icon, is_active)
        VALUES ('Moving Services', 'Professional moving and relocation services', 'truck', true)
        RETURNING id INTO moving_category_id;
    END IF;

    IF home_services_category_id IS NULL THEN
        INSERT INTO vendor_service_categories (category_name, description, icon, is_active)
        VALUES ('Home Services', 'Home-based services and support', 'home', true)
        RETURNING id INTO home_services_category_id;
    END IF;

    -- Insert services
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
        vendor_id,
        moving_category_id,
        'Local Moving Services',
        'Professional local moving services with trained and background-checked movers. Full-service moving including packing, loading, transport, and unloading for senior living transitions.',
        'quote',
        NULL,
        'per_move',
        '{"min": 200, "max": 2000}',
        480, -- 8 hours average
        ARRAY['Professional Movers', 'Background Checked Staff', 'Full Insurance Coverage', 'Packing Materials', 'Furniture Protection', 'Senior Moving Specialists'],
        true,
        ARRAY['United States', 'Canada'],
        '{"days": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"], "hours": {"start": "08:00", "end": "17:00"}}',
        ARRAY['Free Estimate Required', 'Advance Booking Recommended']
    ),
    (
        vendor_id,
        moving_category_id,
        'Long Distance Moving',
        'Long-distance and interstate moving services for seniors relocating to new states or regions. Comprehensive service with tracking and dedicated customer support.',
        'quote',
        NULL,
        'per_move',
        '{"min": 1500, "max": 8000}',
        1440, -- 24 hours average
        ARRAY['Interstate Licensed', 'GPS Tracking', 'Dedicated Move Coordinator', 'Storage Options', 'Full Insurance', 'White Glove Service Available'],
        true,
        ARRAY['United States', 'Canada'],
        '{"days": ["monday", "tuesday", "wednesday", "thursday", "friday"], "hours": {"start": "08:00", "end": "17:00"}}',
        ARRAY['Free Estimate Required', '2-Week Advance Booking', 'Inventory List Required']
    ),
    (
        vendor_id,
        home_services_category_id,
        'Professional Packing Services',
        'Complete packing and unpacking services by trained professionals. Perfect for seniors who need assistance with the physical demands of packing belongings.',
        'hourly',
        45.00,
        'per_hour',
        '{"min": 35, "max": 65}',
        240, -- 4 hours average
        ARRAY['Professional Packers', 'Packing Materials Included', 'Fragile Item Specialists', 'Unpacking Services', 'Room Organization'],
        true,
        ARRAY['United States', 'Canada'],
        '{"days": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"], "hours": {"start": "08:00", "end": "17:00"}}',
        ARRAY['Advance Scheduling Required', 'Inventory Assessment']
    ),
    (
        vendor_id,
        home_services_category_id,
        'Senior Moving Consultation',
        'Specialized consultation service for senior moving needs including downsizing, estate cleanout, and transition planning to senior living communities.',
        'fixed',
        150.00,
        'per_consultation',
        '{"min": 100, "max": 200}',
        120, -- 2 hours
        ARRAY['Senior Moving Specialist', 'Downsizing Planning', 'Community Liaison', 'Timeline Development', 'Stress-Reduction Strategies'],
        true,
        ARRAY['United States', 'Canada'],
        '{"days": ["monday", "tuesday", "wednesday", "thursday", "friday"], "hours": {"start": "09:00", "end": "16:00"}}',
        ARRAY['Appointment Required', 'Community Information Helpful']
    ),
    (
        vendor_id,
        home_services_category_id,
        'Storage Solutions',
        'Flexible storage options including portable units, warehouse storage, and vaulted storage for seniors transitioning between homes or downsizing.',
        'subscription',
        89.00,
        'per_month',
        '{"min": 59, "max": 299}',
        NULL, -- Ongoing service
        ARRAY['Climate Controlled Options', 'Security Monitoring', 'Easy Access', 'Portable Units Available', 'Inventory Management'],
        true,
        ARRAY['United States', 'Canada'],
        '{"days": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"], "hours": {"start": "08:00", "end": "17:00"}}',
        ARRAY['Credit Check Required', 'Insurance Recommended']
    ),
    (
        vendor_id,
        home_services_category_id,
        'Junk Removal & Cleanout',
        'Professional junk removal and estate cleanout services perfect for downsizing seniors or clearing properties before moves.',
        'quote',
        NULL,
        'per_job',
        '{"min": 150, "max": 1500}',
        300, -- 5 hours average
        ARRAY['Full Service Removal', 'Donation Coordination', 'Eco-Friendly Disposal', 'Estate Cleanout', 'Same Day Service Available'],
        true,
        ARRAY['United States', 'Canada'],
        '{"days": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"], "hours": {"start": "08:00", "end": "17:00"}}',
        ARRAY['Free Estimate', 'Items Must Be Accessible']
    );

    RAISE NOTICE 'Two Men and a Truck integration completed successfully. Vendor ID: %', vendor_id;
END $$;