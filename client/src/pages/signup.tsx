import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Heart, Shield, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  
  // Redirect to Replit Auth for signup
  const handleSignup = () => {
    window.location.href = "/api/login";
  };

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      setLocation("/dashboard");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-flex items-center space-x-2 text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              <Heart className="h-8 w-8" />
              <span>MySeniorValet</span>
            </div>
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Join MySeniorValet</h1>
          <p className="text-gray-600 dark:text-gray-300">Create your account to start finding the perfect senior living community</p>
        </div>

        <Card className="border-0 shadow-lg bg-white dark:bg-gray-900 dark:border dark:border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Create Your Account</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Quick and secure registration with Replit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* What You Get */}
            <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                What you'll get:
              </h3>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                  Access to 31,000+ verified senior living communities
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                  AI-powered community matching and recommendations
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                  Family collaboration tools and shared favorites
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                  Transparent pricing and availability information
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                  Virtual tours and appointment scheduling
                </div>
              </div>
            </div>

            {/* Replit Auth Button */}
            <Button 
              onClick={handleSignup}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Shield className="h-5 w-5 mr-3" />
              Create Account with Replit
            </Button>

            {/* Security Features */}
            <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <Shield className="h-4 w-4 mr-3 text-green-500" />
                Enterprise-grade security and encryption
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <Users className="h-4 w-4 mr-3 text-blue-500" />
                Family-friendly privacy controls
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <Heart className="h-4 w-4 mr-3 text-red-500" />
                No spam - only helpful senior living updates
              </div>
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
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Join thousands of families finding clarity in senior living</p>
          <div className="flex justify-center items-center space-x-6 text-gray-400 dark:text-gray-500">
            <div className="flex items-center space-x-1">
              <Shield className="h-4 w-4" />
              <span className="text-xs">100% Free</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span className="text-xs">Family Focused</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="h-4 w-4" />
              <span className="text-xs">Expert Support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}