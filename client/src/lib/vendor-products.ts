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
    description: 'Public listing in vendor directory, limited to 1 zip cluster',
    price: 9900, // $99.00/month
    features: [
      'Public listing in vendor directory',
      'Region-limited to 1 zip cluster',
      'Name, phone, category, description',
      'Optional $25 verified badge',
      'User reviews allowed',
      'Affiliate link support'
    ]
  },
  {
    id: 'featured-vendor',
    name: 'Featured Vendor',
    description: 'Coverage across 5 regions, logo upload, analytics, featured placement',
    price: 24900, // $249.00/month
    features: [
      'All Basic Listing features',
      'Coverage across 5 regions',
      'Upload logo, brand colors, CTA button',
      'Basic analytics (views, clicks, leads)',
      'Post vendor promos',
      'Featured placement in vendor carousels',
      'Must have affiliate link for "Approved" badge'
    ]
  },
  {
    id: 'national-partner',
    name: 'National Partner',
    description: 'Nationwide visibility, banner rotation, concierge priority, AI lead summaries',
    price: 49900, // $499.00/month
    features: [
      'All Featured Vendor features',
      'Nationwide visibility (no geo cap)',
      'Banner rotation in major discovery areas',
      'Concierge system priority & routing',
      'AI-generated lead summaries + scoring',
      'Optional API or CSV lead passback',
      'Dedicated vendor microsite',
      'Quarterly performance report',
      'Optional vendor success call'
    ]
  }
];