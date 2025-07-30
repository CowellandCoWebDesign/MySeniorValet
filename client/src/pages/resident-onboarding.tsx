import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle2, User, Users, Shield, FileText, CreditCard, Home } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { NavigationHeader } from "@/components/NavigationHeader";

// Form validation schema
const onboardingSchema = z.object({
  // Primary Resident
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  ssn: z.string().regex(/^\d{3}-\d{2}-\d{4}$/, "SSN must be in format XXX-XX-XXXX"),
  currentAddress: z.string().min(1, "Current address is required"),
  
  // Co-Applicant (optional)
  hasCoApplicant: z.boolean().default(false),
  coApplicantFirstName: z.string().optional(),
  coApplicantLastName: z.string().optional(),
  coApplicantEmail: z.string().optional(),
  coApplicantPhone: z.string().optional(),
  coApplicantDateOfBirth: z.string().optional(),
  coApplicantSSN: z.string().optional(),
  
  // Emergency Contact
  emergencyContactName: z.string().min(1, "Emergency contact name is required"),
  emergencyContactRelationship: z.string().min(1, "Relationship is required"),
  emergencyContactPhone: z.string().min(10, "Emergency contact phone is required"),
  emergencyContactEmail: z.string().email().optional().or(z.literal("")),
  emergencyContactAddress: z.string().min(1, "Emergency contact address is required"),
  
  // Secondary Emergency Contact (optional)
  hasSecondaryEmergency: z.boolean().default(false),
  secondaryEmergencyContactName: z.string().optional(),
  secondaryEmergencyContactPhone: z.string().optional(),
  secondaryEmergencyContactEmail: z.string().optional(),
  
  // Background Check Consent
  backgroundCheckConsent: z.boolean().refine((val) => val === true, {
    message: "Background check consent is required"
  }),
  backgroundCheckProvider: z.string().optional(),
  
  // Payment Information
  setupACH: z.boolean().default(false),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  routingNumber: z.string().optional(),
  accountType: z.enum(["checking", "savings"]).optional(),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export default function ResidentOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showBackgroundCheckOptions, setShowBackgroundCheckOptions] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      hasCoApplicant: false,
      hasSecondaryEmergency: false,
      backgroundCheckConsent: false,
      setupACH: false,
      accountType: "checking",
    },
  });

  const submitOnboarding = useMutation({
    mutationFn: async (data: OnboardingFormData) => {
      return apiRequest("POST", "/api/resident/onboarding", data);
    },
    onSuccess: () => {
      toast({
        title: "Onboarding Complete",
        description: "Resident information has been submitted successfully.",
      });
      // Redirect to next step or dashboard
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: OnboardingFormData) => {
    submitOnboarding.mutate(data);
  };

  const steps = [
    { number: 1, title: "Resident Info", icon: User },
    { number: 2, title: "Emergency Contacts", icon: Users },
    { number: 3, title: "Background Check", icon: Shield },
    { number: 4, title: "Payment Setup", icon: CreditCard },
    { number: 5, title: "Review", icon: FileText },
  ];

  const progressPercentage = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <NavigationHeader 
        title="Resident Onboarding" 
        subtitle="Complete the onboarding process to prepare for move-in"
      />
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <Card>
          <CardContent>
          {/* Progress Bar */}
          <div className="mb-8">
            <Progress value={progressPercentage} className="mb-4" />
            <div className="flex justify-between">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.number}
                    className={`flex flex-col items-center ${
                      step.number <= currentStep ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <div
                      className={`rounded-full p-2 ${
                        step.number <= currentStep ? "bg-primary/10" : "bg-muted"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs mt-1">{step.title}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Step 1: Resident Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Primary Resident Information</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input type="tel" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="ssn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Social Security Number</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="XXX-XX-XXXX"
                              maxLength={11}
                            />
                          </FormControl>
                          <FormDescription>
                            Your SSN is encrypted and secure
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="currentAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Address</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Street address, City, State, ZIP" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Co-Applicant Section */}
                  <div className="border-t pt-6">
                    <FormField
                      control={form.control}
                      name="hasCoApplicant"
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
                              Add Co-Applicant
                            </FormLabel>
                            <FormDescription>
                              Check if applying with a spouse or partner
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {form.watch("hasCoApplicant") && (
                      <div className="mt-4 space-y-4">
                        <h4 className="font-medium">Co-Applicant Information</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="coApplicantFirstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="coApplicantLastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Emergency Contacts */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Emergency Contact Information</h3>
                  
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                      Emergency contacts will be notified in case of medical emergencies or urgent situations.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="emergencyContactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Contact Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="emergencyContactRelationship"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Relationship</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., Daughter, Son, Friend" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="emergencyContactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input type="tel" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="emergencyContactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email (Optional)</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emergencyContactAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Street address, City, State, ZIP" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Secondary Emergency Contact */}
                  <div className="border-t pt-6">
                    <FormField
                      control={form.control}
                      name="hasSecondaryEmergency"
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
                              Add Secondary Emergency Contact
                            </FormLabel>
                            <FormDescription>
                              Recommended for additional support
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Background Check */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Background Check Authorization</h3>
                  
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertTitle>Secure & Confidential</AlertTitle>
                    <AlertDescription>
                      Background checks are conducted by certified third-party providers and include criminal history, credit check, and eviction records.
                    </AlertDescription>
                  </Alert>

                  <FormField
                    control={form.control}
                    name="backgroundCheckConsent"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                setShowBackgroundCheckOptions(checked as boolean);
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-base">
                              I authorize a background check
                            </FormLabel>
                            <FormDescription>
                              I understand and consent to a comprehensive background check including criminal history, credit report, and eviction records. This is required for the application process.
                            </FormDescription>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {showBackgroundCheckOptions && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Select Background Check Provider</CardTitle>
                        <CardDescription>
                          Choose from our trusted partners (affiliate program available)
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={form.control}
                          name="backgroundCheckProvider"
                          render={({ field }) => (
                            <FormItem>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a provider" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="checkr">
                                    <div>
                                      <div className="font-medium">Checkr</div>
                                      <div className="text-sm text-muted-foreground">Fast, AI-powered checks - $29.99</div>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="goodhire">
                                    <div>
                                      <div className="font-medium">GoodHire</div>
                                      <div className="text-sm text-muted-foreground">Comprehensive reports - $34.99</div>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="sterling">
                                    <div>
                                      <div className="font-medium">Sterling</div>
                                      <div className="text-sm text-muted-foreground">Enterprise-grade - $39.99</div>
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Step 4: Payment Setup */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Payment Setup</h3>
                  
                  <Alert>
                    <CreditCard className="h-4 w-4" />
                    <AlertTitle>Automatic Monthly Payments</AlertTitle>
                    <AlertDescription>
                      Set up ACH withdrawal for hassle-free monthly rent payments. Bank account information is encrypted and secure.
                    </AlertDescription>
                  </Alert>

                  <FormField
                    control={form.control}
                    name="setupACH"
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
                            Set up automatic ACH payments
                          </FormLabel>
                          <FormDescription>
                            Rent will be automatically withdrawn on the 1st of each month
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {form.watch("setupACH") && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Bank Account Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="bankName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bank Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., Bank of America" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="accountNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Account Number</FormLabel>
                                <FormControl>
                                  <Input {...field} type="password" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="routingNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Routing Number</FormLabel>
                                <FormControl>
                                  <Input {...field} maxLength={9} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="accountType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Account Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="checking">Checking</SelectItem>
                                  <SelectItem value="savings">Savings</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Step 5: Review */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Review Your Information</h3>
                  
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Almost Done!</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Please review your information before submitting. You can go back to make changes if needed.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Resident Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <dl className="grid grid-cols-2 gap-2 text-sm">
                          <dt className="font-medium">Name:</dt>
                          <dd>{form.getValues("firstName")} {form.getValues("lastName")}</dd>
                          <dt className="font-medium">Email:</dt>
                          <dd>{form.getValues("email")}</dd>
                          <dt className="font-medium">Phone:</dt>
                          <dd>{form.getValues("phone")}</dd>
                        </dl>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Emergency Contact</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <dl className="grid grid-cols-2 gap-2 text-sm">
                          <dt className="font-medium">Name:</dt>
                          <dd>{form.getValues("emergencyContactName")}</dd>
                          <dt className="font-medium">Relationship:</dt>
                          <dd>{form.getValues("emergencyContactRelationship")}</dd>
                          <dt className="font-medium">Phone:</dt>
                          <dd>{form.getValues("emergencyContactPhone")}</dd>
                        </dl>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Services Selected</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          {form.getValues("backgroundCheckConsent") && (
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              Background Check: {form.getValues("backgroundCheckProvider") || "Provider not selected"}
                            </li>
                          )}
                          {form.getValues("setupACH") && (
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ACH Payment Setup: {form.getValues("bankName")}
                            </li>
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                
                {currentStep < 5 ? (
                  <Button
                    type="button"
                    onClick={() => {
                      // Validate current step before proceeding
                      const fieldsToValidate = getFieldsForStep(currentStep);
                      form.trigger(fieldsToValidate).then((isValid) => {
                        if (isValid) {
                          setCurrentStep(currentStep + 1);
                        }
                      });
                    }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    type="submit"
                    disabled={submitOnboarding.isPending}
                  >
                    {submitOnboarding.isPending ? "Submitting..." : "Submit Application"}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to get fields for validation per step
function getFieldsForStep(step: number): (keyof OnboardingFormData)[] {
  switch (step) {
    case 1:
      return ["firstName", "lastName", "email", "phone", "dateOfBirth", "ssn", "currentAddress"];
    case 2:
      return ["emergencyContactName", "emergencyContactRelationship", "emergencyContactPhone", "emergencyContactAddress"];
    case 3:
      return ["backgroundCheckConsent"];
    case 4:
      return [];
    default:
      return [];
  }
}