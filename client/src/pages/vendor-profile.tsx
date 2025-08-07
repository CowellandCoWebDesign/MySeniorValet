import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Shield, 
  Trophy,
  Users,
  DollarSign,
  MessageSquare,
  TrendingUp,
  Calendar,
  CheckCircle,
  Edit,
  Share2,
  Heart,
  Clock,
  Sparkles,
  Crown,
  Gem
} from 'lucide-react';
import { NavigationHeader } from '@/components/NavigationHeader';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface VendorProfile {
  id: number;
  businessName: string;
  businessType: string;
  description: string;
  shortDescription: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  businessCity: string;
  businessState: string;
  website: string;
  logoUrl: string;
  serviceAreas: string[];
  subscriptionTier: 'basic' | 'featured' | 'national';
  isVerified: boolean;
  averageRating: number;
  totalReviews: number;
  featured: boolean;
  services: any[];
  reviews: any[];
  analytics: {
    profileViews: number;
    leadsReceived: number;
    responseRate: number;
  };
}

// Tier badges and colors
const tierConfig = {
  basic: {
    badge: 'Basic',
    icon: Shield,
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    gradient: 'from-gray-500 to-gray-600'
  },
  featured: {
    badge: 'Featured Partner',
    icon: Gem,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    gradient: 'from-blue-500 to-purple-600'
  },
  national: {
    badge: 'National Partner',
    icon: Crown,
    color: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-900 dark:from-yellow-900 dark:to-amber-900 dark:text-amber-200',
    gradient: 'from-yellow-500 to-amber-600'
  }
};

export default function VendorProfile() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isFavorited, setIsFavorited] = useState(false);

  // Fetch vendor profile
  const { data: vendor, isLoading } = useQuery<VendorProfile>({
    queryKey: [`/api/vendors/${vendorId}`],
    enabled: !!vendorId
  });

  // Fetch vendor services
  const { data: services = [] } = useQuery({
    queryKey: [`/api/vendors/${vendorId}/services`],
    enabled: !!vendorId
  });

  // Fetch vendor reviews
  const { data: reviews = [] } = useQuery({
    queryKey: [`/api/vendors/${vendorId}/reviews`],
    enabled: !!vendorId
  });

  const handleContact = () => {
    if (!vendor) return;
    
    toast({
      title: "Opening contact form",
      description: `Connecting you with ${vendor.businessName}`,
    });
    
    // Open contact modal or redirect to contact page
    window.location.href = `mailto:${vendor.primaryContactEmail}?subject=Inquiry from MySeniorValet`;
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast({
      title: isFavorited ? "Removed from favorites" : "Added to favorites",
      description: isFavorited ? "Vendor removed from your list" : "You'll be notified of special offers",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: vendor?.businessName,
        text: `Check out ${vendor?.businessName} on MySeniorValet`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Share this vendor profile with others",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Vendor Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">This vendor profile doesn't exist or has been removed.</p>
            <Button onClick={() => setLocation('/marketplace')}>Browse Marketplace</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tierInfo = tierConfig[vendor.subscriptionTier];
  const TierIcon = tierInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <NavigationHeader title="Vendor Profile" subtitle="Trusted senior living partner" />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <Card className="mb-8 overflow-hidden">
          <div className={`h-32 bg-gradient-to-r ${tierInfo.gradient}`} />
          <CardContent className="relative pb-6">
            <div className="flex flex-col md:flex-row gap-6 -mt-16">
              {/* Logo/Avatar */}
              <div className="w-32 h-32 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex items-center justify-center border-4 border-white dark:border-gray-700">
                {vendor.logoUrl ? (
                  <img src={vendor.logoUrl} alt={vendor.businessName} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Building2 className="w-16 h-16 text-gray-400" />
                )}
              </div>

              {/* Vendor Info */}
              <div className="flex-1 pt-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold">{vendor.businessName}</h1>
                      {vendor.isVerified && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      <Badge className={tierInfo.color}>
                        <TierIcon className="w-3 h-3 mr-1" />
                        {tierInfo.badge}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-2">{vendor.shortDescription}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {vendor.businessCity}, {vendor.businessState}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        {vendor.averageRating?.toFixed(1) || '0.0'} ({vendor.totalReviews} reviews)
                      </span>
                      {vendor.subscriptionTier !== 'basic' && (
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {vendor.analytics?.leadsReceived || 0} leads this month
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button onClick={handleContact} className="bg-blue-600 hover:bg-blue-700">
                      <Phone className="w-4 h-4 mr-2" />
                      Contact
                    </Button>
                    <Button variant="outline" onClick={handleFavorite}>
                      <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <Button variant="outline" onClick={handleShare}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats - Only for Featured and National tiers */}
        {vendor.subscriptionTier !== 'basic' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Response Rate</p>
                    <p className="text-2xl font-bold">{vendor.analytics?.responseRate || 95}%</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Profile Views</p>
                    <p className="text-2xl font-bold">{vendor.analytics?.profileViews || 247}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Services</p>
                    <p className="text-2xl font-bold">{services.length}</p>
                  </div>
                  <Sparkles className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</p>
                    <div className="flex items-center gap-1">
                      <p className="text-2xl font-bold">{vendor.averageRating?.toFixed(1) || '0.0'}</p>
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    </div>
                  </div>
                  <Trophy className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="about" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          {/* About Tab */}
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>About {vendor.businessName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-600 dark:text-gray-400">{vendor.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Service Areas</h3>
                  <div className="flex flex-wrap gap-2">
                    {vendor.serviceAreas?.map((area, index) => (
                      <Badge key={index} variant="outline">
                        <MapPin className="w-3 h-3 mr-1" />
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>

                {vendor.website && (
                  <div>
                    <h3 className="font-semibold mb-2">Website</h3>
                    <a 
                      href={vendor.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Globe className="w-4 h-4" />
                      {vendor.website}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Our Services</CardTitle>
                <CardDescription>Professional services for senior communities</CardDescription>
              </CardHeader>
              <CardContent>
                {services.length > 0 ? (
                  <div className="grid gap-4">
                    {services.map((service: any) => (
                      <Card key={service.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{service.serviceName}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {service.serviceDescription}
                              </p>
                              {service.price && (
                                <div className="flex items-center gap-1 mt-2">
                                  <DollarSign className="w-4 h-4 text-green-600" />
                                  <span className="font-semibold">
                                    ${service.price}/{service.priceUnit}
                                  </span>
                                </div>
                              )}
                            </div>
                            <Button size="sm">Get Quote</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No services listed yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
                <CardDescription>What families are saying about our services</CardDescription>
              </CardHeader>
              <CardContent>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review: any) => (
                      <Card key={review.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.rating
                                          ? 'text-yellow-500 fill-yellow-500'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm font-semibold">{review.title}</span>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                {review.userName} • {new Date(review.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            {review.isVerified && (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 dark:text-gray-400">{review.review}</p>
                          {review.vendorResponse && (
                            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <p className="text-sm font-semibold mb-1">Response from {vendor.businessName}:</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{review.vendorResponse}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No reviews yet. Be the first to review!</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Get in touch with us</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                    <a href={`tel:${vendor.primaryContactPhone}`} className="font-semibold hover:text-blue-600">
                      {vendor.primaryContactPhone}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <a href={`mailto:${vendor.primaryContactEmail}`} className="font-semibold hover:text-blue-600">
                      {vendor.primaryContactEmail}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                    <p className="font-semibold">{vendor.businessCity}, {vendor.businessState}</p>
                  </div>
                </div>

                {vendor.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Website</p>
                      <a 
                        href={vendor.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-semibold hover:text-blue-600"
                      >
                        {vendor.website}
                      </a>
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <Button 
                    onClick={handleContact} 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}