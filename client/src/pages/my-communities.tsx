import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Building, 
  Users, 
  MapPin, 
  Calendar,
  Settings,
  TrendingUp,
  Eye,
  MessageSquare,
  Plus,
  Search,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { NavigationHeader } from "@/components/NavigationHeader";

export default function MyCommunities() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch only communities owned by this user
  const { data: response, isLoading: communitiesLoading } = useQuery({
    queryKey: ['/api/my-communities'],
    enabled: !!user,
  });

  const communities = response?.communities || [];

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const filteredCommunities = communities.filter((community: any) => 
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.state?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <NavigationHeader 
        title="My Communities" 
        subtitle="Manage your senior living communities"
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search your communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Communities Grid */}
        {communitiesLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filteredCommunities.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Building className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No Communities Found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {communities.length === 0 
                  ? "You haven't claimed any communities yet."
                  : "No communities match your search."}
              </p>
              {communities.length === 0 && (
                <Link href="/claim">
                  <Button>Claim Your First Community</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommunities.map((community: any) => (
              <Card 
                key={community.id} 
                className="hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                onClick={() => setLocation(`/community-dashboard/${community.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{community.name}</CardTitle>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {community.city}, {community.state}
                      </div>
                    </div>
                    <Badge 
                      variant={community.claimStatus === 'approved' ? 'default' : 'secondary'}
                      className="ml-2"
                    >
                      {community.claimStatus}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Eye className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                      <div className="text-2xl font-bold">2,847</div>
                      <div className="text-xs text-gray-500">Profile Views</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <MessageSquare className="w-5 h-5 mx-auto mb-1 text-green-600" />
                      <div className="text-2xl font-bold">47</div>
                      <div className="text-xs text-gray-500">Inquiries</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Claimed {new Date(community.claimedAt).toLocaleDateString()}
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/community-dashboard/${community.id}`);
                      }}
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Manage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}