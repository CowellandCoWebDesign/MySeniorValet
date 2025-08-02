import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  MapPin, Phone, Globe, Star, Users, Building, Calendar, 
  DollarSign, Camera, Wifi, Car, Utensils, Heart, 
  CheckCircle, AlertCircle, Clock, Home, Sparkles,
  ArrowRight, ExternalLink, Tag
} from "lucide-react";
import { Link, useRoute } from "wouter";

// Mock data for red tag examples
const redTagExamples = {
  "sunrise-senior-living": {
    id: 1,
    name: "Sunrise Senior Living",
    address: "123 Sunset Boulevard, Beverly Hills, CA 90210",
    phone: "(555) 123-4567",
    website: "https://sunriseseniorliving.com",
    rating: 4.8,
    reviewCount: 156,
    actualCommunityId: 12345, // Link to real community
    photos: [
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1571508601b60-5c8d0869d40a?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&h=600&fit=crop"
    ],
    unitPhotos: {
      studio: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop",
      oneBedroom: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=600&h=400&fit=crop",
      twoBedroom: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&h=400&fit=crop"
    },
    redTagSpecial: {
      title: "First Month FREE + $500 Move-in Credit",
      description: "Limited time offer for new residents. Save over $3,000 on your first year!",
      originalPrice: 4200,
      specialPrice: 3700,
      validUntil: "December 31, 2025",
      unitsAvailable: 3,
      unitTypes: ["Studio", "1-Bedroom"]
    },
    occupancy: {
      total: 120,
      occupied: 89,
      available: 31,
      rate: 74.2
    },
    unitAvailability: {
      studio: { total: 40, available: 8, waitlist: 2, price: 3200, specialPrice: 2700 },
      oneBedroom: { total: 50, available: 15, waitlist: 0, price: 4200, specialPrice: 3700 },
      twoBedroom: { total: 30, available: 8, waitlist: 5, price: 5800, specialPrice: null }
    },
    amenities: [
      "24/7 Concierge Service", "Fitness Center & Pool", "Gourmet Dining", 
      "Memory Care Wing", "Transportation Services", "Beauty Salon & Spa",
      "Library & Computer Lab", "Pet-Friendly Suites", "Emergency Response System"
    ],
    careServices: ["Independent Living", "Assisted Living", "Memory Care"],
    description: "Luxury senior living community offering exceptional care and amenities in the heart of Beverly Hills."
  },
  "heritage-hills": {
    id: 2, 
    name: "Heritage Hills Senior Community",
    address: "456 Oak Tree Lane, Austin, TX 78701",
    phone: "(555) 987-6543",
    website: "https://heritagehillsaustin.com",
    rating: 4.6,
    reviewCount: 89,
    actualCommunityId: 67890,
    photos: [
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop"
    ],
    unitPhotos: {
      studio: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop",
      oneBedroom: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop",
      twoBedroom: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&h=400&fit=crop"
    },
    redTagSpecial: {
      title: "50% Off First 3 Months + Waived Fees",
      description: "Special pricing for select apartment homes. Move-in by month end!",
      originalPrice: 3800,
      specialPrice: 1900,
      validUntil: "November 30, 2025",
      unitsAvailable: 5,
      unitTypes: ["1-Bedroom", "2-Bedroom"]
    },
    occupancy: {
      total: 88,
      occupied: 71,
      available: 17,
      rate: 80.7
    },
    unitAvailability: {
      studio: { total: 20, available: 3, waitlist: 1, price: 2800, specialPrice: null },
      oneBedroom: { total: 38, available: 9, waitlist: 0, price: 3800, specialPrice: 1900 },
      twoBedroom: { total: 30, available: 5, waitlist: 2, price: 4600, specialPrice: 2300 }
    },
    amenities: [
      "Resort-Style Pool", "Golf Simulator", "Yoga Studio", "Community Garden",
      "Dog Park", "Game Room", "Chef's Kitchen", "Wine Cellar", "Movie Theater"
    ],
    careServices: ["Independent Living", "Assisted Living"],
    description: "Active adult community featuring resort-style amenities and vibrant social opportunities."
  },
  "golden-years": {
    id: 3,
    name: "Golden Years Residence", 
    address: "789 Maple Street, Portland, OR 97201",
    phone: "(555) 456-7890",
    website: "https://goldenyearsportland.com",
    rating: 4.7,
    reviewCount: 134,
    actualCommunityId: 11223,
    photos: [
      "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1571508601108-4d53efdfeb6b?w=800&h=600&fit=crop"
    ],
    unitPhotos: {
      studio: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop",
      oneBedroom: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop",
      twoBedroom: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&h=400&fit=crop"
    },
    redTagSpecial: {
      title: "Move-in Special: $1,000 Credit + Free WiFi",
      description: "Immediate availability in our newly renovated wing with premium finishes.",
      originalPrice: 3400,
      specialPrice: 2400,
      validUntil: "January 15, 2026",
      unitsAvailable: 7,
      unitTypes: ["Studio", "1-Bedroom", "2-Bedroom"]
    },
    occupancy: {
      total: 95,
      occupied: 82,
      available: 13,
      rate: 86.3
    },
    unitAvailability: {
      studio: { total: 25, available: 4, waitlist: 0, price: 2600, specialPrice: 2100 },
      oneBedroom: { total: 45, available: 6, waitlist: 1, price: 3400, specialPrice: 2400 },
      twoBedroom: { total: 25, available: 3, waitlist: 3, price: 4200, specialPrice: 3200 }
    },
    amenities: [
      "Rooftop Garden", "Fitness Center", "Library", "Arts & Crafts Studio",
      "Physical Therapy", "Medication Management", "Housekeeping", "Laundry Service"
    ],
    careServices: ["Independent Living", "Assisted Living", "Respite Care"],
    description: "Intimate senior community providing personalized care in a warm, home-like environment."
  }
};

export default function RedTagExamplePage() {
  const [match, params] = useRoute("/red-tag-example/:communitySlug");
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [showAuthenticDisclaimer, setShowAuthenticDisclaimer] = useState(true);

  if (!match || !params?.communitySlug) {
    return <div>Community not found</div>;
  }

  const community = redTagExamples[params.communitySlug as keyof typeof redTagExamples];
  if (!community) {
    return <div>Community not found</div>;
  }

  const occupancyPercentage = (community.occupancy.occupied / community.occupancy.total) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Authentic Data Disclaimer Banner */}
      {showAuthenticDisclaimer && (
        <div className="bg-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div className="text-sm">
                  <strong>Red Tag Deal Demonstration:</strong> This page shows example pricing and availability features. 
                  Our community data is 100% authentic - only the deal pricing is demonstration.
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link href={`/communities/${community.actualCommunityId}`}>
                  <Button variant="outline" size="sm" className="text-blue-600 bg-white hover:bg-gray-100">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Authentic Listing
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-blue-700"
                  onClick={() => setShowAuthenticDisclaimer(false)}
                >
                  ×
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Community Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge className="bg-red-600 text-white">
                  <Tag className="w-3 h-3 mr-1" />
                  RED TAG DEAL
                </Badge>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Example Features
                </Badge>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {community.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-400 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{community.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  <span>{community.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  <a href={community.website} className="text-blue-600 hover:underline">
                    Visit Website
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-semibold">{community.rating}</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    ({community.reviewCount} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  <span>{community.occupancy.available} units available</span>
                </div>
              </div>
            </div>

            {/* Red Tag Special Card */}
            <Card className="lg:w-80 border-red-200 dark:border-red-800">
              <CardHeader className="bg-red-50 dark:bg-red-950/30">
                <CardTitle className="text-red-800 dark:text-red-200 flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  {community.redTagSpecial.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {community.redTagSpecial.description}
                </p>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">Valid until {community.redTagSpecial.validUntil}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{community.redTagSpecial.unitsAvailable} units available</span>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    ${community.redTagSpecial.specialPrice.toLocaleString()}/month
                  </div>
                  <div className="text-sm text-gray-500 line-through">
                    Was ${community.redTagSpecial.originalPrice.toLocaleString()}/month
                  </div>
                  <div className="text-green-600 font-semibold text-sm mt-1">
                    Save ${(community.redTagSpecial.originalPrice - community.redTagSpecial.specialPrice).toLocaleString()}/month
                  </div>
                </div>

                <Button className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white" disabled>
                  <Tag className="w-4 h-4 mr-2" />
                  Reserve Now (Example)
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2">
            <img 
              src={community.photos[0]} 
              alt={`${community.name} exterior`}
              className="w-full h-80 object-cover rounded-lg"
            />
          </div>
          <div className="space-y-4">
            {community.photos.slice(1).map((photo, idx) => (
              <img 
                key={idx}
                src={photo} 
                alt={`${community.name} interior ${idx + 1}`}
                className="w-full h-36 object-cover rounded-lg"
              />
            ))}
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="availability" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="availability">Live Availability</TabsTrigger>
            <TabsTrigger value="amenities">Amenities</TabsTrigger>
            <TabsTrigger value="pricing">Full Pricing</TabsTrigger>
            <TabsTrigger value="photos">Unit Photos</TabsTrigger>
          </TabsList>

          {/* Live Availability Tab */}
          <TabsContent value="availability" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Live Occupancy & Availability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{community.occupancy.total}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Units</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{community.occupancy.available}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Available Now</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{community.occupancy.occupied}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Occupied</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{occupancyPercentage.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Occupancy Rate</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {Object.entries(community.unitAvailability).map(([unitType, data]) => (
                    <Card key={unitType} className={`border-2 ${data.specialPrice ? 'border-red-200 dark:border-red-800' : 'border-gray-200 dark:border-gray-700'}`}>
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold capitalize text-lg">
                                {unitType === 'oneBedroom' ? '1-Bedroom' : unitType === 'twoBedroom' ? '2-Bedroom' : 'Studio'} Apartment
                              </h3>
                              {data.specialPrice && (
                                <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                  RED TAG SPECIAL
                                </Badge>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Available:</span>
                                <span className="ml-2 font-semibold text-green-600">{data.available} units</span>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Total:</span>
                                <span className="ml-2 font-semibold">{data.total} units</span>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Waitlist:</span>
                                <span className="ml-2 font-semibold text-orange-600">{data.waitlist} people</span>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Rate:</span>
                                <span className="ml-2 font-semibold">{((data.total - data.available) / data.total * 100).toFixed(1)}%</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col md:items-end gap-3">
                            <div className="text-right">
                              {data.specialPrice ? (
                                <>
                                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                    ${data.specialPrice.toLocaleString()}/month
                                  </div>
                                  <div className="text-sm text-gray-500 line-through">
                                    Was ${data.price.toLocaleString()}/month
                                  </div>
                                </>
                              ) : (
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                  ${data.price.toLocaleString()}/month
                                </div>
                              )}
                            </div>
                            
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Camera className="w-4 h-4 mr-2" />
                                    View Unit
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>
                                      {unitType === 'oneBedroom' ? '1-Bedroom' : unitType === 'twoBedroom' ? '2-Bedroom' : 'Studio'} Unit Photos
                                    </DialogTitle>
                                  </DialogHeader>
                                  <img 
                                    src={community.unitPhotos[unitType as keyof typeof community.unitPhotos]} 
                                    alt={`${unitType} unit interior`}
                                    className="w-full h-96 object-cover rounded-lg"
                                  />
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Example unit layout and finishes. Actual units may vary.
                                  </p>
                                </DialogContent>
                              </Dialog>
                              
                              <Button 
                                size="sm" 
                                className={data.specialPrice ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}
                                disabled
                              >
                                <Calendar className="w-4 h-4 mr-2" />
                                {data.available > 0 ? 'Reserve Now' : 'Join Waitlist'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Amenities Tab */}
          <TabsContent value="amenities">
            <Card>
              <CardHeader>
                <CardTitle>Community Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {community.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Full Pricing Tab */}
          <TabsContent value="pricing">
            <Card>
              <CardHeader>
                <CardTitle>Complete Pricing Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(community.unitAvailability).map(([unitType, data]) => (
                    <div key={unitType} className="border rounded-lg p-6">
                      <h3 className="text-xl font-semibold mb-4 capitalize">
                        {unitType === 'oneBedroom' ? '1-Bedroom' : unitType === 'twoBedroom' ? '2-Bedroom' : 'Studio'} Units
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3">Standard Pricing</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Base Rent:</span>
                              <span className="font-semibold">${data.price.toLocaleString()}/month</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Care Services:</span>
                              <span className="font-semibold">+$200-800/month</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Utilities:</span>
                              <span className="font-semibold">Included</span>
                            </div>
                          </div>
                        </div>

                        {data.specialPrice && (
                          <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg">
                            <h4 className="font-medium mb-3 text-red-800 dark:text-red-200">Red Tag Special</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Special Rate:</span>
                                <span className="font-semibold text-red-600">${data.specialPrice.toLocaleString()}/month</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Monthly Savings:</span>
                                <span className="font-semibold text-green-600">-${(data.price - data.specialPrice).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Annual Savings:</span>
                                <span className="font-semibold text-green-600">-${((data.price - data.specialPrice) * 12).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Unit Photos Tab */}
          <TabsContent value="photos">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(community.unitPhotos).map(([unitType, photo]) => (
                <Card key={unitType}>
                  <CardHeader>
                    <CardTitle className="capitalize">
                      {unitType === 'oneBedroom' ? '1-Bedroom' : unitType === 'twoBedroom' ? '2-Bedroom' : 'Studio'} Unit
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img 
                      src={photo} 
                      alt={`${unitType} unit interior`}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Example unit layout and finishes. Actual units may vary based on availability and community standards.
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Bottom CTA */}
        <Card className="mt-8 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-red-200 dark:border-red-800">
          <CardContent className="p-6 text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Ready to Claim This Red Tag Deal?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This is an example of how verified community specials will appear. Contact the actual community for real availability and pricing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/communities/${community.actualCommunityId}`}>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Authentic Listing
                </Button>
              </Link>
              <Button variant="outline" disabled>
                <Phone className="w-4 h-4 mr-2" />
                Call for Real Pricing
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}