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
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Tag className="w-8 h-8 text-red-600" />
          <h2 className="text-3xl font-bold">Red Tag Deals & Special Offers</h2>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Exclusive discounts and move-in specials from top-rated communities
        </p>
      </div>

      {/* Active Deals Alert */}
      <Card className="border-red-200 dark:border-red-800 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-lg">Limited Time Offers Available!</p>
                <p className="text-sm text-muted-foreground">Save up to 20% on select communities</p>
              </div>
            </div>
            <Badge className="bg-red-600 text-white text-lg px-4 py-2">
              {redTagDeals.length} Active Deals
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Deal Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {redTagDeals.map((deal) => (
          <Card key={deal.id} className="relative overflow-hidden border-2 hover:border-red-300 dark:hover:border-red-700 transition-all">
            {/* Discount Badge */}
            <div className="absolute top-0 right-0 bg-red-600 text-white px-3 py-1 rounded-bl-lg">
              <span className="font-bold text-lg">{deal.discountPercent}% OFF</span>
            </div>

            <CardHeader>
              <CardTitle className="pr-20">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold">{deal.communityName}</h3>
                  <p className="text-sm text-muted-foreground">{deal.location}</p>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Pricing */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-red-600">
                    {formatCurrency(deal.discountedPrice)}
                  </span>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatCurrency(deal.originalPrice)}
                  </span>
                  <Badge variant="secondary" className="ml-auto">
                    {deal.dealType}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{getDaysRemaining(deal.expirationDate)} days remaining</span>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(deal.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="text-sm ml-1">({deal.rating})</span>
              </div>

              {/* Highlights */}
              <div className="space-y-1">
                {deal.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Link href="/communities">
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
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