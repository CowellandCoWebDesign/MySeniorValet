export const COMMUNITY_TIER_INFO = {
  verified: {
    name: 'Verified Listing',
    features: [
      'Email verified listing',
      'Edit contact information (phone, website, email, address)',
      'Upload 1 photo to showcase your community',
      'Tour Scheduler enabled for easy booking',
      'Basic search visibility'
    ],
    nextSteps: [
      'Upload your community photo',
      'Update your contact information',
      'Enable tour scheduling',
      'Consider upgrading to Standard for more features'
    ]
  },
  standard: {
    name: 'Standard',
    features: [
      'All Verified features included',
      'Upload up to 10 photos',
      'Upload 1 brochure PDF',
      'Add external calendar link',
      'Access basic analytics dashboard',
      'Respond to community reviews',
      '"Standard Verified" badge'
    ],
    nextSteps: [
      'Upload additional photos to showcase your community',
      'Add your community brochure PDF',
      'Link your calendar for tour scheduling',
      'Check your analytics dashboard',
      'Start responding to reviews'
    ]
  },
  featured: {
    name: 'Featured',
    features: [
      'All Standard features included',
      'Upload up to 25 photos',
      '1 video tour (max 2 mins)',
      'Upload up to 3 PDFs',
      'Featured placement in search & maps',
      'In-app messaging with AI assist',
      'Promotional badge support',
      'Concierge "Preferred" tag'
    ],
    nextSteps: [
      'Upload a video tour of your community',
      'Add multiple PDFs (menus, activities, floor plans)',
      'Set up promotional badges',
      'Enable in-app messaging',
      'Enjoy your featured placement!'
    ]
  },
  platinum: {
    name: 'Platinum',
    features: [
      'All Featured features included',
      'Upload up to 50 photos',
      'Up to 3 videos (5 mins each)',
      'Unlimited PDF uploads',
      'Staff bios, care philosophy, menus',
      'Availability sync (form, spreadsheet, or API)',
      'Multi-property admin dashboard',
      'Top Concierge Priority',
      'Monthly performance review calls'
    ],
    nextSteps: [
      'Create comprehensive photo galleries',
      'Upload multiple video tours',
      'Add staff bios and care philosophy',
      'Set up availability synchronization',
      'Schedule your monthly performance review'
    ]
  }
};

export const VENDOR_TIER_INFO = {
  basic: {
    name: 'Basic Listing',
    features: [
      'Public listing in vendor directory',
      'Service area limited to 1 zip cluster',
      'Business name, phone, category, description',
      'Optional $25 verified badge',
      'Customer reviews enabled',
      'Affiliate link support'
    ],
    nextSteps: [
      'Complete your vendor profile',
      'Add detailed service descriptions',
      'Consider the verified badge option',
      'Start collecting customer reviews',
      'Set up affiliate links if applicable'
    ]
  },
  featured: {
    name: 'Featured Vendor',
    features: [
      'All Basic features included',
      'Expanded coverage across 5 regions',
      'Upload logo and brand colors',
      'Custom CTA button',
      'Analytics dashboard (views, clicks, leads)',
      'Post vendor promotions',
      'Featured placement in vendor carousels',
      'Approved badge with affiliate link'
    ],
    nextSteps: [
      'Upload your company logo',
      'Configure brand colors and CTA',
      'Select your 5 service regions',
      'Post your first promotion',
      'Monitor your analytics dashboard'
    ]
  },
  national: {
    name: 'National Partner',
    features: [
      'All Featured vendor benefits',
      'Unlimited nationwide visibility',
      'Premium banner rotation',
      'Concierge system priority routing',
      'AI-powered lead scoring',
      'API or CSV lead integration',
      'Dedicated vendor microsite',
      'Quarterly performance reports',
      'Dedicated success manager'
    ],
    nextSteps: [
      'Configure nationwide service areas',
      'Set up banner advertisements',
      'Enable AI lead scoring',
      'Configure lead integration (API/CSV)',
      'Customize your vendor microsite'
    ]
  }
};