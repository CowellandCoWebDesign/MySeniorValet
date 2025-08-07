import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Heart,
  Star,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  CreditCard
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface CommunityFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website?: string;
  description: string;
  careTypes: string[];
  amenities: string[];
  subscriptionTier: 'verified' | 'standard' | 'featured' | 'platinum';
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  fields: (keyof CommunityFormData)[];
  completed: boolean;
}

const steps: OnboardingStep[] = [
  {
    id: 'basic-info',
    title: 'Community Basics',
    description: 'Essential information about your community',
    fields: ['name', 'address', 'city', 'state', 'zipCode'],
    completed: false
  },
  {
    id: 'contact',
    title: 'Contact Information',
    description: 'How families can reach you',
    fields: ['phone', 'email', 'website'],
    completed: false
  },
  {
    id: 'services',
    title: 'Care & Services',
    description: 'What type of care and amenities you offer',
    fields: ['careTypes', 'amenities', 'description'],
    completed: false
  },
  {
    id: 'subscription',
    title: 'Choose Your Plan',
    description: 'Select the perfect tier for your community',
    fields: ['subscriptionTier'],
    completed: false
  }
];

const careTypeOptions = [
  'Independent Living',
  'Assisted Living',
  'Memory Care',
  'Skilled Nursing',
  'Continuing Care',
  '55+ Active Adult',
  'Mobile Home Community'
];

const amenityOptions = [
  'Swimming Pool',
  'Fitness Center',
  'Library',
  'Beauty Salon',
  'Restaurant/Dining',
  'Transportation',
  'Pet Friendly',
  'Garden/Outdoor Space',
  'Activity Room',
  'Chapel/Worship',
  'Wi-Fi',
  'Emergency Call System'
];

const subscriptionTiers = [
  {
    id: 'verified',
    name: 'Verified Listing',
    price: 'FREE',
    description: 'Basic listing with contact info',
    features: ['Basic contact information', 'Search visibility', 'Mobile responsive page'],
    badge: 'FREE',
    badgeColor: 'bg-green-100 text-green-800'
  },
  {
    id: 'standard',
    name: 'Standard',
    price: '$149/month',
    description: 'Enhanced visibility with photos',
    features: ['Everything in Free', 'Photo gallery', 'Amenity showcase', 'Priority placement'],
    badge: 'POPULAR',
    badgeColor: 'bg-blue-100 text-blue-800',
    recommended: true
  },
  {
    id: 'featured',
    name: 'Featured',
    price: '$249/month',
    description: 'Stand out with premium features',
    features: ['Everything in Standard', 'Featured placement', 'Family messaging', 'Advanced analytics'],
    badge: 'PREMIUM',
    badgeColor: 'bg-purple-100 text-purple-800'
  },
  {
    id: 'platinum',
    name: 'Platinum',
    price: '$349/month',
    description: 'All features + priority support',
    features: ['Everything in Featured', 'Top priority placement', 'DocuSign integration', 'Dedicated support'],
    badge: 'ULTIMATE',
    badgeColor: 'bg-yellow-100 text-yellow-800'
  }
];

const stateOptions = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

interface CommunityCreatorOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (formData: CommunityFormData) => void;
  initialTier?: string;
}

export function CommunityCreatorOnboarding({
  isOpen,
  onClose,
  onComplete,
  initialTier = 'verified'
}: CommunityCreatorOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<CommunityFormData>({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    careTypes: [],
    amenities: [],
    subscriptionTier: initialTier as any
  });
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && initialTier) {
      setFormData(prev => ({ ...prev, subscriptionTier: initialTier as any }));
    }
  }, [isOpen, initialTier]);

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const updateFormData = (field: keyof CommunityFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateCurrentStep = (): boolean => {
    const requiredFields = currentStepData.fields;
    
    for (const field of requiredFields) {
      const value = formData[field];
      if (field === 'careTypes' || field === 'amenities') {
        if (!Array.isArray(value) || value.length === 0) {
          return false;
        }
      } else if (field !== 'website' && field !== 'description') {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return false;
        }
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      toast({
        title: "Please complete all required fields",
        description: "Fill in the highlighted fields before continuing.",
        variant: "destructive"
      });
      return;
    }

    setCompletedSteps(prev => new Set([...prev, currentStep]));

    if (isLastStep) {
      onComplete(formData);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStepData.id) {
      case 'basic-info':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Community Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="e.g., Sunset Manor Senior Living"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => updateFormData('address', e.target.value)}
                placeholder="e.g., 123 Main Street"
                className="mt-1"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => updateFormData('city', e.target.value)}
                  placeholder="Phoenix"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="state">State *</Label>
                <Select value={formData.state} onValueChange={(value) => updateFormData('state', value)}>
                  <SelectTrigger className="mt-1" id="state">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    {stateOptions.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => updateFormData('zipCode', e.target.value)}
                  placeholder="85001"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateFormData('phone', e.target.value)}
                placeholder="(555) 123-4567"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                placeholder="info@sunsetmanor.com"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="website">Website (Optional)</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => updateFormData('website', e.target.value)}
                placeholder="https://www.sunsetmanor.com"
                className="mt-1"
              />
            </div>
          </div>
        );

      case 'services':
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Care Types Offered *</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Select all types of care your community provides
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {careTypeOptions.map(careType => (
                  <div key={careType} className="flex items-center space-x-2">
                    <Checkbox
                      id={careType}
                      checked={formData.careTypes.includes(careType)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFormData('careTypes', [...formData.careTypes, careType]);
                        } else {
                          updateFormData('careTypes', formData.careTypes.filter(t => t !== careType));
                        }
                      }}
                    />
                    <Label htmlFor={careType} className="text-sm font-normal">
                      {careType}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Amenities & Features</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Highlight what makes your community special
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {amenityOptions.map(amenity => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity}
                      checked={formData.amenities.includes(amenity)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFormData('amenities', [...formData.amenities, amenity]);
                        } else {
                          updateFormData('amenities', formData.amenities.filter(a => a !== amenity));
                        }
                      }}
                    />
                    <Label htmlFor={amenity} className="text-sm font-normal">
                      {amenity}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="description">Community Description</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Tell families what makes your community unique
              </p>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Describe your community's atmosphere, philosophy, and what families can expect..."
                rows={4}
                className="mt-1"
              />
            </div>
          </div>
        );

      case 'subscription':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">Choose Your Success Level</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Select the plan that best fits your community's needs. You can upgrade or downgrade anytime.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subscriptionTiers.map(tier => (
                <Card 
                  key={tier.id}
                  className={`cursor-pointer transition-all ${
                    formData.subscriptionTier === tier.id 
                      ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-950' 
                      : 'hover:border-gray-300'
                  } ${tier.recommended ? 'ring-2 ring-blue-200' : ''}`}
                  onClick={() => updateFormData('subscriptionTier', tier.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={tier.badgeColor}>
                        {tier.badge}
                      </Badge>
                      <span className="text-lg font-bold">{tier.price}</span>
                    </div>
                    <CardTitle className="text-base">{tier.name}</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {tier.description}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-1">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {formData.subscriptionTier === tier.id && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="font-medium">Selected</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {formData.subscriptionTier !== 'verified' && (
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Secure Payment Required
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                      Your community profile will be created first, then you'll be redirected to our secure payment page to activate your {subscriptionTiers.find(t => t.id === formData.subscriptionTier)?.name} features.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>30-second payment process</span>
                      <span>•</span>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Instant feature activation</span>
                      <span>•</span>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Cancel anytime</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" style={{ zIndex: 9999 }}>
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Create Your Community Profile
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Step {currentStep + 1} of {steps.length}: {currentStepData.title}
              </p>
            </div>
            <Badge variant="secondary" className="text-xs">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
            </Badge>
          </div>
        </DialogHeader>

        <div className="py-6">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex items-center">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                      ${index === currentStep 
                        ? 'bg-blue-600 text-white' 
                        : completedSteps.has(index)
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }
                    `}>
                      {completedSteps.has(index) ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="ml-2 hidden sm:block">
                      <p className={`text-sm font-medium ${
                        index === currentStep ? 'text-blue-600' : 'text-gray-600 dark:text-gray-300'
                      }`}>
                        {step.title}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-8 sm:w-16 h-0.5 bg-gray-200 dark:bg-gray-700 mx-2" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                {currentStepData.title}
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400">
                {currentStepData.description}
              </p>
            </CardHeader>
            <CardContent>
              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isFirstStep}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-sm"
              >
                Save & Continue Later
              </Button>
              <Button
                onClick={handleNext}
                className="flex items-center gap-2"
              >
                {isLastStep ? (
                  <>
                    <Building2 className="w-4 h-4" />
                    Create Community
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}