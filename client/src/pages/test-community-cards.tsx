import React from 'react';
import { EnhancedCommunityCard } from '@/components/EnhancedCommunityCard';
import { PrioritizedCommunityCard } from '@/components/PrioritizedCommunityCard';

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
          Community Card Test - Prioritized Information Architecture
        </h1>
        
        <div className="space-y-12">
          {/* NEW PRIORITIZED DESIGN - User-Focused Information Hierarchy */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-xl">
            <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
              🎯 NEW: Prioritized Cards - Critical Info First
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Immediate access to: Pricing • Availability • Wait List Status • Direct Contact • Compare Options
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Available Now Community */}
              <PrioritizedCommunityCard 
                community={{
                  ...sampleCommunity,
                  occupancyRate: 75,
                  phone: "(555) 123-4567",
                  verified: true
                }} 
                variant="grid"
                onSelect={() => console.log('Selected prioritized card')}
                onCompare={() => console.log('Added to compare')}
              />
              
              {/* Limited Availability */}
              <PrioritizedCommunityCard 
                community={{
                  ...hudCommunity,
                  occupancyRate: 92,
                  phone: "(555) 234-5678",
                  verified: true
                }} 
                variant="grid"
                onSelect={() => console.log('Selected HUD prioritized card')}
                onCompare={() => console.log('Added to compare')}
              />
              
              {/* Wait List Community */}
              <PrioritizedCommunityCard 
                community={{
                  ...contactPricingCommunity,
                  occupancyRate: 100,
                  waitListLength: 12,
                  phone: "(555) 345-6789",
                  verified: false
                }} 
                variant="grid"
                onSelect={() => console.log('Selected wait list card')}
                onCompare={() => console.log('Added to compare')}
              />
            </div>
            
            {/* List View Example */}
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              List View - Horizontal Layout for Scrolling
            </h3>
            <div className="space-y-4">
              <PrioritizedCommunityCard 
                community={{
                  ...sampleCommunity,
                  occupancyRate: 88,
                  phone: "(555) 456-7890",
                  verified: true
                }} 
                variant="list"
                onSelect={() => console.log('Selected list card')}
                onCompare={() => console.log('Added to compare')}
              />
            </div>
          </section>

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