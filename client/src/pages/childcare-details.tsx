import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Baby, MapPin, Phone, Globe, CheckCircle, ArrowLeft, ArrowRight, Sparkles,
  Clock, DollarSign, Star, Building, Users, Shield, Award, Heart,
  Calendar, School, Home, Bell, MessageSquare, Camera, Wifi,
  UserCheck, Activity, ShieldCheck, FileCheck, BadgeCheck, ClipboardCheck,
  Mail, Utensils, Bus, AlertCircle, Info, Eye, Share2, Navigation,
  BookOpen, GraduationCap, Palette, Music, TreePine, PlayCircle,
  Sun, Moon, Zap, CreditCard, Timer, Lock, CheckSquare, XCircle,
  TrendingUp, BarChart3, Smartphone, Video, Image, Download, ExternalLink,
  ChevronRight, ListOrdered, Brain
} from "lucide-react";
import { ProfessionalNavbar } from "@/components/ProfessionalNavbar";
import { HeroMascotPanel } from "@/components/mascot/HeroMascotPanel";
import { TourScheduler } from "@/components/TourScheduler";
import { MascotLoadingDisplay } from "@/components/MascotLoadingDisplay";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// Hero Photo Carousel Component with Touch Support (adapted for childcare)
const HeroPhotoCarousel = ({ 
  photos, 
  communityName, 
  communityId, 
  community,
  verificationReport
}: { 
  photos: any[], 
  communityName: string, 
  communityId?: number | string,
  community?: any,
  verificationReport?: any
}) => {
  // Dynamically get all available photos with source tracking
  const getAllPhotos = () => {
    console.log('🔍 [HeroPhotoCarousel] Getting all photos for childcare...');
    console.log('📊 Community photos:', community?.photos);
    console.log('📊 Verification report:', verificationReport);
    
    const allPhotos: { url: string; source: 'database' | 'web' | 'placeholder' }[] = [];
    
    // Add database photos first
    if (community?.photos && community.photos.length > 0) {
      console.log(`📸 Found ${community.photos.length} database photos`);
      const dbPhotos = community.photos.map((photo: any) => ({
        url: typeof photo === 'string' ? photo : photo.image_url || photo.url,
        source: 'database' as const
      }));
      allPhotos.push(...dbPhotos);
    }
    
    // Add live web intelligence photos when they arrive - check all possible paths
    let webImages = null;
    
    // Check multiple paths where photos might be stored
    if (verificationReport?.webIntelligence?.images) {
      // Direct from LiveWebIntelligence component
      webImages = verificationReport.webIntelligence.images;
      console.log('✅ Found web intelligence images at verificationReport.webIntelligence.images:', webImages);
    } else if (verificationReport?.verificationResults?.webIntelligence?.images) {
      // From multi-AI verification
      webImages = verificationReport.verificationResults.webIntelligence.images;
      console.log('✅ Found web intelligence images at verificationReport.verificationResults.webIntelligence.images:', webImages);
    } else {
      console.log('❌ No web intelligence images found in verification report');
    }
    
    if (webImages && webImages.length > 0) {
      console.log(`🎯 Adding ${webImages.length} web intelligence photos to carousel`);
      const webPhotos = webImages.map((img: any) => ({
        url: typeof img === 'string' ? img : (img.image_url || img.url || img),
        source: 'web' as const
      }));
      allPhotos.push(...webPhotos);
    }
    
    // Remove duplicates based on URL
    const uniquePhotos = allPhotos.filter((photo, index, self) =>
      index === self.findIndex((p) => p.url === photo.url)
    );
    
    console.log(`📷 Total unique photos: ${uniquePhotos.length}`);
    
    // Return unique photos only if they exist - don't use placeholders
    return uniquePhotos;
  };
  
  // Force update when verification report changes
  const [photoUpdateKey, setPhotoUpdateKey] = useState(0);
  
  // Watch for verification report changes and force re-render
  useEffect(() => {
    const webImages = verificationReport?.webIntelligence?.images || 
                     verificationReport?.verificationResults?.webIntelligence?.images;
    if (webImages && webImages.length > 0) {
      console.log('🎉 Forcing carousel update with new web photos:', webImages.length);
      setPhotoUpdateKey(prev => prev + 1);
    }
  }, [verificationReport]);
  
  const safePhotos = getAllPhotos();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Reset to first photo when photos change
  useEffect(() => {
    if (safePhotos.length > 0) {
      console.log(`📷 Carousel now has ${safePhotos.length} photos to display`);
      if (currentIndex >= safePhotos.length) {
        setCurrentIndex(0);
      }
    }
  }, [safePhotos.length, photoUpdateKey]);
  
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const nextPhoto = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % safePhotos.length);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const prevPhoto = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + safePhotos.length) % safePhotos.length);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
    setIsTransitioning(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.targetTouches[0].clientX;
    setTouchEnd(currentX);
    const diff = currentX - touchStart;
    setTranslateX(diff);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setTranslateX(0);
      setIsDragging(false);
      return;
    }

    const distance = touchStart - touchEnd;
    const threshold = 50;

    if (Math.abs(distance) > threshold && safePhotos.length > 1) {
      if (distance > 0) {
        nextPhoto();
      } else {
        prevPhoto();
      }
    }

    setTranslateX(0);
    setIsDragging(false);
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setTouchStart(e.clientX);
    setIsDragging(true);
    setIsTransitioning(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const currentX = e.clientX;
    setTouchEnd(currentX);
    const diff = currentX - touchStart;
    setTranslateX(diff);
  };

  const handleMouseUp = () => {
    if (!touchStart || !touchEnd) {
      setTranslateX(0);
      setIsDragging(false);
      return;
    }

    const distance = touchStart - touchEnd;
    const threshold = 50;

    if (Math.abs(distance) > threshold && safePhotos.length > 1) {
      if (distance > 0) {
        nextPhoto();
      } else {
        prevPhoto();
      }
    }

    setTranslateX(0);
    setIsDragging(false);
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Debug logging - check both paths
  console.log('HeroPhotoCarousel debug:', {
    communityPhotos: community?.photos,
    webIntelligenceImages: verificationReport?.webIntelligence?.images || verificationReport?.verificationResults?.webIntelligence?.images,
    safePhotos: safePhotos,
    currentIndex,
    verificationReportExists: !!verificationReport,
    webIntelligenceExists: !!(verificationReport?.webIntelligence?.images || verificationReport?.verificationResults?.webIntelligence?.images)
  });

  // Check if we're still loading photos from web intelligence - check both possible paths
  const webImages = verificationReport?.webIntelligence?.images || 
                   verificationReport?.verificationResults?.webIntelligence?.images;
  const isLoadingWebPhotos = false; // Photos load quickly enough that we don't need loading state
  const hasNoRealPhotos = safePhotos.length === 0;
  
  console.log('Photo loading state:', {
    isLoadingWebPhotos,
    hasNoRealPhotos,
    safePhotos,
    verificationReport: !!verificationReport
  });

  // Show The Thinker loading screen when no photos available or photos are loading
  if (hasNoRealPhotos || isLoadingWebPhotos) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
        <div className="scale-75 max-w-md">
          <MascotLoadingDisplay 
            title="Deep in Thought..."
            subtitle={`Gathering authentic photos for ${communityName}`}
            showProgress={true}
            progressDuration={10}
            factRotationSpeed={3000}
            compact={true}
            processStages={[
              "Searching official website for photos",
              "Scanning social media and listings",
              "Analyzing image quality and authenticity",
              "Verifying photo sources and ownership",
              "Organizing visual content library"
            ]}
          />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="absolute inset-0 group cursor-grab active:cursor-grabbing"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Photo Carousel Container */}
      <div className="w-full h-full bg-gray-100 dark:bg-gray-800 relative">
        <div className="w-full h-full overflow-hidden">
          <div 
            className="flex h-full"
            style={{
              transform: `translateX(calc(-${currentIndex * 100}% + ${translateX}px))`,
              transition: isTransitioning || !isDragging ? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
            }}
          >
            {safePhotos.map((photo, index) => {
              // Ensure proper URL handling for scraped photos
              const photoUrl = photo.url.startsWith('http') ? photo.url : 
                             photo.url.startsWith('//') ? `https:${photo.url}` :
                             photo.url.startsWith('/') ? `https://example.com${photo.url}` : 
                             photo.url;
              
              return (
                <div key={`photo-${index}-${photoUpdateKey}`} className="relative w-full h-full flex-shrink-0">
                  <img
                    src={photoUrl}
                    alt={`${communityName} - ${photo.source === 'web' ? 'Web Scraped' : 'Community'} Photo ${index + 1}`}
                    className="w-full h-full object-cover select-none"
                    draggable={false}
                    loading={index === 0 ? "eager" : "lazy"}
                    onLoad={() => {
                      console.log(`✅ Successfully loaded photo ${index + 1}:`, photoUrl);
                    }}
                    onError={(e) => {
                      console.log(`❌ Failed to load photo ${index + 1}:`, photoUrl);
                      // Replace with working fallback image
                      const target = e.target as HTMLImageElement;
                      target.src = '/hero-senior-community.svg';
                    }}
                  />
                  {/* Attribution for web-sourced photos */}
                  {photo.source === 'web' && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        <span>Sourced from public web</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation arrows - only show if more than 1 photo */}
      {safePhotos.length > 1 && (
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

          {/* Photo indicator dots - fixed size to prevent stretching */}
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-10">
            {safePhotos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`block w-2 h-2 min-w-[8px] min-h-[8px] max-w-[8px] max-h-[8px] rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
                aria-label={`Go to photo ${index + 1}`}
              />
            ))}
          </div>

          {/* Photo counter */}
          <div className="absolute top-4 left-4 flex gap-2 z-10">
            <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {safePhotos.length}
            </div>
          </div>

          {/* Swipe instruction on mobile - now properly at the bottom */}
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-xs opacity-70 md:hidden z-10">
            Swipe to browse photos
          </div>
        </>
      )}
    </div>
  );
};

interface ChildcareCenter {
  id: string | number;
  name: string;
  description?: string;
  city?: string;
  state?: string;
  address?: string;
  phone?: string;
  website?: string;
  pricing?: string;
  ageRange?: string;
  rating?: number;
  isDiscovered?: boolean;
  type?: string;
  
  // Enhanced fields
  licenseNumber?: string;
  licenseStatus?: 'Active' | 'Pending' | 'Expired';
  capacity?: number;
  currentEnrollment?: number;
  waitlistLength?: number;
  staffChildRatio?: string;
  hoursOfOperation?: string;
  mealsProvided?: boolean;
  transportProvided?: boolean;
  specialPrograms?: string[];
  accreditations?: string[];
  inspectionScore?: number;
  lastInspectionDate?: string;
  incidentReports?: number;
  yearEstablished?: number;
  acceptsSubsidy?: boolean;
  
  // ProCare-inspired features
  dailyUpdates?: boolean;
  parentApp?: boolean;
  liveCamera?: boolean;
  digitalPayments?: boolean;
  instantMessaging?: boolean;
  
  // Additional details for full page
  philosophy?: string;
  curriculum?: string[];
  staffQualifications?: string[];
  safetyFeatures?: string[];
  outdoorSpace?: boolean;
  napArea?: boolean;
  secureEntry?: boolean;
  allergySafe?: boolean;
  languages?: string[];
  virtualTour?: string;
  photos?: string[];
  ageGroupAvailability?: {
    infant?: { available: number; total: number; price: string };
    toddler?: { available: number; total: number; price: string };
    preschool?: { available: number; total: number; price: string };
    schoolAge?: { available: number; total: number; price: string };
  };
  reviews?: Array<{
    author: string;
    rating: number;
    text: string;
    date: string;
  }>;
  pricingDetails?: {
    infant?: string;
    toddler?: string;
    preschool?: string;
    schoolAge?: string;
    registration?: string;
    materials?: string;
    meals?: string;
    latePickup?: string;
    discounts?: string[];
  };
  schedule?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
}

export default function ChildcareDetails() {
  const [match, params] = useRoute("/childcare/:id");
  const [center, setCenter] = useState<ChildcareCenter | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isFavorited, setIsFavorited] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [verificationReport, setVerificationReport] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (match && params?.id) {
      loadChildcareDetails(params.id);
    }
  }, [match, params?.id]);

  const loadChildcareDetails = async (id: string) => {
    setLoading(true);
    try {
      // Try to load from API
      const response = await fetch(`/api/communities/${id}`);
      if (response.ok) {
        const data = await response.json();
        // Enhance with mock detailed data for demonstration
        setCenter({
          ...data,
          // Mock enhanced fields for demonstration
          licenseNumber: data.licenseNumber || 'FL-PCB-2024-' + id.slice(-4),
          licenseStatus: 'Active',
          capacity: 120,
          currentEnrollment: 98,
          waitlistLength: 24,
          staffChildRatio: '1:4 (Infant), 1:6 (Toddler), 1:10 (Preschool)',
          hoursOfOperation: '6:30 AM - 6:30 PM',
          mealsProvided: true,
          transportProvided: true,
          specialPrograms: ['Montessori', 'STEM', 'Spanish Immersion', 'Music & Movement'],
          accreditations: ['NAEYC', 'Florida Gold Seal', 'Apple Accredited'],
          inspectionScore: 96,
          lastInspectionDate: '2024-11-15',
          incidentReports: 0,
          yearEstablished: 2015,
          acceptsSubsidy: true,
          dailyUpdates: true,
          parentApp: true,
          liveCamera: true,
          digitalPayments: true,
          instantMessaging: true,
          philosophy: 'We believe in nurturing the whole child through play-based learning, fostering creativity, independence, and a love for learning that lasts a lifetime.',
          curriculum: ['Creative Curriculum', 'Handwriting Without Tears', 'Zoo-phonics', 'Everyday Mathematics'],
          staffQualifications: [
            'All teachers hold CDA or higher',
            'CPR and First Aid certified',
            'Background checked and fingerprinted',
            'Minimum 2 years experience',
            '40 hours annual training'
          ],
          safetyFeatures: [
            'Secure keypad entry system',
            'Security cameras in all rooms',
            'Fenced outdoor play areas',
            'Daily health checks',
            'Allergy-aware environment',
            'Emergency evacuation plans'
          ],
          outdoorSpace: true,
          napArea: true,
          secureEntry: true,
          allergySafe: true,
          languages: ['English', 'Spanish', 'French'],
          pricingDetails: {
            infant: '$320/week (6 weeks - 12 months)',
            toddler: '$290/week (12 - 24 months)',
            preschool: '$260/week (2 - 4 years)',
            schoolAge: '$180/week (5 - 12 years)',
            registration: '$150 one-time fee',
            materials: '$50/year',
            meals: 'Included (breakfast, lunch, snacks)',
            latePickup: '$1/minute after 6:30 PM',
            discounts: ['10% sibling discount', '5% military discount', 'VPK accepted']
          },
          schedule: {
            monday: '6:30 AM - 6:30 PM',
            tuesday: '6:30 AM - 6:30 PM',
            wednesday: '6:30 AM - 6:30 PM',
            thursday: '6:30 AM - 6:30 PM',
            friday: '6:30 AM - 6:30 PM',
            saturday: 'Closed',
            sunday: 'Closed'
          }
        });
      } else {
        // Create mock data for discovered centers
        setCenter({
          id: id,
          name: `Discovery Learning Center ${id}`,
          description: 'A premier childcare facility discovered through our global search system',
          city: 'Panama City Beach',
          state: 'FL',
          address: '123 Beach Boulevard, Panama City Beach, FL 32407',
          phone: '(850) 555-0123',
          website: 'https://example.com',
          pricing: '$250-320/week',
          ageRange: '6 weeks - 12 years',
          rating: 4.7,
          isDiscovered: true,
          type: 'childcare',
          licenseNumber: 'FL-PCB-2024-' + id.slice(-4),
          licenseStatus: 'Active',
          capacity: 120,
          currentEnrollment: 98,
          waitlistLength: 24,
          staffChildRatio: '1:4 (Infant), 1:6 (Toddler), 1:10 (Preschool)',
          hoursOfOperation: '6:30 AM - 6:30 PM',
          mealsProvided: true,
          transportProvided: true,
          specialPrograms: ['Montessori', 'STEM', 'Spanish Immersion', 'Music & Movement'],
          accreditations: ['NAEYC', 'Florida Gold Seal'],
          inspectionScore: 96,
          lastInspectionDate: '2024-11-15',
          incidentReports: 0,
          yearEstablished: 2015,
          acceptsSubsidy: true,
          dailyUpdates: true,
          parentApp: true,
          liveCamera: true,
          digitalPayments: true,
          instantMessaging: true,
          photos: [
            'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=800&h=600',
            'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&h=600',
            'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=600',
            'https://images.unsplash.com/photo-1560159673-d2a75c863dc7?w=800&h=600'
          ],
          ageGroupAvailability: {
            infant: { available: 3, total: 15, price: '$320/week' },
            toddler: { available: 2, total: 20, price: '$290/week' },
            preschool: { available: 8, total: 35, price: '$260/week' },
            schoolAge: { available: 9, total: 50, price: '$180/week' }
          }
        });
      }
    } catch (error) {
      console.error('Error loading childcare details:', error);
      toast({
        title: "Error Loading Details",
        description: "Unable to load childcare center details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleTour = () => {
    toast({
      title: "Tour Request Sent",
      description: "The center will contact you within 24 hours to schedule your tour.",
    });
    setShowContactForm(false);
  };

  const handleJoinWaitlist = () => {
    toast({
      title: "Added to Waitlist",
      description: `You are now #${center?.waitlistLength ? center.waitlistLength + 1 : 1} on the waitlist.`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-purple-900/20">
        <ProfessionalNavbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <Baby className="h-16 w-16 text-pink-500 animate-pulse mx-auto mb-4" />
            <p className="text-lg">Loading childcare center details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!center) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-purple-900/20">
        <ProfessionalNavbar />
        <div className="flex items-center justify-center h-[80vh]">
          <Card className="p-8 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Center Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This childcare center could not be found in our database.
            </p>
            <Link href="/childcare-directory">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Directory
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const availabilityPercentage = center.capacity && center.currentEnrollment 
    ? (center.currentEnrollment / center.capacity) * 100 
    : 0;

  return (
    <>
      <ProfessionalNavbar />
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 dark:from-gray-900 dark:via-pink-900/20 dark:to-purple-900/20 pt-20">
        {/* Breadcrumb */}
        <div className="bg-white/80 dark:bg-gray-800/80 border-b">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <Link href="/childcare-directory">
                <a className="text-pink-600 hover:text-pink-700">Child Care Directory</a>
              </Link>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900 dark:text-white">{center.name}</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Photo Carousel */}
          {center.photos && center.photos.length > 0 && (
            <div className="mb-6">
              <EnhancedPhotoCarousel
                photos={center.photos}
                communityName={center.name}
                className="h-64 md:h-80 lg:h-96 rounded-lg shadow-lg"
                showValidation={false}
                showSourceIndicator={true}
              />
            </div>
          )}

          {/* Header Section */}
          <Card className="mb-6 border-pink-200 dark:border-pink-800 overflow-hidden">
            {/* Trust & Status Bar */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 px-6 py-3 border-b">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  {center.licenseStatus === 'Active' && (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100">
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      Licensed #{center.licenseNumber}
                    </Badge>
                  )}
                  {center.inspectionScore && center.inspectionScore >= 90 && (
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100">
                      <Award className="h-3 w-3 mr-1" />
                      {center.inspectionScore}% Inspection Score
                    </Badge>
                  )}
                  {center.accreditations && center.accreditations.length > 0 && (
                    <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-100">
                      <BadgeCheck className="h-3 w-3 mr-1" />
                      {center.accreditations[0]}
                    </Badge>
                  )}
                </div>
                {center.isDiscovered && (
                  <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Discovered
                  </Badge>
                )}
              </div>
            </div>

            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-3xl flex items-center gap-3 mb-2">
                    <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full">
                      <Baby className="h-8 w-8 text-white" />
                    </div>
                    {center.name}
                  </CardTitle>
                  <CardDescription className="text-lg">
                    {center.description || 'Quality childcare and early education center'}
                  </CardDescription>
                  
                  {/* Location & Contact */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-pink-400" />
                      <span>{center.address || `${center.city}, ${center.state}`}</span>
                    </div>
                    {center.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-pink-400" />
                        <span>{center.phone}</span>
                      </div>
                    )}
                    {center.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-4 w-4 text-pink-400" />
                        <a href={center.website} target="_blank" rel="noopener noreferrer" 
                           className="text-pink-600 hover:text-pink-700 underline">
                          Visit Website
                        </a>
                      </div>
                    )}
                    {center.hoursOfOperation && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-pink-400" />
                        <span>{center.hoursOfOperation}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="hidden lg:block">
                  <Card className="border-pink-200 dark:border-pink-800">
                    <CardContent className="p-4 space-y-3">
                      {center.rating && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Rating</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="font-semibold">{center.rating}/5</span>
                          </div>
                        </div>
                      )}
                      {center.yearEstablished && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Established</span>
                          <span className="font-semibold">{center.yearEstablished}</span>
                        </div>
                      )}
                      {center.capacity && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Capacity</span>
                          <span className="font-semibold">{center.capacity} children</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Enhanced Availability by Age Group */}
              {center.ageGroupAvailability && (
                <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Users className="h-5 w-5 text-green-600" />
                      Available Spots by Age Group
                    </h3>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Total: {center.capacity - center.currentEnrollment} spots available
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(center.ageGroupAvailability).map(([ageGroup, data]) => (
                      <div key={ageGroup} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="text-center">
                          <h4 className="font-semibold text-sm capitalize mb-2 text-gray-800 dark:text-gray-200">
                            {ageGroup === 'schoolAge' ? 'School Age' : ageGroup}
                          </h4>
                          <div className="mb-3">
                            <span className={`text-2xl font-bold ${data.available > 0 ? 'text-green-600' : 'text-red-500'}`}>
                              {data.available}
                            </span>
                            <span className="text-gray-500 text-sm">/{data.total}</span>
                          </div>
                          <div className="mb-3">
                            <Progress 
                              value={((data.total - data.available) / data.total) * 100} 
                              className="h-2 mb-1" 
                            />
                            <span className="text-xs text-gray-500">
                              {data.total - data.available} enrolled
                            </span>
                          </div>
                          <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {data.price}
                          </div>
                          {data.available === 0 && (
                            <Badge className="mt-2 text-xs bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100">
                              Waitlist Only
                            </Badge>
                          )}
                          {data.available > 0 && data.available <= 2 && (
                            <Badge className="mt-2 text-xs bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-100">
                              Limited Spots
                            </Badge>
                          )}
                          {data.available > 5 && (
                            <Badge className="mt-2 text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100">
                              Good Availability
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Overall Stats */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>Total Enrolled: {center.currentEnrollment}</span>
                      <span>Total Capacity: {center.capacity}</span>
                      <span>Waitlist: {center.waitlistLength || 0}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-6">
                <Button 
                  onClick={() => setShowContactForm(true)}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Tour
                </Button>
                <Button 
                  onClick={handleJoinWaitlist}
                  variant="outline"
                  className="border-pink-300 hover:bg-pink-50 dark:hover:bg-pink-900/20"
                >
                  <ListOrdered className="h-4 w-4 mr-2" />
                  Join Waitlist
                </Button>
                <Button 
                  onClick={() => setIsFavorited(!isFavorited)}
                  variant="outline"
                  className="border-pink-300 hover:bg-pink-50 dark:hover:bg-pink-900/20"
                >
                  <Heart className={`h-4 w-4 mr-2 ${isFavorited ? 'fill-current text-pink-500' : ''}`} />
                  {isFavorited ? 'Saved' : 'Save'}
                </Button>
                <Button variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 bg-white/80 dark:bg-gray-800/80">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="programs">Programs</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="tours">Tours</TabsTrigger>
              <TabsTrigger value="safety">Safety</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Philosophy & Approach */}
                <Card className="border-pink-200 dark:border-pink-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-pink-500" />
                      Our Philosophy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300">
                      {center.philosophy || 'We believe in nurturing the whole child through play-based learning, fostering creativity, independence, and a love for learning that lasts a lifetime.'}
                    </p>
                  </CardContent>
                </Card>

                {/* Key Features */}
                <Card className="border-pink-200 dark:border-pink-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Key Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {center.mealsProvided && (
                        <div className="flex items-center gap-2">
                          <Utensils className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Meals Included</span>
                        </div>
                      )}
                      {center.transportProvided && (
                        <div className="flex items-center gap-2">
                          <Bus className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">Transportation</span>
                        </div>
                      )}
                      {center.liveCamera && (
                        <div className="flex items-center gap-2">
                          <Camera className="h-4 w-4 text-purple-500" />
                          <span className="text-sm">Live Cameras</span>
                        </div>
                      )}
                      {center.dailyUpdates && (
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-orange-500" />
                          <span className="text-sm">Daily Updates</span>
                        </div>
                      )}
                      {center.parentApp && (
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-indigo-500" />
                          <span className="text-sm">Parent App</span>
                        </div>
                      )}
                      {center.acceptsSubsidy && (
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-emerald-500" />
                          <span className="text-sm">Subsidy Accepted</span>
                        </div>
                      )}
                      {center.outdoorSpace && (
                        <div className="flex items-center gap-2">
                          <TreePine className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Outdoor Play Area</span>
                        </div>
                      )}
                      {center.secureEntry && (
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-red-500" />
                          <span className="text-sm">Secure Entry</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Age Groups & Ratios */}
                <Card className="border-pink-200 dark:border-pink-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      Age Groups & Ratios
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">Ages Served</span>
                          <Badge variant="secondary">{center.ageRange || '6 weeks - 12 years'}</Badge>
                        </div>
                      </div>
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <div className="font-medium mb-2">Staff to Child Ratios</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {center.staffChildRatio || '1:4 (Infant), 1:6 (Toddler), 1:10 (Preschool)'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Staff Qualifications */}
                <Card className="border-pink-200 dark:border-pink-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-purple-500" />
                      Staff Qualifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {(center.staffQualifications || [
                        'All teachers hold CDA or higher',
                        'CPR and First Aid certified',
                        'Background checked and fingerprinted',
                        'Minimum 2 years experience'
                      ]).map((qual, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span>{qual}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* ProCare-style Transparency Dashboard */}
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-green-600" />
                    Transparency Dashboard
                  </CardTitle>
                  <CardDescription>
                    Real-time information and communication tools
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-lg border ${center.dailyUpdates ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'}`}>
                      <Bell className={`h-6 w-6 mb-2 ${center.dailyUpdates ? 'text-green-500' : 'text-gray-400'}`} />
                      <h4 className="font-semibold">Daily Updates</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {center.dailyUpdates ? 'Real-time activity reports' : 'Not available'}
                      </p>
                    </div>

                    <div className={`p-4 rounded-lg border ${center.liveCamera ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800' : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'}`}>
                      <Camera className={`h-6 w-6 mb-2 ${center.liveCamera ? 'text-purple-500' : 'text-gray-400'}`} />
                      <h4 className="font-semibold">Live Cameras</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {center.liveCamera ? 'Watch your child anytime' : 'Not available'}
                      </p>
                    </div>

                    <div className={`p-4 rounded-lg border ${center.instantMessaging ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'}`}>
                      <MessageSquare className={`h-6 w-6 mb-2 ${center.instantMessaging ? 'text-blue-500' : 'text-gray-400'}`} />
                      <h4 className="font-semibold">Instant Messaging</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {center.instantMessaging ? 'Chat with teachers' : 'Not available'}
                      </p>
                    </div>
                  </div>

                  {center.parentApp && (
                    <Alert className="mt-4 border-green-200 bg-green-50 dark:bg-green-900/20">
                      <Smartphone className="h-4 w-4 text-green-600" />
                      <AlertDescription>
                        This center uses a parent engagement app for seamless communication and updates.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Programs Tab */}
            <TabsContent value="programs" className="space-y-6">
              <Card className="border-pink-200 dark:border-pink-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-indigo-500" />
                    Educational Programs & Curriculum
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Special Programs */}
                  <div>
                    <h4 className="font-semibold mb-3">Special Programs</h4>
                    <div className="flex flex-wrap gap-2">
                      {(center.specialPrograms || ['Montessori', 'STEM', 'Spanish Immersion', 'Music & Movement']).map((program, idx) => (
                        <Badge key={idx} variant="secondary" className="py-1 px-3">
                          <Sparkles className="h-3 w-3 mr-1" />
                          {program}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Curriculum */}
                  <div>
                    <h4 className="font-semibold mb-3">Curriculum Used</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(center.curriculum || ['Creative Curriculum', 'Handwriting Without Tears', 'Zoo-phonics', 'Everyday Mathematics']).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                          <GraduationCap className="h-4 w-4 text-purple-500" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Daily Activities */}
                  <div>
                    <h4 className="font-semibold mb-3">Daily Activities Include</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { icon: Palette, label: 'Arts & Crafts' },
                        { icon: Music, label: 'Music & Movement' },
                        { icon: TreePine, label: 'Outdoor Play' },
                        { icon: BookOpen, label: 'Story Time' },
                        { icon: PlayCircle, label: 'Free Play' },
                        { icon: Brain, label: 'STEM Activities' }
                      ].map((activity, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <activity.icon className="h-4 w-4 text-pink-500" />
                          <span>{activity.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Languages */}
                  {center.languages && center.languages.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Languages Spoken</h4>
                      <div className="flex gap-2">
                        {center.languages.map((lang, idx) => (
                          <Badge key={idx} className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100">
                            <Globe className="h-3 w-3 mr-1" />
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Accreditations */}
              {center.accreditations && center.accreditations.length > 0 && (
                <Card className="border-pink-200 dark:border-pink-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-yellow-500" />
                      Accreditations & Awards
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      {center.accreditations.map((accred, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <BadgeCheck className="h-5 w-5 text-yellow-600" />
                          <span className="font-medium">{accred}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing" className="space-y-6">
              <Card className="border-pink-200 dark:border-pink-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    Tuition & Fees
                  </CardTitle>
                  <CardDescription>
                    All prices are per week unless otherwise noted
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Age-based Pricing */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {center.pricingDetails && Object.entries(center.pricingDetails)
                        .filter(([key]) => ['infant', 'toddler', 'preschool', 'schoolAge'].includes(key))
                        .map(([age, price]) => (
                          <div key={age} className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold capitalize">{age.replace(/([A-Z])/g, ' $1').trim()}</span>
                              <span className="text-lg font-bold text-green-600 dark:text-green-400">{price}</span>
                            </div>
                          </div>
                        ))}
                    </div>

                    <Separator />

                    {/* Additional Fees */}
                    <div>
                      <h4 className="font-semibold mb-3">Additional Fees</h4>
                      <div className="space-y-2">
                        {center.pricingDetails && (
                          <>
                            <div className="flex justify-between py-2 border-b">
                              <span>Registration Fee</span>
                              <span className="font-medium">{center.pricingDetails.registration}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span>Materials Fee</span>
                              <span className="font-medium">{center.pricingDetails.materials}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span>Meals</span>
                              <span className="font-medium text-green-600">{center.pricingDetails.meals}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span>Late Pickup</span>
                              <span className="font-medium">{center.pricingDetails.latePickup}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Discounts */}
                    {center.pricingDetails?.discounts && center.pricingDetails.discounts.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-semibold mb-3">Available Discounts</h4>
                          <div className="flex flex-wrap gap-2">
                            {center.pricingDetails.discounts.map((discount, idx) => (
                              <Badge key={idx} className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100 py-1 px-3">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {discount}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {center.acceptsSubsidy && (
                      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                        <AlertDescription>
                          This center accepts state childcare subsidies and VPK funding. Contact them for eligibility details.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Schedule */}
              <Card className="border-pink-200 dark:border-pink-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    Hours of Operation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {center.schedule && Object.entries(center.schedule).map(([day, hours]) => (
                      <div key={day} className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <span className="font-medium capitalize">{day}</span>
                        <span className={hours === 'Closed' ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}>
                          {hours}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tours Tab */}
            <TabsContent value="tours" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Schedule Visit */}
                <Card className="border-pink-200 dark:border-pink-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-pink-500" />
                      Schedule a Visit
                    </CardTitle>
                    <CardDescription>
                      Meet the teachers, tour the facilities, and see your child's future learning environment
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <School className="h-5 w-5 text-pink-500" />
                        <h4 className="font-semibold">What to Expect</h4>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Tour all classrooms and play areas
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Meet teachers and staff
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Review curriculum and daily schedule
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Discuss enrollment options
                        </li>
                      </ul>
                    </div>
                    
                    <TourScheduler
                      communityId={typeof center.id === 'string' ? parseInt(center.id) : center.id}
                      communityName={center.name}
                      communityAddress={center.address}
                      communityPhone={center.phone}
                      buttonText="Schedule Visit"
                      buttonVariant="default"
                      hasEmail={true}
                    />
                  </CardContent>
                </Card>

                {/* Visit Tips */}
                <Card className="border-pink-200 dark:border-pink-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-500" />
                      Visit Tips
                    </CardTitle>
                    <CardDescription>
                      Make the most of your childcare center visit
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center text-xs font-bold text-pink-600 dark:text-pink-400">1</div>
                        <div>
                          <h4 className="font-medium text-sm">Best Visit Times</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Morning hours (9-11 AM) when children are most active and engaged</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center text-xs font-bold text-pink-600 dark:text-pink-400">2</div>
                        <div>
                          <h4 className="font-medium text-sm">Questions to Ask</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Teacher-to-child ratios, discipline policies, sick child procedures</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center text-xs font-bold text-pink-600 dark:text-pink-400">3</div>
                        <div>
                          <h4 className="font-medium text-sm">What to Observe</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Cleanliness, safety measures, how staff interact with children</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center text-xs font-bold text-pink-600 dark:text-pink-400">4</div>
                        <div>
                          <h4 className="font-medium text-sm">Bring Your Child</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">See how they respond to the environment and teachers</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Virtual Tour (if available) */}
              {center.virtualTour && (
                <Card className="border-pink-200 dark:border-pink-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5 text-blue-500" />
                      Virtual Tour
                    </CardTitle>
                    <CardDescription>
                      Take a virtual walk through our facilities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <Button
                        onClick={() => window.open(center.virtualTour, '_blank')}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Start Virtual Tour
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Safety Tab */}
            <TabsContent value="safety" className="space-y-6">
              <Card className="border-pink-200 dark:border-pink-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-500" />
                    Safety & Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Inspection Results */}
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Latest Inspection</h4>
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100">
                        {center.inspectionScore}% Pass
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p>Last Inspected: {center.lastInspectionDate || 'November 15, 2024'}</p>
                      <p>Incident Reports (12 months): {center.incidentReports || 0}</p>
                    </div>
                  </div>

                  {/* Safety Features */}
                  <div>
                    <h4 className="font-semibold mb-3">Safety Features</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(center.safetyFeatures || [
                        'Secure keypad entry system',
                        'Security cameras in all rooms',
                        'Fenced outdoor play areas',
                        'Daily health checks',
                        'Allergy-aware environment',
                        'Emergency evacuation plans'
                      ]).map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <ShieldCheck className="h-4 w-4 text-green-500 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Special Safety Badges */}
                  <div className="flex flex-wrap gap-2 pt-4">
                    {center.secureEntry && (
                      <Badge variant="secondary">
                        <Lock className="h-3 w-3 mr-1" />
                        Secure Entry
                      </Badge>
                    )}
                    {center.allergySafe && (
                      <Badge variant="secondary">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Allergy Aware
                      </Badge>
                    )}
                    {center.outdoorSpace && (
                      <Badge variant="secondary">
                        <TreePine className="h-3 w-3 mr-1" />
                        Safe Outdoor Area
                      </Badge>
                    )}
                    {center.napArea && (
                      <Badge variant="secondary">
                        <Moon className="h-3 w-3 mr-1" />
                        Dedicated Nap Area
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* License & Compliance */}
              <Card className="border-pink-200 dark:border-pink-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-purple-500" />
                    License & Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                      <span>State License Number</span>
                      <span className="font-mono font-medium">{center.licenseNumber}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded">
                      <span>License Status</span>
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100">
                        {center.licenseStatus}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                      <p className="flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        You can verify this license at the Florida Department of Children and Families website
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contact Information */}
                <Card className="border-pink-200 dark:border-pink-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-pink-500" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-pink-400 mt-0.5" />
                        <div>
                          <p className="font-medium">Address</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {center.address || '123 Beach Boulevard'}
                            <br />
                            {center.city}, {center.state} 32407
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-pink-400 mt-0.5" />
                        <div>
                          <p className="font-medium">Phone</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {center.phone || '(850) 555-0123'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-pink-400 mt-0.5" />
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            info@{center.name?.toLowerCase().replace(/\s/g, '') || 'childcare'}.com
                          </p>
                        </div>
                      </div>
                      
                      {center.website && (
                        <div className="flex items-start gap-3">
                          <Globe className="h-5 w-5 text-pink-400 mt-0.5" />
                          <div>
                            <p className="font-medium">Website</p>
                            <a href={center.website} target="_blank" rel="noopener noreferrer" 
                               className="text-sm text-pink-600 hover:text-pink-700 underline">
                              {center.website}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="flex gap-2">
                      <Button className="flex-1" variant="outline">
                        <Phone className="h-4 w-4 mr-2" />
                        Call Now
                      </Button>
                      <Button className="flex-1" variant="outline">
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="border-pink-200 dark:border-pink-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white justify-start"
                      onClick={() => setShowContactForm(true)}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule a Tour
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Enrollment Forms
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <ListOrdered className="h-4 w-4 mr-2" />
                      Join Waitlist
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Video className="h-4 w-4 mr-2" />
                      Virtual Tour
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Ask a Question
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Map would go here */}
              <Card className="border-pink-200 dark:border-pink-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Navigation className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Interactive map will display here</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Get Directions
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}