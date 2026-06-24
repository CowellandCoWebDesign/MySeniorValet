import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Heart, Shield, Users, UserPlus, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  // Handle signup (no Replit account required)
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      toast({
        title: "Password not strong enough",
        description: "Please meet all password requirements",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Capture real, optional context about this signup (no fabrication).
      const params = new URLSearchParams(window.location.search);
      const utm: Record<string, string> = {};
      ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach((key) => {
        const value = params.get(key);
        if (value) utm[key] = value;
      });
      const locale = (() => {
        try {
          return localStorage.getItem("language") || undefined;
        } catch {
          return undefined;
        }
      })();

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Include cookies with request
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          source: window.location.pathname + window.location.search,
          referrer: document.referrer || undefined,
          locale,
          utm: Object.keys(utm).length ? utm : undefined,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({
          title: "Account created!",
          description: "Welcome to MySeniorValet",
        });

        // Flag this as a brand-new signup so the dashboard fires the onboarding wizard
        sessionStorage.setItem('newSignup', 'true');
        // Carry the ZIP code (if provided) into the onboarding wizard
        if (zipCode.trim()) {
          sessionStorage.setItem('pendingZipCode', zipCode.trim());
        }
        
        // Check for pending community payment
        const pendingCommunityTier = sessionStorage.getItem('pendingCommunityTier');
        if (pendingCommunityTier) {
          // Redirect back to community payment with tier
          window.location.href = `/community-mobile-payment/${pendingCommunityTier}`;
        } else {
          // Redirect to dashboard
          window.location.href = "/dashboard";
        }
      } else {
        toast({
          title: "Registration failed",
          description: data.message || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
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
            {/* Registration Form - No Replit Account Required */}
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="zipCode">ZIP Code <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Input
                  id="zipCode"
                  type="text"
                  inputMode="numeric"
                  placeholder="Where are you searching? e.g. 90210"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  disabled={isSubmitting}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  We'll use this to personalize your community search.
                </p>
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="mt-1"
                />
                <PasswordStrengthMeter 
                  password={password} 
                  onChange={setIsPasswordValid}
                  showRequirements={true}
                />
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="mt-1"
                />
              </div>
              
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5 mr-2" />
                    Create Account
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
                  Your Benefits
                </span>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <Shield className="h-4 w-4 mr-3 text-green-500" />
                Your information is always private and secure
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
                <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
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