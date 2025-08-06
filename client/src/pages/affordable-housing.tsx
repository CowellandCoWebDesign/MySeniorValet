import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Building2, Phone, MapPin, Home, Users, DollarSign, ArrowLeft, Info, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { NavigationHeader } from "@/components/NavigationHeader";

export default function AffordableHousing() {
  const [selectedState, setSelectedState] = useState<string>("all");

  // Fetch affordable housing facilities
  const { data: facilities, isLoading, error } = useQuery({
    queryKey: ["/api/communities/search", "affordable-housing", selectedState],
    queryFn: async () => {
      let url = "/api/communities/search?careType=Affordable%20Housing&limit=10000";
      if (selectedState !== "all") {
        url += `&location=${selectedState}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch affordable housing facilities");
      return response.json();
    },
  });

  const states = ["all", "CA", "TX", "HI"];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-300 mt-4">Loading affordable housing facilities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading</h3>
            <p className="text-red-600 mb-4">{error.message}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationHeader 
        title="Affordable Housing" 
        subtitle="HUD Section 202 and affordable senior housing options"
      />
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">HUD Affordable Housing</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">Section 202 & 811 Government-Subsidized Housing</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>HUD Section 202</strong> provides affordable housing for elderly residents (62+) while 
            <strong> Section 811</strong> serves adults with disabilities. These facilities offer rent subsidies 
            based on income, typically charging 30% of adjusted monthly income.
          </AlertDescription>
        </Alert>
      </div>

      {/* State Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex gap-2 items-center">
          <span className="text-gray-700 dark:text-gray-300 font-medium">Filter by state:</span>
          {states.map((state) => (
            <Button
              key={state}
              variant={selectedState === state ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedState(state)}
            >
              {state === "all" ? "All States" : state}
            </Button>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Total Facilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{facilities?.length || 0}</div>
              <p className="text-sm text-gray-600 mt-1">HUD-subsidized communities</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Total Units</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {facilities?.reduce((sum: number, f: any) => sum + (f.totalUnits || 0), 0).toLocaleString() || 0}
              </div>
              <p className="text-sm text-gray-600 mt-1">Affordable housing units</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Programs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Badge variant="secondary">Section 202</Badge>
                <Badge variant="secondary">Section 811</Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1">Elderly & disabled housing</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {selectedState === "all" ? "All Facilities" : `${selectedState} Facilities`} 
          ({facilities?.length || 0})
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities?.map((facility: any) => (
            <Card key={facility.id} className="group bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-lg rounded-xl overflow-hidden hover:shadow-2xl hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200">
              <CardHeader className="p-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">{facility.name}</CardTitle>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span>{facility.city}, {facility.state}</span>
                    </div>
                  </div>
                  <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    HUD {facility.veteranPrograms?.includes("Section 202") ? "Elderly" : "Disabled"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-3">
                  {/* Key Information Row */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      {/* HUD Verified Pricing Display - Following Golden Data Rule */}
                      <div className="flex items-center font-semibold text-gray-900 dark:text-white">
                        <DollarSign className="h-4 w-4 mr-1 text-green-600 dark:text-green-400" />
                        <span className="text-base">30% of income</span>
                      </div>
                      
                      {/* Units Badge */}
                      {facility.totalUnits && (
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          <Home className="h-3 w-3 mr-1" />
                          {facility.totalUnits} units
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Address */}
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">Address:</div>
                    <div>{facility.address}</div>
                    {facility.zipCode && <div>{facility.city}, {facility.state} {facility.zipCode}</div>}
                  </div>
                  
                  {/* Phone */}
                  {facility.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3 w-3 text-gray-500" />
                      <a href={`tel:${facility.phone}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        {facility.phone}
                      </a>
                    </div>
                  )}
                  
                  {/* Eligibility */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Users className="h-3 w-3 text-gray-500" />
                    <span>{facility.eligibilityRequirements?.join(", ") || "Income qualified"}</span>
                  </div>
                  
                  {/* Action Button */}
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <Link href={`/community/${facility.id}`}>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {facilities?.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No affordable housing facilities found for the selected criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}