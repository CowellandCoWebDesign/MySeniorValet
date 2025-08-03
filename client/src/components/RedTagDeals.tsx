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
      <div className="text-center mb-3">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Tag className="w-5 h-5 text-red-600" />
          <h2 className="text-xl font-bold">Red Tag Deals & Special Offers</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Exclusive discounts and move-in specials from top-rated communities
        </p>
        
        {/* Launch Transparency Disclaimer */}
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-700 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <p className="text-xs text-blue-800 dark:text-blue-200 font-medium mb-1">
                Recent Launch Notice
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
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

            <CardContent className="p-4">
              {/* Two-column layout: Contact info left, Pricing right */}
              <div className="flex justify-between items-start mb-3">
                {/* Left: Community info and contact */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1">{deal.communityName}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <MapPin className="w-3 h-3" />
                    <span>{deal.location}</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="text-blue-600 hover:underline cursor-pointer">
                      📞 (916) 555-{deal.id}123
                    </div>
                    <div className="text-blue-600 hover:underline cursor-pointer">
                      🌐 Visit Website
                    </div>
                  </div>
                </div>

                {/* Right: Pricing and rating */}
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1 justify-end">
                    <span className="text-xl font-bold text-red-600">
                      {formatCurrency(deal.discountedPrice)}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      {formatCurrency(deal.originalPrice)}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 justify-end mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(deal.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-xs ml-1">({deal.rating})</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                    <Clock className="w-3 h-3" />
                    <span>{getDaysRemaining(deal.expirationDate)} days left</span>
                  </div>
                </div>
              </div>

              {/* Two Column Layout for Amenities and Incentives */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {/* Top Amenities */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">Top Amenities</h4>
                  <div className="space-y-1">
                    {deal.amenities.slice(0, 4).map((amenity, index) => {
                      const getAmenityIcon = (amenity: string) => {
                        if (amenity.toLowerCase().includes('fitness') || amenity.toLowerCase().includes('activities')) return <Activity className="w-3 h-3 text-blue-600" />;
                        if (amenity.toLowerCase().includes('dining') || amenity.toLowerCase().includes('restaurant')) return <Utensils className="w-3 h-3 text-orange-600" />;
                        if (amenity.toLowerCase().includes('wifi') || amenity.toLowerCase().includes('internet')) return <Wifi className="w-3 h-3 text-green-600" />;
                        if (amenity.toLowerCase().includes('transport') || amenity.toLowerCase().includes('car')) return <Car className="w-3 h-3 text-purple-600" />;
                        if (amenity.toLowerCase().includes('care') || amenity.toLowerCase().includes('nursing')) return <Heart className="w-3 h-3 text-red-600" />;
                        if (amenity.toLowerCase().includes('security') || amenity.toLowerCase().includes('secured')) return <Shield className="w-3 h-3 text-indigo-600" />;
                        return <CheckCircle className="w-3 h-3 text-green-600" />;
                      };

                      return (
                        <div key={index} className="flex items-center gap-1.5 text-xs">
                          {getAmenityIcon(amenity)}
                          <span className="text-gray-700 dark:text-gray-300">{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Special Incentives */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">Special Incentives</h4>
                  <div className="space-y-1">
                    {deal.specialIncentives.map((incentive, index) => (
                      <div key={index} className="flex items-center gap-1.5 text-xs">
                        <Tag className="w-3 h-3 text-red-600 flex-shrink-0" />
                        <span className="text-red-700 dark:text-red-300 font-medium">{incentive}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Original Highlights - Condensed */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">Move-in Benefits</h4>
                <div className="flex flex-wrap gap-1">
                  {deal.highlights.map((highlight, index) => (
                    <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                      {highlight}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <Link href={`/red-tag-example/${deal.id === 1 ? 'sunrise-senior-living' : deal.id === 2 ? 'heritage-hills' : 'golden-years'}`}>
                <Button className="w-full h-9 text-sm bg-red-600 hover:bg-red-700 text-white">
                  <Tag className="w-4 h-4 mr-2" />
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