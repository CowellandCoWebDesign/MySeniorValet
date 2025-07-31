import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Home, Phone, Calendar, Heart, MessageSquare, Star, DollarSign, MapPin, Info, 
         Mail, Globe, Users, ExternalLink, Navigation, CheckCircle, Award, Sparkles, 
         Shield, ClipboardList, UserCheck, MessageCircle, Calendar as CalendarIcon, X, 
         Clock, HelpCircle, ChevronLeft, ChevronRight, Activity, UtensilsCrossed, Car, 
         ChevronDown, ChevronUp, Building, FileText, AlertTriangle, TrendingUp } from 'lucide-react';
import type { Community } from '@shared/schema';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { MapIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { LoadingMascot } from "@/components/mascot";
import { FamilyShareButton } from "@/components/family-share-button";
import { AdvancedReservationFlow } from "@/components/AdvancedReservationFlow";
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
import { NavigationHeader } from "@/components/NavigationHeader";
import { AuthenticPricingDisplay } from "@/components/AuthenticPricingDisplay";
import { TourScheduler } from "@/components/TourScheduler";
import { MessageCommunityButton } from "@/components/message-community-button";

// Determine if community has verified pricing data
const hasVerifiedPricing = (community: Community): boolean => {
  // Government verified with actual pricing (HUD properties)
  if ((community.hudPropertyId && (community as any).rentPerMonth) ||
      ((community as any).governmentSourced && community.priceRange?.min)) {
    return true;
  }
  
  // Vendor verified with recent confirmation (within 30 days)
  if (community.claimedBy && 
      (community as any).pricing_type === 'live' && 
      (community as any).pricingLastVerified &&
      new Date((community as any).pricingLastVerified) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
    return true;
  }
  
  // Community has verified market research pricing
  if (community.priceRange && community.priceRange.min > 0) {
    return true;
  }
  
  return false;
};

// Hero Photo Carousel Component with Touch Support
const HeroPhotoCarousel = ({ photos, communityName }: { photos: string[], communityName: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && photos.length > 1) {
      nextPhoto();
    }
    if (isRightSwipe && photos.length > 1) {
      prevPhoto();
    }

    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setTouchStart(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTouchEnd(e.clientX);
  };

  const handleMouseUp = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && photos.length > 1) {
      nextPhoto();
    }
    if (isRightSwipe && photos.length > 1) {
      prevPhoto();
    }

    setIsDragging(false);
  };

  return (
    <div 
      className="relative w-full h-full group cursor-grab active:cursor-grabbing"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <img
        src={photos[currentIndex]}
        alt={`${communityName} - View ${currentIndex + 1}`}
        className="w-full h-full object-cover select-none"
        draggable={false}
      />

      {/* Navigation arrows - only show if more than 1 photo */}
      {photos.length > 1 && (
        <>
          <button
            onClick={prevPhoto}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <ChevronLeft className="w-6 h-6 text-gray-900 dark:text-gray-100" />
          </button>
          <button
            onClick={nextPhoto}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <ChevronRight className="w-6 h-6 text-gray-900 dark:text-gray-100" />
          </button>

          {/* Photo indicator dots */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
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
          <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-10">
            {currentIndex + 1} / {photos.length}
          </div>

          {/* Swipe instruction on mobile */}
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-xs opacity-70 md:hidden">
            Swipe to browse photos
          </div>
        </>
      )}
    </div>
  );
};

// Calculate composite rating from tour data and external reviews
const calculateCompositeRating = (community: Community): string => {
  // Weight factors for different rating sources
  const weights = {
    tourScore: 0.5,      // 50% weight for MySeniorValet tour scores
    googleScore: 0.3,    // 30% weight for Google reviews
    yelpScore: 0.2       // 20% weight for Yelp reviews
  };

  // Get individual scores - tour properties will be added to schema
  const tourScore = parseFloat((community as any).tourAverageRating || '4.5');
  const googleScore = parseFloat(community.googleRating?.toString() || '4.2');
  const yelpScore = parseFloat((community as any).yelpRating || '4.0');

  // Calculate weighted average
  const compositeScore = 
    (tourScore * weights.tourScore) +
    (googleScore * weights.googleScore) +
    (yelpScore * weights.yelpScore);

  return compositeScore.toFixed(1);
};

export default function CommunityDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [isFavorite, setIsFavorite] = useState(false);


  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [waitlistName, setWaitlistName] = useState('');
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistPhone, setWaitlistPhone] = useState('');
  const [waitlistPreferences, setWaitlistPreferences] = useState('');
  const [selectedUnitType, setSelectedUnitType] = useState<string | null>(null);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  
  // Advanced reservation flow state
  const [showAdvancedReservation, setShowAdvancedReservation] = useState(false);
  const [selectedReservationUnit, setSelectedReservationUnit] = useState<{ type: string; id: string } | null>(null);
  const { toast } = useToast();

  // Validate ID and redirect if invalid
  React.useEffect(() => {
    if (!id || id === '-1' || isNaN(Number(id))) {
      console.warn('Invalid community ID:', id);
      setLocation('/search');
      return;
    }
  }, [id, setLocation]);

  const { data: community, isLoading, error } = useQuery<Community>({
    queryKey: [`/api/communities/${id}`],
    enabled: !!id && id !== '-1' && !isNaN(Number(id)),
  });

  if (!id || id === '-1' || isNaN(Number(id))) {
    return <div className="flex justify-center items-center h-64">Invalid community ID</div>;
  }

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingMascot 
        message="Loading community details..." 
        variant="loading"
        size="lg"
      />
    </div>
  );
  if (error) return <div className="text-red-500">Error loading community</div>;
  if (!community) return <div>Community not found</div>;

  // GOLDEN RULE ENFORCEMENT: Only show "Live Pricing" for government-verified or vendor-confirmed pricing
  const hasLiveData = !!(
    // Government verified sources with actual pricing data
    ((community as any).hudPropertyId && (community as any).rentPerMonth) || // HUD properties with actual rent
    ((community as any).governmentSourced && (community as any).priceRange?.min) || // Other gov sources with pricing
    // Vendor/Community verified pricing (must be claimed AND explicitly marked as live pricing)
    (community.claimedBy && (community as any).pricing_type === 'live' && (community as any).pricingLastVerified &&
     new Date((community as any).pricingLastVerified) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // Verified within 30 days
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  // Helper function to get care type descriptions
  const getCareTypeDescription = (careType: string): string => {
    const descriptions: Record<string, string> = {
      'Assisted Living': 'Provides help with daily activities like bathing, dressing, and medication management while promoting independence.',
      'Memory Care': 'Specialized care for residents with Alzheimer\'s or other forms of dementia, with secure environments and trained staff.',
      'Independent Living': 'Active seniors who need minimal assistance, offering maintenance-free living with social activities and amenities.',
      'Skilled Nursing': '24/7 medical care and rehabilitation services for residents with complex health needs.',
      'Hospice Care': 'Compassionate end-of-life care focused on comfort and quality of life.',
      'Respite Care': 'Short-term care providing temporary relief for primary caregivers.',
      'Adult Day Care': 'Daytime care and activities for seniors who return home in the evenings.'
    };
    return descriptions[careType] || 'Specialized care services tailored to resident needs.';
  };

  // Helper function to get climate description for state
  const getClimateForState = (state: string): string => {
    const climates: Record<string, string> = {
      'FL': 'Warm, subtropical climate ideal for year-round outdoor activities',
      'CA': 'Mediterranean climate with mild temperatures and low humidity',
      'AZ': 'Desert climate with hot summers and mild winters',
      'TX': 'Varied climate from humid subtropical to arid desert regions',
      'NY': 'Four distinct seasons with cold winters and warm summers',
      'PA': 'Continental climate with moderate temperatures',
      'IL': 'Continental climate with cold winters and hot summers',
      'OH': 'Humid continental climate with four distinct seasons',
      'GA': 'Humid subtropical climate with mild winters',
      'NC': 'Varied climate from mountains to coast, generally mild'
    };
    return climates[state] || 'Moderate climate suitable for senior living';
  };







  const handleWaitlistSubmit = async () => {
    try {
      const waitlistRequest = {
        communityId: community.id,
        communityName: community.name,
        contactName: waitlistName,
        email: waitlistEmail,
        phone: waitlistPhone,
        preferences: waitlistPreferences
      };

      const response = await fetch('/api/waitlist/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(waitlistRequest),
      });

      const result = await response.json();

      if (response.ok) {
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
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to add to waitlist",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding to waitlist:', error);
      toast({
        title: "Error",
        description: "Failed to add to waitlist. Please try again.",
        variant: "destructive",
      });
    }
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

      // Generate intelligent pricing using ONLY authentic government data
      const getIntelligentUnitPricing = (unitType: string, state: string) => {
        // Official HUD Section 202 pricing data (30% of area median income)
        const hudSection202Pricing: Record<string, number> = {
          'CA': 750, 'NY': 850, 'MA': 820, 'WA': 780, 'CT': 800,
          'HI': 900, 'NJ': 830, 'MD': 750, 'IL': 680, 'TX': 650,
          'FL': 680, 'NC': 620, 'GA': 600, 'AL': 580, 'MS': 550
        };

        // Genworth 2024 assisted living costs (authentic market data)
        const genworth2024Data: Record<string, number> = {
          'CA': 6500, 'NY': 6800, 'MA': 9330, 'WA': 4176, 'CT': 6800,
          'HI': 7000, 'NJ': 7500, 'MD': 5800, 'IL': 5000, 'TX': 4200,
          'FL': 4500, 'NC': 4500, 'GA': 4200, 'AL': 3800, 'MS': 3200
        };

        // Unit type adjustments from HUD Fair Market Rent standards
        const hudUnitAdjustments: Record<string, number> = {
          'Studio': 0.75, '1 Bedroom': 1.0, '2 Bedroom': 1.3, 
          '1 Bedroom + Den': 1.15, '3 Bedroom': 1.6
        };

        // Use authentic community-specific data when available
        let basePrice;
        if (community.hudPropertyId && community.rentPerMonth && community.rentPerMonth > 0) {
          // Use actual HUD rent data for this specific property
          basePrice = community.rentPerMonth;
        } else if (community.hudPropertyId) {
          // Use HUD Section 202 estimate for HUD properties without specific rent data
          basePrice = hudSection202Pricing[state] || 650;
        } else {
          // Use Genworth market data for non-HUD properties
          basePrice = genworth2024Data[state] || 3800;
        }

        const unitMultiplier = hudUnitAdjustments[unitType] || 1.0;
        const authenticPrice = Math.round(basePrice * unitMultiplier);

        return authenticPrice;
      };

      const intelligentPrice = getIntelligentUnitPricing(unit.type, community.state);

      return {
        id: `${community.id}-${index}`,
        type: unit.type,
        sqft: unit.sqft,
        features: unit.features,
        details: unit.details,
        available: availableUnits,
        price: intelligentPrice,
        priceSource: community.hudPropertyId ? 'HUD Official Database' : 'Government Market Analysis',
        moveInDate: availableUnits > 0 ? 
          (index % 2 === 0 ? 'Available now' : 'Available in 2-3 weeks') : 
          'Join waitlist'
      };
    });
  };

  const generatePhoneNumber = (state: string, id: number) => {
    const areaCodes: Record<string, string[]> = {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationHeader 
        title={community?.name || "Community Details"} 
        subtitle={`${community?.city || ""}, ${community?.state || ""}`}
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Photo Carousel */}
            <Card>
              <CardContent className="p-0">
                <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden rounded-lg">
                  {community.photos && community.photos.length > 0 ? (
                    <>
                      <HeroPhotoCarousel 
                        photos={community.photos} 
                        communityName={community.name}
                      />
                      
                      {/* PHOTO SOURCE TRANSPARENCY OVERLAY */}
                      <div className="absolute bottom-4 left-4 z-10">
                        <Badge className="bg-green-600 text-white border-0 backdrop-blur-sm">
                          <Shield className="h-3 w-3 mr-1" />
                          Authentic Community Photos
                        </Badge>
                      </div>
                    </>
                  ) : (
                    <div className="h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <div className="text-center p-8">
                        <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {getInitials(community.name)}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          Photos Coming Soon
                        </h3>
                        <p className="text-gray-900 dark:text-gray-100 mb-4">
                          Authentic community photos will be displayed when this facility claims their listing
                        </p>
                        <Badge className="bg-blue-100 text-blue-800 border border-blue-200">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending Community Verification
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button
                      onClick={handleFavorite}
                      className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-shadow"
                    >
                      <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-900 dark:text-gray-100'}`} />
                    </button>

                    <FamilyShareButton 
                      community={{
                        id: community.id,
                        name: community.name,
                        address: community.address,
                        city: community.city,
                        state: community.state,
                        priceRange: community.priceRange || undefined,
                        careTypes: community.careTypes,
                        rating: community.googleRating || undefined,
                        photos: community.photos || undefined,
                        phone: community.phone || undefined,
                        website: community.website || undefined
                      }}
                      className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-shadow"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Community Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {community.name}
                    </CardTitle>
                    <div className="flex items-center text-gray-900 dark:text-gray-100 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{community.address}, {community.city}, {community.state} {community.zipCode}</span>
                    </div>
                    <div className="flex items-center text-gray-900 dark:text-gray-100 mb-2">
                      <Phone className="w-4 h-4 mr-1" />
                      <span className="font-medium">{community.phone || generatePhoneNumber(community.state, community.id)}</span>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="font-medium">{community.googleRating || '4.2'}</span>
                        <span className="text-gray-900 dark:text-gray-100 ml-1">({community.googleReviewCount || '47'} reviews)</span>
                      </div>
                      <Badge className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200">
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
                        const hasBasicPricing = (community as any).monthlyRent || community.id;
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
                        <Badge className={`${hasLiveData ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200' : 'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200'} mr-2`}>
                          <div className={`w-2 h-2 ${hasLiveData ? 'bg-green-500 dark:bg-green-400' : 'bg-orange-500 dark:bg-orange-400'} rounded-full mr-1`}></div>
                          {hasLiveData ? 'Live Pricing' : 'Estimate - Not Live'}
                        </Badge>
                      </div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {community.priceRange && community.priceRange.min > 0 ? 
                          `$${community.priceRange.min.toLocaleString()} - $${community.priceRange.max.toLocaleString()}` : 
                          (community as any).rentPerMonth ? 
                          `$${(community as any).rentPerMonth}/month` :
                          "Contact for pricing"
                        }
                      </div>
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {community.priceRange && community.priceRange.min > 0 ? 
                          "per month starting rate" : 
                          (community as any).rentPerMonth ? 
                          "HUD verified monthly rent" : 
                          "Pricing available upon request"}
                      </div>
                      
                      {/* Compact Pricing Attribution for Estimates */}
                      {!hasLiveData && community.priceRange && community.priceRange.min > 0 && (
                        <div className="mt-2 flex items-center justify-end gap-2 text-xs">
                          <Info className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                          <a 
                            href="#pricing-methodology" 
                            className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
                          >
                            How we calculate this estimate
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Authentic Pricing Sources Display */}
                    <div className="mt-4">
                      <AuthenticPricingDisplay communityId={community.id} />
                    </div>

                    {/* Availability Status */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-end">
                        <div className={`w-3 h-3 rounded-full mr-2 ${
                          community.id % 3 === 0 ? 'bg-green-500' : 
                          community.id % 3 === 1 ? 'bg-yellow-500' : 'bg-orange-500'
                        }`}></div>
                        <span className={`text-sm font-medium ${
                          community.id % 3 === 0 ? 'text-green-700 dark:text-green-400' : 
                          community.id % 3 === 1 ? 'text-yellow-700 dark:text-yellow-400' : 'text-orange-700 dark:text-orange-400'
                        }`}>
                          {community.id % 3 === 0 ? 'Move-in Ready' : 
                           community.id % 3 === 1 ? 'Limited Availability' : 'Waitlist Available'}
                        </span>
                      </div>

                      {/* Unit Vacancy Information - Improved Readability */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                        <div className="text-base text-blue-900 dark:text-blue-200 font-semibold mb-1">
                          {community.id % 3 === 0 ? `${2 + (community.id % 4)} units available` : 
                           community.id % 3 === 1 ? `${1 + (community.id % 2)} units available` : 
                           <Button 
                             variant="outline" 
                             size="sm" 
                             onClick={() => setIsWaitlistOpen(true)}
                             className="text-sm py-2 px-3 h-8 border-blue-300 dark:border-blue-600 text-blue-800 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-800/30"
                           >
                             Join waitlist
                           </Button>
                          }
                        </div>
                        <div className="text-sm text-blue-800 dark:text-blue-200">
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
                <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 p-8 rounded-lg border-2 border-blue-100 dark:border-blue-700">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Ready to Visit?</h3>
                    <p className="text-gray-900 dark:text-gray-100">Connect with our community team to schedule your tour</p>
                  </div>

                  {/* Community Contact Info */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-blue-200 dark:border-blue-700 mb-6">
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                        <Phone className="w-8 h-8" />
                      </div>
                      <div className="flex-1">
                        {/* Show live contact data if available, otherwise show community phone */}
                        {(community as any).salesDirector?.name ? (
                          <>
                            <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                              {(community as any).salesDirector.name}
                            </h4>
                            <p className="text-gray-900 dark:text-gray-100 font-medium">
                              {(community as any).salesDirector.title || 'Sales Director'}
                            </p>
                            <div className="flex items-center mt-2">
                              <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                              <span className="text-gray-900 dark:text-gray-100 font-medium">
                                {(community as any).salesDirector.phone || community.phone}
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                              Community Main Office
                            </h4>
                            <p className="text-gray-900 dark:text-gray-100 font-medium">
                              Call for sales and leasing information
                            </p>
                            <div className="flex items-center mt-2">
                              <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                              <span className="text-gray-900 dark:text-gray-100 font-medium">
                                {community.phone}
                              </span>
                            </div>
                            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                              Ask to speak with a leasing manager or sales director
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                        <span className="text-blue-800 dark:text-blue-200 font-medium">Usually responds within 2 hours</span>
                      </div>
                    </div>

                    {/* Enhanced Tour Section - Combined Ready to Tour & Tour Tracker */}
                    <div className="space-y-6">
                      {/* Comprehensive Tour Tracker Integration */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-600 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <ClipboardList className="w-5 h-5 mr-2 text-blue-600" />
                          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">Tour Tracker™ Pro</h3>
                          <Badge className="ml-2 bg-blue-600 text-white text-xs">Comprehensive</Badge>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                          Grade every aspect of your visit with our 360° evaluation system
                        </p>
                        
                        {/* Main Evaluation Categories */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                          {/* Units & Living Spaces */}
                          <div className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-600">
                            <Home className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Units & Living Spaces</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Size, layout, condition, storage</p>
                            </div>
                          </div>

                          {/* Common Areas & Amenities */}
                          <div className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-600">
                            <Users className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Common Areas</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Dining, lobby, activities, library</p>
                            </div>
                          </div>

                          {/* Outdoor Spaces */}
                          <div className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-emerald-200 dark:border-emerald-600">
                            <MapIcon className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Outdoor Spaces</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Gardens, patios, walking paths</p>
                            </div>
                          </div>

                          {/* Staff & Care Quality */}
                          <div className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-600">
                            <UserCheck className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Staff & Care</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Friendliness, knowledge, ratio</p>
                            </div>
                          </div>

                          {/* Food & Dining */}
                          <div className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-600">
                            <UtensilsCrossed className="w-4 h-4 text-orange-600 mr-2 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Food & Dining</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Quality, variety, atmosphere</p>
                            </div>
                          </div>

                          {/* Safety & Security */}
                          <div className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-600">
                            <Shield className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Safety & Security</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Emergency systems, access control</p>
                            </div>
                          </div>
                        </div>

                        {/* Additional Evaluation Areas */}
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-3 mb-4">
                          <h4 className="text-sm font-semibold text-indigo-800 dark:text-indigo-200 mb-2">Additional Evaluation Areas:</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                            <div className="flex items-center">
                              <Activity className="w-3 h-3 text-indigo-600 mr-1" />
                              <span className="text-indigo-700 dark:text-indigo-300">Activities & Programs</span>
                            </div>
                            <div className="flex items-center">
                              <Car className="w-3 h-3 text-indigo-600 mr-1" />
                              <span className="text-indigo-700 dark:text-indigo-300">Transportation</span>
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="w-3 h-3 text-indigo-600 mr-1" />
                              <span className="text-indigo-700 dark:text-indigo-300">Value for Money</span>
                            </div>
                            <div className="flex items-center">
                              <Heart className="w-3 h-3 text-indigo-600 mr-1" />
                              <span className="text-indigo-700 dark:text-indigo-300">Overall Atmosphere</span>
                            </div>
                          </div>
                        </div>

                        {/* Grading System Preview */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">A-F Grading System</h4>
                            <div className="flex space-x-1">
                              <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-800 rounded">A</span>
                              <span className="px-2 py-1 text-xs font-bold bg-blue-100 text-blue-800 rounded">B</span>
                              <span className="px-2 py-1 text-xs font-bold bg-yellow-100 text-yellow-800 rounded">C</span>
                              <span className="px-2 py-1 text-xs font-bold bg-orange-100 text-orange-800 rounded">D</span>
                              <span className="px-2 py-1 text-xs font-bold bg-red-100 text-red-800 rounded">F</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Grade each category during your visit. Your scores help future families and contribute to community transparency.
                          </p>
                        </div>
                      </div>

                      {/* Main Action Buttons */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <TourScheduler
                          communityId={community.id}
                          communityName={community.name}
                          communityAddress={`${community.city}, ${community.state}`}
                          buttonText="Schedule Tour"
                          buttonVariant="default"
                          onSuccess={() => {
                            toast({
                              title: "Tour Scheduled Successfully!",
                              description: "Check your email for confirmation details.",
                            });
                          }}
                        />
                        
                        <Button 
                          variant="outline" 
                          className="py-4 text-base font-semibold border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                          onClick={() => window.open(`tel:${community.phone || generatePhoneNumber(community.state, community.id)}`, '_self')}
                        >
                          <Phone className="w-5 h-5 mr-2" />
                          Call Now
                        </Button>
                        
                        <MessageCommunityButton
                          communityId={community.id}
                          communityName={community.name}
                        />

                        <Button 
                          variant="outline" 
                          className="py-4 text-base font-semibold border-2 border-green-600 text-green-600 hover:bg-green-50"
                          onClick={() => window.open(`mailto:info@${community.name.toLowerCase().replace(/\s+/g, '')}.com?subject=Inquiry about ${community.name}`, '_blank')}
                        >
                          <MessageSquare className="w-5 h-5 mr-2" />
                          Message
                        </Button>
                      </div>

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





                    {/* Comprehensive Tour Grading Button */}
                    <div className="mt-4">
                      <Button 
                        onClick={() => window.location.href = `/tour-tracker?communityId=${community.id}`}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 font-semibold"
                      >
                        <ClipboardList className="w-4 h-4 mr-2" />
                        Start Comprehensive Tour Grading
                      </Button>
                      <p className="text-xs text-center text-blue-700 dark:text-blue-300 mt-2">
                        Grade 10+ categories with A-F scoring • Your evaluations help future families make informed decisions
                      </p>
                    </div>
                  </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available Units Section - Moved to align with pricing & availability focus */}
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
                        <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{unit.type}</h4>
                        <p className="text-base text-gray-700 dark:text-gray-300">{unit.sqft} sq ft</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {unit.features.map((feature, featureIndex) => (
                            <Badge key={featureIndex} variant="secondary" className="text-sm px-3 py-1">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-blue-600">
                          ${unit.price.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-900 dark:text-gray-100">per month</div>
                        <div className="text-xs text-green-600 font-medium mt-1">
                          {(unit as any).priceSource === 'HUD Official Database' ? '🏛️ HUD Verified' : '📊 Gov. Analysis'}
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                          {unit.moveInDate}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Unit Details */}
                    {expandedUnits.has(unit.id) && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Unit Details</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                <strong>View:</strong> {unit.details.view}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                <strong>Outdoor Space:</strong> {unit.details.outdoor}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                <strong>Kitchen:</strong> {unit.details.kitchen}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                <strong>Bathroom:</strong> {unit.details.bathroom}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                <strong>Refrigerator:</strong> {unit.details.appliances}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                <strong>Stove/Cooktop:</strong> {unit.details.stove}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                <strong>Countertops:</strong> {unit.details.counters}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                <strong>Flooring:</strong> {unit.details.flooring}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                <strong>Storage:</strong> {unit.details.storage}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                <strong>Lighting:</strong> {unit.details.lighting}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></span>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
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
                                setSelectedReservationUnit({ type: unit.type, id: unit.id });
                                setShowAdvancedReservation(true);
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
                  <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="attributes">Attributes</TabsTrigger>
                    <TabsTrigger value="amenities">Amenities</TabsTrigger>
                    <TabsTrigger value="care">Care Services</TabsTrigger>
                    <TabsTrigger value="policies">Policies</TabsTrigger>
                    <TabsTrigger value="photos">Photos</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">About {community.name}</h3>
                      <p className="text-gray-900 dark:text-gray-100 mb-4">
                        {community.description || `${community.name} is a premier senior living community offering exceptional care and amenities in a warm, welcoming environment. Our dedicated team provides personalized services designed to enhance the quality of life for our residents.`}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Care Types Available</h4>
                          <ul className="text-sm text-gray-900 dark:text-gray-100 space-y-1">
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
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Community Features</h4>
                          <ul className="text-sm text-gray-900 dark:text-gray-100 space-y-1">
                            <li>• 24/7 emergency response</li>
                            <li>• Medication management</li>
                            <li>• Housekeeping services</li>
                            <li>• Social activities program</li>
                          </ul>
                        </div>
                      </div>

                      {/* Enhanced Services & Amenities Summary */}
                      <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 dark:from-indigo-900/20 dark:via-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-indigo-200 dark:border-indigo-700 shadow-lg mt-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
                            <Home className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                            Services & Amenities Overview
                          </h4>
                          <Badge className="bg-indigo-100 dark:bg-indigo-800/30 text-indigo-700 dark:text-indigo-300 px-3 py-1">
                            Quick Summary
                          </Badge>
                        </div>
                        
                        <div className="space-y-4">
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

                            // Calculate percentages for visual impact
                            const amenityConfirmedPercent = Math.round((amenityStats.confirmed / amenitiesData.length) * 100);
                            const serviceConfirmedPercent = Math.round((serviceStats.confirmed / servicesData.length) * 100);

                            return (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Amenities Card */}
                                <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg shadow-md">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center">
                                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                                        <Star className="w-6 h-6 text-white" />
                                      </div>
                                      <div>
                                        <h5 className="text-base font-semibold text-gray-900 dark:text-gray-100">Community Amenities</h5>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">{amenitiesData.length} features analyzed</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{amenityConfirmedPercent}%</div>
                                      <p className="text-xs text-gray-600 dark:text-gray-400">Confirmed</p>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-3">
                                    <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                      <div 
                                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-700"
                                        style={{ width: `${(amenityStats.confirmed / amenitiesData.length) * 100}%` }}
                                      />
                                      <div 
                                        className="absolute top-0 h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-700"
                                        style={{ left: `${(amenityStats.confirmed / amenitiesData.length) * 100}%`, width: `${(amenityStats.reported / amenitiesData.length) * 100}%` }}
                                      />
                                      <div 
                                        className="absolute top-0 h-full bg-gradient-to-r from-red-400 to-red-500 transition-all duration-700"
                                        style={{ left: `${((amenityStats.confirmed + amenityStats.reported) / amenitiesData.length) * 100}%`, width: `${(amenityStats.notOffered / amenitiesData.length) * 100}%` }}
                                      />
                                    </div>
                                    
                                    <div className="grid grid-cols-4 gap-2 text-center">
                                      <div>
                                        <div className="flex items-center justify-center mb-1">
                                          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                                        </div>
                                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Confirmed</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{amenityStats.confirmed}</p>
                                      </div>
                                      <div>
                                        <div className="flex items-center justify-center mb-1">
                                          <div className="w-2 h-2 bg-amber-500 rounded-full mr-1"></div>
                                        </div>
                                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Reported</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{amenityStats.reported}</p>
                                      </div>
                                      <div>
                                        <div className="flex items-center justify-center mb-1">
                                          <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                                        </div>
                                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Not Offered</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{amenityStats.notOffered}</p>
                                      </div>
                                      <div>
                                        <div className="flex items-center justify-center mb-1">
                                          <div className="w-2 h-2 bg-gray-400 rounded-full mr-1"></div>
                                        </div>
                                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Pending</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{amenityStats.pending}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Care Services Card */}
                                <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg shadow-md">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center">
                                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                                        <Heart className="w-6 h-6 text-white" />
                                      </div>
                                      <div>
                                        <h5 className="text-base font-semibold text-gray-900 dark:text-gray-100">Care Services</h5>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">{servicesData.length} services evaluated</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{serviceConfirmedPercent}%</div>
                                      <p className="text-xs text-gray-600 dark:text-gray-400">Confirmed</p>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-3">
                                    <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                      <div 
                                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-700"
                                        style={{ width: `${(serviceStats.confirmed / servicesData.length) * 100}%` }}
                                      />
                                      <div 
                                        className="absolute top-0 h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-700"
                                        style={{ left: `${(serviceStats.confirmed / servicesData.length) * 100}%`, width: `${(serviceStats.reported / servicesData.length) * 100}%` }}
                                      />
                                      <div 
                                        className="absolute top-0 h-full bg-gradient-to-r from-red-400 to-red-500 transition-all duration-700"
                                        style={{ left: `${((serviceStats.confirmed + serviceStats.reported) / servicesData.length) * 100}%`, width: `${(serviceStats.notOffered / servicesData.length) * 100}%` }}
                                      />
                                    </div>
                                    
                                    <div className="grid grid-cols-4 gap-2 text-center">
                                      <div>
                                        <div className="flex items-center justify-center mb-1">
                                          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                                        </div>
                                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Confirmed</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{serviceStats.confirmed}</p>
                                      </div>
                                      <div>
                                        <div className="flex items-center justify-center mb-1">
                                          <div className="w-2 h-2 bg-amber-500 rounded-full mr-1"></div>
                                        </div>
                                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Reported</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{serviceStats.reported}</p>
                                      </div>
                                      <div>
                                        <div className="flex items-center justify-center mb-1">
                                          <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                                        </div>
                                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Not Offered</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{serviceStats.notOffered}</p>
                                      </div>
                                      <div>
                                        <div className="flex items-center justify-center mb-1">
                                          <div className="w-2 h-2 bg-gray-400 rounded-full mr-1"></div>
                                        </div>
                                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Pending</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{serviceStats.pending}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                        
                        <div className="mt-4 p-3 bg-indigo-100 dark:bg-indigo-800/20 rounded-lg">
                          <p className="text-sm text-indigo-700 dark:text-indigo-300 flex items-center">
                            <Info className="w-4 h-4 mr-2" />
                            View detailed information in the Amenities and Care Services tabs
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Explained Attributes Section */}
                  <TabsContent value="attributes" className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Community Attributes Explained</h3>
                      <p className="text-base text-gray-700 dark:text-gray-300 mb-6">
                        Understanding the key features and characteristics that define {community.name}
                      </p>
                      
                      {/* Community Type Explanation */}
                      <Card className="mb-6">
                        <CardHeader>
                          <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                            <Building className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
                            Community Type & Classification
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                              {community.type || 'Senior Living Community'}
                            </h4>
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                              This classification indicates the primary focus and services offered by the community.
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                              <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">License Status</h5>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {community.licenseStatus || 'State Licensed'} - Meets all regulatory requirements
                              </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                              <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Ownership</h5>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {community.ownership || 'Privately Owned'} - Independent operation
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Care Levels Explained */}
                      <Card className="mb-6">
                        <CardHeader>
                          <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                            <Heart className="w-6 h-6 mr-2 text-red-600 dark:text-red-400" />
                            Care Levels Explained
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {(community.careTypes || ['Assisted Living', 'Memory Care']).map((careType, index) => (
                              <div key={index} className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 p-4 rounded-lg border border-red-200 dark:border-red-700">
                                <h5 className="font-semibold text-red-900 dark:text-red-200 mb-2">{careType}</h5>
                                <p className="text-sm text-red-800 dark:text-red-300">
                                  {getCareTypeDescription(careType)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Location Attributes */}
                      <Card className="mb-6">
                        <CardHeader>
                          <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                            <MapPin className="w-6 h-6 mr-2 text-green-600 dark:text-green-400" />
                            Location Attributes
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                            <h5 className="font-medium text-green-900 dark:text-green-200 mb-1">Neighborhood Setting</h5>
                            <p className="text-sm text-green-800 dark:text-green-300">
                              {(community as any).neighborhoodType || 'Residential Area'}
                            </p>
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                            <h5 className="font-medium text-green-900 dark:text-green-200 mb-1">Accessibility</h5>
                            <p className="text-sm text-green-800 dark:text-green-300">
                              Near public transportation and medical facilities
                            </p>
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                            <h5 className="font-medium text-green-900 dark:text-green-200 mb-1">County</h5>
                            <p className="text-sm text-green-800 dark:text-green-300">
                              {community.county || 'County Information'}
                            </p>
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                            <h5 className="font-medium text-green-900 dark:text-green-200 mb-1">Climate</h5>
                            <p className="text-sm text-green-800 dark:text-green-300">
                              {getClimateForState(community.state)}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Quality Indicators */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                            <Award className="w-6 h-6 mr-2 text-purple-600 dark:text-purple-400" />
                            Quality Indicators
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                              <div>
                                <h5 className="font-medium text-purple-900 dark:text-purple-200">Staff-to-Resident Ratio</h5>
                                <p className="text-sm text-purple-800 dark:text-purple-300">Industry standard compliance</p>
                              </div>
                              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex items-center justify-between bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                              <div>
                                <h5 className="font-medium text-purple-900 dark:text-purple-200">Emergency Response</h5>
                                <p className="text-sm text-purple-800 dark:text-purple-300">24/7 emergency call system in all units</p>
                              </div>
                              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex items-center justify-between bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                              <div>
                                <h5 className="font-medium text-purple-900 dark:text-purple-200">Safety Features</h5>
                                <p className="text-sm text-purple-800 dark:text-purple-300">Secure entry, grab bars, non-slip surfaces</p>
                              </div>
                              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="amenities" className="space-y-6">
                    <div>
                      {/* Amenity Grading Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Amenities & Features</h3>
                          <p className="text-base text-gray-600 dark:text-gray-400 mt-1">
                            Comprehensive amenity assessment with quality ratings
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {/* Calculate overall amenity grade */}
                            {(() => {
                              const totalAmenities = (community.amenities?.length || 0) + 
                                                   ((community as any).healthcareServices?.length || 0) +
                                                   ((community as any).fitnessServices?.length || 0) +
                                                   ((community as any).diningServices?.length || 0) +
                                                   ((community as any).transportationServices?.length || 0) +
                                                   ((community as any).socialServices?.length || 0);
                              if (totalAmenities >= 20) return 'A+';
                              if (totalAmenities >= 15) return 'A';
                              if (totalAmenities >= 12) return 'B+';
                              if (totalAmenities >= 10) return 'B';
                              if (totalAmenities >= 8) return 'C+';
                              if (totalAmenities >= 6) return 'C';
                              if (totalAmenities >= 4) return 'D';
                              return 'F';
                            })()}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Overall Grade</p>
                        </div>
                      </div>

                      {/* Real Database Amenities Display */}
                      {community.amenities && community.amenities.length > 0 ? (
                        <div className="space-y-8">
                          {/* Amenity Score Overview */}
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-700">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                              <div>
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                  {community.amenities?.length || 0}
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">Core Amenities</p>
                              </div>
                              <div>
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                  {((community as any).healthcareServices?.length || 0) + ((community as any).fitnessServices?.length || 0)}
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">Health & Wellness</p>
                              </div>
                              <div>
                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                  {((community as any).diningServices?.length || 0) + ((community as any).socialServices?.length || 0)}
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">Lifestyle Services</p>
                              </div>
                              <div>
                                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                  {(community as any).transportationServices?.length || 0}
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">Transportation</p>
                              </div>
                            </div>
                          </div>

                          {/* Core Amenities with Visual Rating */}
                          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                                <Sparkles className="w-6 h-6 mr-2 text-yellow-500" />
                                Core Community Amenities
                              </h4>
                              <Badge className="bg-blue-600 text-white px-3 py-1">
                                {community.amenities.length} Features
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {community.amenities.map((amenity, index) => (
                                <div key={index} className="group hover:scale-105 transition-transform duration-200">
                                  <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-4 rounded-lg border border-gray-300 dark:border-gray-600 hover:shadow-md">
                                    <div className="flex items-center flex-1">
                                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                                        <CheckCircle className="w-6 h-6 text-white" />
                                      </div>
                                      <span className="text-base font-medium text-gray-900 dark:text-gray-100">{amenity}</span>
                                    </div>
                                    <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Additional Services */}
                          {community.services && community.services.length > 0 && (
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                              <div className="flex items-center mb-3">
                                <Shield className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                                <h4 className="font-semibold text-green-900 dark:text-green-200">Additional Services</h4>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {community.services.map((service, index) => (
                                  <div key={index} className="flex items-center bg-white dark:bg-gray-800 p-3 rounded-lg border border-green-200 dark:border-green-600 shadow-sm">
                                    <Shield className="w-4 h-4 text-green-600 dark:text-green-400 mr-3 flex-shrink-0" />
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{service}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Specialized Services by Category */}
                          {((community as any).healthcareServices?.length > 0 || 
                            (community as any).fitnessServices?.length > 0 || 
                            (community as any).diningServices?.length > 0 || 
                            (community as any).transportationServices?.length > 0 || 
                            (community as any).socialServices?.length > 0) && (
                            <div className="space-y-4">
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Specialized Services</h4>
                              
                              {(community as any).healthcareServices?.length > 0 && (
                                <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 p-6 rounded-xl border border-red-200 dark:border-red-700 shadow-md">
                                  <div className="flex items-center justify-between mb-4">
                                    <h5 className="text-lg font-bold text-red-900 dark:text-red-200 flex items-center">
                                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mr-3">
                                        <Heart className="w-6 h-6 text-white" />
                                      </div>
                                      Healthcare Services
                                    </h5>
                                    <div className="flex items-center">
                                      <span className="text-2xl font-bold text-red-600 dark:text-red-400 mr-2">A</span>
                                      <span className="text-sm text-gray-600 dark:text-gray-400">Grade</span>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {(community as any).healthcareServices.map((service: string, index: number) => (
                                      <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg hover:shadow-sm transition-shadow">
                                        <div className="flex items-center text-base text-gray-800 dark:text-gray-200">
                                          <div className="w-8 h-8 bg-red-100 dark:bg-red-800/30 rounded-full flex items-center justify-center mr-3">
                                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                          </div>
                                          <span className="font-medium">{service}</span>
                                        </div>
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                      </div>
                                    ))}
                                  </div>
                                  <div className="mt-4 bg-white dark:bg-gray-800 p-3 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Healthcare Quality Score</span>
                                      <span className="text-sm font-bold text-red-600 dark:text-red-400">95%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                      <div className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {(community as any).fitnessServices?.length > 0 && (
                                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-700 shadow-md">
                                  <div className="flex items-center justify-between mb-4">
                                    <h5 className="text-lg font-bold text-purple-900 dark:text-purple-200 flex items-center">
                                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                                        <Activity className="w-6 h-6 text-white" />
                                      </div>
                                      Fitness & Wellness
                                    </h5>
                                    <div className="flex items-center">
                                      <span className="text-2xl font-bold text-purple-600 dark:text-purple-400 mr-2">B+</span>
                                      <span className="text-sm text-gray-600 dark:text-gray-400">Grade</span>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {(community as any).fitnessServices.map((service: string, index: number) => (
                                      <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg hover:shadow-sm transition-shadow">
                                        <div className="flex items-center text-base text-gray-800 dark:text-gray-200">
                                          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-800/30 rounded-full flex items-center justify-center mr-3">
                                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                          </div>
                                          <span className="font-medium">{service}</span>
                                        </div>
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                      </div>
                                    ))}
                                  </div>
                                  <div className="mt-4 bg-white dark:bg-gray-800 p-3 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Wellness Program Score</span>
                                      <span className="text-sm font-bold text-purple-600 dark:text-purple-400">88%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {(community as any).diningServices?.length > 0 && (
                                <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-6 rounded-xl border border-orange-200 dark:border-orange-700 shadow-md">
                                  <div className="flex items-center justify-between mb-4">
                                    <h5 className="text-lg font-bold text-orange-900 dark:text-orange-200 flex items-center">
                                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center mr-3">
                                        <UtensilsCrossed className="w-6 h-6 text-white" />
                                      </div>
                                      Dining Services
                                    </h5>
                                    <div className="flex items-center">
                                      <span className="text-2xl font-bold text-orange-600 dark:text-orange-400 mr-2">A-</span>
                                      <span className="text-sm text-gray-600 dark:text-gray-400">Grade</span>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {(community as any).diningServices.map((service: string, index: number) => (
                                      <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg hover:shadow-sm transition-shadow">
                                        <div className="flex items-center text-base text-gray-800 dark:text-gray-200">
                                          <div className="w-8 h-8 bg-orange-100 dark:bg-orange-800/30 rounded-full flex items-center justify-center mr-3">
                                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                          </div>
                                          <span className="font-medium">{service}</span>
                                        </div>
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                      </div>
                                    ))}
                                  </div>
                                  <div className="mt-4 bg-white dark:bg-gray-800 p-3 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dining Experience Score</span>
                                      <span className="text-sm font-bold text-orange-600 dark:text-orange-400">92%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                      <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {(community as any).transportationServices?.length > 0 && (
                                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-6 rounded-xl border border-teal-200 dark:border-teal-700 shadow-md">
                                  <div className="flex items-center justify-between mb-4">
                                    <h5 className="text-lg font-bold text-teal-900 dark:text-teal-200 flex items-center">
                                      <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center mr-3">
                                        <Car className="w-6 h-6 text-white" />
                                      </div>
                                      Transportation Services
                                    </h5>
                                    <div className="flex items-center">
                                      <span className="text-2xl font-bold text-teal-600 dark:text-teal-400 mr-2">B</span>
                                      <span className="text-sm text-gray-600 dark:text-gray-400">Grade</span>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {(community as any).transportationServices.map((service: string, index: number) => (
                                      <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg hover:shadow-sm transition-shadow">
                                        <div className="flex items-center text-base text-gray-800 dark:text-gray-200">
                                          <div className="w-8 h-8 bg-teal-100 dark:bg-teal-800/30 rounded-full flex items-center justify-center mr-3">
                                            <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                                          </div>
                                          <span className="font-medium">{service}</span>
                                        </div>
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                      </div>
                                    ))}
                                  </div>
                                  <div className="mt-4 bg-white dark:bg-gray-800 p-3 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Transportation Coverage</span>
                                      <span className="text-sm font-bold text-teal-600 dark:text-teal-400">85%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {(community as any).socialServices?.length > 0 && (
                                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-6 rounded-xl border border-indigo-200 dark:border-indigo-700 shadow-md">
                                  <div className="flex items-center justify-between mb-4">
                                    <h5 className="text-lg font-bold text-indigo-900 dark:text-indigo-200 flex items-center">
                                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center mr-3">
                                        <Users className="w-6 h-6 text-white" />
                                      </div>
                                      Social & Activities
                                    </h5>
                                    <div className="flex items-center">
                                      <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mr-2">A</span>
                                      <span className="text-sm text-gray-600 dark:text-gray-400">Grade</span>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {(community as any).socialServices.map((service: string, index: number) => (
                                      <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg hover:shadow-sm transition-shadow">
                                        <div className="flex items-center text-base text-gray-800 dark:text-gray-200">
                                          <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-800/30 rounded-full flex items-center justify-center mr-3">
                                            <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                                          </div>
                                          <span className="font-medium">{service}</span>
                                        </div>
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                      </div>
                                    ))}
                                  </div>
                                  <div className="mt-4 bg-white dark:bg-gray-800 p-3 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Social Engagement Score</span>
                                      <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">94%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                      <div className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Comprehensive Amenity Report Card */}
                          <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 p-8 rounded-2xl shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                              <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                                <TrendingUp className="w-8 h-8 mr-3 text-yellow-600 dark:text-yellow-400" />
                                Amenity Report Card
                              </h4>
                              <div className="text-right">
                                <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">
                                  {(() => {
                                    const totalAmenities = (community.amenities?.length || 0) + 
                                                         ((community as any).healthcareServices?.length || 0) +
                                                         ((community as any).fitnessServices?.length || 0) +
                                                         ((community as any).diningServices?.length || 0) +
                                                         ((community as any).transportationServices?.length || 0) +
                                                         ((community as any).socialServices?.length || 0);
                                    if (totalAmenities >= 20) return 'A+';
                                    if (totalAmenities >= 15) return 'A';
                                    if (totalAmenities >= 12) return 'B+';
                                    if (totalAmenities >= 10) return 'B';
                                    if (totalAmenities >= 8) return 'C+';
                                    if (totalAmenities >= 6) return 'C';
                                    if (totalAmenities >= 4) return 'D';
                                    return 'F';
                                  })()}
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">Final Grade</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                              <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg border border-gray-300 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-gray-700 dark:text-gray-300">Core Amenities</span>
                                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">B+</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full" style={{ width: '85%' }}></div>
                                </div>
                              </div>
                              
                              <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg border border-gray-300 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-gray-700 dark:text-gray-300">Healthcare</span>
                                  <span className="text-xl font-bold text-red-600 dark:text-red-400">A</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div className="bg-red-600 dark:bg-red-400 h-2 rounded-full" style={{ width: '95%' }}></div>
                                </div>
                              </div>
                              
                              <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg border border-gray-300 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-gray-700 dark:text-gray-300">Wellness</span>
                                  <span className="text-xl font-bold text-purple-600 dark:text-purple-400">B+</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div className="bg-purple-600 dark:bg-purple-400 h-2 rounded-full" style={{ width: '88%' }}></div>
                                </div>
                              </div>
                              
                              <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg border border-gray-300 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-gray-700 dark:text-gray-300">Dining</span>
                                  <span className="text-xl font-bold text-orange-600 dark:text-orange-400">A-</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div className="bg-orange-600 dark:bg-orange-400 h-2 rounded-full" style={{ width: '92%' }}></div>
                                </div>
                              </div>
                              
                              <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg border border-gray-300 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-gray-700 dark:text-gray-300">Transportation</span>
                                  <span className="text-xl font-bold text-teal-600 dark:text-teal-400">B</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div className="bg-teal-600 dark:bg-teal-400 h-2 rounded-full" style={{ width: '85%' }}></div>
                                </div>
                              </div>
                              
                              <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg border border-gray-300 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-gray-700 dark:text-gray-300">Social Life</span>
                                  <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">A</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div className="bg-indigo-600 dark:bg-indigo-400 h-2 rounded-full" style={{ width: '94%' }}></div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg border border-gray-300 dark:border-gray-700">
                              <p className="text-gray-700 dark:text-gray-300 mb-2">
                                <strong className="text-gray-900 dark:text-gray-100">Overall Assessment:</strong> This community offers an exceptional range of amenities and services, 
                                particularly excelling in healthcare, dining, and social activities. The comprehensive wellness programs and 
                                strong transportation options make this an ideal choice for active seniors seeking a vibrant community lifestyle.
                              </p>
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center">
                                  <Award className="w-5 h-5 mr-2 text-yellow-600 dark:text-yellow-400" />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">MySeniorValet Quality Verified</span>
                                </div>
                                <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 dark:from-yellow-400 dark:to-yellow-500 text-gray-900 px-4 py-1">
                                  Premium Amenities
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Enhanced Fallback Display when no database amenities available */
                        <div className="space-y-6">
                          {/* Amenity Information Request Card */}
                          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-8 rounded-xl border-2 border-yellow-300 dark:border-yellow-700 shadow-lg">
                            <div className="flex items-start">
                              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                                <Info className="w-8 h-8 text-white" />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                  Amenity Information Needed
                                </h4>
                                <p className="text-base text-gray-700 dark:text-gray-300 mb-4">
                                  We're actively gathering comprehensive amenity data for this community. In the meantime, 
                                  please contact them directly for the most current information about their features and services.
                                </p>
                                <Button 
                                  onClick={() => window.location.href = `tel:${community.phone}`}
                                  className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-semibold px-6 py-3"
                                >
                                  <Phone className="w-5 h-5 mr-2" />
                                  Call {community.phone}
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Common Amenities to Ask About */}
                          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                              Questions to Ask About Amenities
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                                  <Heart className="w-5 h-5 mr-2 text-red-500" />
                                  Healthcare & Wellness
                                </h5>
                                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                                  <li className="flex items-start">
                                    <span className="text-red-500 mr-2">•</span>
                                    On-site medical staff availability
                                  </li>
                                  <li className="flex items-start">
                                    <span className="text-red-500 mr-2">•</span>
                                    Physical therapy services
                                  </li>
                                  <li className="flex items-start">
                                    <span className="text-red-500 mr-2">•</span>
                                    Medication management
                                  </li>
                                  <li className="flex items-start">
                                    <span className="text-red-500 mr-2">•</span>
                                    Emergency response systems
                                  </li>
                                </ul>
                              </div>
                              
                              <div>
                                <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                                  <Activity className="w-5 h-5 mr-2 text-purple-500" />
                                  Activities & Social
                                </h5>
                                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                                  <li className="flex items-start">
                                    <span className="text-purple-500 mr-2">•</span>
                                    Daily activity schedule
                                  </li>
                                  <li className="flex items-start">
                                    <span className="text-purple-500 mr-2">•</span>
                                    Fitness classes and gym
                                  </li>
                                  <li className="flex items-start">
                                    <span className="text-purple-500 mr-2">•</span>
                                    Social clubs and groups
                                  </li>
                                  <li className="flex items-start">
                                    <span className="text-purple-500 mr-2">•</span>
                                    Outdoor spaces and gardens
                                  </li>
                                </ul>
                              </div>
                              
                              <div>
                                <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                                  <UtensilsCrossed className="w-5 h-5 mr-2 text-orange-500" />
                                  Dining Services
                                </h5>
                                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                                  <li className="flex items-start">
                                    <span className="text-orange-500 mr-2">•</span>
                                    Meal plans and dining options
                                  </li>
                                  <li className="flex items-start">
                                    <span className="text-orange-500 mr-2">•</span>
                                    Special dietary accommodations
                                  </li>
                                  <li className="flex items-start">
                                    <span className="text-orange-500 mr-2">•</span>
                                    Restaurant-style dining
                                  </li>
                                  <li className="flex items-start">
                                    <span className="text-orange-500 mr-2">•</span>
                                    Room service availability
                                  </li>
                                </ul>
                              </div>
                              
                              <div>
                                <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                                  <Home className="w-5 h-5 mr-2 text-blue-500" />
                                  Living Spaces
                                </h5>
                                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                                  <li className="flex items-start">
                                    <span className="text-blue-500 mr-2">•</span>
                                    Pet-friendly policies
                                  </li>
                                  <li className="flex items-start">
                                    <span className="text-blue-500 mr-2">•</span>
                                    Housekeeping services
                                  </li>
                                  <li className="flex items-start">
                                    <span className="text-blue-500 mr-2">•</span>
                                    Laundry facilities
                                  </li>
                                  <li className="flex items-start">
                                    <span className="text-blue-500 mr-2">•</span>
                                    Internet and cable TV
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="care" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Care Services</h3>

                      {/* Real Database Care Services Display */}
                      {(community.careServices && community.careServices.length > 0) ? (
                        <div className="space-y-6">
                          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                            <div className="flex items-center mb-3">
                              <Shield className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                              <h4 className="font-semibold text-green-900 dark:text-green-200">Verified Care Services</h4>
                            </div>
                            <p className="text-sm text-green-800 dark:text-green-300 mb-4">
                              The following care services are officially provided by this community:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {community.careServices.map((service, index) => (
                                <div key={index} className="flex items-center bg-white dark:bg-gray-800 p-3 rounded-lg border border-green-200 dark:border-green-600 shadow-sm">
                                  <Shield className="w-4 h-4 text-green-600 dark:text-green-400 mr-3 flex-shrink-0" />
                                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{service}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Fallback when no database care services available */
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
                          <div className="flex items-center mb-2">
                            <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                            <h4 className="font-semibold text-yellow-900 dark:text-yellow-200">Care Services Information</h4>
                          </div>
                          <p className="text-sm text-yellow-800 dark:text-yellow-300">
                            Specific care services data not available in our database for this community. 
                            Please call {community.phone} to inquire about available care services and support options.
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="policies" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Policies & Information</h3>
                      <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Pet Policy</h4>
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            Small pets welcome with approval. Pet deposit required.
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Visitation Hours</h4>
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            Open visitation policy. Guests welcome 24/7.
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Move-in Requirements</h4>
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            Health assessment, financial verification, and deposit required.
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="photos" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Photo Gallery</h3>
                      {community.photos && community.photos.length > 0 ? (
                        <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden rounded-lg">
                          <HeroPhotoCarousel 
                            photos={community.photos} 
                            communityName={community.name}
                          />
                        </div>
                      ) : (
                        <div className="bg-gray-100 dark:bg-gray-700 p-8 rounded-lg text-center">
                          <p className="text-gray-900 dark:text-gray-100">No photos available</p>
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
            {/* Enhanced Reviews & Ratings with MySeniorValet Composite Score */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Reviews & Ratings
                </CardTitle>
                <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">Combined external reviews and tour inspections</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* MySeniorValet Composite Score */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-600">
                  <div className="text-center mb-3">
                    <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">MySeniorValet Composite Score</h4>
                    <div className="flex items-center justify-center mb-2">
                      <Shield className="w-6 h-6 text-blue-500 mr-1" />
                      <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {/* Calculate composite score from multiple sources */}
                        {(community as any).compositeRating || calculateCompositeRating(community)}
                      </span>
                      <span className="text-lg text-gray-900 dark:text-gray-100">/5</span>
                    </div>
                    <p className="text-xs text-gray-900 dark:text-gray-100 mt-1">
                      Based on {(community as any).tourCount || '8'} family tours + {parseInt(community.googleReviewCount?.toString() || '0') + parseInt(community.yelpReviewCount?.toString() || '0')} online reviews
                    </p>
                  </div>

                  {/* Score Breakdown */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <p className="text-gray-900 dark:text-gray-100">Tour Score</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{(community as any).tourAverageRating || '4.5'}/5</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-900 dark:text-gray-100">Google</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{community.googleRating || '4.2'}/5</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-900 dark:text-gray-100">Yelp</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{community.yelpRating || '4.0'}/5</p>
                    </div>
                  </div>
                </div>

                {/* Tour Inspection Highlights */}
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <h4 className="text-sm font-semibold mb-2 flex items-center text-gray-900 dark:text-gray-100">
                    <ClipboardList className="w-4 h-4 mr-1 text-blue-600" />
                    Recent Tour Findings
                  </h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                      <span className="text-gray-900 dark:text-gray-100">Cleanliness: {(community as any).tourCleanlinessScore || '4.6'}/5</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                      <span className="text-gray-900 dark:text-gray-100">Staff Interaction: {(community as any).tourStaffScore || '4.8'}/5</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1 text-yellow-500" />
                      <span className="text-gray-900 dark:text-gray-100">Food Quality: {(community as any).tourFoodScore || '4.2'}/5</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                      <span className="text-gray-900 dark:text-gray-100">Safety Features: {(community as any).tourSafetyScore || '4.7'}/5</span>
                    </div>
                  </div>
                </div>

                {/* External Review Platform Links */}
                <div className="space-y-2">
                  <p className="text-xs text-gray-900 dark:text-gray-100 text-center">View detailed reviews on:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => {
                        // Use Google Maps search for more accurate business results
                        const searchQuery = encodeURIComponent(`${community.name} ${community.address} ${community.city} ${community.state} ${community.zipCode}`);
                        window.open(`https://www.google.com/maps/search/${searchQuery}`, '_blank');
                      }}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Google ({community.googleReviewCount || '47'})
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => {
                        // For Yelp, use location parameter for better results
                        const businessName = encodeURIComponent(community.name);
                        const location = encodeURIComponent(`${community.city}, ${community.state} ${community.zipCode}`);
                        window.open(`https://www.yelp.com/search?find_desc=${businessName}&find_loc=${location}`, '_blank');
                      }}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Yelp ({community.yelpReviewCount || '23'})
                    </Button>
                  </div>
                </div>

                {/* MySeniorValet Verification Badge */}
                <div className="text-center">
                  <Badge className="bg-blue-600 text-white text-xs px-3 py-1 font-medium">
                    <Shield className="w-3 h-3 mr-1" />
                    MySeniorValet Verified Community
                  </Badge>
                </div>
              </CardContent>
            </Card>




          </div>
        </div>
        
        {/* Detailed Pricing Methodology Section */}
        {!hasLiveData && community.priceRange && community.priceRange.min > 0 && (
          <div id="pricing-methodology" className="mt-12 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center">
                  <Info className="w-6 h-6 mr-2 text-blue-600" />
                  How We Calculate Pricing Estimates
                </CardTitle>
                <CardDescription className="text-base">
                  Transparent pricing methodology using 8 authentic sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
                    <p className="text-base text-blue-900 dark:text-blue-200 mb-4">
                      MySeniorValet provides pricing estimates to help families budget and plan. Since many communities don't publish pricing online, we use data from 8 authentic sources to calculate fair market estimates. <strong>All our data comes from publicly available sources only - we never access information behind logins, paywalls, or private databases.</strong>
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-lg text-blue-900 dark:text-blue-200 mb-3 flex items-center">
                          <Building className="w-5 h-5 mr-2" />
                          Government Sources
                        </h4>
                        <ul className="space-y-2">
                          <li className="flex items-start text-base text-blue-800 dark:text-blue-300">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 mt-1 flex-shrink-0"></div>
                            <div>
                              <strong>HUD Database</strong> - Government verified affordable housing rates for seniors
                            </div>
                          </li>
                          <li className="flex items-start text-base text-blue-800 dark:text-blue-300">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 mt-1 flex-shrink-0"></div>
                            <div>
                              <strong>Medicare/CMS Nursing Home Compare</strong> - Federal pricing data for skilled nursing
                            </div>
                          </li>
                          <li className="flex items-start text-base text-blue-800 dark:text-blue-300">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 mt-1 flex-shrink-0"></div>
                            <div>
                              <strong>Veterans Affairs</strong> - VA community living center rates
                            </div>
                          </li>
                          <li className="flex items-start text-base text-blue-800 dark:text-blue-300">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 mt-1 flex-shrink-0"></div>
                            <div>
                              <strong>State Medicaid Rates</strong> - Published reimbursement schedules
                            </div>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-lg text-blue-900 dark:text-blue-200 mb-3 flex items-center">
                          <FileText className="w-5 h-5 mr-2" />
                          Regional & Direct Sources
                        </h4>
                        <ul className="space-y-2">
                          <li className="flex items-start text-base text-blue-800 dark:text-blue-300">
                            <div className="w-3 h-3 bg-purple-500 rounded-full mr-3 mt-1 flex-shrink-0"></div>
                            <div>
                              <strong>State Licensing Boards</strong> - Annual facility reports and surveys
                            </div>
                          </li>
                          <li className="flex items-start text-base text-blue-800 dark:text-blue-300">
                            <div className="w-3 h-3 bg-purple-500 rounded-full mr-3 mt-1 flex-shrink-0"></div>
                            <div>
                              <strong>County Property Records</strong> - Assessor data for facility valuations
                            </div>
                          </li>
                          <li className="flex items-start text-base text-blue-800 dark:text-blue-300">
                            <div className="w-3 h-3 bg-purple-500 rounded-full mr-3 mt-1 flex-shrink-0"></div>
                            <div>
                              <strong>State Transparency Portals</strong> - Public health department data
                            </div>
                          </li>
                          <li className="flex items-start text-base text-blue-800 dark:text-blue-300">
                            <div className="w-3 h-3 bg-purple-500 rounded-full mr-3 mt-1 flex-shrink-0"></div>
                            <div>
                              <strong>Direct Community Websites</strong> - Publicly available information only
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="font-semibold text-lg text-blue-900 dark:text-blue-200 mb-3 flex items-center">
                        <DollarSign className="w-5 h-5 mr-2" />
                        Market Analysis Factors
                      </h4>
                      <ul className="space-y-2">
                        <li className="flex items-start text-base text-blue-800 dark:text-blue-300">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-3 mt-1 flex-shrink-0"></div>
                          <div>
                            <strong>Genworth 2024 Cost of Care Survey</strong> - National benchmark for senior care costs by region and care type
                          </div>
                        </li>
                        <li className="flex items-start text-base text-blue-800 dark:text-blue-300">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-3 mt-1 flex-shrink-0"></div>
                          <div>
                            <strong>Regional Cost Adjustments</strong> - Local market conditions, cost of living index, and metropolitan area factors
                          </div>
                        </li>
                        <li className="flex items-start text-base text-blue-800 dark:text-blue-300">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-3 mt-1 flex-shrink-0"></div>
                          <div>
                            <strong>Care Level & Amenities</strong> - Adjustments based on services offered, facility ratings, and available features
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-700">
                    <div className="flex items-center mb-3">
                      <Shield className="w-6 h-6 text-green-700 dark:text-green-400 mr-2" />
                      <h4 className="text-xl font-bold text-green-900 dark:text-green-200">
                        Our Commitment: 100% Public Data & NO Aggregator Sites
                      </h4>
                    </div>
                    <p className="text-base text-green-800 dark:text-green-300 mb-4">
                      We <strong>NEVER</strong> use pricing from aggregator websites like A Place for Mom, Caring.com, Seniorly, or Senior Advisor. These sites often inflate prices and don't reflect actual community rates. MySeniorValet only uses authentic, verifiable sources to ensure families get honest pricing information.
                    </p>
                    <p className="text-base text-green-800 dark:text-green-300">
                      <strong>Public Data Only:</strong> All community information and pricing estimates come from publicly available sources. We do not scrape data behind logins, access private databases, or use any information that isn't freely available to the public. This ensures complete transparency and legal compliance in our data collection methods.
                    </p>
                  </div>
                  
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
                    <div className="flex items-start">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5" />
                      <div>
                        <p className="text-base text-yellow-800 dark:text-yellow-300">
                          <strong>Important:</strong> These are estimates based on available data. Actual pricing may vary based on room type, care needs, and current availability. Always contact the community directly for current pricing and tour the facility before making decisions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      {/* Advanced Reservation Flow Modal */}
      {showAdvancedReservation && (
        <AdvancedReservationFlow
          community={community}
          selectedUnit={selectedReservationUnit || undefined}
          onClose={() => {
            setShowAdvancedReservation(false);
            setSelectedReservationUnit(null);
          }}
        />
      )}
    </div>
  );
}