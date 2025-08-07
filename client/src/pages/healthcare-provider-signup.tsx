import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Header } from "@/components/header";
import { 
  Heart, Building2, Phone, Mail, Globe, MapPin, Users, 
  Shield, Clock, CheckCircle, Star, Gift, Sparkles, Info
} from "lucide-react";

const healthcareProviderSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  contactName: z.string().min(2, "Contact name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Valid phone number required"),
  website: z.string().url().optional().or(z.literal("")),
  serviceType: z.string().min(1, "Service type is required"),
  otherServiceType: z.string().optional(),
  description: z.string().min(50, "Please provide at least 50 characters describing your services"),
  services: z.array(z.string()).min(1, "Please select at least one service"),
  certifications: z.array(z.string()).optional(),
  insuranceAccepted: z.array(z.string()).optional(),
  serviceAreas: z.array(z.string()).min(1, "Please select at least one service area"),
  states: z.array(z.string()).min(1, "Please select at least one state"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  yearsInBusiness: z.number().optional(),
  employeeCount: z.string().optional(),
  languages: z.array(z.string()).optional(),
  emergencyAvailable: z.boolean().optional(),
  acceptingNewPatients: z.boolean().optional(),
});

type HealthcareProviderForm = z.infer<typeof healthcareProviderSchema>;

const serviceTypes = [
  { value: "home_health", label: "Home Health Agency" },
  { value: "hospice", label: "Hospice Care" },
  { value: "physical_therapy", label: "Physical Therapy" },
  { value: "occupational_therapy", label: "Occupational Therapy" },
  { value: "speech_therapy", label: "Speech Therapy" },
  { value: "nursing", label: "Skilled Nursing" },
  { value: "medical_equipment", label: "Medical Equipment/DME" },
  { value: "pharmacy", label: "Specialty Pharmacy" },
  { value: "mental_health", label: "Mental Health Services" },
  { value: "dental", label: "Dental Care" },
  { value: "vision", label: "Vision/Eye Care" },
  { value: "hearing", label: "Hearing/Audiology" },
  { value: "podiatry", label: "Podiatry/Foot Care" },
  { value: "nutrition", label: "Nutrition/Dietitian Services" },
  { value: "transportation", label: "Medical Transportation" },
  { value: "adult_day", label: "Adult Day Care" },
  { value: "respite", label: "Respite Care" },
  { value: "wound_care", label: "Wound Care" },
  { value: "dialysis", label: "Dialysis Center" },
  { value: "pain_management", label: "Pain Management" },
  { value: "cardiology", label: "Cardiology" },
  { value: "neurology", label: "Neurology" },
  { value: "oncology", label: "Oncology/Cancer Care" },
  { value: "pulmonology", label: "Pulmonology/Respiratory" },
  { value: "other", label: "Other Healthcare Service" },
];

const specificServices = [
  "24/7 Care Available",
  "Medication Management",
  "Wound Care",
  "Physical Therapy",
  "Occupational Therapy",
  "Speech Therapy",
  "Pain Management",
  "Dementia Care",
  "Palliative Care",
  "Respite Care",
  "Post-Surgery Care",
  "Chronic Disease Management",
  "IV Therapy",
  "Nutrition Counseling",
  "Social Work Services",
  "Bereavement Support",
  "Medical Equipment Rental",
  "Transportation Services",
];

const certificationOptions = [
  "Medicare Certified",
  "Medicaid Certified",
  "Joint Commission Accredited",
  "CHAP Accredited",
  "State Licensed",
  "ACHC Accredited",
  "NHPCO Member",
  "NAHC Member",
];

const insuranceOptions = [
  "Medicare",
  "Medicaid",
  "Private Insurance",
  "Veterans Benefits",
  "Long-Term Care Insurance",
  "Workers' Compensation",
  "Self-Pay/Private Pay",
];

const languageOptions = [
  "English",
  "Spanish",
  "French",
  "Mandarin",
  "Cantonese",
  "Vietnamese",
  "Korean",
  "Russian",
  "Arabic",
  "Portuguese",
  "American Sign Language",
];

const usStates = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
  "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri",
  "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island",
  "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming"
];

export default function HealthcareProviderSignup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOtherService, setShowOtherService] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useForm<HealthcareProviderForm>({
    resolver: zodResolver(healthcareProviderSchema),
    defaultValues: {
      services: [],
      certifications: [],
      insuranceAccepted: [],
      serviceAreas: [],
      states: [],
      languages: [],
      emergencyAvailable: false,
      acceptingNewPatients: true,
    },
  });

  const selectedServiceType = watch("serviceType");

  const onSubmit = async (data: HealthcareProviderForm) => {
    setIsSubmitting(true);
    try {
      // Prepare metadata
      const metadata = {
        yearsInBusiness: data.yearsInBusiness,
        employeeCount: data.employeeCount,
        languages: data.languages,
        emergencyAvailable: data.emergencyAvailable,
        acceptingNewPatients: data.acceptingNewPatients,
      };

      const submitData = {
        ...data,
        metadata,
      };

      await apiRequest("POST", "/api/healthcare-providers/signup", submitData);
      
      toast({
        title: "Success! 🎉",
        description: "Your healthcare service has been listed for FREE in our directory!",
      });

      setTimeout(() => {
        setLocation("/care-services");
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit your listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="container mx-auto py-8 px-4 max-w-4xl mt-16">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <Badge className="px-4 py-2 text-base bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 mb-4">
            <Gift className="w-4 h-4 mr-2" />
            100% FREE Healthcare Provider Listing - No Hidden Fees Ever!
          </Badge>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Join Our Comprehensive Healthcare & Care Services Directory
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            The central hub for ALL healthcare providers serving seniors nationwide
          </p>
          
          {/* Service Types Grid */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-4">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              ✨ We Welcome ALL Healthcare & Care Service Providers:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">Home Health</div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">Physical Therapy</div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">Hospice Care</div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">Medical Equipment</div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">Pharmacy Services</div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">Mental Health</div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">Dental Care</div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">Vision Care</div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">Hearing Services</div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">Podiatry</div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">Transportation</div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">Adult Day Care</div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">Respite Care</div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">Wound Care</div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">Dialysis Centers</div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">And 20+ More...</div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-lg text-blue-600 dark:text-blue-400">
            <Info className="w-5 h-5" />
            <span className="font-semibold">Join thousands of healthcare providers nationwide!</span>
          </div>
        </div>

        {/* Benefits */}
        <Card className="mb-8 border-2 border-green-200 dark:border-green-800">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-600" />
              Why List With MySeniorValet?
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-semibold">FREE Forever</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">No hidden fees, no premium tiers required</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-semibold">Massive Reach</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Connect with thousands of communities</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-semibold">Verified Listing</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Build trust with verification badge</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Star className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-semibold">Direct Referrals</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Receive inquiries from qualified leads</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Signup Form */}
        <Card>
          <CardHeader>
            <CardTitle>Healthcare Provider Information</CardTitle>
            <CardDescription>
              Complete this form to get your FREE listing. All fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Business Information
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      {...register("businessName")}
                      placeholder="ABC Home Health Agency"
                    />
                    {errors.businessName && (
                      <p className="text-sm text-red-600 mt-1">{errors.businessName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="contactName">Contact Person *</Label>
                    <Input
                      id="contactName"
                      {...register("contactName")}
                      placeholder="John Smith"
                    />
                    {errors.contactName && (
                      <p className="text-sm text-red-600 mt-1">{errors.contactName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="contact@healthcare.com"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      {...register("phone")}
                      placeholder="(555) 123-4567"
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input
                    id="website"
                    {...register("website")}
                    placeholder="https://www.yourhealthcare.com"
                  />
                </div>
              </div>

              {/* Service Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Service Details
                </h3>
                
                <div>
                  <Label htmlFor="serviceType">Service Type *</Label>
                  <Select
                    value={selectedServiceType}
                    onValueChange={(value) => {
                      setValue("serviceType", value);
                      setShowOtherService(value === "other");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.serviceType && (
                    <p className="text-sm text-red-600 mt-1">{errors.serviceType.message}</p>
                  )}
                </div>

                {showOtherService && (
                  <div>
                    <Label htmlFor="otherServiceType">Please Specify</Label>
                    <Input
                      id="otherServiceType"
                      {...register("otherServiceType")}
                      placeholder="Describe your healthcare service"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="description">Service Description *</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Describe your services, specializations, and what makes you unique (minimum 50 characters)"
                    rows={4}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <Label>Services Offered * (Select all that apply)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {specificServices.map((service) => (
                      <div key={service} className="flex items-center space-x-2">
                        <Checkbox
                          id={service}
                          onCheckedChange={(checked) => {
                            const current = getValues("services") || [];
                            if (checked) {
                              setValue("services", [...current, service]);
                            } else {
                              setValue("services", current.filter((s) => s !== service));
                            }
                          }}
                        />
                        <Label htmlFor={service} className="text-sm cursor-pointer">
                          {service}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.services && (
                    <p className="text-sm text-red-600 mt-1">{errors.services.message}</p>
                  )}
                </div>
              </div>

              {/* Certifications & Insurance */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Certifications & Insurance
                </h3>
                
                <div>
                  <Label>Certifications (Optional)</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {certificationOptions.map((cert) => (
                      <div key={cert} className="flex items-center space-x-2">
                        <Checkbox
                          id={cert}
                          onCheckedChange={(checked) => {
                            const current = getValues("certifications") || [];
                            if (checked) {
                              setValue("certifications", [...current, cert]);
                            } else {
                              setValue("certifications", current.filter((c) => c !== cert));
                            }
                          }}
                        />
                        <Label htmlFor={cert} className="text-sm cursor-pointer">
                          {cert}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Insurance Accepted (Optional)</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {insuranceOptions.map((insurance) => (
                      <div key={insurance} className="flex items-center space-x-2">
                        <Checkbox
                          id={insurance}
                          onCheckedChange={(checked) => {
                            const current = getValues("insuranceAccepted") || [];
                            if (checked) {
                              setValue("insuranceAccepted", [...current, insurance]);
                            } else {
                              setValue("insuranceAccepted", current.filter((i) => i !== insurance));
                            }
                          }}
                        />
                        <Label htmlFor={insurance} className="text-sm cursor-pointer">
                          {insurance}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Service Area */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Service Area
                </h3>
                
                <div>
                  <Label>States Served * (Select all that apply)</Label>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mt-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                    {usStates.map((state) => (
                      <div key={state} className="flex items-center space-x-2">
                        <Checkbox
                          id={state}
                          onCheckedChange={(checked) => {
                            const currentStates = getValues("states") || [];
                            const currentAreas = getValues("serviceAreas") || [];
                            if (checked) {
                              setValue("states", [...currentStates, state]);
                              setValue("serviceAreas", [...currentAreas, state]);
                            } else {
                              setValue("states", currentStates.filter((s) => s !== state));
                              setValue("serviceAreas", currentAreas.filter((s) => s !== state));
                            }
                          }}
                        />
                        <Label htmlFor={state} className="text-sm cursor-pointer">
                          {state}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.states && (
                    <p className="text-sm text-red-600 mt-1">{errors.states.message}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City (Optional)</Label>
                    <Input
                      id="city"
                      {...register("city")}
                      placeholder="City"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="zipCode">ZIP Code (Optional)</Label>
                    <Input
                      id="zipCode"
                      {...register("zipCode")}
                      placeholder="12345"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Additional Information (Optional)
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="yearsInBusiness">Years in Business</Label>
                    <Input
                      id="yearsInBusiness"
                      type="number"
                      {...register("yearsInBusiness", { valueAsNumber: true })}
                      placeholder="10"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="employeeCount">Number of Employees</Label>
                    <Select
                      onValueChange={(value) => setValue("employeeCount", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10</SelectItem>
                        <SelectItem value="11-50">11-50</SelectItem>
                        <SelectItem value="51-100">51-100</SelectItem>
                        <SelectItem value="100+">100+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Languages Spoken (Optional)</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {languageOptions.map((language) => (
                      <div key={language} className="flex items-center space-x-2">
                        <Checkbox
                          id={language}
                          onCheckedChange={(checked) => {
                            const current = getValues("languages") || [];
                            if (checked) {
                              setValue("languages", [...current, language]);
                            } else {
                              setValue("languages", current.filter((l) => l !== language));
                            }
                          }}
                        />
                        <Label htmlFor={language} className="text-sm cursor-pointer">
                          {language}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="emergencyAvailable"
                      onCheckedChange={(checked) => setValue("emergencyAvailable", checked as boolean)}
                    />
                    <Label htmlFor="emergencyAvailable" className="cursor-pointer">
                      24/7 Emergency Services Available
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="acceptingNewPatients"
                      defaultChecked={true}
                      onCheckedChange={(checked) => setValue("acceptingNewPatients", checked as boolean)}
                    />
                    <Label htmlFor="acceptingNewPatients" className="cursor-pointer">
                      Currently Accepting New Patients
                    </Label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Creating Your Free Listing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Create My FREE Healthcare Listing
                  </>
                )}
              </Button>

              <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                By submitting, you confirm that all information is accurate and agree to our terms of service.
                Your listing will be reviewed and activated within 24 hours.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}