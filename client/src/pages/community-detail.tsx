import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { TransparencyBadgeList } from "@/components/TransparencyBadge";
import { 
  MapPin, 
  Star, 
  Heart, 
  Phone, 
  Globe, 
  Clock, 
  Car, 
  Wifi,
  Utensils,
  Bike,
  Dumbbell,
  Stethoscope,
  Shield,
  ArrowLeft,
  Home,
  ExternalLink,
  Edit,
  Check,
  X,
  Mail,
  Calendar,
  Users,
  Activity,
  Zap,
  Camera,
  FileText,
  Award,
  DollarSign,
  Building,
  Bed,
  Bath,
  Square,
  ChevronRight,
  Info,
  AlertCircle,
  CheckCircle,
  XCircle,
  MapIcon,
  Navigation,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";

export default function CommunityDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [pricingData, setPricingData] = useState<any>({});
  const [availabilityData, setAvailabilityData] = useState<any>({});

  const { data: community, isLoading, error } = useQuery({
    queryKey: [`/api/communities/${id}`],
    enabled: !!id,
  });

  const handleClaimCommunity = async () => {
    try {
      const response = await apiRequest(`/api/communities/${id}/claim`, {
        method: "POST",
        body: JSON.stringify({
          businessEmail: "operator@example.com",
          title: "Community Manager",
          verificationMessage: "I manage this community and need to update our information."
        })
      });
      
      toast({
        title: "Claim submitted",
        description: "Your claim has been submitted for review.",
      });
    } catch (error) {
      console.error("Claim error:", error);
      toast({
        title: "Error",
        description: "Failed to submit claim. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePricing = async () => {
    try {
      await apiRequest(`/api/communities/${id}/update-pricing`, {
        method: "POST",
        body: JSON.stringify({ pricingData })
      });
      
      toast({
        title: "Pricing updated",
        description: "Your pricing information has been updated.",
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Pricing update error:", error);
      toast({
        title: "Error",
        description: "Failed to update pricing. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateAvailability = async () => {
    try {
      await apiRequest(`/api/communities/${id}/update-availability`, {
        method: "POST",
        body: JSON.stringify(availabilityData)
      });
      
      toast({
        title: "Availability updated",
        description: "Your availability information has been updated.",
      });
    } catch (error) {
      console.error("Availability update error:", error);
      toast({
        title: "Error",
        description: "Failed to update availability. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading community details...</p>
        </div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Community Not Found</h2>
          <p className="text-gray-600 mb-4">The community you're looking for doesn't exist.</p>
          <Link href="/search">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Back to Search
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/search">
                <Button variant="ghost" size="sm" className="mr-2">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/" className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">TrueView</span>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Heart className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Community Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                      {community.name}
                    </CardTitle>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{community.address}, {community.city}, {community.state}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      {community.careTypes?.slice(0, 3).join(' • ') || 'Senior Living'}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    {community.googleRating && (
                      <div className="flex items-center mb-2">
                        <Star className="w-5 h-5 text-yellow-400 fill-current mr-1" />
                        <span className="text-lg font-semibold">{community.googleRating}</span>
                        <span className="text-sm text-gray-500 ml-1">
                          ({community.googleReviewCount} reviews)
                        </span>
                      </div>
                    )}
                    {community.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-1" />
                        <span>{community.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Transparency Badges */}
            {community.transparencyBadges && community.transparencyBadges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Transparency Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <TransparencyBadgeList 
                    badges={community.transparencyBadges} 
                    transparencyScore={community.transparencyScore}
                    showScore={true}
                    maxBadges={10}
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    This community earns transparency badges for providing clear pricing and availability information.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* How We're Different Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
                  How We're Different
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose max-w-none">
                  <p className="text-gray-700">
                    {community.description || 
                     `${community.name} has been providing exceptional senior living experiences with a focus on personalized care, engaging activities, and a supportive community environment. Our dedicated team works to ensure each resident feels at home while maintaining their independence and dignity.`}
                  </p>
                </div>
                
                {/* Care Philosophy */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Our Care Philosophy</h4>
                  <p className="text-sm text-blue-800">
                    We believe in person-centered care that honors each resident's unique needs, preferences, and life story. Our approach focuses on promoting wellness, maintaining independence, and fostering meaningful connections within our community.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Main Content Tabs */}
            <Card>
              <CardContent className="p-0">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-5 h-auto">
                    <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
                    <TabsTrigger value="amenities" className="text-sm">Amenities</TabsTrigger>
                    <TabsTrigger value="care" className="text-sm">Care Services</TabsTrigger>
                    <TabsTrigger value="policies" className="text-sm">Policies</TabsTrigger>
                    <TabsTrigger value="photos" className="text-sm">Photos</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="p-6">
                    <div className="space-y-6">
                      {/* Community Details */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Community Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center">
                            <Building className="w-5 h-5 text-gray-500 mr-2" />
                            <div>
                              <p className="font-medium">Community Type</p>
                              <p className="text-sm text-gray-600">{community.careTypes?.join(', ') || 'Senior Living'}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Users className="w-5 h-5 text-gray-500 mr-2" />
                            <div>
                              <p className="font-medium">Total Units</p>
                              <p className="text-sm text-gray-600">{community.totalUnits || 'Contact for details'}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Shield className="w-5 h-5 text-gray-500 mr-2" />
                            <div>
                              <p className="font-medium">License Status</p>
                              <p className="text-sm text-gray-600">{community.licenseStatus || 'Licensed'}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-5 h-5 text-gray-500 mr-2" />
                            <div>
                              <p className="font-medium">Last Inspection</p>
                              <p className="text-sm text-gray-600">
                                {community.lastInspection ? new Date(community.lastInspection).toLocaleDateString() : 'Not available'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Transportation Services */}
                      {community.transportationServices && community.transportationServices.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Car className="w-5 h-5 mr-2" />
                            Transportation Services
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {community.transportationServices.map((service: string) => (
                              <div key={service} className="flex items-center">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                <span className="text-sm">{service}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Dining Services */}
                      {community.diningServices && community.diningServices.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Utensils className="w-5 h-5 mr-2" />
                            Dining & Nutrition
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {community.diningServices.map((service: string) => (
                              <div key={service} className="flex items-center">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                <span className="text-sm">{service}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="amenities" className="p-6">
                    <div className="space-y-6">
                      {/* General Amenities */}
                      {community.amenities && community.amenities.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Home className="w-5 h-5 mr-2" />
                            General Amenities
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {community.amenities.map((amenity: string) => (
                              <div key={amenity} className="flex items-center">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                <span className="text-sm">{amenity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Fitness Services */}
                      {community.fitnessServices && community.fitnessServices.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Dumbbell className="w-5 h-5 mr-2" />
                            Fitness & Wellness
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {community.fitnessServices.map((service: string) => (
                              <div key={service} className="flex items-center">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                <span className="text-sm">{service}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Spa Services */}
                      {community.spaServices && community.spaServices.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Sparkles className="w-5 h-5 mr-2" />
                            Spa & Personal Care
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {community.spaServices.map((service: string) => (
                              <div key={service} className="flex items-center">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                <span className="text-sm">{service}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Social Services */}
                      {community.socialServices && community.socialServices.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Users className="w-5 h-5 mr-2" />
                            Social & Activities
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {community.socialServices.map((service: string) => (
                              <div key={service} className="flex items-center">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                <span className="text-sm">{service}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="care" className="p-6">
                    <div className="space-y-6">
                      {/* Care Services */}
                      {community.careServices && community.careServices.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Stethoscope className="w-5 h-5 mr-2" />
                            Care Services Available
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {community.careServices.map((service: string) => (
                              <div key={service} className="flex items-center">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                <span className="text-sm">{service}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Healthcare Services */}
                      {community.healthcareServices && community.healthcareServices.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Activity className="w-5 h-5 mr-2" />
                            Healthcare Services
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {community.healthcareServices.map((service: string) => (
                              <div key={service} className="flex items-center">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                <span className="text-sm">{service}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Medical Restrictions */}
                      {community.medicalRestrictions && community.medicalRestrictions.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <AlertCircle className="w-5 h-5 mr-2 text-amber-500" />
                            Medical Restrictions
                          </h3>
                          <div className="bg-amber-50 p-4 rounded-lg">
                            <p className="text-sm text-amber-800 mb-3">
                              Please note the following medical restrictions for this community:
                            </p>
                            <div className="space-y-2">
                              {community.medicalRestrictions.map((restriction: string) => (
                                <div key={restriction} className="flex items-center">
                                  <XCircle className="w-4 h-4 text-amber-600 mr-2" />
                                  <span className="text-sm text-amber-800">{restriction}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="policies" className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <FileText className="w-5 h-5 mr-2" />
                          Community Policies
                        </h3>
                        
                        <div className="space-y-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium mb-2">Pet Policy</h4>
                            <p className="text-sm text-gray-600">
                              Contact the community directly to inquire about pet policies and any associated fees.
                            </p>
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium mb-2">Visitor Policy</h4>
                            <p className="text-sm text-gray-600">
                              Family and friends are welcome to visit. Please check with the community for current visiting hours and any special requirements.
                            </p>
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium mb-2">Smoking Policy</h4>
                            <p className="text-sm text-gray-600">
                              Most communities maintain smoke-free environments. Please inquire about designated smoking areas if applicable.
                            </p>
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium mb-2">Move-In Requirements</h4>
                            <p className="text-sm text-gray-600">
                              Application process, health assessments, and financial requirements vary by community. Contact directly for specific requirements.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="photos" className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <Camera className="w-5 h-5 mr-2" />
                          Photo Gallery
                        </h3>
                        
                        {community.photos && community.photos.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {community.photos.map((photo: any, index: number) => (
                              <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                                <img 
                                  src={photo.url || photo} 
                                  alt={photo.alt || `${community.name} photo ${index + 1}`} 
                                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Camera className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500 mb-2">No photos available</p>
                            <p className="text-sm text-gray-400">Photos will be added as they become available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Contact & Actions */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {community.phone && (
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-500 mr-3" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-sm text-gray-600">{community.phone}</p>
                    </div>
                  </div>
                )}
                {community.email && (
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-500 mr-3" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-gray-600">{community.email}</p>
                    </div>
                  </div>
                )}
                {community.website && (
                  <div className="flex items-center">
                    <Globe className="w-5 h-5 text-gray-500 mr-3" />
                    <div>
                      <p className="font-medium">Website</p>
                      <a href={community.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        Visit Website
                      </a>
                    </div>
                  </div>
                )}
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Tour
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Request Info
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Pricing Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {community.priceRange ? (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="font-medium text-green-900">
                        ${community.priceRange.min.toLocaleString()} - ${community.priceRange.max.toLocaleString()}
                      </p>
                      <p className="text-sm text-green-700">Monthly pricing range</p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium text-gray-900">Contact for Pricing</p>
                      <p className="text-sm text-gray-600">Call for current rates and availability</p>
                    </div>
                  )}
                  
                  {community.pricingDetails?.specialOffers && community.pricingDetails.specialOffers.length > 0 && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="font-medium text-blue-900 mb-2">Special Offers</p>
                      {community.pricingDetails.specialOffers.map((offer: any, index: number) => (
                        <div key={index} className="text-sm text-blue-800">
                          <p className="font-medium">{offer.title}</p>
                          <p>{offer.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Reviews & Ratings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Reviews & Ratings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {community.googleRating && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-400 fill-current mr-2" />
                      <span className="font-medium">Google</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{community.googleRating}/5</p>
                      <p className="text-sm text-gray-500">({community.googleReviewCount} reviews)</p>
                    </div>
                  </div>
                )}
                
                {community.yelpRating && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-400 fill-current mr-2" />
                      <span className="font-medium">Yelp</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{community.yelpRating}/5</p>
                      <p className="text-sm text-gray-500">({community.yelpReviewCount} reviews)</p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Google Reviews
                  </Button>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Yelp Reviews
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Location & Directions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <MapIcon className="w-5 h-5 mr-2" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="font-medium">{community.address}</p>
                  <p className="text-sm text-gray-600">{community.city}, {community.state} {community.zipCode}</p>
                </div>
                
                <Button variant="outline" className="w-full">
                  <Navigation className="w-4 h-4 mr-2" />
                  Get Directions
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}