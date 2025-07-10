import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { 
  Home, Phone, Globe, MapPin, Star, Shield, Users, 
  CheckCircle, FileText, Heart, ExternalLink, ChevronRight,
  Building, HandHeart, Briefcase
} from "lucide-react";

export default function VeteransHousing() {
  const { data: hudVashFacilities, isLoading } = useQuery({
    queryKey: ["/api/communities/hud-vash"],
    queryFn: async () => {
      const response = await fetch("/api/communities/search?limit=50&careTypes=Veterans+Housing");
      if (!response.ok) throw new Error("Failed to fetch HUD-VASH facilities");
      return response.json();
    },
    retry: false,
  });

  const facilities = Array.isArray(hudVashFacilities) ? hudVashFacilities : [];

  // Group facilities by state
  const facilitiesByState = facilities.reduce((acc, facility) => {
    const state = facility.state;
    if (!acc[state]) acc[state] = [];
    acc[state].push(facility);
    return acc;
  }, {} as Record<string, typeof facilities>);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading veterans housing options...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-6">
            <Shield className="w-12 h-12" />
            <h1 className="text-4xl font-bold">HUD-VASH Veterans Housing</h1>
          </div>
          <p className="text-xl mb-8 max-w-3xl">
            The HUD-VASH program combines rental assistance from HUD with case management and clinical services 
            provided by the VA. Find supportive housing options for veterans in California, Texas, and Hawaii.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur rounded-lg p-6">
              <Building className="w-8 h-8 mb-3" />
              <h3 className="font-semibold text-lg mb-2">Rental Assistance</h3>
              <p className="text-white/90 text-sm">
                Housing Choice Vouchers help veterans afford safe, permanent housing
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-6">
              <HandHeart className="w-8 h-8 mb-3" />
              <h3 className="font-semibold text-lg mb-2">VA Support Services</h3>
              <p className="text-white/90 text-sm">
                Case management and healthcare services from VA medical centers
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-6">
              <Users className="w-8 h-8 mb-3" />
              <h3 className="font-semibold text-lg mb-2">Community Integration</h3>
              <p className="text-white/90 text-sm">
                Support for veterans transitioning to permanent housing
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Eligibility Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-4">Eligibility Requirements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Basic Requirements
              </h3>
              <ul className="space-y-2 text-gray-700 ml-7">
                <li>• Eligible for VA healthcare services</li>
                <li>• Meet HUD's definition of homelessness</li>
                <li>• Agree to participate in case management</li>
                <li>• Income below 50% of area median income</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                How to Apply
              </h3>
              <ul className="space-y-2 text-gray-700 ml-7">
                <li>• Contact your local VA medical center</li>
                <li>• Work with a VA case manager</li>
                <li>• Complete HUD-VASH application</li>
                <li>• Receive referral to local PHA</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Facilities by State */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">HUD-VASH Housing Authorities by State</h2>
        
        {Object.entries(facilitiesByState).map(([state, stateFacilities]) => (
          <div key={state} className="mb-12">
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
              <MapPin className="w-6 h-6 text-blue-600" />
              {state === 'CA' ? 'California' : state === 'TX' ? 'Texas' : 'Hawaii'}
              <Badge variant="secondary" className="ml-2">
                {stateFacilities.length} Locations
              </Badge>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stateFacilities.map((facility) => (
                <Card key={facility.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-start justify-between">
                      <span>{facility.name}</span>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {facility.city}, {facility.state} {facility.zipCode}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-gray-700">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <a href={`tel:${facility.phone}`} className="hover:text-blue-600">
                          {facility.phone}
                        </a>
                      </div>
                      
                      {facility.website && (
                        <div className="flex items-center gap-3 text-gray-700">
                          <Globe className="w-4 h-4 text-gray-500" />
                          <a 
                            href={facility.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-blue-600 flex items-center gap-1"
                          >
                            Visit Website
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                      
                      {facility.hudProperties && (
                        <div className="pt-3 border-t">
                          <div className="text-sm text-gray-600 space-y-2">
                            {facility.hudProperties.vaOfficeName && (
                              <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-blue-600" />
                                <span>VA Partner: {facility.hudProperties.vaOfficeName}</span>
                              </div>
                            )}
                            {facility.hudProperties.vaOfficeDistance && (
                              <div className="ml-6 text-xs text-gray-500">
                                {facility.hudProperties.vaOfficeDistance} miles to VA facility
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="pt-3 flex gap-2">
                        <Link href={`/community/${facility.id}`}>
                          <Button size="sm" variant="outline" className="w-full">
                            View Details
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Resources Section */}
      <div className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Additional Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">VA Homeless Programs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Learn about all VA programs for homeless veterans
                </p>
                <a 
                  href="https://www.va.gov/homeless/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  Visit VA.gov
                  <ExternalLink className="w-3 h-3" />
                </a>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">National Call Center</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  24/7 support for homeless veterans
                </p>
                <a 
                  href="tel:1-877-424-3838"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Phone className="w-4 h-4" />
                  1-877-4AID-VET
                </a>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">HUD Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Information about Housing Choice Vouchers
                </p>
                <a 
                  href="https://www.hud.gov/program_offices/public_indian_housing/programs/hcv/vash"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  Learn More
                  <ExternalLink className="w-3 h-3" />
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}