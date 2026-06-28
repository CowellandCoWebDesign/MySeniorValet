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
  Globe, FileSearch, Phone, AlertTriangle
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

    // Google Reviews - Check multiple sources
    const hasGoogleData = (community as any).googleRating || 
                          (community as any).googleReviewCount || 
                          (community as any).googlePlaceId ||
                          (community as any).googleMapsUrl ||
                          (community as any).googlePlaceReviews;
    
    if (hasGoogleData) {
      // Use direct Google Maps URL if available, otherwise construct from Place ID
      let googleUrl = (community as any).googleMapsUrl;
      
      if (!googleUrl && (community as any).googlePlaceId) {
        googleUrl = `https://www.google.com/maps/place/?q=place_id:${(community as any).googlePlaceId}`;
      }
      
      if (!googleUrl) {
        // Fallback to search if no direct link
        googleUrl = `https://www.google.com/maps/search/${encodeURIComponent(community.name + ' ' + community.city + ' ' + community.state)}`;
      }
      
      directories.push({
        platform: 'Google',
        icon: SiGoogle,
        rating: parseFloat((community as any).googleRating) || 0,
        reviewCount: (community as any).googleReviewCount || 0,
        url: googleUrl,
        color: 'text-blue-600',
        verified: true
      });
    }

    // Yelp Reviews - Use direct Yelp URL
    const hasYelpData = (community as any).yelpRating || 
                        (community as any).yelpReviewCount || 
                        (community as any).yelpUrl ||
                        (community as any).yelpId;
    
    if (hasYelpData) {
      let yelpUrl = (community as any).yelpUrl;
      
      if (!yelpUrl && (community as any).yelpId) {
        yelpUrl = `https://www.yelp.com/biz/${(community as any).yelpId}`;
      }
      
      if (!yelpUrl) {
        // Fallback to search
        yelpUrl = `https://www.yelp.com/search?find_desc=${encodeURIComponent(community.name)}&find_loc=${encodeURIComponent(community.city + ', ' + community.state)}`;
      }
      
      directories.push({
        platform: 'Yelp',
        icon: SiYelp,
        rating: (community as any).yelpRating || 0,
        reviewCount: (community as any).yelpReviewCount || 0,
        url: yelpUrl,
        color: 'text-red-600',
        verified: true
      });
    }

    // Facebook Reviews - Use direct Facebook URL
    if ((community as any).facebookUrl) {
      directories.push({
        platform: 'Facebook',
        icon: SiFacebook,
        rating: (community as any).facebookRating || 0,
        reviewCount: (community as any).facebookReviewCount || 0,
        url: (community as any).facebookUrl,
        color: 'text-blue-700',
        verified: true
      });
    }

    // Care.com / Caring.com Reviews - Extract direct URL from review data
    const careData = (community as any).careComReviews;
    const hasCareData = (Array.isArray(careData) && careData.length > 0) || (community as any).careComRating;
    
    if (hasCareData) {
      const careUrl = (Array.isArray(careData) && careData[0]?.url) || 
        `https://www.caring.com/local/${community.state?.toLowerCase()}/${community.city?.toLowerCase().replace(/\s+/g, '-')}`;
      
      directories.push({
        platform: 'Caring.com',
        icon: Globe,
        rating: (community as any).careComRating || (Array.isArray(careData) && careData[0]?.rating) || 0,
        reviewCount: Array.isArray(careData) ? careData.length : 0,
        url: careUrl,
        color: 'text-purple-600',
        verified: true
      });
    }

    // SeniorAdvisor Reviews - Extract direct URL from review data
    const seniorData = (community as any).seniorAdvisorReviews;
    const hasSeniorData = (Array.isArray(seniorData) && seniorData.length > 0) || (community as any).seniorAdvisorRating;
    
    if (hasSeniorData) {
      const seniorUrl = (Array.isArray(seniorData) && seniorData[0]?.url) || 
        `https://www.senioradvisor.com/${community.state?.toLowerCase()}/${community.city?.toLowerCase().replace(/\s+/g, '-')}`;
      
      directories.push({
        platform: 'SeniorAdvisor',
        icon: Globe,
        rating: (community as any).seniorAdvisorRating || (Array.isArray(seniorData) && seniorData[0]?.overall_rating) || 0,
        reviewCount: Array.isArray(seniorData) ? seniorData.length : 0,
        url: seniorUrl,
        color: 'text-teal-600',
        verified: true
      });
    }

    // A Place for Mom Reviews - Extract direct URL from review data
    const apfmData = (community as any).aplaceformomReviews;
    const hasApfmData = (Array.isArray(apfmData) && apfmData.length > 0) || (community as any).aplaceformomRating;
    
    if (hasApfmData) {
      const apfmUrl = (Array.isArray(apfmData) && apfmData[0]?.url) || 
        `https://www.aplaceformom.com/senior-living/${community.state?.toLowerCase()}/${community.city?.toLowerCase().replace(/\s+/g, '-')}`;
      
      directories.push({
        platform: 'A Place for Mom',
        icon: Globe,
        rating: (community as any).aplaceformomRating || (Array.isArray(apfmData) && apfmData[0]?.rating) || 0,
        reviewCount: Array.isArray(apfmData) ? apfmData.length : 0,
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
      {msvStats.count > 0 ? (
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
      ) : (
        <Card className="border-dashed border-2 border-blue-200 dark:border-blue-800">
          <CardContent className="py-8 text-center">
            <div className="flex justify-center mb-3">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} className="w-6 h-6 text-gray-300 dark:text-gray-600" />
              ))}
            </div>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Not yet rated on MySeniorValet
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Help families make informed decisions — be the first to share your experience.
            </p>
            {currentUserId ? (
              <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-be-first-review">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Write the First Review
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
                                  <button key={star} type="button" onClick={() => field.onChange(star)} className="p-1">
                                    <Star className={`w-6 h-6 ${star <= field.value ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                                  </button>
                                ))}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Review Title</FormLabel>
                          <FormControl><Input placeholder="Summarize your experience" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="reviewText" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Review</FormLabel>
                          <FormControl><Textarea placeholder="Share details about your experience..." className="min-h-[120px]" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <Button type="submit" className="w-full" disabled={submitReview.isPending}>
                        {submitReview.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting…</> : 'Submit Review'}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            ) : (
              <Button variant="outline" asChild>
                <a href="/auth">Sign in to Write a Review</a>
              </Button>
            )}
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

      {/* Inspection & Violations Research Guide */}
      <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSearch className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <span>How to Research Inspection Reports & Violations</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Inspection reports and violation records are public information that can help you make informed decisions. 
              Here's how to access official government records:
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="font-medium text-sm">State Licensing Agency</p>
                  <p className="text-xs text-muted-foreground">
                    Contact your state's Department of Health or Social Services to request inspection reports. 
                    Most states maintain online databases with facility inspection histories.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border">
                <Globe className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="font-medium text-sm">Medicare.gov (for Nursing Homes)</p>
                  <p className="text-xs text-muted-foreground">
                    Visit Medicare.gov's Nursing Home Compare tool to view health and fire safety inspection reports, 
                    deficiency citations, and quality ratings.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border">
                <Phone className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="font-medium text-sm">Long-Term Care Ombudsman</p>
                  <p className="text-xs text-muted-foreground">
                    Your state's ombudsman can help you access facility records and answer questions about past violations. 
                    This is a free advocacy service for residents and families.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="font-medium text-sm">What to Look For</p>
                  <p className="text-xs text-muted-foreground">
                    Review patterns over time, not just isolated incidents. Look for repeat violations, 
                    how quickly issues were corrected, and the facility's overall compliance record.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground italic">
              Remember: All senior living communities are subject to inspections. What matters most is how facilities 
              respond to and correct any issues found. Don't hesitate to ask communities directly about their inspection history during tours.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Trusted Reviews Note */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-2 text-sm">
              <p className="font-medium">Verified Review Sources</p>
              <p className="text-muted-foreground">
                We connect you directly to trusted review platforms so you can read authentic, up-to-date feedback from families 
                just like yours. Each platform verifies reviewers differently, giving you multiple perspectives to make the best decision.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
