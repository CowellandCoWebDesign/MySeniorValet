import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  MapPin, 
  Calendar, 
  Settings, 
  User, 
  Bell, 
  Search,
  Star,
  Phone,
  Mail,
  Share2,
  Download,
  Eye,
  BookmarkPlus,
  MessageCircle,
  Building,
  DollarSign,
  Clock,
  Users,
  Trash2,
  Edit,
  CheckCircle,
  TrendingUp,
  Filter,
  Target
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface PersonalizedRecommendation {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  priceRange: string;
  careType: string;
  rating: number;
  matchScore: number;
  reasons: string[];
  availability: string;
}

interface SearchProgress {
  totalCommunities: number;
  viewed: number;
  saved: number;
  toursScheduled: number;
  completionPercentage: number;
}

export default function PersonalizedDashboard() {
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [searchProgress, setSearchProgress] = useState<SearchProgress>({
    totalCommunities: 31023,
    viewed: 12,
    saved: 3,
    toursScheduled: 1,
    completionPercentage: 25
  });
  const [preferences, setPreferences] = useState({
    maxBudget: 4000,
    careType: 'Assisted Living',
    location: 'Sacramento, CA',
    amenities: ['Medical Care', 'Transportation', 'Meals Included']
  });

  useEffect(() => {
    // Load personalized recommendations
    setRecommendations([
      {
        id: 30789,
        name: "FLORIN GARDENS APARTMENTS COOPERATIVE",
        address: "7727 Florin Mall Dr",
        city: "Sacramento",
        state: "CA",
        priceRange: "$303/month",
        careType: "Independent Living",
        rating: 4.2,
        matchScore: 95,
        reasons: ["Within budget", "Close to family", "HUD certified", "Transportation available"],
        availability: "Available"
      },
      {
        id: 800067910,
        name: "SACRAMENTO ELDERLY APARTMENTS",
        address: "1325 Auburn Blvd",
        city: "Sacramento",
        state: "CA",
        priceRange: "$355/month",
        careType: "Senior Housing",
        rating: 4.0,
        matchScore: 92,
        reasons: ["Excellent value", "Government subsidized", "Medical services nearby"],
        availability: "Waitlist"
      },
      {
        id: 12345,
        name: "Golden Valley Assisted Living",
        address: "2500 Fair Oaks Blvd",
        city: "Sacramento",
        state: "CA",
        priceRange: "$3,800-$4,200/month",
        careType: "Assisted Living",
        rating: 4.5,
        matchScore: 88,
        reasons: ["Memory care available", "24/7 nursing", "Family-owned", "Pet-friendly"],
        availability: "Available"
      }
    ]);
  }, []);

  const handleSaveRecommendation = (recommendation: PersonalizedRecommendation) => {
    toast({
      title: "Community Saved",
      description: `${recommendation.name} has been added to your saved communities.`,
    });

    // Update progress
    setSearchProgress(prev => ({
      ...prev,
      saved: prev.saved + 1,
      completionPercentage: Math.min(prev.completionPercentage + 5, 100)
    }));
  };

  const handleScheduleTour = (recommendation: PersonalizedRecommendation) => {
    toast({
      title: "Tour Scheduled",
      description: `Tour request submitted for ${recommendation.name}.`,
    });

    // Update progress
    setSearchProgress(prev => ({
      ...prev,
      toursScheduled: prev.toursScheduled + 1,
      completionPercentage: Math.min(prev.completionPercentage + 10, 100)
    }));
  };

  const handleViewCommunity = (id: number) => {
    // Update progress
    setSearchProgress(prev => ({
      ...prev,
      viewed: prev.viewed + 1,
      completionPercentage: Math.min(prev.completionPercentage + 2, 100)
    }));

    // Navigate to community detail
    window.location.href = `/community/${id}`;
  };

  const handleUpdatePreferences = () => {
    toast({
      title: "Preferences Updated",
      description: "Your search preferences have been updated. New recommendations will be generated.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      <NavigationHeader 
        title="Personalized Dashboard" 
        subtitle="Your curated senior living journey"
      />

      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Your Personalized Dashboard
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Tailored recommendations and progress tracking for your senior living search
          </p>
        </div>

        {/* Search Progress Section */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <TrendingUp className="h-6 w-6 mr-2 text-blue-600" />
              Your Search Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{searchProgress.completionPercentage}%</span>
                </div>
                <Progress value={searchProgress.completionPercentage} className="h-3" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{searchProgress.viewed}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Communities Viewed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">{searchProgress.saved}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Communities Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{searchProgress.toursScheduled}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Tours Scheduled</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{searchProgress.totalCommunities.toLocaleString()}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Total Available</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Preferences */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <Target className="h-6 w-6 mr-2 text-green-600" />
                Your Preferences
              </CardTitle>
              <Button onClick={handleUpdatePreferences} variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Update Preferences
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Budget</span>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">Up to ${preferences.maxBudget.toLocaleString()}/month</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Care Type</span>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{preferences.careType}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</span>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{preferences.location}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Key Amenities</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {preferences.amenities.map((amenity, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personalized Recommendations */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Recommended For You
            </h2>
            <Link href="/search">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Search className="h-4 w-4 mr-2" />
                See All Communities
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            {recommendations.map((recommendation) => (
              <Card key={recommendation.id} className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {recommendation.name}
                        </h3>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                          {recommendation.matchScore}% Match
                        </Badge>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 flex items-center mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        {recommendation.address}, {recommendation.city}, {recommendation.state}
                      </p>
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="font-medium">{recommendation.rating}</span>
                        </div>
                        <Badge variant="secondary">{recommendation.careType}</Badge>
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                          {recommendation.priceRange}
                        </Badge>
                        <Badge className={
                          recommendation.availability === 'Available' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                        }>
                          {recommendation.availability}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Why this is a great match:</h4>
                    <div className="flex flex-wrap gap-2">
                      {recommendation.reasons.map((reason, index) => (
                        <Badge key={index} variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
                          <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => handleViewCommunity(recommendation.id)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button
                      onClick={() => handleSaveRecommendation(recommendation)}
                      variant="outline"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Save Community
                    </Button>
                    <Button
                      onClick={() => handleScheduleTour(recommendation)}
                      variant="outline"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Tour
                    </Button>
                    <Button variant="outline">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardContent className="p-6 text-center">
              <Search className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Refine Search</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Update your criteria to find even better matches</p>
              <Link href="/search">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Update Search
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardContent className="p-6 text-center">
              <Calendar className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Schedule Tours</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Visit your favorite communities in person</p>
              <Link href="/tour-tracker">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Manage Tours
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Family Sharing</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Keep your family informed about your search</p>
              <Link href="/family-collaboration">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Share Progress
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}