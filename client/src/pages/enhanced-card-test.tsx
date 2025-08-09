import React from "react";
import { PrioritizedCommunityCard } from "@/components/PrioritizedCommunityCard";
import { ScrollArea } from "@/components/ui/scroll-area";

const testCommunities = [
  {
    id: 1,
    name: "Sunrise Memory Care Center (Community Verified)",
    city: "Austin",
    state: "TX",
    careLevel: "Memory Care",
    communitySubtype: "memory_care",
    totalUnits: 85,
    availableUnits: 3,
    occupancyRate: 96,
    waitListLength: 12,
    monthlyRentRangeStart: 6500,
    monthlyRentRangeEnd: 8500,
    rating: 4.8,
    reviewCount: 127,
    petFriendly: true,
    verified: true,  // This shows COMMUNITY VERIFIED badge
    licenseStatus: "Licensed",
    violations: 0,
    specialPromotions: [
      {
        title: "First Month Free",
        description: "Move in by February 28th",
        monthsWaived: 1
      }
    ],
    medicalRestrictions: ["No Ventilators", "No Dialysis"],
    sizeCategory: "Large"
  },
  {
    id: 2,
    name: "Golden Years HUD Housing (HUD Verified)",
    city: "Phoenix",
    state: "AZ",
    careLevel: "HUD Senior Housing",
    communitySubtype: "hud_senior_housing",
    hudPropertyId: "HUD-12345",  // This shows HUD VERIFIED badge
    totalUnits: 120,
    availableUnits: 18,
    occupancyRate: 85,
    rentPerMonth: 850,
    rating: 4.2,
    reviewCount: 89,
    petFriendly: false,
    verified: false,  // Ignored when hudPropertyId exists
    licenseStatus: "Licensed",
    violations: 1,
    sizeCategory: "Large"
  },
  {
    id: 3,
    name: "Active Living 55+ Resort (Market Intelligence)",
    city: "Scottsdale",
    state: "AZ",
    careLevel: "55+ Active Adult",
    communitySubtype: "active_adult_55plus",
    totalUnits: 200,
    availableUnits: 45,
    occupancyRate: 78,
    monthlyRentRangeStart: 2800,
    monthlyRentRangeEnd: 4200,
    rating: 4.6,
    reviewCount: 234,
    petFriendly: true,
    verified: false,
    licenseStatus: "Under Review",
    violations: 0,
    specialPromotions: [
      {
        title: "Spring Special - 2 Months Free",
        description: "Limited time offer",
        monthsWaived: 2,
        percentageOff: 15
      }
    ],
    sizeCategory: "Extra Large"
  },
  {
    id: 4,
    name: "Skilled Nursing & Rehab Center",
    city: "Dallas",
    state: "TX",
    careLevel: "Skilled Nursing",
    communitySubtype: "skilled_nursing",
    totalUnits: 150,
    availableUnits: 2,
    occupancyRate: 99,
    waitListLength: 25,
    monthlyRentRangeStart: 8000,
    monthlyRentRangeEnd: 12000,
    rating: 3.9,
    reviewCount: 156,
    petFriendly: false,
    verified: true,
    licenseStatus: "Licensed",
    violations: 3,
    medicalRestrictions: ["No Behavioral Issues", "No Bariatric Patients"],
    sizeCategory: "Large"
  },
  {
    id: 5,
    name: "Shady Oaks Mobile Home Park",
    city: "Tucson",
    state: "AZ",
    careLevel: "Mobile Home Park",
    communitySubtype: "mobile_home_park",
    totalUnits: 75,
    availableUnits: 12,
    occupancyRate: 84,
    monthlyRentRangeStart: 650,
    monthlyRentRangeEnd: 950,
    rating: 4.0,
    reviewCount: 45,
    petFriendly: true,
    verified: false,
    licenseStatus: "Licensed",
    violations: 0,
    sizeCategory: "Medium"
  },
  {
    id: 6,
    name: "Garden View Independent Living",
    city: "San Diego",
    state: "CA",
    careLevel: "Independent Living",
    communitySubtype: "independent_living",
    totalUnits: 95,
    availableUnits: 28,
    occupancyRate: 71,
    monthlyRentRangeStart: 3500,
    monthlyRentRangeEnd: 5500,
    rating: 4.7,
    reviewCount: 198,
    petFriendly: true,
    verified: true,
    licenseStatus: "Licensed",
    violations: 0,
    specialPromotions: [
      {
        title: "Valentine's Special",
        description: "50% off community fee",
        percentageOff: 50
      }
    ],
    moveInCosts: {
      securityDeposit: 3500,
      communityFee: 2000,
      totalEstimatedMoveIn: 9000
    },
    sizeCategory: "Medium"
  }
];

export default function EnhancedCardTest() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-white">Enhanced Community Card Test</h1>
          <p className="text-gray-300 mt-2">Testing occupancy data, critical information, and care-type placeholders</p>
        </div>
      </div>

      {/* Community Cards Grid */}
      <ScrollArea className="h-[calc(100vh-120px)]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testCommunities.map((community) => (
              <PrioritizedCommunityCard
                key={community.id}
                community={community}
                onSelect={() => console.log(`Selected: ${community.name}`)}
                onToggleFavorite={() => console.log(`Toggled favorite: ${community.name}`)}
                isFavorite={false}
              />
            ))}
          </div>
          
          {/* Feature Highlights */}
          <div className="mt-12 bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4">New Features Demonstrated</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div>
                <h3 className="text-green-400 font-semibold mb-2">✓ Dynamic Occupancy Display</h3>
                <ul className="space-y-1 ml-4">
                  <li>• Shows actual unit numbers (e.g., "3 of 85 units")</li>
                  <li>• Color-coded status: Green (Available), Yellow (Soon), Orange (Limited), Red (Wait List)</li>
                  <li>• Wait list count when full</li>
                  <li>• Occupancy percentage in placeholder</li>
                </ul>
              </div>
              <div>
                <h3 className="text-green-400 font-semibold mb-2">✓ Care-Type Specific Placeholders</h3>
                <ul className="space-y-1 ml-4">
                  <li>• 🧠 Memory Care</li>
                  <li>• 🏥 Skilled Nursing</li>
                  <li>• 🏡 Independent Living</li>
                  <li>• 🏛️ HUD Housing</li>
                  <li>• 🎾 55+ Active</li>
                  <li>• 🚐 Mobile Park</li>
                </ul>
              </div>
              <div>
                <h3 className="text-green-400 font-semibold mb-2">✓ Critical Information</h3>
                <ul className="space-y-1 ml-4">
                  <li>• Pet policy indicators</li>
                  <li>• Special promotions with savings</li>
                  <li>• Medical restrictions alerts</li>
                  <li>• License status display</li>
                  <li>• Violations count when present</li>
                  <li>• Verification status in header</li>
                </ul>
              </div>
              <div>
                <h3 className="text-green-400 font-semibold mb-2">✓ Price Intelligence</h3>
                <ul className="space-y-1 ml-4">
                  <li>• HUD verified pricing</li>
                  <li>• Live pricing ranges</li>
                  <li>• Market intelligence estimates</li>
                  <li>• Move-in cost details</li>
                  <li>• Dynamic verification badges</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}