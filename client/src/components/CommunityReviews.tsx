import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Star, MessageSquare, ThumbsUp, Shield, CheckCircle, AlertCircle, 
  TrendingUp, Calendar, Filter, PlusCircle, Info, ExternalLink,
  Globe, MapPin, Users, Award, ChevronDown, ChevronUp, Loader2,
  RefreshCw, Sparkles, Link2, FileSearch, AlertTriangle, ClipboardCheck, Phone
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formatDistanceToNow } from 'date-fns';
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

interface Review {
  id: number;
  communityId: number;
  userId: number;
  rating: number;
  title: string;
  content: string;
  helpful: number;
  verified: boolean;
  createdAt: string;
  source?: string;
  userName?: string;
}

interface CommunityReviewsProps {
  community: Community;
  currentUserId?: number;
  comprehensiveData?: any;
}

export function CommunityReviews({ community, currentUserId, comprehensiveData }: CommunityReviewsProps) {
  const { toast } = useToast();
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set());
  const [lastPerplexityUpdate, setLastPerplexityUpdate] = useState<string | null>(null);
  const [perplexityCitations, setPerplexityCitations] = useState<string[]>([]);
  const [perspectiveAnalysis, setPerspectiveAnalysis] = useState<string>('');
  const [comparativeInsights, setComparativeInsights] = useState<string>('');
  const [hasInitiallyFetched, setHasInitiallyFetched] = useState(false);
  const [inspectionData, setInspectionData] = useState<any>(null);
  const [inspectionLoading, setInspectionLoading] = useState(false);
  const [inspectionCitations, setInspectionCitations] = useState<string[]>([]);

  // Fetch reviews from database
  const { data: databaseReviews = [], isLoading: isLoadingDbReviews } = useQuery({
    queryKey: ['/api/communities', community.id, 'reviews'],
    queryFn: async () => {
      const response = await fetch(`/api/communities/${community.id}/reviews`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      return response.json();
    }
  });

  // Mutation to fetch external reviews from Perplexity
  const fetchExternalReviewsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        'POST',
        `/api/communities/${community.id}/reviews/fetch-external`
      );
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Reviews Updated",
        description: "Successfully fetched latest reviews from external sources",
        duration: 3000
      });
      
      // Update local state with Perplexity data
      if (data.data) {
        setLastPerplexityUpdate(data.data.lastUpdated);
        setPerplexityCitations(data.data.sources || []);
        setPerspectiveAnalysis(data.data.perspectiveAnalysis || '');
        setComparativeInsights(data.data.comparativeInsights || '');
      }
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/communities', community.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/communities', community.id, 'reviews'] });
    },
    onError: (error: any) => {
      console.error('Error fetching external reviews:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Could not fetch external reviews. Using cached data.",
        variant: "destructive",
        duration: 4000
      });
    }
  });

  // Mutation to fetch inspection data from Perplexity
  const fetchInspectionsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        'POST',
        `/api/communities/${community.id}/inspections/fetch`
      );
      return response;
    },
    onSuccess: (data) => {
      setInspectionLoading(false);
      if (data.inspectionData) {
        setInspectionData(data.inspectionData);
        setInspectionCitations(data.citations || []);
        toast({
          title: "Inspection Data Retrieved",
          description: "Successfully fetched inspection and violation information",
          duration: 3000
        });
      }
    },
    onError: (error: any) => {
      setInspectionLoading(false);
      console.error('Error fetching inspection data:', error);
      toast({
        title: "Failed to Fetch Inspections",
        description: error.message || "Could not retrieve inspection data at this time.",
        variant: "destructive",
        duration: 4000
      });
    }
  });

  // Use comprehensive data if available instead of auto-fetching
  useEffect(() => {
    if (comprehensiveData?.reviews && !hasInitiallyFetched) {
      setHasInitiallyFetched(true);
      console.log('📦 Using cached comprehensive review data');
      
      // Set review data from comprehensive cache
      if (comprehensiveData.reviews.recentFeedback) {
        setPerspectiveAnalysis(comprehensiveData.reviews.recentFeedback);
      }
      if (comprehensiveData.sources) {
        setPerplexityCitations(comprehensiveData.sources);
      }
      setLastPerplexityUpdate(new Date(comprehensiveData.timestamp).toLocaleString());
    } else if (!hasInitiallyFetched && !comprehensiveData && community?.id) {
      // Only auto-fetch if no comprehensive data available
      setHasInitiallyFetched(true);
      console.log('🤖 Fetching fresh review data...');
      fetchExternalReviewsMutation.mutate();
    }
  }, [community?.id, hasInitiallyFetched, comprehensiveData]);

  // Extract external reviews from community data
  const externalReviews = useMemo(() => {
    const reviews: any[] = [];
    
    // Process Yelp reviews (can include Google reviews)
    if ((community as any).yelpReviews) {
      // Handle both array and single object formats
      const yelpData = Array.isArray((community as any).yelpReviews) 
        ? (community as any).yelpReviews 
        : [(community as any).yelpReviews];
      
      yelpData.forEach((review: any, index: number) => {
        // Skip empty or invalid reviews
        if (!review || (!review.text && !review.excerpt && !review.content)) return;
        
        reviews.push({
          id: `yelp-${index}`,
          source: review.source || 'Yelp',
          rating: review.rating || 4,
          title: review.title || (review.source === 'Google' ? 'Google Review' : review.source === 'Facebook' ? 'Facebook Review' : 'Yelp Review'),
          content: review.text || review.excerpt || review.content || '',
          userName: review.user?.name || review.author || (review.source === 'Google' ? 'Google User' : review.source === 'Facebook' ? 'Facebook User' : 'Yelp User'),
          createdAt: review.time_created || review.date || new Date().toISOString(),
          verified: true,
          helpful: 0,
          url: review.url,
          isSummary: review.isSummary,
          totalReviews: review.totalReviews
        });
      });
    }

    // Process Care.com reviews
    if ((community as any).careComReviews) {
      const carecomData = Array.isArray((community as any).careComReviews)
        ? (community as any).careComReviews
        : [(community as any).careComReviews];
      
      carecomData.forEach((review: any, index: number) => {
        if (!review || (!review.text && !review.review && !review.content)) return;
        
        reviews.push({
          id: `carecom-${index}`,
          source: review.source || 'Care.com',
          rating: review.rating || 4,
          title: review.title || 'Care.com Review',
          content: review.text || review.review || review.content || '',
          userName: review.reviewer || review.author || 'Care.com User',
          createdAt: review.date || new Date().toISOString(),
          verified: true,
          helpful: 0,
          url: review.url,
          isSummary: review.isSummary,
          totalReviews: review.totalReviews
        });
      });
    }

    // Process SeniorAdvisor reviews (can include Assisted Living Center reviews)
    if ((community as any).seniorAdvisorReviews) {
      const seniorAdvisorData = Array.isArray((community as any).seniorAdvisorReviews)
        ? (community as any).seniorAdvisorReviews
        : [(community as any).seniorAdvisorReviews];
      
      seniorAdvisorData.forEach((review: any, index: number) => {
        if (!review || (!review.text && !review.review && !review.content)) return;
        
        reviews.push({
          id: `senioradvisor-${index}`,
          source: review.source || 'SeniorAdvisor',
          rating: review.overall_rating || review.rating || 4,
          title: review.title || (review.source === 'Assisted Living Center' ? 'Assisted Living Center Review' : 'SeniorAdvisor Review'),
          content: review.text || review.review || review.content || '',
          userName: review.reviewer_name || review.author || (review.source === 'Assisted Living Center' ? 'Verified Reviewer' : 'SeniorAdvisor User'),
          createdAt: review.review_date || review.date || new Date().toISOString(),
          verified: true,
          helpful: 0,
          url: review.url,
          isSummary: review.isSummary,
          totalReviews: review.totalReviews
        });
      });
    }

    // Process A Place for Mom reviews
    if ((community as any).aplaceformomReviews) {
      const apfmData = Array.isArray((community as any).aplaceformomReviews)
        ? (community as any).aplaceformomReviews
        : [(community as any).aplaceformomReviews];
      
      apfmData.forEach((review: any, index: number) => {
        if (!review || (!review.text && !review.content && !review.review)) return;
        
        reviews.push({
          id: `apfm-${index}`,
          source: review.source || 'A Place for Mom',
          rating: review.rating || 4,
          title: review.title || 'A Place for Mom Review',
          content: review.text || review.content || review.review || '',
          userName: review.author || 'APFM User',
          createdAt: review.date || new Date().toISOString(),
          verified: true,
          helpful: 0,
          url: review.url,
          isSummary: review.isSummary,
          totalReviews: review.totalReviews
        });
      });
    }

    return reviews;
  }, [community]);

  // Combine all reviews
  const allReviews = useMemo(() => {
    const dbReviews = databaseReviews.map((r: Review) => ({
      ...r,
      source: 'MySeniorValet'
    }));
    return [...dbReviews, ...externalReviews];
  }, [databaseReviews, externalReviews]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const stats = {
      totalReviews: allReviews.length,
      averageRating: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>,
      sources: {
        MySeniorValet: 0,
        Google: { rating: community.googleRating || 0, count: parseInt(community.googleReviewCount?.toString() || '0') },
        Yelp: { rating: community.yelpRating || 0, count: parseInt(community.yelpReviewCount?.toString() || '0') },
        'Care.com': 0,
        'SeniorAdvisor': 0,
        'A Place for Mom': 0,
        'Assisted Living Center': 0,
        'Facebook': 0
      }
    };

    if (allReviews.length > 0) {
      let totalRating = 0;
      let actualReviewCount = 0;
      
      allReviews.forEach((review: any) => {
        // If it's a summary entry, use totalReviews count
        const reviewCount = review.isSummary && review.totalReviews ? review.totalReviews : 1;
        actualReviewCount += reviewCount;
        totalRating += review.rating * reviewCount;
        
        const roundedRating = Math.round(review.rating);
        if (roundedRating >= 1 && roundedRating <= 5) {
          stats.distribution[roundedRating] += reviewCount;
        }
        
        // Count by source (including summary reviews)
        if (review.source === 'MySeniorValet') {
          stats.sources.MySeniorValet += reviewCount;
        } else if (review.source === 'Google') {
          if (!stats.sources.Google.count && review.totalReviews) {
            stats.sources.Google.count = review.totalReviews;
            stats.sources.Google.rating = review.rating;
          }
        } else if (review.source === 'Yelp') {
          if (!stats.sources.Yelp.count && review.totalReviews) {
            stats.sources.Yelp.count = review.totalReviews;
            stats.sources.Yelp.rating = review.rating;
          }
        } else if (review.source === 'Care.com') {
          stats.sources['Care.com'] += reviewCount;
        } else if (review.source === 'SeniorAdvisor') {
          stats.sources['SeniorAdvisor'] += reviewCount;
        } else if (review.source === 'A Place for Mom') {
          stats.sources['A Place for Mom'] += reviewCount;
        } else if (review.source === 'Assisted Living Center') {
          stats.sources['Assisted Living Center'] += reviewCount;
        } else if (review.source === 'Facebook') {
          stats.sources['Facebook'] += reviewCount;
        }
      });
      
      stats.averageRating = actualReviewCount > 0 ? totalRating / actualReviewCount : 0;
      stats.totalReviews = actualReviewCount;
    }

    // Include Google and Yelp aggregated ratings if not already included
    const googleCount = stats.sources.Google.count;
    const yelpCount = stats.sources.Yelp.count;
    const totalWithExternal = stats.totalReviews + 
                              (googleCount > 0 && !allReviews.some((r: any) => r.source === 'Google' && r.totalReviews) ? googleCount : 0) +
                              (yelpCount > 0 && !allReviews.some((r: any) => r.source === 'Yelp' && r.totalReviews) ? yelpCount : 0);
    
    if (totalWithExternal > stats.totalReviews) {
      const googleRatingNum = parseFloat(stats.sources.Google.rating as any) || 0;
      const yelpRatingNum = stats.sources.Yelp.rating || 0;
      const additionalGoogle = googleCount > 0 && !allReviews.some((r: any) => r.source === 'Google' && r.totalReviews) ? googleCount : 0;
      const additionalYelp = yelpCount > 0 && !allReviews.some((r: any) => r.source === 'Yelp' && r.totalReviews) ? yelpCount : 0;
      
      const weightedTotal = (stats.averageRating * stats.totalReviews) + 
                           (googleRatingNum * additionalGoogle) + 
                           (yelpRatingNum * additionalYelp);
      stats.averageRating = weightedTotal / totalWithExternal;
      stats.totalReviews = totalWithExternal;
    }

    return stats;
  }, [allReviews, community]);

  // Filter and sort reviews
  const filteredAndSortedReviews = useMemo(() => {
    let filtered = [...allReviews];
    
    // Filter by rating
    if (selectedRating) {
      filtered = filtered.filter(r => Math.round(r.rating) === selectedRating);
    }
    
    // Filter by source
    if (selectedSource !== 'all') {
      filtered = filtered.filter(r => r.source === selectedSource);
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        case 'helpful':
          return b.helpful - a.helpful;
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [allReviews, selectedRating, selectedSource, sortBy]);

  // Review submission form
  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      title: '',
      reviewText: '',
      recommendToOthers: true
    }
  });

  // Submit review mutation
  const submitReview = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      return apiRequest('POST', '/api/reviews', {
        communityId: community.id,
        rating: data.rating,
        title: data.title,
        reviewText: data.reviewText,
        relationshipType: 'Family Member'
      });
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

  // Mark review as helpful
  const markHelpful = useMutation({
    mutationFn: async (reviewId: number) => {
      return apiRequest('POST', `/api/reviews/${reviewId}/helpful`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/communities', community.id, 'reviews'] });
    }
  });

  const toggleReviewExpansion = (reviewId: number | string) => {
    const id = typeof reviewId === 'string' ? reviewId : reviewId;
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id as number)) {
        newSet.delete(id as number);
      } else {
        newSet.add(id as number);
      }
      return newSet;
    });
  };

  const renderStars = (rating: number, size: string = 'w-4 h-4') => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating
                ? 'text-yellow-500 fill-current'
                : 'text-gray-300'
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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchExternalReviewsMutation.mutate()}
                disabled={fetchExternalReviewsMutation.isPending}
                data-testid="button-refresh-reviews"
              >
                {fetchExternalReviewsMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Reviews
                  </>
                )}
              </Button>
              {currentUserId && (
                <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
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
                              <Input placeholder="Summarize your experience" {...field} />
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
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsSubmitDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={submitReview.isPending}>
                          {submitReview.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Submit Review
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
                </Dialog>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Perplexity AI Comparative Analysis - Prominently displayed at top */}
          {(lastPerplexityUpdate || perplexityCitations.length > 0 || perspectiveAnalysis || comparativeInsights || fetchExternalReviewsMutation.isPending) && (
            <div className="border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 dark:border-blue-600 rounded-lg p-4 mb-6 overflow-visible max-h-none">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-pulse" />
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                    Perplexity AI - Comparison in Perspective
                  </h3>
                  {lastPerplexityUpdate && (
                    <span className="text-xs text-blue-700 dark:text-blue-400">
                      • Updated {formatDistanceToNow(new Date(lastPerplexityUpdate))} ago
                    </span>
                  )}
                </div>
              </div>
              
              {/* Loading State */}
              {fetchExternalReviewsMutation.isPending && !perspectiveAnalysis && !comparativeInsights && (
                <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-6 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-blue-600 dark:text-blue-400" />
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    🔍 Perplexity is analyzing reviews from multiple sources...
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    Comparing perspectives from Google, Yelp, Care.com, and other platforms
                  </p>
                </div>
              )}
              
              {/* Comparative Analysis Content */}
              {(perspectiveAnalysis || comparativeInsights) && (
                <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-4 overflow-visible">
                  <h4 className="text-sm font-bold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
                    📊 Comparative Analysis Results:
                  </h4>
                  <div className="max-w-none overflow-visible">
                    <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap break-words overflow-visible">
                      {/* Display the perspective analysis OR comparative insights (but not both to avoid duplication) */}
                      {perspectiveAnalysis || comparativeInsights}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Sources */}
              {perplexityCitations.length > 0 && (
                <div className="mt-4 pt-3 border-t border-blue-200 dark:border-blue-700">
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">Analysis Sources:</p>
                  <div className="flex flex-wrap gap-2">
                    {perplexityCitations.slice(0, 8).map((citation: string, index: number) => {
                      let sourceName = `Source ${index + 1}`;
                      try {
                        const url = new URL(citation);
                        const hostname = url.hostname;
                        sourceName = hostname
                          .replace(/^www\./, '')
                          .replace(/\.(com|org|net|gov|edu).*$/, '')
                          .split('.')
                          .map(part => {
                            if (part === 'aplaceformom') return 'A Place for Mom';
                            if (part === 'senioradvisor') return 'SeniorAdvisor';
                            if (part === 'caring') return 'Caring.com';
                            if (part === 'google') return 'Google Reviews';
                            if (part === 'yelp') return 'Yelp';
                            return part.charAt(0).toUpperCase() + part.slice(1);
                          })
                          .join(' ');
                      } catch (e) {}
                      
                      return (
                        <a
                          key={index}
                          href={citation}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-800 rounded text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Link2 className="h-3 w-3" />
                          {sourceName}
                        </a>
                      );
                    })}
                    {perplexityCitations.length > 8 && (
                      <span className="inline-flex items-center px-2 py-1 text-xs text-blue-600 dark:text-blue-400">
                        +{perplexityCitations.length - 8} more sources
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {/* No Data Yet Message */}
              {!fetchExternalReviewsMutation.isPending && !perspectiveAnalysis && !comparativeInsights && (
                <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-6 text-center">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Comparative analysis from Perplexity AI shows reviews from multiple platforms.
                  </p>
                </div>
              )}
              
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-3 italic">
                ℹ️ Perplexity analyzes and compares reviews across multiple platforms to provide a balanced perspective.
              </p>
            </div>
          )}
          
          {/* Review Sources Summary */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className="text-xs">
              MySeniorValet ({statistics.sources.MySeniorValet} reviews)
            </Badge>
            {statistics.sources.Google.count > 0 && (
              <Badge variant="outline" className="text-xs">
                Google ({statistics.sources.Google.count} reviews)
              </Badge>
            )}
            {statistics.sources.Yelp.count > 0 && (
              <Badge variant="outline" className="text-xs">
                Yelp ({statistics.sources.Yelp.count} reviews)
              </Badge>
            )}
            {statistics.sources['Care.com'] > 0 && (
              <Badge variant="outline" className="text-xs">
                Care.com ({statistics.sources['Care.com']} reviews)
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs ml-auto">
              {statistics.averageRating.toFixed(1)} ⭐ Average ({statistics.totalReviews + statistics.sources.Google.count + statistics.sources.Yelp.count} total)
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Sorting */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <Select value={selectedSource} onValueChange={setSelectedSource}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="MySeniorValet">MySeniorValet</SelectItem>
                <SelectItem value="Yelp">Yelp</SelectItem>
                <SelectItem value="Care.com">Care.com</SelectItem>
                <SelectItem value="SeniorAdvisor">SeniorAdvisor</SelectItem>
                <SelectItem value="A Place for Mom">A Place for Mom</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="highest">Highest Rating</SelectItem>
                <SelectItem value="lowest">Lowest Rating</SelectItem>
                <SelectItem value="helpful">Most Helpful</SelectItem>
              </SelectContent>
            </Select>
            
            {selectedRating && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRating(null)}
              >
                Clear {selectedRating}-star filter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Inspection & Violations Section */}
      <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSearch className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <span>How to Research Inspection Reports & Violations</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Always show guidance on how to research inspections */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <ClipboardCheck className="h-4 w-4" />
                Research Health Inspections by State
              </h4>
              
              {/* Determine state from props */}
              {(() => {
                const state = community?.state || '';
                const stateGuides: Record<string, { name: string; url: string; phone?: string }> = {
                  'OR': { 
                    name: 'Oregon DHS Long Term Care', 
                    url: 'https://ltclicensing.oregon.gov/',
                    phone: '(503) 945-5450'
                  },
                  'CA': { 
                    name: 'California CDSS Care Facility Search', 
                    url: 'https://www.ccld.dss.ca.gov/carefacilitysearch/',
                    phone: '(916) 651-8848'
                  },
                  'WA': { 
                    name: 'Washington State DSHS', 
                    url: 'https://www.dshs.wa.gov/altsa/residential-care-services',
                    phone: '(360) 725-2300'
                  },
                  'TX': { 
                    name: 'Texas Health & Human Services', 
                    url: 'https://apps.hhs.texas.gov/providers/directories/longterm.aspx',
                    phone: '(800) 458-9858'
                  },
                  'FL': { 
                    name: 'Florida AHCA', 
                    url: 'https://www.floridahealthfinder.gov/',
                    phone: '(888) 419-3456'
                  },
                  'NY': { 
                    name: 'New York State DOH', 
                    url: 'https://profiles.health.ny.gov/nursing_home/',
                    phone: '(800) 342-3736'
                  },
                  'IL': {
                    name: 'Illinois Department of Public Health',
                    url: 'https://www.dph.illinois.gov/topics-services/health-care-regulation/nursing-homes',
                    phone: '(800) 252-4343'
                  },
                  'PA': {
                    name: 'Pennsylvania Department of Health',
                    url: 'https://sais.health.pa.gov/commonpoc/nhlocatorie.aspx',
                    phone: '(800) 254-5164'
                  }
                };
                
                const stateInfo = stateGuides[state];
                
                return (
                  <div className="space-y-3">
                    {stateInfo ? (
                      <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
                        <p className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                          For {state} Communities:
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          {stateInfo.name}
                        </p>
                        <div className="flex flex-col gap-2">
                          <a 
                            href={stateInfo.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline text-sm"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Visit Official Inspection Website
                          </a>
                          {stateInfo.phone && (
                            <a 
                              href={`tel:${stateInfo.phone}`}
                              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline text-sm"
                            >
                              <Phone className="h-3 w-3 mr-1" />
                              {stateInfo.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    ) : null}
                    
                    {/* General guidance for all states */}
                    <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                      <p className="font-medium">How to Research Health Inspections:</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Visit your state's Department of Health website</li>
                        <li>Search for "Long Term Care" or "Nursing Home Inspections"</li>
                        <li>Enter the facility name or license number</li>
                        <li>Review recent inspection reports and any citations</li>
                        <li>Check for patterns in violations or improvements</li>
                      </ol>
                    </div>
                    
                    {/* Federal resources */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mt-3">
                      <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Federal Resources:
                      </p>
                      <div className="space-y-2">
                        <a 
                          href="https://www.medicare.gov/care-compare/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline text-sm"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Medicare.gov Care Compare
                        </a>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Compare nursing homes nationwide with Medicare's official ratings
                        </p>
                      </div>
                    </div>
                    
                    {/* For non-US countries */}
                    {!state && community?.country && community.country !== 'US' && (
                      <div className="bg-indigo-50 dark:bg-indigo-950/30 p-3 rounded-lg">
                        <p className="font-semibold text-indigo-800 dark:text-indigo-300 mb-2">
                          International Resources:
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Contact the local health department or senior care regulatory agency in {community.country || 'your country'} for inspection information.
                        </p>
                      </div>
                    )}
                    
                    {/* Disclaimer */}
                    <div className="bg-yellow-50 dark:bg-yellow-950/30 p-3 rounded-lg mt-3">
                      <p className="text-xs text-yellow-800 dark:text-yellow-300">
                        <strong>Note:</strong> Inspection reports are public records. Review multiple years of data to understand trends. 
                        Minor violations are common; look for patterns and how quickly issues are resolved.
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
          
          {/* Keep the existing inspection data display if it exists, but don't try to fetch it */}
          {inspectionData && (
            <div className="space-y-4">
              {/* Display inspection summary */}
              {inspectionData.summary && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <ClipboardCheck className="h-4 w-4" />
                    Inspection Summary
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-200">
                    {inspectionData.summary.replace(/\*\*/g, '').replace(/\*/g, '').trim()}
                  </p>
                </div>
              )}

              {/* Display recent violations if any */}
              {inspectionData.violations && inspectionData.violations.length > 0 && (
                <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-700 dark:text-red-400">
                    <AlertTriangle className="h-4 w-4" />
                    Recent Violations
                  </h4>
                  <ul className="space-y-2">
                    {inspectionData.violations.map((violation: any, index: number) => (
                      <li key={index} className="text-sm text-gray-700 dark:text-gray-200">
                        <div className="flex items-start gap-2">
                          <span className="text-red-500 mt-1">•</span>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{violation.type || 'Violation'}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300">
                              {violation.date} - {violation.description.replace(/\*\*/g, '').replace(/\*/g, '').trim()}
                            </p>
                            {violation.status && (
                              <Badge variant={violation.status === 'Resolved' ? 'default' : 'destructive'} className="mt-1">
                                {violation.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Display inspection history */}
              {inspectionData.inspections && inspectionData.inspections.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    <Shield className="h-4 w-4" />
                    Inspection History
                  </h4>
                  <div className="space-y-2">
                    {inspectionData.inspections.map((inspection: any, index: number) => (
                      <div key={index} className="text-sm text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2 last:border-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{inspection.type || 'State Inspection'}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300">
                              {inspection.date}
                            </p>
                          </div>
                          <Badge variant={inspection.result === 'Passed' ? 'default' : 'secondary'}>
                            {inspection.result || 'Completed'}
                          </Badge>
                        </div>
                        {inspection.findings && (
                          <p className="text-xs mt-1 text-gray-600 dark:text-gray-300">
                            {inspection.findings.replace(/\*\*/g, '').replace(/\*/g, '').trim()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Citations for inspection data */}
              {inspectionCitations.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    <Sparkles className="h-3 w-3 inline mr-1" />
                    Inspection data powered by Grok AI • Sources:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {inspectionCitations.map((citation, index) => {
                      let sourceName = `Source ${index + 1}`;
                      try {
                        const url = new URL(citation);
                        const hostname = url.hostname;
                        sourceName = hostname
                          .replace(/^www\./, '')
                          .replace(/\.(com|org|net|gov|edu).*$/, '')
                          .split('.')
                          .map(part => {
                            if (part === 'medicare') return 'Medicare.gov';
                            if (part === 'cms') return 'CMS.gov';
                            if (part === 'health') return 'Health Department';
                            if (part === 'state') return 'State Records';
                            return part.charAt(0).toUpperCase() + part.slice(1);
                          })
                          .join(' ');
                      } catch (e) {
                        // If URL parsing fails, keep the default
                      }
                      
                      return (
                        <a
                          key={index}
                          href={citation}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 underline"
                        >
                          <Link2 className="h-3 w-3" />
                          {sourceName}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Inspection data is sourced from public records and third-party platforms. 
                  Always verify current compliance status directly with the community and relevant regulatory agencies.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>


      {/* Reviews List */}
      <div className="space-y-4">
        {isLoadingDbReviews ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">Loading reviews...</p>
            </CardContent>
          </Card>
        ) : filteredAndSortedReviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">
                {selectedRating || selectedSource !== 'all' 
                  ? 'No reviews match your filters'
                  : 'No reviews yet. Be the first to share your experience!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAndSortedReviews.map((review: any) => {
            const isExpanded = expandedReviews.has(review.id as number);
            const shouldTruncate = review.content.length > 300;
            const displayContent = shouldTruncate && !isExpanded 
              ? review.content.substring(0, 300) + '...' 
              : review.content;
            
            return (
              <Card key={review.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {renderStars(review.rating)}
                        <span className="text-sm font-semibold">
                          {review.rating.toFixed(1)}
                        </span>
                        {review.verified && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {review.title}
                      </h4>
                    </div>
                    <div className="text-right">
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline" className="text-xs">
                          {review.source}
                        </Badge>
                        {review.url && (
                          <a
                            href={review.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 underline"
                            data-testid={`link-source-${review.id}`}
                          >
                            <ExternalLink className="w-3 h-3" />
                            View source
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">
                    {displayContent}
                  </p>
                  
                  {shouldTruncate && (
                    <button
                      onClick={() => toggleReviewExpansion(review.id)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                    >
                      {isExpanded ? (
                        <>Show less <ChevronUp className="w-4 h-4" /></>
                      ) : (
                        <>Read more <ChevronDown className="w-4 h-4" /></>
                      )}
                    </button>
                  )}
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center gap-4">
                      {review.userName && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {review.userName}
                        </span>
                      )}
                      {typeof review.id === 'number' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markHelpful.mutate(review.id)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          Helpful ({review.helpful})
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {review.url && (
                        <a
                          href={review.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 font-medium"
                          data-testid={`link-verify-${review.id}`}
                        >
                          <ExternalLink className="w-3 h-3" />
                          Verify on {review.source}
                        </a>
                      )}
                      {/* Citation badge for AI-sourced reviews */}
                      {review.platform && review.platform !== 'MySeniorValet' && (
                        <Badge variant="secondary" className="text-xs">
                          <Link2 className="w-3 h-3 mr-1" />
                          {review.verified ? 'AI-Verified' : 'AI-Sourced'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Verification Note */}
      <Alert>
        <Info className="w-4 h-4" />
        <AlertDescription>
          Reviews are collected from multiple trusted sources including direct family feedback, 
          Google, Yelp, and senior care directories. MySeniorValet verifies reviews to ensure 
          authenticity and help families make informed decisions.
        </AlertDescription>
      </Alert>
    </div>
  );
}