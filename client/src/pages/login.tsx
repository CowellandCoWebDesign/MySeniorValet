import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Heart, Shield, Users, LogIn, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle standard login (no Replit account required)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({
          title: "Welcome back!",
          description: "Successfully logged in to MySeniorValet",
        });
        
        // Redirect based on user role
        window.location.href = data.user.role === "super_admin" ? "/admin-unified" : 
                              data.user.role === "admin" ? "/admin-unified" : "/dashboard";
      } else {
        toast({
          title: "Login failed",
          description: data.message || "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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

  // Only show loading during initial check
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  // If user is already authenticated, redirect will happen via useEffect
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <NavigationHeader 
        title="Welcome back" 
        subtitle="Sign in to your account to continue your search"
      />
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-md">

        <Card className="border-0 shadow-lg bg-white dark:bg-gray-900 dark:border dark:border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Sign In to MySeniorValet</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Access your dashboard and personalized tools
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Standard Login Form - No Replit Account Required */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="mt-1"
                />
              </div>
              
              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                  Forgot password?
                </Link>
              </div>
              
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  <>
                    <LogIn className="h-5 w-5 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
            
            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  New to MySeniorValet?
                </span>
              </div>
            </div>
            
            {/* Sign Up Link */}
            <div className="text-center">
              <Link href="/signup">
                <Button variant="outline" className="w-full h-12">
                  <Users className="h-5 w-5 mr-2" />
                  Create an Account
                </Button>
              </Link>
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <Shield className="h-4 w-4 mr-3 text-green-500" />
                Industry-standard OAuth security
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <Users className="h-4 w-4 mr-3 text-blue-500" />
                Save your search preferences
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <Heart className="h-4 w-4 mr-3 text-red-500" />
                Access family collaboration tools
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <Link href="/signup" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                  Sign up here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Trusted by families nationwide</p>
          <div className="flex justify-center items-center space-x-6 text-gray-400 dark:text-gray-500">
            <div className="flex items-center space-x-1">
              <Shield className="h-4 w-4" />
              <span className="text-xs">Secure & Private</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span className="text-xs">Expert Verified</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="h-4 w-4" />
              <span className="text-xs">Family First</span>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}