import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Baby, 
  MapPin, 
  Phone, 
  Globe, 
  CheckCircle, 
  Search, 
  ArrowRight, 
  Sparkles,
  Clock,
  DollarSign,
  Star,
  Building,
  Users
} from "lucide-react";
import { ProfessionalNavbar } from "@/components/ProfessionalNavbar";
import { GlobalDiscoveryModal } from '@/components/GlobalDiscoveryModal';

interface ChildcareCenter {
  id: string | number;
  name: string;
  description?: string;
  city?: string;
  state?: string;
  address?: string;
  phone?: string;
  website?: string;
  pricing?: string;
  ageRange?: string;
  rating?: number;
  isDiscovered?: boolean;
  type?: string;
}

export default function ChildcareDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [childcareCenters, setChildcareCenters] = useState<ChildcareCenter[]>([]);
  const [showGlobalDiscovery, setShowGlobalDiscovery] = useState(false);
  const [discoveryResults, setDiscoveryResults] = useState<any>(null);
  const { toast } = useToast();

  // Load initial childcare centers on mount
  useEffect(() => {
    loadChildcareCenters();
  }, []);

  const loadChildcareCenters = async () => {
    try {
      const response = await fetch('/api/communities?careType=childcare&limit=20');
      if (response.ok) {
        const data = await response.json();
        setChildcareCenters(data.communities || []);
      }
    } catch (error) {
      console.error('Error loading childcare centers:', error);
    }
  };

  const handleGlobalDiscovery = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a location or childcare center name to search",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch('/api/global-discovery/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: searchQuery,
          searchType: 'childcare',
          limit: 30
        })
      });

      if (response.ok) {
        const data = await response.json();
        setDiscoveryResults({
          query: searchQuery,
          results: data.results || [],
          metadata: data.metadata
        });
        setShowGlobalDiscovery(true);
        
        // Update local list with discovered centers
        if (data.results && data.results.length > 0) {
          setChildcareCenters(prev => [...data.results, ...prev]);
        }

        toast({
          title: "Discovery Complete",
          description: `Found ${data.metadata?.discoveredCount || 0} new childcare centers`,
        });
      }
    } catch (error) {
      console.error('Discovery error:', error);
      toast({
        title: "Discovery Failed",
        description: "Unable to search for childcare centers. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const ChildcareCard = ({ center }: { center: ChildcareCenter }) => (
    <Card className="hover:shadow-lg transition-all hover:scale-105 border-pink-200 dark:border-pink-800">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Baby className="h-5 w-5 text-pink-500" />
              {center.name}
            </CardTitle>
            {center.isDiscovered && (
              <Badge className="mt-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Discovered
              </Badge>
            )}
          </div>
          {center.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium">{center.rating}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {center.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {center.description}
          </p>
        )}
        
        <div className="space-y-2">
          {(center.city || center.state) && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-pink-400" />
              <span>{center.city}{center.city && center.state ? ', ' : ''}{center.state}</span>
            </div>
          )}
          
          {center.address && (
            <div className="flex items-center gap-2 text-sm">
              <Building className="h-4 w-4 text-pink-400" />
              <span className="line-clamp-1">{center.address}</span>
            </div>
          )}
          
          {center.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-pink-400" />
              <span>{center.phone}</span>
            </div>
          )}
          
          {center.website && (
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-pink-400" />
              <a href={center.website} target="_blank" rel="noopener noreferrer" 
                 className="text-pink-600 hover:text-pink-700 underline">
                Visit Website
              </a>
            </div>
          )}
          
          {center.ageRange && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-pink-400" />
              <span>Ages: {center.ageRange}</span>
            </div>
          )}
          
          {center.pricing && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-pink-400" />
              <span className="text-green-600 dark:text-green-400 font-medium">{center.pricing}</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button size="sm" className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white">
            Contact Center
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <ProfessionalNavbar />
      
      {showGlobalDiscovery && discoveryResults && (
        <GlobalDiscoveryModal
          isOpen={showGlobalDiscovery}
          onClose={() => setShowGlobalDiscovery(false)}
          searchQuery={discoveryResults.query}
          results={discoveryResults.results}
          metadata={discoveryResults.metadata}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50 dark:from-gray-900 dark:via-pink-900/20 dark:to-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-gradient-to-br from-pink-500 to-rose-500">
                <Baby className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Global Child Care Directory
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Discover daycares, preschools, and early learning centers worldwide with transparent pricing
            </p>
          </div>

          {/* Search Section */}
          <Card className="mb-8 border-pink-200 dark:border-pink-800 bg-white/95 dark:bg-gray-800/95">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-pink-400" />
                  <Input
                    placeholder="Search by location (e.g., 'daycares in Seattle' or 'preschools in London')"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleGlobalDiscovery()}
                    className="pl-10 border-pink-200 dark:border-pink-700"
                  />
                </div>
                <Button 
                  onClick={handleGlobalDiscovery}
                  disabled={isSearching}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white min-w-[150px]"
                >
                  {isSearching ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Discovering...
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4 mr-2" />
                      Global Discovery
                    </>
                  )}
                </Button>
              </div>
              
              {/* Quick Examples */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Try:</span>
                {['daycares in Austin', 'Montessori schools NYC', 'preschools London', 'childcare Toronto'].map(example => (
                  <Button
                    key={example}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery(example);
                      handleGlobalDiscovery();
                    }}
                    className="border-pink-200 hover:bg-pink-50 dark:border-pink-700 dark:hover:bg-pink-900/20"
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-pink-200 dark:border-pink-800">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-pink-600">7+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Centers in Austin</div>
              </CardContent>
            </Card>
            <Card className="border-pink-200 dark:border-pink-800">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-pink-600">Global</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Coverage</div>
              </CardContent>
            </Card>
            <Card className="border-pink-200 dark:border-pink-800">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-pink-600">Real-Time</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Discovery</div>
              </CardContent>
            </Card>
            <Card className="border-pink-200 dark:border-pink-800">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-pink-600">AI-Powered</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Search</div>
              </CardContent>
            </Card>
          </div>

          {/* Results Grid */}
          {childcareCenters.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isSearching ? 'Discovering Centers...' : `${childcareCenters.length} Centers Available`}
                </h2>
                <Badge className="bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-100">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified Data
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {childcareCenters.map((center) => (
                  <ChildcareCard key={center.id} center={center} />
                ))}
              </div>
            </>
          ) : (
            <Card className="border-pink-200 dark:border-pink-800">
              <CardContent className="p-12 text-center">
                <Baby className="h-16 w-16 text-pink-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Start Your Discovery</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Enter a location above to discover childcare centers anywhere in the world
                </p>
                <p className="text-sm text-pink-600 dark:text-pink-400">
                  🌍 Works globally • 📍 Real locations • 💰 Transparent pricing
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}