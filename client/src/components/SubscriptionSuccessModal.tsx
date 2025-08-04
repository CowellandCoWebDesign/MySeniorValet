import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Star, Trophy, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import confetti from 'canvas-confetti';

interface SubscriptionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  tierName: string;
  tierFeatures: string[];
  nextSteps: string[];
  dashboardUrl: string;
  isVendor?: boolean;
}

export function SubscriptionSuccessModal({
  isOpen,
  onClose,
  tierName,
  tierFeatures,
  nextSteps,
  dashboardUrl,
  isVendor = false
}: SubscriptionSuccessModalProps) {
  const [showNextSteps, setShowNextSteps] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      // Show next steps after 3 seconds
      setTimeout(() => setShowNextSteps(true), 3000);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="text-center mb-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <DialogTitle className="text-3xl font-bold text-center mb-2">
              Welcome to {tierName}!
            </DialogTitle>
            <p className="text-gray-600 dark:text-gray-300">
              Your subscription is now active and ready to use
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Features Section */}
          <Card className="border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <h3 className="text-lg font-semibold">Your New Features</h3>
              </div>
              <div className="grid gap-3">
                {tierFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Star className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Next Steps Section - Animated */}
          {showNextSteps && (
            <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-6 h-6 text-blue-500" />
                  <h3 className="text-lg font-semibold">Quick Start Guide</h3>
                </div>
                <ol className="space-y-3">
                  {nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center pt-4">
            <Button
              onClick={() => window.location.href = dashboardUrl}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              Go to {isVendor ? 'Vendor' : 'Community'} Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
            >
              Continue Browsing
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Need help? Contact us at{' '}
            <a href="mailto:hello@myseniorvalet.com" className="text-blue-500 hover:underline">
              hello@myseniorvalet.com
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}