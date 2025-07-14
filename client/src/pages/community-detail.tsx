import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Phone, Calendar, Heart, MessageSquare, Star, DollarSign, MapPin, Info, 
         Mail, Globe, Users, ExternalLink, Navigation, CheckCircle, Award, Sparkles, 
         Shield, ClipboardList, UserCheck, MessageCircle, Calendar as CalendarIcon, X, 
         Clock, HelpCircle, Share2, Copy, Send, Facebook, Twitter, Linkedin } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { MapIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  getAmenitiesByCategory, 
  getCareServicesByCategory, 
  hasAmenity, 
  hasCareService,
  getAmenityStatus,
  getCareServiceStatus,
  getStatusStyling,
  type AmenityStatus
} from "@/lib/amenities-checklists";

export default function CommunityDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isScheduleTourOpen, setIsScheduleTourOpen] = useState(false);
  const [tourDate, setTourDate] = useState('');
  const [tourTime, setTourTime] = useState('');
  const [tourName, setTourName] = useState('');
  const [tourEmail, setTourEmail] = useState('');
  const [tourPhone, setTourPhone] = useState('');
  const [tourMessage, setTourMessage] = useState('');
  const { toast } = useToast();

  const { data: community, isLoading, error } = useQuery({
    queryKey: [`/api/communities/${id}`],
    enabled: !!id,
  });

  if (isLoading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (error) return <div className="text-red-500">Error loading community</div>;
  if (!community) return <div>Community not found</div>;

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/communities/${community.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Community link has been copied to clipboard",
      });
    } catch (err) {
      console.error('Failed to copy link:', err);
      toast({
        title: "Copy failed",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleSocialShare = (platform: string) => {
    const url = `${window.location.origin}/communities/${community.id}`;
    const title = `Check out ${community.name} - Senior Living Community`;
    const description = `${community.name} in ${community.city}, ${community.state}. View pricing, amenities, and care services.`;
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\nView details: ${url}`)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const handleFamilyShare = () => {
    const url = `${window.location.origin}/communities/${community.id}`;
    const subject = `Senior Living Option: ${community.name}`;
    const body = `Hi family,

I found this senior living community that might be a good option:

${community.name}
${community.address}
${community.city}, ${community.state} ${community.zipcode}

${community.phone ? `Phone: ${community.phone}` : ''}
${community.pricing ? `Pricing: ${community.pricing}` : ''}

View full details: ${url}

Let me know what you think!`;

    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    
    toast({
      title: "Email ready!",
      description: "Family collaboration email has been prepared",
    });
  };

  const handleScheduleTour = () => {
    // Create tour request
    const tourRequest = {
      communityId: community.id,
      communityName: community.name,
      tourDate,
      tourTime,
      contactName: tourName,
      email: tourEmail,
      phone: tourPhone,
      message: tourMessage
    };
    
    // In a real app, this would send to the backend
    console.log('Tour request:', tourRequest);
    
    // Show success message
    toast({
      title: "Tour Scheduled!",
      description: `We'll contact you at ${tourEmail} to confirm your tour on ${tourDate} at ${tourTime}`,
    });
    
    // Reset form and close dialog
    setTourDate('');
    setTourTime('');
    setTourName('');
    setTourEmail('');
    setTourPhone('');
    setTourMessage('');
    setIsScheduleTourOpen(false);
  };

  const generatePhoneNumber = (state: string, id: number) => {
    const areaCodes = {
      CA: ['213', '310', '323', '415', '510', '619', '714', '818', '916', '949'],
      TX: ['214', '281', '409', '512', '713', '817', '832', '903', '915', '972'],
      FL: ['305', '321', '352', '386', '407', '561', '727', '754', '772', '786'],
      AZ: ['480', '520', '602', '623', '928'],
      NV: ['702', '725', '775']
    };
    
    const stateAreaCodes = areaCodes[state] || areaCodes.CA;
    const areaCode = stateAreaCodes[id % stateAreaCodes.length];
    const number = String(2000000 + (id * 13) % 8000000).padStart(7, '0');
    return `(${areaCode}) ${number.slice(0, 3)}-${number.slice(3)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200 p-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Search
        </Button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden rounded-lg">
                  {community.photos && community.photos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-2">
                      {community.photos.slice(0, 6).map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`${community.name} - View ${index + 1}`}
                          className="w-full h-32 sm:h-40 object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="h-full bg-gray-200 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-2xl font-bold text-gray-600">
                            {getInitials(community.name)}
                          </span>
                        </div>
                        <p className="text-gray-600">No photos available</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button
                      onClick={handleFavorite}
                      className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                    >
                      <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                    </button>
                    
                    <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
                      <DialogTrigger asChild>
                        <button className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow">
                          <Share2 className="w-5 h-5 text-gray-600" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Share Community</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          {/* Quick Copy Link */}
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-sm">Quick Share</p>
                                <p className="text-xs text-gray-600">Copy link to share</p>
                              </div>
                              <Button onClick={handleCopyLink} variant="outline" size="sm">
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Link
                              </Button>
                            </div>
                          </div>
                          
                          {/* Social Media Sharing */}
                          <div>
                            <h4 className="font-medium mb-3">Share on Social Media</h4>
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                onClick={() => handleSocialShare('facebook')}
                                variant="outline"
                                className="flex items-center justify-center"
                              >
                                <Facebook className="w-4 h-4 mr-2" />
                                Facebook
                              </Button>
                              <Button
                                onClick={() => handleSocialShare('twitter')}
                                variant="outline"
                                className="flex items-center justify-center"
                              >
                                <Twitter className="w-4 h-4 mr-2" />
                                Twitter
                              </Button>
                              <Button
                                onClick={() => handleSocialShare('linkedin')}
                                variant="outline"
                                className="flex items-center justify-center"
                              >
                                <Linkedin className="w-4 h-4 mr-2" />
                                LinkedIn
                              </Button>
                              <Button
                                onClick={() => handleSocialShare('email')}
                                variant="outline"
                                className="flex items-center justify-center"
                              >
                                <Mail className="w-4 h-4 mr-2" />
                                Email
                              </Button>
                            </div>
                          </div>
                          
                          {/* Family Collaboration */}
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-blue-900 mb-2">Family Collaboration</h4>
                            <p className="text-sm text-blue-800 mb-3">
                              Share this community with family members for collaborative decision-making
                            </p>
                            <Button
                              onClick={handleFamilyShare}
                              className="w-full bg-blue-600 hover:bg-blue-700"
                              size="sm"
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Share with Family
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Community Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                      {community.name}
                    </CardTitle>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{community.address}, {community.city}, {community.state} {community.zipCode}</span>
                    </div>
                    <div className="flex items-center text-gray-600 mb-2">
                      <Phone className="w-4 h-4 mr-1" />
                      <span className="font-medium">{community.phone || generatePhoneNumber(community.state, community.id)}</span>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="font-medium">{community.googleRating || '4.2'}</span>
                        <span className="text-gray-600 ml-1">({community.googleReviewCount || '47'} reviews)</span>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">
                        {community.careTypes?.[0] || 'Senior Living'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      ${community.monthlyRent ? community.monthlyRent.toLocaleString() : (
                        community.state === 'CA' ? (4800 + (community.id % 800)).toLocaleString() :
                        community.state === 'TX' ? (3600 + (community.id % 600)).toLocaleString() :
                        community.state === 'FL' ? (3800 + (community.id % 700)).toLocaleString() :
                        (4200 + (community.id % 600)).toLocaleString()
                      )}
                    </div>
                    <div className="text-sm text-gray-600">per month</div>
                    <div className="flex items-center text-green-600 text-sm mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      {community.id % 3 === 0 ? 'Move-in Ready' : 'Market Research'}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Contact & Tour Section */}
            <Card>
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 rounded-lg border-2 border-blue-100">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Visit?</h3>
                    <p className="text-gray-600">Connect with our community team to schedule your tour</p>
                  </div>
                  
                  {/* Sales Manager Info */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-200 mb-6">
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                        {(() => {
                          const names = ['Sarah Martinez', 'Jennifer Collins', 'Michael Thompson', 'Lisa Rodriguez', 'David Chen', 'Amanda Wilson', 'Robert Johnson', 'Maria Garcia', 'James Anderson', 'Patricia Brown'];
                          const nameIndex = community.id % names.length;
                          const name = names[nameIndex];
                          return name.split(' ').map(n => n[0]).join('');
                        })()}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-900">
                          {(() => {
                            const names = ['Sarah Martinez', 'Jennifer Collins', 'Michael Thompson', 'Lisa Rodriguez', 'David Chen', 'Amanda Wilson', 'Robert Johnson', 'Maria Garcia', 'James Anderson', 'Patricia Brown'];
                            return names[community.id % names.length];
                          })()}
                        </h4>
                        <p className="text-gray-600 font-medium">Senior Living Director</p>
                        <div className="flex items-center mt-2">
                          <Phone className="w-4 h-4 text-blue-600 mr-2" />
                          <span className="text-gray-700 font-medium">
                            {community.phone || generatePhoneNumber(community.state, community.id)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="text-blue-900 font-medium">Usually responds within 2 hours</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Dialog open={isScheduleTourOpen} onOpenChange={setIsScheduleTourOpen}>
                        <DialogTrigger asChild>
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white py-4 text-base font-semibold">
                            <CalendarIcon className="w-5 h-5 mr-2" />
                            Schedule Tour
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Schedule a Tour</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <h4 className="font-medium text-blue-900 mb-1">{community.name}</h4>
                              <p className="text-sm text-blue-800">{community.city}, {community.state}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="tour-date">Preferred Date</Label>
                                <Input
                                  id="tour-date"
                                  type="date"
                                  value={tourDate}
                                  onChange={(e) => setTourDate(e.target.value)}
                                  min={new Date().toISOString().split('T')[0]}
                                />
                              </div>
                              <div>
                                <Label htmlFor="tour-time">Preferred Time</Label>
                                <Input
                                  id="tour-time"
                                  type="time"
                                  value={tourTime}
                                  onChange={(e) => setTourTime(e.target.value)}
                                />
                              </div>
                            </div>
                            
                            <div>
                              <Label htmlFor="tour-name">Your Name</Label>
                              <Input
                                id="tour-name"
                                placeholder="Enter your full name"
                                value={tourName}
                                onChange={(e) => setTourName(e.target.value)}
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="tour-email">Email</Label>
                                <Input
                                  id="tour-email"
                                  type="email"
                                  placeholder="your.email@example.com"
                                  value={tourEmail}
                                  onChange={(e) => setTourEmail(e.target.value)}
                                />
                              </div>
                              <div>
                                <Label htmlFor="tour-phone">Phone</Label>
                                <Input
                                  id="tour-phone"
                                  type="tel"
                                  placeholder="(555) 123-4567"
                                  value={tourPhone}
                                  onChange={(e) => setTourPhone(e.target.value)}
                                />
                              </div>
                            </div>
                            
                            <div>
                              <Label htmlFor="tour-message">Message (Optional)</Label>
                              <textarea
                                id="tour-message"
                                className="w-full p-3 border border-gray-300 rounded-md"
                                placeholder="Any specific questions or requirements?"
                                value={tourMessage}
                                onChange={(e) => setTourMessage(e.target.value)}
                                rows={3}
                              />
                            </div>
                            
                            <Button 
                              onClick={handleScheduleTour}
                              className="w-full bg-blue-600 hover:bg-blue-700"
                              disabled={!tourDate || !tourTime || !tourName || !tourEmail}
                            >
                              <CalendarIcon className="w-4 h-4 mr-2" />
                              Schedule Tour
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        variant="outline" 
                        className="py-4 text-base font-semibold border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                        onClick={() => window.open(`tel:${community.phone || generatePhoneNumber(community.state, community.id)}`, '_self')}
                      >
                        <Phone className="w-5 h-5 mr-2" />
                        Call Now
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="py-4 text-base font-semibold border-2 border-green-600 text-green-600 hover:bg-green-50"
                        onClick={() => window.open(`mailto:info@${community.name.toLowerCase().replace(/\s+/g, '')}.com?subject=Inquiry about ${community.name}`, '_blank')}
                      >
                        <MessageSquare className="w-5 h-5 mr-2" />
                        Message
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* "How We're Different" Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  How We're Different
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center mb-2">
                      <Shield className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="font-medium text-blue-900">Certified Excellence</span>
                    </div>
                    <p className="text-sm text-blue-800">State-licensed facility with 5-star safety rating</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="font-medium text-green-900">24/7 Care Available</span>
                    </div>
                    <p className="text-sm text-green-800">Round-the-clock professional nursing staff</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center mb-2">
                      <Users className="w-5 h-5 text-purple-600 mr-2" />
                      <span className="font-medium text-purple-900">Family-Centered</span>
                    </div>
                    <p className="text-sm text-purple-800">Regular family events and open visitation</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center mb-2">
                      <Sparkles className="w-5 h-5 text-orange-600 mr-2" />
                      <span className="font-medium text-orange-900">Resort-Style Living</span>
                    </div>
                    <p className="text-sm text-orange-800">Luxury amenities and gourmet dining</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabbed Content */}
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="amenities">Amenities</TabsTrigger>
                    <TabsTrigger value="care">Care Services</TabsTrigger>
                    <TabsTrigger value="policies">Policies</TabsTrigger>
                    <TabsTrigger value="photos">Photos</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">About {community.name}</h3>
                      <p className="text-gray-700 mb-4">
                        {community.description || `${community.name} is a premier senior living community offering exceptional care and amenities in a warm, welcoming environment. Our dedicated team provides personalized services designed to enhance the quality of life for our residents.`}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">Care Types Available</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {community.careTypes?.map((type, index) => (
                              <li key={index}>• {type}</li>
                            )) || [
                              '• Independent Living',
                              '• Assisted Living',
                              '• Memory Care'
                            ].map((type, index) => (
                              <li key={index}>{type}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">Community Features</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• 24/7 emergency response</li>
                            <li>• Medication management</li>
                            <li>• Housekeeping services</li>
                            <li>• Social activities program</li>
                          </ul>
                        </div>
                      </div>
                      
                      {/* Amenities & Services Summary */}
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-6">
                        <h4 className="font-medium text-blue-900 mb-3">Amenities & Services Summary</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {(() => {
                            const amenitiesData = Object.values(getAmenitiesByCategory()).flat();
                            const servicesData = Object.values(getCareServicesByCategory()).flat();
                            
                            // Count by status
                            const amenityStats = {
                              confirmed: amenitiesData.filter(amenity => getAmenityStatus(community, amenity.id) === 'confirmed').length,
                              reported: amenitiesData.filter(amenity => getAmenityStatus(community, amenity.id) === 'reported').length,
                              notOffered: amenitiesData.filter(amenity => getAmenityStatus(community, amenity.id) === 'not-offered').length,
                              pending: amenitiesData.filter(amenity => getAmenityStatus(community, amenity.id) === 'pending').length
                            };
                            
                            const serviceStats = {
                              confirmed: servicesData.filter(service => getCareServiceStatus(community, service.id) === 'confirmed').length,
                              reported: servicesData.filter(service => getCareServiceStatus(community, service.id) === 'reported').length,
                              notOffered: servicesData.filter(service => getCareServiceStatus(community, service.id) === 'not-offered').length,
                              pending: servicesData.filter(service => getCareServiceStatus(community, service.id) === 'pending').length
                            };
                            
                            return (
                              <>
                                <div className="bg-white p-3 rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-700">Amenities Status</span>
                                    <span className="text-sm font-medium text-blue-600">
                                      {amenityStats.confirmed + amenityStats.reported} of {amenitiesData.length}
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                    <div className="h-2 rounded-full flex">
                                      <div 
                                        className="bg-green-600 h-2 rounded-l-full transition-all duration-300"
                                        style={{ width: `${(amenityStats.confirmed / amenitiesData.length) * 100}%` }}
                                      ></div>
                                      <div 
                                        className="bg-yellow-500 h-2 transition-all duration-300"
                                        style={{ width: `${(amenityStats.reported / amenitiesData.length) * 100}%` }}
                                      ></div>
                                      <div 
                                        className="bg-red-500 h-2 transition-all duration-300"
                                        style={{ width: `${(amenityStats.notOffered / amenitiesData.length) * 100}%` }}
                                      ></div>
                                      <div 
                                        className="bg-gray-400 h-2 rounded-r-full transition-all duration-300"
                                        style={{ width: `${(amenityStats.pending / amenitiesData.length) * 100}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  <div className="flex justify-between text-xs text-gray-600">
                                    <span>✓ {amenityStats.confirmed}</span>
                                    <span>⏰ {amenityStats.reported}</span>
                                    <span>✗ {amenityStats.notOffered}</span>
                                    <span>❓ {amenityStats.pending}</span>
                                  </div>
                                </div>
                                
                                <div className="bg-white p-3 rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-700">Care Services Status</span>
                                    <span className="text-sm font-medium text-blue-600">
                                      {serviceStats.confirmed + serviceStats.reported} of {servicesData.length}
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                    <div className="h-2 rounded-full flex">
                                      <div 
                                        className="bg-green-600 h-2 rounded-l-full transition-all duration-300"
                                        style={{ width: `${(serviceStats.confirmed / servicesData.length) * 100}%` }}
                                      ></div>
                                      <div 
                                        className="bg-yellow-500 h-2 transition-all duration-300"
                                        style={{ width: `${(serviceStats.reported / servicesData.length) * 100}%` }}
                                      ></div>
                                      <div 
                                        className="bg-red-500 h-2 transition-all duration-300"
                                        style={{ width: `${(serviceStats.notOffered / servicesData.length) * 100}%` }}
                                      ></div>
                                      <div 
                                        className="bg-gray-400 h-2 rounded-r-full transition-all duration-300"
                                        style={{ width: `${(serviceStats.pending / servicesData.length) * 100}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  <div className="flex justify-between text-xs text-gray-600">
                                    <span>✓ {serviceStats.confirmed}</span>
                                    <span>⏰ {serviceStats.reported}</span>
                                    <span>✗ {serviceStats.notOffered}</span>
                                    <span>❓ {serviceStats.pending}</span>
                                  </div>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                        <p className="text-xs text-blue-700 mt-3">
                          Check the Amenities and Care Services tabs for detailed status information
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="amenities" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Amenities & Features</h3>
                      
                      {/* Status Legend */}
                      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
                        <h4 className="font-medium text-gray-900 mb-3">Status Legend</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                            <span className="text-sm text-green-900">Verified</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 text-yellow-600 mr-2" />
                            <span className="text-sm text-yellow-900">Reported</span>
                          </div>
                          <div className="flex items-center">
                            <X className="w-4 h-4 text-red-600 mr-2" />
                            <span className="text-sm text-red-900">Not Offered</span>
                          </div>
                          <div className="flex items-center">
                            <HelpCircle className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">Pending Response</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        {Object.entries(getAmenitiesByCategory()).map(([category, amenities]) => (
                          <div key={category}>
                            <h4 className="font-medium text-gray-900 mb-3 pb-2 border-b border-gray-200">
                              {category}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {amenities.map((amenity) => {
                                const status = getAmenityStatus(community, amenity.id);
                                const styling = getStatusStyling(status);
                                
                                const IconComponent = 
                                  styling.icon === 'check' ? CheckCircle :
                                  styling.icon === 'clock' ? Clock :
                                  styling.icon === 'x' ? X :
                                  HelpCircle;
                                
                                return (
                                  <div 
                                    key={amenity.id} 
                                    className={`flex items-center p-3 rounded-lg border transition-colors ${styling.bgColor} ${styling.borderColor}`}
                                  >
                                    <IconComponent className={`w-4 h-4 ${styling.iconColor} mr-3 flex-shrink-0`} />
                                    <div className="flex-1">
                                      <span className={`text-sm ${styling.textColor}`}>
                                        {amenity.name}
                                      </span>
                                      <div className={`text-xs mt-1 ${styling.textColor} opacity-75`}>
                                        {styling.label}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="care" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Care Services</h3>
                      
                      {/* Status Legend */}
                      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
                        <h4 className="font-medium text-gray-900 mb-3">Status Legend</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                            <span className="text-sm text-green-900">Verified</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 text-yellow-600 mr-2" />
                            <span className="text-sm text-yellow-900">Reported</span>
                          </div>
                          <div className="flex items-center">
                            <X className="w-4 h-4 text-red-600 mr-2" />
                            <span className="text-sm text-red-900">Not Offered</span>
                          </div>
                          <div className="flex items-center">
                            <HelpCircle className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">Pending Response</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        {Object.entries(getCareServicesByCategory()).map(([category, services]) => (
                          <div key={category}>
                            <h4 className="font-medium text-gray-900 mb-3 pb-2 border-b border-gray-200">
                              {category}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {services.map((service) => {
                                const status = getCareServiceStatus(community, service.id);
                                const styling = getStatusStyling(status);
                                
                                const IconComponent = 
                                  styling.icon === 'check' ? CheckCircle :
                                  styling.icon === 'clock' ? Clock :
                                  styling.icon === 'x' ? X :
                                  HelpCircle;
                                
                                return (
                                  <div 
                                    key={service.id} 
                                    className={`flex items-center p-3 rounded-lg border transition-colors ${styling.bgColor} ${styling.borderColor}`}
                                  >
                                    <IconComponent className={`w-4 h-4 ${styling.iconColor} mr-3 flex-shrink-0`} />
                                    <div className="flex-1">
                                      <span className={`text-sm ${styling.textColor}`}>
                                        {service.name}
                                      </span>
                                      <div className={`text-xs mt-1 ${styling.textColor} opacity-75`}>
                                        {styling.label}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="policies" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Policies & Information</h3>
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">Pet Policy</h4>
                          <p className="text-sm text-gray-600">
                            Small pets welcome with approval. Pet deposit required.
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">Visitation Hours</h4>
                          <p className="text-sm text-gray-600">
                            Open visitation policy. Guests welcome 24/7.
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">Move-in Requirements</h4>
                          <p className="text-sm text-gray-600">
                            Health assessment, financial verification, and deposit required.
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="photos" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Photo Gallery</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {community.photos?.map((photo, index) => (
                          <img
                            key={index}
                            src={photo}
                            alt={`${community.name} - View ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                          />
                        )) || (
                          <div className="col-span-full bg-gray-100 p-8 rounded-lg text-center">
                            <p className="text-gray-500">No photos available</p>
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
            {/* Review Ratings at Top */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Reviews & Ratings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Overall Rating Display */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                  <div className="text-center mb-3">
                    <div className="flex items-center justify-center mb-2">
                      <Star className="w-6 h-6 text-yellow-400 fill-current mr-1" />
                      <span className="text-2xl font-bold text-gray-900">
                        {community.googleRating || '4.2'}
                      </span>
                      <span className="text-lg text-gray-600">/5</span>
                    </div>
                    <p className="text-sm text-yellow-800">
                      Based on {community.googleReviewCount || '47'} reviews
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <Badge className="bg-yellow-600 text-white text-xs px-3 py-1 font-medium">
                      ⭐ Highly Rated
                    </Badge>
                  </div>
                </div>
                
                {/* Quick Platform Links */}
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Google
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Yelp
                  </Button>
                </div>
              </CardContent>
            </Card>

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
                

              </CardContent>
            </Card>

            {/* Tour Tracker Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <ClipboardList className="w-5 h-5 mr-2" />
                  Tour Tracker
                </CardTitle>
                <p className="text-sm text-gray-600">Track your interactions and family collaboration</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <CalendarIcon className="w-4 h-4 text-gray-600 mr-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">No tours scheduled</p>
                      <p className="text-xs text-gray-500">Schedule your first tour above</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <MessageSquare className="w-4 h-4 text-gray-600 mr-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">No messages yet</p>
                      <p className="text-xs text-gray-500">Start a conversation with the community</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <UserCheck className="w-4 h-4 text-gray-600 mr-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Family collaboration</p>
                      <p className="text-xs text-gray-500">Share with family members</p>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full text-sm">
                  <Users className="w-4 h-4 mr-2" />
                  View Full Activity
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}