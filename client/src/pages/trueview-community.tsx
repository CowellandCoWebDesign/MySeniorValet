import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Heart, 
  Share, 
  MoreHorizontal, 
  MapPin, 
  Phone, 
  Globe, 
  Star, 
  Calendar,
  Users,
  Car,
  Wifi,
  Activity,
  Shield,
  Clock,
  Home
} from "lucide-react";

interface Community {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  careTypes: string[];
  monthlyRent?: number;
  googleRating?: number;
  googleReviewCount?: number;
  phone?: string;
  website?: string;
  photos?: string[];
  amenities?: string[];
  description?: string;
  latitude?: number;
  longitude?: number;
}

export default function TrueViewCommunity() {
  const { id } = useParams();
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'amenities' | 'reviews'>('overview');

  const { data: community, isLoading } = useQuery<Community>({
    queryKey: [`/api/communities/${id}`],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Community not found</h2>
          <Link href="/search">
            <Button variant="outline">Back to search</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Photo Gallery */}
      <div className="relative h-80 bg-gray-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <Home className="w-16 h-16 text-gray-400" />
        </div>
        
        {/* Header Overlay */}
        <div className="absolute top-0 left-0 right-0 p-4">
          <div className="flex items-center justify-between">
            <Link href="/search">
              <Button variant="ghost" size="sm" className="bg-white/80 hover:bg-white p-2 rounded-full">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </Button>
            </Link>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="bg-white/80 hover:bg-white p-2 rounded-full"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-700'}`} />
              </Button>
              <Button variant="ghost" size="sm" className="bg-white/80 hover:bg-white p-2 rounded-full">
                <Share className="w-5 h-5 text-gray-700" />
              </Button>
              <Button variant="ghost" size="sm" className="bg-white/80 hover:bg-white p-2 rounded-full">
                <MoreHorizontal className="w-5 h-5 text-gray-700" />
              </Button>
            </div>
          </div>
        </div>

        {/* Price Badge */}
        {community.monthlyRent && (
          <div className="absolute bottom-4 left-4">
            <Badge className="bg-white text-gray-900 text-lg px-3 py-1 shadow-lg">
              From ${community.monthlyRent.toLocaleString()}/mo
            </Badge>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {/* Price and Details */}
        <div className="mb-6">
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {community.monthlyRent ? `$${community.monthlyRent.toLocaleString()}` : 'Contact for pricing'}
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            <span>{community.careTypes?.join(' • ') || 'Senior Living'}</span>
          </div>
          <div className="text-xl font-semibold text-gray-900 mb-2">
            {community.name}
          </div>
          <div className="flex items-center text-gray-600 mb-4">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{community.address}, {community.city}, {community.state} {community.zipCode}</span>
          </div>
          
          {/* Rating */}
          {community.googleRating && (
            <div className="flex items-center mb-4">
              <Star className="w-5 h-5 text-yellow-400 fill-current mr-2" />
              <span className="text-lg font-semibold text-gray-900 mr-2">{community.googleRating}</span>
              <span className="text-gray-600">({community.googleReviewCount} reviews)</span>
            </div>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white py-3">
            <Calendar className="w-4 h-4 mr-2" />
            Request a tour
          </Button>
          <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 py-3">
            <Phone className="w-4 h-4 mr-2" />
            Contact
          </Button>
        </div>

        {/* Tour Scheduling */}
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="text-sm font-medium text-green-800 mb-2">
              Request a tour as early as today at 11:00 am
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Request this time
            </Button>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex space-x-6 border-b border-gray-200 mb-6">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`pb-3 text-sm font-medium border-b-2 ${
              selectedTab === 'overview' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-600'
            }`}
          >
            Facts & features
          </button>
          <button
            onClick={() => setSelectedTab('amenities')}
            className={`pb-3 text-sm font-medium border-b-2 ${
              selectedTab === 'amenities' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-600'
            }`}
          >
            Amenities
          </button>
          <button
            onClick={() => setSelectedTab('reviews')}
            className={`pb-3 text-sm font-medium border-b-2 ${
              selectedTab === 'reviews' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-600'
            }`}
          >
            Reviews
          </button>
        </div>

        {/* Tab Content */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* What's special */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What's special</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <Users className="w-4 h-4 text-gray-400 mr-2" />
                  <span>Family-friendly</span>
                </div>
                <div className="flex items-center">
                  <Shield className="w-4 h-4 text-gray-400 mr-2" />
                  <span>Licensed facility</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-400 mr-2" />
                  <span>24/7 care</span>
                </div>
                <div className="flex items-center">
                  <Activity className="w-4 h-4 text-gray-400 mr-2" />
                  <span>Activities program</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About this community</h3>
              <p className="text-gray-700 leading-relaxed">
                {community.description || 
                  `${community.name} provides exceptional senior living services in ${community.city}, ${community.state}. Our community offers comprehensive care with a focus on dignity, independence, and quality of life for all residents.`
                }
              </p>
            </div>

            <Separator />

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact information</h3>
              <div className="space-y-3">
                {community.phone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 mr-3" />
                    <a href={`tel:${community.phone}`} className="text-blue-600 hover:underline">
                      {community.phone}
                    </a>
                  </div>
                )}
                {community.website && (
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 text-gray-400 mr-3" />
                    <a href={community.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Visit website
                    </a>
                  </div>
                )}
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-700">
                    {community.address}, {community.city}, {community.state} {community.zipCode}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'amenities' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Community amenities</h3>
            <div className="grid grid-cols-2 gap-4">
              {['Dining room', 'Activity center', 'Garden areas', 'Transportation', 'Wellness center', 'Library'].map((amenity) => (
                <div key={amenity} className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'reviews' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Reviews</h3>
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-400 fill-current mr-1" />
                <span className="font-semibold">{community.googleRating}</span>
                <span className="text-gray-600 ml-1">({community.googleReviewCount} reviews)</span>
              </div>
            </div>
            
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">See what others are saying about this community</p>
              <div className="space-y-3">
                <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                  Find on Google Reviews
                </Button>
                <Button variant="outline" className="w-full border-orange-600 text-orange-600 hover:bg-orange-50">
                  Find on Yelp
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom spacing */}
      <div className="h-6"></div>
    </div>
  );
}