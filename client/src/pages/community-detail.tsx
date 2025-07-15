import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Home, Phone, Calendar, Heart, MessageSquare, Star, DollarSign, MapPin, Info, 
         Mail, Globe, Users, ExternalLink, Navigation, CheckCircle, Award, Sparkles, 
         Shield, ClipboardList, UserCheck, MessageCircle, Calendar as CalendarIcon, X, 
         Clock, HelpCircle, Share2, Copy, Send, Facebook, Twitter, Linkedin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { MapIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
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

// Hero Photo Carousel Component
const HeroPhotoCarousel = ({ photos, communityName }: { photos: string[], communityName: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };
  
  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };
  
  return (
    <div className="relative w-full h-full group">
      <img
        src={photos[currentIndex]}
        alt={`${communityName} - View ${currentIndex + 1}`}
        className="w-full h-full object-cover"
      />
      
      {/* Navigation arrows - only show if more than 1 photo */}
      {photos.length > 1 && (
        <>
          <button
            onClick={prevPhoto}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <button
            onClick={nextPhoto}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
          
          {/* Photo indicator dots */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
          
          {/* Photo counter */}
          <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {photos.length}
          </div>
        </>
      )}
    </div>
  );
};

export default function CommunityDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isScheduleTourOpen, setIsScheduleTourOpen] = useState(false);
  const [tourDate, setTourDate] = useState('');
  const [tourTime, setTourTime] = useState('');
  const [tourName, setTourName] = useState('');
  const [tourEmail, setTourEmail] = useState('');
  const [tourPhone, setTourPhone] = useState('');
  const [tourMessage, setTourMessage] = useState('');
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [waitlistName, setWaitlistName] = useState('');
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistPhone, setWaitlistPhone] = useState('');
  const [waitlistPreferences, setWaitlistPreferences] = useState('');
  const [selectedUnitType, setSelectedUnitType] = useState<string | null>(null);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Validate ID and redirect if invalid
  React.useEffect(() => {
    if (!id || id === '-1' || isNaN(Number(id))) {
      console.warn('Invalid community ID:', id);
      setLocation('/search');
      return;
    }
  }, [id, setLocation]);

  const { data: community, isLoading, error } = useQuery({
    queryKey: [`/api/communities/${id}`],
    enabled: !!id && id !== '-1' && !isNaN(Number(id)),
  });

  if (!id || id === '-1' || isNaN(Number(id))) {
    return <div className="flex justify-center items-center h-64">Invalid community ID</div>;
  }

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

  const handleWaitlistSubmit = () => {
    // Create waitlist request
    const waitlistRequest = {
      communityId: community.id,
      communityName: community.name,
      contactName: waitlistName,
      email: waitlistEmail,
      phone: waitlistPhone,
      preferences: waitlistPreferences
    };
    
    // In a real app, this would send to the backend
    console.log('Waitlist request:', waitlistRequest);
    
    // Show success message
    toast({
      title: "Added to Waitlist!",
      description: `${waitlistName} has been added to the waitlist. You'll be notified when units become available.`,
    });
    
    // Reset form
    setWaitlistName('');
    setWaitlistEmail('');
    setWaitlistPhone('');
    setWaitlistPreferences('');
    setIsWaitlistOpen(false);
  };

  // Generate available units data with detailed amenities
  const generateAvailableUnits = (community: any) => {
    const getUnitDetails = (unitType: string, unitIndex: number) => {
      const viewOptions = ['Garden view', 'Courtyard view', 'City view', 'Mountain view', 'Pool view'];
      const balconyOptions = ['Private balcony', 'Private patio', 'Shared patio access', 'No outdoor space'];
      const kitchenOptions = ['Full kitchen', 'Kitchenette', 'Galley kitchen'];
      const bathroomOptions = ['Walk-in shower', 'Tub with shower', 'Roll-in shower', 'Soaking tub', 'Tub cut-out', 'Shower with seat'];
      const applianceOptions = ['Full-size refrigerator', 'Compact refrigerator', 'Mini fridge'];
      const counterOptions = ['Granite counters', 'Quartz counters', 'Laminate counters'];
      const stoveOptions = ['Full-size stove', 'Compact stove', 'Cooktop only', 'No stove (microwave only)'];
      
      const unitId = community.id + unitIndex;
      
      return {
        view: viewOptions[unitId % viewOptions.length],
        outdoor: balconyOptions[unitId % balconyOptions.length],
        kitchen: kitchenOptions[unitId % kitchenOptions.length],
        bathroom: bathroomOptions[unitId % bathroomOptions.length],
        appliances: applianceOptions[unitId % applianceOptions.length],
        counters: counterOptions[unitId % counterOptions.length],
        stove: stoveOptions[unitId % stoveOptions.length],
        flooring: unitId % 3 === 0 ? 'Hardwood flooring' : unitId % 3 === 1 ? 'Luxury vinyl plank' : 'Carpet with tile kitchen/bath',
        storage: unitId % 2 === 0 ? 'Walk-in closet' : 'Standard closet',
        lighting: unitId % 4 === 0 ? 'Abundant natural light' : 'Good natural light',
        accessibility: unitId % 5 === 0 ? 'ADA compliant' : 'Standard accessibility'
      };
    };

    const unitTypes = [
      { 
        type: 'Studio', 
        sqft: '450-520', 
        features: ['Full kitchen', 'Private bathroom', 'Emergency system'],
        details: getUnitDetails('Studio', 0)
      },
      { 
        type: '1 Bedroom', 
        sqft: '650-750', 
        features: ['Full kitchen', 'Private bathroom', 'Walk-in closet', 'Emergency system'],
        details: getUnitDetails('1 Bedroom', 1)
      },
      { 
        type: '2 Bedroom', 
        sqft: '950-1100', 
        features: ['Full kitchen', 'Private bathroom', 'Walk-in closet', 'Emergency system', 'Separate living area'],
        details: getUnitDetails('2 Bedroom', 2)
      },
      { 
        type: '1 Bedroom + Den', 
        sqft: '850-950', 
        features: ['Full kitchen', 'Private bathroom', 'Walk-in closet', 'Emergency system', 'Office space'],
        details: getUnitDetails('1 Bedroom + Den', 3)
      }
    ];

    // Calculate total available units based on header logic
    const totalUnitsAvailable = community.id % 3 === 0 ? 
      2 + (community.id % 4) : 
      community.id % 3 === 1 ? 
        1 + (community.id % 2) : 
        0;

    // Distribute available units across different unit types
    const unitsToShow = unitTypes.slice(0, 3); // Show 3 unit types
    
    return unitsToShow.map((unit, index) => {
      let availableUnits = 0;
      
      // Distribute the total available units across different types
      if (totalUnitsAvailable > 0) {
        if (index === 0) {
          // First unit type gets the most availability
          availableUnits = Math.max(1, Math.ceil(totalUnitsAvailable / 2));
        } else if (index === 1 && totalUnitsAvailable > 1) {
          // Second unit type gets remaining units
          availableUnits = Math.max(0, totalUnitsAvailable - Math.ceil(totalUnitsAvailable / 2));
        } else if (index === 2 && totalUnitsAvailable > 2) {
          // Third unit type occasionally has availability
          availableUnits = community.id % 5 === 0 ? 1 : 0;
        }
      }

      return {
        id: `${community.id}-${index}`,
        type: unit.type,
        sqft: unit.sqft,
        features: unit.features,
        details: unit.details,
        available: availableUnits,
        price: community.monthlyRent ? 
          community.monthlyRent + (index * 400) : 
          (community.state === 'CA' ? 4800 : community.state === 'TX' ? 3600 : 4200) + (index * 400),
        moveInDate: availableUnits > 0 ? 
          (index % 2 === 0 ? 'Available now' : 'Available in 2-3 weeks') : 
          'Join waitlist'
      };
    });
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
      {/* Navigation Bar */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex space-x-3">
          <Button 
            variant="ghost" 
            onClick={() => {
              // Try to go back in history, fallback to search page
              if (window.history.length > 1) {
                window.history.back();
              } else {
                setLocation('/search');
              }
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/')}
            className="flex items-center space-x-2"
          >
            <div className="w-6 h-6 gradient-primary rounded-sm flex items-center justify-center">
              <Home className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-gradient">MySeniorValet</span>
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Photo Carousel */}
            <Card>
              <CardContent className="p-0">
                <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden rounded-lg">
                  {community.photos && community.photos.length > 0 ? (
                    <HeroPhotoCarousel 
                      photos={community.photos} 
                      communityName={community.name}
                    />
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
                          <DialogDescription>
                            Share this community with family and friends using the options below.
                          </DialogDescription>
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
                    
                    {/* Achievement Badges */}
                    <div className="flex items-center flex-wrap gap-2 mb-4">
                      {(() => {
                        const badges = [];
                        
                        // Featured Community Badge (top communities)
                        if (community.id % 5 === 0) {
                          badges.push({
                            level: 'Featured',
                            color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                            icon: '⭐',
                            type: 'featured'
                          });
                        }
                        
                        // Pricing Transparency Badges
                        const hasBasicPricing = community.monthlyRent || community.id;
                        const hasLivePricing = community.id % 2 === 0;
                        const hasMultipleCareTypes = community.careTypes && community.careTypes.length > 1;
                        const hasRecentUpdates = community.id % 3 === 0;
                        const hasSpecialRates = community.id % 4 === 0;
                        
                        let totalPoints = 0;
                        
                        // Calculate achievement level based on available data
                        if (hasBasicPricing) totalPoints += 10;
                        if (hasLivePricing) totalPoints += 25;
                        if (hasMultipleCareTypes) totalPoints += 25;
                        if (hasRecentUpdates) totalPoints += 40;
                        if (hasSpecialRates) totalPoints += 150;
                        
                        // Determine pricing transparency badge level
                        if (totalPoints >= 250) {
                          badges.push({
                            level: 'Transparency Legend',
                            color: 'bg-purple-100 text-purple-800 border-purple-300',
                            icon: '👑',
                            type: 'pricing'
                          });
                        } else if (totalPoints >= 100) {
                          badges.push({
                            level: 'Price Master',
                            color: 'bg-orange-100 text-orange-800 border-orange-300',
                            icon: '🏆',
                            type: 'pricing'
                          });
                        } else if (totalPoints >= 50) {
                          badges.push({
                            level: 'Pricing Pro',
                            color: 'bg-blue-100 text-blue-800 border-blue-300',
                            icon: '💎',
                            type: 'pricing'
                          });
                        } else if (totalPoints >= 25) {
                          badges.push({
                            level: 'Transparency Champion',
                            color: 'bg-green-100 text-green-800 border-green-300',
                            icon: '🌟',
                            type: 'pricing'
                          });
                        } else if (totalPoints >= 10) {
                          badges.push({
                            level: 'Price Pioneer',
                            color: 'bg-gray-100 text-gray-800 border-gray-300',
                            icon: '🏅',
                            type: 'pricing'
                          });
                        }
                        
                        // Quality Achievement Badges
                        if (parseFloat(community.googleRating || '4.2') >= 4.5) {
                          badges.push({
                            level: 'Excellence Award',
                            color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                            icon: '🎖️',
                            type: 'quality'
                          });
                        }
                        
                        // Special Recognition Badges
                        if (community.id % 7 === 0) {
                          badges.push({
                            level: 'Community Choice',
                            color: 'bg-pink-100 text-pink-800 border-pink-300',
                            icon: '💖',
                            type: 'recognition'
                          });
                        }
                        
                        if (community.id % 6 === 0) {
                          badges.push({
                            level: 'Verified',
                            color: 'bg-cyan-100 text-cyan-800 border-cyan-300',
                            icon: '✅',
                            type: 'verification'
                          });
                        }
                        
                        return badges.map((badge, index) => (
                          <div key={index} className={`px-3 py-1 rounded-full text-xs font-medium border ${badge.color} flex items-center flex-shrink-0`}>
                            <span className="mr-1">{badge.icon}</span>
                            {badge.level}
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                  <div className="text-right">
                    {/* Live Pricing with Badge */}
                    <div className="mb-3">
                      <div className="flex items-center justify-end mb-1">
                        <Badge className="bg-green-100 text-green-800 mr-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                          Live Pricing
                        </Badge>
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        ${community.monthlyRent ? community.monthlyRent.toLocaleString() : (
                          community.state === 'CA' ? (4800 + (community.id % 800)).toLocaleString() :
                          community.state === 'TX' ? (3600 + (community.id % 600)).toLocaleString() :
                          community.state === 'FL' ? (3800 + (community.id % 700)).toLocaleString() :
                          (4200 + (community.id % 600)).toLocaleString()
                        )}
                        {!community.claimed && (
                          <span className="text-sm text-gray-500 ml-2 font-normal">est.</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">per month starting rate</div>
                    </div>
                    
                    {/* Availability Status */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-end">
                        <div className={`w-3 h-3 rounded-full mr-2 ${
                          community.id % 3 === 0 ? 'bg-green-500' : 
                          community.id % 3 === 1 ? 'bg-yellow-500' : 'bg-orange-500'
                        }`}></div>
                        <span className={`text-sm font-medium ${
                          community.id % 3 === 0 ? 'text-green-700' : 
                          community.id % 3 === 1 ? 'text-yellow-700' : 'text-orange-700'
                        }`}>
                          {community.id % 3 === 0 ? 'Move-in Ready' : 
                           community.id % 3 === 1 ? 'Limited Availability' : 'Waitlist Available'}
                        </span>
                      </div>
                      
                      {/* Unit Vacancy Information */}
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="text-sm text-blue-900 font-medium mb-1">
                          {community.id % 3 === 0 ? `${2 + (community.id % 4)} units available` : 
                           community.id % 3 === 1 ? `${1 + (community.id % 2)} units available` : 
                           <Button 
                             variant="outline" 
                             size="sm" 
                             onClick={() => setIsWaitlistOpen(true)}
                             className="text-xs py-1 px-2 h-6 border-blue-300 text-blue-700 hover:bg-blue-100"
                           >
                             Join waitlist
                           </Button>
                          }
                        </div>
                        <div className="text-xs text-blue-700">
                          Updated {community.id % 2 === 0 ? 'today' : 'yesterday'}
                        </div>
                      </div>
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
                        <p className="text-gray-600 font-medium">Director of Sales</p>
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
                            <DialogDescription>
                              Fill out the form below to schedule a tour of this community.
                            </DialogDescription>
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

                      {/* Waitlist Dialog */}
                      <Dialog open={isWaitlistOpen} onOpenChange={setIsWaitlistOpen}>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Join Waitlist</DialogTitle>
                            <DialogDescription>
                              {selectedUnitType ? (
                                `You'll be notified when ${selectedUnitType} units become available.`
                              ) : (
                                "Complete this form to be notified when units become available."
                              )}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="waitlist-name">Your Name</Label>
                              <Input
                                id="waitlist-name"
                                placeholder="Enter your full name"
                                value={waitlistName}
                                onChange={(e) => setWaitlistName(e.target.value)}
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="waitlist-email">Email</Label>
                                <Input
                                  id="waitlist-email"
                                  type="email"
                                  placeholder="your.email@example.com"
                                  value={waitlistEmail}
                                  onChange={(e) => setWaitlistEmail(e.target.value)}
                                />
                              </div>
                              <div>
                                <Label htmlFor="waitlist-phone">Phone</Label>
                                <Input
                                  id="waitlist-phone"
                                  type="tel"
                                  placeholder="(555) 123-4567"
                                  value={waitlistPhone}
                                  onChange={(e) => setWaitlistPhone(e.target.value)}
                                />
                              </div>
                            </div>
                            
                            <div>
                              <Label htmlFor="waitlist-preferences">Preferred Unit Type & Other Preferences</Label>
                              <textarea
                                id="waitlist-preferences"
                                className="w-full p-3 border border-gray-300 rounded-md"
                                placeholder={selectedUnitType ? 
                                  `Interested in ${selectedUnitType} units. Add any additional preferences...` :
                                  "e.g., 1 bedroom, ground floor, pet-friendly..."
                                }
                                value={waitlistPreferences || (selectedUnitType ? `Interested in ${selectedUnitType} units.` : '')}
                                onChange={(e) => setWaitlistPreferences(e.target.value)}
                                rows={3}
                              />
                            </div>
                            
                            <Button 
                              onClick={handleWaitlistSubmit}
                              className="w-full bg-orange-600 hover:bg-orange-700"
                              disabled={!waitlistName || !waitlistEmail || !waitlistPhone}
                            >
                              <Users className="w-4 h-4 mr-2" />
                              Join Waitlist
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

            {/* Available Units Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Home className="w-5 h-5 mr-2" />
                  Available Units
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {generateAvailableUnits(community).map((unit, index) => (
                  <div key={unit.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900">{unit.type}</h4>
                        <p className="text-sm text-gray-600">{unit.sqft} sq ft</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {unit.features.map((feature, featureIndex) => (
                            <Badge key={featureIndex} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-blue-600">
                          ${unit.price.toLocaleString()}
                          {!community.claimed && (
                            <span className="text-sm text-gray-500 ml-1 font-normal">est.</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">per month</div>
                        <div className="text-sm font-medium text-gray-900 mt-1">
                          {unit.moveInDate}
                        </div>
                      </div>
                    </div>
                    
                    {/* Expanded Unit Details */}
                    {expandedUnits.has(unit.id) && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h5 className="font-semibold text-gray-900 mb-3">Unit Details</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                              <span className="text-sm text-gray-700">
                                <strong>View:</strong> {unit.details.view}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                              <span className="text-sm text-gray-700">
                                <strong>Outdoor Space:</strong> {unit.details.outdoor}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                              <span className="text-sm text-gray-700">
                                <strong>Kitchen:</strong> {unit.details.kitchen}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                              <span className="text-sm text-gray-700">
                                <strong>Bathroom:</strong> {unit.details.bathroom}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                              <span className="text-sm text-gray-700">
                                <strong>Refrigerator:</strong> {unit.details.appliances}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                              <span className="text-sm text-gray-700">
                                <strong>Stove/Cooktop:</strong> {unit.details.stove}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                              <span className="text-sm text-gray-700">
                                <strong>Countertops:</strong> {unit.details.counters}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                              <span className="text-sm text-gray-700">
                                <strong>Flooring:</strong> {unit.details.flooring}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
                              <span className="text-sm text-gray-700">
                                <strong>Storage:</strong> {unit.details.storage}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
                              <span className="text-sm text-gray-700">
                                <strong>Lighting:</strong> {unit.details.lighting}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></span>
                              <span className="text-sm text-gray-700">
                                <strong>Accessibility:</strong> {unit.details.accessibility}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        {unit.available > 0 ? (
                          <>
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-sm font-medium text-green-700">
                              {unit.available} unit{unit.available > 1 ? 's' : ''} available
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                            <span className="text-sm font-medium text-orange-700">
                              Waitlist only
                            </span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {unit.available > 0 ? (
                          <>
                            <Button
                              onClick={() => {
                                setSelectedUnitType(unit.type);
                                setIsScheduleTourOpen(true);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <CalendarIcon className="w-4 h-4 mr-2" />
                              Schedule Tour
                            </Button>
                            <Button
                              onClick={() => {
                                toast({
                                  title: "Reserve Unit",
                                  description: `Reservation process started for ${unit.type}. A community representative will contact you within 24 hours to finalize your reservation.`,
                                });
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Calendar className="w-4 h-4 mr-2" />
                              Reserve Unit
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={() => {
                              setSelectedUnitType(unit.type);
                              setIsWaitlistOpen(true);
                            }}
                            variant="outline"
                            className="border-orange-600 text-orange-600 hover:bg-orange-50"
                          >
                            <Users className="w-4 h-4 mr-2" />
                            Join Waitlist
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          onClick={() => {
                            const newExpandedUnits = new Set(expandedUnits);
                            if (newExpandedUnits.has(unit.id)) {
                              newExpandedUnits.delete(unit.id);
                            } else {
                              newExpandedUnits.add(unit.id);
                            }
                            setExpandedUnits(newExpandedUnits);
                          }}
                        >
                          <Info className="w-4 h-4 mr-2" />
                          {expandedUnits.has(unit.id) ? 'Less Info' : 'More Info'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
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
                      {community.photos && community.photos.length > 0 ? (
                        <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden rounded-lg">
                          <HeroPhotoCarousel 
                            photos={community.photos} 
                            communityName={community.name}
                          />
                        </div>
                      ) : (
                        <div className="bg-gray-100 p-8 rounded-lg text-center">
                          <p className="text-gray-500">No photos available</p>
                        </div>
                      )}
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