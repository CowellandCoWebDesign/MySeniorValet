import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, MapPin, Phone, Mail, Globe, DollarSign, Info } from "lucide-react";
import { NavigationHeader } from "@/components/NavigationHeader";

const vendorSignupSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  contactPhone: z.string().min(10, "Please enter a valid phone number"),
  contactEmail: z.string().email("Please enter a valid email address"),
  website: z.string().url().optional().or(z.literal("")),
  address: z.string().min(5, "Please enter a valid address"),
  city: z.string().min(2, "Please enter a city"),
  state: z.string().length(2, "Please enter a 2-letter state code"),
  zipCode: z.string().min(5, "Please enter a valid ZIP code"),
  serviceCategories: z.array(z.string()).min(1, "Please select at least one service category"),
  commissionRate: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0 && num <= 100;
  }, "Commission rate must be between 0 and 100"),
  termsAccepted: z.boolean().refine((val) => val === true, "You must accept the terms and conditions"),
});

type VendorSignupForm = z.infer<typeof vendorSignupSchema>;

const serviceCategories = [
  { id: "moving", name: "Moving Services" },
  { id: "home-care", name: "Home Care" },
  { id: "meal-delivery", name: "Meal Delivery" },
  { id: "transportation", name: "Medical Transportation" },
  { id: "home-modification", name: "Home Modification" },
  { id: "legal", name: "Legal Services" },
  { id: "financial", name: "Financial Planning" },
  { id: "equipment", name: "Medical Equipment" },
  { id: "hospice", name: "Hospice Care" },
  { id: "therapy", name: "Therapy Services" },
  { id: "pharmacy", name: "Pharmacy Services" },
  { id: "cleaning", name: "Cleaning Services" },
  { id: "technology", name: "Technology Support" },
  { id: "social", name: "Social Activities" },
  { id: "other", name: "Other Services" },
];

export default function VendorSignup() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const form = useForm<VendorSignupForm>({
    resolver: zodResolver(vendorSignupSchema),
    defaultValues: {
      businessName: "",
      description: "",
      contactPhone: "",
      contactEmail: "",
      website: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      serviceCategories: [],
      commissionRate: "20",
      termsAccepted: false,
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: VendorSignupForm) => {
      return await apiRequest("POST", "/api/vendor/signup", data);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your vendor account has been created. You can now access your vendor dashboard.",
      });
      setLocation("/vendor/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create vendor account",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: VendorSignupForm) => {
    signupMutation.mutate(data);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              You need to be signed in to create a vendor account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = "/api/login"} className="w-full">
              Sign In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <NavigationHeader 
        title="Become a Vendor Partner" 
        subtitle="Join our network of trusted service providers"
      />
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              Vendor Registration
            </CardTitle>
            <CardDescription>
              Complete this form to register your business as a MySeniorValet vendor partner
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Business Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Business Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Business Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your business and the services you provide..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Minimum 50 characters. This will be displayed on your vendor profile.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Phone</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input className="pl-10" placeholder="(555) 123-4567" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input className="pl-10" type="email" placeholder="contact@business.com" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website (Optional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input className="pl-10" placeholder="https://www.yourbusiness.com" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Business Location</h3>
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input className="pl-10" placeholder="123 Main Street" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="CA" maxLength={2} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code</FormLabel>
                          <FormControl>
                            <Input placeholder="12345" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Service Categories */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Service Categories</h3>
                  
                  <FormField
                    control={form.control}
                    name="serviceCategories"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select all categories that apply to your business</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                          {serviceCategories.map((category) => (
                            <label
                              key={category.id}
                              className="flex items-center space-x-2 cursor-pointer"
                            >
                              <Checkbox
                                checked={field.value.includes(category.id)}
                                onCheckedChange={(checked) => {
                                  const updatedValue = checked
                                    ? [...field.value, category.id]
                                    : field.value.filter((id) => id !== category.id);
                                  field.onChange(updatedValue);
                                }}
                              />
                              <span className="text-sm">{category.name}</span>
                            </label>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Commission Rate */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Commission Structure</h3>
                  
                  <FormField
                    control={form.control}
                    name="commissionRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Commission Rate (%)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              className="pl-10"
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              placeholder="20"
                              {...field}
                            />
                            <span className="absolute right-3 top-3 text-gray-400">%</span>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Standard commission rate for referrals from MySeniorValet
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="termsAccepted"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I agree to the MySeniorValet Vendor Terms and Conditions
                          </FormLabel>
                          <FormDescription>
                            By checking this box, you agree to our vendor partnership terms,
                            commission structure, and service quality standards.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={signupMutation.isPending}
                    className="min-w-[200px]"
                  >
                    {signupMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        Creating Account...
                      </span>
                    ) : (
                      "Create Vendor Account"
                    )}
                  </Button>
                </div>

                {/* Information Box */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex gap-3">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900 dark:text-blue-100">
                    <p className="font-semibold mb-1">What happens next?</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Your application will be reviewed within 24-48 hours</li>
                      <li>You'll receive an email confirmation once approved</li>
                      <li>Access your vendor dashboard to manage services and leads</li>
                      <li>Start receiving qualified leads from families seeking services</li>
                    </ul>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
}