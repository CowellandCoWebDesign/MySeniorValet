import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronLeft, ChevronRight, X, ZoomIn, Share2, AlertTriangle, CheckCircle, RefreshCw, Play, Flag } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FlagListingDialog } from "@/components/flag-listing-dialog";

// Helper functions for video detection and embed URL generation
const isVideoUrl = (url: string): boolean => {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return (
    lowerUrl.includes('youtube.com') ||
    lowerUrl.includes('youtu.be') ||
    lowerUrl.includes('vimeo.com') ||
    lowerUrl.includes('youtube-nocookie.com')
  );
};

const getVideoEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // YouTube handling - comprehensive patterns
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be') || hostname.includes('youtube-nocookie.com')) {
      let videoId: string | null = null;
      
      // youtube.com/watch?v=VIDEO_ID (with optional extra params like &t=)
      if (urlObj.searchParams.has('v')) {
        videoId = urlObj.searchParams.get('v');
      }
      // youtube.com/embed/VIDEO_ID
      else if (urlObj.pathname.startsWith('/embed/')) {
        videoId = urlObj.pathname.split('/embed/')[1]?.split(/[?&/]/)[0];
      }
      // youtube.com/shorts/VIDEO_ID
      else if (urlObj.pathname.startsWith('/shorts/')) {
        videoId = urlObj.pathname.split('/shorts/')[1]?.split(/[?&/]/)[0];
      }
      // youtube.com/live/VIDEO_ID
      else if (urlObj.pathname.startsWith('/live/')) {
        videoId = urlObj.pathname.split('/live/')[1]?.split(/[?&/]/)[0];
      }
      // youtu.be/VIDEO_ID
      else if (hostname === 'youtu.be') {
        videoId = urlObj.pathname.slice(1).split(/[?&/]/)[0];
      }
      // youtube.com/v/VIDEO_ID (legacy)
      else if (urlObj.pathname.startsWith('/v/')) {
        videoId = urlObj.pathname.split('/v/')[1]?.split(/[?&/]/)[0];
      }
      
      // Validate video ID (should be 11 characters, alphanumeric with - and _)
      if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
      }
    }
    
    // Vimeo handling - comprehensive patterns
    if (hostname.includes('vimeo.com') || hostname.includes('player.vimeo.com')) {
      let videoId: string | null = null;
      
      // player.vimeo.com/video/VIDEO_ID
      if (urlObj.pathname.startsWith('/video/')) {
        videoId = urlObj.pathname.split('/video/')[1]?.split(/[?&/]/)[0];
      }
      // vimeo.com/VIDEO_ID or vimeo.com/channels/xxx/VIDEO_ID or vimeo.com/album/xxx/video/VIDEO_ID
      else {
        const pathParts = urlObj.pathname.split('/').filter(p => p);
        // Find the LAST numeric-only segment (this is the video ID, not channel/album ID)
        const numericParts = pathParts.filter(p => /^\d+$/.test(p));
        videoId = numericParts.length > 0 ? numericParts[numericParts.length - 1] : null;
      }
      
      if (videoId && /^\d+$/.test(videoId)) {
        return `https://player.vimeo.com/video/${videoId}`;
      }
    }
  } catch {
    // URL parsing failed, try legacy regex patterns
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (youtubeMatch) {
      return `https://www.youtube-nocookie.com/embed/${youtubeMatch[1]}?rel=0&modestbranding=1`;
    }
    
    const vimeoMatch = url.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
  }
  
  // Return null if no valid embed URL could be derived
  return null;
};

const getVideoPlatform = (url: string): string => {
  if (!url) return 'Video';
  if (url.includes('youtube') || url.includes('youtu.be')) return 'YouTube';
  if (url.includes('vimeo')) return 'Vimeo';
  return 'Video';
};

// Route any absolute external http(s) photo URL through the same-origin image
// proxy so it renders regardless of upstream protocol/host restrictions
// (mixed-content, CSP img-src, hotlink blocking, CORS). Already-proxied URLs,
// local upload paths, and video URLs are returned untouched.
const toProxiedUrl = (url: string): string => {
  if (!url || typeof url !== 'string') return url;
  if (url.startsWith('/api/image-proxy')) return url;
  if (url.startsWith('/')) return url; // local same-origin paths (e.g. /uploads/...)
  if (isVideoUrl(url)) return url; // videos are embedded in an iframe, not proxied
  if (/^https?:\/\//i.test(url)) {
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
};

interface PhotoCarouselProps {
  photos?: any[];
  communityId?: number;
  communityName: string;
  community?: any;
  verificationReport?: any;
  isVerifying?: boolean;
  className?: string;
  showValidation?: boolean;
  showSourceIndicator?: boolean;
  isLoading?: boolean;
  currentPhotoIndex?: number;
  onPhotoIndexChange?: (index: number) => void;
  sources?: string[];
  photoSources?: {
    googleMaps?: string | null;
    yelp?: string | null;
    tripAdvisor?: string | null;
    searchQuery?: string;
  };
  onStartVerification?: () => void;
}

interface PhotoValidationResult {
  url: string;
  isValid: boolean;
  error?: string;
  status?: number;
  fileSize?: number;
  dimensions?: { width: number; height: number };
  lastChecked: Date;
}

export function EnhancedPhotoCarousel({ 
  photos = [], 
  communityId,
  communityName,
  community,
  verificationReport,
  isVerifying = false, 
  className = "", 
  showValidation = false,
  showSourceIndicator = true,
  isLoading = false,
  currentPhotoIndex,
  onPhotoIndexChange,
  sources = [],
  photoSources,
  onStartVerification
}: PhotoCarouselProps) {
  // Use controlled or uncontrolled mode
  const isControlled = currentPhotoIndex !== undefined;
  const [internalIndex, setInternalIndex] = useState(0);
  const currentIndex = isControlled ? currentPhotoIndex : internalIndex;
  
  const setCurrentIndex = (index: number) => {
    if (isControlled && onPhotoIndexChange) {
      onPhotoIndexChange(index);
    } else {
      setInternalIndex(index);
    }
  };
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [photoValidation, setPhotoValidation] = useState<Record<string, PhotoValidationResult>>({});
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [showValidationReport, setShowValidationReport] = useState(false);
  const [photoUpdateKey, setPhotoUpdateKey] = useState(0);
  
  // Progressive loading states
  const [progressivePhotos, setProgressivePhotos] = useState<string[]>([]);
  const [loadingStage, setLoadingStage] = useState<'initial' | 'quick' | 'quality' | 'complete'>('initial');
  const [progressiveLoadAttempted, setProgressiveLoadAttempted] = useState(false);
  
  // Get all photos AND videos from database, web intelligence, and progressive loading  
  const getAllPhotos = () => {
    const allPhotos: { url: string; source: string; isAuthentic?: boolean; isVideo?: boolean }[] = [];
    
    // Add community videos FIRST (highest priority for engagement)
    if (community?.communityVideos && community.communityVideos.length > 0) {
      community.communityVideos.forEach((videoUrl: string) => {
        if (videoUrl && videoUrl.length > 10 && isVideoUrl(videoUrl)) {
          console.log(`🎬 Adding community video: ${videoUrl}`);
          allPhotos.push({ 
            url: videoUrl, 
            source: 'video',
            isAuthentic: true,
            isVideo: true
          });
        }
      });
    }
    
    // Add progressive photos (these are highest priority for photos)
    if (progressivePhotos.length > 0) {
      progressivePhotos.forEach((url: string) => {
        if (url && url.length > 10) {
          // Check if it's a video URL
          const videoFlag = isVideoUrl(url);
          allPhotos.push({ 
            url: toProxiedUrl(url), 
            source: loadingStage === 'complete' ? 'high-quality' : 'quick-load',
            isAuthentic: true,
            isVideo: videoFlag
          });
        }
      });
    }
    
    // Helper function to validate and clean URLs
    const isValidPhotoUrl = (url: string): boolean => {
      if (!url || typeof url !== 'string' || url.length < 10) return false;
      
      // Reject corrupted URLs immediately
      if (url.includes('QwQwQwQw') || 
          url.includes('kQz8kQz8') ||
          url.includes('QwQwQwQwQwQwQwQw') ||
          url.includes('...[TRUNCATED]') ||
          url.length > 1500) {
        console.log(`🚫 Blocking corrupted URL: ${url.substring(0, 100)}...`);
        return false;
      }
      
      try {
        new URL(url.startsWith('/') ? `https://example.com${url}` : url);
        return true;
      } catch {
        return false;
      }
    };
    
    // Add database photos first  
    if (community?.photos && community.photos.length > 0) {
      community.photos.forEach((p: any) => {
        const url = typeof p === 'string' ? p : (p.image_url || p.url || p);
        if (isValidPhotoUrl(url)) {
          allPhotos.push({ url: toProxiedUrl(url), source: 'database' });
        }
      });
    }
    
    // Add passed photos prop
    if (photos && photos.length > 0) {
      photos.forEach((p: any) => {
        let url = typeof p === 'string' ? p : (p.image_url || p.url || p);
        
        if (!isValidPhotoUrl(url)) return;
        
        // Route every external image through the same-origin proxy to bypass
        // mixed-content / CSP / hotlink / CORS restrictions.
        url = toProxiedUrl(url);
        
        allPhotos.push({ url, source: 'prop' });
      });
    }
    
    // Add web intelligence photos
    let webImages = null;
    if (verificationReport?.webIntelligence?.images) {
      webImages = verificationReport.webIntelligence.images;
    } else if (verificationReport?.verificationResults?.webIntelligence?.images) {
      webImages = verificationReport.verificationResults.webIntelligence.images;
    }
    
    if (webImages && webImages.length > 0) {
      webImages.forEach((img: any) => {
        const url = typeof img === 'string' ? img : (img.image_url || img.url || img);
        
        if (!isValidPhotoUrl(url)) return;
        
        // Skip logos and icons
        if (url.includes('logo') || url.includes('icon') || 
            url.includes('placeholder') || url.includes('default')) {
          return;
        }
        
        // Route every external image through the same-origin proxy to bypass
        // mixed-content / CSP / hotlink / CORS restrictions.
        const processedUrl = toProxiedUrl(url);
        
        const photoData = {
          url: processedUrl,
          source: 'web',
          isAuthentic: typeof img === 'string' ? true : (img.isAuthentic !== false)
        };
        
        allPhotos.push(photoData);
      });
    }
    
    // Remove duplicates
    const uniquePhotos = Array.from(new Map(allPhotos.map(p => [p.url, p])).values()) as typeof allPhotos;
    return uniquePhotos;
  };
  
  // Recalculate photos when verificationReport, photoUpdateKey, or progressive photos change
  const processedPhotos = useMemo(() => {
    const photos = getAllPhotos();
    console.log(`📸 Recalculating photos - Found ${photos.length} total photos (stage: ${loadingStage})`);
    return photos;
  }, [photos, community?.photos, verificationReport, photoUpdateKey, progressivePhotos, loadingStage]);

  // Get photo validation report if validation is enabled and community ID is provided
  const { data: validationReport, isLoading: validationLoading } = useQuery<{
    success: boolean;
    report: {
      communityId: number;
      communityName: string;
      totalPhotos: number;
      validPhotos: number;
      invalidPhotos: number;
      issues: string[];
      recommendations: string[];
    };
  }>({
    queryKey: [`/api/communities/${communityId}/photos/validate`],
    enabled: showValidation && !!communityId,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  // Keyboard navigation with smooth transitions
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Allow navigation with arrow keys even when not in fullscreen
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          prevPhoto();
          break;
        case 'ArrowRight':
          event.preventDefault();
          nextPhoto();
          break;
        case 'Escape':
          event.preventDefault();
          if (showFullscreen) {
            setShowFullscreen(false);
          }
          break;
        case 'f':
        case 'F':
          // Press 'f' to toggle fullscreen
          event.preventDefault();
          if (!showFullscreen && safePhotos.length > 0) {
            setShowFullscreen(true);
          } else if (showFullscreen) {
            setShowFullscreen(false);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showFullscreen, processedPhotos.length, currentIndex]);

  // Watch for verification report changes and force re-render
  useEffect(() => {
    const webImages = verificationReport?.webIntelligence?.images || 
                     verificationReport?.verificationResults?.webIntelligence?.images;
    if (webImages && webImages.length > 0) {
      console.log('🎉 Forcing carousel update with new web photos:', webImages.length);
      setPhotoUpdateKey(prev => prev + 1);
    }
  }, [verificationReport]);
  
  // Progressive photo loading - Stage 1: Quick photos, Stage 2: High-quality photos
  useEffect(() => {
    if (!communityName || progressiveLoadAttempted) return;
    
    // Define fetchQualityPhotos first (before fetchQuickPhotos)
    const fetchQualityPhotos = async () => {
      try {
        setLoadingStage('quality');
        console.log('🔍 Loading high-quality photos for:', communityName);
        
        const response = await fetch('/api/web-intelligence/quality-photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            communityName: communityName,
            content: verificationReport?.rawPerplexityContent || '',
            website: community?.website,
            citations: verificationReport?.citations
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.photos && data.photos.length > 0) {
            console.log(`🔍 Loaded ${data.photos.length} high-quality photos`);
            setProgressivePhotos(data.photos);
            setLoadingStage('complete');
          } else {
            setLoadingStage('complete');
          }
        } else {
          setLoadingStage('complete');
        }
      } catch (error) {
        console.error('Error loading quality photos:', error);
        setLoadingStage('complete');
      }
    };
    
    const fetchQuickPhotos = async () => {
      try {
        setLoadingStage('quick');
        console.log('⚡ Loading quick photos for:', communityName);
        
        const response = await fetch('/api/web-intelligence/quick-photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            communityName: communityName,
            content: verificationReport?.rawPerplexityContent || '',
            website: community?.website
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.photos && data.photos.length > 0) {
            console.log(`⚡ Loaded ${data.photos.length} quick photos (cached: ${data.cached})`);
            setProgressivePhotos(data.photos);
            // Continue to quality photos after showing quick photos
            setTimeout(() => fetchQualityPhotos(), 100); // Small delay to show quick photos first
          } else {
            // No quick photos, try quality photos anyway
            fetchQualityPhotos();
          }
        } else {
          fetchQualityPhotos(); // Try quality photos anyway
        }
      } catch (error) {
        console.error('Error loading quick photos:', error);
        fetchQualityPhotos(); // Try quality photos anyway
      }
    };
    
    // Start progressive loading - set the flag FIRST to prevent re-runs
    setProgressiveLoadAttempted(true);
    fetchQuickPhotos();
  }, [communityName]);
  
  // Validate individual photos on load for quality checking
  useEffect(() => {
    if (showValidation && processedPhotos.length > 0) {
      const validatePhotos = async () => {
        for (const photo of processedPhotos.slice(0, 3)) { // Validate first 3 photos for performance
          const photoUrl = photo.url;
          if (!photoValidation[photoUrl]) {
            try {
              const response = await fetch(photoUrl, { method: 'HEAD' });
              setPhotoValidation(prev => ({
                ...prev,
                [photoUrl]: {
                  url: photoUrl,
                  isValid: response.ok,
                  status: response.status,
                  lastChecked: new Date()
                }
              }));
            } catch (error) {
              setPhotoValidation(prev => ({
                ...prev,
                [photoUrl]: {
                  url: photoUrl,
                  isValid: false,
                  error: 'Network error',
                  lastChecked: new Date()
                }
              }));
            }
          }
        }
      };

      validatePhotos();
    }
  }, [processedPhotos, showValidation]);

  // Filter out broken images
  const safePhotos = processedPhotos.filter(photo => !imageErrors.has(photo.url));
  
  // Show loading state with web intelligence check
  const isLoadingWebPhotos = isVerifying || isLoading;
  const hasNoRealPhotos = safePhotos.length === 0;
  
  // Detect if this community likely needs enrichment
  // Only check needsEnrichment if we don't have photos from props
  const needsEnrichment = hasNoRealPhotos && !photos?.length && (
    !community?.enrichment_data || 
    !community?.last_enrichment_date ||
    (community?.enrichment_data && (!community.enrichment_data.photos || community.enrichment_data.photos.length === 0))
  );
  
  // Show loading state when we're verifying and have no photos to display
  // This ensures the loading animation shows when searching for photos
  if (hasNoRealPhotos && isLoadingWebPhotos) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500 p-8">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 dark:border-gray-600 border-t-primary"></div>
          </div>
          <p className="text-sm font-medium">Searching for authentic photos...</p>
          <p className="text-xs text-gray-400 mt-2">
            Checking directory sites and official sources
          </p>
        </div>
      </div>
    );
  }

  // Check if we have any photos to display
  if (!safePhotos || safePhotos.length === 0) {
    // Check if photos were found but filtered out due to loading issues
    const originalPhotoCount = photos?.length || 0;
    const processedPhotoCount = processedPhotos?.length || 0;
    const hadLoadingIssues = processedPhotoCount > 0 && safePhotos.length === 0;
    
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg relative ${className}`}>
        
        <div className="text-center text-gray-500 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <ZoomIn className="w-8 h-8" />
            </div>
            <p className="text-sm font-medium">
              {hadLoadingIssues ? 'Photos temporarily unavailable' : 'No photos available'}
            </p>
            {hadLoadingIssues && (
              <div className="mt-3">
                <p className="text-xs text-gray-400 mt-2 max-w-xs mx-auto">
                  {processedPhotoCount} photo{processedPhotoCount > 1 ? 's were' : ' was'} found but could not be loaded at this time.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Photos will load automatically when available
                </p>
              </div>
            )}
            {originalPhotoCount > 0 && imageErrors.size > 0 && !hadLoadingIssues && (
              <p className="text-xs text-orange-500 mt-2">
                {imageErrors.size} photo{imageErrors.size > 1 ? 's' : ''} could not be loaded
              </p>
            )}
            {showValidation && !hadLoadingIssues && (
              <p className="text-xs text-gray-400 mt-2">
                Consider adding authentic photos from verified sources
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const nextPhoto = () => {
    const newIndex = (currentIndex + 1) % safePhotos.length;
    setCurrentIndex(newIndex);
  };

  const prevPhoto = () => {
    const newIndex = (currentIndex - 1 + safePhotos.length) % safePhotos.length;
    setCurrentIndex(newIndex);
  };

  const goToPhoto = (index: number) => {
    setCurrentIndex(index);
  };

  const currentPhoto = safePhotos[Math.min(currentIndex, safePhotos.length - 1)];
  const currentPhotoValidation = photoValidation[currentPhoto?.url];

  // Check if current photo has validation issues
  const hasValidationIssue = showValidation && currentPhotoValidation && !currentPhotoValidation.isValid;

  // Get validation summary
  const validationSummary = validationReport?.report ? {
    totalPhotos: validationReport.report.totalPhotos,
    validPhotos: validationReport.report.validPhotos,
    invalidPhotos: validationReport.report.invalidPhotos,
    healthPercentage: Math.round((validationReport.report.validPhotos / validationReport.report.totalPhotos) * 100)
  } : null;

  return (
    <>
      <div className={`relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 ${className}`}>
        {/* Validation Alert */}
        {showValidation && validationSummary && validationSummary.invalidPhotos > 0 && (
          <Alert className="mb-4 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800 dark:text-orange-200">
              Photo Quality Issue: {validationSummary.invalidPhotos} of {validationSummary.totalPhotos} photos may have issues.
              <Button 
                variant="link" 
                size="sm" 
                className="p-0 h-auto text-orange-600 underline ml-2"
                onClick={() => setShowValidationReport(true)}
              >
                View Details
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Photo or Video */}
        <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
          {/* Loading indicator for individual image (not shown for videos) */}
          {currentPhoto && !currentPhoto.isVideo && !loadedImages.has(currentPhoto.url) && !imageErrors.has(currentPhoto.url) && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 dark:border-gray-600 border-t-primary mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading photo...</p>
              </div>
            </div>
          )}
          
          {/* Error state for broken image */}
          {currentPhoto && !currentPhoto.isVideo && imageErrors.has(currentPhoto.url) && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <div className="text-center text-gray-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-orange-500" />
                <p className="text-sm">Photo unavailable</p>
                <p className="text-xs text-gray-400 mt-1">The image could not be loaded</p>
              </div>
            </div>
          )}
          
          {/* VIDEO RENDERING - Embedded player for YouTube/Vimeo */}
          {currentPhoto && currentPhoto.isVideo && (
            <div className="w-full h-full relative">
              {(() => {
                const embedUrl = getVideoEmbedUrl(currentPhoto.url);
                const platform = getVideoPlatform(currentPhoto.url);
                
                if (embedUrl) {
                  return (
                    <iframe
                      src={embedUrl}
                      title={`${communityName} - ${platform} Video`}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  );
                } else {
                  return (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                      <a 
                        href={currentPhoto.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex flex-col items-center text-white hover:text-primary transition-colors"
                      >
                        <Play className="w-16 h-16 mb-2" />
                        <span className="text-sm">Watch on {platform}</span>
                      </a>
                    </div>
                  );
                }
              })()}
              
              {/* Video Platform Badge */}
              <div className="absolute bottom-4 left-4 bg-red-600/90 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm flex items-center gap-1 z-20">
                <Play className="w-3 h-3" />
                {getVideoPlatform(currentPhoto.url)} Video
              </div>
            </div>
          )}
          
          {/* IMAGE RENDERING - Standard photo display */}
          {currentPhoto && !currentPhoto.isVideo && (
            <img
              src={currentPhoto.url}
              alt={`${communityName} - Photo ${currentIndex + 1}`}
              className={`w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity ${
                loadedImages.has(currentPhoto.url) ? 'opacity-100' : 'opacity-0'
              }`}
              onClick={() => setShowFullscreen(true)}
              onLoad={(e) => {
                setLoadedImages(prev => new Set([...prev, currentPhoto.url]));
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const originalSrc = target.src;
                
                const isCorrupted = originalSrc.includes('QwQwQwQw') || 
                                   originalSrc.includes('kQz8kQz8') ||
                                   originalSrc.includes('QwQwQwQwQwQwQwQw') ||
                                   originalSrc.includes('...[TRUNCATED]') ||
                                   originalSrc.length > 1500;
                
                if (isCorrupted) {
                  console.log(`🚫 Corrupted URL detected and blocked: ${originalSrc.substring(0, 100)}...`);
                  setImageErrors(prev => new Set([...prev, currentPhoto.url]));
                  if (safePhotos.length > 1) {
                    setTimeout(nextPhoto, 100);
                  }
                  return;
                }
                
                if (!target.dataset.retried && !originalSrc.includes('/api/image-proxy')) {
                  target.dataset.retried = "true";
                  console.log(`🔄 Retrying failed image: ${originalSrc.substring(0, 100)}...`);
                  setTimeout(() => {
                    target.src = originalSrc + (originalSrc.includes('?') ? '&' : '?') + 'retry=' + Date.now();
                  }, 1000);
                  return;
                }
                
                setImageErrors(prev => new Set([...prev, currentPhoto.url]));
                console.log(`❌ Failed to load image: ${originalSrc.substring(0, 100)}...`);
                
                if (showValidation) {
                  setPhotoValidation(prev => ({
                    ...prev,
                    [currentPhoto.url]: {
                      url: currentPhoto.url,
                      isValid: false,
                      error: 'Failed to load image',
                      lastChecked: new Date()
                    }
                  }));
                }
                
                if (safePhotos.length > 1) {
                  setTimeout(nextPhoto, 500);
                }
              }}
            />
          )}

          {/* Photo Count Badge */}
          <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm z-20">
            {Math.min(currentIndex + 1, safePhotos.length)} of {safePhotos.length}
            {imageErrors.size > 0 && (
              <span className="text-xs text-orange-300 ml-1">
                ({imageErrors.size} failed)
              </span>
            )}
          </div>

          {/* Photo Quality Badge */}
          {showValidation && currentPhotoValidation && (
            <div className={`absolute top-4 left-4 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
              currentPhotoValidation.isValid 
                ? 'bg-green-600/80 text-white'
                : 'bg-red-600/80 text-white'
            }`}>
              {currentPhotoValidation.isValid ? (
                <CheckCircle className="w-3 h-3 inline mr-1" />
              ) : (
                <AlertTriangle className="w-3 h-3 inline mr-1" />
              )}
              {currentPhotoValidation.isValid ? 'Verified' : 'Issue'}
            </div>
          )}

          {/* Enhanced Navigation Arrows with smooth transitions */}
          {photos.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white border-0 w-12 h-12 shadow-xl z-20 transition-all duration-200 hover:scale-110"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  prevPhoto();
                }}
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-7 h-7" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white border-0 w-12 h-12 shadow-xl z-20 transition-all duration-200 hover:scale-110"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  nextPhoto();
                }}
                aria-label="Next photo"
              >
                <ChevronRight className="w-7 h-7" />
              </Button>
            </>
          )}
          

          {/* Fullscreen Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 bg-black/50 hover:bg-black/70 text-white border-0 transition-all duration-200 hover:scale-110"
            onClick={() => setShowFullscreen(true)}
            aria-label="View fullscreen"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          {/* Report photo affordance — flag a wrong/inappropriate image */}
          {communityId && (
            <div className="absolute top-16 left-4 z-20">
              <FlagListingDialog
                communityId={Number(communityId)}
                communityName={communityName || "this community"}
                defaultFlagType="Inappropriate Content"
                trigger={
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); }}
                    title="Report a wrong or inappropriate photo"
                    aria-label="Report a problem with this photo"
                    className="h-9 w-9 flex items-center justify-center rounded-md bg-black/50 hover:bg-red-600/80 text-white transition-all duration-200 hover:scale-110"
                    data-testid="button-flag-photo"
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                }
              />
            </div>
          )}

          {/* Photo Issue Indicator */}
          {hasValidationIssue && (
            <div className="absolute bottom-4 left-4 bg-red-600/90 text-white px-3 py-1 rounded-full text-xs">
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              Photo may be unavailable
            </div>
          )}
        </div>

        {/* Enhanced Thumbnail Navigation Strip */}
        {safePhotos.length > 1 && (
          <div className="mt-4 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              {/* Left scroll button */}
              {safePhotos.length > 8 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 w-8 h-8 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    const thumbnailContainer = document.getElementById('thumbnail-container');
                    if (thumbnailContainer) {
                      thumbnailContainer.scrollBy({ left: -200, behavior: 'smooth' });
                    }
                  }}
                  aria-label="Scroll thumbnails left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              )}
              
              {/* Thumbnail container with horizontal scroll */}
              <div 
                id="thumbnail-container"
                className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                } as React.CSSProperties}
              >
                {safePhotos.map((photo, idx) => (
                  <button
                    key={idx}
                    className={`relative flex-shrink-0 w-20 h-16 rounded-md overflow-hidden transition-all duration-200 ${
                      idx === currentIndex 
                        ? 'ring-2 ring-purple-500 scale-105 shadow-lg' 
                        : 'hover:opacity-80 hover:scale-105'
                    }`}
                    onClick={() => goToPhoto(idx)}
                    aria-label={photo.isVideo ? `View video ${idx + 1}` : `View photo ${idx + 1}`}
                  >
                    {photo.isVideo ? (
                      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                    ) : (
                      <img
                        src={photo.url}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const placeholder = document.createElement('div');
                            placeholder.className = 'w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center';
                            placeholder.innerHTML = '<svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
                            parent.appendChild(placeholder);
                          }
                        }}
                      />
                    )}
                    {/* Item number/type badge */}
                    <div className={`absolute bottom-1 right-1 text-white text-xs px-1 rounded ${photo.isVideo ? 'bg-red-600/80' : 'bg-black/60'}`}>
                      {photo.isVideo ? <Play className="w-3 h-3 inline" /> : idx + 1}
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Right scroll button */}
              {safePhotos.length > 8 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 w-8 h-8 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    const thumbnailContainer = document.getElementById('thumbnail-container');
                    if (thumbnailContainer) {
                      thumbnailContainer.scrollBy({ left: 200, behavior: 'smooth' });
                    }
                  }}
                  aria-label="Scroll thumbnails right"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            {/* Photo/video count and navigation hints */}
            <div className="mt-2 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <span className="font-medium">
                Viewing {currentIndex + 1} of {safePhotos.length} {safePhotos.some(p => p.isVideo) ? 'items' : 'photos'}
                {safePhotos.filter(p => p.isVideo).length > 0 && (
                  <span className="ml-1 text-red-500">
                    ({safePhotos.filter(p => p.isVideo).length} video{safePhotos.filter(p => p.isVideo).length > 1 ? 's' : ''})
                  </span>
                )}
              </span>
              <span className="text-gray-500">
                Use arrows or click thumbnails to navigate
              </span>
            </div>
          </div>
        )}

        {/* Overall Photo Health Indicator */}
        {showValidation && validationSummary && (
          <div className="absolute top-14 right-4">
            <Badge 
              variant={validationSummary.healthPercentage >= 80 ? "default" : 
                      validationSummary.healthPercentage >= 60 ? "secondary" : "destructive"}
              className="text-xs"
            >
              {validationSummary.healthPercentage}% Healthy
            </Badge>
          </div>
        )}
      </div>

      {/* Citations and Sources Section */}
      {(sources.length > 0 || photoSources) && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Photo Sources & Citations
            </h4>
            
            {/* Photo source platforms */}
            {photoSources && (
              <div className="flex flex-wrap gap-2 mb-2">
                {photoSources.googleMaps && (
                  <a 
                    href={photoSources.googleMaps} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                    </svg>
                    Google Maps
                  </a>
                )}
                {photoSources.yelp && (
                  <a 
                    href={photoSources.yelp} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  >
                    Yelp
                  </a>
                )}
                {photoSources.tripAdvisor && (
                  <a 
                    href={photoSources.tripAdvisor} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                  >
                    TripAdvisor
                  </a>
                )}
              </div>
            )}
            
            {/* Citation sources */}
            {sources.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-gray-600 dark:text-gray-400">Information sources:</p>
                <div className="flex flex-wrap gap-1">
                  {sources.slice(0, 5).map((source, idx) => {
                    // Extract domain name from URL
                    let displayName = source;
                    try {
                      const url = new URL(source);
                      displayName = url.hostname.replace('www.', '');
                    } catch {
                      // If not a valid URL, use as is
                    }
                    
                    return (
                      <a
                        key={idx}
                        href={source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                        title={source}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        {displayName}
                      </a>
                    );
                  })}
                  {sources.length > 5 && (
                    <span className="inline-flex items-center px-2 py-1 text-gray-500 dark:text-gray-400 text-xs">
                      +{sources.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fullscreen Modal */}
      <Dialog open={showFullscreen} onOpenChange={setShowFullscreen}>
        <DialogContent className="max-w-full max-h-full p-0 bg-black/95">
          <div className="relative w-full h-[90vh] flex items-center justify-center">
            {currentPhoto && (
              <img
                src={currentPhoto.url}
                alt={`${communityName} - Photo ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            )}

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={() => setShowFullscreen(false)}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Photo Info */}
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-lg font-medium">{communityName}</h3>
              <p className="text-sm text-gray-300">Photo {currentIndex + 1} of {photos.length}</p>
              {showValidation && currentPhotoValidation && (
                <p className={`text-xs mt-1 ${currentPhotoValidation.isValid ? 'text-green-300' : 'text-red-300'}`}>
                  {currentPhotoValidation.isValid ? 'Photo verified' : `Issue: ${currentPhotoValidation.error}`}
                </p>
              )}
            </div>

            {/* Navigation in Fullscreen */}
            {photos.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={prevPhoto}
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={nextPhoto}
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </>
            )}

            {/* Action Buttons */}
            <div className="absolute bottom-4 right-4 flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => navigator.share?.({ 
                  title: `${communityName} Photos`,
                  url: window.location.href 
                })}
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Validation Report Modal */}
      {showValidation && (
        <Dialog open={showValidationReport} onOpenChange={setShowValidationReport}>
          <DialogContent className="max-w-md">
            <div className="p-4">
              <h3 className="text-lg font-medium mb-4">Photo Quality Report</h3>
              
              {validationLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                  <span>Analyzing photos...</span>
                </div>
              ) : validationSummary ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">{validationSummary.totalPhotos}</p>
                      <p className="text-xs text-gray-600">Total</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{validationSummary.validPhotos}</p>
                      <p className="text-xs text-gray-600">Valid</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">{validationSummary.invalidPhotos}</p>
                      <p className="text-xs text-gray-600">Issues</p>
                    </div>
                  </div>

                  {validationReport?.report.issues && validationReport.report.issues.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Issues Found:</h4>
                      <ul className="space-y-1 max-h-32 overflow-y-auto">
                        {validationReport.report.issues.slice(0, 5).map((issue, index) => (
                          <li key={index} className="text-xs text-red-600 flex items-start gap-1">
                            <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            {issue}
                          </li>
                        ))}
                        {validationReport.report.issues.length > 5 && (
                          <li className="text-xs text-gray-500">
                            ... and {validationReport.report.issues.length - 5} more issues
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button size="sm" onClick={() => setShowValidationReport(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-center py-8 text-gray-500">
                  No validation data available
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}