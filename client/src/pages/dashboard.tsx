import { useState } from "react";
import { useAuth, useLogout } from "@/hooks/useAuth";
import { useFavorites, useRemoveFavorite, useSavedSearches, useDeleteSavedSearch } from "@/hooks/useFavorites";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Heart, 
  Search, 
  MapPin, 
  Phone, 
  Star, 
  Trash2, 
  Settings, 
  LogOut,
  BookmarkPlus,
  Calendar,
  Filter
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const logout = useLogout();
  const { data: favorites = [], isLoading: favoritesLoading } = useFavorites();
  const { data: savedSearches = [], isLoading: savedSearchesLoading } = useSavedSearches();
  const removeFavorite = useRemoveFavorite();
  const deleteSavedSearch = useDeleteSavedSearch();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please log in to view your dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleRemoveFavorite = async (communityId: number, communityName: string) => {
    try {
      await removeFavorite.mutateAsync(communityId);
      toast({
        title: "Removed from favorites",
        description: `${communityName} has been removed from your favorites.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove from favorites. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSavedSearch = async (id: number, searchName: string) => {
    try {
      await deleteSavedSearch.mutateAsync(id);
      toast({
        title: "Search deleted",
        description: `"${searchName}" has been deleted.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete saved search. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    logout.mutate();
  };

  const userInitials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/6 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/8 to-pink-400/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/6 w-72 h-72 bg-gradient-to-r from-cyan-400/8 to-blue-400/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-2/3 right-1/3 w-64 h-64 bg-gradient-to-r from-emerald-400/8 to-teal-400/8 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-lg border-b border-gray-200/60 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-purple-50/30 to-cyan-50/30 opacity-60"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <h1 className="text-2xl font-bold text-blue-600">TrueView</h1>
              </Link>
              <div className="hidden sm:block text-gray-400">|</div>
              <h2 className="hidden sm:block text-xl font-semibold text-gray-900 dark:text-white">
                Dashboard
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <Avatar className="transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white transition-all duration-300 group-hover:from-purple-600 group-hover:to-blue-600">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="favorites">
              Favorites {favorites.length > 0 && `(${favorites.length})`}
            </TabsTrigger>
            <TabsTrigger value="searches">
              Saved Searches {savedSearches.length > 0 && `(${savedSearches.length})`}
            </TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Favorite Communities</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{favorites.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Communities you've saved for later
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Saved Searches</CardTitle>
                  <Search className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{savedSearches.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Search filters you've saved
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Account Status</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Active</div>
                  <p className="text-xs text-muted-foreground">
                    Member since {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks to help you find the perfect senior living community.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <Link href="/search">
                  <Button>
                    <Search className="mr-2 h-4 w-4" />
                    Search Communities
                  </Button>
                </Link>
                <Link href="/search?map=true">
                  <Button variant="outline">
                    <MapPin className="mr-2 h-4 w-4" />
                    Browse Map
                  </Button>
                </Link>
                {favorites.length > 0 && (
                  <Button variant="outline" onClick={() => setActiveTab("favorites")}>
                    <Heart className="mr-2 h-4 w-4" />
                    View Favorites
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Recent Favorites Preview */}
            {favorites.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Favorites</CardTitle>
                  <CardDescription>
                    Your most recently saved communities.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {favorites.slice(0, 4).map((favorite) => (
                      <div
                        key={favorite.id}
                        className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <div className="flex-shrink-0">
                          {favorite.community.photos?.[0] ? (
                            <img
                              src={favorite.community.photos[0]}
                              alt={favorite.community.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              <MapPin className="h-6 w-6 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/communities/${favorite.community.id}`}>
                            <p className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600">
                              {favorite.community.name}
                            </p>
                          </Link>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {favorite.community.city}, {favorite.community.state}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {favorites.length > 4 && (
                    <div className="mt-4 text-center">
                      <Button variant="outline" onClick={() => setActiveTab("favorites")}>
                        View All Favorites ({favorites.length})
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Your Favorite Communities</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Communities you've saved to compare and revisit later.
                </p>
              </div>
              <Link href="/search">
                <Button>
                  <BookmarkPlus className="mr-2 h-4 w-4" />
                  Find More Communities
                </Button>
              </Link>
            </div>

            {favoritesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : favorites.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No favorites yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Start exploring communities and save your favorites for easy comparison.
                  </p>
                  <Link href="/search">
                    <Button>
                      <Search className="mr-2 h-4 w-4" />
                      Browse Communities
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((favorite) => (
                  <Card key={favorite.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-2">
                          <Heart className="h-4 w-4 text-red-500 fill-current" />
                          {favorite.priority > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              Priority {favorite.priority}
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleRemoveFavorite(favorite.community.id, favorite.community.name)
                          }
                          disabled={removeFavorite.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <Link href={`/communities/${favorite.community.id}`}>
                        <h4 className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 mb-2">
                          {favorite.community.name}
                        </h4>
                      </Link>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <MapPin className="h-3 w-3 mr-1" />
                          {favorite.community.address}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {favorite.community.city}, {favorite.community.state}
                        </div>
                      </div>

                      {favorite.community.careTypes && favorite.community.careTypes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {favorite.community.careTypes.slice(0, 2).map((type) => (
                            <Badge key={type} variant="outline" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                          {favorite.community.careTypes.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{favorite.community.careTypes.length - 2} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {favorite.tags && favorite.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {favorite.tags.map((tag) => (
                            <Badge key={tag} className="text-xs bg-blue-100 text-blue-800">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {favorite.notes && (
                        <div className="text-sm text-gray-600 dark:text-gray-300 italic mb-4">
                          "{favorite.notes}"
                        </div>
                      )}

                      <div className="text-xs text-gray-400">
                        Added {new Date(favorite.addedAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Saved Searches Tab */}
          <TabsContent value="searches" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Saved Searches</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Search filters you've saved for quick access.
                </p>
              </div>
              <Link href="/search">
                <Button>
                  <Filter className="mr-2 h-4 w-4" />
                  Create New Search
                </Button>
              </Link>
            </div>

            {savedSearchesLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : savedSearches.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No saved searches
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Save your search filters to quickly find communities that match your criteria.
                  </p>
                  <Link href="/search">
                    <Button>
                      <Filter className="mr-2 h-4 w-4" />
                      Start Searching
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {savedSearches.map((search) => (
                  <Card key={search.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            {search.searchName}
                          </h4>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {Object.entries(search.searchParams).map(([key, value]) => {
                              if (!value || (Array.isArray(value) && value.length === 0)) return null;
                              return (
                                <Badge key={key} variant="outline" className="text-xs">
                                  {key}: {Array.isArray(value) ? value.join(", ") : value}
                                </Badge>
                              );
                            })}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              Created {new Date(search.createdAt).toLocaleDateString()}
                            </div>
                            {search.alertsEnabled && (
                              <Badge className="text-xs bg-green-100 text-green-800">
                                Alerts On
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link href={`/search?${new URLSearchParams(search.searchParams).toString()}`}>
                            <Button variant="outline" size="sm">
                              <Search className="h-4 w-4 mr-1" />
                              Run Search
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSavedSearch(search.id, search.searchName)}
                            disabled={deleteSavedSearch.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your basic account details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Name
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {user.firstName} {user.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">{user.email}</p>
                  </div>
                  {user.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Phone
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">{user.phone}</p>
                    </div>
                  )}
                  {user.relationshipToCare && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Relationship to Care
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {user.relationshipToCare}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Manage your account preferences and notifications.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Advanced settings and preferences will be available in a future update.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      </div>
    </div>
  );
}