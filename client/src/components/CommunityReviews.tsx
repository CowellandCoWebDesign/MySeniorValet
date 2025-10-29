import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { 
  Star, ExternalLink, Shield, CheckCircle, PlusCircle, Loader2,
  Globe
} from 'lucide-react';
import { SiGoogle, SiYelp, SiFacebook } from 'react-icons/si';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Community } from '@shared/schema';

// Review submission schema
const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(3).max(100),
  reviewText: z.string().min(10).max(2000),
  careType: z.string().optional(),
  recommendToOthers: z.boolean().default(true)
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewDirectory {
  platform: string;
  icon: any;
  rating: number;
  reviewCount: number;
  url: string;
  color: string;
  verified: boolean;
}

interface CommunityReviewsProps {
  community: Community;
  currentUserId?: number;
  comprehensiveData?: any;
}

export function CommunityReviews({ community, currentUserId, comprehensiveData }: CommunityReviewsProps) {
  const { toast } = useToast();
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      title: '',
      reviewText: '',
      recommendToOthers: true
    }
  });

  // Fetch MySeniorValet reviews from database
  const { data: databaseReviews = [], isLoading: isLoadingDbReviews } = useQuery({
    queryKey: ['/api/communities', community.id, 'reviews'],
    queryFn: async () => {
      const response = await fetch(`/api/communities/${community.id}/reviews`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      return response.json();
    }
  });

  // Submit MySeniorValet review
  const submitReview = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      return apiRequest('POST', `/api/communities/${community.id}/reviews`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/communities', community.id, 'reviews'] });
      toast({
        title: 'Review submitted',
        description: 'Thank you for sharing your experience!'
      });
      setIsSubmitDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit review',
        variant: 'destructive'
      });
    }
  });

  // Extract review directories from community data
  const reviewDirectories = useMemo(() => {
    const directories: ReviewDirectory[] = [];

    // Google Reviews
    if ((community as any).googleRating || (community as any).googleReviewCount) {
      const googleUrl = (community as any).googleMapsUrl || 
        `https://www.google.com/search?q=${encodeURIComponent(community.name + ' ' + community.city + ' ' + community.state + ' reviews')}`;
      
      directories.push({
        platform: 'Google',
        icon: SiGoogle,
        rating: (community as any).googleRating || 0,
        reviewCount: (community as any).googleReviewCount || 0,
        url: googleUrl,
        color: 'text-blue-600',
        verified: true
      });
    }

    // Yelp Reviews
    if ((community as any).yelpRating || (community as any).yelpReviewCount || (community as any).yelpReviews) {
      const yelpData = (community as any).yelpReviews;
      const yelpUrl = Array.isArray(yelpData) && yelpData[0]?.url || 
        (community as any).yelpUrl ||
        `https://www.yelp.com/search?find_desc=${encodeURIComponent(community.name)}&find_loc=${encodeURIComponent(community.city + ', ' + community.state)}`;
      
      directories.push({
        platform: 'Yelp',
        icon: SiYelp,
        rating: (community as any).yelpRating || (yelpData?.[0]?.rating) || 0,
        reviewCount: (community as any).yelpReviewCount || (yelpData?.length) || 0,
        url: yelpUrl,
        color: 'text-red-600',
        verified: true
      });
    }

    // Facebook Reviews
    if ((community as any).facebookRating || (community as any).facebookUrl) {
      directories.push({
        platform: 'Facebook',
        icon: SiFacebook,
        rating: (community as any).facebookRating || 0,
        reviewCount: (community as any).facebookReviewCount || 0,
        url: (community as any).facebookUrl || `https://www.facebook.com/search/top?q=${encodeURIComponent(community.name)}`,
        color: 'text-blue-700',
        verified: true
      });
    }

    // Care.com / Caring.com Reviews
    if ((community as any).careComReviews || (community as any).careComRating) {
      const careData = (community as any).careComReviews;
      const careUrl = Array.isArray(careData) && careData[0]?.url || 
        `https://www.caring.com/senior-living/search?q=${encodeURIComponent(community.name + ' ' + community.city)}`;
      
      directories.push({
        platform: 'Caring.com',
        icon: Globe,
        rating: (community as any).careComRating || (careData?.[0]?.rating) || 0,
        reviewCount: (careData?.length) || (community as any).careComReviewCount || 0,
        url: careUrl,
        color: 'text-purple-600',
        verified: true
      });
    }

    // SeniorAdvisor Reviews
    if ((community as any).seniorAdvisorReviews || (community as any).seniorAdvisorRating) {
      const seniorData = (community as any).seniorAdvisorReviews;
      const seniorUrl = Array.isArray(seniorData) && seniorData[0]?.url || 
        `https://www.senioradvisor.com/search?q=${encodeURIComponent(community.name + ' ' + community.city)}`;
      
      directories.push({
        platform: 'SeniorAdvisor',
        icon: Globe,
        rating: (community as any).seniorAdvisorRating || (seniorData?.[0]?.overall_rating) || 0,
        reviewCount: (seniorData?.length) || (community as any).seniorAdvisorReviewCount || 0,
        url: seniorUrl,
        color: 'text-teal-600',
        verified: true
      });
    }

    // A Place for Mom Reviews
    if ((community as any).aplaceformomReviews || (community as any).aplaceformomRating) {
      const apfmData = (community as any).aplaceformomReviews;
      const apfmUrl = Array.isArray(apfmData) && apfmData[0]?.url || 
        `https://www.aplaceformom.com/search?q=${encodeURIComponent(community.name + ' ' + community.city)}`;
      
      directories.push({
        platform: 'A Place for Mom',
        icon: Globe,
        rating: (community as any).aplaceformomRating || (apfmData?.[0]?.rating) || 0,
        reviewCount: (apfmData?.length) || (community as any).aplaceformomReviewCount || 0,
        url: apfmUrl,
        color: 'text-green-600',
        verified: true
      });
    }

    return directories;
  }, [community]);

  // Calculate MySeniorValet average rating
  const msvStats = useMemo(() => {
    if (!databaseReviews.length) return { avgRating: 0, count: 0 };
    
    const total = databaseReviews.reduce((sum: number, review: any) => sum + review.rating, 0);
    return {
      avgRating: total / databaseReviews.length,
      count: databaseReviews.length
    };
  }, [databaseReviews]);

  const renderStars = (rating: number, size: string = 'w-4 h-4') => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating
                ? 'text-yellow-500 fill-current'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Reviews & Ratings
            </span>
            {currentUserId && (
              <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" data-testid="button-write-review">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Write a Review
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Share Your Experience</DialogTitle>
                    <DialogDescription>
                      Help other families by sharing your experience with {community.name}
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => submitReview.mutate(data))} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Overall Rating</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => field.onChange(star)}
                                    className="p-1"
                                    data-testid={`button-rating-${star}`}
                                  >
                                    <Star
                                      className={`w-6 h-6 ${
                                        star <= field.value
                                          ? 'text-yellow-500 fill-current'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Review Title</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Summarize your experience" 
                                {...field} 
                                data-testid="input-review-title"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="reviewText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Review</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Share details about your experience..."
                                className="min-h-[120px]"
                                {...field}
                                data-testid="input-review-text"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsSubmitDialogOpen(false)}
                          data-testid="button-cancel-review"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={submitReview.isPending}
                          data-testid="button-submit-review"
                        >
                          {submitReview.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Submit Review
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We partner with trusted review platforms to help you make informed decisions. 
              Click below to read authentic reviews from verified sources.
            </p>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                <Shield className="w-3 h-3 mr-1" />
                Verified Sources
              </Badge>
              <Badge variant="outline" className="text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                SEO Optimized
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Globe className="w-3 h-3 mr-1" />
                Authoritative Links
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MySeniorValet Reviews Summary */}
      {msvStats.count > 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              MySeniorValet Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {msvStats.avgRating.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Average Rating</div>
              </div>
              <div className="flex-1">
                {renderStars(Math.round(msvStats.avgRating), 'w-5 h-5')}
                <p className="text-sm text-muted-foreground mt-2">
                  Based on {msvStats.count} verified {msvStats.count === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Directory Links */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ExternalLink className="w-5 h-5" />
          Read Reviews on Trusted Platforms
        </h3>
        
        {reviewDirectories.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                No external reviews found yet. Check back soon or be the first to write a MySeniorValet review!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviewDirectories.map((directory) => {
              const Icon = directory.icon;
              return (
                <Card 
                  key={directory.platform}
                  className="hover:shadow-lg transition-shadow duration-200 border-2 hover:border-primary/50"
                  data-testid={`card-review-${directory.platform.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-base">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-5 h-5 ${directory.color}`} />
                        <span>{directory.platform}</span>
                      </div>
                      {directory.verified && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${directory.color}`}>
                          {directory.rating > 0 ? directory.rating.toFixed(1) : 'N/A'}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Rating</div>
                      </div>
                      <div className="flex-1">
                        {directory.rating > 0 && renderStars(Math.round(directory.rating), 'w-4 h-4')}
                        <p className="text-sm text-muted-foreground mt-2">
                          {directory.reviewCount > 0 
                            ? `${directory.reviewCount} ${directory.reviewCount === 1 ? 'review' : 'reviews'}`
                            : 'Reviews available'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <Button 
                      asChild 
                      className="w-full"
                      variant="default"
                      data-testid={`button-read-reviews-${directory.platform.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <a 
                        href={directory.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Read Reviews on {directory.platform}
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* SEO Benefits Note */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="space-y-2 text-sm">
              <p className="font-medium">Why We Show Review Links</p>
              <p className="text-muted-foreground">
                We provide direct links to authoritative review platforms instead of displaying copied content. 
                This approach ensures you're reading the most up-to-date reviews, reduces liability concerns, 
                and helps improve our SEO with trusted outbound links to established platforms.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
