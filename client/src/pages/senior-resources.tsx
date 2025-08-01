import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Phone, Globe, Clock, Users, Package, Home, Heart, Utensils, Search, ChevronRight, ExternalLink, Building } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SeniorResources() {
  const [selectedState, setSelectedState] = useState("California");
  const [selectedCounty, setSelectedCounty] = useState("Los Angeles");
  const [activeTab, setActiveTab] = useState<"food-banks" | "ihss" | "sls">("food-banks");

  // Fetch food banks
  const { data: foodBanksData, isLoading: foodBanksLoading } = useQuery({
    queryKey: ["/api/senior-resources/food-banks", selectedState, selectedCounty],
    queryFn: async () => {
      const response = await fetch(`/api/senior-resources/food-banks?state=${selectedState}&county=${selectedCounty}`);
      return response.json();
    }
  });

  // Fetch IHSS resources
  const { data: ihssData, isLoading: ihssLoading } = useQuery({
    queryKey: ["/api/senior-resources/ihss", selectedState, selectedCounty],
    queryFn: async () => {
      const response = await fetch(`/api/senior-resources/ihss?state=${selectedState}&county=${selectedCounty}`);
      return response.json();
    }
  });

  // Fetch SLS resources
  const { data: slsData, isLoading: slsLoading } = useQuery({
    queryKey: ["/api/senior-resources/sls", selectedState, selectedCounty],
    queryFn: async () => {
      const response = await fetch(`/api/senior-resources/sls?state=${selectedState}&county=${selectedCounty}`);
      return response.json();
    }
  });

  const counties = {
    "California": ["Los Angeles", "Sacramento", "San Diego", "Orange", "San Francisco", "Alameda"],
    "Florida": ["Miami-Dade", "Broward", "Palm Beach", "Hillsborough", "Orange"],
    "Texas": ["Harris", "Dallas", "Tarrant", "Bexar", "Travis"],
    "Arizona": ["Maricopa", "Pima", "Pinal"],
    "Nevada": ["Clark", "Washoe"]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold gradient-text">Senior Resources & Support</h1>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Location Selector */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Select Your Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">State</label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(counties).map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">County</label>
                <Select value={selectedCounty} onValueChange={setSelectedCounty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {counties[selectedState as keyof typeof counties]?.map(county => (
                      <SelectItem key={county} value={county}>{county}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resource Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button 
            onClick={() => setActiveTab("food-banks")}
            variant={activeTab === "food-banks" ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            <Utensils className="h-4 w-4" />
            Food Banks & Nutrition
          </Button>
          <Button 
            onClick={() => setActiveTab("ihss")}
            variant={activeTab === "ihss" ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            IHSS (In-Home Support)
          </Button>
          <Button 
            onClick={() => setActiveTab("sls")}
            variant={activeTab === "sls" ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            SLS (Supported Living)
          </Button>
        </div>

        {/* Food Banks Tab */}
        {activeTab === "food-banks" && (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Utensils className="h-6 w-6 text-green-600" />
                Food Banks & Senior Nutrition Programs
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Find food assistance programs specifically designed for seniors in your area
              </p>
            </div>

            {foodBanksLoading ? (
              <div className="text-center py-8">Loading food bank resources...</div>
            ) : (
              <>
                {/* Food Banks List */}
                <div className="grid gap-4">
                  {foodBanksData?.foodBanks?.map((foodBank: any) => (
                    <Card key={foodBank.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl">{foodBank.name}</CardTitle>
                            <Badge variant="secondary" className="mt-2">{foodBank.type}</Badge>
                          </div>
                          {foodBank.seniorPrograms?.homeDelivery && (
                            <Badge className="bg-green-100 text-green-800">Home Delivery Available</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                              <div>
                                <p className="text-sm">{foodBank.address}</p>
                                <p className="text-sm">{foodBank.city}, {foodBank.state} {foodBank.zipCode}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <a href={`tel:${foodBank.phone}`} className="text-sm text-blue-600 hover:underline">
                                {foodBank.phone}
                              </a>
                            </div>
                            {foodBank.website && (
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-gray-500" />
                                <a href={foodBank.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                                  Visit Website
                                </a>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <p className="text-sm">{foodBank.hours}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Services Offered:</h4>
                            <div className="flex flex-wrap gap-2">
                              {foodBank.services?.map((service: string) => (
                                <Badge key={service} variant="outline" className="text-xs">
                                  {service}
                                </Badge>
                              ))}
                            </div>
                            {foodBank.languages && (
                              <div>
                                <h4 className="font-semibold text-sm mt-2">Languages:</h4>
                                <p className="text-sm text-gray-600">{foodBank.languages.join(", ")}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        {foodBank.seniorPrograms && (
                          <div className="border-t pt-4">
                            <h4 className="font-semibold text-sm mb-2">Senior-Specific Programs:</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {foodBank.seniorPrograms.commodityProgram && (
                                <Badge className="bg-blue-100 text-blue-800">Commodity Program</Badge>
                              )}
                              {foodBank.seniorPrograms.brownBagProgram && (
                                <Badge className="bg-purple-100 text-purple-800">Brown Bag Program</Badge>
                              )}
                              {foodBank.seniorPrograms.mobilePantry && (
                                <Badge className="bg-orange-100 text-orange-800">Mobile Pantry</Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Additional Resources */}
                {foodBanksData?.additionalResources && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Additional Food Assistance Resources</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-3">National Hotlines</h4>
                          <div className="space-y-3">
                            {foodBanksData.additionalResources.nationalHotlines?.map((hotline: any) => (
                              <div key={hotline.name} className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                                <div className="font-medium">{hotline.name}</div>
                                <a href={`tel:${hotline.phone}`} className="text-blue-600 hover:underline">
                                  {hotline.phone}
                                </a>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{hotline.hours}</p>
                                <p className="text-sm">{hotline.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-3">Online Resources</h4>
                          <div className="space-y-3">
                            {foodBanksData.additionalResources.websites?.map((site: any) => (
                              <div key={site.name} className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                                <a href={site.url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline flex items-center gap-1">
                                  {site.name}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                                <p className="text-sm mt-1">{site.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        )}

        {/* IHSS Tab */}
        {activeTab === "ihss" && (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Home className="h-6 w-6 text-blue-600" />
                In-Home Supportive Services (IHSS)
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Get help with daily activities to remain safely in your own home
              </p>
            </div>

            {ihssLoading ? (
              <div className="text-center py-8">Loading IHSS resources...</div>
            ) : (
              <>
                {Object.entries(ihssData?.ihss || {}).map(([county, data]: [string, any]) => (
                  <Card key={county} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-xl">{county} County IHSS</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Office Information */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded">
                        <h4 className="font-semibold mb-2">Main Office</h4>
                        <div className="space-y-2">
                          <p>{data.office.name}</p>
                          <p className="text-sm">{data.office.mainOffice}</p>
                          <p className="text-sm">{data.office.city}, {data.office.state} {data.office.zipCode}</p>
                          <div className="flex gap-4 mt-2">
                            <a href={`tel:${data.office.phone}`} className="text-blue-600 hover:underline">
                              {data.office.phone}
                            </a>
                            {data.office.website && (
                              <a href={data.office.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                Website
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Services */}
                      <div>
                        <h4 className="font-semibold mb-2">Services Provided</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {data.services?.map((service: string) => (
                            <Badge key={service} variant="outline">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Eligibility */}
                      <div>
                        <h4 className="font-semibold mb-2">Eligibility Requirements</h4>
                        <ul className="space-y-1 text-sm">
                          <li>• Age: {data.eligibility.age}</li>
                          <li>• Income: {data.eligibility.income}</li>
                          <li>• Residency: {data.eligibility.residency}</li>
                          <li>• Needs: {data.eligibility.needs}</li>
                        </ul>
                      </div>

                      {/* Public Authority */}
                      {data.publicAuthority && (
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded">
                          <h4 className="font-semibold mb-2">Public Authority (Provider Registry)</h4>
                          <p className="font-medium">{data.publicAuthority.name}</p>
                          <a href={`tel:${data.publicAuthority.phone}`} className="text-blue-600 hover:underline">
                            {data.publicAuthority.phone}
                          </a>
                          {data.publicAuthority.website && (
                            <div>
                              <a href={data.publicAuthority.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                {data.publicAuthority.website}
                              </a>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {data.publicAuthority.services?.map((service: string) => (
                              <Badge key={service} variant="secondary" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Application Process */}
                      <div>
                        <h4 className="font-semibold mb-2">How to Apply</h4>
                        <ol className="space-y-2">
                          {data.applicationProcess?.map((step: string, index: number) => (
                            <li key={index} className="flex gap-2">
                              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                                {index + 1}
                              </span>
                              <span className="text-sm">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Additional Info */}
                      <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                          <span className="font-semibold text-sm">Average Hours:</span>
                          <p className="text-sm">{data.averageHours}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-sm">Provider Pay Rate:</span>
                          <p className="text-sm">{data.payRate}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Program Information */}
                {ihssData?.programInfo && (
                  <Card className="mt-6 bg-blue-50 dark:bg-blue-900/10">
                    <CardHeader>
                      <CardTitle>About IHSS</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-2">{ihssData.programInfo.description}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Funded by:</strong> {ihssData.programInfo.fundedBy}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Available in:</strong> {ihssData.programInfo.availableIn}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        )}

        {/* SLS Tab */}
        {activeTab === "sls" && (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Users className="h-6 w-6 text-purple-600" />
                Supported Living Services (SLS)
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Find providers offering independent living support for adults with disabilities
              </p>
            </div>

            {slsLoading ? (
              <div className="text-center py-8">Loading SLS providers...</div>
            ) : (
              <>
                {/* SLS Providers List */}
                <div className="grid gap-4">
                  {slsData?.sls?.map((provider: any) => (
                    <Card key={provider.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl">{provider.name}</CardTitle>
                            <Badge variant="secondary" className="mt-2">{provider.type}</Badge>
                          </div>
                          {provider.acceptingClients && (
                            <Badge className="bg-green-100 text-green-800">Accepting New Clients</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                              <div>
                                <p className="text-sm">{provider.address}</p>
                                <p className="text-sm">{provider.city}, {provider.state} {provider.zipCode}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <a href={`tel:${provider.phone}`} className="text-sm text-blue-600 hover:underline">
                                {provider.phone}
                              </a>
                            </div>
                            {provider.website && (
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-gray-500" />
                                <a href={provider.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                                  Visit Website
                                </a>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-gray-500" />
                              <p className="text-sm">Vendor #: {provider.vendorNumber}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Services Offered:</h4>
                            <div className="flex flex-wrap gap-2">
                              {provider.services?.map((service: string) => (
                                <Badge key={service} variant="outline" className="text-xs">
                                  {service}
                                </Badge>
                              ))}
                            </div>
                            {provider.languages && (
                              <div>
                                <h4 className="font-semibold text-sm mt-2">Languages:</h4>
                                <p className="text-sm text-gray-600">{provider.languages.join(", ")}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        {provider.specializations && (
                          <div className="border-t pt-4">
                            <h4 className="font-semibold text-sm mb-2">Specializations:</h4>
                            <div className="flex flex-wrap gap-2">
                              {provider.specializations.map((spec: string) => (
                                <Badge key={spec} className="bg-purple-100 text-purple-800">
                                  {spec}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {provider.regionalCenter && (
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                            <span className="font-semibold text-sm">Regional Center:</span> {provider.regionalCenter}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Regional Centers */}
                {slsData?.regionalCenters && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Regional Centers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Regional Centers coordinate SLS services. Contact them to apply for services.
                      </p>
                      <div className="space-y-4">
                        {Object.entries(slsData.regionalCenters).map(([county, centers]: [string, any]) => (
                          <div key={county}>
                            <h4 className="font-semibold mb-2">{county} County</h4>
                            <div className="grid gap-2">
                              {centers.map((center: any) => (
                                <div key={center.name} className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                                  <div className="font-medium">{center.name}</div>
                                  <div className="flex gap-4 mt-1">
                                    <a href={`tel:${center.phone}`} className="text-sm text-blue-600 hover:underline">
                                      {center.phone}
                                    </a>
                                    {center.website && (
                                      <a href={center.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                                        Website
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Program Information */}
                {slsData?.programInfo && (
                  <Card className="mt-6 bg-purple-50 dark:bg-purple-900/10">
                    <CardHeader>
                      <CardTitle>About SLS</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-2">{slsData.programInfo.description}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Eligibility:</strong> {slsData.programInfo.eligibility}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Funded by:</strong> {slsData.programInfo.fundedBy}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}