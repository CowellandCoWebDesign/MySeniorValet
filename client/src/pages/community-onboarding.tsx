import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Phone, Mail, Globe, DollarSign, Bed, Star, Heart, Activity, Utensils, Car } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { NavigationHeader } from "@/components/NavigationHeader";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'basic-info',
    title: 'Basic Information',
    description: 'Update your community name and contact details',
    icon: Building2,
    completed: false
  },
  {
    id: 'pricing',
    title: 'Pricing & Availability',
    description: 'Set your pricing and unit availability',
    icon: DollarSign,
    completed: false
  },
  {
    id: 'amenities',
    title: 'Amenities & Services',
    description: 'Select amenities and healthcare services',
    icon: Heart,
    completed: false
  },
  {
    id: 'specials',
    title: 'Specials & Promotions',
    description: 'Add any red tag specials or move-in incentives',
    icon: Star,
    completed: false
  },
  {
    id: 'photos',
    title: 'Photos & Media',
    description: 'Upload photos to showcase your community',
    icon: Activity,
    completed: false
  }
];

const AMENITIES_OPTIONS = [
  '24/7 Nursing Staff', 'Physical Therapy', 'Memory Care Unit', 'Pet Friendly',
  'Swimming Pool', 'Fitness Center', 'Library', 'Beauty Salon',
  'Transportation Services', 'Outdoor Gardens', 'Game Room', 'Chapel',
  'Movie Theater', 'Restaurant-Style Dining', 'Private Dining Room',
  'Housekeeping', 'Laundry Service', 'WiFi', 'Cable TV', 'Emergency Call System'
];

const HEALTHCARE_SERVICES = [
  'Medication Management', 'Diabetes Care', 'Physical Therapy',
  'Occupational Therapy', 'Speech Therapy', 'Wound Care',
  'Hospice Care', 'Respite Care', 'Rehabilitation Services',
  'Mental Health Support', 'Podiatry', 'Dental Services',
  'Vision Care', 'Hearing Services', 'Nutritionist'
];

export default function CommunityOnboarding() {
  const { communityId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  
  // Form states
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    description: '',
    
    // Pricing
    startingPrice: '',
    maxPrice: '',
    totalUnits: '',
    availableUnits: '',
    unitTypes: [] as string[],
    
    // Amenities
    amenities: [] as string[],
    healthcareServices: [] as string[],
    
    // Specials
    hasSpecials: false,
    specialTitle: '',
    specialDescription: '',
    specialSavings: '',
    specialExpiry: '',
    
    // Photos
    photos: [] as File[]
  });

  // Calculate progress
  const progress = (completedSteps.length / ONBOARDING_STEPS.length) * 100;

  // Get community data if editing existing
  const { data: communityData } = useQuery({
    queryKey: [`/api/communities/${communityId}`],
    enabled: !!communityId && communityId !== 'new'
  });

  useEffect(() => {
    if (communityData) {
      setFormData(prev => ({
        ...prev,
        name: communityData.name || '',
        phone: communityData.phone || '',
        email: communityData.email || '',
        website: communityData.website || '',
        address: communityData.address || '',
        city: communityData.city || '',
        state: communityData.state || '',
        zipCode: communityData.zipCode || '',
        description: communityData.description || '',
        amenities: communityData.amenities || [],
        healthcareServices: communityData.healthcareServices || []
      }));
    }
  }, [communityData]);

  const saveProgress = useMutation({
    mutationFn: async (stepId: string) => {
      const endpoint = communityId === 'new' 
        ? '/api/communities/onboarding/create'
        : `/api/communities/${communityId}/onboarding`;
        
      return apiRequest('POST', endpoint, {
        stepId,
        formData,
        communityId
      });
    },
    onSuccess: (data, stepId) => {
      setCompletedSteps(prev => [...prev, stepId]);
      toast({
        title: "Progress Saved",
        description: "Your information has been saved successfully."
      });
      
      // Move to next step
      if (currentStep < ONBOARDING_STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save your progress. Please try again.",
        variant: "destructive"
      });
    }
  });

  const completeOnboarding = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/communities/${communityId}/complete-onboarding`, {
        formData
      });
    },
    onSuccess: () => {
      toast({
        title: "Welcome Aboard!",
        description: "Your community profile is now live on MySeniorValet.",
      });
      
      // Redirect to community dashboard
      setTimeout(() => {
        setLocation(`/community-dashboard/${communityId}`);
      }, 2000);
    }
  });

  const renderStepContent = () => {
    const step = ONBOARDING_STEPS[currentStep];
    
    switch (step.id) {
      case 'basic-info':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Community Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your community name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 555-5555"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="info@yourcommunity.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Website *</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://www.yourcommunity.com"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="123 Main Street"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Select value={formData.state} onValueChange={(value) => setFormData(prev => ({ ...prev, state: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FL">Florida</SelectItem>
                    <SelectItem value="TX">Texas</SelectItem>
                    <SelectItem value="CA">California</SelectItem>
                    <SelectItem value="NY">New York</SelectItem>
                    {/* Add more states */}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                  placeholder="12345"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Community Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Tell families what makes your community special..."
                rows={4}
              />
            </div>
          </div>
        );
        
      case 'pricing':
        return (
          <div className="space-y-6">
            <Alert>
              <AlertDescription>
                Setting accurate pricing helps families make informed decisions. You can update this anytime.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startingPrice">Starting Monthly Price *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="startingPrice"
                    type="number"
                    value={formData.startingPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, startingPrice: e.target.value }))}
                    className="pl-9"
                    placeholder="3,500"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxPrice">Maximum Monthly Price</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="maxPrice"
                    type="number"
                    value={formData.maxPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxPrice: e.target.value }))}
                    className="pl-9"
                    placeholder="8,000"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalUnits">Total Units *</Label>
                <Input
                  id="totalUnits"
                  type="number"
                  value={formData.totalUnits}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalUnits: e.target.value }))}
                  placeholder="120"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="availableUnits">Currently Available Units *</Label>
                <Input
                  id="availableUnits"
                  type="number"
                  value={formData.availableUnits}
                  onChange={(e) => setFormData(prev => ({ ...prev, availableUnits: e.target.value }))}
                  placeholder="5"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Unit Types Available (check all that apply)</Label>
              <div className="grid grid-cols-2 gap-4">
                {['Studio', '1 Bedroom', '2 Bedroom', 'Suite', 'Shared Room', 'Private Room'].map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={formData.unitTypes.includes(type)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData(prev => ({ ...prev, unitTypes: [...prev.unitTypes, type] }));
                        } else {
                          setFormData(prev => ({ ...prev, unitTypes: prev.unitTypes.filter(t => t !== type) }));
                        }
                      }}
                    />
                    <Label htmlFor={type} className="cursor-pointer">{type}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'amenities':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Community Amenities</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {AMENITIES_OPTIONS.map(amenity => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity}
                        checked={formData.amenities.includes(amenity)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData(prev => ({ ...prev, amenities: [...prev.amenities, amenity] }));
                          } else {
                            setFormData(prev => ({ ...prev, amenities: prev.amenities.filter(a => a !== amenity) }));
                          }
                        }}
                      />
                      <Label htmlFor={amenity} className="cursor-pointer text-sm">{amenity}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Healthcare Services</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {HEALTHCARE_SERVICES.map(service => (
                    <div key={service} className="flex items-center space-x-2">
                      <Checkbox
                        id={service}
                        checked={formData.healthcareServices.includes(service)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData(prev => ({ ...prev, healthcareServices: [...prev.healthcareServices, service] }));
                          } else {
                            setFormData(prev => ({ ...prev, healthcareServices: prev.healthcareServices.filter(s => s !== service) }));
                          }
                        }}
                      />
                      <Label htmlFor={service} className="cursor-pointer text-sm">{service}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'specials':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasSpecials"
                checked={formData.hasSpecials}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasSpecials: checked as boolean }))}
              />
              <Label htmlFor="hasSpecials">We currently have move-in specials or promotions</Label>
            </div>
            
            {formData.hasSpecials && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <Label htmlFor="specialTitle">Special Title *</Label>
                  <Input
                    id="specialTitle"
                    value={formData.specialTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialTitle: e.target.value }))}
                    placeholder="e.g., First Month Free!"
                    required={formData.hasSpecials}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="specialDescription">Description *</Label>
                  <Textarea
                    id="specialDescription"
                    value={formData.specialDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialDescription: e.target.value }))}
                    placeholder="Describe your special offer..."
                    rows={3}
                    required={formData.hasSpecials}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="specialSavings">Savings Amount</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="specialSavings"
                        type="number"
                        value={formData.specialSavings}
                        onChange={(e) => setFormData(prev => ({ ...prev, specialSavings: e.target.value }))}
                        className="pl-9"
                        placeholder="1,000"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="specialExpiry">Expires On</Label>
                    <Input
                      id="specialExpiry"
                      type="date"
                      value={formData.specialExpiry}
                      onChange={(e) => setFormData(prev => ({ ...prev, specialExpiry: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}
            
            <Alert>
              <AlertDescription>
                <strong>Pro Tip:</strong> Communities with active specials receive 40% more inquiries!
              </AlertDescription>
            </Alert>
          </div>
        );
        
      case 'photos':
        return (
          <div className="space-y-6">
            <Alert>
              <AlertDescription>
                Photos are crucial for attracting families. Communities with 5+ photos receive 3x more views.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <Label>Upload Community Photos</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setFormData(prev => ({ ...prev, photos: [...prev.photos, ...files] }));
                  }}
                  className="hidden"
                  id="photo-upload"
                />
                <Label htmlFor="photo-upload" className="cursor-pointer">
                  <div className="space-y-2">
                    <Activity className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-lg font-medium">Click to upload photos</p>
                    <p className="text-sm text-muted-foreground">
                      JPG, PNG up to 5MB each
                    </p>
                  </div>
                </Label>
              </div>
              
              {formData.photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            photos: prev.photos.filter((_, i) => i !== index)
                          }));
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to MySeniorValet!</h1>
          <p className="text-muted-foreground">
            Let's set up your community profile. This should only take about 10 minutes.
          </p>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Setup Progress</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        {/* Step Indicators */}
        <div className="flex flex-wrap gap-2 mb-8">
          {ONBOARDING_STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = completedSteps.includes(step.id);
            
            return (
              <Button
                key={step.id}
                variant={isActive ? "default" : isCompleted ? "secondary" : "outline"}
                size="sm"
                onClick={() => setCurrentStep(index)}
                disabled={!isCompleted && index > currentStep}
              >
                <StepIcon className="h-4 w-4 mr-1" />
                {step.title}
                {isCompleted && <Badge className="ml-2" variant="secondary">✓</Badge>}
              </Button>
            );
          })}
        </div>
        
        {/* Current Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => {
                const CurrentIcon = ONBOARDING_STEPS[currentStep].icon;
                return <CurrentIcon className="h-5 w-5" />;
              })()}
              {ONBOARDING_STEPS[currentStep].title}
            </CardTitle>
            <CardDescription>
              {ONBOARDING_STEPS[currentStep].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          
          <div className="flex gap-2">
            {currentStep < ONBOARDING_STEPS.length - 1 ? (
              <Button
                onClick={() => saveProgress.mutate(ONBOARDING_STEPS[currentStep].id)}
                disabled={saveProgress.isPending}
              >
                {saveProgress.isPending ? "Saving..." : "Save & Continue"}
              </Button>
            ) : (
              <Button
                onClick={() => completeOnboarding.mutate()}
                disabled={completeOnboarding.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {completeOnboarding.isPending ? "Completing..." : "Complete Setup"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}