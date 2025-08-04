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
import { Briefcase, MapPin, Phone, Mail, Globe, Star, Shield, Users, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { NavigationHeader } from "@/components/NavigationHeader";

interface VendorOnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
}

const VENDOR_STEPS: VendorOnboardingStep[] = [
  {
    id: 'business-info',
    title: 'Business Information',
    description: 'Tell us about your business',
    icon: Briefcase,
    completed: false
  },
  {
    id: 'service-areas',
    title: 'Service Areas',
    description: 'Define where you provide services',
    icon: MapPin,
    completed: false
  },
  {
    id: 'services-offered',
    title: 'Services & Specialties',
    description: 'List your services and specializations',
    icon: Star,
    completed: false
  },
  {
    id: 'credentials',
    title: 'Credentials & Trust',
    description: 'Add licenses, insurance, and certifications',
    icon: Shield,
    completed: false
  },
  {
    id: 'branding',
    title: 'Branding & Media',
    description: 'Upload logo and showcase your work',
    icon: Zap,
    completed: false
  }
];

const VENDOR_CATEGORIES = [
  'Home Healthcare', 'Medical Equipment', 'Transportation Services',
  'Legal Services', 'Financial Planning', 'Insurance Services',
  'Real Estate', 'Moving Services', 'Home Modifications',
  'Meal Delivery', 'Housekeeping', 'Technology Support',
  'Senior Activities', 'Pharmacy Services', 'Hospice Care'
];

const SERVICE_SPECIALTIES = {
  'Home Healthcare': ['Nursing', 'Physical Therapy', 'Occupational Therapy', 'Speech Therapy', 'Companion Care'],
  'Medical Equipment': ['Mobility Aids', 'Hospital Beds', 'Oxygen Equipment', 'Bathroom Safety', 'Daily Living Aids'],
  'Transportation Services': ['Medical Transport', 'Airport Service', 'Grocery Shopping', 'Social Outings', 'Wheelchair Accessible'],
  'Legal Services': ['Elder Law', 'Estate Planning', 'Medicaid Planning', 'Power of Attorney', 'Living Wills'],
  'Financial Planning': ['Retirement Planning', 'Long-term Care Insurance', 'Investment Management', 'Tax Planning', 'Medicare Guidance']
};

export default function VendorOnboarding() {
  const { vendorId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  
  // Form states
  const [formData, setFormData] = useState({
    // Business Info
    businessName: '',
    category: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    yearEstablished: '',
    numberOfEmployees: '',
    
    // Service Areas
    serviceRadius: '25',
    serviceStates: [] as string[],
    serviceCities: '',
    nationalService: false,
    
    // Services
    primaryServices: [] as string[],
    specialties: [] as string[],
    languages: ['English'],
    availability: '24/7',
    emergencyService: false,
    freeConsultation: true,
    
    // Credentials
    licensed: true,
    licenseNumber: '',
    insured: true,
    insuranceAmount: '',
    bonded: false,
    certifications: [] as string[],
    affiliations: [] as string[],
    
    // Branding
    logo: null as File | null,
    tagline: '',
    whyChooseUs: '',
    affiliateLink: '',
    photos: [] as File[]
  });

  const progress = (completedSteps.length / VENDOR_STEPS.length) * 100;

  // Get vendor data if editing
  const { data: vendorData } = useQuery({
    queryKey: [`/api/vendors/${vendorId}`],
    enabled: !!vendorId && vendorId !== 'new'
  });

  const saveProgress = useMutation({
    mutationFn: async (stepId: string) => {
      const endpoint = vendorId === 'new' 
        ? '/api/vendors/onboarding/create'
        : `/api/vendors/${vendorId}/onboarding`;
        
      return apiRequest('POST', endpoint, {
        stepId,
        formData,
        vendorId
      });
    },
    onSuccess: (data, stepId) => {
      setCompletedSteps(prev => [...prev, stepId]);
      toast({
        title: "Progress Saved",
        description: "Your information has been saved successfully."
      });
      
      if (currentStep < VENDOR_STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    }
  });

  const completeOnboarding = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/vendors/${vendorId}/complete-onboarding`, {
        formData
      });
    },
    onSuccess: () => {
      toast({
        title: "Welcome to MySeniorValet!",
        description: "Your vendor profile is now live in our marketplace.",
      });
      
      setTimeout(() => {
        setLocation(`/vendor-dashboard/${vendorId}`);
      }, 2000);
    }
  });

  const renderStepContent = () => {
    const step = VENDOR_STEPS[currentStep];
    
    switch (step.id) {
      case 'business-info':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                  placeholder="Your Business Name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Business Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {VENDOR_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Business Phone *</Label>
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
                <Label htmlFor="email">Business Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="contact@yourbusiness.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://www.yourbusiness.com"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="yearEstablished">Year Established</Label>
                  <Input
                    id="yearEstablished"
                    type="number"
                    value={formData.yearEstablished}
                    onChange={(e) => setFormData(prev => ({ ...prev, yearEstablished: e.target.value }))}
                    placeholder="2010"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="numberOfEmployees">Team Size</Label>
                  <Select 
                    value={formData.numberOfEmployees} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, numberOfEmployees: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-5">1-5</SelectItem>
                      <SelectItem value="6-20">6-20</SelectItem>
                      <SelectItem value="21-50">21-50</SelectItem>
                      <SelectItem value="50+">50+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Business Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Tell families what makes your business special and how you help seniors..."
                rows={4}
                required
              />
            </div>
          </div>
        );
        
      case 'service-areas':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="nationalService"
                checked={formData.nationalService}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, nationalService: checked as boolean }))}
              />
              <Label htmlFor="nationalService">We provide services nationwide</Label>
            </div>
            
            {!formData.nationalService && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="serviceRadius">Service Radius (miles)</Label>
                  <Select 
                    value={formData.serviceRadius} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, serviceRadius: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 miles</SelectItem>
                      <SelectItem value="25">25 miles</SelectItem>
                      <SelectItem value="50">50 miles</SelectItem>
                      <SelectItem value="100">100 miles</SelectItem>
                      <SelectItem value="state">Entire State</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>States You Service</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {['FL', 'TX', 'CA', 'NY', 'PA', 'IL'].map(state => (
                      <div key={state} className="flex items-center space-x-2">
                        <Checkbox
                          id={state}
                          checked={formData.serviceStates.includes(state)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData(prev => ({ ...prev, serviceStates: [...prev.serviceStates, state] }));
                            } else {
                              setFormData(prev => ({ ...prev, serviceStates: prev.serviceStates.filter(s => s !== state) }));
                            }
                          }}
                        />
                        <Label htmlFor={state}>{state}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="serviceCities">Primary Cities (comma separated)</Label>
                  <Input
                    id="serviceCities"
                    value={formData.serviceCities}
                    onChange={(e) => setFormData(prev => ({ ...prev, serviceCities: e.target.value }))}
                    placeholder="Miami, Fort Lauderdale, West Palm Beach"
                  />
                </div>
              </>
            )}
          </div>
        );
        
      case 'services-offered':
        return (
          <div className="space-y-6">
            {formData.category && SERVICE_SPECIALTIES[formData.category as keyof typeof SERVICE_SPECIALTIES] && (
              <div className="space-y-4">
                <Label>Your Specialties</Label>
                <div className="grid grid-cols-2 gap-3">
                  {SERVICE_SPECIALTIES[formData.category as keyof typeof SERVICE_SPECIALTIES].map(specialty => (
                    <div key={specialty} className="flex items-center space-x-2">
                      <Checkbox
                        id={specialty}
                        checked={formData.specialties.includes(specialty)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData(prev => ({ ...prev, specialties: [...prev.specialties, specialty] }));
                          } else {
                            setFormData(prev => ({ ...prev, specialties: prev.specialties.filter(s => s !== specialty) }));
                          }
                        }}
                      />
                      <Label htmlFor={specialty} className="text-sm">{specialty}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Select 
                  value={formData.availability} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, availability: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24/7">24/7 Available</SelectItem>
                    <SelectItem value="business">Business Hours</SelectItem>
                    <SelectItem value="extended">Extended Hours</SelectItem>
                    <SelectItem value="appointment">By Appointment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="emergencyService"
                    checked={formData.emergencyService}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, emergencyService: checked as boolean }))}
                  />
                  <Label htmlFor="emergencyService">Emergency Service Available</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="freeConsultation"
                    checked={formData.freeConsultation}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, freeConsultation: checked as boolean }))}
                  />
                  <Label htmlFor="freeConsultation">Free Consultation</Label>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Languages Spoken</Label>
              <div className="grid grid-cols-3 gap-3">
                {['English', 'Spanish', 'French', 'Mandarin', 'Russian', 'Portuguese'].map(lang => (
                  <div key={lang} className="flex items-center space-x-2">
                    <Checkbox
                      id={lang}
                      checked={formData.languages.includes(lang)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData(prev => ({ ...prev, languages: [...prev.languages, lang] }));
                        } else {
                          setFormData(prev => ({ ...prev, languages: prev.languages.filter(l => l !== lang) }));
                        }
                      }}
                    />
                    <Label htmlFor={lang} className="text-sm">{lang}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'credentials':
        return (
          <div className="space-y-6">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Building trust is crucial. The more credentials you provide, the more families will trust your services.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="licensed"
                    checked={formData.licensed}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, licensed: checked as boolean }))}
                  />
                  <div>
                    <Label htmlFor="licensed" className="font-medium">Licensed</Label>
                    <p className="text-sm text-muted-foreground">State/Federal licensing</p>
                  </div>
                </div>
                {formData.licensed && (
                  <Input
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                    placeholder="License #"
                    className="w-40"
                  />
                )}
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="insured"
                    checked={formData.insured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, insured: checked as boolean }))}
                  />
                  <div>
                    <Label htmlFor="insured" className="font-medium">Insured</Label>
                    <p className="text-sm text-muted-foreground">Liability insurance</p>
                  </div>
                </div>
                {formData.insured && (
                  <Select 
                    value={formData.insuranceAmount} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, insuranceAmount: value }))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Coverage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1M">$1M</SelectItem>
                      <SelectItem value="2M">$2M</SelectItem>
                      <SelectItem value="5M">$5M+</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              
              <div className="flex items-center p-4 border rounded-lg">
                <Checkbox
                  id="bonded"
                  checked={formData.bonded}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, bonded: checked as boolean }))}
                />
                <div className="ml-3">
                  <Label htmlFor="bonded" className="font-medium">Bonded</Label>
                  <p className="text-sm text-muted-foreground">Surety bond protection</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="certifications">Certifications (one per line)</Label>
              <Textarea
                id="certifications"
                placeholder="CPR Certified&#10;Alzheimer's Care Specialist&#10;Medicare Certified"
                rows={3}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  certifications: e.target.value.split('\n').filter(c => c.trim())
                }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="affiliations">Professional Affiliations (one per line)</Label>
              <Textarea
                id="affiliations"
                placeholder="National Association of Home Care&#10;Better Business Bureau A+ Rating"
                rows={3}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  affiliations: e.target.value.split('\n').filter(a => a.trim())
                }))}
              />
            </div>
          </div>
        );
        
      case 'branding':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo">Business Logo</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormData(prev => ({ ...prev, logo: file }));
                      }
                    }}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Label htmlFor="logo-upload" className="cursor-pointer">
                    {formData.logo ? (
                      <div className="space-y-2">
                        <img
                          src={URL.createObjectURL(formData.logo)}
                          alt="Logo preview"
                          className="w-32 h-32 mx-auto object-contain"
                        />
                        <p className="text-sm text-muted-foreground">Click to change</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Zap className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="text-sm font-medium">Upload your logo</p>
                        <p className="text-xs text-muted-foreground">PNG or JPG, max 2MB</p>
                      </div>
                    )}
                  </Label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tagline">Business Tagline</Label>
                <Input
                  id="tagline"
                  value={formData.tagline}
                  onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                  placeholder="e.g., Caring for seniors with compassion since 1995"
                  maxLength={100}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="whyChooseUs">Why Choose Your Business?</Label>
                <Textarea
                  id="whyChooseUs"
                  value={formData.whyChooseUs}
                  onChange={(e) => setFormData(prev => ({ ...prev, whyChooseUs: e.target.value }))}
                  placeholder="What makes your business stand out? Share your unique value proposition..."
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="affiliateLink">Affiliate/Referral Link (optional)</Label>
                <Input
                  id="affiliateLink"
                  type="url"
                  value={formData.affiliateLink}
                  onChange={(e) => setFormData(prev => ({ ...prev, affiliateLink: e.target.value }))}
                  placeholder="https://youraffiliate.com/track/12345"
                />
                <p className="text-xs text-muted-foreground">
                  If you have an affiliate program, we'll include your tracking link
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Work Samples / Photos</Label>
                <div className="border-2 border-dashed rounded-lg p-4">
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setFormData(prev => ({ ...prev, photos: [...prev.photos, ...files] }));
                    }}
                    className="hidden"
                    id="photos-upload"
                  />
                  <Label htmlFor="photos-upload" className="cursor-pointer text-center block">
                    <p className="text-sm">Click to upload work samples</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Show your team, equipment, or completed work
                    </p>
                  </Label>
                </div>
                
                {formData.photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Sample ${index + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              photos: prev.photos.filter((_, i) => i !== index)
                            }));
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
          <h1 className="text-3xl font-bold mb-2">Welcome to MySeniorValet Marketplace!</h1>
          <p className="text-muted-foreground">
            Let's set up your vendor profile to start connecting with senior communities.
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
          {VENDOR_STEPS.map((step, index) => {
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
              {React.createElement(VENDOR_STEPS[currentStep].icon, { className: "h-5 w-5" })}
              {VENDOR_STEPS[currentStep].title}
            </CardTitle>
            <CardDescription>
              {VENDOR_STEPS[currentStep].description}
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
            {currentStep < VENDOR_STEPS.length - 1 ? (
              <Button
                onClick={() => saveProgress.mutate(VENDOR_STEPS[currentStep].id)}
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
                {completeOnboarding.isPending ? "Completing..." : "Go Live!"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}