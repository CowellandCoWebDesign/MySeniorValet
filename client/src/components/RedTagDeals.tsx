import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tag, Percent, Calendar, Clock, TrendingDown, AlertCircle, CheckCircle, Star, 
         MapPin, Wifi, Car, Utensils, Activity, Heart, Users, Shield } from "lucide-react";
import { Link } from "wouter";

interface RedTagDeal {
  id: number;
  communityName: string;
  location: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  expirationDate: string;
  dealType: string;
  highlights: string[];
  rating: number;
  heroImage: string;
  availability: "Available Now" | "Move-in Ready" | "Limited Spots" | "Waitlist";
  amenities: string[];
  specialIncentives: string[];
}

export function RedTagDeals() {
  // Sample red tag deals data
  const redTagDeals: RedTagDeal[] = [
    {
      id: 1,
      communityName: "Sunrise Senior Living",
      location: "Sacramento, CA",
      originalPrice: 4500,
      discountedPrice: 3825,
      discountPercent: 15,
      expirationDate: "2025-09-01",
      dealType: "Move-In Special",
      highlights: ["No community fee", "First month 50% off", "Free moving assistance"],
      rating: 4.5,
      heroImage: "https://cdn.pixabay.com/photo/2016/11/18/17/20/living-room-1835923_1280.jpg",
      availability: "Available Now",
      amenities: ["Fitness Center", "Restaurant Dining", "Transportation", "WiFi"],
      specialIncentives: ["Waived community fee", "1/2 rent for 3 months", "Free cable package"]
    },
    {
      id: 2,
      communityName: "Heritage Hills Memory Care",
      location: "Roseville, CA",
      originalPrice: 6200,
      discountedPrice: 5270,
      discountPercent: 15,
      expirationDate: "2025-08-15",
      dealType: "Limited Time Offer",
      highlights: ["Waived deposit", "Complimentary care assessment", "Priority placement"],
      rating: 4.8,
      heroImage: "https://cdn.pixabay.com/photo/2016/11/30/08/46/living-room-1872192_1280.jpg",
      availability: "Move-in Ready",
      amenities: ["Memory Care", "24/7 Nursing", "Secured Environment", "Family Support"],
      specialIncentives: ["No security deposit", "Free care assessment", "30-day trial period"]
    },
    {
      id: 3,
      communityName: "Golden Years Assisted Living",
      location: "Folsom, CA",
      originalPrice: 3800,
      discountedPrice: 3040,
      discountPercent: 20,
      expirationDate: "2025-08-31",
      dealType: "Summer Special",
      highlights: ["Reduced rates", "Free cable & internet", "Meal plan upgrade"],
      rating: 4.3,
      heroImage: "https://cdn.pixabay.com/photo/2017/03/28/12/10/chairs-2181947_1280.jpg",
      availability: "Limited Spots",
      amenities: ["Pet-Friendly", "Pool & Spa", "Activities Program", "Housekeeping"],
      specialIncentives: ["20% off first 6 months", "Free pet fee", "Premium dining upgrade"]
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getDaysRemaining = (expirationDate: string) => {
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = Math.abs(expDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Tag className="w-7 h-7 text-red-600" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Red Tag Deals & Special Offers</h2>
        </div>
        <p className="text-lg text-gray-700 dark:text-gray-300 font-medium mb-4">
          Exclusive discounts and move-in specials from top-rated communities
        </p>
        
        {/* Launch Transparency Notice - Compact */}
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-700 rounded-lg max-w-4xl mx-auto">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">
                Recent Launch Notice
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                The three deal cards below (Sunrise Senior Living, Heritage Hills, Golden Years) are example demonstrations 
                showing how verified community specials will appear. Our 34,171 authentic communities and HUD pricing data 
                are 100% real - only these specific deal examples are demonstrations until communities claim their profiles 
                and submit verified specials.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Deals Alert - Compact */}
      <Card className="border-red-200 dark:border-red-800 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950">
        <CardContent className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
                <AlertCircle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Limited Time Offers!</p>
                <p className="text-xs text-muted-foreground">Save up to 20% on select communities</p>
              </div>
            </div>
            <Badge className="bg-red-600 text-white text-sm px-2 py-1">
              {redTagDeals.length} Deals
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Deal Cards with Expanded Information */}
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {redTagDeals.map((deal) => (
          <Card key={deal.id} className="relative overflow-hidden border hover:border-red-300 dark:hover:border-red-700 transition-all">
            {/* Hero Image */}
            <div className="relative h-40 overflow-hidden">
              <img 
                src={deal.heroImage} 
                alt={deal.communityName}
                className="w-full h-full object-cover"
              />
              {/* Red Tag Overlay */}
              <div className="absolute top-2 left-2">
                <Badge className="bg-red-600 text-white text-xs font-semibold px-2 py-1">
                  <Tag className="w-3 h-3 mr-1" />
                  RED TAG
                </Badge>
              </div>
              {/* Discount Badge */}
              <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-0.5 rounded text-xs font-bold">
                {deal.discountPercent}% OFF
              </div>
              {/* Availability Badge */}
              <div className="absolute bottom-2 right-2">
                <Badge 
                  className={`text-xs font-medium px-2 py-1 ${
                    deal.availability === "Available Now" 
                      ? "bg-green-600 text-white" 
                      : deal.availability === "Move-in Ready"
                      ? "bg-blue-600 text-white"
                      : deal.availability === "Limited Spots"
                      ? "bg-orange-600 text-white"
                      : "bg-gray-600 text-white"
                  }`}
                >
                  {deal.availability}
                </Badge>
              </div>
            </div>

            <CardContent className="p-3">
              {/* Compact header with all key info */}
              <div className="flex justify-between items-start mb-3">
                {/* Left: Community info and contact */}
                <div className="flex-1 pr-3">
                  <h3 className="text-base font-bold mb-1 leading-tight">{deal.communityName}</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <MapPin className="w-3 h-3" />
                    <span>{deal.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-blue-600 hover:underline cursor-pointer">📞 Call</span>
                    <span className="text-blue-600 hover:underline cursor-pointer">🌐 Web</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-orange-500" />
                      <span className="text-gray-600">{getDaysRemaining(deal.expirationDate)}d</span>
                    </div>
                  </div>
                </div>

                {/* Right: Pricing and rating aligned */}
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-lg font-bold text-red-600">
                      {formatCurrency(deal.discountedPrice)}
                    </span>
                    <span className="text-xs text-gray-500 line-through">
                      {formatCurrency(deal.originalPrice)}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 justify-end">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-2.5 h-2.5 ${
                          i < Math.floor(deal.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-xs ml-1">({deal.rating})</span>
                  </div>
                </div>
              </div>

              {/* Compact Features Grid */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {/* Amenities */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-2">
                  <h4 className="text-xs font-semibold mb-1.5 text-gray-900 dark:text-gray-100">Amenities</h4>
                  <div className="space-y-0.5">
                    {deal.amenities.slice(0, 3).map((amenity, index) => {
                      const getAmenityIcon = (amenity: string) => {
                        if (amenity.toLowerCase().includes('fitness')) return <Activity className="w-2.5 h-2.5 text-blue-600" />;
                        if (amenity.toLowerCase().includes('dining')) return <Utensils className="w-2.5 h-2.5 text-orange-600" />;
                        if (amenity.toLowerCase().includes('wifi')) return <Wifi className="w-2.5 h-2.5 text-green-600" />;
                        if (amenity.toLowerCase().includes('transport')) return <Car className="w-2.5 h-2.5 text-purple-600" />;
                        return <CheckCircle className="w-2.5 h-2.5 text-green-600" />;
                      };

                      return (
                        <div key={index} className="flex items-center gap-1 text-xs">
                          {getAmenityIcon(amenity)}
                          <span className="text-gray-700 dark:text-gray-300 truncate">{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Incentives */}
                <div className="bg-red-50 dark:bg-red-950/30 rounded-md p-2">
                  <h4 className="text-xs font-semibold mb-1.5 text-red-800 dark:text-red-200">Specials</h4>
                  <div className="space-y-0.5">
                    {deal.specialIncentives.slice(0, 3).map((incentive, index) => (
                      <div key={index} className="flex items-center gap-1 text-xs">
                        <Tag className="w-2.5 h-2.5 text-red-600 flex-shrink-0" />
                        <span className="text-red-700 dark:text-red-300 font-medium truncate">{incentive}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Benefits as horizontal badges */}
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {deal.highlights.slice(0, 4).map((highlight, index) => (
                    <Badge key={index} variant="secondary" className="text-xs px-1.5 py-0.5">
                      {highlight}
                    </Badge>
                  ))}
                  {deal.highlights.length > 4 && (
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                      +{deal.highlights.length - 4}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Compact CTA Button */}
              <Link href={`/red-tag-example/${deal.id === 1 ? 'sunrise-senior-living' : deal.id === 2 ? 'heritage-hills' : 'golden-years'}`}>
                <Button className="w-full h-8 text-xs bg-red-600 hover:bg-red-700 text-white">
                  <Tag className="w-3 h-3 mr-1.5" />
                  Claim This Deal
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Savings Info */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-blue-600" />
            How to Maximize Your Savings
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700 rounded-lg">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              <strong>Authentic Tips:</strong> The savings strategies below are based on real industry data and proven negotiation techniques used by senior living experts.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">Best Times to Move</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Percent className="w-4 h-4 text-green-600 mt-0.5" />
                  <span><strong>Off-season moves (Nov-Feb):</strong> Up to 25% savings</span>
                </li>
                <li className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-blue-600 mt-0.5" />
                  <span><strong>End of month specials:</strong> Many communities offer deals</span>
                </li>
                <li className="flex items-start gap-2">
                  <Tag className="w-4 h-4 text-purple-600 mt-0.5" />
                  <span><strong>Holiday promotions:</strong> Special rates during holidays</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Negotiation Tips</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Ask about unpublished specials and discounts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Compare multiple communities for leverage</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Inquire about waived fees and deposits</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}