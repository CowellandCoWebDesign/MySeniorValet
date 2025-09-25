import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Phone, Mail, Globe, MapPin, Star, Calendar, MessageSquare, 
         Building, CheckCircle, Sparkles, Clock, DollarSign, Shield, Award, 
         TrendingUp, Users, Truck, Package, Briefcase, Info, ExternalLink, 
         Loader2, Search, Camera, Heart, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { NavigationHeader } from "@/components/NavigationHeader";
import { BreadcrumbNavigation } from "@/components/BreadcrumbNavigation";
import { LiveWebIntelligence } from "@/components/LiveWebIntelligence";
import { EnhancedPhotoCarousel } from "@/components/EnhancedPhotoCarousel";
import { MascotLoadingDisplay } from "@/components/MascotLoadingDisplay";
import { apiRequest } from "@/lib/queryClient";

interface ServiceProvider {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  careTypes?: string[];
  services?: string[];
  hours?: string;
  pricing?: string;
  rating?: number;
  reviews?: number;
  isDiscovered?: boolean;
  isVerified?: boolean;
  data_source?: string;
  confidence?: number;
  citations?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Service Booking Component
const ServiceBookingForm = ({ service, onSuccess }: { service: ServiceProvider, onSuccess?: () => void }) => {
  const [showBooking, setShowBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const { toast } = useToast();
  
  const bookingMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/service-bookings', data);
    },
    onSuccess: () => {
      toast({
        title: "Booking Requested!",
        description: `Your service request has been sent to ${service.name}. They will contact you shortly.`,
      });
      setShowBooking(false);
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Booking Failed",
        description: "Unable to submit your request. Please try again or contact the provider directly.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitBooking = () => {
    bookingMutation.mutate({
      serviceId: service.id,
      serviceName: service.name,
      requestedDate: selectedDate,
      requestedTime: selectedTime,
      notes,
      contactPhone: service.phone,
    });
  };

  return (
    <div className="space-y-4">
      {!showBooking ? (
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={() => setShowBooking(true)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Book This Service
          </Button>
          {service.phone && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => window.location.href = `tel:${service.phone}`}
            >
              <Phone className="w-4 h-4 mr-2" />
              Call Now
            </Button>
          )}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Request Service Booking</CardTitle>
            <CardDescription>
              Fill out this form and {service.name} will contact you to confirm
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Preferred Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-800"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Preferred Time</label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-800"
              >
                <option value="">Select a time</option>
                <option value="morning">Morning (8am-12pm)</option>
                <option value="afternoon">Afternoon (12pm-5pm)</option>
                <option value="evening">Evening (5pm-8pm)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Additional Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe what service you need, any special requirements..."
                className="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-800"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSubmitBooking}
                disabled={!selectedDate || !selectedTime || bookingMutation.isPending}
                className="flex-1"
              >
                {bookingMutation.isPending ? 'Submitting...' : 'Submit Request'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowBooking(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Web Intelligence Component for Services - Now only displays data, doesn't fetch
const ServiceWebIntelligence = ({ 
  service, 
  webData, 
  isLoading 
}: { 
  service: ServiceProvider, 
  webData: any, 
  isLoading: boolean 
}) => {
  if (!service) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          {isLoading ? `Searching for ${service.name}...` : 'Business Intelligence'}
        </CardTitle>
        <CardDescription>
          Real-time information about this business from across the web
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
          </div>
        ) : webData ? (
          <div className="space-y-4">
            {webData.description && (
              <div>
                <h4 className="font-semibold mb-2">About {service.name}</h4>
                <p className="text-gray-700 dark:text-gray-300">{webData.description}</p>
              </div>
            )}
            
            {webData.services && webData.services.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Services Offered</h4>
                <div className="flex flex-wrap gap-2">
                  {webData.services.map((service: string, idx: number) => (
                    <Badge key={idx} variant="outline">{service}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {webData.hours && (
              <div>
                <h4 className="font-semibold mb-2">Business Hours</h4>
                <p className="text-gray-700 dark:text-gray-300">{webData.hours}</p>
              </div>
            )}
            
            {webData.website && service.website !== webData.website && (
              <div>
                <h4 className="font-semibold mb-2">Website Found</h4>
                <a href={webData.website} target="_blank" rel="noopener noreferrer" 
                   className="text-blue-600 hover:underline flex items-center gap-1">
                  {webData.website}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
            
            {webData.citations && webData.citations.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Sources: {webData.citations.join(', ')}
                </p>
              </div>
            )}
          </div>
        ) : webData !== null ? (
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription>
              No additional information found. The business information above is what we currently have on file.
            </AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const [webPhotos, setWebPhotos] = useState<any[]>([]);
  const [webIntelligence, setWebIntelligence] = useState<any>(null);
  const [isLoadingIntelligence, setIsLoadingIntelligence] = useState(false);

  // Fetch service details
  const { data: service, isLoading, error } = useQuery<ServiceProvider>({
    queryKey: [`/api/services/${slug}`],
    enabled: !!slug,
  });

  // Auto-fetch web intelligence when service loads
  useEffect(() => {
    if (service && !webIntelligence && !isLoadingIntelligence) {
      fetchWebIntelligence();
    }
  }, [service]);
  
  const fetchWebIntelligence = async () => {
    if (!service?.name || !service?.city || isLoadingIntelligence) return;
    
    setIsLoadingIntelligence(true);
    
    try {
      const response = await fetch('/api/service-intelligence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceName: service.name,
          city: service.city,
          state: service.state,
          serviceType: service.careTypes?.[0] || 'service',
          website: service.website  // Pass the database website so we don't override it with Google Maps URLs
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Web Intelligence Data received:', data);
        console.log('📞 Contact Info:', data.contactInfo);
        setWebIntelligence(data);
        
        // Update photos if available
        if (data.photos && data.photos.length > 0) {
          console.log(`Found ${data.photos.length} photos for ${service.name}`);
          setWebPhotos(data.photos);
        } else {
          console.log(`No photos found for ${service.name}`);
        }
      }
    } catch (error) {
      console.error('Failed to fetch web intelligence:', error);
    } finally {
      setIsLoadingIntelligence(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
        <NavigationHeader />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading service details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
        <NavigationHeader />
        <div className="container mx-auto px-4 py-8">
          <Alert className="max-w-2xl mx-auto">
            <AlertDescription>
              Business not found. It may have been removed or the link is incorrect.
            </AlertDescription>
          </Alert>
          <div className="text-center mt-6">
            <Link href="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      <NavigationHeader />
      
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <BreadcrumbNavigation items={[
          { label: 'Home', href: '/' },
          { label: 'Services', href: '/' },
          { label: service.name, href: `/service/${service.id}` }
        ]} />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16">
        {/* Photo Carousel with Citations */}
        <div className="mb-6">
          <EnhancedPhotoCarousel
            photos={webPhotos}
            communityName={service.name}
            community={{
              name: service.name,
              photos: webPhotos,
              // Mark as already enriched if we have web photos
              enrichment_data: webPhotos.length > 0 ? { photos: webPhotos } : null,
              last_enrichment_date: webPhotos.length > 0 ? new Date().toISOString() : null
            }}
            sources={webIntelligence?.sources || []}
            photoSources={webIntelligence?.photoSources || {}}
            listingSources={webIntelligence?.listingSources || []}
            searchedPlatforms={webIntelligence?.searchedPlatforms || []}
            verificationReport={webIntelligence}
            isLoading={isLoadingIntelligence}
            showSourceIndicator={true}
          />
          
          {/* Photo Citations */}
          {webIntelligence?.citations && webIntelligence.citations.length > 0 && (
            <div className="mt-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <Info className="w-3 h-3" />
                <span>Photo sources:</span>
                <div className="flex flex-wrap gap-2">
                  {webIntelligence.citations.slice(0, 3).map((source: string, idx: number) => {
                    // Extract domain from URL for display
                    let displayName = `Source ${idx + 1}`;
                    try {
                      const url = new URL(source);
                      displayName = url.hostname.replace('www.', '');
                    } catch {}
                    
                    return (
                      <a
                        key={idx}
                        href={source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3 inline mr-1" />
                        {displayName}
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            <div className="flex-1">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-xl">
                  <Briefcase className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {service.name}
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {service.city}, {service.state} {service.country && service.country !== 'US' && `• ${service.country}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {service.isVerified && (
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {service.isDiscovered && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Recently Added
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {service.description && (
                    <p className="mt-4 text-gray-700 dark:text-gray-300">
                      {service.description}
                    </p>
                  )}

                  {/* Services/Categories */}
                  {service.careTypes && service.careTypes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {service.careTypes.map((type, idx) => (
                        <Badge key={idx} variant="secondary">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="w-full lg:w-80">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact & Booking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Use web intelligence contact info if available, fallback to service data */}
                  {(webIntelligence?.contactInfo?.phone || service.phone) ? (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <a 
                        href={`tel:${webIntelligence?.contactInfo?.phone || service.phone}`} 
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline font-medium transition-colors"
                        data-testid="button-call-service"
                      >
                        {webIntelligence?.contactInfo?.phone || service.phone}
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400">{isLoadingIntelligence ? 'Searching...' : '000-000-0000'}</span>
                    </div>
                  )}
                  {(webIntelligence?.contactInfo?.email || service.email) ? (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <a 
                        href={`mailto:${webIntelligence?.contactInfo?.email || service.email}`} 
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline font-medium truncate transition-colors"
                        data-testid="link-email-service"
                      >
                        {webIntelligence?.contactInfo?.email || service.email}
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400">info@example.com</span>
                    </div>
                  )}
                  {(webIntelligence?.contactInfo?.website || service.website) ? (
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <a 
                        href={webIntelligence?.contactInfo?.website || service.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline font-medium truncate flex items-center gap-1 transition-colors"
                        data-testid="link-website-service"
                      >
                        Visit Website
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ) : null}
                  {(webIntelligence?.contactInfo?.address || service.address) ? (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent((webIntelligence?.contactInfo?.address || service.address) + ', ' + service.city + ', ' + service.state)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
                        data-testid="link-map-address"
                      >
                        {webIntelligence?.contactInfo?.address || service.address}
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {service.address || `${service.city}, ${service.state} ${service.zipCode || ''}`.trim()}
                      </span>
                    </div>
                  )}
                  
                  <Separator className="my-4" />
                  
                  {/* Booking Form */}
                  <ServiceBookingForm service={service} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Detailed Information Tabs */}
        <Tabs defaultValue="intelligence" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="intelligence">Research</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Operating Hours</h4>
                    <p className="mt-1">{service.hours || 'Contact for hours'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Service Area</h4>
                    <p className="mt-1">{service.city}, {service.state} and surrounding areas</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Established</h4>
                    <p className="mt-1">{service.createdAt ? new Date(service.createdAt).getFullYear() : 'Recently Added'}</p>
                  </div>
                  {service.data_source && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Data Source</h4>
                      <p className="mt-1">{service.data_source}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Business Highlights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Intelligently determine highlights based on the business name and type */}
                    {(() => {
                      const businessName = service.name?.toLowerCase() || '';
                      const businessType = service.careTypes?.[0]?.toLowerCase() || '';
                      const description = service.description?.toLowerCase() || '';
                      
                      // Determine business category dynamically
                      const isLegal = businessName.includes('law') || businessName.includes('attorney') || 
                                      businessName.includes('legal') || description.includes('lawyer');
                      const isPharmacy = businessName.includes('cvs') || businessName.includes('walgreens') || 
                                        businessName.includes('pharmacy') || businessName.includes('drug');
                      const isRetail = businessName.includes('walmart') || businessName.includes('target') || 
                                      businessName.includes('mart') || businessType.includes('retail');
                      const isMoving = businessName.includes('moving') || businessName.includes('movers') || 
                                      businessName.includes('truck') || description.includes('relocation');
                      const isRestaurant = businessType.includes('food') || businessType.includes('restaurant') || 
                                          description.includes('dining') || description.includes('cuisine');
                      const isMedical = businessName.includes('clinic') || businessName.includes('medical') || 
                                       businessName.includes('health') || businessType.includes('healthcare');
                      const isAutomotive = businessName.includes('auto') || businessName.includes('car') || 
                                          businessName.includes('tire') || businessType.includes('automotive');
                      
                      // Return appropriate highlights based on detected type
                      if (isLegal) {
                        return (
                          <>
                            <div className="flex items-center gap-3">
                              <Shield className="w-5 h-5 text-blue-500" />
                              <span>Licensed legal professionals</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Award className="w-5 h-5 text-purple-500" />
                              <span>Experienced attorneys</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-green-500" />
                              <span>Confidential consultations</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Users className="w-5 h-5 text-orange-500" />
                              <span>Client-focused approach</span>
                            </div>
                          </>
                        );
                      } else if (isPharmacy) {
                        return (
                          <>
                            <div className="flex items-center gap-3">
                              <Shield className="w-5 h-5 text-blue-500" />
                              <span>Licensed pharmacy</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Clock className="w-5 h-5 text-green-500" />
                              <span>Convenient hours</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Package className="w-5 h-5 text-purple-500" />
                              <span>Prescription services</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Heart className="w-5 h-5 text-red-500" />
                              <span>Health & wellness products</span>
                            </div>
                          </>
                        );
                      } else if (isMoving) {
                        return (
                          <>
                            <div className="flex items-center gap-3">
                              <Truck className="w-5 h-5 text-blue-500" />
                              <span>Professional moving services</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Shield className="w-5 h-5 text-green-500" />
                              <span>Licensed and insured</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Users className="w-5 h-5 text-purple-500" />
                              <span>Experienced crew</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Star className="w-5 h-5 text-yellow-500" />
                              <span>Careful handling</span>
                            </div>
                          </>
                        );
                      } else if (isRetail && !isPharmacy) {
                        return (
                          <>
                            <div className="flex items-center gap-3">
                              <Package className="w-5 h-5 text-blue-500" />
                              <span>Wide product selection</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <DollarSign className="w-5 h-5 text-green-500" />
                              <span>Competitive pricing</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Clock className="w-5 h-5 text-purple-500" />
                              <span>Convenient hours</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <MapPin className="w-5 h-5 text-orange-500" />
                              <span>Easy to find location</span>
                            </div>
                          </>
                        );
                      } else if (isRestaurant) {
                        return (
                          <>
                            <div className="flex items-center gap-3">
                              <Star className="w-5 h-5 text-yellow-500" />
                              <span>Quality dining experience</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Award className="w-5 h-5 text-purple-500" />
                              <span>Fresh ingredients</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Users className="w-5 h-5 text-green-500" />
                              <span>Friendly service</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <MapPin className="w-5 h-5 text-blue-500" />
                              <span>Great location</span>
                            </div>
                          </>
                        );
                      } else if (isMedical) {
                        return (
                          <>
                            <div className="flex items-center gap-3">
                              <Shield className="w-5 h-5 text-blue-500" />
                              <span>Licensed healthcare providers</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Heart className="w-5 h-5 text-red-500" />
                              <span>Patient-centered care</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Award className="w-5 h-5 text-purple-500" />
                              <span>Experienced medical staff</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Clock className="w-5 h-5 text-green-500" />
                              <span>Flexible appointments</span>
                            </div>
                          </>
                        );
                      } else if (isAutomotive) {
                        return (
                          <>
                            <div className="flex items-center gap-3">
                              <Shield className="w-5 h-5 text-blue-500" />
                              <span>Certified technicians</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Award className="w-5 h-5 text-purple-500" />
                              <span>Quality parts & service</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <DollarSign className="w-5 h-5 text-green-500" />
                              <span>Fair pricing</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Clock className="w-5 h-5 text-orange-500" />
                              <span>Quick turnaround</span>
                            </div>
                          </>
                        );
                      } else {
                        // Generic highlights for any other business type
                        return (
                          <>
                            <div className="flex items-center gap-3">
                              <CheckCircle className="w-5 h-5 text-green-500" />
                              <span>Established local business</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Star className="w-5 h-5 text-yellow-500" />
                              <span>Quality service</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Users className="w-5 h-5 text-purple-500" />
                              <span>Customer focused</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <MapPin className="w-5 h-5 text-blue-500" />
                              <span>Convenient location</span>
                            </div>
                          </>
                        );
                      }
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Services Offered</CardTitle>
                <CardDescription>
                  Comprehensive list of services provided by {service.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {service.careTypes && service.careTypes.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {service.careTypes.map((serviceType, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">{serviceType}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    Contact {service.name} for a detailed list of services
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="intelligence">
            {/* Web Intelligence for additional research - uses already fetched data */}
            <ServiceWebIntelligence 
              service={service}
              webData={webIntelligence}
              isLoading={isLoadingIntelligence}
            />
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
                <CardDescription>
                  See what others are saying about {service.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Info className="w-4 h-4" />
                  <AlertDescription>
                    Reviews are being collected for this business. Check back soon or contact them directly for references.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Share Button */}
        <div className="fixed bottom-6 right-6">
          <Button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: service.name,
                  text: `Check out ${service.name} in ${service.city}, ${service.state}`,
                  url: window.location.href,
                });
              } else {
                // Fallback to copying link
                navigator.clipboard.writeText(window.location.href);
                toast({
                  title: "Link Copied!",
                  description: "The service link has been copied to your clipboard.",
                });
              }
            }}
            className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
          >
            <Users className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}