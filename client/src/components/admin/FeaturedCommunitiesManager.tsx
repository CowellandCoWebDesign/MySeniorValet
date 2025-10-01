import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChevronUp, 
  ChevronDown, 
  Plus, 
  Save, 
  Trash2, 
  Edit2, 
  X,
  Search,
  Star,
  Eye,
  EyeOff,
  AlertCircle
} from "lucide-react";

interface FeaturedCommunity {
  id: number;
  communityId: number;
  communityName?: string;
  city?: string;
  state?: string;
  communityPhoto?: string;
  featuredTitle: string;
  highlights: string[];
  dealType: string;
  availability: string;
  whyFeatured: string[];
  heroImage?: string;
  displayOrder: number;
  isActive: boolean;
  showInRedTagDeals: boolean;
  subscriptionTier?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function FeaturedCommunitiesManager() {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddNew, setShowAddNew] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    communityId: "",
    featuredTitle: "",
    highlights: "",
    dealType: "",
    availability: "Available Now",
    whyFeatured: "",
    heroImage: "",
    displayOrder: 999,
    subscriptionTier: "excellence"
  });

  // Fetch featured communities
  const { data: featuredCommunities = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/featured-communities'],
    queryFn: async () => {
      const response = await fetch('/api/admin/featured-communities');
      if (!response.ok) throw new Error('Failed to fetch featured communities');
      return response.json();
    }
  });

  // Search communities for adding new featured
  const { data: searchResults = [] } = useQuery({
    queryKey: ['/api/communities/search', searchQuery],
    queryFn: async () => {
      if (!searchQuery) return [];
      const response = await fetch(`/api/communities/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: searchQuery.length > 2
  });

  // Update featured community
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<FeaturedCommunity> }) => {
      return apiRequest(`/api/admin/featured-communities/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Featured community updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/featured-communities'] });
      setEditingId(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update featured community", variant: "destructive" });
    }
  });

  // Toggle active status
  const toggleMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/featured-communities/${id}/toggle`, {
        method: 'PATCH'
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Status toggled successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/featured-communities'] });
    }
  });

  // Add new featured community
  const addMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/admin/featured-communities', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Featured community added successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/featured-communities'] });
      setShowAddNew(false);
      setNewCommunity({
        communityId: "",
        featuredTitle: "",
        highlights: "",
        dealType: "",
        availability: "Available Now",
        whyFeatured: "",
        heroImage: "",
        displayOrder: 999,
        subscriptionTier: "excellence"
      });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add featured community", variant: "destructive" });
    }
  });

  // Delete featured community
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/featured-communities/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Featured community removed successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/featured-communities'] });
    }
  });

  // Update display order
  const updateOrder = async (id: number, direction: 'up' | 'down') => {
    const index = featuredCommunities.findIndex((fc: FeaturedCommunity) => fc.id === id);
    if (index === -1) return;
    
    const newOrder = direction === 'up' ? index - 1 : index + 1;
    if (newOrder < 0 || newOrder >= featuredCommunities.length) return;
    
    const reorderedList = [...featuredCommunities];
    [reorderedList[index], reorderedList[newOrder]] = [reorderedList[newOrder], reorderedList[index]];
    
    // Update display orders
    await Promise.all(reorderedList.map((fc: FeaturedCommunity, idx: number) => 
      updateMutation.mutateAsync({ id: fc.id, updates: { displayOrder: idx } })
    ));
  };

  const handleAddNew = async () => {
    if (!newCommunity.communityId || !newCommunity.featuredTitle) {
      toast({ title: "Error", description: "Please fill required fields", variant: "destructive" });
      return;
    }

    const data = {
      communityId: parseInt(newCommunity.communityId),
      featuredTitle: newCommunity.featuredTitle,
      highlights: newCommunity.highlights.split(',').map(h => h.trim()).filter(h => h),
      dealType: newCommunity.dealType || "Featured Community",
      availability: newCommunity.availability,
      whyFeatured: newCommunity.whyFeatured.split(',').map(w => w.trim()).filter(w => w),
      heroImage: newCommunity.heroImage || null,
      displayOrder: newCommunity.displayOrder,
      subscriptionTier: newCommunity.subscriptionTier,
      isActive: true,
      showInRedTagDeals: true
    };

    await addMutation.mutateAsync(data);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Featured Excellence Communities Management
            </div>
            <Button 
              onClick={() => setShowAddNew(!showAddNew)}
              variant={showAddNew ? "secondary" : "default"}
            >
              {showAddNew ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {showAddNew ? "Cancel" : "Add New Featured"}
            </Button>
          </CardTitle>
          <CardDescription>
            Manage premium communities displayed in the Featured Excellence section on the homepage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Add New Section */}
          {showAddNew && (
            <Card className="mb-6 border-primary/20">
              <CardHeader className="bg-primary/5">
                <CardTitle className="text-lg">Add New Featured Community</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label htmlFor="search">Search Community</Label>
                  <div className="flex gap-2">
                    <Input
                      id="search"
                      placeholder="Search by name or ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button variant="outline" size="icon">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  {searchResults.length > 0 && (
                    <div className="mt-2 border rounded-lg max-h-32 overflow-y-auto">
                      {searchResults.slice(0, 5).map((community: any) => (
                        <button
                          key={community.id}
                          className="w-full text-left p-2 hover:bg-accent transition-colors"
                          onClick={() => {
                            setNewCommunity({
                              ...newCommunity,
                              communityId: community.id.toString(),
                              featuredTitle: `${community.name} - ${community.city}, ${community.state}`
                            });
                            setSearchQuery("");
                          }}
                        >
                          <div className="font-medium">{community.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {community.city}, {community.state} - ID: {community.id}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="communityId">Community ID</Label>
                    <Input
                      id="communityId"
                      value={newCommunity.communityId}
                      onChange={(e) => setNewCommunity({ ...newCommunity, communityId: e.target.value })}
                      placeholder="Enter community ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tier">Subscription Tier</Label>
                    <Select
                      value={newCommunity.subscriptionTier}
                      onValueChange={(value) => setNewCommunity({ ...newCommunity, subscriptionTier: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellence">Excellence</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="title">Featured Title</Label>
                  <Input
                    id="title"
                    value={newCommunity.featuredTitle}
                    onChange={(e) => setNewCommunity({ ...newCommunity, featuredTitle: e.target.value })}
                    placeholder="e.g., Premium Coastal Living Community"
                  />
                </div>

                <div>
                  <Label htmlFor="dealType">Deal Type / Tag</Label>
                  <Input
                    id="dealType"
                    value={newCommunity.dealType}
                    onChange={(e) => setNewCommunity({ ...newCommunity, dealType: e.target.value })}
                    placeholder="e.g., Limited Time Offer"
                  />
                </div>

                <div>
                  <Label htmlFor="highlights">Highlights (comma-separated)</Label>
                  <Textarea
                    id="highlights"
                    value={newCommunity.highlights}
                    onChange={(e) => setNewCommunity({ ...newCommunity, highlights: e.target.value })}
                    placeholder="Ocean views, Award-winning dining, Wellness programs"
                  />
                </div>

                <div>
                  <Label htmlFor="whyFeatured">Why Featured (comma-separated)</Label>
                  <Textarea
                    id="whyFeatured"
                    value={newCommunity.whyFeatured}
                    onChange={(e) => setNewCommunity({ ...newCommunity, whyFeatured: e.target.value })}
                    placeholder="Prestigious network, Prime location, Excellence in care"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="availability">Availability</Label>
                    <Select
                      value={newCommunity.availability}
                      onValueChange={(value) => setNewCommunity({ ...newCommunity, availability: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Available Now">Available Now</SelectItem>
                        <SelectItem value="Move-in Ready">Move-in Ready</SelectItem>
                        <SelectItem value="Limited Spots">Limited Spots</SelectItem>
                        <SelectItem value="Coming Soon">Coming Soon</SelectItem>
                        <SelectItem value="Waitlist Only">Waitlist Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="order">Display Order</Label>
                    <Input
                      id="order"
                      type="number"
                      value={newCommunity.displayOrder}
                      onChange={(e) => setNewCommunity({ ...newCommunity, displayOrder: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="heroImage">Hero Image URL (optional)</Label>
                  <Input
                    id="heroImage"
                    value={newCommunity.heroImage}
                    onChange={(e) => setNewCommunity({ ...newCommunity, heroImage: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddNew(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddNew} disabled={addMutation.isPending}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Featured Community
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Featured Communities List */}
          {isLoading ? (
            <div className="text-center py-8">Loading featured communities...</div>
          ) : featuredCommunities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>No featured communities found</p>
              <Button onClick={() => setShowAddNew(true)} className="mt-4">
                Add First Featured Community
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {featuredCommunities.map((fc: FeaturedCommunity, index: number) => (
                <Card key={fc.id} className={!fc.isActive ? "opacity-60" : ""}>
                  <CardContent className="pt-6">
                    {editingId === fc.id ? (
                      <FeaturedEditForm
                        featured={fc}
                        onSave={(updates) => updateMutation.mutateAsync({ id: fc.id, updates })}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{fc.featuredTitle}</h3>
                              <Badge variant={fc.isActive ? "default" : "secondary"}>
                                {fc.isActive ? "Active" : "Inactive"}
                              </Badge>
                              {fc.subscriptionTier && (
                                <Badge variant="outline" className="capitalize">
                                  {fc.subscriptionTier}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="text-sm text-muted-foreground mb-3">
                              Community: {fc.communityName || `ID: ${fc.communityId}`} 
                              {fc.city && fc.state && ` • ${fc.city}, ${fc.state}`}
                            </div>

                            {fc.dealType && (
                              <div className="mb-2">
                                <Badge variant="secondary" className="mb-2">{fc.dealType}</Badge>
                              </div>
                            )}

                            {fc.highlights && fc.highlights.length > 0 && (
                              <div className="mb-3">
                                <span className="text-sm font-medium">Highlights:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {fc.highlights.map((highlight, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {highlight}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {fc.availability && (
                              <div className="text-sm">
                                <span className="font-medium">Availability:</span> {fc.availability}
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            {/* Reorder Buttons */}
                            <div className="flex flex-col gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => updateOrder(fc.id, 'up')}
                                disabled={index === 0}
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => updateOrder(fc.id, 'down')}
                                disabled={index === featuredCommunities.length - 1}
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Active Toggle */}
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={fc.isActive}
                                onCheckedChange={() => toggleMutation.mutate(fc.id)}
                                aria-label="Toggle active status"
                              />
                              {fc.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </div>

                            {/* Edit Button */}
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setEditingId(fc.id)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>

                            {/* Delete Button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (confirm(`Remove "${fc.featuredTitle}" from featured communities?`)) {
                                  deleteMutation.mutate(fc.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>

                        {fc.heroImage && (
                          <div className="mt-3">
                            <img 
                              src={fc.heroImage} 
                              alt={fc.featuredTitle}
                              className="h-24 w-36 object-cover rounded-md border"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Edit Form Component
function FeaturedEditForm({ 
  featured, 
  onSave, 
  onCancel 
}: { 
  featured: FeaturedCommunity; 
  onSave: (updates: Partial<FeaturedCommunity>) => Promise<void>;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    featuredTitle: featured.featuredTitle,
    dealType: featured.dealType || "",
    highlights: featured.highlights?.join(", ") || "",
    whyFeatured: featured.whyFeatured?.join(", ") || "",
    availability: featured.availability || "Available Now",
    heroImage: featured.heroImage || "",
    subscriptionTier: featured.subscriptionTier || "excellence"
  });

  const handleSave = async () => {
    await onSave({
      featuredTitle: formData.featuredTitle,
      dealType: formData.dealType,
      highlights: formData.highlights.split(',').map(h => h.trim()).filter(h => h),
      whyFeatured: formData.whyFeatured.split(',').map(w => w.trim()).filter(w => w),
      availability: formData.availability,
      heroImage: formData.heroImage,
      subscriptionTier: formData.subscriptionTier
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Featured Title</Label>
        <Input
          value={formData.featuredTitle}
          onChange={(e) => setFormData({ ...formData, featuredTitle: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Deal Type / Tag</Label>
          <Input
            value={formData.dealType}
            onChange={(e) => setFormData({ ...formData, dealType: e.target.value })}
          />
        </div>
        <div>
          <Label>Availability</Label>
          <Select
            value={formData.availability}
            onValueChange={(value) => setFormData({ ...formData, availability: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Available Now">Available Now</SelectItem>
              <SelectItem value="Move-in Ready">Move-in Ready</SelectItem>
              <SelectItem value="Limited Spots">Limited Spots</SelectItem>
              <SelectItem value="Coming Soon">Coming Soon</SelectItem>
              <SelectItem value="Waitlist Only">Waitlist Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Highlights (comma-separated)</Label>
        <Textarea
          value={formData.highlights}
          onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
          rows={2}
        />
      </div>

      <div>
        <Label>Why Featured (comma-separated)</Label>
        <Textarea
          value={formData.whyFeatured}
          onChange={(e) => setFormData({ ...formData, whyFeatured: e.target.value })}
          rows={2}
        />
      </div>

      <div>
        <Label>Subscription Tier</Label>
        <Select
          value={formData.subscriptionTier}
          onValueChange={(value) => setFormData({ ...formData, subscriptionTier: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="excellence">Excellence</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="standard">Standard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Hero Image URL</Label>
        <Input
          value={formData.heroImage}
          onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}