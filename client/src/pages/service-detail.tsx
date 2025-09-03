import React, { useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Phone, Mail, Globe, MapPin, Star, Calendar, MessageSquare, 
         Building, CheckCircle, Sparkles, Clock, DollarSign, Shield, Award, 
         TrendingUp, Users, Truck, Package, Briefcase, Info, ExternalLink } from 'lucide-react';
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
import { FamilyShareButton } from "@/components/family-share-button";
import { MessageCommunityButton } from "@/components/message-community-button";
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

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();

  // Fetch service details
  const { data: service, isLoading, error } = useQuery<ServiceProvider>({
    queryKey: [`/api/services/${slug}`],
    enabled: !!slug,
  });

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
              Service provider not found. It may have been removed or the link is incorrect.
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
        <BreadcrumbNavigation />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16">
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
                  {service.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <a href={`tel:${service.phone}`} className="text-blue-600 hover:underline">
                        {service.phone}
                      </a>
                    </div>
                  )}
                  {service.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <a href={`mailto:${service.email}`} className="text-blue-600 hover:underline truncate">
                        {service.email}
                      </a>
                    </div>
                  )}
                  {service.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <a href={service.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                        Visit Website
                      </a>
                    </div>
                  )}
                  {service.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                      <span className="text-sm">{service.address}</span>
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
        <Tabs defaultValue="overview" className="space-y-6">
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
                  <CardTitle>Why Choose This Provider</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Specialized in senior services</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-blue-500" />
                      <span>Licensed and insured</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-purple-500" />
                      <span>Experienced professionals</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-orange-500" />
                      <span>Senior-friendly approach</span>
                    </div>
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
            {/* Live Web Intelligence for additional research */}
            <LiveWebIntelligence 
              communityName={service.name}
              city={service.city || ''}
              state={service.state || ''}
              forceRefresh={false}
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
                    Reviews are being collected for this service provider. Check back soon or contact them directly for references.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Share and Message Buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3">
          <FamilyShareButton 
            communityId={service.id}
            communityName={service.name}
            shareType="service"
          />
          <MessageCommunityButton
            communityId={service.id}
            communityName={service.name}
          />
        </div>
      </div>
    </div>
  );
}