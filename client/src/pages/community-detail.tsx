import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  X
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

            {/* Photos */}
            {community.photos && community.photos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Photos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {community.photos.slice(0, 6).map((photo: any, index: number) => (
                      <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                        <img 
                          src={photo.url} 
                          alt={photo.alt || "Community photo"} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Amenities */}
            {community.amenities && community.amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {community.amenities.map((amenity: string) => (
                      <div key={amenity} className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Pricing & Actions */}
          <div className="space-y-6">
            {/* Pricing */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Pricing</CardTitle>
                  {community.isClaimed && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="monthlyRate">Monthly Rate</Label>
                      <Input
                        id="monthlyRate"
                        type="number"
                        placeholder="Enter monthly rate"
                        value={pricingData.monthlyRate || ""}
                        onChange={(e) => setPricingData({...pricingData, monthlyRate: e.target.value})}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleUpdatePricing} size="sm">
                        <Check className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)} size="sm">
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {community.monthlyRent 
                        ? `$${community.monthlyRent.toLocaleString()}/month` 
                        : 'Contact for pricing'
                      }
                    </div>
                    <p className="text-sm text-gray-600">
                      Pricing varies by room type and care level
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Availability */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Status</span>
                  <Badge variant={community.availabilityStatus === 'Available' ? 'default' : 'secondary'}>
                    {community.availabilityStatus || 'Contact for availability'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {community.phone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">{community.phone}</span>
                  </div>
                )}
                {community.website && (
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-gray-500" />
                    <a href={community.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                      Visit Website
                    </a>
                  </div>
                )}
                <div className="space-y-2">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
                  <Button variant="outline" className="w-full">
                    Schedule Tour
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Claim Community */}
            {!community.isClaimed && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Manage This Community</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Are you the owner or manager of this community? Claim it to update pricing and availability.
                  </p>
                  <Button 
                    onClick={handleClaimCommunity}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Claim Community
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}