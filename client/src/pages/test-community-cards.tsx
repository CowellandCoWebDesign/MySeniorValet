import React from 'react';
import { EnhancedCommunityCard } from '@/components/EnhancedCommunityCard';

// Sample community data for testing
const sampleCommunity = {
  id: 1,
  name: "Sunset Senior Living",
  city: "San Francisco",
  state: "CA",
  address: "123 Main St, San Francisco, CA 94122",
  zipCode: "94122",
  latitude: 37.7749,
  longitude: -122.4194,
  careTypes: ["Assisted Living", "Memory Care"],
  rating: 4.5,
  totalUnits: 100,
  occupancyRate: 85,
  photos: [],
  displayPricing: {
    hudPricing: null,
    marketPricing: "$3,500",
    priceLabel: "Market Estimate"
  },
  transparencyScore: 85,
  communitySubtype: "Assisted Living",
  sizeCategory: "Medium"
};

const hudCommunity = {
  ...sampleCommunity,
  id: 2,
  name: "HUD Affordable Housing",
  hudPropertyId: "800001234",
  displayPricing: {
    hudPricing: "$425",
    marketPricing: null,
    priceLabel: "HUD Verified"
  }
};

const contactPricingCommunity = {
  ...sampleCommunity,
  id: 3,
  name: "Premium Senior Resort",
  displayPricing: {
    hudPricing: null,
    marketPricing: null,
    priceLabel: "Contact for Pricing"
  }
};

export default function TestCommunityCards() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Community Card Test - Direct Message Button & Pricing Position
        </h1>
        
        <div className="space-y-12">
          {/* Enhanced Variant */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Enhanced Variant
            </h2>
            <div className="space-y-6">
              <EnhancedCommunityCard 
                community={sampleCommunity} 
                variant="enhanced"
                onSelect={() => console.log('Selected enhanced card')}
              />
              <EnhancedCommunityCard 
                community={hudCommunity} 
                variant="enhanced"
                onSelect={() => console.log('Selected HUD enhanced card')}
              />
              <EnhancedCommunityCard 
                community={contactPricingCommunity} 
                variant="enhanced"
                onSelect={() => console.log('Selected contact pricing enhanced card')}
              />
            </div>
          </section>

          {/* Horizontal Variant */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Horizontal Variant
            </h2>
            <div className="space-y-6">
              <EnhancedCommunityCard 
                community={sampleCommunity} 
                variant="horizontal"
                onSelect={() => console.log('Selected horizontal card')}
              />
              <EnhancedCommunityCard 
                community={hudCommunity} 
                variant="horizontal"
                onSelect={() => console.log('Selected HUD horizontal card')}
              />
              <EnhancedCommunityCard 
                community={contactPricingCommunity} 
                variant="horizontal"
                onSelect={() => console.log('Selected contact pricing horizontal card')}
              />
            </div>
          </section>

          {/* List Variant */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              List Variant
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <EnhancedCommunityCard 
                community={sampleCommunity} 
                variant="list"
                onSelect={() => console.log('Selected list card')}
              />
              <EnhancedCommunityCard 
                community={hudCommunity} 
                variant="list"
                onSelect={() => console.log('Selected HUD list card')}
              />
              <EnhancedCommunityCard 
                community={contactPricingCommunity} 
                variant="list"
                onSelect={() => console.log('Selected contact pricing list card')}
              />
            </div>
          </section>

          {/* Featured Variant */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Featured Variant
            </h2>
            <div className="space-y-6">
              <EnhancedCommunityCard 
                community={sampleCommunity} 
                variant="featured"
                onSelect={() => console.log('Selected featured card')}
              />
            </div>
          </section>
        </div>

        {/* Testing Notes */}
        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">
            Testing Checklist
          </h3>
          <ul className="space-y-2 text-blue-800 dark:text-blue-300">
            <li>✓ Pricing positioned in top right corner for all variants</li>
            <li>✓ Direct Message button visible and disabled</li>
            <li>✓ Tooltip shows "Direct messaging available after community verification"</li>
            <li>✓ Button displays "Direct Message - Verification Required"</li>
            <li>✓ MessageCircle icon visible in button</li>
            <li>✓ Consistent styling across all card variants</li>
          </ul>
        </div>
      </div>
    </div>
  );
}