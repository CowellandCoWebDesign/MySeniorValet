import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SimplifiedCommunityCardProps {
  community: any;
  showCompareButton?: boolean;
  onCompare?: (community: any) => void;
}

export function SimplifiedCommunityCard({ 
  community, 
  showCompareButton = false, 
  onCompare 
}: SimplifiedCommunityCardProps) {
  // Format pricing display exactly like the screenshot
  const formatPrice = (price: any) => {
    if (!price) return '7300'; // Default like in screenshot
    if (typeof price === 'string') return price.replace('$', '').replace(',', '');
    if (typeof price === 'number') return price.toLocaleString();
    return '7300';
  };

  const averagePrice = community.displayPricing?.averagePrice || community.averagePrice || community.averageMonthlyRate;
  const startingPrice = community.displayPricing?.startingPrice || community.startingPrice;

  return (
    <Card className="w-full border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200 bg-white dark:bg-gray-800 rounded-lg overflow-hidden mb-4">
      <div className="flex h-[140px]">
        {/* Left side - Image (exactly like screenshot) */}
        <div className="w-[180px] h-full flex-shrink-0 relative">
          {/* Most Plans badge like in screenshot */}
          <div className="absolute top-2 left-2 z-10">
            <Badge className="bg-blue-600 hover:bg-blue-600 text-white text-xs px-2 py-0.5 rounded font-medium">
              Most Plans
            </Badge>
          </div>
          
          <img 
            src={community.photoUrl || community.image || community.imageUrl || '/api/placeholder/180/140'} 
            alt={community.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/api/placeholder/180/140';
            }}
          />
        </div>

        {/* Right side - Content (matching screenshot layout exactly) */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          {/* Top section */}
          <div>
            {/* Community Name */}
            <h3 className="font-semibold text-base text-gray-900 dark:text-white mb-1 leading-tight">
              {community.name || 'Willow Valley Communities'}
            </h3>
            
            {/* Location */}
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              {community.city || 'Lancaster'}, {community.state || 'PA'}
            </div>

            {/* Pricing Section - exactly like screenshot */}
            <div className="mb-3">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">Average Price:</div>
              <div className="text-lg font-bold text-black dark:text-white flex items-baseline">
                <span className="mr-1">💲</span>
                <span className="text-blue-600 dark:text-blue-400">
                  {formatPrice(averagePrice)}
                </span>
                <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-1">/ Month</span>
              </div>
              
              {startingPrice && (
                <div className="mt-1">
                  <div className="text-xs text-gray-600 dark:text-gray-400">Starting Price:</div>
                  <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    ${formatPrice(startingPrice)} / Month
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom section - Services with dots exactly like screenshot */}
          <div className="space-y-1">
            <div className="flex items-center text-xs text-gray-700 dark:text-gray-300">
              <div className="w-2 h-2 bg-gray-400 rounded-full mr-2 flex-shrink-0"></div>
              <span>Medication Management</span>
            </div>
            <div className="flex items-center text-xs text-gray-700 dark:text-gray-300">
              <div className="w-2 h-2 bg-gray-400 rounded-full mr-2 flex-shrink-0"></div>
              <span>24/7 Nursing Staff</span>
            </div>
            <div className="flex items-center text-xs text-gray-700 dark:text-gray-300">
              <div className="w-2 h-2 bg-gray-400 rounded-full mr-2 flex-shrink-0"></div>
              <span>Physical Therapy Services</span>
            </div>
            <div className="flex items-center text-xs text-gray-700 dark:text-gray-300">
              <div className="w-2 h-2 bg-gray-400 rounded-full mr-2 flex-shrink-0"></div>
              <span>Dressing Assistance</span>
            </div>
            
            {/* Availability line exactly like screenshot */}
            <div className="mt-2 pt-1 border-t border-gray-200 dark:border-gray-600">
              <div className="text-xs">
                <span className="text-gray-600 dark:text-gray-400">Availability: </span>
                <span className="font-medium text-green-600 dark:text-green-400">Yes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}