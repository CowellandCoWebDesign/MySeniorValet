import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tag, Percent, Calendar, Clock, TrendingDown, AlertCircle, CheckCircle, Star, 
         MapPin, Wifi, Car, Utensils, Activity, Heart, Users, Shield } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FeaturedExcellenceCard } from "@/components/FeaturedExcellenceCard";

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
  const [fallbackDeals, setFallbackDeals] = useState<RedTagDeal[]>([]);
  
  // Fetch featured communities from API
  const { data: featuredCommunities, isLoading, error } = useQuery({
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
      location: "Vernon Hills, IL",
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
      availability: "Limited Availability",
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

  // Show loading skeleton while fetching
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <Skeleton className="h-8 w-96 mx-auto mb-3" />
          <Skeleton className="h-6 w-64 mx-auto" />
        </div>
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Star className="w-7 h-7 text-orange-600" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Featured Excellence Communities</h2>
        </div>
        <p className="text-lg text-gray-700 dark:text-gray-300 font-medium mb-4">
          Outstanding senior living communities showcasing excellence across five countries
        </p>
        
        {/* Launch Transparency Notice - Compact */}
        <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 border border-green-400 dark:border-green-700 rounded-lg max-w-4xl mx-auto">
          <div className="flex items-start gap-2">
            <Star className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0 animate-pulse" />
            <div className="text-left">
              <p className="text-sm text-green-800 dark:text-green-200 font-bold mb-1">
                🎉 Early Adopter Opportunity - First 8 PAID Communities Get FREE Featured Placement!
              </p>
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                Community partners: Be among the first 8 paying subscribers to MySeniorValet and receive FREE premium featured placement 
                in this high-visibility home page section! As an early adopter who commits with a paid subscription, your community will be 
                showcased to thousands of families actively searching for senior care. Contact us today to become a paid member and claim 
                your free featured spot - only 3 positions remaining!
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                The 5 communities currently showcased are hand-selected promotional listings representing excellence in senior living across 
                specialized care types including memory care, coastal luxury, international retirement, European excellence, and affordable NYC housing options.
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
                <p className="text-xs text-muted-foreground">Premium communities across 5 countries</p>
              </div>
            </div>
            <Badge className="bg-orange-600 text-white text-sm px-2 py-1">
              {redTagDeals.length} Featured
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Deal Cards with Photo Carousels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {redTagDeals.map((deal, index) => {
          // Transform deal data to community format for FeaturedExcellenceCard
          const community = {
            id: deal.id,
            name: deal.communityName,
            city: deal.location.split(',')[0]?.trim() || '',
            state: deal.location.split(',')[1]?.trim() || '',
            rating: deal.rating,
            amenities: deal.amenities,
            careTypes: deal.highlights,
            photos: apiDataMap.get(deal.id)?.community?.photos || [], // Use real photos from API
            occupancyRate: deal.availability === "Available Now" ? 75 : 
                          deal.availability === "Limited Spots" ? 85 : 
                          deal.availability === "Waitlist" ? 95 : 80
          };
          
          return (
            <FeaturedExcellenceCard
              key={deal.id}
              community={community}
              index={index}
              compact={true}
            />
          );
        })}
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