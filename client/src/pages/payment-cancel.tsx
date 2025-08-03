import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";

export default function PaymentCancel() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <Card className="max-w-2xl w-full p-8 text-center shadow-2xl border-orange-200 dark:border-orange-800">
        <div className="mb-8">
          <div className="mx-auto w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mb-6">
            <XCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Payment Cancelled
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            No worries - your subscription wasn't charged
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You can try again anytime or explore our free options
          </p>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Don't miss out on these features:
          </h3>
          <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-300">
            <div>• Profile editing tools</div>
            <div>• Featured placement</div>
            <div>• Red Tag specials</div>
            <div>• Photo upload capabilities</div>
            <div>• Enhanced visibility</div>
            <div>• Analytics dashboard</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => setLocation('/community-portal')}
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => setLocation('/')}
            className="px-8 py-3 rounded-lg font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Questions? Contact our team at{" "}
            <span className="font-medium text-purple-600">hello@myseniorvalet.com</span>
          </p>
        </div>
      </Card>
    </div>
  );
}