import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Eye, EyeOff, Heart, Shield, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { signupSchema, type SignupForm } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      phone: "",
      relationshipToCare: undefined,
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupForm) => {
      const response = await apiRequest("POST", "/api/auth/signup", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account created successfully!",
        description: "Welcome to TrueView! You can now save favorites and message communities.",
      });
      // Invalidate user query to trigger auth state update
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Navigate to home page - handled by App.tsx router logic
      window.location.href = "/";
    },
    onError: (error: any) => {
      toast({
        title: "Account creation failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SignupForm) => {
    signupMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-flex items-center space-x-2 text-2xl font-bold text-blue-600 mb-2 hover:text-blue-700 transition-colors">
              <Heart className="h-8 w-8" />
              <span>TrueView</span>
            </div>
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-600">Join thousands of families finding the perfect senior care</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Create your free account to save favorites and connect with communities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="First name"
                    {...form.register("firstName")}
                    className={form.formState.errors.firstName ? "border-red-500" : ""}
                  />
                  {form.formState.errors.firstName && (
                    <p className="text-sm text-red-600">{form.formState.errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Last name"
                    {...form.register("lastName")}
                    className={form.formState.errors.lastName ? "border-red-500" : ""}
                  />
                  {form.formState.errors.lastName && (
                    <p className="text-sm text-red-600">{form.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...form.register("email")}
                  className={form.formState.errors.email ? "border-red-500" : ""}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  {...form.register("phone")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationshipToCare">Relationship to Care (Optional)</Label>
                <Select onValueChange={(value) => form.setValue("relationshipToCare", value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your relationship to care" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Seeking for Self">Seeking for Self</SelectItem>
                    <SelectItem value="Seeking for Parent">Seeking for Parent</SelectItem>
                    <SelectItem value="Seeking for Spouse">Seeking for Spouse</SelectItem>
                    <SelectItem value="Seeking for Other Family">Seeking for Other Family</SelectItem>
                    <SelectItem value="Healthcare Professional">Healthcare Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password (min 6 characters)"
                    {...form.register("password")}
                    className={form.formState.errors.password ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    {...form.register("confirmPassword")}
                    className={form.formState.errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-600">{form.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={signupMutation.isPending}
              >
                {signupMutation.isPending ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login">
                  <span className="text-blue-600 hover:text-blue-700 font-medium">Sign in</span>
                </Link>
              </p>
            </div>

            {/* Features list */}
            <div className="mt-6 space-y-2">
              <p className="text-sm font-medium text-gray-900">With your account, you can:</p>
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Save favorite communities</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Message communities directly</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Schedule tours and get pricing</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Track your search progress</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trust indicators */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 mb-4">Trusted by families across Northern California</p>
          <div className="flex justify-center space-x-6 text-gray-400">
            <div className="flex items-center space-x-1">
              <Shield className="h-4 w-4" />
              <span className="text-xs">Secure</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span className="text-xs">Community Verified</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="h-4 w-4" />
              <span className="text-xs">Family First</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}