import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Brain, MapPin, Heart, DollarSign, Star, Users, Calendar, ChevronRight, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CareNeedsProfile {
  careLevel: string;
  mobility: string;
  medical: string[];
  budget: { min: number; max: number };
  location: { preferred: string[]; radius: number };
  amenities: string[];
  socialNeeds: string;
  familyInvolvement: string;
}

interface MatchResult {
  community: any;
  matchScore: number;
  matchReasons: string[];
  aiInsights: string;
  priceAnalysis: string;
}

export default function AIMatchingAssistant() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<CareNeedsProfile>({
    careLevel: "",
    mobility: "full",
    medical: [],
    budget: { min: 2000, max: 6000 },
    location: { preferred: [], radius: 25 },
    amenities: [],
    socialNeeds: "medium",
    familyInvolvement: "weekly"
  });
  const [locationInput, setLocationInput] = useState("");
  const [matches, setMatches] = useState<MatchResult[]>([]);

  const matchingMutation = useMutation({
    mutationFn: async (data: CareNeedsProfile) => {
      const response = await apiRequest("POST", "/api/communities/ai-match", data);
      return await response.json();
    },
    onSuccess: (response: any) => {
      console.log('AI Matching Response:', response);
      const matchesArray = response?.matches || [];
      console.log('Matches array:', matchesArray);
      setMatches(matchesArray);
      setStep(4); // Go to results
      toast({
        title: "✨ AI Matching Complete",
        description: `Found ${matchesArray.length} personalized matches for you!`,
      });
    },
    onError: (error) => {
      toast({
        title: "Matching Error",
        description: "Unable to find matches. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = () => {
    if (!profile.careLevel || !locationInput || profile.budget.min === 0) {
      toast({
        title: "Missing Information",
        description: "Please complete all required fields",
        variant: "destructive"
      });
      return;
    }

    const fullProfile = {
      ...profile,
      location: {
        preferred: [locationInput],
        radius: profile.location.radius
      }
    };

    matchingMutation.mutate(fullProfile);
  };

  const medicalConditions = [
    "Diabetes",
    "Heart Disease",
    "Dementia",
    "Parkinson's",
    "Stroke Recovery",
    "COPD",
    "Arthritis",
    "Vision/Hearing Loss"
  ];

  const desiredAmenities = [
    "Fitness Center",
    "Swimming Pool",
    "Library",
    "Garden/Outdoor Space",
    "Pet-Friendly",
    "Religious Services",
    "Beauty Salon",
    "Transportation Services",
    "Arts & Crafts",
    "Music Programs"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="h-10 w-10 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Matching Assistant
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Let our AI find the perfect senior living community for your unique needs
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${step >= 1 ? 'text-purple-600' : 'text-gray-400'}`}>
              Care Needs
            </span>
            <span className={`text-sm font-medium ${step >= 2 ? 'text-purple-600' : 'text-gray-400'}`}>
              Preferences
            </span>
            <span className={`text-sm font-medium ${step >= 3 ? 'text-purple-600' : 'text-gray-400'}`}>
              Budget & Location
            </span>
            <span className={`text-sm font-medium ${step >= 4 ? 'text-purple-600' : 'text-gray-400'}`}>
              AI Matches
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Care Needs */}
        {step === 1 && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Care Level & Medical Needs
              </CardTitle>
              <CardDescription>
                Tell us about the level of care and support needed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Required Care Level *
                </label>
                <Select value={profile.careLevel} onValueChange={(value) => setProfile({...profile, careLevel: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select care level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hud_housing">HUD Housing (Subsidized) - $0-500/mo</SelectItem>
                    <SelectItem value="va_housing">VA/Veterans Housing - $0-1k/mo</SelectItem>
                    <SelectItem value="mobile_rv">Mobile Home & RV Parks - $400-1k/mo</SelectItem>
                    <SelectItem value="55_active">55+ Active Communities - $1-3k/mo</SelectItem>
                    <SelectItem value="independent">Independent Living - $2-4k/mo</SelectItem>
                    <SelectItem value="board_care">Board & Care Homes - $2.5-5k/mo</SelectItem>
                    <SelectItem value="assisted">Assisted Living - $3-6k/mo</SelectItem>
                    <SelectItem value="memory_care">Memory Care - $4-8k/mo</SelectItem>
                    <SelectItem value="ccrc">Continuing Care (CCRC) - $5-10k/mo</SelectItem>
                    <SelectItem value="skilled_nursing">Skilled Nursing - $6-12k/mo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Mobility Level
                </label>
                <Select value={profile.mobility} onValueChange={(value) => setProfile({...profile, mobility: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Fully Mobile</SelectItem>
                    <SelectItem value="walker">Uses Walker/Cane</SelectItem>
                    <SelectItem value="wheelchair">Uses Wheelchair</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Medical Conditions (select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {medicalConditions.map((condition) => (
                    <label key={condition} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={profile.medical.includes(condition)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProfile({...profile, medical: [...profile.medical, condition]});
                          } else {
                            setProfile({...profile, medical: profile.medical.filter(m => m !== condition)});
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{condition}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button 
                onClick={() => setStep(2)}
                className="w-full"
                disabled={!profile.careLevel}
              >
                Continue to Preferences
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Preferences */}
        {step === 2 && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Lifestyle Preferences
              </CardTitle>
              <CardDescription>
                Help us understand lifestyle and social preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Social Activity Level
                </label>
                <Select value={profile.socialNeeds} onValueChange={(value) => setProfile({...profile, socialNeeds: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Very Social - Daily activities</SelectItem>
                    <SelectItem value="medium">Moderate - Some activities</SelectItem>
                    <SelectItem value="low">Private - Minimal activities</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Family Visit Frequency
                </label>
                <Select value={profile.familyInvolvement} onValueChange={(value) => setProfile({...profile, familyInvolvement: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily Visits</SelectItem>
                    <SelectItem value="weekly">Weekly Visits</SelectItem>
                    <SelectItem value="monthly">Monthly Visits</SelectItem>
                    <SelectItem value="occasional">Occasional Visits</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Desired Amenities
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {desiredAmenities.map((amenity) => (
                    <label key={amenity} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={profile.amenities.includes(amenity)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProfile({...profile, amenities: [...profile.amenities, amenity]});
                          } else {
                            setProfile({...profile, amenities: profile.amenities.filter(a => a !== amenity)});
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(3)}
                  className="flex-1"
                >
                  Continue to Budget
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Budget & Location */}
        {step === 3 && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                Budget & Location
              </CardTitle>
              <CardDescription>
                Set your budget range and preferred location
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-4">
                  Monthly Budget Range: ${profile.budget.min} - ${profile.budget.max}
                </label>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-gray-500">Minimum</span>
                    <Slider
                      value={[profile.budget.min]}
                      onValueChange={([value]) => setProfile({...profile, budget: {...profile.budget, min: value}})}
                      min={500}
                      max={10000}
                      step={500}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Maximum</span>
                    <Slider
                      value={[profile.budget.max]}
                      onValueChange={([value]) => setProfile({...profile, budget: {...profile.budget, max: value}})}
                      min={500}
                      max={15000}
                      step={500}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Preferred Location *
                </label>
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="Enter city or state (e.g., Austin, TX)"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Search Radius: {profile.location.radius} miles
                </label>
                <Slider
                  value={[profile.location.radius]}
                  onValueChange={([value]) => setProfile({...profile, location: {...profile.location, radius: value}})}
                  min={5}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={matchingMutation.isPending || !locationInput}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                >
                  {matchingMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Finding Matches...
                    </>
                  ) : (
                    <>
                      Find My Perfect Match
                      <Brain className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Results */}
        {step === 4 && matches.length > 0 && (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Your AI-Powered Matches
                </CardTitle>
                <CardDescription>
                  Found {matches.length} communities perfectly matched to your needs
                </CardDescription>
              </CardHeader>
            </Card>

            {matches.map((match, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="flex">
                  {/* Match Score */}
                  <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white p-6 flex flex-col items-center justify-center min-w-[120px]">
                    <div className="text-3xl font-bold">{match.matchScore}%</div>
                    <div className="text-xs uppercase tracking-wider mt-1">Match</div>
                  </div>

                  {/* Community Details */}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold">{match.community.name}</h3>
                        <p className="text-gray-600 flex items-center gap-1 mt-1">
                          <MapPin className="h-4 w-4" />
                          {match.community.city}, {match.community.state}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => setLocation(`/community/${match.community.id}`)}
                      >
                        View Details
                      </Button>
                    </div>

                    {/* Match Reasons */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {match.matchReasons.map((reason, i) => (
                          <Badge key={i} variant="secondary">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* AI Insights */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-2">
                        <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                            AI Insights
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {match.aiInsights}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Price Analysis */}
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-green-900 dark:text-green-300 mb-1">
                            Pricing Analysis
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {match.priceAnalysis}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setStep(1);
                  setMatches([]);
                }}
              >
                Start New Search
              </Button>
              <Button onClick={() => setLocation("/")}>
                Back to Home
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}