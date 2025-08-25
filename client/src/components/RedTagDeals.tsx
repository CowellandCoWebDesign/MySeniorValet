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
  dealType: string;
  highlights: string[];
  rating: number;
  heroImage: string;
  availability: "Available Now" | "Move-in Ready" | "Limited Spots" | "Waitlist";
  amenities: string[];
  whyFeatured: string[];
}

export function RedTagDeals() {
  // Featured exceptional communities
  const redTagDeals: RedTagDeal[] = [
    {
      id: 51463,
      communityName: "Atria La Jolla",
      location: "San Diego, CA",
      dealType: "Premium Coastal Living",
      highlights: ["Ocean views", "Award-winning dining", "Wellness-focused care"],
      rating: 4.7,
      heroImage: "https://cdn.pixabay.com/photo/2016/11/18/17/20/living-room-1835923_1280.jpg",
      availability: "Available Now",
      amenities: ["Ocean Views", "Gourmet Dining", "Wellness Center", "Concierge Service"],
      whyFeatured: ["Part of the prestigious Atria network", "Stunning La Jolla location", "Excellence in senior care"]
    },
    {
      id: 54540,
      communityName: "Highland Village",
      location: "Midland, Ontario, Canada",
      dealType: "Canadian Healthcare Excellence",
      highlights: ["Provincial healthcare integration", "Lakefront setting", "Bilingual services"],
      rating: 4.6,
      heroImage: "https://cdn.pixabay.com/photo/2016/11/30/08/46/living-room-1872192_1280.jpg",
      availability: "Move-in Ready",
      amenities: ["Lakefront Views", "Canadian Healthcare", "Bilingual Staff", "Indoor Pool"],
      whyFeatured: ["Beautiful Ontario lakefront property", "Full Canadian healthcare benefits", "Strong community reputation"]
    },
    {
      id: 72147,
      communityName: "Verdeza Retirement Community",
      location: "Escazú, Costa Rica",
      dealType: "Tropical Paradise Retirement",
      highlights: ["Year-round perfect weather", "International expat community", "Affordable luxury"],
      rating: 4.8,
      heroImage: "https://cdn.pixabay.com/photo/2017/03/28/12/10/chairs-2181947_1280.jpg",
      availability: "Limited Spots",
      amenities: ["Mountain Views", "Private Healthcare", "Spa Services", "Organic Gardens"],
      whyFeatured: ["Costa Rica's premier retirement destination", "Exceptional value in paradise", "English-speaking staff & residents"]
    }
  ];

  const getAmenityIcon = (amenity: string) => {
    if (amenity.toLowerCase().includes('ocean') || amenity.toLowerCase().includes('lake') || amenity.toLowerCase().includes('mountain')) 
      return <MapPin className="w-2.5 h-2.5 text-blue-600" />;
    if (amenity.toLowerCase().includes('dining') || amenity.toLowerCase().includes('gourmet')) 
      return <Utensils className="w-2.5 h-2.5 text-orange-600" />;
    if (amenity.toLowerCase().includes('wellness') || amenity.toLowerCase().includes('health') || amenity.toLowerCase().includes('spa')) 
      return <Heart className="w-2.5 h-2.5 text-red-600" />;
    if (amenity.toLowerCase().includes('pool') || amenity.toLowerCase().includes('fitness')) 
      return <Activity className="w-2.5 h-2.5 text-green-600" />;
    if (amenity.toLowerCase().includes('concierge') || amenity.toLowerCase().includes('staff')) 
      return <Users className="w-2.5 h-2.5 text-purple-600" />;
    return <CheckCircle className="w-2.5 h-2.5 text-green-600" />;
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Star className="w-7 h-7 text-orange-600" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Featured Excellence Communities</h2>
        </div>
        <p className="text-lg text-gray-700 dark:text-gray-300 font-medium mb-4">
          Outstanding senior living communities showcasing excellence across three countries
        </p>
        
        {/* Launch Transparency Notice - Compact */}
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-700 rounded-lg max-w-4xl mx-auto">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">
                Excellence Spotlight
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                These three exceptional communities from our database of 35,264+ authentic locations represent the best in senior living 
                across North America and internationally. While many communities offer move-in specials and promotions, these must be 
                verified directly with each community. Contact them to discover their current availability and any special offers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Communities Alert - Compact */}
      <Card className="border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950">
        <CardContent className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-full">
                <Star className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Excellence Showcase</p>
                <p className="text-xs text-muted-foreground">Premium communities across 3 countries</p>
              </div>
            </div>
            <Badge className="bg-orange-600 text-white text-sm px-2 py-1">
              {redTagDeals.length} Featured
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
              {/* Excellence Badge */}
              <div className="absolute top-2 left-2">
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold px-2 py-1">
                  <Star className="w-3 h-3 mr-1" />
                  FEATURED
                </Badge>
              </div>
              {/* Deal Type Badge */}
              <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 py-0.5 rounded text-xs font-bold">
                {deal.dealType}
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
                    <span className="text-blue-600 hover:underline cursor-pointer">🌐 Website</span>
                    <span className="text-green-600 hover:underline cursor-pointer">📅 Tour</span>
                  </div>
                </div>

                {/* Right: Rating */}
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-0.5 justify-end mb-1">
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
                    {deal.amenities.slice(0, 3).map((amenity, index) => (
                      <div key={index} className="flex items-center gap-1 text-xs">
                        {getAmenityIcon(amenity)}
                        <span className="text-gray-700 dark:text-gray-300 truncate">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Why Featured */}
                <div className="bg-amber-50 dark:bg-amber-950/30 rounded-md p-2">
                  <h4 className="text-xs font-semibold mb-1.5 text-amber-800 dark:text-amber-200">Why Featured</h4>
                  <div className="space-y-0.5">
                    {deal.whyFeatured.slice(0, 3).map((reason, index) => (
                      <div key={index} className="flex items-center gap-1 text-xs">
                        <Star className="w-2.5 h-2.5 text-amber-600 flex-shrink-0" />
                        <span className="text-amber-700 dark:text-amber-300 font-medium truncate">{reason}</span>
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
              <Link href={`/community/${deal.id}`}>
                <Button className="w-full h-8 text-xs bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white">
                  <Star className="w-3 h-3 mr-1.5" />
                  View Community Details
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