import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  MousePointer, 
  ZoomIn, 
  ZoomOut, 
  Move, 
  MapPin,
  Eye,
  Hand,
  CheckCircle
} from 'lucide-react';

interface MapTutorialProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  visualCue?: string;
  tip?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: "Welcome to Map Navigation",
    description: "This quick tutorial will help you explore communities on the map with confidence. We'll go through each feature step by step.",
    icon: <MapPin className="w-6 h-6 text-blue-600" />,
    action: "Click 'Next' when you're ready to start",
    tip: "Take your time - there's no rush!"
  },
  {
    id: 2,
    title: "Moving Around the Map",
    description: "To explore different areas, simply click and drag anywhere on the map. This is like moving a piece of paper around on a table.",
    icon: <Move className="w-6 h-6 text-green-600" />,
    action: "Try clicking and dragging the map now",
    visualCue: "drag",
    tip: "Hold down your mouse button and move it around"
  },
  {
    id: 3,
    title: "Zooming In for Details",
    description: "To see communities more clearly, you can zoom in. Use the + button in the corner or scroll your mouse wheel up.",
    icon: <ZoomIn className="w-6 h-6 text-purple-600" />,
    action: "Try zooming in using the + button",
    visualCue: "zoom-in",
    tip: "Each zoom level shows more detail"
  },
  {
    id: 4,
    title: "Zooming Out for Overview",
    description: "To see a larger area with more communities, zoom out using the - button or scroll your mouse wheel down.",
    icon: <ZoomOut className="w-6 h-6 text-orange-600" />,
    action: "Try zooming out using the - button",
    visualCue: "zoom-out",
    tip: "Zoom out to see the bigger picture"
  },
  {
    id: 5,
    title: "Understanding Clusters",
    description: "Blue circles with numbers show groups of communities in an area. The number tells you how many communities are in that group.",
    icon: <Eye className="w-6 h-6 text-blue-600" />,
    action: "Look for blue circles on the map",
    visualCue: "clusters",
    tip: "Larger numbers mean more communities in that area"
  },
  {
    id: 6,
    title: "Exploring Clusters",
    description: "Click on any blue circle to zoom into that area and see the individual communities. This helps you explore specific neighborhoods.",
    icon: <MousePointer className="w-6 h-6 text-red-600" />,
    action: "Try clicking on a blue cluster circle",
    visualCue: "click-cluster",
    tip: "Each click reveals more communities in that area"
  },
  {
    id: 7,
    title: "Viewing Community Details",
    description: "Individual communities appear as colored pins. Click on any pin to see details like name, address, phone number, and services offered.",
    icon: <Hand className="w-6 h-6 text-green-600" />,
    action: "Click on a community pin to see its details",
    visualCue: "click-marker",
    tip: "Each color represents different types of care"
  },
  {
    id: 8,
    title: "You're Ready to Explore!",
    description: "Congratulations! You now know how to navigate the map, explore clusters, and find community details. Happy searching!",
    icon: <CheckCircle className="w-6 h-6 text-green-500" />,
    action: "Click 'Finish' to start exploring",
    tip: "Remember: Take your time and explore at your own pace"
  }
];

export default function MapTutorial({ isVisible, onClose, onComplete }: MapTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Reset tutorial when it becomes visible
  useEffect(() => {
    if (isVisible) {
      setCurrentStep(0);
      setIsCompleted(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const currentTutorialStep = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    console.log('Tutorial handleNext called - isLastStep:', isLastStep, 'currentStep:', currentStep, 'totalSteps:', tutorialSteps.length);
    
    if (isLastStep) {
      console.log('Tutorial completion sequence starting...');
      try {
        setIsCompleted(true);
        console.log('Tutorial marked as completed');
        
        onComplete();
        console.log('Tutorial onComplete callback called');
        
        onClose();
        console.log('Tutorial onClose callback called');
      } catch (error) {
        console.error('Error during tutorial completion:', error);
      }
    } else {
      setCurrentStep(prev => prev + 1);
      console.log('Tutorial advancing to step:', currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  // Add visual cue overlays based on current step
  useEffect(() => {
    const addVisualCue = (cueType: string) => {
      // Remove existing cues
      document.querySelectorAll('.tutorial-highlight').forEach(el => el.remove());
      
      let targetElement: Element | null = null;
      
      switch (cueType) {
        case 'zoom-in':
          targetElement = document.querySelector('.leaflet-control-zoom-in');
          break;
        case 'zoom-out':
          targetElement = document.querySelector('.leaflet-control-zoom-out');
          break;
        case 'clusters':
          targetElement = document.querySelector('.cluster-marker');
          break;
        case 'click-cluster':
          targetElement = document.querySelector('.cluster-marker');
          break;
        case 'click-marker':
          targetElement = document.querySelector('.leaflet-marker-icon:not(.cluster-marker)');
          break;
        case 'drag':
          targetElement = document.querySelector('.leaflet-container');
          break;
      }

      if (targetElement) {
        const highlight = document.createElement('div');
        highlight.className = 'tutorial-highlight';
        highlight.style.position = 'absolute';
        highlight.style.border = '3px solid #3b82f6';
        highlight.style.borderRadius = '50%';
        highlight.style.pointerEvents = 'none';
        highlight.style.zIndex = '10002';
        highlight.style.animation = 'pulse 3s infinite';
        
        // Add gentle bounce animation for better visibility
        if (cueType === 'click-cluster' || cueType === 'click-marker') {
          highlight.style.animation = 'gentle-bounce 2s infinite, pulse 3s infinite';
        }
        
        const rect = targetElement.getBoundingClientRect();
        highlight.style.left = `${rect.left - 10}px`;
        highlight.style.top = `${rect.top - 10}px`;
        highlight.style.width = `${rect.width + 20}px`;
        highlight.style.height = `${rect.height + 20}px`;
        
        if (cueType === 'drag') {
          highlight.style.borderRadius = '8px';
        }
        
        document.body.appendChild(highlight);
      }
    };

    if (currentTutorialStep.visualCue) {
      // Delay to allow map to render
      const timer = setTimeout(() => {
        addVisualCue(currentTutorialStep.visualCue!);
      }, 500);
      
      return () => {
        clearTimeout(timer);
        document.querySelectorAll('.tutorial-highlight').forEach(el => el.remove());
      };
    }

    return () => {
      document.querySelectorAll('.tutorial-highlight').forEach(el => el.remove());
    };
  }, [currentStep, currentTutorialStep.visualCue]);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[10000]" />
      
      {/* Tutorial Card */}
      <div className="fixed inset-0 flex items-center justify-center p-4 z-[10001]">
        <Card className="w-full max-w-lg mx-4 shadow-2xl border-2 border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-900">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentTutorialStep.icon}
                <div>
                  <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">
                    {currentTutorialStep.title}
                  </CardTitle>
                  <Badge variant="secondary" className="mt-1">
                    Step {currentStep + 1} of {tutorialSteps.length}
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
              />
            </div>
            
            {/* Description */}
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                {currentTutorialStep.description}
              </p>
              
              {/* Action Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border-l-4 border-blue-400 dark:border-blue-500">
                <p className="font-semibold text-blue-800 dark:text-blue-200 text-sm">
                  Next Action:
                </p>
                <p className="text-blue-700 dark:text-blue-300 text-base">
                  {currentTutorialStep.action}
                </p>
              </div>
              
              {/* Helpful Tip */}
              {currentTutorialStep.tip && (
                <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg border border-green-200 dark:border-green-700">
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    <span className="font-semibold">💡 Tip:</span> {currentTutorialStep.tip}
                  </p>
                </div>
              )}
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={isFirstStep}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>
              
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-gray-500 dark:text-gray-400"
                >
                  Skip Tutorial
                </Button>
                
                <Button
                  onClick={() => {
                    console.log('Tutorial button clicked - isLastStep:', isLastStep);
                    handleNext();
                  }}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  {isLastStep ? 'Finish' : 'Next'}
                  {!isLastStep && <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* CSS for pulse animation */}
      <style>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          70% {
            box-shadow: 0 0 0 15px rgba(59, 130, 246, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
        }
        
        @keyframes gentle-bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-5px);
          }
          60% {
            transform: translateY(-3px);
          }
        }
      `}</style>
    </>
  );
}