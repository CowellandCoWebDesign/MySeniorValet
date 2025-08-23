import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Building2, Phone, DollarSign, Star, Users, Shield, Clock } from "lucide-react";
import { Link } from "wouter";
import { SEO, generateBreadcrumbStructuredData, generateFAQStructuredData } from "@/components/SEO";
import { EnterpriseSearchBar } from "@/components/EnterpriseSearchBar";

// Location landing page for SEO - /senior-living/[state]/[city]
export default function LocationLanding() {
  const [, params] = useRoute("/senior-living/:state/:city?");
  const state = params?.state?.replace(/-/g, " ").toUpperCase();
  const city = params?.city?.replace(/-/g, " ");
  
  // Capitalize city name properly
  const cityName = city?.split(" ").map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(" ");
  
  const locationQuery = city ? `${cityName}, ${state}` : state;
  
  // Fetch communities for this location
  const { data: communities, isLoading } = useQuery({
    queryKey: ["/api/communities/search", { 
      state, 
      city: cityName,
      limit: 20 
    }],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (state) queryParams.append("state", state);
      if (cityName) queryParams.append("city", cityName);
      queryParams.append("limit", "20");
      
      const response = await fetch(`/api/communities/search?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch communities");
      return response.json();
    },
  });
  
  // Fetch location stats
  const { data: stats } = useQuery({
    queryKey: ["/api/locations/stats", { state, city: cityName }],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (state) queryParams.append("state", state);
      if (cityName) queryParams.append("city", cityName);
      
      const response = await fetch(`/api/locations/stats?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });
  
  // Generate SEO meta tags
  const pageTitle = cityName 
    ? `Senior Living in ${cityName}, ${state} - ${stats?.totalCommunities || "Find"} Communities`
    : `Senior Living in ${state} - ${stats?.totalCommunities || "Browse"} Communities`;
    
  const pageDescription = cityName
    ? `Compare ${stats?.totalCommunities || ""} senior living communities in ${cityName}, ${state}. Find assisted living, memory care, nursing homes with real pricing from $${stats?.minPrice || "2,000"} to $${stats?.maxPrice || "8,000"}/month. ${stats?.hudCount || 0} HUD affordable options available.`
    : `Browse ${stats?.totalCommunities || ""} senior living communities across ${state}. Compare assisted living, memory care, independent living facilities with transparent pricing. ${stats?.hudCount || 0} HUD affordable housing options.`;
  
  // Generate breadcrumbs
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Senior Living", url: "/map-search" },
  ];
  if (state) {
    breadcrumbs.push({ name: state, url: `/senior-living/${params?.state}` });
  }
  if (cityName) {
    breadcrumbs.push({ name: cityName, url: `/senior-living/${params?.state}/${params?.city}` });
  }
  
  // Generate FAQ data for SEO
  const faqs = [
    {
      question: `How much does senior living cost in ${locationQuery}?`,
      answer: `Senior living costs in ${locationQuery} range from $${stats?.minPrice || "2,000"} to $${stats?.maxPrice || "8,000"} per month, with an average of $${stats?.avgPrice || "4,500"}. HUD subsidized housing starts at $${stats?.hudMinPrice || "300"}/month for qualifying seniors.`
    },
    {
      question: `What types of senior care are available in ${locationQuery}?`,
      answer: `${locationQuery} offers ${stats?.careTypes?.join(", ") || "assisted living, memory care, independent living, nursing homes, and continuing care retirement communities (CCRC)"}. We have ${stats?.totalCommunities || "multiple"} verified communities to choose from.`
    },
    {
      question: `Are there affordable senior housing options in ${locationQuery}?`,
      answer: `Yes, ${locationQuery} has ${stats?.hudCount || "several"} HUD-subsidized senior housing communities with income-based rent. These properties offer safe, affordable housing for seniors with limited income.`
    },
    {
      question: `How do I find the best senior living community in ${locationQuery}?`,
      answer: `Use MySeniorValet's free search tools to compare all ${stats?.totalCommunities || ""} senior living options in ${locationQuery}. Filter by care type, price range, amenities, and read real family reviews. Schedule tours directly with communities that match your needs.`
    }
  ];
  
  return (
    <>
      <SEO
        title={pageTitle}
        description={pageDescription}
        keywords={`${locationQuery} senior living, ${locationQuery} assisted living, ${locationQuery} memory care, ${locationQuery} nursing homes, ${locationQuery} retirement homes, ${locationQuery} elder care, ${locationQuery} senior housing`}
        url={`/senior-living/${params?.state}${params?.city ? `/${params?.city}` : ""}`}
        type="website"
        location={{ city: cityName, state, country: "US" }}
        structuredData={[
          generateBreadcrumbStructuredData(breadcrumbs),
          generateFAQStructuredData(faqs)
        ]}
      />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            {/* Breadcrumbs */}
            <nav className="flex items-center space-x-2 text-sm mb-6 text-blue-100">
              {breadcrumbs.map((crumb, index) => (
                <span key={crumb.url} className="flex items-center">
                  {index > 0 && <span className="mx-2">›</span>}
                  <Link href={crumb.url}>
                    <a className="hover:text-white transition-colors">
                      {crumb.name}
                    </a>
                  </Link>
                </span>
              ))}
            </nav>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Senior Living in {locationQuery}
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              {stats?.totalCommunities || "Browse"} verified communities with transparent pricing
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-5 w-5" />
                  <span className="text-2xl font-bold">{stats?.totalCommunities || 0}</span>
                </div>
                <p className="text-sm text-blue-100">Communities</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5" />
                  <span className="text-2xl font-bold">${stats?.avgPrice || "4,500"}</span>
                </div>
                <p className="text-sm text-blue-100">Avg Monthly</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5" />
                  <span className="text-2xl font-bold">{stats?.hudCount || 0}</span>
                </div>
                <p className="text-sm text-blue-100">HUD Housing</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-5 w-5" />
                  <span className="text-2xl font-bold">{stats?.avgRating || "4.2"}</span>
                </div>
                <p className="text-sm text-blue-100">Avg Rating</p>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="bg-white rounded-lg p-2">
              <EnterpriseSearchBar 
                placeholder={`Search senior living in ${locationQuery}...`}
                defaultLocation={locationQuery || ""}
              />
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Communities List */}
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Top Communities in {locationQuery}
                </h2>
                <Link href={`/map-search?location=${encodeURIComponent(locationQuery)}`}>
                  <Button variant="outline">
                    <MapPin className="h-4 w-4 mr-2" />
                    View on Map
                  </Button>
                </Link>
              </div>
              
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="h-48" />
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {communities?.results?.map((community: any) => (
                    <Card key={community.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                              {community.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {community.city}, {community.state}
                            </p>
                          </div>
                          <div className="text-right">
                            {community.priceRange ? (
                              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                ${community.priceRange.min.toLocaleString()} - ${community.priceRange.max.toLocaleString()}
                              </p>
                            ) : community.rentPerMonth ? (
                              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                ${parseFloat(community.rentPerMonth).toLocaleString()}/mo
                              </p>
                            ) : (
                              <p className="text-sm text-gray-500">Contact for pricing</p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {community.careTypes?.map((type: string) => (
                            <span key={type} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                              {type}
                            </span>
                          ))}
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            {community.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {community.phone}
                              </span>
                            )}
                            {community.rating && (
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500" />
                                {community.rating}
                              </span>
                            )}
                          </div>
                          <Link href={`/community/${community.id}`}>
                            <Button size="sm">View Details</Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {(!communities?.results || communities.results.length === 0) && (
                    <Card>
                      <CardContent className="text-center py-12">
                        <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600 dark:text-gray-400">
                          No communities found in {locationQuery}
                        </p>
                        <Link href="/map-search">
                          <Button className="mt-4">Browse All Communities</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* About This Location */}
              <Card>
                <CardHeader>
                  <CardTitle>About {locationQuery}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {cityName 
                      ? `${cityName} is home to ${stats?.totalCommunities || "multiple"} senior living communities offering various levels of care.`
                      : `${state} has ${stats?.totalCommunities || "numerous"} senior living facilities across multiple cities.`
                    }
                  </p>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Care Types Available:</h4>
                    <div className="flex flex-wrap gap-2">
                      {(stats?.careTypes || ["Assisted Living", "Memory Care", "Independent Living"]).map((type: string) => (
                        <span key={type} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Price Range:</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ${stats?.minPrice || "2,000"} - ${stats?.maxPrice || "8,000"} per month
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Popular Cities (for state pages) */}
              {!cityName && stats?.popularCities && (
                <Card>
                  <CardHeader>
                    <CardTitle>Popular Cities in {state}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {stats.popularCities.map((city: any) => (
                        <Link key={city.name} href={`/senior-living/${params?.state}/${city.name.toLowerCase().replace(/ /g, "-")}`}>
                          <a className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors">
                            <span className="text-sm">{city.name}</span>
                            <span className="text-xs text-gray-500">{city.count} communities</span>
                          </a>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Nearby Cities (for city pages) */}
              {cityName && stats?.nearbyCities && (
                <Card>
                  <CardHeader>
                    <CardTitle>Nearby Cities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {stats.nearbyCities.map((city: any) => (
                        <Link key={city.name} href={`/senior-living/${params?.state}/${city.name.toLowerCase().replace(/ /g, "-")}`}>
                          <a className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors">
                            <span className="text-sm">{city.name}</span>
                            <span className="text-xs text-gray-500">{city.distance} miles</span>
                          </a>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Help Card */}
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-lg">Need Help Choosing?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">
                    Our senior care advisors can help you find the perfect community in {locationQuery}.
                  </p>
                  <Button className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Get Free Assistance
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}