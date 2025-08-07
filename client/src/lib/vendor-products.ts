// Vendor product definitions for MySeniorValet
export interface VendorProduct {
  id: string;
  name: string;
  description: string;
  price: number; // in cents
  features: string[];
}

export const VENDOR_PRODUCTS: VendorProduct[] = [
  {
    id: 'basic-vendor',
    name: 'Basic Listing',
    description: 'Full state-wide coverage with professional vendor listing',
    price: 9900, // $99.00/month
    features: [
      'Full coverage across 1 entire state',
      'Professional vendor listing & profile',
      'Name, phone, category, description',
      'Optional $25 verified badge',
      'User reviews & ratings',
      'Affiliate link support',
      'Basic lead notifications'
    ]
  },
  {
    id: 'featured-vendor',
    name: 'Featured Vendor',
    description: 'Multi-state presence with enhanced branding and analytics',
    price: 24900, // $249.00/month
    features: [
      'Coverage across up to 3 states',
      'Featured placement in search results',
      'Upload logo, brand colors, CTA button',
      'Advanced analytics dashboard',
      'Post vendor promos & special offers',
      'Priority placement in vendor carousels',
      'Approved vendor badge with verification',
      'Enhanced lead scoring & insights'
    ]
  },
  {
    id: 'national-partner',
    name: 'National Partner',
    description: 'Complete North American coverage with premium features',
    price: 49900, // $499.00/month
    features: [
      'Full US & Canada nationwide coverage',
      'Premium banner rotation & placement',
      'Concierge system priority routing',
      'AI-powered lead summaries & scoring',
      'API integration for lead passback',
      'Custom branded vendor microsite',
      'Quarterly performance reports',
      'Dedicated success manager',
      'International expansion ready'
    ]
  }
];