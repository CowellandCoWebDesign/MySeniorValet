import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, MapPin, Phone, Globe, Star } from "lucide-react";

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
  // Format pricing display
  const formatPrice = (price: number | string) => {
    if (!price) return "Contact for pricing";
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `$${numPrice.toLocaleString()}`;
  };

  // Get average and starting prices
  const averagePrice = community.averageMonthlyRate || community.monthlyRate;
  const startingPrice = community.startingPrice || community.baseRate || (averagePrice * 0.8);

  // Get key services/amenities (similar to the checkmarks in your screenshot)
  const keyServices = [
    community.diningServices && "Dining Services",
    community.transportationServices && "Transportation",
    community.medicationManagement && "Medication Management", 
    community.nursingCare && "24/7 Nursing Staff",
    community.physicalTherapy && "Physical Therapy Services",
    community.dressingAssistance && "Dressing Assistance",
    community.bathingAssistance && "Bathing Assistance",
    community.socialActivities && "Social Activities"
  ].filter(Boolean).slice(0, 4); // Show up to 4 services like in screenshot

  // Determine if meal plans are available (for the blue tag)
  const hasMealPlans = community.diningServices || community.mealService || 
                      (community.amenities && community.amenities.includes('dining'));

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="md:w-64 h-48 md:h-auto relative">
            <img
              src={community.imageUrl || community.photos?.[0] || '/api/placeholder/300/200'}
              alt={community.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/api/placeholder/300/200';
              }}
            />
            
            {/* Meal Plans Badge (if available) */}
            {hasMealPlans && (
              <Badge 
                className="absolute top-3 left-3 bg-blue-600 hover:bg-blue-700 text-white border-0"
              >
                Meal Plans
              </Badge>
            )}
            
            {/* HUD Housing Badge */}
            {community.isHudProperty && (
              <Badge 
                className="absolute top-3 right-3 bg-green-600 hover:bg-green-700 text-white border-0"
              >
                HUD Housing
              </Badge>
            )}
          </div>

          {/* Content Section */}
          <div className="flex-1 p-6">
            <div className="flex flex-col md:flex-row justify-between h-full">
              {/* Left Content */}
              <div className="flex-1 pr-0 md:pr-6">
                {/* Community Name & Description */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {community.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                    {community.description || 
                     `${community.name} is a premier senior living community in ${community.city}, ${community.state}.`}
                  </p>
                </div>

                {/* Pricing Information */}
                <div className="mb-4 space-y-2">
                  {averagePrice && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Average Price:
                      </span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {formatPrice(averagePrice)}
                        <span className="text-sm font-normal text-gray-500"> / Month</span>
                      </span>
                    </div>
                  )}
                  
                  {startingPrice && startingPrice !== averagePrice && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Starting Price:
                      </span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {formatPrice(startingPrice)}
                        <span className="text-sm font-normal text-gray-500"> / Month</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Location & Availability */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>{community.city}, {community.state}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Availability:</span>
                    <span className={`font-semibold ${
                      community.availability === 'Available' || community.hasAvailability 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-orange-600 dark:text-orange-400'
                    }`}>
                      {community.availability || (community.hasAvailability ? 'Yes' : 'Contact for availability')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side - Services Checkmarks */}
              <div className="md:w-64 mt-4 md:mt-0">
                {keyServices.length > 0 && (
                  <div className="space-y-2">
                    {keyServices.map((service, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {service}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-4 space-y-2">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => window.open(`/communities/${community.slug || community.id}`, '_blank')}
                  >
                    View Details
                  </Button>
                  
                  {showCompareButton && onCompare && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => onCompare(community)}
                    >
                      Add to Compare
                    </Button>
                  )}
                  
                  {community.phone && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-blue-600 hover:text-blue-700"
                      onClick={() => window.location.href = `tel:${community.phone}`}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}