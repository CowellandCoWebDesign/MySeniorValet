import { CommunityCard, type CommunityCardData } from '@/components/CommunityCard';

const sampleCommunity: CommunityCardData = {
  id: 1,
  name: "Sunset Senior Living",
  city: "San Francisco",
  state: "CA",
  address: "123 Main St, San Francisco, CA 94122",
  careTypes: ["Assisted Living", "Memory Care"],
  rating: 4.5,
  reviewCount: 42,
  pricingType: "live",
  priceRange: { min: 3500, max: 5200 },
  photos: ["https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600"],
};

const hudCommunity: CommunityCardData = {
  ...sampleCommunity,
  id: 2,
  name: "HUD Affordable Housing Community for Seniors",
  hudPropertyId: "800001234",
  rentPerMonth: 425,
  rating: null,
  priceRange: null,
  photos: [],
};

const claimedCommunity: CommunityCardData = {
  ...sampleCommunity,
  id: 3,
  name: "Maplewood Operator-Claimed Estate",
  isClaimed: true,
  rating: 4.1,
  careTypes: ["Independent Living"],
};

const contactPricingCommunity: CommunityCardData = {
  ...sampleCommunity,
  id: 4,
  name: "Premium Senior Resort (no verified price)",
  priceRange: null,
  basePrice: null,
  rating: 4.8,
  featured: true,
};

const bilingualCommunity: CommunityCardData = {
  ...sampleCommunity,
  id: 5,
  name: "Résidence Les Érables",
  city: "Montréal",
  state: "QC",
  bilingual: true,
  careTypes: ["Assisted Living"],
  rating: 4.3,
  pricingType: "live",
  priceRange: { min: 2500, max: 5500 },
};

const all = [sampleCommunity, hudCommunity, claimedCommunity, contactPricingCommunity];

export default function TestCommunityCards() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Canonical Community Card — Variant Preview
        </h1>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Grid (standard)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {all.map((c) => (
              <CommunityCard key={c.id} community={c} variant="grid" />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Compact (slider)
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {all.map((c) => (
              <CommunityCard key={c.id} community={c} variant="compact" />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            List (map / search row)
          </h2>
          <div className="space-y-3 max-w-2xl">
            {all.map((c) => (
              <CommunityCard key={c.id} community={c} variant="list" />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Bilingual (FR) — Canada surface
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <CommunityCard community={bilingualCommunity} variant="grid" language="en" />
            <CommunityCard community={bilingualCommunity} variant="grid" language="fr" />
          </div>
        </section>
      </div>
    </div>
  );
}
