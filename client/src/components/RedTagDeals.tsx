import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tag, Percent, Calendar, Clock, TrendingDown, AlertCircle, CheckCircle, Star } from "lucide-react";
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
      rating: 4.5
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
      rating: 4.8
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
      rating: 4.3
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
                The deals shown are representative examples of MySeniorValet's transparency capabilities. 
                Since we've just launched, these are mock data demonstrations as we haven't yet received 
                verified specials from claimed communities. Check back soon for authentic red tag deals 
                as we grow in community transparency!
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

      {/* Deal Cards Grid - Compact */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {redTagDeals.map((deal) => (
          <Card key={deal.id} className="relative overflow-hidden border hover:border-red-300 dark:hover:border-red-700 transition-all">
            {/* Discount Badge */}
            <div className="absolute top-0 right-0 bg-red-600 text-white px-2 py-0.5 rounded-bl text-xs font-bold">
              {deal.discountPercent}% OFF
            </div>

            <CardHeader className="p-3">
              <CardTitle className="pr-16">
                <div>
                  <h3 className="text-sm font-bold">{deal.communityName}</h3>
                  <p className="text-xs text-muted-foreground">{deal.location}</p>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-3 pt-0 space-y-2">
              {/* Pricing */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-red-600">
                    {formatCurrency(deal.discountedPrice)}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    {formatCurrency(deal.originalPrice)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{getDaysRemaining(deal.expirationDate)} days left</span>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-0.5">
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

              {/* Highlights */}
              <div className="space-y-0.5">
                {deal.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center gap-1 text-xs">
                    <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Link href="/communities">
                <Button className="w-full h-8 text-sm bg-red-600 hover:bg-red-700 text-white">
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