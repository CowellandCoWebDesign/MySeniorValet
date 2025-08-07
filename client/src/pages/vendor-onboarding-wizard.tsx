import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  CheckCircle2, 
  Building2, 
  Camera, 
  MapPin, 
  Briefcase, 
  DollarSign,
  Calendar,
  Users,
  FileText,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Upload,
  Shield,
  Trophy,
  Gem,
  Crown,
  Rocket,
  Target,
  Phone,
  Mail,
  Globe
} from 'lucide-react';
import confetti from 'canvas-confetti';

// AI Assistant Characters
const assistants = {
  guide: {
    name: "Vivi",
    role: "Your Business Guide",
    icon: Sparkles,
    color: "from-purple-500 to-pink-500",
    greeting: "Hi! I'm Vivi, your dedicated business guide. I'll help you set up your vendor profile step by step!"
  },
  success: {
    name: "Max",
    role: "Success Coach",
    icon: Trophy,
    color: "from-green-500 to-emerald-500",
    greeting: "Welcome aboard! I'm Max, and I'll share tips to maximize your success on MySeniorValet."
  },
  analytics: {
    name: "Data",
    role: "Analytics Expert",
    icon: Target,
    color: "from-blue-500 to-cyan-500",
    greeting: "Hello! I'm Data, and I'll help you understand your performance metrics and insights."
  }
};

// Step schemas
const businessDetailsSchema = z.object({
  logo: z.any().optional(),
  tagline: z.string().min(10, "Tagline should be at least 10 characters"),
  fullDescription: z.string().min(100, "Description should be at least 100 characters"),
  yearEstablished: z.string().min(4, "Please enter a valid year"),
  teamSize: z.string().min(1, "Please select team size"),
  certifications: z.array(z.string()).optional(),
  insurance: z.boolean()
});

const serviceDetailsSchema = z.object({
  primaryServices: z.array(z.string()).min(1, "Select at least one service"),
  serviceAreas: z.array(z.string()).min(1, "Select at least one service area"),
  availability: z.object({
    monday: z.boolean(),
    tuesday: z.boolean(),
    wednesday: z.boolean(),
    thursday: z.boolean(),
    friday: z.boolean(),
    saturday: z.boolean(),
    sunday: z.boolean(),
    emergencyService: z.boolean()
  }),
  responseTime: z.string().min(1, "Please select response time")
});

const pricingSchema = z.object({
  pricingModel: z.string().min(1, "Please select pricing model"),
  minimumPrice: z.string().optional(),
  consultationFee: z.string().optional(),
  paymentMethods: z.array(z.string()).min(1, "Select at least one payment method"),
  seniorDiscounts: z.boolean(),
  discountPercentage: z.string().optional()
});

export default function VendorOnboardingWizard() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [vendorTier, setVendorTier] = useState<'basic' | 'featured' | 'national'>('basic');
  const [currentAssistant, setCurrentAssistant] = useState(assistants.guide);
  const [showWelcome, setShowWelcome] = useState(true);

  const steps = [
    { id: 1, title: "Welcome", icon: Rocket, description: "Get started with your vendor journey" },
    { id: 2, title: "Business Details", icon: Building2, description: "Tell us about your business" },
    { id: 3, title: "Services", icon: Briefcase, description: "Define your service offerings" },
    { id: 4, title: "Pricing", icon: DollarSign, description: "Set your pricing structure" },
    { id: 5, title: "Media", icon: Camera, description: "Add photos and videos" },
    { id: 6, title: "Launch", icon: CheckCircle2, description: "Review and go live" }
  ];

  const totalSteps = steps.length;
  const progress = (completedSteps.length / (totalSteps - 1)) * 100;

  // Fetch vendor details to get tier
  useEffect(() => {
    if (vendorId && vendorId !== 'new') {
      fetch(`/api/vendors/${vendorId}`)
        .then(res => res.json())
        .then(data => {
          setVendorTier(data.subscriptionTier || 'basic');
        })
        .catch(err => console.error('Error fetching vendor:', err));
    }
  }, [vendorId]);

  const businessForm = useForm({
    resolver: zodResolver(businessDetailsSchema),
    defaultValues: {
      tagline: '',
      fullDescription: '',
      yearEstablished: '',
      teamSize: '',
      certifications: [],
      insurance: false
    }
  });

  const serviceForm = useForm({
    resolver: zodResolver(serviceDetailsSchema),
    defaultValues: {
      primaryServices: [],
      serviceAreas: [],
      availability: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
        emergencyService: false
      },
      responseTime: ''
    }
  });

  const pricingForm = useForm({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      pricingModel: '',
      paymentMethods: [],
      seniorDiscounts: false
    }
  });

  const handleStepComplete = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
    
    // Show confetti for milestone completions
    if (stepId === 2 || stepId === 5) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      handleStepComplete(currentStep);
      setCurrentStep(currentStep + 1);
      
      // Change assistant based on step
      if (currentStep === 3) setCurrentAssistant(assistants.success);
      if (currentStep === 4) setCurrentAssistant(assistants.analytics);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleLaunch = async () => {
    try {
      // Show big celebration
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      toast({
        title: "🎉 Congratulations!",
        description: "Your vendor profile is now live on MySeniorValet!",
      });

      // Redirect to vendor profile
      setTimeout(() => {
        setLocation(`/vendor/${vendorId}`);
      }, 3000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to launch profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Tier badges
  const tierBadges = {
    basic: { icon: Shield, label: "Basic", color: "bg-gray-100 text-gray-800" },
    featured: { icon: Gem, label: "Featured Partner", color: "bg-blue-100 text-blue-800" },
    national: { icon: Crown, label: "National Partner", color: "bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-900" }
  };

  const TierBadge = tierBadges[vendorTier];

  if (showWelcome && currentStep === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-3xl mx-auto overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-white">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Welcome to MySeniorValet!</h1>
                <Badge className={TierBadge.color}>
                  <TierBadge.icon className="w-4 h-4 mr-1" />
                  {TierBadge.label}
                </Badge>
              </div>
              <p className="text-xl opacity-90">Let's set up your vendor profile together</p>
            </div>
            
            <CardContent className="p-8">
              <div className="flex items-start gap-6 mb-8">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${currentAssistant.color} flex items-center justify-center flex-shrink-0`}>
                  <currentAssistant.icon className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Meet {currentAssistant.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">{currentAssistant.role}</p>
                  <p className="text-gray-700 dark:text-gray-300">{currentAssistant.greeting}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Your onboarding journey includes:</h3>
                  <div className="grid gap-3">
                    {steps.slice(1, -1).map((step) => (
                      <div key={step.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <step.icon className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="font-medium">{step.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {vendorTier !== 'basic' && (
                  <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                    <h4 className="font-semibold mb-2">
                      {vendorTier === 'national' ? '👑 National Partner Benefits' : '💎 Featured Partner Benefits'}
                    </h4>
                    <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                      {vendorTier === 'national' ? (
                        <>
                          <li>• Custom vendor microsite</li>
                          <li>• Priority placement in all searches</li>
                          <li>• Advanced analytics dashboard</li>
                          <li>• Dedicated success manager</li>
                          <li>• Custom marketing campaigns</li>
                          <li>• API access (Coming Soon)</li>
                        </>
                      ) : (
                        <>
                          <li>• Enhanced profile visibility</li>
                          <li>• Performance analytics</li>
                          <li>• Featured badge on listings</li>
                          <li>• Priority support</li>
                        </>
                      )}
                    </ul>
                  </div>
                )}

                <Button 
                  onClick={() => setShowWelcome(false)} 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Let's Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Header */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Vendor Onboarding</h1>
            <Badge className={TierBadge.color}>
              <TierBadge.icon className="w-4 h-4 mr-1" />
              {TierBadge.label}
            </Badge>
          </div>
          
          {/* Progress Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm font-medium">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="mb-4" />
            
            {/* Step Indicators */}
            <div className="flex justify-between">
              {steps.map((step) => {
                const Icon = step.icon;
                const isCompleted = completedSteps.includes(step.id);
                const isCurrent = currentStep === step.id;
                
                return (
                  <div
                    key={step.id}
                    className={`flex flex-col items-center ${
                      isCurrent ? 'text-purple-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCurrent ? 'bg-purple-100 dark:bg-purple-900' : 
                      isCompleted ? 'bg-green-100 dark:bg-green-900' : 
                      'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span className="text-xs mt-1 hidden md:block">{step.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep - 1].title}</CardTitle>
              <CardDescription>{steps[currentStep - 1].description}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Step 2: Business Details */}
              {currentStep === 2 && (
                <form className="space-y-6">
                  <div>
                    <Label>Business Logo</Label>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <Camera className="w-8 h-8 text-gray-400" />
                      </div>
                      <Button variant="outline">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Logo
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tagline">Business Tagline</Label>
                    <Input
                      id="tagline"
                      placeholder="e.g., 'Trusted senior care services since 1995'"
                      {...businessForm.register('tagline')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Full Description</Label>
                    <Textarea
                      id="description"
                      rows={5}
                      placeholder="Tell potential customers about your business, experience, and what makes you special..."
                      {...businessForm.register('fullDescription')}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="year">Year Established</Label>
                      <Input
                        id="year"
                        type="number"
                        placeholder="e.g., 1995"
                        {...businessForm.register('yearEstablished')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="team">Team Size</Label>
                      <Select onValueChange={(value) => businessForm.setValue('teamSize', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select team size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Just me</SelectItem>
                          <SelectItem value="2-5">2-5 employees</SelectItem>
                          <SelectItem value="6-10">6-10 employees</SelectItem>
                          <SelectItem value="11-25">11-25 employees</SelectItem>
                          <SelectItem value="26+">26+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="insurance"
                      onCheckedChange={(checked) => businessForm.setValue('insurance', !!checked)}
                    />
                    <Label htmlFor="insurance">We have liability insurance</Label>
                  </div>
                </form>
              )}

              {/* Step 3: Services */}
              {currentStep === 3 && (
                <form className="space-y-6">
                  <div>
                    <Label>Primary Services</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {[
                        'Moving Services', 'Home Care', 'Medical Equipment', 
                        'Transportation', 'Meal Delivery', 'Housekeeping',
                        'Legal Services', 'Financial Planning', 'Home Modifications'
                      ].map((service) => (
                        <div key={service} className="flex items-center space-x-2">
                          <Checkbox 
                            id={service}
                            onCheckedChange={(checked) => {
                              const current = serviceForm.getValues('primaryServices');
                              if (checked) {
                                serviceForm.setValue('primaryServices', [...current, service]);
                              } else {
                                serviceForm.setValue('primaryServices', current.filter(s => s !== service));
                              }
                            }}
                          />
                          <Label htmlFor={service}>{service}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Service Areas</Label>
                    <Textarea
                      placeholder="Enter cities or zip codes you serve (comma-separated)"
                      onChange={(e) => serviceForm.setValue('serviceAreas', e.target.value.split(',').map(s => s.trim()))}
                    />
                  </div>

                  <div>
                    <Label>Availability</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                        <div key={day} className="flex items-center space-x-2">
                          <Checkbox 
                            id={day}
                            defaultChecked={day !== 'saturday' && day !== 'sunday'}
                            onCheckedChange={(checked) => {
                              const availability = serviceForm.getValues('availability');
                              serviceForm.setValue('availability', { ...availability, [day]: !!checked });
                            }}
                          />
                          <Label htmlFor={day} className="capitalize">{day}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="response">Average Response Time</Label>
                    <Select onValueChange={(value) => serviceForm.setValue('responseTime', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select response time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15min">Within 15 minutes</SelectItem>
                        <SelectItem value="1hour">Within 1 hour</SelectItem>
                        <SelectItem value="4hours">Within 4 hours</SelectItem>
                        <SelectItem value="24hours">Within 24 hours</SelectItem>
                        <SelectItem value="48hours">Within 48 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </form>
              )}

              {/* Step 4: Pricing */}
              {currentStep === 4 && (
                <form className="space-y-6">
                  <div>
                    <Label htmlFor="pricing-model">Pricing Model</Label>
                    <Select onValueChange={(value) => pricingForm.setValue('pricingModel', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pricing model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly Rate</SelectItem>
                        <SelectItem value="flat">Flat Fee</SelectItem>
                        <SelectItem value="quote">Custom Quote</SelectItem>
                        <SelectItem value="subscription">Monthly Subscription</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="min-price">Minimum Service Price</Label>
                      <Input
                        id="min-price"
                        type="number"
                        placeholder="$0.00"
                        {...pricingForm.register('minimumPrice')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="consultation">Consultation Fee</Label>
                      <Input
                        id="consultation"
                        type="number"
                        placeholder="$0.00"
                        {...pricingForm.register('consultationFee')}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Accepted Payment Methods</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {['Cash', 'Check', 'Credit Card', 'Debit Card', 'PayPal', 'Venmo', 'Insurance', 'Medicare'].map((method) => (
                        <div key={method} className="flex items-center space-x-2">
                          <Checkbox 
                            id={method}
                            onCheckedChange={(checked) => {
                              const current = pricingForm.getValues('paymentMethods');
                              if (checked) {
                                pricingForm.setValue('paymentMethods', [...current, method]);
                              } else {
                                pricingForm.setValue('paymentMethods', current.filter(m => m !== method));
                              }
                            }}
                          />
                          <Label htmlFor={method}>{method}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="discounts"
                        onCheckedChange={(checked) => pricingForm.setValue('seniorDiscounts', !!checked)}
                      />
                      <Label htmlFor="discounts">We offer senior discounts</Label>
                    </div>
                    {pricingForm.watch('seniorDiscounts') && (
                      <Input
                        type="number"
                        placeholder="Discount percentage (e.g., 10)"
                        {...pricingForm.register('discountPercentage')}
                      />
                    )}
                  </div>
                </form>
              )}

              {/* Step 5: Media */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <Label>Business Photos</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Add photos of your work, team, or facility to build trust with potential customers
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                          <Camera className="w-8 h-8 text-gray-400" />
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="mt-4 w-full">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photos
                    </Button>
                  </div>

                  {vendorTier !== 'basic' && (
                    <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                      <h4 className="font-semibold mb-2">
                        {vendorTier === 'national' ? '👑 National Partner Media Benefits' : '💎 Featured Partner Media Benefits'}
                      </h4>
                      <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                        <li>• Upload up to {vendorTier === 'national' ? '50' : '20'} photos</li>
                        <li>• Add promotional videos</li>
                        <li>• Virtual tour capability</li>
                        {vendorTier === 'national' && <li>• Professional photo shoot available</li>}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Step 6: Launch */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Ready to Launch!</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Your profile is complete and ready to go live on MySeniorValet
                    </p>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
                      <h4 className="font-semibold mb-4">Profile Summary</h4>
                      <div className="space-y-2 text-left">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Business Details</span>
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Services Configured</span>
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Pricing Set</span>
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Media Uploaded</span>
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={handleLaunch}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      size="lg"
                    >
                      <Rocket className="w-5 h-5 mr-2" />
                      Launch My Profile
                    </Button>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                
                {currentStep < totalSteps ? (
                  <Button onClick={handleNext}>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}