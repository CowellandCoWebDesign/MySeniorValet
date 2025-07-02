import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Shield, 
  AlertTriangle, 
  DollarSign,
  Calendar,
  Users,
  Heart,
  Share
} from "lucide-react";
import type { Community, Inspection } from "@shared/schema";

export default function CommunityPage() {
  const params = useParams();
  const communityId = parseInt(params.id || "0");

  const { data: community, isLoading: communityLoading, error: communityError } = useQuery<Community>({
    queryKey: [`/api/communities/${communityId}`],
    enabled: !isNaN(communityId) && communityId > 0,
  });

  const { data: inspections, isLoading: inspectionsLoading } = useQuery<Inspection[]>({
    queryKey: [`/api/communities/${communityId}/inspections`],
    enabled: !isNaN(communityId) && communityId > 0,
  });

  if (isNaN(communityId) || communityId <= 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Community</h2>
            <p className="text-gray-600">The community ID provided is not valid.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (communityError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Community Not Found</h2>
            <p className="text-gray-600">The requested community could not be found.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (communityLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <Skeleton className="h-64 w-full rounded-lg" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-48 w-full rounded-lg" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Community Not Found</h2>
            <p className="text-gray-600">The requested community could not be found.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const getLicenseStatusColor = (status: string) => {
    switch (status) {
      case 'Licensed':
        return 'bg-green-100 text-green-800';
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-800';
      case 'Expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (priceRange?: { min: number; max: number } | null) => {
    if (!priceRange) return 'Contact for pricing';
    return `$${priceRange.min.toLocaleString()} - $${priceRange.max.toLocaleString()} per month`;
  };

  const formatLastInspection = (date?: Date | null) => {
    if (!date) return 'No recent inspection';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Image */}
      <div className="relative h-64 md:h-96">
        <img
          src={community.imageUrl || "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800"}
          alt={`${community.name} exterior`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                {community.name}
              </h1>
              <div className="flex items-center space-x-4 text-white">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{community.city}, {community.state}</span>
                </div>
                {community.rating && (
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-current text-yellow-400" />
                    <span>{parseFloat(community.rating).toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="secondary" size="icon">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="icon">
                <Share className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  {community.description || "A welcoming senior living community dedicated to providing quality care and services."}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-900">License Status</div>
                    <Badge className={`mt-1 ${getLicenseStatusColor(community.licenseStatus || 'Unknown')}`}>
                      {community.licenseStatus || 'Unknown'}
                    </Badge>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Calendar className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-900">Last Inspection</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {formatLastInspection(community.lastInspection)}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <AlertTriangle className={`h-8 w-8 mx-auto mb-2 ${community.violations === 0 ? 'text-green-500' : 'text-orange-500'}`} />
                    <div className="text-sm font-medium text-gray-900">Violations</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {community.violations === 0 ? 'None Active' : `${community.violations} Active`}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-900">Verified</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {community.isVerified ? 'Yes' : 'Pending'}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Care Services</h4>
                  <div className="flex flex-wrap gap-2">
                    {community.careTypes.map((type) => (
                      <Badge key={type} variant="secondary">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                {community.amenities.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {community.amenities.map((amenity) => (
                        <Badge key={amenity} variant="outline">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Transparency Information */}
            <Card>
              <CardHeader>
                <CardTitle>Transparency & Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">License Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">License Number:</span>
                        <span className="ml-2 font-medium">{community.licenseNumber || 'Not Available'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <Badge className={`ml-2 ${getLicenseStatusColor(community.licenseStatus || 'Unknown')}`}>
                          {community.licenseStatus || 'Unknown'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Recent Inspections</h4>
                    {inspectionsLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    ) : inspections && inspections.length > 0 ? (
                      <div className="space-y-3">
                        {inspections.slice(0, 3).map((inspection) => (
                          <div key={inspection.id} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-sm">{inspection.inspectionType}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(inspection.inspectionDate).toLocaleDateString()}
                              </span>
                            </div>
                            {inspection.overallScore && (
                              <div className="text-sm text-gray-600">
                                Score: {inspection.overallScore}/100
                              </div>
                            )}
                            {inspection.violations && inspection.violations.length > 0 && (
                              <div className="text-sm text-orange-600 mt-1">
                                {inspection.violations.length} violation(s) noted
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-sm">No recent inspection data available.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Address</div>
                    <div className="text-sm text-gray-600">
                      {community.address}<br />
                      {community.city}, {community.state} {community.zipCode}
                    </div>
                  </div>
                </div>

                {community.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">Phone</div>
                      <div className="text-sm text-gray-600">{community.phone}</div>
                    </div>
                  </div>
                )}

                {community.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">Email</div>
                      <div className="text-sm text-gray-600">{community.email}</div>
                    </div>
                  </div>
                )}

                {community.website && (
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">Website</div>
                      <a href={community.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                        Visit Website
                      </a>
                    </div>
                  </div>
                )}

                <Separator />

                <Button className="w-full" size="lg">
                  Schedule a Visit
                </Button>
                <Button variant="outline" className="w-full">
                  Request Information
                </Button>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Pricing</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {formatPrice(community.priceRange)}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Pricing varies by care level and apartment type
                  </p>
                  <Button variant="outline" className="w-full">
                    Get Detailed Pricing
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
