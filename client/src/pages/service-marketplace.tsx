
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar,
  Clock,
  DollarSign,
  Star,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  ArrowRight,
  Search,
  Filter,
  Heart,
  Share2,
  MessageSquare,
  Shield,
  Zap,
  Truck,
  Home,
  Package,
  Car,
  Briefcase,
  CreditCard,
  Users,
  Award,
  Verified,
  BookOpen,
  AlertCircle,
  Info,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

interface ServiceProvider {
  id: string;
  name: string;
  category: string;
  description: string;
  pricing: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  responseTime: string;
  availability: "immediate" | "within-week" | "scheduled";
  serviceAreas: string[];
  features: string[];
  credentials: string[];
  insurance: boolean;
  backgroundCheck: boolean;
  photos: string[];
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  bookingType: "instant" | "quote" | "consultation";
  commissionRate: number;
}

const serviceProviders: ServiceProvider[] = [
  {
    id: "moving-1",
    name: "Two Men and a Truck - Senior Specialists",
    category: "moving",
    description: "Professional moving services specialized for seniors with careful handling of fragile items and full setup assistance.",
    pricing: "$2,500 - $8,000",
    rating: 4.8,
    reviewCount: 247,
    verified: true,
    responseTime: "within 2 hours",
    availability: "within-week",
    serviceAreas: ["California", "Nevada", "Arizona"],
    features: ["Senior-specialized packers", "Fragile item protection", "Setup at new location", "Insurance coverage", "Storage options"],
    credentials: ["Licensed & Bonded", "BBB A+ Rating", "Senior Move Certified"],
    insurance: true,
    backgroundCheck: true,
    photos: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400"],
    contactInfo: {
      phone: "(555) 123-4567",
      email: "seniors@twomen.com",
      website: "twomenandatruck.com"
    },
    bookingType: "quote",
    commissionRate: 10
  },
  {
    id: "healthcare-1",
    name: "Visiting Angels Home Care",
    category: "healthcare",
    description: "Compassionate in-home care services including personal care, companionship, and medical support.",
    pricing: "$25 - $45/hour",
    rating: 4.9,
    reviewCount: 389,
    verified: true,
    responseTime: "within 1 hour",
    availability: "immediate",
    serviceAreas: ["Nationwide"],
    features: ["Licensed caregivers", "24/7 availability", "Meal preparation", "Medication reminders", "Transportation"],
    credentials: ["State Licensed", "Bonded & Insured", "Background Checked"],
    insurance: true,
    backgroundCheck: true,
    photos: ["https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400", "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400"],
    contactInfo: {
      phone: "(555) 234-5678",
      email: "care@visitingangels.com",
      website: "visitingangels.com"
    },
    bookingType: "consultation",
    commissionRate: 15
  },
  {
    id: "insurance-1",
    name: "Senior Benefits Solutions - AARP Partner",
    category: "insurance",
    description: "Expert Medicare and long-term care insurance guidance with personalized plan recommendations.",
    pricing: "Free consultation",
    rating: 4.7,
    reviewCount: 156,
    verified: true,
    responseTime: "within 4 hours",
    availability: "scheduled",
    serviceAreas: ["All States"],
    features: ["Medicare supplement plans", "Long-term care insurance", "Prescription drug coverage", "Annual enrollment"],
    credentials: ["Licensed Insurance Agent", "AARP Certified", "Medicare Specialist"],
    insurance: true,
    backgroundCheck: true,
    photos: ["https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400", "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400"],
    contactInfo: {
      phone: "(555) 345-6789",
      email: "benefits@seniorsolutions.com",
      website: "aarp.org/insurance"
    },
    bookingType: "consultation",
    commissionRate: 12
  },
  {
    id: "estate-1",
    name: "MaxSold Estate Sales",
    category: "moving",
    description: "Professional estate sale management with online bidding platform and full-service downsizing.",
    pricing: "$1,500 - $5,000",
    rating: 4.6,
    reviewCount: 203,
    verified: true,
    responseTime: "within 24 hours",
    availability: "scheduled",
    serviceAreas: ["California", "Texas", "Florida", "New York"],
    features: ["Professional appraisal", "Online auction platform", "Donation coordination", "Clean-out services"],
    credentials: ["Certified Appraiser", "Estate Sale Licensed", "Insured"],
    insurance: true,
    backgroundCheck: true,
    photos: ["https://images.unsplash.com/photo-1493946740644-2d8a1f1a6aff?w=400", "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400"],
    contactInfo: {
      phone: "(555) 456-7890",
      email: "sales@maxsold.com",
      website: "maxsold.com"
    },
    bookingType: "quote",
    commissionRate: 20
  },
  {
    id: "transport-1",
    name: "GoGoGrandparent Medical Transport",
    category: "transportation",
    description: "Specialized medical transportation with wheelchair accessibility and trained medical drivers.",
    pricing: "$35 - $85/trip",
    rating: 4.8,
    reviewCount: 178,
    verified: true,
    responseTime: "within 30 minutes",
    availability: "immediate",
    serviceAreas: ["Major Metro Areas"],
    features: ["Wheelchair accessible", "Medical equipment transport", "Insurance billing", "Trained drivers"],
    credentials: ["DOT Certified", "Medical Transport Licensed", "Background Checked"],
    insurance: true,
    backgroundCheck: true,
    photos: ["https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400", "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400"],
    contactInfo: {
      phone: "(555) 567-8901",
      email: "rides@gogograndparent.com",
      website: "gogograndparent.com"
    },
    bookingType: "instant",
    commissionRate: 12
  },
  {
    id: "legal-1",
    name: "Elder Law Partners",
    category: "professional",
    description: "Specialized legal services for estate planning, healthcare directives, and Medicaid planning.",
    pricing: "$300 - $600/hour",
    rating: 4.9,
    reviewCount: 124,
    verified: true,
    responseTime: "within 24 hours",
    availability: "scheduled",
    serviceAreas: ["Nationwide"],
    features: ["Estate planning", "Power of attorney", "Healthcare directives", "Medicaid planning"],
    credentials: ["State Bar Certified", "Elder Law Specialist", "Estate Planning Certified"],
    insurance: true,
    backgroundCheck: true,
    photos: ["https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"],
    contactInfo: {
      phone: "(555) 678-9012",
      email: "legal@elderlawpartners.com",
      website: "elderlawpartners.com"
    },
    bookingType: "consultation",
    commissionRate: 15
  }
];

function ServiceBookingForm({ service, onClose, onSuccess }: { service: ServiceProvider, onClose: () => void, onSuccess: () => void }) {
  const [bookingData, setBookingData] = useState({
    serviceType: "",
    preferredDate: "",
    preferredTime: "",
    location: "",
    details: "",
    urgency: "normal"
  });

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate booking submission
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Booking Request Submitted",
        description: `Your request for ${service.name} has been sent. You'll receive a response within ${service.responseTime}.`,
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "There was an error submitting your booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="serviceType">Service Type</Label>
        <Select value={bookingData.serviceType} onValueChange={(value) => setBookingData({...bookingData, serviceType: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Select service type" />
          </SelectTrigger>
          <SelectContent>
            {service.features.map((feature) => (
              <SelectItem key={feature} value={feature}>{feature}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="preferredDate">Preferred Date</Label>
          <Input
            type="date"
            value={bookingData.preferredDate}
            onChange={(e) => setBookingData({...bookingData, preferredDate: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="preferredTime">Preferred Time</Label>
          <Select value={bookingData.preferredTime} onValueChange={(value) => setBookingData({...bookingData, preferredTime: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="morning">Morning (8AM - 12PM)</SelectItem>
              <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
              <SelectItem value="evening">Evening (5PM - 8PM)</SelectItem>
              <SelectItem value="flexible">Flexible</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="location">Service Location</Label>
        <Input
          placeholder="Enter address or zip code"
          value={bookingData.location}
          onChange={(e) => setBookingData({...bookingData, location: e.target.value})}
          required
        />
      </div>

      <div>
        <Label htmlFor="urgency">Urgency Level</Label>
        <Select value={bookingData.urgency} onValueChange={(value) => setBookingData({...bookingData, urgency: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="immediate">Immediate (ASAP)</SelectItem>
            <SelectItem value="urgent">Urgent (Within 24 hours)</SelectItem>
            <SelectItem value="normal">Normal (Within a week)</SelectItem>
            <SelectItem value="flexible">Flexible (Schedule around availability)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="details">Additional Details</Label>
        <Textarea
          placeholder="Please provide any additional information about your needs..."
          value={bookingData.details}
          onChange={(e) => setBookingData({...bookingData, details: e.target.value})}
          rows={3}
        />
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Info className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">What happens next?</span>
        </div>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Provider will review your request within {service.responseTime}</li>
          <li>• You'll receive a detailed quote or consultation scheduling</li>
          <li>• MySeniorValet charges a $1.95 connection fee only</li>
          <li>• All service fees are paid directly to the provider</li>
        </ul>
      </div>

      <div className="flex space-x-3">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          Submit Request
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </form>
  );
}

function ServiceCard({ service }: { service: ServiceProvider }) {
  const [showBooking, setShowBooking] = useState(false);
  const { toast } = useToast();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "moving": return Truck;
      case "healthcare": return Heart;
      case "insurance": return Shield;
      case "transportation": return Car;
      case "professional": return Briefcase;
      default: return Package;
    }
  };

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case "immediate":
        return <Badge className="bg-green-600 text-white">Available Now</Badge>;
      case "within-week":
        return <Badge className="bg-blue-600 text-white">Within Week</Badge>;
      case "scheduled":
        return <Badge className="bg-orange-600 text-white">By Appointment</Badge>;
      default:
        return null;
    }
  };

  const Icon = getCategoryIcon(service.category);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="relative">
        <img 
          src={service.photos[0]} 
          alt={service.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <div className="absolute top-3 left-3">
          {getAvailabilityBadge(service.availability)}
        </div>
        <div className="absolute top-3 right-3">
          {service.verified && (
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
              <Verified className="h-4 w-4 text-blue-600" />
            </div>
          )}
        </div>
      </div>

      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Icon className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
              {service.name}
            </h3>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{service.rating}</span>
            <span className="text-xs text-gray-500">({service.reviewCount})</span>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {service.description}
        </p>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Pricing</span>
            <span className="font-medium text-green-600">{service.pricing}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Response Time</span>
            <span className="text-sm font-medium">{service.responseTime}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Commission</span>
            <span className="text-sm font-medium text-purple-600">{service.commissionRate}%</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {service.features.slice(0, 3).map((feature, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {feature}
            </Badge>
          ))}
          {service.features.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{service.features.length - 3} more
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2 mb-4">
          {service.insurance && (
            <div className="flex items-center space-x-1">
              <Shield className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">Insured</span>
            </div>
          )}
          {service.backgroundCheck && (
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3 text-blue-600" />
              <span className="text-xs text-blue-600">Background Checked</span>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <Dialog open={showBooking} onOpenChange={setShowBooking}>
            <DialogTrigger asChild>
              <Button className="flex-1">
                {service.bookingType === "instant" ? "Book Now" : 
                 service.bookingType === "quote" ? "Get Quote" : "Schedule Consultation"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Book Service: {service.name}</DialogTitle>
                <DialogDescription>
                  Fill out the form below to request this service. A $1.95 connection fee applies.
                </DialogDescription>
              </DialogHeader>
              <ServiceBookingForm 
                service={service} 
                onClose={() => setShowBooking(false)}
                onSuccess={() => {
                  toast({
                    title: "Booking Successful",
                    description: "Your service request has been submitted successfully.",
                  });
                }}
              />
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ServiceMarketplace() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  const categories = [
    { id: "all", name: "All Services", icon: Package },
    { id: "moving", name: "Moving & Relocation", icon: Truck },
    { id: "healthcare", name: "Healthcare", icon: Heart },
    { id: "insurance", name: "Insurance & Financial", icon: Shield },
    { id: "transportation", name: "Transportation", icon: Car },
    { id: "professional", name: "Professional Services", icon: Briefcase }
  ];

  const filteredServices = serviceProviders.filter(service => {
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = !selectedLocation || service.serviceAreas.some(area => 
      area.toLowerCase().includes(selectedLocation.toLowerCase())
    );
    
    return matchesCategory && matchesSearch && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Senior Living Service Marketplace
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Professional services for every aspect of senior living transitions - from moving and healthcare to insurance and legal support.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search Services</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by service name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="location">Service Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  placeholder="Enter city or state..."
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="grid w-full grid-cols-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <TabsTrigger key={category.id} value={category.id} className="flex items-center space-x-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{category.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {filteredServices.length} Services Available
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Verified, licensed providers ready to help
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className="bg-green-600 text-white">
              <CheckCircle className="h-3 w-3 mr-1" />
              All Verified
            </Badge>
            <Badge className="bg-blue-600 text-white">
              <Shield className="h-3 w-3 mr-1" />
              Insured & Bonded
            </Badge>
          </div>
        </div>

        {/* Service Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>

        {/* Empty State */}
        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No services found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Try adjusting your search criteria or browse all available services.
            </p>
            <Button onClick={() => {
              setSearchQuery("");
              setSelectedLocation("");
              setSelectedCategory("all");
            }}>
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Trust Indicators */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Our Service Marketplace?
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Verified className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Verified Providers</h4>
              <p className="text-gray-600 dark:text-gray-300">
                All providers are licensed, insured, and background-checked for your safety.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Transparent Pricing</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Only $1.95 connection fee. All service costs are clearly displayed upfront.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Quality Guarantee</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Satisfaction guaranteed with our quality assurance and customer support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
