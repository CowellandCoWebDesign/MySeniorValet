import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Heart, Shield, Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();

  // Handle OAuth signup redirect (same as login)
  const handleSignup = () => {
    window.location.href = "/api/login";
  };

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      if ((user as any).role === "super_admin") {
        setLocation("/admin-unified");
      } else {
        setLocation("/dashboard");
      }
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <NavigationHeader 
        title="Join MySeniorValet" 
        subtitle="Create your account to start your senior living search"
      />
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-md">

        <Card className="border-0 shadow-lg bg-white dark:bg-gray-900 dark:border dark:border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Create Your Account</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Join thousands of families finding the perfect senior living communities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* OAuth Signup Button */}
            <Button
              onClick={handleSignup}
              className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Sign Up with Replit
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  Secure Registration
                </span>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <Shield className="h-4 w-4 mr-3 text-green-500" />
                Industry-standard OAuth security
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <Users className="h-4 w-4 mr-3 text-blue-500" />
                Save and share your research
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <Heart className="h-4 w-4 mr-3 text-red-500" />
                Get personalized recommendations
              </div>
            </div>

            {/* What You Get */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Your Free Account Includes:</h3>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Access to 34,000+ verified communities
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Save favorites and compare options
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Schedule tours with TourMate™
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Share research with family members
                </li>
              </ul>
            </div>

            {/* Footer */}
            <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Join thousands of satisfied families</p>
          <div className="flex justify-center items-center space-x-6 text-gray-400 dark:text-gray-500">
            <div className="flex items-center space-x-1">
              <Shield className="h-4 w-4" />
              <span className="text-xs">100% Secure</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span className="text-xs">No Spam</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="h-4 w-4" />
              <span className="text-xs">Free Forever</span>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}