import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag, Percent, Calendar, TrendingDown, CheckCircle, Star, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { CommunityGrid } from "@/components/CommunityGrid";

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

interface RedTagDealsProps {
  communityCount?: string;
  hideHeader?: boolean;
}

export function RedTagDeals({ communityCount, hideHeader = false }: RedTagDealsProps) {
  const [fallbackDeals, setFallbackDeals] = useState<RedTagDeal[]>([]);
  
  // Fetch featured communities from API
  const { data: featuredCommunities, isLoading } = useQuery({
    queryKey: ['/api/featured-communities'],
    retry: 1,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
  
  // Set up fallback deals on mount
  useEffect(() => {
    // Fallback featured communities in case API returns nothing
    const defaultDeals: RedTagDeal[] = [
    {
      id: 51463,
      communityName: "Atria La Jolla",
      location: "San Diego, CA",
      dealType: "Premium Coastal Living",
      highlights: ["Ocean views", "Award-winning dining", "Wellness-focused care"],
      rating: 4.7,
      heroImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      availability: "Available Now",
      amenities: ["Ocean Views", "Gourmet Dining", "Wellness Center", "Concierge Service"],
      whyFeatured: ["Part of the prestigious Atria network", "Stunning La Jolla location", "Excellence in senior care"]
    },
    {
      id: 70616,
      communityName: "Willow Springs Alzheimer's Special Care Center",
      location: "Redding, CA",
      dealType: "Memory Care Excellence",
      highlights: ["Specialized Alzheimer's care", "Award-winning programs", "Secure environment"],
      rating: 4.5,
      heroImage: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
      availability: "Available Now",
      amenities: ["Memory Care", "Secure Units", "Specialized Activities", "24/7 Nursing"],
      whyFeatured: ["Leading memory care facility", "Specialized Alzheimer's programs", "Compassionate expert care"]
    },
    {
      id: 72147,
      communityName: "Verdeza Retirement Community",
      location: "Escazú, Costa Rica",
      dealType: "Tropical Paradise Retirement",
      highlights: ["Year-round perfect weather", "International expat community", "Affordable luxury"],
      rating: 4.8,
      heroImage: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80",
      availability: "Limited Spots",
      amenities: ["Mountain Views", "Private Healthcare", "Spa Services", "Organic Gardens"],
      whyFeatured: ["Costa Rica's premier retirement destination", "Exceptional value in paradise", "English-speaking staff & residents"]
    },
    {
      id: 76138,
      communityName: "DomusVi La Salut Josep Servat",
      location: "Barcelona, Spain",
      dealType: "Mediterranean Excellence",
      highlights: ["Historic Barcelona location", "European healthcare standards", "Cultural enrichment programs"],
      rating: 4.7,
      heroImage: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80",
      availability: "Available Now",
      amenities: ["Mediterranean Views", "Spanish Healthcare", "Cultural Activities", "Garden Terrace"],
      whyFeatured: ["Premier European senior living", "Heart of Barcelona location", "Exceptional Mediterranean lifestyle"]
    },
    {
      id: 51762,
      communityName: "The Ivy At Hawaii Kai",
      location: "Honolulu, HI",
      dealType: "Tropical Paradise Living",
      highlights: ["Ocean views in Hawaii", "Premium island lifestyle", "Resort-style amenities"],
      rating: 4.8,
      heroImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
      availability: "Limited Spots",
      amenities: ["Ocean Views", "Tropical Gardens", "Fine Dining", "Island Activities"],
      whyFeatured: ["Hawaii's premier senior community", "Paradise island living", "Exceptional tropical lifestyle"]
    },
    {
      id: 76174,
      communityName: "Arbor Terrace of East Cobb",
      location: "Marietta, GA",
      dealType: "Premier Assisted Living",
      highlights: ["Luxury assisted living", "Award-winning programs", "Beautiful East Cobb location"],
      rating: 4.2,
      heroImage: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80",
      availability: "Available Now",
      amenities: ["Elegant Dining", "Memory Care", "Wellness Programs", "Social Activities"],
      whyFeatured: ["Part of Arbor Company network", "Exceptional care in East Cobb", "Beautiful community with comprehensive services"]
    }
  ];
    setFallbackDeals(defaultDeals);
  }, []);
  
  // Merge API data with our curated list to ensure we show exactly these 6 communities
  const desiredCommunityIds = [51463, 70616, 72147, 76138, 51762, 76174];
  
  // Create a map of API data by ID for quick lookup
  const apiDataMap = new Map();
  if (Array.isArray(featuredCommunities)) {
    featuredCommunities.forEach((featured: any) => {
      const id = featured.community?.id || featured.communityId;
      if (id) apiDataMap.set(id, featured);
    });
  }
  
  // Build the final list using API data when available, fallback data otherwise
  const redTagDeals: RedTagDeal[] = fallbackDeals.filter(deal => 
    desiredCommunityIds.includes(deal.id)
  ).map(deal => {
    const apiData = apiDataMap.get(deal.id);
    if (apiData && apiData.community) {
      // Use API data for dynamic updates while preserving our curated info
      return {
        ...deal,
        communityName: apiData.community.name || deal.communityName,
        location: apiData.community ? `${apiData.community.city}, ${apiData.community.state}` : deal.location,
        rating: apiData.community.rating || deal.rating,
        heroImage: apiData.community.photos?.[0] || deal.heroImage,
      };
    }
    return deal;
  });

  // Transform curated deals into the canonical CommunityCard payload so the
  // grid matches the directory's "Recently Added" reference look exactly.
  const featuredCommunityCards = redTagDeals.map((deal) => {
    const apiData = apiDataMap.get(deal.id);
    const apiCommunity = apiData?.community;
    return {
      id: deal.id,
      name: deal.communityName,
      city: deal.location.split(',')[0]?.trim() || '',
      state: deal.location.split(',')[1]?.trim() || '',
      address: apiCommunity?.address || apiCommunity?.streetAddress,
      phone: apiCommunity?.phone || apiCommunity?.phoneNumber,
      website: apiCommunity?.website || apiCommunity?.url,
      rating: deal.rating,
      amenities: deal.amenities,
      careTypes: deal.highlights,
      photos: apiCommunity?.photos || [],
    };
  });
  
  return (
    <div className="space-y-4">
      {/* Section Title - Always visible */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Star className="w-7 h-7 text-orange-500" />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Featured Excellence Communities
          </h2>
          <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1 text-sm font-bold">
            Premium
          </Badge>
        </div>
        <p className="text-base text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Hand-picked exceptional senior living communities across 5 countries
        </p>
      </div>

      {/* Featured Communities Alert - Extra details (hidden when hideHeader is true) */}
      {!hideHeader && (
        <Card className="border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950">
          <CardContent className="py-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-full">
                  <Star className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Excellence Showcase</p>
                  <p className="text-xs text-muted-foreground">Premium communities across 5 countries</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {communityCount && (
                  <div className="flex items-center gap-1.5 bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded-full">
                    <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-sm font-bold text-green-700 dark:text-green-400">{communityCount}</span>
                    <span className="text-xs text-green-600 dark:text-green-500 hidden sm:inline">Total</span>
                  </div>
                )}
                <Badge className="bg-orange-600 text-white text-sm px-2 py-1">
                  {redTagDeals.length} Featured
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Featured communities — unified grid (matches the directory reference) */}
      <CommunityGrid
        communities={featuredCommunityCards}
        isLoading={isLoading}
        skeletonCount={8}
        emptyMessage="No featured communities available right now."
      />

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