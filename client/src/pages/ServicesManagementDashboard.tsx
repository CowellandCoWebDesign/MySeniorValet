import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { 
  BarChart3, 
  Settings, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Eye, 
  MousePointer, 
  Plus,
  Edit,
  Search,
  Filter,
  Download,
  ExternalLink
} from "lucide-react";

// Types
interface ServiceCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  sortOrder: number;
  serviceCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ServiceProvider {
  id: number;
  name: string;
  description: string;
  logo: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
  isPartner: boolean;
  isActive: boolean;
  rating: string;
  totalReviews: number;
  partnershipLevel: string;
  commissionRate: string;
  serviceCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Service {
  id: number;
  categoryId: number;
  providerId: number;
  name: string;
  description: string;
  shortDescription: string;
  features: string[];
  pricing: {
    type: string;
    amount?: number;
    min?: number;
    max?: number;
    currency: string;
    unit?: string;
    description?: string;
  };
  serviceType: string;
  deliveryMethod: string[];
  externalUrl: string;
  affiliateCode: string;
  productId: string;
  imageUrl: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  categoryName: string;
  providerName: string;
  providerLogo: string;
  createdAt: string;
  updatedAt: string;
}

// Form schemas
const serviceProviderSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  isPartner: z.boolean().default(false),
  isActive: z.boolean().default(true),
  partnershipLevel: z.enum(["featured", "premium", "standard", "affiliate"]).default("standard"),
  commissionRate: z.number().optional(),
});

const serviceCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

const serviceSchema = z.object({
  categoryId: z.number(),
  providerId: z.number(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  features: z.array(z.string()).default([]),
  serviceType: z.enum(["product", "service", "consultation", "subscription", "one-time"]),
  deliveryMethod: z.array(z.string()).default([]),
  externalUrl: z.string().url().optional().or(z.literal("")),
  affiliateCode: z.string().optional(),
  productId: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().default(0),
  pricing: z.object({
    type: z.enum(["fixed", "range", "variable", "quote"]),
    amount: z.number().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    currency: z.string().default("USD"),
    unit: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
});

export default function ServicesManagementDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateProvider, setShowCreateProvider] = useState(false);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [showCreateService, setShowCreateService] = useState(false);

  const queryClient = useQueryClient();

  // Data fetching
  const { data: categories = [] } = useQuery<ServiceCategory[]>({
    queryKey: ["/api/services-management/categories"],
  });

  const { data: providers = [] } = useQuery<ServiceProvider[]>({
    queryKey: ["/api/services-management/providers"],
  });

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services-management/services"],
  });

  const { data: analytics } = useQuery<{
    analytics: any[];
    summary: {
      totalViews: number;
      totalClicks: number;
      totalConversions: number;
      totalRevenue: number;
      avgEngagementRate: number;
      avgConversionRate: number;
    };
  }>({
    queryKey: ["/api/services-management/analytics/dashboard"],
  });

  const { data: topServices = [] } = useQuery<any[]>({
    queryKey: ["/api/services-management/analytics/top-services"],
  });

  // Mutations
  const createProviderMutation = useMutation({
    mutationFn: async (data: z.infer<typeof serviceProviderSchema>) => {
      const response = await fetch("/api/services-management/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create provider");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services-management/providers"] });
      setShowCreateProvider(false);
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: z.infer<typeof serviceCategorySchema>) => {
      const response = await fetch("/api/services-management/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create category");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services-management/categories"] });
      setShowCreateCategory(false);
    },
  });

  const createServiceMutation = useMutation({
    mutationFn: async (data: z.infer<typeof serviceSchema>) => {
      const response = await fetch("/api/services-management/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create service");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services-management/services"] });
      setShowCreateService(false);
    },
  });

  // Forms
  const providerForm = useForm<z.infer<typeof serviceProviderSchema>>({
    resolver: zodResolver(serviceProviderSchema),
    defaultValues: {
      isPartner: false,
      isActive: true,
      partnershipLevel: "standard",
    },
  });

  const categoryForm = useForm<z.infer<typeof serviceCategorySchema>>({
    resolver: zodResolver(serviceCategorySchema),
    defaultValues: {
      isActive: true,
      sortOrder: 0,
    },
  });

  const serviceForm = useForm<z.infer<typeof serviceSchema>>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      features: [],
      deliveryMethod: [],
      isActive: true,
      isFeatured: false,
      sortOrder: 0,
      serviceType: "service",
      pricing: {
        type: "quote",
        currency: "USD",
      },
    },
  });

  // Filter services
  const filteredServices = services.filter((service: Service) => {
    const matchesCategory = selectedCategory === "all" || service.categoryId.toString() === selectedCategory;
    const matchesProvider = selectedProvider === "all" || service.providerId.toString() === selectedProvider;
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesProvider && matchesSearch;
  });

  const stats = {
    totalServices: services.length,
    activeServices: services.filter((s: Service) => s.isActive).length,
    totalProviders: providers.length,
    partnerProviders: providers.filter((p: ServiceProvider) => p.isPartner).length,
    totalCategories: categories.length,
    activeCategories: categories.filter((c: ServiceCategory) => c.isActive).length,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Services Management Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all services, providers, and track performance analytics
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Services</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalServices}</p>
                  <p className="text-sm text-green-600">{stats.activeServices} active</p>
                </div>
                <Settings className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Service Providers</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalProviders}</p>
                  <p className="text-sm text-blue-600">{stats.partnerProviders} partners</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categories</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalCategories}</p>
                  <p className="text-sm text-green-600">{stats.activeCategories} active</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Clicks</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {analytics?.summary?.totalClicks || 0}
                  </p>
                  <p className="text-sm text-green-600">
                    {analytics?.summary?.totalConversions || 0} conversions
                  </p>
                </div>
                <MousePointer className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="providers">Providers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={() => setShowCreateService(true)} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Service
                  </Button>
                  <Button onClick={() => setShowCreateProvider(true)} variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Provider
                  </Button>
                  <Button onClick={() => setShowCreateCategory(true)} variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Category
                  </Button>
                </CardContent>
              </Card>

              {/* Top Performing Services */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topServices.slice(0, 5).map((service: any) => (
                      <div key={service.serviceId} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{service.serviceName}</p>
                          <p className="text-sm text-gray-600">{service.categoryName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{service.totalClicks} clicks</p>
                          <p className="text-sm text-gray-600">{service.totalConversions} conversions</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            {/* Filters and Search */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search services..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category: ServiceCategory) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Providers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Providers</SelectItem>
                      {providers.map((provider: ServiceProvider) => (
                        <SelectItem key={provider.id} value={provider.id.toString()}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={() => setShowCreateService(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Services List */}
            <div className="grid gap-4">
              {filteredServices.map((service: Service) => (
                <Card key={service.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{service.name}</h3>
                          <Badge variant={service.isActive ? "default" : "secondary"}>
                            {service.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {service.isFeatured && (
                            <Badge variant="outline">Featured</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          {service.shortDescription || service.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{service.categoryName}</span>
                          <span>•</span>
                          <span>{service.providerName}</span>
                          <span>•</span>
                          <span className="capitalize">{service.serviceType}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {service.externalUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={service.externalUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Providers Tab */}
          <TabsContent value="providers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Service Providers</h2>
              <Button onClick={() => setShowCreateProvider(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Provider
              </Button>
            </div>

            <div className="grid gap-4">
              {providers.map((provider: ServiceProvider) => (
                <Card key={provider.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{provider.name}</h3>
                          <Badge variant={provider.isPartner ? "default" : "secondary"}>
                            {provider.isPartner ? "Partner" : "Standard"}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {provider.partnershipLevel}
                          </Badge>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          {provider.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{provider.serviceCount} services</span>
                          {provider.rating && (
                            <>
                              <span>•</span>
                              <span>{provider.rating}★ ({provider.totalReviews} reviews)</span>
                            </>
                          )}
                          {provider.commissionRate && (
                            <>
                              <span>•</span>
                              <span>{provider.commissionRate}% commission</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {provider.website && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={provider.website} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {analytics?.summary?.totalViews || 0}
                    </div>
                    <p className="text-gray-600">Total Views</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {analytics?.summary?.totalClicks || 0}
                    </div>
                    <p className="text-gray-600">Total Clicks</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {analytics?.summary?.avgEngagementRate?.toFixed(2) || 0}%
                    </div>
                    <p className="text-gray-600">Avg Engagement Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Provider Dialog */}
        <Dialog open={showCreateProvider} onOpenChange={setShowCreateProvider}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Service Provider</DialogTitle>
            </DialogHeader>
            <Form {...providerForm}>
              <form onSubmit={providerForm.handleSubmit((data) => createProviderMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={providerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={providerForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={providerForm.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input type="url" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={providerForm.control}
                  name="isPartner"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel>Partner Provider</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={createProviderMutation.isPending} className="w-full">
                  {createProviderMutation.isPending ? "Creating..." : "Create Provider"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Create Category Dialog */}
        <Dialog open={showCreateCategory} onOpenChange={setShowCreateCategory}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Service Category</DialogTitle>
            </DialogHeader>
            <Form {...categoryForm}>
              <form onSubmit={categoryForm.handleSubmit((data) => createCategoryMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={categoryForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={categoryForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={categoryForm.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon (emoji)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="🛍️" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={categoryForm.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Input type="color" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={createCategoryMutation.isPending} className="w-full">
                  {createCategoryMutation.isPending ? "Creating..." : "Create Category"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}