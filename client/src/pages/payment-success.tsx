import { useEffect, useState } from "react";
import { CheckCircle, ArrowRight, Star, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    // Get session ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('session_id');
    if (id) {
      setSessionId(id);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <Card className="max-w-2xl w-full p-8 text-center shadow-2xl border-green-200 dark:border-green-800">
        <div className="mb-8">
          <div className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Payment Successful!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            Welcome to MySeniorValet Community Portal
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your subscription is now active and ready to use
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Your Community Features Are Active
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-green-500" />
              <span>Profile editing tools</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-green-500" />
              <span>Featured placement</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-green-500" />
              <span>Red Tag specials</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-green-500" />
              <span>Photo upload tools</span>
            </div>
          </div>
        </div>

        {sessionId && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Transaction ID:
            </p>
            <p className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">
              {sessionId}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => setLocation('/community-dashboard')}
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setLocation('/')}
            className="px-8 py-3 rounded-lg font-medium"
          >
            Back to Home
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need help getting started? Contact our support team at{" "}
            <span className="font-medium text-purple-600">hello@myseniorvalet.com</span>
          </p>
        </div>
      </Card>
    </div>
  );
}