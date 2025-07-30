import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Heart, 
  DollarSign, 
  Users, 
  ArrowRight, 
  Search,
  Clock,
  Star,
  Bookmark,
  ExternalLink,
  Filter,
  ChevronRight,
  PlayCircle,
  FileText,
  Download
} from 'lucide-react';
import { Link } from 'wouter';
import { NavigationHeader } from "@/components/NavigationHeader";

interface SupportResourceCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  colorScheme: string;
  resourceCount: number;
}

interface SupportResource {
  id: number;
  categoryId: number;
  title: string;
  description: string;
  resourceType: string;
  tags: string[];
  targetAudience: string[];
  careStage: string;
  emotionalThemes: string[];
  readingTime: number;
  difficulty: string;
  authorName: string;
  authorCredentials: string;
  isFeatured: boolean;
  viewCount: number;
  helpfulCount: number;
  publishedAt: string;
}

const iconMap = {
  BookOpen,
  Heart,
  DollarSign,
  Users,
  ArrowRight,
  PlayCircle,
  FileText,
  Download
};

const resourceTypeIcons = {
  article: FileText,
  guide: BookOpen,
  checklist: FileText,
  video: PlayCircle,
  audio: PlayCircle,
  worksheet: Download,
  external_link: ExternalLink
};

const colorSchemes = {
  blue: 'from-blue-500 to-purple-600',
  pink: 'from-pink-500 to-rose-600',
  green: 'from-green-500 to-emerald-600',
  purple: 'from-purple-500 to-indigo-600',
  orange: 'from-orange-500 to-red-600'
};

export default function SupportResources() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    careStage: '',
    difficulty: '',
    resourceType: ''
  });

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/support-resources/categories'],
    retry: false,
  });

  // Fetch featured resources
  const { data: featuredResources } = useQuery({
    queryKey: ['/api/support-resources/featured'],
    retry: false,
  });

  // Fetch resources by category
  const { data: categoryResources, isLoading: resourcesLoading } = useQuery({
    queryKey: ['/api/support-resources/categories', selectedCategory, 'resources'],
    enabled: !!selectedCategory,
    retry: false,
  });

  // Search resources
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['/api/support-resources/search', searchQuery, filters],
    enabled: !!searchQuery,
    retry: false,
  });

  const CategoryCard = ({ category }: { category: SupportResourceCategory }) => {
    const IconComponent = iconMap[category.icon as keyof typeof iconMap] || BookOpen;
    const gradientClass = colorSchemes[category.colorScheme as keyof typeof colorSchemes] || colorSchemes.blue;

    return (
      <Card 
        className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
          selectedCategory === category.id ? 'ring-2 ring-blue-500' : ''
        }`}
        onClick={() => setSelectedCategory(category.id)}
      >
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{category.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{category.description}</p>
              <Badge variant="secondary" className="text-xs">
                {category.resourceCount} resources
              </Badge>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  };

  const ResourceCard = ({ resource }: { resource: SupportResource }) => {
    const TypeIcon = resourceTypeIcons[resource.resourceType as keyof typeof resourceTypeIcons] || FileText;

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <TypeIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">{resource.title}</h3>
                {resource.isFeatured && (
                  <Badge className="gradient-primary text-white">Featured</Badge>
                )}
              </div>
              
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">{resource.description}</p>
              
              <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                {resource.readingTime && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{resource.readingTime} min read</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3" />
                  <span>{resource.helpfulCount} helpful</span>
                </div>
                <Badge variant="outline" className="text-xs capitalize">
                  {resource.difficulty}
                </Badge>
              </div>

              {resource.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {resource.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {resource.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{resource.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {resource.authorName && (
                    <span>By {resource.authorName}</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Bookmark className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" className="gradient-primary text-white">
                    Read More
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen gradient-hero">
      <NavigationHeader 
        title="Support Center" 
        subtitle="Emotional support and guidance for your senior living journey"
      />

      <div className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="gradient-card p-6 rounded-lg mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search resources, guides, and articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={filters.careStage === 'exploration' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilters(prev => ({ 
                  ...prev, 
                  careStage: prev.careStage === 'exploration' ? '' : 'exploration' 
                }))}
                className="text-xs"
              >
                Getting Started
              </Button>
              <Button 
                variant={filters.careStage === 'evaluation' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilters(prev => ({ 
                  ...prev, 
                  careStage: prev.careStage === 'evaluation' ? '' : 'evaluation' 
                }))}
                className="text-xs"
              >
                Evaluating Options
              </Button>
              <Button 
                variant={filters.careStage === 'transition' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilters(prev => ({ 
                  ...prev, 
                  careStage: prev.careStage === 'transition' ? '' : 'transition' 
                }))}
                className="text-xs"
              >
                Making the Move
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="categories">Browse by Category</TabsTrigger>
            <TabsTrigger value="featured">Featured Resources</TabsTrigger>
            <TabsTrigger value="personalized">For You</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-6">
            {/* Categories Grid */}
            {!selectedCategory ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoriesLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  categories?.map((category: SupportResourceCategory) => (
                    <CategoryCard key={category.id} category={category} />
                  ))
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center space-x-4 mb-6">
                  <Button 
                    variant="ghost" 
                    onClick={() => setSelectedCategory(null)}
                    className="text-blue-600"
                  >
                    ← Back to Categories
                  </Button>
                  <h2 className="text-2xl font-bold">
                    {categories?.find((c: SupportResourceCategory) => c.id === selectedCategory)?.name}
                  </h2>
                </div>

                <div className="space-y-4">
                  {resourcesLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                          <div className="flex space-x-4">
                            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-gray-200 rounded mb-2"></div>
                              <div className="h-3 bg-gray-200 rounded mb-2"></div>
                              <div className="h-3 bg-gray-200 rounded w-32"></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    categoryResources?.map((resource: SupportResource) => (
                      <ResourceCard key={resource.id} resource={resource} />
                    ))
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="featured" className="space-y-4">
            {featuredResources?.map((resource: SupportResource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </TabsContent>

          <TabsContent value="personalized">
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Personalized Just for You</h3>
              <p className="text-gray-500 mb-6">
                Sign in to get personalized resource recommendations based on your journey
              </p>
              <Link href="/auth/login">
                <Button className="gradient-primary text-white">
                  Sign In for Personalized Resources
                </Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>

        {/* Search Results */}
        {searchQuery && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">
              Search Results for "{searchQuery}"
            </h2>
            {searchLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex space-x-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-32"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : searchResults?.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((resource: SupportResource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No resources found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}