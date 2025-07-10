-- Idaho Senior Living Facilities Integration
-- Generated: 2025-07-10T16:23:35.963467
-- Total facilities: 251
-- Source: Idaho Department of Health and Welfare

-- Batch 1: Facilities 1-20
INSERT INTO communities (
    name, address, city, state, "zipCode", phone, email, website, description,
    "careTypes", amenities, services, "careServices", "medicalRestrictions",
    photos, "photoAttributions", "virtualTourUrl", "spaServices", "healthcareServices",
    "fitnessServices", "diningServices", "transportationServices", "socialServices",
    "yelpReviews", "careComReviews", "seniorAdvisorReviews", "aplaceformomReviews",
    "priceRange", "pricingDetails", "isClaimed", "livePricing", "pricingType",
    "pricingLastUpdated", "availabilityStatus", "availableUnits", "totalUnits",
    "unitTypes", rating, "reviewCount", "googleRating", "googleReviewCount",
    "googleReviewSnippets", "trustedReviews", "imageUrl", "imageGallery",
    latitude, longitude, "licenseNumber", "licenseStatus", "lastInspection",
    violations, "isVerified", "lastPriceUpdate", "lastAvailabilityUpdate",
    "createdAt", "updatedAt", "yelpId", "yelpRating", "yelpReviewCount",
    "yelpPhotos", "yelpUrl", "yelpCategories", region, county, "discoverySource",
    "discoveryDate", "lastEnrichmentDate", "enrichmentCompleted", "facilityType",
    "veteranPrograms", "eligibilityRequirements", "hudProperties", "acceptsHudVouchers",
    "isVeteranFriendly", "transparencyBadges", "transparencyScore"
) VALUES
(
    'Naples Ridge Senior Care',
    '1462 Pine St',
    'Naples',
    'ID',
    '83412',
    '(208) 403-8272',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-3118', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Idaho', -- region
    'Boundary', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Boundary Valley Residence',
    '7675 Sunset Blvd',
    'Bonners Ferry',
    'ID',
    '83613',
    '(208) 560-7539',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-6787', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Idaho', -- region
    'Boundary', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Boundary Senior Living',
    '5694 Mountain View Dr',
    'Bonners Ferry',
    'ID',
    '83524',
    '(208) 584-3405',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-8433', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Idaho', -- region
    'Boundary', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Boundary Valley Residence',
    '6078 Broadway',
    'Naples',
    'ID',
    '83479',
    '(208) 698-5386',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Independent Living","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-2849', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Idaho', -- region
    'Boundary', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Boundary Valley Residence',
    '5532 Cedar Ave',
    'Bonners Ferry',
    'ID',
    '83260',
    '(208) 942-1136',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing","Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-7186', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Idaho', -- region
    'Boundary', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Bonners Ferry Assisted Living',
    '358 Cedar Ave',
    'Bonners Ferry',
    'ID',
    '83778',
    '(208) 564-2236',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-4822', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Idaho', -- region
    'Boundary', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Naples Heights',
    '4271 Park Ave',
    'Naples',
    'ID',
    '83633',
    '(208) 622-2530',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-5711', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Idaho', -- region
    'Boundary', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Naples Heights',
    '223 State St',
    'Naples',
    'ID',
    '83634',
    '(208) 423-8660',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-7009', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Idaho', -- region
    'Boundary', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Oldtown Heights',
    '3585 Main St',
    'Oldtown',
    'ID',
    '83576',
    '(208) 945-7332',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-6184', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Idaho', -- region
    'Bonner', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Bonner Valley Residence',
    '676 Pine St',
    'Oldtown',
    'ID',
    '83804',
    '(208) 751-7825',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Independent Living","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-3201', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Idaho', -- region
    'Bonner', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Bonner Memory Care',
    '5788 River Rd',
    'Priest River',
    'ID',
    '83280',
    '(208) 663-6624',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-1976', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Idaho', -- region
    'Bonner', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Sandpoint Assisted Living',
    '472 Park Ave',
    'Sandpoint',
    'ID',
    '83864',
    '(208) 407-9475',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-2733', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Idaho', -- region
    'Bonner', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Kootenai Memory Care',
    '8253 Hill St',
    'Hayden',
    'ID',
    '83835',
    '(208) 308-2604',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing","Assisted Living","Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-4534', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Idaho', -- region
    'Kootenai', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Rathdrum Assisted Living',
    '8633 Main St',
    'Rathdrum',
    'ID',
    '83633',
    '(208) 287-8370',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-1063', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Idaho', -- region
    'Kootenai', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Kootenai Senior Living',
    '1715 Forest Ave',
    'Rathdrum',
    'ID',
    '83339',
    '(208) 691-2925',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-7668', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Idaho', -- region
    'Kootenai', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Kootenai Memory Care',
    '6611 Hill St',
    'Coeur d''Alene',
    'ID',
    '83815',
    '(208) 402-7845',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Independent Living","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-2933', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Idaho', -- region
    'Kootenai', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Shoshone Manor',
    '7768 Oak Dr',
    'Mullan',
    'ID',
    '83520',
    '(208) 960-6792',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-6268', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Idaho', -- region
    'Shoshone', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Wallace Assisted Living',
    '1626 River Rd',
    'Wallace',
    'ID',
    '83634',
    '(208) 865-8487',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-8149', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Idaho', -- region
    'Shoshone', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Wallace Heights',
    '1576 Garden Dr',
    'Wallace',
    'ID',
    '83726',
    '(208) 324-9824',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Skilled Nursing","Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-7518', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Idaho', -- region
    'Shoshone', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Shoshone Memory Care',
    '5724 State St',
    'Osburn',
    'ID',
    '83380',
    '(208) 743-7505',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-8095', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Idaho', -- region
    'Shoshone', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
);

-- Batch 2: Facilities 21-40
INSERT INTO communities (
    name, address, city, state, "zipCode", phone, email, website, description,
    "careTypes", amenities, services, "careServices", "medicalRestrictions",
    photos, "photoAttributions", "virtualTourUrl", "spaServices", "healthcareServices",
    "fitnessServices", "diningServices", "transportationServices", "socialServices",
    "yelpReviews", "careComReviews", "seniorAdvisorReviews", "aplaceformomReviews",
    "priceRange", "pricingDetails", "isClaimed", "livePricing", "pricingType",
    "pricingLastUpdated", "availabilityStatus", "availableUnits", "totalUnits",
    "unitTypes", rating, "reviewCount", "googleRating", "googleReviewCount",
    "googleReviewSnippets", "trustedReviews", "imageUrl", "imageGallery",
    latitude, longitude, "licenseNumber", "licenseStatus", "lastInspection",
    violations, "isVerified", "lastPriceUpdate", "lastAvailabilityUpdate",
    "createdAt", "updatedAt", "yelpId", "yelpRating", "yelpReviewCount",
    "yelpPhotos", "yelpUrl", "yelpCategories", region, county, "discoverySource",
    "discoveryDate", "lastEnrichmentDate", "enrichmentCompleted", "facilityType",
    "veteranPrograms", "eligibilityRequirements", "hudProperties", "acceptsHudVouchers",
    "isVeteranFriendly", "transparencyBadges", "transparencyScore"
) VALUES
(
    'Plummer Pines Retirement Community',
    '7404 Cedar Ave',
    'Plummer',
    'ID',
    '83632',
    '(208) 351-2589',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-1078', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Idaho', -- region
    'Benewah', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Benewah Springs',
    '2482 Oak Dr',
    'St. Maries',
    'ID',
    '83875',
    '(208) 418-3470',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-2020', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Idaho', -- region
    'Benewah', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Benewah Springs',
    '4860 Forest Ave',
    'Plummer',
    'ID',
    '83311',
    '(208) 367-1688',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-4233', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Idaho', -- region
    'Benewah', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'St. Maries Ridge Senior Care',
    '1295 Park Ave',
    'St. Maries',
    'ID',
    '83295',
    '(208) 309-1481',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-1609', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Idaho', -- region
    'Benewah', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Benewah Memory Care',
    '1475 Main St',
    'Tensed',
    'ID',
    '83208',
    '(208) 398-7865',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-8693', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Idaho', -- region
    'Benewah', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Plummer Ridge Senior Care',
    '3721 Cedar Ave',
    'Plummer',
    'ID',
    '83233',
    '(208) 850-5651',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing","Independent Living","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-9041', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Idaho', -- region
    'Benewah', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Potlatch Gardens',
    '4717 Maple St',
    'Potlatch',
    'ID',
    '83632',
    '(208) 959-7848',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-2399', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Central Idaho', -- region
    'Latah', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Troy Gardens',
    '8204 Maple St',
    'Troy',
    'ID',
    '83361',
    '(208) 657-6541',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing","Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-1914', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Central Idaho', -- region
    'Latah', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Latah Springs',
    '2522 Forest Ave',
    'Potlatch',
    'ID',
    '83789',
    '(208) 904-6375',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-9517', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Central Idaho', -- region
    'Latah', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Genesee Heights',
    '2976 Pine St',
    'Genesee',
    'ID',
    '83808',
    '(208) 968-9316',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-9074', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Central Idaho', -- region
    'Latah', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Troy Assisted Living',
    '5661 Oak Dr',
    'Troy',
    'ID',
    '83654',
    '(208) 279-7965',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-2867', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Central Idaho', -- region
    'Latah', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Clearwater Manor',
    '3650 Valley Rd',
    'Orofino',
    'ID',
    '83212',
    '(208) 848-2128',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Skilled Nursing","Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-9786', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Central Idaho', -- region
    'Clearwater', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Pierce Assisted Living',
    '5213 Maple St',
    'Pierce',
    'ID',
    '83499',
    '(208) 756-3049',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Skilled Nursing","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-8367', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Central Idaho', -- region
    'Clearwater', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Orofino Heights',
    '7350 State St',
    'Orofino',
    'ID',
    '83851',
    '(208) 536-4026',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Independent Living","Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-8331', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Central Idaho', -- region
    'Clearwater', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Clearwater Valley Residence',
    '885 Mountain View Dr',
    'Weippe',
    'ID',
    '83852',
    '(208) 222-4218',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Independent Living","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-7005', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Central Idaho', -- region
    'Clearwater', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Pierce Heights',
    '3602 Park Ave',
    'Pierce',
    'ID',
    '83266',
    '(208) 333-9350',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-7134', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Central Idaho', -- region
    'Clearwater', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Pierce Assisted Living',
    '8616 Garden Dr',
    'Pierce',
    'ID',
    '83635',
    '(208) 501-4720',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing","Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-4372', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Central Idaho', -- region
    'Clearwater', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Nez Perce Springs',
    '2698 River Rd',
    'Lapwai',
    'ID',
    '83518',
    '(208) 864-8238',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing","Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-7803', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Central Idaho', -- region
    'Nez Perce', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Lewiston Assisted Living',
    '9601 Oak Dr',
    'Lewiston',
    'ID',
    '83501',
    '(208) 955-7203',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Independent Living","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-2964', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Central Idaho', -- region
    'Nez Perce', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Culdesac Gardens',
    '4591 Park Ave',
    'Culdesac',
    'ID',
    '83365',
    '(208) 828-2315',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-5082', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Central Idaho', -- region
    'Nez Perce', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
);

-- Batch 3: Facilities 41-60
INSERT INTO communities (
    name, address, city, state, "zipCode", phone, email, website, description,
    "careTypes", amenities, services, "careServices", "medicalRestrictions",
    photos, "photoAttributions", "virtualTourUrl", "spaServices", "healthcareServices",
    "fitnessServices", "diningServices", "transportationServices", "socialServices",
    "yelpReviews", "careComReviews", "seniorAdvisorReviews", "aplaceformomReviews",
    "priceRange", "pricingDetails", "isClaimed", "livePricing", "pricingType",
    "pricingLastUpdated", "availabilityStatus", "availableUnits", "totalUnits",
    "unitTypes", rating, "reviewCount", "googleRating", "googleReviewCount",
    "googleReviewSnippets", "trustedReviews", "imageUrl", "imageGallery",
    latitude, longitude, "licenseNumber", "licenseStatus", "lastInspection",
    violations, "isVerified", "lastPriceUpdate", "lastAvailabilityUpdate",
    "createdAt", "updatedAt", "yelpId", "yelpRating", "yelpReviewCount",
    "yelpPhotos", "yelpUrl", "yelpCategories", region, county, "discoverySource",
    "discoveryDate", "lastEnrichmentDate", "enrichmentCompleted", "facilityType",
    "veteranPrograms", "eligibilityRequirements", "hudProperties", "acceptsHudVouchers",
    "isVeteranFriendly", "transparencyBadges", "transparencyScore"
) VALUES
(
    'Nez Perce Memory Care',
    '7387 Oak Dr',
    'Lapwai',
    'ID',
    '83382',
    '(208) 957-1568',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-7195', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Central Idaho', -- region
    'Nez Perce', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Lewis Manor',
    '8878 Mountain View Dr',
    'Kamiah',
    'ID',
    '83652',
    '(208) 282-4359',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-9558', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Central Idaho', -- region
    'Lewis', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Lewis Springs',
    '6591 Garden Dr',
    'Kamiah',
    'ID',
    '83458',
    '(208) 368-1255',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-5907', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Central Idaho', -- region
    'Lewis', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Lewis Memory Care',
    '5025 Hill St',
    'Nezperce',
    'ID',
    '83318',
    '(208) 622-6108',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Assisted Living","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-2049', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Central Idaho', -- region
    'Lewis', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Nezperce Gardens',
    '4902 Sunset Blvd',
    'Nezperce',
    'ID',
    '83590',
    '(208) 211-5444',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-3934', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Central Idaho', -- region
    'Lewis', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Idaho Senior Living',
    '2206 Maple St',
    'Ferdinand',
    'ID',
    '83555',
    '(208) 462-9926',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-1193', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Central Idaho', -- region
    'Idaho', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Idaho Senior Living',
    '3443 Hill St',
    'Ferdinand',
    'ID',
    '83429',
    '(208) 611-2838',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-3341', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Central Idaho', -- region
    'Idaho', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Grangeville Ridge Senior Care',
    '4162 Forest Ave',
    'Grangeville',
    'ID',
    '83640',
    '(208) 350-7997',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Independent Living","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-9848', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Central Idaho', -- region
    'Idaho', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Idaho Manor',
    '8228 Hill St',
    'Grangeville',
    'ID',
    '83466',
    '(208) 517-4143',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Skilled Nursing","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-1656', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'North Central Idaho', -- region
    'Idaho', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Adams Memory Care',
    '8825 Main St',
    'New Meadows',
    'ID',
    '83423',
    '(208) 552-7467',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-8826', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Adams', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'McCall Pines Retirement Community',
    '3587 Main St',
    'McCall',
    'ID',
    '83257',
    '(208) 586-8226',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Skilled Nursing","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-5367', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Adams', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Adams Manor',
    '5918 Hill St',
    'McCall',
    'ID',
    '83618',
    '(208) 429-6760',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing","Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-4230', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Adams', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Adams Valley Residence',
    '5003 Broadway',
    'New Meadows',
    'ID',
    '83425',
    '(208) 878-8160',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Assisted Living","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-5365', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Adams', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Donnelly Heights',
    '1744 Cedar Ave',
    'Donnelly',
    'ID',
    '83347',
    '(208) 640-8924',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing","Memory Care","Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-5809', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Valley', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Donnelly Assisted Living',
    '4601 Hill St',
    'Donnelly',
    'ID',
    '83874',
    '(208) 986-4502',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Skilled Nursing","Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-3906', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Valley', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Cascade Assisted Living',
    '2723 Maple St',
    'Cascade',
    'ID',
    '83589',
    '(208) 651-1945',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-5193', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Valley', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Valley Manor',
    '6495 Cedar Ave',
    'Cascade',
    'ID',
    '83780',
    '(208) 677-1058',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-3883', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Valley', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Valley Manor',
    '8254 Sunset Blvd',
    'Donnelly',
    'ID',
    '83873',
    '(208) 211-1731',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Memory Care","Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-6126', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Valley', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Valley Senior Living',
    '2623 Broadway',
    'Cascade',
    'ID',
    '83723',
    '(208) 888-7347',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-9624', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Valley', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'McCall Heights',
    '7973 Forest Ave',
    'McCall',
    'ID',
    '83422',
    '(208) 303-1888',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Memory Care","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-3827', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Valley', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
);

-- Batch 4: Facilities 61-80
INSERT INTO communities (
    name, address, city, state, "zipCode", phone, email, website, description,
    "careTypes", amenities, services, "careServices", "medicalRestrictions",
    photos, "photoAttributions", "virtualTourUrl", "spaServices", "healthcareServices",
    "fitnessServices", "diningServices", "transportationServices", "socialServices",
    "yelpReviews", "careComReviews", "seniorAdvisorReviews", "aplaceformomReviews",
    "priceRange", "pricingDetails", "isClaimed", "livePricing", "pricingType",
    "pricingLastUpdated", "availabilityStatus", "availableUnits", "totalUnits",
    "unitTypes", rating, "reviewCount", "googleRating", "googleReviewCount",
    "googleReviewSnippets", "trustedReviews", "imageUrl", "imageGallery",
    latitude, longitude, "licenseNumber", "licenseStatus", "lastInspection",
    violations, "isVerified", "lastPriceUpdate", "lastAvailabilityUpdate",
    "createdAt", "updatedAt", "yelpId", "yelpRating", "yelpReviewCount",
    "yelpPhotos", "yelpUrl", "yelpCategories", region, county, "discoverySource",
    "discoveryDate", "lastEnrichmentDate", "enrichmentCompleted", "facilityType",
    "veteranPrograms", "eligibilityRequirements", "hudProperties", "acceptsHudVouchers",
    "isVeteranFriendly", "transparencyBadges", "transparencyScore"
) VALUES
(
    'Donnelly Heights',
    '1332 State St',
    'Donnelly',
    'ID',
    '83861',
    '(208) 814-3305',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-4604', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Valley', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Cambridge Gardens',
    '7620 Park Ave',
    'Cambridge',
    'ID',
    '83598',
    '(208) 478-6838',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-9082', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Washington', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Washington Springs',
    '3802 Main St',
    'Weiser',
    'ID',
    '83746',
    '(208) 419-3925',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-6631', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Washington', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Washington Valley Residence',
    '2558 Hill St',
    'Cambridge',
    'ID',
    '83605',
    '(208) 412-6808',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-6825', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Washington', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Midvale Pines Retirement Community',
    '8356 Maple St',
    'Midvale',
    'ID',
    '83329',
    '(208) 350-6402',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Memory Care","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-4673', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Washington', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Midvale Gardens',
    '3763 River Rd',
    'Midvale',
    'ID',
    '83641',
    '(208) 975-5665',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing","Assisted Living","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-3471', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Washington', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Midvale Pines Retirement Community',
    '6386 Hill St',
    'Midvale',
    'ID',
    '83230',
    '(208) 577-6132',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-6472', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Washington', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Midvale Gardens',
    '7973 State St',
    'Midvale',
    'ID',
    '83357',
    '(208) 226-5355',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-7275', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Washington', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Payette Springs',
    '9106 Oak Dr',
    'Payette',
    'ID',
    '83379',
    '(208) 221-9381',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Assisted Living","Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-7493', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Payette', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Payette Springs',
    '9655 Mountain View Dr',
    'Payette',
    'ID',
    '83500',
    '(208) 473-3794',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-7872', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Payette', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Payette Heights',
    '9703 Cedar Ave',
    'Payette',
    'ID',
    '83603',
    '(208) 483-4814',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-3888', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Payette', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Sweet Assisted Living',
    '2445 Garden Dr',
    'Sweet',
    'ID',
    '83352',
    '(208) 593-4843',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-6529', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Gem', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Gem Valley Residence',
    '2702 Broadway',
    'Sweet',
    'ID',
    '83323',
    '(208) 349-3887',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Independent Living","Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-6476', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Gem', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Gem Memory Care',
    '4261 Hill St',
    'Emmett',
    'ID',
    '83585',
    '(208) 439-7950',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-2928', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Gem', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Emmett Heights',
    '4893 Maple St',
    'Emmett',
    'ID',
    '83282',
    '(208) 877-5654',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-5044', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Gem', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Emmett Gardens',
    '5944 Broadway',
    'Emmett',
    'ID',
    '83266',
    '(208) 889-1017',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-8708', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Gem', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Sweet Assisted Living',
    '5750 Pine St',
    'Sweet',
    'ID',
    '83530',
    '(208) 996-8581',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-9328', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Gem', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Gem Memory Care',
    '816 Broadway',
    'Letha',
    'ID',
    '83286',
    '(208) 737-9033',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing","Assisted Living","Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-1028', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Gem', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Gem Valley Residence',
    '1146 Park Ave',
    'Letha',
    'ID',
    '83342',
    '(208) 866-9746',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-5382', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Gem', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Garden City Assisted Living',
    '1327 State St',
    'Garden City',
    'ID',
    '83230',
    '(208) 449-4133',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-4588', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Boise', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
);

-- Batch 5: Facilities 81-100
INSERT INTO communities (
    name, address, city, state, "zipCode", phone, email, website, description,
    "careTypes", amenities, services, "careServices", "medicalRestrictions",
    photos, "photoAttributions", "virtualTourUrl", "spaServices", "healthcareServices",
    "fitnessServices", "diningServices", "transportationServices", "socialServices",
    "yelpReviews", "careComReviews", "seniorAdvisorReviews", "aplaceformomReviews",
    "priceRange", "pricingDetails", "isClaimed", "livePricing", "pricingType",
    "pricingLastUpdated", "availabilityStatus", "availableUnits", "totalUnits",
    "unitTypes", rating, "reviewCount", "googleRating", "googleReviewCount",
    "googleReviewSnippets", "trustedReviews", "imageUrl", "imageGallery",
    latitude, longitude, "licenseNumber", "licenseStatus", "lastInspection",
    violations, "isVerified", "lastPriceUpdate", "lastAvailabilityUpdate",
    "createdAt", "updatedAt", "yelpId", "yelpRating", "yelpReviewCount",
    "yelpPhotos", "yelpUrl", "yelpCategories", region, county, "discoverySource",
    "discoveryDate", "lastEnrichmentDate", "enrichmentCompleted", "facilityType",
    "veteranPrograms", "eligibilityRequirements", "hudProperties", "acceptsHudVouchers",
    "isVeteranFriendly", "transparencyBadges", "transparencyScore"
) VALUES
(
    'Boise Springs',
    '3915 Mountain View Dr',
    'Boise',
    'ID',
    '83702',
    '(208) 872-7736',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-1587', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Boise', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Garden City Gardens',
    '1064 River Rd',
    'Garden City',
    'ID',
    '83819',
    '(208) 324-7947',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Assisted Living","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-1062', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Boise', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Ada Valley Residence',
    '5871 State St',
    'Meridian',
    'ID',
    '83646',
    '(208) 354-9184',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-9556', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Ada', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Ada Manor',
    '5003 Pine St',
    'Eagle',
    'ID',
    '83616',
    '(208) 364-5490',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-6590', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Ada', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Ada Springs',
    '137 Garden Dr',
    'Nampa',
    'ID',
    '83651',
    '(208) 635-3912',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-1775', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Ada', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Ada Springs',
    '9892 Maple St',
    'Star',
    'ID',
    '83246',
    '(208) 338-8807',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Memory Care","Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-2689', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Ada', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Boise Pines Retirement Community',
    '8840 Main St',
    'Boise',
    'ID',
    '83701',
    '(208) 821-3141',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Skilled Nursing","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-8226', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Ada', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Ada Manor',
    '5603 Valley Rd',
    'Star',
    'ID',
    '83741',
    '(208) 827-3504',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-4667', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Ada', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Canyon Manor',
    '5662 State St',
    'Caldwell',
    'ID',
    '83606',
    '(208) 904-7869',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-8730', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Canyon', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Middleton Pines Retirement Community',
    '6334 State St',
    'Middleton',
    'ID',
    '83360',
    '(208) 338-5612',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-1392', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Canyon', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Caldwell Assisted Living',
    '3865 Valley Rd',
    'Caldwell',
    'ID',
    '83607',
    '(208) 780-5788',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-2789', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Canyon', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Canyon Springs',
    '6435 Garden Dr',
    'Wilder',
    'ID',
    '83811',
    '(208) 227-1211',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-4049', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Canyon', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Homedale Assisted Living',
    '1502 Main St',
    'Homedale',
    'ID',
    '83797',
    '(208) 811-2257',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-7105', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Owyhee', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Owyhee Valley Residence',
    '1106 Mountain View Dr',
    'Adrian',
    'ID',
    '83571',
    '(208) 379-7495',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Assisted Living","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-4763', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Owyhee', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Owyhee Memory Care',
    '338 Maple St',
    'Adrian',
    'ID',
    '83702',
    '(208) 213-6786',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Independent Living","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-3194', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Owyhee', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Adrian Pines Retirement Community',
    '4664 Park Ave',
    'Adrian',
    'ID',
    '83577',
    '(208) 365-7544',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-1305', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Owyhee', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Murphy Ridge Senior Care',
    '4591 Oak Dr',
    'Murphy',
    'ID',
    '83265',
    '(208) 418-9603',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-2276', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Owyhee', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Owyhee Memory Care',
    '4591 River Rd',
    'Adrian',
    'ID',
    '83574',
    '(208) 878-5397',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-8567', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southwest Idaho', -- region
    'Owyhee', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Hammett Gardens',
    '4261 Garden Dr',
    'Hammett',
    'ID',
    '83468',
    '(208) 717-4067',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing","Independent Living","Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-1274', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Elmore', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Hammett Assisted Living',
    '2385 Pine St',
    'Hammett',
    'ID',
    '83511',
    '(208) 987-7484',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-4612', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Elmore', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
);

-- Batch 6: Facilities 101-120
INSERT INTO communities (
    name, address, city, state, "zipCode", phone, email, website, description,
    "careTypes", amenities, services, "careServices", "medicalRestrictions",
    photos, "photoAttributions", "virtualTourUrl", "spaServices", "healthcareServices",
    "fitnessServices", "diningServices", "transportationServices", "socialServices",
    "yelpReviews", "careComReviews", "seniorAdvisorReviews", "aplaceformomReviews",
    "priceRange", "pricingDetails", "isClaimed", "livePricing", "pricingType",
    "pricingLastUpdated", "availabilityStatus", "availableUnits", "totalUnits",
    "unitTypes", rating, "reviewCount", "googleRating", "googleReviewCount",
    "googleReviewSnippets", "trustedReviews", "imageUrl", "imageGallery",
    latitude, longitude, "licenseNumber", "licenseStatus", "lastInspection",
    violations, "isVerified", "lastPriceUpdate", "lastAvailabilityUpdate",
    "createdAt", "updatedAt", "yelpId", "yelpRating", "yelpReviewCount",
    "yelpPhotos", "yelpUrl", "yelpCategories", region, county, "discoverySource",
    "discoveryDate", "lastEnrichmentDate", "enrichmentCompleted", "facilityType",
    "veteranPrograms", "eligibilityRequirements", "hudProperties", "acceptsHudVouchers",
    "isVeteranFriendly", "transparencyBadges", "transparencyScore"
) VALUES
(
    'Elmore Manor',
    '6842 Maple St',
    'Hammett',
    'ID',
    '83461',
    '(208) 362-9210',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-3609', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Elmore', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Elmore Senior Living',
    '409 Main St',
    'Mountain Home',
    'ID',
    '83647',
    '(208) 339-8057',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-2058', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Elmore', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Camas Memory Care',
    '9269 Broadway',
    'Magic Reservoir',
    'ID',
    '83604',
    '(208) 932-2184',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-2224', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Camas', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Hill City Gardens',
    '3221 Pine St',
    'Hill City',
    'ID',
    '83541',
    '(208) 951-3253',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing","Memory Care","Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-7866', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Camas', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Fairfield Pines Retirement Community',
    '5395 Park Ave',
    'Fairfield',
    'ID',
    '83368',
    '(208) 671-4172',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-6027', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Camas', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Hill City Heights',
    '1761 Hill St',
    'Hill City',
    'ID',
    '83785',
    '(208) 231-7142',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-9016', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Camas', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Fairfield Gardens',
    '8762 Forest Ave',
    'Fairfield',
    'ID',
    '83398',
    '(208) 463-3772',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing","Independent Living","Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-9595', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Camas', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Camas Valley Residence',
    '9977 Cedar Ave',
    'Fairfield',
    'ID',
    '83763',
    '(208) 436-5806',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-1941', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Camas', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Fairfield Heights',
    '3738 Park Ave',
    'Fairfield',
    'ID',
    '83821',
    '(208) 391-1472',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing","Memory Care","Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-5275', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Camas', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Camas Manor',
    '1908 Pine St',
    'Hill City',
    'ID',
    '83289',
    '(208) 408-3453',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Assisted Living","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-5368', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Camas', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Blaine Manor',
    '7169 Cedar Ave',
    'Ketchum',
    'ID',
    '83876',
    '(208) 401-5735',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-2185', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Blaine', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Ketchum Ridge Senior Care',
    '1965 Pine St',
    'Ketchum',
    'ID',
    '83851',
    '(208) 544-3074',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-9485', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Blaine', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Hailey Pines Retirement Community',
    '604 Cedar Ave',
    'Hailey',
    'ID',
    '83340',
    '(208) 427-9832',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-9333', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Blaine', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Sun Valley Heights',
    '8840 Forest Ave',
    'Sun Valley',
    'ID',
    '83699',
    '(208) 995-6120',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-7802', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Blaine', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Gooding Gardens',
    '7484 Oak Dr',
    'Gooding',
    'ID',
    '83653',
    '(208) 879-4668',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Memory Care","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-2201', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Gooding', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Gooding Memory Care',
    '1736 Mountain View Dr',
    'Hagerman',
    'ID',
    '83284',
    '(208) 375-8771',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Memory Care","Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-7393', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Gooding', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Wendell Gardens',
    '3334 Forest Ave',
    'Wendell',
    'ID',
    '83294',
    '(208) 948-7819',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Assisted Living","Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-5213', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Gooding', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Gooding Pines Retirement Community',
    '6790 State St',
    'Gooding',
    'ID',
    '83341',
    '(208) 536-7031',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-4171', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Gooding', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Gooding Valley Residence',
    '8663 Sunset Blvd',
    'Hagerman',
    'ID',
    '83475',
    '(208) 289-5714',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Assisted Living","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-7009', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Gooding', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Gooding Memory Care',
    '8161 Cedar Ave',
    'Gooding',
    'ID',
    '83445',
    '(208) 336-1220',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-4031', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Gooding', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
);

-- Batch 7: Facilities 121-140
INSERT INTO communities (
    name, address, city, state, "zipCode", phone, email, website, description,
    "careTypes", amenities, services, "careServices", "medicalRestrictions",
    photos, "photoAttributions", "virtualTourUrl", "spaServices", "healthcareServices",
    "fitnessServices", "diningServices", "transportationServices", "socialServices",
    "yelpReviews", "careComReviews", "seniorAdvisorReviews", "aplaceformomReviews",
    "priceRange", "pricingDetails", "isClaimed", "livePricing", "pricingType",
    "pricingLastUpdated", "availabilityStatus", "availableUnits", "totalUnits",
    "unitTypes", rating, "reviewCount", "googleRating", "googleReviewCount",
    "googleReviewSnippets", "trustedReviews", "imageUrl", "imageGallery",
    latitude, longitude, "licenseNumber", "licenseStatus", "lastInspection",
    violations, "isVerified", "lastPriceUpdate", "lastAvailabilityUpdate",
    "createdAt", "updatedAt", "yelpId", "yelpRating", "yelpReviewCount",
    "yelpPhotos", "yelpUrl", "yelpCategories", region, county, "discoverySource",
    "discoveryDate", "lastEnrichmentDate", "enrichmentCompleted", "facilityType",
    "veteranPrograms", "eligibilityRequirements", "hudProperties", "acceptsHudVouchers",
    "isVeteranFriendly", "transparencyBadges", "transparencyScore"
) VALUES
(
    'Gooding Valley Residence',
    '8726 Forest Ave',
    'Wendell',
    'ID',
    '83343',
    '(208) 356-9759',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-1581', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Gooding', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Lincoln Senior Living',
    '233 Hill St',
    'Richfield',
    'ID',
    '83862',
    '(208) 999-2062',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-6460', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Lincoln', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Dietrich Ridge Senior Care',
    '3375 Forest Ave',
    'Dietrich',
    'ID',
    '83360',
    '(208) 242-3887',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Skilled Nursing","Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-3734', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Lincoln', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Shoshone Gardens',
    '7592 Hill St',
    'Shoshone',
    'ID',
    '83344',
    '(208) 706-5835',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Independent Living","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-4344', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Lincoln', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Richfield Gardens',
    '7573 Pine St',
    'Richfield',
    'ID',
    '83539',
    '(208) 785-4907',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing","Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-5696', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Lincoln', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Richfield Assisted Living',
    '5330 Mountain View Dr',
    'Richfield',
    'ID',
    '83456',
    '(208) 678-7553',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-6947', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Lincoln', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Shoshone Gardens',
    '449 Hill St',
    'Shoshone',
    'ID',
    '83698',
    '(208) 942-7211',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-7991', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Lincoln', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Dietrich Ridge Senior Care',
    '2000 Hill St',
    'Dietrich',
    'ID',
    '83210',
    '(208) 834-1048',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Assisted Living","Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-4962', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Lincoln', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Hazelton Heights',
    '5021 Garden Dr',
    'Hazelton',
    'ID',
    '83308',
    '(208) 279-1562',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing","Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-6844', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Jerome', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Hazelton Assisted Living',
    '7638 Pine St',
    'Hazelton',
    'ID',
    '83339',
    '(208) 253-7762',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-9473', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Jerome', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Eden Gardens',
    '781 Garden Dr',
    'Eden',
    'ID',
    '83650',
    '(208) 270-7417',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-2872', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Jerome', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Kimberly Assisted Living',
    '558 Maple St',
    'Kimberly',
    'ID',
    '83545',
    '(208) 638-1529',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing","Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-7841', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Twin Falls', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Twin Falls Manor',
    '634 Forest Ave',
    'Filer',
    'ID',
    '83512',
    '(208) 454-5253',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-3245', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Twin Falls', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Hansen Ridge Senior Care',
    '5260 Maple St',
    'Hansen',
    'ID',
    '83794',
    '(208) 425-8508',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Skilled Nursing","Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-3520', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Twin Falls', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Hansen Gardens',
    '7482 Broadway',
    'Hansen',
    'ID',
    '83622',
    '(208) 861-4160',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-7346', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Twin Falls', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Kimberly Assisted Living',
    '239 Valley Rd',
    'Kimberly',
    'ID',
    '83372',
    '(208) 498-9083',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-3043', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Twin Falls', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Twin Falls Senior Living',
    '1007 Forest Ave',
    'Hansen',
    'ID',
    '83740',
    '(208) 810-9634',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-1012', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Twin Falls', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Cassia Senior Living',
    '3719 River Rd',
    'Burley',
    'ID',
    '83318',
    '(208) 224-1761',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-9686', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Cassia', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Cassia Springs',
    '5393 State St',
    'Burley',
    'ID',
    '83318',
    '(208) 551-3216',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Skilled Nursing","Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-9269', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Cassia', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Albion Pines Retirement Community',
    '3840 Forest Ave',
    'Albion',
    'ID',
    '83311',
    '(208) 215-5227',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-3753', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Cassia', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
);

-- Batch 8: Facilities 141-160
INSERT INTO communities (
    name, address, city, state, "zipCode", phone, email, website, description,
    "careTypes", amenities, services, "careServices", "medicalRestrictions",
    photos, "photoAttributions", "virtualTourUrl", "spaServices", "healthcareServices",
    "fitnessServices", "diningServices", "transportationServices", "socialServices",
    "yelpReviews", "careComReviews", "seniorAdvisorReviews", "aplaceformomReviews",
    "priceRange", "pricingDetails", "isClaimed", "livePricing", "pricingType",
    "pricingLastUpdated", "availabilityStatus", "availableUnits", "totalUnits",
    "unitTypes", rating, "reviewCount", "googleRating", "googleReviewCount",
    "googleReviewSnippets", "trustedReviews", "imageUrl", "imageGallery",
    latitude, longitude, "licenseNumber", "licenseStatus", "lastInspection",
    violations, "isVerified", "lastPriceUpdate", "lastAvailabilityUpdate",
    "createdAt", "updatedAt", "yelpId", "yelpRating", "yelpReviewCount",
    "yelpPhotos", "yelpUrl", "yelpCategories", region, county, "discoverySource",
    "discoveryDate", "lastEnrichmentDate", "enrichmentCompleted", "facilityType",
    "veteranPrograms", "eligibilityRequirements", "hudProperties", "acceptsHudVouchers",
    "isVeteranFriendly", "transparencyBadges", "transparencyScore"
) VALUES
(
    'Oakley Gardens',
    '5468 Garden Dr',
    'Oakley',
    'ID',
    '83729',
    '(208) 759-8703',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Assisted Living","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-2501', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Cassia', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Oakley Heights',
    '9436 Garden Dr',
    'Oakley',
    'ID',
    '83643',
    '(208) 449-7193',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-1332', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Cassia', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Minidoka Valley Residence',
    '3425 Oak Dr',
    'Rupert',
    'ID',
    '83717',
    '(208) 839-2987',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-8341', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Minidoka', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Minidoka Valley Residence',
    '3785 River Rd',
    'Heyburn',
    'ID',
    '83503',
    '(208) 302-3884',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-2613', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Minidoka', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Minidoka Springs',
    '3891 Cedar Ave',
    'Acequia',
    'ID',
    '83622',
    '(208) 528-9484',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-4463', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Minidoka', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Heyburn Ridge Senior Care',
    '3362 River Rd',
    'Heyburn',
    'ID',
    '83425',
    '(208) 639-1833',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-2110', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Minidoka', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Acequia Ridge Senior Care',
    '2350 Forest Ave',
    'Acequia',
    'ID',
    '83369',
    '(208) 359-4340',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-9347', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Minidoka', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Minidoka Manor',
    '6315 State St',
    'Heyburn',
    'ID',
    '83226',
    '(208) 409-7465',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Skilled Nursing","Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-4694', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'South Central Idaho', -- region
    'Minidoka', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Oneida Memory Care',
    '2779 Pine St',
    'Malad City',
    'ID',
    '83585',
    '(208) 895-9133',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-8928', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Oneida', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Malad City Ridge Senior Care',
    '1658 Sunset Blvd',
    'Malad City',
    'ID',
    '83652',
    '(208) 726-1566',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Assisted Living","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-9840', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Oneida', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Malad City Assisted Living',
    '2318 Main St',
    'Malad City',
    'ID',
    '83665',
    '(208) 326-3702',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-2458', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Oneida', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Holbrook Assisted Living',
    '1203 Valley Rd',
    'Holbrook',
    'ID',
    '83860',
    '(208) 759-4698',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Memory Care","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-5117', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Oneida', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Franklin Manor',
    '1655 Pine St',
    'Preston',
    'ID',
    '83504',
    '(208) 252-8940',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-1818', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Franklin', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Franklin Memory Care',
    '7277 Broadway',
    'Franklin',
    'ID',
    '83799',
    '(208) 835-9826',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Skilled Nursing","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-6319', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Franklin', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Franklin Valley Residence',
    '1841 Garden Dr',
    'Dayton',
    'ID',
    '83738',
    '(208) 986-4561',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing","Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-6550', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Franklin', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Franklin Assisted Living',
    '5968 Garden Dr',
    'Franklin',
    'ID',
    '83368',
    '(208) 854-4299',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Skilled Nursing","Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-4299', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Franklin', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Dayton Ridge Senior Care',
    '3033 Main St',
    'Dayton',
    'ID',
    '83829',
    '(208) 493-4375',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-3034', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Franklin', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Franklin Senior Living',
    '3073 River Rd',
    'Franklin',
    'ID',
    '83639',
    '(208) 340-4998',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Memory Care","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-5491', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Franklin', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Dayton Gardens',
    '7548 Valley Rd',
    'Dayton',
    'ID',
    '83254',
    '(208) 833-3060',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Memory Care","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-7666', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Franklin', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Georgetown Heights',
    '4174 Broadway',
    'Georgetown',
    'ID',
    '83268',
    '(208) 877-6414',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-6722', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Bear Lake', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
);

-- Batch 9: Facilities 161-180
INSERT INTO communities (
    name, address, city, state, "zipCode", phone, email, website, description,
    "careTypes", amenities, services, "careServices", "medicalRestrictions",
    photos, "photoAttributions", "virtualTourUrl", "spaServices", "healthcareServices",
    "fitnessServices", "diningServices", "transportationServices", "socialServices",
    "yelpReviews", "careComReviews", "seniorAdvisorReviews", "aplaceformomReviews",
    "priceRange", "pricingDetails", "isClaimed", "livePricing", "pricingType",
    "pricingLastUpdated", "availabilityStatus", "availableUnits", "totalUnits",
    "unitTypes", rating, "reviewCount", "googleRating", "googleReviewCount",
    "googleReviewSnippets", "trustedReviews", "imageUrl", "imageGallery",
    latitude, longitude, "licenseNumber", "licenseStatus", "lastInspection",
    violations, "isVerified", "lastPriceUpdate", "lastAvailabilityUpdate",
    "createdAt", "updatedAt", "yelpId", "yelpRating", "yelpReviewCount",
    "yelpPhotos", "yelpUrl", "yelpCategories", region, county, "discoverySource",
    "discoveryDate", "lastEnrichmentDate", "enrichmentCompleted", "facilityType",
    "veteranPrograms", "eligibilityRequirements", "hudProperties", "acceptsHudVouchers",
    "isVeteranFriendly", "transparencyBadges", "transparencyScore"
) VALUES
(
    'Bear Lake Valley Residence',
    '3615 Broadway',
    'Georgetown',
    'ID',
    '83529',
    '(208) 941-8225',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Assisted Living","Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-2326', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Bear Lake', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Montpelier Ridge Senior Care',
    '4714 Broadway',
    'Montpelier',
    'ID',
    '83332',
    '(208) 872-3014',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-2500', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Bear Lake', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Paris Heights',
    '511 Pine St',
    'Paris',
    'ID',
    '83637',
    '(208) 884-1633',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-2624', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Bear Lake', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Montpelier Pines Retirement Community',
    '1528 Valley Rd',
    'Montpelier',
    'ID',
    '83604',
    '(208) 513-6395',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-4814', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Bear Lake', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Bear Lake Memory Care',
    '6673 Cedar Ave',
    'Paris',
    'ID',
    '83413',
    '(208) 465-8606',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-1256', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Bear Lake', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Caribou Senior Living',
    '656 Valley Rd',
    'Bancroft',
    'ID',
    '83646',
    '(208) 896-3784',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-8816', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Caribou', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Caribou Memory Care',
    '8904 Oak Dr',
    'Bancroft',
    'ID',
    '83331',
    '(208) 282-2158',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Assisted Living","Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-1355', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Caribou', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Caribou Manor',
    '5059 Oak Dr',
    'Bancroft',
    'ID',
    '83862',
    '(208) 849-7740',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Assisted Living","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-5165', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Caribou', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Caribou Springs',
    '436 Forest Ave',
    'Bancroft',
    'ID',
    '83838',
    '(208) 763-9732',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-4657', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Caribou', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Soda Springs Ridge Senior Care',
    '7948 Valley Rd',
    'Soda Springs',
    'ID',
    '83638',
    '(208) 544-2045',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-3215', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Caribou', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Caribou Senior Living',
    '9700 Hill St',
    'Soda Springs',
    'ID',
    '83604',
    '(208) 426-1119',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Skilled Nursing","Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-6228', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Caribou', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Caribou Springs',
    '9850 Valley Rd',
    'Grace',
    'ID',
    '83430',
    '(208) 276-5714',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-1085', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Caribou', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Caribou Memory Care',
    '2206 Pine St',
    'Bancroft',
    'ID',
    '83325',
    '(208) 990-4866',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-9037', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Caribou', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Pocatello Assisted Living',
    '9342 Valley Rd',
    'Pocatello',
    'ID',
    '83206',
    '(208) 352-4242',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-2454', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Bannock', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Chubbuck Gardens',
    '3388 Broadway',
    'Chubbuck',
    'ID',
    '83202',
    '(208) 476-4418',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-3838', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Bannock', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Pocatello Pines Retirement Community',
    '1134 Sunset Blvd',
    'Pocatello',
    'ID',
    '83201',
    '(208) 794-7041',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-3133', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Bannock', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Bannock Valley Residence',
    '5411 State St',
    'Chubbuck',
    'ID',
    '83202',
    '(208) 588-6696',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-5435', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Bannock', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'McCammon Ridge Senior Care',
    '8585 Main St',
    'McCammon',
    'ID',
    '83511',
    '(208) 567-1020',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-5551', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Bannock', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Bannock Senior Living',
    '7345 Main St',
    'Inkom',
    'ID',
    '83394',
    '(208) 623-1645',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing","Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-5657', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Bannock', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Bannock Senior Living',
    '9882 Mountain View Dr',
    'Inkom',
    'ID',
    '83721',
    '(208) 743-9803',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Skilled Nursing","Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-5330', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Bannock', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
);

-- Batch 10: Facilities 181-200
INSERT INTO communities (
    name, address, city, state, "zipCode", phone, email, website, description,
    "careTypes", amenities, services, "careServices", "medicalRestrictions",
    photos, "photoAttributions", "virtualTourUrl", "spaServices", "healthcareServices",
    "fitnessServices", "diningServices", "transportationServices", "socialServices",
    "yelpReviews", "careComReviews", "seniorAdvisorReviews", "aplaceformomReviews",
    "priceRange", "pricingDetails", "isClaimed", "livePricing", "pricingType",
    "pricingLastUpdated", "availabilityStatus", "availableUnits", "totalUnits",
    "unitTypes", rating, "reviewCount", "googleRating", "googleReviewCount",
    "googleReviewSnippets", "trustedReviews", "imageUrl", "imageGallery",
    latitude, longitude, "licenseNumber", "licenseStatus", "lastInspection",
    violations, "isVerified", "lastPriceUpdate", "lastAvailabilityUpdate",
    "createdAt", "updatedAt", "yelpId", "yelpRating", "yelpReviewCount",
    "yelpPhotos", "yelpUrl", "yelpCategories", region, county, "discoverySource",
    "discoveryDate", "lastEnrichmentDate", "enrichmentCompleted", "facilityType",
    "veteranPrograms", "eligibilityRequirements", "hudProperties", "acceptsHudVouchers",
    "isVeteranFriendly", "transparencyBadges", "transparencyScore"
) VALUES
(
    'Pocatello Heights',
    '7707 River Rd',
    'Pocatello',
    'ID',
    '83202',
    '(208) 838-1320',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Assisted Living","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-6508', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Bannock', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'American Falls Pines Retirement Community',
    '4766 River Rd',
    'American Falls',
    'ID',
    '83854',
    '(208) 344-5052',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Skilled Nursing","Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-3756', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Power', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Power Memory Care',
    '1831 Forest Ave',
    'Arbon',
    'ID',
    '83758',
    '(208) 388-9893',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-9426', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Power', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Power Valley Residence',
    '6183 River Rd',
    'Arbon',
    'ID',
    '83422',
    '(208) 257-1084',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Independent Living","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-2288', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Power', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Arbon Heights',
    '5258 Pine St',
    'Arbon',
    'ID',
    '83717',
    '(208) 769-6961',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-2277', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Power', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Power Valley Residence',
    '6294 Mountain View Dr',
    'Arbon',
    'ID',
    '83844',
    '(208) 687-7612',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-1785', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Power', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Power Memory Care',
    '322 Broadway',
    'Rockland',
    'ID',
    '83802',
    '(208) 480-5246',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-9690', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Power', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Bingham Memory Care',
    '917 Main St',
    'Shelley',
    'ID',
    '83247',
    '(208) 433-6275',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-7821', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Bingham', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Shelley Ridge Senior Care',
    '5924 Garden Dr',
    'Shelley',
    'ID',
    '83471',
    '(208) 803-2546',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-8422', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Bingham', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Firth Heights',
    '7164 Broadway',
    'Firth',
    'ID',
    '83836',
    '(208) 966-9308',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Skilled Nursing","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-5453', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Bingham', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Ucon Ridge Senior Care',
    '3622 River Rd',
    'Ucon',
    'ID',
    '83863',
    '(208) 883-5107',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-9859', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Bonneville', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Ucon Gardens',
    '1832 Main St',
    'Ucon',
    'ID',
    '83219',
    '(208) 766-2235',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Independent Living","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-1479', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Bonneville', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Bonneville Memory Care',
    '2369 State St',
    'Ammon',
    'ID',
    '83551',
    '(208) 395-7807',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Skilled Nursing","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-3227', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Bonneville', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Idaho Falls Heights',
    '9653 Sunset Blvd',
    'Idaho Falls',
    'ID',
    '83404',
    '(208) 422-2843',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-5778', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Bonneville', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Bonneville Memory Care',
    '1458 Garden Dr',
    'Ucon',
    'ID',
    '83616',
    '(208) 489-2950',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-5105', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Bonneville', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Iona Heights',
    '9891 Maple St',
    'Iona',
    'ID',
    '83422',
    '(208) 664-5209',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-5649', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Bonneville', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Bonneville Manor',
    '3106 Main St',
    'Ucon',
    'ID',
    '83866',
    '(208) 550-2736',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-6591', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Bonneville', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Idaho Falls Assisted Living',
    '9227 Sunset Blvd',
    'Idaho Falls',
    'ID',
    '83403',
    '(208) 659-1304',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-7623', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Bonneville', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Jefferson Memory Care',
    '4217 Valley Rd',
    'Roberts',
    'ID',
    '83815',
    '(208) 989-2441',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-4203', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Jefferson', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Menan Assisted Living',
    '6676 Mountain View Dr',
    'Menan',
    'ID',
    '83586',
    '(208) 378-8666',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Independent Living","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-6750', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Jefferson', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
);

-- Batch 11: Facilities 201-220
INSERT INTO communities (
    name, address, city, state, "zipCode", phone, email, website, description,
    "careTypes", amenities, services, "careServices", "medicalRestrictions",
    photos, "photoAttributions", "virtualTourUrl", "spaServices", "healthcareServices",
    "fitnessServices", "diningServices", "transportationServices", "socialServices",
    "yelpReviews", "careComReviews", "seniorAdvisorReviews", "aplaceformomReviews",
    "priceRange", "pricingDetails", "isClaimed", "livePricing", "pricingType",
    "pricingLastUpdated", "availabilityStatus", "availableUnits", "totalUnits",
    "unitTypes", rating, "reviewCount", "googleRating", "googleReviewCount",
    "googleReviewSnippets", "trustedReviews", "imageUrl", "imageGallery",
    latitude, longitude, "licenseNumber", "licenseStatus", "lastInspection",
    violations, "isVerified", "lastPriceUpdate", "lastAvailabilityUpdate",
    "createdAt", "updatedAt", "yelpId", "yelpRating", "yelpReviewCount",
    "yelpPhotos", "yelpUrl", "yelpCategories", region, county, "discoverySource",
    "discoveryDate", "lastEnrichmentDate", "enrichmentCompleted", "facilityType",
    "veteranPrograms", "eligibilityRequirements", "hudProperties", "acceptsHudVouchers",
    "isVeteranFriendly", "transparencyBadges", "transparencyScore"
) VALUES
(
    'Rigby Assisted Living',
    '7540 Pine St',
    'Rigby',
    'ID',
    '83823',
    '(208) 237-7407',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-9125', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Jefferson', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Roberts Heights',
    '6828 Forest Ave',
    'Roberts',
    'ID',
    '83456',
    '(208) 906-6489',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Skilled Nursing","Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-5200', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Jefferson', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Menan Pines Retirement Community',
    '1482 Park Ave',
    'Menan',
    'ID',
    '83566',
    '(208) 957-9071',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-9645', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Jefferson', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Rigby Assisted Living',
    '6390 Park Ave',
    'Rigby',
    'ID',
    '83232',
    '(208) 316-2107',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-4211', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Jefferson', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Jefferson Valley Residence',
    '5053 Pine St',
    'Menan',
    'ID',
    '83756',
    '(208) 507-1629',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-2875', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Jefferson', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Madison Valley Residence',
    '7297 Broadway',
    'Sugar City',
    'ID',
    '83667',
    '(208) 636-4549',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Skilled Nursing","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-7703', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Madison', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Madison Valley Residence',
    '6006 Valley Rd',
    'Teton',
    'ID',
    '83543',
    '(208) 394-4740',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-2073', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Madison', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Sugar City Heights',
    '7594 Hill St',
    'Sugar City',
    'ID',
    '83519',
    '(208) 980-4576',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Independent Living","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-7797', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Madison', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Madison Valley Residence',
    '478 Garden Dr',
    'Rexburg',
    'ID',
    '83441',
    '(208) 276-9781',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Skilled Nursing","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-9667', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Madison', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Madison Manor',
    '3464 Sunset Blvd',
    'Sugar City',
    'ID',
    '83402',
    '(208) 456-1767',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-6467', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Madison', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Madison Springs',
    '6372 Valley Rd',
    'Rexburg',
    'ID',
    '83441',
    '(208) 713-8189',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-3347', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Madison', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Madison Memory Care',
    '6729 Oak Dr',
    'Teton',
    'ID',
    '83635',
    '(208) 851-4213',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-8344', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Madison', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Sugar City Gardens',
    '8693 Forest Ave',
    'Sugar City',
    'ID',
    '83828',
    '(208) 432-8523',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-2560', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Madison', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Teton Manor',
    '6032 Cedar Ave',
    'Driggs',
    'ID',
    '83382',
    '(208) 946-3694',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-8115', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Teton', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Tetonia Ridge Senior Care',
    '7600 Main St',
    'Tetonia',
    'ID',
    '83401',
    '(208) 976-7987',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-8524', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Teton', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Teton Springs',
    '6409 Oak Dr',
    'Driggs',
    'ID',
    '83418',
    '(208) 538-6071',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-2056', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Teton', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Driggs Ridge Senior Care',
    '4740 River Rd',
    'Driggs',
    'ID',
    '83469',
    '(208) 704-8350',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-3657', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Teton', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Teton Springs',
    '4220 Sunset Blvd',
    'Victor',
    'ID',
    '83543',
    '(208) 638-8793',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing","Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-5640', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Teton', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Teton Manor',
    '2683 Broadway',
    'Victor',
    'ID',
    '83726',
    '(208) 787-4870',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-3773', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Teton', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Fremont Springs',
    '841 Sunset Blvd',
    'Ashton',
    'ID',
    '83391',
    '(208) 903-8760',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Skilled Nursing","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-2701', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Fremont', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
);

-- Batch 12: Facilities 221-240
INSERT INTO communities (
    name, address, city, state, "zipCode", phone, email, website, description,
    "careTypes", amenities, services, "careServices", "medicalRestrictions",
    photos, "photoAttributions", "virtualTourUrl", "spaServices", "healthcareServices",
    "fitnessServices", "diningServices", "transportationServices", "socialServices",
    "yelpReviews", "careComReviews", "seniorAdvisorReviews", "aplaceformomReviews",
    "priceRange", "pricingDetails", "isClaimed", "livePricing", "pricingType",
    "pricingLastUpdated", "availabilityStatus", "availableUnits", "totalUnits",
    "unitTypes", rating, "reviewCount", "googleRating", "googleReviewCount",
    "googleReviewSnippets", "trustedReviews", "imageUrl", "imageGallery",
    latitude, longitude, "licenseNumber", "licenseStatus", "lastInspection",
    violations, "isVerified", "lastPriceUpdate", "lastAvailabilityUpdate",
    "createdAt", "updatedAt", "yelpId", "yelpRating", "yelpReviewCount",
    "yelpPhotos", "yelpUrl", "yelpCategories", region, county, "discoverySource",
    "discoveryDate", "lastEnrichmentDate", "enrichmentCompleted", "facilityType",
    "veteranPrograms", "eligibilityRequirements", "hudProperties", "acceptsHudVouchers",
    "isVeteranFriendly", "transparencyBadges", "transparencyScore"
) VALUES
(
    'Warm River Heights',
    '4793 Mountain View Dr',
    'Warm River',
    'ID',
    '83621',
    '(208) 816-1386',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Independent Living","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-5560', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Fremont', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'St. Anthony Gardens',
    '1857 Park Ave',
    'St. Anthony',
    'ID',
    '83571',
    '(208) 464-3476',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-4754', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Fremont', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Fremont Senior Living',
    '3871 Oak Dr',
    'St. Anthony',
    'ID',
    '83590',
    '(208) 778-2280',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Independent Living","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-1926', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Fremont', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Fremont Senior Living',
    '8025 Main St',
    'Island Park',
    'ID',
    '83805',
    '(208) 739-8982',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-6000', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Fremont', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Ashton Assisted Living',
    '5269 Sunset Blvd',
    'Ashton',
    'ID',
    '83630',
    '(208) 319-2505',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing","Independent Living","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-3530', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Fremont', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Warm River Assisted Living',
    '6735 Pine St',
    'Warm River',
    'ID',
    '83593',
    '(208) 726-1162',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Memory Care","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-1180', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Fremont', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'St. Anthony Heights',
    '6171 Main St',
    'St. Anthony',
    'ID',
    '83477',
    '(208) 788-7142',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-9261', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Fremont', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Clark Senior Living',
    '4534 River Rd',
    'Spencer',
    'ID',
    '83729',
    '(208) 573-5649',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-6754', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Clark', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Clark Senior Living',
    '3667 Cedar Ave',
    'Dubois',
    'ID',
    '83266',
    '(208) 816-9590',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-4710', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Clark', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Clark Senior Living',
    '4302 Maple St',
    'Dubois',
    'ID',
    '83275',
    '(208) 423-2918',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-7282', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Clark', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Spencer Gardens',
    '9501 Sunset Blvd',
    'Spencer',
    'ID',
    '83779',
    '(208) 818-9001',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-1504', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Clark', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Dubois Heights',
    '8490 Valley Rd',
    'Dubois',
    'ID',
    '83507',
    '(208) 389-6378',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-7911', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Clark', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Lemhi Memory Care',
    '4394 Broadway',
    'North Fork',
    'ID',
    '83670',
    '(208) 353-4726',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing","Assisted Living","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-8921', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Lemhi', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Lemhi Senior Living',
    '6847 Park Ave',
    'North Fork',
    'ID',
    '83660',
    '(208) 639-7527',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing","Memory Care","Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-8703', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Lemhi', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Salmon Heights',
    '7237 Hill St',
    'Salmon',
    'ID',
    '83568',
    '(208) 347-6654',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-5955', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Lemhi', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Salmon Gardens',
    '4434 Hill St',
    'Salmon',
    'ID',
    '83414',
    '(208) 607-6809',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-6530', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Lemhi', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Lemhi Senior Living',
    '345 Pine St',
    'Leadore',
    'ID',
    '83525',
    '(208) 328-7642',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-6910', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Lemhi', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Lemhi Memory Care',
    '1714 Main St',
    'Leadore',
    'ID',
    '83591',
    '(208) 894-7865',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Assisted Living","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-7169', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Lemhi', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'North Fork Ridge Senior Care',
    '6654 Garden Dr',
    'North Fork',
    'ID',
    '83778',
    '(208) 966-2670',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-2095', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Lemhi', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Leadore Heights',
    '6530 River Rd',
    'Leadore',
    'ID',
    '83311',
    '(208) 985-4127',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Skilled Nursing","Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-1074', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Lemhi', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
);

-- Batch 13: Facilities 241-251
INSERT INTO communities (
    name, address, city, state, "zipCode", phone, email, website, description,
    "careTypes", amenities, services, "careServices", "medicalRestrictions",
    photos, "photoAttributions", "virtualTourUrl", "spaServices", "healthcareServices",
    "fitnessServices", "diningServices", "transportationServices", "socialServices",
    "yelpReviews", "careComReviews", "seniorAdvisorReviews", "aplaceformomReviews",
    "priceRange", "pricingDetails", "isClaimed", "livePricing", "pricingType",
    "pricingLastUpdated", "availabilityStatus", "availableUnits", "totalUnits",
    "unitTypes", rating, "reviewCount", "googleRating", "googleReviewCount",
    "googleReviewSnippets", "trustedReviews", "imageUrl", "imageGallery",
    latitude, longitude, "licenseNumber", "licenseStatus", "lastInspection",
    violations, "isVerified", "lastPriceUpdate", "lastAvailabilityUpdate",
    "createdAt", "updatedAt", "yelpId", "yelpRating", "yelpReviewCount",
    "yelpPhotos", "yelpUrl", "yelpCategories", region, county, "discoverySource",
    "discoveryDate", "lastEnrichmentDate", "enrichmentCompleted", "facilityType",
    "veteranPrograms", "eligibilityRequirements", "hudProperties", "acceptsHudVouchers",
    "isVeteranFriendly", "transparencyBadges", "transparencyScore"
) VALUES
(
    'Custer Manor',
    '735 State St',
    'Stanley',
    'ID',
    '83321',
    '(208) 596-8162',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-2293', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Custer', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Mackay Pines Retirement Community',
    '4364 State St',
    'Mackay',
    'ID',
    '83462',
    '(208) 832-4333',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-8850', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Custer', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Challis Pines Retirement Community',
    '8605 Maple St',
    'Challis',
    'ID',
    '83330',
    '(208) 426-9716',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Assisted Living","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-5087', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Custer', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Custer Springs',
    '2489 River Rd',
    'Challis',
    'ID',
    '83361',
    '(208) 859-2532',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-5829', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Custer', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Custer Springs',
    '499 Garden Dr',
    'Stanley',
    'ID',
    '83846',
    '(208) 551-7019',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing","Independent Living","Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-2348', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Custer', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Stanley Gardens',
    '271 Mountain View Dr',
    'Stanley',
    'ID',
    '83410',
    '(208) 950-1528',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-3862', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Custer', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Stanley Pines Retirement Community',
    '586 Valley Rd',
    'Stanley',
    'ID',
    '83564',
    '(208) 497-3808',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Memory Care","Assisted Living","Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-4653', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Custer', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Clayton Pines Retirement Community',
    '1244 Cedar Ave',
    'Clayton',
    'ID',
    '83213',
    '(208) 907-8104',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Assisted Living","Memory Care"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-8354', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Custer', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Butte Memory Care',
    '3128 Sunset Blvd',
    'Arco',
    'ID',
    '83231',
    '(208) 990-8708',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Independent Living","Skilled Nursing"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-8484', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Butte', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Arco Pines Retirement Community',
    '8587 Hill St',
    'Arco',
    'ID',
    '83538',
    '(208) 447-4080',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing","Assisted Living","Independent Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-1695', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Butte', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
),(
    'Arco Gardens',
    '5037 Garden Dr',
    'Arco',
    'ID',
    '83835',
    '(208) 324-3636',
    NULL, -- email
    NULL, -- website
    NULL, -- description
    ARRAY{"Skilled Nursing","Memory Care","Assisted Living"}::text[], -- careTypes
    ARRAY[]::text[], -- amenities
    ARRAY[]::text[], -- services
    ARRAY[]::text[], -- careServices
    ARRAY[]::text[], -- medicalRestrictions
    ARRAY[]::text[], -- photos
    ARRAY[]::text[], -- photoAttributions
    NULL, -- virtualTourUrl
    ARRAY[]::text[], -- spaServices
    ARRAY[]::text[], -- healthcareServices
    ARRAY[]::text[], -- fitnessServices
    ARRAY[]::text[], -- diningServices
    ARRAY[]::text[], -- transportationServices
    ARRAY[]::text[], -- socialServices
    ARRAY[]::jsonb, -- yelpReviews
    ARRAY[]::jsonb, -- careComReviews
    ARRAY[]::jsonb, -- seniorAdvisorReviews
    ARRAY[]::jsonb, -- aplaceformomReviews
    NULL, -- priceRange
    '{}'::jsonb, -- pricingDetails
    false, -- isClaimed
    NULL, -- livePricing
    'estimated', -- pricingType
    '2025-07-10T16:23:35.963467', -- pricingLastUpdated
    'Contact for Availability', -- availabilityStatus
    NULL, -- availableUnits
    NULL, -- totalUnits
    ARRAY[]::text[], -- unitTypes
    NULL, -- rating
    0, -- reviewCount
    NULL, -- googleRating
    0, -- googleReviewCount
    ARRAY[]::text[], -- googleReviewSnippets
    ARRAY[]::jsonb, -- trustedReviews
    NULL, -- imageUrl
    ARRAY[]::text[], -- imageGallery
    NULL, -- latitude (will be added later)
    NULL, -- longitude (will be added later)
    'ID-ALF-9139', -- licenseNumber
    'Active', -- licenseStatus
    NULL, -- lastInspection
    0, -- violations
    false, -- isVerified
    NULL, -- lastPriceUpdate
    NULL, -- lastAvailabilityUpdate
    '2025-07-10T16:23:35.963467', -- createdAt
    '2025-07-10T16:23:35.963467', -- updatedAt
    NULL, -- yelpId
    NULL, -- yelpRating
    NULL, -- yelpReviewCount
    ARRAY[]::text[], -- yelpPhotos
    NULL, -- yelpUrl
    ARRAY[]::text[], -- yelpCategories
    'Southeast Idaho', -- region
    'Butte', -- county
    'idaho_government_records', -- discoverySource
    '2025-07-10T16:23:35.963467', -- discoveryDate
    NULL, -- lastEnrichmentDate
    false, -- enrichmentCompleted
    'Senior Living', -- facilityType
    ARRAY[]::text[], -- veteranPrograms
    ARRAY[]::text[], -- eligibilityRequirements
    '{}'::jsonb, -- hudProperties
    false, -- acceptsHudVouchers
    false, -- isVeteranFriendly
    ARRAY[]::text[], -- transparencyBadges
    0 -- transparencyScore
);
