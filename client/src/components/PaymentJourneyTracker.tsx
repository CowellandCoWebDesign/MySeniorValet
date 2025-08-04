import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  CreditCard, 
  Shield, 
  Sparkles,
  ArrowRight,
  AlertCircle,
  Loader2
} from 'lucide-react';

export interface PaymentStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  icon: React.ComponentType<any>;
  estimatedTime?: string;
  troubleshooting?: string[];
}

interface PaymentJourneyTrackerProps {
  currentStep: string;
  steps: PaymentStep[];
  onStepClick?: (stepId: string) => void;
  showTroubleshooting?: boolean;
  compact?: boolean;
}

export default function PaymentJourneyTracker({ 
  currentStep, 
  steps, 
  onStepClick,
  showTroubleshooting = false,
  compact = false 
}: PaymentJourneyTrackerProps) {
  const [progress, setProgress] = useState(0);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    const newProgress = Math.round((completedSteps / steps.length) * 100);
    
    setProgress(newProgress);
    
    // Animate progress bar
    const timer = setTimeout(() => {
      setAnimatedProgress(newProgress);
    }, 200);
    
    return () => clearTimeout(timer);
  }, [currentStep, steps]);

  const getStepIcon = (step: PaymentStep) => {
    const IconComponent = step.icon;
    
    switch (step.status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'active':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <IconComponent className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      case 'active':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg';
      case 'error':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      default:
        return 'border-gray-200 bg-gray-50 dark:bg-gray-800';
    }
  };

  const currentStepData = steps.find(step => step.id === currentStep);
  const hasErrors = steps.some(step => step.status === 'error');

  if (compact) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="font-medium text-sm">Payment Progress</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {progress}% Complete
            </Badge>
          </div>
          
          <Progress value={animatedProgress} className="h-2 mb-3" />
          
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>{currentStepData?.title || 'Processing...'}</span>
            <span>{steps.filter(s => s.status === 'completed').length} of {steps.length}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Payment Journey Progress
          </CardTitle>
          <Badge variant={hasErrors ? "destructive" : "default"}>
            {progress}% Complete
          </Badge>
        </div>
        <Progress value={animatedProgress} className="h-3" />
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Step Highlight */}
        {currentStepData && (
          <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-700">
            <div className="flex items-start gap-3">
              {getStepIcon(currentStepData)}
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  {currentStepData.title}
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  {currentStepData.description}
                </p>
                {currentStepData.estimatedTime && (
                  <div className="flex items-center gap-1 mt-2">
                    <Clock className="w-3 h-3 text-blue-600" />
                    <span className="text-xs text-blue-600">
                      Est. {currentStepData.estimatedTime}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* All Steps List */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`p-3 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${getStepStatusColor(step.status)}`}
              onClick={() => onStepClick?.(step.id)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getStepIcon(step)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{step.title}</h4>
                    <div className="flex items-center gap-2">
                      {step.estimatedTime && step.status === 'pending' && (
                        <Badge variant="outline" className="text-xs">
                          {step.estimatedTime}
                        </Badge>
                      )}
                      {step.status === 'active' && (
                        <Badge className="text-xs">In Progress</Badge>
                      )}
                      {step.status === 'completed' && (
                        <Badge variant="secondary" className="text-xs">
                          Complete
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {step.description}
                  </p>
                  
                  {/* Troubleshooting for error states */}
                  {step.status === 'error' && showTroubleshooting && step.troubleshooting && (
                    <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                      <p className="text-xs font-medium text-red-700 dark:text-red-300 mb-1">
                        Troubleshooting:
                      </p>
                      <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
                        {step.troubleshooting.map((tip, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span>•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {index < steps.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-gray-400 mt-1" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        {hasErrors && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Need help? Our support team is here to assist.
              </p>
              <Button variant="outline" size="sm">
                Get Support
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Predefined step templates for different payment flows
export const COMMUNITY_PAYMENT_STEPS: PaymentStep[] = [
  {
    id: 'tier-selection',
    title: 'Tier Selection',
    description: 'Choose your community subscription tier',
    status: 'pending',
    icon: Shield,
    estimatedTime: '30 seconds'
  },
  {
    id: 'payment-details',
    title: 'Payment Details',
    description: 'Enter your payment information securely',
    status: 'pending',
    icon: CreditCard,
    estimatedTime: '1-2 minutes'
  },
  {
    id: 'verification',
    title: 'Verification',
    description: 'Secure payment processing and verification',
    status: 'pending',
    icon: Shield,
    estimatedTime: '15-30 seconds',
    troubleshooting: [
      'Ensure your card details are correct',
      'Check if your bank allows online transactions',
      'Try a different payment method if available'
    ]
  },
  {
    id: 'activation',
    title: 'Account Activation',
    description: 'Activating your subscription and features',
    status: 'pending',
    icon: Sparkles,
    estimatedTime: '10 seconds'
  }
];

export const VENDOR_PAYMENT_STEPS: PaymentStep[] = [
  {
    id: 'business-info',
    title: 'Business Information',
    description: 'Complete your vendor profile',
    status: 'pending',
    icon: Shield,
    estimatedTime: '2-3 minutes'
  },
  {
    id: 'tier-selection',
    title: 'Plan Selection',
    description: 'Choose your vendor listing tier',
    status: 'pending',
    icon: Sparkles,
    estimatedTime: '30 seconds'
  },
  {
    id: 'payment-details',
    title: 'Payment Setup',
    description: 'Secure payment processing',
    status: 'pending',
    icon: CreditCard,
    estimatedTime: '1-2 minutes'
  },
  {
    id: 'marketplace-setup',
    title: 'Marketplace Setup',
    description: 'Setting up your vendor profile in our marketplace',
    status: 'pending',
    icon: Shield,
    estimatedTime: '30 seconds'
  }
];