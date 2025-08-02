import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Star, 
  MapPin, 
  Search, 
  Heart, 
  Users, 
  Shield, 
  Sparkles,
  ArrowRight,
  CheckCircle,
  Home,
  DollarSign,
  MessageSquare,
  Calendar
} from 'lucide-react';

interface OnboardingWizardProps {
  isOpen: boolean;
  onComplete: (userData: OnboardingData) => void;
  onSkip?: () => void;
}

export interface OnboardingData {
  name: string;
  location: string;
  careType: string[];
  budget: string;
  timeline: string;
  notes: string;
  preferredContact: string;
}

const characters = {
  sage: {
    name: "Sage",
    emoji: "🌟",
    description: "Your wise senior living guide",
    personality: "wise and caring"
  },
  compass: {
    name: "Compass",
    emoji: "🧭", 
    description: "Your navigation specialist",
    personality: "helpful and precise"
  },
  heart: {
    name: "Heart",
    emoji: "💝",
    description: "Your family connection expert",
    personality: "warm and supportive"
  }
};

const steps = [
  {
    id: 'welcome',
    title: 'Welcome to MySeniorValet!',
    character: 'sage',
    content: 'Hello! I\'m Sage, your personal guide through the world of senior living. Think of me as your wise companion who\'s here to help you discover the perfect community for you or your loved one.',
    action: 'Let\'s begin this journey together!'
  },
  {
    id: 'introduction',
    title: 'Tell us about yourself',
    character: 'heart',
    content: 'Hi there! I\'m Heart, and I specialize in understanding what matters most to families. Let\'s start by getting to know you a little better.',
    fields: ['name', 'location']
  },
  {
    id: 'care-needs',
    title: 'What type of care are you exploring?',
    character: 'compass',
    content: 'I\'m Compass, your navigation expert! I\'ll help you understand the different types of senior living communities. Each option offers unique benefits and care levels.',
    fields: ['careType']
  },
  {
    id: 'budget',
    title: 'Let\'s talk about your budget',
    character: 'sage',
    content: 'Here\'s something many people don\'t know: senior housing doesn\'t always require a six-figure budget! We have HUD-verified properties starting at $0/month, and I\'ll show you all your options.',
    fields: ['budget', 'timeline']
  },
  {
    id: 'preferences',
    title: 'Any special preferences?',
    character: 'heart',
    content: 'This is where we make it personal! Tell me about any specific needs, preferences, or questions you have. Every family\'s journey is unique.',
    fields: ['notes', 'preferredContact']
  },
  {
    id: 'complete',
    title: 'You\'re all set!',
    character: 'sage',
    content: 'Wonderful! You\'ve just unlocked the full power of MySeniorValet. I\'ve personalized your experience based on your needs. Ready to explore 34,000+ communities across North America?',
    action: 'Start Exploring!'
  }
];

const careTypes = [
  { id: 'hud', label: 'Income-Qualified Housing', icon: DollarSign, description: 'HUD-verified affordable options' },
  { id: 'independent', label: 'Independent Living', icon: Home, description: 'Active, maintenance-free lifestyle' },
  { id: 'assisted', label: 'Assisted Living', icon: Heart, description: 'Help with daily activities' },
  { id: 'memory', label: 'Memory Care', icon: Shield, description: 'Specialized dementia care' },
  { id: 'skilled', label: 'Skilled Nursing', icon: Users, description: 'Medical care 24/7' },
  { id: 'active', label: '55+ Communities', icon: Star, description: 'Active adult lifestyle' }
];

export function OnboardingWizard({ isOpen, onComplete, onSkip }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState<OnboardingData>({
    name: '',
    location: '',
    careType: [],
    budget: '',
    timeline: '',
    notes: '',
    preferredContact: 'email'
  });

  const step = steps[currentStep];
  const character = characters[step.character as keyof typeof characters];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(userData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCareTypeToggle = (careTypeId: string) => {
    setUserData(prev => ({
      ...prev,
      careType: prev.careType.includes(careTypeId)
        ? prev.careType.filter(id => id !== careTypeId)
        : [...prev.careType, careTypeId]
    }));
  };

  const canProceed = () => {
    if (!step.fields) return true;
    
    return step.fields.every(field => {
      if (field === 'careType') return userData.careType.length > 0;
      if (field === 'notes' || field === 'preferredContact') return true; // Optional fields
      return userData[field as keyof OnboardingData];
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && onSkip) {
        onSkip();
      }
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{character.emoji}</span>
              {step.title}
            </DialogTitle>
            <Badge variant="secondary" className="text-xs">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>
          <Progress value={progress} className="w-full" />
        </DialogHeader>

        <div className="py-6">
          {/* Character Introduction */}
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="text-3xl">{character.emoji}</div>
                <div>
                  <h3 className="font-semibold text-lg">{character.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{character.description}</p>
                  <p className="text-sm">{step.content}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step Content */}
          {step.fields && (
            <div className="space-y-4">
              {step.fields.includes('name') && (
                <div>
                  <Label htmlFor="name">What should we call you?</Label>
                  <Input
                    id="name"
                    value={userData.name}
                    onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your first name"
                    className="mt-1"
                  />
                </div>
              )}

              {step.fields.includes('location') && (
                <div>
                  <Label htmlFor="location">Where are you looking for senior living?</Label>
                  <Input
                    id="location"
                    value={userData.location}
                    onChange={(e) => setUserData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, State or ZIP code"
                    className="mt-1"
                  />
                </div>
              )}

              {step.fields.includes('careType') && (
                <div>
                  <Label>Select all care types you're interested in:</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {careTypes.map((type) => (
                      <Card
                        key={type.id}
                        className={`cursor-pointer transition-all ${
                          userData.careType.includes(type.id)
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                            : 'hover:border-gray-300'
                        }`}
                        onClick={() => handleCareTypeToggle(type.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-2">
                            <type.icon className="h-5 w-5 mt-0.5 text-blue-600" />
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{type.label}</h4>
                              <p className="text-xs text-muted-foreground">{type.description}</p>
                            </div>
                            {userData.careType.includes(type.id) && (
                              <CheckCircle className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {step.fields.includes('budget') && (
                <div>
                  <Label htmlFor="budget">What's your monthly budget range?</Label>
                  <select
                    id="budget"
                    value={userData.budget}
                    onChange={(e) => setUserData(prev => ({ ...prev, budget: e.target.value }))}
                    className="w-full mt-1 p-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                  >
                    <option value="">Select your budget range</option>
                    <option value="hud">$0-$500 (HUD Income-Qualified)</option>
                    <option value="low">$500-$2,000</option>
                    <option value="mid">$2,000-$4,000</option>
                    <option value="high">$4,000-$6,000</option>
                    <option value="premium">$6,000+</option>
                    <option value="flexible">I'm flexible</option>
                  </select>
                </div>
              )}

              {step.fields.includes('timeline') && (
                <div>
                  <Label htmlFor="timeline">When are you looking to move?</Label>
                  <select
                    id="timeline"
                    value={userData.timeline}
                    onChange={(e) => setUserData(prev => ({ ...prev, timeline: e.target.value }))}
                    className="w-full mt-1 p-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                  >
                    <option value="">Select your timeline</option>
                    <option value="immediate">Immediately (within 1 month)</option>
                    <option value="soon">Soon (1-3 months)</option>
                    <option value="planning">Planning ahead (3-6 months)</option>
                    <option value="exploring">Just exploring options</option>
                  </select>
                </div>
              )}

              {step.fields.includes('notes') && (
                <div>
                  <Label htmlFor="notes">Anything specific we should know? (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={userData.notes}
                    onChange={(e) => setUserData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Special needs, preferences, questions..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
              )}

              {step.fields.includes('preferredContact') && (
                <div>
                  <Label>How would you prefer to be contacted?</Label>
                  <div className="flex gap-2 mt-2">
                    {[
                      { id: 'email', label: 'Email', icon: MessageSquare },
                      { id: 'phone', label: 'Phone', icon: MessageSquare },
                      { id: 'both', label: 'Both', icon: MessageSquare }
                    ].map((option) => (
                      <Button
                        key={option.id}
                        variant={userData.preferredContact === option.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setUserData(prev => ({ ...prev, preferredContact: option.id }))}
                      >
                        <option.icon className="h-4 w-4 mr-1" />
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step.id === 'complete' && (
            <div className="text-center space-y-4">
              <div className="text-6xl">{character.emoji}</div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Welcome to MySeniorValet, {userData.name}!</h3>
                <p className="text-muted-foreground">
                  Your personalized senior living journey starts now. We've customized your experience based on your preferences.
                </p>
              </div>
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span>Searching in {userData.location || 'your area'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span>Budget: {userData.budget || 'Flexible'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <span>Timeline: {userData.timeline || 'Exploring'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-600" />
                      <span>{userData.careType.length} care types selected</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="gap-2"
          >
            {currentStep === steps.length - 1 ? (
              <>
                <Sparkles className="h-4 w-4" />
                {step.action}
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}