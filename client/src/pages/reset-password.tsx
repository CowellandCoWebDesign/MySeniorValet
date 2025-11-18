import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Lock, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { NavigationHeader } from "@/components/NavigationHeader";

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  // Extract token from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    
    if (!tokenParam) {
      setTokenValid(false);
      toast({
        title: "Invalid Reset Link",
        description: "This password reset link is invalid or has expired.",
        variant: "destructive",
      });
    } else {
      setToken(tokenParam);
    }
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await response.json();

      if (response.ok) {
        setResetSuccess(true);
        toast({
          title: "Password Reset Successful",
          description: "Your password has been reset. Redirecting to login...",
        });
        
        setTimeout(() => {
          setLocation("/login");
        }, 3000);
      } else {
        toast({
          title: "Reset Failed",
          description: data.message || "Invalid or expired reset token",
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

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <NavigationHeader 
          title="Invalid Reset Link" 
          subtitle="This password reset link is not valid"
        />
        <div className="flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-900 dark:border dark:border-gray-700">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Invalid Reset Link
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  This password reset link is invalid or has expired
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Password reset links expire after 1 hour for security reasons.
                </p>
                <div className="space-y-3">
                  <Link to="/forgot-password">
                    <Button className="w-full" data-testid="button-request-new-link">
                      Request New Reset Link
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" className="w-full" data-testid="link-back-to-login">
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <NavigationHeader 
        title="Reset Password" 
        subtitle="Create a new password for your account"
      />
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-lg bg-white dark:bg-gray-900 dark:border dark:border-gray-700">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                {resetSuccess ? (
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                ) : (
                  <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                {resetSuccess ? "Password Reset!" : "Create New Password"}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                {resetSuccess
                  ? "Your password has been successfully reset"
                  : "Enter your new password below"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {resetSuccess ? (
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Your password has been successfully reset. You will be redirected to the login page shortly.
                    </p>
                  </div>
                  
                  <Link to="/login">
                    <Button className="w-full" data-testid="button-go-to-login">
                      Go to Login
                    </Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="password">New Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter new password (min 8 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="mt-1"
                      data-testid="input-new-password"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Password must be at least 8 characters long
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="mt-1"
                      data-testid="input-confirm-password"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                    data-testid="button-reset-password"
                  >
                    {isSubmitting ? "Resetting Password..." : "Reset Password"}
                  </Button>
                </form>
              )}

              {!resetSuccess && (
                <div className="mt-6 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
